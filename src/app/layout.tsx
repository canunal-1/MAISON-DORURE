import type { Metadata } from "next";
import "@fontsource/gloock/latin-400.css";
import "@fontsource-variable/hanken-grotesk/wght.css";
import "./globals.css";
import DonneesStructurees from "@/components/DonneesStructurees";
import Navigation from "@/components/Navigation";
import Pied from "@/components/Pied";
import { boulangerie } from "@/content/site";
import { descriptionSite, urlDuSite } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(urlDuSite()),
  title: {
    default: boulangerie.nom,
    template: `%s | ${boulangerie.nom}`,
  },
  description: descriptionSite(),
  // « ./ » : l'adresse canonique de chaque page est celle de la page elle-même.
  alternates: { canonical: "./" },
  openGraph: { type: "website", locale: "fr_FR", siteName: boulangerie.nom },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <body>
        <a className="aller-au-contenu" href="#contenu">
          Aller au contenu
        </a>
        <Navigation />
        <main id="contenu">{children}</main>
        <Pied />
        <DonneesStructurees />
      </body>
    </html>
  );
}
