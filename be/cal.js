const baseWage = 2340000;
const regionalMinimum = 4960000;

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

const socialHealthCapSalaryForInsurance   = 20 * baseWage; 
const unemploymentCapSalaryForInsurance   = 20 * regionalMinimum; 
const lunchCap                            = 730000; 
const uniformCap                          = 5000000 / 12;
const taxRate = [
  { max: 5000000,   rate: 0.05, reduce:       0 },
  { max: 10000000,  rate: 0.10, reduce:  250000 },
  { max: 18000000,  rate: 0.15, reduce:  750000 },
  { max: 32000000,  rate: 0.20, reduce: 1650000 },
  { max: 52000000,  rate: 0.25, reduce: 3250000 },
  { max: 80000000,  rate: 0.30, reduce: 5850000 },
  { max: Infinity,  rate: 0.35, reduce: 9850000 }
];

const tradeUnionFund = 0.02;
const personalDeduction = 11000000;

function getRoundedValue(value, enabled) {
  if (!enabled) return 0;
  if (value === null || value === undefined || value === '') return 0;
  const parsed = parseFloat((value + '').replace(/[,.]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

function calculateFromGross(grossSalary, totalBonusAndAllowance, lunchAllowance, phoneAllowance, uniformAllowance, rentalBenefit, totalBenefit, taxResidentStatus) {
  const adjustedGrossSalary = grossSalary + totalBonusAndAllowance;

  const employeeSocialInsurance = Math.min(grossSalary, socialHealthCapSalaryForInsurance) * insuranceRate.employee.social;
  const employeeHealthInsurance = Math.min(grossSalary, socialHealthCapSalaryForInsurance) * insuranceRate.employee.health;
  const employeeUnemploymentInsurance =
    taxResidentStatus === 'local' ? Math.min(grossSalary, unemploymentCapSalaryForInsurance) * insuranceRate.employee.unemployment : 0;
  const employeeInsurance = employeeSocialInsurance + employeeHealthInsurance + employeeUnemploymentInsurance;

  const employerSocialInsurance = Math.min(grossSalary, socialHealthCapSalaryForInsurance) * insuranceRate.employer.social;
  const employerHealthInsurance = Math.min(grossSalary, socialHealthCapSalaryForInsurance) * insuranceRate.employer.health;
  const employerUnemploymentInsurance =
    taxResidentStatus === 'local' ? Math.min(grossSalary, unemploymentCapSalaryForInsurance) * insuranceRate.employer.unemployment : 0;
  const employerInsurance = employerSocialInsurance + employerHealthInsurance + employerUnemploymentInsurance;

  const taxableIncome =
    adjustedGrossSalary -
    phoneAllowance -
    Math.min(lunchAllowance, lunchCap) -
    Math.min(uniformAllowance, uniformCap);

  const rentalTaxableAmount = Math.min(taxableIncome * 0.15, rentalBenefit);
  const assessableIncome = taxableIncome + rentalTaxableAmount - employeeInsurance - personalDeduction;

  let incomeTax = 0;
  if (assessableIncome > 0) {
    for (const bracket of taxRate) {
      if (assessableIncome <= bracket.max) {
        incomeTax = assessableIncome * bracket.rate - bracket.reduce;
        break;
      }
    }
  }

  const netSalary = adjustedGrossSalary - employeeInsurance - incomeTax;
  
  const tradeUnionFundAmount = Math.min(grossSalary, socialHealthCapSalaryForInsurance) * tradeUnionFund;
  
  const totalEmployerCost = adjustedGrossSalary + employerInsurance + tradeUnionFundAmount + totalBenefit;

  const employeeContribution = employeeInsurance + incomeTax;
  const employerContribution = employerInsurance + tradeUnionFundAmount;

  return {
    adjustedGrossSalary,
    employeeSocialInsurance,
    employeeHealthInsurance,
    employeeUnemploymentInsurance,
    employeeInsurance,
    employerSocialInsurance,
    employerHealthInsurance,
    employerUnemploymentInsurance,
    employerInsurance,
    employeeContribution,
    employerContribution,
    taxableIncome,
    rentalTaxableAmount,
    assessableIncome,
    incomeTax,
    netSalary,
    tradeUnionFundAmount,
    totalEmployerCost
  };
}

/**
 * Calculate payroll (gross-to-net or net-to-gross).
 */
export function simulateSalary(params) {
  const method = params.method || 'gross-to-net';

  const childTuitionBenefit    = getRoundedValue(params.childTuitionBenefit, params.childTuitionBenefit > 0);
  const rentalBenefit          = getRoundedValue(params.rentalBenefit, params.rentalBenefit > 0);
  const healthInsuranceBenefit = getRoundedValue(params.healthInsuranceBenefit, params.healthInsuranceBenefit > 0) / 12;
  const totalBenefit = childTuitionBenefit + rentalBenefit + healthInsuranceBenefit;

  const taxResidentStatus = params.taxResidentStatus || 'local';

  let grossSalary, grossLunchAllowance, grossFuelAllowance, grossPhoneAllowance, grossTravelAllowance, grossUniformAllowance, grossOtherAllowance, grossTotalBonus;
  let netSalary, netLunchAllowance, netFuelAllowance, netPhoneAllowance, netTravelAllowance, netUniformAllowance, netOtherAllowance, netTotalBonus;
  let calculationResult;

  if (method === 'gross-to-net') {
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

    // Step 1: Handle tax-exempt allowances (phone is fully exempt, others have caps)
    grossPhoneAllowance = netPhoneAllowance; // Phone allowance is fully tax-exempt
    
    // For lunch and uniform: if below cap, they're exempt (gross = net)
    // If above cap, only the excess is taxable
    grossLunchAllowance = netLunchAllowance <= lunchCap ? netLunchAllowance : netLunchAllowance;
    grossUniformAllowance = netUniformAllowance <= uniformCap ? netUniformAllowance : netUniformAllowance;
    
    // Step 2: Calculate exempt portions
    const exemptLunchAmount = Math.min(grossLunchAllowance, lunchCap);
    const exemptUniformAmount = Math.min(grossUniformAllowance, uniformCap);
    const exemptAllowanceTotal = grossPhoneAllowance + exemptLunchAmount + exemptUniformAmount;
    
    // Step 3: Calculate taxable net amounts (what needs gross calculation)
    const taxableNetLunch = netLunchAllowance > lunchCap ? netLunchAllowance - lunchCap : 0;
    const taxableNetUniform = netUniformAllowance > uniformCap ? netUniformAllowance - uniformCap : 0;
    const taxableNetTotal = netSalary + netFuelAllowance + netTravelAllowance + netOtherAllowance + netTotalBonus + taxableNetLunch + taxableNetUniform;
    
    // Step 4: Use bisection to find the gross amount that yields the target taxable net
    function computeNetFromGross(testGrossSalary, testGrossFuel, testGrossTravel, testGrossOther, testGrossBonus, testTaxableLunch, testTaxableUniform) {
      const totalTestGrossLunch = exemptLunchAmount + testTaxableLunch;
      const totalTestGrossUniform = exemptUniformAmount + testTaxableUniform;
      const testGrossBonusAndAllowance = testGrossFuel + testGrossTravel + testGrossOther + testGrossBonus + totalTestGrossLunch + totalTestGrossUniform + grossPhoneAllowance;
      
      const result = calculateFromGross(testGrossSalary, testGrossBonusAndAllowance, totalTestGrossLunch, grossPhoneAllowance, totalTestGrossUniform, rentalBenefit, totalBenefit, taxResidentStatus);
      return result.netSalary;
    }
    
    // Initial estimate
    let low = 1.0, high = 2.5;
    let found = false;
    const tolerance = 0.5;
    
    for (let i = 0; i < 50; i++) {
      const mid = (low + high) / 2;
      
      const testGrossSalary = netSalary * mid;
      const testGrossFuel = netFuelAllowance * mid;
      const testGrossTravel = netTravelAllowance * mid;
      const testGrossOther = netOtherAllowance * mid;
      const testGrossBonus = netTotalBonus * mid;
      const testTaxableLunch = taxableNetLunch * mid;
      const testTaxableUniform = taxableNetUniform * mid;
      
      const calculatedTotalNet = computeNetFromGross(testGrossSalary, testGrossFuel, testGrossTravel, testGrossOther, testGrossBonus, testTaxableLunch, testTaxableUniform);
      const difference = calculatedTotalNet - targetTotalNet;

      if (Math.abs(difference) <= tolerance) {
        found = true;
        grossSalary = testGrossSalary;
        grossFuelAllowance = testGrossFuel;
        grossTravelAllowance = testGrossTravel;
        grossOtherAllowance = testGrossOther;
        grossTotalBonus = testGrossBonus;
        
        // Reconstruct final gross allowances
        grossLunchAllowance = exemptLunchAmount + testTaxableLunch;
        grossUniformAllowance = exemptUniformAmount + testTaxableUniform;
        break;
      }

      if (difference > 0) {
        high = mid;
      } else {
        low = mid;
      }
    }
    
    if (!found) {
      // Fallback to final calculated values
      const finalMid = (low + high) / 2;
      grossSalary = netSalary * finalMid;
      grossFuelAllowance = netFuelAllowance * finalMid;
      grossTravelAllowance = netTravelAllowance * finalMid;
      grossOtherAllowance = netOtherAllowance * finalMid;
      grossTotalBonus = netTotalBonus * finalMid;
      grossLunchAllowance = exemptLunchAmount + (taxableNetLunch * finalMid);
      grossUniformAllowance = exemptUniformAmount + (taxableNetUniform * finalMid);
    }

    const grossTotalAllowance = grossLunchAllowance + grossFuelAllowance + grossPhoneAllowance + grossTravelAllowance + grossUniformAllowance + grossOtherAllowance;
    const grossTotalBonusAndAllowance = grossTotalAllowance + grossTotalBonus;

    calculationResult = calculateFromGross(grossSalary, grossTotalBonusAndAllowance, grossLunchAllowance, grossPhoneAllowance, grossUniformAllowance, rentalBenefit, totalBenefit, taxResidentStatus);

  } else {
    return { error: 'Unknown calculation method.' };
  }

  const grossTotalAllowance = grossLunchAllowance + grossFuelAllowance + grossPhoneAllowance + grossTravelAllowance + grossUniformAllowance + grossOtherAllowance;
  const grossTotalBonusAndAllowance = grossTotalAllowance + grossTotalBonus;
  const netTotalAllowance = netLunchAllowance + netFuelAllowance + netPhoneAllowance + netTravelAllowance + netUniformAllowance + netOtherAllowance;
  const netTotalBonusAndAllowance = netTotalAllowance + netTotalBonus;

  const percentGrossSalary = (grossSalary / calculationResult.adjustedGrossSalary) * 100;
  const percentBonusAndAllowance = (grossTotalBonusAndAllowance / calculationResult.adjustedGrossSalary) * 100;

  return {
    taxResidentStatus: taxResidentStatus,
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
    netSalary:         Math.round(calculationResult.netSalary),
    netBaseSalary:     Math.round(netSalary),
    netLunchAllowance:   Math.round(netLunchAllowance),
    netFuelAllowance:    Math.round(netFuelAllowance),
    netPhoneAllowance:   Math.round(netPhoneAllowance),
    netTravelAllowance:  Math.round(netTravelAllowance),
    netUniformAllowance: Math.round(netUniformAllowance),
    netOtherAllowance:   Math.round(netOtherAllowance),
    netTotalAllowance:   Math.round(netTotalAllowance),
    netTotalBonus:       Math.round(netTotalBonus),
    netTotalBonusAndAllowance: Math.round(netTotalBonusAndAllowance),
    lunchAllowance:   Math.round(grossLunchAllowance),
    fuelAllowance:    Math.round(grossFuelAllowance),
    phoneAllowance:   Math.round(grossPhoneAllowance),
    travelAllowance:  Math.round(grossTravelAllowance),
    uniformAllowance: Math.round(grossUniformAllowance),
    otherAllowance:   Math.round(grossOtherAllowance),
    totalAllowance:   Math.round(grossTotalAllowance),
    totalBonus:       Math.round(grossTotalBonus),
    totalBonusAndAllowance: Math.round(grossTotalBonusAndAllowance),
    childTuitionBenefit:    Math.round(childTuitionBenefit),
    rentalBenefit:          Math.round(rentalBenefit),
    healthInsuranceBenefit: Math.round(healthInsuranceBenefit),
    totalBenefit:           Math.round(totalBenefit),
    percentGrossSalary:        Math.round(percentGrossSalary * 100) / 100,
    percentBonusAndAllowance:  Math.round(percentBonusAndAllowance * 100) / 100,
    employeeSocialInsurance:       Math.round(calculationResult.employeeSocialInsurance),
    employeeHealthInsurance:       Math.round(calculationResult.employeeHealthInsurance),
    employeeUnemploymentInsurance: Math.round(calculationResult.employeeUnemploymentInsurance),
    employeeInsurance:             Math.round(calculationResult.employeeInsurance),
    employerSocialInsurance:       Math.round(calculationResult.employerSocialInsurance),
    employerHealthInsurance:       Math.round(calculationResult.employerHealthInsurance),
    employerUnemploymentInsurance: Math.round(calculationResult.employerUnemploymentInsurance),
    employerInsurance:             Math.round(calculationResult.employerInsurance),
    employeeContribution: Math.round(calculationResult.employeeContribution),
    employerContribution: Math.round(calculationResult.employerContribution),
    taxableIncome:        Math.round(calculationResult.taxableIncome),
    rentalTaxableAmount:  Math.round(calculationResult.rentalTaxableAmount),
    assessableIncome:     Math.round(calculationResult.assessableIncome),
    incomeTax:            Math.round(calculationResult.incomeTax),
    employerTradeUnionFund: Math.round(calculationResult.tradeUnionFundAmount),
    totalEmployerCost:    Math.round(calculationResult.totalEmployerCost)
  };
}