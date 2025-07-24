export const baseWage = 2340000;
export const regionalMinimum = 4960000; // Region 1

export const insuranceRate = {
  employee: {
    social: 0.08,
    health: 0.015,
    unemployment: 0.01
  },
  employer: {
    social: 0.175,
    health: 0.03,
    unemployment: 0.01
  }
};

export const taxRate = [
  { max: 5000000, rate: 0.05, reduce: 0 },
  { max: 10000000, rate: 0.10, reduce: 250000 },
  { max: 18000000, rate: 0.15, reduce: 750000 },
  { max: 32000000, rate: 0.20, reduce: 1650000 },
  { max: 52000000, rate: 0.25, reduce: 3250000 },
  { max: 80000000, rate: 0.30, reduce: 5850000 },
  { max: Infinity, rate: 0.35, reduce: 9850000 }
];

export const unionFee = 0.02;
export const personalDeduction = 11000000;

export function calculateNet() {
  const grossInput = document.getElementById('gross').value.replace(/,/g, '');
  const gross = parseFloat(grossInput);
  const resultDiv = document.getElementById('result');

  if (isNaN(gross) || gross < 5000000) {
    resultDiv.innerText = 'Please enter a valid base salary (minimum 5,000,000 VND).';
    return;
  }

  // === Cap insurance salary base (split caps)
  const insuranceCapSocialHealth = 20 * baseWage;
  const insuranceCapUnemployment = 20 * regionalMinimum;
  const insuranceBaseSalarySocialHealth = Math.min(gross, insuranceCapSocialHealth);
  const insuranceBaseSalaryUnemployment = Math.min(gross, insuranceCapUnemployment);

  // === Insurance deduction (employee side, split caps)
  const totalInsuranceEmp =
    insuranceBaseSalarySocialHealth * (insuranceRate.employee.social + insuranceRate.employee.health) +
    insuranceBaseSalaryUnemployment * insuranceRate.employee.unemployment;

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

  // === Employer total cost (split caps)
  const totalInsuranceEmplyr =
    insuranceBaseSalarySocialHealth * (insuranceRate.employer.social + insuranceRate.employer.health) +
    insuranceBaseSalaryUnemployment * insuranceRate.employer.unemployment;

  const employerUnion = insuranceBaseSalarySocialHealth * unionFee;
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
