"use client";

import { useEffect, useSyncExternalStore } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { state, subscribe, getSnapshot } from "@/lib/store";
import { SCROLL_SCREENS } from "@/lib/timeline";

gsap.registerPlugin(ScrollTrigger);

let lenis = null;

export function scrollToProgress(p, immediate = false) {
  if (!lenis) return;
  const max = document.documentElement.scrollHeight - innerHeight;
  lenis.scrollTo(p * max, { immediate, duration: immediate ? 0 : 2.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
}

// The page is one tall, empty track. Lenis smooths the wheel, and its progress
// becomes the single clock that every 3D scene and HUD overlay reads.
export default function SmoothScroll() {
  const { entered } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.8, touchMultiplier: 1.4, syncTouch: true });
    lenis.stop();
    lenis.on("scroll", (l) => {
      state.progress = l.progress || 0;
      state.velocity = l.velocity;
      ScrollTrigger.update();
    });
    const raf = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onMove = (e) => {
      state.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      state.pointer.y = -(e.clientY / innerHeight) * 2 + 1;
    };
    addEventListener("pointermove", onMove);
    return () => {
      gsap.ticker.remove(raf);
      removeEventListener("pointermove", onMove);
      lenis.destroy();
      lenis = null;
    };
  }, []);

  useEffect(() => {
    if (entered) lenis?.start();
  }, [entered]);

  return <div aria-hidden style={{ height: `${SCROLL_SCREENS * 100}svh` }} />;
}
