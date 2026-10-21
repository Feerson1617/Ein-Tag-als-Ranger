import { PLANTS } from './biodiversity.js?revision=120';
export function toolAllows(tool,type){return tool==='binocular'?type==='animal':tool==='magnifier'?type==='plant':false;}
// Observation is elapsed active time, not the physics step (capped at 65 ms).
// A first sample or a different/hidden target cannot credit the preceding gap.
export class ObservationClock {
 constructor(){this.reset();}
 reset(){this.key=null;this.now=null;}
 step(key,now){
  const seconds=key&&key===this.key&&this.now!==null?Math.max(0,(now-this.now)/1000):0;
  this.key=key;this.now=key?now:null;return seconds;
 }
}
export const focusFollowFactor=(seconds,rate=7)=>1-Math.exp(-rate*Math.max(0,seconds));
// Angular capture grows with the visible field, while keeping the target inside it.
export function binocularAperture(zoom,size,distance){return Math.min(.3,Math.sin(62/Math.max(1,zoom)*.43*Math.PI/180),.19/Math.sqrt(Math.max(1,zoom))+Math.max(size*.35,.055)/Math.max(.01,distance));}
export function focusCandidateScore(off,aperture,known,current=false){return off/aperture+(known?2:0)-(current?.2:0);}
export function collisionContains(p,x,z,margin=0){const dx=x-p.x,dz=z-p.z;if(Math.abs(dx)>p.r+margin||Math.abs(dz)>p.r+margin)return false;if(p.halfX==null)return dx*dx+dz*dz<(p.r+margin)**2;const c=p.rotation?Math.cos(p.rotation):1,s=p.rotation?Math.sin(p.rotation):0;return Math.abs(c*dx-s*dz)<p.halfX+margin&&Math.abs(s*dx+c*dz)<p.halfZ+margin;}

// A capsule covers the long body and flippers. Checking several stations also
// prevents perpendicular and end-to-end seals intersecting at their centres.
export function sealGap(a,b,sa,sb){
 const ra=sa.size*(a.trait||1)*.20,rb=sb.size*(b.trait||1)*.20;
 let gap=Infinity;for(const u of [-1,-.5,0,.5,1])for(const v of [-1,-.5,0,.5,1]){
  const ax=a.x+Math.cos(a.heading||0)*sa.size*.30*u,az=a.z+Math.sin(a.heading||0)*sa.size*.30*u;
  const bx=b.x+Math.cos(b.heading||0)*sb.size*.30*v,bz=b.z+Math.sin(b.heading||0)*sb.size*.30*v;
  gap=Math.min(gap,Math.hypot(ax-bx,az-bz)-ra-rb);
 }return gap;
}
// Every rendered plant instance is registered; a grid avoids scanning the landscape each frame.
export class PlantIndex {
 constructor(plants){this.cells=new Map();for(const p of plants){const key=this.key(p.x,p.z);if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push(p);}}
 key(x,z){return `${Math.floor(x/12)},${Math.floor(z/12)}`;}
 nearby(x,z,r=45){const result=[];for(let gx=Math.floor((x-r)/12);gx<=Math.floor((x+r)/12);gx++)for(let gz=Math.floor((z-r)/12);gz<=Math.floor((z+r)/12);gz++){const cell=this.cells.get(`${gx},${gz}`);if(cell)for(const p of cell)if(Math.hypot(p.x-x,p.z-z)<(PLANTS[p.id].type==='tree'?r:Math.min(r,24)))result.push(p);}return result;}
}
// Seals float only in actual water, otherwise their belly rests on the sediment.
export function sealSurfaceY(ground,water,wet){return wet&&water>ground+.08?Math.max(ground,water-.03):ground;}
