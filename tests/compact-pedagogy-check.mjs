import assert from 'node:assert/strict';
import { writeFileSync,mkdirSync } from 'node:fs';
import { createReferenceState } from '../dist/compact/world-state.js';
import { createEcology } from '../dist/compact/ecology.js';
import { WORLD_VERSION } from '../dist/compact/manifest.js';
import { emptyLearning,assessMission } from '../dist/compact/missions.js';
import { parseCompact } from '../dist/compact/journal.js';
import { fundLabel,fundAlias,validDetermination,DETERMINATION_CHOICES } from '../dist/compact/determination.js';
import { KEY_OPTIONS } from '../dist/compact/catalog.js';
import { MATERIALS,SOURCES } from '../dist/compact/materials.js';
import { renderLessonDocument } from '../dist/compact/learning-documents.js';
import { lessonFormat } from '../dist/compact/lesson-layouts.js';
import { nitrogenModel } from '../dist/compact/learning-models.js';
const state=createReferenceState(123);createEcology(state);const treeSamples=state.trees.map(t=>({...t,taxon:t.type==='beech'?'fagus_sylvatica':'quercus_robur'}));
const book=()=>({schemaVersion:2,worldVersion:WORLD_VERSION,records:[],archives:[],previousEditions:[],learning:emptyLearning()});
const record=(p,id)=>({id,individualId:p.id,taxon:p.taxon,x:p.x,z:p.z,method:'magnified-active-model',siteId:p.x<-49?'compact-forest-core':p.x<-24?'compact-forest-edge':'compact-wadden',modelRevision:3,worldVersion:WORLD_VERSION,runId:'own-walk',initialSeed:123,window:'summer',simulationTime:10,observationSeconds:3,source:'own-observation',note:'Eigene Modellbeobachtung.',events:[]});
let passed=0;const tests=[];const test=(name,fn)=>{fn();passed++;tests.push(name);console.log('PASS '+name);};
test('F08 four plants remain opaque until a valid own determination; wrong/uncertain/group decisions never disclose species',()=>{
 for(const id of Object.keys(KEY_OPTIONS)){
  const p=[...state.plants,...treeSamples].find(p=>p.taxon===id),r=record(p,'r'),d=book();d.records=[r];assert.equal(fundLabel(r,d),fundAlias(p.id));assert(!fundLabel(r,d).includes(id));
  for(const choice of ['urtica_dioica','uncertain',KEY_OPTIONS[id].groups[0]]){const answer={recordId:'r',features:KEY_OPTIONS[id].correct,choice,limit:KEY_OPTIONS[id].limits[0]};d.learning.answers.K1={determinations:[answer]};if(choice!==id)assert.equal(fundLabel(r,d),fundAlias(p.id));}
  d.learning.answers.K1.determinations=[{recordId:'r',features:KEY_OPTIONS[id].correct,choice:id}];assert.notEqual(fundLabel(r,d),fundAlias(p.id));d.learning.answers.K1.determinations[0].features=[];assert.equal(fundLabel(r,d),fundAlias(p.id));
  for(const compare of ['galium_aparine','lamium_album','carpinus_betulus','quercus_petraea'])assert(DETERMINATION_CHOICES.some(([x])=>x===compare));
 }
});
test('F08 unseen oak transfer supports a justified group while rejecting a plausible wrong species/feature',()=>{
 const p=treeSamples.find(p=>p.taxon==='quercus_robur'),r=record(p,'transfer'),d={recordId:'transfer',features:['lobed-leaf','short-petiole'],choice:'oak-group',limit:'no-fruit'};
 assert(validDetermination(r,d));assert(!validDetermination(r,{...d,choice:'quercus_petraea'}));assert(!validDetermination(r,{...d,features:['elliptic-leaf','long-petiole']}));
});
function management(){const d=book(),p=state.ecology.actors.find(a=>a.id==='compact-redshank');d.records=[record(p,'coast'),record(state.plants.find(p=>p.taxon==='galium_odoratum'),'forest')];d.learning.answers.K5={option:'seasonal-rest',alternative:'reroute',criteria:['disturbance','access'],weights:{disturbance:7,access:3},evidenceIds:['coast'],evidenceLinks:[{recordId:'coast',criterion:'disturbance',meaning:'Der Vogel nutzt diesen Küstenbereich; Störwirkung und Saisonübertragbarkeit müssten vor Ort geprüft werden.'}],fact:'Der eigene Modellbeleg zeigt einen Küstenvogel.',value:'Ungestörte Nahrungssuche ist mir wichtig.',norm:'Besucher sollen Rückzugsräume respektieren.',consequence:'Zeitweise Ruhe beschränkt Zugang; mögliche Störung kann sinken.',uncertainty:'limited-model',factValue:'facts-and-values-separated',reasoning:'Mehrere Optionen sind vertretbar. Ich gewichte Ruhe höher, nicht absolut.'};return d;}
test('F10 every option remains possible with relevant evidence; forest-only, unrelated links and incomplete weighing fail',()=>{
 for(const option of ['reroute','seasonal-rest','raised-boardwalk']){const d=management();d.learning.answers.K5.option=option;d.learning.answers.K5.alternative=option==='reroute'?'seasonal-rest':'reroute';assert(assessMission('K5',parseCompact(JSON.stringify(d))).complete);}
 const changes=[a=>{a.evidenceIds=['forest'];a.evidenceLinks[0].recordId='forest';},a=>a.evidenceLinks[0].criterion='cost',a=>a.evidenceLinks[0].meaning='',a=>a.weights={access:0,disturbance:7},a=>a.evidenceIds=[],a=>a.norm='',a=>a.fact='',a=>a.value='',a=>a.consequence='',a=>a.factValue='facts-decide',a=>a.alternative=a.option];
 for(const change of changes){const d=management();change(d.learning.answers.K5);assert(!assessMission('K5',parseCompact(JSON.stringify(d))).complete);}
 const d=management();d.learning.answers.K5.reasoning='Beliebige nichtleere Zeichenfolge';assert(assessMission('K5',d).complete);assert(assessMission('K5',d).reviewNeeded); // text is not keyword graded
});
test('F01 new management and determination inputs reject malformed imports while legitimate wrong answers stay editable',()=>{
 for(const [key,bad]of [['weights',{access:'3'}],['evidenceLinks',[{recordId:'coast',criterion:'disturbance',meaning:{}}]],['fact',{}],['value',[]],['consequence',42]]){const d=management();d.learning.drafts.K5={...d.learning.answers.K5,[key]:bad};assert.throws(()=>parseCompact(JSON.stringify(d)));}
 const d=book();d.records=[record(state.plants.find(p=>p.taxon==='galium_odoratum'),'r')];d.learning.drafts.K1={recordId:'r',choice:'lamium_album',features:['opposite-leaves'],limit:''};assert(parseCompact(JSON.stringify(d)));
});
const zeroPools={n2:0,organic:0,ammonium:0,nitrite:0,nitrate:0},zeroRates={fixation:0,ammonification:0,assimilationNH4:0,assimilationNO3:0,nitrification1:0,nitrification2:0,denitrification:0};
test('F11 fixation first creates mineral ammonium; assimilation is a separate bounded material flow',()=>{
 const fix=nitrogenModel({days:1,initialPools:{...zeroPools,n2:2},rates:{...zeroRates,fixation:.4}});assert.equal(fix.rows[1].organic,0);assert.equal(fix.rows[1].ammonium,.4);assert.equal(fix.rows[1].n2,1.6);
 const assim=nitrogenModel({days:1,initialPools:{...zeroPools,ammonium:.2,nitrate:.3},rates:{...zeroRates,assimilationNH4:2,assimilationNO3:2}});assert.equal(assim.rows[1].organic,.5);assert.equal(assim.rows[1].ammonium,0);assert.equal(assim.rows[1].nitrate,0);assert.equal(assim.rows[1].n2,0);
});
test('F11 balance, oxygen, all-zero substrate and independently disabled fluxes remain consistent',()=>{
 for(const oxygen of [false,true])for(const input of [0,1]){const m=nitrogenModel({oxygen,input});for(const row of m.rows){assert(Math.abs(row.total-(129+row.t*input))<1e-8);assert(Object.values(row).every(n=>Number.isFinite(n)&&n>=0));}for(const f of m.fluxes){if(oxygen)assert.equal(f.denitrification,0);else{assert.equal(f.nitrification1,0);assert.equal(f.nitrification2,0);}}}
 const zero=nitrogenModel({initialPools:zeroPools});assert(zero.rows.every(r=>r.total===0));assert(zero.fluxes.every(f=>Object.values(f).slice(1).every(n=>n===0)));
 const still=nitrogenModel({rates:zeroRates});assert.deepEqual(still.rows[0],{...still.rows.at(-1),t:0});assert.throws(()=>nitrogenModel({initialPools:{ammonium:-1}}));assert.throws(()=>nitrogenModel({rates:{fixation:Infinity}}));
});
test('F09 six local resources contain actual information/data, exact sources, tasks, differentiated help and expectations',()=>{
 for(const id of ['C04','C13','C15','C21','C23','C24']){const c=MATERIALS.find(c=>c.id===id);assert(c.tables?.length);assert(c.info?.length>=2);assert(c.helps?.length>=2);assert(c.expected.length>=3);assert(c.task.length>100);assert(c.pitfall&&c.feedback&&c.limit);for(const key of c.sources)assert(SOURCES[key]?.url.startsWith('https://'));}
 const c=MATERIALS.find(c=>c.id==='C04');assert.deepEqual(c.tables[0].rows.map(r=>r.slice(1)),[['2','5','5'],['x','6','8']]);assert(MATERIALS.find(c=>c.id==='C13').tables[0].rows.every(r=>r.length===3));assert(MATERIALS.find(c=>c.id==='C23').tables[0].rows[0][2].includes('20'));assert(MATERIALS.find(c=>c.id==='C24').tables[0].rows.some(r=>r[0]==='Deutschland'&&r[1]==='4.840599716'));
});
test('F13 all 25 worksheets offer appropriate product forms and teacher feedback without external requests',()=>{
 const student=renderLessonDocument(false),teacher=renderLessonDocument(true);assert.equal((student.match(/<article /g)||[]).length,25);assert.equal((teacher.match(/Typische Fehlvorstellung/g)||[]).length,25);assert.equal((teacher.match(/<strong>Rückmeldung:/g)||[]).length,25);assert.equal(lessonFormat(MATERIALS[3]),'measurement');assert.equal(lessonFormat(MATERIALS[13]),'niche');assert.equal(lessonFormat(MATERIALS[17]),'graph');assert.equal(lessonFormat(MATERIALS[19]),'flows');assert.equal(lessonFormat(MATERIALS[21]),'decision');assert(new Set(MATERIALS.map(lessonFormat)).size>=8);assert(!/<(?:img|script|link)\b/.test(student));assert(student.includes('Ebene 3 braucht das ausgefüllte Arbeitsprodukt'));
});
const out=process.argv[2];if(out){mkdirSync(out,{recursive:true});writeFileSync(out+'/pedagogy-result.json',JSON.stringify({passed,tests,scope:'Model, validation and HTML-source checks only. No classroom learning-effect or physical iPad claim.'},null,2)+'\n');}console.log(JSON.stringify({passed}));
