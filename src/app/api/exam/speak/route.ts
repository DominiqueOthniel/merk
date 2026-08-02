import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getExamExercise } from "@/lib/content/exam-catalog";
import { speakMaxSeconds } from "@/lib/content/exam-types";
import { normalizeExamProvider } from "@/lib/exam-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;

type CoachScores = {
  aufgabe: number;
  inhalt: number;
  sprache: number;
  struktur: number;
};

function clampScore(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 1;
  return Math.max(1, Math.min(5, Math.round(v)));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const form = await req.formData();
  const audio = form.get("audio");
  const sourceId = String(form.get("sourceId") || "");
  const notes = String(form.get("notes") || "").slice(0, 2000);
  const levelHint = String(form.get("level") || "B1");
  const promptHint = String(form.get("prompt") || "").slice(0, 4000);

  if (!(audio instanceof File) || audio.size < 800) {
    return NextResponse.json({ error: "Audio manquant ou trop court" }, { status: 400 });
  }
  if (audio.size > MAX_BYTES) {
    return NextResponse.json({ error: "Audio trop volumineux (max 8 Mo)" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { examProvider: true },
  });
  const provider = normalizeExamProvider(
    dbUser?.examProvider ?? session.user.examProvider,
  );
  const exercise = getExamExercise(sourceId, provider);
  const level = exercise?.level || levelHint;
  const prompt = exercise?.passage || promptHint || exercise?.sourceTitle || "Sprechen";
  const maxSeconds = speakMaxSeconds(level);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      unavailable: true,
      message:
        "Feedback IA indisponible (cle OpenAI absente). Tu peux quand meme valider ta prise de parole.",
    });
  }

  try {
    const transcript = await transcribe(apiKey, audio);
    if (!transcript || transcript.trim().length < 8) {
      return NextResponse.json(
        {
          error: "Transcription trop courte. Reessaie en parlant plus clairement.",
        },
        { status: 422 },
      );
    }

    const feedback = await coach(apiKey, {
      level,
      prompt,
      notes,
      transcript,
      maxSeconds,
    });

    return NextResponse.json({
      feedback: {
        ...feedback,
        transcript,
      },
    });
  } catch (error) {
    console.error("Speak feedback error", error);
    return NextResponse.json(
      { error: "Feedback IA temporairement indisponible" },
      { status: 502 },
    );
  }
}

async function transcribe(apiKey: string, audio: File): Promise<string> {
  const body = new FormData();
  body.append("file", audio, audio.name || "sprechen.webm");
  body.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1");
  body.append("language", "de");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body,
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`transcribe ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as { text?: string };
  return (data.text || "").trim();
}

async function coach(
  apiKey: string,
  input: {
    level: string;
    prompt: string;
    notes: string;
    transcript: string;
    maxSeconds: number;
  },
) {
  const system = `Tu es un entraineur oral allemand pour examens Goethe/telc.
Evalue une prise de parole d entrainement (PAS une note officielle).
Reponds UNIQUEMENT en JSON valide avec ce schema:
{
  "scores": { "aufgabe": 1-5, "inhalt": 1-5, "sprache": 1-5, "struktur": 1-5 },
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "reformulation": "une phrase allemande amelioree"
}
Les bullets strengths/improvements sont en francais, courts.
Critere Aufgabe = respect de la consigne; Inhalt = richesse; Sprache = grammaire/vocab; Struktur = organisation.`;

  const user = `Niveau: ${input.level}
Duree cible max: ${input.maxSeconds}s
Consigne:
${input.prompt}

Notes eleve:
${input.notes || "(aucune)"}

Transcription:
${input.transcript}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_SPEAK_MODEL || "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`coach ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content || "{}";
  let parsed: {
    scores?: Partial<CoachScores>;
    strengths?: string[];
    improvements?: string[];
    reformulation?: string;
  };
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  const scores: CoachScores = {
    aufgabe: clampScore(parsed.scores?.aufgabe),
    inhalt: clampScore(parsed.scores?.inhalt),
    sprache: clampScore(parsed.scores?.sprache),
    struktur: clampScore(parsed.scores?.struktur),
  };
  const total =
    scores.aufgabe + scores.inhalt + scores.sprache + scores.struktur;

  return {
    scores,
    total,
    strengths: (parsed.strengths || []).filter(Boolean).slice(0, 3),
    improvements: (parsed.improvements || []).filter(Boolean).slice(0, 3),
    reformulation: parsed.reformulation || "",
  };
}
