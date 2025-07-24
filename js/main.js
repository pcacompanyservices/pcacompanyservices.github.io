import { calculateNet } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('calculate-btn').addEventListener('click', calculateNet);
  document.getElementById('salary-form').addEventListener('submit', (e) => {
    e.preventDefault();
    calculateNet();
  });
});

const grossInput = document.getElementById('gross');

grossInput.addEventListener('input', () => {
  const raw = grossInput.value.replace(/[^\d]/g, '');
  if (!raw) {
    grossInput.value = '';
    return;
  }

  const numericValue = parseFloat(raw);
  if (!isNaN(numericValue)) {
    grossInput.value = numericValue.toLocaleString('en-US');
  }
});