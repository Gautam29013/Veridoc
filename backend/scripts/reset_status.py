import asyncio
from models.database import get_database

async def reset_documents():
    db = get_database()
    result = await db.documents.update_many(
        {"status": "processed"},
        {"$set": {"status": "uploaded"}}
    )
    print(f"Reset {result.modified_count} documents to 'uploaded' state.")

if __name__ == "__main__":
    asyncio.run(reset_documents())