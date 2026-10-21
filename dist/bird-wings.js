import * as THREE from './vendor/three.module.js?revision=120';

// Reflect the anatomy, normals and triangle winding together. A negative
// per-instance scale would reverse the front face of only half the birds.
export function pairedWingGeometry(right) {
 const source=right.index?right.toNonIndexed():right;
 const pair=new THREE.BufferGeometry(),count=source.attributes.position.count;
 for(const name of ['position','normal','color','uv']) {
  const attribute=source.attributes[name];if(!attribute)continue;
  const data=new Float32Array(count*2*attribute.itemSize);
  for(let side=0;side<2;side++)for(let triangle=0;triangle<count;triangle+=3)for(let vertex=0;vertex<3;vertex++) {
   const from=triangle+(side===0?[0,2,1][vertex]:vertex),to=side*count+triangle+vertex;
   for(let component=0;component<attribute.itemSize;component++) {
    const reflected=side===0&&component===2&&['position','normal'].includes(name);
    data[to*attribute.itemSize+component]=attribute.array[from*attribute.itemSize+component]*(reflected?-1:1);
   }
  }
  pair.setAttribute(name,new THREE.Float32BufferAttribute(data,attribute.itemSize));
 }
 const sides=new Float32Array(count*2);sides.fill(-1,0,count);sides.fill(1,count);
 pair.setAttribute('wingSide',new THREE.Float32BufferAttribute(sides,1));
 pair.computeBoundingSphere();if(source!==right)source.dispose();return pair;
}

export function wingPose(motion,age=0) {
 return [
  .14+Math.sin(motion.flap)*.7*(motion.flapPower??1)*motion.air-motion.dry*(.38+.018*Math.sin(age*.6)),
  Math.max(.001,motion.air,motion.dry*.94)
 ];
}

// Both wings use the same feather surface and positive instance transforms.
// The same deformation also runs in the shadow and fieldbook preview shaders.
export function wingShader(shader,previewPose=null) {
 const declaration=previewPose?'uniform':'attribute';
 shader.vertexShader=`attribute float wingSide;\n${declaration} vec2 wingPose;\nvec3 wingRotate(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);}\n`+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',
  '#include <begin_vertex>\ntransformed.z*=wingPose.y;transformed=wingRotate(transformed,wingSide*wingPose.x);');
 shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',
  '#include <beginnormal_vertex>\nobjectNormal.z/=wingPose.y;objectNormal=wingRotate(objectNormal,wingSide*wingPose.x);');
 if(previewPose)shader.uniforms.wingPose=previewPose;
}
