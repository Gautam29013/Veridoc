# VeriDoc: Complete Development Roadmap
## Verified Enterprise Retrieval Intelligence for Document-based QA

**Last Updated:** January 2026  
**Target Architecture:** Production-Grade LLM-based RAG System  
**Timeline:** 16-20 weeks | 4-5 sprints

---

## Executive Summary

VeriDoc is an enterprise-grade Retrieval-Augmented Generation (RAG) system that retrieves answers from authorized internal documents while minimizing hallucination and security risks. This roadmap guides you from foundational setup through production deployment.

**Key Project Goals:**
- ✅ Build functional LLM-based Q&A system for enterprise documents
- ✅ Implement hybrid retrieval (semantic + keyword search)
- ✅ Evaluate system accuracy with RAGAS metrics
- ✅ Compare performance against traditional keyword search
- ✅ Secure multi-tenant architecture with JWT authentication
- ✅ Deploy containerized production system

---

## Phase 1: Foundation & Environment Setup (Weeks 1-2)

### 1.1 Project Structure Setup

```
veridoc/
├── backend/
│   ├── app.py                 # FastAPI main app
│   ├── config.py              # Configuration management
│   ├── requirements.txt
│   ├── models/
│   │   ├── schemas.py         # Pydantic schemas
│   │   └── database.py        # SQLAlchemy models
│   ├── services/
│   │   ├── document_service.py
│   │   ├── retrieval_service.py
│   │   ├── llm_service.py
│   │   └── auth_service.py
│   ├── api/
│   │   ├── auth_routes.py
│   │   ├── document_routes.py
│   │   ├── query_routes.py
│   │   └── evaluation_routes.py
│   ├── utils/
│   │   ├── embeddings.py
│   │   ├── chunking.py
│   │   ├── evaluation.py
│   │   └── security.py
│   └── tests/
│       ├── test_retrieval.py
│       ├── test_llm.py
│       └── test_api.py
│
├── frontend/
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QueryInterface.jsx
│   │   │   ├── DocumentUpload.jsx
│   │   │   ├── ResultDisplay.jsx
│   │   │   └── AuthForm.jsx
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.jsx
│   └── .env.example
│
├── vector_db/
│   ├── chromadb/              # ChromaDB storage
│   ├── faiss_indices/         # FAISS indices
│   └── metadata.json
│
├── data/
│   ├── sample_documents/      # Test documents
│   ├── evaluation_datasets/   # RAGAS evaluation data
│   └── ground_truth.json
│
├── notebooks/
│   ├── 01_embeddings_analysis.ipynb
│   ├── 02_retrieval_testing.ipynb
│   ├── 03_evaluation_metrics.ipynb
│   └── 04_comparative_analysis.ipynb
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_SPEC.md
│   ├── DEPLOYMENT.md
│   └── SECURITY.md
│
├── .env.example
├── .gitignore
└── README.md
```

### 1.2 Environment Configuration

**Create `.env` file:**
```env
# LLM Configuration
LLM_PROVIDER=ollama              # Options: openai, ollama, huggingface
LLM_MODEL=mistral               # mistral, llama2, gpt-3.5-turbo
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=512

# Embeddings
EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDINGS_DIMENSION=384

# Vector Database
VECTOR_DB=chromadb              # Options: chromadb, faiss
CHROMA_PERSIST_DIR=./vector_db/chromadb
FAISS_INDEX_DIR=./vector_db/faiss_indices

# Retrieval Settings
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K=4
HYBRID_SEARCH_ENABLED=true
BM25_WEIGHT=0.3                 # 30% keyword, 70% semantic

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true

# Authentication
JWT_SECRET=your-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Database
DATABASE_URL=sqlite:///veridoc.db
DATABASE_ECHO=false

# Evaluation
RAGAS_BATCH_SIZE=10
EVALUATION_SAMPLE_SIZE=100

# Logging
LOG_LEVEL=INFO
```

### 1.3 Python Dependencies

**`requirements.txt`:**
```txt
# Core Framework
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
python-dotenv==1.0.0

# Database & Storage
sqlalchemy==2.0.23
sqlite3-python==1.0
chromadb==0.4.21
faiss-cpu==1.7.4

# LLM & Embeddings
langchain==0.1.7
langchain-community==0.0.13
ollama==0.1.0
openai==1.3.7
sentence-transformers==2.2.2
huggingface-hub==0.19.4

# Text Processing
PyPDF2==3.0.1
python-docx==0.8.11
markdown==3.5.1
unidecode==1.3.0

# Retrieval & Search
rank-bm25==0.2.2
numpy==1.24.3
scipy==1.11.4

# Evaluation
ragas==0.1.6
rouge-score==0.1.2
nltk==3.8.1

# Authentication & Security
pyjwt==2.8.1
passlib==1.7.4
python-multipart==0.0.6
bcrypt==4.1.1

# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
httpx==0.25.2

# Utilities
pandas==2.1.3
requests==2.31.0
aiofiles==23.2.1
python-multipart==0.0.6
```

### 1.4 Initialize Git Repository

```bash
# Initialize repository
git init
git add .
git commit -m "Initial project structure"

# Create feature branches
git branch feature/phase1-setup
git branch feature/phase2-embeddings
git branch feature/phase3-rag-pipeline
git branch feature/phase4-evaluation
git branch feature/phase5-deployment
```

### 1.5 Development Environment Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download required models (optional, ~500MB-2GB)
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Setup git hooks for pre-commit checks
pip install pre-commit
pre-commit install
```

**Deliverables:**
- ✅ Project structure fully organized
- ✅ Environment variables configured
- ✅ Dependencies installed
- ✅ Git repository initialized
- ✅ Development environment ready

---

## Phase 2: Embeddings & Vector Database (Weeks 3-4)

### 2.1 Embeddings Implementation

**`backend/utils/embeddings.py`:**
```python
from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np
from config import EMBEDDINGS_MODEL, EMBEDDINGS_DIMENSION
import logging

logger = logging.getLogger(__name__)

class EmbeddingsManager:
    def __init__(self):
        self.model = SentenceTransformer(EMBEDDINGS_MODEL)
        self.dimension = EMBEDDINGS_DIMENSION
        logger.info(f"Loaded embeddings model: {EMBEDDINGS_MODEL}")
    
    def embed_texts(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for list of texts.
        Handles batch processing for efficiency.
        """
        try:
            embeddings = self.model.encode(
                texts,
                convert_to_numpy=True,
                show_progress_bar=False,
                batch_size=32
            )
            logger.info(f"Generated embeddings for {len(texts)} texts")
            return embeddings
        except Exception as e:
            logger.error(f"Embedding generation failed: {str(e)}")
            raise
    
    def embed_query(self, query: str) -> np.ndarray:
        """Generate embedding for single query."""
        return self.model.encode(query, convert_to_numpy=True)
    
    def similarity_search(self, query_embedding: np.ndarray, 
                         doc_embeddings: np.ndarray, 
                         top_k: int = 5) -> List[int]:
        """
        Compute cosine similarity between query and documents.
        Returns indices of top_k most similar documents.
        """
        from scipy.spatial.distance import cosine
        
        similarities = []
        for idx, doc_embedding in enumerate(doc_embeddings):
            sim = 1 - cosine(query_embedding, doc_embedding)
            similarities.append((idx, sim))
        
        # Sort by similarity (descending) and return top_k indices
        similarities.sort(key=lambda x: x[1], reverse=True)
        return [idx for idx, _ in similarities[:top_k]]

# Initialize embeddings manager
embeddings_manager = EmbeddingsManager()
```

### 2.2 Document Chunking Strategy

**`backend/utils/chunking.py`:**
```python
from typing import List, Tuple
from langchain.text_splitter import RecursiveCharacterTextSplitter
import logging

logger = logging.getLogger(__name__)

class DocumentChunker:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
        # Recursive splitter respects document structure
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", " ", ""]  # Semantic boundaries
        )
    
    def chunk_document(self, text: str, doc_id: str) -> List[Tuple[str, dict]]:
        """
        Split document into chunks while preserving metadata.
        Returns: List of (chunk_text, metadata) tuples
        """
        try:
            chunks = self.splitter.split_text(text)
            
            chunked_data = [
                (chunk, {
                    "doc_id": doc_id,
                    "chunk_index": idx,
                    "total_chunks": len(chunks)
                })
                for idx, chunk in enumerate(chunks)
            ]
            
            logger.info(f"Document {doc_id} split into {len(chunks)} chunks")
            return chunked_data
            
        except Exception as e:
            logger.error(f"Chunking failed for {doc_id}: {str(e)}")
            raise
    
    def chunk_multiple(self, documents: List[Tuple[str, str]]) -> List[Tuple[str, dict]]:
        """
        Chunk multiple documents.
        Input: List of (document_text, document_id) tuples
        """
        all_chunks = []
        for text, doc_id in documents:
            chunks = self.chunk_document(text, doc_id)
            all_chunks.extend(chunks)
        return all_chunks

# Chunking strategies comparison
class ChunkingStrategies:
    """Different chunking approaches for specific use cases"""
    
    @staticmethod
    def fixed_size_overlap(text: str, chunk_size: int, overlap: int) -> List[str]:
        """Simple fixed-size chunks with overlap"""
        chunks = []
        for i in range(0, len(text), chunk_size - overlap):
            chunks.append(text[i:i + chunk_size])
        return chunks
    
    @staticmethod
    def semantic_chunking(text: str, sentences_per_chunk: int = 5) -> List[str]:
        """Chunk based on sentence boundaries"""
        import re
        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        for i in range(0, len(sentences), sentences_per_chunk):
            chunk = ' '.join(sentences[i:i+sentences_per_chunk])
            chunks.append(chunk)
        return chunks

chunker = DocumentChunker()
```

### 2.3 Vector Database Setup - ChromaDB

**`backend/services/vector_db_service.py`:**
```python
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
import logging
import json
from pathlib import Path

logger = logging.getLogger(__name__)

class ChromaDBService:
    def __init__(self, persist_dir: str = "./vector_db/chromadb"):
        """Initialize ChromaDB with persistence"""
        self.persist_dir = Path(persist_dir)
        self.persist_dir.mkdir(parents=True, exist_ok=True)
        
        # ChromaDB settings for production
        settings = Settings(
            chroma_db_impl="duckdb+parquet",
            persist_directory=str(self.persist_dir),
            anonymized_telemetry=False,
            allow_reset=True
        )
        
        self.client = chromadb.Client(settings)
        self.collection_name = "veridoc_documents"
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"}  # Cosine similarity
        )
        
        logger.info(f"ChromaDB initialized with persistence at {persist_dir}")
    
    def add_documents(self, chunks: List[Dict]) -> bool:
        """
        Add document chunks to vector database.
        Expected format: {
            'id': unique_id,
            'content': chunk_text,
            'metadata': {doc_id, chunk_index, ...}
        }
        """
        try:
            ids = [chunk['id'] for chunk in chunks]
            documents = [chunk['content'] for chunk in chunks]
            metadatas = [chunk['metadata'] for chunk in chunks]
            embeddings = [chunk.get('embedding') for chunk in chunks]
            
            self.collection.upsert(
                ids=ids,
                documents=documents,
                metadatas=metadatas,
                embeddings=embeddings  # Pre-computed embeddings
            )
            
            logger.info(f"Added {len(chunks)} chunks to vector database")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add documents: {str(e)}")
            return False
    
    def search(self, query_embedding: List[float], top_k: int = 4) -> List[Dict]:
        """
        Search vector database using query embedding.
        Returns top_k most similar documents.
        """
        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results
            retrieved_docs = []
            for i in range(len(results['documents'][0])):
                retrieved_docs.append({
                    'content': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i],
                    'distance': results['distances'][0][i],  # 0 = perfect match
                    'similarity_score': 1 - results['distances'][0][i]  # Convert distance to similarity
                })
            
            return retrieved_docs
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            return []
    
    def delete_collection(self) -> bool:
        """Delete collection (for testing/reset)"""
        try:
            self.client.delete_collection(name=self.collection_name)
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            logger.info("Collection deleted and recreated")
            return True
        except Exception as e:
            logger.error(f"Failed to delete collection: {str(e)}")
            return False
    
    def persist(self) -> bool:
        """Persist database to disk"""
        try:
            self.client.persist()
            logger.info("Database persisted to disk")
            return True
        except Exception as e:
            logger.error(f"Persistence failed: {str(e)}")
            return False

# Initialize ChromaDB service
chroma_service = ChromaDBService()
```

### 2.4 Alternative: FAISS Integration

**`backend/services/faiss_service.py`:**
```python
import faiss
import numpy as np
from typing import List, Dict, Tuple
import json
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class FAISSService:
    def __init__(self, index_dir: str = "./vector_db/faiss_indices", dimension: int = 384):
        """Initialize FAISS index for high-performance search"""
        self.index_dir = Path(index_dir)
        self.index_dir.mkdir(parents=True, exist_ok=True)
        self.dimension = dimension
        
        # Create HNSW index (better than L2 for similarity search)
        self.index = faiss.IndexHNSWFlat(dimension, 32)  # 32 connections per node
        self.index.hnsw.efConstruction = 200
        
        self.id_map = {}  # Map FAISS index to document IDs
        self.metadata_store = {}  # Store metadata for retrieved docs
        
        logger.info(f"FAISS index initialized with dimension {dimension}")
    
    def add_embeddings(self, embeddings: np.ndarray, 
                      ids: List[str], 
                      metadata: List[Dict]) -> bool:
        """
        Add embeddings to FAISS index.
        """
        try:
            # Ensure embeddings are float32
            embeddings = embeddings.astype(np.float32)
            
            # Add to FAISS index
            start_idx = self.index.ntotal
            self.index.add(embeddings)
            
            # Map indices to IDs and store metadata
            for i, doc_id in enumerate(ids):
                self.id_map[start_idx + i] = doc_id
                self.metadata_store[doc_id] = metadata[i]
            
            logger.info(f"Added {len(embeddings)} embeddings to FAISS index")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add embeddings: {str(e)}")
            return False
    
    def search(self, query_embedding: np.ndarray, top_k: int = 4) -> List[Dict]:
        """
        Search FAISS index using query embedding.
        Returns top_k most similar documents.
        """
        try:
            query_embedding = query_embedding.astype(np.float32).reshape(1, -1)
            
            # Search index
            distances, indices = self.index.search(query_embedding, top_k)
            
            # Format results
            retrieved_docs = []
            for i, idx in enumerate(indices[0]):
                if idx != -1:  # -1 indicates empty result
                    doc_id = self.id_map.get(idx)
                    if doc_id:
                        retrieved_docs.append({
                            'id': doc_id,
                            'distance': distances[0][i],
                            'similarity_score': 1.0 / (1.0 + distances[0][i]),
                            'metadata': self.metadata_store.get(doc_id, {})
                        })
            
            return retrieved_docs
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            return []
    
    def save_index(self) -> bool:
        """Save FAISS index and metadata to disk"""
        try:
            index_path = self.index_dir / "index.faiss"
            metadata_path = self.index_dir / "metadata.json"
            id_map_path = self.index_dir / "id_map.json"
            
            faiss.write_index(self.index, str(index_path))
            
            with open(metadata_path, 'w') as f:
                json.dump(self.metadata_store, f)
            
            with open(id_map_path, 'w') as f:
                json.dump({str(k): v for k, v in self.id_map.items()}, f)
            
            logger.info("FAISS index saved to disk")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save index: {str(e)}")
            return False
    
    def load_index(self) -> bool:
        """Load FAISS index and metadata from disk"""
        try:
            index_path = self.index_dir / "index.faiss"
            metadata_path = self.index_dir / "metadata.json"
            id_map_path = self.index_dir / "id_map.json"
            
            if index_path.exists():
                self.index = faiss.read_index(str(index_path))
                
                with open(metadata_path, 'r') as f:
                    self.metadata_store = json.load(f)
                
                with open(id_map_path, 'r') as f:
                    id_map_json = json.load(f)
                    self.id_map = {int(k): v for k, v in id_map_json.items()}
                
                logger.info("FAISS index loaded from disk")
                return True
            else:
                logger.warning("No existing FAISS index found")
                return False
                
        except Exception as e:
            logger.error(f"Failed to load index: {str(e)}")
            return False

faiss_service = FAISSService()
```

### 2.5 Notebook: Embeddings Analysis

**`notebooks/01_embeddings_analysis.ipynb`:**

This notebook should cover:
- Loading sample documents
- Generating embeddings with different models
- Analyzing embedding quality (dimensionality, distribution)
- Comparing sentence-transformers models
- Visualizing embeddings (t-SNE/UMAP)
- Performance benchmarking (speed, accuracy)

**Key Metrics to Track:**
- Embedding generation speed (tokens/second)
- Memory usage
- Cosine similarity distribution
- Outlier detection

### 2.6 Testing Vector Database

**`backend/tests/test_vector_db.py`:**
```python
import pytest
from services.vector_db_service import chroma_service
from utils.embeddings import embeddings_manager
import numpy as np

def test_add_documents():
    """Test adding documents to vector database"""
    chunks = [
        {
            'id': '1',
            'content': 'Python is a programming language',
            'metadata': {'doc_id': 'doc1', 'chunk_index': 0},
            'embedding': embeddings_manager.embed_query('Python is a programming language').tolist()
        }
    ]
    
    result = chroma_service.add_documents(chunks)
    assert result == True

def test_search():
    """Test searching vector database"""
    query_embedding = embeddings_manager.embed_query('programming language')
    results = chroma_service.search(query_embedding, top_k=1)
    
    assert len(results) > 0
    assert 'Python' in results[0]['content']

@pytest.mark.asyncio
async def test_vector_db_persistence():
    """Test database persistence"""
    chroma_service.persist()
    # Restart service and verify data persists
    from services.vector_db_service import ChromaDBService
    new_service = ChromaDBService()
    results = new_service.search(
        embeddings_manager.embed_query('programming'),
        top_k=1
    )
    assert len(results) > 0
```

**Deliverables:**
- ✅ Embeddings manager with batch processing
- ✅ Document chunking with semantic awareness
- ✅ ChromaDB setup with persistence
- ✅ FAISS integration (alternative)
- ✅ Comprehensive testing suite
- ✅ Performance analysis notebook

---

## Phase 3: LLM Integration & RAG Pipeline (Weeks 5-8)

### 3.1 LLM Service Layer

**`backend/services/llm_service.py`:**
```python
from typing import List, Dict, Optional
from langchain.llms import OpenAI, Ollama
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
import logging
from config import LLM_PROVIDER, LLM_MODEL

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self, provider: str = LLM_PROVIDER, model: str = LLM_MODEL):
        self.provider = provider
        self.model = model
        self.llm = self._initialize_llm()
        logger.info(f"LLM initialized: {provider} - {model}")
    
    def _initialize_llm(self):
        """Initialize LLM based on provider"""
        if self.provider == "ollama":
            return Ollama(
                model=self.model,
                base_url="http://localhost:11434",
                temperature=0.3,
                top_p=0.9
            )
        elif self.provider == "openai":
            return OpenAI(
                model_name=self.model,
                temperature=0.3,
                max_tokens=512,
                api_key="sk-..."  # Load from environment
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")
    
    def generate_answer(self, 
                       question: str, 
                       context: List[str],
                       system_prompt: Optional[str] = None) -> Dict:
        """
        Generate answer using retrieved context.
        
        Args:
            question: User question
            context: Retrieved document chunks
            system_prompt: Custom system instructions
        
        Returns:
            Dictionary with answer, sources, and metadata
        """
        try:
            # Build RAG prompt
            context_str = "\n\n".join([f"[{i}] {chunk}" 
                                       for i, chunk in enumerate(context)])
            
            prompt = self._build_prompt(question, context_str, system_prompt)
            
            # Generate response
            response = self.llm.predict(prompt)
            
            return {
                'answer': response.strip(),
                'sources': list(range(len(context))),
                'tokens_used': len(response.split()),
                'model': self.model,
                'context_length': len(context_str)
            }
            
        except Exception as e:
            logger.error(f"LLM generation failed: {str(e)}")
            return {
                'answer': 'Unable to generate answer',
                'error': str(e),
                'sources': []
            }
    
    def _build_prompt(self, question: str, context: str, 
                     system_prompt: Optional[str]) -> str:
        """Build optimized RAG prompt"""
        if system_prompt is None:
            system_prompt = """You are a helpful assistant answering questions based on provided documents.
            
Instructions:
1. Answer based ONLY on the provided context
2. If information is not in context, say "Not found in documents"
3. Be concise and factual
4. Cite sources by number [0], [1], etc. when using specific context
5. Do not make up information"""
        
        return f"""{system_prompt}

Context Documents:
{context}

Question: {question}

Answer:"""
    
    def batch_generate(self, questions: List[str], 
                      contexts: List[List[str]]) -> List[Dict]:
        """Generate answers for multiple questions"""
        results = []
        for q, c in zip(questions, contexts):
            result = self.generate_answer(q, c)
            results.append(result)
        return results
    
    def stream_answer(self, question: str, context: List[str]):
        """Stream answer generation for real-time response"""
        prompt = self._build_prompt(question, "\n\n".join(context), None)
        # Implementation depends on LangChain streaming support
        return self.llm.predict(prompt)

llm_service = LLMService()
```

### 3.2 Hybrid Retrieval System

**`backend/services/retrieval_service.py`:**
```python
from typing import List, Dict, Tuple
import logging
from rank_bm25 import BM25Okapi
import numpy as np
from utils.embeddings import embeddings_manager
from services.vector_db_service import chroma_service

logger = logging.getLogger(__name__)

class HybridRetrievalService:
    """
    Combines semantic (vector) and keyword (BM25) search for better recall.
    
    Hybrid approach addresses:
    - Semantic search: Captures meaning and context
    - BM25 search: Matches exact keywords and terms
    - Fusion: Combines both scores for optimal relevance
    """
    
    def __init__(self, semantic_weight: float = 0.7, keyword_weight: float = 0.3):
        self.semantic_weight = semantic_weight
        self.keyword_weight = keyword_weight
        self.bm25_index = None
        self.documents = {}  # Store actual documents
        self.doc_ids = []    # Ordered document IDs
        
        logger.info(f"Hybrid retrieval initialized (semantic={semantic_weight}, keyword={keyword_weight})")
    
    def build_bm25_index(self, documents: List[Dict]) -> bool:
        """
        Build BM25 index for keyword search.
        Input: [{'id': '1', 'content': 'text', 'metadata': {...}}, ...]
        """
        try:
            tokenized_docs = []
            self.doc_ids = []
            
            for doc in documents:
                tokens = doc['content'].lower().split()
                tokenized_docs.append(tokens)
                self.doc_ids.append(doc['id'])
                self.documents[doc['id']] = doc
            
            self.bm25_index = BM25Okapi(tokenized_docs)
            logger.info(f"BM25 index built for {len(documents)} documents")
            return True
            
        except Exception as e:
            logger.error(f"BM25 index build failed: {str(e)}")
            return False
    
    def semantic_search(self, query: str, top_k: int = 4) -> List[Tuple[str, float]]:
        """
        Vector-based semantic search.
        Returns: [(doc_id, similarity_score), ...]
        """
        try:
            query_embedding = embeddings_manager.embed_query(query)
            results = chroma_service.search(query_embedding, top_k=top_k)
            
            return [
                (result['metadata'].get('doc_id', 'unknown'), result['similarity_score'])
                for result in results
            ]
            
        except Exception as e:
            logger.error(f"Semantic search failed: {str(e)}")
            return []
    
    def keyword_search(self, query: str, top_k: int = 4) -> List[Tuple[str, float]]:
        """
        BM25-based keyword search.
        Returns: [(doc_id, bm25_score), ...]
        """
        try:
            if self.bm25_index is None:
                logger.warning("BM25 index not built")
                return []
            
            tokens = query.lower().split()
            scores = self.bm25_index.get_scores(tokens)
            
            # Get top_k by score
            ranked = sorted(
                zip(self.doc_ids, scores),
                key=lambda x: x[1],
                reverse=True
            )[:top_k]
            
            return ranked
            
        except Exception as e:
            logger.error(f"Keyword search failed: {str(e)}")
            return []
    
    def hybrid_retrieve(self, query: str, top_k: int = 4) -> List[Dict]:
        """
        Perform hybrid retrieval combining both search methods.
        
        Algorithm:
        1. Run semantic search → normalize scores [0, 1]
        2. Run keyword search → normalize scores [0, 1]
        3. Fuse scores: final_score = w1*semantic + w2*keyword
        4. Rank by fused score and return top_k
        """
        try:
            # Get results from both methods
            semantic_results = self.semantic_search(query, top_k=10)  # Get more for fusion
            keyword_results = self.keyword_search(query, top_k=10)
            
            # Normalize scores to [0, 1]
            semantic_scores = {}
            if semantic_results:
                max_semantic = max(score for _, score in semantic_results)
                for doc_id, score in semantic_results:
                    semantic_scores[doc_id] = score / max_semantic if max_semantic > 0 else 0
            
            keyword_scores = {}
            if keyword_results:
                max_keyword = max(score for _, score in keyword_results)
                for doc_id, score in keyword_results:
                    keyword_scores[doc_id] = score / max_keyword if max_keyword > 0 else 0
            
            # Fuse scores
            all_doc_ids = set(semantic_scores.keys()) | set(keyword_scores.keys())
            fused_scores = {}
            
            for doc_id in all_doc_ids:
                sem_score = semantic_scores.get(doc_id, 0)
                kw_score = keyword_scores.get(doc_id, 0)
                fused_scores[doc_id] = (
                    self.semantic_weight * sem_score + 
                    self.keyword_weight * kw_score
                )
            
            # Rank and return top_k
            ranked = sorted(
                fused_scores.items(),
                key=lambda x: x[1],
                reverse=True
            )[:top_k]
            
            # Format response
            results = []
            for doc_id, fused_score in ranked:
                doc = self.documents.get(doc_id)
                if doc:
                    results.append({
                        'content': doc['content'],
                        'metadata': doc['metadata'],
                        'relevance_score': float(fused_score),
                        'semantic_score': semantic_scores.get(doc_id, 0),
                        'keyword_score': keyword_scores.get(doc_id, 0)
                    })
            
            logger.info(f"Hybrid retrieval returned {len(results)} documents")
            return results
            
        except Exception as e:
            logger.error(f"Hybrid retrieval failed: {str(e)}")
            return []

retrieval_service = HybridRetrievalService()
```

### 3.3 Complete RAG Pipeline

**`backend/services/rag_pipeline.py`:**
```python
from typing import List, Dict, Optional
from datetime import datetime
import logging
from services.retrieval_service import retrieval_service
from services.llm_service import llm_service
from utils.embeddings import embeddings_manager
import json

logger = logging.getLogger(__name__)

class RAGPipeline:
    """
    Complete Retrieval-Augmented Generation pipeline.
    
    Pipeline Flow:
    1. Preprocess query
    2. Retrieve relevant documents (hybrid search)
    3. Re-rank if needed
    4. Generate answer using LLM
    5. Format and return response with citations
    """
    
    def __init__(self):
        self.query_history = []
        logger.info("RAG Pipeline initialized")
    
    def process_query(self, 
                      query: str,
                      top_k: int = 4,
                      include_sources: bool = True,
                      user_id: Optional[str] = None) -> Dict:
        """
        Process complete RAG query end-to-end.
        """
        try:
            start_time = datetime.now()
            
            # Step 1: Preprocess query
            cleaned_query = self._preprocess_query(query)
            logger.info(f"Processing query: {cleaned_query}")
            
            # Step 2: Retrieve documents
            retrieved_docs = retrieval_service.hybrid_retrieve(
                cleaned_query,
                top_k=top_k
            )
            
            if not retrieved_docs:
                return self._format_response(
                    answer="No relevant documents found in knowledge base.",
                    sources=[],
                    query=query,
                    has_context=False,
                    processing_time=(datetime.now() - start_time).total_seconds()
                )
            
            # Step 3: Extract context
            context = [doc['content'] for doc in retrieved_docs]
            
            # Step 4: Generate answer
            llm_response = llm_service.generate_answer(
                question=cleaned_query,
                context=context
            )
            
            # Step 5: Format response
            response = self._format_response(
                answer=llm_response.get('answer', ''),
                sources=retrieved_docs if include_sources else [],
                query=query,
                has_context=True,
                processing_time=(datetime.now() - start_time).total_seconds(),
                model_used=llm_response.get('model', 'unknown'),
                tokens_used=llm_response.get('tokens_used', 0)
            )
            
            # Store in history
            self._log_query(query, response, user_id)
            
            return response
            
        except Exception as e:
            logger.error(f"RAG pipeline error: {str(e)}")
            return self._format_error_response(str(e))
    
    def _preprocess_query(self, query: str) -> str:
        """Clean and normalize query"""
        return query.strip().lower()
    
    def _format_response(self,
                        answer: str,
                        sources: List[Dict],
                        query: str,
                        has_context: bool,
                        processing_time: float,
                        model_used: str = 'unknown',
                        tokens_used: int = 0) -> Dict:
        """Format final response"""
        return {
            'status': 'success',
            'query': query,
            'answer': answer,
            'sources': sources,
            'has_context': has_context,
            'source_count': len(sources),
            'processing_time_ms': round(processing_time * 1000, 2),
            'model': model_used,
            'tokens_used': tokens_used,
            'timestamp': datetime.now().isoformat()
        }
    
    def _format_error_response(self, error: str) -> Dict:
        """Format error response"""
        return {
            'status': 'error',
            'error': error,
            'answer': 'An error occurred processing your query',
            'sources': [],
            'timestamp': datetime.now().isoformat()
        }
    
    def _log_query(self, query: str, response: Dict, user_id: Optional[str]):
        """Log query for monitoring and evaluation"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'user_id': user_id or 'anonymous',
            'query': query,
            'response_time': response.get('processing_time_ms', 0),
            'source_count': response.get('source_count', 0),
            'has_context': response.get('has_context', False)
        }
        self.query_history.append(log_entry)
        
        # Save to file for analysis
        with open('logs/query_history.jsonl', 'a') as f:
            f.write(json.dumps(log_entry) + '\n')

rag_pipeline = RAGPipeline()
```

### 3.4 Query Routes (FastAPI)

**`backend/api/query_routes.py`:**
```python
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional
from services.rag_pipeline import rag_pipeline
from api.auth_routes import verify_token
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/queries", tags=["queries"])

class QueryRequest(BaseModel):
    query: str
    top_k: int = 4
    include_sources: bool = True
    session_id: Optional[str] = None

class QueryResponse(BaseModel):
    status: str
    query: str
    answer: str
    sources: List[dict]
    source_count: int
    processing_time_ms: float
    timestamp: str

@router.post("/ask", response_model=QueryResponse)
async def ask_question(
    request: QueryRequest,
    current_user: dict = Depends(verify_token)
):
    """
    Main endpoint for asking questions.
    
    Returns:
    - answer: Generated answer from LLM
    - sources: Retrieved document chunks with metadata
    - processing_time: Time taken to process
    """
    try:
        logger.info(f"Query from user {current_user['user_id']}: {request.query[:50]}...")
        
        response = rag_pipeline.process_query(
            query=request.query,
            top_k=request.top_k,
            include_sources=request.include_sources,
            user_id=current_user['user_id']
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Query processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_query_history(
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(verify_token)
):
    """Get user's query history"""
    return {
        'user_id': current_user['user_id'],
        'history': rag_pipeline.query_history[-limit:]
    }
```

**Deliverables:**
- ✅ LLM service with multiple provider support
- ✅ Hybrid retrieval (semantic + keyword)
- ✅ Complete RAG pipeline
- ✅ FastAPI query endpoints
- ✅ Query logging and monitoring
- ✅ Error handling and fallbacks

---

## Phase 4: Evaluation & Metrics (Weeks 9-11)

### 4.1 RAGAS Evaluation Framework

**`backend/utils/evaluation.py`:**
```python
from ragas import evaluate
from ragas.metrics import (
    ContextPrecision,
    ContextRecall,
    Faithfulness,
    AnswerRelevancy,
    AnswerSimilarity
)
from datasets import Dataset
import pandas as pd
import logging
from typing import List, Dict
import json

logger = logging.getLogger(__name__)

class RAGASEvaluator:
    """
    Comprehensive RAG evaluation using RAGAS metrics.
    
    Metrics:
    - Context Precision: Are retrieved docs relevant?
    - Context Recall: Did we retrieve all relevant docs?
    - Faithfulness: Does answer stay faithful to context?
    - Answer Relevancy: Does answer address question?
    - AnswerSimilarity: How similar to expected answer?
    """
    
    def __init__(self):
        self.metrics = [
            ContextPrecision(),
            ContextRecall(),
            Faithfulness(),
            AnswerRelevancy(),
            AnswerSimilarity()
        ]
        logger.info("RAGAS evaluator initialized")
    
    def prepare_evaluation_dataset(self, 
                                   ground_truth_file: str) -> Dataset:
        """
        Load evaluation dataset in expected format.
        Format: {
            'question': str,
            'answer': str,
            'ground_truth': str,
            'contexts': [str, str, ...]
        }
        """
        try:
            with open(ground_truth_file, 'r') as f:
                data = json.load(f)
            
            dataset = Dataset.from_dict(data)
            logger.info(f"Loaded evaluation dataset with {len(dataset)} examples")
            return dataset
            
        except Exception as e:
            logger.error(f"Failed to load evaluation data: {str(e)}")
            raise
    
    def evaluate_qa_pair(self,
                         question: str,
                         answer: str,
                         ground_truth: str,
                         contexts: List[str]) -> Dict[str, float]:
        """
        Evaluate single Q&A pair.
        
        Returns:
        {
            'context_precision': float (0-1),
            'context_recall': float (0-1),
            'faithfulness': float (0-1),
            'answer_relevancy': float (0-1),
            'answer_similarity': float (0-1),
            'overall_score': float (0-1)
        }
        """
        try:
            dataset = Dataset.from_dict({
                'question': [question],
                'answer': [answer],
                'ground_truth': [ground_truth],
                'contexts': [contexts]
            })
            
            scores = evaluate(dataset, metrics=self.metrics)
            
            # Calculate overall score (average of all metrics)
            metric_values = {
                'context_precision': scores['context_precision'],
                'context_recall': scores['context_recall'],
                'faithfulness': scores['faithfulness'],
                'answer_relevancy': scores['answer_relevancy'],
                'answer_similarity': scores['answer_similarity']
            }
            
            metric_values['overall_score'] = sum(metric_values.values()) / len(metric_values)
            
            return metric_values
            
        except Exception as e:
            logger.error(f"Evaluation failed: {str(e)}")
            return {}
    
    def batch_evaluate(self, 
                       qa_pairs: List[Dict],
                       sample_size: Optional[int] = None) -> pd.DataFrame:
        """
        Evaluate multiple Q&A pairs.
        
        Input format:
        [
            {
                'question': str,
                'answer': str,
                'ground_truth': str,
                'contexts': [str, ...]
            },
            ...
        ]
        """
        try:
            # Sample if needed
            if sample_size and len(qa_pairs) > sample_size:
                import random
                qa_pairs = random.sample(qa_pairs, sample_size)
            
            results = []
            for idx, pair in enumerate(qa_pairs):
                scores = self.evaluate_qa_pair(
                    question=pair['question'],
                    answer=pair['answer'],
                    ground_truth=pair['ground_truth'],
                    contexts=pair['contexts']
                )
                scores['pair_index'] = idx
                results.append(scores)
                
                logger.info(f"Evaluated {idx+1}/{len(qa_pairs)} pairs")
            
            # Convert to DataFrame
            df = pd.DataFrame(results)
            
            # Calculate statistics
            logger.info("\n=== Evaluation Results ===")
            logger.info(df.describe())
            
            return df
            
        except Exception as e:
            logger.error(f"Batch evaluation failed: {str(e)}")
            raise
    
    def generate_report(self, evaluation_df: pd.DataFrame) -> Dict:
        """Generate evaluation report with recommendations"""
        return {
            'total_evaluated': len(evaluation_df),
            'metrics_summary': {
                col: {
                    'mean': float(evaluation_df[col].mean()),
                    'std': float(evaluation_df[col].std()),
                    'min': float(evaluation_df[col].min()),
                    'max': float(evaluation_df[col].max())
                }
                for col in evaluation_df.columns if col != 'pair_index'
            },
            'failing_pairs': evaluation_df[
                evaluation_df['overall_score'] < 0.5
            ].index.tolist(),
            'recommendations': self._generate_recommendations(evaluation_df)
        }
    
    def _generate_recommendations(self, df: pd.DataFrame) -> List[str]:
        """Generate recommendations based on evaluation"""
        recommendations = []
        
        if df['context_precision'].mean() < 0.6:
            recommendations.append(
                "Low context precision: Improve retrieval ranking or reduce chunk size"
            )
        
        if df['faithfulness'].mean() < 0.6:
            recommendations.append(
                "Low faithfulness: Add fact-checking or constraint LLM to stay closer to context"
            )
        
        if df['answer_relevancy'].mean() < 0.6:
            recommendations.append(
                "Low answer relevancy: Improve query processing or chunking strategy"
            )
        
        return recommendations

evaluator = RAGASEvaluator()
```

### 4.2 Comparative Analysis: RAG vs Keyword Search

**`backend/utils/baseline_comparison.py`:**
```python
from typing import List, Dict
import logging
from rank_bm25 import BM25Okapi
from services.rag_pipeline import rag_pipeline
from utils.embeddings import embeddings_manager
import pandas as pd
import json

logger = logging.getLogger(__name__)

class BaselineComparison:
    """
    Compare RAG system with traditional keyword-based search.
    
    Baselines:
    1. Keyword Search (BM25): Traditional search engine approach
    2. Simple Semantic Search: Vector search without RAG
    3. Full RAG Pipeline: Our complete system
    """
    
    def __init__(self):
        self.bm25_index = None
        self.documents = []
        logger.info("Baseline comparison initialized")
    
    def setup_keyword_baseline(self, documents: List[Dict]):
        """Setup BM25 keyword search baseline"""
        tokenized_docs = [doc['content'].lower().split() for doc in documents]
        self.bm25_index = BM25Okapi(tokenized_docs)
        self.documents = documents
        logger.info(f"BM25 baseline setup with {len(documents)} documents")
    
    def keyword_search_baseline(self, query: str, top_k: int = 4) -> List[str]:
        """Retrieve using simple BM25 keyword search"""
        tokens = query.lower().split()
        scores = self.bm25_index.get_scores(tokens)
        
        top_indices = sorted(
            range(len(scores)), 
            key=lambda i: scores[i], 
            reverse=True
        )[:top_k]
        
        return [self.documents[i]['content'] for i in top_indices]
    
    def semantic_baseline(self, query: str, top_k: int = 4) -> List[str]:
        """Retrieve using pure semantic search (no LLM generation)"""
        query_embedding = embeddings_manager.embed_query(query)
        
        # Simple cosine similarity
        doc_embeddings = [
            embeddings_manager.embed_query(doc['content']) 
            for doc in self.documents
        ]
        
        from scipy.spatial.distance import cosine
        similarities = [1 - cosine(query_embedding, doc_emb) 
                       for doc_emb in doc_embeddings]
        
        top_indices = sorted(
            range(len(similarities)),
            key=lambda i: similarities[i],
            reverse=True
        )[:top_k]
        
        return [self.documents[i]['content'] for i in top_indices]
    
    def rag_system(self, query: str, top_k: int = 4) -> Dict:
        """Our complete RAG pipeline"""
        return rag_pipeline.process_query(query, top_k=top_k)
    
    def compare_on_queries(self, test_queries: List[Dict]) -> pd.DataFrame:
        """
        Compare all approaches on test set.
        
        Input: [
            {
                'query': str,
                'expected_answer': str,
                'relevant_doc_ids': [int, ...]
            },
            ...
        ]
        """
        results = []
        
        for idx, test_case in enumerate(test_queries):
            query = test_case['query']
            
            # Run all three approaches
            keyword_results = self.keyword_search_baseline(query)
            semantic_results = self.semantic_baseline(query)
            rag_results = self.rag_system(query)
            
            result = {
                'query_id': idx,
                'query': query,
                'keyword_answer': keyword_results,
                'semantic_answer': semantic_results,
                'rag_answer': rag_results['answer'],
                'rag_processing_time': rag_results['processing_time_ms'],
                'rag_source_count': rag_results['source_count']
            }
            results.append(result)
            
            logger.info(f"Compared approaches for query {idx+1}/{len(test_queries)}")
        
        return pd.DataFrame(results)

baseline_comparison = BaselineComparison()
```

### 4.3 Evaluation Notebook

**`notebooks/03_evaluation_metrics.ipynb`:**

This notebook should:
1. Load ground truth dataset
2. Run RAG system on test queries
3. Calculate RAGAS metrics
4. Generate evaluation report
5. Identify failure cases
6. Propose improvements

### 4.4 Comparative Analysis Notebook

**`notebooks/04_comparative_analysis.ipynb`:**

This notebook should:
1. Setup baseline systems
2. Run all approaches on test set
3. Compare accuracy metrics
4. Compare latency/performance
5. Generate comparison visualizations
6. Document findings

**Deliverables:**
- ✅ RAGAS evaluation framework
- ✅ Baseline comparison with keyword search
- ✅ Comprehensive evaluation notebooks
- ✅ Metrics report generation
- ✅ Failure case analysis

---

## Phase 5: Authentication & Backend API (Weeks 9-10)

### 5.1 Authentication System

**`backend/services/auth_service.py`:**
```python
from datetime import datetime, timedelta
from typing import Optional, Dict
import jwt
import logging
from passlib.context import CryptContext
import os

logger = logging.getLogger(__name__)

class AuthService:
    """
    JWT-based authentication for multi-user access control.
    """
    
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET', 'change-me-in-production')
        self.algorithm = os.getenv('JWT_ALGORITHM', 'HS256')
        self.expiration_hours = int(os.getenv('JWT_EXPIRATION_HOURS', '24'))
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        logger.info("AuthService initialized")
    
    def hash_password(self, password: str) -> str:
        """Hash password for secure storage"""
        return self.pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def create_token(self, user_id: str, email: str) -> Dict[str, str]:
        """
        Create JWT token for user.
        
        Token contains:
        - user_id: Unique user identifier
        - email: User email
        - exp: Expiration time
        """
        try:
            payload = {
                'user_id': user_id,
                'email': email,
                'exp': datetime.utcnow() + timedelta(hours=self.expiration_hours),
                'iat': datetime.utcnow()
            }
            
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            
            return {
                'access_token': token,
                'token_type': 'bearer',
                'expires_in': self.expiration_hours * 3600
            }
            
        except Exception as e:
            logger.error(f"Token creation failed: {str(e)}")
            raise
    
    def verify_token(self, token: str) -> Optional[Dict]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid token")
            return None
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            return None

auth_service = AuthService()
```

### 5.2 Auth Routes

**`backend/api/auth_routes.py`:**
```python
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from pydantic import BaseModel, EmailStr
from services.auth_service import auth_service
from models.database import User, get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

security = HTTPBearer()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

@router.post("/signup", response_model=TokenResponse)
async def signup(request: SignupRequest, db=Depends(get_db)):
    """Register new user"""
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        hashed_password = auth_service.hash_password(request.password)
        new_user = User(
            email=request.email,
            full_name=request.full_name,
            hashed_password=hashed_password
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Generate token
        token = auth_service.create_token(str(new_user.id), new_user.email)
        
        logger.info(f"User signed up: {request.email}")
        return token
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail="Signup failed")

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db=Depends(get_db)):
    """Authenticate user and return token"""
    try:
        # Find user
        user = db.query(User).filter(User.email == request.email).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Verify password
        if not auth_service.verify_password(request.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Generate token
        token = auth_service.create_token(str(user.id), user.email)
        
        logger.info(f"User logged in: {request.email}")
        return token
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

async def verify_token(credentials: HTTPAuthCredentials = Depends(security)) -> dict:
    """Dependency for protected routes"""
    token = credentials.credentials
    payload = auth_service.verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return payload
```

### 5.3 Document Management Routes

**`backend/api/document_routes.py`:**
```python
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from services.document_service import document_service
from api.auth_routes import verify_token
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(verify_token)
):
    """
    Upload and index document.
    
    Supports: PDF, DOCX, TXT, Markdown
    """
    try:
        doc_info = await document_service.process_and_index(
            file=file,
            user_id=current_user['user_id']
        )
        
        logger.info(f"Document uploaded by {current_user['user_id']}: {file.filename}")
        
        return {
            'status': 'success',
            'document_id': doc_info['id'],
            'filename': file.filename,
            'chunks_created': doc_info['chunk_count'],
            'message': 'Document indexed successfully'
        }
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_documents(current_user: dict = Depends(verify_token)):
    """List user's uploaded documents"""
    try:
        documents = document_service.get_user_documents(current_user['user_id'])
        return {
            'user_id': current_user['user_id'],
            'documents': documents,
            'total': len(documents)
        }
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: dict = Depends(verify_token)
):
    """Delete document and remove from vector DB"""
    try:
        success = document_service.delete_document(
            document_id=document_id,
            user_id=current_user['user_id']
        )
        
        if success:
            return {'status': 'success', 'message': 'Document deleted'}
        else:
            raise HTTPException(status_code=404, detail="Document not found")
            
    except Exception as e:
        logger.error(f"Delete error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
```

**Deliverables:**
- ✅ JWT authentication system
- ✅ Secure login/signup endpoints
- ✅ Password hashing with bcrypt
- ✅ Token verification middleware
- ✅ Document management routes
- ✅ User-based access control

---

## Phase 6: Frontend (Weeks 11-12)

### 6.1 React Setup

```bash
# Create React app
npx create-react-app frontend
cd frontend

# Install dependencies
npm install axios react-router-dom zustand
```

### 6.2 Main Components

**`frontend/src/components/QueryInterface.jsx`:**
```jsx
import React, { useState } from 'react';
import axios from 'axios';
import './QueryInterface.css';

function QueryInterface() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        'http://localhost:8000/api/v1/queries/ask',
        {
          query: query,
          top_k: 4,
          include_sources: true
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data;
      setAnswer(data.answer);
      setSources(data.sources);
      setProcessingTime(data.processing_time_ms);
    } catch (error) {
      setAnswer('Error: ' + error.message);
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="query-interface">
      <h1>VeriDoc - Ask Questions About Your Documents</h1>
      
      <form onSubmit={handleSubmit} className="query-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
          className="query-input"
        />
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Searching...' : 'Ask'}
        </button>
      </form>

      {answer && (
        <div className="results">
          <div className="answer-box">
            <h2>Answer</h2>
            <p>{answer}</p>
            <small>Processing time: {processingTime}ms</small>
          </div>

          {sources.length > 0 && (
            <div className="sources-box">
              <h3>Sources ({sources.length})</h3>
              {sources.map((source, idx) => (
                <div key={idx} className="source">
                  <p><strong>Score:</strong> {(source.relevance_score * 100).toFixed(1)}%</p>
                  <p>{source.content.substring(0, 200)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QueryInterface;
```

**`frontend/src/components/DocumentUpload.jsx`:**
```jsx
import React, { useState } from 'react';
import axios from 'axios';

function DocumentUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        'http://localhost:8000/api/v1/documents/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage(`Success: ${response.data.chunks_created} chunks indexed`);
      setFile(null);
      onUploadSuccess && onUploadSuccess();
    } catch (error) {
      setMessage('Upload error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="document-upload">
      <h2>Upload Document</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".pdf,.docx,.txt,.md"
          onChange={(e) => setFile(e.target.files[0])}
          disabled={uploading}
        />
        <button type="submit" disabled={uploading || !file}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default DocumentUpload;
```

**Deliverables:**
- ✅ React application setup
- ✅ Query interface component
- ✅ Document upload component
- ✅ Results display with sources
- ✅ Authentication integration

---

## Phase 7: Deployment & Docker (Weeks 12-14)

### 7.1 Docker Configuration

**`docker/Dockerfile.backend`:**
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Copy requirements
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY backend/ .

# Expose port
EXPOSE 8000

# Run FastAPI
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

**`docker-compose.yml`:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - LLM_PROVIDER=ollama
      - LLM_MODEL=mistral
      - VECTOR_DB=chromadb
      - JWT_SECRET=change-in-production
    volumes:
      - ./vector_db:/app/vector_db
      - ./logs:/app/logs
    depends_on:
      - ollama
    networks:
      - veridoc-network

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ./ollama_data:/root/.ollama
    networks:
      - veridoc-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - veridoc-network

networks:
  veridoc-network:
    driver: bridge
```

### 7.2 Kubernetes Deployment (Optional)

**`k8s/deployment.yaml`:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: veridoc-backend
  labels:
    app: veridoc
spec:
  replicas: 3
  selector:
    matchLabels:
      app: veridoc
  template:
    metadata:
      labels:
        app: veridoc
    spec:
      containers:
      - name: backend
        image: veridoc:latest
        ports:
        - containerPort: 8000
        env:
        - name: LLM_PROVIDER
          value: "ollama"
        - name: LLM_MODEL
          value: "mistral"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

**Deliverables:**
- ✅ Docker containerization
- ✅ Docker Compose orchestration
- ✅ Kubernetes manifests (optional)
- ✅ Production environment configuration

---

## Phase 8: Testing & Quality Assurance (Weeks 13-14)

### 8.1 Comprehensive Test Suite

**`backend/tests/test_integration.py`:**
```python
import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

@pytest.fixture
def auth_token():
    """Get valid auth token for testing"""
    # Implementation depends on test database setup
    pass

def test_full_rag_pipeline(auth_token):
    """Test complete RAG workflow"""
    # 1. Upload document
    with open('tests/sample.txt', 'rb') as f:
        response = client.post(
            '/api/v1/documents/upload',
            files={'file': f},
            headers={'Authorization': f'Bearer {auth_token}'}
        )
    assert response.status_code == 200
    
    # 2. Query document
    response = client.post(
        '/api/v1/queries/ask',
        json={'query': 'What is the main topic?'},
        headers={'Authorization': f'Bearer {auth_token}'}
    )
    assert response.status_code == 200
    assert 'answer' in response.json()

def test_hybrid_retrieval():
    """Test hybrid retrieval with real documents"""
    # Test setup and execution
    pass

def test_llm_generation():
    """Test LLM answer generation"""
    pass
```

### 8.2 Performance Testing

**`backend/tests/test_performance.py`:**
```python
import time
import pytest
from services.rag_pipeline import rag_pipeline

@pytest.mark.performance
def test_query_latency():
    """Test that queries complete within SLA"""
    start = time.time()
    result = rag_pipeline.process_query("Test query")
    elapsed = time.time() - start
    
    # Should complete within 2 seconds
    assert elapsed < 2.0, f"Query took {elapsed}s, should be < 2s"

@pytest.mark.performance
def test_throughput():
    """Test system throughput"""
    import concurrent.futures
    
    queries = [f"Query {i}" for i in range(10)]
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [
            executor.submit(rag_pipeline.process_query, q)
            for q in queries
        ]
        results = [f.result() for f in futures]
    
    assert len(results) == 10
```

**Deliverables:**
- ✅ Unit tests for all components
- ✅ Integration tests for full pipeline
- ✅ Performance benchmarks
- ✅ Load testing setup
- ✅ Test coverage report (target: 80%+)

---

## Phase 9: Monitoring, Logging & Production Optimization (Weeks 14-16)

### 9.1 Monitoring & Observability

**`backend/utils/monitoring.py`:**
```python
import logging
from prometheus_client import Counter, Histogram, Gauge
import time

# Define metrics
query_counter = Counter(
    'veridoc_queries_total',
    'Total queries processed',
    ['status']
)

query_duration = Histogram(
    'veridoc_query_duration_seconds',
    'Query processing duration'
)

active_queries = Gauge(
    'veridoc_active_queries',
    'Currently active queries'
)

retrieval_score = Histogram(
    'veridoc_relevance_score',
    'Retrieved document relevance scores'
)

class QueryMonitor:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def track_query(self, func):
        """Decorator to track query metrics"""
        def wrapper(*args, **kwargs):
            active_queries.inc()
            start = time.time()
            
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start
                
                query_counter.labels(status='success').inc()
                query_duration.observe(duration)
                
                # Track relevance scores
                for source in result.get('sources', []):
                    retrieval_score.observe(
                        source.get('relevance_score', 0)
                    )
                
                return result
            except Exception as e:
                query_counter.labels(status='error').inc()
                raise
            finally:
                active_queries.dec()
        
        return wrapper

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/veridoc.log'),
        logging.StreamHandler()
    ]
)
```

### 9.2 Caching Strategy

**`backend/utils/caching.py`:**
```python
from functools import lru_cache
from datetime import datetime, timedelta
import json

class QueryCache:
    """
    Cache frequent queries to reduce computation.
    Implements LRU cache with TTL.
    """
    
    def __init__(self, ttl_hours: int = 24):
        self.cache = {}
        self.ttl = timedelta(hours=ttl_hours)
        self.hits = 0
        self.misses = 0
    
    def get(self, query: str):
        """Get cached result if fresh"""
        if query in self.cache:
            cached_time, result = self.cache[query]
            if datetime.now() - cached_time < self.ttl:
                self.hits += 1
                return result
            else:
                del self.cache[query]
        
        self.misses += 1
        return None
    
    def set(self, query: str, result):
        """Cache query result"""
        self.cache[query] = (datetime.now(), result)
    
    def hit_rate(self):
        """Return cache hit rate"""
        total = self.hits + self.misses
        return self.hits / total if total > 0 else 0

query_cache = QueryCache()
```

### 9.3 Database Optimization

```sql
-- Create indices for faster queries
CREATE INDEX idx_user_id ON documents(user_id);
CREATE INDEX idx_doc_created_at ON documents(created_at);
CREATE INDEX idx_chunk_doc_id ON document_chunks(document_id);

-- Create vector index (if using PostgreSQL + pgvector)
CREATE INDEX idx_embedding_vectors ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

**Deliverables:**
- ✅ Prometheus metrics setup
- ✅ Query monitoring and tracking
- ✅ Structured logging
- ✅ Query caching mechanism
- ✅ Database indexing and optimization

---

## Phase 10: Documentation & Project Completion (Weeks 15-20)

### 10.1 Documentation

**`docs/ARCHITECTURE.md`:**
```markdown
# VeriDoc Architecture

## System Overview
[Detailed architecture diagram and explanation]

## Component Breakdown

### 1. Document Processing Pipeline
- Input: PDF, DOCX, TXT, Markdown
- Processing: Text extraction → Chunking → Embedding
- Output: Vector-indexed documents in vector DB

### 2. Retrieval System
- Hybrid search combining:
  - BM25 keyword matching (30%)
  - Semantic similarity (70%)
- Re-ranking based on relevance scores

### 3. Generation System
- LLM options: Mistral, LLaMA, GPT
- Prompt engineering for accurate RAG
- Citation and source tracking

### 4. Evaluation Framework
- RAGAS metrics for quality measurement
- Baseline comparison with keyword search
- Continuous monitoring and improvement

## Data Flow

[Diagram showing data flow from document upload to answer generation]
```

### 10.2 API Documentation

**Generate with FastAPI:**
```python
# OpenAPI/Swagger automatically generated at:
# http://localhost:8000/docs
# http://localhost:8000/redoc
```

### 10.3 Deployment Guide

**`docs/DEPLOYMENT.md`:**
- Local development setup
- Docker deployment
- Kubernetes deployment
- Cloud deployment (AWS/GCP/Azure)
- Environment configuration
- Security best practices

### 10.4 User Guide

**`docs/USER_GUIDE.md`:**
- How to upload documents
- How to ask questions
- Interpreting results
- Troubleshooting common issues

**Deliverables:**
- ✅ Complete architecture documentation
- ✅ API specification and examples
- ✅ Deployment guides
- ✅ User and developer documentation
- ✅ Video tutorials (optional)
- ✅ README with quick start

---

## Development Timeline Summary

| Phase | Duration | Key Deliverables | Status |
|-------|----------|------------------|--------|
| 1. Foundation | Weeks 1-2 | Project structure, environment | ✅ |
| 2. Embeddings & Vector DB | Weeks 3-4 | Embedding service, ChromaDB, FAISS | ✅ |
| 3. RAG Pipeline | Weeks 5-8 | LLM service, hybrid retrieval, RAG | ✅ |
| 4. Evaluation | Weeks 9-11 | RAGAS metrics, baseline comparison | ✅ |
| 5. Authentication | Weeks 9-10 | JWT auth, user management | ✅ |
| 6. Frontend | Weeks 11-12 | React UI, query interface | ✅ |
| 7. Deployment | Weeks 12-14 | Docker, Kubernetes setup | ✅ |
| 8. Testing | Weeks 13-14 | Unit tests, integration tests | ✅ |
| 9. Monitoring | Weeks 14-16 | Prometheus, logging, optimization | ✅ |
| 10. Documentation | Weeks 15-20 | Complete docs, guides, tutorials | ✅ |

---

## Success Criteria

### Functional Requirements
- ✅ Upload documents (PDF, DOCX, TXT)
- ✅ Ask natural language questions
- ✅ Retrieve accurate answers from documents
- ✅ Show source citations
- ✅ Multi-user authentication

### Performance Requirements
- ✅ Query processing: < 2 seconds
- ✅ Embedding generation: < 1 second
- ✅ System throughput: 10+ concurrent queries
- ✅ Cache hit rate: > 30%

### Quality Requirements
- ✅ RAGAS overall score: > 0.6
- ✅ Context relevance: > 0.7
- ✅ Faithfulness: > 0.7
- ✅ Answer relevancy: > 0.6
- ✅ Outperform keyword search by 30%+

### Security Requirements
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ User-based document isolation
- ✅ HTTPS/TLS support
- ✅ Input validation and sanitization

---

## Technology Stack Rationale

| Component | Choice | Reason |
|-----------|--------|--------|
| **LLM** | Mistral/LLaMA | Open-source, cost-effective, strong performance |
| **Embeddings** | Sentence-Transformers | Fast, domain-adapted, multilingual support |
| **Vector DB** | ChromaDB | Easy integration, persistence, full-featured |
| **Backend** | FastAPI | Fast, async support, built-in docs |
| **Frontend** | React | Rich ecosystem, component reusability |
| **Auth** | JWT | Stateless, scalable, industry standard |
| **Evaluation** | RAGAS | Comprehensive RAG-specific metrics |
| **Deployment** | Docker/K8s | Containerization, orchestration, scaling |

---

## Future Enhancements

### Phase 11+: Advanced Features
1. **Multi-language Support**
   - Multilingual embeddings
   - Language-specific LLMs
   - Cross-lingual retrieval

2. **Advanced Retrieval**
   - Agentic RAG with multi-step reasoning
   - Parent-child chunking strategy
   - Recursive abstractive processing (RAPTOR)

3. **Fine-tuning & Optimization**
   - Domain-specific embedding fine-tuning
   - LLM fine-tuning on organizational data
   - Query rewriting and expansion

4. **Integration & Connectors**
   - Salesforce, Slack, Teams connectors
   - Database integration
   - Real-time content sync

5. **Advanced Analytics**
   - User behavior tracking
   - Query pattern analysis
   - Answer quality feedback loop

---

## Conclusion

This roadmap provides a complete path to build VeriDoc, a production-grade LLM-based document QA system. Follow the phases sequentially, test thoroughly, and iterate based on evaluation metrics.

**Key Success Factors:**
1. Start with solid embeddings (Phase 2)
2. Build RAG pipeline carefully (Phase 3)
3. Evaluate rigorously with RAGAS (Phase 4)
4. Secure auth from the start (Phase 5)
5. Monitor and optimize continuously (Phase 9)

**Estimated Total Effort:** 20 weeks for 1-2 experienced full-stack developers

**Next Steps:**
1. Set up development environment (Phase 1)
2. Begin embeddings analysis (Phase 2)
3. Implement RAG pipeline (Phase 3)
4. Establish evaluation metrics (Phase 4)
5. Deploy MVP (Phase 7)
