import { FlowEngine } from '../../core/engine.js';
import { buildEmployeeGrossToNetConfig } from '../configs/employeeGrossToNet.js';
import { formatNumberInput } from '../../common/format.js';

export function initEmployeeGrossToNetEngine(onCalculate) {
  const config = buildEmployeeGrossToNetConfig();
  const engine = new FlowEngine({ rootId: 'gross-to-net-root', ...config, onCalculate });
  engine.init();

  // Wire formatting for number inputs globally (matches legacy behavior)
  document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.classList.contains('number-input')) {
      formatNumberInput(e.target);
    }
  });

  // Step 1: Enable Continue when a selection is made
  const citizenshipSelect = document.getElementById('citizenship');
  const continue1 = document.getElementById('continue-step1');
  const updateStep1 = () => {
    const enabled = !!citizenshipSelect?.value;
    if (continue1) {
      continue1.disabled = !enabled;
      continue1.classList.toggle('unavailable', !enabled);
    }
  };
  citizenshipSelect?.addEventListener('change', updateStep1);
  continue1?.addEventListener('click', () => engine.next());
  updateStep1();

  // Step 2: Enable Continue when gross >= 5,000,000
  const grossInput = document.getElementById('gross-salary');
  const continue2 = document.getElementById('continue-step2');
  const updateStep2 = () => {
    const raw = (grossInput?.value || '').replace(/\D/g, '');
    const enabled = raw && parseInt(raw, 10) >= 5000000;
    if (continue2) {
      continue2.disabled = !enabled;
      continue2.classList.toggle('unavailable', !enabled);
    }
  };
  grossInput?.addEventListener('input', updateStep2);
  continue2?.addEventListener('click', () => engine.next());
  updateStep2();

  // Step 3: Allowances parent checkbox toggles inputs; Continue always enabled
  const allowanceCheckbox = document.getElementById('allowance-checkbox');
  const allowanceInputs = document.getElementById('allowance-inputs');
  const continue3 = document.getElementById('continue-step3');
  const toggleAllowance = () => {
    if (!allowanceInputs) return;
    allowanceInputs.style.display = allowanceCheckbox?.checked ? 'block' : 'none';
  };
  allowanceCheckbox?.addEventListener('change', toggleAllowance);
  continue3?.classList.remove('unavailable');
  if (continue3) continue3.disabled = false;
  continue3?.addEventListener('click', () => engine.next());
  toggleAllowance();

  // Step 4: Bonus parent checkbox toggles inputs (no continue; Calculate appears)
  const bonusCheckbox = document.getElementById('bonus-checkbox');
  const bonusInputs = document.getElementById('bonus-inputs');
  const toggleBonus = () => {
    if (!bonusInputs) return;
    bonusInputs.style.display = bonusCheckbox?.checked ? 'block' : 'none';
  };
  bonusCheckbox?.addEventListener('change', toggleBonus);
  toggleBonus();

  return engine;
}
