ECDemo.define([
  {at:"h1",say:"Word Parts Workshop teaches over three hundred prefixes, suffixes, and Greek and Latin roots."},
  ECDemo.signin("Sam"),
  {at:"#tab-explore",say:"In Explore, you learn the parts."},
  {at:".cardtop",do:"click",say:"Tap a card to see what the part means and words that use it.",wait:1100},
  {at:"#tab-build",do:"click",say:"In Build a Word, you read a meaning and tap the parts in the right order.",wait:900},
  {at:"#b-hint",do:"click",say:"Stuck? Tap Hint.",wait:1100},
  {at:"#tab-sent",say:"Write Sentences and Write a Paragraph check your spelling, tense, and punctuation. Made-up words don't count."},
  {at:"#tab-quiz",say:"The Quiz unlocks after you practice. You earn Mastery only when everything is correct."},
  {at:"#tab-bingo",say:"And Bingo is read by our game show host, Monifa!"}
]);
