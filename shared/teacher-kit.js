/* Teacher Kit v1 — shared add-on for Darren's classroom apps.
   Adds: Demo walkthrough, class codes, a Teacher Control Panel tab (dashboard,
   class settings, worksheets), and TK.record() for apps to report results.
   Configure with window.TK_CONFIG before this script loads. */
(function () {
  "use strict";
  if (window.TK) return;
  var CFG = window.TK_CONFIG || {};
  var APP = CFG.app || (document.title || "app").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  var NAME = CFG.name || document.title || "This app";
  var FEATURES = CFG.features || { dashboard: true, worksheets: !!CFG.worksheet, classCode: true };
  if (FEATURES.classCode === undefined) FEATURES.classCode = !!FEATURES.dashboard;

  /* ---------- tiny helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function ls(k, v) { try { if (v === undefined) { var r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function slug(s) { return String(s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "student"; }
  function cleanCode(s) { return String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12); }
  function fmtDate(ts) { try { return new Date(ts).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); } catch (e) { return ""; } }
  function pct(s, t) { return t ? Math.round((s / t) * 100) : null; }
  async function hash(s) {
    try { var b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, "0"); }).join(""); }
    catch (e) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return "x" + h; }
  }
  function rng(seed) { var a = seed >>> 0 || 1; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  var K = { cls: "tk:" + APP + ":class", classes: "tk:" + APP + ":classes", data: function (c) { return "tk:" + APP + ":data:" + c; }, unlocked: "tk:" + APP + ":unlocked" };

  /* ---------- storage: shared db when available, this device otherwise ---------- */
  var db = null, dbReady;
  dbReady = (async function () {
    try { if (window.claude && window.claude.use) { db = await window.claude.use("db"); } } catch (e) { db = null; }
    return db;
  })();
  function classRef(code) { return db.doc("tkclasses/" + code); }
  function studentRef(code, s) { return db.doc("tkclasses/" + code + "/students/" + s); }

  var state = { demo: false, joined: ls(K.cls), unlocked: null };

  async function getClass(code) {
    var local = (ls(K.classes) || {})[code] || null;
    await dbReady;
    if (db) { try { var snap = await classRef(code).get(); if (snap.exists) return Object.assign({ shared: true }, snap.data()); } catch (e) {} }
    return local;
  }
  async function saveClass(code, info) {
    var all = ls(K.classes) || {}; all[code] = info; ls(K.classes, all);
    await dbReady;
    if (db) { try { await classRef(code).set(info); return true; } catch (e) { return false; } }
    return false;
  }
  async function loadStudents(code) {
    var local = (ls(K.data(code)) || {}).students || {};
    await dbReady;
    if (db) {
      try {
        var q = await db.collection("tkclasses/" + code + "/students").get();
        var out = {};
        q.docs.forEach(function (d) { out[d.id] = d.data(); });
        Object.keys(local).forEach(function (k) { if (!out[k]) out[k] = local[k]; });
        return { students: out, shared: true };
      } catch (e) {}
    }
    return { students: local, shared: false };
  }

  var writing = Promise.resolve();
  function record(r) {
    if (state.demo) return Promise.resolve(false);
    r = r || {};
    var cls = state.joined || { code: "NOCLASS", name: "" };
    /* byTeacher: the teacher runs this on their own device (team games, reading probes). Use the given name, and the class unlocked on this device. */
    if (r.byTeacher) { var u = state.unlocked || ls(K.unlocked) || {}; cls = { code: (state.joined && state.joined.code) || u.code || "NOCLASS", name: "" }; }
    var name = (cls.name || r.student || "").trim() || "Unnamed";
    var s = slug(name), code = cls.code || "NOCLASS";
    var item = { a: String(r.activity || "Activity").slice(0, 80), s: +r.score || 0, t: +r.total || 0, ts: Date.now() };
    if (r.detail) item.d = String(r.detail).slice(0, 300);
    if (r.standard) item.std = String(r.standard).slice(0, 40);
    var store = ls(K.data(code)) || { students: {} };
    var st = store.students[s] || { name: name, results: [] };
    st.name = name; st.results.push(item); st.results = st.results.slice(-300); st.updated = item.ts;
    store.students[s] = st; ls(K.data(code), store);
    if (!state.joined && !r.byTeacher && FEATURES.classCode) nudge();
    writing = writing.then(async function () {
      await dbReady;
      if (!db || code === "NOCLASS") return false;
      try {
        var ref = studentRef(code, s), cur = await ref.get();
        var body = cur.exists ? JSON.parse(JSON.stringify(cur.data())) : { name: name, results: [] };
        body.name = name; body.results = (body.results || []).concat([item]).slice(-300); body.updated = item.ts;
        await ref.set(body); return true;
      } catch (e) { return false; }
    });
    return writing;
  }

  /* ---------- styles ---------- */
  var css = `
.tk-root{--tk-bg:#fffdf8;--tk-ink:#1d2433;--tk-muted:#5d6678;--tk-line:#dcd6ca;--tk-acc:#2457c5;--tk-acc-ink:#fff;--tk-soft:#eef2fb;--tk-good:#1f7a4a;--tk-warn:#b45309;--tk-bad:#b42318;font:15px/1.45 "Lexend","Atkinson Hyperlegible","Segoe UI",system-ui,sans-serif;color:var(--tk-ink)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .tk-root{--tk-bg:#191d26;--tk-ink:#e8ebf2;--tk-muted:#a3abbd;--tk-line:#323947;--tk-acc:#8fb0ff;--tk-acc-ink:#0d1220;--tk-soft:#222a3b;--tk-good:#5fd39a;--tk-warn:#f5b555;--tk-bad:#ff8a80}}
:root[data-theme="dark"] .tk-root{--tk-bg:#191d26;--tk-ink:#e8ebf2;--tk-muted:#a3abbd;--tk-line:#323947;--tk-acc:#8fb0ff;--tk-acc-ink:#0d1220;--tk-soft:#222a3b;--tk-good:#5fd39a;--tk-warn:#f5b555;--tk-bad:#ff8a80}
.tk-root *{box-sizing:border-box}
.tk-root h1,.tk-root h2,.tk-root h3{font-family:inherit;text-shadow:none;color:var(--tk-ink);letter-spacing:normal;font-weight:800;-webkit-text-stroke:0;text-transform:none}
.tk-root :is(button,input,select,textarea){min-width:0;text-transform:none;letter-spacing:normal;margin:0;font-family:inherit}
.tk-dock{position:fixed;right:max(12px,env(safe-area-inset-right,0px));bottom:max(12px,env(safe-area-inset-bottom,0px));z-index:2147483000;display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end;max-width:calc(100vw - 24px)}
.tk-chip{font:600 13px/1 inherit;font-family:inherit;border:1.5px solid var(--tk-line);background:var(--tk-bg);color:var(--tk-ink);border-radius:999px;padding:9px 13px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.12);min-height:36px}
.tk-chip.acc{background:var(--tk-acc);border-color:var(--tk-acc);color:var(--tk-acc-ink)}
.tk-chip:focus-visible,.tk-btn:focus-visible,.tk-tab:focus-visible,.tk-in:focus-visible{outline:3px solid var(--tk-acc);outline-offset:2px}
.tk-dock .tk-min{padding:9px 11px}
.tk-panel{position:fixed;inset:0;z-index:2147483001;background:var(--tk-bg);overflow:auto;padding:max(16px,env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) 40px max(16px,env(safe-area-inset-left,0px))}
.tk-wrap{max-width:980px;margin:0 auto;display:grid;gap:16px}
.tk-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}
.tk-head h1{font-size:clamp(22px,4vw,30px);margin:0;line-height:1.15}
.tk-kick{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--tk-muted);font-weight:700;margin:0 0 4px}
.tk-tabs{display:flex;gap:4px;border-bottom:2px solid var(--tk-line);flex-wrap:wrap}
.tk-tab{font:inherit;font-weight:600;border:0;background:none;color:var(--tk-muted);padding:10px 14px;cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-2px}
.tk-tab[aria-selected="true"]{color:var(--tk-ink);border-bottom-color:var(--tk-acc)}
.tk-card{border:1.5px solid var(--tk-line);border-radius:14px;padding:16px;display:grid;gap:12px;background:var(--tk-bg)}
.tk-card h2{font-size:18px;margin:0}
.tk-row{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}
.tk-row>label{display:grid;gap:4px;font-size:13px;color:var(--tk-muted);font-weight:600;flex:1 1 160px}
.tk-in{font:inherit;font-size:16px;padding:10px 12px;border:1.5px solid var(--tk-line);border-radius:10px;background:var(--tk-bg);color:var(--tk-ink);width:100%;min-height:44px}
.tk-btn{font:inherit;font-weight:700;border:1.5px solid var(--tk-ink);background:transparent;color:var(--tk-ink);border-radius:10px;padding:10px 16px;cursor:pointer;min-height:44px}
.tk-btn.acc{background:var(--tk-acc);border-color:var(--tk-acc);color:var(--tk-acc-ink)}
.tk-btn.sm{min-height:34px;padding:6px 10px;font-size:13px}
.tk-note{color:var(--tk-muted);font-size:14px;margin:0}
.tk-msg{font-weight:600;min-height:1.3em;margin:0}.tk-msg.bad{color:var(--tk-bad)}.tk-msg.good{color:var(--tk-good)}
.tk-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
.tk-stat{border:1.5px solid var(--tk-line);border-radius:12px;padding:12px}
.tk-stat b{display:block;font-size:26px;font-variant-numeric:tabular-nums}
.tk-stat span{font-size:12px;color:var(--tk-muted);text-transform:uppercase;letter-spacing:.06em;font-weight:700}
.tk-tablewrap{overflow-x:auto}
.tk-table{border-collapse:collapse;width:100%;font-size:14px;font-variant-numeric:tabular-nums}
.tk-table th,.tk-table td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--tk-line);vertical-align:top}
.tk-table th{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--tk-muted)}
.tk-pill{display:inline-block;border-radius:999px;padding:2px 9px;font-size:12px;font-weight:700;border:1.5px solid currentColor}
.tk-pill.good{color:var(--tk-good)}.tk-pill.warn{color:var(--tk-warn)}.tk-pill.bad{color:var(--tk-bad)}
.tk-bar{height:8px;border-radius:99px;background:var(--tk-line);overflow:hidden;min-width:80px}.tk-bar i{display:block;height:100%;background:var(--tk-acc)}
.tk-demo-banner{position:fixed;left:50%;transform:translateX(-50%);top:max(10px,env(safe-area-inset-top,0px));z-index:2147483002;background:#ffcc33;color:#1d2433;font:700 13px/1 system-ui,sans-serif;padding:8px 14px;border-radius:999px;box-shadow:0 2px 10px rgba(0,0,0,.2)}
.tk-spot{position:fixed;z-index:2147483002;border-radius:12px;box-shadow:0 0 0 4px #ffcc33,0 0 0 9999px rgba(10,14,25,.55);pointer-events:none;transition:all .25s}
.tk-tip{position:fixed;z-index:2147483003;max-width:min(360px,calc(100vw - 32px));background:var(--tk-bg);border:2px solid var(--tk-acc);border-radius:14px;padding:14px 16px;display:grid;gap:8px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.tk-tip h3{margin:0;font-size:17px}.tk-tip p{margin:0}
.tk-tip .tk-row{justify-content:space-between;align-items:center}
.tk-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:max(64px,env(safe-area-inset-bottom,0px));z-index:2147483002;background:var(--tk-ink);color:var(--tk-bg);padding:10px 14px;border-radius:12px;font-weight:600;font-size:14px;display:flex;gap:10px;align-items:center;max-width:calc(100vw - 32px)}
.tk-toast button{font:inherit;font-weight:700;background:var(--tk-bg);color:var(--tk-ink);border:0;border-radius:8px;padding:6px 10px;cursor:pointer}
.tk-sheet{background:#fff;color:#111;border:1px solid #ccc;border-radius:6px;padding:28px 32px;font:15px/1.5 Georgia,"Times New Roman",serif;max-width:800px;margin:0 auto;width:100%}
.tk-sheet h2{font:700 22px/1.2 system-ui,sans-serif;margin:0 0 4px}
.tk-sheet .tk-meta{display:flex;justify-content:space-between;gap:16px;font:13px system-ui,sans-serif;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:12px;flex-wrap:wrap}
.tk-sheet ol{padding-left:24px;margin:0}.tk-sheet li{margin:0 0 16px;break-inside:avoid}
.tk-sheet .tk-ch{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 20px;margin-top:4px}
.tk-sheet .tk-lines{border-bottom:1px solid #999;height:26px}
.tk-sheet .tk-std{font:12px system-ui,sans-serif;color:#444}
.tk-sheet.key{margin-top:16px}
.tk-sheet .tk-ans{font-weight:700}
@media print{
 body.tk-printing>*:not(.tk-print){display:none!important}
 body.tk-printing .tk-print{display:block!important;position:static}
 .tk-print .tk-sheet{border:0;padding:0;max-width:none}
 .tk-print .tk-sheet.key{break-before:page;margin-top:0}
}
.tk-print{display:none}
`;
  var styleEl = el("style"); styleEl.textContent = css; document.head.appendChild(styleEl);

  /* ---------- dock ---------- */
  var root = el("div", "tk-root"); root.setAttribute("data-tk", "1");
  var dock = el("div", "tk-dock");
  var demoBtn = el("button", "tk-chip", "&#9654; Demo"); demoBtn.type = "button"; demoBtn.title = "Guided demo with sample data";
  var classBtn = el("button", "tk-chip"); classBtn.type = "button";
  var teachBtn = el("button", "tk-chip acc", "Teacher"); teachBtn.type = "button"; teachBtn.title = "Teacher control panel";
  var hideBtn = el("button", "tk-chip tk-min", "&#8722;"); hideBtn.type = "button"; hideBtn.title = "Hide these buttons"; hideBtn.setAttribute("aria-label", "Hide teacher buttons");
  dock.appendChild(demoBtn);
  if (FEATURES.classCode) dock.appendChild(classBtn);
  if (FEATURES.dashboard || FEATURES.worksheets || FEATURES.classCode) dock.appendChild(teachBtn);
  dock.appendChild(hideBtn);
  root.appendChild(dock);
  /* keep the app's own keyboard shortcuts from firing while typing in the kit */
  ["keydown", "keyup", "keypress"].forEach(function (t) { root.addEventListener(t, function (e) { e.stopPropagation(); }); });
  function paintClassBtn() {
    var j = state.joined;
    classBtn.textContent = j && j.code ? "Class " + j.code + (j.name ? " · " + j.name : "") : "Join class";
  }
  paintClassBtn();
  var collapsed = ls("tk:dock-collapsed") === true;
  function paintDock() {
    Array.prototype.forEach.call(dock.children, function (c) { if (c !== hideBtn) c.hidden = collapsed; });
    hideBtn.innerHTML = collapsed ? "&#9776;" : "&#8722;"; hideBtn.title = collapsed ? "Show Demo and Teacher buttons" : "Hide these buttons";
  }
  hideBtn.onclick = function () { collapsed = !collapsed; ls("tk:dock-collapsed", collapsed); paintDock(); };
  paintDock();

  function mount() { if (!root.isConnected) document.body.appendChild(root); }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);

  /* ---------- toast ---------- */
  var toastEl = null, nudged = false;
  function toast(msg, actionLabel, action, ms) {
    if (toastEl) toastEl.remove();
    toastEl = el("div", "tk-toast"); toastEl.setAttribute("role", "status");
    toastEl.appendChild(document.createTextNode(msg));
    if (actionLabel) { var b = el("button", null); b.type = "button"; b.textContent = actionLabel; b.onclick = function () { toastEl.remove(); action(); }; toastEl.appendChild(b); }
    root.appendChild(toastEl);
    var t = toastEl; setTimeout(function () { if (t.isConnected) t.remove(); }, ms || 6000);
  }
  function nudge() { if (nudged) return; nudged = true; toast("Saved on this device. Join your class to send scores to your teacher.", "Join class", openJoin); }

  /* ---------- student join ---------- */
  function modal(title, bodyBuilder) {
    var p = el("div", "tk-panel"); p.setAttribute("role", "dialog"); p.setAttribute("aria-label", title);
    p.style.background = "rgba(10,14,25,.55)"; p.style.display = "grid"; p.style.placeItems = "center";
    var c = el("div", "tk-card"); c.style.maxWidth = "460px"; c.style.width = "100%";
    c.appendChild(el("h2", null, esc(title)));
    bodyBuilder(c, function () { p.remove(); });
    p.appendChild(c); p.addEventListener("click", function (e) { if (e.target === p) p.remove(); });
    p.addEventListener("keydown", function (e) { if (e.key === "Escape") p.remove(); });
    root.appendChild(p); var f = c.querySelector("input,button"); if (f) f.focus();
    return p;
  }
  function openJoin() {
    modal("Join your class", function (c, close) {
      var j = state.joined || {};
      c.appendChild(el("p", "tk-note", "Type the class code your teacher gave you and your name. Your scores will go to your teacher's dashboard."));
      var row = el("div", "tk-row");
      var l1 = el("label", null, "Class code"); var code = el("input", "tk-in"); code.value = j.code || ""; code.autocomplete = "off"; code.maxLength = 12; code.style.textTransform = "uppercase"; l1.appendChild(code);
      var l2 = el("label", null, "Your name"); var nm = el("input", "tk-in"); nm.value = j.name || ""; nm.autocomplete = "off"; nm.maxLength = 30; l2.appendChild(nm);
      row.appendChild(l1); row.appendChild(l2); c.appendChild(row);
      var msg = el("p", "tk-msg"); c.appendChild(msg);
      var acts = el("div", "tk-row");
      var go = el("button", "tk-btn acc", "Join"); go.type = "button";
      var leave = el("button", "tk-btn", j.code ? "Leave class" : "Cancel"); leave.type = "button";
      acts.appendChild(go); acts.appendChild(leave); c.appendChild(acts);
      go.onclick = async function () {
        var cc = cleanCode(code.value), n = nm.value.trim();
        if (!cc) { msg.className = "tk-msg bad"; msg.textContent = "Type a class code."; return; }
        if (!n) { msg.className = "tk-msg bad"; msg.textContent = "Type your name."; return; }
        go.disabled = true; msg.className = "tk-msg"; msg.textContent = "Checking…";
        var info = await getClass(cc);
        go.disabled = false;
        if (!info) { msg.className = "tk-msg bad"; msg.textContent = "That code wasn't found. Check it with your teacher."; return; }
        state.joined = { code: cc, name: n }; ls(K.cls, state.joined); paintClassBtn(); close();
        toast("You joined " + (info.title || "class " + cc) + ".");
      };
      leave.onclick = function () { if (j.code) { state.joined = null; ls(K.cls, null); paintClassBtn(); } close(); };
      [code, nm].forEach(function (i) { i.addEventListener("keydown", function (e) { if (e.key === "Enter") go.click(); }); });
    });
  }
  classBtn.onclick = openJoin;

  /* ---------- teacher control panel (its own full-screen tab) ---------- */
  var panel = null, tab = "dash";
  function openPanel(which) {
    if (which) tab = which;
    if (panel) panel.remove();
    panel = el("div", "tk-panel"); panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Teacher control panel");
    var w = el("div", "tk-wrap"); panel.appendChild(w);
    var head = el("div", "tk-head");
    head.appendChild(el("div", null, '<p class="tk-kick">' + esc(NAME) + '</p><h1>Teacher control panel</h1>'));
    var close = el("button", "tk-btn", "Back to the app"); close.type = "button"; close.onclick = closePanel;
    head.appendChild(close); w.appendChild(head);
    var tabs = el("div", "tk-tabs"); tabs.setAttribute("role", "tablist");
    var list = [];
    if (FEATURES.dashboard) list.push(["dash", "Dashboard"]);
    if (FEATURES.classCode) list.push(["class", "Class code"]);
    if (FEATURES.worksheets && CFG.worksheet) list.push(["ws", "Worksheets"]);
    list.push(["demo", "Demo"]);
    if (!list.some(function (x) { return x[0] === tab; })) tab = list[0][0];
    list.forEach(function (t) {
      var b = el("button", "tk-tab", t[1]); b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-selected", String(t[0] === tab));
      b.onclick = function () { tab = t[0]; openPanel(); }; tabs.appendChild(b);
    });
    w.appendChild(tabs);
    var body = el("div", "tk-wrap"); w.appendChild(body);
    root.appendChild(panel);
    try { history.replaceState(null, "", "#teacher"); } catch (e) {}
    ({ dash: renderDash, "class": renderClass, ws: renderWs, demo: renderDemoTab })[tab](body);
  }
  function closePanel() { if (panel) panel.remove(); panel = null; try { if (location.hash === "#teacher") history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }
  teachBtn.onclick = function () { openPanel(); };
  function checkHash() { if (location.hash === "#teacher" && !panel) openPanel(); }
  window.addEventListener("hashchange", checkHash);
  setTimeout(checkHash, 50);

  /* --- unlock: teacher enters their class code + PIN --- */
  function unlockForm(body, after) {
    var c = el("div", "tk-card");
    c.appendChild(el("h2", null, "Open your class"));
    c.appendChild(el("p", "tk-note", "Type your class code and teacher PIN. New here? Make your own code in the <b>Class code</b> tab, or try the <b>Demo</b> tab to see a sample class."));
    var row = el("div", "tk-row");
    var l1 = el("label", null, "Class code"); var code = el("input", "tk-in"); code.autocomplete = "off"; code.maxLength = 12; code.style.textTransform = "uppercase"; l1.appendChild(code);
    var l2 = el("label", null, "Teacher PIN"); var pin = el("input", "tk-in"); pin.type = "password"; pin.inputMode = "numeric"; pin.autocomplete = "off"; pin.maxLength = 12; l2.appendChild(pin);
    var go = el("button", "tk-btn acc", "Open"); go.type = "button";
    row.appendChild(l1); row.appendChild(l2); row.appendChild(go); c.appendChild(row);
    var msg = el("p", "tk-msg"); c.appendChild(msg);
    var last = ls(K.unlocked); if (last && last.code) code.value = last.code;
    go.onclick = async function () {
      var cc = cleanCode(code.value);
      if (!cc || !pin.value) { msg.className = "tk-msg bad"; msg.textContent = "Type both your class code and PIN."; return; }
      go.disabled = true; msg.className = "tk-msg"; msg.textContent = "Checking…";
      var info = await getClass(cc); go.disabled = false;
      if (!info) { msg.className = "tk-msg bad"; msg.textContent = "No class with that code yet. Make it in the Class code tab."; return; }
      if (info.pinHash !== await hash(cc + ":" + pin.value)) { msg.className = "tk-msg bad"; msg.textContent = "That PIN doesn't match this class."; return; }
      state.unlocked = { code: cc, info: info }; ls(K.unlocked, { code: cc }); after();
    };
    [code, pin].forEach(function (i) { i.addEventListener("keydown", function (e) { if (e.key === "Enter") go.click(); }); });
    body.appendChild(c);
  }

  /* --- class code tab --- */
  function renderClass(body) {
    var c = el("div", "tk-card");
    c.appendChild(el("h2", null, "Make your own class code"));
    c.appendChild(el("p", "tk-note", "Pick a code your students will type, like <b>ECHOLS4</b> (letters and numbers, up to 12), and a PIN only you know. Each teacher's code keeps their students separate."));
    var row = el("div", "tk-row");
    var l0 = el("label", null, "Class name"); var title = el("input", "tk-in"); title.placeholder = "e.g. Mr. Echols, Grade 4"; title.maxLength = 50; l0.appendChild(title);
    var l1 = el("label", null, "Class code"); var code = el("input", "tk-in"); code.autocomplete = "off"; code.maxLength = 12; code.style.textTransform = "uppercase"; l1.appendChild(code);
    var l2 = el("label", null, "Teacher PIN (4+ characters)"); var pin = el("input", "tk-in"); pin.type = "password"; pin.autocomplete = "new-password"; pin.maxLength = 12; l2.appendChild(pin);
    row.appendChild(l0); row.appendChild(l1); row.appendChild(l2); c.appendChild(row);
    var acts = el("div", "tk-row"); var go = el("button", "tk-btn acc", "Create class code"); go.type = "button"; acts.appendChild(go); c.appendChild(acts);
    var msg = el("p", "tk-msg"); c.appendChild(msg);
    go.onclick = async function () {
      var cc = cleanCode(code.value);
      if (cc.length < 3) { msg.className = "tk-msg bad"; msg.textContent = "Use at least 3 letters or numbers for the code."; return; }
      if (pin.value.length < 4) { msg.className = "tk-msg bad"; msg.textContent = "Use at least 4 characters for the PIN."; return; }
      go.disabled = true; msg.className = "tk-msg"; msg.textContent = "Checking that the code is free…";
      var existing = await getClass(cc);
      if (existing) { go.disabled = false; msg.className = "tk-msg bad"; msg.textContent = "That code is already taken. Pick another, or open it from the Dashboard tab with its PIN."; return; }
      var info = { code: cc, title: title.value.trim().slice(0, 50), pinHash: await hash(cc + ":" + pin.value), created: Date.now() };
      var shared = await saveClass(cc, info); go.disabled = false;
      state.unlocked = { code: cc, info: info }; ls(K.unlocked, { code: cc });
      msg.className = "tk-msg good";
      msg.textContent = shared ? "Class " + cc + " is ready. Students tap “Join class” and type " + cc + "." : "Class " + cc + " is saved on this device. Scores reach your dashboard from students who use this same device, or from any device when the app's class sharing is on.";
    };
    body.appendChild(c);
    var how = el("div", "tk-card");
    how.appendChild(el("h2", null, "How students join"));
    how.appendChild(el("p", "tk-note", "Students tap <b>Join class</b> at the bottom of the app, type your code and their name, then play as usual. Every finished round goes to your dashboard. Codes and names are visible to anyone with the app link, so use first names or initials."));
    body.appendChild(how);
  }

  /* --- dashboard --- */
  function summarize(students) {
    var rows = Object.keys(students).map(function (k) {
      var st = students[k] || {}, rs = st.results || [];
      var s = 0, t = 0, byA = {};
      rs.forEach(function (r) { s += r.s || 0; t += r.t || 0; var a = byA[r.a] || (byA[r.a] = { s: 0, t: 0, n: 0, best: null, last: 0 }); a.s += r.s || 0; a.t += r.t || 0; a.n++; var p = pct(r.s, r.t); if (p != null && (a.best == null || p > a.best)) a.best = p; a.last = Math.max(a.last, r.ts || 0); });
      var lastR = rs[rs.length - 1];
      var recent = rs.slice(-5), rs_ = 0, rt_ = 0; recent.forEach(function (r) { rs_ += r.s || 0; rt_ += r.t || 0; });
      return { key: k, name: st.name || k, n: rs.length, avg: pct(s, t), recent: pct(rs_, rt_), last: lastR ? lastR.ts : 0, lastA: lastR ? lastR.a : "", byA: byA, results: rs };
    });
    rows.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return rows;
  }
  function band(p) { return p == null ? "" : p >= 80 ? "good" : p >= 60 ? "warn" : "bad"; }
  function pctCell(p) { return p == null ? "—" : '<span class="tk-pill ' + band(p) + '">' + p + "%</span>"; }
  function drawDash(body, students, opts) {
    opts = opts || {};
    var rows = summarize(students);
    var total = rows.reduce(function (n, r) { return n + r.n; }, 0);
    var avgs = rows.filter(function (r) { return r.avg != null; });
    var classAvg = avgs.length ? Math.round(avgs.reduce(function (n, r) { return n + r.avg; }, 0) / avgs.length) : null;
    var help = rows.filter(function (r) { return r.recent != null && r.recent < 70; });
    var top = el("div", "tk-card");
    top.appendChild(el("div", "tk-head", "<div><p class='tk-kick'>" + (opts.demo ? "Demo class (sample data)" : "Class " + esc(opts.code) + (opts.title ? " · " + esc(opts.title) : "")) + "</p><h2>Class at a glance</h2></div>"));
    var tools = el("div", "tk-row");
    if (!opts.demo) {
      var refresh = el("button", "tk-btn sm", "Refresh"); refresh.type = "button"; refresh.onclick = function () { openPanel("dash"); }; tools.appendChild(refresh);
      var lock = el("button", "tk-btn sm", "Lock"); lock.type = "button"; lock.onclick = function () { state.unlocked = null; openPanel("dash"); }; tools.appendChild(lock);
    }
    var csv = el("button", "tk-btn sm", "Copy results for a spreadsheet"); csv.type = "button";
    csv.onclick = function () {
      var lines = ["Student,Activity,Score,Total,Percent,Date"];
      rows.forEach(function (r) { r.results.forEach(function (x) { lines.push([r.name, x.a, x.s, x.t, pct(x.s, x.t) == null ? "" : pct(x.s, x.t), new Date(x.ts).toISOString().slice(0, 16).replace("T", " ")].map(function (v) { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(",")); }); });
      var text = lines.join("\n");
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { toast("Copied. Paste into Google Sheets or Excel."); }, function () { var ta = el("textarea", "tk-in"); ta.value = text; ta.rows = 6; top.appendChild(ta); ta.select(); });
    };
    tools.appendChild(csv); top.appendChild(tools);
    top.appendChild(el("div", "tk-stats",
      '<div class="tk-stat"><span>Students</span><b>' + rows.length + '</b></div>' +
      '<div class="tk-stat"><span>Rounds finished</span><b>' + total + '</b></div>' +
      '<div class="tk-stat"><span>Class average</span><b>' + (classAvg == null ? "—" : classAvg + "%") + '</b></div>' +
      '<div class="tk-stat"><span>Need support</span><b>' + help.length + '</b></div>'));
    if (opts.note) top.appendChild(el("p", "tk-note", opts.note));
    body.appendChild(top);
    if (!rows.length) { body.appendChild(el("div", "tk-card", "<h2>No results yet</h2><p class='tk-note'>When students join with your code and finish a round, they show up here. Try the Demo tab to see what this looks like with a full class.</p>")); return; }
    if (help.length) {
      body.appendChild(el("div", "tk-card", "<h2>Check in with</h2><p class='tk-note'>Under 70% across their last 5 rounds.</p><p>" + help.map(function (r) { return "<b>" + esc(r.name) + "</b> (" + r.recent + "%" + (r.lastA ? ", " + esc(r.lastA) : "") + ")"; }).join(" · ") + "</p>"));
    }
    var tc = el("div", "tk-card"); tc.appendChild(el("h2", null, "Students"));
    var tw = el("div", "tk-tablewrap");
    tw.innerHTML = "<table class='tk-table'><thead><tr><th>Student</th><th>Rounds</th><th>Average</th><th>Last 5</th><th>Last activity</th><th>When</th><th></th></tr></thead><tbody>" +
      rows.map(function (r, i) { return "<tr><td><b>" + esc(r.name) + "</b></td><td>" + r.n + "</td><td>" + pctCell(r.avg) + "</td><td>" + pctCell(r.recent) + "</td><td>" + esc(r.lastA) + "</td><td>" + (r.last ? esc(fmtDate(r.last)) : "") + "</td><td><button type='button' class='tk-btn sm' data-i='" + i + "'>Details</button></td></tr>"; }).join("") + "</tbody></table>";
    tc.appendChild(tw); body.appendChild(tc);
    var detail = el("div"); body.appendChild(detail);
    tw.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-i]"); if (!b) return; var r = rows[+b.dataset.i];
      detail.innerHTML = ""; var d = el("div", "tk-card");
      d.appendChild(el("h2", null, esc(r.name)));
      d.appendChild(el("div", "tk-tablewrap", "<table class='tk-table'><thead><tr><th>Activity</th><th>Rounds</th><th>Average</th><th>Best</th><th></th></tr></thead><tbody>" + Object.keys(r.byA).map(function (a) { var x = r.byA[a], p = pct(x.s, x.t); return "<tr><td>" + esc(a) + "</td><td>" + x.n + "</td><td>" + pctCell(p) + "</td><td>" + pctCell(x.best) + "</td><td><div class='tk-bar'><i style='width:" + (p || 0) + "%'></i></div></td></tr>"; }).join("") + "</tbody></table>"));
      d.appendChild(el("div", "tk-tablewrap", "<table class='tk-table'><thead><tr><th>When</th><th>Activity</th><th>Score</th><th>Notes</th></tr></thead><tbody>" + r.results.slice(-15).reverse().map(function (x) { return "<tr><td>" + esc(fmtDate(x.ts)) + "</td><td>" + esc(x.a) + "</td><td>" + (x.t ? x.s + " / " + x.t + " " + pctCell(pct(x.s, x.t)) : esc(x.s)) + "</td><td>" + esc(x.d || "") + "</td></tr>"; }).join("") + "</tbody></table>"));
      detail.appendChild(d); d.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  async function renderDash(body) {
    if (!state.unlocked) { unlockForm(body, function () { openPanel("dash"); }); return; }
    var code = state.unlocked.code;
    body.appendChild(el("p", "tk-note", "Loading class " + esc(code) + "…"));
    var res = await loadStudents(code);
    body.innerHTML = "";
    drawDash(body, res.students, { code: code, title: state.unlocked.info && state.unlocked.info.title, note: res.shared ? "Results from every device that joined " + code + "." : "Showing results saved on this device. Students on other devices send results once class sharing is available to them." });
  }

  /* --- sample data for demo --- */
  var DEMO_NAMES = ["Ava", "Mateo", "Jayden", "Sofia", "Malik", "Emma", "Diego", "Harper", "Kai", "Zoe", "Liam", "Nia"];
  function demoStudents() {
    var acts = (CFG.activities && CFG.activities.length) ? CFG.activities : ["Practice round", "Challenge round", "Quiz"];
    var r = rng(42), out = {}, now = Date.now();
    DEMO_NAMES.forEach(function (n, i) {
      var skill = 0.45 + r() * 0.5, results = [];
      var count = 4 + Math.floor(r() * 7);
      for (var k = 0; k < count; k++) {
        var t = 10, s = Math.max(0, Math.min(t, Math.round(t * (skill + (k / count) * 0.12 + (r() - 0.5) * 0.2))));
        results.push({ a: acts[Math.floor(r() * acts.length)], s: s, t: t, ts: now - (count - k) * 86400000 * (0.5 + r()) - i * 3600000 });
      }
      out[slug(n)] = { name: n, results: results };
    });
    return out;
  }

  /* --- demo tab + guided tour --- */
  function renderDemoTab(body) {
    var c = el("div", "tk-card");
    c.appendChild(el("h2", null, "Demo"));
    c.appendChild(el("p", "tk-note", "Show the app to students or another teacher. The walkthrough points out each part of the app. Nothing you do during the demo is saved as a real score."));
    var row = el("div", "tk-row");
    var tour = el("button", "tk-btn acc", "&#9654; Start the guided walkthrough"); tour.type = "button"; tour.onclick = function () { closePanel(); startTour(); };
    row.appendChild(tour); c.appendChild(row); body.appendChild(c);
    if (FEATURES.dashboard) { var h = el("div"); body.appendChild(h); drawDash(h, demoStudents(), { demo: true, note: "Sample students and scores, so you can see how the dashboard works before your class joins." }); }
  }
  var tourIdx = 0, spot = null, tip = null, banner = null;
  function defaultSteps() {
    var s = (CFG.demo && CFG.demo.steps) || [];
    var base = [{ title: "Welcome to " + NAME, text: (CFG.demo && CFG.demo.intro) || "This quick walkthrough shows how the app works. Tap Next to move through it." }];
    base = base.concat(s);
    if (FEATURES.classCode) base.push({ sel: function () { return classBtn; }, title: "Join your class", text: "Students tap here and type the class code from their teacher, plus their name. Their scores then go to the teacher's dashboard." });
    if (FEATURES.dashboard || FEATURES.worksheets) base.push({ sel: function () { return teachBtn; }, title: "Teacher control panel", text: "Teachers open their own tab here: make a class code, see the dashboard" + (FEATURES.worksheets && CFG.worksheet ? ", and print worksheets with answer keys." : ".") });
    base.push({ title: "You're ready!", text: "That's the tour. Close it and give the app a try." });
    return base;
  }
  function startTour() {
    state.demo = true; tourIdx = 0;
    if (collapsed) { collapsed = false; paintDock(); }
    if (CFG.demo && typeof CFG.demo.onStart === "function") { try { CFG.demo.onStart(); } catch (e) {} }
    banner = el("div", "tk-demo-banner", "DEMO MODE · nothing is saved"); root.appendChild(banner);
    showStep();
  }
  function endTour() {
    state.demo = false;
    [spot, tip, banner].forEach(function (x) { if (x) x.remove(); }); spot = tip = banner = null;
    window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true);
    if (CFG.demo && typeof CFG.demo.onEnd === "function") { try { CFG.demo.onEnd(); } catch (e) {} }
  }
  var curTarget = null;
  function resolve(sel) { try { if (!sel) return null; if (typeof sel === "function") return sel(); var list = String(sel).split("|"); for (var i = 0; i < list.length; i++) { var e = document.querySelector(list[i]); if (e && e.getClientRects().length) return e; } } catch (e) {} return null; }
  function showStep() {
    var steps = defaultSteps(), st = steps[tourIdx];
    if (st.before) { try { st.before(); } catch (e) {} }
    setTimeout(function () {
      curTarget = resolve(st.sel);
      if (!spot) { spot = el("div", "tk-spot"); root.appendChild(spot); }
      if (!tip) { tip = el("div", "tk-tip tk-root"); tip.setAttribute("role", "dialog"); tip.setAttribute("aria-live", "polite"); root.appendChild(tip); }
      tip.innerHTML = "<p class='tk-kick'>Step " + (tourIdx + 1) + " of " + steps.length + "</p><h3>" + esc(st.title) + "</h3><p>" + esc(st.text) + "</p>";
      var row = el("div", "tk-row");
      var exit = el("button", "tk-btn sm", "End demo"); exit.type = "button"; exit.onclick = endTour;
      var nav = el("div", "tk-row");
      if (tourIdx > 0) { var back = el("button", "tk-btn sm", "Back"); back.type = "button"; back.onclick = function () { tourIdx--; showStep(); }; nav.appendChild(back); }
      var last = tourIdx === steps.length - 1;
      var next = el("button", "tk-btn sm acc", last ? "Finish" : "Next"); next.type = "button"; next.onclick = function () { if (last) endTour(); else { tourIdx++; showStep(); } }; nav.appendChild(next);
      row.appendChild(exit); row.appendChild(nav); tip.appendChild(row);
      if (curTarget && curTarget.scrollIntoView) curTarget.scrollIntoView({ block: "center", behavior: "smooth" });
      place(); setTimeout(place, 350);
      window.addEventListener("resize", place); window.addEventListener("scroll", place, true);
      next.focus();
    }, st.before ? 250 : 0);
  }
  function place() {
    if (!tip) return;
    var vw = window.innerWidth, vh = window.innerHeight;
    if (curTarget && curTarget.isConnected) {
      var r = curTarget.getBoundingClientRect(), pad = 6;
      spot.style.display = "block";
      spot.style.left = (r.left - pad) + "px"; spot.style.top = (r.top - pad) + "px"; spot.style.width = (r.width + pad * 2) + "px"; spot.style.height = (r.height + pad * 2) + "px";
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      var top = r.bottom + 14; if (top + th > vh - 8) top = Math.max(8, r.top - th - 14);
      var left = Math.min(Math.max(8, r.left), vw - tw - 8);
      tip.style.left = left + "px"; tip.style.top = Math.max(8, Math.min(top, vh - th - 8)) + "px";
    } else {
      spot.style.display = "block"; spot.style.left = (vw / 2) + "px"; spot.style.top = (vh / 2) + "px"; spot.style.width = "0px"; spot.style.height = "0px";
      tip.style.left = Math.max(8, (vw - tip.offsetWidth) / 2) + "px"; tip.style.top = Math.max(8, (vh - tip.offsetHeight) / 2) + "px";
    }
  }
  demoBtn.onclick = function () { if (tip) endTour(); else startTour(); };

  /* --- worksheets --- */
  function renderWs(body) {
    var W = CFG.worksheet;
    var c = el("div", "tk-card");
    c.appendChild(el("h2", null, "Printable worksheets"));
    c.appendChild(el("p", "tk-note", "Make a worksheet from this app's content. Each version number gives a different worksheet, so you can print A and B versions. An answer key prints on its own page."));
    var row = el("div", "tk-row");
    var sets = W.sets || [{ name: W.title, gen: W.gen }];
    var l0 = el("label", null, "Skill"); var sel = el("select", "tk-in"); sets.forEach(function (s, i) { var o = el("option"); o.value = i; o.textContent = s.name; sel.appendChild(o); }); l0.appendChild(sel);
    var l1 = el("label", null, "Questions"); var cnt = el("select", "tk-in"); [5, 8, 10, 12, 15, 20].forEach(function (n) { var o = el("option"); o.value = n; o.textContent = n; if (n === (W.count || 10)) o.selected = true; cnt.appendChild(o); }); l1.appendChild(cnt);
    var l2 = el("label", null, "Version"); var ver = el("input", "tk-in"); ver.type = "number"; ver.min = 1; ver.value = 1; l2.appendChild(ver);
    var l3 = el("label", null, "Answer key"); var key = el("select", "tk-in"); key.innerHTML = "<option value='1'>Include</option><option value='0'>Leave out</option>"; l3.appendChild(key);
    row.appendChild(l0); row.appendChild(l1); row.appendChild(l2); row.appendChild(l3); c.appendChild(row);
    var acts = el("div", "tk-row");
    var prev = el("button", "tk-btn", "Preview"); prev.type = "button";
    var pr = el("button", "tk-btn acc", "Print"); pr.type = "button";
    acts.appendChild(prev); acts.appendChild(pr); c.appendChild(acts);
    body.appendChild(c);
    var out = el("div", "tk-wrap"); body.appendChild(out);
    function build() {
      var set = sets[+sel.value], n = +cnt.value, v = Math.max(1, +ver.value || 1);
      var r = rng(v * 7919 + (+sel.value) * 104729 + 13);
      var items = [];
      try { items = set.gen(r, n) || []; } catch (e) { items = []; }
      if (!Array.isArray(items)) items = [];
      if (items.length && !Array.isArray(items[0]) && items.length < n && typeof set.gen === "function") {
        var seenQ = {}; items.forEach(function (x) { seenQ[x.q || x.html] = 1; }); var guard = 0, dup = 0; while (items.length < n && guard++ < 200 && dup < 15) { var more = set.gen(r, 1); if (!more || !more.length) break; more.forEach(function (x) { var k = x.q || x.html; if (seenQ[k]) { dup++; } else { seenQ[k] = 1; items.push(x); } }); }
      }
      items = items.slice(0, n);
      var letter = String.fromCharCode(64 + ((v - 1) % 26) + 1);
      var std = (set.standards || W.standards || []).join(", ");
      var head = "<h2>" + esc(W.title || NAME) + (sets.length > 1 ? ": " + esc(set.name) : "") + "</h2><div class='tk-meta'><span>Name: ____________________________</span><span>Date: ____________</span><span>Version " + letter + "</span></div>" + (set.directions || W.directions ? "<p><b>Directions:</b> " + esc(set.directions || W.directions) + "</p>" : "") + (std ? "<p class='tk-std'>Standards: " + esc(std) + "</p>" : "");
      var qs = "<ol>" + items.map(function (it) {
        var h = "<li>" + (it.html ? it.html : esc(it.q));
        if (it.choices) h += "<div class='tk-ch'>" + it.choices.map(function (ch, i) { return "<span>" + "ABCDEFG"[i] + ". " + esc(ch) + "</span>"; }).join("") + "</div>";
        else for (var k = 0; k < (it.lines == null ? 1 : it.lines); k++) h += "<div class='tk-lines'></div>";
        return h + "</li>";
      }).join("") + "</ol>";
      var keyHtml = "<h2>Answer key · Version " + letter + "</h2><p class='tk-std'>" + esc(W.title || NAME) + (sets.length > 1 ? ": " + esc(set.name) : "") + "</p><ol>" + items.map(function (it) {
        var a = it.choices && typeof it.a === "number" ? "ABCDEFG"[it.a] + ". " + it.choices[it.a] : it.a;
        return "<li><span class='tk-ans'>" + esc(a) + "</span>" + (it.why ? " — " + esc(it.why) : "") + "</li>";
      }).join("") + "</ol>";
      return { sheet: head + qs, key: keyHtml, empty: !items.length };
    }
    function show() {
      var b = build(); out.innerHTML = "";
      if (b.empty) { out.appendChild(el("p", "tk-msg bad", "Couldn't build questions for this skill.")); return b; }
      out.appendChild(el("div", "tk-sheet", b.sheet));
      if (key.value === "1") out.appendChild(el("div", "tk-sheet key", b.key));
      return b;
    }
    prev.onclick = show;
    pr.onclick = function () {
      var b = show(); if (b.empty) return;
      var p = el("div", "tk-print tk-root"); p.appendChild(el("div", "tk-sheet", b.sheet)); if (key.value === "1") p.appendChild(el("div", "tk-sheet key", b.key));
      document.body.appendChild(p); document.body.classList.add("tk-printing");
      var done = function () { document.body.classList.remove("tk-printing"); p.remove(); window.removeEventListener("afterprint", done); };
      window.addEventListener("afterprint", done);
      setTimeout(function () { try { window.print(); } catch (e) {} setTimeout(done, 1500); }, 60);
    };
    show();
  }

  /* ---------- public API ---------- */
  window.TK = {
    record: record,
    isDemo: function () { return state.demo; },
    student: function () { return state.joined ? state.joined.name : ""; },
    classCode: function () { return state.joined ? state.joined.code : ""; },
    openTeacher: function (t) { openPanel(t); },
    startDemo: startTour,
    rng: rng,
    shuffle: function (arr, r) { var a = arr.slice(); r = r || Math.random; for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
    pick: function (arr, r) { return arr[Math.floor((r || Math.random)() * arr.length)]; },
    int: function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); }
  };
  /* Helper for worksheet sets built from a multiple-choice bank: [{q, o:[..], a:index, why}] */
  window.TK.fromBank = function (bank, map) {
    return function (r, n) {
      var picked = window.TK.shuffle(bank, r).slice(0, n);
      return picked.map(function (b) {
        var x = map ? map(b) : b;
        var ch = (x.o || x.choices || []).map(function (c, i) { return { c: c, ok: i === x.a }; });
        ch = window.TK.shuffle(ch, r);
        return ch.length ? { q: x.q, choices: ch.map(function (c) { return c.c; }), a: ch.findIndex(function (c) { return c.ok; }), why: x.why } : { q: x.q, a: x.answer || x.a, lines: x.lines };
      });
    };
  };
})();
