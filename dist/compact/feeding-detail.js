import * as THREE from '../vendor/three.module.js?revision=120';
import { billPoint,carriedPreyPoint,coastalRig } from './coastal-rig.js';

// Two cameras render the very same live scene nodes. No replay, cloned animal,
// enlarged prey geometry, independent animation or observation credit is used.
export function createFeedingDetail({scene,renderer,state,models,element,context,observer}){
 const detailCamera=new THREE.PerspectiveCamera(28,1,.001,12),overviewCamera=new THREE.PerspectiveCamera(35,1,.005,12),background=new THREE.Color('#bbbda9'),size=new THREE.Vector2();
 const lenses=element.querySelector('.feeding-lenses');
 let enabled=false,tagged=[];
 const clearLayers=()=>{for(const root of tagged)root.traverse(node=>node.layers.disable(31));tagged=[];};
 function toggle(){enabled=!enabled;element.hidden=!enabled;return enabled;}
 function hide(){enabled=false;element.hidden=true;clearLayers();}
 function render(actor){
  if(!enabled||!actor){element.hidden=true;clearLayers();return null;}
  element.hidden=false;clearLayers();
  const preyId=actor.carriedPreyId||actor.targetId||actor.lastFeeding?.preyId,prey=state.ecology.actors.find(a=>a.id===preyId),bird=models.get(actor.id),preyModel=models.get(preyId),rig=coastalRig(actor.taxon);
  if(!rig||!bird||!prey||!preyModel){
   lenses.hidden=true;
   element.querySelector('#feeding-identity').textContent=actor.id+' · noch kein konkretes Beuteziel';
   element.querySelector('#feeding-event').textContent='Noch kein Erwerbsbeleg. Einen beschrifteten Feinschritt ausführen oder im Echtzeitmodus warten.';
   return null;
  }
  lenses.hidden=false;
  tagged=[bird,preyModel,...(preyModel.tissue?[preyModel.tissue]:[])];
  for(const root of tagged)root.traverse(node=>node.layers.enable(31));
  scene.traverse(node=>{if(node.isLight)node.layers.enable(31);});
  detailCamera.layers.set(31);overviewCamera.layers.set(31);
  const eventId=actor.feedingPreyId===prey.id?actor.feedingEventId:actor.lastFeeding?.preyId===prey.id?actor.lastFeeding.eventId:null,acquired=state.ecology.events.find(e=>e.id===eventId&&e.actors[0]===actor.id&&e.actors[1]===prey.id),tip=billPoint(actor),carried=carriedPreyPoint(actor,state.time,state.modelRevision),focus=actor.carriedPreyId?carried:{x:prey.x,y:prey.y+prey.size*.12,z:prey.z};
  const span=Math.max(.008,prey.size*2.2),distance=span/(2*Math.tan(THREE.MathUtils.degToRad(detailCamera.fov/2))),side=new THREE.Vector3(-Math.sin(actor.heading),.38,Math.cos(actor.heading)).normalize();
  detailCamera.position.set(focus.x,focus.y,focus.z).addScaledVector(side,distance);detailCamera.lookAt(focus.x,focus.y,focus.z);
  const body=new THREE.Vector3(actor.x,actor.y+rig.scale,actor.z),bodyDistance=rig.unitLength*rig.scale/(2*Math.tan(THREE.MathUtils.degToRad(overviewCamera.fov/2)))*1.4;
  overviewCamera.position.copy(body).addScaledVector(side,bodyDistance);overviewCamera.lookAt(body);
  renderer.getSize(size);const oldBackground=scene.background,worldPreyVisible=preyModel.visible;
  // The visitor's distance LOD is for the landscape. Optical close-ups use
  // the same existing live prey/empty shell, then restore its landscape flag.
  // Biological absence/death without a carried item never creates new prey.
  const detailPreyVisible=worldPreyVisible||!!(prey.visible&&(prey.alive||prey.emptyShell||actor.carriedPreyId===prey.id));
  scene.background=background;preyModel.visible=detailPreyVisible;
  const views=[];
  try{for(const [id,camera]of [['feeding-overview',overviewCamera],['feeding-contact',detailCamera]]){
   const rect=element.querySelector('#'+id).getBoundingClientRect(),x=rect.left,y=size.y-rect.bottom,w=rect.width,h=rect.height;
   camera.aspect=w/h;camera.updateProjectionMatrix();camera.updateMatrixWorld();renderer.setViewport(x,y,w,h);renderer.setScissor(x,y,w,h);renderer.setScissorTest(true);renderer.render(scene,camera);
   views.push({id,rect:{x,y:rect.top,width:w,height:h},fov:camera.fov,position:camera.position.toArray(),focus:id==='feeding-contact'?focus:body.toArray()});
  }}finally{
   preyModel.visible=worldPreyVisible;scene.background=oldBackground;renderer.setScissorTest(false);renderer.setViewport(0,0,size.x,size.y);
  }
  const run=context().runId;
  element.querySelector('#feeding-identity').textContent=`${actor.id} → ${prey.id}`;
  element.querySelector('#feeding-event').textContent=`${acquired?'Erwerb protokolliert':'Noch kein Erwerbsbeleg'} · Ereignis ${eventId||'noch nicht begonnen'} · Rundgang ${run}`;
  return {runId:run,eventId,eventRecorded:!!acquired,individualId:actor.id,preyId:prey.id,phase:actor.behaviorPhase,simulationTime:state.time,observer:{x:observer.x,z:observer.z},didacticMagnification:true,sharedLiveSceneNodes:true,preyGeometryUnscaled:true,freestandingView:true,preyVisible:detailPreyVisible,worldPreyVisible,distanceLODOverride:detailPreyVisible&&!worldPreyVisible,tissueVisible:preyModel.tissue?.visible,tip,carried,span,views};
 }
 return {toggle,hide,render};
}
