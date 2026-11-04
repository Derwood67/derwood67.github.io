import json
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
                                TableStyle, PageBreak, KeepTogether, Flowable)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from xml.sax.saxutils import escape as esc

D = "/usr/share/fonts/truetype/dejavu/"
pdfmetrics.registerFont(TTFont("Sans", D + "DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Sans-B", D + "DejaVuSans-Bold.ttf"))
pdfmetrics.registerFontFamily("Sans", normal="Sans", bold="Sans-B")

data = json.load(open("questions.json"))
SCI, FR = data["SCI"], data["FR"]

INK = colors.HexColor("#16303a"); MUTED = colors.HexColor("#56717b"); LINE = colors.HexColor("#c9dade")
SCIC = colors.HexColor("#0f8a7e"); FRC = colors.HexColor("#d9572b")
SCISOFT = colors.HexColor("#d9f1ee"); FRSOFT = colors.HexColor("#fbe4da")

ss = lambda **k: ParagraphStyle("x", **{"fontName":"Sans","textColor":INK, **k})
H1 = ss(fontName="Sans-B", fontSize=24, leading=28)
H2 = ss(fontName="Sans-B", fontSize=16, leading=20, spaceBefore=4, spaceAfter=6)
BODY = ss(fontSize=10.5, leading=14)
SMALL = ss(fontSize=9, leading=12, textColor=MUTED)
Q = ss(fontName="Sans-B", fontSize=11, leading=15)
CH = ss(fontSize=10.5, leading=14, leftIndent=20)
TAG = ss(fontName="Sans-B", fontSize=8, leading=10)
KEYQ = ss(fontName="Sans-B", fontSize=9.5, leading=12.5)
KEYA = ss(fontSize=9, leading=12, leftIndent=12)

class Bars(Flowable):
    """Fraction bar models, same as the game."""
    def __init__(self, v, color):
        super().__init__(); self.v = v; self.c = color; self.h = 26; self.gap = 8
    def wrap(self, aw, ah):
        return aw, len(self.v) * (self.h + self.gap)
    def draw(self):
        W = 4.2 * inch; x0 = 20
        for r, (n, d) in enumerate(self.v):
            y = (len(self.v) - 1 - r) * (self.h + self.gap)
            w = W / d
            for i in range(d):
                self.canv.setStrokeColor(INK); self.canv.setLineWidth(1)
                self.canv.setFillColor(self.c if i < n else colors.white)
                self.canv.rect(x0 + i * w, y, w, self.h, fill=1, stroke=1)
            self.canv.setFillColor(INK); self.canv.setFont("Sans-B", 13)
            self.canv.drawString(x0 + W + 12, y + 8, f"?/{d}" if n == 0 else f"{n}/{d}")

def footer(c, doc):
    c.saveState(); c.setFont("Sans", 8); c.setFillColor(MUTED)
    c.drawString(0.75 * inch, 0.5 * inch, "Check-In Challenge · Take-Home Review")
    c.drawRightString(7.75 * inch, 0.5 * inch, f"Page {doc.page}")
    c.restoreState()

doc = BaseDocTemplate("Check-In_Challenge_Review_Packet.pdf", pagesize=letter,
                      leftMargin=0.75*inch, rightMargin=0.75*inch, topMargin=0.7*inch, bottomMargin=0.8*inch,
                      title="Check-In Challenge Review Packet", author="Morehead Montessori")
doc.addPageTemplates([PageTemplate(frames=[Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="f")], onPage=footer)])
story = []

# ---- Page 1: name + standards chart
story += [Paragraph("Check-In Challenge Review Packet", H1), Spacer(1, 4),
          Paragraph("5th Grade Science (NC) and Equivalent Fractions (NC.4.NF.1)", ss(fontSize=11, leading=14, textColor=MUTED)),
          Spacer(1, 14)]
nm = Table([["Student name:", "", "Date:", ""], ["Teacher:", "", "Deck played:", ""]],
           colWidths=[1.1*inch, 2.9*inch, 1.0*inch, 2.0*inch], rowHeights=[28, 28])
nm.setStyle(TableStyle([("FONT", (0,0), (-1,-1), "Sans-B", 10.5), ("TEXTCOLOR", (0,0), (-1,-1), INK),
    ("LINEBELOW", (1,0), (1,-1), 1, INK), ("LINEBELOW", (3,0), (3,-1), 1, INK), ("VALIGN", (0,0), (-1,-1), "BOTTOM")]))
story += [nm, Spacer(1, 16), Paragraph("My Standards Chart", H2),
          Paragraph("After you play the game, write your score for each standard. Shade the bar to match your percent, "
                    "then check one box. Any standard below 60% is the one you need more help with.", BODY), Spacer(1, 8)]

def topics(qs):
    out = []
    for q in qs:
        if q["s"] not in [t for t, _ in out]: out.append((q["s"], sum(1 for x in qs if x["s"] == q["s"])))
    return out

hdr = ["Standard", "Score", "0%      25%      50%      75%     100%", "Needs\nhelp", "Almost\nthere", "On\ntrack"]
rows = [hdr]
bands = []
for label, qs, col in [("SCIENCE", SCI, SCISOFT), ("FRACTIONS", FR, FRSOFT)]:
    rows.append([label, "", "", "", "", ""]); bands.append((len(rows)-1, col))
    for t, n in topics(qs):
        rows.append([Paragraph(esc(t), ss(fontSize=9.5, leading=12)), f"___ / {n}", "", "☐", "☐", "☐"])
chart = Table(rows, colWidths=[2.1*inch, 0.75*inch, 2.75*inch, 0.47*inch, 0.47*inch, 0.47*inch],
              rowHeights=[30] + [None]*(len(rows)-1))
st = [("FONT", (0,0), (-1,0), "Sans-B", 8), ("TEXTCOLOR", (0,0), (-1,-1), INK), ("FONT", (1,1), (-1,-1), "Sans", 10),
      ("FONT", (3,1), (-1,-1), "Sans", 14), ("ALIGN", (1,0), (-1,-1), "CENTER"), ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
      ("LINEBELOW", (0,0), (-1,-1), 0.5, LINE), ("TOPPADDING", (0,1), (-1,-1), 6), ("BOTTOMPADDING", (0,1), (-1,-1), 6)]
for r, c in bands:
    st += [("SPAN", (0,r), (-1,r)), ("BACKGROUND", (0,r), (-1,r), c), ("FONT", (0,r), (-1,r), "Sans-B", 9), ("ALIGN", (0,r), (-1,r), "LEFT")]
for r in range(1, len(rows)):
    if r not in [b for b, _ in bands]:
        st += [("BOX", (2,r), (2,r), 0.75, INK), ("LINEAFTER", (2,r), (2,r), 0.75, INK)]
chart.setStyle(TableStyle(st))

class Ticks(Flowable):
    """Draws quarter tick marks over every bar cell after the table lays out."""
chart_rows = len(rows)
story += [chart, Spacer(1, 12),
          Paragraph("<b>I need more help with:</b> ______________________________________________", BODY), Spacer(1, 10),
          Paragraph("<b>My goal for next time:</b> ______________________________________________", BODY), Spacer(1, 10),
          Paragraph("<b>Family signature:</b> ____________________________", BODY), PageBreak()]

# ---- Questions
def section(title, qs, color, soft, start):
    out = [Paragraph(title, H2), Paragraph("Circle the best answer. Answers and explanations are at the back.", SMALL), Spacer(1, 8)]
    for i, q in enumerate(qs):
        tag = Table([[Paragraph(esc(q["s"]), ss(fontName="Sans-B", fontSize=8, leading=10, textColor=color))]])
        tag.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), soft), ("LEFTPADDING", (0,0), (-1,-1), 6), ("RIGHTPADDING", (0,0), (-1,-1), 6),
                                 ("TOPPADDING", (0,0), (-1,-1), 2), ("BOTTOMPADDING", (0,0), (-1,-1), 2)]))
        tag.hAlign = "LEFT"
        blk = [tag, Spacer(1, 3), Paragraph(f"{start+i}. {esc(q['q'])}", Q), Spacer(1, 4)]
        if q.get("v"): blk += [Bars(q["v"], color), Spacer(1, 4)]
        for j, (t, _) in enumerate(q["a"]):
            blk.append(Paragraph(f"<b>{'ABCD'[j]}</b>&nbsp;&nbsp;{esc(t)}", CH))
        blk.append(Spacer(1, 12))
        out.append(KeepTogether(blk))
    return out

story += section("Part 1 · 5th Grade Science", SCI, SCIC, SCISOFT, 1)
story.append(PageBreak())
story += section("Part 2 · Equivalent Fractions (NC.4.NF.1)", FR, FRC, FRSOFT, 31)
story.append(PageBreak())

# ---- Answer key
story += [Paragraph("Answer Key and Explanations", H2),
          Paragraph("✓ marks the correct answer. Every choice explains why it is right or wrong.", SMALL), Spacer(1, 8)]
for start, qs in [(1, SCI), (31, FR)]:
    for i, q in enumerate(qs):
        blk = [Paragraph(f"{start+i}. Answer: {'ABCD'[q['c']]} &nbsp;<font color='#56717b'>({esc(q['s'])})</font>", KEYQ)]
        for j, (t, why) in enumerate(q["a"]):
            mark = "✓" if j == q["c"] else "✗"
            colr = "#1f8a4c" if j == q["c"] else "#c23b3b"
            blk.append(Paragraph(f"<font color='{colr}'><b>{mark} {'ABCD'[j]}</b></font> {esc(t)}: {esc(why)}", KEYA))
        blk.append(Spacer(1, 7))
        story.append(KeepTogether(blk))

doc.build(story)
print("built")
