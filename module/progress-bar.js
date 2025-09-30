// Shared progress bar builder
// Usage: buildProgressBar(root, ['Step 1','Step 2', ...])
// Produces a container with id "progress-bar" (configurable) containing
// .progress-step elements separated by .progress-bar-line divs.
export function buildProgressBar(root, stepLabels = [], { id = 'progress-bar' } = {}) {
  const bar = document.createElement('div');
  bar.id = id;
  const parts = [];
  stepLabels.forEach((label, i) => {
    parts.push(`<div class="progress-step" data-step="${i}">${label}</div>`);
    if (i < stepLabels.length - 1) parts.push('<div class="progress-bar-line"></div>');
  });
  bar.innerHTML = parts.join('\n    ');
  root.appendChild(bar);
  return bar;
}

// Update the classes on a built progress bar to reflect active/completed steps
export function setProgressBarActiveStep(stepIndex, { selector = '#progress-bar' } = {}) {
  const bar = document.querySelector(selector);
  if (!bar) return;
  const steps = bar.querySelectorAll('.progress-step');
  steps.forEach((el, i) => {
    if (i < stepIndex) { el.classList.add('completed'); el.classList.remove('active'); }
    else if (i === stepIndex) { el.classList.add('active'); el.classList.remove('completed'); }
    else { el.classList.remove('active', 'completed'); }
  });
  const lines = bar.querySelectorAll('.progress-bar-line');
  lines.forEach((line, i) => {
    if (i < stepIndex) line.classList.add('completed'); else line.classList.remove('completed');
  });
}
