/* Darren Echols · Classroom Apps — shared frame for every app on this site.
   Adds: the top bar, the favicon, the restyled sign-in card, and a "Try it as a guest" button
   so portfolio visitors can get in without a class name.

   Use in an app's <head>, after the app's own <style>:
     <link rel="stylesheet" href="/shared/brand.css">
     <script src="/shared/frame.js"
       data-app="The Egypt Game"            app name in the bar and on the sign-in card
       data-subject="ela"                   ela | flu | math | sci | rev | tool  (same colors as the portfolio)
       data-tags="Grade 5|RL.5.5|RL.5.6"    short tags, split with |
       data-guest="#nm"></script>           optional: the app's own first-name box, for apps with their own sign-in
   Portfolio links open apps as  /egypt-game/?visitor  so the guest button shows for visitors only.
*/
(function(){
  var me=document.currentScript;
  function a(k,d){return (me&&me.getAttribute(k))||d||""}
  var APP=window.EC_APP_NAME||a("data-app",document.title), SUBJECT=a("data-subject","tool"),
      TAGS=a("data-tags").split("|").map(function(s){return s.trim()}).filter(Boolean),
      GUEST_INPUT=a("data-guest"), HOME=a("data-home","/portfolio/");
  var SUBJECT_NAME={ela:"Reading & Writing",flu:"Fluency & Phonics",math:"Math",sci:"Science & Social Studies",rev:"Review & Test Prep",tool:"Teacher Tools"}[SUBJECT]||"";
  var GUEST_KEY="ec-guest";
  /* Standards switch: Common Core, a state, or a district. Saved for the whole site on this browser. */
  var STD_ON=a("data-standards")!=="off", JKEY="ec-standards";
  function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
  var STD=window.ECStandards, PICK=(STD_ON&&STD&&ls(JKEY))||"nc";
  function place(key){var p=String(key||"nc").split("/"),j=STD&&STD.JURIS[p[0]];if(!j)return {state:"nc",j:STD?STD.JURIS.nc:null};
    var d=p[1]&&j.districts&&j.districts[p[1]];return {state:p[0],j:j,d:d}}
  function options(sel){var o="";Object.keys(STD.JURIS).forEach(function(k){var j=STD.JURIS[k];
      o+='<option value="'+k+'"'+(sel===k?" selected":"")+'>'+esc(j.kind==="national"?j.label:j.label+(k==="nc"?" (NCDPI)":""))+'</option>';
      if(j.districts)Object.keys(j.districts).forEach(function(dk){var v=k+"/"+dk;o+='<option value="'+v+'"'+(sel===v?" selected":"")+'>   '+esc(j.districts[dk].label)+'</option>'})});
    return o}
  window.ECPlace=function(){return place(PICK)};
  /* The guest button only appears for visitors who came from the portfolio (its links add ?visitor).
     Students opening an app from Google Classroom never see it, so they still sign in with their name. */
  var VISITOR=/[?&]visitor\b/.test(location.search)||!!ss("ec-visitor");
  document.documentElement.setAttribute("data-ec-subject",SUBJECT);

  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
  function ss(k,v){try{if(v===undefined)return sessionStorage.getItem(k);v===null?sessionStorage.removeItem(k):sessionStorage.setItem(k,v)}catch(e){return null}}
  if(VISITOR)ss("ec-visitor","1");

  /* install as an app: manifest (name + icon), iPhone home-screen icon and title */
  (function(){var hd=document.head;function add(tag,at){var e=document.createElement(tag);for(var k in at)e.setAttribute(k,at[k]);hd.appendChild(e)}
    if(!document.querySelector('link[rel="manifest"]'))add("link",{rel:"manifest",href:a("data-manifest","manifest.webmanifest")});
    if(!document.querySelector('link[rel="apple-touch-icon"]'))add("link",{rel:"apple-touch-icon",href:"/shared/apple-touch-icon.png"});
    add("meta",{name:"apple-mobile-web-app-title",content:APP.length>18?APP.split(/[:—·]/)[0].trim():APP});
    add("meta",{name:"mobile-web-app-capable",content:"yes"});add("meta",{name:"apple-mobile-web-app-capable",content:"yes"});
    if(!document.querySelector('meta[name="theme-color"]'))add("meta",{name:"theme-color",content:"#14213a"});})();
  /* favicon */
  if(!document.querySelector('link[rel~="icon"]')){var l=document.createElement("link");l.rel="icon";l.type="image/svg+xml";l.href="/shared/favicon.svg";document.head.appendChild(l)}

  function bar(){
    if(document.querySelector(".ec-bar"))return;
    var h=document.createElement("div");h.className="ec-bar";h.setAttribute("role","banner");
    h.innerHTML='<div class="ec-bar-in">'+
      '<a class="ec-me" href="'+esc(HOME)+'" aria-label="Darren Echols, all projects"><img class="ec-mono" src="/shared/favicon.svg" alt=""><span class="ec-name">Darren Echols</span><span class="ec-sub">Classroom Apps</span></a>'+
      '<div class="ec-app"><span class="ec-dot" aria-hidden="true"></span><span class="ec-title">'+esc(APP)+'</span>'+
        TAGS.map(function(t){return '<span class="ec-tag">'+esc(t)+'</span>'}).join("")+'</div>'+
      (STD_ON&&STD?'<label class="ec-pick"><span class="ec-pick-l">Standards</span><select aria-label="Standards to show">'+options(PICK)+'</select></label>':'')+
      '<a class="ec-back" href="'+esc(HOME)+'" aria-label="All projects">←<span class="ec-long"> All</span><span class="ec-word"> Projects</span></a></div>';
    document.body.insertBefore(h,document.body.firstChild);
    var sel=h.querySelector(".ec-pick select");if(sel)sel.onchange=function(){ls(JKEY,sel.value);location.reload()};
    stdNote();
    ribbon();
  }
  function ribbon(){
    var h=document.querySelector(".ec-bar");
    if(!h||!ss(GUEST_KEY)||document.querySelector(".ec-guest-note"))return;
    var n=document.createElement("div");n.className="ec-guest-note";
    n.textContent="Guest preview: explore freely. Nothing you do here reaches Mr. Echols’ class records.";h.after(n)
  }

  /* note under the bar when the page shows standards other than North Carolina's */
  function stdNote(){
    if(!STD_ON||!STD||place(PICK).state==="nc"||document.querySelector(".ec-std-note"))return;
    var p=place(PICK),j=p.j,who=p.d?p.d.label:j.label;
    var n=document.createElement("div");n.className="ec-std-note";
    n.innerHTML='<b>Showing '+esc(who)+' standards.</b> <span class="ec-more">'+esc(p.d&&p.d.note?p.d.note:(j.note||""))+
      ' Codes in this app are switched to the matching '+esc(j.kind==="national"?"national":j.label)+' standard; ≈ means closest match. The activities were written for North Carolina.</span>'+
      (j.tests?' <span class="ec-tests">State tests: '+esc(j.tests)+'.</span>':'')+
      ' <a href="/standards-explorer/">See all '+esc(who)+' standards →</a>';
    document.querySelector(".ec-bar").after(n);
  }
  var RX=/\bNC\.(?:K|\d)\.[A-Z]{1,4}\.\d+[a-z]?(?:-[a-z])?|\b(?:RL|RI|RF|W|SL|L)\.\d\.\d+[a-z]?\b|\b(?:PS|LS|ESS)\.\d\.\d(?:\.\d)?\b|\b[45]\.(?:H|G|E|B|C&G)\.\d\.\d\b/g;
  function swapIn(root){
    if(!STD_ON||!STD||place(PICK).state==="nc"||!root)return;
    var st=place(PICK).state, w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(t){
      var p=t.parentNode;if(!p||/^(SCRIPT|STYLE|TEXTAREA|OPTION|TITLE)$/.test(p.nodeName)||(p.closest&&p.closest(".ec-std,.ec-std-note,.ec-noswap,[contenteditable]")))return NodeFilter.FILTER_REJECT;
      RX.lastIndex=0;return RX.test(t.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}}), list=[];
    while(w.nextNode())list.push(w.currentNode);
    list.forEach(function(t){var txt=t.nodeValue,frag=document.createDocumentFragment(),last=0,m,did=false;RX.lastIndex=0;
      while((m=RX.exec(txt))){var r=STD.match(m[0],st);if(!r)continue;did=true;
        frag.appendChild(document.createTextNode(txt.slice(last,m.index)));
        var sp=document.createElement("span");sp.className="ec-std"+(r.approx?" ec-approx":"");
        sp.textContent=(r.approx?"≈ ":"")+(r.codes.length?r.codes.join(", "):"no match");
        sp.title="NC "+m[0]+" → "+r.set.name+": "+(r.codes.join(", ")||"no matching standard")+(r.approx?" (closest match)":"")+(r.note?". "+r.note:"");
        frag.appendChild(sp);last=m.index+m[0].length}
      if(!did)return;frag.appendChild(document.createTextNode(txt.slice(last)));t.parentNode.replaceChild(frag,t)});
  }

  function guestBox(onGo,inline){
    var g=document.createElement("div");g.className="ec-guest"+(inline?" ec-inline":"");
    g.innerHTML='<span><b>Visiting from the portfolio?</b> Try the app without a class name.</span><button type="button">Try it as a guest</button>';
    g.querySelector("button").onclick=function(){ss(GUEST_KEY,"1");onGo()};
    return g;
  }

  /* the shared class sign-in card */
  function dressGate(){
    var card=document.querySelector("#cg-ov .cg-card");
    if(!card||card.querySelector(".ec-gate-head"))return;
    var form=card.querySelector("#cg-form");
    var head=document.createElement("div");head.className="ec-gate-head";
    head.innerHTML='<div class="ec-eyebrow">'+esc(SUBJECT_NAME)+(TAGS.length?' · '+esc(TAGS[0]):'')+'</div>'+
      '<div class="ec-gate-title">'+esc(APP)+'</div><div class="cg-small">Mr. Echols’ Room 2 · sign in with your first name</div>';
    card.insertBefore(head,card.firstChild);
    if(form&&VISITOR)card.appendChild(guestBox(function(){var i=form.querySelector("input");i.value="Guest";form.requestSubmit?form.requestSubmit():form.onsubmit(new Event("submit"));ribbon()}));
  }

  /* apps that have their own first-name box */
  function dressAppSignin(){
    if(!GUEST_INPUT||!VISITOR)return;
    var i=document.querySelector(GUEST_INPUT);
    if(!i||!i.form||i.form.querySelector(".ec-guest"))return;
    i.form.appendChild(guestBox(function(){i.value="Guest";i.form.requestSubmit?i.form.requestSubmit():i.form.submit();ribbon()},true));
  }

  /* move the gate's floating name badge into the bar */
  function dockBadge(){
    var b=document.getElementById("cg-badge"),back=document.querySelector(".ec-back");
    if(b&&back&&b.parentNode!==back.parentNode)back.parentNode.insertBefore(b,back);
  }
  function start(){
    bar();dressGate();dressAppSignin();dockBadge();swapIn(document.body);
    new MutationObserver(function(recs){dressGate();dressAppSignin();dockBadge();
      recs.forEach(function(r){r.addedNodes.forEach(function(n){if(n.nodeType===1)swapIn(n);else if(n.nodeType===3&&n.parentNode)swapIn(n.parentNode)})})
    }).observe(document.body,{childList:true,subtree:true,characterData:false});
  }
  if(document.body)start();else document.addEventListener("DOMContentLoaded",start);
})();
