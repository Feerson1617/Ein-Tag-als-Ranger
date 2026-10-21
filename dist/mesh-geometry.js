import * as THREE from './vendor/three.module.js?revision=120';

// Merge only identical vertices, including every normal, colour and texture coordinate.
// This changes the GPU workload, not the surface or its shading.
export function indexGeometry(geometry){
 if(geometry.index)return geometry;const attributes=Object.entries(geometry.attributes),indices=[],unique=[],seen=new Map(),count=geometry.attributes.position.count;
 for(let i=0;i<count;i++){
  let key='';for(const [,a] of attributes)for(let k=0;k<a.itemSize;k++)key+=a.array[i*a.itemSize+k]+',';
  let index=seen.get(key);if(index===undefined){index=unique.length;seen.set(key,index);unique.push(i);}indices.push(index);
 }
 if(unique.length>=count*.95)return geometry;
 for(const [name,a] of attributes){const values=new a.array.constructor(unique.length*a.itemSize);unique.forEach((source,index)=>values.set(a.array.subarray(source*a.itemSize,source*a.itemSize+a.itemSize),index*a.itemSize));geometry.setAttribute(name,new THREE.BufferAttribute(values,a.itemSize,a.normalized));}
 geometry.setIndex(indices);return geometry;
}
