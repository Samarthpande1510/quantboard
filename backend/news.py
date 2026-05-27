import os
import requests
from dotenv import load_dotenv

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")

def get_news(ticker: str):
    if not NEWS_API_KEY:
        print("Error: NEWS_API_KEY is missing from environment variables.")
        return []
        
    try:
        url = "https://newsapi.org/v2/everything" 
        params = {
            "q": ticker,
            "sortBy": "publishedAt",
            "pageSize": 5,
            "apiKey": NEWS_API_KEY,
            "language": "en"
        }   
        response = requests.get(url, params=params)
        data = response.json()
        
        if data.get("status") != "ok":
            print(f"API Error Status: {data.get('status')} | Message: {data.get('message')}")
            return []
            
        articles = data.get("articles", [])
        return [
            {
                "title": a["title"],
                "source": a["source"]["name"],  
                "published_at": a["publishedAt"] 
            }
            for a in articles
        ]
    except Exception as e:
        print(f"Request failed: {e}")
        return []

if __name__ == "__main__":
    test_ticker = "msft"
    print(f"Testing fetch for: {test_ticker}")
    results = get_news(test_ticker)
    print(NEWS_API_KEY)
    print(f"Total articles retrieved: {len(results)}")
    for item in results:
        print(f"- {item['title']} [{item['source']}]")

