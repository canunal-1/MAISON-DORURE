import type { Metadata } from "next";
import "@fontsource/gloock/latin-400.css";
import "@fontsource-variable/hanken-grotesk/wght.css";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Pied from "@/components/Pied";
import { boulangerie } from "@/content/site";

export const metadata: Metadata = {
  title: {
    default: boulangerie.nom,
    template: `%s | ${boulangerie.nom}`,
  },
  description: boulangerie.accroche,
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
      </body>
    </html>
  );
}
