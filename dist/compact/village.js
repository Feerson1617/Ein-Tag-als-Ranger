import { nearestPath,terrainHeight } from './layout.js';
export const SPEAKERS=Object.freeze([
 {id:'ranger',name:'Rangerdienst',x:-23.5,z:.7,color:'#506c4c'},
 {id:'local',name:'Örtliche Nutzung',x:-14,z:-7.3,color:'#9c6545'},
 {id:'coastal',name:'Küstenschutz',x:-3,z:15.6,color:'#496b87'}
]);
export function nearestSpeaker(observer){const rows=SPEAKERS.map(p=>({...p,distance:Math.hypot(p.x-observer.x,p.z-observer.z)}));return rows.sort((a,b)=>a.distance-b.distance)[0];}
export function speakerApproach(p){const path=nearestPath(p.x,p.z);return {x:path.x,z:path.z,target:[p.x,terrainHeight(p.x,p.z)+1.45,p.z],label:'Gespräch: '+p.name};}
