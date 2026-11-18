/* Local storage helpers: localStorage for small JSON, IndexedDB for video blobs. */
const Store = {
  get(key, fallback) {
    try { const v = localStorage.getItem('gma.' + key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem('gma.' + key, JSON.stringify(val)); return true; }
    catch (e) { toast('Could not save — browser storage full or blocked'); return false; }
  },
  remove(key) { try { localStorage.removeItem('gma.' + key); } catch (e) {} }
};

const ClipDB = (() => {
  let dbp = null;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open('gma-assist', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('clips', { keyPath: 'id' });
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  async function tx(mode, fn) {
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction('clips', mode);
      const s = t.objectStore('clips');
      const out = fn(s);
      t.oncomplete = () => res(out && out.result !== undefined ? out.result : out);
      t.onerror = () => rej(t.error);
    });
  }
  return {
    all: () => tx('readonly', s => s.getAll()),
    put: (c) => tx('readwrite', s => s.put(c)),
    del: (id) => tx('readwrite', s => s.delete(id)),
    clear: () => tx('readwrite', s => s.clear())
  };
})();

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function download(name, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function toCsv(rows) {
  return rows.map(r => r.map(v => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(',')).join('\n');
}

function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
