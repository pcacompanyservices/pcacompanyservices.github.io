// Centralized input form & step builders for all salary simulation paths
// Provides reusable DOM creation for tax status, salary, allowance, bonus, benefit steps and navigation
// Each function returns a DOM element (not yet attached unless specified), allowing templates to compose.

export const html = (strings, ...values) => strings.reduce((acc, s, i) => acc + s + (values[i] ?? ''), '');

function createElement(tag, props = {}, innerHTML = '') {
  const el = document.createElement(tag);
  Object.assign(el, props);
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}

export function createSalaryForm(root) {
  const form = createElement('form', { id: 'salary-form' });
  root.appendChild(form);
  return form;
}

import { TEXT } from '../lang/eng.js';

export function createTaxResidentStep(textConfig) {
  const step = createElement('div', { className: 'form-step active', id: 'step-1' });
  const cfg = textConfig.steps.taxResidentStatus || {};
  const tooltip = (textConfig.infoTooltips && textConfig.infoTooltips.taxResidentStatus) || cfg.tooltip || '';
  step.innerHTML = html`<div class="step-title-row"><h2>${cfg.title || TEXT.defaults.statusTitle}</h2><span class="question-icon" tabindex="0"><img src="asset/question_icon.webp" alt="info" /><span class="info-box">${tooltip}</span></span></div><select id="tax-resident-status"><option value="" disabled selected>${cfg.selectPlaceholder || TEXT.defaults.selectPlaceholder}</option><option value="local">${(cfg.options && cfg.options.local) || TEXT.defaults.localOption}</option><option value="expat">${(cfg.options && cfg.options.expat) || TEXT.defaults.expatOption}</option></select>`;
  return step;
}

export function createSalaryStep(textConfig, salaryType) {
  const key = salaryType === 'gross' ? 'grossSalary' : 'netSalary';
  const inputId = salaryType === 'gross' ? 'gross-salary' : 'net-salary';
  const stepCfg = (textConfig.steps && textConfig.steps[key]) || {};
  const tooltip = (textConfig.infoTooltips && textConfig.infoTooltips[key]) || stepCfg.tooltip || '';
  const warning = (textConfig.warnings && textConfig.warnings.maxDigits) || stepCfg.warningMaxDigits || TEXT.defaults.maxDigitsWarning;
  const step = createElement('div', { className: 'form-step', id: 'step-2' });
  step.innerHTML = html`<div class="step-title-row"><h2>${stepCfg.title || TEXT.defaults.baseSalaryTitle}</h2><span class="question-icon" tabindex="0"><img src="asset/question_icon.webp" alt="info" /><span class="info-box">${tooltip}</span></span></div><input type="text" class="number-input" id="${inputId}" placeholder="${stepCfg.placeholder || ''}" /><div id="${inputId}-warning" class="input-warning hidden-initial">${warning}</div>`;
  return step;
}

export function createAllowanceStep(textConfig) {
  const step = createElement('div', { className: 'form-step', id: 'step-3' });
  const allowanceCfg = (textConfig.steps && textConfig.steps.allowance) || { types: {}, placeholders: {} };
  const tooltip = (textConfig.infoTooltips && textConfig.infoTooltips.allowance) || allowanceCfg.tooltip || '';
  const warning = (textConfig.warnings && textConfig.warnings.maxDigits) || allowanceCfg.warningMaxDigits || TEXT.defaults.maxDigitsWarning;
  const keys = ['lunch', 'fuel', 'phone', 'travel', 'uniform', 'other'];
  step.innerHTML = html`<div class="step-title-row"><h2>${allowanceCfg.title || TEXT.defaults.allowanceTitle}</h2><span class="question-icon" tabindex="0"><img src="asset/question_icon.webp" alt="info" /><span class="info-box">${tooltip}</span></span></div><div id="allowance-inputs"><div id="allowance-warning" class="input-warning hidden-initial">${warning}</div>${keys.map(k => {
  const labelText = (allowanceCfg.types && allowanceCfg.types[k]) || (TEXT.defaults.allowanceTypes && TEXT.defaults.allowanceTypes[k]) || (k === 'other' ? TEXT.defaults.allowanceTitle : k);
    const tip = (textConfig.infoTooltips && textConfig.infoTooltips[k]) || (allowanceCfg.tooltips && allowanceCfg.tooltips[k]) || '';
    return html`<label class="input-label">${labelText} <span class="question-icon" tabindex="0"><img src="asset/question_icon.webp" alt="info" /><span class="info-box">${tip}</span></span></label><input type="text" class="number-input" id="allowance-${k}" placeholder="${(allowanceCfg.placeholders && allowanceCfg.placeholders[k]) || ''}" min="0" />`;
  }).join('')}</div>`;
  return step;
}

export function createBonusStep(textConfig) {
  const step = createElement('div', { className: 'form-step', id: 'step-4' });
  const bonusCfg = (textConfig.steps && textConfig.steps.bonus) || {};
  const tooltip = (textConfig.infoTooltips && textConfig.infoTooltips.bonus) || bonusCfg.tooltip || '';
  const warning = (textConfig.warnings && textConfig.warnings.maxDigits) || bonusCfg.warningMaxDigits || TEXT.defaults.maxDigitsWarning;
  // Robust placeholder fallback: support legacy structure steps.bonus.placeholders.other
  const placeholder = bonusCfg.placeholder
    || (bonusCfg.placeholders && (bonusCfg.placeholders.other || bonusCfg.placeholders.total || bonusCfg.placeholders.totalBonus))
    || bonusCfg.totalBonusLabel
  || TEXT.defaults.totalBonusPlaceholder;
  step.innerHTML = html`<div class="step-title-row"><h2>${bonusCfg.title || TEXT.defaults.bonusTitle}</h2><span class="question-icon" tabindex="0"><img src="asset/question_icon.webp" alt="info" /><span class="info-box">${tooltip}</span></span></div><div id="bonus-inputs"><div id="bonus-warning" class="input-warning hidden-initial">${warning}</div><input type="text" class="number-input" id="total-bonus" placeholder="${placeholder}" /></div>`;
  return step;
}

export function createBenefitStep(textConfig) {
  const step = createElement('div', { className: 'form-step', id: 'step-5' });
  const benefitCfg = (textConfig.steps && textConfig.steps.benefit) || { types: {}, placeholders: {} };
  const tooltip = (textConfig.infoTooltips && textConfig.infoTooltips.benefit) || benefitCfg.tooltip || '';
  const warning = (textConfig.warnings && textConfig.warnings.maxDigits) || benefitCfg.warningMaxDigits || TEXT.defaults.maxDigitsWarning;
  const toolChild = (textConfig.infoTooltips && textConfig.infoTooltips.childTuition) || (benefitCfg.tooltips && benefitCfg.tooltips.childTuition) || '';
  const toolRental = (textConfig.infoTooltips && textConfig.infoTooltips.rental) || (benefitCfg.tooltips && benefitCfg.tooltips.rental) || '';
  const toolHealth = (textConfig.infoTooltips && textConfig.infoTooltips.healthInsurance) || (benefitCfg.tooltips && benefitCfg.tooltips.healthInsurance) || '';
  step.innerHTML = html`<div class="step-title-row"><h2>${benefitCfg.title || TEXT.defaults.benefitTitle}</h2><span class="question-icon" tabindex="0"><img src="asset/question_icon.webp" alt="info" /><span class="info-box">${tooltip}</span></span></div><div id="benefit-inputs"><div id="benefit-warning" class="input-warning hidden-initial">${warning}</div><label class="input-label">${(benefitCfg.types && benefitCfg.types.childTuition) || TEXT.defaults.childTuition} <span class="question-icon" tabindex="0"><img src="asset/question_icon.webp" alt="info" /><span class="info-box">${toolChild}</span></span></label><input type="text" class="number-input" id="benefit-child-tuition" placeholder="${(benefitCfg.placeholders && benefitCfg.placeholders.childTuition) || ''}" /><label class="input-label">${(benefitCfg.types && benefitCfg.types.rental) || TEXT.defaults.rental} <span class="question-icon" tabindex="0"><img src="asset/question_icon.webp" alt="info" /><span class="info-box">${toolRental}</span></span></label><input type="text" class="number-input" id="benefit-rental" placeholder="${(benefitCfg.placeholders && benefitCfg.placeholders.rental) || ''}" /><label class="input-label">${(benefitCfg.types && benefitCfg.types.healthInsurance) || TEXT.defaults.healthInsurance} <span class="question-icon" tabindex="0"><img src="asset/question_icon.webp" alt="info" /><span class="info-box">${toolHealth}</span></span></label><input type="text" class="number-input" id="benefit-health-insurance" placeholder="${(benefitCfg.placeholders && benefitCfg.placeholders.healthInsurance) || ''}" /></div>`;
  return step;
}

export function createNavigationButtons(textConfig) {
  const nav = createElement('div', { className: 'form-navigation' });
  nav.innerHTML = html`<button type="button" id="return-btn" class="simulation-button return-button">${textConfig.buttons.return}</button><button type="button" id="continue-btn" class="simulation-button">${textConfig.buttons.continue}</button><button type="button" id="calculate-btn" class="simulation-button">${textConfig.buttons.calculate}</button>`;
  return nav;
}

// Helper to build full standard sequence. Consumers still manage attachment order if needed.
export function buildStandardSteps(textConfig, salaryType = 'gross') {
  const tax = createTaxResidentStep(textConfig);
  const salary = createSalaryStep(textConfig, salaryType);
  const allowance = createAllowanceStep(textConfig);
  const bonus = createBonusStep(textConfig);
  const benefit = createBenefitStep(textConfig);
  return [tax, salary, allowance, bonus, benefit];
}

// ---------------------------------------------------------------------------
// Number input formatting & digit limit
// ---------------------------------------------------------------------------
function formatNumericInput(input, maxDigits) {
  let raw = input.value.replace(/[^\d]/g, '');
  const parent = input.closest('.form-step');
  let warningId = null;
  if (input.id === 'gross-salary') warningId = 'gross-salary-warning';
  else if (input.id === 'net-salary') warningId = 'net-salary-warning';
  else if (parent && parent.querySelector('#allowance-inputs')) warningId = 'allowance-warning';
  else if (parent && parent.querySelector('#bonus-inputs')) warningId = 'bonus-warning';
  else if (parent && parent.querySelector('#benefit-inputs')) warningId = 'benefit-warning';
  if (raw.length > maxDigits) raw = raw.slice(0, maxDigits);
  input.value = raw ? Number(raw).toLocaleString('vi-VN') : '';
  if (warningId) {
    const el = document.getElementById(warningId);
    if (el) {
      if (raw.length >= maxDigits) el.classList.add('show'); else el.classList.remove('show');
    }
  }
}

export function attachNumberFormatting({ root = document, maxDigits = 9 }) {
  function handler(e) {
    if (e.target && e.target.classList && e.target.classList.contains('number-input')) {
      formatNumericInput(e.target, maxDigits);
    }
  }
  root.addEventListener('input', handler);
  return () => root.removeEventListener('input', handler);
}

// ---------------------------------------------------------------------------
// High-level standard form initialization
// ---------------------------------------------------------------------------
import { buildProgressBar, setProgressBarActiveStep } from '../module/progress-bar.js';
import { initMultiStepNavigation } from '../module/multi-step.js';

export function initStandardForm({
  rootId = 'gross-to-net-root',
  textConfig,
  salaryType = 'gross',
  maxDigits = 9,
  minSalary = 0,
  focusSalaryStepIndex = 1,
  onCalculate
}) {
  const root = document.getElementById(rootId);
  if (!root) return null;
  // Preserve existing header (logo + title + hr) if already injected by createPageHeader.
  // Remove any previously rendered form/progress bar for rebuild scenarios.
  const existingForm = root.querySelector('#salary-form');
  if (existingForm) existingForm.remove();
  const existingProgress = root.querySelector('#progress-bar');
  if (existingProgress) existingProgress.remove();
  // If no title present (direct navigation), create minimal heading.
  if (!root.querySelector('h1')) {
    const h1 = document.createElement('h1');
    h1.textContent = textConfig.pageTitle;
    root.appendChild(h1);
    root.appendChild(document.createElement('hr'));
  }
  const progressSteps = [
    textConfig.progressSteps.taxResidentStatus,
    salaryType === 'gross' ? textConfig.progressSteps.grossSalary : textConfig.progressSteps.netSalary,
    textConfig.progressSteps.allowance,
    textConfig.progressSteps.bonus,
    textConfig.progressSteps.benefit
  ];
  buildProgressBar(root, progressSteps);
  const form = createSalaryForm(root);
  const steps = buildStandardSteps(textConfig, salaryType);
  steps.forEach(s => form.appendChild(s));
  form.appendChild(createNavigationButtons(textConfig));
  const salaryInputId = salaryType === 'gross' ? 'gross-salary' : 'net-salary';
  const nav = initMultiStepNavigation({
    steps,
    minSalary,
    salaryInputId,
    taxSelectId: 'tax-resident-status',
    continueBtn: document.getElementById('continue-btn'),
    returnBtn: document.getElementById('return-btn'),
    calculateBtn: document.getElementById('calculate-btn'),
    progressUpdater: (i) => setProgressBarActiveStep(i),
    focusSalaryStepIndex
  });
  // Attach calculate handler directly (nav object does not expose button)
  const calculateBtnEl = document.getElementById('calculate-btn');
  if(onCalculate && calculateBtnEl){
    calculateBtnEl.addEventListener('click', (e)=>{
      onCalculate(e, nav);
    });
  }
  const detachFormatting = attachNumberFormatting({ maxDigits });
  return { root, form, steps, nav, detachFormatting, calculateBtn: calculateBtnEl };
}
