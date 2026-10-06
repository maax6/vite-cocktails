# Version web sous cocktails.maxzer.fr

Nom choisi par Maxime : **Panache**.
La configuration commune du nom et de l'adresse est dans `src/lib/brand.mjs`.

## Publication

Le projet produit des fichiers statiques dans `dist/`. Node.js sert à la
construction, pas à l'hébergement. Aucun compte utilisateur, serveur de
génération ou paiement n'est nécessaire pour cette version.

1. Créer `cocktails.maxzer.fr` dans le panneau Hostinger, comme site HTML
   indépendant ou comme sous-domaine avec son propre dossier.
2. Relever le dossier réellement attribué par Hostinger. Ne pas déposer le
   build à la racine du portfolio et ne pas deviner le chemin du sous-domaine.
3. Construire avec Node.js 20+ et les dépendances du lockfile :
   `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm build`.
4. Transférer uniquement le contenu de `dist/`, y compris `.htaccess`, dans
   ce dossier. Le ZIP de livraison contient ces fichiers à sa racine.
5. Vérifier le DNS, le certificat HTTPS, la page et les ressources ; confirmer
   le catalogue de 91 recettes et l'installation du service worker.
6. Vérifier les classiques, les favoris et le carnet ski ; pour le hors ligne,
   attendre la première installation du service worker avant de couper le réseau.
7. Ajouter le lien au portfolio après validation de l'adresse publique.

Publication vérifiée le 6 octobre 2026 :

- URL : https://cocktails.maxzer.fr/
- Dossier Hostinger : `/home/u103486496/domains/maxzer.fr/public_html/cocktails`.
- Chemin FTPS : `/domains/maxzer.fr/public_html/cocktails`.
- DNS créé par Hostinger : ALIAS `cocktails` vers `cocktails.maxzer.fr.cdn.hstgr.net`.
- HTTPS valide, réponse 200 et 34 fichiers publics vérifiés : contenu identique
  au build, pixels identiques pour les PNG recompressés sans perte par le CDN.
- 11 tests passent et build de production réussi.
- Contrôle dans Brave : 85 classiques, 6 recettes ski, recherche TheCocktailDB
  et favori conservé après rechargement. Le favori de contrôle a été retiré.

Le service worker est généré et les fichiers hors ligne sont précachés ; un test
complet avec le réseau coupé reste à faire avant de garantir ce scénario.

L'hébergement ne reçoit ni le dépôt Git, ni `node_modules`, ni des secrets.
Le mode TheCocktailDB reste en ligne ; les recettes locales et le guide ski
sont inclus dans le service worker. Les favoris sont locaux à l'origine : ceux
de l'ancien domaine Vercel ne se transfèrent pas automatiquement au sous-domaine.

## Suite produit

La version installable actuelle est une PWA. Une application Mac Apple Silicon
reste un chantier distinct : choix du conteneur ou d'une interface native,
compatibilité et hors ligne, signature, notarisation, distribution et paiement.
La version web ne doit pas être présentée comme une application native déjà prête.
Avant une distribution payante, réexaminer les conditions du catalogue/API et
des photos, documentées dans `photo-rights.md`.
