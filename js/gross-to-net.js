import { calculateFromGrossToNet } from './cal-gross-to-net.js';

document.addEventListener('DOMContentLoaded', () => {
  // Load Chart.js if not present
  if (!window.Chart) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    document.head.appendChild(script);
  }

  const salaryForm = document.getElementById('salary-form');
  const calculateBtn = document.getElementById('calculate-btn');
  const downloadPdfBtn = document.getElementById('download-pdf-btn');
  const resultDiv = document.getElementById('result');

  const allowanceCheckbox = document.getElementById('allowance-checkbox');
  const allowanceInputs = document.getElementById('allowance-inputs');
  const bonusCheckbox = document.getElementById('bonus-checkbox');
  const bonusInputs = document.getElementById('bonus-inputs');

  const structureChart = document.getElementById('salary-structure-chart');
  const breakdownChart = document.getElementById('salary-breakdown-chart');
  const structureChartLabel = document.getElementById('structure-chart-label');
  const breakdownChartLabel = document.getElementById('breakdown-chart-label');

  const allowanceMap = {
    'lunch-checkbox': 'lunch-input',
    'fuel-checkbox': 'fuel-input',
    'phone-checkbox': 'phone-input',
    'travel-checkbox': 'travel-input',
    'uniform-checkbox': 'uniform-input',
  };

  const bonusMap = {
    'productivity-checkbox': 'productivity-input',
    'incentive-checkbox': 'incentive-input',
    'kpi-checkbox': 'kpi-input',
  };

  function toggleVisibility(map, parentCheckbox, container) {
    parentCheckbox.addEventListener('change', () => {
      container.style.display = parentCheckbox.checked ? 'block' : 'none';
      Object.entries(map).forEach(([cbId, inputId]) => {
        const cb = document.getElementById(cbId);
        const div = document.getElementById(inputId);
        if (cb && div) {
          div.style.display = cb.checked && parentCheckbox.checked ? 'block' : 'none';
        }
      });
    });

    Object.entries(map).forEach(([cbId, inputId]) => {
      const cb = document.getElementById(cbId);
      const div = document.getElementById(inputId);
      if (cb && div) {
        cb.addEventListener('change', () => {
          div.style.display = cb.checked && parentCheckbox.checked ? 'block' : 'none';
        });
      }
    });
  }

  toggleVisibility(allowanceMap, allowanceCheckbox, allowanceInputs);
  toggleVisibility(bonusMap, bonusCheckbox, bonusInputs);

  function formatNumberInput(input) {
    const raw = input.value.replace(/[^\d]/g, '');
    input.value = raw ? parseFloat(raw).toLocaleString('en-US') : '';
  }

  document.addEventListener('input', (e) => {
    const idsToFormat = [
      'base-salary',
      'allowance-lunch', 'allowance-fuel', 'allowance-phone', 'allowance-travel', 'allowance-uniform',
      'bonus-productivity', 'bonus-incentive', 'bonus-kpi'
    ];
    if (e.target.tagName === 'INPUT' && idsToFormat.includes(e.target.id)) {
      formatNumberInput(e.target);
    }
  });

  function formatLine(label, value) {
    return value ? `- ${label}: ${value.toLocaleString('en-US')} VND<br>` : '';
  }

  function handleCalculation() {
    const data = calculateFromGrossToNet();
    renderPieChart(data);

    const allowanceHTML = [
      formatLine('Lunch', data.lunchAllowance),
      formatLine('Fuel', data.fuelAllowance),
      formatLine('Phone', data.phoneAllowance),
      formatLine('Traveling', data.travelAllowance),
      formatLine('Uniform', data.uniformAllowance)
    ].join('');

    const bonusHTML = [
      formatLine('Productivity', data.productivityBonus),
      formatLine('Incentive', data.incentiveBonus),
      formatLine('KPI', data.kpiBonus)
    ].join('');

    resultDiv.innerHTML = `
      <b>Base Salary: ${data.baseSalary.toLocaleString('en-US')} VND</b><br><hr>
      ${allowanceHTML ? 'Allowances:<br>' + allowanceHTML + '<hr>' : ''}
      ${bonusHTML ? 'Bonuses:<br>' + bonusHTML + '<hr>' : ''}
      <b>Gross Salary: ${data.grossSalary.toLocaleString('en-US')} VND</b><br><hr>
      Employee Insurance: ${data.employeeInsurance.toLocaleString('en-US')} VND<br><hr>
      (Taxable Income: ${data.taxableIncome.toLocaleString('en-US')} VND)<br>
      Employee Personal Income Tax: ${data.incomeTax.toLocaleString('en-US')} VND<br><hr>
      <b>Employee Net Salary: ${data.netSalary.toLocaleString('en-US')} VND</b><br><hr>
      Employer Insurance: ${data.employerInsurance.toLocaleString('en-US')} VND<br>
      Employer Union Fee: ${data.employerUnionFee.toLocaleString('en-US')} VND<br><hr>
      <b>Total Employer Cost: ${data.totalEmployerCost.toLocaleString('en-US')} VND</b><br><hr>
    `;
    downloadPdfBtn.style.display = 'block';
  }

  calculateBtn.addEventListener('click', handleCalculation);
  salaryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCalculation();
  });

  function renderPieChart(data) {
    const bonusAndAllowance = data.grossSalary - data.baseSalary;

    if (bonusAndAllowance === 0) {
      if (window.salaryChart) {
        window.salaryChart.destroy();
        window.salaryChart = null;
      }
      structureChart.style.display = 'none';
      structureChartLabel.style.display = 'none';
    } else {
      if (window.salaryChart) window.salaryChart.destroy();

      window.salaryChart = new Chart(structureChart.getContext('2d'), {
        type: 'pie',
        data: {
          labels: ['Bonus & Allowance', 'Base Salary'],
          datasets: [{
            data: [bonusAndAllowance, data.baseSalary],
            backgroundColor: ['#9aff9a', '#87cefa']
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
                  const percent = ((value / total) * 100).toFixed(2);
                  return `${ctx.label}: ${value.toLocaleString('en-US')} VND (${percent}%)`;
                }
              }
            }
          }
        }
      });

      structureChart.style.display = 'block';
      structureChartLabel.style.display = 'block';
    }

    if (window.breakdownChart) window.breakdownChart.destroy();

    const breakdownData = [
      data.employeeInsurance,
      data.incomeTax,
      data.netSalary,
      data.employerInsurance,
      data.employerUnionFee
    ];

    const breakdownLabels = [
      'Employee Insurance',
      'Personal Income Tax',
      'Employee Take-home (Net) Salary',
      'Employer Insurance',
      'Employer Union Fee'
    ];

    window.breakdownChart = new Chart(breakdownChart.getContext('2d'), {
      type: 'pie',
      data: {
        labels: breakdownLabels,
        datasets: [{
          data: breakdownData,
          backgroundColor: ['#ffaaa5', '#ff8b94', '#9aff9a', '#fff4a5', '#ffb68b']
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
                const percent = ((value / total) * 100).toFixed(2);
                return `${ctx.label}: ${value.toLocaleString('en-US')} VND (${percent}%)`;
              }
            }
          }
        }
      }
    });

    breakdownChart.style.display = 'block';
    breakdownChartLabel.style.display = 'block';
  }
});