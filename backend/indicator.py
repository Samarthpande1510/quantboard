
def get_rsi(df, period: int):
    delta = df["Close"].diff()
    gain = delta.clip(lower=0)         
    loss = -delta.clip(upper=0) 
    avg_gain = gain.rolling(period).mean()  
    avg_loss = loss.rolling(period).mean() 
    rs = avg_gain/avg_loss
    rsi = 100 - (100/(1+rs))
    return float(rsi.iloc[-1]) 

def calculate_mcd(df):
    ema_12 = df['Close'].ewm(span=12).mean()
    ema_26 = df['Close'].ewm(span=26).mean()
    macd_line = ema_12 - ema_26
    signal_line = macd_line.ewm(span=9).mean()  
    return float(macd_line.iloc[-1]), float(signal_line.iloc[-1]) 

def moving_avg(df):
    moving_avg50 = df['Close'].rolling(50).mean().iloc[-1]
    moving_avg200 = df['Close'].rolling(200).mean().iloc[-1]
    return float(moving_avg50), float(moving_avg200)


def get_summary(analytics: dict):
    df = analytics["df"]
    macd, signal = calculate_mcd(df)
    ma50, ma200 = moving_avg(df)
    summary = {
        "ticker": analytics["ticker"],
        "current_price": analytics["current_price"],
        "price_change_pct": float(df['Close'].pct_change().iloc[-1] * 100),
        "rsi": get_rsi(df, period=14),
        "macd": macd,
        "macd_signal": signal,
        "ma50": ma50,
        "ma200": ma200,
        "volume": int(df['Volume'].iloc[-1]),
        "avg_volume": int(df['Volume'].mean()),
        "sharpe_ratio": analytics["sharpe_ratio"],
        "volatility": analytics["volatility"],
        "max_drawdown": analytics["max_drawdown"],
        "signal": analytics["signal"],
    }
    analytics.pop("df", None)
    return summary