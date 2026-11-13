// Mesure de la réécriture humaine : part des mots du texte de l'IA qui ont été changés avant validation.
// C'est l'indicateur principal de qualité (un post validé tel quel = 0 %).
const tokens = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[\p{L}\p{N}]+/gu) || [];

export function editRatio(before, after) {
  const a = tokens(before).slice(0, 700), b = tokens(after).slice(0, 700);
  if (!a.length && !b.length) return 0;
  if (!a.length || !b.length) return 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return Math.min(1, prev[b.length] / Math.max(a.length, b.length));
}

// À appeler quand un post est validé ou publié.
export function measure(post) {
  if (!post.aiText) return null;
  const ratio = Math.round(editRatio(post.aiText, post.text) * 100) / 100;
  post.rewrite = { ratio, at: new Date().toISOString() };
  return post.rewrite;
}

// Synthèse pour un client : seuls les posts écrits par l'IA puis validés comptent.
export function rewriteStats(posts) {
  const done = posts.filter((p) => p.rewrite && typeof p.rewrite.ratio === 'number').sort((x, y) => String(y.rewrite.at).localeCompare(String(x.rewrite.at))).slice(0, 20);
  if (!done.length) return { count: 0 };
  const avg = done.reduce((n, p) => n + p.rewrite.ratio, 0) / done.length;
  return { count: done.length, avg: Math.round(avg * 100), asIs: done.filter((p) => p.rewrite.ratio <= 0.15).length };
}

// Rapprochement d'un post publié avec un post récupéré sur le profil (texte quasi identique au début).
const head = (s) => tokens(s).slice(0, 25).join(' ');
export function samePost(a, b) {
  const x = head(a), y = head(b);
  if (!x || !y) return false;
  if (x === y) return true;
  return editRatio(x, y) < 0.2;
}
