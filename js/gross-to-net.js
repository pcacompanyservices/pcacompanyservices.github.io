import { calculateNet } from './cal-gross-to-net.js';

document.addEventListener('DOMContentLoaded', () => {
  const calculateBtn = document.getElementById('calculate-btn');

  const salaryForm = document.getElementById('salary-form');

  const allowanceCheckbox = document.getElementById('allowance');
  const lunchCheckbox = document.getElementById('lunch-checkbox');
  const fuelCheckbox = document.getElementById('fuel-checkbox');
  const phoneCheckbox = document.getElementById('phone-checkbox');
  const travelCheckbox = document.getElementById('travel-checkbox');
  const uniformCheckbox = document.getElementById('uniform-checkbox');
  
  const allowanceInputs = document.getElementById('allowance-inputs');
  const lunchInput = document.getElementById('lunch-input');
  const fuelInput = document.getElementById('fuel-input');
  const phoneInput = document.getElementById('phone-input');
  const travelInput = document.getElementById('travel-input');
  const uniformInput = document.getElementById('uniform-input');
  
  const bonusCheckbox = document.getElementById('bonus-checkbox');
  const bonusInputWrapper = document.getElementById('bonus-input');

  // Toggle visibility for allowance inputs
  allowanceCheckbox.addEventListener('change', () => {
    allowanceInputs.style.display = allowanceCheckbox.checked ? 'block' : 'none';
  });

  lunchCheckbox.addEventListener('change', () => {
    lunchInput.style.display = lunchCheckbox.checked ? 'block' : 'none';
  });

  fuelCheckbox.addEventListener('change', () => {
    fuelInput.style.display = fuelCheckbox.checked ? 'block' : 'none';
  });

  phoneCheckbox.addEventListener('change', () => {
    phoneInput.style.display = phoneCheckbox.checked ? 'block' : 'none';
  });

  travelCheckbox.addEventListener('change', () => {
    travelInput.style.display = travelCheckbox.checked ? 'block' : 'none';
  });

  uniformCheckbox.addEventListener('change', () => {
    uniformInput.style.display = uniformCheckbox.checked ? 'block' : 'none';
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