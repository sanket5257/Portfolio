// data/projects.js

const projects = [
  {
    slug: 'portfolio',
    title: 'My Portfolio',
    heading1: 'My',
    heading2: 'Portfolio',
    description: `This portfolio is a curated showcase of my UI/UX design and frontend development work.
    It’s crafted to not just display projects, but to immerse visitors in an engaging, cinematic browsing experience. 
    I used Next.js for high-performance routing, GSAP for smooth, scroll-triggered animations, 
    and Tailwind CSS for a clean, responsive layout.  
    Every section is intentionally designed with clear hierarchy, typography balance, and visual rhythm, 
    ensuring that both the aesthetics and usability reflect my design philosophy. 
    The project serves as both a personal brand statement and a proof of concept for my design-to-development workflow.`,
    image: '/project1.png',
    tech: ['Next.js', 'GSAP', 'Tailwind CSS'],
    overviewimg: '/project1hero.png',
  },
  {
    slug: 'zentry',
    title: 'Zentry Clone',
    heading1: 'Zentry',
    heading2: 'Clone',
    description: `A detailed, high-fidelity recreation of the cinematic Zentry homepage, 
    built to push my creative and technical limits as a UI/UX designer.  
    The focus was on replicating the dramatic animations, layered visual depth, 
    and micro-interactions that make the original design so captivating.  
    I used React for component structure, Framer Motion for fluid, choreographed transitions, 
    and Tailwind CSS for rapid yet consistent styling.  
    This project sharpened my skills in translating complex, motion-heavy interfaces into 
    maintainable code while preserving the original design’s visual narrative.`,
    image: '/project2.png',
    tech: ['React', 'Framer Motion', 'Tailwind CSS'],
    overviewimg: '/zentry1.png',
  },
];

export default projects;
