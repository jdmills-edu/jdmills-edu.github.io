// Project index: filters, search, lightbox, theme. No dependencies.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const cards = $$('.card');
  const q = $('#q');
  const sel = {};   // one Set per chip group (category/status on projects, topic on use cases)
  for (const b of $$('.chips button')) sel[b.dataset.filter] = sel[b.dataset.filter] || new Set();
  const noun = document.querySelector('.uc') ? 'use cases' : 'projects';

  function apply() {
    const terms = (q.value || '').toLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const c of cards) {
      const ok = Object.entries(sel).every(([k, set]) => !set.size || set.has(c.dataset[k])) &&
                 terms.every(t => c.dataset.search.includes(t));
      c.hidden = !ok;
      if (ok) shown++;
    }
    for (const s of $$('.cat-section')) s.hidden = !$$('.card', s).some(c => !c.hidden);
    const filtered = terms.length || Object.values(sel).some(set => set.size);
    $('#result').textContent = filtered ? `${shown} of ${cards.length} ${noun}` : '';
    $('#empty').hidden = shown > 0;
  }
  for (const b of $$('.chips button')) {
    b.addEventListener('click', () => {
      const set = sel[b.dataset.filter];
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      on ? set.add(b.dataset.value) : set.delete(b.dataset.value);
      apply();
    });
  }
  q.addEventListener('input', apply);

  // lightbox
  const dlg = $('#lightbox'), img = $('#lb-img'), cap = $('#lb-cap'), pos = $('#lb-pos');
  let gallery = [], idx = 0;
  function show(i) {
    idx = (i + gallery.length) % gallery.length;
    const g = gallery[idx];
    img.src = g.src; img.alt = g.caption || ''; img.width = g.w; img.height = g.h;
    cap.textContent = g.caption || '';
    pos.textContent = gallery.length > 1 ? `${idx + 1} / ${gallery.length}` : '';
    $('#lb-prev').hidden = $('#lb-next').hidden = gallery.length < 2;
  }
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-gallery]');
    if (!t) return;
    try { gallery = JSON.parse(t.dataset.gallery); } catch { return; }
    if (!gallery.length) return;
    show(+(t.dataset.index || 0));
    dlg.showModal();
  });
  $('#lb-prev').addEventListener('click', () => show(idx - 1));
  $('#lb-next').addEventListener('click', () => show(idx + 1));
  $('#lb-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  // theme
  $('#theme').addEventListener('click', () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('pi-theme', root.dataset.theme); } catch {}
  });
})();
