# 📊 Casablanca Stock Analyzer

🌐 **Live Demo:** https://aymanbakhouza.github.io/casablanca-stock-analyzer

Una aplicación web profesional para analizar y visualizar datos de la **Bolsa de Casablanca (CSE)** con análisis técnico avanzado.

## ✨ Características

- 📈 Gráficos interactivos en tiempo real
- 📊 Análisis técnico (Media Móvil 20d, Volatilidad, ROI)
- 🔮 Predicciones de precios basadas en tendencias
- 🔄 Comparador de acciones (2 empresas simultáneamente)
- 💾 Base de datos SQLite integrada
- 📱 Diseño responsive y moderno

## 🛠️ Tech Stack

**Frontend:** HTML5, CSS3, JavaScript, Chart.js  
**Backend:** Flask (Python), SQLite, pandas, numpy  
**Deployment:** GitHub Pages  

## 📊 Empresas Incluidas

| Ticker | Empresa | Sector |
|--------|---------|--------|
| IAM | Maroc Telecom | Telecomunicaciones |
| ATW | Attijariwafa Bank | Banca |
| BCP | Banque Centrale Populaire | Banca |
| CIH | CIH Bank | Banca |
| LBV | Label Vie | Distribución |
| MNG | Managem | Minería |
| TQM | Taqa Morocco | Energía |

## 🚀 Cómo Usar

### Frontend (GitHub Pages)

Abre: https://aymanbakhouza.github.io/casablanca-stock-analyzer

- Mercado: Resumen de todas las empresas con KPIs
- Análisis: Datos detallados, gráficos y análisis por empresa
- Comparar: Compara 2 empresas simultáneamente en un chart

### Backend Local (Flask API)
```bash
cd backend
pip3 install flask flask-cors pandas numpy
python3 app.py
```

**Endpoints:**
- `GET /api/stocks` — Lista todas las empresas
- `GET /api/stock/<ticker>` — Datos históricos (ej: /api/stock/ATW)
- `GET /api/analysis/<ticker>` — Análisis avanzado (MA, volatility, predicción)

## 📁 Estructura del Proyecto


casablanca-stock-analyzer/
├── index.html / stock.html / compare.html
├── css/
│   ├── style.css
│   └── stock.css
├── js/
│   ├── main.js
│   ├── stock.js
│   └── compare.js
├── data/
│   └── stocks.csv
├── backend/
│   ├── app.py
│   └── casabourse.db
└── README.md

## 👨‍💻 Autor

**Ayman Bakhouza**  
Ciclo Formativo Superior en Desarrollo de Aplicaciones Web  
ITP Granada · 2026