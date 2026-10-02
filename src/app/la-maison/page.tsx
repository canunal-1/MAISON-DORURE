import type { Metadata } from "next";
import Link from "next/link";
import Coordonnees from "@/components/Coordonnees";
import EtatBoutique from "@/components/EtatBoutique";
import Photographie from "@/components/Photographie";
import { boulangerie, maison, photos } from "@/content/site";

export const metadata: Metadata = {
  title: "La maison",
  description: maison.paragraphes[0] ?? `La ${boulangerie.nom}.`,
};

export default function LaMaison() {
  return (
    <>
      <section className="bandeau">
        <div className="bandeau-contenu">
          <h1>{maison.titre}</h1>
        </div>
      </section>

      <section className="bloc">
        <div className="bloc-contenu deux-colonnes maison-corps">
          <div className="texte-long">
            {maison.paragraphes.length > 0 ? (
              maison.paragraphes.map((paragraphe) => <p key={paragraphe}>{paragraphe}</p>)
            ) : (
              <p className="a-venir">Cette page sera bientôt complétée.</p>
            )}
            <div className="actions">
              <Link className="bouton bouton-fonce" href="/produits">
                Voir la carte
              </Link>
              <Link className="bouton bouton-contour" href="/contact">
                Horaires et accès
              </Link>
            </div>
          </div>

          {photos.maison ? (
            <Photographie
              photo={photos.maison}
              format="portrait"
              sizes="(max-width: 760px) 100vw, 34rem"
            />
          ) : (
            // Sans photo, la colonne de droite porte l'essentiel pour venir : rien d'inventé.
            <aside className="panneau" aria-labelledby="titre-trouver">
              <h2 id="titre-trouver">Nous trouver</h2>
              <EtatBoutique />
              <Coordonnees />
              <p className="panneau-suite">
                <Link href="/contact">Tous les horaires</Link>
              </p>
            </aside>
          )}
        </div>
      </section>

      {maison.engagements.length > 0 && (
        <section className="bloc bloc-papier" aria-labelledby="titre-engagements">
          <div className="bloc-contenu">
            <h2 id="titre-engagements">Ce qu&apos;on tient à faire</h2>
            <ul className="engagements">
              {maison.engagements.map((engagement) => (
                <li key={engagement.titre}>
                  <h3>{engagement.titre}</h3>
                  <p>{engagement.texte}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
