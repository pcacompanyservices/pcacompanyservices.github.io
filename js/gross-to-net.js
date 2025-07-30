import { calculateFromGrossToNet } from './cal-gross-to-net.js';
import { html } from '../util/html-parser.js';

function formatLine(label, value) {
  return value ? `- ${label}: ${value.toLocaleString('en-US')} VND<br>` : '';
}

document.addEventListener('DOMContentLoaded', () => {

  // --- Dynamic UI creation ---
  const root = document.getElementById('gross-to-net-root');
  root.innerHTML = '';

  // Title
  const h1 = document.createElement('h1');
  h1.textContent = 'Calculate from Gross Salary';
  root.appendChild(h1);
  root.appendChild(document.createElement('hr'));

  // Form
  const salaryForm = document.createElement('form');
  salaryForm.id = 'salary-form';
  root.appendChild(salaryForm);

  // Step 1: National Status
  const step1 = document.createElement('div');
  step1.className = 'form-step';
  step1.id = 'step-1';
  step1.innerHTML = html`
    <h2>National Status</h2>
    <select id="national">
      <option value="" disabled selected>Select your national status</option>
      <option value="local">Local</option>
      <option value="expat">Expat</option>
    </select>
  `;
  salaryForm.appendChild(step1);

  // Step 2: Base Salary
  const step2 = document.createElement('div');
  step2.className = 'form-step';
  step2.id = 'step-2';
  step2.style.display = 'none';
  step2.innerHTML = html`
    <h2>Base Salary</h2>
    <input type="text" class="number-input" id="base-salary" placeholder="Min 5,000,000 VND" />
  `;
  salaryForm.appendChild(step2);

  // Step 3: Allowance
  const step3 = document.createElement('div');
  step3.className = 'form-step';
  step3.id = 'step-3';
  step3.style.display = 'none';
  step3.innerHTML = html`
    <h2>Allowance</h2>
    <div id="allowance-container">
      <label class="checkbox-item">
        <input type="checkbox" id="allowance-checkbox" /> Allowance
      </label>
      <div id="allowance-inputs" style="display: none;">
        <label class="checkbox-item">
          <input type="checkbox" id="lunch-checkbox" /> Lunch
        </label>
        <div id="lunch-input" style="display: none;">
          <input type="text" class="number-input" id="allowance-lunch" placeholder="Please enter your allowance for lunch" min="0" />
        </div>
        <label class="checkbox-item">
          <input type="checkbox" id="fuel-checkbox" /> Fuel
        </label>
        <div id="fuel-input" style="display: none;">
          <input type="text" class="number-input" id="allowance-fuel" placeholder="Please enter your allowance for fuel" min="0" />
        </div>
        <label class="checkbox-item">
          <input type="checkbox" id="phone-checkbox" /> Phone
        </label>
        <div id="phone-input" style="display: none;">
          <input type="text" class="number-input" id="allowance-phone" placeholder="Please enter your allowance for phone" min="0" />
        </div>
        <label class="checkbox-item">
          <input type="checkbox" id="travel-checkbox" /> Traveling
        </label>
        <div id="travel-input" style="display: none;">
          <input type="text" class="number-input" id="allowance-travel" placeholder="Please enter your allowance for traveling" min="0" />
        </div>
        <label class="checkbox-item">
          <input type="checkbox" id="uniform-checkbox" /> Uniform
        </label>
        <div id="uniform-input" style="display: none;">
          <input type="text" class="number-input" id="allowance-uniform" placeholder="Please enter your allowance for uniform" min="0" />
        </div>
      </div>
    </div>
  `;
  salaryForm.appendChild(step3);

  // Step 4: Bonus
  const step4 = document.createElement('div');
  step4.className = 'form-step';
  step4.id = 'step-4';
  step4.style.display = 'none';
  step4.innerHTML = html`
    <h2>Bonus</h2>
    <div id="bonus-container">
      <label class="checkbox-item">
        <input type="checkbox" id="bonus-checkbox" /> Bonus
      </label>
      <div id="bonus-inputs" style="display: none;">
        <label class="checkbox-item">
          <input type="checkbox" id="productivity-checkbox" /> Productivity
        </label>
        <div id="productivity-input" style="display: none;">
          <input type="text" class="number-input" id="bonus-productivity" placeholder="Please enter your bonus for productivity" min="0" />
        </div>
        <label class="checkbox-item">
          <input type="checkbox" id="incentive-checkbox" /> Incentive
        </label>
        <div id="incentive-input" style="display: none;">
          <input type="text" class="number-input" id="bonus-incentive" placeholder="Please enter your bonus for incentive" min="0" />
        </div>
        <label class="checkbox-item">
          <input type="checkbox" id="kpi-checkbox" /> KPI
        </label>
        <div id="kpi-input" style="display: none;">
          <input type="text" class="number-input" id="bonus-kpi" placeholder="Please enter your bonus for kpi" min="0" />
        </div>
      </div>
    </div>
  `;
  salaryForm.appendChild(step4);

  // Navigation buttons
  const navDiv = document.createElement('div');
  navDiv.className = 'form-navigation';
  navDiv.innerHTML = html`
    <button type="button" id="continue-btn" class="simulation-button">Continue</button>
    <button type="submit" id="calculate-btn" class="simulation-button" style="display:none;">Calculate</button>
    <button type="button" id="return-btn" class="simulation-button return-button" style="display:none;">Return</button>
  `;
  salaryForm.appendChild(navDiv);

  // Result and charts
  const resultDiv = document.createElement('div');
  resultDiv.className = 'result';
  resultDiv.id = 'result';
  resultDiv.setAttribute('aria-live', 'polite');
  root.appendChild(resultDiv);

  const pieChartContainer = document.createElement('div');
  pieChartContainer.className = 'pie-chart-container';
  pieChartContainer.innerHTML = html`
    <div>
      <canvas id="salary-breakdown-chart" style="display: none;"></canvas>
      <div id="salary-breakdown-chart-label" style="display: none;">Salary Breakdown</div>
    </div>
    <div>
      <canvas id="cost-breakdown-chart" style="display: none;"></canvas>
      <div id="cost-breakdown-chart-label" style="display: none;">Cost Breakdown</div>
    </div>
  `;
  root.appendChild(pieChartContainer);

  const downloadBtn = document.createElement('button');
  downloadBtn.id = 'download-pdf-btn';
  downloadBtn.style.display = 'none';
  downloadBtn.textContent = 'Download PDF';
  root.appendChild(downloadBtn);

  // --- Multi-step form navigation logic ---
  const steps = [step1, step2, step3, step4];
  const continueBtn = document.getElementById('continue-btn');
  const returnBtn = document.getElementById('return-btn');
  const calculateBtn = document.getElementById('calculate-btn');
  let currentStep = 0;

  function showStep(idx) {
    steps.forEach((step, i) => {
      if (step) step.style.display = i === idx ? '' : 'none';
    });
    // Navigation button logic
    returnBtn.style.display = idx > 0 ? '' : 'none';
    continueBtn.style.display = idx < steps.length - 1 ? '' : 'none';
    calculateBtn.style.display = idx === steps.length - 1 ? '' : 'none';
  }

  continueBtn?.addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  });
  returnBtn?.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });
  // On load, show first step
  showStep(currentStep);
  // Load Chart.js if not present
  if (!window.Chart) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    document.head.appendChild(script);
  }

  const DOM = {
    salaryForm,
    calculateBtn,
    downloadPdfBtn: downloadBtn,
    resultDiv,
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

    // Use only values from cal-gross-to-net.js result
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
      ${data.totalBonusAndAllowance > 0
        ? `<b>Total Allowance and Bonus: ${data.totalBonusAndAllowance.toLocaleString('en-US')} VND (${data.percentBonusAndAllowance}%)</b><br>
      <b>Base Salary: ${data.baseSalary.toLocaleString('en-US')} VND (${data.percentBaseSalary}%)</b><br><hr>` : ''}
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

  // Only run calculation on submit (Calculate button)
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
            backgroundColor: ['#999999', '#666666'],
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
            '#C1272D',
            '#A72126',
            '#C1272D',
            '#A72126',
            '#666666'
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