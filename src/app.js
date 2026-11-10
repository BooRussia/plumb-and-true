/* ================= app: interface and main loop ================= */
const svg = d => `<svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICONS = {
  start: svg('<rect x="3" y="11" width="26" height="10" rx="1.5"/><rect x="12" y="13.5" width="8" height="5"/><circle cx="16" cy="16" r="1.4" fill="currentColor"/><path d="M7 14v4M25 14v4"/>'),
  swing: svg('<path d="M2 23h6M24 23h6" stroke-width="3.2"/><path d="M8 23V7"/><path d="M8 7a16 16 0 0 1 16 16" stroke-dasharray="2 2.4"/>'),
  entryIn: svg('<path d="M2 20h6M24 20h6" stroke-width="3.2"/><path d="M8 20V4"/><path d="M8 4a16 16 0 0 1 16 16" stroke-dasharray="2 2.4"/><path d="M6 25h20M6 28h20"/>'),
  entryOut: svg('<path d="M2 12h6M24 12h6" stroke-width="3.2"/><path d="M8 12v16"/><path d="M8 28a16 16 0 0 0 16-16" stroke-dasharray="2 2.4"/><path d="M6 7h20M6 4h20"/>'),
  double: svg('<path d="M1 23h5M26 23h5" stroke-width="3.2"/><path d="M6 23V13M26 23V13"/><path d="M6 13a10 10 0 0 1 10 10M26 13a10 10 0 0 0-10 10" stroke-dasharray="2 2.4"/>'),
  slab: svg('<rect x="9" y="3" width="14" height="26"/><path d="M9 8H6.5M9 16H6.5M9 24H6.5"/><circle cx="20" cy="17" r="1" fill="currentColor"/>'),
  patio: svg('<path d="M3 11v10M29 11v10" stroke-width="3.2"/><path d="M4 14h14M14 18h14"/><path d="M24 25h-9m3-2.5-3 2.5 3 2.5"/>'),
  bypass: svg('<path d="M3 12v8M29 12v8" stroke-width="3.2"/><path d="M4 14.5h15M13 17.5h15"/><path d="M7 8h8m-3-2.5 3 2.5-3 2.5M25 25h-8m3-2.5-3 2.5 3 2.5"/>'),
  pocket: svg('<rect x="2" y="12.5" width="13" height="7" stroke-dasharray="2 2"/><path d="M29 12v8" stroke-width="3.2"/><path d="M9 16h14"/><path d="M24 25h-9m3-2.5-3 2.5 3 2.5"/>'),
  barn: svg('<path d="M2 21h8M22 21h8" stroke-width="3.2"/><path d="M8 16h16"/><path d="M12 9h10m-3-2.5 3 2.5-3 2.5"/>'),
  bifold: svg('<path d="M1 23h4M27 23h4" stroke-width="3.2"/><path d="M5 23l5.5-10 5.5 10M16 23l5.5-10 5.5 10"/>')
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const A = { def: null, model: null, P: null, root: null, tab: 'overview', step: 0, prob: -1, fixed: false, mirrored: false, xray: false, xr: 1, S: {}, T: {}, tw: new Set(), hold: false, hl: new Set(), labels: [], binds: [], readEl: null, readHtml: '', quiz: {}, time: 0, snap: true, anat: null };
const el = { doors: $('#doors'), tabs: $('#tabs'), pane: $('#pane'), tape: $('#tape'), labels: $('#labels'), tip: $('#tip'), views: $('#viewBtns'), pose: $('#poseBox'), name: $('#sheetName'), size: $('#sheetSize') };

/* ---------- state ---------- */
function setPose(target, instant) {
  const full = Object.assign({}, A.model.defaults, target || {});
  for (const k in full) {
    if (Math.abs((A.S[k] ?? 0) - full[k]) < 1e-6) { A.tw.delete(k); continue; }
    if (instant || RM) { A.S[k] = A.T[k] = full[k]; A.tw.delete(k); } else { A.T[k] = full[k]; A.tw.add(k); }
  }
}
const api = { get S() { return A.S; }, set(o) { for (const k in o) { A.T[k] = o[k]; A.tw.add(k); } } };
function fmt(k, v) {
  const p = A.model.params[k], u = p[4];
  if (u === 'in') return Math.abs(v) < 1 / 128 ? '0″' : frac(v);
  if (u === '°') return Math.round(v) + '°';
  return Math.round((v - p[1]) / (p[2] - p[1]) * 100) + '%';
}
function viewCam() {
  if (A.tab === 'install') return A.def.steps[A.step].cam || A.def.home;
  if (A.tab === 'fix' && A.prob >= 0) return A.def.problems[A.prob].cam || A.def.home;
  return A.def.home;
}
function setLabels(list) {
  el.labels.innerHTML = '';
  A.labels = (list || []).map(([name, text]) => {
    const p = A.P.map.get(name); if (!p) return null;
    const d = document.createElement('div'); d.className = 'lab'; d.textContent = text || p.label; el.labels.appendChild(d);
    return { p, d, w: d.offsetWidth, v: { x: 0, y: 0 } };
  }).filter(Boolean);
}
function refreshScene() {
  A.hl.clear(); let labels = [];
  if (A.tab === 'install') {
    const s = A.def.steps[A.step];
    if (A.step > 0) for (const p of A.P.list) if (p.step === A.step && !p.xray && !p.when) A.hl.add(p.name);
    labels = s.labels || []; labels.forEach(l => A.hl.add(l[0]));
    setPose(s.pose);
  } else if (A.tab === 'fix' && A.prob >= 0) {
    const pr = A.def.problems[A.prob];
    (pr.hl || []).forEach(n => A.hl.add(n)); labels = (pr.hl || []).map(n => [n]);
    setPose(A.fixed ? Object.assign({}, pr.set, pr.fixSet) : pr.set);
  } else setPose({});
  if (A.anat) { A.hl.add(A.anat); labels = [[A.anat]]; }
  setLabels(labels);
  Stage.to(viewCam());
}

/* ---------- controls shared by steps and problems ---------- */
function benchHTML(ids, title, extra) {
  const rows = ids.map(k => {
    const p = A.model.params[k];
    if (p[4] === '' && p[3] === 1) return `<label class="sw"><input type="checkbox" id="c-${k}" data-k="${k}"><span>${esc(p[0])}</span></label>`;
    return `<div class="sl"><label for="c-${k}">${esc(p[0])}</label><output id="o-${k}"></output><input type="range" id="c-${k}" data-k="${k}" min="${p[1]}" max="${p[2]}" step="${p[3]}"></div>`;
  }).join('');
  return `<div class="bench"><p class="bench-h">${title}</p>${rows}${extra || ''}<div class="reads" id="reads"></div></div>`;
}
function bindBench(root) {
  A.binds = $$('[data-k]', root).map(inp => {
    const k = inp.dataset.k, out = $('#o-' + k, root), b = { k, inp, out, drag: false };
    if (inp.type === 'checkbox') inp.addEventListener('change', () => { A.S[k] = A.T[k] = inp.checked ? 1 : 0; A.tw.delete(k); });
    else {
      inp.addEventListener('input', () => { A.S[k] = A.T[k] = +inp.value; A.tw.delete(k); if (k === A.model.pose) A.hold = true; });
      inp.addEventListener('pointerdown', () => { b.drag = true; });
      const end = () => { b.drag = false; A.hold = false; };
      inp.addEventListener('pointerup', end); inp.addEventListener('pointercancel', end); inp.addEventListener('change', end); inp.addEventListener('blur', end);
    }
    return b;
  });
  A.readEl = $('#reads', root); A.readHtml = '';
}
function syncUI(reads) {
  for (const b of A.binds) {
    const v = A.S[b.k];
    if (b.inp.type === 'checkbox') { const c = v > 0.5; if (b.inp.checked !== c) b.inp.checked = c; }
    else { if (!b.drag && Math.abs(+b.inp.value - v) > 1e-4) b.inp.value = v; const t = fmt(b.k, v); if (b.out && b.out.textContent !== t) b.out.textContent = t; }
  }
  if (A.readEl && reads) {
    const html = reads.map(r => `<div class="rd ${r[2]}"><span>${esc(r[0])}</span><b>${esc(r[1])}</b></div>`).join('');
    if (html !== A.readHtml) { A.readEl.innerHTML = html; A.readHtml = html; }
  }
}

/* ---------- panes ---------- */
const para = b => (Array.isArray(b) ? b : [b]).filter(Boolean).map(t => `<p>${t}</p>`).join('');
const callout = (kind, label, t) => t ? `<div class="co ${kind}"><span>${label}</span><p>${t}</p></div>` : '';
function renderOverview() {
  const d = A.def, anat = A.P.list.filter(p => p.anat);
  let h = `<h2>${esc(d.name)}</h2><p class="lede">${d.blurb}</p><dl class="facts">${d.facts.map(f => `<div><dt>${f[0]}</dt><dd>${f[1]}</dd></div>`).join('')}</dl>`;
  h += `<div class="cta"><button class="btn" data-go="install">${d.tabs && d.tabs.install ? 'Read the five rules' : 'Start the install'}</button>${d.problems.length ? '<button class="btn ghost" data-go="fix">Fix a problem</button>' : ''}<button class="btn ghost" data-go="myths">Test yourself</button></div>`;
  if (d.ro) h += `<section class="box"><h3>${d.ro.title}</h3><div class="ro"><label for="ro-pick">${d.ro.pick}</label><select id="ro-pick">${d.ro.sizes.map(s => `<option value="${s}"${s === d.ro.pickd ? ' selected' : ''}>${frac(s)}</option>`).join('')}</select><div class="ro-out" id="ro-out"></div></div><p class="note">${d.ro.note}</p></section>`;
  if (d.extra) h += d.extra;
  if (d.tools) h += `<h3>Tools and materials</h3><ul class="tools">${d.tools.map((t, i) => `<li><label><input type="checkbox" id="tool-${d.id}-${i}"><span>${t}</span></label></li>`).join('')}</ul>`;
  h += `<h3>Anatomy <button class="chip" id="xr2" aria-pressed="${A.xray}">X-ray the wall</button></h3><p class="note">Point at a part here or on the model.</p><ul class="anat">${anat.map(p => `<li><button data-part="${p.name}"><b>${esc(p.label)}</b><span>${esc(p.desc)}</span></button></li>`).join('')}</ul>`;
  el.pane.innerHTML = h;
  if (d.ro) { const pick = $('#ro-pick'), out = $('#ro-out'), upd = () => { out.innerHTML = d.ro.out(+pick.value).map(r => `<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join(''); }; pick.addEventListener('change', upd); upd(); }
  $$('.anat button').forEach(b => {
    const on = () => { A.anat = b.dataset.part; A.hl.clear(); A.hl.add(A.anat); setLabels([[A.anat]]); }, off = () => { if (A.anat === b.dataset.part) { A.anat = null; A.hl.clear(); setLabels([]); } };
    b.addEventListener('pointerenter', on); b.addEventListener('focus', on); b.addEventListener('pointerleave', off); b.addEventListener('blur', off);
  });
  $('#xr2').addEventListener('click', () => setXray(!A.xray));
  $$('[data-go]').forEach(b => b.addEventListener('click', () => setTab(b.dataset.go)));
}
function renderInstall() {
  const d = A.def, s = d.steps[A.step], n = d.steps.length;
  let h = `<p class="eyebrow">${d.tabs && d.tabs.install ? 'Rule' : 'Step'} ${A.step + 1} of ${n}</p><h2 class="st">${s.t}</h2>${para(s.b)}`;
  if (s.try) h += benchHTML(s.try.controls, 'Try it on the model', '<button class="btn small" id="doit">Set it for me</button>');
  h += callout('tip', 'Pro tip', s.tip) + callout('warn', 'Watch out', s.warn) + callout('ok', 'Check', s.check);
  h += `<div class="nav"><button class="btn ghost" id="prev"${A.step ? '' : ' disabled'}>Back</button><button class="btn" id="next">${A.step < n - 1 ? 'Next: ' + d.steps[A.step + 1].t : d.problems.length ? 'Done. See common problems' : 'Done. Test yourself'}</button></div>`;
  el.pane.innerHTML = h; el.pane.scrollTop = 0;
  bindBench(el.pane);
  if (s.try) $('#doit').addEventListener('click', () => setPose(Object.assign({}, s.pose, s.try.goal)));
  $('#prev').addEventListener('click', () => setStep(A.step - 1));
  $('#next').addEventListener('click', () => A.step < n - 1 ? setStep(A.step + 1) : setTab(d.problems.length ? 'fix' : 'myths'));
  $$('button', el.tape).forEach(b => { if (b.dataset.i != null) { const i = +b.dataset.i; b.classList.toggle('on', i === A.step); b.classList.toggle('done', i < A.step); b.setAttribute('aria-current', i === A.step ? 'step' : 'false'); } });
}
function renderFix() {
  const d = A.def;
  let h = `<h2>What is it doing?</h2><p class="lede">Pick the symptom. The model reproduces the fault, then you can apply the fix or work the adjustment yourself and watch the readings.</p><div class="probs">`;
  d.problems.forEach((p, i) => {
    const open = i === A.prob;
    h += `<article class="prob${open ? ' open' : ''}"><button class="prob-h" data-p="${i}" aria-expanded="${open}"><span>${p.t}</span><i aria-hidden="true">${open ? '−' : '+'}</i></button>`;
    if (open) {
      h += `<div class="prob-b"><p class="kv"><b>What you see</b>${p.see}</p><p class="kv"><b>What is wrong</b>${p.cause}</p>`;
      if (p.set) h += `<div class="seg" role="group" aria-label="Model state"><button id="showFault" aria-pressed="${!A.fixed}">Show the fault</button><button id="showFix" aria-pressed="${A.fixed}">Apply the fix</button></div>` + benchHTML(p.controls || [], 'Adjust it yourself');
      h += `<p class="kv"><b>The fix</b></p><ol class="fix">${p.fix.map(f => `<li>${f}</li>`).join('')}</ol></div>`;
    }
    h += `</article>`;
  });
  el.pane.innerHTML = h + '</div>';
  bindBench(el.pane);
  $$('.prob-h').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.p; A.prob = A.prob === i ? -1 : i; A.fixed = false; renderFix(); refreshScene(); const o = $('.prob.open'); if (o && o.scrollIntoView) o.scrollIntoView({ block: 'nearest' }); }));
  const sf = $('#showFault'), sx = $('#showFix');
  const flip = f => { A.fixed = f; sf.setAttribute('aria-pressed', !f); sx.setAttribute('aria-pressed', f); const pr = d.problems[A.prob]; setPose(f ? Object.assign({}, pr.set, pr.fixSet) : pr.set); };
  if (sf) { sf.addEventListener('click', () => flip(false)); sx.addEventListener('click', () => flip(true)); }
}
const VERD = { myth: 'Myth', partly: 'Partly true', true: 'True' };
function renderMyths() {
  const d = A.def, q = A.quiz[d.id] || (A.quiz[d.id] = {}), done = Object.values(q).filter(v => v !== 'shown').length, right = d.myths.filter((m, i) => q[i] === m.v).length;
  let h = `<h2>Myth or true?</h2><p class="lede">Call each one before you read the answer.</p><p class="score"><b>${right}</b> right of ${done} answered <span>${d.myths.length} statements</span></p><div class="myths">`;
  d.myths.forEach((m, i) => {
    const a = q[i];
    h += `<article class="myth${a ? ' ans' : ''}"><p class="claim">${m.c}</p>`;
    if (!a) h += `<div class="pick">${Object.keys(VERD).map(v => `<button data-m="${i}" data-v="${v}">${VERD[v]}</button>`).join('')}</div>`;
    else h += `<div class="verdict"><span class="stamp ${m.v}">${VERD[m.v]}</span>${a === 'shown' ? '' : `<span class="you ${a === m.v ? 'ok' : 'bad'}">${a === m.v ? 'You called it' : 'You said ' + VERD[a].toLowerCase()}</span>`}</div><p>${m.w}</p>`;
    h += `</article>`;
  });
  el.pane.innerHTML = h + `</div><div class="nav"><button class="btn ghost" id="reveal">Reveal all</button><button class="btn ghost" id="again">Start over</button></div>`;
  $$('[data-m]').forEach(b => b.addEventListener('click', () => { q[+b.dataset.m] = b.dataset.v; const y = el.pane.scrollTop; renderMyths(); el.pane.scrollTop = y; }));
  $('#reveal').addEventListener('click', () => { d.myths.forEach((m, i) => { if (!q[i]) q[i] = 'shown'; }); renderMyths(); });
  $('#again').addEventListener('click', () => { A.quiz[d.id] = {}; renderMyths(); });
}
function renderPane() { A.binds = []; A.readEl = null; ({ overview: renderOverview, install: renderInstall, fix: renderFix, myths: renderMyths })[A.tab](); }

/* ---------- navigation ---------- */
function setXray(on) { A.xray = on; $$('#xr, #xr2').forEach(b => b.setAttribute('aria-pressed', on)); }
function renderTabs() {
  const d = A.def, names = { overview: 'Overview', install: (d.tabs && d.tabs.install) || 'Install', fix: 'Troubleshoot', myths: 'Myths' };
  el.tabs.innerHTML = Object.keys(names).filter(k => k !== 'fix' || d.problems.length).map(k => `<button role="tab" id="tab-${k}" aria-selected="${k === A.tab}" data-tab="${k}">${names[k]}</button>`).join('');
  $$('button', el.tabs).forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
}
function setTab(tab) {
  A.tab = tab; A.anat = null;
  setXray(tab === 'install' || tab === 'fix');
  renderTabs();
  el.tape.hidden = tab !== 'install';
  if (tab === 'install') buildTape();
  renderPane(); refreshScene(); el.pane.scrollTop = 0;
}
function setStep(i) { A.step = clamp(i, 0, A.def.steps.length - 1); renderInstall(); refreshScene(); }
function buildTape() {
  const n = A.def.steps.length;
  el.tape.innerHTML = `<button class="tp-end" id="tp-prev" aria-label="Previous step">‹</button><div class="blade"><i class="hook" aria-hidden="true"></i>${A.def.steps.map((s, i) => `<button data-i="${i}" title="${esc(s.t)}"><b>${i + 1}</b></button>`).join('')}</div><button class="tp-end" id="tp-next" aria-label="Next step">›</button>`;
  $$('.blade button', el.tape).forEach(b => b.addEventListener('click', () => setStep(+b.dataset.i)));
  $('#tp-prev').addEventListener('click', () => setStep(A.step - 1));
  $('#tp-next').addEventListener('click', () => setStep(Math.min(n - 1, A.step + 1)));
}
function renderStageUI() {
  const d = A.def, sd = d.sides || ['Front', 'Back'], pk = A.model.pose, pp = A.model.params[pk];
  el.name.textContent = d.name; el.size.textContent = d.size;
  el.views.innerHTML = (d.handing ? `<button id="hand" title="Flip the model to the other hand">${d.handing[A.mirrored ? 1 : 0]} ⇄</button>` : '') +
    `<button id="xr" aria-pressed="${A.xray}">X-ray</button><button data-v="f">${sd[0]}</button><button data-v="b">${sd[1]}</button><button data-v="p">Plan</button><button data-v="r" title="Back to this step’s view">Reset</button>`;
  el.pose.innerHTML = `<label for="pose">${pp[0]}</label><input type="range" id="pose" min="${pp[1]}" max="${pp[2]}" step="${pp[3]}" value="${A.S[pk]}">`;
  const pose = $('#pose');
  pose.addEventListener('input', () => { A.S[pk] = A.T[pk] = +pose.value; A.tw.delete(pk); A.hold = true; });
  ['pointerup', 'pointercancel', 'change', 'blur'].forEach(e => pose.addEventListener(e, () => { A.hold = false; }));
  $('#xr').addEventListener('click', () => setXray(!A.xray));
  const hb = $('#hand');
  if (hb) hb.addEventListener('click', () => { A.mirrored = !A.mirrored; A.root.scale.x = A.mirrored ? -1 : 1; Stage.setMirror(A.mirrored); hb.textContent = d.handing[A.mirrored ? 1 : 0] + ' ⇄'; Stage.to(viewCam()); });
  $$('[data-v]', el.views).forEach(b => b.addEventListener('click', () => {
    const hm = d.home, v = b.dataset.v;
    Stage.to(v === 'r' ? viewCam() : v === 'p' ? [0, 86, hm[2] * 1.12, hm[3], hm[4], hm[5]] : [v === 'f' ? 22 : 158, 9, hm[2], hm[3], hm[4], hm[5]]);
  }));
}
function loadDoor(id, first) {
  const d = DOORS.find(x => x.id === id) || DOORS[0];
  if (A.P) A.P.dispose();
  A.def = d; A.root = new THREE.Group(); Stage.scene.add(A.root);
  A.mirrored = false; Stage.setMirror(false);
  A.P = new Parts(A.root); A.model = d.build(A.P);
  A.S = Object.assign({}, A.model.defaults); A.T = Object.assign({}, A.S); A.tw.clear();
  A.step = 0; A.prob = -1; A.fixed = false; A.snap = true; A.tab = 'overview'; A.anat = null;
  $$('button', el.doors).forEach(b => b.setAttribute('aria-current', b.dataset.id === d.id ? 'page' : 'false'));
  const cur = $('[aria-current="page"]', el.doors); if (cur && !first && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  renderStageUI(); setTab('overview');
  Stage.to(d.home, true);
  try { if (location.hash.slice(1) !== d.id) history.replaceState(null, '', '#' + d.id); } catch (e) { /* hash is a convenience only */ }
}
el.doors.innerHTML = DOORS.map(d => `<button data-id="${d.id}">${ICONS[d.icon]}<span><b>${d.short}</b><small>${d.size}</small></span></button>`).join('');
$$('button', el.doors).forEach(b => b.addEventListener('click', () => loadDoor(b.dataset.id)));
window.addEventListener('hashchange', () => { const id = location.hash.slice(1); if (id && id !== A.def.id && DOORS.some(d => d.id === id)) loadDoor(id); });
document.addEventListener('keydown', e => {
  if (A.tab !== 'install' || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
  if (e.key === 'ArrowRight') setStep(A.step + 1);
  if (e.key === 'ArrowLeft') setStep(A.step - 1);
});

/* ---------- stage interaction ---------- */
let tipTimer = 0;
function showTip(name, e) {
  const p = name && A.P.map.get(name);
  if (!p || !p.label) { el.tip.hidden = true; Stage.canvas.style.cursor = ''; return; }
  el.tip.innerHTML = `<b>${esc(p.label)}</b>${p.desc ? `<span>${esc(p.desc)}</span>` : ''}`;
  el.tip.hidden = false;
  const r = Stage.wrap.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  el.tip.style.left = clamp(x + 14, 8, r.width - el.tip.offsetWidth - 8) + 'px';
  el.tip.style.top = clamp(y + 16, 8, r.height - el.tip.offsetHeight - 8) + 'px';
  Stage.canvas.style.cursor = 'pointer';
}
Stage.cb.hover = e => { if (!e) { el.tip.hidden = true; return; } showTip(Stage.pick(e, A.root), e); };
Stage.cb.click = e => {
  const name = Stage.pick(e, A.root); if (!name) return;
  if (A.model.click) A.model.click(name, api);
  if (e.pointerType !== 'mouse') { showTip(name, e); clearTimeout(tipTimer); tipTimer = setTimeout(() => { el.tip.hidden = true; }, 2600); }
};

/* ---------- main loop ---------- */
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; A.time += dt;
  for (const k of A.tw) {
    const d = A.T[k] - A.S[k];
    if (Math.abs(d) < (k === 'swing' ? 0.05 : 0.0012)) { A.S[k] = A.T[k]; A.tw.delete(k); } else A.S[k] += d * (1 - Math.exp(-dt * 5));
  }
  A.xr += ((A.xray ? 0.1 : 1) - A.xr) * (RM ? 1 : 1 - Math.exp(-dt * 7));
  const mode = A.tab === 'install' ? 'install' : A.tab === 'fix' ? 'fix' : 'view';
  A.P.tick(dt, { S: A.S, mode, k: A.step, xr: A.xr, hl: A.hl, pulse: 0.3 + 0.22 * Math.sin(A.time * 4.2), snap: A.snap });
  A.snap = false;
  const reads = A.model.update(A.S, dt, { tw: A.tw, hold: A.hold });
  syncUI(reads);
  const pose = $('#pose'); if (pose && !A.hold && Math.abs(+pose.value - A.S[A.model.pose]) > 1e-3) pose.value = A.S[A.model.pose];
  A.root.updateMatrixWorld(true);
  const placed = [];
  for (const l of A.labels) {
    const ok = l.p.obj.visible && l.p.t > 0.5 && Stage.project(l.p.obj, l.v);
    l.d.style.opacity = ok ? 1 : 0;
    if (!ok) continue;
    let y = l.v.y;
    for (const q of placed) if (Math.abs(q.x - l.v.x) < 190 && Math.abs(q.y - y) < 27) y = q.y + 28;
    placed.push({ x: l.v.x, y });
    const flip = l.v.x + l.w + 16 > Stage.wrap.clientWidth;
    l.d.classList.toggle('flip', flip);
    l.d.style.transform = `translate(${Math.round(Math.max(-4, flip ? l.v.x - l.w - 20 : l.v.x))}px, ${Math.round(clamp(y, 34, Stage.wrap.clientHeight - 8))}px)`;
  }
  Stage.frame(dt);
  requestAnimationFrame(loop);
}
loadDoor(location.hash.slice(1) || 'basics', true);
requestAnimationFrame(loop);
