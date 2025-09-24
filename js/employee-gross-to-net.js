

import { simulateSalary } from '../be/cal.js';
import { TEXT } from '../lang/eng.js';

// Simple HTML template helper (same as employer path)
const html = (strings, ...values) =>
  strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');

const MAX_DIGITS = 9;

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
// HTML template literal helper ends

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

// Progress bar (aligned with other flows)
function createProgressBar(root) {
  const progressBar = createAndAppend(root, 'div', { id: 'progress-bar' });
  progressBar.innerHTML = html`
  <div class="progress-step" data-step="0">${TEXT.employeeGrossToNet.progressSteps.taxResidentStatus}</div>
      <div class="progress-bar-line"></div>
    <div class="progress-step" data-step="1">${TEXT.employeeGrossToNet.progressSteps.grossSalary}</div>
      <div class="progress-bar-line"></div>
    <div class="progress-step" data-step="2">${TEXT.employeeGrossToNet.progressSteps.allowance}</div>
      <div class="progress-bar-line"></div>
    <div class="progress-step" data-step="3">${TEXT.employeeGrossToNet.progressSteps.bonus}</div>
      <div class="progress-bar-line"></div>
    <div class="progress-step" data-step="4">${TEXT.employeeGrossToNet.progressSteps.benefit}</div>
  `;
  return progressBar;
}

function createStep1() {
  const step1 = document.createElement('div');
  step1.className = 'form-step active';
  step1.id = 'step-1';
  step1.innerHTML = html`
    <div class="step-title-row">
  <h2>${TEXT.employeeGrossToNet.steps.taxResidentStatus.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
  <span class="info-box">${TEXT.employeeGrossToNet.steps.taxResidentStatus.tooltip}</span>
      </span>
    </div>
    <select id="tax-resident-status">
      <option value="" disabled selected>${TEXT.employeeGrossToNet.steps.taxResidentStatus.selectPlaceholder}</option>
      <option value="local">${TEXT.employeeGrossToNet.steps.taxResidentStatus.options.local}</option>
      <option value="expat">${TEXT.employeeGrossToNet.steps.taxResidentStatus.options.expat}</option>
    </select>
  `;
  return step1;
}

function createStep2() {
  const step2 = document.createElement('div');
  step2.className = 'form-step';
  step2.id = 'step-2';
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
  `;
  return step2;
}

function createStep3() {
  const step3 = document.createElement('div');
  step3.className = 'form-step';
  step3.id = 'step-3';
  step3.innerHTML = html`
    <div class="step-title-row">
      <h2>${TEXT.employeeGrossToNet.steps.allowance.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT.employeeGrossToNet.steps.allowance.tooltip}</span>
      </span>
    </div>
    <div id="allowance-inputs">
      <div id="allowance-warning" class="input-warning" style="display:none;">${TEXT.employeeGrossToNet.steps.allowance.warningMaxDigits}</div>
      <label class="input-label">${TEXT.employeeGrossToNet.steps.allowance.types.lunch}
        <span class="question-icon" tabindex="0">
          <img src="asset/question_icon.webp" alt="info" />
          <span class="info-box">${TEXT.employeeGrossToNet.steps.allowance.tooltips.lunch}</span>
        </span>
      </label>
      <input type="text" class="number-input" id="allowance-lunch" placeholder="${TEXT.employeeGrossToNet.steps.allowance.placeholders.lunch}" min="0" />

      <label class="input-label">${TEXT.employeeGrossToNet.steps.allowance.types.fuel}
        <span class="question-icon" tabindex="0">
          <img src="asset/question_icon.webp" alt="info" />
          <span class="info-box">${TEXT.employeeGrossToNet.steps.allowance.tooltips.fuel}</span>
        </span>
      </label>
      <input type="text" class="number-input" id="allowance-fuel" placeholder="${TEXT.employeeGrossToNet.steps.allowance.placeholders.fuel}" min="0" />

      <label class="input-label">${TEXT.employeeGrossToNet.steps.allowance.types.phone}
        <span class="question-icon" tabindex="0">
          <img src="asset/question_icon.webp" alt="info" />
          <span class="info-box">${TEXT.employeeGrossToNet.steps.allowance.tooltips.phone}</span>
        </span>
      </label>
      <input type="text" class="number-input" id="allowance-phone" placeholder="${TEXT.employeeGrossToNet.steps.allowance.placeholders.phone}" min="0" />

      <label class="input-label">${TEXT.employeeGrossToNet.steps.allowance.types.travel}
        <span class="question-icon" tabindex="0">
          <img src="asset/question_icon.webp" alt="info" />
          <span class="info-box">${TEXT.employeeGrossToNet.steps.allowance.tooltips.travel}</span>
        </span>
      </label>
      <input type="text" class="number-input" id="allowance-travel" placeholder="${TEXT.employeeGrossToNet.steps.allowance.placeholders.travel}" min="0" />

      <label class="input-label">${TEXT.employeeGrossToNet.steps.allowance.types.uniform}
        <span class="question-icon" tabindex="0">
          <img src="asset/question_icon.webp" alt="info" />
          <span class="info-box">${TEXT.employeeGrossToNet.steps.allowance.tooltips.uniform}</span>
        </span>
      </label>
      <input type="text" class="number-input" id="allowance-uniform" placeholder="${TEXT.employeeGrossToNet.steps.allowance.placeholders.uniform}" min="0" />

      <label class="input-label">${TEXT.employeeGrossToNet.steps.allowance.types.other}
        <span class="question-icon" tabindex="0">
          <img src="asset/question_icon.webp" alt="info" />
          <span class="info-box">${TEXT.employeeGrossToNet.steps.allowance.tooltips.other}</span>
        </span>
      </label>
      <input type="text" class="number-input" id="allowance-other" placeholder="${TEXT.employeeGrossToNet.steps.allowance.placeholders.other}" min="0" />
    </div>
  `;
  return step3;
}

function createStep4() {
  const step4 = document.createElement('div');
  step4.className = 'form-step';
  step4.id = 'step-4';
  step4.innerHTML = html`
    <div class="step-title-row">
      <h2>${TEXT.employeeGrossToNet.steps.bonus.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT.employeeGrossToNet.steps.bonus.tooltip}</span>
      </span>
    </div>
    <div id="bonus-inputs">
      <div id="bonus-warning" class="input-warning" style="display:none;">${TEXT.employeeGrossToNet.steps.bonus.warningMaxDigits}</div>
      <label class="input-label">${TEXT.employeeGrossToNet.steps.bonus.totalLabel || 'Total Bonus'}
        <span class="question-icon" tabindex="0">
          <img src="asset/question_icon.webp" alt="info" />
          <span class="info-box">${TEXT.employeeGrossToNet.steps.bonus.tooltip}</span>
        </span>
      </label>
      <input type="text" class="number-input" id="total-bonus" placeholder="${TEXT.employeeGrossToNet.steps.bonus.placeholders.other}" />
    </div>
  `;
  return step4;
}

// Benefit step (aligned with Employer flows)
function createStep5() {
  const step5 = document.createElement('div');
  step5.className = 'form-step';
  step5.id = 'step-5';
  step5.innerHTML = html`
    <div class="step-title-row">
      <h2>${(TEXT.employeeGrossToNet.steps.benefit && TEXT.employeeGrossToNet.steps.benefit.title) || 'Benefit'}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT.employerGrossToNet.infoTooltips.benefit}</span>
      </span>
    </div>
    <div id="benefit-container">
      <div id="benefit-inputs">
        <div id="benefit-warning" class="input-warning" style="display:none;">${TEXT.employeeGrossToNet.steps.bonus.warningMaxDigits}</div>
        <label class="input-label">${(TEXT.employeeGrossToNet.steps.benefit?.types?.childTuition) || "Child's Tuition Fee"}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT.employerGrossToNet.infoTooltips.childTuition}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="benefit-child-tuition" placeholder="${(TEXT.employeeGrossToNet.steps.benefit?.placeholders?.childTuition) || "Child's tuition fee (VND)"}" min="0" />
        <label class="input-label">${(TEXT.employeeGrossToNet.steps.benefit?.types?.rental) || 'Rental'}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT.employerGrossToNet.infoTooltips.rental}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="benefit-rental" placeholder="${(TEXT.employeeGrossToNet.steps.benefit?.placeholders?.rental) || 'Rental benefit (VND)'}" min="0" />
        <label class="input-label">${(TEXT.employeeGrossToNet.steps.benefit?.types?.healthInsurance) || 'Health Insurance'}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT.employerGrossToNet.infoTooltips.healthInsurance}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="benefit-health-insurance" placeholder="${(TEXT.employeeGrossToNet.steps.benefit?.placeholders?.healthInsurance) || 'Health insurance benefit (VND)'}" min="0" />
      </div>
    </div>
  `;
  return step5;
}

function createNavButtons() {
  const navDiv = document.createElement('div');
  navDiv.className = 'form-navigation';
  navDiv.innerHTML = html`
    <button type="button" id="return-btn" class="simulation-button return-button">${TEXT.employeeGrossToNet.buttons.return}</button>
    <button type="button" id="continue-btn" class="simulation-button">${TEXT.employeeGrossToNet.buttons.calculate.replace('Calculate', 'Continue')}</button>
    <button type="submit" id="calculate-btn" class="simulation-button">${TEXT.employeeGrossToNet.buttons.calculate}</button>
  `;
  return navDiv;
}

function createResultSection(root) {
  const resultDiv = createAndAppend(root, 'div', { className: 'result', id: 'result', 'aria-live': 'polite' });
  return { resultDiv };
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
  const footer = createAndAppend(root, 'footer', { className: 'app-footer' });
  footer.innerHTML = html`
    <hr />
    <span class="footer-title">${TEXT.employeeGrossToNet.footer.importantNoteTitle}</span>
    <div class="footer-text">${TEXT.employeeGrossToNet.footer.importantNoteText} <a href="${TEXT.employeeGrossToNet.footer.contactUrl}" target="_blank">${TEXT.employeeGrossToNet.footer.contactLinkText}</a>.</div>
    <span class="footer-title">${TEXT.employeeGrossToNet.footer.disclaimerTitle}</span>
    <div class="footer-text">${TEXT.employeeGrossToNet.footer.disclaimerText}</div>
  `;

  function positionFooter() {
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (documentHeight <= viewportHeight) {
      footer.style.position = 'fixed';
      footer.style.bottom = '1rem';
      footer.style.left = '50%';
      footer.style.transform = 'translateX(-50%)';
      footer.style.zIndex = '1000';
      footer.style.margin = '2rem auto';
      footer.style.width = '70vw';
      const footerHeight = footer.offsetHeight;
      document.body.style.paddingBottom = `${footerHeight + 32}px`;
    } else {
      footer.style.position = '';
      footer.style.bottom = '';
      footer.style.left = '';
      footer.style.transform = '';
      footer.style.zIndex = '';
      footer.style.marginTop = '12rem';
      document.body.style.paddingBottom = '';
    }
  }

  setTimeout(positionFooter, 200);
  window.addEventListener('resize', () => setTimeout(positionFooter, 100));
  const observer = new MutationObserver(() => setTimeout(positionFooter, 150));
  observer.observe(root, { childList: true, subtree: true });
  const progressBar = document.querySelector('#progress-bar');
  if (progressBar) {
    const progressObserver = new MutationObserver(() => setTimeout(positionFooter, 100));
    progressObserver.observe(progressBar, { attributes: true, subtree: true });
  }
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
  const step5 = createStep5();
  salaryForm.appendChild(step1);
  salaryForm.appendChild(step2);
  salaryForm.appendChild(step3);
  salaryForm.appendChild(step4);
  salaryForm.appendChild(step5);
  // Navigation buttons
  const navDiv = createNavButtons();
  salaryForm.appendChild(navDiv);
  // Results and charts
  const { resultDiv } = createResultSection(root);
  const buttonContainer = createAndAppend(root, 'div', { className: 'result-buttons-container', id: 'result-buttons-container' });
  // Order: Reset (hard), Modify (reset), Download
  const hardResetBtn = createHardResetButton(buttonContainer);
  const resetBtn = createResetButton(buttonContainer);
  const downloadBtn = createDownloadButton(buttonContainer);
  // Footer (disclaimer and important notes)
  createFooter(document.body);

  // --- Multi-step form navigation (centralized, like Employer Gross→Net) ---
  const steps = [step1, step2, step3, step4, step5];
  let currentStep = 0;
  const returnBtn = getElement('return-btn');
  let continueBtn = getElement('continue-btn');
  let calculateBtn = getElement('calculate-btn');

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
      if (i < idx) line.classList.add('completed');
      else line.classList.remove('completed');
    });
  }

  function updateContinueButtonState(idx) {
    if (!continueBtn) return;
    let isValid = false;
    const taxResidentStatusSelect = document.getElementById('tax-resident-status');
    const grossSalaryInput = document.getElementById('gross-salary');
    switch (idx) {
      case 0:
        isValid = !!(taxResidentStatusSelect && taxResidentStatusSelect.value);
        break;
      case 1:
        if (grossSalaryInput) {
          const val = parseInt(grossSalaryInput.value.replace(/\D/g, '')) || 0;
          isValid = val >= 5000000;
        }
        break;
  case 2:
  case 3:
  case 4:
        isValid = true;
        break;
      default:
        isValid = false;
    }
    continueBtn.classList.toggle('unavailable', !isValid);
    continueBtn.disabled = !isValid;
  }

  function showStep(idx) {
    steps.forEach((step, i) => {
      if (!step) return;
      if (i === idx) step.classList.add('active');
      else step.classList.remove('active');
    });

    // Buttons visibility
    if (returnBtn) {
      returnBtn.classList.add('show');
      if (idx === 0) { returnBtn.disabled = true; returnBtn.classList.add('disabled'); }
      else { returnBtn.disabled = false; returnBtn.classList.remove('disabled'); }
    }
    if (continueBtn) {
      if (idx < steps.length - 1) continueBtn.classList.add('show');
      else continueBtn.classList.remove('show');
    }
    if (calculateBtn) {
      if (idx === steps.length - 1) calculateBtn.classList.add('show');
      else calculateBtn.classList.remove('show');
    }

    // Focus gross salary on step 2
    if (idx === 1) {
      const grossSalaryInput = document.getElementById('gross-salary');
      if (grossSalaryInput) { grossSalaryInput.focus(); grossSalaryInput.select && grossSalaryInput.select(); }
    }

    updateContinueButtonState(idx);
    updateProgressBar(idx);
  }

  // Input listeners for validation
  const taxResidentStatusSelect = getElement('tax-resident-status');
  taxResidentStatusSelect && taxResidentStatusSelect.addEventListener('change', () => updateContinueButtonState(currentStep));
  const grossSalaryInput = getElement('gross-salary');
  grossSalaryInput && grossSalaryInput.addEventListener('input', () => updateContinueButtonState(currentStep));

  // Nav handlers
  continueBtn && continueBtn.addEventListener('click', () => {
    if (currentStep < steps.length - 1 && !continueBtn.disabled) {
      currentStep++;
      showStep(currentStep);
    }
  });
  returnBtn && returnBtn.addEventListener('click', () => {
    if (currentStep > 0 && !returnBtn.disabled) {
      currentStep--;
      showStep(currentStep);
    }
  });

  // Initial render
  showStep(currentStep);

  // (Charts removed)

  // --- DOM references ---
  const DOM = {
    salaryForm,
    calculateBtn,
    downloadPdfBtn: downloadBtn,
    resultDiv,
    allowanceInputs: getElement('allowance-inputs'),
    bonusInputs: getElement('bonus-inputs'),
  buttonContainer,
  };

  // Always-on inputs (no checkbox toggles). Nothing to do here, but keep section for parity.

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
    } else if (input.closest('#benefit-inputs')) {
      warning = document.getElementById('benefit-warning');
    }
    if (raw.length > MAX_DIGITS) {
      if (warning) warning.style.display = '';
      raw = raw.slice(0, MAX_DIGITS);
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

  // (Chart helpers removed)

  // --- Calculation handler ---
  function parseNumber(val) {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    // Accept both Vietnamese and English thousand separators
    return parseFloat((val + '').replace(/[,.]/g, '')) || 0;
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
  taxResidentStatus: getVal('tax-resident-status') || 'local',
      
      // Allowance inputs
      lunchAllowance: parseNumber(getVal('allowance-lunch')),
      fuelAllowance: parseNumber(getVal('allowance-fuel')),
      phoneAllowance: parseNumber(getVal('allowance-phone')),
      travelAllowance: parseNumber(getVal('allowance-travel')),
      uniformAllowance: parseNumber(getVal('allowance-uniform')),
      otherAllowance: parseNumber(getVal('allowance-other')),
      
      // Bonus input - simplified to single total bonus
      totalBonus: parseNumber(getVal('total-bonus')),
      
  // Benefit inputs
  childTuitionBenefit: parseNumber(getVal('benefit-child-tuition')),
  rentalBenefit: parseNumber(getVal('benefit-rental')),
  healthInsuranceBenefit: parseNumber(getVal('benefit-health-insurance'))
    };
    const data = simulateSalary(params);
    if (data && data.error) {
  DOM.resultDiv.innerHTML = `<span class="result-error-text">${data.error}</span>`;
  DOM.downloadPdfBtn.style.display = 'none';
  DOM.buttonContainer && DOM.buttonContainer.classList.remove('show');
      return;
    }
    // Destroy the form and navigation UI after calculation
    if (salaryForm && salaryForm.parentNode) {
      salaryForm.parentNode.removeChild(salaryForm);
    }
    // Hide progress bar
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) progressBar.style.display = 'none';
  // Show result buttons
  DOM.buttonContainer && DOM.buttonContainer.classList.add('show');
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
  if (data.taxResidentStatus === 'local') {
      employeeTypeLabel = TEXT.employeeGrossToNet.results.employeeTypes.local;
  } else if (data.taxResidentStatus === 'expat') {
      employeeTypeLabel = TEXT.employeeGrossToNet.results.employeeTypes.expat;
    } else {
      employeeTypeLabel = TEXT.employeeGrossToNet.results.employeeTypes.default;
    }
    const employeeTypeCell = html`<div class="result-title"><u>${employeeTypeLabel}</u></div>`;
    // Gross Salary box
    const grossSalaryCell = html`
  <div class="result-title" style="margin-bottom:0;">${TEXT.employeeGrossToNet.results.sections.grossSalary}</div>
  <div class="result-center-value" style="padding:0.05rem 0;">${data.grossSalary ? data.grossSalary.toLocaleString('vi-VN') + ' ' + TEXT.employeeGrossToNet.currencyUnit : '-'}</div>
    `;
    // Adjusted Gross Salary box with Total Employer Cost
    const adjustedGrossSalaryCell = html`
      <div class="result-title" style="margin-bottom:0;">${TEXT.employeeGrossToNet.results.sections.adjustedGrossSalary}</div>
      <div class="result-center-value" style="padding:0.05rem 0;">${data.adjustedGrossSalary ? data.adjustedGrossSalary.toLocaleString('vi-VN') + ' ' + TEXT.employeeGrossToNet.currencyUnit : '-'}</div>
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
      <div class="result-title" style="margin-bottom:0;">${TEXT.employeeGrossToNet.results.sections.statutoryContribution}</div>
      <div class="result-center-value" style="color:#C1272D;padding:0.05rem 0;">-${data.employeeContribution.toLocaleString('vi-VN')} ${TEXT.employeeGrossToNet.currencyUnit}</div>
        </td>
      </tr>
    `;
    // Employee Take-home row (styled like gross/adjusted gross)
    const employeeTakeHomeRow = html`
      <tr>
        <td colspan="2">
      <div class="result-title" style="margin-bottom:0;">${TEXT.employeeGrossToNet.results.sections.takeHomeSalary}</div>
      <div class="result-center-value" style="color:#1a7f3c;padding:0.05rem 0;">${data.netSalary.toLocaleString('vi-VN')} ${TEXT.employeeGrossToNet.currencyUnit}</div>
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
  // (Charts removed)
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
        } else if (continueBtn && !continueBtn.disabled) {
          continueBtn.click();
        }
      }
    });
  });

  // (Chart rendering removed)
  // --- PDF Export logic (A4, Garamond, instant download) ---
  // Ensure jsPDF and html2canvas are loaded
  function withExportStyles(run) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/export-a4.css';
    document.head.appendChild(link);
    document.body.classList.add('export-mode');
    try { return run(); } finally {
      // cleanup handled by caller
    }
  }

  async function exportResultToPdf({ exportContainer, filename = 'export.pdf', onStart = () => {}, onComplete = () => {} }) {
    if (!window.jspdf || !window.jspdf.jsPDF || !window.html2canvas) {
      throw new Error('jsPDF and html2canvas must be loaded before calling exportResultToPdf');
    }
    onStart();
    await document.fonts.ready;
    exportContainer.classList.add('export-a4');
    withExportStyles(() => {});
    try {
      const A4_WIDTH_PX = 794;
      const A4_HEIGHT_PX = 1123;
      const CAPTURE_SCALE = 2;
      const canvas = await window.html2canvas(exportContainer, {
        backgroundColor: '#fff',
        scale: CAPTURE_SCALE,
        useCORS: true,
        width: A4_WIDTH_PX,
        height: Math.max(A4_HEIGHT_PX, exportContainer.scrollHeight),
        windowWidth: A4_WIDTH_PX,
        windowHeight: Math.max(A4_HEIGHT_PX, exportContainer.scrollHeight)
      });
      const imgData = canvas.toDataURL('image/png');
      const jsPDF = window.jspdf.jsPDF;
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidthPt = 595.28;
      const marginPt = 40;
      const contentWidthPt = pageWidthPt - marginPt * 2;
      const imgHeightPt = canvas.height * (contentWidthPt / canvas.width);
      let y = marginPt;
      pdf.addImage(imgData, 'PNG', marginPt, y, contentWidthPt, imgHeightPt);
      pdf.save(filename);
      onComplete();
    } finally {
      exportContainer.classList.remove('export-a4');
      document.body.classList.remove('export-mode');
      const linkTags = Array.from(document.querySelectorAll('link[href$="export-a4.css"]'));
      linkTags.forEach(l => l.parentNode && l.parentNode.removeChild(l));
    }
  }

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
        // Collect result table (Payslip only for employee)
        const resultTableContainer = document.querySelector('.result-table-container');
        if (!resultTableContainer) return;

        // Create export container and apply export styles
        const exportContainer = document.createElement('div');
        exportContainer.className = 'pdf-export-container export-a4';

        // Add logo if exists
        const logo = document.querySelector('.logo');
        if (logo) {
          exportContainer.appendChild(logo.cloneNode(true));
        }

        // Add main header under logo (exact same as employer)
        const headerTitle = document.createElement('h1');
        try {
          headerTitle.textContent = (window.TEXT && window.TEXT.index && window.TEXT.index.title)
            ? window.TEXT.index.title
            : 'Salary Simulation Tool';
        } catch (_) {
          headerTitle.textContent = 'Salary Simulation Tool';
        }
        headerTitle.className = 'pdf-export-title';
        exportContainer.appendChild(headerTitle);

        // Add hr below the main header
        const hr = root.querySelector('hr');
        if (hr) exportContainer.appendChild(hr.cloneNode(true));

        // Add PAYSLIP title below hr
        const payslipTitle = document.createElement('h1');
        payslipTitle.textContent = TEXT.employeeGrossToNet.payslipTitle;
        payslipTitle.className = 'pdf-export-title';
        exportContainer.appendChild(payslipTitle);

        // Add Payslip table
        exportContainer.appendChild(resultTableContainer.cloneNode(true));

        // Build export footer (Important Note + Disclaimer) same as employer
        const exportFooter = document.createElement('footer');
        exportFooter.className = 'app-footer export-footer';

        const hr1 = document.createElement('hr');
        exportFooter.appendChild(hr1);

        const importantTitle = document.createElement('span');
        importantTitle.className = 'footer-title';
        importantTitle.textContent = TEXT.employeeGrossToNet.footer.importantNoteTitle;
        exportFooter.appendChild(importantTitle);

        const importantText = document.createElement('div');
        importantText.className = 'footer-text';
        // Contact text as plain text in export
        const contactPlain = document.createElement('span');
        contactPlain.textContent = TEXT.employeeGrossToNet.footer.contactLinkText;
        importantText.textContent = `${TEXT.employeeGrossToNet.footer.importantNoteText} `;
        importantText.appendChild(contactPlain);
        importantText.appendChild(document.createTextNode('.'));
        exportFooter.appendChild(importantText);

        const disclaimerTitle = document.createElement('span');
        disclaimerTitle.className = 'footer-title';
        disclaimerTitle.textContent = TEXT.employeeGrossToNet.footer.disclaimerTitle;
        exportFooter.appendChild(disclaimerTitle);

        const disclaimerText = document.createElement('div');
        disclaimerText.className = 'footer-text';
        disclaimerText.textContent = TEXT.employeeGrossToNet.footer.disclaimerText;
        exportFooter.appendChild(disclaimerText);

        // Export ID (numbers only, epoch ms) bottom-left and version bottom-right
        const exportId = String(Date.now());
        const idDiv = document.createElement('div');
        idDiv.className = 'export-id';
        idDiv.textContent = `ID: ${exportId}`;
        exportFooter.appendChild(idDiv);

        const versionDiv = document.createElement('div');
        versionDiv.className = 'version-display';
        versionDiv.textContent = (TEXT && TEXT.version) || '';
        exportFooter.appendChild(versionDiv);

        exportContainer.appendChild(exportFooter);

        // Attach and export
        document.body.appendChild(exportContainer);

        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const filename = `[PCA_Salary_Simulation]_${day}-${month}-${year}.pdf`;

        await exportResultToPdf({
          exportContainer,
          filename,
          onComplete: () => {
            if (exportContainer && exportContainer.parentNode) {
              exportContainer.parentNode.removeChild(exportContainer);
            }
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