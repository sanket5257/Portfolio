"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Expertise from "@/components/Expertise";
import SideProjects from "@/components/SideProjects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const CursorSystem = dynamic(() => import("@/components/CursorSystem"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      {/* Dual cursor system */}
      <CursorSystem />

      {/* Hero - fixed background, z-1 */}
      <Hero />

      {/* Main scrolling content - slides over hero */}
      <main
        className="relative z-10"
        style={{
          marginTop: "100vh",
          background: "#fafaf9",
        }}
      >
        <Experience />
        <Expertise />
        <SideProjects />
        <Contact />
      </main>

      {/* Footer - revealed as main content scrolls past */}
      <div className="relative z-[5]" style={{ height: "70vh" }}>
        <div className="sticky bottom-0">
          <Footer />
        </div>
      </div>
    </>
  );
}
