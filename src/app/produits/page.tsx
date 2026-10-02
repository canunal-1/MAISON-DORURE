import type { Metadata } from "next";
import Link from "next/link";
import Ardoise from "@/components/Ardoise";
import { carte, commande } from "@/content/site";

export const metadata: Metadata = {
  title: "La carte",
  description: "Pains, viennoiseries, pâtisseries et salé : la carte et les prix.",
};

export default function Produits() {
  return (
    <>
      <section className="bandeau">
        <div className="bandeau-contenu">
          <h1>La carte</h1>
          <p>Pains, viennoiseries, pâtisseries et salé, avec les prix en boutique.</p>
          <nav aria-label="Catégories de la carte">
            <ul className="sommaire">
              {carte.map((categorie) => (
                <li key={categorie.id}>
                  <a href={`#carte-${categorie.id}`}>{categorie.titre}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <section className="ardoise ardoise-complete" aria-label="Carte complète">
        <div className="ardoise-contenu">
          <div className="ardoise-colonnes">
            {carte.map((categorie) => (
              <Ardoise key={categorie.id} categorie={categorie} />
            ))}
          </div>
        </div>
      </section>

      <section className="bloc" aria-labelledby="titre-commande">
        <div className="bloc-contenu etroit">
          <h2 id="titre-commande">{commande.titre}</h2>
          <p>{commande.texte}</p>
          <div className="actions">
            <Link className="bouton bouton-fonce" href="/contact">
              Voir les coordonnées
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
