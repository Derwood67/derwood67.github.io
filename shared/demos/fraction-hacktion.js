ECDemo.define([
  {at:"h1, .logo, header",say:"Fraction Hacktion teaches fraction shortcuts, called hacks."},
  ECDemo.signin("Sam"),
  {at:"[data-act=open]",say:"Each mission is one hack, matched to a fraction standard."},
  {at:"[data-act=open]",do:"click",say:"Let's open the Magic One Hack.",wait:900},
  {at:"[data-act=start]",say:"First you learn how the hack works, with a worked example and a trap to watch out for."},
  {at:"[data-act=start]",do:"click",say:"Then you start hacking.",wait:900},
  {at:"[data-act=ans]",say:"Crack each code by picking the right answer."},
  {at:function(){return document.querySelectorAll("[data-act=ans]")[2]},do:"click",wait:1200},
  {at:"[data-act=hint], [data-act=next], .tab",need:true,say:"Stuck? Show the hack for half the points. Right answers earn hack XP and raise your rank."}
]);
