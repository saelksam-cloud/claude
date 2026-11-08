# Link Motion Studio

Le tableau de bord de ghostwriting LinkedIn de Link Motion. Il est en ligne sur https://linkmotion-studio.netlify.app et protégé par mot de passe.

Il a quatre onglets :

1. **Validation** : chaque post s'affiche comme sur LinkedIn. Tu peux le modifier, le valider, le renvoyer « à retravailler » avec un commentaire, ou lui ajouter une image.
2. **Calendrier** : la vue du mois.
3. **Veille** : tu colles les posts qui performent dans la niche, puis « Copier pour Claude » prépare le message à envoyer à Claude pour l'analyse et la rédaction du mois suivant.
4. **Profil & LinkedIn** : la fiche « voix » du client et son lien d'invitation. Le client autorise l'app une seule fois, sans jamais partager son mot de passe.

Un post validé est publié tout seul à sa date, via l'**API officielle LinkedIn**. Une tâche programmée vérifie toutes les 5 minutes s'il y a des posts à publier.

Garde-fous :
- un post qui contient `[À COMPLÉTER …]` ne peut ni être validé ni être publié ;
- un post de plus de 3 000 caractères est refusé ;
- les jetons LinkedIn ne sont jamais envoyés au navigateur.

## Architecture (Netlify)

| Élément | Fichier |
|---|---|
| Interface (HTML/CSS/JS, sans build) | `public/` |
| API, page de connexion du client, callback OAuth, images | `netlify/functions/api.mjs` → `lib/app.js` |
| Publication programmée (toutes les 5 min) | `netlify/functions/scheduler.mjs` |
| Stockage (base JSON + images) | Netlify Blobs, via `lib/store.js` |
| API LinkedIn | `lib/linkedin.js` |
| Client et posts de départ | `seed/client-btp.js` |

## Variables d'environnement (Netlify → Project configuration → Environment variables)

| Variable | Rôle |
|---|---|
| `APP_PASSWORD` | mot de passe du tableau de bord (obligatoire) |
| `STATE_SECRET` | signature des liens de connexion LinkedIn |
| `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | identifiants de l'app LinkedIn |
| `LINKEDIN_VERSION` | facultatif, `202510` par défaut |
| `PUBLIC_URL` | facultatif, l'URL Netlify est utilisée par défaut |

Après chaque modification d'une variable : **Deploys → Trigger deploy**.

## Brancher LinkedIn (une seule fois)

1. Va sur https://www.linkedin.com/developers/apps et clique « Create app ». L'app doit être rattachée à la page entreprise LinkedIn de Link Motion.
2. Dans l'onglet **Products**, ajoute « Sign In with LinkedIn using OpenID Connect » et « Share on LinkedIn ».
3. Dans l'onglet **Auth**, ajoute l'URL de redirection `https://linkmotion-studio.netlify.app/auth/linkedin/callback`.
4. Ajoute `LINKEDIN_CLIENT_ID` et `LINKEDIN_CLIENT_SECRET` dans les variables Netlify, puis redéploie.

## Le cycle mensuel

1. Pendant le mois, ajoute des posts repérés dans l'onglet **Veille**.
2. Clique « Copier pour Claude » et colle le résultat dans une conversation avec Claude.
3. Importe le JSON que Claude renvoie avec **Validation → Importer (JSON)**.
4. Relis, complète les `[À COMPLÉTER]`, ajoute les images, puis valide.

## Développement local

```bash
npm install
```

```bash
npx netlify dev
```
