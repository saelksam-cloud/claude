// Link Motion Studio — interface (vanilla JS, aucun build).
import * as Banner from '/banner.js';
import * as Vis from '/visuals.js';
import { calendarMarkup, calendarDate } from '/calendar.js';
const $ = (sel, el = document) => el.querySelector(sel);
const view = $('#view');

const PAGE_NAMES = {"create":"Studio","posts":"Posts","calendar":"Calendrier","visuals":"Visuels","adn":"ADN client","banner":"Profil et bannière","images":"Photothèque","veille":"Veille","study":"Étude de marché","hooks":"Hooks","settings":"Réglages"};
const ICONS = {"pen":"<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m13 6 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z\"/></svg>","files":"<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"6\" y=\"3\" width=\"13\" height=\"17\" rx=\"2\"/><path d=\"M9 8h7m-7 4h7m-7 4h4M3 7v12a4 4 0 0 0 4 4\"/></svg>","calendar":"<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M7 3v4m10-4v4M3 10h18m-14 4h2m3 0h2m3 0h1m-11 3h2m3 0h2\"/></svg>","image":"<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"3\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><path d=\"m3 17 5-5 4 4 4-6 5 7\"/></svg>","person":"<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1\"/></svg>","layout":"<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M3 9h18m-12 0v11\"/></svg>","photos":"<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"7\" y=\"3\" width=\"14\" height=\"14\" rx=\"2\"/><path d=\"M3 8v11a2 2 0 0 0 2 2h11m-9-7 4-4 3 3 3-5 4 5\"/></svg>","radar":"<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7a5 5 0 1 0 5 5m-5 0 7-7\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/></svg>","chart":"<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 4v16h16M8 16v-4m5 4V8m5 8V5\"/></svg>","hook":"<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M13 7v10a4 4 0 0 1-8 0v-3l3 2m5-9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z\"/></svg>","settings":"<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"m9 3-1 3-3 1-2 4 2 2v4l3 2 3-1 3 2 4-2v-3l3-3-2-4-3-1-1-3Z\"/></svg>","menu":"<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 6h16M4 12h16M4 18h16\"/></svg>","activity":"<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12h4l3-7 4 14 3-7h4\"/></svg>","search":"<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"10\" cy=\"10\" r=\"6\"/><path d=\"m14.5 14.5 5 5\"/></svg>","arrow":"<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 12h15m-6-6 6 6-6 6\"/></svg>","spark":"<svg aria-hidden=\"true\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 2c0 6 4 10 10 10-6 0-10 4-10 10 0-6-4-10-10-10 6 0 10-4 10-10Z\"/></svg>"};
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
  detailId: null,
  studioPost: null,
  draftText: {},
  manual: {},
  advanced: false,
  tools: 'hooks',
  calCursor: new Date(),
  calMode: 'month',
  pendingJob: store.get('studio.pendingJob', null),
  recentJob: store.get('studio.recentJob', null),
  count: store.get('count', 1),
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
  bannerTab: store.get('bannerTab', 'banner'),
  banner: null,
  bannerVariants: [],
  bannerOverlay: true,
  vis: store.get('vis', { kind: 'image', count: 3, format: 'portrait', preset: 'clair', accent: '' }),
  visTopic: '',
  visSlide: {},
  visEdit: {},
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
  for (const el of document.querySelectorAll('dialog[open]')) el.close();
  view.innerHTML = `
    <form class="card stack login" id="loginForm">
      <h2>Link Motion Studio</h2>
      <p class="sub" style="margin:0">Entre ton mot de passe.</p>
      <input type="password" aria-label="Mot de passe" name="password" placeholder="Mot de passe" autocomplete="current-password" required autofocus>
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
  $('#location').textContent = PAGE_NAMES[ui.view] || PAGE_NAMES.create;
  document.querySelectorAll('[data-view]').forEach((button) => {
    const active = button.dataset.view === ui.view;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  const reviewCount = clientPosts().filter((p) => ['review', 'draft', 'rejected'].includes(p.status)).length;
  document.querySelectorAll('[data-review-count]').forEach((badge) => {
    badge.hidden = !reviewCount;
    badge.textContent = reviewCount;
  });
  renderActivity();
  const c = client();
  $('#banner').innerHTML = c && !c.linkedin.connected && ['create', 'posts'].includes(ui.view)
    ? `<div class="banner">Le LinkedIn de ${esc(c.name)} n'est pas connecté : les posts seront prêts mais pas publiés. <a href="#" data-action="go" data-id="settings">Le connecter</a></div>` : '';
  ({ create: renderCreate, posts: renderPosts, calendar: renderCalendar, adn: renderAdn, hooks: renderHooks, banner: renderBannerView, visuals: renderVisualsView, images: renderImages, veille: renderVeille, study: renderStudy, settings: renderSettings }[ui.view] || renderCreate)();
  enhanceVoice(view);
  renderDrawer();
}

// ================= CRÉER =================
function renderCreate() {
  const c = client();
  const content = moduleByRole('content');
  const hooker = moduleByRole('hooker');
  const nicheCount = ui.data.veille.filter((v) => sameNiche(v.niche, c.niche)).length;
  const competitors = authorsOf(c.niche);
  if (ui.inspireFrom && !competitors.some(([a]) => sameNiche(a, ui.inspireFrom))) ui.inspireFrom = '';
  const drafts = clientPosts().filter((p) => ['review', 'draft', 'rejected'].includes(p.status));
  const created = [...new Set([...ui.lastCreated, ...drafts.slice(0, 12).map((p) => p.id)])]
    .map((id) => drafts.find((p) => p.id === id)).filter(Boolean);
  const active = created.find((p) => p.id === ui.studioPost);
  const manual = ui.manual[c.id] || '';
  const busy = Boolean(ui.job && !ui.job.finished);
  const pending = ui.pendingJob;
  const j = ui.job?.kind === 'create' ? ui.job : null;

  view.innerHTML = `
  <div class="studio">
    <header class="page-heading">
      <div><div class="eyebrow">ESPACE DE CRÉATION</div><h1>Studio de création</h1><p>Du brief au post prêt à publier.</p></div>
      <div class="row heading-actions"><button class="btn" data-action="go" data-id="visuals">${ICONS.image} Créer un visuel</button><button class="btn" data-action="go" data-id="posts">Voir les posts ${ICONS.arrow}</button></div>
    </header>
    <div class="studio-grid">
      <section class="work-panel brief-panel">
        <header class="panel-heading"><span class="step-number">01</span><div><h2>Brief</h2><p>Pose le cadre de ton post</p></div></header>
        <div class="panel-body stack">
          <div class="client-card"><span class="client-avatar">${esc(initials(c.name))}</span><div><strong>${esc(c.name)}</strong><span>${esc(c.niche || c.company || 'Espace client')}</span></div><button class="btn icon-btn ghost" data-action="go" data-id="adn" title="Ouvrir l’ADN client" aria-label="Ouvrir l’ADN client">${ICONS.arrow}</button></div>
                <label class="f">Sujet ou idée de départ
        <textarea id="instruction" rows="5" placeholder="Ex. le coût caché de la double saisie, ou quelques bullet points, ou « ton plus personnel »…">${esc(ui.instruction)}</textarea>
      </label>

                <div class="f">Nombre de posts
        <div class="seg">${COUNTS.map((n) => `<button type="button" class="${ui.count === n ? 'on' : ''}" data-action="count" data-id="${n}">${n}</button>`).join('')}</div>
      </div>

          <details class="brief-options" ${ui.advanced ? 'open' : ''}><summary>Options du brief</summary><div class="stack">
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

          </div></details>
                <div class="f">Mode de rédaction
        <div class="seg">
          <button type="button" class="${ui.engine === 'auto' ? 'on' : ''}" data-action="engine" data-id="auto">Automatique</button>
          <button type="button" class="${ui.engine === 'gpt' ? 'on' : ''}" data-action="engine" data-id="gpt">Mes GPTs</button>
        </div>
      </div>
      <p class="small" style="margin:0">${ui.engine === 'auto'
        ? `1 clic. ${esc(content?.name || 'Mode content')} écrit, puis ${esc(hooker?.name || 'Mode hooker')} retravaille le hook. S'appuie sur ${ui.inspireFrom ? `les meilleurs posts de <b>${esc(ui.inspireFrom)}</b>` : `les meilleurs posts de chaque concurrent (${nicheCount} en veille ${esc(c.niche || '')})`}, l'étude de marché et tes retours passés.${ui.data.settings.hasOpenaiKey ? '' : ' <b>Clé OpenAI requise (Réglages).</b>'}`
        : `Tes vrais GPTs ChatGPT : l'app prépare le texte, tu le colles dans ${esc(content?.name || 'Mode content')}, puis dans ${esc(hooker?.name || 'Mode hooker')}.`}</p>

          ${j ? `<div class="job-inline small"><div class="progress"><span style="width:${Math.round((100 * j.done) / j.total)}%"></span></div><span>${esc(j.step)}</span></div>` : ''}
          ${ui.relay ? '' : `<button class="btn primary" data-action="create" ${busy || (pending && ui.engine === 'auto') ? 'disabled' : ''}>${ICONS.spark} ${ui.engine === 'gpt' ? 'Préparer le brief GPT' : `Créer ${ui.count} post${ui.count > 1 ? 's' : ''}`}</button>`}
          ${pending && !busy ? '<button class="btn" data-action="jobs">Voir la génération interrompue</button>' : ''}
        </div>
      </section>
      <section class="work-panel writing-panel">
        <header class="panel-heading"><span class="step-number">02</span><div><h2>Rédaction</h2><p>Écris ou reprends un brouillon</p></div></header>
        <div class="panel-body stack">
          ${ui.relay ? renderRelay() : `
          ${created.length ? `<label class="f draft-select">Brouillon<select id="studioDraft"><option value="">Nouveau brouillon</option>${created.map((p) => `<option value="${esc(p.id)}" ${p === active ? 'selected' : ''}>${esc(p.theme || p.text.split('\n')[0].slice(0, 68))}</option>`).join('')}</select></label>` : ''}
          ${active ? `<div class="row between"><span class="badge s-${active.status}">${STATUS[active.status]}</span><button class="btn ghost sm" data-action="post-detail" data-id="${active.id}">Aperçu et publication →</button></div>
            ${postEditor(active)}
            ${active.plan ? strategyPanel(active) : ''}
            ${PLACEHOLDER.test(active.text) ? '<div class="alert warn">Complète les passages signalés avant de valider.</div>' : ''}`
            : `<div class="editor-empty"><span class="editor-icon">${ICONS.pen}</span><div><strong>À toi d’écrire</strong><p>Pars du brief à gauche ou rédige directement ici.</p></div></div>
              <label class="f writing-field"><span class="sr-only">Texte du nouveau brouillon</span><textarea id="manualDraft" rows="11" maxlength="3000" placeholder="Écris ton post ici…">${esc(manual)}</textarea></label>
              <div class="row between"><span class="small" id="manualCount">${manual.length} / 3 000</span><button class="btn" id="manualSave" data-action="manual-save" ${manual.trim() ? '' : 'disabled'}>Enregistrer le brouillon</button></div>`}
          `}
        </div>
      </section>
      <aside class="work-panel tools-panel">
        <header class="panel-heading"><span class="step-number">03</span><div><h2>Contrôle éditorial</h2><p>Affine avant de valider</p></div></header>
        <div class="panel-body stack">
          ${[['hooks','Hooks','Compare les accroches et leurs notes.','hook'],['quality','Qualité','Repère les points à retravailler.','search'],['retouch','Retouches','Ajuste le rythme, le ton ou la longueur.','spark']].map(([key, label, hint, glyph]) => `
            <button class="tool-option ${active && ui.tools === key ? 'selected' : ''}" data-action="studio-tool" data-id="${key}" ${active ? 'aria-pressed="' + (ui.tools === key) + '"' : 'disabled'}><span class="tool-icon">${ICONS[glyph]}</span><span><strong>${label}</strong><small>${hint}</small></span><span aria-hidden="true">›</span></button>`).join('')}
          ${active ? (ui.tools ? { hooks: hooksPanel, quality: qualityPanel, retouch: retouchPanel }[ui.tools](active) : '<div class="tool-note">Choisis un outil pour travailler sur le brouillon enregistré.</div>')
            : '<div class="tool-note">Les outils s’activent dès que tu ouvres un brouillon enregistré.</div>'}
        </div>
      </aside>
    </div>
  </div>`;
  $('.brief-options').addEventListener('toggle', (event) => { ui.advanced = event.currentTarget.open; });
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
function checkpoint(job) {
  ui.pendingJob = job;
  store.set('studio.pendingJob', job);
}

async function createAuto(resume) {
  if (!ui.data.settings.hasOpenaiKey) throw new Error("Ajoute ta clé OpenAI dans Réglages, ou choisis « Mes GPTs ».");
  if (ui.job && !ui.job.finished) throw new Error('Un traitement est déjà en cours.');
  const job = resume || {
    id: String(Date.now()),
    clientId: ui.clientId,
    total: ui.count,
    done: 0,
    ids: [],
    plan: null,
    postId: '',
    hooksDone: false,
    inFlight: '',
    avoid: { angles: [], structures: [] },
    brief: { personaId: ui.personaId, objective: ui.objective, awareness: ui.awareness, topic: ui.instruction, ideaId: ui.ideaId },
    author: ui.inspireFrom,
    imageMode: ui.imageMode,
  };
  if (navigator.locks) {
    return navigator.locks.request('link-motion-create', { ifAvailable: true }, async (lock) => {
      if (!lock) throw new Error('La génération tourne déjà dans un autre onglet.');
      const current = store.get('studio.pendingJob', null);
      if ((!resume && current) || (resume && current?.id !== resume.id)) {
        ui.pendingJob = current;
        render();
        throw new Error('La file d’activité a changé. Rouvre Activité IA.');
      }
      await runCreate(job);
    });
  }
  await runCreate(job);
}

async function runCreate(job) {
  const { clientId, total, brief, author, imageMode } = job;
  checkpoint(job);
  ui.job = { kind: 'create', done: job.done, total, step: 'Préparation…', stop: false };
  render();
  const step = (message) => {
    ui.job.step = 'Post ' + (job.done + 1) + ' / ' + total + ' · ' + message;
    const inline = $('.job-inline');
    if (inline) {
      inline.lastElementChild.textContent = ui.job.step;
      inline.querySelector('.progress span').style.width = (100 * job.done / total) + '%';
    }
    renderActivity();
  };
  let outcome;
  try {
    while (job.done < total && !ui.job.stop) {
      if (!job.plan) {
        step('Plan éditorial…');
        job.plan = await api('POST', '/api/plan', { ...brief, clientId, ideaId: job.done === 0 ? brief.ideaId : '', avoid: job.avoid });
        job.avoid.angles.push(job.plan.angle?.type);
        job.avoid.structures.push(job.plan.structureId);
        checkpoint(job);
      }
      if (ui.job.stop) break;
      if (!job.postId) {
        step('Rédaction…');
        job.beforeWrite = ui.data.posts.filter((p) => p.clientId === clientId).map((p) => p.id).concat(job.ids);
        job.inFlight = 'write';
        checkpoint(job);
        const post = await api('POST', '/api/write', { clientId, plan: job.plan, author });
        job.postId = post.id;
        job.ids.push(post.id);
        job.inFlight = '';
        checkpoint(job);
      }
      if (ui.job.stop) break;
      if (!job.hooksDone) {
        step('Notation des hooks…');
        await api('POST', '/api/posts/' + job.postId + '/hooks', {}).catch((error) => toast('Hooks · ' + error.message, true));
        job.hooksDone = true;
        checkpoint(job);
      }
      if (ui.job.stop) break;
      if (imageMode !== 'none') {
        step('Préparation de l’image…');
        await addImage(job.postId, imageMode).catch((error) => toast('Image · ' + error.message, true));
      }
      job.done++;
      job.plan = null;
      job.postId = '';
      job.hooksDone = false;
      ui.job.done = job.done;
      checkpoint(job);
    }
    if (job.done === total) {
      checkpoint(null);
      if (ui.clientId === clientId) ui.ideaId = '';
      outcome = job.done + ' brouillon(s) à relire.';
    } else {
      outcome = 'Génération en pause.';
    }
  } catch (e) {
    outcome = 'Génération interrompue. ' + e.message;
    throw e;
  } finally {
    if (ui.clientId === clientId && job.ids.length) {
      ui.lastCreated = job.ids;
      ui.studioPost = job.ids[0];
    }
    ui.recentJob = { kind: 'create', step: outcome };
    store.set('studio.recentJob', ui.recentJob);
    ui.job = null;
    await refresh().catch(() => render());
    if (job.done === total) toast(outcome);
  }
}

async function saveRelayPosts(texts) {
  const r = await api('POST', `/api/clients/${ui.clientId}/import`, { posts: texts.map((text) => ({ text })) });
  ui.lastCreated = r.ids;
  ui.studioPost = r.ids[0] || null;
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
      <div class="page-heading"><div><div class="eyebrow">SUIVI ÉDITORIAL</div><h1>Posts</h1><p>Relis, ajuste et valide les posts de ton client.</p></div></div>
      ${by('review').length ? `<button class="btn primary" data-action="approve-all">✓ Tout valider (${by('review').length})</button>` : ''}
    </div>
    ${ui.filter === 'approved' ? `<div class="alert ok" style="margin-bottom:12px">Les posts programmés restent dans l'app et sont publiés sur LinkedIn à l'heure prévue (vérification toutes les 15 minutes). C'est normal qu'ils n'apparaissent pas dans les « posts programmés » de LinkedIn : ils y arrivent directement, publiés, au bon moment.</div>` : ''}
    <div class="chips" style="margin-bottom:16px">${tabs.map(([k, l]) => `<button class="chip ${ui.filter === k ? 'on' : ''}" data-action="filter" data-id="${k}">${l}<b>${k === 'all' ? posts.length : by(k).length}</b></button>`).join('')}</div>
    ${shown.length ? shown.map((post) => postCard(post)).join('') : '<div class="card empty">Aucun post ici. <a href="#" data-action="go" data-id="create">Créer des posts</a></div>'}`;
}

function postEditor(p) {
  const text = ui.draftText[p.id] ?? p.text;
  return `
    <div class="stack" data-editor="${p.id}">
      <textarea name="text" aria-label="Texte du post" rows="14">${esc(text)}</textarea>
      <div class="count">${text.length} / ${MAX_CHARS}</div>
      <div class="row">
        <button class="btn primary sm" data-action="save" data-id="${p.id}">Enregistrer</button>
        <button class="btn ghost sm" data-action="cancel-edit" data-id="${p.id}">Annuler</button>

      </div>
    </div>`;
}

function postCard(p, detail = false) {
  const c = ui.data.clients.find((x) => x.id === p.clientId) || client();
  const editing = detail && ui.editing.has(p.id);
  const fbOpen = detail && ui.feedbackOpen.has(p.id);
  const long = !detail && p.text.length > FOLD_AT && !ui.expanded.has(p.id);
  const text = long ? `${esc(p.text.slice(0, FOLD_AT).trimEnd())}… <button class="li-more" data-action="expand" data-id="${p.id}">voir plus</button>` : esc(p.text);
  const locked = p.status === 'published';
  const hasPh = PLACEHOLDER.test(p.text);

  const preview = `
    <div class="li">
      <div class="li-head"><div class="avatar">${initials(c.name)}</div><div><div class="li-name">${esc(c.name)}</div><div class="li-sub">${esc(c.company || '')}</div></div></div>
      <div class="li-text">${text}</div>
      ${p.image ? `<img class="li-img" src="/uploads/${esc(p.image)}" alt="${esc(p.altText)}">` : ''}
    </div>`;
  return `
  <article class="post ${detail ? 'post-detail' : 'post-summary'}" ${detail ? '' : `id="${p.id}"`}>
    <div>
      ${editing ? postEditor(p) : preview}
      ${detail && p.plan ? strategyPanel(p) : ''}
      ${detail && ui.hooksOpen.has(p.id) ? hooksPanel(p) : ''}
      ${detail && ui.qualityOpen.has(p.id) ? qualityPanel(p) : ''}
      ${detail && ui.retouchOpen.has(p.id) ? retouchPanel(p) : ''}
      ${detail && ui.imageOpen.has(p.id) ? imagePanel(p) : ''}
      ${fbOpen ? `<div class="inline-box" data-feedback="${p.id}">
        <textarea rows="3" placeholder="Qu'est-ce qui ne va pas ? Ex. hook trop long, trop formel, parle plus de mes résultats…"></textarea>
        <div class="row"><button class="btn primary sm" data-action="send-feedback" data-id="${p.id}">Refaire avec ce retour</button>
        <button class="btn ghost sm" data-action="close-feedback" data-id="${p.id}">Annuler</button></div>
      </div>` : ''}
    </div>
    <aside class="side">
      <div class="row between"><span class="badge s-${p.status}">${STATUS[p.status]}</span>${p.theme ? `<span class="tag">${esc(p.theme)}</span>` : ''}</div>
      ${!detail ? `<div class="small">${p.publishedAt ? 'Publié ' + fmtDate(p.publishedAt) : p.scheduledAt ? fmtDate(p.scheduledAt) : 'Sans date'}</div>` : locked ? `<div class="small">Publié ${fmtDate(p.publishedAt)}</div>${metricsForm(p)}`
        : `<label class="f">Publication<input type="datetime-local" data-date="${p.id}" value="${toLocalInput(p.scheduledAt)}"></label>`}
      ${hasPh ? '<div class="alert warn">Remplace les [À COMPLÉTER] avant de valider (✎ Modifier).</div>' : ''}
      ${p.error ? `<div class="alert err">${esc(p.error)}</div>` : ''}
      ${locked ? '' : `<div class="actions">
        ${p.status === 'approved'
          ? `<button class="btn sm" data-action="unapprove" data-id="${p.id}">↩ Retirer</button>`
          : `<button class="btn primary sm" data-action="approve" data-id="${p.id}" ${hasPh ? 'disabled' : ''}>✓ Valider</button>`}
        <button class="btn soft sm" data-action="open-feedback" data-id="${p.id}">💬 Retour</button>
        ${detail ? `<button class="btn sm" data-action="toggle-image" data-id="${p.id}">🖼 Image</button>` : ''}
      </div>
      ${detail ? `<div class="actions">
        <button class="btn sm" data-action="toggle-hooks" data-id="${p.id}">🪝 Hooks${p.hooks?.length ? ` · ${p.hooks[p.hookIndex ?? 0]?.total ?? ''}/100` : ''}</button>
        <button class="btn sm" data-action="toggle-quality" data-id="${p.id}">✅ Qualité</button>
        <button class="btn sm" data-action="toggle-retouch" data-id="${p.id}">✨ Retoucher</button>
        ${p.versions?.length ? `<button class="btn ghost sm" data-action="undo" data-id="${p.id}" title="Revenir à la version précédente">↶ Annuler</button>` : ''}
        ${editing ? '' : `<button class="btn sm" data-action="edit" data-id="${p.id}">✎ Modifier</button>`}
        <button class="btn ghost sm danger" data-action="delete" data-id="${p.id}" title="Supprimer">🗑</button>
      </div>
      ${p.status === 'approved' ? `<button class="btn ghost sm" data-action="publish-now" data-id="${p.id}" style="align-self:flex-start">Publier maintenant</button>` : ''}` : ''}`}
      ${detail ? '' : `<button class="btn sm post-more" data-action="post-detail" data-id="${p.id}" aria-label="Détails et actions du post">⋯ <span>Détails et actions</span></button>`}
    </aside>
  </article>`;
}

function renderCalendar() {
  view.innerHTML = '<header class="page-heading"><div><div class="eyebrow">SUIVI ÉDITORIAL</div><h1>Calendrier</h1><p>Déplace un post pour changer sa date, ou ouvre-le pour modifier l’heure.</p></div>' +
    '<button class="btn" data-action="go" data-id="posts">Voir les posts ' + ICONS.arrow + '</button></header>' +
    calendarMarkup({ posts: clientPosts(), cursor: ui.calCursor, mode: ui.calMode, statuses: STATUS, esc });
}

function renderDrawer() {
  const drawer = $('#postDrawer');
  const post = clientPosts().find((p) => p.id === ui.detailId);
  if (!post) { if (drawer.open) drawer.close(); return; }
  const previousFocus = drawer.contains(document.activeElement) ? document.activeElement : null;
  drawer.innerHTML = '<header class="drawer-heading"><div><div class="eyebrow">FICHE DU POST</div><h2 id="drawerTitle">' +
    esc(post.theme || 'Aperçu du post') + '</h2></div><button class="btn icon-btn" data-action="close-dialog" data-id="postDrawer" aria-label="Fermer le post" autofocus>✕</button></header>' +
    postCard(post, true);
  enhanceVoice(drawer);
  if (!drawer.open) drawer.showModal();
  if (previousFocus?.dataset.action) {
    [...drawer.querySelectorAll('[data-action]')].find((button) => button.dataset.action === previousFocus.dataset.action && button.dataset.id === previousFocus.dataset.id)?.focus();
  }
}

function renderActivity() {
  const active = ui.job && !ui.job.finished;
  const pending = ui.pendingJob;
  const recent = ui.recentJob;
  $('.job-dot').hidden = !active && !pending;
  const dialog = $('#activityDialog');
  if (!dialog.open) return;
  const close = '<button class="btn icon-btn" data-action="close-dialog" data-id="activityDialog" aria-label="Fermer l’activité">✕</button>';
  const title = (kind) => ({ create: 'Rédaction de posts', visuals: 'Création de visuels', paste: 'Analyse de la veille' }[kind] || 'Traitement IA');
  let entry = '<p class="empty">Tes générations et analyses apparaîtront ici.</p>';
  if (active) {
    entry = '<div class="activity-item"><strong>' + title(ui.job.kind) + '</strong><span class="badge s-approved">En cours</span>' +
      '<p class="small">' + esc(ui.job.step) + '</p><progress value="' + ui.job.done + '" max="' + ui.job.total + '"></progress>' +
      (ui.job.kind === 'create' ? '<button class="btn sm" data-action="stop" ' + (ui.job.stop ? 'disabled' : '') + '>Mettre en pause après cette étape</button>' : '') + '</div>';
  } else if (pending) {
    const sameClient = pending.clientId === ui.clientId;
    entry = '<div class="activity-item"><strong>Rédaction de posts</strong><span class="badge s-review">En pause</span>' +
      '<p class="small">' + pending.ids.length + ' brouillon(s) enregistré(s) sur ' + pending.total + '.</p>' +
      (pending.inFlight === 'write' ? '<p class="alert warn">Vérifie les posts du client avant de reprendre. Si l’écriture a déjà abouti, rattache le brouillon existant.</p>' + recoveryPicker(pending) : '') +
      (!sameClient ? '<p class="small">Sélectionne le client « ' + esc(ui.data.clients.find((c) => c.id === pending.clientId)?.name || 'Client précédent') + ' » pour reprendre.</p>' : '') +
      '<div class="row">' + (sameClient && pending.inFlight !== 'write' ? '<button class="btn primary sm" data-action="resume-job">Reprendre</button>' : '') +
      '<button class="btn sm" data-action="dismiss-job">Abandonner la génération</button></div></div>';
  }
  if (recent) entry += '<div class="activity-item"><strong>' + title(recent.kind) + '</strong><p class="small">' + esc(recent.step) + '</p></div>';
  dialog.innerHTML = '<div class="row between"><h2 id="activityTitle">Activité IA</h2>' + close + '</div>' + entry;
}

function recoveryPicker(pending) {
  if (pending.clientId !== ui.clientId) return '';
  const matches = clientPosts().filter((p) => !pending.beforeWrite?.includes(p.id) && !pending.ids.includes(p.id) && p.status !== 'published');
  return '<div class="stack">' + (matches.length ? '<label class="f">Brouillon à rattacher<select id="recoverPost">' +
    matches.map((p) => '<option value="' + esc(p.id) + '">' + esc(p.theme || p.text.slice(0, 65)) + '</option>').join('') +
    '</select></label><button class="btn sm" data-action="resolve-job" data-id="attach">Rattacher et reprendre</button>' : '') +
    '<button class="btn sm" data-action="resolve-job" data-id="retry">Relancer l’écriture</button></div>';
}

function renderSearch() {
  const input = $('#quickQuery');
  const query = input.value.trim().toLocaleLowerCase('fr');
  const pages = Object.entries(PAGE_NAMES).filter(([, name]) => name.toLocaleLowerCase('fr').includes(query));
  const posts = query ? clientPosts().filter((p) => (p.theme + ' ' + p.text).toLocaleLowerCase('fr').includes(query)).slice(0, 8) : [];
  $('#searchResults').innerHTML = pages.map(([key, name]) => '<button class="search-result" data-action="search-go" data-id="' + key + '">' +
    esc(name) + ' <span aria-hidden="true">→</span></button>').join('') + posts.map((post) =>
    '<button class="search-result" data-action="search-post" data-id="' + esc(post.id) + '">' + esc(post.theme || post.text.slice(0, 65)) +
    ' <span class="small">Post</span></button>').join('') || '<div class="empty">Aucun résultat pour ce client.</div>';
}

function setMobileMenu(open, restoreFocus = false) {
  document.body.classList.toggle('menu-open', open);
  const button = $('.mobile-nav [data-action="mobile-menu"]');
  button.setAttribute('aria-expanded', String(open));
  if (open) $('#tabs [aria-current="page"], #tabs button')?.focus();
  if (restoreFocus) button.focus();
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
    <div class="quality-scroll"><table><tr><th>Critère</th><th>Niveau</th><th>Amélioration</th></tr>
    ${(q.criteria || []).map((c) => `<tr><td>${esc(c.name)}</td><td><span class="badge ${lv[c.level] || 's-draft'}">${esc(c.level)}</span></td><td class="small">${c.issue ? `${esc(c.issue)}<br>` : ''}${c.fix ? `💡 ${esc(c.fix)}` : ''}</td></tr>`).join('')}</table></div>
  </div>`;
}

const RETOUCH = { hook: 'Améliorer le hook', shorter: 'Raccourcir', value: 'Ajouter de la valeur', natural: 'Plus naturel', angle: "Changer l'angle", structure: 'Changer la structure', story: 'Renforcer le storytelling', voice: 'Voix du client', other: 'Autre version' };
function retouchPanel(p) {
  return `<div class="inline-box">
    <div class="row between"><b>✨ Retoucher</b><button class="btn ghost sm" data-action="toggle-retouch" data-id="${p.id}">Fermer</button></div>
    <div class="row">${Object.entries(RETOUCH).map(([k, l]) => `<button class="btn soft sm" data-action="retouch" data-id="${p.id}" data-kind="${k}">${l}</button>`).join('')}</div>
    ${p.versions?.length ? `<button class="btn sm" data-action="undo" data-id="${p.id}">↶ Annuler la dernière retouche</button>` : ''}
    <p class="small" style="margin:0">Les retouches s’appliquent au brouillon enregistré.</p>
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
  const count = (object, fields) => fields.filter(([key]) => String(object?.[key] || '').trim()).length;
  const questions = ui.data.editorial.onboarding;
  const answers = a.onboarding?.answers || {};
  const answered = questions.filter((q) => String(answers[q] || '').trim()).length;
  const milestones = [
    ['profile', 'Profil', count(a.profile, PROFILE_FIELDS), PROFILE_FIELDS.length],
    ['personas', 'Cible confirmée', (a.personas || []).some((p) => p.status === 'confirmed') ? 1 : 0, 1],
    ['voice', 'Voix', count(a.voice, VOICE_FIELDS), VOICE_FIELDS.length],
    ['proofs', 'Preuve vérifiée', (a.proofs || []).some((p) => p.status === 'verified' && p.permission !== false) ? 1 : 0, 1],
    ['onboarding', 'Entretien initial', answered, questions.length],
  ];
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
      ${questions.length ? ['Activité et positionnement', 'Audience et preuves', 'Voix et contenu'].map((label, group) => {
        const size = Math.ceil(questions.length / 3);
        const offset = group * size;
        const items = questions.slice(offset, offset + size);
        if (!items.length) return '';
        const complete = items.filter((q) => String(ans[q] || '').trim()).length;
        const earlierComplete = questions.slice(0, offset).every((q) => String(ans[q] || '').trim());
        return `<details class="adn-section" ${earlierComplete && complete < items.length ? 'open' : ''}><summary>${label} <span class="tag">${complete}/${items.length}</span></summary><div class="stack">${items.map((q, i) => `<label class="f">${offset + i + 1}. ${esc(q)}<textarea name="q${offset + i}" rows="2">${esc(ans[q] || '')}</textarea></label>`).join('')}</div></details>`;
      }).join('') : ''}
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
  const next = milestones.find(([, , value, total]) => value < total);
  view.innerHTML = `
    <header class="page-heading"><div><div class="eyebrow">ESPACE CLIENT</div><h1>ADN éditorial</h1><p>Profil, voix et preuves de ${esc(c.name)}.</p></div>${next ? `<button class="btn" data-action="adn-tab" data-id="${next[0]}">Continuer · ${next[1]}</button>` : ''}</header>
    <div class="card adn-overview">${milestones.map(([key, label, value, total]) => `<div><button class="btn ghost sm" data-action="adn-tab" data-id="${key}">${label} · ${value}/${total}</button><progress value="${value}" max="${total || 1}" aria-label="${label}"></progress></div>`).join('')}</div>
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

// ================= PROFIL & BANNIÈRE =================
const newBanner = () => ({ name: `Bannière ${client().name}`, templateId: 'promesse', fields: { ...Banner.DEFAULT_FIELDS, brand: client().company || client().name }, style: {}, images: [] });
const BANNER_FIELDS = [['proof', 'Preuve sociale (haut gauche)'], ['headline', 'Promesse — *mot* = couleur · [[mot]] = surligné · __mot__ = souligné', 2], ['subline', 'Ligne de soutien / rôle'], ['steps', 'Étapes (séparées par des virgules)'],
  ['pills', 'Compétences en pastilles (virgules)'], ['title', 'Métier en gros (modèle « Métier en bloc »)'], ['brand', 'Marque (*mot* = couleur)'], ['cta', 'Appel à l\'action (RDV / lien en sélection)'],
  ['bubble', 'Bulle (« Comme eux, contactez-moi ! »)'], ['followText', 'Phrase près du bouton Suivre'], ['logosTitle', 'Titre de la barre de logos']];

let bannerTimer;
const redrawBanner = () => {
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => { const c = $('#bannerCanvas'); if (c && ui.banner) Banner.renderBanner(c, ui.banner, { overlay: ui.bannerOverlay }); }, 120);
};

function renderBannerView() {
  const c = client();
  const tabs = `<div class="chips" style="margin-bottom:16px"><button class="chip ${ui.bannerTab === 'banner' ? 'on' : ''}" data-action="banner-tab" data-id="banner">Bannière</button><button class="chip ${ui.bannerTab === 'profile' ? 'on' : ''}" data-action="banner-tab" data-id="profile">Optimisation du profil</button></div>`;
  if (ui.bannerTab === 'profile') { view.innerHTML = `<h2>Profil & bannière · ${esc(c.name)}</h2><p class="sub">Audit et réécriture du profil LinkedIn à partir de l'ADN du client.</p>${tabs}${profileAuditHtml(c)}`; return; }
  if (!ui.banner || ui.banner.clientId && ui.banner.clientId !== c.id) ui.banner = newBanner();
  const b = ui.banner;
  const saved = (ui.data.banners || []).filter((x) => x.clientId === c.id);
  const preset = b.style.preset || Banner.TEMPLATES.find((t) => t.id === b.templateId)?.preset;
  view.innerHTML = `
    <h2>Profil & bannière · ${esc(c.name)}</h2>
    <p class="sub">Bannière LinkedIn 1584 × 396 px : textes exacts et modifiables, export PNG prêt à mettre sur le profil.</p>
    ${tabs}
    <div class="card stack">
      <canvas id="bannerCanvas" class="banner-canvas" width="1584" height="396"></canvas>
      <div class="row between">
        <div class="chips">${Banner.TEMPLATES.map((t) => `<button class="chip ${t.id === b.templateId ? 'on' : ''}" data-action="banner-template" data-id="${t.id}" title="${esc(t.hint)}">${esc(t.name)}</button>`).join('')}</div>
        <div class="row">
          <label class="small"><input type="checkbox" id="bannerOverlay" ${ui.bannerOverlay ? 'checked' : ''} style="width:auto"> Zone de la photo</label>
          <button class="btn primary" data-action="banner-ai">✨ Proposer les textes (IA)</button>
          <button class="btn" data-action="banner-save">💾 Enregistrer</button>
          <button class="btn primary" data-action="banner-download">⬇ Télécharger PNG</button>
        </div>
      </div>
    </div>
    ${ui.bannerVariants.length ? `<div class="card stack"><h3 style="margin:0">Propositions de l'IA</h3><div class="grid3">${ui.bannerVariants.map((v, i) => `<div class="variant"><div class="small"><b>${esc(v.angle || `Variante ${i + 1}`)}</b></div><div class="vhook">${esc(v.headline).replace(/\n/g, '<br>')}</div><div class="small">${esc(v.proof || '')}</div><button class="btn soft sm" data-action="banner-variant" data-id="${i}">Utiliser</button></div>`).join('')}</div></div>` : ''}
    <div class="two-col banner-cols">
      <div class="card stack">
        <h3 style="margin:0">Style</h3>
        <label class="f">Fond<select id="bannerPreset">${Object.entries(Banner.PRESETS).map(([k, v]) => `<option value="${k}" ${k === preset ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select></label>
        <label class="f">Couleur d'accent<input type="color" id="bannerAccent" value="${esc(b.style.accent || Banner.PRESETS[preset]?.accent || '#2FBF71')}" style="height:42px;padding:4px"></label>
        <h3 style="margin:8px 0 0">Images</h3>
        <div class="row"><label class="btn sm">+ Logos clients / médias<input type="file" accept="image/*" multiple data-banner-img="logo" hidden></label><label class="btn sm">+ Photos (preuve sociale)<input type="file" accept="image/*" multiple data-banner-img="avatar" hidden></label></div>
        <div class="thumbs">${b.images.map((im, i) => `<div class="thumb on" style="position:relative;background:#fff"><img src="${im.src}" alt="" style="object-fit:contain"><button class="btn sm" data-action="banner-img-del" data-id="${i}" style="position:absolute;top:2px;right:2px;padding:0 6px">×</button></div>`).join('')}</div>
        <p class="small" style="margin:0">Logos : PNG à fond transparent de préférence. Photos de personnes accompagnées : uniquement avec leur accord.</p>
        ${saved.length ? `<h3 style="margin:8px 0 0">Bannières enregistrées</h3>${saved.map((x) => `<div class="row between vitem"><a href="#" data-action="banner-load" data-id="${x.id}">${esc(x.name)}</a><button class="btn ghost sm danger" data-action="banner-del" data-id="${x.id}">🗑</button></div>`).join('')}` : ''}
        <button class="btn ghost sm" data-action="banner-new" style="align-self:flex-start">+ Nouvelle bannière</button>
      </div>
      <form class="card stack" id="bannerForm" onsubmit="return false">
        <h3 style="margin:0">Textes</h3>
        <label class="f">Nom de la bannière<input name="_name" value="${esc(b.name)}" data-novoice></label>
        ${BANNER_FIELDS.map(([k, l, rows]) => `<label class="f">${l}${rows ? `<textarea name="${k}" rows="${rows}">${esc(b.fields[k] || '')}</textarea>` : `<input name="${k}" value="${esc(b.fields[k] || '')}">`}</label>`).join('')}
      </form>
    </div>`;
  redrawBanner();
}

function profileAuditHtml(c) {
  const a = c.adn?.profileAudit;
  return `<div class="card stack">
      <label class="f">Colle ici le profil LinkedIn actuel (titre, infos, expériences… : sur le profil, Ctrl+A puis Ctrl+C)
        <textarea id="profileText" rows="8" data-novoice>${esc(a?.profileText || '')}</textarea></label>
      <button class="btn primary" data-action="profile-audit" style="align-self:flex-start">🔍 Analyser et réécrire le profil</button>
    </div>
    ${a ? `<div class="card stack">
      <div class="row between"><h3 style="margin:0">Score du profil</h3><span class="badge ${scoreClass(a.score)}">${esc(a.score)}/100</span></div>
      <table><tr><th>Section</th><th class="num">Note</th><th>Problème</th><th>À faire</th></tr>${(a.sections || []).map((x) => `<tr><td>${esc(x.name)}</td><td class="num">${esc(x.score)}/10</td><td class="small">${esc(x.issue)}</td><td class="small">${esc(x.fix)}</td></tr>`).join('')}</table>
      ${a.quickWins?.length ? `<div class="alert ok"><b>Actions rapides :</b> ${a.quickWins.map(esc).join(' · ')}</div>` : ''}
    </div>
    <div class="card stack"><h3 style="margin:0">Titres proposés</h3>${(a.headlines || []).map((h) => `<div class="row between vitem"><span>${esc(h)} <span class="small">(${h.length}/220)</span></span><button class="btn ghost sm" data-action="copy" data-id="${esc(h)}">Copier</button></div>`).join('')}</div>
    <div class="card stack"><div class="row between"><h3 style="margin:0">Section « Infos »</h3><button class="btn ghost sm" data-action="copy" data-id="${esc(a.about || '')}">Copier</button></div><div class="vtext" style="color:var(--text)">${esc(a.about || '')}</div><div class="small">${(a.about || '').length}/2600 caractères</div></div>
    <div class="grid2"><div class="card stack" style="margin:0"><h3 style="margin:0">À épingler en « Sélection »</h3><ul class="small">${(a.featured || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="card stack" style="margin:0"><h3 style="margin:0">Expériences</h3><ul class="small">${(a.experience || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>` : ''}`;
}

const imgToDataUrl = (file, max, type) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => {
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const cv = document.createElement('canvas');
    cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    URL.revokeObjectURL(img.src);
    resolve(cv.toDataURL(type, 0.9));
  };
  img.onerror = () => reject(new Error(`Image illisible : ${file.name}`));
  img.src = URL.createObjectURL(file);
});

// ================= VISUELS À VALEUR =================
const visualsOf = () => (ui.data.visuals || []).filter((v) => v.clientId === ui.clientId);
const visCurrent = (v) => ({ ...v, spec: ui.visEdit[v.id] || v.spec, author: client()?.name || '' });
const TD = (arr) => (arr || []).map((x) => (typeof x === 'string' ? x : `${x.t || ''}${x.d ? ` — ${x.d}` : ''}`)).join('\n');
const parseTD = (txt) => String(txt).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [t, ...d] = l.split(/\s+[—–-]\s+/); return { t: t.trim(), d: d.join(' — ').trim() }; });
const getPath = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const setPath = (o, path, val) => { const ks = path.split('.'); let a = o; ks.slice(0, -1).forEach((k) => { a[k] ??= {}; a = a[k]; }); a[ks.at(-1)] = val; };

function visFields(v) {
  const sp = visCurrent(v).spec;
  const inp = (path, label) => `<label class="f">${label}<input data-vid="${v.id}" data-vpath="${path}" value="${esc(getPath(sp, path) || '')}"></label>`;
  const area = (path, label, fmt, rows = 4) => { const val = getPath(sp, path); return `<label class="f">${label}<textarea rows="${rows}" data-vid="${v.id}" data-vpath="${path}" data-vfmt="${fmt}">${esc(fmt === 'td' ? TD(val) : (val || []).join('\n'))}</textarea></label>`; };
  if (v.kind === 'carousel') {
    return (sp.slides || []).map((sl, i) => `<fieldset class="slide-edit"><legend class="small">Diapo ${i + 1} · ${sl.kind === 'cover' ? 'couverture' : sl.kind === 'end' ? 'fin' : 'contenu'}</legend>
      ${inp(`slides.${i}.title`, 'Titre')}${sl.kind === 'cover' ? inp(`slides.${i}.subtitle`, 'Sous-titre') : inp(`slides.${i}.text`, 'Texte')}
      ${sl.kind === 'content' ? area(`slides.${i}.items`, 'Puces (une par ligne)', 'lines', 3) : ''}</fieldset>`).join('');
  }
  const t = sp.type;
  if (t === 'liste') return inp('title', 'Titre (*mot* = couleur)') + inp('subtitle', 'Sous-titre') + area('items', 'Éléments : « titre — détail », un par ligne', 'td', 6);
  if (t === 'comparaison') return inp('title', 'Titre') + inp('left.label', 'Colonne gauche') + area('left.items', 'Éléments gauche', 'lines') + inp('right.label', 'Colonne droite') + area('right.items', 'Éléments droite', 'lines');
  if (t === 'process') return inp('title', 'Titre') + area('steps', 'Étapes : « titre — détail »', 'td', 5);
  if (t === 'matrice') return inp('title', 'Titre') + inp('xAxis', 'Axe horizontal') + inp('yAxis', 'Axe vertical') + area('quadrants', '4 cases (haut gauche, haut droite, bas gauche, bas droite) : « titre — détail »', 'td', 4);
  if (t === 'chiffre') return inp('title', 'Titre') + inp('value', 'Chiffre') + inp('label', 'Explication') + inp('source', 'Source (obligatoire)');
  if (t === 'citation') return inp('quote', 'Citation') + inp('author', 'Auteur');
  return '';
}

function renderVisualsView() {
  const c = client();
  const o = ui.vis;
  const j = ui.job?.kind === 'visuals' ? ui.job : null;
  const list = visualsOf().slice(0, 12);
  view.innerHTML = `
    <h2>Visuels à valeur</h2>
    <p class="sub">Schémas, checklists, comparatifs, frameworks et carrousels qui apportent une vraie réponse aux prospects de ${esc(c.name)}, chacun avec son post. Textes exacts et modifiables, aucun chiffre inventé.</p>
    <div class="card stack">
      <div class="row" style="align-items:flex-end">
        <label class="f" style="flex:1;min-width:240px">Sujet (laisse vide pour un sujet au hasard)<input id="visTopic" value="${esc(ui.visTopic)}" placeholder="Ex. comment préparer un post en 15 minutes"></label>
        <button class="btn" data-action="vis-random">🎲 Au hasard</button>
      </div>
      <div class="row">
        <div class="seg"><button class="${o.kind === 'image' ? 'on' : ''}" data-action="vis-opt" data-id="kind:image">Images + posts</button><button class="${o.kind === 'carousel' ? 'on' : ''}" data-action="vis-opt" data-id="kind:carousel">Carrousel + post</button></div>
        ${o.kind === 'image' ? `<div class="seg">${[1, 2, 3].map((n) => `<button class="${o.count === n ? 'on' : ''}" data-action="vis-opt" data-id="count:${n}">${n} sous-sujet${n > 1 ? 's' : ''}</button>`).join('')}</div>` : ''}
        <div class="seg">${Object.entries(Vis.FORMATS).map(([k, f]) => `<button class="${o.format === k ? 'on' : ''}" data-action="vis-opt" data-id="format:${k}">${esc(f.name)}</button>`).join('')}</div>
      </div>
      <div class="row">
        <label class="f">Style<select id="visPreset">${Object.entries(Vis.STYLES).map(([k, st]) => `<option value="${k}" ${o.preset === k ? 'selected' : ''}>${esc(st.name)}</option>`).join('')}</select></label>
        <label class="f">Accent<input type="color" id="visAccent" value="${esc(o.accent || Vis.STYLES[o.preset].accent)}" style="height:42px;width:80px;padding:4px"></label>
        <label class="f">Cible<select id="visPersona"><option value="">Générale</option>${personas().map((x) => `<option value="${x.id}">${esc(x.name || x.role)}</option>`).join('')}</select></label>
      </div>
      ${j ? `<div class="row"><div class="progress"><span style="width:${Math.round((100 * j.done) / j.total)}%"></span></div><span class="small">${esc(j.step)}</span></div>` : ''}
      <button class="btn primary big" data-action="vis-create" ${j ? 'disabled' : ''}>${o.kind === 'carousel' ? 'Créer le carrousel et son post' : `Créer ${o.count} visuel${o.count > 1 ? 's' : ''} et leurs posts`}</button>
    </div>
    ${list.length ? list.map((v) => {
      const n = Vis.slideCount(visCurrent(v));
      const i = Math.min(ui.visSlide[v.id] || 0, n - 1);
      const post = ui.data.posts.find((p) => p.id === v.postId);
      return `<div class="card vis-card">
        <div class="vis-preview"><canvas data-vis="${v.id}" class="vis-canvas"></canvas>
          ${n > 1 ? `<div class="row" style="justify-content:center"><button class="btn sm" data-action="vis-slide" data-id="${v.id}" data-d="-1">‹</button><span class="small">${i + 1} / ${n}</span><button class="btn sm" data-action="vis-slide" data-id="${v.id}" data-d="1">›</button></div>` : ''}</div>
        <div class="stack" style="min-width:0">
          <div class="row between"><div><b>${esc(v.subtopic || v.subject || '')}</b><div class="small">${v.kind === 'carousel' ? 'Carrousel' : esc(Vis.VISUAL_TYPES[v.spec?.type] || '')} · ${fmtDate(v.createdAt)}</div></div>
            <button class="btn ghost sm danger" data-action="vis-del" data-id="${v.id}">🗑</button></div>
          <details><summary class="small" style="cursor:pointer"><b>✎ Modifier les textes du visuel</b></summary><div class="stack" style="margin-top:8px">${visFields(v)}</div></details>
          <div class="row">
            <button class="btn primary sm" data-action="vis-attach" data-id="${v.id}">💾 Enregistrer et mettre à jour le post</button>
            <button class="btn sm" data-action="vis-png" data-id="${v.id}">⬇ PNG${n > 1 ? ' (diapo)' : ''}</button>
            ${v.kind === 'carousel' ? `<button class="btn sm" data-action="vis-pdf" data-id="${v.id}">⬇ PDF</button>` : ''}
          </div>
          ${post ? `<div class="inline-box"><div class="row between"><b class="small">Post associé · <span class="badge s-${post.status}">${STATUS[post.status]}</span></b><a href="#" class="small" data-action="vis-goto-post" data-id="${post.id}">Ouvrir dans Posts →</a></div><div class="vtext" style="color:var(--text)">${esc(post.text.slice(0, 420))}${post.text.length > 420 ? '…' : ''}</div>${post.document ? '<div class="small">📎 Carrousel PDF attaché</div>' : post.image ? '<div class="small">📎 Image attachée</div>' : ''}</div>` : ''}
        </div>
      </div>`;
    }).join('') : '<div class="card empty">Aucun visuel pour l\'instant.</div>'}`;
  for (const v of list) {
    const cv = view.querySelector(`[data-vis="${v.id}"]`);
    if (cv) Vis.renderVisual(cv, visCurrent(v), ui.visSlide[v.id] || 0);
  }
}

// Rendu hors écran → image PNG ou PDF (carrousel), puis rattachement au post.
async function visualFiles(v) {
  const cur = visCurrent(v);
  const n = Vis.slideCount(cur);
  const cv = document.createElement('canvas');
  if (cur.kind !== 'carousel') { await Vis.renderVisual(cv, cur, 0); return { png: cv.toDataURL('image/png') }; }
  const f = Vis.FORMATS[cur.format] || Vis.FORMATS.portrait;
  const jpegs = [];
  for (let i = 0; i < n; i++) { await Vis.renderVisual(cv, cur, i); jpegs.push(cv.toDataURL('image/jpeg', 0.9)); }
  return { pdf: Vis.jpegsToPdf(jpegs, f.w, f.h) };
}

async function attachVisual(v) {
  const files = await visualFiles(v);
  if (files.png) await api('POST', `/api/posts/${v.postId}/image`, { dataUrl: files.png });
  if (files.pdf) await api('POST', `/api/posts/${v.postId}/document`, { dataUrl: files.pdf, title: (visCurrent(v).spec.slides?.[0]?.title || v.subject || 'Carrousel').replace(/[*_\[\]]/g, '') });
}

function download(dataUrl, name) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '-').toLowerCase();
  a.click();
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
  'mobile-menu'() {
    const open = !document.body.classList.contains('menu-open');
    setMobileMenu(open, !open);
  },
  'close-dialog'(id) { document.getElementById(id).close(); },
  'post-detail'(id) { ui.detailId = id; renderDrawer(); },
  'studio-tool'(tool) {
    ui.tools = tool;
    render();
    view.querySelector('[data-action="studio-tool"][data-id="' + tool + '"]')?.focus();
  },
  async 'manual-save'(_id, button) {
    const id = ui.clientId;
    const text = ui.manual[id]?.trim();
    if (!text) return;
    button.disabled = true;
    try {
      const post = await api('POST', '/api/posts', { clientId: id, text });
      delete ui.manual[id];
      if (ui.clientId === id) {
        ui.lastCreated.unshift(post.id);
        ui.studioPost = post.id;
      }
      await refresh();
      toast('Brouillon enregistré');
    } finally { button.disabled = false; }
  },
  'calendar-mode'(mode) { ui.calMode = mode; render(); view.querySelector('[data-action="calendar-mode"][aria-pressed="true"]')?.focus(); },
  'calendar-move'(direction) {
    ui.calCursor = calendarDate(ui.calCursor, ui.calMode, Number(direction));
    render();
    view.querySelector('[data-action="calendar-move"][data-id="' + direction + '"]')?.focus();
  },
  jobs() {
    if (!$('#activityDialog').open) $('#activityDialog').showModal();
    renderActivity();
    $('#activityDialog button')?.focus();
  },
  async 'resume-job'() {
    if (ui.pendingJob?.clientId !== ui.clientId || ui.pendingJob.inFlight === 'write') return;
    $('#activityDialog').close();
    await createAuto(ui.pendingJob);
  },
  async 'resolve-job'(mode) {
    const pending = ui.pendingJob;
    if (!pending || pending.clientId !== ui.clientId || pending.inFlight !== 'write') return;
    if (mode === 'attach') {
      pending.postId = $('#recoverPost')?.value;
      if (!pending.postId) return;
      pending.ids.push(pending.postId);
    } else if (!confirm('As-tu vérifié qu’aucun brouillon ne correspond à cette écriture ?')) return;
    pending.inFlight = '';
    checkpoint(pending);
    await actions['resume-job']();
  },
  'dismiss-job'() {
    if (!confirm('Abandonner les étapes restantes ? Les brouillons déjà enregistrés restent dans Posts.')) return;
    checkpoint(null);
    render();
  },
  'quick-search'() {
    const dialog = $('#searchDialog');
    if (dialog.open) return;
    dialog.innerHTML = '<div class="row between"><h2 id="searchTitle">Rechercher</h2><button class="btn icon-btn" data-action="close-dialog" data-id="searchDialog" aria-label="Fermer la recherche">✕</button></div>' +
      '<label class="f">Pages et posts du client<input id="quickQuery" type="search" placeholder="Un écran, un titre, une expression…" autofocus></label>' +
      '<div id="searchResults" class="search-results" aria-live="polite"></div>';
    dialog.showModal();
    renderSearch();
  },
  'search-go'(id) { $('#searchDialog').close(); actions.go(id); },
  'search-post'(id) { $('#searchDialog').close(); actions['post-detail'](id); },

  'vis-opt'(kv) { const [k, v] = kv.split(':'); ui.vis = { ...ui.vis, [k]: k === 'count' ? Number(v) : v }; store.set('vis', ui.vis); render(); },
  'vis-random'() { ui.visTopic = ''; const el = $('#visTopic'); if (el) el.value = ''; toast("Sujet au hasard : l'IA choisira dans les piliers et les problèmes de la cible"); },
  'vis-slide'(id, btn) { const v = visualsOf().find((x) => x.id === id); const n = Vis.slideCount(visCurrent(v)); ui.visSlide[id] = ((ui.visSlide[id] || 0) + Number(btn.dataset.d) + n) % n; render(); },
  async 'vis-create'() {
    if (ui.job && !ui.job.finished) throw new Error('Un traitement est déjà en cours.');
    const clientId = ui.clientId;
    if (!ui.data.settings.hasOpenaiKey) throw new Error('Ajoute ta clé OpenAI dans Réglages.');
    const o = ui.vis;
    const style = { preset: o.preset, accent: o.accent };
    const personaId = $('#visPersona')?.value || '';
    ui.visTopic = $('#visTopic')?.value || '';
    ui.job = { kind: 'visuals', total: 1, done: 0, step: 'Choix des sous-sujets…' };
    render();
    try {
      const plan = await api('POST', '/api/visuals/plan', { clientId, topic: ui.visTopic, count: o.count, kind: o.kind, personaId });
      ui.job.total = plan.items.length;
      for (const [i, it] of plan.items.entries()) {
        ui.job.step = `${i + 1} / ${plan.items.length} : ${it.subtopic} (visuel + post)…`;
        render();
        const r = await api('POST', '/api/visuals/item', { clientId, subject: plan.subject, subtopic: it.subtopic, type: it.type, kind: o.kind, format: o.format, style, personaId });
        await refresh();
        ui.job.step = `${i + 1} / ${plan.items.length} : on attache le visuel au post…`;
        render();
        await attachVisual(r.visual).catch((e) => toast(`Visuel ${i + 1} non attaché : ${e.message}`, true));
        ui.job.done = i + 1;
      }
      toast('Visuels et posts prêts (posts « à valider »)');
    } finally { ui.job = null; await refresh(); }
  },
  async 'vis-attach'(id, btn) {
    const v = visualsOf().find((x) => x.id === id);
    btn.disabled = true; btn.textContent = 'Mise à jour…';
    try {
      if (ui.visEdit[id]) await api('PUT', `/api/visuals/${id}`, { spec: ui.visEdit[id] });
      await refresh();
      delete ui.visEdit[id];
      await attachVisual(visualsOf().find((x) => x.id === id) || v);
      toast('Visuel enregistré et attaché au post');
    } finally { await refresh(); }
  },
  async 'vis-png'(id) { const v = visualsOf().find((x) => x.id === id); const cv = document.createElement('canvas'); await Vis.renderVisual(cv, visCurrent(v), ui.visSlide[id] || 0); download(cv.toDataURL('image/png'), `${v.subtopic || 'visuel'}.png`); },
  async 'vis-pdf'(id) { const v = visualsOf().find((x) => x.id === id); const f = await visualFiles(v); download(f.pdf, `${v.subtopic || v.subject || 'carrousel'}.pdf`); },
  async 'vis-del'(id) { await api('DELETE', `/api/visuals/${id}`); await refresh(); },
  'vis-goto-post'(id) { ui.view = 'posts'; ui.filter = 'all'; store.set('view', 'posts'); render(); goto(id); },
  'banner-tab'(t) { ui.bannerTab = t; store.set('bannerTab', t); render(); },
  'banner-template'(id) {
    ui.banner.templateId = id;
    ui.banner.style = { ...ui.banner.style, preset: Banner.TEMPLATES.find((t) => t.id === id).preset, accent: '' };
    render();
  },
  'banner-new'() { ui.banner = newBanner(); ui.bannerVariants = []; render(); },
  'banner-load'(id) { const b = ui.data.banners.find((x) => x.id === id); if (b) { ui.banner = JSON.parse(JSON.stringify(b)); ui.bannerVariants = []; render(); } },
  async 'banner-del'(id) { await api('DELETE', `/api/banners/${id}`); if (ui.banner?.id === id) ui.banner = null; await refresh(); },
  'banner-img-del'(i) { ui.banner.images.splice(Number(i), 1); render(); },
  async 'banner-ai'(_id, btn) {
    btn.disabled = true; btn.textContent = 'L\'IA écrit…';
    try {
      const r = await api('POST', '/api/banners/suggest', { clientId: ui.clientId, templateName: Banner.TEMPLATES.find((t) => t.id === ui.banner.templateId)?.name });
      ui.bannerVariants = r.variants || [];
    } finally { render(); }
  },
  'banner-variant'(i) {
    const v = ui.bannerVariants[Number(i)];
    const f = ui.banner.fields;
    for (const k of ['headline', 'proof', 'subline', 'cta', 'followText', 'bubble', 'title', 'brand']) if (v[k]) f[k] = v[k];
    if (v.steps?.length) f.steps = v.steps.join(', ');
    if (v.pills?.length) f.pills = v.pills.join(', ');
    render();
  },
  async 'banner-save'() {
    const b = await api('POST', '/api/banners', { ...ui.banner, clientId: ui.clientId });
    ui.banner = JSON.parse(JSON.stringify(b));
    await refresh();
    toast('Bannière enregistrée');
  },
  async 'banner-download'() {
    const cv = document.createElement('canvas');
    await Banner.renderBanner(cv, ui.banner, { overlay: false });
    const a = document.createElement('a');
    a.href = cv.toDataURL('image/png');
    a.download = `${(ui.banner.name || 'banniere').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w-]+/g, '-').toLowerCase()}.png`;
    a.click();
  },
  async 'profile-audit'(_id, btn) {
    btn.disabled = true; btn.textContent = 'Analyse du profil… (jusqu\'à 1 min)';
    try { await api('POST', '/api/profile/audit', { clientId: ui.clientId, profileText: $('#profileText').value }); toast('Audit prêt'); } finally { await refresh(); }
  },
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
  'toggle-hooks'(id) { if (ui.view === 'create' && !ui.detailId) { ui.tools = ''; render(); return; } if (ui.hooksOpen.has(id)) ui.hooksOpen.delete(id); else ui.hooksOpen.add(id); render(); },
  'toggle-quality'(id) { if (ui.view === 'create' && !ui.detailId) { ui.tools = ''; render(); return; } if (ui.qualityOpen.has(id)) ui.qualityOpen.delete(id); else ui.qualityOpen.add(id); render(); },
  'toggle-retouch'(id) { if (ui.view === 'create' && !ui.detailId) { ui.tools = ''; render(); return; } if (ui.retouchOpen.has(id)) ui.retouchOpen.delete(id); else ui.retouchOpen.add(id); render(); },
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
  go(v) {
    if (!PAGE_NAMES[v]) return;
    ui.view = v;
    ui.detailId = null;
    setMobileMenu(false);
    store.set('view', v);
    render();
    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
  },
  dictate(_id, btn) { if (recognition) stopDictation(); else startDictation(btn); },
  count(n) { ui.count = Number(n); store.set('count', ui.count); render(); },
  engine(e) { ui.engine = e; store.set('engine', e); ui.relay = null; render(); },
  async create() {
    if (ui.engine === 'gpt') { ui.relay = { step: 1, count: ui.count, instruction: ui.instruction, texts: [] }; render(); return; }
    await createAuto();
  },
  stop() {
    if (ui.job?.kind !== 'create') return;
    ui.job.stop = true;
    renderActivity();
    toast('Pause après l’étape en cours');
  },
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
  'cancel-edit'(id) { delete ui.draftText[id]; ui.editing.delete(id); render(); },
  async save(id) {
    await api('PUT', `/api/posts/${id}`, { text: ui.draftText[id] ?? ui.data.posts.find((p) => p.id === id).text });
    delete ui.draftText[id];
    ui.editing.delete(id);
    await refresh();
  },
  'open-feedback'(id) { ui.detailId = id; ui.feedbackOpen.add(id); render(); $(`[data-feedback="${id}"] textarea`)?.focus(); },
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
    if (ui.job && !ui.job.finished) throw new Error('Un traitement est déjà en cours.');
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
  const tab = e.target.closest('[data-view]');
  if (tab) { actions.go(tab.dataset.view); return; }
  const el = e.target.closest('[data-action]');
  if (!el || el.tagName === 'INPUT') return;
  if (el.tagName === 'A') e.preventDefault();
  await actions[el.dataset.action]?.(el.dataset.id, el);
}));

document.addEventListener('input', (e) => {
  if (e.target.id === 'quickQuery') renderSearch();
  if (e.target.id === 'manualDraft') {
    ui.manual[ui.clientId] = e.target.value;
    $('#manualCount').textContent = e.target.value.length + ' / 3 000';
    $('#manualSave').disabled = !e.target.value.trim();
  }
  if (e.target.id === 'instruction') ui.instruction = e.target.value;
  if (e.target.closest('#bannerForm') && ui.banner) {
    const t = e.target;
    if (t.name === '_name') ui.banner.name = t.value; else ui.banner.fields[t.name] = t.value;
    redrawBanner();
  }
  if (e.target.dataset.vpath) {
    const t = e.target;
    const v = visualsOf().find((x) => x.id === t.dataset.vid);
    const spec = ui.visEdit[v.id] || JSON.parse(JSON.stringify(v.spec));
    setPath(spec, t.dataset.vpath, t.dataset.vfmt === 'td' ? parseTD(t.value) : t.dataset.vfmt === 'lines' ? t.value.split('\n').map((x) => x.trim()).filter(Boolean) : t.value);
    ui.visEdit[v.id] = spec;
    clearTimeout(ui.visT);
    ui.visT = setTimeout(() => { const cv = view.querySelector(`[data-vis="${v.id}"]`); if (cv) Vis.renderVisual(cv, visCurrent(v), ui.visSlide[v.id] || 0); }, 150);
  }
  if (e.target.id === 'visTopic') ui.visTopic = e.target.value;
  if (e.target.id === 'visAccent') { ui.vis = { ...ui.vis, accent: e.target.value }; store.set('vis', ui.vis); }
  if (e.target.id === 'bannerAccent' && ui.banner) { ui.banner.style = { ...ui.banner.style, accent: e.target.value }; redrawBanner(); }
  if (e.target.id === 'hookSearch') { ui.hookSearch = e.target.value; ui.hookLimit = 60; clearTimeout(ui.hsT); ui.hsT = setTimeout(() => { render(); const el = $('#hookSearch'); el?.focus(); el?.setSelectionRange(el.value.length, el.value.length); }, 250); }
  const ed = e.target.closest('[data-editor] textarea');
  if (ed) {
    const editor = ed.closest('[data-editor]');
    ui.draftText[editor.dataset.editor] = ed.value;
    const count = editor.querySelector('.count');
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
    ui.niche = undefined; ui.lastCreated = []; ui.relay = null; ui.studioPost = null; ui.detailId = null;
    ui.personaId = ''; ui.objective = ''; ui.awareness = ''; ui.ideaId = ''; ui.instruction = '';
    await refresh();
    return;
  }
  if (t.id === 'studioDraft') { ui.studioPost = t.value || null; render(); $('#studioDraft')?.focus(); return; }
  if (t.id === 'personaSel') { ui.personaId = t.value; return; }
  if (t.id === 'visPreset') { ui.vis = { ...ui.vis, preset: t.value, accent: '' }; store.set('vis', ui.vis); render(); return; }
  if (t.id === 'bannerPreset') { ui.banner.style = { ...ui.banner.style, preset: t.value, accent: '' }; render(); return; }
  if (t.id === 'bannerOverlay') { ui.bannerOverlay = t.checked; redrawBanner(); return; }
  if (t.dataset.bannerImg && t.files.length) {
    for (const f of [...t.files]) {
      const logo = t.dataset.bannerImg === 'logo';
      ui.banner.images.push({ kind: t.dataset.bannerImg, src: await imgToDataUrl(f, logo ? 320 : 180, logo ? 'image/png' : 'image/jpeg') });
    }
    render();
    return;
  }
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
    if (ui.job && !ui.job.finished) throw new Error('Un traitement est déjà en cours.');
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

$('#postDrawer').addEventListener('close', () => {
  if ($('#postDrawer').open) return;
  const id = ui.detailId;
  ui.detailId = null;
  ui.feedbackOpen.delete(id);
  ui.editing.delete(id);
});

document.addEventListener('keydown', (event) => {
  if (!ui.data || document.body.classList.contains('locked')) return;
  if (event.key === 'Escape' && document.body.classList.contains('menu-open')) setMobileMenu(false, true);
  if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || event.repeat ||
      document.querySelector('dialog[open]') || event.target.closest?.('input, textarea, select, [contenteditable]')) return;
  if (event.key.toLowerCase() === 'n') {
    event.preventDefault();
    ui.studioPost = null;
    actions.go('create');
    $('#manualDraft')?.focus();
  }
  if (event.key === '/') { event.preventDefault(); actions['quick-search'](); }
});

let draggedPost;
view.addEventListener('dragstart', (event) => {
  const post = event.target.closest('[data-calendar-post][draggable="true"]');
  if (!post) return;
  draggedPost = post.dataset.calendarPost;
  event.dataTransfer.setData('text/plain', draggedPost);
  event.dataTransfer.effectAllowed = 'move';
});
view.addEventListener('dragover', (event) => {
  const target = event.target.closest('[data-drop-date]');
  if (!target || !draggedPost) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  view.querySelector('.drop-target')?.classList.remove('drop-target');
  target.classList.add('drop-target');
});
view.addEventListener('dragend', () => {
  draggedPost = null;
  view.querySelector('.drop-target')?.classList.remove('drop-target');
});
view.addEventListener('drop', run(async (event) => {
  const target = event.target.closest('[data-drop-date]');
  if (!target || !draggedPost) return;
  event.preventDefault();
  const post = clientPosts().find((p) => p.id === draggedPost);
  draggedPost = null;
  target.classList.remove('drop-target');
  if (!post || post.status === 'published') return;
  const clock = toLocalInput(post.scheduledAt).slice(11) || '09:00';
  await api('PUT', '/api/posts/' + post.id, { scheduledAt: new Date(target.dataset.dropDate + 'T' + clock).toISOString() });
  await refresh();
  toast('Date de publication mise à jour');
}));

run(refresh)();
