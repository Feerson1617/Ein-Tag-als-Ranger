// Visual gait follows actual travelled distance. Stationary animals never
// acquire a walking/feeding animation just because wall-clock time passes.
const poses=new WeakMap();
const walkers=new Set(['apodemus_sylvaticus','coccinella_septempunctata','aphidoidea']);
export function animateSecondaryMotion(model,actor,time){
 if(!walkers.has(actor.taxon)&&!(actor.taxon==='aglais_io'&&actor.stage==='caterpillar'))return;
 const mesh=model.bodyMesh;if(!mesh)return;
 let pose=poses.get(model);
 if(!pose){pose={x:actor.x,z:actor.z,time,phase:0,rest:mesh.geometry.attributes.position.array.slice()};poses.set(model,pose);}
 const travel=time>=pose.time?Math.hypot(actor.x-pose.x,actor.z-pose.z):0;
 pose.phase+=travel/Math.max(.001,actor.size*.22)*Math.PI*2;
 const p=mesh.geometry.attributes.position,rest=pose.rest,moving=travel>1e-7,mouse=actor.taxon==='apodemus_sylvaticus';
 for(let i=0;i<p.count;i++){
  const x=rest[i*3],y=rest[i*3+1],z=rest[i*3+2],foot=y<(mouse?.17:.20),side=z>0?1:-1;
  const gait=moving&&foot?Math.max(0,Math.sin(pose.phase+x*5+side*Math.PI))*(mouse?.065:.035)*(1-y/(mouse?.17:.20)):0;
  p.setXYZ(i,x,y+gait,z);
 }
 p.needsUpdate=true;
 pose.x=actor.x;pose.z=actor.z;pose.time=time;
}
