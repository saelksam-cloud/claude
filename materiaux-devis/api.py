"""
API du prototype "devis -> liste de materiaux".

Lance avec :
    uvicorn api:app --reload

Puis ouvre http://127.0.0.1:8000/ dans un navigateur.

Pour l'instant le catalogue produits et les nomenclatures sont charges
depuis data/produits.csv et data/nomenclatures.csv au demarrage (ce sont
des exports Odoo). Remplace ces deux fichiers par tes vrais exports pour
tester avec ton inventaire.
"""

from __future__ import annotations

import csv
import io

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from bom_engine import BomEngineError, DevisLine, explode_devis, load_boms, load_products

app = FastAPI(title="Materiaux depuis devis - prototype")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PRODUCTS = load_products("data/produits.csv")
BOMS = load_boms("data/nomenclatures.csv")


def _reload_catalogue() -> None:
    """Recharge le catalogue produits/nomenclatures depuis disque (utile en dev)."""
    global PRODUCTS, BOMS
    PRODUCTS = load_products("data/produits.csv")
    BOMS = load_boms("data/nomenclatures.csv")


def _parse_devis_csv(raw: bytes) -> list[DevisLine]:
    text = raw.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    required = {"product_ref", "quantity"}
    if reader.fieldnames is None or not required.issubset(set(reader.fieldnames)):
        raise HTTPException(
            status_code=400,
            detail="Le CSV du devis doit contenir au minimum les colonnes 'product_ref' et 'quantity' "
            "(optionnellement 'description').",
        )
    lines: list[DevisLine] = []
    for i, row in enumerate(reader, start=2):
        ref = (row.get("product_ref") or "").strip()
        if not ref:
            continue
        try:
            qty = float(row["quantity"])
        except (TypeError, ValueError):
            raise HTTPException(status_code=400, detail=f"Quantite invalide ligne {i} : {row.get('quantity')!r}")
        lines.append(DevisLine(product_ref=ref, description=(row.get("description") or "").strip(), quantity=qty))
    if not lines:
        raise HTTPException(status_code=400, detail="Aucune ligne exploitable trouvee dans le CSV.")
    return lines


@app.post("/api/explode")
async def explode(devis_file: UploadFile = File(...)):
    """Recoit un CSV de devis (product_ref,description,quantity) et retourne la liste materiaux."""
    _reload_catalogue()
    raw = await devis_file.read()
    devis_lines = _parse_devis_csv(raw)

    try:
        report = explode_devis(devis_lines, PRODUCTS, BOMS)
    except BomEngineError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    return {
        "materials": [
            {
                "ref": m.ref,
                "name": m.name,
                "uom": m.uom,
                "qty_needed": m.qty_needed,
                "qty_available": m.qty_available,
                "qty_to_order": m.qty_to_order,
            }
            for m in report.materials
        ],
        "unmatched": [
            {"product_ref": l.product_ref, "description": l.description, "quantity": l.quantity}
            for l in report.unmatched
        ],
        "devis_lines_count": len(devis_lines),
    }


@app.get("/api/sample-devis")
def sample_devis():
    """Retourne le devis d'exemple (pour tester rapidement sans fichier a soi)."""
    return FileResponse("data/devis_exemple.csv", media_type="text/csv", filename="devis_exemple.csv")


app.mount("/", StaticFiles(directory="static", html=True), name="static")
