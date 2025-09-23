import { TEXT } from '../../../lang/eng.js';
import { renderSalaryBreakdownChart, renderCostBreakdownChart, destroyChart } from '../../common/charts.js';
import { exportResultToPdf, ensureJsPdfAndHtml2Canvas } from '../../common/pdf.js';

export function renderEmployeeGrossToNetResult(root, data) {
  // Charts container
  const resultDiv = document.createElement('div');
  resultDiv.className = 'result';
  resultDiv.id = 'result';

  const pieChartContainer = document.createElement('div');
  pieChartContainer.className = 'pie-chart-container';
  pieChartContainer.innerHTML = `
    <div id="salary-chart-block">
      <canvas id="salary-breakdown-chart" style="display: none;"></canvas>
      <div id="salary-breakdown-chart-label" style="display: none;">${TEXT.employeeGrossToNet.charts.salaryBreakdown}</div>
    </div>
    <div id="cost-chart-block">
      <canvas id="cost-breakdown-chart" style="display: none;"></canvas>
      <div id="cost-breakdown-chart-label" style="display: none;">${TEXT.employeeGrossToNet.charts.costBreakdown}</div>
    </div>`;

  // Build result table mirroring legacy
  const allowanceItems = [
    { label: TEXT.employeeGrossToNet.steps.allowance.types.lunch, value: data.grossLunchAllowance },
    { label: TEXT.employeeGrossToNet.steps.allowance.types.fuel, value: data.grossFuelAllowance },
    { label: TEXT.employeeGrossToNet.steps.allowance.types.phone, value: data.grossPhoneAllowance },
    { label: TEXT.employeeGrossToNet.steps.allowance.types.travel, value: data.grossTravelAllowance },
    { label: TEXT.employeeGrossToNet.steps.allowance.types.uniform, value: data.grossUniformAllowance },
    { label: TEXT.employeeGrossToNet.steps.allowance.types.other.replace('Allowances',''), value: data.grossOtherAllowance }
  ].filter(item => item.value && item.value > 0);

  const bonusItems = [
    { label: TEXT.employeeGrossToNet.results.totalBonusLabel, value: data.grossTotalBonus }
  ].filter(item => item.value && item.value > 0);

  let allowanceRow = '';
  let bonusRow = '';
  let noAllowanceBonusRow = '';
  if (allowanceItems.length > 0) {
    allowanceRow = `
      <tr>
        <td colspan="2">
          <div class="result-title">Allowances</div>
          <div class="result-list">
            ${allowanceItems.map(item => `<div class="result-item">${item.label}: <span>${item.value.toLocaleString('vi-VN')} VND</span></div>`).join('')}
          </div>
          <hr class="result-divider" />
          <div class="result-total"><span>${data.grossTotalAllowance.toLocaleString('vi-VN')} VND</span></div>
        </td>
      </tr>`;
  }
  if (bonusItems.length > 0) {
    bonusRow = `
      <tr>
        <td colspan="2">
          <div class="result-title">Bonuses</div>
          <div class="result-list">
            ${bonusItems.map(item => `<div class="result-item">${item.label}: <span>${item.value.toLocaleString('vi-VN')} VND</span></div>`).join('')}
          </div>
          <hr class="result-divider" />
          <div class="result-total"><span>${data.grossTotalBonus.toLocaleString('vi-VN')} VND</span></div>
        </td>
      </tr>`;
  }
  if (allowanceItems.length === 0 && bonusItems.length === 0) {
    noAllowanceBonusRow = `
      <tr><td colspan="2"><div class="result-center-value" style="font-size:1em; color:#888;">${TEXT.employeeGrossToNet.results.allowanceOrBonusNone}</div></td></tr>`;
  }

  let employeeTypeLabel = '';
  if (data.citizenship === 'local') employeeTypeLabel = TEXT.employeeGrossToNet.results.employeeTypes.local;
  else if (data.citizenship === 'expat') employeeTypeLabel = TEXT.employeeGrossToNet.results.employeeTypes.expat;
  else employeeTypeLabel = TEXT.employeeGrossToNet.results.employeeTypes.default;

  const employeeTypeCell = `<div class="result-title"><u>${employeeTypeLabel}</u></div>`;
  const grossSalaryCell = `
    <div class="result-title">${TEXT.employeeGrossToNet.results.sections.grossSalary}</div>
    <div class="result-center-value">${data.grossSalary ? data.grossSalary.toLocaleString('vi-VN') + ' ' + TEXT.employeeGrossToNet.currencyUnit : '-'}</div>`;
  const adjustedGrossSalaryCell = `
    <div class="result-title">${TEXT.employeeGrossToNet.results.sections.adjustedGrossSalary}</div>
    <div class="result-center-value">${data.adjustedGrossSalary ? data.adjustedGrossSalary.toLocaleString('vi-VN') + ' ' + TEXT.employeeGrossToNet.currencyUnit : '-'}</div>
    <div style="text-align:center;margin-top:4px;font-size:0.85em;">(${TEXT.employeeGrossToNet.results.totalEmployerCostLabel}: <span style="color:#C1272D;">${data.totalEmployerCost ? data.totalEmployerCost.toLocaleString('vi-VN') + ' ' + TEXT.employeeGrossToNet.currencyUnit : '-'}</span>)</div>`;

  const insuranceItems = [
    { label: 'Social Insurance', value: data.employeeSocialInsurance },
    { label: 'Health Insurance', value: data.employeeHealthInsurance },
    { label: 'Unemployment Insurance', value: data.employeeUnemploymentInsurance }
  ].filter(item => item.value && item.value > 0);
  const insuranceContributionCell = `
    <div class="result-title">${TEXT.employeeGrossToNet.results.sections.compulsoryInsurances}</div>
    <div class="result-list">
      ${insuranceItems.map(item => `<div class="result-item">${item.label}: <span>-${item.value.toLocaleString('vi-VN')} ${TEXT.employeeGrossToNet.currencyUnit}</span></div>`).join('')}
    </div>
    <hr class="result-divider-insurance" />
    <div class="result-center-value"><span>-${data.employeeInsurance.toLocaleString('vi-VN')} ${TEXT.employeeGrossToNet.currencyUnit}</span></div>`;

  const personalIncomeTaxCell = `
    <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100%;min-height:80px;">
      <div class="result-title" style="text-align:center;">${TEXT.employeeGrossToNet.results.sections.personalIncomeTax}</div>
      <div class="result-center-value" style="text-align:center;"><span>-${data.incomeTax.toLocaleString('vi-VN')} ${TEXT.employeeGrossToNet.currencyUnit}</span></div>
    </div>`;

  const employeeContributionRow = `
    <tr><td colspan="2"><div class="result-title">${TEXT.employeeGrossToNet.results.sections.statutoryContribution}</div><div class="result-center-value" style="color:#C1272D;">-${data.employeeContribution.toLocaleString('vi-VN')} ${TEXT.employeeGrossToNet.currencyUnit}</div></td></tr>`;
  const employeeTakeHomeRow = `
    <tr><td colspan="2"><div class="result-title">${TEXT.employeeGrossToNet.results.sections.takeHomeSalary}</div><div class="result-center-value" style="color:#1a7f3c;">${data.netSalary.toLocaleString('vi-VN')} ${TEXT.employeeGrossToNet.currencyUnit}</div></td></tr>`;

  resultDiv.innerHTML = `
    <h1 style="text-align:center;margin-bottom:16px;font-size:30px">${TEXT.employeeGrossToNet.payslipTitle}</h1>
    <div class="result-table-container">
      <table class="result-table result-table-vertical result-table-bordered employee-table-layout">
        <tr><td colspan="2">${employeeTypeCell}</td></tr>
        <tr><td colspan="2">${grossSalaryCell}</td></tr>
        ${allowanceRow}
        ${bonusRow}
        ${!allowanceRow && !bonusRow ? noAllowanceBonusRow : ''}
        <tr><td colspan="2">${adjustedGrossSalaryCell}</td></tr>
        <tr><td style="padding:0;vertical-align:top;">${insuranceContributionCell}</td><td style="padding:0;vertical-align:middle;">${personalIncomeTaxCell}</td></tr>
        ${employeeContributionRow}
        ${employeeTakeHomeRow}
      </table>
    </div>
    <div class="salary-visualization-heading" style="text-align:center;margin:24px 0 0 0;font-size:1.125em;font-weight:bold;">${TEXT.employeeGrossToNet.results.salaryVisualizationTitle}</div>`;

  // Append to root
  root.appendChild(resultDiv);
  root.appendChild(pieChartContainer);

  // Charts
  const salaryCanvas = document.getElementById('salary-breakdown-chart');
  const salaryLabel = document.getElementById('salary-breakdown-chart-label');
  const costCanvas = document.getElementById('cost-breakdown-chart');
  const costLabel = document.getElementById('cost-breakdown-chart-label');

  function updateChartBlockVisibility(showSalary, showCost) {
    const salaryBlock = document.getElementById('salary-chart-block');
    const costBlock = document.getElementById('cost-chart-block');
    if (salaryBlock) salaryBlock.style.display = showSalary ? 'flex' : 'none';
    if (costBlock) costBlock.style.display = showCost ? 'flex' : 'none';
    const container = document.querySelector('.pie-chart-container');
    if (container) container.style.justifyContent = 'center';
  }

  if (!data.grossSalary) {
    destroyChart('salaryChart');
    destroyChart('costBreakdownChart');
    if (salaryCanvas) salaryCanvas.style.display = 'none';
    if (salaryLabel) salaryLabel.style.display = 'none';
    if (costCanvas) costCanvas.style.display = 'none';
    if (costLabel) costLabel.style.display = 'none';
    updateChartBlockVisibility(false, false);
  } else {
    const bonusAndAllowance = data.adjustedGrossSalary - data.grossSalary;
    if (bonusAndAllowance === 0) {
      destroyChart('salaryChart');
      if (salaryCanvas) salaryCanvas.style.display = 'none';
      if (salaryLabel) salaryLabel.style.display = 'none';
      updateChartBlockVisibility(false, true);
    } else {
      renderSalaryBreakdownChart(
        salaryCanvas,
        [TEXT.employeeGrossToNet.charts.bonusAndAllowance, TEXT.employeeGrossToNet.charts.grossSalary],
        [bonusAndAllowance, data.grossSalary]
      );
      if (salaryCanvas) salaryCanvas.style.display = 'block';
      if (salaryLabel) salaryLabel.style.display = 'block';
      updateChartBlockVisibility(true, true);
    }

    const breakdownData = [
      data.employeeInsurance || 0,
      data.incomeTax || 0,
      data.employerInsurance || 0,
      data.employerTradeUnionFund || 0,
      data.netSalary || 0
    ];
    const cb = TEXT.employeeGrossToNet.results.costBreakdown;
    const breakdownLabels = [
      cb.employeeInsurance,
      cb.personalIncomeTax,
      cb.employerInsurance,
      cb.employerUnionFee,
      cb.netSalary
    ];
    renderCostBreakdownChart(costCanvas, breakdownLabels, breakdownData);
    if (costCanvas) costCanvas.style.display = 'block';
    if (costLabel) costLabel.style.display = 'block';
  }

  // Download PDF button
  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'simulation-button';
  downloadBtn.id = 'download-pdf-btn';
  downloadBtn.style.display = 'block';
  downloadBtn.textContent = TEXT.employeeGrossToNet.buttons.downloadPdf;
  root.appendChild(downloadBtn);

  ensureJsPdfAndHtml2Canvas(() => {});
  downloadBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    ensureJsPdfAndHtml2Canvas(async () => {
      const resultTableContainer = document.querySelector('.result-table-container');
      if (!resultTableContainer) return;
      const exportContainer = document.createElement('div');
      exportContainer.className = 'pdf-export-container';
      const logo = document.querySelector('.logo');
      const hr = root.querySelector('hr');
      if (logo) exportContainer.appendChild(logo.cloneNode(true));
      const payslipH2 = document.createElement('h1');
      payslipH2.textContent = TEXT.employeeGrossToNet.payslipTitle;
      payslipH2.style.textAlign = 'center';
      payslipH2.style.marginBottom = '16px';
      exportContainer.appendChild(payslipH2);
      if (hr) exportContainer.appendChild(hr.cloneNode(true));
      exportContainer.appendChild(resultTableContainer.cloneNode(true));
      const footer = document.querySelector('.app-footer');
      if (footer) {
        const footerClone = footer.cloneNode(true);
        footerClone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        footerClone.style.width = '100%';
        exportContainer.appendChild(footerClone);
      }
      document.body.appendChild(exportContainer);
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const filename = `[PCA Salary Simulation]_${day}-${month}-${year}.pdf`;
      await exportResultToPdf({ exportContainer, filename, onComplete: () => { document.body.removeChild(exportContainer); } });
    });
  });

  // Reset and Hard Reset buttons
  const resetBtn = document.createElement('button');
  resetBtn.className = 'simulation-button return-button';
  resetBtn.id = 'reset-btn';
  resetBtn.style.display = 'block';
  resetBtn.type = 'button';
  resetBtn.textContent = TEXT.employeeGrossToNet.buttons.modify;
  root.appendChild(resetBtn);

  const hardResetBtn = document.createElement('button');
  hardResetBtn.className = 'simulation-button return-button';
  hardResetBtn.id = 'hard-reset-btn';
  hardResetBtn.style.display = 'block';
  hardResetBtn.type = 'button';
  hardResetBtn.textContent = TEXT.employeeGrossToNet.buttons.reset;
  root.appendChild(hardResetBtn);

  resetBtn.onclick = () => { window.location.reload(); };
  hardResetBtn.onclick = () => { window.location.reload(); };

  return { resultDiv };
}
