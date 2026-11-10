// Intégration avec l'API officielle LinkedIn (OAuth 2.0 + Posts API).
// Le client autorise l'app une fois : on ne manipule jamais son mot de passe.
const API = 'https://api.linkedin.com';
const SCOPES = ['openid', 'profile', 'w_member_social'];

// LinkedIn désactive chaque version de son API environ un an après sa sortie (erreur 426 NONEXISTENT_VERSION).
// On part du mois précédent et on recule mois par mois si besoin ; la version qui marche est retenue.
const monthsBack = (n) => { const d = new Date(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - n); return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`; };
let goodVersion = null;
const versionCandidates = () => [...new Set([goodVersion, process.env.LINKEDIN_VERSION, ...[1, 2, 3, 4, 5, 6, 8, 10].map(monthsBack)].filter(Boolean))];
const version = () => goodVersion || process.env.LINKEDIN_VERSION || monthsBack(1);

// Appel à l'API « rest » de LinkedIn qui change de version tout seul si la version demandée n'existe pas / plus.
async function restFetch(url, init, token) {
  let last;
  for (const v of versionCandidates()) {
    const res = await fetch(url, { ...init, headers: { ...restHeaders(token), 'LinkedIn-Version': v } });
    if (res.status === 426 || (res.status === 400 && /VERSION/i.test(await res.clone().text().catch(() => '')))) { last = res; continue; }
    if (res.ok) goodVersion = v;
    return res;
  }
  return last;
}
// cfg = { clientId, clientSecret } : saisis dans l'onglet Réglages (ou variables d'environnement).
export const isConfigured = (cfg) => Boolean(cfg?.clientId && cfg?.clientSecret);
export const publicUrl = () => (process.env.PUBLIC_URL || process.env.URL || 'http://localhost:8888').replace(/\/$/, '');
export const redirectUri = () => `${publicUrl()}/auth/linkedin/callback`;

export function authUrl(cfg, state) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: cfg.clientId,
    redirect_uri: redirectUri(),
    state,
    scope: SCOPES.join(' '),
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}

async function check(res, what) {
  if (res.ok) return res;
  const body = await res.text().catch(() => '');
  throw new Error(`${what} : HTTP ${res.status} ${body.slice(0, 300)}`);
}

export async function exchangeCode(cfg, code) {
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri(),
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
    }),
  });
  await check(res, 'Échange du code OAuth');
  const json = await res.json();
  return { accessToken: json.access_token, expiresAt: new Date(Date.now() + json.expires_in * 1000).toISOString() };
}

export async function getProfile(accessToken) {
  const res = await fetch(`${API}/v2/userinfo`, { headers: { Authorization: `Bearer ${accessToken}` } });
  await check(res, 'Lecture du profil');
  const json = await res.json();
  return { personUrn: `urn:li:person:${json.sub}`, name: json.name || [json.given_name, json.family_name].filter(Boolean).join(' ') };
}

const restHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'LinkedIn-Version': version(),
  'X-Restli-Protocol-Version': '2.0.0',
  'Content-Type': 'application/json',
});

// Le champ "commentary" utilise le format "little text" de LinkedIn :
// les caractères réservés doivent être échappés, sinon le post peut être tronqué.
// Les #hashtags sont convertis dans leur syntaxe dédiée pour rester cliquables.
export function toLittleText(text) {
  return text.replace(/#([\p{L}\p{N}_]+)|([\\|{}@[\]()<>#*_~])/gu, (_m, tag, ch) =>
    tag ? `{hashtag|\\#|${tag}}` : `\\${ch}`,
  );
}

async function uploadImage(token, owner, imageData) {
  const init = await restFetch(`${API}/rest/images?action=initializeUpload`, {
    method: 'POST',
    body: JSON.stringify({ initializeUploadRequest: { owner } }),
  }, token);
  await check(init, "Initialisation de l'upload d'image");
  const { value } = await init.json();
  const put = await fetch(value.uploadUrl, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: imageData,
  });
  await check(put, "Envoi de l'image");
  return value.image;
}

async function uploadDocument(token, owner, data) {
  const init = await restFetch(`${API}/rest/documents?action=initializeUpload`, {
    method: 'POST',
    body: JSON.stringify({ initializeUploadRequest: { owner } }),
  }, token);
  await check(init, "Initialisation de l'envoi du document");
  const { value } = await init.json();
  const put = await fetch(value.uploadUrl, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: data });
  await check(put, 'Envoi du document');
  return value.document;
}

export async function publish({ accessToken, personUrn }, { text, imageData, altText, documentData, documentTitle }) {
  const body = {
    author: personUrn,
    commentary: toLittleText(text),
    visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };
  if (documentData) {
    // Carrousel : LinkedIn l'affiche comme un document PDF que l'on fait défiler.
    const documentUrn = await uploadDocument(accessToken, personUrn, documentData);
    body.content = { media: { id: documentUrn, title: (documentTitle || 'Carrousel').slice(0, 200) } };
  } else if (imageData) {
    const imageUrn = await uploadImage(accessToken, personUrn, imageData);
    body.content = { media: { id: imageUrn, altText: altText || '' } };
  }
  const res = await restFetch(`${API}/rest/posts`, { method: 'POST', body: JSON.stringify(body) }, accessToken);
  await check(res, 'Publication du post');
  return res.headers.get('x-restli-id') || res.headers.get('x-linkedin-id') || 'publié';
}
