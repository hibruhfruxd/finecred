import { Home, Smartphone, Zap } from "lucide-react";
import type { PaymentCategory } from "@/models/domain";

const ICONS = {
  rent: Home,
  electricity: Zap,
  mobile: Smartphone,
} as const;

export function CategoryIcon({
  category,
  size = 18,
}: {
  category: PaymentCategory;
  size?: number;
}) {
  const Icon = ICONS[category];
  return (
    <span className={`category-icon category-icon-${category}`} aria-hidden="true">
      <Icon size={size} strokeWidth={1.9} />
    </span>
  );
}
