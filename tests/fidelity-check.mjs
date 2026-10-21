import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {HabitatWorld,CENTERS,groundHeight} from '../dist/habitat-world.js';
import {createExpeditionSimulations} from '../dist/expedition-state.js';
import {ANIMALS,PLANTS} from '../dist/biodiversity.js';
import {QuestBook,QUESTS} from '../dist/quests.js';
import {InteractionScenarios,SCENARIOS} from '../dist/interaction-scenarios.js';
import {QuestInterface} from '../dist/quest-interface.js';
import {EvolutionCollection} from '../dist/field-evolution.js';
import {FieldJournal} from '../dist/field-ecology.js';
import {WattSurvey} from '../dist/field-sampling.js';
import {TRAIL_LENGTH} from '../dist/trail.js';
import {walkingInput,stickInput,SPRINT_SPEED} from '../dist/ranger-controls.js';
import {birdPalette} from '../dist/bird-plumage.js';
import {curvedLeaf} from '../dist/curved-leaves.js';
import {botanicalGeometry} from '../dist/plant-forms.js';
import {SPECIES_PHOTOS} from '../dist/species-photos.js';
import {speciesPhotoHtml} from '../dist/species-photo-view.js';
T.TextureLoader.prototype.load=()=>new T.Texture();const elements=new Map();
const get=id=>{if(!elements.has(id))elements.set(id,{dataset:{},classList:{toggle(){}},setAttribute(){},addEventListener(){}});return elements.get(id);};
globalThis.document={getElementById:get,body:{classList:{contains:()=>false}},createElement:()=>({getContext:()=>({measureText:s=>({width:s.length*20}),fillRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}})})};
const scene=new T.Scene(),world=new HabitatWorld(scene),{simulations}=createExpeditionSimulations(world,-.8),evolution=new EvolutionCollection(simulations),book=new QuestBook(simulations,evolution),scenarios=new InteractionScenarios(simulations),journal=new FieldJournal();
const ui=new QuestInterface({scene,book,journal,observer:{x:0,z:0},openPanel(){},escape:String,toast(){},onChange(){},onFocus(){},onMode(){}});
let markerChecks=0;
for(const mode of SCENARIOS){scenarios.start(mode.id,book);assert.deepEqual(book.partners(),[]);ui.updateScenarioMarkers();assert.equal(ui.scenarioShafts.count,0);
 for(const q of mode.quests){book.select(q.id);const partners=book.partners();assert.ok(partners.length>=2,q.id+' has no observable partners');
  for(const p of partners){assert.ok(q.species.includes(p.species),q.id+' marks unrelated '+p.species);assert.equal(p.habitat,q.habitat);if(p.focusType==='plant')assert.ok(p.instance&&world.plants.includes(p.instance),'Plant beam must identify a real botanical instance');else assert.ok(book.active.contexts.some(c=>c.actors.includes(p.id)),'Beam is not a member of the selected encounter');}
  ui.updateScenarioMarkers();const rows=JSON.parse(get('world').dataset.questMarkers);assert.ok(rows.every(p=>p.quest===q.id&&q.species.includes(p.species)));markerChecks+=rows.length;
  book.active.done=true;ui.updateScenarioMarkers();assert.equal(ui.scenarioShafts.count,0,'Completed quest leaves stale beams');
 }
 book.cancel();ui.updateScenarioMarkers();assert.equal(ui.scenarioRings.count,0);
}
scenarios.start(null,book);
for(const q of QUESTS){book.select(q.id);for(const p of book.partners()){const contexts=book.active.contexts.filter(c=>c.habitat===p.habitat&&c.species.includes(p.species));assert.ok(contexts.length,q.id+' marks unrelated species');markerChecks++;}book.cancel();}
assert.equal(Object.keys(journal.entries).length,0,'Selection must not unlock species');
assert.equal(SPRINT_SPEED,5*1.5);const keys=new Set();for(const amount of [.25,.5,.75,1]){const input=walkingInput({x:0,y:amount},keys);assert.equal(input.speed,SPRINT_SPEED*amount);assert.equal(input.forward,1);}
assert.equal(walkingInput({x:1,y:1},keys).speed,SPRINT_SPEED,'Diagonal tablet motion must not exceed the limit');
assert.equal(walkingInput({x:0,y:0},new Set(['w','shift'])).speed,7.5);
assert.equal(walkingInput({x:0,y:1},keys,true).speed,1.05);
assert.equal(stickInput(0,0,64).y,0);assert.equal(stickInput(0,-42,64).y,1);
const birds=Object.values(ANIMALS).filter(s=>s.type==='bird');for(const s of birds){const c=birdPalette(s);assert.ok(c.wing&&c.primary);}
const oyster=birdPalette(ANIMALS.haematopus_ostralegus);assert.equal(oyster.wing,oyster.back);assert.notEqual(oyster.wing,oyster.beak);assert.equal(oyster.wingBar,'#eeece4');
assert.equal(birdPalette(ANIMALS.turdus_merula).wing,'#22241e');assert.equal(birdPalette(ANIMALS.larus_canus).head,'#eeece4');
let foundationSamples=0;for(const h of world.village.houses){for(let u=-h.width/2;u<=h.width/2;u+=.18)for(let v=-h.depth/2;v<=h.depth/2;v+=.18){const x=h.x+Math.cos(h.rotation)*u+Math.sin(h.rotation)*v,z=h.z-Math.sin(h.rotation)*u+Math.cos(h.rotation)*v,y=world.terrainHeight(x,z);assert.ok(h.foundationBottom<y-.17,'House foundation floats above visible soil');assert.ok(h.base>=y+.01,'Soil penetrates the house floor');foundationSamples++;}}
scene.updateMatrixWorld(true);const ray=new T.Raycaster();let deckSamples=0,maxDeckMismatch=0;
for(let d=.17;d<TRAIL_LENGTH;d+=.77){const p=world.deck.section(d);for(const u of [-1.22,0,1.22]){const x=p.x+p.tz*u,z=p.z-p.tx*u;ray.set(new T.Vector3(x,20,z),new T.Vector3(0,-1,0));const hit=ray.intersectObject(world.boardwalkSurface)[0];assert.ok(hit,'Rendered boardwalk opening at '+d);assert.ok(Math.abs(hit.point.y-(world.walkHeight(x,z)-.018))<.05,JSON.stringify({d,u,expected:p.y-.018,actual:hit.point.y,walk:world.walkHeight(x,z),x,z}));maxDeckMismatch=Math.max(maxDeckMismatch,Math.abs(hit.point.y-(world.walkHeight(x,z)-.018)));deckSamples++;}}
for(const bay of world.landings){const p=world.deck.section(bay.distance),u=bay.side*4.9;ray.set(new T.Vector3(p.x+p.tz*u,20,p.z-p.tx*u),new T.Vector3(0,-1,0));assert.ok(ray.intersectObject(world.boardwalkSurface).length,'Bay has a hole');deckSamples++;}
const leaf=curvedLeaf(.3,.13,true),pos=leaf.attributes.position;leaf.computeBoundingBox();assert.ok(leaf.boundingBox.max.z-leaf.boundingBox.min.z>.04,'Petals are planar');assert.ok([...pos.array].every(Number.isFinite));
let flowerSpecies=0;for(const s of Object.values(PLANTS).filter(s=>s.form==='flower')){const g=botanicalGeometry(s);assert.ok(g.userData.flowering);if(!['urtica_dioica','artemisia_maritima','plantago_lanceolata','plantago_maritima'].includes(s.id))assert.ok(g.userData.flowerTargets.length,s.id+' has no pollinator contact points');assert.ok(g.boundingBox.max.y-g.boundingBox.min.y>.1);g.dispose();flowerSpecies++;}leaf.dispose();
const survey=new WattSurvey(simulations.get('wadden'),world),s=survey.spots[0],original=survey.excavation.rawHeight(s.x,s.z);let holeSamples=0;
for(const depth of [0,5,10,20,30,35]){
 const previous=world.terrainHeight(s.x,s.z),result=survey.dig({x:s.x,z:s.z},depth,-.8);assert.ok(result.ok);assert.equal(result.depth,depth);survey.update(.1);
 if(depth)assert.ok(world.terrainHeight(s.x,s.z)>original+.002-depth/100+.001,'Soil must animate before reaching full depth');
 for(let n=0;n<20;n++)survey.update(.05);
 const hole=survey.excavation.holes[0];assert.equal(hole.depth,depth/100);assert.ok(Math.abs(world.terrainHeight(s.x,s.z)-(original+(depth?.002:0)-depth/100))<1e-6);
 for(const a of survey.specimens.filter(a=>a.sampleSpot===s&&a.revealed)){assert.ok(Math.abs(a.surveyY-world.terrainHeight(a.x+a.offsetX,a.z+a.offsetZ)-.006)<1e-9);}
 hole.mesh.updateMatrixWorld(true);ray.set(new T.Vector3(s.x,10,s.z),new T.Vector3(0,-1,0));const hit=ray.intersectObject(hole.mesh)[0];assert.ok(Math.abs(hit.point.y-hole.contact.at(s.x,s.z))<1e-6,'Physical hole differs from visible triangles');holeSamples++;
}
assert.ok(survey.specimens.filter(a=>a.sampleSpot===s).every(a=>a.revealed));assert.equal(survey.excavation.holes[1].depth,0,'One sample digs a different spot');
const identities=survey.specimens.map(a=>[a.id,a.x,a.z]);for(let n=0;n<100;n++)simulations.get('wadden').update(.05,null);assert.deepEqual(survey.specimens.map(a=>[a.id,a.x,a.z]),identities,'Exposed specimens move away from their hole or get replaced');
let masks=0;world.root.traverse(m=>{if(m.userData.terrainGround){assert.ok(m.material.userData.excavationMask);const shader={uniforms:{},vertexShader:'#include <begin_vertex>',fragmentShader:'#include <clipping_planes_fragment>\n#include <map_fragment>'};m.material.onBeforeCompile(shader);assert.equal(shader.uniforms.excavationHoles.value.length,4);assert.ok(shader.fragmentShader.includes('discard'));masks++;}});assert.equal(masks,9);
assert.equal(Object.keys(SPECIES_PHOTOS).length,Object.keys(ANIMALS).length+Object.keys(PLANTS).length,'Every fieldbook taxon needs its own verified photograph');
for(const [id,p]of Object.entries(SPECIES_PHOTOS)){const data=fs.readFileSync(new URL('../dist/'+p.url,import.meta.url));assert.ok(data[0]===255&&data[1]===216,id+' is not a JPEG');assert.ok(p.author&&p.license&&p.source&&p.licenseUrl,id+' lacks attribution');assert.ok(!/illustration|drawing|engraving|lithograph/i.test(p.description));assert.equal(speciesPhotoHtml(ANIMALS[id]||PLANTS[id],null,String),'','Undiscovered photograph reveals an unknown taxon');}
console.log(JSON.stringify({version:'0.17',scenarioPairs:SCENARIOS.reduce((n,s)=>n+s.quests.length,0),markerChecks,foundationSamples,deckSamples,maxDeckMismatch,birdPalettes:birds.length,flowerSpecies,holeSamples,terrainMasks:masks,photographs:Object.keys(SPECIES_PHOTOS).length,sprint:7.5,tablet:'linear proportional speed, capped diagonals',digging:'animated physical floor; independent samples; persistent specimens; depths 0–35 cm'},null,2));
