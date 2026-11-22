ECDemo.define(function(h){
  function k(){var m=/into (\d+) equal/.exec(document.body.innerText);return m?+m[1]:2}
  return [
    {at:"h1",say:"This is Fraction Summit. You climb a mountain of fraction steps, one ridge at a time."},
    {at:"#nm",do:"type",value:"Sam D",say:"Type your first name and last initial. Use the same name every time, so your climb is saved."},
    {at:"#go",do:"click",wait:900},
    {at:"h1",say:"This is base camp. Each ridge has three parts. Every part has fifteen steps and a quiz gate."},
    {at:{text:"Start climbing"},do:"click",say:"Let's start climbing.",wait:900},
    {at:"#ck",say:"Each step asks you to do something with a model. Here, you slice the bar into equal pieces."},
    {at:function(){return document.querySelectorAll(".kbtn")[k()-1]},do:"click",say:"Tap the number to slice every part."},
    {at:"#ans1",say:"Count the shaded pieces and type the answer.",run:async function(h,el){var b=document.querySelector(".eq .fr b"),a=b?+b.textContent:1;await h.sleep(1200);await h.type(el,String(a*k()))}},
    {at:"#ck",do:"click",say:"Tap Check. If you miss, you get a hint and a short lesson before you keep going.",wait:1300},
    {at:"#tbtn",say:"After fifteen steps, a ten-question quiz opens the next part. Your teacher sees quiz scores on the dashboard."}
  ];
});
