'use strict';

// ---------- Prisoner's Dilemma payoffs ----------
// (you, opponent): CC -> (3,3); C/D -> (0,5); D/C -> (5,0); DD -> (1,1)
const PAYOFFS = {
  COOP_COOP:     [3, 3],
  COOP_DEFECT:   [0, 5],
  DEFECT_COOP:   [5, 0],
  DEFECT_DEFECT: [1, 1],
};

// ---------- State ----------
let round = 0;
let yourTotal = 0;
let oppTotal = 0;
let pCooperate = 0.50; // Opponent P(Cooperate) in [0,1]

// ---------- DOM refs ----------
const pCoopInput    = document.getElementById('pCooperate');
const applyPBtn     = document.getElementById('applyP');

const btnCooperate  = document.getElementById('btnCooperate');
const btnDefect     = document.getElementById('btnDefect');
const btnReset      = document.getElementById('btnReset');

const resultP       = document.getElementById('result');
const scoreP        = document.getElementById('score');
const historyBody   = document.getElementById('historyBody');

// ---------- Utilities ----------
const clampPctInput = (x) => Math.max(0, Math.min(100, x));
const fmt2 = (x) => Number(x).toFixed(2);

// Sample opponent action given pCooperate
function sampleOpponent(p) {
  return Math.random() < p ? 'Cooperate' : 'Defect';
}

function applyP() {
  let val = Number(pCoopInput.value);
  if (!Number.isFinite(val)) val = 50;
  val = clampPctInput(val);
  pCoopInput.value = val;
  pCooperate = val / 100;
}

// ---------- Core round logic ----------
function playRound(yourMove) {
  const oppMove = sampleOpponent(pCooperate);

  let yp = 0, op = 0;
  if (yourMove === 'Cooperate' && oppMove === 'Cooperate') [yp, op] = PAYOFFS.COOP_COOP;
  if (yourMove === 'Cooperate' && oppMove === 'Defect')    [yp, op] = PAYOFFS.COOP_DEFECT;
  if (yourMove === 'Defect' && oppMove === 'Cooperate')    [yp, op] = PAYOFFS.DEFECT_COOP;
  if (yourMove === 'Defect' && oppMove === 'Defect')       [yp, op] = PAYOFFS.DEFECT_DEFECT;

  round += 1;
  yourTotal += yp;
  oppTotal += op;

  resultP.textContent = `Round ${round}: You chose ${yourMove}, opponent chose ${oppMove}. Payoffs → You: ${yp}, Opp: ${op}.`;
  scoreP.textContent  = `Your total: ${fmt2(yourTotal)} · Opponent total: ${fmt2(oppTotal)}`;

  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${round}</td><td>${yourMove}</td><td>${oppMove}</td><td>${yp}</td><td>${op}</td>`;
  historyBody.prepend(tr);
  while (historyBody.children.length > 20) historyBody.removeChild(historyBody.lastChild);
}

function resetGame() {
  round = 0; yourTotal = 0; oppTotal = 0;
  resultP.textContent = '';
  scoreP.textContent  = 'Your total: 0 · Opponent total: 0';
  historyBody.innerHTML = '';
}

// ---------- Wiring ----------
applyPBtn.addEventListener('click', applyP);
btnCooperate.addEventListener('click', () => playRound('Cooperate'));
btnDefect.addEventListener('click',    () => playRound('Defect'));
btnReset.addEventListener('click', resetGame);

// ---------- Init ----------
applyP(); // set pCooperate from input
