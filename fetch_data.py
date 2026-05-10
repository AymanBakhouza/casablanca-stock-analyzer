import pandas as pd
import numpy as np
from datetime import datetime, timedelta

EMPRESAS = {
    'IAM': {'nombre': 'Maroc Telecom',            'precio_base': 128.0, 'sector': 'Telecomunicaciones'},
    'ATW': {'nombre': 'Attijariwafa Bank',         'precio_base': 540.0, 'sector': 'Banca'},
    'BCP': {'nombre': 'Banque Centrale Populaire', 'precio_base': 310.0, 'sector': 'Banca'},
    'CIH': {'nombre': 'CIH Bank',                 'precio_base': 340.0, 'sector': 'Banca'},
    'LBV': {'nombre': 'Label Vie',                'precio_base': 4800.0,'sector': 'Distribución'},
    'MNG': {'nombre': 'Managem',                  'precio_base': 198.0, 'sector': 'Minería'},
    'TQM': {'nombre': 'Taqa Morocco',             'precio_base': 1050.0,'sector': 'Energía'},
}

fechas = pd.bdate_range(start='2024-01-01', end='2024-12-31')

todos_los_datos = []

np.random.seed(42)

for ticker, info in EMPRESAS.items():
    precio = info['precio_base']
    precios_cierre = []

    for _ in fechas:
        cambio = np.random.normal(0, 0.012)
        precio = precio * (1 + cambio)
        precios_cierre.append(round(precio, 2))

    df_empresa = pd.DataFrame({
        'fecha'         : fechas,
        'ticker'        : ticker,
        'nombre_empresa': info['nombre'],
        'sector'        : info['sector'],
        'cierre'        : precios_cierre,
        'apertura'      : [round(p * np.random.uniform(0.99, 1.01), 2) for p in precios_cierre],
        'maximo'        : [round(p * np.random.uniform(1.00, 1.02), 2) for p in precios_cierre],
        'minimo'        : [round(p * np.random.uniform(0.98, 1.00), 2) for p in precios_cierre],
        'volumen'       : [int(np.random.randint(10000, 500000))        for p in precios_cierre],
        'fecha_carga'   : datetime.now().strftime('%Y-%m-%d')
    })

    todos_los_datos.append(df_empresa)
    print(f"  ✅ {info['nombre']} ({ticker}) — {len(fechas)} días generados")

df = pd.concat(todos_los_datos, ignore_index=True)
df.to_csv('data/stocks.csv', index=False)

print("\n" + "=" * 45)
print(f"  ✅ Archivo guardado: data/stocks.csv")
print(f"  📊 Total de filas  : {len(df)}")
print(f"  🏢 Empresas        : {len(EMPRESAS)}")
print(f"  📅 Período         : 2024-01-01 → 2024-12-31")
print("=" * 45)