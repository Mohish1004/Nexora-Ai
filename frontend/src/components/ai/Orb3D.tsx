import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedOrb({ isHovered }: { isHovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Rotate the orb
      meshRef.current.rotation.y = time * 0.2;
      meshRef.current.rotation.x = time * 0.1;
      
      // Pulsate size slightly based on hover
      const scale = isHovered ? 1.4 : 1.2;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
    
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y = -time * 0.4;
      wireframeRef.current.rotation.z = time * 0.15;
      const wireScale = isHovered ? 1.6 : 1.45;
      wireframeRef.current.scale.lerp(new THREE.Vector3(wireScale, wireScale, wireScale), 0.1);
    }
  });

  return (
    <group>
      {/* Inner pulsating gradient orb */}
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color={isHovered ? '#00E676' : '#00D4FF'}
          attach="material"
          distort={0.4}
          speed={3}
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Sphere>

      {/* Outer rotating network wireframe */}
      <Sphere ref={wireframeRef} args={[1.02, 16, 16]}>
        <meshBasicMaterial
          color={isHovered ? '#00E676' : '#7C4DFF'}
          wireframe
          transparent
          opacity={0.3}
        />
      </Sphere>
    </group>
  );
}

export default function Orb3D() {
  const [isHovered, setIsHovered] = useState(false);
  const [webGlError, setWebGlError] = useState(false);

  // Fallback UI in case WebGL is blocked or fails
  if (webGlError) {
    return (
      <div 
        className="w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-500 via-violet-600 to-emerald-400 flex items-center justify-center animate-pulse-slow shadow-[0_0_80px_rgba(0,212,255,0.4)]"
        style={{ filter: 'blur(8px)' }}
      >
        <div className="w-72 h-72 rounded-full bg-background/95 flex items-center justify-center">
          <div className="text-gradient-rainbow font-black text-2xl animate-bounce">Nexora Core</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-[400px] flex items-center justify-center cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none"></div>
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 75 }}
        onCreated={({ gl }) => {
          // Check for WebGL capability
          if (!gl) setWebGlError(true);
        }}
        onError={() => setWebGlError(true)}
        className="w-full h-full"
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <spotLight position={[0, 10, 0]} intensity={2} angle={0.3} penumbra={1} />
        
        <AnimatedOrb isHovered={isHovered} />
        
        <OrbitControls enableZoom={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}
