"""Tests du moteur d'explosion de nomenclature (pytest)."""

import pytest

from bom_engine import (
    BomEngineError,
    DevisLine,
    Product,
    explode_devis,
    load_boms,
    load_devis,
    load_products,
)

DATA_DIR = "data"


@pytest.fixture
def products():
    return load_products(f"{DATA_DIR}/produits.csv")


@pytest.fixture
def boms():
    return load_boms(f"{DATA_DIR}/nomenclatures.csv")


def test_load_sample_data(products, boms):
    assert "CLO-BA13" in products
    assert products["CLO-BA13"].uom == "m2"
    assert boms["CLO-BA13"]  # a des composants
    assert boms["KIT-FIX"]  # sous-nomenclature imbriquee


def test_explode_simple_leaf(products, boms):
    # Une ligne de devis directement sur un article "feuille" (pas de nomenclature)
    devis = [DevisLine(product_ref="PLQ-BA13", description="plaques seules", quantity=10)]
    report = explode_devis(devis, products, boms)
    assert not report.unmatched
    assert len(report.materials) == 1
    assert report.materials[0].ref == "PLQ-BA13"
    assert report.materials[0].qty_needed == 10


def test_stocked_subassembly_is_not_exploded_further(products, boms):
    # KIT-FIX a une nomenclature (CHEVILLE-8 + VIS-6) mais est marque
    # stop_explosion=1 dans produits.csv car c'est un article stocke tel
    # quel : on doit le retrouver lui-meme dans le resultat, pas ses
    # composants internes.
    devis = [DevisLine(product_ref="CLO-BA13", description="1 m2 de cloison", quantity=1)]
    report = explode_devis(devis, products, boms)
    by_ref = {m.ref: m for m in report.materials}

    assert by_ref["PLQ-BA13"].qty_needed == 0.7
    assert by_ref["KIT-FIX"].qty_needed == pytest.approx(0.3)
    assert "CHEVILLE-8" not in by_ref
    assert "VIS-6" not in by_ref


def test_phantom_subassembly_is_exploded_to_raw_materials(products, boms):
    # ENS-VISSERIE n'a pas stop_explosion : c'est un simple regroupement
    # (nomenclature "phantom"), il doit toujours etre eclate jusqu'a ses
    # composants finaux, meme sur plusieurs niveaux.
    devis = [DevisLine(product_ref="CLO-BA13", description="1 m2 de cloison", quantity=1)]
    report = explode_devis(devis, products, boms)
    by_ref = {m.ref: m for m in report.materials}

    assert "ENS-VISSERIE" not in by_ref
    # VIS-3 = 0.1 (ens/m2) * 1 (par ens) = 0.1
    assert by_ref["VIS-3"].qty_needed == pytest.approx(0.1)
    assert by_ref["RONDELLE-8"].qty_needed == pytest.approx(0.1)


def test_aggregation_across_multiple_devis_lines(products, boms):
    devis = [
        DevisLine(product_ref="CLO-BA13", description="salon", quantity=25),
        DevisLine(product_ref="CLO-BA13", description="chambre", quantity=12),
        DevisLine(product_ref="KIT-FIX", description="kit supplementaire", quantity=5),
    ]
    report = explode_devis(devis, products, boms)
    by_ref = {m.ref: m for m in report.materials}

    total_m2 = 25 + 12
    # PLQ-BA13 vient uniquement de CLO-BA13 (0.7 par m2)
    assert by_ref["PLQ-BA13"].qty_needed == pytest.approx(0.7 * total_m2)
    # KIT-FIX vient a la fois de la nomenclature de CLO-BA13 (0.3/m2) et de la ligne directe (5)
    # (stop_explosion=1 donc il reste tel quel dans les deux cas)
    assert by_ref["KIT-FIX"].qty_needed == pytest.approx(0.3 * total_m2 + 5)


def test_qty_to_order_uses_stock(products, boms):
    devis = [DevisLine(product_ref="PLQ-BA13", description="grosse commande", quantity=200)]
    report = explode_devis(devis, products, boms)
    plaques = report.materials[0]
    assert plaques.qty_needed == 200
    assert plaques.qty_available == 120
    assert plaques.qty_to_order == 80


def test_unmatched_reference_is_reported_not_silently_dropped(products, boms):
    devis = [
        DevisLine(product_ref="PLQ-BA13", description="ok", quantity=1),
        DevisLine(product_ref="REF-INCONNUE", description="prestation inconnue", quantity=3),
    ]
    report = explode_devis(devis, products, boms)
    assert len(report.unmatched) == 1
    assert report.unmatched[0].product_ref == "REF-INCONNUE"
    # La ligne connue est quand meme traitee normalement
    assert any(m.ref == "PLQ-BA13" for m in report.materials)


def test_circular_bom_raises_explicit_error():
    products = {
        "A": Product(ref="A", name="A", uom="u", qty_available=0),
        "B": Product(ref="B", name="B", uom="u", qty_available=0),
    }
    boms = {"A": [("B", 1.0)], "B": [("A", 1.0)]}
    devis = [DevisLine(product_ref="A", description="boucle", quantity=1)]
    with pytest.raises(BomEngineError):
        explode_devis(devis, products, boms)


def test_load_devis_from_csv():
    lines = load_devis(f"{DATA_DIR}/devis_exemple.csv")
    assert len(lines) == 4
    assert lines[0].product_ref == "CLO-BA13"
    assert lines[0].quantity == 25
