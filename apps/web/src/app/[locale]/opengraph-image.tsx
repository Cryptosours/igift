import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "iGift — Trust-scored deal intelligence for digital gift cards";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #141210 0%, #1a1815 50%, #2d2a26 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "60px",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #d97757, #c15f3c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              fontWeight: 700,
              color: "white",
            }}
          >
            iG
          </div>
          <div style={{ fontSize: "48px", fontWeight: 700, color: "white" }}>
            iGift
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            color: "#c4c0b8",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          Trust-scored deal intelligence for digital gift cards, credits &amp;
          vouchers
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
          }}
        >
          {["Verified Sources", "Dual Scoring", "Region-Aware", "Real-Time"].map(
            (label) => (
              <div
                key={label}
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
                {label}
              </div>
            ),
          )}
        </div>

        {/* Footer URL */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "18px",
            color: "#d97757",
            fontWeight: 500,
          }}
        >
          igift.app
        </div>
      </div>
    ),
    { ...size },
  );
}
