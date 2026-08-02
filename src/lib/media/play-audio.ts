/** Lecture audio compatible mobile (iOS playsInline + geste utilisateur). */

export function createMobileAudio(url: string): HTMLAudioElement {
  const audio = new Audio();
  audio.preload = "auto";
  audio.setAttribute("playsinline", "true");
  audio.setAttribute("webkit-playsinline", "true");
  (audio as HTMLAudioElement & { playsInline?: boolean }).playsInline = true;
  // crossOrigin seulement pour http(s) distant ; casse les blob: sur iOS
  if (/^https?:/i.test(url)) {
    audio.crossOrigin = "anonymous";
  }
  audio.src = url;
  return audio;
}

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
      try {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      } catch {
        /* ignore */
      }
      reject(new Error("play failed"));
    };

    const timer = window.setTimeout(finishErr, timeoutMs);
    audio.onended = () => opts.onEnded?.();
    audio.onerror = () => {
      opts.onError?.();
      finishErr();
    };

    // Sur iOS, play() doit rester proche du tap ; on ne attend pas canplay.
    void audio
      .play()
      .then(finishOk)
      .catch(() => {
        const retry = () => {
          void audio
            .play()
            .then(finishOk)
            .catch(finishErr);
        };
        audio.addEventListener("canplay", retry, { once: true });
        audio.load();
      });
  });
}

export function proxyAudioUrl(remoteUrl: string): string {
  return `/api/exam/audio?url=${encodeURIComponent(remoteUrl)}`;
}
