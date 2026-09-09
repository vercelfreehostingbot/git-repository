interface TakaIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function TakaIcon({ size = 16, color, className }: TakaIconProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        fontSize: size * 0.9,
        fontWeight: 800,
        lineHeight: 1,
        color,
        fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif",
      }}
    >
      {/* The ৳ glyph in Noto Sans Bengali sits visually toward the
          top-left of its own em-box rather than being drawn perfectly
          centered — flexbox centers the box correctly, but can't fix
          how the font itself draws the character inside it. This
          small nudge compensates for that, confirmed against
          screenshots of the stat-card icons where it was visibly
          off-center. If a future font-swap changes this, re-check and
          adjust/remove the offset. */}
      <span style={{ display: "inline-block", transform: "translate(6%, 6%)" }}>
        ৳
      </span>
    </span>
  );
}