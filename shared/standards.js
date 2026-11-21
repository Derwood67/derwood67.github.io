/* Darren Echols · Classroom Apps — standards switch data.
   The apps are written to the NC Standard Course of Study. This file says what each NC code
   matches in other standards sets, so one switch can show Common Core, a state, or a district.

   HOW TO ADD MORE
   - A new district in a state that is already here: add it to that state's "districts".
   - A new state that uses Common Core / NGSS codes as-is: add it to JURIS with math:"ccss",
     ela:"ccss", sci:"ngss" and its own social studies set (or "c3").
   - A state with its own codes (for example Virginia's SOL): add a new set to SETS and fill it in.

   Matches marked approx:true are the closest standard, not an exact one. */
(function(){
  /* ---------- where each set of codes comes from ---------- */
  var SETS={
    nc:   {name:"NC Standard Course of Study"},
    ccss: {name:"Common Core State Standards", url:"https://www.thecorestandards.org/"},
    cacc: {name:"California Common Core State Standards", url:"https://www.cde.ca.gov/be/st/ss/"},
    ngss: {name:"Next Generation Science Standards (NGSS)", url:"https://www.nextgenscience.org/"},
    cangss:{name:"California NGSS", url:"https://www.cde.ca.gov/pd/ca/sc/ngssstandards.asp"},
    c3:   {name:"C3 Framework for Social Studies", url:"https://www.socialstudies.org/standards/c3"},
    cahss:{name:"California History–Social Science Content Standards", url:"https://www.cde.ca.gov/be/st/ss/"}
  };

  /* ---------- the choices in the switch ---------- */
  var JURIS={
    nc:{label:"North Carolina", short:"NC", kind:"state", math:"nc", ela:"nc", sci:"nc", ss:"nc",
        tests:"EOG tests in reading and math (grades 3–8) and science (grades 5 and 8)",
        districts:{
          dps:{label:"Durham Public Schools (DPS)", short:"DPS",
               note:"DPS teaches the NC Standard Course of Study.", url:"https://www.dpsnc.net/page/curriculum-and-instruction/"}
        }},
    us:{label:"Common Core + NGSS", short:"Common Core", kind:"national", math:"ccss", ela:"ccss", sci:"ngss", ss:"c3",
        note:"Common Core for math and ELA, NGSS for science, and the C3 Framework for social studies (there is no Common Core for social studies)."},
    ca:{label:"California", short:"CA", kind:"state", math:"cacc", ela:"cacc", sci:"cangss", ss:"cahss",
        tests:"CAASPP: Smarter Balanced in ELA and math (grades 3–8 and 11) and the CAST in science (grades 5, 8 and once in high school)",
        districts:{
          lausd:{label:"Los Angeles Unified (LAUSD)", short:"LAUSD",
                 note:"LAUSD teaches the California standards: California Common Core for ELA and math, and CA NGSS for science.",
                 url:"https://www.lausd.org/Page/17834"}
        }}
  };
  /* Every other state and DC: listed so it can be picked. Until a state's own standards are loaded, it shows the
     national sets (Common Core, NGSS, C3) and says so. To load one, give it its own sets like North Carolina. */
  var STATES={al:"Alabama",ak:"Alaska",az:"Arizona",ar:"Arkansas",ca:"California",co:"Colorado",ct:"Connecticut",de:"Delaware",dc:"District of Columbia",
    fl:"Florida",ga:"Georgia",hi:"Hawaii",id:"Idaho",il:"Illinois",in:"Indiana",ia:"Iowa",ks:"Kansas",ky:"Kentucky",la:"Louisiana",me:"Maine",md:"Maryland",
    ma:"Massachusetts",mi:"Michigan",mn:"Minnesota",ms:"Mississippi",mo:"Missouri",mt:"Montana",ne:"Nebraska",nv:"Nevada",nh:"New Hampshire",nj:"New Jersey",
    nm:"New Mexico",ny:"New York",nc:"North Carolina",nd:"North Dakota",oh:"Ohio",ok:"Oklahoma",or:"Oregon",pa:"Pennsylvania",ri:"Rhode Island",
    sc:"South Carolina",sd:"South Dakota",tn:"Tennessee",tx:"Texas",ut:"Utah",vt:"Vermont",va:"Virginia",wa:"Washington",wv:"West Virginia",wi:"Wisconsin",wy:"Wyoming"};
  Object.keys(STATES).forEach(function(k){if(JURIS[k])return;
    JURIS[k]={label:STATES[k],short:k.toUpperCase(),kind:"state",loaded:false,math:"ccss",ela:"ccss",sci:"ngss",ss:"c3",
      note:STATES[k]+"'s own standards aren't loaded yet, so this shows the national sets instead: Common Core (math and ELA), NGSS (science) and the C3 Framework (social studies). "+STATES[k]+"'s education department publishes its exact standards."}});
  /* menu order: Common Core first, then states A–Z */
  function order(){return ["us"].concat(Object.keys(JURIS).filter(function(k){return k!=="us"}).sort(function(a,b){return JURIS[a].label.localeCompare(JURIS[b].label)}))}

  /* math, ELA and science codes are the same in Common Core/NGSS and in California's versions */
  var SAME_CODES={cacc:"ccss", cangss:"ngss"};

  /* ---------- NC math → Common Core (codes not listed here keep the same number without "NC.") ---------- */
  var MATH={
    "NC.4.OA.1":["4.OA.1","4.OA.2"], "NC.4.NBT.7":["4.NBT.2"],
    "NC.4.NF.5":{c:["4.NF.5"],note:"NC has no NC.4.NF.5; this skill is part of NC.4.NF.6."},
    "NC.4.NF.6":["4.NF.5","4.NF.6"],
    "NC.4.MD.1":["4.MD.1","4.MD.2"], "NC.4.MD.2":["4.MD.1"], "NC.4.MD.4":{c:["4.MD.4"],approx:true},
    "NC.4.MD.6":["4.MD.5","4.MD.6","4.MD.7"], "NC.4.MD.8":["4.MD.2"],
    "NC.5.OA.2":["5.OA.1","5.OA.2"], "NC.5.NBT.1":["5.NBT.1","5.NBT.2"], "NC.5.NBT.3":["5.NBT.3","5.NBT.4"],
    "NC.5.NF.1":["5.NF.1","5.NF.2"],
    "NC.5.NF.2":{c:["5.NF.2"],note:"NC has no NC.5.NF.2; word problems are part of NC.5.NF.1."},
    "NC.5.NF.4":["5.NF.4","5.NF.5","5.NF.6"], "NC.5.MD.2":{c:["5.MD.2"],approx:true},
    "NC.5.MD.4":["5.MD.3","5.MD.4"], "NC.5.G.1":["5.G.1","5.G.2"], "NC.5.G.3":["5.G.3","5.G.4"]
  };
  /* ---------- NC ELA → Common Core (all other ELA codes are the same) ---------- */
  var ELA={
    "RF.4.2":{c:["L.4.1"],approx:true,note:"NC's cursive standard; Common Core has no handwriting standard."},
    "RF.4.4":["RF.4.3"], "RF.4.5":["RF.4.4"],
    "RF.5.2":{c:["L.5.1"],approx:true,note:"NC's cursive standard; Common Core has no handwriting standard."},
    "RF.5.4":["RF.5.3"], "RF.5.5":["RF.5.4"],
    "W.4.4":["W.4.6"], "W.4.5":["W.4.7"], "W.4.6":["W.4.8"],
    "W.5.4":["W.5.6"], "W.5.5":["W.5.7"], "W.5.6":["W.5.8"]
  };
  /* ---------- NC 2023 science → NGSS performance expectations ---------- */
  function A(c,n){return {c:c,approx:true,note:n}}
  var SCI={
    "PS.4.1.1":A(["3-PS2-3","3-PS2-4"],"NGSS teaches magnets in grade 3."),
    "PS.4.1.2":A(["3-PS2-3"],"NGSS teaches electric charge in grade 3."),
    "PS.4.2.1":["4-PS3-2"], "PS.4.2.2":A(["4-PS3-2","4-PS3-4"]), "PS.4.2.3":A(["4-PS3-2"]),
    "PS.4.3.1":A(["4-PS4-2"]), "PS.4.3.2":A(["1-PS4-3"],"NGSS covers light passing through materials in grade 1."),
    "LS.4.1.1":["4-LS1-1"], "LS.4.1.2":["4-LS1-2"],
    "LS.4.1.3":A(["3-LS4-2"],"NGSS covers this in grade 3."),
    "LS.4.2.1":A(["3-LS4-1"],"NGSS covers fossils in grade 3."), "LS.4.2.2":A(["3-LS4-1","4-ESS1-1"]),
    "ESS.4.1.1":A(["5-ESS1-2"],"NGSS covers day and night in grade 5."),
    "ESS.4.1.2":A(["1-ESS1-1"],"NGSS covers Moon patterns in grade 1."),
    "ESS.4.2.1":A(["5-PS1-3"],"NGSS has no mineral-testing standard; closest is identifying materials by their properties."),
    "ESS.4.2.2":A(["4-ESS1-1"]), "ESS.4.2.3":["4-ESS2-1","4-ESS3-2"],
    "ESS.4.3.1":A(["3-LS4-4"]), "ESS.4.3.2":A(["4-ESS3-1","5-ESS3-1"]), "ESS.4.3.3":A(["3-LS4-4","5-ESS3-1"]),
    "PS.5.1.1":["5-PS1-2"], "PS.5.1.2":["5-PS1-4"], "PS.5.1.3":A(["5-PS1-3","2-PS1-4"]),
    "PS.5.2.1":A(["5-PS2-1","3-PS2-1"]), "PS.5.2.2":A(["3-PS2-2"]),
    "LS.5.1.1":A(["4-LS1-1"],"NGSS saves cells and body organization for middle school."),
    "LS.5.1.2":A(["4-LS1-1"],"NGSS saves body systems for middle school."),
    "LS.5.2.1":A(["5-LS2-1","3-LS4-3"]), "LS.5.2.2":["5-LS2-1"], "LS.5.2.3":A(["5-LS2-1"]),
    "LS.5.3.1":A(["4-LS1-2"]), "LS.5.3.2":A(["3-LS3-1","3-LS3-2"],"NGSS covers inherited traits in grade 3."),
    "ESS.5.1.1":A(["3-ESS2-1"],"NGSS covers weather data in grade 3."), "ESS.5.1.2":A(["3-ESS2-1","3-ESS3-1"],"NGSS covers weather data in grade 3."),
    "ESS.5.1.3":A(["3-ESS2-2","5-ESS2-1"]), "ESS.5.1.4":A(["5-ESS2-1","5-ESS2-2"])
  };
  /* ---------- NC 2021 social studies → C3 Framework and California HSS ---------- */
  var C3={
    "4.B.1.1":["D2.His.2.3-5","D2.Geo.6.3-5"], "4.B.1.2":["D2.His.4.3-5"],
    "4.C&G.1.1":["D2.Civ.1.3-5"], "4.C&G.1.2":["D2.Civ.2.3-5"], "4.C&G.1.3":["D2.Civ.3.3-5"],
    "4.E.1.1":["D2.Eco.1.3-5"], "4.E.1.2":["D2.His.14.3-5"], "4.E.1.3":["D2.Eco.3.3-5"],
    "4.E.2.1":["D2.Eco.1.3-5"], "4.E.2.2":["D2.Eco.1.3-5"],
    "4.G.1.1":["D2.Geo.2.3-5"], "4.G.1.2":["D2.Geo.7.3-5"], "4.G.1.3":["D2.Geo.8.3-5"],
    "4.H.1.1":["D2.His.3.3-5"], "4.H.1.2":["D2.His.2.3-5"], "4.H.1.3":["D2.His.2.3-5"], "4.H.1.4":["D2.His.1.3-5"],
    "4.H.1.5":["D2.His.10.3-5"], "4.H.1.6":["D2.His.4.3-5"],
    "5.B.1.1":["D2.His.2.3-5"], "5.B.1.2":["D2.His.4.3-5"],
    "5.C&G.1.1":["D2.Civ.1.3-5"], "5.C&G.1.2":["D2.Civ.5.3-5"], "5.C&G.2.1":["D2.Civ.2.3-5"], "5.C&G.2.2":["D2.Civ.3.3-5"],
    "5.E.1.1":["D2.His.14.3-5"], "5.E.1.2":["D2.Eco.1.3-5"], "5.E.1.3":["D2.Eco.4.3-5"], "5.E.1.4":["D2.Eco.4.3-5"],
    "5.E.2.1":["D2.Eco.1.3-5"], "5.E.2.2":["D2.Eco.1.3-5"], "5.E.2.3":["D2.Eco.1.3-5"],
    "5.G.1.1":["D2.Geo.2.3-5"], "5.G.1.2":["D2.Geo.7.3-5"], "5.G.1.3":["D2.Geo.5.3-5"], "5.G.1.4":["D2.Geo.8.3-5"],
    "5.H.1.1":["D2.His.3.3-5"], "5.H.1.2":["D2.His.2.3-5"], "5.H.1.3":["D2.His.2.3-5"], "5.H.1.4":["D2.His.1.3-5"],
    "5.H.1.5":["D2.His.10.3-5"], "5.H.1.6":["D2.His.4.3-5"]
  };
  /* California teaches state history in grade 4 and early U.S. history in grade 5, so these match by topic, not by fact. */
  var CAHSS={
    "4.B.1.1":["4.4"], "4.B.1.2":["4.2","4.4"],
    "4.C&G.1.1":["4.5"], "4.C&G.1.2":["4.5"], "4.C&G.1.3":["4.5"],
    "4.E.1.1":["4.4"], "4.E.1.2":["4.4"], "4.E.1.3":["4.1","4.4"],
    "4.E.2.1":{c:[],note:"California's HSS standards have no personal-finance standard in grade 4."},
    "4.E.2.2":{c:[],note:"California's HSS standards have no personal-finance standard in grade 4."},
    "4.G.1.1":["4.1"], "4.G.1.2":["4.1","4.4"], "4.G.1.3":["4.3","4.4"],
    "4.H.1.1":["4.2","4.4"], "4.H.1.2":["4.2","4.4"], "4.H.1.3":["4.3"], "4.H.1.4":["4.3","4.4"],
    "4.H.1.5":["HI.1–3 (Analysis Skills)"], "4.H.1.6":["4.4"],
    "5.B.1.1":["5.4"], "5.B.1.2":["5.1","5.4"],
    "5.C&G.1.1":["5.7"], "5.C&G.1.2":["5.7"], "5.C&G.2.1":["5.7"], "5.C&G.2.2":["5.7"],
    "5.E.1.1":["5.4"], "5.E.1.2":["5.4"], "5.E.1.3":["5.4"], "5.E.1.4":["5.4"],
    "5.E.2.1":{c:[],note:"California's HSS standards have no personal-finance standard in grade 5."},
    "5.E.2.2":{c:[],note:"California's HSS standards have no personal-finance standard in grade 5."},
    "5.E.2.3":{c:[],note:"California's HSS standards have no personal-finance standard in grade 5."},
    "5.G.1.1":["5.8","5.9"], "5.G.1.2":["5.4","5.8"], "5.G.1.3":["5.8"], "5.G.1.4":["5.8"],
    "5.H.1.1":["5.2","5.3"], "5.H.1.2":["5.4","5.6"], "5.H.1.3":["5.5","5.6"], "5.H.1.4":["5.3","5.6"],
    "5.H.1.5":["HI.1–3 (Analysis Skills)"], "5.H.1.6":["5.7"]
  };

  /* ---------- lookup ---------- */
  function norm(m){if(!m)return null;if(Array.isArray(m))return {c:m};return m}
  /* Which subject an NC code belongs to */
  function subjectOf(code){
    if(/^NC\.(K|\d)\.(RL|RI|RF|W|SL|L)\./.test(code)||/^(RL|RI|RF|W|SL|L)\.(K|\d)\./.test(code))return "ela";
    if(/^NC\./.test(code))return "math";
    if(/^(PS|LS|ESS)\./.test(code))return "sci";
    if(/^\d\.(H|G|E|B|C&G)\.\d\.\d$/.test(code))return "ss";
    return null;
  }
  /* Returns {codes:[...], approx, note, set} for an NC code in the chosen place, or null to leave it as is */
  function match(code,jurisKey){
    var j=JURIS[jurisKey]; if(!j)return null;
    var subj=subjectOf(code); if(!subj)return null;
    var set=j[subj]; if(set==="nc")return null;
    var base=SAME_CODES[set]||set, m;
    if(subj==="math"){m=norm(MATH[code])||{c:[code.replace(/^NC\./,"")]}}
    else if(subj==="ela"){var e=code.replace(/^NC\.(K|\d)\.([A-Z]+)\./,"$2.$1.");   /* NC.K.RF.3a → RF.K.3a */
      m=norm(ELA[e])||{c:[e]}}
    else if(subj==="sci"){
      if(/^\w+\.\d\.\d$/.test(code)){var all=[],ap=false;Object.keys(SCI).forEach(function(k){if(k.indexOf(code+".")===0){var x=norm(SCI[k]);x.c.forEach(function(c){if(all.indexOf(c)<0)all.push(c)});ap=ap||!!x.approx}});m=all.length?{c:all,approx:ap}:null}
      else m=norm(SCI[code])}
    else if(subj==="ss"){m=norm((base==="c3"?C3:CAHSS)[code]);if(m&&base==="c3")m={c:m.c,approx:true,note:m.note}}
    if(!m)return null;
    if(subj==="ss"&&base==="cahss"&&!m.note)m={c:m.c,approx:true,note:"Matched by topic: California's grade 4 is California history and grade 5 is early U.S. history."};
    return {codes:m.c,approx:!!m.approx,note:m.note||"",set:SETS[set]};
  }

  window.ECStandards={SETS:SETS,JURIS:JURIS,order:order,match:match,subjectOf:subjectOf};
})();
