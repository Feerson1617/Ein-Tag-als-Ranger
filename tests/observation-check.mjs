import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import { ExpeditionEcology } from '../dist/field-ecology.js';
import { ANIMALS } from '../dist/biodiversity.js';
import { projectFocusBounds } from '../dist/focus-marker.js';
import { advanceMotion, motionShader } from '../dist/wildlife-motion.js';
const sim=new ExpeditionEcology('meadow',7),sign={x:0,z:0,r:.65,height:1.6,baseY:.14,type:'board'};
const testSpecies=['fox','capreolus_capreolus','parus_major','bombus_lapidarius'];
sim.agents=sim.agents.filter(a=>testSpecies.includes(a.species));for(const id of testSpecies)if(!sim.agents.some(a=>a.species===id))sim.spawn(id,0,0);sim.agents.forEach(a=>{a.x=0;a.z=0;a.homeX=0;a.homeZ=0;a.flight=ANIMALS[a.species].type==='insect'?.5:0;});
sim.setBlockers([sign]);
for(const a of sim.agents){const s=ANIMALS[a.species];assert.equal(sim.overlapsBlocker(a.x,a.z,s,a,sign),false);assert.equal(sim.passable(0,0,s,a),false);}
const bird=sim.agents.find(a=>a.species==='parus_major');
assert.equal(sim.passable(0,0,ANIMALS.parus_major,{...bird,flight:2.2}),true);
assert.equal(sim.passable(0,0,ANIMALS.parus_major,{...bird,flight:.9}),false);
const fox=sim.agents.find(a=>a.species==='fox');fox.alive=false;fox.homeX=fox.homeZ=0;
sim.update(.1,null);assert.equal(sim.overlapsBlocker(fox.x,fox.z,ANIMALS.fox,fox,sign),false);
for(const a of sim.agents){a.activity='walking';a.target={x:-a.x*2,z:-a.z*2};a.stateTime=1000;}
for(let n=0;n<800;n++){sim.update(.05,null);for(const a of sim.agents)if(a.alive)assert.equal(sim.overlapsBlocker(a.x,a.z,ANIMALS[a.species],a,sign),false);}
const camera=new THREE.PerspectiveCamera(40,4/3,.05,100);camera.position.set(0,1.7,5);camera.lookAt(0,.5,0);camera.updateMatrixWorld();
const centerBox=new THREE.Box3(new THREE.Vector3(-.2,.1,-.1),new THREE.Vector3(.2,.7,.1));
const rect=projectFocusBounds(centerBox,camera,1024,768);assert.ok(rect&&rect.width>=36&&rect.height>=36);assert.ok(rect.left>300&&rect.left<700);
const behind=new THREE.Box3(new THREE.Vector3(-.1,1,6),new THREE.Vector3(.1,2,7));assert.equal(projectFocusBounds(behind,camera,1024,768),null);
const huge=new THREE.Box3(new THREE.Vector3(-4,-3,0),new THREE.Vector3(4,4,1));const bounded=projectFocusBounds(huge,camera,504,776);assert.ok(bounded&&bounded.left>=12&&bounded.left+bounded.width<=492&&bounded.top+bounded.height<=764);
// Independent gait clocks must survive changes in which member of a batch is visible.
const walker={id:991,species:'fox',x:0,z:0,age:0,phase:.3,heading:0,speed:.45,activity:'walking'},species=ANIMALS.fox;
advanceMotion(walker,species);const phases=[];
for(let n=0;n<90;n++){walker.age+=1/30;walker.x+=.45/30;const m=advanceMotion(walker,species);assert.ok(Number.isFinite(m.phase));phases.push(m.phase);}
const stoppedPhase=walker.motion.phase,prior=walker.motion.amount;walker.activity='resting';walker.speed=0;
for(let n=0;n<30;n++){walker.age+=1/30;advanceMotion(walker,species);}
assert.equal(walker.motion.phase,stoppedPhase);assert.ok(walker.motion.amount<prior*.001,'Feet settle while a blocked/stopped animal is stationary');
const normal={...walker,motion:undefined,id:1001,age:0,x:0},slow={...walker,motion:undefined,id:1002,age:0,x:0};advanceMotion(normal,species);advanceMotion(slow,species);
for(let n=0;n<30;n++){normal.age+=1/30;normal.x+=.45/30;slow.age+=1/60;slow.x+=.45/60;advanceMotion(normal,species);advanceMotion(slow,species);}
const phaseNormal=(normal.motion.phase-.3+Math.PI*2)%(Math.PI*2),phaseSlow=(slow.motion.phase-.3+Math.PI*2)%(Math.PI*2);assert.ok(Math.abs(phaseNormal-phaseSlow*2)<1e-10,'Binocular gait is slowed continuously with the actual trajectory');
normal.activity='grazing';normal.age+=1/30;const pose=advanceMotion(normal,species);assert.ok(pose.feed>0&&pose.feed<.4,'Feeding pose blends, without an instant whole-body tilt');
normal.id++;normal.age=0;advanceMotion(normal,species);assert.equal(normal.motion.identity,normal.id);assert.equal(normal.motion.amount,0,'A newborn slot must not inherit the previous animal gait');
for(const s of Object.values(ANIMALS)){const shader={vertexShader:'#include <beginnormal_vertex>\n#include <begin_vertex>'};motionShader(shader,s);assert.ok(!shader.vertexShader.includes('NaN')&&!shader.vertexShader.includes('Infinity'));assert.ok(shader.vertexShader.includes('normalMotion(objectNormal)'),'Animated body normals and shadows use the joint pose');}
console.log(JSON.stringify({collision:'body radius, initial placement, respawn and movement verified',flight:'low birds avoid signs; high birds may fly above',animation:'independent distance-coupled gaits, soft stopping/feeding, continuous half-time and birth identity verified',marker:'visible target follows projected body; behind-camera targets hidden; portrait bounds fit'},null,2));
