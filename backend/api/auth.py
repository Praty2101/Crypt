"""
Authentication API Router
JWT-based authentication endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

from config import settings


router = APIRouter()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


class UserCreate(BaseModel):
    """User registration model"""
    email: EmailStr
    password: str
    name: str


class UserResponse(BaseModel):
    """User response model"""
    id: str
    email: str
    name: str
    created_at: datetime
    is_active: bool


class Token(BaseModel):
    """Token response model"""
    access_token: str
    token_type: str
    expires_in: int


class TokenData(BaseModel):
    """Token data model"""
    user_id: Optional[str] = None
    email: Optional[str] = None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.jwt_secret_key, 
        algorithm=settings.jwt_algorithm
    )
    return encoded_jwt


async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> str:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
    
    try:
        payload = jwt.decode(
            token, 
            settings.jwt_secret_key, 
            algorithms=[settings.jwt_algorithm]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return user_id
    except JWTError:
        raise credentials_exception


async def get_optional_user(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[str]:
    """Get current user if authenticated, otherwise return None"""
    if not token:
        return None
    
    try:
        payload = jwt.decode(
            token, 
            settings.jwt_secret_key, 
            algorithms=[settings.jwt_algorithm]
        )
        return payload.get("sub")
    except JWTError:
        return None


@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    """Register a new user"""
    # In a real app, you would:
    # 1. Check if email already exists
    # 2. Hash the password
    # 3. Store in database
    
    # Mock response for now
    return {
        "id": "user_123",
        "email": user.email,
        "name": user.name,
        "created_at": datetime.now(),
        "is_active": True
    }


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and get access token"""
    # In a real app, you would:
    # 1. Verify user exists
    # 2. Verify password
    # 3. Generate token
    
    # For demo, accept any credentials
    access_token = create_access_token(
        data={"sub": "user_123", "email": form_data.username}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.access_token_expire_minutes * 60
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(user_id: str = Depends(get_current_user)):
    """Get current user information"""
    # In a real app, fetch from database
    return {
        "id": user_id,
        "email": "user@example.com",
        "name": "Demo User",
        "created_at": datetime.now(),
        "is_active": True
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(user_id: str = Depends(get_current_user)):
    """Refresh access token"""
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.access_token_expire_minutes * 60
    }


@router.post("/logout")
async def logout():
    """Logout (client-side token removal)"""
    return {"message": "Successfully logged out"}
