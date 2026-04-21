from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import asyncio
import uuid

from services.bedrock_service import get_bedrock_response, vector_store
from models.database import get_database
from utils.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    chat_id: Optional[str] = None
    history: Optional[List[ChatMessage]] = []

class ChatRecord(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    title: str
    updated_at: datetime

class ChatUpdate(BaseModel):
    title: Optional[str] = None
    is_pinned: Optional[bool] = None

@router.get("")
async def get_recent_chats(current_user: dict = Depends(get_current_user)):
    try:
        db = get_database()
        # Sort by is_pinned (descending) then updated_at (descending)
        cursor = db.chats.find({"user_id": current_user["_id"]}).sort([("is_pinned", -1), ("updated_at", -1)]).limit(20)
        chats = await cursor.to_list(length=20)
        # Format for frontend
        return [{
            "id": c["_id"], 
            "title": c.get("title", "Untitled Chat"), 
            "updated_at": c["updated_at"],
            "is_pinned": c.get("is_pinned", False)
        } for c in chats]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{chat_id}")
async def get_chat_history(chat_id: str, current_user: dict = Depends(get_current_user)):
    try:
        db = get_database()
        chat = await db.chats.find_one({"_id": chat_id, "user_id": current_user["_id"]})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        return {
            "id": chat["_id"], 
            "title": chat.get("title", "Untitled Chat"), 
            "is_pinned": chat.get("is_pinned", False),
            "messages": chat.get("messages", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{chat_id}")
async def update_chat(chat_id: str, update: ChatUpdate, current_user: dict = Depends(get_current_user)):
    try:
        db = get_database()
        update_data = {k: v for k, v in update.dict().items() if v is not None}
        if not update_data:
            return {"status": "no changes"}
        
        result = await db.chats.update_one(
            {"_id": chat_id, "user_id": current_user["_id"]},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Chat not found")
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
async def chat_endpoint(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    try:
        db = get_database()
        chat_id = request.chat_id
        is_new_chat = False

        if not chat_id:
            chat_id = str(uuid.uuid4())
            is_new_chat = True
            # Title is first message abbreviated
            title = request.message[:30] + "..." if len(request.message) > 30 else request.message
            new_chat = {
                "_id": chat_id,
                "user_id": current_user["_id"],
                "title": title,
                "updated_at": datetime.utcnow(),
                "messages": []
            }
            await db.chats.insert_one(new_chat)
        
        # We can still rely on the client passing the current history, or load it from DB.
        # It's safer to load from DB to ensure integrity, but we'll use what the client passed
        # for Bedrock context just as before to keep compatibility.
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history]
        
        # Compute global document status counts for the shared knowledge base.
        status_counts = {}
        async for doc in db.documents.aggregate([
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]):
            status_counts[doc["_id"]] = doc["count"]
        total_docs = sum(status_counts.values())
        processed_docs = status_counts.get("processed", 0)
        processing_docs = status_counts.get("queued", 0) + status_counts.get("processing", 0)
        failed_docs = status_counts.get("failed", 0)
        vector_count = await asyncio.to_thread(vector_store._collection.count)

        # User message dict
        user_msg = {
            "id": str(uuid.uuid4()),
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().strftime("%I:%M %p")
        }

        # Save user message to DB
        await db.chats.update_one(
            {"_id": chat_id, "user_id": current_user["_id"]},
            {
                "$push": {"messages": user_msg},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )

        # Short-circuit with clearer system-state messages before hitting retrieval.
        if total_docs == 0:
            response_text = (
                "No documents have been uploaded to the knowledge base yet. "
                "Upload a PDF from the admin panel before starting a document chat."
            )
        elif processed_docs > 0 and vector_count == 0:
            response_text = (
                "Your document metadata exists in MongoDB, but the Docker vector store is empty. "
                "This usually means the PDFs were processed in a different environment, or the Chroma volume was reset. "
                "Re-upload the PDFs from the admin panel in this Docker instance so they can be embedded again."
            )
        elif processed_docs == 0 and processing_docs > 0:
            response_text = (
                f"Your documents are still being processed ({processing_docs} in queue). "
                "Please wait a moment and try again once processing is complete."
            )
        elif processed_docs == 0 and failed_docs > 0:
            response_text = (
                f"Some documents failed to process ({failed_docs} failed). "
                "Check the upload status in the admin panel, then re-upload them and try again."
            )
        else:
            response_text = await asyncio.to_thread(get_bedrock_response, request.message, history_dicts)

        bot_msg = {
            "id": str(uuid.uuid4()),
            "role": "assistant",
            "content": response_text,
            "timestamp": datetime.now().strftime("%I:%M %p")
        }

        # Save bot message to DB
        await db.chats.update_one(
            {"_id": chat_id, "user_id": current_user["_id"]},
            {
                "$push": {"messages": bot_msg},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )

        return {
            "response": response_text,
            "chat_id": chat_id,
            "title": request.message[:30] + "..." if len(request.message) > 30 else request.message if is_new_chat else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{chat_id}")
async def delete_chat(chat_id: str, current_user: dict = Depends(get_current_user)):
    try:
        db = get_database()
        result = await db.chats.delete_one({"_id": chat_id, "user_id": current_user["_id"]})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Chat not found")
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
