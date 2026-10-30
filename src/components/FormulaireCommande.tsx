"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { envoyerCommande } from "@/app/contact/actions";
import { commande } from "@/content/site";
import { CHAMP_PIEGE, ETAT_INITIAL, LIMITES, type Champ } from "@/lib/commande-types";
import { ajouterJours, maintenantAParis } from "@/lib/horaires";
import { useMinute } from "@/lib/useMinute";

const CHAMPS: Champ[] = ["nom", "telephone", "date", "demande"];

/**
 * Formulaire de demande de commande. La validation est faite côté serveur (voir
 * lib/commande.ts) : le formulaire fonctionne aussi sans JavaScript.
 */
export default function FormulaireCommande() {
  const [etat, action, enCours] = useActionState(envoyerCommande, ETAT_INITIAL);
  const message = useRef<HTMLDivElement>(null);

  // Après un envoi, le focus va au message : il est lu et visible, quel que soit l'endroit du formulaire.
  useEffect(() => {
    if (etat.statut !== "initial") message.current?.focus();
  }, [etat]);

  // Dates proposées : calculées dans le navigateur (la page est générée à l'avance).
  const minute = useMinute();
  const aujourdhui = minute === null ? null : maintenantAParis(new Date(minute * 60_000)).date;
  const premiere = aujourdhui ? ajouterJours(aujourdhui, commande.delaiJours) : undefined;
  const derniere = aujourdhui ? ajouterJours(aujourdhui, LIMITES.joursAvance) : undefined;

  const erreur = (champ: Champ) => etat.erreurs[champ];
  const proprietes = (champ: Champ, aide?: string) => ({
    id: `commande-${champ}`,
    name: champ,
    required: true,
    defaultValue: etat.valeurs[champ],
    "aria-invalid": erreur(champ) ? (true as const) : undefined,
    "aria-describedby":
      [erreur(champ) ? `commande-${champ}-erreur` : null, aide ?? null].filter(Boolean).join(" ") ||
      undefined,
  });
  const messageErreur = (champ: Champ) =>
    erreur(champ) && (
      <p className="champ-erreur" id={`commande-${champ}-erreur`}>
        <span className="visuellement-cache">Erreur : </span>
        {erreur(champ)}
      </p>
    );
  const aller = (champ: Champ) => (evenement: React.MouseEvent) => {
    evenement.preventDefault();
    document.getElementById(`commande-${champ}`)?.focus();
  };

  return (
    <div className="commande-formulaire">
      {etat.statut === "envoye" && (
        <div className="commande-message commande-succes" role="status" tabIndex={-1} ref={message}>
          <p className="commande-message-titre">Demande envoyée</p>
          <p>{etat.message}</p>
          <p>{commande.avertissement}</p>
        </div>
      )}
      {etat.statut === "erreur" && (
        <div className="commande-message commande-probleme" role="alert" tabIndex={-1} ref={message}>
          <p className="commande-message-titre">Il y a un problème</p>
          <p>{etat.message}</p>
          {CHAMPS.some(erreur) && (
            <ul>
              {CHAMPS.filter(erreur).map((champ) => (
                <li key={champ}>
                  <a href={`#commande-${champ}`} onClick={aller(champ)}>
                    {erreur(champ)}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <form action={action} noValidate aria-busy={enCours}>
        <div className="champ">
          <label htmlFor="commande-nom">Nom</label>
          <input type="text" autoComplete="name" maxLength={LIMITES.nom * 2} {...proprietes("nom")} />
          {messageErreur("nom")}
        </div>

        <div className="champ">
          <label htmlFor="commande-telephone">Téléphone</label>
          <input
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            maxLength={40}
            {...proprietes("telephone", "commande-telephone-aide")}
          />
          <p className="champ-aide" id="commande-telephone-aide">
            Pour vous joindre au sujet de votre demande.
          </p>
          {messageErreur("telephone")}
        </div>

        <div className="champ">
          <label htmlFor="commande-date">Date de retrait</label>
          <input
            type="date"
            autoComplete="off"
            min={premiere}
            max={derniere}
            {...proprietes("date", commande.delaiJours > 0 ? "commande-date-aide" : undefined)}
          />
          {commande.delaiJours > 0 && (
            <p className="champ-aide" id="commande-date-aide">
              Délai minimum : {commande.delaiJours} jour{commande.delaiJours > 1 ? "s" : ""}.
            </p>
          )}
          {messageErreur("date")}
        </div>

        <div className="champ">
          <label htmlFor="commande-demande">Votre demande</label>
          <textarea
            rows={6}
            maxLength={LIMITES.demande * 2}
            {...proprietes("demande", "commande-demande-aide")}
          />
          <p className="champ-aide" id="commande-demande-aide">
            Produits, quantités, précisions utiles.
          </p>
          {messageErreur("demande")}
        </div>

        {/* Piège à robots : invisible, hors de la navigation, jamais rempli par une personne. */}
        <div className="piege" aria-hidden="true">
          <label>
            Ne pas remplir ce champ
            <input type="text" name={CHAMP_PIEGE} tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <button type="submit" className="bouton bouton-fonce" disabled={enCours}>
          {enCours ? "Envoi en cours…" : "Envoyer ma demande"}
        </button>

        <p className="champ-aide">{commande.avertissement}</p>
        <p className="champ-aide">
          Les informations saisies servent uniquement à traiter votre demande.{" "}
          <Link href="/mentions-legales#donnees">En savoir plus</Link>
        </p>
      </form>
    </div>
  );
}
