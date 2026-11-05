# Link Motion Studio

Le tableau de bord de ghostwriting LinkedIn de Link Motion :

1. **Veille** : tu colles les posts qui performent dans la niche du client, puis « Copier pour Claude » génère le message à envoyer à Claude pour l'analyse et la rédaction du mois suivant.
2. **Validation** : chaque post s'affiche comme sur LinkedIn (avec la coupure « … voir plus »). Tu peux le modifier, le valider, le renvoyer « à retravailler » avec un commentaire, ou lui ajouter une image.
3. **Calendrier** : la vue du mois.
4. **Publication automatique** : un post validé part tout seul à sa date, via l'**API officielle LinkedIn**. Le client autorise l'app une seule fois depuis un lien d'invitation, sans jamais partager son mot de passe.

Garde-fous :
- un post qui contient `[À COMPLÉTER …]` ne peut ni être validé ni être publié ;
- un post de plus de 3 000 caractères est refusé ;
- les jetons LinkedIn ne sont jamais envoyés au navigateur.

## Lancer en local

Il faut Node.js 22.9 ou plus récent.

```bash
cd studio
npm install
cp .env.example .env
npm start
```

Ensuite, ouvre http://localhost:3000.

Au premier lancement, le studio charge le client BTP et ses 20 posts (du 9 novembre au 4 décembre 2026, à 8 h 30) depuis `seed/client-btp.json`. Les données sont ensuite stockées dans `data/db.json` et les images dans `data/uploads/`. Ces deux emplacements ne sont pas versionnés.

## Brancher LinkedIn (une seule fois)

1. Va sur https://www.linkedin.com/developers/apps et clique « Create app ». L'app doit être rattachée à une page entreprise LinkedIn (par exemple Link Motion).
2. Dans l'onglet **Products**, ajoute « Sign In with LinkedIn using OpenID Connect » et « Share on LinkedIn ».
3. Dans l'onglet **Auth**, ajoute l'URL de redirection `<PUBLIC_URL>/auth/linkedin/callback`.
4. Renseigne `LINKEDIN_CLIENT_ID` et `LINKEDIN_CLIENT_SECRET` dans `.env`, puis redémarre le studio.
5. Dans l'onglet **Profil & LinkedIn**, copie le lien d'invitation et envoie-le au client. Il clique « Autoriser avec LinkedIn » et c'est terminé.

L'autorisation LinkedIn dure 60 jours. Quand elle approche de son expiration, renvoie le même lien au client.

## Mettre en ligne

La publication automatique ne tourne que si le studio est allumé. Il faut donc l'héberger sur un serveur toujours actif : Railway, Render, Fly.io ou un petit VPS. Ces points sont à prévoir :

- définir `PUBLIC_URL` avec l'URL publique et mettre à jour l'URL de redirection dans l'app LinkedIn ;
- **définir `APP_PASSWORD`**, sinon n'importe qui peut ouvrir le tableau de bord ;
- conserver le dossier `data/` entre deux déploiements (volume persistant), ou pointer `DATA_DIR` vers un volume.

## Le cycle mensuel

1. Pendant le mois, ajoute 10 à 20 posts repérés dans l'onglet **Veille**.
2. Clique « Copier pour Claude » et colle le résultat dans une conversation avec Claude.
3. Claude renvoie les posts du mois suivant en JSON. Importe-les avec **Validation → Importer (JSON)**.
4. Relis, complète les `[À COMPLÉTER]`, ajoute les images, puis valide. Le reste se fait tout seul.
