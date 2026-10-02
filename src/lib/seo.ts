import { boulangerie, fermetures, horaires, type Fermeture, type Jour } from "@/content/site";
import { fermeturesAVenir, maintenantAParis } from "@/lib/horaires";

/** Les pages publiques, pour le plan du site. */
export const pages = ["/", "/produits", "/la-maison", "/contact", "/mentions-legales"];

/** Adresse publique du site, sans barre finale. */
export function urlDuSite(): string {
  if (boulangerie.siteUrl) return boulangerie.siteUrl.replace(/\/+$/, "");
  // Variable fournie automatiquement par Vercel au moment du déploiement.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** Description par défaut, faite uniquement d'informations connues. */
export function descriptionSite(): string {
  if (boulangerie.accroche) return boulangerie.accroche;
  const { ville } = boulangerie.adresse;
  return ville ? `${boulangerie.nom}, ${ville}.` : `${boulangerie.nom}.`;
}

// Dans l'ordre de `horaires` : du lundi au dimanche.
const JOURS_SCHEMA = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/** Jours aux mêmes plages regroupés : un seul bloc « lundi à vendredi, 7:00-19:00 ». */
function horairesStructures(semaine: Jour[]) {
  const blocs = new Map<string, { dayOfWeek: string[]; opens: string; closes: string }>();

  semaine.forEach((jour, index) => {
    for (const [opens, closes] of jour.plages) {
      const cle = `${opens}-${closes}`;
      const bloc = blocs.get(cle) ?? { dayOfWeek: [], opens, closes };
      bloc.dayOfWeek.push(`https://schema.org/${JOURS_SCHEMA[index]}`);
      blocs.set(cle, bloc);
    }
  });

  return [...blocs.values()].map((bloc) => ({
    "@type": "OpeningHoursSpecification",
    ...bloc,
  }));
}

/**
 * Données structurées schema.org (type Bakery) lues par Google.
 * Seules les informations renseignées dans site.ts sont émises.
 */
export function donneesStructurees(
  infos: typeof boulangerie = boulangerie,
  semaine: Jour[] = horaires,
  exceptions: Fermeture[] = fermetures,
  aujourdhui: string = maintenantAParis().date,
) {
  const { rue, codePostal, ville } = infos.adresse;
  // Fermeture exceptionnelle : « ouvert de 00:00 à 00:00 » sur la période, selon schema.org.
  const fermees = fermeturesAVenir(exceptions, aujourdhui).map(({ du, au }) => ({
    "@type": "OpeningHoursSpecification",
    opens: "00:00",
    closes: "00:00",
    validFrom: du,
    validThrough: au ?? du,
  }));
  const specifications = [...horairesStructures(semaine), ...(semaine.length > 0 ? fermees : [])];

  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: infos.nom,
    url: urlDuSite(),
    image: `${urlDuSite()}/opengraph-image`,
    description: infos.accroche || undefined,
    telephone: infos.telephone || undefined,
    email: infos.email || undefined,
    address:
      rue || codePostal || ville
        ? {
            "@type": "PostalAddress",
            streetAddress: rue || undefined,
            postalCode: codePostal || undefined,
            addressLocality: ville || undefined,
            // Le site est en euros, à l'heure de Paris, avec un SIRET : France.
            addressCountry: "FR",
          }
        : undefined,
    openingHoursSpecification: specifications.length > 0 ? specifications : undefined,
    sameAs: infos.instagram
      ? [`https://www.instagram.com/${infos.instagram.replace(/^@/, "")}`]
      : undefined,
  };
}
