document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('watchlistGrid');
  const companies = ['IAM', 'ATW', 'BCP', 'CIH', 'LBV', 'MNG', 'TQM'];
  
  grid.innerHTML = companies.map(ticker => `
    <div class="watchlist-card">
      <h3>${ticker}</h3>
      <a href="stock.html?ticker=${ticker}" class="btn-ghost">Ver análisis →</a>
    </div>
  `).join('');
});