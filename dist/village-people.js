import { indexGeometry } from './mesh-geometry.js?revision=120';
import * as THREE from './vendor/three.module.js?revision=120';

export const RESIDENTS=[
 {name:'Hannes',role:'Nachbar',greeting:'Herzlich willkommen bei uns! Schön, dass du unser neues Rangerteam verstärkst.',tip:'Die Amseln suchen oft zwischen den Gartenbeeten. Beobachte erst die Art, dann ihre Nahrungssuche.'},
 {name:'Maren',role:'Imkerin',greeting:'Herzlich willkommen! Ich kümmere mich hier um die Bienen. Ein schöner Tag für deinen ersten Rundgang.',tip:'Folge einer Sammlerin zu den Blüten und zurück zum Stock. Die Lupe hilft dir, ihre Nahrungspflanzen zu bestimmen.',action:'Bestäubung untersuchen'},
 {name:'Lina',role:'Gärtnerin',greeting:'Moin! Schöner Tag heute. In meinem Garten lasse ich auch wilde Blüten stehen.',tip:'Hast du heute schon in dein Questbuch geschaut? Eine ausgewählte Wechselwirkung führt dich zu den passenden Arten.',action:'Questbuch öffnen'},
 {name:'Jens',role:'Nachbar',greeting:'Herzlich willkommen in unserem kleinen Dorf! Der Bohlenweg verbindet dein ganzes Revier.',tip:'Auf der Karte findest du Waldteiche, Feldsäume und Küstenlebensräume. Für eine Beobachtung darfst du den Weg verlassen.',action:'Karte ansehen'},
 {name:'Greta',role:'Nachbarin',greeting:'Moin, unser neuer Ranger! Ich freue mich über Gesellschaft im Garten.',tip:'Ein Kormoran breitet am Ruhefelsen im See seine Flügel aus. Lass ihm Abstand und beobachte ihn mit dem Fernglas.'}
];

export function createResidentLocations(world,ground){
 world.residents=world.village.houses.map((p,index)=>{
  const u=index===1?.15:0,v=p.depth/2+2.8;
  const x=p.x+Math.cos(p.rotation)*u+Math.sin(p.rotation)*v,z=p.z-Math.sin(p.rotation)*u+Math.cos(p.rotation)*v;
  const resident={...RESIDENTS[index],id:`resident-${index}`,house:p.id,index,x,z,y:ground(x,z),height:index===4?1.63:1.73,heading:p.rotation};
  world.collisions.push({x,z,r:.25,height:resident.height,type:'person'});return resident;
 });
}

// Residents use the animals' shaded, coloured 3D geometry and world lighting.
// Five compact stationary bodies replace the mismatched photographic billboards.
const sphere=new THREE.SphereGeometry(1,12,8),cylinder=new THREE.CylinderGeometry(1,1,1,10),box=new THREE.BoxGeometry(1,1,1);
function parts(){
 const position=[],normal=[],color=[];
 return {add(g,c,p,scale,rotation=[0,0,0]){const copy=g.clone();if(copy.index){const flat=copy.toNonIndexed();copy.dispose();g=flat;}else g=copy;
  const m=new THREE.Matrix4().compose(new THREE.Vector3(...p),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(...scale));g.applyMatrix4(m);
  const rgb=new THREE.Color(c),a=g.attributes.position,n=g.attributes.normal;
  for(let i=0;i<a.count;i++){position.push(a.getX(i),a.getY(i),a.getZ(i));normal.push(n.getX(i),n.getY(i),n.getZ(i));const shade=.97+.025*Math.sin(a.getX(i)*81+a.getY(i)*49);const tint=g.attributes.color;color.push((tint?.getX(i)??rgb.r)*shade,(tint?.getY(i)??rgb.g)*shade,(tint?.getZ(i)??rgb.b)*shade);}g.dispose();
 },finish(){const g=new THREE.BufferGeometry();for(const [key,list]of [['position',position],['normal',normal],['color',color]])g.setAttribute(key,new THREE.Float32BufferAttribute(list,3));indexGeometry(g);g.computeBoundingSphere();return g;}};
}
function limb(r,c,a,b,width){const v=new THREE.Vector3(...a),w=new THREE.Vector3(...b),d=w.clone().sub(v),e=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize()));r.add(cylinder,c,v.add(w).multiplyScalar(.5).toArray(),[width,d.length(),width],[e.x,e.y,e.z]);}
// A continuous face replaces overlapping balls and the rectangular mouth.
// Features are embedded in the skin surface: subdued eyes, curved lids and lips.
function humanFace(skin){
 const profile=[[-.012,.039,.043,.006],[.012,.064,.059,.003],[.043,.077,.070,0],[.078,.087,.079,-.004],[.116,.091,.080,-.007],[.154,.091,.079,-.011],[.191,.095,.082,-.013],[.227,.084,.076,-.017],[.257,.055,.053,-.020],[.275,.001,.001,-.023]];
 const curve=new THREE.CatmullRomCurve3(profile.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),centres=new THREE.CatmullRomCurve3(profile.map(p=>new THREE.Vector3(0,p[0],p[3]))),position=[],indices=[],colors=[],base=new THREE.Color(skin),warm=new THREE.Color('#b78979');
 for(let i=0;i<=32;i++){const q=curve.getPoint(i/32),centre=centres.getPoint(i/32);for(let j=0;j<=40;j++){const theta=j/40*Math.PI*2,x=Math.sin(theta)*q.y,front=Math.max(0,Math.cos(theta));let z=centre.z+Math.cos(theta)*q.z;
  const gauss=(cx,cy,sx,sy)=>Math.exp(-(((x-cx)/sx)**2+((q.x-cy)/sy)**2))*front**7;
  z+=.013*gauss(0,.137,.014,.045)+.027*gauss(0,.106,.019,.022)+.004*(gauss(-.042,.092,.032,.025)+gauss(.042,.092,.032,.025))-.003*(gauss(-.033,.153,.016,.012)+gauss(.033,.153,.016,.012));
  position.push(x,q.x,z);const blush=.08*(gauss(-.052,.10,.029,.025)+gauss(.052,.10,.029,.025)),c=base.clone().lerp(warm,blush);colors.push(c.r,c.g,c.b);
  if(i<32&&j<40){const a=i*41+j;indices.push(a,a+1,a+41,a+1,a+42,a+41);}
 }}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(position,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
function hairSurface(index){
 const position=[],indices=[];
 for(let i=0;i<=14;i++)for(let j=0;j<=32;j++){const a=j/32*Math.PI*2,front=Math.max(0,Math.cos(a)),limit=1.91-front*(index===1||index===2?.64:.73),t=i/14*limit;
  position.push(Math.sin(t)*Math.sin(a)*.099,.145+Math.cos(t)*.136,-.019+Math.sin(t)*Math.cos(a)*.095);
  if(i<14&&j<32){const n=i*33+j;indices.push(n,n+33,n+1,n+1,n+33,n+34);}
 }const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(position,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function residentGeometry(index){
 const body=parts(),head=parts(),skin=['#c3a08a','#d1af97','#c4a188','#c4a28b','#cbb29b'][index],coat=['#6d7662','#d4ccb5','#747f79','#6f7d87','#888076'][index],pants=['#4a4c47','#858372','#5c6257','#535956','#595e56'][index],hair=['#77746a','#776651','#675745','#68605a','#b7b1a1'][index];
 const ell=(r,c,p,s)=>r.add(sphere,c,p,s),width=index===1||index===2?.184:.198;
 ell(body,pants,[0,.88,0],[.17,.13,.10]);ell(body,coat,[0,1.14,0],[width,.25,.115]);ell(body,coat,[0,1.31,-.005],[width+.009,.093,.102]);
 for(const side of [-1,1]){
  const ankle=[side*.095,.12,side*.01],knee=[side*.105,.48,.018],hip=[side*.09,.90,0];limb(body,pants,hip,knee,.065);limb(body,pants,knee,ankle,.049);ell(body,pants,knee,[.061,.072,.054]);ell(body,'#45483e',[side*.095,.049,.056],[.065,.049,.123]);
  const bent=index===1&&side===1,shoulder=[side*width,1.30,-.005],elbow=[side*.235,1.075,bent?.055:.012],wrist=[side*(bent?.165:.252),bent?1.025:.865,bent?.195:.044];
  limb(body,coat,shoulder,elbow,.061);ell(body,coat,shoulder,[.067,.077,.065]);ell(body,coat,elbow,[.051,.062,.050]);limb(body,coat,elbow,wrist,.042);ell(body,skin,[wrist[0],wrist[1]-.032,wrist[2]],[.032,.055,.024]);ell(body,skin,[wrist[0]-side*.024,wrist[1]-.015,wrist[2]+.012],[.014,.029,.014]);
 }
 limb(body,skin,[0,1.365,0],[0,1.49,0],.043);
 for(const side of [-1,1])body.add(box,coat,[side*.044,1.372,.089],[.068,.014,.045],[0,0,side*.3]);
 for(const y of [1.28,1.17,1.05])ell(body,'#615e50',[0,y,.115],[.006,.006,.003]);
 if(index===2||index===4)body.add(box,index===2?'#a7a08a':'#a59b89',[0,1.055,.108],[.27,.30,.013]);
 if(index===1){body.add(box,'#b9b09c',[0,1.14,.116],[.007,.36,.005]);for(const side of [-1,1])body.add(box,'#c9c1aa',[side*.097,1.18,.107],[.070,.075,.013]);}
 const face=humanFace(skin);head.add(face,skin,[0,0,0],[1,1,1]);face.dispose();
 for(const side of [-1,1]){
  ell(head,skin,[side*.096,.121,-.014],[.013,.025,.014]);ell(head,'#b68e78',[side*.099,.121,-.002],[.006,.012,.003]);
  const x=side*.033,z=.0635;
  ell(head,'#d5c4b1',[x,.153,z],[.012,.0043,.0032]);ell(head,index===1?'#665c42':'#69675b',[x,.153,z+.0029],[.0034,.0033,.0012]);ell(head,'#383a32',[x,.153,z+.0038],[.0017,.0024,.0007]);
  limb(head,'#b18d79',[x-side*.012,.153,z+.0004],[x-side*.005,.158,z+.0011],.0016);limb(head,'#b18d79',[x-side*.005,.158,z+.0011],[x+side*.009,.155,z+.0005],.0016);
  limb(head,skin,[x-side*.011,.150,z],[x+side*.010,.151,z],.0017);
  limb(head,hair,[side*.021,.172,.067],[side*.036,.176,.066],.002);limb(head,hair,[side*.036,.176,.066],[side*.051,.172,.062],.0018);
  ell(head,'#a6806c',[side*.010,.094,.109],[.004,.002,.002]);
  limb(head,'#aa7e70',[0,.058,.077],[side*.010,.059,.077],.0018);limb(head,'#aa7e70',[side*.010,.059,.077],[side*.018,.062,.075],.0013);
 }
 limb(head,'#c19683',[-.010,.054,.077],[.010,.054,.077],.0022);
 const scalp=hairSurface(index);head.add(scalp,hair,[0,0,0],[1,1,1]);scalp.dispose();
 if(index===1)ell(head,hair,[0,.112,-.105],[.042,.047,.034]);if(index===2)ell(head,hair,[0,.111,-.105],[.066,.076,.030]);
 if(index===0){head.add(cylinder,'#6f715e',[0,.266,-.010],[.104,.042,.091]);ell(head,'#6f715e',[0,.245,.010],[.120,.007,.113]);}
 if(index===1){head.add(cylinder,'#d7c9aa',[0,.271,-.014],[.105,.052,.094]);ell(head,'#d7c9aa',[0,.247,-.004],[.146,.008,.132]);head.add(cylinder,'#9c9078',[0,.252,-.014],[.106,.011,.095]);}
 const headGeometry=head.finish();headGeometry.scale(.95,.92,.95);headGeometry.computeBoundingSphere();return {body:body.finish(),head:headGeometry};
}
export class VillagePeople {
 constructor(scene,world){
  this.people=world.residents;this.material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9});this.models=[];this.clock=0;
  for(const p of this.people){const geometry=residentGeometry(p.index),group=new THREE.Group(),body=new THREE.Mesh(geometry.body,this.material),head=new THREE.Mesh(geometry.head,this.material);
   body.castShadow=head.castShadow=true;body.receiveShadow=head.receiveShadow=true;head.position.y=1.48;group.add(body,head);group.position.set(p.x,p.y,p.z);group.rotation.y=p.heading;group.scale.setScalar(p.height/1.733);scene.add(group);this.models.push({person:p,group,body,head,yaw:0});
  }
 }
 update(camera,observer,dusk=false,dt=.033){
  this.clock+=dt;
  for(const m of this.models){const p=m.person,d=Math.hypot(p.x-observer.x,p.z-observer.z);m.group.visible=d<55;if(!m.group.visible)continue;
   const angle=Math.atan2(camera.position.x-p.x,camera.position.z-p.z)-p.heading,wrapped=Math.atan2(Math.sin(angle),Math.cos(angle)),target=d<6?Math.max(-.7,Math.min(.7,wrapped)):0;
   m.yaw+=(target-m.yaw)*(1-Math.exp(-dt*4));m.head.rotation.y=m.yaw;m.head.rotation.z=.012*Math.sin(this.clock*.7+p.index);m.body.scale.y=1+.0015*Math.sin(this.clock*1.4+p.index);m.head.position.y=1.48+.0015*Math.sin(this.clock*1.4+p.index);
  }
 }
}
