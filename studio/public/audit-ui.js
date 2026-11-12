import { sendWriting } from './writing-ui.js';

const questions = [
  ['job', 'Quel est ton métier ?', 'Décris ce que tu fais au quotidien.'],
  ['offer', 'Quel bénéfice apportes-tu ?', 'À qui rends-tu service, et pour quel résultat ?'],
  ['audience', 'Qui veux-tu attirer ?', 'Précise les personnes que tu veux accompagner.'],
  ['problems', 'Quel problème les pousse à agir ?', 'Reprends les mots de tes clients.'],
  ['expertise', 'Qu’est-ce qui distingue ta méthode ?', 'Décris comment tu travailles.'],
  ['exclusions', 'Que ne fais-tu surtout pas ?', 'Pose les limites de ton accompagnement.'],
  ['beliefs', 'Quelles convictions veux-tu défendre ?', 'Ce que tu veux faire comprendre à ton audience.'],
  ['forbidden', 'Quels sujets veux-tu éviter ?', 'Tu peux aussi préciser les promesses à exclure.'],
  ['stories', 'Quelles expériences peux-tu raconter ?', 'Utilise uniquement des histoires réellement vécues.'],
  ['evidence', 'Quelles preuves peux-tu partager ?', 'Résultats vérifiés, cas clients autorisés ou ressources existantes.'],
];
export async function showAudit(view, client, api, esc) {
  const root = document.createElement('section');
  root.className = 'audit-workspace';
  view.replaceChildren(root);
  let state;
  let busy = false;
  let error = '';
  try { state = await api('GET', '/api/clients/' + client.id + '/writing'); }
  catch (e) { root.textContent = e.message; return; }
  let index = state.profile.auditStep || 0;
  const business = { ...state.defaults, ...state.profile.business };
  function draw() {
    if (!root.isConnected) return;
    const [key, title, help] = questions[index];
    root.innerHTML = '<header class="page-heading"><h1>Ton audit</h1><p>Comprendre ton activité, puis trouver ta voix.</p></header>' +
      '<div class="row between"><span>' + esc(client.name) + '</span><span>Étape ' + (index + 1) + ' sur ' + questions.length + '</span></div>' +
      '<progress value="' + (index + 1) + '" max="' + questions.length + '" aria-label="Avancement de l’audit"></progress>' +
      '<div class="audit-columns"><article class="card"><label class="f"><h2>' + title + '</h2><p>' + help + '</p>' +
      '<textarea data-answer rows="6" maxlength="2500">' + esc(business[key] || '') + '</textarea></label>' +
      '<p role="status">' + esc(error) + '</p><div class="row between"><button class="btn soft" data-back ' + (index === 0 ? 'disabled' : '') + '>← Précédent</button>' +
      '<button class="btn primary" data-next>' + (index === questions.length - 1 ? 'Découvrir les posts de référence →' : 'Continuer →') + '</button></div></article>' +
      '<aside class="card"><h3>Ce qu’on construit ensemble</h3>' +
      ['Ton positionnement', 'Les sujets utiles à tes clients', 'Tes limites éditoriales', 'Une voix qui te ressemble'].map(label => '<p class="audit-outcome">' + label + '</p>').join('') +
      '<details><summary>Relire mes réponses</summary>' + questions.filter(([k]) => business[k]).map(([k, label]) => '<p><strong>' + label + '</strong><br>' + esc(business[k]) + '</p>').join('') + '</details>' +
      '</aside></div>';
  }
  async function save() {
    const key = questions[index][0];
    business[key] = root.querySelector('[data-answer]').value;
    state = await sendWriting(api, client.id, { action: 'business', business: { [key]: business[key] } });
  }
  root.addEventListener('change', async event => {
    if (!event.target.matches('[data-answer]')) return;
    try { await save(); root.querySelector('[role=status]').textContent = 'Enregistré'; }
    catch (e) { root.querySelector('[role=status]').textContent = e.message; }
  });
  root.addEventListener('click', async event => {
    const next = event.target.closest('[data-next]');
    const back = event.target.closest('[data-back]');
    if ((!next && !back) || busy) return;
    busy = true;
    try {
      await save();
      if (next && index === questions.length - 1) {
        await sendWriting(api, client.id, { action: 'step', step: 6 });
        document.querySelector('[data-view="writing"]').click();
        return;
      }
      index += next ? 1 : -1;
      await sendWriting(api, client.id, { action: 'audit-step', step: index });
      error = '';
      draw();
      root.querySelector('[data-answer]').focus();
    } catch (e) { error = e.message; draw(); }
    finally { busy = false; }
  });
  draw();
}

export function showMarketMap(view, client, data, esc) {
  const posts = data.veille.filter(post => post.clientId === client.id || (!post.clientId && post.niche === client.niche));
  const categories = [
    ['Authenticité', /authent|confidence|conviction|coulisse|erreur professionnelle/i, 'La prise de position et les expériences rendent la voix identifiable.'],
    ['Storytelling', /story|histoire|anecdote|narrat/i, 'Une scène, une tension et une progression donnent envie de lire la suite.'],
    ['Valeur', /valeur|pédagog|conseil|méthode|guide|liste|éducatif/i, 'Le lecteur repart avec une méthode ou une action applicable.'],
    ['Visuels utiles', /carrousel|image|visuel/i, 'Le visuel peut rendre une comparaison ou une méthode plus facile à comprendre.'],
  ];
  const matches = (post, pattern) => pattern.test([post.format, post.structure, post.topic, ...Object.values(post.classification || {})].join(' '));
  view.innerHTML = '<header class="page-heading"><h1>Comprendre le marché</h1><p>' + posts.length + ' posts dans le périmètre de ' + esc(client.name) + '. Les catégories peuvent se croiser.</p></header>' +
    '<p>Les réactions et commentaires indiquent un engagement public. Pour expliquer une performance, compare aussi la taille de l’audience, la date et le sujet.</p>' +
    '<div class="market-map">' + categories.map(([name, pattern, explanation]) => {
      const selected = posts.filter(post => matches(post, pattern)).sort((a, b) => (b.likes || 0) + (b.comments || 0) - (a.likes || 0) - (a.comments || 0));
      return '<section class="card"><h2>' + name + '</h2><p>' + explanation + '</p><strong>' + selected.length + ' références classées</strong>' +
        selected.slice(0, 5).map(post => '<article class="market-reference"><h3>' + esc(post.author || 'Auteur non renseigné') + '</h3><p>' +
          (post.likes || 0) + ' réactions · ' + (post.comments || 0) + ' commentaires</p><p><strong>Fond</strong> · ' + esc(post.topic || 'Sujet à analyser') +
          '</p><p><strong>Forme</strong> · ' + esc(post.structure || post.classification?.Structure || 'Structure à analyser') + '</p><details><summary>Lire le post entier</summary><p class="writing-text">' +
          esc(post.text) + '</p></details></article>').join('') + (selected.length ? '' : '<p>Aucune référence classée pour le moment.</p>') + '</section>';
    }).join('') + '</div><p>' + posts.filter(post => !categories.some(([, pattern]) => matches(post, pattern))).length +
    ' posts restent à classer. Les mécanismes ci-dessus sont des pistes d’analyse à confronter aux références.</p><button class="btn primary" data-action="go" data-id="veille">Ouvrir la veille et ajouter des profils →</button>';
}
