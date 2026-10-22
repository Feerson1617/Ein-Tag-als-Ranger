// Meter, +Y up. Terrain, path rendering and traversal share these exact samples.
export const BOUNDS={west:-80,east:80,south:-50,north:50};
export const WALK_PROFILE=Object.freeze({walk:1.6,brisk:2.8,observation:.8});
export const START={x:-52,z:8,yaw:Math.PI/2};
export const ROUTE_POINTS=[[-52,8],[-69,4],[-71,-16],[-58,-28],[-42,-26],[-33,-13],[-34,0],[-24,3],[-17,-5],[-8,-3],[-9,14],[-1,18],[5,12],[8,2],[12,-8],[18,-8],[25,-1],[27,15],[37,25],[47,16],[46,0],[54,-9],[63,-13],[73,-4],[70,10],[59,20],[65,33],[77,34]];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
export function zoneAt(x){return x<-24?'forest':x<1?'village':x<18?'dike':x<52?'saltmarsh':'wadden';}
export function terrainHeight(x,z){
 const inland=.3+.06*Math.sin(x*.19)*Math.cos(z*.14);
 if(x<0)return inland;
 if(x<18)return .3+1.5*Math.sin(Math.PI*x/18)**2;
 if(x<52)return .3-.8*smooth(18,52,x)+.07*Math.sin(z*.22)*Math.sin(x*.37);
 const creek=.48*Math.exp(-(((z+2-6*Math.sin(x*.1))/3.6)**2));
 return -.52-.18*smooth(52,80,x)-creek+.025*Math.sin(z*.8+x*.4);
}
function rounded(points){
 const out=[];
 for(let i=0;i<points.length-1;i++){
  const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
  const n=Math.ceil(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/.2);
  for(let j=0;j<n;j++){const t=j/n,t2=t*t,t3=t2*t;const q=k=>.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3);out.push({x:q(0),z:q(1)});}
 }
 const last=points.at(-1);out.push({x:last[0],z:last[1]});return out;
}
function finish(points,id){let distance=0;return points.map((p,i)=>{if(i)distance+=Math.hypot(p.x-points[i-1].x,p.z-points[i-1].z);const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],len=Math.hypot(b.x-a.x,b.z-a.z);return {...p,y:Math.max(.46,terrainHeight(p.x,p.z)+.09),tx:(b.x-a.x)/len,tz:(b.z-a.z)/len,width:1.8,distance,route:id};});}
export const ROUTE=finish(rounded(ROUTE_POINTS),'main');
export const SHORTCUT=finish(rounded([[-52,8],[-44,9],[-33,7],[-24,3]]),'shortcut');
// A short study spur makes the creek viewing point physically reachable.
export const OUTLOOK=finish(rounded([[70,10],[67,5],[63,4]]),'creek-outlook');
export const PATHS=[ROUTE,SHORTCUT,OUTLOOK];
export function nearestPath(x,z){let best=null,d2=Infinity;
 for(const path of PATHS)for(let i=1;i<path.length;i++){
  const a=path[i-1],b=path[i],dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz),0,1),px=a.x+t*dx,pz=a.z+t*dz,dd=(px-x)**2+(pz-z)**2;
  if(dd<d2){d2=dd;best={x:px,z:pz,y:a.y+t*(b.y-a.y),distance:Math.sqrt(dd),tx:b.tx,tz:b.tz,route:b.route,progress:a.distance+t*(b.distance-a.distance)};}
 }return best;
}
export function walkingHeight(x,z){const p=nearestPath(x,z);return p.distance<=.94?p.y:terrainHeight(x,z);}
export const SIGNS=[{name:'Laubwald',x:-51,z:10.1},{name:'Dorf',x:-21,z:4},{name:'Salzwiese',x:20,z:-5},{name:'Watt & Priel',x:55,z:-7}];
export const BUILDINGS=[{x:-19,z:13,w:6,d:5,h:3.4},{x:-12,z:-13,w:6,d:5,h:3.2},{x:-2,z:-5,w:5,d:5,h:3.7},{x:-17,z:22,w:5,d:4,h:3}];
export function canWalk(x,z,blockers=[]){
 if(x<BOUNDS.west+.4||x>BOUNDS.east-.4||z<BOUNDS.south+.4||z>BOUNDS.north-.4)return false;
 if(nearestPath(x,z).distance<.86)return true;
 if(terrainHeight(x,z)<-.5)return false;
 if(BUILDINGS.some(b=>Math.abs(x-b.x)<b.w/2+.3&&Math.abs(z-b.z)<b.d/2+.3))return false;
 return !blockers.some(b=>b.halfX!==undefined?Math.abs(x-b.x)<b.halfX+.25&&Math.abs(z-b.z)<b.halfZ+.25:Math.hypot(x-b.x,z-b.z)<b.r+.25);
}
// Each plank follows the local tangent and width. No separate, intersecting underdeck.
export function plankCorners(p,length=.19){const nx=-p.tz*p.width/2,nz=p.tx*p.width/2,dx=p.tx*length/2,dz=p.tz*length/2;return [[p.x-dx+nx,p.y,p.z-dz+nz],[p.x+dx+nx,p.y,p.z+dz+nz],[p.x+dx-nx,p.y,p.z+dz-nz],[p.x-dx-nx,p.y,p.z-dz-nz]];}
export function routeMetrics(){return {width:160,depth:100,areaHa:1.6,mainMeters:ROUTE.at(-1).distance,shortcutMeters:SHORTCUT.at(-1).distance,outlookMeters:OUTLOOK.at(-1).distance,walkSeconds:ROUTE.at(-1).distance/WALK_PROFILE.walk,shortcutSeconds:SHORTCUT.at(-1).distance/WALK_PROFILE.walk,maxSlope:Math.max(...ROUTE.slice(1).map((p,i)=>Math.abs(p.y-ROUTE[i].y)/(p.distance-ROUTE[i].distance)))};}
