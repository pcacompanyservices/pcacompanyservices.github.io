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
  // Handle both comma and period as thousands separators (Vietnamese uses periods)
  const parsed = parseFloat((value + '').replace(/[,.]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

// Helper: Calculate all values from gross salary
function calculateFromGross(grossSalary, totalBonusAndAllowance, lunchAllowance, phoneAllowance, uniformAllowance, rentalBenefit, totalBenefit, taxResidentStatus) {
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

  // Step 1: Taxable Income calculation (before rental and other deductions)
  const taxableIncome =
    adjustedGrossSalary -
    phoneAllowance -
    Math.min(lunchAllowance, lunchCap) -
    Math.min(uniformAllowance, uniformCap);

  // Step 2: Assessable Income calculation (what goes into tax brackets)
  const rentalTaxableAmount = Math.min(taxableIncome * 0.15, rentalBenefit);
  const assessableIncome = taxableIncome + rentalTaxableAmount - employeeInsurance - personalDeduction;

  // Income Tax calculation (using assessable income)
  let incomeTax = 0;
  if (assessableIncome > 0) {
    for (const bracket of taxRate) {
      if (assessableIncome <= bracket.max) {
        incomeTax = assessableIncome * bracket.rate - bracket.reduce;
        break;
      }
    }
  }

  // Net Salary calculation
  const netSalary = adjustedGrossSalary - employeeInsurance - incomeTax;
  
  // Employer Union Fee
  const unionFeeAmount = Math.min(grossSalary, socialHealthCapSalaryForInsurance) * unionFee;
  
  // Total Employer Cost (includes all benefits)
  const totalEmployerCost = adjustedGrossSalary + employerInsurance + unionFeeAmount + totalBenefit;

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
    // Tax calculation values
    taxableIncome,
    rentalTaxableAmount,
    assessableIncome,
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

  // Parse benefits (same for both methods - employer costs only)
  const childTuitionBenefit    = getRoundedValue(params.childTuitionBenefit, params.childTuitionBenefit > 0);
  const rentalBenefit          = getRoundedValue(params.rentalBenefit, params.rentalBenefit > 0);
  const healthInsuranceBenefit = getRoundedValue(params.healthInsuranceBenefit, params.healthInsuranceBenefit > 0) / 12; // Convert annual to monthly
  const totalBenefit = childTuitionBenefit + rentalBenefit + healthInsuranceBenefit;

  const taxResidentStatus = params.taxResidentStatus || 'local';

  let grossSalary, grossLunchAllowance, grossFuelAllowance, grossPhoneAllowance, grossTravelAllowance, grossUniformAllowance, grossOtherAllowance, grossTotalBonus;
  let netSalary, netLunchAllowance, netFuelAllowance, netPhoneAllowance, netTravelAllowance, netUniformAllowance, netOtherAllowance, netTotalBonus;
  let calculationResult;

  if (method === 'gross-to-net') {
    // Parse gross inputs
    grossSalary = getRoundedValue(params.grossSalary, true);
    grossLunchAllowance   = getRoundedValue(params.lunchAllowance, params.lunchAllowance > 0);
    grossFuelAllowance    = getRoundedValue(params.fuelAllowance, params.fuelAllowance > 0);
    grossPhoneAllowance   = getRoundedValue(params.phoneAllowance, params.phoneAllowance > 0);
    grossTravelAllowance  = getRoundedValue(params.travelAllowance, params.travelAllowance > 0);
    grossUniformAllowance = getRoundedValue(params.uniformAllowance, params.uniformAllowance > 0);
    grossOtherAllowance   = getRoundedValue(params.otherAllowance, params.otherAllowance > 0);
    grossTotalBonus = getRoundedValue(params.totalBonus, params.totalBonus > 0);

    if (grossSalary < 5000000) {
      return { error: 'Please enter a valid gross salary (minimum 5.000.000 VND).' };
    }

    const grossTotalAllowance = grossLunchAllowance + grossFuelAllowance + grossPhoneAllowance + grossTravelAllowance + grossUniformAllowance + grossOtherAllowance;
    const grossTotalBonusAndAllowance = grossTotalAllowance + grossTotalBonus;

    calculationResult = calculateFromGross(grossSalary, grossTotalBonusAndAllowance, grossLunchAllowance, grossPhoneAllowance, grossUniformAllowance, rentalBenefit, totalBenefit, taxResidentStatus);

    // The old way was working correctly - just get the calculated values directly
    // Calculate net amounts using effective tax rate (as before my changes)
    const totalGross = calculationResult.adjustedGrossSalary;
    const totalNet = calculationResult.netSalary;
    const effectiveTaxRate = totalGross > 0 ? (totalGross - totalNet) / totalGross : 0;

    netSalary = grossSalary * (1 - effectiveTaxRate);
    netLunchAllowance = grossLunchAllowance * (1 - effectiveTaxRate);
    netFuelAllowance = grossFuelAllowance * (1 - effectiveTaxRate);
    netPhoneAllowance = grossPhoneAllowance * (1 - effectiveTaxRate);
    netTravelAllowance = grossTravelAllowance * (1 - effectiveTaxRate);
    netUniformAllowance = grossUniformAllowance * (1 - effectiveTaxRate);
    netOtherAllowance = grossOtherAllowance * (1 - effectiveTaxRate);
    netTotalBonus = grossTotalBonus * (1 - effectiveTaxRate);

  } else if (method === 'net-to-gross') {
    // Parse net inputs
    netSalary = getRoundedValue(params.netSalary || params.grossSalary, true);
    netLunchAllowance   = getRoundedValue(params.netLunchAllowance || params.lunchAllowance, (params.netLunchAllowance || params.lunchAllowance) > 0);
    netFuelAllowance    = getRoundedValue(params.netFuelAllowance || params.fuelAllowance, (params.netFuelAllowance || params.fuelAllowance) > 0);
    netPhoneAllowance   = getRoundedValue(params.netPhoneAllowance || params.phoneAllowance, (params.netPhoneAllowance || params.phoneAllowance) > 0);
    netTravelAllowance  = getRoundedValue(params.netTravelAllowance || params.travelAllowance, (params.netTravelAllowance || params.travelAllowance) > 0);
    netUniformAllowance = getRoundedValue(params.netUniformAllowance || params.uniformAllowance, (params.netUniformAllowance || params.uniformAllowance) > 0);
    netOtherAllowance   = getRoundedValue(params.netOtherAllowance || params.otherAllowance, (params.netOtherAllowance || params.otherAllowance) > 0);
    netTotalBonus = getRoundedValue(params.netTotalBonus || params.totalBonus, (params.netTotalBonus || params.totalBonus) > 0);

    if (netSalary < 4475000) {
      return { error: 'Please enter a valid net salary (minimum 4.475.000 VND).' };
    }

    const netTotalAllowance = netLunchAllowance + netFuelAllowance + netPhoneAllowance + netTravelAllowance + netUniformAllowance + netOtherAllowance;
    const netTotalBonusAndAllowance = netTotalAllowance + netTotalBonus;
    const targetTotalNet = netSalary + netTotalBonusAndAllowance;

    // Function to compute total net from gross amounts
    function computeTotalNetFromGross(testGrossSalary, testGrossBonusAndAllowance, testGrossLunch, testGrossPhone, testGrossUniform) {
      const result = calculateFromGross(testGrossSalary, testGrossBonusAndAllowance, testGrossLunch, testGrossPhone, testGrossUniform, rentalBenefit, totalBenefit, taxResidentStatus);
      return result.netSalary;
    }

    // First, estimate gross amounts using a simple multiplier
    const estimatedGrossFactor = 1.2; // Starting estimate
    let testGrossSalary = netSalary * estimatedGrossFactor;
    let testGrossLunch = netLunchAllowance * estimatedGrossFactor;
    let testGrossPhone = netPhoneAllowance * estimatedGrossFactor;
    let testGrossUniform = netUniformAllowance * estimatedGrossFactor;
    let testGrossBonusAndAllowance = netTotalBonusAndAllowance * estimatedGrossFactor;

    // Bisection method to find the correct gross amounts
    let low = 0.8, high = 2.0; // Multiplier range
    let found = false;
    const tolerance = 0.5;

    for (let i = 0; i < 50; i++) {
      const mid = (low + high) / 2;
      testGrossSalary = netSalary * mid;
      testGrossLunch = netLunchAllowance * mid;
      testGrossPhone = netPhoneAllowance * mid;
      testGrossUniform = netUniformAllowance * mid;
      testGrossBonusAndAllowance = netTotalBonusAndAllowance * mid;

      const calculatedTotalNet = computeTotalNetFromGross(testGrossSalary, testGrossBonusAndAllowance, testGrossLunch, testGrossPhone, testGrossUniform);
      const difference = calculatedTotalNet - targetTotalNet;

      if (Math.abs(difference) <= tolerance) {
        found = true;
        break;
      }

      if (difference > 0) {
        high = mid;
      } else {
        low = mid;
      }
    }

    // Set the calculated gross amounts
    grossSalary = testGrossSalary;
    grossLunchAllowance = testGrossLunch;
    grossFuelAllowance = netFuelAllowance * ((low + high) / 2);
    grossPhoneAllowance = testGrossPhone;
    grossTravelAllowance = netTravelAllowance * ((low + high) / 2);
    grossUniformAllowance = testGrossUniform;
    grossOtherAllowance = netOtherAllowance * ((low + high) / 2);
    grossTotalBonus = netTotalBonus * ((low + high) / 2);

    const grossTotalAllowance = grossLunchAllowance + grossFuelAllowance + grossPhoneAllowance + grossTravelAllowance + grossUniformAllowance + grossOtherAllowance;
    const grossTotalBonusAndAllowance = grossTotalAllowance + grossTotalBonus;

    calculationResult = calculateFromGross(grossSalary, grossTotalBonusAndAllowance, grossLunchAllowance, grossPhoneAllowance, grossUniformAllowance, rentalBenefit, totalBenefit, taxResidentStatus);

  } else {
    return { error: 'Unknown calculation method.' };
  }

  // Calculate totals for consistency
  const grossTotalAllowance = grossLunchAllowance + grossFuelAllowance + grossPhoneAllowance + grossTravelAllowance + grossUniformAllowance + grossOtherAllowance;
  const grossTotalBonusAndAllowance = grossTotalAllowance + grossTotalBonus;
  const netTotalAllowance = netLunchAllowance + netFuelAllowance + netPhoneAllowance + netTravelAllowance + netUniformAllowance + netOtherAllowance;
  const netTotalBonusAndAllowance = netTotalAllowance + netTotalBonus;

  // Calculate percentage breakdown
  const percentGrossSalary = (grossSalary / calculationResult.adjustedGrossSalary) * 100;
  const percentBonusAndAllowance = (grossTotalBonusAndAllowance / calculationResult.adjustedGrossSalary) * 100;

  // Return consistent results for both methods
  return {
    // Tax Resident Status
    taxResidentStatus: taxResidentStatus,
    // Gross amounts
    adjustedGrossSalary: Math.round(calculationResult.adjustedGrossSalary),
    grossSalary:         Math.round(grossSalary),
    grossLunchAllowance:   Math.round(grossLunchAllowance),
    grossFuelAllowance:    Math.round(grossFuelAllowance),
    grossPhoneAllowance:   Math.round(grossPhoneAllowance),
    grossTravelAllowance:  Math.round(grossTravelAllowance),
    grossUniformAllowance: Math.round(grossUniformAllowance),
    grossOtherAllowance:   Math.round(grossOtherAllowance),
    grossTotalAllowance:   Math.round(grossTotalAllowance),
    grossTotalBonus:       Math.round(grossTotalBonus),
    grossTotalBonusAndAllowance: Math.round(grossTotalBonusAndAllowance),
    // Net amounts  
    netSalary:         Math.round(calculationResult.netSalary), // Total net amount (what employee takes home)
    netBaseSalary:     Math.round(netSalary), // Individual base salary component
    netLunchAllowance:   Math.round(netLunchAllowance),
    netFuelAllowance:    Math.round(netFuelAllowance),
    netPhoneAllowance:   Math.round(netPhoneAllowance),
    netTravelAllowance:  Math.round(netTravelAllowance),
    netUniformAllowance: Math.round(netUniformAllowance),
    netOtherAllowance:   Math.round(netOtherAllowance),
    netTotalAllowance:   Math.round(netTotalAllowance),
    netTotalBonus:       Math.round(netTotalBonus),
    netTotalBonusAndAllowance: Math.round(netTotalBonusAndAllowance),
    // Legacy field names for backward compatibility
    lunchAllowance:   Math.round(grossLunchAllowance),
    fuelAllowance:    Math.round(grossFuelAllowance),
    phoneAllowance:   Math.round(grossPhoneAllowance),
    travelAllowance:  Math.round(grossTravelAllowance),
    uniformAllowance: Math.round(grossUniformAllowance),
    otherAllowance:   Math.round(grossOtherAllowance),
    totalAllowance:   Math.round(grossTotalAllowance),
    totalBonus:       Math.round(grossTotalBonus),
    totalBonusAndAllowance: Math.round(grossTotalBonusAndAllowance),
    // Benefits (employer costs)
    childTuitionBenefit:    Math.round(childTuitionBenefit),
    rentalBenefit:          Math.round(rentalBenefit),
    healthInsuranceBenefit: Math.round(healthInsuranceBenefit),
    totalBenefit:           Math.round(totalBenefit),
    // Total Allowance and Bonus
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
    // Tax calculation steps
    taxableIncome:        Math.round(calculationResult.taxableIncome),
    rentalTaxableAmount:  Math.round(calculationResult.rentalTaxableAmount),
    assessableIncome:     Math.round(calculationResult.assessableIncome),
    incomeTax:            Math.round(calculationResult.incomeTax),
    // Employer Costs
    employerUnionFee:     Math.round(calculationResult.unionFeeAmount),
    totalEmployerCost:    Math.round(calculationResult.totalEmployerCost)
  };
}