// pages/index.js
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Top-left fill brief button */}
      {/* <div className="absolute top-6 left-6 font-title flex items-center space-x-2 z-10">
        <span className="inline-block p-2 rounded bg-gray-100"><svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="8" stroke="#222" strokeWidth="2"/><path d="M7 10h6M10 7v6" stroke="#222" strokeWidth="2" /></svg></span>
        <button className="border rounded px-4 py-2 font-medium hover:bg-gray-50 transition">FILL OUT BRIEF</button>
      </div> */}

      {/* Top nav links */}
      <nav className="absolute top-6 right-30 z-10 flex flex-col space-y-1 text-right text-md font-normal">
        <a href="https://www.instagram.com/ft.leo_o" className="hover:underline">instagram</a>
        <a href="https://www.linkedin.com/in/sanket-chougule5257" className="hover:underline">linkedin</a>
        <a href="https://dribbble.com/sanket-chougule" className="hover:underline">dribbble</a>
        <a href="#" className="hover:underline">portfolio_pdf</a>
      </nav>
      <nav className="absolute top-6 right-[30%] z-10 flex flex-col space-y-1 text-right text-md font-normal">
        <a href="/#work" className="hover:underline">works</a>
        <a href="/#about" className="hover:underline">about me</a>
<Link
              href="/contact"
              className=""
            >
              Contact
            </Link>      </nav>

      {/* Main heading */}
      <main className="flex flex-col md:flex-row items-start justify-between pt-32 px-50">
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-title font-extrabold leading-tight mb-6 max-w-3xl">
            <span className="font-title font-extrabold">YOU'VE GOT </span><br />
            <span>THE IDEA,</span><br />
            <span>GREAT</span>
          </h1>
          <div className="w-40 ml-60 mb-20 pb-20 h-28 relative">
            <Image
              src="/dance.gif" // Add tv image to public/tv.png
              alt="TV"
              layout="fill"
              objectFit="contain"
            />
          </div>
          {/* Creative designer card */}
          <div className="mt-10">
            <span className="text-xs bg-gray-200 px-3 py-1 rounded text-gray-700 inline-block mb-2 tracking-wide">CREATIVE DESIGNER</span>
            <p className="text-gray-500 text-sm sm:text-base">भारतीय Designer बेहतर मानव अनुभव बनाने में शामिल । डिजाइन के माध्यम से.</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center ml-8 md:ml-24 font-title absolute bottom-20 right-40">
          {/* TV Image */}
          
          {/* "LEAVE THE REST TO ME!" */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight mt-8 md:mt-12 text-right">
            LEAVE THE<br />REST TO ME!
          </h2>
        </div>
      </main>
      {/* Optionally add background lines/circles with absolute elements or SVG for extra styling */}
    </div>
    
  );
}
