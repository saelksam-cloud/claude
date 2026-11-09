// Visuels « à valeur » pour LinkedIn (checklists, comparatifs, process, matrices, chiffres, citations, carrousels).
// Dessinés sur canvas : texte exact et modifiable, export PNG (image) ou PDF (carrousel).
import { drawRich } from '/banner.js';

export const FORMATS = { portrait: { w: 1080, h: 1350, name: 'Portrait 4:5 (recommandé)' }, square: { w: 1080, h: 1080, name: 'Carré' } };
export const VISUAL_TYPES = {
  liste: 'Checklist / étapes',
  comparaison: 'Comparatif (avant / après)',
  process: 'Process / framework',
  matrice: 'Matrice 2 × 2',
  chiffre: 'Chiffre clé (sourcé)',
  citation: 'Citation',
};
export const STYLES = {
  clair: { name: 'Clair', bg: '#FFFFFF', card: '#F4F6F5', text: '#111827', sub: '#5B6470', accent: '#15803D', onAccent: '#FFFFFF' },
  sombre: { name: 'Sombre', bg: '#0F1412', card: '#1B2420', text: '#F2F5F3', sub: '#A7B4AD', accent: '#4CC17C', onAccent: '#0F1412' },
  creme: { name: 'Crème', bg: '#FBF6EA', card: '#F2E9D3', text: '#1F2340', sub: '#6B6249', accent: '#C2410C', onAccent: '#FFFFFF' },
  bleu: { name: 'Bleu nuit', bg: '#0E1A3A', card: '#1A2A55', text: '#FFFFFF', sub: '#B9C6E8', accent: '#FBBF24', onAccent: '#0E1A3A' },
  couleur: { name: 'Fond couleur', bg: '#15803D', card: 'rgba(255,255,255,.12)', text: '#FFFFFF', sub: '#E3F4EA', accent: '#FDE68A', onAccent: '#14532D' },
};

const F = 'Poppins, Montserrat, system-ui, sans-serif';
const lines = (v) => (Array.isArray(v) ? v : String(v || '').split('\n')).map((x) => (typeof x === 'string' ? x.trim() : x)).filter(Boolean);

function rr(ctx, x, y, w, h, r) {
  const k = Math.min(r, h / 2, w / 2);
  ctx.beginPath(); ctx.moveTo(x + k, y);
  ctx.arcTo(x + w, y, x + w, y + h, k); ctx.arcTo(x + w, y + h, x, y + h, k);
  ctx.arcTo(x, y + h, x, y, k); ctx.arcTo(x, y, x + w, y, k); ctx.closePath();
}

// Paragraphe avec retour à la ligne et réduction automatique
function para(ctx, s, x, y, maxW, { size = 30, min = 18, weight = 500, color, maxLines = 4, lh = 1.3, align = 'left' } = {}) {
  const wrap = (sz) => {
    ctx.font = `${weight} ${sz}px ${F}`;
    const out = [];
    for (const raw of String(s || '').split('\n')) {
      let cur = '';
      for (const w of raw.split(/\s+/)) {
        const t = cur ? `${cur} ${w}` : w;
        if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t;
      }
      if (cur) out.push(cur);
    }
    return out;
  };
  let sz = size;
  let ls = wrap(sz);
  while (ls.length > maxLines && sz > min) { sz -= 2; ls = wrap(sz); }
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ls.slice(0, maxLines).forEach((l, i) => ctx.fillText(l, align === 'center' ? x + maxW / 2 : x, y + sz + i * sz * lh));
  ctx.textAlign = 'left';
  return Math.min(ls.length, maxLines) * sz * lh;
}

function title(ctx, s, x, y, maxW, st, size = 64, maxLines = 3) {
  return drawRich(ctx, s, { x, y, maxW, size, minSize: 34, maxLines, color: st.text, accent: st.accent, hlBg: st.accent, hlColor: st.onAccent, lh: 1.12 }).height;
}

function footer(ctx, d, st, { author, page, total }) {
  ctx.fillStyle = st.sub;
  ctx.font = `600 24px ${F}`;
  if (author) ctx.fillText(author, 70, d.h - 52);
  if (total) { ctx.textAlign = 'right'; ctx.fillText(`${page} / ${total}`, d.w - 70, d.h - 52); ctx.textAlign = 'left'; }
  ctx.fillStyle = st.accent;
  ctx.fillRect(70, d.h - 92, 60, 6);
}

function numberBadge(ctx, n, x, y, st, r = 30) {
  ctx.beginPath(); ctx.arc(x + r, y + r, r, 0, 7); ctx.fillStyle = st.accent; ctx.fill();
  ctx.fillStyle = st.onAccent; ctx.font = `800 ${r * 1.05}px ${F}`; ctx.textAlign = 'center';
  ctx.fillText(String(n), x + r, y + r * 1.38); ctx.textAlign = 'left';
}

// ---------- Les types de visuels ----------
const DRAW = {
  liste(ctx, d, st, s) {
    let y = 90;
    y += title(ctx, s.title, 70, y, d.w - 140, st) + 20;
    if (s.subtitle) y += para(ctx, s.subtitle, 70, y, d.w - 140, { size: 30, color: st.sub, maxLines: 2 }) + 20;
    const items = (s.items || []).slice(0, 7);
    const avail = d.h - 150 - y;
    const gap = 18;
    const hItem = Math.min(200, (avail - gap * (items.length - 1)) / Math.max(1, items.length));
    items.forEach((it, i) => {
      const iy = y + i * (hItem + gap);
      rr(ctx, 70, iy, d.w - 140, hItem, 22); ctx.fillStyle = st.card; ctx.fill();
      numberBadge(ctx, i + 1, 96, iy + hItem / 2 - 30, st);
      const t = typeof it === 'string' ? it : it.t;
      const ds = typeof it === 'string' ? '' : it.d;
      const big = hItem > 150 ? 42 : hItem > 110 ? 36 : 30;
      const ty = ds ? iy + hItem / 2 - 6 : iy + hItem / 2 + 14;
      para(ctx, t, 180, ty - big, d.w - 300, { size: big, weight: 700, color: st.text, maxLines: 1, min: 22 });
      if (ds) para(ctx, ds, 180, ty + 6, d.w - 300, { size: Math.round(big * 0.74), color: st.sub, maxLines: 2, min: 18, lh: 1.25 });
    });
  },
  comparaison(ctx, d, st, s) {
    let y = 90;
    y += title(ctx, s.title, 70, y, d.w - 140, st) + 40;
    const colW = (d.w - 140 - 30) / 2;
    const sides = [s.left || {}, s.right || {}];
    sides.forEach((side, k) => {
      const x = 70 + k * (colW + 30);
      rr(ctx, x, y, colW, d.h - y - 150, 26); ctx.fillStyle = k ? st.accent : st.card; ctx.fill();
      const fg = k ? st.onAccent : st.text;
      para(ctx, `${k ? '✓' : '✗'}  ${side.label || (k ? 'Après' : 'Avant')}`, x + 34, y + 30, colW - 68, { size: 40, weight: 800, color: fg, maxLines: 2, min: 26 });
      let iy = y + 150;
      for (const it of lines(side.items).slice(0, 6)) {
        const h = para(ctx, it, x + 34, iy, colW - 68, { size: 36, weight: 600, color: fg, maxLines: 3, min: 22, lh: 1.22 });
        iy += h + 34;
      }
    });
  },
  process(ctx, d, st, s) {
    let y = 90;
    y += title(ctx, s.title, 70, y, d.w - 140, st) + 40;
    const steps = (s.steps || []).slice(0, 5);
    const avail = d.h - 160 - y;
    const h = Math.min(170, (avail - 40 * (steps.length - 1)) / Math.max(1, steps.length));
    steps.forEach((it, i) => {
      const iy = y + i * (h + 40);
      const x = 70 + (i % 2) * 80;
      const w = d.w - 220;
      rr(ctx, x, iy, w, h, 24); ctx.fillStyle = i === steps.length - 1 ? st.accent : st.card; ctx.fill();
      const fg = i === steps.length - 1 ? st.onAccent : st.text;
      ctx.fillStyle = fg; ctx.font = `800 26px ${F}`;
      ctx.fillText(`ÉTAPE ${i + 1}`, x + 30, iy + 44);
      para(ctx, typeof it === 'string' ? it : it.t, x + 30, iy + 52, w - 60, { size: 32, weight: 700, color: fg, maxLines: 1, min: 20 });
      if (it.d) para(ctx, it.d, x + 30, iy + 96, w - 60, { size: 24, color: i === steps.length - 1 ? fg : st.sub, maxLines: Math.max(1, Math.floor((h - 100) / 30)), min: 16, lh: 1.2 });
      if (i < steps.length - 1) {
        ctx.strokeStyle = st.accent; ctx.lineWidth = 5; ctx.lineCap = 'round';
        const ax = 70 + ((i + 1) % 2) * 80 + 60;
        ctx.beginPath(); ctx.moveTo(x + 60, iy + h + 6); ctx.lineTo(ax, iy + h + 34); ctx.stroke();
      }
    });
  },
  matrice(ctx, d, st, s) {
    let y = 90;
    y += title(ctx, s.title, 70, y, d.w - 140, st, 58, 2) + 50;
    const size = Math.min(d.w - 220, d.h - y - 190);
    const x0 = (d.w - size) / 2 + 30;
    const q = s.quadrants || [];
    const half = size / 2;
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([cx, cy], i) => {
      const x = x0 + cx * half + 6;
      const yy = y + cy * half + 6;
      rr(ctx, x, yy, half - 12, half - 12, 20);
      ctx.fillStyle = i === 1 ? st.accent : st.card; ctx.fill();
      const fg = i === 1 ? st.onAccent : st.text;
      const it = q[i] || {};
      const th = para(ctx, it.t || '', x + 24, yy + 18, half - 60, { size: 38, weight: 800, color: fg, maxLines: 2, min: 22 });
      if (it.d) para(ctx, it.d, x + 24, yy + 34 + th, half - 60, { size: 30, color: i === 1 ? fg : st.sub, maxLines: 5, min: 18, lh: 1.25 });
    });
    ctx.fillStyle = st.sub; ctx.font = `700 24px ${F}`;
    ctx.textAlign = 'center'; ctx.fillText(`${s.xAxis || 'Axe horizontal'} →`, x0 + half, y + size + 44); ctx.textAlign = 'left';
    ctx.save(); ctx.translate(x0 - 30, y + half); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText(`${s.yAxis || 'Axe vertical'} →`, 0, 0); ctx.restore();
  },
  chiffre(ctx, d, st, s) {
    let y = 110;
    y += title(ctx, s.title, 70, y, d.w - 140, st, 56, 3) + 60;
    ctx.fillStyle = st.accent;
    let sz = 230;
    ctx.font = `800 ${sz}px ${F}`;
    while (ctx.measureText(s.value || '').width > d.w - 140 && sz > 80) { sz -= 10; ctx.font = `800 ${sz}px ${F}`; }
    ctx.fillText(s.value || '[À COMPLÉTER]', 70, y + sz * 0.85);
    y += sz + 30;
    y += para(ctx, s.label, 70, y, d.w - 140, { size: 40, weight: 700, color: st.text, maxLines: 3 }) + 30;
    para(ctx, s.source ? `Source : ${s.source}` : 'Source : [À COMPLÉTER : source vérifiable]', 70, d.h - 190, d.w - 140, { size: 22, color: st.sub, maxLines: 2 });
  },
  citation(ctx, d, st, s) {
    ctx.fillStyle = st.accent; ctx.font = `800 260px Georgia, serif`;
    ctx.fillText('“', 50, 330);
    const h = drawRich(ctx, s.quote || '', { x: 80, y: 300, maxW: d.w - 160, size: 60, minSize: 30, maxLines: 7, weight: 700, color: st.text, accent: st.accent, hlBg: st.accent, hlColor: st.onAccent, lh: 1.2 }).height;
    para(ctx, `— ${s.author || ''}`, 80, 300 + h + 40, d.w - 160, { size: 32, weight: 600, color: st.sub, maxLines: 1 });
  },
};

// Diapositive de carrousel : couverture, contenu (titre ≤ 6 mots, texte ≤ 20 mots), fin.
function drawSlide(ctx, d, st, sl, meta) {
  if (sl.kind === 'cover') {
    ctx.fillStyle = st.accent; ctx.fillRect(0, 0, 18, d.h);
    const h = title(ctx, sl.title, 80, d.h * 0.24, d.w - 160, st, 84, 4);
    if (sl.subtitle) para(ctx, sl.subtitle, 80, d.h * 0.24 + h + 40, d.w - 160, { size: 36, color: st.sub, maxLines: 3 });
    ctx.fillStyle = st.accent; ctx.font = `700 30px ${F}`; ctx.fillText('Faites glisser  →', 80, d.h - 150);
  } else if (sl.kind === 'end') {
    const h = title(ctx, sl.title, 80, d.h * 0.3, d.w - 160, st, 70, 3);
    if (sl.text) para(ctx, sl.text, 80, d.h * 0.3 + h + 40, d.w - 160, { size: 34, color: st.sub, maxLines: 5 });
  } else {
    numberBadge(ctx, meta.page - 1, 80, 100, st, 38);
    const h = title(ctx, sl.title, 80, 210, d.w - 160, st, 66, 2);
    let y = 210 + h + 40;
    if (sl.text) y += para(ctx, sl.text, 80, y, d.w - 160, { size: 38, color: st.sub, maxLines: 5, lh: 1.35 }) + 40;
    for (const it of lines(sl.items).slice(0, 5)) {
      rr(ctx, 80, y, d.w - 160, 120, 22); ctx.fillStyle = st.card; ctx.fill();
      para(ctx, it, 112, y + 22, d.w - 224, { size: 36, weight: 600, color: st.text, maxLines: 2, min: 22, lh: 1.15 });
      y += 142;
    }
  }
  footer(ctx, d, st, meta);
}

export async function renderVisual(canvas, v, slideIndex = 0) {
  await Promise.all(['800 40px Poppins', '700 40px Poppins', '600 40px Poppins', '500 40px Poppins'].map((f) => document.fonts?.load(f).catch(() => {})));
  const d = FORMATS[v.format] || FORMATS.portrait;
  const st = { ...(STYLES[v.style?.preset] || STYLES.clair) };
  if (v.style?.accent) st.accent = v.style.accent;
  canvas.width = d.w; canvas.height = d.h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = st.bg; ctx.fillRect(0, 0, d.w, d.h);
  const author = v.author || '';
  if (v.kind === 'carousel') {
    const slides = v.spec?.slides || [];
    drawSlide(ctx, d, st, slides[slideIndex] || { kind: 'cover', title: '' }, { author, page: slideIndex + 1, total: slides.length });
  } else {
    (DRAW[v.spec?.type] || DRAW.liste)(ctx, d, st, v.spec || {});
    footer(ctx, d, st, { author });
  }
}

export const slideCount = (v) => (v.kind === 'carousel' ? (v.spec?.slides || []).length : 1);

// ---------- PDF minimal (une image JPEG pleine page par diapositive), sans dépendance externe ----------
export function jpegsToPdf(jpegDataUrls, w, h) {
  const enc = new TextEncoder();
  const parts = [];
  const offsets = [];
  let size = 0;
  const push = (chunk) => { const b = typeof chunk === 'string' ? enc.encode(chunk) : chunk; parts.push(b); size += b.length; };
  const obj = (n, body) => { offsets[n] = size; push(`${n} 0 obj\n`); body(); push('\nendobj\n'); };
  const imgs = jpegDataUrls.map((d) => Uint8Array.from(atob(d.split(',')[1]), (c) => c.charCodeAt(0)));
  const n = imgs.length;
  // Objets : 1 catalogue, 2 pages, puis pour chaque diapo : page, contenu, image
  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  obj(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'));
  const kids = imgs.map((_, i) => `${3 + i * 3} 0 R`).join(' ');
  obj(2, () => push(`<< /Type /Pages /Kids [${kids}] /Count ${n} >>`));
  imgs.forEach((img, i) => {
    const p = 3 + i * 3;
    obj(p, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im${i} ${p + 2} 0 R >> >> /Contents ${p + 1} 0 R >>`));
    const content = `q ${w} 0 0 ${h} 0 0 cm /Im${i} Do Q`;
    obj(p + 1, () => push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
    obj(p + 2, () => { push(`<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.length} >>\nstream\n`); push(img); push('\nendstream'); });
  });
  const xref = size;
  const total = 3 + n * 3;
  push(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for (let i = 1; i < total; i++) push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  push(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  const out = new Uint8Array(size);
  let o = 0;
  for (const b of parts) { out.set(b, o); o += b.length; }
  let bin = '';
  for (let i = 0; i < out.length; i += 0x8000) bin += String.fromCharCode(...out.subarray(i, i + 0x8000));
  return `data:application/pdf;base64,${btoa(bin)}`;
}
