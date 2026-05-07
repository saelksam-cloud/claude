# Brief Montage — Louis [NOM_PROJET]

## Infos du projet
- **Date** :
- **Nom du projet** : (ex: expatriation-fiscalite, erreurs-entrepreneurs, visa-dubai)
- **Fichier rush** : (nom du fichier dans rush/NOM_PROJET/)
- **Lien Drive** : (si fichier trop lourd pour Git)

## Contenu du rush
- **Durée approximative** :
- **Sujet abordé** :
- **Résumé rapide** : (2-3 lignes de ce dont Louis parle)

## Consignes de montage
- **Sélection** : [ ] Laisser l'IA proposer les meilleurs extraits
                  [ ] Timestamps précis : __:__ → __:__
- **Hook** : (optionnel — laisser vide pour que l'IA propose)
- **Phrase bas** : [ ] "(J'accompagne les entrepreneurs pour leur expatriation)"
                   [ ] "(Il accompagne les entrepreneurs lors de leur expatriation)"
                   [ ] Personnalisée : ___________

## Notes supplémentaires
(Moments clés à garder, passages à éviter, ambiance voulue...)

---

## Commandes à lancer

```bash
# 1. Analyser le rush et voir les meilleurs extraits
python3 video-editing/scripts/analyze_rush.py --projet NOM_PROJET

# 2. Monter l'extrait choisi (ex: extrait #1)
python3 video-editing/scripts/louis_format.py \
  --projet NOM_PROJET \
  --extrait 1 \
  --hook "TON HOOK ICI"

# 3. Si tu veux des timestamps manuels
python3 video-editing/scripts/louis_format.py \
  --projet NOM_PROJET \
  --debut 00:01:23 --fin 00:02:05 \
  --hook "TON HOOK ICI"
```
