/** Branche de fleurs type lavande / aquarelle — style référence « Reservado ». */
const FloralLeftDecoration = ({
  className,
  opacity = 0.95,
}: {
  className?: string;
  opacity?: number;
}) => (
  <svg
    className={className}
    viewBox="0 0 100 220"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    style={{ opacity }}
  >
    <defs>
      <linearGradient id="lavStem" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6b8f5a" />
        <stop offset="100%" stopColor="#4a6b3d" />
      </linearGradient>
      <radialGradient id="lavPetal" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#c4b0d8" />
        <stop offset="55%" stopColor="#8f6fad" />
        <stop offset="100%" stopColor="#6b4f8a" />
      </radialGradient>
      <radialGradient id="lavPetalLight" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#ddd0ea" />
        <stop offset="100%" stopColor="#9a7db5" />
      </radialGradient>
    </defs>

    {/* Tige principale */}
    <path
      d="M48 215 C46 170 50 130 52 90 C54 55 50 30 46 8"
      stroke="url(#lavStem)"
      strokeWidth="2.2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M52 100 C68 95 78 78 80 58"
      stroke="url(#lavStem)"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M50 140 C32 135 22 118 20 98"
      stroke="url(#lavStem)"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />

    {/* Feuilles vertes */}
    <ellipse cx="38" cy="155" rx="14" ry="5" fill="#6d8f58" opacity="0.85" transform="rotate(-40 38 155)" />
    <ellipse cx="62" cy="175" rx="12" ry="4.5" fill="#5a7a48" opacity="0.8" transform="rotate(35 62 175)" />
    <ellipse cx="36" cy="120" rx="11" ry="4" fill="#7a9a62" opacity="0.75" transform="rotate(-25 36 120)" />
    <ellipse cx="66" cy="85" rx="10" ry="3.8" fill="#6d8f58" opacity="0.8" transform="rotate(30 66 85)" />
    <ellipse cx="34" cy="70" rx="9" ry="3.5" fill="#5a7a48" opacity="0.7" transform="rotate(-50 34 70)" />

    {/* Épis de lavande */}
    <g fill="url(#lavPetal)">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <ellipse
          key={`a-${i}`}
          cx={46 + (i % 2) * 3 - 1}
          cy={12 + i * 5.5}
          rx={7 - i * 0.25}
          ry={3.2}
          transform={`rotate(${-15 + i * 3} ${46 + (i % 2) * 3} ${12 + i * 5.5})`}
        />
      ))}
    </g>
    <g fill="url(#lavPetalLight)">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <ellipse
          key={`b-${i}`}
          cx={78 + (i % 2) * 2}
          cy={48 + i * 5}
          rx={6 - i * 0.2}
          ry={2.8}
          transform={`rotate(${10 + i * 4} ${78} ${48 + i * 5})`}
        />
      ))}
    </g>
    <g fill="url(#lavPetal)">
      {[0, 1, 2, 3, 4].map((i) => (
        <ellipse
          key={`c-${i}`}
          cx={22 + (i % 2)}
          cy={92 + i * 5}
          rx={5.5}
          ry={2.6}
          transform={`rotate(${-25 + i * 5} ${22} ${92 + i * 5})`}
        />
      ))}
    </g>
  </svg>
);

export default FloralLeftDecoration;
