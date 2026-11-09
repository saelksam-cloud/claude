# Prompt pour ChatGPT Codex — LinkedMotion Studio (refonte de l'ergonomie)

Tu es un développeur front-end senior et un designer produit (UX/UI). Tu travailles sur **LinkedMotion Studio**, l'application interne de l'agence de ghostwriting LinkedIn **Link Motion**. Le code complet est fourni (dossier `studio/`).

## Ta mission

**Rendre l'interface beaucoup plus ergonomique et agréable, sans casser aucune fonctionnalité.**
Commence par lire le code et utiliser l'app. Ensuite, propose un plan court (avec une maquette en texte ou en HTML statique si utile), puis implémente-le.

Règles impératives :
- **Ne change pas le contrat de l'API** : routes, formats JSON et noms de champs sont listés plus bas. Le back-end (`lib/`, `netlify/functions/`) ne doit être modifié que si c'est indispensable, et sans migration destructive des données.
- **Conserve toutes les fonctionnalités** listées plus bas.
- **Pas de framework lourd imposé.** Le front est aujourd'hui en JavaScript natif (modules ES), sans étape de build. Tu peux rester en natif (recommandé) ou proposer un outil léger (Vite, Preact, Lit…) si le gain est clair. Dans ce cas, le résultat doit rester déployable sur Netlify avec `public/` comme dossier publié, et tu dois documenter la commande de build.
- **Garde le français partout**, le ton tutoiement de l'interface, les modes jour et nuit (variables CSS sous `:root`, `prefers-color-scheme` et `[data-theme]`), et le micro de dictée vocale sur les champs de texte.
- **Authenticité** : l'IA ne doit jamais inventer de chiffres, de preuves ni d'anecdotes. Les placeholders `[À COMPLÉTER : …]` sont voulus : ils doivent rester visibles et bloquer la validation d'un post.

## Contexte technique

| Élément | Détail |
|---|---|
| Hébergement | Netlify (site statique `public/` + 2 fonctions) |
| API | `netlify/functions/api.mjs` → `lib/app.js` (routeur maison, handler web standard `Request` → `Response`) |
| Tâche programmée | `netlify/functions/scheduler.mjs`, toutes les 15 min : publie sur LinkedIn les posts validés dont l'heure est passée |
| Stockage | Netlify Blobs : un document JSON `db` (clients, posts, veille, analyses, images, visuels, bannières…), un document `settings` (clés, modules), et les fichiers (images, PDF) dans le store `uploads` |
| IA | API OpenAI (Chat Completions, mode JSON pour les sorties structurées, Images API pour la génération). Modèle par défaut `gpt-6.1-sol`, modèle rapide `gpt-4.1` pour l'extraction de veille. **Chaque appel de fonction Netlify est limité à 60 s** : les traitements longs sont découpés en plusieurs appels successifs, pilotés par le navigateur. Ne les regroupe pas. |
| LinkedIn | OAuth 2.0 (`openid profile w_member_social`), Posts API, Images API, Documents API (pour les carrousels PDF). Les posts programmés restent dans l'app jusqu'à l'heure prévue. |
| Auth du tableau de bord | En-tête `x-studio-password`, comparé à la variable d'environnement `APP_PASSWORD`. Le mot de passe est saisi sur un écran de connexion et conservé dans `localStorage`. |
| Base de connaissances | `lib/knowledge.js` est généré par `tools/build-knowledge.mjs` à partir de l'export Linka : 640 hooks, 50 structures, 62 templates, 164 posts de référence, règles de copywriting. Il contient du contenu tiers : **ne le publie pas dans un dépôt public**. |
| Front | `public/index.html`, `public/style.css`, `public/app.js` (tout l'état de l'interface + rendu par template strings + délégation d'événements `data-action`), `public/banner.js` (moteur canvas des bannières 1584×396), `public/visuals.js` (moteur canvas des visuels 1080×1350 et 1080×1080, et assemblage PDF sans dépendance externe) |

Lancer en local : `npm install` puis `npx netlify dev` (variables : `APP_PASSWORD`, et en option `OPENAI_API_KEY`, `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`). Déployer : `npx netlify deploy --prod --no-build --dir public --functions netlify/functions`.

## Fonctionnalités existantes (toutes à conserver)

1. **Créer** : de 1 à 10 posts, avec cible (persona), objectif, niveau de conscience (1 à 5), idée de la banque, sujet ou consigne, image (aucune, photothèque, ou générée), inspiration d'un concurrent, et deux moteurs :
   - **Automatique**, avec un pipeline par post : `POST /api/plan` (angle, type, structure Linka, familles de hooks, CTA, infos manquantes), puis `POST /api/write`, puis `POST /api/posts/:id/hooks` (10 hooks notés sur 100), puis l'image éventuelle ;
   - **Mes GPTs** : 2 copier-coller guidés (Mode content, puis Mode hooker), avec lien qui préremplit le GPT et collage depuis le presse-papiers.
2. **Posts** : filtres (à valider, programmés, publiés, tous) et aperçu façon LinkedIn. Pour chaque post :
   - Valider / Retirer, 💬 Retour (refait le post et mémorise le retour), ✎ Modifier, 🖼 Image, 🗑 ;
   - 🪝 Hooks : 10 hooks notés sur 100 sur 5 critères, comparer et appliquer ;
   - ✅ Qualité : 10 critères avec corrections ;
   - ✨ Retouches (9 actions) avec ↶ Annuler ;
   - 🧭 Stratégie : le plan, affiché à part du texte ;
   - date de publication modifiable, « Publier maintenant », saisie des performances réelles après publication ;
   - « Tout valider ».
3. **ADN client**, en sous-onglets :
   - Profil, et objectifs classés par priorité ;
   - Personas : psychologie de l'audience et niveau de conscience, statut « hypothèse IA » ou « confirmé » ;
   - Voix : règles permanentes, et retours promouvables en règle ;
   - Preuves : seules les vérifiées servent à l'IA ;
   - Onboarding : 18 questions et une analyse IA à appliquer bloc par bloc ;
   - Interview et banque d'idées ;
   - Mémoire des corrections (avant / après).
4. **Hooks** : bibliothèque de 640 modèles (recherche, familles, langue, favoris, désactivation), générateur (10 notés, ou 30, 50, 100), optimiseur (7 modes).
5. **Visuels** : sujet ou sujet au hasard. L'IA le découpe en 1 à 3 sous-sujets, avec pour chacun un visuel à valeur (checklist, comparatif, process, matrice 2×2, chiffre sourcé, citation) et son post ; ou un carrousel (PDF) et son post. Textes modifiables avec aperçu en direct, PNG / PDF, rattachement automatique au post.
6. **Profil & bannière** : 5 modèles de bannière, 9 fonds, accent, logos et avatars, texte riche (`*couleur*`, `[[surligné]]`, `__souligné__`), zone de la photo de profil, propositions de textes par l'IA, export PNG, bannières enregistrées. Audit de profil : score, 3 titres, section Infos, sélection, expériences.
7. **Images** : photothèque par client (décrite par l'IA, choix automatique de la photo par post) et visuels concurrents par niche, qui servent de références de style.
8. **Veille** : copier-coller libre analysé par l'IA (j'aime, commentaires, sujet, type de hook, format, forme réutilisable), niches, filtre par concurrent, analyse de la forme. Le fond sert à la niche, la forme à tous les clients.
9. **Étude de marché** : KPI (médianes et moyennes), comparatif des concurrents, feedback IA, 4 graphiques en barres (par sujet, type de hook, format, longueur), structures qui marchent, top et flop des hooks, note de fiabilité des données.
10. **Réglages** : connexion LinkedIn du client (vérifier, déplacer, déconnecter, lien d'invitation), les 2 GPTs (lien, méthode décrite par le GPT, exemples), clé OpenAI (avec test), app LinkedIn.
11. **Transverse** : sélecteur de client en haut, mode jour / nuit, dictée vocale (Web Speech API, `fr-FR`), notifications (toasts), écran de connexion.

## Routes de l'API (à ne pas casser)

`GET /api/state` (renvoie tout l'état : clients sans jetons, posts, veille, analyses, images, visuels, bannières, settings publics, référentiels éditoriaux) ·
`POST /api/clients` · `PUT /api/clients/:id` · `PUT /api/clients/:id/adn` · `POST /api/clients/:id/onboarding/analyze` · `POST /api/clients/:id/onboarding/apply` · `POST /api/clients/:id/interview/analyze` · `POST /api/clients/:id/check-linkedin` · `POST /api/clients/:id/disconnect` · `POST /api/clients/:id/move-linkedin` · `POST /api/clients/:id/import` ·
`POST /api/plan` · `POST /api/write` · `POST /api/generate` ·
`POST /api/posts` · `PUT /api/posts/:id` · `DELETE /api/posts/:id` · `POST /api/posts/:id/status` · `POST /api/posts/bulk-approve` · `POST /api/posts/:id/hooks` · `POST /api/posts/:id/apply-hook` · `POST /api/posts/:id/quality` · `POST /api/posts/:id/action` · `POST /api/posts/:id/undo` · `POST /api/posts/:id/feedback` · `POST /api/posts/:id/rewrite` · `POST /api/posts/:id/publish-now` · `POST|DELETE /api/posts/:id/image` · `POST /api/posts/:id/image/{library,auto,prompt,generate}` · `POST /api/posts/:id/document` ·
`GET /api/knowledge` · `PUT /api/hooks/prefs` · `POST /api/hooks/generate` · `POST /api/hooks/optimize` ·
`POST /api/visuals/plan` · `POST /api/visuals/item` · `PUT|DELETE /api/visuals/:id` ·
`POST /api/banners/suggest` · `POST /api/banners` · `DELETE /api/banners/:id` · `POST /api/profile/audit` ·
`POST /api/images` · `PUT|DELETE /api/images/:id` ·
`POST /api/veille` · `POST /api/veille/paste` · `POST /api/veille/structures` · `DELETE /api/veille/:id` · `POST /api/study` · `POST /api/analyze` · `POST|DELETE /api/analyses…` ·
`PUT /api/settings` · `POST /api/settings/test-openai` ·
`GET /uploads/:key` · `GET /connect/:id/:token` · `GET /auth/linkedin/callback`

## Problèmes d'ergonomie constatés (à résoudre)

- **Trop d'onglets à plat (10).** La navigation n'est pas hiérarchisée.
- **Les cartes de post sont surchargées** : jusqu'à 10 boutons, plus des panneaux empilés.
- **La création n'est pas guidée** : beaucoup d'options au même niveau, peu de valeurs par défaut intelligentes.
- **Pas de vue calendrier** des publications.
- **Les longues opérations (IA) sont visibles seulement par une barre de progression** : il n'y a ni file d'attente ni reprise après un rechargement de la page.
- **L'ADN client est long à remplir** : on ne voit pas où on en est.
- **Sur mobile, l'interface est utilisable mais pas optimisée.**

## Pistes attendues (à arbitrer, puis implémenter)

1. **Navigation en barre latérale**, avec 4 groupes repliables :
   - **Création** : Studio (Créer), Posts, Calendrier, Visuels ;
   - **Client** : ADN, Profil & bannière, Images ;
   - **Marché** : Veille, Étude de marché, Hooks ;
   - **Réglages**.

   Sur mobile : une barre d'onglets en bas et un menu.
2. **Un Studio de création en 3 colonnes** :
   - à gauche, le contexte client et le brief ;
   - au centre, l'éditeur du post ;
   - à droite, les hooks notés, le contrôle qualité et les retouches.

   La stratégie reste séparée du texte prêt à copier.
3. **Des cartes de post épurées** : 2 actions principales (Valider, Retour), le reste dans un menu « … » et un panneau latéral de détail.
4. **Un calendrier** (mois et semaine) en glisser-déposer pour reprogrammer (via `PUT /api/posts/:id` avec `scheduledAt`).
5. **Un assistant d'onboarding progressif** pour l'ADN, avec une jauge de complétude par section et des valeurs par défaut.
6. **Une file de tâches IA** visible (centre de notifications), avec reprise si la page est rechargée.
7. **Un design system cohérent** : tokens de couleurs et d'espacements, typographie, composants réutilisables (bouton, carte, chip, segment, modal, tiroir, toast, état vide, squelette de chargement).
8. **Accessibilité** : focus visibles, labels, contrastes AA, navigation au clavier, `aria-live` pour les toasts. Raccourcis : `N` nouveau post, `/` recherche, `Échap` fermer.
9. **Des états vides pédagogiques** sur chaque écran (« voici comment commencer »).
10. **Une vraie expérience mobile** : priorité à la validation des posts et à la dictée.

## Livrables attendus

1. Un audit UX court (problèmes classés par impact).
2. Le plan de refonte et la maquette de la nouvelle navigation et du Studio.
3. L'implémentation progressive, écran par écran, en gardant l'app fonctionnelle à chaque étape.
4. Une checklist de tests manuels couvrant tous les flux listés plus haut (création auto et GPT, hooks, qualité, retouches, validation, programmation, publication, visuels et PDF, bannière et PNG, veille, étude, ADN, onboarding, réglages, modes jour et nuit, mobile).
5. Les limites éventuelles et ce qui nécessiterait une évolution du back-end.
