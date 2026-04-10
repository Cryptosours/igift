"use client";

import { useEffect } from "react";
import { trackBrandView } from "@/lib/analytics";

interface BrandViewTrackerProps {
  brandSlug: string;
  brandName: string;
}

/**
 * Fires a GA4 brand_view event once per mount.
 * Rendered as an invisible client component inside a Server Component page.
 */
export function BrandViewTracker({ brandSlug, brandName }: BrandViewTrackerProps) {
  useEffect(() => {
    trackBrandView(brandSlug, brandName);
  }, [brandSlug, brandName]);

  return null;
}
