// Moteur de bannières LinkedIn (1584 × 396) dessinées sur canvas : textes exacts, calques modifiables, export PNG.
// Taille du dessin : 1584 × 396 pour une bannière, ou une autre taille (visuel 1024 × 1536) quand l'éditeur sert aux visuels.
export let W = 1584;
export let H = 396;
export function setSize(w = 1584, h = 396) { W = w; H = h; }

// ---------- Fonds (couleurs + motif) ----------
export const PRESETS = {
  mint: { name: 'Menthe claire', bg: ['#F4FAF6', '#E3F2E9'], text: '#121A16', sub: '#4A5A50', dark: false, pattern: 'hex', accent: '#2FBF71', bar: '#16221B' },
  mountain: { name: 'Bleu montagne', bg: ['#E3EEF8', '#9FBDDD'], text: '#0E2A4A', sub: '#34507A', dark: false, pattern: 'mountains', accent: '#123C73', bar: '#123C73' },
  crimson: { name: 'Rouge profond', bg: ['#14070C', '#5E0C1B', '#B3172C'], text: '#FFFFFF', sub: '#F2D6DA', dark: true, pattern: 'waves', accent: '#FF4D5E', bar: '#0E0408' },
  gold: { name: 'Noir doré', bg: ['#111111', '#2B2B2B'], text: '#FFFFFF', sub: '#D9D2B8', dark: true, pattern: 'hex', accent: '#C9A227', bar: '#C9A227' },
  sky: { name: 'Bleu ciel', bg: ['#C7DAFB', '#9FBDF4'], text: '#FFFFFF', sub: '#1D2F5C', dark: false, pattern: 'waves', accent: '#B3203A', bar: '#173C7A' },
  rose: { name: 'Rose poudré', bg: ['#F7DDD7', '#D7A598'], text: '#FFFFFF', sub: '#7A3E2F', dark: false, pattern: 'diag', accent: '#8E4A35', bar: '#8E4A35' },
  cream: { name: 'Crème', bg: ['#FBF6E8', '#EFE3C6'], text: '#1C1F7A', sub: '#8A6D1E', dark: false, pattern: 'none', accent: '#C9A227', bar: '#1C1F7A' },
  slate: { name: 'Ardoise → rouge', bg: ['#0B0B0B', '#7A7A7A', '#C44B4B'], text: '#FFFFFF', sub: '#EDEDED', dark: true, pattern: 'dots', accent: '#FF2E2E', bar: '#0B0B0B', horizontal: true },
  pink: { name: 'Rose vif', bg: ['#F59AC8', '#F8B3D7'], text: '#FFFFFF', sub: '#5C0B33', dark: false, pattern: 'circles', accent: '#5C0B33', bar: '#5C0B33' },
};

// ---------- Modèles (mises en page) ----------
export const TEMPLATES = [
  { id: 'promesse', name: 'Promesse + étapes', preset: 'crimson', hint: 'Grosse promesse à droite, preuve et logos à gauche, étapes et bouton.' },
  { id: 'metier', name: 'Métier en bloc', preset: 'mountain', hint: 'Le métier en très gros dans un bloc, pastilles de compétences, bulles.' },
  { id: 'logos', name: 'Promesse + « Apparu chez »', preset: 'mint', hint: 'Marque et preuve à gauche, promesse soulignée, barre de logos.' },
  { id: 'marqueur', name: 'Surligneur', preset: 'slate', hint: 'Promesse sur bandes de couleur, logos « Déjà collaboré avec ».' },
  { id: 'impact', name: 'Majuscules impact', preset: 'cream', hint: 'Deux lignes en majuscules, sous-titre surligné, bouton.' },
];

export const DEFAULT_FIELDS = {
  brand: 'LINK*MOTION*',
  proof: '+50 dirigeants accompagnés',
  title: 'Ghostwriter',
  headline: "J'écris vos posts LinkedIn\npour attirer vos *clients idéaux*",
  subline: 'Stratégie, rédaction et publication clé en main',
  steps: 'Stratégie, Rédaction, Publication',
  pills: 'LinkedIn, Ghostwriting, Personal branding',
  cta: 'Prends ton RDV en sélection',
  bubble: 'Comme eux, contactez-moi !',
  followText: 'Je partage mes conseils chaque semaine',
  logosTitle: 'Ils me font confiance :',
};

// ---------- Outils de dessin ----------
const FONT = 'Poppins, Montserrat, system-ui, sans-serif';
const HAND = 'Caveat, "Comic Sans MS", cursive';
const list = (v) => String(v || '').split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);

function rr(ctx, x, y, w, h, r) {
  const k = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + k, y);
  ctx.arcTo(x + w, y, x + w, y + h, k);
  ctx.arcTo(x + w, y + h, x, y + h, k);
  ctx.arcTo(x, y + h, x, y, k);
  ctx.arcTo(x, y, x + w, y, k);
  ctx.closePath();
}

function background(ctx, p) {
  const g = p.horizontal ? ctx.createLinearGradient(0, 0, W, 0) : ctx.createLinearGradient(0, 0, W, H);
  p.bg.forEach((c, i) => g.addColorStop(p.bg.length === 1 ? 0 : i / (p.bg.length - 1), c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.globalAlpha = p.dark ? 0.07 : 0.06;
  ctx.strokeStyle = p.dark ? '#FFFFFF' : '#000000';
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = 1.5;
  if (p.pattern === 'hex') {
    const s = 34;
    for (let y = -s; y < H + s; y += s * 1.5) for (let x = -s; x < W + s; x += s * Math.sqrt(3)) {
      const ox = (Math.round(y / (s * 1.5)) % 2) * (s * Math.sqrt(3)) / 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i + Math.PI / 6; ctx.lineTo(x + ox + s * Math.cos(a), y + s * Math.sin(a)); }
      ctx.closePath(); ctx.stroke();
    }
  } else if (p.pattern === 'waves') {
    for (let k = 0; k < 9; k++) { ctx.beginPath(); for (let x = 0; x <= W; x += 12) ctx.lineTo(x, 40 + k * 45 + Math.sin(x / 140 + k) * 22); ctx.stroke(); }
  } else if (p.pattern === 'diag') {
    for (let x = -H; x < W; x += 46) { ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x + H, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 23, 0); ctx.lineTo(x + 23 + H, H); ctx.stroke(); }
  } else if (p.pattern === 'dots') {
    for (let y = 8; y < H; y += 14) for (let x = 8; x < W; x += 14) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill(); }
  } else if (p.pattern === 'circles') {
    for (let y = 0; y < H + 60; y += 60) for (let x = 0; x < W + 60; x += 60) { ctx.beginPath(); ctx.arc(x, y, 42, 0, 7); ctx.stroke(); }
  } else if (p.pattern === 'mountains') {
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#FFFFFF';
    const peaks = [[0, 330], [180, 170], [330, 290], [520, 120], [700, 260], [880, 150], [1060, 300], [1250, 140], [1420, 260], [1584, 180]];
    ctx.beginPath(); ctx.moveTo(0, H); peaks.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(W, H); ctx.fill();
  }
  ctx.restore();
}

// Texte riche : *mot* = couleur d'accent, [[mot]] = surligné, __mot__ = souligné.
function parseRich(text) {
  const runs = [];
  let st = { accent: false, hl: false, ul: false };
  let buf = '';
  const push = () => { if (buf) runs.push({ text: buf, ...st }); buf = ''; };
  for (let i = 0; i < text.length; i++) {
    if (text.startsWith('[[', i)) { push(); st = { ...st, hl: true }; i++; continue; }
    if (text.startsWith(']]', i)) { push(); st = { ...st, hl: false }; i++; continue; }
    if (text.startsWith('__', i)) { push(); st = { ...st, ul: !st.ul }; i++; continue; }
    if (text[i] === '*') { push(); st = { ...st, accent: !st.accent }; continue; }
    buf += text[i];
  }
  push();
  return runs;
}

function layoutRich(ctx, text, size, maxW, weight, upper, family = FONT) {
  ctx.font = `${weight} ${size}px ${family}`;
  const lines = [];
  for (const raw of String(text || '').split('\n')) {
    const words = [];
    for (const r of parseRich(upper ? raw.toUpperCase() : raw)) for (const w of r.text.split(/(\s+)/)) if (w) words.push({ ...r, text: w });
    let line = [];
    let lw = 0;
    for (const w of words) {
      const ww = ctx.measureText(w.text).width;
      if (lw + ww > maxW && line.length && !/^\s+$/.test(w.text)) { lines.push(line); line = []; lw = 0; if (/^\s+$/.test(w.text)) continue; }
      if (!line.length && /^\s+$/.test(w.text)) continue;
      line.push({ ...w, w: ww });
      lw += ww;
    }
    if (line.length) lines.push(line);
  }
  return lines;
}

export function drawRich(ctx, text, o) {
  const { x, y, maxW, maxLines = 2, minSize = 22, weight = 800, color, accent, hlBg, hlColor, ul, align = 'left', lh = 1.18, upper = false } = o;
  let size = o.size;
  let lines = layoutRich(ctx, text, size, maxW, weight, upper);
  while ((lines.length > maxLines || lines.some((l) => l.reduce((s, w) => s + w.w, 0) > maxW)) && size > minSize) { size -= 2; lines = layoutRich(ctx, text, size, maxW, weight, upper); }
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textBaseline = 'alphabetic';
  let cy = y + size;
  for (const line of lines) {
    const total = line.reduce((s, w) => s + w.w, 0);
    let cx = align === 'center' ? x + (maxW - total) / 2 : x;
    // Bandes de surlignage d'abord (regroupées par segment continu)
    let i = 0;
    while (i < line.length) {
      if (!line[i].hl) { cx += line[i].w; i++; continue; }
      const start = cx;
      let j = i;
      while (j < line.length && line[j].hl) { cx += line[j].w; j++; }
      const end = cx - (/^\s+$/.test(line[j - 1].text) ? line[j - 1].w : 0);
      ctx.fillStyle = hlBg;
      ctx.fillRect(start - size * 0.12, cy - size * 0.92, end - start + size * 0.24, size * 1.16);
      i = j;
    }
    cx = align === 'center' ? x + (maxW - total) / 2 : x;
    for (const w of line) {
      ctx.fillStyle = w.hl ? hlColor : w.accent ? accent : color;
      ctx.fillText(w.text, cx, cy);
      if (w.ul && !/^\s+$/.test(w.text)) { ctx.fillStyle = ul || accent; ctx.fillRect(cx, cy + size * 0.12, w.w, Math.max(4, size * 0.08)); }
      cx += w.w;
    }
    cy += size * lh;
  }
  return { size, height: lines.length * size * lh, lines: lines.length };
}

function text(ctx, s, x, y, { size = 24, weight = 600, color = '#000', align = 'left', font = FONT, maxW } = {}) {
  ctx.font = `${weight} ${size}px ${font}`;
  while (maxW && ctx.measureText(s).width > maxW && size > 12) { size -= 1; ctx.font = `${weight} ${size}px ${font}`; }
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(s, x, y);
  ctx.textAlign = 'left';
  return ctx.measureText(s).width;
}

function pill(ctx, s, x, y, { size = 22, weight = 700, bg, color, padX = 18, padY = 10, radius = 999, align = 'left', rotate = 0, border } = {}) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  const w = ctx.measureText(s).width + padX * 2;
  const h = size + padY * 2;
  const left = align === 'center' ? x - w / 2 : x;
  ctx.save();
  if (rotate) { ctx.translate(left + w / 2, y + h / 2); ctx.rotate(rotate); ctx.translate(-(left + w / 2), -(y + h / 2)); }
  rr(ctx, left, y, w, h, radius);
  ctx.fillStyle = bg; ctx.fill();
  if (border) { ctx.strokeStyle = border; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.fillStyle = color;
  ctx.fillText(s, left + padX, y + padY + size * 0.82);
  ctx.restore();
  return { w, h };
}

function bubble(ctx, s, x, y, { size = 26, bg = '#FFFFFF', color = '#1E3A6E', rotate = -0.06 } = {}) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rotate);
  const lines = String(s).split(/\n|(?<=,)\s/);
  ctx.font = `700 ${size}px ${FONT}`;
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 44;
  const h = lines.length * size * 1.2 + 26;
  rr(ctx, 0, 0, w, h, 34); ctx.fillStyle = bg; ctx.fill();
  ctx.beginPath(); ctx.moveTo(18, h - 8); ctx.lineTo(8, h + 22); ctx.lineTo(44, h - 4); ctx.fill();
  ctx.fillStyle = color; ctx.textAlign = 'center';
  lines.forEach((l, i) => ctx.fillText(l, w / 2, 13 + size * (i + 1) * 1.15));
  ctx.restore();
}

// Flèche manuscrite (courbe + pointe)
function curvyArrow(ctx, x1, y1, x2, y2, color, width = 3) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
  const cx = (x1 + x2) / 2 - (y2 - y1) * 0.6;
  const cy = (y1 + y2) / 2 + (x2 - x1) * 0.4;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); ctx.stroke();
  const a = Math.atan2(y2 - cy, x2 - cx);
  ctx.beginPath();
  ctx.moveTo(x2, y2); ctx.lineTo(x2 - 16 * Math.cos(a - 0.5), y2 - 16 * Math.sin(a - 0.5));
  ctx.moveTo(x2, y2); ctx.lineTo(x2 - 16 * Math.cos(a + 0.5), y2 - 16 * Math.sin(a + 0.5));
  ctx.stroke();
  ctx.restore();
}

function downArrow(ctx, x, y, color, s = 1) {
  ctx.save(); ctx.fillStyle = color;
  ctx.fillRect(x - 5 * s, y, 10 * s, 18 * s);
  ctx.beginPath(); ctx.moveTo(x - 13 * s, y + 16 * s); ctx.lineTo(x + 13 * s, y + 16 * s); ctx.lineTo(x, y + 30 * s); ctx.fill();
  ctx.restore();
}

function logosRow(ctx, imgs, x, y, h, maxW, { white = false, gap = 26 } = {}) {
  let cx = x;
  for (const img of imgs) {
    if (!img?.width) continue;
    const w = (img.width / img.height) * h;
    if (cx + w > x + maxW) break;
    ctx.save();
    if (white) ctx.filter = 'brightness(0) invert(1)';
    ctx.drawImage(img, cx, y, w, h);
    ctx.restore();
    cx += w + gap;
  }
  return cx - x;
}

function avatars(ctx, imgs, x, y, d, ring) {
  imgs.forEach((img, i) => {
    if (!img?.width) return;
    const cx = x + i * d * 0.68 + d / 2;
    const cy = y + d / 2;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, d / 2 + 3, 0, 7); ctx.fillStyle = ring; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, 7); ctx.clip();
    const s = Math.max(d / img.width, d / img.height);
    ctx.drawImage(img, cx - (img.width * s) / 2, cy - (img.height * s) / 2, img.width * s, img.height * s);
    ctx.restore();
  });
  return imgs.length ? d + (imgs.length - 1) * d * 0.68 : 0;
}

function followCorner(ctx, s, c, x = W - 70, y = 340) {
  if (!s) return;
  ctx.font = `600 22px ${FONT}`;
  const w = ctx.measureText(s).width;
  text(ctx, '🔔', x - w - 46, y - 2, { size: 30, weight: 400 });
  text(ctx, s, x - w, y, { size: 22, weight: 600, color: c });
  curvyArrow(ctx, x + 16, y - 12, x + 30, y + 34, c, 2.5);
}

// Petite preuve sociale : avatars + texte, ou pastille
function proofBlock(ctx, f, p, img, x, y, { pillBg, pillColor } = {}) {
  let cy = y;
  if (img.avatars.length) {
    const w = avatars(ctx, img.avatars.slice(0, 5), x, cy, 46, p.dark ? '#FFFFFF' : '#FFFFFF');
    if (f.proof) text(ctx, f.proof, x + w + 14, cy + 32, { size: 22, weight: 700, color: p.text === '#FFFFFF' ? '#FFFFFF' : p.text, maxW: 430 - w });
    cy += 64;
  } else if (f.proof) {
    pill(ctx, f.proof, x, cy, { size: 22, bg: pillBg || '#FFFFFF', color: pillColor || p.accent, padX: 14, padY: 7 });
    cy += 54;
  }
  return cy;
}

// ---------- Les 5 mises en page ----------
const LAYOUTS = {
  promesse(ctx, f, p, img) {
    let y = proofBlock(ctx, f, p, img, 58, 44, { pillBg: '#FFFFFF', pillColor: p.accent });
    if (img.logos.length) { logosRow(ctx, img.logos, 60, y + 4, 38, 400, { white: p.dark }); y += 64; }
    if (f.cta) {
      pill(ctx, `${f.cta}  ↓`, 58, y + 8, { size: 21, weight: 600, bg: p.dark ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.85)', color: p.dark ? '#FFFFFF' : p.text, rotate: -0.06, padX: 16, padY: 7 });
    }
    ctx.save(); ctx.strokeStyle = p.dark ? 'rgba(255,255,255,.55)' : 'rgba(0,0,0,.25)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(700, 52); ctx.lineTo(560, 52); ctx.lineTo(560, 240); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(1380, 110); ctx.lineTo(1380, 290); ctx.lineTo(1250, 290); ctx.stroke(); ctx.restore();
    const r = drawRich(ctx, f.headline, { x: 610, y: 58, maxW: 740, size: 60, minSize: 32, maxLines: 2, color: p.text, accent: p.accent, hlBg: p.accent, hlColor: '#FFFFFF' });
    let yy = 58 + r.height + 18;
    const steps = list(f.steps);
    if (steps.length) {
      let cx = 612;
      text(ctx, '✦', cx, yy + 22, { size: 24, color: p.accent }); cx += 40;
      steps.forEach((s, i) => { cx += text(ctx, s, cx, yy + 22, { size: 22, weight: 700, color: p.text }) + 18; if (i < steps.length - 1) { text(ctx, '➜', cx, yy + 22, { size: 22, color: p.accent }); cx += 40; } });
      yy += 48;
    }
    if (f.subline && !steps.length) { text(ctx, f.subline, 612, yy + 22, { size: 22, weight: 500, color: p.sub, maxW: 740 }); yy += 44; }
    if (f.followText) pill(ctx, `${f.followText}  ↓`, 660, Math.min(yy + 6, 300), { size: 24, weight: 500, bg: p.dark ? 'rgba(0,0,0,.6)' : 'rgba(255,255,255,.85)', color: p.dark ? '#FFFFFF' : p.text, radius: 10, border: p.accent, padX: 22, padY: 8 });
  },
  metier(ctx, f, p, img) {
    if (img.logos.length) logosRow(ctx, img.logos, 44, 40, 34, 560, { gap: 20 });
    else proofBlock(ctx, f, p, img, 44, 36, { pillBg: '#FFFFFF', pillColor: p.accent });
    if (f.bubble) bubble(ctx, f.bubble, 116, 112, { size: 24, color: p.accent });
    const title = f.title || 'Métier';
    ctx.font = `800 96px ${FONT}`;
    let size = 96;
    while (ctx.measureText(title).width > 640 && size > 40) { size -= 4; ctx.font = `800 ${size}px ${FONT}`; }
    const tw = ctx.measureText(title).width;
    const bx = 905 - tw / 2 - 40;
    rr(ctx, bx, 112, tw + 80, 124, 18); ctx.fillStyle = p.accent; ctx.fill();
    text(ctx, title, 905, 112 + 62 + size * 0.36, { size, weight: 800, color: '#FFFFFF', align: 'center' });
    if (f.proof && img.logos.length) bubble(ctx, f.proof, 1150, 40, { size: 24, color: p.accent, rotate: 0 });
    const pills = list(f.pills).slice(0, 4);
    ctx.font = `500 26px ${FONT}`;
    const widths = pills.map((s) => ctx.measureText(s).width + 52);
    let cx = 905 - (widths.reduce((a, b) => a + b, 0) + (pills.length - 1) * 22) / 2;
    pills.forEach((s, i) => { pill(ctx, s, cx, 252, { size: 26, weight: 500, bg: '#FFFFFF', color: p.text, padX: 26, padY: 8 }); cx += widths[i] + 22; });
    followCorner(ctx, f.followText, p.accent, W - 150, 345);
  },
  logos(ctx, f, p, img) {
    const brand = f.brand || '';
    if (brand) drawRich(ctx, brand, { x: 48, y: 26, maxW: 300, size: 30, minSize: 18, maxLines: 1, color: p.text, accent: p.accent, hlBg: p.accent, hlColor: '#FFF', weight: 800 });
    if (f.proof) { text(ctx, '▶', 48, 100, { size: 18, color: p.sub }); text(ctx, f.proof, 74, 100, { size: 21, weight: 500, color: p.sub, maxW: 270 }); }
    if (img.avatars.length) avatars(ctx, img.avatars.slice(0, 5), 50, 126, 42, '#FFFFFF');
    const r = drawRich(ctx, f.headline, { x: 362, y: 46, maxW: 920, size: 44, minSize: 28, maxLines: 2, color: p.text, accent: p.accent, hlBg: p.accent, hlColor: '#FFF', ul: p.accent });
    let yy = 46 + r.height + 14;
    if (f.subline) { text(ctx, '▶', 364, yy + 26, { size: 20, color: p.sub }); text(ctx, f.subline, 392, yy + 26, { size: 22, weight: 500, color: p.sub, maxW: 880 }); yy += 50; }
    const by = Math.max(yy + 6, 232);
    rr(ctx, 368, by + 6, 940, 78, 22); ctx.fillStyle = p.accent; ctx.globalAlpha = 0.35; ctx.fill(); ctx.globalAlpha = 1;
    rr(ctx, 362, by, 940, 78, 22); ctx.fillStyle = p.bar; ctx.fill();
    const tw = text(ctx, f.logosTitle || 'Apparu chez :', 400, by + 48, { size: 22, weight: 600, color: '#FFFFFF' });
    if (img.logos.length) logosRow(ctx, img.logos, 400 + tw + 30, by + 20, 38, 860 - tw - 60, { white: true, gap: 30 });
    else text(ctx, f.cta || '', 400 + tw + 30, by + 48, { size: 22, weight: 500, color: 'rgba(255,255,255,.8)', maxW: 800 - tw });
    downArrow(ctx, 1388, by - 4, p.accent, 2);
  },
  marqueur(ctx, f, p, img) {
    text(ctx, f.logosTitle || 'Déjà collaboré avec :', 40, 62, { size: 24, weight: 700, color: '#FFFFFF' });
    if (img.logos.length) {
      img.logos.slice(0, 6).forEach((im, i) => { if (!im?.width) return; const h = 46; const w = Math.min(130, (im.width / im.height) * h); ctx.save(); if (p.dark) ctx.filter = 'brightness(0) invert(1)'; ctx.drawImage(im, 40 + (i % 3) * 140, 86 + Math.floor(i / 3) * 62, w, h); ctx.restore(); });
    } else proofBlock(ctx, f, p, img, 40, 90, { pillBg: '#FFFFFF', pillColor: '#111' });
    const head = /\[\[/.test(f.headline) ? f.headline : String(f.headline).replace(/\*([^*]+)\*/g, '[[$1]]');
    const r = drawRich(ctx, head, { x: 580, y: 50, maxW: 860, size: 50, minSize: 28, maxLines: 4, lh: 1.32, color: '#FFFFFF', accent: p.accent, hlBg: '#0B0B0B', hlColor: p.accent });
    if (f.followText) { const y = Math.min(50 + r.height + 30, 350); text(ctx, f.followText, 1460, y, { size: 22, weight: 700, color: '#111', align: 'right' }); downArrow(ctx, 1480, y - 22, '#111', 1); }
  },
  impact(ctx, f, p, img) {
    if (f.proof) drawRich(ctx, f.proof, { x: 56, y: 48, maxW: 470, size: 24, minSize: 16, maxLines: 2, weight: 700, color: p.sub, accent: p.text, hlBg: p.accent, hlColor: '#fff' });
    let y = 130;
    if (img.logos.length) logosRow(ctx, img.logos, 60, y + 74, 34, 470);
    if (f.cta) { curvyArrow(ctx, 70, y + 4, 112, y + 40, p.text, 2.5); pill(ctx, f.cta, 124, y + 22, { size: 21, weight: 700, bg: '#E53935', color: '#FFFFFF', radius: 2, rotate: -0.05, padX: 10, padY: 4 }); }
    const r = drawRich(ctx, f.headline, { x: 660, y: 40, maxW: 840, size: 54, minSize: 30, maxLines: 2, upper: true, color: p.text, accent: p.accent, hlBg: p.accent, hlColor: '#fff', ul: '#E53935' });
    let yy = 40 + r.height + 18;
    if (f.subline) { drawRich(ctx, `[[${f.subline}]]`, { x: 664, y: yy, maxW: 820, size: 22, minSize: 14, maxLines: 1, weight: 800, color: p.text, accent: p.accent, hlBg: p.accent, hlColor: '#B71C1C' }); yy += 52; }
    if (f.followText) pill(ctx, `${f.followText}  ↓`, 600, Math.min(yy + 4, 316), { size: 26, weight: 800, bg: p.bar, color: '#FFFFFF', radius: 2, padX: 22, padY: 8 });
  },
};

// ---------- Rendu complet ----------
const cache = new Map();
const loadImg = (src) => {
  if (cache.has(src)) return cache.get(src);
  const pr = new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  cache.set(src, pr);
  return pr;
};

export async function renderBanner(canvas, { templateId, fields, style = {}, images = [] }, { overlay = false } = {}) {
  await Promise.all(['800 40px Poppins', '700 40px Poppins', '600 40px Poppins', '500 40px Poppins', '700 30px Caveat'].map((f) => document.fonts?.load(f).catch(() => {})));
  const tpl = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
  const base = PRESETS[style.preset || tpl.preset] || PRESETS.mint;
  const p = { ...base, accent: style.accent || base.accent };
  const f = { ...DEFAULT_FIELDS, ...(fields || {}) };
  const img = {
    logos: (await Promise.all(images.filter((i) => i.kind === 'logo').map((i) => loadImg(i.src)))).filter(Boolean),
    avatars: (await Promise.all(images.filter((i) => i.kind === 'avatar').map((i) => loadImg(i.src)))).filter(Boolean),
  };
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  background(ctx, p);
  LAYOUTS[tpl.id](ctx, f, p, img);
  if (overlay) {
    // Zone cachée par la photo de profil sur ordinateur (approximative) : ne rien y mettre d'important.
    ctx.save();
    ctx.fillStyle = 'rgba(255,0,80,.18)'; ctx.strokeStyle = 'rgba(255,0,80,.9)'; ctx.setLineDash([10, 8]); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(170, 400, 135, 0, 7); ctx.fill(); ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, 'Photo de profil', 92, 330, { size: 20, weight: 700, color: '#C2003A' });
    ctx.restore();
  }
}


// =====================================================================
// ÉDITEUR À CALQUES (façon Canva) : chaque élément est indépendant.
// Élément : { id, type: 'text'|'image'|'shape'|'arrow', x, y, rot, role?, ...props }
// =====================================================================
export const FONTS = { poppins: FONT, caveat: HAND, serif: 'Georgia, "Times New Roman", serif' };
let seq = 0;
export const uid = () => `el${Date.now().toString(36)}${(seq++).toString(36)}`;

// Dessine un texte riche dans une boîte ; renvoie sa taille (pour la sélection à la souris).
function drawTextEl(ctx, el, p) {
  const family = FONTS[el.font] || FONT;
  const size = el.size || 32;
  const weight = el.weight || 700;
  const maxW = el.maxW || 2000;
  const lines = layoutRich(ctx, el.text || ' ', size, maxW, weight, el.upper, family);
  const lh = (el.lh || 1.18) * size;
  const widths = lines.map((l) => l.reduce((a, w) => a + w.w, 0));
  const textW = Math.max(10, ...widths);
  const boxW = el.maxW ? Math.max(textW, Math.min(el.maxW, textW)) : textW;
  const padX = el.bg ? (el.padX ?? size * 0.5) : 0;
  const padY = el.bg ? (el.padY ?? size * 0.28) : 0;
  const w = boxW + padX * 2;
  const h = Math.max(1, lines.length) * lh + padY * 2 - (lh - size) * 0.6;
  if (el.bg) {
    rr(ctx, el.x, el.y, w, h, el.radius ?? 999);
    ctx.fillStyle = el.bg; ctx.fill();
    if (el.border) { ctx.strokeStyle = el.border; ctx.lineWidth = 2.5; ctx.stroke(); }
  }
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.textBaseline = 'alphabetic';
  const accent = el.accent || p.accent;
  lines.forEach((line, i) => {
    const lw = widths[i];
    let cx = el.x + padX + (el.align === 'center' ? (boxW - lw) / 2 : el.align === 'right' ? boxW - lw : 0);
    const cy = el.y + padY + size * 0.92 + i * lh;
    // surlignage [[…]]
    let k = 0;
    let hx = cx;
    while (k < line.length) {
      if (!line[k].hl) { hx += line[k].w; k++; continue; }
      const start = hx; let j = k;
      while (j < line.length && line[j].hl) { hx += line[j].w; j++; }
      ctx.fillStyle = el.hlBg || accent;
      ctx.fillRect(start - size * 0.1, cy - size * 0.9, hx - start + size * 0.2, size * 1.14);
      k = j;
    }
    for (const wd of line) {
      ctx.fillStyle = wd.hl ? (el.hlColor || '#FFFFFF') : wd.accent ? accent : (el.color || p.text);
      ctx.fillText(wd.text, cx, cy);
      if (wd.ul && wd.text.trim()) { ctx.fillStyle = el.ulColor || accent; ctx.fillRect(cx, cy + size * 0.12, wd.w, Math.max(3, size * 0.08)); }
      cx += wd.w;
    }
  });
  return { w, h };
}

function drawArrowEl(ctx, el) {
  const { x, y } = el;
  const w = el.w || 80; const h = el.h || 60;
  const c = el.color || '#111'; const lw = el.width || 3;
  ctx.save(); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (el.kind === 'down') {
    ctx.fillRect(x + w / 2 - w * 0.13, y, w * 0.26, h * 0.6);
    ctx.beginPath(); ctx.moveTo(x, y + h * 0.55); ctx.lineTo(x + w, y + h * 0.55); ctx.lineTo(x + w / 2, y + h); ctx.fill();
  } else if (el.kind === 'right') {
    ctx.beginPath(); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w - 4, y + h / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w - h * 0.4, y + h * 0.1); ctx.lineTo(x + w, y + h / 2); ctx.lineTo(x + w - h * 0.4, y + h * 0.9); ctx.stroke();
  } else {
    const x1 = x + 4; const y1 = y + 4; const x2 = x + w - 4; const y2 = y + h - 4;
    const cx = x1 + w * 0.05; const cy = y2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - cy, x2 - cx);
    ctx.beginPath();
    ctx.moveTo(x2, y2); ctx.lineTo(x2 - 16 * Math.cos(a - 0.5), y2 - 16 * Math.sin(a - 0.5));
    ctx.moveTo(x2, y2); ctx.lineTo(x2 - 16 * Math.cos(a + 0.5), y2 - 16 * Math.sin(a + 0.5));
    ctx.stroke();
  }
  ctx.restore();
  return { w, h };
}

async function drawImageEl(ctx, el) {
  const img = el.src ? await loadImg(el.src) : null;
  const w = el.w || 120;
  const h = el.h || (img ? (img.height / img.width) * w : 60);
  if (!img) { ctx.save(); ctx.strokeStyle = '#999'; ctx.setLineDash([6, 6]); ctx.strokeRect(el.x, el.y, w, h); ctx.restore(); return { w, h }; }
  ctx.save();
  if (el.round) {
    const r = Math.min(w, h) / 2;
    ctx.beginPath(); ctx.arc(el.x + w / 2, el.y + h / 2, r + (el.ring ? 3 : 0), 0, 7); ctx.fillStyle = el.ring || 'transparent'; ctx.fill();
    ctx.beginPath(); ctx.arc(el.x + w / 2, el.y + h / 2, r, 0, 7); ctx.clip();
    const sc = Math.max(w / img.width, h / img.height);
    ctx.drawImage(img, el.x + w / 2 - (img.width * sc) / 2, el.y + h / 2 - (img.height * sc) / 2, img.width * sc, img.height * sc);
  } else {
    if (el.white) ctx.filter = 'brightness(0) invert(1)';
    if (el.opacity != null) ctx.globalAlpha = el.opacity;
    ctx.drawImage(img, el.x, el.y, w, h);
  }
  ctx.restore();
  return { w, h };
}

function drawShapeEl(ctx, el) {
  const w = el.w || 200; const h = el.h || 80;
  ctx.save();
  if (el.opacity != null) ctx.globalAlpha = el.opacity;
  if (el.kind === 'line') { ctx.strokeStyle = el.fill || '#000'; ctx.lineWidth = el.stroke || 3; ctx.beginPath(); ctx.moveTo(el.x, el.y + h / 2); ctx.lineTo(el.x + w, el.y + h / 2); ctx.stroke(); }
  else if (el.kind === 'circle') { ctx.beginPath(); ctx.ellipse(el.x + w / 2, el.y + h / 2, w / 2, h / 2, 0, 0, 7); ctx.fillStyle = el.fill || '#000'; ctx.fill(); }
  else { rr(ctx, el.x, el.y, w, h, el.radius ?? 16); ctx.fillStyle = el.fill || '#000'; ctx.fill(); if (el.stroke) { ctx.strokeStyle = el.strokeColor || '#fff'; ctx.lineWidth = el.stroke; ctx.stroke(); } }
  ctx.restore();
  return { w, h };
}

// Rendu complet d'une bannière à calques. Renvoie les boîtes de chaque élément (pour l'éditeur).
export async function renderElements(canvas, banner, { overlay = false } = {}) {
  setSize(banner.size?.w || 1584, banner.size?.h || 396);
  await Promise.all(['800 40px Poppins', '700 40px Poppins', '600 40px Poppins', '500 40px Poppins', '700 30px Caveat'].map((f) => document.fonts?.load(f).catch(() => {})));
  const style = banner.style || {};
  const base = style.custom ? paletteStyle(style.custom) : PRESETS[style.preset] || PRESETS.mint;
  const p = { ...base, accent: style.accent || base.accent };
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  if (style.bgImage) { const bi = await loadImg(style.bgImage); if (bi) { const sc = Math.max(W / bi.width, H / bi.height); ctx.drawImage(bi, (W - bi.width * sc) / 2, (H - bi.height * sc) / 2, bi.width * sc, bi.height * sc); } else background(ctx, p); }
  else background(ctx, p);
  const boxes = {};
  for (const el of banner.elements || []) {
    if (el.hidden) continue;
    ctx.save();
    // On mesure d'abord (sans dessiner) pour pouvoir tourner autour du centre.
    let size;
    if (el.rot) {
      const probe = document.createElement('canvas').getContext('2d');
      size = el.type === 'text' ? drawTextEl(probe, { ...el, x: 0, y: 0 }, p) : el.type === 'image' ? { w: el.w || 120, h: el.h || 60 } : { w: el.w || 100, h: el.h || 60 };
      const cx = el.x + size.w / 2; const cy = el.y + size.h / 2;
      ctx.translate(cx, cy); ctx.rotate((el.rot * Math.PI) / 180); ctx.translate(-cx, -cy);
    }
    if (el.type === 'text') size = drawTextEl(ctx, el, p);
    else if (el.type === 'image') size = await drawImageEl(ctx, el);
    else if (el.type === 'arrow') size = drawArrowEl(ctx, el);
    else size = drawShapeEl(ctx, el);
    ctx.restore();
    boxes[el.id] = { x: el.x, y: el.y, w: size.w, h: size.h, rot: el.rot || 0 };
  }
  if (overlay) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,0,80,.16)'; ctx.strokeStyle = 'rgba(255,0,80,.85)'; ctx.setLineDash([10, 8]); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(170, 400, 135, 0, 7); ctx.fill(); ctx.stroke();
    ctx.setLineDash([]); ctx.font = `700 20px ${FONT}`; ctx.fillStyle = '#C2003A'; ctx.fillText('Photo de profil', 92, 330);
    ctx.restore();
  }
  return boxes;
}

// ---------- Les modèles, traduits en calques modifiables ----------
const T = (props) => ({ id: uid(), type: 'text', weight: 700, ...props });
const steps = (s) => String(s || '').split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);

export function templateElements(templateId, fields = {}, images = []) {
  const f = { ...DEFAULT_FIELDS, ...fields };
  const tpl = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
  const p = PRESETS[tpl.preset];
  const logos = images.filter((i) => i.kind === 'logo');
  const avatars = images.filter((i) => i.kind === 'avatar');
  const els = [];
  const logoRow = (x, y, h, white) => logos.slice(0, 5).forEach((l, i) => els.push({ id: uid(), type: 'image', role: 'logo', src: l.src, x: x + i * (h * 3 + 20), y, w: h * 2.6, h, white }));
  const avatarRow = (x, y, d) => avatars.slice(0, 5).forEach((a, i) => els.push({ id: uid(), type: 'image', role: 'avatar', src: a.src, x: x + i * d * 0.68, y, w: d, h: d, round: true, ring: '#FFFFFF' }));
  const onDark = p.dark ? '#FFFFFF' : p.text;
  if (tpl.id === 'promesse') {
    avatarRow(58, 40, 46);
    els.push(T({ role: 'proof', text: f.proof, x: avatars.length ? 58 + avatars.length * 32 + 30 : 58, y: 44, size: 22, color: p.accent, bg: '#FFFFFF', padX: 14, padY: 7 }));
    logoRow(60, 104, 36, p.dark);
    els.push(T({ role: 'cta', text: `${f.cta}  ↓`, x: 58, y: 168, size: 21, weight: 600, color: onDark, bg: p.dark ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.85)', rot: -3 }));
    els.push(T({ role: 'headline', text: f.headline, x: 610, y: 60, size: 58, weight: 800, maxW: 760, color: p.text }));
    els.push(T({ role: 'steps', text: `✦  ${steps(f.steps).join('  ➜  ')}`, x: 612, y: 210, size: 22, color: p.text }));
    els.push(T({ role: 'follow', text: `${f.followText}  ↓`, x: 660, y: 262, size: 24, weight: 500, color: onDark, bg: p.dark ? 'rgba(0,0,0,.6)' : 'rgba(255,255,255,.85)', radius: 10, border: p.accent, padX: 22, padY: 8 }));
    els.push({ id: uid(), type: 'shape', kind: 'line', x: 560, y: 46, w: 140, h: 8, fill: p.dark ? 'rgba(255,255,255,.55)' : 'rgba(0,0,0,.25)', stroke: 2 });
  } else if (tpl.id === 'metier') {
    logoRow(44, 40, 32, false);
    els.push(T({ role: 'bubble', text: f.bubble, x: 110, y: 112, size: 24, color: p.accent, bg: '#FFFFFF', radius: 34, rot: -4, maxW: 260, align: 'center' }));
    els.push(T({ role: 'title', text: f.title, x: 600, y: 112, size: 92, weight: 800, color: '#FFFFFF', bg: p.accent, radius: 18, padX: 40, padY: 14 }));
    els.push(T({ role: 'proof', text: f.proof, x: 1120, y: 40, size: 24, color: p.accent, bg: '#FFFFFF', radius: 34 }));
    steps(f.pills).slice(0, 4).forEach((s, i) => els.push(T({ role: `pill-${i}`, text: s, x: 560 + i * 200, y: 258, size: 26, weight: 500, color: p.text, bg: '#FFFFFF', padX: 24, padY: 8 })));
    els.push(T({ role: 'follow', text: `🔔 ${f.followText}`, x: 980, y: 326, size: 22, weight: 600, color: p.accent }));
    els.push({ id: uid(), type: 'arrow', kind: 'curve', x: 1440, y: 318, w: 50, h: 52, color: p.accent, width: 2.5 });
  } else if (tpl.id === 'logos') {
    els.push(T({ role: 'brand', text: f.brand, x: 48, y: 30, size: 30, weight: 800, color: p.text }));
    els.push(T({ role: 'proof', text: `▶ ${f.proof}`, x: 48, y: 82, size: 20, weight: 500, color: p.sub, maxW: 290 }));
    avatarRow(50, 130, 42);
    els.push(T({ role: 'headline', text: f.headline, x: 362, y: 44, size: 44, weight: 800, maxW: 930, color: p.text, ulColor: p.accent }));
    els.push(T({ role: 'subline', text: `▶ ${f.subline}`, x: 364, y: 168, size: 22, weight: 500, color: p.sub, maxW: 900 }));
    els.push({ id: uid(), type: 'shape', role: 'bar', x: 362, y: 232, w: 940, h: 78, fill: p.bar, radius: 22 });
    els.push(T({ role: 'logosTitle', text: f.logosTitle, x: 398, y: 254, size: 22, weight: 600, color: '#FFFFFF' }));
    logoRow(640, 252, 38, true);
    els.push({ id: uid(), type: 'arrow', kind: 'down', x: 1365, y: 228, w: 50, h: 64, color: p.accent });
  } else if (tpl.id === 'marqueur') {
    els.push(T({ role: 'logosTitle', text: f.logosTitle, x: 40, y: 40, size: 24, color: '#FFFFFF' }));
    logoRow(40, 86, 40, true);
    els.push(T({ role: 'headline', text: /\[\[/.test(f.headline) ? f.headline : String(f.headline).replace(/\*([^*]+)\*/g, '[[$1]]'), x: 580, y: 54, size: 50, weight: 800, maxW: 860, lh: 1.32, color: '#FFFFFF', hlBg: '#0B0B0B', hlColor: p.accent }));
    els.push(T({ role: 'follow', text: `${f.followText}  ↓`, x: 1060, y: 316, size: 22, color: '#111111' }));
  } else {
    els.push(T({ role: 'proof', text: f.proof, x: 56, y: 48, size: 24, color: p.sub, maxW: 470 }));
    els.push({ id: uid(), type: 'arrow', kind: 'curve', x: 66, y: 126, w: 46, h: 44, color: p.text, width: 2.5 });
    els.push(T({ role: 'cta', text: f.cta, x: 124, y: 150, size: 21, color: '#FFFFFF', bg: '#E53935', radius: 2, rot: -3, padX: 10, padY: 4 }));
    logoRow(60, 206, 34, false);
    els.push(T({ role: 'headline', text: f.headline, x: 660, y: 44, size: 54, weight: 800, maxW: 840, upper: true, color: p.text, ulColor: '#E53935' }));
    els.push(T({ role: 'subline', text: f.subline, x: 664, y: 186, size: 22, weight: 800, color: '#B71C1C', bg: p.accent, radius: 2, padX: 8, padY: 3 }));
    els.push(T({ role: 'follow', text: `${f.followText}  ↓`, x: 600, y: 250, size: 26, weight: 800, color: '#FFFFFF', bg: p.bar, radius: 2, padX: 22, padY: 8 }));
  }
  return els;
}

// Applique des textes (proposition de l'IA) aux calques qui ont un rôle, sans toucher à leur position.
export function applyTextsToElements(elements, v) {
  const map = { proof: v.proof, headline: v.headline, subline: v.subline ? (/^▶/.test(v.subline) ? v.subline : v.subline) : undefined, cta: v.cta, follow: v.followText, bubble: v.bubble, title: v.title, brand: v.brand };
  for (const el of elements) {
    if (el.type !== 'text' || !el.role) continue;
    if (el.role === 'steps' && v.steps?.length) el.text = `✦  ${v.steps.join('  ➜  ')}`;
    else if (el.role.startsWith('pill-') && v.pills?.length) { const i = Number(el.role.slice(5)); if (v.pills[i]) el.text = v.pills[i]; }
    else if (map[el.role] != null && map[el.role] !== '') {
      const keepArrow = /\s↓$/.test(el.text) ? '  ↓' : '';
      const keepBullet = /^▶ /.test(el.text) ? '▶ ' : '';
      const keepBell = /^🔔 /.test(el.text) ? '🔔 ' : '';
      el.text = `${keepBullet}${keepBell}${map[el.role]}${keepArrow}`;
    }
  }
  return elements;
}

// ---------- Chartes graphiques (duos / trios de couleurs tirés des bannières concurrentes) ----------
const lumHex = (hex) => { const n = parseInt(String(hex || '#888888').slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
export const inkOn = (hex) => (lumHex(hex) > 0.42 ? '#111111' : '#FFFFFF');
const okHex = (c) => /^#[0-9a-f]{6}$/i.test(c || '');
export function cleanPalette(pal = {}) {
  const bg = okHex(pal.bg) ? pal.bg : '#F4FAF6';
  const bg2 = okHex(pal.bg2) ? pal.bg2 : bg;
  const accent = okHex(pal.accent) ? pal.accent : '#2FBF71';
  const text = okHex(pal.text) && Math.abs(lumHex(pal.text) - lumHex(bg)) > 0.25 ? pal.text : inkOn(bg);
  return { name: String(pal.name || 'Charte').slice(0, 40), bg, bg2, text, accent, pattern: ['none', 'hex', 'waves', 'dots', 'diag', 'circles'].includes(pal.pattern) ? pal.pattern : 'none' };
}
export function paletteStyle(pal) {
  const c = cleanPalette(pal);
  const dark = lumHex(c.bg) < 0.3;
  return { name: c.name, bg: [c.bg, c.bg2], text: c.text, sub: c.text, dark, pattern: c.pattern, accent: c.accent, bar: c.text };
}
// Applique une charte à une bannière : fond, couleur du texte, mots clés, pastilles, formes et flèches.
export function applyPalette(banner, pal) {
  const c = cleanPalette(pal);
  banner.style = { ...(banner.style || {}), custom: c, accent: '', bgImage: undefined };
  for (const el of banner.elements || []) {
    if (el.type === 'text') {
      if (el.bg) {
        if (el.role === 'cta' || el.role === 'title' || lumHex(el.bg) < 0.6) { el.bg = el.role === 'title' ? c.text : c.accent; el.color = inkOn(el.bg); el.accent = el.role === 'title' ? c.accent : inkOn(el.bg); }
        else { el.bg = '#FFFFFF'; el.color = '#111111'; el.accent = c.accent; }
      } else { el.color = c.text; el.accent = c.accent; }
    } else if (el.type === 'shape') el.fill = el.role === 'bar' ? c.text : c.accent;
    else if (el.type === 'arrow') el.color = c.accent;
  }
  return banner;
}
