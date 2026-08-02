"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RecordingLive } from "@/components/ui/recording-live";

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return undefined;
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus";
  }
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  return undefined;
}

export function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState<number[]>([0.2, 0.2, 0.2, 0.2, 0.2]);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setSupported(false);
    }
    return () => {
      cleanup();
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
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
      // fallback: bars animes sans niveau micro
      setLevels([0.4, 0.7, 0.55, 0.85, 0.5]);
    }
  }

  async function start() {
    if (!supported || recording) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;
      const mime = pickMimeType();
      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
      chunks.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      recorder.onerror = () => {
        setError("Erreur pendant l enregistrement.");
        setRecording(false);
        cleanup();
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || mime || "audio/webm";
        const blob = new Blob(chunks.current, { type });
        if (blob.size < 200) {
          setError("Enregistrement vide. Verifie le micro et reessaie.");
        } else {
          const objectUrl = URL.createObjectURL(blob);
          setUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return objectUrl;
          });
        }
        cleanup();
      };
      mediaRef.current = recorder;
      recorder.start(200);
      setRecording(true);
      setElapsed(0);
      startMeter(stream);
      timerRef.current = window.setInterval(() => {
        setElapsed((n) => n + 1);
      }, 1000);
    } catch {
      setSupported(false);
      setError("Micro refuse ou indisponible. Autorise l acces micro du navigateur.");
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

  const mm = String(Math.floor(elapsed / 60)).padStart(1, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

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
        <p className="eyebrow">{recording ? "Enregistrement" : "Production orale"}</p>
      </div>
      <p className="mt-2 text-[1.02rem] leading-relaxed text-[var(--ink-soft)]">
        {recording
          ? `Parle maintenant... ${mm}:${ss}`
          : url
            ? "Prise enregistree. Reecoute ou recommence."
            : "Enregistre ta reponse a voix haute, puis reecoute."}
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
        <audio className="mt-4 w-full" controls src={url} preload="metadata" />
      ) : null}
    </div>
  );
}
