
const TICKER_COLORS = {
  IAM: '#00c896',
  ATW: '#3b82f6',
  BCP: '#f59e0b',
  CIH: '#a855f7',
  LBV: '#ef4444',
  MNG: '#06b6d4',
  TQM: '#f97316',
};

const SECTORS = {
  IAM: 'Telecomunicaciones',
  ATW: 'Banca',
  BCP: 'Banca',
  CIH: 'Banca',
  LBV: 'Distribución',
  MNG: 'Minería',
  TQM: 'Energía',
};

async function loadCSV() {
  const response = await fetch('http://127.0.0.1:5000/api/stocks');
  const text = await response.text();
  const rows = text.trim().split('\n');
  const headers = rows[0].split(',');
  return rows.slice(1).map(row => {
    const vals = row.split(',');
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = vals[i]?.trim());
    obj.cierre   = parseFloat(obj.cierre);
    obj.apertura = parseFloat(obj.apertura);
    obj.volumen  = parseInt(obj.volumen);
    return obj;
  });
}

function groupByTicker(data) {
  return data.reduce((acc, row) => {
    if (!acc[row.ticker]) acc[row.ticker] = [];
    acc[row.ticker].push(row);
    return acc;
  }, {});
}

function animateCount(el, target, decimals = 0, prefix = '', suffix = '') {
  const duration = 1200;
  const start    = performance.now();
  const from     = 0;
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    const val      = from + (target - from) * ease;
    el.textContent = prefix + val.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

let mainChartInstance = null;
let heroChartInstance = null;

function renderMainChart(data, ticker) {
  const rows   = data[ticker];
  const labels = rows.map(r => r.fecha.slice(5)); // MM-DD
  const values = rows.map(r => r.cierre);
  const color  = TICKER_COLORS[ticker];

  const ctx = document.getElementById('mainChart').getContext('2d');

  if (mainChartInstance) mainChartInstance.destroy();

  const gradient = ctx.createLinearGradient(0, 0, 0, 350);
  gradient.addColorStop(0,   color + '30');
  gradient.addColorStop(1,   'transparent');

  mainChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: ticker,
        data: values,
        borderColor: color,
        borderWidth: 2,
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: color,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0d1318',
          borderColor: '#1a2530',
          borderWidth: 1,
          titleColor: '#6b7f8f',
          bodyColor: color,
          padding: 12,
          callbacks: {
            label: ctx => `  ${ctx.parsed.y.toFixed(2)} MAD`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.03)' },
          ticks: {
            color: '#3d5060', font: { family: 'DM Mono', size: 10 },
            maxTicksLimit: 12,
          }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#6b7f8f', font: { family: 'DM Mono', size: 10 },
            callback: v => v.toFixed(0) + ' MAD',
          }
        }
      }
    }
  });
}

function renderHeroChart(data) {
  const rows   = data['IAM'];
  const labels = rows.map(r => r.fecha.slice(5));
  const values = rows.map(r => r.cierre);

  const ctx = document.getElementById('heroMiniChart').getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, 240);
  gradient.addColorStop(0, 'rgba(0,200,150,0.25)');
  gradient.addColorStop(1, 'transparent');

  heroChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: '#00c896',
        borderWidth: 1.5,
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });
}

function renderTable(data) {
  const tbody = document.getElementById('stocksTableBody');
  tbody.innerHTML = '';

  let i = 1;
  for (const [ticker, rows] of Object.entries(data)) {
    const first  = rows[0].cierre;
    const last   = rows[rows.length - 1].cierre;
    const roi    = ((last - first) / first * 100);
    const nombre = rows[0].nombre_empresa;
    const sector = SECTORS[ticker] || '—';

    const roiClass = roi >= 0 ? 'roi-positive' : 'roi-negative';
    const roiSign  = roi >= 0 ? '+' : '';

    tbody.innerHTML += `
      <tr>
        <td style="color: var(--text-dim); font-family: var(--font-mono)">${i++}</td>
        <td><strong>${nombre}</strong></td>
        <td><span class="ticker-badge">${ticker}</span></td>
        <td><span class="sector-tag">${sector}</span></td>
        <td style="font-family:var(--font-mono)">${first.toFixed(2)} MAD</td>
        <td style="font-family:var(--font-mono)">${last.toFixed(2)} MAD</td>
        <td class="${roiClass}">${roiSign}${roi.toFixed(2)}%</td>
        <td><a href="stock.html?ticker=${ticker}" class="btn-detail">Ver →</a></td>
      </tr>
    `;
  }
}

function renderCards(data) {
  // Total filas
  const total = Object.values(data).reduce((s, r) => s + r.length, 0);
  const totalEl = document.getElementById('totalRows');
  animateCount(totalEl, total);

  let bestTicker = '—', bestROI = -Infinity;
  for (const [ticker, rows] of Object.entries(data)) {
    const roi = (rows[rows.length - 1].cierre - rows[0].cierre) / rows[0].cierre * 100;
    if (roi > bestROI) { bestROI = roi; bestTicker = ticker; }
  }
  document.getElementById('bestStock').textContent  = bestTicker;
  document.getElementById('bestReturn').textContent = `+${bestROI.toFixed(1)}% ROI 2024`;

  // Precio promedio
  const allPrices = Object.values(data).flatMap(rows => rows.map(r => r.cierre));
  const avg       = allPrices.reduce((s, p) => s + p, 0) / allPrices.length;
  const avgEl     = document.getElementById('avgPrice');
  animateCount(avgEl, avg, 0, '', '');

  const countEl = document.querySelector('[data-count="7"]');
  animateCount(countEl, 7);

  document.getElementById('fechaHoy').textContent =
    new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}


function initChips(data) {
  document.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMainChart(data, btn.dataset.ticker);
    });
  });
}


async function init() {
  try {
    const raw  = await loadCSV();
    const data = groupByTicker(raw);

    renderHeroChart(data);
    renderCards(data);
    renderMainChart(data, 'IAM');
    renderTable(data);
    initChips(data);

  } catch (err) {
    console.error('Error cargando datos:', err);
  }
}

init();