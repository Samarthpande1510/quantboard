import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timezone, timedelta
from model import Analysis, Portfolio
from fastapi import APIRouter, HTTPException, Security, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from database import get_db
from groq import Groq
import os
from sqlalchemy.orm import Session
from auth import decode
import json
from indicator import get_summary
from news import get_news
router = APIRouter()
security= HTTPBearer()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
  
def get_analytics(ticker: str):
    dat = yf.Ticker(ticker)
    df = dat.history(period="1y")
    
    if df.empty:
        raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found")
    
    df['daily_return'] = df['Close'].pct_change()
    volatility = df['daily_return'].std()
    risk_fac_daily = 0.0534 / 252
    sharpe = ((df['daily_return'].mean() - risk_fac_daily) / volatility) * (252**0.5)
    
    peak = df['Close'].cummax()
    max_drawdown = ((df['Close'] - peak) / peak).min()
    
    ma7 = df['Close'].rolling(7).mean().iloc[-1]
    ma30 = df['Close'].rolling(30).mean().iloc[-1]
    signal = "Bullish" if ma7 > ma30 else "Bearish"
    
    historical_dict = {
    str(k.date()): round(float(v), 2) 
    for k, v in df['Close'].to_dict().items()
}
    
    return {
        "df": df,
        "ticker": ticker,
        "current_price": round(df['Close'].iloc[-1], 2),
        "high_30" : round(df['Close'].max(), 2),
        "low_30" : round(df['Close'].min(), 2),
        "volatility": round(volatility, 4),
        "sharpe_ratio": round(sharpe, 4),
        "max_drawdown": round(max_drawdown, 4),
        "signal": signal,
        "historical_prices": historical_dict
    }

@router.get("/analytics/{ticker}")
def analyze(ticker: str,db: Session = Depends(get_db),credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    payload = decode(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid Token")
    user_id = payload["user_id"]
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    cached = db.query(Analysis).filter(Analysis.ticker == ticker.upper(),Analysis.user_id == user_id,Analysis.created_at > one_hour_ago).first()
    if cached:
        return {
            "cached": True,
            "recommendation": cached.recommendation,
            "sentiment": cached.sentiment,
            "confidence": cached.confidence,
            "insights": json.loads(cached.insights),
            "risks": json.loads(cached.risks),
            "summary": cached.analysis_text,
            "price_at_analysis": cached.price_at_analysis,
            "created_at": cached.created_at
        }
    
    analytics = get_analytics(ticker=ticker.upper())
    summary = get_summary(analytics=analytics)
    news = get_news(ticker=ticker.upper())
    rsi = summary["rsi"]
    if rsi > 70:
        rsi_note = "overbought"
    elif rsi < 30:
        rsi_note = "oversold"
    else:
        rsi_note = "neutral"

    if summary["ma50"] > summary["ma200"]:
        ma_note = "golden cross — bullish"
    else:
        ma_note = "death cross — bearish"
    
    macd = summary["macd"]
    macd_signal = summary["macd_signal"]

    if macd > 0 and macd > macd_signal:
        macd_note = "bullish — above zero and above signal line"
    elif macd > 0 and macd < macd_signal:
        macd_note = "weakening — above zero but losing momentum"
    elif macd < 0 and macd < macd_signal:
        macd_note = "bearish — below zero and below signal line"
    else:
        macd_note = "recovering — below zero but crossing signal line"
    news_str = "\n".join([
        f"{i+1}. {n['title']} ({n['source']})"
        for i, n in enumerate(news)
    ]) if news else "No recent news available"

    prompt = f"""You are a senior financial analyst at a quantitative hedge fund.
Analyze the following data for {ticker} and provide a structured recommendation.

TECHNICAL DATA:
- Current Price: ${summary["current_price"]}
- RSI (14): {rsi} → {rsi_note}
- MACD: {summary["macd"]}, Signal: {summary["macd_signal"]} → {macd_note }  
- 50d MA: ${summary["ma50"]}, 200d MA: ${summary["ma200"]} → {ma_note}
- Sharpe Ratio: {summary["sharpe_ratio"]}
- Max Drawdown: {summary["max_drawdown"]}
- Volatility: {summary["volatility"]}

RECENT NEWS:
{news_str}
...

Based on this data, respond ONLY with valid JSON:
{{
  "recommendation": "BUY" or "HOLD" or "SELL",
  "confidence": 1-10,
  "sentiment": "BULLISH" or "BEARISH" or "NEUTRAL",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "risks": ["risk 1", "risk 2"],
  "summary": "2-3 sentence explanation of your reasoning"
}}"""
    responce = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a senior financial analyst. Always respond with valid JSON only, no markdown, no extra text."
            },
            {
                "role": "user", 
                "content": prompt  
            }
        ],
        temperature=0.3,  
        max_tokens=1000
    )

    result = json.loads(responce.choices[0].message.content)
    

    analysis_record = Analysis(
        ticker=ticker.upper(),
        user_id=user_id,
        recommendation=result["recommendation"],
        sentiment=result["sentiment"],
        confidence=int(result["confidence"]),
        analysis_text=result["summary"],
        insights=json.dumps(result["insights"]),
        risks=json.dumps(result["risks"]),
        price_at_analysis=float(summary["current_price"]) 
    )
    db.add(analysis_record)
    db.commit()
    
    raw_response = {
        "cached": False,
        "recommendation": result["recommendation"],
        "sentiment": result["sentiment"],
        "confidence": result["confidence"],
        "insights": result["insights"],
        "risks": result["risks"],
        "summary": result["summary"],
        "price_at_analysis": summary["current_price"],
        "technical": summary,
        "news": news
    }

    return raw_response