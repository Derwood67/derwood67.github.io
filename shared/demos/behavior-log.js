ECDemo.define([
  {at:"h1",say:"The Weekly Behavior Log is a classroom clipboard for tracking behavior, one tap at a time."},
  {at:"#quickRoster",do:"type",value:"Aaliyah M.\nBrandon T.\nCamila R.",say:"Start by adding your roster. These are sample names."},
  {at:"#quickRosterBtn",do:"click",wait:900},
  {at:"button.stu",do:"click",say:"Tap a student."},
  {at:"button.type.positive",do:"click",say:"Then tap the behavior. Green ones are positive, and there are minor and major ones too."},
  {at:"#noteInput",do:"type",value:"Helped a classmate during centers.",say:"Add a note if you want."},
  {at:"#logBtn",do:"click",say:"Then log it.",wait:900},
  {at:"#dayTitle",say:"It shows up in today's record."},
  {at:"#tab-week",say:"Week and students shows the patterns, and you can print a daily or weekly PDF."}
]);
