import { TRAIL_LENGTH, trailPoint, nearestTrail } from './trail.js?revision=120';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const DECK_HALF_WIDTH=1.35;
export const BAY_HALF_LENGTH=2.25;
// One elevation profile and cross-section serve both rendering and walking.
export class BoardwalkLayout {
 constructor(landings,ground,minimum){
  this.landings=landings;this.ground=ground;this.step=.25;this.count=Math.ceil(TRAIL_LENGTH/this.step)+1;
  this.heights=new Float64Array(this.count);
  for(let i=0;i<this.count;i++){
   const d=Math.min(TRAIL_LENGTH,i*this.step),p=trailPoint(d),edge=this.widths(d);
   let y=minimum(p.x,p.z);
   for(let u=edge.left;u<=edge.right+.01;u+=.45)y=Math.max(y,ground(p.x+p.tz*u,p.z-p.tx*u)+.18);
   this.heights[i]=y;
  }
  // Raise approaches rather than letting timbers pierce the soil. Level bays have
  // gentle ramps and share the exact deck height of their signs.
  for(let pass=0;pass<16;pass++){
   for(const l of landings){const a=Math.max(0,Math.floor((l.distance-BAY_HALF_LENGTH-.3)/this.step)),b=Math.min(this.count-1,Math.ceil((l.distance+BAY_HALF_LENGTH+.3)/this.step));let y=0;for(let i=a;i<=b;i++)y=Math.max(y,this.heights[i]);for(let i=a;i<=b;i++)this.heights[i]=y;}
   const rise=.12*this.step;
   for(let i=1;i<this.count;i++)this.heights[i]=Math.max(this.heights[i],this.heights[i-1]-rise);
   for(let i=this.count-2;i>=0;i--)this.heights[i]=Math.max(this.heights[i],this.heights[i+1]-rise);
  }
  for(const l of landings)l.y=this.height(l.distance);
 }
 widths(d){let left=-DECK_HALF_WIDTH,right=DECK_HALF_WIDTH;for(const l of this.landings)if(Math.abs(l.distance-d)<=BAY_HALF_LENGTH){if(l.side>0)right=5.2;else left=-5.2;}return {left,right};}
 height(d){const f=clamp(d/this.step,0,this.count-1),i=Math.floor(f),j=Math.min(this.count-1,i+1);return this.heights[i]+(this.heights[j]-this.heights[i])*(f-i);}
 at(x,z){const p=nearestTrail(x,z),u=(x-p.x)*p.tz-(z-p.z)*p.tx,w=this.widths(p.distance);const along=(x-p.x)*p.tx+(z-p.z)*p.tz;return Math.abs(along)<.18&&u>=w.left&&u<=w.right?this.height(p.distance):null;}
 section(d){const p=trailPoint(d),w=this.widths(d);return {...p,...w,y:this.height(d)};}
}
