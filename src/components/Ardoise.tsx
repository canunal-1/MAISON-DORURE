import type { Categorie } from "@/content/site";
import { formaterPrix } from "@/lib/horaires";

/** Une catégorie de la carte, présentée comme sur l'ardoise de la boutique. */
export default function Ardoise({ categorie }: { categorie: Categorie }) {
  return (
    <section className="ardoise-categorie" aria-labelledby={`carte-${categorie.id}`}>
      <h3 id={`carte-${categorie.id}`}>{categorie.titre}</h3>
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
