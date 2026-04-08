import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "32",
          height: "32",
          borderRadius: "8",
          background: "#c15f3c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Simplified gift box */}
          <div
            style={{
              width: "18",
              height: "3",
              borderRadius: "1.5",
              background: "white",
              display: "flex",
            }}
          />
          <div
            style={{
              width: "16",
              height: "10",
              borderRadius: "2",
              background: "rgba(255,255,255,0.9)",
              marginTop: "1",
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
