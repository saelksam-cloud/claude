export const fields = {
  job: 'Métier', sector: 'Secteur', offer: 'Offre principale', secondary: 'Offres secondaires',
  audience: 'Clients idéaux', problems: 'Problèmes', outcomes: 'Résultats recherchés',
  objections: 'Objections', expertise: 'Expertise', beliefs: 'Convictions', criticism: 'Pratiques critiquées',
  topics: 'Sujets souhaités', forbidden: 'Sujets interdits', goals: 'Objectifs LinkedIn',
  exclusions: 'Ce que le client ne fait pas', stories: 'Histoires réelles validées',
  evidence: 'Preuves vérifiées et autorisées', resources: 'Ressources disponibles et validées',
};
export const steps = ['Identité et business', 'Façon de parler', 'Intensité des hooks', 'Familles de posts', 'Structure et rythme', 'Conclusions', 'Posts complets', 'Synthèse'];
const make = (group, dimension, values) => values.map(([value, text, intensity], index) => ({
  id: group + '-' + index, group, dimension, value, text, intensity,
}));
export const choices = {
  address: make('address', 'Adresse', [
    ['Tutoiement', 'Tu peux publier chaque semaine. Pour savoir quoi améliorer, regarde les conversations que tes posts déclenchent.'],
    ['Vouvoiement', 'Vous pouvez publier chaque semaine. Pour savoir quoi améliorer, regardez les conversations que vos posts déclenchent.'],
    ['Impersonnel', 'Publier chaque semaine est possible. Pour savoir quoi améliorer, il faut regarder les conversations que les posts déclenchent.'],
  ]),
  familiarity: make('familiarity', 'Familiarité', [
    ['Professionnel', 'Évaluez les conversations suscitées par vos publications.'],
    ['Conversationnel', 'Regardez surtout les conversations que vos posts déclenchent.'],
    ['Familier', 'Les likes, c’est sympa. Et les conversations, ça donne quoi ?'],
    ['Très direct', 'Comptez les conversations. Le reste passe après.'],
  ]),
  body: make('body', 'Intensité du corps', [
    ['Posée', 'Les réactions donnent un premier signal. Les conversations indiquent souvent ce qui mérite d’être approfondi.'],
    ['Directe', 'Arrêtez de juger un post aux likes. Regardez les conversations qu’il ouvre.'],
    ['Tranchée', 'Si votre seul indicateur est le nombre de likes, vous mesurez la popularité et vous ratez le signal commercial.'],
  ]),
};
export const hooks = Object.entries({
  'Provocation frontale': ['Publier plus ne règle pas un message flou.', 'Publier plus avec un message flou, c’est amplifier le problème.', 'Ton message est flou. Arrête de le publier deux fois plus souvent.'],
  'Attaque d’une croyance': ['La régularité ne garantit pas des conversations.', 'La régularité ne sauvera pas un contenu sans angle.', 'La régularité est devenue l’excuse idéale pour ne jamais travailler son angle.'],
  'Confrontation': ['Le lecteur doit comprendre à qui le post s’adresse.', 'Ton lecteur ne devinera pas que tu lui parles.', 'Si tu refuses de choisir un lecteur, ne t’étonne pas que personne ne se sente visé.'],
  'Critique du marché': ['Les calendriers éditoriaux peuvent manquer de précision.', 'Un calendrier rempli ne vaut rien si ses sujets sont interchangeables.', 'Le marché vend des calendriers pleins pour éviter de parler du vrai problème : des sujets vides.'],
  'Autorité froide': ['Les likes ne mesurent pas les prises de contact.', 'Un like ne compte pas comme une prise de contact.', 'Aucune prise de contact ? Alors le bilan d’acquisition est zéro.'],
  'Ironie': ['Les likes ne suffisent pas pour signer un client.', 'Dommage que les likes ne signent pas de contrats.', 'Super, cent likes. On les met dans le CRM ou on attend encore un vrai prospect ?'],
  'Vulgarité modérée': ['Un message flou complique la vente.', 'Un message flou, c’est un sacré frein à la vente.', 'Quand ton message est flou, vendre devient un bordel évitable.'],
  'Opinion radicale': ['Mieux vaut parfois publier moins et préciser son offre.', 'Supprime la moitié de ton calendrier si tes sujets disent tous la même chose.', 'Arrête de publier tant que tes prospects ne comprennent pas ce que tu résous.'],
}).map(([dimension, texts], index) => make('hook' + index, dimension, texts.map((text, i) => [String([2, 6, 9][i]), text, [2, 6, 9][i]])));
export const hookRefinements = hooks.map((group, index) => make('hook-followup' + index, group[0].dimension, [
  ['7', 'On peut le dire franchement : ' + group[1].text.charAt(0).toLowerCase() + group[1].text.slice(1), 7],
  ['8', group[1].text + ' Combien de temps encore avant de corriger ça ?', 8],
]));
export const comparisons = Object.entries({
  Longueur: ['Un post utile répond à une question précise.', 'Un post utile répond à une question précise. Pour la trouver, repartez de la dernière conversation avec un prospect. Notez ses mots exacts. Répondez d’abord à cette question, puis relisez le texte pour vérifier qu’il ne part pas dans une autre direction.'],
  Phrases: ['Choisissez un lecteur. Décrivez son problème. Donnez une action.', 'Choisissez un lecteur, décrivez son problème et donnez-lui une action.'],
  Espacement: ['Choisissez un lecteur.\n\nDécrivez son problème.\n\nDonnez une action.', 'Choisissez un lecteur. Décrivez son problème. Donnez une action.'],
  Format: ['• Choisissez un lecteur.\n• Décrivez son problème.\n• Donnez une action.', 'Choisissez un lecteur. Décrivez son problème. Donnez une action.'],
  Détail: ['Relisez votre accroche à voix haute.', 'Relisez votre accroche à voix haute. Si vous butez sur un mot, remplacez-le par celui que vous emploieriez au téléphone.'],
  Questions: ['Votre lecteur sait-il quoi faire ensuite ?', 'Votre lecteur doit savoir quoi faire ensuite.'],
  Conclusion: ['Une idée claire vaut mieux que trois bonnes intentions.', 'Gardez une seule idée pour que le lecteur sache ce qu’il doit retenir.'],
  Émotion: ['C’est frustrant de publier sans savoir si quelqu’un a compris.', 'Sans retour, il est difficile de savoir si le message a été compris.'],
  Humour: ['Un calendrier sans stratégie, c’est un agenda qui a mis une cravate.', 'Un calendrier organise les dates. La stratégie détermine les sujets.'],
  Vocabulaire: ['Mesurez les prises de contact.', 'Mesurez les conversions en demandes entrantes.'],
}).map(([dimension, texts], index) => make('rhythm' + index, dimension, texts.map((text, i) => [[
  ['Court', 'Long'], ['Phrases courtes', 'Phrases développées'], ['Aéré', 'Compact'], ['Liste', 'Narration'],
  ['Minimaliste', 'Détaillé'], ['Question', 'Affirmation'], ['Punchline', 'Explicative'], ['Émotionnel', 'Rationnel'],
  ['Humoristique', 'Sérieux'], ['Simple', 'Technique'],
][index][i], text])));
export const families = Object.entries({
  Authenticité: [
    'Dans cet exemple fictif, je repousse la publication depuis trois jours.\n\nJe crois que le texte manque de personnalité. En réalité, j’ai retiré chaque phrase avec laquelle quelqu’un pourrait être en désaccord.\n\nLe jour où j’ai remis une conviction, le post a enfin eu une raison d’exister.',
    'J’ai longtemps cru, dans ce scénario fictif, qu’il fallait répondre à toutes les objections dans un seul post.\n\nEn relisant le brouillon, je n’arrive même plus à dire à qui il s’adresse.\n\nJe garde une objection par publication. Le reste fait de bons sujets pour la suite.',
  ],
  Valeur: [
    'Comment trouver un sujet de post en cinq minutes ?\n\nReprenez une question entendue en rendez-vous. Notez les mots utilisés. Répondez avec une action que la personne pourrait essayer demain.\n\nSi votre brouillon répond à une deuxième question, gardez-la pour un autre post.',
    'Avant : « Nous améliorons votre communication. »\n\nAprès : « On transforme les questions de vos prospects en sujets de posts. »\n\nLa deuxième version montre le travail. Testez la vôtre : pourriez-vous dessiner la scène décrite ?',
  ],
  Agressivité: [
    'Un calendrier rempli ne prouve pas que vous avez une stratégie.\n\nSi chaque sujet pourrait être publié par votre concurrent, votre calendrier règle un problème de planning. Votre lecteur ne sait toujours pas pourquoi vous suivre.\n\nÉcrivez d’abord une conviction que vos concurrents pourraient contester.',
    'Arrêtez de demander à l’algorithme de réparer votre message.\n\nSi trois personnes de votre cible lisent l’accroche et ne savent pas de quoi vous parlez, doubler la portée ne clarifiera rien.\n\nMontrez le texte à une personne avant de modifier l’heure de publication.',
  ],
  Storytelling: [
    'Scène fictive. Le café refroidit pendant qu’une cliente relit un brouillon.\n\nElle pointe une phrase barrée : « Pourquoi tu as supprimé celle-là ? C’est exactement ce que je dis au téléphone. »\n\nLe texte redevient vivant quand la phrase revient. Depuis, dans cet exemple, le premier brouillon commence par une note vocale.',
    'Scène fictive. Un artisan ferme son atelier et remarque le même outil sur trois établis.\n\nLes nouveaux l’utilisent tous pour contourner le même problème. Personne n’avait pensé à demander pourquoi.\n\nLe lendemain, l’outil devient le point de départ de la formation. Ce que les gens bricolent indique parfois ce qu’il faut leur apprendre.',
  ],
  'Lead magnet': [
    'Vous ne savez pas quel sujet publier lundi ?\n\nReprenez vos trois derniers rendez-vous et relevez une objection par échange. La plus fréquente devient votre prochain sujet.\n\nDans cet exemple, une checklist validée permet de trier les objections par fréquence et urgence. Un message suffit pour la demander.',
    'Votre page explique votre expertise, mais le lecteur ne sait pas quoi faire ensuite.\n\nVérifiez que la première phrase précise le public, le problème et le résultat visé. Relisez ensuite le lien en vous demandant où il mène.\n\nDans cet exemple, le modèle déjà publié est accessible dans la sélection du profil.',
  ],
}).flatMap(([value, texts], index) => make('family' + index, 'Famille', texts.map(text => [value, text])));
export const ctas = make('cta', 'CTA', [
  ['Question ouverte', 'Qu’est-ce qui vous aide à trouver vos sujets ?'], ['Question clivante', 'Faut-il publier moins quand on manque de bons sujets ?'],
  ['Commentaire', 'Partagez en commentaire une question que vos clients posent souvent.'], ['DM', 'Envoyez-moi la question en message privé.'],
  ['Rendez-vous', 'Si vous voulez travailler ces sujets ensemble, réservez un créneau.'], ['Ressource', 'La checklist est disponible sur demande.'],
  ['Sans CTA', 'Le prochain sujet est peut-être déjà dans votre dernier rendez-vous.'],
]);
export const reasons = ['J’adore cette phrase', 'Je n’aime pas cette phrase', 'Trop agressif', 'Pas assez percutant', 'Trop artificiel', 'Trop long', 'Trop banal', 'Excellent hook', 'Excellente punchline', 'Trop commercial', 'Pas naturel à l’oral', 'Pas assez concret'];
export const aspects = ['Hook', 'Ton', 'Longueur', 'Rythme', 'Structure', 'Histoire', 'Provocation', 'Valeur', 'Conclusion', 'CTA', 'Vocabulaire'];
export const samples = [...Object.values(choices).flat(), ...hooks.flat(), ...hookRefinements.flat(), ...comparisons.flat(), ...families, ...ctas];
