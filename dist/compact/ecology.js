import { applyForestStructure,applyMarshGradient } from './habitats.js';
import { stepCoastal } from './coastal-behaviour.js';
import { CATALOG,WINDOWS } from './catalog.js';
import { MANIFEST } from './manifest.js';
import { terrainHeight,nearestPath } from './layout.js';

// Every rate/count here is a didactic parameter. One model second is one second
// of encounter behaviour; decomposition/growth are separate, labelled models.
export const INTERACTIONS=Object.freeze([
 {id:'fox-mouse',kind:'predation',actors:['vulpes_vulpes','apodemus_sylvaticus'],resource:'wood-mice',window:'dusk',sequence:['stalk','attempt','caught-or-escaped'],conclusion:'Einzelner Jagdversuch; kein Beweis einer Populationsregel',source:'S24'},
 {id:'ladybird-aphid',kind:'predation',actors:['coccinella_septempunctata','aphidoidea'],resource:'aphid-colony',window:'summer',sequence:['search','contact','consume'],conclusion:'Blattlaus als Beute dieses Individuums',source:'S53,S54'},
 {id:'shell-competition',kind:'interspecific-competition',actors:['haematopus_ostralegus','carcinus_maenas'],resource:'shared-mussels',window:'summer',sequence:['accessible','remove','reduced-yield'],conclusion:'Zugang und Ertrag am begrenzten Pool; Kontrollvergleich erforderlich',source:'S37,S39'},
 {id:'same-species-competition',kind:'intraspecific-competition',actors:['coccinella_septempunctata','coccinella_septempunctata'],resource:'aphid-colony',window:'summer',sequence:['shared-resource','remove','reduced-yield'],conclusion:'Begrenzte Beute bei zwei Individuen, kein Revierkampf',source:'S53'},
 {id:'tick-deer',kind:'parasitism',actors:['ixodes_ricinus','capreolus_capreolus'],resource:'deer-host',window:'summer',sequence:['attached','feeding'],conclusion:'Adulte Zecke am konkreten Wirt; relative Kosten nur Ergänzungsmodell',source:'S22'},
 {id:'root-fungus',kind:'symbiosis',actors:['fagus_sylvatica','ectomycorrhiza'],resource:'root-exchange',window:'summer',sequence:['carbon-to-fungus','mineral-to-root'],conclusion:'Bereitgestelltes Wurzelschnittmodell, keine Fernglassichtung',source:'S32'},
 {id:'bee-clover',kind:'pollination',actors:['bombus_lapidarius','trifolium_pratense'],resource:'clover-pollen',window:'summer',sequence:['anther-contact','pollen-carried','stigma-contact'],conclusion:'Pollentransport; weder Befruchtung noch Samenbildung garantiert',source:'S17,S51,S52'},
 {id:'deer-browse',kind:'herbivory',actors:['capreolus_capreolus','rubus_fruticosus'],resource:'browse-shoot',window:'summer',sequence:['bite','shoot-reduced'],conclusion:'Materialverändernder Verbiss, keine bloße Kopfbewegung',source:'S23'},
 {id:'caterpillar-nettle',kind:'herbivory',actors:['aglais_io','urtica_dioica'],resource:'nettle-leaf',window:'summer',sequence:['bite','leaf-reduced'],conclusion:'Raupenfraß; Falter und Raupe gehören zu einem Taxon',source:'S20'},
 {id:'worm-litter',kind:'detritus',actors:['lumbricidae','saprotrophs'],resource:'leaf-litter',window:'summer',sequence:['grip','pull','mixed-litter'],conclusion:'Streueinzug; vollständige Mineralisierung ist ein anderer Prozess',source:'S55'},
 {id:'fungus-wood',kind:'decomposition',actors:['fomes_fomentarius','saprotrophs'],resource:'dead-wood',window:'summer',sequence:['wood','fungal-growth','carbon-release'],conclusion:'Langzeit-Schnittmodell; Zunderschwamm ist kein Mykorrhizapartner',source:'S30,S31'},
 {id:'jay-acorn',kind:'zoochory',actors:['garrulus_glandarius','quercus_robur'],resource:'acorns',window:'autumn',sequence:['pick','carry','cache'],conclusion:'Transport/Verstecken; kein garantierter Keimungserfolg',source:'S25,S26'},
 {id:'shore-feeding',kind:'niche',actors:['platalea_leucorodia','recurvirostra_avosetta','tringa_totanus','haematopus_ostralegus'],resource:'size-specific-prey',window:'summer',sequence:['depth-access','technique','prey-size'],conclusion:'Mehrere Nischendimensionen; keine Erklärung allein durch Schnabelform',source:'S33-S40'},
 {id:'communication',kind:'communication-model',actors:['parus_major','parus_major'],resource:'signal',window:'spring',sequence:['signal','receiver-orients'],conclusion:'Gestaltete Sender-/Empfängerfolge; keine unabhängige Naturvalidierung oder Absichtsdeutung',source:'S27; didactic response sequence'}
]);
const rng=seed=>{let n=seed>>>0;return()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);};
const mix=(a,b,t)=>a+(b-a)*t;
export function tideAt(time){const phase=((time%120)+120)%120/120;return {phase,waterLevel:-1.05+.8*(1-Math.cos(phase*Math.PI*2))/2,label:phase<.15||phase>.85?'Niedrigwasser':phase>.35&&phase<.65?'Hochwasser':'Übergang'};}
export function createEcology(state,window='summer'){
 const ground=(x,z)=>terrainHeight(x,z,state.modelRevision);
 if(!WINDOWS[window])throw Error('Unbekanntes Beobachtungsfenster.');
 const random=rng(state.initialSeed+871),actors=[];
 const add=(taxon,id,x,z,extras={})=>{const a={id:'compact-'+id,individualId:'compact-'+id,taxon,x,z,y:ground(x,z),size:CATALOG[taxon].length,heading:0,activity:'resting',phase:0,visible:true,alive:true,...extras};actors.push(a);return a;};
 const patch=(taxon,x,z,count,radius,size)=>{for(let i=0;i<count;i++){const a=random()*Math.PI*2,r=Math.sqrt(random())*radius,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(nearestPath(px,pz).distance<1.25)continue;state.plants.push({id:`${state.worldVersion}:${taxon}:${state.plants.length}`,taxon,x:px,z:pz,y:ground(px,pz),size:size*(.85+random()*.3),angle:random()*6.28});}};
 // These additions happen once, never on quest activation or graphics changes.
 if(!state.expandedPlants){patch('rubus_fruticosus',-43,1,9,2,1.15);patch('rubus_fruticosus',-59.8,3,3,.4,.8);patch('trifolium_pratense',-25,9,25,1.7,.3);patch('trifolium_pratense',-26,12,18,1,.28);patch('festuca_rubra',25,20,45,3,.55);patch('puccinellia_maritima',37,-17,55,3,.4);patch('limonium_vulgare',34,19,22,3,.45);state.expandedPlants=true;}
 applyForestStructure(state,rng(state.initialSeed+2718));applyMarshGradient(state);
 const nettle=state.plants.filter(p=>p.taxon==='urtica_dioica').sort((a,b)=>Math.hypot(a.x+43,a.z-12)-Math.hypot(b.x+43,b.z-12))[0];
 const clover=state.plants.filter(p=>p.taxon==='trifolium_pratense').slice(0,2);
 const browse=state.plants.filter(p=>p.taxon==='rubus_fruticosus').sort((a,b)=>Math.hypot(a.x-state.deer.x,a.z-state.deer.z)-Math.hypot(b.x-state.deer.x,b.z-state.deer.z))[0];
 add('fomes_fomentarius','bracket',-62,-2.25,{y:ground(-62,-2.25)+.56,stage:'fruiting-body',supportId:'compact-dead-log'});
 add('vulpes_vulpes','fox',-64,-20,{window:'dusk',heading:0});
 for(let i=0;i<3;i++)add('apodemus_sylvaticus','mouse-'+i,-61+i*.6,-20+i*.4,{window:'dusk',stage:'adult'});
 add('garrulus_glandarius','jay',-38,-9,{window:'autumn',supportId:state.trees.find(t=>t.type==='oak')?.id||state.trees[0].id,y:ground(-38,-9)+1.3,stage:'adult'});
 for(let i=0;i<2;i++){const t=state.trees[i];add('parus_major','tit-'+i,t.x+1.7,t.z,{supportId:t.id,y:ground(t.x,t.z)+t.h*.42+1.525,stage:'adult'});}
 add('bombus_lapidarius','bee',clover[0].x,clover[0].z,{y:clover[0].y+.3,stage:'worker',plantId:clover[0].id});
 add('aglais_io','butterfly',-26,11,{y:ground(-26,11)+.5,stage:'adult'});
 add('aglais_io','caterpillar',nettle.x,nettle.z,{y:nettle.y+nettle.size*.68,size:.035,stage:'caterpillar',plantId:nettle.id});
 for(let i=0;i<2;i++)add('coccinella_septempunctata','ladybird-'+i,nettle.x+.07+i*.03,nettle.z,{y:nettle.y+nettle.size*.68,plantId:nettle.id});
 for(let i=0;i<9;i++)add('aphidoidea','aphid-'+i,nettle.x+.03+i*.006,nettle.z+.01,{y:nettle.y+nettle.size*.68,plantId:nettle.id});
 add('lumbricidae','earthworm',-61,-2.7,{y:ground(-61,-2.7)+.015,stage:'adult'});
 add('ixodes_ricinus','tick',state.deer.x,state.deer.z,{hostId:state.deer.id,y:ground(state.deer.x,state.deer.z)+.6,stage:'adult-female'});
 add('recurvirostra_avosetta','avocet',62,-7,{technique:'sweeping',preyClass:'small-juveniles',depth:[0,.12]});
 add('platalea_leucorodia','spoonbill',70,1,{technique:'sweeping',preyClass:'shrimp-20-40mm',depth:[.05,.35]});
 add('tringa_totanus','redshank',59,5,{technique:'probing',preyClass:'small-worms',depth:[-.3,.08]});
 add('haematopus_ostralegus','oystercatcher',61,-14,{technique:'shell-opening',preyClass:'mussels-20-40mm',depth:[-.8,.04]});
 for(let i=0;i<18;i++)add('mytilus_edulis','mussel-'+i,60.5+(i%6)*.12,-14.25+Math.floor(i/6)*.16,{y:ground(60.5+(i%6)*.12,-14.25+Math.floor(i/6)*.16)+.004,size:.02+(i%3)*.01,station:'compact-mussel-pool',attached:true});
 for(let i=0;i<10;i++){const x=63+(i%5)*.18,z=-12+Math.floor(i/5)*.3;add('cerastoderma_edule','cockle-'+i,x,z,{station:'compact-cockle-probe',burialDepth:1.5,sedimentSurface:ground(x,z),y:ground(x,z)-.015,sampleGroup:i<5?'Q1':'Q2',activity:'resting'});}
 add('arenicola_marina','lugworm',65,-9,{stage:'adult',burrow:true});add('hediste_diversicolor','ragworm',64,-6,{stage:'adult',burrow:true});
 for(let i=0;i<6;i++)add('hediste_diversicolor','juvenile-worm-'+i,(i<3?62:59)+i%3*.08,(i<3?-7:5)+i%3*.03,{stage:'juvenile',size:i<3?.006:.012,resourceClass:i<3?'small-juveniles':'small-worms'});
 for(let i=0;i<5;i++)add('crangon_crangon','shrimp-'+i,69+i*.14,1+i*.08,{y:ground(70,1)+.03,size:.025+i*.004,resourceClass:'shrimp-20-40mm'});
 add('carcinus_maenas','crab',61.7,-14.1,{resourceClass:'mussels-20-40mm'});
 for(let i=0;i<12;i++)add('peringia_ulvae','snail-'+i,64+i%4*.05,-12.7+Math.floor(i/4)*.05);
 // Revision 2 moves the EXISTING bed and its two consumers away from the
 // boardwalk footprint at initial world construction, never during play.
 if(state.modelRevision>=2)for(const a of actors)if(['mytilus_edulis','carcinus_maenas','haematopus_ostralegus'].includes(a.taxon)){a.z-=1.3;a.y=ground(a.x,a.z)+(a.taxon==='mytilus_edulis'?.004:0);}
 const resources={
  'aphid-colony':{id:nettle.id,amount:9,initial:9,units:'model aphids',hostId:nettle.id},
  'shared-mussels':{id:'compact-mussel-pool',amount:18,initial:18,units:'20–40 mm model mussels',sizeRange:[.02,.04]},
  'clover-pollen':{id:clover[0].id,recipientId:clover[1].id,amount:6,initial:6,units:'relative pollen packets'},
  'browse-shoot':{id:browse.id,amount:5,initial:5,units:'visible model shoots'},
  'nettle-leaf':{id:nettle.id,amount:8,initial:8,units:'relative leaf pieces'},
  'leaf-litter':{id:'compact-leaf-litter',amount:6,initial:6,units:'relative leaf fragments'},
  'dead-wood':{id:'compact-dead-log',amount:100,initial:100,units:'relative carbon; separate long-term model'},
  acorns:{id:'compact-oak-acorns',amount:4,initial:4,units:'model acorns'},
  'wood-mice':{id:'compact-mouse-cover',amount:3,initial:3,units:'encounter individuals'},
  'wood-larvae':{id:'wood-insect-larvae',amount:8,initial:8,units:'grouped model larvae'},
  'small-juveniles':{id:'compact-juvenile-ragworms',amount:3,initial:3,units:'six-mm juvenile ragworms; not adult shrimp'},
  'small-worms':{id:'compact-small-ragworms',amount:3,initial:3,units:'twelve-mm juvenile ragworms'},
  shrimp:{id:'compact-creek-shrimps',amount:5,initial:5,units:'25–41 mm model shrimp'},
  'deer-host':{id:state.deer.id,amount:1,initial:1,units:'one host; costs qualitative'}
  ,phytoplankton:{id:'phytoplankton',amount:100,initial:100,units:'relative suspended food; no natural concentration'},'benthic-diatoms':{id:'benthic-diatoms',amount:30,initial:30,units:'relative surface food'}
 };
 const quadrats=[{id:'Q1',x:63,z:-12,width:.9,depth:.3,areaM2:.27,sedimentDepthCm:5,rule:'present living cockles; same ID counted once'},{id:'Q2',x:63,z:-11.7,width:.9,depth:.3,areaM2:.27,sedimentDepthCm:5,rule:'present living cockles; same ID counted once'},{id:'Q0',x:66,z:-12,width:.9,depth:.3,areaM2:.27,sedimentDepthCm:5,rule:'same method; valid zero find'}];
 for(const a of actors){a.homeX=a.x;a.homeZ=a.z;}
 const e={window,actors,resources,events:[],sequence:0,nextEventAt:state.time+2,cycle:0,tide:tideAt(state.time),quadrats,cloverIds:clover.map(p=>p.id),nettleId:nettle.id};state.ecology=e;updateActors(state,0);return e;
}
function emit(state,interaction,actors,resource,change,outcome,extra={}){const e=state.ecology,r=e.resources[resource],before=r?.amount??null,contract=INTERACTIONS.find(c=>c.id===interaction);if(contract&&contract.resource!==resource&&contract.resource!=='size-specific-prey')throw Error('Interaktionsregister und Ressource widersprechen sich.');if(r)r.amount=Math.max(0,r.amount+change);const event={id:`${state.worldVersion}:${e.window}:${++e.sequence}`,interaction,actors,resourceId:r?.id||resource,resource,startedAt:Math.max(0,state.time-2),endedAt:state.time,before,after:r?.amount??null,outcome,source:'model-event',window:e.window,interpretation:contract?{kind:contract.kind,limit:contract.conclusion,reference:contract.source}:null,...extra};e.events.push(event);if(e.events.length>2000)e.events.shift();return event;}
function updateActors(state,dt){const e=state.ecology,t=state.time,byId=id=>e.actors.find(a=>a.id==='compact-'+id),host=state.deer;
 for(const a of e.actors){a.visible=a.alive&&(!a.window||a.window===e.window);a.phase+=dt;if(a.taxon==='ixodes_ricinus'){a.x=host.x-.07;a.z=host.z+.16;a.y=terrainHeight(host.x,host.z)+.66;a.visible=a.visible&&e.window!=='dusk';}
  if(a.taxon==='cerastoderma_edule')a.activity=e.tide.waterLevel>a.sedimentSurface?'filtering':'resting';
  if(a.taxon==='coccinella_septempunctata'){const prey=e.actors.find(p=>p.taxon==='aphidoidea'&&p.alive);if(prey){const d=Math.hypot(prey.x-a.x,prey.z-a.z),move=Math.min(d,.01*dt);if(d){a.x+=(prey.x-a.x)/d*move;a.z+=(prey.z-a.z)/d*move;}a.activity=d<.007?'feeding':'searching';}else a.activity='resting';}
  if(a.taxon==='parus_major'){const support=state.trees.find(s=>s.id===a.supportId);if(!support){a.activity='flying';a.supportId=null;a.y+=Math.sign(terrainHeight(a.x,a.z)+3-a.y)*Math.min(Math.abs(terrainHeight(a.x,a.z)+3-a.y),2*dt);}else{a.x=support.x+1.7;a.z=support.z;a.y=terrainHeight(support.x,support.z)+support.h*.42+1.525;a.activity=e.window==='spring'&&t%18<2?'signalling':'searching';}}
 }
 const bee=byId('bee'),p=e.cloverIds.map(id=>state.plants.find(p=>p.id===id)),cycle=t%12;
 if(bee&&p.every(Boolean)){const transfer=cycle>=4&&cycle<8,returning=cycle>=10,from=p[0],to=p[1],f=transfer?(cycle-4)/4:returning?1-(cycle-10)/2:cycle>=8?1:0;bee.x=mix(from.x,to.x,f);bee.z=mix(from.z,to.z,f);bee.y=mix(from.y+from.size,to.y+to.size,f)+(transfer||returning?.15*Math.sin(f*Math.PI):0);bee.activity=returning?'returning-to-flower':transfer?'carrying-pollen':cycle<4?'anther-contact':'stigma-contact';bee.plantId=cycle<8?from.id:to.id;}
 const fox=byId('fox'),mouse=e.actors.find(a=>a.taxon==='apodemus_sylvaticus'&&a.alive);if(fox&&mouse){const phase=t%16;mouse.activity=phase>10?'escaping':'searching';mouse.x=-61+Math.sin(t*.4)*.18;fox.activity=phase<8?'stalking':phase<11?'attempting':'resting';fox.x=phase<8?-64+phase*.2:phase<11?mix(-62.4,mouse.x-.06,(phase-8)/3):mix(-61+Math.sin((Math.floor(t/16)*16+11)*.4)*.18-.06,-64,(phase-11)/5);fox.activity=phase>=11?'returning':fox.activity;fox.heading=phase<11?0:Math.PI;}
 const jay=byId('jay');if(jay){const support=state.trees.find(q=>q.id===jay.supportId),phase=t%20;jay.activity=phase<4?'picking':phase<9?'flying':phase<14?'caching':phase<16?'resting':'flying';jay.carryingAcorn=phase>=4&&phase<14;
  if(jay.activity==='flying'){jay.supportId=null;const f=phase>=16?1-(phase-16)/4:(phase-4)/5;jay.x=-38+f*3;jay.z=-9;jay.y=terrainHeight(jay.x,jay.z)+.16+Math.sin(f*Math.PI)*2;jay.heading=phase>=16?Math.PI:0;}else if(phase<4){jay.x=-38;jay.y=terrainHeight(-38,-9)+.16;jay.supportId='ground:oak-clearing';}else{jay.x=-35;jay.y=terrainHeight(-35,-9)+.16;jay.supportId='ground:cache';}
  if(support&&jay.activity==='resting')jay.activity='resting';}
}
export function stepEcology(state,dt,observer={x:0,z:0}){const e=state.ecology;if(!e)return;e.observer=observer;e.tide=tideAt(state.time);updateActors(state,dt);stepCoastal(state,dt,tideAt,emit);
 if(e.window==='summer'){const bee=e.actors.find(a=>a.taxon==='bombus_lapidarius'),phase=state.time%12,previous=e.previousBeePhase??phase;
  if(phase>=4&&previous<4)bee.pollen={plantId:e.cloverIds[0],loadedAt:state.time};
  if(phase>=8&&previous<8&&bee.pollen&&bee.pollen.plantId!==bee.plantId&&e.resources['clover-pollen'].amount>0){emit(state,'bee-clover',[bee.id,bee.pollen.plantId,bee.plantId],'clover-pollen',-1,'pollen-transferred',{startedAt:bee.pollen.loadedAt,sequence:['anther-contact','pollen-carried','stigma-contact'],seedSet:false,nectarRobbery:false});bee.pollen=null;}e.previousBeePhase=phase;
 }
 if(e.window==='dusk'&&state.time%16>=10.7&&e.lastHuntCycle!==Math.floor(state.time/16)&&e.resources['wood-mice'].amount>0){e.lastHuntCycle=Math.floor(state.time/16);const prey=e.actors.find(a=>a.taxon==='apodemus_sylvaticus'&&a.alive),caught=e.lastHuntCycle%2===0;emit(state,'fox-mouse',['compact-fox',prey.id],'wood-mice',caught?-1:0,caught?'caught':'escaped',{technique:'stalk-attempt'});if(caught)prey.alive=false;}
 if(state.time<e.nextEventAt)return;e.nextEventAt=state.time+4;e.cycle++;
 const actor=taxon=>e.actors.find(a=>a.taxon===taxon&&a.visible&&a.alive),resource=(id)=>e.resources[id]?.amount>0;
 if(e.window==='autumn'&&state.time%20>=13&&resource('acorns'))emit(state,'jay-acorn',['compact-jay','support-oak-c'],'acorns',-1,'cached',{destination:'ground:cache',germinated:false});
 if(e.window!=='summer'){
  if(e.window==='spring'&&e.cycle%4===0){const receiver=e.actors.find(a=>a.id==='compact-tit-1');receiver.heading=Math.PI;emit(state,'communication',['compact-tit-0',receiver.id],'signal',0,'signal-followed-by-orientation',{functionHypothesis:'communication; does not prove intention',receiverDelay:1});}return;
 }
 const sequence=e.cycle%6;
 if(sequence===1&&resource('aphid-colony')){const prey=e.actors.find(a=>a.taxon==='aphidoidea'&&a.alive),pred=e.actors.filter(a=>a.taxon==='coccinella_septempunctata')[e.cycle%2];if(Math.hypot(pred.x-prey.x,pred.z-prey.z)<.007){pred.activity='feeding';emit(state,'ladybird-aphid',[pred.id,prey.id],'aphid-colony',-1,'consumed');prey.alive=false;}}
 if(sequence===2&&resource('nettle-leaf'))emit(state,'caterpillar-nettle',['compact-caterpillar',e.nettleId],'nettle-leaf',-1,'leaf-reduced');
 if(sequence===3&&resource('leaf-litter'))emit(state,'worm-litter',['compact-earthworm'],'leaf-litter',-1,'pulled-into-soil',{mineralized:false});
 if(state.deer.activity==='browsing'&&resource('browse-shoot')&&Math.hypot(state.deer.x-state.plants.find(p=>p.id===e.resources['browse-shoot'].id).x,state.deer.z-state.plants.find(p=>p.id===e.resources['browse-shoot'].id).z)<1.5)emit(state,'deer-browse',[state.deer.id,e.resources['browse-shoot'].id],'browse-shoot',-1,'shoot-reduced');
 if(sequence===0){const clam=e.actors.find(a=>a.taxon==='cerastoderma_edule'&&a.activity==='filtering');if(clam&&resource('phytoplankton'))emit(state,'cockle-filtration',[clam.id],'phytoplankton',-1,'particles-removed',{naturalRate:false});if(resource('benthic-diatoms'))emit(state,'snail-grazing',['compact-snail-0'],'benthic-diatoms',-1,'surface-grazed');}
 if(e.cycle%4===0)emit(state,'tick-deer',['compact-tick',state.deer.id],'deer-host',0,'attached-feeding',{cost:'qualitative; not a calibrated blood-loss rate'});
}
export function sampleQuadrat(state,id){const e=state.ecology,q=e.quadrats.find(q=>q.id===id);if(!q)throw Error('Unbekanntes Quadrat.');const individuals=e.actors.filter(a=>a.taxon==='cerastoderma_edule'&&a.alive&&a.sampleGroup===id).map(a=>a.id);return {...q,individualIds:individuals,count:individuals.length,initialSeed:state.initialSeed,worldVersion:state.worldVersion,simulationTime:state.time,source:'model-protocol',window:e.window};}
export function stationSnapshot(state,id='compact-cockle-0',depth=5){if(depth!==5)throw Error('Für den kontrollierten Vergleich gilt 5 cm Untersuchungstiefe.');const a=state.ecology.actors.find(a=>a.id===id&&a.taxon==='cerastoderma_edule');if(!a)throw Error('Kein Individuum an dieser Probenstelle.');return {individualId:a.id,taxon:a.taxon,siteId:'compact-cockle-probe',sampleDepth:depth,present:a.alive,tidePhase:state.ecology.tide.phase,waterLevel:state.ecology.tide.waterLevel,activity:a.activity,sedimentSurface:a.sedimentSurface};}
export function forestMeasurement(state,x,z){const near=state.plants.filter(p=>Math.hypot(p.x-x,p.z-z)<3);return {siteId:x<-49?'compact-forest-core':'compact-forest-edge',x,z,relativeLight:x<-49?.18:.72,moistureClass:x<-49?'fresh':'fresh-to-moist',plantPatchIds:near.map(p=>p.id),source:'model-protocol',units:{relativeLight:'fraction of open model light; not lux',moistureClass:'ordinal; not water concentration'}};}
export function competitionExperiment({competitor=true,intraspecific=false,tide='exposed',seed=20260825,initial=12}={}){if(!Number.isSafeInteger(seed)||!Number.isInteger(initial)||initial<1||initial>100||!['exposed','covered'].includes(tide))throw Error('Ungültiger Versuchsparameter.');const r=rng(seed),rows=[];let amount=initial,focal=0,other=0;for(let t=0;t<12;t++){const accessible=intraspecific||tide==='exposed';if(accessible&&amount>0&&r()>.15){amount--;focal++;}if(accessible&&competitor&&amount>0){amount--;other++;}rows.push({t,remaining:amount,focal,other});}return {source:'controlled-model',seed,initial,competitor,intraspecific,tide,resource:intraspecific?'aphid-colony':'shared-mussels',resourceSizes:intraspecific?'model aphids':'20–40 mm mussels',units:'one encounter step; synthetic count',rows,yield:focal,competitorYield:other,remaining:amount,limit:'Designed exploitative-competition rule; not empirical validation or a local rate estimate'};}
