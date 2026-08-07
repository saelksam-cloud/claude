"""
Test rapide de connexion a l'API externe Odoo (XML-RPC).

A LANCER DEPUIS TA MACHINE — ne partage jamais ton URL/identifiant/cle API
dans un chat ou un endroit public. Ce script ne fait que LIRE quelques
enregistrements (aucune ecriture), pour verifier que l'acces externe
fonctionne sur ton instance avant qu'on branche quoi que ce soit de plus
serieux.

Prerequis :
1. Genere une cle API : dans Odoo, clique sur ton avatar (en haut a droite)
   > "Mon profil" > onglet "Securite du compte" > "Nouvelle cle API".
   Odoo ne l'affiche qu'une seule fois : copie-la immediatement.
2. Renseigne les variables d'environnement ci-dessous (recommande, pour ne
   rien laisser en clair dans un fichier), ou modifie les valeurs par
   defaut directement dans ce script pour un test local ponctuel.

Utilisation :
    export ODOO_URL="https://tonentreprise.odoo.com"
    export ODOO_DB="tonentreprise"
    export ODOO_USERNAME="toi@exemple.com"
    export ODOO_API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    python odoo_api_test.py

Aucune dependance externe : uniquement la bibliotheque standard Python
(xmlrpc.client), disponible partout.
"""

from __future__ import annotations

import os
import xmlrpc.client

URL = os.environ.get("ODOO_URL", "https://tonentreprise.odoo.com")
DB = os.environ.get("ODOO_DB", "tonentreprise")
USERNAME = os.environ.get("ODOO_USERNAME", "toi@exemple.com")
API_KEY = os.environ.get("ODOO_API_KEY", "")


def main() -> None:
    if not API_KEY:
        print("ODOO_API_KEY n'est pas renseignee (variable d'environnement). Arret.")
        return

    common = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/common")
    try:
        version_info = common.version()
    except Exception as exc:  # connexion / URL invalide
        print(f"Impossible de joindre {URL} : {exc}")
        return
    print("Connexion OK. Version Odoo detectee :", version_info)

    try:
        uid = common.authenticate(DB, USERNAME, API_KEY, {})
    except Exception as exc:
        print(f"Erreur d'authentification : {exc}")
        return
    if not uid:
        print("Echec d'authentification (uid vide). Verifie DB / identifiant / cle API.")
        return
    print(f"Authentifie avec succes (uid={uid}).")

    models = xmlrpc.client.ServerProxy(f"{URL}/xmlrpc/2/object")

    # ---- Test 1 : lire quelques produits ----
    try:
        product_ids = models.execute_kw(
            DB, uid, API_KEY,
            "product.product", "search",
            [[]], {"limit": 5},
        )
        products = models.execute_kw(
            DB, uid, API_KEY,
            "product.product", "read",
            [product_ids], {"fields": ["default_code", "name", "uom_id", "qty_available"]},
        )
        print(f"\n{len(products)} produit(s) lu(s) via product.product :")
        for p in products:
            print(" -", p)
    except xmlrpc.client.Fault as exc:
        print("\nImpossible de lire product.product :", exc)

    # ---- Test 2 : lire quelques nomenclatures (app Fabrication requise) ----
    try:
        bom_ids = models.execute_kw(
            DB, uid, API_KEY,
            "mrp.bom", "search",
            [[]], {"limit": 5},
        )
        boms = models.execute_kw(
            DB, uid, API_KEY,
            "mrp.bom", "read",
            [bom_ids], {"fields": ["product_tmpl_id", "product_id", "bom_line_ids"]},
        )
        print(f"\n{len(boms)} nomenclature(s) lue(s) via mrp.bom :")
        for b in boms:
            print(" -", b)
    except xmlrpc.client.Fault as exc:
        print("\nImpossible de lire mrp.bom (app Fabrication installee ? droits suffisants ?) :", exc)


if __name__ == "__main__":
    main()
