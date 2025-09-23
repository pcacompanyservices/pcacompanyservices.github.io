import { FlowEngine } from '../../core/engine.js';
import { buildEmployeeNetToGrossConfig } from '../configs/employeeNetToGross.js';
import { formatNumberInput } from '../../common/format.js';

export function initEmployeeNetToGrossEngine(onCalculate) {
  const config = buildEmployeeNetToGrossConfig();
  const engine = new FlowEngine({ rootId: 'gross-to-net-root', ...config, onCalculate });
  engine.init();

  document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.classList.contains('number-input')) formatNumberInput(e.target);
  });

  const citizenshipSelect = document.getElementById('citizenship');
  const continue1 = document.getElementById('continue-step1');
  const updateStep1 = () => {
    const enabled = !!citizenshipSelect?.value;
    if (continue1) { continue1.disabled = !enabled; continue1.classList.toggle('unavailable', !enabled); }
  };
  citizenshipSelect?.addEventListener('change', updateStep1);
  continue1?.addEventListener('click', () => engine.next());
  updateStep1();

  const netInput = document.getElementById('net-salary');
  const continue2 = document.getElementById('continue-step2');
  const updateStep2 = () => {
    const raw = (netInput?.value || '').replace(/\D/g, '');
    const enabled = raw && parseInt(raw, 10) >= 4475000;
    if (continue2) { continue2.disabled = !enabled; continue2.classList.toggle('unavailable', !enabled); }
  };
  netInput?.addEventListener('input', updateStep2);
  continue2?.addEventListener('click', () => engine.next());
  updateStep2();

  const allowanceCheckbox = document.getElementById('allowance-checkbox');
  const allowanceInputs = document.getElementById('allowance-inputs');
  const continue3 = document.getElementById('continue-step3');
  const toggleAllowance = () => { if (allowanceInputs) allowanceInputs.style.display = allowanceCheckbox?.checked ? 'block' : 'none'; };
  allowanceCheckbox?.addEventListener('change', toggleAllowance);
  continue3?.classList.remove('unavailable');
  if (continue3) continue3.disabled = false;
  continue3?.addEventListener('click', () => engine.next());
  toggleAllowance();

  const bonusCheckbox = document.getElementById('bonus-checkbox');
  const bonusInputs = document.getElementById('bonus-inputs');
  const toggleBonus = () => { if (bonusInputs) bonusInputs.style.display = bonusCheckbox?.checked ? 'block' : 'none'; };
  bonusCheckbox?.addEventListener('change', toggleBonus);
  toggleBonus();

  return engine;
}
