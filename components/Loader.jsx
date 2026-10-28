"use client";

import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import gsap from "gsap";
import s from "./Loader.module.css";
import { site } from "@/lib/content";
import { state, set } from "@/lib/store";
import { startAudio } from "@/lib/audio";
import {
  Logo,
  Spark,
  Planet,
  DotsGrid,
  Layers,
  Rings,
  Chevrons,
  Barcode,
} from "./ui/icons";

const CTA = "ENTER IN THE EXPERIENCE";

function statusFor(p, item) {
  if (p >= 100) return { label: "READY" };
  if (p < 14) return { label: "COMPILING SHADERS" };
  if (p < 32) return { label: "RESOLVING SCENE GRAPH" };
  if (p < 90) {
    const asset = item ? item.split("/").pop().split("?")[0] : "";
    return { label: "LOADING", asset };
  }
  return { label: "WARMING TEXTURES" };
}

export default function Loader() {
  const { progress, item, active } = useProgress();
  const [shown, setShown] = useState(0);
  const [gate, setGate] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);
  const target = useRef(0);
  const ctaRef = useRef(null);

  // Real progress drives the counter, but it never jumps: it eases toward the
  // target and the last 10% waits for the scene to report shaders compiled.
  useEffect(() => {
    target.current = Math.min(progress, 90);
  }, [progress]);

  useEffect(() => {
    let raf;
    let val = 0;
    const start = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      // a floor so the sequence always plays at a readable pace
      const floor = Math.min(elapsed * 22, 90);
      let goal = Math.min(Math.max(target.current, active ? 0 : floor), floor + 8);
      if (state.loaded && !active) goal = 100;
      val += (goal - val) * 0.06;
      if (goal === 100 && 100 - val < 0.4) val = 100;
      setShown(val);
      if (val < 100) raf = requestAnimationFrame(tick);
      else setTimeout(() => setGate(true), 350);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const enter = () => {
    if (!gate || exiting) return;
    setExiting(true);
    startAudio();
    set({ entered: true, sound: true });
    setTimeout(() => setGone(true), 1600);
  };

  const rollChars = (dir) => {
    if (!ctaRef.current) return;
    const fronts = ctaRef.current.querySelectorAll("[data-roll=front]");
    const unders = ctaRef.current.querySelectorAll("[data-roll=under]");
    gsap.to(fronts, { yPercent: dir ? -110 : 0, duration: 0.45, ease: "power3.out", stagger: 0.012, overwrite: true });
    gsap.to(unders, { yPercent: dir ? 0 : 110, duration: 0.45, ease: "power3.out", stagger: 0.012, overwrite: true });
  };

  if (gone) return null;
  const pct = Math.floor(shown);
  const st = statusFor(pct, item);

  return (
    <div
      className={`${s.loader} ${gate ? s.gate : ""} ${exiting ? s.exiting : ""} ${pct < 100 ? s.warming : ""}`}
      style={{ "--load-p": shown / 100 }}
      aria-busy={!gate}
    >
      <div className={s.frameGrid} />
      <div className={`${s.frameLine} ${s.lineLeft}`} />
      <div className={`${s.frameLine} ${s.lineRight}`} />
      <div className={`${s.frameLine} ${s.lineTop}`} />
      <div className={`${s.frameLine} ${s.lineBottom}`} />

      <header className={s.header}>
        <span className={s.brandName}>{site.name}</span>
        <span className={s.brandRole}>{site.role}</span>
      </header>

      <Logo className={s.logo} />

      <div className={s.progressZone}>
        <span className={s.status}>
          {st.label}
          {st.asset ? <span className={s.statusAsset}> {st.asset}</span> : null}
        </span>
        <button
          ref={ctaRef}
          type="button"
          className={s.cta}
          disabled={!gate}
          tabIndex={gate ? 0 : -1}
          aria-label="Enter the experience"
          onClick={enter}
          onMouseEnter={() => rollChars(true)}
          onMouseLeave={() => rollChars(false)}
        >
          <span className={s.ctaLabel} aria-hidden="true">
            {CTA.split("").map((c, i) => (
              <span key={i} className={s.ctaChar}>
                <span data-roll="front">{c === " " ? " " : c}</span>
                <span data-roll="under" className={s.under}>
                  {c === " " ? " " : c}
                </span>
              </span>
            ))}
          </span>
        </button>
        <div className={s.track}>
          <div className={s.fill} style={{ width: `${gate ? 100 : shown}%` }} />
        </div>
      </div>

      <div className={s.cornerImage}>
        <img src="/loader/plant.webp" alt="" className={s.cornerMedia} />
        <span className={s.cornerTag}>.GLB</span>
        <span className={s.cornerWord}>PLANTS</span>
      </div>

      <span className={s.bigPercent}>{pct}</span>

      <div className={s.ticket}>
        <div className={s.artGrid} />
        <img src="/loader/arch-wire.webp" alt="" className={s.archImage} />
        <span className={s.variantLabel}>
          <Chevrons className={s.chev} />
          VARIANT <span className={s.accent}>01</span>
        </span>
        <span className={s.archLabel}>ARCH //</span>
        <Spark className={s.spark} />
        <Planet className={s.planet} />
        <DotsGrid className={s.dots} />
        <div className={s.separator} />
        <Layers className={s.layers} />
        <Rings className={s.rings} />
        <span className={s.onlinePill}>ONLINE</span>
        <span className={s.cardNumber}>{String(pct).padStart(3, "0")}</span>
        <span className={s.cardPortfolio}>
          {"PORTFOLIO".split("").map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </span>
        <span className={s.madeIn}>
          MADE IN
          <br />
          <span className={s.accent}>EARTH</span>
        </span>
        <span className={s.plusGrid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className={i === 5 ? s.accent : undefined}>
              {i === 5 ? "×" : "+"}
            </span>
          ))}
        </span>
        <div className={s.barcodeBox}>
          <Barcode value={site.domain} className={s.barcode} />
        </div>
        <span className={s.barcodeLabel}>{site.domain}</span>
        <Logo className={s.cardLogo} />
        <span className={s.cardYear}>© {new Date().getFullYear()}</span>
      </div>

      <button
        type="button"
        className={`${s.lite} ${s.liteVisible}`}
        onClick={() => set({ lite: !state.lite })}
      >
        <span className={s.liteArrow}>↘</span> LITE VERSION
      </button>
    </div>
  );
}
