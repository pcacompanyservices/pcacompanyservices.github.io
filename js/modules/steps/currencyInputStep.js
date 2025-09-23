import { html } from '../../common/dom.js';

export function currencyInputStep({ id, title, tooltip, placeholder, warningId, warningText, continueId, continueText }) {
  const el = document.createElement('div');
  el.innerHTML = html`
    <div class="step-title-row">
      <h2>${title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${tooltip}</span>
      </span>
    </div>
    <input type="text" class="number-input" id="${id}" placeholder="${placeholder}" />
    <div id="${warningId}" class="input-warning" style="display:none;">${warningText}</div>
    ${continueId ? `<button type="button" id="${continueId}" class="simulation-button unavailable" disabled>${continueText || 'Continue'}</button>` : ''}
  `;
  return el;
}
