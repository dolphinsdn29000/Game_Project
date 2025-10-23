'use strict';

// ---------- Battle of the Sexes payoffs ----------
// Using standard simple payoffs:
//  - Coordination on Baseball (your preferred)     -> (2, 1)
//  - Coordination on Opera   (opponent preferred)  -> (1, 2)
//  - Any miscoordination                          -> (0, 0)
const PAYOFFS = {
  BASEBALL_BASEBALL: [2, 1],
  BASEBALL_OPERA:    [0, 0],
  OPERA_BASEBALL:    [0, 0],
  OPERA_OPERA:       [1, 2],
};

// ---------- State ----------
let round = 0;
let yourTotal = 0;
let oppTotal = 0;
let pOpera = 0.50; // Opponent P(Opera) in [0,1]

// ---------- DOM refs ----------
const pOperaInput   = document.getElementById('pOpera');
const applyPBtn     = document.getElementById('applyP');

const btnBaseball   = document.getElementById('btnBaseball');
const btnOpera      = document.getElementById('btnOpera');
const btnReset      = document.getElementById('btnReset');

const resultP       = document.getElementById('result');
const scoreP        = document.getElementById('score');
const historyBody   = document.getElementById('historyBody');

// ---------- Utilities ----------
const clampPctInput = (x) => Math.max(0, Math.min(100, x));
const fmt2 = (x) => Number(x).toFixed(2);

// Opponent policy: choose Opera with prob pOpera, else Baseball
function sampleOpponent(p) {
  return Math.random() < p ? 'Opera' : 'Baseball';
}

function applyP() {
  let val = Number(pOperaInput.value);
  if (!Number.isFinite(val)) val = 50;
  val = clampPctInput(val);
  pOperaInput.value = val;
  pOpera = val / 100;
}

// ---------- Core round logic ----------
function playRound(yourMove) {
  const oppMove = sampleOpponent(pOpera);

  let yp = 0, op = 0;
  if (yourMove === 'Baseball' && oppMove === 'Baseball') [yp, op] = PAYOFFS.BASEBALL_BASEBALL;
  if (yourMove === 'Baseball' && oppMove === 'Opera')    [yp, op] = PAYOFFS.BASEBALL_OPERA;
  if (yourMove === 'Opera'    && oppMove === 'Baseball') [yp, op] = PAYOFFS.OPERA_BASEBALL;
  if (yourMove === 'Opera'    && oppMove === 'Opera')    [yp, op] = PAYOFFS.OPERA_OPERA;

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
btnBaseball.addEventListener('click', () => playRound('Baseball'));
btnOpera.addEventListener('click',    () => playRound('Opera'));
btnReset.addEventListener('click', resetGame);

// ---------- Init ----------
applyP(); // set pOpera from input
