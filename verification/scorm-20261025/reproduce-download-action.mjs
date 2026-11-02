import {createServer} from 'node:http';
import {readFile,mkdir,access,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const {streamExtractExternal}=await import(`${process.cwd()}/work/scorm/action-download-repro/node_modules/@actions/artifact/lib/internal/download/download-artifact.js`);
const file='Ranger-Kompakt-itslearning-SCORM12.zip';
const bytes=await readFile(`tools/scorm-template/dist/${file}`);
const expected=createHash('sha256').update(bytes).digest('hex');
const root='work/scorm/action-download-repro';
await mkdir(`${root}/default`,{recursive:true});
await mkdir(`${root}/raw`,{recursive:true});
const server=createServer((req,res)=>{res.writeHead(200,{'Content-Type':'application/zip','Content-Disposition':`attachment; filename="${file}"`});res.end(bytes);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try {
 const url=`http://127.0.0.1:${server.address().port}/${file}`;
 const defaultResult=await streamExtractExternal(url,`${root}/default`);
 await access(`${root}/default/imsmanifest.xml`);
 await assert.rejects(access(`${root}/default/${file}`),{code:'ENOENT'});
 const rawResult=await streamExtractExternal(url,`${root}/raw`,{skipDecompress:true});
 const downloaded=await readFile(`${root}/raw/${file}`);
 assert.deepEqual(downloaded,bytes);
 assert.equal(rawResult.sha256Digest,`sha256:${expected}`);
 assert.equal(defaultResult.sha256Digest,`sha256:${expected}`);
 const proof={status:'BESTANDEN',sdk:'@actions/artifact@6.3.1',downloadActionCommit:'9000827ccba6bdab643e8b6fd33ac0654aef8333',transport:'local HTTP using unchanged SDK streamExtractExternal',defaultBehavior:'Manifest extracted; original ZIP absent (ENOENT asserted)',skipDecompressBehavior:'Original filename and bytes preserved',bytes:bytes.length,sha256:expected};
 await writeFile(`${root}/result.json`,JSON.stringify(proof,null,2)+'\n');
 console.log(JSON.stringify(proof,null,2));
} finally { await new Promise(resolve=>server.close(resolve)); }
