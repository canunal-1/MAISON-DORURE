import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { boulangerie } from "@/content/site";

// Image de partage (réseaux sociaux, messageries) : l'enseigne, sans texte inventé.
export const alt = boulangerie.nom;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const OR = "#d9a93d";
const CRAIE = "#ece8dd";

const gloock = await readFile(
  join(process.cwd(), "node_modules/@fontsource/gloock/files/gloock-latin-400-normal.woff"),
);

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 48,
          background: "#1e3a2f",
          fontFamily: "Gloock",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid ${OR}`,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 54,
              letterSpacing: "0.32em",
              color: CRAIE,
              textTransform: "uppercase",
            }}
          >
            Boulangerie
          </div>
          {/* Centré, et sur deux lignes si le nom est trop long pour une seule. */}
          <div
            style={{
              display: "flex",
              maxWidth: 1000,
              marginTop: 12,
              fontSize: 168,
              lineHeight: 1,
              color: OR,
              textAlign: "center",
            }}
          >
            {boulangerie.nomCourt}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Gloock", data: gloock, style: "normal", weight: 400 }],
    },
  );
}
