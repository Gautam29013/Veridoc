from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    picture_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    picture_url: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLogin(BaseModel):
    token: str

class UserResponse(UserBase):
    id: str = Field(..., alias="_id")
    bio: Optional[str] = None
    phone: Optional[str] = None
    is_google_user: bool = False
    role: str = "user"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class Token(BaseModel):
    access_token: str
    token_type: str

class SignupResponse(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class DocumentResponse(BaseModel):
    id: str = Field(..., alias="_id")
    filename: str
    chunk_count: int
    uploaded_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
