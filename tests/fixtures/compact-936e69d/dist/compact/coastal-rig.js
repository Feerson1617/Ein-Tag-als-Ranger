// Shared model-space contact geometry; simulation and renderer use the same rig.
// Metres, +X forward. Speeds and phase lengths are didactic encounter parameters.
import { CATALOG } from './catalog.js';
export const COASTAL_PROFILES=Object.freeze({
 recurvirostra_avosetta:{id:'avocet',resource:'small-juveniles',technique:'sweeping',depth:[0,.12],bill:[1.14,2.27,0],head:[.42,2.12,0],billPitch:-.5,unitLength:2.10,search:.65,handling:.65,sweep:.36,frequency:2.8},
 platalea_leucorodia:{id:'spoonbill',resource:'shrimp',technique:'sweeping',depth:[.05,.35],bill:[1.58,2.095,0],head:[.42,2.12,0],billPitch:-.1,unitLength:2.54,search:.9,handling:.85,sweep:.24,frequency:1.8},
 tringa_totanus:{id:'redshank',resource:'small-worms',technique:'probing',depth:[-.3,.08],bill:[1.05,2.095,0],head:[.42,2.12,0],billPitch:-1.35,unitLength:2.01,search:.65,handling:.7,sweep:0,frequency:8},
 haematopus_ostralegus:{id:'oystercatcher',resource:'shared-mussels',technique:'shell-opening',depth:[-.8,.04],bill:[1.16,1.765,0],head:[.42,1.79,0],billPitch:-.65,unitLength:2.12,search:.6,handling:2.6,sweep:0,frequency:3}
});
export function coastalRig(taxon){const p=COASTAL_PROFILES[taxon];return p?{...p,scale:CATALOG[taxon].length/p.unitLength,pivot:[.3,1.4,0],crouch:.7}:null;}
export function billPoint(a){
 const r=coastalRig(a.taxon),p=a.pose||{pitch:0,yaw:0,crouch:0},nx=r.head[0]-r.pivot[0],ny=r.head[1]-r.pivot[1],bx=r.bill[0]-r.head[0],by=r.bill[1]-r.head[1],beta=p.billPitch||0,rotX=nx*Math.cos(p.pitch)-ny*Math.sin(p.pitch)+bx*Math.cos(beta)-by*Math.sin(beta),rotY=nx*Math.sin(p.pitch)+ny*Math.cos(p.pitch)+bx*Math.sin(beta)+by*Math.cos(beta),lx=(r.pivot[0]+rotX*Math.cos(p.yaw))*r.scale,lz=-rotX*Math.sin(p.yaw)*r.scale;
 return {x:a.x+Math.cos(a.heading)*lx-Math.sin(a.heading)*lz,y:a.y+(r.pivot[1]-(p.crouch||0)+rotY)*r.scale,z:a.z+Math.sin(a.heading)*lx+Math.cos(a.heading)*lz};
}
// Actual prey moves from bill tip to mouth during the existing swallowing
// phase. A teaching trajectory, not an anatomical oesophagus reconstruction.
// Earlier revisions retain their original tip-only representation.
export function carriedPreyPoint(a,time,revision=5){
 const tip=billPoint(a);if(revision<5||a.behaviorPhase!=='swallowing')return tip;
 const r=coastalRig(a.taxon);if(!r)return tip;
 const p=a.pose,nx=r.head[0]-r.pivot[0],ny=r.head[1]-r.pivot[1],pitch=p.pitch||0,yaw=p.yaw||0;
 const neckX=nx*Math.cos(pitch)-ny*Math.sin(pitch),neckY=nx*Math.sin(pitch)+ny*Math.cos(pitch);
 const x=(r.pivot[0]+neckX*Math.cos(yaw))*r.scale,z=-neckX*Math.sin(yaw)*r.scale;
 const mouth={x:a.x+Math.cos(a.heading)*x-Math.sin(a.heading)*z,y:a.y+(r.pivot[1]-(p.crouch||0)+neckY)*r.scale,z:a.z+Math.sin(a.heading)*x+Math.cos(a.heading)*z};
 const t=Math.min(1,Math.max(0,(time-a.phaseStartedAt)/.85));
 return {x:tip.x+(mouth.x-tip.x)*t,y:tip.y+(mouth.y-tip.y)*t,z:tip.z+(mouth.z-tip.z)*t};
}
export function contactPose(a,targetY){
 const r=coastalRig(a.taxon),nx=r.head[0]-r.pivot[0],ny=r.head[1]-r.pivot[1],bx=r.bill[0]-r.head[0],by=r.bill[1]-r.head[1],beta=r.billPitch,billY=bx*Math.sin(beta)+by*Math.cos(beta),wanted=(targetY-a.y)/r.scale-(r.pivot[1]-r.crouch)-billY,headFloor=.21-(r.pivot[1]-r.crouch),neckY=Math.max(headFloor,wanted),pitch=Math.asin(Math.max(-1,Math.min(1,neckY/Math.hypot(nx,ny))))-Math.atan2(ny,nx);
 return {pitch,yaw:0,crouch:r.crouch,billPitch:beta};
}
export const CRAB_RIG=Object.freeze({scale:.055/1.81,contact:[1.28,.3,.6],pivot:[.4,.23,.4]});
export function crabContactPose(a,targetY){const r=CRAB_RIG,x=r.contact[0]-r.pivot[0],y=r.contact[1]-r.pivot[1],desired=(targetY-a.y)/r.scale-r.pivot[1];return {pitch:0,yaw:0,crouch:0,clawPitch:Math.asin(Math.max(-1,Math.min(1,desired/Math.hypot(x,y))))-Math.atan2(y,x)};}
export function clawPoint(a){const r=CRAB_RIG,pitch=a.pose?.clawPitch||0,x=r.contact[0]-r.pivot[0],y=r.contact[1]-r.pivot[1],lx=(r.pivot[0]+x*Math.cos(pitch)-y*Math.sin(pitch))*r.scale,ly=(r.pivot[1]+x*Math.sin(pitch)+y*Math.cos(pitch))*r.scale,lz=r.contact[2]*r.scale;return {x:a.x+Math.cos(a.heading)*lx-Math.sin(a.heading)*lz,y:a.y+ly,z:a.z+Math.sin(a.heading)*lx+Math.cos(a.heading)*lz};}
