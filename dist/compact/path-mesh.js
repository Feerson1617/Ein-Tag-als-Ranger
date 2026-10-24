import * as THREE from '../vendor/three.module.js?revision=120';
import { PATHS } from './layout.js';
const cross=(a,b,p)=>(b[0]-a[0])*(p[2]-a[2])-(b[2]-a[2])*(p[0]-a[0]);
export const polygonArea=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[2]-a[2]*b[0];},0))/2;
const lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function half(poly,a,b,inside){const result=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],dp=cross(a,b,p),dq=cross(a,b,q),ip=inside?dp>=-1e-9:dp<=1e-9,iq=inside?dq>=-1e-9:dq<=1e-9;if(ip)result.push(p);if(ip!==iq)result.push(lerp(p,q,dp/(dp-dq)));}return result;}
// Convex polygon difference yields disjoint convex pieces. This cuts junction
// overlap out of the actual deck, rather than hiding it with depth offsets.
export function subtractPolygon(poly,clip){let remainder=poly,pieces=[];for(let i=0;i<clip.length&&remainder.length>=3;i++){const a=clip[i],b=clip[(i+1)%clip.length],outside=half(remainder,a,b,false);if(outside.length>=3&&polygonArea(outside)>1e-8)pieces.push(outside);remainder=half(remainder,a,b,true);}return pieces;}
export function pathPanels(){const panels=[],grid=new Map(),cell=p=>`${Math.floor(p[0]/2)},${Math.floor(p[2]/2)}`;
 for(const path of PATHS)for(let i=1;i<path.length;i++){
  const a=path[i-1],b=path[i],side=p=>[-p.tz*.9,p.tx*.9],sa=side(a),sb=side(b);
  const p=[a.x,a.y,a.z],q=[b.x,b.y,b.z],leftA=[p[0]+sa[0],p[1],p[2]+sa[1]],rightA=[p[0]-sa[0],p[1],p[2]-sa[1]],leftB=[q[0]+sb[0],q[1],q[2]+sb[1]],rightB=[q[0]-sb[0],q[1],q[2]-sb[1]];
  // Counterclockwise in X/Z for clipping; 4 mm gaps follow both curved edges.
  const poly=[lerp(leftA,leftB,.012),lerp(rightA,rightB,.012),lerp(rightA,rightB,.988),lerp(leftA,leftB,.988)];
  const keys=new Set(poly.map(cell)),candidates=new Set();for(const key of keys){const [gx,gz]=key.split(',').map(Number);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const index of grid.get(`${gx+dx},${gz+dz}`)||[])candidates.add(index);}
  let pieces=[poly];for(const index of candidates){const other=panels[index];if(other.route===a.route)continue;pieces=pieces.flatMap(piece=>subtractPolygon(piece,other.polygon));if(!pieces.length)break;}
  for(const polygon of pieces){if(polygonArea(polygon)<1e-7)continue;const n=panels.length;panels.push({polygon,route:a.route,material:(a.x+b.x)/2>-24&&(a.x+b.x)/2<0?'stone':'wood',distance:a.distance});for(const key of new Set(polygon.map(cell))){if(!grid.has(key))grid.set(key,[]);grid.get(key).push(n);}}
 }return panels;
}

export function deckGeometry(deckPanels=pathPanels()){
 const pos=[],cols=[],uvs=[];for(const panel of deckPanels){const polygon=panel.polygon,col=new THREE.Color(panel.material==='stone'?'#b7af94':['#9c8968','#a68f6b','#ae9776','#968566'][Math.floor(panel.distance*5)%4]);for(let i=1;i<polygon.length-1;i++)for(const v of [polygon[0],polygon[i+1],polygon[i]]){pos.push(...v);uvs.push(v[0]*.28+v[2]*.12,v[2]*.28-v[0]*.12);cols.push(col.r,col.g,col.b);}}
 const deck=new THREE.BufferGeometry();deck.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));deck.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));deck.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));deck.computeVertexNormals();return deck;
}
