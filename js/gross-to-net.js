import { calculateFromGrossToNet } from './cal-gross-to-net.js';

document.addEventListener('DOMContentLoaded', () => {
  // Dynamically inject Chart.js from CDN if not already loaded
  if (!window.Chart) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => {};
    document.head.appendChild(script);
  }
  const salaryForm = document.getElementById('salary-form');
  const calculateBtn = document.getElementById('calculate-btn');

  // Allowance checkboxes and input containers
  const allowanceCheckbox = document.getElementById('allowance-checkbox');
  const allowanceInputs = document.getElementById('allowance-inputs');
  const allowanceMap = {
    'lunch-checkbox': 'lunch-input',
    'fuel-checkbox': 'fuel-input',
    'phone-checkbox': 'phone-input',
    'travel-checkbox': 'travel-input',
    'uniform-checkbox': 'uniform-input',
  };

  // Bonus checkboxes and input containers
  const bonusCheckbox = document.getElementById('bonus-checkbox');
  const bonusInputs = document.getElementById('bonus-inputs');
  const bonusMap = {
    'productivity-checkbox': 'productivity-input',
    'incentive-checkbox': 'incentive-input',
    'kpi-checkbox': 'kpi-input',
  };

  // Generic toggle visibility function
  function toggleVisibility(checkboxId, targetId) {
    const checkbox = document.getElementById(checkboxId);
    const target = document.getElementById(targetId);
    if (checkbox && target) {
      checkbox.addEventListener('change', () => {
        target.style.display = checkbox.checked ? 'block' : 'none';
      });
    }
  }

  // Apply toggle logic
  allowanceCheckbox.addEventListener('change', () => {
    allowanceInputs.style.display = allowanceCheckbox.checked ? 'block' : 'none';
  });
  Object.entries(allowanceMap).forEach(([cb, div]) => toggleVisibility(cb, div));

  bonusCheckbox.addEventListener('change', () => {
    bonusInputs.style.display = bonusCheckbox.checked ? 'block' : 'none';
  });
  Object.entries(bonusMap).forEach(([cb, div]) => toggleVisibility(cb, div));

  // Handle calculation
  function handleCalculation() {
    const data = calculateFromGrossToNet();
    renderPieChart(data);

    const fmt = (v) => v.toLocaleString('en-US');
    const formatLine = (label, value) => value ? `- ${label}: ${fmt(value)} VND<br>` : '';

    const resultDiv = document.getElementById('result');

    let allowanceHTML = '';
    allowanceHTML += formatLine('Lunch', data.lunchAllowance);
    allowanceHTML += formatLine('Fuel', data.fuelAllowance);
    allowanceHTML += formatLine('Phone', data.phoneAllowance);
    allowanceHTML += formatLine('Traveling', data.travelAllowance);
    allowanceHTML += formatLine('Uniform', data.uniformAllowance);

    let bonusHTML = '';
    bonusHTML += formatLine('Productivity', data.productivityBonus);
    bonusHTML += formatLine('Incentive', data.incentiveBonus);
    bonusHTML += formatLine('KPI', data.kpiBonus);

    resultDiv.innerHTML = `
      <b>Base Salary: ${fmt(data.baseSalary)} VND</b><br>
      <hr>
      ${allowanceHTML ? 'Allowances:<br>' + allowanceHTML + '<hr>' : ''}
      ${bonusHTML ? 'Bonuses:<br>' + bonusHTML + '<hr>' : ''}
      <b>Gross Salary: ${fmt(data.grossSalary)} VND</b><br>
      <hr>
      Employee Insurance: ${fmt(data.employeeInsurance)} VND<br>
      <hr>
      (Taxable Income: ${fmt(data.taxableIncome)} VND)<br>
      Employee Personal Income Tax: ${fmt(data.incomeTax)} VND<br>
      <hr>
      <b>Employee Net Salary: ${fmt(data.netSalary)} VND</b><br>
      <hr>
      Employer Insurance: ${fmt(data.employerInsurance)} VND<br>
      Employer Union Fee: ${fmt(data.employerUnionFee)} VND<br>
      <hr>
      <b>Total Employer Cost: ${fmt(data.totalEmployerCost)} VND</b><br>
      <hr>
    `;
  }
  calculateBtn.addEventListener('click', handleCalculation);
  salaryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCalculation();
  });

  // Format number input fields
  function formatNumberInput(input) {
    const raw = input.value.replace(/[^\d]/g, '');
    input.value = raw ? parseFloat(raw).toLocaleString('en-US') : '';
  }

  document.addEventListener('input', (e) => {
    const idsToFormat = [
      'base-salary',
      'allowance-lunch',
      'allowance-fuel',
      'allowance-phone',
      'allowance-travel',
      'allowance-uniform',
      'bonus-productivity',
      'bonus-incentive',
      'bonus-kpi'
    ];
    if (e.target.tagName === 'INPUT' && idsToFormat.includes(e.target.id)) {
      formatNumberInput(e.target);
    }
  });

  // Pie chart rendering
  const structureChartLabel = document.getElementById('structure-chart-label');
  const breakdownChartLabel = document.getElementById('breakdown-chart-label');
  function renderPieChart(data) {
    const canvas = document.getElementById('salary-structure-chart');
    if (!canvas || !window.Chart) return;
    const ctx = canvas.getContext('2d');

    const bonusAndAllowance = data.grossSalary - data.baseSalary;

    if (window.salaryChart) window.salaryChart.destroy();

    window.salaryChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Base Salary', 'Bonus & Allowance'],
        datasets: [{
          data: [data.baseSalary, bonusAndAllowance],
          backgroundColor: ['#4caf50', '#f9a825']
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            bodyFont: {
              family: 'EB Garamond'
            },
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const value = context.raw;
                const percent = ((value / total) * 100).toFixed(2);
                return `${context.label}: ${value.toLocaleString('en-US')} VND (${percent}%)`;
              }
            }
          }
        }
      }
    });
    structureChartLabel.style.display = 'block';

    // Render the second pie chart for salary breakdown
    const breakdownCanvas = document.getElementById('salary-breakdown-chart');
    if (!breakdownCanvas) return;
    const breakdownCtx = breakdownCanvas.getContext('2d');

    const breakdownData = [
      data.baseSalary,
      data.employeeInsurance,
      data.incomeTax,
      data.netSalary,
      data.employerInsurance,
      data.employerUnionFee,
    ];
    const breakdownLabels = [
      'Base Salary',
      'Employee Insurance',
      'PIT (Personal Income Tax)',
      'Net Salary',
      'Employer Insurance',
      'Union Fee'
    ];

    if (window.breakdownChart) window.breakdownChart.destroy();

    window.breakdownChart = new Chart(breakdownCtx, {
      type: 'pie',
      data: {
        labels: breakdownLabels,
        datasets: [{
          data: breakdownData,
          backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#8bc34a', '#9c27b0', '#ffc107']
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            bodyFont: {
              family: 'EB Garamond'
            },
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const value = context.raw;
                const percent = ((value / total) * 100).toFixed(2);
                return `${context.label}: ${value.toLocaleString('en-US')} VND (${percent}%)`;
              }
            }
          }
        }
      }
    });
    breakdownChartLabel.style.display = 'block';
  }
});