#!/usr/bin/env python3
"""
Pipeline de montage automatique.
Usage: python3 process.py --projet NOM_PROJET [options]
"""

import argparse
import subprocess
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
RUSH_DIR = ROOT / "rush"
EXPORTS_DIR = ROOT / "exports"
SCRIPTS_DIR = ROOT / "scripts"


def run(cmd: list, desc: str = ""):
    print(f"  → {desc or ' '.join(cmd[:3])}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ERREUR: {result.stderr[-500:]}")
        sys.exit(1)
    return result.stdout


def get_duration(filepath: Path) -> float:
    out = run([
        "ffprobe", "-v", "quiet", "-print_format", "json",
        "-show_format", str(filepath)
    ])
    return float(json.loads(out)["format"]["duration"])


def normalize_audio(input_path: Path, output_path: Path):
    run([
        "ffmpeg", "-y", "-i", str(input_path),
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
        str(output_path)
    ], "Normalisation audio")


def remove_silences(input_path: Path, output_path: Path, min_silence_len: float = 1.5):
    """Détecte et coupe les silences > min_silence_len secondes."""
    print(f"  → Détection des silences (>{min_silence_len}s)...")

    # Détection des silences
    result = subprocess.run([
        "ffmpeg", "-i", str(input_path),
        "-af", f"silencedetect=noise=-35dB:d={min_silence_len}",
        "-f", "null", "-"
    ], capture_output=True, text=True)

    # Parsing des timestamps de silence
    lines = result.stderr.split("\n")
    silence_starts = []
    silence_ends = []
    for line in lines:
        if "silence_start" in line:
            silence_starts.append(float(line.split("silence_start: ")[1].strip()))
        if "silence_end" in line:
            silence_ends.append(float(line.split("silence_end: ")[1].split("|")[0].strip()))

    if not silence_starts:
        print("  → Aucun silence détecté, copie directe")
        run(["ffmpeg", "-y", "-i", str(input_path), "-c", "copy", str(output_path)], "Copie")
        return

    # Construction des segments à garder
    duration = get_duration(input_path)
    segments = []
    prev_end = 0.0

    for start, end in zip(silence_starts, silence_ends):
        if start > prev_end + 0.1:
            segments.append((prev_end, start))
        prev_end = end

    if prev_end < duration - 0.1:
        segments.append((prev_end, duration))

    print(f"  → {len(silence_starts)} silences trouvés, {len(segments)} segments conservés")

    # Génération du filtre concat
    filter_parts = []
    for i, (start, end) in enumerate(segments):
        filter_parts.append(f"[0:v]trim={start:.3f}:{end:.3f},setpts=PTS-STARTPTS[v{i}];")
        filter_parts.append(f"[0:a]atrim={start:.3f}:{end:.3f},asetpts=PTS-STARTPTS[a{i}];")

    n = len(segments)
    concat_inputs = "".join(f"[v{i}][a{i}]" for i in range(n))
    filter_complex = "".join(filter_parts) + f"{concat_inputs}concat=n={n}:v=1:a=1[outv][outa]"

    run([
        "ffmpeg", "-y", "-i", str(input_path),
        "-filter_complex", filter_complex,
        "-map", "[outv]", "-map", "[outa]",
        str(output_path)
    ], f"Assemblage {n} segments")


def generate_subtitles(input_path: Path, output_path: Path, language: str = "fr"):
    """Génère un fichier SRT avec Whisper."""
    try:
        import whisper
    except ImportError:
        print("  ⚠ Whisper non installé. Lance: pip3 install openai-whisper")
        return

    print(f"  → Transcription Whisper (langue: {language})...")
    model = whisper.load_model("base")
    result = model.transcribe(str(input_path), language=language)

    srt_content = []
    for i, segment in enumerate(result["segments"], 1):
        start = format_timestamp(segment["start"])
        end = format_timestamp(segment["end"])
        text = segment["text"].strip()
        srt_content.append(f"{i}\n{start} --> {end}\n{text}\n")

    output_path.write_text("\n".join(srt_content), encoding="utf-8")
    print(f"  → Sous-titres sauvegardés: {output_path.name}")


def format_timestamp(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def create_short(input_path: Path, output_path: Path, start: str = None, duration: int = 55):
    """Extrait un clip court en format vertical 9:16."""
    cmd = ["ffmpeg", "-y"]
    if start:
        cmd += ["-ss", start]
    cmd += [
        "-i", str(input_path),
        "-t", str(duration),
        "-vf", "crop=ih*9/16:ih,scale=1080:1920",
        "-c:v", "libx264", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k",
        str(output_path)
    ]
    run(cmd, f"Création Short ({duration}s)")


def burn_subtitles(input_path: Path, srt_path: Path, output_path: Path):
    """Incruste les sous-titres dans la vidéo."""
    run([
        "ffmpeg", "-y", "-i", str(input_path),
        "-vf", f"subtitles={srt_path}:force_style='FontSize=22,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2'",
        "-c:a", "copy",
        str(output_path)
    ], "Incrustation sous-titres")


def main():
    parser = argparse.ArgumentParser(description="Pipeline de montage automatique")
    parser.add_argument("--projet", required=True, help="Nom du projet (dossier dans rush/)")
    parser.add_argument("--fichier", help="Fichier vidéo principal (optionnel si un seul fichier)")
    parser.add_argument("--silences", action="store_true", help="Couper les silences")
    parser.add_argument("--silence-min", type=float, default=1.5, help="Durée min silence en secondes (défaut: 1.5)")
    parser.add_argument("--sous-titres", action="store_true", help="Générer les sous-titres")
    parser.add_argument("--short", action="store_true", help="Créer une version Short 9:16")
    parser.add_argument("--short-debut", help="Timestamp de début du short (ex: 00:02:30)")
    parser.add_argument("--short-duree", type=int, default=55, help="Durée du short en secondes")
    parser.add_argument("--brule-sous-titres", action="store_true", help="Incruster les sous-titres dans la vidéo")
    parser.add_argument("--normalise-audio", action="store_true", help="Normaliser le volume audio")
    parser.add_argument("--tout", action="store_true", help="Tout faire: silences + sous-titres + short")
    args = parser.parse_args()

    rush_dir = RUSH_DIR / args.projet
    export_dir = EXPORTS_DIR / args.projet
    export_dir.mkdir(parents=True, exist_ok=True)

    if not rush_dir.exists():
        print(f"Erreur: dossier rush/{args.projet} introuvable")
        sys.exit(1)

    # Trouver le fichier principal
    if args.fichier:
        main_file = rush_dir / args.fichier
    else:
        video_files = list(rush_dir.glob("*.mp4")) + list(rush_dir.glob("*.mov")) + list(rush_dir.glob("*.avi"))
        if not video_files:
            print(f"Erreur: aucun fichier vidéo dans rush/{args.projet}/")
            sys.exit(1)
        if len(video_files) > 1:
            print(f"Plusieurs fichiers trouvés, utilise --fichier pour préciser:")
            for f in video_files:
                print(f"  {f.name}")
            sys.exit(1)
        main_file = video_files[0]

    print(f"\n=== Montage: {args.projet} ===")
    print(f"Fichier source: {main_file.name}")
    print(f"Export vers: {export_dir}/\n")

    current_file = main_file
    step = 0

    if args.tout:
        args.silences = args.sous_titres = args.short = args.normalise_audio = True

    # Étape 1 : Normalisation audio
    if args.normalise_audio:
        step += 1
        out = export_dir / f"step{step}_audio_norm.mp4"
        print(f"[{step}] Normalisation audio")
        normalize_audio(current_file, out)
        current_file = out

    # Étape 2 : Suppression des silences
    if args.silences:
        step += 1
        out = export_dir / f"step{step}_sans_silences.mp4"
        print(f"[{step}] Suppression des silences")
        remove_silences(current_file, out, args.silence_min)
        current_file = out

    # Étape 3 : Sous-titres
    srt_file = None
    if args.sous_titres:
        step += 1
        srt_file = export_dir / f"{args.projet}_subtitles.srt"
        print(f"[{step}] Génération des sous-titres")
        generate_subtitles(current_file, srt_file)

    # Étape 4 : Incrustration des sous-titres
    if args.brule_sous_titres and srt_file and srt_file.exists():
        step += 1
        out = export_dir / f"step{step}_avec_sous_titres.mp4"
        print(f"[{step}] Incrustation des sous-titres")
        burn_subtitles(current_file, srt_file, out)
        current_file = out

    # Export final longue durée
    final_long = export_dir / f"{args.projet}_FINAL_16x9.mp4"
    run(["ffmpeg", "-y", "-i", str(current_file), "-c", "copy", str(final_long)], "Export final 16:9")
    print(f"\n  Vidéo longue: {final_long.name}")

    # Étape 5 : Short
    if args.short:
        step += 1
        short_out = export_dir / f"{args.projet}_SHORT_9x16.mp4"
        print(f"[{step}] Création du Short")
        create_short(current_file, short_out, args.short_debut, args.short_duree)
        print(f"  Short: {short_out.name}")

    print(f"\n=== Terminé ! Exports dans exports/{args.projet}/ ===\n")


if __name__ == "__main__":
    main()
