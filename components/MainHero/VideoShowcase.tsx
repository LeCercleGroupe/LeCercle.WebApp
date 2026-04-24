"use client";

import { gsap } from "gsap";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type FitMode = "Fill" | "Fit" | "Crop" | "Tile";
type Quality = "Low" | "Medium" | "High";
type TransitionPreset =
  | "01 Classic Liquid"
  | "02 Hard Stripes"
  | "03 Swirl Lens"
  | "04 Scanline Jitter"
  | "05 Mosaic Blocks"
  | "06 Turbulent Smoke"
  | "07 Tight Wave"
  | "08 Glitch Spikes";

interface VideoShowcaseProps {
  video1: string;
  video2: string;
  video3: string;
  quality?: Quality;
  transition?: TransitionPreset;
  duration?: number;
  ease?: "Expo Out" | "Power3 Out" | "Sine InOut" | "Linear";
  transitionIntensity?: number;
  angle1?: number;
  angle2?: number;
  defaultActive?: number;
  fitMode?: FitMode;
  scale?: number;
  posX?: number;
  posY?: number;
  className?: string;
  /** Controls whether the video container renders in landscape ("horizontal") or portrait ("vertical") orientation */
  orientation?: "horizontal" | "vertical";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fitModeToFloat(m: FitMode): number {
  return m === "Fill" ? 0 : m === "Fit" ? 1 : m === "Crop" ? 2 : 3;
}
function qualityToDpr(q: Quality): number {
  return q === "Low" ? 1 : q === "High" ? 2 : 1.5;
}
function easeToGsap(e: string): string {
  switch (e) {
    case "Expo Out":
      return "expo.out";
    case "Power3 Out":
      return "power3.out";
    case "Sine InOut":
      return "sine.inOut";
    default:
      return "none";
  }
}
function presetToKind(p: TransitionPreset): number {
  const map: Record<string, number> = {
    "01 Classic Liquid": 0,
    "02 Hard Stripes": 1,
    "03 Swirl Lens": 2,
    "04 Scanline Jitter": 3,
    "05 Mosaic Blocks": 4,
    "06 Turbulent Smoke": 5,
    "07 Tight Wave": 6,
    "08 Glitch Spikes": 7,
  };
  return map[p] ?? 0;
}
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeDispTexture(kind: number, size = 256): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  const rnd = mulberry32(1337 + kind * 999);
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const smooth = (t: number) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / (size - 1),
        v = y / (size - 1);
      let r = 0.5,
        g = 0.5;
      if (kind === 0) {
        const n1 = Math.sin((u * 12 + v * 3) * Math.PI * 2);
        const n2 = Math.sin(v * 9 * Math.PI * 2 + u * 2);
        r = 0.5 + 0.5 * (0.65 * n1 + 0.35 * n2);
        g = 0.5 + 0.5 * (0.55 * n2 - 0.45 * n1);
      } else if (kind === 1) {
        const stripes = Math.sin(u * 28 * Math.PI * 2) * 0.5 + 0.5;
        const wob = Math.sin(v * 6 * Math.PI * 2 + u * 3) * 0.5 + 0.5;
        r = 0.35 + 0.65 * stripes;
        g = 0.2 + 0.8 * wob;
      } else if (kind === 2) {
        const cx = u - 0.5,
          cy = v - 0.5;
        const a2 = Math.atan2(cy, cx),
          d = Math.sqrt(cx * cx + cy * cy);
        const swirl = Math.sin(a2 * 6 + d * 18) * 0.5 + 0.5;
        r = 0.2 + 0.8 * swirl;
        g = 0.2 + 0.8 * (1 - clamp01(d * 1.25));
      } else if (kind === 3) {
        const bands = Math.sin(v * 34 * Math.PI * 2) * 0.5 + 0.5;
        const jitter = rnd() * 0.35;
        r = clamp01(0.25 + 0.75 * bands + jitter * 0.25);
        g = clamp01(0.2 + 0.8 * (1 - bands) + jitter * 0.2);
      } else if (kind === 4) {
        const cellX = Math.floor(u * 10),
          cellY = Math.floor(v * 10);
        const id = cellX * 97 + cellY * 131 + kind * 17;
        const rr = mulberry32(id)(),
          gg = mulberry32(id + 999)();
        const fu = smooth((u * 10) % 1),
          fv = smooth((v * 10) % 1);
        r = 0.25 + 0.75 * (rr * (0.35 + 0.65 * fu));
        g = 0.25 + 0.75 * (gg * (0.35 + 0.65 * fv));
      } else if (kind === 5) {
        const n =
          (Math.sin(u * 18 + v * 12) +
            Math.sin(u * 7 - v * 15) +
            Math.sin(u * 23 + v * 9)) /
          3;
        r = 0.5 + 0.5 * n;
        g = 0.5 + 0.5 * Math.sin((u + v) * 14 + n * 2);
      } else if (kind === 6) {
        const s = Math.sin(u * 40 * Math.PI * 2) * 0.5 + 0.5;
        const p = Math.sin((u + v) * 12 * Math.PI * 2) * 0.5 + 0.5;
        r = 0.25 + 0.75 * s;
        g = 0.25 + 0.75 * p;
      } else {
        const noise = rnd();
        const spike = Math.sin(v * 70 * Math.PI * 2 + u * 4) * 0.5 + 0.5;
        r = clamp01(0.2 + 0.8 * (0.65 * spike + 0.35 * noise));
        g = clamp01(0.2 + 0.8 * (0.55 * (1 - spike) + 0.45 * noise));
      }
      const i = (y * size + x) * 4;
      data[i] = Math.round(255 * clamp01(r));
      data[i + 1] = Math.round(255 * clamp01(g));
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

const vertexTrans = `
precision mediump float;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const fragTrans = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D texture1; uniform sampler2D texture2; uniform sampler2D disp;
uniform float dispFactor; uniform float effectFactor;
uniform float angle1; uniform float angle2;
uniform vec2 uScale; uniform vec2 uOffset; uniform float uFitMode;
vec2 clampUv(vec2 uv){ return clamp(uv, 0.001, 0.999); }
vec2 applyFit(vec2 uv){
  uv -= 0.5; uv *= uScale; uv += 0.5 + uOffset;
  if (uFitMode > 2.5) uv = fract(uv); else uv = clampUv(uv);
  return uv;
}
vec3 srgbToLinear(vec3 c){
  vec3 a = step(vec3(0.04045), c);
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), a);
}
vec3 linearToSrgb(vec3 c){
  c = max(c, vec3(0.0)); vec3 a = step(vec3(0.0031308), c);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, a);
}
void main() {
  vec2 uv = applyFit(vUv);
  float df = smoothstep(0.0, 1.0, dispFactor);
  vec4 d = texture2D(disp, uv);
  vec2 dispVec = (d.rg * 2.0 - 1.0);
  vec2 dir1 = vec2(cos(angle1), sin(angle1));
  vec2 dir2 = vec2(cos(angle2), sin(angle2));
  vec2 off1 = dir1 * dot(dispVec, dir1) * effectFactor;
  vec2 off2 = dir2 * dot(dispVec, dir2) * effectFactor;
  vec2 uv1 = clampUv(uv + off1 * df);
  vec2 uv2 = clampUv(uv - off2 * (1.0 - df));
  vec3 c1 = srgbToLinear(texture2D(texture1, uv1).rgb);
  vec3 c2 = srgbToLinear(texture2D(texture2, uv2).rgb);
  gl_FragColor = vec4(linearToSrgb(mix(c1, c2, df)), 1.0);
}
`;

const SLOTS = [0, 1, 2] as const;

export default function VideoShowcase({
  video1,
  video2,
  video3,
  quality = "Medium",
  transition = "01 Classic Liquid",
  duration = 0.9,
  ease = "Expo Out",
  transitionIntensity = 0.65,
  angle1 = Math.PI / 4,
  angle2 = -Math.PI / 4,
  defaultActive = 1,
  fitMode = "Crop",
  scale = 1,
  posX = 0,
  posY = 0,
  className = "",
}: VideoShowcaseProps) {
  const initIdx = Math.max(0, Math.min(2, (defaultActive || 1) - 1));
  const [activeIdx, setActiveIdx] = useState(initIdx);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const rafRef = useRef<number | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const dispRef = useRef<THREE.DataTexture | null>(null);
  const videoElemsRef = useRef<(HTMLVideoElement | null)[]>([null, null, null]);
  const videoTexsRef = useRef<(THREE.VideoTexture | null)[]>([
    null,
    null,
    null,
  ]);
  const videoAspectsRef = useRef<number[]>([1, 1, 1]);
  const activeIdxRef = useRef(initIdx);
  const isTransRef = useRef(false);
  const planeAspectRef = useRef(1);
  const sizeRef = useRef({ w: 0, h: 0, a: 1 });
  const qualityRef = useRef(quality);
  const durationRef = useRef(duration);
  const easeRef = useRef(ease);
  const fitModeRef = useRef(fitMode);
  const scaleRef = useRef(scale);
  const posXRef = useRef(posX);
  const posYRef = useRef(posY);

  useEffect(() => {
    qualityRef.current = quality;
  }, [quality]);
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);
  useEffect(() => {
    easeRef.current = ease;
  }, [ease]);
  useEffect(() => {
    fitModeRef.current = fitMode;
  }, [fitMode]);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  useEffect(() => {
    posXRef.current = posX;
  }, [posX]);
  useEffect(() => {
    posYRef.current = posY;
  }, [posY]);

  const dispKind = useMemo(() => presetToKind(transition), [transition]);

  function updateUvTransform() {
    const m = materialRef.current;
    if (!m) return;
    const planeAspect = planeAspectRef.current || 1;
    const texAspect = videoAspectsRef.current[activeIdxRef.current] || 1;
    const fm = fitModeRef.current;
    const s = Math.max(0.1, scaleRef.current || 1);
    let sx = 1,
      sy = 1;
    if (fm === "Fill") {
      sx = s;
      sy = s;
    } else if (fm === "Tile") {
      sx = (planeAspect / texAspect) * s;
      sy = s;
    } else if (planeAspect > texAspect) {
      const r = planeAspect / texAspect;
      if (fm === "Fit") {
        sx = s;
        sy = (1 / r) * s;
      } else {
        sx = r * s;
        sy = s;
      }
    } else {
      const r = texAspect / planeAspect;
      if (fm === "Fit") {
        sx = (1 / r) * s;
        sy = s;
      } else {
        sx = s;
        sy = r * s;
      }
    }
    const ox = Math.max(-1, Math.min(1, posXRef.current || 0)) * 0.5;
    const oy = Math.max(-1, Math.min(1, posYRef.current || 0)) * 0.5;
    m.uniforms.uScale.value.set(sx, sy);
    m.uniforms.uOffset.value.set(ox, oy);
    m.uniforms.uFitMode.value = fitModeToFloat(fm);
    m.needsUpdate = true;
  }

  function applySize(el: HTMLDivElement) {
    const r = rendererRef.current,
      c = cameraRef.current,
      m = meshRef.current;
    if (!r || !c || !m) return;
    const rect = el.getBoundingClientRect();
    const w = Math.max(1, rect.width || el.clientWidth || 1);
    const h = Math.max(1, rect.height || el.clientHeight || 1);
    const a = w / h;
    const dpr = Math.min(
      (window.devicePixelRatio || 1) * qualityToDpr(qualityRef.current),
      3,
    );
    r.setPixelRatio(dpr);
    r.setSize(w, h, false);
    if (a !== sizeRef.current.a) {
      planeAspectRef.current = a;
      c.left = -a;
      c.right = a;
      c.top = 1;
      c.bottom = -1;
      c.updateProjectionMatrix();
      m.geometry.dispose();
      m.geometry = new THREE.PlaneGeometry(2 * a, 2, 1, 1);
    }
    sizeRef.current = { w, h, a };
    updateUvTransform();
  }

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || rendererRef.current) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const rect = el.getBoundingClientRect();
    const w = Math.max(1, rect.width || el.clientWidth || 1);
    const h = Math.max(1, rect.height || el.clientHeight || 1);
    const a = w / h;
    planeAspectRef.current = a;
    sizeRef.current = { w, h, a };
    const camera = new THREE.OrthographicCamera(-a, a, 1, -1, 0.1, 10);
    camera.position.z = 2;
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    const canvas = renderer.domElement;
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;";
    el.appendChild(canvas);
    const dispTex = makeDispTexture(dispKind, 256);
    dispRef.current = dispTex;
    const geometry = new THREE.PlaneGeometry(2 * a, 2, 1, 1);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        dispFactor: { value: 0 },
        effectFactor: { value: transitionIntensity },
        angle1: { value: angle1 },
        angle2: { value: angle2 },
        uScale: { value: new THREE.Vector2(1, 1) },
        uOffset: { value: new THREE.Vector2(0, 0) },
        uFitMode: { value: fitModeToFloat(fitMode) },
        texture1: { value: null },
        texture2: { value: null },
        disp: { value: dispTex },
      },
      vertexShader: vertexTrans,
      fragmentShader: fragTrans,
      transparent: true,
    });
    materialRef.current = material;
    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene.add(mesh);
    applySize(el);
    let warm = 0;
    const tick = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current)
        return;
      if (warm < 12) {
        warm++;
        const e = containerRef.current;
        if (e) applySize(e);
      }
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
    roRef.current = new ResizeObserver(() => {
      const e = containerRef.current;
      if (e) applySize(e);
    });
    roRef.current.observe(el);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (roRef.current) roRef.current.disconnect();
      if (tweenRef.current) tweenRef.current.kill();
      videoElemsRef.current.forEach((v) => {
        if (v) {
          v.pause();
          v.src = "";
          v.load();
        }
      });
      videoTexsRef.current.forEach((t) => {
        try {
          t?.dispose();
        } catch {}
      });
      try {
        geometry.dispose();
      } catch {}
      try {
        material.dispose();
      } catch {}
      try {
        dispTex.dispose();
      } catch {}
      try {
        renderer.dispose();
      } catch {}
      if (renderer.domElement?.parentNode)
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      meshRef.current = null;
      materialRef.current = null;
    };
  }, []);

  useEffect(() => {
    const m = materialRef.current;
    if (!m) return;
    m.uniforms.effectFactor.value = transitionIntensity;
    m.uniforms.angle1.value = angle1;
    m.uniforms.angle2.value = angle2;
    m.needsUpdate = true;
  }, [transitionIntensity, angle1, angle2]);

  useEffect(() => {
    updateUvTransform();
  }, [fitMode, scale, posX, posY]);

  useEffect(() => {
    const m = materialRef.current;
    if (!m) return;
    const tex = makeDispTexture(dispKind, 256);
    dispRef.current?.dispose();
    dispRef.current = tex;
    m.uniforms.disp.value = tex;
    m.needsUpdate = true;
  }, [dispKind]);

  useEffect(() => {
    const srcs = [video1, video2, video3];
    videoElemsRef.current.forEach((v, i) => {
      if (v) {
        v.pause();
        v.src = "";
        v.load();
      }
      videoElemsRef.current[i] = null;
      try {
        videoTexsRef.current[i]?.dispose();
      } catch {}
      videoTexsRef.current[i] = null;
    });
    srcs.forEach((src, i) => {
      if (!src) return;
      const vid = document.createElement("video");
      vid.src = src;
      vid.crossOrigin = "anonymous";
      vid.loop = true;
      vid.muted = true;
      vid.playsInline = true;
      vid.preload = "auto";
      videoElemsRef.current[i] = vid;
      vid.addEventListener(
        "canplay",
        () => {
          const tex = new THREE.VideoTexture(vid);
          tex.minFilter = tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          vid.play().catch(() => {});
          videoTexsRef.current[i] = tex;
          if (vid.videoWidth && vid.videoHeight)
            videoAspectsRef.current[i] = vid.videoWidth / vid.videoHeight;
          const m = materialRef.current;
          if (m && i === activeIdxRef.current && !isTransRef.current) {
            m.uniforms.texture1.value = tex;
            m.needsUpdate = true;
            updateUvTransform();
          }
        },
        { once: true },
      );
      vid.load();
    });
  }, [video1, video2, video3]);

  useEffect(() => {
    const newIdx = Math.max(0, Math.min(2, (defaultActive || 1) - 1));
    if (newIdx === activeIdxRef.current || isTransRef.current) return;
    const m = materialRef.current;
    if (!m) return;
    const fromTex = videoTexsRef.current[activeIdxRef.current] ?? null;
    const toTex = videoTexsRef.current[newIdx] ?? null;
    m.uniforms.texture1.value = fromTex;
    m.uniforms.texture2.value = toTex;
    m.uniforms.dispFactor.value = 0;
    m.needsUpdate = true;
    isTransRef.current = true;
    setActiveIdx(newIdx);
    if (tweenRef.current) tweenRef.current.kill();
    tweenRef.current = gsap.to(m.uniforms.dispFactor, {
      value: 1,
      duration: Math.max(0.05, durationRef.current),
      ease: easeToGsap(easeRef.current),
      onComplete: () => {
        m.uniforms.texture1.value = toTex;
        m.uniforms.dispFactor.value = 0;
        m.needsUpdate = true;
        activeIdxRef.current = newIdx;
        if (videoAspectsRef.current[newIdx]) updateUvTransform();
        isTransRef.current = false;
      },
    });
  }, [defaultActive]);

  const handleSelect = (idx: number) => {
    if (idx === activeIdxRef.current || isTransRef.current) return;
    const m = materialRef.current;
    if (!m) return;
    const fromTex = videoTexsRef.current[activeIdxRef.current] ?? null;
    const toTex = videoTexsRef.current[idx] ?? null;
    m.uniforms.texture1.value = fromTex;
    m.uniforms.texture2.value = toTex;
    m.uniforms.dispFactor.value = 0;
    m.needsUpdate = true;
    isTransRef.current = true;
    setActiveIdx(idx);
    if (tweenRef.current) tweenRef.current.kill();
    tweenRef.current = gsap.to(m.uniforms.dispFactor, {
      value: 1,
      duration: Math.max(0.05, durationRef.current),
      ease: easeToGsap(easeRef.current),
      onComplete: () => {
        m.uniforms.texture1.value = toTex;
        m.uniforms.dispFactor.value = 0;
        m.needsUpdate = true;
        activeIdxRef.current = idx;
        if (videoAspectsRef.current[idx]) updateUvTransform();
        isTransRef.current = false;
      },
    });
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        minWidth: 320,
        minHeight: 200,
      }}
    />
  );
}
