from sqlalchemy import Column, Integer, Boolean, String, Float, DateTime
from database import Base
from datetime import datetime

class Portfolio(Base):
    __tablename__ = "Portfolio"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    ticker = Column(String)
    shares = Column(Integer)
    buy_price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    
class User(Base):
    __tablename__ = "User"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)