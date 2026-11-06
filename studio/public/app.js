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
  ({ create: renderCreate, posts: renderPosts, veille: renderVeille, study: renderStudy, settings: renderSettings }[ui.view] || renderCreate)();
  enhanceVoice(view);
}

// ================= CRÉER =================
function renderCreate() {
  const c = client();
  const content = moduleByRole('content');
  const hooker = moduleByRole('hooker');
  const nicheCount = ui.data.veille.filter((v) => sameNiche(v.niche, c.niche)).length;
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
      <label class="f">Consigne (facultatif) : ton, sujet, angle…
        <textarea id="instruction" rows="3" placeholder="Ex. ton plus personnel, parle de mes résultats clients, un post sur la régularité…">${esc(ui.instruction)}</textarea>
      </label>
      <div class="f">Qui écrit ?
        <div class="seg">
          <button type="button" class="${ui.engine === 'auto' ? 'on' : ''}" data-action="engine" data-id="auto">⚡ Automatique</button>
          <button type="button" class="${ui.engine === 'gpt' ? 'on' : ''}" data-action="engine" data-id="gpt">🤖 Mes GPTs (copier-coller)</button>
        </div>
      </div>
      <p class="small" style="margin:0">${ui.engine === 'auto'
        ? `1 clic. ${esc(content?.name || 'Mode content')} écrit, puis ${esc(hooker?.name || 'Mode hooker')} retravaille le hook. S'appuie sur ${nicheCount} post(s) de veille ${esc(c.niche || '')} et sur tes retours passés.${ui.data.settings.hasOpenaiKey ? '' : ' <b>Clé OpenAI requise (Réglages).</b>'}`
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
  const top = ui.data.veille.filter((v) => sameNiche(v.niche, c.niche)).sort((a, b) => engagement(b) - engagement(a)).slice(0, 8);
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
      <textarea readonly rows="5" id="briefText">${esc(brief)}</textarea>
      <div class="row">
        <button class="btn soft" data-action="copy-brief">📋 Copier</button>
        <a class="btn" href="${esc(m?.url || 'https://chatgpt.com/gpts')}" target="_blank" rel="noopener">↗ Ouvrir ${esc(m?.name || 'ChatGPT')}</a>
      </div>
      <textarea id="relayAnswer" rows="7" placeholder="Colle ici la réponse du GPT" data-novoice></textarea>
      <div class="row">
        <button class="btn primary" data-action="relay-next">${r.step === 1 ? 'Étape suivante' : 'Terminer'}</button>
        ${r.step === 2 ? '<button class="btn ghost" data-action="relay-skip">Passer cette étape</button>' : ''}
      </div>
    </div>`;
}

async function createAuto() {
  if (!ui.data.settings.hasOpenaiKey) throw new Error("Ajoute ta clé OpenAI dans Réglages, ou choisis « Mes GPTs ».");
  const total = ui.count;
  ui.lastCreated = [];
  ui.job = { kind: 'create', done: 0, total, step: 'Écriture…', stop: false };
  render();
  try {
    for (let i = 0; i < total && !ui.job.stop; i++) {
      ui.job.step = `Post ${i + 1} / ${total} : écriture puis hook…`;
      render();
      const p = await api('POST', '/api/generate', { clientId: ui.clientId, instruction: ui.instruction });
      ui.lastCreated.push(p.id);
      ui.job.done = i + 1;
      await refresh();
    }
    ui.job = { ...ui.job, finished: true, step: ui.job.stop ? 'Arrêté.' : `${ui.job.done} post(s) prêt(s), à valider ci-dessous.` };
  } catch (e) {
    ui.job = { ...ui.job, finished: true, step: `Arrêté : ${e.message}` };
    throw e;
  } finally { render(); }
}

async function saveRelayPosts(texts) {
  const r = await api('POST', `/api/clients/${ui.clientId}/import`, { posts: texts.map((text) => ({ text })) });
  ui.lastCreated = r.ids;
  ui.relay = null;
  await refresh();
  toast(`${r.imported} post(s) ajoutés, à valider`);
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
        <label class="btn sm">🖼 ${p.image ? 'Changer l\'image' : 'Ajouter une image'}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-upload="${p.id}" hidden></label>
        ${p.image ? `<button class="btn ghost sm" data-action="remove-image" data-id="${p.id}">Retirer l'image</button>` : ''}
      </div>
    </div>`;

  return `
  <article class="post" id="${p.id}">
    <div>
      ${editing ? editor : preview}
      ${fbOpen ? `<div class="inline-box" data-feedback="${p.id}">
        <textarea rows="3" placeholder="Qu'est-ce qui ne va pas ? Ex. hook trop long, trop formel, parle plus de mes résultats…"></textarea>
        <div class="row"><button class="btn primary sm" data-action="send-feedback" data-id="${p.id}">Refaire avec ce retour</button>
        <button class="btn ghost sm" data-action="close-feedback" data-id="${p.id}">Annuler</button></div>
      </div>` : ''}
    </div>
    <aside class="side">
      <div class="row between"><span class="badge s-${p.status}">${STATUS[p.status]}</span>${p.theme ? `<span class="tag">${esc(p.theme)}</span>` : ''}</div>
      ${locked ? `<div class="small">Publié ${fmtDate(p.publishedAt)}</div>`
        : `<label class="f">Publication<input type="datetime-local" data-date="${p.id}" value="${toLocalInput(p.scheduledAt)}"></label>`}
      ${hasPh ? '<div class="alert warn">Remplace les [À COMPLÉTER] avant de valider (✎ Modifier).</div>' : ''}
      ${p.error ? `<div class="alert err">${esc(p.error)}</div>` : ''}
      ${locked ? '' : `<div class="actions">
        ${p.status === 'approved'
          ? `<button class="btn sm" data-action="unapprove" data-id="${p.id}">↩ Retirer</button>`
          : `<button class="btn primary sm" data-action="approve" data-id="${p.id}" ${hasPh ? 'disabled' : ''}>✓ Valider</button>`}
        <button class="btn soft sm" data-action="open-feedback" data-id="${p.id}">💬 Retour</button>
        ${editing ? '' : `<button class="btn sm" data-action="edit" data-id="${p.id}">✎ Modifier</button>`}
        <button class="btn ghost sm danger" data-action="delete" data-id="${p.id}" title="Supprimer">🗑</button>
      </div>
      ${p.status === 'approved' ? `<button class="btn ghost sm" data-action="publish-now" data-id="${p.id}" style="align-self:flex-start">Publier maintenant</button>` : ''}`}
    </aside>
  </article>`;
}

// ================= VEILLE =================
function nicheChips() {
  const n = currentNiche();
  return `<div class="chips">${allNiches().map((x) => `<button class="chip ${sameNiche(x, n) ? 'on' : ''}" data-action="niche" data-id="${esc(x)}">${esc(x)}<b>${ui.data.veille.filter((v) => sameNiche(v.niche, x)).length}</b></button>`).join('')}</div>`;
}

function renderVeille() {
  const niche = currentNiche();
  const items = ui.data.veille.filter((v) => sameNiche(v.niche, niche)).sort((a, b) => engagement(b) - engagement(a));
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
          ${items.length >= 5 ? '<button class="btn soft sm" data-action="go" data-id="study">Voir l\'étude →</button>' : ''}</div>
        ${nicheChips()}
        <div style="margin-top:12px">
        ${items.length ? items.map((v) => `
          <div class="vitem">
            <div class="vhook">${esc(v.hook || v.text.split('\n')[0])}</div>
            <div class="vmeta"><b style="color:var(--text)">👍 ${nf(v.likes || 0)}</b><span>💬 ${nf(v.comments || 0)}</span>${v.reposts ? `<span>🔁 ${nf(v.reposts)}</span>` : ''}
              ${v.author ? `<span>· ${esc(v.author)}</span>` : ''}
              ${v.topic ? `<span class="tag">${esc(v.topic)}</span>` : ''}${v.hookType ? `<span class="tag">Hook : ${esc(v.hookType)}</span>` : ''}${v.format ? `<span class="tag">${esc(v.format)}</span>` : ''}
              <button class="btn ghost sm" data-action="del-veille" data-id="${v.id}" style="margin-left:auto" title="Supprimer">🗑</button></div>
            ${v.text && v.text !== v.hook ? `<details><summary class="small" style="cursor:pointer;margin-top:4px">Voir le texte</summary><div class="vtext">${esc(v.text)}</div></details>` : ''}
          </div>`).join('') : '<p class="empty">Rien pour l\'instant. Colle des posts à gauche.</p>'}
        </div>
      </div>
    </div>`;
}

// ================= ÉTUDE DE MARCHÉ =================
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

function hookTable(title, list) {
  return `<div class="card"><h3>${title}</h3><div style="overflow-x:auto"><table>
    <tr><th>Hook</th><th>Type</th><th>Auteur</th><th class="num">👍</th><th class="num">💬</th></tr>
    ${list.map((v) => `<tr><td>${esc((v.hook || v.text.split('\n')[0]).slice(0, 160))}</td><td>${esc(v.hookType || '')}</td><td>${esc(v.author || '')}</td><td class="num">${nf(v.likes || 0)}</td><td class="num">${nf(v.comments || 0)}</td></tr>`).join('')}
  </table></div></div>`;
}

function renderStudy() {
  const niche = currentNiche();
  const items = ui.data.veille.filter((v) => sameNiche(v.niche, niche));
  const study = ui.data.analyses.find((a) => sameNiche(a.niche, niche) && a.kind === 'study');
  const head = `<h2>Étude de marché${niche ? ` · ${esc(niche)}` : ''}</h2>
    <p class="sub">Ce qui marche chez les concurrents de la niche, d'après ta veille.</p>
    <div style="margin-bottom:16px">${nicheChips()}</div>`;
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
      <div class="kpi"><div class="n">${new Set(items.map((v) => v.author).filter(Boolean)).size}</div><div class="l">concurrents</div></div>
      <div class="kpi"><div class="n">${nf(items.reduce((s, v) => s + (Number(v.likes) || 0), 0) / items.length)}</div><div class="l">réactions en moyenne</div></div>
      <div class="kpi"><div class="n">${nf(items.reduce((s, v) => s + (Number(v.comments) || 0), 0) / items.length)}</div><div class="l">commentaires en moyenne</div></div>
      ${hookFreq ? `<div class="kpi"><div class="n" style="font-size:18px;padding:5px 0">${esc(hookFreq.label)}</div><div class="l">hook le plus fréquent (${hookFreq.count} posts)</div></div>` : ''}
    </div>
    <div class="card stack" style="margin-bottom:16px">
      <div class="row between"><h3 style="margin:0">🧠 Le feedback de l'étude</h3>
        <button class="btn ${study ? '' : 'primary'} sm" data-action="study">${study ? 'Mettre à jour' : 'Générer le feedback'}</button></div>
      ${study ? `<div class="small">Basé sur ${study.count || '?'} posts · ${fmtDate(study.createdAt)}</div><div class="feedback">${esc(study.content)}</div>`
        : '<p class="small" style="margin:0">L\'IA lit les chiffres ci-dessous et te dit ce qui marche, ce qui marche moins, les hooks qui reviennent et quoi faire dans tes posts.</p>'}
    </div>
    <p class="small" style="margin:0 0 10px">Engagement moyen par post = réactions + 2 × commentaires. <b style="color:var(--accent)">Vert foncé</b> = au-dessus de la moyenne de la niche (${nf(overall)}), vert clair = en dessous. Survole une barre pour le détail.</p>
    <div class="charts">
      ${barChart('Par sujet', groupBy(items, (v) => v.topic), overall)}
      ${barChart('Par type de hook', groupBy(items, (v) => v.hookType), overall)}
      ${barChart('Par format', groupBy(items, (v) => v.format), overall)}
      ${barChart('Par longueur', groupBy(items, lengthBucket), overall)}
    </div>
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
      <details><summary class="small" style="cursor:pointer">Instructions du GPT (facultatif, améliore le mode automatique)</summary>
        <textarea name="instructions" rows="6" style="margin-top:8px">${esc(m.instructions || '')}</textarea></details>
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
        ${c.linkedin.connected ? '<button class="btn ghost" data-action="move-linkedin">Déplacer vers un autre client</button><button class="btn ghost danger" data-action="disconnect">Déconnecter</button>' : ''}
      </div>
      ${ui.data.linkedinConfigured ? '' : '<div class="alert warn">Renseigne d\'abord l\'app LinkedIn plus bas.</div>'}
    </div>
    <form class="card stack" id="clientForm">
      <h3 style="margin:0">Fiche de ${esc(c.name)}</h3>
      <p class="small" style="margin:0">C'est le brief de chaque post. Plus c'est précis, plus ça sonne comme ${esc(c.name)}.</p>
      <div class="grid2">${field('name', 'Nom')}${field('company', 'Entreprise')}</div>
      ${field('niche', 'Niche (choisit la veille utilisée)', 0, 'list="nicheList2" data-novoice')}<datalist id="nicheList2">${allNiches().map((n) => `<option value="${esc(n)}">`).join('')}</datalist>
      ${field('offer', 'Offre', 2)}
      ${field('audience', 'Cible', 2)}
      ${field('tone', 'Ton et style', 3)}
      ${field('themes', 'Sujets de prédilection', 3)}
      <div class="grid2">${field('dos', 'À faire', 3)}${field('donts', 'À éviter', 3)}</div>
      ${(c.feedbackLog || []).length ? `<details><summary class="small" style="cursor:pointer">${c.feedbackLog.length} retour(s) mémorisé(s)</summary><ul class="small">${c.feedbackLog.slice().reverse().map((f) => `<li>${esc(f.text)}</li>`).join('')}</ul></details>` : ''}
      <button class="btn primary" type="submit" style="align-self:flex-end">Enregistrer</button>
    </form>` : '<div class="card empty">Crée un client avec le menu « Client » en haut.</div>'}
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

function chunkText(text, size = 12_000) {
  const chunks = [];
  let cur = '';
  for (const b of text.split(/\n{2,}/)) {
    if ((cur + b).length > size && cur) { chunks.push(cur); cur = ''; }
    cur += `${b}\n\n`;
  }
  if (cur.trim()) chunks.push(cur);
  return chunks;
}

const actions = {
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

  niche(n) { ui.niche = n; render(); },
  async paste() {
    const text = $('#pasteText').value;
    const niche = $('#pasteNiche').value.trim();
    if (text.trim().length < 40) throw new Error('Colle au moins un post complet.');
    if (!niche) throw new Error('Indique la niche (ex. Ghostwriting).');
    if (!ui.data.settings.hasOpenaiKey) throw new Error("L'analyse utilise ta clé OpenAI : ajoute-la dans Réglages.");
    const chunks = chunkText(text);
    let added = 0;
    let found = 0;
    ui.niche = niche;
    ui.job = { kind: 'paste', total: chunks.length, done: 0, step: 'Analyse…' };
    try {
      for (const [i, chunk] of chunks.entries()) {
        ui.job.step = `Analyse ${i + 1} / ${chunks.length}…`;
        render();
        const r = await api('POST', '/api/veille/paste', { text: chunk, niche });
        added += r.added; found += r.found; ui.job.done = i + 1;
      }
    } finally { ui.job = null; }
    await refresh();
    toast(`${found} post(s) trouvés, ${added} ajoutés à la veille ${niche}`);
  },
  async 'del-veille'(id) { await api('DELETE', `/api/veille/${id}`); await refresh(); },
  async study(_id, btn) {
    btn.disabled = true;
    btn.textContent = 'Analyse en cours…';
    try { await api('POST', '/api/study', { niche: currentNiche() }); } finally { await refresh(); }
    toast('Feedback de l\'étude prêt');
  },

  async copy(text) { await navigator.clipboard.writeText(text); toast('Copié'); },
  async 'test-openai'() { const r = await api('POST', '/api/settings/test-openai'); toast(`Clé OK ✅ (${r.model})`); },
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
  if (t.dataset.date) {
    if (!t.value) return;
    await api('PUT', `/api/posts/${t.dataset.date}`, { scheduledAt: new Date(t.value).toISOString() });
    await refresh();
    toast('Date modifiée');
    return;
  }
  if (t.dataset.upload && t.files[0]) {
    const file = t.files[0];
    if (file.size > 4 * 1024 * 1024) throw new Error('Image trop lourde (4 Mo max)');
    const dataUrl = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
    await api('POST', `/api/posts/${t.dataset.upload}/image`, { dataUrl });
    await refresh();
  }
}));

document.addEventListener('submit', run(async (e) => {
  const form = e.target;
  if (form.id === 'dialogForm') return;
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (form.id === 'loginForm') { store.set('password', data.password); await refresh(); return; }
  if (form.id === 'clientForm') { await api('PUT', `/api/clients/${ui.clientId}`, data); ui.niche = undefined; toast('Fiche enregistrée'); }
  if (form.id === 'openaiForm' || form.id === 'linkedinForm') { await api('PUT', '/api/settings', data); toast('Enregistré'); }
  if (form.id === 'gptForm') {
    const roles = [...form.querySelectorAll('fieldset[data-role]')].map((f) => ({
      id: f.dataset.id || undefined,
      role: f.dataset.role,
      name: f.querySelector('[name=name]').value || (f.dataset.role === 'hooker' ? 'Mode hooker' : 'Mode content'),
      url: f.querySelector('[name=url]').value,
      instructions: f.querySelector('[name=instructions]').value,
    }));
    const others = modules().filter((m) => !roles.some((r) => r.id === m.id));
    await api('PUT', '/api/settings', { modules: [...roles, ...others] });
    toast('GPTs enregistrés');
  }
  await refresh();
}));

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
