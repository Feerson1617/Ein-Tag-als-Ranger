import assert from 'node:assert/strict';
import { Ecosystem } from '../dist/simulation.js';

const sim = new Ecosystem(55);
for (const factor of Object.keys(sim.factors)) sim.setFactor(factor, true);
for (let i = 0; i < 1200; i++) sim.update(.5);

assert.ok(sim.stats.hareCount > 0 && sim.stats.foxCount > 0, 'all-factor trial keeps both species alive');
assert.ok(sim.stats.infections > 0 && sim.stats.infected >= 0, 'disease factor creates infections');
assert.ok(sim.stats.mutations > 0, 'mutation factor creates inherited variants');
assert.ok(sim.stats.crossings > 0, 'corridor or gene flow permits crossings');
assert.ok(sim.stats.temperature !== .5 && sim.stats.rainfall !== 1, 'climate changes weather variables');
for (const a of sim.agents) {
  assert.ok(Number.isFinite(a.trait) && Number.isFinite(a.energy));
  assert.ok(a.x >= -110 && a.x <= 110 && a.z >= -110 && a.z <= 110);
  const pondDistance = Math.hypot(a.x - 40, a.z - 35);
  if (a.species === 'fish') assert.ok(pondDistance <= 17.2);
  else assert.ok(pondDistance >= 19);
}
console.log(JSON.stringify({result:'PASS', factors:Object.keys(sim.factors), stats:sim.stats, events:sim.events}, null, 2));
