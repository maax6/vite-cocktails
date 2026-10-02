# Photos — Cocktail Classique Maxime

L’accueil reste sur **API** jusqu’à validation des droits et de la pertinence des photos des classiques. `public/photo-candidates.json` est un inventaire de pistes ; il n’alimente aucune carte locale et ne modifie pas `recipes.json`.

Pour le régénérer avec Node.js 20+ et une connexion Internet :

```bash
node scripts/match-cocktail-photos.mjs
```

Le script consulte l’endpoint officiel `search.php?s=` pour toutes les recettes `source: "maison"`, dont les Martini et le ski. Il conserve leurs identifiants. `exact` signifie que les noms correspondent après normalisation de la casse, des accents et de la ponctuation ; **ce statut ne valide ni les droits, ni la recette, ni la photo**. `fuzzy` désigne une variante ou une orthographe proche à examiner manuellement. `none` signifie qu’aucune image suffisamment proche n’a été trouvée. Les erreurs réseau interrompent la génération sans écraser le fichier précédent. Aucun téléchargement de photo ni activation automatique.

Quatre options avant de publier :

1. **TheCocktailDB** : vérifier les [conditions d’utilisation officielles](https://www.thecocktaildb.com/terms_of_use.php), l’attribution, la provenance et la licence de **chaque** image, ainsi que les conditions de la clé API pour le produit visé. La [documentation API](https://www.thecocktaildb.com/api.php) présente la clé `1` comme une clé de développement/éducation ; l’accès gratuit ne vaut pas validation des droits photo. La page de conditions renvoie actuellement à TheMealDB dans son texte : confirmer sa portée auprès du fournisseur en cas de doute.
2. **Photos personnelles** : photographier les cocktails et conserver l’accord du ou de la photographe ainsi que la provenance des fichiers.
3. **Unsplash / Pexels** : choisir une photo pertinente et vérifier la licence applicable sur sa fiche et les restrictions de réutilisation ([Unsplash](https://unsplash.com/license), [Pexels](https://www.pexels.com/license/)). Conserver la source et les informations d’attribution.
4. **Sans image** : conserver les cartes typographiques actuelles ; aucun droit photo à valider.

Après validation, sélectionner une image pertinente par recette, enregistrer la source/licence/attribution et brancher explicitement les photos approuvées sur les cartes. Le passage de l’accueil à Cocktail Classique Maxime pourra alors faire l’objet d’un changement séparé.
