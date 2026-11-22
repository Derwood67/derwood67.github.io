ECDemo.define(function(h){
  var B=window.NOVEL_BOOK||{chapters:[{sk:[[""," "]]}]};
  function right(){var want=(B.chapters[0].sk[0][1]||"").slice(0,40);
    return Array.prototype.find.call(document.querySelectorAll("[data-act=skpick]"),function(b,i){return i<4&&b.innerText.indexOf(want)>=0})}
  return [
    {at:"#app h1",say:"Welcome to Read and Unlock! You read a chapter of the class novel, then show what you know in three steps."},
    {at:"#nm",do:"type",value:"Sam",say:"Start by typing your first name."},
    {at:"#app button[type=submit]",do:"click",wait:900},
    {at:"[data-act=open].chap",say:"This is your chapter map. Chapters unlock one at a time, so you always know what's next."},
    {at:"[data-act=open].chap",do:"click",say:"Let's open Chapter 1.",wait:900},
    {at:".tab.cur",say:"Step one is Story Skills: questions about text structure, point of view, main idea, voice, setting, and characters."},
    {at:right,do:"click",say:"Read the question, then pick the best answer."},
    {at:"[data-act=skcheck]",do:"click",say:"Check your answer. You find out right away, with an explanation of why.",wait:1200},
    {at:"[data-act=tab][data-t=summary]",do:"click",say:"Step two: write a summary of the chapter in your own words.",wait:800},
    {at:"#sum",do:"type",value:"In this chapter, April moves in with her grandmother and meets Melanie. The girls find an empty yard behind the Professor's shop.",say:"Made-up words don't count, so write real sentences about what happened."},
    {at:"[data-act=tab][data-t=quiz]",say:"Step three is the chapter quiz. It unlocks when the first two steps are done. Finish all three, and the next chapter opens."},
    {at:"#out",say:"Your teacher sees everyone's scores and summaries on the Teacher Dashboard."}
  ];
});
