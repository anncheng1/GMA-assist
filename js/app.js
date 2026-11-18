/* GMA Assist — main application (analyse, assessment, records). */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ================= Tabs ================= */
$$('.tabs button').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
function showTab(name) {
  $$('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  $$('.tab').forEach(t => t.classList.toggle('active', t.id === 'tab-' + name));
  if (name === 'records') renderRecords();
  if (name === 'analyse') redrawChart();
  location.hash = name;
}
$('#appVersion').textContent = GMA.version;

/* ================= Session timer (45-min break reminder) ================= */
(() => {
  const start = Date.now(); const el = $('#sessionTimer'); let warned = false;
  setInterval(() => {
    const s = Math.floor((Date.now() - start) / 1000);
    el.textContent = '⏱ ' + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    if (s >= 45 * 60) { el.classList.add('alert'); if (!warned) { warned = true; toast('45 minutes of assessing — the manual recommends a break.'); } }
  }, 1000);
})();

/* ================= Video player ================= */
const video = $('#video');
const state = { roi: null, seqs: [], activeSeq: null, loop: false, analysis: null, metrics: null, fileName: '', frameDt: 1 / 30, show: { total: true, RA: false, LA: false, RL: false, LL: false } };

$('#videoInput').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  if (video.src) URL.revokeObjectURL(video.src);
  video.src = URL.createObjectURL(f);
  state.fileName = f.name; state.seqs = []; state.analysis = null; state.metrics = null; state.roi = null;
  $('#videoEmpty').hidden = true;
  renderSeqs(); renderMetrics(); drawRoi();
});
video.addEventListener('loadedmetadata', () => {
  $('#btnAnalyse').disabled = false;
  $('#videoHint').textContent = `${state.fileName} · ${video.videoWidth}×${video.videoHeight} · ${Motion.fmtT(video.duration)} — stays on this device.`;
  updateTime(); sizeRoiCanvas(); redrawChart();
  // estimate frame interval
  if ('requestVideoFrameCallback' in video) {
    let last = null, n = 0;
    const cb = (now, meta) => {
      if (last !== null && meta.mediaTime > last) { state.frameDt = Math.max(1 / 120, Math.min(1 / 10, meta.mediaTime - last)); n++; }
      last = meta.mediaTime; if (n < 3 && !video.paused) video.requestVideoFrameCallback(cb);
    };
    video.requestVideoFrameCallback(cb);
  }
});
video.addEventListener('timeupdate', () => {
  updateTime();
  if (state.loop && state.activeSeq != null) {
    const s = state.seqs[state.activeSeq];
    if (s && s.end && video.currentTime >= s.end) video.currentTime = s.start;
  }
});
video.addEventListener('play', () => $('#btnPlay').textContent = '❚❚ Pause');
video.addEventListener('pause', () => $('#btnPlay').textContent = '▶︎ Play');

function updateTime() {
  const d = video.duration || 0;
  $('#timeLabel').textContent = Motion.fmtT(video.currentTime) + ' / ' + Motion.fmtT(d);
  if (!seekDragging) $('#seek').value = d ? (video.currentTime / d * 1000) : 0;
  redrawChart(true);
}
let seekDragging = false;
$('#seek').addEventListener('input', e => { seekDragging = true; if (video.duration) video.currentTime = e.target.value / 1000 * video.duration; });
$('#seek').addEventListener('change', () => seekDragging = false);

const togglePlay = () => { if (!video.src) return; video.paused ? video.play() : video.pause(); };
const step = dt => { if (!video.src) return; video.pause(); video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + dt)); };
$('#btnPlay').onclick = togglePlay;
$('#btnBack').onclick = () => step(-state.frameDt);
$('#btnFwd').onclick = () => step(state.frameDt);
$('#btnBack5').onclick = () => step(-5);
$('#btnFwd5').onclick = () => step(5);
$('#speed').onchange = e => video.playbackRate = +e.target.value;
$('#mute').onchange = e => video.muted = e.target.checked;

document.addEventListener('keydown', e => {
  if (!$('#tab-analyse').classList.contains('active')) return;
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const k = e.key;
  if (k === ' ') { e.preventDefault(); togglePlay(); }
  else if (k === ',') step(-state.frameDt);
  else if (k === '.') step(state.frameDt);
  else if (k === 'ArrowLeft') step(-5);
  else if (k === 'ArrowRight') step(5);
  else if (k === '[') markIn();
  else if (k === ']') markOut();
  else if (k === 'l' || k === 'L') { state.loop = !state.loop; toast('Loop ' + (state.loop ? 'on' : 'off')); renderSeqs(); }
  else if (/^[1-6]$/.test(k)) { const v = ['0.25', '0.5', '1', '1.5', '2', '4'][+k - 1]; $('#speed').value = v; video.playbackRate = +v; }
});

/* ---------- GM sequences ---------- */
function markIn() {
  if (!video.src) return;
  state.seqs.push({ start: video.currentTime, end: null });
  state.activeSeq = state.seqs.length - 1; renderSeqs();
}
function markOut() {
  if (!video.src) return;
  let s = state.seqs[state.seqs.length - 1];
  if (!s || s.end != null) { toast('Mark the start first'); return; }
  if (video.currentTime <= s.start) { toast('End must be after start'); return; }
  s.end = video.currentTime; renderSeqs(); redrawChart();
}
$('#btnMarkIn').onclick = markIn; $('#btnMarkOut').onclick = markOut;
function renderSeqs() {
  const ul = $('#seqList'); ul.innerHTML = '';
  if (!state.seqs.length) { ul.innerHTML = '<li class="hint" style="cursor:default">No sequences marked yet.</li>'; return; }
  state.seqs.forEach((s, i) => {
    const li = document.createElement('li');
    li.className = i === state.activeSeq ? 'active' : '';
    const len = s.end != null ? (s.end - s.start).toFixed(1) + ' s' : 'open…';
    li.innerHTML = `<span><b>GM ${i + 1}</b> · ${Motion.fmtT(s.start)} → ${s.end != null ? Motion.fmtT(s.end) : '…'} (${len})</span>
      <button data-a="loop" title="Loop">${state.loop && i === state.activeSeq ? '⟳ on' : '⟳'}</button><button data-a="del" title="Delete">✕</button>`;
    li.onclick = ev => {
      const a = ev.target.dataset.a;
      if (a === 'del') { state.seqs.splice(i, 1); state.activeSeq = null; renderSeqs(); redrawChart(); return; }
      state.activeSeq = i; video.currentTime = s.start;
      if (a === 'loop') { state.loop = !(state.loop && state.activeSeq === i); if (state.loop) video.play(); }
      renderSeqs();
    };
    ul.appendChild(li);
  });
}
renderSeqs();

/* ---------- Region of interest ---------- */
const roiCanvas = $('#roiCanvas');
function videoRect() {
  // displayed video content box within wrapper (object-fit: contain)
  const W = roiCanvas.clientWidth, H = roiCanvas.clientHeight;
  const vw = video.videoWidth || 16, vh = video.videoHeight || 9;
  const s = Math.min(W / vw, H / vh);
  const w = vw * s, h = vh * s;
  return { x: (W - w) / 2, y: (H - h) / 2, w, h };
}
function sizeRoiCanvas() { roiCanvas.width = roiCanvas.clientWidth; roiCanvas.height = roiCanvas.clientHeight; drawRoi(); }
window.addEventListener('resize', () => { sizeRoiCanvas(); redrawChart(); });
function drawRoi(tmp) {
  const c = roiCanvas.getContext('2d'); c.clearRect(0, 0, roiCanvas.width, roiCanvas.height);
  const r = tmp || state.roi; if (!r || !video.videoWidth) return;
  const vr = videoRect();
  const x = vr.x + r.x * vr.w, y = vr.y + r.y * vr.h, w = r.w * vr.w, h = r.h * vr.h;
  c.fillStyle = 'rgba(0,0,0,.45)';
  c.fillRect(0, 0, roiCanvas.width, y); c.fillRect(0, y + h, roiCanvas.width, roiCanvas.height - y - h);
  c.fillRect(0, y, x, h); c.fillRect(x + w, y, roiCanvas.width - x - w, h);
  c.strokeStyle = '#e07a1f'; c.lineWidth = 2; c.strokeRect(x, y, w, h);
  c.setLineDash([4, 4]); c.strokeStyle = 'rgba(255,255,255,.6)'; c.beginPath();
  c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h / 2); c.lineTo(x + w, y + h / 2); c.stroke(); c.setLineDash([]);
  // quadrant labels
  const head = $('#headPos').value;
  const map = { top: ['RA', 'LA', 'RL', 'LL'], bottom: ['LL', 'RL', 'LA', 'RA'], left: ['LA', 'LL', 'RA', 'RL'], right: ['RL', 'RA', 'LL', 'LA'] }[head];
  c.font = 'bold 12px system-ui';
  [[x + 6, y + 16], [x + w / 2 + 6, y + 16], [x + 6, y + h / 2 + 16], [x + w / 2 + 6, y + h / 2 + 16]].forEach(([px, py], i) => {
    c.fillStyle = Motion.COLORS[map[i]]; c.fillText(Motion.LIMBS[map[i]], px, py);
  });
}
$('#headPos').onchange = () => { drawRoi(); };
let roiDrag = null;
$('#btnRoi').onclick = () => {
  if (!video.videoWidth) return toast('Load a video first');
  video.pause(); sizeRoiCanvas(); roiCanvas.classList.add('drawing'); toast('Drag a box around the infant');
};
$('#btnRoiClear').onclick = () => { state.roi = null; drawRoi(); };
function relPos(e) {
  const b = roiCanvas.getBoundingClientRect(), vr = videoRect();
  const p = e.touches ? e.touches[0] : e;
  return { x: Math.max(0, Math.min(1, (p.clientX - b.left - vr.x) / vr.w)), y: Math.max(0, Math.min(1, (p.clientY - b.top - vr.y) / vr.h)) };
}
roiCanvas.addEventListener('pointerdown', e => { if (!roiCanvas.classList.contains('drawing')) return; roiDrag = relPos(e); roiCanvas.setPointerCapture(e.pointerId); });
roiCanvas.addEventListener('pointermove', e => {
  if (!roiDrag) return; const p = relPos(e);
  drawRoi({ x: Math.min(roiDrag.x, p.x), y: Math.min(roiDrag.y, p.y), w: Math.abs(p.x - roiDrag.x), h: Math.abs(p.y - roiDrag.y) });
});
roiCanvas.addEventListener('pointerup', e => {
  if (!roiDrag) return; const p = relPos(e);
  const r = { x: Math.min(roiDrag.x, p.x), y: Math.min(roiDrag.y, p.y), w: Math.abs(p.x - roiDrag.x), h: Math.abs(p.y - roiDrag.y) };
  roiDrag = null; roiCanvas.classList.remove('drawing');
  state.roi = (r.w > 0.05 && r.h > 0.05) ? r : null; drawRoi();
});

/* ================= Motion analysis UI ================= */
let cancelAn = false, running = false;
$('#btnAnalyse').onclick = async () => {
  if (running) { cancelAn = true; return; }
  if (!video.videoWidth) return;
  let ranges = null;
  if ($('#anRange').value === 'seqs') {
    ranges = state.seqs.filter(s => s.end != null).map(s => [s.start, s.end]);
    if (!ranges.length) return toast('No complete sequences marked');
  }
  running = true; cancelAn = false;
  $('#btnAnalyse').textContent = 'Cancel';
  const pr = $('#anProgress'); pr.hidden = false;
  try {
    state.analysis = await Motion.analyse(video, {
      fps: +$('#sampleFps').value, roi: state.roi, head: $('#headPos').value, pxThr: +$('#pxThr').value, ranges,
      onProgress: f => { pr.firstElementChild.style.width = (f * 100) + '%'; pr.lastElementChild.textContent = Math.round(f * 100) + '%'; },
      isCancelled: () => cancelAn
    });
    computeMetrics();
    if (cancelAn) toast('Analysis cancelled — partial result shown');
  } catch (err) {
    console.error(err); toast('Analysis failed: ' + err.message);
  } finally {
    running = false; $('#btnAnalyse').textContent = 'Run analysis'; setTimeout(() => pr.hidden = true, 600);
  }
};
$('#actThr').oninput = () => { computeMetrics(); };
function computeMetrics() {
  state.metrics = state.analysis ? Motion.metrics(state.analysis, +$('#actThr').value) : null;
  $('#actThrVal').textContent = state.metrics ? state.metrics.thr.toFixed(2) + '% px' : '';
  renderMetrics(); redrawChart();
}
function renderLegend() {
  const items = [['total', 'Total (smoothed)'], ['RA', 'Right arm'], ['LA', 'Left arm'], ['RL', 'Right leg'], ['LL', 'Left leg']];
  $('#chartLegend').innerHTML = items.map(([k, l]) =>
    `<label><input type="checkbox" data-k="${k}" ${state.show[k] ? 'checked' : ''}> <i style="background:${Motion.COLORS[k]}"></i> ${l}</label>`).join('') +
    `<label><i style="background:rgba(224,122,31,.4);height:10px"></i> activity bouts</label>`;
  $$('#chartLegend input').forEach(i => i.onchange = () => { state.show[i.dataset.k] = i.checked; redrawChart(); });
}
renderLegend();
let rafPending = false;
function redrawChart(cursorOnly) {
  if (rafPending) return; rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    Motion.draw($('#motionChart'), state.analysis, state.metrics || { bouts: [], smoothTotal: [], thr: 0 }, {
      show: state.show, cursor: video.src ? video.currentTime : null, duration: video.duration || undefined,
      seqs: state.seqs.filter(s => s.end != null).map(s => [s.start, s.end])
    });
  });
}
$('#motionChart').addEventListener('click', e => {
  const c = e.currentTarget; if (!c._xToT || !video.src) return;
  video.currentTime = c._xToT(e.clientX - c.getBoundingClientRect().left);
});
function renderMetrics() {
  const m = state.metrics, el = $('#metrics');
  if (!m) { if (state.analysis) el.innerHTML = '<p class="hint">Not enough samples for metrics.</p>'; return; }
  const f = (v, d = 1) => v == null ? '–' : v.toFixed(d);
  const card = (label, val, note, flag) => `<div class="metric ${flag ? 'flag' : ''}"><small>${label}</small><b>${val}</b><small>${note || ''}</small></div>`;
  el.innerHTML =
    card('Time analysed', Motion.fmtT(m.analysedSec, 0), 'sampled at ' + state.analysis.fps + ' fps') +
    card('Active time', f(m.activePct, 0) + '%', Motion.fmtT(m.activeSec, 0) + ' above threshold', m.activePct < 10) +
    card('Activity bouts ≥1 s', m.boutCount, 'mean ' + f(m.boutMean) + ' s · max ' + f(m.boutMax) + ' s') +
    card('Limb share R arm / L arm', f(m.share.RA, 0) + ' / ' + f(m.share.LA, 0) + '%', 'image quadrants') +
    card('Limb share R leg / L leg', f(m.share.RL, 0) + ' / ' + f(m.share.LL, 0) + '%', 'image quadrants') +
    card('L–R asymmetry', f(m.asym, 0) + '%', '0 = equal', m.asym > 35) +
    card('Upper : lower', f(m.upperLower, 2), 'arms vs legs activity') +
    card('Limb simultaneity', f(m.simult, 2), 'mean inter-limb r (−1…1)', m.simult > 0.75) +
    card('Intensity variability', f(m.cv, 2), 'CV during activity', m.cv !== null && m.cv < 0.35) +
    `<div class="flags">${m.flags.length ? '<b>Prompts for the observer:</b><ul>' + m.flags.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '<span class="hint">No prompts. Indicators never replace visual Gestalt assessment.</span>'}
     ${m.bouts.length ? `<div class="row"><button id="btnBoutsToSeq">Add ${Math.min(m.bouts.length, 10)} longest bouts as GM sequences</button></div>` : ''}</div>`;
  const b = $('#btnBoutsToSeq');
  if (b) b.onclick = () => {
    [...m.bouts].sort((x, y) => (y[1] - y[0]) - (x[1] - x[0])).slice(0, 10).sort((x, y) => x[0] - y[0])
      .forEach(([a, z]) => state.seqs.push({ start: Math.max(0, a - 0.5), end: Math.min(video.duration, z + 0.5) }));
    renderSeqs(); redrawChart(); toast('Bouts added — review each and delete those that are not GMs');
  };
}

/* ================= Assessment form ================= */
const form = $('#assessForm');
let currentPeriod = null, editingId = null;

// quality checklist
$('#qualityChecks').innerHTML = GMA.quality.map(q => `<label><input type="checkbox" name="q_${q.id}"> <span>${esc(q.text)}</span></label>`).join('');

// GMOS / MOS items
function buildScore(container, items, prefix) {
  container.innerHTML = items.map(it => `<div class="score-item"><h5>${esc(it.name)}</h5>` +
    it.opts.map(([t, v], j) => `<label><input type="radio" name="${prefix}_${it.id}" value="${v}" data-j="${j}"> <span>${esc(t)}</span> <em>${v}</em></label>`).join('') + '</div>').join('');
}
buildScore($('#gmosItems'), GMA.gmos, 'g');
buildScore($('#mosItems'), GMA.mos, 'm');

// MOS N/A pattern lists
function buildNA(container, list, prefix) {
  container.innerHTML = list.map(([name, allowed], i) => `<div class="na-row" data-i="${i}"><span>${esc(name)}</span><span class="seg">
    <button type="button" data-v="N" ${allowed.includes('N') ? '' : 'disabled'}>N</button>
    <button type="button" data-v="A" ${allowed.includes('A') ? '' : 'disabled'}>A</button></span>
    <input type="hidden" name="${prefix}_${i}"></div>`).join('');
  $$('.na-row', container).forEach(row => {
    $$('button', row).forEach(btn => btn.onclick = () => {
      const inp = $('input', row); inp.value = inp.value === btn.dataset.v ? '' : btn.dataset.v;
      syncNA(row); autoMos(); updateScores();
    });
  });
}
function syncNA(row) {
  const v = $('input', row).value;
  $$('button', row).forEach(b => b.className = v === b.dataset.v ? 'on-' + v : '');
}
buildNA($('#mosMove'), GMA.mosMovement, 'mv');
buildNA($('#mosPost'), GMA.mosPosture, 'mp');
buildNA($('#mosChar'), GMA.mosCharacter, 'mc');

function tallyNA(prefix, list, skip = []) {
  let n = 0, a = 0;
  list.forEach((_, i) => { if (skip.includes(i)) return; const v = form.elements[prefix + '_' + i].value; if (v === 'N') n++; if (v === 'A') a++; });
  return { n, a };
}
function autoMos() {
  const mv = tallyNA('mv', GMA.mosMovement, [0]);
  const mp = tallyNA('mp', GMA.mosPosture);
  const cmp = ({ n, a }) => n + a === 0 ? null : n > a ? 0 : n === a ? 1 : 2;
  const q = cmp(mv); if (q !== null) $$('input[name="m_qual"]')[q].checked = true;
  const p = cmp(mp); if (p !== null) $$('input[name="m_post"]')[p].checked = true;
  // movement character
  const chars = GMA.mosCharacter.map((_, i) => form.elements['mc_' + i].value);
  const csIdx = GMA.mosCharacter.findIndex(c => c[0] === 'cramped-synchronised');
  if (chars[csIdx] === 'A') $$('input[name="m_char"]')[2].checked = true;
  else if (chars.some((v, i) => i > 0 && v === 'A')) $$('input[name="m_char"]')[1].checked = true;
  else if (chars[0] === 'N') $$('input[name="m_char"]')[0].checked = true;
  // fidgety item from N/A of the first movement row
  const fm = form.elements['mv_0'].value;
  if (fm === 'N') $$('input[name="m_fm"]')[0].checked = true;
  if (fm === 'A') $$('input[name="m_fm"]')[1].checked = true;
}

function sumScore(prefix, items) {
  let tot = 0, done = 0;
  items.forEach(it => { const r = $(`input[name="${prefix}_${it.id}"]:checked`); if (r) { tot += +r.value; done++; } });
  return done === items.length ? tot : (done ? tot + ' (incomplete)' : null);
}
function updateScores() {
  const g = sumScore('g', GMA.gmos), m = sumScore('m', GMA.mos);
  $('#gmosTotal').textContent = g ?? '–';
  $('#mosTotal').textContent = m ?? '–';
}
form.addEventListener('change', e => {
  if (/^(dob|gaW|gaD|recDate)$/.test(e.target.name)) updateAge();
  if (e.target.name === 'globalClass') syncFromGlobal();
  if (e.target.name && e.target.name.startsWith('q_')) qualityWarn();
  updateScores();
});

// global classification buttons
function renderGlobal(periodKey) {
  const p = periodKey === 'transition' ? null : periodKey === 'late' ? 'fidgety' : periodKey;
  const keys = Object.keys(GMA.classes);
  const sel = form.querySelector('input[name="globalClass"]:checked')?.value;
  $('#globalClass').innerHTML = keys.map(k => {
    const c = GMA.classes[k]; const fits = !p || c.period.includes(p);
    return `<label class="${fits ? '' : 'dim'}"><input type="radio" name="globalClass" value="${k}" ${sel === k ? 'checked' : ''}> <span><b>${esc(c.label)}</b><small>${esc(c.desc)}</small></span></label>`;
  }).join('');
  syncFromGlobal();
}
function syncFromGlobal() {
  const v = form.querySelector('input[name="globalClass"]:checked')?.value;
  $('#fmDetail').hidden = v !== 'FN';
  // prefill item 1 if empty
  const map = { N: 0, PR: 1, Ch: 2, CS: 3 };
  if (v in map && !$('input[name="g_quality"]:checked')) $$('input[name="g_quality"]')[map[v]].checked = true;
  const mm = { FN: 0, AF: 1, 'F-': 2 };
  if (v in mm && !$('input[name="m_fm"]:checked')) $$('input[name="m_fm"]')[mm[v]].checked = true;
  if (v === 'CS' && $('#mosSet').style.display !== 'none' && !$('input[name="m_char"]:checked')) $$('input[name="m_char"]')[2].checked = true;
  updateScores();
}
renderGlobal(null);

function ageInfo(f) {
  const dob = f.dob, rec = f.recDate, gaW = +f.gaW, gaD = +(f.gaD || 0);
  if (!dob || !rec || !gaW) return null;
  const days = Math.round((new Date(rec) - new Date(dob)) / 86400000);
  if (isNaN(days)) return null;
  const pma = gaW + gaD / 7 + days / 7;
  return { days, pma, pt: pma - 40, period: GMA.periodFor(pma) };
}
function fmtWk(w) { const W = Math.floor(w + 1e-6); const d = Math.round((w - W) * 7); return W + (d ? '+' + d : '') + ' wk'; }
function fmtAge(a) {
  return a.pma < 40 ? `${fmtWk(a.pma)} PMA` : `${fmtWk(a.pt)} post-term (PMA ${fmtWk(a.pma)})`;
}
function updateAge() {
  const f = Object.fromEntries(new FormData(form));
  const a = ageInfo(f);
  const box = $('#ageBox');
  if (!a) { box.innerHTML = 'Enter DOB, gestational age and recording date to calculate age and select the correct tool.'; setTool(null); return; }
  let html = `Age at recording: <b>${a.days} days</b> chronological · <b>${fmtAge(a)}</b><br>Period: <b>${a.period.label}</b> → ${a.period.tool === 'gmos' ? 'GM Optimality Score' : 'Motor Optimality Score (3–5 months)'}`;
  if (a.period.note) html += `<br><span class="hint">${esc(a.period.note)}</span>`;
  if (a.days < 3) html += `<br><span style="color:var(--bad)">Recording within the first 3 days after birth is advised against.</span>`;
  if (a.days < 0) html += `<br><span style="color:var(--bad)">Recording date is before date of birth.</span>`;
  box.innerHTML = html;
  setTool(a.period);
}
function setTool(period) {
  currentPeriod = period;
  $('#gmosSet').style.display = !period || period.tool === 'gmos' ? '' : 'none';
  $('#mosSet').style.display = !period || period.tool === 'mos' ? '' : 'none';
  renderGlobal(period ? period.key : null);
  qualityWarn();
}
function qualityWarn() {
  const unchecked = GMA.quality.filter(q => !form.elements['q_' + q.id].checked).length;
  $('#qualityWarn').textContent = unchecked ? `${unchecked} item(s) not confirmed — if the recording is unsuitable, do not classify; re-record instead.` : 'All recording conditions confirmed.';
}
setTool(null);

function collectForm() {
  const f = Object.fromEntries(new FormData(form));
  const a = ageInfo(f);
  const rec = {
    id: editingId || uid(), savedAt: new Date().toISOString(),
    infantId: f.infantId.trim(), dob: f.dob, gaW: f.gaW, gaD: f.gaD, recDate: f.recDate, scorer: f.scorer,
    pma: a ? +a.pma.toFixed(2) : null, period: a ? a.period.key : null,
    globalClass: f.globalClass || null, fmTemporal: f.fmTemporal, fmDist: f.fmDist, notes: f.notes,
    quality: GMA.quality.filter(q => f['q_' + q.id]).map(q => q.id),
    video: state.fileName || null,
    sequences: state.seqs.filter(s => s.end != null).map(s => [+s.start.toFixed(2), +s.end.toFixed(2)])
  };
  const tool = a ? a.period.tool : null;
  const idx = (pre, items) => Object.fromEntries(items.map(it => [it.id, $(`input[name="${pre}_${it.id}"]:checked`)?.dataset.j ?? null]));
  if (tool === 'gmos') { rec.itemIdx = idx('g', GMA.gmos); rec.tool = 'GMOS'; rec.items = Object.fromEntries(GMA.gmos.map(it => [it.id, +($(`input[name="g_${it.id}"]:checked`)?.value || 0) || null])); rec.score = sumScore('g', GMA.gmos); }
  if (tool === 'mos') {
    rec.itemIdx = idx('m', GMA.mos); rec.tool = 'MOS'; rec.items = Object.fromEntries(GMA.mos.map(it => [it.id, +($(`input[name="m_${it.id}"]:checked`)?.value || 0) || null])); rec.score = sumScore('m', GMA.mos);
    rec.patterns = { mv: GMA.mosMovement.map((_, i) => f['mv_' + i] || ''), mp: GMA.mosPosture.map((_, i) => f['mp_' + i] || ''), mc: GMA.mosCharacter.map((_, i) => f['mc_' + i] || '') };
  }
  if (f.attachMetrics && state.metrics) {
    const m = state.metrics;
    rec.motion = { activePct: +m.activePct.toFixed(1), bouts: m.boutCount, asym: +m.asym.toFixed(1), simult: m.simult == null ? null : +m.simult.toFixed(2), cv: m.cv == null ? null : +m.cv.toFixed(2), share: Object.fromEntries(Object.entries(m.share).map(([k, v]) => [k, +v.toFixed(1)])) };
  }
  return rec;
}
$('#btnSaveAssess').onclick = () => {
  const rec = collectForm();
  if (!rec.infantId || !rec.dob || !rec.recDate || !rec.gaW) return toast('Infant ID, DOB, GA and recording date are required');
  if (!rec.globalClass) return toast('Select the global classification');
  const recs = Store.get('records', []);
  const i = recs.findIndex(r => r.id === rec.id);
  if (i >= 0) recs[i] = rec; else recs.push(rec);
  if (Store.set('records', recs)) { editingId = rec.id; toast('Saved to records'); }
};
$('#btnNewAssess').onclick = () => {
  const keep = { infantId: form.infantId.value, dob: form.dob.value, gaW: form.gaW.value, gaD: form.gaD.value, scorer: form.scorer.value };
  form.reset(); clearNA(); editingId = null;
  Object.entries(keep).forEach(([k, v]) => form.elements[k].value = v);
  $$('.na-row').forEach(syncNA); updateAge(); updateScores();
  toast('New assessment (infant details kept)');
};
function clearNA() { $$('.na-row input').forEach(i => i.value = ''); $$('.na-row').forEach(syncNA); }
function loadRecord(rec) {
  form.reset(); clearNA(); editingId = rec.id;
  ['infantId', 'dob', 'gaW', 'gaD', 'recDate', 'scorer', 'notes', 'fmTemporal', 'fmDist'].forEach(k => { if (form.elements[k]) form.elements[k].value = rec[k] ?? ''; });
  rec.quality.forEach(q => { if (form.elements['q_' + q]) form.elements['q_' + q].checked = true; });
  updateAge();
  if (rec.globalClass) { const r = $(`input[name="globalClass"][value="${rec.globalClass}"]`); if (r) r.checked = true; }
  const pre = rec.tool === 'MOS' ? 'm' : 'g', items = rec.tool === 'MOS' ? GMA.mos : GMA.gmos;
  if (rec.items) items.forEach(it => {
    const j = rec.itemIdx ? rec.itemIdx[it.id] : null, v = rec.items[it.id];
    const r = j != null ? $$(`input[name="${pre}_${it.id}"]`)[+j] : $$(`input[name="${pre}_${it.id}"]`).find(x => +x.value === v);
    if (r) r.checked = true;
  });
  if (rec.patterns) {
    rec.patterns.mv.forEach((v, i) => form.elements['mv_' + i].value = v);
    rec.patterns.mp.forEach((v, i) => form.elements['mp_' + i].value = v);
    rec.patterns.mc.forEach((v, i) => form.elements['mc_' + i].value = v);
    $$('.na-row').forEach(syncNA);
  }
  syncFromGlobal(); qualityWarn(); updateScores(); showTab('analyse');
  toast('Loaded record — edits will update it');
}

/* ---------- Print ---------- */
function recordHtml(rec) {
  const c = GMA.classes[rec.globalClass] || {};
  const a = rec.pma != null ? fmtAge({ pma: rec.pma, pt: rec.pma - 40 }) : '–';
  const items = rec.items ? Object.entries(rec.items).map(([k, v]) => {
    const def = (rec.tool === 'MOS' ? GMA.mos : GMA.gmos).find(i => i.id === k);
    return `<tr><td>${esc(def ? def.name : k)}</td><td>${v ?? '–'}</td></tr>`;
  }).join('') : '';
  return `<h2>Prechtl General Movement Assessment — report</h2>
  <table><tr><th>Infant ID</th><td>${esc(rec.infantId)}</td><th>DOB</th><td>${esc(rec.dob)}</td></tr>
  <tr><th>GA at birth</th><td>${esc(rec.gaW)}+${esc(rec.gaD || 0)} wk</td><th>Recording date</th><td>${esc(rec.recDate)}</td></tr>
  <tr><th>Age at recording</th><td>${esc(a)}</td><th>Scorer</th><td>${esc(rec.scorer)}</td></tr>
  <tr><th>Global classification</th><td colspan="3"><b>${esc(c.label || rec.globalClass)}</b> ${rec.fmTemporal ? '· ' + esc(rec.fmTemporal) : ''} ${rec.fmDist ? '· ' + esc(rec.fmDist) : ''}</td></tr>
  <tr><th>${esc(rec.tool || 'Score')}</th><td colspan="3">${esc(rec.score ?? '–')} ${rec.tool === 'GMOS' ? '/ 16' : rec.tool === 'MOS' ? '/ 28' : ''}</td></tr></table>
  ${items ? '<h3>Score items</h3><table>' + items + '</table>' : ''}
  <h3>Recording conditions confirmed</h3><p>${rec.quality.length}/${GMA.quality.length}: ${esc(GMA.quality.filter(q => rec.quality.includes(q.id)).map(q => q.text.split(';')[0]).join('; '))}</p>
  ${rec.sequences && rec.sequences.length ? `<p><b>GM sequences reviewed:</b> ${rec.sequences.map(([s, e]) => Motion.fmtT(s) + '–' + Motion.fmtT(e)).join(', ')} ${rec.video ? '(' + esc(rec.video) + ')' : ''}</p>` : ''}
  ${rec.motion ? `<p><b>Exploratory motion indicators:</b> active ${rec.motion.activePct}% · bouts ${rec.motion.bouts} · L–R asymmetry ${rec.motion.asym}% · simultaneity ${rec.motion.simult ?? '–'} · variability ${rec.motion.cv ?? '–'}</p>` : ''}
  <h3>Notes</h3><p>${esc(rec.notes || '—')}</p>
  <p style="font-size:9pt;color:#666;margin-top:2em">Generated by GMA Assist v${GMA.version}. Classification by a trained observer using Prechtl's method; motion indicators are exploratory and non-diagnostic.</p>`;
}
$('#btnPrintAssess').onclick = () => {
  const rec = collectForm();
  $('#printArea').innerHTML = recordHtml(rec);
  window.print();
};

/* ================= Records & trajectory ================= */
function renderRecords() {
  const recs = Store.get('records', []);
  const ids = [...new Set(recs.map(r => r.infantId))].sort();
  const sel = $('#infantSelect'); const cur = sel.value;
  sel.innerHTML = ids.length ? ids.map(i => `<option ${i === cur ? 'selected' : ''}>${esc(i)}</option>`).join('') : '<option value="">(no records yet)</option>';
  const id = sel.value;
  const list = recs.filter(r => r.infantId === id).sort((a, b) => (a.pma ?? 0) - (b.pma ?? 0));
  drawTrajectory(list);
  const tb = $('#recTable tbody');
  tb.innerHTML = list.map(r => `<tr><td>${esc(r.recDate)}</td><td>${r.pma != null ? esc(fmtAge({ pma: r.pma, pt: r.pma - 40 })) : '–'}</td>
    <td>${esc(GMA.classes[r.globalClass]?.label || r.globalClass)}${r.fmTemporal ? ' ' + esc(r.fmTemporal.split(' ')[0]) : ''}</td>
    <td>${r.tool ? esc(r.tool) + ' ' + esc(r.score ?? '–') : '–'}</td><td>${esc(r.scorer)}</td>
    <td><button data-a="open" data-id="${r.id}">Open</button> <button data-a="print" data-id="${r.id}">Print</button> <button data-a="del" data-id="${r.id}" class="danger">Delete</button></td></tr>`).join('')
    || '<tr><td colspan="6" class="hint">Save an assessment from the Analyse tab to start a trajectory.</td></tr>';
  $$('button', tb).forEach(b => b.onclick = () => {
    const all = Store.get('records', []); const r = all.find(x => x.id === b.dataset.id);
    if (b.dataset.a === 'open') loadRecord(r);
    if (b.dataset.a === 'print') { $('#printArea').innerHTML = recordHtml(r); window.print(); }
    if (b.dataset.a === 'del' && confirm('Delete this record?')) { Store.set('records', all.filter(x => x.id !== r.id)); renderRecords(); }
  });
  // advice
  const adv = [];
  if (list.length) {
    const pre = list.filter(r => r.pma < 38).length, term = list.filter(r => r.pma >= 38 && r.pma < 46).length, fid = list.filter(r => r.pma - 40 >= 9 && r.pma - 40 <= 15).length;
    if (!fid) adv.push('No recording yet at 9–15 weeks post-term (fidgety period) — this is the most predictive assessment.');
    const absent = list.filter(r => r.globalClass === 'F-');
    if (absent.length === 1) adv.push('Absent fidgety movements recorded once — repeat within the fidgety period (e.g. at 12 and 15 weeks) to confirm.');
    const cs = list.filter(r => r.globalClass === 'CS');
    if (cs.length >= 2) adv.push('Cramped-synchronised GMs on repeated recordings — consistent CS has high predictive value for spastic CP; ensure early referral pathway.');
    if (list.some(r => r.pma < 38) && pre < 2) adv.push('Manual recommends 2–3 recordings in the preterm period.');
  }
  $('#trajAdvice').innerHTML = adv.map(a => '• ' + esc(a)).join('<br>');
}
$('#infantSelect').onchange = renderRecords;

function drawTrajectory(list) {
  const svg = $('#trajectory');
  const W = 960, H = 330, L = 60, R = 15, T = 15, B = 70;
  const x0 = 26, x1 = 62; // PMA weeks (26 PMA .. 22 post-term)
  const X = w => L + (Math.max(x0, Math.min(x1, w)) - x0) / (x1 - x0) * (W - L - R);
  const rows = GMA.trajectoryRows; const rh = (H - T - B) / rows.length;
  const Y = code => T + rows.indexOf(code) * rh + rh / 2;
  let s = `<rect x="${X(49)}" y="${T}" width="${X(60) - X(49)}" height="${H - T - B}" fill="#eef2f3"/>`;
  s += `<text x="${(X(49) + X(60)) / 2}" y="${T + 12}" font-size="11" text-anchor="middle" fill="#5d6d74">fidgety period</text>`;
  rows.forEach((r, i) => {
    s += `<line x1="${L}" x2="${W - R}" y1="${T + (i + 1) * rh}" y2="${T + (i + 1) * rh}" stroke="#e3e9eb"/>`;
    s += `<text x="${L - 8}" y="${Y(r) + 4}" text-anchor="end" font-size="12" font-weight="600" fill="${r === 'N' ? '#2e7d32' : '#c62828'}">${r}</text>`;
  });
  for (let w = x0; w <= x1; w++) {
    const lab = w <= 40 ? w : w - 40;
    s += `<line x1="${X(w)}" x2="${X(w)}" y1="${H - B}" y2="${H - B + 4}" stroke="#999"/>`;
    s += `<text x="${X(w)}" y="${H - B + 16}" font-size="10" text-anchor="middle" fill="#5d6d74">${lab}</text>`;
  }
  s += `<line x1="${X(40)}" x2="${X(40)}" y1="${T}" y2="${H - B}" stroke="#bbb" stroke-dasharray="3 3"/>`;
  s += `<text x="${(X(26) + X(40)) / 2}" y="${H - B + 34}" font-size="11" text-anchor="middle" fill="#5d6d74">weeks post-menstrual age</text>`;
  s += `<text x="${(X(40) + X(62)) / 2}" y="${H - B + 34}" font-size="11" text-anchor="middle" fill="#5d6d74">weeks post-term age</text>`;
  s += `<text x="${L}" y="${H - 10}" font-size="10" fill="#5d6d74">N normal · H hypokinesis · PR poor repertoire · Ch chaotic · CS cramped-synchronised · AF abnormal fidgety · F− absent fidgety</text>`;
  const pts = list.filter(r => r.pma != null && r.globalClass).map(r => {
    const code = r.globalClass === 'FN' ? 'N' : r.globalClass;
    return { x: X(r.pma), y: Y(code), code, r };
  });
  if (pts.length > 1) s += `<polyline fill="none" stroke="#0f5c6e" stroke-width="2" points="${pts.map(p => p.x + ',' + p.y).join(' ')}"/>`;
  pts.forEach(p => {
    s += `<circle cx="${p.x}" cy="${p.y}" r="6" fill="${p.code === 'N' ? '#2e7d32' : '#c62828'}" stroke="#fff" stroke-width="2"><title>${esc(p.r.recDate)} · ${esc(GMA.classes[p.r.globalClass]?.label)}</title></circle>`;
  });
  if (!pts.length) s += `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" fill="#99a">No recordings for this infant</text>`;
  svg.innerHTML = s;
}

$('#btnExportJson').onclick = () => download('gma-records-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify({ app: 'gma-assist', version: GMA.version, records: Store.get('records', []) }, null, 2));
$('#btnExportCsv').onclick = () => {
  const recs = Store.get('records', []);
  const head = ['infantId', 'dob', 'gaW', 'gaD', 'recDate', 'pma', 'period', 'globalClass', 'fmTemporal', 'fmDist', 'tool', 'score', 'scorer', 'qualityConfirmed', 'activePct', 'asym', 'simult', 'cv', 'notes'];
  const rows = recs.map(r => [r.infantId, r.dob, r.gaW, r.gaD, r.recDate, r.pma, r.period, r.globalClass, r.fmTemporal, r.fmDist, r.tool, r.score, r.scorer, r.quality.length + '/' + GMA.quality.length, r.motion?.activePct, r.motion?.asym, r.motion?.simult, r.motion?.cv, r.notes]);
  download('gma-records.csv', toCsv([head, ...rows]), 'text/csv');
};
$('#importJson').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const data = JSON.parse(await f.text()); const inc = data.records || data;
    if (!Array.isArray(inc)) throw new Error('No records array');
    const recs = Store.get('records', []); const have = new Set(recs.map(r => r.id)); let n = 0;
    inc.forEach(r => { if (r && r.id && !have.has(r.id)) { recs.push(r); n++; } });
    Store.set('records', recs); renderRecords(); toast(`Imported ${n} record(s)`);
  } catch (err) { toast('Import failed: ' + err.message); }
  e.target.value = '';
};
$('#btnWipe').onclick = async () => {
  if (!confirm('Delete ALL records, practice clips and training results from this browser?')) return;
  ['records', 'results', 'quizBest'].forEach(k => Store.remove(k));
  try { await ClipDB.clear(); } catch (e) {}
  toast('All local data deleted'); setTimeout(() => location.reload(), 800);
};

/* ================= Startup ================= */
window.addEventListener('load', () => {
  const h = location.hash.slice(1);
  if (h && $('#tab-' + h)) showTab(h);
  sizeRoiCanvas(); redrawChart();
});
