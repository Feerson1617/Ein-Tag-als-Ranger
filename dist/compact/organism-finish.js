import { scenicSurface } from './scenic-materials.js';
import { CATALOG } from './catalog.js';

// Diagnostic vertex colours remain authoritative. Surface grain never creates
// a new marking, shifts a contact point, or changes a biological individual.
export function finishOrganism(root,taxon){
 const kind=CATALOG[taxon]?.kind;
 const surface=kind==='bird'?'feather':kind==='mammal'?'fur':kind==='fungus'||kind==='bivalve'||kind==='gastropod'?'shell':kind==='plant'||kind==='tree'?'leaf':kind==='worm'?'skin':'cuticle';
 root.traverse(o=>{
  if(!o.isMesh)return;
  for(const m of Array.isArray(o.material)?o.material:[o.material]){
   if(m.userData.scenicSurface)continue;
   scenicSurface(m,surface);
   m.roughness=surface==='cuticle'?.62:surface==='shell'?.72:surface==='skin'?.70:.91;
  }
 });
 return root;
}
