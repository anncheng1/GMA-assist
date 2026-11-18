/* GMA Assist — training: lessons, quiz, blind practice-clip library. */

/* ================= Learn ================= */
(() => {
  const toc = $('#learnToc'), body = $('#learnBody');
  let cur = 0;
  toc.innerHTML = '<h2 style="margin-bottom:.6rem">Modules</h2>' + GMA.lessons.map((l, i) => `<button data-i="${i}">${esc(l.title)}</button>`).join('') +
    '<p class="hint" style="margin-top:1rem">Summaries for revision. Study with the manual and its case videos, and attend accredited GM Trust training before clinical use.</p>';
  function show(i) {
    cur = i; const l = GMA.lessons[i];
    $$('button', toc).forEach(b => b.classList.toggle('active', +b.dataset.i === i));
    body.innerHTML = `<h2>${esc(l.title)}</h2>${l.html}<div class="lesson-nav">
      ${i > 0 ? `<button data-go="${i - 1}">← ${esc(GMA.lessons[i - 1].title)}</button>` : '<span></span>'}
      ${i < GMA.lessons.length - 1 ? `<button class="primary" data-go="${i + 1}">${esc(GMA.lessons[i + 1].title)} →</button>` : `<button class="primary" data-quiz>Take the quiz →</button>`}</div>`;
    $$('[data-go]', body).forEach(b => b.onclick = () => { show(+b.dataset.go); body.scrollIntoView({ behavior: 'smooth' }); });
    const q = $('[data-quiz]', body); if (q) q.onclick = () => showTab('quiz');
    if (l.id === 'refvideos') renderRefLibrary($('#refLibrary'));
  }
  $$('button', toc).forEach(b => b.onclick = () => show(+b.dataset.i));
  show(0);
})();

/* ================= Reference video library ================= */
function renderRefLibrary(el) {
  const user = Store.get('refVideos', []);
  const all = [...GMA.referenceVideos.map(v => ({ ...v, builtin: true })), ...user];
  const clsOpts = Object.keys(GMA.classes).map(k => `<option value="${k}">${esc(GMA.classes[k].label)}</option>`).join('');
  el.innerHTML = `<p>Published example recordings to calibrate your Gestalt perception. Videos play from YouTube (internet needed) and are not stored in the app. Watch each one several times, at normal speed and slowed down, and compare normal with abnormal.</p>
    <div class="ref-grid">${all.map((v, i) => {
      const c = GMA.classes[v.cls];
      return `<div class="ref-card"><div class="yt"><button class="play" data-yt="${esc(v.yt)}" style="background-image:url(https://i.ytimg.com/vi/${esc(v.yt)}/hqdefault.jpg)" aria-label="Play ${esc(v.title)}">▶</button></div>
      <div class="body"><b>${esc(v.title)}</b>${c ? `<span class="cls ${GMA.abnormal.has(v.cls) ? 'a' : 'n'}">${esc(c.label)}</span>` : ''}
      ${v.note ? `<div>${esc(v.note)}</div>` : ''}<div class="hint">${esc(v.source || '')}</div>
      <div class="row"><a href="https://www.youtube.com/watch?v=${esc(v.yt)}" target="_blank" rel="noopener">Open on YouTube</a>
      ${v.builtin ? '' : `<button data-del="${esc(v.id)}" class="danger">Remove</button>`}</div></div></div>`;
    }).join('')}</div>
    <h3>Add a YouTube reference video</h3>
    <form class="ref-form" id="refForm">
      <label>YouTube link <input name="url" required placeholder="https://www.youtube.com/watch?v=…"></label>
      <label>Title <input name="title" required></label>
      <label>Classification shown <select name="cls"><option value="">— not specified —</option>${clsOpts}</select></label>
      <label>Source / citation <input name="source"></label>
      <label style="grid-column:1/-1">Teaching note <input name="note"></label>
      <button class="primary">Add video</button>
    </form>
    <p class="hint">Use only videos published openly by their owners (journals, GM Trust, hospitals). Never upload identifiable patient videos to public sites.</p>`;
  $$('button.play', el).forEach(b => b.onclick = () => {
    b.parentElement.innerHTML = `<iframe src="${GMA.ytEmbed(b.dataset.yt, true)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Reference video"></iframe>`;
  });
  $$('[data-del]', el).forEach(b => b.onclick = () => { Store.set('refVideos', Store.get('refVideos', []).filter(v => v.id !== b.dataset.del)); renderRefLibrary(el); });
  $('#refForm', el).onsubmit = e => {
    e.preventDefault(); const f = e.target;
    const yt = GMA.ytId(f.url.value); if (!yt) return toast('Not a recognised YouTube link');
    const list = Store.get('refVideos', []);
    list.push({ id: uid(), yt, title: f.title.value.trim(), cls: f.cls.value, source: f.source.value.trim(), note: f.note.value.trim() });
    Store.set('refVideos', list); toast('Reference video added'); renderRefLibrary(el);
  };
}

/* ================= Quiz ================= */
const Quiz = (() => {
  const el = $('#quizPanel');
  let qs = [], i = 0, score = 0, answered = false;
  function shuffle(a) { a = [...a]; for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; }
  function start(n) {
    qs = shuffle(GMA.quiz).slice(0, n).map(q => {
      const order = shuffle(q.o.map((t, j) => j));
      return { q: q.q, o: order.map(j => q.o[j]), a: order.indexOf(q.a), e: q.e };
    });
    i = 0; score = 0; render();
  }
  function intro() {
    const best = Store.get('quizBest', null);
    el.innerHTML = `<h2>Knowledge check</h2><p>Questions are drawn at random from a bank of ${GMA.quiz.length} items covering concepts, normal and abnormal GMs, recording technique, assessment and scoring.</p>
      ${best ? `<p class="hint">Your best score: ${best.score}/${best.n} (${best.date})</p>` : ''}
      <div class="row"><button class="primary" data-n="10">Start 10 questions</button><button data-n="${GMA.quiz.length}">All ${GMA.quiz.length} questions</button></div>`;
    $$('[data-n]', el).forEach(b => b.onclick = () => start(+b.dataset.n));
  }
  function render() {
    if (i >= qs.length) return finish();
    const q = qs[i]; answered = false;
    el.innerHTML = `<div class="hint">Question ${i + 1} of ${qs.length} · score ${score}</div><div class="bar"><div style="width:${i / qs.length * 100}%"></div></div>
      <div class="q">${esc(q.q)}</div><div class="opts">${q.o.map((o, j) => `<button data-j="${j}">${esc(o)}</button>`).join('')}</div><div id="qExplain"></div>`;
    $$('.opts button', el).forEach(b => b.onclick = () => {
      if (answered) return; answered = true;
      const j = +b.dataset.j; const ok = j === q.a; if (ok) score++;
      $$('.opts button', el).forEach(x => { if (+x.dataset.j === q.a) x.classList.add('correct'); else if (x === b) x.classList.add('wrong'); });
      $('#qExplain').innerHTML = `<div class="explain"><b>${ok ? 'Correct.' : 'Not quite.'}</b> ${esc(q.e)}</div><button class="primary" id="qNext">${i + 1 < qs.length ? 'Next →' : 'See result'}</button>`;
      $('#qNext').onclick = () => { i++; render(); };
    });
  }
  function finish() {
    const pct = Math.round(score / qs.length * 100);
    const best = Store.get('quizBest', null);
    if (!best || score / qs.length > best.score / best.n) Store.set('quizBest', { score, n: qs.length, date: new Date().toISOString().slice(0, 10) });
    el.innerHTML = `<h2>Result: ${score}/${qs.length} (${pct}%)</h2>
      <p>${pct >= 80 ? 'Good grasp of the theory. Next, practise classification on reference clips.' : 'Review the Learn modules — especially recording technique, abnormal patterns and scoring — then try again.'}</p>
      <div class="row"><button class="primary" id="qAgain">Try again</button><button id="qLearn">Back to modules</button><button id="qPractice">Practice clips</button></div>`;
    $('#qAgain').onclick = intro; $('#qLearn').onclick = () => showTab('learn'); $('#qPractice').onclick = () => showTab('practice');
  }
  intro();
  return { intro };
})();

/* ================= Practice clips ================= */
(() => {
  const PERIOD_CLASSES = { preterm: ['N', 'PR', 'CS', 'Ch', 'H'], writhing: ['N', 'PR', 'CS', 'Ch', 'H'], fidgety: ['FN', 'AF', 'F-', 'CS'] };
  const PERIOD_LABEL = { preterm: 'Preterm', writhing: 'Writhing', fidgety: 'Fidgety' };
  let clips = [], active = null, url = null;
  const pv = $('#pVideo');
  const clipForm = $('#clipForm');

  function keyOptions() {
    const p = clipForm.period.value;
    clipForm.key.innerHTML = PERIOD_CLASSES[p].map(k => `<option value="${k}">${esc(GMA.classes[k].label)}</option>`).join('');
  }
  clipForm.period.onchange = keyOptions; keyOptions();

  $('#trainerMode').onchange = e => { $('#trainerPanel').hidden = !e.target.checked; renderList(); };

  clipForm.onsubmit = async e => {
    e.preventDefault();
    const f = clipForm.file.files[0];
    const yt = GMA.ytId(clipForm.yt.value);
    if (!f && !yt) return toast(clipForm.yt.value ? 'Not a recognised YouTube link' : 'Choose a video file or paste a YouTube link');
    const clip = { yt: f ? null : yt, id: uid(), title: clipForm.title.value.trim(), period: clipForm.period.value, key: clipForm.key.value,
      keyScore: clipForm.keyScore.value ? +clipForm.keyScore.value : null, teach: clipForm.teach.value.trim(),
      fileName: f ? f.name : null, blob: f || null, added: new Date().toISOString() };
    try { await ClipDB.put(clip); toast('Clip added'); clipForm.reset(); keyOptions(); await load(); }
    catch (err) { toast('Could not store clip: ' + err.message); }
  };

  async function load() {
    try { clips = await ClipDB.all(); } catch (e) { clips = []; }
    clips.sort((a, b) => a.added.localeCompare(b.added));
    renderList(); renderStats();
  }
  function renderList() {
    const trainer = $('#trainerMode').checked;
    const res = Store.get('results', []);
    const ul = $('#clipList');
    if (!clips.length) { ul.innerHTML = `<li class="hint" style="cursor:default">No practice clips yet. ${trainer ? 'Add one above.' : 'A trainer can add clips in Trainer mode, or import an answer key and attach the videos.'}</li>`; return; }
    ul.innerHTML = clips.map(c => {
      const tries = res.filter(r => r.clipId === c.id);
      return `<li data-id="${c.id}" class="${active && active.id === c.id ? 'active' : ''}"><div class="meta"><b>${esc(c.title)}</b>
        <small>${PERIOD_LABEL[c.period]} · ${c.yt ? 'YouTube · ' : c.blob ? '' : '<span style="color:var(--bad)">video missing</span> · '}${tries.length} attempt(s)${trainer ? ' · key: ' + esc(GMA.classes[c.key]?.label) + (c.keyScore ? ' (' + c.keyScore + ')' : '') : ''}</small></div>
        ${trainer ? '<button data-a="del" class="danger">✕</button>' : ''}</li>`;
    }).join('');
    $$('li[data-id]', ul).forEach(li => li.onclick = async ev => {
      const c = clips.find(x => x.id === li.dataset.id);
      if (ev.target.dataset.a === 'del') { if (confirm('Delete clip "' + c.title + '"?')) { await ClipDB.del(c.id); if (active?.id === c.id) active = null; load(); } return; }
      open(c);
    });
  }
  function open(c) {
    active = c;
    $('#practiceTitle').textContent = c.title;
    if (url) URL.revokeObjectURL(url);
    const yf = $('#pYt');
    pv.pause();
    if (c.yt) { pv.removeAttribute('src'); pv.hidden = true; yf.hidden = false; yf.src = GMA.ytEmbed(c.yt); }
    else {
      yf.hidden = true; yf.removeAttribute('src'); pv.hidden = false;
      if (c.blob) { url = URL.createObjectURL(c.blob); pv.src = url; } else { pv.removeAttribute('src'); toast('Video not attached for this clip'); }
    }
    $('#pYtHint').hidden = !c.yt; ['pBack', 'pFwd', 'pSpeed'].forEach(id => $('#' + id).disabled = !!c.yt);
    pv.playbackRate = +$('#pSpeed').value;
    $('#practiceForm').hidden = false; $('#practiceFeedback').innerHTML = '';
    const keys = PERIOD_CLASSES[c.period];
    $('#pClass').innerHTML = keys.map(k => `<label><input type="radio" name="pc" value="${k}"> <span><b>${esc(GMA.classes[k].label)}</b><small>${esc(GMA.classes[k].desc)}</small></span></label>`).join('');
    $('#practiceForm').score.value = '';
    renderList();
  }
  $('#pSpeed').onchange = e => pv.playbackRate = +e.target.value;
  $('#pBack').onclick = () => { pv.pause(); pv.currentTime = Math.max(0, pv.currentTime - 1 / 30); };
  $('#pFwd').onclick = () => { pv.pause(); pv.currentTime = Math.min(pv.duration || 0, pv.currentTime + 1 / 30); };

  $('#practiceForm').onsubmit = e => {
    e.preventDefault(); if (!active) return;
    const ans = $('input[name="pc"]:checked', e.target)?.value;
    if (!ans) return toast('Choose a classification');
    const trainee = $('#traineeName').value.trim() || 'anonymous';
    Store.set('traineeName', trainee);
    const sc = e.target.score.value ? +e.target.score.value : null;
    const ok = ans === active.key;
    const res = Store.get('results', []);
    res.push({ id: uid(), clipId: active.id, clipTitle: active.title, period: active.period, trainee, answer: ans, key: active.key, correct: ok,
      score: sc, keyScore: active.keyScore, date: new Date().toISOString() });
    Store.set('results', res);
    const normAns = GMA.abnormal.has(ans) ? 'abnormal' : 'normal', normKey = GMA.abnormal.has(active.key) ? 'abnormal' : 'normal';
    $('#practiceFeedback').innerHTML = `<div class="feedback ${ok ? 'ok' : 'no'}">
      <b>${ok ? 'Agrees with reference.' : 'Differs from reference.'}</b> You: ${esc(GMA.classes[ans].label)} · Reference: <b>${esc(GMA.classes[active.key].label)}</b>
      ${!ok && normAns === normKey ? '<br>You correctly judged it ' + normKey + ', but the sub-category differs.' : ''}
      ${!ok && normAns !== normKey ? '<br><b>Normal/abnormal judgement differs</b> — revisit the defining features in the Learn tab.' : ''}
      ${active.keyScore && sc ? `<br>Score: you ${sc} · reference ${active.keyScore} (difference ${Math.abs(sc - active.keyScore)})` : ''}
      ${active.teach ? `<br><br><b>Teaching points:</b> ${esc(active.teach)}` : ''}</div>`;
    renderList(); renderStats();
  };

  function kappa(pairs) {
    const cats = [...new Set(pairs.flat())]; const n = pairs.length; if (n < 2) return null;
    const po = pairs.filter(([a, b]) => a === b).length / n;
    let pe = 0; cats.forEach(c => { pe += (pairs.filter(p => p[0] === c).length / n) * (pairs.filter(p => p[1] === c).length / n); });
    return pe === 1 ? 1 : (po - pe) / (1 - pe);
  }
  function renderStats() {
    const name = $('#traineeName').value.trim() || Store.get('traineeName', '');
    if (!$('#traineeName').value && name) $('#traineeName').value = name;
    const all = Store.get('results', []);
    const res = name ? all.filter(r => r.trainee === name) : all;
    const el = $('#practiceStats');
    if (!res.length) { el.innerHTML = '<p class="hint full">No attempts yet' + (name ? ' for ' + esc(name) : '') + '.</p>'; return; }
    const acc = res.filter(r => r.correct).length / res.length * 100;
    const nAbn = res.filter(r => GMA.abnormal.has(r.answer) === GMA.abnormal.has(r.key)).length / res.length * 100;
    const k = kappa(res.map(r => [r.answer, r.key]));
    // sensitivity for abnormal (vs reference)
    const abnKeys = res.filter(r => GMA.abnormal.has(r.key)), nrmKeys = res.filter(r => !GMA.abnormal.has(r.key));
    const sens = abnKeys.length ? abnKeys.filter(r => GMA.abnormal.has(r.answer)).length / abnKeys.length * 100 : null;
    const spec = nrmKeys.length ? nrmKeys.filter(r => !GMA.abnormal.has(r.answer)).length / nrmKeys.length * 100 : null;
    const cats = [...new Set(res.flatMap(r => [r.answer, r.key]))];
    const conf = `<table class="conf"><tr><th>ref ↓ / you →</th>${cats.map(c => `<th>${esc(GMA.classes[c].short === 'N' && c === 'FN' ? 'F+' : GMA.classes[c].short)}</th>`).join('')}</tr>` +
      cats.map(a => `<tr><th>${esc(c2(a))}</th>${cats.map(b => `<td class="${a === b ? 'diag' : ''}">${res.filter(r => r.key === a && r.answer === b).length || ''}</td>`).join('')}</tr>`).join('') + '</table>';
    function c2(c) { return c === 'FN' ? 'F+' : GMA.classes[c].short; }
    const card = (l, v, n) => `<div class="metric"><small>${l}</small><b>${v}</b><small>${n || ''}</small></div>`;
    el.innerHTML = card('Attempts', res.length, name ? esc(name) : 'all trainees') +
      card('Exact agreement', acc.toFixed(0) + '%', 'with reference') +
      card('Normal vs abnormal', nAbn.toFixed(0) + '%', 'agreement') +
      card("Cohen's κ", k == null ? '–' : k.toFixed(2), 'chance-corrected') +
      card('Detects abnormal', sens == null ? '–' : sens.toFixed(0) + '%', 'sensitivity vs reference') +
      card('Recognises normal', spec == null ? '–' : spec.toFixed(0) + '%', 'specificity vs reference') +
      `<div class="full"><small class="hint">Confusion matrix (rows = reference, columns = your answer)</small>${conf}</div>`;
  }
  $('#traineeName').addEventListener('change', renderStats);

  $('#btnExportResults').onclick = () => {
    const res = Store.get('results', []);
    download('gma-training-results.csv', toCsv([['date', 'trainee', 'clip', 'period', 'answer', 'reference', 'correct', 'score', 'refScore'],
      ...res.map(r => [r.date, r.trainee, r.clipTitle, r.period, r.answer, r.key, r.correct ? 1 : 0, r.score, r.keyScore])]), 'text/csv');
  };
  $('#btnClearResults').onclick = () => { if (confirm('Clear all practice results on this device?')) { Store.set('results', []); renderStats(); renderList(); } };

  $('#btnExportLib').onclick = () => {
    download('gma-practice-key.json', JSON.stringify({ app: 'gma-assist', type: 'practice-key', clips: clips.map(({ blob, ...c }) => c) }, null, 2));
  };
  $('#importLib').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const d = JSON.parse(await f.text()); const have = new Set(clips.map(c => c.id)); let n = 0;
      for (const c of (d.clips || [])) { if (!have.has(c.id) && c.title && c.key) { await ClipDB.put({ ...c, blob: null }); n++; } }
      toast(`Imported ${n} key(s). Now attach the matching video files.`); load();
    } catch (err) { toast('Import failed: ' + err.message); }
    e.target.value = '';
  };
  $('#attachVideos').onchange = async e => {
    let n = 0;
    for (const f of e.target.files) {
      const c = clips.find(x => x.fileName === f.name);
      if (c) { c.blob = f; await ClipDB.put(c); n++; }
    }
    toast(`Attached ${n} video(s) by file name`); e.target.value = ''; load();
  };

  load();
})();
