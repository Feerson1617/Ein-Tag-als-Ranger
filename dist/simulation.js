/**
 * A deliberately simplified, individual-based ecology model.
 * One simulated day takes 15 playback seconds. Population curves emerge from
 * grazing, encounters, reproduction and mortality; these are not the exact
 * Lotka–Volterra differential equations. Distances are scene metres.
 */
export const SECONDS_PER_DAY = 15;
export const MAX_ANIMALS = 160;

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;
const angleDelta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
const BIRD_VARIANTS = ['maeusebussard', 'rotmilan', 'habicht', 'sperber', 'waldkauz', 'uhu', 'turmfalke', 'wanderfalke', 'seeadler', 'fischadler', 'kormoran', 'graureiher', 'weissstorch', 'stockente', 'hoeckerschwan', 'blaesshuhn', 'eisvogel', 'buntspecht', 'gruenspecht', 'amsel', 'kohlmeise', 'zaunkoenig', 'feldlerche', 'austernfischer'];

function seedNumber(seed) {
  if (typeof seed === 'number') return seed >>> 0;
  let n = 2166136261;
  for (const char of String(seed)) n = Math.imul(n ^ char.charCodeAt(0), 16777619);
  return n >>> 0;
}

export class Ecosystem {
  constructor(seed = 84721, options = {}) {
    this.options = options;
    this.bounds = {
      minX: options.minX ?? -110, maxX: options.maxX ?? 110,
      minZ: options.minZ ?? -110, maxZ: options.maxZ ?? 110,
    };
    this.reset(seed);
  }

  random() {
    this._rng = (this._rng + 0x6D2B79F5) >>> 0;
    let t = this._rng;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  normal() {
    return Math.sqrt(-2 * Math.log(Math.max(1e-8, this.random()))) *
      Math.cos(2 * Math.PI * this.random());
  }

  reset(seed = this.seed ?? 84721) {
    this.seed = seed;
    this._rng = seedNumber(seed);
    this._nextId = 1;
    this.time = 0;
    this.factors = {
      road: false, corridor: false, mutation: false, selection: false,
      drift: false, bottleneck: false, climate: false, disease: false,
      mateChoice: false, competition: false, geneFlow: false, habitatLoss: false,
    };
    this.agents = [];
    this.history = [];
    this.grass = { west: 0.88, east: 0.88 };
    this.events = { births: 0, predation: 0, deaths: 0, crossings: 0, mutations: 0, infections: 0 };
    this.environment = { season: 0, temperature: .5, rainfall: 1, bottleneck: 0 };
    this._historyAt = 0;
    this.add('hare', 40);
    this.add('fox', 7);
    // Background species use their own deterministic placement pass so adding
    // birds and fish does not perturb the established fox-hare experiments.
    const coreRng = this._rng;
    this.add('bird', 24);
    this.add('fish', 14);
    this._rng = coreRng;
    this._refreshStats();
    this._recordHistory();
    return this;
  }

  /** region can be 'west', 'east', 'any', or a centre {x,z,radius}. */
  add(species, count = 1, region = 'any') {
    if (!['hare', 'fox', 'bird', 'fish'].includes(species)) return [];
    const created = [];
    count = clamp(Math.floor(Number(count) || 0), 0, MAX_ANIMALS - this.agents.length);
    for (let i = 0; i < count; i++) {
      const p = this._spawnPoint(region, species);
      if (!p) continue;
      const a = this._makeAnimal(species, p, 1 + this.normal() * 0.045);
      if (species === 'bird') { a.variantIndex = this.agents.filter(existing => existing.species === 'bird').length % BIRD_VARIANTS.length; a.variant = BIRD_VARIANTS[a.variantIndex]; }
      // Alternating sexes make tiny initial groups usable without selecting a seed.
      a.sex = i % 2 ? 'm' : 'f';
      a.age = species === 'hare' ? 4 + this.random() * 40 : species === 'fox' ? 10 + this.random() * 48 : 6 + this.random() * 30;
      this.agents.push(a);
      created.push(a);
    }
    this._refreshStats();
    return created;
  }

  _makeAnimal(species, p, trait) {
    const heading = this.random() * Math.PI * 2;
    return {
      id: this._nextId++, species, x: p.x, z: p.z, heading,
      age: 0, energy: 0.72 + this.random() * 0.22,
      trait: clamp(trait, 0.68, 1.38), health: 1,
      state: species === 'hare' ? 'grazing' : species === 'fox' ? 'roaming' : species === 'bird' ? 'flying' : 'swimming', speed: 0,
      sex: this.random() < 0.5 ? 'f' : 'm',
      generation: 0, parentIds: [], mutated: false,
      variant: species === 'bird' ? BIRD_VARIANTS[Math.floor(this.random() * BIRD_VARIANTS.length)] : null,
      infected: false, immune: false, infectionAge: 0,
      targetId: null, lastBirth: -100, cooldown: this.random() * 8,
      _wander: heading, _turnIn: this.random() * 6,
      _huntTime: 0, _dead: false, _schoolPhase: this.random() * Math.PI * 2,
    };
  }

  _spawnPoint(region, species = null) {
    const b = this.bounds;
    for (let i = 0; i < 100; i++) {
      let x, z;
      if (species === 'fish') {
        const r = Math.sqrt(this.random()) * 15.8, a = this.random() * Math.PI * 2;
        x = 40 + Math.cos(a) * r; z = 35 + Math.sin(a) * r;
      } else if (region && typeof region === 'object') {
        const r = Math.sqrt(this.random()) * (region.radius ?? 10);
        const a = this.random() * Math.PI * 2;
        x = clamp(region.x + Math.cos(a) * r, b.minX + 3, b.maxX - 3);
        z = clamp(region.z + Math.sin(a) * r, b.minZ + 3, b.maxZ - 3);
      } else {
        const min = region === 'east' ? 9 : b.minX + 8;
        const max = region === 'west' ? -9 : b.maxX - 8;
        x = min + this.random() * (max - min);
        z = b.minZ + 8 + this.random() * (b.maxZ - b.minZ - 16);
      }
      if (!this._blocked(x, z, species)) return { x, z };
    }
    return null;
  }

  setFactor(name, enabled) {
    if (!(name in this.factors)) return false;
    this.factors[name] = Boolean(enabled);
    // A newly built road or closed corridor must never strand an animal in asphalt.
    if (this.factors.road && (name === 'road' || name === 'corridor')) {
      for (const a of this.agents) {
        if (Math.abs(a.x) < 4.5 && !this._inCorridor(a.z)) {
          a.x = (a.x < 0 ? -1 : 1) * 4.6;
          a.targetId = null;
        }
      }
    }
    this._refreshStats();
    return true;
  }

  _inCorridor(z) { return this.factors.corridor && Math.abs(z) < 8; }

  _blocked(x, z, species = null) {
    const b = this.bounds;
    if (x < b.minX + 2 || x > b.maxX - 2 || z < b.minZ + 2 || z > b.maxZ - 2) return true;
    if (this.factors.road && Math.abs(x) < 4.5 && !this._inCorridor(z)) return true;
    // Fish stay in the pond; land animals and the observer treat it as a boundary.
    const pondDistance = Math.hypot(x - 40, z - 35);
    if (species === 'fish') return pondDistance > 17.2;
    if (pondDistance < 19) return true;
    return Boolean(this.options.isBlocked?.(x, z));
  }

  _linePassable(a, b) {
    if (a.species === 'bird' || a.species === 'fish') return true;
    if (!this.factors.road) return true;
    if (a.x * b.x >= 0) return true;
    if (this.factors.geneFlow) {
      const t = -a.x / (b.x - a.x);
      return Math.abs(a.z + t * (b.z - a.z)) < 12;
    }
    if (!this.factors.corridor) return false;
    const t = -a.x / (b.x - a.x);
    return this._inCorridor(a.z + t * (b.z - a.z));
  }

  /** dt is playback seconds, and is subdivided to preserve encounters at high speed. */
  update(dt) {
    dt = Number(dt);
    if (!Number.isFinite(dt) || dt <= 0) return this.stats;
    // Large UI pauses are discarded by the caller; this also limits accidental jumps.
    let remaining = Math.min(dt, 120);
    while (remaining > 1e-7) {
      const step = Math.min(remaining, 0.2);
      this._step(step);
      remaining -= step;
    }
    this._refreshStats();
    return this.stats;
  }

  _step(dt) {
    const days = dt / SECONDS_PER_DAY;
    this.time += dt;
    const day = this.time / SECONDS_PER_DAY;
    const seasonal = this.factors.climate ? Math.sin(day * Math.PI / 14) : 0;
    const rainfall = this.factors.climate ? clamp(.82 - seasonal * .25, .38, 1) : 1;
    const temperature = this.factors.climate ? clamp(.5 + seasonal * .35, .08, .92) : .5;
    const bottleneck = this.factors.bottleneck && (day % 28) > 21 ? .58 : 1;
    this.environment = { season: (day % 28) / 28, temperature, rainfall, bottleneck };
    const hares = this.agents.filter(a => a.species === 'hare' && !a._dead);
    const foxes = this.agents.filter(a => a.species === 'fox' && !a._dead);
    const birds = this.agents.filter(a => a.species === 'bird' && !a._dead);
    const fish = this.agents.filter(a => a.species === 'fish' && !a._dead);
    const local = { west: 0, east: 0 };
    for (const a of hares) local[a.x < 0 ? 'west' : 'east']++;
    // Each half contains half the total food habitat; no migration of the resource.
    for (const side of ['west', 'east']) {
      const g = this.grass[side];
      const densityPressure = this.factors.competition ? 1 + Math.pow(local[side] / 52, 1.28) * .42 : 1;
      const habitat = this.factors.habitatLoss ? .62 : 1;
      const consumption = local[side] * 0.0036 * (0.35 + g * 0.65) * densityPressure;
      this.grass[side] = clamp(g + (0.55 * rainfall * habitat * g * (1 - g) - consumption) * days * bottleneck, 0.025, 1);
    }
    if (this.factors.disease) this._spreadDisease();
    const newborns = [];
    for (const a of this.agents) {
      if (a._dead) continue;
      a.age += days;
      // Background fauna keeps its own smooth movement clock and does not
      // consume the mammal population's stochastic budget. This keeps the
      // established fox-hare experiments reproducible as bird diversity grows.
      if (a.species === 'bird' || a.species === 'fish') {
        if (a.species === 'bird') this._bird(a, dt); else this._fish(a, dt);
        continue;
      }
      a.cooldown = Math.max(0, a.cooldown - dt);
      a._turnIn -= dt;
      if (a._turnIn <= 0) {
        a._wander += (this.random() - 0.5) * 2.3;
        a._turnIn = 2.5 + this.random() * 5;
      }
      if (a.species === 'hare') this._hare(a, foxes, dt, days);
      else if (a.species === 'fox') this._fox(a, hares, dt, days);
      else if (a.species === 'bird') this._bird(a, dt);
      else this._fish(a, dt);
      if (a._dead) continue;

      if (this.factors.climate) {
        const heatStress = Math.max(0, temperature - .66) * (a.species === 'hare' ? .065 : .035);
        a.energy = clamp(a.energy - heatStress * days, 0, 1);
      }
      if (this.factors.disease && a.infected) {
        a.infectionAge += days;
        a.energy = clamp(a.energy - .18 * days, 0, 1);
        if (a.infectionAge > 5 && this.random() < .09 * days) { a.infected = false; a.immune = true; }
      }
      if (this.factors.drift && a.species === 'hare') {
        const population = Math.max(2, hares.length);
        a.trait = clamp(a.trait + this.normal() * .024 * clamp(18 / population, .08, 1) * days, .62, 1.45);
      }

      const side = a.x < 0 ? 'west' : 'east';
      const food = this.grass[side];
      const life = a.species === 'hare' ? 160 : a.species === 'fox' ? 200 : a.species === 'bird' ? 230 : 260;
      const baselineDeath = a.species === 'hare' ? 0.0018 : a.species === 'fox' ? 0.0025 : 0.0012;
      const oldAge = a.age > life ? (a.age - life) * 0.001 : 0;
      const starvation = a.energy < 0.12 ? (0.12 - a.energy) * 0.28 : 0;
      const bottleneckMortality = bottleneck < 1 ? (1 - bottleneck) * .022 : 0;
      const diseaseMortality = a.infected ? .004 : 0;
      if (this.random() < (baselineDeath + oldAge + starvation + bottleneckMortality + diseaseMortality) * days) {
        this._die(a, 'natural');
        continue;
      }
      a.health = clamp(a.energy * 1.6 + 0.14, 0, 1);
      if (a.species !== 'hare' && a.species !== 'fox') continue;
      const mature = a.age >= (a.species === 'hare' ? 3 : 9);
      const recovery = a.species === 'hare' ? 2.8 : 8;
      if (a.sex !== 'f' || !mature || a.energy < 0.58 ||
          this.time / SECONDS_PER_DAY - a.lastBirth < recovery ||
          this.agents.length + newborns.length >= MAX_ANIMALS) continue;
      // Density reduces births before the finite habitat fills completely.
      const capacity = this.factors.habitatLoss ? 78 : 126;
      const density = a.species === 'hare' ? clamp(1 - hares.length / capacity, 0, 1) : 1;
      const fertility = a.species === 'hare'
        ? 0.29 * food * density
        : 0.06 * clamp((hares.length / Math.max(1, foxes.length) - 5) / 5, 0, 1.6);
      if (this.random() >= fertility * days) continue;
      const peers = a.species === 'hare' ? hares : foxes;
      const mate = this._nearest(a, peers, 56, other => {
        if (other.sex !== 'm' || other.age < (a.species === 'hare' ? 3 : 9)) return false;
        // Mate choice is sexual selection: females prefer males with a slightly
        // higher speed trait, while still allowing low-trait males to reproduce.
        return !this.factors.mateChoice || other.trait >= a.trait * .92;
      });
      if (!mate) continue;
      const p = this._spawnPoint({ x: a.x, z: a.z, radius: 3.5 }, a.species);
      if (!p || !this._linePassable(a, p)) continue;
      let trait = (a.trait + mate.trait) / 2;
      const mutated = this.factors.mutation && this.random() < 0.3;
      if (mutated) trait += this.normal() * 0.09;
      const child = this._makeAnimal(a.species, p, trait);
      child.energy = 0.8;
      child.parentIds = [a.id, mate.id];
      child.generation = Math.max(a.generation, mate.generation) + 1;
      child.mutated = mutated;
      newborns.push(child);
      a.lastBirth = this.time / SECONDS_PER_DAY;
      a.energy = Math.max(0.12, a.energy - (a.species === 'hare' ? 0.08 : 0.13));
      this.events.births++;
      if (mutated) this.events.mutations++;
    }
    this.agents = this.agents.filter(a => !a._dead);
    this.agents.push(...newborns);
    if (this.time >= this._historyAt + 2 - 1e-7) {
      this._refreshStats();
      this._recordHistory();
    }
  }

  _nearest(a, candidates, range, predicate = () => true) {
    let nearest = null, nearestD2 = range * range;
    for (const b of candidates) {
      if (b === a || b._dead || !predicate(b) || !this._linePassable(a, b)) continue;
      const d2 = dist2(a, b);
      if (d2 < nearestD2) { nearest = b; nearestD2 = d2; }
    }
    return nearest;
  }

  _hare(a, foxes, dt, days) {
    const food = this.grass[a.x < 0 ? 'west' : 'east'];
    const threat = this._nearest(a, foxes, 19, fox => fox.state === 'hunting' || fox.state === 'stalking');
    const trait = this.factors.selection ? a.trait : 1;
    let heading = a._wander, speed = 0;
    if (threat) {
      a.state = 'fleeing';
      heading = Math.atan2(a.z - threat.z, a.x - threat.x);
      // A small weaving motion and obstacle avoidance make the chase spatial.
      heading += Math.sin(this.time * 1.8 + a.id) * 0.18;
      speed = 4.75 * trait;
      a.energy -= (0.13 + Math.max(0, trait - 1) * 0.1) * days;
    } else {
      const grazing = Math.sin(this.time * 0.14 + a.id * 2.1) > -0.28 || a.energy < 0.6;
      a.state = grazing ? 'grazing' : 'roaming';
      speed = grazing ? 0.22 : 1.45;
      const crowding = this.factors.competition ? Math.max(0, trait * .004 + food * .02) : 0;
      a.energy += (0.16 * food * (grazing ? 1 : 0.35) - 0.049 - crowding -
        (this.factors.selection ? Math.max(0, trait * trait - 1) * 0.05 : 0)) * days;
    }
    a.energy = clamp(a.energy, 0, 1);
    this._move(a, heading, speed, dt);
  }

  _fox(a, hares, dt, days) {
    const trait = this.factors.selection ? a.trait : 1;
    a.energy -= (0.074 + (this.factors.selection ? Math.max(0, trait * trait - 1) * 0.036 : 0)) * days;
    const canHunt = a.energy < 0.75 && a.cooldown <= 0;
    const prey = canHunt ? this._nearest(a, hares, 39) : null;
    let heading = a._wander, speed = 1.55;
    if (prey) {
      const d = Math.sqrt(dist2(a, prey));
      a.targetId = prey.id;
      a.state = d > 20 ? 'stalking' : 'hunting';
      heading = Math.atan2(prey.z - a.z, prey.x - a.x);
      speed = (d > 20 ? 3.45 : 5.9) * trait;
      a._huntTime += dt;
      a.energy -= 0.075 * days;
      if (d < 1.9) {
        this._die(prey, 'predation');
        a.energy = clamp(a.energy + 0.46, 0, 1);
        a.cooldown = 18 + this.random() * 12;
        a._huntTime = 0;
        a.targetId = null;
        a.state = 'resting';
        speed = 0;
      } else if (a._huntTime > 27) {
        a.cooldown = 5 + this.random() * 6;
        a._huntTime = 0;
        a.targetId = null;
      }
    } else {
      a.targetId = null;
      a._huntTime = 0;
      const rest = a.energy > 0.85 && Math.sin(this.time * 0.07 + a.id) > -0.35;
      a.state = rest ? 'resting' : 'roaming';
      speed = rest ? 0 : 1.55;
    }
    a.energy = clamp(a.energy, 0, 1);
    this._move(a, heading, speed, dt);
  }

  _bird(a, dt) {
    // Birds use a smooth wandering arc rather than the sharp ground turns used
    // by the mammals. Their slow altitude changes are rendered by the client.
    const wave = this.time * .42 + a._schoolPhase;
    const heading = a._wander + Math.sin(wave * .7) * .34;
    const speed = 1.15 + (Math.sin(wave) * .5 + .5) * 1.25;
    a.state = speed > 1.9 ? 'flying' : 'gliding';
    a.energy = clamp(a.energy + .012 * dt / SECONDS_PER_DAY - .018 * dt / SECONDS_PER_DAY, 0, 1);
    this._move(a, heading, speed, dt);
  }

  _fish(a, dt) {
    // Fish school around the pond centre and turn gently at the shore.
    const distance = Math.hypot(a.x - 40, a.z - 35);
    const inward = Math.atan2(35 - a.z, 40 - a.x);
    const wave = this.time * .31 + a._schoolPhase;
    const heading = distance > 12.8 ? inward : a._wander + Math.sin(wave) * .22;
    const speed = .52 + (Math.sin(wave * .83) * .5 + .5) * .58;
    a.state = 'swimming';
    a.energy = clamp(a.energy + .008 * dt / SECONDS_PER_DAY - .006 * dt / SECONDS_PER_DAY, 0, 1);
    this._move(a, heading, speed, dt);
  }

  _spreadDisease() {
    const infectious = this.agents.filter(a => !a._dead && a.infected);
    for (const a of this.agents) {
      if (a._dead || a.infected || a.immune || (a.species !== 'hare' && a.species !== 'fox')) continue;
      const carrier = infectious.find(b => b.species === a.species && dist2(a, b) < 36);
      const background = a.species === 'hare' ? .0009 : .00045;
      if (carrier && this.random() < .16 / SECONDS_PER_DAY) {
        a.infected = true; a.infectionAge = 0; this.events.infections++;
      } else if (this.random() < background) {
        a.infected = true; a.infectionAge = 0; this.events.infections++;
      }
    }
  }

  _move(a, desired, speed, dt) {
    const turnRate = a.state === 'fleeing' ? 8 : a.state === 'hunting' ? 5 : 2.5;
    a.heading += clamp(angleDelta(a.heading, desired), -turnRate * dt, turnRate * dt);
    let nx = a.x + Math.cos(a.heading) * speed * dt;
    let nz = a.z + Math.sin(a.heading) * speed * dt;
    if (this._blocked(nx, nz, a.species) || !this._linePassable(a, { x: nx, z: nz })) {
      // Try a tangent instead of bouncing directly through a road or pond.
      let moved = false;
      const direction = a.id % 2 ? 1 : -1;
      for (const turn of [0.75, -0.75, 1.5, -1.5, Math.PI]) {
        const h = a.heading + turn * direction;
        nx = a.x + Math.cos(h) * speed * dt;
        nz = a.z + Math.sin(h) * speed * dt;
        if (!this._blocked(nx, nz, a.species) && this._linePassable(a, { x: nx, z: nz })) {
          a.heading = h;
          a._wander = h;
          moved = true;
          break;
        }
      }
      if (!moved) { a.speed = 0; return; }
    }
    if (a.x * nx < 0) this.events.crossings++;
    a.x = nx;
    a.z = nz;
    a.speed = speed;
  }

  _die(a, reason) {
    if (a._dead) return;
    a._dead = true;
    a.state = 'dead';
    a.health = 0;
    if (reason === 'predation') this.events.predation++;
    else this.events.deaths++;
  }

  inspect(id) { return this.agents.find(a => a.id === Number(id)) ?? null; }

  _refreshStats() {
    const hares = this.agents.filter(a => a.species === 'hare' && !a._dead);
    const foxes = this.agents.filter(a => a.species === 'fox' && !a._dead);
    const birds = this.agents.filter(a => a.species === 'bird' && !a._dead);
    const fish = this.agents.filter(a => a.species === 'fish' && !a._dead);
    const avg = list => list.length ? list.reduce((n, a) => n + a.trait, 0) / list.length : null;
    const west = hares.filter(a => a.x < 0), east = hares.filter(a => a.x >= 0);
    this.stats = {
      hareCount: hares.length, foxCount: foxes.length, birdCount: birds.length, fishCount: fish.length,
      grass: (this.grass.west + this.grass.east) / 2,
      westGrass: this.grass.west, eastGrass: this.grass.east,
      meanTrait: avg(hares), westTrait: avg(west), eastTrait: avg(east),
      foxTrait: avg(foxes), westCount: west.length, eastCount: east.length,
      time: this.time, day: this.time / SECONDS_PER_DAY,
      dayNumber: Math.floor(this.time / SECONDS_PER_DAY) + 1,
      extinction: [!hares.length && 'Feldhase', !foxes.length && 'Rotfuchs'].filter(Boolean),
      births: this.events.births, predation: this.events.predation,
      deaths: this.events.deaths, crossings: this.events.crossings,
      mutations: this.events.mutations, infections: this.events.infections,
      infected: this.agents.filter(a => a.infected && !a._dead).length,
      temperature: this.environment.temperature, rainfall: this.environment.rainfall,
      bottleneck: this.environment.bottleneck,
    };
  }

  _recordHistory() {
    this._historyAt = this.time;
    const s = this.stats;
    this.history.push({
      time: s.time, day: s.day, hareCount: s.hareCount, foxCount: s.foxCount,
      birdCount: s.birdCount, fishCount: s.fishCount,
      grass: s.grass, meanTrait: s.meanTrait, westTrait: s.westTrait, eastTrait: s.eastTrait,
      rainfall: s.rainfall, temperature: s.temperature, infected: s.infected,
    });
    if (this.history.length > 900) this.history.shift();
  }
}

export default Ecosystem;
