"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { boulangerie } from "@/content/site";
import Embleme from "./Embleme";

const liens = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "La carte" },
  { href: "/la-maison", label: "La maison" },
  { href: "/contact", label: "Horaires" },
];

/**
 * En-tête du site. Sur petit écran, les liens se replient derrière un bouton « Menu »
 * (sans JavaScript, ils restent affichés : voir `scripting: none` dans globals.css).
 */
export default function Navigation() {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const bouton = useRef<HTMLButtonElement>(null);

  // Échap referme le menu et rend le focus au bouton.
  useEffect(() => {
    if (!ouvert) return;
    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key !== "Escape") return;
      setOuvert(false);
      bouton.current?.focus();
    };
    document.addEventListener("keydown", surTouche);
    return () => document.removeEventListener("keydown", surTouche);
  }, [ouvert]);

  return (
    <header className={`entete ${ouvert ? "menu-ouvert" : ""}`.trim()}>
      <div className="entete-contenu">
        <Link href="/" className="marque" aria-label={`${boulangerie.nom}, accueil`}>
          <Embleme />
          <span>{boulangerie.nomCourt}</span>
        </Link>
        <button
          ref={bouton}
          type="button"
          className="menu-bouton"
          aria-expanded={ouvert}
          aria-controls="menu-principal"
          onClick={() => setOuvert((valeur) => !valeur)}
        >
          <span className="menu-bouton-icone" aria-hidden="true" />
          <span className="menu-bouton-texte">Menu</span>
        </button>
        <nav aria-label="Navigation principale" id="menu-principal" className="menu-panneau">
          <ul className="menu">
            {liens.map((lien) => (
              <li key={lien.href}>
                <Link
                  href={lien.href}
                  aria-current={chemin === lien.href ? "page" : undefined}
                  onNavigate={() => setOuvert(false)}
                >
                  {lien.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
