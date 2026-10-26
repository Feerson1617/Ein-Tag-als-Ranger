import * as THREE from '../vendor/three.module.js?revision=120';

// Original procedural foliage texture. These are decorative leaves of the
// existing trees, not extra taxa/individuals or an identification photograph.
function leafClusterTexture(oak){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const c=canvas.getContext('2d');let seed=oak?917:541;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<170;i++){
  const angle=rand()*Math.PI*2,r=Math.sqrt(rand())*106,x=128+Math.cos(angle)*r,y=128+Math.sin(angle)*r;
  c.save();c.translate(x,y);c.rotate(rand()*Math.PI*2);
  const length=12+rand()*15,width=length*(oak?.50:.42),light=31+rand()*18;
  c.fillStyle=`hsl(${oak?84:91} 29% ${light}%)`;c.beginPath();
  if(oak){c.moveTo(0,-length/2);for(let side=1;side>=-1;side-=2)for(let k=0;k<=12;k++){const t=side===1?k/12:1-k/12,w=Math.sin(t*Math.PI)*width*(k%2?.62:1);c.lineTo(side*w*.5,-length/2+t*length);}c.closePath();}
  else c.ellipse(0,0,width*.5,length*.5,0,0,Math.PI*2);
  c.fill();c.strokeStyle='#b1bd765c';c.lineWidth=.8;c.beginPath();c.moveTo(0,-length*.4);c.lineTo(0,length*.45);c.stroke();c.restore();
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
export function createCanopyView(scene,clusters){
 const meshes=[],plane=new THREE.PlaneGeometry(1,1),dummy=new THREE.Object3D();
 for(const oak of [false,true]){
  const rows=clusters.filter(c=>c.oak===oak),material=new THREE.MeshStandardMaterial({map:leafClusterTexture(oak),alphaTest:.48,side:THREE.DoubleSide,roughness:1});
  const mesh=new THREE.InstancedMesh(plane,material,rows.length*6);let i=0;
  for(const row of rows)for(let k=0;k<6;k++){
   const a=row.phase+k*2.399,spread=.38;
   dummy.position.set(row.end[0]+Math.cos(a)*row.scale[0]*spread,row.end[1]+Math.sin(k*1.7)*row.scale[1]*.35,row.end[2]+Math.sin(a)*row.scale[2]*spread);
   dummy.scale.set(row.scale[0]*2.1,row.scale[1]*2.1,1);dummy.rotation.set((k%3-1)*.64,a,(k%2-.5)*.38);dummy.updateMatrix();mesh.setMatrixAt(i++,dummy.matrix);
  }
  mesh.castShadow=true;mesh.receiveShadow=true;mesh.computeBoundingSphere();scene.add(mesh);meshes.push(mesh);
 }
 return meshes;
}
