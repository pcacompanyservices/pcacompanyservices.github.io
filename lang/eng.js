// Centralized English language pack
// Note: Wording is preserved per page to avoid behavior/style changes.

// Shared footer for all calculators (canonical content based on Employer pages)
const html = (strings, ...values) => strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');

const SHARED_CALC_FOOTER = {
  importantNoteTitle: 'IMPORTANT NOTE',
  importantNoteText: 'This simulation assumes a standard labor contract with a duration exceeding three months for a Vietnamese Tax Resident and applies to Region I (including Hanoi and Ho Chi Minh City). All amounts are in Vietnamese Dong (VND). Calculations reflect the latest regulations effective 1 July 2025. No dependent deductions are included for Personal Income Tax purposes other than the personal deduction. For further information, please',
  contactLinkText: 'contact us',
  contactUrl: 'https://pca-cs.com/contact/',
  disclaimerTitle: 'DISCLAIMER',
  disclaimerText:
    'The information provided in this simulation is for general informational purposes only. ' +
    'It does not constitute legal advice and does not create a service-provider/client relationship. ' +
    'While we make every effort to ensure accuracy, no warranty, whether express or implied, is given as to correctness or completeness. ' +
    'We accept no responsibility for any errors or omissions. ' +
    'We are not liable for any loss or damage, including but not limited to loss of business or profits, ' +
    'arising from the use of or reliance on this simulation, whether in contract, tort, or otherwise.'
};

// HTML-formatted tooltips for Tax Resident Status (preserves bullet/paragraph formatting)
const TAX_RESIDENT_STATUS_TOOLTIP_HTML_EMPLOYEE = html`
  <p>You are a Vietnamese Tax Resident if you meet any of the following criteria:</p>
  <ul>
    <li>Residing in Vietnam for 183 days or more in either (i) the calendar year or (ii) any 12-month period beginning from your date of arrival.</li>
    <li>Having a permanent residence in Vietnam (including (i) a registered residence recorded on the permanent/temporary residence card, or (ii) leased accommodation in Vietnam under a lease of 183 days or more within the tax year, for foreigners) and unable to substantiate tax residency in another country.</li>
  </ul>
  <p>Individuals not meeting these conditions are considered <strong>Tax Non-Residents</strong> in Vietnam and are outside the scope of this simulation.</p>
  <p>If you are a Vietnamese Tax Resident, choose your status based on nationality: &lsquo;Local&rsquo; for Vietnamese citizens; &lsquo;Expat&rsquo; for non‑Vietnamese citizens.</p>
`;

const TAX_RESIDENT_STATUS_TOOLTIP_HTML_EMPLOYER = html`
  <p>Your Employee is a Vietnamese Tax Resident if they meet any of the following criteria:</p>
  <ul>
    <li>Residing in Vietnam for 183 days or more in either (i) the calendar year or (ii) any 12-month period beginning from their date of arrival.</li>
    <li>Having a permanent residence in Vietnam (including (i) a registered residence recorded on the permanent/temporary residence card, or (ii) leased accommodation in Vietnam under a lease of 183 days or more within the tax year, for foreigners) and unable to substantiate tax residency in another country.</li>
  </ul>
  <p>Individuals not meeting these conditions are considered <strong>Tax Non-Residents</strong> in Vietnam and are outside the scope of this simulation.</p>
  <p>If your Employee is a Vietnamese Tax Resident, choose their status based on nationality: &lsquo;Local&rsquo; for Vietnamese citizens; &lsquo;Expat&rsquo; for non‑Vietnamese citizens.</p>
`;

export const TEXT = {
  version: 'Version: 1.1.39',
  // Generic defaults used as final fallback by shared modules (no UI string hard-coded in modules)
  defaults: {
    statusTitle: 'Status',
    selectPlaceholder: 'Select...',
    localOption: 'Local',
    expatOption: 'Expat',
    baseSalaryTitle: 'Base Salary',
    allowanceTitle: 'Allowance',
    bonusTitle: 'Bonus',
    benefitTitle: 'Benefit',
    maxDigitsWarning: 'Maximum digits reached',
    totalBonusPlaceholder: 'Total bonus (VND)',
    childTuition: "Child's Tuition Fee",
    rental: 'Rental',
  healthInsurance: 'Health Insurance',
	idLabel: 'ID:',
  appTitle: 'Salary Simulation Tool',
  allowanceTypes: { lunch: 'Lunch', fuel: 'Fuel', phone: 'Phone', travel: 'Travel', uniform: 'Uniform', other: 'Other Allowance' },
    pdf: {
      filenamePrefix: '[PCA_Salary_Simulation]',
      errorLibs: 'PDF export libraries not available',
      errorScriptPrefix: 'Failed loading'
    }
  },
  sharedFooter: SHARED_CALC_FOOTER,
  index: {
    title: 'Salary Simulation Tool',
    footer: {
      disclaimerTitle: 'DISCLAIMER',
      disclaimerText:
        'The information provided in this simulation is for general informational purposes only. It does not constitute legal advice and does not create a service-provider/client relationship. While we make every effort to ensure accuracy, no warranty, whether express or implied, is given as to correctness or completeness. We accept no responsibility for any errors or omissions. We are not liable for any loss or damage, including but not limited to loss of business or profits, arising from the use of or reliance on this simulation, whether in contract, tort, or otherwise.',
      terms: { checkboxLabel: 'I have read and agree to the terms and conditions', warning: 'Please read and agree to our terms and conditions.' }
    },
    home: {
      buttons: {
        employee: { text: "I'm an Employee", info: 'You have a job.' },
        freelancer: { text: "I'm a freelancer", info: 'Coming soon.' },
        employer: { text: "I'm an Employer", info: 'You are hiring an Employee.' },
        employeeGrossToNet: { text: 'Calculate from your Gross Salary', info: 'Calculate take-home salary from your gross salary.' },
        employeeNetToGross: { text: 'Calculate from your Net Salary', info: 'Calculate gross salary from how much you want to take home.' },
        employerFromGross: { text: 'Calculate from Gross Salary', info: "Calculate your Employee's cost from gross salary." },
        employerFromNet: { text: 'Calculate from Net Salary', info: "Calculate your Employee's cost from take-home salary." },
        return: 'Return'
      }
    }
  },

  // 1) Employer – Gross to Net
  employerGrossToNet: {
    pageTitle: "Calculate from Employee's Gross Salary",
    payslipTitle: 'PAYSLIP',
    progressSteps: { taxResidentStatus: 'Status', grossSalary: 'Base Salary', allowance: 'Allowance', bonus: 'Bonus', benefit: 'Benefit' },
    steps: {
      taxResidentStatus: { title: 'Tax Resident Status', tooltip: TAX_RESIDENT_STATUS_TOOLTIP_HTML_EMPLOYER, selectPlaceholder: "Select your Employee's Tax Resident status", options: { local: 'Local – Tax Resident', expat: 'Expat – Tax Resident' }, continue: 'Continue' },
      grossSalary: { title: 'Gross Base Salary', tooltip: "Enter your Employee's monthly gross (contract) salary. Minimum 5.000.000 VND.", placeholder: 'Min 5.000.000 VND', warningMaxDigits: 'Maximum 9 digits allowed.', continue: 'Continue' },
      allowance: {
        title: 'Allowance',
        tooltip: "Enter your Employee's monthly allowances as per the labor contract. Amounts above statutory caps may be taxable.",
        hasAllowanceLabel: 'There are Allowances in the Contract',
        warningMaxDigits: 'Maximum 9 digits allowed.',
        types: { lunch: 'Lunch', fuel: 'Fuel', phone: 'Phone', travel: 'Travel', uniform: 'Uniform', other: 'Other Allowance' },
        placeholders: { lunch: 'Lunch allowance (VND)', fuel: 'Fuel allowance (VND)', phone: 'Phone allowance (VND)', travel: 'Travel allowance (VND)', uniform: 'Uniform allowance (VND)', other: 'Other allowance (VND)' },
        tooltips: {
          lunch: "Specify your Employee's monthly lunch allowance in the contract.",
          fuel: "Specify your Employee's monthly fuel allowance in the contract.",
          phone: "Specify your Employee's monthly phone allowance in the contract.",
          travel: "Specify your Employee's monthly travel allowance in the contract.",
          uniform: "Specify your Employee's monthly uniform allowance in the contract.",
          other: 'Enter any other allowances for your Employee in the contract that are not listed above.'
        },
        continue: 'Continue'
      },
  // Shared single total bonus input
  bonus: { title: 'Bonus', tooltip: "Enter your Employee's total monthly bonuses as per the labor contract (e.g., performance, KPI). Enter 0 if none.", warningMaxDigits: 'Maximum 9 digits allowed.', placeholder: 'Total bonus (VND)' },
      // Shared benefit structure reused across paths
      benefit: {
        title: 'Benefit',
  tooltip: 'Enter benefits provided by the Employer (e.g., Rental, Health Insurance, Child’s Tuition). For Health Insurance, enter the annual fee.',
        warningMaxDigits: 'Maximum 9 digits allowed.',
        types: { childTuition: "Child's Tuition Fee", rental: 'Rental', healthInsurance: 'Health Insurance' },
        placeholders: { childTuition: "Child's tuition fee (VND)", rental: 'Rental benefit (VND)', healthInsurance: 'Health insurance annual fee (VND)' },
        tooltips: {
          childTuition: "Specify your Employee's child's tuition fee benefit.",
          rental: "Specify your Employee's monthly rental benefit.",
          healthInsurance: "Specify your Employee's annual Health Insurance fee."
        }
      }
    },
    buttons: { continue: 'Continue', calculate: 'Calculate', return: 'Return', reset: 'Reset', modify: 'Modify Information', downloadPdf: 'Download PDF' },
    warnings: { maxDigits: 'Maximum 9 digits allowed.', noAllowanceOrBonus: '(There is no Allowance or Bonus in the Contract)' },
    results: {
      employeeTypes: { local: 'Local Employee – Tax Resident', expat: 'Expat Employee – Tax Resident', default: 'Employee' },
      sections: {
        grossSalary: 'Gross Base Salary',
        adjustedGrossSalary: 'Adjusted Gross Salary',
        allowance: 'Allowance',
        bonus: 'Bonus',
        benefit: 'Benefit',
        employerCost: 'Employer Cost',
        employeeTakeHome: 'Statutory Contribution',
        takeHomeTotal: 'Employee Take-home'
      },
      costBreakdown: {
        socialInsurance: 'Social Insurance',
        healthInsurance: 'Health Insurance',
        unemploymentInsurance: 'Unemployment Insurance',
        unionFee: 'Trade Union Fund',
        personalIncomeTax: 'Personal Income Tax',
        netSalary: 'Employee Take-home (Net) Salary',
        employerInsurance: 'Employer Insurance',
        employerUnionFee: 'Employer Trade Union Fund',
        employeeInsurance: 'Employee Insurance'
      },
      salaryVisualizationTitle: 'Salary Visualization',
      allowanceOrBonusNone: '(There is no Allowance or Bonus in the Contract)',
      totalBonusLabel: 'Total Bonus',
      totalEmployerCostLabel: "Total Employer's Cost",
      totalEmployerCostBenefitIncluded: '– Benefit included',
      employerCostTable: {
        title: "EMPLOYER'S COST",
        sections: {
          adjustedGrossSalary: 'Adjusted Gross Salary',
          statutoryContribution: 'Statutory Contribution',
          benefit: 'Benefit',
          totalEmployerCost: "Total Employer's Cost"
        },
        noBenefit: '(There is no Benefit in the Contract)'
      }
    },
    infoTooltips: {
  taxResidentStatus: TAX_RESIDENT_STATUS_TOOLTIP_HTML_EMPLOYER,
      grossSalary: "Enter your Employee's monthly gross (contract) salary. Minimum 5.000.000 VND.",
      allowance: "Enter your Employee's monthly allowances as per the labor contract. Amounts above statutory caps may be taxable.",
      bonus: "Enter your Employee's total monthly bonuses as per the labor contract (e.g., performance, KPI). Enter 0 if none.",
  benefit: "Enter benefits provided by the Employer (e.g., Rental, Health Insurance, Child’s Tuition). For Health Insurance, enter the annual fee.",
      lunch: "Specify your Employee's monthly lunch allowance in the contract.",
      fuel: "Specify your Employee's monthly fuel allowance in the contract.",
      phone: "Specify your Employee's monthly phone allowance in the contract.",
      travel: "Specify your Employee's monthly travel allowance in the contract.",
      uniform: "Specify your Employee's monthly uniform allowance in the contract.",
      otherAllowance: "Enter any other allowances for your Employee in the contract that are not listed above.",
    childTuition: "Specify your Employee's child's tuition fee benefit.",
    rental: "Specify your Employee's monthly rental benefit.",
  healthInsurance: "Specify your Employee's annual Health Insurance fee."
    },
    footer: SHARED_CALC_FOOTER,
    currencyUnit: 'VND'
  },

  // 2) Employer – Net to Gross
  employerNetToGross: {
    pageTitle: "Calculate from Employee's Net Salary",
    payslipTitle: 'PAYSLIP',
    progressSteps: { taxResidentStatus: 'Status', netSalary: 'Base Salary', allowance: 'Allowance', bonus: 'Bonus', benefit: 'Benefit' },
    steps: {
  taxResidentStatus: { title: 'Tax Resident Status', tooltip: TAX_RESIDENT_STATUS_TOOLTIP_HTML_EMPLOYER, selectPlaceholder: "Select your Employee's Tax Resident status", options: { local: 'Local – Tax Resident', expat: 'Expat – Tax Resident' }, continue: 'Continue' },
  netSalary: { title: 'Net Base Salary', tooltip: "Enter your Employee's desired monthly net (take-home) salary. Minimum 4.475.000 VND.", placeholder: 'Min 4.475.000 VND', warningMaxDigits: 'Maximum 9 digits allowed.', continue: 'Continue' },
      allowance: { title: 'Allowance', tooltip: "Enter your Employee's monthly allowances in net amounts (after tax). The calculator will gross them up.", hasAllowanceLabel: 'There are Allowances in the Contract', warningMaxDigits: 'Maximum 9 digits allowed.', types: { lunch: 'Lunch', fuel: 'Fuel', phone: 'Phone', travel: 'Travel', uniform: 'Uniform', other: 'Other Allowance' }, placeholders: { lunch: 'Net lunch allowance (VND)', fuel: 'Net fuel allowance (VND)', phone: 'Net phone allowance (VND)', travel: 'Net travel allowance (VND)', uniform: 'Net uniform allowance (VND)', other: 'Net other allowance (VND)' }, tooltips: { lunch: "Specify your Employee's monthly lunch allowance in the contract.", fuel: "Specify your Employee's monthly fuel allowance in the contract.", phone: "Specify your Employee's monthly phone allowance in the contract.", travel: "Specify your Employee's monthly travel allowance in the contract.", uniform: "Specify your Employee's monthly uniform allowance in the contract.", other: 'Enter any other allowances for your Employee in the contract that are not listed above.' } },
  bonus: { title: 'Bonus', tooltip: "Enter your Employee's total monthly bonuses in net amounts (after tax). The calculator will gross them up. Enter 0 if none.", warningMaxDigits: 'Maximum 9 digits allowed.', placeholder: 'Total bonus (VND)' },
      benefit: {
        title: 'Benefit',
  tooltip: 'Enter benefits provided by the Employer (e.g., Rental, Health Insurance, Child’s Tuition). For Health Insurance, enter the annual fee.',
        warningMaxDigits: 'Maximum 9 digits allowed.',
        types: { childTuition: "Child's Tuition Fee", rental: 'Rental', healthInsurance: 'Health Insurance' },
        placeholders: { childTuition: "Child's tuition fee (VND)", rental: 'Rental benefit (VND)', healthInsurance: 'Health insurance annual fee (VND)' }
      }
    },
    buttons: { continue: 'Continue', calculate: 'Calculate', return: 'Return', reset: 'Reset', modify: 'Modify Information', downloadPdf: 'Download PDF' },
    warnings: { maxDigits: 'Maximum 9 digits allowed.', noAllowanceOrBonus: '(There is no Allowance or Bonus in the Contract)' },
    results: {
      employeeTypes: { local: 'Local Employee – Tax Resident', expat: 'Expat Employee – Tax Resident', default: 'Employee' },
      sections: {
        grossSalary: 'Gross Base Salary',
        adjustedGrossSalary: 'Adjusted Gross Salary',
        allowance: 'Allowance',
        bonus: 'Bonus',
        benefit: 'Benefit',
        employerCost: 'Employer Cost',
        employeeTakeHome: 'Statutory Contribution',
        takeHomeTotal: 'Employee Take-home'
      },
      costBreakdown: {
        socialInsurance: 'Social Insurance',
        healthInsurance: 'Health Insurance',
        unemploymentInsurance: 'Unemployment Insurance',
        unionFee: 'Trade Union Fund',
        personalIncomeTax: 'Personal Income Tax',
        netSalary: 'Employee Take-home (Net) Salary',
        employerInsurance: 'Employer Insurance',
        employerUnionFee: 'Employer Trade Union Fund',
        employeeInsurance: 'Employee Insurance'
      },
      salaryVisualizationTitle: 'Salary Visualization',
      allowanceOrBonusNone: '(There is no Allowance or Bonus in the Contract)',
      totalBonusLabel: 'Total Bonus',
      totalEmployerCostLabel: "Total Employer's Cost",
      totalEmployerCostBenefitIncluded: '– Benefit included',
      employerCostTable: {
        title: "EMPLOYER'S COST",
        sections: {
          adjustedGrossSalary: 'Adjusted Gross Salary',
          statutoryContribution: 'Statutory Contribution',
          benefit: 'Benefit',
          totalEmployerCost: "Total Employer's Cost"
        },
        noBenefit: '(There is no Benefit in the Contract)'
      }
    },
    infoTooltips: {
      taxResidentStatus: TAX_RESIDENT_STATUS_TOOLTIP_HTML_EMPLOYER,
      netSalary: "Enter your Employee's desired monthly net (take-home) salary. Minimum 4.475.000 VND.",
      allowance: "Enter your Employee's monthly allowances in net amounts (after tax). The calculator will gross them up.",
      bonus: "Enter your Employee's total monthly bonuses in net amounts (after tax). The calculator will gross them up.",
  benefit: "Enter benefits provided by the Employer (e.g., Rental, Health Insurance, Child’s Tuition). For Health Insurance, enter the annual fee.",
      lunch: "Specify your Employee's monthly lunch allowance in the contract.",
      fuel: "Specify your Employee's monthly fuel allowance in the contract.",
      phone: "Specify your Employee's monthly phone allowance in the contract.",
      travel: "Specify your Employee's monthly travel allowance in the contract.",
      uniform: "Specify your Employee's monthly uniform allowance in the contract.",
      otherAllowance: "Enter any other allowances for your Employee in the contract that are not listed above.",
    childTuition: "Specify your Employee's child's tuition fee benefit.",
    rental: "Specify your Employee's monthly rental benefit.",
  healthInsurance: "Specify your Employee's annual Health Insurance fee."
    },
    footer: SHARED_CALC_FOOTER,
    currencyUnit: 'VND'
  },

  // 3) Employee – Gross to Net
  employeeGrossToNet: {
    pageTitle: 'Calculate from your Gross Salary',
    progressSteps: { taxResidentStatus: 'Status', grossSalary: 'Base Salary', allowance: 'Allowance', bonus: 'Bonus', benefit: 'Benefit' },
    steps: {
      taxResidentStatus: { title: 'Tax Resident Status', tooltip: TAX_RESIDENT_STATUS_TOOLTIP_HTML_EMPLOYEE, selectPlaceholder: 'Select your Tax Resident status', options: { local: 'Local – Tax Resident', expat: 'Expat – Tax Resident' }, continue: 'Continue' },
      grossSalary: { title: 'Gross Base Salary', tooltip: 'Enter your gross (contract) salary.', placeholder: 'Min 5.000.000 VND', warningMaxDigits: 'Maximum 9 digits allowed.', continue: 'Continue' },
      allowance: {
        title: 'Allowance',
        tooltip: 'Enter your monthly allowances as per your labor contract. Amounts above statutory caps may be taxable.',
        hasAllowanceLabel: 'There are Allowances in the Contract',
        warningMaxDigits: 'Maximum 9 digits allowed.',
        types: { lunch: 'Lunch', fuel: 'Fuel', phone: 'Phone', travel: 'Travel', uniform: 'Uniform', other: 'Other Allowance' },
        tooltips: {
          lunch: 'Specify your monthly allowance for lunch in the contract.',
          fuel: 'Specify your monthly allowance for fuel in the contract.',
          phone: 'Specify your monthly allowance for phone in the contract.',
          travel: 'Specify your monthly allowance for traveling in the contract.',
          uniform: 'Specify your monthly allowance for uniform in the contract.',
          other: 'Enter any other allowances in the contract that are not listed above.'
        },
        placeholders: {
          lunch: 'Lunch allowance (VND)',
          fuel: 'Fuel allowance (VND)',
          phone: 'Phone allowance (VND)',
          travel: 'Travel allowance (VND)',
          uniform: 'Uniform allowance (VND)',
          other: 'Other allowance (VND)'
        },
        continue: 'Continue'
      },
  bonus: { title: 'Bonus', tooltip: 'Enter your total monthly bonuses as per your labor contract (e.g., performance, KPI). Enter 0 if none.', warningMaxDigits: 'Maximum 9 digits allowed.', placeholder: 'Total bonus (VND)' },
      benefit: {
        title: 'Benefit',
  tooltip: 'Enter benefits provided by the Employer (e.g., Rental, Health Insurance, Child’s Tuition). For Health Insurance, enter the annual fee.',
        warningMaxDigits: 'Maximum 9 digits allowed.',
        types: { childTuition: "Child's Tuition Fee", rental: 'Rental', healthInsurance: 'Health Insurance' },
        placeholders: { childTuition: "Child's tuition fee (VND)", rental: 'Rental benefit (VND)', healthInsurance: 'Health insurance annual fee (VND)' },
        tooltips: {
          childTuition: "Specify your monthly child's tuition fee benefit in the contract.",
          rental: 'Specify your monthly rental benefit in the contract.',
          healthInsurance: 'Specify your annual Health Insurance fee in the contract.'
        }
      }
    },
  buttons: { continue: 'Continue', calculate: 'Calculate', return: 'Return', downloadPdf: 'Download PDF', modify: 'Modify Information', reset: 'Reset' },
    warnings: { maxDigits: 'Maximum 9 digits allowed.', noAllowanceOrBonus: '(There is no Allowance or Bonus in the Contract)' },
    infoTooltips: {
      taxResidentStatus: TAX_RESIDENT_STATUS_TOOLTIP_HTML_EMPLOYEE,
      grossSalary: 'Enter your gross (contract) salary.',
      allowance: 'Enter your monthly allowances as per your labor contract. Amounts above statutory caps may be taxable.',
      bonus: 'Enter your total monthly bonuses as per your labor contract (e.g., performance, KPI). Enter 0 if none.',
  benefit: 'Enter benefits provided by the Employer (e.g., Rental, Health Insurance, Child’s Tuition). For Health Insurance, enter the annual fee.',
      lunch: 'Specify your monthly allowance for lunch in the contract.',
      fuel: 'Specify your monthly allowance for fuel in the contract.',
      phone: 'Specify your monthly allowance for phone in the contract.',
      travel: 'Specify your monthly allowance for traveling in the contract.',
      uniform: 'Specify your monthly allowance for uniform in the contract.',
      otherAllowance: 'Enter any other allowances in the contract that are not listed above.',
  childTuition: "Specify your monthly child's tuition fee benefit.",
  rental: 'Specify your monthly rental benefit.',
  healthInsurance: 'Specify your annual Health Insurance fee.'
    },
    charts: { salaryBreakdown: 'Salary Breakdown', costBreakdown: 'Cost Breakdown', bonusAndAllowance: 'Bonuses & Allowances', grossSalary: 'Gross Salary' },
  results: { employeeTypes: { local: 'Local Employee – Tax Resident', expat: 'Expat Employee – Tax Resident', default: 'Employee' }, sections: { grossSalary: 'Gross Salary', adjustedGrossSalary: 'Adjusted Gross Salary', allowance: 'Allowance', bonus: 'Bonus', benefit: 'Benefit', employerCost: 'Employer Cost', employeeTakeHome: 'Statutory Contribution', takeHomeTotal: 'Take-home Salary', compulsoryInsurances: 'Compulsory Insurances', personalIncomeTax: 'Personal Income Tax', statutoryContribution: 'Statutory Contribution' }, allowanceOrBonusNone: '(There is no Allowance or Bonus in the Contract)', costBreakdown: { employeeInsurance: 'Employee Insurance', socialInsurance: 'Social Insurance', healthInsurance: 'Health Insurance', unemploymentInsurance: 'Unemployment Insurance', personalIncomeTax: 'Personal Income Tax', employerInsurance: 'Employer Insurance', employerUnionFee: 'Employer Trade Union Fund', netSalary: 'Employee Take-home (Net) Salary' }, salaryVisualizationTitle: 'Salary Visualization', totalBonusLabel: 'Total Bonus', totalEmployerCostLabel: 'Total Employer Cost', totalEmployerCostBenefitIncluded: '– Benefit included', employerCostTable: { title: "EMPLOYER'S COST", sections: { adjustedGrossSalary: 'Adjusted Gross Salary', statutoryContribution: 'Statutory Contribution', benefit: 'Benefit', totalEmployerCost: 'Total Employer Cost' }, noBenefit: '(There is no Benefit in the Contract)' } },
    currencyUnit: 'VND',
    payslipTitle: 'PAYSLIP',
    footer: SHARED_CALC_FOOTER
  },

  // 4) Employee – Net to Gross
  employeeNetToGross: {
    pageTitle: 'Calculate from your Net Salary',
    progressSteps: { taxResidentStatus: 'Status', netSalary: 'Base Salary', allowance: 'Allowance', bonus: 'Bonus', benefit: 'Benefit' },
    steps: {
      taxResidentStatus: { title: 'Tax Resident Status', tooltip: TAX_RESIDENT_STATUS_TOOLTIP_HTML_EMPLOYEE, selectPlaceholder: 'Select your Tax Resident status', options: { local: 'Local – Tax Resident', expat: 'Expat – Tax Resident' }, continue: 'Continue' },
      netSalary: { title: 'Net Base Salary', tooltip: 'Enter your net (take-home) salary.', placeholder: 'Min 4.475.000 VND', warningMaxDigits: 'Maximum 9 digits allowed.', continue: 'Continue' },
      allowance: {
        title: 'Allowance',
        tooltip: 'Enter your monthly allowances in net amounts (after tax). The calculator will gross them up.',
        hasAllowanceLabel: 'There are Allowances in the Contract',
        warningMaxDigits: 'Maximum 9 digits allowed.',
        types: { lunch: 'Lunch', fuel: 'Fuel', phone: 'Phone', travel: 'Travel', uniform: 'Uniform', other: 'Other Allowance' },
        tooltips: {
          lunch: 'Specify your monthly allowance for lunch in the contract.',
          fuel: 'Specify your monthly allowance for fuel in the contract.',
          phone: 'Specify your monthly allowance for phone in the contract.',
          travel: 'Specify your monthly allowance for traveling in the contract.',
          uniform: 'Specify your monthly allowance for uniform in the contract.',
          other: 'Enter any other allowances in the contract that are not listed above.'
        },
        placeholders: {
          lunch: 'Lunch allowance (VND)',
          fuel: 'Fuel allowance (VND)',
          phone: 'Phone allowance (VND)',
          travel: 'Travel allowance (VND)',
          uniform: 'Uniform allowance (VND)',
          other: 'Other allowance (VND)'
        }
      },
  bonus: { title: 'Bonus', tooltip: 'Enter your total monthly bonuses in net amounts (after tax). The calculator will gross them up. Enter 0 if none.', warningMaxDigits: 'Maximum 9 digits allowed.', placeholder: 'Total bonus (VND)' },
      benefit: {
        title: 'Benefit',
  tooltip: 'Enter benefits provided by the Employer (e.g., Rental, Health Insurance, Child’s Tuition). For Health Insurance, enter the annual fee.',
        warningMaxDigits: 'Maximum 9 digits allowed.',
        types: { childTuition: "Child's Tuition Fee", rental: 'Rental', healthInsurance: 'Health Insurance' },
        placeholders: { childTuition: "Child's tuition fee (VND)", rental: 'Rental benefit (VND)', healthInsurance: 'Health insurance annual fee (VND)' }
      }
    },
  buttons: { continue: 'Continue', calculate: 'Calculate', return: 'Return', downloadPdf: 'Download PDF', modify: 'Modify Information', reset: 'Reset' },
    warnings: { maxDigits: 'Maximum 9 digits allowed.', noAllowanceOrBonus: '(There is no Allowance or Bonus in the Contract)' },
    infoTooltips: {
      taxResidentStatus: TAX_RESIDENT_STATUS_TOOLTIP_HTML_EMPLOYEE,
      netSalary: 'Enter your net (take-home) salary.',
      allowance: 'Enter your monthly allowances in net amounts (after tax). The calculator will gross them up.',
      bonus: 'Enter your total monthly bonuses in net amounts (after tax). The calculator will gross them up. Enter 0 if none.',
  benefit: 'Enter benefits provided by the Employer (e.g., Rental, Health Insurance, Child’s Tuition). For Health Insurance, enter the annual fee.',
      lunch: 'Specify your monthly allowance for lunch in the contract.',
      fuel: 'Specify your monthly allowance for fuel in the contract.',
      phone: 'Specify your monthly allowance for phone in the contract.',
      travel: 'Specify your monthly allowance for traveling in the contract.',
      uniform: 'Specify your monthly allowance for uniform in the contract.',
      otherAllowance: 'Enter any other allowances in the contract that are not listed above.',
  childTuition: "Specify your monthly child's tuition fee benefit.",
  rental: 'Specify your monthly rental benefit.',
  healthInsurance: 'Specify your annual Health Insurance fee.'
    },
    charts: { salaryBreakdown: 'Salary Breakdown', costBreakdown: 'Cost Breakdown', bonusAndAllowance: 'Bonuses & Allowances', grossSalary: 'Gross Salary' },
  results: { employeeTypes: { local: 'Local Employee – Tax Resident', expat: 'Expat Employee – Tax Resident', default: 'Employee' }, sections: { grossSalary: 'Gross Salary', adjustedGrossSalary: 'Adjusted Gross Salary', allowance: 'Allowance', bonus: 'Bonus', benefit: 'Benefit', employerCost: 'Employer Cost', employeeTakeHome: 'Statutory Contribution', takeHomeTotal: 'Take-home Salary', compulsoryInsurances: 'Compulsory Insurances', personalIncomeTax: 'Personal Income Tax', statutoryContribution: 'Statutory Contribution' }, allowanceOrBonusNone: '(There is no Allowance or Bonus in the Contract)', costBreakdown: { employeeInsurance: 'Employee Insurance', socialInsurance: 'Social Insurance', healthInsurance: 'Health Insurance', unemploymentInsurance: 'Unemployment Insurance', personalIncomeTax: 'Personal Income Tax', employerInsurance: 'Employer Insurance', employerUnionFee: 'Employer Trade Union Fund', netSalary: 'Employee Take-home (Net) Salary' }, salaryVisualizationTitle: 'Salary Visualization', totalBonusLabel: 'Total Bonus', totalEmployerCostLabel: 'Total Employer Cost', totalEmployerCostBenefitIncluded: '– Benefit included', employerCostTable: { title: "EMPLOYER'S COST", sections: { adjustedGrossSalary: 'Adjusted Gross Salary', statutoryContribution: 'Statutory Contribution', benefit: 'Benefit', totalEmployerCost: 'Total Employer Cost' }, noBenefit: '(There is no Benefit in the Contract)' } },
    currencyUnit: 'VND',
    payslipTitle: 'PAYSLIP',
    footer: SHARED_CALC_FOOTER
  }
};

export default TEXT;
