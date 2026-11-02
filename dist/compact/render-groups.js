import * as THREE from '../vendor/three.module.js?revision=120';

// Partition only renderer-owned static decoration. Triangle attributes and
// instance matrices/colours are copied exactly; no biological object is culled
// from the state or moved. Frustum bounds cover every original vertex.
export function spatialRenderGroup(source,cellSize=16){
 const group=new THREE.Group(),buckets=new Map(),matrix=new THREE.Matrix4(),position=new THREE.Vector3(),color=new THREE.Color();
 group.name='spatial-static-decoration';
 const bucket=(x,z)=>{const key=Math.floor(x/cellSize)+','+Math.floor(z/cellSize);if(!buckets.has(key))buckets.set(key,[]);return buckets.get(key);};
 if(source.isInstancedMesh){
  for(let i=0;i<source.count;i++){source.getMatrixAt(i,matrix);position.setFromMatrixPosition(matrix);bucket(position.x,position.z).push(i);}
  for(const indices of buckets.values()){
   const mesh=new THREE.InstancedMesh(source.geometry,source.material,indices.length);
   for(const [i,index]of indices.entries()){source.getMatrixAt(index,matrix);mesh.setMatrixAt(i,matrix);if(source.instanceColor){source.getColorAt(index,color);mesh.setColorAt(i,color);}}
   mesh.computeBoundingBox();mesh.computeBoundingSphere();group.add(mesh);
  }
 }else{
  const geometry=source.geometry.index?source.geometry.toNonIndexed():source.geometry,p=geometry.attributes.position;
  for(let i=0;i<p.count;i+=3)bucket((p.getX(i)+p.getX(i+1)+p.getX(i+2))/3,(p.getZ(i)+p.getZ(i+1)+p.getZ(i+2))/3).push(i);
  for(const triangles of buckets.values()){
   const part=new THREE.BufferGeometry();
   for(const [name,attribute]of Object.entries(geometry.attributes)){
    const values=new attribute.array.constructor(triangles.length*3*attribute.itemSize);let offset=0;
    for(const triangle of triangles)for(let j=0;j<3;j++)for(let k=0;k<attribute.itemSize;k++)values[offset++]=attribute.array[(triangle+j)*attribute.itemSize+k];
    part.setAttribute(name,new THREE.BufferAttribute(values,attribute.itemSize,attribute.normalized));
   }
   part.computeBoundingBox();part.computeBoundingSphere();group.add(new THREE.Mesh(part,source.material));
  }
  if(geometry!==source.geometry)geometry.dispose();
 }
 group.position.copy(source.position);group.quaternion.copy(source.quaternion);group.scale.copy(source.scale);
 for(const mesh of group.children){mesh.castShadow=source.castShadow;mesh.receiveShadow=source.receiveShadow;mesh.renderOrder=source.renderOrder;mesh.layers.mask=source.layers.mask;}
 return group;
}

// The coarse display mesh must meet the same continuous terrain used by tiny
// benthic prey. Insert existing contact anchors; do not move animals/resources
// or lower the whole ground. Shared-edge triangles are split on both sides.
export function pinTerrainContacts(geometry,contacts,heightAt){
 const attributes=Object.fromEntries(Object.entries(geometry.attributes).map(([name,a])=>[name,{size:a.itemSize,normalized:a.normalized,Type:a.array.constructor,values:Array.from(a.array)}]));
 let triangles=geometry.index?Array.from(geometry.index.array):Array.from({length:geometry.attributes.position.count},(_,i)=>i);
 const pos=attributes.position.values,area=(a,b,c)=>(pos[b*3]-pos[a*3])*(pos[c*3+2]-pos[a*3+2])-(pos[b*3+2]-pos[a*3+2])*(pos[c*3]-pos[a*3]);
 for(const point of contacts){
  if(pos.some((_,i)=>i%3===0&&Math.hypot(pos[i]-point.x,pos[i+2]-point.z)<1e-6))continue;
  const matches=[];
  for(let i=0;i<triangles.length;i+=3){const [a,b,c]=triangles.slice(i,i+3),ax=pos[a*3],az=pos[a*3+2],bx=pos[b*3],bz=pos[b*3+2],cx=pos[c*3],cz=pos[c*3+2],den=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz),u=((bz-cz)*(point.x-cx)+(cx-bx)*(point.z-cz))/den,v=((cz-az)*(point.x-cx)+(ax-cx)*(point.z-cz))/den,w=1-u-v;if(u>=-1e-8&&v>=-1e-8&&w>=-1e-8)matches.push({offset:i,a,b,c,weights:[u,v,w]});}
  if(!matches.length)continue;
  const index=pos.length/3,first=matches[0];
  for(const[name,a]of Object.entries(attributes))for(let k=0;k<a.size;k++)a.values.push(name==='position'?[point.x,heightAt(point.x,point.z),point.z][k]:[first.a,first.b,first.c].reduce((sum,j,n)=>sum+a.values[j*a.size+k]*first.weights[n],0));
  const map=new Map(matches.map(m=>[m.offset,m])),next=[];
  for(let i=0;i<triangles.length;i+=3){const match=map.get(i);if(!match){next.push(...triangles.slice(i,i+3));continue;}for(const[a,b,c]of [[match.a,match.b,index],[match.b,match.c,index],[match.c,match.a,index]])if(Math.abs(area(a,b,c))>1e-12)next.push(a,b,c);}
  triangles=next;
 }
 for(const[name,a]of Object.entries(attributes))geometry.setAttribute(name,new THREE.BufferAttribute(new a.Type(a.values),a.size,a.normalized));
 geometry.setIndex(triangles);geometry.computeVertexNormals();geometry.computeBoundingSphere();return geometry;
}
