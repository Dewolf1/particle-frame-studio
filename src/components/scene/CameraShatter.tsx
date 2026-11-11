import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import cameraModel from "@/assets/models/camera-textured.glb.asset.json";

export type CameraPhase = "idle" | "exploded" | "assembling";

interface CameraShatterProps {
  shattered: boolean;
  onPhaseChange?: (phase: CameraPhase) => void;
  onReady?: () => void;
}

interface SourceMesh {
  geometry: THREE.BufferGeometry;
  materials: THREE.Material[];
  faceCount: number;
}

interface ShardPart {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}

interface Shard {
  center: THREE.Vector3;
  parts: ShardPart[];
}

interface Motion {
  vx: number;
  vy: number;
  vz: number;
  wx: number;
  wy: number;
  wz: number;
}

const SHARD_COUNT = 20;
const TARGET_SIZE = 1.7;
const AUTO_REASSEMBLE = 4.2;
const ATTRIBUTE_NAMES = ["position", "normal", "uv", "uv2", "color", "tangent"];

function triangleVertex(geometry: THREE.BufferGeometry, corner: number) {
  return geometry.index?.getX(corner) ?? corner;
}

function faceMaterialIndex(geometry: THREE.BufferGeometry, start: number) {
  const group = geometry.groups.find((item) => start >= item.start && start < item.start + item.count);
  return group?.materialIndex ?? 0;
}

function buildShards(root: THREE.Object3D): Shard[] {
  root.updateMatrixWorld(true);
  const sources: SourceMesh[] = [];
  const bounds = new THREE.Box3();

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const geometry = object.geometry.clone();
    geometry.applyMatrix4(object.matrixWorld);
    geometry.computeBoundingBox();
    if (!geometry.boundingBox || !geometry.getAttribute("position")) {
      geometry.dispose();
      return;
    }
    bounds.union(geometry.boundingBox);
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    const vertexCount = geometry.index?.count ?? geometry.getAttribute("position").count;
    const start = Math.max(0, geometry.drawRange.start);
    const end = Math.min(vertexCount, start + (Number.isFinite(geometry.drawRange.count) ? geometry.drawRange.count : vertexCount));
    sources.push({ geometry, materials, faceCount: Math.max(0, Math.floor((end - start) / 3)) });
  });

  if (sources.length === 0 || bounds.isEmpty()) return [];

  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const scale = TARGET_SIZE / Math.max(size.x, size.y, size.z, 1e-5);
  const normalize = new THREE.Matrix4()
    .makeScale(scale, scale, scale)
    .multiply(new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z));
  sources.forEach((source) => {
    source.geometry.applyMatrix4(normalize);
  });

  const totalFaces = sources.reduce((sum, source) => sum + source.faceCount, 0);
  if (totalFaces === 0) return [];

  const sampleStride = Math.max(1, Math.ceil(totalFaces / 1200));
  const candidates: THREE.Vector3[] = [];
  const point = new THREE.Vector3();
  let faceCursor = 0;
  for (const source of sources) {
    const position = source.geometry.getAttribute("position");
    const start = Math.max(0, source.geometry.drawRange.start);
    for (let face = 0; face < source.faceCount; face++) {
      if (faceCursor % sampleStride === 0 || candidates.length < SHARD_COUNT) {
        const corner = start + face * 3;
        const a = triangleVertex(source.geometry, corner);
        const b = triangleVertex(source.geometry, corner + 1);
        const c = triangleVertex(source.geometry, corner + 2);
        point.set(
          (position.getX(a) + position.getX(b) + position.getX(c)) / 3,
          (position.getY(a) + position.getY(b) + position.getY(c)) / 3,
          (position.getZ(a) + position.getZ(b) + position.getZ(c)) / 3,
        );
        candidates.push(point.clone());
      }
      faceCursor++;
    }
  }

  const shardCount = Math.min(SHARD_COUNT, candidates.length);
  const seeds: THREE.Vector3[] = [candidates[0] ?? new THREE.Vector3()];
  const closest = new Float32Array(candidates.length).fill(Number.POSITIVE_INFINITY);
  while (seeds.length < shardCount) {
    const latest = seeds[seeds.length - 1];
    if (!latest) break;
    let farthestIndex = 0;
    let farthestDistance = -1;
    candidates.forEach((candidate, index) => {
      const distance = candidate.distanceToSquared(latest);
      closest[index] = Math.min(closest[index] ?? Number.POSITIVE_INFINITY, distance);
      if ((closest[index] ?? 0) > farthestDistance) {
        farthestDistance = closest[index] ?? 0;
        farthestIndex = index;
      }
    });
    seeds.push(candidates[farthestIndex]?.clone() ?? new THREE.Vector3());
  }

  const assignments = sources.map((source) => new Uint8Array(source.faceCount));
  const centers = seeds.map(() => new THREE.Vector3());
  const faceTotals = new Uint32Array(shardCount);
  faceCursor = 0;
  for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex++) {
    const source = sources[sourceIndex];
    const assignment = assignments[sourceIndex];
    if (!source || !assignment) continue;
    const geometry = source.geometry;
    const position = geometry.getAttribute("position");
    const start = Math.max(0, geometry.drawRange.start);
    for (let face = 0; face < source.faceCount; face++) {
      const corner = start + face * 3;
      const a = triangleVertex(geometry, corner);
      const b = triangleVertex(geometry, corner + 1);
      const c = triangleVertex(geometry, corner + 2);
      point.set(
        (position.getX(a) + position.getX(b) + position.getX(c)) / 3,
        (position.getY(a) + position.getY(b) + position.getY(c)) / 3,
        (position.getZ(a) + position.getZ(b) + position.getZ(c)) / 3,
      );
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      seeds.forEach((seed, index) => {
        const distance = point.distanceToSquared(seed);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      assignment[face] = best;
      centers[best]?.add(point);
      faceTotals[best] = (faceTotals[best] ?? 0) + 1;
      faceCursor++;
    }
  }
  centers.forEach((shardCenter, index) => {
    const count = faceTotals[index] ?? 0;
    if (count > 0) shardCenter.multiplyScalar(1 / count);
    else shardCenter.copy(seeds[index] ?? new THREE.Vector3());
  });

  const buckets = Array.from({ length: shardCount }, () => new Map<string, Map<string, number[]>>());
  for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex++) {
    const source = sources[sourceIndex];
    const assignment = assignments[sourceIndex];
    if (!source || !assignment) continue;
    const geometry = source.geometry;
    const position = geometry.getAttribute("position");
    const start = Math.max(0, geometry.drawRange.start);
    const attributes = ATTRIBUTE_NAMES.flatMap((name) => {
      const attribute = geometry.getAttribute(name);
      return attribute ? [[name, attribute] as const] : [];
    });
    for (let face = 0; face < source.faceCount; face++) {
      const corner = start + face * 3;
      const shardIndex = assignment[face] ?? 0;
      const materialIndex = faceMaterialIndex(geometry, corner);
      const material = source.materials[materialIndex] ?? source.materials[0];
      const shardBucket = buckets[shardIndex];
      if (!material || !shardBucket) continue;
      const partKey = `${sourceIndex}:${materialIndex}`;
      let attributeBuckets = shardBucket.get(partKey);
      if (!attributeBuckets) {
        attributeBuckets = new Map();
        shardBucket.set(partKey, attributeBuckets);
      }
      for (let vertex = 0; vertex < 3; vertex++) {
        const sourceVertex = triangleVertex(geometry, corner + vertex);
        for (const [name, attribute] of attributes) {
          let values = attributeBuckets.get(name);
          if (!values) {
            values = [];
            attributeBuckets.set(name, values);
          }
          for (let component = 0; component < attribute.itemSize; component++) {
            const value = attribute.getComponent(sourceVertex, component);
            values.push(name === "position" ? value - (centers[shardIndex]?.getComponent(component) ?? 0) : value);
          }
        }
      }
    }
  }

  const shards = buckets.map((bucket, index) => {
    const parts: ShardPart[] = [];
    bucket.forEach((attributes, key) => {
      const [sourceKey, materialKey] = key.split(":");
      const sourceIndex = Number(sourceKey);
      const materialIndex = Number(materialKey);
      const material = sources[sourceIndex]?.materials[materialIndex] ?? sources[sourceIndex]?.materials[0];
      if (!material) return;
      const geometry = new THREE.BufferGeometry();
      attributes.forEach((values, name) => {
        const itemSize = sources[sourceIndex]?.geometry.getAttribute(name)?.itemSize ?? (name === "position" || name === "normal" ? 3 : 2);
        geometry.setAttribute(name, new THREE.Float32BufferAttribute(values, itemSize));
      });
      geometry.computeBoundingSphere();
      parts.push({ geometry, material });
    });
    return { center: centers[index]?.clone() ?? new THREE.Vector3(), parts };
  });

  sources.forEach((source) => source.geometry.dispose());
  return shards;
}

export function CameraShatter({ shattered, onPhaseChange, onReady }: CameraShatterProps) {
  const { scene } = useGLTF(cameraModel.url);
  const shards = useMemo(() => buildShards(scene), [scene]);
  const outer = useRef<THREE.Group>(null);
  const pieceGroups = useRef<Array<THREE.Group | null>>([]);
  const motion = useRef<Motion[]>([]);
  const phase = useRef<CameraPhase>("idle");
  const lastShattered = useRef(false);
  const explodeAge = useRef(0);
  const assembleAge = useRef(0);

  if (motion.current.length !== shards.length) {
    motion.current = shards.map(() => ({ vx: 0, vy: 0, vz: 0, wx: 0, wy: 0, wz: 0 }));
  }

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    if (lastShattered.current === shattered) return;
    lastShattered.current = shattered;
    if (shattered && phase.current !== "exploded") {
      explodeAge.current = 0;
      phase.current = "exploded";
      shards.forEach((shard, index) => {
        const group = pieceGroups.current[index];
        const speed = 0.8 + Math.random() * 0.8;
        const random = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        const direction = shard.center.clone().normalize().multiplyScalar(0.7).add(random).normalize();
        const item = motion.current[index];
        if (!group || !item) return;
        item.vx = direction.x * speed;
        item.vy = direction.y * speed + 0.12;
        item.vz = direction.z * speed;
        item.wx = (Math.random() - 0.5) * 2.4;
        item.wy = (Math.random() - 0.5) * 2.4;
        item.wz = (Math.random() - 0.5) * 2.4;
      });
      onPhaseChange?.("exploded");
    } else if (!shattered && phase.current === "exploded") {
      assembleAge.current = 0;
      phase.current = "assembling";
      onPhaseChange?.("assembling");
    }
  }, [shattered, shards, onPhaseChange]);

  useFrame((state, deltaRaw) => {
    const dt = Math.min(deltaRaw, 0.05);
    if (outer.current) {
      outer.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.12;
      outer.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.035;
      outer.current.position.y = -0.08 + Math.sin(state.clock.elapsedTime * 0.55) * 0.035;
    }

    if (phase.current === "exploded") {
      explodeAge.current += dt;
      if (explodeAge.current >= AUTO_REASSEMBLE) {
        assembleAge.current = 0;
        phase.current = "assembling";
        onPhaseChange?.("assembling");
      }
    }

    for (let index = 0; index < shards.length; index++) {
      const group = pieceGroups.current[index];
      const shard = shards[index];
      const item = motion.current[index];
      if (!group || !shard || !item) continue;

      if (phase.current === "exploded") {
        const drag = Math.exp(-0.72 * dt);
        item.vx *= drag;
        item.vy = (item.vy - 0.12 * dt) * drag;
        item.vz *= drag;
        group.position.x += item.vx * dt;
        group.position.y += item.vy * dt;
        group.position.z += item.vz * dt;
        group.rotation.x += item.wx * dt;
        group.rotation.y += item.wy * dt;
        group.rotation.z += item.wz * dt;
      } else if (phase.current === "assembling") {
        assembleAge.current += index === 0 ? dt : 0;
        const damping = Math.exp(-7 * dt);
        item.vx += (shard.center.x - group.position.x) * 32 * dt;
        item.vy += (shard.center.y - group.position.y) * 32 * dt;
        item.vz += (shard.center.z - group.position.z) * 32 * dt;
        item.vx *= damping;
        item.vy *= damping;
        item.vz *= damping;
        group.position.x += item.vx * dt;
        group.position.y += item.vy * dt;
        group.position.z += item.vz * dt;
        item.wx += -group.rotation.x * 30 * dt;
        item.wy += -group.rotation.y * 30 * dt;
        item.wz += -group.rotation.z * 30 * dt;
        item.wx *= damping;
        item.wy *= damping;
        item.wz *= damping;
        group.rotation.x += item.wx * dt;
        group.rotation.y += item.wy * dt;
        group.rotation.z += item.wz * dt;

        if (assembleAge.current > 1.15) {
          group.position.copy(shard.center);
          group.rotation.set(0, 0, 0);
          Object.assign(item, { vx: 0, vy: 0, vz: 0, wx: 0, wy: 0, wz: 0 });
          if (index === shards.length - 1) {
            phase.current = "idle";
            onPhaseChange?.("idle");
          }
        }
      }
    }
  });

  return (
    <group ref={outer}>
      {shards.map((shard, index) => (
        <group
          key={index}
          ref={(group) => {
            pieceGroups.current[index] = group;
          }}
          position={shard.center}
        >
          {shard.parts.map((part, partIndex) => (
            <mesh key={partIndex} geometry={part.geometry} material={part.material} castShadow receiveShadow />
          ))}
        </group>
      ))}
    </group>
  );
}

useGLTF.preload(cameraModel.url);