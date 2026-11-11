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

// Un visuel à valeur tiré d'un post déjà écrit (le post n'est pas réécrit).
export function visualForPostPrompt({ client, postText, type, kind, inspirations = [] }) {
  const system = `Tu crées le visuel LinkedIn à valeur qui accompagne un post déjà écrit de ${client.name}. Le visuel résume ou prolonge l'idée centrale du post (sans le recopier), apporte une vraie réponse au lecteur et reprend les mêmes faits : rien d'inventé.
${adnText(client, { includeProofs: true })}
${kind === 'carousel' ? `Carrousel (document PDF) : 6 à 9 diapositives.
- Couverture : { "kind": "cover", "title": "≤ 12 mots avec *mot clé*", "subtitle": "≤ 14 mots" }
- Contenu : { "kind": "content", "title": "≤ 6 mots", "text": "≤ 20 mots", "items": ["optionnel, ≤ 8 mots", "…"] }
- Dernière : { "kind": "end", "title": "récap ≤ 8 mots", "text": "≤ 25 mots" }
Réponds en JSON : { "spec": { "type": "carousel", "slides": [ … ] }, "subtopic": "titre court du visuel" }` : `${VISUAL_SPECS}
${type && type !== 'auto' ? `Type imposé : ${type}.` : 'Choisis le type le plus adapté au post (évite « chiffre » sans preuve vérifiée).'}
Réponds en JSON : { "spec": { … }, "subtopic": "titre court du visuel" }`}
${inspirations.length ? `\nVisuels concurrents qui marchent (reprends leur densité de texte et leur structure, sans copier) :\n${inspirations.map((d) => `- ${d}`).join('\n')}` : ''}`;
  return { system, user: `Post :\n${String(postText).slice(0, 3000)}` };
}

// Visuel « qui ressemble » à un visuel concurrent choisi par l'auteur, avec le contenu du post.
export function visualFromReferencePrompt({ client, postText, kind, da }) {
  const system = `Tu es directeur artistique LinkedIn. On te montre UN visuel concurrent que l'auteur aime. Tu crées pour ${client.name} un visuel qui lui RESSEMBLE (même construction : disposition, hiérarchie, densité de texte, ton du titre) mais avec le contenu de SON post. Rien d'inventé : seulement les idées du post.
${adnText(client, { includeProofs: true })}
${kind === 'carousel' ? `Carrousel (document PDF) : 6 à 9 diapositives, en reprenant le rythme du carrousel de référence.
- Couverture : { "kind": "cover", "title": "hook du carrousel ≤ 10 mots avec *mot clé*", "subtitle": "≤ 14 mots" }
- Contenu : { "kind": "content", "title": "≤ 6 mots", "text": "≤ 20 mots", "items": ["optionnel, ≤ 8 mots"] }
- Dernière : { "kind": "end", "title": "récap ≤ 8 mots", "text": "≤ 25 mots, pas de vente" }
"spec" = { "type": "carousel", "slides": [ … ] }` : `${VISUAL_SPECS}
Choisis le type le plus proche de la construction du visuel de référence. Par défaut 3 points (3 items, 3 étapes…). Le "title" est un HOOK de visuel qui accroche (≤ 10 mots, *mot clé* en couleur), différent de la 1re ligne du post.`}
Couleurs : ${da?.colors?.length ? `l'auteur a une DA (${da.colors.join(', ')}) : garde-la, mais choisis le fond le plus proche de la référence.` : 'reprends 2 ou 3 couleurs dominantes de la référence.'}
Réponds en JSON : { "spec": { … }, "palette": ["#hex", "#hex"], "variant": "clair|fonce|couleur", "subtopic": "titre court", "why": "en 1 phrase, ce que tu as repris de la référence" }`;
  return { system, user: `Post de l'auteur :\n${String(postText).slice(0, 3000)}` };
}

// Retouche d'un visuel en discutant (couleurs, textes, type).
export function visualChatPrompt({ client, visual, postText, message, history = [] }) {
  const system = `Tu modifies un visuel LinkedIn de ${client.name} selon la demande de l'auteur. Tu renvoies le visuel COMPLET modifié.
${VISUAL_SPECS}
Format du visuel actuel : ${visual.kind === 'carousel' ? 'carrousel (spec.type = "carousel", spec.slides)' : 'image (un des types ci-dessus)'}.
Couleurs : "style.colors" = 2 ou 3 couleurs hex (la 1re = principale), "style.variant" = fond "clair" | "fonce" | "couleur".
Tu peux changer le type (ex. liste → comparaison) si on te le demande. Rien d'inventé : reste sur les idées du post.
Réponds en JSON : { "spec": { … }, "style": { "colors": ["#hex", "#hex"], "variant": "clair" }, "reply": "1 phrase : ce que tu as changé" }`;
  const convo = history.map((m) => `${m.role === 'user' ? 'MOI' : 'TOI'} : ${m.text}`).join('\n');
  return { system, user: `Post :\n${String(postText || '').slice(0, 2000)}\n\nVisuel actuel :\n${JSON.stringify({ spec: visual.spec, style: { colors: visual.style?.da?.colors, variant: visual.style?.variant } })}\n\n${convo ? `Échanges précédents :\n${convo}\n\n` : ''}Demande : ${message}` };
}
