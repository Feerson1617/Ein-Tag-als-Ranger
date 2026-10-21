import * as THREE from './vendor/three.module.js?revision=120';

// A feather is a curved, closed vane. The two wings share this surface and its
// reflected winding; a flat card would disappear in an oblique binocular view.
export function flightFeather(root,tip,width){
 const p=[],uv=[],indices=[],rows=8,rings=8;
 const dx=tip[0]-root[0],dz=tip[2]-root[2],length=Math.hypot(dx,dz),nx=dz/length,nz=-dx/length;
 for(let row=0;row<=rows;row++){
  const t=row/rows,span=width*Math.pow(Math.sin(Math.PI*t),.62)+.0005;
  for(let j=0;j<=rings;j++){
   const a=j/rings*Math.PI*2,across=Math.cos(a)*span;
   p.push(root[0]+dx*t+nx*across,root[1]+(tip[1]-root[1])*t+Math.sin(a)*.0035*Math.sin(Math.PI*t)+.012*Math.sin(Math.PI*t),root[2]+dz*t+nz*across);uv.push(t,j/rings);
   if(row<rows&&j<rings){const k=row*(rings+1)+j;indices.push(k,k+1,k+rings+1,k+1,k+rings+2,k+rings+1);}
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
