import { html } from '../../common/dom.js';

export function bonusStep({ title, tooltip, fields, warningId, warningText, withParentCheckbox = false, parentCheckboxId = 'bonus-checkbox', parentCheckboxLabel, continueId, continueText }) {
  const el = document.createElement('div');
  const inputsHtml = fields.map(f => {
    const key = f.id.replace(/^bonus-/, '');
    const checkboxId = `${key}-checkbox`;
    const containerId = `${key}-input`;
    return `
        <label class="checkbox-item"><input type="checkbox" id="${checkboxId}" /> ${f.label}
          <span class="question-icon" tabindex="0">
            <img src="asset/question_icon.webp" alt="info" />
            <span class="info-box">${f.tooltip}</span>
          </span>
        </label>
        <div id="${containerId}" style="display: none;"><input type="text" class="number-input" id="${f.id}" placeholder="${f.placeholder}" min="0" /></div>
      `;
  }).join('');

  const content = html`
    <div class="step-title-row">
      <h2>${title}</h2>
      <span class="question-icon" tabindex="0">
        <img src="asset/question_icon.webp" alt="info" />
        <span class="info-box">${tooltip}</span>
      </span>
    </div>
    <div id="bonus-container">
      ${withParentCheckbox ? `<label class=\"checkbox-item\"><input type=\"checkbox\" id=\"${parentCheckboxId}\" /> ${parentCheckboxLabel || ''}</label>` : ''}
      <div id="bonus-inputs" style="${withParentCheckbox ? 'display:none;' : ''}">
        <div id="${warningId}" class="input-warning" style="display:none;">${warningText}</div>
        ${inputsHtml}
      </div>
    </div>
    ${continueId ? `<button type=\"button\" id=\"${continueId}\" class=\"simulation-button unavailable\" disabled>${continueText || 'Continue'}</button>` : ''}
  `;
  el.innerHTML = content;
  return el;
}
