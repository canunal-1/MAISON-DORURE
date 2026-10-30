import {
  boulangerie as boulangerieDuSite,
  commande as commandeDuSite,
  fermetures as fermeturesDuSite,
  horaires as horairesDuSite,
  type Fermeture,
  type Jour,
} from "@/content/site";
import {
  CHAMP_PIEGE,
  LIMITES,
  VIDE,
  type DonneesCommande,
  type ErreursCommande,
  type EtatCommande,
} from "./commande-types";
import {
  ajouterJours,
  dateValide,
  fermetureDuJour,
  formaterDateLongue,
  formaterJourMois,
  formaterPlages,
  jourDeLaSemaine,
  maintenantAParis,
} from "./horaires";
import { creerLimiteur } from "./limiteur";

/* ---------- Disponibilité ---------- */

/**
 * Le formulaire n'est proposé que s'il peut fonctionner : une adresse e-mail pour
 * recevoir les demandes (site.ts) et le service d'envoi configuré (variables d'environnement).
 * Sinon, aucun formulaire cassé n'est montré aux visiteurs.
 */
export function commandeDisponible(
  env: Record<string, string | undefined> = process.env,
  email: string = boulangerieDuSite.email,
): boolean {
  return Boolean(email && env.RESEND_API_KEY && env.COMMANDE_EXPEDITEUR);
}

/* ---------- Lecture et validation ---------- */

// Tous les caractères de contrôle, sauf tabulation et retour à la ligne.
const CONTROLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function lireLigne(formData: FormData, champ: string, max: number): string {
  const valeur = formData.get(champ);
  if (typeof valeur !== "string") return "";
  return valeur.replace(CONTROLE, "").replace(/\s+/g, " ").trim().slice(0, max);
}

function lireTexte(formData: FormData, champ: string, max: number): string {
  const valeur = formData.get(champ);
  if (typeof valeur !== "string") return "";
  return valeur.replace(CONTROLE, "").replace(/\r\n?/g, "\n").trim().slice(0, max);
}

/** Lit le formulaire : tout est nettoyé, rien n'est jamais interprété (texte seul). */
export function lireFormulaire(formData: FormData): DonneesCommande {
  return {
    nom: lireLigne(formData, "nom", LIMITES.nom * 2),
    telephone: lireLigne(formData, "telephone", 40),
    date: lireLigne(formData, "date", 20),
    demande: lireTexte(formData, "demande", LIMITES.demande * 2),
  };
}

export type Contexte = {
  /** « AAAA-MM-JJ », à Paris. */
  aujourdhui: string;
  horaires: Jour[];
  fermetures: Fermeture[];
  delaiJours: number;
};

/** Les erreurs de saisie, une phrase par champ ; objet vide = tout est valide. */
export function validerCommande(d: DonneesCommande, ctx: Contexte): ErreursCommande {
  const erreurs: ErreursCommande = {};

  if (d.nom.length < 2) erreurs.nom = "Indiquez votre nom.";
  else if (d.nom.length > LIMITES.nom) {
    erreurs.nom = `Ce nom est trop long (${LIMITES.nom} caractères au maximum).`;
  }

  const chiffres = d.telephone.replace(/\D/g, "");
  if (!d.telephone) erreurs.telephone = "Indiquez un numéro de téléphone pour vous joindre.";
  else if (!/^\+?[\d\s().-]+$/.test(d.telephone) || chiffres.length < 8 || chiffres.length > 15) {
    erreurs.telephone = "Ce numéro ne semble pas valide. Exemple : 06 12 34 56 78.";
  }

  const premier = ajouterJours(ctx.aujourdhui, ctx.delaiJours);
  const dernier = ajouterJours(ctx.aujourdhui, LIMITES.joursAvance);
  if (!d.date) erreurs.date = "Choisissez une date de retrait.";
  else if (!dateValide(d.date)) erreurs.date = "Cette date n'est pas valide.";
  else if (d.date < premier) {
    erreurs.date =
      ctx.delaiJours > 0
        ? `Choisissez une date à partir du ${formaterDateLongue(premier)} : la boutique demande ${ctx.delaiJours} jour${ctx.delaiJours > 1 ? "s" : ""} de délai.`
        : "Cette date est déjà passée.";
  } else if (d.date > dernier) erreurs.date = "Cette date est trop éloignée.";
  else {
    const exception = fermetureDuJour(ctx.fermetures, d.date);
    const jour = ctx.horaires.length === 7 ? ctx.horaires[jourDeLaSemaine(d.date)] : undefined;
    if (exception) {
      erreurs.date = `La boutique est fermée le ${formaterDateLongue(d.date)}${exception.motif ? ` (${exception.motif})` : ""}. Choisissez un autre jour.`;
    } else if (jour && jour.plages.length === 0) {
      erreurs.date = `La boutique est fermée le ${jour.nom.toLowerCase()}. Choisissez un autre jour.`;
    }
  }

  if (d.demande.length < 5) erreurs.demande = "Décrivez votre demande : quelques mots suffisent.";
  else if (d.demande.length > LIMITES.demande) {
    erreurs.demande = `Votre demande est trop longue (${LIMITES.demande} caractères au maximum).`;
  }

  return erreurs;
}

/* ---------- E-mail ---------- */

/** Texte brut de l'e-mail reçu par la boutique. */
export function composerEmail(
  d: DonneesCommande,
  horaires: Jour[],
  nomBoutique: string,
): { sujet: string; texte: string } {
  const jour = horaires.length === 7 ? horaires[jourDeLaSemaine(d.date)] : undefined;
  const ouverture = jour ? ` (ouverture ce jour-là : ${formaterPlages(jour.plages)})` : "";

  return {
    sujet: `Demande de commande de ${d.nom} pour le ${formaterJourMois(d.date)}`,
    texte: [
      `Nouvelle demande de commande reçue sur le site de la ${nomBoutique}.`,
      "",
      `Nom : ${d.nom}`,
      `Téléphone : ${d.telephone}`,
      `Retrait souhaité : ${formaterDateLongue(d.date)}${ouverture}`,
      "",
      "Demande :",
      d.demande,
      "",
      "—",
      "Ce n'est pas une commande confirmée : le client attend une réponse de la boutique.",
    ].join("\n"),
  };
}

/** Envoie l'e-mail par l'API de Resend. N'écrit jamais la clé ni le contenu dans les journaux. */
async function envoyerEmail(
  env: Record<string, string | undefined>,
  fetchFn: typeof fetch,
  destinataire: string,
  { sujet, texte }: { sujet: string; texte: string },
): Promise<boolean> {
  try {
    const reponse = await fetchFn(env.RESEND_API_URL || "https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.COMMANDE_EXPEDITEUR,
        to: [destinataire],
        subject: sujet,
        text: texte,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!reponse.ok) {
      console.error(`[commande] le service d'envoi a refusé la demande (HTTP ${reponse.status})`);
      return false;
    }
    return true;
  } catch (erreur) {
    console.error("[commande] le service d'envoi est injoignable :", (erreur as Error).name);
    return false;
  }
}

/* ---------- Traitement d'une demande ---------- */

type Limiteur = ReturnType<typeof creerLimiteur>;

// Au plus 3 demandes par visiteur et par 10 minutes, 20 par heure en tout.
const limiteurParVisiteur = creerLimiteur({ max: 3, fenetreMs: 10 * 60_000 });
const limiteurGlobal = creerLimiteur({ max: 20, fenetreMs: 60 * 60_000 });

export type Dependances = {
  env: Record<string, string | undefined>;
  fetchFn: typeof fetch;
  maintenant: Date;
  /** Identifie le visiteur pour la limitation de débit. */
  visiteur: string;
  boulangerie: typeof boulangerieDuSite;
  horaires: Jour[];
  fermetures: Fermeture[];
  commande: typeof commandeDuSite;
  limiteurs: { parVisiteur: Limiteur; global: Limiteur };
};

export async function traiterCommande(
  formData: FormData,
  surcharge: Partial<Dependances> = {},
): Promise<EtatCommande> {
  const deps: Dependances = {
    env: process.env,
    fetchFn: fetch,
    maintenant: new Date(),
    visiteur: "inconnu",
    boulangerie: boulangerieDuSite,
    horaires: horairesDuSite,
    fermetures: fermeturesDuSite,
    commande: commandeDuSite,
    limiteurs: { parVisiteur: limiteurParVisiteur, global: limiteurGlobal },
    ...surcharge,
  };

  const succes = (): EtatCommande => ({
    statut: "envoye",
    erreurs: {},
    valeurs: VIDE,
    message: deps.commande.merci,
  });

  // Champ piège rempli : c'est un robot. On fait semblant de réussir, sans rien envoyer.
  const piege = formData.get(CHAMP_PIEGE);
  if (typeof piege === "string" && piege.trim() !== "") return succes();

  const valeurs = lireFormulaire(formData);
  const erreurs = validerCommande(valeurs, {
    aujourdhui: maintenantAParis(deps.maintenant).date,
    horaires: deps.horaires,
    fermetures: deps.fermetures,
    delaiJours: deps.commande.delaiJours,
  });
  if (Object.keys(erreurs).length > 0) {
    return {
      statut: "erreur",
      erreurs,
      valeurs,
      message: "Le formulaire contient des erreurs : corrigez-les, puis envoyez-le de nouveau.",
    };
  }

  const appel = deps.boulangerie.telephone
    ? ` Vous pouvez aussi appeler la boutique au ${deps.boulangerie.telephone}.`
    : "";
  const echec = (message: string): EtatCommande => ({
    statut: "erreur",
    erreurs: {},
    valeurs,
    message: message + appel,
  });

  if (!commandeDisponible(deps.env, deps.boulangerie.email)) {
    console.error("[commande] formulaire non configuré (e-mail de la boutique ou variables d'envoi manquants)");
    return echec("L'envoi des demandes est momentanément indisponible.");
  }

  if (!deps.limiteurs.parVisiteur.autoriser(deps.visiteur) || !deps.limiteurs.global.autoriser("tous")) {
    return echec("Trop de demandes ont été envoyées en peu de temps. Réessayez dans quelques minutes.");
  }

  const email = composerEmail(valeurs, deps.horaires, deps.boulangerie.nom);
  const envoye = await envoyerEmail(deps.env, deps.fetchFn, deps.boulangerie.email, email);
  return envoye
    ? succes()
    : echec("Votre demande n'a pas pu être envoyée. Vos informations sont conservées dans le formulaire : réessayez dans un instant.");
}
