import * as THREE from './vendor/three.module.js?revision=120';
// Thin, closed leaf blades with a midrib, curvature and a rounded silhouette.
// The upper and lower surfaces have separate normals rather than flat cards.
export function curvedLeaf(length,width,petal=false,detailed=true){
 const rows=detailed?6:3,cols=detailed?2:1,sides=detailed?2:1,p=[],uv=[],index=[];
 for(let side=0;side<sides;side++)for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
  const t=row/rows,c=col/cols*2-1,w=Math.max(.005,Math.sin(Math.PI*t)**(petal?.55:.8))*width*.5;
  const bend=length*(petal?-.22:.12)*t*t+width*.14*c*c*Math.sin(Math.PI*t);
  p.push(c*w,t*length,bend+(side?-.0015:.0015));uv.push(col/cols,t);
 }
 const n=(rows+1)*(cols+1);
 for(let side=0;side<sides;side++)for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
  const a=side*n+row*(cols+1)+col,b=a+1,c=a+cols+1,d=c+1;
  if(side)index.push(a,c,b,b,c,d);else index.push(a,b,c,b,d,c);
 }
 if(detailed){for(let row=0;row<rows;row++)for(const col of [0,cols]){const a=row*(cols+1)+col,b=a+cols+1;index.push(a,b,a+n,b,b+n,a+n);}
 for(const row of [0,rows])for(let col=0;col<cols;col++){const a=row*(cols+1)+col,b=a+1;index.push(a,a+n,b,b,a+n,b+n);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();return g;
}
