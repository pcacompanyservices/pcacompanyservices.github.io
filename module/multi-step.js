// Generic multi-step form/navigation controller shared by all scenarios.
// Handles: step activation, progress bar state, validation for resident status & salary min, navigation buttons enable/disable.
// Usage:
// import { initMultiStepNavigation } from '../module/multi-step.js';
// const nav = initMultiStepNavigation({
//   steps, minSalary, salaryInputId, taxSelectId: 'tax-resident-status',
//   continueBtn, returnBtn, calculateBtn, progressBarSelector: '#progress-bar',
//   focusSalaryStepIndex: 1
// });
// nav.goTo(0);

export function initMultiStepNavigation({
  steps = [],
  minSalary = 0,
  salaryInputId,
  taxSelectId = 'tax-resident-status',
  continueBtn,
  returnBtn,
  calculateBtn,
  progressBarSelector = '#progress-bar',
  focusSalaryStepIndex = 1
}) {
  let currentStep = 0;

  function getEl(id) { return document.getElementById(id); }

  function updateProgressBar(idx) {
    const bar = document.querySelector(progressBarSelector);
    if (!bar) return;
    const stepEls = bar.querySelectorAll('.progress-step');
    stepEls.forEach((el, i) => {
      if (i < idx) { el.classList.add('completed'); el.classList.remove('active'); }
      else if (i === idx) { el.classList.add('active'); el.classList.remove('completed'); }
      else { el.classList.remove('active', 'completed'); }
    });
    const lines = bar.querySelectorAll('.progress-bar-line');
    lines.forEach((line, i) => {
      if (i < idx) line.classList.add('completed'); else line.classList.remove('completed');
    });
  }

  function parseSalary(val) {
    if (!val) return 0;
    return parseInt(String(val).replace(/[^\d]/g, ''), 10) || 0;
  }

  function isStepValid(idx) {
    if (idx === 0) {
      const sel = getEl(taxSelectId);
      return !!(sel && sel.value);
    }
    if (idx === 1) {
      const salaryInput = getEl(salaryInputId);
      if (!salaryInput) return false;
      return parseSalary(salaryInput.value) >= minSalary;
    }
    // Steps 2,3,4 always valid (allowance, bonus, benefit optional)
    return true;
  }

  function updateContinueButtonState(idx) {
    if (!continueBtn) return;
    const valid = isStepValid(idx);
    continueBtn.classList.toggle('unavailable', !valid);
    continueBtn.disabled = !valid;
  }

  function showStep(idx) {
    steps.forEach((step, i) => {
      if (!step) return;
      if (i === idx) step.classList.add('active'); else step.classList.remove('active');
    });

    if (returnBtn) {
      returnBtn.classList.add('show');
      if (idx === 0) { returnBtn.disabled = true; returnBtn.classList.add('disabled'); }
      else { returnBtn.disabled = false; returnBtn.classList.remove('disabled'); }
    }

    if (continueBtn) {
      if (idx < steps.length - 1) continueBtn.classList.add('show'); else continueBtn.classList.remove('show');
    }
    if (calculateBtn) {
      if (idx === steps.length - 1) calculateBtn.classList.add('show'); else calculateBtn.classList.remove('show');
    }

    if (idx === focusSalaryStepIndex) {
      const salaryInput = getEl(salaryInputId);
      if (salaryInput) { salaryInput.focus(); salaryInput.select && salaryInput.select(); }
    }

    updateContinueButtonState(idx);
    updateProgressBar(idx);
  }

  function goTo(idx) {
    if (idx < 0 || idx >= steps.length) return;
    currentStep = idx;
    showStep(currentStep);
  }

  function next() {
    if (currentStep < steps.length - 1 && isStepValid(currentStep)) {
      goTo(currentStep + 1);
    }
  }

  function prev() {
    if (currentStep > 0) {
      goTo(currentStep - 1);
    }
  }

  // Wire navigation buttons
  continueBtn && continueBtn.addEventListener('click', (e) => {
    e.preventDefault();
    next();
  });
  returnBtn && returnBtn.addEventListener('click', (e) => {
    e.preventDefault();
    prev();
  });

  // Validation input listeners
  const taxSel = getEl(taxSelectId);
  taxSel && taxSel.addEventListener('change', () => updateContinueButtonState(currentStep));
  const salaryInput = getEl(salaryInputId);
  salaryInput && salaryInput.addEventListener('input', () => updateContinueButtonState(currentStep));

  // Initial render
  showStep(currentStep);

  return {
    getCurrentStep: () => currentStep,
    goTo,
    next,
    prev,
    refresh: () => showStep(currentStep),
    validate: () => updateContinueButtonState(currentStep)
  };
}
