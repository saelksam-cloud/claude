// Stockage JSON sur disque : simple, lisible, facile à sauvegarder.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SEED_DIR = path.join(ROOT, 'seed');

let db;

export const newId = (prefix) => `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
export const now = () => new Date().toISOString();

export function getDb() {
  if (!db) load();
  return db;
}

function load() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    return;
  }
  db = { clients: [], posts: [], veille: [], analyses: [] };
  for (const file of fs.readdirSync(SEED_DIR).filter((f) => f.endsWith('.json'))) {
    const seed = JSON.parse(fs.readFileSync(path.join(SEED_DIR, file), 'utf8'));
    const client = createClient(seed.client);
    importPosts(client.id, seed.posts);
  }
  save();
}

export function save() {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

export function createClient(data) {
  const client = {
    id: newId('cli'),
    name: '',
    company: '',
    sector: '',
    offer: '',
    audience: '',
    tone: '',
    themes: '',
    dos: '',
    donts: '',
    ...pickClientFields(data),
    connectToken: crypto.randomBytes(16).toString('hex'),
    linkedin: null,
    createdAt: now(),
  };
  getDb().clients.push(client);
  return client;
}

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

export function importPosts(clientId, posts = []) {
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
  getDb().posts.push(...created);
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
