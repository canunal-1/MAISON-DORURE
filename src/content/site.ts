/**
 * TOUT LE CONTENU DU SITE EST ICI.
 *
 * Pour changer un horaire, un prix, un produit ou un texte, modifie ce fichier :
 * les pages se mettent à jour toutes seules.
 *
 * Les valeurs ci-dessous sont des EXEMPLES à remplacer par les vraies
 * informations de la boulangerie (adresse, téléphone, horaires, carte, prix).
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
  accroche: "Le pain du jour, les viennoiseries du matin, les gâteaux du dimanche.",

  // Laisse une chaîne vide ("") tant que l'information n'est pas connue :
  // le site affichera « à venir » à la place.
  adresse: {
    rue: "",
    codePostal: "",
    ville: "",
  },
  telephone: "",
  email: "",
  instagram: "",
};

/** Du lundi au dimanche, dans cet ordre. Heures au format "HH:MM". */
export const horaires: Jour[] = [
  { nom: "Lundi", plages: [] },
  { nom: "Mardi", plages: [["06:30", "19:30"]] },
  { nom: "Mercredi", plages: [["06:30", "19:30"]] },
  { nom: "Jeudi", plages: [["06:30", "19:30"]] },
  { nom: "Vendredi", plages: [["06:30", "19:30"]] },
  { nom: "Samedi", plages: [["06:30", "19:30"]] },
  { nom: "Dimanche", plages: [["07:00", "13:00"]] },
];

export const carte: Categorie[] = [
  {
    id: "pains",
    titre: "Pains",
    produits: [
      { nom: "Baguette de tradition", prix: 1.3, detail: "Farine de blé, levain, cuisson sur sole", phare: true },
      { nom: "Baguette", prix: 1.1 },
      { nom: "Pain de campagne", prix: 3.2, detail: "500 g, mie dense et croûte épaisse", phare: true },
      { nom: "Pain complet", prix: 3.4, detail: "500 g" },
      { nom: "Pain aux céréales", prix: 3.6, detail: "Lin, tournesol, sésame, pavot" },
      { nom: "Pain de seigle", prix: 3.5, detail: "500 g" },
    ],
  },
  {
    id: "viennoiseries",
    titre: "Viennoiseries",
    produits: [
      { nom: "Croissant au beurre", prix: 1.3, phare: true },
      { nom: "Pain au chocolat", prix: 1.4, phare: true },
      { nom: "Pain aux raisins", prix: 1.7 },
      { nom: "Chausson aux pommes", prix: 1.8 },
      { nom: "Brioche", prix: 5.5, detail: "La pièce, 400 g" },
    ],
  },
  {
    id: "patisseries",
    titre: "Pâtisseries",
    note: "Les gâteaux à partager se commandent 48\u00a0h à l'avance.",
    produits: [
      { nom: "Éclair", prix: 3.2, detail: "Chocolat ou café" },
      { nom: "Tartelette aux fruits", prix: 3.8, detail: "Selon la saison", phare: true },
      { nom: "Flan pâtissier", prix: 2.9, detail: "La part" },
      { nom: "Millefeuille", prix: 3.6 },
      { nom: "Gâteau à partager", prix: 24, detail: "6 parts, sur commande", phare: true },
    ],
  },
  {
    id: "sale",
    titre: "Salé",
    produits: [
      { nom: "Sandwich jambon-beurre", prix: 4.5, detail: "Sur baguette de tradition" },
      { nom: "Quiche lorraine", prix: 3.9, detail: "La part" },
      { nom: "Fougasse aux olives", prix: 3.5 },
    ],
  },
];

export const maison = {
  titre: "Une boulangerie de quartier",
  paragraphes: [
    "On vient chez Maaned pour le pain du jour, pour les viennoiseries du matin, et le dimanche pour un gâteau à poser au milieu de la table.",
    "Le pain est façonné et cuit ici, plusieurs fois par jour, pour qu'il y en ait du frais le matin comme en fin d'après-midi.",
    "La carte reste courte et suit les saisons : les fruits des tartelettes changent au fil de l'année.",
  ],
  engagements: [
    {
      titre: "Du pain toute la journée",
      texte: "Plusieurs fournées entre l'ouverture et la fermeture, pas seulement celle du matin.",
    },
    {
      titre: "Une carte de saison",
      texte: "Les fruits et les garnitures changent avec ce qu'on trouve de bon au moment.",
    },
    {
      titre: "Des commandes sur mesure",
      texte: "Gâteau d'anniversaire, pains pour un repas de famille, viennoiseries pour une réunion.",
    },
  ],
};

export const commande = {
  titre: "Passer une commande",
  texte:
    "Pour un gâteau à partager ou une grande quantité de pain ou de viennoiseries, appelez la boutique ou passez nous voir, au moins 48\u00a0h avant.",
};
