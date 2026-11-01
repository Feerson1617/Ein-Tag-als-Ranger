import assert from 'node:assert/strict';
import {frameSteps}from'../dist/compact/frame-steps.js';
import {createReferenceState,stepReference}from'../dist/compact/world-state.js';
import {createEcology,stepEcology}from'../dist/compact/ecology.js';
import {ObservationClock}from'../dist/observation-clock.js';
for(const fps of[4,15,60]){
 const steps=frameSteps(1/fps,true,false);
 assert(Math.abs(steps.reduce((a,b)=>a+b,0)-1/fps)<1e-12);
 assert(steps.every(t=>t>0&&t<=.065));
}
assert.deepEqual(frameSteps(30,false,false),[]);
assert.equal(frameSteps(30,true,false).length,4);
assert.equal(frameSteps(.5,true,false).reduce((a,b)=>a+b,0),.25);
assert.deepEqual(frameSteps(.5,true,true),[.065]);
const state=createReferenceState(20260825);createEcology(state);
for(let i=0;i<240;i++)for(const dt of frameSteps(.25,true,false)){stepReference(state,dt,{x:0,z:0});stepEcology(state,dt,{x:0,z:0});}
assert(Math.abs(state.time-60)<1e-8,'4 FPS walking retains 60 elapsed model seconds');
for(const resource of Object.values(state.ecology.resources)){assert(resource.amount>=0);assert(resource.amount<=resource.initial);}
for(const event of state.ecology.events){assert(event.startedAt<=event.endedAt);assert(event.endedAt<=state.time+1e-8);}
const clock=new ObservationClock();assert.equal(clock.step('bird',1000),0);assert.equal(clock.step('bird',1500),.5);clock.reset();assert.equal(clock.step('bird',2000),0);
console.log(JSON.stringify({passed:true,checks:['unchanged <=65ms steps','elapsed low-FPS walking','bounded stall recovery','no paused backlog','no observing catch-up','60s finite-resource simulation','independent active observation clock']}));
