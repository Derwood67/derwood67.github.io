/* Teacher tools for the class gate settings (/classgate.json): teacher code check, load, save to GitHub, watch for the live site.
   Used by Control Center. Lock & Assign keeps the same key names, so a GitHub key saved on either page works on both. */
window.GateAdmin=(function(){
  var REPO="Derwood67/derwood67.github.io", PATH="classgate.json", BRANCH="main";
  var HASH="cf2d0fe7ea0a7780592080ef0bf415a6043a3d59aa5d72ace64d39c6e0837285", KEY="ec-assign-ghkey", OK="ec-assign-ok", TRY="echols-classgate-tries";
  var API="https://api.github.com/repos/"+REPO+"/contents/"+PATH;
  function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);v===null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){return null}}
  function ss(k,v){try{if(v===undefined)return sessionStorage.getItem(k);v===null?sessionStorage.removeItem(k):sessionStorage.setItem(k,v)}catch(e){return null}}
  function sha256(t){return crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,"0")}).join("")})}
  function b64(s){return btoa(unescape(encodeURIComponent(s)))}
  function unb64(s){return decodeURIComponent(escape(atob(String(s).replace(/\s/g,""))))}
  function first(n){return String(n||"").trim().split(/[\s\-_]+/)[0].toLowerCase().replace(/[^a-z]/g,"")}
  var sha=null;
  /* resolves "ok", "wrong" or "wait" (three wrong tries waits 10 minutes, same as the apps) */
  function checkCode(code){var t={};try{t=JSON.parse(ls(TRY))||{}}catch(x){}
    if(t.until&&Date.now()<t.until)return Promise.resolve("wait");
    return sha256("echols-room2:"+String(code||"").trim()).then(function(h){
      if(h===HASH){ls(TRY,null);ss(OK,"1");return "ok"}
      t.n=(t.n||0)+1;if(t.n>=3)t={n:0,until:Date.now()+600000};ls(TRY,JSON.stringify(t));return t.until?"wait":"wrong"})}
  function headers(){return {Authorization:"Bearer "+ls(KEY),Accept:"application/vnd.github+json","Content-Type":"application/json"}}
  function fromSite(){return fetch("/"+PATH+"?t="+Date.now(),{cache:"no-store"}).then(function(r){return r.ok?r.json():{}}).catch(function(){return {}})}
  function load(){
    if(!ls(KEY)){sha=null;return fromSite()}
    return fetch(API+"?ref="+BRANCH+"&t="+Date.now(),{headers:headers(),cache:"no-store"}).then(function(r){if(!r.ok)throw r;return r.json()})
      .then(function(j){sha=j.sha;return JSON.parse(unb64(j.content))}).catch(function(){sha=null;return fromSite()})}
  /* tidy a settings object for saving */
  function clean(c){var o={blocked:(c.blocked||[]).map(first).filter(Boolean),lockAll:!!c.lockAll,roster:c.roster||[],apps:{},voice:{lang:(c.voice||{}).lang==="es"?"es":"en",start:(c.voice||{}).start==="off"?"off":"on"},updated:new Date().toISOString()};
    Object.keys(c.apps||{}).forEach(function(k){var s=c.apps[k]||{};o.apps[k]=s.mode==="assigned"?{mode:"assigned",students:(s.students||[]).map(first).filter(Boolean)}:{mode:s.mode==="locked"?"locked":"open"}});return o}
  /* resolves {stamp} when GitHub accepted it; rejects with "key" | "conflict" | "nokey" | "other" */
  function save(c){var o=clean(c),text=JSON.stringify(o,null,2)+"\n";
    if(!ls(KEY))return Promise.reject(Object.assign(new Error("nokey"),{text:text}));
    var getSha=sha?Promise.resolve(sha):fetch(API+"?ref="+BRANCH+"&t="+Date.now(),{headers:headers(),cache:"no-store"}).then(function(r){return r.ok?r.json():{}}).then(function(j){return j.sha||null});
    return getSha.then(function(s){var body={message:"Control Center: update student app access",content:b64(text),branch:BRANCH};if(s)body.sha=s;
      return fetch(API,{method:"PUT",headers:headers(),body:JSON.stringify(body)})})
    .then(function(r){if(r.status===409||r.status===422){sha=null;throw new Error("conflict")}if(r.status===401||r.status===403)throw new Error("key");if(!r.ok)throw new Error("other");return r.json()})
    .then(function(j){sha=j.content&&j.content.sha;return {stamp:o.updated}})}
  function claudeURL(c){var text=JSON.stringify(clean(c),null,2);
    return "https://claude.ai/new?q="+encodeURIComponent("Update classgate.json on my GitHub Pages site derwood67.github.io (Lock & Assign settings for my student apps) to exactly this, then push it live:\n\n"+text)}
  /* GitHub Pages takes about a minute; calls back with true when the new settings are on the live site */
  function waitLive(stamp,cb){var n=0;(function poll(){n++;fromSite().then(function(j){if(j.updated===stamp)return cb(true);if(n<40)setTimeout(poll,6000);else cb(false)})})()}
  return {checkCode:checkCode,teacher:function(){return ss(OK)==="1"},endTeacher:function(){ss(OK,null)},hasKey:function(){return !!ls(KEY)},
    load:load,save:save,claudeURL:claudeURL,waitLive:waitLive,first:first};
})();
