
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, List
from database import Base, engine, get_db
from model import Portfolio
from pydantic import BaseModel
from datetime import datetime, timezone
app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware
from analytics import get_analytics
from routes import router as user_router, get_current_user
app.include_router(user_router)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://quantboard-f.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)
class PortfolioCreate(BaseModel):
    ticker: str
    shares: float
class Response(BaseModel):
    id: int
    ticker: str
    shares: float
    buy_price: float
    created_at: datetime
@app.post("/portfolio/")
def add_stock(data: PortfolioCreate, db: Session = Depends(get_db), user_id: int =  Depends(get_current_user)):
    current_price = get_analytics(data.ticker)
    stock = Portfolio(
        user_id=user_id,
        ticker=data.ticker,
        buy_price = float(current_price["current_price"]),
        shares=data.shares,
        created_at=datetime.now(timezone.utc)
    )
    db.add(stock)
    db.commit()
    db.refresh(stock)
    return stock
@app.get("/portfolio/", response_model=List[Response])
def get_portfolio(db: Session = Depends(get_db),user_id: int = Depends(get_current_user)):
    stocks = db.query(Portfolio).filter(Portfolio.user_id == user_id).all()
    if not stocks:
        raise HTTPException(status_code=404, detail="No portfolio found for this user")
    return stocks
@app.get("/")
def root():
    return {"message": "QuantBoard API is running"}

@app.get("/analytics/{ticker}")
def analytics(ticker: str):
    return get_analytics(ticker) 
