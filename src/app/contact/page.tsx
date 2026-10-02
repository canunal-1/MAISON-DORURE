import type { Metadata } from "next";
import Coordonnees from "@/components/Coordonnees";
import EtatBoutique from "@/components/EtatBoutique";
import TableauHoraires from "@/components/TableauHoraires";
import { commande } from "@/content/site";

export const metadata: Metadata = {
  title: "Horaires",
  description: "Horaires d'ouverture, adresse et téléphone de la boulangerie.",
};

export default function Contact() {
  return (
    <>
      <section className="bandeau">
        <div className="bandeau-contenu">
          <h1>Horaires et accès</h1>
          <EtatBoutique />
        </div>
      </section>

      <section className="bloc">
        <div className="bloc-contenu deux-colonnes">
          <div>
            <h2>Nous trouver</h2>
            <Coordonnees />
          </div>
          <div>
            <h2>Horaires</h2>
            <TableauHoraires />
          </div>
        </div>
      </section>

      <section className="bloc bloc-papier" aria-labelledby="titre-commande">
        <div className="bloc-contenu etroit">
          <h2 id="titre-commande">{commande.titre}</h2>
          <p>{commande.texte}</p>
        </div>
      </section>
    </>
  );
}
