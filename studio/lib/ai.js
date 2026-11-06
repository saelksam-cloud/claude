// Rédaction par IA : les instructions de tes modules (récupérées de tes GPTs) + la fiche voix du client
// sont envoyées à l'API OpenAI avec ta propre clé.
const DEFAULT_MODEL = 'gpt-5';

function clientBrief(c) {
  return [
    `Auteur des posts : ${c.name}${c.company ? ` (${c.company})` : ''}`,
    c.sector && `Secteur : ${c.sector}`,
    c.offer && `Offre : ${c.offer}`,
    c.audience && `Cible : ${c.audience}`,
    c.tone && `Ton et style : ${c.tone}`,
    c.themes && `Piliers de contenu :\n${c.themes}`,
    c.dos && `À faire : ${c.dos}`,
    c.donts && `À éviter : ${c.donts}`,
  ].filter(Boolean).join('\n');
}

const RULES = `Règles de sortie :
- Réponds UNIQUEMENT avec le texte final du post LinkedIn, sans titre, sans guillemets, sans commentaire avant ou après.
- Pas de markdown (pas de **gras**, pas de #titres). Sauts de ligne pour aérer.
- 3 000 caractères maximum.
- N'invente jamais de chiffres, de clients ou d'anecdotes : si une info réelle manque, écris « [À COMPLÉTER : ce qu'il faut] ».`;

export async function writePost(settings, { client, module, subject, format, veille = [], previous, feedback }) {
  if (!settings.openaiKey) throw new Error("Ajoute ta clé API OpenAI dans l'onglet Réglages.");
  const system = [
    module?.instructions ? `# Méthode d'écriture (module « ${module.name} »)\n${module.instructions}` : '',
    module?.knowledge ? `# Connaissances du module\n${module.knowledge}` : '',
    `# Brief client\n${clientBrief(client)}`,
    veille.length ? `# Posts qui performent dans la niche (inspiration, ne pas copier)\n${veille.slice(0, 8).map((v, i) => `--- ${i + 1} (${v.likes || '?'} réactions)\n${v.text}`).join('\n')}` : '',
    RULES,
  ].filter(Boolean).join('\n\n');

  const user = previous
    ? `Réécris ce post en tenant compte du retour.\n\nRetour : ${feedback || 'améliore-le'}\n\nPost actuel :\n${previous}`
    : `Écris un post LinkedIn${format ? ` au format « ${format} »` : ''} sur ce sujet : ${subject}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${settings.openaiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: /^[\w.:-]+$/.test(settings.openaiModel || '') ? settings.openaiModel : DEFAULT_MODEL,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
    signal: AbortSignal.timeout(55_000),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`OpenAI : ${json.error?.message || `HTTP ${res.status}`}`);
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI n'a renvoyé aucun texte.");
  return text;
}
