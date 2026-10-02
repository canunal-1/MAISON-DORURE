import type { Metadata } from "next";
import Link from "next/link";
import Ardoise from "@/components/Ardoise";
import { boulangerie, carte, commande, introCarte } from "@/content/site";

export const metadata: Metadata = {
  title: "La carte",
  description: `La carte et les prix de la ${boulangerie.nom}.`,
};

export default function Produits() {
  return (
    <>
      <section className="bandeau">
        <div className="bandeau-contenu">
          <h1>La carte</h1>
          {introCarte && <p>{introCarte}</p>}
          {carte.length > 0 && (
            <nav aria-label="Catégories de la carte">
              <ul className="sommaire">
                {carte.map((categorie) => (
                  <li key={categorie.id}>
                    <a href={`#carte-${categorie.id}`}>{categorie.titre}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>

      <section className="ardoise ardoise-complete" aria-label="Carte complète">
        <div className="ardoise-contenu">
          {carte.length > 0 ? (
            <div className="ardoise-colonnes">
              {carte.map((categorie) => (
                <Ardoise key={categorie.id} categorie={categorie} titre="h2" />
              ))}
            </div>
          ) : (
            <p className="ardoise-vide">La carte arrive bientôt.</p>
          )}
        </div>
      </section>

      {commande.texte && (
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
      )}
    </>
  );
}
