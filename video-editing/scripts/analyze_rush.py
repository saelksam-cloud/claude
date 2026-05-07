#!/usr/bin/env python3
"""
Analyse un rush vidéo de Louis et propose les meilleurs extraits pour un Short/Reel.
Usage: python3 analyze_rush.py --projet NOM_PROJET --fichier video.mp4

Sortie:
  - Transcription complète nettoyée
  - Top 3-5 extraits candidats avec timestamps, score et raison
  - Fichier JSON à passer à louis_format.py
"""

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
RUSH_DIR = ROOT / "rush"
EXPORTS_DIR = ROOT / "exports"

# Mots parasites à détecter (pour scoring)
FILLER_WORDS = [
    r"\beuh+\b", r"\bheu+\b", r"\beh\b", r"\bbah\b", r"\bben\b",
    r"\bvoilà\b", r"\bdonc\b", r"\bd'accord\b", r"\bokay\b", r"\bquoi\b",
    r"\bhein\b", r"\benfin\b", r"\bc'est-à-dire\b", r"\bclairement\b",
    r"\bfranchement\b", r"\bconcrètement\b", r"\btypiquement\b",
]

# Mots signalant un contenu fort (bonus score)
HIGH_VALUE_WORDS = [
    "expatriation", "entrepreneur", "entreprise", "pays", "visa", "fiscalité",
    "impôt", "résidence", "statut", "erreur", "conseil", "stratégie",
    "liberté", "revenus", "argent", "économie", "avantage", "risque",
    "clé", "important", "essentiel", "premier", "secret", "vérité",
    "jamais", "toujours", "meilleur", "pire", "problème", "solution",
]

# Début de phrases accrocheurs
HOOK_STARTERS = [
    r"la plupart des", r"ce que personne", r"le plus grand", r"la première",
    r"beaucoup de gens", r"ce qu'il faut", r"la clé ", r"si tu veux",
    r"le vrai problème", r"attention[,\s]", r"ce que j'ai appris",
    r"en fait[,\s]", r"la vraie question", r"ce que peu de gens",
    r"quand on parle de", r"il y a \w+ choses", r"il faut comprendre",
    r"je vais te dire", r"la réalité[,\s]", r"concrètement[,\s]",
]


def clean_text(text: str) -> str:
    """Nettoie le texte des mots parasites pour les sous-titres."""
    cleaned = text
    # Suppression des hésitations
    for pattern in FILLER_WORDS:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)
    # Nettoyer doublons d'espaces et ponctuation orpheline
    cleaned = re.sub(r"\s+", " ", cleaned)
    cleaned = re.sub(r"\s([,;.!?])", r"\1", cleaned)
    cleaned = re.sub(r"^[,;]\s*", "", cleaned)
    return cleaned.strip()


def score_segment(segments: list, start_idx: int, end_idx: int) -> dict:
    """Calcule le score d'un extrait basé sur sa qualité."""
    texts = [s["text"] for s in segments[start_idx:end_idx]]
    full_text = " ".join(texts).lower()

    duration = segments[end_idx - 1]["end"] - segments[start_idx]["start"]
    word_count = len(full_text.split())
    words_per_second = word_count / max(duration, 1)

    score = 50.0  # Base

    # Densité de parole (ni trop lent ni trop rapide)
    if 2.0 <= words_per_second <= 4.0:
        score += 15
    elif words_per_second < 1.2:
        score -= 20  # Trop de silences

    # Mots à forte valeur
    high_value_hits = sum(1 for w in HIGH_VALUE_WORDS if w in full_text)
    score += min(high_value_hits * 4, 20)

    # Mots parasites (malus)
    filler_hits = sum(
        len(re.findall(p, full_text, re.IGNORECASE)) for p in FILLER_WORDS
    )
    score -= min(filler_hits * 3, 25)

    # Débuts accrocheurs
    first_sentence = " ".join(texts[:3]).lower()
    hook_hits = sum(1 for h in HOOK_STARTERS if re.search(h, first_sentence))
    score += hook_hits * 8

    # Durée idéale 30-45s
    if 30 <= duration <= 45:
        score += 20
    elif 25 <= duration <= 50:
        score += 10
    elif duration < 20 or duration > 60:
        score -= 15

    return {
        "score": round(score, 1),
        "duration": round(duration, 1),
        "words_per_second": round(words_per_second, 2),
        "high_value_hits": high_value_hits,
        "filler_hits": filler_hits,
        "has_hook": hook_hits > 0,
    }


def find_best_segments(whisper_segments: list, target_min: int = 30, target_max: int = 50) -> list:
    """Trouve les meilleurs extraits en fenêtre glissante."""
    candidates = []
    n = len(whisper_segments)

    for i in range(n):
        for j in range(i + 3, n + 1):
            duration = whisper_segments[j - 1]["end"] - whisper_segments[i]["start"]
            if duration < 25:
                continue
            if duration > 65:
                break

            metrics = score_segment(whisper_segments, i, j)
            texts = [s["text"] for s in whisper_segments[i:j]]
            full_text = " ".join(texts)

            candidates.append({
                "start": round(whisper_segments[i]["start"], 2),
                "end": round(whisper_segments[j - 1]["end"], 2),
                "duration": metrics["duration"],
                "score": metrics["score"],
                "metrics": metrics,
                "text_raw": full_text,
                "text_clean": clean_text(full_text),
                "start_idx": i,
                "end_idx": j,
            })

    # Tri par score décroissant, dédoublonnage par chevauchement
    candidates.sort(key=lambda x: x["score"], reverse=True)
    selected = []
    for c in candidates:
        overlap = any(
            not (c["end"] <= s["start"] or c["start"] >= s["end"])
            for s in selected
        )
        if not overlap:
            selected.append(c)
        if len(selected) >= 5:
            break

    return selected


def format_timestamp(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    return f"{h:02d}:{m:02d}:{s:02d}"


def suggest_hook(text: str) -> list:
    """Génère des suggestions de hook à partir du texte de l'extrait."""
    sentences = re.split(r"[.!?]+", text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]

    hooks = []
    for sent in sentences[:5]:
        words = sent.split()
        if len(words) >= 5:
            # Version courte : 6-8 premiers mots
            short = " ".join(words[:7])
            if not short.endswith(("?", "!", ".")):
                short += "..."
            hooks.append(short)

    return hooks[:3] if hooks else ["[À définir selon le contenu]"]


def main():
    parser = argparse.ArgumentParser(description="Analyse un rush vidéo de Louis")
    parser.add_argument("--projet", required=True, help="Nom du projet")
    parser.add_argument("--fichier", help="Fichier vidéo (optionnel si un seul dans le dossier)")
    parser.add_argument("--modele-whisper", default="small", choices=["tiny", "base", "small", "medium"],
                        help="Modèle Whisper (défaut: small, meilleure qualité fr)")
    parser.add_argument("--json", action="store_true", help="Sortie JSON uniquement (pour scripts)")
    args = parser.parse_args()

    rush_dir = RUSH_DIR / args.projet
    export_dir = EXPORTS_DIR / args.projet
    export_dir.mkdir(parents=True, exist_ok=True)

    if not rush_dir.exists():
        print(f"Erreur: dossier rush/{args.projet}/ introuvable")
        sys.exit(1)

    # Trouver le fichier vidéo
    if args.fichier:
        video_path = rush_dir / args.fichier
    else:
        exts = ["*.mp4", "*.mov", "*.avi", "*.mkv"]
        videos = [f for ext in exts for f in rush_dir.glob(ext)]
        if not videos:
            print(f"Erreur: aucun fichier vidéo dans rush/{args.projet}/")
            sys.exit(1)
        if len(videos) > 1:
            print("Plusieurs vidéos trouvées. Utilise --fichier pour préciser:")
            for v in videos:
                print(f"  {v.name}")
            sys.exit(1)
        video_path = videos[0]

    if not args.json:
        print(f"\n{'='*60}")
        print(f"  ANALYSE RUSH — {args.projet}")
        print(f"{'='*60}")
        print(f"  Fichier : {video_path.name}")
        print(f"  Modèle  : Whisper {args.modele_whisper}")
        print()

    try:
        import whisper
    except ImportError:
        print("Erreur: Whisper non installé. Lance: pip3 install openai-whisper")
        sys.exit(1)

    if not args.json:
        print("  Transcription en cours (peut prendre 1-2 minutes)...")

    model = whisper.load_model(args.modele_whisper)
    result = model.transcribe(
        str(video_path),
        language="fr",
        task="transcribe",
        word_timestamps=False,
        verbose=False,
    )

    segments = result["segments"]
    full_text = " ".join(s["text"].strip() for s in segments)

    # Sauvegarde transcription complète
    transcript_path = export_dir / f"{args.projet}_transcription.txt"
    with open(transcript_path, "w", encoding="utf-8") as f:
        f.write("TRANSCRIPTION COMPLÈTE\n")
        f.write("=" * 50 + "\n\n")
        for seg in segments:
            ts = format_timestamp(seg["start"])
            f.write(f"[{ts}] {seg['text'].strip()}\n")
        f.write("\n\nTRANSCRIPTION NETTOYÉE\n")
        f.write("=" * 50 + "\n\n")
        f.write(clean_text(full_text))

    if not args.json:
        print(f"  Transcription sauvegardée : {transcript_path.name}")
        print(f"  Durée totale : {format_timestamp(segments[-1]['end'] if segments else 0)}")
        print(f"  Nombre de segments : {len(segments)}")

    # Recherche des meilleurs extraits
    if not args.json:
        print("\n  Recherche des meilleurs extraits...\n")

    best = find_best_segments(segments)

    # Suggestions de hooks pour chaque extrait
    for b in best:
        b["hook_suggestions"] = suggest_hook(b["text_clean"])

    # Sauvegarde JSON pour louis_format.py
    analysis_path = export_dir / f"{args.projet}_analyse.json"
    output_data = {
        "projet": args.projet,
        "fichier": str(video_path),
        "duree_totale": round(segments[-1]["end"] if segments else 0, 1),
        "candidats": best,
    }
    with open(analysis_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    if args.json:
        print(json.dumps(output_data, ensure_ascii=False, indent=2))
        return

    # Affichage lisible
    print(f"{'='*60}")
    print(f"  TOP {len(best)} EXTRAITS CANDIDATS")
    print(f"{'='*60}\n")

    for i, c in enumerate(best, 1):
        start_ts = format_timestamp(c["start"])
        end_ts = format_timestamp(c["end"])
        m = c["metrics"]

        stars = "★" * min(int(c["score"] / 20), 5)
        print(f"  EXTRAIT #{i}  {stars}  (Score: {c['score']}/100)")
        print(f"  ─────────────────────────────────────────")
        print(f"  Timestamps : {start_ts} → {end_ts}  ({c['duration']}s)")
        print(f"  Rythme     : {m['words_per_second']} mots/sec", end="")
        if m['has_hook']: print("  ✓ Début accrocheur", end="")
        print()
        print(f"  Contenu    : {m['high_value_hits']} mots-clés forts  |  {m['filler_hits']} hésitations")
        print()
        print(f"  TEXTE NETTOYÉ :")
        # Affichage sur 70 caractères max par ligne
        words = c["text_clean"].split()
        line, lines = [], []
        for w in words:
            line.append(w)
            if len(" ".join(line)) > 68:
                lines.append("  > " + " ".join(line[:-1]))
                line = [w]
        if line:
            lines.append("  > " + " ".join(line))
        print("\n".join(lines))
        print()
        print(f"  SUGGESTIONS HOOK (à placer en haut de la vidéo) :")
        for h in c["hook_suggestions"]:
            print(f"    → \"{h}\"")
        print()

    print(f"{'='*60}")
    print(f"  Analyse sauvegardée : exports/{args.projet}/{analysis_path.name}")
    print(f"\n  PROCHAINE ÉTAPE :")
    print(f"  python3 scripts/louis_format.py \\")
    print(f"    --projet {args.projet} \\")
    print(f"    --extrait 1 \\")
    print(f'    --hook "TON HOOK ICI"')
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
