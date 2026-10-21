import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import { HabitatWorld,CENTERS,groundHeight } from '../dist/habitat-world.js';
import { createExpeditionSimulations } from '../dist/expedition-state.js';
import { ANIMALS,PLANTS,HABITATS } from '../dist/biodiversity.js';
import { ExpeditionEcology,FieldJournal } from '../dist/field-ecology.js';
import { WildlifeRenderer } from '../dist/wildlife.js';
import { sealGap,focusCandidateScore,binocularAperture } from '../dist/observation-tools.js';
import { boardIllustration,activeHabitatBoards } from '../dist/field-boards.js';
import { START_GUIDE } from '../dist/field-guide.js';
T.TextureLoader.prototype.load=function(){return new T.Texture();};
globalThis.document={createElement:()=>({getContext:()=>({measureText:s=>({width:s.length*20}),fillRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}})})};
const world=new HabitatWorld(new T.Scene()),{simulations,agents}=createExpeditionSimulations(world,-.7);
assert.equal(world.village.houses.length,5);assert.equal(world.village.streets.length,1);
for(const p of world.village.houses){assert.ok(Math.abs(p.x-CENTERS.city.x)<12&&Math.abs(p.z)<19);assert.ok(p.width<6&&p.depth<5);assert.ok(p.base>=groundHeight(p.x,p.z));assert.equal(world.canWalk(p.x,p.z),false);const collider=world.collisions.find(c=>c.type==='house'&&c.x===p.x&&c.z===p.z);assert.ok(collider.halfX&&collider.halfZ);}
assert.ok(world.plants.filter(p=>p.garden).length>250);for(const p of world.plants.filter(p=>p.garden)){assert.ok(PLANTS[p.id].habitats.includes('city'));assert.equal(world.onLanding(p.x,p.z,0),false);}
const hiveBoard=world.boards.find(b=>b.id==='city-hive');assert.ok(hiveBoard&&Math.hypot(hiveBoard.x-world.hives[0].x,hiveBoard.z-world.hives[0].z)<12);
assert.ok(world.boards.length<44);for(const h of HABITATS)assert.ok(world.boards.some(b=>b.habitat===h.id&&b.station));
for(const b of world.boards){assert.ok(b.body?.length>0);if(b.id==='forest-deadwood')assert.ok(Math.hypot(b.x-b.featurePosition.x,b.z-b.featurePosition.z)<5);if(b.diagram&&b.diagram!=='habitat')assert.ok(boardIllustration(b).includes('role="img"'));}
for(const s of [...Object.values(ANIMALS),...Object.values(PLANTS)])assert.ok(s.description.length>30&&s.recognition.length>15&&s.concept.length>10,s.id+' lacks a descriptive species profile');
assert.deepEqual(START_GUIDE.steps.map(x=>x[0]),['Fernglas','Lupe','Questbuch','Karte']);
assert.ok(focusCandidateScore(.09,.1,false)>focusCandidateScore(.01,.1,false));assert.ok(focusCandidateScore(.09,.1,false)<focusCandidateScore(.01,.1,true,true),'Unknown species wins over a centred, known automatic lock');assert.ok(focusCandidateScore(.02,.1,false,true)<focusCandidateScore(.03,.1,false),'Keep the same unknown individual during identification');
for(const zoom of [1,3,8]){const aperture=binocularAperture(zoom,.2,20);assert.ok(aperture<Math.sin(62/zoom*.5*Math.PI/180));assert.ok(aperture>2*(.05/zoom+.055/20));}
const city=simulations.get('city');city.activateSpecies(['apis_mellifera']);const bees=city.agents.filter(a=>a.hiveWorker),ids=bees.map(a=>a.id);assert.equal(bees.length,8);let visits=0,transfers=0,returns=0;
for(let n=0;n<12000;n++){city.update(.05,null);for(const a of bees){if(a.activity==='pollinating')visits++;if(a.activity==='returning')returns++;}transfers=Math.max(transfers,city.patches.reduce((sum,p)=>sum+(p.pollenTransfers||0),0));}
assert.ok(visits>0&&returns>0);assert.ok(transfers>0,'Pollen must move between actual plants of the same species');assert.ok(city.hiveBees.deliveries>0&&city.hiveBees.stock>0,'The same workers actually return and deliver finite collected food');assert.deepEqual(bees.map(a=>a.id),ids);assert.ok(bees.every(a=>a.alive));
const journal=new FieldJournal(),a=bees[0];let result;for(let n=0;n<100;n++){result=journal.observe(a,.05,'city');if(result?.kind==='species')break;}assert.equal(result.key,'apis_mellifera');assert.ok(journal.entries.apis_mellifera);
const sealSim=new ExpeditionEcology('beach',913);sealSim.agents=sealSim.agents.filter(a=>ANIMALS[a.species].form==='seal');for(const [i,a]of sealSim.agents.entries()){a.x=0;a.z=0;a.heading=i*.8;a.homeX=0;a.homeZ=0;}
sealSim.settleSeals();let minGap=Infinity;const sealIDs=sealSim.agents.map(a=>a.id);for(let n=0;n<6000;n++){sealSim.update(.05,null);if(n%10)continue;const seals=sealSim.agents.filter(a=>a.alive);for(let i=0;i<seals.length;i++)for(let j=i+1;j<seals.length;j++){const gap=sealGap(seals[i],seals[j],ANIMALS[seals[i].species],ANIMALS[seals[j].species]);minGap=Math.min(minGap,gap);assert.ok(gap>-.015,'Seal bodies intersect while moving or turning');}}
assert.deepEqual(sealSim.agents.map(a=>a.id),sealIDs);
const renderer=new WildlifeRenderer(new T.Scene(),sealSim.agents);for(const [id,b]of renderer.batches){b.mesh.geometry.computeBoundingBox();const bounds=b.mesh.geometry.boundingBox;assert.ok(bounds.min.y>=-1e-5);assert.ok(Math.abs(bounds.max.x-bounds.min.x-ANIMALS[id].size)<.02);assert.ok(bounds.max.y<ANIMALS[id].size*.40);}
console.log(JSON.stringify({version:'0.14',cottages:world.village.houses.length,gardenPlants:world.plants.filter(p=>p.garden).length,boards:world.boards.length,sealMinimumBodyGap:minGap,sealIdentity:'unchanged after five minutes',bees:{workers:bees.length,deliveries:city.hiveBees.deliveries,foodStock:city.hiveBees.stock,pollenTransfers:transfers},focusing:'unknown priority, stable identity, enlarged visible capture',journal:'all 168 species have descriptive profiles, actual bee sighting unlocks the entry'},null,2));
