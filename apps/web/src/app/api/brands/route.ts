import { NextResponse } from "next/server";
import { db } from "@/db";
import { brands, offers } from "@/db/schema";
import { eq, count, avg } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const results = await db
      .select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
        category: brands.category,
        description: brands.description,
        regionsSupported: brands.regionsSupported,
        dealCount: count(offers.id),
        avgDiscount: avg(offers.effectiveDiscountPct),
      })
      .from(brands)
      .leftJoin(offers, eq(brands.id, offers.brandId))
      .where(eq(brands.isActive, true))
      .groupBy(brands.id)
      .orderBy(brands.name);

    return NextResponse.json({ brands: results });
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return NextResponse.json({ brands: [], error: "Database not available" });
  }
}
