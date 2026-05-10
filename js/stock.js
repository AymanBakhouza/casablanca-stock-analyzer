

const SECTORS = {
  IAM: 'Telecomunicaciones',
  ATW: 'Banca',
  BCP: 'Banca',
  CIH: 'Banca',
  LBV: 'Distribución',
  MNG: 'Minería',
  TQM: 'Energía',
};

const TICKER_COLORS = {
  IAM: '#00c896',
  ATW: '#3b82f6',
  BCP: '#f59e0b',
  CIH: '#a855f7',
  LBV: '#ef4444',
  MNG: '#06b6d4',
  TQM: '#f97316',
};

async function loadCSV() {
  const res  = await fetch('data/stocks.csv');
  const text = await res.text();
  const rows = text.trim().split('\n');
  const headers = rows[0].split(',');
  return rows.slice(1).map(row => {
    const vals = row.split(',');
    const obj  = {};
    headers.forEach((h, i) => obj[h.trim()] = vals[i]?.trim());
    obj.cierre   = parseFloat(obj.cierre);
    obj.apertura = parseFloat(obj.apertura);
    obj.maximo   = parseFloat(obj.maximo);
    obj.minimo   = parseFloat(obj.minimo);
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

function movingAverage(data, period = 20) {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((s, v) => s + v, 0) / period;
  });
}

function volatility(prices) {
  const mean = prices.reduce((s, p) => s + p, 0) / prices.length;
  const variance = prices.reduce((s, p) => s + Math.pow(p - mean, 2), 0) / prices.length;
  return Math.sqrt(variance);
}

let chartInstance = null;

function renderChart(rows, ticker) {
  const color   = TICKER_COLORS[ticker] || '#00c896';
  const labels  = rows.map(r => r.fecha.slice(5));
  const prices  = rows.map(r => r.cierre);
  const maData  = movingAverage(prices, 20);

  const ctx = document.getElementById('stockChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();

  const gradient = ctx.createLinearGradient(0, 0, 0, 380);
  gradient.addColorStop(0, color + '28');
  gradient.addColorStop(1, 'transparent');

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Precio cierre',
          data: prices,
          borderColor: color,
          borderWidth: 2,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: color,
          order: 2,
        },
        {
          label: 'Media móvil 20d',
          data: maData,
          borderColor: '#f59e0b',
          borderWidth: 1.5,
          borderDash: [4, 4],
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          spanGaps: false,
          order: 1,
        }
      ]
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
          padding: 12,
          callbacks: {
            label: ctx => `  ${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(2) ?? '—'} MAD`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.03)' },
          ticks: {
            color: '#3d5060',
            font: { family: 'DM Mono', size: 10 },
            maxTicksLimit: 12,
          }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#6b7f8f',
            font: { family: 'DM Mono', size: 10 },
            callback: v => v.toFixed(0) + ' MAD',
          }
        }
      }
    }
  });
}

function renderKPIs(rows) {
  const prices  = rows.map(r => r.cierre);
  const first   = prices[0];
  const last    = prices[prices.length - 1];
  const roi     = ((last - first) / first * 100);
  const maxP    = Math.max(...prices);
  const minP    = Math.min(...prices);
  const vol     = volatility(prices);
  const volPct  = (vol / (prices.reduce((s,p) => s+p,0)/prices.length) * 100);

  document.getElementById('kpiOpen').textContent  = first.toFixed(2) + ' MAD';
  document.getElementById('kpiClose').textContent = last.toFixed(2)  + ' MAD';
  document.getElementById('kpiHigh').textContent  = maxP.toFixed(2)  + ' MAD';
  document.getElementById('kpiLow').textContent   = minP.toFixed(2)  + ' MAD';
  document.getElementById('kpiVol').textContent   = volPct.toFixed(1) + '%';

  const roiEl   = document.getElementById('kpiROI');
  const sign    = roi >= 0 ? '+' : '';
  roiEl.textContent = sign + roi.toFixed(2) + '%';
  roiEl.style.color = roi >= 0 ? 'var(--green)' : 'var(--red)';
}

function renderHero(rows, ticker) {
  const last   = rows[rows.length - 1].cierre;
  const prev   = rows[rows.length - 2].cierre;
  const change = ((last - prev) / prev * 100);
  const sign   = change >= 0 ? '+' : '';

  document.getElementById('companyBadge').textContent  = ticker;
  document.getElementById('companyName').textContent   = rows[0].nombre_empresa;
  document.getElementById('companySector').textContent = SECTORS[ticker] || '—';
  document.getElementById('currentPrice').textContent  = last.toFixed(2);

  const changeEl = document.getElementById('priceChange');
  changeEl.textContent = sign + change.toFixed(2) + '%';
  changeEl.className   = 'price-change ' + (change >= 0 ? 'positive' : 'negative');

  document.title = `${ticker} · ${rows[0].nombre_empresa} — CasaBourse`;
}

function renderTable(rows) {
  const recent = rows.slice(-30).reverse();
  const tbody  = document.getElementById('dailyTableBody');
  tbody.innerHTML = '';

  recent.forEach((row, i) => {
    const prev     = rows[rows.length - 30 + (29 - i) - 1];
    const varPct   = prev ? ((row.cierre - prev.cierre) / prev.cierre * 100) : 0;
    const sign     = varPct >= 0 ? '+' : '';
    const varClass = varPct > 0 ? 'variation-pos' : varPct < 0 ? 'variation-neg' : 'variation-neu';

    tbody.innerHTML += `
      <tr>
        <td style="font-family:var(--font-mono); color:var(--text-muted)">${row.fecha}</td>
        <td style="font-family:var(--font-mono)">${row.apertura.toFixed(2)}</td>
        <td style="font-family:var(--font-mono); color:var(--green)">${row.maximo.toFixed(2)}</td>
        <td style="font-family:var(--font-mono); color:var(--red)">${row.minimo.toFixed(2)}</td>
        <td style="font-family:var(--font-mono); font-weight:500">${row.cierre.toFixed(2)}</td>
        <td style="font-family:var(--font-mono); color:var(--text-muted)">${row.volumen.toLocaleString()}</td>
        <td class="${varClass}">${sign}${varPct.toFixed(2)}%</td>
      </tr>
    `;
  });

  document.getElementById('tableCount').textContent = `Últimos 30 días`;
}

// ── Actualizar todo ──
function updatePage(data, ticker) {
  const rows = data[ticker];
  if (!rows) return;
  renderHero(rows, ticker);
  renderKPIs(rows);
  renderChart(rows, ticker);
  renderTable(rows);

  const color = TICKER_COLORS[ticker] || '#00c896';
  document.getElementById('companyBadge').style.color       = color;
  document.getElementById('companyBadge').style.borderColor = color + '50';
  document.getElementById('companyBadge').style.background  = color + '15';
}

// ── INIT ──
async function init() {
  const raw    = await loadCSV();
  const data   = groupByTicker(raw);

  const params = new URLSearchParams(window.location.search);
  const ticker = params.get('ticker') || 'IAM';

  const select = document.getElementById('tickerSelect');
  select.value = ticker;

  updatePage(data, ticker);

  select.addEventListener('change', () => {
    updatePage(data, select.value);
    history.replaceState(null, '', `?ticker=${select.value}`);
  });
}

init();