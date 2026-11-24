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
    nc:   {name:"NC Standard Course of Study", url:"https://www.dpi.nc.gov/districts-schools/classroom-resources/academic-standards"},
    ccss: {name:"Common Core State Standards", url:"https://www.thecorestandards.org/"},
    cacc: {name:"California Common Core State Standards", url:"https://www.cde.ca.gov/be/st/ss/"},
    ngss: {name:"Next Generation Science Standards (NGSS)", url:"https://www.nextgenscience.org/"},
    cangss:{name:"California NGSS", url:"https://www.cde.ca.gov/pd/ca/sc/ngssstandards.asp"},
    c3:   {name:"C3 Framework for Social Studies", url:"https://www.socialstudies.org/standards/c3"},
    cahss:{name:"California History–Social Science Content Standards", url:"https://www.cde.ca.gov/be/st/ss/"},
    /* Virginia, Maryland and DC (grades K–6). summary:true = short plain-language summaries; the link has the exact wording. */
    vamath:{name:"Virginia 2023 Mathematics SOL", url:"https://www.doe.virginia.gov/teaching-learning-assessment/k-12-standards-instruction/mathematics/standards-of-learning/2023-mathematics-sol", summary:true},
    vaela: {name:"Virginia 2024 English SOL", url:"https://www.doe.virginia.gov/teaching-learning-assessment/k-12-standards-instruction/english-reading-literacy/standards-of-learning", summary:true},
    vasci: {name:"Virginia 2018 Science SOL", url:"https://www.doe.virginia.gov/teaching-learning-assessment/k-12-standards-instruction/science/standards-of-learning", summary:true},
    vahss: {name:"Virginia 2023 History and Social Science SOL", url:"https://www.doe.virginia.gov/teaching-learning-assessment/k-12-standards-instruction/history-and-social-science/standards-of-learning", summary:true},
    mdmath:{name:"Maryland 2025 Mathematics Standards (MCCRS)", url:"https://marylandpublicschools.org/about/pages/dcaa/math/revised-standards.aspx", summary:true},
    mdccrs:{name:"Maryland College and Career Ready Standards for ELA", url:"https://marylandpublicschools.org/programs/pages/ela/mccr.aspx"},
    mdngss:{name:"Maryland Science Standards (NGSS)", url:"https://marylandpublicschools.org/about/Pages/DCAA/Science/index.aspx"},
    mdss:  {name:"Maryland Social Studies Frameworks", url:"https://marylandpublicschools.org/about/pages/dcaa/social-studies/msss.aspx", summary:true},
    dcss:  {name:"DC Social Studies Standards (2023)", url:"https://osse.dc.gov/page/social-studies-0", summary:true}
  };

  /* ---------- the choices in the switch ---------- */
  var JURIS={
    nc:{label:"North Carolina", short:"NC", kind:"state", math:"nc", ela:"nc", sci:"nc", ss:"nc",
        tests:"EOG tests in reading and math (grades 3–8) and science (grades 5 and 8)",
        districts:{
          dps:{label:"Durham Public Schools (DPS)", short:"DPS", city:"Durham", pace:"nc",
               note:"DPS teaches the NC Standard Course of Study.", url:"https://www.dpsnc.net/page/curriculum-and-instruction/"},
          abss:{label:"Alamance-Burlington School System (ABSS)", short:"ABSS", city:"Burlington · Mebane",
               note:"ABSS teaches the NC Standard Course of Study.", url:"https://www.abss.k12.nc.us/"},
          wcpss:{label:"Wake County Public Schools (WCPSS)", short:"WCPSS", city:"Raleigh",
               note:"WCPSS teaches the NC Standard Course of Study.", url:"https://www.wcpss.net/academics"},
          cms:{label:"Charlotte-Mecklenburg Schools (CMS)", short:"CMS", city:"Charlotte",
               note:"CMS teaches the NC Standard Course of Study.", url:"https://www.cmsk12.org/academics",
               links:{all:["K–5 curriculum resources","https://www.cmsk12.org/Page/10634"]}}
        }},
    us:{label:"Common Core + NGSS", short:"Common Core", kind:"national", math:"ccss", ela:"ccss", sci:"ngss", ss:"c3",
        note:"Common Core for math and ELA, NGSS for science, and the C3 Framework for social studies (there is no Common Core for social studies)."},
    ca:{label:"California", short:"CA", kind:"state", math:"cacc", ela:"cacc", sci:"cangss", ss:"cahss",
        tests:"CAASPP: Smarter Balanced in ELA and math (grades 3–8 and 11) and the CAST in science (grades 5, 8 and once in high school)",
        districts:{
          lausd:{label:"Los Angeles Unified (LAUSD)", short:"LAUSD", city:"Los Angeles", pace:"ca",
                 note:"LAUSD teaches the California standards: California Common Core for ELA and math, and CA NGSS for science.",
                 url:"https://www.lausd.org/Page/17834"}
        }}
  };
  JURIS.va={label:"Virginia", short:"VA", kind:"state", math:"vamath", ela:"vaela", sci:"vasci", ss:"vahss",
    tests:"SOL tests in reading and math (grades 3–8) and science (grades 5 and 8)",
    districts:{
      fcps:{label:"Fairfax County Public Schools (FCPS)", short:"FCPS", city:"Fairfax", note:"FCPS's Program of Studies is built on the Virginia SOL.",
            url:"https://www.fcps.edu/academics/elementary-school-k-6",
            links:{math:["FCPS mathematics","https://fcps.edu/academics/academic-overview/mathematics"],ela:["FCPS language arts","https://www.fcps.edu/academics/curriculum/subject-areas/language-arts"]}},
      aps:{label:"Arlington Public Schools (APS)", short:"APS", city:"Arlington", note:"APS teaches the Virginia SOL.",
            url:"https://www.apsva.us/",
            links:{math:["APS elementary math","https://www.apsva.us/curriculum/mathematics/"],ela:["APS English language arts","https://www.apsva.us/curriculum/english-language-arts/"]}},
      acps:{label:"Alexandria City Public Schools (ACPS)", short:"ACPS", city:"Alexandria", note:"ACPS teaches the Virginia SOL.",
            url:"https://www.acps.k12.va.us/"},
      rps:{label:"Richmond Public Schools (RPS)", short:"RPS", city:"Richmond", note:"RPS teaches the Virginia SOL.",
            url:"https://www.rvaschools.net/academics/curriculum-and-instruction",
            links:{sci:["RPS science curriculum","https://www.rvaschools.net/academics/curriculum-and-instruction/science"]}},
      lcps:{label:"Loudoun County Public Schools (LCPS)", short:"LCPS", city:"Ashburn · Leesburg", note:"LCPS teaches the Virginia SOL.",
            url:"https://www.lcps.org/",
            links:{sci:["LCPS science","https://lcps.org/o/dtl/page/science"]}}
    },
    note:"Virginia's Standards of Learning (SOL) use their own codes. Grade 4 social studies is Virginia Studies (VS), grade 5 is U.S. History to 1865 (USI) and grade 6 is U.S. History 1865 to the present (USII); divisions may order these differently. Matches to NC codes are by topic."};
  JURIS.md={label:"Maryland", short:"MD", kind:"state", math:"mdmath", ela:"mdccrs", sci:"mdngss", ss:"mdss",
    tests:"MCAP in ELA and math (grades 3–8; MSTAR from spring 2027), science (grades 5 and 8) and social studies (grade 8)",
    districts:{
      mcps:{label:"Montgomery County Public Schools (MCPS)", short:"MCPS", city:"Rockville · Silver Spring", note:"MCPS teaches the Maryland standards.",
            url:"https://www.montgomeryschoolsmd.org/curriculum/",
            links:{math:["MCPS elementary math","https://montgomeryschoolsmd.org/curriculum/math/es"],sci:["MCPS elementary science","https://www.montgomeryschoolsmd.org/curriculum/science/es.aspx"],all:["MCPS Refrigerator Curriculum (what's taught each marking period)","https://www.montgomeryschoolsmd.org/curriculum/refrigerator/2026-2027/"]}},
      pgcps:{label:"Prince George's County Public Schools (PGCPS)", short:"PGCPS", city:"Upper Marlboro", note:"PGCPS teaches the Maryland standards.",
            url:"https://www.pgcps.org/"},
      bcps:{label:"Baltimore City Public Schools", short:"City Schools", city:"Baltimore", note:"City Schools teaches the Maryland standards.",
            url:"https://baltimorecityschools.org/elementary-school",
            links:{all:["City Schools learning guides by grade","https://www.baltimorecityschools.org/documents/departments/academics/learning-guides/825637"]}}
    },
    note:"Maryland's revised math standards (adopted July 2025, in effect 2026–27) use new codes such as 4.NOS.D.9. ELA keeps Common Core codes (revised in 2025 with small wording changes). Science is NGSS. Social studies follows MSDE's grade-level frameworks."};
  JURIS.dc={label:"District of Columbia", short:"DC", kind:"state", math:"ccss", ela:"ccss", sci:"ngss", ss:"dcss",
    tests:"DC CAPE in ELA and math (grades 3–8) and DC Science (grades 5 and 8)",
    districts:{
      dcps:{label:"DC Public Schools (DCPS)", short:"DCPS", city:"Washington", note:"DCPS teaches Common Core (ELA and math) and NGSS (science).",
            url:"https://dcps.dc.gov/",
            links:{math:["DCPS math (units by grade)","https://dcps.dc.gov/page/math"],ela:["DCPS English language arts","https://dcps.dc.gov/page/english-language-arts-01"],sci:["DCPS science","https://dcps.dc.gov/page/science"]}}
    },
    note:"DC uses Common Core for ELA and math, NGSS for science, and its own 2023 social studies standards."};
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
  var SAME_CODES={cacc:"ccss", cangss:"ngss", mdccrs:"ccss", mdngss:"ngss"};
  function dataKey(set){return SAME_CODES[set]||set}

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

  /* ---------- NC → Virginia, Maryland and DC (grades 4–5, the grades the apps cover). All by topic. ---------- */
  function A(c,n){return {c:c,approx:true,note:n||""}}
  var VAMATH={
    "NC.4.OA.1":["4.CE.2"], "NC.4.OA.3":["4.CE.1","4.CE.2"], "NC.4.OA.4":["4.CE.2"], "NC.4.OA.5":["4.PFA.1"],
    "NC.4.NBT.1":["4.NS.1"], "NC.4.NBT.2":["4.NS.1"], "NC.4.NBT.7":["4.NS.2"], "NC.4.NBT.4":["4.CE.1"],
    "NC.4.NBT.5":["4.CE.2"], "NC.4.NBT.6":["4.CE.2"],
    "NC.4.NF.1":["4.NS.3"], "NC.4.NF.2":["4.NS.3"], "NC.4.NF.3":["4.CE.3"], "NC.4.NF.4":["4.CE.3"],
    "NC.4.NF.5":["4.NS.5"], "NC.4.NF.6":["4.NS.5","4.NS.4"], "NC.4.NF.7":["4.NS.4"],
    "NC.4.MD.1":["4.MG.1"], "NC.4.MD.2":A(["4.MG.1","5.MG.1"],"Virginia converts U.S. Customary units in grade 4 and metric units in grade 5."),
    "NC.4.MD.8":["4.MG.2"], "NC.4.MD.3":["4.MG.3"], "NC.4.MD.4":A(["4.PS.1"]),
    "NC.4.MD.6":A(["5.MG.3"],"Virginia measures angles in grade 5."),
    "NC.4.G.1":["4.MG.4"], "NC.4.G.2":A(["4.MG.5","5.MG.3"],"Virginia classifies quadrilaterals in grade 4 and triangles in grade 5."),
    "NC.4.G.3":A(["2.MG.3","6.MG.4"],"Virginia teaches lines of symmetry in grades 2 and 6."),
    "NC.5.OA.2":["5.CE.4"], "NC.5.OA.3":A(["5.PFA.1"]),
    "NC.5.NBT.1":A(["4.NS.1","4.NS.4"],"Virginia covers place value to thousandths in grade 4."),
    "NC.5.NBT.3":A(["4.NS.4","5.NS.1"],"Virginia reads and compares decimals to thousandths in grade 4."),
    "NC.5.NBT.5":["5.CE.1"], "NC.5.NBT.6":["5.CE.1"], "NC.5.NBT.7":["5.CE.3"],
    "NC.5.NF.1":["5.CE.2"], "NC.5.NF.2":["5.CE.2"], "NC.5.NF.3":A(["5.CE.1","5.NS.1"],"Virginia has no separate standard for fractions as division."),
    "NC.5.NF.4":A(["5.CE.2","6.CE.1"],"Virginia multiplies a whole number by a fraction in grade 5 and a fraction by a fraction in grade 6."),
    "NC.5.NF.7":A(["6.CE.1"],"Virginia divides with fractions in grade 6."),
    "NC.5.MD.1":["5.MG.1"], "NC.5.MD.2":["5.PS.1"], "NC.5.MD.4":["5.MG.2"], "NC.5.MD.5":["5.MG.2"],
    "NC.5.G.1":A(["6.MG.3"],"Virginia graphs ordered pairs in grade 6."), "NC.5.G.3":A(["4.MG.5","5.MG.3"])
  };
  var VASCI={
    "PS.4.1.1":A(["2.2","5.4"],"Virginia teaches magnets in grade 2 and electromagnets in grade 5."), "PS.4.1.2":A(["5.4"],"Virginia teaches static electricity in grade 5."),
    "PS.4.2.1":A(["5.2"]), "PS.4.2.2":A(["5.4"],"Virginia teaches circuits in grade 5."), "PS.4.2.3":A(["5.4"]),
    "PS.4.3.1":A(["5.6"],"Virginia teaches light in grade 5."), "PS.4.3.2":A(["5.6"],"Virginia teaches light in grade 5."),
    "LS.4.1.1":["4.2"], "LS.4.1.2":A(["4.2","K.5"]), "LS.4.1.3":A(["3.4"]), "LS.4.2.1":A(["3.4"],"Virginia teaches fossils in grade 3."),
    "LS.4.2.2":A(["3.4","5.8"]), "ESS.4.1.1":A(["4.6","6.3"]), "ESS.4.1.2":["4.6"],
    "ESS.4.2.1":A(["4.8"]), "ESS.4.2.2":A(["5.8"],"Virginia teaches the rock cycle in grade 5."), "ESS.4.2.3":A(["5.8"]),
    "ESS.4.3.1":A(["4.3"]), "ESS.4.3.2":A(["3.8"]), "ESS.4.3.3":A(["3.8","6.9"]),
    "PS.5.1.1":A(["5.7"]), "PS.5.1.2":A(["5.7"]), "PS.5.1.3":A(["5.7"]), "PS.5.2.1":A(["5.3"]), "PS.5.2.2":A(["5.3"]),
    "LS.5.1.1":{c:[],note:"Virginia's K–6 science has no cells or body systems standard; it is in middle school Life Science."},
    "LS.5.1.2":{c:[],note:"Virginia's K–6 science has no body systems standard; it is in middle school Life Science."},
    "LS.5.2.1":A(["4.3","3.5"]), "LS.5.2.2":A(["4.3"]), "LS.5.2.3":A(["4.3"]), "LS.5.3.1":A(["3.4"]), "LS.5.3.2":A(["3.4"]),
    "ESS.5.1.1":A(["4.4"]), "ESS.5.1.2":A(["4.4"]), "ESS.5.1.3":A(["4.7","6.7"]), "ESS.5.1.4":A(["3.7"],"Virginia teaches the water cycle in grade 3.")
  };
  /* Common Core ELA code → the Virginia 2024 English strand that covers it */
  function vaEla(cc){var m=/^(RL|RI|RF|W|SL|L)\.(K|\d)\.(\d+)/.exec(cc);if(!m)return null;var s=m[1],g=m[2],n=+m[3],t;
    if(s==="RL")t=n<=3?"RL.1":n===4?"RV.1":n<=6?"RL.2":n<=9?"RL.3":"DSR";
    else if(s==="RI")t=n<=3||n===8?"RI.1":n===4?"RV.1":n<=7?"RI.2":n===9?"RI.3":"DSR";
    else if(s==="RF")t=n===1?"FFR.1":n===2?"FFR.2":n===3?"FFR.3":"DSR";
    else if(s==="W")t=n<=3||n>=9?"W.1":n===4?"W.2":n===5?"W.3":n===6?"C.3":"R.1";
    else if(s==="SL")t=n<=3?"C.1":n===5?"C.3":"C.2";
    else t=n===2?"LU.2":n<=3?"LU.1":"RV.1";
    if(+g>=3&&/^FFR\.[12]$/.test(t))t="FFR.3";
    return g+"."+t}
  function ss(c,n){return A(c,n||"Matched by topic.")}
  var VAHSS={
    "4.B.1.1":ss(["VS.2","VS.4"]), "4.B.1.2":ss(["VS.2","VS.4"]), "4.C&G.1.1":ss(["VS.6"]), "4.C&G.1.2":ss(["VS.11"]), "4.C&G.1.3":ss(["VS.6"]),
    "4.E.1.1":ss(["VS.9","VS.13"]), "4.E.1.2":ss(["VS.9","VS.13"]), "4.E.1.3":ss(["VS.13"]),
    "4.E.2.1":{c:[],note:"Virginia Studies has no personal-finance standard."}, "4.E.2.2":{c:[],note:"Virginia Studies has no personal-finance standard."},
    "4.G.1.1":ss(["VS.1"]), "4.G.1.2":ss(["VS.9"]), "4.G.1.3":ss(["VS.4","VS.6"]),
    "4.H.1.1":ss(["VS.2","VS.4","VS.11"]), "4.H.1.2":ss(["VS.4","VS.8","VS.11"]), "4.H.1.3":ss(["VS.5","VS.11"]), "4.H.1.4":ss(["VS.5","VS.7","VS.10"]),
    "4.H.1.5":ss(["VS.Skills"]), "4.H.1.6":ss(["VS.12"]),
    "5.B.1.1":ss(["USI.2","USI.5"]), "5.B.1.2":ss(["USI.4","USI.5"]), "5.C&G.1.1":ss(["USI.7"]), "5.C&G.1.2":ss(["USI.7"]),
    "5.C&G.2.1":ss(["USI.8","USII.8"]), "5.C&G.2.2":ss(["USI.7"]),
    "5.E.1.1":ss(["USI.5","USI.8"]), "5.E.1.2":ss(["USI.5"]), "5.E.1.3":ss(["USI.8"]), "5.E.1.4":ss(["USI.5"]),
    "5.E.2.1":{c:[],note:"U.S. History to 1865 has no personal-finance standard."}, "5.E.2.2":{c:[],note:"U.S. History to 1865 has no personal-finance standard."},
    "5.E.2.3":{c:[],note:"U.S. History to 1865 has no personal-finance standard."},
    "5.G.1.1":ss(["USI.1"]), "5.G.1.2":ss(["USI.4","USI.8"]), "5.G.1.3":ss(["USI.8"]), "5.G.1.4":ss(["USI.8"]),
    "5.H.1.1":ss(["USI.4","USI.8"]), "5.H.1.2":ss(["USI.8","USII.8"]), "5.H.1.3":ss(["USI.6","USI.8"]), "5.H.1.4":ss(["USI.6","USI.9"]),
    "5.H.1.5":ss(["USI.Skills"]), "5.H.1.6":ss(["USI.7"])
  };
  var MDSS={
    "4.B.1.1":ss(["4.U1.1"]), "4.B.1.2":ss(["4.U1.1","4.U2.1"]), "4.C&G.1.1":ss(["4.U3.4"]), "4.C&G.1.2":ss(["4.U3.3"]), "4.C&G.1.3":ss(["4.U3.2"]),
    "4.E.1.1":ss(["4.U2.2"]), "4.E.1.2":ss(["4.U2.2"]), "4.E.1.3":ss(["4.U2.2"]),
    "4.E.2.1":{c:[],note:"Maryland's grade 4 framework has no personal-finance topic."}, "4.E.2.2":{c:[],note:"Maryland's grade 4 framework has no personal-finance topic."},
    "4.G.1.1":ss(["4.U2.2"]), "4.G.1.2":ss(["4.U1.3"]), "4.G.1.3":ss(["4.U1.2","4.U2.3"]),
    "4.H.1.1":ss(["4.U2.4","4.U3.3"]), "4.H.1.2":ss(["4.U2.3","4.U3.3"]), "4.H.1.3":ss(["4.U2.4","4.U3.1"]), "4.H.1.4":ss(["4.U3.1","4.U3.3"]),
    "4.H.1.5":ss(["4.U3.3"]), "4.H.1.6":ss(["4.U3.2"]),
    "5.B.1.1":ss(["5.U2.2"]), "5.B.1.2":ss(["5.U2.1","5.U3.4"]), "5.C&G.1.1":ss(["5.U1.1"]), "5.C&G.1.2":ss(["5.U1.1","5.U3.3"]),
    "5.C&G.2.1":ss(["5.U3.2","5.U3.4"]), "5.C&G.2.2":ss(["5.U1.2"]),
    "5.E.1.1":ss(["5.U2.3"]), "5.E.1.2":ss(["5.U2.3"]), "5.E.1.3":ss(["5.U2.3"]), "5.E.1.4":ss(["5.U3.3"]),
    "5.E.2.1":{c:[],note:"Maryland's grade 5 framework has no personal-finance topic."}, "5.E.2.2":{c:[],note:"Maryland's grade 5 framework has no personal-finance topic."},
    "5.E.2.3":{c:[],note:"Maryland's grade 5 framework has no personal-finance topic."},
    "5.G.1.1":ss(["5.U2.3"]), "5.G.1.2":ss(["5.U2.1","5.U2.3"]), "5.G.1.3":ss(["5.U2.3"]), "5.G.1.4":ss(["5.U2.3"]),
    "5.H.1.1":ss(["5.U3.4"]), "5.H.1.2":ss(["5.U2.2","5.U3.4"]), "5.H.1.3":ss(["5.U2.1","5.U3.4"]), "5.H.1.4":ss(["5.U2.1","5.U2.2"]),
    "5.H.1.5":ss(["5.U3.1"]), "5.H.1.6":ss(["5.U1.2"])
  };
  var DCSS={
    "4.B.1.1":ss(["4.9","4.33"]), "4.B.1.2":ss(["4.13","4.34"]), "4.C&G.1.1":ss(["4.45"]), "4.C&G.1.2":ss(["4.53"]), "4.C&G.1.3":ss(["4.50"]),
    "4.E.1.1":ss(["4.6"]), "4.E.1.2":ss(["4.30"]), "4.E.1.3":ss(["4.3"]),
    "4.E.2.1":{c:[],note:"DC's grade 4 standards have no personal-finance standard."}, "4.E.2.2":{c:[],note:"DC's grade 4 standards have no personal-finance standard."},
    "4.G.1.1":ss(["4.2"]), "4.G.1.2":ss(["4.20"]), "4.G.1.3":ss(["4.4","4.24"]),
    "4.H.1.1":ss(["4.34"]), "4.H.1.2":ss(["4.13","4.36"]), "4.H.1.3":ss(["4.19","4.38"]), "4.H.1.4":ss(["4.40"]),
    "4.H.1.5":ss(["4.1"]), "4.H.1.6":ss(["4.42"]),
    "5.B.1.1":ss(["5.26","5.43"]), "5.B.1.2":ss(["5.17","5.21"]), "5.C&G.1.1":ss(["4.45"],"DC teaches the three branches in grade 4."),
    "5.C&G.1.2":ss(["4.45","4.48"],"DC teaches the three branches in grade 4."), "5.C&G.2.1":ss(["5.54","5.56"]), "5.C&G.2.2":ss(["5.37","5.50"]),
    "5.E.1.1":ss(["5.15"]), "5.E.1.2":ss(["5.31"]), "5.E.1.3":ss(["5.15"]), "5.E.1.4":ss(["6.67"],"DC covers trade in grade 6."),
    "5.E.2.1":{c:[],note:"DC's grade 5 standards have no personal-finance standard."}, "5.E.2.2":{c:[],note:"DC's grade 5 standards have no personal-finance standard."},
    "5.E.2.3":{c:[],note:"DC's grade 5 standards have no personal-finance standard."},
    "5.G.1.1":ss(["5.14"]), "5.G.1.2":ss(["5.16","5.42"]), "5.G.1.3":ss(["5.15"]), "5.G.1.4":ss(["5.42"]),
    "5.H.1.1":ss(["5.30","5.49"]), "5.H.1.2":ss(["5.46"]), "5.H.1.3":ss(["5.20","5.51"]), "5.H.1.4":ss(["5.28","5.44"]),
    "5.H.1.5":ss(["5.2"]), "5.H.1.6":ss(["5.34"])
  };
  /* Common Core math (2010 codes, cluster letter dropped) → Maryland 2025 codes, from MSDE's crosswalks */
  var MD_FROM_CC={"K.CC.1":["K.NOS.A.1","K.NOS.A.4"],"K.CC.2":["K.NOS.A.2"],"K.CC.3":["K.NOS.A.5"],"K.CC.4":["K.NOS.B.6","K.NOS.B.7"],"K.NBT.1":["K.NOS.C.9"],"K.CC.6":["K.NOS.C.10"],"K.CC.7":["K.NOS.C.10"],"K.OA.3":["K.NOS.D.11"],"K.OA.4":["K.NOS.D.11"],"K.OA.1":["K.AT.A.1"],"K.OA.2":["K.AT.A.2"],"K.MD.1":["K.GR.A.1"],"K.MD.2":["K.GR.A.2"],"K.G.1":["K.GR.B.4"],"K.G.2":["K.GR.B.5"],"K.G.3":["K.GR.B.6"],"K.G.4":["K.GR.B.7"],"K.G.5":["K.GR.B.8"],"K.G.6":["K.GR.B.9"],"K.MD.3":["K.DS.A.1","K.DS.A.2"],"1.NBT.1":["1.NOS.A.1"],"1.NBT.2":["1.NOS.B.3"],"1.NBT.3":["1.NOS.B.5"],"1.OA.3":["1.NOS.C.7"],"1.OA.4":["1.NOS.C.8"],"1.OA.6":["1.NOS.D.9"],"1.NBT.4":["1.NOS.E.10"],"1.NBT.5":["1.NOS.E.11"],"1.NBT.6":["1.NOS.E.12"],"1.G.3":["1.NOS.F.14"],"1.OA.7":["1.AT.A.1"],"1.OA.1":["1.AT.A.2"],"1.OA.8":["1.AT.A.3"],"1.MD.1":["1.GR.A.1"],"1.MD.2":["1.GR.A.2"],"1.G.1":["1.GR.B.3"],"1.G.2":["1.GR.B.4"],"1.MD.3":["1.GR.C.5"],"1.MD.4":["1.DS.A.1"],"2.NBT.1":["2.NOS.A.1"],"2.NBT.2":["2.NOS.A.2"],"2.NBT.3":["2.NOS.A.3"],"2.NBT.4":["2.NOS.A.4"],"2.OA.2":["2.NOS.B.6"],"2.MD.6":["2.NOS.C.7"],"2.NBT.5":["2.NOS.C.8"],"2.NBT.7":["2.NOS.C.9"],"2.NBT.8":["2.NOS.C.10"],"2.G.3":["2.NOS.D.11"],"2.OA.1":["2.AT.A.1","2.AT.A.2"],"2.OA.3":["2.AT.B.3"],"2.MD.1":["2.GR.A.1"],"2.MD.2":["2.GR.A.2"],"2.MD.3":["2.GR.A.3"],"2.MD.4":["2.GR.A.4"],"2.G.1":["2.GR.B.5"],"4.G.3":["2.GR.B.6"],"2.MD.7":["2.GR.C.7"],"2.MD.8":["2.GR.C.9"],"2.MD.9":["2.DS.A.1"],"3.OA.1":["3.NOS.B.2"],"3.OA.2":["3.NOS.B.3"],"3.OA.5":["3.NOS.C.4"],"3.OA.6":["3.NOS.C.5"],"3.NBT.2":["3.NOS.D.7"],"3.NBT.3":["3.NOS.D.8"],"3.OA.7":["3.NOS.E.9"],"3.NF.1":["3.NOS.F.10"],"3.NF.2":["3.NOS.F.12"],"3.NF.3":["3.NOS.F.13"],"3.OA.3":["3.AT.A.1"],"3.OA.8":["3.AT.A.2"],"3.OA.9":["3.AT.A.3"],"3.MD.4":["3.GR.A.1"],"3.MD.1":["3.GR.A.2"],"3.MD.2":["3.GR.A.3","3.GR.A.4"],"3.G.1":["3.GR.B.5"],"3.MD.5":["3.GR.C.6"],"3.MD.6":["3.GR.C.6"],"3.MD.7":["3.GR.C.7"],"3.MD.8":["3.GR.C.9"],"3.MD.3":["3.DS.A.1"],"4.NBT.2":["4.NOS.A.1"],"4.NBT.1":["4.NOS.A.2"],"4.NBT.4":["4.NOS.B.3"],"4.NBT.5":["4.NOS.B.5"],"4.NBT.6":["4.NOS.B.6"],"4.OA.4":["4.NOS.C.8"],"4.NF.1":["4.NOS.D.9"],"4.NF.2":["4.NOS.D.10"],"4.NF.3":["4.NOS.E.11","4.NOS.E.12"],"4.NF.4":["4.NOS.E.13"],"4.NF.5":["4.NOS.F.14"],"4.NF.6":["4.NOS.F.15"],"4.NF.7":["4.NOS.F.16"],"4.OA.1":["4.AT.A.1"],"4.OA.2":["4.AT.A.2"],"4.OA.3":["4.AT.A.4"],"4.MD.1":["4.GR.A.1"],"4.MD.2":["4.GR.A.2"],"4.MD.3":["4.GR.A.3"],"4.MD.5":["4.GR.B.5"],"4.MD.6":["4.GR.B.6"],"4.MD.7":["4.GR.B.7"],"4.G.1":["4.GR.C.8"],"4.G.2":["4.GR.C.9"],"4.MD.4":["4.DS.A.1"],"5.NBT.1":["5.NOS.A.1"],"5.NBT.2":["5.NOS.A.2"],"5.NBT.3":["5.NOS.A.3"],"5.NBT.4":["5.NOS.A.3"],"5.NBT.5":["5.NOS.B.4"],"5.NBT.6":["5.NOS.B.5"],"5.NBT.7":["5.NOS.B.6","5.NOS.B.7"],"5.NF.1":["5.NOS.C.8"],"5.NF.2":["5.NOS.C.9"],"5.NF.3":["5.NOS.D.10"],"5.NF.4":["5.NOS.D.11","5.NOS.D.12","5.NOS.D.13"],"5.NF.5":["5.NOS.D.14"],"5.NF.6":["5.NOS.D.15"],"5.NF.7":["5.NOS.D.16"],"5.OA.1":["5.AT.A.1"],"5.OA.2":["5.AT.A.2"],"5.OA.3":["5.AT.B.3"],"5.MD.1":["5.GR.A.1"],"5.G.3":["5.GR.B.2"],"5.G.4":["5.GR.B.3"],"5.MD.3":["5.GR.C.4"],"5.MD.4":["5.GR.C.4"],"5.MD.5":["5.GR.C.5"],"5.G.1":["5.GR.D.6"],"5.G.2":["5.GR.D.7"],"5.MD.2":["5.DS.A.1"],"6.NS.1":["6.NOS.A.1"],"6.NS.2":["6.NOS.B.2"],"6.NS.3":["6.NOS.B.3"],"6.NS.4":["6.NOS.B.4"],"6.NS.5":["6.NOS.C.5"],"6.NS.6":["6.NOS.C.6","6.NOS.C.7"],"6.NS.7":["6.NOS.C.8"],"6.NS.8":["6.NOS.C.9"],"6.RP.1":["6.AT.A.1"],"6.RP.2":["6.AT.A.2"],"6.RP.3":["6.AT.A.3","6.AT.A.4"],"6.EE.1":["6.AT.B.5"],"6.EE.2":["6.AT.B.6"],"6.EE.3":["6.AT.B.7"],"6.EE.4":["6.AT.B.7"],"6.EE.5":["6.AT.C.8","6.AT.C.10"],"6.EE.6":["6.AT.C.8"],"6.EE.7":["6.AT.C.8"],"6.EE.8":["6.AT.C.9"],"6.EE.9":["6.AT.D.11"],"6.G.1":["6.GR.A.1"],"6.G.2":["6.GR.A.2"],"6.G.3":["6.GR.A.3"],"6.G.4":["6.GR.A.4"],"6.SP.1":["6.DS.A.1"],"6.SP.2":["6.DS.A.3"],"6.SP.3":["6.DS.A.4"],"6.SP.4":["6.DS.B.5"],"6.SP.5":["6.DS.B.6"]};

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
    /* sets with their own codes: go through Common Core/NGSS first where that is how they line up */
    if(set==="vamath"){m=norm(VAMATH[code])}
    else if(set==="mdmath"){var r=match(code,"us");if(!r)return null;var out=[];r.codes.forEach(function(c){(MD_FROM_CC[c]||[]).forEach(function(x){if(out.indexOf(x)<0)out.push(x)})});
      if(!out.length)return null;m={c:out,approx:r.approx,note:r.note}}
    else if(set==="vaela"){var r2=match(code,"us");if(!r2)return null;var o2=[];r2.codes.forEach(function(c){var v=vaEla(c);if(v&&o2.indexOf(v)<0)o2.push(v)});
      if(!o2.length)return null;m={c:o2,approx:true,note:"Matched by topic: Virginia groups English skills into broader standards."}}
    else if(set==="vasci"){
      if(/^\w+\.\d\.\d$/.test(code)){var all=[],ap=false;Object.keys(VASCI).forEach(function(k){if(k.indexOf(code+".")===0){var x=norm(VASCI[k]);x.c.forEach(function(c){if(all.indexOf(c)<0)all.push(c)});ap=ap||!!x.approx}});m=all.length?{c:all,approx:ap}:null}
      else m=norm(VASCI[code])}
    else if(subj==="ss"&&(set==="vahss"||set==="mdss"||set==="dcss")){m=norm({vahss:VAHSS,mdss:MDSS,dcss:DCSS}[set][code])}
    else if(subj==="math"){m=norm(MATH[code])||{c:[code.replace(/^NC\./,"")]}}
    else if(subj==="ela"){var e=code.replace(/^NC\.(K|\d)\.([A-Z]+)\./,"$2.$1.");   /* NC.K.RF.3a → RF.K.3a */
      m=norm(ELA[e])||{c:[e]}}
    else if(subj==="sci"){
      if(/^\w+\.\d\.\d$/.test(code)){var all2=[],ap2=false;Object.keys(SCI).forEach(function(k){if(k.indexOf(code+".")===0){var x=norm(SCI[k]);x.c.forEach(function(c){if(all2.indexOf(c)<0)all2.push(c)});ap2=ap2||!!x.approx}});m=all2.length?{c:all2,approx:ap2}:null}
      else m=norm(SCI[code])}
    else if(subj==="ss"){m=norm((base==="c3"?C3:CAHSS)[code]);if(m&&base==="c3")m={c:m.c,approx:true,note:m.note}}
    if(!m)return null;
    if(subj==="ss"&&base==="cahss"&&!m.note)m={c:m.c,approx:true,note:"Matched by topic: California's grade 4 is California history and grade 5 is early U.S. history."};
    return {codes:m.c,approx:!!m.approx,note:m.note||"",set:SETS[set]};
  }

  window.ECStandards={SETS:SETS,JURIS:JURIS,order:order,match:match,subjectOf:subjectOf,dataKey:dataKey,
    fromCC:function(set,cc){return set==="mdmath"?(MD_FROM_CC[cc]||null):null}};
})();
