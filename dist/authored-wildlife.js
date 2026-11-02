import { readWildlifeGLB } from './wildlife-glb.js';
export { readWildlifeGLB } from './wildlife-glb.js';
import { assetUrl } from './asset-url.js';

// This deliberately supports our sealed, static, single-mesh GLBs only. The
// local Blender rig remains on the GPU, shared by all individuals of a species.
export const AUTHORED_WILDLIFE = Object.freeze({
 fox:'./assets/wildlife-fox.glb',
 hare:'./assets/wildlife-hare.glb',
 capreolus_capreolus:'./assets/wildlife-capreolus_capreolus.glb',
 sciurus_vulgaris:'./assets/wildlife-sciurus_vulgaris.glb',
 phoca_vitulina:'./assets/wildlife-phoca_vitulina.glb',
 halichoerus_grypus:'./assets/wildlife-halichoerus_grypus.glb'
});
const cache=new Map();let preparation;
export function prepareAuthoredWildlife(){return preparation??=(async()=>{
 const entries=Object.entries(AUTHORED_WILDLIFE);
 // Bound concurrent downloads. A transient connection failure can be retried
 // once; a corrupt model or missing file is still reported, never concealed.
 for(let start=0;start<entries.length;start+=2)await Promise.all(entries.slice(start,start+2).map(async([id,url])=>{
  if(cache.has(id))return;const resolved=assetUrl(url);let response;
  try{response=await fetch(resolved);}catch{response=await fetch(resolved);}
  if(!response.ok)throw new Error('Tiermodell nicht geladen: '+id);
  cache.set(id,readWildlifeGLB(await response.arrayBuffer(),id));
 }));
 })().catch(error=>{preparation=null;throw error;});}
export function authoredWildlifeGeometry(id){return cache.get(id)?.clone()||null;}
