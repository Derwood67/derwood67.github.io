/**
 * NC Grade 5 Science Lab — class records
 * Paste this into Extensions > Apps Script in a NEW Google Sheet, then
 * Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 * Student scores are stored only in this Google Sheet.
 */
const TABS = {
  Students: ["id", "name", "added"],
  Results:  ["id", "studentId", "name", "kind", "topic", "std", "title", "score", "total", "at", "source"],
  Notes:    ["id", "studentId", "text", "at"],
  Settings: ["setting", "value"]
};

/** Run once from the editor (optional): creates the four tabs. */
function setup() { ensure_(); }

let SS_ = null;
function ensure_() {
  if (SS_) return SS_;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(TABS).forEach(function (n) {
    let sh = ss.getSheetByName(n);
    if (!sh) {
      sh = ss.insertSheet(n);
      sh.getRange(1, 1, 1, TABS[n].length).setValues([TABS[n]]).setFontWeight("bold");
      sh.setFrozenRows(1);
    }
  });
  const st = ss.getSheetByName("Settings");
  if (st.getLastRow() < 2) {
    st.getRange(2, 1, 3, 2).setValues([["Teacher name", ""], ["Class name", "Grade 5 Science"], ["Teacher PIN", ""]]);
    st.getRange(4, 2).setNumberFormat("@");
  }
  const d = ss.getSheetByName("Sheet1");
  if (d && ss.getSheets().length > 4 && d.getLastRow() === 0) ss.deleteSheet(d);
  SS_ = ss;
  return ss;
}

function rows_(name) {
  const sh = ensure_().getSheetByName(name);
  const v = sh.getDataRange().getValues();
  const h = v.shift();
  const out = [];
  v.forEach(function (r, i) {
    if (r[0] === "" || r[0] === null) return;
    const o = { _row: i + 2 };
    h.forEach(function (k, j) { o[k] = r[j]; });
    out.push(o);
  });
  return out;
}

function settings_() {
  const o = {};
  rows_("Settings").forEach(function (r) { o[String(r.setting).trim()] = String(r.value).trim(); });
  return { teacherName: o["Teacher name"] || "", className: o["Class name"] || "", pin: o["Teacher PIN"] || "" };
}

function setSetting_(key, val) {
  const sh = ensure_().getSheetByName("Settings");
  const v = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getValues();
  for (let i = 1; i < v.length; i++) {
    if (String(v[i][0]).trim() === key) { sh.getRange(i + 1, 2).setNumberFormat("@").setValue(val); return; }
  }
  sh.appendRow([key, val]);
}

function norm_(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9 '\-]/g, "").replace(/\s+/g, " ").trim(); }
function clean_(s, max) {
  s = String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, max || 200);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function cleanText_(s) {
  s = String(s == null ? "" : s).trim().slice(0, 2000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function id_(p) { return p + Utilities.getUuid().replace(/-/g, "").slice(0, 10); }
function iso_(v) { return v instanceof Date ? v.toISOString() : String(v); }
function num_(v) { const n = Number(v); return isFinite(n) ? n : 0; }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function result_(r) {
  return { id: String(r.id), sid: String(r.studentId), name: String(r.name), kind: String(r.kind), topic: String(r.topic),
    std: String(r.std), title: String(r.title), score: num_(r.score), total: num_(r.total), at: iso_(r.at), src: String(r.source) };
}

function findStudent_(typed) {
  const n = norm_(typed);
  const st = rows_("Students");
  let m = st.filter(function (r) { return norm_(r.name) === n; });
  if (!m.length) m = st.filter(function (r) { return norm_(r.name).split(" ")[0] === n; });
  return m;
}

function deleteWhere_(name, test) {
  const sh = ensure_().getSheetByName(name);
  rows_(name).filter(test).map(function (r) { return r._row; }).sort(function (a, b) { return b - a; })
    .forEach(function (row) { sh.deleteRow(row); });
}

function doGet(e) {
  try {
    const s = settings_();
    return out_({ ok: true, teacherName: s.teacherName, className: s.className });
  } catch (err) { return out_({ ok: false, error: "server", message: String(err) }); }
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents || "{}"); } catch (err) { return out_({ ok: false, error: "bad_request" }); }
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    return out_(handle_(body));
  } catch (err) {
    return out_({ ok: false, error: "server", message: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

function handle_(b) {
  const a = String(b.action || "");
  const ss = ensure_();

  // ---- student actions ----
  if (a === "signin") {
    const m = findStudent_(b.name);
    if (!m.length) return { ok: false, error: "notfound" };
    if (m.length > 1) return { ok: false, error: "ambiguous" };
    return { ok: true, id: String(m[0].id), name: String(m[0].name) };
  }
  if (a === "mine") {
    const sid = String(b.id || "");
    if (!rows_("Students").some(function (r) { return String(r.id) === sid; })) return { ok: false, error: "notfound" };
    const res = rows_("Results").filter(function (r) { return String(r.studentId) === sid; }).map(result_);
    return { ok: true, results: res };
  }
  if (a === "save") {
    const sid = String(b.id || "");
    const st = rows_("Students").filter(function (r) { return String(r.id) === sid; })[0];
    if (!st) return { ok: false, error: "notfound" };
    const score = num_(b.score), total = num_(b.total);
    if (total <= 0 || score < 0 || score > total) return { ok: false, error: "bad_request" };
    const kind = b.kind === "game" ? "game" : "eog";
    ss.getSheetByName("Results").appendRow([id_("r"), sid, st.name, kind, clean_(b.topic, 20), clean_(b.std, 20),
      clean_(b.title, 120), score, total, new Date(), "student"]);
    return { ok: true };
  }

  // ---- teacher actions (PIN required) ----
  const s = settings_();
  if (!s.pin) return { ok: false, error: "nopin" };
  if (String(b.pin || "") !== s.pin) { Utilities.sleep(800); return { ok: false, error: "badpin" }; }

  if (a === "dash") {
    return { ok: true, teacherName: s.teacherName, className: s.className, sheetUrl: ss.getUrl(),
      students: rows_("Students").map(function (r) { return { id: String(r.id), name: String(r.name) }; }),
      results: rows_("Results").map(result_),
      notes: rows_("Notes").map(function (r) { return { id: String(r.id), sid: String(r.studentId), text: String(r.text), at: iso_(r.at) }; }) };
  }
  if (a === "addStudents") {
    const have = {}; rows_("Students").forEach(function (r) { have[norm_(r.name)] = 1; });
    const sh = ss.getSheetByName("Students"); let added = 0, skipped = 0;
    (b.names || []).slice(0, 200).forEach(function (n) {
      n = clean_(n, 60); const k = norm_(n);
      if (k.length < 2) return;
      if (have[k]) { skipped++; return; }
      have[k] = 1; sh.appendRow([id_("s"), n, new Date()]); added++;
    });
    return { ok: true, added: added, skipped: skipped };
  }
  if (a === "renameStudent") {
    const n = clean_(b.name, 60);
    if (norm_(n).length < 2) return { ok: false, error: "bad_request" };
    const all = rows_("Students");
    if (all.some(function (r) { return String(r.id) !== String(b.id) && norm_(r.name) === norm_(n); })) return { ok: false, error: "duplicate" };
    const r = all.filter(function (x) { return String(x.id) === String(b.id); })[0];
    if (!r) return { ok: false, error: "notfound" };
    ss.getSheetByName("Students").getRange(r._row, 2).setValue(n);
    const rs = ss.getSheetByName("Results");
    rows_("Results").forEach(function (x) { if (String(x.studentId) === String(b.id)) rs.getRange(x._row, 3).setValue(n); });
    return { ok: true };
  }
  if (a === "removeStudent") {
    const id = String(b.id);
    deleteWhere_("Results", function (r) { return String(r.studentId) === id; });
    deleteWhere_("Notes", function (r) { return String(r.studentId) === id; });
    deleteWhere_("Students", function (r) { return String(r.id) === id; });
    return { ok: true };
  }
  if (a === "addScore") {
    const st = rows_("Students").filter(function (r) { return String(r.id) === String(b.sid); })[0];
    if (!st) return { ok: false, error: "notfound" };
    const score = num_(b.score), total = num_(b.total);
    if (total <= 0 || score < 0 || score > total) return { ok: false, error: "bad_request" };
    const at = b.at ? new Date(b.at) : new Date();
    ss.getSheetByName("Results").appendRow([id_("r"), String(st.id), st.name, "manual", clean_(b.topic, 20), clean_(b.std, 20),
      clean_(b.title || "Teacher entry", 120), score, total, isNaN(at) ? new Date() : at, "teacher"]);
    return { ok: true };
  }
  if (a === "editScore") {
    const r = rows_("Results").filter(function (x) { return String(x.id) === String(b.id); })[0];
    if (!r) return { ok: false, error: "notfound" };
    const score = num_(b.score), total = num_(b.total);
    if (total <= 0 || score < 0 || score > total) return { ok: false, error: "bad_request" };
    ss.getSheetByName("Results").getRange(r._row, 8, 1, 2).setValues([[score, total]]);
    return { ok: true };
  }
  if (a === "deleteScore") { deleteWhere_("Results", function (r) { return String(r.id) === String(b.id); }); return { ok: true }; }
  if (a === "addNote") {
    if (!rows_("Students").some(function (r) { return String(r.id) === String(b.sid); })) return { ok: false, error: "notfound" };
    const t = cleanText_(b.text); if (!t) return { ok: false, error: "bad_request" };
    ss.getSheetByName("Notes").appendRow([id_("n"), String(b.sid), t, new Date()]);
    return { ok: true };
  }
  if (a === "deleteNote") { deleteWhere_("Notes", function (r) { return String(r.id) === String(b.id); }); return { ok: true }; }
  if (a === "saveSettings") {
    setSetting_("Teacher name", clean_(b.teacherName, 60));
    setSetting_("Class name", clean_(b.className, 60));
    if (b.newPin) {
      if (!/^\d{4,8}$/.test(String(b.newPin))) return { ok: false, error: "bad_pin_format" };
      setSetting_("Teacher PIN", String(b.newPin));
    }
    return { ok: true };
  }
  return { ok: false, error: "bad_request" };
}
