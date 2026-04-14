import asyncio
import os
import tempfile
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import UploadFile, BackgroundTasks
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from services.bedrock_service import vector_store
from models.database import get_database

class DocumentService:
    async def enqueue_process_and_index(self, file: UploadFile, user_id: str, background_tasks: BackgroundTasks) -> dict[str, Any]:
        temp_fd, temp_path = tempfile.mkstemp(suffix=".pdf")
        doc_id = str(uuid.uuid4())
        db = get_database()
        
        try:
            with os.fdopen(temp_fd, "wb") as f:
                while chunk := await file.read(1024 * 1024):  # 1MB chunks
                    f.write(chunk)
            
            document_metadata = {
                "_id": doc_id,
                "filename": file.filename,
                "user_id": user_id,
                "chunk_count": 0,
                "processed_chunks": 0,
                "created_at": datetime.now(timezone.utc),
                "status": "queued",
                "content_type": file.content_type,
                "chunk_ids": []
            }
            await db.documents.insert_one(document_metadata)
            
            background_tasks.add_task(self._process_pdf_background, doc_id, temp_path, file.filename)
            
            return {
                "id": doc_id,
                "filename": file.filename
            }
        except Exception:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except OSError:
                    pass
            try:
                await db.documents.delete_one({"_id": doc_id})
            except Exception:
                pass
            raise

    async def get_document_status(self, document_id: str) -> dict[str, Any]:
        db = get_database()
        doc = await db.documents.find_one({"_id": document_id}, {
            "filename": 1,
            "status": 1,
            "processed_chunks": 1,
            "chunk_count": 1,
            "created_at": 1,
            "error": 1
        })
        if doc and isinstance(doc.get("created_at"), datetime):
            doc["created_at"] = doc["created_at"].isoformat()
        return doc
        
    async def _process_pdf_background(self, doc_id: str, file_path: str, filename: str):
        db = get_database()
        all_uuids = []
        try:
            await db.documents.update_one({"_id": doc_id}, {"$set": {"status": "processing"}})
            
            loader = PyPDFLoader(file_path)
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            
            # Use lazy load to avoid OOM on massive PDFs
            pages = loader.lazy_load()
            
            batch_size = 50
            batch_texts = []
            total_chunks_processed = 0
            
            for page in pages:
                texts = text_splitter.split_documents([page])
                batch_texts.extend(texts)
                
                # Check if we should process a batch
                if len(batch_texts) >= batch_size:
                    uuids = [str(uuid.uuid4()) for _ in range(len(batch_texts))]
                    for i, text_chunk in enumerate(batch_texts):
                        text_chunk.metadata["source_filename"] = filename
                        text_chunk.metadata["chunk_id"] = uuids[i]
                    
                    # Run synchronous Chroma embedding and insert in a threadpool to prevent freezing FastAPI
                    await asyncio.to_thread(vector_store.add_documents, documents=batch_texts, ids=uuids)
                    
                    all_uuids.extend(uuids)
                    total_chunks_processed += len(batch_texts)
                    
                    # Checkpoint state to MongoDB
                    checkpoint_res = await db.documents.update_one(
                        {"_id": doc_id}, 
                        {
                            "$set": {"processed_chunks": total_chunks_processed},
                            "$push": {"chunk_ids": {"$each": uuids}}
                        }
                    )
                    if checkpoint_res.matched_count == 0:
                        raise Exception("Document was deleted mid-flight. Aborting.")
                    batch_texts = []
                    
            # Process remaining edge chunks
            if batch_texts:
                uuids = [str(uuid.uuid4()) for _ in range(len(batch_texts))]
                for i, text_chunk in enumerate(batch_texts):
                    text_chunk.metadata["source_filename"] = filename
                    text_chunk.metadata["chunk_id"] = uuids[i]
                
                await asyncio.to_thread(vector_store.add_documents, documents=batch_texts, ids=uuids)
                all_uuids.extend(uuids)
                total_chunks_processed += len(batch_texts)
                
                checkpoint_res = await db.documents.update_one(
                    {"_id": doc_id}, 
                    {
                        "$set": {"processed_chunks": total_chunks_processed},
                        "$push": {"chunk_ids": {"$each": uuids}}
                    }
                )
                if checkpoint_res.matched_count == 0:
                    raise Exception("Document was deleted mid-flight. Aborting.")
            
            # Mark completely done
            final_res = await db.documents.update_one(
                {"_id": doc_id}, 
                {"$set": {
                    "status": "processed", 
                    "processed_chunks": total_chunks_processed,
                    "chunk_count": total_chunks_processed
                }}
            )
            if final_res.matched_count == 0:
                raise Exception("Document was deleted mid-flight. Aborting.")

        except Exception as e:
            print(f"Background processing error: {e}")
            if all_uuids:
                try:
                    await asyncio.to_thread(vector_store.delete, ids=all_uuids)
                except Exception as cleanup_err:
                    print(f"Error cleaning up orphaned chunks: {cleanup_err}")
            await db.documents.update_one({"_id": doc_id}, {"$set": {"status": "failed", "error": str(e)}})
        finally:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as cleanup_error:
                print(f"Failed to clean up temp file: {cleanup_error}")

    async def get_all_documents(self) -> list[dict[str, Any]]:
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
