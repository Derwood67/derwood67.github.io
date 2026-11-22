ECDemo.define([
  {need:true,at:"#voiceBtn",run:function(){var b=document.querySelector("#voiceBtn");if(b&&/On/.test(b.textContent))b.click()}},
  {at:"h1",say:"Brain Blast Live is a classroom review game show, played on the big screen."},
  {at:"#g4",say:"Pick fourth or fifth grade questions, and play in teams or as players."},
  {at:"#p1",say:"Name your teams here."},
  {at:"button.tile",do:"click",say:"Pick a category and a point value.",wait:900},
  {at:"#overlay .buzz",say:"The buzzers are live! The first team to tap, or press its number key, gets to answer."},
  {at:"#overlay .buzz",do:"click",wait:700},
  {at:"#overlay .judge.ok",say:"The teacher judges the answer. Correct adds points, incorrect takes them away."},
  {at:{text:"Show answer"},say:"You can also show the answer. The host, Tony Monroe, reads every clue out loud when his voice is on."}
]);
