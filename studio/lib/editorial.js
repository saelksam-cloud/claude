// Moteur éditorial LinkedMotion : ADN client → plan (angle, structure, hooks) → rédaction → hooks notés /100 → contrôle qualité.
// Les ressources Linka (lib/knowledge.js) sont interrogées : on n'envoie à l'IA que ce qui sert au post en cours.
import KB from './knowledge.js';

// ---------- Référentiels ----------
export const OBJECTIVES = ['Notoriété', 'Autorité', 'Attirer des prospects', 'Conversations commerciales', 'Confiance', 'Faire connaître une offre', 'Communauté', 'Recrutement', 'Fidélisation', 'Demandes entrantes'];
export const POST_TYPES = ['Storytelling personnel', 'Contenu éducatif', 'Opinion', "Contenu d'autorité", "Retour d'expérience", 'Étude de cas', 'Erreur à éviter', 'Coulisses', 'Analyse de marché', 'Comparatif', "Présentation d'offre", "Réponse à une objection"];
export const ANGLES = ['Opinion contre-intuitive', 'Erreur fréquente', 'Méthode', 'Comparaison', "Retour d'expérience", "Déconstruction d'une croyance", 'Coulisses du métier', 'Observation terrain', 'Question que les prospects posent', 'Conséquence cachée'];
export const AWARENESS = ['', 'Non conscient du problème', 'Conscient du problème', 'Conscient des solutions', "Conscient de l'offre", 'Très conscient (dernières objections)'];
export const HOOK_FAMILIES = [...new Set(KB.hooks.map((h) => h.family))];
export const QUALITY_CRITERIA = ['Force et clarté du hook', 'Pertinence pour la cible', "Spécificité de l'angle", 'Structure narrative', 'Fluidité', 'Rétention', 'Valeur concrète', 'Authenticité', 'Cohérence avec le client', 'Qualité du CTA'];
export const knowledgeCounts = KB.counts;
export const knowledge = KB;

// Règles globales LinkedMotion (indépendantes du client), tirées de la Masterclass Copywriting de Linka.
const GLOBAL_RULES = `# Règles LinkedMotion (toujours)
- Une seule idée principale par post. Un bénéfice concret pour le lecteur.
- Hook compris immédiatement ; phrases courtes ; texte très aéré ; transitions naturelles ; aucun remplissage, aucun jargon inutile.
- Aucun emoji. Pas de markdown. Pas de hashtags sauf demande.
- Longueur adaptée au sujet, souvent 100 à 170 mots ; pas de limite artificielle si le format demande plus.
- CTA adapté à l'objectif du post.
- INTERDIT : inventer des chiffres, des résultats, des clients, des témoignages ou des anecdotes personnelles. N'utilise QUE les preuves fournies et vérifiées. S'il manque une info réelle, écris [À COMPLÉTER : ce qu'il faut].
- Aucune promesse de viralité. Pas de clichés LinkedIn (« Et si… », « Dans un monde où », « Saviez-vous que », « Voici pourquoi c'est important »).
- Respecte strictement la voix du client plutôt qu'un style LinkedIn générique.

# Masterclass Copywriting (Linka)
${KB.rules.copywriting.text.slice(0, 4200)}`;

// ---------- Fiche ADN → texte pour l'IA ----------
const line = (label, v) => (v && String(v).trim() ? `${label} : ${String(v).trim()}` : '');
const block = (title, lines) => { const l = lines.filter(Boolean); return l.length ? `## ${title}\n${l.join('\n')}` : ''; };
const statusTag = (s) => (s === 'hypothesis' ? ' (hypothèse IA, à prendre avec prudence)' : '');

export function personaText(p) {
  if (!p) return '';
  return block(`Persona ciblé : ${p.name || 'sans nom'}${statusTag(p.status)}`, [
    line('Fonction', p.role), line('Secteur', p.sector), line("Type et taille d'entreprise", [p.companyType, p.companySize].filter(Boolean).join(', ')),
    line('Responsabilité / situation', p.responsibility), line('Problèmes prioritaires', p.problems), line('Frustrations quotidiennes', p.frustrations),
    line('Problèmes sous-jacents', p.hiddenProblems), line('Conséquences (argent, carrière)', p.consequences), line('Peurs et risques perçus', p.fears),
    line('Désirs immédiats', p.desires), line('Ambitions long terme', p.ambitions), line('Objections rationnelles', p.objectionsRational),
    line('Objections émotionnelles', p.objectionsEmotional), line('Croyances (limitantes / du secteur)', p.beliefs), line('Mauvaises habitudes', p.habits),
    line('Déjà essayé / alternatives', p.alternatives), line("Déclencheurs d'achat", p.triggers), line('Vocabulaire réellement utilisé', p.vocabulary),
    line('Niveau de conscience', AWARENESS[p.awareness] || ''),
  ]);
}

export function adnText(client, { personaId, includeProofs = true } = {}) {
  const a = client.adn || {};
  const pr = a.profile || {};
  const v = a.voice || {};
  const persona = (a.personas || []).find((p) => p.id === personaId);
  const proofs = (a.proofs || []).filter((p) => p.status === 'verified' && p.permission !== false);
  return [
    block(`Client : ${client.name}${client.company ? ` (${client.company})` : ''}`, [
      line('Niche', client.niche), line('Secteur', client.sector), line('Métier / spécialité', pr.job), line('Parcours', pr.background),
      line('Positionnement', pr.positioning), line('Expertises', pr.expertise), line('Différenciation', pr.differentiation), line('Valeurs', pr.values),
      line('Convictions', pr.convictions), line('Vision du marché', pr.vision), line('Offres', pr.offers || client.offer), line('Prix', pr.prices),
      line('Promesses justifiables', pr.promises), line('Sujets de prédilection', client.themes),
    ]),
    a.objectives?.length ? `## Objectifs LinkedIn (par priorité)\n${a.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}` : '',
    persona ? personaText(persona) : line('Cible générale', client.audience),
    block('Voix éditoriale', [
      line('Ton', v.tone || client.tone), line('Adresse', v.address), line('Niveau de langage', v.level), line('Vocabulaire habituel', v.vocabulary),
      line('Expressions récurrentes', v.expressions), line('Longueur des phrases', v.sentenceLength), line('Longueur des posts', v.postLength),
      line('Listes', v.lists), line('Storytelling apprécié', v.storytelling), line('Opinions fortes', v.opinions),
      line('Expressions INTERDITES', [v.forbidden, client.donts].filter(Boolean).join(' ; ')), line('À faire', client.dos),
      line('Sujets interdits', a.forbiddenTopics),
    ]),
    v.samples ? `## Textes réellement écrits par le client (imiter cette voix)\n${String(v.samples).slice(0, 5000)}` : '',
    (a.rules || []).length ? `## Règles permanentes validées par le client\n${a.rules.map((r) => `- ${r}`).join('\n')}` : '',
    (client.feedbackLog || []).length ? `## Retours récents du client (ponctuels, à prendre en compte si pertinent)\n${client.feedbackLog.slice(-8).map((f) => `- ${f.text}`).join('\n')}` : '',
    includeProofs ? (proofs.length ? `## Preuves vérifiées utilisables (les SEULES autorisées)\n${proofs.map((p) => `- [${p.id}] (${p.type}) ${p.text}${p.source ? ` — source : ${p.source}` : ''}`).join('\n')}` : "## Preuves\nAucune preuve vérifiée : n'utilise aucun chiffre ni résultat client ; écris [À COMPLÉTER : …] si le post en a besoin.") : '',
  ].filter(Boolean).join('\n\n');
}

// ---------- Recherche dans la base de connaissances ----------
const words = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-z]{4,}/g) || [];
const seeded = (seed) => { let x = [...String(seed)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7); return () => ((x = (x * 1103515245 + 12345) >>> 0) / 2 ** 32); };

export function structureCatalog() {
  return KB.structures.map((s) => `${s.id} · ${s.name}${s.note ? ` — ${s.note.slice(0, 110)}` : ''}`).join('\n');
}
export const findStructure = (id) => KB.structures.find((s) => s.id === id) || null;

export function pickHookTemplates({ families = [], prefs = {}, seed = '', n = 10 }) {
  const rnd = seeded(seed);
  const ok = KB.hooks.filter((h) => !prefs[h.id]?.off);
  const fav = ok.filter((h) => prefs[h.id]?.fav && (!families.length || families.includes(h.family)));
  const pool = ok.filter((h) => !families.length || families.includes(h.family));
  const shuffled = [...pool].sort(() => rnd() - 0.5);
  const fr = shuffled.filter((h) => h.lang === 'fr');
  const en = shuffled.filter((h) => h.lang !== 'fr');
  return [...new Map([...fav, ...fr.slice(0, Math.ceil(n / 2)), ...en].map((h) => [h.id, h])).values()].slice(0, n);
}

export function pickExamplePosts({ query = '', seed = '', n = 3, exclude = [] }) {
  const q = new Set(words(query));
  const rnd = seeded(seed);
  return KB.posts.filter((p) => !exclude.includes(p.id))
    .map((p) => ({ p, s: words(p.text).filter((w) => q.has(w)).length + rnd() }))
    .sort((a, b) => b.s - a.s).slice(0, n).map((x) => x.p);
}

// ---------- Prompts des étapes ----------
export function planPrompt({ client, personaId, objective, awareness, topic, idea, avoid = {}, inspiration }) {
  const system = `Tu es le stratège éditorial de LinkedMotion. Avant toute rédaction, tu prépares le plan d'UN post LinkedIn pour ce client.
${adnText(client, { personaId })}

# Choix possibles
Types de post : ${POST_TYPES.join(' | ')}
Angles : ${ANGLES.join(' | ')}
Familles de hooks : ${HOOK_FAMILIES.join(' | ')}
Structures (bibliothèque Linka) :
${structureCatalog()}

# Règles
- Un angle réellement distinct et spécifique au client (pas une généralité).
- Adapte l'angle, la pédagogie et le CTA au niveau de conscience du persona.
- Ne choisis une structure de type « résultat client / étude de cas » QUE si une preuve vérifiée existe.
- N'utilise jamais une preuve absente de la liste ; liste dans "missing" les infos qui manqueraient.
${avoid.angles?.length ? `- À ÉVITER (déjà utilisés) : angles ${avoid.angles.join(', ')} ; structures ${avoid.structures?.join(', ') || '-'} ; sujets ${avoid.themes?.slice(-20).join(' ; ') || '-'}` : ''}
Réponds en JSON : { "topic": "", "angle": { "type": "", "idea": "", "target": "", "benefit": "", "objective": "" }, "postType": "", "awareness": 1-5, "structureId": "S..", "hookFamilies": ["", "", ""], "cta": "", "proofIds": [], "missing": [], "why": "2 phrases : pourquoi cet angle, cette structure et ces hooks" }`;
  const user = [
    topic ? `Sujet / brief : ${topic}` : 'Pas de sujet imposé : choisis un sujet fort lié aux objectifs et aux problèmes du persona, différent des sujets déjà traités.',
    idea ? `Idée validée à exploiter : ${idea}` : '',
    objective ? `Objectif du post : ${objective}` : '',
    awareness ? `Niveau de conscience visé : ${AWARENESS[awareness]}` : '',
    inspiration ? `Post de veille dont reprendre la mécanique (pas le sujet) :\n${inspiration.slice(0, 1200)}` : '',
  ].filter(Boolean).join('\n');
  return { system, user };
}

export function writePrompt({ client, personaId, plan, extra = {} }) {
  const st = findStructure(plan.structureId) || KB.structures[0];
  const examples = pickExamplePosts({ query: `${plan.topic} ${plan.angle?.idea} ${st.name}`, seed: plan.topic, n: 2 });
  const system = [
    `Tu es le meilleur ghostwriter LinkedIn francophone. Tu écris pour ${client.name}, à sa place, en français.`,
    GLOBAL_RULES,
    `# Anatomie d'un post qui performe (Data Driven Masterclass Linka, repères non garantis)\n${KB.rules.anatomy.text.slice(0, 2200)}`,
    adnText(client, { personaId }),
    `# Structure choisie : ${st.id} · ${st.name}\n${st.note}\nSchéma (à adapter en français, pas à traduire mot à mot) :\n${st.schema}`,
    examples.length ? `# Posts de référence (créateurs analysés par Linka) : reprends la qualité du rythme et de la mise en page, JAMAIS le contenu\n${examples.map((p) => `--- ${p.author}\n${p.text.slice(0, 1400)}`).join('\n')}` : '',
    extra.forms ? `# Formes qui marchent dans la veille\n${extra.forms}` : '',
    extra.niche ? `# Fond : posts qui marchent dans la niche du client (sujets, vocabulaire de la cible)\n${extra.niche}` : '',
    extra.module ? extra.module : '',
  ].filter(Boolean).join('\n\n');
  const user = `Plan validé :\n${JSON.stringify(plan, null, 1)}\n\nRédige le post complet en suivant le plan et la structure. Le hook sera optimisé ensuite : écris une première version correcte.\nRéponds uniquement avec le texte du post.`;
  return { system, user };
}

export const HOOK_SCORING = `Note chaque hook sur 100 (conventions internes LinkedMotion, pas une prédiction de viralité) :
1. Pertinence pour la cible — /30 (bon persona, problème ou désir réel, niveau de conscience, vocabulaire de la cible)
2. Curiosité et pouvoir d'attention — /25 (envie de continuer, tension, élément distinctif, curiosité légitime)
3. Clarté immédiate — /20 (sujet compris tout de suite, facile à lire, mots précis)
4. Crédibilité et cohérence — /15 (promesse tenue par le post, faits confirmés, pas d'exagération)
5. Originalité — /10 (pas générique, angle distinctif, pas de cliché)`;

export function hooksPrompt({ client, personaId, text, plan, prefs = {}, veilleHooks = [], module, count = 10 }) {
  const templates = pickHookTemplates({ families: plan?.hookFamilies || [], prefs, seed: text?.slice(0, 40) || plan?.topic, n: 14 });
  const system = [
    "Tu es le meilleur spécialiste des hooks LinkedIn francophones. Le hook = les 1 à 3 premières lignes, avant « … voir plus ».",
    `# Un excellent hook
- Interrompt le défilement, compris immédiatement, cible une audience identifiable.
- Déclenche une émotion ou une curiosité ; évoque un problème, un désir, un risque ou une opportunité ; donne une raison précise de lire la suite.
- Fidèle au contenu du post ; ne promet aucun résultat non démontré ; environ 10 mots quand c'est naturel ; aucun emoji ; rien de vague ou sensationnaliste.`,
    adnText(client, { personaId, includeProofs: true }),
    `# Modèles de la bibliothèque Linka (structures à ADAPTER, jamais à recopier)\n${templates.map((h) => `- [${h.family}] ${h.template}`).join('\n')}`,
    veilleHooks.length ? `# Hooks qui marchent dans la veille\n${veilleHooks.map((h) => `- ${h}`).join('\n')}` : '',
    module || '',
    HOOK_SCORING,
  ].filter(Boolean).join('\n\n');
  const user = `${text ? `Post :\n${text}` : `Sujet : ${plan?.topic || ''}`}

Écris ${count} hooks VRAIMENT différents (mécaniques variées : contre-intuition, curiosité, contraste, erreur, confession, promesse concrète, résultat vérifié, observation terrain, méthode, question spécifique…), pas des reformulations.
Réponds en JSON : { "hooks": [ { "text": "", "family": "", "persona": "", "scores": { "cible": 0, "curiosite": 0, "clarte": 0, "credibilite": 0, "originalite": 0 }, "total": 0, "forces": "5 mots", "faiblesses": "5 mots", "amelioration": "10 mots max" } ] }
Sois bref dans forces / faiblesses / amelioration.`;
  return { system, user };
}

export function qualityPrompt({ client, personaId, text, plan }) {
  const system = `Tu es le rédacteur en chef de LinkedMotion. Tu évalues un brouillon de post pour l'améliorer (ce n'est pas une prédiction de performance).
${adnText(client, { personaId })}
${GLOBAL_RULES.split('# Masterclass')[0]}
Critères : ${QUALITY_CRITERIA.join(' | ')}
Réponds en JSON : { "criteria": [ { "name": "", "level": "Fort|Moyen|Faible", "issue": "", "fix": "" } ], "summary": "1 phrase", "inventedRisk": "liste de chiffres ou faits non prouvés repérés, sinon vide" }`;
  const user = `${plan ? `Plan : ${JSON.stringify({ angle: plan.angle, structureId: plan.structureId, postType: plan.postType })}\n\n` : ''}Post :\n${text}`;
  return { system, user };
}

export const REWRITE_ACTIONS = {
  hook: 'Améliore uniquement le hook (1 à 3 premières lignes) ; garde le reste.',
  shorter: 'Raccourcis le post d\'environ 30 % sans perdre l\'idée ni la voix.',
  value: 'Ajoute de la valeur concrète (exemple, méthode, étape actionnable) sans inventer de chiffres.',
  natural: 'Rends le texte plus naturel, comme parlé, moins « LinkedIn ».',
  angle: "Change d'angle (un angle vraiment différent) en gardant le sujet.",
  structure: 'Réécris avec une autre structure de la bibliothèque, adaptée au sujet.',
  story: 'Renforce le storytelling (scène, tension, tournant) sans inventer de faits : utilise [À COMPLÉTER] si une anecdote réelle manque.',
  voice: 'Réécris strictement avec la voix du client (vocabulaire, longueur de phrases, ton, adresse).',
  other: 'Propose une autre version complète, différente, du même post.',
};

export function rewritePrompt({ client, personaId, text, instruction, plan }) {
  const st = plan?.structureId ? findStructure(plan.structureId) : null;
  const system = [
    `Tu es le meilleur ghostwriter LinkedIn francophone, tu écris pour ${client.name}.`,
    GLOBAL_RULES,
    adnText(client, { personaId }),
    st ? `# Structure actuelle : ${st.name}\n${st.schema}` : '',
    instruction.includes('autre structure') ? `# Autres structures possibles\n${structureCatalog()}` : '',
  ].filter(Boolean).join('\n\n');
  return { system, user: `Consigne : ${instruction}\n\nPost actuel :\n${text}\n\nRéponds uniquement avec le post réécrit.` };
}

// ---------- Onboarding ----------
export const ONBOARDING_QUESTIONS = [
  'Que fait ton entreprise ?', 'Quelles sont tes offres (et tes prix si tu veux) ?', "Qu'est-ce qui te différencie ?", 'Qui sont tes meilleurs clients ?',
  'Quels problèmes résous-tu ?', 'Quelles frustrations tes clients expriment-ils ?', "Qu'ont-ils déjà essayé ?", "Qu'est-ce qui les empêche de passer à l'action ?",
  'Quels résultats peux-tu démontrer (avec source) ?', "Quelles objections entends-tu le plus ?", 'Quelles convictions défends-tu ?', 'Quelles idées reçues veux-tu contester ?',
  'Quelles expériences personnelles veux-tu raconter ?', 'Quels sujets ne veux-tu jamais aborder ?', 'Quels sont tes objectifs sur LinkedIn ?',
  "À quoi reconnaîtras-tu qu'un post est réussi ?", 'Trois posts dont tu aimes le style (colle-les ou décris-les) :', 'Trois posts qui ne te ressemblent pas :',
];
export const INTERVIEW_QUESTIONS = [
  'Quelle erreur vois-tu régulièrement dans ton secteur ?', 'Quelle croyance répandue ne partages-tu pas ?', 'Quel problème tes clients comprennent-ils trop tard ?',
  'Quelle méthode utilises-tu pour obtenir un résultat ?', 'Quelle expérience a changé ta manière de travailler ?', 'Quelle question tes prospects te posent-ils souvent ?',
  "Quel conseil donnerais-tu à quelqu'un qui débute ?",
];

export function onboardingPrompt({ client, answers }) {
  const system = `Tu es le stratège de LinkedMotion. À partir des réponses d'onboarding, tu proposes la fiche éditoriale du client.
Tout ce que tu déduis est une HYPOTHÈSE à valider : ne présente rien comme un fait connu. N'invente aucun chiffre, résultat ou témoignage.
Réponds en JSON :
{ "summary": "", "positioning": "", "personas": [ { "name": "", "role": "", "sector": "", "companyType": "", "companySize": "", "problems": "", "frustrations": "", "fears": "", "desires": "", "ambitions": "", "objectionsRational": "", "objectionsEmotional": "", "beliefs": "", "alternatives": "", "triggers": "", "vocabulary": "", "awareness": 1-5 } ],
  "pillars": ["", ""], "angles": ["", ""], "voice": { "tone": "", "address": "vous|tu", "level": "", "vocabulary": "", "forbidden": "", "postLength": "", "storytelling": "" },
  "proofs": [ { "type": "", "text": "", "source": "réponse d'onboarding" } ], "missing": ["informations à demander au client"] }`;
  const user = `Client : ${client.name}${client.company ? ` (${client.company})` : ''}, niche ${client.niche || '?'}\n\n${Object.entries(answers || {}).filter(([, a]) => a && a.trim()).map(([q, a]) => `Q : ${q}\nR : ${a}`).join('\n\n')}`;
  return { system, user };
}

export function interviewPrompt({ client, answers }) {
  const system = `Tu exploites une interview client pour LinkedMotion. Extrais des idées de posts réellement fondées sur les réponses (n'invente rien).
Réponds en JSON : { "ideas": [ { "title": "", "angle": "", "postType": "", "source": "question d'origine" } ], "convictions": [""], "objections": [""], "stories": ["anecdotes réelles mentionnées, à faire valider"] }`;
  const user = `Client : ${client.name}\n\n${Object.entries(answers || {}).filter(([, a]) => a && a.trim()).map(([q, a]) => `Q : ${q}\nR : ${a}`).join('\n\n')}`;
  return { system, user };
}

export function hookToolPrompt({ client, personaId, topic, count, prefs }) {
  const per = Math.max(1, Math.ceil(count / 8));
  const families = HOOK_FAMILIES.slice(0, Math.min(HOOK_FAMILIES.length, Math.ceil(count / per)));
  const templates = families.flatMap((f) => pickHookTemplates({ families: [f], prefs, seed: topic, n: 2 }));
  const system = `Tu écris des hooks LinkedIn en français pour ${client.name}.
${adnText(client, { personaId, includeProofs: true })}
Règles : environ 10 mots, aucun emoji, compris immédiatement, fidèle à un post réaliste, aucune promesse non prouvée, pas de clichés.
Modèles Linka à adapter :\n${templates.map((h) => `- [${h.family}] ${h.template}`).join('\n')}
Réponds en JSON : { "hooks": [ { "text": "", "family": "" } ] }`;
  return { system, user: `Sujet : ${topic}\nÉcris ${count} hooks répartis entre ces familles : ${families.join(', ')}.` };
}

export function optimizeHookPrompt({ client, personaId, hook, mode }) {
  const modes = { short: 'plus court', precise: 'plus précis', intriguing: 'plus intrigant', direct: 'plus direct', emotional: 'plus émotionnel', expert: 'plus expert', persona: 'plus spécifique au persona' };
  const system = `Tu optimises des hooks LinkedIn pour ${client.name}.\n${adnText(client, { personaId, includeProofs: true })}\n${HOOK_SCORING}
Réponds en JSON : { "hooks": [ { "text": "", "family": "", "scores": { "cible": 0, "curiosite": 0, "clarte": 0, "credibilite": 0, "originalite": 0 }, "total": 0, "forces": "", "faiblesses": "", "amelioration": "" } ] }`;
  return { system, user: `Hook : ${hook}\nPropose 3 variantes ${modes[mode] || 'meilleures'}, notées.` };
}

// Remplace le hook (premières lignes jusqu'à la première ligne vide) par le hook choisi.
export function applyHook(text, hook) {
  const parts = text.split(/\n\s*\n/);
  parts[0] = hook.trim();
  return parts.join('\n\n');
}

export function normalizeHooks(list = []) {
  const W = { cible: 30, curiosite: 25, clarte: 20, credibilite: 15, originalite: 10 };
  return list.filter((h) => h && h.text).map((h) => {
    const sc = {};
    for (const [k, max] of Object.entries(W)) sc[k] = Math.max(0, Math.min(max, Math.round(Number(h.scores?.[k]) || 0)));
    const total = Object.values(sc).reduce((a, b) => a + b, 0) || Math.round(Number(h.total) || 0);
    return { text: String(h.text).replace(/\*\*/g, '').trim(), family: h.family || '', persona: h.persona || '', scores: sc, total, forces: h.forces || '', faiblesses: h.faiblesses || '', amelioration: h.amelioration || '' };
  }).sort((a, b) => b.total - a.total);
}
