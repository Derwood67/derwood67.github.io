ECDemo.define([
  {at:"h1",say:"Landform Word Match. Tap a word, then tap the clue that goes with it."},
  {at:"#w-canyon",do:"click",say:"Let's tap canyon."},
  {at:"#c-canyon",do:"click",say:"Then the clue that fits: a deep valley with steep sides. Matched pairs turn green.",wait:1000},
  {at:"#w-scenic",do:"click",say:"Try another one: scenic."},
  {at:"#c-scenic",do:"click",wait:900},
  {at:"#tab-sentence",say:"When you've matched all the meanings, Round Two has you use the words in sentences."}
]);
