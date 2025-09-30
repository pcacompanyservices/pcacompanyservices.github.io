import { TEXT } from '../lang/eng.js';
import { createSalarySimulationPage } from '../module/standard-page.js';

document.addEventListener('DOMContentLoaded', () => {
  createSalarySimulationPage({
    rootId: 'gross-to-net-root',
    textConfig: TEXT.employerGrossToNet,
    direction: 'gross-to-net',
    mode: 'employer',
    minSalary: 5000000
  });
});