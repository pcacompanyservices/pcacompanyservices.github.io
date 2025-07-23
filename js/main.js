import {
  insuranceRate,
  taxRate,
  unionFee,
  personalDeduction,
  baseWage
} from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('calculate-btn').addEventListener('click', calculateNet);
  document.getElementById('salary-form').addEventListener('submit', (e) => {
    e.preventDefault();
    calculateNet();
  });
});

function calculateNet() {
  const gross = parseFloat(document.getElementById('gross').value);
  const resultDiv = document.getElementById('result');

  if (isNaN(gross) || gross < 5000000) {
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
  <b>Gross Salary: ${gross.toLocaleString('us-US')} VND</b><br>
  <hr>
  Employee Insurance: ${totalInsuranceEmp.toLocaleString('us-US')} VND<br>
  Employee Personal Income Tax: ${incomeTax.toLocaleString('us-US')} VND<br>
  <hr>
  <b>Net Salary: ${net.toLocaleString('us-US')} VND</b><br>
  <hr>
  Employer Insurance: ${totalInsuranceEmplyr.toLocaleString('us-US')}VND<br>
  Employer Union Fee: ${employerUnion.toLocaleString('us-US')} VND<br>
  <hr>
  <b>Employer Cost: ${employerCost.toLocaleString('us-US')} VND</b><br>
  `;
}