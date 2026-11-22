ECDemo.define([
  {at:"h1",say:"This is the Love, Amalia Story Explorer. You work through the story one part at a time."},
  {at:"#nameInput",do:"type",value:"Sam",say:"Type your first name to start."},
  {at:{text:"Start"},do:"click",wait:900},
  {at:"button.tile",say:"This is the Story Map: setting, point of view, characters, plot, theme, and main idea. Each part unlocks the next."},
  {at:"button.tile",do:"click",say:"Let's open the first part, Setting.",wait:900},
  {at:"#note",do:"type",value:"Abuelita's kitchen is a special place for Amalia. She feels safe there because they cook and share stories every Friday.",say:"Read the question, then answer in at least two complete sentences."},
  {at:"#submitNote",do:"click",say:"Tap Check my answer. You find out right away if you nailed it.",wait:1300},
  {at:{text:"Quiz"},say:"When all six parts are done, the Quiz unlocks, and then the Summary."},
  {at:{text:"My Progress"},say:"My Progress shows everything you've finished."}
]);
