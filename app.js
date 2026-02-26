/* ═══════════════════════════════════════
   KAKAWETE – Secret Santa
   app.js (Corrected)
═══════════════════════════════════════ */

// ── Constants ──
const DEFAULT_PEOPLE = [
  "ABATESI KELLEN",
  "BIMENYIMANA RUKUNDO EMMANUEL",
  "BIZIMANA JEAN BAPTISTE",
  "BUCYANA JEAN DE DIEU",
  "BUCYANA MOSES",
  "BUGINGO FRANCOIS REGIS",
  "BURENGERO FRANCOIS XAVIER",
  "GAJU CYNTHIA",
  "GASASIRA ELIPHAZ",
  "GATABAZI JEAN BOSCO",
  "GATERA JEAN",
  "HABIMANA CHANTAL",
  "HARERIMANA BONIFACE",
  "HATANGIMANA JUVENAL",
  "HATEGEKAYO FRANCINE",
  "IRADUKUNDA ALPHONSE",
  "IRADUKUNDA ARSENE",
  "ISHIMWE MARIE THERESE",
  "KAJANGANA JEAN DESIRE",
  "KALIMBA JEAN CLAUDE",
  "KAMANZI CHARLOTTE",
  "KAMUGISHA MOSES",
  "KANYAMAHORO KAZUNGU DEUS",
  "MANIRAKIZA REVERIEN",
  "MBAYINE K DAVID",
  "MBONIGABA SILAS",
  "MUBERARUGO RUZIBIZA VANESSA",
  "MUHAWENIMANA YVONNE",
  "MUHIMPUNDU SANGWA ORNELLA",
  "MUKABISANGWA JEANNETTE",
  "MUKAHIRWA GERMAINE",
  "MUKAMPORERA IMMACULEE",
  "MUKAMURENZI JACQUELINE",
  "MUKAMURENZI MARIE CLAIRE",
  "MUKANDUNGUTSE VESTINE",
  "MUNYANDOHA ROBERT",
  "MUNYANEZA SIMON",
  "MUNYANGABE NOVO HERVE",
  "MUREKATETE ESPERANCE",
  "MUREKATETE JACKLINE",
  "MUREKATETE JOSIANE",
  "MURENZI LEONARD",
  "MURIISA ABEL",
  "MUSHIMIYIMANA ESTHER",
  "NDACYAYISENGA OSWALD",
  "NDAGIJIMANA PRUDENCE",
  "NDAMUKUNDA DEO MAXIME",
  "NDAYISABA AMANI",
  "NDIKUBWIMANA CELESTIN",
  "NIYONAMBAJE AIMABLE",
  "NSABIMANA FIDELE",
  "NSENGIMANA NTAGANDA",
  "NTIRIKWENDERA JEAN BOSCO",
  "NTIYOBERWUWAYO ERNEST",
  "NYAMWASA THEOGENE",
  "RUKUNDO ELIE",
  "RULISA ALAIN",
  "RWAKAZINA OLIVIER",
  "RWAKUNDA QUINTA",
  "RWEKAZA KANYONI ALEXIS",
  "SEZIBERA C.MENDEL",
  "SHEMA JOTHAM",
  "TURABUMUKIZA ANNE MARIE",
  "TUYISENGE CLAUDETTE",
  "UMAZIMINSI EZECHIEL",
  "UMUHOZA AURORE",
  "UMUHOZA CHARITINE",
  "UMUHOZA MARIE GRACE",
  "UMURAZA COSETTE FABIOLLA",
  "UMURERWA VIVIANNE",
  "UMUTESI SPERATHA",
  "UWASE MARIE ROSE",
  "UWAYEZU CHRISTINE",
  "UWERA MATUTINA",
  "UWIMANA EMMANUEL",
  "UWIMANA IMMACULEE",
  "UWIMANA WINNY",
  "UWIZERA DORCAS"
];

// ── State ──
let people = [...DEFAULT_PEOPLE];
let votes = [];
let takenNumbers = new Set();
let currentVoterName = "";
let selectedNumber = null;

// ── Helpers ──
function normalizeName(s) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) screen.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Persist state ──
function saveState() {
  localStorage.setItem('ss_votes_v1', JSON.stringify(votes));
  localStorage.setItem('ss_taken_v1', JSON.stringify([...takenNumbers]));
}

// ── Snowflakes ──
function spawnSnowflakes() {
  const container = document.getElementById('snowflakes');
  if (!container) return; // prevent crash if element missing

  const symbols = ['❄','❅','❆','✦','★','✶'];
  for (let i = 0; i < 18; i++) {
    const sf = document.createElement('div');
    sf.className = 'sf';
    sf.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    sf.style.left = Math.random() * 100 + 'vw';
    sf.style.fontSize = (10 + Math.random() * 14) + 'px';
    sf.style.animationDuration = (8 + Math.random() * 12) + 's';
    sf.style.animationDelay = (Math.random() * 10) + 's';
    sf.style.opacity = 0.08 + Math.random() * 0.12;
    container.appendChild(sf);
  }
}

// ── Boot ──
window.addEventListener('DOMContentLoaded', () => {
  spawnSnowflakes();

  const savedPeople = localStorage.getItem('ss_people_v1');
  const savedVotes  = localStorage.getItem('ss_votes_v1');
  const savedTaken  = localStorage.getItem('ss_taken_v1');

  if (savedPeople) { 
    try { 
      const p = JSON.parse(savedPeople); 
      if (p.length === DEFAULT_PEOPLE.length) people = p; 
    } catch(e){} 
  }
  if (savedVotes)  { 
    try { votes = JSON.parse(savedVotes); } catch(e){ votes = []; } 
  }
  if (savedTaken)  { 
    try { takenNumbers = new Set(JSON.parse(savedTaken)); } catch(e){ takenNumbers = new Set(); } 
  }

  // Clear stale data if saved list length doesn't match current list
  if (savedPeople) {
    try {
      const p = JSON.parse(savedPeople);
      if (p.length !== DEFAULT_PEOPLE.length) {
        votes = [];
        takenNumbers = new Set();
        localStorage.removeItem('ss_votes_v1');
        localStorage.removeItem('ss_taken_v1');
        localStorage.removeItem('ss_people_v1');
      }
    } catch(e) {}
  }

  showScreen('screen-name');
  setTimeout(() => document.getElementById('nameInput').focus(), 300);
});

// ════════════════════════════════════════
// SCREEN 1 — Enter Name
// ════════════════════════════════════════
function proceedToVote() {
  const raw = document.getElementById('nameInput').value.trim();
  const err = document.getElementById('nameError');

  if (!raw || raw.length < 2) {
    err.textContent = '⚠ Please enter your full name.';
    err.style.display = 'block';
    document.getElementById('nameInput').focus();
    return;
  }

  // Validate name is on the official list
  const matchedPerson = people.find(p => normalizeName(p) === normalizeName(raw));
  if (!matchedPerson) {
    err.innerHTML = '⚠ Invalid name. Please enter your name <strong>exactly</strong> as it appears on the participant list.';
    err.style.display = 'block';
    document.getElementById('nameInput').focus();
    return;
  }

  // Duplicate voter check
  const alreadyVoted = votes.find(v => normalizeName(v.voterName) === normalizeName(raw));
  if (alreadyVoted) {
    err.textContent = `⚠ You have already participated! Each person can only pick once.`;
    err.style.display = 'block';
    document.getElementById('nameInput').focus();
    return;
  }

  err.style.display = 'none';
  currentVoterName = matchedPerson; // use the canonical casing from the list
  selectedNumber = null;

  document.getElementById('voteHeader').innerHTML = `
    <div class="vote-avatar">${getInitials(currentVoterName)}</div>
    <div>
      <h2>${currentVoterName}</h2>
      <p>Pick your Secret Santa gift number below!</p>
    </div>`;

  const selfIndex = people.findIndex(p => normalizeName(p) === normalizeName(currentVoterName));

  document.getElementById('numberGrid').innerHTML = Array.from({ length: people.length }, (_, i) => {
    const taken = takenNumbers.has(i);
    const isSelf = i === selfIndex;
    return `
      <div class="num-card ${taken ? 'taken' : ''} ${isSelf ? 'self-blocked' : ''}" id="ncard-${i}" onclick="pickNumber(${i})">
        <div class="taken-dot"></div>
        <div class="num-big">${i + 1}</div>
        <div class="num-tag">${taken ? 'TAKEN' : isSelf ? '🚫 YOU' : 'FREE'}</div>
      </div>`;
  }).join('');

  document.getElementById('confirmBtn').disabled = true;
  showScreen('screen-vote');
}

function goBack() {
  selectedNumber = null;
  document.getElementById('nameInput').value = '';
  showScreen('screen-name');
  setTimeout(() => document.getElementById('nameInput').focus(), 100);
}

// ════════════════════════════════════════
// SCREEN 2 — Pick a Number
// ════════════════════════════════════════
function pickNumber(i) {
  if (takenNumbers.has(i)) return;

  const selfIndex = people.findIndex(p => normalizeName(p) === normalizeName(currentVoterName));
  if (i === selfIndex) return;

  if (selectedNumber !== null) {
    const prev = document.getElementById('ncard-' + selectedNumber);
    if (prev) {
      prev.classList.remove('selected');
      prev.querySelector('.num-tag').textContent = 'FREE';
    }
  }

  selectedNumber = i;
  const card = document.getElementById('ncard-' + i);
  card.classList.add('selected');
  card.querySelector('.num-tag').textContent = '✓ CHOSEN';
  document.getElementById('confirmBtn').disabled = false;
}

// ════════════════════════════════════════
// SCREEN 3 — Reveal Result
// ════════════════════════════════════════
function confirmVote() {
  if (selectedNumber === null) return;

  const selfIndex = people.findIndex(p => normalizeName(p) === normalizeName(currentVoterName));
  if (selectedNumber === selfIndex) {
    alert("⚠ You cannot pick yourself as your recipient!");
    return;
  }

  votes.push({ voterName: currentVoterName, numberIndex: selectedNumber });
  takenNumbers.add(selectedNumber);
  saveState();

  const number = selectedNumber + 1;
  const person = people[selectedNumber];

  document.getElementById('resultCard').innerHTML = `
    <span class="result-gifts">🎁</span>
    <div class="result-voter-name">${currentVoterName}</div>
    <div class="result-divider"></div>
    <div class="result-sub">🎁 You picked gift number</div>
    <div class="result-number-big">${number}</div>
    <div class="result-reveal-label">🎀 Your Secret Santa recipient is</div>
    <div class="result-person-name">${person}</div>
    <div class="result-person-sub">
      <strong>${currentVoterName}</strong> will be the Secret Santa for
      <span class="highlight">${person}</span> 
    </div>
  `;

  showScreen('screen-result');
}

// ════════════════════════════════════════
// SCREEN 4 — Summary
// ════════════════════════════════════════
function showSummary() {
  const taken = takenNumbers.size;

  document.getElementById('statsBar').innerHTML = `
    <div class="stat">
      <div class="stat-num">${votes.length}</div>
      <div class="stat-label">Santas Assigned</div>
    </div>
    <div class="stat">
      <div class="stat-num" style="color:var(--red2)">${taken}</div>
      <div class="stat-label">Numbers Taken</div>
    </div>
    <div class="stat">
      <div class="stat-num" style="color:var(--green2)">${people.length - taken}</div>
      <div class="stat-label">Numbers Free</div>
    </div>
  `;

  document.getElementById('summaryBody').innerHTML = votes.length === 0
    ? `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:28px;font-family:'DM Mono',monospace;font-size:12px;">
         🎅 No assignments yet — Ho Ho Ho!
       </td></tr>`
    : votes.map((v, i) => `
        <tr>
          <td style="color:var(--muted);font-family:'DM Mono',monospace;font-size:11px">${i + 1}</td>
          <td><strong>${v.voterName}</strong></td>
          <td><div class="num-badge">${v.numberIndex + 1}</div></td>
          <td><strong style="color:var(--green2)">${people[v.numberIndex]}</strong></td>
          <td><button class="btn-delete" onclick="deleteVote(${i})" title="Remove entry">✕</button></td>
        </tr>`).join('');

  showScreen('screen-summary');
}

function deleteVote(index) {
  const v = votes[index];
  takenNumbers.delete(v.numberIndex);
  votes.splice(index, 1);
  saveState();
  showSummary();
}
// ════════════════════════════════════════
// ADMIN PANEL
// ════════════════════════════════════════
const ADMIN_PASSWORD = "Sonarwa@25";

function adminLogin() {
  const pw = document.getElementById('adminPasswordInput').value.trim();
  const err = document.getElementById('adminError');
  if (pw !== ADMIN_PASSWORD) {
    err.textContent = '⚠ Incorrect password. Try again.';
    err.style.display = 'block';
    document.getElementById('adminPasswordInput').value = '';
    document.getElementById('adminPasswordInput').focus();
    return;
  }
  err.style.display = 'none';
  document.getElementById('adminPasswordInput').value = '';
  showAdminPanel();
}

function showAdminPanel() {
  const total = people.length;
  const assigned = votes.length;
  const free = total - assigned;
  const pct = Math.round((assigned / total) * 100);

  document.getElementById('adminStatsBar').innerHTML = `
    <div class="stat">
      <div class="stat-num">${assigned}</div>
      <div class="stat-label">Santas Assigned</div>
    </div>
    <div class="stat">
      <div class="stat-num" style="color:var(--red2)">${takenNumbers.size}</div>
      <div class="stat-label">Numbers Taken</div>
    </div>
    <div class="stat">
      <div class="stat-num" style="color:var(--green2)">${free}</div>
      <div class="stat-label">Pending</div>
    </div>
    <div class="stat">
      <div class="stat-num" style="color:var(--gold)">${total}</div>
      <div class="stat-label">Total People</div>
    </div>
  `;

  document.getElementById('progressPct').textContent = pct + '%';
  document.getElementById('progressFill').style.width = pct + '%';

  document.getElementById('adminSearch').value = '';
  renderAdminTable();

  const assignedNames = new Set(votes.map(v => normalizeName(v.voterName)));
  const unassigned = people.filter(p => !assignedNames.has(normalizeName(p)));
  document.getElementById('unassignedCount').textContent = unassigned.length;
  document.getElementById('unassignedList').innerHTML = unassigned.length === 0
    ? '<p style="color:var(--green2);font-size:14px;">🎉 Everyone has participated!</p>'
    : unassigned.map(p => `<div class="unassigned-chip">${p}</div>`).join('');

  showScreen('screen-admin');
}

function renderAdminTable() {
  const query = (document.getElementById('adminSearch')?.value || '').toLowerCase();
  const filtered = votes.filter(v =>
    !query ||
    v.voterName.toLowerCase().includes(query) ||
    (people[v.numberIndex] || '').toLowerCase().includes(query) ||
    String(v.numberIndex + 1).includes(query)
  );

  document.getElementById('adminSummaryBody').innerHTML = filtered.length === 0
    ? `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:28px;font-family:'DM Mono',monospace;font-size:12px;">
        ${votes.length === 0 ? '🎅 No assignments yet — Ho Ho Ho!' : '🔍 No results match your search.'}
       </td></tr>`
    : filtered.map(v => {
        const globalIndex = votes.indexOf(v);
        return `
          <tr>
            <td style="color:var(--muted);font-family:'DM Mono',monospace;font-size:11px">${globalIndex + 1}</td>
            <td><strong>${v.voterName}</strong></td>
            <td><div class="num-badge">${v.numberIndex + 1}</div></td>
            <td><strong style="color:var(--green2)">${people[v.numberIndex]}</strong></td>
            <td><button class="btn-delete" onclick="adminDeleteVote(${globalIndex})" title="Remove entry">✕</button></td>
          </tr>`;
      }).join('');
}

function adminDeleteVote(index) {
  if (!confirm('Remove ' + votes[index]?.voterName + "'s entry?")) return;
  const v = votes[index];
  takenNumbers.delete(v.numberIndex);
  votes.splice(index, 1);
  saveState();
  showAdminPanel();
}

function exportCSV() {
  const rows = [['#', 'Santa', 'Gift Number', 'Recipient']];
  votes.forEach((v, i) => {
    rows.push([i + 1, v.voterName, v.numberIndex + 1, people[v.numberIndex]]);
  });
  const csv = rows.map(r => r.map(c => '"' + c + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'kakawete_secret_santa_2026.csv';
  a.click();
}

function confirmReset() {
  if (!confirm('RESET ALL DATA?\n\nThis will delete ALL votes and free all numbers. This cannot be undone.')) return;
  votes = [];
  takenNumbers = new Set();
  saveState();
  showAdminPanel();
}