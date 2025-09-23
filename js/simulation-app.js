// Single entry for simulations. For now, delegates to existing modules.
// Engine pilot: we can enable engine-based flow for a scenario behind a flag.

import { FlowEngine } from './core/engine.js';
import { buildEmployeeGrossToNetConfig } from './modules/configs/employeeGrossToNet.js';
import { initEmployeeGrossToNetEngine } from './modules/controllers/employeeGrossToNetController.js';
import { initEmployeeNetToGrossEngine } from './modules/controllers/employeeNetToGrossController.js';
import { initEmployerGrossToNetEngine } from './modules/controllers/employerGrossToNetController.js';
import { initEmployerNetToGrossController } from './modules/controllers/employerNetToGrossController.js';
import { simulateSalary } from '../be/cal.js';
import { renderEmployeeGrossToNetResult } from './modules/results/employeeGrossToNetResult.js';
import { renderEmployeeNetToGrossResult } from './modules/results/employeeNetToGrossResult.js';
import { renderEmployerGrossToNetResult } from './modules/results/employerGrossToNetResult.js';
import { renderEmployerNetToGrossResult } from './modules/results/employerNetToGrossResult.js';

const USE_ENGINE = {
  'employee-gtN': true,
  'employee-ntG': true,
  'employer-gtN': true,
  'employer-ntG': true,
};

// Legacy fallback removed after engine parity – engine handles all scenarios

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function showError(msg) {
  const root = document.getElementById('gross-to-net-root');
  if (root) {
    root.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = msg;
    p.style.color = '#a00';
    root.appendChild(p);
  }
}

async function main() {
  const type = getQueryParam('type');
  if (USE_ENGINE[type]) {
    try {
  if (type === 'employee-gtN') {
        const engine = initEmployeeGrossToNetEngine(() => {
          // Gather inputs and compute
          const parse = (val) => parseFloat(String(val || '').replace(/[^\d.-]/g, '')) || 0;
          const getVal = (id) => (document.getElementById(id)?.value) || '';
          const params = {
            method: 'gross-to-net',
            grossSalary: parse(getVal('gross-salary')),
            taxResidentStatus: document.getElementById('citizenship')?.value || 'local',
            lunchAllowance: parse(getVal('allowance-lunch')),
            fuelAllowance: parse(getVal('allowance-fuel')),
            phoneAllowance: parse(getVal('allowance-phone')),
            travelAllowance: parse(getVal('allowance-travel')),
            uniformAllowance: parse(getVal('allowance-uniform')),
            otherAllowance: parse(getVal('allowance-other')),
            totalBonus: parse(getVal('bonus-productivity')) + parse(getVal('bonus-incentive')) + parse(getVal('bonus-kpi')) + parse(getVal('bonus-other')),
            childTuitionBenefit: 0,
            rentalBenefit: 0,
            healthInsuranceBenefit: 0,
          };
          const data = simulateSalary(params);
          const root = document.getElementById('gross-to-net-root');
          const form = document.getElementById('salary-form');
          if (form && form.parentNode) form.parentNode.removeChild(form);
          const progressBar = document.getElementById('progress-bar');
          if (progressBar) progressBar.style.display = 'none';
          renderEmployeeGrossToNetResult(root, data);
        });
        return;
      }
      if (type === 'employer-gtN') {
        const engine = initEmployerGrossToNetEngine(() => {
          const parse = (val) => parseFloat(String(val || '').replace(/[^\d.-]/g, '')) || 0;
          const getVal = (id) => (document.getElementById(id)?.value) || '';
          const params = {
            method: 'gross-to-net',
            grossSalary: parse(getVal('gross-salary')),
            taxResidentStatus: document.getElementById('tax-resident-status')?.value || 'local',
            lunchAllowance: parse(getVal('allowance-lunch')),
            fuelAllowance: parse(getVal('allowance-fuel')),
            phoneAllowance: parse(getVal('allowance-phone')),
            travelAllowance: parse(getVal('allowance-travel')),
            uniformAllowance: parse(getVal('allowance-uniform')),
            otherAllowance: parse(getVal('allowance-other')),
            totalBonus: parse(getVal('bonus-total')),
            childTuitionBenefit: parse(getVal('benefit-childTuition')),
            rentalBenefit: parse(getVal('benefit-rental')),
            healthInsuranceBenefit: parse(getVal('benefit-healthInsurance')),
          };
          const data = simulateSalary(params);
          const root = document.getElementById('gross-to-net-root');
          const form = document.getElementById('salary-form');
          if (form && form.parentNode) form.parentNode.removeChild(form);
          const progressBar = document.getElementById('progress-bar');
          if (progressBar) progressBar.style.display = 'none';
          renderEmployerGrossToNetResult(root, data);
        });
        return;
      }
      if (type === 'employee-ntG') {
        const engine = initEmployeeNetToGrossEngine(() => {
          const parse = (val) => parseFloat(String(val || '').replace(/[^\d.-]/g, '')) || 0;
          const getVal = (id) => (document.getElementById(id)?.value) || '';
          const params = {
            method: 'net-to-gross',
            netSalary: parse(getVal('net-salary')),
            taxResidentStatus: document.getElementById('citizenship')?.value || 'local',
            lunchAllowance: parse(getVal('allowance-lunch')),
            fuelAllowance: parse(getVal('allowance-fuel')),
            phoneAllowance: parse(getVal('allowance-phone')),
            travelAllowance: parse(getVal('allowance-travel')),
            uniformAllowance: parse(getVal('allowance-uniform')),
            otherAllowance: parse(getVal('allowance-other')),
            totalBonus: parse(getVal('bonus-productivity')) + parse(getVal('bonus-incentive')) + parse(getVal('bonus-kpi')) + parse(getVal('bonus-other')),
            childTuitionBenefit: 0,
            rentalBenefit: 0,
            healthInsuranceBenefit: 0,
          };
          const data = simulateSalary(params);
          const root = document.getElementById('gross-to-net-root');
          const form = document.getElementById('salary-form');
          if (form && form.parentNode) form.parentNode.removeChild(form);
          const progressBar = document.getElementById('progress-bar');
          if (progressBar) progressBar.style.display = 'none';
          renderEmployeeNetToGrossResult(root, data);
        });
        return;
      }
      if (type === 'employer-ntG') {
        const engine = initEmployerNetToGrossController(async () => {
          const parse = (val) => parseFloat(String(val || '').replace(/[^\d.-]/g, '')) || 0;
          const getVal = (id) => (document.getElementById(id)?.value) || '';
          const params = {
            method: 'net-to-gross',
            netSalary: parse(getVal('net-salary')),
            taxResidentStatus: document.getElementById('tax-resident-status')?.value || 'local',
            // allowances (net)
            netLunchAllowance: parse(getVal('allowance-lunch')),
            netFuelAllowance: parse(getVal('allowance-fuel')),
            netPhoneAllowance: parse(getVal('allowance-phone')),
            netTravelAllowance: parse(getVal('allowance-travel')),
            netUniformAllowance: parse(getVal('allowance-uniform')),
            netOtherAllowance: parse(getVal('allowance-other')),
            // bonus (net)
            netTotalBonus: parse(getVal('bonus-total')),
            // benefits
            childTuitionBenefit: parse(getVal('benefit-childTuition')),
            rentalBenefit: parse(getVal('benefit-rental')),
            healthInsuranceBenefit: parse(getVal('benefit-healthInsurance')),
          };
          const data = simulateSalary(params);
          const root = document.getElementById('gross-to-net-root');
          const form = document.getElementById('salary-form');
          if (form && form.parentNode) form.parentNode.removeChild(form);
          const progressBar = document.getElementById('progress-bar');
          if (progressBar) progressBar.style.display = 'none';
          renderEmployerNetToGrossResult(root, data);
        });
        return;
      }
    } catch (err) {
      console.error('Engine path failed for', type, err);
      showError('Failed to initialize.');
      return;
    }
  }
  // If we get here, type not recognized
  showError('Unknown scenario.');
}

main();
