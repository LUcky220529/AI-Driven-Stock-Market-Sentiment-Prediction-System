
# 📈 AI-Driven Stock Market Sentiment & Prediction System

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)

> **A unified financial dashboard that merges Quantitative Price Forecasting with Qualitative News Sentiment Analysis using Deep Learning and NLP.**

---

## 📖 About The Project

For retail investors and students, analyzing the stock market is overwhelming. You have to look at complex candlestick charts on one platform (Technical Analysis) and read hundreds of news articles on another (Fundamental/Sentiment Analysis). 

This project solves that problem by building a **"Hybrid AI Brain"**. 
It automatically fetches historical data and real-time news, runs them through two separate AI models simultaneously, and presents a simplified **Prediction & Sentiment Score** on a clean, interactive dashboard.

### ✨ Key Features

* **🧠 Dual-AI Analysis:** * **The Quant Engine (LSTM):** A Long Short-Term Memory neural network that looks at the last 5 years of price history to predict the trend for the next 7 days.
  * **The Sentiment Engine (FinBERT):** A domain-specific NLP transformer model that reads today's financial headlines and scores the market mood (Positive, Negative, or Neutral).
* **⚡ Blazing Fast API:** Built with FastAPI, the backend processes heavy AI inference tasks asynchronously, delivering results in under 3 seconds.
* **📊 Interactive Dashboard:** A React.js frontend featuring beautiful Recharts (Candlestick and Line graphs) and a dynamic Sentiment Gauge.
* **🗄️ Smart Caching:** Uses MongoDB to cache recent searches, preventing API rate limits and instantly loading popular stock queries.



---

## 🏗️ System Architecture

GitHub natively renders the flowchart below. It shows exactly how data flows from the user to the AI models and back.

```mermaid
graph TD
    User[User Searches Stock] --> Frontend[React.js Dashboard]
    Frontend -->|HTTP GET Request| Backend[FastAPI Server]
    
    Backend -->|Thread 1| YF[yfinance API: Fetch Prices]
    Backend -->|Thread 2| News[NewsAPI: Fetch Headlines]
    
    YF --> LSTM[LSTM Deep Learning Model]
    News --> FinBERT[FinBERT NLP Model]
    
    LSTM -->|Price Forecast| Backend
    FinBERT -->|Sentiment Score| Backend
    
    Backend -->|Caches Data| DB[(MongoDB)]
    Backend -->|Returns JSON| Frontend
    Frontend -->|Updates Charts| User
