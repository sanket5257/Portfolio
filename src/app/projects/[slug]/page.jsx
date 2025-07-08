import projects from "@/app/projects/data/projects.js";

import Image from "next/image";
import Link from "next/link";

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default function ProjectDetails({ params }) {
  const project = projects.find((p) => p.slug === params.slug);

  if (!project) {
    return <div className="p-20 text-center text-xl">Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#D9D9D9] w-full">
      <div id="section1" className="h-[100vh] w=full flex">
        <div className="h-full w-[50vw] flex flex-col justify-end items-center">
          <h1 className="font-title font-extrabold text-[10vw] uppercase leading-10 ">
            {project.heading1}
          </h1>
          <h2 className="font-title2 text-[10vw]">{project.heading2}</h2>
        </div>
        <div className="h-full w-[50vw]">
          <img
            className="h-full w-full object-cover"
            src={project.image}
            alt=""
          />
        </div>
      </div>
      {/* Section 2 */}
      <div id="section2" className="min-h-screen w-full relative">
        <img className="h-full w-full filter grayscale object-cover" src={project.image} alt="" />

        <img
          className="h-[60vw] sm:h-[50vw] md:h-[40vw] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-contain"
          src="/project1hero.png"
          alt=""
        />

        <div className="h-auto sm:h-[25vh] w-[90vw] sm:w-[70vw] flex flex-wrap justify-evenly items-center gap-4 p-4 bg-[#1D1D1D] text-[#D9D9D9] font-title absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-sm sm:text-base">
          <div className="text-center w-1/2 sm:w-auto">
            <h3>Client name</h3>
            <h3>Self</h3>
          </div>
          <div className="text-center w-1/2 sm:w-auto">
            <h3>Industry name</h3>
            <h3>Self</h3>
          </div>
          <div className="text-center w-1/2 sm:w-auto">
            <h3>Services</h3>
            <h3>Design & Dev</h3>
          </div>
          <div className="text-center w-1/2 sm:w-auto">
            <h3>Year</h3>
            <h3>2025</h3>
          </div>
        </div>
      </div>

      {/* Section 3 */}
      <div id="section3" className="py-[20vw] w-full flex justify-center font-title items-center">
        <div className="w-[90vw] md:w-[70vw] flex flex-col md:flex-row items-start gap-10 text-center md:text-start">
          <h1 className="md:w-[30%] text-[5vw] md:text-[1.5vw] font-extrabold">About</h1>
          <div className="md:w-[70%] space-y-4 text-[#666666] text-sm md:text-base">
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptates
              necessitatibus voluptas atque nam aperiam nisi perferendis
              praesentium autem tempora! Facilis, unde! Nihil in voluptatum,
              aspernatur rem exercitationem tempora quaerat natus?
            </p>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam
              ipsa ut voluptatum, molestiae, officia numquam odit maxime deleniti
              id ducimus placeat sequi, ipsum eius consectetur praesentium ea aut
              esse! Maiores?
            </p>
          </div>
        </div>
      </div>
      {/* Call-to-action */}
      <div className="relative px-4 sm:px-0">
        <div className="h-[2px] w-full bg-[#1D1D1D] mb-10"></div>

        <div className="h-[40vw] sm:h-[20vw] w-[40vw] sm:w-[20vw] rounded-full bg-[#1D1D1D] flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-center">
            <img className="size-8 sm:size-10" src="/arrowup.png" alt="" />
            <h3 className="text-[#D9D9D9] text-xs sm:text-base">SEE LIVE SITE</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
