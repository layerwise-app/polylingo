/**
 * Sound effects, synthesized in the browser so there are no audio files to
 * license. Speech clips are separate: see `src/lib/speech-player.ts`.
 */

type Note = {
  frequency: number;
  start: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  /** Slides the pitch to this frequency over the note. */
  slideTo?: number;
};

export type SoundName =
  | 'tap'
  | 'correct'
  | 'wrong'
  | 'match'
  | 'heart'
  | 'complete'
  | 'reward';

const sounds: Record<SoundName, Note[]> = {
  tap: [{ frequency: 520, start: 0, duration: 0.05, volume: 0.08 }],
  correct: [
    { frequency: 660, start: 0, duration: 0.11, type: 'triangle' },
    { frequency: 880, start: 0.1, duration: 0.2, type: 'triangle' }
  ],
  wrong: [
    {
      frequency: 220,
      slideTo: 150,
      start: 0,
      duration: 0.28,
      type: 'sawtooth',
      volume: 0.07
    }
  ],
  match: [
    { frequency: 784, start: 0, duration: 0.07, type: 'triangle' },
    { frequency: 1047, start: 0.06, duration: 0.1, type: 'triangle' }
  ],
  heart: [
    { frequency: 392, slideTo: 262, start: 0, duration: 0.24, type: 'sine' }
  ],
  complete: [
    { frequency: 523, start: 0, duration: 0.13, type: 'triangle' },
    { frequency: 659, start: 0.12, duration: 0.13, type: 'triangle' },
    { frequency: 784, start: 0.24, duration: 0.13, type: 'triangle' },
    { frequency: 1047, start: 0.36, duration: 0.4, type: 'triangle' }
  ],
  reward: [
    { frequency: 880, start: 0, duration: 0.09, type: 'sine' },
    { frequency: 1319, start: 0.08, duration: 0.2, type: 'sine' }
  ]
};

let context: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function playSound(name: SoundName): void {
  if (!enabled || typeof window === 'undefined') return;
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    const now = context.currentTime;
    for (const note of sounds[name]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = note.type ?? 'sine';
      oscillator.frequency.setValueAtTime(note.frequency, now + note.start);
      if (note.slideTo) {
        oscillator.frequency.linearRampToValueAtTime(
          note.slideTo,
          now + note.start + note.duration
        );
      }
      const volume = note.volume ?? 0.14;
      gain.gain.setValueAtTime(0.0001, now + note.start);
      gain.gain.exponentialRampToValueAtTime(volume, now + note.start + 0.012);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + note.start + note.duration
      );
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + note.start);
      oscillator.stop(now + note.start + note.duration + 0.02);
    }
  } catch {
    // Sound is a nicety. A browser that refuses it shouldn't break the lesson.
  }
}
