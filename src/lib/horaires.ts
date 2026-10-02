import type { Jour, Plage } from "@/content/site";

/** "06:30" -> "6 h 30", "19:00" -> "19 h" (espaces insécables). */
export function formaterHeure(heure: string): string {
  const [h, m] = heure.split(":").map(Number);
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

export function formaterPlages(plages: Plage[]): string {
  if (plages.length === 0) return "Fermé";
  return plages
    .map(([debut, fin]) => `${formaterHeure(debut)} – ${formaterHeure(fin)}`)
    .join(" et ");
}

function enMinutes(heure: string): number {
  const [h, m] = heure.split(":").map(Number);
  return h * 60 + m;
}

/** Jour (0 = lundi) et minutes écoulées depuis minuit, à l'heure de Paris. */
export function maintenantAParis(date: Date = new Date()): { jour: number; minutes: number } {
  const parties = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const lire = (type: string) => parties.find((p) => p.type === type)?.value ?? "";
  const jours = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return {
    jour: Math.max(0, jours.indexOf(lire("weekday"))),
    minutes: Number(lire("hour")) * 60 + Number(lire("minute")),
  };
}

export type Etat = {
  ouvert: boolean;
  /** Phrase courte : « Ouvert jusqu'à 19 h 30 ». */
  titre: string;
  /** Complément : prochaine ouverture, coupure, etc. */
  detail: string;
};

export function etatBoutique(horaires: Jour[], date: Date = new Date()): Etat {
  const { jour, minutes } = maintenantAParis(date);
  const aujourdhui = horaires[jour];

  for (const [debut, fin] of aujourdhui.plages) {
    if (minutes >= enMinutes(debut) && minutes < enMinutes(fin)) {
      const reste = enMinutes(fin) - minutes;
      return {
        ouvert: true,
        titre: `Ouvert jusqu'à ${formaterHeure(fin)}`,
        detail:
          reste <= 45
            ? `La boutique ferme dans ${reste} min.`
            : `Aujourd'hui : ${formaterPlages(aujourdhui.plages)}.`,
      };
    }
  }

  // Fermé : on cherche la prochaine ouverture, aujourd'hui puis les 7 jours suivants.
  const plusTard = aujourdhui.plages.find(([debut]) => enMinutes(debut) > minutes);
  if (plusTard) {
    return {
      ouvert: false,
      titre: `Fermé, ouvre à ${formaterHeure(plusTard[0])}`,
      detail: `Aujourd'hui : ${formaterPlages(aujourdhui.plages)}.`,
    };
  }

  for (let decalage = 1; decalage <= 7; decalage++) {
    const suivant = horaires[(jour + decalage) % 7];
    if (suivant.plages.length > 0) {
      const quand = decalage === 1 ? "demain" : suivant.nom.toLowerCase();
      return {
        ouvert: false,
        titre: `Fermé, ouvre ${quand} à ${formaterHeure(suivant.plages[0][0])}`,
        detail: `${suivant.nom} : ${formaterPlages(suivant.plages)}.`,
      };
    }
  }

  return { ouvert: false, titre: "Fermé", detail: "Les horaires seront bientôt affichés." };
}

export function formaterPrix(prix: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(prix);
}

/** "0123456789" ou "01 23 45 67 89" -> lien tel: utilisable. */
export function lienTelephone(telephone: string): string {
  return `tel:${telephone.replace(/[^\d+]/g, "")}`;
}
