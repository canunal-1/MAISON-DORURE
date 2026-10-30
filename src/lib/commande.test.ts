import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Fermeture, Jour } from "@/content/site";
import { boulangerie, commande } from "@/content/site";
import {
  commandeDisponible,
  composerEmail,
  lireFormulaire,
  traiterCommande,
  validerCommande,
  type Contexte,
} from "./commande";
import { VIDE } from "./commande-types";
import { creerLimiteur } from "./limiteur";

/** Semaine fictive : lundi fermé, les autres jours ouverts (mardi avec coupure du midi). */
const SEMAINE: Jour[] = [
  { nom: "Lundi", plages: [] },
  { nom: "Mardi", plages: [["07:00", "12:30"], ["15:00", "19:00"]] },
  { nom: "Mercredi", plages: [["07:00", "19:00"]] },
  { nom: "Jeudi", plages: [["07:00", "19:00"]] },
  { nom: "Vendredi", plages: [["07:00", "19:00"]] },
  { nom: "Samedi", plages: [["07:00", "19:00"]] },
  { nom: "Dimanche", plages: [["08:00", "13:00"]] },
];

// Mercredi 10 juin 2026, 10 h à Paris (heure d'été).
const MAINTENANT = new Date("2026-06-10T10:00:00+02:00");
const CTX: Contexte = { aujourdhui: "2026-06-10", horaires: SEMAINE, fermetures: [], delaiJours: 0 };
const VALIDE = { nom: "Camille Test", telephone: "06 12 34 56 78", date: "2026-06-12", demande: "Un gâteau pour six personnes." };

describe("validerCommande", () => {
  it("accepte une demande complète", () => {
    expect(validerCommande(VALIDE, CTX)).toEqual({});
  });

  it("refuse un nom vide, trop court ou trop long", () => {
    expect(validerCommande({ ...VALIDE, nom: "" }, CTX).nom).toBe("Indiquez votre nom.");
    expect(validerCommande({ ...VALIDE, nom: "A" }, CTX).nom).toBe("Indiquez votre nom.");
    expect(validerCommande({ ...VALIDE, nom: "A".repeat(101) }, CTX).nom).toContain("trop long");
    expect(validerCommande({ ...VALIDE, nom: "A".repeat(100) }, CTX).nom).toBeUndefined();
  });

  it("vérifie le téléphone", () => {
    for (const bon of ["01 23 45 67 89", "0123456789", "+33 6 12 34 56 78", "06.12.34.56.78", "(01) 23-45-67-89"]) {
      expect(validerCommande({ ...VALIDE, telephone: bon }, CTX).telephone, bon).toBeUndefined();
    }
    expect(validerCommande({ ...VALIDE, telephone: "" }, CTX).telephone).toContain("Indiquez");
    for (const mauvais of ["abc", "123", "06 12 34 5x 78", "0".repeat(16), "06 12 34 56 78 poste 4"]) {
      expect(validerCommande({ ...VALIDE, telephone: mauvais }, CTX).telephone, mauvais).toContain("pas valide");
    }
  });

  describe("date de retrait", () => {
    it("exige une date existante", () => {
      expect(validerCommande({ ...VALIDE, date: "" }, CTX).date).toBe("Choisissez une date de retrait.");
      for (const mauvaise of ["2026-02-30", "12/06/2026", "demain", "2026-6-12"]) {
        expect(validerCommande({ ...VALIDE, date: mauvaise }, CTX).date, mauvaise).toBe("Cette date n'est pas valide.");
      }
    });

    it("refuse le passé et accepte aujourd'hui sans délai", () => {
      expect(validerCommande({ ...VALIDE, date: "2026-06-09" }, CTX).date).toBe("Cette date est déjà passée.");
      expect(validerCommande({ ...VALIDE, date: "2026-06-10" }, CTX).date).toBeUndefined();
    });

    it("applique le délai minimum de la boutique", () => {
      const avecDelai = { ...CTX, delaiJours: 2 };
      const erreur = validerCommande({ ...VALIDE, date: "2026-06-11" }, avecDelai).date;
      expect(erreur).toBe("Choisissez une date à partir du vendredi 12 juin : la boutique demande 2 jours de délai.");
      expect(validerCommande({ ...VALIDE, date: "2026-06-12" }, avecDelai).date).toBeUndefined();
      expect(validerCommande({ ...VALIDE, date: "2026-06-11" }, { ...CTX, delaiJours: 1 }).date).toBeUndefined();
      expect(validerCommande({ ...VALIDE, date: "2026-06-10" }, { ...CTX, delaiJours: 1 }).date).toContain("1 jour de délai");
    });

    it("refuse une date à plus d'un an", () => {
      expect(validerCommande({ ...VALIDE, date: "2027-06-10" }, CTX).date).toBeUndefined();
      expect(validerCommande({ ...VALIDE, date: "2027-06-11" }, CTX).date).toBe("Cette date est trop éloignée.");
    });

    it("refuse un jour de fermeture exceptionnelle, avec son motif", () => {
      const fermetures: Fermeture[] = [{ du: "2026-06-12", motif: "Jour férié" }];
      expect(validerCommande({ ...VALIDE, date: "2026-06-12" }, { ...CTX, fermetures }).date).toBe(
        "La boutique est fermée le vendredi 12 juin (Jour férié). Choisissez un autre jour.",
      );
      expect(validerCommande({ ...VALIDE, date: "2026-06-12" }, { ...CTX, fermetures: [{ du: "2026-06-12" }] }).date).toBe(
        "La boutique est fermée le vendredi 12 juin. Choisissez un autre jour.",
      );
    });

    it("refuse une date dans une période de congés, bornes comprises", () => {
      const fermetures: Fermeture[] = [{ du: "2026-06-12", au: "2026-06-14" }];
      for (const date of ["2026-06-12", "2026-06-13", "2026-06-14"]) {
        expect(validerCommande({ ...VALIDE, date }, { ...CTX, fermetures }).date, date).toContain("fermée");
      }
      expect(validerCommande({ ...VALIDE, date: "2026-06-16" }, { ...CTX, fermetures }).date).toBeUndefined();
    });

    it("refuse le jour de fermeture hebdomadaire", () => {
      expect(validerCommande({ ...VALIDE, date: "2026-06-15" }, CTX).date).toBe(
        "La boutique est fermée le lundi. Choisissez un autre jour.",
      );
    });

    it("sans horaires connus, ne devine aucun jour de fermeture", () => {
      expect(validerCommande({ ...VALIDE, date: "2026-06-15" }, { ...CTX, horaires: [] }).date).toBeUndefined();
    });
  });

  it("vérifie la demande", () => {
    expect(validerCommande({ ...VALIDE, demande: "" }, CTX).demande).toContain("Décrivez");
    expect(validerCommande({ ...VALIDE, demande: "ok" }, CTX).demande).toContain("Décrivez");
    expect(validerCommande({ ...VALIDE, demande: "x".repeat(1500) }, CTX).demande).toBeUndefined();
    expect(validerCommande({ ...VALIDE, demande: "x".repeat(1501) }, CTX).demande).toContain("trop longue");
  });

  it("signale toutes les erreurs d'un coup", () => {
    expect(Object.keys(validerCommande(VIDE, CTX)).sort()).toEqual(["date", "demande", "nom", "telephone"]);
  });

  it("n'emploie jamais le tutoiement dans ses messages", () => {
    const messages = Object.values(validerCommande({ ...VIDE, date: "2026-02-30" }, { ...CTX, delaiJours: 2 }));
    for (const m of messages) expect(m).not.toMatch(/\b(tu|ton|ta|tes|toi|choisis|indique|décris)\b/i);
  });
});

describe("lireFormulaire", () => {
  const formulaire = (champs: Record<string, string>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(champs)) f.set(k, v);
    return f;
  };

  it("nettoie les espaces et les caractères de contrôle, garde les retours à la ligne de la demande", () => {
    const lu = lireFormulaire(
      formulaire({ nom: "  Camille \u0000  Test\t", telephone: " 06 12 \n34 56 78 ", date: " 2026-06-12 ", demande: "Ligne 1\r\n\u0007Ligne 2\r\n\r\nLigne 3  " }),
    );
    expect(lu).toEqual({ nom: "Camille Test", telephone: "06 12 34 56 78", date: "2026-06-12", demande: "Ligne 1\nLigne 2\n\nLigne 3" });
  });

  it("ignore un champ absent ou un fichier", () => {
    const f = new FormData();
    f.set("nom", new File(["x"], "x.txt"));
    expect(lireFormulaire(f)).toEqual(VIDE);
  });
});

describe("composerEmail", () => {
  it("contient toutes les informations et le rappel « pas confirmée »", () => {
    const { sujet, texte } = composerEmail(VALIDE, SEMAINE, "Boulangerie Test");
    expect(sujet).toBe("Demande de commande de Camille Test pour le 12 juin");
    expect(texte).toContain("Nom : Camille Test");
    expect(texte).toContain("Téléphone : 06 12 34 56 78");
    expect(texte).toContain("Retrait souhaité : vendredi 12 juin (ouverture ce jour-là : 7 h – 19 h)");
    expect(texte).toContain("Demande :\nUn gâteau pour six personnes.");
    expect(texte).toContain("Ce n'est pas une commande confirmée");
  });

  it("sans horaires connus, n'invente pas d'heures d'ouverture", () => {
    expect(composerEmail(VALIDE, [], "Boulangerie Test").texte).toContain("Retrait souhaité : vendredi 12 juin\n");
  });
});

describe("commandeDisponible", () => {
  const env = { RESEND_API_KEY: "cle", COMMANDE_EXPEDITEUR: "Test <a@b.fr>" };
  it("exige l'e-mail de la boutique ET la configuration d'envoi", () => {
    expect(commandeDisponible(env, "contact@exemple.fr")).toBe(true);
    expect(commandeDisponible(env, "")).toBe(false);
    expect(commandeDisponible({ ...env, RESEND_API_KEY: undefined }, "contact@exemple.fr")).toBe(false);
    expect(commandeDisponible({ ...env, COMMANDE_EXPEDITEUR: "" }, "contact@exemple.fr")).toBe(false);
  });
});

describe("traiterCommande", () => {
  const CLE = "re_cle_secrete_de_test";
  const ENV = { RESEND_API_KEY: CLE, COMMANDE_EXPEDITEUR: "Boulangerie Test <commandes@exemple.fr>" };
  const BOUTIQUE = { ...boulangerie, nom: "Boulangerie Test", email: "contact@exemple.fr", telephone: "01 23 45 67 89" };
  const MERCI = "Merci de test.";

  let fetchFn: ReturnType<typeof vi.fn>;
  let erreurs: ReturnType<typeof vi.spyOn>;
  const formulaire = (champs: Record<string, string> = VALIDE) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(champs)) f.set(k, v);
    return f;
  };
  const dep = (autres: Record<string, unknown> = {}) => ({
    env: ENV,
    fetchFn: fetchFn as unknown as typeof fetch,
    maintenant: MAINTENANT,
    boulangerie: BOUTIQUE,
    horaires: SEMAINE,
    fermetures: [],
    commande: { ...commande, merci: MERCI, delaiJours: 0 },
    limiteurs: { parVisiteur: creerLimiteur({ max: 100, fenetreMs: 1000 }), global: creerLimiteur({ max: 100, fenetreMs: 1000 }) },
    ...autres,
  });

  beforeEach(() => {
    fetchFn = vi.fn(async () => new Response('{"id":"abc"}', { status: 200 }));
    erreurs = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("envoie l'e-mail à la boutique et confirme", async () => {
    const etat = await traiterCommande(formulaire(), dep());

    expect(etat).toEqual({ statut: "envoye", erreurs: {}, valeurs: VIDE, message: MERCI });
    expect(fetchFn).toHaveBeenCalledOnce();
    const [url, options] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options.method).toBe("POST");
    expect((options.headers as Record<string, string>).Authorization).toBe(`Bearer ${CLE}`);
    const corps = JSON.parse(options.body as string);
    expect(corps.from).toBe(ENV.COMMANDE_EXPEDITEUR);
    expect(corps.to).toEqual(["contact@exemple.fr"]);
    expect(corps.subject).toBe("Demande de commande de Camille Test pour le 12 juin");
    expect(corps.text).toContain("Un gâteau pour six personnes.");
    expect(corps.html).toBeUndefined(); // texte seul : rien n'est interprété comme du HTML
  });

  it("peut viser une autre adresse d'API (tests)", async () => {
    await traiterCommande(formulaire(), dep({ env: { ...ENV, RESEND_API_URL: "http://localhost:4010/emails" } }));
    expect(fetchFn.mock.calls[0][0]).toBe("http://localhost:4010/emails");
  });

  it("ne rien envoyer et garder la saisie quand le formulaire est invalide", async () => {
    const etat = await traiterCommande(formulaire({ ...VALIDE, nom: "", date: "2026-06-15" }), dep());
    expect(etat.statut).toBe("erreur");
    expect(Object.keys(etat.erreurs).sort()).toEqual(["date", "nom"]);
    expect(etat.valeurs).toEqual({ ...VALIDE, nom: "", date: "2026-06-15" });
    expect(etat.message).toContain("corrigez");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("répond « envoyé » à un robot (champ piège rempli) sans rien envoyer", async () => {
    const etat = await traiterCommande(formulaire({ ...VALIDE, site_web: "http://spam.example" }), dep());
    expect(etat.statut).toBe("envoye");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("un champ piège vide ne bloque pas un vrai visiteur", async () => {
    const etat = await traiterCommande(formulaire({ ...VALIDE, site_web: "  " }), dep());
    expect(etat.statut).toBe("envoye");
    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it("indique que l'envoi est indisponible s'il n'est pas configuré, avec le téléphone de la boutique", async () => {
    for (const env of [{}, { RESEND_API_KEY: CLE }, { COMMANDE_EXPEDITEUR: "x" }]) {
      const etat = await traiterCommande(formulaire(), dep({ env }));
      expect(etat.statut).toBe("erreur");
      expect(etat.message).toBe("L'envoi des demandes est momentanément indisponible. Vous pouvez aussi appeler la boutique au 01 23 45 67 89.");
      expect(etat.valeurs.nom).toBe("Camille Test");
    }
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("sans téléphone connu, n'invite pas à appeler", async () => {
    const etat = await traiterCommande(formulaire(), dep({ env: {}, boulangerie: { ...BOUTIQUE, telephone: "" } }));
    expect(etat.message).toBe("L'envoi des demandes est momentanément indisponible.");
  });

  it("garde la saisie quand le service d'envoi refuse", async () => {
    fetchFn.mockResolvedValue(new Response('{"message":"invalid"}', { status: 500 }));
    const etat = await traiterCommande(formulaire(), dep());
    expect(etat.statut).toBe("erreur");
    expect(etat.message).toContain("n'a pas pu être envoyée");
    expect(etat.valeurs).toEqual(VALIDE);
  });

  it("garde la saisie quand le service est injoignable", async () => {
    fetchFn.mockRejectedValue(new TypeError("fetch failed"));
    const etat = await traiterCommande(formulaire(), dep());
    expect(etat.statut).toBe("erreur");
    expect(etat.valeurs).toEqual(VALIDE);
  });

  it("limite le débit par visiteur puis en tout", async () => {
    const parVisiteur = creerLimiteur({ max: 2, fenetreMs: 60_000 });
    const global = creerLimiteur({ max: 3, fenetreMs: 60_000 });
    const essai = (visiteur: string) => traiterCommande(formulaire(), dep({ visiteur, limiteurs: { parVisiteur, global } }));

    expect((await essai("a")).statut).toBe("envoye");
    expect((await essai("a")).statut).toBe("envoye");
    const refus = await essai("a");
    expect(refus.statut).toBe("erreur");
    expect(refus.message).toContain("Trop de demandes");
    expect((await essai("b")).statut).toBe("envoye"); // un autre visiteur passe : 3e envoi global
    expect((await essai("c")).statut).toBe("erreur"); // plafond global atteint
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it("une saisie invalide ne consomme pas la limite", async () => {
    const parVisiteur = creerLimiteur({ max: 1, fenetreMs: 60_000 });
    const global = creerLimiteur({ max: 10, fenetreMs: 60_000 });
    await traiterCommande(formulaire({ ...VALIDE, nom: "" }), dep({ limiteurs: { parVisiteur, global } }));
    expect((await traiterCommande(formulaire(), dep({ limiteurs: { parVisiteur, global } }))).statut).toBe("envoye");
  });

  it("n'écrit jamais la clé ni les données du client dans les journaux ni dans la réponse", async () => {
    fetchFn.mockResolvedValue(new Response(`{"message":"clé ${CLE} refusée pour 06 12 34 56 78"}`, { status: 401 }));
    const etat = await traiterCommande(formulaire(), dep());
    const journal = JSON.stringify(erreurs.mock.calls);
    expect(journal).not.toContain(CLE);
    expect(journal).not.toContain("06 12 34 56 78");
    expect(journal).not.toContain("Camille");
    expect(JSON.stringify(etat)).not.toContain(CLE);
  });

  it("neutralise une tentative d'injection d'en-têtes dans le nom", async () => {
    await traiterCommande(formulaire({ ...VALIDE, nom: "Camille\r\nBcc: pirate@exemple.fr" }), dep());
    const corps = JSON.parse((fetchFn.mock.calls[0][1] as RequestInit).body as string);
    expect(corps.subject).not.toMatch(/[\r\n]/);
    expect(corps.to).toEqual(["contact@exemple.fr"]);
    expect(Object.keys(corps).sort()).toEqual(["from", "subject", "text", "to"]);
  });
});
