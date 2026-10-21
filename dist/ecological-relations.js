import { pollinatorCanFeed } from './plant-resources.js';
import { ANIMALS } from './biodiversity.js?revision=120';
const d=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const feeding=new Set(['feeding','grazing','pollinating','collecting','deposit','filtering']);

// Resource visits have an actual place, a finite stock and an identifiable partner.
export class EcologicalRelations {
 constructor(sim){this.sim=sim;this.patchesRef=null;this.seedCaches=[];this.lastCompetition=new Map();this.regrowing=new Set();}
 sync(){if(this.patchesRef===this.sim.patches)return;this.patchesRef=this.sim.patches;this.regrowing.clear();this.sim.patches.forEach((p,i)=>{p.uid||=`${p.species}:${i}`;p.stock??=1;p.pollenTransfers??=0;p.seedPotential??=0;if(p.stock<1)this.regrowing.add(p);});}
 resourcePatches(a,s,activity) {
  this.sync();return this.sim.patches.filter(p=>{
   if(activity==='pollinating')return p.flower&&pollinatorCanFeed(p,s)&&(!a.questPlant||p.species===a.questPlant)&&(!a.pollen||p.species===a.pollen.species);
   if(activity==='collecting')return ['quercus_robur','quercus_petraea','corylus_avellana','fagus_sylvatica'].includes(p.species)&&(!a.questPlant||p.species===a.questPlant);
   if(['perching','drumming'].includes(activity))return p.tree;
   if(activity==='deposit')return p.detritus;
   if(p.resource)return p.resource===s.resource;
   if(s.resource==='leaves')return p.low||p.aquatic||p.species==='corylus_avellana';
   if(s.resource==='insects'&&s.zone==='canopy')return p.tree;
   if(s.resource==='seeds')return p.low||p.tree;
   if(['worms','mussels','fish','plankton','algae','detritus'].includes(s.resource))return false;
   return p.low;
  });
 }
 choose(a,s) {
  if(a.carriedSeed){a.activity='dispersal';const angle=a.phase+this.sim.time*.11;
   for(let k=0;k<12;k++){const p={x:a.carriedSeed.x+Math.cos(angle+k)*6,z:a.carriedSeed.z+Math.sin(angle+k)*6};if(this.sim.passable(p.x,p.z,s)){a.targetResource={...p,species:a.carriedSeed.species,uid:`cache-${a.id}-${this.sim.time}`};return this.travel(a,s,'caching',p);}}}
  if(a.questIntent==='mutualism')a.activity='pollinating';
  if(a.questIntent==='competition'){a.activity=s.resource==='leaves'?'grazing':'feeding';a.pendingActivity=null;}
  if(a.questIntent==='dispersal'||s.id==='garrulus_glandarius'&&Math.floor(this.sim.time/18+a.phase)%3===1)a.activity='collecting';
  let activity=a.pendingActivity||a.activity;
  a.pendingActivity=null;
  if(['hunting','fleeing','swimming','waiting','resting','preening','filtering'].includes(activity))return false;
  const patches=this.resourcePatches(a,s,activity).filter(p=>p.stock>.08);
  let ordered=patches.sort((b,c)=>d(a,b)-d(a,c));
  if(activity==='pollinating'&&a.lastPatch)ordered=ordered.filter(p=>p.uid!==a.lastPatch.uid);
  const p=a.questPatch&&['competition','herbivory'].includes(a.questIntent)?a.questPatch:ordered[0];
  if(!p)return false;
  if(activity==='foraging')activity='feeding';
  a.targetResource=p;a.visitTime=0;a.visitEmitted=false;
  this.travel(a,s,activity,p);return true;
 }
 reach(a,s,p){if(!p?.tree)return s.type==='bird'?Math.max(.8,s.size*.75):.7;const trunk=this.sim.blockers?.find(b=>b.type==='tree'&&Math.hypot(b.x-p.x,b.z-p.z)<.2);return s.type==='bird'?Math.max(1.3,p.size*.20):Math.max(.7,(trunk?.r||.45)+this.sim.bodyRadius(s,a)+.16);}
 travel(a,s,activity,p) {
  a.visitTime=0;a.visitEmitted=false;let destination=s.type==='bird'?this.sim.birdDestination(a,s,p,p.tree&&['feeding','perching','collecting'].includes(activity)?Math.min(4,p.size*.4):0):p;
  if(!this.sim.passable(destination.x,destination.z,s,a)){const reach=this.reach(a,s,p);let best=null;for(let k=0;k<32;k++){const angle=k*Math.PI/16,q={...p,x:p.x+Math.cos(angle)*(reach-.07),z:p.z+Math.sin(angle)*(reach-.07)};if(this.sim.passable(q.x,q.z,s,a)&&(!best||d(a,q)<d(a,best)))best=q;}if(best)destination=best;}
  a.target=destination;a.stateTime=60;a.feedingHeight=s.type==='bird'?destination.supportHeight||0:0;if(['perching','resting'].includes(activity)&&s.type==='bird')a.perchHeight=destination.supportHeight||0;
  if(d(a,destination)>.35){a.pendingActivity=activity;a.activity=['bird','insect'].includes(s.type)?'flying':'walking';}
  else{a.activity=activity;a.pendingActivity=null;a.stateTime=14;}
  return true;
 }
 tick(dt) {
  this.sync();for(const p of this.regrowing){p.stock=Math.min(1,p.stock+dt*.005*(this.sim.factors.habitatLoss?.35:1));if(p.stock>=1)this.regrowing.delete(p);}
  for(const a of this.sim.agents) {
   if(!a.alive||a.geneticAgent||a.hiveWorker||a.refugePlan||a.scenarioInactive||a.scenarioSuppressed)continue;
   if(a.encounterPlan&&!a.attachedHost)continue;
   if(a.attachedHost){const host=a.attachedHost;if(!host.alive)continue;const size=ANIMALS[host.species].size;a.x=host.x+Math.cos(host.heading)*size*.12-Math.sin(host.heading)*size*.07;a.z=host.z+Math.sin(host.heading)*size*.12+Math.cos(host.heading)*size*.07;a.heading=host.heading;a.activity='parasitism';a.parasiteIntake=(a.parasiteIntake||0)+dt*.0008;host.parasiteCost=(host.parasiteCost||0)+dt*.0008;a.energy=Math.min(1,a.energy+dt*.0008);host.energy=Math.max(.15,host.energy-dt*.0008);if(this.sim.time-(a.lastParasiteEvent??-100)>2){a.lastParasiteEvent=this.sim.time;this.sim.emit(a,'parasitism',host);this.sim.emit(host,'parasitism',a);}continue;}
   const s=ANIMALS[a.species],p=a.targetResource;
   if(a.activity==='caching'&&p&&d(a,p)<.5&&a.carriedSeed){
    a.visitTime=(a.visitTime||0)+dt;
    if(a.visitTime>2&&!a.visitEmitted){a.visitEmitted=true;const seed={...p,actor:a.id,time:this.sim.time,viable:this.sim.random()<.65};this.seedCaches.push(seed);this.sim.emit(a,'dispersal',{...p,id:p.uid});a.carriedSeed=null;a.stateTime=5;}
    continue;
   }
   if(!feeding.has(a.activity)||!p||(s.type==='bird'&&a.target?.uid===p.uid?d(a,a.target)>.7:d(a,p)>this.reach(a,s,p))){a.visitTime=0;continue;}
   a.visitTime=(a.visitTime||0)+dt;this.regrowing.add(p);p.stock=Math.max(0,p.stock-dt*(s.size>.5?.045:.007));
   if(a.visitTime>3&&!a.visitEmitted){
    a.visitEmitted=true;a.energy=Math.min(1,a.energy+.035*Math.max(.1,p.stock));
    if(a.activity==='pollinating'){
     const carried=a.pollen;
     if(carried&&carried.species===p.species&&carried.uid!==p.uid){p.pollenTransfers++;p.seedPotential++;this.sim.emit(a,'mutualism',{...p,id:p.uid});}
     else this.sim.emit(a,'flowerVisit',{...p,id:p.uid});
     a.pollen={species:p.species,uid:p.uid};a.lastPatch=p;
    }else if(a.activity==='collecting'){
     a.carriedSeed={species:p.species,x:p.x,z:p.z,sourceId:p.uid};this.sim.emit(a,'seedCollection',{...p,id:p.uid});a.stateTime=5;
    }else this.sim.emit(a,a.activity==='grazing'?'herbivory':a.activity,{...p,id:p.uid});
   }
   if(['feeding','grazing','pollinating'].includes(a.activity)) {
    const rival=this.sim.agents.find(b=>b.alive&&!b.scenarioSuppressed&&!b.scenarioInactive&&b!==a&&(!a.scenarioGroup||a.scenarioGroup===b.scenarioGroup)&&b.targetResource?.uid===p.uid&&feeding.has(b.activity)&&(ANIMALS[b.species].resource===s.resource||a.questResource&&a.questResource===b.questResource)&&d(a,b)<Math.max(1.25,(s.size+ANIMALS[b.species].size)*.6));
    const key=rival&&[a.id,rival.id].sort((x,y)=>x-y).join(':');
    if(rival&&this.sim.time-(this.lastCompetition.get(key)??-100)>24&&(this.sim.factors.competition||p.stock<.82||a.questIntent==='competition')){
     this.lastCompetition.set(key,this.sim.time);a.activity=rival.activity='competition';a.rival=rival.id;rival.rival=a.id;a.stateTime=rival.stateTime=11;
     const loser=a.energy<rival.energy?a:rival;loser.energy=Math.max(.1,loser.energy-.045);p.stock=Math.max(0,p.stock-.04);
     this.sim.emit(a,'competition',rival);this.sim.emit(rival,'competition',a);
    }
   }
  }
 }
 arm(kind,preferred=[],selected=null,selectedPatch=null) {
  this.sync();const sim=this.sim;if(selected)selected.forEach(a=>sim.activate(a));else sim.activateSpecies(preferred);const live=(selected||sim.agents).filter(a=>(a.alive||a.surveySpecimen&&a.sampleSpot)&&!a.geneticAgent&&!a.scenarioInactive&&!a.scenarioSuppressed);
  if(kind==='parasitism'){const a=live.find(a=>a.species===preferred[0]),host=live.find(a=>a.species===preferred[1]);if(!a||!host||!ANIMALS[a.species].hosts?.includes(host.species))return null;a.attachedHost=host;a.questIntent='parasitism';a.activity='parasitism';a.target=host;return{actors:[a.id,host.id],actor:a.id};}
  if(kind==='predation'){
   let best=null;for(const a of live.filter(a=>ANIMALS[a.species].prey.length&&(!preferred[0]||a.species===preferred[0])))for(const b of live.filter(b=>ANIMALS[a.species].prey.includes(b.species)&&(!preferred[1]||b.species===preferred[1])))if(!best||d(a,b)<best.distance)best={a,b,distance:d(a,b)};
   if(!best)return null;best.a.activity='hunting';best.a.stateTime=90;best.a.target=best.b;best.a.questIntent='predation';best.a.questPrey=best.b.species;return{actors:[best.a.id,best.b.id],actor:best.a.id};
  }
  if(kind==='competition'){
   const a=live.find(a=>a.species===preferred[0]);if(!a)return null;
   const b=live.filter(b=>b.species===preferred[1]).sort((b,c)=>d(a,b)-d(a,c))[0];if(!b)return null;
   const p=selectedPatch||this.resourcePatches(a,ANIMALS[a.species],'grazing').sort((p,q)=>d(a,p)+d(b,p)-d(a,q)-d(b,q))[0];if(!p)return null;p.stock=.6;this.regrowing.add(p);
   for(const animal of [a,b]){animal.questIntent='competition';animal.questResource=p.resource||(p.aquatic?'aquaticPlants':ANIMALS[a.species].resource);animal.questPatch=p;animal.targetResource=p;this.travel(animal,ANIMALS[animal.species],ANIMALS[animal.species].resource==='leaves'?'grazing':'feeding',p);}
   return{actors:[a.id,b.id],actor:a.id,plant:p.species,patch:p};
  }
  const a=live.find(a=>!preferred[0]||a.species===preferred[0]);if(!a)return null;
  a.questIntent=kind;a.questPlant=preferred[1]||null;if(a.hiveWorker){a.pollen=null;a.beeStage=null;a.lastFlower=null;}
  if(a.surveySpecimen&&!a.revealed)return{actors:[a.id],actor:a.id,buried:true};
  if(kind==='resourceUse'){
   const s=ANIMALS[a.species];if(s.prey.length){sim.activateSpecies(s.prey);const prey=sim.agents.filter(p=>p.alive&&s.prey.includes(p.species)&&!p.geneticAgent).sort((b,c)=>d(a,b)-d(a,c))[0];a.questIntent='predation';a.questPrey=prey?.species||null;a.target=prey||null;a.activity='hunting';a.stateTime=90;return{actors:prey?[a.id,prey.id]:[a.id],actor:a.id};}
   if(s.type==='shell'&&s.resource==='plankton'){a.stateTime=0;return{actors:[a.id],actor:a.id};}
   a.activity=s.resource==='leaves'?'grazing':s.resource==='detritus'?'deposit':'feeding';
   const p=this.resourcePatches(a,s,a.activity).sort((b,c)=>d(a,b)-d(a,c))[0];if(!p)return null;a.targetResource=p;this.travel(a,s,a.activity,p);return{actors:[a.id],actor:a.id,patch:p};
  }
  if(kind==='filtering'){a.stateTime=0;return{actors:[a.id],actor:a.id};}
  if(kind==='deposit'){const p={x:a.x,z:a.z,species:'Laubstreu',uid:`litter-${a.id}`,detritus:true,stock:1};sim.patches.push(p);a.targetResource=p;a.target=p;a.activity='deposit';a.stateTime=18;return{actors:[a.id],actor:a.id};}
  a.activity=kind==='mutualism'?'pollinating':kind==='dispersal'?'collecting':'grazing';
  if(preferred[1]){
   const p=selectedPatch||this.resourcePatches(a,ANIMALS[a.species],a.activity).filter(p=>p.species===preferred[1]).sort((b,c)=>d(a,b)-d(a,c))[0];
   if(p){a.targetResource=p;a.questPatch=p;if(kind==='herbivory')this.travel(a,ANIMALS[a.species],'grazing',p);else this.choose(a,ANIMALS[a.species]);}
   else this.choose(a,ANIMALS[a.species]);
  }else this.choose(a,ANIMALS[a.species]);
  return{actors:[a.id],actor:a.id,plant:a.targetResource?.species,patch:a.targetResource};
 }
 clearIntent(){for(const a of this.sim.agents){a.questIntent=null;a.questPrey=null;a.questPatch=null;a.questPlant=null;a.questResource=null;}}
}
