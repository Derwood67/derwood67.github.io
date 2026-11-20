// Word Parts Workshop → Google Sheet + teacher dashboard
//
// 1. Paste this into Extensions > Apps Script in a new Google Sheet, Save, then run "setup" once.
// 2. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
// 3. Copy the web app URL into word-parts/config.js.
//
// The teacher dashboard and the results page open with the class teacher code.
// Only a scrambled copy of that code is stored here (CODE_HASH), not the code itself.
// To use a different code instead, type it in TEACHER_CODE.
//
// "Paragraphs" tab: one row each time a student turns in a paragraph.
// "Sentences" tab:  one row each time a student checks a sentence (Explore cards and Write Sentences).
// "Missed" tab:     one row each time a student misses a word part in the Quiz or Find the Word Part.

const TEACHER_CODE = '';
const CODE_HASH = 'cf2d0fe7ea0a7780592080ef0bf415a6043a3d59aa5d72ace64d39c6e0837285';

const HEADERS = ['Turned in', 'Student', 'Rating (4 Mastery, 3 Almost, 2 Not yet, 1 Sorry)', 'Time spent (sec)', 'Time spent (min)', 'Sentences',
                 'Root words', 'Root words used', 'Mistakes found', 'Feedback given', 'Times checked', 'Paragraph'];
const S_HEADERS = ['Checked', 'Student', 'Activity', 'Task', 'Word part or words', 'Level', 'Sentence', 'Correct?', 'Feedback given'];
const M_HEADERS = ['Missed', 'Student', 'Activity', 'Word part or word', 'Type', 'Meaning', 'Part id'];

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    if (d.type === 'miss') {
      getSheet_('Missed', M_HEADERS).appendRow([
        d.time ? new Date(d.time) : new Date(), clean_(d.student, 60), clean_(d.activity, 40), clean_(d.text, 80),
        clean_(d.kind, 20), clean_(d.meaning, 300), clean_(d.key, 80)
      ]);
    } else if (d.type === 'sentence') {
      getSheet_('Sentences', S_HEADERS).appendRow([
        d.time ? new Date(d.time) : new Date(), clean_(d.student, 60), clean_(d.activity, 40), clean_(d.task, 300),
        clean_(d.key, 200), num_(d.level), clean_(d.text, 1500), d.passed ? 'Yes' : 'No', clean_(d.feedback, 3000)
      ]);
    } else {
      const secs = num_(d.seconds);
      getSheet_('Paragraphs', HEADERS).appendRow([
        d.time ? new Date(d.time) : new Date(),
        clean_(d.student, 60), grade_(d.grade), secs, secs === '' ? '' : Math.round(secs / 6) / 10,
        num_(d.sentences), num_(d.rootCount), clean_(d.rootWords, 500), num_(d.mistakes),
        clean_(d.feedback, 3000), num_(d.checks), clean_(d.paragraph, 3500)
      ]);
    }
  } finally {
    lock.releaseLock();
  }
  return text_('ok');
}

// Dashboard reads: ?action=results&key=CODE
function doGet(e) {
  const p = e.parameter || {};
  if (!keyOK_(p.key)) return json_({ error: 'code', message: 'That teacher code is not right.' });
  return json_({ now: Date.now(), results: getRows_(), sentences: getSentenceRows_(), misses: getMissRows_() });
}

function keyOK_(k) {
  k = String(k || '').trim();
  if (!k) return false;
  if (TEACHER_CODE && TEACHER_CODE !== 'change-me' && k === TEACHER_CODE) return true;
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'echols-room2:' + k, Utilities.Charset.UTF_8);
  const hex = bytes.map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
  return hex === CODE_HASH;
}

function setup() { getSheet_('Paragraphs', HEADERS); getSheet_('Sentences', S_HEADERS); getSheet_('Missed', M_HEADERS); }

function getMissRows_() {
  const sheet = getSheet_('Missed', M_HEADERS);
  const n = sheet.getLastRow();
  if (n < 2) return [];
  return sheet.getRange(2, 1, n - 1, M_HEADERS.length).getValues().map(function (r) {
    return { time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), student: String(r[1]), activity: String(r[2]),
      text: String(r[3]), kind: String(r[4]), meaning: String(r[5]), key: String(r[6]) };
  });
}

function getRows_() {
  const sheet = getSheet_('Paragraphs', HEADERS);
  const n = sheet.getLastRow();
  if (n < 2) return [];
  return sheet.getRange(2, 1, n - 1, HEADERS.length).getValues().map(function (r) {
    return { time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), student: String(r[1]), grade: r[2],
      seconds: r[3], sentences: r[5], rootCount: r[6], rootWords: String(r[7]), mistakes: r[8],
      feedback: String(r[9]), checks: r[10], paragraph: String(r[11]) };
  });
}

function getSentenceRows_() {
  const sheet = getSheet_('Sentences', S_HEADERS);
  const n = sheet.getLastRow();
  if (n < 2) return [];
  return sheet.getRange(2, 1, n - 1, S_HEADERS.length).getValues().map(function (r) {
    return { time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), student: String(r[1]), activity: String(r[2]),
      task: String(r[3]), key: String(r[4]), level: r[5], text: String(r[6]), passed: r[7] === 'Yes', feedback: String(r[8]) };
  });
}

function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function text_(s) { return ContentService.createTextOutput(s); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function num_(v) { return v === '' || v == null || isNaN(Number(v)) ? '' : Number(v); }
function grade_(v) { const n = Math.round(Number(v)); return n >= 1 && n <= 4 ? n : ''; }
// Keeps text short and stops anything a student types from acting like a formula.
function clean_(v, max) {
  let s = String(v == null ? '' : v).slice(0, max || 500);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
