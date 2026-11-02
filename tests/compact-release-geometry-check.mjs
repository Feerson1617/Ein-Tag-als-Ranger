import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js?revision=120';
import {sweptGeometry,plantGeometry}from'../dist/compact/geometry.js';
import {terrainHeight,PATHS,routeMetrics}from'../dist/compact/layout.js';
import {createReferenceState}from'../dist/compact/world-state.js';
import {createEcology}from'../dist/compact/ecology.js';
const g=sweptGeometry([[0,0,0],[0,.5,0],[0,1,0]],[.1,.08,.04],8),mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial());mesh.updateMatrixWorld(true);
for(const [x,z]of[[1,0],[-1,0],[0,1],[0,-1]]){const ray=new THREE.Raycaster(new THREE.Vector3(x,.4,z),new THREE.Vector3(-x,0,-z));assert(ray.intersectObject(mesh).length,'Curved stems must be front-facing from every side');}
for(const path of PATHS)for(const p of path)assert.equal(terrainHeight(p.x,p.z,8),terrainHeight(p.x,p.z,7),'Native route heights unchanged');
assert(routeMetrics().maxSlope<.16);assert(terrainHeight(9,40,8)-terrainHeight(9,40,7)>1);
for(let x=18;x<=80;x+=.5)for(let z=-50;z<=50;z+=2)assert.equal(terrainHeight(x,z,8),terrainHeight(x,z,7),'Tidal habitat height immutable');
for(const seed of[20260825,77,123]){const a=createReferenceState(seed,7),b=createReferenceState(seed,8);createEcology(a);createEcology(b);for(const k of['trees','plants','supports','deer','bird'])assert.deepEqual(a[k],b[k],k);assert.deepEqual(a.ecology,b.ecology,'No changed actors, resources or biology');}
for(const taxon of['halimione_portulacoides','salicornia_europaea','sporobolus_anglicus','festuca_rubra','puccinellia_maritima','limonium_vulgare'])for(const detail of['near','middle','far']){const p=plantGeometry(taxon,1,'summer',detail);assert(p.attributes.position.array.every(Number.isFinite));assert(p.attributes.position.count/3<5000,'Bounded plant tessellation');}
console.log(JSON.stringify({passed:true,checks:['outward curved-stem surfaces','identical route elevations and slope','unchanged coastal heights','three seeds revision7–8 exact biological inventories','bounded species-specific plant LOD']}));
