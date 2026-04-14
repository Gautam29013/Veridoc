import boto3
import json
import tiktoken
import time
from botocore.config import Config
from langchain.embeddings.base import Embeddings
from langchain_chroma import Chroma
import os

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
                    print(f"[Error] Failed to embed chunk: {e}")
                    raise
                    
        return embeddings

embeddings = AmazonTitanEmbedding()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

vector_store = Chroma(
    collection_name="example_collection",
    embedding_function=embeddings,
    persist_directory=os.path.join(BASE_DIR, "chroma_vectorestore"),
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
    docs_from_vector_store = vector_store.similarity_search(question, k=3)
    conversation_history = _format_chat_history(chat_history)

    prompt = f"""
    You are a helpful assistant for Veridoc document questions.
    Answer only from the retrieved context and the ongoing conversation.
    If the user asks a follow-up question, use the chat history to resolve references like "it", "that", "this flight", or "tell me more".
    If the answer is not supported by the context, say that clearly.

    Chat History:
    {conversation_history}

    Context:
    {docs_from_vector_store}

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
