import { calculateNet } from './cal-gross-to-net.js';

document.addEventListener('DOMContentLoaded', () => {
  const calculateBtn = document.getElementById('calculate-btn');
  const salaryForm = document.getElementById('salary-form');
  const allowanceCheckbox = document.getElementById('allowance');
  const bonusCheckbox = document.getElementById('bonus-checkbox');

  const allowanceInputs = document.getElementById('allowance-inputs');
  const bonusInputWrapper = document.getElementById('bonus-input-wrapper');

  // Toggle visibility for allowance inputs
  allowanceCheckbox.addEventListener('change', () => {
    allowanceInputs.style.display = allowanceCheckbox.checked ? 'block' : 'none';
  });

  // Toggle visibility for bonus input
  bonusCheckbox.addEventListener('change', () => {
    bonusInputWrapper.style.display = bonusCheckbox.checked ? 'block' : 'none';
  });

  // Handle calculation trigger
  calculateBtn.addEventListener('click', calculateNet);
  salaryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateNet();
  });

  // Format number input fields
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

  // Auto-format relevant inputs
  document.addEventListener('input', (e) => {
    const target = e.target;
    const idsToFormat = ['base-salary', 'lunch', 'phone', 'other-allowance', 'bonus'];
    if (target.tagName === 'INPUT' && idsToFormat.includes(target.id)) {
      formatNumberInput(target);
    }
  });
});