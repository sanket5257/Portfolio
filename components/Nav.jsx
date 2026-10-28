"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import s from "./Nav.module.css";
import { site } from "@/lib/content";
import { subscribe, getSnapshot, set } from "@/lib/store";
import { setSound } from "@/lib/audio";
import { scrollToProgress } from "./SmoothScroll";
import { T } from "@/lib/timeline";
import { Logo, SoundIcon, MenuIcon } from "./ui/icons";

const LINKS = [
  { label: "HOME", to: 0 },
  { label: "PROJECTS", to: T.projects[0] + 0.035 },
  { label: "ABOUT", to: T.flower[0] + 0.045 },
  { label: "CONTACT", to: 0.985 },
];

export default function Nav() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panel = useRef(null);
  const tl = useRef(null);

  // menu: a hairline draws in from the right, then each link un-clips
  useEffect(() => {
    const el = panel.current;
    tl.current = gsap
      .timeline({ paused: true })
      .to(el.querySelector("[data-line]"), { width: "100%", duration: 0.5, ease: "power3.inOut" })
      .to(
        el.querySelectorAll("[data-item]"),
        { clipPath: "inset(0 0 0 0%)", duration: 0.55, ease: "power3.out", stagger: 0.06 },
        "-=0.2"
      );
  }, []);

  useEffect(() => {
    if (!tl.current) return;
    open ? tl.current.timeScale(1).play() : tl.current.timeScale(1.6).reverse();
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const toggleSound = () => {
    const on = !snap.sound;
    set({ sound: on });
    setSound(on);
  };

  return (
    <nav className={`${s.nav} ${snap.entered ? s.visible : ""}`}>
      <button className={s.logoWrap} onClick={() => scrollToProgress(0)} aria-label="Back to start">
        <Logo className={s.logo} />
      </button>

      <button className={`${s.iconButton} ${s.sound}`} onClick={toggleSound} aria-label="Toggle sound">
        <SoundIcon on={snap.sound} className={s.soundSvg} />
      </button>

      <span className={s.availabilityWrap}>
        <button className={s.availability} onClick={copy} title={`Copy ${site.email}`}>
          <span className={`${s.dot} ${site.available ? "" : s.unavailable}`} />
          <span className={s.availStrong}>{site.available ? "AVAILABLE" : "BOOKED"}</span>
        </button>
        <span className={s.copied} data-show={copied}>
          EMAIL COPIED
        </span>
      </span>

      <button
        className={`${s.iconButton} ${s.menu}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Menu"
      >
        <MenuIcon className={s.menuSvg} />
      </button>

      <div className={s.menuPanel} ref={panel} aria-hidden={!open}>
        <div className={s.line} data-line />
        <ul className={s.links}>
          {LINKS.map((l) => (
            <li key={l.label} className={s.linkItem} data-item>
              <button
                className={s.link}
                tabIndex={open ? 0 : -1}
                onClick={() => {
                  setOpen(false);
                  scrollToProgress(l.to);
                }}
              >
                <span className={s.linkLabel}>{l.label}</span>
                <svg className={s.linkHoverDot} viewBox="0 0 10 10">
                  <circle cx="5" cy="5" r="5" fill="currentColor" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
