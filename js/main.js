import { calculateNet } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  // Form elements
  const calculateBtn = document.getElementById('calculate-btn');
  const salaryForm = document.getElementById('salary-form');
  const baseSalaryInput = document.getElementById('base-salary');

  const allowanceCheckbox = document.getElementById('allowance');
  const bonusCheckbox = document.getElementById('bonus-checkbox');
  const allowanceContainer = document.getElementById('allowance-container');
  const bonusContainer = document.getElementById('bonus-container');

  const allowanceInputs = document.createElement('div');
  allowanceInputs.id = 'allowance-inputs';

  const bonusInputWrapper = document.createElement('div');
  bonusInputWrapper.id = 'bonus-input-wrapper';

  // Event handlers
  calculateBtn.addEventListener('click', calculateNet);
  salaryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateNet();
  });

  allowanceCheckbox.addEventListener('change', () => {
    if (allowanceCheckbox.checked) {
      allowanceInputs.innerHTML = `
        <label for="lunch">Allowance for Lunch:</label>
        <input type="text" id="lunch" placeholder="Please enter your lunch allowance" min="0" />
        <label for="phone">Allowance for Phone:</label>
        <input type="text" id="phone" placeholder="Please enter your phone allowance" min="0" />
        <label for="other">Other Allowances:</label>
        <input type="text" id="other-allowance" placeholder="Please enter other allowances in total (not listed above)" min="0" />
      `;
      allowanceContainer.insertAdjacentElement('afterend', allowanceInputs);
    } else {
      allowanceInputs.innerHTML = '';
    }
  });

  bonusCheckbox.addEventListener('change', () => {
    if (bonusCheckbox.checked) {
      bonusInputWrapper.innerHTML = `
        <input type="text" id="bonus" placeholder="Please enter your total bonus" min="0" />
      `;
      bonusContainer.insertAdjacentElement('afterend', bonusInputWrapper);
    } else {
      bonusInputWrapper.innerHTML = '';
    }
  });

  // Helper to format number input
  function formatNumberInput(input) {
    const raw = input.value.replace(/[^\d]/g, '');
    if (!raw) {
      input.value = '';
      return;
    }
    const numericValue = parseFloat(raw);
    if (!isNaN(numericValue)) {
      input.value = numericValue.toLocaleString('en-US');
    }
  }

  // Apply formatting to designated input fields
  document.addEventListener('input', (e) => {
    const target = e.target;
    const idsToFormat = ['base-salary', 'lunch', 'phone', 'other', 'bonus'];
    if (target.tagName === 'INPUT' && idsToFormat.includes(target.id)) {
      formatNumberInput(target);
    }
  });
});