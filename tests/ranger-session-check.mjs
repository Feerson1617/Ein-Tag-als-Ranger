import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {switchFullscreen} from '../dist/ranger-controls.js';
const source=fs.readFileSync(new URL('../dist/expedition.js',import.meta.url),'utf8'),reset=source.match(/function resetControls\(\)\{[\s\S]*?\n\}/)?.[0];assert.ok(reset);
function pointerSurface(held){return {held,released:[],hasPointerCapture(id){return this.held.has(id);},releasePointerCapture(id){assert.ok(this.held.has(id));this.held.delete(id);this.released.push(id);}};}
const canvas=pointerSurface(new Set([0])),stick=pointerSurface(new Set([14])),thumb={style:{transform:'translate(20px, -30px)'}},keys=new Set(['w','shift']),observer={speed:7.5};
const context=vm.createContext({canvas,keys,observer,$:id=>id==='joystick'?stick:thumb});vm.runInContext('let move={x:.4,y:1},drag={id:0},joystickPointer=14,touchDistance=240;'+reset,context);
vm.runInContext('resetControls()',context);assert.equal(keys.size,0);assert.equal(observer.speed,0);assert.equal(thumb.style.transform,'');assert.deepEqual(canvas.released,[0]);assert.deepEqual(stick.released,[14]);assert.equal(vm.runInContext('drag===null&&joystickPointer===null&&touchDistance===null&&move.x===0&&move.y===0',context),true);
vm.runInContext('resetControls()',context);assert.equal(canvas.released.length,1);assert.equal(stick.released.length,1,'Repeated blur or panel event releases capture twice');
vm.runInContext('drag={id:72};joystickPointer=81;resetControls()',context);assert.equal(canvas.released.length,1,'A capture no longer owned must not be released');
const doc={fullscreenElement:null,documentElement:{requestFullscreen(){doc.fullscreenElement=this;return Promise.resolve();}},exitFullscreen(){doc.fullscreenElement=null;return Promise.resolve();}};
assert.equal(await switchFullscreen(doc,20),true);assert.equal(await switchFullscreen(doc,20),false);
await assert.rejects(switchFullscreen({documentElement:{}},10),/unavailable/);
await assert.rejects(switchFullscreen({documentElement:{requestFullscreen:()=>new Promise(()=>{})}},10),/unavailable/,'An embedded fullscreen request must not hang forever');
await assert.rejects(switchFullscreen({documentElement:{requestFullscreen:()=>Promise.reject(new Error('Permission denied'))}},10),/Permission denied/);
console.log(JSON.stringify({input:'Held keys, zero-valued pointer ID, movement speed, both captures, thumb and pinch cleared',repeat:'Blur followed by panel/visibility cleanup is idempotent',fullscreen:'Enter, exit, missing API, rejected promise and never-settling embedded request',scope:'Actual reset function exercised; browser context restoration also tested interactively'},null,2));
