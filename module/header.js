// Header module: handles logo + title + optional hr for calculator pages and PDF export
// All visible text sourced from language pack.

import { TEXT } from '../lang/eng.js';

export function createPageHeader({ root, title, logoSelector = '.logo', addHr = true } = {}) {
  if(!root) return null;
  const existingLogo = document.querySelector(logoSelector);
  if(existingLogo) {
    const clone = existingLogo.cloneNode(true);
    clone.classList.add('header-logo');
    root.appendChild(clone);
  }
  const h1 = document.createElement('h1');
  h1.textContent = title || (TEXT && TEXT.index && TEXT.index.title) || 'Salary Simulation';
  root.appendChild(h1);
  if(addHr) root.appendChild(document.createElement('hr'));
  return h1;
}

export function buildExportHeader({ title, payslipTitle, logoSelector = '.logo' }) {
  const frag = document.createDocumentFragment();
  const logo = document.querySelector(logoSelector);
  if(logo) frag.appendChild(logo.cloneNode(true));
  const main = document.createElement('h1');
  main.className='pdf-export-title';
  main.textContent = title || (TEXT.index && TEXT.index.title) || 'Salary Simulation Tool';
  frag.appendChild(main);
  if(payslipTitle){
    const pay = document.createElement('h1');
    pay.className='pdf-export-title';
    pay.textContent = payslipTitle;
    frag.appendChild(pay);
  }
  return frag;
}
