// Constants
const baseWage = 2340000;
const regionalMinimum = 4960000; // Region 1

// Insurance rates
const insuranceRate = {
  employee: {
    social:      0.08,
    health:      0.015,
    unemployment:0.01
  },
  employer: {
    social:      0.175,
    health:      0.03,
    unemployment:0.01
  }
};

// Salary caps for insurance calculations
const socialHealthCapSalaryForInsurance   = 20 * baseWage; 
const unemploymentCapSalaryForInsurance   = 20 * regionalMinimum; 
const lunchCap                            = 730000; 
const uniformCap                          = 5000000 / 12;

// Tax brackets
const taxRate = [
  { max: 5000000,   rate: 0.05, reduce:       0 },
  { max: 10000000,  rate: 0.10, reduce:  250000 },
  { max: 18000000,  rate: 0.15, reduce:  750000 },
  { max: 32000000,  rate: 0.20, reduce: 1650000 },
  { max: 52000000,  rate: 0.25, reduce: 3250000 },
  { max: 80000000,  rate: 0.30, reduce: 5850000 },
  { max: Infinity,  rate: 0.35, reduce: 9850000 }
];

const unionFee = 0.02;

const personalDeduction = 11000000;
// (Unused) const dependentsDeduction = 4400000;


// Helper: parse value if enabled, else 0
function getRoundedValue(value, enabled) {
  return enabled ? (parseFloat((value + '').replace(/,/g, '')) || 0) : 0;
}


/**

/**
 * Calculate payroll (gross-to-net or net-to-gross).
 * @param {Object} params - All input values and flags
 * @param {string} params.method - 'gross-to-net' or 'net-to-gross'
 * @returns {Object} Calculation result or error
 */
export function calculateFromGrossToNet(params) {
  // Default to 'gross-to-net' if not provided
  const method = params.method || 'gross-to-net';


  // Only support gross-to-net for now
  if (method !== 'gross-to-net') {
    return { error: 'Only gross-to-net calculation is currently supported.' };
  }

  // Parse and validate gross salary
  const grossSalary = parseFloat((params.grossSalary + '').replace(/,/g, ''));
  if (isNaN(grossSalary) || grossSalary < 5000000) {
    return { error: 'Please enter a valid gross salary (minimum 5,000,000 VND).' };
  }

  // Allowances
  const isAllowanceEnabled = !!params.isAllowanceEnabled;
  const lunchAllowance   = isAllowanceEnabled ? getRoundedValue(params.lunchAllowance,   !!params.lunchEnabled)   : 0;
  const fuelAllowance    = isAllowanceEnabled ? getRoundedValue(params.fuelAllowance,    !!params.fuelEnabled)    : 0;
  const phoneAllowance   = isAllowanceEnabled ? getRoundedValue(params.phoneAllowance,   !!params.phoneEnabled)   : 0;
  const travelAllowance  = isAllowanceEnabled ? getRoundedValue(params.travelAllowance,  !!params.travelEnabled)  : 0;
  const uniformAllowance = isAllowanceEnabled ? getRoundedValue(params.uniformAllowance, !!params.uniformEnabled) : 0;
  const otherAllowance   = isAllowanceEnabled ? getRoundedValue(params.otherAllowance,   !!params.otherAllowanceEnabled) : 0;

  // Bonuses
  const isBonusEnabled = !!params.isBonusEnabled;
  const productivityBonus = isBonusEnabled ? getRoundedValue(params.productivityBonus, !!params.productivityEnabled) : 0;
  const incentiveBonus    = isBonusEnabled ? getRoundedValue(params.incentiveBonus,    !!params.incentiveEnabled)    : 0;
  const kpiBonus          = isBonusEnabled ? getRoundedValue(params.kpiBonus,          !!params.kpiEnabled)          : 0;
  const otherBonus        = isBonusEnabled ? getRoundedValue(params.otherBonus,        !!params.otherBonusEnabled)   : 0;

  const citizenship = params.citizenship;

  // Total Allowances
  const totalAllowance = lunchAllowance + fuelAllowance + phoneAllowance + travelAllowance + uniformAllowance + otherAllowance;
  // Total Bonuses
  const totalBonus = productivityBonus + incentiveBonus + kpiBonus + otherBonus;
  // Total Allowance and Bonus
  const totalBonusAndAllowance = totalAllowance + totalBonus;

  // Adjusted Gross Salary calculation
  const adjustedGrossSalary = grossSalary + totalBonusAndAllowance;

  // Employee Insurance contributions
  const employeeInsurance =
    Math.min(grossSalary, socialHealthCapSalaryForInsurance) * (insuranceRate.employee.social + insuranceRate.employee.health) +
    (citizenship === 'local'
      ? Math.min(grossSalary, unemploymentCapSalaryForInsurance) * insuranceRate.employee.unemployment
      : 0);

  // Employer Insurance contributions
  const employerInsurance =
    Math.min(grossSalary, socialHealthCapSalaryForInsurance) * (insuranceRate.employer.social + insuranceRate.employer.health) +
    (citizenship === 'local'
      ? Math.min(grossSalary, unemploymentCapSalaryForInsurance) * insuranceRate.employer.unemployment
      : 0);

  // Taxable Income calculation
  const taxableIncome =
    adjustedGrossSalary -
    employeeInsurance -
    personalDeduction -
    phoneAllowance -
    Math.min(lunchAllowance, lunchCap) -
    Math.min(uniformAllowance, uniformCap);

  // Income Tax calculation
  let incomeTax = 0;
  if (taxableIncome > 0) {
    for (const bracket of taxRate) {
      if (taxableIncome <= bracket.max) {
        incomeTax = taxableIncome * bracket.rate - bracket.reduce;
        break;
      }
    }
  }

  // Net Salary calculation
  const netSalary = adjustedGrossSalary - employeeInsurance - incomeTax;
  // Employer Union Fee
  const unionFeeAmount = Math.min(grossSalary, socialHealthCapSalaryForInsurance) * unionFee;
  // Total Employer Cost
  const totalEmployerCost = adjustedGrossSalary + employerInsurance + unionFeeAmount;
  // Adjusted Gross Salary construction
  const percentGrossSalary = (grossSalary / adjustedGrossSalary) * 100;
  const percentBonusAndAllowance = (totalBonusAndAllowance / adjustedGrossSalary) * 100;

  return {
    // Citizenship
    citizenship: citizenship,
    
    // Salary
    adjustedGrossSalary: Math.round(adjustedGrossSalary),
    grossSalary:      Math.round(grossSalary),

    // Allowances
    lunchAllowance:   Math.round(lunchAllowance),
    fuelAllowance:    Math.round(fuelAllowance),
    phoneAllowance:   Math.round(phoneAllowance),
    travelAllowance:  Math.round(travelAllowance),
    uniformAllowance: Math.round(uniformAllowance),
    otherAllowance:   Math.round(otherAllowance),
    totalAllowance:   Math.round(totalAllowance),

    // Bonuses
    productivityBonus: Math.round(productivityBonus),
    incentiveBonus:    Math.round(incentiveBonus),
    kpiBonus:          Math.round(kpiBonus),
    otherBonus:        Math.round(otherBonus),
    totalBonus:        Math.round(totalBonus),

    // Total Allowance and Bonus
    totalBonusAndAllowance: Math.round(totalBonusAndAllowance),

  // Adjusted Gross Salary construction
    percentGrossSalary:        Math.round(percentGrossSalary),
    percentBonusAndAllowance: Math.round(percentBonusAndAllowance),

    // Calculated Salaries and Deductions
    employeeInsurance:Math.round(employeeInsurance),
    taxableIncome:    Math.round(taxableIncome),
    incomeTax:        Math.round(incomeTax),
    netSalary:        Math.round(netSalary),

    // Employer Costs
    employerInsurance: Math.round(employerInsurance),
    employerUnionFee:  Math.round(unionFeeAmount),
    totalEmployerCost: Math.round(totalEmployerCost)
  };
}
