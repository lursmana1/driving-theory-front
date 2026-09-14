import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

const FONT_NAME = "Noto Sans Georgian";

export const DEFAULT_OG_HEADLINE = "prava.ge - თეორიული გამოცდის ბილეთები";

async function logoDataUrl(): Promise<string> {
  const buf = await readFile(
    join(process.cwd(), "public/images/jpg/pravaLogo.jpg"),
  );
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

async function georgianFont(): Promise<Buffer> {
  return readFile(
    join(process.cwd(), "public/fonts/NotoSansGeorgian-Bold.ttf"),
  );
}

/** 1200×630 share card: logo + one headline. Georgian needs the bundled font. */
export async function ogImageResponse(headline = DEFAULT_OG_HEADLINE) {
  const [logo, fontData] = await Promise.all([logoDataUrl(), georgianFont()]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          color: "#ffffff",
          fontFamily: FONT_NAME,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
          }}
        >
          <img src={logo} width={280} height={280} alt="" />
          <div
            style={{
              display: "flex",
              fontSize: 36,
              fontWeight: 700,
              lineHeight: 1.35,
              maxWidth: 1000,
              textAlign: "center",
              justifyContent: "center",
            }}
          >
            {headline}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        {
          name: FONT_NAME,
          data: fontData,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
