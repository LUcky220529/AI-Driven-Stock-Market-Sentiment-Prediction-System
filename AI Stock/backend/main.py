from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from transformers import pipeline
import requests
import numpy as np
import tensorflow as tf
import joblib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INITIALIZATION ---
NEWS_API_KEY = "" # Paste your API key 
print("Loading FinBERT Model...")
sentiment_pipeline = pipeline("sentiment-analysis", model="ProsusAI/finbert")

print("Loading LSTM Model and Scaler...")
try:
    lstm_model = tf.keras.models.load_model('lstm_model.h5')
    scaler = joblib.load('scaler.gz')
    print("AI Models Loaded Successfully!")
except Exception as e:
    print(f"Warning: Could not load LSTM model. Did you run train_lstm.py? Error: {e}")


@app.get("/predict/{ticker}")
async def predict_stock(ticker: str):
    try:
        # 1. Fetch Price Data for the Chart
        stock = yf.Ticker(ticker)
        hist = stock.history(period="7d")
        prices = hist['Close'].tolist()
        dates = hist.index.strftime('%a').tolist()
        chart_data = [{"day": d, "price": round(p, 2)} for d, p in zip(dates, prices)]
        current_price = chart_data[-1]["price"] if chart_data else 0

        # 2. Fetch LIVE News from NewsAPI
        url = f"https://newsapi.org/v2/everything?q={ticker} stock&language=en&sortBy=publishedAt&pageSize=5&apiKey={NEWS_API_KEY}"
        news_response = requests.get(url).json()
        
        live_headlines = []
        if news_response.get("status") == "ok":
            articles = news_response.get("articles", [])
            live_headlines = [article["title"] for article in articles if article["title"]]
        
        if not live_headlines:
            live_headlines = [f"{ticker} trading volume remains steady."] # Fallback if no news

        # 3. AI Sentiment Analysis (FinBERT on Live News)
        sentiments = sentiment_pipeline(live_headlines)
        pos_score = sum([s['score'] for s in sentiments if s['label'] == 'positive'])
        neg_score = sum([s['score'] for s in sentiments if s['label'] == 'negative'])
        
        final_sentiment = "Positive" if pos_score >= neg_score else "Negative"
        confidence = max(pos_score, neg_score) / len(live_headlines)

        # 4. LSTM Price Prediction (Real Model)
        # Fetch the last 60 days of data to make tomorrow's prediction
        hist_60 = stock.history(period="60d")
        last_60_days = hist_60['Close'].values.reshape(-1, 1)
        
        # Scale the data using the saved scaler
        last_60_days_scaled = scaler.transform(last_60_days)
        
        # Reshape for LSTM [samples, time steps, features]
        X_test = []
        X_test.append(last_60_days_scaled)
        X_test = np.array(X_test)
        X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))
        
        # Predict the scaled price, then reverse the scaling to get real dollars
        predicted_scaled_price = lstm_model.predict(X_test)
        predicted_price = scaler.inverse_transform(predicted_scaled_price)
        final_prediction = float(predicted_price[0][0])

        return {
            "symbol": ticker.upper(),
            "currentPrice": round(current_price, 2),
            "prediction": round(final_prediction, 2),
            "sentiment": final_sentiment,
            "sentimentScore": round(confidence, 2),
            "chartData": chart_data,
            "headlinesAnalyzed": live_headlines # Send headlines to frontend so users can read them
        }
    except Exception as e:
        return {"error": str(e)}
