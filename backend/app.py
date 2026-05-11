from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

df = pd.read_csv('../data/stocks.csv')

@app.route('/api/stocks')
def get_stocks():
    tickers = df.groupby('ticker').agg(
        nombre_empresa=('nombre_empresa', 'first'),
        sector=('sector', 'first'),
        precio_inicial=('cierre', 'first'),
        precio_final=('cierre', 'last'),
    ).reset_index()
    tickers['roi'] = ((tickers['precio_final'] - tickers['precio_inicial']) / tickers['precio_inicial'] * 100).round(2)
    return jsonify(tickers.to_dict(orient='records'))

@app.route('/api/stock/<ticker>')
def get_stock(ticker):
    data = df[df['ticker'] == ticker.upper()]
    if data.empty:
        return jsonify({'error': 'Ticker not found'}), 404
    return jsonify(data.to_dict(orient='records'))

@app.route('/api/analysis/<ticker>')
def get_analysis(ticker):
    data = df[df['ticker'] == ticker.upper()]['cierre'].values
    if len(data) == 0:
        return jsonify({'error': 'Ticker not found'}), 404

    # Moving Average 20 días
    ma20 = round(float(np.mean(data[-20:])), 2)

    # Volatilidad
    mean  = np.mean(data)
    vol   = round(float(np.std(data) / mean * 100), 2)

    # ROI
    roi   = round(float((data[-1] - data[0]) / data[0] * 100), 2)

    # Predicción simple — tendencia lineal
    x     = np.arange(len(data))
    slope = np.polyfit(x, data, 1)[0]
    pred  = round(float(data[-1] + slope), 2)

    return jsonify({
        'ticker'         : ticker.upper(),
        'moving_avg_20d' : ma20,
        'volatility_pct' : vol,
        'roi_2024'       : roi,
        'prediction_next': pred,
        'trend'          : 'alcista' if slope > 0 else 'bajista'
    })

if __name__ == '__main__':
    app.run(debug=True)