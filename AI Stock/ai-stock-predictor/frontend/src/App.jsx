import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import axios from 'axios';

const App = () => {
  const [ticker, setTicker] = useState('');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!ticker) return;

    setLoading(true);
    setError('');
    setStockData(null);

    try {
      // Hitting your Python FastAPI Backend
      const response = await axios.get(`http://localhost:8000/predict/${ticker}`);
      
      if (response.data.error) {
        setError('Stock not found or API error.');
      } else {
        setStockData(response.data);
      }
    } catch (err) {
      setError('Failed to connect to Python Backend. Is it running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-blue-500 selection:text-white">
      
      {/* NAVBAR */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-500 h-6 w-6" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              NeuroTrade
            </span>
          </div>
          <div className="text-xs text-gray-500 hidden sm:block">
            Powered by FinBERT & FastAPI
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Search Section */}
        <div className="flex flex-col items-center justify-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Predict the Market with <span className="text-blue-500">AI Precision</span>
          </h1>
          
          <form onSubmit={handleSearch} className="relative w-full max-w-md mt-6">
            <input
              type="text"
              placeholder="Enter Stock Ticker (e.g., AAPL, TSLA)"
              className="w-full bg-gray-800 border border-gray-700 text-white px-5 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12 shadow-lg"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase()}
            />
            <Search className="absolute left-4 top-4 text-gray-500 h-5 w-5" />
            <button 
              type="submit" 
              className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>
          {error && <p className="text-red-400 mt-4 flex items-center gap-2"><AlertCircle className="h-4 w-4"/> {error}</p>}
        </div>

        {/* Results Section */}
        {stockData && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart Column */}
            <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{stockData.symbol} Price Trend</h2>
                  <p className="text-gray-400 text-sm">Live Yahoo Finance Data (7 Days)</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">${stockData.currentPrice.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stockData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="day" stroke="#9CA3AF" tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Insights Column */}
            <div className="flex flex-col gap-6">
              
              {/* Sentiment Card */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${stockData.sentiment === 'Positive' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <h3 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-2">FinBERT Sentiment</h3>
                <div className="flex items-center gap-4 mb-4">
                  {stockData.sentiment === 'Positive' ? (
                    <div className="bg-green-500/20 p-3 rounded-full text-green-400"><TrendingUp className="h-8 w-8" /></div>
                  ) : (
                    <div className="bg-red-500/20 p-3 rounded-full text-red-400"><TrendingDown className="h-8 w-8" /></div>
                  )}
                  <div>
                    <p className={`text-3xl font-bold ${stockData.sentiment === 'Positive' ? 'text-green-400' : 'text-red-400'}`}>
                      {stockData.sentiment}
                    </p>
                    <p className="text-gray-500 text-xs">Confidence Score: {(stockData.sentimentScore * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Prediction Card */}
              <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-2xl p-6 shadow-xl">
                <h3 className="text-blue-200 text-sm uppercase tracking-wider font-semibold mb-2">AI Price Forecast</h3>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-4xl font-bold text-white">${stockData.prediction}</p>
                </div>
                <p className="text-gray-400 text-sm">
                  Based on current sentiment and technicals, the model anticipates this trend over the next 24 hours.
                </p>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
