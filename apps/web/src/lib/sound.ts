/**
 * Simple sound effects using Web Audio API
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export function playPickSound() {
  playTone(600, 0.1, "sine", 0.12);
  setTimeout(() => playTone(800, 0.08, "sine", 0.1), 50);
}

export function playWinSound() {
  playTone(523, 0.15, "sine", 0.15);
  setTimeout(() => playTone(659, 0.15, "sine", 0.15), 100);
  setTimeout(() => playTone(784, 0.2, "sine", 0.15), 200);
  setTimeout(() => playTone(1047, 0.3, "triangle", 0.12), 300);
}

export function playLoseSound() {
  playTone(400, 0.2, "sawtooth", 0.08);
  setTimeout(() => playTone(300, 0.3, "sawtooth", 0.06), 150);
}

export function playDrumroll() {
  for (let i = 0; i < 12; i++) {
    setTimeout(() => playTone(200 + Math.random() * 100, 0.08, "triangle", 0.06), i * 80);
  }
}

export function playLevelUp() {
  playTone(523, 0.12, "sine", 0.15);
  setTimeout(() => playTone(659, 0.12, "sine", 0.15), 80);
  setTimeout(() => playTone(784, 0.12, "sine", 0.15), 160);
  setTimeout(() => playTone(1047, 0.12, "sine", 0.15), 240);
  setTimeout(() => playTone(1318, 0.3, "triangle", 0.12), 320);
}

export function playMissionComplete() {
  playTone(880, 0.1, "sine", 0.12);
  setTimeout(() => playTone(1100, 0.15, "triangle", 0.1), 80);
}
