import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setEnvironmentContext } from '@netlify/blobs';
import { handle } from '../lib/app.js';
import { hooks, choices } from '../public/writing-samples.js';

test('calibration et rédaction par client avec stockage et IA simulés', async () => {
  process.env.APP_PASSWORD = 'test-password';
  process.env.OPENAI_API_KEY = 'test-key';
  setEnvironmentContext({ siteID: 'test-site', token: 'test-token', uncachedEdgeURL: 'https://blobs.test', edgeURL: 'https://blobs.test' });
  const blobs = new Map();
  const originalFetch = globalThis.fetch;
  let reviewed = false;
  globalThis.fetch = async (input, options) => {
    const request = new Request(input, options);
    const url = new URL(request.url);
    if (url.hostname === 'api.openai.com') {
      const { messages } = await request.json();
      const system = messages[0].content;
      let content;
      if (system.startsWith('Extrais')) content = JSON.stringify({ job: 'Architecte', offer: 'Rénovation', irrelevant: 'discard' });
      else if (system.startsWith('Rédige trois')) content = JSON.stringify({ posts: [{ text: 'Une rénovation commence par un relevé.\nChoisis les usages avant les matériaux.', style: 'Conseil' }] });
      else if (system.startsWith('Tu relis un brouillon')) {
        reviewed = true;
        const text = JSON.parse(messages[1].content).brouillon;
        content = JSON.stringify({ issues: /guide inexistant/i.test(text) ? [{ type: 'invention', quote: 'Demande mon guide inexistant.', why: 'Ressource non documentée.' }] : [] });
      } else if (system.startsWith('Contrôle le post')) {
        reviewed = true;
        const text = JSON.parse(messages[1].content).post;
        content = JSON.stringify({ valid: !/guide inexistant|hier, j’ai/i.test(text), reason: 'Ressource ou anecdote non documentée.' });
      } else {
        assert.match(system, /Tutoiement/);
        assert.match(system, /Architecte/);
        const subject = messages[1].content;
        content = subject.includes('placeholder') ? '[Ton résultat]' : subject.includes('invention')
          ? 'Hier, j’ai rénové un château. Demande mon guide inexistant.' : 'Tu veux rénover ?\n\nCommence par faire un relevé.';
      }
      return Response.json({ choices: [{ message: { content } }] });
    }
    assert.equal(url.hostname, 'blobs.test');
    if (request.method === 'PUT') {
      blobs.set(url.pathname, await request.text());
      return new Response(null, { status: 200 });
    }
    if (!blobs.has(url.pathname)) return new Response(null, { status: 404 });
    return new Response(blobs.get(url.pathname), { headers: { 'content-type': 'application/json' } });
  };
  async function call(method, path, body, status = 200, password = 'test-password') {
    const response = await handle(new Request('https://studio.test/api' + path, {
      method, headers: { 'x-studio-password': password }, body: body && JSON.stringify(body),
    }));
    const result = await response.json();
    assert.equal(response.status, status, JSON.stringify(result));
    return result;
  }
  try {
    const a = await call('POST', '/clients', { name: 'A' });
    const b = await call('POST', '/clients', { name: 'B' });
    const path = '/clients/' + a.id + '/writing';
    const edit = data => call('PUT', path, data);
    await call('GET', path, undefined, 401, 'incorrect');
    const { proposed } = await call('POST', path + '-brief', { brief: 'Architecte, rénovation.' });
    assert.deepEqual(proposed, { job: 'Architecte', offer: 'Rénovation' });
    await edit({ action: 'business', business: proposed });
    await edit({ action: 'explicit', group: 'address', id: choices.address[0].id });
    for (let i = 0; i < 3; i++) await edit({ action: 'vote', id: hooks[0][i].id, rating: [-1, 2, -1][i] });
    await edit({ action: 'step', step: 6 });
    const { profile } = await call('POST', path + '-drafts', {});
    const sample = profile.drafts[0];
    for (const reason of ['J’adore cette phrase', 'Trop long']) {
      await edit({ action: 'vote', id: sample.id, selectedText: sample.text.split('\n')[0], reason });
    }
    await edit({ action: 'vote', id: hooks[0][0].id, rating: 1 });
    await edit({ action: 'confirm' });
    const saved = await call('GET', path);
    assert.equal(saved.profile.progress.confirmed, true);
    assert.equal(saved.profile.versions.length, 1);
    assert.equal(Object.values(saved.profile.votes).filter(vote => vote.selectedText).length, 2);
    assert.equal(saved.summary.Adresse.confidence, 'Explicite');
    assert.deepEqual(saved.summary.Adresse.preferred, ['Tutoiement']);
    assert.deepEqual((await call('GET', '/clients/' + b.id + '/writing')).profile, {});
    const write = plan => call('POST', '/write', { clientId: a.id, plan: { structureId: 'test', ...plan } }, plan.status || 200);
    const post = await write({ topic: 'Rénovation' });
    assert.match(post.text, /^Tu veux/);
    assert.ok(reviewed);
    await edit({ action: 'vote', id: post.id, rating: 2 });
    await call('PUT', '/clients/' + b.id + '/writing', { action: 'vote', id: post.id, rating: 2 }, 400);
    await write({ topic: 'placeholder', status: 422 });
    // Une invention soupçonnée ne fait plus perdre le brouillon : elle est signalée sur le post, à vérifier par un humain.
    const flagged = await write({ topic: 'invention' });
    assert.equal(flagged.qc.issues[0].type, 'invention');
  } finally { globalThis.fetch = originalFetch; }
});
import { preferredReferences, writingContext } from '../lib/writing-profile.js';
import { writePrompt } from '../lib/editorial.js';

test('références complètes, priorité des avis et isolation', () => {
  const text = 'Un début.\n' + 'Une progression réelle. '.repeat(100) + '\nUne chute à conserver.';
  const vote = { contentId: 'ref-1', dimension: 'Référence', text, rating: 2, feedbackTags: [], createdAt: '2026-11-12' };
  const client = { name: 'A', adn: { writing: { votes: { first: vote } } } };
  assert.equal(preferredReferences(client)[0].text, text);
  assert.ok(writingContext(client).includes('Une chute à conserver.'));
  const prompt = writePrompt({ client, plan: { topic: 'Un sujet' } });
  assert.ok(prompt.system.includes('Une chute à conserver.'));
  assert.ok(!prompt.system.includes('souvent 100 à 170 mots'));
  assert.ok(!prompt.system.includes('Posts de référence (créateurs analysés par Linka)'));
  assert.equal(preferredReferences({ name: 'B' }).length, 0);
  client.adn.writing.votes.first.rating = -1;
  assert.equal(preferredReferences(client).length, 0);
});
import { pickWatchReference } from '../public/watch-choice.js';

test('tirage de veille privilégie les inconnus et évite les rejets', () => {
  const posts = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const votes = { a: { contentId: 'ref-a', rating: -1 }, b: { contentId: 'ref-b', rating: 1 } };
  assert.equal(pickWatchReference(posts, votes, undefined, () => 0).id, 'c');
  votes.c = { contentId: 'ref-c', rating: 2 };
  assert.equal(pickWatchReference(posts, votes, 'b', () => 0).id, 'c');
  assert.equal(pickWatchReference([{ id: 'a' }], votes), null);
  assert.equal(pickWatchReference([], {}), null);
});
