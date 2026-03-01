/* ═════════════════════════════════════════
   KAKAWETE SECRET SANTA 2026
   Application JavaScript
   SONARWA General Insurance Co. Ltd
══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const PEOPLE = [
  "ABATESI KELLEN","BIMENYIMANA RUKUNDO EMMANUEL","BIZIMANA JEAN BAPTISTE",
  "BUCYANA JEAN DE DIEU","BUCYANA MOSES","BUGINGO FRANCOIS REGIS",
  "BURENGERO FRANCOIS XAVIER","GAJU CYNTHIA","GASASIRA ELIPHAZ",
  "GATABAZI JEAN BOSCO","GATERA JEAN","HABIMANA CHANTAL",
  "HARERIMANA BONIFACE","HATANGIMANA JUVENAL","HATEGEKAYO FRANCINE",
  "IRADUKUNDA ALPHONSE","IRADUKUNDA ARSENE","ISHIMWE MARIE THERESE",
  "KAJANGANA JEAN DESIRE","KALIMBA JEAN CLAUDE","KAMANZI CHARLOTTE",
  "KAMUGISHA MOSES","KANYAMAHORO KAZUNGU DEUS","MANIRAKIZA REVERIEN",
  "MBAYINE K DAVID","MBONIGABA SILAS","MUBERARUGO RUZIBIZA VANESSA",
  "MUHAWENIMANA YVONNE","MUHIMPUNDU SANGWA ORNELLA","MUKABISANGWA JEANNETTE",
  "MUKAHIRWA GERMAINE","MUKAMPORERA IMMACULEE","MUKAMURENZI JACQUELINE",
  "MUKAMURENZI MARIE CLAIRE","MUKANDUNGUTSE VESTINE","MUNYANDOHA ROBERT",
  "MUNYANEZA SIMON","MUNYANGABE NOVO HERVE","MUREKATETE ESPERANCE",
  "MUREKATETE JACKLINE","MUREKATETE JOSIANE","MURENZI LEONARD",
  "MURIISA ABEL","MUSHIMIYIMANA ESTHER","NDACYAYISENGA OSWALD",
  "NDAGIJIMANA PRUDENCE","NDAMUKUNDA DEO MAXIME","NDAYISABA AMANI",
  "NDIKUBWIMANA CELESTIN","NIYONAMBAJE AIMABLE","NSABIMANA FIDELE",
  "NSENGIMANA NTAGANDA","NTIRIKWENDERA JEAN BOSCO","NTIYOBERWUWAYO ERNEST",
  "NYAMWASA THEOGENE","RUKUNDO ELIE","RULISA ALAIN","RWAKAZINA OLIVIER",
  "RWAKUNDA QUINTA","RWEKAZA KANYONI ALEXIS","SEZIBERA C.MENDEL",
  "SHEMA JOTHAM","TURABUMUKIZA ANNE MARIE","TUYISENGE CLAUDETTE",
  "UMAZIMINSI EZECHIEL","UMUHOZA AURORE","UMUHOZA CHARITINE",
  "UMUHOZA MARIE GRACE","UMURAZA COSETTE FABIOLLA","UMURERWA VIVIANNE",
  "UMUTESI SPERATHA","UWASE MARIE ROSE","UWAYEZU CHRISTINE",
  "UWERA MATUTINA","UWIMANA EMMANUEL","UWIMANA IMMACULEE",
  "UWIMANA WINNY","UWIZERA DORCAS"
];

const ADMIN_PW      = "Sonarwa@25";
const LS_VOTES_KEY  = "kk26_votes";
const LS_TAKEN_KEY  = "kk26_taken";

/* ─────────────────────────────────────────
   STATE
───────────────────────────────────────── */
let votes        = [];
let taken        = new Set();
let currentVoter = "";
let selectedNum  = null;

/* ─────────────────────────────────────────
   UTILS
───────────────────────────────────────── */
const n = s => s.trim().toLowerCase().replace(/\s+/g, ' ');

function initials(name) {
  const parts = name.trim().split(' ').filter(Boolean);
  if (!parts.length) return '?';
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

function fmtTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' });
}

function showErr(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
}

/* ─────────────────────────────────────────
   PERSISTENCE
───────────────────────────────────────── */
function save() {
  try {
    localStorage.setItem(LS_VOTES_KEY, JSON.stringify(votes));
    localStorage.setItem(LS_TAKEN_KEY, JSON.stringify([...taken]));
  } catch(e) {}
}

function load() {
  try {
    const v = localStorage.getItem(LS_VOTES_KEY);
    const t = localStorage.getItem(LS_TAKEN_KEY);
    if (v) votes = JSON.parse(v);
    if (t) taken = new Set(JSON.parse(t));
  } catch(e) { votes = []; taken = new Set(); }
}

/* ─────────────────────────────────────────
   PARTICLE CANVAS
───────────────────────────────────────── */
function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const resize = () => {
    canvas.width  = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const symbols = ['❄','·','✦','•','*'];
  const pts = Array.from({ length: 55 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.4 + 0.4,
    vx: (Math.random() - 0.5) * 0.15,
    vy: -(Math.random() * 0.25 + 0.08),
    a: Math.random() * 0.35 + 0.08,
    s: symbols[Math.floor(Math.random() * symbols.length)]
  }));

  const loop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pts) {
      ctx.save();
      ctx.globalAlpha = p.a;
      ctx.fillStyle = '#ffffff';
      ctx.font = `${p.r * 9}px serif`;
      ctx.fillText(p.s, p.x, p.y);
      ctx.restore();
      p.x += p.vx; p.y += p.vy;
      if (p.y < -20) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
    }
    requestAnimationFrame(loop);
  };
  loop();
}

/* ─────────────────────────────────────────
   SCREEN ROUTER
───────────────────────────────────────── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const fb = document.getElementById('floatReveal');
  fb.style.display = id === 'screen-vote' ? 'flex' : 'none';
}

/* ─────────────────────────────────────────
   SCREEN 1 — ENTER NAME
───────────────────────────────────────── */
function onNameInput(val) {
  const q = n(val);
  if (!q || q.length < 2) {
    document.getElementById('nameSuggestions').innerHTML = '';
    return;
  }
  const hits = PEOPLE.filter(p =>
    n(p).includes(q) ||
    q.split(' ').some(w => w.length > 2 && n(p).includes(w))
  ).slice(0, 5);

  document.getElementById('nameSuggestions').innerHTML = hits.map(p =>
    `<span class="suggestion-item" onclick="fillName('${p}')">${p}</span>`
  ).join('');
}

function fillName(name) {
  document.getElementById('nameInput').value = name;
  document.getElementById('nameSuggestions').innerHTML = '';
  document.getElementById('nameError').style.display = 'none';
  document.getElementById('nameInput').focus();
}

function proceedToVote() {
  const raw = document.getElementById('nameInput').value.trim();
  const err = document.getElementById('nameError');
  err.style.display = 'none';

  if (!raw || raw.length < 2) {
    showErr(err, '⚠ Please enter your full name to continue.');
    document.getElementById('nameInput').focus();
    return;
  }

  const matched = PEOPLE.find(p => n(p) === n(raw));
  if (!matched) {
    showErr(err, '⚠ Name not found. Please enter your name exactly as it appears on the list.');
    return;
  }

  if (votes.find(v => n(v.voter) === n(matched))) {
    showErr(err, `⚠ ${matched} has already participated. Each person may only pick once.`);
    return;
  }

  document.getElementById('nameSuggestions').innerHTML = '';
  currentVoter = matched;
  selectedNum = null;
  buildVoteGrid();
  showScreen('screen-vote');
}

function goBack() {
  selectedNum = null;
  document.getElementById('nameInput').value = '';
  document.getElementById('nameError').style.display = 'none';
  document.getElementById('nameSuggestions').innerHTML = '';
  showScreen('screen-name');
  setTimeout(() => document.getElementById('nameInput').focus(), 200);
}

/* ─────────────────────────────────────────
   SCREEN 2 — PICK NUMBER
───────────────────────────────────────── */
function buildVoteGrid() {
  const selfIdx = PEOPLE.findIndex(p => n(p) === n(currentVoter));

  document.getElementById('voterBanner').innerHTML = `
    <div class="voter-avatar">${initials(currentVoter)}</div>
    <div class="voter-info">
      <h3>${currentVoter}</h3>
      <p>Select a gift number below — it reveals your secret recipient!</p>
    </div>`;

  document.getElementById('numGrid').innerHTML = PEOPLE.map((_, i) => {
    const isTaken = taken.has(i);
    const isSelf  = i === selfIdx;
    const cls     = isTaken ? 'taken' : isSelf ? 'self-blocked' : '';
    const lbl     = isTaken ? 'Taken' : isSelf ? 'You' : 'Free';
    return `<div class="num-cell ${cls}" id="nc${i}" onclick="pickNum(${i})">
      <div class="num-n">${i + 1}</div>
      <div class="num-lbl">${lbl}</div>
    </div>`;
  }).join('');

  setConfirm(false);
}

function pickNum(i) {
  if (taken.has(i)) return;
  const selfIdx = PEOPLE.findIndex(p => n(p) === n(currentVoter));
  if (i === selfIdx) return;

  if (selectedNum !== null) {
    const prev = document.getElementById('nc' + selectedNum);
    if (prev) { prev.classList.remove('selected'); prev.querySelector('.num-lbl').textContent = 'Free'; }
  }

  selectedNum = i;
  const cell = document.getElementById('nc' + i);
  cell.classList.add('selected');
  cell.querySelector('.num-lbl').textContent = '✓ Chosen';
  setConfirm(true);
}

function setConfirm(on) {
  const btn = document.getElementById('confirmBtn');
  const fb  = document.getElementById('floatReveal');
  if (btn) btn.disabled = !on;
  if (fb)  fb.disabled  = !on;
}

/* ─────────────────────────────────────────
   SCREEN 3 — RESULT
───────────────────────────────────────── */
function confirmVote() {
  if (selectedNum === null) return;

  const selfIdx = PEOPLE.findIndex(p => n(p) === n(currentVoter));
  if (selectedNum === selfIdx) { alert('⚠ You cannot pick yourself!'); return; }

  const entry = { voter: currentVoter, numIdx: selectedNum, ts: Date.now() };
  votes.push(entry);
  taken.add(selectedNum);
  save();

  const num       = selectedNum + 1;
  const recipient = PEOPLE[selectedNum];

  document.getElementById('resultWrap').innerHTML = `
    <span class="result-icon">🎄</span>
    <div class="result-who">${currentVoter} — Santa</div>

    <div class="result-num-block">
      <span class="result-num-label">Gift No.</span>
      <span class="result-num-val">${num}</span>
    </div>

    <div class="result-divider">🎁</div>

    <div class="result-recipient-label">🎀 Your Secret Santa Recipient is</div>
    <div class="result-recipient-name">${recipient}</div>

    <div class="result-note">
      <strong>${currentVoter}</strong> will be the Secret Santa for <strong>${recipient}</strong>.
      Keep this a secret until the day of the event! 🤫
    </div>`;

  showScreen('screen-result');
  launchConfetti();
}

function launchConfetti() {
  const colors = ['#0B2B5E','#C8102E','#d4a623','#ffffff','#1e4d9e'];
  for (let i = 0; i < 70; i++) {
    const d = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = Math.random() > 0.5 ? '360deg' : '-360deg';
    d.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999;
      top:${15 + Math.random() * 30}vh;
      left:${Math.random() * 100}vw;
      width:${4 + Math.random() * 6}px;
      height:${4 + Math.random() * 6}px;
      background:${color};
      border-radius:${Math.random() > 0.4 ? '50%' : '2px'};
      opacity:1;
      animation: cFall ${1.4 + Math.random() * 1.6}s ease-in ${Math.random() * 0.4}s forwards;
    `;
    document.body.appendChild(d);
    d.addEventListener('animationend', () => d.remove());
  }
}

/* ─────────────────────────────────────────
   ADMIN LOGIN
───────────────────────────────────────── */
function adminLogin() {
  const pw  = document.getElementById('adminPw').value.trim();
  const err = document.getElementById('adminError');
  err.style.display = 'none';

  if (pw !== ADMIN_PW) {
    showErr(err, '⚠ Incorrect password. Please try again.');
    document.getElementById('adminPw').value = '';
    document.getElementById('adminPw').focus();
    return;
  }

  document.getElementById('adminPw').value = '';
  openAdminPanel();
}

/* ─────────────────────────────────────────
   ADMIN PANEL
───────────────────────────────────────── */
function openAdminPanel() {
  const total    = PEOPLE.length;
  const assigned = votes.length;
  const pending  = total - assigned;
  const pct      = total ? Math.round((assigned / total) * 100) : 0;

  document.getElementById('adminStats').innerHTML = `
    <div class="stat-box"><div class="stat-val">${assigned}</div><div class="stat-name">Assigned</div></div>
    <div class="stat-box"><div class="stat-val red">${taken.size}</div><div class="stat-name">Numbers Taken</div></div>
    <div class="stat-box"><div class="stat-val muted">${pending}</div><div class="stat-name">Pending</div></div>
    <div class="stat-box"><div class="stat-val gold">${total}</div><div class="stat-name">Total Staff</div></div>`;

  document.getElementById('progressPct').textContent = pct + '%';
  setTimeout(() => document.getElementById('progressFill').style.width = pct + '%', 60);

  renderAdminRows(votes);

  const done     = new Set(votes.map(v => n(v.voter)));
  const notDone  = PEOPLE.filter(p => !done.has(n(p)));
  document.getElementById('pendingCount').textContent = notDone.length;
  document.getElementById('pendingChips').innerHTML = notDone.length === 0
    ? '<p style="color:var(--navy);font-size:13px;font-weight:600">🎉 Everyone has participated!</p>'
    : notDone.map(p => `<span class="chip-item">${p}</span>`).join('');

  showScreen('screen-admin');
}

function renderAdminRows(data) {
  const tbody = document.getElementById('adminBody');
  if (!data.length) {
    tbody.innerHTML = `<tr class="table-empty"><td colspan="6">🎅 No assignments yet — Ho Ho Ho!</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map((v, i) => `
    <tr>
      <td class="td-num">${i + 1}</td>
      <td class="td-name"><strong>${v.voter}</strong></td>
      <td><span class="gift-badge-num">${v.numIdx + 1}</span></td>
      <td class="td-recipient"><strong>${PEOPLE[v.numIdx]}</strong></td>
      <td><span class="ts-cell">${fmtTime(v.ts)}</span></td>
      <td><button class="del-btn" onclick="adminDelete(${votes.indexOf(v)})" title="Remove">✕</button></td>
    </tr>`).join('');
}

function filterAdmin(q) {
  const sq = q.toLowerCase().trim();
  if (!sq) { renderAdminRows(votes); return; }
  renderAdminRows(votes.filter(v =>
    v.voter.toLowerCase().includes(sq) ||
    (PEOPLE[v.numIdx] || '').toLowerCase().includes(sq)
  ));
}

function adminDelete(idx) {
  const v = votes[idx];
  if (!v) return;
  if (!confirm(`Remove ${v.voter}'s assignment?`)) return;
  taken.delete(v.numIdx);
  votes.splice(idx, 1);
  save();
  openAdminPanel();
}

function exportCSV() {
  const rows = [['#','Santa','Gift Number','Recipient','Time']];
  votes.forEach((v, i) => {
    rows.push([i+1, v.voter, v.numIdx+1, PEOPLE[v.numIdx], fmtTime(v.ts)]);
  });
  const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `KAKAWETE_2026_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function confirmReset() {
  if (!confirm('⚠ RESET ALL DATA?\n\nThis will permanently delete all assignments and free all gift numbers.')) return;
  votes = []; taken = new Set();
  save();
  openAdminPanel();
}

/* ─────────────────────────────────────────
   BOOT
───────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  load();
  initCanvas();
  showScreen('screen-name');
  setTimeout(() => {
    const inp = document.getElementById('nameInput');
    if (inp) inp.focus();
  }, 300);
});
