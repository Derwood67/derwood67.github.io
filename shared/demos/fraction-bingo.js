ECDemo.define(function(h){return [
  {at:"h1",say:"Fraction Bingo! Your teacher calls fraction problems, you solve them, and you find the answer on your card."},
  ECDemo.signin("Sam"),
  {at:"#t-card",do:"click",say:"Go to My Card.",wait:600},
  {at:"#s-rand",do:"click",say:"Tap Give me a card to get your own bingo card.",wait:900},
  {at:"button.cell:not(.free)",say:"When you solve a problem, find the answer on your card. It might look different, like a decimal or an equivalent fraction."},
  {at:function(){return document.querySelectorAll("button.cell:not(.free)")[2]},do:"click",say:"Tap the square to mark it."},
  {at:"button.cell.free",say:"Five in a row wins. Then your teacher checks your card on the Check a Winner tab."},
  {at:"#t-caller",say:"The Teacher Caller is locked with the teacher's code, so only your teacher can call problems."}
]});
