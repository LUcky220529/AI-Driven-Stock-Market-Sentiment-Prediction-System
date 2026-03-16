# train_lstm.py
import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM
import joblib

print("Downloading historical data...")
data = yf.download('AAPL', start='2014-01-01', end='2024-01-01')
dataset = data['Close'].values.reshape(-1, 1)

print("Scaling data...")
scaler = MinMaxScaler(feature_range=(0, 1))
scaled_data = scaler.fit_transform(dataset)

# Save the scaler so the API can use the exact same math later
joblib.dump(scaler, 'scaler.gz')

# Create training data (Look back 60 days to predict the 61st)
x_train, y_train = [], []
for i in range(60, len(scaled_data)):
    x_train.append(scaled_data[i-60:i, 0])
    y_train.append(scaled_data[i, 0])

x_train, y_train = np.array(x_train), np.array(y_train)
x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1], 1))

print("Building and Training LSTM Model. This will take a few minutes...")
model = Sequential()
model.add(LSTM(50, return_sequences=True, input_shape=(x_train.shape[1], 1)))
model.add(LSTM(50, return_sequences=False))
model.add(Dense(25))
model.add(Dense(1))

model.compile(optimizer='adam', loss='mean_squared_error')
model.fit(x_train, y_train, batch_size=32, epochs=10)

print("Saving model...")
model.save('lstm_model.h5')
print("Training Complete! Model saved as lstm_model.h5")