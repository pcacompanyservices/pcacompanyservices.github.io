// Shared footer module: creates Important Note + Disclaimer footer with dynamic positioning
// Usage: import { createStandardFooter } from '../module/footer.js';
// createStandardFooter({ root: document.body, textConfig: TEXT.employeeGrossToNet.footer });

export function createStandardFooter({ root, footerConfig, version }) {
  if (!root || !footerConfig) return null;
  // Reuse existing footer if present
  let footer = root.querySelector('footer.app-footer');
  if (!footer) {
    footer = document.createElement('footer');
    footer.className = 'app-footer';
    root.appendChild(footer);
  }
  footer.innerHTML = `
    <hr />
    <span class="footer-title">${footerConfig.importantNoteTitle}</span>
    <div class="footer-text">${footerConfig.importantNoteText} <a href="${footerConfig.contactUrl}" target="_blank">${footerConfig.contactLinkText}</a>.</div>
    <span class="footer-title">${footerConfig.disclaimerTitle}</span>
    <div class="footer-text">${footerConfig.disclaimerText}</div>
  `;
  function applyLayout() {
    // Skip export/PDF temporary footers (they are laid out inside export container)
    if (footer.classList.contains('export-footer')) return;
    const viewportHeight = window.innerHeight;
    const footerHeight = footer.offsetHeight || 0;
    // Prefer a main content container if available
  const main = document.getElementById('simulator-root')
               || document.getElementById('simulation-root')
               || document.querySelector('#result')
               || document.body;
    const mainRectHeight = main.getBoundingClientRect().height;
    // Determine if combined content (main + footer + small gap) fits within viewport
    const shouldFix = (mainRectHeight + footerHeight + 100) <= viewportHeight;
    footer.classList.toggle('app-footer-fixed', shouldFix);
    footer.classList.toggle('app-footer-static', !shouldFix);
    if (shouldFix) {
      document.body.style.paddingBottom = `${footerHeight + 32}px`;
    } else {
      document.body.style.paddingBottom = '';
    }
  }
  setTimeout(applyLayout, 150);
  window.addEventListener('resize', () => setTimeout(applyLayout, 80));
  const observerTargets = [document.body, document.getElementById('simulator-root'), document.getElementById('simulation-root')].filter(Boolean);
  const observer = new MutationObserver(() => setTimeout(applyLayout, 120));
  observerTargets.forEach(t => observer.observe(t, { childList: true, subtree: true, attributes: true }));

  if (version) {
    if (!document.querySelector('.version-display')) {
      const versionDiv = document.createElement('div');
      versionDiv.className = 'version-display';
      versionDiv.textContent = version;
      document.body.appendChild(versionDiv);
    }
  }
  return footer;
}
