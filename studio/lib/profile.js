// Branche « Profils & bannières » : textes de bannière et optimisation de profil LinkedIn, à partir de l'ADN client.
import { adnText } from './editorial.js';

const BANNER_RULES = `Règles d'une bannière LinkedIn qui convertit (format 1584 × 396) :
- Une PROMESSE en gros, orientée bénéfice client (pas le métier seul) : 4 à 10 mots, sur 2 lignes maximum. Entoure de *astérisques* les 1 à 3 mots clés à mettre en couleur.
- Une PREUVE SOCIALE courte en haut à gauche (« +50 entreprises accompagnées », « +4 ans d'expérience »). Utilise UNIQUEMENT les preuves vérifiées fournies ; sinon écris « [À COMPLÉTER : preuve chiffrée] ».
- Une ligne de soutien : ce qu'on fait / le rôle, ou 3 à 4 étapes de la méthode (mots courts).
- Un APPEL À L'ACTION court vers le lien en sélection ou la prise de rendez-vous (« Prends ton RDV en sélection »).
- Une phrase près du bouton Suivre (« Je partage mes conseils chaque semaine »).
- Ton et adresse du client (tu / vous). Pas d'emoji dans les textes. Rien d'inventé.`;

export function bannerCopyPrompt({ client, templateName, inspirations = [] }) {
  const system = `Tu es directeur artistique et copywriter spécialisé dans les bannières LinkedIn.
${adnText(client, { includeProofs: true })}

${BANNER_RULES}
${inspirations.length ? `\nBannières concurrentes qui marchent (s'inspirer de leur construction et de leurs formulations, sans copier) :\n${inspirations.map((d) => `- ${d}`).join('\n')}\n` : ''}
Réponds en JSON : { "variants": [ { "headline": "ligne 1\\nligne 2 avec *mots clés*", "proof": "", "subline": "", "steps": ["", "", ""], "pills": ["", "", ""], "cta": "", "followText": "", "bubble": "Comme eux, contactez-moi !", "brand": "", "title": "métier en 1 à 2 mots", "angle": "en 5 mots, l'idée de cette variante" } ] }`;
  const user = `Modèle visuel choisi : ${templateName}. Propose 3 variantes vraiment différentes (bénéfice, autorité, résultat).`;
  return { system, user };
}

export function profileAuditPrompt({ client, profileText }) {
  const system = `Tu es expert en optimisation de profils LinkedIn pour dirigeants et freelances B2B.
${adnText(client, { includeProofs: true })}

Règles : titre (headline) 220 caractères maximum, orienté bénéfice et cible ; section Infos 2 600 caractères maximum (hook, problème de la cible, méthode, preuves vérifiées uniquement, appel à l'action) ; rien d'inventé : écris [À COMPLÉTER : …] si une preuve manque ; pas d'emoji superflu.
Réponds en JSON :
{ "score": 0-100, "sections": [ { "name": "Bannière|Photo|Titre|Infos|Sélection|Expériences|Activité", "score": 0-10, "issue": "", "fix": "" } ],
  "headlines": ["", "", ""], "about": "", "featured": ["idées de contenus à épingler"], "experience": ["conseils pour reformuler les expériences"], "quickWins": ["3 actions rapides"] }`;
  const user = profileText?.trim() ? `Profil actuel (copié depuis LinkedIn) :\n${profileText.slice(0, 12000)}` : "Pas de profil fourni : propose un profil complet à partir de la fiche client.";
  return { system, user };
}

// ---------- Visuels à valeur (images et carrousels) ----------
const VISUAL_SPECS = `Types de visuels et leur contenu JSON (textes COURTS, lisibles sur mobile) :
- liste : { "type": "liste", "title": "titre ≤ 10 mots avec *mot clé*", "subtitle": "≤ 14 mots", "items": [ { "t": "≤ 6 mots", "d": "≤ 12 mots" } ] } (3 à 6 items)
- comparaison : { "type": "comparaison", "title": "", "left": { "label": "Avant / Ce qu'on fait souvent", "items": ["≤ 8 mots"] }, "right": { "label": "Après / Ce qui marche", "items": ["≤ 8 mots"] } } (3 à 5 items par côté)
- process : { "type": "process", "title": "", "steps": [ { "t": "≤ 5 mots", "d": "≤ 14 mots" } ] } (3 à 5 étapes)
- matrice : { "type": "matrice", "title": "", "xAxis": "", "yAxis": "", "quadrants": [ { "t": "haut gauche", "d": "" }, { "t": "haut droite (la meilleure case)", "d": "" }, { "t": "bas gauche", "d": "" }, { "t": "bas droite", "d": "" } ] }
- chiffre : { "type": "chiffre", "title": "", "value": "", "label": "", "source": "" } UNIQUEMENT avec une preuve vérifiée fournie ou une source publique réelle et précise ; sinon value = "[À COMPLÉTER]" et source vide.
- citation : { "type": "citation", "quote": "conviction du client ≤ 30 mots avec *mot clé*", "author": "nom du client" }`;

const POST_RULES = `Le post accompagne le visuel : hook fort (≤ 12 mots, pas d'emoji), il développe l'idée du visuel sans le recopier, 100 à 180 mots, phrases courtes, aéré, fin par une question ou un CTA adapté. Pas de markdown. Aucun chiffre ni anecdote inventés (sinon [À COMPLÉTER : …]).`;

export function visualPlanPrompt({ client, topic, count, kind, personaText, inspirations = [] }) {
  const system = `Tu es le directeur éditorial de LinkedMotion. Tu prépares des visuels « à valeur » (schémas, checklists, comparatifs, frameworks) qui apportent une vraie réponse aux prospects du client.
${adnText(client, { includeProofs: true })}
${personaText || ''}
${inspirations.length ? `Visuels et carrousels concurrents qui marchent (privilégie ces types et ces formats) :\n${inspirations.map((d) => `- ${d}`).join('\n')}\n` : ''}
Réponds en JSON : { "subject": "", "items": [ { "subtopic": "sous-sujet précis et utile", "type": "liste|comparaison|process|matrice|chiffre|citation", "why": "≤ 15 mots" } ] }`;
  const user = `${topic ? `Sujet : ${topic}` : 'Choisis toi-même un sujet utile tiré des piliers, des problèmes de la cible ou des idées du client.'}
${kind === 'carousel' ? 'Prévois UN carrousel : un seul item, type "carousel".' : `Découpe-le en ${count} sous-sujets complémentaires, avec des types de visuels variés (évite « chiffre » sans preuve vérifiée).`}`;
  return { system, user };
}

export function visualItemPrompt({ client, subject, subtopic, type, kind, personaText, inspirations = [] }) {
  const system = `Tu crées un visuel LinkedIn à valeur et le post qui l'accompagne, pour ${client.name}.
${adnText(client, { includeProofs: true })}
${personaText || ''}
${kind === 'carousel' ? `Carrousel (document PDF) : 6 à 9 diapositives.
- Couverture : { "kind": "cover", "title": "≤ 12 mots avec *mot clé*", "subtitle": "≤ 14 mots" }
- Contenu : { "kind": "content", "title": "≤ 6 mots", "text": "≤ 20 mots", "items": ["optionnel, ≤ 8 mots", "…"] }
- Dernière : { "kind": "end", "title": "récap ≤ 8 mots", "text": "≤ 25 mots, pas d'appel à l'action commercial par défaut" }
Réponds en JSON : { "spec": { "type": "carousel", "slides": [ … ] }, "post": "" }` : `${VISUAL_SPECS}
Réponds en JSON : { "spec": { … le visuel du type demandé … }, "post": "" }`}
${POST_RULES}
${inspirations.length ? `\nVisuels concurrents qui marchent (reprends leur densité de texte, leur structure et leur ton, sans copier) :\n${inspirations.map((d) => `- ${d}`).join('\n')}` : ''}`;
  const user = `Sujet : ${subject}\nSous-sujet : ${subtopic}\n${kind === 'carousel' ? '' : `Type de visuel : ${type}`}`;
  return { system, user };
}
