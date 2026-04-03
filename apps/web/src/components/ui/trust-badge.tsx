import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { clsx } from "clsx";

type TrustZone = "green" | "yellow" | "red";

const zoneConfig: Record<
  TrustZone,
  { label: string; icon: typeof ShieldCheck; className: string; dotColor: string }
> = {
  green: {
    label: "Verified",
    icon: ShieldCheck,
    className: "bg-deal-50 text-deal-700 border-deal-200/60",
    dotColor: "bg-deal-500",
  },
  yellow: {
    label: "Marketplace",
    icon: ShieldAlert,
    className: "bg-alert-50 text-alert-700 border-alert-200/60",
    dotColor: "bg-alert-500",
  },
  red: {
    label: "Caution",
    icon: ShieldX,
    className: "bg-red-50 text-red-700 border-red-200/60",
    dotColor: "bg-red-500",
  },
};

export function TrustBadge({ zone }: { zone: TrustZone }) {
  const config = zoneConfig[zone];

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        config.className,
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", config.dotColor)} />
      {config.label}
    </span>
  );
}
