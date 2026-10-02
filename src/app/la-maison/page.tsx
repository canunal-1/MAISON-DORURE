import type { Metadata } from "next";
import Link from "next/link";
import { boulangerie, maison } from "@/content/site";

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
        <div className="bloc-contenu etroit texte-long">
          {maison.paragraphes.length > 0 ? (
            maison.paragraphes.map((paragraphe) => <p key={paragraphe}>{paragraphe}</p>)
          ) : (
            <p className="a-venir">Cette page sera bientôt complétée.</p>
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
            <div className="actions">
              <Link className="bouton bouton-fonce" href="/produits">
                Voir la carte
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
