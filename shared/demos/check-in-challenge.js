ECDemo.define([
  {at:"h1",say:"Check-In Challenge is EOG-style practice. Every deck has thirty multiple-choice questions."},
  {at:"#sname",do:"type",value:"Sam Davis",say:"Type your first and last name."},
  {at:"button.deck",say:"Then pick a deck: science, fractions, or a mixed review."},
  {at:function(){return document.querySelectorAll("button.deck")[1]},do:"click",wait:1000},
  {at:"button.ans",say:"Read the question. Tap an answer, or press A, B, C, or D on the keyboard."},
  {at:function(){return document.querySelectorAll("button.ans")[3]},do:"click",wait:1200},
  {at:"button.ans",say:"After every answer, each choice shows why it is right or wrong. That's how you learn from the misses."},
  {at:{text:"Next question"},need:true,say:"Then go on to the next question. Your score and streak are at the top."}
]);
