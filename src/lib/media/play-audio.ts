/** Lecture audio mobile : preferer un <audio> DOM + meme origine (proxy). */

export function isLikelyIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function applyInlinePlayback(audio: HTMLAudioElement) {
  audio.setAttribute("playsinline", "true");
  audio.setAttribute("webkit-playsinline", "true");
  (audio as HTMLAudioElement & { playsInline?: boolean }).playsInline = true;
  audio.preload = "auto";
  // Ne pas forcer crossOrigin sur meme origine / blob (casse iOS)
  if (/^https?:/i.test(audio.src) && !audio.src.startsWith(window.location.origin)) {
    audio.crossOrigin = "anonymous";
  } else {
    audio.removeAttribute("crossorigin");
  }
}

export function proxyAudioUrl(remoteUrl: string): string {
  return `/api/exam/audio?url=${encodeURIComponent(remoteUrl)}`;
}

/** Joue via un element <audio> deja dans le DOM (meilleure compat iOS/Android). */
export async function playDomAudio(
  audio: HTMLAudioElement,
  url: string,
): Promise<void> {
  applyInlinePlayback(audio);
  if (audio.src !== url) {
    audio.src = url;
  }
  try {
    audio.load();
  } catch {
    /* ignore */
  }
  try {
    await audio.play();
  } catch {
    // Deuxieme tentative apres canplay (Safari)
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error("timeout")), 12000);
      const onReady = () => {
        window.clearTimeout(timer);
        void audio
          .play()
          .then(() => resolve())
          .catch(reject);
      };
      audio.addEventListener("canplay", onReady, { once: true });
      audio.addEventListener(
        "error",
        () => {
          window.clearTimeout(timer);
          reject(new Error("audio error"));
        },
        { once: true },
      );
      try {
        audio.load();
      } catch {
        /* ignore */
      }
    });
  }
}

/** @deprecated Prefer playDomAudio with a mounted element */
export function createMobileAudio(url: string): HTMLAudioElement {
  const audio = new Audio();
  applyInlinePlayback(audio);
  audio.src = url;
  return audio;
}

/** @deprecated Prefer playDomAudio */
export function playAudioUrl(
  url: string,
  opts: {
    timeoutMs?: number;
    onEnded?: () => void;
    onError?: () => void;
  } = {},
): Promise<HTMLAudioElement> {
  const timeoutMs = opts.timeoutMs ?? 15000;
  return new Promise((resolve, reject) => {
    let settled = false;
    const audio = createMobileAudio(url);
    const finishOk = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(audio);
    };
    const finishErr = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      opts.onError?.();
      reject(new Error("play failed"));
    };
    const timer = window.setTimeout(finishErr, timeoutMs);
    audio.onended = () => opts.onEnded?.();
    audio.onerror = finishErr;
    void audio.play().then(finishOk).catch(() => {
      audio.addEventListener(
        "canplay",
        () => {
          void audio.play().then(finishOk).catch(finishErr);
        },
        { once: true },
      );
      audio.load();
    });
  });
}
