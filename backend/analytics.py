import yfinance as yf
import pandas as pd
from fastapi import FastAPI, HTTPException

app = FastAPI()

def get_analytics(ticker: str):
    dat = yf.Ticker(ticker)
    df = dat.history(period="3mo")
    
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
    
    historical_dict = {str(k): round(v, 2) for k, v in df['Close'].to_dict().items()}
    
    return {
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

@app.get("/analytics/{ticker}")
def analytics(ticker: str):
    return get_analytics(ticker)