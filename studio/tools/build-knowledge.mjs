// Construit lib/knowledge.js à partir des ressources Linka (export ChatGPT).
// Usage : node tools/build-knowledge.mjs <dossier knowledge> <fichier hooks json>
// Le texte d'origine est conservé (traçabilité) ; les catégories normalisées sont une couche ajoutée.
import fs from 'node:fs';
import path from 'node:path';

const [dir, hooksFile] = process.argv.slice(2);
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n');

// ---------- Hooks : 641 entrées, dédoublonnées, familles normalisées en français ----------
const FAMILY = [
  [/TYPE 1 :/, 'Curiosité / exclamation'], [/TYPE 2 :/, 'Problème'], [/TYPE 3 :/, 'Pédagogique'],
  [/TYPE 4 :/, 'Question'], [/TYPE 5 :/, 'Opinion tranchée'], [/TYPE 6 :/, 'Storytelling / vulnérabilité'],
  [/TYPE 7 :/, 'Outils & IA'], [/TYPE 8 :/, 'Mini-histoire / contexte'], [/TYPE 9 :/, 'Comparaison'],
  [/TYPE 10 :/, 'Paradoxe / croyance inversée'], [/TYPE 11 :/, 'Dialogue / citation'], [/TYPE 12 :/, 'Frustration'],
  [/raconter une histoire/i, 'Storytelling / vulnérabilité'], [/quotidien/i, 'Mini-histoire / contexte'],
  [/intriguer/i, 'Curiosité / exclamation'], [/partager de la valeur/i, 'Pédagogique'],
  [/expérience/i, 'Preuve / expérience'], [/opinion/i, 'Opinion tranchée'], [/ERREUR/i, 'Erreur à éviter'],
  [/interpeller/i, 'Interpellation'], [/avis client/i, 'Preuve / expérience'], [/offre/i, 'Offre'],
];
const lib = JSON.parse(fs.readFileSync(hooksFile, 'utf8'));
const seen = new Set();
const hooks = [];
for (const h of lib.items) {
  const key = h.template.toLowerCase().replace(/\s+/g, ' ').trim();
  if (seen.has(key)) continue;
  seen.add(key);
  hooks.push({ id: h.id, lang: h.language, family: (FAMILY.find(([re]) => re.test(h.category)) || [, 'Autre'])[1], category: h.category.replace(/[↴]/g, '').trim(), template: h.template, source: h.source });
}

// ---------- Structures (50) ----------
const structText = read('50+ Linkedin Winning structure.md');
const structures = structText.split(/\n(?=### )/).filter((b) => b.startsWith('### ')).map((b, i) => {
  const title = b.split('\n')[0].replace(/^###\s*🔹?\s*/, '').replace(/^Structure\s*/i, '').trim();
  const name = title.replace(/^\d+\s*[.:]\s*/, '').replace(/[“”"]/g, '').trim();
  const note = (b.match(/^>\s*(.+)$/m) || [, ''])[1].trim();
  const schema = (b.match(/```\n?([\s\S]*?)```/) || [, ''])[1].trim();
  return { id: `S${String(i + 1).padStart(2, '0')}`, name, note, schema, source: '50+ Linkedin Winning structure.md' };
}).filter((s) => s.schema);

// ---------- Templates (62) ----------
const tplText = read('Template post linkedin _.txt');
const templates = tplText.split(/\n(?=## \d+\.)/).filter((b) => /^## \d+\./.test(b)).map((b) => {
  const [head, ...rest] = b.split('\n');
  const n = head.match(/^## (\d+)\.\s*(.+)$/);
  return { id: `T${String(n[1]).padStart(2, '0')}`, name: n[2].trim(), body: rest.join('\n').replace(/^#+\s*\**Template\**\s*$/gim, '').trim().slice(0, 1800), source: 'Template post linkedin _.txt' };
});

// ---------- Posts d'auteurs (164) ----------
const posts = [];
for (const f of fs.readdirSync(dir).filter((x) => /\.txt$/.test(x) && /post/i.test(x) && !/Template|Masterclass/i.test(x))) {
  const author = f.replace(/\s*posts?\s*linkedin.*$/i, '').trim();
  const parts = read(f).split(/^#\s*Post\s*\d+\s*:?\s*$/gim).map((t) => t.trim()).filter((t) => t.length > 40);
  parts.forEach((text, i) => {
    const lines = text.split('\n').filter((l) => l.trim());
    posts.push({ id: `P-${author.split(' ')[0].toUpperCase()}-${String(i + 1).padStart(2, '0')}`, author, hook: lines.slice(0, 2).join(' ').slice(0, 220), text: text.slice(0, 3500), source: f });
  });
}

// ---------- Règles ----------
const copy = read('Masterclass Copywriting post linked.txt').trim();
const data = read('Data Driven Masterclass Linkedin 1900+ Posts.md');
const section = (from, to) => { const i = data.indexOf(from); const j = data.indexOf(to, i + 1); return i < 0 ? '' : data.slice(i, j < 0 ? undefined : j).trim(); };
const rules = {
  copywriting: { text: copy, source: 'Masterclass Copywriting post linked.txt' },
  anatomy: { text: section('### 3.1', '## 📚'), source: 'Data Driven Masterclass Linkedin 1900+ Posts.md (partie 3)' },
  mistakes: { text: section('### 1.4', '### 1.5'), source: 'Data Driven Masterclass Linkedin 1900+ Posts.md (1.4)' },
};

const out = { builtAt: new Date().toISOString().slice(0, 10), counts: { hooks: hooks.length, hooksRaw: lib.items.length, structures: structures.length, templates: templates.length, posts: posts.length }, hooks, structures, templates, posts, rules };
fs.writeFileSync(new URL('../lib/knowledge.js', import.meta.url), `// Généré par tools/build-knowledge.mjs à partir des ressources Linka. Ne pas modifier à la main.\nexport default ${JSON.stringify(out)};\n`);
console.log(out.counts, [...new Set(hooks.map((h) => h.family))]);
console.log('authors', [...new Set(posts.map((p) => p.author))].map((a) => `${a}:${posts.filter((p) => p.author === a).length}`).join(', '));
