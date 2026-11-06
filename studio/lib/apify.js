// Analyse de profils LinkedIn via Apify : c'est Apify qui récupère les posts publics,
// jamais ton compte LinkedIn (aucun risque de blocage pour toi).
const API = 'https://api.apify.com/v2';
export const DEFAULT_ACTOR = 'harvestapi~linkedin-profile-posts';

async function call(token, path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    signal: AbortSignal.timeout(25_000),
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('Clé Apify invalide (onglet Réglages).');
  if (!res.ok) throw new Error(`Apify : ${json.error?.message || `erreur ${res.status}`}`);
  return json;
}

const actorPath = (actor) => encodeURIComponent((actor || DEFAULT_ACTOR).replace('/', '~'));

export async function startProfileRun(token, actor, profileUrl, maxPosts = 50) {
  const { data } = await call(token, `/acts/${actorPath(actor)}/runs`, {
    method: 'POST',
    // Plusieurs noms de champs pour rester compatible avec les principaux robots « profile posts ».
    body: JSON.stringify({ targetUrls: [profileUrl], profileUrls: [profileUrl], profiles: [profileUrl], maxPosts }),
  });
  return { runId: data.id, datasetId: data.defaultDatasetId, status: data.status };
}

export async function getRun(token, runId) {
  const { data } = await call(token, `/actor-runs/${runId}`);
  return { status: data.status, datasetId: data.defaultDatasetId };
}

const num = (...vals) => {
  for (const v of vals) {
    const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/[^\d]/g, ''));
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
};

// Normalise les différents formats de sortie des robots Apify.
export function normalizePost(it) {
  const text = it.content || it.text || it.commentary || it.postText || it.post_text || it.description || '';
  const author = it.author?.name || it.authorName || it.author_name || [it.author?.firstName, it.author?.lastName].filter(Boolean).join(' ') || '';
  return {
    text: String(text).trim(),
    author,
    url: it.linkedinUrl || it.postUrl || it.url || it.post_url || '',
    likes: num(it.engagement?.likes, it.engagement?.reactions, it.stats?.total_reactions, it.reactionsCount, it.numLikes, it.likes, it.totalReactionCount),
    comments: num(it.engagement?.comments, it.stats?.comments, it.commentsCount, it.numComments, it.comments),
    postedAt: it.postedAt?.date || it.postedAt || it.posted_at?.date || it.date || it.publishedAt || '',
    hasImage: Boolean(it.postImages?.length || it.images?.length || it.image || it.media?.type === 'image'),
  };
}

export async function getPosts(token, datasetId) {
  const res = await fetch(`${API}/datasets/${datasetId}/items?clean=true&format=json&limit=200`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`Apify : erreur ${res.status} en lisant les posts`);
  const items = await res.json();
  return (Array.isArray(items) ? items : []).map(normalizePost).filter((p) => p.text);
}
