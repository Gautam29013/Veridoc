from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from api.auth_routes import get_current_user
from services.document_service import document_service

router = APIRouter(prefix="/documents", tags=["documents"])

async def verify_admin(current_user: dict = Depends(get_current_user)):
    """Dependency to check if the current user is an admin."""
    if current_user.get("role", "user") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to perform this operation")
    return current_user

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    admin_user: dict = Depends(verify_admin),
):
    """Upload and index a document into ChromaDB automatically."""
    try:
        # Validate file type
        if not file.filename.lower().endswith(".pdf"):
             raise HTTPException(status_code=400, detail="Only PDF files are supported.")
             
        info = await document_service.process_and_index(file=file, user_id=admin_user["_id"])
        return {
            "status": "success",
            "document_id": info["id"],
            "filename": info["filename"],
            "chunks_created": info["chunk_count"],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

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
