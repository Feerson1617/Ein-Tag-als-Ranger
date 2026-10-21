import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as T from '../dist/vendor/three.module.js?revision=120';
import {ANIMALS} from '../dist/biodiversity.js';
import {AUTHORED_WILDLIFE,readWildlifeGLB,prepareAuthoredWildlife} from '../dist/authored-wildlife.js?revision=121';
import {WildlifeRenderer} from '../dist/wildlife.js';
import {motionShader,prepareLegRig} from '../dist/wildlife-motion.js';
import {flightFeather} from '../dist/flight-feathers.js';

const report=[];
for(const [id,path] of Object.entries(AUTHORED_WILDLIFE)){
 const bytes=await fs.readFile(new URL('../dist/'+path.slice(2),import.meta.url)),buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),g=readWildlifeGLB(buffer,id),s=ANIMALS[id];
 assert.ok(Math.abs(g.boundingBox.max.x-g.boundingBox.min.x-s.size)<1e-5,id+' scale');assert.ok(Math.abs(g.boundingBox.min.y)<1e-6,id+' ground origin');
 assert.ok(g.index.count/3<10000,id+' tablet budget');assert.ok(g.attributes.position.count<65535);
 const parts=new Set(g.attributes.rigData.array.filter((_,i)=>i%4===0));assert.ok(parts.has(6)&&parts.has(0));
 let blended=0;for(let i=0;i<g.attributes.rigData.count;i++)if(g.attributes.rigData.getX(i)===6&&g.attributes.rigJoint.getW(i)<.99&&g.attributes.rigJoint.getW(i)>.001)blended++;
 assert.ok(blended>10,id+' continuous neck weight');
 if(s.form==='seal'){let belly=Infinity;for(let i=0;i<g.attributes.position.count;i++)if(g.attributes.rigData.getX(i)===0)belly=Math.min(belly,g.attributes.position.getY(i));assert.ok(belly<s.size*.02,id+' belly lifted by flippers');}
 const rig=prepareLegRig(g,s);if(s.form!=='seal'){assert.equal(rig.legs.length,4);for(const leg of rig.legs){assert.ok(leg.length>0&&leg.clearance>0);assert.ok(leg.foot.every(Number.isFinite));}}
 assert.throws(()=>readWildlifeGLB(buffer,'wrong-species'));const broken=buffer.slice(0);new DataView(broken).setUint32(8,4,true);assert.throws(()=>readWildlifeGLB(broken,id));
 const shader={vertexShader:'#include <beginnormal_vertex>\n#include <begin_vertex>',uniforms:{}};motionShader(shader,s,rig);assert.ok(shader.vertexShader.includes('headAngle()*headWeight()'));assert.ok(shader.vertexShader.includes('footTarget()'));
 report.push({species:id,triangles:g.index.count/3,blendedNeckVertices:blended,legs:rig.legs.length});g.dispose();
}
let inFlight=0,peak=0,injectedFailure=false;const attempts=new Map();
globalThis.fetch=async path=>{inFlight++;peak=Math.max(peak,inFlight);attempts.set(path,(attempts.get(path)||0)+1);try{if(!injectedFailure){injectedFailure=true;throw new TypeError('simulated transient connection failure');}const b=await fs.readFile(new URL('../dist/'+path.slice(2),import.meta.url));return {ok:true,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)};}finally{inFlight--;}};
await prepareAuthoredWildlife();assert.ok(peak<=2,'Unbounded startup model downloads');assert.equal(attempts.get(AUTHORED_WILDLIFE.fox),2,'Transient connection failure is not recovered');
T.TextureLoader.prototype.load=()=>new T.Texture();globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}})})};
const actors=Object.keys(AUTHORED_WILDLIFE).map((species,i)=>({id:i+1,species,habitat:ANIMALS[species].form==='seal'?'wadden':'forest',alive:true,x:i*2,z:0,heading:0,trait:1,age:0,phase:1.3,pigment:1,activity:'walking'}));
const render=new WildlifeRenderer(new T.Scene(),actors);for(const a of actors){const b=render.batches.get(a.species);assert.equal(b.mesh.geometry.userData.authored,true);assert.equal(b.mesh.material.map,render.coat);assert.ok(Object.keys(b.mesh.geometry.attributes).length+4<=16,'WebGL vertex attribute budget');}
for(let frame=0;frame<120;frame++){for(const a of actors){a.age+=1/30;a.x+=.004;a.z=.035*Math.sin(frame*.03);}render.update(()=>0,()=>-1,null);for(const a of actors){assert.equal(a.renderIndex,0);assert.ok(Number.isFinite(a.y));assert.ok([...a.motion.footTargets].every(Number.isFinite));}}
for(const b of render.batches.values())assert.equal(Object.keys(b.mesh.geometry.attributes).length+4+Number(!!b.mesh.instanceColor),16,'Pigmented individual exhausts the WebGL attribute budget');
const feather=flightFeather([0,0,.17],[-.25,.005,.41],.027);assert.ok([...feather.attributes.normal.array].every(Number.isFinite));assert.ok(feather.attributes.position.count<100);feather.dispose();render.dispose();
console.log(JSON.stringify({models:report,renderedFrames:120,identityAndInstancing:true,maxVertexAttributes:16,parserBoundsAndSpeciesGuard:true,concurrentDownloads:peak,transientNetworkRetry:true},null,2));
