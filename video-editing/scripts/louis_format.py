#!/usr/bin/env python3
"""
Pipeline de montage final pour Louis — format vertical 9:16 Instagram/TikTok/Shorts.

Usage:
  # Depuis une analyse existante (recommandé)
  python3 louis_format.py --projet MON_PROJET --extrait 1 --hook "Le secret de l'expatriation"

  # Avec timestamps manuels
  python3 louis_format.py --projet MON_PROJET --fichier video.mp4 \\
      --debut 00:01:23 --fin 00:02:05 --hook "Le secret de l'expatriation"

  # Phrase de bas personnalisée
  python3 louis_format.py ... --phrase-bas "Il accompagne les entrepreneurs lors de leur expatriation"
"""

import argparse
import json
import re
import subprocess
import sys
import tempfile
import shutil
from pathlib import Path

ROOT = Path(__file__).parent.parent
RUSH_DIR = ROOT / "rush"
EXPORTS_DIR = ROOT / "exports"

# ─── Dimensions ───────────────────────────────────────────────────────────────
OUT_W = 1080
OUT_H = 1920
ZOOM = 1.5

# Vidéo horizontale affichée à pleine largeur (1080px) → h = 1080 * 9/16 = 607.5
VIDEO_DISPLAY_W = OUT_W
VIDEO_DISPLAY_H = int(OUT_W * 9 / 16)        # 607

# Après zoom 150% : on agrandit puis on recadre au centre
SCALED_W = int(VIDEO_DISPLAY_W * ZOOM)        # 1620
SCALED_H = int(VIDEO_DISPLAY_H * ZOOM)        # 910

# Décalage de crop pour centrer
CROP_X = (SCALED_W - VIDEO_DISPLAY_W) // 2   # 270
CROP_Y = (SCALED_H - VIDEO_DISPLAY_H) // 2   # 151 (légèrement haut pour le visage)

# Position de la vidéo dans le cadre 9:16 (centrée verticalement)
BAR_H = (OUT_H - VIDEO_DISPLAY_H) // 2       # 656 (bande noire haut & bas)

# Zones de texte
HOOK_Y = BAR_H // 2          # Centre de la bande du haut ≈ 328
PHRASE_Y = OUT_H - BAR_H // 2  # Centre de la bande du bas ≈ 1592

# Sous-titres : dans la vidéo, 40px au-dessus du bas de la zone vidéo
SUBTITLE_BOTTOM_MARGIN = OUT_H - BAR_H - 45  # Baseline depuis le haut

# ─── Polices ──────────────────────────────────────────────────────────────────
FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/msttcorefonts/Times_New_Roman.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSerif.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    "/usr/share/fonts/truetype/ubuntu/Ubuntu-R.ttf",
    "/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf",
]

FILLER_WORDS_PATTERN = re.compile(
    r"\b(euh+|heu+|eh|bah|ben|voilà|d'accord|hein|enfin bref|"
    r"c'est-à-dire|ouais bon|ok donc|bon ben|alors euh|donc euh|"
    r"genre|machin|truc)\b",
    re.IGNORECASE,
)


def find_font() -> str:
    for path in FONT_CANDIDATES:
        if Path(path).exists():
            return path
    # Recherche système
    result = subprocess.run(
        ["fc-list", ":family=Times New Roman:style=Regular", "--format=%{file}\n"],
        capture_output=True, text=True,
    )
    if result.returncode == 0 and result.stdout.strip():
        return result.stdout.strip().split("\n")[0]
    return ""


def run(cmd: list, desc: str = "", check: bool = True):
    print(f"  → {desc}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if check and result.returncode != 0:
        print(f"\n  ERREUR FFmpeg:\n{result.stderr[-1000:]}")
        sys.exit(1)
    return result


def ts_to_seconds(ts: str) -> float:
    """Convertit HH:MM:SS ou MM:SS en secondes."""
    parts = ts.replace(",", ".").split(":")
    if len(parts) == 3:
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
    elif len(parts) == 2:
        return int(parts[0]) * 60 + float(parts[1])
    return float(parts[0])


def seconds_to_srt_ts(s: float) -> str:
    h = int(s // 3600)
    m = int((s % 3600) // 60)
    sec = int(s % 60)
    ms = int((s % 1) * 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"


def clean_subtitle_text(text: str) -> str:
    """Nettoie un segment de sous-titre : hésitations, espaces, ponctuation."""
    t = FILLER_WORDS_PATTERN.sub("", text)
    t = re.sub(r"\s+", " ", t)
    t = re.sub(r"\s([,;.!?])", r"\1", t)
    t = re.sub(r"^[,;\s]+", "", t)
    return t.strip()


def create_srt(whisper_segments: list, start_offset: float = 0.0) -> str:
    """Génère un SRT propre depuis les segments Whisper, avec offset de temps."""
    lines = []
    index = 1
    for seg in whisper_segments:
        text = clean_subtitle_text(seg["text"])
        if not text:
            continue
        # Découpe en sous-segments si trop long (>42 chars)
        if len(text) > 42:
            words = text.split()
            mid = len(words) // 2
            text = " ".join(words[:mid]) + "\n" + " ".join(words[mid:])

        t_start = seg["start"] - start_offset
        t_end = seg["end"] - start_offset
        if t_start < 0:
            continue

        lines.append(str(index))
        lines.append(f"{seconds_to_srt_ts(t_start)} --> {seconds_to_srt_ts(t_end)}")
        lines.append(text)
        lines.append("")
        index += 1
    return "\n".join(lines)


def build_ass_subtitles(
    srt_content: str,
    font_path: str,
    video_bottom_y: int,
    out_w: int = OUT_W,
    out_h: int = OUT_H,
) -> str:
    """Convertit un SRT en fichier ASS avec le style de Louis."""
    font_name = "Times New Roman"
    if font_path and "Liberation" in font_path:
        font_name = "Liberation Serif"
    elif font_path and "FreeSerif" in font_path:
        font_name = "FreeSerif"
    elif font_path and "DejaVu" in font_path:
        font_name = "DejaVu Serif"

    # MarginV = distance depuis le bas du cadre jusqu'au bas du texte
    margin_v = out_h - video_bottom_y + 45

    ass_header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {out_w}
PlayResY: {out_h}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Louis,{font_name},36,&H00FFFFFF,&H000000FF,&H00000000,&H99000000,0,0,0,0,100,100,0,0,3,0,3,2,30,30,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    events = []
    blocks = [b.strip() for b in srt_content.strip().split("\n\n") if b.strip()]
    for block in blocks:
        lines = block.split("\n")
        if len(lines) < 3:
            continue
        # Ligne 1: index, ligne 2: timestamps, ligne 3+: texte
        ts_line = lines[1]
        text_lines = lines[2:]

        # Parse timestamps
        try:
            start_str, end_str = ts_line.split(" --> ")
            def srt_to_ass_ts(s):
                s = s.strip().replace(",", ".")
                parts = s.split(":")
                h, m = int(parts[0]), int(parts[1])
                sec = float(parts[2])
                return f"{h}:{m:02d}:{sec:05.2f}"
            start_ass = srt_to_ass_ts(start_str)
            end_ass = srt_to_ass_ts(end_str)
        except Exception:
            continue

        # Texte ASS (remplace \n par \N pour ASS)
        ass_text = r"\N".join(text_lines)
        # Nettoyage caractères spéciaux ASS
        ass_text = ass_text.replace("{", r"\{").replace("}", r"\}")

        events.append(
            f"Dialogue: 0,{start_ass},{end_ass},Louis,,0,0,0,,{ass_text}"
        )

    return ass_header + "\n".join(events)


def escape_drawtext(text: str) -> str:
    """Échappe les caractères spéciaux pour le filtre drawtext de FFmpeg."""
    text = text.replace("\\", "\\\\")
    text = text.replace("'", "\\'")
    text = text.replace(":", "\\:")
    text = text.replace("[", "\\[").replace("]", "\\]")
    return text


def build_ffmpeg_filter(
    hook_text: str,
    phrase_bas: str,
    ass_path: str,
    font_path: str,
) -> str:
    """Construit le graphe de filtres FFmpeg complet."""
    font_arg = f":fontfile='{font_path}'" if font_path else ""

    hook_escaped = escape_drawtext(hook_text)
    phrase_escaped = escape_drawtext(phrase_bas)

    # ── Étape 1 : Mise en forme 9:16 avec zoom 150% ──────────────────────────
    # scale → crop center → pad avec bandes noires
    reshape = (
        f"scale={SCALED_W}:{SCALED_H},"
        f"crop={VIDEO_DISPLAY_W}:{VIDEO_DISPLAY_H}:{CROP_X}:{CROP_Y},"
        f"pad={OUT_W}:{OUT_H}:0:{BAR_H}:black"
    )

    # ── Étape 2 : Sous-titres ASS ─────────────────────────────────────────────
    subs = f"subtitles='{ass_path}'"

    # ── Étape 3 : Hook (bande noire du haut) ─────────────────────────────────
    # Fond semi-transparent derrière le hook
    hook = (
        f"drawtext=text='{hook_escaped}'"
        f"{font_arg}"
        f":fontcolor=white"
        f":fontsize=38"
        f":x=(w-text_w)/2"
        f":y={HOOK_Y}-text_h/2"
        f":shadowx=2:shadowy=2:shadowcolor=black@0.8"
        f":box=1:boxcolor=black@0.0"
    )

    # ── Étape 4 : Phrase fixe (bande noire du bas) ────────────────────────────
    phrase = (
        f"drawtext=text='{phrase_escaped}'"
        f"{font_arg}"
        f":fontcolor=white@0.85"
        f":fontsize=26"
        f":x=(w-text_w)/2"
        f":y={PHRASE_Y}-text_h/2"
        f":shadowx=1:shadowy=1:shadowcolor=black@0.9"
    )

    return f"{reshape},{subs},{hook},{phrase}"


def load_analysis(projet: str) -> dict | None:
    path = EXPORTS_DIR / projet / f"{projet}_analyse.json"
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return None


def transcribe_segment(video_path: Path, start: float, end: float, model_name: str = "small"):
    """Transcrit uniquement le segment sélectionné."""
    try:
        import whisper
    except ImportError:
        print("  ⚠ Whisper non installé. Les sous-titres ne seront pas générés.")
        return []

    print("  → Transcription du segment (Whisper)...")

    # Extraire le segment audio temporairement
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tf:
        tmp_audio = tf.name

    run([
        "ffmpeg", "-y", "-i", str(video_path),
        "-ss", str(start), "-t", str(end - start),
        "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
        tmp_audio
    ], "Extraction audio segment")

    model = whisper.load_model(model_name)
    result = model.transcribe(tmp_audio, language="fr", verbose=False)
    Path(tmp_audio).unlink(missing_ok=True)
    return result["segments"]


def main():
    parser = argparse.ArgumentParser(description="Montage final format Louis 9:16")
    parser.add_argument("--projet", required=True)
    parser.add_argument("--fichier", help="Fichier vidéo source (override auto-détection)")
    parser.add_argument("--extrait", type=int, help="Numéro de l'extrait depuis l'analyse (1-5)")
    parser.add_argument("--debut", help="Timestamp de début manuel (HH:MM:SS)")
    parser.add_argument("--fin", help="Timestamp de fin manuel (HH:MM:SS)")
    parser.add_argument("--hook", required=True, help="Texte du hook en haut de la vidéo")
    parser.add_argument(
        "--phrase-bas",
        default="(J'accompagne les entrepreneurs pour leur expatriation)",
        help="Phrase fixe en bas",
    )
    parser.add_argument("--modele-whisper", default="small",
                        choices=["tiny", "base", "small", "medium"])
    parser.add_argument("--sans-sous-titres", action="store_true",
                        help="Désactive les sous-titres (pour test rapide)")
    parser.add_argument("--sortie", help="Nom du fichier de sortie (sans extension)")
    args = parser.parse_args()

    rush_dir = RUSH_DIR / args.projet
    export_dir = EXPORTS_DIR / args.projet
    export_dir.mkdir(parents=True, exist_ok=True)

    # ── Résolution du fichier source ──────────────────────────────────────────
    if args.fichier:
        video_path = rush_dir / args.fichier
    else:
        exts = ["*.mp4", "*.mov", "*.avi", "*.mkv"]
        videos = [f for ext in exts for f in rush_dir.glob(ext)]
        if not videos:
            print(f"Erreur: aucun fichier vidéo dans rush/{args.projet}/")
            sys.exit(1)
        if len(videos) > 1:
            print("Plusieurs vidéos trouvées, utilise --fichier:")
            for v in videos:
                print(f"  {v.name}")
            sys.exit(1)
        video_path = videos[0]

    if not video_path.exists():
        print(f"Erreur: fichier introuvable: {video_path}")
        sys.exit(1)

    # ── Résolution des timestamps ─────────────────────────────────────────────
    start_sec, end_sec = None, None
    whisper_segments = []

    if args.extrait:
        analysis = load_analysis(args.projet)
        if not analysis:
            print(f"Erreur: pas d'analyse trouvée. Lance d'abord analyze_rush.py --projet {args.projet}")
            sys.exit(1)
        candidats = analysis.get("candidats", [])
        idx = args.extrait - 1
        if idx < 0 or idx >= len(candidats):
            print(f"Erreur: extrait #{args.extrait} introuvable (il y en a {len(candidats)})")
            sys.exit(1)
        c = candidats[idx]
        start_sec = c["start"]
        end_sec = c["end"]
        print(f"\n  Extrait #{args.extrait} : {start_sec}s → {end_sec}s  ({c['duration']}s)")
    elif args.debut and args.fin:
        start_sec = ts_to_seconds(args.debut)
        end_sec = ts_to_seconds(args.fin)
    else:
        print("Erreur: fournis --extrait N ou --debut/--fin")
        sys.exit(1)

    duration = end_sec - start_sec
    if duration > 55:
        print(f"  ⚠ Durée {duration:.1f}s > 55s. La vidéo sera longue pour un Short.")
    if duration < 20:
        print(f"  ⚠ Durée {duration:.1f}s < 20s. Extrait très court.")

    print(f"\n{'='*60}")
    print(f"  MONTAGE — {args.projet}")
    print(f"{'='*60}")
    print(f"  Source   : {video_path.name}")
    print(f"  Segment  : {start_sec:.1f}s → {end_sec:.1f}s  ({duration:.1f}s)")
    print(f"  Hook     : {args.hook}")
    print(f"  Phrase   : {args.phrase_bas}")
    print()

    font_path = find_font()
    if font_path:
        print(f"  Police   : {Path(font_path).name}")
    else:
        print("  Police   : police système (Times New Roman non trouvée)")

    # ── Extraction du segment vidéo ───────────────────────────────────────────
    segment_path = export_dir / f"{args.projet}_segment_raw.mp4"
    run([
        "ffmpeg", "-y",
        "-ss", str(start_sec), "-i", str(video_path),
        "-t", str(duration),
        "-c:v", "libx264", "-crf", "18", "-preset", "fast",
        "-c:a", "aac", "-b:a", "192k",
        str(segment_path)
    ], f"Extraction segment {duration:.1f}s")

    # ── Normalisation audio ───────────────────────────────────────────────────
    norm_path = export_dir / f"{args.projet}_segment_norm.mp4"
    run([
        "ffmpeg", "-y", "-i", str(segment_path),
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
        "-c:v", "copy",
        str(norm_path)
    ], "Normalisation audio (-16 LUFS)")

    # ── Transcription & sous-titres ───────────────────────────────────────────
    ass_path = None
    srt_path = export_dir / f"{args.projet}_subtitles.srt"

    if not args.sans_sous_titres:
        whisper_segments = transcribe_segment(norm_path, 0, duration, args.modele_whisper)

        if whisper_segments:
            srt_content = create_srt(whisper_segments)
            srt_path.write_text(srt_content, encoding="utf-8")
            print(f"  → SRT sauvegardé : {srt_path.name}")

            # Génération ASS
            ass_file = export_dir / f"{args.projet}_subtitles.ass"
            video_bottom_y = BAR_H + VIDEO_DISPLAY_H  # 656 + 607 = 1263
            ass_content = build_ass_subtitles(
                srt_content, font_path, video_bottom_y
            )
            ass_file.write_text(ass_content, encoding="utf-8")
            ass_path = str(ass_file)
        else:
            print("  ⚠ Aucun segment Whisper — sous-titres désactivés")

    # ── Construction du filtre FFmpeg ─────────────────────────────────────────
    with tempfile.NamedTemporaryFile(suffix=".ass", delete=False, mode="w", encoding="utf-8") as tf:
        tmp_ass = tf.name
        if ass_path:
            tf.write(Path(ass_path).read_text(encoding="utf-8"))
        else:
            # ASS vide (pas de sous-titres)
            tf.write("[Script Info]\nScriptType: v4.00+\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")

    vf = build_ffmpeg_filter(args.hook, args.phrase_bas, tmp_ass, font_path)

    # ── Export final ──────────────────────────────────────────────────────────
    output_name = args.sortie or f"{args.projet}_FINAL_9x16"
    output_path = export_dir / f"{output_name}.mp4"

    run([
        "ffmpeg", "-y", "-i", str(norm_path),
        "-vf", vf,
        "-c:v", "libx264", "-crf", "20", "-preset", "medium",
        "-profile:v", "high", "-level", "4.0",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-movflags", "+faststart",
        str(output_path)
    ], "Export final 1080×1920")

    Path(tmp_ass).unlink(missing_ok=True)

    # ── Nettoyage fichiers intermédiaires ─────────────────────────────────────
    segment_path.unlink(missing_ok=True)
    norm_path.unlink(missing_ok=True)

    # ── Résumé ────────────────────────────────────────────────────────────────
    size_mb = output_path.stat().st_size / (1024 * 1024) if output_path.exists() else 0
    print(f"\n{'='*60}")
    print(f"  TERMINÉ ✓")
    print(f"{'='*60}")
    print(f"  Fichier  : exports/{args.projet}/{output_path.name}")
    print(f"  Taille   : {size_mb:.1f} Mo")
    print(f"  Format   : 1080×1920  9:16  {duration:.1f}s")
    if srt_path.exists():
        print(f"  SRT      : exports/{args.projet}/{srt_path.name}")
    print(f"\n  Prêt pour Instagram Reels, TikTok et YouTube Shorts.")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
