import { layoutAxis, layoutPoint } from './world-layout.js?revision=120';
// One continuous itinerary. Exploration beside the deck remains possible.
export const TRAIL_NODES = [
 [0,28],[-10,10],[-23,-5],[-45,-12],[-50,-24],[-48,-44],[-26,-45],
 [-7,-30],[6,-12],[5,10],[9,30],[29,36],[47,31],[45,12],[43,-6],
 [62,-8],[66,26],[53,65],[29,96],
 [10,123],[0,140],[-12,158],[-38,169],[-79,167],[-111,154],[-150,149],
 [-166,134],[-164,103],[-157,76],[-150,42],
 [-150,24],[-150,8],[-150,-15],[-150,-44],[-146,-63],[-137,-99],
 [-118,-147],[-101,-160],[-70,-164],[-40,-154],[-15,-162],[-8,-169],[14,-170],[35,-163],
 [64,-157],[94,-155],[120,-140],[130,-125],[139,-101],[137,-73],
 [125,-46],[123,-12],[129,19],[141,37],[168,48],[192,43],[212,23],
 [208,-3],[198,-22]
].map(([x,z])=>[layoutAxis(x),layoutAxis(z)]);
function smooth(nodes) {
 const result=[nodes[0]];
 for(let i=0;i<nodes.length-1;i++) {
  const a=nodes[i],b=nodes[i+1];
  result.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],
              [a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75]);
 }
 result.push(nodes.at(-1));return result;
}
export const TRAIL = smooth(smooth(TRAIL_NODES));
export const TRAIL_SEGMENTS=[];
let length=0;
for(let i=0;i<TRAIL.length-1;i++) {
 const [x,z]=TRAIL[i],[bx,bz]=TRAIL[i+1],d=Math.hypot(bx-x,bz-z);
 if(d<.001)continue;
 TRAIL_SEGMENTS.push({x,z,bx,bz,length:d,start:length,tx:(bx-x)/d,tz:(bz-z)/d});length+=d;
}
export const TRAIL_LENGTH=length;
export function trailPoint(distance) {
 const d=Math.max(0,Math.min(TRAIL_LENGTH,distance));
 const s=TRAIL_SEGMENTS.find(s=>d<=s.start+s.length)||TRAIL_SEGMENTS.at(-1);
 const t=(d-s.start)/s.length;return{x:s.x+(s.bx-s.x)*t,z:s.z+(s.bz-s.z)*t,tx:s.tx,tz:s.tz,distance:d};
}
// Exact nearest-segment lookup. The grid only narrows the candidates; geometry,
// tie ordering and deck heights are unchanged. No quantized height cache is used.
const cellSize=8,segmentCells=new Map();
for(let index=0;index<TRAIL_SEGMENTS.length;index++){
 const s=TRAIL_SEGMENTS[index];s.index=index;s.queryStamp=0;
 for(let cx=Math.floor(Math.min(s.x,s.bx)/cellSize);cx<=Math.floor(Math.max(s.x,s.bx)/cellSize);cx++)
  for(let cz=Math.floor(Math.min(s.z,s.bz)/cellSize);cz<=Math.floor(Math.max(s.z,s.bz)/cellSize);cz++){
   const key=`${cx}:${cz}`;if(!segmentCells.has(key))segmentCells.set(key,[]);segmentCells.get(key).push(s);
  }
}
let queryStamp=0;
const trailBounds={minX:Math.min(...TRAIL.map(p=>p[0]))-cellSize,maxX:Math.max(...TRAIL.map(p=>p[0]))+cellSize,minZ:Math.min(...TRAIL.map(p=>p[1]))-cellSize,maxZ:Math.max(...TRAIL.map(p=>p[1]))+cellSize};
export const TRAIL_QUERY_STATS={queries:0,candidates:0};
export function nearestTrail(x,z){
 const cx=Math.floor(x/cellSize),cz=Math.floor(z/cellSize),stamp=++queryStamp;
 let best=null,bestT=0,bestX=0,bestZ=0,bestOffset=Infinity;
 const candidate=s=>{
   if(s.queryStamp===stamp)return;s.queryStamp=stamp;TRAIL_QUERY_STATS.candidates++;
   const t=Math.max(0,Math.min(1,((x-s.x)*s.tx+(z-s.z)*s.tz)/s.length));
   const px=s.x+(s.bx-s.x)*t,pz=s.z+(s.bz-s.z)*t,d=Math.hypot(x-px,z-pz);
   if(d<bestOffset||d===bestOffset&&s.index<best.index){best=s;bestT=t;bestX=px;bestZ=pz;bestOffset=d;}
 };
 const visit=(ix,iz)=>{
  for(const s of segmentCells.get(`${ix}:${iz}`)||[])candidate(s);
 };
 TRAIL_QUERY_STATS.queries++;
 if(x<trailBounds.minX||x>trailBounds.maxX||z<trailBounds.minZ||z>trailBounds.maxZ){for(const s of TRAIL_SEGMENTS)candidate(s);}
 else for(let ring=0;;ring++){
  if(ring===0)visit(cx,cz);else{
   for(let ix=cx-ring;ix<=cx+ring;ix++){visit(ix,cz-ring);visit(ix,cz+ring);}
   for(let iz=cz-ring+1;iz<cz+ring;iz++){visit(cx-ring,iz);visit(cx+ring,iz);}
  }
  const outside=Math.min(x-(cx-ring)*cellSize,(cx+ring+1)*cellSize-x,z-(cz-ring)*cellSize,(cz+ring+1)*cellSize-z);
  // Strict inequality also visits equally near segments on the next cell boundary.
  if(best&&bestOffset<outside)break;
 }
 return{x:bestX,z:bestZ,tx:best.tx,tz:best.tz,distance:best.start+bestT*best.length,offset:bestOffset};
}
export const TRAIL_ENTRIES=Object.fromEntries(Object.entries({
 forest:[0,28],meadow:[0,140],farmland:[-150,149],city:[-150,24],
 saltmarsh:[-105,-158],wadden:[-15,-162],beach:[130,-125],lake:[141,37]
}).map(([id,[x,z]])=>[id,nearestTrail(layoutAxis(x),layoutAxis(z))]));
export const EXPERIMENT_PLOTS=[{x:-170,z:129,r:7},{x:-130,z:129,r:7}].map(layoutPoint);
