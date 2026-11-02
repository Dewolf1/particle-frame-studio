// Pure TypeScript particle simulation for the hero camera.
// No React, no three.js: the scene layer only reads `pos` each frame.
//
// The cloud is organized into rigid "pieces" (Voronoi chunks of the surface).
// When shattered, each piece flies off, spins and tumbles as one solid shard,
// while a light dust haze drifts off the pieces. Reassembly springs the
// particles back to their sampled surface points.

export type ParticlePhase = "assembling" | "idle" | "exploded";

/** Feel constants — tune here, not in the scene layer. */
export const FEEL = {
  /** Model width after normalization, world units. */
  targetSize: 1.7,
  /** Number of rigid pieces the model breaks into. */
  pieces: 16,
  /** Piece drift speed, units/s. */
  pieceSpeed: 0.85,
  pieceSpread: 0.55,
  /** How much of a piece's velocity points away from the model center (0..1). */
  radialBias: 0.6,
  /** Piece tumble rate, rad/s. */
  pieceSpin: 1.5,
  /** Fraction of particles that shed off as loose dust; the rest stay locked
   *  to their shard so the pieces read as solid fragments. */
  dustFraction: 0.25,
  /** Dust haze: speed, drag and gravity for the fine particles. */
  dustSpeed: 1.1,
  dustDrag: 1.8,
  drag: 1.1,
  gravity: -0.12,
  /** Assembling spring stiffness / damping. */
  spring: 34,
  damp: 6.0,
  idleSpring: 55,
  idleDamp: 8,
  /** Idle breathing force amplitude (units/s^2). */
  wobble: 0.35,
  wobbleFreq: 0.7,
  /** Intro: per-particle delay spread and settle window, seconds. */
  assembleStagger: 1.15,
  settleTime: 1.6,
  /** Seconds the cloud stays exploded before reassembling. */
  autoReassemble: 4.2,
} as const;

const TAU = Math.PI * 2;

interface PieceState {
  /** Piece centroid at shatter time. */
  cx: Float32Array;
  cy: Float32Array;
  cz: Float32Array;
  px: Float32Array;
  py: Float32Array;
  pz: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  vz: Float32Array;
  /** Rotation axis (unit) and accumulated angle. */
  ax: Float32Array;
  ay: Float32Array;
  az: Float32Array;
  angle: Float32Array;
  spin: Float32Array;
  /** Cached sin/cos of the current angle, per frame. */
  c: Float32Array;
  s: Float32Array;
}

export class ParticleSim {
  readonly count: number;
  readonly pieceCount: number;
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
  /** Piece membership and the particle's offset from its piece centroid. */
  private pieceOf: Uint16Array;
  private offX: Float32Array;
  private offY: Float32Array;
  private offZ: Float32Array;
  /** Dust haze drift, integrated only while exploded. */
  private dust: Float32Array;
  private dustVel: Float32Array;
  private pieces: PieceState;

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

    this.dust = new Float32Array(n * 3);
    this.dustVel = new Float32Array(n * 3);
    this.pieceOf = new Uint16Array(n);
    this.offX = new Float32Array(n);
    this.offY = new Float32Array(n);
    this.offZ = new Float32Array(n);
    this.pieces = this.buildPieces();
    this.pieceCount = this.pieces.px.length;
  }

  /** Split the surface into spatially coherent chunks (piece per seed point). */
  private buildPieces(): PieceState {
    const n = this.count;
    const K = Math.max(4, FEEL.pieces);
    const { home } = this;

    // Seeds: a spread of random surface points, nudged apart greedily.
    const sx = new Float32Array(K);
    const sy = new Float32Array(K);
    const sz = new Float32Array(K);
    const minDist = 0.45;
    let placed = 0;
    let guard = 0;
    while (placed < K && guard < K * 60) {
      guard++;
      const i = Math.floor(Math.random() * n) * 3;
      const x = home[i]!;
      const y = home[i + 1]!;
      const z = home[i + 2]!;
      let ok = true;
      for (let p = 0; p < placed; p++) {
        if (Math.hypot(x - sx[p]!, y - sy[p]!, z - sz[p]!) < minDist) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      sx[placed] = x;
      sy[placed] = y;
      sz[placed] = z;
      placed++;
    }
    // Fill any remaining slots by reusing placed seeds.
    for (let p = placed; p < K; p++) {
      sx[p] = sx[p % Math.max(placed, 1)]!;
      sy[p] = sy[p % Math.max(placed, 1)]!;
      sz[p] = sz[p % Math.max(placed, 1)]!;
    }

    // Nearest-seed assignment + centroids.
    const cnt = new Float32Array(K);
    const cx = new Float32Array(K);
    const cy = new Float32Array(K);
    const cz = new Float32Array(K);
    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      const x = home[i3]!;
      const y = home[i3 + 1]!;
      const z = home[i3 + 2]!;
      let best = 0;
      let bd = Infinity;
      for (let p = 0; p < K; p++) {
        const d = (x - sx[p]!) ** 2 + (y - sy[p]!) ** 2 + (z - sz[p]!) ** 2;
        if (d < bd) {
          bd = d;
          best = p;
        }
      }
      this.pieceOf[i] = best;
      cx[best] = cx[best]! + x;
      cy[best] = cy[best]! + y;
      cz[best] = cz[best]! + z;
      cnt[best]!++;
    }
    for (let p = 0; p < K; p++) {
      if (cnt[p]! > 0) {
        cx[p] = cx[p]! / cnt[p]!;
        cy[p] = cy[p]! / cnt[p]!;
        cz[p] = cz[p]! / cnt[p]!;
      }
    }
    // Empty pieces: pull their center onto the nearest used piece's region.
    for (let p = 0; p < K; p++) {
      if (cnt[p]! > 0) continue;
      for (let q = 0; q < K; q++) {
        if (cnt[q]! > 0) {
          cx[p] = sx[q]!;
          cy[p] = sy[q]!;
          cz[p] = sz[q]!;
          break;
        }
      }
    }

    // Per-particle offset from its piece centroid.
    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      const p = this.pieceOf[i]!;
      this.offX[i] = home[i3]! - cx[p]!;
      this.offY[i] = home[i3 + 1]! - cy[p]!;
      this.offZ[i] = home[i3 + 2]! - cz[p]!;
    }

    return {
      cx,
      cy,
      cz,
      px: cx.slice(),
      py: cy.slice(),
      pz: cz.slice(),
      vx: new Float32Array(K),
      vy: new Float32Array(K),
      vz: new Float32Array(K),
      ax: new Float32Array(K),
      ay: new Float32Array(K),
      az: new Float32Array(K),
      angle: new Float32Array(K),
      spin: new Float32Array(K),
      c: new Float32Array(K),
      s: new Float32Array(K),
    };
  }

  toggle() {
    if (this.phase === "exploded") this.assemble();
    else this.shatter();
  }

  shatter() {
    if (this.phase === "exploded") return;
    this.phase = "exploded";
    this.explodeAge = 0;
    const n = this.count;
    const { pos, home, dust, dustVel, offX, offY, offZ, pieces } = this;
    const K = pieces.px.length;
    const b = FEEL.radialBias;

    // Pieces start at their centroid, fly outward and tumble.
    for (let p = 0; p < K; p++) {
      pieces.px[p] = pieces.cx[p]!;
      pieces.py[p] = pieces.cy[p]!;
      pieces.pz[p] = pieces.cz[p]!;
      const rl = Math.hypot(pieces.cx[p]!, pieces.cy[p]!, pieces.cz[p]!) + 1e-5;
      const u = Math.random() * 2 - 1;
      const th = Math.random() * TAU;
      const rr = Math.sqrt(1 - u * u);
      const speed = FEEL.pieceSpeed * (0.45 + FEEL.pieceSpread * Math.random());
      pieces.vx[p] = ((pieces.cx[p]! / rl) * b + rr * Math.cos(th) * (1 - b)) * speed;
      pieces.vy[p] = ((pieces.cy[p]! / rl) * b + u * (1 - b)) * speed;
      pieces.vz[p] = ((pieces.cz[p]! / rl) * b + rr * Math.sin(th) * (1 - b)) * speed;
      // Random unit rotation axis + spin rate.
      const au = Math.random() * 2 - 1;
      const ath = Math.random() * TAU;
      const ar = Math.sqrt(1 - au * au);
      pieces.ax[p] = ar * Math.cos(ath);
      pieces.ay[p] = au;
      pieces.az[p] = ar * Math.sin(ath);
      pieces.angle[p] = 0;
      pieces.spin[p] = FEEL.pieceSpin * (0.4 + Math.random() * 0.9);
    }

    // Dust: offset from the rigid piece position, drifting freely.
    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      dust[i3] = pos[i3]! - home[i3]!;
      dust[i3 + 1] = pos[i3 + 1]! - home[i3 + 1]!;
      dust[i3 + 2] = pos[i3 + 2]! - home[i3 + 2]!;
      const u = Math.random() * 2 - 1;
      const th = Math.random() * TAU;
      const rr = Math.sqrt(1 - u * u);
      const sp = FEEL.dustSpeed * (0.2 + Math.random() * 1.1);
      dustVel[i3] = rr * Math.cos(th) * sp;
      dustVel[i3 + 1] = u * sp + 0.15;
      dustVel[i3 + 2] = rr * Math.sin(th) * sp;
      offX[i] = home[i3]! - pieces.cx[this.pieceOf[i]!]!;
      offY[i] = home[i3 + 1]! - pieces.cy[this.pieceOf[i]!]!;
      offZ[i] = home[i3 + 2]! - pieces.cz[this.pieceOf[i]!]!;
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
    const dragF = Math.exp(-(exploded ? FEEL.drag : 0) * dt);
    const dustDragF = Math.exp(-FEEL.dustDrag * dt);
    const spring = exploded ? 0 : this.phase === "assembling" ? FEEL.spring : FEEL.idleSpring;
    const damp = exploded ? 0 : this.phase === "assembling" ? FEEL.damp : FEEL.idleDamp;
    const dampF = Math.exp(-damp * dt);
    const wob = this.phase === "idle" ? FEEL.wobble : FEEL.wobble * 0.35;
    const wf = FEEL.wobbleFreq;
    const { pos, vel, home, seed, count, delay, pieces } = this;
    const assembleTime = this.assembleTime;

    if (exploded) {
      // Advance the rigid pieces: drift, gravity, gentle turbulence, spin.
      const K = pieces.px.length;
      for (let p = 0; p < K; p++) {
        const f = 0.8;
        const px = pieces.px[p]!;
        const py = pieces.py[p]!;
        const pz = pieces.pz[p]!;
        const tx = Math.sin(pz * 2.0 * f + t * 1.4) * Math.cos(py * 1.6 * f - t * 1.0);
        const ty = Math.sin(px * 1.8 * f + t * 1.1) * Math.cos(pz * 2.1 * f + t * 0.8);
        const tz = Math.sin(py * 1.9 * f - t * 1.2) * Math.cos(px * 1.5 * f + t * 1.0);
        pieces.vx[p] = pieces.vx[p]! * dragF + tx * 0.25 * dt;
        pieces.vy[p] = pieces.vy[p]! * dragF + (ty * 0.25 + FEEL.gravity) * dt;
        pieces.vz[p] = pieces.vz[p]! * dragF + tz * 0.25 * dt;
        pieces.px[p] = px + pieces.vx[p]! * dt;
        pieces.py[p] = py + pieces.vy[p]! * dt;
        pieces.pz[p] = pz + pieces.vz[p]! * dt;
        pieces.angle[p] = pieces.angle[p]! + pieces.spin[p]! * dt;
        pieces.c[p] = Math.cos(pieces.angle[p]!);
        pieces.s[p] = Math.sin(pieces.angle[p]!);
      }
    }

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let px = pos[i3]!;
      let py = pos[i3 + 1]!;
      let pz = pos[i3 + 2]!;
      let vx = vel[i3]!;
      let vy = vel[i3 + 1]!;
      let vz = vel[i3 + 2]!;

      if (exploded) {
        // Rigid piece motion: rotate the particle's offset around the piece axis.
        const p = this.pieceOf[i]!;
        const ox = this.offX[i]!;
        const oy = this.offY[i]!;
        const oz = this.offZ[i]!;
        const c = pieces.c[p]!;
        const s = pieces.s[p]!;
        const axv = pieces.ax[p]!;
        const ayv = pieces.ay[p]!;
        const azv = pieces.az[p]!;
        // Rodrigues: v*c + (axis×v)*s + axis*(axis·v)*(1-c)
        const crossX = ayv * oz - azv * oy;
        const crossY = azv * ox - axv * oz;
        const crossZ = axv * oy - ayv * ox;
        const dot = axv * ox + ayv * oy + azv * oz;
        const rx = ox * c + crossX * s + axv * dot * (1 - c);
        const ry = oy * c + crossY * s + ayv * dot * (1 - c);
        const rz = oz * c + crossZ * s + azv * dot * (1 - c);

        // Dust haze drifts off the piece.
        const d3 = i3;
        this.dustVel[d3] = this.dustVel[d3]! * dustDragF;
        this.dustVel[d3 + 1] = (this.dustVel[d3 + 1]! + FEEL.gravity * 0.4 * dt) * dustDragF;
        this.dustVel[d3 + 2] = this.dustVel[d3 + 2]! * dustDragF;
        this.dust[d3] = this.dust[d3]! + this.dustVel[d3]! * dt;
        this.dust[d3 + 1] = this.dust[d3 + 1]! + this.dustVel[d3 + 1]! * dt;
        this.dust[d3 + 2] = this.dust[d3 + 2]! + this.dustVel[d3 + 2]! * dt;

        px = pieces.px[p]! + rx + this.dust[d3]!;
        py = pieces.py[p]! + ry + this.dust[d3 + 1]!;
        pz = pieces.pz[p]! + rz + this.dust[d3 + 2]!;
        vx = pieces.vx[p]!;
        vy = pieces.vy[p]!;
        vz = pieces.vz[p]!;
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
