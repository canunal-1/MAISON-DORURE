import { afterEach, describe, expect, it } from "vitest";
import type { Fermeture, Jour } from "@/content/site";
import {
  ajouterJours,
  dateValide,
  etatBoutique,
  fermetureDuJour,
  fermeturesAVenir,
  formaterHeure,
  formaterPeriode,
  formaterPlages,
  formaterPrix,
  jourDeLaSemaine,
  lienTelephone,
  maintenantAParis,
  resumerHoraires,
  semaineAVenir,
} from "./horaires";

/**
 * Semaine fictive, propre aux tests (indépendante de site.ts) :
 * lundi fermé, mardi avec coupure du midi, dimanche le matin seulement.
 */
const SEMAINE: Jour[] = [
  { nom: "Lundi", plages: [] },
  {
    nom: "Mardi",
    plages: [
      ["07:00", "12:30"],
      ["15:00", "19:00"],
    ],
  },
  { nom: "Mercredi", plages: [["07:00", "19:00"]] },
  { nom: "Jeudi", plages: [["07:00", "19:00"]] },
  { nom: "Vendredi", plages: [["07:00", "19:00"]] },
  { nom: "Samedi", plages: [["07:00", "19:00"]] },
  { nom: "Dimanche", plages: [["08:00", "13:00"]] },
];

/*
 * Repères de calendrier utilisés ci-dessous (Paris) :
 *   lundi 8 juin 2026, mardi 9, mercredi 10, jeudi 11 … dimanche 14, lundi 15
 *   en juin : heure d'été (UTC+2) ; en janvier : heure d'hiver (UTC+1).
 */

/** Un instant décrit à l'heure d'été de Paris : ete("2026-06-09", "07:00"). */
const ete = (jour: string, heure: string) => new Date(`${jour}T${heure}:00+02:00`);
const hiver = (jour: string, heure: string) => new Date(`${jour}T${heure}:00+01:00`);

describe("etatBoutique : ouvert", () => {
  it("est ouvert en milieu de plage", () => {
    const etat = etatBoutique(SEMAINE, ete("2026-06-09", "09:00"));
    expect(etat.ouvert).toBe(true);
    expect(etat.titre).toBe("Ouvert jusqu'à 12 h 30");
    expect(etat.detail).toBe("Aujourd'hui : 7 h – 12 h 30 et 15 h – 19 h.");
  });

  it("est ouvert à la minute exacte d'ouverture", () => {
    expect(etatBoutique(SEMAINE, ete("2026-06-10", "07:00")).ouvert).toBe(true);
  });

  it("annonce la fermeture proche dans les 45 dernières minutes", () => {
    const etat = etatBoutique(SEMAINE, ete("2026-06-10", "18:15"));
    expect(etat.ouvert).toBe(true);
    expect(etat.detail).toBe("La boutique ferme dans 45 min.");
    // À 46 minutes de la fermeture, on affiche les horaires du jour à la place.
    expect(etatBoutique(SEMAINE, ete("2026-06-10", "18:14")).detail).toBe("Aujourd'hui : 7 h – 19 h.");
  });

  it("fonctionne à l'heure d'hiver", () => {
    const etat = etatBoutique(SEMAINE, hiver("2026-01-14", "09:00")); // mercredi
    expect(etat.ouvert).toBe(true);
    expect(etat.titre).toBe("Ouvert jusqu'à 19 h");
  });
});

describe("etatBoutique : fermé", () => {
  it("est fermé avant l'ouverture et annonce l'heure d'ouverture du jour", () => {
    const etat = etatBoutique(SEMAINE, ete("2026-06-10", "06:59"));
    expect(etat.ouvert).toBe(false);
    expect(etat.titre).toBe("Fermé, ouvre à 7 h");
  });

  it("est fermé pendant la coupure du midi et rouvre l'après-midi", () => {
    const coupure = etatBoutique(SEMAINE, ete("2026-06-09", "13:00"));
    expect(coupure.ouvert).toBe(false);
    expect(coupure.titre).toBe("Fermé, ouvre à 15 h");
    expect(coupure.detail).toBe("Aujourd'hui : 7 h – 12 h 30 et 15 h – 19 h.");

    expect(etatBoutique(SEMAINE, ete("2026-06-09", "12:29")).ouvert).toBe(true);
    expect(etatBoutique(SEMAINE, ete("2026-06-09", "12:30")).ouvert).toBe(false);
    expect(etatBoutique(SEMAINE, ete("2026-06-09", "14:59")).ouvert).toBe(false);
    const reprise = etatBoutique(SEMAINE, ete("2026-06-09", "15:00"));
    expect(reprise.ouvert).toBe(true);
    expect(reprise.titre).toBe("Ouvert jusqu'à 19 h");
  });

  it("est fermé tout le jour de fermeture hebdomadaire et annonce demain", () => {
    const etat = etatBoutique(SEMAINE, ete("2026-06-08", "10:00")); // lundi
    expect(etat.ouvert).toBe(false);
    expect(etat.titre).toBe("Fermé, ouvre demain à 7 h");
    expect(etat.detail).toBe("Mardi : 7 h – 12 h 30 et 15 h – 19 h.");
  });

  it("annonce le nom du jour quand l'ouverture n'est pas demain", () => {
    const etat = etatBoutique(SEMAINE, ete("2026-06-14", "13:30")); // dimanche, après la fermeture
    expect(etat.titre).toBe("Fermé, ouvre mardi à 7 h"); // lundi fermé
    expect(etat.detail).toBe("Mardi : 7 h – 12 h 30 et 15 h – 19 h.");
  });

  it("dernière minute avant la fermeture : encore ouvert, puis fermé à l'heure pile", () => {
    const derniere = etatBoutique(SEMAINE, ete("2026-06-10", "18:59"));
    expect(derniere.ouvert).toBe(true);
    expect(derniere.detail).toBe("La boutique ferme dans 1 min.");

    const fermeture = etatBoutique(SEMAINE, ete("2026-06-10", "19:00"));
    expect(fermeture.ouvert).toBe(false);
    expect(fermeture.titre).toBe("Fermé, ouvre demain à 7 h");
  });

  it("n'affirme ni ouvert ni fermé quand les horaires ne sont pas renseignés", () => {
    const etat = etatBoutique([], ete("2026-06-10", "10:00"));
    expect(etat).toEqual({ ouvert: false, titre: "Horaires à venir", detail: "" });
  });

  it("reste « Fermé » si aucun jour n'est jamais ouvert", () => {
    const toutFerme = SEMAINE.map((jour) => ({ ...jour, plages: [] }));
    const etat = etatBoutique(toutFerme, ete("2026-06-10", "10:00"));
    expect(etat.ouvert).toBe(false);
    expect(etat.titre).toBe("Fermé");
  });
});

describe("etatBoutique : tous les jours de 5 h à 22 h, sans coupure", () => {
  const TOUS_LES_JOURS: Jour[] = SEMAINE.map(({ nom }) => ({ nom, plages: [["05:00", "22:00"]] }));

  for (const [saison, instant] of [
    ["heure d'hiver", (heure: string) => hiver("2026-11-04", heure)], // mercredi
    ["heure d'été", (heure: string) => ete("2026-06-10", heure)], // mercredi
  ] as const) {
    it(`${saison} : fermé à 4 h 59, ouvert à 5 h`, () => {
      const avant = etatBoutique(TOUS_LES_JOURS, instant("04:59"));
      expect(avant.ouvert).toBe(false);
      expect(avant.titre).toBe("Fermé, ouvre à 5 h");
      expect(avant.detail).toBe("Aujourd'hui : 5 h – 22 h.");

      const ouverture = etatBoutique(TOUS_LES_JOURS, instant("05:00"));
      expect(ouverture.ouvert).toBe(true);
      expect(ouverture.titre).toBe("Ouvert jusqu'à 22 h");
      expect(ouverture.detail).toBe("Aujourd'hui : 5 h – 22 h.");
    });

    it(`${saison} : ouvert à 21 h 30 (fermeture proche), fermé à 22 h`, () => {
      const soir = etatBoutique(TOUS_LES_JOURS, instant("21:30"));
      expect(soir.ouvert).toBe(true);
      expect(soir.titre).toBe("Ouvert jusqu'à 22 h");
      expect(soir.detail).toBe("La boutique ferme dans 30 min.");

      const fermeture = etatBoutique(TOUS_LES_JOURS, instant("22:00"));
      expect(fermeture.ouvert).toBe(false);
      expect(fermeture.titre).toBe("Fermé, ouvre demain à 5 h");
      expect(fermeture.detail).toBe("Jeudi : 5 h – 22 h.");
    });
  }

  it("après minuit, annonce l'ouverture du jour même", () => {
    const etat = etatBoutique(TOUS_LES_JOURS, hiver("2026-11-05", "00:30")); // jeudi
    expect(etat.ouvert).toBe(false);
    expect(etat.titre).toBe("Fermé, ouvre à 5 h");
  });
});

describe("etatBoutique : fermetures exceptionnelles", () => {
  const FERIE: Fermeture[] = [{ du: "2026-06-10", motif: "Jour férié" }]; // mercredi

  it("est fermé le jour de la fermeture, même en pleines heures d'ouverture", () => {
    const etat = etatBoutique(SEMAINE, ete("2026-06-10", "10:00"), FERIE);
    expect(etat.ouvert).toBe(false);
    expect(etat.titre).toBe("Fermé aujourd'hui, ouvre demain à 7 h");
    expect(etat.detail).toBe("Fermeture exceptionnelle (Jour férié). Jeudi : 7 h – 19 h.");
  });

  it("le même instant est ouvert sans la fermeture", () => {
    expect(etatBoutique(SEMAINE, ete("2026-06-10", "10:00"), []).ouvert).toBe(true);
  });

  it("une fermeture sans motif reste lisible", () => {
    const etat = etatBoutique(SEMAINE, ete("2026-06-10", "10:00"), [{ du: "2026-06-10" }]);
    expect(etat.detail).toBe("Fermeture exceptionnelle. Jeudi : 7 h – 19 h.");
  });

  it("prévient la veille : « Fermé demain »", () => {
    const etat = etatBoutique(SEMAINE, ete("2026-06-09", "18:00"), FERIE); // mardi soir
    expect(etat.ouvert).toBe(true);
    expect(etat.detail).toBe("Aujourd'hui : 7 h – 12 h 30 et 15 h – 19 h. Fermé demain (Jour férié).");

    const bientotFerme = etatBoutique(SEMAINE, ete("2026-06-09", "18:30"), FERIE);
    expect(bientotFerme.detail).toBe("La boutique ferme dans 30 min. Fermé demain (Jour férié).");
  });

  it("ne prévient pas pour une fermeture qui n'est pas demain", () => {
    const etat = etatBoutique(SEMAINE, ete("2026-06-08", "10:00"), [{ du: "2026-06-12" }]);
    expect(etat.detail).not.toContain("Fermé demain");
  });

  it("saute le jour férié pour la prochaine ouverture", () => {
    const etat = etatBoutique(SEMAINE, ete("2026-06-09", "20:00"), FERIE); // mardi, après la fermeture
    expect(etat.titre).toBe("Fermé, ouvre jeudi à 7 h");
    expect(etat.detail).toBe("Jeudi : 7 h – 19 h.");
  });

  it("fermeture un jour déjà fermé : toujours cohérent", () => {
    const etat = etatBoutique(SEMAINE, ete("2026-06-08", "10:00"), [{ du: "2026-06-08" }]); // lundi
    expect(etat.titre).toBe("Fermé aujourd'hui, ouvre demain à 7 h");
  });

  describe("période de congés (du mercredi 10 au mardi 16 juin inclus)", () => {
    const CONGES: Fermeture[] = [{ du: "2026-06-10", au: "2026-06-16", motif: "Congés annuels" }];

    it("est fermé pendant toute la période, premier jour et dernier jour compris", () => {
      expect(etatBoutique(SEMAINE, ete("2026-06-10", "10:00"), CONGES).ouvert).toBe(false);
      expect(etatBoutique(SEMAINE, ete("2026-06-13", "10:00"), CONGES).ouvert).toBe(false); // samedi
      expect(etatBoutique(SEMAINE, ete("2026-06-16", "10:00"), CONGES).ouvert).toBe(false); // dernier jour
    });

    it("rouvre le lendemain du dernier jour fermé", () => {
      expect(etatBoutique(SEMAINE, ete("2026-06-17", "10:00"), CONGES).ouvert).toBe(true);
    });

    it("n'affecte pas la veille", () => {
      expect(etatBoutique(SEMAINE, ete("2026-06-09", "10:00"), CONGES).ouvert).toBe(true);
    });

    it("annonce la date de réouverture quand elle est à une semaine ou plus", () => {
      const etat = etatBoutique(SEMAINE, ete("2026-06-10", "10:00"), CONGES);
      expect(etat.titre).toBe("Fermé aujourd'hui, ouvre le mercredi 17 juin à 7 h");
      expect(etat.detail).toBe("Fermeture exceptionnelle (Congés annuels). Mercredi 17 juin : 7 h – 19 h.");
    });
  });

  it("une fermeture passée n'a aucun effet", () => {
    const passee: Fermeture[] = [{ du: "2026-06-01", au: "2026-06-05" }];
    expect(etatBoutique(SEMAINE, ete("2026-06-10", "10:00"), passee).ouvert).toBe(true);
  });

  it("la fermeture suit le jour de Paris, pas minuit UTC", () => {
    // Mercredi 10 juin à 00:30 à Paris = mardi 9 juin 22:30 UTC.
    const instant = new Date("2026-06-09T22:30:00Z");
    expect(etatBoutique(SEMAINE, instant, FERIE).titre).toBe("Fermé aujourd'hui, ouvre demain à 7 h");
    // Et la fermeture du 9 n'est pas appliquée à cet instant, déjà le 10 à Paris.
    const mardi: Fermeture[] = [{ du: "2026-06-09" }];
    expect(etatBoutique(SEMAINE, instant, mardi).titre).toBe("Fermé, ouvre à 7 h");
  });
});

describe("etatBoutique : visiteur dans un autre fuseau horaire", () => {
  const fuseauInitial = process.env.TZ;
  afterEach(() => {
    if (fuseauInitial === undefined) delete process.env.TZ;
    else process.env.TZ = fuseauInitial;
  });

  // Décalage (en minutes, comme getTimezoneOffset) attendu en juin pour chaque fuseau :
  // sert à prouver que le changement de fuseau a bien eu lieu dans le test.
  const fuseaux: [string, number][] = [
    ["UTC", 0],
    ["America/New_York", 240],
    ["America/Los_Angeles", 420],
    ["Asia/Tokyo", -540],
    ["Pacific/Auckland", -720],
    ["Pacific/Kiritimati", -840],
  ];

  describe.each(fuseaux)("navigateur réglé sur %s", (fuseau, decalage) => {
    it("applique le fuseau demandé (garde-fou du test)", () => {
      process.env.TZ = fuseau;
      expect(new Date("2026-06-10T12:00:00Z").getTimezoneOffset()).toBe(decalage);
    });

    it("donne la même réponse qu'à Paris : ouvert mercredi 10 juin à 9 h", () => {
      process.env.TZ = fuseau;
      const etat = etatBoutique(SEMAINE, new Date("2026-06-10T07:00:00Z")); // 9 h à Paris
      expect(etat.ouvert).toBe(true);
      expect(etat.titre).toBe("Ouvert jusqu'à 19 h");
    });

    it("donne la même réponse qu'à Paris : fermé à 0 h 30, jour déjà changé à Paris", () => {
      process.env.TZ = fuseau;
      // 22 h 30 UTC mardi = 0 h 30 mercredi à Paris, mais mardi soir à New York et
      // mercredi 7 h 30 (déjà « ouvert » en heure locale) à Tokyo.
      const etat = etatBoutique(SEMAINE, new Date("2026-06-09T22:30:00Z"));
      expect(etat.ouvert).toBe(false);
      expect(etat.titre).toBe("Fermé, ouvre à 7 h");
    });

    it("lit le jour et l'heure de Paris", () => {
      process.env.TZ = fuseau;
      expect(maintenantAParis(new Date("2026-06-09T22:30:00Z"))).toEqual({
        date: "2026-06-10",
        jour: 2,
        minutes: 30,
      });
    });
  });
});

describe("maintenantAParis", () => {
  it("applique l'heure d'hiver (UTC+1) en janvier", () => {
    expect(maintenantAParis(new Date("2026-01-13T12:00:00Z"))).toEqual({
      date: "2026-01-13",
      jour: 1,
      minutes: 13 * 60,
    });
  });

  it("applique l'heure d'été (UTC+2) en juin", () => {
    expect(maintenantAParis(new Date("2026-06-09T12:00:00Z"))).toEqual({
      date: "2026-06-09",
      jour: 1,
      minutes: 14 * 60,
    });
  });

  it("passe à minuit à Paris, pas à minuit UTC", () => {
    expect(maintenantAParis(new Date("2026-06-09T21:59:00Z"))).toMatchObject({ date: "2026-06-09", minutes: 23 * 60 + 59 });
    expect(maintenantAParis(new Date("2026-06-09T22:00:00Z"))).toMatchObject({ date: "2026-06-10", minutes: 0 });
  });

  it("saute l'heure manquante du passage à l'heure d'été (29 mars 2026)", () => {
    expect(maintenantAParis(new Date("2026-03-29T00:59:00Z")).minutes).toBe(1 * 60 + 59); // 1 h 59
    expect(maintenantAParis(new Date("2026-03-29T01:00:00Z")).minutes).toBe(3 * 60); // 3 h
  });

  it("répète l'heure du passage à l'heure d'hiver (25 octobre 2026)", () => {
    expect(maintenantAParis(new Date("2026-10-25T00:59:00Z")).minutes).toBe(2 * 60 + 59); // 2 h 59
    expect(maintenantAParis(new Date("2026-10-25T01:00:00Z")).minutes).toBe(2 * 60); // 2 h de nouveau
  });

  it("donne lundi = 0 et dimanche = 6", () => {
    expect(maintenantAParis(new Date("2026-06-08T10:00:00Z")).jour).toBe(0);
    expect(maintenantAParis(new Date("2026-06-14T10:00:00Z")).jour).toBe(6);
  });
});

describe("dates", () => {
  it("ajoute des jours en franchissant mois, année et 29 février", () => {
    expect(ajouterJours("2026-06-30", 1)).toBe("2026-07-01");
    expect(ajouterJours("2026-12-31", 1)).toBe("2027-01-01");
    expect(ajouterJours("2028-02-28", 1)).toBe("2028-02-29");
    expect(ajouterJours("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("n'est pas perturbé par le changement d'heure", () => {
    expect(ajouterJours("2026-03-28", 1)).toBe("2026-03-29");
    expect(ajouterJours("2026-03-29", 1)).toBe("2026-03-30");
    expect(ajouterJours("2026-10-24", 2)).toBe("2026-10-26");
  });

  it("donne le jour de la semaine, lundi = 0", () => {
    expect(jourDeLaSemaine("2026-06-08")).toBe(0);
    expect(jourDeLaSemaine("2026-06-14")).toBe(6);
    expect(jourDeLaSemaine("2026-01-01")).toBe(3); // jeudi
  });

  it("valide le format AAAA-MM-JJ et refuse les dates impossibles", () => {
    expect(dateValide("2026-08-15")).toBe(true);
    expect(dateValide("2028-02-29")).toBe(true);
    expect(dateValide("2026-02-29")).toBe(false);
    expect(dateValide("2026-02-30")).toBe(false);
    expect(dateValide("2026-13-01")).toBe(false);
    expect(dateValide("2026-8-1")).toBe(false);
    expect(dateValide("15/08/2026")).toBe(false);
    expect(dateValide("")).toBe(false);
  });
});

describe("fermetures", () => {
  const liste: Fermeture[] = [
    { du: "2026-08-01", au: "2026-08-15", motif: "Congés annuels" },
    { du: "2026-06-10", motif: "Jour férié" },
    { du: "2026-05-01", motif: "Fête du travail" },
  ];

  it("fermetureDuJour : bornes comprises, un jour seul ou une période", () => {
    expect(fermetureDuJour(liste, "2026-06-10")?.motif).toBe("Jour férié");
    expect(fermetureDuJour(liste, "2026-06-09")).toBeUndefined();
    expect(fermetureDuJour(liste, "2026-06-11")).toBeUndefined();
    expect(fermetureDuJour(liste, "2026-07-31")).toBeUndefined();
    expect(fermetureDuJour(liste, "2026-08-01")?.motif).toBe("Congés annuels");
    expect(fermetureDuJour(liste, "2026-08-09")?.motif).toBe("Congés annuels");
    expect(fermetureDuJour(liste, "2026-08-15")?.motif).toBe("Congés annuels");
    expect(fermetureDuJour(liste, "2026-08-16")).toBeUndefined();
  });

  it("fermetureDuJour : liste vide", () => {
    expect(fermetureDuJour([], "2026-06-10")).toBeUndefined();
  });

  it("fermeturesAVenir : écarte les fermetures passées, garde celle en cours, trie par date", () => {
    expect(fermeturesAVenir(liste, "2026-06-10").map((f) => f.du)).toEqual(["2026-06-10", "2026-08-01"]);
    expect(fermeturesAVenir(liste, "2026-08-10").map((f) => f.du)).toEqual(["2026-08-01"]);
    expect(fermeturesAVenir(liste, "2026-08-16")).toEqual([]);
    expect(fermeturesAVenir(liste, "2026-01-01").map((f) => f.du)).toEqual([
      "2026-05-01",
      "2026-06-10",
      "2026-08-01",
    ]);
  });

  it("fermeturesAVenir : ne modifie pas la liste d'origine", () => {
    const copie = structuredClone(liste);
    fermeturesAVenir(liste, "2026-01-01");
    expect(liste).toEqual(copie);
  });

  it("semaineAVenir : chaque jour reçoit sa prochaine date, aujourd'hui compris", () => {
    // Jeudi 11 juin : lundi = 15, mardi = 16, mercredi = 17, jeudi = 11 (aujourd'hui) …
    const lignes = semaineAVenir(SEMAINE, [], "2026-06-11");
    expect(lignes.map((l) => l.date)).toEqual([
      "2026-06-15",
      "2026-06-16",
      "2026-06-17",
      "2026-06-11",
      "2026-06-12",
      "2026-06-13",
      "2026-06-14",
    ]);
  });

  it("semaineAVenir : une fermeture dans les 7 jours marque le bon jour seulement", () => {
    const lignes = semaineAVenir(SEMAINE, [{ du: "2026-06-13", motif: "Jour férié" }], "2026-06-11");
    expect(lignes.map((l) => l.fermeture?.motif)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "Jour férié", // samedi 13
      undefined,
    ]);
  });

  it("semaineAVenir : une fermeture au-delà de 7 jours ne touche pas le tableau", () => {
    const lignes = semaineAVenir(SEMAINE, [{ du: "2026-06-18" }], "2026-06-11"); // jeudi suivant
    expect(lignes.every((l) => l.fermeture === undefined)).toBe(true);
  });

  it("semaineAVenir : une fermeture d'hier ne marque pas le même jour de la semaine prochaine", () => {
    const lignes = semaineAVenir(SEMAINE, [{ du: "2026-06-10" }], "2026-06-11"); // hier = mercredi 10
    expect(lignes[2].date).toBe("2026-06-17");
    expect(lignes[2].fermeture).toBeUndefined();
  });

  it("formaterPeriode : un jour, une période dans le mois, à cheval sur deux mois", () => {
    const auj = "2026-06-10";
    expect(formaterPeriode({ du: "2026-08-15" }, auj)).toBe("Le samedi 15 août");
    expect(formaterPeriode({ du: "2026-08-01" }, auj)).toBe("Le samedi 1er août");
    expect(formaterPeriode({ du: "2026-08-01", au: "2026-08-15" }, auj)).toBe("Du 1er au 15 août");
    expect(formaterPeriode({ du: "2026-07-28", au: "2026-08-15" }, auj)).toBe("Du 28 juillet au 15 août");
    expect(formaterPeriode({ du: "2026-08-15", au: "2026-08-15" }, auj)).toBe("Le samedi 15 août");
  });

  it("formaterPeriode : ajoute l'année seulement si ce n'est pas l'année en cours", () => {
    expect(formaterPeriode({ du: "2027-01-01" }, "2026-12-20")).toBe("Le vendredi 1er janvier 2027");
    expect(formaterPeriode({ du: "2026-12-24", au: "2027-01-03" }, "2026-12-20")).toBe(
      "Du 24 décembre au 3 janvier 2027",
    );
  });
});

describe("formats", () => {
  it("formaterHeure", () => {
    expect(formaterHeure("06:30")).toBe("6 h 30");
    expect(formaterHeure("19:00")).toBe("19 h");
    expect(formaterHeure("07:05")).toBe("7 h 05");
  });

  it("formaterPlages", () => {
    expect(formaterPlages([])).toBe("Fermé");
    expect(formaterPlages([["07:00", "19:00"]])).toBe("7 h – 19 h");
    expect(
      formaterPlages([
        ["07:00", "12:30"],
        ["15:00", "19:00"],
      ]),
    ).toBe("7 h – 12 h 30 et 15 h – 19 h");
  });

  it("resumerHoraires : regroupe les jours consécutifs aux mêmes horaires", () => {
    expect(resumerHoraires(SEMAINE)).toEqual([
      { jours: "Lundi", heures: "Fermé" },
      { jours: "Mardi", heures: "7 h – 12 h 30 et 15 h – 19 h" },
      { jours: "Mercredi au samedi", heures: "7 h – 19 h" },
      { jours: "Dimanche", heures: "8 h – 13 h" },
    ]);
  });

  it("resumerHoraires : « Tous les jours » quand les 7 jours sont identiques", () => {
    const semaine = SEMAINE.map(({ nom }): Jour => ({ nom, plages: [["05:00", "22:00"]] }));
    expect(resumerHoraires(semaine)).toEqual([{ jours: "Tous les jours", heures: "5 h – 22 h" }]);
    expect(resumerHoraires([])).toEqual([]);
  });

  it("formaterPrix : euros à la française", () => {
    expect(formaterPrix(1.3).replace(/\s/g, " ")).toBe("1,30 €");
    expect(formaterPrix(24).replace(/\s/g, " ")).toBe("24,00 €");
  });

  it("lienTelephone : garde chiffres et +", () => {
    expect(lienTelephone("01 23 45 67 89")).toBe("tel:0123456789");
    expect(lienTelephone("+33 1 23 45 67 89")).toBe("tel:+33123456789");
  });
});
