

import { simulateSalary } from '../be/cal.js';
import { TEXT } from '../lang/eng.js';

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
  return value ? `- ${label}: ${value.toLocaleString('vi-VN')} VND<br>` : '';
}

function safeText(text) {
  return text ? String(text) : '';
}

function formatCurrency(val) {
  return val ? val.toLocaleString('vi-VN') + ' VND' : '-';
}



// --- UI creation functions ---
function createProgressBar(root) {
  const progressBar = createAndAppend(root, 'div', { id: 'progress-bar' });
  progressBar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin:18px 0;width:100%;max-width:480px;margin-left:auto;margin-right:auto;user-select:none;';
  progressBar.innerHTML = html`
  <div class="progress-step" data-step="0">${TEXT.employeeGrossToNet.progressSteps.citizenship}</div>
    <div class="progress-bar-line"></div>
  <div class="progress-step" data-step="1">${TEXT.employeeGrossToNet.progressSteps.grossSalary}</div>
    <div class="progress-bar-line"></div>
  <div class="progress-step" data-step="2">${TEXT.employeeGrossToNet.progressSteps.allowance}</div>
    <div class="progress-bar-line"></div>
  <div class="progress-step" data-step="3">${TEXT.employeeGrossToNet.progressSteps.bonus}</div>
  `;
  return progressBar;
}

function createTitleBlock(root) {
  const h1 = createAndAppend(root, 'h1');
  h1.textContent = TEXT.employeeGrossToNet.pageTitle;
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
      <h2>${TEXT.employeeGrossToNet.steps.citizenship.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT.employeeGrossToNet.steps.citizenship.tooltip}</span>
      </span>
    </div>
    <select id="citizenship">
      <option value="" disabled selected>${TEXT.employeeGrossToNet.steps.citizenship.selectPlaceholder}</option>
      <option value="local">${TEXT.employeeGrossToNet.steps.citizenship.options.local}</option>
      <option value="expat">${TEXT.employeeGrossToNet.steps.citizenship.options.expat}</option>
    </select>
    <button type="button" id="continue-step1" class="simulation-button unavailable" disabled>${TEXT.employeeGrossToNet.steps.citizenship.continue}</button>
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
      <h2>${TEXT.employeeGrossToNet.steps.grossSalary.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT.employeeGrossToNet.steps.grossSalary.tooltip}</span>
      </span>
    </div>
    <input type="text" class="number-input" id="gross-salary" placeholder="${TEXT.employeeGrossToNet.steps.grossSalary.placeholder}" />
    <div id="gross-salary-warning" class="input-warning" style="display:none;">${TEXT.employeeGrossToNet.steps.grossSalary.warningMaxDigits}</div>
    <button type="button" id="continue-step2" class="simulation-button unavailable" disabled>${TEXT.employeeGrossToNet.steps.grossSalary.continue}</button>
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
    <h2>${TEXT.employeeGrossToNet.steps.allowance.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
    <span class="info-box">${TEXT.employeeGrossToNet.steps.allowance.tooltip}</span>
      </span>
    </div>
    <div id="allowance-container">
      <label class="checkbox-item">
    <input type="checkbox" id="allowance-checkbox" /> ${TEXT.employeeGrossToNet.steps.allowance.hasAllowanceLabel}
      </label>
      <div id="allowance-inputs" style="display: none;">
    <div id="allowance-warning" class="input-warning" style="display:none;">${TEXT.employeeGrossToNet.steps.allowance.warningMaxDigits}</div>
    <label class="checkbox-item"><input type="checkbox" id="lunch-checkbox" /> ${TEXT.employeeGrossToNet.steps.allowance.types.lunch}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
      <span class="info-box">${TEXT.employeeGrossToNet.steps.allowance.tooltips.lunch}</span>
          </span>
        </label>
    <div id="lunch-input" style="display: none;"><input type="text" class="number-input" id="allowance-lunch" placeholder="${TEXT.employeeGrossToNet.steps.allowance.placeholders.lunch}" min="0" /></div>
    <label class="checkbox-item"><input type="checkbox" id="fuel-checkbox" /> ${TEXT.employeeGrossToNet.steps.allowance.types.fuel}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
      <span class="info-box">${TEXT.employeeGrossToNet.steps.allowance.tooltips.fuel}</span>
          </span>
        </label>
    <div id="fuel-input" style="display: none;"><input type="text" class="number-input" id="allowance-fuel" placeholder="${TEXT.employeeGrossToNet.steps.allowance.placeholders.fuel}" min="0" /></div>
    <label class="checkbox-item"><input type="checkbox" id="phone-checkbox" /> ${TEXT.employeeGrossToNet.steps.allowance.types.phone}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
      <span class="info-box">${TEXT.employeeGrossToNet.steps.allowance.tooltips.phone}</span>
          </span>
        </label>
    <div id="phone-input" style="display: none;"><input type="text" class="number-input" id="allowance-phone" placeholder="${TEXT.employeeGrossToNet.steps.allowance.placeholders.phone}" min="0" /></div>
    <label class="checkbox-item"><input type="checkbox" id="travel-checkbox" /> ${TEXT.employeeGrossToNet.steps.allowance.types.travel}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
      <span class="info-box">${TEXT.employeeGrossToNet.steps.allowance.tooltips.travel}</span>
          </span>
        </label>
    <div id="travel-input" style="display: none;"><input type="text" class="number-input" id="allowance-travel" placeholder="${TEXT.employeeGrossToNet.steps.allowance.placeholders.travel}" min="0" /></div>
    <label class="checkbox-item"><input type="checkbox" id="uniform-checkbox" /> ${TEXT.employeeGrossToNet.steps.allowance.types.uniform}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
      <span class="info-box">${TEXT.employeeGrossToNet.steps.allowance.tooltips.uniform}</span>
          </span>
        </label>
    <div id="uniform-input" style="display: none;"><input type="text" class="number-input" id="allowance-uniform" placeholder="${TEXT.employeeGrossToNet.steps.allowance.placeholders.uniform}" min="0" /></div>
    <label class="checkbox-item"><input type="checkbox" id="other-allowance-checkbox" /> ${TEXT.employeeGrossToNet.steps.allowance.types.other}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
      <span class="info-box">${TEXT.employeeGrossToNet.steps.allowance.tooltips.other}</span>
          </span>
        </label>
    <div id="other-allowance-input" style="display: none;"><input type="text" class="number-input" id="allowance-other" placeholder="${TEXT.employeeGrossToNet.steps.allowance.placeholders.other}" min="0" /></div>
      </div>
    </div>
  <button type="button" id="continue-step3" class="simulation-button unavailable" disabled>${TEXT.employeeGrossToNet.steps.allowance.continue}</button>
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
    <h2>${TEXT.employeeGrossToNet.steps.bonus.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
    <span class="info-box">${TEXT.employeeGrossToNet.steps.bonus.tooltip}</span>
      </span>
    </div>
    <div id="bonus-container">
      <label class="checkbox-item">
    <input type="checkbox" id="bonus-checkbox" /> ${TEXT.employeeGrossToNet.steps.bonus.hasBonusLabel}
      </label>
      <div id="bonus-inputs" style="display: none;">
    <div id="bonus-warning" class="input-warning" style="display:none;">${TEXT.employeeGrossToNet.steps.bonus.warningMaxDigits}</div>
    <label class="checkbox-item"><input type="checkbox" id="productivity-checkbox" /> ${TEXT.employeeGrossToNet.steps.bonus.types.productivity}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
      <span class="info-box">${TEXT.employeeGrossToNet.steps.bonus.tooltips.productivity}</span>
          </span>
        </label>
    <div id="productivity-input" style="display: none;"><input type="text" class="number-input" id="bonus-productivity" placeholder="${TEXT.employeeGrossToNet.steps.bonus.placeholders.productivity}" min="0" /></div>
    <label class="checkbox-item"><input type="checkbox" id="incentive-checkbox" /> ${TEXT.employeeGrossToNet.steps.bonus.types.incentive}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
      <span class="info-box">${TEXT.employeeGrossToNet.steps.bonus.tooltips.incentive}</span>
          </span>
        </label>
    <div id="incentive-input" style="display: none;"><input type="text" class="number-input" id="bonus-incentive" placeholder="${TEXT.employeeGrossToNet.steps.bonus.placeholders.incentive}" min="0" /></div>
    <label class="checkbox-item"><input type="checkbox" id="kpi-checkbox" /> ${TEXT.employeeGrossToNet.steps.bonus.types.kpi}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
      <span class="info-box">${TEXT.employeeGrossToNet.steps.bonus.tooltips.kpi}</span>
          </span>
        </label>
    <div id="kpi-input" style="display: none;"><input type="text" class="number-input" id="bonus-kpi" placeholder="${TEXT.employeeGrossToNet.steps.bonus.placeholders.kpi}" min="0" /></div>
    <label class="checkbox-item"><input type="checkbox" id="other-bonus-checkbox" /> ${TEXT.employeeGrossToNet.steps.bonus.types.other}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
      <span class="info-box">${TEXT.employeeGrossToNet.steps.bonus.tooltips.other}</span>
          </span>
        </label>
    <div id="other-bonus-input" style="display: none;"><input type="text" class="number-input" id="bonus-other" placeholder="${TEXT.employeeGrossToNet.steps.bonus.placeholders.other}" min="0" /></div>
      </div>
    </div>
  `;
  return step4;
}

function createNavButtons() {
  const navDiv = document.createElement('div');
  navDiv.className = 'form-navigation';
  navDiv.innerHTML = html`
  <button type="submit" id="calculate-btn" class="simulation-button" style="display:none;">${TEXT.employeeGrossToNet.buttons.calculate}</button>
  <button type="button" id="return-btn" class="simulation-button return-button" style="display:none;">${TEXT.employeeGrossToNet.buttons.return}</button>
  `;
  return navDiv;
}

function createResultAndCharts(root) {
  const resultDiv = createAndAppend(root, 'div', { className: 'result', id: 'result', 'aria-live': 'polite' });
  const pieChartContainer = createAndAppend(root, 'div', { className: 'pie-chart-container' });
  pieChartContainer.innerHTML = html`
    <div id="salary-chart-block">
      <canvas id="salary-breakdown-chart" style="display: none;"></canvas>
  <div id="salary-breakdown-chart-label" style="display: none;">${TEXT.employeeGrossToNet.charts.salaryBreakdown}</div>
    </div>
    <div id="cost-chart-block">
      <canvas id="cost-breakdown-chart" style="display: none;"></canvas>
  <div id="cost-breakdown-chart-label" style="display: none;">${TEXT.employeeGrossToNet.charts.costBreakdown}</div>
    </div>
  `;
  return { resultDiv, pieChartContainer };
}

function createDownloadButton(root) {
  const downloadBtn = createAndAppend(root, 'button', {
    className: 'simulation-button',
    id: 'download-pdf-btn',
    style: 'display:none;',
  textContent: TEXT.employeeGrossToNet.buttons.downloadPdf
  });
  return downloadBtn;
}

function createResetButton(root) {
  const resetBtn = createAndAppend(root, 'button', {
    className: 'simulation-button return-button',
    id: 'reset-btn',
    style: 'display:none;',
  textContent: TEXT.employeeGrossToNet.buttons.modify,
    type: 'button'
  });
  return resetBtn;
}

function createHardResetButton(root) {
  const hardResetBtn = createAndAppend(root, 'button', {
    className: 'simulation-button return-button',
    id: 'hard-reset-btn',
    style: 'display:none;',
  textContent: TEXT.employeeGrossToNet.buttons.reset,
    type: 'button'
  });
  return hardResetBtn;
}

// Create or populate the footer from TEXT to centralize copy
function createFooter(root) {
  let footer = document.querySelector('.app-footer');
  if (!footer) {
    footer = createAndAppend(root, 'footer', { className: 'app-footer' });
  }
  footer.innerHTML = html`
    <span class="footer-title">${TEXT.employeeGrossToNet.footer.importantNoteTitle}</span>
    <div class="footer-text">${TEXT.employeeGrossToNet.footer.importantNoteText} <a href="${TEXT.employeeGrossToNet.footer.contactUrl}" target="_blank">${TEXT.employeeGrossToNet.footer.contactLinkText}</a>.</div>
    <span class="footer-title">${TEXT.employeeGrossToNet.footer.disclaimerTitle}</span>
    <div class="footer-text">${TEXT.employeeGrossToNet.footer.disclaimerText}</div>
  `;
  return footer;
}

document.addEventListener('DOMContentLoaded', () => {
  // --- Dynamic UI creation ---
  const root = getElement('gross-to-net-root');
  root.innerHTML = '';

  // Title and header
  createTitleBlock(root);
  // Progress bar
  createProgressBar(root);
  // Form
  const salaryForm = createSalaryForm(root);
  // Steps
  const step1 = createStep1();
  const step2 = createStep2();
  const step3 = createStep3();
  const step4 = createStep4();
  salaryForm.appendChild(step1);
  salaryForm.appendChild(step2);
  salaryForm.appendChild(step3);
  salaryForm.appendChild(step4);
  // Navigation buttons
  const navDiv = createNavButtons();
  salaryForm.appendChild(navDiv);
  // Results and charts
  const { resultDiv, pieChartContainer } = createResultAndCharts(root);
  // Download button
  const downloadBtn = createDownloadButton(root);
  // Reset and hard reset
  const resetBtn = createResetButton(root);
  const hardResetBtn = createHardResetButton(root);
  // Footer (disclaimer and important notes)
  createFooter(document.body);

// --- Multi-step form navigation logic ---
  const steps = [step1, step2, step3, step4];
  const continueBtns = [
    getElement('continue-step1'),
    getElement('continue-step2'),
    getElement('continue-step3'),
  ];
  const returnBtn = getElement('return-btn');
  const calculateBtn = getElement('calculate-btn');
  let currentStep = 0;

  // Show the current step and update navigation buttons and progress bar
  function showStep(idx) {
    steps.forEach((step, i) => {
      if (step) step.style.display = i === idx ? '' : 'none';
    });
    returnBtn.style.display = idx > 0 ? '' : 'none';
    calculateBtn.style.display = idx === steps.length - 1 ? '' : 'none';
    // Auto-focus net salary input on step 2
    if (idx === 1) {
      const netSalaryInput = document.getElementById('net-salary');
      if (netSalaryInput) {
        netSalaryInput.focus();
        netSalaryInput.select && netSalaryInput.select();
      }
    }
    // Update progress bar
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
    // Update progress bar lines
    const lines = document.querySelectorAll('#progress-bar .progress-bar-line');
    lines.forEach((line, i) => {
      if (i < idx) {
        line.classList.add('completed');
      } else {
        line.classList.remove('completed');
      }
    });
  }

  // --- Step 1: National Status ---
  const citizenshipSelect = getElement('citizenship');
  continueBtns[0].addEventListener('click', () => {
    if (currentStep === 0 && citizenshipSelect.value) {
      currentStep++;
      showStep(currentStep);
    }
  });
  function updateStep1Btn() {
    if (citizenshipSelect.value) {
      continueBtns[0].classList.remove('unavailable');
      continueBtns[0].disabled = false;
    } else {
      continueBtns[0].classList.add('unavailable');
      continueBtns[0].disabled = true;
    }
  }
  citizenshipSelect.addEventListener('change', updateStep1Btn);
  updateStep1Btn();

  // --- Step 2: Gross Salary ---
  const grossSalaryInput = getElement('gross-salary');
  continueBtns[1].addEventListener('click', () => {
    if (currentStep === 1 && grossSalaryInput.value && parseInt(grossSalaryInput.value.replace(/\D/g, '')) >= 5000000) {
      currentStep++;
      showStep(currentStep);
    }
  });
  function updateStep2Btn() {
    const val = grossSalaryInput.value.replace(/\D/g, '');
    if (val && parseInt(val) >= 5000000) {
      continueBtns[1].classList.remove('unavailable');
      continueBtns[1].disabled = false;
    } else {
      continueBtns[1].classList.add('unavailable');
      continueBtns[1].disabled = true;
    }
  }
  grossSalaryInput.addEventListener('input', updateStep2Btn);
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
    allowanceCheckbox: getElement('allowance-checkbox'),
    allowanceInputs: getElement('allowance-inputs'),
    bonusCheckbox: getElement('bonus-checkbox'),
    bonusInputs: getElement('bonus-inputs'),
    costBreakdownChart: getElement('cost-breakdown-chart'),
    salaryBreakdownChart: getElement('salary-breakdown-chart'),
    costBreakdownChartLabel: getElement('cost-breakdown-chart-label'),
    salaryBreakdownChartLabel: getElement('salary-breakdown-chart-label'),
  };

  // --- Allowance and Bonus checkbox/input mapping ---
  const allowanceMap = {
    'lunch-checkbox': 'lunch-input',
    'fuel-checkbox': 'fuel-input',
    'phone-checkbox': 'phone-input',
    'travel-checkbox': 'travel-input',
    'uniform-checkbox': 'uniform-input',
    'other-allowance-checkbox': 'other-allowance-input',
  };
  const bonusMap = {
    'productivity-checkbox': 'productivity-input',
    'incentive-checkbox': 'incentive-input',
    'kpi-checkbox': 'kpi-input',
    'other-bonus-checkbox': 'other-bonus-input',
  };

  // --- Show/hide allowance/bonus input fields ---
  function toggleVisibility(map, parentCheckbox, container) {
    parentCheckbox.addEventListener('change', () => {
      container.style.display = parentCheckbox.checked ? 'block' : 'none';
      Object.entries(map).forEach(([cbId, inputId]) => {
        const cb = getElement(cbId);
        const div = getElement(inputId);
        if (cb && div) {
          div.style.display = cb.checked && parentCheckbox.checked ? 'block' : 'none';
        }
      });
      // Auto-focus first visible input when parentCheckbox is checked
      if (parentCheckbox.checked) {
        setTimeout(() => {
          const firstInput = container.querySelector('input[type="checkbox"]:checked');
          if (firstInput) {
            // Find the corresponding input field for the checked box
            const inputDiv = getElement(map[firstInput.id]);
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
    Object.entries(map).forEach(([cbId, inputId]) => {
      const cb = getElement(cbId);
      const div = getElement(inputId);
      if (cb && div) {
        cb.addEventListener('change', () => {
          div.style.display = cb.checked && parentCheckbox.checked ? 'block' : 'none';
          // Auto-focus the input when this box is checked and parent is checked
          if (cb.checked && parentCheckbox.checked) {
            setTimeout(() => {
              const textInput = div.querySelector('input[type="text"]');
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
  toggleVisibility(allowanceMap, DOM.allowanceCheckbox, DOM.allowanceInputs);
  toggleVisibility(bonusMap, DOM.bonusCheckbox, DOM.bonusInputs);

  // --- Format number input fields and restrict max value ---
  function formatNumberInput(input) {
    let raw = input.value.replace(/[^\d]/g, '');
    let warning = null;
    if (input.id === 'gross-salary') {
      warning = document.getElementById('gross-salary-warning');
    } else if (input.closest('#allowance-inputs')) {
      warning = document.getElementById('allowance-warning');
    } else if (input.closest('#bonus-inputs')) {
      warning = document.getElementById('bonus-warning');
    }
    if (raw.length > 9) {
      if (warning) warning.style.display = '';
      raw = raw.slice(0, 9);
    } else {
      if (warning) warning.style.display = 'none';
    }
    if (raw) {
      let num = parseInt(raw, 10);
      input.value = num ? num.toLocaleString('vi-VN') : '';
    } else {
      input.value = '';
    }
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
  function parseNumber(val) {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat((val + '').replace(/,/g, '')) || 0;
  }
  function getVal(id) {
    const el = getElement(id);
    return el ? el.value : '';
  }
  function getChecked(id) {
    const el = getElement(id);
    return el ? el.checked : false;
  }
  function handleCalculation() {
    const params = {
      method: 'gross-to-net',
      grossSalary: parseNumber(getVal('gross-salary')),
      taxResidentStatus: getVal('citizenship') || 'local',
      
      // Allowance inputs
      lunchAllowance: parseNumber(getVal('allowance-lunch')),
      fuelAllowance: parseNumber(getVal('allowance-fuel')),
      phoneAllowance: parseNumber(getVal('allowance-phone')),
      travelAllowance: parseNumber(getVal('allowance-travel')),
      uniformAllowance: parseNumber(getVal('allowance-uniform')),
      otherAllowance: parseNumber(getVal('allowance-other')),
      
      // Bonus input - simplified to single total bonus
      totalBonus: parseNumber(getVal('bonus-productivity')) + parseNumber(getVal('bonus-incentive')) + parseNumber(getVal('bonus-kpi')) + parseNumber(getVal('bonus-other')),
      
      // Benefit inputs (if any)
      childTuitionBenefit: 0,
      rentalBenefit: 0,
      healthInsuranceBenefit: 0
    };
    const data = simulateSalary(params);
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
    // Hide progress bar
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) progressBar.style.display = 'none';
    renderPieChart(data);
    // --- Restructured result boxes ---
    const allowanceItems = [
      { label: TEXT.employeeGrossToNet.steps.allowance.types.lunch, value: data.grossLunchAllowance },
      { label: TEXT.employeeGrossToNet.steps.allowance.types.fuel, value: data.grossFuelAllowance },
      { label: TEXT.employeeGrossToNet.steps.allowance.types.phone, value: data.grossPhoneAllowance },
      { label: TEXT.employeeGrossToNet.steps.allowance.types.travel, value: data.grossTravelAllowance },
      { label: TEXT.employeeGrossToNet.steps.allowance.types.uniform, value: data.grossUniformAllowance },
      { label: TEXT.employeeGrossToNet.steps.allowance.types.other.replace('Allowances',''), value: data.grossOtherAllowance }
    ].filter(item => item.value && item.value > 0);
    const bonusItems = [
      { label: TEXT.employeeGrossToNet.results.totalBonusLabel, value: data.grossTotalBonus }
    ].filter(item => item.value && item.value > 0);
    let allowanceRow = '';
    let bonusRow = '';
    let noAllowanceBonusRow = '';
    if (allowanceItems.length > 0) {
      allowanceRow = `
        <tr>
          <td colspan="2">
            <div class="result-title">Allowances</div>
            <div class="result-list">
              ${allowanceItems.map(item => `<div class="result-item">${item.label}: <span>${item.value.toLocaleString('vi-VN')} VND</span></div>`).join('')}
            </div>
            <hr class="result-divider" />
            <div class="result-total"><span>${data.grossTotalAllowance.toLocaleString('vi-VN')} VND</span></div>
          </td>
        </tr>
      `;
    }
    if (bonusItems.length > 0) {
      bonusRow = `
        <tr>
          <td colspan="2">
            <div class="result-title">Bonuses</div>
            <div class="result-list">
              ${bonusItems.map(item => `<div class="result-item">${item.label}: <span>${item.value.toLocaleString('vi-VN')} VND</span></div>`).join('')}
            </div>
            <hr class="result-divider" />
            <div class="result-total"><span>${data.grossTotalBonus.toLocaleString('vi-VN')} VND</span></div>
          </td>
        </tr>
      `;
    }
    if (allowanceItems.length === 0 && bonusItems.length === 0) {
      noAllowanceBonusRow = `
        <tr><td colspan="2"><div class="result-center-value" style="font-size:1em; color:#888;">${TEXT.employeeGrossToNet.results.allowanceOrBonusNone}</div></td></tr>
      `;
    }
    // Employee type box (local/expat)
    let employeeTypeLabel = '';
    if (data.citizenship === 'local') {
      employeeTypeLabel = TEXT.employeeGrossToNet.results.employeeTypes.local;
    } else if (data.citizenship === 'expat') {
      employeeTypeLabel = TEXT.employeeGrossToNet.results.employeeTypes.expat;
    } else {
      employeeTypeLabel = TEXT.employeeGrossToNet.results.employeeTypes.default;
    }
    const employeeTypeCell = html`<div class="result-title"><u>${employeeTypeLabel}</u></div>`;
    // Gross Salary box
    const grossSalaryCell = html`
  <div class="result-title">${TEXT.employeeGrossToNet.results.sections.grossSalary}</div>
  <div class="result-center-value">${data.grossSalary ? data.grossSalary.toLocaleString('vi-VN') + ' ' + TEXT.employeeGrossToNet.currencyUnit : '-'}</div>
    `;
    // Adjusted Gross Salary box with Total Employer Cost
    const adjustedGrossSalaryCell = html`
      <div class="result-title">${TEXT.employeeGrossToNet.results.sections.adjustedGrossSalary}</div>
      <div class="result-center-value">${data.adjustedGrossSalary ? data.adjustedGrossSalary.toLocaleString('vi-VN') + ' ' + TEXT.employeeGrossToNet.currencyUnit : '-'}</div>
      <div style="text-align:center;margin-top:4px;font-size:0.85em;">
        (${TEXT.employeeGrossToNet.results.totalEmployerCostLabel}: <span style="color:#C1272D;">${data.totalEmployerCost ? data.totalEmployerCost.toLocaleString('vi-VN') + ' ' + TEXT.employeeGrossToNet.currencyUnit : '-'}</span>)
      </div>
    `;
    // Insurance Contribution (all employee insurances)
    const insuranceItems = [
      { label: 'Social Insurance', value: data.employeeSocialInsurance },
      { label: 'Health Insurance', value: data.employeeHealthInsurance },
      { label: 'Unemployment Insurance', value: data.employeeUnemploymentInsurance }
    ].filter(item => item.value && item.value > 0);
    const insuranceContributionCell = `
      <div class="result-title">${TEXT.employeeGrossToNet.results.sections.compulsoryInsurances}</div>
      <div class="result-list">
        ${insuranceItems.map(item => `<div class="result-item">${item.label}: <span>-${item.value.toLocaleString('vi-VN')} ${TEXT.employeeGrossToNet.currencyUnit}</span></div>`).join('')}
      </div>
      <hr class="result-divider-insurance" />
      <div class="result-center-value"><span>-${data.employeeInsurance.toLocaleString('vi-VN')} ${TEXT.employeeGrossToNet.currencyUnit}</span></div>
    `;
    // Personal Income Tax cell
    const personalIncomeTaxCell = html`
      <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100%;min-height:80px;">
        <div class="result-title" style="text-align:center;">${TEXT.employeeGrossToNet.results.sections.personalIncomeTax}</div>
        <div class="result-center-value" style="text-align:center;">
          <span>-${data.incomeTax.toLocaleString('vi-VN')} ${TEXT.employeeGrossToNet.currencyUnit}</span>
        </div>
      </div>
    `;
    // Employee Contribution row (styled like gross/adjusted gross)
    const employeeContributionRow = html`
      <tr>
        <td colspan="2">
          <div class="result-title">${TEXT.employeeGrossToNet.results.sections.statutoryContribution}</div>
          <div class="result-center-value" style="color:#C1272D;">-${data.employeeContribution.toLocaleString('vi-VN')} ${TEXT.employeeGrossToNet.currencyUnit}</div>
        </td>
      </tr>
    `;
    // Employee Take-home row (styled like gross/adjusted gross)
    const employeeTakeHomeRow = html`
      <tr>
        <td colspan="2">
      <div class="result-title">${TEXT.employeeGrossToNet.results.sections.takeHomeSalary}</div>
      <div class="result-center-value" style="color:#1a7f3c;">${data.netSalary.toLocaleString('vi-VN')} ${TEXT.employeeGrossToNet.currencyUnit}</div>
        </td>
      </tr>
    `;
    DOM.resultDiv.innerHTML = html`
    <h1 style="text-align:center;margin-bottom:16px;font-size:30px">${TEXT.employeeGrossToNet.payslipTitle}</h1>
      <div class="result-table-container">
        <table class="result-table result-table-vertical result-table-bordered employee-table-layout">
          <tr><td colspan="2">${employeeTypeCell}</td></tr>
          <tr><td colspan="2">${grossSalaryCell}</td></tr>
          ${allowanceRow}
          ${bonusRow}
          ${!allowanceRow && !bonusRow ? noAllowanceBonusRow : ''}
          <tr><td colspan="2">${adjustedGrossSalaryCell}</td></tr>
          <tr>
            <td style="padding:0;vertical-align:top;">${insuranceContributionCell}</td>
            <td style="padding:0;vertical-align:middle;">${personalIncomeTaxCell}</td>
          </tr>
          ${employeeContributionRow}
          ${employeeTakeHomeRow}
        </table>
      </div>
    <div class="salary-visualization-heading" style="text-align:center;margin:24px 0 0 0;font-size:1.125em;font-weight:bold;">${TEXT.employeeGrossToNet.results.salaryVisualizationTitle}</div>
    `;
    DOM.downloadPdfBtn.style.display = 'block';
    // Show reset and hard reset buttons
    resetBtn.style.display = 'block';
    hardResetBtn.style.display = 'block';
    // --- Reset button logic ---
    resetBtn.onclick = () => {
      // Hide results
      DOM.resultDiv.innerHTML = '';
      DOM.downloadPdfBtn.style.display = 'none';
      resetBtn.style.display = 'none';
      hardResetBtn.style.display = 'none';
      // Hide charts
      if (DOM.salaryBreakdownChart) DOM.salaryBreakdownChart.style.display = 'none';
      if (DOM.salaryBreakdownChartLabel) DOM.salaryBreakdownChartLabel.style.display = 'none';
      if (DOM.costBreakdownChart) DOM.costBreakdownChart.style.display = 'none';
      if (DOM.costBreakdownChartLabel) DOM.costBreakdownChartLabel.style.display = 'none';
      // Re-insert the form at the top (before resultDiv)
      if (!document.getElementById('salary-form')) {
        root.insertBefore(salaryForm, DOM.resultDiv);
      }
      // Show progress bar again
      const progressBar = document.getElementById('progress-bar');
      if (progressBar) progressBar.style.display = 'flex';
      // Reset to the first step
      currentStep = 0;
      showStep(currentStep);
    };
    // --- Hard Reset button logic ---
    hardResetBtn.onclick = () => {
      window.location.reload();
    };
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
    // Helper: show/hide chart blocks and center if only one is visible
    function updateChartBlockVisibility(showSalary, showCost) {
      const salaryBlock = document.getElementById('salary-chart-block');
      const costBlock = document.getElementById('cost-chart-block');
      if (salaryBlock) salaryBlock.style.display = showSalary ? 'flex' : 'none';
      if (costBlock) costBlock.style.display = showCost ? 'flex' : 'none';
      // Center the only visible chart
      const pieChartContainer = document.querySelector('.pie-chart-container');
      if (pieChartContainer) {
        if ((showSalary && !showCost) || (!showSalary && showCost)) {
          pieChartContainer.style.justifyContent = 'center';
        } else {
          pieChartContainer.style.justifyContent = 'center';
        }
      }
    }

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
    const bonusAndAllowance = data.adjustedGrossSalary - data.grossSalary;
    if (bonusAndAllowance === 0) {
      destroyChart('salaryChart');
      DOM.salaryBreakdownChart.style.display = 'none';
      DOM.salaryBreakdownChartLabel.style.display = 'none';
      updateChartBlockVisibility(false, true);
    } else {
      destroyChart('salaryChart');
      window.salaryChart = new Chart(DOM.salaryBreakdownChart.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: [
            TEXT.employeeGrossToNet.charts.bonusAndAllowance,
            TEXT.employeeGrossToNet.charts.grossSalary
          ],
          datasets: [{
            data: [bonusAndAllowance, data.grossSalary],
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
                  return `${ctx.label}: ${value.toLocaleString('vi-VN')} VND (${percent}%)`;
                }
              }
            }
          }
        }
      });
      DOM.salaryBreakdownChart.style.display = 'block';
      DOM.salaryBreakdownChartLabel.style.display = 'block';
      updateChartBlockVisibility(true, true);
    }
    destroyChart('costBreakdownChart');
    const breakdownData = [
      data.employeeInsurance || 0,
      data.incomeTax || 0,
      data.employerInsurance || 0,
      data.employerTradeUnionFund || 0,
      data.netSalary || 0
    ];
    const cb = TEXT.employeeGrossToNet.results.costBreakdown;
    const breakdownLabels = [
      cb.employeeInsurance,
      cb.personalIncomeTax,
      cb.employerInsurance,
      cb.employerUnionFee,
      cb.netSalary
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
                return `${ctx.label}: ${value.toLocaleString('vi-VN')} VND (${percent}%)`;
              }
            }
          }
        }
      }
    });
    DOM.costBreakdownChart.style.display = 'block';
    DOM.costBreakdownChartLabel.style.display = 'block';
  }
  // --- PDF Export logic (A4, Garamond, instant download) ---
  // Ensure jsPDF and html2canvas are loaded
  function ensureJsPdfAndHtml2Canvas(cb) {
    let loaded = 0;
    function check() { loaded++; if (loaded === 2) cb(); }
    // Check jsPDF
    if (!window.jspdf || !window.jspdf.jsPDF) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = check;
      document.head.appendChild(s);
    } else loaded++;
    // Check html2canvas
    if (!window.html2canvas) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload = check;
      document.head.appendChild(s);
    } else loaded++;
    if ((window.jspdf && window.jspdf.jsPDF) && window.html2canvas) cb();
  }

  function setupDownloadButton() {
    downloadBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      ensureJsPdfAndHtml2Canvas(async () => {
        const resultTableContainer = document.querySelector('.result-table-container');
        if (!resultTableContainer) return;
        const exportContainer = document.createElement('div');
        exportContainer.className = 'pdf-export-container';
        // Clone logo, hr, and result table, but use PAYSLIP h2 instead of h1
        const logo = document.querySelector('.logo');
        const hr = root.querySelector('hr');
        if (logo) {
          const logoClone = logo.cloneNode(true);
          exportContainer.appendChild(logoClone);
        }
        // Add PAYSLIP h2
  const payslipH2 = document.createElement('h1');
  payslipH2.textContent = TEXT.employeeGrossToNet.payslipTitle;
        payslipH2.style.textAlign = 'center';
        payslipH2.style.marginBottom = '16px';
        exportContainer.appendChild(payslipH2);
        if (hr) {
          const hrClone = hr.cloneNode(true);
          exportContainer.appendChild(hrClone);
        }
        exportContainer.appendChild(resultTableContainer.cloneNode(true));
        // Clone and append the footer below the result table
        const footer = document.querySelector('.app-footer');
        if (footer) {
          const footerClone = footer.cloneNode(true);
          // Remove any id attributes from the clone to avoid duplicate IDs
          footerClone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
          footerClone.style.width = '100%';
          exportContainer.appendChild(footerClone);
        }
        document.body.appendChild(exportContainer);
        // Format date as dd/mm/yyyy
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
  const filename = `[PCA Salary Simulation]_${day}-${month}-${year}.pdf`;
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
  // Show version in bottom-right on this page using centralized TEXT.version
  (function createVersionDisplay() {
    if (document.querySelector('.version-display')) return;
    const versionDiv = document.createElement('div');
    versionDiv.className = 'version-display';
    versionDiv.textContent = (TEXT && TEXT.version) || '';
    document.body.appendChild(versionDiv);
  })();
});