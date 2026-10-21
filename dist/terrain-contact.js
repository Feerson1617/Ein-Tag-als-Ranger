// Sample the actual indexed terrain triangles, rather than the continuous
// height formula from which their vertices were authored. No per-frame raycast.
export class TerrainContact {
 constructor(geometry,origin={x:0,z:0}){
  this.position=geometry.attributes.position;this.columns=geometry.parameters.widthSegments+1;this.rows=geometry.parameters.heightSegments+1;
  this.x=new Float64Array(this.columns);this.z=new Float64Array(this.rows);
  for(let i=0;i<this.columns;i++)this.x[i]=this.position.getX(i)+(origin.x||0);
  for(let i=0;i<this.rows;i++)this.z[i]=this.position.getZ(i*this.columns)+(origin.z||0);
 }
 cell(axis,value){if(value<axis[0]||value>axis.at(-1))return -1;let lo=0,hi=axis.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(axis[mid]<=value)lo=mid;else hi=mid;}return lo;}
 at(x,z){
  const ix=this.cell(this.x,x),iz=this.cell(this.z,z);if(ix<0||iz<0)return null;
  const u=(x-this.x[ix])/(this.x[ix+1]-this.x[ix]),v=(z-this.z[iz])/(this.z[iz+1]-this.z[iz]),a=ix+iz*this.columns;
  const y00=this.position.getY(a),y10=this.position.getY(a+1),y01=this.position.getY(a+this.columns),y11=this.position.getY(a+this.columns+1);
  return u+v<=1?y00+(y10-y00)*u+(y01-y00)*v:y11+(y01-y11)*(1-u)+(y10-y11)*(1-v);
 }
}
