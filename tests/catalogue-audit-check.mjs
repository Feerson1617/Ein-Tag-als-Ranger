import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ANIMALS,PLANTS,HABITATS} from '../dist/biodiversity.js';
import {SPECIES_PHOTOS} from '../dist/species-photos.js';
const taxa={...ANIMALS,...PLANTS},ids=Object.keys(taxa),habitats=new Map(HABITATS.map(h=>[h.id,h]));
assert.equal(ids.length,Object.keys(ANIMALS).length+Object.keys(PLANTS).length,'No overlapping IDs');
assert.equal(new Set(ids).size,ids.length);
const lines=fs.readFileSync(new URL('../catalogue/Arten.csv',import.meta.url),'utf8').trim().split(/\r?\n/);
const rows=lines.slice(1).map(line=>[...line.matchAll(/"((?:[^"]|"")*)"/g)].map(m=>m[1].replaceAll('""','"')));
const catalogue=new Map(rows.map(row=>[row[0],row]));assert.equal(catalogue.size,rows.length);
assert.deepEqual([...catalogue.keys()].sort(),[...ids].sort());
for(const [id,s] of Object.entries(taxa)){
 assert.equal(s.id,id);assert.ok(s.common&&s.latin);assert.ok(Number.isFinite(s.size)&&s.size>0&&s.size<100,id);
 assert.ok(s.source?.startsWith('https://'),id);assert.ok(s.recognition&&s.description,id);
 assert.ok(s.habitats.length&&new Set(s.habitats).size===s.habitats.length,id);
 for(const h of s.habitats){assert.ok(habitats.has(h));assert.ok((PLANTS[id]?habitats.get(h).plants:habitats.get(h).species).includes(id),`${id}/${h}`);}
 const row=catalogue.get(id);assert.equal(row[1],s.common);assert.equal(row[2],s.latin);
 assert.deepEqual(row[4].split(/,\s*/).sort(),[...s.habitats].sort());
 const photo=SPECIES_PHOTOS[id];assert.ok(photo?.author&&photo.license&&photo.source&&photo.licenseUrl,id);
 assert.ok(photo.source.startsWith('https://')&&photo.licenseUrl.startsWith('https://'));
 assert.ok(fs.statSync(new URL('../dist/'+photo.url,import.meta.url)).size>0,id);
}
assert.deepEqual(Object.keys(SPECIES_PHOTOS).sort(),ids.sort());
console.log(JSON.stringify({taxa:ids.length,animals:Object.keys(ANIMALS).length,plants:Object.keys(PLANTS).length,units:'metres in runtime, approximate',catalogue:'IDs/names/habitats consistent',media:'local and attributed',biology:'NOT individually validated',taxonomicResolution:'includes aggregates; not a universal species-level determination'}));
