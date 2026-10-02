/** Le croissant de l'enseigne. */
export default function Embleme({ taille = 28 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M21.6 3.2A13.6 13.6 0 1 0 28.8 22 10.6 10.6 0 0 1 21.6 3.2Z"
      />
    </svg>
  );
}
