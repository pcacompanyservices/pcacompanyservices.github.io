// ============================================================================
// UTILITY FUNCTIONS (formerly from util/ directory)
// ============================================================================

// HTML template literal utility
const html = (strings, ...values) =>
  strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');

// Global state for terms agreement
let termsAgreed = false;

// Create and append disclaimer footer
function createDisclaimer() {
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  footer.innerHTML = html`
    <span class="footer-title">DISCLAIMER</span>
    <div class="footer-text">The information provided in this simulation is for general informational purposes only. It does not constitute legal advice, nor does it create a service provider or client relationship. While we make every effort to ensure the accuracy, no warranty is given, whether express or implied, to its correctness or completeness. We accept no responsibility for any errors or omissions. We are not liable for any loss or damage, including but not limited to loss of business or profits, arising from the use of this simulation or reliance on its contents, whether in contract, tort, or otherwise.</div>
    <div class="terms-agreement">
      <label class="checkbox-label">
        <input type="checkbox" id="terms-checkbox" class="terms-checkbox">
        <span class="checkbox-text">I have read and agreed to terms and conditions</span>
      </label>
      <div id="terms-warning" class="terms-warning">Please read and agree to our terms and conditions</div>
    </div>
  `;
  document.body.appendChild(footer);
  
  // Add event listener for checkbox
  const checkbox = document.getElementById('terms-checkbox');
  checkbox.addEventListener('change', handleTermsChange);
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
    btn.textContent = 'Return';
    
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
      text: `I'm an employee`,
      info: 'You have a job.',
      enabled: false,
      onClick: employeeHandler,
      extraClass: 'unavailable' // off
    }));

    main.appendChild(createButton({
      value: 'freelancer',
      text: `I'm a freelancer`,
      info: 'Coming soon.',
      enabled: true,
      extraClass: 'unavailable' // off
    }));

    main.appendChild(createButton({
      value: 'employer',
      text: `I'm an employer`,
      info: 'You are hiring an employee.',
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
      text: 'Calculate from your Gross Salary',
      info: 'Calculate take-home salary from your gross salary.',
      enabled: true,
      onClick : () => { window.location.href = 'employee-gross-to-net.html' },
      extraClass: 'employee-choice'
    }));
    main.appendChild(createButton({
      value: 'net-to-gross',
      text: 'Calculate from your Net Salary',
      info: 'Calculate gross salary from how much you want to take home.',
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
      text: 'Calculate from Gross Salary',
      info: 'Calculate your cost from gross salary.',
      enabled: true,
      onClick: () => { window.location.href = 'employer-gross-to-net.html'; },
      extraClass: 'employer-choice'
    }));
    main.appendChild(createButton({
      value: 'from-net',
      text: 'Calculate from Net Salary',
      info: 'Calculate your cost from take-home salary.',
      enabled: false,
      onClick: () => { window.location.href = 'employer-net-to-gross.html'; },
      extraClass: 'employer-choice unavailable' // off
    }));
    main.appendChild(createBackButton(renderInitialButtons));
  }

  // Initial render
  renderInitialButtons();
});
