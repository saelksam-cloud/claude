import test from 'node:test';
import assert from 'node:assert/strict';
import { editRatio, measure, rewriteStats, samePost } from '../lib/rewrite.js';

test('réécriture : 0 si identique, élevée si tout change', () => {
  assert.equal(editRatio('Un post simple et clair.', 'Un post simple et clair.'), 0);
  assert.ok(editRatio('Un post simple et clair.', 'Tout autre chose ici maintenant voilà.') > 0.8);
  const p = { aiText: 'Être bon ne suffit plus. Personne ne te connaît.', text: 'Être bon ne suffit plus. Personne ne te connaît encore.' };
  assert.ok(measure(p).ratio > 0 && p.rewrite.ratio < 0.2);
  assert.deepEqual(rewriteStats([p, { rewrite: { ratio: 0.6, at: '2026' } }]).count, 2);
});

test('rapprochement d’un post publié avec le post relu sur LinkedIn', () => {
  const mine = 'La régularité ne sauvera jamais un mauvais contenu.\n\nPublier tous les jours ne sert à rien si personne ne sait pourquoi te lire.';
  assert.ok(samePost(mine, mine.replace('\n\n', '\n') + '\n#linkedin'));
  assert.ok(!samePost(mine, 'Le nombre d’abonnés n’est pas un indicateur de réussite commerciale.'));
});
