// Header module: handles logo + title + optional hr for calculator pages and PDF export
// All visible text sourced from language pack.

import { TEXT } from '../lang/eng.js';

function buildLogoElement() {
  const anchor = document.createElement('a');
  anchor.href = 'index.html';
  const img = document.createElement('img');
  img.src = 'asset/pca-logo.webp';
  img.alt = 'PCA Logo';
  img.className = 'logo';
  anchor.appendChild(img);
  return anchor;
}

export function createPageHeader({ root, title, addHr = true } = {}) {
  if(!root) return null;
  // Always inject logo (removed from static HTML templates)
  root.appendChild(buildLogoElement());
  const h1 = document.createElement('h1');
  h1.textContent = title || (TEXT && TEXT.index && TEXT.index.title) || TEXT.defaults.appTitle;
  root.appendChild(h1);
  if(addHr) root.appendChild(document.createElement('hr'));
  return h1;
}

export function buildExportHeader({ title, payslipTitle }) {
  const frag = document.createDocumentFragment();
  frag.appendChild(buildLogoElement());
  const main = document.createElement('h1');
  main.className='pdf-export-title';
  main.textContent = title || (TEXT.index && TEXT.index.title) || TEXT.defaults.appTitle;
  frag.appendChild(main);
  if(payslipTitle){
    const pay = document.createElement('h1');
    pay.className='pdf-export-title';
    pay.textContent = payslipTitle;
    frag.appendChild(pay);
  }
  return frag;
}
