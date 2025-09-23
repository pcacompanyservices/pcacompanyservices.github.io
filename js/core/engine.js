// Minimal flow engine scaffold. Keeps API small and non-invasive.

export class FlowEngine {
  constructor({ rootId, title, steps = [], onCalculate, renderFooter }) {
    this.root = document.getElementById(rootId);
    this.title = title;
    this.steps = steps;
    this.onCalculate = onCalculate;
    this.renderFooter = renderFooter;
    this.currentStepIndex = 0;
    this.dom = {};
  }

  init() {
    if (!this.root) throw new Error('Root not found');
    this.root.innerHTML = '';
    this.renderHeader();
    this.renderProgress();
    this.renderForm();
    this.mountSteps();
    this.renderNav();
    if (typeof this.renderFooter === 'function') this.renderFooter();
    this.updateStep();
  }

  renderHeader() {
    const h1 = document.createElement('h1');
    h1.textContent = this.title;
    this.root.appendChild(h1);
    this.root.appendChild(document.createElement('hr'));
  }

  renderProgress() {
    const bar = document.createElement('div');
    bar.id = 'progress-bar';
    bar.innerHTML = this.steps.map((s, i) => {
      const line = i < this.steps.length - 1 ? '<div class="progress-bar-line"></div>' : '';
      return `<div class="progress-step" data-step="${i}">${s.label}</div>${line}`;
    }).join('');
    this.root.appendChild(bar);
    this.dom.progress = bar;
  }

  renderForm() {
    const form = document.createElement('form');
    form.id = 'salary-form';
    this.root.appendChild(form);
    this.dom.form = form;
  }

  mountSteps() {
    this.steps.forEach((s, idx) => {
      const el = s.render();
      el.classList.add('form-step');
  // Ensure the first step is visible; CSS sets .form-step { display:none }
  // so we must explicitly use 'block' to override.
  el.style.display = idx === 0 ? 'block' : 'none';
      this.dom.form.appendChild(el);
    });
  }

  renderNav() {
    const nav = document.createElement('div');
    nav.className = 'form-navigation';
    nav.innerHTML = `
      <button type="submit" id="calculate-btn" class="simulation-button" style="display:none;">Calculate</button>
      <button type="button" id="return-btn" class="simulation-button return-button" style="display:none;">Return</button>
    `;
    this.dom.form.appendChild(nav);
    this.dom.calculateBtn = nav.querySelector('#calculate-btn');
    this.dom.returnBtn = nav.querySelector('#return-btn');

    this.dom.returnBtn.addEventListener('click', () => this.prev());
    this.dom.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (typeof this.onCalculate === 'function') this.onCalculate();
    });
  }

  updateStep() {
    const stepsEls = Array.from(this.dom.form.querySelectorAll('.form-step'));
  // Show only the current step; use 'block' to override CSS default hidden state
  stepsEls.forEach((el, i) => el.style.display = i === this.currentStepIndex ? 'block' : 'none');
  // Navigation buttons: CSS hides them by default; force 'block' when needed
  this.dom.returnBtn.style.display = this.currentStepIndex > 0 ? 'block' : 'none';
  this.dom.calculateBtn.style.display = this.currentStepIndex === stepsEls.length - 1 ? 'block' : 'none';

    const stepEls = this.dom.progress.querySelectorAll('.progress-step');
    const lines = this.dom.progress.querySelectorAll('.progress-bar-line');
    stepEls.forEach((el, i) => {
      if (i < this.currentStepIndex) { el.classList.add('completed'); el.classList.remove('active'); }
      else if (i === this.currentStepIndex) { el.classList.add('active'); el.classList.remove('completed'); }
      else { el.classList.remove('active', 'completed'); }
    });
    lines.forEach((line, i) => { if (i < this.currentStepIndex) line.classList.add('completed'); else line.classList.remove('completed'); });
  }

  next() { if (this.currentStepIndex < this.steps.length - 1) { this.currentStepIndex++; this.updateStep(); } }
  prev() { if (this.currentStepIndex > 0) { this.currentStepIndex--; this.updateStep(); } }
}
