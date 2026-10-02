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

### Fermetures exceptionnelles (jours fériés, congés)

Dans `site.ts`, la liste `fermetures` : un jour (`du`) ou une période (`du` → `au`), avec un motif facultatif. Le site affiche « Fermé aujourd'hui », décale la prochaine ouverture, barre le jour concerné dans le tableau des horaires et déclare la fermeture à Google. Les dates passées s'ignorent toutes seules.

### Photos

Déposer les fichiers dans `public/photos/`, puis les déclarer dans `site.ts` (rubrique `photos`, et champ `photo` des produits « phare »). **Sans photo déclarée, rien n'est affiché** : aucun cadre vide, aucune image de remplacement. Chaque photo doit avoir une description (`alt`) ; `npm test` vérifie que le fichier existe.

### Allergènes

Champ `allergenes` facultatif par produit, choisi parmi les 14 allergènes officiels. Absent : rien n'est affiché (le site n'écrit jamais « sans allergène »).

### Adresse du site

Renseigner `siteUrl` dans `site.ts` une fois le nom de domaine connu. Sur Vercel, l'adresse du projet est utilisée automatiquement en attendant.

## Organisation

| Dossier | Rôle |
| --- | --- |
| `src/content/site.ts` | Le contenu du site |
| `src/app/` | Les pages : accueil, `/produits`, `/la-maison`, `/contact` |
| `src/components/` | Les éléments réutilisés (enseigne, store, ardoise, horaires, pied de page) |
| `src/lib/horaires.ts` | Calcul « ouvert / fermé » à l'heure de Paris, fermetures exceptionnelles, formats d'heures et de prix |
| `src/lib/seo.ts` | Adresse du site, description, données structurées Google (JSON-LD) |
| `*.test.ts` | Tests automatiques (Vitest) |
| `src/app/globals.css` | Couleurs, typographie et mise en page |

## Vérifier

```bash
npm test        # tests : horaires, fermetures, fuseaux horaires, contenu de site.ts
npm run lint
npm run build
```

`npm test` relit aussi `src/content/site.ts` : une heure, une date ou un SIRET mal saisi fait échouer le test avec un message clair.

## Mettre en ligne

Le plus simple est [Vercel](https://vercel.com/new) : importer ce dépôt GitHub, garder les réglages par défaut, déployer.

```bash
npm run build   # vérifie que le site compile
```
