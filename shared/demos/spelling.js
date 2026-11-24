ECDemo.define(function(h){
  return [
  {at:"h1, .stage h2",say:"Spelling Studio! Hear a word, spell it, and climb from third grade words all the way to twelfth."},
  ECDemo.signin("Sam"),
  {at:".grades",need:true,say:"First, pick your grade. The words start there, then get harder or easier to fit you."},
  {at:'.grades [data-g="4"]',need:true,do:"click",wait:900},
  {at:".modes",say:"There are six ways to practice: Hear and Type, Letter Tiles, a Spelling Bee, Write a Sentence, a Spelling Test, and Missed Words."},
  {at:'.mode[data-m="type"]',do:"click",say:"Let's try Hear and Type.",wait:1200},
  {at:"#spk",say:"Tap the big speaker to hear the word and a sentence. You can also hear it slowly."},
  {at:"#boxes",need:true,say:"The boxes show how many letters the word has."},
  {at:"#ans",say:"Type the word.",run:async function(h){await h.type("#ans",window.SpellDemo.word())}},
  {at:"#chk",do:"click",say:"Then tap Check. Right on the first try earns a star, and right answers in a row build a streak.",wait:1400},
  {at:"#quit",do:"click",say:"If you miss, green letters show what you got right, and missed words go on your Missed Words list.",wait:900},
  {at:"#hm",need:true,do:"click",wait:700},
  {at:'.mode[data-m="tiles"]',do:"click",say:"In Letter Tiles, you build the word with tiles. Watch out for extra letters!",wait:1200},
  {at:"#tiles",say:"Tap the tiles in order, or drag them into the boxes.",run:async function(h){var w=window.SpellDemo.word().toLowerCase();for(var i=0;i<w.length;i++){var t=window.SpellDemo.tileFor(w[i]);if(t){await h.click(t);await h.sleep(250)}}await h.sleep(900)}},
  {at:"#quit",do:"click",wait:800},
  {at:"#hm",need:true,do:"click",wait:700},
  {at:'.mode[data-m="sent"]',say:"In Write a Sentence, you spell the word, then write your own sentence. Made-up words don't count. It checks for real words, a capital letter, an end mark and enough words."},
  {at:'.mode[data-m="bee"]',say:"And the Spelling Bee gives you three lives. Every right answer makes the next word harder. Now it's your turn!"}
]});
