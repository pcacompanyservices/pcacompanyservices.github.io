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

  function positionFooter() {
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (documentHeight <= viewportHeight) {
      footer.style.position = 'fixed';
      footer.style.bottom = '1rem';
      footer.style.left = '50%';
      footer.style.transform = 'translateX(-50%)';
      footer.style.zIndex = '1000';
      footer.style.margin = '2rem auto';
      footer.style.width = '70vw';
      const footerHeight = footer.offsetHeight;
      document.body.style.paddingBottom = `${footerHeight + 32}px`;
    } else {
      footer.style.position = '';
      footer.style.bottom = '';
      footer.style.left = '';
      footer.style.transform = '';
      footer.style.zIndex = '';
      footer.style.marginTop = '12rem';
      footer.style.width = '';
      document.body.style.paddingBottom = '';
    }
  }
  setTimeout(positionFooter, 200);
  window.addEventListener('resize', () => setTimeout(positionFooter, 100));
  const observer = new MutationObserver(() => setTimeout(positionFooter, 150));
  observer.observe(root, { childList: true, subtree: true });
  const progressBar = document.querySelector('#progress-bar');
  if (progressBar) {
    const progressObserver = new MutationObserver(() => setTimeout(positionFooter, 100));
    progressObserver.observe(progressBar, { attributes: true, subtree: true });
  }

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
