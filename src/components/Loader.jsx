'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function Loader({ onLoaded }) {
  const mountRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  
  // Refs for Three.js objects
  const animationRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const controlsRef = useRef();
  const clockRef = useRef(new THREE.Clock());
  const loadingInterval = useRef();
  const particlesRef = useRef();
  const particleSystemRef = useRef();
  const mousePosition = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  
  // Easing function for smooth animations
  const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);

  // Create particle system
  const createParticles = useCallback((count = 1000) => {
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    const radius = 5;
    
    for (let i = 0; i < count; i++) {
      // Position particles in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random());
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      // Random colors with blue/purple tint
      colors[i * 3] = 0.5 + Math.random() * 0.5;     // R
      colors[i * 3 + 1] = 0.3 + Math.random() * 0.7; // G
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // B
      
      // Random sizes
      sizes[i] = 1 + Math.random() * 2;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return particles;
  }, []);

  // Handle mouse movement
  const handleMouseMove = useCallback((event) => {
    if (!mountRef.current) return;
    
    const rect = mountRef.current.getBoundingClientRect();
    mousePosition.current = {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.top) / rect.height) * 2 + 1
    };
    
    // Update target rotation based on mouse position
    targetRotation.current = {
      x: mousePosition.current.y * 0.5,
      y: mousePosition.current.x * 0.5
    };
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!hasStarted) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.001);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    cameraRef.current = camera;

    // Renderer with better antialiasing
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create particle system
    const particleGeometry = createParticles(2000);
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      color: 0xffffff
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    particleSystemRef.current = particleSystem;

    // Create a central sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x888888, 1);
    scene.add(ambientLight);

    // Add point light
    const pointLight = new THREE.PointLight(0xffffff, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    // Add second point light for better illumination
    const pointLight2 = new THREE.PointLight(0xffffff, 1, 30);
    pointLight2.position.set(-5, -5, -5);
    scene.add(pointLight2);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      const time = clockRef.current.getElapsedTime();
      
      // Smoothly interpolate rotation
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.05;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.05;
      
      // Rotate particles based on mouse position
      if (particleSystemRef.current) {
        particleSystemRef.current.rotation.y = currentRotation.current.y * 0.5;
        particleSystemRef.current.rotation.x = currentRotation.current.x * 0.5;
        
        // Pulsing effect
        const scale = 1 + Math.sin(time * 0.5) * 0.1;
        particleSystemRef.current.scale.set(scale, scale, scale);
        
        // Animate individual particles
        const positions = particleSystemRef.current.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const y = positions[i + 1];
          const z = positions[i + 2];
          
          // Create a wave-like motion
          const distance = Math.sqrt(x * x + y * y + z * z);
          const wave = Math.sin(distance * 2 - time * 2) * 0.1;
          
          positions[i] = x + (x / distance) * wave;
          positions[i + 1] = y + (y / distance) * wave;
          positions[i + 2] = z + (z / distance) * wave;
        }
        particleSystemRef.current.geometry.attributes.position.needsUpdate = true;
      }
      
      // Rotate sphere
      if (sphere) {
        sphere.rotation.x = time * 0.1;
        sphere.rotation.y = time * 0.15;
      }
      
      // Update point light positions
      if (pointLight) {
        pointLight.position.x = Math.sin(time * 0.7) * 10;
        pointLight.position.y = Math.cos(time * 0.5) * 10;
        pointLight.position.z = Math.cos(time * 0.3) * 10;
        
        // Move second light in opposite pattern
        if (pointLight2) {
          pointLight2.position.x = Math.sin(time * 0.5 + Math.PI) * 8;
          pointLight2.position.y = Math.cos(time * 0.3 + Math.PI) * 8;
          pointLight2.position.z = Math.sin(time * 0.4) * 8;
        }
      }
      
      rendererRef.current.render(scene, camera);
    };

    // Start animation
    animate();

    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Start loading animation and rendering
    startLoading();
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(loadingInterval.current);
      
      if (mountRef.current && rendererRef.current?.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose of all geometries and materials
      scene.traverse(child => {
        if (child.isMesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else if (child.material) {
            child.material.dispose();
          }
        }
      });
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [hasStarted]);

  const startLoading = () => {
    // Start the loading animation
    loadingInterval.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(loadingInterval.current);
          setIsLoadingComplete(true);
          setTimeout(() => {
            onLoaded();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const handleStart = () => {
    setHasStarted(true);
  };

  if (!hasStarted) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white cursor-pointer"
        onClick={handleStart}
      >
        <div className="text-center p-8 bg-black bg-opacity-70 rounded-2xl max-w-md backdrop-blur-sm transform transition-transform hover:scale-105">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            WELCOME
          </h1>
          <p className="mb-8 text-lg md:text-xl text-gray-300">
            Experience an interactive journey through my portfolio
          </p>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-600 to-white rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
            <button 
              onClick={handleStart}
              className="relative px-8 py-4 bg-black text-white border border-white border-opacity-30 rounded-lg text-lg font-semibold w-full transition-all duration-200 group-hover:scale-105"
            >
              <span className="relative z-10">ENTER PORTFOLIO</span>
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            For the best experience, please use a modern browser
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div 
        className="absolute inset-0 w-full h-full" 
        ref={mountRef}
        style={{
          opacity: isLoadingComplete ? 0 : 1,
          transition: 'opacity 1s ease-out',
          pointerEvents: 'none'
        }}
      />
      
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white z-10"
        style={{
          textShadow: '0 0 10px rgba(255,255,255,0.5)'
        }}
      >
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white tracking-wider">
          PATIENCE, COOL STUFF TAKES TIME...
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-300">
          {isLoadingComplete ? (
            <span className="animate-pulse">WELCOME</span>
          ) : (
            'LOADING YOUR EXPERIENCE...'
          )}
        </p>
        {!isLoadingComplete && (
          <div className="w-64 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden border border-gray-700">
            <div 
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {!isLoadingComplete && (
          <div className="text-2xl md:text-4xl font-mono mt-4">
            {Math.floor(progress)}%
          </div>
        )}
      </div>
    </div>
  );
}
