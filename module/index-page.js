import { TEXT } from '../lang/eng.js';
import { createPageHeader } from './header.js';

const html = (strings, ...values) => strings.reduce((acc,str,i)=> acc+str+(values[i]||''),'');
let termsAgreed = false;

function showTermsWarning(){ const w=document.getElementById('terms-warning'); if(w) w.classList.add('show'); }
function hideTermsWarning(){ const w=document.getElementById('terms-warning'); if(w) w.classList.remove('show'); }
function handleTermsChange(e){ termsAgreed = e.target.checked; if(termsAgreed) hideTermsWarning(); else window.location.reload(); }

function createDisclaimer(){
  const footer=document.createElement('footer'); footer.className='app-footer';
  footer.innerHTML = html`<span class="footer-title">${TEXT.index.footer.disclaimerTitle}</span><div class="footer-text">${TEXT.index.footer.disclaimerText}</div><div class="terms-agreement"><label class="checkbox-label"><input type="checkbox" id="terms-checkbox" class="terms-checkbox"><span class="checkbox-text">${TEXT.index.footer.terms.checkboxLabel}</span></label><div id="terms-warning" class="terms-warning">${TEXT.index.footer.terms.warning}</div></div>`;
  document.body.appendChild(footer);
  const cb=document.getElementById('terms-checkbox'); if(cb) cb.addEventListener('change', handleTermsChange);
}

function createVersionDisplay(){
  if(document.querySelector('.version-display')) return;
  const v=document.createElement('div'); v.className='version-display'; v.textContent=(TEXT && TEXT.version)||''; document.body.appendChild(v);
}

function clearSimulationLists(){ document.querySelectorAll('.simulation-list').forEach(el=>el.remove()); }

function createButton({ value, text, info, enabled=true, onClick, extraClass='' }){
  const div=document.createElement('div'); div.className='simulation-list';
  const btn=document.createElement('button'); btn.type='button'; btn.value=value; btn.className=`simulation-button${extraClass? ' '+extraClass:''}`;
  btn.innerHTML=html`${text}<span class="info-box">${info}</span>`;
  if(!enabled || extraClass.includes('unavailable')){ btn.disabled=true; btn.setAttribute('aria-disabled','true'); }
  else if(typeof onClick==='function'){ btn.addEventListener('click', ev=>{ if(!termsAgreed){ ev.preventDefault(); showTermsWarning(); return; } onClick(ev); }); }
  div.appendChild(btn); return div;
}

function createBackButton(onClick){
  const div=document.createElement('div'); div.className='simulation-list';
  const btn=document.createElement('button'); btn.type='button'; btn.className='simulation-button return-button';
  btn.textContent = TEXT.index.home.buttons.return;
  btn.addEventListener('click', onClick);
  div.appendChild(btn); return div;
}

export function initIndexPage(){
  const root = document.getElementById('simulation-root');
  createPageHeader({ root, title: TEXT.index.title });

  function renderInitialButtons(){
    clearSimulationLists();
    root.appendChild(createButton({ value:'employee', text:TEXT.index.home.buttons.employee.text, info:TEXT.index.home.buttons.employee.info, enabled:true, onClick: employeeHandler }));
    root.appendChild(createButton({ value:'freelancer', text:TEXT.index.home.buttons.freelancer.text, info:TEXT.index.home.buttons.freelancer.info, enabled:true, extraClass:'unavailable'}));
    root.appendChild(createButton({ value:'employer', text:TEXT.index.home.buttons.employer.text, info:TEXT.index.home.buttons.employer.info, enabled:true, onClick: employerHandler }));
  }
  function employeeHandler(){
    clearSimulationLists();
    root.appendChild(createButton({ value:'gross-to-net', text:TEXT.index.home.buttons.employeeGrossToNet.text, info:TEXT.index.home.buttons.employeeGrossToNet.info, enabled:true, onClick: ()=>{ window.location.href='employee-gross-to-net.html'; }, extraClass:'employee-choice'}));
    root.appendChild(createButton({ value:'net-to-gross', text:TEXT.index.home.buttons.employeeNetToGross.text, info:TEXT.index.home.buttons.employeeNetToGross.info, enabled:true, onClick: ()=>{ window.location.href='employee-net-to-gross.html'; }, extraClass:'employee-choice'}));
    root.appendChild(createBackButton(renderInitialButtons));
  }
  function employerHandler(){
    clearSimulationLists();
    root.appendChild(createButton({ value:'from-gross', text:TEXT.index.home.buttons.employerFromGross.text, info:TEXT.index.home.buttons.employerFromGross.info, enabled:true, onClick: ()=>{ window.location.href='employer-gross-to-net.html'; }, extraClass:'employer-choice'}));
    root.appendChild(createButton({ value:'from-net', text:TEXT.index.home.buttons.employerFromNet.text, info:TEXT.index.home.buttons.employerFromNet.info, enabled:true, onClick: ()=>{ window.location.href='employer-net-to-gross.html'; }, extraClass:'employer-choice'}));
    root.appendChild(createBackButton(renderInitialButtons));
  }
  renderInitialButtons();
  createDisclaimer();
  createVersionDisplay();
}

document.addEventListener('DOMContentLoaded', initIndexPage);