import { audioKey, wordKey } from '~/content/speech';

/**
 * Plays the pre-generated Spanish clips listed in `/audio/manifest.json`.
 * Nothing here calls a text-to-speech service.
 */

export type SpeechSpeed = 'normal' | 'slow';

type Manifest = {
  clips: Record<string, { normal: string; slow: string }>;
};

let manifestPromise: Promise<Manifest> | null = null;
let current: HTMLAudioElement | null = null;

function loadManifest(): Promise<Manifest> {
  manifestPromise ??= fetch('/audio/manifest.json')
    .then((response) => {
      if (!response.ok) throw new Error('Audio manifest failed to load');
      return response.json() as Promise<Manifest>;
    })
    .catch((error: unknown) => {
      manifestPromise = null;
      throw error;
    });
  return manifestPromise;
}

function findClip(manifest: Manifest, text: string) {
  return manifest.clips[audioKey(text)] ?? manifest.clips[wordKey(text)];
}

/** Resolves with whether a clip actually played. */
export async function playSpeech(
  text: string,
  speed: SpeechSpeed = 'normal'
): Promise<boolean> {
  try {
    const clip = findClip(await loadManifest(), text);
    if (!clip) return false;
    current?.pause();
    current = new Audio(clip[speed]);
    await current.play();
    return true;
  } catch {
    // Browsers can refuse playback until the first tap. The replay button still works.
    return false;
  }
}

/** Downloads clips ahead of time so audio starts instantly during the lesson. */
export async function preloadSpeech(texts: string[]): Promise<void> {
  try {
    const manifest = await loadManifest();
    for (const text of texts) {
      const clip = findClip(manifest, text);
      if (!clip) continue;
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = clip.normal;
    }
  } catch {
    // Clips also load when they're played.
  }
}
