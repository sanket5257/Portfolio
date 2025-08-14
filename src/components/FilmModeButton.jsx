"use client";
import { useState, useRef, useEffect } from "react";

export default function FilmModeButton() {
  const [filmMode, setFilmMode] = useState(false);
  const musicRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  useEffect(() => {
    const content = document.getElementById("filmContent");

    if (filmMode) {
      document.body.classList.add("film-mode");
      if (content) content.classList.add("film-frame");

      // play music
      if (musicRef.current) {
        musicRef.current.currentTime = 0;
        musicRef.current.play().catch(err =>
          console.log("Music blocked:", err)
        );
      }

      // bars
      const bars = [
        { className: "cinematic-bars top" },
        { className: "cinematic-bars bottom" },
        { className: "side-bars left" },
        { className: "side-bars right" }
      ];
      bars.forEach(({ className }) => {
        const el = document.createElement("div");
        el.className = className;
        document.body.appendChild(el);
      });

      // auto scroll
      scrollIntervalRef.current = setInterval(() => {
        window.scrollBy(0, 2);
        if (
          window.innerHeight + window.scrollY >=
          document.body.offsetHeight
        ) {
          window.scrollTo(0, 0);
        }
      }, 30);
    } else {
      document.body.classList.remove("film-mode");
      if (content) content.classList.remove("film-frame");

      document
        .querySelectorAll(".cinematic-bars, .side-bars")
        .forEach(el => el.remove());

      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
      }
      clearInterval(scrollIntervalRef.current);
    }
  }, [filmMode]);

  return (
    <>
      {/* Keep button outside #filmContent so scaling won't affect it */}
      <button
        onClick={() => setFilmMode(prev => !prev)}
        className=" sticky bottom-[50%] left-0 font-title text-sm z-[10000] px-4 py-2 bg-black text-white rounded"
      >
        {filmMode ? "⏹ Exit Film Mode" : "🎬 Film Mode"}
      </button>

      <audio ref={musicRef} src="/track.mp3" preload="auto" loop />
    </>
  );
}
