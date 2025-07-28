import { calculateFromGrossToNet } from './cal-gross-to-net.js';

function formatLine(label, value) {
  return value ? `- ${label}: ${value.toLocaleString('en-US')} VND<br>` : '';
}

document.addEventListener('DOMContentLoaded', () => {
  // Load Chart.js if not present
  if (!window.Chart) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    document.head.appendChild(script);
  }

  const DOM = {
    salaryForm: document.getElementById('salary-form'),
    calculateBtn: document.getElementById('calculate-btn'),
    downloadPdfBtn: document.getElementById('download-pdf-btn'),
    resultDiv: document.getElementById('result'),

    allowanceCheckbox: document.getElementById('allowance-checkbox'),
    allowanceInputs: document.getElementById('allowance-inputs'),
    bonusCheckbox: document.getElementById('bonus-checkbox'),
    bonusInputs: document.getElementById('bonus-inputs'),

    costBreakdownChart: document.getElementById('cost-breakdown-chart'),
    salaryBreakdownChart: document.getElementById('salary-breakdown-chart'),
    costBreakdownChartLabel: document.getElementById('cost-breakdown-chart-label'),
    salaryBreakdownChartLabel: document.getElementById('salary-breakdown-chart-label'),
  };

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

  toggleVisibility(allowanceMap, DOM.allowanceCheckbox, DOM.allowanceInputs);
  toggleVisibility(bonusMap, DOM.bonusCheckbox, DOM.bonusInputs);

  function formatNumberInput(input) {
    const raw = input.value.replace(/[^\d]/g, '');
    input.value = raw ? parseFloat(raw).toLocaleString('en-US') : '';
  }

  document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.classList.contains('number-input')) {
      formatNumberInput(e.target);
    }
  });

  function destroyChart(chartName) {
    if (window[chartName] && typeof window[chartName].destroy === 'function') {
      window[chartName].destroy();
      window[chartName] = null;
    }
  }

  function handleCalculation() {
    // Gather all input values and flags
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : '';
    };
    const getChecked = (id) => {
      const el = document.getElementById(id);
      return el ? el.checked : false;
    };

    const params = {
      baseSalary: getVal('base-salary'),
      isAllowanceEnabled: getChecked('allowance-checkbox'),
      lunchAllowance: getVal('allowance-lunch'),
      lunchEnabled: getChecked('lunch-checkbox'),
      fuelAllowance: getVal('allowance-fuel'),
      fuelEnabled: getChecked('fuel-checkbox'),
      phoneAllowance: getVal('allowance-phone'),
      phoneEnabled: getChecked('phone-checkbox'),
      travelAllowance: getVal('allowance-travel'),
      travelEnabled: getChecked('travel-checkbox'),
      uniformAllowance: getVal('allowance-uniform'),
      uniformEnabled: getChecked('uniform-checkbox'),
      isBonusEnabled: getChecked('bonus-checkbox'),
      productivityBonus: getVal('bonus-productivity'),
      productivityEnabled: getChecked('productivity-checkbox'),
      incentiveBonus: getVal('bonus-incentive'),
      incentiveEnabled: getChecked('incentive-checkbox'),
      kpiBonus: getVal('bonus-kpi'),
      kpiEnabled: getChecked('kpi-checkbox'),
      national: getVal('national'),
    };

    const data = calculateFromGrossToNet(params);

    if (data && data.error) {
      DOM.resultDiv.innerHTML = `<span style="color:red">${data.error}</span>`;
      DOM.downloadPdfBtn.style.display = 'none';
      renderPieChart({});
      return;
    }

    renderPieChart(data);

    // Calculate total allowance and bonus
    const totalAllowance =
      data.lunchAllowance + data.fuelAllowance + data.phoneAllowance +
      data.travelAllowance + data.uniformAllowance;

    const totalBonus =
      data.productivityBonus + data.incentiveBonus + data.kpiBonus;

    const totalAllowanceAndBonus = totalAllowance + totalBonus;

    const percentBase = ((data.baseSalary / data.grossSalary) * 100).toFixed(2);
    const percentAllowanceBonus = ((totalAllowanceAndBonus / data.grossSalary) * 100).toFixed(2);

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

    DOM.resultDiv.innerHTML = `
    ${allowanceHTML ? 'Allowances:<br>' + allowanceHTML + '<hr>' : ''}
    ${bonusHTML ? 'Bonuses:<br>' + bonusHTML + '<hr>' : ''}
      ${totalAllowanceAndBonus > 0
        ? `<b>Total Allowance and Bonus: ${totalAllowanceAndBonus.toLocaleString('en-US')} VND (${percentAllowanceBonus}%)</b><br>
      <b>Base Salary: ${data.baseSalary.toLocaleString('en-US')} VND (${percentBase}%)</b><br><hr>` : ''}
      <b>Gross Salary: ${data.grossSalary.toLocaleString('en-US')} VND</b><br><hr>
      Employee Insurance: ${data.employeeInsurance.toLocaleString('en-US')} VND<br><hr>
      (Taxable Income: ${data.taxableIncome.toLocaleString('en-US')} VND)<br>
      Employee Personal Income Tax: ${data.incomeTax.toLocaleString('en-US')} VND<br><hr>
      <b>Employee Net Salary: ${data.netSalary.toLocaleString('en-US')} VND</b><br><hr>
      Employer Insurance: ${data.employerInsurance.toLocaleString('en-US')} VND<br>
      Employer Union Fee: ${data.employerUnionFee.toLocaleString('en-US')} VND<br><hr>
      <b>Total Employer Cost: ${data.totalEmployerCost.toLocaleString('en-US')} VND</b><br><hr>
    `;
    DOM.downloadPdfBtn.style.display = 'block';
  }

  DOM.calculateBtn.addEventListener('click', handleCalculation);
  DOM.salaryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCalculation();
  });

  function renderPieChart(data) {
    // If baseSalary is falsy or 0, skip rendering and hide all chart elements
    if (!data.baseSalary) {
      destroyChart('salaryChart');
      destroyChart('costBreakdownChart');

      DOM.salaryBreakdownChart.style.display = 'none';
      DOM.salaryBreakdownChartLabel.style.display = 'none';
      DOM.costBreakdownChart.style.display = 'none';
      DOM.costBreakdownChartLabel.style.display = 'none';

      return;
    }

    const bonusAndAllowance = data.grossSalary - data.baseSalary;

    if (bonusAndAllowance === 0) {
      destroyChart('salaryChart');
      DOM.salaryBreakdownChart.style.display = 'none';
      DOM.salaryBreakdownChartLabel.style.display = 'none';
    } else {
      destroyChart('salaryChart');

      window.salaryChart = new Chart(DOM.salaryBreakdownChart.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: ['Bonus & Allowance', 'Base Salary'],
          datasets: [{
            data: [bonusAndAllowance, data.baseSalary],
            backgroundColor: ['#87cefa', '#9aff9a'],
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
                  const percent = ((value / total) * 100).toFixed(2);
                  return `${ctx.label}: ${value.toLocaleString('en-US')} VND (${percent}%)`;
                }
              }
            }
          }
        }
      });

      DOM.salaryBreakdownChart.style.display = 'block';
      DOM.salaryBreakdownChartLabel.style.display = 'block';
    }

    destroyChart('costBreakdownChart');

    // Defensive: use 0 for missing values
    const breakdownData = [
      data.employeeInsurance || 0,
      data.incomeTax || 0,
      data.employerInsurance || 0,
      data.employerUnionFee || 0,
      data.netSalary || 0
    ];

    const breakdownLabels = [
      'Employee Insurance',
      'Personal Income Tax',
      'Employer Insurance',
      'Employer Union Fee',
      'Employee Take-home (Net) Salary'
    ];

    window.costBreakdownChart = new Chart(DOM.costBreakdownChart.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: breakdownLabels,
        datasets: [{
          data: breakdownData,
          backgroundColor: [
            '#ffaaa5',
            '#ff8b94',
            '#fff4a5',
            '#ffb68b',
            '#9aff9a'
          ],
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
                return `${ctx.label}: ${value.toLocaleString('en-US')} VND (${percent}%)`;
              }
            }
          }
        }
      }
    });

    DOM.costBreakdownChart.style.display = 'block';
    DOM.costBreakdownChartLabel.style.display = 'block';
  }
});