import { flightFeather } from './flight-feathers.js';
import { authoredWildlifeGeometry } from './authored-wildlife.js?revision=121';
import { pairedWingGeometry, wingShader, wingPose } from './bird-wings.js?revision=120';
import { birdPalette } from './bird-plumage.js?revision=120';
import { avianTorso } from './avian-anatomy.js?revision=120';
import { advanceMotion, motionShader, motionShaderKey, prepareLegRig, updateGroundPose } from './wildlife-motion.js?revision=120';
import { indexGeometry } from './mesh-geometry.js?revision=120';
import * as THREE from './vendor/three.module.js?revision=120';
import { ANIMALS } from './biodiversity.js?revision=120';
import { ViewVolume, uploadInstances } from './render-visibility.js?revision=120';
import { sealSurfaceY } from './observation-tools.js?revision=120';
import { createAnimal } from './animals.js?revision=120';

// Anatomy is built at life size; one coloured geometry per taxon keeps the tablet draw budget small.
const sphere=new THREE.SphereGeometry(1,12,8),headSphere=new THREE.SphereGeometry(1,18,12),cone=new THREE.ConeGeometry(1,1,10),cylinder=new THREE.CylinderGeometry(1,1,1,8),box=new THREE.BoxGeometry(1,1,1);
function recipe(){
 const positions=[],normals=[],colors=[],uvs=[],rigs=[],joints=[];
 const feet=new Map(),slots=new Map();const r={rig:null,autorig:null,add(g,color,p=[0,0,0],s=[1,1,1],rot=[0,0,0]){
  const geo=g.clone().toNonIndexed(),m=new THREE.Matrix4().compose(new THREE.Vector3(...p),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),new THREE.Vector3(...s));geo.applyMatrix4(m);
  const a=geo.attributes.position.array,n=geo.attributes.normal.array,c=new THREE.Color(color||'#68594c'),rig=r.rig||r.autorig?.(p),pivot=rig?.pivot||[0,0,0],joint=rig?.joint||pivot;if(rig?.foot){feet.set(rig.part,rig.foot);slots.set(rig.part,rig.slot??rig.part-1);}
  for(let i=0;i<a.length;i+=3){positions.push(a[i],a[i+1],a[i+2]);normals.push(n[i],n[i+1],n[i+2]);const ui=i/3*2;uvs.push(geo.attributes.uv?.array[ui]||0,geo.attributes.uv?.array[ui+1]||0);const shade=1-.05*(Math.sin(a[i]*79+a[i+1]*37)+1),vertex=geo.attributes.color?.array;colors.push(c.r*shade*(vertex?vertex[i]:1),c.g*shade*(vertex?vertex[i+1]:1),c.b*shade*(vertex?vertex[i+2]:1));rigs.push(rig?.part||0,...pivot);joints.push(...joint,rig?.knee||0);}geo.dispose();
 },finish(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setAttribute('rigData',new THREE.Float32BufferAttribute(rigs,4));g.setAttribute('rigJoint',new THREE.Float32BufferAttribute(joints,4));g.userData.legFeet=Object.fromEntries(feet);g.userData.legSlots=Object.fromEntries(slots);g.computeBoundingSphere();return g;}};return r;
}
function transformRig(g,m){const v=new THREE.Vector3();for(const key in g.userData.legFeet||{})g.userData.legFeet[key]=v.fromArray(g.userData.legFeet[key]).applyMatrix4(m).toArray();for(const name of ['rigData','rigJoint']){const a=g.attributes[name];for(let i=0;i<a.count;i++){const start=name==='rigData'?1:0;v.fromArray(a.array,i*4+start).applyMatrix4(m);v.toArray(a.array,i*4+start);}a.needsUpdate=true;}}
function scaleRig(g,k){transformRig(g,new THREE.Matrix4().makeScale(k,k,k));}
function coatTexture(){const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');c.fillStyle='#e9e7df';c.fillRect(0,0,256,256);let seed=78;for(let i=0;i<12000;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%256;seed=(seed*1664525+1013904223)>>>0;const y=seed%256;c.strokeStyle=i%3?'#c5c6b730':'#f8f6ee55';c.lineWidth=.55;c.beginPath();c.moveTo(x,y);c.lineTo(x+1.5,y+3.5);c.stroke();}const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,4);return t;}
function eyeSurfaceShader(shader){shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n#ifdef USE_MAP\nif(vMapUv.x<0.0)roughnessFactor=.18;\n#endif');}
function surfaceCell(s){return s.type==='mammal'||s.form==='bee'?0:s.type==='bird'?1:s.type==='fish'?2:s.type==='shell'?3:null;}
function surfaceShader(shader,cell){if(cell==null)return;const x=cell%2*.5,y=(1-Math.floor(cell/2))*.5;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP\nvec4 sampledDiffuseColor=texture2D(map,fract(vMapUv)*0.494+vec2(${x+.003},${y+.003}));diffuseColor*=sampledDiffuseColor;\n#endif`);}
function limb(r,c,a,b,width){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),v=vb.clone().sub(va),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize()),e=new THREE.Euler().setFromQuaternion(q);r.add(cylinder,c,va.add(vb).multiplyScalar(.5).toArray(),[width,v.length(),width],[e.x,e.y,e.z]);}
function jointedLeg(r,color,part,hip,joint,foot,width,slot=part-1){
 r.rig={part,pivot:hip,joint,foot,knee:0,slot};limb(r,color,hip,joint,width);
 r.rig.knee=1;limb(r,color,joint,foot,width*.7);r.rig.knee=2;
 r.add(sphere,color,foot,[width*1.5,width*.65,width*1.8]);r.rig=null;
}
function bird(s){const r=recipe(),c=birdPalette(s),form=s.form,cormorant=s.id==='phalacrocorax_carbo',water=['duck','swan','goose'].includes(form),long=['wader','heron'].includes(form),raptor=['raptor','owl'].includes(form);let scale=s.size||.22;
 const body=cormorant?[.34,.125,.12]:water?[.32,.155,.16]:[.255,.145,.125],leg=s.legRatio??(cormorant?.085:water?.055:long?(s.id.includes('ciconia')||s.id.includes('ardea')?.6:s.id.includes('calidris')||s.id.includes('charadrius')?.22:.4):.18),base=leg+body[1];r.autorig=p=>p[0]>.14&&p[1]>base+.095?{part:6,pivot:[.12,base+.09,0]}:null;const torso=avianTorso(body,c,s.id);r.add(torso,'#ffffff',[0,base,0]);torso.dispose();
 let head=[.23,base+.15,0];if(form==='swan'||form==='goose'||s.id==='platalea_leucorodia'||s.id.includes('ciconia')||s.id.includes('ardea')||s.id.includes('phalacrocorax')){limb(r,c.body,[.1,base,0],[.16,base+.43,0],.045);head=[.25,base+.5,0];}r.add(headSphere,c.head,head,[raptor?.125:.1,raptor?.13:.105,.09]);
 const beak=s.billRatio??(long?(s.id.includes('charadrius')?.065:s.id.includes('calidris_alba')?.10:s.id.includes('calidris')?.16:s.id.includes('limosa')?.34:.25):form==='woodpecker'?.14:water?.15:raptor?.07:form==='tern'?.23:form==='gull'?.14:.065);if(s.beakShape==='downcurved'||s.beakShape==='slight-up'){for(let k=0;k<10;k++){const sign=s.beakShape==='downcurved'?-1:.25,xx=t=>head[0]+.08+beak*t,yy=t=>head[1]-.02+sign*beak*.5*t*t;limb(r,c.beak,[xx(k/10),yy(k/10),0],[xx((k+1)/10),yy((k+1)/10),0],.012*(1-k*.06));}}else if(s.id.includes('recurvirostra')){for(let k=0;k<6;k++)limb(r,c.beak,[head[0]+.08+k*.045,head[1]-.02+k*k*.004,0],[head[0]+.08+(k+1)*.045,head[1]-.02+(k+1)*(k+1)*.004,0],.01);}else r.add(cone,c.beak,[head[0]+.09+beak/2,head[1]-.02,0],[water?.038:s.id.includes('haematopus')?.025:.014,beak,s.beakShape==='broad'?.11:water?.065:.02],[0,0,-Math.PI/2]);if(s.beakShape==='spoon')r.add(sphere,'#c4b774',[head[0]+.09+beak,head[1]-.02,0],[.065,.013,.048]);if(raptor)r.add(cone,c.beak,[head[0]+.145,head[1]-.057,0],[.025,.058,.025],[0,0,.25]);
 for(const side of [-1,1]){if(c.eyeRing)r.add(sphere,c.eyeRing,[head[0]+.04,head[1]+.012,side*.085],[.013,.013,.006]);r.add(sphere,c.eye||'#111512',[head[0]+.04,head[1]+.012,side*.089],[.008,.008,.006]);const hip=[-.035,leg,side*.067],joint=[-.075,leg*.52,side*.075],foot=[-.01,.025,side*.075];r.rig={part:side<0?1:2,pivot:hip,joint,foot,knee:0};limb(r,c.legs,hip,joint,.011);r.rig.knee=1;limb(r,c.legs,joint,foot,.009);r.rig.knee=2;for(let t=0;t<3;t++)limb(r,c.legs,foot,[.06,.016,side*.075+(t-1)*.018],.006);r.rig=null;r.add(sphere,c.wing,[-.08,base+.01,side*.125],[.19,.11,.018],[.1,0,side*.08]);
  if(c.wingBar)for(let k=0;k<(['parus_major','fringilla_coelebs'].includes(s.id)?2:1);k++)r.add(box,c.wingBar,[-.06-k*.055,base+.014,side*.147],[.024,.13,.011],[0,0,.34]);
  if(c.speculum)r.add(sphere,c.speculum,[-.18,base+.015,side*.146],[.075,.033,.010]);
 }
 if(c.cap)r.add(sphere,c.cap,[head[0]-.005,head[1]+.066,0],[.105,.047,.091]);
 if(c.billTip)r.add(cone,c.billTip,[head[0]+.09+beak*.88,head[1]-.02,0],[.011,beak*.25,.012],[0,0,-Math.PI/2]);
 if(c.billSpot)for(const side of [-1,1])r.add(sphere,c.billSpot,[head[0]+.09+beak*.68,head[1]-.034,side*.018],[.019,.009,.003]);
 if(c.lowerBillBase)r.add(sphere,c.lowerBillBase,[head[0]+.11,head[1]-.033,0],[.05,.006,.013]);
 if(c.rump)r.add(sphere,c.rump,[-.23,base-.02,0],[.06,.055,.12]);
 r.add(box,c.back,[cormorant?-.38:-.31,base+.035,0],[cormorant?.29:.22,.025,cormorant?.09:.13],[0,0,.18]);
 if(cormorant){for(const side of [-1,1]){r.add(sphere,'#c0bda3',[head[0]+.04,head[1]-.045,side*.077],[.043,.028,.009]);r.add(sphere,'#947f4d',[head[0]+.065,head[1]-.068,side*.058],[.038,.022,.012]);r.add(sphere,'#50705d',[head[0]+.042,head[1]+.012,side*.090],[.009,.009,.004]);r.add(sphere,'#121711',[head[0]+.044,head[1]+.012,side*.093],[.004,.004,.002]);}r.add(cone,c.beak,[head[0]+.22,head[1]-.041,0],[.014,.041,.017],[0,0,.25]);}
 // Distinct field marks matter more than a name floating above a generic bird.
 if(s.id==='parus_major'||s.id.includes('caeruleus')){r.add(sphere,'#c6bc59',[.1,base-.1,0],[.18,.09,.12]);if(s.id==='parus_major')r.add(box,'#20251f',[.145,base-.07,0],[.025,.18,.13]);for(const side of [-1,1])r.add(sphere,'#ece9d3',[head[0]+.025,head[1]-.035,side*.083],[.057,.04,.016]);}
 if(s.id.includes('rubecula'))r.add(sphere,'#ae4e24',[.16,base+.045,0],[.095,.125,.102]);
 if(s.id.includes('major')&&form==='woodpecker'){r.add(sphere,'#981f25',[-.04,base-.11,0],[.14,.06,.09]);for(const side of [-1,1])r.add(sphere,'#e3ded0',[-.1,base+.04,side*.14],[.11,.075,.013]);}
 if(s.id.includes('pica'))r.add(box,c.back,[-.43,base+.03,0],[.38,.026,.075]);
 if(s.id.includes('troglodytes'))r.add(box,c.back,[-.27,base+.18,0],[.18,.028,.075],[0,0,-.95]);
 if(s.id==='garrulus_glandarius')for(const side of [-1,1]){r.add(box,'#6699b0',[-.12,base+.04,side*.139],[.09,.1,.02]);for(let k=0;k<4;k++)r.add(box,'#34423b',[-.15+k*.023,base+.04,side*.15],[.01,.095,.009]);}
 if(s.id==='sitta_europaea')for(const side of [-1,1])r.add(box,'#25352c',[head[0]+.045,head[1]+.007,side*.09],[.17,.019,.013]);
 if(s.id==='charadrius_hiaticula')r.add(sphere,'#26332a',[.16,base+.07,0],[.1,.035,.13]);
 if(s.id==='anas_platyrhynchos')r.add(sphere,'#d1ceba',[.18,base+.06,0],[.06,.012,.11]);
 if(s.id==='hirundo_rustica'||s.id==='sterna_hirundo'){for(const side of [-1,1])r.add(box,c.back,[-.38,base+.05,side*.065],[.27,.014,.025],[0,side*.2,0]);}
 if(s.id.includes('haematopus')){r.add(sphere,'#eeeae0',[.02,base-.085,0],[.23,.1,.12]);}
 if(s.id==='passer_domesticus')r.add(sphere,'#302f26',[head[0]+.04,head[1]-.09,0],[.07,.07,.085]);if(s.id==='fringilla_coelebs')for(const side of [-1,1])r.add(box,'#e3e0cf',[-.06,base+.03,side*.145],[.025,.10,.014],[0,0,.35]);if(s.id==='hirundo_rustica')r.add(sphere,'#9c5337',[head[0]+.02,head[1]-.065,0],[.075,.045,.08]);
 if(form==='owl'){for(const side of [-1,1])r.add(sphere,c.belly,[head[0]+.04,head[1],side*.08],[.08,.09,.018]);}

 // Species-specific field marks in the depicted adult/seasonal plumage.
 if(s.mark){
  const dark='#30372f',cream='#ebe8d8';
  if(['brown','gold','streaked','mottled','grey'].includes(s.mark))for(let side of [-1,1])for(let k=0;k<30;k++){const x=-.22+(k%10)*.038,yy=base+.025+Math.floor(k/10)*.028;r.add(sphere,s.mark==='gold'?'#cdb276':k%3===0?cream:dark,[x,yy,side*.128],[.015,.007,.004],[0,0,.25]);}
  if(s.mark==='brent'){limb(r,'#252d29',[.11,base,0],[.16,base+.4,0],.051);for(const side of [-1,1])r.add(sphere,cream,[.175,base+.28,side*.047],[.038,.02,.014]);}
  if(s.mark==='barnacle'){limb(r,dark,[.10,base,0],[.16,base+.43,0],.048);r.add(sphere,cream,[head[0]+.035,head[1]-.025,0],[.095,.087,.09]);for(let side of [-1,1])for(let k=0;k<6;k++)r.add(box,cream,[-.22+k*.053,base+.04,side*.14],[.012,.11,.008]);}
  if(s.mark==='teal')for(const side of [-1,1])r.add(sphere,'#3a6656',[head[0],head[1],side*.085],[.062,.06,.014]);
  if(s.mark==='wigeon')r.add(sphere,'#e3cfa5',[head[0]+.038,head[1]+.065,0],[.05,.075,.06]);
  if(s.mark==='pintail'){for(const side of [-1,1])r.add(sphere,cream,[head[0]-.04,head[1]-.085,side*.068],[.075,.015,.017],[0,0,.8]);r.add(box,dark,[-.41,base+.035,0],[.39,.012,.027]);}
  if(s.mark==='forehead')r.add(sphere,cream,[head[0]+.071,head[1]+.065,0],[.04,.035,.078]);
  if(s.mark==='yellowtip')r.add(sphere,'#d3ba61',[head[0]+.09+beak,head[1]-.02,0],[.035,.009,.012]);
  if(s.mark==='lapwing'){for(let k=0;k<4;k++)r.add(box,dark,[head[0]-.07-k*.012,head[1]+.1+k*.025,0],[.018,.08,.013],[0,0,.45]);r.add(sphere,dark,[.12,base+.075,0],[.13,.042,.123]);}
  if(s.id==='charadrius_alexandrinus')for(const side of [-1,1])r.add(sphere,dark,[.13,base+.05,side*.11],[.047,.035,.025]);
  if(s.id==='numenius_phaeopus')r.add(box,cream,[head[0]-.025,head[1]+.105,0],[.15,.012,.024]);
  if(s.id==='pluvialis_squatarola')for(const side of [-1,1])r.add(sphere,dark,[-.07,base-.035,side*.105],[.11,.03,.014]);
 }
 if(form==='tern'){for(const side of [-1,1])r.add(box,c.back,[-.38,base+.04,side*.05],[.30,.013,.028],[0,side*.28,0]);}

 // Geometry uses normalized proportions; normalize to published total body length.
 const g=r.finish();g.computeBoundingBox();const k=scale/(g.boundingBox.max.x-g.boundingBox.min.x);g.scale(k,k,k);scaleRig(g,k);g.userData.wingY=base*k;return g;
}
function detailedMammal(s){
 const root=createAnimal(s.form),positions=[],normals=[],colors=[],uvs=[],rigs=[],joints=[],feet={},palette=new Map();root.updateMatrixWorld(true);
 const anatomy=root.userData.anatomy;
 const belongs=(mesh,group)=>{for(let p=mesh;p;p=p.parent)if(p===group)return true;return false;};
 root.traverse(m=>{if(!m.isMesh)return;const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrixWorld);
  let c=palette.get(m.material);if(!c){c=m.material.color.clone();const image=m.material.map?.image;if(image?.getContext){const data=image.getContext('2d').getImageData(16,16,32,32).data;let r=0,b=0,v=0;for(let i=0;i<data.length;i+=4){r+=data[i];v+=data[i+1];b+=data[i+2];}const n=data.length/4*255;c.setRGB(r/n,v/n,b/n,THREE.SRGBColorSpace);}palette.set(m.material,c);}
  const leg=anatomy.legs.find(l=>belongs(m,l.leg));let part=0,pivot=new THREE.Vector3(),joint=new THREE.Vector3(),knee=0;
  if(leg){part=(leg.rear?3:1)+(leg.side>0?1:0);leg.leg.getWorldPosition(pivot);leg.knee.getWorldPosition(joint);knee=belongs(m,leg.paw)?2:Number(belongs(m,leg.knee));const foot=leg.paw.getWorldPosition(new THREE.Vector3());feet[part]=foot.toArray();}
  else if(anatomy.tail&&belongs(m,anatomy.tail)){part=5;anatomy.tail.getWorldPosition(pivot);}
  else if(belongs(m,anatomy.head)){part=6;anatomy.head.getWorldPosition(pivot);}
  const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;
  for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));uvs.push(u?.getX(i)||0,u?.getY(i)||0);colors.push(c.r,c.g,c.b);rigs.push(part,pivot.x,pivot.y,pivot.z);joints.push(joint.x,joint.y,joint.z,knee);}g.dispose();
 });
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setAttribute('rigData',new THREE.Float32BufferAttribute(rigs,4));g.setAttribute('rigJoint',new THREE.Float32BufferAttribute(joints,4));
 g.userData.legFeet=feet;const rotation=new THREE.Matrix4().makeRotationY(Math.PI/2);g.applyMatrix4(rotation);transformRig(g,rotation);g.computeBoundingBox();const k=s.size/(g.boundingBox.max.x-g.boundingBox.min.x);g.scale(k,k,k);scaleRig(g,k);g.computeBoundingSphere();return g;
}
function sealModel(s){
 const r=recipe(),c=s.colors,grey=s.id==='halichoerus_grypus';
 // Continuous tapered torso; the belly contacts sediment and the neck flows into the head.
 const profile=[[-.49,.018,.026,.05],[-.42,.05,.065,.078],[-.32,.097,.108,.103],[-.18,.138,.142,.141],[0,.149,.151,.15],[.16,.114,.117,.131],[.29,.082,.071,.165],[.37,.062,.063,.183]],positions=[],uvs=[],indices=[];
 const curve=new THREE.CatmullRomCurve3(profile.map(q=>new THREE.Vector3(q[0],q[1],q[2]))),centres=new THREE.CatmullRomCurve3(profile.map(q=>new THREE.Vector3(q[0],q[3],0)));
 for(let i=0;i<=38;i++){const q=curve.getPoint(i/38),v=centres.getPoint(i/38);for(let j=0;j<=20;j++){const t=j/20*Math.PI*2;positions.push(q.x,v.y+Math.sin(t)*q.y,Math.cos(t)*q.z);uvs.push(i/38,j/20);if(i<38&&j<20){const k=i*21+j;indices.push(k,k+21,k+1,k+1,k+21,k+22);}}}
 const skin=new THREE.BufferGeometry();skin.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));skin.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));skin.setIndex(indices);skin.computeVertexNormals();r.add(skin,c.body);
 r.rig={part:6,pivot:[.23,.16,0]};r.add(sphere,c.head,[.365,.19,0],[grey?.117:.098,grey?.090:.081,.080]);
 r.add(sphere,c.head,[grey?.475:.439,.163,0],[grey?.110:.067,.047,.058]);
 for(const side of [-1,1]){r.add(sphere,'#202725',[grey?.526:.486,.18,side*.014],[.010,.007,.005],[0,side*.3,0]);r.add(sphere,'#1b2424',[.391,.216,side*.071],[.009,.011,.004]);r.add(sphere,'#a4aaa0',[grey?.480:.447,.144,side*.028],[.049,.029,.024]);
  for(let n=0;n<12;n++)limb(r,'#c5c4af',[grey?.495:.462,.153,side*.034],[grey?.480-n*.006:.449-n*.005,.145+(n%4-1.5)*.009,side*(.07+n*.004)],.00065);
 }r.rig=null;
 for(const side of [-1,1]){r.rig={part:8,pivot:[.13,.065,side*.10]};r.add(sphere,c.back,[.045,.032,side*.166],[.12,.020,.060],[0,side*.8,side*.1]);for(let n=0;n<5;n++)r.add(sphere,c.back,[-.028+n*.025,.019,side*(.198+n*.003)],[.038,.009,.014]);r.rig={part:5,pivot:[-.40,.045,0]};for(let n=0;n<5;n++)r.add(sphere,c.back,[-.505-n*.012,.025,side*(.035+n*.020)],[.078,.012,.018],[0,side*.13,0]);r.rig=null;}
 const g=r.finish(),a=g.attributes.position,colors=g.attributes.color;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i),l=colors.getX(i)+colors.getY(i)+colors.getZ(i);if(l<.2)continue;const belly=Math.max(0,Math.min(1,(.17-y)*7)),patch=Math.sin(x*113+z*67)*Math.sin(y*157-z*71)+Math.sin(x*59+y*83)*.35;const k=(.95+belly*.16)*(patch>.62?.64:1);colors.setXYZ(i,colors.getX(i)*k,colors.getY(i)*k,colors.getZ(i)*k);}
 g.computeBoundingBox();const k=s.size/(g.boundingBox.max.x-g.boundingBox.min.x);g.scale(k,k,k);scaleRig(g,k);g.computeBoundingBox();g.translate(0,-g.boundingBox.min.y,0);g.computeBoundingSphere();return g;
}
function mammal(s){if(s.form==='seal')return sealModel(s);if(['fox','hare'].includes(s.form))return detailedMammal(s);const r=recipe(),c=s.colors||{},f=s.form,L=s.size||.5;let body=[.29,.16,.13],height=.31,head=[.29,.38,0];if(f==='deer'){body=[.36,.22,.15];height=.63;head=[.4,.93,0];limb(r,c.body,[.26,.65,0],[.35,.88,0],.105);}if(f==='seal'){body=[.38,.14,.19];height=.16;head=[.37,.21,0];}if(f==='squirrel'){body=[.18,.13,.095];height=.17;head=[.15,.3,0];}if(f==='hedgehog'){body=[.3,.17,.17];height=.17;head=[.28,.16,0];}
 r.autorig=p=>p[0]>head[0]-.08&&p[1]>height-.01?{part:6,pivot:[head[0]-.1,height+.02,0]}:p[0]<-.29?{part:5,pivot:[-.25,height,0]}:null;r.add(sphere,c.body,[0,height,0],body);r.add(sphere,c.back,[-.05,height+.07,0],[body[0]*.9,body[1]*.7,body[2]*1.02]);r.add(sphere,c.head,head,[f==='hare'?.12:.14,.1,.09]);r.add(sphere,c.belly,[.025,height-.07,0],[body[0]*.8,body[1]*.55,body[2]*.9]);const muzzle=f==='fox'?.19:f==='deer'?.15:s.id==='halichoerus_grypus'?.18:s.id.startsWith('sorex')||s.id.startsWith('crocidura')?.16:.09;r.add(sphere,c.head,[head[0]+.09,head[1]-.035,0],[muzzle,.05,.058]);r.add(sphere,'#27231e',[head[0]+muzzle+.065,head[1]-.035,0],[.027,.023,.028]);
 for(const side of [-1,1]){r.add(sphere,'#181914',[head[0]+.075,head[1]+.025,side*.079],[.012,.011,.01]);if(f!=='seal')r.add(sphere,c.head,[head[0]-.025,head[1]+(f==='hare'?.18:.1),side*.065],[f==='hare'?.038:.038,f==='hare'?.22:.065,.023],[side*.2,0,f==='hare'?-.15:0]);if(f==='hare')r.add(sphere,c.accent||'#493e31',[head[0]-.02,head[1]+.32,side*.068],[.022,.045,.021]);}
 if(f==='fox'){r.add(sphere,c.back,[-.4,height-.02,0],[.28,.09,.09],[0,0,.25]);r.add(sphere,c.belly,[-.6,height-.065,0],[.09,.07,.07]);}else if(f==='squirrel'){r.add(sphere,c.back,[-.27,.4,0],[.09,.29,.08],[0,0,.4]);}else if(f==='seal'){for(const side of [-1,1]){r.rig={part:8,pivot:[.14,.09,side*.13]};r.add(sphere,c.back,[.14,.04,side*.19],[.18,.025,.09],[0,side*.5,0]);r.rig=null;}r.add(sphere,c.back,[-.43,.04,0],[.1,.025,.16]);}else r.add(sphere,c.belly,[-.3,height,0],[.045,.055,.045]);
 if(f!=='seal'){for(const x of [-.17,.18])for(const side of [-1,1]){const hip=[x,height-.05,side*.09],joint=[x+(x>0?-.045:.055),(height-.05)*.52,side*.095],foot=[x+.025,.035,side*.1];r.rig={part:(x>0?1:3)+(side>0?1:0),pivot:hip,joint,foot,knee:0};limb(r,c.legs||c.body,hip,joint,f==='deer'?.025:.028);r.rig.knee=1;limb(r,c.legs||c.body,joint,foot,f==='deer'?.017:.022);r.rig.knee=2;r.add(sphere,c.legs||c.body,foot,[f==='deer'?.041:.049,.027,.034]);r.rig=null;}}
 if(f==='mouse'){const tailLength=s.id==='micromys_minutus'?.45:s.id.startsWith('microtus')?.13:.35;for(let k=0;k<9;k++)limb(r,'#a5907e',[-.26-k*tailLength/9,.045,Math.sin(k*.3)*.025],[-.26-(k+1)*tailLength/9,.045,Math.sin((k+1)*.3)*.025],.011*(1-k*.075));}
 if(f==='seal'){for(let k=0;k<60;k++){const a=k*2.4,x=-.28+(k%10)*.055,y=height+.06+Math.sin(a)*.06,z=Math.cos(a)*.13;r.add(sphere,c.accent,[x,y,z],[.020,.006,.013]);}for(const side of [-1,1])for(let k=0;k<7;k++)limb(r,'#cdc5ae',[head[0]+.13,head[1]-.06,side*.047],[head[0]+.18-k*.017,head[1]-.075+(k%3)*.016,side*(.10+k*.008)],.0015);}
 if(f==='hedgehog'){for(let i=0;i<85;i++){const a=i*2.4,b=i*.36;r.add(cone,'#66594a',[Math.cos(a)*.22,height+.1+Math.sin(b)*.03,Math.sin(a)*.14],[.013,.065,.013],[Math.sin(a)*.6,0,Math.cos(a)*.6]);}}
 const g=r.finish();g.computeBoundingBox();const k=L/(g.boundingBox.max.x-g.boundingBox.min.x);g.scale(k,k,k);scaleRig(g,k);return g;
}
function aquatic(s){const r=recipe(),c=s.colors||{},L=s.size||.15,f=s.form;if(s.type==='insect')r.autorig=p=>Math.abs(p[2])>.08&&p[1]>.08?{part:7,pivot:[p[0],.12,Math.sign(p[2])*.04]}:null;if(f==='fish'){const pike=s.id==='esox_lucius',slender=pike||['clupea_harengus','gasterosteus_aculeatus'].includes(s.id),flat=s.id==='pleuronectes_platessa',h=slender?.085:.14;r.add(sphere,c.body,[0,.1,0],[.35,h,.065]);r.add(sphere,c.back,[-.02,.1+h*.4,0],[.31,h*.65,.06]);r.add(sphere,c.belly,[.02,.1-h*.5,0],[.29,h*.45,.055]);r.add(cone,c.back,[-.4,.1,0],[.15,.2,.035],[0,0,Math.PI/2]);r.add(cone,c.accent||c.back,[pike?-.22:-.05,.1+h+.025,0],[.1,slender?.10:.18,.014]);if(pike)r.add(sphere,c.head,[.30,.10,0],[.13,.035,.055]);for(const side of [-1,1]){if(!flat||side<0)r.add(sphere,'#151a17',[.24,.13,side*.057],[.014,.014,.008]);r.add(cone,c.accent||c.body,[.05,.05,side*.085],[.09,.15,.015],[side*.5,0,.4]);}if(flat){r.add(sphere,'#151a17',[.19,.16,-.060],[.014,.014,.008]);for(let k=0;k<12;k++)r.add(sphere,c.accent,[-.24+(k%5)*.10,.09+Math.floor(k/5)*.034,-.058],[.014,.012,.007]);}if(s.id==='gasterosteus_aculeatus')for(let k=0;k<3;k++)r.add(cone,'#aab4a2',[-.05+k*.09,.23,0],[.008,.08,.008]);if(s.id.includes('fluviatilis'))for(let i=0;i<5;i++)r.add(box,'#3e493c',[-.2+i*.085,.13,0],[.018,.22,.13]);}
 else if(f==='tick'){r.add(sphere,c.body,[0,.035,0],[.28,.065,.18]);r.add(sphere,c.back,[.12,.085,0],[.13,.015,.14]);r.add(sphere,c.head,[.27,.035,0],[.07,.022,.05]);for(const side of [-1,1])for(let k=0;k<4;k++){const x=.15-k*.09;limb(r,c.back,[x,.034,side*.12],[x+.04,.025,side*.23],.014);limb(r,c.back,[x+.04,.025,side*.23],[x-.06,.007,side*.32],.011);}}
 else if(f==='fishlouse'||f==='copepod'){r.add(sphere,c.body,[.08,.025,0],[.24,.022,.19]);r.add(sphere,c.back,[-.18,.023,0],[.13,.018,.07]);for(const side of [-1,1]){r.add(sphere,'#343f2c',[.23,.046,side*.085],[.022,.013,.019]);for(let k=0;k<4;k++)limb(r,c.back,[-.14+k*.07,.015,side*.05],[-.19+k*.07,.01,side*.18],.008);if(f==='fishlouse')r.add(sphere,c.belly,[.08,.012,side*.07],[.06,.008,.06]);else for(let k=0;k<10;k++)r.add(sphere,c.belly,[-.29-k*.024,.02,side*.045],[.015,.012,.014]);}}
 else if(f==='crab'){r.add(sphere,c.body,[0,.08,0],[.22,.1,.2]);for(let side of [-1,1])for(let n=0;n<4;n++){const slot=(n%2)*2+(side>0?1:0),part=n<2?slot+1:10+(n-2)*2+(side>0?1:0);jointedLeg(r,c.legs||c.body,part,[-.15+n*.09,.09,side*.15],[-.20+n*.115,.12,side*.24],[-.22+n*.13,.012,side*.34],.014,slot);}for(const side of [-1,1]){limb(r,c.body,[.16,.08,side*.13],[.3,.1,side*.24],.025);r.add(sphere,c.accent||c.body,[.34,.1,side*.25],[.07,.04,.06]);}}
 else if(f==='shell'){if(s.id==='retusa_obtusa'){r.add(sphere,'#c8b899',[0,.08,0],[.13,.09,.29]);r.add(cylinder,'#9b927d',[0,.075,-.20],[.105,.028,.105]);r.add(sphere,'#575244',[.065,.07,.18],[.04,.055,.10]);r.add(sphere,'#b7a88d',[0,.025,.27],[.10,.026,.10]);}else if(['peringia_ulvae','littorina_littorea'].includes(s.id)){r.add(cone,c.body,[0,.15,0],[.15,.3,.15]);for(let k=0;k<5;k++)r.add(new THREE.TorusGeometry(.14-k*.024,.01,3,8),c.back,[0,.07+k*.04,0],[1,1,1],[Math.PI/2,0,0]);}else{r.add(sphere,c.body,[0,.07,0],[s.id==='cerastoderma_edule'?.22:.3,.09,s.id==='cerastoderma_edule'?.21:.15]);r.add(sphere,c.back,[0,.1,0],[.22,.05,.14]);if(s.id==='cerastoderma_edule')for(let k=0;k<10;k++)limb(r,c.accent,[-.15+k*.03,.1,-.13],[-.15+k*.03,.12,.13],.007);}}
 else if(f==='worm'){for(let i=0;i<32;i++){const x=-.4+i*.025,z=Math.sin(i*.32)*.035,thick=s.id==='arenicola_marina'&&i>22?.010:.019;r.add(sphere,c.body,[x,.023,z],[.020,thick,thick]);if(['hediste_diversicolor','nephtys_hombergii'].includes(s.id))for(const side of [-1,1])limb(r,c.back,[x,.024,z+side*.016],[x-.007,.023,z+side*.033],.003);if(s.id==='arenicola_marina'&&i>10&&i<21)for(const side of [-1,1])r.add(cone,'#ac654d',[x,.026,z+side*.026],[.007,.035,.006],[side*.7,0,0]);}}
 else if(f==='frog'){r.add(sphere,c.body,[0,.145,0],[.23,.10,.14]);r.add(sphere,c.head,[.18,.15,0],[.15,.09,.14]);for(const side of [-1,1]){jointedLeg(r,c.body,side<0?1:2,[.09,.10,side*.09],[.14,.055,side*.16],[.21,.014,side*.20],.019);jointedLeg(r,c.back,side<0?3:4,[-.12,.11,side*.10],[-.24,.07,side*.20],[-.06,.013,side*.24],.032);r.add(sphere,'#262b15',[.23,.22,side*.1],[.02,.022,.015]);}}
 else if(f==='newt'){r.add(sphere,c.body,[0,.05,0],[.25,.04,.045]);r.add(sphere,c.head,[.24,.065,0],[.085,.04,.045]);r.add(cone,c.back,[-.34,.05,0],[.036,.36,.017],[0,0,Math.PI/2]);for(const side of [-1,1])for(const x of [-.15,.13])jointedLeg(r,c.legs||c.body,(x>0?1:3)+(side>0?1:0),[x,.05,side*.03],[x-.02,.045,side*.075],[x+.035,.015,side*.13],.01);}
 else if(f==='shrimp'){for(let i=0;i<8;i++)r.add(sphere,c.body,[-.23+i*.055,.04+Math.sin(i*.4)*.035,0],[.044,.035,.037]);r.add(cone,c.head,[.27,.075,0],[.012,.16,.013],[0,0,-Math.PI/2]);for(const side of [-1,1])for(let n=0;n<5;n++)limb(r,c.body,[-.1+n*.055,.05,side*.025],[-.16+n*.055,.005,side*.08],.004);}
 else if(f==='dragonfly'){r.add(sphere,c.body,[0,.12,0],[.35,.026,.027]);r.add(sphere,c.head,[.33,.12,0],[.044,.035,.04]);for(const side of [-1,1])for(const x of [-.045,.08])r.add(sphere,'#b4c1b3',[x,.13,side*.22],[.07,.007,.24],[side*.1,0,.2]);for(const side of [-1,1])for(const x of [.08,.15,.21])limb(r,'#2d3a30',[x,.1,side*.025],[x+.01,.065,side*.065],.004);}
 else if(f==='beetle'){r.add(sphere,c.body,[0,.115,0],[.18,.09,.14]);r.add(sphere,c.head,[.17,.12,0],[.07,.055,.085]);for(const side of [-1,1])for(const x of [-.1,0,.1]){r.add(sphere,'#20251c',[x,.197,side*.07],[.023,.009,.022]);const slot=(x===0?2:0)+(side>0?1:0),part=x<0?10+(side>0?1:0):slot+1;jointedLeg(r,'#272d21',part,[x,.105,side*.10],[x-.025,.085,side*.16],[x+.02,.008,side*.22],.007,slot);}}
 else if(f==='bee'){const honey=s.id==='apis_mellifera';r.add(sphere,c.body,[-.06,.10,0],[honey?.14:.16,honey?.055:.085,honey?.055:.08]);r.add(sphere,honey?'#605039':c.accent,[-.15,.1,0],[.055,.045,.046]);r.add(sphere,c.head,[.115,.1,0],[.07,.055,.059]);r.add(sphere,c.head,[.20,.11,0],[.053,.06,.055]);
 if(honey)for(let k=0;k<4;k++)r.add(sphere,k%2?'#725137':'#b59b65',[-.025-k*.034,.103,0],[.012,.056-k*.003,.055-k*.003]);
 for(const side of [-1,1]){r.add(sphere,'#262922',[.215,.12,side*.046],[.025,.030,.009]);for(const pair of [0,1]){r.rig={part:7,pivot:[.10-pair*.045,.14,side*.025]};r.add(sphere,'#b6c2b7',[.04-pair*.075,.155,side*(pair?.085:.13)],[pair?.083:.135,.003,pair?.031:.048],[side*.15,0,side*.2]);r.rig=null;}
 for(const x of [-.075,0,.08]){limb(r,c.legs,[x,.08,side*.045],[x-.04,.04,side*.09],.004);limb(r,c.legs,[x-.04,.04,side*.09],[x-.02,.012,side*.12],.003);}limb(r,c.head,[.22,.15,side*.025],[.23,.20,side*.045],.003);limb(r,c.head,[.23,.20,side*.045],[.28,.205,side*.055],.003);
 }}
 else{r.add(sphere,c.body,[0,.1,0],[.16,.07,.065]);for(const side of [-1,1]){r.add(sphere,f==='butterfly'?c.back:'#b9ad85',[0,.12,side*.17],[f==='butterfly'?.14:.22,.008,f==='butterfly'?.2:.075],[side*.2,0,side*.2]);}r.add(sphere,c.head,[.17,.1,0],[.045,.04,.04]);if(f==='butterfly')for(const side of [-1,1]){r.add(sphere,c.back,[-.10,.118,side*.14],[.08,.008,.12]);r.add(sphere,'#c3bca1',[-.11,.129,side*.19],[.031,.008,.031]);r.add(sphere,'#26322f',[-.11,.139,side*.19],[.02,.004,.02]);r.add(sphere,'#d2b469',[.03,.131,side*.18],[.055,.012,.055]);r.add(sphere,'#252b25',[.03,.146,side*.18],[.038,.008,.037]);r.add(sphere,'#729aab',[.028,.153,side*.18],[.022,.004,.024]);for(const x of [-.06,0,.06])limb(r,c.legs,[x,.07,side*.03],[x,.01,side*.10],.004);limb(r,c.head,[.18,.13,side*.02],[.25,.20,side*.05],.003);}}
 const g=r.finish();g.computeBoundingBox();const k=L/(g.boundingBox.max.x-g.boundingBox.min.x);g.scale(k,k,k);scaleRig(g,k);if(s.id==='pleuronectes_platessa'){g.rotateX(Math.PI/2);g.translate(0,.014,0);}return g;
}
export class WildlifeRenderer{
 constructor(scene,agents){this.group=new THREE.Group();scene.add(this.group);this.batches=new Map();this.previewMaterials=new Map();this.coat=coatTexture();this.surface=new THREE.TextureLoader().load('./assets/wildlife-surfaces.webp');this.surface.colorSpace=THREE.SRGBColorSpace;this.surface.wrapS=this.surface.wrapT=THREE.RepeatWrapping;this.surface.repeat.set(2,3);this.surface.anisotropy=4;this.material=new THREE.MeshStandardMaterial({vertexColors:true,map:this.coat,bumpMap:this.coat,bumpScale:.0013,roughness:.94,metalness:0});const grouped=new Map();for(const a of agents){if(!grouped.has(a.species))grouped.set(a.species,[]);grouped.get(a.species).push(a);}
 for(const [id,list]of grouped){const s=ANIMALS[id],g=authoredWildlifeGeometry(id)||(s.type==='bird'?bird(s):s.type==='mammal'?mammal(s):aquatic(s)),material=this.material.clone();
 const cell=g.userData.authored?null:surfaceCell(s);material.map=cell==null?this.coat:this.surface;material.customProgramCacheKey=()=>`wildlife-${motionShaderKey(s)}-${cell}-${g.userData.authored?'anatomy':'legacy'}`;material.roughness=s.type==='fish'?.48:['shell','crab'].includes(s.type)?.52:s.form==='beetle'?.37:.9;material.bumpScale=s.type==='fish'?.00025:.0013;
 const legRig=prepareLegRig(g,s);indexGeometry(g);const gait=new Float32Array(list.length*2),controls=new Float32Array(list.length*4),feetA=new Float32Array(list.length*4),feetB=new Float32Array(list.length*4),feetC=new Float32Array(list.length*4);g.setAttribute('gaitData',new THREE.InstancedBufferAttribute(gait,2));g.setAttribute('motionControls',new THREE.InstancedBufferAttribute(controls,4));for(const [name,data] of [['footTargetsA',feetA],['footTargetsB',feetB],['footTargetsC',feetC]])g.setAttribute(name,new THREE.InstancedBufferAttribute(data,4));
 material.onBeforeCompile=shader=>{surfaceShader(shader,cell);if(g.userData.authored)eyeSurfaceShader(shader);motionShader(shader,s,legRig);};
 const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});depth.onBeforeCompile=shader=>motionShader(shader,s,legRig);depth.customProgramCacheKey=()=>`wildlife-depth-${motionShaderKey(s)}`;
 const mesh=new THREE.InstancedMesh(g,material,list.length);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.customDepthMaterial=depth;mesh.userData.species=id;this.group.add(mesh);let wings=null;if(s.type==='bird'){
  const r=recipe(),c=birdPalette(s);
  r.add(sphere,c.wing,[0,0,.18],[.18,.012,.18]);
  for(let f=0;f<8;f++){
   const feather=flightFeather([.045-f*.026,0,.17],[-.035-f*.037,.005,.35+Math.sin(f/7*Math.PI)*.075],.027);
   r.add(feather,c.primary);feather.dispose();
  }
  if(c.wingBar)r.add(box,c.wingBar,[-.04,.014,.205],[.28,.006,.026]);
  const right=r.finish();right.scale(s.size,s.size,s.size*1.9);const wg=pairedWingGeometry(right);right.dispose();indexGeometry(wg);
  wg.setAttribute('wingPose',new THREE.InstancedBufferAttribute(new Float32Array(list.length*2),2));
  const feather=material.clone();feather.onBeforeCompile=shader=>{surfaceShader(shader,1);wingShader(shader);};feather.customProgramCacheKey=()=>`bird-wing-pair`;
  const wingDepth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});wingDepth.onBeforeCompile=shader=>wingShader(shader);wingDepth.customProgramCacheKey=()=>`bird-wing-pair-depth`;
  wings=new THREE.InstancedMesh(wg,feather,list.length);wings.customDepthMaterial=wingDepth;wings.frustumCulled=false;wings.castShadow=true;wings.receiveShadow=true;this.group.add(wings);
 }this.batches.set(id,{mesh,list,gait,controls,feetA,feetB,feetC,legRig,wings});}this.dummy=new THREE.Object3D();this.dummy.rotation.order='YXZ';this.tint=new THREE.Color();const seed=recipe();seed.add(sphere,'#8e5932',[0,0,0],[.009,.014,.009]);seed.add(sphere,'#635140',[0,.009,0],[.010,.005,.010]);this.carriedSeeds=new THREE.InstancedMesh(seed.finish(),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9}),agents.length);this.carriedSeeds.frustumCulled=false;this.carriedSeeds.castShadow=true;this.carriedSeeds.count=0;this.group.add(this.carriedSeeds);}
 update(ground,water,observer,walkGround=ground,camera=null){
  this.viewVolume||=new ViewVolume();this.visibilitySphere||=new THREE.Sphere();const frustum=camera?this.viewVolume.update(camera):null;
  for(const [id,b]of this.batches){const {mesh,list,wings}=b,s=ANIMALS[id];let count=0,wingCount=0;mesh.frustumCulled=false;if(wings)wings.frustumCulled=false;
   for(const a of list){a.renderIndex=-1;if(!a.alive||a.scenarioSuppressed||a.scenarioInactive)continue;const x=a.renderX??a.x,z=a.renderZ??a.z,motion=advanceMotion(a,s,b.legRig);
    let y=a.surveySpecimen&&a.revealed?a.surveyY:walkGround(x,z,a.habitat);
    if(s.type==='fish'||s.form==='newt'&&a.zoneWater||s.id==='crangon_crangon')y=s.id==='pleuronectes_platessa'?ground(x,z,a.habitat)+.035:Math.max(ground(x,z,a.habitat)+.035,water(x,z,a.habitat)-.35-.22*Math.sin(a.phase));
    else if(s.form==='frog'&&a.zoneWater)y=Math.max(ground(x,z,a.habitat),water(x,z,a.habitat)-.025);
    else if(s.form==='seal')y=sealSurfaceY(walkGround(x,z,a.habitat),water(x,z,a.habitat),a.zoneWater);
    else if(['duck','swan','goose'].includes(s.form)&&a.zoneWater)y=Math.max(ground(x,z,a.habitat),water(x,z,a.habitat)-.03);
    else y+=a.flight||0;
    if(a.attachedHost){const host=a.attachedHost,hs=ANIMALS[host.species],hb=this.batches.get(host.species);if(hb&&!hb.mesh.geometry.boundingBox)hb.mesh.geometry.computeBoundingBox();const box=hb?.mesh.geometry.boundingBox;y=(host.y??walkGround(x,z,host.habitat))+(hs.type==='fish'?(hs.id==='pleuronectes_platessa'?.028:hs.size*.28):box?(box.max.y+box.min.y)*.5:hs.size*.5);}
    if(a.poseY!=null&&!a.attachedHost)y=a.poseY;
    y+=a.attachedHost?0:motion.bob+motion.bodyOffset;a.y=y;
    if(observer&&Math.hypot(x-observer.x,z-observer.z)>110)continue;
    this.visibilitySphere.center.set(x,y+s.size*.5,z);this.visibilitySphere.radius=Math.max(.1,s.size*1.65*(a.trait||1));
    if(frustum&&!frustum.intersectsSphere(this.visibilitySphere))continue;
    const i=count++;a.renderIndex=i;b.gait[i*2]=motion.amount;b.gait[i*2+1]=s.type==='insect'?motion.flap:motion.phase;const targets=updateGroundPose(a,s,motion,b.legRig,y,walkGround);for(let k=0;k<4;k++){b.feetA[i*4+k]=targets[k];b.feetB[i*4+k]=targets[k+4];b.feetC[i*4+k]=targets[k+8];}b.controls[i*4]=(a.age||0)+(a.phase||0);b.controls[i*4+1]=motion.feed;b.controls[i*4+2]=motion.air;b.controls[i*4+3]=motion.swim;
    this.dummy.position.set(x,y,z);this.dummy.rotation.set(s.type==='bird'?motion.bank:0,-motion.heading,(motion.posePitch||motion.pitch||0)+(s.form==='seal'?Math.sin(motion.phase)*.02*motion.amount*(1-motion.swim):0));this.dummy.scale.setScalar(a.trait||1);this.dummy.updateMatrix();mesh.setMatrixAt(i,this.dummy.matrix);if(a.pigment!=null)mesh.setColorAt(i,this.tint.setScalar(a.pigment));
    if(wings&&(motion.air>.025||motion.dry>.025)){
     const pose=wingPose(motion,a.age);wings.geometry.attributes.wingPose.setXY(wingCount,pose[0],pose[1]);
     this.dummy.position.set(x,y+(mesh.geometry.userData.wingY||s.size*.33),z);
     this.dummy.rotation.set(motion.bank,-motion.heading,motion.pitch||0);this.dummy.scale.setScalar(a.trait||1);this.dummy.updateMatrix();wings.setMatrixAt(wingCount++,this.dummy.matrix);
    }

   }
   mesh.count=count;mesh.visible=count>0;uploadInstances(mesh.instanceMatrix,count);if(mesh.instanceColor)uploadInstances(mesh.instanceColor,count,3);uploadInstances(mesh.geometry.attributes.gaitData,count,2);for(const name of ['footTargetsA','footTargetsB','footTargetsC'])uploadInstances(mesh.geometry.attributes[name],count,4);uploadInstances(mesh.geometry.attributes.motionControls,count,4);
   if(wings){wings.count=wingCount;wings.visible=wingCount>0;uploadInstances(wings.instanceMatrix,wingCount);uploadInstances(wings.geometry.attributes.wingPose,wingCount,2);}
  }
  let seeds=0;for(const b of this.batches.values())for(const a of b.list){if(!a.carriedSeed||a.renderIndex<0||!a.alive)continue;const s=ANIMALS[a.species],m=a.motion,x=a.renderX??a.x,z=a.renderZ??a.z;if(!b.mesh.geometry.boundingBox)b.mesh.geometry.computeBoundingBox();const head=b.mesh.geometry.boundingBox.max.y*.82;
   this.dummy.position.set(x+Math.cos(m.heading)*s.size*.36,a.y+head,z+Math.sin(m.heading)*s.size*.36);this.dummy.rotation.set(0,-m.heading,Math.PI/2);this.dummy.scale.setScalar(1);this.dummy.updateMatrix();this.carriedSeeds.setMatrixAt(seeds++,this.dummy.matrix);
  }this.carriedSeeds.count=seeds;this.carriedSeeds.visible=seeds>0;uploadInstances(this.carriedSeeds.instanceMatrix,seeds);
 }
 dispose(){this.carriedSeeds.geometry.dispose();this.carriedSeeds.material.dispose();for(const b of this.batches.values()){b.previewWingMaterial?.dispose();b.mesh.geometry.dispose();b.mesh.material.dispose();b.mesh.customDepthMaterial?.dispose();b.wings?.geometry.dispose();b.wings?.material.dispose();b.wings?.customDepthMaterial.dispose();}for(const m of this.previewMaterials.values())m.dispose();this.previewMaterials.clear();this.surface.dispose();this.material.map?.dispose();this.material.dispose();this.group.removeFromParent();}
 boundsFor(a,out){const b=this.batches.get(a.species),i=a.renderIndex??b?.list.indexOf(a);if(!b||i<0||!a.alive)return false;if(!b.mesh.geometry.boundingBox)b.mesh.geometry.computeBoundingBox();this.selectionMatrix||=new THREE.Matrix4();b.mesh.getMatrixAt(i,this.selectionMatrix);out.copy(b.mesh.geometry.boundingBox).applyMatrix4(this.selectionMatrix).applyMatrix4(b.mesh.matrixWorld);out.expandByScalar(ANIMALS[a.species].size*.12);return true;}
 preview(id){const b=this.batches.get(id);if(!b)return null;
  if(!this.previewMaterials.has(id)){const m=this.material.clone(),s=ANIMALS[id],cell=b.mesh.geometry.userData.authored?null:surfaceCell(s);m.roughness=b.mesh.material.roughness;m.bumpScale=b.mesh.material.bumpScale;m.map=b.mesh.material.map;
   const pose={gaitData:{value:new Float32Array(2)},motionControls:{value:new Float32Array(4)},footTargetsA:{value:new Float32Array(4)},footTargetsB:{value:new Float32Array(4)},footTargetsC:{value:new Float32Array(4)}};
   m.userData.pose=pose;m.onBeforeCompile=shader=>{surfaceShader(shader,cell);if(b.mesh.geometry.userData.authored)eyeSurfaceShader(shader);motionShader(shader,s,b.legRig);for(const [name,uniform] of Object.entries(pose)){shader.vertexShader=shader.vertexShader.replace(new RegExp('attribute (vec[24]) '+name+';'),'uniform $1 '+name+';');shader.uniforms[name]=uniform;}};
   m.customProgramCacheKey=()=>`specimen-motion-${id}-${cell}`;this.previewMaterials.set(id,m);
  }const mesh=new THREE.Mesh(b.mesh.geometry,this.previewMaterials.get(id));mesh.rotation.order='YXZ';if(b.wings){
   if(!b.previewWingMaterial){const feather=b.wings.material.clone(),pose={value:new Float32Array([0,1])};feather.userData.pose=pose;feather.onBeforeCompile=shader=>{surfaceShader(shader,1);wingShader(shader,pose);};feather.customProgramCacheKey=()=>`bird-wing-pair-preview`;b.previewWingMaterial=feather;}
   const wing=new THREE.Mesh(b.wings.geometry,b.previewWingMaterial);mesh.userData.previewWings=[wing];mesh.add(wing);
  }return mesh;
 }
 updatePreview(mesh,a){const m=a.motion,pose=mesh?.material?.userData.pose;if(!m||!pose)return;
  const s=ANIMALS[a.species];pose.gaitData.value.set([m.amount,s.type==='insect'?m.flap:m.phase]);pose.motionControls.value.set([(a.age||0)+(a.phase||0),m.feed,m.air,m.swim]);
  const feet=m.footTargets;if(feet)for(let k=0;k<4;k++){pose.footTargetsA.value[k]=feet[k];pose.footTargetsB.value[k]=feet[k+4];pose.footTargetsC.value[k]=feet[k+8];}
  mesh.position.y=m.bob+m.bodyOffset;mesh.rotation.set(s.type==='bird'?m.bank:0,0,m.pitch||0);for(const wing of mesh.userData.previewWings||[]){wing.visible=m.air>.025||m.dry>.025;wing.position.set(0,mesh.geometry.userData.wingY||s.size*.33,0);wing.material.userData.pose.value.set(wingPose(m,a.age));}
 }
}
