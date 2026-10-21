import * as THREE from './vendor/three.module.js?revision=120';
import { TerrainContact } from './terrain-contact.js?revision=120';

// Four small physical excavations. Only moving soil uploads geometry; the
// original terrain shader discards each circular opening at fragment precision.
export class SedimentExcavation {
 constructor(world,spots){
  this.world=world;this.rawHeight=world.terrainHeight.bind(world);
  this.uniform={value:spots.map(s=>new THREE.Vector4(s.x,s.z,.62,0))};
  this.holes=spots.map((spot,index)=>{
   const geometry=new THREE.PlaneGeometry(1.7,1.7,40,40);geometry.rotateX(-Math.PI/2);
   const p=geometry.attributes.position,baseline=new Float32Array(p.count),radius=new Float32Array(p.count),colors=[];
   for(let i=0;i<p.count;i++){const x=p.getX(i)+spot.x,z=p.getZ(i)+spot.z;baseline[i]=this.rawHeight(x,z)+.002;radius[i]=Math.hypot(p.getX(i),p.getZ(i));p.setY(i,baseline[i]);const t=Math.min(1,Math.max(0,(radius[i]-.40)/.40));colors.push(.77+.23*t,.75+.25*t,.68+.32*t);}
   geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
   geometry.computeVertexNormals();
   const material=world.terrainMaterial(2,world.terrainAtlas,{vertexColors:true,roughness:.72,side:THREE.DoubleSide}),compile=material.onBeforeCompile,key=material.customProgramCacheKey();
   material.onBeforeCompile=shader=>{compile(shader);shader.vertexShader='varying vec2 sampleLocal;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nsampleLocal=transformed.xz;');shader.fragmentShader='varying vec2 sampleLocal;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(length(sampleLocal)>.83)discard;');};material.customProgramCacheKey=()=>key+'-round-soil-sample';
   const mesh=new THREE.Mesh(geometry,material);mesh.visible=false;
   mesh.position.set(spot.x,0,spot.z);mesh.receiveShadow=true;mesh.userData.excavation=spot.id;world.root.add(mesh);
   return{spot,index,mesh,baseline,radius,contact:new TerrainContact(geometry,spot),depth:0,from:0,target:0,elapsed:1,duration:.85};
  });
  world.root.traverse(mesh=>{if(mesh.userData.terrainGround)this.cutMaterial(mesh.material);});
  world.excavation=this;
 }
 cutMaterial(material){
  if(material.userData.excavationMask)return;material.userData.excavationMask=true;
  const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
  material.onBeforeCompile=shader=>{
   compile(shader);shader.uniforms.excavationHoles=this.uniform;
   shader.vertexShader='varying vec2 excavationWorld;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nexcavationWorld=(modelMatrix*vec4(transformed,1.0)).xz;');
   shader.fragmentShader='uniform vec4 excavationHoles[4];\nvarying vec2 excavationWorld;\n'+shader.fragmentShader;
   const masks=this.holes.map((_,i)=>`if(excavationHoles[${i}].w>0.00001 && distance(excavationWorld,excavationHoles[${i}].xy)<excavationHoles[${i}].z)discard;`).join('\n');
   shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\n'+masks);
  };
  material.customProgramCacheKey=()=>key+'-four-excavations';material.needsUpdate=true;
 }
 dig(spot,centimetres){const hole=this.holes.find(h=>h.spot===spot);hole.from=hole.depth;hole.target=Math.min(.35,Math.max(0,centimetres/100));hole.elapsed=0;}
 update(dt){
  for(const hole of this.holes){
   if(hole.depth===hole.target)continue;
   hole.elapsed=Math.min(hole.duration,hole.elapsed+dt);const t=hole.elapsed/hole.duration,ease=t*t*(3-2*t);
   hole.depth=hole.elapsed===hole.duration?hole.target:hole.from+(hole.target-hole.from)*ease;
   const geometry=hole.mesh.geometry,p=geometry.attributes.position;
   for(let i=0;i<p.count;i++){
    const r=hole.radius[i],u=Math.min(1,Math.max(0,(r-.36)/.26)),bowl=1-u*u*(3-2*u);
    const spoil=Math.max(0,1-Math.abs(r-.70)/.13)*hole.depth*.12;
    p.setY(i,hole.baseline[i]-hole.depth*bowl+spoil);
   }
   p.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();this.uniform.value[hole.index].w=hole.depth;hole.mesh.visible=hole.depth>0;
  }
 }
 at(x,z){const hole=this.holes.find(h=>h.depth>0&&Math.hypot(x-h.spot.x,z-h.spot.z)<.62);return hole?.contact.at(x,z)??null;}
}
