"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { state } from "@/lib/store";
import { T, range, smooth, lerp, owner } from "@/lib/timeline";

const FIBERS = 44;
const SEG = 320;

// Stem geometry shared with the flower scene so the hand-off lines up:
// the gathered bundle runs along y = BASE_Y, turns up through a quarter
// circle at STEM_X and climbs to the bud at y = uTop.
export const STEM_X = 4.6;
const BASE_Y = -2.6;
const BEND_R = 4.2;

// Path + braid live in the vertex shader so 14k vertices animate for free.
const PATH = /* glsl */ `
  uniform float uTime, uGather, uTop, uSpread;
  const float STEM_X = ${STEM_X.toFixed(2)};
  const float BASE_Y = ${BASE_Y.toFixed(2)};
  const float BEND_R = ${BEND_R.toFixed(2)};

  // loose flowing phase: a long wave across the screen
  vec2 loosePath(float t){
    float x = mix(-11., 11., t);
    float y = sin(t * 2.6 + uTime * .28) * 1.1 + sin(t * 6.1 - uTime * .4) * .3 - .2 - t * .6;
    return vec2(x, y);
  }
  // gathered phase: horizontal -> quarter circle -> vertical stem (arc-length param)
  vec2 stemPath(float t){
    float L1 = STEM_X - BEND_R + 11.;
    float L2 = 1.5708 * BEND_R;
    float L3 = max(uTop - (BASE_Y + BEND_R), .01);
    float s = t * (L1 + L2 + L3);
    if (s < L1) return vec2(-11. + s, BASE_Y + sin(s * .5 + uTime * .3) * .12 * (1. - s / L1));
    s -= L1;
    if (s < L2) { float a = s / BEND_R; return vec2(STEM_X - BEND_R + sin(a) * BEND_R, BASE_Y + BEND_R - cos(a) * BEND_R); }
    s -= L2;
    return vec2(STEM_X + sin(s * .35) * .08 - s * .015, BASE_Y + BEND_R + s);
  }
  vec2 path(float t){ return mix(loosePath(t), stemPath(t), uGather); }
`;

const fiberVert = /* glsl */ `
  attribute float aT; attribute float aSide; attribute float aId;
  uniform float uWidth, uReveal;
  varying float vT; varying float vId; varying float vEdge; varying float vVis;
  ${PATH}
  void main(){
    vT = aT; vId = aId; vEdge = aSide;
    vec2 c = path(aT);
    vec2 c2 = path(aT + .002);
    vec2 tan = normalize(c2 - c + 1e-6);
    vec2 nrm = vec2(-tan.y, tan.x);
    // braid: each fiber orbits the bundle centre with its own frequency/phase
    float ph = aId * 37.1;
    float f = 4. + fract(aId * 13.7) * 6.;
    float env = sin(aT * 3.14159);
    float spreadLoose = (.15 + .55 * env) * (.45 + fract(aId * 3.3) * .7);
    float spread = mix(spreadLoose, .09 + .05 * fract(aId * 5.1), uGather) * uSpread;
    float off = sin(aT * f + uTime * (.35 + fract(aId * 7.) * .4) + ph) * spread
              + sin(aT * f * 2.3 - uTime * .5 + ph * 2.) * spread * .25;
    float depth = cos(aT * f + uTime * .4 + ph) * spread;
    vec2 p = c + nrm * off;
    float w = uWidth * (.5 + fract(aId * 9.7)) * (1. + uGather * .4);
    p += nrm * aSide * w;
    vVis = smoothstep(uReveal, uReveal - .2, aT);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, depth, 1.);
  }
`;

const fiberFrag = /* glsl */ `
  uniform float uWhite, uTime, uAlpha;
  varying float vT; varying float vId; varying float vEdge; varying float vVis;
  void main(){
    float x = abs(vEdge);
    float core = exp(-x * x * 6.);
    vec3 edgeCol = mix(vec3(.05, .35, 1.), vec3(.6, .95, .9), uWhite);
    vec3 col = mix(edgeCol, mix(vec3(.55, .8, 1.), vec3(1.), uWhite), smoothstep(.6, 1., core));
    float shimmer = .75 + .25 * sin(vT * 60. - uTime * 2.5 + vId * 30.);
    float ends = smoothstep(0., .04, vT) * smoothstep(1., .985, vT);
    float a = core * vVis * ends * shimmer * (.45 + .55 * fract(vId * 5.7)) * uAlpha;
    gl_FragColor = vec4(col * a * 1.6, a);
  }
`;

// a wide soft haze riding the same path: the bloom-like glow around the bundle
const hazeVert = /* glsl */ `
  attribute float aT; attribute float aSide;
  uniform float uHaze, uReveal;
  varying float vEdge; varying float vT; varying float vVis;
  ${PATH}
  void main(){
    vT = aT; vEdge = aSide;
    vec2 c = path(aT);
    vec2 c2 = path(aT + .002);
    vec2 tan = normalize(c2 - c + 1e-6);
    vec2 nrm = vec2(-tan.y, tan.x);
    float w = mix(2.2 * sin(aT * 3.14159) + .3, 1.3, uGather) * uHaze;
    vVis = smoothstep(uReveal, uReveal - .3, aT);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(c + nrm * aSide * w, -.5, 1.);
  }
`;
const hazeFrag = /* glsl */ `
  uniform float uWhite, uAlpha;
  varying float vEdge; varying float vT; varying float vVis;
  void main(){
    float a = exp(-vEdge * vEdge * 3.) * vVis * smoothstep(0., .1, vT) * smoothstep(1., .9, vT) * .3 * uAlpha;
    vec3 col = mix(vec3(.1, .4, 1.), vec3(.5, .85, .8), uWhite);
    gl_FragColor = vec4(col * a, a);
  }
`;

function ribbonGeometry(count, seg, withId) {
  const g = new THREE.BufferGeometry();
  const n = count * (seg + 1) * 2;
  const aT = new Float32Array(n);
  const aSide = new Float32Array(n);
  const aId = new Float32Array(n);
  const idx = [];
  let v = 0;
  for (let s = 0; s < count; s++) {
    const id = withId ? (s + 0.5) / count : 0.5;
    for (let i = 0; i <= seg; i++) {
      for (const side of [-1, 1]) {
        aT[v] = i / seg;
        aSide[v] = side;
        aId[v] = id;
        v++;
      }
      if (i < seg) {
        const b = v - 2;
        idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
      }
    }
  }
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute("aT", new THREE.BufferAttribute(aT, 1));
  g.setAttribute("aSide", new THREE.BufferAttribute(aSide, 1));
  g.setAttribute("aId", new THREE.BufferAttribute(aId, 1));
  g.setIndex(idx);
  return g;
}

const shared = {
  uTime: { value: 0 },
  uGather: { value: 0 },
  uTop: { value: 2 },
  uSpread: { value: 1 },
  uReveal: { value: 0 },
  uWhite: { value: 0 },
  uAlpha: { value: 1 },
};

// Where the stem tip is right now (world), used by camera + bud
export const stemTop = () => shared.uTop.value;

function Bundle() {
  const { fiber, haze } = useMemo(() => {
    const common = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide };
    return {
      fiber: new THREE.Mesh(
        ribbonGeometry(FIBERS, SEG, true),
        new THREE.ShaderMaterial({ ...common, vertexShader: fiberVert, fragmentShader: fiberFrag, uniforms: { ...shared, uWidth: { value: 0.034 } } })
      ),
      haze: new THREE.Mesh(
        ribbonGeometry(1, SEG, false),
        new THREE.ShaderMaterial({ ...common, vertexShader: hazeVert, fragmentShader: hazeFrag, uniforms: { ...shared, uHaze: { value: 1 } } })
      ),
    };
  }, []);
  fiber.frustumCulled = haze.frustumCulled = false;
  return (
    <>
      <primitive object={haze} />
      <primitive object={fiber} />
    </>
  );
}

// The bud the strands converge into; the flower scene opens it.
function Bud() {
  const ref = useRef();
  useFrame(({ clock }) => {
    const u = range(state.progress, T.lines);
    const s = smooth(range(u, [0.86, 0.98]));
    ref.current.position.set(STEM_X - (stemTop() - (BASE_Y + BEND_R)) * 0.015, stemTop() + 0.12, 0);
    ref.current.scale.set(0.11 * s, 0.2 * s, 0.11 * s);
    ref.current.rotation.z = 0.25 + Math.sin(clock.elapsedTime) * 0.04;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial color={[2.2, 2.6, 2.5]} toneMapped={false} />
    </mesh>
  );
}

function Sparks({ count = 500 }) {
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20 + 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      seed[i] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPx: { value: 1 } },
      vertexShader: `attribute float aSeed; uniform float uTime, uPx; varying float vA;
        void main(){ vec3 p = position; p.y += sin(uTime * .2 + aSeed * 30.) * .3;
          vA = pow(.5 + .5 * sin(uTime * 1.5 + aSeed * 80.), 6.) * .9;
          vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = uPx * (1.5 + aSeed * 2.5) / -mv.z; }`,
      fragmentShader: `varying float vA;
        void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d) * vA;
          gl_FragColor = vec4(vec3(.75, .95, 1.) * a, a); }`,
    });
    return { geo: g, mat: m };
  }, [count]);
  useFrame(({ clock, gl }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uPx.value = gl.getPixelRatio() * 12;
  });
  return <points geometry={geo} material={mat} frustumCulled={false} />;
}

export default function Lines() {
  const group = useRef();
  const { camera, scene } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const p = state.progress;
    const u = range(p, T.lines);
    shared.uTime.value = clock.elapsedTime;
    shared.uReveal.value = lerp(0, 1.25, smooth(range(u, [0, 0.14])));
    shared.uGather.value = smooth(range(u, [0.42, 0.62]));
    shared.uWhite.value = smooth(range(u, [0.32, 0.6]));
    // the stem keeps growing upward while the camera climbs with it
    shared.uTop.value = lerp(1.5, 13, smooth(range(u, [0.55, 0.95])));

    const mine = owner(p) === "lines";
    group.current.visible = mine;
    if (!mine) return;
    scene.fog = null;
    const follow = smooth(range(u, [0.55, 1]));
    const top = shared.uTop.value;
    // frame the loose braid, then track up the stem keeping it on the right third
    camera.position.set(lerp(0, STEM_X - 2.1, follow) + state.pointer.x * 0.12, lerp(-0.4, top - 2.6, follow) + state.pointer.y * 0.08, lerp(9.5, 7.2, follow));
    look.set(lerp(0, STEM_X - 2.1, follow), lerp(-0.6, top - 1.8, follow), 0);
    camera.lookAt(look);
    camera.fov = 40;
    camera.updateProjectionMatrix();
  });

  return (
    <group ref={group} visible={false}>
      <Bundle />
      <Bud />
      <Sparks />
    </group>
  );
}
