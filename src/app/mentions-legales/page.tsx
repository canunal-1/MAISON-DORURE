import type { Metadata } from "next";
import type { ReactNode } from "react";
import { adresseComplete } from "@/components/Coordonnees";
import { boulangerie, mentionsLegales } from "@/content/site";
import { lienTelephone } from "@/lib/horaires";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales du site de la ${boulangerie.nom}.`,
};

/** Une ligne « intitulé / valeur » ; une valeur vide s'affiche « à venir ». */
function Ligne({ intitule, children }: { intitule: string; children?: ReactNode }) {
  return (
    <div>
      <dt>{intitule}</dt>
      <dd>{children || <span className="a-venir">À venir</span>}</dd>
    </div>
  );
}

export default function MentionsLegales() {
  const { hebergeur } = mentionsLegales;

  return (
    <>
      <section className="bandeau">
        <div className="bandeau-contenu">
          <h1>Mentions légales</h1>
        </div>
      </section>

      <section className="bloc" aria-labelledby="titre-editeur">
        <div className="bloc-contenu etroit">
          <h2 id="titre-editeur">Éditeur du site</h2>
          <dl className="coordonnees">
            <Ligne intitule="Nom commercial">{boulangerie.nom}</Ligne>
            <Ligne intitule="Responsable de la publication">{mentionsLegales.responsable}</Ligne>
            <Ligne intitule="SIRET">{mentionsLegales.siret}</Ligne>
            <Ligne intitule="Adresse">{adresseComplete()}</Ligne>
            <Ligne intitule="Téléphone">
              {boulangerie.telephone && (
                <a href={lienTelephone(boulangerie.telephone)}>{boulangerie.telephone}</a>
              )}
            </Ligne>
            <Ligne intitule="E-mail">
              {boulangerie.email && <a href={`mailto:${boulangerie.email}`}>{boulangerie.email}</a>}
            </Ligne>
          </dl>
        </div>
      </section>

      <section className="bloc bloc-papier" aria-labelledby="titre-hebergeur">
        <div className="bloc-contenu etroit">
          <h2 id="titre-hebergeur">Hébergeur</h2>
          <dl className="coordonnees">
            <Ligne intitule="Nom">{hebergeur.nom}</Ligne>
            <Ligne intitule="Adresse">{hebergeur.adresse}</Ligne>
            <Ligne intitule="Site">
              {hebergeur.site && (
                <a href={hebergeur.site} target="_blank" rel="noreferrer">
                  {hebergeur.site.replace(/^https?:\/\//, "")}
                  <span className="visuellement-cache"> (s&apos;ouvre dans un nouvel onglet)</span>
                </a>
              )}
            </Ligne>
          </dl>
        </div>
      </section>

      <section className="bloc" aria-labelledby="titre-credits">
        <div className="bloc-contenu etroit">
          <h2 id="titre-credits">Crédits</h2>
          <p>
            Les polices Gloock et Hanken Grotesk sont diffusées sous licence SIL Open Font License
            1.1.
          </p>
        </div>
      </section>
    </>
  );
}
