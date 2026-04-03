interface LogoMarkProps {
  className?: string;
  size?: number;
}

/**
 * iGift logo mark — a minimal gift box constructed from geometric primitives.
 * The box uses a ribbon cross that doubles as a subtle "+" / data-grid motif,
 * reinforcing the "intelligence" angle. Designed on a 24×24 grid.
 */
export function LogoMark({ className, size = 24 }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Box body */}
      <rect
        x="3"
        y="10"
        width="18"
        height="11"
        rx="2"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Box lid */}
      <rect
        x="2"
        y="7"
        width="20"
        height="4"
        rx="1.5"
        fill="currentColor"
      />
      {/* Vertical ribbon */}
      <rect
        x="10.75"
        y="7"
        width="2.5"
        height="14"
        fill="white"
        opacity="0.25"
      />
      {/* Horizontal ribbon */}
      <rect
        x="2"
        y="8"
        width="20"
        height="2"
        fill="white"
        opacity="0.15"
      />
      {/* Bow left */}
      <path
        d="M12 7C12 7 9 3.5 6.5 4.5C4.5 5.3 5 7 6.5 7H12Z"
        fill="currentColor"
      />
      {/* Bow right */}
      <path
        d="M12 7C12 7 15 3.5 17.5 4.5C19.5 5.3 19 7 17.5 7H12Z"
        fill="currentColor"
      />
      {/* Bow knot */}
      <circle cx="12" cy="6.5" r="1.25" fill="white" opacity="0.3" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { mark: 28, text: "text-base", sub: "text-[8px]" },
  md: { mark: 36, text: "text-lg", sub: "text-[9px]" },
  lg: { mark: 48, text: "text-2xl", sub: "text-[11px]" },
};

export function Logo({ className, showSubtitle = true, size = "md" }: LogoProps) {
  const s = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 shadow-sm p-1.5 transition-transform group-hover:scale-105">
        <LogoMark size={s.mark - 12} className="text-white" />
      </div>
      <div className="flex flex-col">
        <span
          className={`${s.text} font-extrabold tracking-tight text-surface-900 leading-none`}
        >
          i<span className="text-brand-600">Gift</span>
        </span>
        {showSubtitle && (
          <span
            className={`hidden ${s.sub} font-medium tracking-widest text-surface-400 uppercase sm:block`}
          >
            Deal Intelligence
          </span>
        )}
      </div>
    </div>
  );
}
