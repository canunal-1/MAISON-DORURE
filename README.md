# Boulangerie Maaned

Site vitrine de la boulangerie Maaned, construit avec [Next.js](https://nextjs.org) (App Router, TypeScript).

## Lancer le site en local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000.

## Modifier le contenu

Tout le contenu est dans **`src/content/site.ts`** : nom, adresse, téléphone, horaires, carte et prix, textes de la page « La maison ». Les pages se mettent à jour toutes seules.

Une information inconnue reste **vide** (`""` ou `[]`) : le site affiche « à venir » ou masque la section, sans rien inventer. Le fichier explique le format de chaque champ.

## Organisation

| Dossier | Rôle |
| --- | --- |
| `src/content/site.ts` | Le contenu du site |
| `src/app/` | Les pages : accueil, `/produits`, `/la-maison`, `/contact` |
| `src/components/` | Les éléments réutilisés (enseigne, store, ardoise, horaires, pied de page) |
| `src/lib/horaires.ts` | Calcul « ouvert / fermé » à l'heure de Paris, formats d'heures et de prix |
| `src/app/globals.css` | Couleurs, typographie et mise en page |

## Mettre en ligne

Le plus simple est [Vercel](https://vercel.com/new) : importer ce dépôt GitHub, garder les réglages par défaut, déployer.

```bash
npm run build   # vérifie que le site compile
```
