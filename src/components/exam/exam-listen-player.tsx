"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  script: string;
  title: string;
  maxPlays?: number;
};

export function ExamListenPlayer({ script, title, maxPlays = 2 }: Props) {
  const [playsLeft, setPlaysLeft] = useState(maxPlays);
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "done">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      stopAll();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopAll() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utterRef.current = null;
  }

  function pickGermanVoice(): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => /de(-|_|$)/i.test(v.lang) && /female|anna|petra|heda|google/i.test(v.name)) ||
      voices.find((v) => /de(-|_|$)/i.test(v.lang)) ||
      null
    );
  }

  function playBrowser(text: string) {
    if (!("speechSynthesis" in window)) {
      setError("Lecture vocale indisponible sur cet appareil.");
      setStatus("idle");
      return;
    }

    const speak = () => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "de-DE";
      utter.rate = 0.92;
      const voice = pickGermanVoice();
      if (voice) utter.voice = voice;
      utter.onend = () => setStatus("done");
      utter.onerror = () => {
        setError("Lecture interrompue.");
        setStatus("idle");
      };
      utterRef.current = utter;
      setStatus("playing");
      window.speechSynthesis.speak(utter);
    };

    // Chrome charge les voix en async
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) {
      window.speechSynthesis.onvoiceschanged = () => speak();
      window.speechSynthesis.getVoices();
    }
    speak();
  }

  async function play() {
    if (playsLeft <= 0 || status === "loading" || status === "playing") return;
    setError(null);
    setStatus("loading");
    stopAll();

    try {
      const res = await fetch("/api/exam/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: script }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (res.ok && contentType.includes("audio")) {
        const blob = await res.blob();
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setStatus("done");
        audio.onerror = () => {
          setError("Lecture audio impossible.");
          setStatus("idle");
        };
        setPlaysLeft((n) => n - 1);
        setStatus("playing");
        await audio.play();
        return;
      }

      const data = (await res.json()) as { mode?: string; text?: string; error?: string };
      if (data.mode === "browser" && data.text) {
        setPlaysLeft((n) => n - 1);
        playBrowser(data.text);
        return;
      }

      setError(data.error || "Audio indisponible");
      setStatus("idle");
    } catch {
      setError("Reseau indisponible pour l audio.");
      setStatus("idle");
    }
  }

  function stop() {
    stopAll();
    setStatus("idle");
  }

  return (
    <div className="rounded-[1.4rem] border border-[var(--line)] bg-[var(--forest-soft)]/55 px-4 py-4 lg:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Horen · Audio</p>
          <p className="mt-1 text-[1.05rem] font-semibold text-[var(--forest-deep)]">
            {title}
          </p>
          <p className="mt-1 text-[0.95rem] text-[var(--ink-soft)]">
            Ecoute le texte, puis reponds. {playsLeft} ecoute
            {playsLeft > 1 ? "s" : ""} restante{playsLeft > 1 ? "s" : ""}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {status === "playing" ? (
            <Button type="button" variant="secondary" onClick={stop}>
              Pause
            </Button>
          ) : (
            <Button
              type="button"
              onClick={play}
              disabled={playsLeft <= 0 || status === "loading"}
            >
              {status === "loading"
                ? "Preparation..."
                : playsLeft <= 0
                  ? "Ecoutes epuisees"
                  : "Ecouter"}
            </Button>
          )}
        </div>
      </div>
      {error ? (
        <p className="mt-3 text-[0.95rem] text-[var(--danger)]">{error}</p>
      ) : null}
      {status === "playing" ? (
        <p className="mt-3 text-[0.92rem] font-medium text-[var(--forest)]">
          Lecture en cours...
        </p>
      ) : null}
    </div>
  );
}
