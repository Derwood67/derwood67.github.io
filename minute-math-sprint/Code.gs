// Minute Math Sprint → Google Sheet + live teacher view
//
// 1. Change TEACHER_CODE below to a code only you know (letters and numbers).
//    The teacher view page asks for it, so students can't open everyone's scores.
// 2. Paste this into Extensions > Apps Script in your Google Sheet, Save, then run "setup" once.
// 3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
//
// Each finished Baseline, Practice, or Sprint adds one row to the "Results" tab.
// While students work, their screens send a short update every few seconds for the live view.

const TEACHER_CODE = 'change-me';

const HEADERS = ['Time', 'Student', 'Mode', 'Operation', 'Fact focus', 'Seconds',
                 'Correct', 'Tried', 'First try (practice)', 'Time used (sec)', 'Missed facts'];

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  if (d.type === 'live') {
    setLive_(d);
    return text_('ok');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    getResults_().appendRow([
      d.time ? new Date(d.time) : new Date(),
      clean_(d.student), clean_(d.mode), clean_(d.operation), clean_(d.focus),
      num_(d.seconds), Number(d.correct) || 0, Number(d.tried) || 0,
      num_(d.firstTry), num_(d.elapsed), clean_(d.missed)
    ]);
  } finally {
    lock.releaseLock();
  }
  setLive_(Object.assign({}, d, { status: 'finished' }));
  return text_('ok');
}

// Teacher view reads: ?action=live|results|clearLive&key=TEACHER_CODE
function doGet(e) {
  const p = e.parameter || {};
  if (!TEACHER_CODE || TEACHER_CODE === 'change-me') return json_({ error: 'setup', message: 'Set TEACHER_CODE in the Apps Script and deploy a new version.' });
  if (p.key !== TEACHER_CODE) return json_({ error: 'code', message: 'That teacher code is not right.' });
  if (p.action === 'live') return json_({ now: Date.now(), live: getLive_() });
  if (p.action === 'clearLive') { CacheService.getScriptCache().remove('liveIdx'); return json_({ ok: true }); }
  return json_({ now: Date.now(), results: getResultRows_() });
}

function setup() {
  getResults_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sum = ss.getSheetByName('Summary') || ss.insertSheet('Summary');
  sum.clear();
  sum.getRange('A1').setValue('Baselines by student and operation');
  sum.getRange('A2').setFormula(
    "=IFERROR(QUERY(Results!A:G,\"select B, D, max(A), max(G) where C = 'Baseline' group by B, D " +
    "label B 'Student', D 'Operation', max(A) 'Last baseline', max(G) 'Best baseline'\",1),\"No baselines yet\")");
  sum.getRange('G1').setValue('Sprints by student and operation');
  sum.getRange('G2').setFormula(
    "=IFERROR(QUERY(Results!A:G,\"select B, D, count(G), max(G), avg(G) where C = 'Sprint' group by B, D " +
    "label B 'Student', D 'Operation', count(G) 'Sprints', max(G) 'Best', avg(G) 'Average'\",1),\"No sprints yet\")");
  sum.getRange('A1:G1').setFontWeight('bold');
}

// ---- live board (kept in the script cache, not the sheet, so it stays fast) ----
function setLive_(d) {
  const cache = CacheService.getScriptCache();
  const id = String(d.student || '').trim().toLowerCase().slice(0, 60);
  if (!id) return;
  const rec = {
    student: clean_(d.student), mode: clean_(d.mode), operation: clean_(d.operation),
    focus: clean_(d.focus), status: clean_(d.status || 'working'),
    correct: Number(d.correct) || 0, tried: Number(d.tried) || 0,
    timeLeft: num_(d.timeLeft), total: num_(d.total), done: num_(d.done), count: num_(d.count),
    elapsed: num_(d.elapsed), current: clean_(d.current), recent: clean_(d.recent), at: Date.now()
  };
  cache.put('live:' + id, JSON.stringify(rec), 21600);
  const idx = JSON.parse(cache.get('liveIdx') || '[]');
  if (idx.indexOf(id) === -1) {
    const lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      const fresh = JSON.parse(cache.get('liveIdx') || '[]');
      if (fresh.indexOf(id) === -1) fresh.push(id);
      cache.put('liveIdx', JSON.stringify(fresh.slice(-200)), 21600);
    } finally { lock.releaseLock(); }
  }
}

function getLive_() {
  const cache = CacheService.getScriptCache();
  const idx = JSON.parse(cache.get('liveIdx') || '[]');
  if (!idx.length) return [];
  const got = cache.getAll(idx.map(function (id) { return 'live:' + id; }));
  return Object.keys(got).map(function (k) { return JSON.parse(got[k]); });
}

// ---- results history ----
function getResultRows_() {
  const sheet = getResults_();
  const n = sheet.getLastRow();
  if (n < 2) return [];
  const vals = sheet.getRange(2, 1, n - 1, HEADERS.length).getValues();
  return vals.map(function (r) {
    return { time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]), student: r[1], mode: r[2],
      operation: r[3], focus: String(r[4]), seconds: r[5], correct: r[6], tried: r[7],
      firstTry: r[8], elapsed: r[9], missed: r[10] };
  });
}

function getResults_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Results');
  if (!sheet) sheet = ss.insertSheet('Results', 0);
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
// Keeps text short and stops anything a student types from acting like a formula.
function clean_(v) {
  let s = String(v == null ? '' : v).slice(0, 500);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
