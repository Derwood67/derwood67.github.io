ECDemo.define([
  {at:"h1",say:"Paragraph Quest! You write three paragraphs and get red-pen feedback."},
  {at:"#nm",do:"type",value:"Sam",say:"Type your name."},
  {at:{text:"4th grade"},do:"click",say:"Pick your grade."},
  {at:".fontcard",say:"You can even pick a font that's easy for you to read."},
  {at:"[data-act=begin]",do:"click",say:"Then get your writing prompt. Every writer gets a different one.",wait:1000},
  {at:"h2",say:"Read the prompt, who you're writing for, and the bonus challenge. Try to use a word from the word bank."},
  {at:"#ta-intro",do:"type",value:"Have you ever thought about this question? I have, and I have a strong answer.",say:"Write your introduction, a middle paragraph, and a conclusion. Each box gives you tips."},
  {at:"[data-act=submit]",do:"click",say:"When you're done, submit. You check off each step first, then get a score, corrections, and tips, and you can revise.",wait:1200}
]);
