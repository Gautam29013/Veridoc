from fastapi import APIRouter, HTTPException, Depends, status
from backend.models.schemas import UserCreate, UserLogin, UserResponse, Token, SignupResponse
from backend.models.database import get_database
from backend.utils.auth import get_password_hash, verify_password, create_access_token
from datetime import datetime
import uuid

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup", response_model=SignupResponse)
async def signup(user: UserCreate):
    db = get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_dict = user.model_dump()
    user_dict["password"] = get_password_hash(user_dict["password"])
    user_dict["_id"] = str(uuid.uuid4())
    user_dict["created_at"] = datetime.utcnow()
    
    await db.users.insert_one(user_dict)
    
    # Generate token for immediate login
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "user": user_dict,
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    db = get_database()
    
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}
