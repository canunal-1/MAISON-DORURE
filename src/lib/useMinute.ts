"use client";

import { useSyncExternalStore } from "react";

function abonner(prevenir: () => void) {
  const minuteur = setInterval(prevenir, 15_000);
  return () => clearInterval(minuteur);
}

/**
 * La minute en cours (nombre de minutes depuis 1970), mise à jour toute seule.
 * Vaut `null` pendant le rendu côté serveur, où l'heure du visiteur est inconnue.
 */
export function useMinute(): number | null {
  return useSyncExternalStore(
    abonner,
    () => Math.floor(Date.now() / 60_000),
    () => null,
  );
}
