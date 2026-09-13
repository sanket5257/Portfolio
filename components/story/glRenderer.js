'use client';

import { composition } from './sequence';

/* ─────────────────────────────────────────────────────────────────────────
   The WebGL layer.

   The filmstrip used to be drawn with `drawImage` onto a 2D context. That is
   the right tool for putting a frame on screen and the wrong one for doing
   anything to it: a 2D context can scale and it can blur, and past that every
   pixel is already committed by the time you have it.

   Here each frame is uploaded as a texture and the fragment shader decides
   where to sample it, so the pointer can bend the image rather than slide it.

   ── The effect: a prism wake ─────────────────────────────────────────────
   Not a lens sitting under the cursor. Six things stacked, all keyed to the
   pointer, which together read as a piece of moving glass dragged across the
   footage:

     1. an ANISOTROPIC field — the disturbance is a circle when the pointer is
        still and stretches into a comet behind it as it moves, because a
        round blob that slides around reads as a decal and a smear that
        elongates with speed reads as something with mass
     2. INTERFERENCE RINGS — concentric ripples inside that field displace the
        sample position, so the glass has structure instead of being a single
        smooth bulge
     3. DISPERSION — five samples across the spectrum rather than three at R/G/B,
        so the rim splits into a continuous band instead of three coloured
        ghosts
     4. IRIDESCENCE — a thin-film sheen whose hue rotates with ring phase and
        distance, the same physics that puts colour on a soap bubble and on
        the bird already in the frame
     5. a RIM highlight where the field's gradient is steepest, which is where
        a real curved surface catches light
     6. GLINTS — existing highlights in the frame amplified inside the field,
        so the effect lights up the snow and the wings and leaves the night
        sky alone rather than fogging it

   Time only enters through the ring phase, and slowly. Everything else on
   this page is positioned by scroll and by pointer; a shimmer that keeps
   breathing when both are still is the one exception, and it is here because
   glass that goes completely inert the moment you stop moving looks broken.
   ───────────────────────────────────────────────────────────────────────── */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uTex;
uniform vec2  uResolution;
uniform vec2  uImageSize;
uniform vec2  uMouse;      // pointer in 0..1 UV space, y already flipped
uniform vec2  uVel;        // pointer velocity, UV units per second
uniform vec2  uParallax;   // small whole-image offset, in UV
uniform float uScale;      // the camera's push
uniform float uBloom;      // moonlight, 0..1
uniform float uLens;       // refraction strength, in UV units
uniform float uRadius;     // field radius, in UV units
uniform float uTime;       // seconds, for the ring phase only

/* Cover-fit: fill the canvas, crop the overflow, never distort. */
vec2 coverUv(vec2 uv) {
  float screenAspect = uResolution.x / uResolution.y;
  float imageAspect  = uImageSize.x / uImageSize.y;
  vec2 ratio = screenAspect > imageAspect
    ? vec2(1.0, imageAspect / screenAspect)
    : vec2(screenAspect / imageAspect, 1.0);
  return (uv - 0.5) * ratio + 0.5;
}

/* A smooth spectral ramp. Cheaper and better behaved than a hue-to-RGB
   conversion, and the phase offsets are what give it its rainbow order. */
vec3 spectrum(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + t));
}

void main() {
  vec2 base = coverUv(vUv);
  base = (base - 0.5) / uScale + 0.5;   // the camera's push
  base += uParallax;

  float aspect = uResolution.x / uResolution.y;

  /* ── 1. The anisotropic field ─────────────────────────────────────────
     Measured against vUv — SCREEN space — and emphatically not against
     "base". That variable has been through the cover-fit crop, the camera
     push and the parallax offset, so it is image space; the pointer is a
     screen position. Comparing the two put the centre of the effect percent
     away from the actual cursor, which is exactly as wrong as it sounds.
     Screen space for WHERE the lens is, image space for WHAT it samples.

     Distance is then taken in a frame aligned to the pointer's travel, with
     the along-travel axis divided down. At rest that divisor is 1 and the
     field is a circle; at speed it stretches into a comet. */
  vec2 d = vUv - uMouse;
  vec2 dc = vec2(d.x * aspect, d.y);

  float speed = length(uVel);
  vec2 vdir = speed > 0.0001 ? normalize(vec2(uVel.x * aspect, uVel.y)) : vec2(1.0, 0.0);
  vec2 vperp = vec2(-vdir.y, vdir.x);

  float along  = dot(dc, vdir);
  float across = dot(dc, vperp);

  float stretch = 1.0 + min(speed * 2.2, 1.5);
  vec2 dAniso = vec2(along / stretch, across);
  float dist = length(dAniso);

  /* Gaussian, not a hard circle: a field with an edge you can see is a disc
     sitting on the picture, not a piece of glass. */
  float field = exp(-(dist * dist) / (2.0 * uRadius * uRadius));

  /* ── 2. Interference rings ──────────────────────────────────────────── */
  float phase = dist * 30.0 - uTime * 1.4 - speed * 4.0;
  float rings = sin(phase);

  /* The lobe. Displacement is ZERO on the axis and peaks near the field
     radius, because that is what a lens does — the centre of a lens looks
     through cleanly and the bending happens where the surface turns away.
     Driving it by the falloff alone pulls hardest exactly under the pointer,
     which collapses the sample into a dark vortex at the cursor. */
  float radial = dist / uRadius;
  float lobe = field * radial * 1.65;
  float displace = lobe * (0.78 + 0.22 * rings);

  vec2 nd = dist > 0.0001 ? normalize(dc) : vec2(0.0);
  nd.x /= aspect;

  /* Faster pointers push harder — the glass has inertia. */
  float amount = displace * uLens * (1.0 + min(speed * 1.2, 0.8));

  /* ── 3. Dispersion ──────────────────────────────────────────────────── */
  vec3 color = vec3(0.0);
  vec3 weight = vec3(0.0);
  const int TAPS = 5;
  for (int i = 0; i < TAPS; i++) {
    float t = float(i) / float(TAPS - 1);          // 0..1 across the spectrum
    float offset = mix(1.12, 0.66, t);             // long wavelengths bend least
    vec2 suv = clamp(base - nd * amount * offset, 0.0, 1.0);
    vec3 tap = texture2D(uTex, suv).rgb;
    /* Each tap is tinted by where it sits in the spectrum and accumulated
       with that tint as its weight, so the sum stays energy-neutral and the
       image does not drift in hue where the effect is weak. */
    vec3 tint = spectrum(t * 0.66);
    color += tap * tint;
    weight += tint;
  }
  color /= max(weight, vec3(0.0001));

  float luma = dot(color, vec3(0.299, 0.587, 0.114));

  /* ── 4. Iridescence ───────────────────────────────────────────────────
     Tied to the lobe, not the whole field, so the sheen sits in the ring
     where the glass is actually bending and does not wash the centre. */
  float film = lobe * (0.5 + 0.5 * rings);
  color += spectrum(phase * 0.08 + dist * 1.8 + uTime * 0.03) * film * 0.10 * (0.3 + luma);

  /* ── 5. Rim ─────────────────────────────────────────────────────────
     Peaks where the field is halfway, which is where a curved surface turns
     away from you and catches the light. */
  float rim = field * (1.0 - field) * 4.0;
  color += rim * 0.07 * vec3(0.82, 0.86, 1.0);

  /* ── 6. Glints ──────────────────────────────────────────────────────
     A steep power of the luminance already present, so only genuine
     specular highlights respond. The footage is a violet bird lit from
     behind — most of the frame is already bright, and at a lower exponent
     this lit the whole wing rather than picking out sparkles in it. */
  color += field * pow(luma, 6.0) * 0.30 * vec3(1.0, 0.96, 1.0);

  /* Nothing above is allowed to clip. Each term is small on its own, but
     they stack on footage that is already near white in places, and a hard
     clamp there would flatten the highlight into a paper cut-out. This rolls
     the top end off instead. */
  color = color / (1.0 + max(color - 1.0, 0.0) * 0.85);

  /* Moonlight. The 2D path laid this over everything as a flat gradient;
     here it is modulated by the image beneath it for the same reason. */
  if (uBloom > 0.001) {
    vec2 moon = vec2(0.3, 0.7);
    vec2 toMoon = vec2((vUv.x - moon.x) * aspect, vUv.y - moon.y);
    float glow = exp(-length(toMoon) * 1.6);
    color += uBloom * glow * (0.35 + 0.65 * luma) * vec3(0.62, 0.56, 0.92);
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`shader: ${log}`);
  }
  return sh;
}

/** The requested frame, or the closest one that has actually arrived. */
function nearest(strip, index) {
  if (strip[index]) return strip[index];
  for (let d = 1; d < strip.length; d += 1) {
    if (strip[index - d]) return strip[index - d];
    if (strip[index + d]) return strip[index + d];
  }
  return null;
}

/* ── Can this machine run the shader? ────────────────────────────────────
   Asked on a throwaway 1x1 canvas, and asked BEFORE the real one is touched.

   A canvas can only ever hand out one kind of context: once `getContext`
   has returned a WebGL context for an element, `getContext('2d')` on that
   same element returns null forever. So probing on the real canvas and then
   falling back would hand the 2D renderer a null context and throw — the
   fallback would break in precisely the case it exists for. Probing over
   here costs one discarded context at startup and keeps that door open. */
function glSupported() {
  try {
    const probe = document.createElement('canvas');
    probe.width = 1;
    probe.height = 1;
    const gl = probe.getContext('webgl');
    if (!gl) return false;

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    const ok = gl.getProgramParameter(program, gl.LINK_STATUS);

    // Hand the context back rather than waiting for GC — browsers cap how
    // many live GL contexts a page may hold, and this one is disposable.
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();

    return !!ok;
  } catch (e) {
    return false;
  }
}

/**
 * Returns the same `{ render, resize }` pair the 2D renderer does, or null if
 * WebGL is unavailable — the caller falls back rather than failing.
 */
export function createGLRenderer(canvas, strip) {
  if (!glSupported()) return null;

  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
  });
  if (!gl) return null;

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program));
    }
  } catch (e) {
    return null;
  }
  gl.useProgram(program);

  // One quad, drawn as a strip. Nothing else is ever drawn.
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  for (const name of [
    'uTex', 'uResolution', 'uImageSize', 'uMouse', 'uVel',
    'uParallax', 'uScale', 'uBloom', 'uLens', 'uRadius', 'uTime',
  ]) {
    u[name] = gl.getUniformLocation(program, name);
  }

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  /* CLAMP + LINEAR + no mipmaps: the frames are not powers of two, and this
     is the combination WebGL1 allows for those. */
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.uniform1i(u.uTex, 0);

  let w = 0;
  let h = 0;
  let dpr = 1;
  let uploaded = -1; // which frame is currently in the texture
  let imgW = 1920;
  let imgH = 1080;

  // Pointer state, for the velocity the field stretches along.
  let px = 0.5;
  let py = 0.5;
  let vx = 0;
  let vy = 0;
  let last = 0;
  const start = typeof performance !== 'undefined' ? performance.now() : 0;

  function source() {
    for (let i = 0; i < strip.length; i += 1) if (strip[i]) return strip[i];
    return null;
  }

  function resize() {
    w = canvas.clientWidth;
    h = canvas.clientHeight;

    /* Backing-store resolution, capped so the frames are never upscaled — a
       1920 master covering a 1440px viewport is already drawn at 0.8x, and a
       device ratio of 2 would push that to 1.6x, resampling every frame up
       60% before it reaches the screen. Never below 1 either: that resamples
       twice, once down here and once back up by the compositor. */
    const img = source();
    const dev = Math.min(2, window.devicePixelRatio || 1);
    if (img) {
      imgW = img.naturalWidth || img.width;
      imgH = img.naturalHeight || img.height;
      const MAX_PUSH = 1.1;
      const cover = Math.max(w / imgW, h / imgH) * MAX_PUSH;
      dpr = Math.max(1, Math.min(dev, 1 / cover));
    } else {
      dpr = dev;
    }

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  /* Strength of the refraction, in UV units, and the field's radius. */
  const LENS = 0.030;
  const RADIUS = 0.15;
  /* How quickly the measured velocity decays back to zero. The wake should
     outlive the gesture by a beat — glass does not stop dead. */
  const VEL_DECAY = 0.88;
  /* Ceiling on the measured pointer speed, in UV per second. */
  const MAX_SPEED = 1.6;

  function render(p, mouse) {
    if (!w || !h) resize();
    const shot = composition(p);

    const img = nearest(strip, shot.frame);
    if (!img) return;

    /* Upload only when the frame actually changes. The playhead moves about
       eleven frames a second at most, so this skips the large majority of
       ticks — and a texImage2D of a 1920x1080 image is the single most
       expensive thing in this loop. */
    if (shot.frame !== uploaded) {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      uploaded = shot.frame;
      imgW = img.naturalWidth || img.width;
      imgH = img.naturalHeight || img.height;
    }

    /* The pointer arrives as a smoothed, centred -1..1 pair. UV space is
       0..1 with y up, so it needs halving, offsetting, and flipping. */
    const now = performance.now();
    /* Floored as well as capped. Velocity is a delta divided by dt, so a
       short frame divides by a tiny number and reports a speed the pointer
       never had — which stretched the wake across half the screen on any
       dropped frame. */
    const dt = last ? Math.min(0.05, Math.max(0.008, (now - last) / 1000)) : 0.016;
    last = now;

    const mx = (mouse.sx ?? mouse.x) * 0.5 + 0.5;
    const my = 1 - ((mouse.sy ?? mouse.y) * 0.5 + 0.5);

    /* Velocity is measured here rather than passed in, so the stretch is
       driven by what the shader is actually being given — if the pointer
       smoothing changes upstream, the wake follows it automatically. */
    const ivx = (mx - px) / dt;
    const ivy = (my - py) / dt;
    px = mx;
    py = my;
    vx = vx * VEL_DECAY + ivx * (1 - VEL_DECAY);
    vy = vy * VEL_DECAY + ivy * (1 - VEL_DECAY);

    /* A ceiling on the whole vector. A fast flick should lengthen the wake,
       not turn it into a screen-wide smear. */
    const sp = Math.hypot(vx, vy);
    if (sp > MAX_SPEED) {
      vx = (vx / sp) * MAX_SPEED;
      vy = (vy / sp) * MAX_SPEED;
    }

    // The old whole-image parallax, kept — it is what makes a paused world
    // still feel like it has a camera behind it.
    const push = Math.max(0, shot.scale - 1);
    const par = 0.004 + push * 0.05;

    gl.uniform2f(u.uResolution, canvas.width, canvas.height);
    gl.uniform2f(u.uImageSize, imgW, imgH);
    gl.uniform2f(u.uMouse, mx, my);
    gl.uniform2f(u.uVel, vx, vy);
    gl.uniform2f(u.uParallax, -mouse.x * par, mouse.y * par);
    gl.uniform1f(u.uScale, shot.scale);
    gl.uniform1f(u.uBloom, shot.bloom);
    gl.uniform1f(u.uLens, LENS);
    gl.uniform1f(u.uRadius, RADIUS);
    gl.uniform1f(u.uTime, (now - start) / 1000);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  return { render, resize };
}
