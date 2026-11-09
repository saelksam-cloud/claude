// Branche « Profils & bannières » : textes de bannière et optimisation de profil LinkedIn, à partir de l'ADN client.
import { adnText } from './editorial.js';

const BANNER_RULES = `Règles d'une bannière LinkedIn qui convertit (format 1584 × 396) :
- Une PROMESSE en gros, orientée bénéfice client (pas le métier seul) : 4 à 10 mots, sur 2 lignes maximum. Entoure de *astérisques* les 1 à 3 mots clés à mettre en couleur.
- Une PREUVE SOCIALE courte en haut à gauche (« +50 entreprises accompagnées », « +4 ans d'expérience »). Utilise UNIQUEMENT les preuves vérifiées fournies ; sinon écris « [À COMPLÉTER : preuve chiffrée] ».
- Une ligne de soutien : ce qu'on fait / le rôle, ou 3 à 4 étapes de la méthode (mots courts).
- Un APPEL À L'ACTION court vers le lien en sélection ou la prise de rendez-vous (« Prends ton RDV en sélection »).
- Une phrase près du bouton Suivre (« Je partage mes conseils chaque semaine »).
- Ton et adresse du client (tu / vous). Pas d'emoji dans les textes. Rien d'inventé.`;

export function bannerCopyPrompt({ client, templateName }) {
  const system = `Tu es directeur artistique et copywriter spécialisé dans les bannières LinkedIn.
${adnText(client, { includeProofs: true })}

${BANNER_RULES}
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
