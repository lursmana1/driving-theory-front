import { NextRequest, NextResponse } from "next/server";

const LANG_MAP: Record<string, string> = { ka: "ka", ru: "ru", en: "en" };

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const lang = req.nextUrl.searchParams.get("lang") ?? "ka";

  if (!q.trim()) {
    return NextResponse.json({ error: "missing q" }, { status: 400 });
  }

  const tl = LANG_MAP[lang] ?? "en";

  const url = new URL("https://translate.googleapis.com/translate_tts");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("ie", "UTF-8");
  url.searchParams.set("tl", tl);
  url.searchParams.set("q", q);
  url.searchParams.set("ttsspeed", "0.9");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    // Georgian isn't supported — try Russian voice as fallback (widely understood in Georgia)
    if (tl === "ka") {
      url.searchParams.set("tl", "ru");
      const fallback = await fetch(url.toString(), {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      
      if (fallback.ok) {
        const audio = await fallback.arrayBuffer();
        return new NextResponse(audio, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
    }

    return NextResponse.json({ error: "tts unavailable" }, { status: 502 });
  }

  const audio = await res.arrayBuffer();

  return new NextResponse(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
