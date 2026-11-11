// Éditeur de bannières façon Canva : clic pour sélectionner, glisser pour déplacer, poignée pour agrandir,
// panneau de propriétés, ajout d'éléments, annuler / rétablir, raccourcis clavier, repères de centrage.
import * as B from '/banner.js';

const history = { past: [], future: [] };
let state = null; // { banner, sel, root, onChange, boxes, drag }
let keyHandler = null;

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const snap = () => JSON.stringify({ elements: state.banner.elements, style: state.banner.style });
const selected = () => state.banner.elements.find((e) => e.id === state.sel);

function commit() {
  history.past.push(state.before ?? snap());
  if (history.past.length > 60) history.past.shift();
  history.future = [];
  state.before = null;
  state.onChange?.();
}
function begin() { if (state.before == null) state.before = snap(); }
function restore(json) { const o = JSON.parse(json); state.banner.elements = o.elements; state.banner.style = o.style; if (!selected()) state.sel = null; }
export function undo() { if (!history.past.length) return; history.future.push(snap()); restore(history.past.pop()); redraw(true); state.onChange?.(); }
export function redo() { if (!history.future.length) return; history.past.push(snap()); restore(history.future.pop()); redraw(true); state.onChange?.(); }
export function resetHistory() { history.past = []; history.future = []; }

let raf = 0;
// Couleur moyenne du fond juste autour d'un élément (lue sur la bannière dessinée), pour cacher un ancien texte.
function sampleAround(el) {
  const canvas = state.root.querySelector('#bannerCanvas');
  const ctx = canvas?.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '';
  const w = el.w || 200; const h = el.h || 80; const m = 6;
  const pts = [[el.x - m, el.y + h / 2], [el.x + w + m, el.y + h / 2], [el.x + w / 2, el.y - m], [el.x + w / 2, el.y + h + m], [el.x - m, el.y - m], [el.x + w + m, el.y + h + m]]
    .filter(([x, y]) => x >= 0 && y >= 0 && x < canvas.width && y < canvas.height);
  if (!pts.length) return '';
  const acc = [0, 0, 0];
  for (const [x, y] of pts) { const d = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data; acc[0] += d[0]; acc[1] += d[1]; acc[2] += d[2]; }
  return '#' + acc.map((v) => Math.round(v / pts.length).toString(16).padStart(2, '0')).join('');
}
export function redraw(withPanel = false) {
  if (!state) return;
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(async () => {
    const canvas = state.root.querySelector('#bannerCanvas');
    if (!canvas) return;
    state.boxes = await B.renderElements(canvas, state.banner, { overlay: state.overlay });
    drawOverlay();
    if (withPanel) renderPanel();
  });
}

function drawOverlay() {
  const ov = state.root.querySelector('.be-overlay');
  if (!ov) return;
  const pct = (v, total) => `${(v / total) * 100}%`;
  ov.innerHTML = state.banner.elements.filter((e) => !e.hidden && state.boxes[e.id]).map((e) => {
    const b = state.boxes[e.id];
    const on = e.id === state.sel;
    return `<div class="be-box ${on ? 'on' : ''} ${e.locked ? 'locked' : ''}" data-el="${e.id}" style="left:${pct(b.x, B.W)};top:${pct(b.y, B.H)};width:${pct(b.w, B.W)};height:${pct(b.h, B.H)};transform:rotate(${b.rot}deg)" title="${esc(e.type === 'text' ? e.text.slice(0, 40) : e.type)}">${on && !e.locked ? '<span class="be-handle" data-handle="1"></span>' : ''}</div>`;
  }).join('') + (state.guideX ? '<div class="be-guide v"></div>' : '') + (state.guideY ? '<div class="be-guide h"></div>' : '');
}

const COLORS = ['#FFFFFF', '#111111', '#15803D', '#2FBF71', '#123C73', '#B3172C', '#FF4D5E', '#C9A227', '#F59AC8', '#8E4A35'];
function swatches(prop, val) {
  return `<div class="be-swatches">${COLORS.map((c) => `<button type="button" class="be-sw ${val === c ? 'on' : ''}" style="background:${c}" data-be-set="${prop}" data-val="${c}" aria-label="${c}"></button>`).join('')}<input type="color" data-be-prop="${prop}" value="${/^#[0-9a-f]{6}$/i.test(val || '') ? val : '#000000'}"></div>`;
}

function renderPanel() {
  const panel = state.root.querySelector('.be-panel');
  if (!panel) return;
  const el = selected();
  if (!el) {
    panel.innerHTML = `<div class="small be-help"><b>Clique sur un élément</b> de la bannière pour le modifier, ou glisse-le pour le déplacer. La poignée en bas à droite l'agrandit.<br><br>Raccourcis : <kbd>Suppr</kbd> supprimer · <kbd>Ctrl+D</kbd> dupliquer · <kbd>Ctrl+Z</kbd> annuler · flèches pour déplacer (<kbd>Maj</kbd> = 10 px).</div>`;
    return;
  }
  const common = `<div class="row be-actions">
      <button type="button" class="btn sm" data-be="dup" title="Dupliquer (Ctrl+D)">⧉ Dupliquer</button>
      <button type="button" class="btn sm" data-be="front" title="Premier plan">⬆ Devant</button>
      <button type="button" class="btn sm" data-be="back" title="Arrière-plan">⬇ Derrière</button>
      <button type="button" class="btn sm" data-be="lock">${el.locked ? '🔓 Déverrouiller' : '🔒 Verrouiller'}</button>
      <button type="button" class="btn sm danger" data-be="del" title="Supprimer (Suppr)">🗑</button>
    </div>
    <label class="f">Rotation <input type="range" min="-30" max="30" step="1" data-be-prop="rot" value="${el.rot || 0}"></label>`;
  if (el.type === 'text') {
    panel.innerHTML = `<h4 class="be-title">Texte${el.role ? ` · <span class="small">${esc(el.role)}</span>` : ''}</h4>
      <label class="f">Contenu <span class="small">(*mot* couleur · [[mot]] surligné · __mot__ souligné)</span><textarea rows="3" data-be-prop="text">${esc(el.text)}</textarea></label>
      <div class="grid2">
        <label class="f">Taille <input type="range" min="12" max="140" data-be-prop="size" value="${el.size || 32}"></label>
        <label class="f">Police <select data-be-prop="font"><option value="poppins" ${!el.font || el.font === 'poppins' ? 'selected' : ''}>Poppins</option><option value="caveat" ${el.font === 'caveat' ? 'selected' : ''}>Manuscrite</option><option value="serif" ${el.font === 'serif' ? 'selected' : ''}>Serif</option></select></label>
        <label class="f">Graisse <select data-be-prop="weight">${[400, 500, 600, 700, 800].map((w) => `<option ${Number(el.weight || 700) === w ? 'selected' : ''}>${w}</option>`).join('')}</select></label>
        <label class="f">Largeur max <input type="range" min="0" max="1500" step="10" data-be-prop="maxW" value="${el.maxW || 0}"></label>
      </div>
      <div class="row"><span class="small">Aligner :</span>${['left', 'center', 'right'].map((a) => `<button type="button" class="btn sm ${(el.align || 'left') === a ? 'soft' : 'ghost'}" data-be-set="align" data-val="${a}">${{ left: '⇤', center: '↔', right: '⇥' }[a]}</button>`).join('')}
        <label class="small"><input type="checkbox" data-be-check="upper" ${el.upper ? 'checked' : ''}> MAJUSCULES</label></div>
      <div class="f">Couleur du texte ${swatches('color', el.color)}</div>
      <div class="f">Couleur des *mots clés* ${swatches('accent', el.accent)}</div>
      <div class="f"><label class="small"><input type="checkbox" data-be-check="bgOn" ${el.bg ? 'checked' : ''}> Fond (pastille / bloc)</label>${el.bg ? swatches('bg', el.bg) + `<label class="f">Arrondi <input type="range" min="0" max="60" data-be-prop="radius" value="${el.radius ?? 60}"></label>` : ''}</div>
      ${common}`;
  } else if (el.type === 'image') {
    panel.innerHTML = `<h4 class="be-title">Image${el.role ? ` · <span class="small">${esc(el.role)}</span>` : ''}</h4>
      <label class="f">Largeur <input type="range" min="20" max="900" data-be-prop="w" value="${Math.round(el.w || 120)}"></label>
      <div class="row"><label class="small"><input type="checkbox" data-be-check="round" ${el.round ? 'checked' : ''}> Ronde (photo)</label>
      <label class="small"><input type="checkbox" data-be-check="white" ${el.white ? 'checked' : ''}> Logo en blanc</label></div>
      <label class="btn sm">↺ Remplacer l'image<input type="file" accept="image/*" data-be-file="replace" hidden></label>
      ${common}`;
  } else if (el.type === 'arrow') {
    panel.innerHTML = `<h4 class="be-title">Flèche</h4>
      <div class="row">${[['curve', '⤵ Courbe'], ['down', '⬇ Bas'], ['right', '➜ Droite']].map(([k, l]) => `<button type="button" class="btn sm ${el.kind === k ? 'soft' : 'ghost'}" data-be-set="kind" data-val="${k}">${l}</button>`).join('')}</div>
      <label class="f">Taille <input type="range" min="20" max="400" data-be-prop="w" value="${Math.round(el.w || 80)}"></label>
      <label class="f">Épaisseur <input type="range" min="1" max="12" data-be-prop="width" value="${el.width || 3}"></label>
      <div class="f">Couleur ${swatches('color', el.color)}</div>${common}`;
  } else {
    panel.innerHTML = `<h4 class="be-title">Forme</h4>
      <div class="row">${[['rect', '▭ Rectangle'], ['circle', '◯ Cercle'], ['line', '― Trait']].map(([k, l]) => `<button type="button" class="btn sm ${(el.kind || 'rect') === k ? 'soft' : 'ghost'}" data-be-set="kind" data-val="${k}">${l}</button>`).join('')}</div>
      <div class="grid2"><label class="f">Largeur <input type="range" min="10" max="1584" data-be-prop="w" value="${Math.round(el.w || 200)}"></label>
      <label class="f">Hauteur <input type="range" min="2" max="396" data-be-prop="h" value="${Math.round(el.h || 80)}"></label></div>
      <label class="f">Arrondi <input type="range" min="0" max="80" data-be-prop="radius" value="${el.radius ?? 16}"></label>
      <label class="f">Opacité <input type="range" min="0.1" max="1" step="0.05" data-be-prop="opacity" value="${el.opacity ?? 1}"></label>
      <div class="f">Couleur ${swatches('fill', el.fill)}</div>
      <button type="button" class="btn sm" data-be="pick" title="Prend la couleur du fond autour de la forme : pratique pour cacher un ancien texte">🎯 Couleur du fond autour (cache)</button>${common}`;
  }
}

function setProp(prop, raw, { live = false } = {}) {
  const el = selected();
  if (!el) return;
  begin();
  const num = ['size', 'weight', 'maxW', 'rot', 'w', 'h', 'radius', 'opacity', 'width'];
  let v = num.includes(prop) ? Number(raw) : raw;
  if (prop === 'maxW' && !v) v = undefined;
  if (prop === 'w' && el.type === 'image' && el.w && el.h) el.h = (el.h / el.w) * v; // garde les proportions
  if (prop === 'w' && el.type === 'arrow' && el.w && el.h) el.h = (el.h / el.w) * v;
  el[prop] = v;
  if (!live) commit();
  redraw(!live && prop !== 'text');
}

function addElement(el) {
  begin();
  state.banner.elements.push(el);
  state.sel = el.id;
  commit();
  redraw(true);
}

function readImage(file, max = 600, type = 'image/png') {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(img.src);
      resolve({ src: cv.toDataURL(type, 0.9), w: cv.width, h: cv.height });
    };
    img.onerror = () => reject(new Error(`Image illisible : ${file.name}`));
    img.src = URL.createObjectURL(file);
  });
}

function toBannerCoords(ev) {
  const r = state.root.querySelector('.be-overlay').getBoundingClientRect();
  return { x: ((ev.clientX - r.left) / r.width) * B.W, y: ((ev.clientY - r.top) / r.height) * B.H, scale: B.W / r.width };
}

export function mountEditor(root, banner, { onChange, overlay = true } = {}) {
  state = { banner, sel: state?.banner === banner ? state.sel : null, root, onChange, boxes: {}, overlay, before: null };
  if (!Array.isArray(banner.elements)) banner.elements = [];

  // Sélection, déplacement et redimensionnement à la souris (ou au doigt)
  const ov = root.querySelector('.be-overlay');
  ov.addEventListener('pointerdown', (ev) => {
    // une saisie en cours dans le panneau devient une étape d'annulation à part
    if (root.contains(document.activeElement) && document.activeElement !== document.body) document.activeElement.blur();
    if (state.before != null && !state.drag) commit();
    const box = ev.target.closest('[data-el]');
    if (!box) { state.sel = null; drawOverlay(); renderPanel(); return; }
    const el = state.banner.elements.find((e) => e.id === box.dataset.el);
    state.sel = el.id;
    if (el.locked) { drawOverlay(); renderPanel(); return; }
    ev.preventDefault();
    ov.setPointerCapture(ev.pointerId);
    const start = toBannerCoords(ev);
    const b = state.boxes[el.id] || { w: 100, h: 50 };
    state.drag = { mode: ev.target.dataset.handle ? 'resize' : 'move', start, orig: { x: el.x, y: el.y, size: el.size, w: el.w || b.w, h: el.h || b.h, maxW: el.maxW }, bw: b.w, bh: b.h };
    begin();
    drawOverlay(); renderPanel();
  });
  ov.addEventListener('pointermove', (ev) => {
    const d = state.drag;
    if (!d) return;
    const el = selected();
    const pt = toBannerCoords(ev);
    const dx = pt.x - d.start.x; const dy = pt.y - d.start.y;
    if (d.mode === 'move') {
      let nx = Math.round(d.orig.x + dx); let ny = Math.round(d.orig.y + dy);
      // repères : centre de la bannière
      const cx = nx + d.bw / 2; const cy = ny + d.bh / 2;
      state.guideX = Math.abs(cx - B.W / 2) < 8; state.guideY = Math.abs(cy - B.H / 2) < 6;
      if (state.guideX) nx = Math.round(B.W / 2 - d.bw / 2);
      if (state.guideY) ny = Math.round(B.H / 2 - d.bh / 2);
      el.x = nx; el.y = ny;
    } else {
      const k = Math.max(0.15, (d.bw + dx) / d.bw);
      if (el.type === 'text') { el.size = Math.max(10, Math.round(d.orig.size * k)); if (d.orig.maxW) el.maxW = Math.round(d.orig.maxW * k); }
      else if (el.type === 'shape') { el.w = Math.max(4, Math.round(d.orig.w + dx)); el.h = Math.max(2, Math.round(d.orig.h + dy)); }
      else { el.w = Math.max(10, Math.round(d.orig.w * k)); el.h = Math.max(10, Math.round(d.orig.h * k)); }
    }
    redraw();
  });
  const end = () => {
    if (!state.drag) return;
    const el = selected();
    const moved = el && (el.x !== state.drag.orig.x || el.y !== state.drag.orig.y || el.size !== state.drag.orig.size || el.w !== state.drag.orig.w);
    state.drag = null; state.guideX = state.guideY = false;
    if (moved) commit(); else state.before = null;
    redraw(true);
  };
  ov.addEventListener('pointerup', end);
  ov.addEventListener('pointercancel', end);
  ov.addEventListener('dblclick', (ev) => { if (ev.target.closest('[data-el]')) root.querySelector('.be-panel [data-be-prop="text"]')?.focus(); });

  // Panneau et barre d'outils
  root.addEventListener('click', async (ev) => {
    const t = ev.target.closest('[data-be],[data-be-set],[data-be-add]');
    if (!t) return;
    ev.preventDefault();
    const el = selected();
    if (t.dataset.beSet) { setProp(t.dataset.beSet, t.dataset.val); return; }
    const a = t.dataset.be || t.dataset.beAdd;
    const p = B.PRESETS[state.banner.style?.preset] || B.PRESETS.mint;
    if (a === 'undo') return undo();
    if (a === 'redo') return redo();
    if (a === 'text') return addElement({ id: B.uid(), type: 'text', text: 'Nouveau texte', x: 640, y: 160, size: 40, weight: 700, color: p.text });
    if (a === 'pill') return addElement({ id: B.uid(), type: 'text', text: 'Pastille', x: 640, y: 160, size: 24, weight: 700, color: p.accent, bg: '#FFFFFF' });
    if (a === 'arrow') return addElement({ id: B.uid(), type: 'arrow', kind: 'curve', x: 700, y: 150, w: 70, h: 64, color: p.accent, width: 3 });
    if (a === 'shape') return addElement({ id: B.uid(), type: 'shape', kind: 'rect', x: 600, y: 140, w: 300, h: 90, fill: p.accent, radius: 16 });
    if (a === 'cover') { const c = { id: B.uid(), type: 'shape', kind: 'rect', role: 'cover', x: 560, y: 130, w: 360, h: 90, fill: '#FFFFFF', radius: 4 }; addElement(c); c.fill = sampleAround(c) || c.fill; redraw(true); return; }
    if (a === 'emoji') return addElement({ id: B.uid(), type: 'text', text: t.dataset.val || '🔔', x: 760, y: 160, size: 40, weight: 400, color: p.text });
    if (!el) return;
    if (a === 'pick') { const col = sampleAround(el); if (col) { begin(); el.fill = col; commit(); redraw(true); } return; }
    if (a === 'del') { begin(); state.banner.elements = state.banner.elements.filter((e) => e.id !== el.id); state.sel = null; commit(); redraw(true); }
    if (a === 'dup') { const c = { ...JSON.parse(JSON.stringify(el)), id: B.uid(), x: el.x + 24, y: el.y + 24, role: undefined }; addElement(c); }
    if (a === 'front' || a === 'back') { begin(); const arr = state.banner.elements.filter((e) => e.id !== el.id); if (a === 'front') arr.push(el); else arr.unshift(el); state.banner.elements = arr; commit(); redraw(true); }
    if (a === 'lock') { begin(); el.locked = !el.locked; commit(); redraw(true); }
  });
  root.addEventListener('input', (ev) => {
    const t = ev.target;
    if (t.dataset.beProp) setProp(t.dataset.beProp, t.value, { live: true });
  });
  root.addEventListener('change', async (ev) => {
    const t = ev.target;
    if (t.dataset.beProp) { if (state.before != null) commit(); if (t.dataset.beProp !== 'text') renderPanel(); return; }
    if (t.dataset.beCheck) {
      const el = selected(); if (!el) return;
      begin();
      if (t.dataset.beCheck === 'bgOn') el.bg = t.checked ? (el.bg || '#FFFFFF') : undefined;
      else el[t.dataset.beCheck] = t.checked;
      if (t.dataset.beCheck === 'round' && t.checked) { const s = Math.min(el.w, el.h); el.w = s; el.h = s; el.ring = '#FFFFFF'; }
      commit(); redraw(true);
      return;
    }
    if (t.dataset.beFile && t.files[0]) {
      const kind = t.dataset.beFile;
      const p = B.PRESETS[state.banner.style?.preset] || B.PRESETS.mint;
      if (kind === 'bg') { const im = await readImage(t.files[0], 1600, 'image/jpeg'); begin(); state.banner.style = { ...state.banner.style, bgImage: im.src }; commit(); redraw(true); t.value = ''; return; }
      if (kind === 'replace') { const el = selected(); const im = await readImage(t.files[0], el?.round ? 240 : 600); begin(); el.src = im.src; if (!el.round) el.h = (im.h / im.w) * (el.w || 120); commit(); redraw(true); t.value = ''; return; }
      let x = 60; let i = 0;
      for (const f of [...t.files]) {
        const round = kind === 'avatar';
        const im = await readImage(f, round ? 240 : 600, round ? 'image/jpeg' : 'image/png');
        const w = round ? 46 : Math.min(150, (im.w / im.h) * 40);
        addElement({ id: B.uid(), type: 'image', role: kind, src: im.src, x: x + i * (round ? 32 : w + 20), y: round ? 40 : 110, w, h: round ? 46 : (im.h / im.w) * w, round, ring: round ? '#FFFFFF' : undefined, white: kind === 'logo' && p.dark });
        i++;
      }
      t.value = '';
    }
  });

  // Raccourcis clavier (hors saisie de texte)
  if (keyHandler) document.removeEventListener('keydown', keyHandler);
  keyHandler = (ev) => {
    if (!document.body.contains(root)) return;
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    const mod = ev.ctrlKey || ev.metaKey;
    if (mod && ev.key.toLowerCase() === 'z' && !typing) { ev.preventDefault(); if (ev.shiftKey) redo(); else undo(); return; }
    if (mod && ev.key.toLowerCase() === 'y' && !typing) { ev.preventDefault(); redo(); return; }
    const el = selected();
    if (!el || typing) return;
    if (mod && ev.key.toLowerCase() === 'd') { ev.preventDefault(); root.querySelector('[data-be="dup"]')?.click(); return; }
    if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); root.querySelector('[data-be="del"]')?.click(); return; }
    const step = ev.shiftKey ? 10 : 1;
    const mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[ev.key];
    if (mv && !el.locked) { ev.preventDefault(); begin(); el.x += mv[0]; el.y += mv[1]; commit(); redraw(); }
    if (ev.key === 'Escape') { state.sel = null; drawOverlay(); renderPanel(); }
  };
  document.addEventListener('keydown', keyHandler);

  redraw(true);
}

export function setOverlay(on) { if (state) { state.overlay = on; redraw(); } }
export function select(id) { if (state) { state.sel = id; redraw(true); } }

// Modification groupée (annulable d'un coup avec Ctrl+Z).
export function mutate(fn) { if (!state) return; begin(); fn(state.banner); commit(); redraw(true); }
