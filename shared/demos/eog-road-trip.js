ECDemo.define([
  {at:"h1",say:"Road Trip Review is a test-prep road trip across North Carolina. Ten questions, ten stops."},
  {at:"#name",do:"type",value:"Sam",say:"Type your first name."},
  {at:{text:"5th grade"},do:"click",say:"Pick your grade."},
  {at:{text:"Math"},do:"click",say:"Then pick math or reading."},
  {at:"#start",do:"click",say:"Now start driving!",wait:1000},
  {at:".choice",say:"Each stop has one EOG-style question. A right answer earns a green light to the next town."},
  {at:"#choice-1",do:"click",say:"Tap your answer. If you miss, you get a flat tire and an explanation, so you learn the right way to solve it.",wait:1400},
  {at:"#next",say:"Then drive on. At Manteo, you get a trip report of the standards you have down and the ones to practice."}
]);
