import boto3
import json
import logging
import tiktoken
import time
from botocore.config import Config
from langchain.embeddings.base import Embeddings
from langchain_chroma import Chroma
import os
from config import CHROMA_PERSIST_DIR

logger = logging.getLogger(__name__)

class AmazonTitanEmbedding(Embeddings):
    def __init__(self, region_name="eu-west-3", model_id="amazon.titan-embed-text-v2:0"):
        # Setup advanced AWS retries and rate limit handling (adaptive mode)
        retry_config = Config(
            retries={
                "max_attempts": 10,
                "mode": "adaptive"
            }
        )
        self.client = boto3.client("bedrock-runtime", region_name=region_name, config=retry_config)
        self.model_id = model_id
        self.max_tokens = 8000
        self.tokenizer = tiktoken.get_encoding("cl100k_base")

    def _safe_truncate(self, text: str) -> str:
        tokens = self.tokenizer.encode(text)
        if len(tokens) > self.max_tokens:
            tokens = tokens[:self.max_tokens]
        return self.tokenizer.decode(tokens)

    def embed_query(self, text: str) -> list:
        safe_text = self._safe_truncate(text)
        request = json.dumps({"inputText": safe_text})
        response = self.client.invoke_model(modelId=self.model_id, body=request)
        return json.loads(response["body"].read())["embedding"]

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        import concurrent.futures
        
        embeddings = [None] * len(texts)
        
        def _process_item(index, text):
            return index, self.embed_query(text)
                
        # Boto3 client's adaptive retry handles HTTP 429 backoff gracefully
        # Using a ThreadPoolExecutor dramatically reduces the per-chunk overhead
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            future_to_index = {executor.submit(_process_item, i, text): i for i, text in enumerate(texts)}
            for future in concurrent.futures.as_completed(future_to_index):
                try:
                    index, embedding_result = future.result()
                    embeddings[index] = embedding_result
                except Exception as e:
                    logger.exception("Failed to embed chunk: %s", e)
                    raise
                    
        return embeddings

embeddings = AmazonTitanEmbedding()

vector_store = Chroma(
    collection_name="veridoc_cosine",
    embedding_function=embeddings,
    persist_directory=CHROMA_PERSIST_DIR,
    collection_metadata={"hnsw:space": "cosine"},
)

client = boto3.client("bedrock-runtime", region_name="eu-west-3")
MODEL_ID = "eu.amazon.nova-pro-v1:0"

def _format_chat_history(chat_history):
    if not chat_history:
        return "No prior conversation."

    formatted_messages = []
    for message in chat_history[-6:]:
        role = message.get("role", "user").capitalize()
        content = message.get("content", "")
        formatted_messages.append(f"{role}: {content}")

    return "\n".join(formatted_messages)

def get_bedrock_response(question, chat_history=None):
    from config import RELEVANCE_THRESHOLD, RAG_TOP_K

    # Use similarity_search_with_score which returns raw distances
    # The existing collection uses L2 distance where values can exceed 1.0
    # Lower distance = more similar (0 = identical)
    docs_with_distances = vector_store.similarity_search_with_score(question, k=RAG_TOP_K)

    # Convert cosine distance to similarity: cosine distance is in [0, 2]
    # similarity = 1 - (distance / 2) maps to [0, 1] where 1 = identical
    docs_with_scores = [(doc, 1.0 - dist / 2.0) for doc, dist in docs_with_distances]

    # Debug logging for retrieval diagnostics (gated behind DEBUG level for privacy)
    logger.debug("RAG query: '%s' -> %d results", question[:60], len(docs_with_scores))
    for doc, score in docs_with_scores:
        source = doc.metadata.get('source_filename', 'N/A')
        logger.debug("  Similarity=%.4f | Source=%s", score, source)

    # Filter out low-relevance results and deduplicate by content
    seen_content = set()
    relevant_docs = []
    for doc, score in docs_with_scores:
        content_key = doc.page_content[:200]
        if score >= RELEVANCE_THRESHOLD and content_key not in seen_content:
            relevant_docs.append((doc, score))
            seen_content.add(content_key)
    docs_from_vector_store = [doc for doc, _ in relevant_docs]

    logger.info("RAG retrieval: %d unique docs above threshold (%.2f)", len(relevant_docs), RELEVANCE_THRESHOLD)

    # Early return if no relevant context — saves an LLM call
    if not docs_from_vector_store:
        return (
            "I couldn't find any relevant information in the uploaded documents for your question. "
            "Please make sure the relevant documents have been uploaded and fully processed."
        )

    # Format context as clean text instead of raw Document __repr__
    context_text = "\n\n---\n\n".join(
        f"[Source: {doc.metadata.get('source_filename', 'Unknown')}]\n{doc.page_content}"
        for doc in docs_from_vector_store
    )

    conversation_history = _format_chat_history(chat_history)

    prompt = f"""
    You are a helpful assistant for Veridoc document questions.
    Answer only from the retrieved context and the ongoing conversation.
    If the user asks a follow-up question, use the chat history to resolve references like "it", "that", "this flight", or "tell me more".
    If the answer is not supported by the context, say that clearly.

    Chat History:
    {conversation_history}

    Context:
    {context_text}

    User's Question:
    {question}
    """
    ige_message_list = [
        {
            "role": "user",
            "content": [
                {"text": prompt}
            ],
        }
    ]

    ige_inf_params = {"maxTokens": 300, "topP": 0.1, "topK": 20, "temperature": 0}
    ige_native_request = {
        "schemaVersion": "messages-v1",
        "messages": ige_message_list,
        "system": [{
            "text": "You are a helpful assistant"
        }],
        "inferenceConfig": ige_inf_params,
    }

    response = client.invoke_model(modelId=MODEL_ID, body=json.dumps(ige_native_request))
    result = json.loads(response["body"].read())
    return result["output"]["message"]["content"][0]["text"]

