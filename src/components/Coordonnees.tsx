import { boulangerie } from "@/content/site";
import { lienTelephone } from "@/lib/horaires";

export function adresseComplete(): string {
  const { rue, codePostal, ville } = boulangerie.adresse;
  return [rue, [codePostal, ville].filter(Boolean).join(" ")].filter(Boolean).join(", ");
}

/** Adresse, téléphone et e-mail. Les champs vides affichent « à venir ». */
export default function Coordonnees() {
  const adresse = adresseComplete();
  const { rue, codePostal, ville } = boulangerie.adresse;

  return (
    <dl className="coordonnees">
      <div>
        <dt>Adresse</dt>
        <dd>
          {adresse ? (
            <>
              {rue}
              {rue && <br />}
              {[codePostal, ville].filter(Boolean).join(" ")}
              <br />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${boulangerie.nom}, ${adresse}`,
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                Voir l&apos;itinéraire
                <span className="visuellement-cache"> (s&apos;ouvre dans un nouvel onglet)</span>
              </a>
            </>
          ) : (
            <span className="a-venir">Adresse à venir</span>
          )}
        </dd>
      </div>
      <div>
        <dt>Téléphone</dt>
        <dd>
          {boulangerie.telephone ? (
            <a href={lienTelephone(boulangerie.telephone)}>{boulangerie.telephone}</a>
          ) : (
            <span className="a-venir">Numéro à venir</span>
          )}
        </dd>
      </div>
      {boulangerie.email && (
        <div>
          <dt>E-mail</dt>
          <dd>
            <a href={`mailto:${boulangerie.email}`}>{boulangerie.email}</a>
          </dd>
        </div>
      )}
      {boulangerie.instagram && (
        <div>
          <dt>Instagram</dt>
          <dd>
            <a
              href={`https://www.instagram.com/${boulangerie.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              @{boulangerie.instagram.replace(/^@/, "")}
              <span className="visuellement-cache"> (s&apos;ouvre dans un nouvel onglet)</span>
            </a>
          </dd>
        </div>
      )}
    </dl>
  );
}
