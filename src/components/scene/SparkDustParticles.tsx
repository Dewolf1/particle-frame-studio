import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { CameraPhase } from "./CameraShatter";

interface SparkDustParticlesProps {
  phase: CameraPhase;
}

const COUNT = 1400;

export function SparkDustParticles({ phase }: SparkDustParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Initial particle configuration
  const { positions, velocities, colors, scales, basePositions } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const base = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const sca = new Float32Array(COUNT);

    const amberA = new THREE.Color("#ffaa33");
    const amberB = new THREE.Color("#fff2dd");
    const tempColor = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      // Clustered around camera body center
      const r = 0.15 + Math.random() * 0.75;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      const x = r * Math.cos(phi) * Math.sin(theta);
      const y = r * Math.sin(phi);
      const z = r * Math.cos(phi) * Math.cos(theta);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      base[i * 3] = x;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = z;

      // Expansion burst velocity
      const dir = new THREE.Vector3(x, y, z).normalize();
      const speed = 0.6 + Math.random() * 1.4;
      vel[i * 3] = dir.x * speed + (Math.random() - 0.5) * 0.4;
      vel[i * 3 + 1] = dir.y * speed + 0.15 + Math.random() * 0.3;
      vel[i * 3 + 2] = dir.z * speed + (Math.random() - 0.5) * 0.4;

      tempColor.lerpColors(amberA, amberB, Math.random());
      col[i * 3] = tempColor.r;
      col[i * 3 + 1] = tempColor.g;
      col[i * 3 + 2] = tempColor.b;

      sca[i] = 0.5 + Math.random() * 1.5;
    }

    return {
      positions: pos,
      basePositions: base,
      velocities: vel,
      colors: col,
      scales: sca,
    };
  }, []);

  const progress = useRef(0);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
    const dt = Math.min(delta, 0.05);

    if (phase === "exploded") {
      progress.current = Math.min(progress.current + dt * 0.7, 1);
      const drag = Math.exp(-0.85 * dt);

      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        const vx = (velocities[i3] ?? 0) * drag;
        const vy = ((velocities[i3 + 1] ?? 0) - 0.08 * dt) * drag;
        const vz = (velocities[i3 + 2] ?? 0) * drag;

        velocities[i3] = vx;
        velocities[i3 + 1] = vy;
        velocities[i3 + 2] = vz;

        positions[i3] = (positions[i3] ?? 0) + vx * dt;
        positions[i3 + 1] = (positions[i3 + 1] ?? 0) + vy * dt;
        positions[i3 + 2] = (positions[i3 + 2] ?? 0) + vz * dt;
      }
      posAttr.needsUpdate = true;
    } else if (phase === "assembling") {
      progress.current = Math.max(progress.current - dt * 2.2, 0);
      const ease = dt * 8.0;

      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        const px = positions[i3] ?? 0;
        const py = positions[i3 + 1] ?? 0;
        const pz = positions[i3 + 2] ?? 0;

        const bx = basePositions[i3] ?? 0;
        const by = basePositions[i3 + 1] ?? 0;
        const bz = basePositions[i3 + 2] ?? 0;

        positions[i3] = px + (bx - px) * ease;
        positions[i3 + 1] = py + (by - py) * ease;
        positions[i3 + 2] = pz + (bz - pz) * ease;
      }
      posAttr.needsUpdate = true;
    } else {
      // Idle: resting positions
      progress.current = 0;
      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        positions[i3] = basePositions[i3] ?? 0;
        positions[i3 + 1] = basePositions[i3 + 1] ?? 0;
        positions[i3 + 2] = basePositions[i3 + 2] ?? 0;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-scale" args={[scales, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={phase === "idle" ? 0 : 0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
