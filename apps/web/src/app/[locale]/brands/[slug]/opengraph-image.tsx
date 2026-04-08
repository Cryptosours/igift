import { ImageResponse } from "next/og";
import { getBrandBySlug } from "@/lib/data";

export const runtime = "nodejs";
export const alt = "iGift Brand Deals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let brandName = slug;
  let dealCount = 0;
  let avgDiscount = 0;
  let bestDiscount = 0;
  let category = "Gift Cards";

  try {
    const brand = await getBrandBySlug(slug);
    if (brand) {
      brandName = brand.name;
      dealCount = brand.deals.length;
      category = brand.category;
      avgDiscount = brand.avgDiscount;
      if (brand.deals.length > 0) {
        bestDiscount = Math.max(...brand.deals.map((d) => d.effectiveDiscount));
      }
    }
  } catch {
    // DB unavailable — use slug as name
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #141210 0%, #1a1815 50%, #2d2a26 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #d97757, #c15f3c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: 700,
                color: "white",
              }}
            >
              iG
            </div>
            <div style={{ fontSize: "24px", fontWeight: 600, color: "#e8956e" }}>
              iGift
            </div>
          </div>
          <div
            style={{
              padding: "6px 16px",
              borderRadius: "999px",
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#6ee7b7",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {category}
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            gap: "16px",
          }}
        >
          <div style={{ fontSize: "52px", fontWeight: 700, color: "white", lineHeight: 1.1, display: "flex" }}>
            {`${brandName} Gift Card Deals`}
          </div>
          <div style={{ fontSize: "22px", color: "#c4c0b8", lineHeight: 1.4 }}>
            Compare verified prices from trusted sources
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "#10b981", display: "flex" }}>
              {`${bestDiscount.toFixed(1)}%`}
            </div>
            <div style={{ fontSize: "14px", color: "#e8956e", fontWeight: 500 }}>
              Best Discount
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "#f59e0b", display: "flex" }}>
              {`${avgDiscount}%`}
            </div>
            <div style={{ fontSize: "14px", color: "#e8956e", fontWeight: 500 }}>
              Avg Discount
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "white" }}>
              {dealCount}
            </div>
            <div style={{ fontSize: "14px", color: "#e8956e", fontWeight: 500 }}>
              Active Deals
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            right: "60px",
            fontSize: "16px",
            color: "#d97757",
            fontWeight: 500,
          }}
        >
          {`igift.app/brands/${slug}`}
        </div>
      </div>
    ),
    { ...size },
  );
}
