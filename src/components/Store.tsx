/** Le store rayé de la devanture, avec son bord festonné. */
export default function Store() {
  return (
    <svg className="store" width="100%" height="74" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="store-rayures" width="112" height="74" patternUnits="userSpaceOnUse">
          <rect className="store-raie-claire" width="56" height="50" />
          <circle className="store-raie-claire" cx="28" cy="50" r="24" />
          <rect className="store-raie-or" x="56" width="56" height="50" />
          <circle className="store-raie-or" cx="84" cy="50" r="24" />
        </pattern>
      </defs>
      <rect width="100%" height="74" fill="url(#store-rayures)" />
    </svg>
  );
}
