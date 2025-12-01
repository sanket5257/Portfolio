import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Skills = () => {
  console.log('Skills component rendered');
  console.log('GSAP registered:', gsap);
  console.log('ScrollTrigger registered:', ScrollTrigger);
  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React.js",
    "Next.js",
    "Tailwind",
    "Bootstrap",
    "GSAP",
    "Figma",
    "UI/UX",
    "Git",
    "GitHub",
    "C",
    "C++",
    "Java",
    "wordpress"
  ];

  useEffect(() => {
    console.log('Skills useEffect triggered');
    // Animate skills on scroll
    gsap.utils.toArray('.skill').forEach((item, i) => {
      gsap.from(item, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        delay: i * 0.05,
        scrollTrigger: {
          trigger: '.skills-container',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    });
  }, []);

  return (
    <div className='bg-[#D9D9D9] w-full py-20 md:py-32 px-4 sm:px-8 overflow-hidden skills-container'>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/4">
            <h3 className="font-title font-extrabold text-2xl md:text-3xl lg:text-4xl mb-6 lg:mb-0 lg:sticky lg:top-32">
              WHAT I CAN
              <span className="block w-16 h-1 bg-[#1D1D1D] mt-4"></span>
            </h3>
          </div>
          
          <div className="w-full lg:w-3/4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className={`
                    skill-item
                    bg-transparent
                    hover:bg-white 
                    hover:scale-105 
                    hover:shadow-[0_5px_15px_rgba(29,29,29,0.15)]
                    transform 
                    transition-all 
                    duration-300 
                    ease-out
                    border-2 
                    border-[#1D1D1D] 
                    rounded-xl
                    flex 
                    justify-center 
                    items-center 
                    p-4
                    h-24
                    md:h-28
                    relative
                    overflow-hidden
                    group
                    before:absolute
                    before:top-0
                    before:left-0
                    before:w-full
                    before:h-full
                    before:bg-[#1D1D1D]
                    before:opacity-0
                    before:transition-opacity
                    before:duration-300
                    before:z-0
                    hover:before:opacity-10
                  `}
                >
                  <h3 className='font-title font-medium text-center text-lg md:text-xl relative z-10 group-hover:scale-110 transition-transform duration-300'>
                    {skill}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Skills;
