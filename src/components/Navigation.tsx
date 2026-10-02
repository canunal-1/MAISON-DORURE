"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { boulangerie } from "@/content/site";
import Embleme from "./Embleme";

const liens = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "La carte" },
  { href: "/la-maison", label: "La maison" },
  { href: "/contact", label: "Horaires" },
];

export default function Navigation() {
  const chemin = usePathname();

  return (
    <header className="entete">
      <div className="entete-contenu">
        <Link href="/" className="marque" aria-label={`${boulangerie.nom}, accueil`}>
          <Embleme />
          <span>{boulangerie.nomCourt}</span>
        </Link>
        <nav aria-label="Navigation principale">
          <ul className="menu">
            {liens.map((lien) => (
              <li key={lien.href}>
                <Link href={lien.href} aria-current={chemin === lien.href ? "page" : undefined}>
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
