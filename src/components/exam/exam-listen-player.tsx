"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  applyInlinePlayback,
  isLikelyIOS,
  playDomAudio,
  proxyAudioUrl,
} from "@/lib/media/play-audio";

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
  const [hint, setHint] = useState<string | null>(null);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const countedPlayRef = useRef(false);

  useEffect(() => {
    stopPlayback();
    setPlaysLeft(maxPlays);
    setStatus("idle");
    setError(null);
    setMode(null);
    setHint(null);
    countedPlayRef.current = false;
    if (playerRef.current) {
      applyInlinePlayback(playerRef.current);
      playerRef.current.removeAttribute("src");
      try {
        playerRef.current.load();
      } catch {
        /* ignore */
      }
    }
  }, [audioUrl, script, title, maxPlays]);

  useEffect(() => {
    return () => {
      stopPlayback();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function stopPlayback() {
    const el = playerRef.current;
    if (el) {
      try {
        el.pause();
      } catch {
        /* ignore */
      }
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function markPlayStarted(nextMode: "source" | "tts") {
    if (!countedPlayRef.current) {
      countedPlayRef.current = true;
      setPlaysLeft((n) => Math.max(0, n - 1));
    }
    setMode(nextMode);
    setStatus("playing");
    setError(null);
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
        setError("Lecture interrompue. Utilise le lecteur ci-dessous.");
        setStatus("idle");
      };
      markPlayStarted("tts");
      window.speechSynthesis.speak(utter);
    };
    if (!window.speechSynthesis.getVoices().length) {
      window.speechSynthesis.onvoiceschanged = () => speak();
      window.speechSynthesis.getVoices();
    }
    speak();
  }

  async function playOnElement(url: string, nextMode: "source" | "tts") {
    const el = playerRef.current;
    if (!el) throw new Error("no player");
    await playDomAudio(el, url);
    markPlayStarted(nextMode);
  }

  async function prepareTtsBlob(text: string): Promise<string | null> {
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
      return url;
    }
    const data = (await res.json()) as {
      mode?: string;
      text?: string;
      error?: string;
    };
    if (data.mode === "browser" && data.text) {
      playBrowser(data.text);
      return null;
    }
    throw new Error(data.error || "Audio indisponible");
  }

  async function play() {
    if (playsLeft <= 0 || status === "loading" || status === "playing") return;
    setError(null);
    setHint(null);
    setStatus("loading");
    countedPlayRef.current = false;
    stopPlayback();

    try {
      if (audioUrl) {
        const proxied = proxyAudioUrl(audioUrl);
        try {
          await playOnElement(proxied, "source");
          return;
        } catch {
          try {
            await playOnElement(audioUrl, "source");
            return;
          } catch {
            /* fall through to TTS */
          }
        }
      }

      if (script.trim()) {
        try {
          const url = await prepareTtsBlob(script);
          if (!url) {
            // browser TTS deja lance
            return;
          }
          try {
            await playOnElement(url, "tts");
            return;
          } catch {
            setHint(
              isLikelyIOS()
                ? "Sur iPhone, appuie sur lecture dans le lecteur audio ci-dessous."
                : "Appuie sur lecture dans le lecteur audio ci-dessous.",
            );
            setStatus("idle");
            setMode("tts");
            return;
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : "Audio indisponible");
          setStatus("idle");
          return;
        }
      }

      setError(
        audioUrl
          ? "Audio source indisponible pour le moment."
          : "Audio indisponible",
      );
      setStatus("idle");
    } catch {
      setError("Reseau indisponible pour l audio.");
      setStatus("idle");
    }
  }

  function stop() {
    stopPlayback();
    setStatus("idle");
  }

  const sourceHint = audioUrl
    ? "Audio original quand disponible, sinon synthese vocale."
    : "Synthese vocale (pas d audio original pour cet exercice).";

  return (
    <div className="exam-listen rounded-[1.4rem] border border-[var(--line)] bg-[var(--forest-soft)]/55 px-4 py-4 lg:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
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
              onClick={() => void play()}
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

      <audio
        ref={playerRef}
        className="exam-listen__player mt-4 w-full"
        controls
        playsInline
        preload="metadata"
        onPlay={() => {
          if (status !== "playing") {
            markPlayStarted(mode ?? (audioUrl ? "source" : "tts"));
          }
          setHint(null);
        }}
        onPause={() => {
          if (status === "playing") setStatus("idle");
        }}
        onEnded={() => setStatus("done")}
        onError={() => {
          if (status === "loading" || status === "playing") {
            setError("Lecture impossible. Reessaie Ecouter ou le bouton play.");
            setStatus("idle");
          }
        }}
      />

      {error ? (
        <p className="mt-3 text-[0.95rem] text-[var(--danger)]">{error}</p>
      ) : null}
      {hint ? (
        <p className="mt-3 text-[0.95rem] text-[var(--forest-deep)]">{hint}</p>
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
