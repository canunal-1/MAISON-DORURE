/** Le logo : un carreau de faïence, une fleur à quatre pétales au centre. */
export default function Embleme({ taille = 28 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect className="embleme-carreau" x="1.5" y="1.5" width="29" height="29" rx="3" stroke="currentColor" strokeWidth="2" />
      <g fill="currentColor">
        <ellipse cx="16" cy="9.5" rx="3.2" ry="5" />
        <ellipse cx="16" cy="22.5" rx="3.2" ry="5" />
        <ellipse cx="9.5" cy="16" rx="5" ry="3.2" />
        <ellipse cx="22.5" cy="16" rx="5" ry="3.2" />
      </g>
      <circle className="embleme-carreau" cx="16" cy="16" r="2.4" />
    </svg>
  );
}
