import { ImageResponse } from "next/og";

// Icône d'écran d'accueil iPhone/iPad : le croissant de l'enseigne sur fond vert.
// Pas de coins arrondis ni de transparence : iOS les applique lui-même.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e3a2f",
        }}
      >
        <svg width="118" height="118" viewBox="0 0 32 32">
          <path
            fill="#d9a93d"
            d="M21.6 3.2A13.6 13.6 0 1 0 28.8 22 10.6 10.6 0 0 1 21.6 3.2Z"
          />
        </svg>
      </div>
    ),
    size,
  );
}
