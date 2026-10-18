# CRFB Construction inc. — site web

Site statique (HTML, CSS, JS, sans dépendance) pour CRFB Construction inc., entrepreneur en construction et rénovation à Terrebonne.
Conçu par ORAVY.

## Pages
- `index.html` — accueil, avec la scène « La coupe du mur » (le mur se construit au scroll, une couche par service)
- `services.html` — services classés par étape du chantier
- `realisations.html` — galerie filtrable (photos de chantiers de CRFB, tirées de sa page Facebook)
- `soumission.html` — formulaire de demande de soumission
- `404.html`

## Mise en ligne
Aucun build : déposer le dossier tel quel sur n'importe quel hébergement statique (GitHub Pages, Netlify, cPanel).

## À compléter avant la mise en ligne
- **Formulaire** : mettre l'URL d'envoi (Formspree ou autre) dans `data-endpoint` du `<form id="form-soumission">` dans `soumission.html`. Sans URL, le formulaire affiche un message « maquette » et un résumé à copier.
- **Domaine** : remplacer `DOMAINE-A-FOURNIR` dans `sitemap.xml` et `robots.txt`; ajouter `canonical` et `og:url`.
- **Logo** vectoriel, **courriel** et **adresse** de l'entreprise.
- **À valider** : numéro et sous-catégorie RBQ, heures (7 jours, 7 h à 21 h), villes desservies.

Les points ouverts sont aussi marqués dans le code par `<!-- À FOURNIR -->` et `<!-- À VALIDER -->`.
