ECDemo.define([
  {at:"h1",say:"The Water Cycle Game Room has eleven games about the water cycle, weather, and how water shapes the land."},
  ECDemo.signin("Sam"),
  {at:"button.pick",say:"Each game shows the science standard it practices. Pick one to play."},
  {at:function(){return document.querySelectorAll("button.pick")[1]},do:"click",say:"Let's try Raindrop Journey.",wait:1000},
  {at:"h2",say:"Every right answer moves your raindrop one step around the water cycle. Get it back to the lake to win."},
  {at:"button.opt",do:"click",say:"Read the question and tap an answer.",wait:1300},
  {at:{text:"All games"},say:"You can switch games any time, like Memory Match, Sort It Out, or the forty-question challenge."}
]);
