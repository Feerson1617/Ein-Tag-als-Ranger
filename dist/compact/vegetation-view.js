import * as THREE from '../vendor/three.module.js?revision=120';
import { scenicSurface } from './scenic-materials.js';
import { GeometryBatch,leafGeometry,plantGeometry,plantVariant,bendPlantGeometry,stick } from './geometry.js';

// Detail changes only representation. Every cell retains the same fixed rows,
// matrices and individual IDs, including instances hidden for browsing damage.
export function vegetationDetail(distance){return distance<10?'near':distance<36?'middle':'far';}
function simplePlant(taxon,detail,window){
 if(['halimione_portulacoides','salicornia_europaea','sporobolus_anglicus','festuca_rubra','puccinellia_maritima','limonium_vulgare'].includes(taxon))return plantGeometry(taxon,1,window,detail);
 const b=new GeometryBatch(),grass=['festuca_rubra','puccinellia_maritima','sporobolus_anglicus'].includes(taxon),shrub=['rubus_fruticosus','halimione_portulacoides'].includes(taxon),nettle=taxon==='urtica_dioica',color=taxon==='halimione_portulacoides'?'#a5ad92':grass?'#7c8c58':nettle?'#447037':'#547840';
 if(grass){for(let i=0;i<(detail==='middle'?7:3);i++)b.add(leafGeometry(.7+(i%3)*.12,.035,false,false,3),color,[0,.01,0],[1,1,1],[-.35,i*2.399,0]);}
 else{stick(b,[0,0,0],[0,shrub?.75:1,0],shrub?.018:.008,'#6a7847');for(let level=0;level<(detail==='middle'?3:2);level++){const count=shrub?5:nettle?2:6;for(let i=0;i<count;i++)b.add(leafGeometry(shrub?.4:nettle?.37:.42,shrub?.19:nettle?.23:.10,nettle,false,3),color,[0,.18+level*.27,0],[1,1,1],[-.15,i/count*Math.PI*2+level*.3,0]);}}
 return b.geometry();
}
export function createVegetationView(scene,plants){
 const cells=new Map(),cache=new Map(),material=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),dummy=new THREE.Object3D();
 scenicSurface(material,'leaf');
 const geometry=(taxon,detail,window,variant=0)=>{const key=[taxon,detail,window,variant].join(':');if(!cache.has(key))cache.set(key,detail==='near'?plantGeometry(taxon,1,window,'near',variant):bendPlantGeometry(simplePlant(taxon,detail,window),variant));return cache.get(key);};
 for(const p of plants){const key=[p.taxon,Math.floor(p.x/8),Math.floor(p.z/8)].join(':');if(!cells.has(key))cells.set(key,[]);cells.get(key).push(p);}
 const meshes=[];
 for(const rows of cells.values()){
  const taxon=rows[0].taxon,cx=rows.reduce((s,p)=>s+p.x,0)/rows.length,cz=rows.reduce((s,p)=>s+p.z,0)/rows.length,m=new THREE.InstancedMesh(geometry(taxon,'far','summer',plantVariant(rows[0])),material,rows.length);
  m.userData={taxon,rows,cx,cz,detail:'far',window:'summer',variant:plantVariant(rows[0])};
  for(let i=0;i<rows.length;i++){const p=rows[i];dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.angle,0);dummy.scale.setScalar(p.size);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);}
  m.computeBoundingSphere();m.castShadow=false;m.receiveShadow=true;scene.add(m);meshes.push(m);
 }
 let lastX=Infinity,lastZ=Infinity,lastWindow='';
 function update(observer,window){
  if(Math.hypot(observer.x-lastX,observer.z-lastZ)<1&&window===lastWindow)return;
  lastX=observer.x;lastZ=observer.z;lastWindow=window;
  for(const m of meshes){const d=Math.hypot(observer.x-m.userData.cx,observer.z-m.userData.cz),detail=m.userData.rows.some(p=>Math.hypot(p.x-observer.x,p.z-observer.z)<=9)?'near':vegetationDetail(d);m.visible=d<70;if(detail!==m.userData.detail||window!==m.userData.window){m.geometry=geometry(m.userData.taxon,detail,window,m.userData.variant);m.userData.detail=detail;m.userData.window=window;}}
 }
 return {meshes,update,dispose(){for(const g of cache.values())g.dispose();material.dispose();}};
}
