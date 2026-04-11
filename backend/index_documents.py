import os
import uuid
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from services.bedrock_service import vector_store

def index_pdfs_to_chroma(directory_path: str):
    """
    Loads all PDFs from the specified directory, splits them into chunks,
    and adds them to the Chroma vector store initialized in bedrock_service.
    """
    if not os.path.exists(directory_path):
        print(f"Directory {directory_path} not found.")
        return

    print(f"Loading PDFs from {directory_path}...")
    loader = PyPDFDirectoryLoader(directory_path, glob="**/*.pdf")
    documents = loader.load()
    print(f"Loaded {len(documents)} document pages.")

    print("Splitting texts...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    texts = text_splitter.split_documents(documents)
    print(f"Split into {len(texts)} chunks.")

    print("Adding chunks to Vector Store. This may take a while depending on the Bedrock Embedding response...")
    uuids = [str(uuid.uuid4()) for _ in range(len(texts))]
    try:
        vector_store.add_documents(documents=texts, ids=uuids)
        print("Successfully embedded and added to Chroma DB.")
    except Exception as e:
        print(f"Error while indexing: {e}")

if __name__ == "__main__":
    # Example usage: Put PDFs in backend/data/AirIndia and run this script
    base_dir = os.path.dirname(os.path.abspath(__file__))
    target_dir = os.path.join(base_dir, "data", "AirIndia")
    index_pdfs_to_chroma(target_dir)
