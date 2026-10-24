import { terrainHeight } from './layout.js';
import { COASTAL_PROFILES,coastalRig,billPoint,carriedPreyPoint,contactPose,clawPoint,crabContactPose,CRAB_RIG } from './coastal-rig.js';
export const COASTAL_SPEED_LIMITS=Object.freeze({birdWalk:.36,birdFlight:6,crab:.035,bee:2.8});
const approach=(v,target,step)=>v+Math.sign(target-v)*Math.min(Math.abs(target-v),step);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const contactTolerance=prey=>Math.min(.0025,Math.max(.0004,prey.size*.08));
const point=a=>({x:a.x,y:a.y,z:a.z});
const transition=(a,phase,time)=>{a.behaviorPhase=phase;a.phaseStartedAt=time;};
function walk(a,target,speed,dt){const d=Math.hypot(target.x-a.x,target.z-a.z),move=Math.min(d,speed*dt);if(d>1e-8){a.x+=(target.x-a.x)/d*move;a.z+=(target.z-a.z)/d*move;}a.y=terrainHeight(a.x,a.z);a.walkDistance=(a.walkDistance||0)+move;return Math.max(0,d-move);}
function pose(a,goal,dt){a.pose||={pitch:0,yaw:0,crouch:0};a.pose.pitch=approach(a.pose.pitch,goal.pitch,2.2*dt);a.pose.yaw=approach(a.pose.yaw,goal.yaw,2.2*dt);a.pose.crouch=approach(a.pose.crouch,goal.crouch,.8*dt);a.pose.billPitch=approach(a.pose.billPitch||0,goal.billPitch||0,2.2*dt);a.pose.clawPitch=approach(a.pose.clawPitch||0,goal.clawPitch||0,1.5*dt);}
function preyPoint(prey,revision=1){const rimOffset=revision>=6?0:.06;return {x:prey.x,y:prey.y+(prey.taxon==='mytilus_edulis'?(.05+.46*Math.cos(prey.shellOpening||0)-rimOffset*Math.sin(prey.shellOpening||0))*prey.size/1.75:prey.size*.07),z:prey.z+(prey.taxon==='mytilus_edulis'?(.46*Math.sin(prey.shellOpening||0)+rimOffset*Math.cos(prey.shellOpening||0))*prey.size/1.75:0)};}
// Revision7 fixes an observed sub-millimetre soil penetration in the search
// sweep. Contact/handling still settles onto the actual unchanged prey point.
function groundSafeSearchPose(a,goal,dt,revision,clearance=.003){
 pose(a,goal,dt);
 if((revision??1)<7)return;
 // Constrain the actual interpolated pose, including its return from a sweep.
 // Goal-only correction missed the intermediate yaw on sloping sediment.
 const r=coastalRig(a.taxon),nx=r.head[0]-r.pivot[0],ny=r.head[1]-r.pivot[1],bx=r.bill[0]-r.head[0],by=r.bill[1]-r.head[1];
 for(let i=0;i<4;i++){
  const tip=billPoint(a),floor=terrainHeight(tip.x,tip.z)+clearance;if(tip.y>=floor-1e-10)break;
  const beta=a.pose.billPitch||0,wanted=(floor-a.y)/r.scale-(r.pivot[1]-a.pose.crouch)-bx*Math.sin(beta)-by*Math.cos(beta);
  a.pose.pitch=Math.max(a.pose.pitch,Math.asin(Math.max(-1,Math.min(1,wanted/Math.hypot(nx,ny))))-Math.atan2(ny,nx));
 }
}
function beginFlight(a,target,time){a.flight={start:point(a),target:{x:target.x,y:terrainHeight(target.x,target.z),z:target.z},elapsed:0,duration:Math.hypot(target.x-a.x,target.z-a.z)/3.5+1};a.supportId=null;transition(a,'flight',time);a.activity='flying';}
function flight(a,dt,time){const f=a.flight;f.elapsed=Math.min(f.duration,f.elapsed+dt);const t=f.elapsed/f.duration,e=t*t*(3-2*t);a.x=f.start.x+(f.target.x-f.start.x)*e;a.z=f.start.z+(f.target.z-f.start.z)*e;a.y=f.start.y+(f.target.y-f.start.y)*e+Math.sin(Math.PI*t)*2;a.heading=Math.atan2(f.target.z-f.start.z,f.target.x-f.start.x);a.activity='flying';pose(a,{pitch:0,yaw:0,crouch:.15},dt);if(t===1){a.supportId='ground:coastal-rest-or-feeding';a.flight=null;transition(a,'waiting',time);}}
function targetFor(a,p,prey,revision){
 const target=preyPoint(prey,revision),goal=a.taxon==='carcinus_maenas'?crabContactPose(a,target.y):contactPose(a,target.y),offset=a.taxon==='carcinus_maenas'?clawPoint({...a,x:0,z:0,heading:0,pose:goal}):billPoint({...a,x:0,z:0,heading:0,pose:goal}),heading=Math.atan2(target.z-a.z,target.x-a.x)-Math.atan2(offset.z,offset.x);a.heading=heading;
 return {x:target.x-Math.cos(heading)*offset.x+Math.sin(heading)*offset.z,z:target.z-Math.sin(heading)*offset.x-Math.cos(heading)*offset.z};
}
function preyMatches(a,p,resource){return p.alive&&(resource==='shared-mussels'?p.taxon==='mytilus_edulis':resource==='shrimp'?p.taxon==='crangon_crangon':p.resourceClass===resource);}
function oneStep(state,a,dt,time,waterAt,emit){
 const ecology=state.ecology,isCrab=a.taxon==='carcinus_maenas',profile=isCrab?{resource:'shared-mussels',depth:[-.8,.15],search:.5,handling:2.2,technique:'opening-shell'}:COASTAL_PROFILES[a.taxon];
 a.behaviorPhase||='waiting';a.phaseStartedAt??=time;a.pose||={pitch:0,yaw:0,crouch:0};
 if(a.behaviorPhase==='flight'){flight(a,dt,time);return;}
 const food=ecology.actors.filter(p=>preyMatches(a,p,profile.resource)),homeDepth=waterAt(time).waterLevel-terrainHeight(a.homeX,a.homeZ),disturbed=!isCrab&&Math.hypot((ecology.observer?.x??0)-a.x,(ecology.observer?.z??0)-a.z)<1.5;
 if(!isCrab&&(disturbed||homeDepth>profile.depth[1]+.06&&Math.hypot(a.x-a.homeX,a.z-a.homeZ)<2.5)&&!['swallowing','departing'].includes(a.behaviorPhase)){
  a.targetId=null;if(Math.hypot(a.x-32,a.z-27)>1){beginFlight(a,{x:32,z:27},time);return;}a.activity='resting';pose(a,{pitch:0,yaw:0,crouch:0},dt);return;
 }
 if(!isCrab&&Math.hypot(a.x-a.homeX,a.z-a.homeZ)>2.5&&a.behaviorPhase==='waiting'){
  const eta=Math.hypot(a.x-a.homeX,a.z-a.homeZ)/3.5+1,futureDepth=waterAt(time+eta).waterLevel-terrainHeight(a.homeX,a.homeZ);
  if(food.length&&futureDepth>=profile.depth[0]&&futureDepth<=profile.depth[1])beginFlight(a,{x:a.homeX,z:a.homeZ},time);
  else{a.activity='resting';pose(a,{pitch:0,yaw:0,crouch:0},dt);}return;
 }
 if(a.behaviorPhase==='swallowing'){
  a.activity=isCrab?'handling-prey':'swallowing';pose(a,{pitch:-.15,yaw:0,crouch:0},dt);
  if(time-a.phaseStartedAt>=1){a.carriedPreyId=null;transition(a,'departing',time);a.departure={x:a.x-Math.cos(a.heading)*.45,z:a.z-Math.sin(a.heading)*.45};}return;
 }
 if(a.behaviorPhase==='departing'){
  a.activity='departing';pose(a,{pitch:0,yaw:0,crouch:0},dt);if(walk(a,a.departure,isCrab?COASTAL_SPEED_LIMITS.crab:COASTAL_SPEED_LIMITS.birdWalk,dt)<.003){a.targetId=null;if(a.lastFeeding){a.lastFeeding.departedAt=time;a.lastFeeding.departurePosition=point(a);}transition(a,'waiting',time);}return;
 }
 let prey=food.find(p=>p.id===a.targetId);
 if(!prey){const reserved=new Set(ecology.actors.filter(p=>p!==a&&p.behaviorPhase!=='departing').map(p=>p.targetId));prey=food.filter(p=>!reserved.has(p.id)).sort((p,q)=>Math.hypot(p.x-a.x,p.z-a.z)-Math.hypot(q.x-a.x,q.z-a.z))[0];a.targetId=prey?.id;transition(a,'waiting',time);}
 if(!prey||!ecology.resources[profile.resource]?.amount){a.activity='resting';pose(a,{pitch:0,yaw:0,crouch:0},dt);return;}
 if(a.behaviorPhase==='handling'&&prey.taxon==='mytilus_edulis')prey.shellOpening=Math.min(.5,(time-a.phaseStartedAt)/profile.handling*.5);
 const target=preyPoint(prey,state.modelRevision),preyDepth=waterAt(time).waterLevel-terrainHeight(prey.x,prey.z),suitable=preyDepth>=profile.depth[0]&&preyDepth<=profile.depth[1];
 if(!suitable){a.activity='resting';pose(a,{pitch:0,yaw:0,crouch:0},dt);if(a.behaviorPhase!=='waiting')transition(a,'waiting',time);return;}
 if(a.behaviorPhase==='waiting'){transition(a,'approaching',time);a.approachStartedAt=time;if(state.modelRevision>=5){a.feedingPreyId=prey.id;a.feedingEventId=`${state.worldVersion}:${ecology.window}:feeding:${a.id}:${prey.id}:${time.toFixed(9)}`;}}
 if(isCrab)pose(a,crabContactPose(a,target.y),dt);
 const bodyTarget=targetFor(a,profile,prey,state.modelRevision),remaining=walk(a,bodyTarget,isCrab?COASTAL_SPEED_LIMITS.crab:COASTAL_SPEED_LIMITS.birdWalk,dt);
 if(a.behaviorPhase==='approaching'){
  a.activity='approaching';if(!isCrab)groundSafeSearchPose(a,contactPose(a,target.y),dt,state.modelRevision);
  if(remaining<.003)transition(a,'searching',time);return;
 }
 if(a.behaviorPhase==='searching'){
  a.activity=profile.technique;const goal=isCrab?null:contactPose(a,target.y);
  if(goal&&time-a.phaseStartedAt<profile.search){goal.yaw=profile.sweep*Math.sin((time-a.phaseStartedAt)*profile.frequency);if(a.taxon==='tringa_totanus')goal.pitch+=.08*Math.sin((time-a.phaseStartedAt)*profile.frequency);}
  if(goal)groundSafeSearchPose(a,goal,dt,state.modelRevision,time-a.phaseStartedAt<profile.search?.003:.00005);
  const contact=isCrab?clawPoint(a):billPoint(a);
  if(time-a.phaseStartedAt>=profile.search&&distance(contact,target)<contactTolerance(prey)){a.contactAt=time;a.contactPoint=contact;transition(a,'handling',time);}return;
 }
 if(a.behaviorPhase==='handling'){
  a.activity=profile.technique;if(!isCrab){const goal=contactPose(a,target.y);if(a.taxon==='haematopus_ostralegus')goal.yaw=.02*Math.sin((time-a.phaseStartedAt)*3);pose(a,goal,dt);}
  const contact=isCrab?clawPoint(a):billPoint(a),gap=distance(contact,target),bodyDepth=waterAt(time).waterLevel-terrainHeight(a.x,a.z);
  if(time-a.phaseStartedAt<profile.handling||gap>=contactTolerance(prey)||bodyDepth<profile.depth[0]-.02||bodyDepth>profile.depth[1]+.02)return;
  const interaction=profile.resource==='shared-mussels'?'shell-competition':'shore-feeding';
  const event=emit(state,interaction,[a.id,prey.id],profile.resource,-1,interaction==='shore-feeding'?'consumed':'prey-removed',{...(state.modelRevision>=5?{id:a.feedingEventId}:{}),startedAt:a.approachStartedAt,endedAt:time,contactAt:a.contactAt,handlingStartedAt:a.phaseStartedAt,preyLength:prey.size,accessible:true,technique:profile.technique,waterDepth:bodyDepth,preyWaterDepth:preyDepth,contactPoint:contact,preyPoint:target,preyPosition:point(prey),bodyPosition:point(a),bodyHeading:a.heading,bodyPose:{...a.pose},shellOpening:prey.shellOpening||0,contactDistance:gap,sequence:['approach',isCrab?'claw-contact':'bill-contact','handling','prey-acquired'],modelRevision:state.modelRevision??1});
  prey.alive=false;prey.emptyShell=prey.taxon==='mytilus_edulis';a.carriedPreyId=prey.id;a.lastFeeding={preyId:prey.id,consumedAt:time,contactAt:a.contactAt,...(state.modelRevision>=5?{eventId:event.id}:{})};transition(a,'swallowing',time);
 }
}
export function stepCoastal(state,dt,waterAt,emit){
 // Substeps resolve contact/handling at coarse caller timesteps as well as 60 Hz.
 const actors=state.ecology.actors.filter(a=>COASTAL_PROFILES[a.taxon]||a.taxon==='carcinus_maenas'),start=state.time-dt;let elapsed=0;
 while(elapsed<dt-1e-10){const h=Math.min(.025,dt-elapsed);elapsed+=h;
  for(const a of actors)oneStep(state,a,h,start+elapsed,waterAt,emit);for(const a of actors)if(a.carriedPreyId){const prey=state.ecology.actors.find(p=>p.id===a.carriedPreyId);prey.carriedBy=a.id;if(!prey.emptyShell)Object.assign(prey,a.taxon==='carcinus_maenas'?clawPoint(a):carriedPreyPoint(a,start+elapsed,state.modelRevision));}}
}
