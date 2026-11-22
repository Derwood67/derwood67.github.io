ECDemo.define([
  {at:"h1",say:"The Capital Research Lab helps you research Washington, D.C. and beyond, using safe, kid-friendly sites."},
  {at:"#firstname",do:"type",value:"Sam",say:"Log in with your first name."},
  {at:{text:"Start researching"},do:"click",wait:1000},
  {at:"#search",do:"type",value:"cherry blossoms",say:"Search any subject here."},
  {at:"button.tab",say:"Or pick a topic, like U.S. Government, Space, or Famous People, to see trusted research sites and videos."},
  {at:function(){return document.querySelectorAll("button.tab")[4]},do:"click",wait:800},
  {at:"#question",do:"type",value:"Why does Washington have cherry trees?",say:"Keep your notes here. Start with your research question."},
  {at:"#fact",do:"type",value:"Japan gave the city cherry trees as a gift of friendship.",say:"Then write each fact in your own words, and save it with its source."},
  {at:{text:"Save fact"},say:"Your teacher can see your research on the teacher dashboard."}
]);
