/** Petits bouquets aquarelle aux coins — roses blush + feuillage sage. */
const FloralCornersDecoration = ({
  className,
  opacity = 0.92,
}: {
  className?: string;
  opacity?: number;
}) => (
  <svg
    className={className}
    viewBox="0 0 640 380"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    preserveAspectRatio="none"
    style={{ opacity }}
  >
    <defs>
      <radialGradient id="fcRose" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#f7d8d2" />
        <stop offset="55%" stopColor="#e0a39a" />
        <stop offset="100%" stopColor="#c47a70" />
      </radialGradient>
      <radialGradient id="fcCream" cx="45%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#fffaf4" />
        <stop offset="100%" stopColor="#e8d5bc" />
      </radialGradient>
      <radialGradient id="fcPeach" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#fde8dc" />
        <stop offset="100%" stopColor="#d9a07e" />
      </radialGradient>
      <linearGradient id="fcLeaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#9aaa7a" />
        <stop offset="100%" stopColor="#6a7a52" />
      </linearGradient>
    </defs>

    {/* Coin haut-droit */}
    <g transform="translate(480, -8)">
      <ellipse cx="90" cy="42" rx="22" ry="8" fill="url(#fcLeaf)" opacity="0.85" transform="rotate(35 90 42)" />
      <ellipse cx="55" cy="28" rx="18" ry="7" fill="url(#fcLeaf)" opacity="0.8" transform="rotate(-25 55 28)" />
      <ellipse cx="115" cy="58" rx="16" ry="6" fill="url(#fcLeaf)" opacity="0.75" transform="rotate(55 115 58)" />
      <ellipse cx="78" cy="36" rx="26" ry="24" fill="url(#fcRose)" />
      <ellipse cx="78" cy="36" rx="14" ry="13" fill="#c47a70" opacity="0.35" />
      <ellipse cx="48" cy="52" rx="18" ry="16" fill="url(#fcCream)" />
      <ellipse cx="108" cy="28" rx="15" ry="14" fill="url(#fcPeach)" />
      <circle cx="62" cy="22" r="4" fill="#f5efe6" opacity="0.9" />
      <circle cx="95" cy="58" r="3.5" fill="#f5efe6" opacity="0.85" />
      <circle cx="118" cy="42" r="3" fill="#e8c4b8" opacity="0.8" />
    </g>

    {/* Coin bas-droit */}
    <g transform="translate(470, 265)">
      <ellipse cx="80" cy="70" rx="20" ry="7" fill="url(#fcLeaf)" opacity="0.85" transform="rotate(-40 80 70)" />
      <ellipse cx="110" cy="55" rx="17" ry="6.5" fill="url(#fcLeaf)" opacity="0.8" transform="rotate(20 110 55)" />
      <ellipse cx="55" cy="85" rx="15" ry="5.5" fill="url(#fcLeaf)" opacity="0.75" transform="rotate(-60 55 85)" />
      <ellipse cx="95" cy="78" rx="24" ry="22" fill="url(#fcPeach)" />
      <ellipse cx="95" cy="78" rx="12" ry="11" fill="#d9a07e" opacity="0.35" />
      <ellipse cx="68" cy="62" rx="16" ry="15" fill="url(#fcRose)" />
      <ellipse cx="120" cy="88" rx="14" ry="13" fill="url(#fcCream)" />
      <circle cx="78" cy="92" r="3.5" fill="#f5efe6" opacity="0.9" />
      <circle cx="112" cy="68" r="3" fill="#e8c4b8" opacity="0.85" />
    </g>

    {/* Coin bas-gauche (sous / près de la photo) */}
    <g transform="translate(-10, 280)">
      <ellipse cx="48" cy="55" rx="18" ry="7" fill="url(#fcLeaf)" opacity="0.8" transform="rotate(28 48 55)" />
      <ellipse cx="78" cy="70" rx="16" ry="6" fill="url(#fcLeaf)" opacity="0.75" transform="rotate(-35 78 70)" />
      <ellipse cx="42" cy="72" rx="20" ry="18" fill="url(#fcCream)" />
      <ellipse cx="68" cy="58" rx="15" ry="14" fill="url(#fcRose)" opacity="0.9" />
      <circle cx="55" cy="48" r="3" fill="#f5efe6" opacity="0.9" />
      <circle cx="82" cy="78" r="2.8" fill="#e8c4b8" opacity="0.85" />
    </g>

    {/* Accent haut-gauche léger */}
    <g transform="translate(-5, -5)">
      <ellipse cx="40" cy="32" rx="14" ry="5.5" fill="url(#fcLeaf)" opacity="0.7" transform="rotate(-30 40 32)" />
      <ellipse cx="52" cy="28" rx="12" ry="11" fill="url(#fcPeach)" opacity="0.85" />
      <circle cx="38" cy="22" r="2.8" fill="#f5efe6" opacity="0.85" />
    </g>
  </svg>
);

export default FloralCornersDecoration;
