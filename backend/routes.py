from sqlalchemy.orm import declarative_base, Session
from fastapi import APIRouter, HTTPException, Depends
from database import get_db
from pydantic import BaseModel
from auth import hash_password, verify, createToken, decode
from model import User
from fastapi.security import OAuth2PasswordBearer
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

class SignupRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
   existing = db.query(User).filter(User.email == data.email).first()
   if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
   user = User(email = data.email, hashed_password = hash_password(data.password))
   db.add(user)
   db.commit()
   db.refresh(user)
   return {"message": "Account created", "user_id": user.id}


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if not existing or not verify(data.password, existing.hashed_password):
        raise HTTPException(status_code=401, detail="Either the Email or the Password is Invalid!")
    token = createToken({"user_id": existing.id, "email": existing.email})
    return {"token": token, "user_id": existing.id}


def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload["user_id"]