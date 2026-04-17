import asyncio
from models.database import get_database, connect_to_mongo, close_mongo_connection
from services.bedrock_service import vector_store

async def reset_documents():
    await connect_to_mongo()
    try:
        db = get_database()
        
        # 1. Find processed documents to clean up their vectors first
        cursor = db.documents.find({"status": "processed"})
        docs = await cursor.to_list(length=None)
        
        for doc in docs:
            chunk_ids = doc.get("chunk_ids", [])
            if chunk_ids:
                try:
                    vector_store.delete(ids=chunk_ids)
                    print(f"Deleted {len(chunk_ids)} chunks from ChromaDB for document {doc.get('filename', doc['_id'])}.")
                except Exception as e:
                    print(f"Warning: Failed to delete chunks for {doc.get('filename')}: {e}")

        # 2. Reset the database statuses and clear the metadata
        result = await db.documents.update_many(
            {"status": "processed"},
            {"$set": {
                "status": "uploaded",
                "chunk_ids": [],
                "chunk_count": 0,
                "processed_chunks": 0
            }}
        )
        print(f"Reset {result.modified_count} documents to 'uploaded' state and cleared their metadata.")
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(reset_documents())