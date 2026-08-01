// Web Audio API Sound Effects Synthesizer for Black Spider UI

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

// Initialize sound preference from localStorage if available
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('black_spider_sound_enabled');
  if (saved !== null) {
    soundEnabled = saved === 'true';
  }
}

function getAudioContext(): AudioContext | null {
  if (!soundEnabled) return null;
  
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      // Don't instantiate until we actually need to play something, 
      // but only if the user has interacted
      if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
          return null; // Don't create if no user gesture yet to prevent warning
      }
      try {
        audioCtx = new AudioContextClass();
      } catch (e) {
        return null;
      }
    }
  }
  
  if (audioCtx && audioCtx.state === 'suspended') {
    // Only attempt to resume if there's been user interaction
    if (navigator.userActivation && navigator.userActivation.hasBeenActive) {
      audioCtx.resume().catch(() => {});
    } else {
      return null;
    }
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('black_spider_sound_enabled', enabled ? 'true' : 'false');
  }
}

export function toggleSound(): boolean {
  setSoundEnabled(!soundEnabled);
  return soundEnabled;
}

/**
 * Crisp subtle mechanical UI click sound effect
 */
export function playClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {
    // Ignore audio context errors
  }
}

/**
 * Ultra soft micro hover pip
 */
export function playHoverSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.02);

    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.02);
  } catch (e) {
    // Ignore audio context errors
  }
}

/**
 * Magnet Download / Action Success Sound Effect
 */
export function playDownloadSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.08); // G5
    gain2.gain.setValueAtTime(0.18, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.25);
  } catch (e) {
    // Ignore
  }
}

/**
 * Open details / Sci-Fi sweep sound effect
 */
export function playOpenSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  } catch (e) {
    // Ignore
  }
}

/**
 * Carousel / Row scroll button tick
 */
export function playScrollSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.03);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  } catch (e) {
    // Ignore
  }
}

/**
 * Preloader launch chime
 */
export function playPreloaderLaunchSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Deep bass hum
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(110, now);
    sub.frequency.exponentialRampToValueAtTime(220, now + 0.4);
    subGain.gain.setValueAtTime(0.15, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 0.5);

    // High shimmer
    const high = ctx.createOscillator();
    const highGain = ctx.createGain();
    high.type = 'sine';
    high.frequency.setValueAtTime(880, now + 0.1);
    high.frequency.exponentialRampToValueAtTime(1320, now + 0.4);
    highGain.gain.setValueAtTime(0.08, now + 0.1);
    highGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    high.connect(highGain);
    highGain.connect(ctx.destination);
    high.start(now + 0.1);
    high.stop(now + 0.5);
  } catch (e) {
    // Ignore
  }
}
