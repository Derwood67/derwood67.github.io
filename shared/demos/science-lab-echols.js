ECDemo.define([
  {at:"#gt",say:"Welcome to the Science Lab! Every fifth grade science standard is here."},
  {at:"#gname",do:"type",value:"Sam Davis",say:"Type your first and last name."},
  {at:{text:"Start the lab"},do:"click",wait:1000},
  {at:"button.tbtn",say:"Pick a standard on the left, like Matter and Energy, or Ecosystems."},
  {at:"button.tbtn",do:"click",wait:800},
  {at:"button.tab",say:"Each standard has tabs: the standards, a chapter to read, EOG practice, activities, games, videos, and notes."},
  {at:function(){return Array.prototype.find.call(document.querySelectorAll("button.tab"),function(b){return /^Games/.test(b.textContent.trim())})},do:"click",say:"Let's open Games.",wait:900},
  {at:"button.bin",say:"In this game, you decide if mixing or heating makes a new substance or not."},
  {at:function(){return Array.prototype.find.call(document.querySelectorAll("button.tab"),function(b){return /^EOG/.test(b.textContent.trim())})},say:"EOG Practice has passages and questions just like the real test."}
]);
