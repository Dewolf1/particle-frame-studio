// Pure TypeScript particle simulation for the hero camera.
// No React, no three.js: the scene layer only reads `pos` each frame.

export type ParticlePhase = "assembling" | "idle" | "exploded";

/** Feel constants — tune here, not in the scene layer. */
export const FEEL = {
  /** Model width after normalization, world units. */
  targetSize: 1.7,
  /** Explosion base speed, units/s. */
  burstSpeed: 1.7,
  burstSpread: 0.9,
  /** How much of the burst points away from the model center (0..1). */
  radialBias: 0.55,
  drag: 1.4,
  turbulence: 0.5,
  gravity: -0.05,
  /** Assembling spring stiffness / damping. */
  spring: 34,
  damp: 6.0,
  idleSpring: 30,
  idleDamp: 7,
  /** Idle breathing force amplitude (units/s^2). */
  wobble: 0.85,
  wobbleFreq: 0.7,
  /** Intro: per-particle delay spread and settle window, seconds. */
  assembleStagger: 1.15,
  settleTime: 1.6,
  /** Seconds the cloud stays exploded before reassembling. */
  autoReassemble: 3.4,
} as const;

const TAU = Math.PI * 2;

export class ParticleSim {
  readonly count: number;
  readonly home: Float32Array;
  readonly pos: Float32Array;
  readonly vel: Float32Array;
  readonly colorMix: Float32Array;
  readonly sizeVar: Float32Array;
  /** Explosion/breathing direction per particle (also used by the shader). */
  readonly dirs: Float32Array;
  readonly rand: Float32Array;

  phase: ParticlePhase = "assembling";
  onPhaseChange: (() => void) | null = null;
  time = 0;
  explodeAge = 0;

  private delay: Float32Array;
  private seed: Float32Array;
  private assembleTime = 0;
  private maxDelay: number;

  constructor(home: Float32Array, spawnRadius: number) {
    this.home = home;
    this.count = home.length / 3;
    const n = this.count;
    this.pos = new Float32Array(n * 3);
    this.vel = new Float32Array(n * 3);
    this.dirs = new Float32Array(n * 3);
    this.delay = new Float32Array(n);
    this.seed = new Float32Array(n);
    this.rand = new Float32Array(n);
    this.colorMix = new Float32Array(n);
    this.sizeVar = new Float32Array(n);

    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      // Uniform random unit direction.
      const u = Math.random() * 2 - 1;
      const th = Math.random() * TAU;
      const r = Math.sqrt(1 - u * u);
      const dx = r * Math.cos(th);
      const dy = u;
      const dz = r * Math.sin(th);
      this.dirs[i3] = dx;
      this.dirs[i3 + 1] = dy;
      this.dirs[i3 + 2] = dz;
      // Spawn on a sphere so the intro assembles inward.
      const sr = spawnRadius * (0.55 + 0.75 * Math.random());
      this.pos[i3] = dx * sr;
      this.pos[i3 + 1] = dy * sr;
      this.pos[i3 + 2] = dz * sr;
      this.delay[i] = Math.random() * FEEL.assembleStagger;
      this.seed[i] = Math.random();
      this.rand[i] = Math.random();
      // Mostly warm white, a minority of amber sparks.
      this.colorMix[i] = Math.random() < 0.15 ? 0.7 + 0.3 * Math.random() : Math.random() * 0.1;
      this.sizeVar[i] = 0.55 + Math.random() * 0.95;
    }
    this.maxDelay = FEEL.assembleStagger;
  }

  toggle() {
    if (this.phase === "exploded") this.assemble();
    else this.shatter();
  }

  shatter() {
    if (this.phase === "exploded") return;
    this.phase = "exploded";
    this.explodeAge = 0;
    const { pos, vel, dirs, count } = this;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const px = pos[i3]!;
      const py = pos[i3 + 1]!;
      const pz = pos[i3 + 2]!;
      const rl = Math.hypot(px, py, pz) + 1e-5;
      const b = FEEL.radialBias;
      let dx = dirs[i3]! * (1 - b) + (px / rl) * b;
      let dy = dirs[i3 + 1]! * (1 - b) + (py / rl) * b;
      let dz = dirs[i3 + 2]! * (1 - b) + (pz / rl) * b;
      const dl = Math.hypot(dx, dy, dz) + 1e-5;
      const speed = FEEL.burstSpeed * (0.35 + FEEL.burstSpread * Math.random());
      vel[i3] = (dx / dl) * speed;
      vel[i3 + 1] = (dy / dl) * speed;
      vel[i3 + 2] = (dz / dl) * speed;
    }
    this.emitPhaseChange();
  }

  assemble(stagger = FEEL.assembleStagger * 0.55) {
    if (this.phase === "assembling") return;
    this.phase = "assembling";
    this.assembleTime = 0;
    this.explodeAge = 0;
    for (let i = 0; i < this.count; i++) this.delay[i] = Math.random() * stagger;
    this.maxDelay = stagger;
    this.emitPhaseChange();
  }

  update(dtRaw: number) {
    const dt = Math.min(dtRaw, 0.05);
    if (dt <= 0) return;
    this.time += dt;
    const t = this.time;

    if (this.phase === "exploded") {
      this.explodeAge += dt;
      if (this.explodeAge > FEEL.autoReassemble) this.assemble();
    } else if (this.phase === "assembling") {
      this.assembleTime += dt;
      if (this.assembleTime > this.maxDelay + FEEL.settleTime) {
        this.phase = "idle";
        this.emitPhaseChange();
      }
    }

    const exploded = this.phase === "exploded";
    const dragF = exploded ? Math.exp(-FEEL.drag * dt) : 1;
    const spring = exploded ? 0 : this.phase === "assembling" ? FEEL.spring : FEEL.idleSpring;
    const damp = exploded ? 0 : this.phase === "assembling" ? FEEL.damp : FEEL.idleDamp;
    const dampF = Math.exp(-damp * dt);
    const wob = this.phase === "idle" ? FEEL.wobble : FEEL.wobble * 0.35;
    const wf = FEEL.wobbleFreq;
    const { pos, vel, home, seed, count, delay } = this;
    const assembleTime = this.assembleTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let px = pos[i3]!;
      let py = pos[i3 + 1]!;
      let pz = pos[i3 + 2]!;
      let vx = vel[i3]!;
      let vy = vel[i3 + 1]!;
      let vz = vel[i3 + 2]!;

      if (exploded) {
        // Cheap pseudo-turbulence field, drifting embers rather than debris.
        const f = 1.6;
        const tx = Math.sin(pz * 2.1 * f + t * 1.7) * Math.cos(py * 1.7 * f - t * 1.1);
        const ty = Math.sin(px * 1.9 * f + t * 1.3) * Math.cos(pz * 2.3 * f + t * 0.9);
        const tz = Math.sin(py * 2.2 * f - t * 1.5) * Math.cos(px * 1.6 * f + t * 1.2);
        vx = vx * dragF + tx * FEEL.turbulence * dt;
        vy = vy * dragF + (ty * FEEL.turbulence + FEEL.gravity) * dt;
        vz = vz * dragF + tz * FEEL.turbulence * dt;
        px += vx * dt;
        py += vy * dt;
        pz += vz * dt;
      } else if (this.phase === "idle" || assembleTime - delay[i]! > 0) {
        const s = seed[i]! * TAU;
        vx += (home[i3]! - px) * spring * dt + Math.sin(t * wf * 1.7 + s) * wob * dt;
        vy += (home[i3 + 1]! - py) * spring * dt + Math.sin(t * wf * 1.3 + s * 1.7) * wob * dt;
        vz += (home[i3 + 2]! - pz) * spring * dt + Math.sin(t * wf * 2.1 + s * 2.3) * wob * dt;
        vx *= dampF;
        vy *= dampF;
        vz *= dampF;
        px += vx * dt;
        py += vy * dt;
        pz += vz * dt;
      }

      pos[i3] = px;
      pos[i3 + 1] = py;
      pos[i3 + 2] = pz;
      vel[i3] = vx;
      vel[i3 + 1] = vy;
      vel[i3 + 2] = vz;
    }
  }

  private emitPhaseChange() {
    this.onPhaseChange?.();
  }
}
