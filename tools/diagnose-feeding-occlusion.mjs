// Read-only reconstruction of a saved actual browser frame. No runtime edits.
import fs from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {terrainHeight,walkingHeight}from '../dist/compact/layout.js';
import {billPoint}from '../dist/compact/coastal-rig.js';
import {pathPanels,deckGeometry}from '../dist/compact/path-mesh.js';
const [file,headingText]=process.argv.slice(2);if(!file||headingText===undefined)throw Error('Usage: node tools/diagnose-feeding-occlusion.mjs frame.json explicitly-known-heading-radians');
const heading=Number(headingText);if(!Number.isFinite(heading))throw Error('Finite documented heading required');
const s=JSON.parse(fs.readFileSync(file)),a={...s.actor,heading},target=billPoint(a),o=s.observer,eye=new THREE.Vector3(o.x,walkingHeight(o.x,o.z)+1.67,o.z),geometry=new THREE.PlaneGeometry(220,150,220,150);geometry.rotateX(-Math.PI/2);const p=geometry.attributes.position;
for(let i=0;i<p.count;i++)p.setY(i,terrainHeight(p.getX(i),p.getZ(i)));geometry.computeVertexNormals();
const ground=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial()),deck=new THREE.Mesh(deckGeometry(pathPanels()),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));ground.updateMatrixWorld(true);deck.updateMatrixWorld(true);
const direction=new THREE.Vector3(target.x,target.y,target.z).sub(eye),ray=new THREE.Raycaster(eye,direction.clone().normalize(),.001,direction.length()-.001),vertical=new THREE.Raycaster(new THREE.Vector3(target.x,5,target.z),new THREE.Vector3(0,-1,0));
console.log(JSON.stringify({scope:'Read-only actual terrain/deck ray reconstruction, not an additional browser screenshot or feeding event. The first straight avocet approach in the supplied frame has documented heading 0.',input:file,explicitHeadingRadians:heading,phase:a.phase,eye:eye.toArray(),bill:target,groundHits:ray.intersectObject(ground).map(i=>({point:i.point.toArray(),distance:i.distance})),deckHits:ray.intersectObject(deck).map(i=>({point:i.point.toArray(),distance:i.distance})),renderedGroundAtBill:vertical.intersectObject(ground).map(i=>i.point.y),analyticGroundAtBill:terrainHeight(target.x,target.z)},null,2));
