"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import s from "./Overlays.module.css";
import { state, set, subscribe, getSnapshot } from "@/lib/store";
import { T, range, smooth, lerp, window01, owner, dipAmount } from "@/lib/timeline";
import { projects, story, about, site } from "@/lib/content";
import { step } from "./three/Projects";
import { setLens } from "./three/Flower";
import { ArrowDR, SocialIcon } from "./ui/icons";

// One rAF drives every overlay so DOM and WebGL read the same progress value.
function useFrameLoop(fn) {
  const cb = useRef(fn);
  useEffect(() => {
    cb.current = fn;
  });
  useEffect(() => {
    let id;
    const loop = () => {
      cb.current(state.progress);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);
}

function ScrollHint() {
  const ref = useRef();
  useFrameLoop((p) => {
    ref.current.style.opacity = state.entered ? 1 - smooth(range(p, [0.004, 0.02])) : 0;
  });
  return (
    <div ref={ref} className={s.scrollHint}>
      SCROLL <span className={s.scrollArrow}>↓</span>
    </div>
  );
}

// black dips that hide every scene swap
function Dip() {
  const ref = useRef();
  useFrameLoop((p) => {
    ref.current.style.opacity = dipAmount(p);
  });
  return <div ref={ref} className={s.dip} />;
}

// split into per-char spans for the scramble / rise animations
const chars = (str) =>
  str.split("").map((c, i) => (
    <span key={i} className={s.char}>
      {c === " " ? " " : c}
    </span>
  ));

function ProjectsUI() {
  const { project, projectOpen, dragging } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const root = useRef();
  const title = useRef();
  const p = projects[project];

  useFrameLoop((pr) => {
    const v = owner(pr) === "projects" ? window01(pr, [T.projects[0] + 0.035, T.projects[1] - 0.012], 0.012) : 0;
    root.current.style.opacity = v;
    root.current.style.pointerEvents = v > 0.5 ? "auto" : "none";
  });

  useEffect(() => {
    const el = title.current;
    if (!el) return;
    gsap.fromTo(
      el.querySelectorAll(`.${s.char}`),
      { yPercent: 110 },
      { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.02 }
    );
  }, [project]);

  return (
    <div ref={root} className={s.projects}>
      <div className={s.projTitleBlock}>
        <h2 ref={title} className={s.projTitle} key={project}>
          {chars(p.title)}
        </h2>
        <button className={s.discover} onClick={() => set({ projectOpen: true })}>
          DISCOVER PROJECT <ArrowDR className={s.arrow} />
        </button>
      </div>
      <div className={`${s.dragHint} ${dragging ? s.dragActive : ""}`}>
        <span className={s.dragIcon}>
          <span>‹</span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1">
            <path d="M5.5 8.5V3.2a1 1 0 0 1 2 0V7m0-1.2V2.5a1 1 0 0 1 2 0V7m0-.8V3.5a1 1 0 0 1 2 0v4.2m0-2a1 1 0 0 1 2 0V10c0 2.5-2 4.5-4.5 4.5S5 13 4 11.5L2.6 9.2a1 1 0 0 1 1.6-1.1l1.3 1.4" />
          </svg>
          <span>›</span>
        </span>
        DRAG TO SWITCH PROJECT
      </div>
      <div className={s.counter}>
        <span className={s.count}>
          {String(project + 1).padStart(2, "0")}
          <small> / {String(projects.length).padStart(2, "0")}</small>
        </span>
        <button className={s.next} onClick={() => step(1)}>
          › NEXT PROJECT
        </button>
      </div>

      <aside className={`${s.panel} ${projectOpen ? s.panelOpen : ""}`} aria-hidden={!projectOpen}>
        <button className={s.close} onClick={() => set({ projectOpen: false })}>
          CLOSE ×
        </button>
        <span className={s.panelIndex}>Project {project + 1}</span>
        <h3 className={s.panelTitle}>{p.title}</h3>
        <span className={s.panelYear}>{p.year}</span>
        <p className={s.panelLead}>{p.tagline}</p>
        <dl className={s.meta}>
          <dt>Role</dt>
          <dd>{p.role}</dd>
          <dt>Stack</dt>
          <dd>{p.stack}</dd>
        </dl>
        <p className={s.panelBody}>{p.body}</p>
        <a className={s.visit} href={p.href} target="_blank" rel="noreferrer">
          Visit {p.title.toLowerCase()} <ArrowDR className={s.arrow} />
        </a>
      </aside>
    </div>
  );
}

function StoryUI() {
  const lines = useRef([]);
  useFrameLoop((p) => {
    const u = range(p, T.lines);
    const n = story.length;
    lines.current.forEach((el, i) => {
      if (!el) return;
      const a = 0.08 + (i / n) * 0.8;
      const b = a + 0.8 / n;
      const v = owner(p) === "lines" ? window01(u, [a, b], 0.05) : 0;
      el.style.opacity = v;
      el.style.transform = `translate(-50%, ${(1 - v) * 10}px)`;
      el.style.filter = `blur(${(1 - v) * 6}px)`;
    });
  });
  return story.map(([lead, rest], i) => (
    <p key={i} ref={(r) => (lines.current[i] = r)} className={s.subtitle}>
      <span className={s.subDim}>{lead}</span> {rest}
    </p>
  ));
}

const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#/*+<>";

function AboutUI() {
  const root = useRef();
  const svg = useRef();
  const lens = useRef();
  const titleRef = useRef();
  const [clock, setClock] = useState("");
  const [nums, setNums] = useState([0, 0]);
  const shownRef = useRef(false);
  const lensPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const id = setInterval(() => {
      setClock(new Date().toLocaleTimeString("en-GB", { hour12: false }));
      setNums([(Math.random() * 900 + 100).toFixed(3), (-Math.random() * 600).toFixed(2)]);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const wordRef = useRef();
  const swapped = useRef(false);
  // text decodes from random glyphs, left to right
  const scramble = (el, final) => {
    const obj = { t: 0 };
    gsap.to(obj, {
      t: 1,
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => {
        const k = Math.floor(obj.t * final.length);
        let out = "";
        for (let i = 0; i < final.length; i++) {
          if (final[i] === " ") out += " ";
          else if (i < k) out += final[i];
          else out += SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];
        }
        el.textContent = out;
      },
    });
  };

  useFrameLoop((p) => {
    const mine = owner(p) === "flower";
    const v = mine ? window01(range(p, T.flower), [0.22, 0.96], 0.08) : 0;
    root.current.style.opacity = v;
    if (v > 0.3 && !shownRef.current) {
      shownRef.current = true;
      scramble(titleRef.current, about.titleLead);
      scramble(wordRef.current, about.titleWord);
    }
    if (v < 0.05) shownRef.current = false;
    // final beat: the scanner opens to the whole frame and the word flips
    const expand = mine ? smooth(range(range(p, T.flower), [0.64, 0.82])) : 0;
    root.current.classList.toggle(s.aboutXray, expand > 0.5);
    if (expand > 0.5 && !swapped.current) {
      swapped.current = true;
      scramble(wordRef.current, about.titleWordAlt);
    } else if (expand < 0.3 && swapped.current) {
      swapped.current = false;
      scramble(wordRef.current, about.titleWord);
    }
    const a = state.anchors;
    if (!a || !svg.current) return;
    // leader lines from fixed HUD labels to live projected points on the model
    const W = innerWidth;
    const H = innerHeight;
    const paths = svg.current.querySelectorAll("[data-k]");
    const targets = {
      nameBox: [0.19 * W, 0.6 * H, "petal"],
      flowerGlb: [0.42 * W, 0.7 * H, "stem"],
      from: [0.08 * W, 0.96 * H, "head"],
      based: [0.9 * W, 0.96 * H, "stem"],
      stem: [0.81 * W, 0.72 * H, "stem"],
      free: [0.63 * W, 0.28 * H, "stamen"],
      topLeft: [0.03 * W, 0.1 * H, "head"],
    };
    paths.forEach((el) => {
      const [x, y, k] = targets[el.dataset.k];
      const [tx, ty] = a[k];
      el.setAttribute("x1", x);
      el.setAttribute("y1", y);
      el.setAttribute("x2", tx);
      el.setAttribute("y2", ty);
    });
    // the scanner box drifts with the cursor around the blossom
    const [hx, hy] = a.petal;
    const lw = 0.28 * W, lh = 0.25 * H;
    const lx = hx - lw * 0.45 + state.pointer.x * 0.1 * W;
    const ly = hy - lh * 0.5 - state.pointer.y * 0.08 * H;
    // time-based follow so the box tracks the flower even on slow frames
    const now = performance.now();
    const k = 1 - Math.exp(-((now - (lensPos.current.t || now)) / 1000) * 5);
    lensPos.current.t = now;
    if (v < 0.05 || !lensPos.current.x) Object.assign(lensPos.current, { x: lx, y: ly });
    lensPos.current.x += (lx - lensPos.current.x) * k;
    lensPos.current.y += (ly - lensPos.current.y) * k;
    const m = 0.02 * W; // full-frame scanner keeps a small margin like a viewfinder
    const bx = lerp(lensPos.current.x, m, expand);
    const by = lerp(lensPos.current.y, m, expand);
    const bw = lerp(lw, W - 2 * m, expand);
    const bh = lerp(lh, H - 2 * m, expand);
    lens.current.style.transform = `translate(${bx}px, ${by}px)`;
    lens.current.style.width = bw + "px";
    lens.current.style.height = bh + "px";
    setLens(bx, by, v > 0.2 ? bw : 0, bh);
  });

  return (
    <div ref={root} className={s.about}>
      <svg ref={svg} className={s.leaders}>
        {["nameBox", "flowerGlb", "from", "based", "stem", "free", "topLeft"].map((k) => (
          <line key={k} data-k={k} />
        ))}
      </svg>
      <div ref={lens} className={s.lens} />
      <div className={s.aboutText}>
        <h2 className={s.aboutTitle}>
          <span ref={titleRef}>{about.titleLead}</span>
          <span ref={wordRef} className={s.titleWord}>
            {about.titleWord}
          </span>
        </h2>
        <span className={s.aboutRole}>{about.role}</span>
        <p className={s.aboutBody}>{about.body}</p>
        <span className={s.nameBox}>
          {site.name.toLowerCase()}
          <small>{nums[1]}</small>
        </span>
      </div>
      <span className={s.tag} style={{ left: "42%", top: "70%" }}>
        flower.glb
      </span>
      <span className={s.tag} style={{ left: "81%", top: "72%" }}>
        computed stem
      </span>
      <span className={s.tag} style={{ left: "60.5%", top: "26%" }}>
        {site.status}
      </span>
      <span className={s.tag} style={{ left: "88%", top: "36%" }}>
        {nums[0]}
      </span>
      <span className={s.foot} style={{ left: "4.5%" }}>
        {site.from}
      </span>
      <span className={s.foot} style={{ left: "50%", transform: "translateX(-50%)" }}>
        <small>{clock}</small>
        {site.coords}
      </span>
      <span className={s.foot} style={{ right: "4.5%" }}>
        {site.basedIn}
      </span>
    </div>
  );
}

function ContactUI() {
  const root = useRef();
  const [copied, setCopied] = useState(false);
  useFrameLoop((p) => {
    const v = owner(p) === "hand" ? smooth(range(p, [T.hand[0] + 0.02, T.hand[0] + 0.07])) : 0;
    root.current.style.opacity = v;
    root.current.style.pointerEvents = v > 0.5 ? "auto" : "none";
  });
  return (
    <div ref={root} className={s.contact}>
      <div className={s.reach}>
        <h2 className={s.reachTitle}>REACH OUT</h2>
        <button
          className={s.email}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(site.email);
            } catch {}
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "COPIED" : site.email.toUpperCase()} <ArrowDR className={s.arrowFlip} />
        </button>
      </div>
      <footer className={s.footer}>
        <span>© {site.domain.toLowerCase()} - {site.year}</span>
        <a href="#" className={s.footLink}>
          LEGAL NOTICE
        </a>
        <a href="#" className={s.footLink}>
          LAB
        </a>
      </footer>
      <div className={s.socials}>
        {site.socials.map((x) => (
          <a key={x.label} href={x.href} target="_blank" rel="noreferrer" aria-label={x.label}>
            <SocialIcon name={x.icon} className={s.social} />
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Overlays() {
  return (
    <div className={s.layer}>
      <Dip />
      <ScrollHint />
      <ProjectsUI />
      <StoryUI />
      <AboutUI />
      <ContactUI />
    </div>
  );
}
