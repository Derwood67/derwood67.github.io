ECDemo.define(function(h){
  function n(){var e=document.querySelector("#prompt .n");return e?+e.textContent:1}
  return [
  {at:"h1",say:"Frog Hop Fractions! Help Fernando the frog hop to every fraction."},
  ECDemo.signin("Sam"),
  {at:"button.lvl.workshop",say:"Start in the Number Line Workshop to learn the models: the number line, the bubble, and the bar."},
  {at:function(){return document.querySelectorAll("button.lvl")[1]},do:"click",say:"Each level unlocks the next one. Let's open Bubble Pop.",wait:900},
  {at:"#go",do:"click",say:"Read the short lesson, then hop in.",wait:900},
  {at:"#prompt",say:"The bottom number tells how many equal parts. The top number tells how many to shade."},
  {at:"path.slice",say:"Tap the parts of the bubble to shade them.",run:async function(h){var p=document.querySelectorAll("path.slice");for(var i=0;i<n()&&i<p.length;i++){await h.click(p[i]);await h.sleep(350)}}},
  {at:{text:"Check"},do:"click",say:"Then tap Check.",wait:1300},
  {at:"#back",say:"Master a level to unlock the next. Later levels have you build number lines and hop Fernando to the fraction."}
]});
