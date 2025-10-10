// Feedback form modal for pre-calculation gating
// Usage: import { openFeedbackModal } from './feedback-form.js'; await openFeedbackModal();

import { TEXT } from '../lang/eng.js';

export function openFeedbackModal() {
  const STR = TEXT?.defaults?.feedbackModal;
  if (!STR) throw new Error('Missing language pack: defaults.feedbackModal');
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'pca-modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'pca-modal';
    const closeBtn = document.createElement('div');
    closeBtn.className = 'pca-close';
    closeBtn.setAttribute('aria-label','Close');
    closeBtn.textContent = '×';
    const title = document.createElement('h3'); title.textContent = STR.title;
    const desc = document.createElement('p'); desc.className = 'pca-modal-desc'; desc.textContent = STR.desc;
    const form = document.createElement('form'); form.noValidate = true;

    const gEmail = document.createElement('div'); gEmail.className='pca-form-group';
    const lEmail = document.createElement('label'); lEmail.htmlFor='pca-email'; lEmail.textContent=STR.emailLabel;
    const iEmail = document.createElement('input'); iEmail.type='email'; iEmail.id='pca-email'; iEmail.name='email'; iEmail.placeholder=STR.emailPlaceholder; iEmail.required = true;
    const eEmail = document.createElement('div'); eEmail.className='pca-error'; eEmail.textContent = STR.errors.email;
    gEmail.appendChild(lEmail); gEmail.appendChild(iEmail); gEmail.appendChild(eEmail);

    const gFb = document.createElement('div'); gFb.className='pca-form-group';
    const lFb = document.createElement('label'); lFb.htmlFor='pca-feedback'; lFb.textContent=STR.feedbackLabel;
    const tFb = document.createElement('textarea'); tFb.id='pca-feedback'; tFb.name='feedback'; tFb.placeholder=STR.feedbackPlaceholder; tFb.required = true;
    const eFb = document.createElement('div'); eFb.className='pca-error'; eFb.textContent = STR.errors.feedback;
    gFb.appendChild(lFb); gFb.appendChild(tFb); gFb.appendChild(eFb);

    const gCb = document.createElement('div'); gCb.className='pca-checkbox';
    const cCb = document.createElement('input'); cCb.type='checkbox'; cCb.id='pca-contact'; cCb.name='contact';
    const lCb = document.createElement('label'); lCb.htmlFor='pca-contact'; lCb.textContent = STR.checkboxLabel;
    gCb.appendChild(cCb); gCb.appendChild(lCb);

    const actions = document.createElement('div'); actions.className='pca-actions';
    const btnCancel = document.createElement('button'); btnCancel.type='button'; btnCancel.className='pca-btn ghost'; btnCancel.textContent = STR.cancel;
    const btnSubmit = document.createElement('button'); btnSubmit.type='submit'; btnSubmit.className='pca-btn primary'; btnSubmit.textContent = STR.submit;
    actions.appendChild(btnCancel); actions.appendChild(btnSubmit);

    form.appendChild(gEmail); form.appendChild(gFb); form.appendChild(gCb); form.appendChild(actions);
    modal.appendChild(closeBtn); modal.appendChild(title); modal.appendChild(desc); modal.appendChild(form);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    function remove() { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); }
    function countWords(str){ return (str || '').trim().split(/\s+/).filter(Boolean).length; }
    function validate(){
      let ok = true;
      if (!iEmail.value || !iEmail.checkValidity()) { eEmail.classList.add('show'); ok = false; } else { eEmail.classList.remove('show'); }
      if (countWords(tFb.value) < 50) { eFb.classList.add('show'); ok = false; } else { eFb.classList.remove('show'); }
      return ok;
    }

    form.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      if (!validate()) return;
      const payload = { email: iEmail.value.trim(), feedback: tFb.value.trim(), contact: !!cCb.checked };
      // eslint-disable-next-line no-console
      console.log('[FeedbackModal] submitted:', payload);
      remove();
      resolve(true);
    });
    btnCancel.addEventListener('click', ()=>{ remove(); resolve(false); });
    closeBtn.addEventListener('click', ()=>{ remove(); resolve(false); });
    overlay.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ remove(); resolve(false); } });
    setTimeout(()=> iEmail.focus(), 0);
  });
}
