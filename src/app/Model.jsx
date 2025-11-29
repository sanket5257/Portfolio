import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

const Model3D = React.forwardRef(({ scrollProgress, ...props }, ref) => {
  const localModelRef = useRef();
  const modelRef = ref || localModelRef;
  const [modelLoaded, setModelLoaded] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  // Load the model with error handling
  const modelPath = '/model-1.glb';
  console.log('Loading model from:', modelPath);
  
  const { scene } = useGLTF(
    modelPath,
    undefined,
    (error) => {
      console.error('Error loading model:', error);
      setError(`Failed to load 3D model: ${error.message}`);
    },
    (progress) => {
      console.log('Loading progress:', progress);
    }
  );
  
  // Update model position/rotation based on scroll with smooth easing
  useFrame(() => {
    if (!modelRef.current || typeof scrollProgress !== 'number') return;
    
    // Apply easing for smoother animation
    const easedProgress = Math.sin(scrollProgress * Math.PI * 2); // Ease-in-out effect
    
    // Update rotation with easing
    modelRef.current.rotation.y = easedProgress * Math.PI * 2;
    modelRef.current.position.y = -1 + Math.sin(easedProgress * Math.PI * 2) * 0.5;
    
    // Only apply scale if not zooming
    if (!modelRef.current.userData?.isZooming) {
      const scale = 0.8 + easedProgress * 0.5;
      modelRef.current.scale.set(scale, scale, scale);
    }
  });

  // Check if model is loaded
  React.useEffect(() => {
    if (scene) {
      console.log('Model loaded successfully:', scene);
      setModelLoaded(true);
      
      // Initialize userData for zoom tracking
      if (modelRef.current) {
        modelRef.current.userData = {
          isZooming: false,
          zoomTimer: null
        };
      }
    }
  }, [scene]);

  if (error) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
        <text position={[0, 0, 0.6]} fontSize={0.2} color="white">
          {error}
        </text>
      </mesh>
    );
  }

  // Set materials to be opaque
  React.useEffect(() => {
    if (modelLoaded && scene) {
      scene.traverse((child) => {
        if (child.material) {
          child.material.transparent = false;
        }
      });
    }
  }, [modelLoaded, scene]);

  if (!modelLoaded) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#666" />
      </mesh>
    );
  }

  return <primitive ref={modelRef} object={scene} scale={1} position={[0, -1, 0]} />;
});

const ZoomableModel = ({ modelRef }) => {
  const { camera } = useThree();
  const targetZoom = useRef(5);
  const isZooming = useRef(false);
  const zoomTimeout = useRef();

  // Handle wheel event for zooming
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        targetZoom.current = Math.max(1, Math.min(10, targetZoom.current + delta));
        isZooming.current = true;
        
        if (modelRef.current) {
          modelRef.current.userData.isZooming = true;
        }
        
        clearTimeout(zoomTimeout.current);
        zoomTimeout.current = setTimeout(() => {
          isZooming.current = false;
          if (modelRef.current) {
            modelRef.current.userData.isZooming = false;
          }
        }, 100);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [modelRef]);

  // Smooth zoom animation
  useFrame(() => {
    if (Math.abs(camera.position.z - targetZoom.current) > 0.01) {
      camera.position.z += (targetZoom.current - camera.position.z) * 0.1;
      camera.updateProjectionMatrix();
    }
  });

  return null;
};

const Model = () => {
  const modelRef = useRef();
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef();

  // Handle scroll events with requestAnimationFrame for smoother updates
  useEffect(() => {
    let animationFrameId;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      // Apply easing to the progress calculation for smoother transitions
      const rawProgress = Math.min(1, Math.max(0, scrollY / maxScroll));
      // Easing function for smoother start and end
      const easedProgress = rawProgress < 0.5 
        ? 2 * rawProgress * rawProgress 
        : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;
      
      // Use requestAnimationFrame for smoother updates
      animationFrameId = requestAnimationFrame(() => {
        setScrollProgress(easedProgress);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call to set initial scroll position
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-screen -z-10 pointer-events-none"
      ref={scrollContainerRef}
      style={{ 
        width: '100%',
        height: '100vh',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div style={{
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: 'none', // Disable pointer events for this container
        overflow: 'visible',
        clipPath: 'none',
        WebkitClipPath: 'none',
        willChange: 'transform' // Optimize for animations
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none' // Ensure no pointer events on the inner div
        }}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 15 }}
          gl={{ antialias: true, alpha: true }}
          style={{ pointerEvents: 'none' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Suspense fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#888" />
            </mesh>
          }>
            <Model3D ref={modelRef} scrollProgress={scrollProgress} scale={5} />
            <Environment preset="city" />
          </Suspense>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
            minDistance={3}
            maxDistance={10}
            enabled={false}
          />
          <ZoomableModel modelRef={modelRef} />
        </Canvas>
        </div>
      </div>
    </div>
  );
};

export default Model;
