import type { Categorie } from "@/content/site";
import { formaterPrix } from "@/lib/horaires";
import Photographie from "./Photographie";

/** Les photos des produits phares (accueil). N'affiche que les produits qui en ont une. */
export default function PhotosPhares({ selection }: { selection: Categorie[] }) {
  const produits = selection.flatMap((categorie) => categorie.produits).filter((p) => p.photo);
  if (produits.length === 0) return null;

  return (
    <ul className="phares">
      {produits.map((produit) => (
        <li key={produit.nom}>
          <Photographie
            photo={produit.photo}
            format="paysage"
            sizes="(max-width: 760px) 100vw, 22rem"
          />
          <p className="phares-legende">
            <span>{produit.nom}</span>
            <span className="ardoise-prix">{formaterPrix(produit.prix)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
