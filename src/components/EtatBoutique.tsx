"use client";

import { horaires } from "@/content/site";
import { etatBoutique } from "@/lib/horaires";
import { useMinute } from "@/lib/useMinute";

/**
 * Affiche « Ouvert jusqu'à… » ou « Fermé, ouvre à… » selon l'heure de Paris.
 * Calculé dans le navigateur pour rester juste même si la page est en cache.
 */
export default function EtatBoutique() {
  const minute = useMinute();
  const etat = minute === null ? null : etatBoutique(horaires, new Date(minute * 60_000));

  return (
    <div className="etat" aria-live="polite">
      <p className="etat-titre">
        <span className={`etat-pastille ${etat?.ouvert ? "est-ouvert" : ""}`} aria-hidden="true" />
        {etat ? etat.titre : "Horaires du jour"}
      </p>
      <p className="etat-detail">{etat ? etat.detail : " "}</p>
    </div>
  );
}
