import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "180",
          height: "180",
          borderRadius: "40",
          background: "linear-gradient(135deg, #4f46e5, #6366f1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "80",
            fontWeight: 700,
            color: "white",
            display: "flex",
          }}
        >
          iG
        </div>
      </div>
    ),
    { ...size },
  );
}
