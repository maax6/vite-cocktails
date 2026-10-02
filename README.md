# Cocktails Maison · Speakeasy

Vite + React 18 + Tailwind. Carnet local, recherche automatique (350 ms), cartes ambre/laiton, sans bouton de recherche.

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm test
```

## Le bar

- **Maison** (par défaut) : classiques et Martini, hors `season: "ski"`.
- **API** : recherche par nom dans [TheCocktailDB](https://www.thecocktaildb.com/api/json/v1/1/search.php?s=martini), sans clé. Les 15 ingrédients/doses, la méthode, le verre et la photo sont conservés. Garniture non fournie par l’API : « Non renseignée ». Requêtes annulées dès que la recherche change.
- **Semaine ski** : uniquement les recettes locales `season: "ski"`.
- Filtres locaux spiritueux et verre ; « J’ai… » propose les ingrédients du pool Maison hors ski. Une recette doit contenir **tous** les ingrédients cochés, avec correspondance partielle insensible à la casse et aux accents. Ces ingrédients peuvent aussi filtrer le ski.
- Fiche directement visible sur chaque carte : doses en gros, méthode complète, verre, garniture. Les mesures API sont affichées telles quelles (aucune conversion approximative en oz).
- **Au hasard** : pool Maison hors ski, même dans l’onglet API ; pool ski en mode ski. Respecte les filtres du bar et le mode favoris, sans restriction par nom. « Voir les résultats » quitte la suggestion.
- **Favoris** : cœur sur chaque carte, enregistré dans `localStorage` (`speakeasy:favorites:v1`). Le bouton Favoris filtre le catalogue courant. Dans API, les recettes enregistrées se consultent sans nouvelle recherche ; elles nécessitent une connexion comme le reste de l’onglet API.

## Catalogue / export

`public/recipes.json` contient le catalogue exporté de vos classiques, Martini et recettes ski. Le lecteur accepte un tableau JSON ou l’enveloppe `{ "recipes": [...], "exportedAt": "..." }` utilisée par l’export. Chaque identifiant doit être unique et stable.

```json
[
  {
    "id": "maison-dry-martini",
    "name": "Dry Martini",
    "source": "maison",
    "tags": ["martini"],
    "ingredients": [
      { "name": "Gin", "amount": "2.5 oz" },
      { "name": "Vermouth sec", "amount": "0.5 oz" }
    ],
    "method": "Remuer avec des glaçons, puis filtrer.",
    "glass": "Martini",
    "garnish": "Olive",
    "spirit": "Gin"
  }
]
```

`ingredients` accepte aussi `string[]` : les doses initiales explicites (oz, ml, cl…) sont séparées pour l’affichage ; les autres chaînes sont conservées intégralement. Préférez `{name, amount}[]` pour lever toute ambiguïté. Saisissez les doses maison en oz (`1 oz ≈ 29.57 ml`) ; les chaînes ne sont pas converties automatiquement. `method`, `glass`, `garnish`, `spirit` sont des chaînes (vides si inconnues). `season` est optionnel et n’accepte que `"ski"`.

Le schéma accepte `source: "maison" | "martini" | "ski" | "api"` pour compatibilité. Pour un nouvel export, **classiques et Martini utilisent `source: "maison"`** (`tags: ["martini"]` optionnel) ; le ski utilise également `source: "maison"` avec **`season: "ski"`**. Le classement ski dépend de `season`, jamais du nom ni d’un tag. Le legacy `source: "ski"` exige donc aussi `season: "ski"`.

Pour exporter depuis Notion : extrayez les pages avec un script exécuté côté Node, mappez les propriétés vers ce schéma et écrivez le tableau en UTF-8 dans `public/recipes.json`. Puis lancez `pnpm test` et `pnpm build` et déployez le nouveau build. Le script fourni `node scripts/build-recipes.mjs /chemin/exports` combine les dumps `classiques-raw.json`, `martini-raw.json` et `ski-raw.json` (voir [documentation export](scripts/README-export.md)). Aucune connexion Notion n’est nécessaire pour utiliser l’application.

Si vous ajoutez `scripts/export-notion-recipes.mjs`, transmettez le secret uniquement via **`NOTION_TOKEN`** dans l’environnement du processus Node. **Jamais `VITE_*`**, qui expose la valeur au navigateur. Ne commitez ni token, ni `.env` (déjà ignorés).

## PWA et hors ligne

Le plugin [vite-plugin-pwa](https://vite-pwa-org.netlify.app/guide/static-assets.html) génère le manifeste et le service worker, avec précache de `recipes.json`, HTML, JS, CSS, icônes et polices locales. Après une première visite en ligne et la fin de l’installation du service worker, **Maison et Semaine ski fonctionnent hors ligne**, avec filtres, favoris et hasard. Aucune requête TheCocktailDB n’est mise en cache ; l’API est exclusivement en ligne.

Testez le hors ligne avec `pnpm build` puis `pnpm preview` sur localhost (ou en production HTTPS), pas avec le serveur dev. Ouvrez la page en ligne, attendez le service worker actif, rechargez, puis passez hors ligne et rechargez encore. Le navigateur propose l’installation PWA selon son support ; sur iOS, utilisez « Ajouter à l’écran d’accueil ». Les recettes mises à jour sont incluses au prochain build et renouvelées avec le service worker.
