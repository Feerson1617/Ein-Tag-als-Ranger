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
