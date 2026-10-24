import assert from 'node:assert/strict';
import {growthModel} from '../dist/compact/learning-models.js';

const checks=[];
function check(name,fn){fn();checks.push(name);console.log('PASS '+name);}

check('N03: a closed empty population stays exactly zero at both rate and time limits',()=>{
 for(const rate of [0,2])for(const days of [1,365]){
  const parameters={initial:0,rate,capacity:100,days},model=growthModel(parameters);
  assert.deepEqual(model.parameters,parameters);
  assert.equal(model.rows.length,days+1);
  assert.deepEqual(model.rows.map(r=>r.t),Array.from({length:days+1},(_,t)=>t));
  for(const row of model.rows){
   assert.equal(row.exponential,0);assert.equal(row.logistic,0);
   assert.ok(Object.values(row).every(Number.isFinite));
  }
  assert.deepEqual(JSON.parse(JSON.stringify(model)).rows,model.rows,'Export must not contain null instead of non-finite numbers');
 }
});

check('N03: zero population does not bypass invalid parameters or fractional time',()=>{
 const invalid=[
  [{rate:NaN},/Ungültiger Parameter r/],
  [{rate:-1},/Ungültiger Parameter r/],
  [{capacity:NaN},/Ungültiger Parameter K/],
  [{capacity:0},/Ungültiger Parameter K/],
  [{capacity:-1},/Ungültiger Parameter K/],
  [{days:NaN},/Ungültiger Parameter Tage/],
  [{days:Infinity},/Ungültiger Parameter Tage/],
  [{days:-1},/Ungültiger Parameter Tage/],
  [{days:0},/Ungültiger Parameter Tage/],
  [{days:1.5},/Ganze Modelltage/],
  [{days:364.5},/Ganze Modelltage/],
 ];
 for(const [parameters,error]of invalid)assert.throws(()=>growthModel({initial:0,...parameters}),error);
 for(const initial of [NaN,Infinity,-1])assert.throws(()=>growthModel({initial}),/Ungültiger Parameter N₀/);
});

check('N03: positive exponential overflow is still rejected with a useful explanation',()=>{
 for(const initial of [1,100,1e6])assert.throws(()=>growthModel({initial,rate:2,capacity:100,days:365}),/Exponentielles Wachstum.*Modellbereich.*kürzeren Zeitraum/);
 const beforeOverflow=growthModel({initial:1,rate:2,capacity:100,days:354});
 assert.ok(beforeOverflow.rows.every(r=>Object.values(r).every(Number.isFinite)));
 assert.ok(beforeOverflow.rows.at(-1).exponential>1e300);
});

check('N03: ordinary positive growth and analytic equilibria retain their meaning',()=>{
 for(const initial of [1,10,100]){
  const constant=growthModel({initial,rate:0,capacity:100,days:365});
  assert.ok(constant.rows.every(r=>r.exponential===initial&&r.logistic===initial));
 }
 const atCapacity=growthModel({initial:100,rate:2,capacity:100,days:20});
 assert.ok(atCapacity.rows.every(r=>r.logistic===100));
 const increasing=growthModel({initial:10,rate:.25,capacity:100,days:20});
 assert.equal(increasing.rows[0].exponential,10);assert.equal(increasing.rows[0].logistic,10);
 for(let i=1;i<increasing.rows.length;i++){
  assert.ok(increasing.rows[i].exponential>increasing.rows[i-1].exponential);
  assert.ok(increasing.rows[i].logistic>increasing.rows[i-1].logistic&&increasing.rows[i].logistic<100);
 }
});

console.log(JSON.stringify({suite:'compact-growth-boundary',passed:checks.length,groups:checks.length,checks}));
