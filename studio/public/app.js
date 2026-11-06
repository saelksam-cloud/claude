// Link Motion Studio — interface de validation (vanilla JS, aucun build).
const $ = (sel, el = document) => el.querySelector(sel);
const view = $('#view');

const STATUS = {
  draft: 'Brouillon',
  review: 'À valider',
  approved: 'Validé · programmé',
  rejected: 'À retravailler',
  published: 'Publié',
};
const PLACEHOLDER = /\[À COMPLÉTER/i;
const MAX_CHARS = 3000;
const FOLD_AT = 210; // LinkedIn coupe le post vers ~210 caractères (« … voir plus »)

const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* stockage indisponible */ } },
};

const ui = {
  data: null,
  clientId: store.get('clientId', null),
  view: store.get('view', 'clients'),
  search: '',
  onlyWorking: true,
  filter: 'all',
  editing: new Set(),
  expanded: new Set(),
  calMonth: null,
};

// ---------- utilitaires ----------
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmtDate = (iso) => iso ? new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '—';
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

function toast(msg, isError = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = `toast${isError ? ' err' : ''}`;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, 3500);
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
    <form class="panel stack login" id="loginForm">
      <h2>Link Motion Studio</h2>
      <p class="sub" style="margin:0">Entre ton mot de passe pour accéder au tableau de bord.</p>
      <input type="password" name="password" placeholder="Mot de passe" autocomplete="current-password" required autofocus>
      ${message ? `<div class="alert err">${esc(message)}</div>` : ''}
      <button class="btn primary" type="submit">Se connecter</button>
    </form>`;
}

async function refresh() {
  ui.data = await api('GET', '/api/state');
  if (!ui.data.clients.some((c) => c.id === ui.clientId)) ui.clientId = ui.data.clients[0]?.id ?? null;
  render();
}

const client = () => ui.data.clients.find((c) => c.id === ui.clientId);
const clientPosts = () => ui.data.posts
  .filter((p) => p.clientId === ui.clientId)
  .sort((a, b) => (a.scheduledAt || '9').localeCompare(b.scheduledAt || '9'));

// ---------- rendu global ----------
function render() {
  const sel = $('#clientSelect');
  sel.innerHTML = ui.data.clients.map((c) => `<option value="${c.id}" ${c.id === ui.clientId ? 'selected' : ''}>${esc(c.name || 'Sans nom')}${c.company ? ` — ${esc(c.company)}` : ''}</option>`).join('')
    + '<option value="__new">+ Nouveau client…</option>';

  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.view === ui.view));

  const banners = [];
  if (!ui.data.linkedinConfigured) banners.push("L'app LinkedIn n'est pas encore branchée : tu peux tout préparer et valider, mais rien ne sera publié tant qu'elle n'est pas renseignée dans l'onglet <b>Réglages</b>.");
  else if (client() && !client().linkedin.connected && !['clients', 'settings'].includes(ui.view)) banners.push(`${esc(client().name)} n'a pas encore connecté son LinkedIn : onglet Profil &amp; LinkedIn.`);
  $('#banner').innerHTML = banners.map((b) => `<div class="banner">${b}</div>`).join('');

  const views = { clients: renderClients, posts: renderPosts, calendar: renderCalendar, veille: renderVeille, client: renderClient, settings: renderSettings };
  if (!client() && !['clients', 'settings'].includes(ui.view)) ui.view = 'clients';
  (views[ui.view] || renderClients)();
  enhanceVoice(view);
  renderJob();
}

// ---------- Validation ----------
function renderPosts() {
  const posts = clientPosts();
  const counts = Object.fromEntries(Object.keys(STATUS).map((s) => [s, posts.filter((p) => p.status === s).length]));
  const shown = ui.filter === 'all' ? posts : posts.filter((p) => p.status === ui.filter);
  const reviewable = posts.filter((p) => p.status === 'review');

  view.innerHTML = `
    <h2>Validation des posts</h2>
    <p class="sub">Relis, modifie, valide. Les posts validés partent automatiquement à la date prévue.</p>
    <div class="stats">
      <div class="stat"><div class="n">${posts.length}</div><div class="l">posts au total</div></div>
      <div class="stat"><div class="n">${counts.review}</div><div class="l">à valider</div></div>
      <div class="stat"><div class="n">${counts.approved}</div><div class="l">programmés</div></div>
      <div class="stat"><div class="n">${counts.published}</div><div class="l">publiés</div></div>
    </div>
    <div class="toolbar">
      <div class="group">
        <button class="chip ${ui.filter === 'all' ? 'active' : ''}" data-filter="all">Tous<b>${posts.length}</b></button>
        ${Object.entries(STATUS).map(([s, l]) => `<button class="chip ${ui.filter === s ? 'active' : ''}" data-filter="${s}">${l}<b>${counts[s]}</b></button>`).join('')}
      </div>
      <div class="group">
        ${reviewable.length ? `<button class="btn ok" data-action="bulk-approve">✓ Valider les ${reviewable.length} posts « à valider »</button>` : ''}
        <button class="btn primary" data-action="month">⚡ Générer le mois en 1 clic</button>
        <button class="btn" data-action="one-post">⚡ 1 post</button>
        <button class="btn" data-action="ai-write">✨ Sur un sujet</button>
        <button class="btn" data-action="redo-all">🔁 Refaire les posts</button>
        <button class="btn" data-action="new-post">+ Post vide</button>
        <button class="btn ghost" data-action="import">Importer (JSON)</button>
      </div>
    </div>
    ${shown.length ? shown.map(renderPost).join('') : '<p class="empty">Aucun post ici.</p>'}`;
}

function renderPost(p) {
  const c = client();
  const editing = ui.editing.has(p.id);
  const long = p.text.length > FOLD_AT && !ui.expanded.has(p.id);
  const text = long ? `${esc(p.text.slice(0, FOLD_AT).trimEnd())}… <button class="li-more" data-action="expand" data-id="${p.id}">voir plus</button>` : esc(p.text);
  const hasPlaceholder = PLACEHOLDER.test(p.text);
  const locked = p.status === 'published';

  const preview = `
    <div class="li">
      <div class="li-head"><div class="li-avatar">${initials(c.name)}</div>
        <div><div class="li-name">${esc(c.name)}</div><div class="li-sub">${esc(c.company || '')} · ${p.scheduledAt ? new Date(p.scheduledAt).toLocaleDateString('fr-FR') : 'non programmé'}</div></div>
      </div>
      <div class="li-text">${text}</div>
      ${p.image ? `<img class="li-img" src="/uploads/${esc(p.image)}" alt="${esc(p.altText)}">` : ''}
      <div class="li-foot"><span>👍 J'aime</span><span>💬 Commenter</span><span>🔁 Republier</span></div>
    </div>`;

  const editor = `
    <div class="editor" data-editor="${p.id}">
      <textarea name="text" rows="16">${esc(p.text)}</textarea>
      <div class="count">${p.text.length} / ${MAX_CHARS}</div>
      <div class="grid2">
        <label class="f">Date de publication<input type="datetime-local" name="scheduledAt" value="${toLocalInput(p.scheduledAt)}"></label>
        <label class="f">Format<input name="format" value="${esc(p.format)}"></label>
        <label class="f">Thème<input name="theme" value="${esc(p.theme)}"></label>
        <label class="f">Texte alternatif de l'image<input name="altText" value="${esc(p.altText)}"></label>
      </div>
      <label class="f">Idée de visuel<textarea name="visualIdea" rows="2">${esc(p.visualIdea)}</textarea></label>
      <div class="actions" style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn ghost" data-action="cancel-edit" data-id="${p.id}">Annuler</button>
        <button class="btn primary" data-action="save" data-id="${p.id}">Enregistrer</button>
      </div>
    </div>`;

  return `
  <article class="post" id="${p.id}">
    <div>${editing ? editor : preview}</div>
    <aside class="meta">
      <div class="row"><span class="badge s-${p.status}">${STATUS[p.status]}</span><span class="k">${esc(p.format)}</span></div>
      <div class="row"><span class="k">Publication</span><span>${fmtDate(p.scheduledAt)}</span></div>
      ${p.theme ? `<div class="row"><span class="k">Thème</span><span>${esc(p.theme)}</span></div>` : ''}
      ${p.visualIdea ? `<div class="visual"><b>Idée de visuel</b>${esc(p.visualIdea)}</div>` : ''}
      ${hasPlaceholder ? '<div class="alert ph">✍️ Contient un « [À COMPLÉTER … ] » : remplace-le par une info réelle du client avant de valider.</div>' : ''}
      ${p.status === 'rejected' && p.feedback ? `<div class="alert fb">Retour : ${esc(p.feedback)}</div>` : ''}
      ${p.error ? `<div class="alert err">⚠️ ${esc(p.error)}</div>` : ''}
      ${p.status === 'published' ? `<div class="row"><span class="k">Publié le</span><span>${fmtDate(p.publishedAt)}</span></div>` : ''}
      ${locked ? '' : `
      <div class="actions">
        ${p.status !== 'approved' ? `<button class="btn ok small" data-action="approve" data-id="${p.id}" ${hasPlaceholder ? 'disabled' : ''}>✓ Valider</button>` : `<button class="btn small" data-action="unapprove" data-id="${p.id}">↩ Retirer de la file</button>`}
        ${p.status !== 'rejected' ? `<button class="btn danger small" data-action="reject" data-id="${p.id}">✕ À retravailler</button>` : ''}
        ${editing ? '' : `<button class="btn small" data-action="edit" data-id="${p.id}">✎ Modifier</button>`}
        <button class="btn small" data-action="gpt-redo" data-id="${p.id}">🤖 Refaire avec mon GPT</button>
        <button class="btn small" data-action="ai-rewrite" data-id="${p.id}">✨ Réécrire (auto)</button>
        <label class="btn small">🖼 ${p.image ? 'Changer' : 'Ajouter'} l'image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-action="upload" data-id="${p.id}" hidden></label>
        ${p.image ? `<button class="btn small ghost" data-action="remove-image" data-id="${p.id}">Retirer l'image</button>` : ''}
        ${p.status === 'approved' ? `<button class="btn primary small" data-action="publish-now" data-id="${p.id}">Publier maintenant</button>` : ''}
        <button class="btn small ghost" data-action="copy" data-id="${p.id}">Copier le texte</button>
        <button class="btn small ghost" data-action="delete" data-id="${p.id}">Supprimer</button>
      </div>`}
    </aside>
  </article>`;
}

// ---------- Calendrier ----------
function renderCalendar() {
  const posts = clientPosts().filter((p) => p.scheduledAt);
  if (!ui.calMonth) {
    const next = posts.find((p) => p.status !== 'published') || posts[0];
    const d = next ? new Date(next.scheduledAt) : new Date();
    ui.calMonth = { y: d.getFullYear(), m: d.getMonth() };
  }
  const { y, m } = ui.calMonth;
  const first = new Date(y, m, 1);
  const start = new Date(y, m, 1 - ((first.getDay() + 6) % 7)); // lundi
  const todayKey = new Date().toDateString();
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    if (i >= 35 && d.getMonth() !== m) break;
    const evs = posts.filter((p) => new Date(p.scheduledAt).toDateString() === d.toDateString());
    days.push(`<div class="day ${d.getMonth() !== m ? 'out' : ''} ${d.toDateString() === todayKey ? 'today' : ''}">
      <span class="d">${d.getDate()}</span>
      ${evs.map((p) => `<button class="ev s-${p.status}" data-action="goto" data-id="${p.id}" title="${esc(p.text.slice(0, 120))}">${new Date(p.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · ${esc(p.theme || p.text.slice(0, 40))}</button>`).join('')}
    </div>`);
  }
  view.innerHTML = `
    <div class="cal-head">
      <div><h2>${first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2><p class="sub" style="margin:0">Clique sur un post pour l'ouvrir.</p></div>
      <div class="group" style="display:flex;gap:8px">
        <button class="btn" data-action="cal-prev">←</button>
        <button class="btn" data-action="cal-next">→</button>
      </div>
    </div>
    <div class="cal">${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => `<div class="dow">${d}</div>`).join('')}${days.join('')}</div>`;
}

// ---------- Veille ----------
const scoreOf = (v) => (Number(String(v.likes).replace(/\D/g, '')) || 0) + 2 * (Number(String(v.comments).replace(/\D/g, '')) || 0);
const sameNiche = (a, b) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
const allNiches = () => [...new Set([...ui.data.clients.map((c) => c.niche), ...ui.data.veille.map((v) => v.niche), ...ui.data.profiles.map((p) => p.niche)]
  .map((n) => (n || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
const nicheDatalist = () => `<datalist id="nicheList">${allNiches().map((n) => `<option value="${esc(n)}">`).join('')}</datalist>`;

// Même règle que le serveur : tes exemples + le top 40 % des posts concurrents.
function workingIds(items) {
  const scraped = items.filter((v) => v.source === 'profile').sort((a, b) => scoreOf(b) - scoreOf(a));
  const keep = Math.max(Math.min(3, scraped.length), Math.ceil(scraped.length * 0.4));
  return new Set([...items.filter((v) => v.source !== 'profile'), ...scraped.slice(0, keep)].map((v) => v.id));
}

function renderVeille() {
  if (ui.niche === undefined) ui.niche = client()?.niche || '';
  const inNiche = (x) => !ui.niche || sameNiche(x.niche, ui.niche);
  const items = ui.data.veille.filter(inNiche);
  const working = workingIds(items);
  const shown = (ui.onlyWorking ? items.filter((v) => working.has(v.id)) : items).sort((a, b) => scoreOf(b) - scoreOf(a));
  const profiles = ui.data.profiles.filter(inNiche);
  const analyses = ui.data.analyses.filter(inNiche);
  const st = ui.data.settings;
  const c = client();
  const statusBadge = { running: '<span class="badge s-review">Analyse en cours…</span>', done: '<span class="badge s-published">Analysé</span>', error: '<span class="badge s-rejected">Erreur</span>', new: '<span class="badge s-draft">En attente</span>' };

  view.innerHTML = `
    ${nicheDatalist()}
    <h2>Veille & étude de marché</h2>
    <p class="sub">La veille est partagée entre tous tes clients et classée par niche (BTP, consulting, ghostwriting…). Les posts d'une niche servent à tous les clients de cette niche ; les mécaniques des autres niches servent d'inspiration à tout le monde.</p>
    <div class="toolbar"><div class="group">
      <button class="chip ${!ui.niche ? 'active' : ''}" data-action="set-niche" data-id="">Toutes<b>${ui.data.veille.length}</b></button>
      ${allNiches().map((n) => `<button class="chip ${sameNiche(n, ui.niche) ? 'active' : ''}" data-action="set-niche" data-id="${esc(n)}">${esc(n)}<b>${ui.data.veille.filter((v) => sameNiche(v.niche, n)).length}</b></button>`).join('')}
    </div></div>
    <div class="two-col">
      <div>
        <form class="panel stack" id="profileForm">
          <h3>🔎 Analyser un concurrent</h3>
          <p class="sub" style="margin:0">Colle le lien d'un profil LinkedIn : l'app récupère ses posts et repère ceux qui marchent.${st.hasApifyToken ? '' : ' <b>Nécessite une clé Apify (Réglages).</b>'}</p>
          <input name="url" placeholder="https://www.linkedin.com/in/…" required>
          <input name="niche" list="nicheList" placeholder="Niche (ex. BTP)" value="${esc(ui.niche)}" data-novoice>
          <button class="btn primary" type="submit">Analyser ce profil</button>
        </form>
        <form class="panel stack" id="veilleForm">
          <h3>⭐ Ajouter un exemple qui marche</h3>
          <p class="sub" style="margin:0">Un post dont tu veux que l'IA s'inspire en priorité.</p>
          <input name="niche" list="nicheList" placeholder="Niche (ex. BTP)" value="${esc(ui.niche)}" data-novoice>
          <input name="author" placeholder="Auteur">
          <input name="url" placeholder="Lien du post (facultatif)">
          <div class="grid2"><input name="likes" placeholder="Réactions" inputmode="numeric"><input name="comments" placeholder="Commentaires" inputmode="numeric"></div>
          <textarea name="text" rows="7" placeholder="Texte complet du post" required></textarea>
          <input name="notes" placeholder="Pourquoi il marche selon toi ? (facultatif)">
          <button class="btn primary" type="submit">Ajouter à la veille</button>
        </form>
      </div>
      <div>
        <div class="panel">
          <div class="toolbar" style="margin-bottom:8px"><h3 style="margin:0">🧠 Étude de marché${ui.niche ? ` — ${esc(ui.niche)}` : ''}</h3>
            <div class="group">
              <button class="btn small primary" data-action="analyze">Lancer l'étude (IA)</button>
              <button class="btn small" data-action="copy-veille">📋 Copier pour mon GPT</button>
            </div></div>
          ${analyses.length ? analyses.map((a, k) => `
            <details class="item" ${k === 0 ? 'open' : ''}><summary class="top"><span>${fmtDate(a.createdAt)}${a.niche ? ` · ${esc(a.niche)}` : ''}</span><button class="btn small ghost" data-action="del-analysis" data-id="${a.id}">Supprimer</button></summary>
            <div class="txt" style="max-height:none">${esc(a.content)}</div></details>`).join('') : '<p class="sub" style="margin:0">Pas encore d\'étude pour cette niche. Il faut au moins 3 posts en veille.</p>'}
        </div>
        ${profiles.length ? `<div class="panel"><h3>Concurrents suivis (${profiles.length})</h3>${profiles.map((p) => `
          <div class="item"><div class="top"><span><b style="color:var(--text)">${esc(p.name || p.url.replace(/^https:\/\/(www\.)?linkedin\.com\//, ''))}</b> · ${esc(p.niche || 'sans niche')} · ${p.postCount || 0} posts</span>
            <span style="display:flex;gap:6px;align-items:center">${statusBadge[p.status] || ''}
            <button class="btn small ghost" data-action="rerun-profile" data-id="${p.id}">Relancer</button>
            <button class="btn small ghost" data-action="del-profile" data-id="${p.id}">Retirer</button></span></div>
            ${p.error ? `<div class="alert err">${esc(p.error)}</div>` : ''}</div>`).join('')}</div>` : ''}
        <div class="panel">
          <div class="toolbar" style="margin-bottom:8px"><h3 style="margin:0">${shown.length} post(s)${ui.onlyWorking ? ' qui marchent' : ''}</h3>
            <label class="chip" style="cursor:pointer"><input type="checkbox" data-action="toggle-working" ${ui.onlyWorking ? 'checked' : ''} style="width:auto;margin-right:6px">Seulement ceux qui marchent</label></div>
          ${shown.length ? shown.map((v) => `
            <div class="item">
              <div class="top"><span>${v.source === 'profile' ? '🔎' : '⭐'} <b style="color:var(--text)">${esc(v.author || 'Auteur inconnu')}</b> · 👍 ${esc(v.likes || '?')} · 💬 ${esc(v.comments || '?')}${v.niche ? ` · ${esc(v.niche)}` : ''}${working.has(v.id) && v.source === 'profile' ? ' · <span style="color:var(--ok)">top</span>' : ''} ${v.url ? `· <a href="${esc(v.url)}" target="_blank" rel="noopener">voir</a>` : ''}</span>
              <span style="display:flex;gap:6px">${c ? `<button class="btn small" data-action="decline" data-id="${v.id}">⚡ Décliner pour ${esc(c.name)}</button>` : ''}
              <button class="btn small ghost" data-action="del-veille" data-id="${v.id}">Supprimer</button></span></div>
              <div class="txt">${esc(v.text)}</div>
              ${v.notes ? `<div class="top" style="margin-top:6px">📝 ${esc(v.notes)}</div>` : ''}
            </div>`).join('') : '<p class="empty">Aucun post. Ajoute des exemples ou analyse des concurrents.</p>'}
        </div>
      </div>
    </div>`;
}

function veillePrompt() {
  const items = ui.data.veille.filter((v) => !ui.niche || sameNiche(v.niche, ui.niche));
  const top = items.filter((v) => workingIds(items).has(v.id)).sort((a, b) => scoreOf(b) - scoreOf(a)).slice(0, 25);
  const c = client();
  return `Étude de marché LinkedIn — niche : ${ui.niche || 'toutes'}.
Voici les ${top.length} posts qui marchent le mieux chez les concurrents.

1. Analyse les hooks, structures, longueurs, formats et fins de post qui fonctionnent.
2. Écris ensuite des posts dans ce style pour ${c?.name || 'mon client'}${c?.company ? ` (${c.company})` : ''}${c?.audience ? `, cible : ${c.audience}` : ''}. Sépare chaque post par une ligne « === POST n === ».

${top.map((v, i) => `--- Post ${i + 1} — ${v.author || 'auteur inconnu'} (👍 ${v.likes || '?'} · 💬 ${v.comments || '?'})\n${v.text}`).join('\n\n')}`;
}

// ---------- Clients ----------
function clientStats(c) {
  const posts = ui.data.posts.filter((p) => p.clientId === c.id);
  const count = (s) => posts.filter((p) => p.status === s).length;
  const next = posts.filter((p) => p.status === 'approved' && p.scheduledAt).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];
  return { total: posts.length, review: count('review'), approved: count('approved'), published: count('published'), next };
}

function renderClients() {
  view.innerHTML = `
    <div class="toolbar">
      <div><h2>Clients</h2><p class="sub" style="margin:0">Tape un nom pour retrouver une fiche, ses posts et son calendrier.</p></div>
      <button class="btn primary" data-action="new-client">+ Nouveau client</button>
    </div>
    <input id="clientSearch" placeholder="🔍 Rechercher un client…" value="${esc(ui.search)}" style="margin-bottom:16px">
    <div class="client-grid">
      ${ui.data.clients.map((c) => {
        const st = clientStats(c);
        return `<article class="client-card ${c.id === ui.clientId ? 'current' : ''}" data-search="${esc(`${c.name} ${c.company} ${c.sector} ${c.niche}`.toLowerCase())}">
          <div class="cc-head"><div class="li-avatar">${initials(c.name)}</div>
            <div><div class="cc-name">${esc(c.name || 'Sans nom')}</div><div class="cc-sub">${esc(c.company || '')}${c.niche ? ` · ${esc(c.niche)}` : ''}</div></div></div>
          <div class="cc-stats"><span><b>${st.review}</b> à valider</span><span><b>${st.approved}</b> programmés</span><span><b>${st.published}</b> publiés</span></div>
          <div class="cc-sub">${c.linkedin.connected ? `<span class="badge s-published">LinkedIn connecté</span>` : `<span class="badge s-draft">LinkedIn non connecté</span>`}
            ${st.next ? ` · prochain post ${new Date(st.next.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}` : ''}</div>
          <div class="cc-actions">
            <button class="btn small primary" data-action="open-client" data-id="${c.id}" data-to="posts">Posts</button>
            <button class="btn small" data-action="open-client" data-id="${c.id}" data-to="calendar">Calendrier</button>
            <button class="btn small" data-action="open-client" data-id="${c.id}" data-to="client">Fiche</button>
          </div>
        </article>`;
      }).join('')}
    </div>
    <p class="empty" id="noClient" hidden>Aucun client ne correspond.</p>`;
  filterClients();
}

function filterClients() {
  const q = ui.search.trim().toLowerCase();
  let shown = 0;
  document.querySelectorAll('.client-card').forEach((el) => {
    const ok = !q || el.dataset.search.includes(q);
    el.hidden = !ok;
    shown += ok;
  });
  const empty = $('#noClient');
  if (empty) empty.hidden = shown > 0;
}

// ---------- Réglages ----------
function renderSettings() {
  const st = ui.data.settings;
  view.innerHTML = `
    <h2>Réglages</h2>
    <p class="sub">À faire une seule fois. Les clés secrètes restent sur le serveur : elles ne sont jamais réaffichées.</p>
    <div class="settings-grid">
      <form class="panel stack" id="linkedinForm">
        <h3>1. App LinkedIn ${ui.data.linkedinConfigured ? '<span class="badge s-published">Branchée</span>' : '<span class="badge s-review">À faire</span>'}</h3>
        <ol class="steps">
          <li>Va sur <a href="https://www.linkedin.com/developers/apps/new" target="_blank" rel="noopener">linkedin.com/developers/apps/new</a>. Nom : « Link Motion Studio ». Page LinkedIn : ta page entreprise Link Motion (obligatoire). Ajoute un logo, coche les conditions, « Create app ».</li>
          <li>Onglet <b>Products</b> : clique « Request access » sur <b>Share on LinkedIn</b> et sur <b>Sign In with LinkedIn using OpenID Connect</b>.</li>
          <li>Onglet <b>Auth</b> → « Authorized redirect URLs » → ajoute :
            <div class="code" style="margin-top:4px">${esc(ui.data.redirectUri)}</div>
            <button type="button" class="btn small" data-action="copy-link" data-link="${esc(ui.data.redirectUri)}" style="margin-top:6px">Copier</button></li>
          <li>Toujours dans <b>Auth</b>, copie le <b>Client ID</b> et le <b>Primary Client Secret</b> ci-dessous.</li>
        </ol>
        <label class="f">Client ID<input name="linkedinClientId" value="${esc(st.linkedinClientId)}" autocomplete="off"></label>
        <label class="f">Client Secret<input name="linkedinClientSecret" type="password" placeholder="${st.hasLinkedinSecret ? 'Enregistré ✓ (laisser vide pour garder)' : 'Colle le secret ici'}" autocomplete="new-password"></label>
        <button class="btn primary" type="submit" style="align-self:flex-end">Enregistrer</button>
      </form>

      <form class="panel stack" id="openaiForm">
        <h3>2. Clé API OpenAI (ChatGPT) ${st.hasOpenaiKey ? '<span class="badge s-published">Enregistrée</span>' : '<span class="badge s-draft">Facultatif</span>'}</h3>
        <p class="sub" style="margin:0">Pour que l'app écrive et réécrive les posts elle-même avec tes modules. Crée une clé sur <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">platform.openai.com/api-keys</a> (facturation à l'usage, séparée de l'abonnement ChatGPT Plus).</p>
        <label class="f">Clé API<input name="openaiKey" type="password" placeholder="${st.hasOpenaiKey ? `Enregistrée ${esc(st.openaiKeyHint)} (laisser vide pour garder)` : 'sk-…'}" autocomplete="new-password"></label>
        <label class="f">Modèle OpenAI (nom technique, pas le nom de ton GPT : laisse vide si tu ne sais pas)<input name="openaiModel" value="${esc(st.openaiModel)}" placeholder="gpt-4.1 (par défaut)"></label>
        <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">
          ${st.hasOpenaiKey ? '<button type="button" class="btn" data-action="test-openai">Tester la clé</button>' : ''}
          <button class="btn primary" type="submit">Enregistrer</button>
        </div>
      </form>

      <form class="panel stack" id="apifyForm">
        <h3>4. Clé Apify (analyse des concurrents) ${st.hasApifyToken ? '<span class="badge s-published">Enregistrée</span>' : '<span class="badge s-draft">Facultatif</span>'}</h3>
        <p class="sub" style="margin:0">Apify récupère les posts publics des profils concurrents (ton compte LinkedIn n'est jamais utilisé). Crée un compte sur <a href="https://console.apify.com/sign-up" target="_blank" rel="noopener">apify.com</a>, puis <b>Settings → API &amp; Integrations</b> → copie le « Personal API token ». Environ 2 $ pour 1 000 posts récupérés.</p>
        <label class="f">Token Apify<input name="apifyToken" type="password" placeholder="${st.hasApifyToken ? 'Enregistré ✓ (laisser vide pour garder)' : 'apify_api_…'}" autocomplete="new-password"></label>
        <label class="f">Robot Apify (laisse vide sauf si je te dis de changer)<input name="apifyActor" value="${esc(st.apifyActor)}" placeholder="harvestapi/linkedin-profile-posts"></label>
        <button class="btn primary" type="submit" style="align-self:flex-end">Enregistrer</button>
      </form>
    </div>

    <form class="panel stack" id="modulesForm" style="margin-top:16px">
      <div class="toolbar" style="margin:0"><h3 style="margin:0">3. Modules d'écriture</h3><button type="button" class="btn small" data-action="add-module">+ Ajouter un module</button></div>
      <p class="sub" style="margin:0">Un module = un de tes GPTs. Colle le <b>lien du GPT</b> (ouvre-le dans ChatGPT et copie l'adresse, elle commence par https://chatgpt.com/g/…) : les boutons « 🤖 mon GPT » l'ouvriront directement. Le premier module de la liste est utilisé par défaut. Les champs Instructions et Connaissances servent seulement à l'écriture automatique (clé OpenAI).</p>
      <div id="modules">${(st.modules.length ? st.modules : []).map(moduleFields).join('') || '<p class="empty" style="padding:16px 0">Aucun module pour l\'instant.</p>'}</div>
      <button class="btn primary" type="submit" style="align-self:flex-end">Enregistrer les modules</button>
    </form>`;
}

const moduleFields = (m = {}) => `
  <fieldset class="module" data-id="${esc(m.id || '')}">
    <div class="grid2" style="grid-template-columns:1fr auto;align-items:end">
      <label class="f">Nom du module<input name="name" value="${esc(m.name || '')}" placeholder="Ex. Basic - Linka - Mode content"></label>
      <button type="button" class="btn small ghost" data-action="remove-module">Supprimer</button>
    </div>
    <label class="f">Lien du GPT<input name="url" value="${esc(m.url || '')}" placeholder="https://chatgpt.com/g/g-…"></label>
    <label class="f">Instructions<textarea name="instructions" rows="8">${esc(m.instructions || '')}</textarea></label>
    <label class="f">Connaissances (contenu des fichiers)<textarea name="knowledge" rows="6">${esc(m.knowledge || '')}</textarea></label>
  </fieldset>`;

const moduleOptions = () => [...ui.data.settings.modules.map((m) => ({ value: m.id, label: m.name })), { value: '', label: 'Sans module' }];
const preferredModuleId = () => {
  const mods = ui.data.settings.modules;
  const saved = store.get('moduleId', null);
  if (saved !== null && (saved === '' || mods.some((m) => m.id === saved))) return saved;
  return (mods.find((m) => /content/i.test(m.name)) || mods[0])?.id || '';
};
const findModule = (id) => ui.data.settings.modules.find((m) => m.id === id);

// ---------- Passer par mon GPT (copier-coller) ----------
const SEP = (n) => `=== POST ${n} ===`;
function buildBrief(posts, instruction) {
  const c = client();
  const fiche = [
    `Auteur : ${c.name}${c.company ? ` (${c.company})` : ''}`,
    c.sector && `Secteur : ${c.sector}`, c.offer && `Offre : ${c.offer}`, c.audience && `Cible : ${c.audience}`,
    c.tone && `Ton : ${c.tone}`, c.dos && `À faire : ${c.dos}`, c.donts && `À éviter : ${c.donts}`,
  ].filter(Boolean).join('\n');
  const multi = posts.length > 1;
  return `${multi ? `Réécris les ${posts.length} posts LinkedIn ci-dessous` : 'Réécris ce post LinkedIn'} avec ta méthode.

Consigne : ${instruction || 'rends-le plus percutant (hook, structure, lisibilité) en gardant le fond.'}

Fiche de l'auteur :
${fiche}

Règles :
- Texte prêt à publier, sans markdown (pas de **gras**), sans commentaire avant ou après.
- N'invente aucun chiffre ni anecdote : si une info manque, écris [À COMPLÉTER : …].
${multi ? `- Garde EXACTEMENT les séparateurs « ${SEP(1)} », « ${SEP(2)} »… avant chaque post, dans le même ordre.\n` : ''}
${posts.map((p, i) => `${multi ? `${SEP(i + 1)}\n` : '--- Post actuel ---\n'}${p.text}`).join('\n\n')}`;
}

function parseAnswer(answer, count) {
  const clean = (t) => t.replace(/\*\*|__/g, '').trim();
  if (count === 1) return [clean(answer.replace(/^\s*=+\s*POST\s*\d+\s*=+\s*$/gim, ''))];
  const parts = answer.split(/^\s*=+\s*POST\s*(\d+)\s*=+\s*$/gim);
  const out = new Array(count).fill(null);
  for (let i = 1; i < parts.length; i += 2) {
    const n = Number(parts[i]) - 1;
    if (n >= 0 && n < count && parts[i + 1]?.trim()) out[n] = clean(parts[i + 1]);
  }
  return out;
}

// Affiche le brief à copier, ouvre le GPT, récupère la réponse collée.
async function relay({ title, posts, instruction, module, step = '' }) {
  const brief = buildBrief(posts, instruction);
  const gptUrl = module?.url || 'https://chatgpt.com/gpts/mine';
  const dlg = $('#dialog');
  const form = $('#dialogForm');
  form.innerHTML = `<h3>${title}</h3>
    <p class="sub" style="margin:0 0 12px">${step}1. Copie le brief. 2. Ouvre ${module ? `<b>${esc(module.name)}</b>` : 'ton GPT'} et colle-le. 3. Colle sa réponse ci-dessous.</p>
    <div class="stack">
      <textarea readonly rows="7" id="briefText">${esc(brief)}</textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" class="btn small primary" data-action="copy-brief">📋 Copier le brief</button>
        <a class="btn small" href="${esc(gptUrl)}" target="_blank" rel="noopener">↗ Ouvrir ${module ? esc(module.name) : 'mes GPTs'}</a>
      </div>
      <label class="f">Réponse du GPT<textarea name="answer" rows="9" placeholder="Colle ici tout ce que le GPT a répondu" data-novoice></textarea></label>
    </div>
    <div class="actions"><button class="btn ghost" value="cancel">Annuler</button><button class="btn primary" value="ok">Enregistrer</button></div>`;
  dlg.showModal();
  const answer = await new Promise((resolve) => {
    dlg.addEventListener('close', () => resolve(dlg.returnValue === 'ok' ? new FormData(form).get('answer') : null), { once: true });
  });
  if (answer === null) return null;
  if (!answer.trim()) throw new Error('Réponse vide : colle la réponse du GPT.');
  return parseAnswer(answer, posts.length);
}

async function saveRewrites(posts, texts, how) {
  let done = 0;
  for (const [i, post] of posts.entries()) {
    if (!texts[i]) continue;
    await api('PUT', `/api/posts/${post.id}`, { text: texts[i] });
    if (post.status !== 'review') await api('POST', `/api/posts/${post.id}/status`, { status: 'review' });
    done++;
  }
  return done;
}

// ---------- Profil client & LinkedIn ----------
function renderClient() {
  const c = client();
  const link = `${ui.data.publicUrl}/connect/${c.id}/${c.connectToken}`;
  const li = c.linkedin;
  const field = (name, label, rows = 0) => `<label class="f">${label}${rows ? `<textarea name="${name}" rows="${rows}">${esc(c[name])}</textarea>` : `<input name="${name}" value="${esc(c[name])}">`}</label>`;
  view.innerHTML = `
    <h2>${esc(c.name)}</h2>
    <p class="sub">La fiche « voix » sert de brief pour rédiger chaque post. Plus elle est précise, plus les posts sonnent comme ton client.</p>
    <div class="two-col">
      <div class="panel connect-box">
        <h3>Connexion LinkedIn</h3>
        ${li.connected
          ? `<div><span class="badge s-published">Connecté</span></div>
             <div>Profil : <b>${esc(li.name)}</b></div>
             <div class="k" style="color:var(--text-dim)">Autorisation valable jusqu'au ${new Date(li.expiresAt).toLocaleDateString('fr-FR')} (LinkedIn impose de la renouveler tous les 60 jours : renvoie simplement le lien).</div>
             <div style="display:flex;gap:8px;flex-wrap:wrap">
               <button class="btn small" data-action="move-linkedin">Ce n'est pas le bon client ? Déplacer vers…</button>
               <button class="btn danger small" data-action="disconnect">Déconnecter</button>
             </div>`
          : `<div><span class="badge s-draft">Non connecté</span></div>`}
        <div>Lien d'invitation à envoyer au client :</div>
        <div class="code">${esc(link)}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn primary small" data-action="copy-link" data-link="${esc(link)}">Copier le lien</button>
          <a class="btn small" href="${esc(link)}" target="_blank" rel="noopener">Connecter le LinkedIn de « ${esc(c.name)} » depuis cet appareil</a>
        </div>
        <p style="color:var(--text-dim);font-size:13px;margin:0">Le client ouvre le lien, clique « Autoriser avec LinkedIn » et c'est fini : aucun mot de passe partagé, et il peut révoquer l'accès quand il veut.</p>
        ${ui.data.linkedinConfigured ? '' : `<div class="alert ph">L'app LinkedIn n'est pas encore branchée : va dans l'onglet <b>Réglages</b> d'abord.</div>`}
      </div>
      <form class="panel stack" id="clientForm">
        <h3>Fiche voix du client</h3>
        <div class="grid2">${field('name', 'Nom (auteur des posts)')}${field('company', 'Entreprise')}</div>
        <label class="f">Niche (sert à choisir la veille : BTP, Consulting, Ghostwriting…)<input name="niche" list="nicheList" value="${esc(c.niche || '')}" data-novoice></label>${nicheDatalist()}
        ${field('sector', 'Secteur')}
        ${field('offer', 'Offre / ce que vend le client', 2)}
        ${field('audience', 'Cible des posts', 2)}
        ${field('tone', 'Ton & style', 3)}
        ${field('themes', 'Piliers de contenu', 3)}
        <div class="grid2">${field('dos', 'À faire', 3)}${field('donts', 'À éviter', 3)}</div>
        <button class="btn primary" type="submit" style="align-self:flex-end">Enregistrer la fiche</button>
      </form>
    </div>`;
}

// ---------- dialogue ----------
function ask({ title, intro = '', fields, submit = 'OK' }) {
  const dlg = $('#dialog');
  const form = $('#dialogForm');
  const control = (f) => {
    if (f.options) return `<select name="${f.name}">${f.options.map((o) => `<option value="${esc(o.value)}" ${o.value === f.value ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`;
    if (f.rows) {
      return `<textarea name="${f.name}" rows="${f.rows}" placeholder="${esc(f.placeholder || '')}">${esc(f.value || '')}</textarea>`;
    }
    return `<input name="${f.name}" type="${f.type || 'text'}" value="${esc(f.value || '')}" placeholder="${esc(f.placeholder || '')}">`;
  };
  form.innerHTML = `<h3>${title}</h3>${intro ? `<p class="sub" style="margin:0 0 12px">${intro}</p>` : ''}<div class="stack">${fields.map((f) => `<label class="f">${f.label}${control(f)}</label>`).join('')}</div>
    <div class="actions"><button class="btn ghost" value="cancel">Annuler</button><button class="btn primary" value="ok">${submit}</button></div>`;
  enhanceVoice(form);
  dlg.showModal();
  return new Promise((resolve) => {
    dlg.addEventListener('close', () => {
      stopDictation();
      resolve(dlg.returnValue === 'ok' ? Object.fromEntries(new FormData(form)) : null);
    }, { once: true });
  });
}

// ---------- Dictée vocale (Web Speech API du navigateur) ----------
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
const stopDictation = () => recognition?.stop();

// Ajoute un micro à tous les champs où l'on écrit (sauf clés, liens, chiffres…).
const NO_VOICE = new Set(['url', 'linkedinClientId', 'linkedinClientSecret', 'openaiKey', 'openaiModel', 'apifyToken', 'apifyActor', 'json', 'likes', 'comments', 'password']);
function enhanceVoice(root = document) {
  if (!SpeechRec) return;
  root.querySelectorAll('textarea:not([readonly]), input:not([type]), input[type="text"]').forEach((el) => {
    if (el.closest('.voice-wrap') || el.hasAttribute('data-novoice') || NO_VOICE.has(el.name) || el.id === 'clientSearch' || el.inputMode === 'numeric') return;
    const wrap = document.createElement('div');
    const inline = el.tagName === 'INPUT';
    wrap.className = `voice-wrap${inline ? ' inline' : ''}`;
    el.replaceWith(wrap);
    wrap.append(el);
    wrap.insertAdjacentHTML('beforeend', `<button type="button" class="btn small mic" data-action="dictate" data-label="${inline ? '🎤' : '🎤 Dicter'}" title="Dicter au micro">${inline ? '🎤' : '🎤 Dicter'}</button>`);
  });
}

function startDictation(btn) {
  const ta = btn.closest('.voice-wrap').querySelector('textarea, input');
  const base = ta.value.trim() ? `${ta.value.trim()} ` : '';
  const rec = new SpeechRec();
  rec.lang = 'fr-FR';
  rec.continuous = true;
  rec.interimResults = true;
  rec.onresult = (e) => {
    // On reconstruit tout le texte à chaque résultat : évite les doublons sur mobile.
    ta.value = base + [...e.results].map((res) => res[0].transcript).join(' ').replace(/\s+/g, ' ').trimStart();
    ta.scrollTop = ta.scrollHeight;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  };
  rec.onerror = (e) => {
    if (e.error === 'no-speech' || e.error === 'aborted') return;
    toast(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? "Autorise l'accès au micro pour dicter." : `Dictée interrompue (${e.error})`, true);
  };
  rec.onend = () => {
    recognition = null;
    btn.classList.remove('rec');
    btn.textContent = btn.dataset.label || '🎤 Dicter';
  };
  recognition = rec;
  rec.start();
  btn.classList.add('rec');
  btn.textContent = btn.closest('.inline') ? '⏹' : '⏹ Arrêter la dictée';
}

// ---------- Tâches longues : « mois en 1 clic », analyse des concurrents ----------
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
ui.job = null;

function renderJob() {
  const el = $('#job');
  if (!el) return;
  const j = ui.job;
  el.innerHTML = j ? `<div class="job">
      <div><b>${esc(j.title)}</b><div class="sub" style="margin:2px 0 0">${esc(j.step)}</div></div>
      ${j.total ? `<div class="progress"><span style="width:${Math.round((100 * j.done) / j.total)}%"></span></div>` : ''}
      ${j.finished ? '<button class="btn small" data-action="job-close">Fermer</button>' : '<button class="btn small danger" data-action="job-stop">Arrêter</button>'}
    </div>` : '';
}
const setJob = (patch) => { ui.job = { ...ui.job, ...patch }; renderJob(); };

let polling = false;
async function pollProfiles(maxMs = 5 * 60_000) {
  if (polling) return;
  polling = true;
  const start = Date.now();
  try {
    await refresh();
    while (ui.data.profiles.some((p) => p.status === 'running') && Date.now() - start < maxMs && !ui.job?.stop) {
      await sleep(10_000);
      await api('POST', '/api/profiles/refresh');
      await refresh();
    }
  } finally { polling = false; }
}

async function generateMonth() {
  const c = client();
  const st = ui.data.settings;
  if (!st.hasOpenaiKey) throw new Error("Le « mois en 1 clic » écrit avec l'API OpenAI : ajoute ta clé (sk-…) dans Réglages.");
  const total = 20;
  ui.job = { title: `⚡ Mois de ${c.name}`, step: 'Préparation…', done: 0, total, stop: false };
  renderJob();
  try {
    // 1. Concurrents de la niche : on relance ceux qui datent de plus de 7 jours.
    const competitors = ui.data.profiles.filter((p) => c.niche && sameNiche(p.niche, c.niche));
    if (competitors.length && st.hasApifyToken) {
      const stale = competitors.filter((p) => p.status !== 'running' && (!p.updatedAt || Date.now() - Date.parse(p.updatedAt) > 7 * 86_400_000));
      setJob({ step: `Étude de la concurrence : ${competitors.length} profil(s) de la niche ${c.niche}…` });
      for (const p of stale) await api('POST', `/api/profiles/${p.id}/rerun`).catch((e) => toast(e.message, true));
      await refresh();
      await pollProfiles(4 * 60_000);
    }
    if (ui.job.stop) return;
    // 2. Étude de marché sur les posts qui marchent.
    const nicheItems = ui.data.veille.filter((v) => sameNiche(v.niche, c.niche));
    if (nicheItems.length >= 3) {
      setJob({ step: `Étude de marché sur ${workingIds(nicheItems).size} posts qui marchent…` });
      await api('POST', '/api/analyze', { niche: c.niche });
    } else {
      toast(`Peu de veille pour la niche « ${c.niche || '—'} » : les posts s'appuieront surtout sur la fiche client.`, true);
    }
    // 3. Rédaction et programmation.
    const moduleId = preferredModuleId();
    for (let i = 0; i < total && !ui.job.stop; i++) {
      setJob({ step: `Rédaction du post ${i + 1} / ${total}…`, done: i });
      await api('POST', '/api/generate', { clientId: c.id, moduleId });
    }
    setJob({ done: ui.job.stop ? ui.job.done : total, step: ui.job.stop ? 'Arrêté.' : 'Terminé : les posts sont « à valider ». Relis-les puis valide.', finished: true });
  } catch (e) {
    setJob({ step: `Arrêté : ${e.message}`, finished: true });
    throw e;
  } finally {
    await refresh();
  }
}

// ---------- actions ----------
const run = (fn) => async (...args) => {
  try { await fn(...args); } catch (e) {
    if (e instanceof AuthError) showLogin(store.get('password', '') ? e.message : '');
    else toast(e.message, true);
  }
};

const actions = {
  'set-niche'(niche) { ui.niche = niche || ''; render(); },
  async analyze() {
    toast("Étude de marché en cours… (jusqu'à une minute)");
    await api('POST', '/api/analyze', { niche: ui.niche });
    await refresh();
    toast('Étude terminée');
  },
  async 'del-profile'(id) { await api('DELETE', `/api/profiles/${id}`); await refresh(); },
  async 'rerun-profile'(id) { await api('POST', `/api/profiles/${id}/rerun`); await refresh(); toast('Analyse relancée'); pollProfiles(); },
  async decline(id) {
    toast(`Déclinaison pour ${client().name}…`);
    const p = await api('POST', '/api/generate', { clientId: ui.clientId, inspirationId: id, moduleId: preferredModuleId() });
    await refresh();
    toast('Post créé dans Validation (« à valider »)');
    return p;
  },
  async 'one-post'() {
    toast("L'IA écrit un post…");
    const p = await api('POST', '/api/generate', { clientId: ui.clientId, moduleId: preferredModuleId() });
    ui.filter = 'all';
    await refresh();
    actions.goto(p.id);
    toast('Post écrit et programmé : relis-le');
  },
  async month() { await generateMonth(); },
  'job-stop'() { if (ui.job) setJob({ stop: true, step: 'Arrêt après l\'étape en cours…' }); },
  'job-close'() { ui.job = null; renderJob(); },
  async 'test-openai'() {
    toast('Test de la clé…');
    const r = await api('POST', '/api/settings/test-openai');
    toast(`Clé OK ✅ (modèle ${r.model})`);
  },
  dictate(_id, btn) {
    if (recognition) { stopDictation(); return; }
    startDictation(btn);
  },
  async 'copy-brief'() { await navigator.clipboard.writeText($('#briefText').value); toast('Brief copié : colle-le dans ton GPT'); },
  async 'move-linkedin'() {
    const others = ui.data.clients.filter((c) => c.id !== ui.clientId);
    if (!others.length) throw new Error('Crée d\'abord l\'autre client.');
    const r = await ask({ title: 'Déplacer la connexion LinkedIn', submit: 'Déplacer', intro: `Le compte LinkedIn « ${esc(client().linkedin.name)} » sera rattaché à :`,
      fields: [{ name: 'to', label: 'Client', options: others.map((c) => ({ value: c.id, label: c.name })), value: others[0].id }] });
    if (!r) return;
    await api('POST', `/api/clients/${ui.clientId}/move-linkedin`, r);
    ui.clientId = r.to; store.set('clientId', r.to);
    toast('Connexion déplacée');
    await refresh();
  },
  async 'gpt-redo'(id) {
    const post = ui.data.posts.find((p) => p.id === id);
    const r = await ask({ title: '🤖 Refaire avec mon GPT', submit: 'Continuer', fields: [
      { name: 'moduleId', label: 'GPT', options: moduleOptions(), value: preferredModuleId() },
      { name: 'instruction', label: 'Qu\'est-ce qu\'il faut changer ? (facultatif)', rows: 3, value: post.feedback || '' },
    ] });
    if (!r) return;
    store.set('moduleId', r.moduleId);
    const texts = await relay({ title: '🤖 Refaire avec mon GPT', posts: [post], instruction: r.instruction, module: findModule(r.moduleId) });
    if (!texts) return;
    await saveRewrites([post], texts);
    await refresh(); actions.goto(id); toast('Post remplacé : relis-le');
  },
  async 'redo-all'() {
    const all = clientPosts().filter((p) => p.status !== 'published');
    const r = await ask({
      title: '🔁 Refaire les posts', submit: 'Lancer',
      intro: 'Les posts refaits repassent « à valider ». Les posts déjà publiés ne sont jamais touchés.',
      fields: [
        { name: 'scope', label: 'Quels posts ?', value: 'todo', options: [
          { value: 'todo', label: `Ceux pas encore validés (${all.filter((p) => p.status !== 'approved').length})` },
          { value: 'all', label: `Tous sauf publiés (${all.length})` },
          { value: 'shown', label: 'Ceux affichés par le filtre actuel' },
        ] },
        { name: 'instruction', label: 'Consigne', rows: 3, placeholder: 'Ex. hooks plus forts, plus courts, ajoute une question en fin de post' },
        { name: 'how', label: 'Comment ?', value: 'gpt', options: [
          { value: 'gpt', label: '🤖 Avec mon GPT (copier-coller, par lots de 5)' },
          { value: 'api', label: `✨ Automatique avec la clé OpenAI${ui.data.settings.hasOpenaiKey ? '' : ' (clé manquante)'}` },
        ] },
        { name: 'moduleId', label: 'Module / GPT', options: moduleOptions(), value: preferredModuleId() },
      ],
    });
    if (!r) return;
    store.set('moduleId', r.moduleId);
    const posts = r.scope === 'all' ? all
      : r.scope === 'shown' ? all.filter((p) => ui.filter === 'all' || p.status === ui.filter)
      : all.filter((p) => p.status !== 'approved');
    if (!posts.length) throw new Error('Aucun post à refaire.');
    let done = 0;
    if (r.how === 'api') {
      if (!ui.data.settings.hasOpenaiKey) throw new Error("Ajoute d'abord ta clé OpenAI dans Réglages, ou choisis « Avec mon GPT ».");
      for (const [i, post] of posts.entries()) {
        toast(`Réécriture ${i + 1} / ${posts.length}…`);
        await api('POST', `/api/posts/${post.id}/rewrite`, { moduleId: r.moduleId, feedback: r.instruction });
        done++;
      }
    } else {
      const module = findModule(r.moduleId);
      for (let i = 0; i < posts.length; i += 5) {
        const batch = posts.slice(i, i + 5);
        const lot = `Lot ${i / 5 + 1} / ${Math.ceil(posts.length / 5)} — `;
        const texts = await relay({ title: '🔁 Refaire les posts', posts: batch, instruction: r.instruction, module, step: lot });
        if (!texts) break;
        const n = await saveRewrites(batch, texts);
        done += n;
        if (n < batch.length) toast(`${batch.length - n} post(s) du lot non reconnus (séparateurs « === POST n === » manquants)`, true);
      }
    }
    await refresh();
    toast(`${done} post(s) refait(s) : relis-les avant de valider`);
  },
  'open-client'(id, btn) {
    ui.clientId = id; store.set('clientId', id);
    ui.view = btn.dataset.to; store.set('view', ui.view);
    ui.calMonth = null; ui.filter = 'all';
    render(); window.scrollTo(0, 0);
  },
  async 'new-client'() {
    const r = await ask({ title: 'Nouveau client', submit: 'Créer', fields: [{ name: 'name', label: 'Nom (auteur des posts)' }, { name: 'company', label: 'Entreprise' }, { name: 'sector', label: 'Secteur' }] });
    if (!r?.name) return;
    const c = await api('POST', '/api/clients', r);
    ui.clientId = c.id; store.set('clientId', c.id);
    ui.view = 'client'; store.set('view', ui.view);
    await refresh();
  },
  'add-module'() {
    const box = $('#modules');
    if (!box.querySelector('.module')) box.innerHTML = '';
    box.insertAdjacentHTML('beforeend', moduleFields());
    box.lastElementChild.querySelector('input').focus();
  },
  'remove-module'(_id, btn) { btn.closest('.module').remove(); },
  async 'ai-write'() {
    if (!ui.data.settings.hasOpenaiKey) throw new Error("Ajoute d'abord ta clé OpenAI dans l'onglet Réglages.");
    const r = await ask({
      title: "✨ Écrire un post avec l'IA", submit: 'Écrire le post',
      intro: "L'IA utilise la fiche voix du client, le module choisi et les posts de la veille.",
      fields: [
        { name: 'moduleId', label: 'Module', options: moduleOptions(), value: preferredModuleId() },
        { name: 'subject', label: 'Sujet / idée du post', rows: 3, placeholder: 'Ex. pourquoi les PME du BTP perdent de la marge sur les avenants' },
        { name: 'format', label: 'Format', value: 'Texte' },
        { name: 'scheduledAt', label: 'Date de publication', type: 'datetime-local' },
      ],
    });
    if (!r) return;
    store.set('moduleId', r.moduleId);
    toast("L'IA écrit… (jusqu'à une minute)");
    const p = await api('POST', '/api/generate', { ...r, clientId: ui.clientId, scheduledAt: r.scheduledAt ? new Date(r.scheduledAt).toISOString() : '' });
    ui.filter = 'all';
    await refresh();
    actions.goto(p.id);
    toast('Post écrit : relis-le avant de valider');
  },
  async 'ai-rewrite'(id) {
    if (!ui.data.settings.hasOpenaiKey) throw new Error("Ajoute d'abord ta clé OpenAI dans l'onglet Réglages.");
    const post = ui.data.posts.find((p) => p.id === id);
    const r = await ask({
      title: "✨ Réécrire avec l'IA", submit: 'Réécrire',
      fields: [
        { name: 'moduleId', label: 'Module', options: moduleOptions(), value: preferredModuleId() },
        { name: 'feedback', label: 'Qu\'est-ce qu\'il faut changer ?', rows: 3, value: post.feedback || '', placeholder: 'Ex. hook plus fort, plus court, ton plus personnel' },
      ],
    });
    if (!r) return;
    store.set('moduleId', r.moduleId);
    toast("L'IA réécrit… (jusqu'à une minute)");
    await api('POST', `/api/posts/${id}/rewrite`, r);
    await refresh();
    actions.goto(id);
    toast('Post réécrit');
  },
  expand: (id) => { ui.expanded.add(id); render(); },
  edit: (id) => { ui.editing.add(id); render(); $(`[data-editor="${id}"] textarea`)?.focus(); },
  'cancel-edit': (id) => { ui.editing.delete(id); render(); },
  async save(id) {
    const ed = $(`[data-editor="${id}"]`);
    const val = (n) => ed.querySelector(`[name="${n}"]`).value;
    const local = val('scheduledAt');
    await api('PUT', `/api/posts/${id}`, {
      text: val('text'), format: val('format'), theme: val('theme'), altText: val('altText'), visualIdea: val('visualIdea'),
      scheduledAt: local ? new Date(local).toISOString() : '',
    });
    ui.editing.delete(id);
    toast('Post enregistré');
    await refresh();
  },
  async approve(id) { await api('POST', `/api/posts/${id}/status`, { status: 'approved' }); toast('Validé : il sera publié à la date prévue'); await refresh(); },
  async unapprove(id) { await api('POST', `/api/posts/${id}/status`, { status: 'review' }); await refresh(); },
  async reject(id) {
    const r = await ask({ title: 'Qu\'est-ce qui ne va pas ?', submit: 'Envoyer', fields: [{ name: 'feedback', label: 'Ton retour (il servira à réécrire le post)', rows: 4, placeholder: 'Ex. trop long, hook trop agressif, parler plutôt des conducteurs de travaux…' }] });
    if (!r) return;
    await api('POST', `/api/posts/${id}/status`, { status: 'rejected', feedback: r.feedback });
    await refresh();
  },
  async 'bulk-approve'() {
    const ids = clientPosts().filter((p) => p.status === 'review').map((p) => p.id);
    if (!confirm(`Valider ${ids.length} post(s) ? Ils seront publiés automatiquement à leur date.`)) return;
    const r = await api('POST', '/api/posts/bulk-approve', { ids });
    toast(`${r.approved} validé(s)${r.skipped.length ? ` · ${r.skipped.length} ignoré(s) (à compléter)` : ''}`);
    await refresh();
  },
  async 'publish-now'(id) {
    if (!confirm('Publier ce post sur LinkedIn maintenant ?')) return;
    const p = await api('POST', `/api/posts/${id}/publish-now`);
    toast(p.status === 'published' ? 'Publié sur LinkedIn ✅' : p.error, p.status !== 'published');
    await refresh();
  },
  async delete(id) {
    await api('DELETE', `/api/posts/${id}`);
    await refresh();
  },
  async 'remove-image'(id) { await api('DELETE', `/api/posts/${id}/image`); await refresh(); },
  async copy(id) { await navigator.clipboard.writeText(ui.data.posts.find((p) => p.id === id).text); toast('Texte copié'); },
  async 'new-post'() {
    const p = await api('POST', '/api/posts', { clientId: ui.clientId, text: '', format: 'Texte' });
    ui.editing.add(p.id);
    ui.filter = 'all';
    await refresh();
    document.getElementById(p.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },
  async import() {
    const r = await ask({ title: 'Importer des posts', submit: 'Importer', fields: [{ name: 'json', label: 'Colle le JSON fourni par Claude', rows: 12, placeholder: '{ "posts": [ { "scheduledAt": "...", "text": "..." } ] }' }] });
    if (!r) return;
    let parsed;
    try { parsed = JSON.parse(r.json); } catch { throw new Error('JSON invalide'); }
    const res = await api('POST', `/api/clients/${ui.clientId}/import`, parsed);
    toast(`${res.imported} post(s) importé(s)`);
    await refresh();
  },
  goto(id) {
    ui.view = 'posts'; ui.filter = 'all'; store.set('view', ui.view); render();
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.classList.add('flash');
    setTimeout(() => el?.classList.remove('flash'), 1500);
  },
  'cal-prev': () => { const { y, m } = ui.calMonth; ui.calMonth = m ? { y, m: m - 1 } : { y: y - 1, m: 11 }; render(); },
  'cal-next': () => { const { y, m } = ui.calMonth; ui.calMonth = m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }; render(); },
  async 'copy-veille'() { await navigator.clipboard.writeText(veillePrompt()); toast('Copié : colle-le dans ta conversation avec Claude'); },
  async 'del-veille'(id) { await api('DELETE', `/api/veille/${id}`); await refresh(); },
  async 'del-analysis'(id) { await api('DELETE', `/api/analyses/${id}`); await refresh(); },
  async disconnect() {
    if (!confirm('Déconnecter le LinkedIn de ce client ?')) return;
    await api('POST', `/api/clients/${ui.clientId}/disconnect`);
    await refresh();
  },
};

document.addEventListener('click', run(async (e) => {
  const tab = e.target.closest('#tabs button');
  if (tab) { ui.view = tab.dataset.view; store.set('view', ui.view); render(); return; }
  const chip = e.target.closest('[data-filter]');
  if (chip) { ui.filter = chip.dataset.filter; render(); return; }
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  if (btn.dataset.action === 'copy-link') { await navigator.clipboard.writeText(btn.dataset.link); toast('Lien copié'); return; }
  await actions[btn.dataset.action]?.(btn.dataset.id, btn);
}));

document.addEventListener('input', (e) => {
  if (e.target.id === 'clientSearch') { ui.search = e.target.value; filterClients(); return; }
  const ta = e.target.closest('[data-editor] textarea[name="text"]');
  if (!ta) return;
  const count = ta.parentElement.querySelector('.count');
  count.textContent = `${ta.value.length} / ${MAX_CHARS}`;
  count.classList.toggle('over', ta.value.length > MAX_CHARS);
});

document.addEventListener('change', run(async (e) => {
  if (e.target.matches('[data-action="toggle-working"]')) { ui.onlyWorking = e.target.checked; render(); return; }
  if (e.target.id === 'clientSelect') {
    if (e.target.value === '__new') {
      const r = await ask({ title: 'Nouveau client', submit: 'Créer', fields: [{ name: 'name', label: 'Nom' }, { name: 'company', label: 'Entreprise' }, { name: 'sector', label: 'Secteur' }] });
      if (r?.name) { const c = await api('POST', '/api/clients', r); ui.clientId = c.id; ui.view = 'client'; }
    } else {
      ui.clientId = e.target.value;
    }
    store.set('clientId', ui.clientId);
    ui.calMonth = null;
    await refresh();
    return;
  }
  const input = e.target.closest('input[data-action="upload"]');
  if (input?.files[0]) {
    const file = input.files[0];
    if (file.size > 4 * 1024 * 1024) throw new Error('Image trop lourde (4 Mo max)');
    const dataUrl = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    await api('POST', `/api/posts/${input.dataset.id}/image`, { dataUrl });
    toast('Image ajoutée');
    await refresh();
  }
}));

document.addEventListener('submit', run(async (e) => {
  const form = e.target;
  if (form.id === 'dialogForm') return;
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (form.id === 'loginForm') {
    store.set('password', data.password);
    await refresh();
    document.body.classList.remove('locked');
    return;
  }
  if (form.id === 'veilleForm') { await api('POST', '/api/veille', data); ui.niche = data.niche; toast('Ajouté à la veille'); }
  if (form.id === 'profileForm') { await api('POST', '/api/profiles', data); ui.niche = data.niche; toast('Analyse lancée : les posts arrivent dans 1 à 3 minutes'); pollProfiles(); }
  if (form.id === 'linkedinForm' || form.id === 'openaiForm' || form.id === 'apifyForm') { await api('PUT', '/api/settings', data); toast('Réglages enregistrés'); }
  if (form.id === 'modulesForm') {
    const modules = [...form.querySelectorAll('.module')].map((f) => ({
      id: f.dataset.id || undefined,
      name: f.querySelector('[name=name]').value,
      instructions: f.querySelector('[name=instructions]').value,
      knowledge: f.querySelector('[name=knowledge]').value,
      url: f.querySelector('[name=url]').value,
    }));
    await api('PUT', '/api/settings', { modules });
    toast('Modules enregistrés');
  }
  if (form.id === 'clientForm') { await api('PUT', `/api/clients/${ui.clientId}`, data); toast('Fiche enregistrée'); }
  await refresh();
}));

run(async () => { await refresh(); document.body.classList.remove('locked'); })();
