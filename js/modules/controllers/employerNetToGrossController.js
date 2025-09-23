import { FlowEngine } from '../../core/engine.js';
import { buildEmployerNetToGrossConfig } from '../configs/employerNetToGross.js';
import { formatNumberInput } from '../../common/format.js';

export function initEmployerNetToGrossController(onCalculate) {
  const config = buildEmployerNetToGrossConfig();
  const engine = new FlowEngine({ rootId: 'gross-to-net-root', ...config, onCalculate });
  engine.init();

  // Global number formatting
  document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.classList.contains('number-input')) formatNumberInput(e.target);
  });

  // Enable continues and validations
  const contIds = ['continue-step1','continue-step2','continue-step3','continue-step4'];
  contIds.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) { btn.disabled = false; btn.classList.remove('unavailable'); btn.addEventListener('click', () => engine.next()); }
  });

  const statusSelect = document.getElementById('tax-resident-status');
  const cont1 = document.getElementById('continue-step1');
  const upd1 = () => { const ok = !!statusSelect?.value; if (cont1) { cont1.disabled = !ok; cont1.classList.toggle('unavailable', !ok); } };
  statusSelect?.addEventListener('change', upd1);
  upd1();

  const netInput = document.getElementById('net-salary');
  const cont2 = document.getElementById('continue-step2');
  const upd2 = () => { const raw = (netInput?.value||'').replace(/\D/g,''); const ok = raw && parseInt(raw,10) >= 4475000; if (cont2){ cont2.disabled=!ok; cont2.classList.toggle('unavailable',!ok);} };
  netInput?.addEventListener('input', upd2);
  upd2();

  return engine;
}
