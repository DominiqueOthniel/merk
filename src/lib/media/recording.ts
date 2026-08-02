export function isAppleMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod/i.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
}

export function isSafariLike(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  return /Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox/i.test(ua);
}

export function canRecordAudio(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia
  );
}

/** Prefere mp4 sur Apple (webm souvent casse / absent). */
export function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const appleFirst = [
    "audio/mp4",
    "audio/aac",
    "audio/wav",
    "audio/webm;codecs=opus",
    "audio/webm",
  ];
  const otherFirst = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/aac",
  ];
  const list = isAppleMobile() || isSafariLike() ? appleFirst : otherFirst;
  return list.find((t) => MediaRecorder.isTypeSupported(t));
}

export function recorderFileExtension(mime: string | undefined): string {
  if (!mime) return "webm";
  if (mime.includes("mp4") || mime.includes("aac") || mime.includes("m4a")) {
    return "m4a";
  }
  if (mime.includes("wav")) return "wav";
  return "webm";
}

export async function getMicStream(): Promise<MediaStream> {
  // Contraintes simples = plus compatible iOS
  return navigator.mediaDevices.getUserMedia({ audio: true });
}

export function startMediaRecorder(
  stream: MediaStream,
  mimeType: string | undefined,
  onData: (blob: Blob) => void,
  onError: (message: string) => void,
): MediaRecorder {
  let recorder: MediaRecorder;
  try {
    recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
  } catch {
    recorder = new MediaRecorder(stream);
  }

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) onData(e.data);
  };
  recorder.onerror = () => {
    onError("Erreur pendant l enregistrement. Reessaie ou change de navigateur.");
  };

  // timeslice casse souvent Safari / iOS : un seul chunk au stop
  if (isAppleMobile() || isSafariLike()) {
    recorder.start();
  } else {
    recorder.start(250);
  }
  return recorder;
}

export function stopMediaRecorder(recorder: MediaRecorder | null) {
  if (!recorder || recorder.state === "inactive") return;
  try {
    if (typeof recorder.requestData === "function" && recorder.state === "recording") {
      recorder.requestData();
    }
  } catch {
    /* ignore */
  }
  try {
    recorder.stop();
  } catch {
    /* ignore */
  }
}
