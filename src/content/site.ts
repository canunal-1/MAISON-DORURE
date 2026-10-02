/**
 * TOUT LE CONTENU DU SITE EST ICI.
 *
 * Pour changer un horaire, un prix, un produit ou un texte, modifier ce fichier :
 * les pages se mettent à jour toutes seules.
 *
 * Règle : une information inconnue reste VIDE ("" ou []). Le site affiche alors
 * « à venir » (ou masque la section) au lieu d'inventer quoi que ce soit.
 */

export type Plage = [ouverture: string, fermeture: string];

export type Jour = {
  nom: string;
  /** Liste vide = fermé. Deux plages = coupure le midi. */
  plages: Plage[];
};

export type Produit = {
  nom: string;
  /** Prix en euros. */
  prix: number;
  detail?: string;
  /** Affiché aussi sur la page d'accueil. */
  phare?: boolean;
};

export type Categorie = {
  id: string;
  titre: string;
  note?: string;
  produits: Produit[];
};

export const boulangerie = {
  nom: "Boulangerie Maaned",
  nomCourt: "Maaned",
  /** Une phrase de présentation (page d'accueil et résultats de recherche). */
  accroche: "",

  adresse: {
    rue: "",
    codePostal: "",
    ville: "",
  },
  telephone: "",
  email: "",
  instagram: "",
};

/**
 * Du lundi au dimanche, dans cet ordre, heures au format "HH:MM".
 * Liste vide = horaires pas encore connus (le site affiche « Horaires à venir »).
 * Une fois connus, renseigner les 7 jours :
 *
 *   { nom: "Lundi", plages: [] },                          // fermé
 *   { nom: "Mardi", plages: [["HH:MM", "HH:MM"]] },        // une plage
 *   { nom: "Samedi", plages: [["HH:MM", "HH:MM"], ["HH:MM", "HH:MM"]] }, // coupure
 */
export const horaires: Jour[] = [];

/**
 * La carte, par catégorie. Liste vide = « La carte arrive bientôt ».
 *
 *   {
 *     id: "pains",                       // sans espace ni accent
 *     titre: "Pains",
 *     produits: [{ nom: "…", prix: 0, detail: "…", phare: true }],
 *   }
 */
export const carte: Categorie[] = [];

/** Phrase d'introduction en haut de la page « La carte ». Facultatif. */
export const introCarte = "";

export const maison = {
  titre: "La maison",
  /** Histoire de la boulangerie : un paragraphe par ligne. */
  paragraphes: [] as string[],
  /** Facultatif : { titre, texte }. */
  engagements: [] as { titre: string; texte: string }[],
};

export const commande = {
  titre: "Passer une commande",
  /** Comment commander (délai, téléphone…). Vide = la section n'est pas affichée. */
  texte: "",
};
