import * as THREE from './vendor/three.module.js?revision=120';
import { assetUrl } from './asset-url.js';

// This deliberately supports our sealed, static, single-mesh GLBs only. The
// local Blender rig remains on the GPU, shared by all individuals of a species.
export const AUTHORED_WILDLIFE = Object.freeze({
 fox:'./assets/wildlife-fox.glb',
 hare:'./assets/wildlife-hare.glb',
 capreolus_capreolus:'./assets/wildlife-capreolus_capreolus.glb',
 sciurus_vulgaris:'./assets/wildlife-sciurus_vulgaris.glb',
 phoca_vitulina:'./assets/wildlife-phoca_vitulina.glb',
 halichoerus_grypus:'./assets/wildlife-halichoerus_grypus.glb'
});
const cache=new Map();let preparation;
const widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
const components={5121:[1,'getUint8',255],5123:[2,'getUint16',65535],5125:[4,'getUint32',4294967295],5126:[4,'getFloat32',1]};
export function readWildlifeGLB(buffer,expectedSpecies){
 const view=new DataView(buffer);if(view.byteLength<28||view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==view.byteLength)throw new Error('Ungültiges Tiermodell');
 let json,bin;for(let offset=12;offset<buffer.byteLength;){const length=view.getUint32(offset,true),kind=view.getUint32(offset+4,true);offset+=8;if(offset+length>buffer.byteLength)throw new Error('Unvollständiges Tiermodell');if(kind===0x4e4f534a)json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,offset,length)));else if(kind===0x004e4942)bin=new DataView(buffer,offset,length);offset+=length;}
 const node=json?.nodes?.[0],primitive=json?.meshes?.[0]?.primitives?.[0];
 if(!bin||json.nodes.length!==1||json.meshes.length!==1||json.meshes[0].primitives.length!==1||node.mesh!==0||node.matrix||node.translation||node.rotation||node.scale||json.buffers.length!==1||json.buffers[0].uri||json.extensionsRequired?.length||json.animations?.length||json.skins?.length||node.extras?.species!==expectedSpecies||(primitive.mode??4)!==4)throw new Error('Nicht unterstütztes Tiermodell');
 function accessor(index,expectedWidth){const a=json.accessors[index],v=json.bufferViews[a?.bufferView],width=widths[a?.type],format=components[a?.componentType];if(!a||a.sparse||!v||v.buffer!==0||!format||width!==expectedWidth||a.count<1||a.count>150000)throw new Error('Ungültige Modelldaten');const [bytes,method,divisor]=format,stride=v.byteStride||width*bytes,start=(v.byteOffset||0)+(a.byteOffset||0),end=start+(a.count-1)*stride+width*bytes;if(stride<width*bytes||end>(v.byteOffset||0)+v.byteLength||end>bin.byteLength)throw new Error('Modelldaten außerhalb des Puffers');const result=new Float32Array(a.count*width);for(let i=0;i<a.count;i++)for(let j=0;j<width;j++){const value=bin[method](start+i*stride+j*bytes,true)/(a.normalized?divisor:1);if(!Number.isFinite(value))throw new Error('Ungültige Koordinate');result[i*width+j]=value;}return result;}
 const g=new THREE.BufferGeometry();for(const [semantic,name,width] of [['POSITION','position',3],['NORMAL','normal',3],['TEXCOORD_0','uv',2],['COLOR_0','color',3],['_RIGDATA','rigData',4],['_RIGJOINT','rigJoint',4]])g.setAttribute(name,new THREE.Float32BufferAttribute(accessor(primitive.attributes[semantic],width),width));
 const count=g.attributes.position.count;if(Object.values(g.attributes).some(a=>a.count!==count))throw new Error('Abweichende Anzahl von Modellpunkten');
 const indices=accessor(primitive.indices,1);if(indices.length%3||indices.some(i=>i<0||i>=count||!Number.isInteger(i)))throw new Error('Ungültige Modellflächen');g.setIndex(new THREE.BufferAttribute(count>65535?new Uint32Array(indices):new Uint16Array(indices),1));
 const feet=JSON.parse(node.extras.legFeet||'{}');for(const [part,foot] of Object.entries(feet))if(!['1','2','3','4'].includes(part)||foot.length!==3||!foot.every(Number.isFinite))throw new Error('Ungültiger Fußkontakt');
 g.userData.legFeet=feet;g.userData.authored=true;g.userData.species=expectedSpecies;g.computeBoundingBox();g.computeBoundingSphere();return g;
}
export function prepareAuthoredWildlife(){return preparation??=(async()=>{
 const entries=Object.entries(AUTHORED_WILDLIFE);
 // Bound concurrent downloads. A transient connection failure can be retried
 // once; a corrupt model or missing file is still reported, never concealed.
 for(let start=0;start<entries.length;start+=2)await Promise.all(entries.slice(start,start+2).map(async([id,url])=>{
  if(cache.has(id))return;const resolved=assetUrl(url);let response;
  try{response=await fetch(resolved);}catch{response=await fetch(resolved);}
  if(!response.ok)throw new Error('Tiermodell nicht geladen: '+id);
  cache.set(id,readWildlifeGLB(await response.arrayBuffer(),id));
 }));
 })().catch(error=>{preparation=null;throw error;});}
export function authoredWildlifeGeometry(id){return cache.get(id)?.clone()||null;}
