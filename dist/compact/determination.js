import { KEY_OPTIONS,CATALOG } from './catalog.js';
export const DETERMINATION_CHOICES=[
 ['galium_odoratum','Waldmeister'],['galium_aparine','Kletten-Labkraut (Vergleich)'],['urtica_dioica','Große Brennnessel'],['lamium_album','Weiße Taubnessel (Vergleich)'],['fagus_sylvatica','Rotbuche'],['carpinus_betulus','Hainbuche (Vergleich)'],['quercus_robur','Stieleiche'],['quercus_petraea','Traubeneiche (Vergleich)'],
 ['galium-group','Nur Gruppe: Labkräuter'],['urtica-group','Nur Gruppe: Brennnesseln'],['broadleaf-tree','Nur Gruppe: Laubbaum'],['oak-group','Nur Gruppe: Eichen'],['uncertain','Nicht sicher bestimmbar']
];
export const OBSERVABLE_FEATURES=['leaf-whorls','narrow-leaves','opposite-leaves','serrated-edge','smooth-edge','rough-bark','smooth-bark','elliptic-leaf','lobed-leaf','short-petiole','long-petiole'];
export function validDetermination(r,d){const key=KEY_OPTIONS[r?.taxon];return !!(key&&Array.isArray(d?.features)&&new Set(d.features).size===d.features.length&&d.features.length>=2&&d.features.every(f=>key.correct.includes(f))&&(d.choice===r.taxon||d.choice==='uncertain'&&key.limits.includes(d.limit)||key.groups.includes(d.choice)&&key.limits.includes(d.limit)));}
export function fundAlias(individual){let n=2166136261;for(const c of String(individual)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return 'Unbekannter Fund '+(n>>>0).toString(16).padStart(8,'0').toUpperCase();}
export function isDetermined(p,data){return (data.learning?.answers?.K1?.determinations||[]).some(d=>{const r=data.records.find(r=>r.id===d.recordId);return r?.individualId===(p.individualId||p.id)&&d.choice===p.taxon&&validDetermination(r,d);});}
export function fundLabel(p,data){if(!p)return 'Nicht zugeordneter Fund';return KEY_OPTIONS[p.taxon]&&!isDetermined(p,data)?fundAlias(p.individualId||p.id):CATALOG[p.taxon]?.name.split(' – ')[0]||p.taxon;}
export function visibleIdentity(p){return KEY_OPTIONS[p.taxon]?fundAlias(p.individualId||p.id):p.individualId||p.id;}
