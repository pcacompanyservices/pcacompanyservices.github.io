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

// Helper: parse value if enabled, else 0
function getRoundedValue(value, enabled) {
  if (!enabled) return 0;
  if (value === null || value === undefined || value === '') return 0;
  const parsed = parseFloat((value + '').replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

// Helper: Calculate all values from gross salary
function calculateFromGross(grossSalary, totalBonusAndAllowance, lunchAllowance, phoneAllowance, uniformAllowance, taxResidentStatus) {
  const adjustedGrossSalary = grossSalary + totalBonusAndAllowance;

  // Employee Insurance contributions (detailed)
  const employeeSocialInsurance = Math.min(grossSalary, socialHealthCapSalaryForInsurance) * insuranceRate.employee.social;
  const employeeHealthInsurance = Math.min(grossSalary, socialHealthCapSalaryForInsurance) * insuranceRate.employee.health;
  const employeeUnemploymentInsurance =
    taxResidentStatus === 'local' ? Math.min(grossSalary, unemploymentCapSalaryForInsurance) * insuranceRate.employee.unemployment : 0;
  const employeeInsurance = employeeSocialInsurance + employeeHealthInsurance + employeeUnemploymentInsurance;

  // Employer Insurance contributions (detailed)
  const employerSocialInsurance = Math.min(grossSalary, socialHealthCapSalaryForInsurance) * insuranceRate.employer.social;
  const employerHealthInsurance = Math.min(grossSalary, socialHealthCapSalaryForInsurance) * insuranceRate.employer.health;
  const employerUnemploymentInsurance =
    taxResidentStatus === 'local' ? Math.min(grossSalary, unemploymentCapSalaryForInsurance) * insuranceRate.employer.unemployment : 0;
  const employerInsurance = employerSocialInsurance + employerHealthInsurance + employerUnemploymentInsurance;

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

  // Employee and Employer Contributions
  const employeeContribution = employeeInsurance + incomeTax;
  const employerContribution = employerInsurance + unionFeeAmount;

  return {
    adjustedGrossSalary,
    // Insurance breakdowns
    employeeSocialInsurance,
    employeeHealthInsurance,
    employeeUnemploymentInsurance,
    employeeInsurance,
    employerSocialInsurance,
    employerHealthInsurance,
    employerUnemploymentInsurance,
    employerInsurance,
    // Contributions
    employeeContribution,
    employerContribution,
    // Other payroll values
    taxableIncome,
    incomeTax,
    netSalary,
    unionFeeAmount,
    totalEmployerCost
  };
}

/**
 * Calculate payroll (gross-to-net or net-to-gross).
 * @param {Object} params - All input values and flags
 * @param {string} params.method - 'gross-to-net' or 'net-to-gross'
 * @returns {Object} Calculation result or error
 */
export function simulateSalary(params) {
  // Default to 'gross-to-net' if not provided
  const method = params.method || 'gross-to-net';

  // Parse allowances - simplified since we always show all fields
  const lunchAllowance   = getRoundedValue(params.lunchAllowance,   !!params.lunchEnabled);
  const fuelAllowance    = getRoundedValue(params.fuelAllowance,    !!params.fuelEnabled);
  const phoneAllowance   = getRoundedValue(params.phoneAllowance,   !!params.phoneEnabled);
  const travelAllowance  = getRoundedValue(params.travelAllowance,  !!params.travelEnabled);
  const uniformAllowance = getRoundedValue(params.uniformAllowance, !!params.uniformEnabled);
  const otherAllowance   = getRoundedValue(params.otherAllowance,   !!params.otherAllowanceEnabled);

  // Parse bonus - simplified to single total bonus
  const totalBonus = getRoundedValue(params.totalBonus, !!params.isBonusEnabled);

  // Parse benefits
  const childTuitionBenefit    = getRoundedValue(params.childTuitionBenefit,    !!params.childTuitionEnabled);
  const rentalBenefit          = getRoundedValue(params.rentalBenefit,          !!params.rentalEnabled);
  const healthInsuranceBenefit = getRoundedValue(params.healthInsuranceBenefit, !!params.healthInsuranceEnabled);

  const taxResidentStatus = params.taxResidentStatus || 'local';

  // Calculate totals
  const totalAllowance = lunchAllowance + fuelAllowance + phoneAllowance + travelAllowance + uniformAllowance + otherAllowance;
  const totalBenefit = childTuitionBenefit + rentalBenefit + healthInsuranceBenefit;
  const totalBonusAndAllowance = totalAllowance + totalBonus;

  let grossSalary, calculationResult;

  if (method === 'gross-to-net') {
    // Parse and validate gross salary
    grossSalary = getRoundedValue(params.grossSalary, true);
    if (grossSalary < 5000000) {
      return { error: 'Please enter a valid gross salary (minimum 5,000,000 VND).' };
    }

    calculationResult = calculateFromGross(grossSalary, totalBonusAndAllowance, lunchAllowance, phoneAllowance, uniformAllowance, taxResidentStatus);

  } else if (method === 'net-to-gross') {
    // Parse and validate net salary
    const targetNetSalary = getRoundedValue(params.netSalary, true);
    if (targetNetSalary < 4475000) {
      return { error: 'Please enter a valid net salary (minimum 4,475,000 VND).' };
    }

    // Function to compute net salary from gross salary
    function computeNetFromGross(testGrossSalary) {
      const result = calculateFromGross(testGrossSalary, totalBonusAndAllowance, lunchAllowance, phoneAllowance, uniformAllowance, taxResidentStatus);
      return result.netSalary;
    }

    // Bisection method to find gross salary that produces target net salary
    let low = 5000000;
    let high = 1000000000; // Increased upper bound for high salaries
    let mid = 0;
    let found = false;
    const tolerance = 0.5; // Allow 0.5 VND difference

    // First, check if the target is achievable
    const maxPossibleNet = computeNetFromGross(high);
    if (targetNetSalary > maxPossibleNet) {
      return { error: `Target net salary too high. Maximum achievable net salary is approximately ${Math.round(maxPossibleNet).toLocaleString('vi-VN')} VND.` };
    }

    for (let i = 0; i < 50; i++) { // Increased iterations for better precision
      mid = (low + high) / 2;
      const calculatedNet = computeNetFromGross(mid);
      const difference = calculatedNet - targetNetSalary;
      
      if (Math.abs(difference) <= tolerance) {
        found = true;
        grossSalary = mid;
        break;
      }
      
      if (difference > 0) {
        high = mid;
      } else {
        low = mid;
      }
    }

    if (!found) {
      grossSalary = mid; // Use the closest approximation
    }

    calculationResult = calculateFromGross(grossSalary, totalBonusAndAllowance, lunchAllowance, phoneAllowance, uniformAllowance, taxResidentStatus);

  } else {
    return { error: 'Unknown calculation method.' };
  }

  // Calculate percentage breakdown
  const percentGrossSalary = (grossSalary / calculationResult.adjustedGrossSalary) * 100;
  const percentBonusAndAllowance = (totalBonusAndAllowance / calculationResult.adjustedGrossSalary) * 100;

  // Return consistent results for both methods
  return {
    // Tax Resident Status
    taxResidentStatus: taxResidentStatus,
    // Salary
    adjustedGrossSalary: Math.round(calculationResult.adjustedGrossSalary),
    grossSalary:         Math.round(grossSalary),
    // Allowances
    lunchAllowance:   Math.round(lunchAllowance),
    fuelAllowance:    Math.round(fuelAllowance),
    phoneAllowance:   Math.round(phoneAllowance),
    travelAllowance:  Math.round(travelAllowance),
    uniformAllowance: Math.round(uniformAllowance),
    otherAllowance:   Math.round(otherAllowance),
    totalAllowance:   Math.round(totalAllowance),
    // Bonuses
    totalBonus:        Math.round(totalBonus),
    // Benefits
    childTuitionBenefit:    Math.round(childTuitionBenefit),
    rentalBenefit:          Math.round(rentalBenefit),
    healthInsuranceBenefit: Math.round(healthInsuranceBenefit),
    totalBenefit:           Math.round(totalBenefit),
    // Total Allowance and Bonus
    totalBonusAndAllowance: Math.round(totalBonusAndAllowance),
    // Adjusted Gross Salary construction
    percentGrossSalary:        Math.round(percentGrossSalary * 100) / 100, // Round to 2 decimal places
    percentBonusAndAllowance:  Math.round(percentBonusAndAllowance * 100) / 100, // Round to 2 decimal places
    // Employee Insurance
    employeeSocialInsurance:       Math.round(calculationResult.employeeSocialInsurance),
    employeeHealthInsurance:       Math.round(calculationResult.employeeHealthInsurance),
    employeeUnemploymentInsurance: Math.round(calculationResult.employeeUnemploymentInsurance),
    employeeInsurance:             Math.round(calculationResult.employeeInsurance),
    // Employer Insurance
    employerSocialInsurance:       Math.round(calculationResult.employerSocialInsurance),
    employerHealthInsurance:       Math.round(calculationResult.employerHealthInsurance),
    employerUnemploymentInsurance: Math.round(calculationResult.employerUnemploymentInsurance),
    employerInsurance:             Math.round(calculationResult.employerInsurance),
    // Contributions
    employeeContribution: Math.round(calculationResult.employeeContribution),
    employerContribution: Math.round(calculationResult.employerContribution),
    // Calculated Salaries and Deductions
    taxableIncome:     Math.round(calculationResult.taxableIncome),
    incomeTax:         Math.round(calculationResult.incomeTax),
    netSalary:         Math.round(calculationResult.netSalary),
    // Employer Costs
    employerUnionFee:  Math.round(calculationResult.unionFeeAmount),
    totalEmployerCost: Math.round(calculationResult.totalEmployerCost)
  };
}