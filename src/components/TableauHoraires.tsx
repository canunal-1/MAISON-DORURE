"use client";

import { horaires } from "@/content/site";
import { formaterPlages, maintenantAParis } from "@/lib/horaires";
import { useMinute } from "@/lib/useMinute";

/** Les horaires de la semaine, avec le jour en cours mis en avant. */
export default function TableauHoraires() {
  const minute = useMinute();
  const aujourdhui = minute === null ? null : maintenantAParis(new Date(minute * 60_000)).jour;

  if (horaires.length === 0) {
    return <p className="a-venir">Horaires à venir</p>;
  }

  return (
    <table className="horaires">
      <caption className="visuellement-cache">Horaires d&apos;ouverture de la semaine</caption>
      <tbody>
        {horaires.map((jour, index) => (
          <tr key={jour.nom} className={index === aujourdhui ? "est-aujourdhui" : undefined}>
            <th scope="row">
              {jour.nom}
              {index === aujourdhui && <span className="horaires-repere"> (aujourd&apos;hui)</span>}
            </th>
            <td className={jour.plages.length === 0 ? "est-ferme" : undefined}>
              {formaterPlages(jour.plages)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
