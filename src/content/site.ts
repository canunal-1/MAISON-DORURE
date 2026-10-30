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

/** Une photo rangée dans le dossier public/photos/. */
export type Photo = {
  /** Chemin depuis public/, ex. "/photos/vitrine.jpg". */
  src: string;
  /** Description pour les personnes qui ne voient pas l'image : obligatoire. */
  alt: string;
  /** Facultatif : partie de la photo à garder quand elle est recadrée, ex. "center 30%". */
  cadrage?: string;
};

/** Une fermeture exceptionnelle : un jour (`du`) ou une période (`du` → `au`, inclus). */
export type Fermeture = {
  /** Format "AAAA-MM-JJ". */
  du: string;
  /** Dernier jour fermé, même format. Absent = un seul jour. */
  au?: string;
  /** Affiché aux visiteurs : "Jour férié", "Congés annuels"… */
  motif?: string;
};

/** Les 14 allergènes à déclaration obligatoire (règlement européen n° 1169/2011). */
export const ALLERGENES = [
  "gluten",
  "crustacés",
  "œufs",
  "poissons",
  "arachides",
  "soja",
  "lait",
  "fruits à coque",
  "céleri",
  "moutarde",
  "sésame",
  "sulfites",
  "lupin",
  "mollusques",
] as const;

export type Allergene = (typeof ALLERGENES)[number];

export type Produit = {
  nom: string;
  /** Prix en euros. */
  prix: number;
  detail?: string;
  /** Affiché aussi sur la page d'accueil. */
  phare?: boolean;
  /** Photo du produit : montrée sur la page d'accueil, pour les produits « phare ». */
  photo?: Photo;
  /**
   * Allergènes présents, parmi la liste officielle (propositions à l'écriture).
   * Absent ou vide : rien n'est affiché. Le site n'écrit jamais « sans allergène » :
   * ne renseigner que ce qui a été vérifié.
   */
  allergenes?: Allergene[];
};

export type Categorie = {
  id: string;
  titre: string;
  note?: string;
  produits: Produit[];
};

export const boulangerie = {
  nom: "Maison Dorure",
  /** Nom affiché sur l'enseigne, le logo et l'image de partage. */
  nomCourt: "Maison Dorure",
  /** Le métier, écrit au-dessus du nom sur l'enseigne. */
  metier: "Boulangerie",
  /** Une phrase de présentation (page d'accueil et résultats de recherche). */
  accroche: "",

  adresse: {
    rue: "139 avenue de Flandre",
    codePostal: "75019",
    ville: "Paris",
  },
  telephone: "",
  email: "",
  instagram: "",

  /**
   * Adresse du site une fois en ligne, sans barre finale (ex. "https://www.exemple.fr").
   * Sert aux liens absolus : plan du site, image de partage, données pour Google.
   * Vide : sur Vercel, l'adresse du projet est utilisée automatiquement.
   */
  siteUrl: "",
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
export const horaires: Jour[] = [
  { nom: "Lundi", plages: [["05:00", "22:00"]] },
  { nom: "Mardi", plages: [["05:00", "22:00"]] },
  { nom: "Mercredi", plages: [["05:00", "22:00"]] },
  { nom: "Jeudi", plages: [["05:00", "22:00"]] },
  { nom: "Vendredi", plages: [["05:00", "22:00"]] },
  { nom: "Samedi", plages: [["05:00", "22:00"]] },
  { nom: "Dimanche", plages: [["05:00", "22:00"]] },
];

/**
 * Jours fériés et congés pendant lesquels la boutique est fermée, en plus des
 * horaires habituels. Le site les respecte : « Fermé aujourd'hui », prochaine
 * ouverture décalée, jour barré dans le tableau des horaires.
 * Les dates passées sont ignorées toutes seules ; on peut les laisser.
 *
 *   { du: "AAAA-MM-JJ", motif: "Jour férié" },                         // un jour
 *   { du: "AAAA-MM-JJ", au: "AAAA-MM-JJ", motif: "Congés annuels" },   // une période
 *
 * Vide = aucune fermeture annoncée.
 */
export const fermetures: Fermeture[] = [];

/**
 * La carte, par catégorie. Liste vide = « La carte arrive bientôt ».
 *
 *   {
 *     id: "pains",                       // sans espace ni accent
 *     titre: "Pains",
 *     produits: [{ nom: "…", prix: 0, detail: "…", phare: true, allergenes: ["gluten", "lait"] }],
 *   }
 */
export const carte: Categorie[] = [];

/** Phrase d'introduction en haut de la page « La carte ». Facultatif. */
export const introCarte = "";

/**
 * Les photos du site. `null` = pas de photo : aucun cadre vide n'est affiché.
 * Déposer le fichier dans public/photos/ puis renseigner :
 *
 *   accueil: { src: "/photos/vitrine.jpg", alt: "Description de la photo" },
 *
 * Les photos des produits phares se renseignent dans `carte` (champ `photo`).
 */
export const photos: { accueil: Photo | null; maison: Photo | null } = {
  accueil: null,
  maison: null,
};

export const maison = {
  titre: "La maison",
  /** Histoire de la boulangerie : un paragraphe par ligne. */
  paragraphes: [] as string[],
  /** Facultatif : { titre, texte }. */
  engagements: [] as { titre: string; texte: string }[],
};

export const commande = {
  titre: "Passer une commande",
  /** Comment commander (délai, téléphone…). Vide = pas de texte d'introduction. */
  texte: "",
  /**
   * Délai minimum entre la demande et le retrait, en jours : le formulaire refuse les
   * dates plus proches. 0 = retrait possible dès aujourd'hui.
   */
  delaiJours: 0,
  /**
   * Le formulaire de commande n'apparaît que si l'e-mail de la boutique est renseigné
   * (`boulangerie.email`) ET que le service d'envoi est configuré (voir le README).
   */
  avertissement:
    "Cette demande n'est pas une commande confirmée : elle l'est lorsque la boutique vous a répondu.",
  merci: "Votre demande a bien été envoyée à la boutique.",
};

/** Obligations légales : à remplir pour que la page « Mentions légales » soit complète. */
export const mentionsLegales = {
  /** Nom et prénom de la personne responsable de la publication du site. */
  responsable: "",
  /** 14 chiffres. */
  siret: "",
  hebergeur: {
    nom: "",
    adresse: "",
    /** Adresse du site de l'hébergeur (ex. "https://vercel.com"). */
    site: "",
  },
  /** Données saisies dans le formulaire de commande (section affichée seulement s'il est actif). */
  donnees: {
    /** Combien de temps les demandes sont gardées (à décider), ex. "3 mois". */
    conservation: "",
    /** Service qui transporte l'e-mail de la demande jusqu'à la boutique. */
    prestataireEmail: "Resend (service d'envoi d'e-mails)",
  },
};
