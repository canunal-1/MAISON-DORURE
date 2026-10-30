import type { Categorie } from "@/content/site";
import { formaterPrix } from "@/lib/horaires";

/** Une catégorie de la carte, présentée comme sur l'ardoise de la boutique. */
export default function Ardoise({
  categorie,
  titre: Titre = "h3",
}: {
  categorie: Categorie;
  /** Niveau de titre : h2 quand la page n'a pas d'autre titre de section, h3 sinon. */
  titre?: "h2" | "h3";
}) {
  return (
    <section className="ardoise-categorie" aria-labelledby={`carte-${categorie.id}`}>
      <Titre id={`carte-${categorie.id}`}>{categorie.titre}</Titre>
      <ul className="ardoise-liste">
        {categorie.produits.map((produit) => (
          <li key={produit.nom}>
            <div className="ardoise-ligne">
              <span className="ardoise-nom">{produit.nom}</span>
              <span className="ardoise-points" aria-hidden="true" />
              <span className="ardoise-prix">{formaterPrix(produit.prix)}</span>
            </div>
            {produit.detail && <p className="ardoise-detail">{produit.detail}</p>}
            {produit.allergenes && produit.allergenes.length > 0 && (
              <p className="ardoise-allergenes">
                <span className="ardoise-allergenes-titre">Allergènes :</span>{" "}
                {produit.allergenes.join(", ")}
              </p>
            )}
          </li>
        ))}
      </ul>
      {categorie.note && <p className="ardoise-note">{categorie.note}</p>}
    </section>
  );
}
