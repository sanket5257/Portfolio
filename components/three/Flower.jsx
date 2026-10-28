"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { state } from "@/lib/store";
import { T, range, smooth, lerp, owner } from "@/lib/timeline";

const SCALE = 5.2;
// placement chosen so the frame matches the end of the strands shot:
// glowing stem on the right third, blossom near the top-right
const ROOT = new THREE.Vector3(2.0, -4.6, 0);

const lens = { x: 0, y: 0, w: 0, h: 0 }; // css px, written by the HUD

export function setLens(x, y, w, h) {
  Object.assign(lens, { x, y, w, h });
}

// Ghost material: translucent white petals with a fresnel rim. Inside the HUD
// lens rectangle the same surface is shaded as an "x-ray": blue, vein detail
// pulled from the albedo, so the box reads as a scanner over the flower.
// uOpen folds petals into a bud (0) and lets them bloom (1).
function flowerMaterial(src, head) {
  const m = new THREE.MeshStandardMaterial({
    map: src.map || null,
    normalMap: src.normalMap || null,
    color: "#eef6f4",
    roughness: 0.45,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
    side: THREE.DoubleSide,
    emissive: new THREE.Color("#7fb8b2"),
    emissiveIntensity: 0.55,
  });
  const uniforms = {
    uOpen: { value: 1 },
    uLens: { value: new THREE.Vector4() },
    uHead: { value: head.clone() },
    uTime: { value: 0 },
  };
  m.userData.uniforms = uniforms;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uOpen, uTime; uniform vec3 uHead; varying float vObjY; varying vec2 vObjXZ;"
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         // fold: above the receptacle, pull petals toward the axis and lift them
         float above = max(position.y - uHead.y, 0.);
         vec2 rad = position.xz - uHead.xz;
         float d = length(rad);
         float closed = 1. - uOpen;
         float k = smoothstep(0., .04, above + d * .4);
         transformed.xz = uHead.xz + rad * mix(1., .16, closed * k);
         transformed.y += d * closed * k * 1.1;
         transformed.xz += rad * sin(uTime * .8 + d * 6.) * .02 * uOpen;
         vObjY = position.y; vObjXZ = position.xz;`
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform vec4 uLens; uniform vec3 uHead; varying float vObjY; varying vec2 vObjXZ;"
      )
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
         float fr = pow(1. - abs(dot(normalize(vViewPosition), normal)), 2.);
         // translucent light, not plastic: wash toward pale cyan, rim carries the form
         gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(.86, .95, .96), .55);
         gl_FragColor.rgb += vec3(.7, .95, 1.) * fr * .9;
         gl_FragColor.a = mix(.22, .8, fr);
         // the model's own stem glows like the strands that grew it
         float stemGlow = step(vObjY, uHead.y - .05) * step(length(vObjXZ - uHead.xz), .05);
         gl_FragColor.rgb += vec3(1.4, 1.7, 1.6) * stemGlow;
         vec2 fc = gl_FragCoord.xy;
         float inLens = step(uLens.x, fc.x) * step(fc.x, uLens.x + uLens.z) * step(uLens.y, fc.y) * step(fc.y, uLens.y + uLens.w);
         if (inLens > .5) {
           float luma = dot(diffuseColor.rgb, vec3(.299, .587, .114));
           vec3 xr = vec3(.04, .3, .95) * (.35 + fr * 1.6);
           xr += vec3(.3, .7, 1.) * smoothstep(.75, .35, luma) * .55; // veins
           gl_FragColor = vec4(xr, .97);
         }`
      );
  };
  m.customProgramCacheKey = () => "flower-xray";
  return m;
}

function Stem({ height }) {
  // the glowing stem continues off the bottom of the frame into the strands
  const core = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.6, -12, 0),
      new THREE.Vector3(0.3, -7, 0),
      new THREE.Vector3(0.05, -2.5, 0),
      new THREE.Vector3(0, height, 0),
    ]);
    return c;
  }, [height]);
  const tube = useMemo(() => new THREE.TubeGeometry(core, 120, 0.016, 8, false), [core]);
  const hazeGeo = useMemo(() => new THREE.TubeGeometry(core, 120, 0.7, 12, false), [core]);
  const hazeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        side: THREE.DoubleSide,
        vertexShader: `varying vec3 vN; varying vec3 vV; varying vec2 vUv;
          void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `varying vec3 vN; varying vec3 vV; varying vec2 vUv;
          void main(){ float f = pow(abs(dot(vN, vV)), 3.); float a = f * .22 * smoothstep(1., .9, vUv.x);
            gl_FragColor = vec4(vec3(.55, .9, .85) * a, a); }`,
      }),
    []
  );
  return (
    <>
      <mesh geometry={hazeGeo} material={hazeMat} />
      <mesh geometry={tube}>
        <meshBasicMaterial color={[2.4, 2.8, 2.7]} toneMapped={false} />
      </mesh>
    </>
  );
}

function Stars({ count = 900 }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 40;
      p[i * 3 + 1] = (Math.random() - 0.5) * 26;
      p[i * 3 + 2] = -Math.random() * 18 - 3;
    }
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [count]);
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.03} color="#d6ecff" transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export default function Flower() {
  const group = useRef();
  const flower = useRef();
  const { scene: model } = useGLTF("/models/flower.glb");
  const { camera, scene, size, gl } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const v = useMemo(() => new THREE.Vector3(), []);

  const { obj, mats, head, anchors, stemTopLocal } = useMemo(() => {
    const r = model.clone(true);
    const box = new THREE.Box3().setFromObject(r);
    const h = box.max.y - box.min.y;
    // receptacle sits roughly a third down from the top of the blossom
    const head = new THREE.Vector3((box.min.x + box.max.x) / 2, box.max.y - h * 0.3, (box.min.z + box.max.z) / 2);
    const mats = [];
    r.traverse((o) => {
      if (o.isMesh) {
        o.material = flowerMaterial(o.material, head);
        mats.push(o.material);
      }
    });
    const anchors = {
      head: head.clone().add(new THREE.Vector3(0, h * 0.12, 0)),
      petal: head.clone().add(new THREE.Vector3(-h * 0.25, h * 0.05, 0.05)),
      stamen: head.clone().add(new THREE.Vector3(0, h * 0.2, 0.05)),
      stem: new THREE.Vector3(head.x, box.min.y + h * 0.3, head.z),
    };
    return { obj: r, mats, head, anchors, stemTopLocal: box.min.y };
  }, [model]);

  useFrame(({ clock }) => {
    const p = state.progress;
    const mine = owner(p) === "flower";
    group.current.visible = mine;
    if (!mine) {
      state.anchors = null;
      return;
    }
    scene.fog = null;
    const u = range(p, T.flower);
    const t = clock.elapsedTime;
    const open = smooth(range(u, [0.02, 0.32]));
    const dpr = gl.getPixelRatio();
    mats.forEach((m) => {
      m.userData.uniforms.uOpen.value = open;
      m.userData.uniforms.uTime.value = t;
      m.userData.uniforms.uLens.value.set(lens.x * dpr, (size.height - lens.y - lens.h) * dpr, lens.w * dpr, lens.h * dpr);
    });
    flower.current.rotation.y = -0.6 + Math.sin(t * 0.25) * 0.15 + u * 0.9;
    // continue the upward tracking shot, settle with the blossom top-right
    const settle = smooth(range(u, [0, 0.3]));
    const leave = smooth(range(u, [0.88, 1]));
    camera.position.set(lerp(1.4, 0, settle) + state.pointer.x * 0.18, lerp(-2.2, 0.35, settle) + state.pointer.y * 0.1 - leave * 2.5, 7.4);
    look.set(lerp(1.4, 0, settle), lerp(-1.6, 0.35, settle) - leave * 2.5, 0);
    camera.lookAt(look);
    camera.fov = 40;
    camera.updateProjectionMatrix();

    const out = {};
    for (const [k, a] of Object.entries(anchors)) {
      v.copy(a).applyMatrix4(flower.current.matrixWorld).project(camera);
      out[k] = [(v.x * 0.5 + 0.5) * size.width, (-v.y * 0.5 + 0.5) * size.height];
    }
    state.anchors = out;
  });

  return (
    <group ref={group} visible={false}>
      <ambientLight intensity={0.3} />
      <pointLight position={[2.5, 3, 3]} intensity={10} color="#d9fbff" />
      <pointLight position={[-2, 0, 2]} intensity={4} color="#4d9fff" />
      <group position={ROOT}>
        <group ref={flower} scale={SCALE} position={[0, -stemTopLocal * SCALE, 0]}>
          <primitive object={obj} />
        </group>
        <Stem height={0.02} />
      </group>
      <Stars />
    </group>
  );
}
