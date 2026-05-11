from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import sqlite3
import os

app = Flask(__name__)
CORS(app)

df = pd.read_csv('../data/stocks.csv')

def init_db():
    conn = sqlite3.connect('casabourse.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS companies (
            id     INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker TEXT UNIQUE,
            nombre TEXT,
            sector TEXT
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS prices (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker   TEXT,
            fecha    TEXT,
            apertura REAL,
            cierre   REAL,
            maximo   REAL,
            minimo   REAL,
            volumen  INTEGER
        )
    ''')
    conn.commit()
    conn.close()

def populate_db():
    conn = sqlite3.connect('casabourse.db')
    c = conn.cursor()
    for ticker, group in df.groupby('ticker'):
        c.execute('INSERT OR IGNORE INTO companies (ticker, nombre, sector) VALUES (?, ?, ?)',
                  (ticker, group.iloc[0]['nombre_empresa'], group.iloc[0]['sector']))
        for _, row in group.iterrows():
            c.execute('INSERT INTO prices (ticker, fecha, apertura, cierre, maximo, minimo, volumen) VALUES (?, ?, ?, ?, ?, ?, ?)',
                      (ticker, row['fecha'], row['apertura'], row['cierre'], row['maximo'], row['minimo'], row['volumen']))
    conn.commit()
    conn.close()

if not os.path.exists('casabourse.db'):
    init_db()
    populate_db()
    print("✅ Base de datos creada")

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
    ma20  = round(float(np.mean(data[-20:])), 2)
    mean  = np.mean(data)
    vol   = round(float(np.std(data) / mean * 100), 2)
    roi   = round(float((data[-1] - data[0]) / data[0] * 100), 2)
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