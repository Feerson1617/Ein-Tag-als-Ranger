import * as THREE from '../vendor/three.module.js?revision=120';
import { scenicSurface } from './scenic-materials.js';
import { GeometryBatch,leafGeometry,plantGeometry,stick } from './geometry.js';

// Detail changes only representation. Every cell retains the same fixed rows,
// matrices and individual IDs, including instances hidden for browsing damage.
export function vegetationDetail(distance){return distance<18?'near':distance<36?'middle':'far';}
function simplePlant(taxon,detail){
 const b=new GeometryBatch(),grass=['festuca_rubra','puccinellia_maritima','sporobolus_anglicus'].includes(taxon),shrub=['rubus_fruticosus','halimione_portulacoides'].includes(taxon),nettle=taxon==='urtica_dioica',color=taxon==='halimione_portulacoides'?'#a5ad92':grass?'#7c8c58':nettle?'#447037':'#547840';
 if(grass){for(let i=0;i<(detail==='middle'?7:3);i++)b.add(leafGeometry(.7+(i%3)*.12,.035,false,false,3),color,[0,.01,0],[1,1,1],[-.35,i*2.399,0]);}
 else{stick(b,[0,0,0],[0,shrub?.75:1,0],shrub?.018:.008,'#6a7847');for(let level=0;level<(detail==='middle'?3:2);level++){const count=shrub?5:nettle?2:6;for(let i=0;i<count;i++)b.add(leafGeometry(shrub?.4:nettle?.37:.42,shrub?.19:nettle?.23:.10,nettle,false,3),color,[0,.18+level*.27,0],[1,1,1],[-.15,i/count*Math.PI*2+level*.3,0]);}}
 return b.geometry();
}
export function createVegetationView(scene,plants){
 const cells=new Map(),cache=new Map(),material=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.94}),dummy=new THREE.Object3D();
 scenicSurface(material,'leaf');
 const geometry=(taxon,detail,window)=>{const key=[taxon,detail,window].join(':');if(!cache.has(key))cache.set(key,detail==='near'?plantGeometry(taxon,1,window):simplePlant(taxon,detail));return cache.get(key);};
 for(const p of plants){const key=[p.taxon,Math.floor(p.x/8),Math.floor(p.z/8)].join(':');if(!cells.has(key))cells.set(key,[]);cells.get(key).push(p);}
 const meshes=[];
 for(const rows of cells.values()){
  const taxon=rows[0].taxon,cx=rows.reduce((s,p)=>s+p.x,0)/rows.length,cz=rows.reduce((s,p)=>s+p.z,0)/rows.length,m=new THREE.InstancedMesh(geometry(taxon,'far','summer'),material,rows.length);
  m.userData={taxon,rows,cx,cz,detail:'far',window:'summer'};
  for(let i=0;i<rows.length;i++){const p=rows[i];dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.angle,0);dummy.scale.setScalar(p.size);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);}
  m.computeBoundingSphere();m.castShadow=false;m.receiveShadow=true;scene.add(m);meshes.push(m);
 }
 let lastX=Infinity,lastZ=Infinity,lastWindow='';
 function update(observer,window){
  if(Math.hypot(observer.x-lastX,observer.z-lastZ)<1&&window===lastWindow)return;
  lastX=observer.x;lastZ=observer.z;lastWindow=window;
  for(const m of meshes){const d=Math.hypot(observer.x-m.userData.cx,observer.z-m.userData.cz),detail=vegetationDetail(d);m.visible=d<70;if(detail!==m.userData.detail||window!==m.userData.window){m.geometry=geometry(m.userData.taxon,detail,window);m.userData.detail=detail;m.userData.window=window;}}
 }
 return {meshes,update,dispose(){for(const g of cache.values())g.dispose();material.dispose();}};
}
