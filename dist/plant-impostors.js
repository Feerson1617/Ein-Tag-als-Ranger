import * as THREE from './vendor/three.module.js?revision=120';

// Eight photographs of the exact botanical model. Full geometry is retained whenever its
// projected size is large enough to reveal more than the photographed silhouette.
export function preparePlantImpostors(world,renderer){
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(),sun=new THREE.DirectionalLight('#f3ead2',2.4),hemi=new THREE.HemisphereLight('#d3dfd8','#555a39',2.2);
 sun.position.set(-35,65,30);scene.add(sun,hemi);const previousTarget=renderer.getRenderTarget(),previousClear=renderer.getClearColor(new THREE.Color()),previousAlpha=renderer.getClearAlpha(),viewport=renderer.getViewport(new THREE.Vector4()),scissor=renderer.getScissor(new THREE.Vector4()),scissorTest=renderer.getScissorTest(),cache=new Map();
 renderer.setClearColor(0,0);
 for(const mesh of world.staticBatches){if(!mesh.geometry.userData.botanicalSpecies)continue;
  let result=cache.get(mesh.geometry.userData.botanicalSpecies);
  if(!result){
   mesh.geometry.computeBoundingBox();const box=mesh.geometry.boundingBox,size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),width=Math.max(size.x,size.z)*1.1,height=size.y*1.08,target=new THREE.WebGLRenderTarget(256*8,256,{depthBuffer:true}),model=new THREE.Mesh(mesh.geometry,mesh.material);
   scene.add(model);camera.left=-width/2;camera.right=width/2;camera.top=height/2;camera.bottom=-height/2;camera.near=.01;camera.far=10;camera.updateProjectionMatrix();renderer.setRenderTarget(target);renderer.setScissorTest(true);
   for(let k=0;k<8;k++){const a=k*Math.PI/4;camera.position.set(center.x+Math.sin(a)*3,center.y,center.z+Math.cos(a)*3);camera.lookAt(center);renderer.setViewport(k*256,0,256,256);renderer.setScissor(k*256,0,256,256);renderer.clear();renderer.render(scene,camera);}
   scene.remove(model);const geometry=new THREE.PlaneGeometry(width,height);geometry.translate(0,center.y,0);const material=new THREE.MeshBasicMaterial({map:target.texture,alphaTest:.32,side:THREE.DoubleSide});
   const impostorShader=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    #ifdef USE_INSTANCING
     vec3 delta=cameraPosition-instanceMatrix[3].xyz;
     float yaw=atan(-instanceMatrix[0].z,instanceMatrix[0].x);
     float bearing=atan(delta.x,delta.z)-yaw;
     float viewIndex=mod(floor(bearing/0.7853981634+0.5)+8.0,8.0);
     vMapUv.x=(vMapUv.x+viewIndex)/8.0;
     transformed.x=position.x*cos(bearing);transformed.z=-position.x*sin(bearing);
    #endif`);
   };material.onBeforeCompile=impostorShader;material.customProgramCacheKey=()=>`plant-impostor`;
   const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:target.texture,alphaTest:.32,side:THREE.DoubleSide});depth.onBeforeCompile=impostorShader;depth.customProgramCacheKey=()=>`plant-impostor-depth`;
   result={geometry,material,depth,target,height:size.y};cache.set(mesh.geometry.userData.botanicalSpecies,result);
  }
  const lod=new THREE.InstancedMesh(result.geometry,result.material,mesh.userData.fieldInstances.total);lod.castShadow=mesh.castShadow;lod.customDepthMaterial=result.depth;lod.receiveShadow=false;lod.frustumCulled=false;lod.count=0;lod.visible=false;mesh.parent.add(lod);mesh.userData.fieldInstances.lod=lod;mesh.userData.fieldInstances.modelHeight=result.height;
 }
 renderer.setRenderTarget(previousTarget);renderer.setClearColor(previousClear,previousAlpha);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);world.impostorResources=[...cache.values()];world.lastView=null;
}

export function setPlantImpostorLight(world,dusk){
 // The distant silhouettes were photographed under the same morning lights as the scene.
 // Match the reduced, warmer evening illumination without regenerating any textures.
 for(const resource of world.impostorResources||[])resource.material.color.setRGB(dusk?.55:1,dusk?.51:1,dusk?.47:1);
}
