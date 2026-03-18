import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def run():
    client = AsyncIOMotorClient("mongodb+srv://jony:jony123@veridoccluster.2wfphpm.mongodb.net/?appName=veridocCluster")
    db = client["veridoc"]
    users = await db.users.find().to_list(length=10)
    print("USERS:", [u.get("email") for u in users])
    chats = await db.chats.find().to_list(length=10)
    print("CHATS:", len(chats))
    
if __name__ == "__main__":
    asyncio.run(run())
