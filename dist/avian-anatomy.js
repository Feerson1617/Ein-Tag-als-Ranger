import * as THREE from './vendor/three.module.js?revision=120';

const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};

// One closed feathered torso; the colour boundary follows the same surface.
// x points towards the bill, y upwards. Left/right plumage is symmetric.
export function avianTorso(radii,palette,species){
 const [rx,ry,rz]=radii,rows=14,columns=16,positions=[],colors=[],uvs=[],indices=[];
 const body=new THREE.Color(palette.body),back=new THREE.Color(palette.back),belly=new THREE.Color(palette.belly),breast=new THREE.Color(palette.breast||palette.body),colour=new THREE.Color();
 for(let row=0;row<=rows;row++){
  const theta=row/rows*Math.PI,front=Math.cos(theta),ring=Math.sin(theta);
  for(let col=0;col<=columns;col++){
   const phi=col/columns*Math.PI*2,up=Math.cos(phi),side=Math.sin(phi);
   positions.push(rx*front+.015,ry*ring*up*(1.12+.10*front)+.012+.012*front,rz*ring*side*(1.04+.06*front));
   colour.copy(body).lerp(back,smooth(.05,.68,up)).lerp(belly,1-smooth(-.65,-.12,up));
   if(palette.breast)colour.lerp(breast,smooth(.25,.8,front)*(1-smooth(.25,.8,up)));
   if(species==='anas_platyrhynchos')colour.lerp(new THREE.Color('#71523f'),smooth(.35,.75,front)*(1-smooth(.25,.75,up)));
   if(species==='tadorna_tadorna')colour.lerp(new THREE.Color('#a8623d'),smooth(.32,.52,front)*(1-smooth(.72,.88,front)));
   colors.push(colour.r,colour.g,colour.b);uvs.push(row/rows,col/columns);
  }
 }
 for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
  const a=row*(columns+1)+col,b=a+columns+1;
  if(row>0)indices.push(a,b,a+1);
  if(row<rows-1)indices.push(b,b+1,a+1);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();
 // The duplicated UV seam needs identical normals, including the cap poles.
 const normals=g.attributes.normal;
 for(let row=0;row<=rows;row++){
  const first=row*(columns+1),last=first+columns,v=new THREE.Vector3();
  if(row===0||row===rows){for(let col=0;col<=columns;col++)v.add(new THREE.Vector3().fromBufferAttribute(normals,first+col));v.normalize();for(let col=0;col<=columns;col++)normals.setXYZ(first+col,v.x,v.y,v.z);}
  else{v.fromBufferAttribute(normals,first).add(new THREE.Vector3().fromBufferAttribute(normals,last)).normalize();normals.setXYZ(first,v.x,v.y,v.z);normals.setXYZ(last,v.x,v.y,v.z);}
 }
 g.computeBoundingBox();g.computeBoundingSphere();return g;
}
