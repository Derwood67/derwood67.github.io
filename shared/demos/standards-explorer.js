ECDemo.define([
  {at:"h1",say:"States Standards and Pacing Guides. Read any state's standards, see which classroom apps practice each one, and when it's taught."},
  {at:"#stpick",say:"Pick Common Core or a state, like Virginia or Maryland, and then a district."},
  {at:"button.s-math",do:"click",say:"Pick a subject."},
  {at:function(){return Array.prototype.find.call(document.querySelectorAll("button"),function(b){return b.textContent.trim()==="4"&&b.offsetHeight})},do:"click",say:"And a grade.",wait:900},
  {at:"#only",say:"Each standard shows which apps practice it, and the North Carolina match."},
  {at:{text:"Pacing guide"},do:"click",say:"The Pacing guide shows when each standard is taught during the year.",wait:900}
]);
