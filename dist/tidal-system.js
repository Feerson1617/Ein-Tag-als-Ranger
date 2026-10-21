// Accelerated tide for observation; water height is a teaching scale, not a local forecast.
export const COASTAL_HABITATS=['beach','wadden','saltmarsh'];
export function animalTimeStep(dt,binocular){return Math.max(0,Math.min(.12,dt))*(binocular?.5:1);}
export class TideClock {
 constructor(){this.phase=.10;this.paused=false;this.period=240;}
 get level(){return -.25-.65*Math.cos(this.phase*Math.PI*2);}
 get label(){return this.phase<.025||this.phase>.975?'Niedrigwasser':Math.abs(this.phase-.5)<.025?'Hochwasser':this.phase<.5?'Flut · Wasser steigt':'Ebbe · Wasser fällt';}
 setPhase(value){this.phase=Math.max(0,Math.min(1,Number(value)));this.paused=true;}
 update(dt){if(!this.paused)this.phase=(this.phase+Math.max(0,dt)/this.period)%1;return this.level;}
}
