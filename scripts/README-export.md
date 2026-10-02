# Export du carnet

`node scripts/build-recipes.mjs /chemin/exports` construit `public/recipes.json` à partir des dumps JSON `classiques-raw.json`, `martini-raw.json`, `ski-raw.json`. Le dossier par défaut est `/tmp/codex-vite` ; les dumps ne sont pas livrés dans Git. Un troisième argument permet une prévisualisation sans toucher au catalogue : `node scripts/build-recipes.mjs /chemin/exports /tmp/recipes-preview.json`.

-  Classiques → `source: "maison"`.
-  Martini → `source: "maison"`, `tags: ["martini"]`.
-  Ski → `source: "maison"`, `season: "ski"` (exclu de Cocktail Classique Maxime).

Réexportez les bases Notion en conservant les propriétés attendues par le script, puis lancez le builder, `pnpm test` et `pnpm build`. Le builder valide le schéma et les identifiants avant d’écrire ; un export invalide laisse le catalogue précédent intact. Les identifiants proviennent des URL ou ID des pages pour garder les favoris stables. Sans ces propriétés, un ID déterministe dépend de la collection et du nom de la recette ; renommer cette recette change donc son ID. Le lecteur accepte l’enveloppe `{ recipes, exportedAt }` ainsi qu’un tableau brut.

Les quantités numériques des colonnes Martini en oz conservent leurs fractions. Les indications textuelles comme `Few drops` sont stockées avec leur ingrédient sous la forme `{ "name": "Vermouth Sec", "amount": "Few drops" }`, sans ajout d’unité, pour afficher la dose et filtrer le nom séparément. Les doses à zéro sont omises. Les ingrédients classiques et ski restent des chaînes ; l’affichage sépare dose et ingrédient sans convertir les quantités ni déduire une unité manquante.

Pour un futur export direct côté Node, transmettez le secret via `NOTION_TOKEN`, jamais via `VITE_*`. Ne commitez pas `.env` ni les secrets.
