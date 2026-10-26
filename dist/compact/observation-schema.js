import { BOUNDS,zoneAt } from './layout.js';
import { WINDOWS,CATALOG } from './catalog.js';
import { identityInventory } from './evidence.js';
import { MODEL_REVISION } from './manifest.js';
import { originIssue } from './observation-context.js';
export const observationSite=(x)=>x<-24?(x<-49?'compact-forest-core':'compact-forest-edge'):'compact-'+zoneAt(x);
export function sceneFieldsIssue(row,{allowUndated=false}={}){
 if(row.window!==undefined&&(typeof row.window!=='string'||!Object.hasOwn(WINDOWS,row.window)))return 'Unbekanntes Beobachtungsfenster.';
 if(row.modelRevision!==undefined&&!Number.isInteger(row.modelRevision))return 'Ungültiger Modellstand.';
 if(!Number.isSafeInteger(row.initialSeed)||row.initialSeed<0||row.initialSeed>4294967295||typeof row.runId!=='string'||!row.runId||row.runId.length>200||!WINDOWS[row.window||'summer']||(!allowUndated||row.simulationTime!==undefined)&&(!Number.isFinite(row.simulationTime)||row.simulationTime<0||row.simulationTime>1e8)||!Number.isInteger(row.modelRevision??1)||(row.modelRevision??1)<1||(row.modelRevision??1)>MODEL_REVISION)return 'Ungültiger Rundgang, Modellstand oder Beobachtungszeitpunkt.';
 return originIssue(row);
}
export function observationIssue(row){
 const scene=sceneFieldsIssue(row);if(scene)return scene;
 if(!['binocular','magnifier','magnified-active-model'].includes(row.method))return 'Unbekannte Beobachtungsmethode.';
 if(!Number.isFinite(row.x)||!Number.isFinite(row.z)||row.x<BOUNDS.west||row.x>BOUNDS.east||row.z<BOUNDS.south||row.z>BOUNDS.north)return 'Beobachtungsort liegt außerhalb der Modellwelt.';
 if(row.siteId!==observationSite(row.x))return 'Zone, Standort und Koordinaten widersprechen sich.';
 const a=identityInventory(row.initialSeed,row.modelRevision??1).individuals.get(row.individualId);
 if(!a||a.taxon!==row.taxon)return 'Individuen-ID und Taxon passen nicht zur gespeicherten Modellwelt.';
 const kind=CATALOG[row.taxon].kind;
 if(kind==='plant'||kind==='tree'||['fomes_fomentarius','cerastoderma_edule','mytilus_edulis','arenicola_marina','hediste_diversicolor','aphidoidea'].includes(row.taxon)||row.taxon==='aglais_io'&&a.stage==='caterpillar'){
  const tolerance=kind==='tree'?(a.r||.3)+.04:.03;
  if(Math.hypot(row.x-a.x,row.z-a.z)>tolerance)return 'Ortsfeste Individuen-ID und gespeicherter Standort passen nicht zusammen.';
 }else if(['recurvirostra_avosetta','platalea_leucorodia','tringa_totanus','haematopus_ostralegus','crangon_crangon','carcinus_maenas','peringia_ulvae'].includes(row.taxon)){
  if(row.x<18||row.z<-30||row.z>40)return 'Bewegliches Küstenindividuum außerhalb seines Modellraums.';
 }else if(row.x>=-24)return 'Waldindividuum außerhalb seines Modellraums.';
 return null;
}
