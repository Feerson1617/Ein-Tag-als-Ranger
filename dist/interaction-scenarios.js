import { ANIMALS, PLANTS, HABITATS } from './biodiversity.js?revision=120';
import { INTERACTION_CASES } from './quest-cases.js?revision=120';
import { INTERACTION_TERMS } from './quests.js?revision=120';
import { CENTERS } from './habitat-world.js?revision=120';
import { TRAIL_ENTRIES, trailPoint } from './trail.js?revision=120';
import { plantIdentity, samePlant } from './plant-identity.js';

const parasiteCases=[
 ...['forest','meadow','city','farmland'].map(habitat=>({habitat,species:['ixodes_ricinus','capreolus_capreolus']})),
 {habitat:'lake',species:['argulus_foliaceus','rutilus_rutilus']},
 ...['beach','wadden','saltmarsh'].map(habitat=>({habitat,species:['lepeophtheirus_pectoralis','pleuronectes_platessa']}))
];
const names=ids=>ids.map(id=>(ANIMALS[id]||PLANTS[id]).common).join(' ↔ ');
export const SCENARIOS=['predation','competition','parasitism','mutualism','herbivory','dispersal'].map(kind=>{
 const term=INTERACTION_TERMS[kind],cases=kind==='parasitism'?parasiteCases:INTERACTION_CASES[kind];
 return {id:kind,...term,quests:cases.map((c,i)=>({
  ...term,id:`scenario:${kind}:${c.habitat}:${i}`,scenario:kind,category:'scenario',kind,habitat:c.habitat,species:c.species,
  title:names(c.species),question:'Wie verhalten sich die beiden Partner bei dieser Beziehung?',
  goal:'Fokussiere beide Partner mit Fernglas beziehungsweise Lupe. Sieh sie anschließend gemeinsam im Bildausschnitt.',
  concept:`${term.title} · ${term.effect}`,source:ANIMALS[c.species[0]].source||'https://openstax.org/books/biology-2e/pages/45-6-community-ecology',
  encounters:[{...c,id:`${c.habitat}:${c.species.join(':')}`}]
 }))};
});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);

// Stable, initially dormant individuals are registered before the instanced renderer.
// Choosing another mode changes presentation, never replaces a natural individual.
export class InteractionScenarios {
 constructor(simulations){this.simulations=simulations;this.current=null;this.groups=new Map();this.pool=[];this.clock=0;
  for(const scenario of SCENARIOS)for(const quest of scenario.quests){const sim=simulations.get(quest.habitat),groups=[];
   for(let n=0;n<4;n++){
    const actors=quest.species.filter(id=>ANIMALS[id]).map((id,i)=>{const a=sim.spawn(id,sim.agents.length,n);Object.assign(a,{scenarioReserve:true,scenarioId:scenario.id,scenarioGroup:`${quest.id}:${n}`,scenarioInactive:true,dormant:true,alive:false});this.pool.push(a);return a;});
    const entry=TRAIL_ENTRIES[quest.habitat],center=CENTERS[quest.habitat],trail=trailPoint(entry.distance+12+n*6),origin={x:trail.x-center.x+trail.tz*2,z:trail.z-center.z-trail.tx*2};
    const plant=quest.species.find(id=>PLANTS[id]);let patch=null;
    if(plant){const options=sim.patches.filter(p=>p.species===plant).sort((p,q)=>distance(p,origin)-distance(q,origin));patch=options[Math.min(n*2,options.length-1)];}
    else if(scenario.id==='competition')patch=(quest.habitat==='lake'?sim.patches.filter(p=>p.aquatic):sim.relations.resourcePatches(actors[0],ANIMALS[actors[0].species],'feeding')).sort((p,q)=>distance(p,origin)-distance(q,origin))[n];
    let anchor=patch||(['parasitism','predation'].includes(scenario.id)&&ANIMALS[actors.at(-1).species].type==='fish'?actors.at(-1):origin);
    const coastal=['beach','wadden','saltmarsh'].includes(quest.habitat),fish=actors.find(a=>ANIMALS[a.species].type==='fish');
    if(coastal&&!fish&&scenario.id==='predation'){const prey=ANIMALS[actors.at(-1).species],locations=[];for(let k=0;k<180;k++){const p=sim.zonePoint(prey,k,n+1),y=sim.terrain(p.x,p.z);if(y<.12&&y>-.7&&actors.every(a=>sim.passable(p.x,p.z,ANIMALS[a.species],a)))locations.push(p);}anchor=locations.sort((p,q)=>distance(p,origin)-distance(q,origin))[n%Math.max(1,locations.length)]||anchor;}
    if(coastal&&fish){for(let k=0;k<160;k++){if(sim.terrain(anchor.x,anchor.z)<-1.08)break;anchor=sim.zonePoint(ANIMALS[fish.species],k,n+1);}fish.scenarioAquatic=true;}
    // Find a shared, physically accessible encounter location, without moving plants.
    for(let attempt=0;attempt<180;attempt++){
     const radius=patch?Math.min(4,.25+attempt*.06):1+Math.floor(attempt/24)*1.5,angle=attempt*2.4+n*1.7;
     const p={x:anchor.x+Math.cos(angle)*radius,z:anchor.z+Math.sin(angle)*radius};
     if((!coastal||!fish||sim.terrain(p.x,p.z)<-1.08)&&(!coastal||fish||scenario.id!=='predation'||sim.terrain(p.x,p.z)<.14&&sim.terrain(p.x,p.z)>-.7)&&actors.every(a=>ANIMALS[a.species].parasite||sim.passable(p.x,p.z,ANIMALS[a.species],a))&&(!(quest.habitat==='city'&&scenario.id==='predation'&&actors.some(a=>ANIMALS[a.species].type==='mammal'))||Array.from({length:12},(_,k)=>({x:p.x+Math.cos(k*Math.PI/6)*2.8,z:p.z+Math.sin(k*Math.PI/6)*2.8})).every(q=>actors.every(a=>sim.passable(q.x,q.z,ANIMALS[a.species],{...a,x:p.x,z:p.z,alive:true}))))){
      for(const [i,a]of actors.entries()){const s=ANIMALS[a.species];let placement=p;if(s.type==='bird')for(let k=0;k<80;k++){const angle=a.id*2.399+k*2.399,r=this.simulations.get(quest.habitat).birdRadius(s,a)+Math.floor(k/8)*.25,q={x:p.x+Math.cos(angle)*r,z:p.z+Math.sin(angle)*r};const occupied=sim.agents.some(b=>b!==a&&b.scenarioId===scenario.id&&ANIMALS[b.species].type==='bird'&&distance(b,q)<sim.birdRadius(s,a)+sim.birdRadius(ANIMALS[b.species],b));if(!occupied&&sim.passable(q.x,q.z,s,a)){placement=q;break;}}a.x=placement.x;a.z=placement.z;a.homeX=a.x;a.homeZ=a.z;a.offsetX=center.x;a.offsetZ=center.z;a.renderX=a.x+center.x;a.renderZ=a.z+center.z;a.stateTime=0;a.heading=angle+i;}
      break;
     }
    }
    if(scenario.id==='predation'){const [a,b]=actors;for(let k=0;k<24;k++){const p={x:a.x+Math.cos(k*2.4)*3,z:a.z+Math.sin(k*2.4)*3};if(sim.passable(p.x,p.z,ANIMALS[b.species],b)&&sim.passable(p.x,p.z,ANIMALS[a.species],{...a,alive:true})&&(!coastal||fish||sim.terrain(p.x,p.z)<.14&&sim.terrain(p.x,p.z)>-.7)){Object.assign(b,p,{homeX:p.x,homeZ:p.z});break;}}}
    groups.push({actors,patch,quest,number:n});
   }this.groups.set(quest.id,groups);
  }
 }
 start(id,book){book.cancel?.();book.active=null;this.stop();if(!id){book.scenario=null;for(const sim of this.simulations.values())sim.settleBirdStarts();return null;}const scenario=SCENARIOS.find(s=>s.id===id);if(!scenario)throw Error('Unknown scenario');this.current=scenario;book.scenario=this;
  for(const sim of this.simulations.values()){const natural=sim.agents.filter(a=>!a.scenarioReserve&&!a.geneticAgent&&!a.surveySpecimen);const background=new Set([...new Set(natural.map(a=>a.species))].filter((_,i)=>i%6===0));
   for(const a of natural)a.scenarioSuppressed=!background.has(a.species)||scenario.quests.some(q=>q.habitat===sim.habitat&&q.species.includes(a.species));
  }
  for(const quest of scenario.quests){const sim=this.simulations.get(quest.habitat),groups=this.groups.get(quest.id);for(const group of groups){
   for(const a of group.actors){a.scenarioInactive=false;a.scenarioSuppressed=false;sim.activate(a);a.educationHunt=quest.kind==='predation';}
   const context=sim.relations.arm(quest.kind,quest.species,group.actors,group.patch);if(!context)throw Error(`Encounter unavailable: ${quest.id}`);
   Object.assign(group,{...context,actorIds:context.actors,actors:group.actors,started:sim.time,seconds:0,evidence:null,focusedPartners:new Set()});sim.encounters.arm(group);
  }}
  for(const sim of this.simulations.values())sim.settleBirdStarts();
  return scenario;
 }
 stop(){for(const sim of this.simulations.values()){sim.encounters.clear();sim.relations.clearIntent();for(const a of sim.agents){a.scenarioSuppressed=false;if(a.scenarioReserve){a.scenarioInactive=true;a.dormant=true;a.alive=false;a.attachedHost=null;}}}this.current=null;}
 contexts(q){return this.groups.get(q.id).map(g=>({...q.encounters[0],actors:g.actorIds,actor:g.actor,patch:g.patch,started:g.started,seconds:0,done:false,unavailable:false,group:g}));}
 markers(questId=null){if(!this.current||!questId)return[];return this.current.quests.filter(q=>q.id===questId).flatMap(q=>this.groups.get(q.id).flatMap(g=>{const p=g.plan?.patch||g.patch;return[...g.actors.filter(a=>a.alive&&!a.dead&&!a.scenarioInactive&&!a.scenarioSuppressed&&q.species.includes(a.species)),...(p&&PLANTS[p.species]&&q.species.includes(p.species)?[{...p,habitat:q.habitat,focusType:'plant'}]:[])];}));}
 update(dt){if(this.current)this.clock+=dt;}
 partnersOf(g){const animals=g.actors.filter(a=>a.alive&&!a.dead);const plant=g.quest.species.find(id=>PLANTS[id]),patch=g.plan?.patch||g.patch;return plant&&patch?[...animals,{...patch,habitat:g.quest.habitat,focusType:'plant'}]:animals;}
 observationProgress(q){let best={focused:0,total:q.species.length,together:false};for(const g of this.groups.get(q.id)||[]){const patch=g.plan?.patch||g.patch;const count=g.actors.filter(a=>g.focusedPartners?.has(`animal:${a.id}`)).length+(patch&&q.species.includes(patch.species)&&g.focusedPartners?.has(plantIdentity(patch))?1:0);if(count>best.focused)best={focused:count,total:q.species.length,together:g.together};}return best;}
 observe(focus,dt,journal,book,visible=null){if(!this.current||dt<=0||!visible)return null;let result=null;
  for(const q of this.current.quests){for(const g of this.groups.get(q.id)){
   g.focusedPartners||=new Set();
   if(focus?.type==='animal'&&!focus.item.trace&&g.actors.includes(focus.item)&&focus.item.alive&&visible(focus.item))g.focusedPartners.add(`animal:${focus.item.id}`);
   const patch=g.plan?.patch||g.patch,plantPartner=this.partnersOf(g).find(p=>p.focusType==='plant');
   if(focus?.type==='plant'&&focus.item.habitat===q.habitat&&q.species.includes(focus.item.id)&&samePlant(focus.item,patch)&&plantPartner&&visible(plantPartner))g.focusedPartners.add(plantIdentity(patch));
   const partners=this.partnersOf(g);g.together=partners.length===q.species.length&&partners.every(p=>visible(p));
   const focusedAll=g.actors.every(a=>g.focusedPartners.has(`animal:${a.id}`))&&q.species.filter(id=>PLANTS[id]).every(()=>patch&&g.focusedPartners.has(plantIdentity(patch)));
   if(!book.progress(q)&&focusedAll&&g.together){
    const evidence={kind:'pairSighting',actors:[...g.actorIds],plantId:patch?plantIdentity(patch):null,species:[...q.species],sameFrame:true,time:this.simulations.get(q.habitat).time,phase:g.plan?.phase};
    book.completed[q.id]={...book.completed[q.id],completedAt:Date.now(),encounters:{[q.encounters[0].id]:{completedAt:Date.now(),habitat:q.habitat,evidence,focusedPartners:[...g.focusedPartners]}}};book.save();
    result={kind:'quest',quest:q,habitat:q.habitat,allDone:true,stage:'discovered'};
   }
   const investigation=this.observeRelationship(q,g,focus,dt,book,visible);if(investigation)result=investigation;
  }}return result;
 }
 observeRelationship(q,g,focus,dt,book,visible){
  if(book.active?.quest.id!==q.id||!book.progress(q)||book.investigationProgress(q))return null;
  const actor=focus?.type==='animal'&&g.actors.includes(focus.item)?focus.item:null;
  if(!actor?.alive||actor.trace||!visible(actor)||!g.together){g.observationKey=null;g.investigationSeconds=0;return null;}
  const sim=this.simulations.get(q.habitat);
  if(g.observationKey!==actor.id){g.observationKey=actor.id;g.observationStarted=sim.time;g.investigationSeconds=0;}
  const evidence=book.validEncounter(actor,{actors:g.actorIds,started:g.started,patch:g.plan?.patch||g.patch},q);
  // A pre-existing report can be read as a protocol; it is not a witnessed event.
  if(!evidence||evidence.kind!=='pursuit'&&evidence.time<g.observationStarted){g.investigationSeconds=0;return null;}
  g.investigationSeconds=(g.investigationSeconds||0)+dt;book.active.seconds=g.investigationSeconds;
  if(g.investigationSeconds<6)return null;
  const patch=g.plan?.patch||g.patch;
  book.completed[q.id].investigations={...book.completed[q.id].investigations,[q.encounters[0].id]:{completedAt:Date.now(),habitat:q.habitat,actors:[...g.actorIds],plantId:patch?plantIdentity(patch):null,evidence:{...evidence},source:'own-observation',interpretation:null}};
  book.active.done=true;book.save();
  return {kind:'quest',quest:q,habitat:q.habitat,allDone:true,stage:'documented'};
 }
 progress(book){return {done:this.current.quests.filter(q=>book.progress(q)>0).length,total:this.current.quests.length};}
}
