
import { calculateFromGrossToNet } from './cal-gross-to-net.js';
import { html } from '../util/html-parser.js';

// Utility to format a result line
function formatLine(label, value) {
  return value ? `- ${label}: ${value.toLocaleString('en-US')} VND<br>` : '';
}


document.addEventListener('DOMContentLoaded', () => {
  // --- Dynamic UI creation ---
  const root = document.getElementById('gross-to-net-root');
  root.innerHTML = '';

  // Title
  const h1 = document.createElement('h1');
  h1.textContent = "Calculate from Employee's Gross Salary";
  root.appendChild(h1);
  root.appendChild(document.createElement('hr'));

  // Form
  const salaryForm = document.createElement('form');
  salaryForm.id = 'salary-form';
  root.appendChild(salaryForm);

  // --- Step 1: National Status ---
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
    <button type="button" id="continue-step1" class="simulation-button unavailable" disabled>Continue</button>
  `;
  salaryForm.appendChild(step1);


  // --- Step 2: Base Salary ---
  const step2 = document.createElement('div');
  step2.className = 'form-step';
  step2.id = 'step-2';
  step2.style.display = 'none';
  step2.innerHTML = html`
    <h2>Base Salary</h2>
    <input type="text" class="number-input" id="base-salary" placeholder="Min 5,000,000 VND" />
    <button type="button" id="continue-step2" class="simulation-button unavailable" disabled>Continue</button>
  `;
  salaryForm.appendChild(step2);


  // --- Step 3: Allowance ---
  const step3 = document.createElement('div');
  step3.className = 'form-step';
  step3.id = 'step-3';
  step3.style.display = 'none';
  step3.innerHTML = html`
    <h2>Allowance</h2>
    <div id="allowance-container">
      <label class="checkbox-item">
        <input type="checkbox" id="allowance-checkbox" /> There are Allowance(s) in the Contract
      </label>
      <div id="allowance-inputs" style="display: none;">
        <label class="checkbox-item"><input type="checkbox" id="lunch-checkbox" /> Lunch</label>
        <div id="lunch-input" style="display: none;"><input type="text" class="number-input" id="allowance-lunch" placeholder="Please enter your allowance for lunch" min="0" /></div>
        <label class="checkbox-item"><input type="checkbox" id="fuel-checkbox" /> Fuel</label>
        <div id="fuel-input" style="display: none;"><input type="text" class="number-input" id="allowance-fuel" placeholder="Please enter your allowance for fuel" min="0" /></div>
        <label class="checkbox-item"><input type="checkbox" id="phone-checkbox" /> Phone</label>
        <div id="phone-input" style="display: none;"><input type="text" class="number-input" id="allowance-phone" placeholder="Please enter your allowance for phone" min="0" /></div>
        <label class="checkbox-item"><input type="checkbox" id="travel-checkbox" /> Traveling</label>
        <div id="travel-input" style="display: none;"><input type="text" class="number-input" id="allowance-travel" placeholder="Please enter your allowance for traveling" min="0" /></div>
        <label class="checkbox-item"><input type="checkbox" id="uniform-checkbox" /> Uniform</label>
        <div id="uniform-input" style="display: none;"><input type="text" class="number-input" id="allowance-uniform" placeholder="Please enter your allowance for uniform" min="0" /></div>
      </div>
    </div>
    <button type="button" id="continue-step3" class="simulation-button unavailable" disabled>Continue</button>
  `;
  salaryForm.appendChild(step3);


  // --- Step 4: Bonus ---
  const step4 = document.createElement('div');
  step4.className = 'form-step';
  step4.id = 'step-4';
  step4.style.display = 'none';
  step4.innerHTML = html`
    <h2>Bonus</h2>
    <div id="bonus-container">
      <label class="checkbox-item">
        <input type="checkbox" id="bonus-checkbox" /> There are Bonus(es) in the Contract
      </label>
      <div id="bonus-inputs" style="display: none;">
        <label class="checkbox-item"><input type="checkbox" id="productivity-checkbox" /> Productivity</label>
        <div id="productivity-input" style="display: none;"><input type="text" class="number-input" id="bonus-productivity" placeholder="Please enter your bonus for productivity" min="0" /></div>
        <label class="checkbox-item"><input type="checkbox" id="incentive-checkbox" /> Incentive</label>
        <div id="incentive-input" style="display: none;"><input type="text" class="number-input" id="bonus-incentive" placeholder="Please enter your bonus for incentive" min="0" /></div>
        <label class="checkbox-item"><input type="checkbox" id="kpi-checkbox" /> KPI</label>
        <div id="kpi-input" style="display: none;"><input type="text" class="number-input" id="bonus-kpi" placeholder="Please enter your bonus for kpi" min="0" /></div>
      </div>
    </div>
  `;
  salaryForm.appendChild(step4);


  // --- Navigation buttons (Calculate, Return) ---
  const navDiv = document.createElement('div');
  navDiv.className = 'form-navigation';
  navDiv.innerHTML = html`
    <button type="submit" id="calculate-btn" class="simulation-button" style="display:none;">Calculate</button>
    <button type="button" id="return-btn" class="simulation-button return-button" style="display:none;">Return</button>
  `;
  salaryForm.appendChild(navDiv);

  // --- Result and charts ---
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
  downloadBtn.className = 'simulation-button';
  downloadBtn.id = 'download-pdf-btn';
  downloadBtn.style.display = 'none';
  downloadBtn.textContent = 'Download PDF';
  root.appendChild(downloadBtn);

  // --- Reset button ---
  const resetBtn = document.createElement('button');
  resetBtn.className = 'simulation-button return-button';
  resetBtn.id = 'reset-btn';
  resetBtn.style.display = 'none';
  resetBtn.textContent = 'Reset';
  resetBtn.type = 'button';
  root.appendChild(resetBtn);


  // --- Multi-step form navigation logic ---
  const steps = [step1, step2, step3, step4];
  const continueBtns = [
    document.getElementById('continue-step1'),
    document.getElementById('continue-step2'),
    document.getElementById('continue-step3'),
  ];
  const returnBtn = document.getElementById('return-btn');
  const calculateBtn = document.getElementById('calculate-btn');
  let currentStep = 0;

  // Show the current step and update navigation buttons
  function showStep(idx) {
    steps.forEach((step, i) => {
      if (step) step.style.display = i === idx ? '' : 'none';
    });
    returnBtn.style.display = idx > 0 ? '' : 'none';
    calculateBtn.style.display = idx === steps.length - 1 ? '' : 'none';
  }

  // --- Step 1: National Status ---
  const nationalSelect = document.getElementById('national');
  continueBtns[0].addEventListener('click', () => {
    if (currentStep === 0 && nationalSelect.value) {
      currentStep++;
      showStep(currentStep);
    }
  });
  function updateStep1Btn() {
    if (nationalSelect.value) {
      continueBtns[0].classList.remove('unavailable');
      continueBtns[0].disabled = false;
    } else {
      continueBtns[0].classList.add('unavailable');
      continueBtns[0].disabled = true;
    }
  }
  nationalSelect.addEventListener('change', updateStep1Btn);
  updateStep1Btn();

  // --- Step 2: Base Salary ---
  const baseSalaryInput = document.getElementById('base-salary');
  continueBtns[1].addEventListener('click', () => {
    if (currentStep === 1 && baseSalaryInput.value && parseInt(baseSalaryInput.value.replace(/\D/g, '')) >= 5000000) {
      currentStep++;
      showStep(currentStep);
    }
  });
  function updateStep2Btn() {
    const val = baseSalaryInput.value.replace(/\D/g, '');
    if (val && parseInt(val) >= 5000000) {
      continueBtns[1].classList.remove('unavailable');
      continueBtns[1].disabled = false;
    } else {
      continueBtns[1].classList.add('unavailable');
      continueBtns[1].disabled = true;
    }
  }
  baseSalaryInput.addEventListener('input', updateStep2Btn);
  updateStep2Btn();

  // --- Step 3: Allowance (always enabled, can skip) ---
  continueBtns[2].addEventListener('click', () => {
    if (currentStep === 2) {
      currentStep++;
      showStep(currentStep);
    }
  });
  continueBtns[2].classList.remove('unavailable');
  continueBtns[2].disabled = false;

  // --- No continue button for step 4 ---

  // --- Return button logic ---
  returnBtn?.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  // --- On load, show first step ---
  showStep(currentStep);

  // --- Load Chart.js if not present ---
  if (!window.Chart) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    document.head.appendChild(script);
  }

  // --- DOM references ---
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

  // --- Allowance and Bonus checkbox/input mapping ---
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

  // --- Show/hide allowance/bonus input fields ---
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

  // --- Format number input fields ---
  function formatNumberInput(input) {
    const raw = input.value.replace(/[^\d]/g, '');
    input.value = raw ? parseFloat(raw).toLocaleString('en-US') : '';
  }
  document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.classList.contains('number-input')) {
      formatNumberInput(e.target);
    }
  });

  // --- Chart.js destroy helper ---
  function destroyChart(chartName) {
    if (window[chartName] && typeof window[chartName].destroy === 'function') {
      window[chartName].destroy();
      window[chartName] = null;
    }
  }

  // --- Calculation handler ---

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

    // Destroy the form and navigation UI after calculation
    if (salaryForm && salaryForm.parentNode) {
      salaryForm.parentNode.removeChild(salaryForm);
    }
    // Optionally, also remove the navigation div if it exists outside the form (not needed here)

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
    // Show reset button
    resetBtn.style.display = 'block';
  // --- Reset button logic ---
  resetBtn.addEventListener('click', () => {
    window.location.reload();
  });
  }

  // --- Calculation triggers ---
  DOM.calculateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleCalculation();
  });
  salaryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCalculation();
  });

  // --- Per-step Enter key handling ---
  steps.forEach((step, idx) => {
    step.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (idx === steps.length - 1) {
          handleCalculation();
        } else if (continueBtns[idx]) {
          if (idx === 2) {
            continueBtns[idx].click();
          } else if (idx === 1) {
            if (!continueBtns[idx].disabled) continueBtns[idx].click();
          } else if (!continueBtns[idx].disabled) {
            continueBtns[idx].click();
          }
        }
      }
    });
  });

  // --- Chart rendering ---
  function renderPieChart(data) {
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