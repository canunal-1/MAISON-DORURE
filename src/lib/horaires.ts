import type { Fermeture, Jour, Plage } from "@/content/site";

/** "06:30" -> "6 h 30", "19:00" -> "19 h" (espaces insécables). */
export function formaterHeure(heure: string): string {
  const [h, m] = heure.split(":").map(Number);
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
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

/* ---------- Dates ----------
 * Les dates sont des textes « AAAA-MM-JJ », toujours lues à Paris. Le calcul passe
 * par midi UTC : aucun changement d'heure ni fuseau de l'ordinateur ne peut décaler
 * le jour. */

function enUtc(date: string): Date {
  return new Date(`${date}T12:00:00Z`);
}

/** 0 = lundi … 6 = dimanche. */
export function jourDeLaSemaine(date: string): number {
  return (enUtc(date).getUTCDay() + 6) % 7;
}

export function ajouterJours(date: string, jours: number): string {
  const d = enUtc(date);
  d.setUTCDate(d.getUTCDate() + jours);
  return d.toISOString().slice(0, 10);
}

/** "2026-08-15" est valide, "2026-02-30" ou "15/08/2026" ne le sont pas. */
export function dateValide(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  try {
    return ajouterJours(date, 0) === date;
  } catch {
    return false;
  }
}

const formatLong = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const formatCourt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** « 1 août » s'écrit « 1er août ». */
function premier(texte: string): string {
  return texte.replace(/\b1 /, "1er ");
}

/** "2026-08-01" -> "1er", "2026-08-15" -> "15". */
function jourDuMois(date: string): string {
  const jour = Number(date.slice(8));
  return jour === 1 ? "1er" : String(jour);
}

/** "2026-08-15" -> "samedi 15 août". */
export function formaterDateLongue(date: string): string {
  return premier(formatLong.format(enUtc(date)));
}

/** "2026-08-15" -> "15 août". */
export function formaterJourMois(date: string): string {
  return premier(formatCourt.format(enUtc(date)));
}

/**
 * « Le samedi 15 août » ou « Du 1er au 15 août » ; l'année n'est ajoutée que si elle
 * diffère de celle d'aujourd'hui.
 */
export function formaterPeriode({ du, au }: Fermeture, aujourdhui: string): string {
  const fin = au ?? du;
  const annee = (date: string) => (date.slice(0, 4) === aujourdhui.slice(0, 4) ? "" : ` ${date.slice(0, 4)}`);

  if (fin === du) return `Le ${formaterDateLongue(du)}${annee(du)}`;
  if (du.slice(0, 7) === fin.slice(0, 7)) {
    return `Du ${jourDuMois(du)} au ${formaterJourMois(fin)}${annee(fin)}`;
  }
  return `Du ${formaterJourMois(du)}${annee(du)} au ${formaterJourMois(fin)}${annee(fin)}`;
}

/** Date, jour de la semaine (0 = lundi) et minutes depuis minuit, à l'heure de Paris. */
export function maintenantAParis(
  date: Date = new Date(),
): { date: string; jour: number; minutes: number } {
  const parties = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const lire = (type: string) => parties.find((p) => p.type === type)?.value ?? "";
  const jourDate = `${lire("year")}-${lire("month")}-${lire("day")}`;

  return {
    date: jourDate,
    jour: jourDeLaSemaine(jourDate),
    minutes: (Number(lire("hour")) % 24) * 60 + Number(lire("minute")),
  };
}

/* ---------- Fermetures exceptionnelles ---------- */

/** La fermeture qui couvre cette date, s'il y en a une. */
export function fermetureDuJour(fermetures: Fermeture[], date: string): Fermeture | undefined {
  return fermetures.find(({ du, au }) => du <= date && date <= (au ?? du));
}

/** Fermetures en cours ou à venir, de la plus proche à la plus lointaine. */
export function fermeturesAVenir(fermetures: Fermeture[], aujourdhui: string): Fermeture[] {
  return fermetures
    .filter(({ du, au }) => (au ?? du) >= aujourdhui)
    .sort((a, b) => a.du.localeCompare(b.du));
}

export type LigneHoraires = {
  jour: Jour;
  /** Prochaine date de ce jour de la semaine, aujourd'hui compris. */
  date: string;
  fermeture?: Fermeture;
};

/**
 * Les 7 jours du tableau, chacun avec sa prochaine date : un jour férié à venir
 * dans la semaine apparaît « Fermé » sans modifier les horaires habituels.
 */
export function semaineAVenir(
  horaires: Jour[],
  fermetures: Fermeture[],
  aujourdhui: string,
): LigneHoraires[] {
  const premierJour = jourDeLaSemaine(aujourdhui);
  return horaires.map((jour, index) => {
    const date = ajouterJours(aujourdhui, (index - premierJour + 7) % 7);
    return { jour, date, fermeture: fermetureDuJour(fermetures, date) };
  });
}

/* ---------- Ouvert / fermé ---------- */

export type Etat = {
  ouvert: boolean;
  /** Phrase courte : « Ouvert jusqu'à 19 h 30 ». */
  titre: string;
  /** Complément : prochaine ouverture, coupure, etc. */
  detail: string;
};

/** Le prochain jour où la boutique ouvre, fermetures exceptionnelles comprises. */
function prochaineOuverture(horaires: Jour[], fermetures: Fermeture[], depuis: string) {
  for (let decalage = 1; decalage <= 400; decalage++) {
    const date = ajouterJours(depuis, decalage);
    if (fermetureDuJour(fermetures, date)) continue;
    const jour = horaires[jourDeLaSemaine(date)];
    if (jour.plages.length > 0) return { date, decalage, jour };
  }
  return null;
}

export function etatBoutique(
  horaires: Jour[],
  date: Date = new Date(),
  fermetures: Fermeture[] = [],
): Etat {
  // Horaires pas encore renseignés : on ne prétend ni « ouvert » ni « fermé ».
  if (horaires.length === 0) return { ouvert: false, titre: "Horaires à venir", detail: "" };

  const { date: aujourdhui, jour, minutes } = maintenantAParis(date);
  const exception = fermetureDuJour(fermetures, aujourdhui);
  const plages = exception ? [] : horaires[jour].plages;

  for (const [debut, fin] of plages) {
    if (minutes >= enMinutes(debut) && minutes < enMinutes(fin)) {
      const reste = enMinutes(fin) - minutes;
      const demain = fermetureDuJour(fermetures, ajouterJours(aujourdhui, 1));
      const detail =
        reste <= 45
          ? `La boutique ferme dans ${reste} min.`
          : `Aujourd'hui : ${formaterPlages(plages)}.`;
      return {
        ouvert: true,
        titre: `Ouvert jusqu'à ${formaterHeure(fin)}`,
        detail: demain ? `${detail} Fermé demain${demain.motif ? ` (${demain.motif})` : ""}.` : detail,
      };
    }
  }

  // Fermé : encore une ouverture aujourd'hui (coupure du midi, avant l'ouverture) ?
  const plusTard = plages.find(([debut]) => enMinutes(debut) > minutes);
  if (plusTard) {
    return {
      ouvert: false,
      titre: `Fermé, ouvre à ${formaterHeure(plusTard[0])}`,
      detail: `Aujourd'hui : ${formaterPlages(plages)}.`,
    };
  }

  // Sinon, le prochain jour d'ouverture.
  const suivante = prochaineOuverture(horaires, fermetures, aujourdhui);
  if (suivante) {
    const quand =
      suivante.decalage === 1
        ? "demain"
        : suivante.decalage < 7
          ? suivante.jour.nom.toLowerCase()
          : `le ${formaterDateLongue(suivante.date)}`;
    const nomJour =
      suivante.decalage < 7
        ? suivante.jour.nom
        : formaterDateLongue(suivante.date).replace(/^./, (c) => c.toUpperCase());
    const prochain = `${nomJour} : ${formaterPlages(suivante.jour.plages)}.`;

    return {
      ouvert: false,
      titre: `Fermé${exception ? " aujourd'hui" : ""}, ouvre ${quand} à ${formaterHeure(suivante.jour.plages[0][0])}`,
      detail: exception
        ? `Fermeture exceptionnelle${exception.motif ? ` (${exception.motif})` : ""}. ${prochain}`
        : prochain,
    };
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
