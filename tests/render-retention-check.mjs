import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {prepareStaticInstances,cullStaticInstances} from '../dist/render-visibility.js';

const scene=new T.Scene(),geometry=new T.BoxGeometry(.8,2,.7),material=new T.MeshStandardMaterial(),placements=[];
for(let z=-8;z<=8;z++)for(let x=-8;x<=8;x++)placements.push({x:x*5,z:z*5,y:(x+z)%3*.1,s:.8+((x*x+z*z)%5)*.13});
const mesh=new T.InstancedMesh(geometry,material,placements.length),dummy=new T.Object3D();
for(let i=0;i<placements.length;i++){const p=placements[i];dummy.position.set(p.x,p.y,p.z);dummy.rotation.y=i*.137;dummy.scale.setScalar(p.s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.setColorAt(i,new T.Color().setHSL((i*.139)%1,.3,.5));}
mesh.castShadow=true;scene.add(mesh);prepareStaticInstances(mesh,placements);
const data=mesh.userData.fieldInstances;data.lod=new T.InstancedMesh(geometry,material,placements.length);data.modelHeight=2;scene.add(data.lod);
const camera=new T.PerspectiveCamera(62,1.4,.1,80),frustum=new T.Frustum(),matrix=new T.Matrix4(),sphere=new T.Sphere(),observer=new T.Vector3(),projection={fov:62,height:520};
let checks=0,uploadedBytes=0,unretainedBytes=0;
function reference(overview){
 const rows={full:[],lod:[],shadowMesh:[],shadowLod:[]},focal=projection.height/(2*Math.tan(projection.fov*Math.PI/360));
 for(const tile of data.tiles)for(const i of tile.indices){sphere.center.fromArray(data.bounds,i*4);sphere.radius=data.bounds[i*4+3];const distance=sphere.center.distanceTo(observer),visible=frustum.intersectsSphere(sphere),shadow=!overview&&distance<48+sphere.radius;if(!visible&&!shadow)continue;
  const scale=Math.hypot(...data.source.subarray(i*16+4,i*16+7)),small=2*scale*focal/Math.max(.1,distance)<24;
  rows[visible?small?'lod':'full':small?'shadowLod':'shadowMesh'].push(i);
 }return rows;
}
function run(overview=false){
 const expected=reference(overview),objects={full:mesh,lod:data.lod,shadowMesh:data.shadowMesh,shadowLod:data.shadowLod},versions=Object.fromEntries(Object.entries(objects).map(([k,m])=>[k,m?.instanceMatrix.version||0]));
 cullStaticInstances(mesh,frustum,observer,overview,projection);
 for(const [key,indices]of Object.entries(expected)){const object=key==='full'?mesh:key==='lod'?data.lod:data[key];if(!object){assert.equal(indices.length,0);continue;}assert.equal(object.count,indices.length,key);assert.equal(object.visible,indices.length>0,key);
  for(let n=0;n<indices.length;n++){assert.deepEqual([...object.instanceMatrix.array.subarray(n*16,n*16+16)],[...data.source.subarray(indices[n]*16,indices[n]*16+16)],key+' stale transform');if(key==='full')assert.deepEqual([...object.instanceColor.array.subarray(n*3,n*3+3)],[...data.colors.subarray(indices[n]*3,indices[n]*3+3)],'stale species colour');}
  unretainedBytes+=indices.length*64;if(object.instanceMatrix.version!==versions[key])uploadedBytes+=indices.length*64;
 }checks++;
}
for(let step=0;step<36;step++){
 observer.set(Math.sin(step*.29)*35,2+step%3,Math.cos(step*.29)*35);camera.position.copy(observer);camera.lookAt(Math.cos(step*.37)*30,1,Math.sin(step*.37)*30);camera.fov=step%4===0?25:62;projection.fov=camera.fov;camera.updateProjectionMatrix();camera.updateMatrixWorld();matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(matrix);
 run(step%5===0);const before=data.uploads,versions=[mesh.instanceMatrix.version,mesh.instanceColor.version,data.lod.instanceMatrix.version,data.shadowMesh?.instanceMatrix.version,data.shadowLod?.instanceMatrix.version];
 for(let frame=0;frame<4;frame++)run(step%5===0);
 assert.equal(data.uploads,before,'Stationary view retransmits vegetation');assert.deepEqual([mesh.instanceMatrix.version,mesh.instanceColor.version,data.lod.instanceMatrix.version,data.shadowMesh?.instanceMatrix.version,data.shadowLod?.instanceMatrix.version],versions);
 // All hidden, then identical view restored: retained capacity must still be correct.
 const original=frustum.intersectsSphere;frustum.intersectsSphere=()=>false;run(true);frustum.intersectsSphere=original;run(step%5===0);
}
assert.ok(uploadedBytes<unretainedBytes*.3);
console.log(JSON.stringify({checks,exactTransformsColoursAndCounts:true,stationaryUploads:0,uploadedBytes,fullRebuildBytes:unretainedBytes,uploadReductionPercent:Number((100*(1-uploadedBytes/unretainedBytes)).toFixed(1)),scope:'Deterministic culling regression, not a device FPS benchmark'},null,2));
