import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Embeddings Configuration
EMBEDDINGS_MODEL = os.getenv("EMBEDDINGS_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
EMBEDDINGS_DIMENSION = int(os.getenv("EMBEDDINGS_DIMENSION", "384"))

# Vector Database Configuration
VECTOR_DB = os.getenv("VECTOR_DB", "chromadb")
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", os.path.join(_BASE_DIR, "chroma_vectorestore"))
FAISS_INDEX_DIR = os.getenv("FAISS_INDEX_DIR", "./vector_db/faiss_indices")

# Chunking Configuration
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))
TOP_K = int(os.getenv("TOP_K", "4"))

# RAG Retrieval Configuration
RELEVANCE_THRESHOLD = float(os.getenv("RELEVANCE_THRESHOLD", "0.55"))
RAG_TOP_K = int(os.getenv("RAG_TOP_K", "10"))

if not 0.0 <= RELEVANCE_THRESHOLD <= 1.0:
    raise ValueError(f"RELEVANCE_THRESHOLD must be in [0, 1], got {RELEVANCE_THRESHOLD}")
if RAG_TOP_K < 1:
    raise ValueError(f"RAG_TOP_K must be >= 1, got {RAG_TOP_K}")

# API Configuration
API_PORT = int(os.getenv("API_PORT", "8000"))
API_HOST = os.getenv("API_HOST", "0.0.0.0")
CORS_ALLOW_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOW_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4000,http://127.0.0.1:4000",
    ).split(",")
    if origin.strip()
]

# Database Configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "veridoc")

# Authentication Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-here-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "1440")) # 24 hours
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
