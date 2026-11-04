// Minute Math Sprint → Google Sheet
// Paste this into Extensions > Apps Script in your Google Sheet, then deploy as a web app.
// Each finished Baseline, Practice, or Sprint adds one row to the "Results" tab.
// The "Summary" tab shows each student's baseline, best sprint, and latest score per operation.

const HEADERS = ['Time', 'Student', 'Mode', 'Operation', 'Fact focus', 'Seconds',
                 'Correct', 'Tried', 'First try (practice)', 'Missed facts'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const sheet = getResults_();
    sheet.appendRow([
      d.time ? new Date(d.time) : new Date(),
      clean_(d.student), clean_(d.mode), clean_(d.operation), clean_(d.focus),
      d.seconds === '' ? '' : Number(d.seconds) || '',
      Number(d.correct) || 0, Number(d.tried) || 0,
      d.firstTry === '' ? '' : Number(d.firstTry) || 0,
      clean_(d.missed)
    ]);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

// Run this once from the Apps Script editor (select "setup" and press Run) to build both tabs.
function setup() {
  getResults_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sum = ss.getSheetByName('Summary') || ss.insertSheet('Summary');
  sum.clear();
  sum.getRange('A1').setValue('Baseline (latest) by student and operation');
  sum.getRange('A2').setFormula(
    "=IFERROR(QUERY(Results!A:G,\"select B, D, max(A), max(G) where C = 'Baseline' group by B, D " +
    "label B 'Student', D 'Operation', max(A) 'Last baseline', max(G) 'Best baseline'\",1),\"No baselines yet\")");
  sum.getRange('G1').setValue('Sprints by student and operation');
  sum.getRange('G2').setFormula(
    "=IFERROR(QUERY(Results!A:G,\"select B, D, count(G), max(G), avg(G) where C = 'Sprint' group by B, D " +
    "label B 'Student', D 'Operation', count(G) 'Sprints', max(G) 'Best', avg(G) 'Average'\",1),\"No sprints yet\")");
  sum.getRange('A1:G1').setFontWeight('bold');
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

// Keeps text short and stops anything a student types from acting like a formula.
function clean_(v) {
  let s = String(v == null ? '' : v).slice(0, 500);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
