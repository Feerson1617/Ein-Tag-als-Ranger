import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../dist/simulation.js', import.meta.url), 'utf8');
const { Ecosystem, MAX_ANIMALS } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const advance = (sim, seconds) => { for (let t = 0; t < seconds; t += 15) sim.update(Math.min(15, seconds - t)); };

const initial = new Ecosystem(84721);
assert.equal(initial.stats.hareCount, 40);
assert.equal(initial.stats.foxCount, 7);
const duplicate = new Ecosystem(84721);
advance(initial, 90); advance(duplicate, 90);
assert.deepEqual(initial.agents, duplicate.agents, 'Same seed and elapsed time must reproduce the same simulation');
assert.deepEqual(initial.stats, duplicate.stats);

const road = new Ecosystem(12);
road.setFactor('road', true);
const sides = new Map(road.agents.map(a => [a.id, Math.sign(a.x)]));
advance(road, 300);
assert.equal(road.events.crossings, 0, 'An uninterrupted road blocks animal migration');
for (const a of road.agents) {
  if (sides.has(a.id)) assert.equal(Math.sign(a.x), sides.get(a.id));
  assert.ok(Math.abs(a.x) >= 4.5, 'No animal occupies a closed road');
}

const corridor = new Ecosystem(99);
corridor.agents = [];
corridor.add('hare', 1, { x: -4.6, z: 0, radius: 0 });
corridor.setFactor('road', true);
corridor.setFactor('corridor', true);
const walker = corridor.agents[0];
walker.heading = 0; walker._wander = 0; walker._turnIn = 100;
advance(corridor, 40);
assert.ok(corridor.events.crossings > 0, 'An open corridor permits migration');
walker.x = 0; walker.z = 30;
corridor.setFactor('corridor', false);
assert.ok(Math.abs(walker.x) >= 4.5, 'Closing a corridor relocates a stranded animal');

// The selection switch makes inherited speed consequential, with an energy cost.
function traitTrial(selection) {
  const sim = new Ecosystem(173);
  sim.agents = [];
  const [fast, slow] = sim.add('hare', 2, { x: -40, z: 0, radius: 0 });
  const [hunter] = sim.add('fox', 1, { x: -30, z: 0, radius: 0 });
  fast.trait = 1.35; slow.trait = 0.7;
  fast.energy = slow.energy = 0.9;
  fast.sex = slow.sex = 'm';
  hunter.state = 'hunting'; hunter.energy = 0.3; hunter.cooldown = 0;
  sim.setFactor('selection', selection);
  sim.update(0.2);
  return { fast, slow };
}
const neutralTraits = traitTrial(false);
assert.equal(neutralTraits.fast.speed, neutralTraits.slow.speed, 'Neutral trait differences must not affect running speed');
assert.equal(neutralTraits.fast.energy, neutralTraits.slow.energy);
const selectedTraits = traitTrial(true);
assert.ok(selectedTraits.fast.speed > selectedTraits.slow.speed, 'Selection makes faster genotypes run faster');
assert.ok(selectedTraits.fast.energy < selectedTraits.slow.energy, 'Faster running has a higher energy cost');

const trials = [];
for (const seed of [1, 2, 3, 47, 84721]) {
  const sim = new Ecosystem(seed);
  advance(sim, 600);
  assert.ok(sim.stats.hareCount > 0 && sim.stats.foxCount > 0, `Both species should survive a ten-minute baseline (seed ${seed})`);
  assert.ok(sim.agents.length <= MAX_ANIMALS);
  assert.ok(sim.stats.grass >= 0 && sim.stats.grass <= 1);
  assert.ok(sim.events.births > 0 && sim.events.predation > 0, 'Births and hunts should actually occur');
  assert.ok(sim.history.length > 100 && sim.history.length <= 900);
  for (const a of sim.agents) {
    assert.ok(Number.isFinite(a.x) && Number.isFinite(a.z) && Number.isFinite(a.energy));
    const pondDistance = Math.hypot(a.x - 40, a.z - 35);
    if (a.species === 'fish') assert.ok(pondDistance <= 17.2, 'Fish remain in the pond');
    else assert.ok(pondDistance >= 19, 'Land animals avoid the pond');
  }
  trials.push({ seed, hares: sim.stats.hareCount, foxes: sim.stats.foxCount, grass: Number(sim.stats.grass.toFixed(3)), births: sim.events.births, hunts: sim.events.predation });
}

const evolving = new Ecosystem(42);
evolving.setFactor('mutation', true);
evolving.setFactor('selection', true);
advance(evolving, 600);
assert.ok(evolving.events.mutations > 0, 'Mutation applies to inherited traits in new offspring');
const children = evolving.agents.filter(a => a.generation > 0);
assert.ok(children.length > 0 && children.every(a => a.parentIds.length === 2));
evolving.add('hare', 10000);
assert.equal(evolving.agents.length, MAX_ANIMALS);
console.log(JSON.stringify({ result: 'PASS', trials, mutationBirths: evolving.events.mutations, maximumAnimals: evolving.agents.length }, null, 2));
