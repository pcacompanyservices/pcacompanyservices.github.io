// Const
const baseWage = 2340000;
const regionalMinimum = 4960000; // Region 1

const insuranceRate = {
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

const socialHealthCapSalaryForInsurance = 20 * baseWage; 
const unemploymentCapSalaryForInsurance = 20 * regionalMinimum; 
const lunchCap = 730000; 
const uniformCap = 5000000 / 12;

const taxRate = [
  { max: 5000000, rate: 0.05, reduce: 0 },
  { max: 10000000, rate: 0.10, reduce: 250000 },
  { max: 18000000, rate: 0.15, reduce: 750000 },
  { max: 32000000, rate: 0.20, reduce: 1650000 },
  { max: 52000000, rate: 0.25, reduce: 3250000 },
  { max: 80000000, rate: 0.30, reduce: 5850000 },
  { max: Infinity, rate: 0.35, reduce: 9850000 }
];

const unionFee = 0.02;

const personalDeduction = 11000000;
const dependentsDeduction = 4400000;

// Calculation

export function calculateFromGrossToNet() {
  const resultDiv = document.getElementById('result');

  const baseSalary = parseFloat(document.getElementById('base-salary').value.replace(/,/g, ''));
  if (isNaN(baseSalary) || baseSalary < 5000000) {
    resultDiv.innerText = 'Please enter a valid base salary (minimum 5,000,000 VND).';
    return;
  }

  let lunchAllowance = 0;
  let fuelAllowance = 0;
  let phoneAllowance = 0;
  let travelAllowance = 0;
  let uniformAllowance = 0;

  if (document.getElementById('allowance-checkbox').checked) {
    lunchAllowance = document.getElementById('lunch-checkbox').checked ? parseFloat(document.getElementById('allowance-lunch').value.replace(/,/g, '')) || 0 : 0;
    fuelAllowance = document.getElementById('fuel-checkbox').checked ? parseFloat(document.getElementById('allowance-fuel').value.replace(/,/g, '')) || 0 : 0;
    phoneAllowance = document.getElementById('phone-checkbox').checked ? parseFloat(document.getElementById('allowance-phone').value.replace(/,/g, '')) || 0 : 0;
    travelAllowance = document.getElementById('travel-checkbox').checked ? parseFloat(document.getElementById('allowance-travel').value.replace(/,/g, '')) || 0 : 0;
    uniformAllowance = document.getElementById('uniform-checkbox').checked ? parseFloat(document.getElementById('allowance-uniform').value.replace(/,/g, '')) || 0 : 0;
  }

  let productivityBonus = 0;
  let incentiveBonus = 0;
  let kpiBonus = 0;

  if (document.getElementById('bonus-checkbox').checked) {
    productivityBonus = document.getElementById('productivity-checkbox').checked ? parseFloat(document.getElementById('bonus-productivity').value.replace(/,/g, '')) || 0 : 0;
    incentiveBonus = document.getElementById('incentive-checkbox').checked ? parseFloat(document.getElementById('bonus-incentive').value.replace(/,/g, '')) || 0 : 0;
    kpiBonus = document.getElementById('kpi-checkbox').checked ? parseFloat(document.getElementById('bonus-kpi').value.replace(/,/g, '')) || 0 : 0;
  }

  function calculateEmployeeGross() {
    return baseSalary + lunchAllowance + fuelAllowance + phoneAllowance + travelAllowance + uniformAllowance + productivityBonus + incentiveBonus + kpiBonus;
  }

  function calculateEmployeeInsurance() {
    const socialHealthInsurance = Math.min(baseSalary, socialHealthCapSalaryForInsurance) * (insuranceRate.employee.social + insuranceRate.employee.health);
    const unemploymentInsurance = Math.min(baseSalary, unemploymentCapSalaryForInsurance) * insuranceRate.employee.unemployment;
    return socialHealthInsurance + (document.getElementById('national').value === 'local' ? unemploymentInsurance : 0);
  }

  function calculateEmployerInsurance() {
    const socialHealthInsurance = Math.min(baseSalary, socialHealthCapSalaryForInsurance) * (insuranceRate.employer.social + insuranceRate.employer.health);
    const unemploymentInsurance = Math.min(baseSalary, unemploymentCapSalaryForInsurance) * insuranceRate.employer.unemployment;
    return socialHealthInsurance + (document.getElementById('national').value === 'local' ? unemploymentInsurance : 0);
  }

  function calculateEmployeeTaxableIncome() {
    const gross = calculateEmployeeGross();
    const insurance = calculateEmployeeInsurance();
    return gross - insurance - personalDeduction - phoneAllowance - Math.min(lunchAllowance, lunchCap) - Math.min(uniformAllowance, uniformCap);
  }

  function calculateEmployeePIT() {
    const taxableIncome = calculateEmployeeTaxableIncome();
    let tax = 0;
    if (taxableIncome > 0) {
      for (const bracket of taxRate) {
        if (taxableIncome <= bracket.max) {
          tax = taxableIncome * bracket.rate - bracket.reduce;
          break;
        }
      }
    }
    return tax;
  }

  function calculateEmployeeNet() {
    const gross = calculateEmployeeGross();
    const insurance = calculateEmployeeInsurance();
    const tax = calculateEmployeePIT();
    return gross - insurance - tax;
  }

  function calculateEmployerCost() {
    const gross = calculateEmployeeGross();
    const insurance = calculateEmployerInsurance();
    const union = Math.min(baseSalary, socialHealthCapSalaryForInsurance) * unionFee;
    return gross + insurance + union;
  }

  const grossSalary = calculateEmployeeGross();
  const totalInsuranceEmployee = calculateEmployeeInsurance();
  const taxableIncome = calculateEmployeeTaxableIncome();
  const incomeTax = calculateEmployeePIT();
  const net = calculateEmployeeNet();
  const totalInsuranceEmployer = calculateEmployerInsurance();
  const employerUnion = Math.min(baseSalary, socialHealthCapSalaryForInsurance) * unionFee;
  const employerCost = calculateEmployerCost();

  let allowanceHTML = '';
  if (lunchAllowance) allowanceHTML += `- Lunch: ${Math.round(lunchAllowance).toLocaleString('us-US')} VND<br>`;
  if (fuelAllowance) allowanceHTML += `- Fuel: ${Math.round(fuelAllowance).toLocaleString('us-US')} VND<br>`;
  if (phoneAllowance) allowanceHTML += `- Phone: ${Math.round(phoneAllowance).toLocaleString('us-US')} VND<br>`;
  if (travelAllowance) allowanceHTML += `- Travel: ${Math.round(travelAllowance).toLocaleString('us-US')} VND<br>`;
  if (uniformAllowance) allowanceHTML += `- Uniform: ${Math.round(uniformAllowance).toLocaleString('us-US')} VND<br>`;

  let bonusHTML = '';
  if (productivityBonus) bonusHTML += `- Productivity: ${Math.round(productivityBonus).toLocaleString('us-US')} VND<br>`;
  if (incentiveBonus) bonusHTML += `- Incentive: ${Math.round(incentiveBonus).toLocaleString('us-US')} VND<br>`;
  if (kpiBonus) bonusHTML += `- KPI: ${Math.round(kpiBonus).toLocaleString('us-US')} VND<br>`;

  resultDiv.innerHTML = `
    <b>Base Salary: ${Math.round(baseSalary).toLocaleString('us-US')} VND</b><br>
    <hr>
    ${allowanceHTML ? 'Allowances:<br>' + allowanceHTML + '<hr>' : ''}
    ${bonusHTML ? 'Bonuses:<br>' + bonusHTML + '<hr>' : ''}
    <b>Gross Salary: ${Math.round(grossSalary).toLocaleString('us-US')} VND</b><br>
    <hr>
    Employee Insurance: ${Math.round(totalInsuranceEmployee).toLocaleString('us-US')} VND<br>
    <hr>
    (Taxable Income: ${Math.round(taxableIncome).toLocaleString('us-US')} VND)<br>
    Employee Personal Income Tax: ${Math.round(incomeTax).toLocaleString('us-US')} VND<br>
    <hr>
    <b>Employee Net Salary: ${Math.round(net).toLocaleString('us-US')} VND</b><br>
    <hr>
    Employer Insurance: ${Math.round(totalInsuranceEmployer).toLocaleString('us-US')} VND<br>
    Employer Union Fee: ${Math.round(employerUnion).toLocaleString('us-US')} VND<br>
    <hr>
    <b>Total Employer Cost: ${Math.round(employerCost).toLocaleString('us-US')} VND</b><br>
  `;
}
