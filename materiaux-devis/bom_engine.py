"""
Moteur d'explosion de nomenclature (BOM) pour le prototype "devis -> liste de materiaux".

Principe :
    - On charge le catalogue produits et les nomenclatures exportes d'Odoo
      (mrp.bom / mrp.bom.line, un article par ligne de composant).
    - Pour chaque ligne du devis (reference produit + quantite), on "explose"
      recursivement la nomenclature jusqu'aux articles qui n'ont pas de
      nomenclature (= matieres/composants bruts a acheter ou sortir du stock).
    - On agrege les besoins par article, puis on compare a la quantite en
      stock pour savoir ce qu'il faut commander.

Ce module ne depend d'aucune bibliotheque externe : uniquement la stdlib,
pour rester facile a brancher plus tard sur l'API Odoo (XML-RPC) sans
changer la logique metier.
"""

from __future__ import annotations

import csv
from dataclasses import dataclass, field
from pathlib import Path


class BomEngineError(Exception):
    """Erreur metier du moteur (nomenclature circulaire, donnees invalides...)."""


@dataclass
class Product:
    ref: str
    name: str
    uom: str
    qty_available: float = 0.0
    # Certains articles ont une nomenclature (ex: un kit assemble en interne)
    # mais sont neanmoins geres comme un article de stock a part entiere
    # (on le prend tel quel en stock plutot que de le "fabriquer" a chaque
    # explosion). Dans Odoo ca correspond a une nomenclature "normale"
    # (produit stocke) plutot qu'une nomenclature "kit/phantom" (qui elle,
    # n'est qu'un regroupement de composants et doit toujours etre eclatee).
    # stop_explosion=True => on liste l'article lui-meme sans descendre
    # dans ses composants, meme s'il a une nomenclature.
    stop_explosion: bool = False


@dataclass
class DevisLine:
    product_ref: str
    description: str
    quantity: float


@dataclass
class MaterialNeed:
    ref: str
    name: str
    uom: str
    qty_needed: float
    qty_available: float

    @property
    def qty_to_order(self) -> float:
        return max(0.0, round(self.qty_needed - self.qty_available, 4))


@dataclass
class ExplosionReport:
    materials: list[MaterialNeed] = field(default_factory=list)
    unmatched: list[DevisLine] = field(default_factory=list)


def load_products(csv_path: str | Path) -> dict[str, Product]:
    """Charge un export produits Odoo : colonnes default_code,name,uom,qty_available
    et optionnellement stop_explosion (1/0 ou true/false)."""
    products: dict[str, Product] = {}
    with open(csv_path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            ref = row["default_code"].strip()
            products[ref] = Product(
                ref=ref,
                name=row["name"].strip(),
                uom=row["uom"].strip(),
                qty_available=float(row.get("qty_available") or 0),
                stop_explosion=(row.get("stop_explosion") or "").strip().lower() in ("1", "true", "vrai", "oui"),
            )
    return products


def load_boms(csv_path: str | Path) -> dict[str, list[tuple[str, float]]]:
    """Charge un export nomenclatures : bom_product_ref,component_ref,qty_per_unit,uom.

    Retourne { reference_produit_parent: [(reference_composant, qty_par_unite), ...] }
    """
    boms: dict[str, list[tuple[str, float]]] = {}
    with open(csv_path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            parent = row["bom_product_ref"].strip()
            component = row["component_ref"].strip()
            qty = float(row["qty_per_unit"])
            boms.setdefault(parent, []).append((component, qty))
    return boms


def load_devis(csv_path: str | Path) -> list[DevisLine]:
    """Charge un devis : product_ref,description,quantity."""
    lines: list[DevisLine] = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            lines.append(
                DevisLine(
                    product_ref=row["product_ref"].strip(),
                    description=row.get("description", "").strip(),
                    quantity=float(row["quantity"]),
                )
            )
    return lines


def _explode_one(
    ref: str,
    qty: float,
    products: dict[str, Product],
    boms: dict[str, list[tuple[str, float]]],
    acc: dict[str, float],
    ancestors: tuple[str, ...],
) -> None:
    """Explose recursivement `ref` (quantite `qty`) dans l'accumulateur `acc`.

    - Si `ref` n'a pas de nomenclature : c'est une feuille (matiere/article
      brut), on ajoute sa quantite.
    - Si `ref` a une nomenclature mais que le produit est marque
      `stop_explosion=True` (article stocke tel quel, ex: un kit assemble
      en interne) : on le traite comme une feuille, sans descendre dans
      ses composants.
    - Sinon (nomenclature "phantom", simple regroupement de composants) :
      on descend recursivement dans ses composants (qty * qty_par_unite).
    """
    if ref in ancestors:
        cycle = " -> ".join((*ancestors, ref))
        raise BomEngineError(f"Nomenclature circulaire detectee : {cycle}")

    product = products.get(ref)
    components = boms.get(ref)
    if not components or (product is not None and product.stop_explosion):
        acc[ref] = acc.get(ref, 0.0) + qty
        return

    for component_ref, qty_per_unit in components:
        _explode_one(component_ref, qty * qty_per_unit, products, boms, acc, (*ancestors, ref))


def explode_devis(
    devis_lines: list[DevisLine],
    products: dict[str, Product],
    boms: dict[str, list[tuple[str, float]]],
) -> ExplosionReport:
    """Calcule la liste de materiaux necessaires pour un devis complet.

    - Les lignes dont la reference n'existe pas dans le catalogue produits
      sont rapportees a part dans `unmatched` (rien ne peut etre deduit
      automatiquement pour elles : revue manuelle ou matching assiste necessaire).
    - Les autres lignes sont explosees recursivement ; les quantites des
      memes composants (venant de lignes de devis differentes, ou de
      sous-nomenclatures partagees) sont additionnees.
    """
    acc: dict[str, float] = {}
    unmatched: list[DevisLine] = []

    for line in devis_lines:
        if line.product_ref not in products:
            unmatched.append(line)
            continue
        _explode_one(line.product_ref, line.quantity, products, boms, acc, ())

    materials = []
    for ref, qty_needed in sorted(acc.items()):
        product = products.get(ref)
        if product is None:
            # Composant present dans une nomenclature mais absent du catalogue
            # produits fourni : on le signale quand meme avec les infos qu'on a.
            materials.append(
                MaterialNeed(ref=ref, name=f"(fiche produit manquante: {ref})", uom="?", qty_needed=round(qty_needed, 4), qty_available=0.0)
            )
            continue
        materials.append(
            MaterialNeed(
                ref=product.ref,
                name=product.name,
                uom=product.uom,
                qty_needed=round(qty_needed, 4),
                qty_available=product.qty_available,
            )
        )

    return ExplosionReport(materials=materials, unmatched=unmatched)
