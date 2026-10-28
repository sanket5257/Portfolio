"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { state } from "@/lib/store";
import { T, range, smooth, easeIn } from "@/lib/timeline";
import { NOISE } from "./shaders";

// Portal: noise sampled on circles of the twisted angle, so features stretch
// into long curved streaks (fluid, not a cartoon spiral). Bright pale rim,
// deep navy eye threaded with electric-blue filaments. During the dive it
// floods to white while the swirl stays faintly visible underneath.
const frag = /* glsl */ `
  ${NOISE}
  varying vec2 vUv;
  uniform float uTime, uOpen, uWhite, uSpin;
  void main(){
    vec2 p = vUv * 2. - 1.;
    float r = length(p);
    float a = atan(p.y, p.x);
    float th = a - uSpin + 2.4 * log(r + .06);
    // streaks: slow along the arc, fast across it
    vec3 q = vec3(cos(th) * 1.3, sin(th) * 1.3, r * 5.5 - uTime * .35);
    float n = fbm(q + fbm(q * 1.7 + 3.) * .8);
    float fil = fbm(vec3(cos(th * 2.) * 2.6, sin(th * 2.) * 2.6, r * 11. - uTime * .6));

    vec3 navy = vec3(.01, .03, .2);
    vec3 blue = vec3(.06, .25, .95);
    vec3 pale = vec3(.78, .86, 1.);
    float outer = smoothstep(.18, .85, r);
    vec3 col = mix(navy, blue, smoothstep(.3, .7, n));
    col = mix(col, pale, outer * smoothstep(.45, .8, n + outer * .15));
    // electric filaments around the eye
    col += vec3(.1, .45, 1.) * smoothstep(.55, .8, fil) * (1. - smoothstep(.05, .45, r)) * 1.4;
    col *= mix(.35, 1., smoothstep(.0, .12, r));

    // flood to white, keeping a ghost of the streaks
    col = mix(col, mix(vec3(.93, .96, 1.), col, .18), uWhite * smoothstep(.0, .5, r + uWhite * .4));

    float edge = 1. - smoothstep(.86, 1., r);
    float alpha = edge * smoothstep(0., .2, uOpen * 1.2 - r) * smoothstep(0., .06, uOpen);
    gl_FragColor = vec4(col * 1.05, alpha);
  }
`;

const haloFrag = /* glsl */ `
  varying vec2 vUv;
  uniform float uOpen, uWhite;
  void main(){
    float r = length(vUv * 2. - 1.);
    float a = smoothstep(1., .5, r) * uOpen * (.12 + uWhite * .6);
    gl_FragColor = vec4(vec3(.25, .5, 1.) * a, a);
  }
`;

const vert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`;

export default function Vortex({ center, radius }) {
  const light = useRef();
  const { mat, halo } = useMemo(() => {
    const uniforms = { uTime: { value: 0 }, uOpen: { value: 0 }, uWhite: { value: 0 }, uSpin: { value: 0 } };
    return {
      mat: new THREE.ShaderMaterial({ transparent: true, depthWrite: false, toneMapped: false, uniforms, vertexShader: vert, fragmentShader: frag }),
      halo: new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        uniforms,
        vertexShader: vert,
        fragmentShader: haloFrag,
      }),
    };
  }, []);

  useFrame(({ clock }) => {
    const p = state.progress;
    const open = smooth(range(p, T.vortex));
    const dv = easeIn(range(p, T.dive));
    const u = mat.uniforms;
    u.uTime.value = clock.elapsedTime;
    u.uOpen.value = open;
    u.uSpin.value = clock.elapsedTime * (0.35 + dv * 1.6) + p * 18;
    u.uWhite.value = 0; // no white-out: the next scene opens from the portal's eye
    if (light.current) light.current.intensity = open * 10 + dv * 20;
  });

  return (
    <group position={center}>
      <mesh material={halo} position={[0, 0, -0.12]}>
        <planeGeometry args={[radius * 3.4, radius * 3.4]} />
      </mesh>
      <mesh material={mat} position={[0, 0, -0.05]}>
        <circleGeometry args={[radius, 128]} />
      </mesh>
      <pointLight ref={light} position={[0, 0, 0.9]} color="#4aa8ff" intensity={0} distance={7} decay={1.6} />
    </group>
  );
}
