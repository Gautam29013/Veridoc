import os
import tempfile
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List

from fastapi import UploadFile
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from services.bedrock_service import vector_store
from models.database import get_database

class DocumentService:
    async def process_and_index(self, file: UploadFile, user_id: str) -> Dict[str, Any]:
        # Handle saving the PDF to a temporary directory
        temp_fd, temp_path = tempfile.mkstemp(suffix=".pdf")
        texts = []
        try:
            with os.fdopen(temp_fd, "wb") as f:
                content = await file.read()
                f.write(content)

            # Use Langchain's PyPDFLoader to read the text
            loader = PyPDFLoader(temp_path)
            documents = loader.load()

            # Split it with RecursiveCharacterTextSplitter
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            texts = text_splitter.split_documents(documents)

            uuids = [str(uuid.uuid4()) for _ in range(len(texts))]
            for i, text_chunk in enumerate(texts):
                text_chunk.metadata["source_filename"] = file.filename
                text_chunk.metadata["chunk_id"] = uuids[i]

            # Save it to ChromaDB (Bedrock embeddings are configured within vector_store)
            if texts:
                vector_store.add_documents(documents=texts, ids=uuids)
            
            # Log it into MongoDB
            db = get_database()
            doc_id = str(uuid.uuid4())
            
            document_metadata = {
                "_id": doc_id,
                "filename": file.filename,
                "user_id": user_id,
                "chunk_count": len(texts),
                "created_at": datetime.now(timezone.utc),
                "status": "processed",
                "content_type": file.content_type,
                "chunk_ids": uuids
            }
            
            await db.documents.insert_one(document_metadata)

            return {
                "id": doc_id,
                "filename": file.filename,
                "chunk_count": len(texts)
            }

        finally:
            # Finally clean up the temp file smoothly
            try:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            except Exception as cleanup_error:
                print(f"Failed to clean up temp file: {cleanup_error}")

    async def get_all_documents(self) -> List[Dict[str, Any]]:
        db = get_database()
        cursor = db.documents.find({})
        docs = []
        async for doc in cursor:
            # Convert datetime to string for JSON serialization compatibility
            if isinstance(doc.get("created_at"), datetime):
                doc["created_at"] = doc["created_at"].isoformat()
            docs.append(doc)
        return docs

    async def delete_document(self, document_id: str) -> bool:
        db = get_database()
        
        # Find document to access chunk_ids for ChromaDB cleanup
        doc = await db.documents.find_one({"_id": document_id})
        if not doc:
            return False
            
        chunk_ids = doc.get("chunk_ids", [])
        if chunk_ids:
            try:
                vector_store.delete(ids=chunk_ids)
            except Exception as e:
                print(f"Error deleting chunks from ChromaDB: {e}")
                
        # Delete from MongoDB
        result = await db.documents.delete_one({"_id": document_id})
        return result.deleted_count > 0

document_service = DocumentService()
