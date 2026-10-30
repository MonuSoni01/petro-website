/* Petro Industech shared lead form handler. Load once per page. */
(() => {
  'use strict';
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxK9P-VF5E3Hb3TyKTKwuzYsC4lUhm9qy7GrN4MsbfQRMmX_Ll_7qEveNtNLYj938MP/exec';
  

const LEAD_SELECTOR = [
  'form[name="submit-to-google-sheet"]',
  'form#enquiryForm',
  'form#petroVisitForm',
  'form#petroExpoMeetingForm'
].join(', ');


  const clean = value => String(value == null ? '' : value).trim();
  const pick = (data, ...keys) => { for (const key of keys) { const value = clean(data.get(key)); if (value) return value; } return ''; };

function payloadFor(form) {

  const source = new FormData(form);
  const result = new FormData();

  const isLanding = form.id === 'enquiryForm';
  const isExpoVisit = form.id === 'petroVisitForm';
  const isExpoMeeting = form.id === 'petroExpoMeetingForm';

  const city = pick(source, 'City', 'city');

  const state = pick(source, 'State', 'state') ||
    (isLanding ? 'Rajasthan' : '');

  const notes = [];

  let enquiryType = pick(
    source,
    'Enquiry-Type',
    'enquiryType'
  ) || 'Request Product Price / Quotation';

  // LANDING PAGE
  if (isLanding) {

    notes.push('Landing page: ' + document.title);

    for (const [key, label] of [
      ['company', 'Company'],
      ['businessType', 'Business Type'],
      ['product', 'Product Requirement'],
      ['requirement', 'Additional Requirements']
    ]) {

      const value = pick(source, key);

      if (value) {
        notes.push(label + ': ' + value);
      }
    }
  }

  // INTEXT EXPO - PLAN YOUR VISIT
  if (isExpoVisit) {

    enquiryType = 'INTEXT Expo 2026 - Plan Your Visit';

    notes.push('Event: INTEXT Expo 2026');
    notes.push('Form: Plan Your Visit');
    notes.push('Hall: 1');
    notes.push('Stall: A30');

    const businessType = pick(source, 'businessType');
    const visitDate = pick(source, 'visitDate');

    if (businessType) {
      notes.push('Business Type: ' + businessType);
    }

    if (visitDate) {
      notes.push('Preferred Visit Date: ' + visitDate);
    }
  }

  // INTEXT EXPO - BOOK A MEETING
  if (isExpoMeeting) {

    enquiryType = 'INTEXT Expo 2026 - Book a Meeting';

    notes.push('Event: INTEXT Expo 2026');
    notes.push('Form: Book a Meeting');
    notes.push('Hall: 1');
    notes.push('Stall: A30');

    const businessType = pick(source, 'businessType');

    if (businessType) {
      notes.push('Business Type: ' + businessType);
    }
  }

  // COMMON MESSAGE
  const message = pick(source, 'Message', 'message');

  if (message) {
    notes.push(message);
  }

  // EXISTING GOOGLE SHEET FIELD STRUCTURE
  result.set(
    'Full-Name',
    pick(source, 'Full-Name', 'fullName', 'name')
  );

  result.set(
    'Contact-Number',
    pick(source, 'Contact-Number', 'phone')
  );

  result.set(
    'Email-Address',
    pick(source, 'Email-Address', 'email')
  );

  result.set('City', city);
  result.set('State', state);
  result.set('Enquiry-Type', enquiryType);
  result.set('Message', notes.join('\n'));

  result.set(
    'Source-Page',
    window.location.pathname
  );

  // EXISTING RECAPTCHA
  const captcha = pick(
    source,
    'g-recaptcha-response'
  );

  if (captcha) {
    result.set('g-recaptcha-response', captcha);
  }

  return result;
}

  function inspectResponse(raw) {
    let data;
    try { data = JSON.parse(raw); } catch (_) { return {ok:false, message:'Unrecognized server response. Check Google Sheet before resubmitting.'}; }
    if (data.status !== 'success' && data.success !== true) return {ok:false,message:clean(data.message || data.error || 'Server did not confirm success.')};
    // The existing endpoint may report success while CRM/WhatsApp fail independently.
    const warnings = [];
    for (const name of ['telecrm','whatsapp','email']) {
      const channel = data[name];
      if (channel && (channel.success === false || (channel.response && channel.response.success === false))) warnings.push(name);
    }
    return {ok:true, warnings};
  }
  function statusNode(form) {
    let node = form.querySelector('[data-petro-form-status]');
    if (!node) { node = document.createElement('p'); node.setAttribute('data-petro-form-status',''); node.setAttribute('role','status'); node.setAttribute('aria-live','polite'); node.style.marginTop='10px'; form.appendChild(node); }
    return node;
  }
  function showThankYouPopup(warnings) {
    let overlay = document.getElementById('petro-central-thankyou-overlay');
    if (!overlay) {
      const style = document.createElement('style');
      style.textContent = `
        #petro-central-thankyou-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(9,26,30,.67);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;opacity:0;transition:opacity .2s ease}
        #petro-central-thankyou-overlay.is-visible{opacity:1}
        #petro-central-thankyou-overlay .petro-popup-card{position:relative;width:min(100%,420px);padding:42px 28px 32px;border-radius:18px;background:#fff;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.22);font-family:'Fira Sans',Arial,sans-serif;box-sizing:border-box;transform:translateY(10px);transition:transform .2s ease}
        #petro-central-thankyou-overlay.is-visible .petro-popup-card{transform:translateY(0)}
        #petro-central-thankyou-overlay .petro-popup-icon{display:grid;place-items:center;margin:0 auto 18px;width:70px;height:70px;border-radius:50%;background:#e7f6f3;color:#108082;font-size:36px;font-weight:700}
        #petro-central-thankyou-overlay h2{font-size:27px;line-height:1.2;margin:0 0 12px;color:#202d32;font-weight:700}
        #petro-central-thankyou-overlay p{font-size:15px;line-height:1.65;color:#59666b;margin:0 0 24px}
        #petro-central-thankyou-overlay .petro-popup-done{border:0;border-radius:9px;background:#108082;color:#fff;font-weight:600;font-size:15px;padding:13px 38px;cursor:pointer}
        #petro-central-thankyou-overlay .petro-popup-done:hover{background:#0a6769}
        #petro-central-thankyou-overlay .petro-popup-close{position:absolute;right:14px;top:10px;background:transparent;border:0;color:#6c777b;font-size:28px;cursor:pointer;line-height:1;padding:6px}
        @media(max-width:480px){#petro-central-thankyou-overlay .petro-popup-card{padding:35px 20px 27px}#petro-central-thankyou-overlay h2{font-size:24px}}
      `;
      document.head.appendChild(style);
      overlay = document.createElement('div');
      overlay.id = 'petro-central-thankyou-overlay';
      overlay.setAttribute('role','dialog');
      overlay.setAttribute('aria-modal','true');
      overlay.setAttribute('aria-labelledby','petro-popup-heading');
      overlay.innerHTML = '<div class="petro-popup-card"><button type="button" class="petro-popup-close" aria-label="Close">&times;</button><div class="petro-popup-icon" aria-hidden="true">✓</div><h2 id="petro-popup-heading">Thank You!</h2><p class="petro-popup-description"></p><button type="button" class="petro-popup-done">Done</button></div>';
      document.body.appendChild(overlay);
      const close = () => { overlay.classList.remove('is-visible'); setTimeout(() => {overlay.hidden = true; overlay.style.display = 'none';}, 200); };
      overlay.querySelector('.petro-popup-close').addEventListener('click',close);
      overlay.querySelector('.petro-popup-done').addEventListener('click',close);
      overlay.addEventListener('click',e => {if(e.target === overlay)close();});
      overlay.addEventListener('keydown',e => {if(e.key === 'Escape')close();});
    }
    overlay.querySelector('.petro-popup-description').textContent = warnings.length
      ? 'Your enquiry was accepted by the server. Some follow-up integrations reported an issue; our team may need to verify your request.'
      : 'Your enquiry has been received. Our team will get in touch with you shortly.';
    overlay.hidden = false;
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
    overlay.querySelector('.petro-popup-done').focus();
  }
  function init(form) {
    if (form.dataset.petroBound) return;
    form.dataset.petroBound = '1';
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const captchaWidget = form.querySelector('.g-recaptcha');
      if (captchaWidget && (!window.grecaptcha || !window.grecaptcha.getResponse())) { alert('Please complete the reCAPTCHA.'); return; }
      const button = form.querySelector('[type="submit"]');
      if (button && button.disabled) return;
      const previous = button ? button.innerHTML : '';
      const status = statusNode(form);
      if (button) {button.disabled=true; button.textContent='Submitting...';}
      status.textContent='Sending your enquiry...';
      try {
        const response = await fetch(ENDPOINT, {method:'POST', body:payloadFor(form), redirect:'follow'});
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const result = inspectResponse(await response.text());
        if (!result.ok) throw new Error(result.message);
        status.textContent = '';
        form.reset();
        if (window.grecaptcha && typeof window.grecaptcha.reset === 'function') window.grecaptcha.reset();
        // Show one consistent, centered popup on every enquiry form.
        // Avoid calling legacy openPopup() to prevent duplicate popups.
        showThankYouPopup(result.warnings);

        
/* ==========================================
   INTEXT EXPO - THANK YOU PAGE REDIRECT
========================================== */

if (
  form.id === "petroVisitForm" ||
  form.id === "petroExpoMeetingForm"
) {

  const formType =
    form.id === "petroVisitForm"
      ? "visit"
      : "meeting";

  const thankYouURL =
    "/expo/intext-expo-thank-you.html" +
    "?type=" + encodeURIComponent(formType);

  // Server has confirmed the enquiry.
  window.location.assign(thankYouURL);

  return;
}

// OTHER WEBSITE FORMS KEEP EXISTING POPUP
showThankYouPopup(result.warnings);

      } catch(error) {
        console.error('Petro form submission:',error);
        status.textContent='Could not confirm submission. Check the Sheet before trying again. ' + error.message;
      } finally {if(button){button.disabled=false;button.innerHTML=previous;}}
    });
  }
  function start() {document.querySelectorAll(LEAD_SELECTOR).forEach(init);}
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
