const SPREADSHEET_ID = '1k8EYuawyUIjdEPjxzfjexCM6LwgVPPuvpI2IWFLajm';
const SHEET_NAME = 'Cadastros';
const HEADERS = [
  'Data e hora',
  'Nome',
  'WhatsApp',
  'E-mail',
  'Cidade',
  'Bairro',
  'Já conhecia a Mil Grau?',
  'Segue a Mil Grau no Instagram?'
];

function doPost(event) {
  try {
    const payload = JSON.parse(event && event.postData && event.postData.contents || '{}');

    // Honeypot: discard obvious bot submissions without revealing the check.
    if (String(payload.website || '').trim()) {
      return jsonResponse({ ok: true });
    }

    const record = validatePayload(payload);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      let sheet = spreadsheet.getSheetByName(SHEET_NAME);
      if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
      sheet.appendRow([
        new Date(),
        safeCell(record.name),
        safeCell(record.whatsapp),
        safeCell(record.email),
        safeCell(record.city),
        safeCell(record.neighborhood),
        record.knowsBrand,
        record.followsInstagram
      ]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error('Falha ao registrar cadastro: ' + (error && error.message || 'erro desconhecido'));
    return jsonResponse({ ok: false, error: 'Não foi possível salvar o cadastro.' });
  }
}

function validatePayload(payload) {
  const record = {
    name: cleanText(payload.name, 120),
    whatsapp: cleanText(payload.whatsapp, 30),
    email: cleanText(payload.email, 200),
    city: cleanText(payload.city, 120),
    neighborhood: cleanText(payload.neighborhood, 120),
    knowsBrand: normalizeChoice(payload.knowsBrand),
    followsInstagram: normalizeChoice(payload.followsInstagram)
  };

  if (record.name.length < 2 || record.city.length < 2 || record.neighborhood.length < 2) {
    throw new Error('Campos de texto incompletos.');
  }
  if (!/^\+?[\d\s().-]{10,20}$/.test(record.whatsapp)) {
    throw new Error('WhatsApp inválido.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
    throw new Error('E-mail inválido.');
  }

  return record;
}

function cleanText(value, maxLength) {
  const text = String(value == null ? '' : value).trim();
  if (!text || text.length > maxLength) throw new Error('Campo inválido.');
  return text;
}

function normalizeChoice(value) {
  const choice = String(value || '').trim().toLowerCase();
  if (choice === 'sim' || choice === 'não' || choice === 'nao') {
    return choice === 'sim' ? 'SIM' : 'NÃO';
  }
  throw new Error('Resposta inválida.');
}

function safeCell(value) {
  // A leading apostrophe keeps user-entered text from being interpreted as a formula.
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
