# Workflow Montage Vidéo

## Comment ça marche en 4 étapes

```
1. Tu remplis un brief  →  2. Tu push les rush  →  3. Je lance les scripts  →  4. Tu récupères les exports dans CapCut
```

---

## Étape 1 — Préparer un nouveau projet

Copie le template de brief et remplis-le :

```bash
cp briefs/TEMPLATE_BRIEF.md briefs/NOM_PROJET.md
# Édite le fichier avec les infos du projet
```

## Étape 2 — Envoyer les rush

```bash
mkdir -p rush/NOM_PROJET/
# Copie tes fichiers vidéo dans ce dossier
# (ils ne seront PAS poussés sur Git, trop lourds)
# → Envoie-les via un lien Drive dans le brief
```

## Étape 3 — Installation (première fois seulement)

```bash
cd video-editing/
bash scripts/setup.sh
```

## Étape 4 — Lancer le montage

### Tout automatiser d'un coup
```bash
python3 scripts/process.py --projet NOM_PROJET --tout
```

### Options à la carte
```bash
# Couper les silences uniquement
python3 scripts/process.py --projet NOM_PROJET --silences

# Générer les sous-titres uniquement
python3 scripts/process.py --projet NOM_PROJET --sous-titres

# Créer un Short depuis le timestamp 2min30
python3 scripts/process.py --projet NOM_PROJET --short --short-debut 00:02:30 --short-duree 55

# Tout faire + incruster sous-titres dans la vidéo
python3 scripts/process.py --projet NOM_PROJET --tout --brule-sous-titres
```

### Assembler plusieurs clips dans l'ordre
```bash
python3 scripts/concat.py --projet NOM_PROJET --clips intro.mp4 contenu.mp4 outro.mp4
```

## Étape 5 — Récupérer les exports

Les fichiers traités se trouvent dans `exports/NOM_PROJET/` :
- `NOM_PROJET_FINAL_16x9.mp4` → Importe dans CapCut pour finitions
- `NOM_PROJET_SHORT_9x16.mp4` → Prêt à publier ou finir dans CapCut
- `NOM_PROJET_subtitles.srt` → Importe dans CapCut (Texte → Importer SRT)

---

## Structure des dossiers

```
video-editing/
├── briefs/          ← Tes briefs de projet (.md)
├── rush/            ← Tes fichiers bruts (non synchronisés sur Git)
│   └── NOM_PROJET/
├── exports/         ← Fichiers traités (MP4 non sync, SRT synchronisés)
│   └── NOM_PROJET/
└── scripts/
    ├── setup.sh     ← Installation des outils
    ├── process.py   ← Pipeline principal
    └── concat.py    ← Assemblage de clips
```

---

## Ce que les scripts font automatiquement

| Fonction | Outil | Qualité |
|----------|-------|---------|
| Couper les silences | FFmpeg silencedetect | Silences > 1.5s par défaut |
| Transcription sous-titres | Whisper AI (base) | ~95% précision en français |
| Normalisation audio | FFmpeg loudnorm | Standard YouTube -16 LUFS |
| Short 9:16 | FFmpeg crop+scale | 1080×1920 |
| Assemblage clips | FFmpeg concat | Sans re-encodage (rapide) |

---

## Importer dans CapCut

1. **Vidéo traitée** → Importer le MP4 depuis `exports/` comme clip de base
2. **Sous-titres SRT** → `Texte` → `Sous-titres automatiques` → `Importer` → choisir le `.srt`
3. Ajouter musique, transitions, effets visuels dans CapCut

---

## En cas de problème

```bash
# Vérifier FFmpeg
ffmpeg -version

# Vérifier Whisper
python3 -c "import whisper; print('OK')"

# Voir l'aide complète
python3 scripts/process.py --help
```
