"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RecordingLive } from "@/components/ui/recording-live";
import {
  canRecordAudio,
  getMicStream,
  pickRecorderMimeType,
  recorderFileExtension,
  startMediaRecorder,
  stopMediaRecorder,
} from "@/lib/media/recording";

export function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState<number[]>([0.25, 0.45, 0.35, 0.55, 0.4]);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mimeRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    setSupported(canRecordAudio());
    return () => {
      cleanup(false);
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup(stopTracks = true) {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
    if (stopTracks) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  async function startMeter(stream: MediaStream) {
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) {
        setLevels([0.4, 0.7, 0.55, 0.85, 0.5]);
        return;
      }
      const ctx = new AC();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();
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
    setError(null);
    try {
      if (!canRecordAudio()) {
        setSupported(false);
        setError("Enregistrement non supporté sur ce navigateur mobile.");
        return;
      }

      const stream = await getMicStream();
      streamRef.current = stream;
      const mime = pickRecorderMimeType();
      mimeRef.current = mime;
      chunks.current = [];

      const recorder = startMediaRecorder(
        stream,
        mime,
        (blob) => chunks.current.push(blob),
        (message) => {
          setError(message);
          setRecording(false);
          cleanup(true);
        },
      );

      recorder.onstop = () => {
        const type = recorder.mimeType || mime || "audio/mp4";
        const blob = new Blob(chunks.current, { type });
        if (blob.size < 50) {
          setError("Enregistrement vide. Autorise le micro puis reessaie.");
        } else {
          const objectUrl = URL.createObjectURL(blob);
          setUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return objectUrl;
          });
        }
        cleanup(true);
      };

      mediaRef.current = recorder;
      setRecording(true);
      setElapsed(0);
      void startMeter(stream);
      timerRef.current = window.setInterval(() => {
        setElapsed((n) => n + 1);
      }, 1000);
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      setSupported(name !== "NotAllowedError");
      setError(
        name === "NotAllowedError"
          ? "Micro refuse. Autorise le micro dans les reglages du navigateur / Safari."
          : "Micro indisponible sur cet appareil.",
      );
      cleanup(true);
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
    stopMediaRecorder(mediaRef.current);
    setRecording(false);
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(1, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const ext = recorderFileExtension(mimeRef.current);

  return (
    <div
      className={`rounded-[1.5rem] border px-4 py-4 transition ${
        recording
          ? "border-[var(--danger)] bg-[rgba(220,80,80,0.08)]"
          : "border-dashed border-[var(--line)] bg-[rgba(216,235,224,0.45)]"
      }`}
    >
      <div className="flex items-center gap-2">
        {recording ? (
          <span className="rec-dot inline-block h-2.5 w-2.5 rounded-full bg-[var(--danger)]" />
        ) : null}
        <p className="eyebrow">
          {recording ? "Enregistrement" : "Oral optionnel"}
        </p>
      </div>
      <p className="mt-2 text-[1.02rem] leading-relaxed text-[var(--ink-soft)]">
        {recording
          ? `Parle maintenant... ${mm}:${ss}`
          : url
            ? `Prise enregistree (${ext}). Reecoute ou recommence.`
            : "Dis la reponse a voix haute pour t entrainer. Ca ne remplace pas la saisie."}
      </p>

      {recording ? (
        <RecordingLive levels={levels} label={`Parle maintenant... ${mm}:${ss}`} />
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!recording ? (
          <Button type="button" variant="secondary" onClick={start} disabled={!supported}>
            {url ? "Reenregistrer" : "Enregistrer"}
          </Button>
        ) : (
          <Button type="button" variant="danger" onClick={stop}>
            Stop
          </Button>
        )}
        {!supported && !error ? (
          <span className="text-[0.95rem] text-[var(--warn)]">Micro non disponible</span>
        ) : null}
      </div>
      {error ? (
        <p className="mt-3 text-[0.95rem] text-[var(--danger)]">{error}</p>
      ) : null}
      {url && !recording ? (
        <audio className="mt-4 w-full" controls playsInline preload="metadata" src={url} />
      ) : null}
    </div>
  );
}
