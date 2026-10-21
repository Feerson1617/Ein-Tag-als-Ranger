import { ANIMALS } from './biodiversity.js?revision=120';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const angleDiff=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
const aerial=new Set(['circling','hovering','stooping','climbing']);
export const isHuntFlight=a=>aerial.has(a.activity);

// Each encounter follows a resource- and species-specific sequence. Movement,
// contact, stock changes and evidence all refer to these persistent individuals.
// Time comes from the simulation clock, including the binocular half-time.
export class EncounterBehavior {
 constructor(sim){this.sim=sim;this.plans=new Set();}
 clear(){for(const p of this.plans)for(const a of p.actors){a.encounterPlan=null;a.behaviorPhase=null;a.huntPhase=null;a.liveHunt=null;a.carriedSeed=null;a.targetResource=null;a.pendingActivity=null;}this.plans.clear();}
 arm(group){
  const {quest:q,actors}=group,p={kind:q.kind,actors,quest:q,patch:group.patch,phase:'approach',seconds:0,cycle:0,visits:0,anchor:{x:actors[0].homeX,z:actors[0].homeZ}};
  for(const a of actors){a.encounterPlan=p;a.pendingActivity=null;a.targetResource=null;a.liveHunt=null;a.behaviorPhase='approach';}
  if(q.kind==='predation'){
   const [hunter,prey]=actors,s=ANIMALS[hunter.species];p.phase=s.id==='falco_tinnunculus'?'circle':s.type==='fish'?'ambush':'stalk';p.style=s.id==='falco_tinnunculus'?'kestrel':s.type==='fish'?'pike':s.form==='crab'?'crab':s.form==='wader'?'wader':'fox';
   hunter.target=prey;hunter.prey=prey.id;hunter.questPrey=prey.species;hunter.flight=p.style==='kestrel'?Math.max(7,hunter.flight||0):0;
   p.anchor={x:prey.homeX,z:prey.homeZ};p.duration=8+group.number*2.2;p.radius=5.5+group.number*.65;p.orbit=hunter.heading;p.direction=group.number%2?-1:1;
   if(['crab','wader'].includes(p.style)){prey.activity=ANIMALS[prey.species].type==='shell'?'filtering':'deposit';prey.target=null;prey.speed=0;}
  }else if(q.kind==='competition'){
   if(q.habitat==='forest'){
    const tree=this.sim.patches.filter(x=>x.tree&&x.perches?.length).sort((a,b)=>distance(a,p.anchor)-distance(b,p.anchor))[0];
    if(tree)p.patch={...tree,sourceUid:tree.uid,uid:`insects-${actors[0].scenarioGroup}`,resource:'insects',stock:.7};
   }
   if(!p.patch)throw Error(`Missing competition resource: ${q.id}`);
   p.patch.stock=Math.max(.6,p.patch.stock||0);p.slots=actors.map(a=>{a.targetResource=p.patch;const t=this.destination(a,p.patch,'feeding');a.target=t;return t;});p.winner=0;
   actors.forEach((a,i)=>{a.targetResource=p.patch;a.target=p.slots[i];a.feedingHeight=p.slots[i].supportHeight||0;});
  }else if(['herbivory','mutualism','dispersal'].includes(q.kind)){
   p.patch ||= this.sim.patches.filter(x=>x.species===q.species[1]).sort((a,b)=>distance(a,p.anchor)-distance(b,p.anchor))[0];
   if(!p.patch)throw Error(`Missing plant resource: ${q.id}`);
   this.setResource(p,p.patch);
  }else if(q.kind==='parasitism'){
   p.phase='host';p.seconds=group.number*1.3;p.hostTarget=this.pointNear(actors[1],{x:actors[1].homeX,z:actors[1].homeZ},3);
  }
  group.plan=p;group.patch=p.patch;this.plans.add(p);return p;
 }
 phase(p,name){p.phase=name;p.seconds=0;for(const a of p.actors)a.behaviorPhase=name;}
 ground(a){return this.sim.terrain?.(a.x,a.z)||0;}
 water(a){const s=ANIMALS[a.species];return s.type==='fish'||s.zone==='water'||['duck','swan','goose'].includes(s.form)&&a.zoneWater;}
 pointNear(a,origin,radius,min=.7){const s=ANIMALS[a.species];for(let k=0;k<96;k++){const angle=a.id*2.399+k*2.399+this.sim.time*.04,r=min+(radius-min)*((k%13)/12),p={x:origin.x+Math.cos(angle)*r,z:origin.z+Math.sin(angle)*r};if(this.sim.passable(p.x,p.z,s,a)&&(s.type!=='bird'||this.sim.birdClear(p.x,p.z,s,a)))return p;}return {x:a.x,z:a.z};}
 destination(a,p,activity){
  const s=ANIMALS[a.species];
  if(s.type==='insect'){const bloom=p.flowers?.[a.id%p.flowers.length];if(bloom)return {...p,x:bloom.x,z:bloom.z,blossom:bloom,supportHeight:Math.max(.02,bloom.y-(this.sim.terrain?.(bloom.x,bloom.z)||0)-s.size*.25)};return {...p,x:p.x,z:p.z,supportHeight:clamp(p.size*.9,.12,1.6)};}
  if(s.type==='bird'&&activity!=='collecting')return this.sim.birdDestination(a,s,p,p.tree?Math.min(4,p.size*.4):0);
  const r=p.tree?Math.max(.9,p.size*.06):s.type==='mammal'&&p.size>1?Math.max(.55,p.size*.22):Math.max(.06,s.size*.32),base=a.id*2.399;
  for(let k=0;k<80;k++){const angle=base+k*2.399,q={...p,x:p.x+Math.cos(angle)*(r+Math.floor(k/16)*.22),z:p.z+Math.sin(angle)*(r+Math.floor(k/16)*.22),supportHeight:0};
   const landing=s.type==='bird'?{...a,flight:0,alive:false}:a;
   if(this.sim.passable(q.x,q.z,s,landing)&&(s.type!=='bird'||this.sim.birdClear(q.x,q.z,s,a,0)))return q;
  }return {...p,supportHeight:0};
 }
 setResource(p,patch){const a=p.actors[0],s=ANIMALS[a.species];a.activity=s.type==='insect'?'flying':this.water(a)?'swimming':'foraging';p.patch=patch;p.destination=this.destination(a,patch,p.kind==='dispersal'?'collecting':'grazing');a.targetResource=patch;a.target=p.destination;a.feedingHeight=p.destination.supportHeight||0;p.visitTime=0;p.visitEmitted=false;this.phase(p,'approach');}
 consume(a,p,dt,rate){const used=Math.min(p.stock??1,dt*rate);p.stock=Math.max(0,(p.stock??1)-used);this.sim.relations.regrowing.add(p);a.energy=Math.min(1,a.energy+used*.2);}
 face(a,p,dt){const error=angleDiff(a.heading,Math.atan2(p.z-a.z,p.x-a.x));a.heading+=clamp(error,-dt*2.5,dt*2.5);}
 flightClearance(a,s,x,z){
  if(s.type!=='bird'||(a.flight||0)<.15)return 0;
  let minimum=0;const margin=this.sim.bodyRadius(s,a)+.035;
  for(const obstacle of this.sim.nearbyBlockers(x,z,margin,null))if(this.sim.overlapsBlocker(x,z,s,{...a,flight:0,alive:false},obstacle,margin))minimum=Math.max(minimum,(obstacle.baseY||0)+(obstacle.height||1.6)+.08);
  return minimum;
 }
 move(a,target,speed,dt,{height=0,vertical=2,activity='walking',brake=true,turn=3.4,accel=3}={}){
  const s=ANIMALS[a.species];a.activity=activity;a.target=target;
  const before={x:a.x,z:a.z},d=distance(a,target),error=angleDiff(a.heading,Math.atan2(target.z-a.z,target.x-a.x));
  a.angularVelocity=(a.angularVelocity||0)+(clamp(error*5,-turn,turn)-(a.angularVelocity||0))*(1-Math.exp(-dt*10));a.heading+=clamp(a.angularVelocity*dt,-Math.abs(error),Math.abs(error));
  const stop=Math.min(.035,Math.max(.0003,s.size*.18)),desired=brake?Math.min(speed,Math.sqrt(Math.max(0,d-stop)*accel*1.2),d*3):speed;
  a.speed+=clamp(desired-a.speed,-dt*accel,dt*accel);
  const step=Math.min(a.speed*dt,brake?d:Infinity),nx=a.x+Math.cos(a.heading)*step,nz=a.z+Math.sin(a.heading)*step;
  const baseBefore=this.sim.terrain?.(before.x,before.z)||0;
  const legalStep=(x,z)=>{
   if(s.type!=='bird')return this.sim.passable(x,z,s,a);
   const current=(a.flight||0)+baseBefore-(this.sim.terrain?.(x,z)||0),safeHeight=Math.max(height,this.flightClearance(a,s,x,z)),next=current+clamp(safeHeight-current,-dt*vertical,dt*vertical);
   return this.sim.passable(x,z,s,{...a,flight:Math.min(a.flight,next)})&&this.sim.birdClear(x,z,s,a,next);
  };
  if(legalStep(nx,nz)){a.x=nx;a.z=nz;a.blockedTime=0;}
  else{a.blockedTime=(a.blockedTime||0)+dt;for(const delta of [.7,-.7,1.3,-1.3,2,-2]){const h=a.heading+delta,x=a.x+Math.cos(h)*step,z=a.z+Math.sin(h)*step;if(legalStep(x,z)){a.x=x;a.z=z;a.heading+=clamp(delta,-dt*turn,dt*turn);break;}}}
  // Correct absolute flight height when the terrain below changes; avoid steps in the sky.
  const baseAfter=this.ground(a),current=this.water(a)?0:(a.flight||0)+baseBefore-baseAfter,safeHeight=Math.max(height,this.flightClearance(a,s,a.x,a.z)),next=current+clamp(safeHeight-current,-dt*vertical,dt*vertical);
  if(s.type==='bird'&&!this.water(a)&&!this.sim.passable(a.x,a.z,s,{...a,flight:next,alive:false})){
   // Do not descend into a rail, sign or roof after a legal aerial step.
   // Hold absolute height until the landing column is clear.
   a.flight=Math.max(0,current);a.activity=isHuntFlight(a)?a.activity:'flying';
  }else if(s.type!=='bird'||this.sim.birdClear(a.x,a.z,s,a,next))a.flight=this.water(a)?0:Math.max(isHuntFlight(a)?.16:0,next);
  a.behaviorDistance=(a.behaviorDistance||0)+distance(a,before);a.lastMoved=distance(a,before)>.00001?this.sim.time:a.lastMoved;
  return distance(a,target)<Math.max(.0006,Math.min(.09,s.size*.35))&&Math.abs((a.flight||0)-height)<.16;
 }
 rest(a,activity,dt,target=a){a.activity=activity;a.speed=Math.max(0,a.speed-dt*3);this.face(a,target,dt);}
 foragePrey(p,dt,threat){const a=p.actors[1],s=ANIMALS[a.species];if(['shell','worm'].includes(s.type)){a.speed=0;a.flight=0;a.activity=s.type==='shell'?(this.ground(a)<-.1+this.sim.environment.tide?'filtering':'resting'):'deposit';return;}
  const hunter=p.actors[0],d=distance(a,hunter);const dangerous=threat&&d<(s.type==='fish'?4.5:6);
  if(dangerous){if(a.behaviorPhase!=='escape'){a.escapeTarget=this.pointNear(a,{x:a.x+(a.x-hunter.x)/Math.max(.01,d)*2,z:a.z+(a.z-hunter.z)/Math.max(.01,d)*2},3,.6);a.behaviorPhase='escape';a.escapeStarted=this.sim.time;}
   if(distance(a,a.escapeTarget)<.15)a.escapeTarget=this.pointNear(a,p.anchor,4,1);
   this.move(a,a.escapeTarget,s.type==='fish'?1.15:Math.max(.6,s.size*5),dt,{activity:'fleeing',accel:5,turn:7});
  }else{a.behaviorPhase='forage';if(!a.forageTarget||distance(a,a.forageTarget)<.12)a.forageTarget=this.pointNear(a,p.anchor,s.type==='fish'?3:2,.7);
   const pause=Math.sin(this.sim.time*.65+a.phase)>.65;pause?this.rest(a,s.type==='fish'?'swimming':'feeding',dt):this.move(a,a.forageTarget,s.type==='fish'?.28:Math.max(.10,s.size*1.5),dt,{activity:s.type==='fish'?'swimming':'foraging'});
  }
 }
 attempted(p){const [a,prey]=p.actors;a.attempts=(a.attempts||0)+1;this.sim.emit(a,'huntAttempt',prey);if(!['shell','worm'].includes(ANIMALS[prey.species].type)){this.sim.emit(prey,'escape',a);prey.escapes=(prey.escapes||0)+1;}p.cycle++;a.liveHunt=null;}
 hunt(p,dt){const [a,b]=p.actors,s=ANIMALS[a.species];a.liveHunt=null;a.huntPhase=p.phase;
  if(p.style==='kestrel'){
   this.foragePrey(p,dt,p.phase==='stoop'&&(a.flight||0)<4.5);
   const altitude=8.5+1.2*Math.sin(a.phase+p.cycle*.8),center=p.anchor;
   if(p.phase==='circle'){p.orbit+=p.direction*dt*.47;const t={x:center.x+Math.cos(p.orbit)*p.radius,z:center.z+Math.sin(p.orbit)*p.radius};this.move(a,t,4.2,dt,{activity:'circling',height:altitude,vertical:4,brake:false,turn:2.6});if(p.seconds>p.duration)this.phase(p,'hover');}
   else if(p.phase==='hover'){const t={x:b.x+Math.cos(a.phase)*.65,z:b.z+Math.sin(a.phase)*.65};this.move(a,t,3.4,dt,{activity:'hovering',height:altitude,vertical:4,turn:5});if(p.seconds>2.8&&distance(a,t)<1.2){p.strikeTarget={x:b.x,z:b.z};this.phase(p,'stoop');}}
   else if(p.phase==='stoop'){a.liveHunt={prey:b.id,phase:'strike',time:this.sim.time};this.move(a,b,6.5,dt,{activity:'stooping',height:.16,vertical:5.7,turn:7,accel:7});
    if((a.flight<.55&&distance(a,b)<.8)||p.seconds>4.2){if(a.flight<.75&&distance(a,b)<1.2)this.attempted(p);this.phase(p,'climb');p.depart=this.pointNear(a,center,p.radius+1,4);}
   }else{this.move(a,p.depart,4.4,dt,{activity:'climbing',height:altitude,vertical:4.5,brake:false,turn:4});if(a.flight>altitude-.5&&p.seconds>2.5){p.duration=10+(a.id%4)*1.5;this.phase(p,'circle');}}
   a.target=b;a.huntPhase=p.phase;return;
  }
  this.foragePrey(p,dt,['pursuit','strike'].includes(p.phase));
  const d=distance(a,b),gap=p.style==='fox'?s.size*.38+ANIMALS[b.species].size*.35:p.style==='pike'?s.size*.33:.06;
  if(p.style==='crab'||p.style==='wader'){
   const flooded=this.ground(b)<-.1+this.sim.environment.tide;
   if(p.style==='wader'&&flooded&&this.sim.environment.tide>-.3){this.rest(a,'waiting',dt,b);return;}
   if(p.phase==='handle'){this.rest(a,p.style==='crab'?'handling':'probing',dt,b);if(p.seconds>4){this.attempted(p);this.phase(p,'recovery');p.depart=this.pointNear(a,b,p.style==='crab'?.45:1.2,.25);}return;}
   if(p.phase==='recovery'){if(this.move(a,p.depart,p.style==='crab'?.08:.28,dt,{activity:'foraging'})||p.seconds>6)this.phase(p,'stalk');return;}
   this.move(a,b,p.style==='crab'?.10:.35,dt,{activity:p.style==='crab'?'hunting':'probing',turn:5,accel:1});a.liveHunt=d<3?{prey:b.id,phase:'approach',time:this.sim.time}:null;
   if(d<Math.max(gap,s.size*.45)){this.phase(p,'handle');}return;
  }
  if(p.phase==='recovery'){this.move(a,p.depart,p.style==='pike'?.22:.45,dt,{activity:p.style==='pike'?'swimming':'foraging'});if(p.seconds>4)this.phase(p,p.style==='pike'?'ambush':'stalk');return;}
  if(p.phase==='ambush'){this.rest(a,'waiting',dt,b);if(p.seconds>4.5+(a.id%3)){this.phase(p,'pursuit');}return;}
  if(p.phase==='stalk'){this.move(a,b,.55,dt,{activity:'stalking'});if(d<2.5||p.seconds>10)this.phase(p,'pursuit');return;}
  a.liveHunt={prey:b.id,phase:'pursuit',time:this.sim.time};this.move(a,b,p.style==='pike'?2.6:3.1,dt,{activity:'hunting',accel:p.style==='pike'?7:5,turn:6});
  if(d<gap+.18||p.seconds>(p.style==='pike'?3:5)){if(d<gap+.35)this.attempted(p);this.phase(p,'recovery');p.depart=this.pointNear(a,p.anchor,3,1.5);}
 }
 competition(p,dt){const actors=p.actors;
  if(p.patch.stock<.08&&p.phase!=='retreat'){
   const s=ANIMALS[actors[0].species],options=(p.patch.tree?this.sim.patches.filter(x=>x.tree&&x.perches?.length):this.sim.relations.resourcePatches(actors[0],s,'feeding')).filter(x=>x.uid!==p.patch.uid&&(p.foodSites?.get(x.uid)?.stock??x.stock)>.35&&distance(x,p.patch)>.5).sort((a,b)=>distance(a,p.patch)-distance(b,p.patch));
   const next=options[0];if(!next){actors.forEach(a=>this.rest(a,'foraging',dt));return;}
   if(p.patch.tree){p.foodSites||=new Map([[p.patch.sourceUid||p.patch.uid,p.patch]]);let site=p.foodSites.get(next.uid);if(!site){site={...next,sourceUid:next.uid,uid:`insects-${actors[0].scenarioGroup}-${next.uid}`,resource:'insects',stock:1};p.foodSites.set(next.uid,site);}p.patch=site;}else p.patch=next;
   p.slots=actors.map(a=>{a.targetResource=p.patch;const t=this.destination(a,p.patch,'feeding');a.target=t;return t;});p.feedSeconds=0;this.phase(p,'approach');
  }
  if(p.phase==='retreat'){
   const loser=actors[1-p.winner],winner=actors[p.winner];this.rest(winner,'feeding',dt,p.patch);this.consume(winner,p.patch,dt,.012);
   const done=this.move(loser,p.retreat,ANIMALS[loser.species].type==='bird'?.7:.6,dt,{activity:'yielding',height:p.retreat.supportHeight||0});
   if((done&&p.seconds>3)||p.seconds>7){p.winner=1-p.winner;p.slots=actors.map(a=>{a.targetResource=p.patch;const t=this.destination(a,p.patch,'feeding');a.target=t;return t;});this.phase(p,'approach');}return;
  }
  const ready=actors.map((a,i)=>{const s=ANIMALS[a.species],t=p.slots[i],d=distance(a,t),h=t.supportHeight||0;a.targetResource=p.patch;a.feedingHeight=h;
   if(d<.15&&Math.abs(a.flight-h)<.16){this.rest(a,s.resource==='leaves'?'grazing':'feeding',dt,p.patch);this.consume(a,p.patch,dt,.018);return true;}
   const flying=s.type==='bird'&&!this.water(a)&&d>1.4;return this.move(a,t,flying?2.2:this.water(a)?.32:Math.min(.65,s.size*1.8),dt,{activity:flying?'flying':this.water(a)?'swimming':'walking',height:flying&&d>2?Math.max(1.5,h):h,vertical:2.5});
  });
  if(ready.every(Boolean)){p.feedSeconds=(p.feedSeconds||0)+dt;if(p.feedSeconds>4&&p.patch.stock<.56){const [a,b]=actors;this.sim.emit(a,'competition',b);this.sim.emit(b,'competition',a);a.contests=(a.contests||0)+1;b.contests=(b.contests||0)+1;
    const loser=actors[1-p.winner],s=ANIMALS[loser.species];p.retreat=this.pointNear(loser,p.slots[1-p.winner],Math.max(1.8,s.size*3),1.1);p.retreat.supportHeight=p.slots[1-p.winner].supportHeight||0;loser.energy=Math.max(.1,loser.energy-.02);p.feedSeconds=0;this.phase(p,'retreat');}}
  else if(p.seconds>24){p.slots=actors.map(a=>{a.targetResource=p.patch;const t=this.destination(a,p.patch,'feeding');a.target=t;return t;});p.seconds=0;}
 }
 plant(p,dt){const a=p.actors[0],s=ANIMALS[a.species],d=distance(a,p.destination),h=p.destination.supportHeight||0;
  if(p.phase==='approach'){
   const flying=s.type==='insect'||s.type==='bird'&&!this.water(a)&&d>1.8,height=s.type==='insect'?h:flying&&d>2?1.8:h;
   if(this.move(a,p.destination,s.type==='insect'?1.1:flying?2.3:this.water(a)?.33:s.form==='squirrel'?.85:.55,dt,{activity:flying?'flying':this.water(a)?'swimming':'walking',height,vertical:2.8,turn:6})){this.phase(p,'visit');a.targetResource=p.patch;}return;
  }
  if(p.phase==='visit'){
   a.flight=h;this.rest(a,p.kind==='mutualism'?'pollinating':p.kind==='dispersal'?'collecting':'grazing',dt,p.patch);this.consume(a,p.patch,dt,p.kind==='herbivory'?.028:.008);p.visitTime+=dt;
   if(p.visitTime>2.7&&!p.visitEmitted){p.visitEmitted=true;
    if(p.kind==='mutualism'){if(a.pollen&&a.pollen.uid!==p.patch.uid&&a.pollen.species===p.patch.species){p.patch.pollenTransfers=(p.patch.pollenTransfers||0)+1;p.patch.seedPotential=(p.patch.seedPotential||0)+1;this.sim.emit(a,'mutualism',{...p.patch,id:p.patch.uid});}else this.sim.emit(a,'flowerVisit',{...p.patch,id:p.patch.uid});a.pollen={species:p.patch.species,uid:p.patch.uid};a.lastPatch=p.patch;}
    else if(p.kind==='dispersal'){a.carriedSeed={species:p.patch.species,x:p.patch.x,z:p.patch.z};this.sim.emit(a,'seedCollection',{...p.patch,id:p.patch.uid});}
    else this.sim.emit(a,'herbivory',{...p.patch,id:p.patch.uid});
   }
   if(p.visitTime>(p.kind==='herbivory'?7:4)+(a.id%3)){
    if(p.kind==='dispersal'){p.cache=this.pointNear(a,p.patch,7,4);p.cache.species=p.patch.species;p.cache.uid=`cache-${a.id}-${this.sim.time}`;this.phase(p,'transport');}
    else{const alternatives=this.sim.patches.filter(x=>x.species===p.patch.species&&x.uid!==p.patch.uid&&x.stock>.08).sort((b,c)=>distance(a,b)-distance(a,c)).filter(x=>{const t=this.destination(a,x,p.kind==='mutualism'?'pollinating':'grazing');return this.sim.passable(t.x,t.z,s,a);});this.setResource(p,alternatives[(p.visits++)%Math.min(3,alternatives.length)]||p.patch);}
   }return;
  }
  if(p.phase==='transport'){
   const bird=s.type==='bird',height=bird&&distance(a,p.cache)>1.5?1.9:0;a.activity='dispersal';
   if(this.move(a,p.cache,bird?2.4:.85,dt,{activity:bird?'flying':'dispersal',height,vertical:2.6,turn:6})){this.phase(p,'cache');}return;
  }
  this.rest(a,'caching',dt,p.cache);if(p.seconds>2.4){const seed={...p.cache,actor:a.id,time:this.sim.time,viable:this.sim.random()<.65};this.sim.relations.seedCaches.push(seed);this.sim.emit(a,'dispersal',{...p.cache,id:p.cache.uid});a.carriedSeed=null;a.lastCache=seed;p.cycle++;this.setResource(p,p.patch);}
 }
 host(p,dt){const a=p.actors[1],s=ANIMALS[a.species];if(s.type==='fish'){if(distance(a,p.hostTarget)<.15||p.seconds>7){p.hostTarget=this.pointNear(a,p.anchor,4,1);p.seconds=0;}this.move(a,p.hostTarget,.3,dt,{activity:'swimming'});}else if(p.seconds<5){this.rest(a,'grazing',dt);}else{if(this.move(a,p.hostTarget,.5,dt)||p.seconds>13){p.hostTarget=this.pointNear(a,p.anchor,4,1);p.seconds=0;}}}
 tideRoost(p,dt){if(!['beach','wadden','saltmarsh'].includes(this.sim.habitat))return false;let paused=false;
  for(const a of p.actors){const s=ANIMALS[a.species];if(s.type!=='bird'||!['wader','gull'].includes(s.form))continue;
   const feeding=p.patch||p.actors[1]||a,flooded=this.sim.environment.tide>-.3&&this.sim.terrain(feeding.x,feeding.z)<-.1+this.sim.environment.tide+.03;
   if(flooded&&!a.tideRoost){const options=[];for(let n=0;n<90;n++){const t=this.sim.zonePoint({...s,zone:'grass'},a.id,n);if(this.sim.terrain(t.x,t.z)>.4&&this.sim.passable(t.x,t.z,s,a)){const q=this.sim.birdDestination(a,s,t,0);if(this.sim.terrain(q.x,q.z)>-.1+this.sim.environment.tide+.08)options.push(q);}}const t=options.sort((b,c)=>distance(a,b)-distance(a,c))[0];if(t){a.roostTarget=t;a.tideRoost=true;p.feedSeconds=0;}}
   if(a.tideRoost&&this.sim.environment.tide<-.55){a.tideRoost=false;a.roostTarget=null;this.phase(p,p.kind==='predation'?'stalk':'approach');}
   if(!a.tideRoost||!a.roostTarget)continue;paused=true;a.behaviorPhase='high-tide-roost';const d=distance(a,a.roostTarget);this.move(a,a.roostTarget,2.4,dt,{activity:d>.15||a.flight>.12?'flying':'preening',height:d>1.4?2:0,vertical:2.7});
  }return paused;
 }
 disturbance(p,dt,observer){if(!observer)return false;const active=p.kind==='parasitism'?[p.actors[1]]:p.actors;let disturbed=false;
  for(const a of active){const s=ANIMALS[a.species];if(!['bird','mammal'].includes(s.type)||this.water(a)||s.type==='bird'&&a.flight>2.5)continue;
   const close=distance(a,observer)<Math.max(1.5,s.size*2.2);
   if(close){if(['herbivory','mutualism','dispersal'].includes(p.kind)&&p.phase==='visit'){p.visitTime=0;p.visitEmitted=false;this.phase(p,'approach');}if(p.kind==='predation'&&p.phase==='handle')this.phase(p,'stalk');const d=Math.max(.01,distance(a,observer)),origin={x:a.x+(a.x-observer.x)/d*2,z:a.z+(a.z-observer.z)/d*2};if(!(a.disturbedUntil>this.sim.time))a.disturbanceTarget=this.pointNear(a,origin,3,1);a.disturbedUntil=this.sim.time+1.2;}
   if(!(a.disturbedUntil>this.sim.time))continue;disturbed=true;a.behaviorPhase='disturbance';
   if(p.style==='kestrel'){p.depart=this.pointNear(a,p.anchor,7,4);this.phase(p,'climb');this.move(a,p.depart,4.2,dt,{activity:'climbing',height:8.5,vertical:5,brake:false});}
   else this.move(a,a.disturbanceTarget,s.type==='bird'?2.5:Math.max(.7,Math.min(2.5,s.size*3)),dt,{activity:'fleeing',height:s.type==='bird'?1.8:0,turn:6,accel:5});
  }if(disturbed&&p.style==='kestrel'&&p.actors[0].behaviorPhase!=='disturbance'){const a=p.actors[0];p.depart=this.pointNear(a,p.anchor,7,4);this.phase(p,'climb');this.move(a,p.depart,4.2,dt,{activity:'climbing',height:8.5,vertical:5,brake:false});}return disturbed;
 }
 update(dt,observer){for(const p of this.plans){if(!p.actors.every(a=>a.alive&&!a.scenarioInactive&&!a.scenarioSuppressed))continue;p.seconds+=dt;for(const a of p.actors)a.behaviorPhase=p.phase;
   if(this.disturbance(p,dt,observer)||this.tideRoost(p,dt))continue;
   if(p.kind==='predation')this.hunt(p,dt);else if(p.kind==='competition')this.competition(p,dt);else if(p.kind==='parasitism')this.host(p,dt);else this.plant(p,dt);
  }}
}
