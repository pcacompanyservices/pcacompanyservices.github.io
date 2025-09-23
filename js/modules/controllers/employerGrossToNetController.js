import { FlowEngine } from '../../core/engine.js';
import { buildEmployerGrossToNetConfig } from '../configs/employerGrossToNet.js';
import { formatNumberInput } from '../../common/format.js';

export function initEmployerGrossToNetEngine(onCalculate) {
  const config = buildEmployerGrossToNetConfig();
  const engine = new FlowEngine({ rootId: 'gross-to-net-root', ...config, onCalculate });
  engine.init();
  document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' && e.target.classList.contains('number-input')) formatNumberInput(e.target);
  });

  const stepContinueIds = ['continue-step1','continue-step2','continue-step3','continue-step4'];
  stepContinueIds.forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) { btn.disabled = false; btn.classList.remove('unavailable'); btn.addEventListener('click', () => engine.next()); }
  });

  const statusSelect = document.getElementById('tax-resident-status');
  const cont1 = document.getElementById('continue-step1');
  const update1 = () => { const enabled = !!statusSelect?.value; if (cont1) { cont1.disabled = !enabled; cont1.classList.toggle('unavailable', !enabled); } };
  statusSelect?.addEventListener('change', update1);
  update1();

  const grossInput = document.getElementById('gross-salary');
  const cont2 = document.getElementById('continue-step2');
  const update2 = () => { const raw = (grossInput?.value||'').replace(/\D/g,''); const ok = raw && parseInt(raw,10) >= 5000000; if (cont2){ cont2.disabled=!ok; cont2.classList.toggle('unavailable',!ok);} };
  grossInput?.addEventListener('input', update2);
  update2();

  return engine;
}
