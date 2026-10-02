import { describe, expect, it } from "vitest";
import { creerLimiteur } from "./limiteur";

describe("creerLimiteur", () => {
  it("autorise jusqu'au maximum puis refuse", () => {
    const l = creerLimiteur({ max: 3, fenetreMs: 1000 });
    expect([1, 2, 3, 4].map(() => l.autoriser("a", 0))).toEqual([true, true, true, false]);
  });

  it("autorise de nouveau quand la fenêtre est écoulée", () => {
    const l = creerLimiteur({ max: 1, fenetreMs: 1000 });
    expect(l.autoriser("a", 0)).toBe(true);
    expect(l.autoriser("a", 999)).toBe(false);
    expect(l.autoriser("a", 1000)).toBe(true);
  });

  it("un refus ne repousse pas la fin de la fenêtre", () => {
    const l = creerLimiteur({ max: 1, fenetreMs: 1000 });
    l.autoriser("a", 0);
    l.autoriser("a", 900); // refusé
    expect(l.autoriser("a", 1000)).toBe(true);
  });

  it("compte chaque clé séparément", () => {
    const l = creerLimiteur({ max: 1, fenetreMs: 1000 });
    expect(l.autoriser("a", 0)).toBe(true);
    expect(l.autoriser("b", 0)).toBe(true);
    expect(l.autoriser("a", 1)).toBe(false);
  });

  it("garde une mémoire bornée même avec des milliers de clés différentes", () => {
    const l = creerLimiteur({ max: 1, fenetreMs: 1000 });
    for (let i = 0; i < 3000; i++) l.autoriser(`ip-${i}`, 0);
    // Une fois la fenêtre passée, le ménage a lieu et tout repasse.
    expect(l.autoriser("ip-0", 5000)).toBe(true);
    expect(l.autoriser("ip-2999", 5000)).toBe(true);
  });
});
