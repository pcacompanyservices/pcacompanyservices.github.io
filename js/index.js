

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
    btn.innerHTML = `${text}<span class="info-box">${info}</span>`;

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

    // Employee button
    const employeeDiv = document.createElement('div');
    employeeDiv.className = 'simulation-list';
    const employeeBtn = document.createElement('button');
    employeeBtn.type = 'button';
    employeeBtn.value = 'employee';
    employeeBtn.className = 'simulation-button';
    employeeBtn.id = 'employee-btn';
    employeeBtn.innerHTML = `I'm an employee<span class="info-box">Calculate your net salary, insurance, and tax from your gross salary.</span>`;
    employeeBtn.addEventListener('click', employeeHandler);
    employeeDiv.appendChild(employeeBtn);
    main.appendChild(employeeDiv);

    // Employer button
    const employerDiv = document.createElement('div');
    employerDiv.className = 'simulation-list';
    const employerBtn = document.createElement('button');
    employerBtn.type = 'button';
    employerBtn.value = 'employer';
    employerBtn.className = 'simulation-button';
    employerBtn.id = 'employer-btn';
    employerBtn.innerHTML = `I'm an employer<span class="info-box">Simulate total employer cost and payroll breakdown.</span>`;
    employerBtn.addEventListener('click', employerHandler);
    employerDiv.appendChild(employerBtn);
    main.appendChild(employerDiv);
  }

  // Handler for employee button
  function employeeHandler() {
    clearSimulationLists();
    main.appendChild(createButton({
      value: 'gross-to-net',
      text: 'Calculate from your gross salary',
      info: 'Calculate your net salary, insurance, and tax from your gross salary.',
      enabled: true,
      onClick: () => { window.location.href = 'gross-to-net.html'; },
      extraClass: 'employee-choice'
    }));
    main.appendChild(createButton({
      value: 'net-to-gross',
      text: 'Calculate from your net salary',
      info: 'Coming soon: Calculate your gross salary from your net salary.',
      enabled: false,
      extraClass: 'employee-choice'
    }));
    main.appendChild(createBackButton(renderInitialButtons));
  }

  // Handler for employer button
  function employerHandler() {
    clearSimulationLists();
    main.appendChild(createButton({
      value: 'from-gross',
      text: 'Calculate total cost from gross salary',
      info: 'Coming soon: Simulate total employer cost from gross salary.',
      enabled: false,
      extraClass: 'employer-choice'
    }));
    main.appendChild(createButton({
      value: 'from-net',
      text: 'Calculate total cost from net salary',
      info: 'Coming soon: Simulate total employer cost from net salary.',
      enabled: false,
      extraClass: 'employer-choice'
    }));
    main.appendChild(createBackButton(renderInitialButtons));
  }

  // Initial render
  renderInitialButtons();
});
