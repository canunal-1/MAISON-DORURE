/** Types et constantes partagés entre le formulaire (navigateur) et le traitement (serveur). */

export type Champ = "nom" | "telephone" | "date" | "demande";
export type DonneesCommande = Record<Champ, string>;
export type ErreursCommande = Partial<Record<Champ, string>>;

export type EtatCommande = {
  statut: "initial" | "envoye" | "erreur";
  /** Erreur par champ, affichée sous le champ concerné. */
  erreurs: ErreursCommande;
  /** Ce que le visiteur a saisi : renvoyé pour ne pas lui faire tout retaper. */
  valeurs: DonneesCommande;
  /** Message général (succès, ou erreur qui ne vient pas d'un champ). */
  message: string;
};

export const VIDE: DonneesCommande = { nom: "", telephone: "", date: "", demande: "" };

export const ETAT_INITIAL: EtatCommande = { statut: "initial", erreurs: {}, valeurs: VIDE, message: "" };

export const LIMITES = { nom: 100, demande: 1500, joursAvance: 365 } as const;

/** Champ invisible : seuls les robots le remplissent. */
export const CHAMP_PIEGE = "site_web";
