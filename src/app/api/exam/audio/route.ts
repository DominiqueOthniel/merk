import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_HOSTS = new Set(["deuropa.app", "www.deuropa.app"]);

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const raw = new URL(req.url).searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "URL manquante" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "URL invalide" }, { status: 400 });
  }

  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
    return NextResponse.json({ error: "Source audio non autorisee" }, { status: 400 });
  }

  try {
    const upstream = await fetch(target.href, {
      headers: {
        "User-Agent": "MERK-AudioProxy/1.0",
        Accept: "audio/*,*/*",
      },
      cache: "force-cache",
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Audio source ${upstream.status}` },
        { status: 502 },
      );
    }

    const contentType =
      upstream.headers.get("content-type") || "audio/mp4";
    const buffer = Buffer.from(await upstream.arrayBuffer());
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=86400",
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    console.error("Audio proxy error", error);
    return NextResponse.json({ error: "Proxy audio indisponible" }, { status: 502 });
  }
}
