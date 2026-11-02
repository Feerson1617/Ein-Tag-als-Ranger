// Segment tests use the same tapered, leaning trunk as the rendered cylinder.
// No broad exception near the endpoint: it would allow looking through wood.
export function trunkOccludes(from,to,trunk){
 const height=trunk.h*.72,ax=.12,ay=height,length=Math.hypot(ax,ay),ux=ay/length,uy=-ax/length,vx=ax/length,vy=ay/length;
 const x=from.x-trunk.x,y=from.y-trunk.y,z=from.z-trunk.z,dx=to.x-from.x,dy=to.y-from.y,dz=to.z-from.z;
 const sx=x*ux+y*uy,sy=x*vx+y*vy,ex=dx*ux+dy*uy,ey=dx*vx+dy*vy;
 let lo=1e-7,hi=1-1e-7;
 if(Math.abs(ey)<1e-12){if(sy<0||sy>length)return false;}else {const a=-sy/ey,b=(length-sy)/ey;lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));if(lo>hi)return false;}
 const k=-.55*trunk.r/length,r=trunk.r+k*sy,A=ex*ex+dz*dz-(k*ey)**2,B=2*(sx*ex+z*dz-r*k*ey),C=sx*sx+z*z-r*r;
 const f=t=>A*t*t+B*t+C;let minimum=Math.min(f(lo),f(hi));if(A>0){const t=-B/(2*A);if(t>lo&&t<hi)minimum=Math.min(minimum,f(t));}return minimum< -1e-10;
}
export function boxOccludes(from,to,box){let lo=1e-7,hi=1-1e-7;for(const axis of ['x','y','z']){const d=to[axis]-from[axis],s=from[axis];if(Math.abs(d)<1e-12){if(s<box.min[axis]||s>box.max[axis])return false;}else {const a=(box.min[axis]-s)/d,b=(box.max[axis]-s)/d;lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));if(lo>hi)return false;}}return hi>lo;}
export function isTargetVisible(from,to,occluders){return !occluders.trunks.some(t=>trunkOccludes(from,to,t))&&!occluders.buildings.some(b=>boxOccludes(from,to,b));}
