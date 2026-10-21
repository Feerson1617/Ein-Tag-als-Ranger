import assert from 'node:assert/strict';
import { RenderBudget, GpuTimer } from '../dist/render-budget.js';
import { assetUrl } from '../dist/asset-url.js';
import { speciesPhotoHtml } from '../dist/species-photo-view.js';
import { ANIMALS } from '../dist/biodiversity.js';

const b=new RenderBudget({dpr:2,width:1366,height:1024});
assert.equal(b.ratio,1.35);assert.equal(b.targetFps,30);assert.equal(b.minRatio,1.35);
let now=0,changes=0;
function feed(b,span=1000/b.targetFps,cpu=4,gpu=5,active=true,seconds=40){for(let i=0;i<b.targetFps*seconds;i++){now+=1000/b.targetFps;if(b.sample({now,spanMs:span,cpuMs:cpu,gpuMs:gpu,active}))changes++;}}
feed(b);assert.ok(b.ratio>1.6);assert.ok(b.ratio<=Math.sqrt(4000000/(1366*1024)));const sharpEnough=b.ratio;
feed(b,65,22,50);assert.equal(b.ratio,1.35,'Auto loses previous image sharpness under load');
const min=b.ratio;feed(b,33,2,3,false);assert.equal(b.ratio,min,'An open book changes the quality budget');
b.configure('sharp');assert.equal(b.profile.shadow,2048);assert.ok(b.ratio>sharpEnough);feed(b,60,24,50);assert.equal(b.ratio,1.35);
b.configure('smooth');assert.equal(b.targetFps,60);feed(b,30,24,40);assert.equal(b.ratio,1);feed(b,1000/60,3,4);assert.ok(b.ratio>1);
const before=b.ratio;b.resize(1366,1024);assert.equal(b.ratio,before);b.resize(8000,4000);assert.equal(b.ratio,b.minRatio);
b.configure('does-not-exist');assert.equal(b.mode,'auto');const one=new RenderBudget({dpr:1,width:800,height:600});feed(one);assert.equal(one.ratio,1,'Resolution exceeds physical display scale');
const noGPU=new GpuTimer({getExtension:()=>null});for(let i=0;i<100;i++){noGPU.begin();noGPU.end();assert.equal(noGPU.poll(),null);}
let available=false,disjoint=false,deleted=0,created=0;const ext={TIME_ELAPSED_EXT:1,GPU_DISJOINT_EXT:2};
const gl={QUERY_RESULT_AVAILABLE:3,QUERY_RESULT:4,getExtension:()=>ext,createQuery:()=>({id:++created}),beginQuery(){},endQuery(){},getParameter:()=>disjoint,getQueryParameter:(q,k)=>k===3?available:5000000,deleteQuery:()=>deleted++};
const timer=new GpuTimer(gl);for(let i=0;i<100;i++){timer.begin();timer.end();timer.poll();}assert.equal(timer.pending.length,4,'GPU queue can grow without bound');
available=true;assert.equal(timer.poll(),5);assert.equal(deleted,created);timer.begin();timer.end();disjoint=true;assert.equal(timer.poll(),null);assert.equal(timer.pending.length,0);assert.equal(deleted,created);
assert.equal(assetUrl('./assets/test.jpg'),'./assets/test.jpg');let decodes=0;globalThis.__feldbuchAssetUrl=name=>{decodes++;return 'blob:decoded-'+name;};
assert.equal(assetUrl('asset://test.jpg'),'blob:decoded-test.jpg');assert.equal(decodes,1);delete globalThis.__feldbuchAssetUrl;
const escape=s=>String(s).replace(/[<>]/g,'');const html=speciesPhotoHtml(ANIMALS.fox,true,escape);assert.ok(html.includes('loading="lazy"'));assert.equal(speciesPhotoHtml(ANIMALS.fox,false,escape),'');
console.log(JSON.stringify({version:'0.18',graphics:'auto and sharp retain previous floor; smooth optional 60 FPS; idle excluded; constrained by screen pixels',adaptiveChanges:changes,gpu:'bounded asynchronous queries, no-extension fallback, disjoint invalidation',photos:'lazy entry media, undiscovered entries empty',quality:'simulation and world independent'},null,2));
