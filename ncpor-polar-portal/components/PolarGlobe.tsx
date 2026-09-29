"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { STATIONS, type FocusKey, type Station, type Wx } from "@/lib/data";

const R = 2;
const CAM_DIST = 6.4;

/** Latitude / longitude to a point on the sphere, matching three's SphereGeometry UV layout. */
export function latLon(lat: number, lon: number, r = R) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

const FOCUS_POINTS: Record<Exclude<FocusKey, "free">, [number, number]> = {
  antarctic: [-62, 45],
  arctic: [66, 15],
  himalaya: [34, 78],
};

const TONES = {
  glacier: "#38BDF8",
  aurora: "#34D399",
  polar: "#F8FAFC",
} as const;

/* Earth textures: local file first (put one at /public/textures/earth.jpg), CDN as a fallback. */
const TEXTURE_SOURCES = [
  "/textures/earth.jpg",
  "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
];

function Earth() {
  const [map, setMap] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const tryLoad = (i: number) => {
      if (i >= TEXTURE_SOURCES.length || cancelled) return;
      loader.load(
        TEXTURE_SOURCES[i],
        (t) => {
          if (cancelled) return;
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = 8;
          setMap(t);
        },
        undefined,
        () => tryLoad(i + 1)
      );
    };
    tryLoad(0);
    return () => {
      cancelled = true;
    };
  }, []);

  const graticule = useMemo(() => {
    const pts: number[] = [];
    const push = (a: THREE.Vector3, b: THREE.Vector3) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lon = -180; lon < 180; lon += 4) push(latLon(lat, lon, R * 1.003), latLon(lat, lon + 4, R * 1.003));
    }
    for (let lon = -180; lon < 180; lon += 30) {
      for (let lat = -90; lat < 90; lat += 4) push(latLon(lat, lon, R * 1.003), latLon(lat + 4, lon, R * 1.003));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  const circles = useMemo(() => {
    const mk = (lat: number) => {
      const pts: THREE.Vector3[] = [];
      for (let lon = -180; lon <= 180; lon += 3) pts.push(latLon(lat, lon, R * 1.006));
      return new THREE.BufferGeometry().setFromPoints(pts);
    };
    return [mk(66.56), mk(-66.56)].map(
      (g) => new THREE.Line(g, new THREE.LineBasicMaterial({ color: "#34D399", transparent: true, opacity: 0.65 }))
    );
  }, []);

  const capAngle = (24 * Math.PI) / 180; // polar caps: beyond 66°

  return (
    <group>
      <mesh onPointerOver={(e) => e.stopPropagation()}>
        <sphereGeometry args={[R, 96, 96]} />
        <meshStandardMaterial
          key={map ? "textured" : "plain"}
          map={map ?? undefined}
          color={map ? "#9dc3e6" : "#0c2144"}
          roughness={0.9}
          metalness={0.05}
          emissive="#0a3050"
          emissiveIntensity={map ? 0.28 : 0.5}
        />
      </mesh>

      {/* Highlighted polar caps */}
      <mesh>
        <sphereGeometry args={[R * 1.004, 64, 24, 0, Math.PI * 2, 0, capAngle]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.16} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[R * 1.004, 64, 24, 0, Math.PI * 2, 0, capAngle]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.2} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      <lineSegments geometry={graticule}>
        <lineBasicMaterial color="#38BDF8" transparent opacity={0.14} />
      </lineSegments>
      {circles.map((l, i) => (
        <primitive key={i} object={l} />
      ))}

      {/* Fresnel atmosphere */}
      <mesh scale={1.14}>
        <sphereGeometry args={[R, 64, 64]} />
        <shaderMaterial
          side={THREE.BackSide}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          vertexShader={`varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
          fragmentShader={`varying vec3 vN; void main(){ float i = pow(0.74 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(0.22,0.74,0.97,1.0) * i * 1.5; }`}
        />
      </mesh>
    </group>
  );
}

interface PinProps {
  station: Station;
  wx: Wx;
  active: boolean;
  onHover: (id: string | null) => void;
  onToggle: (id: string) => void;
}

function Pin({ station, wx, active, onHover, onToggle }: PinProps) {
  const ring = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const color = TONES[station.tone];

  const { position, quaternion } = useMemo(() => {
    const p = latLon(station.lat, station.lon, R);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.clone().normalize());
    return { position: p, quaternion: q };
  }, [station]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    [ring.current, ring2.current].forEach((m, i) => {
      if (!m) return;
      const p = ((t + i * 0.9) % 1.8) / 1.8;
      m.scale.setScalar(1 + p * 4.2);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.75;
    });
  });

  return (
    <group
      position={position}
      quaternion={quaternion}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(station.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(station.id);
      }}
    >
      {[ring, ring2].map((r, i) => (
        <mesh key={i} ref={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
          <ringGeometry args={[0.035, 0.05, 40]} />
          <meshBasicMaterial color={color} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.22, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.24, 0]} scale={active ? 1.35 : 1}>
        <sphereGeometry args={[0.05, 20, 20]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* generous invisible hit target for touch and mouse */}
      <mesh position={[0, 0.16, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Html position={[0, 0.32, 0]} center={false} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div className="-translate-x-2 whitespace-nowrap text-[11px] font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          {station.name}
        </div>
        {active && (
          <div className="glass shard-sm mt-1.5 w-56 -translate-x-2 p-3 text-white" style={{ background: "rgba(3,7,18,0.82)" }}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold">{station.name}</span>
              <span className="flex items-center gap-1.5 text-[10px] text-slate-300">
                <span className={`h-1.5 w-1.5 rounded-full ${wx.live ? "bg-emerald-400" : "bg-amber-400"}`} />
                {wx.live ? "Live feed" : "Seasonal estimate"}
              </span>
            </div>
            <div className="mt-0.5 text-[11px] leading-snug text-slate-300">{station.place}</div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white/5 px-2.5 py-1.5">
                <div className="text-[10px] text-slate-400">Temperature</div>
                <div className="text-base font-bold tabular-nums">{wx.temp.toFixed(1)}°C</div>
              </div>
              <div className="rounded-lg bg-white/5 px-2.5 py-1.5">
                <div className="text-[10px] text-slate-400">Wind</div>
                <div className="text-base font-bold tabular-nums">{wx.wind.toFixed(1)} m/s</div>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-300">
              {station.status}. Since {station.since}.
            </div>
          </div>
        )}
      </Html>
    </group>
  );
}

function Rig({ focus, goalRef }: { focus: FocusKey; goalRef: React.MutableRefObject<THREE.Vector3 | null> }) {
  const controls = useThree((s) => s.controls) as unknown as { update: () => void } | null;

  useEffect(() => {
    if (focus === "free") {
      goalRef.current = null;
      return;
    }
    const [lat, lon] = FOCUS_POINTS[focus];
    goalRef.current = latLon(lat, lon, CAM_DIST);
  }, [focus, goalRef]);

  useFrame(({ camera }, delta) => {
    const g = goalRef.current;
    if (!g) return;
    camera.position.lerp(g, 1 - Math.pow(0.002, delta));
    controls?.update();
    if (camera.position.distanceTo(g) < 0.02) goalRef.current = null;
  });
  return null;
}

interface GlobeProps {
  focus: FocusKey;
  wx: Record<string, Wx>;
}

export default function PolarGlobe({ focus, wx }: GlobeProps) {
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const goal = useRef<THREE.Vector3 | null>(null);
  const activeId = hover ?? pinned;

  return (
    <Canvas
      camera={{ position: [0.4, 1.4, CAM_DIST], fov: 36 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => setPinned(null)}
      aria-label="Interactive 3D globe showing Indian polar and Himalayan research stations"
    >
      <ambientLight intensity={1.05} />
      <directionalLight position={[5, 3, 5]} intensity={2.2} color="#f0f9ff" />
      <pointLight position={[-6, -2, -4]} intensity={18} color="#38BDF8" />
      <Stars radius={60} depth={30} count={1400} factor={3} saturation={0} fade speed={0.4} />

      <Earth />
      {STATIONS.map((s) => (
        <Pin
          key={s.id}
          station={s}
          wx={wx[s.id]}
          active={activeId === s.id}
          onHover={setHover}
          onToggle={(id) => setPinned((p) => (p === id ? null : id))}
        />
      ))}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI - 0.25}
        autoRotate={focus === "free" && !activeId}
        autoRotateSpeed={0.55}
        onStart={() => {
          goal.current = null;
        }}
      />
      <Rig focus={focus} goalRef={goal} />
    </Canvas>
  );
}
