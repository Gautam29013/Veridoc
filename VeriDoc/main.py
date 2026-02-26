from langchain_community.document_loaders import PyPDFDirectoryLoader
import boto3
import json
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.embeddings.base import Embeddings
import tiktoken
from langchain_chroma import Chroma
from uuid import uuid4

# Uncomment for first time to load the documents and create a vector store
# loader = PyPDFDirectoryLoader("AirIndia", glob="**/*.pdf",)
# documents = loader.load()
# print(len(documents))

# text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
# texts = text_splitter.split_documents(documents)
# print(len(texts))


class AmazonTitanEmbedding(Embeddings):
    def __init__(self, region_name="eu-west-3", model_id="amazon.titan-embed-text-v2:0"):
        self.client = boto3.client("bedrock-runtime", region_name=region_name)
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
        embeddings = []
        for i, text in enumerate(texts):
            try:
                safe_text = self._safe_truncate(text)
                embedding = self.embed_query(safe_text)
                embeddings.append(embedding)
            except Exception as e:
                print(f"[Warning] Skipping text #{i} due to error: {e}")
        return embeddings
    
    
embeddings = AmazonTitanEmbedding()


vector_store = Chroma(
    collection_name="example_collection",
    embedding_function=embeddings,
    persist_directory="./chroma_vectorestore",
)

# Uncomment for first time to load the documents and create a vector store
# uuids = [str(uuid4()) for _ in range(len(texts))]
# vector_store.add_documents(documents=texts, ids=uuids)



client = boto3.client("bedrock-runtime", region_name="eu-west-3")
MODEL_ID = "eu.amazon.nova-pro-v1:0"


prompt= """
You are a helpful assistant. Use the following context to answer the user's question.
The context is a collection of documents that may contain relevant information about Air India, its operations, policies, and other related topics.
Context:
{context}

User's Question:
{question}
"""

def get_response(question):
    
    docs_from_vector_store = vector_store.similarity_search(question,k=3)
    
    prompt= f"""
    You are a helpful assistant. Use the following context to answer the user's question.
    The context is a collection of documents that may contain relevant information about Air India, its operations, policies, and other related topics.
    Context:
    {docs_from_vector_store}

    User's Question:
    {question}
    """
    ige_message_list = [
                {
                    "role": "user",
                    "content": [
                        {"text":prompt}
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

            # Call the model
    response = client.invoke_model(modelId=MODEL_ID, body=json.dumps(ige_native_request))
    result = json.loads(response["body"].read())
    # print(result)
    return result
    
ans = get_response("What is the current status of Air India?")
print(ans['output']['message']['content'][0]['text'])