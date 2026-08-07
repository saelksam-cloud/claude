# Materiaux depuis devis — prototype

Petit prototype : a partir d'un devis (liste de prestations/produits + quantites)
et du catalogue produits + nomenclatures (BOM) exportes d'Odoo, calcule la liste
consolidee des materiaux necessaires, avec ce qui manque en stock.

## Pourquoi ca marche bien avec des nomenclatures Odoo

Odoo permet de lier un produit (ou une variante) a une **nomenclature**
(`mrp.bom` / `mrp.bom.line`) : la liste de ses composants et les quantites
necessaires pour en fabriquer/poser une unite. C'est exactement la donnee
qu'il faut pour repondre a "un devis de 25 m2 de cloison BA13, ca demande
combien de plaques/rails/vis ?" — pas besoin de deviner via du texte, on
**explose la nomenclature** (recursivement, si un composant est lui-meme
un kit avec sa propre nomenclature) et on multiplie par la quantite du devis.

## Structure

```
materiaux-devis/
  bom_engine.py          moteur d'explosion de nomenclature (stdlib uniquement)
  test_bom_engine.py      tests (pytest)
  api.py                  API FastAPI (upload devis -> liste materiaux)
  static/index.html       petite interface web
  data/
    produits.csv          export catalogue produits (a remplacer par le tien)
    nomenclatures.csv     export nomenclatures/BOM (a remplacer par le tien)
    devis_exemple.csv     exemple de devis pour tester sans fichier a soi
```

## Lancer le prototype

```bash
cd materiaux-devis
pip install -r requirements.txt
uvicorn api:app --reload
```

Puis ouvrir http://127.0.0.1:8000/ — bouton "Utiliser le devis d'exemple"
pour tester tout de suite, ou uploader ton propre CSV de devis.

Lancer les tests :

```bash
pytest
```

## Format des CSV attendus

### `data/produits.csv` (export catalogue Odoo)

| colonne         | description                                  |
|------------------|-----------------------------------------------|
| `default_code`   | reference article (ce que le devis referencera)|
| `name`           | designation                                    |
| `uom`            | unite de mesure                                |
| `qty_available`  | quantite en stock                              |

Dans Odoo : Inventaire > Produits > selectionner les colonnes ci-dessus
et exporter en CSV (ou adapter le mapping dans `bom_engine.load_products`
si tes noms de colonnes different).

### `data/nomenclatures.csv` (export BOM Odoo)

| colonne             | description                                          |
|----------------------|-------------------------------------------------------|
| `bom_product_ref`    | reference du produit/variante parent                 |
| `component_ref`      | reference du composant                                |
| `qty_per_unit`       | quantite de composant necessaire pour 1 unite du parent|
| `uom`                | unite du composant (informatif)                       |

Dans Odoo : Fabrication > Nomenclatures > exporter les lignes
`mrp.bom.line` avec la reference du produit parent et du composant.
Comme tu as les nomenclatures **integrees a tes variants**, il faudra
verifier que l'export prend bien la reference de variante (`product.product`)
et pas seulement le produit generique (`product.template`) si tes BOM
different par variante.

### Devis uploade via l'interface (ou `data/devis_exemple.csv`)

| colonne        | description                          |
|-----------------|---------------------------------------|
| `product_ref`   | reference produit/prestation du devis|
| `description`   | libelle (informatif, non utilise pour le calcul) |
| `quantity`      | quantite commandee                    |

## Ce que fait deja le moteur

- Explosion **multi-niveaux** : un composant qui a lui-meme une nomenclature
  (ex: un "kit" dans une cloison) est explose jusqu'aux articles finaux.
- **Agregation** : si plusieurs lignes de devis (ou plusieurs sous-nomenclatures)
  ont besoin du meme composant, les quantites sont additionnees.
- **Comparaison au stock** : `qty_to_order = max(0, besoin - stock_disponible)`.
- **Detection des references non reconnues** : une ligne de devis dont la
  reference n'existe pas dans `produits.csv` est signalee a part (`unmatched`)
  plutot que silencieusement ignoree — a verifier manuellement.
- **Detection de nomenclature circulaire** (garde-fou, leve une erreur explicite).

## Prochaines etapes possibles

1. **Brancher l'API Odoo** (XML-RPC) a la place des CSV statiques, pour lire
   catalogue + nomenclatures + stock en direct au lieu d'exports manuels.
2. **Devis en PDF/texte libre** : si tous les devis ne referencent pas une
   reference produit exacte, ajouter une etape de matching (regles, puis
   LLM en filet de securite) avant l'explosion de nomenclature.
3. **Multi-devis / commande groupee** : agreger plusieurs devis pour
   calculer un besoin d'achat global sur une periode.
4. **Export** : bouton pour exporter le resultat en CSV/Excel, ou creer
   directement un bon de commande fournisseur / une demande de reappro
   dans Odoo.
5. **Authentification + multi-utilisateur** si ca doit devenir un vrai SaaS
   (aujourd'hui c'est un prototype local, pas encore un service heberge).
