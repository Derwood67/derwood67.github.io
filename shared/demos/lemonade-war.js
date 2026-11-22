ECDemo.define([
  {at:"h1",say:"Welcome to The Lemonade War Reading Stand, a reading workout for the novel."},
  {at:"#nm",do:"type",value:"Sam Davis",say:"Sign in with your first and last name."},
  {at:{text:"Let's read!"},do:"click",wait:1000},
  {at:".jar, [class*=jar]",need:true,say:"This is your money jar. Every correct practice answer adds two dollars. Can you reach one hundred?"},
  {at:"button.tab",say:"There are five sections, like characters and setting. You have to show mastery before the next one opens."},
  {at:"h3",say:"Each section starts with a short lesson. Here you meet the characters."},
  {at:"button.opt",do:"click",say:"Then you practice. Tap an answer, and the stand tells you if you got it, with a hint if you didn't.",wait:1200},
  {at:{text:"Final book quiz"},say:"After all five sections, the final book quiz unlocks."}
]);
