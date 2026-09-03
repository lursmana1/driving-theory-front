import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

export function ogImageResponse(kicker: string, headline: string) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "72px",
          background: "linear-gradient(135deg, #0f2d36 0%, #193e4a 55%, #1f6b78 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: 0.8,
          }}
        >
          {kicker}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700 }}>
            prava.ge
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              lineHeight: 1.3,
              maxWidth: 900,
              opacity: 0.95,
            }}
          >
            {headline}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
