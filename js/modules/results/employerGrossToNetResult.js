import { TEXT } from '../../../lang/eng.js';
import { renderCostBreakdownChart, destroyChart } from '../../common/charts.js';
import { exportResultToPdf, ensureJsPdfAndHtml2Canvas } from '../../common/pdf.js';

export function renderEmployerGrossToNetResult(root, data) {
  const t = TEXT.employerGrossToNet;
  const resultDiv = document.createElement('div');
  resultDiv.className = 'result';
  resultDiv.id = 'result';
  const employeeTypeLabel = data.taxResidentStatus === 'expat' ? t.results.employeeTypes.expat : t.results.employeeTypes.local;

  resultDiv.innerHTML = `
    <h1 style="text-align:center;margin-bottom:16px;font-size:30px">${t.payslipTitle}</h1>
    <div class="result-table-container">
      <table class="result-table result-table-vertical result-table-bordered employee-table-layout">
        <tr><td colspan="2"><div class="result-title"><u>${employeeTypeLabel}</u></div></td></tr>
        <tr><td colspan="2"><div class="result-title">${t.results.sections.grossSalary}</div><div class="result-center-value">${(data.grossSalary||0).toLocaleString('vi-VN')} VND</div></td></tr>
        <tr><td colspan="2"><div class="result-title">${t.results.sections.adjustedGrossSalary}</div><div class="result-center-value">${(data.adjustedGrossSalary||0).toLocaleString('vi-VN')} VND</div></td></tr>
        <tr><td colspan="2"><div class="result-title">${t.results.sections.employerCost}</div><div class="result-center-value" style="color:#C1272D;">${(data.totalEmployerCost||0).toLocaleString('vi-VN')} VND</div></td></tr>
        <tr><td colspan="2"><div class="result-title">${t.results.sections.employeeTakeHome}</div><div class="result-center-value" style="color:#1a7f3c;">${(data.employerContribution||0).toLocaleString('vi-VN')} VND</div></td></tr>
      </table>
    </div>`;

  const pieChartContainer = document.createElement('div');
  pieChartContainer.className = 'pie-chart-container';
  pieChartContainer.innerHTML = `
    <div id="cost-chart-block">
      <canvas id="cost-breakdown-chart" style="display: none;"></canvas>
      <div id="cost-breakdown-chart-label" style="display: none;">${t.pageTitle}</div>
    </div>`;

  root.appendChild(resultDiv);
  root.appendChild(pieChartContainer);

  const costCanvas = document.getElementById('cost-breakdown-chart');
  const costLabel = document.getElementById('cost-breakdown-chart-label');
  const cb = t.results.costBreakdown;
  renderCostBreakdownChart(costCanvas, [cb.employeeInsurance, cb.personalIncomeTax, cb.employerInsurance, cb.employerUnionFee, cb.netSalary], [data.employeeInsurance||0, data.incomeTax||0, data.employerInsurance||0, data.employerTradeUnionFund||0, data.netSalary||0]);
  costCanvas.style.display = 'block';
  costLabel.style.display = 'block';

  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'simulation-button';
  downloadBtn.textContent = t.buttons.downloadPdf;
  root.appendChild(downloadBtn);
  ensureJsPdfAndHtml2Canvas(() => {});
  downloadBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    ensureJsPdfAndHtml2Canvas(async () => {
      const resultTableContainer = document.querySelector('.result-table-container');
      if (!resultTableContainer) return;
      const exportContainer = document.createElement('div');
      const logo = document.querySelector('.logo');
      const hr = root.querySelector('hr');
      if (logo) exportContainer.appendChild(logo.cloneNode(true));
      const payslipH2 = document.createElement('h1');
      payslipH2.textContent = t.payslipTitle;
      payslipH2.style.textAlign = 'center';
      payslipH2.style.marginBottom = '16px';
      exportContainer.appendChild(payslipH2);
      if (hr) exportContainer.appendChild(hr.cloneNode(true));
      exportContainer.appendChild(resultTableContainer.cloneNode(true));
      document.body.appendChild(exportContainer);
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const filename = `[PCA Salary Simulation]_${day}-${month}-${year}.pdf`;
      await exportResultToPdf({ exportContainer, filename, onComplete: () => { document.body.removeChild(exportContainer); } });
    });
  });
}
