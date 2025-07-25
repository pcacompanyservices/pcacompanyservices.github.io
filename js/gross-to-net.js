import { calculateFromGrossToNet } from './cal-gross-to-net.js';

document.addEventListener('DOMContentLoaded', () => {
  const salaryForm = document.getElementById('salary-form');
  const calculateBtn = document.getElementById('calculate-btn');

  // Allowance checkboxes and input containers
  const allowanceCheckbox = document.getElementById('allowance-checkbox');
  const allowanceInputs = document.getElementById('allowance-inputs');
  const allowanceMap = {
    'lunch-checkbox': 'lunch-input',
    'fuel-checkbox': 'fuel-input',
    'phone-checkbox': 'phone-input',
    'travel-checkbox': 'travel-input',
    'uniform-checkbox': 'uniform-input',
  };

  // Bonus checkboxes and input containers
  const bonusCheckbox = document.getElementById('bonus-checkbox');
  const bonusInputs = document.getElementById('bonus-inputs');
  const bonusMap = {
    'productivity-checkbox': 'productivity-input',
    'incentive-checkbox': 'incentive-input',
    'kpi-checkbox': 'kpi-input',
  };

  // Generic toggle visibility function
  function toggleVisibility(checkboxId, targetId) {
    const checkbox = document.getElementById(checkboxId);
    const target = document.getElementById(targetId);
    if (checkbox && target) {
      checkbox.addEventListener('change', () => {
        target.style.display = checkbox.checked ? 'block' : 'none';
      });
    }
  }

  // Apply toggle logic
  allowanceCheckbox.addEventListener('change', () => {
    allowanceInputs.style.display = allowanceCheckbox.checked ? 'block' : 'none';
  });
  Object.entries(allowanceMap).forEach(([cb, div]) => toggleVisibility(cb, div));

  bonusCheckbox.addEventListener('change', () => {
    bonusInputs.style.display = bonusCheckbox.checked ? 'block' : 'none';
  });
  Object.entries(bonusMap).forEach(([cb, div]) => toggleVisibility(cb, div));

  // Handle calculation
  calculateBtn.addEventListener('click', calculateFromGrossToNet);
  salaryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateFromGrossToNet();
  });

  // Format number input fields
  function formatNumberInput(input) {
    const raw = input.value.replace(/[^\d]/g, '');
    input.value = raw ? parseFloat(raw).toLocaleString('en-US') : '';
  }

  document.addEventListener('input', (e) => {
    const idsToFormat = [
      'base-salary',
      'allowance-lunch',
      'allowance-fuel',
      'allowance-phone',
      'allowance-travel',
      'allowance-uniform',
      'bonus-productivity',
      'bonus-incentive',
      'bonus-kpi'
    ];
    if (e.target.tagName === 'INPUT' && idsToFormat.includes(e.target.id)) {
      formatNumberInput(e.target);
    }
  });
});