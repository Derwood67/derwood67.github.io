/* Pacing guides for the Standards Explorer.
   Curriculum order comes from published unit lists; quarters are approximate (by unit order and length).
   Codes are Common Core; the Explorer converts them to NC or another set as needed.
   Sources: Great Minds, "Eureka Math² Standards and Achievement Descriptors at a Glance" (Levels 4–5);
   Illustrative Mathematics K–5 unit lists (im.kendallhunt.com). */
(function(){
  var P={
    sources:{
      em2:{name:"Eureka Math²", kind:"curriculum", subj:"math",
           note:"Module order from Great Minds, with the standards each module lists. Durham Public Schools uses Eureka Math² for K–5 math.",
           url:"https://greatminds.org/programs/math/eureka-math-2/k-8"},
      im:{name:"Illustrative Mathematics", kind:"curriculum", subj:"math",
          note:"Unit order from Illustrative Mathematics. Standards for each unit are my alignment by unit topic. LAUSD's adopted math program is Illustrative Mathematics.",
          url:"https://im.kendallhunt.com/"}
    },
    /* which curriculum is each place's district/default program */
    district:{
      nc:{name:"Durham Public Schools", math:"em2",
          note:"DPS core programs: Eureka Math² (math), HMH Into Reading (ELA), CIBL kits (science), Studies Weekly (social studies). DPS doesn't publish its quarter-by-quarter pacing guides publicly; math follows the Eureka Math² module order.",
          url:"https://www.dpsnc.net/page/curriculum-and-instruction/"},
      ca:{name:"Los Angeles Unified (LAUSD)", math:"im",
          note:"LAUSD's adopted math program is Illustrative Mathematics; its pacing toolkit is for LAUSD staff. Other subjects: paste your district's guide into My pacing.",
          url:"https://www.lausd.org/"},
      us:{name:"Common Core", math:"em2", note:"No district selected; showing Eureka Math² order for math."}
    },
    units:{
      em2:{
        "4":[
          {u:"Module 1",t:"Place Value Concepts for Addition and Subtraction",q:1,c:["4.OA.1","4.OA.2","4.OA.3","4.NBT.1","4.NBT.2","4.NBT.3","4.NBT.4","4.MD.1","4.MD.2"]},
          {u:"Module 2",t:"Place Value Concepts for Multiplication and Division",q:2,c:["4.OA.2","4.OA.4","4.OA.5","4.NBT.5","4.NBT.6","4.MD.1","4.MD.2","4.MD.3"]},
          {u:"Module 3",t:"Multiplication and Division of Multi-Digit Numbers",q:2,c:["4.OA.3","4.NBT.5","4.NBT.6","4.MD.1","4.MD.2"]},
          {u:"Module 4",t:"Foundations for Fraction Operations",q:3,c:["4.NF.1","4.NF.2","4.NF.3a","4.NF.3b","4.NF.3c","4.NF.3d","4.NF.4a","4.NF.4b","4.NF.4c","4.MD.2","4.MD.4"]},
          {u:"Module 5",t:"Place Value Concepts for Decimal Fractions",q:4,c:["4.NF.5","4.NF.6","4.NF.7","4.MD.2"]},
          {u:"Module 6",t:"Angle Measurements and Plane Figures",q:4,c:["4.MD.5a","4.MD.5b","4.MD.6","4.MD.7","4.G.1","4.G.2","4.G.3"]}],
        "5":[
          {u:"Module 1",t:"Place Value Concepts for Multiplication and Division with Whole Numbers",q:1,c:["5.OA.1","5.OA.2","5.NBT.1","5.NBT.2","5.NBT.5","5.NBT.6","5.MD.1"]},
          {u:"Module 2",t:"Addition and Subtraction with Fractions",q:2,c:["5.NF.1","5.NF.2","5.NF.3","5.MD.2"]},
          {u:"Module 3",t:"Multiplication and Division with Fractions",q:3,c:["5.OA.1","5.OA.2","5.NF.4a","5.NF.5a","5.NF.5b","5.NF.6","5.NF.7a","5.NF.7b","5.NF.7c","5.MD.1"]},
          {u:"Module 4",t:"Place Value Concepts for Decimal Operations",q:3,c:["5.OA.1","5.OA.2","5.NBT.1","5.NBT.2","5.NBT.3a","5.NBT.3b","5.NBT.4","5.NBT.7","5.MD.1"]},
          {u:"Module 5",t:"Addition and Multiplication with Area and Volume",q:4,c:["5.NF.4b","5.NF.6","5.MD.3a","5.MD.3b","5.MD.4","5.MD.5a","5.MD.5b","5.MD.5c","5.G.3","5.G.4"]},
          {u:"Module 6",t:"Foundations to Geometry in the Coordinate Plane",q:4,c:["5.OA.3","5.NF.4b","5.G.1","5.G.2","5.G.4"]}]
      },
      im:{
        "4":[
          {u:"Unit 1",t:"Factors and Multiples",q:1,c:["4.OA.4"]},
          {u:"Unit 2",t:"Fraction Equivalence and Comparison",q:1,c:["4.NF.1","4.NF.2"]},
          {u:"Unit 3",t:"Extending Operations to Fractions",q:1,c:["4.NF.3a","4.NF.3b","4.NF.3c","4.NF.3d","4.NF.4a","4.NF.4b","4.NF.4c","4.MD.4"]},
          {u:"Unit 4",t:"From Hundredths to Hundred-thousands",q:2,c:["4.NF.5","4.NF.6","4.NF.7","4.NBT.1","4.NBT.2","4.NBT.3","4.NBT.4"]},
          {u:"Unit 5",t:"Multiplicative Comparison and Measurement",q:3,c:["4.OA.1","4.OA.2","4.MD.1","4.MD.2"]},
          {u:"Unit 6",t:"Multiplying and Dividing Multi-digit Numbers",q:3,c:["4.OA.3","4.NBT.5","4.NBT.6"]},
          {u:"Unit 7",t:"Angles and Angle Measurement",q:4,c:["4.MD.5a","4.MD.5b","4.MD.6","4.MD.7","4.G.1"]},
          {u:"Unit 8",t:"Properties of Two-dimensional Shapes",q:4,c:["4.G.1","4.G.2","4.G.3","4.MD.3","4.OA.5"]},
          {u:"Unit 9",t:"Putting It All Together",q:4,c:[]}],
        "5":[
          {u:"Unit 1",t:"Finding Volume",q:1,c:["5.MD.3a","5.MD.3b","5.MD.4","5.MD.5a","5.MD.5b","5.MD.5c","5.OA.1"]},
          {u:"Unit 2",t:"Fractions as Quotients and Fraction Multiplication",q:1,c:["5.NF.3","5.NF.4a","5.NF.4b","5.NF.6"]},
          {u:"Unit 3",t:"Multiplying and Dividing Fractions",q:2,c:["5.NF.4a","5.NF.5a","5.NF.5b","5.NF.6","5.NF.7a","5.NF.7b","5.NF.7c"]},
          {u:"Unit 4",t:"Wrapping Up Multiplication and Division with Multi-Digit Numbers",q:2,c:["5.NBT.1","5.NBT.2","5.NBT.5","5.NBT.6"]},
          {u:"Unit 5",t:"Place Value Patterns and Decimal Operations",q:3,c:["5.NBT.1","5.NBT.3a","5.NBT.3b","5.NBT.4","5.NBT.7"]},
          {u:"Unit 6",t:"More Decimal and Fraction Operations",q:3,c:["5.NF.1","5.NF.2","5.NBT.7","5.MD.1","5.MD.2"]},
          {u:"Unit 7",t:"Shapes on the Coordinate Plane",q:4,c:["5.G.1","5.G.2","5.G.3","5.G.4","5.OA.3"]},
          {u:"Unit 8",t:"Putting It All Together",q:4,c:[]}]
      }
    }
  };
  window.ECPacing=P;
})();
