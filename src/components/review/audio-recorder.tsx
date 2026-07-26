"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.mediaDevices) {
      setSupported(false);
    }
  }, []);

  async function start() {
    if (!supported) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunks.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const objectUrl = URL.createObjectURL(blob);
        setUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return objectUrl;
        });
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setSupported(false);
    }
  }

  function stop() {
    mediaRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[rgba(216,235,224,0.45)] px-4 py-4">
      <p className="eyebrow">Production orale</p>
      <p className="mt-2 text-[1.02rem] leading-relaxed text-[var(--ink-soft)]">
        Enregistre-toi (evaluation auto en V2).
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!recording ? (
          <Button type="button" variant="secondary" onClick={start} disabled={!supported}>
            Enregistrer
          </Button>
        ) : (
          <Button type="button" variant="danger" onClick={stop}>
            Stop
          </Button>
        )}
        {!supported ? (
          <span className="text-[0.95rem] text-[var(--warn)]">Micro non disponible</span>
        ) : null}
      </div>
      {url ? <audio className="mt-4 w-full" controls src={url} /> : null}
    </div>
  );
}
