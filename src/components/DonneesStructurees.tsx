import { donneesStructurees } from "@/lib/seo";

/** Données structurées Bakery (JSON-LD), lues par les moteurs de recherche. */
export default function DonneesStructurees() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        // Le « < » échappé empêche une valeur de fermer la balise <script>.
        __html: JSON.stringify(donneesStructurees()).replace(/</g, "\\u003c"),
      }}
    />
  );
}
