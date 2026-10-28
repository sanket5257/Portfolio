"use client";

import dynamic from "next/dynamic";
import SmoothScroll from "./SmoothScroll";
import Loader from "./Loader";
import Nav from "./Nav";
import Overlays from "./Overlays";

const Stage = dynamic(() => import("./three/Stage"), { ssr: false });

export default function Experience() {
  return (
    <>
      <Stage />
      <SmoothScroll />
      <Overlays />
      <Nav />
      <Loader />
    </>
  );
}
