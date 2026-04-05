/**
 * BrandAvatar — deterministic colored circle with brand initial.
 * Uses the brand slug to generate a consistent hue so each brand
 * gets a unique color without needing logo assets.
 */

function slugToHue(slug: string): number {
  let hash = 5381;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) + hash + slug.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash) % 360;
}

interface BrandAvatarProps {
  name: string;
  slug: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { outer: "h-8 w-8", text: "text-xs" },
  md: { outer: "h-10 w-10", text: "text-sm" },
  lg: { outer: "h-14 w-14", text: "text-lg" },
};

export function BrandAvatar({ name, slug, size = "md", className = "" }: BrandAvatarProps) {
  const hue = slugToHue(slug);
  const s = sizeMap[size];
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={`${s.outer} flex items-center justify-center rounded-xl font-bold ${s.text} text-white shrink-0 ${className}`}
      style={{ backgroundColor: `hsl(${hue}, 55%, 50%)` }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
