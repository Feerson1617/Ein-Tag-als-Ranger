// Retain the 65 ms integrator step. Low render FPS must not discard most of
// ordinary walking time. Never catch up through a watched feeding contact:
// tool observations still receive exactly one displayed simulation step.
// At most 250 ms / four small steps bounds normal walking to 40 cm per displayed frame and prevents
// an unbounded backlog. Paused/hidden frames are consumed, not saved up.
export function frameSteps(seconds,active,singleStep){
 if(!active||!Number.isFinite(seconds)||seconds<=0)return [];
 const elapsed=Math.min(seconds,singleStep?.065:.25),count=singleStep?1:Math.ceil(elapsed/.065);
 return Array.from({length:count},()=>elapsed/count);
}
