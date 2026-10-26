import * as THREE from '../vendor/three.module.js?revision=120';

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
 const g=new THREE.ShapeGeometry(shape,12);g.rotateX(Math.PI/2);g.scale(1,1,side);if(side<0){const index=g.index;for(let i=0;i<index.count;i+=3){const a=index.getX(i);index.setX(i,index.getX(i+2));index.setX(i+2,a);}}
 g.computeVertexNormals();return g;
}
