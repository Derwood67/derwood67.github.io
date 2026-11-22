ECDemo.define([
  {at:"h1",say:"The Text Analyzer is a teacher tool. Pick a book or poem to see its summary, text structure, theme, point of view, and more."},
  {at:"#title",do:"type",value:"Because of Winn",say:"Type a title, or tap one from the library."},
  {at:{text:"Because of Winn-Dixie"},do:"click",wait:1100},
  {at:function(){return Array.prototype.find.call(document.querySelectorAll("h2,h3"),function(e){return /summary/i.test(e.textContent)&&e.offsetHeight})},say:"You get the summary,"},
  {at:function(){return Array.prototype.find.call(document.querySelectorAll("h2,h3"),function(e){return /theme/i.test(e.textContent)&&e.offsetHeight})},say:"the theme, main idea, characters, setting, and narrator, ready to use in a lesson."}
]);
