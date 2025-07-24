import { calculateNet } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  // Form elements
  const calculateBtn = document.getElementById('calculate-btn');
  const salaryForm = document.getElementById('salary-form');
  const grossInput = document.getElementById('gross');

  const contractSelect = document.getElementById('contract');
  const durationSelect = document.getElementById('duration');
  const grossLabel = document.querySelector("label[for='gross']");

  const allowanceCheckbox = document.getElementById('allowance');
  const bonusCheckbox = document.getElementById('bonus');
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

  contractSelect.addEventListener('change', () => {
    const isNo = contractSelect.value === 'no';
    durationSelect.disabled = isNo;
    allowanceCheckbox.disabled = isNo;
    bonusCheckbox.disabled = isNo;

    // Also disable allowance/bonus inputs if they exist
    allowanceInputs.querySelectorAll('input').forEach(input => input.disabled = isNo);
    bonusInputWrapper.querySelectorAll('input').forEach(input => input.disabled = isNo);

    grossLabel.textContent = isNo ? 'Gross Salary:' : 'Base Salary:';
  });

  allowanceCheckbox.addEventListener('change', () => {
    if (allowanceCheckbox.checked) {
      allowanceInputs.innerHTML = `
        <label for="lunch">Allowance for Lunch:</label>
        <input type="text" id="lunch" placeholder="Please enter your lunch allowance" min="0" />
        <label for="phone">Allowance for Phone:</label>
        <input type="text" id="phone" placeholder="Please enter your phone allowance" min="0" />
        <label for="other">Other Allowances:</label>
        <input type="text" id="other" placeholder="Please enter other allowances in total (not listed above)" min="0" />
      `;
      allowanceInputs.querySelectorAll('input').forEach(input => input.disabled = false);
      allowanceContainer.insertAdjacentElement('afterend', allowanceInputs);
    } else {
      allowanceInputs.querySelectorAll('input').forEach(input => input.disabled = true);
    }
  });

  bonusCheckbox.addEventListener('change', () => {
    if (bonusCheckbox.checked) {
      bonusInputWrapper.innerHTML = `
        <input type="text" id="bonus-input" placeholder="Please enter your total bonus" min="0" />
      `;
      bonusInputWrapper.querySelectorAll('input').forEach(input => input.disabled = false);
      bonusContainer.insertAdjacentElement('afterend', bonusInputWrapper);
    } else {
      bonusInputWrapper.querySelectorAll('input').forEach(input => input.disabled = true);
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
    const idsToFormat = ['gross', 'lunch', 'phone', 'other', 'bonus-input'];
    if (target.tagName === 'INPUT' && idsToFormat.includes(target.id)) {
      formatNumberInput(target);
    }
  });
});