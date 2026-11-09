// Link Motion Studio — interface (vanilla JS, aucun build).
const $ = (sel, el = document) => el.querySelector(sel);
const view = $('#view');

const STATUS = { review: 'À valider', approved: 'Programmé', published: 'Publié', draft: 'Brouillon', rejected: 'À refaire' };
const PLACEHOLDER = /\[À COMPLÉTER/i;
const MAX_CHARS = 3000;
const FOLD_AT = 210;
const COUNTS = [1, 2, 3, 5, 10];

const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* indisponible */ } },
};

const ui = {
  data: null,
  clientId: store.get('clientId', null),
  view: store.get('view', 'create'),
  filter: 'review',
  count: store.get('count', 3),
  engine: store.get('engine', 'auto'),
  instruction: '',
  niche: undefined,
  editing: new Set(),
  feedbackOpen: new Set(),
  expanded: new Set(),
  job: null,
  relay: null,
  lastCreated: [],
  author: '',          // concurrent choisi dans Veille / Étude ('' = tous)
  inspireFrom: store.get('inspireFrom', ''), // concurrent choisi dans Créer
  imageMode: store.get('imageMode', 'none'),   // none | library | ai
  imageOpen: new Set(),
  hooksOpen: new Set(),
  qualityOpen: new Set(),
  retouchOpen: new Set(),
  personaId: '',
  objective: '',
  awareness: '',
  ideaId: '',
  adnTab: store.get('adnTab', 'profile'),
  kb: null,
  hookGen: null,
  hookSearch: '',
  hookFamily: '',
  hookLang: '',
  hookFavOnly: false,
  hookLimit: 60,
};

// ---------- utilitaires ----------
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmtDate = (iso) => iso ? new Date(iso).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
const nf = (n) => Math.round(n).toLocaleString('fr-FR');
const engagement = (v) => (Number(v.likes) || 0) + 2 * (Number(v.comments) || 0);
const sameNiche = (a, b) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();

function toast(msg, isError = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = `toast${isError ? ' err' : ''}`;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, isError ? 6000 : 3000);
}

class AuthError extends Error {}
async function api(method, url, body) {
  const headers = { 'x-studio-password': store.get('password', '') };
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json().catch(() => ({}));
  if (res.status === 401) throw new AuthError(json.error || 'Mot de passe requis');
  if (!res.ok) throw new Error(json.error || `Erreur ${res.status}`);
  return json;
}

function showLogin(message = '') {
  document.body.classList.add('locked');
  view.innerHTML = `
    <form class="card stack login" id="loginForm">
      <h2>Link Motion Studio</h2>
      <p class="sub" style="margin:0">Entre ton mot de passe.</p>
      <input type="password" name="password" placeholder="Mot de passe" autocomplete="current-password" required autofocus>
      ${message ? `<div class="alert err">${esc(message)}</div>` : ''}
      <button class="btn primary" type="submit">Se connecter</button>
    </form>`;
}

async function refresh() {
  ui.data = await api('GET', '/api/state');
  if (!ui.data.clients.some((c) => c.id === ui.clientId)) {
    ui.clientId = (ui.data.clients.find((c) => /^moi$/i.test(c.name)) || ui.data.clients[0])?.id ?? null;
  }
  render();
}

const client = () => ui.data.clients.find((c) => c.id === ui.clientId);
const clientPosts = () => ui.data.posts.filter((p) => p.clientId === ui.clientId)
  .sort((a, b) => (a.scheduledAt || '9').localeCompare(b.scheduledAt || '9'));
const modules = () => ui.data.settings.modules;
const moduleByRole = (role) => modules().find((m) => m.role === role) || modules().find((m) => new RegExp(role === 'hooker' ? 'hook' : 'content', 'i').test(m.name));
const allNiches = () => [...new Set([...ui.data.clients.map((c) => c.niche), ...ui.data.veille.map((v) => v.niche)].map((n) => (n || '').trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, 'fr'));
const currentNiche = () => (ui.niche === undefined ? client()?.niche || '' : ui.niche);

// ---------- rendu global ----------
function render() {
  document.body.classList.remove('locked');
  $('#clientSelect').innerHTML = ui.data.clients.map((c) => `<option value="${c.id}" ${c.id === ui.clientId ? 'selected' : ''}>${esc(c.name || 'Sans nom')}${c.niche ? ` · ${esc(c.niche)}` : ''}</option>`).join('')
    + '<option value="__new">+ Nouveau client…</option>';
  if (!client()) ui.view = 'settings';
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.view === ui.view));
  const c = client();
  $('#banner').innerHTML = c && !c.linkedin.connected && ['create', 'posts'].includes(ui.view)
    ? `<div class="banner">Le LinkedIn de ${esc(c.name)} n'est pas connecté : les posts seront prêts mais pas publiés. <a href="#" data-action="go" data-id="settings">Le connecter</a></div>` : '';
  ({ create: renderCreate, posts: renderPosts, adn: renderAdn, hooks: renderHooks, images: renderImages, veille: renderVeille, study: renderStudy, settings: renderSettings }[ui.view] || renderCreate)();
  enhanceVoice(view);
}

// ================= CRÉER =================
function renderCreate() {
  const c = client();
  const content = moduleByRole('content');
  const hooker = moduleByRole('hooker');
  const nicheCount = ui.data.veille.filter((v) => sameNiche(v.niche, c.niche)).length;
  const competitors = authorsOf(c.niche);
  if (ui.inspireFrom && !competitors.some(([a]) => sameNiche(a, ui.inspireFrom))) ui.inspireFrom = '';
  const created = ui.lastCreated.map((id) => ui.data.posts.find((p) => p.id === id)).filter(Boolean);
  const j = ui.job?.kind === 'create' ? ui.job : null;

  view.innerHTML = `
  <div class="create">
    <h2>Créer des posts</h2>
    <p class="sub">Pour <b>${esc(c.name)}</b>${c.niche ? ` · niche ${esc(c.niche)}` : ''}. Les posts arrivent dans <b>Posts</b>, à valider.</p>
    <div class="card stack">
      <div class="f">Combien de posts ?
        <div class="seg">${COUNTS.map((n) => `<button type="button" class="${ui.count === n ? 'on' : ''}" data-action="count" data-id="${n}">${n}</button>`).join('')}</div>
      </div>
      <div class="grid2">
        <label class="f">Pour quelle cible ?
          <select id="personaSel"><option value="">${personas().length ? 'Choix automatique' : 'Aucun persona (onglet ADN)'}</option>${personas().map((p) => `<option value="${p.id}" ${p.id === ui.personaId ? 'selected' : ''}>${esc(p.name || p.role || 'Persona')}${p.status === 'hypothesis' ? ' (à valider)' : ''}</option>`).join('')}</select></label>
        <label class="f">Objectif du post
          <select id="objectiveSel"><option value="">Selon les objectifs du client</option>${ui.data.editorial.objectives.map((o) => `<option ${o === ui.objective ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>
        <label class="f">Niveau de conscience de la cible
          <select id="awarenessSel"><option value="">Automatique</option>${ui.data.editorial.awareness.slice(1).map((a, i) => `<option value="${i + 1}" ${String(i + 1) === String(ui.awareness) ? 'selected' : ''}>${i + 1}. ${esc(a)}</option>`).join('')}</select></label>
        <label class="f">Partir d'une idée validée
          <select id="ideaSel"><option value="">Aucune</option>${ideas().filter((i) => i.status !== 'utilisée').map((i) => `<option value="${i.id}" ${i.id === ui.ideaId ? 'selected' : ''}>${esc(i.title.slice(0, 70))}</option>`).join('')}</select></label>
      </div>
      <label class="f">Sujet, notes ou consigne (facultatif)
        <textarea id="instruction" rows="3" placeholder="Ex. le coût caché de la double saisie, ou quelques bullet points, ou « ton plus personnel »…">${esc(ui.instruction)}</textarea>
      </label>
      <div class="f">Image
        <div class="seg">
          <button type="button" class="${ui.imageMode === 'none' ? 'on' : ''}" data-action="image-mode" data-id="none">Sans image</button>
          <button type="button" class="${ui.imageMode === 'library' ? 'on' : ''}" data-action="image-mode" data-id="library">📸 Mes photos (${myPhotos().length})</button>
          <button type="button" class="${ui.imageMode === 'ai' ? 'on' : ''}" data-action="image-mode" data-id="ai">✨ Générée par l'IA</button>
        </div>
      </div>
      ${competitors.length ? `<div class="f">S'inspirer de
        <div class="seg">
          <button type="button" class="${!ui.inspireFrom ? 'on' : ''}" data-action="inspire" data-id="">Tous les concurrents</button>
          ${competitors.slice(0, 6).map(([a]) => `<button type="button" class="${sameNiche(a, ui.inspireFrom) ? 'on' : ''}" data-action="inspire" data-id="${esc(a)}">${esc(a)}</button>`).join('')}
        </div>
      </div>` : ''}
      <div class="f">Qui écrit ?
        <div class="seg">
          <button type="button" class="${ui.engine === 'auto' ? 'on' : ''}" data-action="engine" data-id="auto">⚡ Automatique</button>
          <button type="button" class="${ui.engine === 'gpt' ? 'on' : ''}" data-action="engine" data-id="gpt">🤖 Mes GPTs (copier-coller)</button>
        </div>
      </div>
      <p class="small" style="margin:0">${ui.engine === 'auto'
        ? `1 clic. ${esc(content?.name || 'Mode content')} écrit, puis ${esc(hooker?.name || 'Mode hooker')} retravaille le hook. S'appuie sur ${ui.inspireFrom ? `les meilleurs posts de <b>${esc(ui.inspireFrom)}</b>` : `les meilleurs posts de chaque concurrent (${nicheCount} en veille ${esc(c.niche || '')})`}, l'étude de marché et tes retours passés.${ui.data.settings.hasOpenaiKey ? '' : ' <b>Clé OpenAI requise (Réglages).</b>'}`
        : `Tes vrais GPTs ChatGPT : l'app prépare le texte, tu le colles dans ${esc(content?.name || 'Mode content')}, puis dans ${esc(hooker?.name || 'Mode hooker')}.`}</p>
      ${j ? `<div class="row"><div class="progress"><span style="width:${Math.round((100 * j.done) / j.total)}%"></span></div><span class="small">${esc(j.step)}</span>
          ${j.finished ? '' : '<button class="btn sm" data-action="stop">Arrêter</button>'}</div>` : ''}
      ${ui.relay ? '' : `<button class="btn primary big" data-action="create" ${j && !j.finished ? 'disabled' : ''}>Créer ${ui.count} post${ui.count > 1 ? 's' : ''}</button>`}
    </div>
    ${ui.relay ? renderRelay() : ''}
    ${created.length ? `<h3 style="margin-top:24px">Tout juste créés</h3>${created.map(postCard).join('')}` : ''}
  </div>`;
}

// ---------- Mode « mes GPTs » : 2 copier-coller guidés ----------
const SEP = (n) => `=== POST ${n} ===`;
function ficheText(c) {
  return [
    `Auteur : ${c.name}${c.company ? ` (${c.company})` : ''}`, c.niche && `Niche : ${c.niche}`, c.offer && `Offre : ${c.offer}`,
    c.audience && `Cible : ${c.audience}`, c.tone && `Ton : ${c.tone}`, c.themes && `Sujets :\n${c.themes}`,
    c.dos && `À faire : ${c.dos}`, c.donts && `À éviter : ${c.donts}`,
  ].filter(Boolean).join('\n');
}
function contentBrief({ count, instruction }) {
  const c = client();
  const pool = byAuthor(ui.data.veille.filter((v) => sameNiche(v.niche, c.niche)), ui.inspireFrom);
  // Les meilleurs de chaque concurrent à tour de rôle.
  const lists = [...new Set(pool.map((v) => (v.author || '?').toLowerCase()))].map((a) => pool.filter((v) => (v.author || '?').toLowerCase() === a).sort((x, y) => engagement(y) - engagement(x)));
  const top = [];
  for (let i = 0; top.length < 12 && lists.some((l) => l[i]); i++) for (const l of lists) if (l[i] && top.length < 12) top.push(l[i]);
  const fb = (c.feedbackLog || []).slice(-10);
  return `Écris ${count} post${count > 1 ? 's' : ''} LinkedIn pour l'auteur ci-dessous.
${instruction ? `\nConsigne : ${instruction}\n` : ''}
FICHE DE L'AUTEUR
${ficheText(c)}
${fb.length ? `\nSES RETOURS PRÉCÉDENTS (à respecter)\n${fb.map((f) => `- ${f.text}`).join('\n')}\n` : ''}${top.length ? `\nPOSTS QUI MARCHENT DANS LA NICHE (inspiration, ne pas copier)\n${top.map((v) => `- [${v.likes} 👍 / ${v.comments} 💬] ${v.hook || v.text.slice(0, 160)}`).join('\n')}\n` : ''}
RÈGLES
- Texte prêt à publier, sans markdown, sans commentaire.
- N'invente ni chiffre ni anecdote : écris [À COMPLÉTER : …] si une info manque.
- Mets la ligne « ${SEP(1)} », « ${SEP(2)} »… avant chaque post.`;
}
function hookerBrief(texts) {
  return `Réécris uniquement le HOOK (les 1 à 3 premières lignes, avant « voir plus ») de chacun de ces ${texts.length} posts LinkedIn pour qu'il arrête le scroll. Garde le reste du post identique.
Réponds avec les posts complets, en gardant exactement les lignes « ${SEP(1)} », « ${SEP(2)} »…

${texts.map((t, i) => `${SEP(i + 1)}\n${t}`).join('\n\n')}`;
}
function parseAnswer(answer, count) {
  const clean = (t) => t.replace(/\*\*|__/g, '').trim();
  const parts = answer.split(/^\s*=+\s*POST\s*(\d+)\s*=+\s*$/gim);
  if (parts.length < 3) return count === 1 ? [clean(answer)] : [];
  const out = [];
  for (let i = 1; i < parts.length; i += 2) if (parts[i + 1]?.trim()) out[Number(parts[i]) - 1] = clean(parts[i + 1]);
  return out.filter(Boolean);
}
function renderRelay() {
  const r = ui.relay;
  const m = moduleByRole(r.step === 1 ? 'content' : 'hooker');
  const brief = r.step === 1 ? contentBrief(r) : hookerBrief(r.texts);
  return `
    <div class="card stack step">
      <div class="row between"><h3 style="margin:0">Étape ${r.step} / 2 · ${esc(m?.name || (r.step === 1 ? 'Mode content' : 'Mode hooker'))}</h3>
        <button class="btn ghost sm" data-action="relay-cancel">Annuler</button></div>
      <p class="small" style="margin:0">${r.step === 1 ? '1. Copie. 2. Ouvre le GPT et colle. 3. Colle sa réponse ici.' : `Les ${r.texts.length} posts sont prêts. Fais retravailler les hooks, ou passe cette étape.`}</p>
      <textarea readonly rows="3" id="briefText" hidden>${esc(brief)}</textarea>
      <div class="row">
        <button class="btn primary" data-action="relay-open" data-url="${esc(m?.url || '')}">1. ↗ Ouvrir ${esc(m?.name || 'ChatGPT')} avec le texte prêt</button>
        <button class="btn primary" data-action="relay-paste">2. 📋 Coller sa réponse</button>
        ${r.step === 2 ? '<button class="btn ghost" data-action="relay-skip">Passer cette étape</button>' : ''}
      </div>
      <p class="small" style="margin:0">Dans ChatGPT, attends la réponse puis clique sur son bouton « Copier » (icône sous le message), et reviens ici.${m?.url ? '' : ' <b>Ajoute le lien du GPT dans Réglages pour l\'ouvrir directement.</b>'}</p>
      <details><summary class="small" style="cursor:pointer">Coller à la main</summary>
        <textarea id="relayAnswer" rows="6" placeholder="Colle ici la réponse du GPT" data-novoice style="margin-top:6px"></textarea>
        <button class="btn sm" data-action="relay-next" style="margin-top:6px">Valider</button></details>
    </div>`;
}

// Pour chaque post : plan éditorial → rédaction (structure Linka) → 10 hooks notés /100 → image éventuelle.
async function createAuto() {
  if (!ui.data.settings.hasOpenaiKey) throw new Error("Ajoute ta clé OpenAI dans Réglages, ou choisis « Mes GPTs ».");
  const total = ui.count;
  ui.lastCreated = [];
  ui.job = { kind: 'create', done: 0, total, step: 'Préparation…', stop: false };
  const avoid = { angles: [], structures: [] };
  render();
  try {
    for (let i = 0; i < total && !ui.job.stop; i++) {
      const step = (t) => { ui.job.step = `Post ${i + 1} / ${total} : ${t}`; render(); };
      step('plan éditorial (angle, structure)…');
      const plan = await api('POST', '/api/plan', { clientId: ui.clientId, personaId: ui.personaId, objective: ui.objective, awareness: ui.awareness, topic: ui.instruction, ideaId: i === 0 ? ui.ideaId : '', avoid });
      avoid.angles.push(plan.angle?.type); avoid.structures.push(plan.structureId);
      step(`rédaction (${plan.structureName})…`);
      const p = await api('POST', '/api/write', { clientId: ui.clientId, plan, author: ui.inspireFrom });
      ui.lastCreated.push(p.id);
      step('10 hooks notés sur 100…');
      await api('POST', `/api/posts/${p.id}/hooks`, {}).catch((e) => toast(`Hooks du post ${i + 1} : ${e.message}`, true));
      if (ui.imageMode !== 'none') {
        step('image…');
        await addImage(p.id, ui.imageMode).catch((e) => toast(`Image du post ${i + 1} : ${e.message}`, true));
      }
      ui.job.done = i + 1;
      await refresh();
    }
    ui.ideaId = '';
    ui.job = { ...ui.job, finished: true, step: ui.job.stop ? 'Arrêté.' : `${ui.job.done} post(s) prêt(s), à valider ci-dessous.` };
  } catch (e) {
    ui.job = { ...ui.job, finished: true, step: `Arrêté : ${e.message}` };
    throw e;
  } finally { await refresh().catch(() => render()); }
}

async function saveRelayPosts(texts) {
  const r = await api('POST', `/api/clients/${ui.clientId}/import`, { posts: texts.map((text) => ({ text })) });
  ui.lastCreated = r.ids;
  ui.relay = null;
  await refresh();
  if (ui.imageMode !== 'none') {
    for (const [i, id] of r.ids.entries()) {
      toast(`Image ${i + 1} / ${r.ids.length}…`);
      await addImage(id, ui.imageMode).catch((e) => toast(e.message, true));
    }
    await refresh();
  }
  toast(`${r.imported} post(s) ajoutés, à valider`);
}

// ---------- Images ----------
const myPhotos = () => ui.data.images.filter((im) => im.kind === 'mine' && im.clientId === ui.clientId);
const inspirationImages = (niche) => ui.data.images.filter((im) => im.kind === 'inspiration' && sameNiche(im.niche, niche));

// mode 'library' : la meilleure photo de la photothèque ; mode 'ai' : image générée (2 appels pour tenir dans les délais).
async function addImage(postId, mode) {
  if (mode === 'library') return api('POST', `/api/posts/${postId}/image/auto`);
  await api('POST', `/api/posts/${postId}/image/prompt`);
  return api('POST', `/api/posts/${postId}/image/generate`);
}

// Réduit les photos avant envoi (1600 px max) : plus rapide, et LinkedIn n'a pas besoin de plus.
function resizeImage(file, max = 1600) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * k);
      canvas.height = Math.round(img.height * k);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL('image/jpeg', 0.86));
    };
    img.onerror = () => reject(new Error(`Format non lu : ${file.name} (utilise JPG ou PNG)`));
    img.src = URL.createObjectURL(file);
  });
}

function renderImages() {
  const c = client();
  const niche = currentNiche();
  const mine = myPhotos();
  const insp = inspirationImages(niche);
  const j = ui.job?.kind === 'upload' ? ui.job : null;
  const grid = (list, kind) => list.length ? `<div class="img-grid">${list.map((im) => `
      <figure class="img-card">
        <img src="/uploads/${esc(im.key)}" alt="${esc(im.description)}" loading="lazy">
        <figcaption>
          <textarea rows="3" data-imgdesc="${im.id}" placeholder="Description (aide l'IA à choisir la bonne photo)" data-novoice>${esc(im.description)}</textarea>
          <div class="row between"><span class="small">${kind === 'mine' ? `Utilisée ${im.uses || 0} fois` : esc(im.niche || '')}</span>
          <button class="btn ghost sm danger" data-action="del-image" data-id="${im.id}" title="Supprimer">🗑</button></div>
        </figcaption>
      </figure>`).join('')}</div>` : '';
  view.innerHTML = `
    <h2>Images</h2>
    <p class="sub">Tes photos servent à illustrer tes posts. Les visuels des concurrents servent de modèle de style aux images générées par l'IA.</p>
    ${j ? `<div class="row" style="margin-bottom:12px"><div class="progress"><span style="width:${Math.round((100 * j.done) / j.total)}%"></span></div><span class="small">${esc(j.step)}</span></div>` : ''}
    <div class="card stack">
      <div class="row between"><h3 style="margin:0">📸 Photos de ${esc(c.name)} (${mine.length})</h3>
        <label class="btn primary">+ Ajouter des photos<input type="file" accept="image/*" multiple data-library="mine" hidden></label></div>
      <p class="small" style="margin:0">Toi, ton setup, ton bureau, tes événements… L'IA décrit chaque photo et choisit la plus adaptée à chaque post. Une même photo peut resservir.</p>
      ${grid(mine, 'mine') || '<p class="empty">Aucune photo pour l\'instant.</p>'}
    </div>
    <div class="card stack">
      <div class="row between"><h3 style="margin:0">🎨 Visuels concurrents · ${esc(niche || 'sans niche')} (${insp.length})</h3>
        <label class="btn">+ Ajouter des visuels<input type="file" accept="image/*" multiple data-library="inspiration" hidden></label></div>
      <p class="small" style="margin:0">Fais des captures des images des posts concurrents qui marchent. L'IA en retient le style (type de visuel, cadrage, couleurs) pour tes images générées. Partagé avec tous les clients de la niche.</p>
      ${nicheChips()}
      ${grid(insp, 'inspiration') || '<p class="empty">Aucun visuel pour l\'instant.</p>'}
    </div>`;
}

// ================= POSTS =================
function renderPosts() {
  const posts = clientPosts();
  const by = (s) => posts.filter((p) => (s === 'review' ? ['review', 'draft', 'rejected'].includes(p.status) : p.status === s));
  const tabs = [['review', 'À valider'], ['approved', 'Programmés'], ['published', 'Publiés'], ['all', 'Tous']];
  const shown = ui.filter === 'all' ? posts : by(ui.filter);
  view.innerHTML = `
    <div class="row between" style="margin-bottom:16px">
      <div><h2>Posts</h2><p class="sub" style="margin:0">Valide, ou donne ton retour : le post est refait et l'IA s'en souvient pour les suivants.</p></div>
      ${by('review').length ? `<button class="btn primary" data-action="approve-all">✓ Tout valider (${by('review').length})</button>` : ''}
    </div>
    ${ui.filter === 'approved' ? `<div class="alert ok" style="margin-bottom:12px">Les posts programmés restent dans l'app et sont publiés sur LinkedIn à l'heure prévue (vérification toutes les 15 minutes). C'est normal qu'ils n'apparaissent pas dans les « posts programmés » de LinkedIn : ils y arrivent directement, publiés, au bon moment.</div>` : ''}
    <div class="chips" style="margin-bottom:16px">${tabs.map(([k, l]) => `<button class="chip ${ui.filter === k ? 'on' : ''}" data-action="filter" data-id="${k}">${l}<b>${k === 'all' ? posts.length : by(k).length}</b></button>`).join('')}</div>
    ${shown.length ? shown.map(postCard).join('') : '<div class="card empty">Aucun post ici. <a href="#" data-action="go" data-id="create">Créer des posts</a></div>'}`;
}

function postCard(p) {
  const c = ui.data.clients.find((x) => x.id === p.clientId) || client();
  const editing = ui.editing.has(p.id);
  const fbOpen = ui.feedbackOpen.has(p.id);
  const long = p.text.length > FOLD_AT && !ui.expanded.has(p.id);
  const text = long ? `${esc(p.text.slice(0, FOLD_AT).trimEnd())}… <button class="li-more" data-action="expand" data-id="${p.id}">voir plus</button>` : esc(p.text);
  const locked = p.status === 'published';
  const hasPh = PLACEHOLDER.test(p.text);

  const preview = `
    <div class="li">
      <div class="li-head"><div class="avatar">${initials(c.name)}</div><div><div class="li-name">${esc(c.name)}</div><div class="li-sub">${esc(c.company || '')}</div></div></div>
      <div class="li-text">${text}</div>
      ${p.image ? `<img class="li-img" src="/uploads/${esc(p.image)}" alt="${esc(p.altText)}">` : ''}
    </div>`;
  const editor = `
    <div class="stack" data-editor="${p.id}">
      <textarea name="text" rows="14">${esc(p.text)}</textarea>
      <div class="count">${p.text.length} / ${MAX_CHARS}</div>
      <div class="row">
        <button class="btn primary sm" data-action="save" data-id="${p.id}">Enregistrer</button>
        <button class="btn ghost sm" data-action="cancel-edit" data-id="${p.id}">Annuler</button>

      </div>
    </div>`;

  return `
  <article class="post" id="${p.id}">
    <div>
      ${editing ? editor : preview}
      ${p.plan ? strategyPanel(p) : ''}
      ${ui.hooksOpen.has(p.id) ? hooksPanel(p) : ''}
      ${ui.qualityOpen.has(p.id) ? qualityPanel(p) : ''}
      ${ui.retouchOpen.has(p.id) ? retouchPanel(p) : ''}
      ${ui.imageOpen.has(p.id) ? imagePanel(p) : ''}
      ${fbOpen ? `<div class="inline-box" data-feedback="${p.id}">
        <textarea rows="3" placeholder="Qu'est-ce qui ne va pas ? Ex. hook trop long, trop formel, parle plus de mes résultats…"></textarea>
        <div class="row"><button class="btn primary sm" data-action="send-feedback" data-id="${p.id}">Refaire avec ce retour</button>
        <button class="btn ghost sm" data-action="close-feedback" data-id="${p.id}">Annuler</button></div>
      </div>` : ''}
    </div>
    <aside class="side">
      <div class="row between"><span class="badge s-${p.status}">${STATUS[p.status]}</span>${p.theme ? `<span class="tag">${esc(p.theme)}</span>` : ''}</div>
      ${locked ? `<div class="small">Publié ${fmtDate(p.publishedAt)}</div>${metricsForm(p)}`
        : `<label class="f">Publication<input type="datetime-local" data-date="${p.id}" value="${toLocalInput(p.scheduledAt)}"></label>`}
      ${hasPh ? '<div class="alert warn">Remplace les [À COMPLÉTER] avant de valider (✎ Modifier).</div>' : ''}
      ${p.error ? `<div class="alert err">${esc(p.error)}</div>` : ''}
      ${locked ? '' : `<div class="actions">
        ${p.status === 'approved'
          ? `<button class="btn sm" data-action="unapprove" data-id="${p.id}">↩ Retirer</button>`
          : `<button class="btn primary sm" data-action="approve" data-id="${p.id}" ${hasPh ? 'disabled' : ''}>✓ Valider</button>`}
        <button class="btn soft sm" data-action="open-feedback" data-id="${p.id}">💬 Retour</button>
        <button class="btn sm" data-action="toggle-image" data-id="${p.id}">🖼 Image</button>
      </div>
      <div class="actions">
        <button class="btn sm" data-action="toggle-hooks" data-id="${p.id}">🪝 Hooks${p.hooks?.length ? ` · ${p.hooks[p.hookIndex ?? 0]?.total ?? ''}/100` : ''}</button>
        <button class="btn sm" data-action="toggle-quality" data-id="${p.id}">✅ Qualité</button>
        <button class="btn sm" data-action="toggle-retouch" data-id="${p.id}">✨ Retoucher</button>
        ${p.versions?.length ? `<button class="btn ghost sm" data-action="undo" data-id="${p.id}" title="Revenir à la version précédente">↶ Annuler</button>` : ''}
        ${editing ? '' : `<button class="btn sm" data-action="edit" data-id="${p.id}">✎ Modifier</button>`}
        <button class="btn ghost sm danger" data-action="delete" data-id="${p.id}" title="Supprimer">🗑</button>
      </div>
      ${p.status === 'approved' ? `<button class="btn ghost sm" data-action="publish-now" data-id="${p.id}" style="align-self:flex-start">Publier maintenant</button>` : ''}`}
    </aside>
  </article>`;
}

function imagePanel(p) {
  const photos = myPhotos();
  return `<div class="inline-box">
    <div class="row between"><b>Image du post</b><button class="btn ghost sm" data-action="toggle-image" data-id="${p.id}">Fermer</button></div>
    <div class="row">
      ${photos.length ? `<button class="btn soft sm" data-action="img-auto" data-id="${p.id}">📸 Choisir la meilleure photo</button>` : ''}
      <button class="btn soft sm" data-action="img-ai" data-id="${p.id}">✨ Générer avec l'IA</button>
      <label class="btn sm">⬆ Importer<input type="file" accept="image/*" data-upload="${p.id}" hidden></label>
      ${p.image ? `<button class="btn ghost sm" data-action="remove-image" data-id="${p.id}">Retirer</button>` : ''}
    </div>
    ${photos.length ? `<div class="thumbs">${photos.map((im) => `<button class="thumb ${p.imageId === im.id ? 'on' : ''}" data-action="img-pick" data-id="${p.id}" data-img="${im.id}" title="${esc(im.description)}"><img src="/uploads/${esc(im.key)}" alt=""></button>`).join('')}</div>`
      : '<p class="small" style="margin:0">Ajoute tes photos dans l\'onglet <a href="#" data-action="go" data-id="images">Images</a> pour pouvoir les choisir ici.</p>'}
    ${p.imagePrompt ? `<details><summary class="small" style="cursor:pointer">Consigne de l'image générée</summary>
      <textarea rows="3" data-imgprompt="${p.id}" data-novoice style="margin-top:6px">${esc(p.imagePrompt)}</textarea>
      <button class="btn sm" data-action="img-regen" data-id="${p.id}" style="margin-top:6px">↻ Regénérer avec cette consigne</button></details>` : ''}
  </div>`;
}

// ---------- Panneaux d'un post : stratégie, hooks notés, qualité, retouches ----------
const personas = () => client()?.adn?.personas || [];
const ideas = () => client()?.adn?.ideas || [];
const personaName = (id) => personas().find((x) => x.id === id)?.name || '';
const scoreClass = (t) => (t >= 90 ? 's-published' : t >= 80 ? 's-approved' : t >= 70 ? 's-review' : 's-draft');

function strategyPanel(p) {
  const pl = p.plan;
  return `<details class="inline-box"><summary class="small" style="cursor:pointer"><b>🧭 Stratégie</b> · ${esc(pl.angle?.type || '')} · ${esc(pl.structureName || '')}</summary>
    <div class="small" style="display:grid;gap:4px;margin-top:6px">
      ${pl.angle?.idea ? `<div><b>Idée :</b> ${esc(pl.angle.idea)}</div>` : ''}
      ${p.personaId ? `<div><b>Cible :</b> ${esc(personaName(p.personaId))}</div>` : pl.angle?.target ? `<div><b>Cible :</b> ${esc(pl.angle.target)}</div>` : ''}
      ${pl.angle?.benefit ? `<div><b>Bénéfice lecteur :</b> ${esc(pl.angle.benefit)}</div>` : ''}
      <div><b>Type :</b> ${esc(pl.postType || '')} · <b>Niveau de conscience :</b> ${esc(ui.data.editorial.awareness[pl.awareness] || '—')}</div>
      <div><b>Structure Linka :</b> ${esc(pl.structureId)} · ${esc(pl.structureName || '')}</div>
      ${pl.cta ? `<div><b>CTA :</b> ${esc(pl.cta)}</div>` : ''}
      ${pl.why ? `<div><b>Pourquoi :</b> ${esc(pl.why)}</div>` : ''}
      ${pl.missing?.length ? `<div class="alert warn"><b>Infos manquantes :</b> ${pl.missing.map(esc).join(' · ')}</div>` : ''}
    </div></details>`;
}

function hooksPanel(p) {
  if (!p.hooks?.length) return `<div class="inline-box"><div class="row between"><b>🪝 Hooks</b><button class="btn primary sm" data-action="gen-hooks" data-id="${p.id}">Générer 10 hooks notés</button></div></div>`;
  return `<div class="inline-box">
    <div class="row between"><b>🪝 10 hooks notés sur 100</b><div class="row"><button class="btn ghost sm" data-action="gen-hooks" data-id="${p.id}">↻ Nouveaux hooks</button><button class="btn ghost sm" data-action="toggle-hooks" data-id="${p.id}">Fermer</button></div></div>
    <p class="small" style="margin:0">Note interne LinkedMotion (cible 30 · curiosité 25 · clarté 20 · crédibilité 15 · originalité 10), pas une prédiction de viralité.</p>
    ${p.hooks.map((h, i) => `<div class="hook-row ${i === p.hookIndex ? 'on' : ''}">
      <div class="row between" style="align-items:flex-start;gap:10px">
        <div style="flex:1;min-width:0"><div class="vhook">${esc(h.text)}</div>
          <div class="small">${esc(h.family)}${h.persona ? ` · ${esc(h.persona)}` : ''} · cible ${h.scores.cible}/30 · curiosité ${h.scores.curiosite}/25 · clarté ${h.scores.clarte}/20 · crédibilité ${h.scores.credibilite}/15 · originalité ${h.scores.originalite}/10</div></div>
        <span class="badge ${scoreClass(h.total)}">${h.total}/100</span>
      </div>
      <details><summary class="small" style="cursor:pointer">Forces, faiblesses, amélioration</summary><div class="small">✅ ${esc(h.forces)}<br>⚠️ ${esc(h.faiblesses)}<br>💡 ${esc(h.amelioration)}</div></details>
      ${i === p.hookIndex ? '<span class="small"><b>✓ Utilisé dans le post</b></span>' : `<button class="btn soft sm" data-action="apply-hook" data-id="${p.id}" data-index="${i}">Utiliser ce hook</button>`}
    </div>`).join('')}
  </div>`;
}

function qualityPanel(p) {
  const q = p.quality;
  if (!q) return `<div class="inline-box"><div class="row between"><b>✅ Contrôle qualité</b><button class="btn primary sm" data-action="quality" data-id="${p.id}">Analyser le post</button></div></div>`;
  const lv = { Fort: 's-approved', Moyen: 's-review', Faible: 's-rejected' };
  return `<div class="inline-box">
    <div class="row between"><b>✅ Contrôle qualité</b><div class="row"><button class="btn ghost sm" data-action="quality" data-id="${p.id}">↻ Réanalyser</button><button class="btn ghost sm" data-action="toggle-quality" data-id="${p.id}">Fermer</button></div></div>
    ${q.summary ? `<div class="small">${esc(q.summary)}</div>` : ''}
    ${q.inventedRisk && String(q.inventedRisk).trim() ? `<div class="alert err">Faits à vérifier : ${esc(Array.isArray(q.inventedRisk) ? q.inventedRisk.join(' · ') : q.inventedRisk)}</div>` : ''}
    <table><tr><th>Critère</th><th>Niveau</th><th>Amélioration</th></tr>
    ${(q.criteria || []).map((c) => `<tr><td>${esc(c.name)}</td><td><span class="badge ${lv[c.level] || 's-draft'}">${esc(c.level)}</span></td><td class="small">${c.issue ? `${esc(c.issue)}<br>` : ''}${c.fix ? `💡 ${esc(c.fix)}` : ''}</td></tr>`).join('')}</table>
  </div>`;
}

const RETOUCH = { hook: 'Améliorer le hook', shorter: 'Raccourcir', value: 'Ajouter de la valeur', natural: 'Plus naturel', angle: "Changer l'angle", structure: 'Changer la structure', story: 'Renforcer le storytelling', voice: 'Voix du client', other: 'Autre version' };
function retouchPanel(p) {
  return `<div class="inline-box">
    <div class="row between"><b>✨ Retoucher</b><button class="btn ghost sm" data-action="toggle-retouch" data-id="${p.id}">Fermer</button></div>
    <div class="row">${Object.entries(RETOUCH).map(([k, l]) => `<button class="btn soft sm" data-action="retouch" data-id="${p.id}" data-kind="${k}">${l}</button>`).join('')}</div>
    <p class="small" style="margin:0">Une retouche ne devient pas une règle permanente. Tu peux toujours revenir en arrière avec « ↶ Annuler ».</p>
  </div>`;
}

function metricsForm(p) {
  const m = p.metrics || {};
  const rate = m.impressions ? (((m.reactions || 0) + (m.comments || 0) + (m.reposts || 0)) / m.impressions * 100).toFixed(1) : null;
  const f = (k, l) => `<label class="f">${l}<input inputmode="numeric" data-metric="${k}" data-id="${p.id}" value="${m[k] ?? ''}" placeholder="—"></label>`;
  return `<details class="small"><summary style="cursor:pointer">📊 Performances réelles${rate ? ` · ${rate} % d'interaction` : ''}</summary>
    <div class="grid2" style="margin-top:6px">${f('impressions', 'Impressions')}${f('reactions', 'Réactions')}${f('comments', 'Commentaires')}${f('reposts', 'Reposts')}</div>
    <div class="small">Laisse vide ce que tu ne connais pas : une donnée absente n'est jamais comptée comme zéro.</div></details>`;
}

// ================= ADN CLIENT =================
const ADN_TABS = [['profile', 'Profil'], ['personas', 'Personas'], ['voice', 'Voix'], ['proofs', 'Preuves'], ['onboarding', 'Onboarding'], ['interview', 'Interview & idées'], ['memory', 'Mémoire']];
const PERSONA_FIELDS = [['name', 'Nom du persona'], ['role', 'Fonction'], ['sector', 'Secteur'], ['companyType', "Type d'entreprise"], ['companySize', 'Taille'], ['responsibility', 'Responsabilité / situation'],
  ['problems', 'Problèmes prioritaires', 2], ['frustrations', 'Frustrations quotidiennes', 2], ['hiddenProblems', 'Problèmes sous-jacents', 2], ['consequences', 'Conséquences financières / pro', 2],
  ['fears', 'Peurs et risques perçus', 2], ['desires', 'Désirs immédiats', 2], ['ambitions', 'Ambitions long terme', 2], ['objectionsRational', 'Objections rationnelles', 2], ['objectionsEmotional', 'Objections émotionnelles', 2],
  ['beliefs', 'Croyances (limitantes, du secteur)', 2], ['habits', 'Mauvaises habitudes', 2], ['alternatives', 'Déjà essayé / alternatives', 2], ['triggers', "Déclencheurs d'achat", 2], ['vocabulary', 'Vocabulaire réellement utilisé', 2]];
const PROFILE_FIELDS = [['job', 'Métier et spécialité'], ['background', 'Expérience et parcours', 2], ['positioning', 'Positionnement', 2], ['expertise', 'Expertises', 2], ['differentiation', 'Différenciation vs concurrents', 2],
  ['values', 'Valeurs', 2], ['convictions', 'Convictions professionnelles', 2], ['vision', 'Vision du marché', 2], ['offers', 'Offres, prestations, produits', 2], ['prices', 'Prix ou fourchettes'], ['promises', 'Promesses commerciales justifiables', 2]];
const VOICE_FIELDS = [['tone', 'Ton (direct, pédagogique, humoristique…)'], ['address', 'Tutoiement ou vouvoiement'], ['level', 'Niveau de langage'], ['vocabulary', 'Vocabulaire habituel', 2], ['expressions', 'Expressions récurrentes', 2],
  ['sentenceLength', 'Longueur des phrases'], ['postLength', 'Longueur des posts'], ['lists', 'Utilisation des listes'], ['storytelling', 'Types de storytelling appréciés', 2], ['opinions', 'Opinions et convictions fortes', 2], ['forbidden', 'Expressions et formulations interdites', 2]];
const STATUS_LBL = { confirmed: 'Confirmé', hypothesis: 'Hypothèse IA', imported: 'Importé' };
const fieldHtml = (prefix, [k, label, rows], obj) => `<label class="f">${label}${rows ? `<textarea name="${prefix}${k}" rows="${rows}">${esc(obj?.[k] || '')}</textarea>` : `<input name="${prefix}${k}" value="${esc(obj?.[k] || '')}">`}</label>`;

function renderAdn() {
  const c = client();
  const a = c.adn || {};
  const tab = ui.adnTab;
  let body = '';
  if (tab === 'profile') {
    body = `<form class="card stack" id="adnProfile">
      <div class="grid2">${fieldHtml('c.', ['name', 'Nom'], c)}${fieldHtml('c.', ['company', 'Entreprise'], c)}</div>
      <div class="grid2">${fieldHtml('c.', ['niche', 'Niche (choisit la veille)'], c)}${fieldHtml('c.', ['sector', "Secteur d'activité"], c)}</div>
      ${PROFILE_FIELDS.map((f) => fieldHtml('p.', f, a.profile)).join('')}
      ${fieldHtml('c.', ['themes', 'Sujets de prédilection / piliers', 3], c)}
      <div class="f">Objectifs LinkedIn (coche dans l'ordre de priorité)
        <div class="chips" id="objChips" data-list="${esc(JSON.stringify(a.objectives || []))}">${objectiveChips(a.objectives || [])}</div></div>
      ${fieldHtml('a.', ['forbiddenTopics', 'Sujets à ne jamais aborder', 2], a)}
      <button class="btn primary" type="submit" style="align-self:flex-end">Enregistrer le profil</button></form>`;
  }
  if (tab === 'personas') {
    const list = a.personas || [];
    body = `<div class="row between" style="margin-bottom:12px"><p class="small" style="margin:0">Chaque cible reçoit ses propres hooks et arguments, même sur un sujet identique.</p><button class="btn primary" data-action="add-persona">+ Ajouter un persona</button></div>
      ${list.length ? list.map((pe) => `<form class="card stack persona-form" data-persona="${pe.id}">
        <div class="row between"><h3 style="margin:0">${esc(pe.name || 'Nouveau persona')}</h3><div class="row">
          <span class="badge ${pe.status === 'hypothesis' ? 's-review' : 's-approved'}">${pe.status === 'hypothesis' ? 'Hypothèse IA à valider' : 'Confirmé'}</span>
          ${pe.status === 'hypothesis' ? `<button type="button" class="btn soft sm" data-action="confirm-persona" data-id="${pe.id}">Valider</button>` : ''}
          <button type="button" class="btn ghost sm danger" data-action="del-persona" data-id="${pe.id}">🗑</button></div></div>
        <div class="grid2">${PERSONA_FIELDS.slice(0, 6).map((f) => fieldHtml('', f, pe)).join('')}</div>
        <label class="f">Niveau de conscience<select name="awareness"><option value="">—</option>${ui.data.editorial.awareness.slice(1).map((x, i) => `<option value="${i + 1}" ${Number(pe.awareness) === i + 1 ? 'selected' : ''}>${i + 1}. ${esc(x)}</option>`).join('')}</select></label>
        <details><summary class="small" style="cursor:pointer"><b>Psychologie de l'audience</b> (frustrations, peurs, désirs, objections…)</summary>
          <div class="grid2" style="margin-top:8px">${PERSONA_FIELDS.slice(6).map((f) => fieldHtml('', f, pe)).join('')}</div></details>
        <button class="btn primary sm" type="submit" style="align-self:flex-end">Enregistrer</button></form>`).join('') : '<div class="card empty">Aucun persona. Ajoute-en un, ou lance l\'onboarding pour que l\'IA en propose.</div>'}`;
  }
  if (tab === 'voice') {
    const fb = c.feedbackLog || [];
    body = `<form class="card stack" id="adnVoice">
      <div class="grid2">${VOICE_FIELDS.map((f) => fieldHtml('v.', f, a.voice)).join('')}</div>
      ${fieldHtml('v.', ['samples', 'Textes réellement écrits par le client ou posts validés (l\'IA imitera cette voix)', 8], a.voice)}
      <button class="btn primary" type="submit" style="align-self:flex-end">Enregistrer la voix</button></form>
    <div class="card stack"><h3 style="margin:0">Règles permanentes</h3>
      <p class="small" style="margin:0">Appliquées à tous les posts. Un retour ponctuel ne devient une règle que si tu le décides.</p>
      ${(a.rules || []).map((rule, i) => `<div class="row between vitem"><span>${esc(rule)}</span><button class="btn ghost sm danger" data-action="del-rule" data-id="${i}">🗑</button></div>`).join('') || '<p class="small" style="margin:0">Aucune règle.</p>'}
      <div class="row"><input id="newRule" placeholder="Ex. Toujours vouvoyer, jamais de « game changer »"><button class="btn sm" data-action="add-rule">Ajouter</button></div>
      ${fb.length ? `<h3 style="margin:8px 0 0">Retours récents</h3>${fb.slice().reverse().slice(0, 15).map((f, i) => `<div class="row between vitem"><span class="small">${esc(f.text)}</span><button class="btn soft sm" data-action="promote-rule" data-id="${fb.length - 1 - i}">📌 En faire une règle</button></div>`).join('')}` : ''}
    </div>`;
  }
  if (tab === 'proofs') {
    const list = a.proofs || [];
    body = `<div class="row between" style="margin-bottom:12px"><p class="small" style="margin:0">L'IA n'utilise QUE les preuves « vérifiées » et autorisées. Sans preuve, elle écrit [À COMPLÉTER].</p><button class="btn primary" data-action="add-proof">+ Ajouter une preuve</button></div>
      ${list.length ? `<form class="card stack" id="adnProofs">${list.map((pr) => `<div class="proof" data-proof="${pr.id}">
        <div class="grid2"><label class="f">Type<select name="type">${['Résultat client', 'Étude de cas', 'Témoignage', "Chiffre d'activité", 'Expérience vécue', 'Anecdote', 'Réalisation', 'Méthode propriétaire', 'Projet'].map((t) => `<option ${t === pr.type ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
        <label class="f">Statut<select name="status"><option value="to_verify" ${pr.status !== 'verified' ? 'selected' : ''}>À vérifier</option><option value="verified" ${pr.status === 'verified' ? 'selected' : ''}>Vérifiée</option></select></label></div>
        <label class="f">La preuve<textarea name="text" rows="2">${esc(pr.text || '')}</textarea></label>
        <div class="grid2"><label class="f">Source<input name="source" value="${esc(pr.source || '')}"></label><label class="f">Date<input name="date" value="${esc(pr.date || '')}" data-novoice></label></div>
        <div class="row between"><label class="small"><input type="checkbox" name="permission" ${pr.permission !== false ? 'checked' : ''} style="width:auto"> Autorisation d'utilisation</label>
        <button type="button" class="btn ghost sm danger" data-action="del-proof" data-id="${pr.id}">🗑</button></div></div>`).join('')}
        <button class="btn primary" type="submit" style="align-self:flex-end">Enregistrer les preuves</button></form>` : '<div class="card empty">Aucune preuve pour l\'instant.</div>'}`;
  }
  if (tab === 'onboarding') {
    const ans = a.onboarding?.answers || {};
    const an = a.analysis;
    body = `<form class="card stack" id="adnOnboarding"><p class="small" style="margin:0">Réponds à ce que tu sais, le reste plus tard. Tu peux dicter 🎤.</p>
      ${ui.data.editorial.onboarding.map((q, i) => `<label class="f">${i + 1}. ${esc(q)}<textarea name="q${i}" rows="2">${esc(ans[q] || '')}</textarea></label>`).join('')}
      <div class="row" style="justify-content:flex-end"><button class="btn" type="submit">Enregistrer</button><button type="button" class="btn primary" data-action="analyze-onboarding">🧠 Enregistrer et analyser</button></div></form>
      ${an ? `<div class="card stack"><div class="row between"><h3 style="margin:0">Analyse proposée</h3><span class="badge s-review">Hypothèses IA à valider</span></div>
        ${an.summary ? `<div><b>Résumé :</b> ${esc(an.summary)}</div>` : ''}
        ${an.positioning ? `<div class="row between"><div><b>Positionnement :</b> ${esc(an.positioning)}</div><button class="btn soft sm" data-action="apply-analysis" data-id="positioning">Appliquer</button></div>` : ''}
        ${an.personas?.length ? `<div class="row between"><div><b>Personas :</b> ${an.personas.map((x) => esc(x.name || x.role)).join(' · ')}</div><button class="btn soft sm" data-action="apply-analysis" data-id="personas">Ajouter</button></div>` : ''}
        ${an.pillars?.length ? `<div class="row between"><div><b>Piliers :</b> ${an.pillars.map(esc).join(' · ')}</div><button class="btn soft sm" data-action="apply-analysis" data-id="pillars">Appliquer</button></div>` : ''}
        ${an.angles?.length ? `<div class="row between"><div><b>Angles :</b> ${an.angles.map(esc).join(' · ')}</div><button class="btn soft sm" data-action="apply-analysis" data-id="angles">Ajouter aux idées</button></div>` : ''}
        ${an.voice ? `<div class="row between"><div><b>Guide de ton :</b> ${esc(Object.values(an.voice).filter(Boolean).join(' · '))}</div><button class="btn soft sm" data-action="apply-analysis" data-id="voice">Appliquer</button></div>` : ''}
        ${an.proofs?.length ? `<div class="row between"><div><b>Preuves mobilisables :</b> ${an.proofs.map((x) => esc(x.text)).join(' · ')}</div><button class="btn soft sm" data-action="apply-analysis" data-id="proofs">Ajouter (à vérifier)</button></div>` : ''}
        ${an.missing?.length ? `<div class="alert warn"><b>À demander au client :</b> ${an.missing.map(esc).join(' · ')}</div>` : ''}</div>` : ''}`;
  }
  if (tab === 'interview') {
    const ans = a.interview?.answers || {};
    const ex = a.interview?.extracted;
    body = `<form class="card stack" id="adnInterview"><p class="small" style="margin:0">Questions à poser au client pendant l'interview. Note (ou dicte) ses réponses, puis extrais les idées.</p>
      ${ui.data.editorial.interview.map((q, i) => `<label class="f">${esc(q)}<textarea name="q${i}" rows="2">${esc(ans[q] || '')}</textarea></label>`).join('')}
      <div class="row" style="justify-content:flex-end"><button class="btn" type="submit">Enregistrer</button><button type="button" class="btn primary" data-action="analyze-interview">💡 Extraire les idées</button></div></form>
      ${ex ? `<div class="card small">${ex.convictions?.length ? `<div><b>Convictions :</b> ${ex.convictions.map(esc).join(' · ')}</div>` : ''}${ex.objections?.length ? `<div><b>Objections clients :</b> ${ex.objections.map(esc).join(' · ')}</div>` : ''}${ex.stories?.length ? `<div><b>Anecdotes à valider :</b> ${ex.stories.map(esc).join(' · ')}</div>` : ''}</div>` : ''}
      <div class="card stack"><h3 style="margin:0">💡 Banque d'idées (${ideas().length})</h3>
        ${ideas().map((i) => `<div class="row between vitem"><div><b>${esc(i.title)}</b><div class="small">${esc([i.angle, i.postType, i.source].filter(Boolean).join(' · '))}</div></div><div class="row"><span class="tag">${esc(i.status || '')}</span><button class="btn ghost sm danger" data-action="del-idea" data-id="${i.id}">🗑</button></div></div>`).join('') || '<p class="small" style="margin:0">Aucune idée.</p>'}
        <div class="row"><input id="newIdea" placeholder="Ajouter une idée de post"><button class="btn sm" data-action="add-idea">Ajouter</button></div></div>`;
  }
  if (tab === 'memory') {
    const mem = (a.memory || []).slice().reverse();
    body = `<div class="card stack"><h3 style="margin:0">Mémoire éditoriale (${mem.length} corrections)</h3>
      <p class="small" style="margin:0">Chaque fois que tu modifies un post, l'original et ta correction sont gardés ici. Rien n'est transformé en règle sans ton accord.</p>
      ${mem.map((m) => `<details class="vitem"><summary class="small" style="cursor:pointer">${fmtDate(m.at)} · ${esc(m.type)}</summary><div class="grid2 small"><div><b>Avant</b><div class="vtext">${esc(m.before)}</div></div><div><b>Après</b><div class="vtext">${esc(m.after)}</div></div></div></details>`).join('') || '<p class="small" style="margin:0">Aucune correction pour l\'instant.</p>'}</div>`;
  }
  const filled = ['profile', 'personas', 'voice', 'proofs'].filter((k) => (k === 'personas' || k === 'proofs' ? (a[k] || []).length : Object.values(a[k] || {}).some(Boolean))).length;
  view.innerHTML = `
    <h2>ADN éditorial · ${esc(c.name)}</h2>
    <p class="sub">Tout ce que l'IA sait du client, de sa cible et de sa voix. Utilisé automatiquement à chaque post. (${filled}/4 sections remplies)</p>
    <div class="chips" style="margin-bottom:16px">${ADN_TABS.map(([k, l]) => `<button class="chip ${tab === k ? 'on' : ''}" data-action="adn-tab" data-id="${k}">${l}</button>`).join('')}</div>
    ${body}`;
}

const objectiveChips = (list) => ui.data.editorial.objectives.map((o) => { const i = list.indexOf(o); return `<button type="button" class="chip ${i >= 0 ? 'on' : ''}" data-action="toggle-objective" data-id="${esc(o)}">${i >= 0 ? `${i + 1}. ` : ''}${esc(o)}</button>`; }).join('');

async function saveAdn(patch) { await api('PUT', `/api/clients/${ui.clientId}/adn`, patch); await refresh(); }

// ================= BIBLIOTHÈQUE DE HOOKS =================
function renderHooks() {
  if (!ui.kb) { view.innerHTML = '<p class="empty">Chargement de la bibliothèque…</p>'; api('GET', '/api/knowledge').then((k) => { ui.kb = k; render(); }).catch((e) => toast(e.message, true)); return; }
  const prefs = ui.data.hookPrefs || {};
  const q = ui.hookSearch.toLowerCase();
  const list = ui.kb.hooks.filter((h) => (!ui.hookFamily || h.family === ui.hookFamily) && (!ui.hookLang || h.lang === ui.hookLang) && (!ui.hookFavOnly || prefs[h.id]?.fav) && (!q || h.template.toLowerCase().includes(q)));
  const g = ui.hookGen;
  view.innerHTML = `
    <h2>Hooks</h2>
    <p class="sub">Bibliothèque Linka : ${ui.kb.counts.hooks} modèles (${ui.kb.counts.hooksRaw} importés, doublons retirés), ${ui.kb.counts.structures} structures, ${ui.kb.counts.templates} templates, ${ui.kb.counts.posts} posts de référence. Les modèles servent de structures à adapter, jamais à recopier.</p>
    <div class="card stack">
      <h3 style="margin:0">⚡ Générer des hooks</h3>
      <div class="grid2"><label class="f">Sujet<input id="hgTopic" value="${esc(g?.topic || '')}" placeholder="Ex. pourquoi les dirigeants n'osent pas publier"></label>
        <label class="f">Cible<select id="hgPersona"><option value="">Générale</option>${personas().map((x) => `<option value="${x.id}" ${g?.personaId === x.id ? 'selected' : ''}>${esc(x.name || x.role)}</option>`).join('')}</select></label></div>
      <div class="row"><span class="small">Combien :</span>${[10, 30, 50, 100].map((n) => `<button class="btn ${n === 10 ? 'primary' : ''} sm" data-action="gen-hook-tool" data-id="${n}">${n}${n === 10 ? ' (notés /100)' : ''}</button>`).join('')}</div>
      ${g?.loading ? '<p class="small">Génération…</p>' : ''}
      ${g?.hooks?.length ? `<div>${g.hooks.map((h, i) => `<div class="hook-row"><div class="row between" style="gap:10px;align-items:flex-start"><div style="flex:1;min-width:0"><div class="vhook">${esc(h.text)}</div><div class="small">${esc(h.family || '')}${g.scored ? ` · cible ${h.scores.cible}/30 · curiosité ${h.scores.curiosite}/25 · clarté ${h.scores.clarte}/20 · crédibilité ${h.scores.credibilite}/15 · originalité ${h.scores.originalite}/10` : ''}</div>
        ${g.scored && h.amelioration ? `<div class="small">💡 ${esc(h.amelioration)}</div>` : ''}</div>${g.scored ? `<span class="badge ${scoreClass(h.total)}">${h.total}/100</span>` : ''}</div>
        <div class="row"><button class="btn ghost sm" data-action="copy" data-id="${esc(h.text)}">Copier</button><select class="sm-select" data-optimize="${i}"><option value="">Optimiser…</option><option value="short">Plus court</option><option value="precise">Plus précis</option><option value="intriguing">Plus intrigant</option><option value="direct">Plus direct</option><option value="emotional">Plus émotionnel</option><option value="expert">Plus expert</option><option value="persona">Plus ciblé persona</option></select></div>
        ${h.variants ? h.variants.map((v) => `<div class="small" style="margin-left:12px">↳ <b>${v.total}/100</b> ${esc(v.text)}</div>`).join('') : ''}</div>`).join('')}</div>` : ''}
    </div>
    <div class="card stack">
      <div class="row between"><h3 style="margin:0">📚 Bibliothèque (${list.length})</h3>
        <div class="row"><select id="hookLang" class="sm-select"><option value="">FR + EN</option><option value="fr" ${ui.hookLang === 'fr' ? 'selected' : ''}>Français</option><option value="en" ${ui.hookLang === 'en' ? 'selected' : ''}>Anglais</option></select>
        <button class="chip ${ui.hookFavOnly ? 'on' : ''}" data-action="hook-fav-only">★ Favoris</button></div></div>
      <input id="hookSearch" placeholder="🔍 Rechercher un modèle…" value="${esc(ui.hookSearch)}" data-novoice>
      <div class="chips"><button class="chip ${!ui.hookFamily ? 'on' : ''}" data-action="hook-family" data-id="">Toutes</button>${ui.kb.families.map((f) => `<button class="chip ${ui.hookFamily === f ? 'on' : ''}" data-action="hook-family" data-id="${esc(f)}">${esc(f)}</button>`).join('')}</div>
      <div>${list.slice(0, ui.hookLimit).map((h) => `<div class="row between vitem ${prefs[h.id]?.off ? 'off' : ''}"><div style="flex:1;min-width:0"><div>${esc(h.template)}</div><div class="small">${esc(h.family)} · ${h.lang.toUpperCase()} · ${esc(h.id)}</div></div>
        <div class="row"><button class="btn ghost sm" data-action="hook-fav" data-id="${h.id}" title="Favori">${prefs[h.id]?.fav ? '★' : '☆'}</button><button class="btn ghost sm" data-action="hook-off" data-id="${h.id}" title="Activer / désactiver">${prefs[h.id]?.off ? 'Réactiver' : 'Désactiver'}</button></div></div>`).join('')}</div>
      ${list.length > ui.hookLimit ? '<button class="btn" data-action="hook-more">Afficher plus</button>' : ''}
    </div>`;
}

// ================= VEILLE =================
const authorsOf = (niche) => {
  const counts = new Map();
  for (const v of ui.data.veille.filter((x) => sameNiche(x.niche, niche) && x.author)) counts.set(v.author.trim(), (counts.get(v.author.trim()) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
};
const byAuthor = (items, author) => (author ? items.filter((v) => sameNiche(v.author, author)) : items);
function authorChips(niche) {
  const list = authorsOf(niche);
  if (list.length < 2) return '';
  const total = ui.data.veille.filter((v) => sameNiche(v.niche, niche)).length;
  return `<div class="chips" style="margin-top:8px"><span class="small" style="align-self:center">Concurrent :</span>
    <button class="chip ${!ui.author ? 'on' : ''}" data-action="author" data-id="">Tous<b>${total}</b></button>
    ${list.map(([a, n]) => `<button class="chip ${sameNiche(a, ui.author) ? 'on' : ''}" data-action="author" data-id="${esc(a)}">${esc(a)}<b>${n}</b></button>`).join('')}</div>`;
}
function nicheChips() {
  const n = currentNiche();
  return `<div class="chips">${allNiches().map((x) => `<button class="chip ${sameNiche(x, n) ? 'on' : ''}" data-action="niche" data-id="${esc(x)}">${esc(x)}<b>${ui.data.veille.filter((v) => sameNiche(v.niche, x)).length}</b></button>`).join('')}</div>`;
}

function renderVeille() {
  const niche = currentNiche();
  const items = byAuthor(ui.data.veille.filter((v) => sameNiche(v.niche, niche)), ui.author).sort((a, b) => engagement(b) - engagement(a));
  const j = ui.job?.kind === 'paste' ? ui.job : null;
  view.innerHTML = `
    <h2>Veille</h2>
    <p class="sub">Copie-colle tout ce que tu veux : l'IA retrouve chaque post, ses j'aime, ses commentaires, son sujet et son type de hook.</p>
    <div class="two-col">
      <div class="card stack">
        <label class="f">Niche<input id="pasteNiche" list="nicheList" value="${esc(niche)}" data-novoice></label>
        <datalist id="nicheList">${allNiches().map((n) => `<option value="${esc(n)}">`).join('')}</datalist>
        <label class="f">Colle ici
          <textarea id="pasteText" rows="12" placeholder="Un ou plusieurs posts, ou toute la page Activité d'un profil" data-novoice></textarea>
        </label>
        ${j ? `<div class="row"><div class="progress"><span style="width:${Math.round((100 * j.done) / j.total)}%"></span></div><span class="small">${esc(j.step)}</span></div>` : ''}
        <button class="btn primary" data-action="paste" ${j ? 'disabled' : ''}>Analyser</button>
        <details class="small"><summary style="cursor:pointer">Comment copier le profil d'un concurrent ?</summary>
          <ol style="padding-left:18px;margin:8px 0 0">
            <li>Sur LinkedIn, ouvre son profil → <b>Activité</b> → <b>Posts</b>.</li>
            <li>Descends pour charger 15 à 30 posts.</li>
            <li><b>Ctrl+A</b> puis <b>Ctrl+C</b> (Mac : Cmd+A, Cmd+C), et colle ici.</li>
          </ol></details>
      </div>
      <div class="card">
        <div class="row between" style="margin-bottom:12px"><h3 style="margin:0">${items.length} post(s) · ${esc(niche || 'aucune niche')}</h3>
          <div class="row">${ui.data.veille.some((v) => !v.structure) ? `<button class="btn sm" data-action="analyze-forms">🧩 Analyser la forme (${ui.data.veille.filter((v) => !v.structure).length})</button>` : ''}
          ${items.length >= 5 ? '<button class="btn soft sm" data-action="go" data-id="study">Voir l\'étude →</button>' : ''}</div></div>
        ${nicheChips()}
        ${authorChips(niche)}
        <div style="margin-top:12px">
        ${items.length ? items.map((v) => `
          <div class="vitem">
            <div class="vhook">${esc(v.hook || v.text.split('\n')[0])}</div>
            <div class="vmeta"><b style="color:var(--text)">👍 ${nf(v.likes || 0)}</b><span>💬 ${nf(v.comments || 0)}</span>${v.reposts ? `<span>🔁 ${nf(v.reposts)}</span>` : ''}
              ${v.author ? `<span>· ${esc(v.author)}</span>` : ''}
              ${v.topic ? `<span class="tag">${esc(v.topic)}</span>` : ''}${v.hookType ? `<span class="tag">Hook : ${esc(v.hookType)}</span>` : ''}${v.format ? `<span class="tag">${esc(v.format)}</span>` : ''}
              <button class="btn ghost sm" data-action="del-veille" data-id="${v.id}" style="margin-left:auto" title="Supprimer">🗑</button></div>
            ${v.structure ? `<div class="small" style="margin-top:4px">🧩 <b>Forme :</b> ${esc(v.structure)}</div>` : ''}
            ${v.text && v.text !== v.hook ? `<details><summary class="small" style="cursor:pointer;margin-top:4px">Voir le texte</summary><div class="vtext">${esc(v.text)}</div></details>` : ''}
          </div>`).join('') : '<p class="empty">Rien pour l\'instant. Colle des posts à gauche.</p>'}
        </div>
      </div>
    </div>`;
}

// ================= ÉTUDE DE MARCHÉ =================
const median = (arr) => { const a = [...arr].sort((x, y) => x - y); if (!a.length) return 0; const m = Math.floor(a.length / 2); return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
function groupBy(items, keyFn) {
  const map = new Map();
  for (const v of items) {
    const k = keyFn(v) || 'Non classé';
    const g = map.get(k) || { label: k, count: 0, total: 0, likes: 0, comments: 0 };
    g.count++; g.total += engagement(v); g.likes += Number(v.likes) || 0; g.comments += Number(v.comments) || 0;
    map.set(k, g);
  }
  return [...map.values()].map((g) => ({ ...g, avg: g.total / g.count, avgLikes: g.likes / g.count, avgComments: g.comments / g.count })).sort((a, b) => b.avg - a.avg);
}
const lengthBucket = (v) => { const n = Number(v.length) || (v.text || '').length; return n < 600 ? 'Court (< 600 car.)' : n < 1300 ? 'Moyen (600–1 300)' : 'Long (> 1 300)'; };

function barChart(title, rows, overall) {
  const max = Math.max(...rows.map((r) => r.avg), 1);
  return `
  <div class="card chart" style="margin:0">
    <h3>${title}</h3>
    <div class="bars">${rows.slice(0, 8).map((r) => `
      <div class="bar-row ${r.avg < overall ? 'low' : ''}" data-tip="${esc(`${r.label} — ${r.count} post(s) · ${nf(r.avgLikes)} 👍 et ${nf(r.avgComments)} 💬 en moyenne`)}">
        <span class="bar-label">${esc(r.label)}</span>
        <span class="bar-track"><span class="bar" style="width:${Math.max(1, (75 * r.avg) / max)}%"></span><span class="bar-val">${nf(r.avg)} <small>· ${r.count} post${r.count > 1 ? 's' : ''}</small></span></span>
      </div>`).join('')}</div>
    <details class="table"><summary>Voir le tableau</summary>
      <table><tr><th></th><th class="num">Posts</th><th class="num">👍 moy.</th><th class="num">💬 moy.</th><th class="num">Engagement</th></tr>
      ${rows.map((r) => `<tr><td>${esc(r.label)}</td><td class="num">${r.count}</td><td class="num">${nf(r.avgLikes)}</td><td class="num">${nf(r.avgComments)}</td><td class="num">${nf(r.avg)}</td></tr>`).join('')}</table>
    </details>
  </div>`;
}

// Comparatif des concurrents côte à côte.
function compareTable(items) {
  const best = (list, key) => groupBy(list, (v) => v[key]).filter((g) => g.label !== 'Non classé')[0]?.label || '—';
  const rows = authorsOf(currentNiche()).map(([author]) => {
    const list = byAuthor(items, author);
    const avg = (f) => list.reduce((s, v) => s + (Number(v[f]) || 0), 0) / list.length;
    return { author, n: list.length, likes: avg('likes'), comments: avg('comments'), eng: list.reduce((s, v) => s + engagement(v), 0) / list.length, topic: best(list, 'topic'), hook: best(list, 'hookType') };
  }).sort((a, b) => b.eng - a.eng);
  return `<div class="card" style="margin-bottom:16px"><h3>⚖️ Comparatif des concurrents</h3><div style="overflow-x:auto"><table>
    <tr><th>Concurrent</th><th class="num">Posts</th><th class="num">👍 moy.</th><th class="num">💬 moy.</th><th class="num">Engagement</th><th>Sujet qui marche le mieux</th><th>Hook qui marche le mieux</th></tr>
    ${rows.map((r) => `<tr><td><a href="#" data-action="author" data-id="${esc(r.author)}">${esc(r.author)}</a></td><td class="num">${r.n}</td><td class="num">${nf(r.likes)}</td><td class="num">${nf(r.comments)}</td><td class="num">${nf(r.eng)}</td><td>${esc(r.topic)}</td><td>${esc(r.hook)}</td></tr>`).join('')}
  </table></div><p class="small" style="margin:8px 0 0">Clique sur un nom pour voir son étude détaillée.</p></div>`;
}

// La forme sert à toutes les niches : les structures des posts qui marchent le mieux, toutes niches confondues.
function formsTable() {
  const list = ui.data.veille.filter((v) => v.structure).sort((a, b) => engagement(b) - engagement(a)).slice(0, 10);
  if (!list.length) return '<div class="card"><h3>🧩 Les structures qui marchent</h3><p class="small" style="margin:0">Va dans Veille et clique « Analyser la forme » pour remplir ce tableau.</p></div>';
  return `<div class="card"><h3>🧩 Les structures qui marchent (toutes niches)</h3>
    <p class="small" style="margin:0 0 8px">La forme est réutilisée pour tous tes clients, même dans une autre niche (BTP…). Le fond, lui, reste propre à chaque niche.</p>
    <div style="overflow-x:auto"><table><tr><th>Structure</th><th>Niche</th><th class="num">👍</th><th class="num">💬</th></tr>
    ${list.map((v) => `<tr><td>${esc(v.structure)}</td><td>${esc(v.niche || '')}</td><td class="num">${nf(v.likes || 0)}</td><td class="num">${nf(v.comments || 0)}</td></tr>`).join('')}
    </table></div></div>`;
}

function hookTable(title, list) {
  return `<div class="card"><h3>${title}</h3><div style="overflow-x:auto"><table>
    <tr><th>Hook</th><th>Type</th><th>Auteur</th><th class="num">👍</th><th class="num">💬</th></tr>
    ${list.map((v) => `<tr><td>${esc((v.hook || v.text.split('\n')[0]).slice(0, 160))}</td><td>${esc(v.hookType || '')}</td><td>${esc(v.author || '')}</td><td class="num">${nf(v.likes || 0)}</td><td class="num">${nf(v.comments || 0)}</td></tr>`).join('')}
  </table></div></div>`;
}

function renderStudy() {
  const niche = currentNiche();
  const nicheAll = ui.data.veille.filter((v) => sameNiche(v.niche, niche));
  const items = byAuthor(nicheAll, ui.author);
  const study = ui.data.analyses.find((a) => sameNiche(a.niche, niche) && a.kind === 'study' && (ui.author ? sameNiche(a.author, ui.author) : !a.author));
  const head = `<h2>Étude de marché${niche ? ` · ${esc(niche)}` : ''}${ui.author ? ` · ${esc(ui.author)}` : ''}</h2>
    <p class="sub">Ce qui marche chez ${ui.author ? esc(ui.author) : 'les concurrents de la niche'}, d'après ta veille.</p>
    <div style="margin-bottom:16px">${nicheChips()}${authorChips(niche)}</div>`;
  if (items.length < 5) {
    view.innerHTML = `${head}<div class="card empty">Il faut au moins 5 posts dans la veille ${esc(niche)} (il y en a ${items.length}). <a href="#" data-action="go" data-id="veille">Ajouter de la veille</a></div>`;
    return;
  }
  const overall = items.reduce((s, v) => s + engagement(v), 0) / items.length;
  const sorted = [...items].sort((a, b) => engagement(b) - engagement(a));
  const hookFreq = groupBy(items, (v) => v.hookType).sort((a, b) => b.count - a.count)[0];
  view.innerHTML = `${head}
    <div class="kpis">
      <div class="kpi"><div class="n">${items.length}</div><div class="l">posts analysés</div></div>
      ${ui.author ? '' : `<div class="kpi"><div class="n">${new Set(items.map((v) => v.author).filter(Boolean)).size}</div><div class="l">concurrents</div></div>`}
      <div class="kpi"><div class="n">${nf(median(items.map((v) => Number(v.likes) || 0)))}</div><div class="l">réactions médianes (moy. ${nf(items.reduce((s, v) => s + (Number(v.likes) || 0), 0) / items.length)})</div></div>
      <div class="kpi"><div class="n">${nf(median(items.map((v) => Number(v.comments) || 0)))}</div><div class="l">commentaires médians (moy. ${nf(items.reduce((s, v) => s + (Number(v.comments) || 0), 0) / items.length)})</div></div>
      ${hookFreq ? `<div class="kpi"><div class="n" style="font-size:18px;padding:5px 0">${esc(hookFreq.label)}</div><div class="l">hook le plus fréquent (${hookFreq.count} posts)</div></div>` : ''}
    </div>
    ${!ui.author && authorsOf(niche).length > 1 ? compareTable(nicheAll) : ''}
    <p class="small" style="margin:0 0 12px">Fiabilité : échantillon de ${items.length} posts collés à la main · impressions des concurrents non disponibles publiquement (elles ne sont jamais estimées) · la médiane limite l'effet des posts exceptionnels · une corrélation n'est pas une preuve de cause.</p>
    <div class="card stack" style="margin-bottom:16px">
      <div class="row between"><h3 style="margin:0">🧠 Le feedback de l'étude${ui.author ? ` · ${esc(ui.author)}` : ''}</h3>
        <button class="btn ${study ? '' : 'primary'} sm" data-action="study">${study ? 'Mettre à jour' : 'Générer le feedback'}</button></div>
      ${study ? `<div class="small">Basé sur ${study.count || '?'} posts · ${fmtDate(study.createdAt)}</div><div class="feedback">${esc(study.content)}</div>`
        : '<p class="small" style="margin:0">L\'IA lit les chiffres ci-dessous et te dit ce qui marche, ce qui marche moins, les hooks qui reviennent et quoi faire dans tes posts.</p>'}
    </div>
    <p class="small" style="margin:0 0 10px">Engagement moyen par post = réactions + 2 × commentaires. <b style="color:var(--accent)">Vert vif</b> = au-dessus de la moyenne de la niche (${nf(overall)}), vert atténué = en dessous. Survole une barre pour le détail.</p>
    <div class="charts">
      ${barChart('Par sujet', groupBy(items, (v) => v.topic), overall)}
      ${barChart('Par type de hook', groupBy(items, (v) => v.hookType), overall)}
      ${barChart('Par format', groupBy(items, (v) => v.format), overall)}
      ${barChart('Par longueur', groupBy(items, lengthBucket), overall)}
    </div>
    <div style="margin-top:16px">${formsTable()}</div>
    <div style="margin-top:16px">${hookTable('🏆 Les 10 hooks qui marchent le mieux', sorted.slice(0, 10))}</div>
    <div style="margin-top:16px">${hookTable('📉 Ceux qui marchent le moins', sorted.slice(-5).reverse())}</div>`;
}

// ================= RÉGLAGES =================
function renderSettings() {
  const c = client();
  const st = ui.data.settings;
  const content = moduleByRole('content') || {};
  const hooker = moduleByRole('hooker') || {};
  const link = c ? `${ui.data.publicUrl}/connect/${c.id}/${c.connectToken}` : '';
  const field = (name, label, rows = 0, extra = '') => `<label class="f">${label}${rows ? `<textarea name="${name}" rows="${rows}">${esc(c[name] || '')}</textarea>` : `<input name="${name}" value="${esc(c[name] || '')}" ${extra}>`}</label>`;
  const gptCard = (m, role, title, hint) => `
    <fieldset class="card stack" data-role="${role}" data-id="${esc(m.id || '')}" style="margin:0">
      <h3 style="margin:0">${title}</h3>
      <p class="small" style="margin:0">${hint}</p>
      <label class="f">Nom<input name="name" value="${esc(m.name || '')}" placeholder="Basic - Linka - Mode ${role === 'hooker' ? 'hooker' : 'content'}" data-novoice></label>
      <label class="f">Lien du GPT (adresse de la page dans ChatGPT)<input name="url" value="${esc(m.url || '')}" placeholder="https://chatgpt.com/g/…"></label>
      <label class="f">${role === 'hooker' ? '10 à 20 hooks écrits par ce GPT' : '5 à 10 posts écrits par ce GPT'} (colle-les ici : le mode automatique imitera ce style)
        <textarea name="examples" rows="7" placeholder="${role === 'hooker' ? 'Un hook par ligne…' : 'Colle les posts les uns après les autres…'}" data-novoice>${esc(m.examples || '')}</textarea></label>
      <label class="f">Sa méthode, décrite par le GPT lui-même
        <textarea name="instructions" rows="7" placeholder="Clique sur « Copier la demande », envoie-la à ce GPT dans ChatGPT, puis colle sa réponse ici." data-novoice>${esc(m.instructions || '')}</textarea></label>
      <button type="button" class="btn soft sm" data-action="copy-self" data-id="${role}" style="align-self:flex-start">📋 Copier la demande à envoyer au GPT</button>
    </fieldset>`;

  view.innerHTML = `
    <h2>Réglages</h2>
    <p class="sub">À faire une fois. Les clés restent sur le serveur et ne sont jamais réaffichées.</p>
    ${c ? `
    <div class="card stack">
      <div class="row between"><h3 style="margin:0">LinkedIn de ${esc(c.name)}</h3>
        ${c.linkedin.connected ? `<span class="badge s-approved">Connecté · ${esc(c.linkedin.name)}</span>` : '<span class="badge s-review">Non connecté</span>'}</div>
      <div class="row">
        <a class="btn ${c.linkedin.connected ? '' : 'primary'}" href="${esc(link)}" target="_blank" rel="noopener">${c.linkedin.connected ? 'Reconnecter' : 'Connecter'} depuis cet appareil</a>
        <button class="btn" data-action="copy" data-id="${esc(link)}">Copier le lien pour le client</button>
        ${c.linkedin.connected ? '<button class="btn" data-action="check-linkedin">Vérifier la connexion</button><button class="btn ghost" data-action="move-linkedin">Déplacer vers un autre client</button><button class="btn ghost danger" data-action="disconnect">Déconnecter</button>' : ''}
      </div>
      ${ui.data.linkedinConfigured ? '' : '<div class="alert warn">Renseigne d\'abord l\'app LinkedIn plus bas.</div>'}
    </div>
    <div class="card row between"><span>La fiche complète du client (profil, personas, voix, preuves, onboarding) est dans l'onglet <b>ADN client</b>.</span><button class="btn soft" data-action="go" data-id="adn">Ouvrir l'ADN</button></div>` : '<div class="card empty">Crée un client avec le menu « Client » en haut.</div>'}
    <form class="card stack" id="gptForm">
      <h3 style="margin:0">Tes GPTs</h3>
      <div class="grid2">
        ${gptCard(content, 'content', '✍️ Mode content', 'Écrit le corps des posts.')}
        ${gptCard(hooker, 'hooker', '🪝 Mode hooker', 'Retravaille les hooks.')}
      </div>
      <button class="btn primary" type="submit" style="align-self:flex-end">Enregistrer</button>
    </form>
    <div class="grid2" style="margin-top:16px">
      <form class="card stack" id="openaiForm" style="margin:0">
        <h3 style="margin:0">Clé OpenAI ${st.hasOpenaiKey ? '<span class="badge s-approved">OK</span>' : ''}</h3>
        <p class="small" style="margin:0">Pour le mode automatique et la veille. Commence par <b>sk-</b>, sur platform.openai.com/api-keys.</p>
        <input name="openaiKey" type="password" placeholder="${st.hasOpenaiKey ? `Enregistrée ${esc(st.openaiKeyHint)}` : 'sk-…'}" autocomplete="new-password">
        <div class="row" style="justify-content:flex-end">${st.hasOpenaiKey ? '<button type="button" class="btn" data-action="test-openai">Tester</button>' : ''}<button class="btn primary" type="submit">Enregistrer</button></div>
      </form>
      <form class="card stack" id="linkedinForm" style="margin:0">
        <h3 style="margin:0">App LinkedIn ${ui.data.linkedinConfigured ? '<span class="badge s-approved">OK</span>' : ''}</h3>
        <p class="small" style="margin:0">URL de redirection à déclarer : <code>${esc(ui.data.redirectUri)}</code></p>
        <input name="linkedinClientId" value="${esc(st.linkedinClientId)}" placeholder="Client ID" autocomplete="off">
        <input name="linkedinClientSecret" type="password" placeholder="${st.hasLinkedinSecret ? 'Secret enregistré' : 'Client Secret'}" autocomplete="new-password">
        <button class="btn primary" type="submit" style="align-self:flex-end">Enregistrer</button>
      </form>
    </div>`;
}

// Demandes à envoyer aux GPTs pour qu'ils décrivent leur méthode (collée ensuite dans Réglages).
const SELF_PROMPTS = {
  content: `Je veux appliquer ta méthode dans un autre outil. Décris-la le plus précisément possible, pour qu'un autre rédacteur obtienne exactement les mêmes posts que toi :
1. Tes principes d'écriture de posts LinkedIn (ce qui fait un bon post selon toi).
2. Les structures de posts que tu utilises : pour chacune, son nom, quand l'utiliser et son schéma étape par étape.
3. Tes règles de style : longueur, rythme, phrases, sauts de ligne, ton, mots ou tournures à éviter.
4. Comment tu choisis l'angle et le sujet d'un post.
5. Comment tu termines un post (fin, question, appel à l'action).
6. Trois posts complets qui illustrent parfaitement ta méthode.
Sois exhaustif et concret.`,
  hooker: `Je veux appliquer ta méthode de hooks dans un autre outil. Décris-la le plus précisément possible, pour qu'un autre rédacteur écrive exactement les mêmes hooks que toi :
1. Ce qui fait un hook qui arrête le scroll selon toi.
2. Tous les types de hooks que tu utilises : pour chacun, son nom, sa formule et quand l'utiliser.
3. Tes règles : longueur, nombre de lignes, ponctuation, mots puissants, ce qu'il faut absolument éviter.
4. Comment tu choisis le meilleur hook parmi plusieurs.
5. Quinze exemples de hooks variés que tu considères excellents.
Sois exhaustif et concret.`,
};

// ---------- petite fenêtre (nouveau client, déplacement LinkedIn) ----------
function ask({ title, fields, submit = 'OK' }) {
  const dlg = $('#dialog');
  const form = $('#dialogForm');
  form.innerHTML = `<h3>${title}</h3><div class="stack">${fields.map((f) => `<label class="f">${f.label}${f.options
    ? `<select name="${f.name}">${f.options.map((o) => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}</select>`
    : `<input name="${f.name}" value="${esc(f.value || '')}" placeholder="${esc(f.placeholder || '')}">`}</label>`).join('')}</div>
    <div class="actions"><button class="btn ghost" value="cancel">Annuler</button><button class="btn primary" value="ok">${submit}</button></div>`;
  enhanceVoice(form);
  dlg.showModal();
  return new Promise((resolve) => dlg.addEventListener('close', () => { stopDictation(); resolve(dlg.returnValue === 'ok' ? Object.fromEntries(new FormData(form)) : null); }, { once: true }));
}

// ---------- dictée vocale (micro sur chaque champ de texte) ----------
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
const stopDictation = () => recognition?.stop();
const NO_VOICE = new Set(['url', 'linkedinClientId', 'linkedinClientSecret', 'openaiKey', 'password']);
function enhanceVoice(root = document) {
  if (!SpeechRec) return;
  root.querySelectorAll('textarea:not([readonly]), input:not([type]), input[type="text"]').forEach((el) => {
    if (el.closest('.voice-wrap') || el.hasAttribute('data-novoice') || NO_VOICE.has(el.name)) return;
    const inline = el.tagName === 'INPUT';
    const wrap = document.createElement('div');
    wrap.className = `voice-wrap${inline ? ' inline' : ''}`;
    el.replaceWith(wrap);
    wrap.append(el);
    const label = inline ? '🎤' : '🎤 Dicter';
    wrap.insertAdjacentHTML('beforeend', `<button type="button" class="btn sm mic" data-action="dictate" data-label="${label}" title="Dicter">${label}</button>`);
  });
}
function startDictation(btn) {
  const field = btn.closest('.voice-wrap').querySelector('textarea, input');
  const base = field.value.trim() ? `${field.value.trim()} ` : '';
  const rec = new SpeechRec();
  rec.lang = 'fr-FR';
  rec.continuous = true;
  rec.interimResults = true;
  rec.onresult = (e) => {
    field.value = base + [...e.results].map((r) => r[0].transcript).join(' ').replace(/\s+/g, ' ').trimStart();
    field.dispatchEvent(new Event('input', { bubbles: true }));
  };
  rec.onerror = (e) => {
    if (['no-speech', 'aborted'].includes(e.error)) return;
    toast(['not-allowed', 'service-not-allowed'].includes(e.error) ? "Autorise l'accès au micro pour dicter." : `Dictée interrompue (${e.error})`, true);
  };
  rec.onend = () => { recognition = null; btn.classList.remove('rec'); btn.textContent = btn.dataset.label; };
  recognition = rec;
  rec.start();
  btn.classList.add('rec');
  btn.textContent = btn.closest('.inline') ? '⏹' : '⏹ Arrêter';
}

async function saveOnboarding(formId, key, questions) {
  const form = document.getElementById(formId);
  const answers = {};
  questions.forEach((q, i) => { answers[q] = form.querySelector(`[name="q${i}"]`).value; });
  await api('PUT', `/api/clients/${ui.clientId}/adn`, { [key]: { ...(client().adn?.[key] || {}), answers } });
}

// ---------- actions ----------
const run = (fn) => async (...args) => {
  try { await fn(...args); } catch (e) {
    if (e instanceof AuthError) showLogin(store.get('password', '') ? e.message : '');
    else toast(e.message, true);
  }
};
const goto = (id) => {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el?.classList.add('flash');
  setTimeout(() => el?.classList.remove('flash'), 1500);
};

// Retire le bruit d'une page LinkedIn copiée (boutons, menus) puis découpe en morceaux de ~6 000 caractères.
const NOISE = /^(j['’]aime|commenter|republier|envoyer|suivre|\+ suivre|voir la traduction|voir plus|… voir plus|afficher plus|répondre|like|comment|repost|send|follow|see translation|see more|…more|\d+\s*(h|j|sem\.?|mois|an|d|w|mo|yr)\s*•?.*|•\s*\d+(er|e)?\+?|activer pour afficher l['’]image|image de .*|aucune autre description.*)$/i;
function chunkText(text, size = 6_000) {
  const lines = text.split('\n').map((l) => l.trim())
    .filter((l) => !NOISE.test(l) && !/^(j['’]aime|like)\b.*\b(commenter|comment)\b/i.test(l));
  const chunks = [];
  let cur = [];
  let len = 0;
  for (const l of lines) {
    cur.push(l);
    len += l.length + 1;
    // On coupe de préférence après la ligne des réactions (fin d'un post), sinon sur une ligne vide.
    const endOfPost = /(réactions?|reactions?|commentaires?|comments?|republications?|reposts?)\s*$/i.test(l);
    if ((len > size && endOfPost) || (len > size * 1.3 && !l) || len > size * 1.8) { chunks.push(cur.join('\n')); cur = []; len = 0; }
  }
  if (cur.join('').trim()) chunks.push(cur.join('\n'));
  return chunks.map((c) => c.replace(/\n{3,}/g, '\n\n')).filter((c) => c.trim().length > 40);
}

const actions = {
  'adn-tab'(t) { ui.adnTab = t; store.set('adnTab', t); render(); },
  'toggle-objective'(o) {
    const box = $('#objChips');
    const list = JSON.parse(box.dataset.list || '[]');
    const i = list.indexOf(o);
    if (i >= 0) list.splice(i, 1); else list.push(o);
    box.dataset.list = JSON.stringify(list);
    box.innerHTML = objectiveChips(list); // pas de rechargement : ce qui est tapé dans le formulaire est conservé
  },
  async 'add-persona'() { await saveAdn({ personas: [...personas(), { name: 'Nouveau persona', status: 'confirmed' }] }); },
  async 'del-persona'(id) { await saveAdn({ personas: personas().filter((x) => x.id !== id) }); },
  async 'confirm-persona'(id) { await saveAdn({ personas: personas().map((x) => (x.id === id ? { ...x, status: 'confirmed' } : x)) }); toast('Persona validé'); },
  async 'add-proof'() { await saveAdn({ proofs: [...(client().adn?.proofs || []), { type: 'Résultat client', text: '', status: 'to_verify', permission: true }] }); },
  async 'del-proof'(id) { await saveAdn({ proofs: (client().adn?.proofs || []).filter((x) => x.id !== id) }); },
  async 'add-rule'() { const v = $('#newRule').value.trim(); if (!v) return; await saveAdn({ rules: [...(client().adn?.rules || []), v] }); },
  async 'del-rule'(i) { const l = [...(client().adn?.rules || [])]; l.splice(Number(i), 1); await saveAdn({ rules: l }); },
  async 'promote-rule'(i) { const f = client().feedbackLog?.[Number(i)]; if (!f) return; await saveAdn({ rules: [...(client().adn?.rules || []), f.text] }); toast('Ajouté aux règles permanentes'); },
  async 'add-idea'() { const v = $('#newIdea').value.trim(); if (!v) return; await saveAdn({ ideas: [...ideas(), { title: v, source: 'manuel', status: 'proposée' }] }); },
  async 'del-idea'(id) { await saveAdn({ ideas: ideas().filter((x) => x.id !== id) }); },
  async 'analyze-onboarding'(_id, btn) {
    await saveOnboarding('adnOnboarding', 'onboarding', ui.data.editorial.onboarding);
    btn.disabled = true; btn.textContent = 'Analyse en cours… (jusqu\'à 1 min)';
    try { await api('POST', `/api/clients/${ui.clientId}/onboarding/analyze`); toast('Analyse prête : valide ce qui est juste'); } finally { await refresh(); }
  },
  async 'apply-analysis'(block) { await api('POST', `/api/clients/${ui.clientId}/onboarding/apply`, { block }); await refresh(); toast('Ajouté à la fiche (à vérifier)'); },
  async 'analyze-interview'(_id, btn) {
    await saveOnboarding('adnInterview', 'interview', ui.data.editorial.interview);
    btn.disabled = true; btn.textContent = 'Extraction…';
    try { await api('POST', `/api/clients/${ui.clientId}/interview/analyze`); toast('Idées ajoutées à la banque'); } finally { await refresh(); }
  },
  'toggle-hooks'(id) { if (ui.hooksOpen.has(id)) ui.hooksOpen.delete(id); else ui.hooksOpen.add(id); render(); },
  'toggle-quality'(id) { if (ui.qualityOpen.has(id)) ui.qualityOpen.delete(id); else ui.qualityOpen.add(id); render(); },
  'toggle-retouch'(id) { if (ui.retouchOpen.has(id)) ui.retouchOpen.delete(id); else ui.retouchOpen.add(id); render(); },
  async 'gen-hooks'(id, btn) { btn.disabled = true; btn.textContent = 'Génération…'; try { await api('POST', `/api/posts/${id}/hooks`, {}); ui.hooksOpen.add(id); } finally { await refresh(); } },
  async 'apply-hook'(id, btn) { await api('POST', `/api/posts/${id}/apply-hook`, { index: btn.dataset.index }); await refresh(); toast('Hook appliqué'); },
  async quality(id, btn) { btn.disabled = true; btn.textContent = 'Analyse…'; try { await api('POST', `/api/posts/${id}/quality`); ui.qualityOpen.add(id); } finally { await refresh(); } },
  async retouch(id, btn) { btn.disabled = true; btn.textContent = '…'; try { await api('POST', `/api/posts/${id}/action`, { action: btn.dataset.kind }); ui.expanded.add(id); toast('Post retouché'); } finally { await refresh(); } },
  async undo(id) { await api('POST', `/api/posts/${id}/undo`); await refresh(); toast('Version précédente restaurée'); },
  async 'gen-hook-tool'(n) {
    const topic = $('#hgTopic').value.trim();
    if (!topic) throw new Error('Indique un sujet.');
    ui.hookGen = { topic, personaId: $('#hgPersona').value, loading: true };
    render();
    try { const r = await api('POST', '/api/hooks/generate', { clientId: ui.clientId, personaId: ui.hookGen.personaId, topic, count: Number(n) }); ui.hookGen = { ...ui.hookGen, ...r, loading: false }; } catch (e) { ui.hookGen.loading = false; throw e; } finally { render(); }
  },
  'hook-family'(f) { ui.hookFamily = f || ''; ui.hookLimit = 60; render(); },
  'hook-fav-only'() { ui.hookFavOnly = !ui.hookFavOnly; render(); },
  'hook-more'() { ui.hookLimit += 100; render(); },
  async 'hook-fav'(id) { await api('PUT', '/api/hooks/prefs', { id, fav: !ui.data.hookPrefs?.[id]?.fav }); await refresh(); },
  async 'hook-off'(id) { await api('PUT', '/api/hooks/prefs', { id, off: !ui.data.hookPrefs?.[id]?.off }); await refresh(); },
  go(v) { ui.view = v; store.set('view', v); render(); window.scrollTo(0, 0); },
  dictate(_id, btn) { if (recognition) stopDictation(); else startDictation(btn); },
  count(n) { ui.count = Number(n); store.set('count', ui.count); render(); },
  engine(e) { ui.engine = e; store.set('engine', e); ui.relay = null; render(); },
  async create() {
    if (ui.engine === 'gpt') { ui.relay = { step: 1, count: ui.count, instruction: ui.instruction, texts: [] }; render(); return; }
    await createAuto();
  },
  stop() { if (ui.job) ui.job.stop = true; toast('Arrêt après le post en cours'); },
  async 'copy-brief'() { await navigator.clipboard.writeText($('#briefText').value); toast('Copié : colle-le dans le GPT'); },
  'relay-cancel'() { ui.relay = null; render(); },
  // Ouvre le GPT avec la consigne déjà tapée (et la copie aussi, au cas où ChatGPT ne la reprend pas).
  async 'relay-open'(_id, btn) {
    const brief = $('#briefText').value;
    await navigator.clipboard.writeText(brief).catch(() => {});
    const base = btn.dataset.url || 'https://chatgpt.com/';
    const url = brief.length < 6000 ? `${base}${base.includes('?') ? '&' : '?'}q=${encodeURIComponent(brief)}` : base;
    window.open(url, '_blank', 'noopener');
    toast(brief.length < 6000 ? 'Le texte est déjà dans ChatGPT (et copié, au cas où : Ctrl+V)' : 'Texte copié : colle-le dans ChatGPT (Ctrl+V)');
  },
  async 'relay-paste'() {
    let text = '';
    try { text = await navigator.clipboard.readText(); } catch { throw new Error('Ton navigateur bloque la lecture du presse-papiers : utilise « Coller à la main ».'); }
    if (!text.trim()) throw new Error('Le presse-papiers est vide : copie d\'abord la réponse du GPT.');
    $('#relayAnswer').value = text;
    await actions['relay-next']();
  },
  async 'relay-next'() {
    const r = ui.relay;
    const answer = $('#relayAnswer').value;
    if (!answer.trim()) throw new Error('Colle la réponse du GPT.');
    const texts = parseAnswer(answer, r.step === 1 ? r.count : r.texts.length);
    if (!texts.length) throw new Error('Je ne trouve pas les posts : vérifie que le GPT a gardé les lignes « === POST 1 === ».');
    if (r.step === 1) { ui.relay = { ...r, step: 2, texts }; render(); return; }
    await saveRelayPosts(r.texts.map((t, i) => texts[i] || t));
  },
  async 'relay-skip'() { await saveRelayPosts(ui.relay.texts); },

  filter(f) { ui.filter = f; render(); },
  expand(id) { ui.expanded.add(id); render(); },
  edit(id) { ui.editing.add(id); render(); },
  'cancel-edit'(id) { ui.editing.delete(id); render(); },
  async save(id) {
    await api('PUT', `/api/posts/${id}`, { text: $(`[data-editor="${id}"] textarea`).value });
    ui.editing.delete(id);
    await refresh();
  },
  'open-feedback'(id) { ui.feedbackOpen.add(id); render(); $(`[data-feedback="${id}"] textarea`)?.focus(); },
  'close-feedback'(id) { ui.feedbackOpen.delete(id); render(); },
  async 'send-feedback'(id, btn) {
    const feedback = $(`[data-feedback="${id}"] textarea`).value;
    if (!feedback.trim()) throw new Error('Écris ou dicte ton retour.');
    btn.disabled = true;
    btn.textContent = 'Je refais le post…';
    try {
      await api('POST', `/api/posts/${id}/feedback`, { feedback });
    } catch (e) { btn.disabled = false; btn.textContent = 'Refaire avec ce retour'; throw e; }
    ui.feedbackOpen.delete(id);
    ui.expanded.add(id);
    await refresh();
    goto(id);
    toast('Post refait. Ton retour est mémorisé pour les prochains.');
  },
  async approve(id) { await api('POST', `/api/posts/${id}/status`, { status: 'approved' }); await refresh(); toast('Programmé ✓'); },
  async unapprove(id) { await api('POST', `/api/posts/${id}/status`, { status: 'review' }); await refresh(); },
  async 'approve-all'() {
    const list = clientPosts().filter((p) => ['review', 'draft', 'rejected'].includes(p.status));
    for (const p of list.filter((x) => x.status !== 'review')) await api('POST', `/api/posts/${p.id}/status`, { status: 'review' });
    const r = await api('POST', '/api/posts/bulk-approve', { ids: list.map((p) => p.id) });
    await refresh();
    toast(`${r.approved} programmé(s)${r.skipped.length ? ` · ${r.skipped.length} à compléter d'abord` : ''}`);
  },
  async delete(id) { await api('DELETE', `/api/posts/${id}`); ui.lastCreated = ui.lastCreated.filter((x) => x !== id); await refresh(); },
  async 'remove-image'(id) { await api('DELETE', `/api/posts/${id}/image`); await refresh(); },
  async 'publish-now'(id) {
    if (!confirm('Publier ce post sur LinkedIn maintenant ?')) return;
    const p = await api('POST', `/api/posts/${id}/publish-now`);
    await refresh();
    toast(p.status === 'published' ? 'Publié sur LinkedIn ✅' : p.error, p.status !== 'published');
  },

  niche(n) { ui.niche = n; ui.author = ''; render(); },
  'image-mode'(m) {
    if (m === 'library' && !myPhotos().length) { toast('Ajoute d\'abord tes photos dans l\'onglet Images.', true); actions.go('images'); return; }
    ui.imageMode = m; store.set('imageMode', m); render();
  },
  'toggle-image'(id) { if (ui.imageOpen.has(id)) ui.imageOpen.delete(id); else ui.imageOpen.add(id); render(); },
  async 'img-pick'(id, btn) { await api('POST', `/api/posts/${id}/image/library`, { imageId: btn.dataset.img }); await refresh(); },
  async 'img-auto'(id, btn) { btn.disabled = true; btn.textContent = 'Je choisis…'; try { await api('POST', `/api/posts/${id}/image/auto`); } finally { await refresh(); } },
  async 'img-ai'(id, btn) {
    btn.disabled = true; btn.textContent = 'Génération… (jusqu\'à 1 min)';
    try { await addImage(id, 'ai'); toast('Image générée'); } finally { await refresh(); }
  },
  async 'img-regen'(id, btn) {
    const prompt = $(`[data-imgprompt="${id}"]`).value;
    btn.disabled = true; btn.textContent = 'Génération…';
    try { await api('POST', `/api/posts/${id}/image/generate`, { prompt }); toast('Image regénérée'); } finally { await refresh(); }
  },
  async 'del-image'(id) { await api('DELETE', `/api/images/${id}`); await refresh(); },
  author(a) { ui.author = a || ''; render(); window.scrollTo(0, 0); },
  inspire(a) { ui.inspireFrom = a || ''; store.set('inspireFrom', ui.inspireFrom); render(); },
  async paste() {
    const text = $('#pasteText').value;
    const niche = $('#pasteNiche').value.trim();
    if (text.trim().length < 40) throw new Error('Colle au moins un post complet.');
    if (!niche) throw new Error('Indique la niche (ex. Ghostwriting).');
    if (!ui.data.settings.hasOpenaiKey) throw new Error("L'analyse utilise ta clé OpenAI : ajoute-la dans Réglages.");
    const chunks = chunkText(text);
    let added = 0;
    let found = 0;
    const failed = [];
    ui.niche = niche;
    ui.job = { kind: 'paste', total: chunks.length, done: 0, step: 'Analyse…' };
    try {
      for (const [i, chunk] of chunks.entries()) {
        ui.job.step = `Analyse ${i + 1} / ${chunks.length} (environ 20 s chacune)…`;
        render();
        let r = null;
        for (let attempt = 0; attempt < 2 && !r; attempt++) { // un morceau qui échoue est retenté une fois, puis on passe au suivant
          r = await api('POST', '/api/veille/paste', { text: chunk, niche }).catch(() => null);
        }
        if (r) { added += r.added; found += r.found; } else failed.push(i + 1);
        ui.job.done = i + 1;
      }
    } finally {
      ui.job = null;
      await refresh().catch(() => render());
    }
    if (!found && failed.length) throw new Error("L'analyse n'a pas abouti : réessaie dans un instant, ou colle un plus petit morceau.");
    $('#pasteText') && ($('#pasteText').value = '');
    toast(`${found} post(s) trouvés, ${added} ajoutés à la veille ${niche}${failed.length ? ` · ${failed.length} morceau(x) non analysé(s), recolle-les si besoin` : ''}`, failed.length > 0);
  },
  async 'del-veille'(id) { await api('DELETE', `/api/veille/${id}`); await refresh(); },
  async study(_id, btn) {
    btn.disabled = true;
    btn.textContent = 'Analyse en cours…';
    try { await api('POST', '/api/study', { niche: currentNiche(), author: ui.author }); } finally { await refresh(); }
    toast('Feedback de l\'étude prêt');
  },

  async copy(text) { await navigator.clipboard.writeText(text); toast('Copié'); },
  async 'test-openai'() { const r = await api('POST', '/api/settings/test-openai'); toast(`Clé OK ✅ (${r.model})`); },
  async 'copy-self'(role) { await navigator.clipboard.writeText(SELF_PROMPTS[role]); toast('Copié : colle-le dans ton GPT, puis colle sa réponse dans la case'); },
  async 'analyze-forms'(_id, btn) {
    btn.disabled = true;
    let left = Infinity;
    for (let i = 0; i < 40; i++) {
      const r = await api('POST', '/api/veille/structures');
      if (!r.done || r.remaining >= left) break; // rien de plus à analyser, ou l'IA n'a rien renvoyé
      left = r.remaining;
      btn.textContent = `Analyse de la forme… (${left} restants)`;
      if (!left) break;
    }
    await refresh();
    toast('Forme de toute la veille analysée');
  },
  async 'check-linkedin'() { const r = await api('POST', `/api/clients/${ui.clientId}/check-linkedin`); toast(`Connexion OK ✅ (${r.name}), valable jusqu'au ${new Date(r.expiresAt).toLocaleDateString('fr-FR')}`); },
  async disconnect() { await api('POST', `/api/clients/${ui.clientId}/disconnect`); await refresh(); },
  async 'move-linkedin'() {
    const others = ui.data.clients.filter((c) => c.id !== ui.clientId);
    if (!others.length) throw new Error('Crée d\'abord l\'autre client.');
    const r = await ask({ title: 'Déplacer la connexion LinkedIn vers…', submit: 'Déplacer', fields: [{ name: 'to', label: 'Client', options: others.map((c) => ({ value: c.id, label: c.name })) }] });
    if (!r) return;
    await api('POST', `/api/clients/${ui.clientId}/move-linkedin`, r);
    ui.clientId = r.to;
    store.set('clientId', r.to);
    await refresh();
  },
};

document.addEventListener('click', run(async (e) => {
  const tab = e.target.closest('#tabs button');
  if (tab) { actions.go(tab.dataset.view); return; }
  const el = e.target.closest('[data-action]');
  if (!el || el.tagName === 'INPUT') return;
  if (el.tagName === 'A') e.preventDefault();
  await actions[el.dataset.action]?.(el.dataset.id, el);
}));

document.addEventListener('input', (e) => {
  if (e.target.id === 'instruction') ui.instruction = e.target.value;
  if (e.target.id === 'hookSearch') { ui.hookSearch = e.target.value; ui.hookLimit = 60; clearTimeout(ui.hsT); ui.hsT = setTimeout(() => { render(); const el = $('#hookSearch'); el?.focus(); el?.setSelectionRange(el.value.length, el.value.length); }, 250); }
  const ed = e.target.closest('[data-editor] textarea');
  if (ed) {
    const count = ed.closest('[data-editor]').querySelector('.count');
    count.textContent = `${ed.value.length} / ${MAX_CHARS}`;
    count.classList.toggle('over', ed.value.length > MAX_CHARS);
  }
});

document.addEventListener('change', run(async (e) => {
  const t = e.target;
  if (t.id === 'clientSelect') {
    if (t.value === '__new') {
      const r = await ask({ title: 'Nouveau client', submit: 'Créer', fields: [{ name: 'name', label: 'Nom' }, { name: 'niche', label: 'Niche', placeholder: 'Ex. Ghostwriting, BTP, Consulting' }] });
      if (r?.name) { const c = await api('POST', '/api/clients', r); ui.clientId = c.id; ui.view = 'settings'; }
    } else ui.clientId = t.value;
    store.set('clientId', ui.clientId);
    ui.niche = undefined; ui.lastCreated = []; ui.relay = null;
    await refresh();
    return;
  }
  if (t.id === 'personaSel') { ui.personaId = t.value; return; }
  if (t.id === 'objectiveSel') { ui.objective = t.value; return; }
  if (t.id === 'awarenessSel') { ui.awareness = t.value; return; }
  if (t.id === 'ideaSel') { ui.ideaId = t.value; return; }
  if (t.id === 'hookLang') { ui.hookLang = t.value; render(); return; }
  if (t.dataset.metric) {
    const card = t.closest('details');
    const metrics = Object.fromEntries([...card.querySelectorAll('[data-metric]')].map((x) => [x.dataset.metric, x.value]));
    await api('PUT', `/api/posts/${t.dataset.id}`, { metrics });
    await refresh();
    return;
  }
  if (t.dataset.optimize !== undefined && t.value) {
    const h = ui.hookGen.hooks[Number(t.dataset.optimize)];
    toast('Optimisation…');
    const r = await api('POST', '/api/hooks/optimize', { clientId: ui.clientId, personaId: ui.hookGen.personaId, hook: h.text, mode: t.value });
    h.variants = r.hooks;
    render();
    return;
  }
  if (t.dataset.date) {
    if (!t.value) return;
    await api('PUT', `/api/posts/${t.dataset.date}`, { scheduledAt: new Date(t.value).toISOString() });
    await refresh();
    toast('Date modifiée');
    return;
  }
  if (t.dataset.upload && t.files[0]) {
    const dataUrl = await resizeImage(t.files[0]);
    await api('POST', `/api/posts/${t.dataset.upload}/image`, { dataUrl });
    await refresh();
    return;
  }
  if (t.dataset.library && t.files.length) {
    const files = [...t.files];
    const kind = t.dataset.library;
    ui.job = { kind: 'upload', total: files.length, done: 0, step: 'Envoi…' };
    try {
      for (const [i, f] of files.entries()) {
        ui.job.step = `Photo ${i + 1} / ${files.length} : envoi et description par l'IA…`;
        render();
        await api('POST', '/api/images', { kind, clientId: ui.clientId, niche: currentNiche(), dataUrl: await resizeImage(f) });
        ui.job.done = i + 1;
      }
    } finally { ui.job = null; await refresh(); }
    toast(`${files.length} image(s) ajoutée(s)`);
    return;
  }
  if (t.dataset.imgdesc) {
    await api('PUT', `/api/images/${t.dataset.imgdesc}`, { description: t.value });
    toast('Description enregistrée');
  }
}));

document.addEventListener('submit', run(async (e) => {
  const form = e.target;
  if (form.id === 'dialogForm') return;
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (form.id === 'loginForm') { store.set('password', data.password); await refresh(); return; }
  if (form.id === 'adnProfile') {
    const get = (pre) => Object.fromEntries(Object.entries(data).filter(([k]) => k.startsWith(pre)).map(([k, v]) => [k.slice(pre.length), v]));
    await api('PUT', `/api/clients/${ui.clientId}`, get('c.'));
    await api('PUT', `/api/clients/${ui.clientId}/adn`, { profile: get('p.'), forbiddenTopics: data['a.forbiddenTopics'] || '', objectives: JSON.parse($('#objChips').dataset.list || '[]') });
    ui.niche = undefined;
    toast('Profil enregistré');
  }
  if (form.classList.contains('persona-form')) {
    const id = form.dataset.persona;
    await api('PUT', `/api/clients/${ui.clientId}/adn`, { personas: personas().map((x) => (x.id === id ? { ...x, ...data, awareness: Number(data.awareness) || '' } : x)) });
    toast('Persona enregistré');
  }
  if (form.id === 'adnVoice') {
    await api('PUT', `/api/clients/${ui.clientId}/adn`, { voice: Object.fromEntries(Object.entries(data).map(([k, v]) => [k.replace(/^v\./, ''), v])) });
    toast('Voix enregistrée');
  }
  if (form.id === 'adnProofs') {
    const proofs = [...form.querySelectorAll('[data-proof]')].map((el) => ({ id: el.dataset.proof, type: el.querySelector('[name=type]').value, status: el.querySelector('[name=status]').value, text: el.querySelector('[name=text]').value, source: el.querySelector('[name=source]').value, date: el.querySelector('[name=date]').value, permission: el.querySelector('[name=permission]').checked }));
    await api('PUT', `/api/clients/${ui.clientId}/adn`, { proofs });
    toast('Preuves enregistrées');
  }
  if (form.id === 'adnOnboarding') { await saveOnboarding('adnOnboarding', 'onboarding', ui.data.editorial.onboarding); toast('Réponses enregistrées'); }
  if (form.id === 'adnInterview') { await saveOnboarding('adnInterview', 'interview', ui.data.editorial.interview); toast('Réponses enregistrées'); }
  if (form.id === 'clientForm') { await api('PUT', `/api/clients/${ui.clientId}`, data); ui.niche = undefined; toast('Fiche enregistrée'); }
  if (form.id === 'openaiForm' || form.id === 'linkedinForm') { await api('PUT', '/api/settings', data); toast('Enregistré'); }
  if (form.id === 'gptForm') {
    const roles = [...form.querySelectorAll('fieldset[data-role]')].map((f) => ({
      id: f.dataset.id || undefined,
      role: f.dataset.role,
      name: f.querySelector('[name=name]').value || (f.dataset.role === 'hooker' ? 'Mode hooker' : 'Mode content'),
      url: f.querySelector('[name=url]').value,
      instructions: f.querySelector('[name=instructions]').value,
      examples: f.querySelector('[name=examples]').value,
    }));
    const others = modules().filter((m) => !roles.some((r) => r.id === m.id));
    await api('PUT', '/api/settings', { modules: [...roles, ...others] });
    toast('GPTs enregistrés');
  }
  await refresh();
}));

// ---------- Mode jour / nuit ----------
const isDark = () => document.documentElement.dataset.theme === 'dark'
  || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
const syncThemeIcon = () => {
  const btn = $('#themeToggle');
  btn.textContent = isDark() ? '☀️' : '🌙';
  btn.title = isDark() ? 'Passer en mode jour' : 'Passer en mode nuit';
};
$('#themeToggle').addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  store.set('theme', next);
  syncThemeIcon();
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncThemeIcon);
syncThemeIcon();

// Info-bulle des graphiques
document.addEventListener('mousemove', (e) => {
  const tip = $('#tip');
  const row = e.target.closest('[data-tip]');
  if (!row) { tip.hidden = true; return; }
  tip.textContent = row.dataset.tip;
  tip.hidden = false;
  tip.style.left = `${Math.min(e.clientX + 14, innerWidth - 280)}px`;
  tip.style.top = `${e.clientY + 14}px`;
});

run(refresh)();
