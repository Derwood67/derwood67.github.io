/* Darren Echols · Classroom Apps — narrated demo for every app.
   Adds a "▶ Demo" button (in the top bar, or floating on pages without it). The demo:
     - saves everything this site keeps in the browser, starts the app fresh, and plays a short
       tour with a voice and captions, a moving pointer and a spotlight on each part;
     - blocks clicks and typing while it runs, so it can't be used to get into an app;
     - puts all saved work back exactly as it was when it ends (or the next time any app opens,
       if the tab was closed mid-demo).
   Each app's tour lives in /shared/demos/<folder>.js and calls ECDemo.define([...steps]).
   Step fields:
     say   what the guide says (also shown as the caption)
     at    where to point: a CSS selector, {text:"Start"} (a button with that text), or a list to try in order
     do    "click" | "type" | "select" | "submit" | "press"   (nothing = just point)
     value text to type, option to pick, or key to press
     need  true = skip this whole step (voice too) if "at" isn't on the screen
     wait  ms to pause after the step (default 600)
     run   function(h) for anything special; may return a promise
*/
(function(){
  if(window.ECDemo)return;
  var ME=document.currentScript;
  var SLUG=(ME&&ME.getAttribute("data-demo"))||location.pathname.replace(/index\.html?$/,"").split("/").filter(Boolean).join("-")||"home";
  var HAS=["behavior-log","brain-blast","check-in-challenge","control","eog-road-trip","fluency-sprints","fraction-bingo","fraction-hacktion",
    "fraction-summit","frog-hop-fractions","landform-word-match","lemonade-war","love-amalia","minute-math-sprint","minute-reading-sprint",
    "note-taking-lab","novel-study","paragraph-quest","phonics-sprint","phonics-voice","research-lab","science-lab","science-lab-echols",
    "standards","standards-explorer","story-trail","text-analyzer","water-cycle-games","word-parts"];
  var RUN="ec-demo-run", SNAP="ec-demo-snap", KEEP=/^(ec-standards$|ec-demo-)/;
  var LS=window.localStorage, SS=window.sessionStorage;
  var rawSet=Storage.prototype.setItem, rawRemove=Storage.prototype.removeItem, rawGet=Storage.prototype.getItem;
  function lget(k){try{return rawGet.call(LS,k)}catch(e){return null}}
  function lset(k,v){try{v==null?rawRemove.call(LS,k):rawSet.call(LS,k,v)}catch(e){}}
  function dump(st){var o={};try{for(var i=0;i<st.length;i++){var k=st.key(i);o[k]=rawGet.call(st,k)}}catch(e){}return o}
  var otherTab={};
  window.addEventListener("storage",function(e){if(e.key&&e.storageArea===LS)otherTab[e.key]=1});

  /* ---------- save / restore the class's real work ---------- */
  function restore(reload){
    var snap=null;try{snap=JSON.parse(lget(SNAP))}catch(e){}
    if(snap){
      [[LS,snap.ls||{},true],[SS,snap.ss||{},false]].forEach(function(x){var st=x[0],o=x[1],now=dump(st);
        Object.keys(now).forEach(function(k){if(!(k in o)&&!(x[2]&&otherTab[k])&&k!==SNAP&&k!==RUN)try{rawRemove.call(st,k)}catch(e){}});
        Object.keys(o).forEach(function(k){if(!(x[2]&&otherTab[k]))try{rawSet.call(st,k,o[k])}catch(e){}})});
    }
    lset(SNAP,null);lset(RUN,null);
    if(reload){
      /* the page is going away: don't let the app save demo work on its way out */
      try{Storage.prototype.setItem=function(){};Storage.prototype.removeItem=function(){};Storage.prototype.clear=function(){}}catch(e){}
      var u=location.pathname+location.search.replace(/([?&])ecdemo=1&?/,"$1").replace(/[?&]$/,"")+location.hash;
      /* same address (common when it ends in a #section): replace() would only jump within the page, so reload instead */
      if(u===location.pathname+location.search+location.hash)location.reload();else location.replace(u);
    }
  }
  function begin(){
    if(lget(SNAP))restore(false);
    var snap={ls:dump(LS),ss:dump(SS),at:Date.now()};
    lset(SNAP,JSON.stringify(snap));
    Object.keys(snap.ls).forEach(function(k){if(!KEEP.test(k))try{rawRemove.call(LS,k)}catch(e){}});
    Object.keys(snap.ss).forEach(function(k){if(k!=="ec-visitor")try{rawRemove.call(SS,k)}catch(e){}});
    lset(RUN,JSON.stringify({slug:SLUG,t:Date.now()}));
    try{Storage.prototype.setItem=function(){};Storage.prototype.removeItem=function(){}}catch(e){}
    location.reload();
  }

  /* ---------- voice ---------- */
  var synth=window.speechSynthesis, voice=null, muted=lget("ec-demo-muted")==="1";
  function pickVoice(){if(!synth)return;var vs=synth.getVoices()||[];if(!vs.length)return;
    var want=["Google US English","Samantha","Microsoft Aria Online (Natural) - English (United States)","Microsoft Jenny Online (Natural) - English (United States)","Microsoft Aria","Microsoft Jenny","Microsoft Zira","Karen","Google UK English Female","Moira","Tessa"];
    for(var i=0;i<want.length;i++)for(var j=0;j<vs.length;j++)if(vs[j].name.indexOf(want[i])===0){voice=vs[j];return}
    for(j=0;j<vs.length;j++)if(/^en[-_]US/i.test(vs[j].lang)){voice=vs[j];return}
    for(j=0;j<vs.length;j++)if(/^en/i.test(vs[j].lang)){voice=vs[j];return}}
  if(synth){pickVoice();try{synth.addEventListener("voiceschanged",pickVoice)}catch(e){synth.onvoiceschanged=pickVoice}}
  function words(t){return (String(t).match(/\S+/g)||[]).length}
  function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
  var speakId=0;
  function speak(text){
    var id=++speakId;
    var ms=window.ECDemoFast?150:Math.max(1400,words(text)*360+600);
    if(muted||!synth||!voice||window.ECDemoFast)return sleep(ms);
    var parts=String(text).match(/[^.!?]+[.!?]*\s*/g)||[text];
    return parts.reduce(function(p,part){return p.then(function(){
      if(id!==speakId||!part.trim())return;
      return new Promise(function(res){var u=new SpeechSynthesisUtterance(part.trim()),done=false;
        function fin(){if(!done){done=true;res()}}
        u.voice=voice;u.lang=voice.lang;u.rate=0.98;u.pitch=1.05;u.onend=fin;u.onerror=fin;
        setTimeout(fin,words(part)*700+4000);
        try{synth.speak(u)}catch(e){fin()}})})},Promise.resolve());
  }
  function hush(){speakId++;try{synth&&synth.cancel()}catch(e){}}

  /* ---------- finding things on the page ---------- */
  function shown(e){if(!e||!e.getBoundingClientRect)return false;var r=e.getBoundingClientRect();if(r.width<2||r.height<2)return false;
    var s=getComputedStyle(e);return s.visibility!=="hidden"&&s.display!=="none"&&!e.closest("#ecd-ui")}
  function byText(t,within){var root=within?document.querySelector(within):document;if(!root)return null;
    var want=String(t).toLowerCase().replace(/\s+/g," ").trim(),best=null,bestLen=1e9;
    var els=root.querySelectorAll("button,a,[role=button],[data-act],label,summary,.btn,.tab,.card,.tile,.pick,.lvl,.chip,.deck,.level,li,td,option,input[type=submit],input[type=button]");
    for(var i=0;i<els.length;i++){var e=els[i];if(!shown(e)||e.closest(".ec-bar"))continue;
      var tx=(e.innerText||e.value||"").toLowerCase().replace(/\s+/g," ").trim();if(!tx)continue;
      if(tx===want)return e;if(tx.indexOf(want)>=0&&tx.length<bestLen){best=e;bestLen=tx.length}}
    return best}
  function find(spec){
    if(!spec)return null;
    if(Array.isArray(spec)){for(var i=0;i<spec.length;i++){var f=find(spec[i]);if(f)return f}return null}
    if(typeof spec==="function"){try{return spec()}catch(e){return null}}
    if(spec.nodeType)return shown(spec)?spec:null;
    if(typeof spec==="object"&&spec.text!=null)return byText(spec.text,spec.within);
    var list;try{list=document.querySelectorAll(spec)}catch(e){return null}
    for(var j=0;j<list.length;j++)if(shown(list[j]))return list[j];return null}
  async function waitFor(spec,ms){var t=Date.now();while(Date.now()-t<(ms||3000)){var e=find(spec);if(e)return e;await sleep(150)}return null}

  /* ---------- acting like a user ---------- */
  var nativeVal=function(el){var proto=el.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:el.tagName==="SELECT"?HTMLSelectElement.prototype:HTMLInputElement.prototype;
    return Object.getOwnPropertyDescriptor(proto,"value").set};
  function fire(el,type){el.dispatchEvent(new Event(type,{bubbles:true}))}
  async function typeInto(el,text){el.focus&&el.focus();var set=nativeVal(el);set.call(el,"");fire(el,"input");
    for(var i=0;i<text.length;i++){set.call(el,text.slice(0,i+1));fire(el,"input");
      el.dispatchEvent(new KeyboardEvent("keyup",{key:text[i],bubbles:true}));await sleep(window.ECDemoFast?5:70)}
    fire(el,"change")}
  function selectIn(el,v){var set=nativeVal(el),o=Array.prototype.find.call(el.options,function(o){return o.value===v||o.text.indexOf(v)>=0});
    if(o)set.call(el,o.value);fire(el,"input");fire(el,"change")}
  function press(el,key){var code={Enter:13," ":32,Space:32}[key]||0;["keydown","keypress","keyup"].forEach(function(t){
    (el||document.activeElement||document.body).dispatchEvent(new KeyboardEvent(t,{key:key==="Space"?" ":key,code:key==="Space"?"Space":key,keyCode:code,which:code,bubbles:true}))})}
  function clickIt(el){
    var r=el.getBoundingClientRect(),o={bubbles:true,cancelable:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2,view:window};
    try{el.dispatchEvent(new PointerEvent("pointerdown",o));el.dispatchEvent(new MouseEvent("mousedown",o));
      el.dispatchEvent(new PointerEvent("pointerup",o));el.dispatchEvent(new MouseEvent("mouseup",o))}catch(e){}
    if(el.click)el.click();else el.dispatchEvent(new MouseEvent("click",o))}

  /* ---------- the guide on screen ---------- */
  var ui,cap,count,cursor,spot,shield,pauseBtn,paused=false,stopped=false,pauseWait=null;
  function css(){var s=document.createElement("style");s.textContent=
    "#ecd-ui{position:fixed;inset:0;z-index:2147483600;pointer-events:none;font-family:Inter,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif}"+
    "#ecd-shield{position:fixed;inset:0;pointer-events:auto;cursor:not-allowed;background:transparent}"+
    "#ecd-spot{position:fixed;border-radius:12px;box-shadow:0 0 0 4px #f5b301,0 0 0 9999px rgba(10,16,30,.28);transition:all .45s ease;opacity:0}"+
    "#ecd-cursor{position:fixed;left:50%;top:50%;width:30px;height:30px;transition:left .7s cubic-bezier(.4,.1,.2,1),top .7s cubic-bezier(.4,.1,.2,1);filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}"+
    "#ecd-cursor.tap:after{content:'';position:absolute;left:-14px;top:-14px;width:30px;height:30px;border-radius:50%;border:3px solid #f5b301;animation:ecdtap .5s ease-out}"+
    "@keyframes ecdtap{from{transform:scale(.3);opacity:1}to{transform:scale(1.6);opacity:0}}"+
    "#ecd-panel{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);width:min(640px,calc(100vw - 24px));background:#14213a;color:#fff;border-radius:16px;padding:14px 16px 12px;box-shadow:0 12px 40px rgba(0,0,0,.35);pointer-events:auto;cursor:default;border:2px solid #f5b301}"+
    "#ecd-panel.top{bottom:auto;top:70px}#ecd-panel .h{display:flex;align-items:center;gap:8px;font:800 12px/1 inherit;letter-spacing:.08em;text-transform:uppercase;color:#f5b301;margin-bottom:6px}"+
    "#ecd-panel .h .n{margin-left:auto;color:#b9c3d6;letter-spacing:0;text-transform:none;font-weight:600}"+
    "#ecd-cap{font-size:17px;line-height:1.45;min-height:50px}"+
    "#ecd-panel .b{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}"+
    "#ecd-panel button{font:700 14px inherit;border-radius:10px;padding:8px 13px;border:1.5px solid #5b6b8a;background:#1f3052;color:#fff;cursor:pointer}"+
    "#ecd-panel button:hover{background:#2b4170}#ecd-panel button.end{margin-left:auto;border-color:#f5b301;color:#f5b301}"+
    ".ecd-wave{display:inline-flex;gap:2px;align-items:flex-end;height:12px}.ecd-wave i{width:3px;background:#f5b301;border-radius:2px;animation:ecdw 1s infinite ease-in-out}"+
    ".ecd-wave i:nth-child(2){animation-delay:.15s}.ecd-wave i:nth-child(3){animation-delay:.3s}@keyframes ecdw{0%,100%{height:3px}50%{height:12px}}"+
    ".ecd-quiet .ecd-wave i{animation:none;height:3px}"+
    ".ec-demo-btn{display:inline-flex;align-items:center;gap:6px;font:700 13px/1 inherit;border-radius:999px;padding:8px 13px;border:1.5px solid #f5b301;background:transparent;color:#f5b301;cursor:pointer;white-space:nowrap;margin-right:8px}"+
    ".ec-demo-btn:hover{background:#f5b301;color:#14213a}"+
    ".ec-demo-btn.float{position:fixed;right:16px;bottom:16px;z-index:2147483500;background:#14213a;box-shadow:0 6px 20px rgba(0,0,0,.25)}"+
    "@media(max-width:700px){.ec-demo-btn .w{display:none}#ecd-cap{font-size:15px}}"+
    "@media(prefers-reduced-motion:reduce){#ecd-cursor,#ecd-spot{transition:none}}";
    document.head.appendChild(s)}
  function buildUI(){
    ui=document.createElement("div");ui.id="ecd-ui";ui.setAttribute("aria-live","polite");
    ui.innerHTML='<div id="ecd-shield" title="Demo is playing"></div><div id="ecd-spot"></div>'+
      '<svg id="ecd-cursor" viewBox="0 0 24 24"><path d="M3 2l7.5 19 2.6-7.4L21 11z" fill="#fff" stroke="#14213a" stroke-width="1.6" stroke-linejoin="round"/></svg>'+
      '<div id="ecd-panel" role="dialog" aria-label="App demo"><div class="h"><span class="ecd-wave"><i></i><i></i><i></i></span> Demo guide <span class="n" id="ecd-n"></span></div>'+
      '<div id="ecd-cap"></div><div class="b"><button type="button" id="ecd-pause">⏸ Pause</button><button type="button" id="ecd-mute"></button><button type="button" class="end" id="ecd-end">✕ End demo</button></div></div>';
    document.body.appendChild(ui);
    cap=ui.querySelector("#ecd-cap");count=ui.querySelector("#ecd-n");cursor=ui.querySelector("#ecd-cursor");spot=ui.querySelector("#ecd-spot");shield=ui.querySelector("#ecd-shield");
    pauseBtn=ui.querySelector("#ecd-pause");var mb=ui.querySelector("#ecd-mute");
    function mlabel(){mb.textContent=muted?"🔇 Voice off":"🔊 Voice on";ui.classList.toggle("ecd-quiet",muted)}mlabel();
    mb.onclick=function(){muted=!muted;lset("ec-demo-muted",muted?"1":null);if(muted)hush();mlabel()};
    pauseBtn.onclick=function(){paused=!paused;pauseBtn.textContent=paused?"▶ Resume":"⏸ Pause";if(paused)hush();else if(pauseWait){var w=pauseWait;pauseWait=null;w()}};
    ui.querySelector("#ecd-end").onclick=function(){finish(true)};
    /* students can't type into or click the app while the demo plays */
    ["keydown","keypress","keyup"].forEach(function(t){window.addEventListener(t,function(e){if(!e.isTrusted||!ui.isConnected)return;
      if(e.target&&e.target.closest&&e.target.closest("#ecd-panel"))return;
      if(e.key==="Escape"&&t==="keydown"){finish(true)}e.preventDefault();e.stopImmediatePropagation()},true)});
    ["mousedown","pointerdown","click","touchstart","wheel"].forEach(function(t){document.addEventListener(t,function(e){
      if(!e.isTrusted||!ui.isConnected||(e.target.closest&&e.target.closest("#ecd-panel")))return;if(t==="wheel")return;
      e.preventDefault();e.stopImmediatePropagation()},{capture:true,passive:false})});
  }
  function caption(t,i,n){cap.textContent=t;count.textContent=n?("Part "+i+" of "+n):""}
  async function hold(){while(paused&&!stopped){await new Promise(function(r){pauseWait=r})}}
  function cursorTo(el){if(!el)return;var r=el.getBoundingClientRect();cursor.style.left=(r.left+Math.min(r.width/2,r.width-8))+"px";cursor.style.top=(r.top+Math.min(r.height/2,r.height-6))+"px"}
  function spotOn(el){if(!el){spot.style.opacity=0;return}var r=el.getBoundingClientRect(),p=6;
    spot.style.left=(r.left-p)+"px";spot.style.top=(r.top-p)+"px";spot.style.width=(r.width+p*2)+"px";spot.style.height=(r.height+p*2)+"px";spot.style.opacity=1}
  async function focusOn(el){if(!el)return;var r=el.getBoundingClientRect();
    if(r.top<70||r.bottom>innerHeight-170){el.scrollIntoView({block:"center",behavior:window.ECDemoFast?"auto":"smooth"});await sleep(window.ECDemoFast?20:450)}
    spotOn(el);cursorTo(el);dodge(el);await sleep(window.ECDemoFast?20:650)}
  /* keep the caption panel from covering what it's pointing at */
  function dodge(el){var p=document.getElementById("ecd-panel");if(!p||!el)return;var r=el.getBoundingClientRect(),q=p.getBoundingClientRect();
    var top=p.classList.contains("top");
    if(!top&&r.bottom>q.top-8&&r.top<innerHeight/2+120)p.classList.add("top");
    else if(!top&&r.bottom>q.top-8){p.classList.add("top")}
    else if(top&&r.top<q.bottom+8)p.classList.remove("top")}
  async function tap(el){cursor.classList.remove("tap");void cursor.offsetWidth;cursor.classList.add("tap");await sleep(window.ECDemoFast?10:180);clickIt(el)}

  var helpers={$:find,waitFor:waitFor,sleep:sleep,click:async function(spec){var e=find(spec);if(e){await focusOn(e);await tap(e)}return e},
    type:async function(spec,v){var e=find(spec);if(e){await focusOn(e);await typeInto(e,v)}return e},
    select:function(spec,v){var e=find(spec);if(e)selectIn(e,v);return e},press:press,focus:focusOn,text:byText,fire:fire};

  var steps=null,loaded=null;
  window.ECDemo={define:function(s){steps=s;if(loaded)loaded()},slug:SLUG,helpers:helpers,restore:function(){restore(true)},
    /* sign-in step for the shared class sign-in card (skipped if the app has none) */
    signin:function(name){return [{need:true,at:"#cg-name",do:"type",value:name||"Sam",say:"First, type your first name, just like you do in class."},
      {need:true,at:"#cg-form button[type=submit], #cg-form button",do:"click",wait:900}]}};

  async function play(){
    window.ECDemoRunning=true;buildUI();
    caption("Getting the demo ready…");
    if(!steps){await new Promise(function(r){loaded=r;var sc=document.createElement("script");sc.src="/shared/demos/"+SLUG+".js";sc.onerror=r;document.head.appendChild(sc)})}
    if(!steps){caption("There's no demo for this app yet.");await sleep(2500);return finish(true)}
    var list=typeof steps==="function"?steps(helpers):steps;
    list=[].concat.apply([],list.map(function(s){return Array.isArray(s)?s:[s]}));
    await sleep(window.ECDemoFast?50:600);
    var spoken=list.filter(function(s){return s.say}).length,k=0;
    for(var i=0;i<list.length&&!stopped;i++){var s=list[i];await hold();if(stopped)break;
      try{
        if(s.until)await waitFor(s.until,s.timeout||4000);
        var el=s.at?(find(s.at)||(s.need?await waitFor(s.at,1500):null)):null;
        (window.ECDemoLog=window.ECDemoLog||[]).push([i,!!el,(s.say||s.do||"").slice(0,40)]);
        if(s.need&&s.at&&!el)continue;
        if(s.say){k++;caption(s.say,k,spoken)}
        var talk=s.say?speak(s.say):Promise.resolve();
        if(el)await focusOn(el);else spotOn(null);
        if(s.run){await s.run(helpers,el)}
        if(el&&s.do){
          if(s.do==="type"){if(!s.after)await talk;await typeInto(el,String(s.value||""))}
          else if(s.do==="select")selectIn(el,s.value);
          else if(s.do==="press")press(el,s.value||"Enter");
          else if(s.do==="submit"){if(el.form)el.form.requestSubmit?el.form.requestSubmit():el.form.submit();else press(el,"Enter")}
          else{if(!s.early)await talk;await tap(el);spotOn(null)}
        }
        await talk;if(stopped)break;
        await sleep(window.ECDemoFast?(window.ECDemoStepMs||30):(s.wait!=null?s.wait:600));
        if(el&&s.do)spotOn(null);
      }catch(err){if(window.console)console.warn("demo step",i,err)}
    }
    if(stopped)return;
    spotOn(null);caption("That's the demo! Everything is being put back the way it was.",0,0);count.textContent="";
    await speak("That's the demo! Now it's your turn.");await sleep(600);finish(true);
  }
  function finish(reload){if(stopped&&!reload)return;stopped=true;hush();window.ECDemoRunning=false;
    if(cap){cap.textContent="Putting everything back…"}restore(reload)}

  /* ---------- the button, and what to do when a page opens ---------- */
  function addButton(){
    if(HAS.indexOf(SLUG)<0||document.querySelector(".ec-demo-btn"))return;
    var b=document.createElement("button");b.type="button";b.className="ec-demo-btn";b.title="Watch a short demo with a voice guide";
    b.innerHTML='<span aria-hidden="true">▶</span> <span class="w">Watch </span>Demo';
    b.onclick=function(){
      var locked=document.querySelector("#cg-ov")&&/not available/i.test(document.querySelector("#cg-ov").innerText||"");
      if(locked)return;
      b.disabled=true;
      /* unlock the voice on this click (some browsers need a click before speaking) */
      try{if(synth&&!muted){var u=new SpeechSynthesisUtterance(" ");u.volume=0;synth.speak(u)}}catch(e){}
      begin()};
    var back=document.querySelector(".ec-bar .ec-back");
    if(back)back.parentNode.insertBefore(b,back);else{b.classList.add("float");document.body.appendChild(b)}
  }
  function boot(){
    css();
    var run=null;try{run=JSON.parse(lget(RUN))}catch(e){}
    if(run&&run.slug===SLUG&&!run.started&&Date.now()-run.t<60000){
      run.started=true;lset(RUN,JSON.stringify(run));
      setTimeout(function(){play()},window.ECDemoFast?300:900);
      return;
    }
    if(run||lget(SNAP)){restore(false)}
    addButton();
    var n=0,iv=setInterval(function(){addButton();if(++n>20||document.querySelector(".ec-demo-btn"))clearInterval(iv)},250);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
