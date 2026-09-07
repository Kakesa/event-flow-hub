/** Repères de pliage : arête haute + coins (haut et bas — côté table). */
export function FoldCornerMarks({
  color = '#9a8b78',
}: {
  color?: string;
}) {
  const arm = 14;
  const stroke = 1.25;

  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
      {/* Trait de pliage en haut de la face (= arête de la tente) */}
      <div
        className="absolute left-[6%] right-[6%] top-0 border-t border-dashed"
        style={{ borderColor: color, opacity: 0.85 }}
      />
      <span
        className="absolute left-1/2 top-[3px] -translate-x-1/2 text-[8px] uppercase tracking-[0.2em] font-medium"
        style={{ color, opacity: 0.9 }}
      >
        plier ici
      </span>

      {/* Coins haut — arête */}
      <svg
        className="absolute left-1 top-0"
        width={arm + 4}
        height={arm + 4}
        viewBox={`0 0 ${arm + 4} ${arm + 4}`}
      >
        <path
          d={`M2 ${arm + 2} L2 2 L${arm + 2} 2`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="square"
        />
      </svg>
      <svg
        className="absolute right-1 top-0"
        width={arm + 4}
        height={arm + 4}
        viewBox={`0 0 ${arm + 4} ${arm + 4}`}
      >
        <path
          d={`M2 2 L${arm + 2} 2 L${arm + 2} ${arm + 2}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="square"
        />
      </svg>

      {/* Coins bas — côté qui pose sur la table */}
      <svg
        className="absolute left-1 bottom-0"
        width={arm + 4}
        height={arm + 4}
        viewBox={`0 0 ${arm + 4} ${arm + 4}`}
      >
        <path
          d={`M2 2 L2 ${arm + 2} L${arm + 2} ${arm + 2}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="square"
          opacity={0.85}
        />
      </svg>
      <svg
        className="absolute right-1 bottom-0"
        width={arm + 4}
        height={arm + 4}
        viewBox={`0 0 ${arm + 4} ${arm + 4}`}
      >
        <path
          d={`M2 ${arm + 2} L${arm + 2} ${arm + 2} L${arm + 2} 2`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="square"
          opacity={0.85}
        />
      </svg>

      {/* Trait bas — pli du côté table */}
      <div
        className="absolute left-[6%] right-[6%] bottom-0 border-b border-dashed"
        style={{ borderColor: color, opacity: 0.7 }}
      />
    </div>
  );
}

export default FoldCornerMarks;
