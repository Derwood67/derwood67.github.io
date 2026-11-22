ECDemo.define([
  {at:"h1",say:"The Note-Taking Lab teaches you to take good notes. Good notes are not copying. They're the few important words."},
  {at:"#student",do:"type",value:"Sam Davis",say:"Type your name, then pick what you're taking notes for."},
  {at:"#ptitle",say:"Read the passage all the way through first."},
  {at:function(){return document.querySelectorAll("span.s")[1]},do:"click",say:"Then tap the sentences that matter most to highlight them."},
  {at:"#show",do:"click",say:"Tap Show what to note to compare with what a good reader would pick.",wait:1200},
  {at:"#f0",do:"type",value:"Lena, Theo, Pine Creek",say:"Now fill in the notes organizer with short key words, not whole sentences."},
  {at:"#model",say:"When you're done, see the model notes and compare."},
  {at:"#wtitle",say:"And the important vocabulary is right here when you need it."}
]);
