import * as THREE from '../vendor/three.module.js?revision=120';
import { coastalRig,CRAB_RIG } from './coastal-rig.js';
import { birdBodyGeometry,butterflyWingGeometry } from './organic-geometry.js';
import { finishOrganism } from './organism-finish.js';
import { CATALOG } from './catalog.js';
import { GeometryBatch,stick,plantGeometry } from './geometry.js';

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
  b.add(new THREE.SphereGeometry(1,22,10,0,Math.PI), '#9d9b8e',[0,.3,0],[1,.55,.85],[0,Math.PI/2,0]);
  for(let i=0;i<7;i++){const r=.3+i*.095;const curve=new THREE.EllipseCurve(0,0,r,r*.8,0,Math.PI,false,0);const points=curve.getPoints(32).map(p=>new THREE.Vector3(p.x,.3+(1-r)*.46,p.y));b.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,.014,4,false),i%2?'#696b62':'#bbb7a6');}
  for(let i=0;i<60;i++){const a=i*2.399,r=Math.sqrt(i/60)*.9;ball('#bcbba5',Math.cos(a)*r,.13,Math.sin(a)*r*.65,.018,.006,.018);}parts.pores=60;
 }else if(c.kind==='bird'){
  const wader=['recurvirostra_avosetta','platalea_leucorodia','tringa_totanus','haematopus_ostralegus'].includes(taxon),spoon=taxon==='platalea_leucorodia',avocet=taxon==='recurvirostra_avosetta',oyster=taxon==='haematopus_ostralegus',tit=taxon==='parus_major',jay=taxon==='garrulus_glandarius';
  const bodyColor=spoon||avocet||oyster?cream:tit?'#a6a24c':jay?'#a88d83':'#817d6b',legHeight=wader?1.05:.22,bodyY=legHeight+.35,legColor=avocet?'#7b9596':spoon?'#40463e':wader?'#b46545':'#656754';
  b.add(birdBody,bodyColor,[0,bodyY,0],[.62,.36,.29]);ball(oyster?black:bodyColor,.28,bodyY+.08,0,.32,.33,.24);
  if(oyster)ball(black,.1,bodyY+.24,0,.55,.21,.27);
  const neckTop=wader&&!oyster?bodyY+.72:bodyY+.39;
  const bodyBatch=b,neckBatch=wader?new GeometryBatch():null;b=new GeometryBatch();if(wader){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(.3,bodyY+.05,0),new THREE.Vector3(.34,bodyY+.28,0),new THREE.Vector3(.39,neckTop-.2,0),new THREE.Vector3(.42,neckTop,0)]);neckBatch.add(new THREE.TubeGeometry(curve,12,.095,12,false),spoon||avocet?cream:bodyColor);}else line([.3,bodyY+.05,0],[.38,neckTop,0],.14,tit?black:bodyColor,.09);
  ball(spoon?cream:avocet||oyster||tit?black:bodyColor,.42,neckTop,0,.19,.19,.17);
  for(const side of [-1,1]){
   if(tit)ball(cream,.47,neckTop-.04,side*.145,.11,.085,.035);
   eye(.51,neckTop+.025,side*.166,.025);
  }
  const headBatch=b,skinVertexCount=b.p.length/3;b=bodyBatch;let beakTip;
  for(const side of [-1,1]){
   if(!wader)line([-.12,legHeight+.08,side*.16],[-.12,0,side*.19],.025,legColor,.022);
   if(!wader)for(let k=-1;k<=1;k++)line([-.12,.02,side*.19],[.04,.005,side*.19+k*.06],.009,legColor,.004);
   ball(oyster||avocet?black:jay?'#82736a':tit?'#65704c':'#868777',-.17,bodyY+.12,side*.24,.43,.18,.06);
   if(jay){ball('#75a5bc',.03,bodyY+.11,side*.286,.17,.09,.014);for(let k=0;k<5;k++)ball(black,-.09+k*.045,bodyY+.11,side*.30,.012,.075,.005);ball(cream,-.5,bodyY+.12,side*.15,.13,.12,.07);}
   if(avocet)ball(black,-.29,bodyY+.28,side*.25,.22,.08,.03);
   // Overlapping folded primary feathers follow each side; no new flight state.
   for(let k=0;k<7;k++){const col=oyster||avocet?black:spoon?'#d8d6c7':tit?'#777e66':jay?'#746d69':'#777663';ball(col,-.25-k*.055,bodyY+.10-k*.012,side*(.27-k*.012),.17,.025,.017);}
   if(taxon==='tringa_totanus')for(let k=0;k<14;k++){const x=.10+(k%4)*.085,y=bodyY+.02+Math.floor(k/4)*.065;ball('#675f4c',x,y,side*(.25-(k%4)*.012),.012,.028,.006);}
  
  }
  if(tit)ball(black,.15,bodyY-.23,0,.30,.035,.045);
  for(let k=-2;k<=2;k++){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.4,bodyY,k*.032),new THREE.Vector3(-.7,bodyY-.04,k*.038),new THREE.Vector3(-.94+Math.abs(k)*.025,bodyY-.12,k*.032)]);b.add(new THREE.TubeGeometry(curve,6,.017,5,false),spoon?'#d9d8c9':black);}
  b=headBatch;
  if(avocet){beakTip=new THREE.Vector3(1.14,neckTop+.15,0);const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(.57,neckTop,0),new THREE.Vector3(.86,neckTop-.025,0),new THREE.Vector3(1.14,neckTop+.15,0)]);const tube=new THREE.TubeGeometry(curve,16,.016,6,false),vertices=tube.attributes.position;for(let j=0;j<=16;j++){const center=curve.getPointAt(j/16),taper=1-.875*j/16;for(let k=0;k<=6;k++){const i=j*7+k,v=new THREE.Vector3().fromBufferAttribute(vertices,i).sub(center).multiplyScalar(taper).add(center);vertices.setXYZ(i,v.x,v.y,v.z);}}tube.computeVertexNormals();b.add(tube,black);}
  else {const length=spoon?.92:oyster?.6:taxon==='tringa_totanus'?.49:.22,color=oyster?'#d27842':taxon==='tringa_totanus'?'#b76c4c':black;line([.56,neckTop,0],[.56+length,neckTop-.025,0],spoon?.038:oyster?.045:.018,color,spoon?.045:.003);beakTip=new THREE.Vector3(spoon?1.58:.56+length,neckTop-.025,0);if(spoon)ball('#c1ae77',1.46,neckTop-.025,0,.12,.025,.085);}
  const headPivot=new THREE.Group(),headMesh=b.mesh();headMesh.userData.skinVertexCount=skinVertexCount;root.headSkinMesh=headMesh;headPivot.position.set(.3,bodyY,0);
  if(wader){const neck=neckBatch.mesh();neck.geometry.translate(-.3,-bodyY,0);headPivot.add(neck);const joint=new THREE.Group();joint.position.set(.42-.3,neckTop-bodyY,0);headMesh.geometry.translate(-.42,-neckTop,0);joint.add(headMesh);headPivot.add(joint);root.headJoint=joint;root.beakContact=new THREE.Object3D();root.beakContact.name='beak-contact';root.beakContact.position.copy(beakTip).sub(new THREE.Vector3(.42,neckTop,0));joint.add(root.beakContact);}
  else{headMesh.geometry.translate(-.3,-bodyY,0);headPivot.add(headMesh);if(beakTip){root.beakContact=new THREE.Object3D();root.beakContact.name='beak-contact';root.beakContact.position.copy(beakTip).sub(headPivot.position);headPivot.add(root.beakContact);}}
  root.add(headPivot);root.headPivot=headPivot;b=bodyBatch;
  if(wader){root.birdLegs=[];for(const side of [-1,1]){const upper=new THREE.Mesh(new THREE.CylinderGeometry(.022,.026,1,7),new THREE.MeshStandardMaterial({color:legColor,roughness:1})),lower=upper.clone(),toes=new GeometryBatch();for(let k=-1;k<=1;k++)stick(toes,[0,.02,0],[.16,.005,k*.06],.009,legColor,.004);const foot=toes.mesh();root.add(upper,lower,foot);root.birdLegs.push({side,upper,lower,foot});}root.rig=coastalRig(taxon);}
  for(const side of [-1,1]){const wingBatch=new GeometryBatch();wingBatch.add(sphere,jay?'#7d9bad':oyster||avocet?black:bodyColor,[-.15,0,side*.65],[.38,.025,.65]);const wing=wingBatch.mesh();wing.position.set(0,bodyY+.12,side*.12);wing.visible=false;root.add(wing);wings.push(wing);}
  parts.legs=2;parts.technique=avocet||spoon?'sweeping':oyster?'shell-opening':wader?'probing':'searching';
 }else if(taxon==='apodemus_sylvaticus'){
  ball('#8b7d64',0,.35,0,.65,.33,.25);ball('#d0bd9a',.23,.25,0,.4,.17,.22);ball('#92826a',.57,.38,0,.32,.24,.22);ball('#c2a28a',.87,.31,0,.04,.03,.04);
  for(const side of [-1,1]){ball('#a28b77',.43,.63,side*.20,.17,.20,.04);ball('#c4a58e',.45,.65,side*.23,.12,.14,.015);eye(.65,.46,side*.195,.065);for(const x of [-.35,.35]){line([x,.27,side*.18],[x+.03,.03,side*.23],.06,'#b69b7b');ball('#ba9a7d',x+.13,.025,side*.23,.12,.03,.055);}}
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.5,.25,0),new THREE.Vector3(-.95,.08,.12),new THREE.Vector3(-1.7,.025,.32)]);b.add(new THREE.TubeGeometry(curve,18,.025,6,false),'#ab947b');for(const side of [-1,1])for(let k=0;k<4;k++)line([.82,.33,side*.04],[.74+k*.025,.32+k*.018,side*.30],.0025,'#c5b8a1',.0008);parts.legs=4;
 }else if(['bombus_lapidarius','coccinella_septempunctata','aphidoidea','ixodes_ricinus'].includes(taxon)){
  const bee=taxon==='bombus_lapidarius',lady=taxon==='coccinella_septempunctata',tick=taxon==='ixodes_ricinus',color=bee?black:lady?'#b54535':tick?'#91634c':'#80a568';
  ball(color,0,.35,0,.62,.32,.42);if(!tick)ball(bee?'#9e4435':color,-.42,.36,0,.3,.27,.35);ball(tick?'#68513c':black,tick?.60:.56,.35,0,tick?.12:.24,tick?.08:.22,tick?.13:.26);const pairs=tick?4:3;
  for(let i=0;i<pairs;i++)for(const side of [-1,1]){const x=-.32+i*.27;line([x,.3,side*.22],[x+.12,.2,side*.65],.025,black);line([x+.12,.2,side*.65],[x-.1,0,side*.86],.02,black);}
  parts.legs=pairs*2;if(!tick)for(const side of [-1,1]){eye(.7,.43,side*.18,.04);line([.67,.43,side*.12],[.93,.64,side*.36],.018,black);}
  if(lady){const spots=[[-.31,-.27],[-.02,-.35],[.25,-.28],[-.31,.27],[-.02,.35],[.25,.28],[.45,0]];for(const [x,z]of spots)ball(black,x,.35+.29*Math.sqrt(Math.max(.05,1-(x/.7)**2-(z/.5)**2)),z,.075,.025,.075);line([-.6,.65,0],[.45,.65,0],.008,black);for(const side of [-1,1])ball(cream,.57,.5,side*.22,.08,.04,.05);parts.spots=7;}
  if(bee){for(let i=0;i<45;i++){const a=i*2.399,x=-.3+(i%8)*.08;line([x,.35+Math.cos(a)*.28,Math.sin(a)*.4],[x-.03,.35+Math.cos(a)*.34,Math.sin(a)*.46],.005,'#67685b');}for(const side of [-1,1]){const w=new GeometryBatch();w.add(sphere,'#c7c9ad',[0,0,side*.4],[.48,.018,.26]);const wing=w.mesh();wing.position.set(.05,.59,side*.13);root.add(wing);wings.push(wing);}}
  if(tick){ball('#433d31',.24,.60,0,.30,.055,.29);line([.66,.35,0],[.82,.34,0],.027,'#68513c',.013);}
  if(taxon==='aphidoidea')for(const side of [-1,1])line([-.35,.5,side*.23],[-.52,.76,side*.28],.035,'#526d43',.022);
 }else if(taxon==='aglais_io'){
  if(stage==='caterpillar'){for(let i=0;i<12;i++){ball(black,-.9+i*.15,.15,0,.12,.13,.11);for(let j=0;j<5;j++){const a=j/5*Math.PI;line([-.9+i*.15,.17+Math.sin(a)*.09,Math.cos(a)*.09],[-.94+i*.15,.17+Math.sin(a)*.22,Math.cos(a)*.22],.01,black);}for(const side of [-1,1])ball(cream,-.9+i*.15,.18,side*.108,.012,.01,.01);}for(let k=0;k<8;k++)for(const side of [-1,1]){const x=-.70+k*.18;line([x,.10,side*.06],[x+.025,.015,side*.10],.018,black,.011);}parts.stage='caterpillar';}
  else {ball(black,0,.2,0,.52,.09,.1);for(const side of [-1,1]){const w=new GeometryBatch();w.add(butterflyWingGeometry(side,true),'#974b36');w.add(butterflyWingGeometry(side,false),'#784335');for(let k=0;k<6;k++)stick(w,[.05,.008,side*.10],[.50-k*.14,.01,side*(.65+.06*Math.sin(k))],.004,'#5e3c30',.001);for(const [x,z]of [[.33,side*.66],[-.42,side*.5]]){w.add(sphere,'#ccb477',[x,.025,z],[.15,.008,.14]);w.add(sphere,black,[x,.034,z],[.11,.007,.1]);w.add(sphere,'#789aa1',[x,.043,z],[.055,.007,.053]);}const wing=w.mesh({side:THREE.DoubleSide});wing.position.y=.22;root.add(wing);wings.push(wing);line([.42,.22,side*.04],[.74,.42,side*.2],.013,black);ball(black,.74,.42,side*.2,.035,.035,.025);for(let i=0;i<3;i++)line([i*.15-.1,.17,side*.06],[i*.15-.2,0,side*.3],.015,black);}parts.eyespots=4;parts.legs=6;}
 }else if(['lumbricidae','arenicola_marina','hediste_diversicolor'].includes(taxon)){
  const rag=taxon==='hediste_diversicolor',earth=taxon==='lumbricidae',segments=earth?42:30;for(let i=0;i<segments;i++){const x=-1+i/segments*2,r=.065*Math.sin((i+1)/(segments+1)*Math.PI)**.3;ball(earth?'#9a7265':rag?'#8c7b62':'#9c8770',x,.07,Math.sin(i*.3)*.025,.034,r,r);if(earth&&i>10&&i<16)ball('#b5907e',x,.07,0,.035,r*1.25,r*1.25);if(rag)for(const side of [-1,1]){line([x,.07,side*r],[x+.012,.04,side*(r+.07)],.012,'#baaa8a');for(let k=0;k<3;k++)line([x,.05,side*(r+.04)],[x+k*.01,.025,side*(r+.1)],.002,cream);}}if(taxon==='arenicola_marina')for(let i=12;i<25;i++)for(const side of [-1,1]){const x=-1+i/segments*2;line([x,.08,side*.06],[x-.016,.13,side*.115],.006,'#9b554b',.002);for(let k=0;k<3;k++)line([x-.012,.115,side*.10],[x-.03+k*.015,.15,side*.13],.003,'#9b554b',.001);}
  parts.segmentCount=segments;parts.parapodia=rag;
 }else if(c.kind==='bivalve'){
  const cockle=taxon==='cerastoderma_edule',col=cockle?'#aaa18a':'#3d4b52';root.shellValves=[];for(const side of [-1,1]){if(cockle)ball(col,0,.18,side*.06,.6,.46,.18);else{const valve=new THREE.Group(),g=new THREE.SphereGeometry(1,12,8,side>0?0:Math.PI,Math.PI);g.scale(.85,.33,.18);g.translate(0,.13,0);const shellMaterial=new THREE.MeshStandardMaterial({color:col,roughness:.92,side:THREE.DoubleSide});shellMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif(!gl_FrontFacing)diffuseColor.rgb=vec3(.48,.48,.40);');};const part=new THREE.Mesh(g,shellMaterial);valve.position.y=.05;valve.add(part);valve.userData.side=side;root.add(valve);root.shellValves.push(valve);}}if(!cockle){root.tissue=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),new THREE.MeshStandardMaterial({color:'#c0ae79',roughness:.9}));root.tissue.scale.set(.48,.12,.10);root.tissue.position.y=.16;root.add(root.tissue);}
  if(cockle)for(let i=0;i<22;i++){const a=i/21*Math.PI;line([-.45,.02,0],[Math.cos(a)*.6,.18+Math.sin(a)*.45,.2],.012,'#c1b79c');}else for(let i=0;i<7;i++)line([-.6,.1,0],[-.9,.01,(i-3)*.04],.008,'#8a866c');parts.valves=2;parts.radialRibs=cockle?22:0;
  const siphonBatch=new GeometryBatch();for(const side of [-1,1])stick(siphonBatch,[.15,.45,side*.07],[.15,.8,side*.07],.025,'#b9ae99',.027);const siphons=siphonBatch.mesh();siphons.visible=false;root.add(siphons);root.siphons=siphons;
 }else if(taxon==='carcinus_maenas'){
  ball('#69755c',0,.25,0,.53,.22,.7);root.crabLegs=[];root.claws=[];
  for(let i=0;i<4;i++)for(const side of [-1,1]){const x=-.38+i*.22,saved=b;b=new GeometryBatch();line([x,.2,side*.45],[x+.1,.14,side*.9],.04,'#7c8265');line([x+.1,.14,side*.9],[x-.12,0,side*1.12],.025,'#9a9778');const leg=b.mesh();leg.geometry.translate(-x,-.2,-side*.45);leg.position.set(x,.2,side*.45);root.add(leg);root.crabLegs.push({mesh:leg,index:i,side});b=saved;}
  for(const side of [-1,1]){const saved=b;b=new GeometryBatch();line([.4,.23,side*.4],[.95,.28,side*.65],.08,'#878563');ball('#9b9877',1,.3,side*.65,.2,.11,.15);line([1.05,.3,side*.55],[1.28,.3,side*.6],.05,'#b7a687');line([1.05,.3,side*.75],[1.25,.3,side*.7],.04,'#b7a687');const claw=new THREE.Group(),part=b.mesh();part.geometry.translate(-.4,-.23,-side*.4);claw.position.set(.4,.23,side*.4);claw.add(part);root.add(claw);root.claws.push(claw);if(side===1){root.clawContact=new THREE.Object3D();root.clawContact.position.set(.88,.07,.2);claw.add(root.clawContact);}b=saved;eye(.48,.43,side*.28,.045);}for(const side of [-1,1])for(let k=0;k<5;k++){const x=.32-k*.12;line([x,.32,side*.60],[x+.04,.33,side*(.69-Math.abs(k-2)*.015)],.022,'#737a5b',.001);}parts.walkingLegs=8;parts.claws=2;
 }else if(taxon==='crangon_crangon'){
  ball('#a8a088',.25,.2,0,.45,.19,.17);for(let i=0;i<6;i++)ball('#a59d85',-.1-i*.17,.15-i*.008,0,.12,.13-i*.012,.15-i*.011);for(const side of [-1,1]){for(let i=0;i<5;i++){line([.42-i*.14,.17,side*.1],[.25-i*.14,0,side*.25],.015,'#b5ab8d');line([-.17-i*.14,.08,side*.07],[-.19-i*.14,.015,side*.16],.008,'#c4b89a');}line([.62,.3,side*.08],[1.6,.18,side*.4],.009,'#c8bea0');ball('#171e19',.63,.33,side*.14,.045,.045,.03);ball('#c0b69c',-1.12,.08,side*.13,.19,.025,.15);}line([.48,.32,0],[.85,.35,0],.025,'#b7ae96',.001);for(let k=-2;k<=2;k++)line([-1.05,.08,0],[-1.27,.06,k*.075],.015,'#bcb196',.004);parts.walkingLegs=10;parts.swimmeretPairs=5;
 }else if(taxon==='peringia_ulvae'){
  ball('#959477',0,.05,0,.65,.06,.2);const points=[];for(let i=0;i<=100;i++){const t=i/100,a=t*Math.PI*8,r=.46*(1-t);points.push(new THREE.Vector3(Math.cos(a)*r,.13+t*.9,Math.sin(a)*r));}b.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),100,.10,8,false),'#8e836a');for(const side of [-1,1])line([.5,.08,side*.08],[.8,.18,side*.16],.02,'#acaa8a');parts.whorls=4;
 }else throw Error('Kein eigener Modellbauer für '+taxon);
 const mesh=b.mesh();mesh.name='diagnostic-body';root.add(mesh);root.bodyMesh=mesh;if(root.birdLegs)poseCoastalBird(root,{pose:{pitch:0,yaw:0,crouch:0},activity:'resting'},0);root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(root),extent=taxon==='aglais_io'&&stage!=='caterpillar'?bounds.max.z-bounds.min.z:bounds.max.x-bounds.min.x;
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
