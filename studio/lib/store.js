// Stockage sur Netlify Blobs : toute la base tient dans un seul document JSON,
// les images sont stockées à part dans le store « uploads ».
import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';
import seed from '../seed/client-btp.js';

const dbStore = () => getStore({ name: 'studio', consistency: 'strong' });
export const uploads = () => getStore({ name: 'uploads', consistency: 'strong' });

export const newId = (prefix) => `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
export const now = () => new Date().toISOString();

export async function loadDb() {
  const db = await dbStore().get('db', { type: 'json' });
  if (db) return migrate(db);
  const fresh = { clients: [], posts: [], veille: [], analyses: [], profiles: [], images: [], hookPrefs: {} };
  const client = createClient(fresh, { niche: 'BTP', ...seed.client });
  importPosts(fresh, client.id, seed.posts);
  await saveDb(fresh);
  return fresh;
}

// La veille appartenait à un client ; elle est maintenant partagée et classée par niche.
export function guessNiche(c) {
  const s = `${c.sector} ${c.company} ${c.name}`.toLowerCase();
  if (/btp|chantier|construction/.test(s)) return 'BTP';
  if (/ghostwrit|link motion/.test(s)) return 'Ghostwriting';
  if (/consult/.test(s)) return 'Consulting';
  return (c.sector || '').split(/[,(]/)[0].trim().slice(0, 40);
}

function migrate(db) {
  db.profiles ||= [];
  db.images ||= [];
  db.hookPrefs ||= {};
  db.banners ||= [];
  db.visuals ||= [];
  for (const c of db.clients) if (c.niche === undefined) c.niche = guessNiche(c);
  const nicheOf = (clientId) => db.clients.find((c) => c.id === clientId)?.niche || '';
  for (const v of db.veille) {
    if (v.niche === undefined) v.niche = nicheOf(v.clientId);
    v.source ||= 'example';
  }
  for (const a of db.analyses) if (a.niche === undefined) a.niche = nicheOf(a.clientId);
  return db;
}

export const saveDb = (db) => dbStore().setJSON('db', db);

export const CLIENT_FIELDS = ['name', 'company', 'niche', 'sector', 'offer', 'audience', 'tone', 'themes', 'dos', 'donts'];
export function pickClientFields(data = {}) {
  const out = {};
  for (const k of CLIENT_FIELDS) if (typeof data[k] === 'string') out[k] = data[k];
  return out;
}

export const POST_FIELDS = ['pillar', 'text', 'theme', 'format', 'visualIdea', 'altText', 'scheduledAt'];
export function pickPostFields(data = {}) {
  const out = {};
  for (const k of POST_FIELDS) if (typeof data[k] === 'string') out[k] = data[k];
  if (out.scheduledAt && Number.isNaN(Date.parse(out.scheduledAt))) delete out.scheduledAt;
  return out;
}

export function createClient(db, data) {
  const client = {
    id: newId('cli'),
    ...Object.fromEntries(CLIENT_FIELDS.map((k) => [k, ''])),
    ...pickClientFields(data),
    connectToken: crypto.randomBytes(16).toString('hex'),
    linkedin: null,
    createdAt: now(),
  };
  db.clients.push(client);
  return client;
}

export function importPosts(db, clientId, posts = []) {
  const created = posts
    .filter((p) => p && typeof p.text === 'string' && p.text.trim())
    .map((p) => ({
      id: newId('post'),
      clientId,
      text: '',
      theme: '',
      format: 'Texte',
      visualIdea: '',
      altText: '',
      scheduledAt: null,
      ...pickPostFields(p),
      image: null,
      status: 'review',
      feedback: '',
      error: '',
      linkedinPostId: null,
      publishedAt: null,
      history: [{ at: now(), action: 'Rédigé par Claude' }],
      createdAt: now(),
    }));
  db.posts.push(...created);
  return created;
}

// Ne jamais envoyer les jetons LinkedIn au navigateur.
export function publicClient(c) {
  const { linkedin, ...rest } = c;
  return {
    ...rest,
    linkedin: linkedin
      ? { connected: true, name: linkedin.name, expiresAt: linkedin.expiresAt, connectedAt: linkedin.connectedAt }
      : { connected: false },
  };
}

// ---------- Réglages (clés API, modules d'écriture) ----------
// Stockés à part ; les secrets ne sont jamais renvoyés au navigateur.
const settingsStore = () => getStore({ name: 'settings', consistency: 'strong' });

export async function loadSettings() {
  const s = (await settingsStore().get('settings', { type: 'json' })) || {};
  return {
    linkedinClientId: s.linkedinClientId || process.env.LINKEDIN_CLIENT_ID || '',
    linkedinClientSecret: s.linkedinClientSecret || process.env.LINKEDIN_CLIENT_SECRET || '',
    openaiKey: s.openaiKey || process.env.OPENAI_API_KEY || '',
    openaiModel: s.openaiModel || '',
    apifyToken: s.apifyToken || process.env.APIFY_TOKEN || '',
    apifyActor: s.apifyActor || '',
    imageModel: s.imageModel || '',
    modules: s.modules || [],
  };
}

export const saveSettings = (s) => settingsStore().setJSON('settings', s);

export const publicSettings = (s) => ({
  linkedinClientId: s.linkedinClientId,
  hasLinkedinSecret: Boolean(s.linkedinClientSecret),
  hasOpenaiKey: Boolean(s.openaiKey),
  openaiKeyHint: s.openaiKey ? `…${s.openaiKey.slice(-4)}` : '',
  openaiModel: s.openaiModel,
  hasApifyToken: Boolean(s.apifyToken),
  apifyActor: s.apifyActor,
  modules: s.modules,
});
