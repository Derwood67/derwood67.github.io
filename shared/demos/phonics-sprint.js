ECDemo.define([
  {at:"h1",say:"Phonics Practice and Sprint: practice first, then a one-minute sprint."},
  {at:"#student",do:"type",value:"Sam",say:"Type the student's name."},
  {at:{text:"CVC words"},do:"click",say:"Pick a skill. Each round uses a fresh random set."},
  {at:"#startPractice",do:"click",say:"Start practice.",wait:900},
  {at:"#bOk",say:"The student reads each item aloud. Tap Correct, or press the space bar."},
  {at:"#bOk",do:"click",wait:600},
  {at:"#bNo",do:"click",say:"Tap Not yet, or press X. With two tries on, the student gets another chance.",wait:700},
  {at:"#undo",say:"Made a mistake? Undo the last one. After practice, skip ahead to the one-minute sprint."}
]);
