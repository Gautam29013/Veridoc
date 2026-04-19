import asyncio
from models.database import get_database, connect_to_mongo, close_mongo_connection
from services.bedrock_service import vector_store

async def reset_documents():
    await connect_to_mongo()
    try:
        db = get_database()

        # 1. Find processed documents to clean up their vectors first
        cursor = db.documents.find({"status": "processed"})

        reset_count = 0
        timeout_count = 0
        async for doc in cursor:
            chunk_ids = doc.get("chunk_ids", [])
            state = "success"
            
            if chunk_ids:
                try:
                    await asyncio.wait_for(
                        asyncio.to_thread(vector_store.delete, ids=chunk_ids),
                        timeout=30.0
                    )
                    print(f"Deleted {len(chunk_ids)} chunks from ChromaDB for document {doc.get('filename', doc['_id'])}.")
                except asyncio.TimeoutError:
                    print(f"Warning: Deletion timed out for {doc.get('filename')}. Marking as unknown state.")
                    state = "timeout"
                except Exception as e:
                    print(f"Warning: Failed to delete chunks for {doc.get('filename')}: {e}")
                    state = "failed"

            if state == "success":
                await db.documents.update_one(
                    {"_id": doc["_id"]},
                    {"$set": {
                        "status": "uploaded",
                        "chunk_ids": [],
                        "chunk_count": 0,
                        "processed_chunks": 0
                    }}
                )
                reset_count += 1
            elif state == "timeout":
                await db.documents.update_one(
                    {"_id": doc["_id"]},
                    {"$set": {"status": "cleanup_timeout"}}
                )
                timeout_count += 1

        print(f"Reset {reset_count} documents to 'uploaded' state.")
        if timeout_count > 0:
            print(f"Flagged {timeout_count} documents as 'cleanup_timeout' due to hanging deletions.")
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(reset_documents())