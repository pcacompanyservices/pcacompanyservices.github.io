// Centralized result table renderer for salary simulations
// Usage: import { renderResultTables } from '../module/result-table.js';
// renderResultTables({ root, data, textConfig, mode: 'employee' | 'employer' });
// Produces one or two .result-table-container blocks appended to root.resultDiv
import { TEXT } from '../lang/eng.js';

const html = (strings, ...values) => strings.reduce((a,s,i)=>a+s+(values[i]??''),'');

function formatCurrency(val, unit){
  return (val||val===0) ? `${Number(val).toLocaleString('vi-VN')} ${unit}` : '-';
}

function buildAllowanceList(data, cfg, grossPrefix='gross') {
  const map = [
    ['Lunch', 'lunchAllowance', 'grossLunchAllowance'],
    ['Fuel', 'fuelAllowance', 'grossFuelAllowance'],
    ['Phone', 'phoneAllowance', 'grossPhoneAllowance'],
    ['Travel', 'travelAllowance', 'grossTravelAllowance'],
    ['Uniform', 'uniformAllowance', 'grossUniformAllowance'],
    ['Other', 'otherAllowance', 'grossOtherAllowance']
  ];
  return map.map(([key, netKey, grossKey])=>{
    const label = cfg.steps.allowance.types[key.toLowerCase()] || key;
    const val = data[grossKey];
    return (val && val>0) ? { label, value: val } : null;
  }).filter(Boolean);
}

function buildBenefitList(data, cfg){
  const list = [
    ['childTuition','childTuitionBenefit'],
    ['rental','rentalBenefit'],
    ['healthInsurance','healthInsuranceBenefit']
  ];
  return list.map(([k, dk])=>{
    const label = cfg.steps.benefit.types[k];
    const val = data[dk];
    return (val && val>0) ? { label, value: val } : null;
  }).filter(Boolean);
}

function allowanceBonusRows({ allowanceItems, bonusValue, cfg, unit }) {
  let rows = '';
  if(allowanceItems.length) {
    rows += html`<tr><td colspan="2"><div class="result-title">${cfg.results.sections.allowance}</div><div class="result-list">${allowanceItems.map(it=>`<div class=\"result-item\">${it.label}: <span>${formatCurrency(it.value, unit)}</span></div>`).join('')}</div><hr class="result-divider"/><div class="result-total"><span>${formatCurrency(allowanceItems.reduce((s,i)=>s+i.value,0), unit)}</span></div></td></tr>`;
  }
  if(bonusValue && bonusValue>0) {
    rows += html`<tr><td colspan="2"><div class="result-title">${cfg.results.sections.bonus}</div><div class="result-title">${formatCurrency(bonusValue, unit)}</div></td></tr>`;
  }
  if(!allowanceItems.length && (!bonusValue || bonusValue<=0)) {
    rows += html`<tr><td colspan="2"><div class="result-title result-title-muted">${cfg.results.allowanceOrBonusNone || cfg.warnings.noAllowanceOrBonus}</div></td></tr>`;
  }
  return rows;
}

// Legacy employee payslip layout (restored for employee paths)
function buildEmployeePayslipTable({ data, cfg, unit }) {
  // Allowances list (only non-zero)
  const allowanceItems = [
    { key: 'lunch', label: cfg.steps.allowance.types.lunch, value: data.grossLunchAllowance },
    { key: 'fuel', label: cfg.steps.allowance.types.fuel, value: data.grossFuelAllowance },
    { key: 'phone', label: cfg.steps.allowance.types.phone, value: data.grossPhoneAllowance },
    { key: 'travel', label: cfg.steps.allowance.types.travel, value: data.grossTravelAllowance },
    { key: 'uniform', label: cfg.steps.allowance.types.uniform, value: data.grossUniformAllowance },
    { key: 'other', label: cfg.steps.allowance.types.other, value: data.grossOtherAllowance }
  ].filter(it => it.value && it.value > 0);

  const bonusItems = [
    { label: cfg.results.totalBonusLabel, value: data.grossTotalBonus }
  ].filter(it => it.value && it.value > 0);

  let allowanceRow = '';
  let bonusRow = '';
  let noAllowanceBonusRow = '';
  if (allowanceItems.length) {
    allowanceRow = html`<tr><td colspan="2"><div class="result-title">${cfg.results.sections.allowance}</div><div class="result-list">${allowanceItems.map(it=>`<div class=\"result-item\">${it.label}: <span>${formatCurrency(it.value, unit)}</span></div>`).join('')}</div><hr class="result-divider" /><div class="result-total"><span>${formatCurrency(data.grossTotalAllowance, unit)}</span></div></td></tr>`;
  }
  if (bonusItems.length) {
    // Simplified bonus layout: title then amount (stacked)
    bonusRow = html`<tr><td colspan="2"><div class="result-title">${cfg.results.sections.bonus}</div><div class="result-title result-tight">${formatCurrency(data.grossTotalBonus, unit)}</div></td></tr>`;
  }
  if (!allowanceItems.length && !bonusItems.length) {
    noAllowanceBonusRow = html`<tr><td colspan="2"><div class="result-none-text">${cfg.results.allowanceOrBonusNone}</div></td></tr>`;
  }

  const employeeTypeLabel = cfg.results.employeeTypes[data.taxResidentStatus] || cfg.results.employeeTypes.default;
  const employeeTypeCell = html`<div class="result-title">${employeeTypeLabel}</div>`;

  const grossSalaryCell = html`<div class="result-title mb-0">${cfg.results.sections.grossSalary}</div><div class="result-title result-tight">${data.grossSalary ? formatCurrency(data.grossSalary, unit) : '-'}</div>`;

  const benefitSum = (data.childTuitionBenefit || 0) + (data.rentalBenefit || 0) + (data.healthInsuranceBenefit || 0);
  const adjustedGrossSalaryCell = html`<div class="adjusted-gross-cell"><div class="result-title mb-0">${cfg.results.sections.adjustedGrossSalary}</div><div class="result-title result-tight">${data.adjustedGrossSalary ? formatCurrency(data.adjustedGrossSalary, unit) : '-'}</div><div class="result-note">(${cfg.results.totalEmployerCostLabel}: <span class="text-red">${data.totalEmployerCost ? formatCurrency(data.totalEmployerCost, unit) : '-'}</span>${benefitSum > 0 ? ' ' + cfg.results.totalEmployerCostBenefitIncluded : ''})</div></div>`;

  const insuranceItems = [
    { label: cfg.results.costBreakdown.socialInsurance, value: data.employeeSocialInsurance },
    { label: cfg.results.costBreakdown.healthInsurance || cfg.steps.benefit?.types?.healthInsurance, value: data.employeeHealthInsurance },
    { label: cfg.results.costBreakdown.unemploymentInsurance, value: data.employeeUnemploymentInsurance }
  ].filter(it => it.value && it.value > 0);
  const insuranceContributionCell = html`<div class="result-title">${cfg.results.sections.compulsoryInsurances}</div><div class="result-list">${insuranceItems.map(it=>`<div class=\"result-item\">${it.label}: <span>-${formatCurrency(it.value, unit)}</span></div>`).join('')}</div><hr class="result-divider-insurance" /><div class="result-title"><span>-${formatCurrency(data.employeeInsurance, unit)}</span></div>`;

  const personalIncomeTaxCell = html`<div class="flex-col-center-80"><div class="result-title center">${cfg.results.sections.personalIncomeTax}</div><div class="result-title center"><span>-${formatCurrency(data.incomeTax, unit)}</span></div></div>`;

  const employeeContributionRow = html`<tr><td colspan="2"><div class="result-title mb-0">${cfg.results.sections.statutoryContribution || cfg.results.sections.employeeTakeHome}</div><div class="result-title text-red result-tight">-${formatCurrency(data.employeeContribution, unit)}</div></td></tr>`;

  const takeHomeLabel = cfg.results.sections.takeHomeTotal || cfg.results.sections.takeHomeSalary || cfg.results.sections.takeHome; // fallbacks
  const employeeTakeHomeRow = html`<tr><td colspan="2"><div class="result-title mb-0">${takeHomeLabel}</div><div class="result-title text-green result-tight">${formatCurrency(data.netSalary, unit)}</div></td></tr>`;

  return html`<h1 class="result-table-title">${cfg.payslipTitle}</h1><div class="result-table-container"><table class="result-table result-table-vertical result-table-bordered employee-table-layout"><tr><td colspan="2">${employeeTypeCell}</td></tr><tr><td colspan="2">${grossSalaryCell}</td></tr>${allowanceRow}${bonusRow}${(!allowanceRow && !bonusRow) ? noAllowanceBonusRow : ''}<tr><td colspan="2">${adjustedGrossSalaryCell}</td></tr><tr><td class="p-0 va-top">${insuranceContributionCell}</td><td class="p-0 va-middle">${personalIncomeTaxCell}</td></tr>${employeeContributionRow}${employeeTakeHomeRow}</table></div>`;
}

function buildPayslipTable({ data, cfg, unit, mode }) {
  const allowanceItems = buildAllowanceList(data, cfg);
  const bonusValue = data.grossTotalBonus || data.netTotalBonus || data.grossTotalBonus || 0;
  const allowanceBonus = allowanceBonusRows({ allowanceItems, bonusValue, cfg, unit });
  const employeeTypeLabel = cfg.results.employeeTypes[data.taxResidentStatus] || cfg.results.employeeTypes.default;
  const grossLabel = cfg.results.sections.grossSalary;
  const grossVal = formatCurrency(data.grossSalary, unit);
  const adjustedLabel = cfg.results.sections.adjustedGrossSalary;
  const adjustedVal = formatCurrency(data.adjustedGrossSalary, unit);
  const contributionLabel = cfg.results.sections.employeeTakeHome;
  const takeHomeLabel = cfg.results.sections.takeHomeTotal;
  const employeeInsuranceVal = formatCurrency(data.employeeInsurance, unit);
  const incomeTaxVal = formatCurrency(data.incomeTax, unit);
  const netVal = formatCurrency(data.netSalary, unit);
  const contributionRow = html`<tr><td colspan="2"><div class="result-title">${cfg.results.sections.statutoryContribution}</div><div class="result-title text-red">-${employeeInsuranceVal.replace(unit,'').trim() ? employeeInsuranceVal : '-'}</div></td></tr>`;
  // Employer path: replicate legacy layout (minus sign tight, take-home uses result-total wrapper with span)
  const employeeDetailRow = mode==='employer'
    ? html`<tr><td colspan="2"><div class="result-title">${contributionLabel}</div><div class="result-list"><div class="result-item">${cfg.results.costBreakdown.socialInsurance}: <span>-${employeeInsuranceVal}</span></div><div class="result-item">${cfg.results.costBreakdown.personalIncomeTax}: <span>-${incomeTaxVal}</span></div></div></td></tr>`
    : '';
  const takeHomeRow = mode==='employer'
    ? html`<tr><td colspan="2"><div class="result-title">${takeHomeLabel}</div><div class="result-total"><span class="employee-total-value">${netVal}</span></div></td></tr>`
    : html`<tr><td colspan="2"><div class="result-title">${takeHomeLabel}</div><div class="result-title text-green">${netVal}</div></td></tr>`;
  const baseRows = html`
    <tr><td colspan="2"><div class="result-title">${employeeTypeLabel}</div></td></tr>
    <tr><td colspan="2"><div class="result-title">${grossLabel}</div><div class="result-title">${grossVal}</div></td></tr>
    ${allowanceBonus}
    <tr><td colspan="2"><div class="result-title">${adjustedLabel}</div><div class="result-title">${adjustedVal}</div></td></tr>
    ${mode==='employer' ? employeeDetailRow + takeHomeRow : contributionRow + takeHomeRow}
  `;
  return html`
  <h1 class="result-table-title">${cfg.payslipTitle}</h1>
  <div class="result-table-container"><table class="result-table result-table-vertical result-table-bordered ${mode}-table-layout payslip-table-layout">${baseRows}</table></div>`;
}

function buildEmployerCostTable({ data, cfg, unit }) {
  const benefitItems = buildBenefitList(data, cfg);
  const benefitLabel = cfg.results.sections.benefit;
  const benefitRows = benefitItems.length
    ? html`<tr><td colspan="2"><div class="result-title">${benefitLabel}</div><div class="result-list">${benefitItems.map(it=>`<div class=\"result-item\">${it.label}: <span>${formatCurrency(it.value, unit)}</span></div>`).join('')}</div><hr class="result-divider"/><div class="result-total"><span>${formatCurrency(benefitItems.reduce((s,i)=>s+i.value,0),unit)}</span></div></td></tr>`
    : html`<tr><td colspan="2"><div class="result-none-text">${cfg.results.employerCostTable.noBenefit}</div></td></tr>`;
  const statutory = html`<tr><td colspan="2"><div class="result-title">${cfg.results.employerCostTable.sections.statutoryContribution}</div><div class="result-list"><div class="result-item">${cfg.results.costBreakdown.socialInsurance}: <span>+${formatCurrency(data.employerInsurance, unit)}</span></div><div class="result-item">${cfg.results.costBreakdown.unionFee}: <span>+${formatCurrency(data.employerTradeUnionFund, unit)}</span></div></div></td></tr>`;
  const adjusted = html`<tr><td colspan="2"><div class="result-title">${cfg.results.employerCostTable.sections.adjustedGrossSalary}</div><div class="result-title">${formatCurrency(data.adjustedGrossSalary,unit)}</div></td></tr>`;
  const total = html`<tr><td colspan="2"><div class="result-title">${cfg.results.employerCostTable.sections.totalEmployerCost}</div><div class="result-total"><span class="text-red">${formatCurrency(data.totalEmployerCost,unit)}</span></div></td></tr>`;
  return html`<h1 class="result-table-title">${cfg.results.employerCostTable.title}</h1><div class="result-table-container"><table class="result-table result-table-vertical result-table-bordered employer-table-layout employer-cost-table-layout">${adjusted}${statutory}${benefitRows}${total}</table></div>`;
}

export function renderResultTables({ root, data, textConfig, mode='employee' }) {
  if(!root) return;
  const unit = textConfig.currencyUnit || 'VND';
  let payslip;
  if(mode === 'employee') {
    payslip = buildEmployeePayslipTable({ data, cfg: textConfig, unit });
  } else {
    payslip = buildPayslipTable({ data, cfg: textConfig, unit, mode });
  }
  let employerCost = '';
  if(mode==='employer') {
    employerCost = buildEmployerCostTable({ data, cfg: textConfig, unit });
  }
  root.innerHTML = payslip + employerCost;
  return root;
}
