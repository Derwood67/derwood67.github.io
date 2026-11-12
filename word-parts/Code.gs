// Word Parts Workshop → Google Sheet + teacher dashboard
//
// 1. Change TEACHER_CODE below to a code only you know (letters and numbers).
//    The teacher dashboard asks for it, so students can't open everyone's work.
// 2. Paste this into Extensions > Apps Script in a new Google Sheet, Save, then run "setup" once.
// 3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
// 4. Copy the web app URL into word-parts/config.js.
//
// Each time a student turns in a paragraph, one row is added to the "Paragraphs" tab.

const TEACHER_CODE = 'change-me';

const HEADERS = ['Turned in', 'Student', 'Grade (1-3)', 'Time spent (sec)', 'Time spent (min)', 'Sentences',
                 'Root words', 'Root words used', 'Mistakes found', 'Feedback given', 'Times checked', 'Paragraph'];

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const secs = num_(d.seconds);
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    getSheet_().appendRow([
      d.time ? new Date(d.time) : new Date(),
      clean_(d.student, 60), grade_(d.grade), secs, secs === '' ? '' : Math.round(secs / 6) / 10,
      num_(d.sentences), num_(d.rootCount), clean_(d.rootWords, 500), num_(d.mistakes),
      clean_(d.feedback, 3000), num_(d.checks), clean_(d.paragraph, 3500)
    ]);
  } finally {
    lock.releaseLock();
  }
  return text_('ok');
}

// Teacher dashboard reads: ?action=results&key=TEACHER_CODE
function doGet(e) {
  const p = e.parameter || {};
  if (!TEACHER_CODE || TEACHER_CODE === 'change-me') return json_({ error: 'setup', message: 'Set TEACHER_CODE in the Apps Script and deploy a new version.' });
  if (p.key !== TEACHER_CODE) return json_({ error: 'code', message: 'That teacher code is not right.' });
  return json_({ now: Date.now(), results: getRows_() });
}

function setup() { getSheet_(); }

function getRows_() {
  const sheet = getSheet_();
  const n = sheet.getLastRow();
  if (n < 2) return [];
  return sheet.getRange(2, 1, n - 1, HEADERS.length).getValues().map(function (r) {
    return { time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), student: String(r[1]), grade: r[2],
      seconds: r[3], sentences: r[5], rootCount: r[6], rootWords: String(r[7]), mistakes: r[8],
      feedback: String(r[9]), checks: r[10], paragraph: String(r[11]) };
  });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Paragraphs');
  if (!sheet) sheet = ss.insertSheet('Paragraphs', 0);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function text_(s) { return ContentService.createTextOutput(s); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function num_(v) { return v === '' || v == null || isNaN(Number(v)) ? '' : Number(v); }
function grade_(v) { const n = Math.round(Number(v)); return n >= 1 && n <= 3 ? n : ''; }
// Keeps text short and stops anything a student types from acting like a formula.
function clean_(v, max) {
  let s = String(v == null ? '' : v).slice(0, max || 500);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
