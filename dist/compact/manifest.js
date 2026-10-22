import { TAXA } from './taxa.js';
export const WORLD_VERSION='ranger-compact-v2';
export const STORAGE_KEY='ranger-compact-fieldbook-v2';
export const MANIFEST=Object.freeze({
 id:'compact',stage:6,releaseStatus:'local preview; no deployment',actorScale:{woodpecker:.6},worldVersion:WORLD_VERSION,initialSeed:20260825,date:'2026-08-25',
 biologicalZones:['forest','saltmarsh','wadden'],transitionZones:['village','dike'],
 activeTaxa:TAXA.map(t=>t.id),
 plannedEntries:36,functionalGroups:['phytoplankton','benthic-diatoms','wood-insect-larvae','ectomycorrhiza','saprotrophs','nitrogen-process-groups'],
 activeCases:['K1','K2','K3','K4','K5'],stations:['compact-forest-core','compact-forest-edge','compact-cockle-probe','compact-mussel-pool','compact-village'],
 assets:{deer:'./assets/compact-roe-deer.glb',fox:'./assets/wildlife-fox.glb',terrain:'./assets/terrain-atlas.webp',sky:'./assets/sky-panorama.webp',wood:'./assets/boardwalk-wood.webp'},
 // No population or biology is inferred from a distant decorative silhouette.
 simulationInstances:['compact-fauna-and-resource-network'],legacyStorageKeys:['evolutionswald-fieldjournal-v2','feldbuch-quests-v1','ranger-compact-fieldbook-v1']
});
