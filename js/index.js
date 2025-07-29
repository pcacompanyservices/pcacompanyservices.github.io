

document.addEventListener('DOMContentLoaded', () => {
  const main = document.getElementById('simulation-root');

  function clearSimulationLists() {
    document.querySelectorAll('.simulation-list').forEach(el => el.remove());
  }

  function createButton({ value, text, info, enabled, onClick, extraClass }) {
    const div = document.createElement('div');
    div.className = 'simulation-list';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.value = value;
    btn.className = 'simulation-button' + (extraClass ? ' ' + extraClass : '');
    if (!enabled) {
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
    }
    btn.innerHTML = `${text}<span class=\"info-box\">${info}</span>`;
    if (enabled && typeof onClick === 'function') {
      btn.addEventListener('click', onClick);
    }
    div.appendChild(btn);
    return div;
  }

  function createBackButton(onClick) {
    const div = document.createElement('div');
    div.className = 'simulation-list';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-button';
    btn.textContent = 'Return';
    btn.addEventListener('click', onClick);
    div.appendChild(btn);
    return div;
  }

  function renderInitialButtons() {
    clearSimulationLists();
    // Create fresh buttons to avoid event listener issues
    const employeeDiv = document.createElement('div');
    employeeDiv.className = 'simulation-list';
    const employeeBtnNew = document.createElement('button');
    employeeBtnNew.type = 'button';
    employeeBtnNew.value = 'employee';
    employeeBtnNew.className = 'simulation-button';
    employeeBtnNew.id = 'employee-btn';
    employeeBtnNew.innerHTML = `I'm an employee<span class="info-box">Calculate your net salary, insurance, and tax from your gross salary.</span>`;
    employeeBtnNew.addEventListener('click', employeeHandler);
    employeeDiv.appendChild(employeeBtnNew);
    main.appendChild(employeeDiv);

    const employerDiv = document.createElement('div');
    employerDiv.className = 'simulation-list';
    const employerBtnNew = document.createElement('button');
    employerBtnNew.type = 'button';
    employerBtnNew.value = 'employer';
    employerBtnNew.className = 'simulation-button';
    employerBtnNew.id = 'employer-btn';
    employerBtnNew.innerHTML = `I'm an employer<span class="info-box">Simulate total employer cost and payroll breakdown.</span>`;
    employerBtnNew.addEventListener('click', employerHandler);
    employerDiv.appendChild(employerBtnNew);
    main.appendChild(employerDiv);
  }

  function employeeHandler() {
    clearSimulationLists();
    const grossBtn = createButton({
      value: 'gross-to-net',
      text: 'Calculate from your gross salary',
      info: 'Calculate your net salary, insurance, and tax from your gross salary.',
      enabled: true,
      onClick: () => { window.location.href = 'gross-to-net.html'; },
      extraClass: 'employee-choice'
    });
    const netBtn = createButton({
      value: 'net-to-gross',
      text: 'Calculate from your net salary',
      info: 'Coming soon: Calculate your gross salary from your net salary.',
      enabled: false,
      extraClass: 'employee-choice'
    });
    const backBtn = createBackButton(renderInitialButtons);
    main.appendChild(grossBtn);
    main.appendChild(netBtn);
    main.appendChild(backBtn);
  }

  function employerHandler() {
    clearSimulationLists();
    const fromGrossBtn = createButton({
      value: 'from-gross',
      text: 'Calculate total cost from gross salary',
      info: 'Coming soon: Simulate total employer cost from gross salary.',
      enabled: false,
      extraClass: 'employer-choice'
    });
    const fromNetBtn = createButton({
      value: 'from-net',
      text: 'Calculate total cost from net salary',
      info: 'Coming soon: Simulate total employer cost from net salary.',
      enabled: false,
      extraClass: 'employer-choice'
    });
    const backBtn = createBackButton(renderInitialButtons);
    main.appendChild(fromGrossBtn);
    main.appendChild(fromNetBtn);
    main.appendChild(backBtn);
  }

  renderInitialButtons();
});
