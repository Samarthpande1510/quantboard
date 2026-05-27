import random
import requests
import yfinance as yf
import pandas as pd
from fastapi import HTTPException

def get_safe_ticker(ticker: str) -> yf.Ticker:
    """
    Creates a yfinance Ticker instance equipped with a randomized browser
    session header to prevent Render IPs from getting instantly rate limited.
    """
    USER_AGENTS = [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ]
    
    session = requests.Session()
    session.headers.update({"User-Agent": random.choice(USER_AGENTS)})
    return yf.Ticker(ticker, session=session)

def get_analytics(ticker: str):
    dat = get_safe_ticker(ticker)
    
    try:
        df = dat.history(period="3mo")
    except Exception:
        raise HTTPException(
            status_code=503, 
            detail="Yahoo Finance is temporarily throttling requests. Please try again shortly."
        )
    
    if df.empty:
        raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found")
    
    df['daily_return'] = df['Close'].pct_change()
    volatility = df['daily_return'].std()
    risk_fac_daily = 0.0534 / 252
    
    if volatility == 0 or pd.isna(volatility):
        sharpe = 0.0
    else:
        sharpe = ((df['daily_return'].mean() - risk_fac_daily) / volatility) * (252**0.5)
    
    peak = df['Close'].cummax()
    max_drawdown = ((df['Close'] - peak) / peak).min()
    
    ma7 = df['Close'].rolling(7).mean().iloc[-1]
    ma30 = df['Close'].rolling(30).mean().iloc[-1]
    signal = "Bullish" if ma7 > ma30 else "Bearish"
    
    #
    historical_dict = {str(k).split()[0]: round(v, 2) for k, v in df['Close'].to_dict().items()}
    
    return {
        "ticker": ticker.upper(),
        "current_price": round(df['Close'].iloc[-1], 2),
        "high_30" : round(df['Close'].max(), 2),
        "low_30" : round(df['Close'].min(), 2),
        "volatility": round(volatility, 4) if not pd.isna(volatility) else 0.0,
        "sharpe_ratio": round(sharpe, 4) if not pd.isna(sharpe) else 0.0,
        "max_drawdown": round(max_drawdown, 4) if not pd.isna(max_drawdown) else 0.0,
        "signal": signal,
        "historical_prices": historical_dict
    }

def validate(ticker: str):
    dat = get_safe_ticker(ticker)
    
    try:
        df = dat.history(period="3mo")
        
      
        try:
            has_no_peg = dat.info.get('trailingPegRatio') is None
        except Exception:
            has_no_peg = True  
            
        if has_no_peg and df.empty:
            raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found")
        
        current_price = df['Close'].iloc[-1]
        return current_price
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=503, 
            detail="Market engine rate limited by provider. Please try again shortly."
        )