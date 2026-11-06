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
  if (db) return db;
  const fresh = { clients: [], posts: [], veille: [], analyses: [] };
  const client = createClient(fresh, seed.client);
  importPosts(fresh, client.id, seed.posts);
  await saveDb(fresh);
  return fresh;
}

export const saveDb = (db) => dbStore().setJSON('db', db);

export const CLIENT_FIELDS = ['name', 'company', 'sector', 'offer', 'audience', 'tone', 'themes', 'dos', 'donts'];
export function pickClientFields(data = {}) {
  const out = {};
  for (const k of CLIENT_FIELDS) if (typeof data[k] === 'string') out[k] = data[k];
  return out;
}

export const POST_FIELDS = ['text', 'theme', 'format', 'visualIdea', 'altText', 'scheduledAt'];
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
