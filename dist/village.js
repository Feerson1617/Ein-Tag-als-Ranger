import { createResidentLocations } from './village-people.js?revision=120';
import * as THREE from './vendor/three.module.js?revision=120';
import { layoutPoint, layoutAxis, AUTHORED_CENTERS } from './world-layout.js?revision=120';
import { PLANTS } from './biodiversity.js?revision=120';
import { botanicalGeometry } from './plant-forms.js?revision=120';

// The six original outer plots are retained; dimensions are in metres after map compression.
export const VILLAGE_LOTS=[-33,33].flatMap((dx,col)=>[-29,0,29].map((dz,row)=>({
 x:layoutAxis(AUTHORED_CENTERS.city.x)+dx*.62*.56,z:dz*.62,id:`cottage-${col}-${row}`,
 rotation:col?-Math.PI/2:Math.PI/2,width:5.4+row*.2,depth:4.8,height:2.65+row*.12,rise:1.9,col,row
}))).filter(p=>!(p.col===1&&p.row===2)); // The existing village pond occupies this plot.
const villageCenter=layoutPoint(AUTHORED_CENTERS.city);
// One narrow residential lane stays east of the itinerary and all its western bays.
export const VILLAGE_STREET={a:{x:villageCenter.x+3.8,z:-23},b:{x:villageCenter.x+3.8,z:layoutAxis(106)},width:2.7};
export const FARM_APPROACH=[VILLAGE_STREET.b,{x:VILLAGE_STREET.b.x+1.3,z:VILLAGE_STREET.b.z+2.4},{x:VILLAGE_STREET.b.x+4.2,z:VILLAGE_STREET.b.z+5.2}];
export function villagePlotContains(x,z){
 if(z>VILLAGE_STREET.a.z-.4&&z<VILLAGE_STREET.b.z+.4&&Math.abs(x-VILLAGE_STREET.a.x)<VILLAGE_STREET.width/2+.35)return true;
 for(let i=0;i<FARM_APPROACH.length-1;i++){
  const a=FARM_APPROACH[i],b=FARM_APPROACH[i+1],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));
  if(Math.hypot(x-a.x-dx*t,z-a.z-dz*t)<1.7)return true;
 }
 return VILLAGE_LOTS.some(p=>Math.abs(x-p.x)<5.8&&Math.abs(z-p.z)<5.6);
}

export function buildVillage(world,{instance,groundHeight,pondContains,ponds}){
 const analyticalGround=groundHeight,collisionStart=world.collisions.length;
 groundHeight=(x,z)=>world.terrainHeight(x,z);
 const walls=[],foundations=[],roofs=[],gables=[],frames=[],glass=[],doors=[],metal=[],timber=[],fences=[],curbs=[];
 const point=(p,u,v,y)=>({x:p.x+Math.cos(p.rotation)*u+Math.sin(p.rotation)*v,z:p.z-Math.sin(p.rotation)*u+Math.cos(p.rotation)*v,y:p.base+y,ry:p.rotation});
 const box=(list,p,u,v,y,sx,sy,sz,color)=>list.push({...point(p,u,v,y),sx,sy,sz,color});
 const brickMap=world.surfaces.clone(),tileMap=world.surfaces.clone();brickMap.repeat.set(6,4);tileMap.repeat.set(2,1.5);
 const wall=world.terrainMaterial(1,brickMap,{color:'#e0d7c3',normalMap:null,roughness:.94});
 const roof=world.terrainMaterial(2,tileMap,{color:'#b5aaa0',normalMap:null,side:THREE.DoubleSide,roughness:.86});
 const wood=world.material({map:world.deckTexture,bumpMap:world.deckTexture,bumpScale:.002,color:'#c0b599',roughness:.88});
 world.village={houses:[],gardens:[],streets:[]};
 for(const p of VILLAGE_LOTS){
  const samples=[],nu=Math.ceil((p.width+.18)/.22),nv=Math.ceil((p.depth+.18)/.22);for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){const u=-(p.width+.18)/2+(p.width+.18)*i/nu,v=-(p.depth+.18)/2+(p.depth+.18)*j/nv,q=point({...p,base:0},u,v,0);samples.push(groundHeight(q.x,q.z));}
  p.base=Math.max(...samples)+.025;p.foundationBottom=Math.min(...samples)-.22;p.foundationHeight=p.base+.015-p.foundationBottom;
  world.village.houses.push({...p});
  const hx=p.depth/2,hz=p.width/2;
  world.collisions.push({x:p.x,z:p.z,r:Math.hypot(hx,hz),halfX:hx,halfZ:hz,height:p.height+p.rise,baseY:p.base-groundHeight(p.x,p.z),type:'house'});
  box(foundations,p,0,0,.015-p.foundationHeight/2,p.width+.18,p.foundationHeight,p.depth+.18,'#969487');
  box(walls,p,0,0,p.height/2,p.width,p.height,p.depth,p.col?'#d8c9b4':'#cbb8a7');
  // A solid gable prism closes both ends. Thick roof slabs use the same pitch,
  // including their overhang: scaling a roof triangle taller opened the old seam.
  gables.push({...point(p,0,0,p.height),sx:p.width,sy:p.rise,sz:p.depth});
  const half=p.width/2,overhang=.23,pitch=p.rise/half,angle=Math.atan(pitch),run=half+overhang,length=Math.hypot(run,pitch*run),thickness=.10;
  for(const side of [-1,1]){
   roofs.push({...point(p,side*run/2+side*Math.sin(angle)*thickness/2,0,p.height+p.rise-pitch*run/2+Math.cos(angle)*thickness/2),sx:length,sy:thickness,sz:p.depth+.56,rz:-side*angle});
   box(timber,p,side*(half+overhang),0,p.height-pitch*overhang-.02,.10,.13,p.depth+.56);
   box(metal,p,side*(half+overhang+.035),0,p.height-pitch*overhang-.05,.09,.08,p.depth+.6,'#68675b');
   const drain=point(p,side*(half+.075),-p.depth/2+.10,0),foot=groundHeight(drain.x,drain.z),top=p.base+p.height-pitch*overhang;
   metal.push({...drain,y:(foot+top)/2,sx:.065,sy:top-foot,sz:.065,color:'#68675b'});
  }
  box(metal,p,0,0,p.height+p.rise+.075,.13,.10,p.depth+.6,'#6c706b');
  box(walls,p,-1.2,-.8,p.height+p.rise-.1,.45,1.35,.5,'#aca294');
  box(metal,p,-1.2,-.8,p.height+p.rise+.6,.55,.07,.6,'#62645c');
  box(doors,p,0,p.depth/2+.065,.97,.87,1.94,.1,p.row%2?'#465d50':'#78634e');
  box(frames,p,0,p.depth/2+.13,1.98,1,.06,.09);
  for(const side of [-1,1])box(frames,p,side*.47,p.depth/2+.13,1,.055,2,.09);
  box(metal,p,.29,p.depth/2+.15,1,.025,.065,.025,'#ab9c68');
  for(const side of [-1,1]){
   const u=side*1.66,v=p.depth/2+.012,y=1.63;
   box(glass,p,u,v,y,.84,1.08,.032,'#495859');
   for(const offset of [-.46,0,.46])box(frames,p,u+offset,v+.045,y,.045,1.2,.09);
   for(const offset of [-.58,0,.58])box(frames,p,u,v+.045,y+offset,.95,.045,.09);
   box(timber,p,u,v+.13,y-.67,1.03,.12,.22);
   box(doors,p,u+side*.68,v+.055,y,.32,1.15,.045,p.row%2?'#596654':'#737568');
   // Windows on the back remain a quiet, cream-framed detail.
   box(glass,p,u,-p.depth/2-.025,y,.82,1.05,.035);
   for(const offset of [-.46,0,.46])box(frames,p,u+offset,-p.depth/2-.04,y,.045,1.18,.07);
   for(const h of [-.57,0,.57])box(frames,p,u,-p.depth/2-.04,y+h,.96,.045,.07);
  }
  const garden=point(p,0,p.depth/2+1.9,0);world.village.gardens.push({house:p.id,x:garden.x,z:garden.z});
  // Continuous collision rails match the pickets; only the central gate is open.
  const fenceSegment=(u,v,length,alongU=true)=>{
   const q=point(p,u,v,0),y=groundHeight(q.x,q.z),halfX=alongU?.055:length/2,halfZ=alongU?length/2:.055;
   world.collisions.push({x:q.x,z:q.z,r:Math.hypot(halfX,halfZ),halfX,halfZ,height:.9,type:'gardenFence',house:p.id});
   for(const h of [.25,.64])timber.push({...q,y:y+h,sx:alongU?length:.075,sy:.055,sz:alongU?.075:length});
  };
  for(let u=-3.35;u<=3.35;u+=.23){if(Math.abs(u)<.68)continue;const q=point(p,u,p.depth/2+3.3,0),y=groundHeight(q.x,q.z);fences.push({...q,y:y+.43,sx:.075,sy:.86,sz:.07});}
  for(const side of [-1,1]){
   for(let v=p.depth/2;v<p.depth/2+3.35;v+=.23){const q=point(p,side*3.35,v,0);fences.push({...q,y:groundHeight(q.x,q.z)+.43,sx:.075,sy:.86,sz:.07});}
   fenceSegment(side*2.015,p.depth/2+3.3,2.67);
   fenceSegment(side*3.35,p.depth/2+1.65,3.3,false);
  }
  // Rear and side windows make the cottages readable from the western approach.
  for(const side of [-1,1]){
   const q=point(p,side*(p.width/2+.025),0,1.64);glass.push({...q,ry:p.rotation+Math.PI/2,sx:.84,sy:1.06,sz:.035});
   for(const h of [-.57,0,.57]){const f=point(p,side*(p.width/2+.065),0,1.64+h);frames.push({...f,ry:p.rotation+Math.PI/2,sx:.96,sy:.045,sz:.075});}
   for(const v of [-.45,0,.45])box(frames,p,side*(p.width/2+.065),v,1.64,.075,1.18,.045);
  }
  for(const side of [-1,1]){box(glass,p,0,side*(p.depth/2+.025),p.height+.7,.56,.76,.025);for(const u of [-.32,.32])box(frames,p,u,side*(p.depth/2+.055),p.height+.7,.045,.84,.07);for(const h of [-.42,.42])box(frames,p,0,side*(p.depth/2+.055),p.height+.7+h,.68,.045,.07);}
  const gardenPlants=['trifolium_pratense','leucanthemum_vulgare','achillea_millefolium'];
  for(const [index,id]of gardenPlants.entries()){
   const s=PLANTS[id];if(!s)continue;const flowers=[];
   for(let n=0;n<28;n++){const u=(index%2?1:-1)*(1.2+(n%4)*.32),v=p.depth/2+.45+Math.floor(n/4)*.3,q=point(p,u,v,0),y=groundHeight(q.x,q.z),height=s.size*(.7+world.random()*.3),ry=world.random()*6.28;
    if(world.onLanding(q.x,q.z)||ponds.some(pond=>pondContains(pond,q.x,q.z,-.3)))continue;
    flowers.push({...q,y:y+height*.48,s:height,ry});world.plants.push({id,x:q.x,z:q.z,y,size:height,habitat:'city',garden:p.id,flowers:world.botanicalFlowers(s,q.x,y,q.z,height,ry)});
   }
   instance(world.group,botanicalGeometry(s),world.material({vertexColors:true,side:THREE.DoubleSide,roughness:.94}),flowers);
  }
  // A garden entrance stays traversable from the boardwalk and lane.
  const a=point(p,0,p.depth/2,0),b=point(p,0,p.depth/2+3.7,0);surfaceStrip(a,b,1.1,world.material({map:world.groundTexture,color:'#b8b1a1',roughness:1}));
 }
 const cg=new THREE.Shape();cg.moveTo(-.5,0);cg.lineTo(.5,0);cg.lineTo(0,1);cg.closePath();
 const gableGeometry=new THREE.ExtrudeGeometry(cg,{depth:1,bevelEnabled:false,steps:1});gableGeometry.translate(0,0,-.5);
 instance(world.group,new THREE.BoxGeometry(1,1,1),wall,walls);instance(world.group,new THREE.BoxGeometry(1,1,1),world.material({color:'#999687',roughness:1}),foundations);
 const roofMesh=instance(world.group,new THREE.BoxGeometry(1,1,1),roof,roofs),gableMesh=instance(world.group,gableGeometry,wall,gables);
 roofMesh.userData.villagePart='roofs';gableMesh.userData.villagePart='gables';
 instance(world.group,new THREE.BoxGeometry(1,1,1),wood,timber);instance(world.group,new THREE.BoxGeometry(1,1,1),world.material({color:'#dfd8c0',roughness:.86}),[...frames,...fences]);
 instance(world.group,new THREE.BoxGeometry(1,1,1),world.material({roughness:.9,color:'#ded4bd'}),doors);
 instance(world.group,new THREE.BoxGeometry(1,1,1),world.material({color:'#5b7172',metalness:.3,roughness:.23}),glass);
 instance(world.group,new THREE.BoxGeometry(1,1,1),world.material({color:'#9e9e8c',metalness:.5,roughness:.55}),metal);
 const streetTexture=asphaltTexture();streetTexture.repeat.set(1,(VILLAGE_STREET.b.z-VILLAGE_STREET.a.z)/2.7);
 const streetMat=world.material({map:streetTexture,color:'#ffffff',roughness:.97,bumpMap:streetTexture,bumpScale:.008});
 surfaceStrip(VILLAGE_STREET.a,VILLAGE_STREET.b,VILLAGE_STREET.width,streetMat,true);
 const {a,b,width}=VILLAGE_STREET;
 // Flat road colliders are walkable for the ranger and permanently impermeable
 // to terrestrial animals. They do not depend on the optional experiment switch.
 world.collisions.push({x:a.x,z:(a.z+b.z)/2,halfX:width/2,halfZ:(b.z-a.z)/2,r:Math.hypot(width/2,(b.z-a.z)/2),height:.06,type:'permanentRoad'});
 for(const side of [-1,1])for(let z=a.z+.4;z<b.z;z+=.8){const x=a.x+side*(width/2+.075);curbs.push({x,z,y:groundHeight(x,z)+.045,sx:.14,sy:.09,sz:.77});}
 instance(world.group,new THREE.BoxGeometry(1,1,1),world.material({color:'#a29f92',roughness:.95}),curbs);
 // Asphalt continues out of the residential plots into a gravel farm access.
 // Its bend, open field gate and vegetated verge give the lane a readable end.
 const gravel=world.material({map:world.groundTexture,color:'#bcb4a0',roughness:1});
 world.village.farmApproach=FARM_APPROACH;world.village.roadEnd='open farm entrance';
 for(let i=0;i<FARM_APPROACH.length-1;i++){
  const from=FARM_APPROACH[i],to=FARM_APPROACH[i+1],length=Math.hypot(to.x-from.x,to.z-from.z);
  surfaceStrip(from,to,2.65-i*.2,gravel);
  world.collisions.push({x:(from.x+to.x)/2,z:(from.z+to.z)/2,halfX:(2.65-i*.2)/2,halfZ:length/2,r:Math.hypot(1.35,length/2),rotation:Math.atan2(to.x-from.x,to.z-from.z),height:.06,type:'permanentRoad'});
 }
 const end=FARM_APPROACH.at(-1),gatePosts=[],gateRails=[];
 for(const side of [-1,1]){
  const x=end.x+side*1.85,z=end.z,y=groundHeight(x,z);
  gatePosts.push({x,z,y:y+.6,sx:.12,sy:1.2,sz:.12});world.collisions.push({x,z,r:.12,height:1.2,type:'fieldGate'});
  for(const h of [.3,.68,1])gateRails.push({x:x+side*.32,z:z-.62,y:y+h,sx:1.4,sy:.075,sz:.065,ry:side*.98});
 }
 instance(world.group,new THREE.BoxGeometry(1,1,1),wood,[...gatePosts,...gateRails]);
 const hiveLot=VILLAGE_LOTS.find(p=>p.col===0&&p.row===1),hive=point(hiveLot,1.65,hiveLot.depth/2+1.6,0),hy=groundHeight(hive.x,hive.z);
 world.hives=[{x:hive.x,z:hive.z,y:hy+.54,habitat:'city',deliveries:0,stock:0,house:hiveLot.id}];
 const hiveParts=[];for(const h of [.16,.4,.64])hiveParts.push({x:hive.x,z:hive.z,y:hy+h,sx:.52,sy:.22,sz:.45});
 hiveParts.push({x:hive.x,z:hive.z,y:hy+.78,sx:.62,sy:.07,sz:.55});
 instance(world.group,new THREE.BoxGeometry(1,1,1),world.material({map:world.deckTexture,color:'#af965e',roughness:.85}),hiveParts);
 instance(world.group,new THREE.BoxGeometry(1,1,1),world.material({color:'#302c24',roughness:1}),[{x:hive.x+.267,z:hive.z,y:hy+.37,sx:.014,sy:.025,sz:.25}]);
 world.collisions.push({x:hive.x,z:hive.z,r:.32,height:.83,type:'hive'});
 createResidentLocations(world,groundHeight);
 // The simulation stores collider heights relative to its analytical terrain.
 // Visible construction follows rendered terrain; compensate that difference.
 for(const b of world.collisions.slice(collisionStart))b.baseY=(b.baseY||0)+groundHeight(b.x,b.z)-analyticalGround(b.x,b.z);
 function surfaceStrip(a,b,width,material,isStreet=false){const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),g=new THREE.PlaneGeometry(width,len,1,Math.ceil(len/.8));g.rotateX(-Math.PI/2);const ry=Math.atan2(dx,dz);g.rotateY(ry);g.translate((a.x+b.x)/2,0,(a.z+b.z)/2);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,groundHeight(p.getX(i),p.getZ(i))+.022);g.computeVertexNormals();const mesh=new THREE.Mesh(g,material);mesh.receiveShadow=true;world.group.add(mesh);if(isStreet){mesh.userData.villagePart='street';world.village.streets.push({a,b,width,mesh,permanent:true});}}
}

// A small deterministic mineral-grain texture replaces the untextured road strip.
// The repeating aggregate is deliberately subtle; it uses no external assets.
export function asphaltTexture(){
 const n=256,data=new Uint8Array(n*n*4);let seed=2917;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  seed=(seed*1664525+1013904223)>>>0;const grain=(seed>>>24)/255,patch=3*Math.sin(x*.071)*Math.cos(y*.055),speck=grain>.94?14:grain<.09?-10:0;
  const v=58+(grain-.5)*13+patch+speck,i=(y*n+x)*4;data[i]=v;data[i+1]=v+2;data[i+2]=v+1;data[i+3]=255;
 }
 const t=new THREE.DataTexture(data,n,n,THREE.RGBAFormat);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=4;t.needsUpdate=true;return t;
}
