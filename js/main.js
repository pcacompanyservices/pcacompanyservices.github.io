import {
  insuranceRate,
  taxRate,
  unionFee,
  personalDeduction,
  baseWage
} from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('calculate-btn').addEventListener('click', calculateNet);
});

function calculateNet() {
  const gross = parseFloat(document.getElementById('gross').value);
  const resultDiv = document.getElementById('result');

  if (isNaN(gross) || gross <= 0) {
    resultDiv.innerText = 'Please enter a valid gross salary.';
    return;
  }

  // === Cap insurance salary base
  const insuranceCap = 20 * baseWage;
  const insuranceBaseSalary = Math.min(gross, insuranceCap);

  // === Insurance deduction (employee side)
  const totalInsuranceEmp =
    insuranceBaseSalary *
    (insuranceRate.employee.social +
      insuranceRate.employee.health +
      insuranceRate.employee.unemployment);

  // === Taxable income
  const taxableIncome = gross - totalInsuranceEmp - personalDeduction;
  let incomeTax = 0;

  if (taxableIncome > 0) {
    for (const bracket of taxRate) {
      if (taxableIncome <= bracket.max) {
        incomeTax = taxableIncome * bracket.rate - bracket.reduce;
        break;
      }
    }
  }

  const net = gross - totalInsuranceEmp - incomeTax;

  // === Employer total cost
  const totalInsuranceEmplyr =
    insuranceBaseSalary *
    (insuranceRate.employer.social +
      insuranceRate.employer.health +
      insuranceRate.employer.unemployment);

  const employerUnion = insuranceBaseSalary * unionFee;
  const employerCost = gross + totalInsuranceEmplyr + employerUnion;

  resultDiv.innerHTML = `
  Employee Insurance: ${totalInsuranceEmp.toLocaleString('vi-VN')} VND<br>
  Employee Income Tax: ${incomeTax.toLocaleString('vi-VN')} VND<br>
  <hr>
  <b>Net Salary: ${net.toLocaleString('vi-VN')} VND</b><br>
  <hr>
  Employer Insurance: ${totalInsuranceEmplyr.toLocaleString('vi-VN')}VND<br>
  Employer Union Fee: ${employerUnion.toLocaleString('vi-VN')} VND<br>
  <hr>
  <b>Employer Cost: ${employerCost.toLocaleString('vi-VN')} VND</b><br>
  `;
}