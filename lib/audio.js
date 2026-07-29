// Small global audio manager: mute-aware one-shot sample player with a
// tiny pool per URL so rapid re-triggers don't cut each other off.

let muted = false;
const pools = new Map();
const POOL_SIZE = 3;

export function setMuted(v) {
  muted = v;
}
export function isMuted() {
  return muted;
}

function getPool(url) {
  let pool = pools.get(url);
  if (!pool) {
    pool = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const a = new Audio(url);
      a.preload = 'auto';
      pool.push(a);
    }
    pools.set(url, { list: pool, i: 0 });
    pool = pools.get(url);
  }
  return pool;
}

export function playSample(url, { volume = 0.9, rate = 1 } = {}) {
  if (muted || typeof window === 'undefined' || !url) return;
  const pool = getPool(url);
  const a = pool.list[pool.i];
  pool.i = (pool.i + 1) % pool.list.length;
  try {
    a.currentTime = 0;
    a.volume = volume;
    a.playbackRate = rate;
    a.play().catch(() => {});
  } catch {}
}

// Synthesized soft click (used by the lamp toggle — no mp3, like the ref).
let ctx;
export function synthClick() {
  if (muted || typeof window === 'undefined') return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const dur = 0.018;
    const buf = ctx.createBuffer(1, Math.ceil(dur * ctx.sampleRate), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (2 * Math.random() - 1) * Math.pow(1 - i / data.length, 8);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1800;
    const gain = ctx.createGain();
    gain.gain.value = 0.16;
    src.connect(hp).connect(gain).connect(ctx.destination);
    src.start();
  } catch {}
}

// Warm the decoder on first user gesture (autoplay policy).
export function unlockAudio() {
  if (typeof window === 'undefined') return;
  pools.forEach((pool) => {
    pool.list.forEach((a) => {
      const v = a.volume;
      a.volume = 0;
      a.play()
        .then(() => {
          a.pause();
          a.currentTime = 0;
          a.volume = v;
        })
        .catch(() => {
          a.volume = v;
        });
    });
  });
}
