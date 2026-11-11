# Prompt pour ChatGPT Codex — Link Motion Studio (état au 11 novembre 2026, soir)

Tu es un développeur full-stack senior et un designer produit. Tu travailles sur **Link Motion Studio**, l'application interne de l'agence de ghostwriting LinkedIn **Link Motion**. Le code complet est dans le dossier `studio/`.

## Ta mission

> **À compléter par Sami avant d'envoyer** (ex. « rends l'Atelier plus beau et plus fluide », « améliore la qualité des visuels designés », « refais la page Bannière »).

Quelle que soit la mission :
1. Lis le code et lance l'app en local avant de toucher à quoi que ce soit.
2. Propose un plan court, puis implémente-le étape par étape, en gardant l'app fonctionnelle à chaque étape.
3. Termine par une checklist de tests manuels et la liste des limites.

## Règles impératives

- **Ne casse aucun flux existant** (liste plus bas) et **ne change pas le contrat de l'API** (routes, formats JSON, noms de champs). Les nouvelles routes sont permises.
- **Données réelles** : ne réinitialise, n'importe et n'écrase aucune base. Pas de migration destructive. Ne remplace aucun secret et ne déclenche aucune reconnexion LinkedIn. Les clés restent dans leur stockage actuel : ne les copie ni dans le code, ni dans un fichier.
- **Tests** : en local uniquement (voir « Lancer en local »). **Aucune publication LinkedIn et aucune écriture sur la base de production pendant tes tests.**
- **Déploiement** : jamais sans l'accord explicite de Sami.
- **`lib/knowledge.js`** (base de connaissances Linka) est un contenu tiers. Ne le publie dans aucun dépôt public (il est exclu de git).
- **Français partout**, tutoiement dans l'interface, modes jour et nuit (variables CSS `:root`, `prefers-color-scheme`, `[data-theme]`), micro de dictée vocale sur les champs de texte.
- **Authenticité** : l'IA n'invente jamais de chiffres, de preuves ni d'anecdotes. Les marqueurs `[À COMPLÉTER : …]` sont voulus : ils restent visibles et bloquent la validation d'un post.
- **Pas de post de vente** : l'IA ne cite ni le nom de l'entreprise du client ni son offre, et n'appelle jamais à acheter ou à prendre rendez-vous. Cette règle est appliquée dans les prompts (`lib/editorial.js`, `lib/ai.js`).

## Architecture

| Élément | Détail |
|---|---|
| Hébergement | Netlify, compte gratuit (site statique `public/` + fonctions). **Chaque requête normale est coupée à 30 s.** |
| API | `netlify/functions/api.mjs` → `lib/app.js` (routeur maison, `Request` → `Response`, auth par l'en-tête `x-studio-password` comparé à `APP_PASSWORD`). |
| Tâches IA longues | Le front envoie `POST /api/jobs {method, path, body}` puis interroge `GET /api/jobs/:id` toutes les 1 à 2,5 s. `netlify/functions/worker-background.mjs` (fonction d'arrière-plan, 15 min max) rejoue la requête en interne avec `runJob()`. La liste des routes concernées est dans `LONG_ROUTE` (`lib/app.js`) et `LONG_API` (`public/app.js`) : **garde les deux synchronisées.** |
| Enregistrement | `handle()` → `mergeSave()` : seules les entrées modifiées par la requête sont réécrites, par-dessus la version la plus récente de la base. Une tâche longue n'écrase donc pas les modifications faites entre-temps. |
| Programmation | `netlify/functions/scheduler.mjs`, toutes les 15 min : publie les posts validés dont l'heure est passée, avec 1 essai par heure en cas d'échec. Un post en retard de plus de 12 h (par rapport à sa date ET à sa validation) ne part pas tout seul : il affiche « choisis une nouvelle date ». |
| Stockage | Netlify Blobs : document `db` (store `studio`), `settings` (store `settings`), fichiers dans `uploads` (servis par `GET /uploads/:key`, sans mot de passe, avec des clés aléatoires), tâches dans `jobs`. |
| IA texte | OpenAI Chat Completions (mode JSON pour les sorties structurées, vision pour analyser les visuels concurrents). Modèle par défaut `gpt-6.1-sol`, avec repli automatique sur d'autres modèles. |
| IA images | OpenAI Images. `designImage()` (`lib/ai.js`) appelle `/v1/images/edits` avec le visuel concurrent en référence (modèles `gpt-image-*` détectés automatiquement, actuellement `gpt-image-2.6`). Format portrait 1024×1536, qualité haute, environ 0,20 € par image. |
| LinkedIn | OAuth 2.0 (`openid profile w_member_social`), Posts API, Images API, Documents API (carrousels PDF). La version d'API n'est plus figée : `restFetch()` (`lib/linkedin.js`) recule mois par mois si LinkedIn répond 426. |
| Front | JavaScript natif en modules ES, sans build :<br>• `public/index.html`, `style.css`, `workspace.css` ;<br>• `app.js` : état, rendu par template strings, délégation `data-action` ;<br>• `banner.js` + `banner-editor.js` : éditeur de bannière façon Canva ;<br>• `visuals.js` : schémas sur canvas, DA, assemblage PDF ;<br>• `calendar.js` ;<br>• `vendor/pdf.min.mjs` : pdf.js, pour lire les PDF déposés. |

## Ajouts récents (dernier déploiement)

- **Agent de veille** (onglet Veille) : concurrents suivis par client (`db.profiles` avec `clientId`, `auto`), récupération par Apify (`lib/apify.js`, robot `harvestapi~linkedin-profile-posts`, images et carrousels inclus), relance automatique chaque semaine par `scheduler.mjs`, puis tâche d'arrière-plan `POST /api/agent/digest` : les 5 meilleurs visuels ou carrousels deviennent des inspirations (`source: 'agent'`), la forme des posts est analysée et l'étude de la niche mise à jour. Routes : `POST|PUT|DELETE /api/profiles[/:id]`, `POST /api/agent/run`. La clé Apify se saisit dans Réglages.
- **Écriture** : `/api/write` donne en entier les 3 posts concurrents les plus performants de la niche (`extra.top`) et la méthode complète du GPT Linka content. La banque de hooks (`/api/hooks/ideas`) utilise la méthode complète du GPT Linka hooks, les hooks aimés, la bibliothèque Linka et les hooks de la veille.
- **Apprendre à l'IA** : `POST /api/clients/:id/teach` (hooks aimés en masse, posts aimés dans `adn.likedPosts`, critiques dans `adn.lessons`), injectés dans tous les prompts.
- **Agent visuels** : `POST /api/posts/:id/design` avec `inspirationId: 'auto'` (choix du modèle par l'IA), bouton « Visuels auto » dans le Calendrier, éditeur façon Canva sur un visuel généré (`banner-editor.js` réutilisé en 1024 × 1536 via `Banner.setSize()`, enregistrement par `POST /api/visuals/:id/replace`).
- **Bannière** : import « telle quelle » ou « améliorée par l'IA » (`/api/banners/analyze`), discussion avec mémoire (`/api/banners/chat`, `adn.bannerChat`), charte au hasard tirée des bannières de la veille (`/api/banners/palettes`), outil « Cacher une zone » avec pipette.

## Lancer en local

1. `npm install`
2. Puis au choix :
   - `npx netlify dev`, avec les variables `APP_PASSWORD` et `STATE_SECRET`. La clé OpenAI se saisit dans Réglages. Utilise une base locale vide.
   - le harnais de test : serveur Blobs local plus mocks d'OpenAI et de LinkedIn via `globalThis.fetch`, et Playwright pour les parcours.

Le déploiement (uniquement après accord de Sami) se fait avec cette commande :

```bash
npx netlify deploy --prod --no-build --dir public --functions netlify/functions
```

## Les écrans (menu actuel)

**Création**
1. **Atelier** (page d'accueil) : un post suit 4 étapes affichées en haut, une seule à la fois (`atelierStage()`, champ `post.stage`).
   1. **Hook** : propositions de l'IA (`POST /api/hooks/ideas`), puis « Choisir ce hook », qui écrit le post en gardant le hook mot pour mot (`/api/plan` puis `/api/write` avec `hook`, `hookId`, `pillar`). Ou bien « J'ai déjà mon post » : coller, puis passer directement au visuel.
   2. **Post** : éditeur, catégorie (Authenticité / Valeur / Routine), chat de critique (`POST /api/posts/:id/chat`). L'IA réécrit et retient des leçons générales (`client.adn.lessons`), appliquées à tous les prompts d'écriture. Ces leçons sont affichées sur un post-it ; on peut les supprimer ou les passer en règles permanentes. Le post se termine par « Valider le post ».
   3. **Visuel** : visuel, carrousel ou rien. À droite, la galerie des visuels concurrents de la base ; un clic lance `POST /api/posts/:id/design`.
      - L'IA (vision) prépare un brief : titre-hook, mots surlignés, 3 points, appel à réagir, description du style.
      - Puis `gpt-image` crée le visuel dans le style du modèle. Un carrousel fait 5 pages : `POST /api/visuals/:id/design-page`.
      - Retouches : chat (`/redesign` avec `message`), couleurs (`colors`), textes (`brief`), `design-undo`.
      - Validation : `POST /api/visuals/:id/attach` (image) ou PDF assemblé dans le navigateur, puis `POST /api/posts/:id/document`.
   4. **Publication** : aperçu LinkedIn, date en toutes lettres, « Programmer » / « Publier maintenant ».
2. **Hooks** : banque de hooks par client (`client.adn.hookBank`, statuts `liked` / `rejected` / `used`), propositions de l'IA, 👍 / ✕ (l'IA apprend le goût de l'auteur), « Développer en post ».
3. **Calendrier** : liste de tous les posts à gauche (filtres, cases à cocher, suppression groupée `POST /api/posts/bulk-delete`, ✎ pour ouvrir dans l'Atelier), calendrier mois / semaine à droite (glisser-déposer = changer `scheduledAt`). Un clic ouvre la fiche complète du post.

**Client**
4. **ADN client** : profil, personas, voix et règles permanentes, preuves vérifiées, onboarding, interview, mémoire des corrections.
5. **Visuels** :
   - **DA** du profil (`PUT /api/clients/:id/da`) : 2 ou 3 couleurs, fonds alternés (clair / foncé / couleur), aperçus en direct ;
   - 2 colonnes à glisser-déposer : **Carrousels** (catégorie `carousel`) et **Visuels concurrents** (`visual`). Un PDF est découpé en pages dans le navigateur, et chaque fichier est décrit par l'IA.
6. **Bannière** : éditeur à calques façon Canva, inspirations de bannières, propositions de textes par l'IA, audit du profil. Sami veut retravailler cet écran plus tard.

**Marché**
7. **Veille** : copier-coller analysé par l'IA (auteur, réactions, type de hook, structure), par niche et par concurrent.
8. **Étude de marché** : indicateurs clés, graphiques, retours de l'IA. Piste envisagée : 3 à 5 recommandations concrètes affichées directement dans l'Atelier et dans Hooks.

**Espace**
9. **Réglages** : connexion LinkedIn par client, modules GPT, clé OpenAI (avec test), app LinkedIn.

Les anciennes pages Studio, Posts, Marché et Visuels (ancien) ne sont plus dans le menu, mais leur code est toujours là (`renderCreate`, `renderPosts`, `renderMarche`, `renderVisualsView`).

## Routes de l'API

`GET /api/state` · clients : `POST /api/clients`, `PUT /api/clients/:id`, `PUT /api/clients/:id/adn`, `PUT /api/clients/:id/da`, `POST|DELETE /api/clients/:id/hooks[/:hid]`, `PUT|DELETE /api/clients/:id/lessons/:lid`, `POST /api/clients/:id/{disconnect,move-linkedin,check-linkedin,import,onboarding/analyze,onboarding/apply,interview/analyze}` ·
posts : `POST /api/posts`, `PUT|DELETE /api/posts/:id`, `POST /api/posts/{bulk-approve,bulk-delete}`, `POST /api/posts/:id/{status,hooks,apply-hook,quality,action,chat,undo,feedback,rewrite,publish-now,document,visual,visual-from,design}`, `POST|DELETE /api/posts/:id/image`, `POST /api/posts/:id/image/{library,auto,prompt,generate}` ·
création : `POST /api/plan`, `POST /api/write`, `POST /api/generate` ·
hooks : `GET /api/knowledge`, `PUT /api/hooks/prefs`, `POST /api/hooks/{generate,ideas,optimize}` ·
visuels : `POST /api/visuals/{plan,item}`, `PUT|DELETE /api/visuals/:id`, `POST /api/visuals/:id/{design-page,redesign,design-undo,attach,chat,link}` ·
bannières : `POST /api/banners/suggest`, `POST /api/banners`, `DELETE /api/banners/:id`, `POST /api/profile/audit` ·
images : `POST /api/images` (avec `category` : `visual` | `carousel` | `banner` | `image`, et `pages` pour un PDF), `PUT|DELETE /api/images/:id` ·
veille : `POST /api/veille`, `POST /api/veille/{paste,structures}`, `DELETE /api/veille/:id`, `POST /api/study`, `POST /api/analyze`, analyses / profils ·
tâches : `POST /api/jobs`, `GET /api/jobs/:jid`, `POST /api/jobs-test` (diagnostic) ·
réglages : `PUT /api/settings`, `POST /api/settings/test-openai` ·
`GET /uploads/:key`, `GET /connect/:id/:token`, `GET /auth/linkedin/callback`.

## Points d'attention

- Un appel IA de plus de quelques secondes doit passer par les tâches d'arrière-plan : ajoute sa route dans `LONG_ROUTE` et dans `LONG_API`.
- Les visuels designés coûtent de l'argent à chaque génération : ne lance jamais de génération en boucle ou automatique sans clic de l'utilisateur.
- `GET /api/state` renvoie tout l'état : ne rajoute pas de gros champs (images en base64, etc.) dans `db`. Les fichiers vont dans le store `uploads`.
- Mobile : aucune page ne doit défiler horizontalement (testé à 390 px de large).
