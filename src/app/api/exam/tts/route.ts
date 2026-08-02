import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  text: z.string().min(8).max(4500),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Texte invalide" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      mode: "browser",
      text: body.text,
    });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL || "tts-1",
        voice: process.env.OPENAI_TTS_VOICE || "nova",
        input: body.text,
        format: "mp3",
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("OpenAI TTS failed", res.status, detail.slice(0, 400));
      return NextResponse.json({
        mode: "browser",
        text: body.text,
      });
    }

    const audio = Buffer.from(await res.arrayBuffer());
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.length),
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("OpenAI TTS error", error);
    return NextResponse.json({
      mode: "browser",
      text: body.text,
    });
  }
}
