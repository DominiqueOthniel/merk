"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RecordingLive } from "@/components/ui/recording-live";
import { speakMaxSeconds } from "@/lib/content/exam-types";

type Feedback = {
  total: number;
  scores: {
    aufgabe: number;
    inhalt: number;
    sprache: number;
    struktur: number;
  };
  strengths: string[];
  improvements: string[];
  reformulation?: string;
  transcript?: string;
};

type Props = {
  title: string;
  level: string;
  sourceId: string;
  prompt: string;
  notes: string;
  onNotesChange: (value: string) => void;
  onComplete: () => void;
  busy?: boolean;
};

export function ExamSpeakPanel({
  title,
  level,
  sourceId,
  prompt,
  notes,
  onNotesChange,
  onComplete,
  busy = false,
}: Props) {
  const maxSeconds = speakMaxSeconds(level);
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>([0.2, 0.2, 0.2, 0.2, 0.2]);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.mediaDevices) {
      setSupported(false);
    }
    return () => {
      cleanupRecording();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFeedback(null);
    setFeedbackError(null);
    setElapsed(0);
    setRecording(false);
    setAudioBlob(null);
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    cleanupRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceId]);

  function cleanupRecording() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      try {
        mediaRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    mediaRef.current = null;
  }

  function startMeter(stream: MediaStream) {
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const bands = 5;
        const slice = Math.floor(data.length / bands);
        const next: number[] = [];
        for (let i = 0; i < bands; i += 1) {
          let sum = 0;
          for (let j = 0; j < slice; j += 1) sum += data[i * slice + j] || 0;
          next.push(Math.max(0.15, Math.min(1, sum / slice / 140)));
        }
        setLevels(next);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setLevels([0.4, 0.7, 0.55, 0.85, 0.5]);
    }
  }

  async function start() {
    if (!supported || recording) return;
    setFeedback(null);
    setFeedbackError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : undefined;
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      chunks.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setAudioBlob(blob);
        setAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        if (audioCtxRef.current) {
          void audioCtxRef.current.close().catch(() => undefined);
          audioCtxRef.current = null;
        }
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
      mediaRef.current = recorder;
      recorder.start(250);
      setRecording(true);
      setElapsed(0);
      startMeter(stream);
      timerRef.current = window.setInterval(() => {
        setElapsed((n) => {
          const next = n + 1;
          if (next >= maxSeconds) {
            window.setTimeout(() => stop(), 0);
          }
          return Math.min(next, maxSeconds);
        });
      }, 1000);
    } catch {
      setSupported(false);
    }
  }

  function stop() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
    setRecording(false);
  }

  async function analyze() {
    if (!audioBlob || analyzing) return;
    setAnalyzing(true);
    setFeedbackError(null);
    try {
      const form = new FormData();
      form.append("audio", audioBlob, "sprechen.webm");
      form.append("sourceId", sourceId);
      form.append("prompt", prompt);
      form.append("level", level);
      form.append("notes", notes);

      const res = await fetch("/api/exam/speak", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedbackError(data.error || "Feedback indisponible");
        return;
      }
      if (data.unavailable) {
        setFeedbackError(
          data.message ||
            "Feedback IA indisponible (cle OpenAI absente). Tu peux quand meme valider.",
        );
        return;
      }
      setFeedback(data.feedback as Feedback);
    } catch {
      setFeedbackError("Reseau indisponible pour le feedback.");
    } finally {
      setAnalyzing(false);
    }
  }

  const remaining = Math.max(0, maxSeconds - elapsed);
  const canComplete = notes.trim().length >= 20 && Boolean(audioBlob) && !recording;
  const mm = String(Math.floor(remaining / 60)).padStart(1, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--forest-soft)]/55 px-4 py-4 lg:px-5">
        <p className="eyebrow">Sprechen · Pratique orale</p>
        <p className="mt-1 text-[1.05rem] font-semibold text-[var(--forest-deep)]">
          {title}
        </p>
        <p className="mt-1 text-[0.95rem] text-[var(--ink-soft)]">
          Notes + enregistrement local (max {Math.round(maxSeconds / 60)} min).
          Feedback entraineur optionnel, pas une note officielle.
        </p>
      </div>

      <textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={6}
        placeholder="Stichpunkte de preparation (min. 20 caracteres)..."
        className="w-full rounded-[1.25rem] border border-[var(--line)] bg-white/90 px-4 py-3 text-[1.02rem] outline-none focus:border-[var(--forest)] focus:ring-4 focus:ring-[rgba(26,107,72,0.12)]"
      />

      <div
        className={`rounded-[1.4rem] border px-4 py-4 ${
          recording
            ? "border-[var(--danger)] bg-[rgba(220,80,80,0.06)]"
            : "border-dashed border-[var(--line)] bg-white/70"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-[var(--forest-deep)]">Micro</p>
            <p className="mt-1 text-[0.92rem] text-[var(--ink-soft)]">
              {recording
                ? `${mm}:${ss} restantes`
                : audioBlob
                  ? `Prise enregistree (${elapsed || "?"} s). Tu peux reecouter ou recommencer.`
                  : `Temps limite : ${Math.round(maxSeconds / 60)} min.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!recording ? (
              <Button
                type="button"
                variant="secondary"
                onClick={start}
                disabled={!supported}
              >
                {audioBlob ? "Reenregistrer" : "Enregistrer"}
              </Button>
            ) : (
              <Button type="button" variant="danger" onClick={stop}>
                Stop
              </Button>
            )}
          </div>
        </div>
        {recording ? (
          <RecordingLive
            levels={levels}
            label={`Enregistrement... ${mm}:${ss} restantes`}
          />
        ) : null}
        {!supported ? (
          <p className="mt-3 text-[0.95rem] text-[var(--warn)]">
            Micro non disponible sur cet appareil.
          </p>
        ) : null}
        {audioUrl && !recording ? (
          <audio className="mt-4 w-full" controls src={audioUrl} preload="metadata" />
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          className="sm:flex-1"
          disabled={!audioBlob || recording || analyzing}
          onClick={analyze}
        >
          {analyzing ? "Analyse..." : "Analyser (feedback IA)"}
        </Button>
        <Button
          type="button"
          className="sm:flex-1"
          disabled={!canComplete || busy}
          onClick={onComplete}
        >
          Marquer comme pret
        </Button>
      </div>

      {feedbackError ? (
        <p className="text-[0.95rem] text-[var(--warn)]">{feedbackError}</p>
      ) : null}

      {feedback ? (
        <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--forest-soft)]/40 px-4 py-4">
          <p className="eyebrow">Feedback entraineur</p>
          <p className="mt-2 text-[1.15rem] font-semibold text-[var(--forest-deep)]">
            {feedback.total}/20
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[0.92rem] sm:grid-cols-4">
            <ScoreChip label="Aufgabe" value={feedback.scores.aufgabe} />
            <ScoreChip label="Inhalt" value={feedback.scores.inhalt} />
            <ScoreChip label="Sprache" value={feedback.scores.sprache} />
            <ScoreChip label="Struktur" value={feedback.scores.struktur} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <BulletBlock title="Points forts" items={feedback.strengths} />
            <BulletBlock title="A ameliorer" items={feedback.improvements} />
          </div>
          {feedback.reformulation ? (
            <p className="mt-3 text-[0.98rem] leading-relaxed text-[var(--ink)]">
              <span className="font-semibold">Reformulation : </span>
              {feedback.reformulation}
            </p>
          ) : null}
          {feedback.transcript ? (
            <details className="mt-3">
              <summary className="cursor-pointer text-[0.95rem] font-semibold text-[var(--forest-deep)]">
                Transcription
              </summary>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-[var(--ink-soft)]">
                {feedback.transcript}
              </p>
            </details>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1rem] bg-white/80 px-3 py-2 text-center">
      <p className="text-[0.8rem] text-[var(--ink-faint)]">{label}</p>
      <p className="font-semibold text-[var(--forest-deep)]">{value}/5</p>
    </div>
  );
}

function BulletBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="font-semibold text-[var(--forest-deep)]">{title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-[0.95rem] text-[var(--ink-soft)]">
        {(items || []).slice(0, 3).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
