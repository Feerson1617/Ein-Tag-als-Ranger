import { ANIMALS } from './biodiversity.js?revision=120';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export class GardenBees {
 constructor(sim,hive){this.sim=sim;this.hive=hive;this.deliveries=0;this.stock=0;}
 chooseFlower(a){const flowers=this.sim.patches.filter(p=>p.flower&&!p.tree&&p.stock>.12&&p.uid!==a.lastFlower?.uid&&(!a.questPlant||p.species===a.questPlant)&&(!a.pollen||a.pollen.species===p.species));
  flowers.sort((p,q)=>distance(a,p)-distance(a,q));const p=flowers[a.id%Math.min(3,flowers.length)]||flowers[0];
  if(!p){a.beeStage='return';a.target=this.hive;return;}
  a.targetResource=p;a.target=p.flowers?.[a.id%p.flowers.length]||p;a.beeStage='outbound';a.visitTime=0;
 }
 tick(dt){this.sim.relations.sync();for(const a of this.sim.agents){if(!a.hiveWorker||!a.alive||a.scenarioInactive||a.scenarioSuppressed)continue;
  if(!a.beeStage){a.beeStage='home';a.beeTime=1+a.phase*1.3;}
  if(a.beeStage==='home'){a.activity='unloading';a.speed*=Math.exp(-dt*9);a.beeTime-=dt;if(a.beeTime<=0){a.pollen=null;a.load=0;this.chooseFlower(a);}continue;}
  if(a.beeStage==='visit'){
   const p=a.targetResource;if(!p||p.stock<.05){this.chooseFlower(a);continue;}
   a.activity='pollinating';a.speed*=Math.exp(-dt*12);a.visitTime+=dt;const intake=Math.min(p.stock,dt*.012);p.stock-=intake;this.sim.relations.regrowing.add(p);a.load=(a.load||0)+intake;a.energy=Math.min(1,a.energy+intake*.4);
   if(a.visitTime>=3){if(a.pollen&&a.pollen.species===p.species&&a.pollen.uid!==p.uid){p.pollenTransfers++;p.seedPotential++;this.sim.emit(a,'mutualism',{...p,id:p.uid});}else this.sim.emit(a,'flowerVisit',{...p,id:p.uid});a.pollen={species:p.species,uid:p.uid};a.lastFlower=p;
    if(a.load>.085){a.beeStage='return';a.target=this.hive;}else this.chooseFlower(a);
   }continue;
  }
  a.activity=a.beeStage==='return'?'returning':'flying';const t=a.target;if(!t){this.chooseFlower(a);continue;}
  const dx=t.x-a.x,dz=t.z-a.z,d=Math.hypot(dx,dz),wanted=Math.atan2(dz,dx),error=Math.atan2(Math.sin(wanted-a.heading),Math.cos(wanted-a.heading));a.heading+=error*(1-Math.exp(-dt*12));
  const v=Math.min(.7,d*2.1);a.speed+=(v-a.speed)*(1-Math.exp(-dt*6));const step=Math.min(d,a.speed*dt);a.x+=Math.cos(a.heading)*step;a.z+=Math.sin(a.heading)*step;
  const ground=this.sim.terrain?.(a.x,a.z)||0,aimY=t.y??ground+(a.targetResource?.size||.3)*.8,altitude=d<.8?Math.max(.03,aimY-ground):.95+.10*Math.sin(a.age*2+a.phase);a.flight+=(altitude-a.flight)*(1-Math.exp(-dt*7));
  if(d<.05){if(a.beeStage==='return'){this.stock+=(a.load||0);this.deliveries++;this.hive.deliveries=this.deliveries;this.hive.stock=this.stock;this.sim.emit(a,'foodDelivery',{species:'Bienenvolk',id:'garden-hive'});a.beeStage='home';a.beeTime=2.5;}else{a.beeStage='visit';a.visitTime=0;}}
 }}
}
export function attachGardenBees(sim,hive){sim.hiveBees=new GardenBees(sim,hive);let workers=sim.agents.filter(a=>a.species==='apis_mellifera');while(workers.length<8)workers.push(sim.spawn('apis_mellifera',0,workers.length));
 for(const [n,a]of workers.entries()){const angle=n*2.399;a.hiveWorker=true;a.x=a.homeX=hive.x+.3+Math.cos(angle)*.13;a.z=a.homeZ=hive.z+Math.sin(angle)*.13;a.flight=.54;a.stateTime=1;a.beeStage=null;}return workers;
}
