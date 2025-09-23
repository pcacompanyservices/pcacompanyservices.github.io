// Shared Chart.js helpers for salary and cost breakdown doughnuts

export function destroyChart(globalName) {
  if (window[globalName]) {
    window[globalName].destroy();
    window[globalName] = null;
  }
}

export function renderSalaryBreakdownChart(canvasEl, labels, values) {
  destroyChart('salaryChart');
  window.salaryChart = new Chart(canvasEl.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: ['#999999', '#666666'], spacing: 5 }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          bodyFont: { family: 'EB Garamond' },
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const value = ctx.raw;
              const percent = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00';
              return `${ctx.label}: ${value.toLocaleString('vi-VN')} VND (${percent}%)`;
            }
          }
        }
      }
    }
  });
}

export function renderCostBreakdownChart(canvasEl, labels, values) {
  destroyChart('costBreakdownChart');
  window.costBreakdownChart = new Chart(canvasEl.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: ['#C1272D', '#A72126', '#C1272D', '#A72126', '#666666'],
        spacing: 5,
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          bodyFont: { family: 'EB Garamond' },
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const value = ctx.raw;
              const percent = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00';
              return `${ctx.label}: ${value.toLocaleString('vi-VN')} VND (${percent}%)`;
            }
          }
        }
      }
    }
  });
}
