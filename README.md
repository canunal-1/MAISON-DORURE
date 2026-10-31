# Maison Dorure

Site vitrine de la boulangerie Maison Dorure, construit avec [Next.js](https://nextjs.org) (App Router, TypeScript).

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

### Formulaire de commande (par e-mail)

Le formulaire de la page « Horaires » envoie la demande par e-mail à `boulangerie.email` (service [Resend](https://resend.com)). **Il n'apparaît que si tout est en place**, pour ne jamais montrer un formulaire qui ne marche pas :

1. renseigner `email` dans `site.ts` (et `commande.delaiJours` si la boutique demande un délai) ;
2. créer un compte sur resend.com, y ajouter et vérifier le nom de domaine du site, puis créer une clé d'API ;
3. chez l'hébergeur (Vercel : *Settings → Environment Variables*), définir `RESEND_API_KEY` (la clé) et `COMMANDE_EXPEDITEUR` (ex. `Maison Dorure <commandes@votre-domaine.fr>`), puis redéployer. En local, mettre ces deux lignes dans un fichier `.env.local` à la racine.

Si l'e-mail est renseigné mais que les variables manquent, le formulaire reste masqué et le journal de déploiement l'indique (`[commande] formulaire masqué…`).

Les demandes sont vérifiées côté serveur (nom, téléphone, date de retrait : ni passée, ni dans le délai, ni un jour de fermeture ou de congés). Protection contre les abus : champ piège pour les robots, et au plus 3 demandes par visiteur et par 10 minutes, 20 par heure en tout. Ces limites sont en mémoire : sur un hébergement « serverless » elles sont partielles, donc à compléter par les protections de l'hébergeur (par exemple le pare-feu de Vercel). La clé d'API reste côté serveur, jamais dans la page. `RESEND_API_URL` (facultatif) permet de viser un faux serveur d'e-mail pour les tests.

Une section « Données personnelles » s'ajoute alors aux mentions légales ; la durée de conservation des demandes (`mentionsLegales.donnees.conservation` dans `site.ts`) est à décider.

### Adresse du site

Renseigner `siteUrl` dans `site.ts` une fois le nom de domaine connu. Sur Vercel, l'adresse du projet est utilisée automatiquement en attendant.

## Organisation

| Dossier | Rôle |
| --- | --- |
| `src/content/site.ts` | Le contenu du site |
| `src/app/` | Les pages : accueil, `/produits`, `/la-maison`, `/contact` |
| `src/components/` | Les éléments réutilisés (enseigne, store, ardoise, horaires, pied de page) |
| `src/lib/horaires.ts` | Calcul « ouvert / fermé » à l'heure de Paris, fermetures exceptionnelles, formats d'heures et de prix |
| `src/lib/commande.ts` | Formulaire de commande : vérification, e-mail, limitation de débit |
| `src/app/contact/actions.ts` | Action serveur appelée par le formulaire |
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
