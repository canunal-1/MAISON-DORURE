"use server";

import { headers } from "next/headers";
import { traiterCommande } from "@/lib/commande";
import type { EtatCommande } from "@/lib/commande-types";

/** Action du formulaire de commande (appelée via `useActionState`). */
export async function envoyerCommande(_precedent: EtatCommande, formData: FormData): Promise<EtatCommande> {
  const entetes = await headers();
  // Derrière un hébergeur, l'adresse du visiteur arrive dans x-forwarded-for.
  const visiteur =
    entetes.get("x-forwarded-for")?.split(",")[0].trim() || entetes.get("x-real-ip") || "inconnu";

  return traiterCommande(formData, { visiteur });
}
