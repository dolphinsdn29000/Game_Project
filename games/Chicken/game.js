// ---------- Game parameters (payoffs) ----------
const PAYOFFS = {
  // [your payoff, opponent payoff]
  SWERVE_SWERVE: [2, 2],
  SWERVE_STRAIGHT: [1, 3],
  STRAIGHT_SWERVE: [3, 1],
  STRAIGHT_STRAIGHT: [-10, -10],
};

// ---------- State ----------
let round = 0;
let yourTotal = 0;
let oppTotal = 0;
let pStraight = 0.50; // opponent P(Straight) in [0,1]

// ---------- DOM refs ----------
const evStraightSpan = document.getElementById('evStraight');
const evSwerveSpan   = document.getElementById('evSwerve');
const bestReplySpan  = document.getElementById('bestReply');
const pStraightInput = document.getElementById('pStraight');
const applyPBtn      = document.getElementById('applyP');
const btnSwerve      = document.getElementById('btnSwerve');
const btnStraight    = document.getElementById('btnStraight');
const btnReset       = document.getElementById('btnReset');
const resultP        = document.getElementById('result');
const scoreP         = document.getElementById('score');
const historyBody    = document.getElementById('historyBody');

// ---------- Helpers ----------
function sampleOpponent(p) {
  // Return 'Straight' with prob p, else 'Swerve'
  return Math.random() < p ? 'Straight' : 'Swerve';
}

function updateExpectedDisplay() {
  const p = pStraight;
  // E[You Straight] = p*(-10) + (1-p)*3 = 3 - 13p
  // E[You Swerve]   = p*(1)   + (1-p)*2 = 2 - p
  const evStraight = 3 - 13 * p;
  const evSwerve   = 2 - p;

  evStraightSpan.textContent = evStraight.toFixed(2);
  evSwerveSpan.textContent   = evSwerve.toFixed(2);

  let best = '';
  if (Math.abs(evStraight - evSwerve) < 1e-9) {
    best = 'Tie: either action is fine (indifferent).';
  } else if (evStraight > evSwerve) {
    best = 'Best reply: Straight';
  } else {
    best = 'Best reply: Swerve';
  }
  bestReplySpan.textContent = best;
}

function applyP() {
  // clamp to [0,100]
  let val = Number(pStraightInput.value);
  if (!Number.isFinite(val)) val = 50;
  val = Math.max(0, Math.min(100, val));
  pStraightInput.value = val;
  pStraight = val / 100;
  updateExpectedDisplay();
}

// ---------- Core round logic ----------
function playRound(yourMove) {
  const oppMove = sampleOpponent(pStraight);

  // Determine payoff cell
  let yp = 0, op = 0;
  if (yourMove === 'Swerve' && oppMove === 'Swerve') [yp, op] = PAYOFFS.SWERVE_SWERVE;
  if (yourMove === 'Swerve' && oppMove === 'Straight') [yp, op] = PAYOFFS.SWERVE_STRAIGHT;
  if (yourMove === 'Straight' && oppMove === 'Swerve') [yp, op] = PAYOFFS.STRAIGHT_SWERVE;
  if (yourMove === 'Straight' && oppMove === 'Straight') [yp, op] = PAYOFFS.STRAIGHT_STRAIGHT;

  // Update totals
  round += 1;
  yourTotal += yp;
  oppTotal += op;

  // Render result
  resultP.textContent = `Round ${round}: You chose ${yourMove}, opponent chose ${oppMove}. Payoffs → You: ${yp}, Opp: ${op}.`;
  scoreP.textContent = `Your total: ${yourTotal} · Opponent total: ${oppTotal}`;

  // Add to history (keep last ~20 rows)
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${round}</td><td>${yourMove}</td><td>${oppMove}</td><td>${yp}</td><td>${op}</td>`;
  historyBody.prepend(tr);
  while (historyBody.children.length > 20) historyBody.removeChild(historyBody.lastChild);
}

function resetGame() {
  round = 0; yourTotal = 0; oppTotal = 0;
  resultP.textContent = '';
  scoreP.textContent = 'Your total: 0 · Opponent total: 0';
  historyBody.innerHTML = '';
}

// ---------- Wiring ----------
applyPBtn.addEventListener('click', applyP);
btnSwerve.addEventListener('click',   () => playRound('Swerve'));
btnStraight.addEventListener('click', () => playRound('Straight'));
btnReset.addEventListener('click', resetGame);

// ---------- Initial render ----------
updateExpectedDisplay();
