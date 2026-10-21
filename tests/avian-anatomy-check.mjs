import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {avianTorso} from '../dist/avian-anatomy.js';
import {birdPalette} from '../dist/bird-plumage.js';
import {ANIMALS} from '../dist/biodiversity.js';
import {WildlifeRenderer} from '../dist/wildlife.js';
import {motionShaderKey} from '../dist/wildlife-motion.js';
import {animalTimeStep} from '../dist/tidal-system.js';

let faces=0;const birds=Object.values(ANIMALS).filter(s=>s.type==='bird');
for(const s of birds){const geometry=avianTorso([.255,.145,.125],birdPalette(s),s.id),p=geometry.attributes.position,n=geometry.attributes.normal,c=geometry.attributes.color,index=geometry.index;
 for(const attribute of [p,n,c])assert.ok([...attribute.array].every(Number.isFinite),s.id+' invalid surface');
 for(let i=0;i<index.count;i+=3){const a=new T.Vector3().fromBufferAttribute(p,index.getX(i)),b=new T.Vector3().fromBufferAttribute(p,index.getX(i+1)),d=new T.Vector3().fromBufferAttribute(p,index.getX(i+2)),normal=b.clone().sub(a).cross(d.clone().sub(a)),center=a.clone().add(b).add(d).multiplyScalar(1/3).sub(new T.Vector3(.015,.012,0));assert.ok(normal.length()>1e-7,'Degenerate feather surface');assert.ok(normal.dot(center)>0,'Inverted torso surface');faces++;}
 for(let row=0;row<=14;row++){const a=row*17,b=a+16;assert.ok(new T.Vector3().fromBufferAttribute(n,a).distanceTo(new T.Vector3().fromBufferAttribute(n,b))<1e-6,'Visible normal seam');for(let col=1;col<16;col++){const left=row*17+col,right=row*17+16-col;assert.ok(new T.Color().fromArray(c.array,left*3).equals(new T.Color().fromArray(c.array,right*3)),'Asymmetric plumage');}}
 if(s.id==='haematopus_ostralegus'){const black=new T.Color('#222725'),white=new T.Color('#eeece4');assert.deepEqual([...c.array.subarray(7*17*3,7*17*3+3)],[...new Float32Array(black.toArray())]);assert.deepEqual([...c.array.subarray((7*17+8)*3,(7*17+8)*3+3)],[...new Float32Array(white.toArray())]);}
 geometry.dispose();
}
T.TextureLoader.prototype.load=()=>new T.Texture();globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}})})};
const a={id:1,species:'parus_major',habitat:'forest',alive:true,x:0,z:0,heading:0,trait:1,age:0,phase:2.4,activity:'resting'},render=new WildlifeRenderer(new T.Scene(),[a]),batch=render.batches.get(a.species),preview=render.preview(a.species);render.update(()=>0,()=>-1,null);
const phase=a.motion.phase,feet=[...a.motion.footTargets];for(let frame=0;frame<90;frame++){a.age+=animalTimeStep(1/30,true);render.update(()=>0,()=>-1,null);render.updatePreview(preview,a);assert.equal(a.motion.phase,phase,'Resting feet acquire a walking cycle');assert.deepEqual([...a.motion.footTargets],feet);assert.equal(preview.material.userData.pose.motionControls.value[0],batch.controls[0]);assert.ok(Math.abs(batch.controls[0]-a.age-a.phase)<1e-6);}
assert.ok(Math.abs(a.age-1.5)<1e-12,'Idle motion bypasses binocular half-time');
assert.notEqual(motionShaderKey(ANIMALS.fox),motionShaderKey(ANIMALS.apis_mellifera));
let disposed=0;for(const item of [render.coat,render.surface,preview.material])item.addEventListener('dispose',()=>disposed++);render.dispose();assert.equal(disposed,3,'Preview inspection leaks its textures or materials');
console.log(JSON.stringify({birdSpecies:birds.length,outwardTrianglesChecked:faces,continuousSymmetricSurface:true,idle:'Individual clock, half-speed observation, planted feet remain stationary',resources:'Owned textures and specimen materials released'},null,2));
