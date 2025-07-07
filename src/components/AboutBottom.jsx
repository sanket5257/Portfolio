"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Skills from "./Skills";

gsap.registerPlugin(ScrollTrigger);

const AboutBottom = () => {
  const containerRef = useRef(null);

  const experiences = [
    {
      position: "FRONTEND DEVELOPER",
      details:
        "Currently working at Shivneri Systems, where I contribute to frontend projects using WordPress, React.js, Tailwind CSS, and UI/UX principles. Focused on creating responsive and functional interfaces that align with business goals.",
      year: "JUNE 2025 – PRESENT",
    },
    {
      position: "FRONTEND DEVELOPER",
      details:
        "Worked at RS Soft Tech, building modern, responsive websites using React.js, Next.js, and Tailwind CSS. Gained valuable experience in building component-based UI systems and collaborating with agile teams.",
      year: "MARCH 2025 – MAY 2025",
    },
    {
      position: "FRONTEND DEVELOPER",
      details:
        "Interned at Stormsofts Technology, where I contributed to the design and development of web interfaces using HTML, CSS, JavaScript, Bootstrap, and React.js. Learned the fundamentals of responsive design and frontend performance.",
      year: "JUNE 2024 – AUGUST 2024",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#D9D9D9] w-full px-6 sm:px-10 lg:px-32 overflow-x-hidden py-20"
    >
      <div id="aboutme">
        {/* WHO I AM */}
        <div className="flex flex-col lg:flex-row gap-6">
          <h3 className="font-title font-extrabold w-full lg:w-[20vw] reveal text-xl">
            WHO I AM ?
          </h3>
          <h3 className="w-full lg:w-[45vw] font-title text-[#666666] reveal text-base">
            Hi I'm Sanket, a creative web developer based in Maharashtra.
            Currently focusing on frontend development and digital experiences.
            Passion for development/design fuels my drive to create immersive
            and visually captivating digital experiences that leave a lasting
            impression
          </h3>
        </div>

        {/* MY EXPERIENCE */}
        <div id="experience" className="flex flex-col lg:flex-row mt-[60px] gap-6">
          <div>
            <h3 className="font-title font-extrabold w-full lg:w-[20vw] reveal text-xl pt-[60px]">
              MY EXPERIENCE
            </h3>
          </div>
          <div className="flex flex-col">
            {experiences.map((i, index) => (
              <div key={index}>
                <div className="flex flex-col lg:flex-row justify-between mt-[60px] gap-6">
                  <div className="w-full lg:w-[45vw]">
                    <h3 className="font-title font-extrabold pb-4 reveal text-xl">
                      {i.position}
                    </h3>
                    <p className="text-[#666666] leading-relaxed font-title reveal text-base">
                      {i.details}
                    </p>
                  </div>
                  <div className="pl-0 w-full lg:w-[20vw]">
                    <h3 className="font-title font-extrabold reveal text-xl">
                      {i.year}
                    </h3>
                  </div>
                </div>
                <div className="w-full lg:w-[60vw] mt-[60px] h-[1px] bg-black"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Skills />
    </div>
  );
};

export default AboutBottom;
