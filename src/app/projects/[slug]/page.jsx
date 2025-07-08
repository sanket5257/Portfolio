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
      <div id="section2" className="min-h-screen w-full">
        <div className=" relative w-full">
          <img
            className="h-full w-full filter grayscale object-cover"
            src={project.image}
            alt=""
          />
          <img
            className="h-[40vw] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-cover"
            src="/project1hero.png"
            alt=""
          />
          <div className="h-[25vh] w-[70vw] flex justify-evenly items-center bg-[#1D1D1D] text-[#D9D9D9] font-title absolute -bottom-20 left-1/2 transform -translate-x-1/2">
            <div className="text-center">
              <h3>Client name</h3>
              <h3>Self</h3>
            </div>
            <div className="text-center">
              <h3>Industry name</h3>
              <h3>Self</h3>
            </div>
            <div className="text-center">
              <h3>Services</h3>
              <h3>Design & Dev</h3>
            </div>
            <div className="text-center">
              <h3>Year</h3>
              <h3>2025</h3>
            </div>
          </div>
        </div>
      </div>
      <div id="section3" className="py-[20vw] w-full flex justify-center font-title items-center">
        <div className="w-[70vw]  flex items-start gap-10 justify-between text-center">
        <h1 className="w-[50vw] font-extrabold">About</h1>
        <p className="text-start text-[#666666] w-[50vw]">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptates
          necessitatibus voluptas atque nam aperiam nisi perferendis praesentium
          autem tempora! Facilis, unde! Nihil in voluptatum, aspernatur rem
          exercitationem tempora quaerat natus?
        </p>
        <p className="text-start text-[#666666] w-[50vw]">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam ipsa
          ut voluptatum, molestiae, officia numquam odit maxime deleniti id
          ducimus placeat sequi, ipsum eius consectetur praesentium ea aut esse!
          Maiores?
        </p>
        </div>
        
      </div>
    </div>
  );
}
