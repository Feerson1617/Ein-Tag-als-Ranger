const birds=['recurvirostra_avosetta','tringa_totanus','platalea_leucorodia','haematopus_ostralegus'];
const plants=['halimione_portulacoides','salicornia_europaea','festuca_rubra','puccinellia_maritima','sporobolus_anglicus','limonium_vulgare'];
export const CRITERIA=[['access','Zugang / Teilhabe'],['disturbance','Störungsarmut'],['cost','Aufwand / Unterhaltung'],['coastal-safety','Küstenschutz / Anpassungsraum']];
// This checks the domain of a claimed connection, never the quality of its prose
// or whether a particular construction is safe. Cost requires external figures.
export function relevantCriteria(record){return birds.includes(record?.taxon)?['disturbance','access']:plants.includes(record?.taxon)?['coastal-safety','access']:[];}
export function managementIssue(a,records,perspectives=[]){
 const options=['reroute','seasonal-rest','raised-boardwalk'];
 if(!options.includes(a.option)||!options.includes(a.alternative)||a.option===a.alternative)return 'Wähle eine Option und eine andere begründbare Alternative.';
 if(!Array.isArray(a.criteria)||new Set(a.criteria).size<2||a.criteria.some(c=>!CRITERIA.some(([id])=>id===c)))return 'Mindestens zwei konkurrierende Kriterien auswählen.';
 if(a.criteria.filter(c=>Number.isFinite(a.weights?.[c])&&a.weights[c]>0&&a.weights[c]<=10).length<2)return 'Mindestens zwei ausgewählte Kriterien positiv gewichten (0–10).';
 if(!a.evidenceLinks?.some(link=>a.criteria.includes(link.criterion)&&a.evidenceIds?.includes(link.recordId)&&relevantCriteria(records.find(r=>r.id===link.recordId)).includes(link.criterion)&&typeof link.meaning==='string'&&link.meaning.trim()))return 'Verknüpfe einen eigenen Küstenbeleg mit einem passenden Kriterium und erläutere seine Bedeutung. Ein Waldmeisterfund allein reicht dafür nicht.';
 if(!['fact','value','norm','consequence','reasoning'].every(k=>typeof a[k]==='string'&&a[k].trim()))return 'Sachinformation, eigener Wert, Norm, erwartete Folge und Begründung getrennt ausführen.';
 if(!['seasonal-transfer','limited-model','cost-uncertain'].includes(a.uncertainty)||a.factValue!=='facts-and-values-separated')return 'Unsicherheit und Trennung von Fakten und Werten fehlen.';
 return null;
}
