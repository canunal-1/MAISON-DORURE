/**
 * Limiteur de débit en mémoire : « au plus `max` passages par `fenetreMs` pour une clé ».
 *
 * Protection de base contre un robot qui inonderait la boîte mail de la boutique. La
 * mémoire n'est pas partagée entre les instances d'un hébergement « serverless » : la
 * protection est donc partielle, et à compléter par celle de l'hébergeur (voir le README).
 */
export function creerLimiteur({ max, fenetreMs }: { max: number; fenetreMs: number }) {
  const passages = new Map<string, number[]>();

  return {
    /** `true` si le passage est autorisé (et compté), `false` s'il faut le refuser. */
    autoriser(cle: string, maintenant: number = Date.now()): boolean {
      const recents = (passages.get(cle) ?? []).filter((t) => maintenant - t < fenetreMs);
      const autorise = recents.length < max;
      if (autorise) recents.push(maintenant);
      passages.set(cle, recents);

      // Ménage : la table ne doit pas grossir indéfiniment.
      if (passages.size > 1000) {
        for (const [autre, heures] of passages) {
          if (heures.every((t) => maintenant - t >= fenetreMs)) passages.delete(autre);
        }
      }
      return autorise;
    },
  };
}
