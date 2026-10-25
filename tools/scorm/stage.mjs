// Student staging only. SCORM/ZIP/manifest generation belongs to the vendored template.
import { readFileSync,writeFileSync,mkdirSync,rmSync,copyFileSync } from 'node:fs';
import { resolve,dirname,basename } from 'node:path';
import { fileURLToPath,pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { build } from '../scorm-template/node_modules/esbuild/lib/main.js';
import { parse } from '../scorm-template/node_modules/acorn/dist/acorn.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const web=resolve(root,'outputs/Ranger-Kompakt'),stage=resolve(root,'work/scorm/student');
const manifest=JSON.parse(readFileSync(web+'/build-manifest.json'));
const sha=data=>createHash('sha256').update(data).digest('hex');
// Evaluate the actual built data/documents, not a parallel hand-maintained curriculum.
const load=name=>import(pathToFileURL(resolve(web,manifest.modules['compact/'+name+'.js'])));
const {MATERIALS,SOURCES,MANAGEMENT_CARDS}=await load('materials');
const {renderLessonDocument}=await load('learning-documents');
const {renderStarterDocument,CLASSROOM_DOCUMENTS}=await load('classroom-start');
const studentCards=MATERIALS.map(({expected,pitfall,feedback,...card})=>({...card,expected:[]}));
const adaptText=text=>text.replace(/Beleg und Export erproben/g,'Beleg sichern und auf dem Arbeitsblatt festhalten').replace(/Datei sichern/g,'Arbeitsblatt sichern').replace(/Puffer und Export/g,'Puffer und Arbeitsblatt').replace(/Feldbuch exportieren/g,'Ergebnisse auf dem Arbeitsblatt festhalten');
const documents=Object.fromEntries(['path-a','path-b'].map(id=>[id,adaptText(renderStarterDocument(id))]));
const replacements=new Map();
const replacement=(name,contents)=>replacements.set(resolve(web,manifest.modules['compact/'+name+'.js']),contents);
replacement('materials',`export const MATERIALS=${JSON.stringify(studentCards)};\nexport const SOURCES=${JSON.stringify(SOURCES)};\nexport const MANAGEMENT_CARDS=${JSON.stringify(MANAGEMENT_CARDS)};`);
replacement('learning-documents',`const document=${JSON.stringify(adaptText(renderLessonDocument(false)))};export function renderLessonDocument(teacher=false){if(teacher)throw Error('Nur Schülerarbeitsblätter in dieser Ausgabe.');return document;}`);
replacement('classroom-start',`export const CLASSROOM_DOCUMENTS=${JSON.stringify(Object.fromEntries(['path-a','path-b'].map(id=>[id,CLASSROOM_DOCUMENTS[id]])))};const documents=${JSON.stringify(documents)};export function renderStarterDocument(id){if(!Object.hasOwn(documents,id))throw Error('Kein Schülerdokument.');return documents[id];}`);
const layoutPath=resolve(web,manifest.modules['compact/lesson-layouts.js']);
const layout=readFileSync(layoutPath,'utf8');
const teacher=parse(layout,{ecmaVersion:'latest',sourceType:'module'}).body.flatMap(n=>n.declaration?.declarations||[]).find(n=>n.id.name==='TEACHER_NOTES');
if(!teacher)throw Error('Expected named teacher notes; staging must be reviewed after source changes');
replacement('lesson-layouts',layout.slice(0,teacher.init.start)+'{}'+layout.slice(teacher.init.end));
rmSync(stage,{recursive:true,force:true});mkdirSync(stage+'/web',{recursive:true});
const adapter=resolve(web,manifest.modules['compact/storage-adapter.js']);
const bundled=await build({entryPoints:[resolve(web,manifest.modules['compact/main.js'])],bundle:true,format:'esm',target:'es2020',write:false,metafile:true,plugins:[{name:'student-materials',setup(b){
 b.onResolve({filter:/compact-storage-adapter-.*\.js$/},()=>({path:'./storage-adapter.js',external:true}));
 b.onLoad({filter:/\.js$/},args=>replacements.has(args.path)?{contents:replacements.get(args.path),loader:'js'}:null);
}}]});
const app=bundled.outputFiles[0].contents,appPath='web/ranger-'+sha(app).slice(0,12)+'.js';
writeFileSync(stage+'/'+appPath,app);copyFileSync(adapter,stage+'/web/storage-adapter.js');
const copied=[];
for(const name of Object.keys(manifest.files))if(name.startsWith('assets/')||name.endsWith('.css')||['icon.svg','THREE-LICENSE.txt','MATERIALS.json','QUELLEN-UND-RECHTE.md'].includes(name)){
 const data=readFileSync(web+'/'+name);if(sha(data)!==manifest.files[name].sha256)throw Error('Changed web input: '+name);
 mkdirSync(dirname(stage+'/'+name),{recursive:true});writeFileSync(stage+'/'+name,data);copied.push(name);
}
let html=readFileSync(web+'/index.html','utf8').replace('./'+manifest.modules['compact/main.js'],'./'+appPath);
// Keep the LMS toolbar separate from the fixed game HUD at all supported sizes.
const css=`#scorm-session{position:fixed;left:0;right:0;top:0;z-index:5;min-height:60px;font-size:12px}header{top:86px!important}#objective{top:155px}#study{top:200px}#read-sign{top:175px!important}#notice{top:250px}#performance-status{top:255px}#feeding-detail{top:175px;max-height:calc(100dvh - 280px)}@media(max-height:560px){#scorm-session{font-size:10px;gap:4px}header{top:75px!important}#feeding-detail{top:165px;max-height:calc(100dvh - 245px)}}`;
writeFileSync(stage+'/web/scorm-layout.css',css);
html=html.replace('</head>','<link rel="stylesheet" href="./web/scorm-layout.css"></head>');writeFileSync(stage+'/index.html',html);
const report={sourceCommit:manifest.sourceCommit,sourceDirty:manifest.sourceDirty,status:'BESTANDEN',source:'outputs/Ranger-Kompakt',copied,app:appPath,adapter:'web/storage-adapter.js',studentCards:studentCards.length,removedFields:['expected','pitfall','feedback'],removedTeacherNotes:true,studentDocuments:['Arbeitsblaetter','path-a','path-b'],transformedModules:[...replacements].map(([path,text])=>({path:basename(path),originalSHA256:sha(readFileSync(path)),studentSHA256:sha(text)})),inputs:Object.keys(bundled.metafile.inputs)};
writeFileSync(root+'work/scorm/staging.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
