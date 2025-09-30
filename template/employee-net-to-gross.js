import { TEXT } from '../lang/eng.js';
import { createSalarySimulationPage } from '../module/standard-page.js';

document.addEventListener('DOMContentLoaded', () => {
  createSalarySimulationPage({
    rootId: 'gross-to-net-root',
    textConfig: TEXT.employeeNetToGross,
    direction: 'net-to-gross',
    mode: 'employee',
    minSalary: 4475000
  });
});