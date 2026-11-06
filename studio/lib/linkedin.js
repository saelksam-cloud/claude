// Intégration avec l'API officielle LinkedIn (OAuth 2.0 + Posts API).
// Le client autorise l'app une fois : on ne manipule jamais son mot de passe.
const API = 'https://api.linkedin.com';
const SCOPES = ['openid', 'profile', 'w_member_social'];

const version = () => process.env.LINKEDIN_VERSION || '202510';
export const isConfigured = () => Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
export const publicUrl = () => (process.env.PUBLIC_URL || process.env.URL || 'http://localhost:8888').replace(/\/$/, '');
export const redirectUri = () => `${publicUrl()}/auth/linkedin/callback`;

export function authUrl(state) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID,
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

export async function exchangeCode(code) {
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri(),
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
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
  const init = await fetch(`${API}/rest/images?action=initializeUpload`, {
    method: 'POST',
    headers: restHeaders(token),
    body: JSON.stringify({ initializeUploadRequest: { owner } }),
  });
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

export async function publish({ accessToken, personUrn }, { text, imageData, altText }) {
  const body = {
    author: personUrn,
    commentary: toLittleText(text),
    visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };
  if (imageData) {
    const imageUrn = await uploadImage(accessToken, personUrn, imageData);
    body.content = { media: { id: imageUrn, altText: altText || '' } };
  }
  const res = await fetch(`${API}/rest/posts`, { method: 'POST', headers: restHeaders(accessToken), body: JSON.stringify(body) });
  await check(res, 'Publication du post');
  return res.headers.get('x-restli-id') || res.headers.get('x-linkedin-id') || 'publié';
}
