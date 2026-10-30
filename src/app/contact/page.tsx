import type { Metadata } from "next";
import Coordonnees from "@/components/Coordonnees";
import EtatBoutique from "@/components/EtatBoutique";
import FormulaireCommande from "@/components/FormulaireCommande";
import TableauHoraires from "@/components/TableauHoraires";
import { boulangerie, commande } from "@/content/site";
import { commandeDisponible } from "@/lib/commande";
import { lienTelephone } from "@/lib/horaires";

export const metadata: Metadata = {
  title: "Horaires",
  description: "Horaires d'ouverture, adresse et téléphone de la boulangerie.",
};

export default function Contact() {
  const formulaire = commandeDisponible();
  // Visible dans les journaux de déploiement : évite de chercher pourquoi le formulaire est absent.
  if (boulangerie.email && !formulaire) {
    console.warn("[commande] formulaire masqué : définir RESEND_API_KEY et COMMANDE_EXPEDITEUR (voir le README)");
  }

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

      {(commande.texte || formulaire) && (
        <section className="bloc bloc-papier" id="commande" aria-labelledby="titre-commande">
          <div className={`bloc-contenu ${formulaire ? "deux-colonnes" : "etroit"}`}>
            <div>
              <h2 id="titre-commande">{commande.titre}</h2>
              {commande.texte && <p>{commande.texte}</p>}
              {formulaire && boulangerie.telephone && (
                <p>
                  Vous pouvez aussi appeler la boutique :{" "}
                  <a href={lienTelephone(boulangerie.telephone)}>{boulangerie.telephone}</a>
                </p>
              )}
            </div>
            {formulaire && <FormulaireCommande />}
          </div>
        </section>
      )}
    </>
  );
}
