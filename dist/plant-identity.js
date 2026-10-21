// World coordinates belong to the registered plant, never to a render/LOD slot.
// The deterministic identifier survives rendering, scene switches and exports.
const anonymous=new WeakMap();let serial=0;
export function plantIdentity(p){
 if(!p||typeof p!=='object')return null;
 if(p.instance&&p.instance!==p)return plantIdentity(p.instance);
 if(p.individualId)return p.individualId;
 const taxon=p.species||p.id;
 if(Number.isFinite(p.x)&&Number.isFinite(p.z))return `plant:${p.habitat||'local'}:${taxon}:${p.x}:${p.z}:${p.y||0}`;
 if(p.uid)return `patch:${p.habitat||'local'}:${p.uid}`;
 // Small unit-test/synthetic plants without a world position still differ.
 if(!anonymous.has(p))anonymous.set(p,`unpositioned:${++serial}`);
 return anonymous.get(p);
}
export function registerPlantIdentities(plants){
 for(const p of plants)p.individualId||=plantIdentity(p);
}
export function samePlant(a,b){return !!a&&!!b&&plantIdentity(a)===plantIdentity(b);}
