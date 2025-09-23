import { html } from '../../common/dom.js';

export function simpleInputsStep({ title, tooltip, fields, warningId, warningText, continueId, continueText }) {
  const el = document.createElement('div');
  const inputsHtml = fields.map(f => `
      <label class="input-label">${f.label}
        <span class="question-icon" tabindex="0">
          <img src="asset/question_icon.webp" alt="info" />
          <span class="info-box">${f.tooltip || ''}</span>
        </span>
      </label>
      <input type="text" class="number-input" id="${f.id}" placeholder="${f.placeholder || ''}" min="0" />
    `).join('');

  el.innerHTML = html`
    <div class="step-title-row">
      <h2>${title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${tooltip || ''}</span>
      </span>
    </div>
    <div>
      ${warningId ? `<div id="${warningId}" class="input-warning" style="display:none;">${warningText || ''}</div>` : ''}
      ${inputsHtml}
    </div>
    ${continueId ? `<button type="button" id="${continueId}" class="simulation-button unavailable" disabled>${continueText || 'Continue'}</button>` : ''}
  `;
  return el;
}
