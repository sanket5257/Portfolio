"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { state, set } from "@/lib/store";
import { T, range, smooth, lerp, owner, easeInOut } from "@/lib/timeline";
import { projects } from "@/lib/content";
import { NOISE } from "./shaders";

const REVEAL = [T.projects[0], T.projects[0] + 0.04]; // hole opens in the white swirl
const CRYSTAL_Y = 0.78; // base sits just under the water line
const SINK = 3.2; // how far below the floor a crystal waits

// One colour drives the whole scene for the current project: crystal glow,
// terrain, floor bounce. It eases between projects.
const palette = {
  tint: new THREE.Color(...projects[0].tint),
  target: new THREE.Color(...projects[0].tint),
};

// ---------------------------------------------------------------- crystal shape
// A convex gem cut by ~26 random planes (like a hand-knapped stone), then
// stretched vertically. Every project gets its own seed, so its own silhouette.
function mulberry(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gemGeometry(seed, { faces = 26, radius = 0.6, variation = 0.11, jitter = 1.28, stretch = 1.5 } = {}) {
  const rnd = mulberry(seed);
  const planes = [];
  for (let i = 0; i < faces; i++) {
    // fibonacci directions, jittered so facets never look regular
    const y = 1 - (2 * (i + 0.5)) / faces;
    const r = Math.sqrt(1 - y * y);
    const a = i * 2.39996 + (rnd() - 0.5) * jitter;
    const n = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
    n.add(new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.35 * jitter)).normalize();
    planes.push([n, radius * (1 + (rnd() - 0.5) * 2 * variation)]);
  }
  // polyhedron vertices = triple-plane intersections inside every half-space
  const pts = [];
  const m = new THREE.Matrix3();
  const v = new THREE.Vector3();
  for (let i = 0; i < faces; i++)
    for (let j = i + 1; j < faces; j++)
      for (let k = j + 1; k < faces; k++) {
        const [a, da] = planes[i];
        const [b, db] = planes[j];
        const [c, dc] = planes[k];
        m.set(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
        if (Math.abs(m.determinant()) < 1e-4) continue;
        v.set(da, db, dc).applyMatrix3(m.clone().invert());
        if (planes.every(([n, d]) => n.dot(v) <= d + 1e-5)) pts.push(v.clone());
      }
  pts.forEach((p) => (p.y *= stretch));
  const g = new ConvexGeometry(pts);
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------- media
function useProjectTextures() {
  return useMemo(
    () =>
      projects.map((p) => {
        const t = new THREE.Texture();
        t.colorSpace = THREE.SRGBColorSpace;
        if (typeof window !== "undefined") {
          if (p.video) {
            const v = document.createElement("video");
            Object.assign(v, { src: p.video, muted: true, loop: true, playsInline: true, crossOrigin: "anonymous" });
            t.image = v;
            t.userData.video = v;
          } else if (p.image) {
            const img = new Image();
            img.onload = () => {
              t.image = img;
              t.needsUpdate = true;
            };
            img.src = p.image;
          }
        }
        return t;
      }),
    []
  );
}

// Dark faceted medium lit from within: the glow is strongest at the core and
// on facets facing the viewer, the project's site floats faintly inside, and
// each facet gets its own brightness so the cut reads.
function gemMaterial(envMap) {
  const m = new THREE.MeshPhysicalMaterial({
    color: "#05060f",
    metalness: 0.2,
    roughness: 0.1,
    clearcoat: 0.64,
    clearcoatRoughness: 0.01,
    envMap,
    envMapIntensity: 0.1,
    flatShading: true,
  });
  const uniforms = {
    uTint: { value: palette.tint },
    uMap: { value: null },
    uHasMap: { value: 0 },
    uTime: { value: 0 },
    uPulse: { value: 0 },
    uCenter: { value: new THREE.Vector3() },
  };
  m.userData.uniforms = uniforms;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vLocal; varying vec3 vW;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLocal = position;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvW = (modelMatrix * vec4(transformed, 1.)).xyz;");
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         uniform vec3 uTint, uCenter; uniform sampler2D uMap; uniform float uHasMap, uTime, uPulse;
         varying vec3 vLocal; varying vec3 vW;
         ${NOISE}`
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
         vec3 vdir = normalize(vViewPosition);
         float facing = abs(dot(normal, vdir));
         // light source deep inside: brightness falls off with the distance between
         // this surface point and the eye ray through the gem's centre
         vec3 eye = normalize(cameraPosition - vW);
         vec3 dc = vW - uCenter;
         float perp = length(dc - dot(dc, eye) * eye);
         float core = exp(-perp * perp * 5.5);
         float facet = .82 + .36 * hash13(floor(normal * 40.));
         float glow = core * (.55 + .45 * facing) * facet;
         vec3 inner = uTint * uTint * glow * (2.2 + uPulse * 1.5); // squared tint = saturated core
         // the project, projected through the stone like a reflection in deep water
         if (uHasMap > .5) {
           // the site floats inside facing the viewer; each facet bends it a little
           vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
           vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
           vec2 sp = vec2(dot(dc, right), dot(dc, up));
           vec2 suv = sp * vec2(.62, .5) + .5 + normal.xy * .05;
           vec3 img = texture2D(uMap, clamp(suv, 0., 1.)).rgb;
           float l = dot(img, vec3(.299, .587, .114));
           float frame = smoothstep(.0, .06, suv.x) * smoothstep(1., .94, suv.x) * smoothstep(.0, .06, suv.y) * smoothstep(1., .94, suv.y);
           // duotone into the stone's light: dark parts sink, bright UI glows
           vec3 duo = mix(uTint * .08, uTint * 1.15 + .08, smoothstep(.12, .85, l));
           inner = mix(inner, duo * (.35 + core * 1.1), core * frame * .75);
         }
         // fine inclusions catching light
         inner += uTint * smoothstep(.78, .92, vnoise(vLocal * 9. + uTime * .05)) * core * .35;
         // soft coloured rim so the silhouette separates from the dark terrain
         inner += uTint * pow(1. - facing, 4.) * .12;
         totalEmissiveRadiance += inner;`
      );
  };
  m.customProgramCacheKey = () => "gem";
  return m;
}

// ---------------------------------------------------------------- terrain
// Layered ridged mountains (shape follows the reference's terrain settings:
// stretched ridged noise, sharp crests, a few peaks framing the crystal).
// A dark solid body occludes; a dense coat of dust over every slope catches
// the project colour, brighter on faces turned to the viewer and on crests.
const HEIGHT = /* glsl */ `
  float ridged(vec2 p){
    float s = 0., a = .5;
    for (int i = 0; i < 4; i++){
      float n = 1. - abs(vnoise(vec3(p, float(i) * 7.1)) * 2. - 1.);
      s += pow(n, 5.19 * .55) * a;
      p = p * 2.03 + 3.7; a *= .5;
    }
    return s;
  }
  float terrain(vec2 p){
    vec2 q = vec2(p.x / 1.16, p.y);
    float h = ridged(q * .2) * 2.3 + ridged(q * .55) * .35;
    float far = smoothstep(4., 22., -p.y);
    h *= .45 + far * .9;                                      // rises with distance, layered bands
    h *= smoothstep(2.6, 7.5, abs(p.x) + abs(p.y + 4.5) * .5);  // open water around the crystal
    h += exp(-pow(length(p - vec2(2.2, -7.)), 2.) * .35) * 2.;  // peaks either side, behind
    h += exp(-pow(length(p - vec2(-2.8, -8.2)), 2.) * .3) * 1.6;
    h += exp(-pow(length(p - vec2(5.8, -11.)), 2.) * .12) * 2.6;
    return h;
  }
  vec3 terrainNormal(vec2 p){
    float e = .08;
    float hx = terrain(p + vec2(e, 0.)) - terrain(p - vec2(e, 0.));
    float hz = terrain(p + vec2(0., e)) - terrain(p - vec2(0., e));
    return normalize(vec3(-hx, 2. * e, -hz));
  }
`;

function Mountains() {
  const solid = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTint: { value: palette.tint } },
        vertexShader: `
          ${NOISE}
          ${HEIGHT}
          varying float vH; varying float vLit;
          void main(){
            vec3 p = vec3(position.x, 0., -position.y - 13.);
            p.y = terrain(p.xz) - .35;
            vH = p.y;
            vLit = max(dot(terrainNormal(p.xz), normalize(vec3(.2, .7, .9))), 0.);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
          }`,
        fragmentShader: `
          uniform vec3 uTint; varying float vH; varying float vLit;
          void main(){
            // near-black rock, faintly tinted on lit faces so the forms read
            vec3 c = vec3(.004, .005, .008) + uTint * uTint * .03 * vLit * smoothstep(.0, 1.5, vH);
            gl_FragColor = vec4(c, 1.);
          }`,
      }),
    []
  );
  const dust = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uReveal: { value: 0 }, uPx: { value: 1 }, uTint: { value: palette.tint } },
        vertexShader: `
          ${NOISE}
          ${HEIGHT}
          uniform float uTime, uReveal, uPx; varying float vA; varying float vH;
          void main(){
            vec3 p = position;
            float h = terrain(p.xz);
            vec3 n = terrainNormal(p.xz);
            float lit = max(dot(n, normalize(vec3(.2, .7, .9))), 0.);
            float crest = smoothstep(.55, .95, n.y) * smoothstep(.6, 1.6, h); // flat-ish tops
            float slope = 1. - n.y;
            p.y = h - .34;
            vH = h;
            float sparkle = .45 + .55 * fbm(vec3(p.xz * 4.3, uTime * .25));
            vA = uReveal * smoothstep(.12, .45, h) * (lit * .55 + crest * .5 + slope * .35) * sparkle;
            vec4 mv = modelViewMatrix * vec4(p, 1.);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uPx * (1. + h * .25) / -mv.z;
          }`,
        fragmentShader: `
          uniform vec3 uTint; varying float vA; varying float vH;
          void main(){
            if (length(gl_PointCoord - .5) > .5 || vA < .01) discard;
            // project colour on the slopes, warmer light on the highest crests
            vec3 c = mix(uTint * uTint * 1.3, vec3(1., .74, .42), smoothstep(2.6, 3.8, vH) * .5);
            gl_FragColor = vec4(c * vA * 1.5, vA);
          }`,
      }),
    []
  );
  const pts = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const N = 220000;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 46;
      pos[i * 3 + 2] = -Math.random() * 24 - 1;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame(({ clock, gl }) => {
    dust.uniforms.uTime.value = clock.elapsedTime;
    dust.uniforms.uPx.value = gl.getPixelRatio() * 2.2;
    dust.uniforms.uReveal.value = smooth(range(state.progress, [REVEAL[0] + 0.01, REVEAL[1] + 0.01]));
  });
  return (
    <>
      <mesh material={solid} frustumCulled={false}>
        <planeGeometry args={[46, 26, 260, 150]} />
      </mesh>
      <points geometry={pts} material={dust} frustumCulled={false} />
    </>
  );
}

// ---------------------------------------------------------------- crystal + switching
export function step(dir) {
  const n = projects.length;
  set({ project: (state.project + dir + n) % n });
}

function Crystal() {
  const { gl } = useThree();
  const envMap = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return tex;
  }, [gl]);
  const geos = useMemo(() => projects.map((_, i) => gemGeometry(327 + i * 7919)), []);
  const textures = useProjectTextures();
  const mat = useMemo(() => gemMaterial(envMap), [envMap]);
  const mesh = useRef();
  const spin = useRef({ vel: 0, angle: 0 });
  // shown = index on screen; sink/rise sequence when state.project changes
  const anim = useRef({ shown: 0, phase: "idle", t: 0 });

  useEffect(() => {
    const onKey = (e) => {
      if (owner(state.progress) !== "projects") return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  // drag spins the stone; a long enough drag hands over to the next project
  useEffect(() => {
    let down = null;
    let last = 0;
    const onDown = (e) => {
      if (owner(state.progress) !== "projects" || state.projectOpen) return;
      if (e.target.closest("button,a")) return;
      down = e.clientX;
      last = e.clientX;
      set({ dragging: true });
    };
    const onMove = (e) => {
      if (down === null) return;
      spin.current.vel += (e.clientX - last) * 0.0011;
      last = e.clientX;
    };
    const onUp = (e) => {
      if (down === null) return;
      const dx = e.clientX - down;
      down = null;
      set({ dragging: false });
      if (Math.abs(dx) > 70 && anim.current.phase === "idle") step(dx < 0 ? 1 : -1);
    };
    addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    return () => {
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
    };
  }, []);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const a = anim.current;
    const d = Math.min(dt, 0.1);
    if (a.phase === "idle" && a.shown !== state.project) {
      a.phase = "sink";
      a.t = 0;
    }
    let off = 0;
    if (a.phase === "sink") {
      a.t += d / 0.55;
      off = -SINK * easeInOut(Math.min(a.t, 1));
      if (a.t >= 1) {
        // swap while hidden under the floor
        a.shown = state.project;
        a.phase = "rise";
        a.t = 0;
        ripple.start = t;
        palette.target.setRGB(...projects[a.shown].tint);
        spin.current.vel += 0.06;
      }
    } else if (a.phase === "rise") {
      a.t += d / 0.9;
      off = -SINK * (1 - easeInOut(Math.min(a.t, 1)));
      if (a.t >= 1) a.phase = "idle";
    }
    // first arrival: the stone grows up out of the ground as the hole opens
    const enter = smooth(range(state.progress, [REVEAL[0] + 0.005, REVEAL[1] + 0.02]));
    if (enter > 0.02 && enter < 0.1 && t - ripple.start > 3) ripple.start = t; // first emergence
    off += -SINK * (1 - enter);

    palette.tint.lerp(palette.target, 1 - Math.exp(-d * 4));
    const u = mat.userData.uniforms;
    const tex = textures[a.shown];
    u.uMap.value = tex;
    u.uHasMap.value = tex.image ? 1 : 0;
    if (tex.userData.video) {
      tex.userData.video.play().catch(() => {});
      tex.needsUpdate = true;
    }
    u.uTime.value = t;
    u.uPulse.value = a.phase === "rise" ? 1 - Math.min(a.t, 1) : 0;

    spin.current.vel *= 0.93;
    spin.current.angle += d * 0.18 + spin.current.vel;
    const m = mesh.current;
    m.geometry = geos[a.shown];
    m.rotation.set(Math.sin(t * 0.4) * 0.05, spin.current.angle, Math.sin(t * 0.33) * 0.04);
    m.position.y = CRYSTAL_Y + off + Math.sin(t * 0.8) * 0.04;
    u.uCenter.value.copy(m.position);
  });

  return (
    <>
      <mesh ref={mesh} geometry={geos[0]} material={mat} position={[0, CRYSTAL_Y, 0]} />
    </>
  );
}

// ---------------------------------------------------------------- reveal
// Continuation of the portal the camera dived into: the same blue streaked
// vortex fills the lens, then its eye opens and the crystal scene appears
// through it — tinted by the portal's blue for a beat before it clears.
const ripple = { start: -10 };

function Reveal() {
  const ref = useRef();
  const { viewport } = useThree();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthTest: false,
        depthWrite: false,
        fog: false,
        toneMapped: false,
        uniforms: { uTime: { value: 0 }, uOpen: { value: 0 }, uTint: { value: 1 }, uAspect: { value: 1 }, uSpin: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
        fragmentShader: `
          ${NOISE}
          varying vec2 vUv; uniform float uTime, uOpen, uTint, uAspect, uSpin;
          void main(){
            vec2 sp = (vUv * 2. - 1.) * vec2(uAspect, 1.);
            // same shading as the portal (Vortex.jsx), seen from very close
            vec2 p = sp * .55;
            float r = length(p);
            float a = atan(p.y, p.x);
            float th = a - uSpin + 2.4 * log(r + .06);
            vec3 q = vec3(cos(th) * 1.3, sin(th) * 1.3, r * 5.5 - uTime * .35);
            float n = fbm(q + fbm(q * 1.7 + 3.) * .8);
            float fil = fbm(vec3(cos(th * 2.) * 2.6, sin(th * 2.) * 2.6, r * 11. - uTime * .6));
            vec3 navy = vec3(.01, .03, .2);
            vec3 blue = vec3(.06, .25, .95);
            vec3 pale = vec3(.78, .86, 1.);
            float outer = smoothstep(.18, .85, r);
            vec3 col = mix(navy, blue, smoothstep(.3, .7, n));
            col = mix(col, pale, outer * smoothstep(.45, .8, n + outer * .15));
            col += vec3(.1, .45, 1.) * smoothstep(.55, .8, fil) * (1. - smoothstep(.05, .45, r)) * 1.4;
            col *= 1.05;
            // the eye opens: its edge follows the swirl so it tears open, not wipes
            float R = uOpen * 1.6;
            float edge = (n - .5) * .35 + (fil - .5) * .15;
            float wall = smoothstep(R - .04, R + .12, r + edge * (.4 + uOpen));
            // inside the opening, the portal's blue lingers over the new scene
            vec3 tint = vec3(.03, .16, .7);
            vec3 outc = mix(tint, col, wall);
            float alpha = max(wall, uTint * .42);
            gl_FragColor = vec4(outc, alpha);
          }`,
      }),
    []
  );
  useFrame(({ clock, camera }) => {
    const p = state.progress;
    const open = smooth(range(p, REVEAL));
    const tint = 1 - smooth(range(p, [REVEAL[0] + 0.006, REVEAL[1]]));
    const t = clock.elapsedTime;
    mat.uniforms.uTime.value = t;
    mat.uniforms.uSpin.value = t * 1.95 + p * 18; // matches the portal's spin at the end of the dive
    mat.uniforms.uOpen.value = open;
    mat.uniforms.uTint.value = tint;
    mat.uniforms.uAspect.value = viewport.aspect;
    ref.current.visible = tint > 0.002 || open < 0.999;
    // glued to the lens
    ref.current.position.copy(camera.position);
    ref.current.quaternion.copy(camera.quaternion);
    ref.current.translateZ(-1);
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    ref.current.scale.set(h * viewport.aspect * 1.02, h * 1.02, 1);
  });
  return (
    <mesh ref={ref} material={mat} renderOrder={999} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

// ---------------------------------------------------------------- water
// Still dark water: a reflector whose reflection is broken up by a slowly
// drifting ripple map, tinted faintly by the project colour.
function rippleTexture(size = 256) {
  const data = new Uint8Array(size * size * 4);
  const rnd = mulberry(91);
  const grid = Array.from({ length: 33 * 33 }, () => rnd());
  const g = (x, y) => grid[(y % 32) * 33 + (x % 32)];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let v = 0;
      let amp = 0.5;
      for (let o = 1; o <= 3; o++) {
        const fx = (x / size) * 8 * o;
        const fy = (y / size) * 8 * o;
        const ix = Math.floor(fx);
        const iy = Math.floor(fy);
        const tx = fx - ix;
        const ty = fy - iy;
        const sx = tx * tx * (3 - 2 * tx);
        const sy = ty * ty * (3 - 2 * ty);
        const n = g(ix, iy) * (1 - sx) * (1 - sy) + g(ix + 1, iy) * sx * (1 - sy) + g(ix, iy + 1) * (1 - sx) * sy + g(ix + 1, iy + 1) * sx * sy;
        v += n * amp;
        amp *= 0.5;
      }
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = Math.round(v * 255);
      data[i + 3] = 255;
    }
  const t = new THREE.DataTexture(data, size, size);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 6);
  t.needsUpdate = true;
  return t;
}

function Water() {
  const ref = useRef();
  const c = useMemo(() => new THREE.Color(), []);
  const ripples = useMemo(() => rippleTexture(), []);
  useFrame(({ clock }) => {
    ripples.offset.set(clock.elapsedTime * 0.006, clock.elapsedTime * 0.011);
    if (ref.current) ref.current.color.copy(c.copy(palette.tint).multiplyScalar(0.03));
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        ref={ref}
        resolution={768}
        mixBlur={1.6}
        blur={[420, 140]}
        mixStrength={1.8}
        mirror={0.9}
        roughness={0.9}
        metalness={0.2}
        depthScale={0.2}
        distortionMap={ripples}
        distortion={0.12}
        color="#020408"
      />
    </mesh>
  );
}

// rings that spread where the crystal breaks the surface, plus a faint
// lapping ring around its base while it floats
function Ripples() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uStart: { value: -10 }, uTint: { value: palette.tint }, uOn: { value: 0 } },
        vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
        fragmentShader: `
          varying vec2 vP; uniform float uTime, uStart, uOn; uniform vec3 uTint;
          void main(){
            float d = length(vP);
            float age = uTime - uStart;
            float front = age * .9 + .4;
            float wake = sin((d - front) * 22.) * exp(-abs(d - front) * 4.) * exp(-age * .55) * step(0., age);
            float lap = (sin(d * 26. - uTime * 1.6 + sin(atan(vP.y, vP.x) * 5. + uTime) * .8) * .5 + .5) * exp(-pow((d - .5) * 5., 2.)) * .12;
            float a = (max(wake, 0.) * .55 + lap) * uOn * smoothstep(4., 2., d);
            gl_FragColor = vec4(mix(vec3(.7, .8, .9), uTint, .6) * a, a);
          }`,
      }),
    []
  );
  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uStart.value = ripple.start;
    mat.uniforms.uOn.value = smooth(range(state.progress, [REVEAL[0] + 0.01, REVEAL[1]]));
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} material={mat}>
      <planeGeometry args={[8, 8]} />
    </mesh>
  );
}

export default function Projects() {
  const group = useRef();
  const { camera, scene } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const ptr = useRef({ x: 0, y: 0 });
  const fog = useMemo(() => new THREE.Fog("#000000", 7, 30), []);

  useFrame((_, dt) => {
    const p = state.progress;
    const mine = owner(p) === "projects";
    group.current.visible = mine;
    if (!mine) return;
    scene.fog = fog;
    const open = smooth(range(p, REVEAL));
    const leave = smooth(range(p, [T.projects[1] - 0.03, T.projects[1]]));
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 3);
    ptr.current.x += (state.pointer.x - ptr.current.x) * k;
    ptr.current.y += (state.pointer.y - ptr.current.y) * k;
    // low, level camera: horizon just under the middle, a slow push-in as it opens
    camera.position.set(ptr.current.x * 0.22, 1.05 + ptr.current.y * 0.08 + leave * 1.6, lerp(6.6, 5.4, open) - leave);
    look.set(0, 0.95 + leave * 1.2, 0);
    camera.lookAt(look);
    camera.fov = 40;
    camera.updateProjectionMatrix();
  });

  return (
    <group ref={group} visible={false}>
      <ambientLight intensity={0.08} />
      <directionalLight position={[-3, 5, 4]} intensity={0.6} color="#9cc8ff" />
      <Mountains />
      <Crystal />
      <Water />
      <Ripples />
      <Reveal />
    </group>
  );
}
