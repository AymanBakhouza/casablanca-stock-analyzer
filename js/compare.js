let chart = null;

async function loadData() {
  const response = await fetch('data/stocks.csv');
  const text = await response.text();
  const rows = text.trim().split('\n');
  const headers = rows[0].split(',');
  
  const data = rows.slice(1).map(row => {
    const cols = row.split(',');
    return {
      ticker: cols[1],
      fecha: cols[0],
      cierre: parseFloat(cols[4])
    };
  });
  return data;
}

async function renderComparison() {
  const data = await loadData();
  const t1 = document.getElementById('ticker1').value;
  const t2 = document.getElementById('ticker2').value;
  
  document.getElementById('h1').textContent = t1;
  document.getElementById('h2').textContent = t2;
  
  const d1 = data.filter(d => d.ticker === t1).map(d => ({fecha: d.fecha, cierre: d.cierre}));
  const d2 = data.filter(d => d.ticker === t2).map(d => ({fecha: d.fecha, cierre: d.cierre}));
  
  // Chart
  const ctx = document.getElementById('compareChart').getContext('2d');
  if (chart) chart.destroy();
  
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: d1.map(d => d.fecha),
      datasets: [
        {label: t1, data: d1.map(d => d.cierre), borderColor: '#00c896', fill: false},
        {label: t2, data: d2.map(d => d.cierre), borderColor: '#3b82f6', fill: false}
      ]
    },
    options: {responsive: true, plugins: {legend: {display: true}}}
  });
  
  // Table
  const roi1 = (((d1[d1.length-1].cierre - d1[0].cierre) / d1[0].cierre) * 100).toFixed(2);
  const roi2 = (((d2[d2.length-1].cierre - d2[0].cierre) / d2[0].cierre) * 100).toFixed(2);
  
  document.getElementById('compareBody').innerHTML = `
    <tr><td>ROI 2024</td><td style="color: ${roi1 > 0 ? '#00c896' : '#ef4444'}">${roi1}%</td><td style="color: ${roi2 > 0 ? '#00c896' : '#ef4444'}">${roi2}%</td></tr>
    <tr><td>Precio Inicial</td><td>${d1[0].cierre.toFixed(2)} MAD</td><td>${d2[0].cierre.toFixed(2)} MAD</td></tr>
    <tr><td>Precio Final</td><td>${d1[d1.length-1].cierre.toFixed(2)} MAD</td><td>${d2[d2.length-1].cierre.toFixed(2)} MAD</td></tr>
  `;
}

document.getElementById('ticker1').addEventListener('change', renderComparison);
document.getElementById('ticker2').addEventListener('change', renderComparison);

renderComparison();