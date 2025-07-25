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

// Helper function to get rounded value based on input and checkbox
function getRoundedValue(id, checkboxId) {
  return document.getElementById(checkboxId)?.checked
    ? parseFloat(document.getElementById(id).value.replace(/,/g, '')) || 0
    : 0;
}

export function calculateFromGrossToNet() {
  const resultDiv = document.getElementById('result');
  const baseSalary = parseFloat(document.getElementById('base-salary').value.replace(/,/g, ''));

  if (isNaN(baseSalary) || baseSalary < 5000000) {
    resultDiv.innerText = 'Please enter a valid base salary (minimum 5,000,000 VND).';
    return;
  }

  // Grouped: Allowances
  const isAllowanceEnabled = document.getElementById('allowance-checkbox').checked;
  const lunchAllowance = isAllowanceEnabled ? getRoundedValue('allowance-lunch', 'lunch-checkbox') : 0;
  const fuelAllowance = isAllowanceEnabled ? getRoundedValue('allowance-fuel', 'fuel-checkbox') : 0;
  const phoneAllowance = isAllowanceEnabled ? getRoundedValue('allowance-phone', 'phone-checkbox') : 0;
  const travelAllowance = isAllowanceEnabled ? getRoundedValue('allowance-travel', 'travel-checkbox') : 0;
  const uniformAllowance = isAllowanceEnabled ? getRoundedValue('allowance-uniform', 'uniform-checkbox') : 0;

  // Grouped: Bonuses
  const isBonusEnabled = document.getElementById('bonus-checkbox').checked;
  const productivityBonus = isBonusEnabled ? getRoundedValue('bonus-productivity', 'productivity-checkbox') : 0;
  const incentiveBonus = isBonusEnabled ? getRoundedValue('bonus-incentive', 'incentive-checkbox') : 0;
  const kpiBonus = isBonusEnabled ? getRoundedValue('bonus-kpi', 'kpi-checkbox') : 0;

  const national = document.getElementById('national').value;

  // Gross Salary
  const grossSalary =
    baseSalary +
    lunchAllowance +
    fuelAllowance +
    phoneAllowance +
    travelAllowance +
    uniformAllowance +
    productivityBonus +
    incentiveBonus +
    kpiBonus;

  // Employee Insurance
  const employeeInsurance =
    Math.min(baseSalary, socialHealthCapSalaryForInsurance) * (insuranceRate.employee.social + insuranceRate.employee.health) +
    (national === 'local'
      ? Math.min(baseSalary, unemploymentCapSalaryForInsurance) * insuranceRate.employee.unemployment
      : 0);

  // Employer Insurance
  const employerInsurance =
    Math.min(baseSalary, socialHealthCapSalaryForInsurance) * (insuranceRate.employer.social + insuranceRate.employer.health) +
    (national === 'local'
      ? Math.min(baseSalary, unemploymentCapSalaryForInsurance) * insuranceRate.employer.unemployment
      : 0);

  // Taxable Income
  const taxableIncome =
    grossSalary -
    employeeInsurance -
    personalDeduction -
    phoneAllowance -
    Math.min(lunchAllowance, lunchCap) -
    Math.min(uniformAllowance, uniformCap);

  // Income Tax
  let incomeTax = 0;
  if (taxableIncome > 0) {
    for (const bracket of taxRate) {
      if (taxableIncome <= bracket.max) {
        incomeTax = taxableIncome * bracket.rate - bracket.reduce;
        break;
      }
    }
  }

  // Net Salary
  const netSalary = grossSalary - employeeInsurance - incomeTax;
  // Employer Union Fee
  const unionFeeAmount = Math.min(baseSalary, socialHealthCapSalaryForInsurance) * unionFee;
  // Total Employer Cost
  const totalEmployerCost = grossSalary + employerInsurance + unionFeeAmount;

  return {
    baseSalary: Math.round(baseSalary),
    lunchAllowance: Math.round(lunchAllowance),
    fuelAllowance: Math.round(fuelAllowance),
    phoneAllowance: Math.round(phoneAllowance),
    travelAllowance: Math.round(travelAllowance),
    uniformAllowance: Math.round(uniformAllowance),
    productivityBonus: Math.round(productivityBonus),
    incentiveBonus: Math.round(incentiveBonus),
    kpiBonus: Math.round(kpiBonus),
    grossSalary: Math.round(grossSalary),
    employeeInsurance: Math.round(employeeInsurance),
    taxableIncome: Math.round(taxableIncome),
    incomeTax: Math.round(incomeTax),
    netSalary: Math.round(netSalary),
    employerInsurance: Math.round(employerInsurance),
    employerUnionFee: Math.round(unionFeeAmount),
    totalEmployerCost: Math.round(totalEmployerCost)
  };
}
