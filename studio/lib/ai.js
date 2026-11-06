// Rédaction par IA via l'API OpenAI (clé saisie dans Réglages).
// La veille (exemples + posts des profils analysés) est partagée entre tous les clients :
// on prend d'abord les exemples de la niche du client, puis les meilleurs des autres niches.
const DEFAULT_MODEL = 'gpt-5';
const FALLBACK_MODELS = ['gpt-4.1', 'gpt-4o-mini'];

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

export function pickExamples(veille, niche) {
  const sorted = [...veille].sort((a, b) => score(b) - score(a));
  const mine = sorted.filter((v) => sameNiche(v.niche, niche)).slice(0, 6);
  const others = sorted.filter((v) => !sameNiche(v.niche, niche)).slice(0, 3);
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

async function chat(settings, system, user) {
  if (!settings.openaiKey) throw new Error("Ajoute ta clé API OpenAI dans l'onglet Réglages.");
  const chosen = /^[\w.:-]+$/.test(settings.openaiModel || '') ? settings.openaiModel : DEFAULT_MODEL;
  const models = [chosen, ...FALLBACK_MODELS.filter((m) => m !== chosen)];
  let lastError;
  for (const model of models) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${settings.openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
      signal: AbortSignal.timeout(50_000),
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

export async function writePost(settings, { client, module, subject, format, veille = [], analysis, previous, feedback, inspiration, avoidThemes = [] }) {
  const { mine, others } = pickExamples(veille, client.niche);
  const system = [
    module?.instructions ? `# Méthode d'écriture (module « ${module.name} »)\n${module.instructions}` : '',
    module?.knowledge ? `# Connaissances du module\n${module.knowledge}` : '',
    `# Brief client\n${clientBrief(client)}`,
    analysis ? `# Ce qui marche dans la niche (analyse de la veille)\n${analysis.slice(0, 4000)}` : '',
    mine.length ? `# Posts qui performent dans la niche du client (s'inspirer des hooks, structures et formats, ne jamais copier)\n${fmtExamples(mine)}` : '',
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
  user += `\n\nCommence ta réponse par une ligne « SUJET : <sujet en 3 à 6 mots> », puis une ligne vide, puis le post.`;

  const { text } = await chat(settings, system, user);
  const m = /^\s*SUJET\s*:\s*(.+)\n+/i.exec(text);
  return {
    theme: m ? m[1].trim().slice(0, 60) : (subject || '').slice(0, 60),
    text: (m ? text.slice(m[0].length) : text).replace(/\*\*|__/g, '').trim(),
  };
}

export async function analyzeNiche(settings, niche, items) {
  const sorted = [...items].sort((a, b) => score(b) - score(a)).slice(0, 25);
  const system = "Tu es un expert en contenu LinkedIn. Tu analyses des posts qui performent pour en extraire des règles d'écriture réutilisables. Réponds en français, en texte simple (pas de markdown lourd), de façon concrète et actionnable.";
  const user = `Niche : ${niche || 'toutes niches'}\n\nAnalyse ces ${sorted.length} posts (triés par engagement) et donne :
1. Les 5 types de hooks qui marchent le mieux (avec un exemple réécrit pour chacun)
2. Les structures de post récurrentes
3. Longueur, rythme et mise en forme
4. Les formats et visuels qui reviennent
5. Les fins de post / appels à l'action efficaces
6. 10 idées de sujets à décliner

${fmtExamples(sorted)}`;
  const { text } = await chat(settings, system, user);
  return text;
}
