'use strict';

// ---------- Stag Hunt payoffs ----------
// (you, opponent):
//  Stag/Stag -> (4, 4)
//  Stag/Hare -> (0, 3)
//  Hare/Stag -> (3, 0)
//  Hare/Hare -> (2, 2)
const PAYOFFS = {
  STAG_STAG: [4, 4],
  STAG_HARE: [0, 3],
  HARE_STAG: [3, 0],
  HARE_HARE: [2, 2],
};

// ---------- State ----------
let round = 0;
let yourTotal = 0;
let oppTotal = 0;
let pStag = 0.50; // Opponent P(Stag) in [0,1]

// ---------- DOM refs ----------
const pStagInput   = document.getElementById('pStag');
const applyPBtn    = document.getElementById('applyP');

const btnStag      = document.getElementById('btnStag');
const btnHare      = document.getElementById('btnHare');
const btnReset     = document.getElementById('btnReset');

const resultP      = document.getElementById('result');
const scoreP       = document.getElementById('score');
const historyBody  = document.getElementById('historyBody');

// ---------- Utilities ----------
const clampPctInput = (x) => Math.max(0, Math.min(100, x));
const fmt2 = (x) => Number(x).toFixed(2);

// Opponent policy: choose Stag with prob pStag, else Hare
function sampleOpponent(p) {
  return Math.random() < p ? 'Stag' : 'Hare';
}

function applyP() {
  let val = Number(pStagInput.value);
  if (!Number.isFinite(val)) val = 50;
  val = clampPctInput(val);
  pStagInput.value = val;
  pStag = val / 100;
}

// ---------- Core round logic ----------
function playRound(yourMove) {
  const oppMove = sampleOpponent(pStag);

  let yp = 0, op = 0;
  if (yourMove === 'Stag' && oppMove === 'Stag') [yp, op] = PAYOFFS.STAG_STAG;
  if (yourMove === 'Stag' && oppMove === 'Hare') [yp, op] = PAYOFFS.STAG_HARE;
  if (yourMove === 'Hare' && oppMove === 'Stag') [yp, op] = PAYOFFS.HARE_STAG;
  if (yourMove === 'Hare' && oppMove === 'Hare') [yp, op] = PAYOFFS.HARE_HARE;

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
btnStag.addEventListener('click', () => playRound('Stag'));
btnHare.addEventListener('click', () => playRound('Hare'));
btnReset.addEventListener('click', resetGame);

// ---------- Init ----------
applyP(); // read initial pStag from input
