import { simulateSalary } from '../be/cal.js';
import { TEXT } from '../lang/eng.js';
import { exportResultToPdf, buildStandardPdfFilename } from '../module/download-pdf.js';
import { initStandardForm } from '../module/input-form.js';

// ============================================================================
// MIRRORED STRUCTURE (align with employer-gross-to-net)
// ============================================================================
const MIN_SALARY = 4475000;
const MAX_DIGITS = 9;
const TEXT_CONFIG = TEXT.employerNetToGross;
const html = (strings, ...values) => strings.reduce((a,s,i)=>a+s+(values[i]??''),'');
function getElement(id){ return document.getElementById(id); }
function createAndAppend(parent, tag, props = {}, innerHTML=''){ const el=document.createElement(tag); Object.assign(el, props); if(innerHTML) el.innerHTML=innerHTML; parent.appendChild(el); return el; }
function formatCurrency(val){ const unit = TEXT_CONFIG.currencyUnit || 'VND'; return (val||val===0)?`${Number(val).toLocaleString('vi-VN')} ${unit}`:'-'; }

function createTitleBlock(root){ const h1=createAndAppend(root,'h1'); h1.textContent=TEXT_CONFIG.pageTitle; root.appendChild(document.createElement('hr')); return h1; }
function createResultSection(root){ const resultDiv=createAndAppend(root,'div',{className:'result',id:'result','aria-live':'polite'}); return { resultDiv }; }
function createResultButtonsContainer(root){ const container=createAndAppend(root,'div',{className:'result-buttons-container',id:'result-buttons-container'}); const hardResetBtn=createAndAppend(container,'button',{className:'simulation-button return-button',id:'hard-reset-btn',textContent:TEXT_CONFIG.buttons.reset}); const resetBtn=createAndAppend(container,'button',{className:'simulation-button return-button',id:'reset-btn',textContent:TEXT_CONFIG.buttons.modify}); const downloadBtn=createAndAppend(container,'button',{className:'simulation-button',id:'download-pdf-btn',textContent:TEXT_CONFIG.buttons.downloadPdf}); return { buttonContainer:container, downloadBtn, resetBtn, hardResetBtn }; }
function createFooter(root){
  const footer=createAndAppend(root,'footer',{className:'app-footer'});
  footer.innerHTML=html`<hr /><span class="footer-title">${TEXT_CONFIG.footer.importantNoteTitle}</span><div class="footer-text">${TEXT_CONFIG.footer.importantNoteText} <a href="${TEXT_CONFIG.footer.contactUrl}" target="_blank">${TEXT_CONFIG.footer.contactLinkText}</a>.</div><span class="footer-title">${TEXT_CONFIG.footer.disclaimerTitle}</span><div class="footer-text">${TEXT_CONFIG.footer.disclaimerText}</div>`;

  function positionFooter(){
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if(documentHeight <= viewportHeight){
      footer.style.position='fixed';
      footer.style.bottom='1rem';
      footer.style.left='50%';
      footer.style.transform='translateX(-50%)';
      footer.style.zIndex='1000';
      footer.style.margin='2rem auto';
      footer.style.width='70vw';
      const footerHeight=footer.offsetHeight;
      document.body.style.paddingBottom=`${footerHeight + 32}px`;
    } else {
      footer.style.position='';
      footer.style.bottom='';
      footer.style.left='';
      footer.style.transform='';
      footer.style.zIndex='';
      footer.style.marginTop='12rem';
      footer.style.width='';
      document.body.style.paddingBottom='';
    }
  }
  setTimeout(positionFooter,200);
  window.addEventListener('resize',()=>{ setTimeout(positionFooter,100); });
  const observer=new MutationObserver(()=>{ setTimeout(positionFooter,150); });
  observer.observe(root,{ childList:true, subtree:true });
  const progressBar=document.querySelector('#progress-bar');
  if(progressBar){
    const progressObserver=new MutationObserver(()=>{ setTimeout(positionFooter,100); });
    progressObserver.observe(progressBar,{ attributes:true, subtree:true });
  }
  return footer;
}

document.addEventListener('DOMContentLoaded', () => {
  const root = getElement('gross-to-net-root');
  if(!root) return;
  root.innerHTML='';
  const init = initStandardForm({
    rootId: 'gross-to-net-root',
    textConfig: TEXT_CONFIG,
    salaryType: 'net',
    maxDigits: MAX_DIGITS,
    minSalary: MIN_SALARY,
    focusSalaryStepIndex: 1
  });
  if(!init) return;
  const { form: salaryForm, nav } = init;
  const { resultDiv } = createResultSection(root);
  const { buttonContainer, downloadBtn, resetBtn, hardResetBtn } = createResultButtonsContainer(root);
  createFooter(root);
  // nav already provided by initStandardForm

  // Number formatting handled by initStandardForm
  const parseNumber = v => { if(typeof v==='number') return v; if(!v) return 0; return parseFloat(String(v).replace(/[,.]/g,''))||0; };
  const getVal = id => { const el=getElement(id); return el?el.value:''; };

  function cleanupFormAfterCalculation(){ if(salaryForm.parentNode) salaryForm.parentNode.removeChild(salaryForm); const pb=getElement('progress-bar'); if(pb) pb.classList.add('progress-bar-hidden'); }

  function renderResults(data){ const allowanceItems=[{label:TEXT_CONFIG.steps.allowance.types.lunch,value:data.grossLunchAllowance},{label:TEXT_CONFIG.steps.allowance.types.fuel,value:data.grossFuelAllowance},{label:TEXT_CONFIG.steps.allowance.types.phone,value:data.grossPhoneAllowance},{label:TEXT_CONFIG.steps.allowance.types.travel,value:data.grossTravelAllowance},{label:TEXT_CONFIG.steps.allowance.types.uniform,value:data.grossUniformAllowance},{label:TEXT_CONFIG.steps.allowance.types.other,value:data.grossOtherAllowance}].filter(i=>i.value&&i.value>0); const bonusExists=data.grossTotalBonus&&data.grossTotalBonus>0; const benefitItems=[{label:TEXT_CONFIG.steps.benefit.types.childTuition,value:data.childTuitionBenefit},{label:TEXT_CONFIG.steps.benefit.types.rental,value:data.rentalBenefit},{label:TEXT_CONFIG.steps.benefit.types.healthInsurance,value:data.healthInsuranceBenefit}].filter(i=>i.value&&i.value>0); const listRow=(title,items,total)=>!items.length?'':html`<tr><td colspan="2"><div class="result-title">${title}</div><div class="result-list">${items.map(it=>`<div class=\"result-item\">${it.label}: <span>${formatCurrency(it.value)}</span></div>`).join('')}</div><hr class="result-divider"/><div class="result-total"><span>${formatCurrency(total)}</span></div></td></tr>`; const allowanceRow=listRow(TEXT_CONFIG.results.sections.allowance,allowanceItems,data.grossTotalAllowance); const bonusRow=bonusExists?html`<tr><td colspan="2"><div class="result-title">${TEXT_CONFIG.results.sections.bonus}</div><div class="result-title">${formatCurrency(data.grossTotalBonus)}</div></td></tr>`:''; const benefitRow=listRow(TEXT_CONFIG.results.sections.benefit,benefitItems,data.totalBenefit); const noneAllowanceBonus=(!allowanceItems.length&&!bonusExists)?`<tr><td colspan="2"><div class="result-title result-title-muted">${TEXT_CONFIG.warnings.noAllowanceOrBonus}</div></td></tr>`:''; const employeeTypeLabel=TEXT_CONFIG.results.employeeTypes[data.taxResidentStatus]||TEXT_CONFIG.results.employeeTypes.default; const grossSalaryCell=`<div class=\"result-title\">${TEXT_CONFIG.results.sections.grossSalary}</div><div class=\"result-title\">${formatCurrency(data.grossSalary)}</div>`; const adjustedGrossSalaryCell=`<div class=\"result-title\">${TEXT_CONFIG.results.sections.adjustedGrossSalary}</div><div class=\"result-title\">${formatCurrency(data.adjustedGrossSalary)}</div>`; const employeeDetailsCell=html`<div class="result-title">${TEXT_CONFIG.results.sections.employeeTakeHome}</div><div class="result-list"><div class="result-item">${TEXT_CONFIG.results.costBreakdown.socialInsurance}: <span>-${formatCurrency(data.employeeInsurance)}</span></div><div class="result-item">${TEXT_CONFIG.results.costBreakdown.personalIncomeTax}: <span>-${formatCurrency(data.incomeTax)}</span></div></div>`; const employeeTotalCell=`<div class=\"result-title\">${TEXT_CONFIG.results.sections.takeHomeTotal}</div><div class=\"result-total\"><span class=\"employee-total-value\">${formatCurrency(data.netSalary)}</span></div>`; const employerAdjustedGrossSalaryCell=`<div class=\"result-title\">${TEXT_CONFIG.results.employerCostTable.sections.adjustedGrossSalary}</div><div class=\"result-title\">${formatCurrency(data.adjustedGrossSalary)}</div>`; const employerStatutoryRow=`<tr><td colspan=\"2\"><div class=\"result-title\">${TEXT_CONFIG.results.employerCostTable.sections.statutoryContribution}</div><div class=\"result-list\"><div class=\"result-item\">${TEXT_CONFIG.results.costBreakdown.socialInsurance}: <span>+${formatCurrency(data.employerInsurance)}</span></div><div class=\"result-item\">${TEXT_CONFIG.results.costBreakdown.unionFee}: <span>+${formatCurrency(data.employerTradeUnionFund)}</span></div></div></td></tr>`; const employerBenefitRow=benefitItems.length?`<tr><td colspan=\"2\"><div class=\"result-title\">${TEXT_CONFIG.results.employerCostTable.sections.benefit}</div><div class=\"result-list\">${benefitItems.map(it=>`<div class=\"result-item\">${it.label}: <span>${formatCurrency(it.value)}</span></div>`).join('')}</div><hr class=\"result-divider\"/><div class=\"result-total\"><span>${formatCurrency(data.totalBenefit||0)}</span></div></td></tr>`:`<tr><td colspan=\"2\"><div class=\"result-none-text\">${TEXT_CONFIG.results.employerCostTable.noBenefit}</div></td></tr>`; const employerTotalCell=`<div class=\"result-title\">${TEXT_CONFIG.results.employerCostTable.sections.totalEmployerCost}</div><div class=\"result-total\"><span class=\"employer-total-value\">${formatCurrency(data.totalEmployerCost)}</span></div>`; resultDiv.innerHTML=html`<h1 class="result-table-title">${TEXT_CONFIG.payslipTitle}</h1><div class="result-table-container"><table class="result-table result-table-vertical result-table-bordered employer-table-layout payslip-table-layout"><tr><td colspan="2"><div class="result-title">${employeeTypeLabel}</div></td></tr><tr><td colspan="2">${grossSalaryCell}</td></tr>${allowanceRow}${bonusRow}${noneAllowanceBonus}<tr><td colspan="2">${adjustedGrossSalaryCell}</td></tr><tr><td colspan="2">${employeeDetailsCell}</td></tr><tr><td colspan="2">${employeeTotalCell}</td></tr></table></div><h1 class="result-table-title">${TEXT_CONFIG.results.employerCostTable.title}</h1><div class="result-table-container"><table class="result-table result-table-vertical result-table-bordered employer-table-layout employer-cost-table-layout"><tr><td colspan="2">${employerAdjustedGrossSalaryCell}</td></tr>${employerStatutoryRow}${employerBenefitRow}<tr><td colspan="2">${employerTotalCell}</td></tr></table></div>`; }

  function handleCalculation(){ const params={ method:'net-to-gross', netSalary:parseNumber(getVal('net-salary')), taxResidentStatus:getVal('tax-resident-status')||'local', netLunchAllowance:parseNumber(getVal('allowance-lunch')), netFuelAllowance:parseNumber(getVal('allowance-fuel')), netPhoneAllowance:parseNumber(getVal('allowance-phone')), netTravelAllowance:parseNumber(getVal('allowance-travel')), netUniformAllowance:parseNumber(getVal('allowance-uniform')), netOtherAllowance:parseNumber(getVal('allowance-other')), netTotalBonus:parseNumber(getVal('total-bonus')), childTuitionBenefit:parseNumber(getVal('benefit-child-tuition')), rentalBenefit:parseNumber(getVal('benefit-rental')), healthInsuranceBenefit:parseNumber(getVal('benefit-health-insurance')) }; const data=simulateSalary(params); if(data && data.error){ resultDiv.innerHTML=`<span class="result-error-text">${data.error}</span>`; buttonContainer.classList.remove('show'); return; } cleanupFormAfterCalculation(); renderResults(data); buttonContainer.classList.add('show'); setupResetHandlers(); }

  function setupResetHandlers(){ resetBtn.onclick=()=>{ resultDiv.innerHTML=''; buttonContainer.classList.remove('show'); if(!document.getElementById('salary-form')) root.insertBefore(salaryForm, resultDiv); const pb=getElement('progress-bar'); if(pb) pb.classList.remove('progress-bar-hidden'); nav.goTo(0); }; hardResetBtn.onclick=()=>window.location.reload(); }
  getElement('calculate-btn').addEventListener('click', e=>{ e.preventDefault(); handleCalculation(); });

  function setupDownloadButton(){ const btn=downloadBtn; btn.addEventListener('click', async e=>{ e.preventDefault(); const resultContainers=Array.from(document.querySelectorAll('.result-table-container')); if(!resultContainers.length) return; const exportContainer=document.createElement('div'); exportContainer.className='pdf-export-container export-a4'; const logo=document.querySelector('.logo'); if(logo) exportContainer.appendChild(logo.cloneNode(true)); const headerTitle=document.createElement('h1'); headerTitle.textContent=(TEXT.index&&TEXT.index.title)||'Salary Simulation Tool'; headerTitle.className='pdf-export-title'; exportContainer.appendChild(headerTitle); const hr=document.querySelector('hr'); if(hr) exportContainer.appendChild(hr.cloneNode(true)); const payslipTitle=document.createElement('h1'); payslipTitle.textContent=TEXT_CONFIG.payslipTitle; payslipTitle.className='pdf-export-title'; exportContainer.appendChild(payslipTitle); exportContainer.appendChild(resultContainers[0].cloneNode(true)); if(resultContainers[1]){ const ecTitle=document.createElement('h1'); ecTitle.textContent=TEXT_CONFIG.results.employerCostTable.title; ecTitle.className='pdf-export-title'; exportContainer.appendChild(ecTitle); exportContainer.appendChild(resultContainers[1].cloneNode(true)); } const exportFooter=document.createElement('footer'); exportFooter.className='app-footer export-footer'; exportFooter.appendChild(document.createElement('hr')); const importantTitle=document.createElement('span'); importantTitle.className='footer-title'; importantTitle.textContent=TEXT_CONFIG.footer.importantNoteTitle; exportFooter.appendChild(importantTitle); const importantText=document.createElement('div'); importantText.className='footer-text'; importantText.textContent=TEXT_CONFIG.footer.importantNoteText+' '; const contactSpan=document.createElement('span'); contactSpan.textContent=TEXT_CONFIG.footer.contactLinkText; importantText.appendChild(contactSpan); importantText.appendChild(document.createTextNode('.')); exportFooter.appendChild(importantText); const disclaimerTitle=document.createElement('span'); disclaimerTitle.className='footer-title'; disclaimerTitle.textContent=TEXT_CONFIG.footer.disclaimerTitle; exportFooter.appendChild(disclaimerTitle); const disclaimerText=document.createElement('div'); disclaimerText.className='footer-text'; disclaimerText.textContent=TEXT_CONFIG.footer.disclaimerText; exportFooter.appendChild(disclaimerText); const idDiv=document.createElement('div'); idDiv.className='export-id'; idDiv.textContent='ID: '+Date.now(); exportFooter.appendChild(idDiv); const versionDiv=document.createElement('div'); versionDiv.className='version-display'; versionDiv.textContent=TEXT.version||''; exportFooter.appendChild(versionDiv); exportContainer.appendChild(exportFooter); document.body.appendChild(exportContainer); const filename=buildStandardPdfFilename(); await exportResultToPdf({ exportContainer, filename, onComplete:()=>{ if(exportContainer.parentNode) exportContainer.parentNode.removeChild(exportContainer);} }); }); }
  setupDownloadButton();
  (function showVersion(){ if(document.querySelector('.version-display')) return; const v=document.createElement('div'); v.className='version-display'; v.textContent=TEXT.version||''; document.body.appendChild(v); })();
});