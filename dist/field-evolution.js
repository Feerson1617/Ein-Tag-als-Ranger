import { localPoint } from './world-layout.js?revision=120';
import { ANIMALS } from './biodiversity.js?revision=120';

export const EVOLUTION_FACTORS = {
 mutation:{name:'Mutation',question:'Woher kommt ein neues Allel?',explanation:'Bei der Bildung einer Keimzelle kann ein Allel zufällig wechseln. Die Mutationsrate ist für diesen Versuch stark erhöht; die Änderung ist nicht zielgerichtet.'},
 recombination:{name:'Rekombination',question:'Wie entstehen neue Kombinationen vorhandener Allele?',explanation:'Die Nachkommen erben je einen Chromosomenabschnitt von beiden Eltern. Crossing-over kann die beiden Modell-Loci neu kombinieren; dadurch entsteht kein neues Allel.'},
 selection:{name:'Natürliche Selektion',question:'Welche vererbbare Variante hinterlässt mehr Nachkommen?',explanation:'Fellhelligkeit beeinflusst im Modell den Fraßdruck und den Fortpflanzungserfolg auf dunklem Untergrund. Überleben und Fortpflanzung verändern die Zusammensetzung der nächsten Generation.'},
 drift:{name:'Gendrift',question:'Wie verändert Zufall einen kleinen Genpool?',explanation:'Nur eine endliche Zahl von Eltern und Keimzellen bildet die nächste Generation. Dadurch können Allelhäufigkeiten auch ohne Vorteil schwanken. Eine einzelne Abweichung beweist keine Selektion.'},
 geneFlow:{name:'Genfluss',question:'Wann gelangen Allele in eine andere Teilpopulation?',explanation:'Ein Individuum überquert den Durchlass und kann sich in der anderen Teilpopulation fortpflanzen. Erst die Weitergabe an Nachkommen belegt hier den genetischen Beitrag.'},
 isolation:{name:'Geographische Isolation',question:'Was verändert eine undurchlässige Straße?',explanation:'Die Straße verhindert den Austausch bodengebundener Tiere. Paarungen bleiben innerhalb der Teilpopulationen. Eine kurzfristige Trennung ist kein Nachweis für Artbildung.'},
 bottleneck:{name:'Flaschenhalseffekt',question:'Welche Allele bleiben nach einem zufälligen Verlust?',explanation:'Ein nicht nach Merkmalen ausgewählter Teil der Modellpopulation bleibt übrig. Die kleine Stichprobe und ihre Nachkommen können andere Allelhäufigkeiten besitzen.'},
 sexualSelection:{name:'Sexuelle Selektion',question:'Wie wirkt Partnerwahl auf den Fortpflanzungserfolg?',explanation:'Weibliche Modelltiere bevorzugen ein vererbbares Modellmerkmal. Die Paarungschancen verändern sich. Diese vereinfachte Partnerpräferenz ist keine belegte Regel für die dargestellte Tierart.'}
};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const copyDNA=d=>d.map(h=>h.slice());

// A finite, diploid two-locus teaching experiment, connected to visible mice.
// The trait and parameters are explicitly hypothetical; time is compressed.
export class FieldEvolution {
 constructor(sim,{species='microtus_arvalis',originZ=0}={}) {this.species=species;this.originZ=originZ;this.demeX=Math.min(20,...[-65,65].map(x=>Math.abs(localPoint(sim.habitat,{x,z:0}).x)-2.2));
  this.sim=sim;this.pool=[];this.running=false;this.factor=null;this.clock=0;
  this.generation=0;this.history=[];this.events=[];this.pairs=[];this.births=[];
  this.populationSize=16;this.generationSeconds=55;
  for(let i=0;i<48;i++) {
   const a=sim.spawn(this.species,0,i);a.geneticAgent=true;a.retired=true;
   a.alive=false;a.hiddenUntil=Infinity;a.geneticAge=0;a.dna=[[0,0],[1,1]];this.pool.push(a);
  }
  this.initialise();
 }
 random(){return this.sim.random();}
 migrationCrossing(a) {
  const s=ANIMALS[this.species],approach={...s,size:s.size+.2/.55},arrival={...s,size:s.size+.6/.55};
  // Reserve the actual crossing in a clear gap; a board or cottage must not
  // be mistaken for the road barrier in the isolation experiment.
  const permanent=this.sim.habitat==='city'&&this.factor==='isolation'?(this.sim.blockers||[]).find(p=>p.type==='permanentRoad'):null;
  const left=permanent?permanent.x-permanent.halfX-.7:-3.2,right=permanent?permanent.x+permanent.halfX+.7:3.2;
  this.barrierEdge=permanent?permanent.x-permanent.halfX:-2.5;this.divideX=permanent?permanent.x:0;
  const clear=(x,z,body=s,allowRoad=false)=>!(this.sim.blockers||[]).some(p=>!(allowRoad&&p===permanent)&&this.sim.overlapsBlocker(x,z,body,a,p));
  for(const offset of [0,-3,3,-6,6,-9,9,-12,12,-24,24,-27,27,-30,30,-33,33]) {
   const z=this.originZ+offset;
   if(permanent&&Math.abs(z-permanent.z)>permanent.halfZ-.75)continue;
   if(!clear(left,z,arrival)||!clear(right,z,arrival))continue;
   const village=this.sim.habitat==='city',path=village?[{x:a.x,z:a.z},{x:-this.demeX,z:a.z},{x:-this.demeX,z},{x:left,z},{x:right,z},{x:this.demeX,z},{x:this.demeX,z:this.originZ-11}]:[{x:left,z},{x:right,z}];let valid=true;
   for(let j=1;j<path.length&&valid;j++){const from=path[j-1],to=path[j],length=dist(from,to),steps=Math.max(1,Math.ceil(length/.25));for(let k=1;k<=steps;k++){const t=k/steps,x=from.x+(to.x-from.x)*t,qz=from.z+(to.z-from.z)*t;if(!clear(x,qz,j===4?approach:s,j===4&&!!permanent)){valid=false;break;}}}
   if(valid){if(village){this.migrationRoute=path.slice(1);this.crossingIndex=3;}return z;}
  }
  return this.originZ;
 }
 initialise() {
  this.generation=0;this.clock=0;this.cycleStart=0;this.nextGenerationAt=this.generationSeconds;this.history=[];this.events=[];this.pairs=[];this.births=[];this.pairedGeneration=false;
  this.pool.forEach(a=>{a.alive=false;a.retired=true;a.hiddenUntil=Infinity;a.experimentMate=null;a.migrationPath=null;});
  for(let i=0;i<this.populationSize;i++) {
   const side=i<8?-1:1,n=i%8,a=this.pool[i],x=side*this.demeX+(n%4-1.5)*1.4,z=this.originZ-11+(Math.floor(n/4)-.5)*1.5;
   a.x=x;a.z=z;a.homeX=x;a.homeZ=z;a.alive=true;a.dead=false;a.dormant=false;a.retired=false;a.hiddenUntil=0;
   a.energy=.85;a.speed=0;a.age=0;a.geneticAge=30;a.sex=n%2?'male':'female';a.deme=side<0?'west':'east';a.originDeme=a.deme;a.generation=0;
   const p=side<0?.3:.7;a.dna=[[Number(this.random()<p),Number(this.random()<.5)],[Number(this.random()<p),Number(this.random()<.5)]];
   a.activity='foraging';a.stateTime=5;a.trait=1;a.migrant=false;this.phenotype(a);
   this.sim.resolvePlacement(a,ANIMALS[this.species]);a.homeX=a.x;a.homeZ=a.z;a.target={x:a.x+.3,z:a.z+.4};
  }
  this.history.push(this.snapshot());
 }
 start(factor) {
  if(!EVOLUTION_FACTORS[factor])throw new Error('Unknown evolutionary factor');
  this.stop();this.factor=factor;this.generationSeconds=['geneFlow','isolation'].includes(factor)?(this.sim.habitat==='city'?120:75):55;this.migrationRoute=null;this.crossingIndex=1;this.barrierEdge=-2.5;this.divideX=0;this.initialise();this.running=true;
  this.previousFactors={road:!!this.sim.factors.road,corridor:!!this.sim.factors.corridor,corridorZ:this.sim.factors.corridorZ||0};
  if(['isolation','geneFlow'].includes(factor)){this.sim.factors.road=!(factor==='isolation'&&this.sim.habitat==='city');this.sim.factors.corridor=factor==='geneFlow';this.sim.factors.corridorZ=this.originZ;}
  if(factor==='selection')this.sim.activateSpecies?.(['fox']);
  this.sim.geneticSelection={active:factor==='selection',record:(predator,prey)=>this.record('selectivePredation',{predator:predator.id,prey:prey.id,dna:copyDNA(prey.dna),pigment:prey.pigment})};
  if(factor==='bottleneck') {
   const before=this.snapshot(),sample=this.shuffle(this.adults()).slice(0,6),keep=new Set(sample);
   this.adults().forEach(a=>{if(!keep.has(a))this.retire(a);});
   this.record('bottleneck',{before,after:this.snapshot(),survivors:sample.map(a=>a.id)});
   this.history.push(this.snapshot());
  }
  if(['geneFlow','isolation'].includes(factor)) {
   const a=this.adults().find(a=>a.deme==='west'&&a.sex==='male');
   this.crossingZ=this.migrationCrossing(a);this.sim.factors.corridorZ=this.crossingZ;
   a.migrant=true;a.migrationPath=this.migrationRoute||[{x:-3.2,z:this.crossingZ},{x:3.2,z:this.crossingZ},{x:this.demeX,z:this.originZ-11}];a.migrationIndex=0;
   a.activity='migrating';a.stateTime=120;a.target=a.migrationPath[0];this.migrant=a;
  }
  return this;
 }
 stop() {
  this.running=false;
  this.sim.geneticSelection=null;
  if(this.previousFactors){Object.assign(this.sim.factors,this.previousFactors);this.previousFactors=null;}
  this.pool.forEach(a=>{a.experimentMate=null;a.migrationPath=null;a.migrant=false;});this.migrant=null;
 }
 shuffle(items){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 adults(){return this.pool.filter(a=>a.alive&&!a.retired&&a.generation===this.generation);}
 phenotype(a) {a.pigment=clamp(1.04-(a.dna[0][0]+a.dna[1][0])*.16,.68,1.04);a.modelFitness=.55+(a.dna[0][0]+a.dna[1][0])*.225;}
 record(kind,data={}) {const e={kind,generation:this.generation,time:this.clock,...data};this.events.push(e);if(this.events.length>400)this.events.shift();return e;}
 retire(a){a.alive=false;a.retired=true;a.hiddenUntil=Infinity;a.experimentMate=null;a.migrationPath=null;}
 snapshot() {
  const alive=this.pool.filter(a=>a.alive&&!a.retired);
  const count=list=>({n:list.length,pA:list.length?list.reduce((n,a)=>n+a.dna[0][0]+a.dna[1][0],0)/(2*list.length):null,pB:list.length?list.reduce((n,a)=>n+a.dna[0][1]+a.dna[1][1],0)/(2*list.length):null});
  return{generation:this.generation,time:this.clock,...count(alive),west:count(alive.filter(a=>a.deme==='west')),east:count(alive.filter(a=>a.deme==='east'))};
 }
 gamete(parent) {
  let h=this.random()<.5?0:1;const original=h,alleles=[parent.dna[h][0]];
  const crossover=this.factor==='recombination'&&this.random()<.5;if(crossover)h=1-h;
  alleles.push(parent.dna[h][1]);
  if(crossover&&alleles.some((v,k)=>v!==parent.dna[original][k]))this.record('recombination',{parent:parent.id,before:copyDNA(parent.dna),gamete:alleles.slice()});
  if(this.factor==='mutation')for(let k=0;k<2;k++)if(this.random()<.06){const before=alleles[k];alleles[k]=1-before;this.record('mutation',{parent:parent.id,locus:k,before,after:alleles[k]});}
  return alleles;
 }
 reproduce(mother,father) {
  const slot=this.pool.find(a=>!a.alive||a.retired);if(!slot)return null;
  const dna=[this.gamete(mother),this.gamete(father)];
  Object.assign(slot,{id:this.sim.nextId++,alive:true,dead:false,dormant:false,retired:false,hiddenUntil:0,x:(mother.x+father.x)/2,z:(mother.z+father.z)/2,
   homeX:mother.x,homeZ:mother.z,dna,sex:this.random()<.5?'female':'male',deme:mother.deme,originDeme:mother.deme,
   generation:this.generation+1,geneticAge:0,age:0,energy:.8,speed:0,activity:'young',stateTime:10,
   target:null,experimentMate:null,migrationPath:null,migrant:false,parentIds:[mother.id,father.id],trait:.52,lastEvent:null});
  this.phenotype(slot);this.births.push(slot);
  this.record('birth',{child:slot.id,parents:slot.parentIds.slice(),dna:copyDNA(dna),deme:slot.deme});
  if(mother.originDeme!==father.originDeme)this.record('geneFlow',{child:slot.id,parent:father.originDeme!==mother.deme?father.id:mother.id,dna:copyDNA(dna),destination:mother.deme});
  return slot;
 }
 pairParents() {
  const females=this.shuffle(this.adults().filter(a=>a.sex==='female'&&!a.migrationPath));
  const males=this.adults().filter(a=>a.sex==='male'&&!a.migrationPath),used=new Set();
  for(const f of females) {
   let choices=males.filter(m=>!used.has(m.id)&&m.deme===f.deme&&dist(f,m)<12);
   if(this.factor==='sexualSelection')choices.sort((a,b)=>b.modelFitness-a.modelFitness||dist(f,a)-dist(f,b));
   else choices.sort((a,b)=>(this.factor==='geneFlow'?Number(!!b.migrant)-Number(!!a.migrant):0)||dist(f,a)-dist(f,b));
   const m=choices[0];if(!m)continue;used.add(m.id);
   if(this.factor==='selection'&&this.random()>f.modelFitness)continue;
   f.experimentMate=m;m.experimentMate=f;f.target=m;m.target=f;f.activity=m.activity='mateSeeking';f.stateTime=m.stateTime=70;
   this.pairs.push({mother:f,father:m,seconds:0,born:false});
  }
 }
 update(dt) {
  if(!this.running)return;this.clock+=dt;const phase=this.clock-this.cycleStart;
  for(const a of this.pool)if(a.alive&&!a.retired){a.geneticAge+=dt;a.trait=.52+.48*Math.min(1,a.geneticAge/18);a.deme=a.x<(this.divideX||0)?'west':'east';}
  const m=this.migrant;
  if(m?.alive&&m.migrationPath) {
   const p=m.migrationPath[m.migrationIndex];m.activity='migrating';m.target=p;m.stateTime=120;
   if(dist(m,p)<.6){m.migrationIndex++;if(m.migrationIndex>=m.migrationPath.length){m.migrationPath=null;m.deme='east';m.homeX=m.x;m.homeZ=m.z;m.stateTime=0;this.record('migration',{actor:m.id,from:'west',to:'east'});}else m.target=m.migrationPath[m.migrationIndex];}
   if(this.factor==='isolation'&&m.migrationIndex===this.crossingIndex&&Math.abs(m.x-this.barrierEdge)<.5&&!this.events.some(e=>e.kind==='isolation'))this.record('isolation',{actor:m.id,blockedAt:{x:m.x,z:m.z}});
  }
  if(phase>=this.generationSeconds-17&&!this.pairedGeneration){this.pairedGeneration=true;this.pairParents();}
  for(const pair of this.pairs) {
   const {mother,father}=pair;if(pair.born||!mother.alive||!father.alive)continue;
   mother.target=father;father.target=mother;
   if(dist(mother,father)<.75&&mother.activity!=='fleeing'&&father.activity!=='fleeing'){
    mother.activity=father.activity='mating';pair.seconds+=dt;
    if(pair.seconds>3.2){pair.born=true;const pups=1+Math.floor(this.random()*4);for(let i=0;i<pups;i++)this.reproduce(mother,father);mother.experimentMate=father.experimentMate=null;mother.stateTime=father.stateTime=0;
     if(this.factor==='sexualSelection')this.record('sexualSelection',{parents:[mother.id,father.id],pups,chosenTrait:father.modelFitness});
     if(this.factor==='selection')this.record('selection',{parents:[mother.id,father.id],pups,fitness:mother.modelFitness});
    }
   }
  }
  if(this.clock>=this.nextGenerationAt) {
   const surviving=this.births.filter(a=>a.alive&&!a.retired);
   if(surviving.length<2){this.record('noOffspring',{n:surviving.length});this.pairs=this.pairs.filter(p=>!p.born&&p.mother.alive&&p.father.alive);if(!this.pairs.length)this.pairParents();this.nextGenerationAt=this.clock+10;return;}
   const before=this.snapshot(),next=this.shuffle(surviving).slice(0,Math.max(this.populationSize,surviving.length<6?6:0));
   const keep=new Set(next);this.pool.forEach(a=>{if(a.alive&&!keep.has(a))this.retire(a);});
   this.generation++;this.cycleStart=this.clock;this.nextGenerationAt=this.clock+this.generationSeconds;next.forEach(a=>{a.generation=this.generation;a.homeX=a.x;a.homeZ=a.z;a.experimentMate=null;a.stateTime=0;});
   this.births=[];this.pairs=[];this.pairedGeneration=false;const after=this.snapshot();this.history.push(after);
   this.record('generation',{before,after,parentSampling:'finite'});
   if(this.factor==='drift')this.record('drift',{before,after});
  }
 }
 evidence(factor=this.factor) {
  if(factor==='isolation')return this.generation>=1&&this.events.some(e=>e.kind==='isolation');
  if(factor==='bottleneck')return this.events.some(e=>e.kind==='bottleneck');
  return this.events.some(e=>e.kind===factor)&&this.events.some(e=>e.kind==='birth');
 }
 focusAgent(observer) {
  if(this.migrant?.alive&&['geneFlow','isolation'].includes(this.factor)&&!this.evidence())return this.migrant;
  return this.pool.filter(a=>a.alive&&!a.retired).sort((a,b)=>Math.hypot(a.renderX-observer.x,a.renderZ-observer.z)-Math.hypot(b.renderX-observer.x,b.renderZ-observer.z))[0];
 }
 report(){return{factor:this.factor,species:this.species,habitat:this.sim.habitat,model:'finite diploid, two loci, hypothetical trait',generationSeconds:this.generationSeconds,mutationRate:this.factor==='mutation'?.06:0,history:this.history,events:this.events};}
}

export const EVOLUTION_ENCOUNTERS=Object.entries({
 mutation:['apodemus_flavicollis',['forest','city']],
 recombination:['microtus_agrestis',['forest','meadow','farmland']],
 selection:['myodes_glareolus',['forest','farmland']],
 drift:['arvicola_amphibius',['meadow','lake','city']],
 geneFlow:['micromys_minutus',['meadow','farmland','saltmarsh']],
 isolation:['sorex_araneus',['forest','meadow','city','farmland']],
 bottleneck:['crocidura_russula',['city','farmland']],
 sexualSelection:['mus_musculus',['city','farmland']]
}).flatMap(([factor,[species,habitats]])=>habitats.map(habitat=>({factor,species,habitat})));
export class EvolutionCollection {
 constructor(simulations){this.models=EVOLUTION_ENCOUNTERS.map(e=>{const m=new FieldEvolution(simulations.get(e.habitat),{species:e.species,originZ:localPoint(e.habitat,{x:0,z:e.habitat==='lake'?-40:e.habitat==='saltmarsh'?40:0}).z});m.assignedFactor=e.factor;m.pool.forEach(a=>m.retire(a));return m;});this.activeModels=[];this.selectedModel=this.models[0];this.pool=this.models.flatMap(m=>m.pool);}
 start(factor){this.stop();this.activeModels=this.models.filter(m=>m.assignedFactor===factor);for(const m of this.activeModels)m.start(factor);this.selectedModel=this.activeModels[0];return this;}
 stop(){for(const m of this.models){m.stop();m.pool.forEach(a=>m.retire(a));}this.activeModels=[];}
 update(dt){for(const m of this.activeModels)m.update(dt);}
 get sim(){return this.selectedModel.sim;}get generation(){return this.selectedModel.generation;}get history(){return this.selectedModel.history;}get events(){return this.selectedModel.events;}
 get factor(){return this.selectedModel.factor;}get running(){return this.activeModels.length>0;}
 adults(){return this.selectedModel.adults();}snapshot(){return this.selectedModel.snapshot();}report(){return this.selectedModel.report();}evidence(f){return this.selectedModel.evidence(f);}
 focusAgent(observer){return this.selectedModel.focusAgent(observer);}
}
