import Link from "next/link";
import Ardoise from "@/components/Ardoise";
import Coordonnees, { quartier } from "@/components/Coordonnees";
import EtatBoutique from "@/components/EtatBoutique";
import Photographie from "@/components/Photographie";
import PhotosPhares from "@/components/PhotosPhares";
import TableauHoraires from "@/components/TableauHoraires";
import { boulangerie, carte, photos, type Categorie } from "@/content/site";

/** Les produits marqués « phare » dans le contenu, regroupés par catégorie. */
const selection: Categorie[] = carte
  .map((categorie) => ({
    ...categorie,
    note: undefined,
    produits: categorie.produits.filter((produit) => produit.phare),
  }))
  .filter((categorie) => categorie.produits.length > 0);

export default function Accueil() {
  // « Maison » en italique, « Dorure » en romain, comme un lettrage peint.
  const [premier, ...suite] = boulangerie.nomCourt.split(" ");

  return (
    <>
      <section className="mur" aria-labelledby="titre-une">
        <div className="contenu mur-contenu">
          <p className="metier">{boulangerie.metier}</p>
          <h1 id="titre-une" className="mur-nom dore">
            <span className="italique">{premier}</span> {suite.join(" ")}
          </h1>
          <div className="filet" aria-hidden="true" />

          <div className="plaques">
            {boulangerie.adresse.rue && (
              <div className="plaque">
                <p className="plaque-haut">
                  <span className="sans-capitales">{quartier()}</span>
                </p>
                <p className="plaque-texte">{boulangerie.adresse.rue}</p>
              </div>
            )}
            <div className="plaque">
              <h2 className="visuellement-cache">Horaires</h2>
              <TableauHoraires />
            </div>
          </div>

          <EtatBoutique />
          <div className="actions">
            <Link className="bouton" href="/produits">
              Voir la carte
            </Link>
            <Link className="bouton bouton-contour" href="/contact">
              Venir à la boutique
            </Link>
          </div>
        </div>
      </section>

      {selection.length > 0 && (
        <section className="ardoise" aria-labelledby="titre-ardoise">
          <div className="ardoise-contenu">
            <div className="ardoise-entete">
              <h2 id="titre-ardoise">Sur la carte</h2>
              <p>Une sélection de la carte.</p>
            </div>
            <PhotosPhares selection={selection} />
            <div className="ardoise-colonnes">
              {selection.map((categorie) => (
                <Ardoise key={categorie.id} categorie={categorie} />
              ))}
            </div>
            <p className="ardoise-suite">
              <Link href="/produits">Voir toute la carte</Link>
            </p>
          </div>
        </section>
      )}

      <section className="arcades" aria-labelledby="titre-arcades">
        <div className="contenu">
          <h2 id="titre-arcades" className="visuellement-cache">
            La boutique
          </h2>
          <Photographie
            photo={photos.accueil}
            format="large"
            sizes="(max-width: 72rem) 100vw, 68rem"
            className="accueil-photo"
          />
          <div className="arcades-grille">
            <Link className="arcade" href="/produits">
              <span className="arcade-titre">La carte</span>
              <span className="arcade-suite" aria-hidden="true">
                →
              </span>
            </Link>
            <Link className="arcade arcade-claire" href="/la-maison">
              <span className="arcade-titre">La maison</span>
              <span className="arcade-suite" aria-hidden="true">
                →
              </span>
            </Link>
            <div className="arcade arcade-contour">
              <h3 className="arcade-titre">Venir</h3>
              <Coordonnees />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
