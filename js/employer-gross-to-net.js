

import { simulateSalary } from '../be/cal.js';

// ============================================================================
// UTILITY FUNCTIONS (formerly from util/ directory)
// ============================================================================

// DOM utilities
function getElement(id) {
  return document.getElementById(id);
}

function createAndAppend(parent, tag, props = {}, innerHTML = '') {
  const el = document.createElement(tag);
  Object.assign(el, props);
  if (innerHTML) el.innerHTML = innerHTML;
  parent.appendChild(el);
  return el;
}

// HTML template literal utility
const html = (strings, ...values) =>
  strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');

// PDF export utility
async function exportResultToPdf({
  exportContainer,
  filename = 'export.pdf',
  onStart = () => {},
  onComplete = () => {}
}) {
  if (!window.jspdf || !window.jspdf.jsPDF || !window.html2canvas) {
    throw new Error('jsPDF and html2canvas must be loaded before calling exportResultToPdf');
  }
  onStart();
  await document.fonts.ready;
  window.html2canvas(exportContainer, {
    backgroundColor: '#fff',
    scale: 2,
    useCORS: true
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const jsPDF = window.jspdf.jsPDF;
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = 595.28;
    const margin = 40;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let y = margin;
    pdf.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
    pdf.save(filename);
    onComplete();
  });
}

// Format utilities
function formatLine(label, value) {
  return value ? `- ${label}: ${value.toLocaleString('en-US')} VND<br>` : '';
}

function safeText(text) {
  return text ? String(text) : '';
}

function formatCurrency(val) {
  return val ? val.toLocaleString('en-US') + ' VND' : '-';
}

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const MIN_SALARY = 5000000;
const MAX_DIGITS = 9;

const ALLOWANCE_FIELDS = {
  'lunch-checkbox': 'lunch-input',
  'fuel-checkbox': 'fuel-input',
  'phone-checkbox': 'phone-input',
  'travel-checkbox': 'travel-input',
  'uniform-checkbox': 'uniform-input',
  'other-allowance-checkbox': 'other-allowance-input',
};

const BONUS_FIELDS = {
  'productivity-checkbox': 'productivity-input',
  'incentive-checkbox': 'incentive-input',
  'kpi-checkbox': 'kpi-input',
  'other-bonus-checkbox': 'other-bonus-input',
};

// ============================================================================
// UI CREATION FUNCTIONS
// ============================================================================
function createProgressBar(root) {
  const progressBar = createAndAppend(root, 'div', { id: 'progress-bar' });
  progressBar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin:18px 0;width:100%;max-width:480px;margin-left:auto;margin-right:auto;user-select:none;';
  progressBar.innerHTML = html`
    <div class="progress-step" data-step="0">Citizenship</div>
    <div class="progress-bar-line"></div>
    <div class="progress-step" data-step="1">Gross Salary</div>
    <div class="progress-bar-line"></div>
    <div class="progress-step" data-step="2">Allowances</div>
    <div class="progress-bar-line"></div>
    <div class="progress-step" data-step="3">Bonuses</div>
  `;
  return progressBar;
}

function createTitleBlock(root) {
  const h1 = createAndAppend(root, 'h1');
  h1.textContent = "Calculate from Employee's Gross Salary";
  root.appendChild(document.createElement('hr'));
  return h1;
}

function createSalaryForm(root) {
  const salaryForm = createAndAppend(root, 'form', { id: 'salary-form' });
  return salaryForm;
}

function createStep1() {
  const step1 = document.createElement('div');
  step1.className = 'form-step';
  step1.id = 'step-1';
  step1.innerHTML = html`
    <div class="step-title-row">
      <h2>Citizenship</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vitae.</span>
      </span>
    </div>
    <select id="citizenship">
      <option value="" disabled selected>Select your citizenship</option>
      <option value="local">Local</option>
      <option value="expat">Expat</option>
    </select>
    <button type="button" id="continue-step1" class="simulation-button unavailable" disabled>Continue</button>
  `;
  return step1;
}

function createStep2() {
  const step2 = document.createElement('div');
  step2.className = 'form-step';
  step2.id = 'step-2';
  step2.style.display = 'none';
  step2.innerHTML = html`
    <div class="step-title-row">
      <h2>Gross Salary</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vitae.</span>
      </span>
    </div>
    <input type="text" class="number-input" id="gross-salary" placeholder="Min 5,000,000 VND" />
    <div id="gross-salary-warning" class="input-warning" style="display:none;">Maximum 9 digits allowed.</div>
    <button type="button" id="continue-step2" class="simulation-button unavailable" disabled>Continue</button>
  `;
  return step2;
}

function createStep3() {
  const step3 = document.createElement('div');
  step3.className = 'form-step';
  step3.id = 'step-3';
  step3.style.display = 'none';
  step3.innerHTML = html`
    <div class="step-title-row">
      <h2>Allowances</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vitae.</span>
      </span>
    </div>
    <div id="allowance-container">
      <label class="checkbox-item">
        <input type="checkbox" id="allowance-checkbox" /> There are Allowances in the Contract
      </label>
      <div id="allowance-inputs" style="display: none;">
        <div id="allowance-warning" class="input-warning" style="display:none;">Maximum 9 digits allowed.</div>
        <label class="checkbox-item"><input type="checkbox" id="lunch-checkbox" /> Lunch
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">Specify your monthly allowance for lunch in the contract.</span>
          </span>
        </label>
        <div id="lunch-input" style="display: none;"><input type="text" class="number-input" id="allowance-lunch" placeholder="Lunch allowance (VND)" min="0" /></div>
        <label class="checkbox-item"><input type="checkbox" id="fuel-checkbox" /> Fuel
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">Specify your monthly allowance for fuel in the contract.</span>
          </span>
        </label>
        <div id="fuel-input" style="display: none;"><input type="text" class="number-input" id="allowance-fuel" placeholder="Fuel allowance (VND)" min="0" /></div>
        <label class="checkbox-item"><input type="checkbox" id="phone-checkbox" /> Phone
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">Specify your monthly allowance for phone in the contract.</span>
          </span>
        </label>
        <div id="phone-input" style="display: none;"><input type="text" class="number-input" id="allowance-phone" placeholder="Phone allowance (VND)" min="0" /></div>
        <label class="checkbox-item"><input type="checkbox" id="travel-checkbox" /> Traveling
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">Specify your monthly allowance for traveling in the contract.</span>
          </span>
        </label>
        <div id="travel-input" style="display: none;"><input type="text" class="number-input" id="allowance-travel" placeholder="Travel allowance (VND)" min="0" /></div>
        <label class="checkbox-item"><input type="checkbox" id="uniform-checkbox" /> Uniform
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">Specify your monthly allowance for uniform in the contract.</span>
          </span>
        </label>
        <div id="uniform-input" style="display: none;"><input type="text" class="number-input" id="allowance-uniform" placeholder="Uniform allowance (VND)" min="0" /></div>
        <label class="checkbox-item"><input type="checkbox" id="other-allowance-checkbox" /> Other Allowances
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">Enter any other allowances in the contract that are not listed above.</span>
          </span>
        </label>
        <div id="other-allowance-input" style="display: none;"><input type="text" class="number-input" id="allowance-other" placeholder="Other allowances (VND)" min="0" /></div>
      </div>
    </div>
    <button type="button" id="continue-step3" class="simulation-button unavailable" disabled>Continue</button>
  `;
  return step3;
}

function createStep4() {
  const step4 = document.createElement('div');
  step4.className = 'form-step';
  step4.id = 'step-4';
  step4.style.display = 'none';
  step4.innerHTML = html`
    <div class="step-title-row">
      <h2>Bonuses</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vitae.</span>
      </span>
    </div>
    <div id="bonus-container">
      <label class="checkbox-item">
        <input type="checkbox" id="bonus-checkbox" /> There are Bonuses in the Contract
      </label>
      <div id="bonus-inputs" style="display: none;">
        <div id="bonus-warning" class="input-warning" style="display:none;">Maximum 9 digits allowed.</div>
        <label class="checkbox-item"><input type="checkbox" id="productivity-checkbox" /> Productivity
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">Specify your monthly bonus for productivity in the contract.</span>
          </span>
        </label>
        <div id="productivity-input" style="display: none;"><input type="text" class="number-input" id="bonus-productivity" placeholder="Productivity bonus (VND)" min="0" /></div>
        <label class="checkbox-item"><input type="checkbox" id="incentive-checkbox" /> Incentive
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">Specify your monthly bonus for incentive in the contract.</span>
          </span>
        </label>
        <div id="incentive-input" style="display: none;"><input type="text" class="number-input" id="bonus-incentive" placeholder="Incentive bonus (VND)" min="0" /></div>
        <label class="checkbox-item"><input type="checkbox" id="kpi-checkbox" /> KPI
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">Specify your monthly bonus for KPI in the contract.</span>
          </span>
        </label>
        <div id="kpi-input" style="display: none;"><input type="text" class="number-input" id="bonus-kpi" placeholder="KPI bonus (VND)" min="0" /></div>
        <label class="checkbox-item"><input type="checkbox" id="other-bonus-checkbox" /> Other Bonuses
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">Enter any other bonuses in the contract that are not listed above.</span>
          </span>
        </label>
        <div id="other-bonus-input" style="display: none;"><input type="text" class="number-input" id="bonus-other" placeholder="Other bonuses (VND)" min="0" /></div>
      </div>
    </div>
  `;
  return step4;
}

function createNavButtons() {
  const navDiv = document.createElement('div');
  navDiv.className = 'form-navigation';
  navDiv.innerHTML = html`
    <button type="submit" id="calculate-btn" class="simulation-button" style="display:none;">Calculate</button>
    <button type="button" id="return-btn" class="simulation-button return-button" style="display:none;">Return</button>
  `;
  return navDiv;
}

function createResultAndCharts(root) {
  const resultDiv = createAndAppend(root, 'div', { className: 'result', id: 'result', 'aria-live': 'polite' });
  const pieChartContainer = createAndAppend(root, 'div', { className: 'pie-chart-container' });
  pieChartContainer.innerHTML = html`
    <div id="salary-chart-block">
      <canvas id="salary-breakdown-chart" style="display: none;"></canvas>
      <div id="salary-breakdown-chart-label" style="display: none;">Salary Breakdown</div>
    </div>
    <div id="cost-chart-block">
      <canvas id="cost-breakdown-chart" style="display: none;"></canvas>
      <div id="cost-breakdown-chart-label" style="display: none;">Cost Breakdown</div>
    </div>
  `;
  return { resultDiv, pieChartContainer };
}

function createDownloadButton(root) {
  const downloadBtn = createAndAppend(root, 'button', {
    className: 'simulation-button',
    id: 'download-pdf-btn',
    style: 'display:none;',
    textContent: 'Download PDF'
  });
  return downloadBtn;
}

function createResetButton(root) {
  const resetBtn = createAndAppend(root, 'button', {
    className: 'simulation-button return-button',
    id: 'reset-btn',
    style: 'display:none;',
    textContent: 'Modify Information',
    type: 'button'
  });
  return resetBtn;
}

function createHardResetButton(root) {
  const hardResetBtn = createAndAppend(root, 'button', {
    className: 'simulation-button return-button',
    id: 'hard-reset-btn',
    style: 'display:none;',
    textContent: 'Reset',
    type: 'button'
  });
  return hardResetBtn;
}

document.addEventListener('DOMContentLoaded', () => {
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  const root = getElement('gross-to-net-root');
  root.innerHTML = '';

  // Create UI components
  createTitleBlock(root);
  createProgressBar(root);
  const salaryForm = createSalaryForm(root);
  
  // Create form steps
  const step1 = createStep1();
  const step2 = createStep2();
  const step3 = createStep3();
  const step4 = createStep4();
  
  salaryForm.appendChild(step1);
  salaryForm.appendChild(step2);
  salaryForm.appendChild(step3);
  salaryForm.appendChild(step4);
  salaryForm.appendChild(createNavButtons());
  
  // Create result containers and buttons
  const { resultDiv, pieChartContainer } = createResultAndCharts(root);
  const downloadBtn = createDownloadButton(root);
  const resetBtn = createResetButton(root);
  const hardResetBtn = createHardResetButton(root);

  // ============================================================================
  // FORM NAVIGATION
  // ============================================================================
  const steps = [step1, step2, step3, step4];
  const continueBtns = [
    getElement('continue-step1'),
    getElement('continue-step2'),
    getElement('continue-step3'),
  ];
  const returnBtn = getElement('return-btn');
  const calculateBtn = getElement('calculate-btn');
  let currentStep = 0;

  function showStep(idx) {
    steps.forEach((step, i) => {
      if (step) step.style.display = i === idx ? '' : 'none';
    });
    
    returnBtn.style.display = idx > 0 ? '' : 'none';
    calculateBtn.style.display = idx === steps.length - 1 ? '' : 'none';
    
    // Auto-focus gross salary input on step 2
    if (idx === 1) {
      const grossSalaryInput = document.getElementById('gross-salary');
      if (grossSalaryInput) {
        grossSalaryInput.focus();
        grossSalaryInput.select && grossSalaryInput.select();
      }
    }
    
    updateProgressBar(idx);
  }

  function updateProgressBar(idx) {
    const stepsEls = document.querySelectorAll('#progress-bar .progress-step');
    stepsEls.forEach((el, i) => {
      if (i < idx) {
        el.classList.add('completed');
        el.classList.remove('active');
      } else if (i === idx) {
        el.classList.add('active');
        el.classList.remove('completed');
      } else {
        el.classList.remove('active', 'completed');
      }
    });
    
    const lines = document.querySelectorAll('#progress-bar .progress-bar-line');
    lines.forEach((line, i) => {
      if (i < idx) {
        line.classList.add('completed');
      } else {
        line.classList.remove('completed');
      }
    });
  }

  // ============================================================================
  // STEP VALIDATION AND EVENT HANDLERS
  // ============================================================================

  // Step 1: Citizenship Selection
  const citizenshipSelect = getElement('citizenship');
  
  function updateStep1Btn() {
    const isValid = citizenshipSelect.value;
    continueBtns[0].classList.toggle('unavailable', !isValid);
    continueBtns[0].disabled = !isValid;
  }
  
  continueBtns[0].addEventListener('click', () => {
    if (currentStep === 0 && citizenshipSelect.value) {
      currentStep++;
      showStep(currentStep);
    }
  });
  citizenshipSelect.addEventListener('change', updateStep1Btn);
  updateStep1Btn();

  // Step 2: Gross Salary Input
  const grossSalaryInput = getElement('gross-salary');
  
  function updateStep2Btn() {
    const numericValue = parseInt(grossSalaryInput.value.replace(/\D/g, '')) || 0;
    const isValid = numericValue >= MIN_SALARY;
    continueBtns[1].classList.toggle('unavailable', !isValid);
    continueBtns[1].disabled = !isValid;
  }
  
  continueBtns[1].addEventListener('click', () => {
    if (currentStep === 1) {
      const numericValue = parseInt(grossSalaryInput.value.replace(/\D/g, '')) || 0;
      if (numericValue >= MIN_SALARY) {
        currentStep++;
        showStep(currentStep);
      }
    }
  });
  grossSalaryInput.addEventListener('input', updateStep2Btn);
  updateStep2Btn();

  // Step 3: Allowances (always enabled, can skip)
  continueBtns[2].addEventListener('click', () => {
    if (currentStep === 2) {
      currentStep++;
      showStep(currentStep);
    }
  });
  continueBtns[2].classList.remove('unavailable');
  continueBtns[2].disabled = false;

  // Return button
  returnBtn?.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  // Initialize first step
  showStep(currentStep);

  // ============================================================================
  // CHART.JS INITIALIZATION
  // ============================================================================
  
  if (!window.Chart) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    document.head.appendChild(script);
  }

  // ============================================================================
  // DOM REFERENCES
  // ============================================================================
  const DOM = {
    salaryForm,
    calculateBtn,
    downloadPdfBtn: downloadBtn,
    resultDiv,
    allowanceCheckbox: getElement('allowance-checkbox'),
    allowanceInputs: getElement('allowance-inputs'),
    bonusCheckbox: getElement('bonus-checkbox'),
    bonusInputs: getElement('bonus-inputs'),
    costBreakdownChart: getElement('cost-breakdown-chart'),
    salaryBreakdownChart: getElement('salary-breakdown-chart'),
    costBreakdownChartLabel: getElement('cost-breakdown-chart-label'),
    salaryBreakdownChartLabel: getElement('salary-breakdown-chart-label'),
  };

  // ============================================================================
  // DYNAMIC FIELD MANAGEMENT
  // ============================================================================

  function toggleVisibility(fieldMap, parentCheckbox, container) {
    parentCheckbox.addEventListener('change', () => {
      container.style.display = parentCheckbox.checked ? 'block' : 'none';
      
      Object.entries(fieldMap).forEach(([checkboxId, inputId]) => {
        const checkbox = getElement(checkboxId);
        const inputDiv = getElement(inputId);
        if (checkbox && inputDiv) {
          inputDiv.style.display = checkbox.checked && parentCheckbox.checked ? 'block' : 'none';
        }
      });
      
      // Auto-focus first visible input when parent checkbox is checked
      if (parentCheckbox.checked) {
        setTimeout(() => {
          const firstChecked = container.querySelector('input[type="checkbox"]:checked');
          if (firstChecked) {
            const inputDiv = getElement(fieldMap[firstChecked.id]);
            if (inputDiv) {
              const textInput = inputDiv.querySelector('input[type="text"]');
              if (textInput) {
                textInput.focus();
                textInput.select && textInput.select();
              }
            }
          }
        }, 0);
      }
    });
    
    Object.entries(fieldMap).forEach(([checkboxId, inputId]) => {
      const checkbox = getElement(checkboxId);
      const inputDiv = getElement(inputId);
      if (checkbox && inputDiv) {
        checkbox.addEventListener('change', () => {
          inputDiv.style.display = checkbox.checked && parentCheckbox.checked ? 'block' : 'none';
          
          // Auto-focus input when checkbox is checked
          if (checkbox.checked && parentCheckbox.checked) {
            setTimeout(() => {
              const textInput = inputDiv.querySelector('input[type="text"]');
              if (textInput) {
                textInput.focus();
                textInput.select && textInput.select();
              }
            }, 0);
          }
        });
      }
    });
  }

  toggleVisibility(ALLOWANCE_FIELDS, DOM.allowanceCheckbox, DOM.allowanceInputs);
  toggleVisibility(BONUS_FIELDS, DOM.bonusCheckbox, DOM.bonusInputs);

  // ============================================================================
  // NUMBER FORMATTING
  // ============================================================================

  function formatNumberInput(input) {
    let rawValue = input.value.replace(/[^\d]/g, '');
    let warningElement = null;
    
    // Get appropriate warning element
    if (input.id === 'gross-salary') {
      warningElement = document.getElementById('gross-salary-warning');
    } else if (input.closest('#allowance-inputs')) {
      warningElement = document.getElementById('allowance-warning');
    } else if (input.closest('#bonus-inputs')) {
      warningElement = document.getElementById('bonus-warning');
    }
    
    // Check max digits limit
    if (rawValue.length > MAX_DIGITS) {
      if (warningElement) warningElement.style.display = '';
      rawValue = rawValue.slice(0, MAX_DIGITS);
    } else {
      if (warningElement) warningElement.style.display = 'none';
    }
    
    // Format with commas
    if (rawValue) {
      const numericValue = parseInt(rawValue, 10);
      input.value = numericValue ? numericValue.toLocaleString('en-US') : '';
    } else {
      input.value = '';
    }
  }

  // Apply number formatting to all number inputs
  document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.classList.contains('number-input')) {
      formatNumberInput(e.target);
    }
  });

  // ============================================================================
  // CHART UTILITIES
  // ============================================================================
  
  function destroyChart(chartName) {
    if (window[chartName] && typeof window[chartName].destroy === 'function') {
      window[chartName].destroy();
      window[chartName] = null;
    }
  }

  // ============================================================================
  // CALCULATION LOGIC
  // ============================================================================

  function handleCalculation() {
    // Helper functions
    const parseNumber = (val) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      return parseFloat((val + '').replace(/,/g, '')) || 0;
    };
    
    const getVal = (id) => {
      const element = getElement(id);
      return element ? element.value : '';
    };
    
    const getChecked = (id) => {
      const element = getElement(id);
      return element ? element.checked : false;
    };

    // Collect form data
    const params = {
      method: 'gross-to-net',
      grossSalary: parseNumber(getVal('gross-salary')),
      isAllowanceEnabled: getChecked('allowance-checkbox'),
      lunchAllowance: parseNumber(getVal('allowance-lunch')),
      lunchEnabled: getChecked('lunch-checkbox'),
      fuelAllowance: parseNumber(getVal('allowance-fuel')),
      fuelEnabled: getChecked('fuel-checkbox'),
      phoneAllowance: parseNumber(getVal('allowance-phone')),
      phoneEnabled: getChecked('phone-checkbox'),
      travelAllowance: parseNumber(getVal('allowance-travel')),
      travelEnabled: getChecked('travel-checkbox'),
      uniformAllowance: parseNumber(getVal('allowance-uniform')),
      uniformEnabled: getChecked('uniform-checkbox'),
      otherAllowance: parseNumber(getVal('allowance-other')),
      otherAllowanceEnabled: getChecked('other-allowance-checkbox'),
      isBonusEnabled: getChecked('bonus-checkbox'),
      productivityBonus: parseNumber(getVal('bonus-productivity')),
      productivityEnabled: getChecked('productivity-checkbox'),
      incentiveBonus: parseNumber(getVal('bonus-incentive')),
      incentiveEnabled: getChecked('incentive-checkbox'),
      kpiBonus: parseNumber(getVal('bonus-kpi')),
      kpiEnabled: getChecked('kpi-checkbox'),
      otherBonus: parseNumber(getVal('bonus-other')),
      otherBonusEnabled: getChecked('other-bonus-checkbox'),
      citizenship: getVal('citizenship'),
    };

    // Simulate salary calculation
    const data = simulateSalary(params);

    // Handle calculation errors
    if (data && data.error) {
      DOM.resultDiv.innerHTML = `<span style="color:red">${data.error}</span>`;
      DOM.downloadPdfBtn.style.display = 'none';
      renderPieChart({});
      return;
    }

    // Clean up form UI after successful calculation
    cleanupFormAfterCalculation();
    
    // Render results
    renderResults(data);
    renderPieChart(data);
    
    // Show action buttons
    DOM.downloadPdfBtn.style.display = 'block';
    resetBtn.style.display = 'block';
    hardResetBtn.style.display = 'block';
    
    // Setup button handlers
    setupResetHandlers();
  }

  function cleanupFormAfterCalculation() {
    // Remove form and hide progress bar
    if (salaryForm && salaryForm.parentNode) {
      salaryForm.parentNode.removeChild(salaryForm);
    }
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) progressBar.style.display = 'none';
  }

  function renderResults(data) {
    // Prepare allowance and bonus items
    const allowanceItems = [
      { label: 'Lunch', value: data.lunchAllowance },
      { label: 'Fuel', value: data.fuelAllowance },
      { label: 'Phone', value: data.phoneAllowance },
      { label: 'Traveling', value: data.travelAllowance },
      { label: 'Uniform', value: data.uniformAllowance },
      { label: 'Other', value: data.otherAllowance }
    ].filter(item => item.value && item.value > 0);
    
    const bonusItems = [
      { label: 'Productivity', value: data.productivityBonus },
      { label: 'Incentive', value: data.incentiveBonus },
      { label: 'KPI', value: data.kpiBonus },
      { label: 'Other', value: data.otherBonus }
    ].filter(item => item.value && item.value > 0);

    // Generate table rows
    const allowanceRow = generateAllowanceRow(allowanceItems, data.totalAllowance);
    const bonusRow = generateBonusRow(bonusItems, data.totalBonus);
    const noAllowanceBonusRow = (allowanceItems.length === 0 && bonusItems.length === 0) 
      ? `<tr><td colspan="2"><div class="result-center-value" style="font-size:1em; color:#888;">(There are no Allowances or Bonuses in the Contract)</div></td></tr>`
      : '';

    // Generate content sections
    const employeeTypeLabel = getEmployeeTypeLabel(data.citizenship);
    const employeeTypeCell = `<div class="result-title"><u>${employeeTypeLabel}</u></div>`;
    const grossSalaryCell = `<div class="result-title">Gross Salary</div><div class="result-center-value">${data.grossSalary ? data.grossSalary.toLocaleString('en-US') + ' VND' : '-'}</div>`;
    const adjustedGrossSalaryCell = `<div class="result-title">Adjusted Gross Salary</div><div class="result-center-value">${data.adjustedGrossSalary ? data.adjustedGrossSalary.toLocaleString('en-US') + ' VND' : '-'}</div>`;

    const employerDetailsCell = generateEmployerDetailsCell(data);
    const employeeDetailsCell = generateEmployeeDetailsCell(data);
    const employerTotalCell = `<div class="result-total"><span class="employer-total-value">${data.totalEmployerCost.toLocaleString('en-US')} VND</span></div>`;
    const employeeTotalCell = `<div class="result-total"><span class="employee-total-value">${data.netSalary.toLocaleString('en-US')} VND</span></div>`;

    // Render final result table
    DOM.resultDiv.innerHTML = html`
      <h1 style="text-align:center;margin-bottom:16px;font-size:30px">PAYSLIP</h1>
      <div class="result-table-container">
        <table class="result-table result-table-vertical result-table-bordered employer-table-layout">
          <tr><td colspan="2">${employeeTypeCell}</td></tr>
          <tr><td colspan="2">${grossSalaryCell}</td></tr>
          ${allowanceRow}
          ${bonusRow}
          ${noAllowanceBonusRow}
          <tr><td colspan="2">${adjustedGrossSalaryCell}</td></tr>
          <tr>
            <td style="padding:0;vertical-align:top;">${employerDetailsCell}</td>
            <td style="padding:0;vertical-align:top;">${employeeDetailsCell}</td>
          </tr>
          <tr>
            <td class="result-total">${employerTotalCell}</td>
            <td class="result-total">${employeeTotalCell}</td>
          </tr>
        </table>
      </div>
      <div class="salary-visualization-heading" style="text-align:center;margin:24px 0 0 0;font-size:1.125em;font-weight:bold;">Salary Visualization</div>
    `;
  }

  function generateAllowanceRow(allowanceItems, totalAllowance) {
    if (allowanceItems.length === 0) return '';
    
    return `
      <tr>
        <td colspan="2">
          <div class="result-title">Allowances</div>
          <div class="result-list">
            ${allowanceItems.map(item => `<div class="result-item">${item.label}: <span>${item.value.toLocaleString('en-US')} VND</span></div>`).join('')}
          </div>
          <hr class="result-divider" />
          <div class="result-total"><span>${totalAllowance.toLocaleString('en-US')} VND</span></div>
        </td>
      </tr>
    `;
  }

  function generateBonusRow(bonusItems, totalBonus) {
    if (bonusItems.length === 0) return '';
    
    return `
      <tr>
        <td colspan="2">
          <div class="result-title">Bonuses</div>
          <div class="result-list">
            ${bonusItems.map(item => `<div class="result-item">${item.label}: <span>${item.value.toLocaleString('en-US')} VND</span></div>`).join('')}
          </div>
          <hr class="result-divider" />
          <div class="result-total"><span>${totalBonus.toLocaleString('en-US')} VND</span></div>
        </td>
      </tr>
    `;
  }

  function getEmployeeTypeLabel(citizenship) {
    switch (citizenship) {
      case 'local': return 'Local Employee';
      case 'expat': return 'Expat Employee';
      default: return 'Employee';
    }
  }

  function generateEmployerDetailsCell(data) {
    return html`
      <div class="result-title">Employer Cost</div>
      <div class="result-list">
        <div class="result-item">Social Insurance: <span>+${data.employerInsurance.toLocaleString('en-US')} VND</span></div>
        <div class="result-item">Union Fee: <span>+${data.employerUnionFee.toLocaleString('en-US')} VND</span></div>
      </div>
    `;
  }

  function generateEmployeeDetailsCell(data) {
    return html`
      <div class="result-title">Employee Take-home</div>
      <div class="result-list">
        <div class="result-item">Social Insurance: <span>-${data.employeeInsurance.toLocaleString('en-US')} VND</span></div>
        <div class="result-item">Personal Income Tax: <span>-${data.incomeTax.toLocaleString('en-US')} VND</span></div>
      </div>
    `;
  }

  function setupResetHandlers() {
    resetBtn.onclick = () => {
      // Hide results and buttons
      DOM.resultDiv.innerHTML = '';
      DOM.downloadPdfBtn.style.display = 'none';
      resetBtn.style.display = 'none';
      hardResetBtn.style.display = 'none';
      
      // Hide charts
      if (DOM.salaryBreakdownChart) DOM.salaryBreakdownChart.style.display = 'none';
      if (DOM.salaryBreakdownChartLabel) DOM.salaryBreakdownChartLabel.style.display = 'none';
      if (DOM.costBreakdownChart) DOM.costBreakdownChart.style.display = 'none';
      if (DOM.costBreakdownChartLabel) DOM.costBreakdownChartLabel.style.display = 'none';
      
      // Re-insert form
      if (!document.getElementById('salary-form')) {
        root.insertBefore(salaryForm, DOM.resultDiv);
      }
      
      // Show progress bar and reset to first step
      const progressBar = document.getElementById('progress-bar');
      if (progressBar) progressBar.style.display = 'flex';
      currentStep = 0;
      showStep(currentStep);
    };

    hardResetBtn.onclick = () => {
      window.location.reload();
    };
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  // Calculation event handlers
  DOM.calculateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleCalculation();
  });
  
  salaryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCalculation();
  });

  // Enter key handling for each step
  steps.forEach((step, idx) => {
    step.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (idx === steps.length - 1) {
          handleCalculation();
        } else if (continueBtns[idx]) {
          if (idx === 2 || !continueBtns[idx].disabled) {
            continueBtns[idx].click();
          }
        }
      }
    });
  });

  // ============================================================================
  // CHART RENDERING
  // ============================================================================

  function renderPieChart(data) {
    function updateChartBlockVisibility(showSalary, showCost) {
      const salaryBlock = document.getElementById('salary-chart-block');
      const costBlock = document.getElementById('cost-chart-block');
      
      if (salaryBlock) salaryBlock.style.display = showSalary ? 'flex' : 'none';
      if (costBlock) costBlock.style.display = showCost ? 'flex' : 'none';
      
      // Center charts when only one is visible
      const pieChartContainer = document.querySelector('.pie-chart-container');
      if (pieChartContainer) {
        pieChartContainer.style.justifyContent = 'center';
      }
    }

    // Handle empty data
    if (!data.grossSalary) {
      destroyChart('salaryChart');
      destroyChart('costBreakdownChart');
      DOM.salaryBreakdownChart.style.display = 'none';
      DOM.salaryBreakdownChartLabel.style.display = 'none';
      DOM.costBreakdownChart.style.display = 'none';
      DOM.costBreakdownChartLabel.style.display = 'none';
      updateChartBlockVisibility(false, false);
      return;
    }

    // Render salary breakdown chart
    const bonusAndAllowance = data.adjustedGrossSalary - data.grossSalary;
    if (bonusAndAllowance === 0) {
      destroyChart('salaryChart');
      DOM.salaryBreakdownChart.style.display = 'none';
      DOM.salaryBreakdownChartLabel.style.display = 'none';
      updateChartBlockVisibility(false, true);
    } else {
      renderSalaryChart(bonusAndAllowance, data.grossSalary);
      DOM.salaryBreakdownChart.style.display = 'block';
      DOM.salaryBreakdownChartLabel.style.display = 'block';
      updateChartBlockVisibility(true, true);
    }

    // Render cost breakdown chart
    renderCostChart(data);
    DOM.costBreakdownChart.style.display = 'block';
    DOM.costBreakdownChartLabel.style.display = 'block';
  }

  function renderSalaryChart(bonusAndAllowance, grossSalary) {
    destroyChart('salaryChart');
    window.salaryChart = new Chart(DOM.salaryBreakdownChart.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Bonus & Allowance', 'Gross Salary'],
        datasets: [{
          data: [bonusAndAllowance, grossSalary],
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
  }

  function renderCostChart(data) {
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
  }
  // ============================================================================
  // PDF EXPORT
  // ============================================================================

  function ensureJsPdfAndHtml2Canvas(callback) {
    let loaded = 0;
    const checkLoaded = () => { 
      loaded++; 
      if (loaded === 2) callback(); 
    };
    
    // Load jsPDF
    if (!window.jspdf || !window.jspdf.jsPDF) {
      const jsPdfScript = document.createElement('script');
      jsPdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      jsPdfScript.onload = checkLoaded;
      document.head.appendChild(jsPdfScript);
    } else {
      loaded++;
    }
    
    // Load html2canvas
    if (!window.html2canvas) {
      const html2canvasScript = document.createElement('script');
      html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      html2canvasScript.onload = checkLoaded;
      document.head.appendChild(html2canvasScript);
    } else {
      loaded++;
    }
    
    // If both are already loaded
    if ((window.jspdf && window.jspdf.jsPDF) && window.html2canvas) {
      callback();
    }
  }

  function setupDownloadButton() {
    downloadBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      ensureJsPdfAndHtml2Canvas(async () => {
        const resultTableContainer = document.querySelector('.result-table-container');
        if (!resultTableContainer) return;
        
        // Create export container
        const exportContainer = document.createElement('div');
        exportContainer.className = 'pdf-export-container';
        
        // Add logo if exists
        const logo = document.querySelector('.logo');
        if (logo) {
          exportContainer.appendChild(logo.cloneNode(true));
        }
        
        // Add PAYSLIP title
        const payslipTitle = document.createElement('h1');
        payslipTitle.textContent = 'PAYSLIP';
        payslipTitle.style.textAlign = 'center';
        payslipTitle.style.marginBottom = '16px';
        exportContainer.appendChild(payslipTitle);
        
        // Add hr if exists
        const hr = root.querySelector('hr');
        if (hr) {
          exportContainer.appendChild(hr.cloneNode(true));
        }
        
        // Add result table
        exportContainer.appendChild(resultTableContainer.cloneNode(true));
        document.body.appendChild(exportContainer);
        
        // Generate filename with current date
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const filename = `[PCA Salary Simulation]_${day}-${month}-${year}.pdf`;
        
        // Export to PDF
        await exportResultToPdf({
          exportContainer,
          filename,
          onComplete: () => {
            document.body.removeChild(exportContainer);
          }
        });
      });
    });
  }

  setupDownloadButton();
});