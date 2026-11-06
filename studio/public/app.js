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
        <button class="btn" data-action="import">Importer (JSON)</button>
        <button class="btn" data-action="ai-write">✨ Écrire avec l'IA</button>
        <button class="btn primary" data-action="new-post">+ Nouveau post</button>
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
        <button class="btn small" data-action="ai-rewrite" data-id="${p.id}">✨ Réécrire avec l'IA</button>
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
function renderVeille() {
  const items = ui.data.veille.filter((v) => v.clientId === ui.clientId);
  const analyses = ui.data.analyses.filter((a) => a.clientId === ui.clientId);
  view.innerHTML = `
    <h2>Veille</h2>
    <p class="sub">Colle ici les posts LinkedIn qui performent dans la niche. Ensuite « Copier pour Claude » : colle le résultat dans ta conversation avec Claude, il en tirera les patterns et les posts du mois suivant.</p>
    <div class="two-col">
      <div>
        <form class="panel stack" id="veilleForm">
          <h3>Ajouter un post repéré</h3>
          <input name="author" placeholder="Auteur (ex. Marie Dupont, DG d'une PME BTP)">
          <input name="url" placeholder="Lien du post (facultatif)">
          <div class="grid2"><input name="likes" placeholder="Réactions" inputmode="numeric"><input name="comments" placeholder="Commentaires" inputmode="numeric"></div>
          <textarea name="text" rows="8" placeholder="Texte complet du post" required></textarea>
          <input name="notes" placeholder="Pourquoi il marche selon toi ? (facultatif)">
          <button class="btn primary" type="submit">Ajouter à la veille</button>
        </form>
        <form class="panel stack" id="analysisForm">
          <h3>Enregistrer une analyse de Claude</h3>
          <textarea name="content" rows="6" placeholder="Colle ici l'analyse (hooks, structures, formats gagnants…)"></textarea>
          <button class="btn" type="submit">Enregistrer l'analyse</button>
        </form>
      </div>
      <div>
        <div class="panel">
          <div class="toolbar" style="margin-bottom:8px"><h3 style="margin:0">${items.length} post(s) en veille</h3>
            ${items.length ? '<button class="btn primary small" data-action="copy-veille">Copier pour Claude</button>' : ''}</div>
          ${items.length ? items.map((v) => `
            <div class="item">
              <div class="top"><span><b style="color:var(--text)">${esc(v.author || 'Auteur inconnu')}</b> · 👍 ${esc(v.likes || '?')} · 💬 ${esc(v.comments || '?')} ${v.url ? `· <a href="${esc(v.url)}" target="_blank" rel="noopener">voir</a>` : ''}</span>
              <button class="btn small ghost" data-action="del-veille" data-id="${v.id}">Supprimer</button></div>
              <div class="txt">${esc(v.text)}</div>
              ${v.notes ? `<div class="top" style="margin-top:6px">📝 ${esc(v.notes)}</div>` : ''}
            </div>`).join('') : '<p class="empty">Aucun post pour l\'instant. Vise 10 à 20 posts récents avec beaucoup d\'engagement.</p>'}
        </div>
        ${analyses.length ? `<div class="panel"><h3>Analyses</h3>${analyses.map((a) => `
          <div class="item"><div class="top"><span>${fmtDate(a.createdAt)}</span><button class="btn small ghost" data-action="del-analysis" data-id="${a.id}">Supprimer</button></div>
          <div class="txt">${esc(a.content)}</div></div>`).join('')}</div>` : ''}
      </div>
    </div>`;
}

function veillePrompt() {
  const c = client();
  const items = ui.data.veille.filter((v) => v.clientId === ui.clientId);
  return `Voici ma veille LinkedIn pour mon client ${c.name}${c.company ? ` (${c.company})` : ''}, secteur : ${c.sector}.
Cible : ${c.audience}
Ton : ${c.tone}

1. Analyse ces ${items.length} posts : hooks, structures, longueurs, formats et CTA qui fonctionnent.
2. Rédige ensuite les posts du mois prochain dans la voix du client, au format JSON importable dans Link Motion Studio :
{ "posts": [ { "scheduledAt": "AAAA-MM-JJTHH:MM:00+01:00", "theme": "", "format": "", "visualIdea": "", "text": "" } ] }

${items.map((v, i) => `--- Post ${i + 1} — ${v.author || 'auteur inconnu'} (👍 ${v.likes || '?'} · 💬 ${v.comments || '?'})${v.notes ? `\nMa note : ${v.notes}` : ''}\n${v.text}`).join('\n\n')}`;
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
        return `<article class="client-card ${c.id === ui.clientId ? 'current' : ''}" data-search="${esc(`${c.name} ${c.company} ${c.sector}`.toLowerCase())}">
          <div class="cc-head"><div class="li-avatar">${initials(c.name)}</div>
            <div><div class="cc-name">${esc(c.name || 'Sans nom')}</div><div class="cc-sub">${esc(c.company || '')}${c.sector ? ` · ${esc(c.sector)}` : ''}</div></div></div>
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
        <label class="f">Modèle<input name="openaiModel" value="${esc(st.openaiModel)}" placeholder="gpt-5 (par défaut)"></label>
        <button class="btn primary" type="submit" style="align-self:flex-end">Enregistrer</button>
      </form>
    </div>

    <form class="panel stack" id="modulesForm" style="margin-top:16px">
      <div class="toolbar" style="margin:0"><h3 style="margin:0">3. Modules d'écriture</h3><button type="button" class="btn small" data-action="add-module">+ Ajouter un module</button></div>
      <p class="sub" style="margin:0">Colle ici ce que tu récupères de tes GPTs : ChatGPT → Mes GPTs → ton module → Modifier → Configurer. Copie le champ « Instructions », et le contenu de tes fichiers de « Connaissances ».</p>
      <div id="modules">${(st.modules.length ? st.modules : []).map(moduleFields).join('') || '<p class="empty" style="padding:16px 0">Aucun module pour l\'instant.</p>'}</div>
      <button class="btn primary" type="submit" style="align-self:flex-end">Enregistrer les modules</button>
    </form>`;
}

const moduleFields = (m = {}) => `
  <fieldset class="module" data-id="${esc(m.id || '')}">
    <div class="grid2" style="grid-template-columns:1fr auto;align-items:end">
      <label class="f">Nom du module<input name="name" value="${esc(m.name || '')}" placeholder="Ex. Hooks LinkedIn"></label>
      <button type="button" class="btn small ghost" data-action="remove-module">Supprimer</button>
    </div>
    <label class="f">Instructions<textarea name="instructions" rows="8">${esc(m.instructions || '')}</textarea></label>
    <label class="f">Connaissances (contenu des fichiers)<textarea name="knowledge" rows="6">${esc(m.knowledge || '')}</textarea></label>
  </fieldset>`;

const moduleOptions = () => [{ value: '', label: 'Sans module (brief client seulement)' }, ...ui.data.settings.modules.map((m) => ({ value: m.id, label: m.name }))];

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
             <button class="btn danger small" data-action="disconnect" style="align-self:flex-start">Déconnecter</button>`
          : `<div><span class="badge s-draft">Non connecté</span></div>`}
        <div>Lien d'invitation à envoyer au client :</div>
        <div class="code">${esc(link)}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn primary small" data-action="copy-link" data-link="${esc(link)}">Copier le lien</button>
          <a class="btn small" href="${esc(link)}" target="_blank" rel="noopener">C'est mon compte : me connecter maintenant</a>
        </div>
        <p style="color:var(--text-dim);font-size:13px;margin:0">Le client ouvre le lien, clique « Autoriser avec LinkedIn » et c'est fini : aucun mot de passe partagé, et il peut révoquer l'accès quand il veut.</p>
        ${ui.data.linkedinConfigured ? '' : `<div class="alert ph">L'app LinkedIn n'est pas encore branchée : va dans l'onglet <b>Réglages</b> d'abord.</div>`}
      </div>
      <form class="panel stack" id="clientForm">
        <h3>Fiche voix du client</h3>
        <div class="grid2">${field('name', 'Nom (auteur des posts)')}${field('company', 'Entreprise')}</div>
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
    if (f.rows) return `<textarea name="${f.name}" rows="${f.rows}" placeholder="${esc(f.placeholder || '')}">${esc(f.value || '')}</textarea>`;
    return `<input name="${f.name}" type="${f.type || 'text'}" value="${esc(f.value || '')}" placeholder="${esc(f.placeholder || '')}">`;
  };
  form.innerHTML = `<h3>${title}</h3>${intro ? `<p class="sub" style="margin:0 0 12px">${intro}</p>` : ''}<div class="stack">${fields.map((f) => `<label class="f">${f.label}${control(f)}</label>`).join('')}</div>
    <div class="actions"><button class="btn ghost" value="cancel">Annuler</button><button class="btn primary" value="ok">${submit}</button></div>`;
  dlg.showModal();
  return new Promise((resolve) => {
    dlg.addEventListener('close', () => {
      resolve(dlg.returnValue === 'ok' ? Object.fromEntries(new FormData(form)) : null);
    }, { once: true });
  });
}

// ---------- actions ----------
const run = (fn) => async (...args) => {
  try { await fn(...args); } catch (e) {
    if (e instanceof AuthError) showLogin(store.get('password', '') ? e.message : '');
    else toast(e.message, true);
  }
};

const actions = {
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
        { name: 'moduleId', label: 'Module', options: moduleOptions(), value: store.get('moduleId', '') },
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
        { name: 'moduleId', label: 'Module', options: moduleOptions(), value: store.get('moduleId', '') },
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
    if (!confirm('Supprimer ce post ?')) return;
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
  if (form.id === 'veilleForm') { await api('POST', '/api/veille', { ...data, clientId: ui.clientId }); toast('Ajouté à la veille'); }
  if (form.id === 'analysisForm') { await api('POST', '/api/analyses', { ...data, clientId: ui.clientId }); toast('Analyse enregistrée'); }
  if (form.id === 'linkedinForm' || form.id === 'openaiForm') { await api('PUT', '/api/settings', data); toast('Réglages enregistrés'); }
  if (form.id === 'modulesForm') {
    const modules = [...form.querySelectorAll('.module')].map((f) => ({
      id: f.dataset.id || undefined,
      name: f.querySelector('[name=name]').value,
      instructions: f.querySelector('[name=instructions]').value,
      knowledge: f.querySelector('[name=knowledge]').value,
    }));
    await api('PUT', '/api/settings', { modules });
    toast('Modules enregistrés');
  }
  if (form.id === 'clientForm') { await api('PUT', `/api/clients/${ui.clientId}`, data); toast('Fiche enregistrée'); }
  await refresh();
}));

run(async () => { await refresh(); document.body.classList.remove('locked'); })();
