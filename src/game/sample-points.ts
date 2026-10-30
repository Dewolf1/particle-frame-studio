import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

export interface SampledCloud {
  positions: Float32Array;
  count: number;
  maxRadius: number;
}

/**
 * Samples `count` surface points from every mesh under `root`, weighted by
 * triangle area, then recenters and scales the cloud so its largest dimension
 * is `targetSize`. One-time CPU work done right after the GLB loads.
 */
export function sampleSurfacePoints(root: THREE.Object3D, count: number, targetSize: number): SampledCloud {
  root.updateMatrixWorld(true);
  const parts: THREE.BufferGeometry[] = [];
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if ((mesh as THREE.Mesh).isMesh && mesh.geometry?.getAttribute("position")) {
      let geo = mesh.geometry.clone();
      geo.applyMatrix4(mesh.matrixWorld);
      if (geo.index) geo = geo.toNonIndexed();
      for (const name of Object.keys(geo.attributes)) {
        if (name !== "position") geo.deleteAttribute(name);
      }
      geo.morphAttributes = {};
      parts.push(geo);
    }
  });
  if (parts.length === 0) throw new Error("sampleSurfacePoints: no meshes found");

  // Normalize: center at origin, largest dimension = targetSize.
  const box = new THREE.Box3();
  const tmp = new THREE.Box3();
  for (const geo of parts) {
    geo.computeBoundingBox();
    box.union(tmp.copy(geo.boundingBox!));
  }
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const scale = targetSize / Math.max(size.x, size.y, size.z);
  const norm = new THREE.Matrix4()
    .makeScale(scale, scale, scale)
    .multiply(new THREE.Matrix4().makeTranslation(-center.x, -center.y, -center.z));
  for (const geo of parts) geo.applyMatrix4(norm);

  // Area-weighted allocation across meshes.
  const v = new THREE.Vector3();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const areas = parts.map((geo) => {
    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
    let area = 0;
    for (let i = 0; i < pos.count; i += 3) {
      a.fromBufferAttribute(pos, i);
      b.fromBufferAttribute(pos, i + 1);
      c.fromBufferAttribute(pos, i + 2);
      area += tmp.getSpan? 0 : 0;
      area += new THREE.Triangle(a, b, c).getArea();
    }
    return Math.max(area, 1e-6);
  });
  const total = areas.reduce((s, x) => s + x, 0);

  const positions = new Float32Array(count * 3);
  let written = 0;
  let largest = 0;
  const counts = parts.map((_, i) => {
    if (areas[i] > areas[largest]) largest = i;
    return Math.floor((count * areas[i]) / total);
  });
  counts[largest] += count - counts.reduce((s, x) => s + x, 0);

  parts.forEach((geo, i) => {
    const mesh = new THREE.Mesh(geo);
    const sampler = new MeshSurfaceSampler(mesh).build();
    for (let k = 0; k < counts[i] && written < count; k++) {
      sampler.sample(v);
      positions[written * 3] = v.x;
      positions[written * 3 + 1] = v.y;
      positions[written * 3 + 2] = v.z;
      written++;
    }
  });
  // Guarantee the full count even if rounding came up short.
  while (written < count) {
    const src = Math.floor(Math.random() * written) * 3;
    positions[written * 3] = positions[src];
    positions[written * 3 + 1] = positions[src + 1];
    positions[written * 3 + 2] = positions[src + 2];
    written++;
  }

  let maxRadius = 0;
  for (let i = 0; i < count; i++) {
    maxRadius = Math.max(
      maxRadius,
      Math.hypot(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]),
    );
  }

  for (const geo of parts) geo.dispose();
  return { positions, count, maxRadius };
}
