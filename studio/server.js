import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getDb, save, newId, now, createClient, importPosts, publicClient,
  pickClientFields, pickPostFields, UPLOAD_DIR,
} from './lib/store.js';
import * as linkedin from './lib/linkedin.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const PLACEHOLDER = /\[À COMPLÉTER/i;
const MAX_CHARS = 3000;

const app = express();
app.use(express.json({ limit: '15mb' }));

// ---------- Mot de passe du tableau de bord ----------
// Les pages /connect et /auth sont publiques : c'est le client qui les ouvre depuis son propre navigateur.
const PUBLIC_PATHS = ['/connect/', '/auth/linkedin/callback'];
app.use((req, res, next) => {
  const pwd = process.env.APP_PASSWORD;
  if (!pwd || PUBLIC_PATHS.some((p) => req.path.startsWith(p))) return next();
  const [, encoded = ''] = (req.headers.authorization || '').split(' ');
  const given = Buffer.from(encoded, 'base64').toString().split(':').slice(1).join(':');
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(pwd).digest();
  if (crypto.timingSafeEqual(a, b)) return next();
  res.set('WWW-Authenticate', 'Basic realm="Link Motion Studio"').status(401).send('Accès protégé');
});

app.use(express.static(path.join(ROOT, 'public')));
app.use('/uploads', express.static(UPLOAD_DIR));

// ---------- Helpers ----------
const db = () => getDb();
const findClient = (id) => db().clients.find((c) => c.id === id);
const findPost = (id) => db().posts.find((p) => p.id === id);
const log = (post, action) => post.history.push({ at: now(), action });
const fail = (res, code, message) => res.status(code).json({ error: message });

function validateForApproval(post) {
  if (PLACEHOLDER.test(post.text)) return 'Le post contient encore un « [À COMPLÉTER … ] ».';
  if (post.text.length > MAX_CHARS) return `Le post dépasse ${MAX_CHARS} caractères.`;
  if (!post.scheduledAt) return 'Ajoute une date de publication.';
  return null;
}

// ---------- API : état ----------
app.get('/api/state', (_req, res) => {
  const d = db();
  res.json({
    clients: d.clients.map(publicClient),
    posts: d.posts,
    veille: d.veille,
    analyses: d.analyses,
    linkedinConfigured: linkedin.isConfigured(),
    redirectUri: linkedin.redirectUri(),
    publicUrl: linkedin.publicUrl(),
  });
});

// ---------- API : clients ----------
app.post('/api/clients', (req, res) => {
  const client = createClient(req.body);
  save();
  res.json(publicClient(client));
});

app.put('/api/clients/:id', (req, res) => {
  const client = findClient(req.params.id);
  if (!client) return fail(res, 404, 'Client introuvable');
  Object.assign(client, pickClientFields(req.body));
  save();
  res.json(publicClient(client));
});

app.post('/api/clients/:id/disconnect', (req, res) => {
  const client = findClient(req.params.id);
  if (!client) return fail(res, 404, 'Client introuvable');
  client.linkedin = null;
  save();
  res.json(publicClient(client));
});

app.post('/api/clients/:id/import', (req, res) => {
  const client = findClient(req.params.id);
  if (!client) return fail(res, 404, 'Client introuvable');
  const posts = Array.isArray(req.body) ? req.body : req.body?.posts;
  if (!Array.isArray(posts)) return fail(res, 400, 'JSON attendu : { "posts": [ { "text": "...", "scheduledAt": "..." } ] }');
  const created = importPosts(client.id, posts);
  save();
  res.json({ imported: created.length });
});

// ---------- API : posts ----------
app.post('/api/posts', (req, res) => {
  if (!findClient(req.body.clientId)) return fail(res, 404, 'Client introuvable');
  const [post] = importPosts(req.body.clientId, [{ ...req.body, text: 'x' }]);
  post.text = typeof req.body.text === 'string' ? req.body.text : '';
  post.status = 'draft';
  post.history = [{ at: now(), action: 'Créé manuellement' }];
  save();
  res.json(post);
});

app.put('/api/posts/:id', (req, res) => {
  const post = findPost(req.params.id);
  if (!post) return fail(res, 404, 'Post introuvable');
  if (post.status === 'published') return fail(res, 400, 'Un post publié ne peut plus être modifié ici.');
  Object.assign(post, pickPostFields(req.body));
  if (post.status === 'approved') {
    const problem = validateForApproval(post);
    if (problem) { post.status = 'review'; log(post, `Repassé « à valider » : ${problem}`); }
  }
  log(post, 'Modifié');
  save();
  res.json(post);
});

app.delete('/api/posts/:id', (req, res) => {
  const d = db();
  const post = findPost(req.params.id);
  if (post?.image) fs.rmSync(path.join(UPLOAD_DIR, post.image), { force: true });
  d.posts = d.posts.filter((p) => p.id !== req.params.id);
  save();
  res.json({ ok: true });
});

const STATUS_LABELS = { draft: 'Brouillon', review: 'À valider', approved: 'Validé', rejected: 'À retravailler' };
app.post('/api/posts/:id/status', (req, res) => {
  const post = findPost(req.params.id);
  if (!post) return fail(res, 404, 'Post introuvable');
  const { status, feedback = '' } = req.body;
  if (!STATUS_LABELS[status]) return fail(res, 400, 'Statut invalide');
  if (post.status === 'published') return fail(res, 400, 'Post déjà publié');
  if (status === 'approved') {
    const problem = validateForApproval(post);
    if (problem) return fail(res, 400, problem);
  }
  post.status = status;
  post.error = '';
  if (status === 'rejected') post.feedback = feedback;
  log(post, `${STATUS_LABELS[status]}${feedback ? ` — « ${feedback} »` : ''}`);
  save();
  res.json(post);
});

app.post('/api/posts/bulk-approve', (req, res) => {
  const ids = new Set(req.body.ids || []);
  const skipped = [];
  let approved = 0;
  for (const post of db().posts.filter((p) => ids.has(p.id) && p.status === 'review')) {
    const problem = validateForApproval(post);
    if (problem) { skipped.push({ id: post.id, problem }); continue; }
    post.status = 'approved';
    log(post, 'Validé (en lot)');
    approved++;
  }
  save();
  res.json({ approved, skipped });
});

const IMAGE_TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' };
app.post('/api/posts/:id/image', (req, res) => {
  const post = findPost(req.params.id);
  if (!post) return fail(res, 404, 'Post introuvable');
  const match = /^data:([\w/+-]+);base64,(.+)$/s.exec(req.body.dataUrl || '');
  const ext = match && IMAGE_TYPES[match[1]];
  if (!ext) return fail(res, 400, 'Image PNG, JPG, GIF ou WEBP attendue');
  if (post.image) fs.rmSync(path.join(UPLOAD_DIR, post.image), { force: true });
  post.image = `${post.id}-${Date.now()}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, post.image), Buffer.from(match[2], 'base64'));
  log(post, 'Image ajoutée');
  save();
  res.json(post);
});

app.delete('/api/posts/:id/image', (req, res) => {
  const post = findPost(req.params.id);
  if (!post) return fail(res, 404, 'Post introuvable');
  if (post.image) fs.rmSync(path.join(UPLOAD_DIR, post.image), { force: true });
  post.image = null;
  log(post, 'Image retirée');
  save();
  res.json(post);
});

app.post('/api/posts/:id/publish-now', async (req, res) => {
  const post = findPost(req.params.id);
  if (!post) return fail(res, 404, 'Post introuvable');
  if (post.status !== 'approved') return fail(res, 400, 'Valide le post avant de le publier.');
  await publishPost(post);
  res.json(post);
});

// ---------- API : veille & analyses ----------
app.post('/api/veille', (req, res) => {
  const { clientId, author = '', url = '', text = '', likes = '', comments = '', notes = '' } = req.body;
  if (!findClient(clientId)) return fail(res, 404, 'Client introuvable');
  if (!String(text).trim()) return fail(res, 400, 'Colle au moins le texte du post.');
  const item = { id: newId('vei'), clientId, author, url, text, likes, comments, notes, createdAt: now() };
  db().veille.unshift(item);
  save();
  res.json(item);
});

app.delete('/api/veille/:id', (req, res) => {
  db().veille = db().veille.filter((v) => v.id !== req.params.id);
  save();
  res.json({ ok: true });
});

app.post('/api/analyses', (req, res) => {
  const { clientId, content = '' } = req.body;
  if (!findClient(clientId)) return fail(res, 404, 'Client introuvable');
  if (!content.trim()) return fail(res, 400, 'Analyse vide');
  const item = { id: newId('ana'), clientId, content, createdAt: now() };
  db().analyses.unshift(item);
  save();
  res.json(item);
});

app.delete('/api/analyses/:id', (req, res) => {
  db().analyses = db().analyses.filter((a) => a.id !== req.params.id);
  save();
  res.json({ ok: true });
});

// ---------- Connexion LinkedIn du client (OAuth) ----------
const pendingStates = new Map(); // state -> { clientId, expires }

const page = (title, body) => `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#07070E;color:#F0F0FF;font:16px/1.5 system-ui,sans-serif;padding:16px}
.card{max-width:440px;background:#0F0F1A;border:1px solid #2A2A40;border-radius:16px;padding:32px;text-align:center}
a.btn{display:inline-block;margin-top:16px;background:#0A66C2;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600}
p{color:#9090B0}</style></head><body><div class="card">${body}</div></body></html>`;

const escapeHtml = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

app.get('/connect/:clientId/:token', (req, res) => {
  const client = findClient(req.params.clientId);
  if (!client || client.connectToken !== req.params.token) return res.status(404).send(page('Lien invalide', '<h2>Lien invalide ou expiré</h2>'));
  if (!linkedin.isConfigured()) return res.status(503).send(page('Indisponible', "<h2>Connexion LinkedIn pas encore configurée</h2><p>Préviens ton ghostwriter.</p>"));
  const state = crypto.randomBytes(16).toString('hex');
  pendingStates.set(state, { clientId: client.id, expires: Date.now() + 15 * 60_000 });
  res.send(page('Connexion LinkedIn', `<h2>Bonjour ${escapeHtml(client.name)} 👋</h2>
<p>En cliquant ci-dessous, tu autorises <strong>Link Motion</strong> à publier sur ton profil LinkedIn les posts que tu as validés.
Tu ne partages pas ton mot de passe et tu peux retirer l'accès à tout moment depuis les paramètres LinkedIn.</p>
<a class="btn" href="${escapeHtml(linkedin.authUrl(state))}">Autoriser avec LinkedIn</a>`));
});

app.get('/auth/linkedin/callback', async (req, res) => {
  const { code, state, error, error_description: desc } = req.query;
  const pending = pendingStates.get(state);
  pendingStates.delete(state);
  if (error) return res.status(400).send(page('Refusé', `<h2>Autorisation annulée</h2><p>${escapeHtml(desc || error)}</p>`));
  if (!pending || pending.expires < Date.now()) return res.status(400).send(page('Expiré', '<h2>Lien expiré</h2><p>Rouvre le lien de connexion.</p>'));
  const client = findClient(pending.clientId);
  try {
    const token = await linkedin.exchangeCode(code);
    const profile = await linkedin.getProfile(token.accessToken);
    client.linkedin = { ...token, ...profile, connectedAt: now() };
    save();
    res.send(page('Connecté', `<h2>C'est connecté ✅</h2><p>Merci ${escapeHtml(profile.name)} ! Tu peux fermer cette page.</p>`));
  } catch (e) {
    console.error(e);
    res.status(500).send(page('Erreur', `<h2>Erreur de connexion</h2><p>${escapeHtml(e.message)}</p>`));
  }
});

// ---------- Publication & programmation ----------
async function publishPost(post) {
  const client = findClient(post.clientId);
  const problem = validateForApproval(post);
  try {
    if (problem) throw new Error(problem);
    if (!linkedin.isConfigured()) throw new Error("L'app LinkedIn n'est pas configurée (.env).");
    if (!client?.linkedin) throw new Error(`${client?.name || 'Le client'} n'a pas encore connecté son LinkedIn.`);
    if (Date.parse(client.linkedin.expiresAt) < Date.now()) throw new Error('Autorisation LinkedIn expirée : renvoie le lien de connexion au client.');
    post.linkedinPostId = await linkedin.publish(client.linkedin, {
      text: post.text,
      imagePath: post.image ? path.join(UPLOAD_DIR, post.image) : null,
      altText: post.altText,
    });
    post.status = 'published';
    post.publishedAt = now();
    post.error = '';
    log(post, 'Publié sur LinkedIn');
  } catch (e) {
    post.error = e.message;
    log(post, `Échec de publication : ${e.message}`);
  }
  save();
}

let running = false;
async function tick() {
  if (running) return;
  running = true;
  try {
    const due = db().posts.filter((p) => p.status === 'approved' && p.scheduledAt && Date.parse(p.scheduledAt) <= Date.now());
    for (const post of due) {
      // Une seule tentative automatique par heure pour un post en erreur.
      const lastFail = [...post.history].reverse().find((h) => h.action.startsWith('Échec'));
      if (post.error && lastFail && Date.now() - Date.parse(lastFail.at) < 3_600_000) continue;
      await publishPost(post);
    }
  } finally {
    running = false;
  }
}
setInterval(tick, 60_000);

app.listen(PORT, () => {
  getDb();
  console.log(`Link Motion Studio → http://localhost:${PORT}`);
  if (!linkedin.isConfigured()) console.log('⚠️  LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET absents : la publication est désactivée.');
  if (!process.env.APP_PASSWORD) console.log('⚠️  APP_PASSWORD vide : le tableau de bord n\'est pas protégé.');
  tick();
});
