import assert from 'node:assert/strict';
import { mkdirSync,writeFileSync } from 'node:fs';
import { MATERIALS,SOURCES } from '../dist/compact/materials.js';
import { renderLessonDocument } from '../dist/compact/learning-documents.js';
import { lessonFormat } from '../dist/compact/lesson-layouts.js';

const get=id=>MATERIALS.find(c=>c.id===id);
const plain=c=>JSON.stringify(c);
const checks=[];
const test=(name,fn)=>{fn();checks.push(name);console.log('PASS '+name);};
const student=renderLessonDocument(false),teacher=renderLessonDocument(true);
const article=(html,id)=>html.split(`<article data-card="${id}"`)[1]?.split('</article>')[0];
const escaped=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('F09 new data and their source/context remain available offline in both generated document variants',()=>{
 for(const id of ['C01','C15','C17']){
  const c=get(id);assert(c.tables.length);assert(c.info.length>=2);assert(c.helps.length>=2);assert(c.expected.length>=3);
  for(const html of [student,teacher]){
   const card=article(html,id);assert(card);
   for(const table of c.tables){assert(card.includes(escaped(table.caption)));for(const row of table.rows)for(const cell of row)assert(card.includes(escaped(cell)),`${id}: missing data cell`);}
   for(const key of c.sources){assert(SOURCES[key]?.url.startsWith('https://'));assert(card.includes(escaped(SOURCES[key].url)),`${id}: missing source`);}
   assert(card.includes(escaped(c.limit)));assert(card.includes('Leistungsnachweis: □ noch nicht erhoben'));
  }
  for(const expectation of c.expected)assert(article(teacher,id).includes(escaped(expectation)));
 }
 assert(!/<(?:img|script|link)\b/.test(student));
});

test('C01 interval calculation agrees with the teacher result, with explicit missing water-balance measurements',()=>{
 const c=get('C01'),rows=c.tables[0].rows;
 const range=name=>rows.find(r=>r[0]===name)[1].split('–').map(Number).map(x=>x*10);
 const temperate=range('Gemäßigter Laubwald'),boreal=range('Borealer Wald');
 assert.deepEqual(temperate,[750,1500]);assert.deepEqual(boreal,[400,1000]);
 const overlap=[Math.max(temperate[0],boreal[0]),Math.min(temperate[1],boreal[1])];
 assert(c.expected.join(' ').includes(overlap.join('–')+' mm/Jahr'));
 assert(plain(c).includes('Bodenoberfläche'));assert(plain(c).includes('ET'));assert(plain(c).includes('Speicheränderung'));
 assert.equal(lessonFormat(c),'climate');assert(article(student,'C01').includes('P in mm/Jahr / Spanne'));
});

test('C15 uses two named species and study landscapes while keeping morphology and ecological role distinct',()=>{
 const c=get('C15'),text=plain(c);
 for(const term of ['Steatornis caripensis','Rousettus aegyptiacus','Venezuela','Dakhla','Nahrung','Raumnutzung','Aktivität','Homologie','Konvergenz','Bezugsmerkmal'])assert(text.includes(term),term);
 assert(c.sources.includes('phylogeny'));assert(c.sources.includes('oilbird'));assert(c.sources.includes('fruitbat'));
 assert.equal(c.tables[1].rows.length,2);assert(c.task.includes('nicht ableiten'));
 assert(!c.task.includes('widerlege')); // Lack of evidence for equal dispersal is not evidence of inequality.
});

test('C17 distinguishes density decline, modeled juvenile survival and unresolved fecundity instead of inventing a common rate',()=>{
 const c=get('C17'),text=plain(c),survival=c.tables[1].rows;
 const [,start,end]=survival[0][1].match(/(\d+) → (\d+) Individuen\/m²/).map(Number);
 const remaining=(100*end/start).toFixed(1).replace('.',','),loss=(100*(start-end)/start).toFixed(1).replace('.',',');
 assert(c.expected[0].includes(remaining+' %'));assert(c.expected[0].includes(loss+' %'));
 const rates=[...survival[1][1].matchAll(/(\d+) %/g)].map(m=>Number(m[1]));
 assert(c.expected[1].includes((rates[0]-rates[1])+' Prozentpunkte'));
 for(const term of ['Gelbkörper','Ovulation','15–17 Monate','8 Monate','keine individuelle Überlebensquote','10e4-10e5','Weibchenbezug','keine gemessenen Pflegetage'])assert(text.includes(term),term);
 assert(c.limit.includes('Keine vollständige Primärzahlenmatrix'));assert.equal(lessonFormat(c),'lifehistory');
 assert(article(student,'C17').includes('Ort / Zeitraum / Methode'));
});

test('The previous six data cases and the three separate evidence levels remain present',()=>{
 for(const id of ['C04','C13','C15','C21','C23','C24']){assert(get(id).tables.length);assert(article(student,id));assert(article(teacher,id));}
 assert.equal((student.match(/<article /g)||[]).length,25);
 assert(student.includes('Ebene 3 braucht das ausgefüllte Arbeitsprodukt'));
 assert(student.includes('ETS-Plan 2025/26 ist mangels zugänglichem Original nicht vollständig verifiziert'));
 assert(student.includes('Virtuelle Tests bescheinigen keine reale Geräteführung oder Exkursion'));
});

const result={passed:checks.length,checks,scope:'Data/context/rendering regression only; no proof of physical device skill, fieldwork or learning outcomes. C17 fecundity interpretation and ETS original access remain open.'};
if(process.argv[2]){mkdirSync(process.argv[2],{recursive:true});writeFileSync(process.argv[2]+'/material-depth-result.json',JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify(result));
