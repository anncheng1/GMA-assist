/* Exploratory motion analysis by frame differencing.
 * Samples the video at a fixed rate, downsamples the region of interest to a small greyscale
 * image and counts changed pixels per image quadrant. Quadrants are mapped to the infant's
 * limbs using the head position (camera above a supine infant: infant's right = image left
 * when the head is at the top).
 * These are descriptive indicators only — they do not classify general movements.
 */
const Motion = (() => {
  const W = 160, H = 120;
  // index order of image quadrants: [TL, TR, BL, BR] -> limb key
  const MAP = {
    top:    ['RA', 'LA', 'RL', 'LL'],
    bottom: ['LL', 'RL', 'LA', 'RA'],
    left:   ['LA', 'LL', 'RA', 'RL'],
    right:  ['RL', 'RA', 'LL', 'LA']
  };
  const LIMBS = { RA: 'Right arm', LA: 'Left arm', RL: 'Right leg', LL: 'Left leg' };
  const COLORS = { total: '#35208f', RA: '#1f77b4', LA: '#d62728', RL: '#2ca02c', LL: '#9467bd' };

  function seek(video, t) {
    return new Promise((res) => {
      let done = false;
      const fin = () => { if (done) return; done = true; video.removeEventListener('seeked', fin); res(); };
      video.addEventListener('seeked', fin);
      video.currentTime = Math.min(t, Math.max(0, video.duration - 0.001));
      setTimeout(fin, 1500); // safety
    });
  }

  async function analyse(video, opts) {
    const { fps = 8, roi = null, head = 'top', pxThr = 18, ranges = null, onProgress = () => {}, isCancelled = () => false } = opts;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    const vw = video.videoWidth, vh = video.videoHeight;
    const r = roi || { x: 0, y: 0, w: 1, h: 1 };
    const sx = r.x * vw, sy = r.y * vh, sw = Math.max(2, r.w * vw), sh = Math.max(2, r.h * vh);
    const dur = video.duration;
    const segs = (ranges && ranges.length) ? ranges : [[0, dur]];
    const times = [];
    segs.forEach(([a, b]) => { for (let t = a; t <= b; t += 1 / fps) times.push(+t.toFixed(4)); });
    const map = MAP[head] || MAP.top;
    const wasPaused = video.paused, oldT = video.currentTime;
    video.pause();
    let prev = null, prevT = -1;
    const samples = [];
    const npx = (W * H) / 4;
    for (let i = 0; i < times.length; i++) {
      if (isCancelled()) break;
      const t = times[i];
      await seek(video, t);
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);
      const d = ctx.getImageData(0, 0, W, H).data;
      const g = new Uint8ClampedArray(W * H);
      for (let p = 0, q = 0; p < d.length; p += 4, q++) g[q] = (d[p] * 77 + d[p + 1] * 150 + d[p + 2] * 29) >> 8;
      // reset differencing across gaps between sequences
      if (prev && (t - prevT) <= 1.5 / fps) {
        const qc = [0, 0, 0, 0];
        for (let y = 0; y < H; y++) {
          const qy = y < H / 2 ? 0 : 2;
          for (let x = 0; x < W; x++) {
            const k = y * W + x;
            if (Math.abs(g[k] - prev[k]) > pxThr) qc[qy + (x < W / 2 ? 0 : 1)]++;
          }
        }
        const s = { t };
        qc.forEach((c, j) => { s[map[j]] = (c / npx) * 100; });
        s.total = (qc[0] + qc[1] + qc[2] + qc[3]) / (W * H) * 100;
        samples.push(s);
      }
      prev = g; prevT = t;
      if (i % 5 === 0) onProgress(i / times.length);
    }
    onProgress(1);
    await seek(video, oldT);
    if (!wasPaused) video.play();
    return { fps, samples, head, roi: r, pxThr, ranges: segs };
  }

  function smooth(arr, win) {
    const out = new Array(arr.length); let s = 0; const h = Math.floor(win / 2);
    const pre = [0]; arr.forEach(v => pre.push(pre[pre.length - 1] + v));
    for (let i = 0; i < arr.length; i++) {
      const a = Math.max(0, i - h), b = Math.min(arr.length, i + h + 1);
      out[i] = (pre[b] - pre[a]) / (b - a);
    }
    return out;
  }
  const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(v => (v - m) ** 2))); };
  function pct(a, p) { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; }
  function corr(a, b) {
    const ma = mean(a), mb = mean(b); let n = 0, da = 0, db = 0;
    for (let i = 0; i < a.length; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
    return da && db ? n / Math.sqrt(da * db) : 0;
  }

  /* thrPos: 0..100 slider -> threshold between noise floor and 95th percentile */
  function metrics(res, thrPos = 30) {
    const S = res.samples;
    if (S.length < 4) return null;
    const fps = res.fps;
    const tot = smooth(S.map(s => s.total), Math.max(1, Math.round(fps / 2)));
    const lo = pct(tot, 0.1), hi = pct(tot, 0.95);
    const thr = lo + (hi - lo) * (thrPos / 100) + 0.05;
    const active = tot.map(v => v > thr);
    // bouts: merge gaps < 1 s, keep bouts >= 1 s; break at time gaps
    const bouts = []; let st = null, lastOn = null;
    for (let i = 0; i < S.length; i++) {
      const gap = i > 0 && (S[i].t - S[i - 1].t) > 1.5 / fps;
      if (gap && st !== null) { bouts.push([st, lastOn]); st = null; }
      if (active[i]) { if (st === null) st = S[i].t; lastOn = S[i].t; }
      else if (st !== null && S[i].t - lastOn > 1) { bouts.push([st, lastOn]); st = null; }
    }
    if (st !== null) bouts.push([st, lastOn]);
    const B = bouts.filter(([a, b]) => b - a >= 1);
    const actIdx = S.map((_, i) => i).filter(i => active[i]);
    const analysedSec = S.length / fps;
    const activeSec = actIdx.length / fps;
    const limbs = ['RA', 'LA', 'RL', 'LL'];
    const sums = {}; limbs.forEach(k => sums[k] = actIdx.reduce((a, i) => a + S[i][k], 0));
    const all = limbs.reduce((a, k) => a + sums[k], 0) || 1;
    const share = {}; limbs.forEach(k => share[k] = sums[k] / all * 100);
    const L = sums.LA + sums.LL, R = sums.RA + sums.RL, U = sums.RA + sums.LA, Lo = sums.RL + sums.LL;
    const asym = (L + R) ? Math.abs(L - R) / (L + R) * 100 : 0;
    // inter-limb simultaneity: mean pairwise correlation during active samples
    let cs = [], sm = {};
    limbs.forEach(k => sm[k] = smooth(S.map(s => s[k]), Math.max(1, Math.round(fps / 4))));
    if (actIdx.length > 8) {
      for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++)
        cs.push(corr(actIdx.map(i => sm[limbs[a]][i]), actIdx.map(i => sm[limbs[b]][i])));
    }
    const simult = cs.length ? mean(cs) : null;
    const actVals = actIdx.map(i => tot[i]);
    const cv = actVals.length > 4 ? sd(actVals) / (mean(actVals) || 1) : null;
    const boutDur = B.map(([a, b]) => b - a);
    const flags = [];
    if (simult !== null && simult > 0.75) flags.push('High simultaneity of limb activity — review sequences for a cramped-synchronised character.');
    if (cv !== null && cv < 0.35) flags.push('Low variability of movement intensity — review for monotonous sequence (poor repertoire) character.');
    if (asym > 35) flags.push('Marked left/right difference in image activity — check posture/positioning, occlusion by lines or blankets, and review for asymmetry.');
    if (activeSec / analysedSec < 0.1) flags.push('Very little activity detected — infant may be asleep/drowsy (check state), or ROI/threshold may need adjustment.');
    if (activeSec / analysedSec > 0.9 && hi > 20) flags.push('Near-continuous large image change — check for crying, caregiver handling or camera movement.');
    return {
      thr, smoothTotal: tot, bouts: B,
      analysedSec, activeSec, activePct: activeSec / analysedSec * 100,
      boutCount: B.length, boutMean: mean(boutDur), boutMax: Math.max(0, ...boutDur),
      share, asym, upperLower: Lo ? U / Lo : null, simult, cv, flags
    };
  }

  function draw(canvas, res, m, opts = {}) {
    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    canvas.width = cw * dpr; canvas.height = ch * dpr;
    const c = canvas.getContext('2d'); c.scale(dpr, dpr);
    c.clearRect(0, 0, cw, ch);
    const pad = { l: 34, r: 8, t: 8, b: 20 };
    const pw = cw - pad.l - pad.r, ph = ch - pad.t - pad.b;
    c.font = '11px system-ui'; c.fillStyle = '#5d6d74';
    if (!res || !res.samples.length) { c.fillText('No analysis yet', pad.l + 8, pad.t + 20); return; }
    const S = res.samples, dur = opts.duration || S[S.length - 1].t;
    const show = opts.show || { total: true };
    let ymax = 0;
    Object.keys(show).forEach(k => { if (show[k]) S.forEach((s, i) => { ymax = Math.max(ymax, k === 'total' ? m.smoothTotal[i] : s[k]); }); });
    ymax = ymax * 1.1 || 1;
    const X = t => pad.l + (t / dur) * pw, Y = v => pad.t + ph - (v / ymax) * ph;
    // bouts
    c.fillStyle = 'rgba(224,122,31,.13)';
    m.bouts.forEach(([a, b]) => c.fillRect(X(a), pad.t, Math.max(1, X(b) - X(a)), ph));
    // marked ranges
    (opts.seqs || []).forEach(([a, b]) => { c.fillStyle = 'rgba(15,92,110,.08)'; c.fillRect(X(a), pad.t + ph - 4, X(b) - X(a), 4); });
    // axes
    c.strokeStyle = '#d9e1e4'; c.beginPath(); c.moveTo(pad.l, pad.t); c.lineTo(pad.l, pad.t + ph); c.lineTo(pad.l + pw, pad.t + ph); c.stroke();
    c.fillStyle = '#5d6d74';
    c.fillText(ymax.toFixed(1) + '%', 2, pad.t + 9); c.fillText('0', 22, pad.t + ph);
    const step = dur > 600 ? 120 : dur > 120 ? 30 : dur > 30 ? 10 : 2;
    for (let t = 0; t <= dur; t += step) c.fillText(fmtT(t, 0), X(t) - 10, ch - 5);
    // lines
    const line = (key, col, w) => {
      c.strokeStyle = col; c.lineWidth = w; c.beginPath();
      S.forEach((s, i) => {
        const v = key === 'total' ? m.smoothTotal[i] : s[key];
        const gap = i > 0 && s.t - S[i - 1].t > 1.5 / res.fps;
        (i === 0 || gap) ? c.moveTo(X(s.t), Y(v)) : c.lineTo(X(s.t), Y(v));
      });
      c.stroke();
    };
    ['RA', 'LA', 'RL', 'LL'].forEach(k => show[k] && line(k, COLORS[k], 1));
    if (show.total) line('total', COLORS.total, 2);
    // threshold
    c.setLineDash([4, 3]); c.strokeStyle = '#e07a1f'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(pad.l, Y(m.thr)); c.lineTo(pad.l + pw, Y(m.thr)); c.stroke(); c.setLineDash([]);
    // playhead
    if (opts.cursor != null) { c.strokeStyle = '#1d2a30'; c.beginPath(); c.moveTo(X(opts.cursor), pad.t); c.lineTo(X(opts.cursor), pad.t + ph); c.stroke(); }
    canvas._xToT = (px) => Math.max(0, Math.min(dur, (px - pad.l) / pw * dur));
  }

  function fmtT(t, dp = 1) {
    if (!isFinite(t)) return '0:00';
    const f = 10 ** dp; t = Math.round(t * f) / f;
    const m = Math.floor(t / 60), s = t - m * 60;
    return m + ':' + (s < 10 ? '0' : '') + s.toFixed(dp);
  }

  /* Estimate the infant's region from where image change accumulates across the clip. */
  async function autoRoi(video, nSamples = 40) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    const acc = new Float32Array(W * H); let prev = null;
    const oldT = video.currentTime, wasPaused = video.paused; video.pause();
    const dur = video.duration, step = dur / (nSamples + 1);
    for (let i = 1; i <= nSamples; i++) {
      for (const dt of [0, 0.25]) { // pairs of frames 0.25 s apart
        await seek(video, Math.min(dur - 0.05, i * step + dt));
        ctx.drawImage(video, 0, 0, W, H);
        const d = ctx.getImageData(0, 0, W, H).data, g = new Uint8ClampedArray(W * H);
        for (let p = 0, q = 0; p < d.length; p += 4, q++) g[q] = (d[p] * 77 + d[p + 1] * 150 + d[p + 2] * 29) >> 8;
        if (dt > 0 && prev) for (let k = 0; k < g.length; k++) if (Math.abs(g[k] - prev[k]) > 15) acc[k]++;
        prev = g;
      }
    }
    await seek(video, oldT); if (!wasPaused) video.play();
    const xs = [], ys = [];
    const thr = Math.max(2, nSamples * 0.05);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (acc[y * W + x] >= thr) { xs.push(x); ys.push(y); }
    if (xs.length < 30) return null;
    xs.sort((a, b) => a - b); ys.sort((a, b) => a - b);
    const q = (a, f) => a[Math.floor(f * (a.length - 1))];
    let x0 = q(xs, 0.03), x1 = q(xs, 0.97), y0 = q(ys, 0.03), y1 = q(ys, 0.97);
    const px = (x1 - x0) * 0.12 + 3, py = (y1 - y0) * 0.12 + 3;
    x0 = Math.max(0, x0 - px); x1 = Math.min(W, x1 + px); y0 = Math.max(0, y0 - py); y1 = Math.min(H, y1 + py);
    return { x: x0 / W, y: y0 / H, w: (x1 - x0) / W, h: (y1 - y0) / H };
  }

  return { analyse, metrics, draw, autoRoi, LIMBS, COLORS, fmtT };
})();
