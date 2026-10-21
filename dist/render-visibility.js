import * as THREE from './vendor/three.module.js?revision=120';

// Rendering is a projection of the world. No simulation record is moved or removed here.
export function prepareStaticInstances(mesh, placements) {
 if(!mesh.geometry.boundingSphere)mesh.geometry.computeBoundingSphere();
 const source=mesh.instanceMatrix.array.slice(),colors=mesh.instanceColor?.array.slice(),bounds=new Float32Array(placements.length*4),tiles=new Map(),center=new THREE.Vector3(),matrix=new THREE.Matrix4(),sphere=new THREE.Sphere();
 placements.forEach((p,i)=>{
  matrix.fromArray(source,i*16);center.copy(mesh.geometry.boundingSphere.center).applyMatrix4(matrix);
  const radius=mesh.geometry.boundingSphere.radius*Math.max(Math.abs(p.sx||p.s||1),Math.abs(p.sy||p.s||1),Math.abs(p.sz||p.s||1))+.08;
  bounds.set([center.x,center.y,center.z,radius],i*4);
  const key=`${Math.floor(p.x/16)}:${Math.floor(p.z/16)}`;let tile=tiles.get(key);
  if(!tile){tile={box:new THREE.Box3(),indices:[]};tiles.set(key,tile);}
  tile.indices.push(i);sphere.set(center,radius);tile.box.union(sphere.getBoundingBox(new THREE.Box3()));
 });
 mesh.userData.fieldInstances={source,colors,bounds,tiles:[...tiles.values()],total:placements.length};mesh.frustumCulled=false;
 mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);if(mesh.instanceColor)mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
 return mesh;
}

function shadowCompanion(mesh,data,impostor=false){
 const key=impostor?'shadowLod':'shadowMesh';if(data[key])return data[key];const source=impostor?data.lod:mesh;
 const companion=new THREE.InstancedMesh(source.geometry,source.material,data.total);companion.castShadow=true;companion.receiveShadow=false;companion.frustumCulled=false;companion.layers.set(1);companion.customDepthMaterial=source.customDepthMaterial;companion.count=0;companion.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.parent?.add(companion);data[key]=companion;return companion;
}

// Upload the occupied prefix only; retained capacity is not a reason to resend unused slots.
export function uploadInstances(attribute,count,stride=16){
 if(!count)return;attribute.clearUpdateRanges();attribute.addUpdateRange(0,count*stride);attribute.needsUpdate=true;
}
function copyMatrix(source,index,target,out){for(let k=0;k<16;k++)target[out+k]=source[index+k];}

// An unchanged visible prefix already has exactly the right data on the GPU.
// Compare source identities, not rounded camera positions: even a small camera
// movement must retain the same visibility and LOD decisions as a full rebuild.
function retainedSelection(data,key){
 if(!data.selections)data.selections={};
 return data.selections[key]||(data.selections[key]=new Int32Array(data.total).fill(-1));
}

export function cullStaticInstances(mesh, frustum, observer, overview=false,projection={fov:62,height:1000}) {
 const data=mesh.userData.fieldInstances;if(!data)return;
 const array=mesh.instanceMatrix.array,color=mesh.instanceColor?.array,sphere=data.cullSphere||(data.cullSphere=new THREE.Sphere());let count=0,lodCount=0,shadowCount=0,shadowLodCount=0;const lod=data.lod,focal=projection.height/(2*Math.tan(projection.fov*Math.PI/360));
 const fullIds=retainedSelection(data,'full'),lodIds=lod?retainedSelection(data,'lod'):null;let fullChanged=false,lodChanged=false,shadowChanged=false,shadowLodChanged=false;
 const shadowRadius=mesh.castShadow&&!overview?48:0;
 for(const tile of data.tiles){
  const shadowTile=shadowRadius&&tile.box.distanceToPoint(observer)<shadowRadius;
  if(!frustum.intersectsBox(tile.box)&&!shadowTile)continue;
  for(const i of tile.indices){const n=i*4;sphere.center.set(data.bounds[n],data.bounds[n+1],data.bounds[n+2]);sphere.radius=data.bounds[n+3];
   const shadow=shadowRadius&&sphere.center.distanceTo(observer)<shadowRadius+sphere.radius,inView=frustum.intersectsSphere(sphere);
   if(!shadow&&!inView)continue;
   const scale=Math.hypot(data.source[i*16+4],data.source[i*16+5],data.source[i*16+6]),distance=Math.max(.1,sphere.center.distanceTo(observer)),small=lod&&data.modelHeight*scale*focal/distance<(mesh.geometry.userData.flowering?12:24);
   if(!inView){const companion=shadowCompanion(mesh,data,small),index=small?shadowLodCount++:shadowCount++,ids=retainedSelection(data,small?'shadowLod':'shadowMesh');if(ids[index]!==i){ids[index]=i;copyMatrix(data.source,i*16,companion.instanceMatrix.array,index*16);if(small)shadowLodChanged=true;else shadowChanged=true;}continue;}
   if(small){if(lodIds[lodCount]!==i){lodIds[lodCount]=i;copyMatrix(data.source,i*16,lod.instanceMatrix.array,lodCount*16);lodChanged=true;}lodCount++;continue;}
   if(fullIds[count]!==i){fullIds[count]=i;copyMatrix(data.source,i*16,array,count*16);if(color)for(let k=0;k<3;k++)color[count*3+k]=data.colors[i*3+k];fullChanged=true;}count++;
  }
 }
 let uploads=0;
 for(const [key,n,changed]of [['shadowMesh',shadowCount,shadowChanged],['shadowLod',shadowLodCount,shadowLodChanged]])if(data[key]){data[key].count=n;data[key].visible=n>0;if(changed){uploadInstances(data[key].instanceMatrix,n);uploads++;}}
 if(lod){lod.count=lodCount;lod.visible=lodCount>0;if(lodChanged){uploadInstances(lod.instanceMatrix,lodCount);uploads++;}}
 mesh.count=count;mesh.visible=count>0;if(fullChanged){uploadInstances(mesh.instanceMatrix,count);if(color)uploadInstances(mesh.instanceColor,count,3);uploads++;}
 data.uploads=(data.uploads||0)+uploads;data.reusedFrames=(data.reusedFrames||0)+(uploads===0?1:0);
}

export class ViewVolume {
 constructor(){this.camera=new THREE.PerspectiveCamera();this.frustum=new THREE.Frustum();this.matrix=new THREE.Matrix4();}
 update(camera,margin=Math.min(6,Math.max(2,camera.fov*.06))){camera.updateMatrixWorld();this.camera.copy(camera);this.camera.fov=Math.min(110,camera.fov+margin);this.camera.aspect=camera.aspect*1.025;this.camera.updateProjectionMatrix();this.matrix.multiplyMatrices(this.camera.projectionMatrix,camera.matrixWorldInverse);this.frustum.setFromProjectionMatrix(this.matrix);return this.frustum;}
}
