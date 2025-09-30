import { simulateSalary } from '../be/cal.js';
import { TEXT } from '../lang/eng.js';
import { exportResultToPdf, buildStandardPdfFilename } from '../module/download-pdf.js';
import { buildProgressBar } from '../module/progress-bar.js';

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const MIN_SALARY = 5000000;
const MAX_DIGITS = 9;

const TEXT_CONFIG = TEXT.employerGrossToNet;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get an element by its ID
 */
function getElement(id) {
  return document.getElementById(id);
}

/**
 * Create an element and append it to parent with optional properties and innerHTML
 */
function createAndAppend(parent, tag, props = {}, innerHTML = '') {
  const el = document.createElement(tag);
  Object.assign(el, props);
  if (innerHTML) el.innerHTML = innerHTML;
  parent.appendChild(el);
  return el;
}

/**
 * Template literal utility for HTML strings
 */
const html = (strings, ...values) =>
  strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');

/**
 * Format currency with locale and configured unit
 */
function formatCurrency(val) {
  const unit = TEXT_CONFIG.currencyUnit || 'VND';
  return val || val === 0 ? `${Number(val).toLocaleString('vi-VN')} ${unit}` : '-';
}

/**
 * Export-only stylesheet toggle
 */
function withExportStyles(run) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/export-a4.css';
  document.head.appendChild(link);
  document.body.classList.add('export-mode');
  try { return run(); } finally {
    // cleanup is handled by caller after async completes
  }
}


// ============================================================================
// UI CREATION FUNCTIONS
// ============================================================================

/**
 * Create the progress bar showing form navigation steps
 * @param {HTMLElement} root - Root element to append progress bar to
 * @returns {HTMLElement} The created progress bar element
 */
// Progress bar now centralized via buildProgressBar (removed duplicate implementation)

/**
 * Create the main title block with heading and horizontal rule
 * @param {HTMLElement} root - Root element to append title to
 * @returns {HTMLElement} The created h1 element
 */
function createTitleBlock(root) {
  const h1 = createAndAppend(root, 'h1');
  h1.textContent = TEXT_CONFIG.pageTitle;
  root.appendChild(document.createElement('hr'));
  return h1;
}

/**
 * Create the main salary form container
 * @param {HTMLElement} root - Root element to append form to
 * @returns {HTMLElement} The created form element
 */
function createSalaryForm(root) {
  const salaryForm = createAndAppend(root, 'form', { id: 'salary-form' });
  return salaryForm;
}

/**
 * Create Step 1: Tax Resident Status Selection
 * @returns {HTMLElement} The created step element
 */
function createStep1() {
  const step1 = document.createElement('div');
  step1.className = 'form-step';
  step1.id = 'step-1';
  step1.innerHTML = html`
    <div class="step-title-row">
      <h2>${TEXT_CONFIG.steps.taxResidentStatus.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT_CONFIG.infoTooltips.taxResidentStatus}</span>
      </span>
    </div>
    <select id="tax-resident-status">
      <option value="" disabled selected>${TEXT_CONFIG.steps.taxResidentStatus.selectPlaceholder}</option>
      <option value="local">${TEXT_CONFIG.steps.taxResidentStatus.options.local}</option>
      <option value="expat">${TEXT_CONFIG.steps.taxResidentStatus.options.expat}</option>
    </select>
  `;
  return step1;
}

/**
 * Create Step 2: Gross Salary Input
 * @returns {HTMLElement} The created step element
 */
function createStep2() {
  const step2 = document.createElement('div');
  step2.className = 'form-step';
  step2.id = 'step-2';
  step2.innerHTML = html`
    <div class="step-title-row">
      <h2>${TEXT_CONFIG.steps.grossSalary.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT_CONFIG.infoTooltips.grossSalary}</span>
      </span>
    </div>
    <input type="text" class="number-input" id="gross-salary" placeholder="${TEXT_CONFIG.steps.grossSalary.placeholder}" />
    <div id="gross-salary-warning" class="input-warning">${TEXT_CONFIG.warnings.maxDigits}</div>
  `;
  return step2;
}

/**
 * Create Step 3: Allowance Inputs
 * @returns {HTMLElement} The created step element
 */
function createStep3() {
  const step3 = document.createElement('div');
  step3.className = 'form-step';
  step3.id = 'step-3';
  step3.innerHTML = html`
    <div class="step-title-row">
      <h2>${TEXT_CONFIG.steps.allowance.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT_CONFIG.infoTooltips.allowance}</span>
      </span>
    </div>
    <div id="allowance-container">
      <div id="allowance-inputs">
        <div id="allowance-warning" class="input-warning">${TEXT_CONFIG.warnings.maxDigits}</div>
        
        <label class="input-label">${TEXT_CONFIG.steps.allowance.types.lunch}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT_CONFIG.infoTooltips.lunch}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="allowance-lunch" placeholder="${TEXT_CONFIG.steps.allowance.placeholders.lunch}" min="0" />
        
        <label class="input-label">${TEXT_CONFIG.steps.allowance.types.fuel}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT_CONFIG.infoTooltips.fuel}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="allowance-fuel" placeholder="${TEXT_CONFIG.steps.allowance.placeholders.fuel}" min="0" />
        
        <label class="input-label">${TEXT_CONFIG.steps.allowance.types.phone}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT_CONFIG.infoTooltips.phone}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="allowance-phone" placeholder="${TEXT_CONFIG.steps.allowance.placeholders.phone}" min="0" />
        
        <label class="input-label">${TEXT_CONFIG.steps.allowance.types.travel}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT_CONFIG.infoTooltips.travel}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="allowance-travel" placeholder="${TEXT_CONFIG.steps.allowance.placeholders.travel}" min="0" />
        
        <label class="input-label">${TEXT_CONFIG.steps.allowance.types.uniform}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT_CONFIG.infoTooltips.uniform}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="allowance-uniform" placeholder="${TEXT_CONFIG.steps.allowance.placeholders.uniform}" min="0" />
        
        <label class="input-label">${TEXT_CONFIG.steps.allowance.types.other}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT_CONFIG.infoTooltips.otherAllowance}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="allowance-other" placeholder="${TEXT_CONFIG.steps.allowance.placeholders.other}" min="0" />
      </div>
    </div>
  `;
  return step3;
}

/**
 * Create Step 4: Bonus Input
 * @returns {HTMLElement} The created step element
 */
function createStep4() {
  const step4 = document.createElement('div');
  step4.className = 'form-step';
  step4.id = 'step-4';
  step4.innerHTML = html`
    <div class="step-title-row">
      <h2>${TEXT_CONFIG.steps.bonus.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT_CONFIG.infoTooltips.bonus}</span>
      </span>
    </div>
    <input type="text" class="number-input" id="total-bonus" placeholder="${TEXT_CONFIG.steps.bonus.placeholder}" />
    <div id="bonus-warning" class="input-warning">${TEXT_CONFIG.warnings.maxDigits}</div>
  `;
  return step4;
}

/**
 * Create Step 5: Benefit Inputs
 * @returns {HTMLElement} The created step element
 */
function createStep5() {
  const step5 = document.createElement('div');
  step5.className = 'form-step';
  step5.id = 'step-5';
  step5.innerHTML = html`
    <div class="step-title-row">
      <h2>${TEXT_CONFIG.steps.benefit.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT_CONFIG.infoTooltips.benefit}</span>
      </span>
    </div>
    <div id="benefit-container">
      <div id="benefit-inputs">
        <div id="benefit-warning" class="input-warning">${TEXT_CONFIG.warnings.maxDigits}</div>
        
        <label class="input-label">${TEXT_CONFIG.steps.benefit.types.childTuition}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT_CONFIG.infoTooltips.childTuition}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="benefit-child-tuition" placeholder="${TEXT_CONFIG.steps.benefit.placeholders.childTuition}" min="0" />
        
        <label class="input-label">${TEXT_CONFIG.steps.benefit.types.rental}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT_CONFIG.infoTooltips.rental}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="benefit-rental" placeholder="${TEXT_CONFIG.steps.benefit.placeholders.rental}" min="0" />
        
        <label class="input-label">${TEXT_CONFIG.steps.benefit.types.healthInsurance}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT_CONFIG.infoTooltips.healthInsurance}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="benefit-health-insurance" placeholder="${TEXT_CONFIG.steps.benefit.placeholders.healthInsurance}" min="0" />
      </div>
    </div>
  `;
  return step5;
}

/**
 * Create navigation buttons container with continue, return, and calculate buttons
 * @returns {HTMLElement} The created navigation container
 */
function createNavButtons() {
  const navDiv = document.createElement('div');
  navDiv.className = 'form-navigation';
  navDiv.innerHTML = html`
    <button type="button" id="return-btn" class="simulation-button return-button">${TEXT_CONFIG.buttons.return}</button>
    <button type="button" id="continue-btn" class="simulation-button">${TEXT_CONFIG.buttons.continue}</button>
    <button type="button" id="calculate-btn" class="simulation-button">${TEXT_CONFIG.buttons.calculate}</button>
  `;
  return navDiv;
}

/**
 * Create the result section container
 * @param {HTMLElement} root - Root element to append result section to
 * @returns {Object} Object containing resultDiv reference
 */
function createResultSection(root) {
  const resultDiv = createAndAppend(root, 'div', { className: 'result', id: 'result', 'aria-live': 'polite' });
  return { resultDiv };
}

/**
 * Create the result buttons container with reset, modify, and download PDF buttons
 * @param {HTMLElement} root - Root element to append button container to
 * @returns {Object} Object containing button references
 */
function createResultButtonsContainer(root) {
  const buttonContainer = createAndAppend(root, 'div', {
    className: 'result-buttons-container',
    id: 'result-buttons-container'
  });
  
  // Reorganized order: Reset, Modify Information, Download PDF
  const hardResetBtn = createAndAppend(buttonContainer, 'button', {
    className: 'simulation-button return-button',
    id: 'hard-reset-btn',
    textContent: TEXT_CONFIG.buttons.reset,
    type: 'button'
  });
  
  const resetBtn = createAndAppend(buttonContainer, 'button', {
    className: 'simulation-button return-button',
    id: 'reset-btn',
    textContent: TEXT_CONFIG.buttons.modify,
    type: 'button'
  });
  
  const downloadBtn = createAndAppend(buttonContainer, 'button', {
    className: 'simulation-button',
    id: 'download-pdf-btn',
    textContent: TEXT_CONFIG.buttons.downloadPdf
  });
  
  return { buttonContainer, downloadBtn, resetBtn, hardResetBtn };
}

/**
 * Create the footer with disclaimer and important notes
 * @param {HTMLElement} root - Root element to append footer to
 * @returns {HTMLElement} The created footer element
 */
function createFooter(root) {
  const footer = createAndAppend(root, 'footer', { className: 'app-footer' });
  footer.innerHTML = html`
    <hr />
    <span class="footer-title">${TEXT_CONFIG.footer.importantNoteTitle}</span>
    <div class="footer-text">${TEXT_CONFIG.footer.importantNoteText} <a href="${TEXT_CONFIG.footer.contactUrl}" target="_blank">${TEXT_CONFIG.footer.contactLinkText}</a>.</div>
    <span class="footer-title">${TEXT_CONFIG.footer.disclaimerTitle}</span>
    <div class="footer-text">${TEXT_CONFIG.footer.disclaimerText}</div>
  `;
  
  // Function to dynamically position footer
  function positionFooter() {
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Check if the entire document fits in the viewport
    if (documentHeight <= viewportHeight) {
      // Fix footer at bottom of viewport
      footer.style.position = 'fixed';
      footer.style.bottom = '1rem';
      footer.style.left = '50%';
      footer.style.transform = 'translateX(-50%)';
      footer.style.zIndex = '1000';
      footer.style.margin = '2rem auto';
      footer.style.width = '70vw';
      // Add padding to body to prevent content from being hidden behind footer
      const footerHeight = footer.offsetHeight;
      document.body.style.paddingBottom = `${footerHeight + 32}px`;
    } else {
      // Reset to normal flow positioning
      footer.style.position = '';
      footer.style.bottom = '';
      footer.style.left = '';
      footer.style.transform = '';
      footer.style.zIndex = '';
      footer.style.marginTop = '12rem'; // Only this override for extra spacing
      document.body.style.paddingBottom = '';
    }
  }
  
  // Position footer initially after DOM is fully ready
  setTimeout(positionFooter, 200);
  
  // Reposition footer on window resize
  window.addEventListener('resize', () => {
    setTimeout(positionFooter, 100);
  });
  
  // Reposition footer when content changes (e.g., form to results)
  const observer = new MutationObserver(() => {
    setTimeout(positionFooter, 150);
  });
  
  observer.observe(root, {
    childList: true,
    subtree: true
  });
  
  // Also reposition when form steps change
  const progressBar = document.querySelector('#progress-bar');
  if (progressBar) {
    const progressObserver = new MutationObserver(() => {
      setTimeout(positionFooter, 100);
    });
    progressObserver.observe(progressBar, {
      attributes: true,
      subtree: true
    });
  }
  
  return footer;
}

// ============================================================================
// INITIALIZATION AND DOM SETUP
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const root = getElement('gross-to-net-root');
  root.innerHTML = '';

  // Create UI components
  createTitleBlock(root);
  buildProgressBar(root, [
    TEXT_CONFIG.progressSteps.taxResidentStatus,
    TEXT_CONFIG.progressSteps.grossSalary,
    TEXT_CONFIG.progressSteps.allowance,
    TEXT_CONFIG.progressSteps.bonus,
    TEXT_CONFIG.progressSteps.benefit
  ]);
  const salaryForm = createSalaryForm(root);
  
  // Create form steps
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
  salaryForm.appendChild(createNavButtons());
  
  // Create result containers and buttons
  const { resultDiv } = createResultSection(root);
  const { buttonContainer, downloadBtn, resetBtn, hardResetBtn } = createResultButtonsContainer(root);

  // Create footer
  createFooter(root);

  // ============================================================================
  // FORM NAVIGATION SYSTEM
  // ============================================================================
  
  const steps = [step1, step2, step3, step4, step5];
  let currentStep = 0;

  // Get button references after they're created and added to DOM
  const returnBtn = getElement('return-btn');
  const continueBtn = getElement('continue-btn');
  const calculateBtn = getElement('calculate-btn');

  /**
   * Show the specified step and update navigation buttons
   * @param {number} idx - Step index to show
   */
  function showStep(idx) {
    steps.forEach((step, i) => {
      if (step) {
        if (i === idx) {
          step.classList.add('active');
        } else {
          step.classList.remove('active');
        }
      }
    });
    
    // Show/hide navigation buttons based on current step
    // Always show return button, but disable it on first step
    if (returnBtn) {
      returnBtn.classList.add('show');
      if (idx === 0) {
        returnBtn.disabled = true;
        returnBtn.classList.add('disabled');
      } else {
        returnBtn.disabled = false;
        returnBtn.classList.remove('disabled');
      }
    }
    
    if (continueBtn) {
      if (idx < steps.length - 1) {
        continueBtn.classList.add('show');
      } else {
        continueBtn.classList.remove('show');
      }
    }
    if (calculateBtn) {
      if (idx === steps.length - 1) {
        calculateBtn.classList.add('show');
      } else {
        calculateBtn.classList.remove('show');
      }
    }
    
    // Update continue button state based on step validation
    updateContinueButtonState(idx);
    
    // Auto-focus gross base salary input on step 2
    if (idx === 1) {
      const grossSalaryInput = document.getElementById('gross-salary');
      if (grossSalaryInput) {
        grossSalaryInput.focus();
        grossSalaryInput.select && grossSalaryInput.select();
      }
    }
    
    updateProgressBar(idx);
  }

  /**
   * Update progress bar visual state
   * @param {number} idx - Current step index
   */
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

  /**
   * Update continue button state based on current step validation
   * @param {number} idx - Current step index
   */
  function updateContinueButtonState(idx) {
    if (!continueBtn) return;
    
    let isValid = false;
    
    switch (idx) {
      case 0: // Tax Resident Status step
        isValid = taxResidentStatusSelect && taxResidentStatusSelect.value;
        break;
      case 1: // Gross base salary step
        if (grossSalaryInput) {
          const numericValue = parseInt(grossSalaryInput.value.replace(/\D/g, '')) || 0;
          isValid = numericValue >= MIN_SALARY;
        }
        break;
      case 2: // Allowance step (always valid, can skip)
        isValid = true;
        break;
      case 3: // Bonus step (always valid, can skip)
        isValid = true;
        break;
      case 4: // Benefit step (always valid, can skip)
        isValid = true;
        break;
      default:
        isValid = false;
    }
    
    continueBtn.classList.toggle('unavailable', !isValid);
    continueBtn.disabled = !isValid;
  }

  // ============================================================================
  // STEP VALIDATION AND EVENT HANDLERS
  // ============================================================================

  // Step 1: Tax Resident Status Selection
  const taxResidentStatusSelect = getElement('tax-resident-status');
  if (taxResidentStatusSelect) {
    taxResidentStatusSelect.addEventListener('change', () => updateContinueButtonState(currentStep));
  }

  // Step 2: Gross Base Salary Input
  const grossSalaryInput = getElement('gross-salary');
  if (grossSalaryInput) {
    grossSalaryInput.addEventListener('input', () => updateContinueButtonState(currentStep));
  }

  // Continue button handler
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (currentStep < steps.length - 1 && !continueBtn.disabled) {
        currentStep++;
        showStep(currentStep);
      }
    });
  }

  // Return button handler
  if (returnBtn) {
    returnBtn.addEventListener('click', () => {
      if (currentStep > 0 && !returnBtn.disabled) {
        currentStep--;
        showStep(currentStep);
      }
    });
  }

  // Initialize first step
  showStep(currentStep);

  // ============================================================================
  // DOM REFERENCES AND INPUT HANDLING
  // ============================================================================
  
  const DOM = {
    salaryForm,
    calculateBtn,
    downloadPdfBtn: downloadBtn,
    buttonContainer,
    resultDiv,
    allowanceInputs: getElement('allowance-inputs'),
    benefitInputs: getElement('benefit-inputs')
  };

  /**
   * Format number input with Vietnamese locale and handle max digits validation
   * @param {HTMLInputElement} input - Input element to format
   */
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
    } else if (input.closest('#benefit-inputs')) {
      warningElement = document.getElementById('benefit-warning');
    }
    
    // Check max digits limit
    if (rawValue.length > MAX_DIGITS) {
      if (warningElement) warningElement.classList.add('show');
      rawValue = rawValue.slice(0, MAX_DIGITS);
    } else {
      if (warningElement) warningElement.classList.remove('show');
    }
    
    // Format with commas
    if (rawValue) {
      const numericValue = parseInt(rawValue, 10);
      input.value = numericValue ? numericValue.toLocaleString('vi-VN') : '';
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
  // CALCULATION AND RESULT HANDLING
  // ============================================================================

  /**
   * Handle the salary calculation process
   */
  function handleCalculation() {
    // Helper functions
    const parseNumber = (val) => {
      if (typeof val === 'number') return val;
      if (!val || val === '') return 0;
      // Handle both comma and period as thousands separators (Vietnamese uses periods)
      return parseFloat((val + '').replace(/[,.]/g, '')) || 0;
    };
    
    const getVal = (id) => {
      const element = getElement(id);
      return element ? element.value : '';
    };

    // Collect form data - consistent with backend expectations
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
      
      // Bonus input
      totalBonus: parseNumber(getVal('total-bonus')),
      
      // Benefit inputs
      childTuitionBenefit: parseNumber(getVal('benefit-child-tuition')),
      rentalBenefit: parseNumber(getVal('benefit-rental')),
      healthInsuranceBenefit: parseNumber(getVal('benefit-health-insurance'))
    };

    // Simulate salary calculation
    const data = simulateSalary(params);

    // Handle calculation errors
    if (data && data.error) {
      DOM.resultDiv.innerHTML = `<span class="result-error-text">${data.error}</span>`;
      DOM.buttonContainer.classList.remove('show');
      return;
    }

    // Clean up form UI after successful calculation
    cleanupFormAfterCalculation();
    
    // Render results
    renderResults(data);
    
    // Show action buttons container
    DOM.buttonContainer.classList.add('show');
    
    // Setup button handlers
    setupResetHandlers();
  }

  /**
   * Clean up form interface after successful calculation
   */
  function cleanupFormAfterCalculation() {
    // Remove form and hide progress bar
    if (salaryForm && salaryForm.parentNode) {
      salaryForm.parentNode.removeChild(salaryForm);
    }
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) progressBar.classList.add('progress-bar-hidden');
  }

  /**
   * Render calculation results in the result container
   * @param {Object} data - Calculation result data
   */
  function renderResults(data) {
    // Prepare allowance items using consistent field names
    const allowanceItem = [
      { label: TEXT_CONFIG.steps.allowance.types.lunch, value: data.grossLunchAllowance },
      { label: TEXT_CONFIG.steps.allowance.types.fuel, value: data.grossFuelAllowance },
      { label: TEXT_CONFIG.steps.allowance.types.phone, value: data.grossPhoneAllowance },
      { label: TEXT_CONFIG.steps.allowance.types.travel, value: data.grossTravelAllowance },
      { label: TEXT_CONFIG.steps.allowance.types.uniform, value: data.grossUniformAllowance },
      { label: TEXT_CONFIG.steps.allowance.types.other, value: data.grossOtherAllowance }
    ].filter(item => item.value && item.value > 0);
    
    // Prepare benefit items
    const benefitItem = [
      { label: TEXT_CONFIG.steps.benefit.types.childTuition, value: data.childTuitionBenefit },
      { label: TEXT_CONFIG.steps.benefit.types.rental, value: data.rentalBenefit },
  { label: TEXT_CONFIG.steps.benefit.types.healthInsurance, value: data.healthInsuranceBenefit }
    ].filter(item => item.value && item.value > 0);
    
    // Check if there are bonuses
    const hasBonus = data.grossTotalBonus && data.grossTotalBonus > 0;

    // Generate table rows
    const allowanceRow = generateAllowanceRow(allowanceItem, data.grossTotalAllowance);
    const bonusRow = generateBonusRow(hasBonus, data.grossTotalBonus);
    const benefitRow = generateBenefitRow(benefitItem, data.totalBenefit);
    const noAllowanceBonusRow = (allowanceItem.length === 0 && !hasBonus) 
      ? `<tr><td colspan="2"><div class="result-title result-title-muted">${TEXT_CONFIG.warnings.noAllowanceOrBonus}</div></td></tr>`
      : '';

    // Generate content sections
    const employeeTypeLabel = getEmployeeTypeLabel(data.taxResidentStatus);
  const employeeTypeCell = `<div class="result-title">${employeeTypeLabel}</div>`;
  const grossSalaryCell = `<div class="result-title">${TEXT_CONFIG.results.sections.grossSalary}</div><div class="result-title">${formatCurrency(data.grossSalary)}</div>`;
  const adjustedGrossSalaryCell = `<div class="result-title">${TEXT_CONFIG.results.sections.adjustedGrossSalary}</div><div class="result-title">${formatCurrency(data.adjustedGrossSalary)}</div>`;

    const employeeDetailsCell = generateEmployeeDetailsCell(data);
  const employeeTotalCell = `<div class="result-title">${TEXT_CONFIG.results.sections.takeHomeTotal}</div><div class="result-total"><span class="employee-total-value">${formatCurrency(data.netSalary)}</span></div>`;

    // Generate employer cost table rows
    const employerBenefitRow = generateEmployerCostBenefitRow(benefitItem, data.totalBenefit);
    const employerStatutoryRow = generateEmployerCostStatutoryRow(data);
  const employerAdjustedGrossSalaryCell = `<div class="result-title">${TEXT_CONFIG.results.employerCostTable.sections.adjustedGrossSalary}</div><div class="result-title">${formatCurrency(data.adjustedGrossSalary)}</div>`;
  const employerTotalCell = `<div class="result-title">${TEXT_CONFIG.results.employerCostTable.sections.totalEmployerCost}</div><div class="result-total"><span class="employer-total-value">${formatCurrency(data.totalEmployerCost)}</span></div>`;

    // Render both tables within the same result container
    DOM.resultDiv.innerHTML = html`
      <h1 class="result-table-title">${TEXT_CONFIG.payslipTitle}</h1>
      <div class="result-table-container">
        <table class="result-table result-table-vertical result-table-bordered employer-table-layout payslip-table-layout">
          <tr><td colspan="2">${employeeTypeCell}</td></tr>
          <tr><td colspan="2">${grossSalaryCell}</td></tr>
          ${allowanceRow}
          ${bonusRow}
          ${noAllowanceBonusRow}
          <tr><td colspan="2">${adjustedGrossSalaryCell}</td></tr>
          <tr><td colspan="2">${employeeDetailsCell}</td></tr>
          <tr><td colspan="2">${employeeTotalCell}</td></tr>
        </table>
      </div>
      
      <h1 class="result-table-title">${TEXT_CONFIG.results.employerCostTable.title}</h1>
      <div class="result-table-container">
        <table class="result-table result-table-vertical result-table-bordered employer-table-layout employer-cost-table-layout">
          <tr><td colspan="2">${employerAdjustedGrossSalaryCell}</td></tr>
          ${employerStatutoryRow}
          ${employerBenefitRow}
          <tr><td colspan="2">${employerTotalCell}</td></tr>
        </table>
      </div>
    `;
  }

  // ============================================================================
  // RESULT GENERATION HELPER FUNCTIONS
  // ============================================================================

  /**
   * Generate allowance row for results table
   * @param {Array} allowanceItem - Array of allowance items
   * @param {number} totalAllowance - Total allowance amount
   * @returns {string} HTML string for allowance row
   */
  function generateAllowanceRow(allowanceItem, totalAllowance) {
    if (allowanceItem.length === 0) return '';
    
    return `
      <tr>
        <td colspan="2">
          <div class="result-title">${TEXT_CONFIG.results.sections.allowance}</div>
          <div class="result-list">
            ${allowanceItem.map(item => `<div class="result-item">${item.label}: <span>${formatCurrency(item.value)}</span></div>`).join('')}
          </div>
          <hr class="result-divider" />
          <div class="result-total"><span>${formatCurrency(totalAllowance)}</span></div>
        </td>
      </tr>
    `;
  }

  /**
   * Generate bonus row for results table
   * @param {boolean} hasBonus - Whether bonus exists
   * @param {number} totalBonus - Total bonus amount
   * @returns {string} HTML string for bonus row
   */
  function generateBonusRow(hasBonus, totalBonus) {
    if (!hasBonus) return '';
    
    return `
      <tr>
        <td colspan="2">
          <div class="result-title">${TEXT_CONFIG.results.sections.bonus}</div>
          <div class="result-title">${formatCurrency(totalBonus)}</div>
        </td>
      </tr>
    `;
  }

  /**
   * Generate benefit row for results table
   * @param {Array} benefitItem - Array of benefit items
   * @param {number} totalBenefit - Total benefit amount
   * @returns {string} HTML string for benefit row
   */
  function generateBenefitRow(benefitItem, totalBenefit) {
    if (benefitItem.length === 0) return '';
    
    return `
      <tr>
        <td colspan="2">
          <div class="result-title">${TEXT_CONFIG.results.sections.benefit}</div>
          <div class="result-list">
            ${benefitItem.map(item => `<div class="result-item">${item.label}: <span>${formatCurrency(item.value)}</span></div>`).join('')}
          </div>
          <hr class="result-divider" />
          <div class="result-total"><span>${formatCurrency(totalBenefit || 0)}</span></div>
        </td>
      </tr>
    `;
  }

  /**
   * Get employee type label based on tax resident status
   * @param {string} taxResidentStatus - Tax resident status
   * @returns {string} Employee type label
   */
  function getEmployeeTypeLabel(taxResidentStatus) {
    return TEXT_CONFIG.results.employeeTypes[taxResidentStatus] || TEXT_CONFIG.results.employeeTypes.default;
  }

  /**
   * Generate employee details cell content
   * @param {Object} data - Calculation result data
   * @returns {string} HTML string for employee details
   */
  function generateEmployeeDetailsCell(data) {
    return html`
      <div class="result-title">${TEXT_CONFIG.results.sections.employeeTakeHome}</div>
      <div class="result-list">
  <div class="result-item">${TEXT_CONFIG.results.costBreakdown.socialInsurance}: <span>-${formatCurrency(data.employeeInsurance)}</span></div>
  <div class="result-item">${TEXT_CONFIG.results.costBreakdown.personalIncomeTax}: <span>-${formatCurrency(data.incomeTax)}</span></div>
      </div>
    `;
  }

  /**
   * Generate employer cost benefit row
   * @param {Array} benefitItem - Array of benefit items
   * @param {number} totalBenefit - Total benefit amount
   * @returns {string} HTML string for employer benefit row
   */
  function generateEmployerCostBenefitRow(benefitItem, totalBenefit) {
    if (benefitItem.length === 0) {
      return `
        <tr>
          <td colspan="2">
            <div class="result-none-text">${TEXT_CONFIG.results.employerCostTable.noBenefit}</div>
          </td>
        </tr>
      `;
    }
    
    return `
      <tr>
        <td colspan="2">
          <div class="result-title">${TEXT_CONFIG.results.employerCostTable.sections.benefit}</div>
          <div class="result-list">
            ${benefitItem.map(item => `<div class="result-item">${item.label}: <span>${formatCurrency(item.value)}</span></div>`).join('')}
          </div>
          <hr class="result-divider" />
          <div class="result-total"><span>${formatCurrency(totalBenefit || 0)}</span></div>
        </td>
      </tr>
    `;
  }

  /**
   * Generate employer cost statutory row
   * @param {Object} data - Calculation result data
   * @returns {string} HTML string for employer statutory row
   */
  function generateEmployerCostStatutoryRow(data) {
    return `
      <tr>
        <td colspan="2">
          <div class="result-title">${TEXT_CONFIG.results.employerCostTable.sections.statutoryContribution}</div>
          <div class="result-list">
            <div class="result-item">${TEXT_CONFIG.results.costBreakdown.socialInsurance}: <span>+${formatCurrency(data.employerInsurance)}</span></div>
            <div class="result-item">${TEXT_CONFIG.results.costBreakdown.unionFee}: <span>+${formatCurrency(data.employerTradeUnionFund)}</span></div>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Setup reset button handlers
   */
  function setupResetHandlers() {
    resetBtn.onclick = () => {
      // Hide results and button container
      DOM.resultDiv.innerHTML = '';
      DOM.buttonContainer.classList.remove('show');
      
      // Re-insert form
      if (!document.getElementById('salary-form')) {
        root.insertBefore(salaryForm, DOM.resultDiv);
      }
      
      // Show progress bar and reset to first step
      const progressBar = document.getElementById('progress-bar');
      if (progressBar) progressBar.classList.remove('progress-bar-hidden');
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

  // ============================================================================
  // PDF EXPORT FUNCTIONALITY
  // ============================================================================

  /**
   * Ensure jsPDF and html2canvas libraries are loaded before export
   * @param {Function} callback - Callback to execute when libraries are ready
   */
  // (PDF download logic centralized in download-pdf.js)

  /**
   * Setup the download PDF button functionality
   */
  function setupDownloadButton() {
    downloadBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
  // Libraries loaded inside shared exportResultToPdf
  // Collect both result tables (Payslip and Employer Cost)
  const resultTableContainers = Array.from(document.querySelectorAll('.result-table-container'));
  if (!resultTableContainers.length) return;
        
        // Create export container
        const exportContainer = document.createElement('div');
        exportContainer.className = 'pdf-export-container export-a4';
        
        // Add logo if exists
        const logo = document.querySelector('.logo');
        if (logo) {
          exportContainer.appendChild(logo.cloneNode(true));
        }
        
        // Add main header under logo (use exact case)
        const headerTitle = document.createElement('h1');
        try {
          headerTitle.textContent = (window.TEXT && window.TEXT.index && window.TEXT.index.title
            ? window.TEXT.index.title
            : 'Salary Simulation Tool');
        } catch (_) {
          headerTitle.textContent = 'Salary Simulation Tool';
        }
        headerTitle.className = 'pdf-export-title';
        exportContainer.appendChild(headerTitle);

        // Add hr below the main header
        const hr = root.querySelector('hr');
        if (hr) {
          exportContainer.appendChild(hr.cloneNode(true));
        }

        // Add PAYSLIP title below hr, same size as Employer's Cost
        const payslipTitle = document.createElement('h1');
        payslipTitle.textContent = TEXT_CONFIG.payslipTitle;
        payslipTitle.className = 'pdf-export-title';
        exportContainer.appendChild(payslipTitle);
        
        // Add Payslip table (first container)
        exportContainer.appendChild(resultTableContainers[0].cloneNode(true));

        // Add Employer Cost table (second container), with its own title if present
        if (resultTableContainers[1]) {
          const employerCostTitle = document.createElement('h1');
          employerCostTitle.textContent = TEXT_CONFIG.results.employerCostTable.title;
          employerCostTitle.className = 'pdf-export-title';
          exportContainer.appendChild(employerCostTitle);
          exportContainer.appendChild(resultTableContainers[1].cloneNode(true));
        }

  // Add export footer (Important Note + Disclaimer) with same styling
        const exportFooter = document.createElement('footer');
        exportFooter.className = 'app-footer export-footer';
        const hr1 = document.createElement('hr');
        exportFooter.appendChild(hr1);
        const importantTitle = document.createElement('span');
        importantTitle.className = 'footer-title';
        importantTitle.textContent = TEXT_CONFIG.footer.importantNoteTitle;
        exportFooter.appendChild(importantTitle);
        const importantText = document.createElement('div');
        importantText.className = 'footer-text';
        // Render contact text as plain text (no underline/hyperlink) in export
        const contactPlain = document.createElement('span');
        contactPlain.textContent = TEXT_CONFIG.footer.contactLinkText;
        importantText.textContent = `${TEXT_CONFIG.footer.importantNoteText} `;
        importantText.appendChild(contactPlain);
        importantText.appendChild(document.createTextNode('.'));
        exportFooter.appendChild(importantText);
        const disclaimerTitle = document.createElement('span');
        disclaimerTitle.className = 'footer-title';
        disclaimerTitle.textContent = TEXT_CONFIG.footer.disclaimerTitle;
        exportFooter.appendChild(disclaimerTitle);
  const disclaimerText = document.createElement('div');
  disclaimerText.className = 'footer-text';
  disclaimerText.textContent = TEXT_CONFIG.footer.disclaimerText;
  exportFooter.appendChild(disclaimerText);

  // Export ID: plain epoch milliseconds (numbers only)
  const exportTimestamp = Date.now();
  const exportId = String(exportTimestamp);

  // Add ID (bottom-left) and version (bottom-right) inside footer on same line
  const idDiv = document.createElement('div');
  idDiv.className = 'export-id';
  idDiv.textContent = `ID: ${exportId}`;
  exportFooter.appendChild(idDiv);

  // Add version label inside the export footer so it appears below disclaimer text
  const versionDiv = document.createElement('div');
  versionDiv.className = 'version-display';
  versionDiv.textContent = (TEXT && TEXT.version) || (TEXT_CONFIG && TEXT_CONFIG.version) || '';
  exportFooter.appendChild(versionDiv);
  exportContainer.appendChild(exportFooter);
        
        // Ensure export container is attached to DOM for html2canvas
        document.body.appendChild(exportContainer);
 
        // Generate filename with current date
  const filename = buildStandardPdfFilename();
        
        // Export to PDF
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
  }

  // Setup download button functionality
  // Create and display version information in bottom right corner (page)
  function createVersionDisplay() {
    if (document.querySelector('.version-display')) return;
    const versionDiv = document.createElement('div');
    versionDiv.className = 'version-display';
  versionDiv.textContent = (TEXT && TEXT.version) || (TEXT_CONFIG && TEXT_CONFIG.version) || '';
    document.body.appendChild(versionDiv);
  }

  setupDownloadButton();
  createVersionDisplay();
});