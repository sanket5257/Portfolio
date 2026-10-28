// Shared GLSL chunks and material patchers.

export const NOISE = /* glsl */ `
vec3 hash33(vec3 p){
  p = fract(p * vec3(.1031, .1030, .0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}
float hash13(vec3 p){ p = fract(p * .1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float vnoise(vec3 p){
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x),
                 mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x),
                 mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){
  float a = .5, s = 0.;
  for (int i = 0; i < 5; i++){ s += a * vnoise(p); p = p * 2.03 + 11.7; a *= .5; }
  return s;
}
// distance to the nearest Voronoi cell border: thin lines = cracks
float voronoiEdge(vec3 p){
  vec3 n = floor(p), f = fract(p);
  float d1 = 8., d2 = 8.;
  for (int k = -1; k <= 1; k++) for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
    vec3 g = vec3(i, j, k);
    vec3 o = hash33(n + g);
    vec3 r = g + o - f;
    float d = dot(r, r);
    if (d < d1){ d2 = d1; d1 = d; } else if (d < d2){ d2 = d; }
  }
  return sqrt(d2) - sqrt(d1);
}
`;

// Patches a MeshStandardMaterial into weathered stone: mottled albedo, moss on
// up-facing surfaces, and optional glowing cracks driven by uniforms.uCrack.
export function stoneMaterial(THREE, { color = "#6d6250", moss = 0.6, cracks = false, seed = 0 } = {}) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.94, metalness: 0 });
  const uniforms = {
    uCrack: { value: 0 },
    uTime: { value: 0 },
    uSeed: { value: seed },
    uCrackColor: { value: new THREE.Color("#58c4ff") },
  };
  mat.userData.uniforms = uniforms;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vObj; varying vec3 vWN;")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvObj = position; vWN = normalize(mat3(modelMatrix) * normal);"
      );
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         uniform float uCrack; uniform float uTime; uniform float uSeed; uniform vec3 uCrackColor;
         varying vec3 vObj; varying vec3 vWN;
         ${NOISE}`
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
         vec3 sp = vObj * 3.1 + uSeed * 7.3;
         float mott = fbm(sp * 1.7);
         float pits = smoothstep(.62, .78, vnoise(sp * 9.));
         diffuseColor.rgb *= mix(.7, 1.12, mott);
         diffuseColor.rgb *= 1. - pits * .55;
         float up = smoothstep(.35, .9, vWN.y) * smoothstep(.42, .6, fbm(sp * 2.3 + 4.));
         diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.11, .14, .07) * (.6 + mott), up * ${moss.toFixed(2)});`
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
         ${
           cracks
             ? `float e = voronoiEdge(vObj * 4.2 + uSeed);
                float crack = 1. - smoothstep(.0, .06, e);
                float flicker = .75 + .25 * sin(uTime * 3. + uSeed * 10. + vObj.x * 6.);
                totalEmissiveRadiance += uCrackColor * crack * uCrack * 3.2 * flicker;
                totalEmissiveRadiance += uCrackColor * .05 * uCrack;`
             : ""
         }`
      );
  };
  mat.customProgramCacheKey = () => `stone-${cracks}-${moss}`;
  return mat;
}

// Plants: keep their texture but darken, add a wind sway and a subtle
// translucent rim so leaves read against the black cave.
export function foliagePatch(THREE, mat, { sway = 0.06, tint = null } = {}) {
  const uniforms = { uTime: { value: 0 } };
  mat.userData.uniforms = uniforms;
  if (tint) mat.color = new THREE.Color(tint);
  mat.side = THREE.DoubleSide;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         float h = max(position.y, 0.);
         vec4 wp = modelMatrix * vec4(position, 1.);
         transformed.x += sin(uTime * 1.3 + wp.x * 2.1 + wp.z) * ${sway.toFixed(3)} * h * h;
         transformed.z += cos(uTime * 1.1 + wp.z * 1.7) * ${(sway * 0.6).toFixed(3)} * h * h;`
      );
  };
  mat.customProgramCacheKey = () => `foliage-${sway}`;
  return mat;
}

// Keeps a scanned/AI-textured material intact and only adds the glowing
// fracture lines that ignite when the arch becomes the portal ring.
export function crackPatch(THREE, src, { seed = 0, darken = 0.62 } = {}) {
  const mat = src.clone();
  mat.color = new THREE.Color().setScalar(darken);
  mat.roughness = 1;
  mat.metalness = 0;
  mat.metalnessMap = null;
  mat.envMapIntensity = 0.2;
  const uniforms = {
    uCrack: { value: 0 },
    uTime: { value: 0 },
    uSeed: { value: seed },
    uCrackColor: { value: new THREE.Color("#58c4ff") },
  };
  mat.userData.uniforms = uniforms;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vObj;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObj = position;");
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         uniform float uCrack; uniform float uTime; uniform float uSeed; uniform vec3 uCrackColor;
         varying vec3 vObj;
         ${NOISE}`
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
         if (uCrack > .001) {
           float e = voronoiEdge(vObj * 2.1 + uSeed);
           float crack = 1. - smoothstep(.0, .03, e);
           float flicker = .75 + .25 * sin(uTime * 3. + uSeed * 10. + vObj.x * 6.);
           totalEmissiveRadiance += uCrackColor * crack * uCrack * 2.6 * flicker;
           totalEmissiveRadiance += uCrackColor * .04 * uCrack;
         }`
      );
  };
  mat.customProgramCacheKey = () => "crack-patch";
  return mat;
}
