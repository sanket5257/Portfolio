// Generative ambience: filtered brown-noise "air" plus a low detuned drone.
// No audio files to ship; the bed swells in when the visitor enters.

let ctx, master;

export function startAudio() {
  if (typeof window === "undefined") return;
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // brown noise -> lowpass with a slow breathing cutoff
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.2;
      }
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    lp.Q.value = 0.6;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 220;
    lfo.connect(lfoGain).connect(lp.frequency);
    const air = ctx.createGain();
    air.gain.value = 0.35;
    noise.connect(lp).connect(air).connect(master);

    // drone: two detuned sines an octave apart
    const drone = ctx.createGain();
    drone.gain.value = 0.05;
    [55, 55.4, 110.3].forEach((f) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.connect(drone);
      o.start();
    });
    drone.connect(master);

    noise.start();
    lfo.start();
  }
  ctx.resume();
  setSound(true);
}

export function setSound(on) {
  if (!ctx) return on ? startAudio() : undefined;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(on ? 0.5 : 0, t + 1.2);
}
