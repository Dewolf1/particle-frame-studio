import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import cameraModel from "@/assets/models/camera-01.glb.asset.json";
import { FEEL, ParticleSim } from "@/game/particle-sim";
import { sampleSurfacePoints } from "@/game/sample-points";

const COUNT = 22000;
const CAM_FOV = 42;
/** 2 * tan(fov/2) — vertical world height per unit distance. */
const VIEW_FACTOR = 0.768;

const vertexShader = /* glsl */ `
uniform float uSize;
uniform float uScale;
uniform float uTime;
uniform float uScroll;
attribute float aColor;
attribute float aSize;
attribute vec3 aDir;
attribute float aRand;
varying float vColor;
varying float vAlpha;
void main() {
  // Scrolling eases the whole cloud apart, on top of the CPU simulation.
  vec3 p = position + aDir * (uScroll * uScroll * 1.4) * (0.25 + 0.75 * aRand);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(uSize * aSize * uScale / max(-mv.z, 0.1), 1.0, 24.0);
  vColor = aColor;
  vAlpha = 0.8 + 0.2 * sin(uTime * 1.6 + position.x * 3.1 + position.y * 2.7 + aRand * 6.28);
}
`;

const fragmentShader = /* glsl */ `
uniform float uFade;
uniform vec3 uColA;
uniform vec3 uColB;
varying float vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  float a = smoothstep(0.5, 0.08, d);
  a *= a * vAlpha * uFade;
  if (a < 0.003) discard;
  vec3 col = mix(uColA, uColB, vColor);
  gl_FragColor = vec4(col, a);
}
`;

interface CameraParticlesProps {
  onSim?: (sim: ParticleSim | null) => void;
  onReady?: () => void;
}

export function CameraParticles({ onSim, onReady }: CameraParticlesProps) {
  const { scene } = useGLTF(cameraModel.url);
  const sampled = useMemo(() => sampleSurfacePoints(scene, COUNT, FEEL.targetSize), [scene]);
  const sim = useMemo(
    () => new ParticleSim(sampled.positions, sampled.maxRadius * 1.5 + 0.6),
    [sampled],
  );

  useEffect(() => {
    onSim?.(sim);
    return () => onSim?.(null);
  }, [sim, onSim]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(sim.pos, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("position", posAttr);
    g.setAttribute("aDir", new THREE.BufferAttribute(sim.dirs, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(sim.rand, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(sim.colorMix, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(sim.sizeVar, 1));
    return g;
  }, [sim]);

  const uniforms = useMemo(
    () => ({
      uSize: { value: 0.016 },
      uScale: { value: 600 },
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uFade: { value: 0 },
      uColA: { value: new THREE.Color(1.0, 0.98, 0.93) },
      uColB: { value: new THREE.Color(1.0, 0.66, 0.32) },
    }),
    [],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms,
      }),
    [uniforms],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  const group = useRef<THREE.Group>(null);
  const firedReady = useRef(false);

  useFrame((state, delta) => {
    sim.update(delta);
    (geometry.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;

    const u = uniforms;
    u.uTime.value = sim.time;
    u.uScale.value = state.size.height * 0.5 * state.viewport.dpr;
    const explodeFade =
      sim.phase === "exploded"
        ? 1 - 0.7 * THREE.MathUtils.clamp((sim.explodeAge - 0.35) / 2.4, 0, 1)
        : 1;
    u.uFade.value = Math.min(1, sim.time / 0.9) * explodeFade;

    const sy =
      typeof window !== "undefined"
        ? THREE.MathUtils.clamp(window.scrollY / Math.max(window.innerHeight * 0.9, 1), 0, 1)
        : 0;
    u.uScroll.value = sy;

    // Keep the camera fully framed on any aspect ratio.
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const desiredZ = Math.max(1.9, 2.0 / (VIEW_FACTOR * aspect));
    const cam = state.camera as THREE.PerspectiveCamera;
    cam.position.z += (desiredZ - cam.position.z) * Math.min(1, delta * 4);

    const g = group.current;
    if (g) {
      g.rotation.y = sim.time * 0.13;
      g.rotation.x = Math.sin(sim.time * 0.23) * 0.05 + sy * 0.25;
      g.rotation.z = Math.sin(sim.time * 0.19) * 0.03;
      g.position.y = -0.18 + Math.sin(sim.time * 0.5) * 0.04;
    }

    if (!firedReady.current) {
      firedReady.current = true;
      onReady?.();
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry} frustumCulled={false} raycast={() => null}>
        <primitive object={material} attach="material" />
      </points>
    </group>
  );
}

useGLTF.preload(cameraModel.url);
