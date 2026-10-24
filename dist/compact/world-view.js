import * as THREE from '../vendor/three.module.js?revision=120';
import { GeometryBatch,stick,leafGeometry,plantGeometry } from './geometry.js';
import { BOUNDS,BUILDINGS,SIGNS,terrainHeight,nearestPath } from './layout.js';
import { pathPanels,deckGeometry } from './path-mesh.js';
import { MANIFEST } from './manifest.js';
import { randomGenerator } from './world-state.js';
import { createVegetationView } from './vegetation-view.js';
import { createVillageView } from './village-view.js';
import { forestHabitatAt } from './habitats.js';
import { spatialRenderGroup,pinTerrainContacts } from './render-groups.js';
export async function createWorldView(scene,state){
 const loader=new THREE.TextureLoader();const [terrainTexture,skyTexture,woodTexture]=await Promise.all([MANIFEST.assets.terrain,MANIFEST.assets.sky,MANIFEST.assets.wood].map(url=>loader.loadAsync(url)));for(const t of [terrainTexture,skyTexture,woodTexture])t.colorSpace=THREE.SRGBColorSpace;terrainTexture.anisotropy=4;woodTexture.anisotropy=4;woodTexture.wrapS=woodTexture.wrapT=THREE.RepeatWrapping;skyTexture.mapping=THREE.EquirectangularReflectionMapping;scene.background=skyTexture;scene.backgroundIntensity=.8;
 const structured=state.modelRevision>=4,refined=state.modelRevision>=5,closing=state.modelRevision>=7,foliageMeshes=[];
 const random=randomGenerator(state.initialSeed+10),sphere=new THREE.SphereGeometry(1,10,6),box=new THREE.BoxGeometry(1,1,1),bark=new GeometryBatch(),architecture=new GeometryBatch();
 // Opaque vertex-coloured terrain avoids transparent full-ground grass cards.
 const ground=new THREE.PlaneGeometry(220,150,220,150);ground.rotateX(-Math.PI/2);const p=ground.attributes.position,colors=[];
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=terrainHeight(x,z),noise=.94+.06*Math.sin(x*1.1+Math.cos(z*.9));p.setY(i,y);const habitat=forestHabitatAt(x,z);const col=new THREE.Color(x<-24?(habitat.light<.3?(structured?'#717953':'#777c59'):(structured?'#929773':'#969873')):x<0?'#6d8050':x<18?'#657d44':x<34?'#7b8d58':x<52?'#7e8d60':'#8c8980');col.multiplyScalar(noise);colors.push(col.r,col.g,col.b);}
 ground.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));if(closing)pinTerrainContacts(ground,state.ecology.actors.filter(a=>a.x>52&&(['mytilus_edulis','crangon_crangon'].includes(a.taxon)||['small-juveniles','small-worms'].includes(a.resourceClass))),terrainHeight);ground.computeVertexNormals();const groundMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});groundMaterial.onBeforeCompile=shader=>{shader.uniforms.terrainAtlas={value:terrainTexture};shader.vertexShader='varying vec3 terrainPoint;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nterrainPoint = position;');shader.fragmentShader='uniform sampler2D terrainAtlas;varying vec3 terrainPoint;\n'+shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nvec2 tile=terrainPoint.x < -24.0 ? vec2(0.0,0.5) : terrainPoint.x > 52.0 ? vec2(0.0,0.0) : vec2(0.5,0.0);vec2 atlasUV=(fract(terrainPoint.xz*.3)*.97+.015)*.5+tile;vec3 tex=texture2D(terrainAtlas,atlasUV).rgb;float soilZone=step(52.0,terrainPoint.x)+(1.0-step(-24.0,terrainPoint.x));float soilAmount=mix(.24,.87,clamp(soilZone,0.0,1.0));diffuseColor.rgb *= mix(vec3(1.0),tex,soilAmount);');};const mesh=new THREE.Mesh(ground,groundMaterial);mesh.receiveShadow=true;scene.add(mesh);
 const water=new THREE.Mesh(new THREE.PlaneGeometry(200,190),new THREE.MeshStandardMaterial({color:'#688d94',roughness:.42,metalness:.08,transparent:true,opacity:.43,depthWrite:false}));water.rotation.x=-Math.PI/2;water.position.set(118,-.73,0);scene.add(water);
 const leaves=[],crowns=new GeometryBatch(),crownShape=new THREE.IcosahedronGeometry(1,1);
 if(!structured){
 for(const t of state.trees){const y=terrainHeight(t.x,t.z);stick(bark,[t.x,y,t.z],[t.x+.12,y+t.h*.72,t.z],t.r,t.type==='beech'?'#898579':'#66634e',t.r*.45);
  for(let k=0;k<7;k++){const a=k*2.399,h=t.h*(.42+(k%3)*.12),len=t.crownRadius?t.crownRadius*(.55+(k%4)*.12):1.7+(k%4)*.48,end=[t.x+Math.cos(a)*len,y+h+1.5,t.z+Math.sin(a)*len];stick(bark,[t.x,y+h,t.z],end,t.r*.31,'#777768',.025);
   for(let j=0;j<46;j++){const theta=random()*6.283,r=Math.sqrt(random())*(t.crownRadius? t.crownRadius*.52:1.9);leaves.push({x:end[0]+Math.cos(theta)*r,y:end[1]+(random()-.4)*1.6,z:end[2]+Math.sin(theta)*r,a:random()*6.283,s:.14+random()*.12,oak:t.type==='oak'});}
  }
  const cr=t.crownRadius||3,aspect=t.crownAspect||[1,1,1];for(let j=0;j<3;j++)crowns.add(crownShape,t.type==='oak'?(j%2?'#5d7546':'#667d48'):(j%2?'#657d50':'#758952'),[t.x+Math.cos(j*2.4)*cr*.43,y+t.h*(t.type==='oak'?.69:.77)+(j%2)*.6,t.z+Math.sin(j*2.4)*cr*.4],[cr*.70*aspect[0],cr*.67*aspect[1],cr*.69*aspect[2]]);
  // Root flare visibly joins the forest floor; collision uses the independent trunk radius.
  for(let i=0;i<4;i++){const a=i*1.57;stick(bark,[t.x,y+.24,t.z],[t.x+Math.cos(a)*.6,y+.01,t.z+Math.sin(a)*.6],t.r*.37,'#777568',.015);}
 }
 }else{
  // Shared irregular low-poly crown forms; mature beech has layered spreading
  // branches, oak broader low forks, saplings a narrow continuous lower crown.
  const forms=[0,1,2].map(phase=>{const g=crownShape.clone(),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=1+.16*Math.sin(x*4+z*3+phase)*Math.cos(y*3-phase);p.setXYZ(i,x*r,y*(.9+.12*Math.sin(z*5+phase)),z*r);}g.computeVertexNormals();return g;});
  for(const [index,t]of state.trees.entries()){
   const y=terrainHeight(t.x,t.z),oak=t.type==='oak',young=t.ageClass==='young',old=t.ageClass==='old',cr=t.crownRadius||3,aspect=t.crownAspect||[1,1,1],phase=random()*Math.PI*2;
   const trunkColor=closing&&index>=3?(oak?(old?'#575342':'#706b56'):(young?'#777e69':old?'#6e7066':'#969587')):oak?'#655f4c':'#858477',fork=t.h*(young?.58:oak?.42:.53),bend=old?.38:young?.1:.22;
   // The three diagnostic support trees retain the exact original trunk shape
   // and first-branch endpoints used by the bird and leaf observation models.
   if(index<3){
    stick(bark,[t.x,y,t.z],[t.x+.12,y+t.h*.72,t.z],t.r,trunkColor,t.r*.45);
    for(let k=0;k<7;k++){const a=k*2.399,h=t.h*(.42+(k%3)*.12),len=1.7+(k%4)*.48;stick(bark,[t.x,y+h,t.z],[t.x+Math.cos(a)*len,y+h+1.5,t.z+Math.sin(a)*len],t.r*.31,'#777768',.025);}
   }else if(refined){
    // Roots and the full human-height collision cylinder remain fixed. Above
    // it, each existing stem changes direction towards its own uneven crown.
    const dx=Math.cos(phase)*bend*2.6,dz=Math.sin(phase)*bend*2.6,base=[t.x,y+Math.min(closing?2.05+1.1*Math.sin(phase)**2:2.3,fork*.65),t.z],elbow=[t.x+dx*.4,y+fork,t.z+dz*.6],top=[t.x+dx,y+t.h*.86,t.z+dz];
    stick(bark,[t.x,y,t.z],base,t.r,trunkColor,t.r*.84);stick(bark,base,elbow,t.r*.84,trunkColor,t.r*.59);stick(bark,elbow,top,t.r*.59,trunkColor,.035);
   }else{
    stick(bark,[t.x,y,t.z],[t.x+bend,y+fork,t.z],t.r,trunkColor,t.r*.68);
    stick(bark,[t.x+bend,y+fork,t.z],[t.x+bend*.5,y+t.h*.86,t.z+.3],t.r*.68,trunkColor,.055);
   }
   const branches=young?4:5;
   for(let k=0;k<branches;k++){
    const a=phase+k*2.399,h=t.h*(refined?(young?.31+k*.16:.46+k*.09+.09*Math.sin(phase+k*1.7)):(young?.47+(k%3)*.14:.59+(k%3)*.10)),reach=cr*(refined?(young?.27+.08*k:.40+.20*Math.sin(phase+k)**2):(young?.34:.62+(k%2)*.12)),end=[t.x+Math.cos(a)*reach,y+h,t.z+Math.sin(a)*reach];
    if(index>=3){const join=[t.x+bend,y+fork*(.85+(k%2)*.15),t.z],elbow=[t.x+Math.cos(a)*reach*.54,y+h-.4,t.z+Math.sin(a)*reach*.54];stick(bark,join,elbow,t.r*(old?.44:.32),trunkColor,.05);stick(bark,elbow,end,.05,trunkColor,.016);}
    const scale=refined?[cr*(young?.54:.49+.15*Math.sin(phase+k)**2)*aspect[0],cr*(young?.75:.57+.15*Math.cos(phase+k)**2),cr*(young?.52:.50+.16*Math.cos(phase-k)**2)*aspect[2]]:young?[cr*.57*aspect[0],cr*.83*aspect[1],cr*.58*aspect[2]]:[cr*(.58+(k%2)*.07)*aspect[0],cr*(.31+(k%3)*.055)*aspect[1],cr*.62*aspect[2]];
    if(closing){scale[0]*=old?1.14:young?.84:1;scale[1]*=old?.82:young?1.13:1;scale[2]*=old?.94:young?.86:1;}
    crowns.add(forms[k%3],oak?(k%2?'#5a7042':'#6e7e4a'):(k%2?'#677d4b':'#7b8c57'),end,scale,[.06*(k-2),a,.1*(k%2)]);
    for(let j=0;j<24;j++){const theta=random()*Math.PI*2,r=Math.sqrt(random())*cr*.57;leaves.push({x:end[0]+Math.cos(theta)*r,y:end[1]+(random()-.5)*cr*.7,z:end[2]+Math.sin(theta)*r,a:random()*Math.PI*2,s:.14+random()*.12,oak});}
   }
   for(let k=0;k<(old?6:4);k++){const a=phase+k*Math.PI*2/(old?6:4),length=t.r*(old?2.8:2.1);stick(bark,[t.x,y+.3,t.z],[t.x+Math.cos(a)*length,y+.01,t.z+Math.sin(a)*length],t.r*.35,trunkColor,.018);}
   if(old)for(let k=0;k<3;k++){const a=phase+k*2.1;stick(bark,[t.x+Math.cos(a)*t.r*.78,y+.1,t.z+Math.sin(a)*t.r*.78],[t.x+Math.cos(a)*t.r*.75,y+fork*.7,t.z+Math.sin(a)*t.r*.75],.027,oak?'#4b493b':'#666a60',.012);}
  }
  for(const g of forms)g.dispose();
 }
 const barkMesh=bark.mesh();scene.add(barkMesh);const crownMesh=crowns.mesh();crownMesh.castShadow=true;scene.add(crownMesh);
 // Distant woodland is an opaque scenic stand, never a counted population.
 // Coarse crowns here avoid rendering thousands of diagnostic leaves off-world.
 const background=new GeometryBatch(),crown=new THREE.IcosahedronGeometry(1,1);
 const backdrop=[];for(let row=0;row<3;row++)for(let i=0;i<31;i++){
  const dx=random()*2,dz=(random()-.5)*2;
  if(closing&&Math.sin(i*.73+row*1.7)>.78)continue;
  backdrop.push({x:-83-row*7-dx+(closing?Math.sin(i*1.13+row)*3.4:0),z:-53+i*3.6+dz+(closing?Math.cos(i*1.91+row)*3.1:0)});
 }
 for(const side of [-1,1])for(let i=0;i<20;i++){const z=side*(53+random()*7);if(closing&&Math.sin(i*.83+side)>.6)continue;backdrop.push({x:-106+i*4.1+(closing?Math.sin(i*2.7+side)*2.2:0),z});}
 const shrubSites=closing?state.trees.filter((t,i)=>i>=3&&nearestPath(t.x,t.z).distance>3.2&&!(t.x>-76&&t.x<-54&&Math.abs(t.z-2)<5)&&Math.hypot(t.x+62,t.z+2.25)>4&&!state.supports.some(p=>Math.hypot(p.x-t.x,p.z-t.z)<4)&&!state.plants.some(p=>Math.hypot(p.x-t.x,p.z-t.z)<2.2)):[];let shrubSite=0;
 for(const t of backdrop){const y=terrainHeight(t.x,t.z),h=7+random()*8;stick(background,[t.x,y,t.z],[t.x,y+h*.7,t.z],structured?.18+random()*.26:.19,'#777568',.08);if(structured&&random()<.44){const rawHeight=1.1+random()*2.4,understoryHeight=closing?Math.min(2,rawHeight):rawHeight,site=closing&&shrubSites.length?shrubSites[shrubSite++%shrubSites.length]:t,sy=terrainHeight(site.x,site.z),sz=site.z;const sx=site.x+(random()-.5)*1.5,rawX=1.4+random()*1.6,rawZ=1.6+random()*.9,rx=closing?Math.min(1.25,rawX):rawX,rz=closing?Math.min(1.1,rawZ):rawZ;
 if(refined){for(let k=0;k<(closing?4:3);k++){const a=k*2.399+sx*.31,spread=rx*(closing?.56:.4),ex=sx+Math.cos(a)*spread,ez=sz+Math.sin(a)*spread,ey=sy+understoryHeight*(closing?.2+k*.13:.33+k*.17);stick(background,[sx,sy,sz],[ex,ey,ez],.035,'#756f56',.008);background.add(crown,k%2?'#667747':'#54683f',[ex,ey,ez],[rx*(closing?.62:.5+k*.07),understoryHeight*(closing?.28+.07*(k%2):.38+k*.05),rz*(closing?.47:.55)],[.13*k,a,.1]);}}
 else background.add(crown,'#5b6c48',[sx,sy+understoryHeight*.48,sz],[rx,understoryHeight*.55,rz]);}for(let k=0;k<4;k++)background.add(crown,k%2?'#526347':'#65734f',[t.x+(random()-.5)*2,y+h-1.5+random()*2,t.z+(random()-.5)*2],[1.6+random()*(structured?2.3:1),structured?1.4+random()*1.2:2+random()*1.8,1.5+random()*(structured?2.3:1)]);}
 const scenic=background.mesh();scenic.castShadow=false;scene.add(scenic);
 // Broad crown masses use small opaque leaf clusters, detail leaves retain shape.
 const dummy=new THREE.Object3D();
 for(const oak of [false,true]){const rows=leaves.filter(l=>l.oak===oak),foliage=new THREE.InstancedMesh(leafGeometry(1,oak?.65:.5,false,oak,oak?10:5),new THREE.MeshStandardMaterial({color:'#7e9358',side:THREE.DoubleSide,roughness:.9}),rows.length);
  for(let i=0;i<rows.length;i++){const l=rows[i];dummy.position.set(l.x,l.y,l.z);dummy.scale.setScalar(l.s*3);dummy.rotation.set((random()-.5)*2,l.a,random()*.6);dummy.updateMatrix();foliage.setMatrixAt(i,dummy.matrix);foliage.setColorAt(i,new THREE.Color().setHSL(.20+random()*.035,.23+random()*.15,.22+random()*.13));}foliage.castShadow=false;foliage.receiveShadow=true;scene.add(foliage);foliageMeshes.push(foliage);
 }
 const vegetation=createVegetationView(scene,state.plants),plantMeshes=vegetation.meshes;
 const litter=[];for(let i=0;i<12000;i++){const x=-79+random()*54,z=-48+random()*96;if(nearestPath(x,z).distance<1.1)continue;litter.push({x,z,a:random()*6.28,s:.045+random()*.08});}
 const floor=new THREE.InstancedMesh(leafGeometry(1,.65,false,false,3),new THREE.MeshStandardMaterial({color:'#8a7049',side:THREE.DoubleSide,roughness:1}),litter.length);for(let i=0;i<litter.length;i++){const l=litter[i];dummy.position.set(l.x,terrainHeight(l.x,l.z)+.012,l.z);dummy.rotation.set(.08,l.a,0);dummy.scale.setScalar(l.s);dummy.updateMatrix();floor.setMatrixAt(i,dummy.matrix);floor.setColorAt(i,new THREE.Color().setHSL(.09+random()*.035,.24,.19+random()*.15));}floor.receiveShadow=true;scene.add(floor);
 const deckPanels=pathPanels(),deck=deckGeometry(deckPanels);const path=new THREE.Mesh(deck,new THREE.MeshStandardMaterial({vertexColors:true,map:woodTexture,roughness:.98,side:THREE.DoubleSide}));path.receiveShadow=true;scene.add(path);
 // Posts stand beside the walking surface, never across it.
 for(let i=0;i<deckPanels.length;i+=10){const panel=deckPanels[i];for(const v of panel.polygon.slice(0,2)){stick(architecture,[v[0],terrainHeight(v[0],v[2]),v[2]],[v[0],v[1]-.03,v[2]],.055,'#75694d',.055);}}
 for(const b of BUILDINGS){const y=terrainHeight(b.x,b.z);architecture.add(box,'#d1c9a9',[b.x,y+b.h/2,b.z],[b.w,b.h,b.d]);
  const roof=new THREE.BufferGeometry(),x=b.w*.57,z=b.d*.6,h=b.h*.45;roof.setAttribute('position',new THREE.Float32BufferAttribute([-x,0,-z,x,0,-z,0,h,-z,-x,0,z,0,h,z,x,0,z,-x,0,-z,0,h,-z,0,h,z,-x,0,-z,0,h,z,-x,0,z,x,0,-z,x,0,z,0,h,z,x,0,-z,0,h,z,0,h,-z],3));roof.setIndex(Array.from({length:roof.attributes.position.count/3},(_,i)=>[i*3,i*3+2,i*3+1]).flat());roof.computeVertexNormals();architecture.add(roof,'#8a5640',[b.x,y+b.h,b.z]);
  for(const side of [-1,1]){architecture.add(box,'#e2dcc4',[b.x,y+1.8,b.z+side*(b.d/2+.03)],[b.w-.3,.07,.08]);for(const dx of [-b.w*.28,b.w*.28]){architecture.add(box,'#f1e7c9',[b.x+dx,y+1.8,b.z+side*(b.d/2+.045)],[1.1,1.2,.06]);architecture.add(box,'#50666a',[b.x+dx,y+1.8,b.z+side*(b.d/2+.085)],[.85,.92,.04]);}}
  architecture.add(box,'#5b6654',[b.x,y+1,b.z-b.d/2-.07],[.94,2,.09]);architecture.add(box,'#6f6858',[b.x+b.w*.25,y+b.h+.5,b.z],[.5,1.4,.55]);
 }
 // Fallen beech/log, with intact substrate; not a mycorrhiza demonstration.
 stick(architecture,[-61,.5,-2],[-65,.52,-3],.27,'#77715d',.23);
 if(structured){
  const start=new THREE.Vector3(-61,.5,-2),end=new THREE.Vector3(-65,.52,-3),axis=end.clone().sub(start).normalize(),side=new THREE.Vector3(-axis.z,0,axis.x),up=new THREE.Vector3().crossVectors(axis,side).normalize();
  for(let i=0;i<11;i++){const a=i*Math.PI*2/11,offset=side.clone().multiplyScalar(Math.cos(a)).addScaledVector(up,Math.sin(a));const p=start.clone().addScaledVector(axis,.13+random()*.3).addScaledVector(offset,.258),q=end.clone().addScaledVector(axis,-.12-random()*.3).addScaledVector(offset,.222);stick(architecture,p.toArray(),q.toArray(),.014,i%3?'#676653':'#8e8971',.01);}
  for(const [point,radius,direction]of [[start.clone().addScaledVector(axis,-.008),.24,-1],[end.clone().addScaledVector(axis,.008),.205,1]]){const orientation=new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),axis.clone().multiplyScalar(direction))).toArray().slice(0,3);architecture.add(new THREE.CircleGeometry(radius,14),'#b49a70',point.toArray(),[1,1,1],orientation);for(const r of [.38,.66,.87])architecture.add(new THREE.RingGeometry(radius*r-.007,radius*r,18),'#8d7959',point.clone().addScaledVector(axis,.001*direction).toArray(),[1,1,1],orientation);}
  stick(architecture,[-64,.65,-2.75],[-64.2,1.08,-2.1],.075,'#68624e',.025);
  stick(architecture,[-61.8,.65,-2.05],[-61.35,.94,-2.6],.065,'#79725a',.025);
 }

 for(const [a,b]of [[[-64,-4],[-67,-6]],[[-59,-1],[-61,0]],[[-65,-1],[-67,1]],[[-60,-5],[-58,-6]]])stick(architecture,[a[0],terrainHeight(...a)+.08,a[1]],[b[0],terrainHeight(...b)+.10,b[1]],.07,'#635d48',.025);
 const architectureMesh=architecture.mesh();scene.add(architectureMesh);const village=createVillageView(scene);const signMeshes=[];
 for(const sign of SIGNS){const y=terrainHeight(sign.x,sign.z),batch=new GeometryBatch();stick(batch,[sign.x,y,sign.z],[sign.x,y+1.7,sign.z],.065,'#796548',.065);scene.add(batch.mesh());const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;const c=canvas.getContext('2d');c.fillStyle='#715f43';c.fillRect(0,0,512,160);c.strokeStyle='#ae9870';c.lineWidth=10;c.strokeRect(8,8,496,144);c.fillStyle='#fff2d2';c.textAlign='center';c.font='38px Georgia';c.fillText(sign.name,256,93);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const board=new THREE.Mesh(new THREE.BoxGeometry(1.8,.56,.08),new THREE.MeshStandardMaterial({map:texture,roughness:1}));board.position.set(sign.x,y+1.6,sign.z);scene.add(board);signMeshes.push(board);}
 // Horizon and background forest are scenery only; no extra simulation instances.
 const partition=object=>{if(!closing)return [object];const group=spatialRenderGroup(object);scene.remove(object);scene.add(group);return group.children;};
 const occlusionMeshes=[mesh,barkMesh,crownMesh,architectureMesh,village.mesh,path,...signMeshes].flatMap(partition);
 if(closing)for(const object of [scenic,floor,...foliageMeshes])partition(object);
 return {deck,plantMeshes,updateVegetation:vegetation.update,water,occlusionMeshes,blocks:[...village.blocks,...state.trees.map(t=>({x:t.x,z:t.z,r:t.r})),...SIGNS.map(s=>({x:s.x,z:s.z,halfX:.9,halfZ:.04})),...Array.from({length:5},(_,i)=>({x:-61-i,z:-2-i*.25,r:.27}))],dispose(){vegetation.dispose();}};
}
