# Check-In Challenge

EOG-style check-in practice game for Morehead Montessori Elementary.

- **5th Grade Science** (NC 2023 standards): matter, forces and motion, ecosystems, cells and body systems, weather — 30 questions
- **Equivalent Fractions** (NC.4.NF.1): identify, find the missing number, fraction models, word problems, explain and prove — 30 questions
- **Mixed Review**: 15 of each

Every answer choice explains why it is right or wrong. Students type their name, and the results screen shows a score-by-standard chart and a report they can copy and email to their teacher.

## Files

| File | What it is |
|---|---|
| `index.html` | The game. Opens in any browser; no install needed. |
| `Check-In_Challenge_Review_Packet.pdf` | Take-home packet: name line, standards chart, all 60 questions, answer key with explanations. |
| `questions.json` | The question bank used to build the PDF. |
| `make_pdf.py` | Rebuilds the PDF from `questions.json` (`pip install reportlab`, then `python3 make_pdf.py`). |

Live at: https://derwood67.github.io/check-in-challenge/
