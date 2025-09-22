'use strict';

// ---------- State ----------
let round = 0;
let WL = 100; // Labor wealth
let WC = 100; // Capital wealth

// Parameters (Cobb–Douglas)
let A = 2.0;
let alpha = 0.5;

// ---------- DOM refs ----------
const startLaborInput   = document.getElementById('startLabor');
const startCapitalInput = document.getElementById('startCapital');
const AInput            = document.getElementById('A');
const alphaInput        = document.getElementById('alpha');
const applyParamsBtn    = document.getElementById('applyParams');

const laborInvestPctInput   = document.getElementById('laborInvestPct');
const capitalInvestPctInput = document.getElementById('capitalInvestPct');
const laborSharePctInput    = document.getElementById('laborSharePct');

const btnPlay   = document.getElementById('btnPlay');
const btnAuto5  = document.getElementById('btnAuto5');
const btnAuto20 = document.getElementById('btnAuto20');
const btnReset  = document.getElementById('btnReset');

const roundSpan   = document.getElementById('round');
const lastYSpan   = document.getElementById('lastY');
const WLSpan      = document.getElementById('laborWealth');
const WCSpan      = document.getElementById('capitalWealth');
const lastSummary = document.getElementById('lastSummary');
const historyBody = document.getElementById('historyBody');

// ---------- Utilities ----------
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const num = (el, fallback = 0) => {
  const v = Number(el.value);
  return Number.isFinite(v) ? v : fallback;
};
const fmt = (x) => Number(x).toLocaleString(undefined, { maximumFractionDigits: 2 });

function syncStatus(lastY = null, detailText = '') {
  roundSpan.textContent = String(round);
  WLSpan.textContent = fmt(WL);
  WCSpan.textContent = fmt(WC);
  lastYSpan.textContent = lastY == null ? '—' : fmt(lastY);
  lastSummary.textContent = detailText;
}

function resetToParams() {
  WL = clamp(num(startLaborInput, 100),   0, 1e9);
  WC = clamp(num(startCapitalInput, 100), 0, 1e9);
  A = clamp(num(AInput, 2), 0, 1e6);
  alpha = clamp(num(alphaInput, 0.5), 0.001, 0.999);
  round = 0;
  historyBody.innerHTML = '';
  syncStatus();
}

function resetWealthOnly() {
  WL = clamp(num(startLaborInput, 100),   0, 1e9);
  WC = clamp(num(startCapitalInput, 100), 0, 1e9);
  round = 0;
  historyBody.innerHTML = '';
  syncStatus();
}

function playOneRound() {
  // Read strategies
  const lPct = clamp(num(laborInvestPctInput, 50),   0, 100) / 100;   // Labor invest fraction
  const kPct = clamp(num(capitalInvestPctInput, 50), 0, 100) / 100;   // Capital invest fraction
  const sPct = clamp(num(laborSharePctInput, 50),    0, 100) / 100;   // Labor share of Y

  // Starting wealth this round
  const WL0 = WL;
  const WC0 = WC;

  // Investments
  const L = WL0 * lPct;
  const K = WC0 * kPct;

  // Cobb–Douglas output
  const Y = A * Math.pow(L, alpha) * Math.pow(K, 1 - alpha);

  // Split (Capital always accepts in v1)
  const payL = sPct * Y;
  const payC = (1 - sPct) * Y;

  // Next wealth = (kept cash) + share of output
  const WL1 = (WL0 - L) + payL;
  const WC1 = (WC0 - K) + payC;

  // Commit state
  round += 1;
  WL = WL1;
  WC = WC1;

  // Render
  const summary = `L invested ${fmt(L)}; C invested ${fmt(K)}; Y = ${fmt(Y)}; Labor took ${fmt(payL)} (${(sPct*100).toFixed(0)}%), Capital took ${fmt(payC)}.`;
  syncStatus(Y, summary);

  const tr = document.createElement('tr');
  tr.innerHTML = [
    `<td style="text-align:center">${round}</td>`,
    `<td style="text-align:center">${alpha.toFixed(2)}</td>`,
    `<td style="text-align:center">${fmt(A)}</td>`,
    `<td>${fmt(WL0)}</td>`,
    `<td>${fmt(WC0)}</td>`,
    `<td>${fmt(L)}</td>`,
    `<td>${fmt(K)}</td>`,
    `<td>${fmt(Y)}</td>`,
    `<td style="text-align:center">${(sPct*100).toFixed(0)}%</td>`,
    `<td>${fmt(payL)}</td>`,
    `<td>${fmt(payC)}</td>`,
    `<td>${fmt(WL1)}</td>`,
    `<td>${fmt(WC1)}</td>`
  ].join('');
  historyBody.prepend(tr);

  // Keep last 100 rows to avoid DOM bloat
  while (historyBody.children.length > 100) historyBody.removeChild(historyBody.lastChild);
}

function auto(n) {
  for (let i = 0; i < n; i++) playOneRound();
}

// ---------- Events ----------
applyParamsBtn.addEventListener('click', resetToParams);
btnReset.addEventListener('click', resetWealthOnly);
btnPlay.addEventListener('click', playOneRound);
btnAuto5.addEventListener('click', () => auto(5));
btnAuto20.addEventListener('click', () => auto(20));

// ---------- Init ----------
resetToParams();
