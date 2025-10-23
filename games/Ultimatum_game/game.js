'use strict';

/*
Acceptance model (no player-visible probability):
- Endowment fixed each round.
- Logistic with a small floor so there's always a chance, and a clamp at 100%:
    p = floor + (1 - floor) * sigmoid( K * (offer - THETA) )
  We choose:
    floor = 0.01  (1% at 0% offer)
    THETA = 0.332
    K     = 17.442
  Which yields approximately:
    offer = 0%  ->  ~1.0% acceptance
    offer = 20% -> ~10.0% acceptance
    offer = 50% -> ~95.1% acceptance
    offer = 100% -> 100% acceptance (forced clamp)
*/

const ENDOW = 100;
const FLOOR = 0.01;    // 1% minimum acceptance even at 0% offer
const THETA = 0.332;
const K     = 17.442;

function acceptanceProb(offerFrac) {
  if (offerFrac <= 0) return FLOOR;
  if (offerFrac >= 1) return 1; // always accept at 100%
  const z = K * (offerFrac - THETA);
  const s = 1 / (1 + Math.exp(-z));         // sigmoid
  const p = FLOOR + (1 - FLOOR) * s;        // add floor
  return Math.max(FLOOR, Math.min(1, p));   // clamp numeric noise
}

// ----- State -----
let round = 0;
let yourTotal = 0;
let oppTotal = 0;

// ----- DOM refs (filled in init) -----
let offerPctInput, btnPlay, btnAuto5, btnAuto20, btnReset, resultP, scoreP, historyBody;

// ----- Utils -----
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const fmt2  = (x) => Number(x).toLocaleString(undefined, { maximumFractionDigits: 2 });
const toPct = (v) => `${(v * 100).toFixed(0)}%`;

function readOfferFrac() {
  const raw = Number(offerPctInput.value);
  const pct = Number.isFinite(raw) ? clamp(raw, 0, 100) : 50;
  offerPctInput.value = pct;
  return pct / 100;
}

function resetGame() {
  round = 0; yourTotal = 0; oppTotal = 0;
  resultP.textContent = '';
  scoreP.textContent  = 'Your total: 0 · Opponent total: 0';
  historyBody.innerHTML = '';
}

function playOneRound() {
  const offer = readOfferFrac();        // 0..1
  const p = acceptanceProb(offer);
  const accepted = Math.random() < p;

  const you = accepted ? (1 - offer) * ENDOW : 0;
  const opp = accepted ? offer * ENDOW : 0;

  round += 1;
  yourTotal += you;
  oppTotal += opp;

  resultP.textContent =
    `Round ${round}: You offered ${toPct(offer)} — ${accepted ? 'ACCEPTED' : 'REJECTED'}. ` +
    `Payoffs → You: ${fmt2(you)}, Opp: ${fmt2(opp)}.`;
  scoreP.textContent = `Your total: ${fmt2(yourTotal)} · Opponent total: ${fmt2(oppTotal)}`;

  const tr = document.createElement('tr');
  tr.innerHTML = [
    `<td>${round}</td>`,
    `<td>${toPct(offer)}</td>`,
    `<td>${accepted ? 'Accepted' : 'Rejected'}</td>`,
    `<td>${fmt2(you)}</td>`,
    `<td>${fmt2(opp)}</td>`,
    `<td>${fmt2(yourTotal)}</td>`,
    `<td>${fmt2(oppTotal)}</td>`
  ].join('');
  historyBody.prepend(tr);
  while (historyBody.children.length > 100) historyBody.removeChild(historyBody.lastChild);
}

function auto(n) {
  for (let i = 0; i < n; i++) playOneRound();
}

// ----- Init after DOM is ready (prevents null addEventListener) -----
function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id} in index.html`);
  return el;
}

function init() {
  offerPctInput = $('offerPct');
  btnPlay       = $('btnPlay');
  btnAuto5      = $('btnAuto5');
  btnAuto20     = $('btnAuto20');
  btnReset      = $('btnReset');
  resultP       = $('result');
  scoreP        = $('score');
  historyBody   = $('historyBody');

  btnPlay.addEventListener('click', playOneRound);
  btnAuto5.addEventListener('click', () => auto(5));
  btnAuto20.addEventListener('click', () => auto(20));
  btnReset.addEventListener('click', resetGame);
}

document.addEventListener('DOMContentLoaded', init);
