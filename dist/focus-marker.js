import * as THREE from './vendor/three.module.js?revision=120';
import { ANIMALS, PLANTS } from './biodiversity.js?revision=120';
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
// Project the selected individual, rather than highlighting every member of its species.
export function projectFocusBounds(box,camera,width,height) {
 let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
 const point=new THREE.Vector3();
 for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
  point.set(x,y,z).project(camera);if(point.z< -1||point.z>1)return null;
  const px=(point.x+1)*width/2,py=(1-point.y)*height/2;
  left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);
 }
 if(right<0||left>width||bottom<0||top>height)return null;
 const cx=(left+right)/2,cy=(top+bottom)/2,w=Math.max(36,right-left+14),h=Math.max(36,bottom-top+14);
 const rw=Math.min(w,width-24),rh=Math.min(h,height-24);
 return{left:clamp(cx-rw/2,12,width-rw-12),top:clamp(cy-rh/2,12,height-rh-12),width:rw,height:rh};
}
export class FocusMarker {
 constructor(camera,wildlife){this.camera=camera;this.wildlife=wildlife;this.box=new THREE.Box3();this.direction=new THREE.Vector3();this.center=new THREE.Vector3();this.element=document.getElementById('focus-target');this.label=document.getElementById('focus-target-label');}
 update(focus,enabled,journal,width,height){
  this.element.hidden=true;if(!enabled||!focus)return;
  const p=focus.item,s=focus.type==='animal'?ANIMALS[p.species]:PLANTS[p.id];
  if(focus.type==='animal'){
   if(p.trace){this.box.setFromCenterAndSize(this.center.set(p.renderX,p.y+.015,p.renderZ),this.direction.set(.09,.04,.06));}
   else if(!this.wildlife.boundsFor(p,this.box))return;
  }else{
   const tree=s.type==='tree';this.camera.getWorldDirection(this.direction);
   const distance=Math.hypot(p.x-this.camera.position.x,p.z-this.camera.position.z);
   const y=tree?clamp(this.camera.position.y+this.direction.y*distance/Math.max(.01,Math.hypot(this.direction.x,this.direction.z)),p.y+.5,p.y+p.size):p.y+p.size*.5;
   const radius=tree?(y>p.y+p.size*.4?p.size*.2:.42):Math.max(.09,p.size*.6);
   this.box.setFromCenterAndSize(this.center.set(p.x,y,p.z),this.direction.set(radius*2,tree?Math.min(4,p.size):p.size,radius*2));
  }
  this.camera.updateMatrixWorld();const rectangle=projectFocusBounds(this.box,this.camera,width,height);if(!rectangle)return;
  const style=this.element.style;style.left=rectangle.left+'px';style.top=rectangle.top+'px';style.width=rectangle.width+'px';style.height=rectangle.height+'px';
  this.element.dataset.kind=focus.type;this.element.dataset.species=p.species||p.id;
  this.label.textContent=journal.entries[p.species||p.id]?s.common:focus.type==='animal'?'Tier im Fokus':'Pflanze / Pilz im Fokus';
  this.element.hidden=false;
 }
}
