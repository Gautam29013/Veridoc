from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from backend.api.auth_routes import verify_token
from backend.services.document_service import document_service


router = APIRouter(prefix="/api/v1/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(verify_token),
):
    """Upload and index a document (stub implementation)."""
    try:
        info = await document_service.process_and_index(file=file, user_id=current_user["user_id"])
        return {
            "status": "success",
            "document_id": info["id"],
            "chunks_created": info["chunk_count"],
        }
    except Exception as exc:  # pragma: no cover - placeholder
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/list")
async def list_documents(current_user: dict = Depends(verify_token)):
    """List documents for the current user (stub)."""
    docs = document_service.get_user_documents(current_user["user_id"])
    return {"user_id": current_user["user_id"], "documents": docs}


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: dict = Depends(verify_token),
):
    """Delete a document for the current user (stub)."""
    ok = document_service.delete_document(document_id=document_id, user_id=current_user["user_id"])
    if not ok:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": "success"}

