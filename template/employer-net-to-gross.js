import { TEXT } from '../lang/eng.js';
import { createSalarySimulationPage } from '../module/standard-page.js';

document.addEventListener('DOMContentLoaded', () => {
  createSalarySimulationPage({
    rootId: 'gross-to-net-root',
    textConfig: TEXT.employerNetToGross,
    direction: 'net-to-gross',
    mode: 'employer',
    minSalary: 4475000
  });
});