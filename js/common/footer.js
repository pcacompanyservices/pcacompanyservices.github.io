import { html, createAndAppend } from './dom.js';

export function renderFooterFrom(textFooter, root = document.body) {
  let footer = document.querySelector('.app-footer');
  if (!footer) {
    footer = createAndAppend(root, 'footer', { className: 'app-footer' });
  }
  footer.innerHTML = html`
    <span class="footer-title">${textFooter.importantNoteTitle}</span>
    <div class="footer-text">${textFooter.importantNoteText} <a href="${textFooter.contactUrl}" target="_blank">${textFooter.contactLinkText}</a>.</div>
    <span class="footer-title">${textFooter.disclaimerTitle}</span>
    <div class="footer-text">${textFooter.disclaimerText}</div>
  `;
  return footer;
}
