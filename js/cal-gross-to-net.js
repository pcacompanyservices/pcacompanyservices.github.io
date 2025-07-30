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
 * Calculate payroll from gross to net.
 * @param {Object} params - All input values and flags
 * @returns {Object} Calculation result or error
 */
export function calculateFromGrossToNet(params) {

  // Parse and validate base salary
  const baseSalary = parseFloat((params.baseSalary + '').replace(/,/g, ''));
  if (isNaN(baseSalary) || baseSalary < 5000000) {
    return { error: 'Please enter a valid base salary (minimum 5,000,000 VND).' };
  }

  // Allowances
  const isAllowanceEnabled = !!params.isAllowanceEnabled;
  const lunchAllowance   = isAllowanceEnabled ? getRoundedValue(params.lunchAllowance,   !!params.lunchEnabled)   : 0;
  const fuelAllowance    = isAllowanceEnabled ? getRoundedValue(params.fuelAllowance,    !!params.fuelEnabled)    : 0;
  const phoneAllowance   = isAllowanceEnabled ? getRoundedValue(params.phoneAllowance,   !!params.phoneEnabled)   : 0;
  const travelAllowance  = isAllowanceEnabled ? getRoundedValue(params.travelAllowance,  !!params.travelEnabled)  : 0;
  const uniformAllowance = isAllowanceEnabled ? getRoundedValue(params.uniformAllowance, !!params.uniformEnabled) : 0;

  // Bonuses
  const isBonusEnabled = !!params.isBonusEnabled;
  const productivityBonus = isBonusEnabled ? getRoundedValue(params.productivityBonus, !!params.productivityEnabled) : 0;
  const incentiveBonus    = isBonusEnabled ? getRoundedValue(params.incentiveBonus,    !!params.incentiveEnabled)    : 0;
  const kpiBonus          = isBonusEnabled ? getRoundedValue(params.kpiBonus,          !!params.kpiEnabled)          : 0;

  const national = params.national;

  // Total Allowances
  const totalAllowance = lunchAllowance + fuelAllowance + phoneAllowance + travelAllowance + uniformAllowance;
  // Total Bonuses
  const totalBonus = productivityBonus + incentiveBonus + kpiBonus;
  // Total Allowance and Bonus
  const totalBonusAndAllowance = totalAllowance + totalBonus;

  // Gross Salary calculation
  const grossSalary = baseSalary + totalBonusAndAllowance;

  // Employee Insurance contributions
  const employeeInsurance =
    Math.min(baseSalary, socialHealthCapSalaryForInsurance) * (insuranceRate.employee.social + insuranceRate.employee.health) +
    (national === 'local'
      ? Math.min(baseSalary, unemploymentCapSalaryForInsurance) * insuranceRate.employee.unemployment
      : 0);

  // Employer Insurance contributions
  const employerInsurance =
    Math.min(baseSalary, socialHealthCapSalaryForInsurance) * (insuranceRate.employer.social + insuranceRate.employer.health) +
    (national === 'local'
      ? Math.min(baseSalary, unemploymentCapSalaryForInsurance) * insuranceRate.employer.unemployment
      : 0);

  // Taxable Income calculation
  const taxableIncome =
    grossSalary -
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
  const netSalary = grossSalary - employeeInsurance - incomeTax;
  // Employer Union Fee
  const unionFeeAmount = Math.min(baseSalary, socialHealthCapSalaryForInsurance) * unionFee;
  // Total Employer Cost
  const totalEmployerCost = grossSalary + employerInsurance + unionFeeAmount;
  // Gross Salary construction
  const percentBaseSalary = (baseSalary / grossSalary) * 100;
  const percentBonusAndAllowance = (totalBonusAndAllowance / grossSalary) * 100;

  return {
    // Salary
    grossSalary:      Math.round(grossSalary),
    baseSalary:       Math.round(baseSalary),

    // Allowances
    lunchAllowance:   Math.round(lunchAllowance),
    fuelAllowance:    Math.round(fuelAllowance),
    phoneAllowance:   Math.round(phoneAllowance),
    travelAllowance:  Math.round(travelAllowance),
    uniformAllowance: Math.round(uniformAllowance),
    totalAllowance:   Math.round(totalAllowance),

    // Bonuses
    productivityBonus: Math.round(productivityBonus),
    incentiveBonus:    Math.round(incentiveBonus),
    kpiBonus:          Math.round(kpiBonus),
    totalBonus:        Math.round(totalBonus),

    // Total Allowance and Bonus
    totalBonusAndAllowance: Math.round(totalBonusAndAllowance),

    // Gross Salary construction
    percentBaseSalary:        Math.round(percentBaseSalary),
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
