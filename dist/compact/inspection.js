import * as THREE from '../vendor/three.module.js?revision=120';
import { ObservationClock } from '../observation-clock.js';

// This magnifies the same active mesh, never an unrelated reference photograph.
export function mountInspection(canvas,source,onReady){
 const height=canvas.clientHeight||200,renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.25));renderer.setSize(Math.max(240,canvas.clientWidth),height,false);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#d6d4bf');scene.add(new THREE.HemisphereLight('#fff5df','#57664f',3));const light=new THREE.DirectionalLight('#fff1d0',3);light.position.set(4,6,3);scene.add(light);
 const specimen=source.clone(true);specimen.visible=true;specimen.position.set(0,0,0);specimen.rotation.set(0,0,0);specimen.traverse(o=>{if(o.isMesh){o.geometry=o.geometry.clone();o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();}});const pivot=new THREE.Group();pivot.add(specimen);scene.add(pivot);scene.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(specimen),centre=bounds.getCenter(new THREE.Vector3()),radius=Math.max(.001,bounds.getSize(new THREE.Vector3()).length()*.55);specimen.position.sub(centre);
 const camera=new THREE.PerspectiveCamera(38,Math.max(240,canvas.clientWidth)/height,radius/100,radius*20);camera.position.set(radius*1.8,radius*.85,radius*2.2);camera.lookAt(0,0,0);const clock=new ObservationClock();let stopped=false,lost=false,raf,watch=0,pointer=null;
 const reset=()=>{clock.reset();watch=0;onReady(0);};
 const down=e=>{canvas.setPointerCapture(e.pointerId);pointer={id:e.pointerId,x:e.clientX,y:e.clientY};reset();};
 const move=e=>{if(pointer?.id!==e.pointerId)return;pivot.rotation.y+=(e.clientX-pointer.x)*.01;pivot.rotation.x=Math.max(-1.2,Math.min(1.2,pivot.rotation.x+(e.clientY-pointer.y)*.01));pointer.x=e.clientX;pointer.y=e.clientY;reset();};
 const up=()=>{pointer=null;reset();};
 for(const [event,fn]of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up]])canvas.addEventListener(event,fn);
 const hidden=()=>reset();document.addEventListener('visibilitychange',hidden);window.addEventListener('blur',hidden);
 const loss=event=>{event.preventDefault();lost=true;canvas.dataset.ready='false';reset();onReady(0,'Nahdarstellung unterbrochen. Schließe und öffne die Nahansicht erneut oder warte auf die Wiederherstellung.');},restore=()=>{lost=false;reset();};canvas.addEventListener('webglcontextlost',loss);canvas.addEventListener('webglcontextrestored',restore);
 const resize=()=>{const h=canvas.clientHeight||200,w=Math.max(240,canvas.clientWidth);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();reset();};window.addEventListener('resize',resize);
 function frame(now){if(stopped)return;raf=requestAnimationFrame(frame);if(lost){clock.reset();watch=0;onReady(0,'Nahdarstellung unterbrochen. Schließe und öffne die Nahansicht erneut oder warte auf die Wiederherstellung.');return;}if(document.hidden){reset();return;}renderer.render(scene,camera);canvas.dataset.ready='true';if(pointer){reset();return;}watch+=clock.step('actual-magnified-mesh',now);onReady(watch);}
 raf=requestAnimationFrame(frame);
 return ()=>{stopped=true;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);canvas.removeEventListener('webglcontextlost',loss);canvas.removeEventListener('webglcontextrestored',restore);document.removeEventListener('visibilitychange',hidden);window.removeEventListener('blur',hidden);specimen.traverse(o=>{if(o.isMesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});renderer.dispose();renderer.forceContextLoss();};
}
