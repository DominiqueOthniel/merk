"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { playAudioUrl, proxyAudioUrl } from "@/lib/media/play-audio";

type Props = {
  script: string;
  title: string;
  audioUrl?: string | null;
  maxPlays?: number;
};

export function ExamListenPlayer({
  script,
  title,
  audioUrl = null,
  maxPlays = 2,
}: Props) {
  const [playsLeft, setPlaysLeft] = useState(maxPlays);
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "done">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"source" | "tts" | null>(null);
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    stopAll();
    setPlaysLeft(maxPlays);
    setStatus("idle");
    setError(null);
    setMode(null);
    setFallbackSrc(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl, script, title, maxPlays]);

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
      try {
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      } catch {
        /* ignore */
      }
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
      voices.find(
        (v) =>
          /de(-|_|$)/i.test(v.lang) &&
          /female|anna|petra|heda|google/i.test(v.name),
      ) ||
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
        setError("Lecture interrompue. Reessaie avec le bouton Ecouter.");
        setStatus("idle");
      };
      utterRef.current = utter;
      setMode("tts");
      setStatus("playing");
      window.speechSynthesis.speak(utter);
    };

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) {
      window.speechSynthesis.onvoiceschanged = () => speak();
      window.speechSynthesis.getVoices();
    }
    speak();
  }

  async function playFromUrl(url: string, nextMode: "source" | "tts"): Promise<boolean> {
    try {
      const audio = await playAudioUrl(url, {
        onEnded: () => setStatus("done"),
      });
      audioRef.current = audio;
      setMode(nextMode);
      setPlaysLeft((n) => n - 1);
      setStatus("playing");
      setFallbackSrc(null);
      return true;
    } catch {
      setFallbackSrc(url);
      return false;
    }
  }

  async function playTts(text: string): Promise<boolean> {
    if (!text.trim()) return false;

    const res = await fetch("/api/exam/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const contentType = res.headers.get("content-type") || "";

    if (res.ok && contentType.includes("audio")) {
      const blob = await res.blob();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const ok = await playFromUrl(url, "tts");
      if (ok) return true;
      // iOS a parfois besoin d un 2e tap sur le lecteur natif
      setFallbackSrc(url);
      setMode("tts");
      setError("Tape lecture sur le lecteur audio ci-dessous (requis sur certains mobiles).");
      return false;
    }

    const data = (await res.json()) as {
      mode?: string;
      text?: string;
      error?: string;
    };
    if (data.mode === "browser" && data.text) {
      setPlaysLeft((n) => n - 1);
      playBrowser(data.text);
      return true;
    }

    setError(data.error || "Audio indisponible");
    return false;
  }

  async function play() {
    if (playsLeft <= 0 || status === "loading" || status === "playing") return;
    setError(null);
    setFallbackSrc(null);
    setStatus("loading");
    stopAll();

    try {
      if (audioUrl) {
        const proxied = proxyAudioUrl(audioUrl);
        const ok = await playFromUrl(proxied, "source");
        if (ok) return;
        // fallback direct puis TTS
        const direct = await playFromUrl(audioUrl, "source");
        if (direct) return;
      }

      if (script.trim()) {
        const ok = await playTts(script);
        if (ok) return;
        // playTts a pu afficher un lecteur natif (fallback iOS)
        setStatus("idle");
        return;
      }
      if (audioUrl) {
        setError("Audio source indisponible pour le moment.");
      } else {
        setError("Audio indisponible");
      }
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

  const sourceHint = audioUrl
    ? "Audio original quand disponible, sinon synthese vocale."
    : "Synthese vocale (pas d audio original pour cet exercice).";

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
          <p className="mt-1 text-[0.88rem] text-[var(--ink-soft)]">{sourceHint}</p>
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
      {fallbackSrc ? (
        <audio
          className="mt-3 w-full"
          controls
          playsInline
          preload="auto"
          src={fallbackSrc}
          onPlay={() => {
            if (playsLeft > 0 && status !== "playing") {
              setPlaysLeft((n) => Math.max(0, n - 1));
            }
            setStatus("playing");
            setError(null);
          }}
          onEnded={() => setStatus("done")}
        />
      ) : null}
      {status === "playing" ? (
        <p className="mt-3 text-[0.92rem] font-medium text-[var(--forest)]">
          Lecture en cours
          {mode === "source"
            ? " (audio original)..."
            : mode === "tts"
              ? " (synthese)..."
              : "..."}
        </p>
      ) : null}
    </div>
  );
}
