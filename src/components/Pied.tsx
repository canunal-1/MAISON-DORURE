import Link from "next/link";
import { boulangerie, horaires } from "@/content/site";
import { formaterPlages } from "@/lib/horaires";
import { adresseComplete } from "./Coordonnees";
import Embleme from "./Embleme";

/** Regroupe les jours consécutifs aux mêmes horaires : « Mardi au samedi ». */
function resumeHoraires(): { jours: string; heures: string }[] {
  const groupes: { debut: string; fin: string; heures: string }[] = [];

  for (const jour of horaires) {
    const heures = formaterPlages(jour.plages);
    const dernier = groupes[groupes.length - 1];
    if (dernier && dernier.heures === heures) dernier.fin = jour.nom;
    else groupes.push({ debut: jour.nom, fin: jour.nom, heures });
  }

  return groupes.map(({ debut, fin, heures }) => ({
    jours: debut === fin ? debut : `${debut} au ${fin.toLowerCase()}`,
    heures,
  }));
}

export default function Pied() {
  const adresse = adresseComplete();
  const resume = resumeHoraires();

  return (
    <footer className="pied">
      <div className="pied-contenu">
        <div>
          <p className="pied-marque">
            <Embleme taille={22} />
            {boulangerie.nom}
          </p>
          <p>{adresse || "Adresse à venir"}</p>
          {boulangerie.telephone && <p>{boulangerie.telephone}</p>}
        </div>
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
        <ul className="pied-liens">
          <li>
            <Link href="/produits">La carte</Link>
          </li>
          <li>
            <Link href="/la-maison">La maison</Link>
          </li>
          <li>
            <Link href="/contact">Horaires</Link>
          </li>
          <li>
            <Link href="/mentions-legales">Mentions légales</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
