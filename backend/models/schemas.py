from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str = Field(..., alias="_id")
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
