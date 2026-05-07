#!/bin/bash
# Installation des dépendances pour le pipeline de montage
set -e

echo "=== Installation des outils de montage ==="

# FFmpeg
if ! command -v ffmpeg &>/dev/null; then
    echo "Installation FFmpeg..."
    sudo apt-get update -qq && sudo apt-get install -y ffmpeg
else
    echo "FFmpeg déjà installé : $(ffmpeg -version 2>&1 | head -1)"
fi

# Python + pip
if ! command -v python3 &>/dev/null; then
    sudo apt-get install -y python3 python3-pip
fi

# Whisper (transcription automatique)
if ! python3 -c "import whisper" 2>/dev/null; then
    echo "Installation Whisper..."
    pip3 install openai-whisper
else
    echo "Whisper déjà installé"
fi

# Dépendances Python supplémentaires
pip3 install -q pydub numpy tqdm

echo ""
echo "=== Installation terminée ==="
echo "Lance ./scripts/process.py --help pour voir les options"
