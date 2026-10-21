export const WORLD_VERSION='ranger-compact-reference-v1';
export const STORAGE_KEY='ranger-compact-fieldbook-v1';
export const MANIFEST=Object.freeze({
 id:'compact',stage:2,worldVersion:WORLD_VERSION,initialSeed:20260825,date:'2026-08-25',
 biologicalZones:['forest','saltmarsh','wadden'],transitionZones:['village','dike'],
 activeTaxa:['fagus_sylvatica','quercus_robur','galium_odoratum','urtica_dioica','capreolus_capreolus','dendrocopos_major','halimione_portulacoides','salicornia_europaea','sporobolus_anglicus'],
 plannedEntries:36,functionalGroups:['phytoplankton','benthic-diatoms','wood-insect-larvae','ectomycorrhiza','saprotrophs','nitrogen-process-groups'],
 activeCases:[],stations:['compact-forest-reference','compact-salt-reference'],
 assets:{deer:'./assets/compact-roe-deer.glb',terrain:'./assets/terrain-atlas.webp',sky:'./assets/sky-panorama.webp',wood:'./assets/boardwalk-wood.webp'},
 // No population or biology is inferred from a distant decorative silhouette.
 simulationInstances:['compact-reference-fauna'],legacyStorageKeys:['evolutionswald-fieldjournal-v2','feldbuch-quests-v1']
});
