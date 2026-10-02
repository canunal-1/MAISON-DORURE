import Link from "next/link";
import Ardoise from "@/components/Ardoise";
import Coordonnees from "@/components/Coordonnees";
import EtatBoutique from "@/components/EtatBoutique";
import Photographie from "@/components/Photographie";
import PhotosPhares from "@/components/PhotosPhares";
import Store from "@/components/Store";
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
  return (
    <>
      <section className="devanture" aria-label="La boutique">
        <div className="enseigne">
          <h1>
            <span className="enseigne-metier">Boulangerie</span>
            <span className="enseigne-nom">{boulangerie.nomCourt}</span>
          </h1>
        </div>
        <Store />
        <div className="vitrine">
          <div className="vitrine-contenu">
            <EtatBoutique />
            <div className="vitrine-texte">
              {boulangerie.accroche && <p>{boulangerie.accroche}</p>}
              <div className="actions">
                <Link className="bouton" href="/produits">
                  Voir la carte
                </Link>
                <Link className="bouton bouton-discret" href="/contact">
                  Venir à la boutique
                </Link>
              </div>
            </div>
          </div>
          <Photographie
            photo={photos.accueil}
            format="large"
            sizes="(max-width: 72rem) 100vw, 68rem"
            className="vitrine-photo"
          />
        </div>
      </section>

      {selection.length > 0 && (
        <section className="ardoise" aria-labelledby="titre-ardoise">
          <div className="ardoise-contenu">
            <div className="ardoise-entete">
              <h2 id="titre-ardoise">Sur l&apos;ardoise</h2>
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

      <section className="bloc" aria-labelledby="titre-venir">
        <div className="bloc-contenu deux-colonnes">
          <div>
            <h2 id="titre-venir">Venir à la boutique</h2>
            <Coordonnees />
          </div>
          <TableauHoraires />
        </div>
      </section>
    </>
  );
}
