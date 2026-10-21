import { ANIMALS, PLANTS } from './biodiversity.js';

// Deliberately small reference set. Features can be checked in the local photos;
// missing/ambiguous features in the 3D specimen justify a group/uncertain answer.
const focus=(id,features,group,resolution='taxon')=>({id,resolution,features:features.map((label,i)=>({id:`${id}:${i}`,label})),group,
 reference:(ANIMALS[id]||PLANTS[id]).source,review:'catalogue-and-local-reference; no comprehensive species validation'});
export const FOCUS_TAXA=[
 focus('fagus_sylvatica',['Glatte graue Rinde','Ovale Blätter mit weitgehend glattem, leicht gewelltem Rand'],'Buchen'),
 focus('quercus_robur',['Gelappte Blätter mit abgerundeten Lappen','Eicheln an langen Stielen, sofern sichtbar'],'Eichen'),
 focus('corylus_avellana',['Breite rundliche, doppelt gesägte Blätter','Mehrere aus der Basis auswachsende Strauchtriebe'],'Hasel'),
 focus('parus_major',['Schwarzer Kopf mit weißen Wangen','Gelber Bauch mit dunklem Längsstreifen'],'Meisen'),
 focus('cyanistes_caeruleus',['Blaue Kappe','Weiße Wangen und schmaler dunkler Augenstreif'],'Meisen'),
 focus('erithacus_rubecula',['Orangefarbene Brust und Gesichtsbereich','Braune Oberseite, kompakter Singvogelkörper'],'Singvögel'),
 focus('haematopus_ostralegus',['Langer gerader roter Schnabel','Schwarz-weißes Gefieder'],'Watvögel'),
 focus('anas_platyrhynchos',['Breiter abgeflachter Entenschnabel','Blaues Flügelfeld mit hellen Rändern, sofern sichtbar'],'Enten'),
 focus('hare',['Lange Ohren mit schwarzen Spitzen','Lange Hinterbeine'],'Hasenartige'),
 focus('oryctolagus_cuniculus',['Kürzere Ohren als beim Feldhasen','Kompakter rundlicher Körper'],'Hasenartige'),
 focus('bombus_lapidarius',['Dunkler behaarter Hummelkörper','Rotes Hinterleibsende'],'Hummeln','group'),
 focus('papaver_rhoeas',['Vier große rote Kronblätter','Dunkles Zentrum mit zahlreichen Staubblättern'],'Mohngewächse'),
 focus('trifolium_pratense',['Dreiteiliges Blatt','Rötlicher rundlicher Blütenkopf'],'Klee'),
 focus('urtica_dioica',['Gegenständige gezähnte Blätter','Längliche zugespitzte Blattspreite'],'Brennnesseln'),
 focus('galium_odoratum',['Mehrere Blätter im Quirl','Kleine weiße vierzählige Blüten'],'Labkräuter')
];
export const MISSIONS=[
 {id:'m1',version:1,title:'Wie sicher ist unsere Artenliste?',habitat:'forest',level:'Klasse 12 · gA/eA',
  question:'Welche Taxa können wir in einem kleinen Bereich begründet benennen?',
  goal:'Drei Funde anhand von jeweils zwei erkennbaren Merkmalen vergleichen; Unsicherheit begründen.',
  prior:'Merkmal, Art/Taxon und Vergleich kennen.',
  steps:['Untersuche den Wald am Einstieg (Radius 30 Modellmeter).','Sichere mit Fernglas oder Lupe drei unterschiedliche Fokustaxa im Feldbuch.','Vergleiche zwei erkennbare Merkmale mit den zugänglichen Referenzen.','Ordne zu oder begründe eine unsichere Gruppenbestimmung.'],
  help:['Die Referenzen sind vor jedem Fund erreichbar. Ein Programmname ist kein Merkmal.','Ist ein diagnostisches Merkmal verdeckt oder fehlt es im Modell, wähle die passende Gruppe und benenne diese Grenze.'],
  evidence:'Eigene Sichtung mit konkreter Individuen-ID im abgegrenzten Gebiet; keine bloße Katalogauswahl.',
  transfer:'Welche zusätzlichen Merkmale oder Aufnahmen würdest du draußen zur Absicherung benötigen?',
  limit:'Der Bereich ist künstlich bestückt. Die Liste ist kein Biodiversitätsranking. Darstellungen und Fotos zeigen nicht jedes Geschlecht/Alter.'},
 {id:'m2',version:1,title:'Zusammen gesehen – also Konkurrenz?',habitat:'meadow',level:'Klasse 12 · gA/eA',
  question:'Was lässt sich aus gemeinsamer Anwesenheit an einer Nahrungsstelle schließen?',
  goal:'Vermutung, Beobachtung, Modellprotokoll und begründete Erklärung unterscheiden.',prior:'Begrenzte Ressource und intra-/interspezifisch kennen.',
  steps:['Formuliere eine Vermutung.','Suche die beiden Nutzer an der Futterstelle.','Dokumentiere eine tatsächliche Nutzung/Wirkung oder übernimm ein ausdrücklich bezeichnetes Modellprotokoll.','Prüfe das Gegenbeispiel: Zwei Tiere nebeneinander, ohne gemeinsam genutzte Ressource.','Begründe die Zuordnung mit mehreren Belegen.'],
  help:['Räumliche Nähe allein genügt nicht. Ein Kampf ist nicht nötig.','Prüfe gemeinsame endliche Nahrung, Nutzung und Wirkung. Ein später gelesenes Ereignis ist ein Modellprotokoll, keine eigene Beobachtung.'],
  evidence:'Ein echtes Ereignis mit Partner-IDs, endlicher Ressource und Nutzung/Wirkung; Herkunft korrekt benennen.',
  transfer:'Wie würdest du eine Wirkung der Ressourcenteilung in freier Natur untersuchen?',
  limit:'Dieses Szenario steuert Begegnungen und verändert Hintergrundbestände. Es beweist keine natürlichen Populationsverhältnisse.'},
 {id:'m3',version:1,title:'Warum verändert die Tide die Nahrungssuche?',habitat:'wadden',level:'Klasse 12 · gA/eA',
  question:'Wie unterscheiden sich Wasserbedeckung und mögliche Filtration an derselben Stelle?',
  goal:'Dieselbe virtuelle Probe bei zwei definierten Wasserständen vergleichen; Erreichbarkeit und Nichtnachweis erklären.',
  prior:'Ebbe/Flut, Filtration, Beobachtung/Deutung unterscheiden.',
  steps:['Gehe zur markierten virtuellen Probenstelle 3.','Nutze die vorhandene Wattprobe bei Niedrigwasser; lege die Herzmuschel ab 3 cm frei.','Beobachte je mindestens 6 Modellsekunden bei Niedrig- und Hochwasser. Sichere beide Stationsprotokolle.','Halte dasselbe Individuum, dieselbe Stelle und Probentiefe in einem Rundgang konstant; trenne die Beobachtungsfenster zeitlich.','Trenne Freilegung, Nahrungserreichbarkeit für Vögel und mögliche Filtration.'],
  help:['Niedrigwasser legt Sediment frei; Filtration verlangt Wasserbedeckung.','Tiefer graben untersucht einen anderen Raum. Nicht gesehen bedeutet nicht abwesend.'],
  evidence:'Zwei zeitlich dokumentierte Protokolle derselben Probe/Herzmuschel/Tiefe, Phase 0 und 0,5, jeweils mindestens 6 Modellsekunden.',
  transfer:'Welche Schutz-, Sicherheits- und Genehmigungsfragen wären bei einer realen Exkursion zuerst zu klären?',
  limit:'Virtuelle Sondergenehmigung. Zufälliger Hintergrundfraß an den festen Probenorganismen ist im Kontrollareal ausgesetzt; gezielte Modellaufträge bleiben getrennt. Keine Anleitung zur realen Probeentnahme. Feste Einsetztiefen sind keine gemessenen natürlichen Tiefenbereiche.'}
];
export const missionById=id=>MISSIONS.find(m=>m.id===id);
export const freshLearning=()=>({version:1,activeMission:null,missions:{},observations:[]});

// A simulation time is the END of its observation window. The RNG's current
// seed changes during play; only initialSeed + runId identify the same world.
const TIME_EPSILON=1e-8;
export function stationRecordIssue(r){
 if(r.missionId!=='m3'||r.source!=='model-protocol'||r.evidence?.kind!=='station'||r.taxon!=='cerastoderma_edule'||r.siteId!=='probe-2'||r.partnerIds?.length!==1||!/^wadden:[1-9]\d*$/.test(r.partnerIds[0]))return 'Stationsprotokoll ohne eindeutige Herzmuschel an Probenstelle 3.';
 const scene=r.scene;
 if(scene?.habitat!=='wadden'||scene.scenario!==null||!Number.isSafeInteger(scene.seed)||scene.seed<0||(scene.runId!==undefined&&(typeof scene.runId!=='string'||!scene.runId.trim())))return 'Ungültiger Szenenkontext im Stationsprotokoll.';
 if(!Number.isFinite(r.simulationTime)||!Number.isFinite(r.duration)||r.duration<6||r.simulationTime-r.duration < -TIME_EPSILON)return 'Ungültiges Zeitfenster im Stationsprotokoll.';
 if(!Number.isFinite(r.sampleDepth)||r.sampleDepth< -1||r.sampleDepth>35||typeof r.present!=='boolean'||typeof r.evidence.activity!=='string'||!Number.isFinite(r.tidePhase)||r.tidePhase<0||r.tidePhase>1||!Number.isFinite(r.waterLevel)||Math.abs(r.waterLevel-(-.25-.65*Math.cos(r.tidePhase*2*Math.PI)))>1e-8)return 'Widersprüchliche Probenbedingungen im Stationsprotokoll.';
 if(r.present&&((r.tidePhase===0&&r.evidence.activity!=='resting')||(r.tidePhase===.5&&r.evidence.activity!=='filtering')))return 'Widersprüchlicher Muschelzustand im Stationsprotokoll.';
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

export function evaluateDetermination(answer,record){
 const target=FOCUS_TAXA.find(t=>t.id===record?.taxon);
 if(!target||record.source!=='own-observation'||record.siteId!=='forest-entry-30m'||record.scene?.habitat!=='forest')return {ok:false,message:'Sichere zunächst einen eigenen Fund eines Fokustaxons im Waldgebiet.'};
 if(answer.certainty==='uncertain'){
  const ok=answer.group===target.group&&['hidden','model-limited','photo-stage','lookalikes'].includes(answer.reason);
  return {ok,uncertain:ok,message:ok?'Begründete unsichere Gruppenbestimmung dokumentiert.':'Wähle die passende Gruppe und eine konkrete Darstellungsgrenze.'};
 }
 if(target.resolution==='group')return {ok:false,message:'Diese sichtbaren Merkmale tragen nur eine Gruppenzuordnung. Wähle Hummeln und begründe die Verwechslungsmöglichkeit.'};
 if(answer.certainty!=='certain')return {ok:false,message:'Gib die Sicherheit deiner Zuordnung an.'};
 const features=new Set(answer.features||[]);
 const ok=answer.taxon===target.id&&target.features.every(f=>features.has(f.id))&&features.size===2;
 return {ok,uncertain:false,message:ok?'Zwei passende Merkmale dokumentiert. Die Referenzzuordnung ersetzt keine allgemeine Artvalidierung.':'Prüfe Zuordnung und zwei passende Merkmale. Namen/Marker sind keine Merkmale.'};
}
export function evaluateMission(id,state,observations){
 const records=observations.filter(o=>o.missionId===id),a=state.answers||{};
 const fail=message=>({complete:false,message});
 if(id==='m1'){
  const valid=(state.determinations||[]).filter(d=>evaluateDetermination(d.answer,records.find(r=>r.id===d.recordId)).ok);
  const distinct=new Set(valid.map(d=>records.find(r=>r.id===d.recordId)?.taxon));
  return distinct.size>=3?{complete:true,message:'Drei merkmalsbezogene oder begründet unsichere Zuordnungen dokumentiert.'}:fail(`${distinct.size}/3 unterschiedliche Fokustaxa eingeordnet. Weitere Fundorte sind freiwillig.`);
 }
 if(!state.hypothesis?.trim())return fail('Halte zuerst eine eigene Vermutung fest; sie wird nicht per Wortsuche bewertet.');
 if(id==='m2'){
  const r=records.find(r=>r.id===a.recordId),e=r?.evidence;
  if(!r||e?.kind!=='competition'||!e.resourceId||!(e.resourceStock<1)||r.partnerIds?.length<2)return fail('Es fehlt ein belegter Vorgang an einer begrenzten gemeinsamen Ressource. Eine Paarsichtung genügt nicht.');
  if(a.provenance!==r.source)return fail('Unterscheide eigene Beobachtung und später gelesenes Modellprotokoll.');
  if(a.counterexample!=='insufficient')return fail('Zwei Tiere nebeneinander reichen ohne weitere Belege nicht aus.');
  const expected=new Set(r.taxa||[]).size===1?'intra':'inter';
  const claims=new Set(a.claims||[]),supported=(claims.has('same-resource')&&claims.has('finite')&&(claims.has('effect')||claims.has('reduced-access')));
  return a.relation===expected&&supported?{complete:true,message:'Belege, Herkunft und Deutung passen zusammen. Konkurrenz benötigt keinen sichtbaren Kampf.'}:fail('Prüfe gemeinsame begrenzte Ressource, Nutzung/Wirkung und die beteiligten Taxa.');
 }
 if(id==='m3'){
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
 return fail('Unbekannte Mission.');
}
