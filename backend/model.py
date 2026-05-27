from sqlalchemy import Column, Integer, Boolean, String, Float, DateTime, Text, ForeignKey
from database import Base
from datetime import datetime, timezone

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

class Analysis(Base):
    __tablename__ = "analyses"
    id = Column(Integer, primary_key=True)
    ticker = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("User.id"))
    recommendation = Column(String)
    sentiment = Column(String)
    confidence = Column(Integer)
    analysis_text = Column(Text)
    insights = Column(Text)
    risks = Column(Text)
    price_at_analysis = Column(Float)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


