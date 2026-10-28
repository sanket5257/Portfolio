"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { state } from "@/lib/store";
import { T, range, smooth, lerp, owner } from "@/lib/timeline";
import { NOISE } from "./shaders";

// The shaft of light enters from the right edge and runs slightly downhill
// toward the hand. Everything lit in this scene is lit by this one line.
const BEAM_A = new THREE.Vector3(7.4, 2.3, -0.6); // source (off-screen right)
const BEAM_B = new THREE.Vector3(0.7, 0.2, -0.6); // where it dies out
const beamUniform = {
  uBeamA: { value: BEAM_A },
  uBeamB: { value: BEAM_B },
  uPower: { value: 0 },
};

// distance of a world point from the beam axis + how far along it is (0 at source)
const BEAM_GLSL = /* glsl */ `
  uniform vec3 uBeamA, uBeamB; uniform float uPower;
  vec2 beamCoord(vec3 w){
    vec3 ab = uBeamB - uBeamA;
    float tr = dot(w - uBeamA, ab) / dot(ab, ab);
    float d = length((uBeamA + ab * clamp(tr, 0., 1.) - w).xy);
    return vec2(d, max(tr, 0.)); // unclamped along-axis so the tail fades instead of clipping
  }
`;

// Screen-filling haze plane behind the hand: gaussian falloff from the axis,
// brightest at the source, heavy animated grain like light through dust.
function Beam() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        uniforms: { ...beamUniform, uTime: { value: 0 } },
        vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
        fragmentShader: `
          ${NOISE}
          ${BEAM_GLSL}
          varying vec3 vW; uniform float uTime;
          void main(){
            vec2 bc = beamCoord(vW);
            float width = mix(1.35, .3, bc.y);          // wide at the source, tapers to the hand
            float core = exp(-pow(bc.x / width, 2.) * 2.2);
            float haze = exp(-pow(bc.x / (width * 2.4), 2.) * 2.);
            float fall = smoothstep(1., .55, bc.y) * (.55 + .45 * (1. - bc.y));             // fades away from the source
            float dens = .7 + .3 * fbm(vec3(vW.xy * vec2(.6, 2.2) - vec2(uTime * .08, 0.), uTime * .05));
            // god rays: streaks running along the shaft, slowly breathing
            vec2 dir = normalize((uBeamB - uBeamA).xy);
            float across = dot(vW.xy - uBeamA.xy, vec2(-dir.y, dir.x));
            float rays = .5 + .5 * smoothstep(.25, .85, fbm(vec3(across * 4.5, bc.y * .35, uTime * .06)));
            rays = mix(1., rays, smoothstep(.15, .9, bc.y) * .85 + .15);
            float grain = hash13(vec3(floor(gl_FragCoord.xy), floor(uTime * 24.)));
            float a = (core * 1.65 + haze * .28) * fall * dens * rays * uPower;
            a *= .82 + grain * .4;
            // sun colour: white-gold in the heart, amber in the falloff
            vec3 c = mix(vec3(1., .66, .3), vec3(1., .94, .8), core * core);
            gl_FragColor = vec4(c * a, a);
          }`,
      }),
    []
  );
  useFrame(({ clock }) => (mat.uniforms.uTime.value = clock.elapsedTime));
  return (
    <mesh material={mat} position={[2, 0.6, -0.6]}>
      <planeGeometry args={[18, 9]} />
    </mesh>
  );
}

// fine motes that only exist inside the shaft
function Dust({ count = 1100 }) {
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const q = BEAM_A.clone().lerp(BEAM_B, t * 0.85);
      const r = 0.25 + t * 0.6;
      p[i * 3] = q.x + (Math.random() - 0.5) * 0.6;
      p[i * 3 + 1] = q.y + (Math.random() - 0.5) * r;
      p[i * 3 + 2] = q.z + 0.4 + (Math.random() - 0.5) * 1.2;
      s[i] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(s, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPx: { value: 1 }, ...beamUniform },
      vertexShader: `attribute float aSeed; uniform float uTime, uPx, uPower; varying float vA;
        void main(){ vec3 p = position + vec3(sin(uTime*.2+aSeed*50.)*.15, cos(uTime*.17+aSeed*31.)*.08, 0.);
          vA = (.25 + .65 * pow(.5 + .5 * sin(uTime * .8 + aSeed * 60.), 3.)) * uPower;
          vec4 mv = modelViewMatrix * vec4(p,1.); gl_Position = projectionMatrix * mv; gl_PointSize = uPx * (1.2 + aSeed * 2.2) / -mv.z; }`,
      fragmentShader: `varying float vA;
        void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .1, d) * vA;
          gl_FragColor = vec4(vec3(1., .86, .6) * a * 1.4, a); }`,
    });
    return { geo: g, mat: m };
  }, [count]);
  useFrame(({ clock, gl }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uPx.value = gl.getPixelRatio() * 6;
  });
  return <points geometry={geo} material={mat} frustumCulled={false} />;
}

export default function Hand() {
  const group = useRef();
  const hand = useRef();
  const { scene: model, animations } = useGLTF("/models/hand.glb");
  const { camera, scene } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);

  // Skin lit only by the shaft: outside it the arm is a near-black silhouette,
  // inside it the light wraps and bleeds warm through thin edges (fingers).
  const obj = useMemo(() => {
    const r = cloneSkinned(model); // keeps the skeleton bound to the clone
    r.traverse((o) => {
      if (!o.isMesh) return;
      o.frustumCulled = false; // skinned bounds don't follow the pose
      const m = new THREE.MeshStandardMaterial({
        map: o.material.map || null,
        normalMap: o.material.normalMap || null,
        color: "#8a5a3c",
        roughness: 0.62,
        side: THREE.DoubleSide, // any remaining gaps in the scan render solid instead of see-through
      });
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, beamUniform);
        sh.vertexShader = sh.vertexShader
          .replace("#include <common>", "#include <common>\nvarying vec3 vW; varying vec3 vNormalW; varying float vArmY;")
          .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvW = (modelMatrix * vec4(transformed, 1.)).xyz; vNormalW = normalize(mat3(modelMatrix) * objectNormal); vArmY = position.y;");
        sh.fragmentShader = sh.fragmentShader
          .replace("#include <common>", `#include <common>\nvarying vec3 vW; varying vec3 vNormalW; varying float vArmY;\n${BEAM_GLSL}`)
          .replace(
            "#include <dithering_fragment>",
            `#include <dithering_fragment>
             vec2 bc = beamCoord(vW);
             float inBeam = exp(-pow(bc.x / mix(1.35, .42, bc.y), 2.) * 1.6) * smoothstep(1.35, .7, bc.y) * uPower;
             vec3 skin = diffuseColor.rgb; // albedo: the shaft is the only light
             // the scan has a few near-black texels (holes) around the wrist and thumb
             skin = max(skin, vec3(.2, .12, .08));
             // the arm extension below the scan has no real texture: plain skin fading into the dark
             skin = mix(vec3(.42, .25, .16), skin, smoothstep(-.12, .02, vArmY));
             float armFade = smoothstep(-.72, -.2, vArmY);

             // sunlight: one directional key along the shaft, so the hand has a
             // lit side and a shadow side; the shaft's falloff limits where it lands
             vec3 N = normalize(inverseTransformDirection(normal, viewMatrix)); // world, with normal map
             vec3 L = normalize(uBeamA - uBeamB);
             vec3 V = normalize(cameraPosition - vW);
             float ndl = dot(N, L);
             float key = smoothstep(-.1, .45, ndl) * inBeam;               // soft terminator
             vec3 sun = vec3(1., .82, .58) * 4.2;
             vec3 col = skin * sun * key;
             // soft specular of skin (broad, low)
             vec3 Hh = normalize(L + V);
             col += vec3(1., .88, .7) * pow(max(dot(N, Hh), 0.), 28.) * key * .18;
             // subsurface: light scattering through thin flesh just past the terminator
             float scatter = smoothstep(-.45, .05, ndl) * (1. - smoothstep(.05, .5, ndl));
             col += vec3(.95, .32, .12) * skin * scatter * inBeam * 1.6;
             // backlit fingertips/edges glow when the sun is behind them
             float backlit = pow(max(dot(V, -L), 0.), 2.) * pow(1. - abs(dot(N, V)), 2.);
             col += vec3(1., .45, .18) * backlit * inBeam * .9;
             // faint warm bounce from the bright air so the shadow side isn't dead black
             vec3 warm = vec3(1., .62, .36);
             col += skin * warm * (.035 + .06 * uPower * clamp(N.y * .5 + .5, 0., 1.));
             gl_FragColor.rgb = col;
             // extension below the scan: smooth shadowed gradient (its sliver faces
             // have unreliable normals), blended in over the last few centimetres
             vec3 dark = vec3(.42, .25, .16) * warm * (.025 + .055 * smoothstep(-.6, 0., vArmY)) * (.6 + .4 * uPower);
             gl_FragColor.rgb = mix(dark, gl_FragColor.rgb, smoothstep(-.015, .07, vArmY));
             gl_FragColor.rgb *= armFade;`
          );
      };
      m.customProgramCacheKey = () => "hand-beam";
      o.material = m;
    });
    return r;
  }, [model]);

  // "Feel" is keyed in Blender (assets-src/scene.blend, HandRig): fingers close
  // in a wave pinky -> index into a soft grasp and open again, 4 s loop.
  const mixer = useMemo(() => {
    const m = new THREE.AnimationMixer(obj);
    const clip = animations.find((c) => c.name === "Feel") || animations[0];
    if (clip) m.clipAction(clip).setLoop(THREE.LoopRepeat, Infinity).play();
    return m;
  }, [obj, animations]);

  useFrame(({ clock }, dt) => {
    const p = state.progress;
    beamUniform.uPower.value = smooth(range(p, [T.hand[0] + 0.012, T.hand[0] + 0.06]));
    const mine = owner(p) === "hand";
    group.current.visible = mine;
    if (!mine) return;
    scene.fog = null;
    const reach = smooth(range(p, [T.hand[0] + 0.035, T.hand[0] + 0.11]));
    const t = clock.elapsedTime;
    // the arm rises from below-left and the fingertips break into the light
    // touched by the light: fingers relax open, then close and open slowly as
    // if feeling its warmth; each finger keeps its own small phase in the shader
    const touch = smooth(range(p, [T.hand[0] + 0.08, T.hand[0] + 0.13]));
    const feel = 0.5 + 0.5 * Math.sin(t * 0.85);
    mixer.update(Math.min(dt, 0.1) * (0.15 + 0.85 * touch));
    const sway = Math.sin(t * 0.55);
    hand.current.position.set(
      lerp(-0.2, 0.62, reach) + sway * 0.02 * touch,
      lerp(-3.2, -0.82, reach) + Math.sin(t * 0.5) * 0.015 + feel * 0.03 * touch,
      0.2
    );
    hand.current.rotation.order = "ZYX"; // spin around the arm first, then lean it toward the light
    hand.current.rotation.set(
      0.05 + sway * 0.03 * touch,
      -1.3 + Math.sin(t * 0.3) * 0.05 + Math.sin(t * 0.85) * 0.06 * touch, // palm open to the light; wrist turns into the warmth
      lerp(-0.7, -1.05, reach) - feel * 0.04 * touch
    );
    camera.position.set(state.pointer.x * 0.1, 0.1 + state.pointer.y * 0.06, 5.6);
    look.set(0.6, 0.15, 0);
    camera.lookAt(look);
    camera.fov = 40;
    camera.updateProjectionMatrix();
  });

  return (
    <group ref={group} visible={false}>
      <group ref={hand} scale={[1.95, 2.3, 1.95]}>
        <primitive object={obj} />
      </group>
      <Beam />
      <Dust />
    </group>
  );
}
