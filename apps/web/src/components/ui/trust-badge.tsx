import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { clsx } from "clsx";

type TrustZone = "green" | "yellow" | "red";

const zoneConfig: Record<
  TrustZone,
  { label: string; icon: typeof ShieldCheck; className: string }
> = {
  green: {
    label: "Verified Source",
    icon: ShieldCheck,
    className: "bg-deal-50 text-deal-700 border-deal-200",
  },
  yellow: {
    label: "Marketplace",
    icon: ShieldAlert,
    className: "bg-alert-50 text-alert-700 border-alert-200",
  },
  red: {
    label: "High Risk",
    icon: ShieldX,
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export function TrustBadge({ zone }: { zone: TrustZone }) {
  const config = zoneConfig[zone];
  const Icon = config.icon;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
