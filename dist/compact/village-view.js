import * as THREE from '../vendor/three.module.js?revision=120';
import { GeometryBatch,stick } from './geometry.js';
import { SPEAKERS,speakerApproach } from './village.js';
import { BUILDINGS,terrainHeight } from './layout.js';
import { scenicSurface } from './scenic-materials.js';
export function createVillageView(scene){
 const b=new GeometryBatch(),box=new THREE.BoxGeometry(1,1,1),sphere=new THREE.SphereGeometry(1,20,14);
 for(const p of SPEAKERS){
  const begin=b.p.length;const y=terrainHeight(p.x,p.z),skin=p.id==='local'?'#bd8e6e':'#d1a283';
  // Shaped clothing, shoulders and jaw within the existing collision envelope.
  const torso=new THREE.LatheGeometry([new THREE.Vector2(.15,0),new THREE.Vector2(.19,.08),new THREE.Vector2(.18,.27),new THREE.Vector2(.22,.43),new THREE.Vector2(.17,.52),new THREE.Vector2(.085,.56)],20);
  b.add(torso,p.color,[p.x,y+.77,p.z],[1,1,.72]);
  stick(b,[p.x,y+1.25,p.z],[p.x,y+1.42,p.z],.065,skin,.065);
  b.add(sphere,skin,[p.x,y+1.52,p.z],[.115,.155,.105]);
  b.add(sphere,skin,[p.x,y+1.43,p.z-.025],[.084,.067,.077]);
  b.add(sphere,'#625847',[p.x,y+1.64,p.z+.012],[.12,.065,.105]);
  b.add(sphere,skin,[p.x,y+1.51,p.z-.107],[.025,.037,.028]);
  stick(b,[p.x-.033,y+1.455,p.z-.091],[p.x+.033,y+1.455,p.z-.091],.004,'#8e6251',.003);
  for(const side of [-1,1]){
   const hip=[p.x+side*.095,y+.81,p.z],knee=[p.x+side*.105,y+.45,p.z+.006],ankle=[p.x+side*.12,y+.11,p.z+.015];
   stick(b,hip,knee,.081,'#4e514a',.063);stick(b,knee,ankle,.063,'#4e514a',.045);
   b.add(sphere,'#393f36',[p.x+side*.12,y+.065,p.z-.05],[.075,.062,.13]);
   const shoulder=[p.x+side*.19,y+1.24,p.z],elbow=[p.x+side*.245,y+1.05,p.z-.015],wrist=[p.x+side*.26,y+.88,p.z-.045];
   b.add(sphere,p.color,shoulder,[.077,.10,.076]);stick(b,shoulder,elbow,.068,p.color,.055);stick(b,elbow,wrist,.055,p.color,.039);
   b.add(sphere,skin,[p.x+side*.26,y+.84,p.z-.045],[.041,.072,.037]);
   b.add(sphere,skin,[p.x+side*.113,y+1.52,p.z],[.023,.037,.018]);
   b.add(sphere,'#eee3d0',[p.x+side*.042,y+1.544,p.z-.095],[.023,.010,.008]);
   b.add(sphere,'#3c4035',[p.x+side*.042,y+1.544,p.z-.102],[.009,.009,.004]);
   stick(b,[p.x+side*.021,y+1.568,p.z-.093],[p.x+side*.064,y+1.567,p.z-.088],.005,'#625847',.004);
  }
  stick(b,[p.x,y+.84,p.z-.135],[p.x,y+1.27,p.z-.13],.006,'#d0ceb1',.004);
  for(let k=0;k<4;k++)b.add(sphere,'#b9bc9d',[p.x,y+.94+k*.08,p.z-.14],[.012,.012,.006]);
  const approach=speakerApproach(p),angle=Math.atan2(p.x-approach.x,p.z-approach.z),cos=Math.cos(angle),sin=Math.sin(angle);
  for(let i=begin;i<b.p.length;i+=3){const x=b.p[i]-p.x,z=b.p[i+2]-p.z,nx=b.n[i],nz=b.n[i+2];b.p[i]=p.x+cos*x+sin*z;b.p[i+2]=p.z-sin*x+cos*z;b.n[i]=cos*nx+sin*nz;b.n[i+2]=-sin*nx+cos*nz;}
 }
 // All facade details remain on the existing buildings, outside walking routes.
 for(const house of BUILDINGS){
  const y=terrainHeight(house.x,house.z),roofHeight=house.h*.45,roofX=house.w*.57,roofZ=house.d*.6;
  for(const side of [-1,1]){
   const z=house.z+side*(house.d/2+.07);
   for(let row=0;row<5;row++)b.add(box,'#bba98c',[house.x,y+.3+row*.54,z],[house.w-.15,.012,.018]);
   for(const dx of [-house.w*.28,house.w*.28]){
    const x=house.x+dx;
    b.add(box,'#ece5d0',[x,y+1.80,z+side*.064],[.045,.94,.045]);
    b.add(box,'#ece5d0',[x,y+1.80,z+side*.064],[.87,.04,.045]);
    b.add(box,'#a7a48d',[x,y+1.18,z+side*.06],[1.2,.09,.18]);
    b.add(box,'#e6d8b9',[x,y+2.45,z],[1.16,.08,.10]);
   }
   // Gutters and downpipes sit flush to the house, not new path obstacles.
   stick(b,[house.x-roofX,y+house.h-.04,house.z+side*roofZ],[house.x+roofX,y+house.h-.04,house.z+side*roofZ],.045,'#6a716b',.045);
   stick(b,[house.x+house.w*.48,y+.1,z],[house.x+house.w*.48,y+house.h,z],.034,'#737b70',.034);
   for(let k=0;k<3;k++){const x=house.x+(k-1)*house.w*.28;b.add(box,'#81745b',[x,y+.12,house.z+side*(house.d/2+.35)],[.8,.24,.30]);b.add(sphere,'#65784e',[x,y+.34,house.z+side*(house.d/2+.35)],[.48,.28,.3]);}
  }
  // Tile courses follow each roof plane. No extra buildings or collisions.
  for(const side of [-1,1])for(let k=1;k<13;k++){
   const x=side*roofX*k/13,h=roofHeight*(1-k/13);
   stick(b,[house.x+x,y+house.h+h+.016,house.z-roofZ],[house.x+x,y+house.h+h+.016,house.z+roofZ],.015,'#97634d',.015);
  }
  stick(b,[house.x,y+house.h+roofHeight+.02,house.z-roofZ],[house.x,y+house.h+roofHeight+.02,house.z+roofZ],.07,'#86583f',.07);
  b.add(box,'#716b59',[house.x+house.w*.25,y+house.h+1.22,house.z],[.66,.12,.69]);
  b.add(box,'#263d36',[house.x,y+1.42,house.z-house.d/2-.12],[.58,.57,.035]);
  b.add(box,'#c8ba8e',[house.x+.30,y+.94,house.z-house.d/2-.13],[.035,.09,.035]);
 }
 const mesh=b.mesh();scenicSurface(mesh.material,'masonry');scene.add(mesh);
 return {mesh,blocks:SPEAKERS.map(p=>({x:p.x,z:p.z,r:.29}))};
}
