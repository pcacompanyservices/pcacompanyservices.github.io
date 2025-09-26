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
