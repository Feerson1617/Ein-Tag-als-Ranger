import assert from 'node:assert/strict';
import { ExpeditionEcology } from '../dist/field-ecology.js';
import { FieldEvolution, EVOLUTION_FACTORS } from '../dist/field-evolution.js';
const result=[];
for(const factor of Object.keys(EVOLUTION_FACTORS)) {
 const sim=new ExpeditionEcology('farmland',719+600),model=new FieldEvolution(sim);
 sim.patches=Array.from({length:100},(_,i)=>({x:-60+i%10*12,z:-60+Math.floor(i/10)*12,low:true,flower:true,size:.6,species:'trifolium_pratense'}));
 model.start(factor);
 for(let i=0;i<3000;i++){model.update(.1);sim.update(.1,null);}
 const kinds=[...new Set(model.events.map(e=>e.kind))];
 assert.ok(model.evidence(factor),`${factor}: active full-habitat experiment lacks evidence (${kinds})`);
 result.push({factor,generation:model.generation,kinds,alive:model.snapshot().n});
}
console.log(JSON.stringify({fullHabitatEvolution:result},null,2));
