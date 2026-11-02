import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js?revision=120';
import {CATALOG} from '../dist/compact/catalog.js';
import {createOrganism} from '../dist/compact/organism-models.js';
import {animateSecondaryMotion} from '../dist/compact/secondary-motion.js';
import {butterflyWingGeometry} from '../dist/compact/organic-geometry.js';
import {scenicSurface} from '../dist/compact/scenic-materials.js';
const external=new Set(['capreolus_capreolus','vulpes_vulpes','dendrocopos_major']);let checked=0;
for(const taxon of Object.keys(CATALOG)){
 if(external.has(taxon))continue;
 for(const stage of taxon==='aglais_io'?['adult','caterpillar']:['adult']){
  const model=createOrganism(taxon,stage);model.updateMatrixWorld(true);
  assert(!new THREE.Box3().setFromObject(model).isEmpty());
  model.traverse(m=>{if(!m.isMesh)return;assert(m.geometry.attributes.position.array.every(Number.isFinite));for(const material of Array.isArray(m.material)?m.material:[m.material]){assert(material.userData.scenicSurface);assert(material.customProgramCacheKey().startsWith('ranger-scenic-v1'));}});checked++;
 }
}
for(const side of [-1,1]){const g=butterflyWingGeometry(side,true),mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial());mesh.updateMatrixWorld(true);const hits=new THREE.Raycaster(new THREE.Vector3(.25,1,side*.5),new THREE.Vector3(0,-1,0)).intersectObject(mesh);assert(hits.length>0,'Both forewing surfaces must actually be visible from above, not just their floating eyespots');g.dispose();mesh.material.dispose();}
const material=new THREE.MeshStandardMaterial();let existing=false;material.onBeforeCompile=()=>{existing=true;};scenicSurface(material,'shell');const shader={vertexShader:'#include <begin_vertex>',fragmentShader:'#include <color_fragment>'};material.onBeforeCompile(shader);assert(existing,'Preserve preexisting inner-valve colour shader');assert(shader.fragmentShader.includes('surfaceNoise'));
const mouse=createOrganism('apodemus_sylvaticus'),actor={taxon:'apodemus_sylvaticus',x:0,z:0,size:.095,activity:'searching'};
animateSecondaryMotion(mouse,actor,0);const rest=mouse.bodyMesh.geometry.attributes.position.array.slice();animateSecondaryMotion(mouse,actor,1);assert.deepEqual(mouse.bodyMesh.geometry.attributes.position.array,rest,'No foot motion when stationary');actor.x=.01;animateSecondaryMotion(mouse,actor,2);assert.notDeepEqual(mouse.bodyMesh.geometry.attributes.position.array,rest,'Actual movement articulates feet');animateSecondaryMotion(mouse,actor,3);assert.deepEqual(mouse.bodyMesh.geometry.attributes.position.array,rest,'Stop restores grounded pose');actor.x=0;animateSecondaryMotion(mouse,actor,0);assert.deepEqual(mouse.bodyMesh.geometry.attributes.position.array,rest,'New context must not invent travel');
console.log(JSON.stringify({passed:true,proceduralTaxaAndStages:checked,externalModels:'covered by compact-render-reset',checks:['finite geometries','material coverage','existing shader preserved','movement-driven gait','stop and context reset']}));
