import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createReferenceState as oldState} from './fixtures/historical-f921468/dist/compact/world-state.js';
import {createEcology as oldEcology} from './fixtures/historical-f921468/dist/compact/ecology.js';
const commit='f92146876f4364a4fb78d30d9e9b190bbb7dc1f4';
const root=new URL('../',import.meta.url),snapshot=new URL('./fixtures/historical-f921468/',import.meta.url),manifest=JSON.parse(readFileSync(new URL('GIT-SOURCE.json',snapshot)));
assert.equal(manifest.commit,commit);
const gitCommitAvailable=spawnSync('git',['cat-file','-e',commit+'^{commit}'],{cwd:fileURLToPath(root),stdio:'ignore'}).status===0;
for(const [path,expected] of Object.entries(manifest.files)){
 const bytes=readFileSync(new URL(path,snapshot));assert.equal(createHash('sha256').update(bytes).digest('hex'),expected.sha256,path);
 assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes])).digest('hex'),expected.gitBlob,path+' Git blob');
 if(gitCommitAvailable)assert.deepEqual(bytes,execFileSync('git',['show',commit+':'+path],{cwd:fileURLToPath(root)}),path+' must match the unchanged Git commit');
}
// 1e-10 model metres/radians is far below the 0.03-metre tightest spatial
// import tolerance, but accommodates libm last-bit differences across engines.
// No rounding changes IDs, object keys, array order, count or assignments.
export const historicalTolerance={absolute:1e-10,relative:4*Number.EPSILON};
export function compareHistorical(actual,expected,path='$',stats={numeric:0,exact:0,maxAbsoluteError:0}){
 assert.equal(typeof actual,typeof expected,path+' type');
 if(typeof expected==='number'){
  assert(Number.isFinite(actual)&&Number.isFinite(expected),path+' finite');const error=Math.abs(actual-expected),tolerance=historicalTolerance.absolute+historicalTolerance.relative*Math.max(Math.abs(actual),Math.abs(expected));
  assert(error<=tolerance,`${path}: ${actual} versus historical ${expected}, error ${error} > ${tolerance}`);stats.numeric++;stats.maxAbsoluteError=Math.max(stats.maxAbsoluteError,error);
 }else if(expected&&typeof expected==='object'){
  assert.equal(Array.isArray(actual),Array.isArray(expected),path+' structure');assert.deepEqual(Object.keys(actual),Object.keys(expected),path+' exact keys/count/order');
  for(const key of Object.keys(expected))compareHistorical(actual[key],expected[key],path+'.'+key,stats);
 }else{assert.equal(actual,expected,path+' exact discrete value');stats.exact++;}
 return stats;
}
export function unchangedHistoricalState(seed,revision){const s=oldState(seed,revision);oldEcology(s);return s;}
export const historicalSource={commit,modules:Object.keys(manifest.files).length,gitCommitAvailable,verification:gitCommitAvailable?'Snapshot bytes compared directly with immutable git show plus SHA256/Git blob identity':'Exact pinned old-source closure verified by SHA256 and Git blob identity; old commit absent from shallow checkout',tolerance:historicalTolerance};
