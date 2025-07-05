import React from 'react'

const Skills = () => {
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
  "Java"
];


  return (
    <div className='bg-[#D9D9D9] w-full py-32'>
      <div className="flex">
        <h3 className="font-title font-extrabold w-[20vw] text-xl">WHAT I CAN</h3>
        <div className="pl-5 font-title text-[#1D1D1D] flex flex-wrap gap-4">
          {skills.map((skill, index) => (
            <div
              key={index}
              className='
                hover:bg-white 
                hover:scale-105 
                hover:shadow-[0_0_10px_rgba(29,29,29,0.2)] 
                transition-all 
                duration-300 
                ease-in-out 
                shrink-0 
                cursor-pointer 
                border 
                border-[#1D1D1D] 
                rounded-full 
                flex 
                justify-center 
                items-center 
                w-[8.5vw] 
                h-[4vw]
              '
            >
              <h3 className='body-font text-[1.5vw]'>{skill}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Skills
