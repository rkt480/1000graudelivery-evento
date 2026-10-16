const form = document.querySelector('#registration-form');
const formScreen = document.querySelector('#form-screen');
const couponScreen = document.querySelector('#coupon-screen');
const phoneInput = document.querySelector('#whatsapp');
const formError = document.querySelector('#form-error');
const copyButton = document.querySelector('#copy-coupon');
const copyStatus = document.querySelector('#copy-status');
const backButton = document.querySelector('#back-to-form');
const submitButton = form.querySelector('button[type="submit"]');
const submitButtonLabel = submitButton.querySelector('span');
const registrationEndpoint = 'https://script.google.com/macros/s/AKfycbxUrf8v3xzsc7TFTJgRG9Lppga4FEOsbeEoWNI4p0vfZy00RMosChUfSg79YK7KseNTow/exec';

function phoneDigits(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length > 11) digits = digits.slice(2);
  return digits.slice(0, 11);
}

function formatPhone(value) {
  const digits = phoneDigits(value);
  if (!digits) return '';
  if (digits.length < 3) return `(${digits}`;
  const ddd = digits.slice(0, 2);
  const number = digits.slice(2);
  if (number.length <= 4) return `(${ddd}) ${number}`;
  if (number.length <= 8) return `(${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
  return `(${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
}

phoneInput.addEventListener('input', () => {
  const cursorAtEnd = phoneInput.selectionStart === phoneInput.value.length;
  phoneInput.value = formatPhone(phoneInput.value);
  if (cursorAtEnd) phoneInput.setSelectionRange(phoneInput.value.length, phoneInput.value.length);
  phoneInput.setCustomValidity('');
});

phoneInput.addEventListener('blur', () => {
  const digits = phoneDigits(phoneInput.value);
  phoneInput.setCustomValidity(digits.length === 10 || digits.length === 11 ? '' : 'Informe um WhatsApp com DDD.');
});

function showCoupon(updateHistory = true) {
  formScreen.hidden = true;
  couponScreen.hidden = false;
  formError.hidden = true;
  if (updateHistory && window.location.hash !== '#cupom') history.pushState({ coupon: true }, '', '#cupom');
  sessionStorage.setItem('milgrau-cupom-liberado', '1');
  document.title = 'Seu cupom BATALHA20 — Mil Grau';
  couponScreen.querySelector('h2').focus({ preventScroll: true });
  if (window.matchMedia('(max-width: 760px)').matches) {
    couponScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function showForm(clearSession = true) {
  couponScreen.hidden = true;
  formScreen.hidden = false;
  if (clearSession) sessionStorage.removeItem('milgrau-cupom-liberado');
  if (window.location.hash) history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  document.title = 'Pensou em Box, Pensou Mil Grau';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  phoneInput.setCustomValidity('');
  const digits = phoneDigits(phoneInput.value);
  if (digits.length !== 10 && digits.length !== 11) {
    phoneInput.setCustomValidity('Informe um WhatsApp com DDD.');
  }
  if (!form.reportValidity()) return;
  if (!form.checkValidity()) return;

  formError.hidden = true;
  submitButton.disabled = true;
  submitButtonLabel.textContent = 'ENVIANDO...';

  const formData = new FormData(form);
  const payload = {
    name: formData.get('name'),
    whatsapp: formData.get('whatsapp'),
    email: formData.get('email'),
    city: formData.get('city'),
    neighborhood: formData.get('neighborhood'),
    knowsBrand: formData.get('knows-brand'),
    followsInstagram: formData.get('follows-instagram'),
    website: formData.get('website') || ''
  };

  try {
    const response = await fetch(registrationEndpoint, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('request-failed');
    const result = await response.json();
    if (!result.ok) {
      formError.textContent = result.error || 'Não foi possível salvar seu cadastro. Tente novamente.';
      formError.hidden = false;
      return;
    }

    showCoupon();
  } catch {
    formError.textContent = 'Não foi possível confirmar o salvamento. Verifique sua conexão e tente novamente.';
    formError.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButtonLabel.textContent = 'VER MEU CUPOM';
  }
});

copyButton.addEventListener('click', async () => {
  const coupon = document.querySelector('#coupon-code').textContent.trim();
  try {
    await navigator.clipboard.writeText(coupon);
    copyStatus.textContent = 'Cupom copiado!';
  } catch {
    const helper = document.createElement('textarea');
    helper.value = coupon;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.append(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
    copyStatus.textContent = 'Cupom copiado!';
  }
});

backButton.addEventListener('click', () => showForm());

window.addEventListener('popstate', () => {
  if (window.location.hash === '#cupom' && sessionStorage.getItem('milgrau-cupom-liberado') === '1') {
    showCoupon(false);
  } else {
    showForm(false);
  }
});

if (window.location.hash === '#cupom' && sessionStorage.getItem('milgrau-cupom-liberado') === '1') {
  showCoupon(false);
}
