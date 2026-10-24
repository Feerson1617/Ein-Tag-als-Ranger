import * as THREE from '../vendor/three.module.js?revision=120';
import { billPoint,carriedPreyPoint,mouthPoint,coastalRig } from './coastal-rig.js';

// A lens follows ONE real episode until explicitly closed/reopened. It never
// borrows the next target or replays an earlier pose after acquisition.
export function feedingEpisode(previous,actor,runId){
 if(previous?.runId===runId&&previous.individualId===actor.id){
  if(!previous.eventId&&actor.targetId&&actor.targetId!==previous.preyId)return feedingEpisode(null,actor,runId);
  if(!previous.eventId&&actor.feedingPreyId===previous.preyId&&actor.feedingEventId)return {...previous,eventId:actor.feedingEventId};
  return previous;
 }
 const preyId=actor.carriedPreyId||actor.targetId||actor.lastFeeding?.preyId;
 if(!preyId)return null;
 const eventId=actor.feedingPreyId===preyId?actor.feedingEventId:actor.lastFeeding?.preyId===preyId?actor.lastFeeding.eventId:null;
 return {runId,individualId:actor.id,preyId,eventId:eventId||null};
}
export function lensClip(rect,panel,width,height){
 const x=Math.max(0,rect.left,panel.left),top=Math.max(0,rect.top,panel.top),right=Math.min(width,rect.right,panel.right),bottom=Math.min(height,rect.bottom,panel.bottom);
 return {x,y:height-bottom,width:Math.max(0,right-x),height:Math.max(0,bottom-top)};
}
// Fit the true head/bill/resource extents in camera coordinates. A wide lens
// must not divide a tall approach pose by its aspect ratio and cut both ends.
export function feedingFraming(actor,resource,resourceSize,aspect){
 const rig=coastalRig(actor.taxon),mouth=mouthPoint(actor),tip=billPoint(actor),side=new THREE.Vector3(-Math.sin(actor.heading),.22,Math.cos(actor.heading)).normalize(),right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),side).normalize(),up=new THREE.Vector3().crossVectors(side,right).normalize();
 const entries=[[mouth,rig.scale*.28],[tip,rig.scale*.06],...(resource?[[resource,Math.max(.002,resourceSize*.8)]]:[])],minimum=[Infinity,Infinity,Infinity],maximum=[-Infinity,-Infinity,-Infinity],axes=[right,up,side];
 for(const[point,radius]of entries){const p=new THREE.Vector3().copy(point);for(let i=0;i<3;i++){const v=p.dot(axes[i]);minimum[i]=Math.min(minimum[i],v-radius);maximum[i]=Math.max(maximum[i],v+radius);}}
 const focus=new THREE.Vector3();for(let i=0;i<3;i++)focus.addScaledVector(axes[i],(minimum[i]+maximum[i])/2);
 const span=Math.max(.07,(maximum[1]-minimum[1])*1.12,(maximum[0]-minimum[0])*1.12/Math.max(.25,aspect)),depth=maximum[2]-minimum[2],distance=span/(2*Math.tan(THREE.MathUtils.degToRad(16)))+depth/2;
 return {focus,side,distance,span,points:entries.map(([p,radius])=>({point:{...p},radius}))};
}
// These cameras render the same live scene nodes. No clones, geometry scaling,
// state writes, invented prey, independent animation or observation credit.
export function createFeedingDetail({scene,renderer,state,models,element,context,observer}){
 const detailCamera=new THREE.PerspectiveCamera(32,1,.005,12),overviewCamera=new THREE.PerspectiveCamera(35,1,.005,12),background=new THREE.Color('#bbbda9'),size=new THREE.Vector2(),oldViewport=new THREE.Vector4(),oldScissor=new THREE.Vector4();
 const lenses=element.querySelector('.feeding-lenses');
 let enabled=false,tagged=[],episode=null,recorded=false,lightLayersReady=false;
 const clearLayers=()=>{for(const root of tagged)root.traverse(node=>node.layers.disable(31));tagged=[];};
 function toggle(){enabled=!enabled;element.hidden=!enabled;if(!enabled){clearLayers();episode=null;recorded=false;}else{episode=null;recorded=false;element.scrollTop=0;}return enabled;}
 function hide(){enabled=false;element.hidden=true;clearLayers();episode=null;recorded=false;}
 function render(actor){
  if(!enabled||!actor){element.hidden=true;clearLayers();return null;}
  element.hidden=false;
  const run=context().runId,next=feedingEpisode(episode,actor,run);
  if(next?.runId!==episode?.runId||next?.individualId!==episode?.individualId)recorded=false;
  episode=next;
  const prey=state.ecology.actors.find(a=>a.id===episode?.preyId),bird=models.get(actor.id),preyModel=models.get(episode?.preyId),rig=coastalRig(actor.taxon);
  if(!rig||!bird||!prey||!preyModel){
   lenses.hidden=true;
   element.querySelector('#feeding-identity').textContent='Noch kein konkretes Beuteziel.';
   element.querySelector('#feeding-event').textContent='Im unbeschleunigten Modelllauf warten oder einen beschrifteten Feinschritt ausführen.';
   return null;
  }
  lenses.hidden=false;
  const acquired=state.ecology.events.find(e=>e.id===episode.eventId&&e.actors[0]===actor.id&&e.actors[1]===prey.id);
  recorded=recorded||!!acquired;
  const carrying=actor.carriedPreyId===prey.id,completed=recorded&&!carrying,
   roots=[bird,...(!completed?[preyModel,...(preyModel.tissue?[preyModel.tissue]:[])]:[])];
  if(roots.length!==tagged.length||roots.some((n,i)=>n!==tagged[i])){clearLayers();tagged=roots;for(const root of tagged)root.traverse(node=>node.layers.enable(31));}
  if(!lightLayersReady){scene.traverse(node=>{if(node.isLight)node.layers.enable(31);});lightLayersReady=true;}
  detailCamera.layers.set(31);overviewCamera.layers.set(31);
  const tip=billPoint(actor),mouth=mouthPoint(actor),carried=carriedPreyPoint(actor,state.time,state.modelRevision),preyPosition=carrying?carried:{x:prey.x,y:prey.y+prey.size*.12,z:prey.z};
  // Head and bill define the minimum view. Tiny prey never pulls the camera
  // into the head. After uptake the lens stays on the live mouth, not the shell.
  let framing=feedingFraming(actor,completed?null:preyPosition,prey.size,1),span=framing.span;const {focus,side,distance}=framing;
  detailCamera.near=Math.max(.002,distance*.01);detailCamera.far=Math.max(4,distance*5);
  detailCamera.position.copy(focus).addScaledVector(side,distance);detailCamera.lookAt(focus);
  const body=new THREE.Vector3(actor.x,actor.y+rig.scale,actor.z),bodyDistance=rig.unitLength*rig.scale/(2*Math.tan(THREE.MathUtils.degToRad(overviewCamera.fov/2)))*1.4;
  overviewCamera.position.copy(body).addScaledVector(side,bodyDistance);overviewCamera.lookAt(body);
  renderer.getSize(size);renderer.getViewport(oldViewport);renderer.getScissor(oldScissor);const oldScissorTest=renderer.getScissorTest(),oldBackground=scene.background,worldPreyVisible=preyModel.visible;
  const detailPreyVisible=!completed&&(worldPreyVisible||!!(prey.visible&&(prey.alive||prey.emptyShell||carrying)));
  scene.background=background;preyModel.visible=detailPreyVisible;
  const views=[],panel=element.getBoundingClientRect();
  try{for(const [id,camera]of [['feeding-overview',overviewCamera],['feeding-contact',detailCamera]]){
   const rect=element.querySelector('#'+id).getBoundingClientRect(),clip=lensClip(rect,panel,size.x,size.y),w=rect.width,h=rect.height;
   if(w>0&&h>0&&clip.width>0&&clip.height>0){camera.aspect=w/h;if(id==='feeding-contact'){framing=feedingFraming(actor,completed?null:preyPosition,prey.size,camera.aspect);span=framing.span;camera.position.copy(framing.focus).addScaledVector(framing.side,framing.distance);camera.near=Math.max(.002,framing.distance*.01);camera.far=Math.max(4,framing.distance*5);camera.lookAt(framing.focus);}camera.updateProjectionMatrix();camera.updateMatrixWorld();renderer.setViewport(rect.left,size.y-rect.bottom,w,h);renderer.setScissor(clip.x,clip.y,clip.width,clip.height);renderer.setScissorTest(true);renderer.render(scene,camera);}
   views.push({id,rect:{x:rect.left,y:rect.top,width:w,height:h},clip,fov:camera.fov,position:camera.position.toArray(),focus:id==='feeding-contact'?framing.focus.toArray():body.toArray()});
  }}finally{preyModel.visible=worldPreyVisible;scene.background=oldBackground;renderer.setViewport(oldViewport);renderer.setScissor(oldScissor);renderer.setScissorTest(oldScissorTest);}
  const preyNames={mytilus_edulis:'Miesmuschel',crangon_crangon:'Garnele',juvenile_worm:'kleiner Wurm'},resource=preyNames[prey.taxon]||'kleine Wurmbeute';
  element.querySelector('#feeding-identity').textContent=completed?'Folge abgeschlossen · derselbe Vogel':resource+' · derselbe Vogel und dieselbe konkrete Beute';
  element.querySelector('#feeding-event').textContent=completed?'Aufnahme protokolliert. Der Vogel bewegt sich weiter; diese Ansicht springt nicht zum nächsten Futterpunkt. Für die nächste Folge schließen und neu öffnen.':carrying?'Aufgenommen: äußerer Weg zum Mund. Der innere Vorgang bleibt vereinfacht.':acquired?'Aufnahme protokolliert.':'Suchweise und Kontakt beobachten. Ein Modellbild ist noch kein eigener Beleg.';
  element.querySelector('#feeding-provenance').textContent=JSON.stringify({rundgang:run,individuum:actor.id,beute:prey.id,ereignis:episode.eventId},null,2);
  return {runId:run,eventId:episode.eventId,eventRecorded:recorded,individualId:actor.id,preyId:prey.id,phase:actor.behaviorPhase,episodeCompleted:completed,simulationTime:state.time,observer:{x:observer.x,z:observer.z},didacticMagnification:true,sharedLiveSceneNodes:true,preyGeometryUnscaled:true,freestandingView:true,preyVisible:detailPreyVisible,worldPreyVisible,distanceLODOverride:detailPreyVisible&&!worldPreyVisible,tissueVisible:preyModel.tissue?.visible,tip,mouth,carried,span,views};
 }
 return {toggle,hide,render};
}
