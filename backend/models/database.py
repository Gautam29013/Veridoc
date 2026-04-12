from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URL, DATABASE_NAME

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_connection = Database()

async def connect_to_mongo():
    db_connection.client = AsyncIOMotorClient(MONGODB_URL)
    db_connection.db = db_connection.client[DATABASE_NAME]
    print(f"Connected to MongoDB at {MONGODB_URL}")

async def close_mongo_connection():
    if db_connection.client: 
        db_connection.client.close()
        print("MongoDB connection closed")

def get_database():
    return db_connection.db
