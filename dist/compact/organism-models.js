import * as THREE from '../vendor/three.module.js?revision=120';
import { coastalRig,CRAB_RIG } from './coastal-rig.js';
import { birdBodyGeometry,butterflyWingGeometry,profileGeometry,birdTorsoGeometry,foldedWingGeometry,flightWingGeometry } from './organic-geometry.js';
import { finishOrganism } from './organism-finish.js';
import { CATALOG } from './catalog.js';
import { GeometryBatch,stick,plantGeometry,sweptGeometry } from './geometry.js';

const sphere=new THREE.SphereGeometry(1,20,12),birdBody=birdBodyGeometry();
const material=()=>new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,side:THREE.DoubleSide});
export function createOrganism(taxon,stage='adult',remaining=1){
 const c=CATALOG[taxon];if(!c)throw Error('Kein aktives Taxonmodell: '+taxon);
 const root=new THREE.Group(),parts={},black='#262b29',cream='#e3ddc5';let b=new GeometryBatch();
 const ball=(color,x,y,z,sx,sy,sz)=>b.add(sphere,color,[x,y,z],[sx,sy,sz]);
 const line=(a,z,r,col,top=r*.7)=>stick(b,a,z,r,col,top);
 const eye=(x,y,z,r=.035)=>ball('#121a16',x,y,z,r,r,r*.5);
 const wings=[];
 if(['plant','tree'].includes(c.kind)){root.add(new THREE.Mesh(plantGeometry(taxon,remaining),material()));root.scale.setScalar(c.kind==='tree'?.5:c.length);root.userData={taxon,stage,parts,diagnostics:c.diagnostics};return finishOrganism(root,taxon);}
 if(taxon==='fomes_fomentarius'){
  // Closed perennial hoof: flat attachment face, domed ridged crust and
  // continuous pale pore surface below. Bands belong to the surface itself.
  const hoof=new THREE.SphereGeometry(1,56,28),positions=hoof.attributes.position,colors=[];
  for(let i=0;i<positions.count;i++){
   const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),height=(y+1)*.5,ridge=1+.018*Math.sin(height*42);
   positions.setXYZ(i,x*ridge,.035+Math.pow(height,1.65)*.60,Math.max(0,z)*.95*ridge);
   const col=new THREE.Color(y<-.60?'#c5bda5':Math.sin(height*42)>.3?'#a5a293':'#777b70');colors.push(col.r,col.g,col.b);
  }
  hoof.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));hoof.computeVertexNormals();b.add(hoof,'#ffffff');
  for(let i=0;i<60;i++){const angle=(i*2.399)%Math.PI,r=Math.sqrt((i+.5)/60)*.77;ball('#8c8d78',Math.cos(angle)*r,.048,Math.sin(angle)*r*.9,.009,.003,.009);}parts.pores=60;parts.attachment='flat rear face at dead log';
 }else if(c.kind==='bird'){
  const wader=['recurvirostra_avosetta','platalea_leucorodia','tringa_totanus','haematopus_ostralegus'].includes(taxon),spoon=taxon==='platalea_leucorodia',avocet=taxon==='recurvirostra_avosetta',oyster=taxon==='haematopus_ostralegus',tit=taxon==='parus_major',jay=taxon==='garrulus_glandarius';
  const bodyColor=spoon||avocet||oyster?cream:tit?'#a6a24c':jay?'#a88d83':'#817d6b',legHeight=wader?1.05:.22,bodyY=legHeight+.35,legColor=avocet?'#7b9596':spoon?'#40463e':wader?'#b46545':'#656754';
  b.add(birdTorsoGeometry(taxon),'#ffffff',[0,bodyY,0]);
  const neckTop=wader&&!oyster?bodyY+.72:bodyY+(wader?.39:.28);
  const bodyBatch=b,neckBatch=wader?new GeometryBatch():null;b=new GeometryBatch();
  if(wader){
   // Broad feathered base, curved nape and a taper into the cranium.
   const points=[[.29,bodyY+.08,0],[spoon?.23:.31,bodyY+.25,0],[.28,neckTop-.27,0],[.33,neckTop-.13,0],[.41,neckTop-.035,0]];
   neckBatch.add(sweptGeometry(points,[.165,.125,.078,.074,.09],18),oyster?black:spoon||avocet?cream:bodyColor);
  }
  const headColor=spoon?cream:avocet||oyster||tit?black:jay?'#b69a86':bodyColor;
  b.add(profileGeometry([[.255,neckTop-.025,0,.025,.035],[.32,neckTop+.002,0,.085,.084],[.42,neckTop+.008,0,.091,.095],[.51,neckTop-.008,0,.075,.073],[.57,neckTop-.02,0,.029,.032]],{rows:30,sides:24,paint:(x,y,z)=>{
   if(tit&&Math.abs(z)>.055&&y<neckTop+.02&&x>.32&&x<.51)return cream;
   if(avocet&&y<neckTop-.015)return cream;
   if(jay&&x>.45&&y<neckTop-.015)return black;
   return headColor;
  }}),'#ffffff');
  for(const side of [-1,1]){if(oyster)ball('#b35232',.475,neckTop+.025,side*.087,.019,.018,.009);eye(.475,neckTop+.025,side*.094,oyster?.011:.013);}
  const headBatch=b,skinVertexCount=b.p.length/3;b=bodyBatch;let beakTip;
  for(const side of [-1,1]){
   if(!wader)line([-.12,legHeight+.08,side*.16],[-.12,0,side*.19],.025,legColor,.022);
   if(!wader)for(let k=-1;k<=1;k++)line([-.12,.02,side*.19],[.04,.005,side*.19+k*.06],.009,legColor,.004);
   b.add(foldedWingGeometry(taxon,side,bodyY),'#ffffff');
  }
  // Flat overlapping rectrices make a feathered tail, not a bundle of rods.
  for(let k=-2;k<=2;k++)b.add(profileGeometry([[-.94+Math.abs(k)*.025,bodyY-.095,k*.032,.002,.008],[-.84,bodyY-.07,k*.034,.009,.035],[-.64,bodyY-.015,k*.03,.012,.038],[-.42,bodyY+.02,k*.02,.008,.02]],{rows:14,sides:8}),spoon?cream:black);
  b=headBatch;
  if(avocet){beakTip=new THREE.Vector3(1.14,neckTop+.15,0);const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(.57,neckTop,0),new THREE.Vector3(.86,neckTop-.025,0),new THREE.Vector3(1.14,neckTop+.15,0)]);const tube=new THREE.TubeGeometry(curve,16,.016,6,false),vertices=tube.attributes.position;for(let j=0;j<=16;j++){const center=curve.getPointAt(j/16),taper=1-.875*j/16;for(let k=0;k<=6;k++){const i=j*7+k,v=new THREE.Vector3().fromBufferAttribute(vertices,i).sub(center).multiplyScalar(taper).add(center);vertices.setXYZ(i,v.x,v.y,v.z);}}tube.computeVertexNormals();b.add(tube,black);}
  else {const length=spoon?.92:oyster?.6:taxon==='tringa_totanus'?.49:.22,color=oyster?'#d27842':taxon==='tringa_totanus'?'#b76c4c':black;line([.56,neckTop,0],[.56+length,neckTop-.025,0],spoon?.021:oyster?.037:jay?.042:.022,color,spoon?.025:.003);beakTip=new THREE.Vector3(spoon?1.58:.56+length,neckTop-.025,0);if(taxon==='tringa_totanus')line([.88,neckTop-.016,0],[1.05,neckTop-.025,0],.009,black,.003);if(spoon)b.add(profileGeometry([[1.19,neckTop-.023,0,.016,.037],[1.32,neckTop-.025,0,.018,.075],[1.45,neckTop-.025,0,.018,.125],[1.54,neckTop-.025,0,.013,.09],[1.58,neckTop-.025,0,.002,.004]],{rows:24,sides:16,paint:x=>x>1.39?'#c4b17b':black}),'#ffffff');}
  const headPivot=new THREE.Group(),headMesh=b.mesh();headMesh.userData.skinVertexCount=skinVertexCount;root.headSkinMesh=headMesh;headPivot.position.set(.3,bodyY,0);
  if(wader){const neck=neckBatch.mesh();neck.geometry.translate(-.3,-bodyY,0);headPivot.add(neck);const joint=new THREE.Group();joint.position.set(.42-.3,neckTop-bodyY,0);headMesh.geometry.translate(-.42,-neckTop,0);joint.add(headMesh);headPivot.add(joint);root.headJoint=joint;root.beakContact=new THREE.Object3D();root.beakContact.name='beak-contact';root.beakContact.position.copy(beakTip).sub(new THREE.Vector3(.42,neckTop,0));joint.add(root.beakContact);}
  else{headMesh.geometry.translate(-.3,-bodyY,0);headPivot.add(headMesh);if(beakTip){root.beakContact=new THREE.Object3D();root.beakContact.name='beak-contact';root.beakContact.position.copy(beakTip).sub(headPivot.position);headPivot.add(root.beakContact);}}
  root.add(headPivot);root.headPivot=headPivot;b=bodyBatch;
  if(wader){root.birdLegs=[];for(const side of [-1,1]){const upper=new THREE.Mesh(new THREE.CylinderGeometry(.022,.026,1,7),new THREE.MeshStandardMaterial({color:legColor,roughness:1})),lower=upper.clone(),toes=new GeometryBatch();for(let k=-1;k<=1;k++)stick(toes,[0,.02,0],[.16,.005,k*.06],.009,legColor,.004);const foot=toes.mesh();root.add(upper,lower,foot);root.birdLegs.push({side,upper,lower,foot});}root.rig=coastalRig(taxon);}
  for(const side of [-1,1]){const wingBatch=new GeometryBatch();wingBatch.add(flightWingGeometry(taxon,side),'#ffffff');const wing=wingBatch.mesh();wing.position.set(0,bodyY+.12,side*.12);wing.visible=false;root.add(wing);wings.push(wing);}
  parts.legs=2;parts.technique=avocet||spoon?'sweeping':oyster?'shell-opening':wader?'probing':'searching';
 }else if(taxon==='apodemus_sylvaticus'){
  b.add(profileGeometry([[-.66,.30,0,.02,.03],[-.42,.34,0,.235,.23],[-.05,.33,0,.25,.235],[.30,.32,0,.19,.18],[.48,.37,0,.15,.15],[.63,.35,0,.11,.105],[.82,.30,0,.035,.04],[.87,.30,0,.018,.023]],{rows:54,sides:24,paint:(x,y,z)=>y<.22?'#c7bda5':y>.44?'#7c6b52':'#938269'}),'#ffffff');
  ball('#b48c79',.87,.30,0,.022,.018,.024);
  for(const side of [-1,1]){
   ball('#8b7864',.42,.53,side*.135,.105,.135,.024);ball('#b69c86',.435,.55,side*.153,.074,.095,.009);eye(.62,.405,side*.103,.034);
   for(const rear of [false,true]){const x=rear?-.35:.34;line([x,.29,side*.17],[x+(rear?.13:-.06),.13,side*.19],rear?.055:.029,'#948069',rear?.032:.02);line([x+(rear?.13:-.06),.13,side*.19],[x+.02,.035,side*.22],.021,'#aa8f77',.014);ball('#b69a83',x+.09,.027,side*.22,rear?.12:.075,.021,.039);for(let k=-1;k<=1;k++)line([x+.09,.023,side*.22+k*.022],[x+(rear?.23:.18),.013,side*.22+k*.025],.006,'#c1a28c',.003);}
  }
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.5,.25,0),new THREE.Vector3(-.95,.08,.12),new THREE.Vector3(-1.7,.025,.32)]);b.add(new THREE.TubeGeometry(curve,18,.025,6,false),'#ab947b');for(const side of [-1,1])for(let k=0;k<4;k++)line([.82,.33,side*.04],[.74+k*.025,.32+k*.018,side*.30],.0025,'#c5b8a1',.0008);parts.legs=4;
 }else if(['bombus_lapidarius','coccinella_septempunctata','aphidoidea','ixodes_ricinus'].includes(taxon)){
  const bee=taxon==='bombus_lapidarius',lady=taxon==='coccinella_septempunctata',tick=taxon==='ixodes_ricinus',color=bee?black:lady?'#b54535':tick?'#91634c':'#80a568';
  if(bee)b.add(profileGeometry([[-.73,.33,0,.02,.03],[-.54,.34,0,.22,.26],[-.25,.35,0,.27,.31],[.04,.36,0,.22,.26],[.25,.38,0,.24,.23],[.40,.36,0,.13,.15]],{rows:32,sides:20,paint:x=>x<-.38?'#a24b37':black}),'#ffffff');else if(taxon==='aphidoidea')b.add(profileGeometry([[-.64,.31,0,.03,.04],[-.38,.34,0,.28,.34],[-.08,.34,0,.30,.34],[.22,.32,0,.18,.22],[.43,.32,0,.12,.14]],{rows:26,sides:18}),color);else ball(color,0,.35,0,.62,tick?.18:.32,.42);ball(tick?'#68513c':taxon==='aphidoidea'?'#587a43':black,tick?.60:.51,.35,0,tick?.12:.16,tick?.08:.15,tick?.13:.17);const pairs=tick?4:3;
  for(let i=0;i<pairs;i++)for(const side of [-1,1]){const x=-.32+i*.27;line([x,.3,side*.22],[x+.12,.2,side*.65],.025,black);line([x+.12,.2,side*.65],[x-.1,0,side*.86],.02,black);}
  parts.legs=pairs*2;if(!tick)for(const side of [-1,1]){eye(.60,.405,side*.135,.026);line([.60,.43,side*.10],[.78,.57,side*.20],.012,black,.008);line([.78,.57,side*.20],[.91,.61,side*.32],.008,black,.004);}
  if(lady){const spots=[[-.31,-.27],[-.02,-.35],[.25,-.28],[-.31,.27],[-.02,.35],[.25,.28],[.45,0]];for(const [x,z]of spots)ball(black,x,.35+.29*Math.sqrt(Math.max(.05,1-(x/.7)**2-(z/.5)**2)),z,.075,.025,.075);line([-.6,.65,0],[.45,.65,0],.008,black);for(const side of [-1,1])ball(cream,.57,.5,side*.22,.08,.04,.05);parts.spots=7;}
  if(bee){for(let i=0;i<45;i++){const a=i*2.399,x=-.3+(i%8)*.08;line([x,.35+Math.cos(a)*.28,Math.sin(a)*.4],[x-.03,.35+Math.cos(a)*.34,Math.sin(a)*.46],.005,'#67685b');}for(const side of [-1,1]){const w=new GeometryBatch();w.add(sphere,'#bfc7b5',[.10,0,side*.39],[.40,.009,.21]);w.add(sphere,'#adbba8',[-.19,-.004,side*.30],[.27,.008,.14]);const wing=w.mesh();wing.position.set(.05,.59,side*.13);root.add(wing);wings.push(wing);}}
  if(tick){ball('#433d31',.24,.60,0,.30,.055,.29);line([.66,.35,0],[.82,.34,0],.027,'#68513c',.013);}
  if(taxon==='aphidoidea')for(const side of [-1,1])line([-.35,.5,side*.23],[-.52,.76,side*.28],.035,'#526d43',.022);
 }else if(taxon==='aglais_io'){
  if(stage==='caterpillar'){const points=[],radii=[];for(let j=0;j<=72;j++){const t=j/72;points.push([-.99+1.86*t,.15,0]);radii.push(.105*Math.sin(Math.PI*(.04+.92*t))**.22*(1-.06*Math.cos(t*Math.PI*24)));}b.add(sweptGeometry(points,radii,12),black);for(let i=0;i<12;i++){for(let j=0;j<5;j++){const a=j/5*Math.PI;line([-.9+i*.15,.17+Math.sin(a)*.09,Math.cos(a)*.09],[-.94+i*.15,.17+Math.sin(a)*.22,Math.cos(a)*.22],.01,black);}for(const side of [-1,1])ball(cream,-.9+i*.15,.18,side*.108,.012,.01,.01);}for(let k=0;k<8;k++)for(const side of [-1,1]){const x=-.70+k*.18;line([x,.10,side*.06],[x+.025,.015,side*.10],.018,black,.011);}parts.stage='caterpillar';}
  else {ball(black,0,.2,0,.52,.09,.1);for(const side of [-1,1]){const w=new GeometryBatch();w.add(butterflyWingGeometry(side,true),'#974b36');w.add(butterflyWingGeometry(side,false),'#784335');for(let k=0;k<6;k++)stick(w,[.05,.008,side*.10],[.50-k*.14,.01,side*(.65+.06*Math.sin(k))],.004,'#5e3c30',.001);for(const [x,z]of [[.33,side*.66],[-.42,side*.5]]){w.add(sphere,'#ccb477',[x,.025,z],[.15,.008,.14]);w.add(sphere,black,[x,.034,z],[.11,.007,.1]);w.add(sphere,'#789aa1',[x,.043,z],[.055,.007,.053]);}const wing=w.mesh({side:THREE.DoubleSide});wing.position.y=.22;root.add(wing);wings.push(wing);line([.42,.22,side*.04],[.74,.42,side*.2],.013,black);ball(black,.74,.42,side*.2,.035,.035,.025);for(let i=0;i<3;i++)line([i*.15-.1,.17,side*.06],[i*.15-.2,0,side*.3],.015,black);}parts.eyespots=4;parts.legs=6;}
 }else if(['lumbricidae','arenicola_marina','hediste_diversicolor'].includes(taxon)){
  const rag=taxon==='hediste_diversicolor',earth=taxon==='lumbricidae',segments=earth?42:30,points=[],radii=[];
  for(let i=0;i<=segments*3;i++){
   const t=i/(segments*3),x=-1+t*2,centerZ=Math.sin(t*Math.PI*2.4)*.025;
   let radius=.064*Math.pow(Math.sin(Math.PI*(.015+t*.97)),.3)*(1-.045*Math.cos(t*segments*Math.PI*2));
   if(earth&&t>10/segments&&t<16/segments)radius*=1.17;
   if(!earth&&!rag&&t>.78)radius*=.74;
   points.push([x,.071,centerZ]);radii.push(radius);
  }
  b.add(sweptGeometry(points,radii,10),earth?'#9a7265':rag?'#8c7b62':'#9c8770');
  for(let i=0;i<segments;i++){
   const t=i/segments,x=-1+t*2,z=Math.sin(t*Math.PI*2.4)*.025,r=.061*Math.sin((i+1)/(segments+1)*Math.PI)**.3;
   if(rag)for(const side of [-1,1]){line([x,.07,z+side*r],[x+.012,.04,z+side*(r+.07)],.011,'#baaa8a');for(let k=0;k<3;k++)line([x,.05,z+side*(r+.04)],[x+k*.01,.025,z+side*(r+.1)],.002,cream);}
   if(taxon==='arenicola_marina'&&i>=12&&i<25)for(const side of [-1,1]){line([x,.08,z+side*.05],[x-.016,.13,z+side*.105],.006,'#9b554b',.002);for(let k=0;k<3;k++)line([x-.012,.115,z+side*.09],[x-.03+k*.015,.15,z+side*.12],.003,'#9b554b',.001);}
  }
  parts.segmentCount=segments;parts.parapodia=rag;
 }else if(c.kind==='bivalve'){
  const cockle=taxon==='cerastoderma_edule',col=cockle?'#aaa18a':'#3d4b52';root.shellValves=[];for(const side of [-1,1]){if(cockle){
   const g=new THREE.SphereGeometry(1,44,16),pos=g.attributes.position;
   for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),angle=Math.atan2(x,y+.95),rib=1+.035*Math.cos(angle*44);pos.setXYZ(i,x*.60* rib,.18+y*.46,(z*.18* rib)+side*.06);}
   g.computeVertexNormals();b.add(g,col);g.dispose();
  }else{const valve=new THREE.Group(),g=new THREE.SphereGeometry(1,12,8,side>0?0:Math.PI,Math.PI);const pos=g.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),width=.63+.37*(x+1)*.5;pos.setXYZ(i,x*.85,.13+y*.33*width,z*.18*width);}g.computeVertexNormals();const shellMaterial=new THREE.MeshStandardMaterial({color:col,roughness:.92,side:THREE.DoubleSide});shellMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif(!gl_FrontFacing)diffuseColor.rgb=vec3(.48,.48,.40);');};const part=new THREE.Mesh(g,shellMaterial);valve.position.y=.05;valve.add(part);valve.userData.side=side;root.add(valve);root.shellValves.push(valve);}}if(!cockle){root.tissue=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),new THREE.MeshStandardMaterial({color:'#c0ae79',roughness:.9}));root.tissue.scale.set(.48,.12,.10);root.tissue.position.y=.16;root.add(root.tissue);}
  if(!cockle)for(let i=0;i<7;i++)line([-.6,.1,0],[-.9,.01,(i-3)*.04],.008,'#8a866c');parts.valves=2;parts.radialRibs=cockle?22:0;
  const siphonBatch=new GeometryBatch();for(const side of [-1,1])stick(siphonBatch,[.15,.45,side*.07],[.15,.8,side*.07],.025,'#b9ae99',.027);const siphons=siphonBatch.mesh();siphons.visible=false;root.add(siphons);root.siphons=siphons;
 }else if(taxon==='carcinus_maenas'){
  b.add(profileGeometry([[-.53,.21,0,.025,.23],[-.40,.25,0,.10,.52],[-.12,.27,0,.16,.67],[.20,.27,0,.14,.61],[.42,.24,0,.08,.45],[.50,.23,0,.035,.26]],{rows:30,sides:26,paint:(x,y,z)=>y>.30?'#75805c':'#8d9071'}),'#ffffff');root.crabLegs=[];root.claws=[];
  for(let i=0;i<4;i++)for(const side of [-1,1]){const x=-.38+i*.22,saved=b;b=new GeometryBatch();line([x,.2,side*.45],[x+.1,.14,side*.9],.04,'#7c8265');line([x+.1,.14,side*.9],[x-.12,0,side*1.12],.025,'#9a9778');const leg=b.mesh();leg.geometry.translate(-x,-.2,-side*.45);leg.position.set(x,.2,side*.45);root.add(leg);root.crabLegs.push({mesh:leg,index:i,side});b=saved;}
  for(const side of [-1,1]){const saved=b;b=new GeometryBatch();line([.4,.23,side*.4],[.95,.28,side*.65],.08,'#878563');ball('#9b9877',1,.3,side*.65,.2,.11,.15);line([1.05,.3,side*.55],[1.28,.3,side*.6],.05,'#b7a687');line([1.05,.3,side*.75],[1.25,.3,side*.7],.04,'#b7a687');const claw=new THREE.Group(),part=b.mesh();part.geometry.translate(-.4,-.23,-side*.4);claw.position.set(.4,.23,side*.4);claw.add(part);root.add(claw);root.claws.push(claw);if(side===1){root.clawContact=new THREE.Object3D();root.clawContact.position.set(.88,.07,.2);claw.add(root.clawContact);}b=saved;eye(.48,.43,side*.28,.045);}for(const side of [-1,1])for(let k=0;k<5;k++){const x=.32-k*.12;line([x,.32,side*.60],[x+.04,.33,side*(.69-Math.abs(k-2)*.015)],.022,'#737a5b',.001);}parts.walkingLegs=8;parts.claws=2;
 }else if(taxon==='crangon_crangon'){
  ball('#a8a088',.25,.2,0,.45,.19,.17);{const points=[],radii=[];for(let i=0;i<=36;i++){const t=i/36;points.push([-.04-t*.96,.15-.06*t+.025*Math.sin(t*Math.PI),0]);radii.push((.14-.065*t)*(1-.09*Math.cos(t*Math.PI*12)));}b.add(sweptGeometry(points,radii,10),'#a59d85');}for(const side of [-1,1]){for(let i=0;i<5;i++){line([.42-i*.14,.17,side*.1],[.25-i*.14,0,side*.25],.015,'#b5ab8d');line([-.17-i*.14,.08,side*.07],[-.19-i*.14,.015,side*.16],.008,'#c4b89a');}line([.62,.3,side*.08],[1.6,.18,side*.4],.009,'#c8bea0');ball('#171e19',.63,.33,side*.14,.045,.045,.03);ball('#c0b69c',-1.12,.08,side*.13,.19,.025,.15);}line([.48,.32,0],[.85,.35,0],.025,'#b7ae96',.001);for(let k=-2;k<=2;k++)line([-1.05,.08,0],[-1.27,.06,k*.075],.015,'#bcb196',.004);parts.walkingLegs=10;parts.swimmeretPairs=5;
 }else if(taxon==='peringia_ulvae'){
  ball('#959477',0,.05,0,.65,.06,.2);
  // Joined conical shell with five spiral sutures; no exposed spring-like tube.
  const p=[],indices=[],rings=80,sides=32;
  for(let j=0;j<=rings;j++)for(let k=0;k<=sides;k++){
   const t=j/rings,a=k/sides*Math.PI*2,r=.43*Math.pow(1-t,.83)*(1+.075*Math.cos(t*Math.PI*10-a));
   p.push(Math.cos(a)*r-.10,.13+t*.9,Math.sin(a)*r*.82);
   if(j<rings&&k<sides){const n=j*(sides+1)+k;indices.push(n,n+sides+1,n+1,n+1,n+sides+1,n+sides+2);}
  }
  const shell=new THREE.BufferGeometry();shell.setAttribute('position',new THREE.Float32BufferAttribute(p,3));shell.setIndex(indices);shell.computeVertexNormals();b.add(shell,'#8e836a');shell.dispose();
  ball('#595c47',.27,.19,0,.035,.14,.12);
  for(const side of [-1,1])line([.5,.08,side*.08],[.8,.18,side*.16],.02,'#acaa8a');parts.whorls=5;
 }else throw Error('Kein eigener Modellbauer für '+taxon);
 const mesh=b.mesh();mesh.name='diagnostic-body';root.add(mesh);root.bodyMesh=mesh;if(root.birdLegs)poseCoastalBird(root,{pose:{pitch:0,yaw:0,crouch:0},activity:'resting'},0);root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(root),extent=taxon==='apodemus_sylvaticus'?1.55:taxon==='aglais_io'&&stage!=='caterpillar'?bounds.max.z-bounds.min.z:bounds.max.x-bounds.min.x;
 const actualLength=taxon==='aglais_io'&&stage==='caterpillar'?.035:c.length;root.scale.setScalar(root.rig?.scale||(taxon==='carcinus_maenas'?CRAB_RIG.scale:taxon==='mytilus_edulis'?actualLength/1.75:actualLength/extent));root.animation={wings};root.userData={taxon,stage,parts,diagnostics:c.diagnostics};return finishOrganism(root,taxon);
}

const segment=(mesh,a,b)=>{const diff=b.clone().sub(a);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),diff.clone().normalize());mesh.scale.set(1,diff.length(),1);};
export function poseCoastalBird(model,actor,time){
 if(!model.birdLegs)return;
 const p=actor.pose||{pitch:0,yaw:0,crouch:0},crouch=p.crouch||0;model.headPivot.position.y=1.4-crouch;model.headPivot.rotation.set(0,p.yaw||0,p.pitch||0);if(model.headJoint)model.headJoint.rotation.z=(p.billPitch||0)-(p.pitch||0);model.bodyMesh.position.y=-crouch;
 const moving=['walking','approaching','departing'].includes(actor.activity),phase=(actor.walkDistance||0)/(model.rig.scale*(.34/.62));
 for(const leg of model.birdLegs){const cycle=(phase+(leg.side>0?.5:0))%1,swing=moving&&cycle>.62?(cycle-.62)/.38:0,lift=swing?.15*Math.sin(swing*Math.PI):0,offset=moving?(cycle<.62?.17-.34*cycle/.62:-.17+.34*(swing*swing*(3-2*swing))):0,hip=new THREE.Vector3(-.12,1.13-crouch,leg.side*.16),foot=new THREE.Vector3(-.12+offset,lift,leg.side*.19),knee=hip.clone().lerp(foot,.5);knee.x-=.17+crouch*.28;segment(leg.upper,hip,knee);segment(leg.lower,knee,foot);leg.foot.position.copy(foot);leg.foot.userData={stance:lift===0};}
 for(const wing of model.animation?.wings||[])wing.position.y=1.52-crouch;
 model.userData.contactScope='Actual bill endpoint and articulated support legs; numeric contact does not certify natural animation';
}

export function poseCrab(model,a){
 for(const claw of model.claws||[])claw.rotation.z=a.pose?.clawPitch||0;
 const moving=['approaching','departing'].includes(a.activity),phase=(a.walkDistance||0)/.035;
 for(const {mesh,index,side}of model.crabLegs||[]){const swing=moving?Math.max(0,Math.sin(phase*6+index*Math.PI/2+side*Math.PI)):.0;mesh.rotation.y=moving?Math.sin(phase*6+index*Math.PI/2)*.16:0;mesh.position.y=.2+swing*.08;}
}
