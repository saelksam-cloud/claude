import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as dec from '../lib/decline.js';

const ref = { id: 'vei_1', author: 'Concurrent', text: 'Votre marketing n’a pas à vous plaire.\nIl doit plaire à vos clients.\n\nUne chute à garder.' };

test('votes par client : avis, dimensions, phrase exacte, modification et retrait', () => {
  const a = { name: 'A' }; const b = { name: 'B' };
  dec.setRefVote(a, ref, { rating: 2, liked: ['Hook', 'Inconnu'], disliked: ['Longueur', 'Hook'] }, 't1');
  assert.deepEqual(dec.voteOf(a, ref.id).liked, ['Hook']);
  assert.deepEqual(dec.voteOf(a, ref.id).disliked, ['Longueur']);
  assert.equal(dec.voteOf(b, ref.id), null);
  dec.setRefVote(a, ref, { line: { text: 'Il doit plaire à vos clients.', reason: 'direct' } }, 't2');
  dec.setRefVote(a, ref, { line: { text: 'Phrase absente du post' } }, 't2');
  assert.deepEqual(dec.voteOf(a, ref.id).lines, [{ text: 'Il doit plaire à vos clients.', liked: true, reason: 'direct' }]);
  dec.setRefVote(a, ref, { rating: 1 }, 't3');
  assert.equal(dec.voteOf(a, ref.id).rating, 1);
  assert.deepEqual(dec.voteOf(a, ref.id).liked, ['Hook']);
  assert.equal(dec.likedReferences(a, [ref]).length, 1);
  dec.setRefVote(a, ref, { remove: true }, 't4');
  assert.equal(dec.voteOf(a, ref.id), null);
});

test('référence transmise complète, matière du client seule source de faits', () => {
  const client = { name: 'Sami', adn: { writing: { business: { job: 'Expert LinkedIn', stories: 'Aucune pour l’instant' }, notes: [{ text: 'Hooks sur l’argent si le sujet s’y prête' }] }, lessons: [{ text: 'Trop de questions' }, { text: 'trop de questions' }] } };
  const long = { ...ref, text: 'Début.\n' + 'Milieu utile. '.repeat(400) + '\nLa chute finale.' };
  const p = dec.declinePrompt({ client, ref: long, mechanics: { hook: 'x' }, vote: { rating: 2, liked: ['Hook'], disliked: [] }, subject: '' });
  assert.ok(p.user.includes('La chute finale.'));
  assert.ok(p.system.includes('Expert LinkedIn'));
  assert.ok(p.system.includes('Hooks sur l’argent'));
  assert.equal(p.system.match(/rop de questions/g).length, 1);
});

test('contrôles : champs à compléter, copie, chiffres absents de la fiche', () => {
  assert.ok(dec.hasPlaceholder('Bonjour [prénom]'));
  assert.ok(!dec.hasPlaceholder('Un post normal.'));
  assert.ok(dec.copyRatio(ref.text, ref.text) > 0.9);
  assert.ok(dec.copyRatio('Un texte entièrement différent sur un tout autre sujet que le premier.', ref.text) === 0);
  assert.deepEqual(dec.unverifiedNumbers('J’ai signé 12 clients et gagné 3 000 € en 30 jours.', 'En 30 jours'), ['12 clients', '3 000 €']);
});
