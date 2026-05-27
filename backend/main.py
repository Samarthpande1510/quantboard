
from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from auth import decode
from sqlalchemy.orm import Session
from typing import Optional, List
from database import Base, engine, get_db
from model import Portfolio
from pydantic import BaseModel
from datetime import datetime, timezone
app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware
from analytics import get_analytics
from routes import router as user_router
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
security = HTTPBearer()
@app.post("/portfolio/")
def add_stock(data: PortfolioCreate, db: Session = Depends(get_db),credentials: HTTPAuthorizationCredentials = Security(security)):
    current_price = get_analytics(data.ticker)
    token = credentials.credentials
    payload = decode(token)
    if not payload:
        raise HTTPException(status_code=401,detail="Invalid token")
    user_id = payload["user_id"]
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

@app.get("/portfolio/")
def get_portfolio(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    token = credentials.credentials
    payload = decode(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    user_id = payload["user_id"]
    user_positions = db.query(Portfolio).filter(Portfolio.user_id == user_id).all()
    if not user_positions:
        raise HTTPException(status_code=404, detail="No portfolio found for this user")
        
    response_list = []
    
    for position in user_positions:
        current_price = float(position.buy_price)
        
        try:
            analytics_payload = get_analytics(position.ticker)
            current_price = float(analytics_payload["current_price"])
        except Exception:
            pass 
        stock_data = {
            "id": position.id,
            "ticker": position.ticker.upper(),
            "shares": float(position.shares),
            "buy_price": float(position.buy_price),
            "current_price": current_price,
            "pnl": round(float((current_price - position.buy_price) * position.shares), 2),
            "created_at": position.created_at
        }
        response_list.append(stock_data) 
        
    return response_list
@app.get("/")
def root():
    return {"message": "QuantBoard API is running"}

@app.delete("/portfolio/{port_id}")
def delete(port_id:int ,credentials: HTTPAuthorizationCredentials = Security(security),db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = decode(token)
    if not payload:
        raise HTTPException(status_code=401,detail="Invalid token")
    user_id = payload["user_id"]
    port = db.query(Portfolio).filter(Portfolio.id == port_id).first()
    if not port:
        raise HTTPException(status_code=403, detail="No such portfolio")
    db.delete(port)
    db.commit()
    return {"message": "Position deleted successfully", "id": port_id}

@app.delete("/portfolio/{port_id}")
@app.get("/analytics/{ticker}")
def analytics(ticker: str):
    return get_analytics(ticker) 
