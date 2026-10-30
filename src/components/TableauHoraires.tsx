"use client";

import { fermetures, horaires } from "@/content/site";
import {
  fermeturesAVenir,
  formaterJourMois,
  formaterPeriode,
  formaterPlages,
  maintenantAParis,
  semaineAVenir,
} from "@/lib/horaires";
import { useMinute } from "@/lib/useMinute";

/**
 * Les horaires de la semaine, avec le jour en cours mis en avant. Une fermeture
 * exceptionnelle qui tombe dans les 7 prochains jours remplace les horaires du jour
 * concerné ; la liste en dessous donne toutes les fermetures à venir.
 */
export default function TableauHoraires() {
  const minute = useMinute();
  // Avant l'affichage dans le navigateur, l'heure du visiteur est inconnue.
  const maintenant = minute === null ? null : maintenantAParis(new Date(minute * 60_000));

  if (horaires.length === 0) {
    return <p className="a-venir">Horaires à venir</p>;
  }

  const lignes = maintenant
    ? semaineAVenir(horaires, fermetures, maintenant.date)
    : horaires.map((jour) => ({ jour, date: "", fermeture: undefined }));
  const aVenir = maintenant ? fermeturesAVenir(fermetures, maintenant.date) : [];

  // Un seul élément racine : sur l'accueil, le composant est un enfant direct de la grille.
  return (
    <div>
      <table className="horaires">
        <caption className="visuellement-cache">Horaires d&apos;ouverture de la semaine</caption>
        <tbody>
          {lignes.map(({ jour, date, fermeture }, index) => {
            const estAujourdhui = maintenant !== null && index === maintenant.jour;
            return (
              <tr key={jour.nom} className={estAujourdhui ? "est-aujourdhui" : undefined}>
                <th scope="row">
                  {jour.nom}
                  {estAujourdhui && <span className="horaires-repere"> (aujourd&apos;hui)</span>}
                </th>
                {fermeture ? (
                  <td className="est-ferme">
                    Fermé le {formaterJourMois(date)}
                    {fermeture.motif && (
                      <span className="horaires-motif">
                        <span className="visuellement-cache">, </span>
                        {fermeture.motif}
                      </span>
                    )}
                  </td>
                ) : (
                  <td className={jour.plages.length === 0 ? "est-ferme" : undefined}>
                    {formaterPlages(jour.plages)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {maintenant && aVenir.length > 0 && (
        <div className="fermetures">
          <h3>Fermetures exceptionnelles</h3>
          <ul>
            {aVenir.map((fermeture) => (
              <li key={`${fermeture.du}-${fermeture.au ?? ""}`}>
                {formaterPeriode(fermeture, maintenant.date)}
                {fermeture.motif && (
                  <span className="horaires-motif">
                    <span className="visuellement-cache">, </span>
                    {fermeture.motif}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
