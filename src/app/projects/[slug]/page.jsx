import projects from '@/app/projects/data/projects.js';

import Image from 'next/image';
import Link from 'next/link';

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
      <div id='section1' className='h-[100vh] w=full flex'>
        <div className='h-full w-[50vw] flex flex-col justify-end items-center'>
          <h1 className='font-title font-extrabold text-[10vw] uppercase leading-10 '>{project.heading1}</h1>
          <h2 className='font-title2 text-[10vw]'>{project.heading2}</h2>
        </div>
        <div className='h-full w-[50vw]'>
          <img className='h-full w-full object-cover' src={project.image} alt="" />
        </div>
      </div>
        <div id="section2" className='min-h-screen w-full'>
          <div className='h-[100vh] w-full'>
            <img className='h-full w-full filter grayscale object-cover' src={project.image} alt="" />
          </div>
        </div>

      

      
    </div>
  );
}
