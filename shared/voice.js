/* Darren Echols · Classroom Apps — Voice control for every app.
   Loaded by /shared/frame.js (or on its own:  <script src="/shared/voice.js"></script>).

   Adds two buttons to the top bar:
     🔊 Voice On / 🔇 Voice Off   students can turn it on and off (saved on this Chromebook)
     EN / ES                      English or Spanish voice. Teacher only: it asks for the teacher code.
   With the voice on:
     • tap any words on the page to hear them read aloud
     • rest the mouse on a button for a moment to hear what it says
     • select words with the mouse to hear just those words
     • the app's own read-aloud (Monifa, Read to me, Listen…) plays as usual
   With the voice off, nothing in the app talks.
   Spanish: text is translated to Spanish and read with a Spanish voice. Chrome's built-in translator is
   used when the computer has it; otherwise Google Translate. If neither works, the words are read in English.
   Apps whose own voice teaches English words (spelling, phonics, word parts, bingo, fluency) keep their
   word reading in English; tap-to-hear still reads in Spanish there.

   Class setting for every Chromebook: Control Center → Voice (saved in /classgate.json as
     "voice": {"lang": "en" | "es", "start": "on" | "off"} ).
   A teacher can also change the language on one computer from the EN/ES button.
   Options on the <script> tag (or on frame.js, which passes them on):
     data-voice="off"         no voice buttons on this page
     data-voice-keep="1"      keep this app's own speech in English (see KEEP below)
*/
(function(){
  if(window.ECVoice||!("speechSynthesis" in window)||!("SpeechSynthesisUtterance" in window))return;
  var me=document.currentScript;
  function attr(k){return (me&&me.getAttribute(k))||""}
  if(attr("data-voice")==="off")return;
  var S=window.speechSynthesis;
  var HASH="cf2d0fe7ea0a7780592080ef0bf415a6043a3d59aa5d72ace64d39c6e0837285", TRY="echols-classgate-tries";
  var K_ON="ec-voice-on", K_LANG="ec-voice-lang", K_T="ec-voice-teacher";
  var SEG=(decodeURIComponent(location.pathname).split("/").filter(Boolean)[0]||"").replace(/\.html$/,"");
  var KEEP=attr("data-voice-keep")==="1"||["spelling","phonics-sprint","phonics-voice","word-parts","word-wise-bingo","puente","fluency-sprints","minute-word-sprint","minute-reading-sprint"].indexOf(SEG)>-1;

  function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);v===null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){return null}}
  function ss(k,v){try{if(v===undefined)return sessionStorage.getItem(k);v===null?sessionStorage.removeItem(k):sessionStorage.setItem(k,v)}catch(e){return null}}
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}

  /* ---------- settings ---------- */
  var site={};                                  /* class setting from /classgate.json */
  var st={on:true,lang:"en"};
  function apply(){
    var on=ls(K_ON);st.on=on===null?site.start!=="off":on==="1";
    var l=ls(K_LANG);st.lang=l==="es"||l==="en"?l:(site.lang==="es"?"es":"en");
    draw()}
  function teacher(){return ss(K_T)==="1"||ss("ec-assign-ok")==="1"}
  fetch("/classgate.json?v="+Math.floor(Date.now()/60000),{cache:"no-store"}).then(function(r){return r.ok?r.json():{}})
    .then(function(j){site=(j&&j.voice)||{};apply()}).catch(function(){});
  window.addEventListener("storage",function(e){if(e.key===K_ON||e.key===K_LANG)apply()});

  /* ---------- voices ---------- */
  function voices(){try{return S.getVoices()||[]}catch(e){return []}}
  function best(re,order){var vs=voices().filter(function(v){return re.test(v.lang)});
    function rank(v){var i=order.indexOf(String(v.lang).replace("_","-"));return (i<0?order.length:i)*10-(/natural|online|neural|google/i.test(v.name)?5:0)}
    vs.sort(function(a,b){return rank(a)-rank(b)});return vs[0]||null}
  function esVoice(){return best(/^es/i,["es-US","es-MX","es-419","es-ES"])}
  function enVoice(){return best(/^en/i,["en-US","en-GB","en-CA","en-AU"])}
  try{S.addEventListener&&S.addEventListener("voiceschanged",function(){})}catch(e){}

  /* ---------- English → Spanish ---------- */
  var CACHE={};try{CACHE=JSON.parse(ss("ec-voice-tr")||"{}")}catch(e){}
  function remember(a,b){CACHE[a]=b;try{ss("ec-voice-tr",JSON.stringify(CACHE))}catch(e){CACHE={};CACHE[a]=b}}
  function within(p,ms){return Promise.race([p,new Promise(function(_,no){setTimeout(function(){no(new Error("slow"))},ms)})])}
  /* Chrome's on-device translator is used only when its Spanish pack is already on the computer; otherwise
     Google Translate is used right away, and the pack starts downloading the next time someone clicks. */
  var TR=null,AV=null,O={sourceLanguage:"en",targetLanguage:"es"},getting=false;
  function onDevice(){if(TR)return Promise.resolve(TR);if(!("Translator" in self))return Promise.resolve(null);
    if(!AV)AV=within(Translator.availability(O),1500).catch(function(){return "unavailable"});
    return AV.then(function(a){
      if(a==="available")return within(Translator.create(O),3000).then(function(t){TR=t;return t}).catch(function(){AV=Promise.resolve("unavailable");return null});
      if((a==="downloadable"||a==="downloading")&&!getting&&navigator.userActivation&&navigator.userActivation.isActive){getting=true;
        Translator.create(O).then(function(t){TR=t},function(){}).then(function(){getting=false})}
      return null})}
  function pieces(t){var out=[],cur="";(t.match(/[^.!?\n]+[.!?]*\s*|\n+/g)||[t]).forEach(function(s){if((cur+s).length>1400&&cur){out.push(cur);cur=""}cur+=s});if(cur)out.push(cur);return out}
  function cloud(t){return Promise.all(pieces(t).map(function(p){
      return fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q="+encodeURIComponent(p))
        .then(function(r){if(!r.ok)throw new Error("tr");return r.json()}).then(function(j){return (j[0]||[]).map(function(x){return x[0]||""}).join("")})}))
    .then(function(a){return a.join(" ")})}
  var noSpanish=false;
  function toSpanish(t){var k=String(t).trim();if(!k)return Promise.resolve(null);if(CACHE[k])return Promise.resolve(CACHE[k]);
    return onDevice().catch(function(){return null})
      .then(function(tr){return tr?within(tr.translate(k),8000):Promise.reject()})
      .catch(function(){return within(cloud(k),8000)})
      .then(function(r){r=String(r||"").trim();if(!r)throw 0;remember(k,r);return r})
      .catch(function(){if(!noSpanish){noSpanish=true;draw()}return null})}

  /* ---------- every app's speech goes through here ---------- */
  var speak0=S.speak.bind(S), cancel0=S.cancel.bind(S), gen=0, chain=Promise.resolve(), appSpokeAt=0, mine=null;
  function speak(u){
    if(!u||!(u instanceof SpeechSynthesisUtterance))return speak0(u);
    if(!u.__ecRead){appSpokeAt=Date.now();mine=null}
    if(!st.on){u.volume=0;return speak0(u)}             /* off: silent, but the app's timing (onend) still works */
    var es=st.lang==="es"&&u.__ec!=="as-is"&&!(KEEP&&!u.__ecRead)&&!/^es/i.test(u.lang||"")&&/[a-z]/i.test(u.text||"");
    if(!es)return speak0(u);
    var g=gen;
    chain=chain.then(function(){return toSpanish(u.text)}).then(function(t){
      if(g!==gen)return;
      if(t){u.text=t;var v=esVoice();u.voice=v||null;u.lang=v?v.lang:"es-US"}
      speak0(u)});
  }
  try{S.speak=speak;S.cancel=function(){gen++;chain=Promise.resolve();unmark();cancel0()}}catch(e){}

  /* ---------- tap to hear ---------- */
  var lit=null;
  function mark(el){unmark();if(el&&el.classList){lit=el;el.classList.add("ec-reading")}}
  function unmark(){if(lit){lit.classList.remove("ec-reading");lit=null}}
  function read(text,el){text=String(text||"").replace(/\s+/g," ").trim();if(!text||!st.on)return;
    S.cancel();
    var u=new SpeechSynthesisUtterance(text.slice(0,1500));u.__ecRead=true;u.rate=.95;
    if(st.lang==="en"){var v=enVoice();if(v){u.voice=v;u.lang=v.lang}else u.lang="en-US"}
    mine=u;mark(el);u.onend=u.onerror=function(){if(mine===u){mine=null;unmark()}};
    S.speak(u)}
  var OURS=".ec-voice,.ec-vpop,.ec-bar,.ec-std-note,.ec-guest-note,#cg-ov,#cg-badge";
  var CONTROLS="a,button,input,select,textarea,option,label,summary,[contenteditable],[contenteditable=''],[role=button],[role=link],[role=tab],[role=checkbox],[role=radio],[role=option],[role=switch],[role=slider],[draggable=true]";
  function pointy(el){for(var i=0;i<4&&el&&el!==document.body;i++,el=el.parentElement){try{if(getComputedStyle(el).cursor==="pointer")return el}catch(e){}}return null}
  function ownText(el){for(var n=el.firstChild;n;n=n.nextSibling)if(n.nodeType===3&&/\S/.test(n.nodeValue))return true;return false}
  var INLINE=/^(SPAN|B|I|EM|STRONG|U|SMALL|MARK|CODE|SUP|SUB|ABBR|Q|CITE|S|DEL|INS|KBD|VAR|BDI|FONT)$/;
  function block(t){var el=t;
    for(var i=0;i<5&&el&&el!==document.body;i++){if(ownText(el))break;el=el.parentElement}
    if(!el||el===document.body||!ownText(el))return null;
    while(el.parentElement&&INLINE.test(el.nodeName)&&el.parentElement!==document.body)el=el.parentElement;
    var tx=(el.innerText||el.textContent||"").replace(/\s+/g," ").trim();
    return tx&&tx.length<=1500?{el:el,tx:tx}:null}
  var justSelected=0;
  document.addEventListener("mouseup",function(e){if(!st.on||(e.target.closest&&e.target.closest(OURS+",input,textarea,[contenteditable]")))return;
    setTimeout(function(){var s="";try{s=String(window.getSelection()||"").trim()}catch(x){}
      if(s.length>1&&/[a-z0-9]/i.test(s)){justSelected=Date.now();read(s,null)}},10)});
  document.addEventListener("click",function(e){
    if(!st.on)return;
    if(Date.now()-justSelected<400)return;
    var t=e.target;if(!t||!t.closest||t.closest(OURS)||t.closest(CONTROLS)||pointy(t))return;
    if(Date.now()-appSpokeAt<500)return;              /* the app itself just started talking */
    var b=block(t);if(!b)return;
    if(lit===b.el&&mine){S.cancel();return}           /* tap again to stop */
    read(b.tx,b.el)});
  /* rest the mouse on a button, link or card for a moment to hear it */
  var hoverT=null, heardAt=new WeakMap();
  document.addEventListener("pointerover",function(e){
    if(!st.on||e.pointerType!=="mouse")return;
    var t=e.target;if(!t||!t.closest||t.closest(OURS))return;
    var el=t.closest(CONTROLS)||pointy(t);if(!el)return;
    clearTimeout(hoverT);
    hoverT=setTimeout(function(){
      if(S.speaking&&!mine)return;                     /* don't talk over the app */
      var last=heardAt.get(el)||0;if(Date.now()-last<5000)return;
      var tx=el.getAttribute("aria-label")||(/^(INPUT|TEXTAREA)$/.test(el.nodeName)?(el.value||el.placeholder||""):"")||el.innerText||el.title||"";
      tx=tx.replace(/\s+/g," ").trim();if(!tx||tx.length>240)return;
      heardAt.set(el,Date.now());read(tx,null)},800)});
  document.addEventListener("pointerout",function(){clearTimeout(hoverT)});

  /* ---------- the buttons ---------- */
  var css=document.createElement("style");css.textContent=
    ".ec-voice{display:flex;align-items:center;gap:4px;flex:none;margin-left:auto}"+
    ".ec-bar .ec-voice~.ec-pick,.ec-bar .ec-voice~.ec-back,.ec-bar .ec-voice~#cg-badge{margin-left:0}"+
    ".ec-voice button{font:700 14px/1 var(--ec-body,system-ui,sans-serif);color:inherit;background:transparent;border:1px solid #3a4c72;border-radius:999px;padding:7px 11px;cursor:pointer;display:flex;align-items:center;gap:5px;white-space:nowrap;min-height:32px}"+
    ".ec-voice button:hover{background:#22345a}.ec-voice button:focus-visible{outline:3px solid var(--ec-pencil,#f2b705);outline-offset:2px}"+
    ".ec-voice .ec-v-on[aria-pressed=true]{background:#1f5fbf;border-color:#1f5fbf;color:#fff}"+
    ".ec-voice .ec-v-lang small{font-size:11px;opacity:.8}"+
    ".ec-voice.ec-float{position:fixed;left:10px;bottom:10px;z-index:2147481000;background:#14213a;color:#fff;padding:5px;border-radius:999px;box-shadow:0 3px 10px rgba(0,0,0,.25);margin:0}"+
    "@media (max-width:900px){.ec-voice .ec-v-l{display:none}.ec-voice button{padding:7px 9px}}"+
    ".ec-vpop{position:fixed;z-index:2147483100;background:#fff;color:#14213a;border-radius:14px;box-shadow:0 10px 30px rgba(20,33,58,.28);padding:16px;width:290px;max-width:calc(100vw - 20px);font:15px/1.45 var(--ec-body,system-ui,sans-serif)}"+
    ".ec-vpop h3{margin:0 0 6px;font:700 17px/1.3 var(--ec-body,system-ui,sans-serif);color:#14213a}.ec-vpop p{margin:0 0 10px;color:#55627a;font-size:14px}"+
    ".ec-vpop form{display:flex;gap:6px;margin:0 0 6px}.ec-vpop input[type=password]{flex:1;min-width:0;font:inherit;padding:8px 10px;border:2px solid #dde3ea;border-radius:8px}"+
    ".ec-vpop button{font:700 14px/1.2 inherit;font-family:inherit;border:0;border-radius:8px;padding:9px 12px;background:#1f5fbf;color:#fff;cursor:pointer}"+
    ".ec-vpop .ec-vopt{display:flex;width:100%;text-align:left;background:#f4f6f8;color:#14213a;border:2px solid transparent;margin:0 0 6px;padding:10px 12px;gap:8px}"+
    ".ec-vpop .ec-vopt[aria-pressed=true]{border-color:#1f5fbf;background:#eaf1fc}"+
    ".ec-vpop .ec-vrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px}.ec-vpop .ec-vlink{background:none;color:#1f5fbf;padding:4px 0;text-decoration:underline}"+
    ".ec-vpop .ec-vmsg{min-height:1.2em;color:#a83226;font-size:13px}"+
    ".ec-reading{outline:3px solid #f2b705!important;outline-offset:2px;background-color:rgba(242,183,5,.14)!important;border-radius:4px}";
  document.head.appendChild(css);

  var box=null;
  function mount(tries){
    if(box&&box.isConnected)return;
    var bar=document.querySelector(".ec-bar .ec-bar-in");
    if(!bar&&(tries||0)<20&&document.querySelector('script[src*="/shared/frame.js"]'))return setTimeout(function(){mount((tries||0)+1)},150);
    box=document.createElement("div");box.className="ec-voice";box.setAttribute("role","group");box.setAttribute("aria-label","Voice");
    box.innerHTML='<button type="button" class="ec-v-on"></button><button type="button" class="ec-v-lang" aria-haspopup="dialog"></button>';
    if(bar){var at=bar.querySelector(".ec-pick")||bar.querySelector("#cg-badge")||bar.querySelector(".ec-back");if(at)bar.insertBefore(box,at);else bar.appendChild(box)}
    else{box.classList.add("ec-float");document.body.appendChild(box)}
    box.querySelector(".ec-v-on").onclick=function(){st.on=!st.on;ls(K_ON,st.on?"1":"0");if(!st.on){S.cancel()}draw();
      if(st.on)read(st.lang==="es"?"Voz activada. Toca las palabras para escucharlas.":"Voice on. Tap any words to hear them.",null)};
    box.querySelector(".ec-v-lang").onclick=function(e){e.stopPropagation();pop()};
    draw()}
  function draw(){if(!box)return;
    var b=box.querySelector(".ec-v-on"),l=box.querySelector(".ec-v-lang");
    b.setAttribute("aria-pressed",String(st.on));
    b.innerHTML=(st.on?'🔊':'🔇')+'<span class="ec-v-l">'+(st.on?' Voice on':' Voice off')+'</span>';
    b.title=st.on?"Voice is on. Tap any words to hear them. Click to turn the voice off.":"Voice is off. Click to turn it on.";
    l.innerHTML=(st.lang==="es"?'ES<span class="ec-v-l"> Español</span>':'EN<span class="ec-v-l"> English</span>')+(teacher()?'':' <small aria-hidden="true">🔒</small>');
    l.title="Voice language: "+(st.lang==="es"?"Spanish":"English")+(teacher()?"":" (teacher only)");
    l.setAttribute("aria-label",l.title);
    if(P)fill()}

  /* language panel (teacher only) */
  var P=null;
  function closePop(){if(P){P.remove();P=null;document.removeEventListener("click",outside,true);document.removeEventListener("keydown",onKey)}}
  function outside(e){if(P&&!P.contains(e.target)&&!(box&&box.querySelector(".ec-v-lang").contains(e.target)))closePop()}
  function onKey(e){if(e.key==="Escape"){closePop();box&&box.querySelector(".ec-v-lang").focus()}}
  function pop(){if(P){closePop();return}
    P=document.createElement("div");P.className="ec-vpop";P.setAttribute("role","dialog");P.setAttribute("aria-label","Voice language");
    document.body.appendChild(P);fill();place();
    setTimeout(function(){document.addEventListener("click",outside,true);document.addEventListener("keydown",onKey)},0)}
  function place(){if(!P||!box)return;var r=box.querySelector(".ec-v-lang").getBoundingClientRect(),w=P.offsetWidth,h=P.offsetHeight;
    var left=Math.max(10,Math.min(window.innerWidth-w-10,r.right-w)),top=r.bottom+8;if(top+h>window.innerHeight-10)top=Math.max(10,r.top-h-8);
    P.style.left=left+"px";P.style.top=top+"px"}
  function fill(){if(!P)return;
    if(!teacher()){
      P.innerHTML='<h3>Voice language</h3><p>The voice is in <b>'+(st.lang==="es"?"Spanish":"English")+'</b>. Only Mr. Echols can change the language.</p>'+
        '<form><input type="password" inputmode="numeric" autocomplete="off" placeholder="Teacher code" aria-label="Teacher code"><button type="submit">Unlock</button></form><div class="ec-vmsg" role="status"></div>';
      var f=P.querySelector("form"),i=f.querySelector("input");setTimeout(function(){i.focus()},0);
      f.onsubmit=function(e){e.preventDefault();check(i.value).then(function(r){
        if(r==="ok"){ss(K_T,"1");draw();fill();place()}else{i.value="";P.querySelector(".ec-vmsg").textContent=r==="wait"?"Too many tries. Wait 10 minutes and try again.":"That code is not right."}})};
      return}
    var dev=ls(K_LANG), cls=site.lang==="es"?"Español":"English";
    function opt(v,label,sub){var on=v===""?!dev:dev===v;return '<button type="button" class="ec-vopt" data-l="'+v+'" aria-pressed="'+on+'"><span>'+(on?"●":"○")+'</span><span><b>'+label+'</b>'+(sub?'<br><small>'+sub+'</small>':'')+'</span></button>'}
    P.innerHTML='<h3>Voice language</h3><p>For this computer. To set it for every Chromebook, use Control Center.</p>'+
      opt("","Class setting: "+cls,"Follows Control Center")+opt("en","English","Only on this computer")+opt("es","Español (Spanish)","Only on this computer")+
      (st.lang==="es"&&!esVoice()?'<div class="ec-vmsg">No Spanish voice is installed on this computer, so Chrome will use its closest voice.</div>':'')+
      (st.lang==="es"&&noSpanish?'<div class="ec-vmsg">Spanish translation could not be reached, so some words were read in English. Check the internet connection.</div>':'')+
      '<div class="ec-vrow"><button type="button" class="ec-vtest">▶ Test voice</button><a class="ec-vlink" href="/control/" target="_blank" rel="noopener">Control Center ↗</a><button type="button" class="ec-vlink ec-vlock">Lock</button></div>';
    P.querySelectorAll(".ec-vopt").forEach(function(b){b.onclick=function(){var v=b.getAttribute("data-l");ls(K_LANG,v||null);S.cancel();apply()}});
    P.querySelector(".ec-vtest").onclick=function(){if(!st.on){st.on=true;ls(K_ON,"1");draw()}
      read(st.lang==="es"?"Hello! This is the Spanish voice. Tap any words to hear them.":"Hello! This is the English voice. Tap any words to hear them.",null)};
    P.querySelector(".ec-vlock").onclick=function(){ss(K_T,null);ss("ec-assign-ok",null);draw();closePop()}}
  function sha256(t){return crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,"0")}).join("")})}
  function check(code){var t={};try{t=JSON.parse(ls(TRY))||{}}catch(x){}
    if(t.until&&Date.now()<t.until)return Promise.resolve("wait");
    return sha256("echols-room2:"+String(code||"").trim()).then(function(h){
      if(h===HASH){ls(TRY,null);return "ok"}
      t.n=(t.n||0)+1;if(t.n>=3)t={n:0,until:Date.now()+600000};ls(TRY,JSON.stringify(t));return t.until?"wait":"wrong"},function(){return "wrong"})}
  window.addEventListener("resize",place);

  window.ECVoice={isOn:function(){return st.on},lang:function(){return st.lang},read:read,keepsEnglish:KEEP};
  apply();
  if(document.body)mount();else document.addEventListener("DOMContentLoaded",function(){mount()});
})();
