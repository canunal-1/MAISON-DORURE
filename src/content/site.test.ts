import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ALLERGENES, boulangerie, carte, fermetures, horaires, mentionsLegales, photos } from "./site";
import { dateValide } from "@/lib/horaires";

/**
 * Garde-fous sur le contenu réel : une faute de frappe dans site.ts (heure, date,
 * doublon…) fait échouer `npm test` au lieu de casser le site en silence.
 */

const HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;
const enMinutes = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));

describe("horaires", () => {
  it("sont vides (pas encore connus) ou couvrent les 7 jours, du lundi au dimanche", () => {
    if (horaires.length === 0) return;
    expect(horaires.map((j) => j.nom)).toEqual([
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dimanche",
    ]);
  });

  it("ont des heures « HH:MM » valides, ouverture avant fermeture, sans chevauchement", () => {
    for (const jour of horaires) {
      let precedente = -1;
      for (const [ouverture, fermeture] of jour.plages) {
        expect(ouverture, `${jour.nom} : ouverture`).toMatch(HEURE);
        expect(fermeture, `${jour.nom} : fermeture`).toMatch(HEURE);
        expect(enMinutes(ouverture), `${jour.nom} : ouvre avant de fermer`).toBeLessThan(enMinutes(fermeture));
        expect(enMinutes(ouverture), `${jour.nom} : plages dans l'ordre`).toBeGreaterThan(precedente);
        precedente = enMinutes(fermeture);
      }
    }
  });
});

describe("fermetures", () => {
  it("ont des dates AAAA-MM-JJ existantes", () => {
    for (const { du, au } of fermetures) {
      expect(dateValide(du), `date « ${du} »`).toBe(true);
      if (au !== undefined) expect(dateValide(au), `date « ${au} »`).toBe(true);
    }
  });

  it("finissent le jour même ou après leur début", () => {
    for (const { du, au } of fermetures) {
      if (au !== undefined) expect(au >= du, `${du} → ${au}`).toBe(true);
    }
  });
});

describe("carte", () => {
  it("a des identifiants de catégorie uniques, sans espace ni accent (ancres de la page)", () => {
    const ids = carte.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it("n'a pas deux produits du même nom dans une catégorie, ni de prix négatif", () => {
    for (const categorie of carte) {
      const noms = categorie.produits.map((p) => p.nom);
      expect(new Set(noms).size, `doublon dans « ${categorie.titre} »`).toBe(noms.length);
      for (const produit of categorie.produits) {
        expect(produit.nom.trim(), "nom de produit vide").not.toBe("");
        expect(produit.prix, `prix de « ${produit.nom} »`).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe("allergènes", () => {
  it("sont tous dans la liste officielle, sans doublon par produit", () => {
    for (const categorie of carte) {
      for (const produit of categorie.produits) {
        const liste = produit.allergenes ?? [];
        expect(new Set(liste).size, `doublon pour « ${produit.nom} »`).toBe(liste.length);
        for (const allergene of liste) {
          expect(ALLERGENES as readonly string[], `« ${allergene} » (${produit.nom})`).toContain(allergene);
        }
      }
    }
  });

  it("la liste officielle compte bien 14 allergènes", () => {
    expect(ALLERGENES).toHaveLength(14);
  });
});

describe("coordonnées et mentions légales", () => {
  it("le SIRET, s'il est renseigné, fait 14 chiffres", () => {
    if (mentionsLegales.siret) expect(mentionsLegales.siret.replace(/\s/g, "")).toMatch(/^\d{14}$/);
  });

  it("l'adresse du site, si elle est renseignée, commence par https://", () => {
    if (boulangerie.siteUrl) expect(boulangerie.siteUrl).toMatch(/^https:\/\//);
  });

  it("l'e-mail, s'il est renseigné, a un format plausible", () => {
    if (boulangerie.email) expect(boulangerie.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});

describe("photos", () => {
  const toutes = [
    ...Object.entries(photos).map(([emplacement, photo]) => ({ emplacement, photo })),
    ...carte.flatMap((c) => c.produits.map((p) => ({ emplacement: p.nom, photo: p.photo }))),
  ].flatMap(({ emplacement, photo }) => (photo ? [{ emplacement, photo }] : []));

  it("pointent vers un fichier qui existe dans public/photos/", () => {
    for (const { emplacement, photo } of toutes) {
      expect(photo.src, `${emplacement} : chemin`).toMatch(/^\/photos\/[\w.-]+\.(jpe?g|png|webp|avif)$/i);
      expect(existsSync(join(process.cwd(), "public", photo.src)), `${emplacement} : ${photo.src} introuvable`).toBe(true);
    }
  });

  it("ont une description (alt) non vide", () => {
    for (const { emplacement, photo } of toutes) {
      expect(photo.alt.trim(), `${emplacement} : alt manquant`).not.toBe("");
    }
  });
});
