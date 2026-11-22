ECDemo.define(function(h){
  function ans(){var t=(document.querySelector("#problem")||{}).textContent||"",m=/(\d+)\s*([+−×÷x\-*\/])\s*(\d+)/.exec(t);if(!m)return "1";
    var a=+m[1],b=+m[3],o=m[2];return String(o==="+"?a+b:(o==="−"||o==="-")?a-b:(o==="÷"||o==="/")?a/b:a*b)}
  return [
  {at:"h1",say:"Minute Math Sprint: check where you start, practice, then sprint."},
  {at:"button.mode",say:"Baseline sets your starting score. Practice has no timer. Sprint is where you beat the clock."},
  {at:function(){return document.querySelectorAll("button.mode")[1]},do:"click",say:"Let's practice."},
  {at:{text:"Multiplication"},say:"Pick an operation, like multiplication."},
  {at:"#name",do:"type",value:"Sam Davis",say:"Type your name."},
  {at:"#start",do:"click",wait:900},
  {at:"#problem",say:"Solve the fact and type the answer with the number pad.",run:async function(h){
     var a=ans(),keys=document.querySelectorAll("button.key");await h.sleep(900);
     for(var i=0;i<a.length;i++){var k=Array.prototype.find.call(keys,function(b){return b.textContent.trim()===a[i]});if(k){await h.click(k);await h.sleep(250)}}}},
  {at:"button.key.go",do:"click",say:"Tap Go.",wait:1000},
  {at:"#problem",say:"In practice you get two tries, then you see the answer. Later, sprint to beat your baseline."}
]});
