#!/usr/bin/env python3
"""
Assemble plusieurs clips dans l'ordre spécifié.
Usage: python3 concat.py --projet NOM --clips intro.mp4 partie1.mp4 outro.mp4
"""

import argparse
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).parent.parent


def main():
    parser = argparse.ArgumentParser(description="Assemblage de clips dans l'ordre")
    parser.add_argument("--projet", required=True)
    parser.add_argument("--clips", nargs="+", required=True, help="Fichiers dans rush/projet/ dans l'ordre voulu")
    parser.add_argument("--sortie", default=None, help="Nom du fichier de sortie")
    args = parser.parse_args()

    rush_dir = ROOT / "rush" / args.projet
    export_dir = ROOT / "exports" / args.projet
    export_dir.mkdir(parents=True, exist_ok=True)

    # Vérification des fichiers
    clips = []
    for clip_name in args.clips:
        clip_path = rush_dir / clip_name
        if not clip_path.exists():
            print(f"Erreur: fichier introuvable: {clip_path}")
            return
        clips.append(clip_path)

    print(f"\n=== Assemblage {len(clips)} clips ===")
    for c in clips:
        print(f"  + {c.name}")

    # Fichier de liste pour FFmpeg concat
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        for clip in clips:
            f.write(f"file '{clip.absolute()}'\n")
        list_file = f.name

    sortie_nom = args.sortie or f"{args.projet}_assemblé.mp4"
    output = export_dir / sortie_nom

    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", list_file,
        "-c", "copy", str(output)
    ], check=True)

    print(f"\n  Export: {output}")


if __name__ == "__main__":
    main()
