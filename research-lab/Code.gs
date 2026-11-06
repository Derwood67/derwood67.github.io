/**
 * Capital Research Lab — class records
 * Paste this into Extensions > Apps Script in a NEW Google Sheet, then
 * Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 * Student research is stored only in this Google Sheet.
 * Put your teacher PIN in the Settings tab (row "Teacher PIN").
 */
const TABS = {
  Students: ["id", "name", "question", "added", "lastActive"],
  Visits:   ["id", "studentId", "name", "kind", "sourceId", "title", "url", "topic", "at"],
  Notes:    ["id", "studentId", "name", "text", "source", "sourceUrl", "topic", "at"],
  Settings: ["setting", "value"]
};

/** Run once from the editor (optional): creates the tabs. */
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
    st.getRange(2, 1, 3, 2).setValues([["Teacher name", ""], ["Class name", "Capital Research Lab"], ["Teacher PIN", ""]]);
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

function norm_(s) { return String(s || "").toLowerCase().replace(/[^a-z '\-]/g, "").replace(/\s+/g, " ").trim(); }
function clean_(s, max) {
  s = String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, max || 200);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function cleanText_(s) {
  s = String(s == null ? "" : s).trim().slice(0, 1000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function url_(u) { u = String(u || "").trim().slice(0, 500); return /^https?:\/\//i.test(u) ? u : ""; }
function id_(p) { return p + Utilities.getUuid().replace(/-/g, "").slice(0, 10); }
function iso_(v) { return v instanceof Date ? v.toISOString() : String(v); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/** Finds a student by first name, adding them on first sign-in. */
function student_(typed) {
  const name = clean_(typed, 20).replace(/[^A-Za-z '\-]/g, "");
  const n = norm_(name);
  if (n.length < 2) return null;
  const sh = ensure_().getSheetByName("Students");
  const hit = rows_("Students").filter(function (r) { return norm_(r.name) === n; })[0];
  if (hit) { sh.getRange(hit._row, 5).setValue(new Date()); return hit; }
  const nice = name.charAt(0).toUpperCase() + name.slice(1);
  const id = id_("s");
  sh.appendRow([id, nice, "", new Date(), new Date()]);
  return { id: id, name: nice, question: "", _row: sh.getLastRow() };
}

function visit_(r) { return { id: String(r.id), sid: String(r.studentId), name: String(r.name), kind: String(r.kind), src: String(r.sourceId), t: String(r.title), u: String(r.url), topic: String(r.topic), at: iso_(r.at) }; }
function note_(r) { return { id: String(r.id), sid: String(r.studentId), name: String(r.name), text: String(r.text), src: String(r.source), url: String(r.sourceUrl), topic: String(r.topic), at: iso_(r.at) }; }

function deleteWhere_(name, test) {
  const sh = ensure_().getSheetByName(name);
  rows_(name).filter(test).map(function (r) { return r._row; }).sort(function (a, b) { return b - a; })
    .forEach(function (row) { sh.deleteRow(row); });
}

function doGet(e) {
  try { const s = settings_(); return out_({ ok: true, className: s.className, teacherName: s.teacherName, hasPin: !!s.pin }); }
  catch (err) { return out_({ ok: false, error: "server", message: String(err) }); }
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents || "{}"); } catch (err) { return out_({ ok: false, error: "bad_request" }); }
  const lock = LockService.getScriptLock();
  try { lock.waitLock(20000); return out_(handle_(body)); }
  catch (err) { return out_({ ok: false, error: "server", message: String(err) }); }
  finally { try { lock.releaseLock(); } catch (err) {} }
}

function handle_(b) {
  const a = String(b.action || "");
  const ss = ensure_();

  // ---- student actions (first name only) ----
  if (a === "signin" || a === "visit" || a === "note" || a === "deleteNote" || a === "question") {
    const st = student_(b.name);
    if (!st) return { ok: false, error: "bad_name" };
    const sid = String(st.id);
    if (a === "signin") {
      return { ok: true, id: sid, name: String(st.name), question: String(st.question || ""),
        visits: rows_("Visits").filter(function (r) { return String(r.studentId) === sid; }).map(visit_),
        notes: rows_("Notes").filter(function (r) { return String(r.studentId) === sid; }).map(note_) };
    }
    if (a === "visit") {
      const kind = ["site", "search", "other"].indexOf(b.kind) >= 0 ? b.kind : "site";
      const url = url_(b.url); if (!url) return { ok: false, error: "bad_request" };
      ss.getSheetByName("Visits").appendRow([id_("v"), sid, st.name, kind, clean_(b.sourceId, 40), clean_(b.title, 120), url, clean_(b.topic, 20), new Date()]);
      return { ok: true };
    }
    if (a === "note") {
      const t = cleanText_(b.text); if (!t) return { ok: false, error: "bad_request" };
      const id = id_("n");
      ss.getSheetByName("Notes").appendRow([id, sid, st.name, t, clean_(b.source, 120), url_(b.url), clean_(b.topic, 20), new Date()]);
      return { ok: true, id: id };
    }
    if (a === "deleteNote") {
      deleteWhere_("Notes", function (r) { return String(r.id) === String(b.id) && String(r.studentId) === sid; });
      return { ok: true };
    }
    if (a === "question") {
      ss.getSheetByName("Students").getRange(st._row, 3).setValue(cleanText_(b.text).slice(0, 400));
      return { ok: true };
    }
  }

  // ---- teacher actions (PIN required) ----
  const s = settings_();
  if (!s.pin) return { ok: false, error: "nopin" };
  if (String(b.pin || "") !== s.pin) { Utilities.sleep(800); return { ok: false, error: "badpin" }; }

  if (a === "dash") {
    return { ok: true, className: s.className, teacherName: s.teacherName, sheetUrl: ss.getUrl(),
      students: rows_("Students").map(function (r) { return { id: String(r.id), name: String(r.name), question: String(r.question || ""), added: iso_(r.added), last: iso_(r.lastActive) }; }),
      visits: rows_("Visits").map(visit_),
      notes: rows_("Notes").map(note_) };
  }
  if (a === "removeStudent") {
    const id = String(b.id);
    deleteWhere_("Visits", function (r) { return String(r.studentId) === id; });
    deleteWhere_("Notes", function (r) { return String(r.studentId) === id; });
    deleteWhere_("Students", function (r) { return String(r.id) === id; });
    return { ok: true };
  }
  if (a === "teacherDeleteNote") { deleteWhere_("Notes", function (r) { return String(r.id) === String(b.id); }); return { ok: true }; }
  if (a === "saveSettings") {
    setSetting_("Class name", clean_(b.className, 60));
    setSetting_("Teacher name", clean_(b.teacherName, 60));
    if (b.newPin) {
      const p = String(b.newPin).trim();
      if (p.length < 4 || p.length > 12) return { ok: false, error: "bad_pin" };
      setSetting_("Teacher PIN", p);
    }
    return { ok: true };
  }
  return { ok: false, error: "unknown_action" };
}
