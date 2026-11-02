import { nearestPath,terrainHeight,zoneAt } from './layout.js';
// This register describes authored microhabitats, never measured natural densities.
export const FOREST_HABITATS=Object.freeze([
 {id:'shaded-beech',label:'Schattiger Laubwald',x:-65,z:18,radius:11,light:.18},
 {id:'light-gap',label:'Lichte Eichenstelle mit Strauchschicht',x:-37,z:-21,radius:7,light:.64},
 {id:'nutrient-edge',label:'Nährstoffreicher Waldsaum',x:-28,z:9,radius:6,light:.72},
 {id:'deadwood',label:'Totholz, Streu und bodennahe Deckung',x:-63,z:-2,radius:5,light:.22}
]);
export function forestHabitatAt(x,z){if(zoneAt(x)!=='forest')return null;return [...FOREST_HABITATS].sort((a,b)=>Math.hypot(x-a.x,z-a.z)/a.radius-Math.hypot(x-b.x,z-b.z)/b.radius)[0];}
export function applyForestStructure(state,random){
 if(state.modelRevision<3||state.habitatStructureApplied)return;
 const patches=[['shade-north','galium_odoratum',-66,28,65,6,.25],['shade-west','galium_odoratum',-73,-27,55,5,.21],['shade-south','galium_odoratum',-53,-35,55,6,.23],['core-bridge','galium_odoratum',-61,15,60,7,.23],['oak-gap','rubus_fruticosus',-37,-21,18,4,1.25],['light-north','rubus_fruticosus',-32,28,13,3,1.05],['edge-herbs','urtica_dioica',-29,5,35,3,.86],['edge-shrub','rubus_fruticosus',-29,14,12,3,1.15],['shade-central','galium_odoratum',-57,4,170,14,.23],['shade-south-carpet','galium_odoratum',-60,-15,170,14,.22],['shade-west-carpet','galium_odoratum',-72,12,130,10,.24]];
 for(const [id,taxon,cx,cz,count,radius,size]of patches)for(let i=0;i<count;i++){
  const angle=random()*Math.PI*2,r=Math.sqrt(random())*radius,x=cx+Math.cos(angle)*r,z=cz+Math.sin(angle)*r;
  if(zoneAt(x)!=='forest'||nearestPath(x,z).distance<1.5||state.trees.some(t=>Math.hypot(t.x-x,t.z-z)<t.r+.45)||Math.hypot(x+52,z-8)<1.8)continue;
  state.plants.push({id:state.worldVersion+':'+taxon+':understory-'+id+'-'+i,taxon,x,z,y:terrainHeight(x,z),size:size*(.72+random()*.56),angle:random()*Math.PI*2,microhabitat:forestHabitatAt(x,z).id,origin:'fixed authored stand; not a measured density'});
 }
 state.habitatStructureApplied=true;
}
export function applyMarshGradient(state){
 if(state.modelRevision<3||state.marshGradientApplied)return;
 for(const p of state.plants){if(p.taxon==='halimione_portulacoides')p.x-=8;if(p.taxon==='puccinellia_maritima')p.x+=4.5;p.y=terrainHeight(p.x,p.z);}
 state.marshGradientApplied=true;
}
export function structureTreeAges(state,random){
 if(state.modelRevision<3)return;
 for(const t of state.trees.slice(3)){const n=random();t.ageClass=n<.23?'young':n>.82?'old':'mature';t.h=t.ageClass==='young'?4.5+random()*2.5:t.ageClass==='old'?12+random()*3:8+random()*5;t.r=t.ageClass==='young'?.07+random()*.055:t.ageClass==='old'?.40+random()*.16:.18+random()*.19;t.crownRadius=t.ageClass==='young'?1.2+random()*.7:t.ageClass==='old'?4+random()*1.5:2.6+random()*1.4;t.crownAspect=t.type==='oak'?[1.15,.8,1.05]:[.9,1.2,1];}
}
export function floodingStatistics(state){
 const levels={low:-1.05,normalHigh:-.25,higher:.05,rare:.30},plants=[...state.plants,...state.trees.map(t=>({...t,taxon:t.type==='beech'?'fagus_sylvatica':'quercus_robur',y:terrainHeight(t.x,t.z,state.modelRevision)}))];
 return Object.fromEntries([...new Set(plants.map(p=>p.taxon))].map(taxon=>{const rows=plants.filter(p=>p.taxon===taxon);return[taxon,{count:rows.length,surfaceRange:[Math.min(...rows.map(p=>p.y)),Math.max(...rows.map(p=>p.y))],submerged:Object.fromEntries(Object.entries(levels).map(([name,level])=>[name,{waterLevel:level,count:rows.filter(p=>p.x>=18&&p.y<level).length,percent:rows.filter(p=>p.x>=18&&p.y<level).length/rows.length*100}]))}];}));
}
