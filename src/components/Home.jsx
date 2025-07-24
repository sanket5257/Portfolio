// components/SplineViewer.js
'use client';

import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), { ssr: false });

export default function SplineViewer() {
  return (
    <div className='bg-black h-full'>
      <Spline scene="https://prod.spline.design/ymZFyEgESBR8OJCL/scene.splinecode" />
    </div>
  );
}
