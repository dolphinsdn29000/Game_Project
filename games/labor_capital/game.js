(() => {
  'use strict';

  // -------- Defaults (pre-set; shown only if user opens "Advanced") --------
  const DEFAULTS = {
    startWL: 100,      // Starting wealth: Labor
    startWC: 100,      // Starting wealth: Capital
    A: 2.0,            // Productivity
    alpha: 0.5,        // Labor share in technology
    capitalInvestPct: 50, // Capital invests 50% of its wealth each round by default
    laborInvestPct: 50,   // Initial slider position only
    laborSharePct: 50     // Initial slider position only
  };

  // -------- State --------
  let round = 0;
  let WL = DEFAULTS.startWL;
  let WC = DEFAULTS.startWC;

  let A = DEFAULTS.A;
  let alpha = DEFAULTS.alpha;
  let capitalInvestPct = DEFAULTS.capitalInvestPct;

  // Keep track of the "current" starting values so Reset uses the last applied starts.
  let startWL_current = DEFAULTS.startWL;
  let startWC_current = DEFAULTS.startWC;

  // -------- DOM helpers --------
  const el = (id) => document.getElementById(id);
  const roundEl = el('round');
  const lastYEl = el('lastY');
  const wlEl = el('wl');
  const wcEl = el('wc');

  const laborInvestRange = el('laborInvestPct');
  const laborShareRange  = el('laborSharePct');
  const laborInvestVal   = el('laborInvestPctVal');
  const laborShareVal    = el('laborSharePctVal');

  const btnPlay1  = el('play1');
  const btnAuto10 = el('auto10');
  const btnReset  = el('reset');
  const historyUL = el('history');

  // Advanced controls
  const startWLEl = el('startWL');
  const startWCEl = el('startWC');
  const AEl       = el('A');
  const alphaEl   = el('alpha');
  const capInvEl  = el('capitalInvestPct');
  const applyBtn  = el('applyAndReset');

  // -------- Utils --------
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const numOr = (v, d) => (Number.isFinite(v) ? v : d);
  const fmt = (x) => Number(x).toLocaleString(undefined, { maximumFractionDigits: 2 });

  function syncStatus(y = null) {
    roundEl.textContent = String(round);
    lastYEl.textContent = y == null ? '—' : fmt(y);
    wlEl.textContent = fmt(WL);
    wcEl.textContent = fmt(WC);
  }

  function pushHistory({ r, lPct, sPct, y, wl, wc }) {
    const li = document.createElement('li');
    li.textContent =
      `#${r} — L invest ${Math.round(lPct)}%, split ${Math.round(sPct)}%/` +
      `${100 - Math.round(sPct)}% → Y ${fmt(y)} | WL ${fmt(wl)} | WC ${fmt(wc)}`;
    historyUL.prepend(li);
    // keep last 10
    while (historyUL.children.length > 10) historyUL.removeChild(historyUL.lastChild);
  }

  function resetTo(startW, startC) {
    round = 0;
    WL = clamp(numOr(startW, DEFAULTS.startWL), 0, 1e12);
    WC = clamp(numOr(startC, DEFAULTS.startWC), 0, 1e12);
    historyUL.innerHTML = '';
    syncStatus();
  }

  // Single round of play (mechanics)
  function playOneRound() {
    // Read UI strategies
    const lPct = clamp(Number(laborInvestRange.value) || 0, 0, 100); // Labor invest %
    const sPct = clamp(Number(laborShareRange.value)  || 0, 0, 100); // Labor share of Y
    const kPct = clamp(Number(capitalInvestPct)       || 0, 0, 100); // Capital invest %

    // Starting wealth this round
    const WL0 = WL, WC0 = WC;

    // Investments
    const L = WL0 * (lPct / 100);
    const K = WC0 * (kPct / 100);

    // Cobb–Douglas output
    // Ensure alpha is in (0,1) to avoid degenerate cases
    const a = clamp(Number(alpha), 0.001, 0.999);
    const Y = Number(A) * Math.pow(L, a) * Math.pow(K, 1 - a);

    // Split (Capital always accepts in this version)
    const payL = (sPct / 100) * Y;
    const payC = Y - payL;

    // Next-round wealth = kept cash + share of output
    WL = (WL0 - L) + payL;
    WC = (WC0 - K) + payC;

    round += 1;
    syncStatus(Y);
    pushHistory({ r: round, lPct, sPct, y: Y, wl: WL, wc: WC });
  }

  function auto(n) {
    for (let i = 0; i < n; i++) playOneRound();
  }

  // -------- Events --------
  laborInvestRange.addEventListener('input', () => {
    laborInvestVal.textContent = `${laborInvestRange.value}%`;
  });
  laborShareRange.addEventListener('input', () => {
    laborShareVal.textContent = `${laborShareRange.value}%`;
  });

  btnPlay1.addEventListener('click', playOneRound);
  btnAuto10.addEventListener('click', () => auto(10));
  btnReset.addEventListener('click', () => resetTo(startWL_current, startWC_current));

  applyBtn.addEventListener('click', () => {
    // Read advanced inputs
    const sWL = Number(startWLEl.value);
    const sWC = Number(startWCEl.value);
    const Anew = Number(AEl.value);
    const anew = Number(alphaEl.value);
    const knew = Number(capInvEl.value);

    // Apply with clamps
    startWL_current = clamp(numOr(sWL, DEFAULTS.startWL), 0, 1e12);
    startWC_current = clamp(numOr(sWC, DEFAULTS.startWC), 0, 1e12);
    A = clamp(numOr(Anew, DEFAULTS.A), 0, 1e9);
    alpha = clamp(numOr(anew, DEFAULTS.alpha), 0.001, 0.999);
    capitalInvestPct = clamp(numOr(knew, DEFAULTS.capitalInvestPct), 0, 100);

    // Reset state to the new starts
    resetTo(startWL_current, startWC_current);
  });

  // -------- Init (preset UI + status) --------
  laborInvestRange.value = String(DEFAULTS.laborInvestPct);
  laborShareRange.value  = String(DEFAULTS.laborSharePct);
  laborInvestVal.textContent = `${DEFAULTS.laborInvestPct}%`;
  laborShareVal.textContent  = `${DEFAULTS.laborSharePct}%`;

  startWLEl.value = DEFAULTS.startWL;
  startWCEl.value = DEFAULTS.startWC;
  AEl.value       = DEFAULTS.A;
  alphaEl.value   = DEFAULTS.alpha;
  capInvEl.value  = DEFAULTS.capitalInvestPct;

  syncStatus();
})();
