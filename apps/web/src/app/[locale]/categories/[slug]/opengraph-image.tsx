import { ImageResponse } from "next/og";
import { getCategoryBySlug } from "@/lib/data";

export const runtime = "nodejs";
export const alt = "iGift Category Deals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);

  const name = cat?.name ?? slug;
  const icon = cat?.icon ?? "🏷️";
  const description = cat?.description ?? "Verified gift card deals";

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

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            gap: "20px",
          }}
        >
          <div style={{ fontSize: "72px" }}>{icon}</div>
          <div style={{ fontSize: "48px", fontWeight: 700, color: "white", lineHeight: 1.1, display: "flex" }}>
            {`${name} Deals`}
          </div>
          <div style={{ fontSize: "22px", color: "#c4c0b8", lineHeight: 1.4, maxWidth: "700px" }}>
            {description}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: "8px 20px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#dddad4",
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            Trust-scored &amp; verified
          </div>
          <div style={{ fontSize: "16px", color: "#d97757", fontWeight: 500 }}>
            {`igift.app/categories/${slug}`}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
