from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd

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

if __name__ == '__main__':
    app.run(debug=True)