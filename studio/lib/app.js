// Toute la logique HTTP du studio, sous forme de handler web standard (Request -> Response).
import crypto from 'node:crypto';
import {
  loadDb, saveDb, uploads, newId, now, createClient, importPosts, publicClient,
  pickClientFields, pickPostFields, loadSettings, saveSettings, publicSettings,
} from './store.js';
import * as linkedin from './linkedin.js';
import { writePost, analyzeNiche, testKey } from './ai.js';
import * as apify from './apify.js';

const liCfg = (settings) => ({ clientId: settings.linkedinClientId, clientSecret: settings.linkedinClientSecret });

const PLACEHOLDER = /\[À COMPLÉTER/i;
const MAX_CHARS = 3000;
const STATUS_LABELS = { draft: 'Brouillon', review: 'À valider', approved: 'Validé', rejected: 'À retravailler' };
const IMAGE_TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' };

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const json = (data, status = 200) => Response.json(data, { status });
const log = (post, action) => post.history.push({ at: now(), action });

function validateForApproval(post) {
  if (PLACEHOLDER.test(post.text)) return 'Le post contient encore un « [À COMPLÉTER … ] ».';
  if (post.text.length > MAX_CHARS) return `Le post dépasse ${MAX_CHARS} caractères.`;
  if (!post.scheduledAt) return 'Ajoute une date de publication.';
  return null;
}

// ---------- Mot de passe ----------
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
function checkPassword(req) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) throw new HttpError(503, 'APP_PASSWORD n\'est pas défini sur le serveur.');
  const given = req.headers.get('x-studio-password') || '';
  if (!crypto.timingSafeEqual(sha(given), sha(expected))) throw new HttpError(401, 'Mot de passe incorrect');
}

// ---------- état OAuth signé (pas de mémoire entre deux appels en serverless) ----------
const stateSecret = () => process.env.STATE_SECRET || process.env.APP_PASSWORD || 'dev';
const sign = (s) => crypto.createHmac('sha256', stateSecret()).update(s).digest('hex').slice(0, 32);
function makeState(clientId) {
  const payload = `${clientId}.${Date.now() + 15 * 60_000}`;
  return `${payload}.${sign(payload)}`;
}
function readState(state = '') {
  const [clientId, exp, sig] = state.split('.');
  const payload = `${clientId}.${exp}`;
  if (!sig || sig.length !== 32 || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(sign(payload)))) return null;
  if (Number(exp) < Date.now()) return null;
  return clientId;
}

// ---------- pages publiques (vues par le client final) ----------
const escapeHtml = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const page = (title, body, status = 200) => new Response(`<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#07070E;color:#F0F0FF;font:16px/1.5 system-ui,sans-serif;padding:16px}
.card{max-width:440px;background:#0F0F1A;border:1px solid #2A2A40;border-radius:16px;padding:32px;text-align:center}
a.btn{display:inline-block;margin-top:16px;background:#0A66C2;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600}
p{color:#9090B0}</style></head><body><div class="card">${body}</div></body></html>`, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });

// ---------- publication ----------
export async function publishPost(db, post, settings) {
  const client = db.clients.find((c) => c.id === post.clientId);
  const problem = validateForApproval(post);
  try {
    if (problem) throw new Error(problem);
    if (!linkedin.isConfigured(liCfg(settings))) throw new Error("L'app LinkedIn n'est pas encore configurée (onglet Réglages).");
    if (!client?.linkedin) throw new Error(`${client?.name || 'Le client'} n'a pas encore connecté son LinkedIn.`);
    if (Date.parse(client.linkedin.expiresAt) < Date.now()) throw new Error('Autorisation LinkedIn expirée : renvoie le lien de connexion au client.');
    const imageData = post.image ? await uploads().get(post.image, { type: 'arrayBuffer' }) : null;
    post.linkedinPostId = await linkedin.publish(client.linkedin, { text: post.text, imageData, altText: post.altText });
    post.status = 'published';
    post.publishedAt = now();
    post.error = '';
    log(post, 'Publié sur LinkedIn');
  } catch (e) {
    post.error = e.message;
    log(post, `Échec de publication : ${e.message}`);
  }
}

// Appelé par la fonction programmée : publie les posts validés dont l'heure est passée.
export async function publishDuePosts() {
  const [db, settings] = await Promise.all([loadDb(), loadSettings()]);
  const due = db.posts.filter((p) => p.status === 'approved' && p.scheduledAt && Date.parse(p.scheduledAt) <= Date.now());
  let changed = false;
  for (const post of due) {
    const lastFail = [...post.history].reverse().find((h) => h.action.startsWith('Échec'));
    if (post.error && lastFail && Date.now() - Date.parse(lastFail.at) < 3_600_000) continue; // 1 essai / heure
    await publishPost(db, post, settings);
    changed = true;
  }
  // Récupère aussi les analyses de profils terminées.
  for (const profile of db.profiles.filter((x) => x.status === 'running')) {
    await refreshProfile(db, settings, profile);
    changed = true;
  }
  if (changed) await saveDb(db);
  return due.length;
}

// ---------- routes ----------
const routes = [];
const route = (method, pattern, fn, { auth = true } = {}) =>
  routes.push({ method, re: new RegExp(`^${pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`), fn, auth });

route('GET', '/api/state', async ({ db, settings }) => json({
  settings: publicSettings(settings),
  clients: db.clients.map(publicClient),
  posts: db.posts,
  veille: db.veille,
  profiles: db.profiles,
  analyses: db.analyses,
  linkedinConfigured: linkedin.isConfigured(liCfg(settings)),
  redirectUri: linkedin.redirectUri(),
  publicUrl: linkedin.publicUrl(),
}));

route('POST', '/api/clients', async ({ db, body }) => json(publicClient(createClient(db, body))));

route('PUT', '/api/clients/:id', async ({ client, body }) => {
  Object.assign(client, pickClientFields(body));
  return json(publicClient(client));
});

route('POST', '/api/clients/:id/disconnect', async ({ client }) => {
  client.linkedin = null;
  return json(publicClient(client));
});

route('POST', '/api/clients/:id/move-linkedin', async ({ db, client, body }) => {
  const target = db.clients.find((c) => c.id === body.to);
  if (!target || target.id === client.id) throw new HttpError(400, 'Client de destination invalide');
  if (!client.linkedin) throw new HttpError(400, "Ce client n'a pas de LinkedIn connecté.");
  target.linkedin = client.linkedin;
  client.linkedin = null;
  return json(publicClient(target));
});

route('POST', '/api/clients/:id/import', async ({ db, client, body }) => {
  const posts = Array.isArray(body) ? body : body?.posts;
  if (!Array.isArray(posts)) throw new HttpError(400, 'JSON attendu : { "posts": [ { "text": "...", "scheduledAt": "..." } ] }');
  return json({ imported: importPosts(db, client.id, posts).length });
});

route('POST', '/api/posts', async ({ db, body }) => {
  if (!db.clients.some((c) => c.id === body.clientId)) throw new HttpError(404, 'Client introuvable');
  const [post] = importPosts(db, body.clientId, [{ ...body, text: 'x' }]);
  post.text = typeof body.text === 'string' ? body.text : '';
  post.status = 'draft';
  post.history = [{ at: now(), action: 'Créé manuellement' }];
  return json(post);
});

route('POST', '/api/posts/bulk-approve', async ({ db, body }) => {
  const ids = new Set(body.ids || []);
  const skipped = [];
  let approved = 0;
  for (const post of db.posts.filter((p) => ids.has(p.id) && p.status === 'review')) {
    const problem = validateForApproval(post);
    if (problem) { skipped.push({ id: post.id, problem }); continue; }
    post.status = 'approved';
    log(post, 'Validé (en lot)');
    approved++;
  }
  return json({ approved, skipped });
});

route('PUT', '/api/posts/:id', async ({ post, body }) => {
  if (post.status === 'published') throw new HttpError(400, 'Un post publié ne peut plus être modifié ici.');
  Object.assign(post, pickPostFields(body));
  if (post.status === 'approved') {
    const problem = validateForApproval(post);
    if (problem) { post.status = 'review'; log(post, `Repassé « à valider » : ${problem}`); }
  }
  log(post, 'Modifié');
  return json(post);
});

route('DELETE', '/api/posts/:id', async ({ db, post }) => {
  if (post.image) await uploads().delete(post.image);
  db.posts = db.posts.filter((p) => p.id !== post.id);
  return json({ ok: true });
});

route('POST', '/api/posts/:id/status', async ({ post, body }) => {
  const { status, feedback = '' } = body;
  if (!STATUS_LABELS[status]) throw new HttpError(400, 'Statut invalide');
  if (post.status === 'published') throw new HttpError(400, 'Post déjà publié');
  if (status === 'approved') {
    const problem = validateForApproval(post);
    if (problem) throw new HttpError(400, problem);
  }
  post.status = status;
  post.error = '';
  if (status === 'rejected') post.feedback = feedback;
  log(post, `${STATUS_LABELS[status]}${feedback ? ` — « ${feedback} »` : ''}`);
  return json(post);
});

route('POST', '/api/posts/:id/image', async ({ post, body }) => {
  const match = /^data:([\w/+-]+);base64,(.+)$/s.exec(body.dataUrl || '');
  const ext = match && IMAGE_TYPES[match[1]];
  if (!ext) throw new HttpError(400, 'Image PNG, JPG, GIF ou WEBP attendue');
  if (post.image) await uploads().delete(post.image);
  post.image = `${post.id}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
  const bytes = Buffer.from(match[2], 'base64');
  await uploads().set(post.image, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length), { metadata: { type: match[1] } });
  log(post, 'Image ajoutée');
  return json(post);
});

route('DELETE', '/api/posts/:id/image', async ({ post }) => {
  if (post.image) await uploads().delete(post.image);
  post.image = null;
  log(post, 'Image retirée');
  return json(post);
});

route('POST', '/api/posts/:id/publish-now', async ({ db, post, settings }) => {
  if (post.status !== 'approved') throw new HttpError(400, 'Valide le post avant de le publier.');
  await publishPost(db, post, settings);
  return json(post);
});

route('POST', '/api/veille', async ({ db, body }) => {
  const { niche = '', author = '', url = '', text = '', likes = '', comments = '', notes = '' } = body;
  if (!String(text).trim()) throw new HttpError(400, 'Colle au moins le texte du post.');
  const item = { id: newId('vei'), source: 'example', niche: niche.trim(), author, url, text, likes, comments, notes, createdAt: now() };
  db.veille.unshift(item);
  return json(item);
});

route('DELETE', '/api/veille/:id', async ({ db, params }) => {
  db.veille = db.veille.filter((v) => v.id !== params.id);
  return json({ ok: true });
});

route('POST', '/api/analyses', async ({ db, body }) => {
  const { niche = '', content = '' } = body;
  if (!content.trim()) throw new HttpError(400, 'Analyse vide');
  const item = { id: newId('ana'), niche: niche.trim(), content, createdAt: now() };
  db.analyses.unshift(item);
  return json(item);
});

// L'IA analyse ce qui marche dans une niche (ou toute la veille).
route('POST', '/api/analyze', async ({ db, settings, body }) => {
  const niche = String(body.niche || '').trim();
  const items = niche ? db.veille.filter((v) => (v.niche || '').toLowerCase() === niche.toLowerCase()) : db.veille;
  if (items.length < 3) throw new HttpError(400, 'Il faut au moins 3 posts dans la veille de cette niche pour lancer une analyse.');
  const content = await analyzeNiche(settings, niche, items);
  const item = { id: newId('ana'), niche, content, auto: true, createdAt: now() };
  db.analyses.unshift(item);
  return json(item);
});

// ---------- Profils LinkedIn analysés (via Apify) ----------
const LI_PROFILE = /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/(in|company)\/[^/?#]+/i;

async function refreshProfile(db, settings, profile) {
  if (profile.status !== 'running') return;
  try {
    const run = await apify.getRun(settings.apifyToken, profile.runId);
    if (['READY', 'RUNNING'].includes(run.status)) return;
    if (run.status !== 'SUCCEEDED') throw new Error(`l'analyse a échoué (${run.status})`);
    const posts = await apify.getPosts(settings.apifyToken, run.datasetId || profile.datasetId);
    const known = new Set(db.veille.filter((v) => v.url).map((v) => v.url));
    const fresh = posts.filter((p) => !p.url || !known.has(p.url));
    db.veille.unshift(...fresh.map((p) => ({
      id: newId('vei'), source: 'profile', profileId: profile.id, niche: profile.niche,
      author: p.author || profile.name, url: p.url, text: p.text, likes: String(p.likes || ''), comments: String(p.comments || ''),
      notes: p.hasImage ? 'Post avec image' : '', postedAt: p.postedAt, createdAt: now(),
    })));
    if (!profile.name) profile.name = posts.find((p) => p.author)?.author || '';
    profile.status = 'done';
    profile.postCount = db.veille.filter((v) => v.profileId === profile.id).length;
    profile.error = posts.length ? '' : "Aucun post trouvé : vérifie que le lien est un profil public avec des posts récents.";
  } catch (e) {
    profile.status = 'error';
    profile.error = e.message;
  }
  profile.updatedAt = now();
}

async function startProfile(settings, profile) {
  if (!settings.apifyToken) throw new HttpError(400, "Ajoute ta clé Apify dans l'onglet Réglages pour analyser des profils.");
  const run = await apify.startProfileRun(settings.apifyToken, settings.apifyActor, profile.url, 50);
  Object.assign(profile, { status: 'running', runId: run.runId, datasetId: run.datasetId, error: '', updatedAt: now() });
}

route('POST', '/api/profiles', async ({ db, settings, body }) => {
  const url = String(body.url || '').trim().split('?')[0];
  if (!LI_PROFILE.test(url)) throw new HttpError(400, 'Colle le lien d\'un profil LinkedIn (https://www.linkedin.com/in/…).');
  if (db.profiles.some((p) => p.url.toLowerCase() === url.toLowerCase())) throw new HttpError(400, 'Ce profil est déjà suivi : clique « Relancer ».');
  const profile = { id: newId('pro'), url, niche: String(body.niche || '').trim(), name: '', status: 'new', createdAt: now() };
  await startProfile(settings, profile);
  db.profiles.unshift(profile);
  return json(profile);
});

route('POST', '/api/profiles/refresh', async ({ db, settings }) => {
  for (const p of db.profiles.filter((x) => x.status === 'running')) await refreshProfile(db, settings, p);
  return json({ ok: true });
});

route('POST', '/api/profiles/:id/rerun', async ({ db, settings, params }) => {
  const profile = db.profiles.find((p) => p.id === params.id);
  if (!profile) throw new HttpError(404, 'Profil introuvable');
  await startProfile(settings, profile);
  return json(profile);
});

route('DELETE', '/api/profiles/:id', async ({ db, params }) => {
  db.profiles = db.profiles.filter((p) => p.id !== params.id);
  return json({ ok: true });
});

route('DELETE', '/api/analyses/:id', async ({ db, params }) => {
  db.analyses = db.analyses.filter((a) => a.id !== params.id);
  return json({ ok: true });
});

// ---------- Réglages ----------
const MAX_MODULE_CHARS = 150_000;
route('PUT', '/api/settings', async ({ settings, body }) => {
  const next = { ...settings };
  if (typeof body.linkedinClientId === 'string') next.linkedinClientId = body.linkedinClientId.trim();
  if (body.linkedinClientSecret?.trim()) next.linkedinClientSecret = body.linkedinClientSecret.trim();
  if (body.openaiKey?.trim()) next.openaiKey = body.openaiKey.trim();
  if (body.clearOpenaiKey) next.openaiKey = '';
  if (body.apifyToken?.trim()) next.apifyToken = body.apifyToken.trim();
  if (typeof body.apifyActor === 'string') next.apifyActor = body.apifyActor.trim().replace('/', '~');
  if (typeof body.openaiModel === 'string') next.openaiModel = /^[\w.:-]*$/.test(body.openaiModel.trim()) ? body.openaiModel.trim() : '';
  if (Array.isArray(body.modules)) {
    next.modules = body.modules
      .filter((m) => m && String(m.name || '').trim())
      .map((m) => ({
        id: m.id || newId('mod'),
        name: String(m.name).trim(),
        url: /^https:\/\/chatgpt\.com\//.test(String(m.url || '').trim()) ? String(m.url).trim() : '',
        instructions: String(m.instructions || '').slice(0, MAX_MODULE_CHARS),
        knowledge: String(m.knowledge || '').slice(0, MAX_MODULE_CHARS),
      }));
  }
  await saveSettings(next);
  return json(publicSettings(next));
});

// ---------- Rédaction par IA ----------
const findModule = (settings, id) => settings.modules.find((m) => m.id === id) || null;

route('POST', '/api/settings/test-openai', async ({ settings }) => {
  const model = await testKey(settings);
  return json({ ok: true, model });
});

// Prochain jour ouvré libre à 8 h 30 (heure de Paris) après le dernier post programmé du client.
function parisISO(y, m, d, hh, mm) {
  const lastSunday = (month) => { const t = new Date(Date.UTC(y, month + 1, 0)); return t.getUTCDate() - t.getUTCDay(); };
  const summer = (m > 2 && m < 9) || (m === 2 && d >= lastSunday(2)) || (m === 9 && d < lastSunday(9));
  const pad = (n) => String(n).padStart(2, '0');
  return `${y}-${pad(m + 1)}-${pad(d)}T${pad(hh)}:${pad(mm)}:00${summer ? '+02:00' : '+01:00'}`;
}
function nextFreeSlot(db, clientId) {
  const taken = new Set(db.posts.filter((p) => p.clientId === clientId && p.scheduledAt && p.status !== 'rejected')
    .map((p) => new Date(p.scheduledAt).toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' })));
  const day = new Date(Date.now() + 24 * 3600_000);
  for (let i = 0; i < 400; i++, day.setUTCDate(day.getUTCDate() + 1)) {
    const key = day.toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' });
    const wd = new Date(`${key}T12:00:00Z`).getUTCDay();
    if (wd === 0 || wd === 6 || taken.has(key)) continue;
    const [y, m, d] = key.split('-').map(Number);
    return parisISO(y, m - 1, d, 8, 30);
  }
  return null;
}

const latestAnalysis = (db, niche) => db.analyses.find((a) => niche && (a.niche || '').toLowerCase() === niche.toLowerCase())?.content;

route('POST', '/api/generate', async ({ db, settings, body }) => {
  const client = db.clients.find((c) => c.id === body.clientId);
  if (!client) throw new HttpError(404, 'Client introuvable');
  const module = findModule(settings, body.moduleId);
  const inspiration = body.inspirationId ? db.veille.find((v) => v.id === body.inspirationId) : null;
  const { text, theme } = await writePost(settings, {
    client, module, subject: body.subject, format: body.format, inspiration,
    veille: db.veille, analysis: latestAnalysis(db, client.niche),
    avoidThemes: db.posts.filter((p) => p.clientId === client.id).map((p) => p.theme).filter(Boolean),
  });
  const scheduledAt = body.scheduledAt && !Number.isNaN(Date.parse(body.scheduledAt)) ? body.scheduledAt : nextFreeSlot(db, client.id);
  const [post] = importPosts(db, client.id, [{ text, theme, format: body.format || 'Texte', scheduledAt }]);
  post.history = [{ at: now(), action: `Rédigé par l'IA${module ? ` (module « ${module.name} »)` : ''}${inspiration ? ' à partir d\'un post de la veille' : ''}` }];
  return json(post);
});

route('POST', '/api/posts/:id/rewrite', async ({ db, settings, post, body }) => {
  if (post.status === 'published') throw new HttpError(400, 'Post déjà publié');
  const client = db.clients.find((c) => c.id === post.clientId);
  const module = findModule(settings, body.moduleId);
  const out = await writePost(settings, { client, module, previous: post.text, feedback: body.feedback || post.feedback, veille: db.veille, analysis: latestAnalysis(db, client.niche) });
  post.text = out.text;
  post.status = 'review';
  post.feedback = '';
  log(post, `Réécrit par l'IA${module ? ` (module « ${module.name} »)` : ''}`);
  return json(post);
});

// Images : servies par une clé aléatoire impossible à deviner (les balises <img> n'envoient pas le mot de passe).
route('GET', '/uploads/:key', async ({ params }) => {
  const entry = await uploads().getWithMetadata(params.key, { type: 'arrayBuffer' });
  if (entry === null) throw new HttpError(404, 'Image introuvable');
  return new Response(entry.data, { headers: { 'content-type': entry.metadata?.type || 'application/octet-stream', 'cache-control': 'private, max-age=86400' } });
}, { auth: false });

route('GET', '/connect/:id/:token', async ({ db, params, settings }) => {
  const client = db.clients.find((c) => c.id === params.id);
  if (!client || client.connectToken !== params.token) return page('Lien invalide', '<h2>Lien invalide ou expiré</h2>', 404);
  if (!linkedin.isConfigured(liCfg(settings))) return page('Indisponible', "<h2>Connexion LinkedIn pas encore configurée</h2><p>Il faut d'abord renseigner l'app LinkedIn dans l'onglet Réglages du studio.</p>", 503);
  return page('Connexion LinkedIn', `<h2>Bonjour ${escapeHtml(client.name)} 👋</h2>
<p>En cliquant ci-dessous, tu autorises <strong>Link Motion</strong> à publier sur ton profil LinkedIn les posts que tu as validés.
Tu ne partages pas ton mot de passe et tu peux retirer l'accès à tout moment depuis les paramètres LinkedIn.</p>
<a class="btn" href="${escapeHtml(linkedin.authUrl(liCfg(settings), makeState(client.id)))}">Autoriser avec LinkedIn</a>`);
}, { auth: false });

route('GET', '/auth/linkedin/callback', async ({ db, url, settings }) => {
  const q = url.searchParams;
  if (q.get('error')) return page('Refusé', `<h2>Autorisation annulée</h2><p>${escapeHtml(q.get('error_description') || q.get('error'))}</p>`, 400);
  const client = db.clients.find((c) => c.id === readState(q.get('state')));
  if (!client) return page('Expiré', '<h2>Lien expiré</h2><p>Rouvre le lien de connexion.</p>', 400);
  try {
    const token = await linkedin.exchangeCode(liCfg(settings), q.get('code'));
    const profile = await linkedin.getProfile(token.accessToken);
    client.linkedin = { ...token, ...profile, connectedAt: now() };
    return page('Connecté', `<h2>C'est connecté ✅</h2><p>Merci ${escapeHtml(profile.name)} ! Tu peux fermer cette page.</p>`);
  } catch (e) {
    console.error(e);
    return page('Erreur', `<h2>Erreur de connexion</h2><p>${escapeHtml(e.message)}</p>`, 500);
  }
}, { auth: false });

export async function handle(req) {
  const url = new URL(req.url);
  try {
    let match;
    const r = routes.find((x) => x.method === req.method && (match = x.re.exec(url.pathname)));
    if (!r) throw new HttpError(404, 'Introuvable');
    if (r.auth) checkPassword(req);
    const params = match.groups || {};
    const [db, settings] = await Promise.all([loadDb(), loadSettings()]);
    const body = ['POST', 'PUT'].includes(req.method) ? await req.json().catch(() => ({})) : {};
    const ctx = { db, settings, body, params, url };
    if (params.id && url.pathname.startsWith('/api/clients/')) {
      ctx.client = db.clients.find((c) => c.id === params.id);
      if (!ctx.client) throw new HttpError(404, 'Client introuvable');
    }
    if (params.id && url.pathname.startsWith('/api/posts/')) {
      ctx.post = db.posts.find((p) => p.id === params.id);
      if (!ctx.post) throw new HttpError(404, 'Post introuvable');
    }
    const before = JSON.stringify(db);
    const res = await r.fn(ctx);
    if (JSON.stringify(db) !== before) await saveDb(db);
    return res;
  } catch (e) {
    if (!(e instanceof HttpError)) console.error(e);
    return json({ error: e.message }, e.status || 500);
  }
}
