from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, BackgroundTasks

from api.auth_routes import get_current_user
from services.document_service import document_service

router = APIRouter(prefix="/documents", tags=["documents"])

async def verify_admin(current_user: dict = Depends(get_current_user)):
    """Dependency to check if the current user is an admin."""
    if current_user.get("role", "user") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform this operation")
    return current_user

@router.post("/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    admin_user: dict = Depends(verify_admin),
):
    """Upload and queue a document for indexing into ChromaDB."""
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
         raise HTTPException(status_code=400, detail="Only PDF files are supported.")
         
    try:
        info = await document_service.enqueue_process_and_index(
            file=file, 
            user_id=admin_user["_id"],
            background_tasks=background_tasks
        )
        return {
            "status": "processing",
            "document_id": info["id"],
            "filename": info["filename"],
            "message": "Document is processing in the background."
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Internal server error while processing the document.")

@router.get("/{document_id}/status")
async def get_document_status(document_id: str, admin_user: dict = Depends(verify_admin)):
    """Check the processing status of a document."""
    status_info = await document_service.get_document_status(document_id)
    if not status_info:
        raise HTTPException(status_code=404, detail="Document not found")
    return status_info

@router.get("/list")
async def list_documents(admin_user: dict = Depends(verify_admin)):
    """List all indexed documents to the admin."""
    docs = await document_service.get_all_documents()
    return {"user_id": admin_user["_id"], "documents": docs}

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    admin_user: dict = Depends(verify_admin),
):
    """Delete a document for the current user."""
    ok = await document_service.delete_document(document_id=document_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": "success"}
