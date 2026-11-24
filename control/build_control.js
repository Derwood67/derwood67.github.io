// Builds control/apps.js from the portfolio's app list so the Control Center always matches it.
// Run from the site folder: node control/build_control.js
const fs = require("fs");
const s = fs.readFileSync("portfolio/index.html", "utf8");
const a = s.indexOf("const P = ["), b = s.indexOf("];", a);
const GH = "https://derwood67.github.io/";
const P = eval(s.slice(a + 10, b + 1));
// apps with a teacher dashboard or teacher view inside them
const DASH = {"fraction-summit":"Teacher dashboard","lemonade-war":"Teacher dashboard","novel-study":"Teacher dashboard",
  "research-lab":"Teacher dashboard","word-parts":"Teacher dashboard","spelling":"Teacher dashboard","story-trail":"Teacher view"};
const apps = P.map(p => {
  let u = p.u || "", where = !u ? "private" : u.indexOf(GH) === 0 ? "site" : "claude";
  if (where === "site") u = "/" + u.slice(GH.length);
  const folder = where === "site" ? (u.split("/")[1] || "") : "";
  const o = {s: p.s, t: p.t, d: p.d || "", u, where};
  if (DASH[folder]) o.dash = DASH[folder];
  return o;
});
fs.writeFileSync("control/apps.js",
  "/* Generated from the portfolio's app list (portfolio/index.html) by control/build_control.js.\n" +
  "   s = subject, t = name, d = description, u = link (site path or claude.ai), where = site | claude | private, dash = has a teacher dashboard. */\n" +
  "window.EC_APPS=" + JSON.stringify(apps).replace(/\},\{/g, "},\n{") + ";\n");
console.log(apps.length, "apps;", apps.filter(x => x.dash).length, "with dashboards");
