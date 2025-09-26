

import { simulateSalary } from '../be/cal.js';
import { TEXT } from '../lang/eng.js';
import { exportResultToPdf, buildStandardPdfFilename } from '../module/download-pdf.js';
import { buildProgressBar } from '../module/progress-bar.js';

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

// (PDF download logic centralized in download-pdf.js)

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
// Progress bar now centralized via buildProgressBar (removed duplicate implementation)

function createTitleBlock(root) {
  const h1 = createAndAppend(root, 'h1');
  h1.textContent = TEXT.employeeNetToGross.pageTitle;
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
  <h2>${TEXT.employeeNetToGross.steps.taxResidentStatus.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
  <span class="info-box">${TEXT.employeeNetToGross.steps.taxResidentStatus.tooltip}</span>
      </span>
    </div>
  <select id="tax-resident-status">
  <option value="" disabled selected>${TEXT.employeeNetToGross.steps.taxResidentStatus.selectPlaceholder}</option>
  <option value="local">${TEXT.employeeNetToGross.steps.taxResidentStatus.options.local}</option>
  <option value="expat">${TEXT.employeeNetToGross.steps.taxResidentStatus.options.expat}</option>
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
      <h2>${TEXT.employeeNetToGross.steps.netSalary.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT.employeeNetToGross.steps.netSalary.tooltip}</span>
      </span>
    </div>
    <input type="text" class="number-input" id="net-salary" placeholder="${TEXT.employeeNetToGross.steps.netSalary.placeholder}" />
  <div id="net-salary-warning" class="input-warning hidden-initial">${TEXT.employeeNetToGross.steps.netSalary.warningMaxDigits}</div>
  `;
  return step2;
}

function createStep3() {
  const step3 = document.createElement('div');
  step3.className = 'form-step';
  step3.id = 'step-3';
  step3.innerHTML = html`
    <div class="step-title-row">
      <h2>${TEXT.employeeNetToGross.steps.allowance.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT.employeeNetToGross.steps.allowance.tooltip}</span>
      </span>
    </div>
    <div id="allowance-inputs">
  <div id="allowance-warning" class="input-warning hidden-initial">${TEXT.employeeNetToGross.steps.allowance.warningMaxDigits}</div>
      <label class="input-label">${TEXT.employeeNetToGross.steps.allowance.types.lunch}
        <span class="question-icon" tabindex="0">
          <img src="asset/question_icon.webp" alt="info" />
          <span class="info-box">${TEXT.employeeNetToGross.steps.allowance.tooltips.lunch}</span>
        </span>
      </label>
      <input type="text" class="number-input" id="allowance-lunch" placeholder="${TEXT.employeeNetToGross.steps.allowance.placeholders.lunch}" min="0" />

      <label class="input-label">${TEXT.employeeNetToGross.steps.allowance.types.fuel}
        <span class="question-icon" tabindex="0">
          <img src="asset/question_icon.webp" alt="info" />
          <span class="info-box">${TEXT.employeeNetToGross.steps.allowance.tooltips.fuel}</span>
        </span>
      </label>
      <input type="text" class="number-input" id="allowance-fuel" placeholder="${TEXT.employeeNetToGross.steps.allowance.placeholders.fuel}" min="0" />

      <label class="input-label">${TEXT.employeeNetToGross.steps.allowance.types.phone}
        <span class="question-icon" tabindex="0">
          <img src="asset/question_icon.webp" alt="info" />
          <span class="info-box">${TEXT.employeeNetToGross.steps.allowance.tooltips.phone}</span>
        </span>
      </label>
      <input type="text" class="number-input" id="allowance-phone" placeholder="${TEXT.employeeNetToGross.steps.allowance.placeholders.phone}" min="0" />

      <label class="input-label">${TEXT.employeeNetToGross.steps.allowance.types.travel}
        <span class="question-icon" tabindex="0">
          <img src="asset/question_icon.webp" alt="info" />
          <span class="info-box">${TEXT.employeeNetToGross.steps.allowance.tooltips.travel}</span>
        </span>
      </label>
      <input type="text" class="number-input" id="allowance-travel" placeholder="${TEXT.employeeNetToGross.steps.allowance.placeholders.travel}" min="0" />

      <label class="input-label">${TEXT.employeeNetToGross.steps.allowance.types.uniform}
        <span class="question-icon" tabindex="0">
          <img src="asset/question_icon.webp" alt="info" />
          <span class="info-box">${TEXT.employeeNetToGross.steps.allowance.tooltips.uniform}</span>
        </span>
      </label>
      <input type="text" class="number-input" id="allowance-uniform" placeholder="${TEXT.employeeNetToGross.steps.allowance.placeholders.uniform}" min="0" />

      <label class="input-label">${TEXT.employeeNetToGross.steps.allowance.types.other}
        <span class="question-icon" tabindex="0">
          <img src="asset/question_icon.webp" alt="info" />
          <span class="info-box">${TEXT.employeeNetToGross.steps.allowance.tooltips.other}</span>
        </span>
      </label>
      <input type="text" class="number-input" id="allowance-other" placeholder="${TEXT.employeeNetToGross.steps.allowance.placeholders.other}" min="0" />
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
      <h2>${TEXT.employeeNetToGross.steps.bonus.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT.employeeNetToGross.steps.bonus.tooltip}</span>
      </span>
    </div>
    <input type="text" class="number-input" id="total-bonus" placeholder="${TEXT.employeeNetToGross.steps.bonus.placeholders.other}" />
  <div id="bonus-warning" class="input-warning hidden-initial">${TEXT.employeeNetToGross.steps.bonus.warningMaxDigits}</div>
  `;
  return step4;
}

function createStep5() {
  const step5 = document.createElement('div');
  step5.className = 'form-step';
  step5.id = 'step-5';
  const benefit = TEXT.employeeNetToGross.steps.benefit || {};
  step5.innerHTML = html`
    <div class="step-title-row">
      <h2>${benefit.title || 'Benefit'}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${(benefit.tooltip) || ''}</span>
      </span>
    </div>
    <div id="benefit-inputs">
  <div id="benefit-warning" class="input-warning hidden-initial">${benefit.warningMaxDigits || 'Maximum 9 digits allowed.'}</div>
      <label class="input-label">${(benefit.types && benefit.types.childTuition) || "Child's Tuition Fee"}</label>
      <input type="text" class="number-input" id="benefit-child-tuition" placeholder="${(benefit.placeholders && benefit.placeholders.childTuition) || "Child's tuition fee (VND)"}" />
      <label class="input-label">${(benefit.types && benefit.types.rental) || 'Rental'}</label>
      <input type="text" class="number-input" id="benefit-rental" placeholder="${(benefit.placeholders && benefit.placeholders.rental) || 'Rental benefit (VND)'}" />
      <label class="input-label">${(benefit.types && benefit.types.healthInsurance) || 'Health Insurance'}</label>
      <input type="text" class="number-input" id="benefit-health-insurance" placeholder="${(benefit.placeholders && benefit.placeholders.healthInsurance) || 'Health insurance benefit (VND)'}" />
    </div>
  `;
  return step5;
}

function createNavButtons() {
  const navDiv = document.createElement('div');
  navDiv.className = 'form-navigation';
  navDiv.innerHTML = html`
    <button type="button" id="return-btn" class="simulation-button return-button">${TEXT.employeeNetToGross.buttons.return}</button>
  <button type="button" id="continue-btn" class="simulation-button">${TEXT.employeeNetToGross.buttons.continue}</button>
    <button type="submit" id="calculate-btn" class="simulation-button">${TEXT.employeeNetToGross.buttons.calculate}</button>
  `;
  return navDiv;
}

function createResultAndCharts(root) {
  const resultDiv = createAndAppend(root, 'div', { className: 'result', id: 'result', 'aria-live': 'polite' });
  return { resultDiv };
}

// Create result buttons container with Reset, Modify, Download (order aligned with employer)
function createResultButtonsContainer(root) {
  const container = createAndAppend(root, 'div', {
    className: 'result-buttons-container',
    id: 'result-buttons-container'
  });
  const hardResetBtn = createAndAppend(container, 'button', {
    className: 'simulation-button return-button',
    id: 'hard-reset-btn',
    textContent: TEXT.employeeNetToGross.buttons.reset,
    type: 'button'
  });
  const resetBtn = createAndAppend(container, 'button', {
    className: 'simulation-button return-button',
    id: 'reset-btn',
    textContent: TEXT.employeeNetToGross.buttons.modify,
    type: 'button'
  });
  const downloadBtn = createAndAppend(container, 'button', {
    className: 'simulation-button',
    id: 'download-pdf-btn',
    textContent: TEXT.employeeNetToGross.buttons.downloadPdf
  });
  return { container, hardResetBtn, resetBtn, downloadBtn };
}

// Create or populate the footer from TEXT to centralize copy
function createFooter(root) {
  const footer = createAndAppend(root, 'footer', { className: 'app-footer' });
  footer.innerHTML = html`
    <hr />
    <span class="footer-title">${TEXT.employeeNetToGross.footer.importantNoteTitle}</span>
    <div class="footer-text">${TEXT.employeeNetToGross.footer.importantNoteText} <a href="${TEXT.employeeNetToGross.footer.contactUrl}" target="_blank">${TEXT.employeeNetToGross.footer.contactLinkText}</a>.</div>
    <span class="footer-title">${TEXT.employeeNetToGross.footer.disclaimerTitle}</span>
    <div class="footer-text">${TEXT.employeeNetToGross.footer.disclaimerText}</div>
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
  buildProgressBar(root, [
    TEXT.employeeNetToGross.progressSteps.taxResidentStatus,
    TEXT.employeeNetToGross.progressSteps.netSalary,
    TEXT.employeeNetToGross.progressSteps.allowance,
    TEXT.employeeNetToGross.progressSteps.bonus,
    TEXT.employeeNetToGross.progressSteps.benefit
  ]);
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
  // Results container
  const { resultDiv } = createResultAndCharts(root);
  // Result buttons container (Reset, Modify, Download)
  const { container: buttonContainer, downloadBtn, resetBtn, hardResetBtn } = createResultButtonsContainer(root);
  // Footer (disclaimer and important notes)
  createFooter(document.body);

// --- Multi-step form navigation logic ---
  const steps = [step1, step2, step3, step4, step5];
  const returnBtn = getElement('return-btn');
  const continueBtn = getElement('continue-btn');
  const calculateBtn = getElement('calculate-btn');
  let currentStep = 0;

  function showStep(idx) {
    steps.forEach((step, i) => {
      if (!step) return;
      if (i === idx) step.classList.add('active');
      else step.classList.remove('active');
    });
    if (returnBtn) {
      returnBtn.classList.add('show');
      returnBtn.disabled = idx === 0;
      returnBtn.classList.toggle('disabled', idx === 0);
    }
    if (continueBtn) {
      if (idx < steps.length - 1) continueBtn.classList.add('show');
      else continueBtn.classList.remove('show');
    }
    if (calculateBtn) {
      if (idx === steps.length - 1) calculateBtn.classList.add('show');
      else calculateBtn.classList.remove('show');
    }
    if (idx === 1) {
      const netSalaryInput = document.getElementById('net-salary');
      if (netSalaryInput) {
        netSalaryInput.focus();
        netSalaryInput.select && netSalaryInput.select();
      }
    }
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
    updateContinueButtonState(idx);
  }

  function updateContinueButtonState(idx) {
    if (!continueBtn) return;
    let valid = false;
    const statusSelect = getElement('tax-resident-status');
    const netInput = getElement('net-salary');
    switch (idx) {
      case 0: valid = !!(statusSelect && statusSelect.value); break;
      case 1: {
        if (netInput) {
          const v = parseInt(netInput.value.replace(/\D/g, '')) || 0;
          valid = v >= 4475000;
        }
        break;
      }
      case 2: valid = true; break;
      case 3: valid = true; break;
      case 4: valid = true; break;
      default: valid = false;
    }
    continueBtn.classList.toggle('unavailable', !valid);
    continueBtn.disabled = !valid;
  }

  if (continueBtn) continueBtn.addEventListener('click', () => {
    if (!continueBtn.disabled && currentStep < steps.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  });
  if (returnBtn) returnBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });
  // Keep continue button state in sync with inputs
  const statusSelect = getElement('tax-resident-status');
  const netInput = getElement('net-salary');
  statusSelect && statusSelect.addEventListener('change', () => updateContinueButtonState(currentStep));
  netInput && netInput.addEventListener('input', () => updateContinueButtonState(currentStep));
  showStep(currentStep);

  // Charts removed

  // --- DOM references ---
  const DOM = {
    salaryForm,
    calculateBtn,
    downloadPdfBtn: downloadBtn,
    buttonContainer,
    resultDiv,
    // No chart refs
  };
  // No checkbox gating; inputs are always visible

  // --- Format number input fields and restrict max value ---
  function formatNumberInput(input) {
    let raw = input.value.replace(/[^\d]/g, '');
    let warning = null;
    if (input.id === 'net-salary') {
      warning = document.getElementById('net-salary-warning');
    } else if (input.closest('#allowance-inputs')) {
      warning = document.getElementById('allowance-warning');
    } else if (input.id === 'total-bonus') {
      warning = document.getElementById('bonus-warning');
    } else if (input.closest('#benefit-inputs')) {
      warning = document.getElementById('benefit-warning');
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

  // Charts removed

  // --- Calculation handler ---
  function parseNumber(val) {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat((val + '').replace(/[,.]/g, '')) || 0;
  }
  function getVal(id) {
    const el = getElement(id);
    return el ? el.value : '';
  }
  function handleCalculation() {
    const params = {
      method: 'net-to-gross',
      netSalary: parseNumber(getVal('net-salary')),
      taxResidentStatus: getVal('tax-resident-status') || 'local',
      
      // Net allowance inputs
      netLunchAllowance: parseNumber(getVal('allowance-lunch')),
      netFuelAllowance: parseNumber(getVal('allowance-fuel')),
      netPhoneAllowance: parseNumber(getVal('allowance-phone')),
      netTravelAllowance: parseNumber(getVal('allowance-travel')),
      netUniformAllowance: parseNumber(getVal('allowance-uniform')),
      netOtherAllowance: parseNumber(getVal('allowance-other')),
      
      // Net bonus input - single total bonus
      netTotalBonus: parseNumber(getVal('total-bonus')),
      
      // Benefit inputs
      childTuitionBenefit: parseNumber(getVal('benefit-child-tuition')),
      rentalBenefit: parseNumber(getVal('benefit-rental')),
      healthInsuranceBenefit: parseNumber(getVal('benefit-health-insurance'))
    };
    const data = simulateSalary(params);
    if (data && data.error) {
  DOM.resultDiv.innerHTML = `<div class="result-error-text">${data.error}</div>`;
      if (DOM.buttonContainer) DOM.buttonContainer.classList.remove('show');
      return;
    }
    // Destroy the form and navigation UI after calculation
    if (salaryForm && salaryForm.parentNode) {
      salaryForm.parentNode.removeChild(salaryForm);
    }
    // Hide progress bar
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) progressBar.style.display = 'none';
  // No charts
    // --- Restructured result boxes ---
    const allowanceItems = [
      { label: TEXT.employeeNetToGross.steps.allowance.types.lunch, value: data.grossLunchAllowance },
      { label: TEXT.employeeNetToGross.steps.allowance.types.fuel, value: data.grossFuelAllowance },
      { label: TEXT.employeeNetToGross.steps.allowance.types.phone, value: data.grossPhoneAllowance },
      { label: TEXT.employeeNetToGross.steps.allowance.types.travel, value: data.grossTravelAllowance },
      { label: TEXT.employeeNetToGross.steps.allowance.types.uniform, value: data.grossUniformAllowance },
      { label: TEXT.employeeNetToGross.steps.allowance.types.other.replace('Allowances',''), value: data.grossOtherAllowance }
    ].filter(item => item.value && item.value > 0);
  const bonusItems = [];
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
            <div class="result-total"><span>${data.totalAllowance.toLocaleString('vi-VN')} VND</span></div>
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
            <div class="result-total"><span>${(data.grossTotalBonus || 0).toLocaleString('vi-VN')} VND</span></div>
          </td>
        </tr>
      `;
    } else if (data.grossTotalBonus && data.grossTotalBonus > 0) {
      bonusRow = `
        <tr>
          <td colspan="2">
            <div class="result-title">Bonuses</div>
            <hr class="result-divider" />
            <div class="result-total"><span>${data.grossTotalBonus.toLocaleString('vi-VN')} VND</span></div>
          </td>
        </tr>
      `;
    }
    if (allowanceItems.length === 0 && bonusItems.length === 0) {
    noAllowanceBonusRow = `
  <tr><td colspan="2"><div class="result-none-text">${TEXT.employeeNetToGross.results.allowanceOrBonusNone}</div></td></tr>
    `;
    }
    // Employee type box (local/expat)
  let employeeTypeLabel = '';
  const status = data.taxResidentStatus;
  if (status === 'local') {
      employeeTypeLabel = TEXT.employeeNetToGross.results.employeeTypes.local;
  } else if (status === 'expat') {
      employeeTypeLabel = TEXT.employeeNetToGross.results.employeeTypes.expat;
    } else {
      employeeTypeLabel = TEXT.employeeNetToGross.results.employeeTypes.default;
    }
  const employeeTypeCell = html`<div class="result-title">${employeeTypeLabel}</div>`;
    // Gross Salary box
    const grossSalaryCell = html`
  <div class="result-title">${TEXT.employeeNetToGross.results.sections.grossSalary}</div>
  <div class="result-title">${data.grossSalary ? data.grossSalary.toLocaleString('vi-VN') + ' ' + TEXT.employeeNetToGross.currencyUnit : '-'}</div>
    `;
    // Adjusted Gross Salary box with Total Employer Cost
    const benefitSum = (data.childTuitionBenefit || 0) + (data.rentalBenefit || 0) + (data.healthInsuranceBenefit || 0);
    const adjustedGrossSalaryCell = html`
      <div class="adjusted-gross-cell">
        <div class="result-title">${TEXT.employeeNetToGross.results.sections.adjustedGrossSalary}</div>
        <div class="result-title">${data.adjustedGrossSalary ? data.adjustedGrossSalary.toLocaleString('vi-VN') + ' ' + TEXT.employeeNetToGross.currencyUnit : '-'}</div>
  <div class="result-note">(${TEXT.employeeNetToGross.results.totalEmployerCostLabel}: <span class="text-red">${data.totalEmployerCost ? data.totalEmployerCost.toLocaleString('vi-VN') + ' ' + TEXT.employeeNetToGross.currencyUnit : '-'}</span>${benefitSum > 0 ? ' ' + TEXT.employeeNetToGross.results.totalEmployerCostBenefitIncluded : ''})</div>
      </div>
    `;
    // Insurance Contribution (all employee insurances)
    const insuranceItems = [
      { label: 'Social Insurance', value: data.employeeSocialInsurance },
  { label: TEXT.employeeNetToGross.steps.benefit.types.healthInsurance, value: data.employeeHealthInsurance },
      { label: 'Unemployment Insurance', value: data.employeeUnemploymentInsurance }
    ].filter(item => item.value && item.value > 0);
    const insuranceContributionCell = `
      <div class="result-title">${TEXT.employeeNetToGross.results.sections.compulsoryInsurances}</div>
      <div class="result-list">
        ${insuranceItems.map(item => `<div class="result-item">${item.label}: <span>-${item.value.toLocaleString('vi-VN')} ${TEXT.employeeNetToGross.currencyUnit}</span></div>`).join('')}
      </div>
      <hr class="result-divider-insurance" />
  <div class="result-title"><span>-${data.employeeInsurance.toLocaleString('vi-VN')} ${TEXT.employeeNetToGross.currencyUnit}</span></div>
    `;
    // Personal Income Tax cell
    const personalIncomeTaxCell = html`
  <div class="flex-col-center-80">
  <div class="result-title center">${TEXT.employeeNetToGross.results.sections.personalIncomeTax}</div>
  <div class="result-title center">
          <span>-${data.incomeTax.toLocaleString('vi-VN')} ${TEXT.employeeNetToGross.currencyUnit}</span>
        </div>
      </div>
    `;
    // Employee Contribution row (styled like gross/adjusted gross)
    const employeeContributionRow = html`
      <tr>
        <td colspan="2">
          <div class="result-title">${TEXT.employeeNetToGross.results.sections.statutoryContribution}</div>
          <div class="result-title text-red">-${data.employeeContribution.toLocaleString('vi-VN')} ${TEXT.employeeNetToGross.currencyUnit}</div>
        </td>
      </tr>
    `;
    // Employee Take-home row (styled like gross/adjusted gross)
    const employeeTakeHomeRow = html`
      <tr>
        <td colspan="2">
      <div class="result-title">${TEXT.employeeNetToGross.results.sections.takeHomeSalary}</div>
  <div class="result-title text-green">${data.netSalary.toLocaleString('vi-VN')} ${TEXT.employeeNetToGross.currencyUnit}</div>
        </td>
      </tr>
    `;
    DOM.resultDiv.innerHTML = html`
  <h1 class="result-table-title">${TEXT.employeeNetToGross.payslipTitle}</h1>
      <div class="result-table-container">
        <table class="result-table result-table-vertical result-table-bordered employee-table-layout">
          <tr><td colspan="2">${employeeTypeCell}</td></tr>
          <tr><td colspan="2">${grossSalaryCell}</td></tr>
          ${allowanceRow}
          ${bonusRow}
          ${!allowanceRow && !bonusRow ? noAllowanceBonusRow : ''}
          <tr><td colspan="2">${adjustedGrossSalaryCell}</td></tr>
          <tr>
            <td class="p-0 va-top">${insuranceContributionCell}</td>
            <td class="p-0 va-middle">${personalIncomeTaxCell}</td>
          </tr>
          ${employeeContributionRow}
          ${employeeTakeHomeRow}
        </table>
      </div>
  
    `;
  // Show result action buttons container
  if (DOM.buttonContainer) DOM.buttonContainer.classList.add('show');
    // --- Reset button logic ---
    resetBtn.onclick = () => {
      // Hide results
      DOM.resultDiv.innerHTML = '';
      if (DOM.buttonContainer) DOM.buttonContainer.classList.remove('show');
  // No charts in this flow
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

  // (Removed keyboard Enter-to-advance to enforce explicit button clicks)

  // --- Chart rendering ---
  // Charts removed
  // --- PDF Export logic (A4, Garamond, instant download) ---
  // Ensure jsPDF and html2canvas are loaded
  // (Library loading handled in shared export module)

  function setupDownloadButton() {
    const btn = downloadBtn || document.getElementById('download-pdf-btn');
    if (!btn) return;
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
  // Libraries ensured by shared exportResultToPdf
        const resultTableContainer = document.querySelector('.result-table-container');
        if (!resultTableContainer) return;
        const exportContainer = document.createElement('div');
        exportContainer.className = 'pdf-export-container export-a4';
        // Logo
        const logo = document.querySelector('.logo');
        if (logo) exportContainer.appendChild(logo.cloneNode(true));
        // Main header below logo
        const headerTitle = document.createElement('h1');
        try {
          headerTitle.textContent = (window.TEXT && window.TEXT.index && window.TEXT.index.title) ? window.TEXT.index.title : 'Salary Simulation Tool';
        } catch (_) { headerTitle.textContent = 'Salary Simulation Tool'; }
        headerTitle.className = 'pdf-export-title';
        exportContainer.appendChild(headerTitle);
        // hr
        const hr = root.querySelector('hr');
        if (hr) exportContainer.appendChild(hr.cloneNode(true));
        // PAYSLIP title
        const payslipTitle = document.createElement('h1');
        payslipTitle.textContent = TEXT.employeeNetToGross.payslipTitle;
        payslipTitle.className = 'pdf-export-title';
        exportContainer.appendChild(payslipTitle);
        // Result table
        exportContainer.appendChild(resultTableContainer.cloneNode(true));

        // Export footer: HR + Important Note + Disclaimer + Export ID + Version
        const exportFooter = document.createElement('footer');
        exportFooter.className = 'app-footer export-footer';
        const hrFooter = document.createElement('hr');
        exportFooter.appendChild(hrFooter);
        const importantTitle = document.createElement('span');
        importantTitle.className = 'footer-title';
        importantTitle.textContent = TEXT.employeeNetToGross.footer.importantNoteTitle;
        exportFooter.appendChild(importantTitle);
        const importantText = document.createElement('div');
        importantText.className = 'footer-text';
        const contactPlain = document.createElement('span');
        contactPlain.textContent = TEXT.employeeNetToGross.footer.contactLinkText;
        importantText.textContent = `${TEXT.employeeNetToGross.footer.importantNoteText} `;
        importantText.appendChild(contactPlain);
        importantText.appendChild(document.createTextNode('.'));
        exportFooter.appendChild(importantText);
        const disclaimerTitle = document.createElement('span');
        disclaimerTitle.className = 'footer-title';
        disclaimerTitle.textContent = TEXT.employeeNetToGross.footer.disclaimerTitle;
        exportFooter.appendChild(disclaimerTitle);
        const disclaimerText = document.createElement('div');
        disclaimerText.className = 'footer-text';
        disclaimerText.textContent = TEXT.employeeNetToGross.footer.disclaimerText;
        exportFooter.appendChild(disclaimerText);
        // Export ID bottom-left
        const exportIdDiv = document.createElement('div');
        exportIdDiv.className = 'export-id';
        exportIdDiv.textContent = `ID: ${Date.now()}`;
        exportFooter.appendChild(exportIdDiv);
        // Version bottom-right
        const versionDiv = document.createElement('div');
        versionDiv.className = 'version-display';
        versionDiv.textContent = (TEXT && TEXT.version) || '';
        exportFooter.appendChild(versionDiv);
        exportContainer.appendChild(exportFooter);
        document.body.appendChild(exportContainer);

        // Standard filename
  const filename = buildStandardPdfFilename();

  await exportResultToPdf({
          exportContainer,
          filename,
          onComplete: () => {
            if (exportContainer && exportContainer.parentNode) exportContainer.parentNode.removeChild(exportContainer);
          }
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