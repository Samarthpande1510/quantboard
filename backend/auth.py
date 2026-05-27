from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

SECRET_KEY = os.getenv("SECRET_KEY","a-secret-key-atleast-128-bits-long")
ALGORITHM = "HS256"
ACCESS_TOKENS_EXPIRE_MINUTES = 60*24

pwd_context = CryptContext(schemes=["bcrypt"],deprecated ="auto")

def hash_password(password:str):
    return pwd_context.hash(password)

def verify(plain:str, hashed:str) -> str:
    return pwd_context.verify(plain,hashed)

def createToken(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKENS_EXPIRE_MINUTES)
    return jwt.encode(payload,SECRET_KEY,algorithm=ALGORITHM)

def decode(token:str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
     