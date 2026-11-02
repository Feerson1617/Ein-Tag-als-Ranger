import * as THREE from '../vendor/three.module.js?revision=120';

// Closed loft through anatomical cross-sections [x,y,z,vertical,horizontal].
// The centreline and both radii are interpolated together, so the silhouette
// does not consist of intersecting balls. Optional colour is on the skin.
export function profileGeometry(sections,{rows=36,sides=20,paint=null}={}){
 const paths=[0,1,2,3,4].map(k=>new THREE.SplineCurve(sections.map((s,i)=>new THREE.Vector2(i,s[k])))),p=[],indices=[],colors=[];
 for(let j=0;j<=rows;j++){
  const t=j/rows,v=paths.map(c=>c.getPoint(t).y),ry=Math.max(0,v[3]),rz=Math.max(0,v[4]);
  for(let k=0;k<=sides;k++){
   const a=k/sides*Math.PI*2,x=v[0],y=v[1]+Math.cos(a)*ry,z=v[2]+Math.sin(a)*rz;p.push(x,y,z);
   if(paint){const c=new THREE.Color(paint(x,y,z,t,a));colors.push(c.r,c.g,c.b);}
   if(j<rows&&k<sides){const n=j*(sides+1)+k;indices.push(n,n+1,n+sides+1,n+1,n+sides+2,n+sides+1);}
  }
 }
 for(const row of [0,rows]){const s=sections[row?sections.length-1:0],n=p.length/3;p.push(...s.slice(0,3));if(paint){const c=new THREE.Color(paint(...s.slice(0,3),row/rows,0));colors.push(c.r,c.g,c.b);}for(let k=0;k<sides;k++){const i=row*(sides+1)+k;indices.push(...(row?[n,i,i+1]:[n,i+1,i]));}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(indices);if(paint)g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
}

export function birdTorsoGeometry(taxon){
 const tit=taxon==='parus_major',jay=taxon==='garrulus_glandarius',red=taxon==='tringa_totanus',oyster=taxon==='haematopus_ostralegus';
 return profileGeometry([[-.67,.02,0,.012,.012],[-.48,.025,0,.13,.13],[-.22,.01,0,.24,.245],[.08,0,0,.28,.255],[.29,.025,0,.235,.20],[.34,tit||jay?.17:.12,0,tit||jay?.16:.135,.12],[.38,tit||jay?.24:.20,0,tit||jay?.09:.03,tit||jay?.085:.03]],{paint:(x,y,z)=>{
  if(tit)return y<.035?(Math.abs(z)<.065?'#202722':'#d5c44b'):'#72834b';
  if(jay)return x<-.43&&y>.02?'#eee9db':y<-.08?'#bd9d8b':'#aa8979';
  if(oyster)return y>.045||x>.22?'#252b2a':'#ece9d9';
  if(red)return y<-.035?'#dad5bb':'#887961';
  return '#eeeadd';
 }});
}

export function foldedWingGeometry(taxon,side,bodyY){
 const red=taxon==='tringa_totanus',jay=taxon==='garrulus_glandarius',tit=taxon==='parus_major',spoon=taxon==='platalea_leucorodia',avocet=taxon==='recurvirostra_avosetta';
 return profileGeometry([[-.76,bodyY-.055,side*.085,.004,.004],[-.56,bodyY+.015,side*.17,.065,.026],[-.30,bodyY+.11,side*.235,.13,.035],[.02,bodyY+.115,side*.225,.13,.035],[.22,bodyY+.09,side*.16,.05,.02],[.25,bodyY+.08,side*.14,0,0]],{rows:56,sides:20,paint:(x,y,z)=>{
  if(jay){if(x>-.14&&x<.13&&y<bodyY+.18)return Math.sin((x+.14)*145)>.30?'#243337':'#6ea7c6';return x<-.43?'#282e2d':y<bodyY+.04?'#e7e2d5':'#8d776a';}
  if(tit)return y<bodyY+.05&&x>-.4?'#dedbc9':x<-.4?'#495449':'#71817c';
  if(red){const fleck=Math.sin(x*145+Math.sin(y*91)*1.3)*Math.sin(y*151+z*41);return fleck>.68?'#b8a98b':fleck<-.60?'#5d5543':'#93846a';}
  if(spoon)return '#e3e0d1';if(avocet)return x>-.1?'#edeadd':'#222a28';return '#242b2a';
 }});
}

export function flightWingGeometry(taxon,side){
 // Wing span follows Z after rotation; chord narrows into the primary tips.
 // The broad proximal coverts and swept distal feathers replace the old oval.
 const jay=taxon==='garrulus_glandarius',tit=taxon==='parus_major',spoon=taxon==='platalea_leucorodia',red=taxon==='tringa_totanus',avocet=taxon==='recurvirostra_avosetta';
 const g=profileGeometry([[0,0,-.04,.018,.14],[.22,0,.03,.025,.28],[.48,-.015,.12,.02,.28],[.76,-.025,.25,.015,.22],[.98,-.035,.41,.009,.13],[1.12,-.04,.54,.002,.005]],{rows:44,sides:16,paint:(span,y,chord)=>{
  if(spoon)return '#e5e1d4';
  if(jay&&span<.48&&chord<.15)return Math.sin(span*90)>.2?'#26373c':'#70a2be';
  if(jay)return span<.44&&chord>.13?'#e6e0cf':'#3c403c';
  if(tit)return span>.35&&span<.44?'#d8d9c7':'#59665f';
  if(red)return chord>.12&&span<.8?'#dcd8c7':'#887b65';
  if(avocet)return span<.5?'#e9e5d5':'#252d2b';
  return span>.36&&span<.52?'#e7e4d4':'#252b2b';
 }});
 g.rotateY(-Math.PI/2);g.scale(1,1,side);
 if(side<0){const ix=g.index.array;for(let i=0;i<ix.length;i+=3)[ix[i+1],ix[i+2]]=[ix[i+2],ix[i+1]];}
 return g;
}

// Closed continuous body, from breast to rump; long axis +X. Endpoints and
// maximum envelope stay inside the previous diagnostic body dimensions.
export function birdBodyGeometry(){
 const g=new THREE.SphereGeometry(1,24,16),p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),t=(x+1)*.5;
  const taper=.79+.21*Math.sin(t*Math.PI*.85);
  p.setXYZ(i,x,y*taper+.045*(1-x*x),z*taper);
 }
 g.computeVertexNormals();return g;
}
export function butterflyWingGeometry(side,fore=true){
 const shape=new THREE.Shape();
 if(fore){shape.moveTo(.32,0);shape.bezierCurveTo(.70,.20,.62,.80,.32,.91);shape.bezierCurveTo(.17,.87,.12,.95,.02,.86);shape.bezierCurveTo(-.09,.82,-.21,.66,-.27,.50);shape.bezierCurveTo(-.17,.28,.04,.08,.32,0);}
 else{shape.moveTo(.02,0);shape.bezierCurveTo(-.30,.13,-.66,.33,-.64,.52);shape.bezierCurveTo(-.59,.67,-.52,.72,-.41,.69);shape.bezierCurveTo(-.30,.79,-.20,.70,-.13,.62);shape.bezierCurveTo(.02,.55,.12,.25,.02,0);}
 const g=new THREE.ShapeGeometry(shape,12);g.rotateX(Math.PI/2);g.scale(1,1,side);if(side>0){const index=g.index;for(let i=0;i<index.count;i+=3){const a=index.getX(i);index.setX(i,index.getX(i+2));index.setX(i+2,a);}}
 g.computeVertexNormals();return g;
}
