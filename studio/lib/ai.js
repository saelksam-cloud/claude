// Rédaction par IA via l'API OpenAI (clé saisie dans Réglages).
// La veille (exemples + posts des profils analysés) est partagée entre tous les clients :
// on prend d'abord les exemples de la niche du client, puis les meilleurs des autres niches.
// gpt-4.1 : rapide et bon rédacteur (les fonctions Netlify sont limitées à 60 s par appel).
const DEFAULT_MODEL = 'gpt-4.1';
const FALLBACK_MODELS = ['gpt-5-mini', 'gpt-4o-mini'];

function clientBrief(c) {
  return [
    `Auteur des posts : ${c.name}${c.company ? ` (${c.company})` : ''}`,
    c.niche && `Niche : ${c.niche}`,
    c.sector && `Secteur : ${c.sector}`,
    c.offer && `Offre : ${c.offer}`,
    c.audience && `Cible : ${c.audience}`,
    c.tone && `Ton et style : ${c.tone}`,
    c.themes && `Piliers de contenu :\n${c.themes}`,
    c.dos && `À faire : ${c.dos}`,
    c.donts && `À éviter : ${c.donts}`,
  ].filter(Boolean).join('\n');
}

const score = (v) => (Number(String(v.likes).replace(/\D/g, '')) || 0) + 2 * (Number(String(v.comments).replace(/\D/g, '')) || 0);
const sameNiche = (a, b) => a && b && a.trim().toLowerCase() === b.trim().toLowerCase();

// « Posts qui marchent » : tes exemples (choisis à la main) + le top 40 % des posts concurrents.
export function workingPosts(items) {
  const examples = items.filter((v) => v.source !== 'profile');
  const scraped = items.filter((v) => v.source === 'profile').sort((a, b) => score(b) - score(a));
  const keep = Math.max(Math.min(3, scraped.length), Math.ceil(scraped.length * 0.4));
  return [...examples, ...scraped.slice(0, keep)];
}

// Prend les meilleurs posts de CHAQUE concurrent à tour de rôle (le n°1 de Mattéo, le n°1 d'Amina, le n°2 de Mattéo…)
// pour qu'aucun ne prenne toute la place.
export function balancedTop(items, n) {
  const byAuthor = new Map();
  for (const v of [...items].sort((a, b) => score(b) - score(a))) {
    const k = (v.author || '?').trim().toLowerCase();
    if (!byAuthor.has(k)) byAuthor.set(k, []);
    byAuthor.get(k).push(v);
  }
  const lists = [...byAuthor.values()];
  const out = [];
  for (let i = 0; out.length < n && lists.some((l) => l[i]); i++) for (const l of lists) if (l[i] && out.length < n) out.push(l[i]);
  return out;
}

export function pickExamples(veille, niche, author = '') {
  const pool = workingPosts(veille);
  const inNiche = pool.filter((v) => sameNiche(v.niche, niche) && (!author || sameNiche(v.author, author)));
  const mine = balancedTop(inNiche, 12);
  const others = author ? [] : balancedTop(pool.filter((v) => !sameNiche(v.niche, niche)), 3);
  return { mine, others };
}

const fmtExamples = (list) => list.map((v, i) => `--- Exemple ${i + 1}${v.author ? ` — ${v.author}` : ''} (${v.likes || '?'} réactions, ${v.comments || '?'} commentaires)\n${v.text.slice(0, 2500)}`).join('\n');

const RULES = `Règles de sortie :
- Texte final du post LinkedIn uniquement, sans titre, sans guillemets, sans commentaire avant ou après.
- Pas de markdown (pas de **gras**, pas de #titres). Sauts de ligne pour aérer.
- 3 000 caractères maximum.
- N'invente jamais de chiffres, de clients ou d'anecdotes : si une info réelle manque, écris « [À COMPLÉTER : ce qu'il faut] ».`;

// Traduit les erreurs OpenAI en consignes claires.
function explain(status, err = {}) {
  const msg = err.message || '';
  const code = err.code || err.type || '';
  if (status === 401 || code === 'invalid_api_key') return 'Clé API OpenAI invalide : recrée une clé sur platform.openai.com/api-keys et colle-la dans Réglages.';
  if (code === 'insufficient_quota' || /quota|billing/i.test(msg)) return "Ta clé OpenAI n'a pas de crédit. Ajoute du crédit sur platform.openai.com → Settings → Billing (l'abonnement ChatGPT Plus ne compte pas pour l'API).";
  if (status === 429) return 'OpenAI limite le nombre de demandes : réessaie dans une minute.';
  if (status === 403 && /country|region|territory/i.test(msg)) return "OpenAI refuse l'accès depuis cette région.";
  return `OpenAI : ${msg || `erreur ${status}`}`;
}
const isModelProblem = (status, err = {}) =>
  status === 404 || err.code === 'model_not_found' || /model|verif/i.test(err.message || '') && status !== 401 && status !== 429;

// Les fonctions Netlify ont 60 s par appel : un post = 2 appels (content + hooker) de 28 s max.
async function chat(settings, system, user, { json: asJson = false, timeout = 28_000 } = {}) {
  if (!settings.openaiKey) throw new Error("Ajoute ta clé API OpenAI dans l'onglet Réglages.");
  const chosen = /^[\w.:-]+$/.test(settings.openaiModel || '') ? settings.openaiModel : DEFAULT_MODEL;
  const models = [chosen, ...FALLBACK_MODELS.filter((m) => m !== chosen)];
  let lastError;
  for (const model of models) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${settings.openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], ...(asJson ? { response_format: { type: 'json_object' } } : {}) }),
      signal: AbortSignal.timeout(timeout),
    }).catch((e) => { throw new Error(e.name === 'TimeoutError' ? "OpenAI a mis trop de temps à répondre : réessaie (ou choisis le modèle gpt-4.1 dans Réglages, plus rapide)." : `OpenAI injoignable : ${e.message}`); });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      const text = json.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("OpenAI n'a renvoyé aucun texte.");
      return { text, model };
    }
    lastError = explain(res.status, json.error);
    if (!isModelProblem(res.status, json.error)) break; // inutile d'essayer un autre modèle
  }
  throw new Error(lastError);
}

export async function testKey(settings) {
  const { model } = await chat(settings, 'Réponds juste OK.', 'Test');
  return model;
}

export async function writePost(settings, { client, module, subject, format, veille = [], analysis, previous, feedback, inspiration, avoidThemes = [], instruction = '', author = '' }) {
  const { mine, others } = pickExamples(veille, client.niche, author);
  const system = [
    module?.instructions ? `# Méthode d'écriture (module « ${module.name} »)\n${module.instructions}` : '',
    module?.knowledge ? `# Connaissances du module\n${module.knowledge}` : '',
    `# Brief client\n${clientBrief(client)}`,
    analysis ? `# Ce qui marche dans la niche (étude de marché)\n${analysis.slice(0, 4000)}` : '',
    client.feedbackLog?.length ? `# Retours précédents de l'auteur (à respecter absolument)\n${client.feedbackLog.slice(-15).map((f) => `- ${f.text}`).join('\n')}` : '',
    mine.length ? `# Posts qui performent le mieux chez ${author ? `le concurrent ${author}` : 'les concurrents de la niche'} (étude de marché : s'inspirer de leurs hooks, structures, formats et sujets qui marchent, ne jamais copier)\n${fmtExamples(mine)}` : '',
    others.length ? `# Posts qui performent dans d'autres niches (reprendre uniquement les mécaniques : hook, rythme, format)\n${fmtExamples(others)}` : '',
    RULES,
  ].filter(Boolean).join('\n\n');

  let user;
  if (previous) {
    user = `Réécris ce post en tenant compte du retour.\n\nRetour : ${feedback || 'améliore-le'}\n\nPost actuel :\n${previous}`;
  } else if (inspiration) {
    user = `Décline ce post qui marche pour l'auteur du brief : garde la mécanique (hook, structure, format), mais adapte totalement le sujet à sa niche et à sa cible.\n\nPost source :\n${inspiration.text}`;
  } else if (subject?.trim()) {
    user = `Écris un post LinkedIn${format ? ` au format « ${format} »` : ''} sur ce sujet : ${subject}`;
  } else {
    user = `Choisis toi-même un sujet fort tiré des piliers de contenu, différent de ceux déjà prévus${avoidThemes.length ? ` (${avoidThemes.slice(-25).join(' ; ')})` : ''}, puis écris le post.`;
  }
  if (instruction.trim()) user += `\n\nConsigne de l'auteur pour ce post : ${instruction.trim()}`;
  user += `\n\nCommence ta réponse par une ligne « SUJET : <sujet en 3 à 6 mots> », puis une ligne vide, puis le post.`;

  const { text } = await chat(settings, system, user);
  const m = /^\s*SUJET\s*:\s*(.+)\n+/i.exec(text);
  return {
    theme: m ? m[1].trim().slice(0, 60) : (subject || '').slice(0, 60),
    text: (m ? text.slice(m[0].length) : text).replace(/\*\*|__/g, '').trim(),
  };
}

export async function analyzeNiche(settings, niche, items) {
  const sorted = workingPosts(items).sort((a, b) => score(b) - score(a)).slice(0, 25);
  const system = "Tu es un expert en contenu LinkedIn. Tu analyses des posts qui performent pour en extraire des règles d'écriture réutilisables. Réponds en français, en texte simple (pas de markdown lourd), de façon concrète et actionnable.";
  const user = `Niche : ${niche || 'toutes niches'}\n\nÉtude de marché : voici les ${sorted.length} posts qui marchent le mieux chez les concurrents et dans la niche (triés par engagement). Donne :
1. Les 5 types de hooks qui marchent le mieux (avec un exemple réécrit pour chacun)
2. Les structures de post récurrentes
3. Longueur, rythme et mise en forme
4. Les formats et visuels qui reviennent
5. Les fins de post / appels à l'action efficaces
6. 10 idées de sujets à décliner

${fmtExamples(sorted)}`;
  const { text } = await chat(settings, system, user, { timeout: 55_000 });
  return text;
}

// ---------- Passe « hooker » : retravaille uniquement l'accroche ----------
export async function hookPass(settings, { text, module, topHooks = [] }) {
  const system = [
    module?.instructions ? `# Méthode « ${module.name} »\n${module.instructions}` : '',
    module?.knowledge ? `# Connaissances\n${module.knowledge}` : '',
    "# Ton rôle\nTu es spécialiste des hooks LinkedIn : les 1 à 3 premières lignes, visibles avant « … voir plus ». Elles doivent arrêter le scroll et donner envie de cliquer.",
    topHooks.length ? `# Hooks qui performent le mieux dans la niche (s'en inspirer, ne pas copier)\n${topHooks.map((h) => `- ${h}`).join('\n')}` : '',
    "# Règles\n- Réécris SEULEMENT le hook (les 1 à 3 premières lignes) ; garde le reste du post identique.\n- Moins de 200 caractères pour le hook.\n- Pas de markdown, pas de commentaire : réponds avec le post complet final.",
  ].filter(Boolean).join('\n\n');
  const { text: out } = await chat(settings, system, `Post :\n${text}`);
  return out.replace(/\*\*|__/g, '').replace(/^\s*SUJET\s*:.*\n+/i, '').trim();
}

// ---------- Veille : extraction des posts depuis un copier-coller ----------
export const HOOK_TYPES = ['Question', 'Chiffre / résultat', 'Contre-intuitif', 'Histoire perso', 'Liste / promesse', 'Confession', 'Conseil direct', 'Avant / après', 'Citation', 'Autre'];
export const FORMATS = ['Texte court', 'Texte long', 'Liste', 'Storytelling', 'Carrousel', 'Image', 'Vidéo', 'Sondage'];

export async function extractPosts(settings, { text, niche, knownTopics = [] }) {
  const system = `Tu extrais des posts LinkedIn à partir d'un copier-coller brut (posts isolés ou page « Activité » d'un profil, avec du bruit : menus, boutons, « J'aime », « Commenter »…).
Réponds en JSON : { "posts": [ { "author": "", "hook": "", "excerpt": "", "likes": 0, "comments": 0, "reposts": 0, "length": 0, "topic": "", "hookType": "", "format": "" } ] }
- hook : la ou les 2 premières lignes du post, telles quelles.
- excerpt : le texte du post, 1 200 caractères maximum, texte exact.
- likes / comments / reposts : nombres lus dans le texte (« 1 234 », « 1,2k » = 1200), 0 si absent.
- length : nombre approximatif de caractères du post complet.
- topic : le sujet en 1 à 3 mots, en français. Réutilise si possible un de ces sujets : ${knownTopics.slice(0, 40).join(', ') || '(aucun pour l\'instant)'}.
- hookType : un parmi ${HOOK_TYPES.join(' | ')}.
- format : un parmi ${FORMATS.join(' | ')} (Image/Carrousel/Vidéo si le texte mentionne un média).
Ignore les commentaires des autres personnes et les publicités. N'invente rien. Niche : ${niche || 'non précisée'}.`;
  const { text: out } = await chat(settings, system, text.slice(0, 30_000), { json: true, timeout: 55_000 });
  let data;
  try { data = JSON.parse(out); } catch { throw new Error("L'IA n'a pas renvoyé un résultat lisible : réessaie avec un plus petit morceau."); }
  return (data.posts || []).filter((p) => p && (p.hook || p.excerpt));
}

// ---------- Étude de marché : feedback écrit à partir des statistiques ----------
export async function studyFeedback(settings, { niche, stats, top, flop }) {
  const system = "Tu es analyste en contenu LinkedIn. À partir de statistiques et d'exemples, tu écris un retour clair, concret et actionnable, en français, sans markdown lourd (titres en MAJUSCULES, puis des tirets).";
  const user = `Niche : ${niche || 'toutes'}

STATISTIQUES (engagement moyen = réactions + 2 × commentaires)
${stats}

POSTS QUI MARCHENT LE MIEUX
${top.map((v) => `- [${v.likes} 👍 / ${v.comments} 💬] ${v.hook}`).join('\n')}

POSTS QUI MARCHENT LE MOINS
${flop.map((v) => `- [${v.likes} 👍 / ${v.comments} 💬] ${v.hook}`).join('\n')}

Écris :
CE QUI MARCHE — 4 à 6 constats chiffrés
CE QUI MARCHE MOINS — 3 à 5 constats chiffrés
LES HOOKS QUI REVIENNENT — les mécaniques les plus fréquentes et les plus efficaces, avec 1 exemple réécrit pour chacune
À FAIRE DANS NOS POSTS — 6 recommandations précises
10 SUJETS À TRAITER EN PRIORITÉ`;
  const { text } = await chat(settings, system, user, { timeout: 55_000 });
  return text;
}
