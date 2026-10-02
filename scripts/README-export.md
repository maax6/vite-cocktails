# Export du carnet

`node scripts/build-recipes.mjs /chemin/exports` construit `public/recipes.json` à partir des dumps JSON `classiques-raw.json`, `martini-raw.json`, `ski-raw.json`. Le dossier par défaut est `/tmp/codex-vite` ; les dumps ne sont pas livrés dans Git.

- Classiques → `source: "maison"`.
- Martini → `source: "maison"`, `tags: ["martini"]`.
- Ski → `source: "maison"`, `season: "ski"` (exclu de Maison).

Réexportez les bases Notion en conservant les propriétés attendues par le script, puis lancez le builder, `pnpm test` et `pnpm build`. Les identifiants proviennent des URL des pages pour garder les favoris stables. Le lecteur accepte l’enveloppe `{ recipes, exportedAt }` ainsi qu’un tableau brut.

Pour un futur export direct côté Node, transmettez le secret via `NOTION_TOKEN`, jamais via `VITE_*`. Ne commitez pas `.env` ni les secrets.
