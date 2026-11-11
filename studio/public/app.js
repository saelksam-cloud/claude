// Link Motion Studio — interface (vanilla JS, aucun build).
import * as Banner from '/banner.js';
import * as BE from '/banner-editor.js';
import * as Vis from '/visuals.js';
import { calendarMarkup, calendarDate } from '/calendar.js';
const $ = (sel, el = document) => el.querySelector(sel);
const view = $('#view');

const PAGE_NAMES = {"atelier":"Atelier","marche":"Marché","create":"Studio","posts":"Posts","calendar":"Calendrier","visuals":"Visuels (ancien)","adn":"ADN client","banner":"Bannière","images":"Visuels","veille":"Veille","study":"Étude de marché","hooks":"Hooks","settings":"Réglages"};
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
  view: store.get('view', 'atelier'),
  filter: 'review',
  detailId: null,
  studioPost: null,
  draftText: {},
  manual: {},
  advanced: false,
  tools: 'chat',
  chatDraft: {},
  chatPending: null,
  memoryOpen: false,
  atStep: {},
  visKind: {},
  visStyle: {},
  visChatPending: null,
  pillar: '',
  hookPillar: '',
  hookIdeas: [],
  daDraft: null,
  postVisBg: '',
  visMoreOpen: false,
  postVisType: 'auto',
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
  selected: new Set(),
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
  visTab: 'create',
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
// Les appels IA longs passent par une tâche d'arrière-plan (Netlify coupe les requêtes normales à 30 s).
const LONG_API = /^\/api\/(jobs-test|agent\/run|plan|write|hooks\/ideas|hooks\/generate|hooks\/optimize|study|veille\/paste|veille\/structures|banners\/(suggest|analyze|chat|palettes)|profile\/audit|visuals\/plan|visuals\/item|visuals\/[^/]+\/(chat|design-page|redesign)|images|posts\/[^/]+\/(design|hooks|chat|visual|visual-from|quality|action|feedback|rewrite|image\/generate|image\/auto))$/;
async function api(method, url, body) {
  if (method === 'POST' && LONG_API.test(url)) return apiLong(method, url, body);
  return apiDirect(method, url, body);
}
async function apiLong(method, url, body) {
  const { id } = await apiDirect('POST', '/api/jobs', { method, path: url, body: body || {} });
  const started = Date.now();
  let wait = 1200;
  while (Date.now() - started < 6 * 60_000) {
    await new Promise((r) => setTimeout(r, wait));
    wait = Math.min(2500, wait + 300);
    const j = await apiDirect('GET', `/api/jobs/${id}`).catch((e) => (e instanceof AuthError ? Promise.reject(e) : null));
    if (!j || j.status === 'pending' || j.status === 'running') continue;
    if (j.status === 'done') return j.result;
    throw new Error(j.error || `Erreur ${j.httpStatus || ''}`.trim());
  }
  throw new Error("L'IA met trop de temps à répondre : réessaie dans un instant.");
}
async function apiDirect(method, url, body) {
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
  ({ atelier: renderAtelier, marche: renderMarche, create: renderCreate, hooks: renderHookBank, posts: renderPosts, calendar: renderCalendar, adn: renderAdn, hooksLib: renderHooks, banner: renderBannerView, visuals: renderVisualsView, images: renderImages, veille: renderVeille, study: renderStudy, settings: renderSettings }[ui.view] || renderCreate)();
  enhanceVoice(view);
  renderDrawer();
}

// ================= CRÉER =================
const STUDIO_TOOLS = [['chat', 'Améliorer', 'Critique, discute : l’IA corrige et retient.', 'pen'], ['visual', 'Visuel', 'Ajoute un visuel, une image ou un carrousel.', 'image'], ['hooks', 'Hooks', 'Compare les accroches et leurs notes.', 'hook'], ['quality', 'Qualité', 'Repère les points à retravailler.', 'search'], ['retouch', 'Retouches', 'Ajuste le rythme, le ton ou la longueur.', 'spark']];
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
          ${active ? `<div class="row between"><span class="row" style="gap:8px"><span class="badge s-${active.status}">${STATUS[active.status]}</span><span class="small">${active.scheduledAt ? '📅 ' + fmtDate(active.scheduledAt) : 'Sans date'}</span></span><button class="btn ghost sm" data-action="post-detail" data-id="${active.id}">Aperçu et publication →</button></div>
            ${postEditor(active)}
            ${postMediaPreview(active)}
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
          ${active ? `<div class="tool-tabs" role="tablist">${STUDIO_TOOLS.map(([key, label, , glyph]) => `<button class="tool-tab ${(ui.tools || 'chat') === key ? 'on' : ''}" role="tab" aria-selected="${(ui.tools || 'chat') === key}" data-action="studio-tool" data-id="${key}">${ICONS[glyph]}<span>${label}</span></button>`).join('')}</div>
            ${({ chat: chatPanel, visual: visualPanel, hooks: hooksPanel, quality: qualityPanel, retouch: retouchPanel }[ui.tools] || chatPanel)(active)}`
            : STUDIO_TOOLS.map(([key, label, hint, glyph]) => `<button class="tool-option" disabled><span class="tool-icon">${ICONS[glyph]}</span><span><strong>${label}</strong><small>${hint}</small></span><span aria-hidden="true">›</span></button>`).join('') + '<div class="tool-note">Les outils s’activent dès que tu ouvres un brouillon enregistré.</div>'}
        </div>
      </aside>
    </div>
  </div>`;
  $('.brief-options').addEventListener('toggle', (event) => { ui.advanced = event.currentTarget.open; });
  $('.chat-box .memory')?.addEventListener('toggle', (event) => { ui.memoryOpen = event.currentTarget.open; });
  scrollChat();
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
    brief: { personaId: ui.personaId, objective: ui.objective, awareness: ui.awareness, topic: ui.instruction, ideaId: ui.ideaId, pillar: ui.hookDev?.pillar || ui.pillar || '', hook: ui.hookDev?.hook || '', hookId: ui.hookDev?.hookId || '' },
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
      if (!job.hooksDone && brief.hook) job.hooksDone = true; // hook choisi par l'auteur : on le garde
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
const inspirationImages = (niche, category = 'image') => ui.data.images.filter((im) => im.kind === 'inspiration' && sameNiche(im.niche, niche) && (im.category || 'image') === category);

// Bloc « Inspirations » réutilisé dans Visuels, Bannière et Photothèque. Accepte images et PDF (carrousels).
const INSP = {
  visual: { title: '🎨 Inspirations : visuels et carrousels concurrents', hint: "Ajoute des captures ou des PDF de carrousels qui marchent dans la niche. L'IA analyse leur structure, leur densité de texte et leur style, et s'en inspire pour tes visuels (sans copier)." },
  banner: { title: '🎨 Inspirations : bannières concurrentes', hint: "Ajoute des captures de bannières qui te plaisent. L'IA analyse leur construction (preuve sociale, promesse, appel à l'action, décor) et s'en inspire pour proposer tes textes." },
  image: { title: '🎨 Style des images générées', hint: "Captures d'images de posts concurrents : l'IA en retient le style (cadrage, couleurs, ambiance) pour les images qu'elle génère." },
};
function inspirationsCard(category, { compact = false } = {}) {
  const niche = currentNiche();
  const list = inspirationImages(niche, category);
  const j = ui.job?.kind === 'upload' ? ui.job : null;
  return `<div class="card stack">
    <div class="row between"><h3 style="margin:0">${INSP[category].title} · ${esc(niche || 'sans niche')} (${list.length})</h3>
      <label class="btn primary">+ Ajouter (images ou PDF)<input type="file" accept="image/*,application/pdf" multiple data-library="inspiration" data-category="${category}" hidden></label></div>
    <p class="small" style="margin:0">${INSP[category].hint} Partagé avec tous les clients de la niche.</p>
    ${!compact && allNiches().length > 1 ? nicheChips(ui.data.images.filter((im) => im.kind === 'inspiration' && (im.category || 'image') === category)) : ''}
    ${j ? `<div class="row"><div class="progress"><span style="width:${Math.round((100 * j.done) / j.total)}%"></span></div><span class="small">${esc(j.step)}</span></div>` : ''}
    ${list.length ? `<div class="img-grid">${list.map((im) => `
      <figure class="img-card">
        <div class="insp-thumb"><img src="/uploads/${esc(im.key)}" alt="" loading="lazy">${im.pages?.length > 1 ? `<span class="insp-pages">📄 ${im.pages.length} pages</span>` : ''}</div>
        ${im.pages?.length > 1 ? `<details><summary class="small" style="cursor:pointer;padding:0 8px">Voir les pages</summary><div class="thumbs" style="padding:6px 8px">${im.pages.map((k) => `<a href="/uploads/${esc(k)}" target="_blank" rel="noopener" class="thumb"><img src="/uploads/${esc(k)}" alt=""></a>`).join('')}</div></details>` : ''}
        <figcaption>
          <textarea rows="4" data-imgdesc="${im.id}" placeholder="Analyse de l'IA (modifiable)" data-novoice>${esc(im.description)}</textarea>
          <div class="row between"><span class="small">${esc(im.fileName || '')}</span><button class="btn ghost sm danger" data-action="del-image" data-id="${im.id}" title="Supprimer">🗑</button></div>
        </figcaption>
      </figure>`).join('')}</div>` : '<p class="empty">Aucune inspiration pour l\'instant.</p>'}
  </div>`;
}

// PDF → images (une par page, 10 max), avec la bibliothèque PDF de Mozilla intégrée à l'app.
async function pdfToImages(file, max = 10) {
  const pdfjs = await import('/vendor/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.min.mjs';
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const out = [];
  for (let i = 1; i <= Math.min(doc.numPages, max); i++) {
    const page = await doc.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale: Math.min(2, 1080 / base.width) });
    const cv = document.createElement('canvas');
    cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
    await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
    out.push(cv.toDataURL('image/jpeg', 0.82));
  }
  return out;
}

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

const DA_DEFAULT = { colors: ['#0E6B4A', '#14231C'], backgrounds: ['clair', 'fonce', 'couleur'] };
const daOf = (c = client()) => ({ ...DA_DEFAULT, ...(c?.adn?.da || {}) });
const SAMPLE_SPEC = { type: 'liste', title: 'Les *3 règles* d\'un bon post', subtitle: 'Aperçu de ta direction artistique', items: [{ t: 'Une seule idée', d: 'Tirée d\'une vraie question client' }, { t: 'Un hook court', d: 'Compris en une seconde' }, { t: 'Une vraie fin', d: 'Une question, pas une vente' }] };
function renderImages() {
  const c = client();
  const niche = currentNiche();
  const da = ui.daDraft || daOf(c);
  const j = ui.job?.kind === 'upload' ? ui.job : null;
  const lane = (category, title, hint) => {
    const list = inspirationImages(niche, category);
    return `<section class="card stack vis-lane" data-dropcat="${category}">
      <div class="row between"><h3 style="margin:0">${title} (${list.length})</h3><label class="btn primary sm">+ Ajouter<input type="file" accept="image/*,application/pdf" multiple data-library="inspiration" data-category="${category}" hidden></label></div>
      <div class="dropzone">⬇ Glisse-dépose ici tes ${hint}<br><span class="small">PNG, JPG ou PDF · l'IA analyse leur forme et leur style</span></div>
      ${list.length ? `<div class="img-grid">${list.map((im) => `
        <figure class="img-card">
          <div class="insp-thumb"><img src="/uploads/${esc(im.key)}" alt="" loading="lazy">${im.pages?.length > 1 ? `<span class="insp-pages">📄 ${im.pages.length} pages</span>` : ''}</div>
          <figcaption><details><summary class="small" style="cursor:pointer">Ce que l'IA en retient</summary><textarea rows="4" data-imgdesc="${im.id}" data-novoice>${esc(im.description)}</textarea></details>
            <div class="row between"><span class="small">${esc(im.fileName || '')}</span><button class="btn ghost sm danger" data-action="del-image" data-id="${im.id}" title="Supprimer">🗑</button></div></figcaption>
        </figure>`).join('')}</div>` : ''}
    </section>`;
  };
  view.innerHTML = `
  <header class="page-heading"><div><div class="eyebrow">VISUELS</div><h1>Visuels de ${esc(c.name)}</h1><p>Une direction artistique par profil : mêmes couleurs, même forme, et seul le fond change d'un visuel à l'autre. Les visuels concurrents servent d'inspiration pour la forme.</p></div></header>
  ${j ? `<div class="row" style="margin-bottom:12px"><div class="progress"><span style="width:${Math.round((100 * j.done) / j.total)}%"></span></div><span class="small">${esc(j.step)}</span></div>` : ''}
  <section class="card stack">
    <div class="row between"><h3 style="margin:0">🎨 Direction artistique (DA)</h3><button class="btn primary sm" data-action="da-save" ${ui.daDraft ? '' : 'disabled'}>Enregistrer la DA</button></div>
    <p class="small" style="margin:0">2 couleurs, 3 au maximum. Elles servent à tous les visuels de ${esc(c.name)} créés dans l'Atelier.</p>
    <div class="row da-colors">${[0, 1, 2].map((i) => `<label class="da-color"><input type="color" data-da-color="${i}" value="${da.colors[i] || '#cccccc'}" ${i === 2 && !da.colors[2] ? 'data-empty="1"' : ''}><span>${['Couleur principale', 'Couleur 2', 'Couleur 3 (option)'][i]}</span>${i === 2 && da.colors[2] ? '<button class="btn ghost sm" data-action="da-drop3">✕</button>' : ''}</label>`).join('')}</div>
    <div class="f">Fonds utilisés à tour de rôle
      <div class="chips">${Object.entries(Vis.DA_BACKGROUNDS).map(([k, l]) => `<button class="chip ${da.backgrounds.includes(k) ? 'on' : ''}" data-action="da-bg" data-id="${k}">${l}</button>`).join('')}</div></div>
    <div class="da-previews">${Object.keys(Vis.DA_BACKGROUNDS).map((k) => `<canvas class="da-prev ${da.backgrounds.includes(k) ? '' : 'off'}" data-da-prev="${k}" aria-label="Aperçu ${Vis.DA_BACKGROUNDS[k]}"></canvas>`).join('')}</div>
  </section>
  <div class="vis-lanes">
    ${lane('carousel', '📑 Carrousels concurrents', 'carrousels (PDF ou captures)')}
    ${lane('visual', '🖼 Visuels concurrents', 'visuels (schémas, listes, comparatifs…)')}
  </div>`;
  for (const cv of view.querySelectorAll('[data-da-prev]')) Vis.renderVisual(cv, { kind: 'image', format: 'portrait', spec: SAMPLE_SPEC, style: { da, variant: cv.dataset.daPrev }, author: c.name });
}

// ================= POSTS =================
function renderPosts() {
  const posts = clientPosts();
  const by = (s) => posts.filter((p) => (s === 'review' ? ['review', 'draft', 'rejected'].includes(p.status) : p.status === s));
  const tabs = [['review', 'À valider'], ['approved', 'Programmés'], ['published', 'Publiés'], ['all', 'Tous']];
  const shown = ui.filter === 'all' ? posts : by(ui.filter);
  for (const id of [...ui.selected]) if (!shown.some((p) => p.id === id)) ui.selected.delete(id); // la sélection suit le filtre affiché
  const selCount = ui.selected.size;
  view.innerHTML = `
    <div class="row between" style="margin-bottom:16px">
      <div class="page-heading"><div><div class="eyebrow">SUIVI ÉDITORIAL</div><h1>Posts</h1><p>Relis, ajuste et valide les posts de ton client.</p></div></div>
      ${by('review').length ? `<button class="btn primary" data-action="approve-all">✓ Tout valider (${by('review').length})</button>` : ''}
    </div>
    ${ui.filter === 'approved' ? `<div class="alert ok" style="margin-bottom:12px">Les posts programmés restent dans l'app et sont publiés sur LinkedIn à l'heure prévue (vérification toutes les 15 minutes). C'est normal qu'ils n'apparaissent pas dans les « posts programmés » de LinkedIn : ils y arrivent directement, publiés, au bon moment.</div>` : ''}
    <div class="chips" style="margin-bottom:16px">${tabs.map(([k, l]) => `<button class="chip ${ui.filter === k ? 'on' : ''}" data-action="filter" data-id="${k}">${l}<b>${k === 'all' ? posts.length : by(k).length}</b></button>`).join('')}</div>
    ${shown.length ? `<div class="bulk-bar">
      <label class="bulk-all"><input type="checkbox" data-select-all ${shown.every((p) => ui.selected.has(p.id)) ? 'checked' : ''}> Tout sélectionner (${shown.length})</label>
      ${selCount ? `<span class="small"><b>${selCount}</b> sélectionné${selCount > 1 ? 's' : ''}</span>
        <button class="btn danger sm" data-action="bulk-delete">🗑 Supprimer la sélection</button>
        <button class="btn ghost sm" data-action="bulk-clear">Annuler</button>` : '<span class="small">Coche des posts pour les supprimer en une fois.</span>'}
    </div>` : ''}
    ${shown.length ? shown.map((post) => postCard(post)).join('') : '<div class="card empty">Aucun post ici. <a href="#" data-action="go" data-id="atelier">Créer un post</a></div>'}`;
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
  <article class="post ${detail ? 'post-detail' : 'post-summary'} ${!detail && ui.selected.has(p.id) ? 'selected' : ''}" ${detail ? '' : `id="${p.id}"`}>
    <div>
      ${detail ? '' : `<label class="post-check" title="Sélectionner"><input type="checkbox" data-select="${p.id}" ${ui.selected.has(p.id) ? 'checked' : ''} aria-label="Sélectionner ce post"></label>`}
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

const PILLAR_NAMES = { authenticite: 'Authenticité', valeur: 'Valeur', routine: 'Routine' };
const pillarTag = (k) => (PILLAR_NAMES[k] ? `<span class="pillar p-${k}">${PILLAR_NAMES[k]}</span>` : '');
function renderCalendar() {
  const posts = clientPosts();
  const filters = [['all', 'Tous'], ['review', 'À valider'], ['approved', 'Programmés'], ['published', 'Publiés']];
  const f = filters.some(([k]) => k === ui.filter) ? ui.filter : 'all';
  const shown = (f === 'all' ? posts : posts.filter((p) => (f === 'review' ? ['review', 'draft', 'rejected'].includes(p.status) : p.status === f)))
    .slice().sort((a, b) => String(a.scheduledAt || a.publishedAt || '9').localeCompare(String(b.scheduledAt || b.publishedAt || '9')));
  for (const id of [...ui.selected]) if (!shown.some((p) => p.id === id)) ui.selected.delete(id);
  const sel = ui.selected.size;
  const counts = Object.fromEntries(Object.keys(PILLAR_NAMES).map((k) => [k, posts.filter((p) => p.pillar === k && p.status !== 'published').length]));
  view.innerHTML = `<header class="page-heading"><div><div class="eyebrow">SUIVI ÉDITORIAL</div><h1>Calendrier</h1><p>Tous les posts à gauche, le calendrier à droite. Clique sur un post pour le modifier, glisse-le dans le calendrier pour changer sa date.</p></div>
    <div class="row heading-actions"><span class="small">À venir : ${Object.entries(counts).map(([k, n]) => `${pillarTag(k)} ${n}`).join(' · ')}</span>
      ${(() => { const n = posts.filter((p) => ['review', 'approved', 'draft'].includes(p.status) && !p.image && !p.document).length; const j = ui.job?.kind === 'visuals-auto' ? ui.job : null; return j ? `<span class="small"><b>${esc(j.step)}</b></span>` : n ? `<button class="btn soft sm" data-action="visuals-auto" title="L'agent choisit un modèle et crée le visuel de chaque post qui n'en a pas (environ 0,20 € par visuel)">🤖 Visuels auto pour ${n} post${n > 1 ? 's' : ''}</button>` : ''; })()}</div></header>
  <div class="cal-split">
    <aside class="cal-list card">
      <div class="chips">${filters.map(([k, l]) => `<button class="chip ${f === k ? 'on' : ''}" data-action="filter" data-id="${k}">${l}</button>`).join('')}</div>
      <div class="row between bulk-bar ${sel ? 'on' : ''}">
        <label class="small"><input type="checkbox" data-select-all ${shown.length && shown.every((p) => ui.selected.has(p.id)) ? 'checked' : ''}> Tout (${shown.length})</label>
        ${sel ? `<span class="row"><button class="btn danger sm" data-action="bulk-delete">🗑 Supprimer (${sel})</button><button class="btn ghost sm" data-action="bulk-clear">Annuler</button></span>` : ''}
      </div>
      <div class="cal-items">${shown.length ? shown.map((p) => `
        <div class="cal-item ${ui.selected.has(p.id) ? 'selected' : ''}">
          <input type="checkbox" data-select="${p.id}" ${ui.selected.has(p.id) ? 'checked' : ''} aria-label="Sélectionner">
          <button class="cal-open" data-action="post-detail" data-id="${p.id}">
            <span class="row" style="gap:6px"><span class="badge s-${p.status}">${STATUS[p.status]}</span>${pillarTag(p.pillar)}<span class="small">${p.publishedAt ? fmtDate(p.publishedAt) : p.scheduledAt ? fmtDate(p.scheduledAt) : 'Sans date'}</span></span>
            <span class="cal-title">${esc((p.text || '').split('\n')[0].slice(0, 110) || 'Post vide')}</span>
            ${p.error ? `<span class="small" style="color:var(--danger, #B42318)">⚠️ ${esc(p.error.slice(0, 90))}</span>` : ''}
          </button>
          ${p.status !== 'published' ? `<button class="btn ghost sm" data-action="open-atelier" data-id="${p.id}" title="Ouvrir dans l'Atelier">✎</button>` : ''}
        </div>`).join('') : '<p class="empty">Aucun post ici.</p>'}</div>
    </aside>
    <div class="cal-main">${calendarMarkup({ posts, cursor: ui.calCursor, mode: ui.calMode, statuses: STATUS, esc })}</div>
  </div>`;
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

// ---------- Studio : visuel du post ----------
function postMediaPreview(p) {
  if (!p.image && !p.document) return `<button class="media-empty" data-action="studio-tool" data-id="visual">${ICONS.image}<span><b>Ajouter un visuel</b> · schéma, image ou carrousel</span></button>`;
  return `<div class="media-preview">
    ${p.image ? `<img src="/uploads/${esc(p.image)}" alt="${esc(p.altText || '')}">` : ''}
    <div class="row between"><span class="small">${p.document ? `📎 Carrousel PDF attaché (${esc(p.documentTitle || 'document')}) : publié en document` : '🖼 Image attachée : publiée avec le post'}</span>
      <span class="row"><button class="btn ghost sm" data-action="studio-tool" data-id="visual">Changer</button><button class="btn ghost sm danger" data-action="remove-image" data-id="${p.id}">Retirer</button></span></div>
  </div>`;
}

const VIS_FOR_POST = [['auto', '✨ Auto'], ['liste', 'Liste'], ['process', 'Étapes'], ['comparaison', 'Avant / après'], ['matrice', 'Matrice'], ['citation', 'Citation'], ['carousel', 'Carrousel PDF']];
function visualPanel(p) {
  const photos = myPhotos();
  const others = visualsOf().filter((v) => v.postId !== p.id).slice(0, 12);
  const mine = visualsOf().find((v) => v.postId === p.id);
  const busy = ui.job?.kind === 'post-visual' && ui.job.id === p.id;
  return `<div class="inline-box stack">
    <b>🎨 Visuel à valeur tiré du post</b>
    <p class="small" style="margin:0">L'IA lit le post et en fait un schéma aux couleurs de la DA de ${esc(client().name)} (<a href="#" data-action="go" data-id="images">modifier</a>). Il est attaché au post et publié avec lui.</p>
    <div class="row small">Fond : ${[['', 'À tour de rôle'], ...Object.entries(Vis.DA_BACKGROUNDS)].map(([k, l]) => `<button class="chip sm ${(ui.postVisBg || '') === k ? 'on' : ''}" data-action="post-vis-bg" data-id="${k}">${l.replace('Fond ', '')}</button>`).join('')}</div>
    <div class="chips">${VIS_FOR_POST.map(([k, l]) => `<button class="chip ${(ui.postVisType || 'auto') === k ? 'on' : ''}" data-action="post-vis-type" data-id="${k}">${l}</button>`).join('')}</div>
    <button class="btn primary sm" data-action="post-visual" data-id="${p.id}" ${busy || !ui.data.settings.hasOpenaiKey ? 'disabled' : ''}>${busy ? esc(ui.job.step) : p.image || p.document ? '↻ Créer un nouveau visuel' : '✨ Créer le visuel'}</button>
    ${mine ? `<button class="btn ghost sm" data-action="post-vis-edit" data-id="${mine.id}">✎ Modifier les textes du visuel (onglet Visuels)</button>` : ''}
    <details class="more" ${ui.visMoreOpen ? 'open' : ''}><summary class="small"><b>Autres options</b> : photo, image IA, import, visuel déjà créé</summary><div class="stack" style="margin-top:8px">
    <b>📸 Photo ou image</b>
    <div class="row">
      ${photos.length ? `<button class="btn soft sm" data-action="img-auto" data-id="${p.id}">📸 Meilleure photo</button>` : ''}
      <button class="btn soft sm" data-action="img-ai" data-id="${p.id}">✨ Image IA</button>
      <label class="btn sm">⬆ Importer une image<input type="file" accept="image/*" data-upload="${p.id}" hidden></label>
    </div>
    ${photos.length ? `<div class="thumbs">${photos.map((im) => `<button class="thumb ${p.imageId === im.id ? 'on' : ''}" data-action="img-pick" data-id="${p.id}" data-img="${im.id}" title="${esc(im.description)}"><img src="/uploads/${esc(im.key)}" alt=""></button>`).join('')}</div>` : ''}
    ${others.length ? `<hr class="sep"><b>📎 Rattacher un visuel déjà créé</b>
      <div class="stack" style="gap:6px">${others.map((v) => `<button class="vis-pick" data-action="post-link-visual" data-id="${p.id}" data-vis="${v.id}"><span class="tag">${v.kind === 'carousel' ? 'Carrousel' : esc(v.spec?.type || 'visuel')}</span> ${esc(v.subtopic || v.subject || 'Visuel')}${v.postId ? ' <span class="small">(lié à un autre post)</span>' : ''}</button>`).join('')}</div>` : ''}
    </div></details>
  </div>`;
}

// ---------- Apprendre à l'IA : hooks aimés, posts aimés, critiques ----------
function teachCard(c, { open = true } = {}) {
  const liked = (c.adn?.hookBank || []).filter((h) => h.status === 'liked').length;
  const posts = c.adn?.likedPosts || [];
  const lessons = c.adn?.lessons || [];
  return `<details class="card teach" ${open ? 'open' : ''}><summary><b>🎓 Apprendre à l'IA</b> <span class="small">${liked} hooks aimés · ${posts.length} posts aimés · ${lessons.length} critiques retenues</span></summary>
    <div class="stack" style="margin-top:10px">
      <p class="small" style="margin:0">Colle ici ce que ChatGPT (tes GPT Linka) ou d'autres te donnent de bien, et ce qui ne te plaît pas. C'est le levier le plus fort : l'IA s'en sert à chaque hook et à chaque post de ${esc(c.name)}.</p>
      <label class="f">👍 Hooks qui me plaisent <span class="small">(un par ligne)</span><textarea id="teachHooks" rows="5" placeholder="Un hook par ligne"></textarea></label>
      <label class="f">📄 Posts qui me plaisent <span class="small">(sépare les posts par une ligne --- )</span><textarea id="teachPosts" rows="5"></textarea></label>
      <label class="f">✍️ Mes critiques <span class="small">(une par ligne : ce qui ne va pas dans les hooks ou les posts)</span><textarea id="teachCritiques" rows="4" placeholder="Ex. trop de questions rhétoriques"></textarea></label>
      <div class="row between"><span class="small">Les critiques rejoignent la mémoire (post-it jaune de l'Atelier).</span><button class="btn primary" data-action="teach-save">Enregistrer</button></div>
      ${posts.length ? `<details><summary class="small" style="cursor:pointer">Posts aimés enregistrés (${posts.length})</summary><div class="stack" style="gap:6px;margin-top:6px">${posts.slice().reverse().map((x) => `<div class="row between vitem"><span class="small">${esc(x.text.split('\n')[0].slice(0, 110))}</span><button class="btn ghost sm danger" data-action="liked-post-del" data-id="${x.id}">🗑</button></div>`).join('')}</div></details>` : ''}
      ${lessons.length ? `<details><summary class="small" style="cursor:pointer">Critiques retenues (${lessons.length})</summary><div class="stack" style="gap:4px;margin-top:6px">${lessons.slice().reverse().map((l) => `<div class="row between vitem"><span class="small">${esc(l.text)}</span><button class="btn ghost sm danger" data-action="lesson-del" data-id="${l.id}">✕</button></div>`).join('')}</div></details>` : ''}
    </div></details>`;
}

// ================= HOOKS : l'IA propose, tu gardes, on développe =================
function renderHookBank() {
  const c = client();
  const bank = c.adn?.hookBank || [];
  const kept = bank.filter((h) => h.status === 'liked' && (!ui.hookPillar || h.pillar === ui.hookPillar));
  const used = bank.filter((h) => h.status === 'used');
  const ideas = (ui.hookIdeas || []).filter((h) => !bank.some((b) => b.text === h.text));
  const busy = ui.job?.kind === 'hooks';
  const creating = ui.job?.kind === 'create' ? ui.job : null;
  view.innerHTML = `
  <header class="page-heading"><div><div class="eyebrow">HOOKS</div><h1>Banque de hooks</h1><p>L'IA propose plein de lignes de hook. Tu gardes celles qui te plaisent (👍) et tu écartes les autres (✕). Elle apprend ton goût. Ensuite, un clic pour développer un post.</p></div></header>
  ${teachCard(c)}
  <section class="card stack">
    <div class="chips">${[['', 'Les 3 catégories'], ...Object.entries(PILLAR_NAMES)].map(([k, l]) => `<button class="chip ${(ui.hookPillar || '') === k ? 'on' : ''}" data-action="hook-pillar" data-id="${k}">${l}</button>`).join('')}</div>
    <p class="small" style="margin:0"><b>Authenticité</b> : coulisses, vécu, erreurs, convictions. <b>Valeur</b> : conseil actionnable, méthode. <b>Routine</b> : ton quotidien, tes habitudes de travail. Jamais de post de vente.</p>
    <div class="row"><input id="hookTopic" placeholder="Sujet (facultatif) : ex. la peur de publier" value="${esc(ui.hookTopic || '')}" style="flex:1;min-width:200px">
      <button class="btn primary" data-action="hook-ideas" ${busy || !ui.data.settings.hasOpenaiKey ? 'disabled' : ''}>${busy ? 'Écriture des hooks…' : '✨ Proposer 20 hooks'}</button></div>
  </section>
  ${ideas.length ? `<section class="card stack"><h3 style="margin:0">Propositions (${ideas.length})</h3>
    <div class="hk-list">${ideas.map((h, i) => `<div class="hk-row"><div><div class="hk-text">${esc(h.text)}</div><div class="small">${pillarTag(h.pillar)} ${esc(h.idea || '')}</div></div>
      <span class="row" style="gap:4px;flex:none"><button class="btn soft sm" data-action="hook-keep" data-id="${i}" title="Je garde">👍</button><button class="btn ghost sm" data-action="hook-reject" data-id="${i}" title="Écarter">✕</button></span></div>`).join('')}</div></section>` : ''}
  <section class="card stack"><h3 style="margin:0">👍 Mes hooks gardés (${kept.length})</h3>
    ${creating ? `<div class="row"><div class="progress"><span style="width:${Math.round((100 * creating.done) / creating.total)}%"></span></div><span class="small">${esc(creating.step)}</span></div>` : ''}
    ${kept.length ? `<div class="hk-list">${kept.slice().reverse().map((h) => `<div class="hk-row"><div><div class="hk-text">${esc(h.text)}</div><div class="small">${pillarTag(h.pillar)} ${esc(h.idea || '')}</div></div>
      <span class="row" style="gap:4px;flex:none"><button class="btn primary sm" data-action="hook-develop" data-id="${h.id}" ${ui.job && !ui.job.finished ? 'disabled' : ''}>✍️ Développer en post</button><button class="btn ghost sm danger" data-action="hook-del" data-id="${h.id}" title="Retirer">🗑</button></span></div>`).join('')}</div>`
      : '<p class="empty">Garde des hooks parmi les propositions : ils arrivent ici.</p>'}
  </section>
  ${used.length ? `<details class="card"><summary class="small" style="cursor:pointer">Déjà développés (${used.length})</summary><div class="hk-list" style="margin-top:8px">${used.slice().reverse().map((h) => `<div class="hk-row"><div class="hk-text">${esc(h.text)}</div>${h.postId ? `<button class="btn ghost sm" data-action="open-atelier" data-id="${h.postId}">Voir le post →</button>` : ''}</div>`).join('')}</div></details>` : ''}`;
}

// ================= ATELIER : un post de gauche à droite (post → critique → visuel → publication) =================
const ARROW = '<div class="at-arrow" aria-hidden="true"><svg viewBox="0 0 40 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h34M28 5l8 7-8 7"/></svg></div>';
const whenLetters = (iso) => {
  if (!iso) return { text: 'Sans date : choisis-en une', warn: true };
  const d = new Date(iso);
  const days = Math.round((d - Date.now()) / 864e5);
  if (d < Date.now()) return { text: '⚠️ Date passée : le post partira dans les 15 minutes après validation', warn: true };
  return { text: `📅 Partira le ${d.toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })}${days > 14 ? ` (dans ${days} jours)` : ''}`, warn: days > 14 };
};
function atelierPosts() {
  return clientPosts().filter((p) => p.status !== 'published').sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}
const STEPS = [['hook', 'Hook'], ['post', 'Post'], ['visual', 'Visuel'], ['publish', 'Publication']];
function atelierStage(p) {
  if (!p) return 'hook';
  if (ui.atStep?.[p.id]) return ui.atStep[p.id];
  if (p.status === 'approved' || p.status === 'published') return 'publish';
  return STEPS.some(([k]) => k === p.stage) ? p.stage : 'post';
}
function renderAtelier() {
  const c = client();
  const list = atelierPosts();
  const p = list.find((x) => x.id === ui.studioPost) || null;
  const stage = atelierStage(p);
  const idx = STEPS.findIndex(([k]) => k === stage);
  const stepper = `<ol class="at-steps">${STEPS.map(([k, l], i) => `<li class="${i < idx ? 'done' : i === idx ? 'on' : ''}"><button ${p || k === 'hook' ? '' : 'disabled'} data-action="at-step" data-id="${k}"><span class="at-step">${i < idx ? '✓' : i + 1}</span>${l}</button></li>${i < STEPS.length - 1 ? '<li class="at-sep" aria-hidden="true">→</li>' : ''}`).join('')}</ol>`;
  const picker = `<label class="row small at-picker">Post en cours <select id="studioDraft" aria-label="Choisir un post"><option value="">➕ Nouveau post</option>${list.map((x) => `<option value="${esc(x.id)}" ${x === p ? 'selected' : ''}>${x.status === 'approved' ? '📅 ' : ''}${esc((x.text.split('\n')[0] || x.theme || '').slice(0, 60))}</option>`).join('')}</select></label>`;
  const body = { hook: atHookStep, post: atPostStep, visual: atVisualStep, publish: atPublishStep }[stage](p, c);
  view.innerHTML = `
  <header class="page-heading"><div><div class="eyebrow">ATELIER</div><h1>${p ? esc((p.text.split('\n')[0] || 'Post').slice(0, 70)) : 'Nouveau post'}</h1><p>Un hook, puis le post, puis le visuel, puis la date. Une étape à la fois.</p></div>
    <div class="row heading-actions">${picker}</div></header>
  ${stepper}
  <div class="at-board at-stage">${body}</div>`;
  const v = p && visualsOf().find((x) => x.id === p.visualId && x.postId === p.id);
  const cv = view.querySelector('canvas[data-vis]');
  if (cv && v) Vis.renderVisual(cv, visCurrent(v), ui.visSlide[v.id] || 0);
  if (ui.canva && $('#canvaEditor')) BE.mountEditor($('#canvaEditor'), ui.canva.doc, { overlay: false, onChange: () => {} });
  scrollChat();
  const vl = $('#visChatLog'); if (vl) vl.scrollTop = vl.scrollHeight;
}

// Étape 1 : choisir (ou trouver) un hook — ou partir d'un post déjà écrit.
function atHookStep(p, c) {
  if (p) return `<div class="at-node at-wide stack"><h3 style="margin:0">Le hook de ce post</h3>${hooksPanel(p)}<div class="row"><button class="btn primary" data-action="at-step" data-id="post">Continuer vers le post →</button></div></div>`;
  const bank = c.adn?.hookBank || [];
  const kept = bank.filter((h) => h.status === 'liked');
  const ideas = (ui.hookIdeas || []).filter((h) => !bank.some((b) => b.text === h.text));
  const busy = ui.job && !ui.job.finished;
  const creating = ui.job?.kind === 'create' ? ui.job : null;
  const manual = ui.manual[c.id] || '';
  const row = (h, act, id) => `<div class="hk-row"><div><div class="hk-text">${esc(h.text)}</div><div class="small">${pillarTag(h.pillar)} ${esc(h.idea || '')}</div></div>
    <span class="row" style="gap:4px;flex:none"><button class="btn primary sm" data-action="${act}" data-id="${id}" ${busy ? 'disabled' : ''}>Choisir ce hook →</button>${act === 'hook-choose' ? `<button class="btn ghost sm" data-action="hook-reject" data-id="${id}" title="Écarter">✕</button>` : ''}</span></div>`;
  return `<div class="at-two">
    <section class="at-node stack">
      <header class="at-head"><span class="at-step">1</span><h3>Choisis ton hook</h3></header>
      ${creating ? `<div class="job-inline small"><div class="progress"><span style="width:${Math.round((100 * creating.done) / creating.total)}%"></span></div><span>${esc(creating.step)}</span></div>` : ''}
      <div class="chips">${[['', 'Les 3 catégories'], ...Object.entries(PILLAR_NAMES)].map(([k, l]) => `<button class="chip ${(ui.hookPillar || '') === k ? 'on' : ''}" data-action="hook-pillar" data-id="${k}">${l}</button>`).join('')}</div>
      <div class="row"><input id="hookTopic" placeholder="Sujet (facultatif)" value="${esc(ui.hookTopic || '')}" style="flex:1;min-width:180px"><button class="btn soft" data-action="hook-ideas" ${busy || !ui.data.settings.hasOpenaiKey ? 'disabled' : ''}>${ui.job?.kind === 'hooks' ? 'Écriture…' : '✨ Proposer des hooks'}</button></div>
      ${ideas.length ? `<div class="hk-list">${ideas.map((h, i) => row(h, 'hook-choose', i)).join('')}</div>` : ''}
      ${kept.length ? `<h4 style="margin:6px 0 0">👍 Mes hooks gardés</h4><div class="hk-list">${kept.slice().reverse().slice(0, 12).map((h) => row(h, 'hook-develop', h.id)).join('')}</div>` : ''}
      ${!ideas.length && !kept.length ? '<p class="small">Clique sur « Proposer des hooks » : l\'IA t\'en écrit une vingtaine, tu choisis celui qui te plaît, et le post s\'écrit à partir de lui.</p>' : ''}
    </section>
    <section class="at-node stack">
      <header class="at-head"><span class="at-step">✎</span><h3>J'ai déjà mon post</h3></header>
      <p class="small" style="margin:0">Colle-le ici : on passe directement au visuel.</p>
      <textarea id="manualDraft" rows="12" maxlength="3000" placeholder="Colle ton post…">${esc(manual)}</textarea>
      <div class="row between"><span class="small" id="manualCount">${manual.length} / 3 000</span>
        <span class="row"><button class="btn sm ghost" data-action="manual-use" data-id="post" ${manual.trim() ? '' : 'disabled'}>Le retravailler d'abord</button><button class="btn primary sm" id="manualSave" data-action="manual-use" data-id="visual" ${manual.trim() ? '' : 'disabled'}>Faire le visuel →</button></span></div>
    </section>
  </div>
  <div style="margin-top:14px">${teachCard(c, { open: false })}</div>`;
}

// Étape 2 : le post + la critique.
function atPostStep(p, c) {
  const lessons = c.adn?.lessons || [];
  return `<div class="at-two">
    <section class="at-node stack">
      <header class="at-head"><span class="at-step">2</span><h3>Le post</h3><span class="row" style="gap:4px">${pillarTag(p.pillar)}<span class="badge s-${p.status}">${STATUS[p.status]}</span></span></header>
      <div class="chips">${Object.entries(PILLAR_NAMES).map(([k, l]) => `<button class="chip sm ${p.pillar === k ? 'on' : ''}" data-action="set-pillar" data-id="${p.id}" data-pillar="${k}">${l}</button>`).join('')}</div>
      ${postEditor(p)}
      ${PLACEHOLDER.test(p.text) ? '<div class="alert warn">Complète les [À COMPLÉTER] avant de valider.</div>' : ''}
      <div class="row between">${p.versions?.length ? `<button class="btn ghost sm" data-action="undo" data-id="${p.id}">↶ Version précédente</button>` : '<span></span>'}
        <button class="btn primary" data-action="at-validate-post" data-id="${p.id}" ${PLACEHOLDER.test(p.text) ? 'disabled' : ''}>✓ Valider le post →</button></div>
    </section>
    <div class="stack">
      <section class="at-node stack">
        <header class="at-head"><span class="at-step">💬</span><h3>Ta critique</h3><span class="small">l'IA corrige et retient</span></header>
        ${chatPanel(p, { sticky: true })}
      </section>
      <aside class="at-sticky"><b>🧠 Ce que l'IA retient pour ${esc(c.name)}</b>
        ${lessons.length ? `<ul>${lessons.slice().reverse().map((l) => `<li><span>${esc(l.text)}</span><span class="row" style="gap:0"><button class="at-x" data-action="lesson-rule" data-id="${l.id}" title="En faire une règle permanente">📌</button><button class="at-x" data-action="lesson-del" data-id="${l.id}" aria-label="Oublier">✕</button></span></li>`).join('')}</ul>` : '<p class="small">Chaque critique générale sera notée ici et appliquée aux prochains posts.</p>'}
      </aside>
      ${teachCard(c, { open: false })}
    </div>
  </div>`;
}

// Étape 3 : visuel ou carrousel DESIGNÉ par l'IA d'images, dans le style d'un visuel concurrent choisi à droite.
function atVisualStep(p, c) {
  const kind = ui.visKind[p.id] || (p.document ? 'carousel' : null);
  if (!kind) return `<div class="at-node at-wide stack at-ask">
    <h3 style="margin:0">Tu veux un visuel avec ce post ?</h3>
    <p class="small" style="margin:0">Tu choisis ensuite un modèle parmi les visuels concurrents de ta base, et l'IA d'images te fait un vrai visuel dans le même style, avec le contenu de ton post.</p>
    <div class="row at-choices"><button class="at-choice" data-action="vis-kind" data-id="image">🖼<b>Un visuel</b><span>1 image qui accroche</span></button>
      <button class="at-choice" data-action="vis-kind" data-id="carousel">📑<b>Un carrousel</b><span>5 pages en PDF</span></button>
      <button class="at-choice" data-action="vis-skip" data-id="${p.id}">✕<b>Pas de visuel</b><span>Texte seul</span></button></div></div>`;
  const dk = kind === 'carousel' ? 'design-carousel' : 'design';
  const v = visualsOf().find((x) => x.id === p.visualId && x.postId === p.id && x.kind === dk);
  const cat = kind === 'carousel' ? 'carousel' : 'visual';
  const refs = inspirationImages(currentNiche(), cat);
  const allRefs = refs.length ? refs : ui.data.images.filter((im) => im.kind === 'inspiration' && im.category === cat);
  const busy = ui.job?.kind === 'post-visual' && ui.job.id === p.id;
  const total = v ? (kind === 'carousel' ? (v.brief?.slides || []).length || v.images.length : 1) : 0;
  const page = v ? Math.min(ui.visSlide[v.id] || 0, total - 1) : 0;
  const key = v?.images?.[page];
  const br = v?.brief || {};
  const colors = v?.colors?.length ? v.colors : daOf(c).colors;
  const fields = !v ? '' : kind === 'carousel'
    ? `${(br.slides || []).map((sl, i) => i === page ? `<label class="f">Titre de la page ${i + 1}<input data-brief="slides.${i}.title" value="${esc(sl.title || '')}"></label><label class="f">Texte<input data-brief="slides.${i}.text" value="${esc(sl.text || '')}"></label>` : '').join('')}`
    : `<label class="f">Titre (hook du visuel)<input data-brief="title" value="${esc(br.title || '')}"></label>
       <label class="f">Mots surlignés (séparés par des virgules)<input data-brief="highlight" value="${esc((br.highlight || []).join(', '))}"></label>
       <label class="f">Sous-titre<input data-brief="subtitle" value="${esc(br.subtitle || '')}"></label>
       ${(br.points || []).map((pt, i) => `<div class="grid2"><label class="f">Point ${i + 1}<input data-brief="points.${i}.t" value="${esc(pt.t || '')}"></label><label class="f">Détail<input data-brief="points.${i}.d" value="${esc(pt.d || '')}"></label></div>`).join('')}
       <label class="f">Appel à réagir<input data-brief="cta" value="${esc(br.cta || '')}"></label>`;
  if (v && ui.canva?.vid === v.id) return canvaEditor(v);
  const work = busy ? `<div class="at-empty"><b>${esc(ui.job.step)}</b><br><span class="small">L'IA d'images dessine ton visuel : compte 1 à 2 minutes${kind === 'carousel' ? ' par page' : ''}.</span></div>`
    : !v ? `<div class="at-empty"><b>👉 Clique sur un modèle à droite</b><br><span class="small">L'IA reprend son style (fond, typo, surlignage, icônes) et y met le contenu de ton post, avec un titre qui accroche.</span></div>`
    : `<div class="at-canvas-wrap">${key ? `<img class="at-design" src="/uploads/${esc(key)}" alt="Visuel généré">` : `<div class="at-empty">Page ${page + 1} en cours de création…</div>`}
        ${total > 1 ? `<div class="row" style="justify-content:center"><button class="btn sm" data-action="design-slide" data-id="${v.id}" data-d="-1">‹</button><span class="small">Page ${page + 1} / ${total}</span><button class="btn sm" data-action="design-slide" data-id="${v.id}" data-d="1">›</button></div>` : ''}
        <span class="row">${key ? `<button class="btn soft sm" data-action="canva-open" data-id="${v.id}">✏️ Modifier comme Canva</button>` : ''}${v.history?.some((h) => h.page === page) ? `<button class="btn ghost sm" data-action="design-undo" data-id="${v.id}">↶ Version précédente</button>` : ''}</span></div>
      <div class="vis-chat">
        <div class="chat-log" id="visChatLog">${(v.chat || []).map((m) => `<div class="msg ${m.role === 'user' ? 'me' : 'ai'}">${esc(m.text)}</div>`).join('') || `<div class="small chat-hint">Dis-moi quoi changer${total > 1 ? ' sur cette page' : ''} : « fond plus clair », « surligne en jaune », « ajoute une flèche », « le titre est mal écrit »…</div>`}</div>
        <div class="row"><input id="visMsg" placeholder="Ta demande… (Entrée pour envoyer)" style="flex:1;min-width:0"><button class="btn sm" data-action="design-chat" data-id="${v.id}">Envoyer</button></div>
      </div>
      <div class="row small at-colors">Couleurs : ${[0, 1, 2].map((i) => `<input type="color" data-dcolor="${i}" value="${colors[i] || '#cccccc'}" aria-label="Couleur ${i + 1}">`).join('')}
        <button class="chip sm" data-action="design-da" data-id="${v.id}">Ma DA</button><button class="btn sm" data-action="design-colors" data-id="${v.id}">Appliquer ces couleurs</button></div>
      <details class="more"><summary class="small"><b>✎ Modifier les textes</b></summary><div class="stack" style="margin-top:8px">${fields}<button class="btn sm" data-action="design-texts" data-id="${v.id}">↻ Refaire avec ces textes</button></div></details>
      <div class="row between"><button class="btn ghost sm" data-action="vis-kind" data-id="">← Changer (visuel / carrousel)</button><button class="btn primary" data-action="at-validate-design" data-id="${p.id}" ${v.images.filter(Boolean).length < total ? 'disabled' : ''}>✓ Valider le visuel →</button></div>`;
  return `<div class="at-two at-vis">
    <section class="at-node stack"><header class="at-head"><span class="at-step">3</span><h3>${kind === 'carousel' ? 'Le carrousel' : 'Le visuel'}</h3>${v ? '<span class="small">modifie-le en bas</span>' : ''}</header>${work}</section>
    <aside class="at-node stack"><header class="at-head"><h3>Choisis un modèle</h3><span class="small">${allRefs.length} dans ta base</span></header>
      ${allRefs.length ? `<button class="btn primary sm" data-action="design-from" data-id="${p.id}" data-ref="auto" data-kind="${kind}" ${busy || (ui.job && !ui.job.finished) ? 'disabled' : ''}>🤖 Laisse l'agent choisir et créer</button>` : ''}
      ${allRefs.length ? `<div class="ref-grid">${allRefs.map((im) => `<button class="ref ${v?.refId === im.id ? 'on' : ''}" data-action="design-from" data-id="${p.id}" data-ref="${im.id}" data-kind="${kind}" ${busy || (ui.job && !ui.job.finished) ? 'disabled' : ''} title="${esc((im.description || '').slice(0, 200))}"><img src="/uploads/${esc(im.key)}" alt="" loading="lazy">${im.pages?.length > 1 ? `<span class="insp-pages">${im.pages.length} p.</span>` : ''}</button>`).join('')}</div>`
        : `<p class="small">Aucun ${kind === 'carousel' ? 'carrousel' : 'visuel'} concurrent dans ta base. <a href="#" data-action="go" data-id="images">Ajoute-en dans Visuels</a> (glisser-déposer).</p>`}
      <p class="small" style="margin:0">Chaque création coûte quelques centimes sur ton compte OpenAI.</p>
    </aside>
  </div>`;
}

// Éditeur façon Canva sur un visuel généré : l'image en fond, des calques par-dessus (textes, formes, logos, zones cachées).
function canvaEditor(v) {
  return `<div class="at-node stack" id="canvaEditor">
    <header class="at-head"><span class="at-step">✏️</span><h3>Modifier comme Canva</h3><span class="small">page ${(ui.canva.page || 0) + 1}</span></header>
    <p class="small" style="margin:0">Clique sur un élément pour le modifier, glisse pour le déplacer. Pour changer un texte de l'image : « Cacher une zone » par-dessus (🎯 prend la couleur du fond), puis « Texte ».</p>
    <div class="be-toolbar">
      <button type="button" class="btn sm" data-be-add="text"><b>T</b> Texte</button>
      <button type="button" class="btn sm" data-be-add="pill">◯ Pastille</button>
      <button type="button" class="btn sm" data-be-add="cover">▭ Cacher une zone</button>
      <label class="btn sm">🏷 Logo<input type="file" accept="image/*" data-be-file="logo" hidden></label>
      <label class="btn sm">🖼 Image<input type="file" accept="image/*" data-be-file="image" hidden></label>
      <button type="button" class="btn sm" data-be-add="shape">▭ Forme</button>
      <button type="button" class="btn sm" data-be-add="arrow">⤵ Flèche</button>
      ${['✦', '➜', '✓', '⭐', '🔥', '👉'].map((e) => `<button type="button" class="btn sm ghost" data-be-add="emoji" data-val="${e}">${e}</button>`).join('')}
      <button type="button" class="btn sm ghost" data-be="undo" title="Annuler (Ctrl+Z)">↶</button><button type="button" class="btn sm ghost" data-be="redo">↷</button>
    </div>
    <div class="canva-wrap"><div class="be-stage be-portrait"><canvas id="bannerCanvas" class="banner-canvas" width="1024" height="1536"></canvas><div class="be-overlay"></div></div>
      <div class="be-panel card" style="margin:0"></div></div>
    <div class="row between"><button class="btn ghost" data-action="canva-close">Annuler</button><button class="btn primary" data-action="canva-save" data-id="${v.id}">💾 Enregistrer la modification</button></div>
  </div>`;
}

// Étape 4 : aperçu et date.
function atPublishStep(p, c) {
  const w = whenLetters(p.scheduledAt);
  return `<div class="at-two">
    <section class="at-node stack"><header class="at-head"><span class="at-step">4</span><h3>Aperçu LinkedIn</h3></header>
      <div class="li at-li">
        <div class="li-head"><div class="avatar">${initials(c.name)}</div><div><div class="li-name">${esc(c.linkedin?.name || c.name)}</div><div class="li-sub">${esc(c.company || c.niche || '')}</div></div></div>
        <div class="li-text">${esc(p.text)}</div>
        ${p.image ? `<img class="li-img" src="/uploads/${esc(p.image)}" alt="">` : ''}
        ${p.document ? `<div class="small">📎 Carrousel PDF : ${esc(p.documentTitle || '')}</div>` : ''}
      </div></section>
    <section class="at-node stack"><header class="at-head"><h3>Quand ?</h3></header>
      <label class="f">Date et heure<input type="datetime-local" data-date="${p.id}" value="${toLocalInput(p.scheduledAt)}"></label>
      <div class="at-when ${w.warn ? 'warn' : ''}">${esc(w.text)}</div>
      ${p.error ? `<div class="alert err">${esc(p.error)}</div>` : ''}
      ${!c.linkedin ? '<div class="alert warn">LinkedIn non connecté pour ce client : le post sera prêt mais pas publié.</div>' : ''}
      ${p.status === 'published' ? `<div class="alert">Publié ${fmtDate(p.publishedAt)}</div>` : p.status === 'approved'
        ? `<div class="alert">✓ Programmé. Il partira tout seul à la date indiquée.</div><div class="row"><button class="btn sm" data-action="unapprove" data-id="${p.id}">↩ Retirer de la programmation</button>${c.linkedin ? `<button class="btn soft sm" data-action="publish-now" data-id="${p.id}">Publier maintenant</button>` : ''}</div>`
        : `<button class="btn primary" data-action="approve" data-id="${p.id}" ${PLACEHOLDER.test(p.text) ? 'disabled' : ''}>✓ Programmer</button>`}
      <div class="row between"><button class="btn ghost sm" data-action="at-step" data-id="visual">← Revenir au visuel</button><button class="btn ghost sm" data-action="at-new">➕ Nouveau post</button></div>
    </section>
  </div>`;
}

// ================= MARCHÉ : tout ce que font les concurrents =================
function renderMarche() {
  const niche = currentNiche();
  const items = ui.data.veille.filter((v) => sameNiche(v.niche, niche)).sort((a, b) => engagement(b) - engagement(a));
  const j = ui.job?.kind === 'paste' ? ui.job : null;
  view.innerHTML = `
  <header class="page-heading"><div><div class="eyebrow">MARCHÉ CONCURRENTIEL</div><h1>Ce que font les concurrents · ${esc(niche || 'sans niche')}</h1><p>Tu déposes ici, l'IA analyse ce qui marche, et l'Atelier s'en sert.</p></div>
    <div class="row heading-actions"><button class="btn" data-action="go" data-id="atelier">${ICONS.pen} Retour à l'Atelier</button></div></header>
  ${allNiches().length > 1 ? nicheChips() : ''}
  <div class="mk-lanes">
    <section class="mk-lane">
      <div class="card stack">
        <h3 style="margin:0">✍️ Posts concurrents (${items.length})</h3>
        <p class="small" style="margin:0">Copie des posts depuis LinkedIn, avec les likes et commentaires. Sert à écrire les posts et à noter les hooks (Atelier, étapes 1 et 2).</p>
        <input id="pasteNiche" type="hidden" value="${esc(niche)}">
        <textarea id="pasteText" rows="6" placeholder="Colle un ou plusieurs posts, ou toute la page Activité d'un profil" data-novoice></textarea>
        ${j ? `<div class="row"><div class="progress"><span style="width:${Math.round((100 * j.done) / j.total)}%"></span></div><span class="small">${esc(j.step)}</span></div>` : ''}
        <button class="btn primary" data-action="paste" ${ui.job && !ui.job.finished ? 'disabled' : ''}>Analyser</button>
        ${items.length ? `<div class="stack" style="gap:8px">${items.slice(0, 6).map((v) => `<div class="mk-post"><div class="row between small"><b>${esc(v.author || 'Concurrent')}</b><span>${Number(v.likes) || 0} 👍 · ${Number(v.comments) || 0} 💬</span></div><div>${esc((v.hook || v.text || '').split('\n')[0].slice(0, 140))}</div>${v.structure ? `<div class="small mk-learn">L'IA retient : ${esc(v.structure.slice(0, 160))}</div>` : ''}</div>`).join('')}</div>` : '<p class="empty">Aucun post pour l\'instant.</p>'}
        <div class="row"><button class="btn ghost sm" data-action="go" data-id="veille">Toute la veille →</button><button class="btn ghost sm" data-action="go" data-id="study">Étude de marché →</button></div>
      </div>
    </section>
    <section class="mk-lane">${inspirationsCard('visual', { compact: true })}<div class="mk-uses">→ Sert à créer le visuel (Atelier, étape 3)</div></section>
    <section class="mk-lane">${inspirationsCard('banner', { compact: true })}<div class="mk-uses">→ Sert à proposer ta bannière · <a href="#" data-action="go" data-id="banner">ouvrir l'éditeur</a></div></section>
  </div>`;
}

// ---------- Studio : améliorer le post en discutant avec l'IA ----------
function chatPanel(p, { sticky = false } = {}) {
  const c = client();
  const lessons = c.adn?.lessons || [];
  const msgs = p.chat || [];
  const pending = ui.chatPending?.id === p.id ? ui.chatPending : null;
  const bubble = (m) => m.role === 'user'
    ? `<div class="msg me">${esc(m.text)}</div>`
    : `<div class="msg ai">${esc(m.text)}${m.changed ? '<div class="msg-tag">✎ Post modifié</div>' : ''}${(m.learned || []).map((l) => `<div class="msg-learn">🧠 Retenu : ${esc(l)}</div>`).join('')}</div>`;
  return `<div class="inline-box chat-box">
    <div class="row between"><b>💬 Améliorer avec l'IA</b>${p.versions?.length ? `<button class="btn ghost sm" data-action="undo" data-id="${p.id}" title="Revenir à la version précédente">↶ Version précédente</button>` : ''}</div>
    <div class="chat-log" id="chatLog">
      ${msgs.length || pending ? msgs.map(bubble).join('') : `<div class="small chat-hint">Dis ce qui ne va pas, comme à un rédacteur : « le hook est trop long », « je ne dis jamais “game changer” », « trop de questions », « raconte plutôt mon exemple client »… L'IA corrige le post et <b>retient</b> les leçons générales pour tous les prochains posts de ${esc(c.name)}.</div>`}
      ${pending ? `<div class="msg me">${esc(pending.text)}</div><div class="msg ai typing">L'IA retravaille le post…</div>` : ''}
    </div>
    <textarea id="chatMsg" rows="3" placeholder="Ta critique ou ta consigne… (Entrée pour envoyer, Maj+Entrée pour aller à la ligne)" ${pending ? 'disabled' : ''}>${esc(ui.chatDraft[p.id] || '')}</textarea>
    <div class="row between"><button class="btn primary sm" data-action="chat-send" data-id="${p.id}" ${pending ? 'disabled' : ''}>Envoyer</button>
      <span class="small">${lessons.length} leçon${lessons.length > 1 ? 's' : ''} en mémoire</span></div>
    ${sticky ? '' : `<details class="memory" ${ui.memoryOpen ? 'open' : ''}><summary class="small">🧠 Ce que l'IA a retenu pour ${esc(c.name)} (${lessons.length})</summary>
      ${lessons.length ? `<div class="stack" style="gap:4px;margin-top:6px">${lessons.slice().reverse().map((l) => `<div class="row between vitem"><span class="small">${esc(l.text)}</span><span class="row" style="gap:2px"><button class="btn ghost sm" data-action="lesson-rule" data-id="${l.id}" title="En faire une règle permanente">📌</button><button class="btn ghost sm danger" data-action="lesson-del" data-id="${l.id}" title="Oublier">✕</button></span></div>`).join('')}</div>`
        : '<p class="small" style="margin:6px 0 0">Rien pour l\'instant : chaque critique générale sera mémorisée ici.</p>'}
      <p class="small" style="margin:6px 0 0">Ces leçons sont appliquées à chaque nouveau post de ${esc(c.name)} (création, retouches, hooks). Tu peux les retirer à tout moment.</p>
    </details>`}
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
// Bannière éditable façon Canva : calques déplaçables, panneau de propriétés, textes de l'IA, export PNG.
function ensureBannerElements(b) {
  if (!Array.isArray(b.elements) || (!b.elements.length && !b.style?.bgImage)) b.elements = Banner.templateElements(b.templateId || 'promesse', b.fields || {}, b.images || []);
  b.style ||= {};
  if (!b.style.preset) b.style.preset = Banner.TEMPLATES.find((t) => t.id === b.templateId)?.preset || 'mint';
  return b;
}
// Textes actuels des calques ayant un rôle (pour les garder quand on change de mise en page).
function fieldsFromElements(els) {
  const f = {};
  const strip = (t) => t.replace(/\s+↓$/, '').replace(/^▶ /, '').replace(/^🔔 /, '');
  for (const e of els) {
    if (e.type !== 'text' || !e.role) continue;
    if (e.role === 'steps') f.steps = e.text.replace(/^✦\s*/, '').split(/\s*➜\s*/).join(', ');
    else if (e.role.startsWith('pill-')) f.pills = [f.pills, e.text].filter(Boolean).join(', ');
    else f[{ follow: 'followText' }[e.role] || e.role] = strip(e.text);
  }
  return f;
}

function renderBannerView() {
  const c = client();
  const nInsp = inspirationImages(currentNiche(), 'banner').length;
  const tabs = `<div class="chips" style="margin-bottom:16px">${[['banner', 'Bannière'], ['insp', `Inspirations<b>${nInsp}</b>`], ['profile', 'Optimisation du profil']].map(([k, l]) => `<button class="chip ${ui.bannerTab === k ? 'on' : ''}" data-action="banner-tab" data-id="${k}">${l}</button>`).join('')}</div>`;
  const head = `<h2>Profil & bannière · ${esc(c.name)}</h2>`;
  if (ui.bannerTab === 'profile') { view.innerHTML = `${head}<p class="sub">Audit et réécriture du profil LinkedIn à partir de l'ADN du client.</p>${tabs}${profileAuditHtml(c)}`; return; }
  if (ui.bannerTab === 'insp') { view.innerHTML = `${head}<p class="sub">Les bannières concurrentes qui servent de référence aux propositions de l'IA.</p>${tabs}${inspirationsCard('banner')}`; return; }
  if (!ui.banner || (ui.banner.clientId && ui.banner.clientId !== c.id)) { ui.banner = ensureBannerElements(newBanner()); BE.resetHistory(); }
  const b = ensureBannerElements(ui.banner);
  const saved = (ui.data.banners || []).filter((x) => x.clientId === c.id);
  const preset = b.style.preset;
  view.innerHTML = `
    ${head}
    <p class="sub">Clique sur un élément pour le modifier, glisse-le pour le déplacer, tire la poignée pour l'agrandir. Export PNG au format LinkedIn (1584 × 396).${nInsp ? ` L'IA s'inspire de ${nInsp} bannière${nInsp > 1 ? 's' : ''} concurrente${nInsp > 1 ? 's' : ''}.` : ''}</p>
    ${tabs}
    <div class="card stack be-editor" id="bannerEditor">
      <div class="be-toolbar">
        <button type="button" class="btn sm" data-be-add="text" title="Ajouter un texte"><b>T</b> Texte</button>
        <button type="button" class="btn sm" data-be-add="pill">◯ Pastille</button>
        <label class="btn sm">🏷 Logos<input type="file" accept="image/*" multiple data-be-file="logo" hidden></label>
        <label class="btn sm">👤 Photos<input type="file" accept="image/*" multiple data-be-file="avatar" hidden></label>
        <label class="btn sm">🖼 Image<input type="file" accept="image/*" data-be-file="image" hidden></label>
        <button type="button" class="btn sm" data-be-add="shape">▭ Forme</button>
        <button type="button" class="btn sm" data-be-add="arrow">⤵ Flèche</button>
        <span class="be-sep"></span>
        ${['🔔', '✦', '➜', '↓', '✓', '⭐'].map((e) => `<button type="button" class="btn sm ghost" data-be-add="emoji" data-val="${e}" title="Ajouter ${e}">${e}</button>`).join('')}
        <span class="be-sep"></span>
        <button type="button" class="btn sm ghost" data-be="undo" title="Annuler (Ctrl+Z)">↶</button>
        <button type="button" class="btn sm ghost" data-be="redo" title="Rétablir (Ctrl+Y)">↷</button>
      </div>
      <div class="row ban-actions">
        <label class="btn primary sm">📥 Importer une bannière et la modifier<input type="file" accept="image/*" data-banner-import="raw" hidden></label>
        <label class="btn soft sm">✨ Importer et améliorer avec l'IA<input type="file" accept="image/*" data-banner-import="ai" hidden></label>
        <button type="button" class="btn sm" data-be-add="cover" title="Rectangle de la couleur du fond : pour cacher un texte de l'image importée">▭ Cacher une zone</button>
        <button class="btn soft sm" data-action="banner-random" title="Une charte tirée des bannières concurrentes">🎲 Charte au hasard</button>
        ${ui.bannerPal ? `<span class="row pal-chip" title="${esc(ui.bannerPal.from || '')}"><span class="small"><b>${esc(ui.bannerPal.name || 'Charte')}</b></span>${['bg', 'bg2', 'text', 'accent'].map((k) => `<i style="background:${esc(ui.bannerPal[k] || '#ccc')}"></i>`).join('')}<button class="btn ghost sm" data-action="banner-pal-da" title="Utiliser ces couleurs pour les visuels de ce client">Garder comme DA</button></span>` : ''}
        ${ui.bannerJob ? `<span class="small"><b>${esc(ui.bannerJob)}</b></span>` : ''}
      </div>
      ${ui.bannerOriginal ? `<div class="ban-before"><span class="small"><b>Avant</b> (bannière importée)</span><img src="${ui.bannerOriginal}" alt="Bannière d'origine"><span class="row"><button class="btn ghost sm" data-action="banner-orig-bg">Repartir de l'image d'origine</button><button class="btn ghost sm" data-action="banner-orig-hide">Masquer</button></span></div><span class="small"><b>Après</b> (version modifiable)</span>` : ''}
      <div class="be-stage"><canvas id="bannerCanvas" class="banner-canvas" width="1584" height="396"></canvas><div class="be-overlay"></div></div>
      <div class="row between">
        <div class="row">
          <label class="f be-inline">Fond<select id="bannerPreset">${Object.entries(Banner.PRESETS).map(([k, v]) => `<option value="${k}" ${k === preset && !b.style.bgImage ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}${b.style.bgImage ? '<option selected>Image importée</option>' : ''}</select></label>
          <label class="f be-inline">Accent<input type="color" id="bannerAccent" value="${esc(b.style.accent || Banner.PRESETS[preset]?.accent || '#2FBF71')}"></label>
          <label class="btn sm">Fond image<input type="file" accept="image/*" data-be-file="bg" hidden></label>
          ${b.style.bgImage ? '<button class="btn sm ghost" data-action="banner-bg-clear">Retirer le fond image</button>' : ''}
          <label class="small"><input type="checkbox" id="bannerOverlay" ${ui.bannerOverlay ? 'checked' : ''} style="width:auto"> Zone de la photo</label>
        </div>
        <div class="row">
          <button class="btn primary" data-action="banner-ai">✨ Textes par l'IA</button>
          <button class="btn" data-action="banner-save">💾 Enregistrer</button>
          <button class="btn primary" data-action="banner-download">⬇ PNG</button>
        </div>
      </div>
      <div class="card stack ban-chat" style="margin:0">
        <div class="row between"><h3 style="margin:0">💬 Améliorer avec l'IA</h3>${(c.adn?.bannerChat || []).length ? '<button class="btn ghost sm" data-action="banner-chat-clear">Effacer la discussion</button>' : ''}</div>
        <div class="chat-log" id="banChatLog">${(c.adn?.bannerChat || []).map((m) => `<div class="msg ${m.role === 'user' ? 'me' : 'ai'}">${esc(m.text)}</div>`).join('') || `<div class="small chat-hint">Explique ce que fait ${esc(c.name)} et à qui il apporte quoi. Exemple : « je fais du ghostwriting et des tunnels d'acquisition, je ramène des clients aux dirigeants : on vend le bénéfice, pas le voyage ». L'IA retient tout, s'appuie sur les bannières de ta veille et modifie la bannière en direct.</div>`}
          ${ui.bannerJob === 'chat' ? '<div class="msg ai typing">Je réfléchis à ta bannière…</div>' : ''}</div>
        <div class="row"><textarea id="banMsg" rows="2" placeholder="Ta demande… (Entrée pour envoyer)" style="flex:1;min-width:0"></textarea><button class="btn primary sm" data-action="banner-chat" ${ui.bannerJob ? 'disabled' : ''}>Envoyer</button></div>
      </div>
      <div class="row"><span class="small">Mise en page de départ :</span>${Banner.TEMPLATES.map((t) => `<button class="chip ${t.id === b.templateId ? 'on' : ''}" data-action="banner-template" data-id="${t.id}" title="${esc(t.hint)}">${esc(t.name)}</button>`).join('')}</div>
      <div class="banner-cols two-col">
        <div class="be-panel card" style="margin:0"></div>
        <div class="stack">
          ${ui.bannerVariants.length ? `<div class="card stack" style="margin:0"><h3 style="margin:0">Propositions de l'IA</h3>${ui.bannerVariants.map((v, i) => `<div class="variant"><div class="small"><b>${esc(v.angle || `Variante ${i + 1}`)}</b></div><div class="vhook">${esc(v.headline).replace(/\n/g, '<br>')}</div><div class="small">${esc(v.proof || '')}</div><button class="btn soft sm" data-action="banner-variant" data-id="${i}">Appliquer à la bannière</button></div>`).join('')}</div>` : ''}
          <div class="card stack" style="margin:0">
            <label class="f">Nom de la bannière<input id="bannerName" value="${esc(b.name || '')}" data-novoice></label>
            ${saved.length ? `<h3 style="margin:4px 0 0">Bannières enregistrées</h3>${saved.map((x) => `<div class="row between vitem"><a href="#" data-action="banner-load" data-id="${x.id}">${esc(x.name)}${x.id === b.id ? ' (ouverte)' : ''}</a><button class="btn ghost sm danger" data-action="banner-del" data-id="${x.id}">🗑</button></div>`).join('')}` : ''}
            <button class="btn ghost sm" data-action="banner-new" style="align-self:flex-start">+ Nouvelle bannière</button>
            <p class="small" style="margin:0">Photos de personnes accompagnées : uniquement avec leur accord.</p>
          </div>
        </div>
      </div>
    </div>`;
  BE.mountEditor($('#bannerEditor'), b, { overlay: ui.bannerOverlay, onChange: () => { ui.bannerDirty = true; } });
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
const visCurrent = (v) => ({ ...v, spec: ui.visEdit[v.id] || v.spec, style: ui.visStyle?.[v.id] || v.style, author: client()?.name || '' });
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
  const list = visualsOf().filter((v) => !String(v.kind).startsWith('design')).slice(0, 12);
  const nInsp = inspirationImages(currentNiche(), 'visual').length;
  const tabs = `<div class="chips" style="margin-bottom:16px"><button class="chip ${ui.visTab !== 'insp' ? 'on' : ''}" data-action="vis-tab" data-id="create">Créer</button><button class="chip ${ui.visTab === 'insp' ? 'on' : ''}" data-action="vis-tab" data-id="insp">Inspirations<b>${nInsp}</b></button></div>`;
  if (ui.visTab === 'insp') { view.innerHTML = `<h2>Visuels à valeur</h2><p class="sub">Les visuels et carrousels concurrents qui servent de référence.</p>${tabs}${inspirationsCard('visual')}`; return; }
  view.innerHTML = `
    <h2>Visuels à valeur</h2>
    <p class="sub">Schémas, checklists, comparatifs, frameworks et carrousels qui apportent une vraie réponse aux prospects de ${esc(c.name)}, chacun avec son post. Textes exacts et modifiables, aucun chiffre inventé.${nInsp ? ` S'inspire de ${nInsp} visuel${nInsp > 1 ? 's' : ''} concurrent${nInsp > 1 ? 's' : ''}.` : ''}</p>
    ${tabs}
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

const scrollChat = () => { const l = $('#chatLog'); if (l) l.scrollTop = l.scrollHeight; };
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
function nicheChips(items = ui.data.veille) {
  const n = currentNiche();
  return `<div class="chips">${allNiches().map((x) => `<button class="chip ${sameNiche(x, n) ? 'on' : ''}" data-action="niche" data-id="${esc(x)}">${esc(x)}<b>${items.filter((v) => sameNiche(v.niche, x)).length}</b></button>`).join('')}</div>`;
}

// ---------- Agent de veille : suit les concurrents du client chaque semaine (via Apify) ----------
function agentCard() {
  const c = client();
  const list = (ui.data.profiles || []).filter((p) => p.clientId === c.id);
  const hasKey = ui.data.settings.hasApifyToken;
  const running = list.filter((p) => p.status === 'running').length;
  const st = (p) => p.status === 'running' ? '⏳ en cours' : p.status === 'error' ? `⚠️ ${esc(p.error || 'erreur')}` : p.updatedAt ? `✓ ${fmtDate(p.updatedAt)}${p.lastDigest ? ` · ${p.postCount || 0} posts · ${p.lastDigest.visuals || 0} visuels récupérés` : ''}` : 'jamais lancé';
  return `<section class="card stack agent-card">
    <div class="row between"><h3 style="margin:0">🤖 Agent de veille · ${esc(c.name)}</h3>
      ${list.length && hasKey ? `<button class="btn primary sm" data-action="agent-run" ${running ? 'disabled' : ''}>${running ? `${running} en cours…` : '▶ Lancer maintenant'}</button>` : ''}</div>
    <p class="small" style="margin:0">Ajoute les profils LinkedIn des meilleurs concurrents de ${esc(c.name)}. Chaque semaine, l'agent récupère leurs derniers posts, leurs visuels et leurs carrousels, garde ce qui marche le mieux et l'IA s'en sert pour écrire les posts, les hooks et les visuels. Ton compte LinkedIn n'est jamais utilisé.</p>
    ${hasKey ? '' : '<div class="alert warn">Il faut une clé <b>Apify</b> (le service qui lit les posts publics, environ 2 $ pour 1 000 posts, 5 $ offerts chaque mois). Crée un compte sur apify.com, copie ta clé API (Settings › API & Integrations), puis colle-la dans <a href="#" data-action="go" data-id="settings">Réglages</a>.</div>'}
    ${list.length ? `<div class="stack" style="gap:6px">${list.map((p) => `<div class="row between vitem"><span><b>${esc(p.name || p.url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, ''))}</b> <span class="small">${st(p)}</span></span>
      <span class="row" style="gap:6px"><label class="small"><input type="checkbox" data-agent-auto="${p.id}" ${p.auto !== false ? 'checked' : ''}> chaque semaine</label><button class="btn ghost sm danger" data-action="agent-del" data-id="${p.id}" title="Ne plus suivre">🗑</button></span></div>`).join('')}</div>` : ''}
    <div class="row"><input id="agentUrl" placeholder="https://www.linkedin.com/in/concurrent" style="flex:2;min-width:220px"><input id="agentName" placeholder="Nom (facultatif)" style="flex:1;min-width:120px"><button class="btn sm" data-action="agent-add">+ Suivre ce concurrent</button></div>
  </section>`;
}

function renderVeille() {
  const niche = currentNiche();
  const items = byAuthor(ui.data.veille.filter((v) => sameNiche(v.niche, niche)), ui.author).sort((a, b) => engagement(b) - engagement(a));
  const j = ui.job?.kind === 'paste' ? ui.job : null;
  view.innerHTML = `
    <h2>Veille</h2>
    ${agentCard()}
    <p class="sub">Tu peux aussi copier-coller à la main : l'IA retrouve chaque post, ses j'aime, ses commentaires, son sujet et son type de hook.</p>
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
  'vis-tab'(t) { ui.visTab = t; render(); },
  async 'bulk-delete'() {
    const ids = [...ui.selected];
    if (!ids.length) return;
    const published = ui.data.posts.filter((p) => ids.includes(p.id) && p.status === 'published').length;
    if (!confirm(`Supprimer définitivement ${ids.length} post${ids.length > 1 ? 's' : ''} de l'app ?${published ? `\n(${published} déjà publié${published > 1 ? 's' : ''} : ils restent sur LinkedIn, seuls leurs brouillons sont supprimés de l'app.)` : ''}`)) return;
    const r = await api('POST', '/api/posts/bulk-delete', { ids });
    ui.selected.clear();
    ui.lastCreated = ui.lastCreated.filter((x) => !ids.includes(x));
    await refresh();
    toast(`${r.deleted} post${r.deleted > 1 ? 's' : ''} supprimé${r.deleted > 1 ? 's' : ''}`);
  },
  'bulk-clear'() { ui.selected.clear(); render(); },
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
  'canva-open'(vid) {
    const v = visualsOf().find((x) => x.id === vid); if (!v) return;
    const page = ui.visSlide[vid] || 0;
    ui.canva = { vid, page, doc: { size: { w: 1024, h: 1536 }, style: { bgImage: `/uploads/${v.images[page]}` }, elements: [] } };
    BE.resetHistory(); render();
  },
  'canva-close'() { ui.canva = null; Banner.setSize(); render(); },
  async 'canva-save'(vid, btn) {
    btn.disabled = true; btn.textContent = 'Enregistrement…';
    try {
      const cv = document.createElement('canvas');
      await Banner.renderElements(cv, ui.canva.doc, { overlay: false });
      await api('POST', `/api/visuals/${vid}/replace`, { page: ui.canva.page, dataUrl: cv.toDataURL('image/png') });
      ui.canva = null; Banner.setSize();
      toast('Visuel modifié (la version précédente reste disponible)');
    } finally { await refresh(); }
  },
  async 'agent-add'() {
    const url = ($('#agentUrl')?.value || '').trim(); if (!url) throw new Error('Colle le lien du profil LinkedIn du concurrent.');
    await api('POST', '/api/profiles', { url, name: $('#agentName')?.value || '', clientId: ui.clientId }).catch(async (e) => {
      if (/Apify/.test(e.message)) { toast('Concurrent noté : il sera suivi dès que ta clé Apify sera dans Réglages.', true); throw e; } throw e;
    });
    await refresh(); toast("Concurrent ajouté : l'agent récupère ses posts (quelques minutes).");
  },
  async 'agent-del'(id) { await api('DELETE', `/api/profiles/${id}`); await refresh(); },
  async 'agent-run'() { const r = await api('POST', '/api/agent/run', { clientId: ui.clientId }); await refresh(); toast(`Agent lancé sur ${r.started} concurrent(s) : résultats dans quelques minutes.`); },
  async 'visuals-auto'(_id, btn) {
    if (ui.job && !ui.job.finished) throw new Error('Un traitement est déjà en cours.');
    const todo = clientPosts().filter((p) => ['review', 'approved', 'draft'].includes(p.status) && !p.image && !p.document);
    if (!todo.length) { toast('Tous les posts ont déjà un visuel.'); return; }
    ui.job = { kind: 'visuals-auto', total: todo.length, done: 0, step: '' };
    try {
      for (const [i, p] of todo.entries()) {
        ui.job.step = `Visuel ${i + 1} / ${todo.length} : ${(p.text.split('\n')[0] || '').slice(0, 50)}…`; render();
        try {
          const r = await api('POST', `/api/posts/${p.id}/design`, { inspirationId: 'auto', kind: 'image' });
          await api('POST', `/api/visuals/${r.visual.id}/attach`);
        } catch (e) { toast(`Post ${i + 1} : ${e.message}`, true); }
        ui.job.done = i + 1;
      }
      toast('Visuels créés et attachés : vérifie-les dans l’Atelier (étape 3) ou le Calendrier.');
    } finally { ui.job = null; await refresh(); }
  },
  async 'teach-save'() {
    const body = { hooks: $('#teachHooks')?.value || '', posts: $('#teachPosts')?.value || '', critiques: $('#teachCritiques')?.value || '' };
    if (!body.hooks.trim() && !body.posts.trim() && !body.critiques.trim()) throw new Error('Colle au moins un hook, un post ou une critique.');
    const r = await api('POST', `/api/clients/${ui.clientId}/teach`, body);
    await refresh();
    toast(`Retenu : ${r.added.hooks} hook(s), ${r.added.posts} post(s), ${r.added.critiques} critique(s). L'IA s'en sert dès maintenant.`);
  },
  async 'liked-post-del'(pid) { await api('DELETE', `/api/clients/${ui.clientId}/liked-posts/${pid}`); await refresh(); },
  async 'banner-chat'() {
    const msg = ($('#banMsg')?.value || '').trim(); if (!msg) throw new Error('Écris ou dicte ta demande.');
    const els = ui.banner.elements || [];
    ui.bannerJob = 'chat'; ui.bannerChatDraft = msg; render();
    try {
      const cv = $('#bannerCanvas');
      const r = await api('POST', '/api/banners/chat', { clientId: ui.clientId, message: msg, fields: fieldsFromElements(els), image: cv ? cv.toDataURL('image/jpeg', 0.75) : '' });
      if (r.fields) BE.mutate((b) => { Banner.applyTextsToElements(b.elements, r.fields); b.fields = { ...(b.fields || {}), ...r.fields }; });
      if (r.palette) { ui.bannerPal = Banner.cleanPalette(r.palette); BE.mutate((b) => Banner.applyPalette(b, ui.bannerPal)); }
      ui.bannerChatDraft = '';
      if (r.fields || r.palette) toast('Bannière modifiée (Ctrl+Z pour annuler)');
    } finally { ui.bannerJob = ''; await refresh(); const l = $('#banChatLog'); if (l) l.scrollTop = l.scrollHeight; }
  },
  async 'banner-chat-clear'() { await api('DELETE', `/api/clients/${ui.clientId}/banner-chat`); await refresh(); },
  async 'banner-random'() {
    if (!ui.bannerPalettes) {
      ui.bannerJob = 'Je relève les chartes de tes bannières concurrentes…'; render();
      try { ui.bannerPalettes = (await api('POST', '/api/banners/palettes', {})).list || []; } finally { ui.bannerJob = ''; }
    }
    const pool = ui.bannerPalettes.length ? ui.bannerPalettes : Object.values(Banner.PRESETS).map((p) => ({ name: p.name, bg: p.bg[0], bg2: p.bg.at(-1), text: p.text, accent: p.accent, pattern: p.pattern }));
    if (!ui.bannerPalettes.length) toast('Ajoute des bannières dans « Inspirations » pour des chartes tirées de ta veille. En attendant : chartes de base.');
    const others = pool.filter((x) => x.name !== ui.bannerPal?.name);
    ui.bannerPal = { ...Banner.cleanPalette(others[Math.floor(Math.random() * others.length)] || pool[0]), from: '' };
    const src = pool.find((x) => x.name === ui.bannerPal.name); if (src?.from) ui.bannerPal.from = src.from;
    BE.mutate((b) => Banner.applyPalette(b, ui.bannerPal));
    render();
  },
  async 'banner-pal-da'() {
    const p = ui.bannerPal; if (!p) return;
    const lum = (h) => parseInt(h.slice(1), 16);
    await api('PUT', `/api/clients/${ui.clientId}/da`, { colors: [p.accent, p.text === '#FFFFFF' || p.text === '#111111' ? p.bg : p.text, p.bg2 !== p.bg ? p.bg2 : undefined].filter(Boolean), backgrounds: daOf().backgrounds });
    await refresh(); toast('Couleurs gardées comme DA : elles serviront aux visuels de ce client');
  },
  'banner-orig-bg'() { if (!ui.bannerOriginal) return; BE.mutate((b) => { b.style = { ...b.style, bgImage: ui.bannerOriginal }; b.elements = []; }); render(); toast("Image d'origine en fond : ajoute tes textes et formes par-dessus"); },
  'banner-orig-hide'() { ui.bannerOriginal = ''; render(); },
  'banner-tab'(t) { ui.bannerTab = t; store.set('bannerTab', t); render(); },
  'banner-template'(id) {
    const b = ui.banner;
    if (b.elements?.length && !confirm('Changer de mise en page ? Tes textes, logos et photos sont gardés ; les positions et les ajouts manuels sont remplacés.')) return;
    const fields = { ...b.fields, ...fieldsFromElements(b.elements || []) };
    const images = (b.elements || []).filter((e) => e.type === 'image' && ['logo', 'avatar'].includes(e.role)).map((e) => ({ kind: e.role, src: e.src }));
    b.templateId = id;
    b.fields = fields;
    b.elements = Banner.templateElements(id, fields, images.length ? images : b.images || []);
    b.style = { ...b.style, preset: Banner.TEMPLATES.find((t) => t.id === id).preset, accent: '', bgImage: undefined };
    render();
  },
  'banner-new'() { ui.banner = ensureBannerElements(newBanner()); ui.bannerVariants = []; BE.resetHistory(); render(); },
  'banner-load'(id) { const b = ui.data.banners.find((x) => x.id === id); if (b) { ui.banner = ensureBannerElements(JSON.parse(JSON.stringify(b))); ui.bannerVariants = []; BE.resetHistory(); render(); } },
  async 'banner-del'(id) { if (!confirm('Supprimer cette bannière ?')) return; await api('DELETE', `/api/banners/${id}`); if (ui.banner?.id === id) ui.banner = null; await refresh(); },
  'banner-bg-clear'() { ui.banner.style = { ...ui.banner.style, bgImage: undefined }; render(); },
  async 'banner-ai'(_id, btn) {
    btn.disabled = true; btn.textContent = "L'IA écrit…";
    try {
      const r = await api('POST', '/api/banners/suggest', { clientId: ui.clientId, templateName: Banner.TEMPLATES.find((t) => t.id === ui.banner.templateId)?.name });
      ui.bannerVariants = r.variants || [];
    } finally { render(); }
  },
  'banner-variant'(i) {
    BE.mutate((b) => Banner.applyTextsToElements(b.elements, ui.bannerVariants[Number(i)]));
    toast('Textes appliqués (Ctrl+Z pour annuler)');
  },
  async 'banner-save'(_id, btn) {
    btn.disabled = true;
    try {
      const b = ui.banner;
      b.name = $('#bannerName')?.value || b.name;
      const saved = await api('POST', '/api/banners', { id: b.id, name: b.name, templateId: b.templateId, fields: b.fields || {}, style: b.style, elements: b.elements, clientId: ui.clientId });
      ui.banner = ensureBannerElements(JSON.parse(JSON.stringify(saved)));
      ui.bannerDirty = false;
      await refresh();
      toast('Bannière enregistrée');
    } finally { btn.disabled = false; }
  },
  async 'banner-download'() {
    const cv = document.createElement('canvas');
    await Banner.renderElements(cv, ui.banner, { overlay: false });
    const a = document.createElement('a');
    a.href = cv.toDataURL('image/png');
    a.download = `${(ui.banner.name || 'banniere').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '-').toLowerCase()}.png`;
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
  async approve(id) {
    const p = await api('POST', `/api/posts/${id}/status`, { status: 'approved' });
    await refresh();
    const at = p.scheduledAt ? new Date(p.scheduledAt) : null;
    const when = !at ? 'sans date : choisis-en une' : at <= Date.now() ? 'date passée : publication dans les 15 prochaines minutes'
      : at.toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
    toast(`Programmé ✓ ${at && at > Date.now() ? 'le ' : ''}${when}`);
  },
  async unapprove(id) { await api('POST', `/api/posts/${id}/status`, { status: 'review' }); await refresh(); },
  async 'approve-all'() {
    const list = clientPosts().filter((p) => ['review', 'draft', 'rejected'].includes(p.status));
    for (const p of list.filter((x) => x.status !== 'review')) await api('POST', `/api/posts/${p.id}/status`, { status: 'review' });
    const r = await api('POST', '/api/posts/bulk-approve', { ids: list.map((p) => p.id) });
    await refresh();
    toast(`${r.approved} programmé(s)${r.skipped.length ? ` · ${r.skipped.length} à compléter d'abord` : ''}`);
  },
  async delete(id) { await api('DELETE', `/api/posts/${id}`); ui.lastCreated = ui.lastCreated.filter((x) => x !== id); await refresh(); },
  pillar(k) { ui.pillar = k; render(); },
  async 'set-pillar'(id, btn) { const p = ui.data.posts.find((x) => x.id === id); await api('PUT', `/api/posts/${id}`, { pillar: p?.pillar === btn.dataset.pillar ? '' : btn.dataset.pillar }); await refresh(); },
  'post-vis-bg'(k) { ui.postVisBg = k; render(); },
  'open-atelier'(id) { ui.studioPost = id; if ($('#postDrawer')?.open) $('#postDrawer').close(); actions.go('atelier'); },
  'hook-pillar'(k) { ui.hookPillar = k; render(); },
  async 'hook-ideas'() {
    if (ui.job && !ui.job.finished) throw new Error('Un traitement est déjà en cours.');
    ui.hookTopic = $('#hookTopic')?.value || '';
    ui.job = { kind: 'hooks', total: 1, done: 0, step: 'Écriture des hooks…' }; render();
    try { const r = await api('POST', '/api/hooks/ideas', { clientId: ui.clientId, pillar: ui.hookPillar || '', topic: ui.hookTopic, count: 20 }); ui.hookIdeas = r.hooks; }
    finally { ui.job = null; render(); }
  },
  async 'hook-keep'(i) { const h = ui.hookIdeas[Number(i)]; if (!h) return; ui.hookIdeas = ui.hookIdeas.filter((x) => x !== h); await api('POST', `/api/clients/${ui.clientId}/hooks`, { ...h, status: 'liked' }); await refresh(); },
  async 'hook-reject'(i) { const h = ui.hookIdeas[Number(i)]; if (!h) return; ui.hookIdeas = ui.hookIdeas.filter((x) => x !== h); render(); await api('POST', `/api/clients/${ui.clientId}/hooks`, { ...h, status: 'rejected' }); await refresh(); },
  async 'hook-del'(hid) { await api('DELETE', `/api/clients/${ui.clientId}/hooks/${hid}`); await refresh(); },
  async 'hook-develop'(hid) {
    const h = (client().adn?.hookBank || []).find((x) => x.id === hid); if (!h) return;
    const keep = { count: ui.count, imageMode: ui.imageMode, instruction: ui.instruction };
    ui.count = 1; ui.imageMode = 'none'; ui.instruction = h.idea || '';
    ui.hookDev = { hook: h.text, hookId: h.id, pillar: h.pillar };
    try { await createAuto(); } finally { Object.assign(ui, keep); ui.hookDev = null; }
    if (ui.studioPost) { ui.atStep[ui.studioPost] = 'post'; actions.go('atelier'); }
  },
  'da-bg'(k) { const da = ui.daDraft || { ...daOf() }; const set = new Set(da.backgrounds); if (set.has(k)) { if (set.size > 1) set.delete(k); } else set.add(k); ui.daDraft = { ...da, backgrounds: Object.keys(Vis.DA_BACKGROUNDS).filter((x) => set.has(x)) }; render(); },
  'da-drop3'() { const da = ui.daDraft || { ...daOf() }; ui.daDraft = { ...da, colors: da.colors.slice(0, 2) }; render(); },
  async 'da-save'() { await api('PUT', `/api/clients/${ui.clientId}/da`, ui.daDraft); ui.daDraft = null; await refresh(); toast('Direction artistique enregistrée'); },
  async 'at-step'(k) {
    const p = atelierPosts().find((x) => x.id === ui.studioPost);
    if (!p) { ui.studioPost = null; render(); return; }
    ui.atStep[p.id] = k;
    if (k !== 'hook' && p.status !== 'approved' && p.status !== 'published') api('PUT', `/api/posts/${p.id}`, { stage: k }).catch(() => {});
    render(); window.scrollTo(0, 0);
  },
  'at-new'() { ui.studioPost = null; render(); window.scrollTo(0, 0); },
  async 'at-validate-post'(id) {
    const txt = $(`[data-editor="${id}"] textarea[name="text"]`)?.value;
    const p = ui.data.posts.find((x) => x.id === id);
    await api('PUT', `/api/posts/${id}`, { ...(txt && txt !== p.text ? { text: txt } : {}), stage: 'visual' });
    delete ui.draftText[id]; ui.atStep[id] = 'visual';
    await refresh(); window.scrollTo(0, 0);
  },
  'vis-kind'(k) { const id = ui.studioPost; if (k) ui.visKind[id] = k; else delete ui.visKind[id]; render(); },
  async 'vis-skip'(id) { await api('PUT', `/api/posts/${id}`, { stage: 'publish' }); ui.atStep[id] = 'publish'; await refresh(); },
  async 'visual-from'(id, btn) {
    if (ui.job && !ui.job.finished) throw new Error('Un traitement est déjà en cours.');
    ui.job = { kind: 'post-visual', id, step: 'Je regarde le modèle et je prépare ton visuel…' }; render();
    try {
      const r = await api('POST', `/api/posts/${id}/visual-from`, { inspirationId: btn.dataset.ref, kind: btn.dataset.kind });
      delete ui.visEdit[r.visual.id]; delete ui.visStyle[r.visual.id]; ui.visSlide[r.visual.id] = 0;
    } finally { ui.job = null; await refresh(); }
  },
  async 'post-visual-auto'(id) { ui.postVisType = ui.visKind[id] === 'carousel' ? 'carousel' : 'auto'; await actions['post-visual'](id, null, { attach: false }); },
  async 'vis-chat'(vid) {
    const msg = ($('#visMsg')?.value || '').trim(); if (!msg) throw new Error('Écris ta demande.');
    ui.visChatPending = vid; render();
    try { await api('POST', `/api/visuals/${vid}/chat`, { message: msg, spec: ui.visEdit[vid] }); delete ui.visEdit[vid]; delete ui.visStyle[vid]; }
    finally { ui.visChatPending = null; await refresh(); $('#visMsg')?.focus(); }
  },
  async 'vis-colors'(vid, btn) {
    const v = visualsOf().find((x) => x.id === vid); if (!v) return;
    const colors = btn.dataset.set === 'ref' ? v.refPalette : daOf().colors;
    const style = { ...(visCurrent(v).style || {}), da: { colors } };
    await api('PUT', `/api/visuals/${vid}`, { style }); delete ui.visStyle[vid]; await refresh();
  },
  async 'vis-variant'(vid, btn) {
    const v = visualsOf().find((x) => x.id === vid); if (!v) return;
    await api('PUT', `/api/visuals/${vid}`, { style: { ...(visCurrent(v).style || {}), variant: btn.dataset.variant } }); delete ui.visStyle[vid]; await refresh();
  },
  async 'design-from'(id, btn) {
    if (ui.job && !ui.job.finished) throw new Error('Un traitement est déjà en cours.');
    const kind = btn.dataset.kind;
    ui.job = { kind: 'post-visual', id, step: kind === 'carousel' ? 'Couverture du carrousel…' : 'Création du visuel…' }; render();
    try {
      const r = await api('POST', `/api/posts/${id}/design`, { inspirationId: btn.dataset.ref, kind });
      ui.visSlide[r.visual.id] = 0;
      await refresh();
      const n = (r.visual.brief?.slides || []).length;
      for (let i = 1; kind === 'carousel' && i < n; i++) {
        ui.job.step = `Page ${i + 1} / ${n}…`; render();
        await api('POST', `/api/visuals/${r.visual.id}/design-page`, { index: i }).catch((e) => toast(`Page ${i + 1} : ${e.message}`, true));
        await refresh();
      }
    } finally { ui.job = null; await refresh(); }
  },
  'design-slide'(vid, btn) { const v = visualsOf().find((x) => x.id === vid); const n = Math.max(1, (v.brief?.slides || []).length || v.images.length); ui.visSlide[vid] = ((ui.visSlide[vid] || 0) + Number(btn.dataset.d) + n) % n; render(); },
  async redesign(vid, payload, label) {
    if (ui.job && !ui.job.finished) throw new Error('Un traitement est déjà en cours.');
    ui.job = { kind: 'post-visual', id: ui.studioPost, step: label }; render();
    try { await api('POST', `/api/visuals/${vid}/redesign`, { ...payload, page: ui.visSlide[vid] || 0 }); } finally { ui.job = null; await refresh(); }
  },
  async 'design-chat'(vid) { const m = ($('#visMsg')?.value || '').trim(); if (!m) throw new Error('Écris ta demande.'); await actions.redesign(vid, { message: m }, 'Je modifie le visuel…'); },
  async 'design-colors'(vid) { const cols = [...view.querySelectorAll('[data-dcolor]')].map((x) => x.value); await actions.redesign(vid, { colors: cols }, 'Nouvelles couleurs…'); },
  async 'design-da'(vid) { await actions.redesign(vid, { colors: daOf().colors }, 'Couleurs de ta DA…'); },
  async 'design-texts'(vid) {
    const v = visualsOf().find((x) => x.id === vid); const brief = JSON.parse(JSON.stringify(v.brief || {}));
    for (const inp of view.querySelectorAll('[data-brief]')) setPath(brief, inp.dataset.brief, inp.dataset.brief === 'highlight' ? inp.value.split(',').map((x) => x.trim()).filter(Boolean) : inp.value);
    await actions.redesign(vid, { brief }, 'Je refais le visuel avec tes textes…');
  },
  async 'design-undo'(vid) { await api('POST', `/api/visuals/${vid}/design-undo`); await refresh(); },
  async 'at-validate-design'(id, btn) {
    const p = ui.data.posts.find((x) => x.id === id);
    const v = visualsOf().find((x) => x.id === p.visualId && x.postId === id); if (!v) return;
    btn.disabled = true; btn.textContent = 'On attache le visuel…';
    try {
      if (v.kind === 'design') await api('POST', `/api/visuals/${v.id}/attach`);
      else {
        const jpegs = [];
        for (const key of v.images) {
          const img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = `/uploads/${key}`; });
          const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350;
          const ctx = cv.getContext('2d'); const sc = Math.max(1080 / img.width, 1350 / img.height);
          ctx.drawImage(img, (1080 - img.width * sc) / 2, (1350 - img.height * sc) / 2, img.width * sc, img.height * sc);
          jpegs.push(cv.toDataURL('image/jpeg', 0.9));
        }
        await api('POST', `/api/posts/${id}/document`, { dataUrl: Vis.jpegsToPdf(jpegs, 1080, 1350), title: String(v.brief?.title || 'Carrousel').replace(/[*_]/g, '') });
      }
      await api('PUT', `/api/posts/${id}`, { stage: 'publish' }); ui.atStep[id] = 'publish';
      toast('Visuel attaché au post');
    } finally { await refresh(); window.scrollTo(0, 0); }
  },
  async 'at-validate-visual'(id, btn) {
    const p = ui.data.posts.find((x) => x.id === id);
    const v = visualsOf().find((x) => x.id === p.visualId && x.postId === id); if (!v) return;
    btn.disabled = true; btn.textContent = 'On attache le visuel…';
    try {
      if (ui.visEdit[v.id] || ui.visStyle[v.id]) await api('PUT', `/api/visuals/${v.id}`, { spec: visCurrent(v).spec, style: visCurrent(v).style });
      await attachVisual(visCurrent(v));
      delete ui.visEdit[v.id]; delete ui.visStyle[v.id];
      await api('PUT', `/api/posts/${id}`, { stage: 'publish' }); ui.atStep[id] = 'publish';
      toast('Visuel attaché au post');
    } finally { await refresh(); window.scrollTo(0, 0); }
  },
  async 'manual-use'(next) {
    const text = (ui.manual[ui.clientId] || '').trim(); if (!text) return;
    const post = await api('POST', '/api/posts', { clientId: ui.clientId, text, pillar: ui.pillar || '' });
    await api('PUT', `/api/posts/${post.id}`, { stage: next });
    ui.manual[ui.clientId] = ''; ui.studioPost = post.id; ui.atStep[post.id] = next;
    await refresh(); window.scrollTo(0, 0);
  },
  async 'hook-choose'(i) {
    const h = ui.hookIdeas[Number(i)]; if (!h) return;
    await api('POST', `/api/clients/${ui.clientId}/hooks`, { ...h, status: 'liked' });
    await refresh();
    const saved = (client().adn?.hookBank || []).find((x) => x.text === h.text);
    ui.hookIdeas = ui.hookIdeas.filter((x) => x !== h);
    if (saved) await actions['hook-develop'](saved.id);
  },
  async 'atelier-create'() {
    const keep = { count: ui.count, imageMode: ui.imageMode };
    ui.count = 1; ui.imageMode = 'none';
    try { await createAuto(); } finally { Object.assign(ui, keep); }
  },
  async 'chat-send'(id) {
    const box = $('#chatMsg');
    const message = (box?.value || '').trim();
    if (!message) throw new Error('Écris ou dicte ta critique.');
    const text = $(`[data-editor="${id}"] textarea[name="text"]`)?.value;
    ui.chatPending = { id, text: message };
    ui.chatDraft[id] = '';
    render(); scrollChat();
    try {
      const r = await api('POST', `/api/posts/${id}/chat`, { message, text });
      delete ui.draftText[id];
      if (r.learned?.length) toast(`🧠 Retenu pour les prochains posts : ${r.learned.join(' · ')}`);
    } catch (e) { ui.chatDraft[id] = message; throw e; } finally { ui.chatPending = null; await refresh(); scrollChat(); $('#chatMsg')?.focus(); }
  },
  async 'lesson-del'(lid) { await api('DELETE', `/api/clients/${ui.clientId}/lessons/${lid}`); ui.memoryOpen = true; await refresh(); },
  async 'lesson-rule'(lid) {
    const l = (client().adn?.lessons || []).find((x) => x.id === lid); if (!l) return;
    await saveAdn({ rules: [...(client().adn?.rules || []), l.text] });
    await api('DELETE', `/api/clients/${ui.clientId}/lessons/${lid}`);
    ui.memoryOpen = true; await refresh(); toast('Devenu une règle permanente (ADN › Voix)');
  },
  'post-vis-type'(t) { ui.postVisType = t; render(); },
  async 'post-visual'(id, _btn, opts = {}) {
    if (ui.job && !ui.job.finished) throw new Error('Un traitement est déjà en cours.');
    const t = ui.postVisType || 'auto';
    const kind = t === 'carousel' ? 'carousel' : 'image';
    ui.job = { kind: 'post-visual', id, step: "L'IA prépare le visuel…" };
    render();
    try {
      const da = daOf();
      const n = visualsOf().length;
      const variant = ui.postVisBg || da.backgrounds[n % da.backgrounds.length] || 'clair';
      const r = await api('POST', `/api/posts/${id}/visual`, { kind, type: kind === 'carousel' ? '' : t, format: ui.vis.format, style: { da: { colors: da.colors, backgrounds: da.backgrounds }, variant } });
      await refresh();
      if (opts.attach !== false) { ui.job.step = 'On dessine et on attache…'; render(); await attachVisual(r.visual); toast('Visuel créé et attaché au post'); }
    } finally { ui.job = null; await refresh(); }
  },
  async 'post-link-visual'(id, btn) {
    btn.disabled = true;
    const v = await api('POST', `/api/visuals/${btn.dataset.vis}/link`, { postId: id });
    await refresh();
    await attachVisual(visualsOf().find((x) => x.id === v.id) || v);
    await refresh();
    toast('Visuel rattaché au post');
  },
  'post-vis-edit'(vid) { ui.visTab = 'create'; actions.go('visuals'); setTimeout(() => document.querySelector(`[data-vid="${vid}"]`)?.closest('.vis-card')?.scrollIntoView({ block: 'center' }), 200); },
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
    view.querySelectorAll('[data-action="manual-use"]').forEach((b) => { b.disabled = !e.target.value.trim(); });
  }
  if (e.target.id === 'instruction') ui.instruction = e.target.value;
  if (e.target.id === 'chatMsg' && ui.studioPost) ui.chatDraft[ui.studioPost] = e.target.value;
  if (e.target.dataset.vcolor !== undefined) {
    const v = visualsOf().find((x) => x.id === e.target.dataset.vid);
    if (v) {
      const st = { ...(visCurrent(v).style || {}) };
      const colors = [...(st.da?.colors || daOf().colors)];
      colors[Number(e.target.dataset.vcolor)] = e.target.value;
      ui.visStyle[v.id] = { ...st, da: { colors: colors.filter(Boolean) } };
      clearTimeout(ui.visT);
      ui.visT = setTimeout(() => { const cv = view.querySelector(`[data-vis="${v.id}"]`); if (cv) Vis.renderVisual(cv, visCurrent(v), ui.visSlide[v.id] || 0); }, 80);
    }
  }
  if (e.target.dataset.daColor !== undefined) {
    const da = ui.daDraft || { ...daOf() };
    const colors = [...da.colors];
    colors[Number(e.target.dataset.daColor)] = e.target.value;
    ui.daDraft = { ...da, colors: colors.filter(Boolean) };
    const btn = $('[data-action="da-save"]'); if (btn) btn.disabled = false;
    for (const cv of view.querySelectorAll('[data-da-prev]')) Vis.renderVisual(cv, { kind: 'image', format: 'portrait', spec: SAMPLE_SPEC, style: { da: ui.daDraft, variant: cv.dataset.daPrev }, author: client().name });
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
  if (e.target.id === 'bannerAccent' && ui.banner) { ui.banner.style = { ...ui.banner.style, accent: e.target.value }; BE.redraw(); }
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
  if (e.target.dataset.select) { if (e.target.checked) ui.selected.add(e.target.dataset.select); else ui.selected.delete(e.target.dataset.select); render(); return; }
  if (e.target.hasAttribute('data-select-all')) {
    const posts = clientPosts();
    const shown = ui.filter === 'all' ? posts : posts.filter((p) => (ui.filter === 'review' ? ['review', 'draft', 'rejected'].includes(p.status) : p.status === ui.filter));
    if (e.target.checked) shown.forEach((p) => ui.selected.add(p.id)); else ui.selected.clear();
    render();
    return;
  }
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
  if (t.id === 'bannerPreset') { if (Banner.PRESETS[t.value]) BE.mutate((b) => { b.style = { ...b.style, preset: t.value, accent: '', bgImage: undefined }; }); render(); return; }
  if (t.id === 'bannerOverlay') { ui.bannerOverlay = t.checked; BE.setOverlay(t.checked); return; }
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
  if (t.dataset.agentAuto) { await api('PUT', `/api/profiles/${t.dataset.agentAuto}`, { auto: t.checked }); await refresh(); return; }
  if (t.hasAttribute('data-banner-import') && t.files[0]) {
    const file = t.files[0]; t.value = '';
    const dataUrl = await resizeImage(file, 1584);
    if (t.dataset.bannerImport === 'raw') {
      ui.banner = { ...newBanner(), name: `Bannière importée ${client().name}`, style: { bgImage: dataUrl }, elements: [] };
      ui.bannerOriginal = ''; BE.resetHistory(); render();
      toast("Bannière importée : ajoute des textes, et cache les anciens avec « Cacher une zone » (puis 🎯 pour prendre la couleur du fond).");
      return;
    }
    ui.bannerOriginal = dataUrl; ui.bannerJob = "L'IA analyse ta bannière et prépare une version améliorée…"; render();
    try {
      const r = await api('POST', '/api/banners/analyze', { clientId: ui.clientId, image: dataUrl });
      const b = ensureBannerElements({ ...newBanner(), name: `Bannière améliorée ${client().name}`, templateId: Banner.TEMPLATES.some((x) => x.id === r.templateId) ? r.templateId : 'promesse', fields: { ...Banner.DEFAULT_FIELDS, ...(r.fields || {}) } });
      Banner.applyTextsToElements(b.elements, r.fields || {});
      if (r.palette) { ui.bannerPal = Banner.cleanPalette(r.palette); Banner.applyPalette(b, ui.bannerPal); }
      ui.banner = b; BE.resetHistory();
      toast(`Analyse faite${r.score != null ? ` : ${r.score}/100` : ''}. Version améliorée prête, modifiable.`);
    } finally { ui.bannerJob = ''; await refresh(); const l = $('#banChatLog'); if (l) l.scrollTop = l.scrollHeight; }
    return;
  }
  if (t.dataset.library && t.files.length) {
    await uploadLibrary([...t.files], t.dataset.library, t.dataset.category || '');
    t.value = '';
    return;
  }
  if (t.dataset.imgdesc) {
    await api('PUT', `/api/images/${t.dataset.imgdesc}`, { description: t.value });
    toast('Description enregistrée');
  }
}));

async function uploadLibrary(files, kind, category) {
    if (ui.job && !ui.job.finished) throw new Error('Un traitement est déjà en cours.');
    ui.job = { kind: 'upload', total: files.length, done: 0, step: 'Envoi…' };
    const failed = [];
    try {
      for (const [i, f] of files.entries()) {
        ui.job.step = `${i + 1} / ${files.length} : ${f.type === 'application/pdf' ? 'lecture du PDF, ' : ''}envoi et analyse par l'IA…`;
        render();
        try {
          if (f.type === 'application/pdf') {
            if (kind !== 'inspiration') throw new Error('PDF accepté seulement pour les inspirations');
            const pages = await pdfToImages(f);
            if (!pages.length) throw new Error('PDF vide');
            await api('POST', '/api/images', { kind, category, clientId: ui.clientId, niche: currentNiche(), dataUrl: pages[0], pages, fileName: f.name });
          } else if (f.type.startsWith('image/')) {
            await api('POST', '/api/images', { kind, category, clientId: ui.clientId, niche: currentNiche(), dataUrl: await resizeImage(f), fileName: f.name });
          } else throw new Error('format non accepté');
        } catch (err) { failed.push(`${f.name} (${err.message})`); }
        ui.job.done = i + 1;
      }
    } finally { ui.job = null; await refresh(); }
    toast(`${files.length - failed.length} fichier(s) ajouté(s)${failed.length ? ` · non ajoutés : ${failed.join(', ')}` : ''}`, failed.length > 0);
}
// Glisser-déposer sur les colonnes de la page Visuels
document.addEventListener('dragover', (e) => { const z = e.target.closest?.('[data-dropcat]'); if (!z) return; e.preventDefault(); z.classList.add('over'); });
document.addEventListener('dragleave', (e) => { const z = e.target.closest?.('[data-dropcat]'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('over'); });
document.addEventListener('drop', (e) => {
  const z = e.target.closest?.('[data-dropcat]'); if (!z) return;
  e.preventDefault(); z.classList.remove('over');
  const files = [...(e.dataTransfer?.files || [])];
  if (files.length) uploadLibrary(files, 'inspiration', z.dataset.dropcat).catch((err) => toast(err.message, true));
});

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

document.addEventListener('toggle', (e) => { if (e.target.matches?.('details.more')) ui.visMoreOpen = e.target.open; }, true);
// Discussion avec l'IA : Entrée envoie, Maj+Entrée va à la ligne.
document.addEventListener('keydown', (event) => {
  if (!['chatMsg', 'visMsg', 'banMsg'].includes(event.target.id) || event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
  event.preventDefault();
  if (event.target.id === 'banMsg') { view.querySelector('[data-action="banner-chat"]')?.click(); return; }
  view.querySelector(event.target.id === 'visMsg' ? '[data-action="design-chat"], [data-action="vis-chat"]' : '[data-action="chat-send"]')?.click();
});
document.addEventListener('keydown', (event) => {
  if (!ui.data || document.body.classList.contains('locked')) return;
  if (event.key === 'Escape' && document.body.classList.contains('menu-open')) setMobileMenu(false, true);
  if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || event.repeat ||
      document.querySelector('dialog[open]') || event.target.closest?.('input, textarea, select, [contenteditable]')) return;
  if (event.key.toLowerCase() === 'n') {
    event.preventDefault();
    ui.studioPost = null;
    actions.go('atelier');
    $('#instruction')?.focus();
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
