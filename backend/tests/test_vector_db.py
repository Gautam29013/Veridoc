import pytest
import sys
import os
import numpy as np

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


"""
class TestEmbeddingsManager:
    \"\"\"Test cases for embeddings functionality\"\"\"
    
    def test_embed_single_query(self):
        \"\"\"Test embedding generation for single query\"\"\"
        from utils.embeddings import get_embeddings_manager
        
        manager = get_embeddings_manager()
        query = "What is machine learning?"
        embedding = manager.embed_query(query)
        
        assert embedding is not None
        assert isinstance(embedding, np.ndarray)
        assert embedding.shape[0] == 384  # MiniLM-L6 produces 384-dim vectors
    
    def test_embed_multiple_texts(self):
        \"\"\"Test batch embedding generation\"\"\"
        from utils.embeddings import get_embeddings_manager
        
        manager = get_embeddings_manager()
        texts = [
            "Python is a programming language",
            "Machine learning uses algorithms",
            "Data science involves statistics"
        ]
        embeddings = manager.embed_texts(texts)
        
        assert embeddings is not None
        assert embeddings.shape[0] == 3
        assert embeddings.shape[1] == 384
    
    def test_similarity_search(self):
        \"\"\"Test similarity search returns correct indices\"\"\"
        from utils.embeddings import get_embeddings_manager
        
        manager = get_embeddings_manager()
        docs = [
            "Python is great for data science",
            "JavaScript is used for web development",
            "Python has excellent ML libraries"
        ]
        query = "Python machine learning"
        
        doc_embeddings = manager.embed_texts(docs)
        query_embedding = manager.embed_query(query)
        
        top_indices = manager.similarity_search(query_embedding, doc_embeddings, top_k=2)
        
        # Python-related docs should rank higher
        assert 0 in top_indices or 2 in top_indices
"""


class TestDocumentChunker:
    """Test cases for document chunking"""
    
    def test_chunk_document(self):
        """Test document splitting into chunks"""
        from utils.chunking import DocumentChunker
        
        chunker = DocumentChunker(chunk_size=100, chunk_overlap=20)
        text = "This is a sample document. " * 50  # Long document
        
        chunks = chunker.chunk_document(text, "doc1")
        
        assert len(chunks) > 1
        assert all(isinstance(c[0], str) for c in chunks)
        assert all('doc_id' in c[1] for c in chunks)
    
    def test_chunk_preserves_metadata(self):
        """Test that chunking preserves document metadata"""
        from utils.chunking import DocumentChunker
        
        chunker = DocumentChunker(chunk_size=100, chunk_overlap=20)
        text = "Sample text. " * 100
        
        chunks = chunker.chunk_document(text, "test_doc")
        
        for chunk_text, metadata in chunks:
            assert metadata['doc_id'] == "test_doc"
            assert 'chunk_index' in metadata
            assert 'total_chunks' in metadata
    
    def test_chunk_multiple_documents(self):
        """Test chunking multiple documents"""
        from utils.chunking import DocumentChunker
        
        chunker = DocumentChunker(chunk_size=100, chunk_overlap=20)
        documents = [
            ("First document content. " * 30, "doc1"),
            ("Second document content. " * 30, "doc2"),
        ]
        
        all_chunks = chunker.chunk_multiple(documents)
        
        doc_ids = set(c[1]['doc_id'] for c in all_chunks)
        assert 'doc1' in doc_ids
        assert 'doc2' in doc_ids
    
    def test_various_document_sizes(self):
        """Test chunking with different document sizes"""
        from utils.chunking import DocumentChunker
        
        chunker = DocumentChunker(chunk_size=100, chunk_overlap=20)
        
        # Test cases: (text_multiplier, expected_min_chunks)
        test_cases = [
            (1, 1),    # Tiny document
            (5, 1),    # Small document  
            (20, 2),   # Medium document
            (100, 10), # Large document
        ]
        
        base_text = "Sample text. "  # 13 chars
        
        for multiplier, min_chunks in test_cases:
            text = base_text * multiplier
            chunks = chunker.chunk_document(text, f"doc_{multiplier}")
            assert len(chunks) >= min_chunks, f"Expected at least {min_chunks} chunks for {len(text)} chars"
    
    def test_edge_cases(self):
        """Test edge cases: empty, whitespace, single char"""
        from utils.chunking import DocumentChunker
        
        chunker = DocumentChunker(chunk_size=100, chunk_overlap=20)
        
        # Empty text should return empty list or single empty chunk
        empty_chunks = chunker.chunk_document("", "empty_doc")
        assert len(empty_chunks) <= 1
        
        # Whitespace only
        whitespace_chunks = chunker.chunk_document("   \n\n   ", "ws_doc")
        assert len(whitespace_chunks) <= 1
        
        # Single character
        single_chunks = chunker.chunk_document("X", "single_doc")
        assert len(single_chunks) == 1
        assert single_chunks[0][0] == "X"
    
    def test_chunk_size_overlap_defaults(self):
        """Test that default 1000/200 parameters work correctly"""
        from utils.chunking import DocumentChunker
        from config import CHUNK_SIZE, CHUNK_OVERLAP
        
        chunker = DocumentChunker()  # Use defaults
        
        # Verify defaults are loaded
        assert chunker.chunk_size == CHUNK_SIZE
        assert chunker.chunk_overlap == CHUNK_OVERLAP
        
        # Create text larger than chunk_size
        text = "Word " * 500  # ~2500 chars
        chunks = chunker.chunk_document(text, "default_test")
        
        # Should produce multiple chunks
        assert len(chunks) >= 2
        
        # Each chunk should be approximately chunk_size or less
        for chunk_text, _ in chunks:
            assert len(chunk_text) <= CHUNK_SIZE + 100  # Allow some tolerance
    
    def test_strategy_comparison(self):
        """Compare different chunking strategies"""
        from utils.chunking import DocumentChunker, ChunkingStrategies
        
        # Sample text with clear semantic boundaries
        text = """First paragraph with important information.
        
Second paragraph continues the discussion. It has multiple sentences. Each sentence adds value.

Third paragraph wraps up the topic. Final thoughts are expressed here."""
        
        # Recursive (default)
        chunker = DocumentChunker(chunk_size=100, chunk_overlap=20)
        recursive_chunks = chunker.chunk_document(text, "recursive")
        
        # Fixed size
        fixed_chunks = ChunkingStrategies.fixed_size_overlap(text, 100, 20)
        
        # Semantic
        semantic_chunks = ChunkingStrategies.semantic_chunking(text, sentences_per_chunk=2)
        
        # All strategies should produce chunks
        assert len(recursive_chunks) > 0
        assert len(fixed_chunks) > 0
        assert len(semantic_chunks) > 0
        
        # Semantic chunking should respect sentence boundaries better
        # (chunks should end with punctuation more often)
        punctuation_endings = sum(1 for c in semantic_chunks if c.strip().endswith(('.', '!', '?')))
        assert punctuation_endings >= len(semantic_chunks) // 2
    
    def test_chunk_overlap_continuity(self):
        """Verify overlap preserves context between chunks"""
        from utils.chunking import DocumentChunker
        
        chunker = DocumentChunker(chunk_size=50, chunk_overlap=20)
        
        # Text with clear markers
        text = "AAAA BBBB CCCC DDDD EEEE FFFF GGGG HHHH IIII JJJJ KKKK LLLL MMMM"
        chunks = chunker.chunk_document(text, "overlap_test")
        
        if len(chunks) >= 2:
            # Check that consecutive chunks share some content (overlap)
            for i in range(len(chunks) - 1):
                chunk1 = chunks[i][0]
                chunk2 = chunks[i + 1][0]
                
                # End of chunk1 should appear at start of chunk2 (overlap)
                overlap_region = chunk1[-20:] if len(chunk1) >= 20 else chunk1
                # At least some overlap should exist
                assert any(char in chunk2[:30] for char in overlap_region.split()), \
                    "No overlap detected between consecutive chunks"


\"\"\"
class TestChromaDBService:
... (existing code) ...
\"\"\"

\"\"\"
class TestFAISSService:
... (existing code) ...
\"\"\"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
