import { fields, steps, choices, hooks, hookRefinements, comparisons, families, ctas, aspects, reasons } from './writing-samples.js';

const ratings = [[-1, 'J’aime pas'], [1, 'J’aime'], [2, 'J’adore']];
const queue = new Map();

export function sendWriting(api, id, data) {
  const task = (queue.get(id) || Promise.resolve()).catch(() => {}).then(() => api('PUT', '/api/clients/' + id + '/writing', data));
  queue.set(id, task);
  const clear = () => { if (queue.get(id) === task) queue.delete(id); };
  task.then(clear, clear);
  return task;
}

export async function showWriting(view, client, api, esc) {
  const root = document.createElement('section');
  root.className = 'writing-profile';
  root.innerHTML = '<p role="status">Chargement du profil…</p>';
  view.replaceChildren(root);
  const endpoint = '/api/clients/' + client.id + '/writing';
  let state, series = 0, field = 0, proposal = {}, activeLine = null, activeAspect = null, busy = false;
  const answered = (id, text = '', tag = '') => state.profile.votes?.[JSON.stringify([id, text, tag])];
  const status = (message) => { const node = root.querySelector('[data-save-status]'); if (node) node.textContent = message; };
  const button = (action, label, data = '', selected) => '<button type="button" class="btn sm ' + (selected ? 'primary' : 'soft') + '" data-writing="' + action + '" ' + data + (selected === undefined ? '' : ' aria-pressed="' + selected + '"') + '>' + esc(label) + '</button>';
  const card = (item, detailed = false, explicit = false) => {
    const selected = state.profile.explicit?.[item.group] === item.id;
    const attrs = 'data-id="' + esc(item.id) + '"';
    const feedback = detailed ? '<details><summary>Préciser mon avis</summary><div class="writing-actions">' +
      aspects.map(a => button('aspect', a, attrs + ' data-aspect="' + esc(a) + '"', activeAspect?.id === item.id && activeAspect.aspect === a)).join('') +
      '</div>' + (activeAspect?.id === item.id ? reasons.slice(2).map(r => button('aspect-reason', r, attrs + ' data-reason="' + esc(r) + '"', answered(item.id, '', activeAspect.aspect)?.feedbackTags.includes(r) || false)).join('') : '') +
      '</details>' : '';
    const body = detailed ? item.text.split(/\n+/).filter(Boolean).map((line, i) => {
      const key = item.id + ':' + i;
      return '<div><button type="button" class="writing-line" data-writing="line" ' + attrs + ' data-index="' + i + '" aria-expanded="' + (activeLine === key) + '">' + esc(line) + '</button>' +
        (activeLine === key ? '<div class="writing-actions">' + reasons.map(reason => button('line-reason', reason, attrs + ' data-index="' + i + '" data-reason="' + esc(reason) + '"', Boolean(answered(item.id, line, reason)))).join('') + '</div>' : '') + '</div>';
    }).join('') : '<p class="writing-text">' + esc(item.text) + '</p>';
    return '<article class="panel writing-card"><h3>' + esc(item.intensity ? item.intensity + '/10' : item.value) + '</h3>' +
      body + '<div class="writing-actions">' + (explicit ? button('explicit', 'Choisir', attrs + ' data-group="' + item.group + '"', selected) :
        ratings.map(([rating, label]) => button('vote', label, attrs + ' data-rating="' + rating + '"', answered(item.id)?.rating === rating)).join('')) +
      '</div>' + feedback + (item.source ? '<p class="small">' + esc(item.source) + '</p>' + Object.entries(item.metadata || {}).map(([key,value]) => '<p class="small">' + esc(key + ' · ' + value) + '</p>').join('') : '') + '</article>';
  };
  function draw() {
    if (!root.isConnected) return;
    const step = state.profile.progress?.step || 0;
    const business = { ...state.defaults, ...state.profile.business };
    const fieldKeys = Object.keys(fields);
    const key = fieldKeys[field];
    const groups = step === 2 ? hooks : step === 3 ? [...new Set(families.map(item => item.value))].map(value => families.filter(item => item.value === value)) : comparisons;
    const drafts = state.profile.drafts || [];
    const completed = state.profile.progress?.completed?.length || 0;
    let content;
    if (step === 0) {
      content = '<details><summary>Importer un brief client</summary><label class="f">Brief<textarea data-brief rows="5" maxlength="16000"></textarea></label>' +
        button('brief', 'Analyser le brief') + '</details>' +
        (Object.keys(proposal).length ? '<div class="panel"><h3>Vérifie les propositions</h3>' + Object.entries(proposal).map(([k, v]) => '<label class="f">' + esc(fields[k]) + '<textarea data-proposal="' + k + '">' + esc(v) + '</textarea></label>').join('') +
          button('apply-brief', 'Enregistrer les propositions') + '</div>' : '') +
        '<label class="f">Information à compléter<select data-field-index>' + fieldKeys.map((k, i) => '<option value="' + i + '"' + (i === field ? ' selected' : '') + '>' + esc(fields[k]) + (business[k] ? ' ✓' : '') + '</option>').join('') + '</select></label>' +
        '<label class="f">' + esc(fields[key]) + '<textarea data-business="' + key + '" rows="4" maxlength="2500">' + esc(business[key] || '') + '</textarea></label>';
    } else if (step === 1) {
      content = '<p>Choisis la façon de parler qui te ressemble.</p>' + Object.values(choices).map(group => '<h3>' + esc(group[0].dimension) + '</h3><div class="writing-grid">' + group.map(item => card(item, false, true)).join('') + '</div>').join('');
    } else if ([2, 3, 4].includes(step)) {
      const refs = state.references;
      series = Math.min(series, Math.max(0, refs.length - 1));
      content = refs.length
        ? '<p>Lis ce post en entier. Note ce qui te plaît, puis précise la longueur, le ton ou le rythme si tu le souhaites.</p>' +
          '<p>Référence ' + (series + 1) + ' sur ' + refs.length + '</p>' + card(refs[series], true) +
          (series + 1 < refs.length ? button('series', 'Référence suivante →') : '')
        : '<p>Ajoute des posts réels dans la veille de ce client pour commencer à choisir ta plume.</p><button class="btn primary" data-action="go" data-id="veille">Ouvrir la veille</button>';
    } else if (step === 5) {
      content = '<p>Le post explique comment trouver un sujet à partir d’une objection entendue en rendez-vous. Note ses conclusions possibles.</p><div class="writing-grid">' + ctas.map(item => card(item)).join('') + '</div>';
    } else if (step === 6) {
      content = '<details><summary>Importer un post de référence</summary><label class="f">Source ou URL<input data-ref-source maxlength="500"></label><label class="f">Texte du post<textarea data-ref-text rows="5" maxlength="6000"></textarea></label>' + button('import-reference', 'Classer et enregistrer') + '</details>' +
        button('drafts', drafts.length ? 'Créer de nouveaux exemples' : 'Créer des exemples pour ce client') +
        '<div class="writing-grid">' + drafts.map(item => card(item, true)).join('') + '</div>' +
        (state.references.length ? '<details><summary>Références issues de la veille du client</summary><div class="writing-grid">' + state.references.map(item => card(item, true)).join('') + '</div></details>' : '');
    } else {
      const entries = Object.entries(state.summary);
      const uncertain = entries.length < 15 || entries.some(([, value]) => value.confidence === 'Faible');
      content = '<p>' + (state.profile.progress?.confirmed ? 'Profil confirmé. ' : '') + (uncertain ? 'Profil à affiner' : '') + '</p>' +
        '<dl>' + entries.map(([label, value]) => '<dt><strong>' + esc(label) + '</strong> · ' + esc(value.confidence) + '</dt><dd>' + esc(value.preferred.join(', ') || 'À préciser') +
          (value.avoid.length ? ' · À éviter : ' + esc(value.avoid.join(', ')) : '') + '</dd>').join('') + '</dl>' +
        ['topics', 'forbidden'].filter(k => business[k]).map(k => '<p><strong>' + esc(fields[k]) + '</strong> · ' + esc(business[k]) + '</p>').join('') +
        Object.values(state.profile.votes || {}).filter(v => v.selectedText).slice(-8).map(v => '<p>' + esc(v.feedbackTags.join(', ') + ' · « ' + v.selectedText + ' »') + '</p>').join('') +
        button('confirm', 'Confirmer le profil');
    }
    root.innerHTML = '<header class="page-heading"><h1>Profil rédactionnel · ' + esc(client.name) + '</h1><p>' + completed + ' étapes parcourues sur 7</p></header>' +
      '<progress aria-label="Avancement du profil" value="' + completed + '" max="7"></progress>' +
      '<label class="f">Étape<select data-step>' + steps.map((label, i) => '<option value="' + i + '"' + (i === step ? ' selected' : '') + '>' + esc(label) + '</option>').join('') + '</select></label>' +
      '<h2>' + esc(steps[step]) + '</h2>' + content + '<p data-save-status role="status"></p><footer class="writing-actions">' +
      (step > 0 ? button('previous', '← Précédent') : '') + (step < 7 ? button('next', 'Suivant →') : '') + '</footer>';
  }

  async function save(data, redraw = true) {
    state = await sendWriting(api, client.id, data);
    if (redraw) draw();
    status('Enregistré');
  }
  async function act(work) {
    if (busy) return;
    busy = true;
    root.setAttribute('aria-busy', 'true');
    try { await work(); }
    catch (error) { status(error.message); }
    finally { busy = false; root.removeAttribute('aria-busy'); }
  }
  function go(step, complete) {
    series = 0;
    activeLine = activeAspect = null;
    return save({ action: 'step', step, complete });
  }
  root.addEventListener('change', event => {
    const el = event.target;
    if (el.matches('[data-business]')) {
      sendWriting(api, client.id, { action: 'business', business: { [el.dataset.business]: el.value } }).then(result => {
        state = result;
        status('Enregistré');
      }, error => status(error.message));
    } else if (el.matches('[data-step]')) act(() => go(Number(el.value), false));
    else if (el.matches('[data-field-index], [data-series]')) act(async () => {
      await queue.get(client.id);
      if (el.matches('[data-field-index]')) field = Number(el.value);
      else series = Number(el.value);
      draw();
      root.querySelector(el.matches('[data-field-index]') ? '[data-field-index]' : '[data-series]')?.focus();
    });
  });
  root.addEventListener('click', event => {
    const el = event.target.closest('[data-writing]');
    if (!el) return;
    act(async () => {
      const { writing, id, group, rating, reason, aspect, index } = el.dataset;
      const step = state.profile.progress?.step || 0;
      if (writing === 'previous' || writing === 'next') return go(step + (writing === 'next' ? 1 : -1), writing === 'next');
      if (writing === 'series') { series++; draw(); return; }
      if (writing === 'explicit') await save({ action: 'explicit', group, id });
      if (writing === 'vote') {
        const previous = [...el.parentElement.querySelectorAll('button')].find(choice => choice.getAttribute('aria-pressed') === 'true');
        previous?.setAttribute('aria-pressed', 'false');
        el.setAttribute('aria-pressed', 'true');
        try { await save({ action: 'vote', id, rating: Number(rating) }); }
        catch (error) { draw(); throw error; }
      }
      if (writing === 'confirm') return save({ action: 'confirm' });
      if (writing === 'brief') {
        status('Analyse du brief…');
        proposal = (await api('POST', endpoint + '-brief', { brief: root.querySelector('[data-brief]').value })).proposed;
        draw();
        if (!Object.keys(proposal).length) status('Aucune information explicite extraite.');
      }
      if (writing === 'apply-brief') {
        const business = Object.fromEntries([...root.querySelectorAll('[data-proposal]')].map(input => [input.dataset.proposal, input.value]));
        await save({ action: 'business', business }, false);
        proposal = {};
        draw();
        status('Brief enregistré');
      }
      if (writing === 'import-reference') {
        status('Analyse de la référence…');
        state = await api('POST', endpoint + '-reference', { source: root.querySelector('[data-ref-source]').value, text: root.querySelector('[data-ref-text]').value });
        draw();
        status('Référence enregistrée');
      }
      if (writing === 'drafts') {
        status('Rédaction des exemples…');
        state = await api('POST', endpoint + '-drafts', {});
        draw();
        status('Exemples enregistrés');
      }
      if (writing === 'line') { const key = id + ':' + index; activeLine = activeLine === key ? null : key; draw(); }
      if (writing === 'aspect') { activeAspect = { id, aspect }; draw(); }
      if (writing === 'line-reason') {
        const item = [...(state.profile.drafts || []), ...state.references].find(item => item.id === id);
        const selectedText = item.text.split(/\n+/).filter(Boolean)[Number(index)];
        await save({ action: 'vote', id, selectedText, reason, remove: Boolean(answered(id, selectedText, reason)) });
      }
      if (writing === 'aspect-reason') await save({ action: 'vote', id, aspect: activeAspect.aspect, reason });
      const replacement = [...root.querySelectorAll('[data-writing]')].find(node => Object.entries(el.dataset).every(([k, v]) => node.dataset[k] === v));
      replacement?.closest('details')?.setAttribute('open', '');
      if (activeAspect) root.querySelector('[data-writing="aspect"][aria-pressed="true"]')?.closest('details')?.setAttribute('open', '');
      replacement?.focus();
    });
  });
  try {
    await queue.get(client.id);
    state = await api('GET', endpoint);
    draw();
  } catch (error) { root.textContent = error.message; }
}
