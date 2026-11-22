ECDemo.define([
  {at:"h1",say:"Minute Reading Sprint is for reading aloud. The student reads, and the teacher scores."},
  {at:"#student",do:"type",value:"Sam",say:"Type the student's name."},
  {at:{text:"CVC words"},do:"click",say:"Pick a skill: letter sounds, short words, nonsense words, or sentences."},
  {at:"#practice",do:"click",say:"Practice has no timer. A timed round sets the baseline.",wait:900},
  {at:"#bOk",say:"The student reads the item aloud. Tap Correct, or press the space bar."},
  {at:"#bOk",do:"click",wait:700},
  {at:"#bNo",do:"click",say:"If it's not right yet, tap Not yet, or press X.",wait:700},
  {at:"#stop",say:"At the end, you see the score and how it compares to the baseline."}
]);
