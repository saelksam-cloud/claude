# Workflow Montage Vidéo — Louis

## Vue d'ensemble

```
Rush horizontal  →  Analyse IA  →  Choix extrait + hook  →  Montage final 9:16
```

---

## Format de sortie

| Paramètre | Valeur |
|-----------|--------|
| Format | Vertical 9:16 |
| Résolution | 1080 × 1920 |
| Durée cible | 30 – 45 s (max 50 s) |
| Vidéo | Zoom 150% centré, bandes noires haut & bas |
| Hook | Times New Roman, haut — bande noire |
| Sous-titres | Times New Roman, dans la vidéo, bas |
| Phrase fixe | Times New Roman, bas — bande noire |

---

## Étape 0 — Installation (une seule fois)

```bash
cd video-editing/
bash scripts/setup.sh
```

---

## Étape 1 — Déposer le rush

```bash
mkdir -p rush/NOM_PROJET/
# Copie ton fichier vidéo dans ce dossier
# (les .mp4/.mov ne sont PAS poussés sur Git — trop lourds)
# → indique le lien Drive dans le brief si tu veux garder une trace
```

---

## Étape 2 — Analyser le rush

```bash
python3 scripts/analyze_rush.py --projet NOM_PROJET
```

**Ce que ça fait :**
- Transcrit tout le rush avec Whisper
- Score chaque extrait (contenu, rythme, mots-clés, début accrocheur)
- Propose les **5 meilleurs candidats** avec timestamps, texte nettoyé et suggestions de hook
- Sauvegarde `exports/NOM_PROJET/NOM_PROJET_analyse.json` et `_transcription.txt`

**Exemple de sortie :**
```
EXTRAIT #1  ★★★★  (Score: 84/100)
Timestamps : 00:01:23 → 00:02:01  (38s)
Rythme     : 3.2 mots/sec  ✓ Début accrocheur

TEXTE NETTOYÉ :
> La plupart des entrepreneurs qui s'expatrient font une erreur
> fondamentale au niveau fiscal. Ils pensent que le simple fait
> de partir suffit, mais en réalité...

SUGGESTIONS HOOK :
  → "La plupart des entrepreneurs expatriés..."
  → "L'erreur fiscale que personne ne voit..."
```

---

## Étape 3 — Monter la vidéo finale

```bash
python3 scripts/louis_format.py \
  --projet NOM_PROJET \
  --extrait 1 \
  --hook "L'erreur fiscale que font tous les expatriés"
```

**Options disponibles :**

```bash
# Timestamps manuels (sans passer par l'analyse)
python3 scripts/louis_format.py \
  --projet NOM_PROJET \
  --fichier rush.mp4 \
  --debut 00:01:23 --fin 00:02:01 \
  --hook "TON HOOK"

# Variante de la phrase du bas
python3 scripts/louis_format.py \
  --projet NOM_PROJET \
  --extrait 2 \
  --hook "TON HOOK" \
  --phrase-bas "(Il accompagne les entrepreneurs lors de leur expatriation)"

# Test rapide sans sous-titres (plus rapide)
python3 scripts/louis_format.py \
  --projet NOM_PROJET \
  --extrait 1 \
  --hook "TON HOOK" \
  --sans-sous-titres

# Nom de fichier de sortie personnalisé
python3 scripts/louis_format.py \
  --projet NOM_PROJET \
  --extrait 1 \
  --hook "TON HOOK" \
  --sortie erreur-fiscale-v2
```

---

## Étape 4 — Récupérer les exports

Dans `exports/NOM_PROJET/` :

| Fichier | Usage |
|---------|-------|
| `NOM_PROJET_FINAL_9x16.mp4` | Prêt à publier sur Instagram, TikTok, Shorts |
| `NOM_PROJET_subtitles.srt` | Sous-titres séparés (si besoin d'éditer) |
| `NOM_PROJET_transcription.txt` | Transcription complète du rush |
| `NOM_PROJET_analyse.json` | Données de l'analyse (pour relancer le montage) |

---

## Ce que les scripts font automatiquement

| Étape | Outil | Détail |
|-------|-------|--------|
| Transcription | Whisper AI (small) | ~95% précision en français |
| Nettoyage | Regex | Supprime euh, heu, bah, ben, répétitions |
| Extraction | FFmpeg | Découpe précise du segment |
| Zoom 150% | FFmpeg | scale → crop centre → pad noir |
| Audio | FFmpeg loudnorm | Standard YouTube -16 LUFS |
| Sous-titres | FFmpeg + ASS | Times New Roman, ombre 60%, position précise |
| Hook | FFmpeg drawtext | Times New Roman, bande noire haut |
| Phrase fixe | FFmpeg drawtext | Times New Roman, bande noire bas |
| Export | libx264 CRF 20 | 1080×1920, yuv420p, faststart |

---

## Structure des dossiers

```
video-editing/
├── WORKFLOW.md               ← Ce fichier
├── briefs/
│   ├── LOUIS_BRIEF_TEMPLATE.md   ← Template de brief
│   └── [projets].md              ← Tes briefs
├── rush/
│   └── [projet]/                 ← Fichiers bruts (non synchronisés Git)
├── exports/
│   └── [projet]/
│       ├── *_FINAL_9x16.mp4      ← Livrable final
│       ├── *_subtitles.srt       ← Sous-titres (synchronisés Git)
│       ├── *_transcription.txt   ← Transcription
│       └── *_analyse.json        ← Données d'analyse
└── scripts/
    ├── setup.sh              ← Installation des outils
    ├── analyze_rush.py       ← Analyse + proposition d'extraits
    ├── louis_format.py       ← Pipeline montage 9:16 Louis
    ├── process.py            ← Pipeline général (autres projets)
    └── concat.py             ← Assemblage de clips
```

---

## Dépannage

```bash
# Vérifier FFmpeg
ffmpeg -version

# Vérifier Whisper
python3 -c "import whisper; print('Whisper OK')"

# Lister les polices Times disponibles
fc-list | grep -i times

# Aide complète
python3 scripts/analyze_rush.py --help
python3 scripts/louis_format.py --help
```

**Times New Roman non trouvée ?**
```bash
sudo apt-get install ttf-mscorefonts-installer
# ou
sudo apt-get install fonts-liberation
```
