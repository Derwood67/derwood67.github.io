ECDemo.define([
  {at:"h1",say:"Story Trail: read stories, poems, and articles, then answer questions about theme, main idea, and point of view."},
  {at:"#studentName",do:"type",value:"Sam Davis",say:"Type your first and last name."},
  {at:"button.level",do:"click",say:"Pick your trail. Trailhead has shorter passages, Ridge is on level, and Summit is the challenge."},
  {at:"#startBtn",do:"click",say:"Then start the trail.",wait:1100},
  {at:"h2",say:"Read the passage. You can tap Read to me to listen, or make the words bigger."},
  {at:"button.opt",do:"click",say:"Answer each question.",wait:500},
  {at:{text:"Show a hint"},say:"Need help? Show a hint."},
  {at:{text:"Check answer"},do:"click",say:"Then check your answer.",wait:1200},
  {at:"#homeBtn",say:"Every student gets a different set of passages, so your quiz is made just for you."}
]);
