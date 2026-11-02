// A simulation time is the END of its observation window. The RNG's current
// seed changes during play; only initialSeed + runId identify the same world.
const TIME_EPSILON=1e-8;
export function stationRecordIssue(r){
 if(r.missionId!=='m3'||r.source!=='model-protocol'||r.evidence?.kind!=='station'||r.taxon!=='cerastoderma_edule'||r.siteId!=='probe-2'||r.partnerIds?.length!==1||!/^wadden:[1-9]\d*$/.test(r.partnerIds[0]))return 'Stationsprotokoll ohne eindeutige Herzmuschel an Probenstelle 3.';
 const scene=r.scene;
 if(scene?.habitat!=='wadden'||scene.scenario!==null||!Number.isSafeInteger(scene.seed)||scene.seed<0||(scene.runId!==undefined&&(typeof scene.runId!=='string'||!scene.runId.trim())))return 'Ungültiger Szenenkontext im Stationsprotokoll.';
 if(!Number.isFinite(r.simulationTime)||!Number.isFinite(r.duration)||r.duration<0||r.simulationTime-r.duration < -TIME_EPSILON)return 'Ungültiges Zeitfenster im Stationsprotokoll.';
 if(!Number.isFinite(r.sampleDepth)||r.sampleDepth< -1||r.sampleDepth>35||typeof r.present!=='boolean'||typeof r.evidence.activity!=='string'||!Number.isFinite(r.tidePhase)||r.tidePhase<0||r.tidePhase>1||!Number.isFinite(r.waterLevel)||Math.abs(r.waterLevel-(-.25-.65*Math.cos(r.tidePhase*2*Math.PI)))>1e-8)return 'Widersprüchliche Probenbedingungen im Stationsprotokoll.';
 return null;
}
export function stationProtocolsIssue(records){
 const runs=new Map(),individuals=new Map();
 for(const r of records.filter(r=>r.evidence?.kind==='station')){
  const issue=stationRecordIssue(r);if(issue)return issue;
  // Legacy records are retained, but cannot establish continuity across loads.
  if(!r.scene.runId)continue;
  const run=r.scene.runId,context=`${r.scene.habitat}:${r.scene.seed}`;
  if(runs.has(run)&&runs.get(run)!==context)return 'Widersprüchlicher Szenenkontext für denselben Modelldurchlauf.';
  runs.set(run,context);
  const key=JSON.stringify([run,r.partnerIds[0]]);
  if(!individuals.has(key))individuals.set(key,[]);individuals.get(key).push(r);
 }
 for(const windows of individuals.values()){
  windows.sort((a,b)=>(a.simulationTime-a.duration)-(b.simulationTime-b.duration));
  for(let i=1;i<windows.length;i++)if(windows[i].simulationTime-windows[i].duration < windows[i-1].simulationTime-TIME_EPSILON)return 'Überlappende Stationsprotokolle desselben Individuums: Zeitfolge widersprüchlich.';
 }
 return null;
}

export function evaluateStationComparison(state,observations){
 const records=observations.filter(o=>o.missionId==='m3'),a=state.answers||{},fail=message=>({complete:false,message});
 if(!state.hypothesis?.trim())return fail('Halte zuerst eine eigene Vermutung fest; sie wird nicht per Wortsuche bewertet.');
  const low=records.find(r=>r.id===a.lowId),high=records.find(r=>r.id===a.highId);
  if(!low||!high||low.id===high.id||low.tidePhase!==0||high.tidePhase!==.5)return fail('Wähle zwei Protokolle bei definiertem Niedrig- und Hochwasser.');
  const issue=stationProtocolsIssue(records);if(issue)return fail(issue);
  if(stationRecordIssue(low)||stationRecordIssue(high))return fail('Verwende vollständige, widerspruchsfreie Stationsprotokolle.');
  if(low.partnerIds[0]!==high.partnerIds[0])return fail('Niedrig- und Hochwasser müssen dasselbe konkrete Individuum betreffen.');
  if(!low.scene.runId||low.scene.runId!==high.scene.runId||low.scene.seed!==high.scene.seed)return fail('Vergleiche dieselbe Szene in einem Modelldurchlauf. Ältere Protokolle ohne Durchlaufkennung bleiben erhalten; beobachte für diesen Vergleich erneut.');
  if(low.siteId!=='probe-2'||low.siteId!==high.siteId||low.taxon!=='cerastoderma_edule'||low.taxon!==high.taxon||low.sampleDepth!==high.sampleDepth||low.duration<6||high.duration<6||!low.present||!high.present||low.scene?.scenario||high.scene?.scenario)return fail('Vergleiche dieselbe freigelegte Herzmuschel, Stelle und Tiefe; beobachte jeweils mindestens 6 Modellsekunden.');
  if(low.source!=='model-protocol'||high.source!=='model-protocol'||low.evidence?.kind!=='station'||high.evidence?.kind!=='station'||low.evidence?.activity!=='resting'||high.evidence?.activity!=='filtering')return fail('Die Stationsprotokolle müssen eine lebende Muschel im Ruhezustand bei Niedrigwasser und bei Filtration unter Wasser zeigen.');
  const ok=a.filtration==='covered'&&a.access==='exposed'&&a.absence==='not-detected'&&a.depth==='different-space';
  return ok?{complete:true,message:'Wasserbedeckung, Erreichbarkeit, Untersuchungsraum und Nichtnachweis getrennt erklärt.'}:fail('Trenne Wasserbedeckung/Filtration, Freilegung/Erreichbarkeit und Nichtnachweis/Abwesenheit.');
}
