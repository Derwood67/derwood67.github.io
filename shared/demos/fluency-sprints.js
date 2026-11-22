ECDemo.define([
  {at:"h1",say:"Fluency Sprints: a one-minute reading check with grade-level passages."},
  {at:"#student",do:"type",value:"Sam",say:"Type the student's name."},
  {at:"#pick",say:"Pick a passage, or get a new random one."},
  {at:"#primary",do:"click",say:"Tap Start sprint. The student reads aloud for one minute.",wait:900},
  {at:function(){return document.querySelectorAll(".w")[6]},do:"click",say:"Tap any word the student misreads, skips, or needs help with."},
  {at:function(){return document.querySelectorAll(".w")[30]},say:"When time is up, tap the last word read, and you get words correct per minute."},
  {at:"#bankBtn",say:"Scores are saved in the Progress bank, so you can watch growth over time."}
]);
