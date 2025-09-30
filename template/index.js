// ============================================================================
// UTILITY FUNCTIONS (formerly from util/ directory)
// ============================================================================
// HTML template literal utility
function html(strings, ...values) {
  return strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
}

// Language pack
import { TEXT } from '../lang/eng.js';

// Global state for terms agreement
let termsAgreed = false;

// Create and append disclaimer footer
function createDisclaimer() {
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  footer.innerHTML = html`
    <span class="footer-title">${TEXT.index.footer.disclaimerTitle}</span>
    <div class="footer-text">${TEXT.index.footer.disclaimerText}</div>
    <div class="terms-agreement">
      <label class="checkbox-label">
        <input type="checkbox" id="terms-checkbox" class="terms-checkbox">
        <span class="checkbox-text">${TEXT.index.footer.terms.checkboxLabel}</span>
      </label>
      <div id="terms-warning" class="terms-warning">${TEXT.index.footer.terms.warning}</div>
    </div>
  `;
  document.body.appendChild(footer);
  
  // Add event listener for checkbox
  const checkbox = document.getElementById('terms-checkbox');
  checkbox.addEventListener('change', handleTermsChange);
}

// Create and display version information in bottom right corner
function createVersionDisplay() {
  if (document.querySelector('.version-display')) return;
  const versionDiv = document.createElement('div');
  versionDiv.className = 'version-display';
  // Centralized version from language pack
  versionDiv.textContent = (TEXT && TEXT.version) || '';
  document.body.appendChild(versionDiv);
}

// Handle terms checkbox change
function handleTermsChange(event) {
  termsAgreed = event.target.checked;
  
  // Hide warning when checkbox is checked
  if (termsAgreed) {
    hideTermsWarning();
  } else {
    // If box is unticked, refresh the page to force re-agreement
    window.location.reload();
  }
}

// Show terms warning message
function showTermsWarning() {
  const warning = document.getElementById('terms-warning');
  if (warning) {
    warning.classList.add('show');
  }
}

// Hide terms warning message
function hideTermsWarning() {
  const warning = document.getElementById('terms-warning');
  if (warning) {
    warning.classList.remove('show');
  }
}

// Update all button states based on terms agreement
function updateButtonStates() {
  // No longer needed - buttons stay normal looking always
}

document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('simulation-root');
  // Sync page title heading from language pack
  const pageH1 = document.querySelector('h1');
  if (pageH1) pageH1.textContent = TEXT.index.title;

  // Create disclaimer footer
  createDisclaimer();

  // Remove all simulation list elements
  function clearSimulationLists() {
    document.querySelectorAll('.simulation-list').forEach(el => el.remove());
  }

  // Create a button with info box and optional click handler
  function createButton({ value, text, info, enabled = true, onClick, extraClass = '' }) {
    const div = document.createElement('div');
    div.className = 'simulation-list';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.value = value;
    btn.className = `simulation-button${extraClass ? ' ' + extraClass : ''}`;
    btn.innerHTML = html`
      ${text}
      <span class="info-box">${info}</span>
    `;
    
    // Set disabled state only for unavailable buttons
    if (!enabled || extraClass.includes('unavailable')) {
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
    } else if (typeof onClick === 'function') {
      // Add click handler with terms check for available buttons
      btn.addEventListener('click', (event) => {
        if (!termsAgreed) {
          event.preventDefault();
          event.stopPropagation();
          showTermsWarning();
          return false;
        }
        // If terms agreed, proceed normally
        onClick(event);
      });
    }
    
    div.appendChild(btn);
    return div;
  }

  // Create a back/return button
  function createBackButton(onClick) {
    const div = document.createElement('div');
    div.className = 'simulation-list';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'simulation-button return-button';
  btn.textContent = TEXT.index.home.buttons.return;
    
    // Return buttons should work regardless of terms agreement
    btn.addEventListener('click', onClick);

    div.appendChild(btn);
    return div;
  }

  // Render the initial employee/employer choice buttons
  function renderInitialButtons() {
    clearSimulationLists();

    main.appendChild(createButton({
      value: 'employee',
      text: TEXT.index.home.buttons.employee.text,
      info: TEXT.index.home.buttons.employee.info,
  enabled: true,
  onClick: employeeHandler,
  extraClass: ''
    }));

    main.appendChild(createButton({
      value: 'freelancer',
      text: TEXT.index.home.buttons.freelancer.text,
      info: TEXT.index.home.buttons.freelancer.info,
      enabled: true,
      extraClass: 'unavailable' // off
    }));

    main.appendChild(createButton({
      value: 'employer',
      text: TEXT.index.home.buttons.employer.text,
      info: TEXT.index.home.buttons.employer.info,
      enabled: true,
      onClick: employerHandler,
      extraClass: '',
    }));
  }

  // Handler for employee button
  function employeeHandler() {
    clearSimulationLists();
    main.appendChild(createButton({
      value: 'gross-to-net',
  text: TEXT.index.home.buttons.employeeGrossToNet.text,
  info: TEXT.index.home.buttons.employeeGrossToNet.info,
      enabled: true,
      onClick : () => { window.location.href = 'employee-gross-to-net.html' },
      extraClass: 'employee-choice'
    }));
    main.appendChild(createButton({
      value: 'net-to-gross',
  text: TEXT.index.home.buttons.employeeNetToGross.text,
  info: TEXT.index.home.buttons.employeeNetToGross.info,
      enabled: true,
      onClick: () => { window.location.href = 'employee-net-to-gross.html' },
      extraClass: 'employee-choice'
    }));
    main.appendChild(createBackButton(renderInitialButtons));
  }

  // Handler for employer button
  function employerHandler() {
    clearSimulationLists();
    main.appendChild(createButton({
      value: 'from-gross',
  text: TEXT.index.home.buttons.employerFromGross.text,
  info: TEXT.index.home.buttons.employerFromGross.info,
      enabled: true,
      onClick: () => { window.location.href = 'employer-gross-to-net.html'; },
      extraClass: 'employer-choice'
    }));
    main.appendChild(createButton({
      value: 'from-net',
  text: TEXT.index.home.buttons.employerFromNet.text,
  info: TEXT.index.home.buttons.employerFromNet.info,
      enabled: true,
      onClick: () => { window.location.href = 'employer-net-to-gross.html'; },
      extraClass: 'employer-choice'
    }));
    main.appendChild(createBackButton(renderInitialButtons));
  }

  // Initial render
  renderInitialButtons();

  // Show version in bottom-right on index page
  createVersionDisplay();
});
