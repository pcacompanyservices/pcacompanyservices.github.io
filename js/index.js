import { html } from '../util/html-parser.js';

document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('simulation-root');

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
    if (!enabled) {
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
    } else if (typeof onClick === 'function') {
      btn.addEventListener('click', onClick);
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
      enabled: true,
      onClick: employeeHandler,
      extraClass: ''
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
      enabled: true,
      onClick: () => { window.location.href = 'employer-net-to-gross.html'; },
      extraClass: 'employer-choice'
    }));
    main.appendChild(createBackButton(renderInitialButtons));
  }

  // Initial render
  renderInitialButtons();
});
