import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Html, useGLTF, Bounds } from "@react-three/drei";
import * as THREE from "three";

type Tyre = "FL" | "FR" | "RL" | "RR";

type Props = {
  hotTyre?: Tyre | null;
  hotTemp?: number;
};

const MODEL_URL = "/models/f1.glb";
useGLTF.preload(MODEL_URL);

/**
 * Realistic 3D F1 car (GLB asset). Drag / pinch to orbit 360°.
 */
export function F1Car3D({ hotTyre = "RL", hotTemp = 138 }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div
      className="relative h-72 border border-border bg-[oklch(0.16_0.002_270)] overflow-hidden"
      style={{ borderRadius: 6 }}
    >
      <div className="absolute top-2 left-2 z-10 text-[10px] tracking-[0.25em] text-mint">
        F1-W15 · #44 · 360° MODEL
      </div>
      <div className="absolute top-2 right-2 z-10 text-[10px] tracking-[0.25em] text-muted-foreground">
        DRAG TO ROTATE
      </div>

      {mounted && (
        <Canvas shadows camera={{ position: [5, 2.5, 6], fov: 32 }} dpr={[1, 2]} gl={{ antialias: true }}>
          <color attach="background" args={["#161618"]} />
          <fog attach="fog" args={["#161618", 10, 28]} />

          <ambientLight intensity={0.4} />
          <directionalLight
            position={[6, 9, 5]}
            intensity={1.6}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight position={[-7, 5, -4]} intensity={0.5} color="#88aaff" />
          <pointLight position={[0, 1.5, -3]} intensity={0.7} color="#76ff03" />

          <Suspense
            fallback={
              <Html center>
                <span className="text-mint text-[10px] tracking-[0.25em]">LOADING TELEMETRY MESH…</span>
              </Html>
            }
          >
            <Bounds fit clip observe margin={1.15}>
              <F1Model hotTyre={hotTyre} />
            </Bounds>
            <Environment preset="city" />
          </Suspense>

          <ContactShadows position={[0, -0.5, 0]} opacity={0.7} scale={14} blur={2.6} far={3} />

          <OrbitControls
            enablePan={false}
            minDistance={3.5}
            maxDistance={12}
            minPolarAngle={0.15}
            maxPolarAngle={Math.PI / 2.05}
            autoRotate
            autoRotateSpeed={0.5}
            enableDamping
          />
        </Canvas>
      )}

      <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between text-[10px] tracking-[0.22em]">
        <span className="px-2 py-0.5 rounded border border-border bg-black/40 text-muted-foreground">
          TOP SPD 326 KM/H
        </span>
        {hotTyre && (
          <span className="px-2 py-0.5 rounded border border-racing-red/60 bg-black/40 text-racing-red font-bold">
            ● {hotTyre} {hotTemp}°C
          </span>
        )}
      </div>
    </div>
  );
}

function F1Model({ hotTyre }: { hotTyre?: Tyre | null }) {
  const { scene } = useGLTF(MODEL_URL) as any;
  const ref = useRef<THREE.Group>(null!);
  const auraRef = useRef<THREE.Mesh>(null!);
  const [auraPos, setAuraPos] = useState<[number, number, number] | null>(null);

  // Apply shadows + compute wheel anchor from real bbox
  useEffect(() => {
    scene.traverse((o: any) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.material) o.material.envMapIntensity = 1.1;
      }
    });

    if (!hotTyre) {
      setAuraPos(null);
      return;
    }
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Wheels sit ~85% to the side, ~70% along length, near the bottom of the chassis.
    const sx = size.x * 0.42;
    const sz = size.z * 0.36;
    const yWheel = box.min.y + size.y * 0.18;
    const sign = (t: Tyre): [number, number] => {
      // [xSign, zSign] — Z+ is rear or front depending on model; we'll try front=+Z
      switch (t) {
        case "FL": return [-1,  1];
        case "FR": return [ 1,  1];
        case "RL": return [-1, -1];
        case "RR": return [ 1, -1];
      }
    };
    const [xs, zs] = sign(hotTyre);
    setAuraPos([center.x + xs * sx, yWheel, center.z + zs * sz]);
  }, [scene, hotTyre]);


  useFrame((s) => {
    if (hotTyre && auraRef.current) {
      const t = s.clock.elapsedTime;
      const k = 1 + Math.sin(t * 4) * 0.12;
      auraRef.current.scale.set(k, k, k);
      const m = auraRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.25 + (Math.sin(t * 4) + 1) * 0.18;
    }
  });

  return (
    <group ref={ref}>
      <primitive object={scene} />
      {hotTyre && auraPos && (
        <mesh ref={auraRef} position={auraPos}>
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshBasicMaterial color="#ff2a1a" transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  );
}
