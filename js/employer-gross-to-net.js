

import { simulateSalary } from '../be/cal.js';

// ============================================================================
// TEXT CONFIGURATION - Centralized static text management
// ============================================================================

const TEXT_CONFIG = {
  // Page title and main headers
  pageTitle: "Calculate from Employee's Gross Salary",
  payslipTitle: "PAYSLIP",
  
  // Progress bar steps
  progressSteps: {
    citizenship: "Citizenship",
    grossSalary: "Gross Salary", 
    allowances: "Allowances",
    bonuses: "Bonuses"
  },
  
  // Step titles and descriptions
  steps: {
    citizenship: {
      title: "Citizenship",
      selectPlaceholder: "Select your citizenship",
      options: {
        local: "Local",
        expat: "Expat"
      }
    },
    grossSalary: {
      title: "Gross Salary",
      placeholder: "Min 5,000,000 VND"
    },
    allowances: {
      title: "Allowances",
      types: {
        lunch: "Lunch",
        fuel: "Fuel", 
        phone: "Phone",
        travel: "Traveling",
        uniform: "Uniform",
        other: "Other Allowances"
      },
      placeholders: {
        lunch: "Lunch allowance (VND)",
        fuel: "Fuel allowance (VND)",
        phone: "Phone allowance (VND)",
        travel: "Travel allowance (VND)",
        uniform: "Uniform allowance (VND)",
        other: "Other allowances (VND)"
      }
    },
    bonuses: {
      title: "Bonuses",
      placeholder: "Total bonuses (VND)"
    }
  },
  
  // Buttons
  buttons: {
    continue: "Continue",
    calculate: "Calculate",
    return: "Return",
    reset: "Reset",
    modify: "Modify Information",
    downloadPdf: "Download PDF"
  },
  
  // Warnings and messages
  warnings: {
    maxDigits: "Maximum 9 digits allowed.",
    noAllowancesOrBonuses: "(There are no Allowances or Bonuses in the Contract)"
  },
  
  // Result labels
  results: {
    employeeTypes: {
      local: "Local Employee",
      expat: "Expat Employee",
      default: "Employee"
    },
    sections: {
      grossSalary: "Gross Salary",
      adjustedGrossSalary: "Adjusted Gross Salary",
      allowances: "Allowances",
      bonuses: "Bonuses",
      employerCost: "Employer Cost",
      employeeTakeHome: "Employee Take-home"
    },
    costBreakdown: {
      socialInsurance: "Social Insurance",
      unionFee: "Union Fee",
      personalIncomeTax: "Personal Income Tax",
      netSalary: "Employee Take-home (Net) Salary",
      employerInsurance: "Employer Insurance",
      employerUnionFee: "Employer Union Fee",
      employeeInsurance: "Employee Insurance"
    }
  },
  
  // Info tooltips (placeholder text)
  infoTooltips: {
    citizenship: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vitae.",
    grossSalary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vitae.",
    allowances: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vitae.",
    bonuses: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vitae.",
    lunch: "Specify your monthly allowance for lunch in the contract.",
    fuel: "Specify your monthly allowance for fuel in the contract.",
    phone: "Specify your monthly allowance for phone in the contract.",
    travel: "Specify your monthly allowance for traveling in the contract.",
    uniform: "Specify your monthly allowance for uniform in the contract.",
    otherAllowance: "Enter any other allowances in the contract that are not listed above.",
    productivity: "Specify your monthly bonus for productivity in the contract.",
    incentive: "Specify your monthly bonus for incentive in the contract.",
    kpi: "Specify your monthly bonus for KPI in the contract.",
    otherBonus: "Enter any other bonuses in the contract that are not listed above."
  },

  // Footer content
  footer: {
    importantNoteTitle: "IMPORTANT NOTE",
    importantNoteText: "This simulation assumes a standard labor contract with a duration exceeding three months, for a resident in Viet Nam, applied in Region I (Zone I). It does not account for any registered dependent deductions. For further information, please contact us.",
    contactLinkText: "contact us",
    contactUrl: "https://pca-cs.com/",
    disclaimerTitle: "DISCLAIMER",
    disclaimerText: "The information provided in this simulation is for general informational purposes only. It does not constitute legal advice, nor does it create a service provider or client relationship. While we make every effort to ensure the accuracy, no warranty is given, whether express or implied, to its correctness or completeness. We accept NO RESPONSIBILITY for any errors or omissions. We are NOT LIABLE for any loss or damage, including but not limited to loss of business or profits, arising from the use of this simulation or reliance on its contents, whether in contract, tort, or otherwise."
  }
};

// ============================================================================
// UTILITY FUNCTIONS (formerly from util/ directory)
// ============================================================================

/**
 * Get an element by its ID
 * @param {string} id - The element ID
 * @returns {HTMLElement|null} The element or null if not found
 */
function getElement(id) {
  return document.getElementById(id);
}

/**
 * Create an element and append it to parent with optional properties and innerHTML
 * @param {HTMLElement} parent - Parent element to append to
 * @param {string} tag - HTML tag name
 * @param {Object} props - Properties to assign to the element
 * @param {string} innerHTML - Inner HTML content
 * @returns {HTMLElement} The created element
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
 * @param {Array<string>} strings - Template literal string parts
 * @param {...any} values - Template literal values
 * @returns {string} Concatenated HTML string
 */
const html = (strings, ...values) =>
  strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');

/**
 * Export the result container to PDF
 * @param {Object} options - Export options
 * @param {HTMLElement} options.exportContainer - Container to export
 * @param {string} options.filename - PDF filename
 * @param {Function} options.onStart - Callback before export starts
 * @param {Function} options.onComplete - Callback after export completes
 */
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

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const MIN_SALARY = 5000000;
const MAX_DIGITS = 9;

// ============================================================================
// UI CREATION FUNCTIONS
// ============================================================================
function createProgressBar(root) {
  const progressBar = createAndAppend(root, 'div', { id: 'progress-bar' });
  progressBar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin:18px 0;width:100%;max-width:480px;margin-left:auto;margin-right:auto;user-select:none;';
  progressBar.innerHTML = html`
    <div class="progress-step" data-step="0">${TEXT_CONFIG.progressSteps.citizenship}</div>
    <div class="progress-bar-line"></div>
    <div class="progress-step" data-step="1">${TEXT_CONFIG.progressSteps.grossSalary}</div>
    <div class="progress-bar-line"></div>
    <div class="progress-step" data-step="2">${TEXT_CONFIG.progressSteps.allowances}</div>
    <div class="progress-bar-line"></div>
    <div class="progress-step" data-step="3">${TEXT_CONFIG.progressSteps.bonuses}</div>
  `;
  return progressBar;
}

function createTitleBlock(root) {
  const h1 = createAndAppend(root, 'h1');
  h1.textContent = TEXT_CONFIG.pageTitle;
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
      <h2>${TEXT_CONFIG.steps.citizenship.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT_CONFIG.infoTooltips.citizenship}</span>
      </span>
    </div>
    <select id="citizenship">
      <option value="" disabled selected>${TEXT_CONFIG.steps.citizenship.selectPlaceholder}</option>
      <option value="local">${TEXT_CONFIG.steps.citizenship.options.local}</option>
      <option value="expat">${TEXT_CONFIG.steps.citizenship.options.expat}</option>
    </select>
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
      <h2>${TEXT_CONFIG.steps.grossSalary.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT_CONFIG.infoTooltips.grossSalary}</span>
      </span>
    </div>
    <input type="text" class="number-input" id="gross-salary" placeholder="${TEXT_CONFIG.steps.grossSalary.placeholder}" />
    <div id="gross-salary-warning" class="input-warning" style="display:none;">${TEXT_CONFIG.warnings.maxDigits}</div>
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
      <h2>${TEXT_CONFIG.steps.allowances.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT_CONFIG.infoTooltips.allowances}</span>
      </span>
    </div>
    <div id="allowance-container">
      <div id="allowance-inputs">
        <div id="allowance-warning" class="input-warning" style="display:none;">${TEXT_CONFIG.warnings.maxDigits}</div>
        
        <label class="input-label">${TEXT_CONFIG.steps.allowances.types.lunch}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT_CONFIG.infoTooltips.lunch}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="allowance-lunch" placeholder="${TEXT_CONFIG.steps.allowances.placeholders.lunch}" min="0" />
        
        <label class="input-label">${TEXT_CONFIG.steps.allowances.types.fuel}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT_CONFIG.infoTooltips.fuel}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="allowance-fuel" placeholder="${TEXT_CONFIG.steps.allowances.placeholders.fuel}" min="0" />
        
        <label class="input-label">${TEXT_CONFIG.steps.allowances.types.phone}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT_CONFIG.infoTooltips.phone}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="allowance-phone" placeholder="${TEXT_CONFIG.steps.allowances.placeholders.phone}" min="0" />
        
        <label class="input-label">${TEXT_CONFIG.steps.allowances.types.travel}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT_CONFIG.infoTooltips.travel}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="allowance-travel" placeholder="${TEXT_CONFIG.steps.allowances.placeholders.travel}" min="0" />
        
        <label class="input-label">${TEXT_CONFIG.steps.allowances.types.uniform}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT_CONFIG.infoTooltips.uniform}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="allowance-uniform" placeholder="${TEXT_CONFIG.steps.allowances.placeholders.uniform}" min="0" />
        
        <label class="input-label">${TEXT_CONFIG.steps.allowances.types.other}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${TEXT_CONFIG.infoTooltips.otherAllowance}</span>
          </span>
        </label>
        <input type="text" class="number-input" id="allowance-other" placeholder="${TEXT_CONFIG.steps.allowances.placeholders.other}" min="0" />
      </div>
    </div>
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
      <h2>${TEXT_CONFIG.steps.bonuses.title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${TEXT_CONFIG.infoTooltips.bonuses}</span>
      </span>
    </div>
    <input type="text" class="number-input" id="total-bonus" placeholder="${TEXT_CONFIG.steps.bonuses.placeholder}" />
    <div id="bonus-warning" class="input-warning" style="display:none;">${TEXT_CONFIG.warnings.maxDigits}</div>
  `;
  return step4;
}

function createNavButtons() {
  const navDiv = document.createElement('div');
  navDiv.className = 'form-navigation';
  navDiv.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin: 1.5rem auto;
    max-width: 55rem;
    width: 100%;
    flex-wrap: wrap;
  `;
  navDiv.innerHTML = html`
    <button type="button" id="return-btn" class="simulation-button return-button" style="display:none;flex:1;min-width:12rem;max-width:16rem;margin:0;">${TEXT_CONFIG.buttons.return}</button>
    <button type="button" id="continue-btn" class="simulation-button" style="display:none;flex:1;min-width:12rem;max-width:16rem;margin:0;">${TEXT_CONFIG.buttons.continue}</button>
    <button type="submit" id="calculate-btn" class="simulation-button" style="display:none;flex:1;min-width:12rem;max-width:16rem;margin:0;">${TEXT_CONFIG.buttons.calculate}</button>
  `;
  return navDiv;
}

function createResultSection(root) {
  const resultDiv = createAndAppend(root, 'div', { className: 'result', id: 'result', 'aria-live': 'polite' });
  return { resultDiv };
}

function createResultButtonsContainer(root) {
  const buttonContainer = createAndAppend(root, 'div', {
    className: 'result-buttons-container',
    id: 'result-buttons-container',
    style: 'display:none;'
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
    <span class="footer-title">${TEXT_CONFIG.footer.importantNoteTitle}</span>
    <div class="footer-text">${TEXT_CONFIG.footer.importantNoteText} <a href="${TEXT_CONFIG.footer.contactUrl}" target="_blank">${TEXT_CONFIG.footer.contactLinkText}</a>.</div>
    <span class="footer-title">${TEXT_CONFIG.footer.disclaimerTitle}</span>
    <div class="footer-text">${TEXT_CONFIG.footer.disclaimerText}</div>
  `;
  return footer;
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
  const { resultDiv } = createResultSection(root);
  const { buttonContainer, downloadBtn, resetBtn, hardResetBtn } = createResultButtonsContainer(root);

  // Create footer
  createFooter(root);

  // ============================================================================
  // FORM NAVIGATION
  // ============================================================================
  const steps = [step1, step2, step3, step4];
  const returnBtn = getElement('return-btn');
  const continueBtn = getElement('continue-btn');
  const calculateBtn = getElement('calculate-btn');
  let currentStep = 0;

  function showStep(idx) {
    steps.forEach((step, i) => {
      if (step) step.style.display = i === idx ? '' : 'none';
    });
    
    // Show/hide navigation buttons based on current step
    // Always show return button, but disable it on first step
    returnBtn.style.display = '';
    if (idx === 0) {
      returnBtn.disabled = true;
      returnBtn.classList.add('disabled');
    } else {
      returnBtn.disabled = false;
      returnBtn.classList.remove('disabled');
    }
    
    continueBtn.style.display = idx < steps.length - 1 ? '' : 'none';
    calculateBtn.style.display = idx === steps.length - 1 ? '' : 'none';
    
    // Update continue button state based on step validation
    updateContinueButtonState(idx);
    
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

  function updateContinueButtonState(idx) {
    if (!continueBtn) return;
    
    let isValid = false;
    
    switch (idx) {
      case 0: // Citizenship step
        isValid = citizenshipSelect.value;
        break;
      case 1: // Gross salary step
        const numericValue = parseInt(grossSalaryInput.value.replace(/\D/g, '')) || 0;
        isValid = numericValue >= MIN_SALARY;
        break;
      case 2: // Allowances step (always valid, can skip)
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

  // Step 1: Citizenship Selection
  const citizenshipSelect = getElement('citizenship');
  citizenshipSelect.addEventListener('change', () => updateContinueButtonState(currentStep));

  // Step 2: Gross Salary Input
  const grossSalaryInput = getElement('gross-salary');
  grossSalaryInput.addEventListener('input', () => updateContinueButtonState(currentStep));

  // Continue button handler
  continueBtn.addEventListener('click', () => {
    if (currentStep < steps.length - 1 && !continueBtn.disabled) {
      currentStep++;
      showStep(currentStep);
    }
  });

  // Return button handler
  returnBtn?.addEventListener('click', () => {
    if (currentStep > 0 && !returnBtn.disabled) {
      currentStep--;
      showStep(currentStep);
    }
  });

  // Initialize first step
  showStep(currentStep);

  // ============================================================================
  // DOM REFERENCES
  // ============================================================================
  const DOM = {
    salaryForm,
    calculateBtn,
    downloadPdfBtn: downloadBtn,
    buttonContainer,
    resultDiv,
    allowanceInputs: getElement('allowance-inputs')
  };

  // ============================================================================
  // DYNAMIC FIELD MANAGEMENT
  // ============================================================================

  // No dynamic field management needed - all allowance inputs are always visible
  // and bonus is now a single input field

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
      // Simplified allowance handling - no checkboxes needed
      isAllowanceEnabled: true, // Always true since we show all fields
      lunchAllowance: parseNumber(getVal('allowance-lunch')),
      lunchEnabled: parseNumber(getVal('allowance-lunch')) > 0,
      fuelAllowance: parseNumber(getVal('allowance-fuel')),
      fuelEnabled: parseNumber(getVal('allowance-fuel')) > 0,
      phoneAllowance: parseNumber(getVal('allowance-phone')),
      phoneEnabled: parseNumber(getVal('allowance-phone')) > 0,
      travelAllowance: parseNumber(getVal('allowance-travel')),
      travelEnabled: parseNumber(getVal('allowance-travel')) > 0,
      uniformAllowance: parseNumber(getVal('allowance-uniform')),
      uniformEnabled: parseNumber(getVal('allowance-uniform')) > 0,
      otherAllowance: parseNumber(getVal('allowance-other')),
      otherAllowanceEnabled: parseNumber(getVal('allowance-other')) > 0,
      // Simplified bonus handling - single input
      isBonusEnabled: parseNumber(getVal('total-bonus')) > 0,
      totalBonus: parseNumber(getVal('total-bonus')),
      citizenship: getVal('citizenship'),
    };

    // Simulate salary calculation
    const data = simulateSalary(params);

    // Handle calculation errors
    if (data && data.error) {
      DOM.resultDiv.innerHTML = `<span style="color:red">${data.error}</span>`;
      DOM.downloadPdfBtn.style.display = 'none';
      return;
    }

    // Clean up form UI after successful calculation
    cleanupFormAfterCalculation();
    
    // Render results
    renderResults(data);
    
    // Show action buttons container
    DOM.buttonContainer.style.display = 'flex';
    
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
      { label: TEXT_CONFIG.steps.allowances.types.lunch, value: data.lunchAllowance },
      { label: TEXT_CONFIG.steps.allowances.types.fuel, value: data.fuelAllowance },
      { label: TEXT_CONFIG.steps.allowances.types.phone, value: data.phoneAllowance },
      { label: TEXT_CONFIG.steps.allowances.types.travel, value: data.travelAllowance },
      { label: TEXT_CONFIG.steps.allowances.types.uniform, value: data.uniformAllowance },
      { label: TEXT_CONFIG.steps.allowances.types.other, value: data.otherAllowance }
    ].filter(item => item.value && item.value > 0);
    
    // Simplified bonus handling - just check if totalBonus exists
    const hasBonuses = data.totalBonus && data.totalBonus > 0;

    // Generate table rows
    const allowanceRow = generateAllowanceRow(allowanceItems, data.totalAllowance);
    const bonusRow = generateBonusRow(hasBonuses, data.totalBonus);
    const noAllowanceBonusRow = (allowanceItems.length === 0 && !hasBonuses) 
      ? `<tr><td colspan="2"><div class="result-center-value" style="font-size:1em; color:#888;">${TEXT_CONFIG.warnings.noAllowancesOrBonuses}</div></td></tr>`
      : '';

    // Generate content sections
    const employeeTypeLabel = getEmployeeTypeLabel(data.citizenship);
    const employeeTypeCell = `<div class="result-title"><u>${employeeTypeLabel}</u></div>`;
    const grossSalaryCell = `<div class="result-title">${TEXT_CONFIG.results.sections.grossSalary}</div><div class="result-center-value">${data.grossSalary ? data.grossSalary.toLocaleString('en-US') + ' VND' : '-'}</div>`;
    const adjustedGrossSalaryCell = `<div class="result-title">${TEXT_CONFIG.results.sections.adjustedGrossSalary}</div><div class="result-center-value">${data.adjustedGrossSalary ? data.adjustedGrossSalary.toLocaleString('en-US') + ' VND' : '-'}</div>`;

    const employerDetailsCell = generateEmployerDetailsCell(data);
    const employeeDetailsCell = generateEmployeeDetailsCell(data);
    const employerTotalCell = `<div class="result-total"><span class="employer-total-value">${data.totalEmployerCost.toLocaleString('en-US')} VND</span></div>`;
    const employeeTotalCell = `<div class="result-total"><span class="employee-total-value">${data.netSalary.toLocaleString('en-US')} VND</span></div>`;

    // Render final result table
    DOM.resultDiv.innerHTML = html`
      <h1 style="text-align:center;margin-bottom:16px;font-size:30px">${TEXT_CONFIG.payslipTitle}</h1>
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
    `;
  }

  function generateAllowanceRow(allowanceItems, totalAllowance) {
    if (allowanceItems.length === 0) return '';
    
    return `
      <tr>
        <td colspan="2">
          <div class="result-title">${TEXT_CONFIG.results.sections.allowances}</div>
          <div class="result-list">
            ${allowanceItems.map(item => `<div class="result-item">${item.label}: <span>${item.value.toLocaleString('en-US')} VND</span></div>`).join('')}
          </div>
          <hr class="result-divider" />
          <div class="result-total"><span>${totalAllowance.toLocaleString('en-US')} VND</span></div>
        </td>
      </tr>
    `;
  }

  function generateBonusRow(hasBonuses, totalBonus) {
    if (!hasBonuses) return '';
    
    return `
      <tr>
        <td colspan="2">
          <div class="result-title">${TEXT_CONFIG.results.sections.bonuses}</div>
          <div class="result-center-value">${totalBonus.toLocaleString('en-US')} VND</div>
        </td>
      </tr>
    `;
  }

  function getEmployeeTypeLabel(citizenship) {
    return TEXT_CONFIG.results.employeeTypes[citizenship] || TEXT_CONFIG.results.employeeTypes.default;
  }

  function generateEmployerDetailsCell(data) {
    return html`
      <div class="result-title">${TEXT_CONFIG.results.sections.employerCost}</div>
      <div class="result-list">
        <div class="result-item">${TEXT_CONFIG.results.costBreakdown.socialInsurance}: <span>+${data.employerInsurance.toLocaleString('en-US')} VND</span></div>
        <div class="result-item">${TEXT_CONFIG.results.costBreakdown.unionFee}: <span>+${data.employerUnionFee.toLocaleString('en-US')} VND</span></div>
      </div>
    `;
  }

  function generateEmployeeDetailsCell(data) {
    return html`
      <div class="result-title">${TEXT_CONFIG.results.sections.employeeTakeHome}</div>
      <div class="result-list">
        <div class="result-item">${TEXT_CONFIG.results.costBreakdown.socialInsurance}: <span>-${data.employeeInsurance.toLocaleString('en-US')} VND</span></div>
        <div class="result-item">${TEXT_CONFIG.results.costBreakdown.personalIncomeTax}: <span>-${data.incomeTax.toLocaleString('en-US')} VND</span></div>
      </div>
    `;
  }

  function setupResetHandlers() {
    resetBtn.onclick = () => {
      // Hide results and button container
      DOM.resultDiv.innerHTML = '';
      DOM.buttonContainer.style.display = 'none';
      
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
        } else if (continueBtn && !continueBtn.disabled) {
          continueBtn.click();
        }
      }
    });
  });

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
        payslipTitle.textContent = TEXT_CONFIG.payslipTitle;
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