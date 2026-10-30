import { describe, expect, it } from "vitest";
import { boulangerie, type Jour } from "@/content/site";
import { descriptionSite, donneesStructurees, urlDuSite } from "./seo";

const SEMAINE: Jour[] = [
  { nom: "Lundi", plages: [] },
  { nom: "Mardi", plages: [["07:00", "19:00"]] },
  { nom: "Mercredi", plages: [["07:00", "19:00"]] },
  { nom: "Jeudi", plages: [["07:00", "19:00"]] },
  {
    nom: "Vendredi",
    plages: [
      ["07:00", "12:30"],
      ["15:00", "19:00"],
    ],
  },
  { nom: "Samedi", plages: [["08:00", "13:00"]] },
  { nom: "Dimanche", plages: [] },
];

const COMPLETE = {
  ...boulangerie,
  nom: "Boulangerie Test",
  accroche: "Une phrase.",
  adresse: { rue: "1 rue Exemple", codePostal: "75000", ville: "Paris" },
  telephone: "01 23 45 67 89",
  email: "contact@exemple.fr",
  instagram: "@exemple",
};

const VIDE = {
  ...boulangerie,
  accroche: "",
  adresse: { rue: "", codePostal: "", ville: "" },
  telephone: "",
  email: "",
  instagram: "",
};

describe("donneesStructurees (JSON-LD Bakery)", () => {
  it("décrit une boulangerie complète", () => {
    const donnees = donneesStructurees(COMPLETE, SEMAINE, [], "2026-06-10");
    expect(donnees["@type"]).toBe("Bakery");
    expect(donnees.name).toBe("Boulangerie Test");
    expect(donnees.telephone).toBe("01 23 45 67 89");
    expect(donnees.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "1 rue Exemple",
      postalCode: "75000",
      addressLocality: "Paris",
      addressCountry: "FR",
    });
    expect(donnees.sameAs).toEqual(["https://www.instagram.com/exemple"]);
  });

  it("regroupe les jours aux mêmes plages et omet les jours fermés", () => {
    const { openingHoursSpecification: blocs } = donneesStructurees(COMPLETE, SEMAINE, [], "2026-06-10");
    expect(blocs).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "https://schema.org/Tuesday",
          "https://schema.org/Wednesday",
          "https://schema.org/Thursday",
        ],
        opens: "07:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["https://schema.org/Friday"],
        opens: "07:00",
        closes: "12:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["https://schema.org/Friday"],
        opens: "15:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["https://schema.org/Saturday"],
        opens: "08:00",
        closes: "13:00",
      },
    ]);
  });

  it("déclare les fermetures à venir (00:00 – 00:00) et ignore les passées", () => {
    const { openingHoursSpecification: blocs } = donneesStructurees(
      COMPLETE,
      SEMAINE,
      [
        { du: "2026-05-01" },
        { du: "2026-08-01", au: "2026-08-15" },
        { du: "2026-12-25", motif: "Noël" },
      ],
      "2026-06-10",
    );
    expect(blocs?.slice(-2)).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        opens: "00:00",
        closes: "00:00",
        validFrom: "2026-08-01",
        validThrough: "2026-08-15",
      },
      {
        "@type": "OpeningHoursSpecification",
        opens: "00:00",
        closes: "00:00",
        validFrom: "2026-12-25",
        validThrough: "2026-12-25",
      },
    ]);
  });

  it("n'émet aucun champ pour une information manquante", () => {
    const json = JSON.parse(JSON.stringify(donneesStructurees(VIDE, [], [], "2026-06-10")));
    expect(Object.keys(json).sort()).toEqual(["@context", "@type", "image", "name", "url"]);
  });

  it("n'annonce pas de fermetures sans horaires (rien à contredire)", () => {
    const json = donneesStructurees(VIDE, [], [{ du: "2026-12-25" }], "2026-06-10");
    expect(json.openingHoursSpecification).toBeUndefined();
  });

  it("n'émet pas d'adresse partielle trompeuse : la ville seule suffit à en créer une", () => {
    const json = JSON.parse(
      JSON.stringify(donneesStructurees({ ...VIDE, adresse: { rue: "", codePostal: "", ville: "Lyon" } }, [], [])),
    );
    expect(json.address).toEqual({ "@type": "PostalAddress", addressLocality: "Lyon", addressCountry: "FR" });
  });
});

describe("urlDuSite et descriptionSite", () => {
  it("retire la barre finale de l'adresse du site", () => {
    expect(urlDuSite()).not.toMatch(/\/$/);
  });

  it("description : l'accroche si elle existe", () => {
    expect(descriptionSite(COMPLETE)).toBe("Une phrase.");
  });

  it("description sans accroche : le nom, et la ville seulement si elle est connue", () => {
    expect(descriptionSite(VIDE)).toBe(`${boulangerie.nom}.`);
    expect(descriptionSite({ ...VIDE, adresse: { rue: "", codePostal: "", ville: "Lyon" } })).toBe(
      `${boulangerie.nom}, Lyon.`,
    );
  });
});
