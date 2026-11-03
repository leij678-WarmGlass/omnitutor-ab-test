// OmniTutor Kids — scripted demo of the two A/B test versions.
// Product A: text-only Socratic dialogue. Product B: identical dialogue + visual step-by-step diagrams (the only change, X).
const VARIANT = document.body.dataset.variant === 'B' ? 'B' : 'A';
const chat = document.getElementById('chat');

// ---------- diagrams (only shown in Product B) ----------
function box(x, w, text, color, strong) {
  return `<rect x="${x}" y="10" width="${w}" height="46" rx="10" fill="${strong ? color : '#fff'}" stroke="${color}" stroke-width="3"/>
  <text x="${x + w / 2}" y="41" text-anchor="middle" font-size="22" font-weight="800" fill="${strong ? '#fff' : color}">${text}</text>`;
}
const DIAGRAMS = {
  order: () => `<svg viewBox="0 0 330 96" width="330">
    ${box(10, 60, '2 +', '#2BB673', false)}${box(80, 110, '3 × 4', '#F28C28', true)}
    <text x="135" y="84" text-anchor="middle" font-size="14" font-weight="700" fill="#F28C28">① do × first</text>
    <text x="40" y="84" text-anchor="middle" font-size="14" font-weight="700" fill="#2BB673">② then +</text>
    <text x="240" y="41" font-size="22" font-weight="800" fill="#1C2440">= ?</text></svg>`,
  cookies: () => {
    let s = '<svg viewBox="0 0 330 110" width="330">';
    for (let b = 0; b < 3; b++) {
      const x = 12 + b * 106;
      s += `<path d="M${x} 30 h90 l-8 70 h-74 z" fill="#FFE8C7" stroke="#D99A4E" stroke-width="2.5"/>
            <text x="${x + 45}" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#8A5A1E">bag ${b + 1}</text>`;
      for (let c = 0; c < 4; c++) {
        const cx = x + 26 + (c % 2) * 38, cy = 52 + Math.floor(c / 2) * 28;
        s += `<circle cx="${cx}" cy="${cy}" r="11" fill="#C98A4B"/><circle cx="${cx - 3}" cy="${cy - 3}" r="2" fill="#5B3A1A"/><circle cx="${cx + 4}" cy="${cy + 2}" r="2" fill="#5B3A1A"/>`;
      }
    }
    return s + '</svg>';
  },
  steps: () => `<svg viewBox="0 0 330 150" width="330">
    ${box(10, 60, '2 +', '#2BB673', false)}${box(80, 110, '3 × 4', '#F28C28', true)}
    <path d="M135 59 v9" stroke="#1C2440" stroke-width="2.5" marker-end="url(#ar)"/>
    <defs><marker id="ar" markerWidth="5" markerHeight="5" refX="1" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z" fill="#1C2440"/></marker></defs>
    <g transform="translate(0,72)">${box(10, 60, '2 +', '#2BB673', true)}${box(80, 110, '12', '#F28C28', false)}</g>
    <text x="210" y="113" font-size="22" font-weight="800" fill="#1C2440">= 14</text></svg>`,
  practice: () => `<svg viewBox="0 0 330 96" width="330">
    ${box(10, 60, '5 +', '#2BB673', false)}${box(80, 110, '2 × 3', '#F28C28', true)}
    <text x="135" y="84" text-anchor="middle" font-size="14" font-weight="700" fill="#F28C28">① 2 × 3 = 6</text>
    <text x="40" y="84" text-anchor="middle" font-size="14" font-weight="700" fill="#2BB673">② 5 + 6</text>
    <text x="240" y="41" font-size="22" font-weight="800" fill="#1C2440">= 11</text></svg>`,
};
const CAPTIONS = { order: 'Orange box first, green box second.', cookies: '3 bags × 4 cookies = 12 cookies', steps: 'Step by step: 3 × 4 = 12, then 2 + 12 = 14', practice: 'Same rule: multiply first, then add.' };

// ---------- dialogue script (identical text in A and B) ----------
const S = {
  start: { t: "Hi! I'm Omni 👋 Let's solve this together:\n2 + 3 × 4 = ?", fig: 'order', o: [['20', 'wrong20'], ['14', 'right'], ["I'm not sure", 'unsure']] },
  wrong20: { t: "Good try! It looks like you did 2 + 3 first.\nIn a sum with + and ×, which one do we do first?", fig: 'order', o: [['× first', 'mulFirst'], ['+ first', 'plusFirst']] },
  plusFirst: { t: "Hmm, not quite. Multiplication goes before addition.\nSo let's start with 3 × 4. What is it?", fig: 'cookies', o: [['12', 'add'], ['7', 'seven']] },
  mulFirst: { t: 'Yes! × comes before +.\nSo what is 3 × 4?', fig: 'cookies', o: [['12', 'add'], ['7', 'seven']] },
  unsure: { t: "That's okay! Let's look at 3 × 4 first.\nImagine 3 bags with 4 cookies in each bag. How many cookies?", fig: 'cookies', o: [['12', 'add'], ['7', 'seven']] },
  seven: { t: '7 is 3 + 4. Times means "groups of".\n3 groups of 4 cookies — count them all. How many?', fig: 'cookies', o: [['12', 'add']] },
  add: { t: 'Great, 3 × 4 = 12.\nNow we add the 2 that was waiting: 2 + 12 = ?', fig: 'steps', o: [['14', 'right'], ['13', 'thirteen']] },
  thirteen: { t: 'Close! Count on from 12: 13, 14. What is 2 + 12?', o: [['14', 'right']] },
  right: { t: '🎉 Correct! 2 + 3 × 4 = 14.\nHere is what you learned today:', recap: true, fig: 'steps', o: [['Practice one more', 'practice'], ['Finish', 'finish']] },
  practice: { t: 'Your turn! 5 + 2 × 3 = ?', o: [['11', 'pRight'], ['21', 'pWrong']] },
  pWrong: { t: '21 is (5 + 2) × 3. Remember: × first!\nWhat is 2 × 3, then add 5?', fig: 'practice', o: [['11', 'pRight']] },
  pRight: { t: '⭐ Brilliant! 2 × 3 = 6, and 5 + 6 = 11.', fig: 'practice', o: [['Start again', 'restart']] },
  finish: { t: 'See you next time! Your progress is saved for your parent report.', o: [['Start again', 'restart']] },
};

function add(html, cls) { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; chat.append(d); d.scrollIntoView({ behavior: 'smooth', block: 'end' }); return d; }
function say(text) { const d = add('<span class="who">Omni</span>', 'msg t'); d.append(document.createTextNode(text)); }
function show(id) {
  if (id === 'restart') { chat.replaceChildren(); return show('start'); }
  const n = S[id];
  say(n.t);
  if (n.recap) {
    add(`<h3>Recap</h3>1. In a sum with + and ×, do × first.<br>2. "×" means groups of: 3 × 4 = 3 groups of 4.<br>3. Then add what is left.`, 'recap');
  }
  if (VARIANT === 'B' && n.fig) add(DIAGRAMS[n.fig]() + `<div class="cap">${CAPTIONS[n.fig]}</div>`, 'fig');
  const o = add('', 'opts');
  for (const [label, next] of n.o) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label;
    b.onclick = () => { o.remove(); add('<span class="who">You</span>' + label, 'msg k'); setTimeout(() => show(next), 350); };
    o.append(b);
  }
}
show('start');
