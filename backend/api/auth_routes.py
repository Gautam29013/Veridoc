from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
import cloudinary
import cloudinary.uploader
from models.schemas import UserCreate, UserLogin, UserResponse, Token, SignupResponse, GoogleLogin, UserUpdate
from models.database import get_database
from utils.auth import get_password_hash, verify_password, create_access_token, get_current_user
from config import GOOGLE_CLIENT_ID, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
from datetime import datetime
import uuid
from google.oauth2 import id_token
from google.auth.transport import requests

router = APIRouter(prefix="/auth", tags=["authentication"])

# Cloudinary Configuration
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

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
    user_dict["role"] = "user"
    user_dict["created_at"] = datetime.utcnow()
    
    await db.users.insert_one(user_dict)
    
    # Generate token for immediate login
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "user": user_dict,
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/login", response_model=SignupResponse)
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
    return {
        "user": user,
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/google", response_model=SignupResponse)
async def google_auth(data: GoogleLogin):
    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(data.token, requests.Request(), GOOGLE_CLIENT_ID)
        
        email = idinfo['email']
        full_name = idinfo.get('name')
        picture_url = idinfo.get('picture')
        
        db = get_database()
        
        # Check if user exists
        user = await db.users.find_one({"email": email})
        
        if not user:
            # Create new user if they don't exist
            user = {
                "_id": str(uuid.uuid4()),
                "email": email,
                "full_name": full_name,
                "picture_url": picture_url,
                "is_google_user": True,
                "role": "user",
                "created_at": datetime.utcnow()
            }
            await db.users.insert_one(user)
        else:
            # Update picture if it's missing or changed
            await db.users.update_one(
                {"email": email},
                {"$set": {"picture_url": picture_url, "full_name": full_name}}
            )
            user = await db.users.find_one({"email": email})
        
        access_token = create_access_token(data={"sub": email})
        
        return {
            "user": user,
            "access_token": access_token,
            "token_type": "bearer"
        }
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_me(user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    update_data = user_update.model_dump(exclude_unset=True)
    if not update_data:
        return current_user
        
    await db.users.update_one(
        {"email": current_user["email"]},
        {"$set": update_data}
    )
    
    updated_user = await db.users.find_one({"email": current_user["email"]})
    return updated_user

@router.post("/upload-photo")
async def upload_photo(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        # Check if file is an image
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image.")
            
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file.file,
            folder="veridoc/profiles",
            public_id=f"user_{current_user['_id']}",
            overwrite=True,
            resource_type="image"
        )
        
        picture_url = upload_result.get("secure_url")
        if not picture_url:
            raise Exception("Cloudinary upload failed")
            
        # Update user record
        db = get_database()
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {"picture_url": picture_url}}
        )
        
        return {"picture_url": picture_url}
        
    except Exception as e:
        print(f"Error uploading to Cloudinary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )
