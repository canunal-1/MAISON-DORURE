"use client";

import { fermetures, horaires } from "@/content/site";
import {
  fermeturesAVenir,
  formaterJourMois,
  formaterPeriode,
  formaterPlages,
  maintenantAParis,
  resumerHoraires,
  semaineAVenir,
} from "@/lib/horaires";
import { useMinute } from "@/lib/useMinute";

/**
 * Les horaires de la semaine, avec le jour en cours mis en avant. Une fermeture
 * exceptionnelle qui tombe dans les 7 prochains jours remplace les horaires du jour
 * concerné ; la liste en dessous donne toutes les fermetures à venir.
 *
 * Quand les 7 jours ont les mêmes horaires et qu'aucune fermeture ne tombe dans la
 * semaine, une seule ligne suffit : « Tous les jours, 5 h – 22 h ».
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
  const resume = resumerHoraires(horaires);
  // Sans l'heure du visiteur, on ne sait pas encore si une fermeture tombe dans la semaine.
  const semaineNormale = maintenant ? lignes.every((ligne) => !ligne.fermeture) : fermetures.length === 0;

  // Un seul élément racine : sur l'accueil, le composant est un enfant direct de la grille.
  return (
    <div>
      {resume.length === 1 && semaineNormale ? (
        <p className="horaires-resume">
          <span className="horaires-resume-jours">{resume[0].jours}</span>
          <span className="visuellement-cache">, </span>
          <span className="horaires-resume-heures">{resume[0].heures}</span>
        </p>
      ) : (
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
      )}

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
