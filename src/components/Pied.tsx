import Link from "next/link";
import { boulangerie, horaires } from "@/content/site";
import { resumerHoraires } from "@/lib/horaires";
import { adresseComplete } from "./Coordonnees";

export default function Pied() {
  const adresse = adresseComplete();
  const resume = resumerHoraires(horaires);

  return (
    <footer className="pied">
      <div className="frise" aria-hidden="true" />
      <div className="pied-contenu">
        <div className="pied-colonnes">
          <section aria-labelledby="pied-adresse">
            <h2 className="pied-titre" id="pied-adresse">
              Adresse
            </h2>
            <p>{adresse || "Adresse à venir"}</p>
            {boulangerie.telephone && <p>{boulangerie.telephone}</p>}
          </section>
          <section aria-labelledby="pied-horaires">
            <h2 className="pied-titre" id="pied-horaires">
              Horaires
            </h2>
            {resume.length > 0 ? (
              <ul className="pied-horaires">
                {resume.map((ligne) => (
                  <li key={ligne.jours}>
                    <span>{ligne.jours}</span>
                    <span>{ligne.heures}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Horaires à venir</p>
            )}
          </section>
          <nav aria-labelledby="pied-plan">
            <h2 className="pied-titre" id="pied-plan">
              Le site
            </h2>
            <ul className="pied-liens">
              <li>
                <Link href="/produits">La carte</Link>
              </li>
              <li>
                <Link href="/la-maison">La maison</Link>
              </li>
              <li>
                <Link href="/contact">Horaires et accès</Link>
              </li>
              <li>
                <Link href="/mentions-legales">Mentions légales</Link>
              </li>
            </ul>
          </nav>
        </div>
        {/* L'enseigne, en grand, comme une signature dorée. */}
        <p className="pied-enseigne">{boulangerie.nomCourt}</p>
      </div>
    </footer>
  );
}
