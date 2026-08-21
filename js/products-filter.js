(function () {
  const grid = document.getElementById('product-filter-grid');
  if (!grid) return;

  const buttons = document.querySelectorAll('.product-filter-btn');
  const cards = grid.querySelectorAll('.product-category');

  function applyFilter(filter) {
    buttons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.filter === filter);
    });

    cards.forEach((card) => {
      const series = card.dataset.series || '';
      const show = filter === 'all' || series.split(/\s+/).includes(filter);
      card.hidden = !show;
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });

  const params = new URLSearchParams(window.location.search);
  const filterFromQuery = params.get('filter');
  const hash = window.location.hash.replace('#', '');

  if (filterFromQuery && document.querySelector(`.product-filter-btn[data-filter="${filterFromQuery}"]`)) {
    applyFilter(filterFromQuery);
  } else if (hash === 'all' && document.querySelector('.product-filter-btn[data-filter="all"]')) {
    applyFilter('all');
  }
})();
