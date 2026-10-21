import * as THREE from 'three';
import { createLandscape } from './landscape.js';
import { createAnimal } from './animals.js';
import { Ecosystem } from './simulation.js';
import { ECOSYSTEMS, SPECIES_INFO, PLANT_SPECIES, FACTOR_CATALOG, factorLabel } from './ecosystems.js';

const $ = id => document.getElementById(id);
const clamp = THREE.MathUtils.clamp;
const canvas = $('world');
const sim = new Ecosystem(84721);
let renderer, landscape, camera, scene;
let started = false, paused = false, rate = 1, mode = 'overview', elapsed = 0, selectedId = null, followingId = null;
let currentEcosystem = 'forest', binocularOn = false;
let overview = { x: -8, z: 8, distance: 83, theta: .72, phi: .69 };
let player = { x: -17, z: 28, yaw: 0, pitch: -.07 };
const keys = new Set(), touchMove = { x: 0, y: 0 }, pointers = new Map();
let lastPinch = null, nearestBoard = null, toastTimer, soundOn = false, audio;
const achieved = new Set(), lexiconFound = new Set(), lexiconObserved = new Set();
const steps = ['Lies eine Infotafel im Gelände.', 'Untersuche einen Fuchs oder Hasen.', 'Öffne die Populationskurven.', 'Baue eine Straße im Experimentiermenü.'];
const pools = {}, animalByInstance = {}, boardMeshes = [], boards = [];
const rootMatrix = new THREE.Matrix4(), partMatrix = new THREE.Matrix4(), scaleVec = new THREE.Vector3(), posVec = new THREE.Vector3(), quat = new THREE.Quaternion(), axisY = new THREE.Vector3(0,1,0), instanceTint = new THREE.Color();
const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2();
const eyeTarget = new THREE.Vector3();
let selectionRing;

function toast(text) { $('toast').textContent = text; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').hidden = true, 4200); }
function mark(step) { if (!achieved.has(step)) { achieved.add(step); const n=achieved.size; $('mission-status').textContent=`FELDAUFTRAG · ${n} / 4`; $('mission-title').textContent=steps.find((_,i)=>!achieved.has(i)) || 'Feldauftrag erfüllt. Experimentiere weiter.'; $('mission-progress').style.width=`${n*25}%`; if(n===4)toast('Feldauftrag erfüllt. Wie verändert eine Grünverbindung den Wald?'); } }
function openPanel(id) { for (const name of ['lab','chart','info','ecosystem-panel','lexicon']) $(name).hidden=name!==id; $('lab-button').classList.toggle('active',id==='lab'); $('chart-button').classList.toggle('active',id==='chart'); $('lexicon-button').classList.toggle('active',id==='lexicon'); touchMove.x=touchMove.y=0; $('stick').style.transform=''; if(id==='chart'){mark(2);drawChart();} if(id==='lexicon')renderLexicon(); }
function closePanels() { for (const name of ['lab','chart','info','ecosystem-panel','lexicon']) $(name).hidden=true; $('lab-button').classList.remove('active'); $('chart-button').classList.remove('active'); $('lexicon-button').classList.remove('active'); }

function buildSky() {
  const sunDir = new THREE.Vector3(-.55,.6,-.38).normalize();
  const skyMaterial=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{sunDir:{value:sunDir}},vertexShader:`varying vec3 vDirection; void main(){ vDirection=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,fragmentShader:`varying vec3 vDirection; uniform vec3 sunDir; void main(){vec3 d=normalize(vDirection); float h=max(d.y,0.0); vec3 horizon=vec3(.76,.79,.67); vec3 zenith=vec3(.26,.46,.61); vec3 c=mix(horizon,zenith,pow(h,.55)); float s=max(dot(d,sunDir),0.0); c+=vec3(.68,.45,.18)*pow(s,10.0)*.2; c+=vec3(1.0,.83,.5)*pow(s,850.0)*2.5; gl_FragColor=vec4(c,1.0);\n #include <tonemapping_fragment>\n #include <colorspace_fragment>\n }`});
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1500,32,20),skyMaterial));
  const ambient=new THREE.HemisphereLight('#c2d8e1','#65764c',1.6);scene.add(ambient);
  const sun=new THREE.DirectionalLight('#fff0cc',3.1);sun.position.copy(sunDir).multiplyScalar(100);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-115,right:115,top:115,bottom:-115,near:1,far:300});sun.shadow.bias=-.00012;sun.shadow.normalBias=.15;sun.shadow.camera.updateProjectionMatrix();scene.add(sun);
  const base=new THREE.Mesh(new THREE.PlaneGeometry(2400,2400),new THREE.MeshStandardMaterial({color:'#5d6b42',roughness:1}));base.rotation.x=-Math.PI/2;base.position.y=-4.8;scene.add(base);
  const ring=new THREE.PlaneGeometry(1,1,1,1);
  const positions=[],indices=[];
  for(let i=0;i<=160;i++){const a=i/160*Math.PI*2,r=420;const peak=35+20*Math.sin(a*3+.3)+12*Math.sin(a*7);positions.push(Math.cos(a)*r,-5,Math.sin(a)*r,Math.cos(a)*(r+65),peak,Math.sin(a)*(r+65));if(i<160){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}}
  ring.dispose(); const mountainGeo=new THREE.BufferGeometry();mountainGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));mountainGeo.setIndex(indices);mountainGeo.computeVertexNormals();scene.add(new THREE.Mesh(mountainGeo,new THREE.MeshStandardMaterial({color:'#738976',roughness:1,side:THREE.DoubleSide})));
}

function applyNaturalTextures() {
  const loader=new THREE.TextureLoader();
  function load(url,repeat,colorSpace){const texture=loader.load(url,undefined,undefined,()=>{});texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(...repeat);texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());if(colorSpace)texture.colorSpace=THREE.SRGBColorSpace;return texture;}
  const ground=landscape.group.children[0];
  ground.material.map=load('./assets/ground-diffuse.jpg',[46,46],true);ground.material.normalMap=load('./assets/ground-normal.jpg',[46,46],false);ground.material.normalScale=new THREE.Vector2(.55,.55);ground.material.color.set('#d9debe');ground.material.needsUpdate=true;
  const bark=load('./assets/bark-diffuse.jpg',[2,5],true),normal=load('./assets/bark-normal.jpg',[2,5],false);
  landscape.group.traverse(m=>{if(m.isInstancedMesh&&m.geometry.type==='CylinderGeometry'&&m.geometry.parameters.radiusTop>.2){m.material.map=bark;m.material.normalMap=normal;m.material.normalScale=new THREE.Vector2(.5,.5);m.material.color.set('#d7d0bd');m.material.needsUpdate=true;}});
}

function createAnimalPools() {
  for(const species of ['hare','fox','bird','fish']){
    const template=createAnimal(species),parts=[];
    template.updateMatrixWorld(true);
    template.traverse(p=>{if(p.isMesh){const batch=new THREE.InstancedMesh(p.geometry,p.material,160);batch.count=0;batch.castShadow=true;batch.receiveShadow=true;batch.frustumCulled=false;batch.userData.species=species;scene.add(batch);parts.push({source:p,batch});}});
    pools[species]={template,parts};animalByInstance[species]=[];
  }
  selectionRing=new THREE.Mesh(new THREE.RingGeometry(.6,.66,40),new THREE.MeshBasicMaterial({color:'#e0ebb7',transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}));selectionRing.rotation.x=-Math.PI/2;selectionRing.visible=false;scene.add(selectionRing);
}

function syncAnimals() {
  for(const species of ['hare','fox','bird','fish']){
    const pool=pools[species],agents=sim.agents.filter(a=>a.species===species);animalByInstance[species]=agents;
    for(let index=0;index<agents.length;index++){
      const a=agents[index];pool.template.userData.update(sim.time+a.id*.73,Math.min(1,a.speed/3),a.state,a.trait);
      pool.template.updateMatrixWorld(true);
      const young=clamp(a.age/(species==='hare'?5:species==='fox'?9:3),.55,1);const variantScale=species==='bird'?.82+((a.variantIndex??0)%5)*.08:1;scaleVec.setScalar(young*variantScale);
      const y=species==='bird' ? landscape.heightAt(a.x,a.z)+3.1+Math.sin(sim.time*.9+a._schoolPhase)*.45 : species==='fish' ? .34+Math.sin(sim.time*1.3+a._schoolPhase)*.12 : landscape.heightAt(a.x,a.z);
      posVec.set(a.x,y,a.z);quat.setFromAxisAngle(axisY,Math.PI/2-a.heading);rootMatrix.compose(posVec,quat,scaleVec);
      if(species==='bird')instanceTint.setHSL(.08+((a.variantIndex??0)%8)*.035,.22,.58+((a.variantIndex??0)%3)*.06);
      for(const part of pool.parts){partMatrix.multiplyMatrices(rootMatrix,part.source.matrixWorld);part.batch.setMatrixAt(index,partMatrix);if(species==='bird'&&part.batch.instanceColor)part.batch.setColorAt(index,instanceTint);}
    }
    for(const part of pool.parts){part.batch.count=agents.length;part.batch.instanceMatrix.needsUpdate=true;if(part.batch.instanceColor)part.batch.instanceColor.needsUpdate=true;}
  }
  const selected=sim.agents.find(a=>a.id===selectedId);
  selectionRing.visible=Boolean(selected);
  if(selected){selectionRing.position.set(selected.x,selected.species==='bird'?landscape.heightAt(selected.x,selected.z)+3.05:selected.species==='fish'?.45:landscape.heightAt(selected.x,selected.z)+.06,selected.z);selectionRing.scale.setScalar(selected.species==='fox'?1.45:selected.species==='fish'?.8:1);}
}

const fieldNotes=[
  {n:'01',title:'Räuber & Beute',short:'RÄUBER & BEUTE',x:-18,z:28,body:'<p>Auf dieser Lichtung treffen Fuchs und Hase aufeinander. Hasen nutzen Pflanzen als Nahrung. Füchse gewinnen Energie durch die Jagd auf Hasen.</p><p>Wächst die Beutepopulation, steht den Räubern mehr Nahrung zur Verfügung. Ihre Population kann später ebenfalls wachsen. Stärkerer Jagddruck kann die Zahl der Hasen wieder senken.</p><div class="field-observation">Beobachte eine Jagd. Öffne dann die Populationskurven: Reagieren Füchse und Hasen gleichzeitig?</div><p>Die klassischen Lotka–Volterra-Gleichungen idealisieren diese Beziehung. Hier beeinflussen zusätzlich Nahrung, Raum und Zufall den Verlauf.</p>'},
  {n:'02',title:'Überleben auf der Wiese',short:'DIE WIESE LEBT',x:-43,z:-8,body:'<p>Hasen grasen und benötigen Energie zum Überleben und zur Fortpflanzung. Die Vegetation wächst nach, aber ihre Menge ist begrenzt.</p><p>Viele Pflanzenfresser können mehr Nahrung verbrauchen, als nachwächst. Dann sinkt der Fortpflanzungserfolg, und Tiere können verhungern. Nahrung trägt damit zur Begrenzung einer Population bei.</p><div class="field-observation">Setze mehrere Hasen ein. Vergleiche die Vegetation und die Tierzahlen nach einigen Tagen.</div><p>Die Vegetationsanzeige beschreibt den verfügbaren Nahrungsvorrat. Einzelne Pflanzenarten werden in dieser ersten Ausbaustufe noch nicht simuliert.</p>'},
  {n:'03',title:'Eine Straße verändert alles',short:'GETEILTER LEBENSRAUM',x:9,z:19,body:'<p>Straßen können zusammenhängende Lebensräume zerschneiden. Werden Tiere an der Überquerung gehindert, tauschen die Teilpopulationen weniger Individuen und damit weniger Erbanlagen aus.</p><p>Das ist eine Form geographischer Isolation. In kleinen Populationen können zufällige Veränderungen der Merkmalsverteilung stärker wirken. Selektion kann bei unterschiedlichen Umweltbedingungen in verschiedene Richtungen führen.</p><div class="field-observation">Baue eine Straße. Beobachte beide Seiten. Öffne anschließend einen Wildtierkorridor und suche Tiere, die hinüberwechseln.</div><p>Im Modell ist die Straße eine vollständige Barriere mit optionalem Übergang. In der Natur hängt ihre Wirkung unter anderem von Tierart, Verkehr und Querungsmöglichkeiten ab. Isolation bedeutet nicht, dass sofort neue Arten entstehen.</p>'},
  {n:'04',title:'Variation wird vererbt',short:'EVOLUTION BEOBACHTEN',x:29,z:-30,body:'<p>Die Hasen unterscheiden sich in einem vererbbaren Merkmal: ihrer möglichen Laufgeschwindigkeit. Nachkommen erhalten eine Mischung der Merkmalswerte ihrer Eltern.</p><p>Mutation erzeugt zufällige neue Varianten. Natürliche Selektion verändert die Häufigkeit vererbbarer Varianten, wenn sie das Überleben oder die Fortpflanzung beeinflussen. Die Population verändert sich über Generationen.</p><div class="field-observation">Schalte Mutation und Selektion ein. Vergleiche die mittlere Laufgeschwindigkeit nach mehreren Generationen. Wiederhole das Experiment.</div><p>Im Spiel kostet eine höhere Laufgeschwindigkeit mehr Energie. Ein höherer Wert ist deshalb nicht unter allen Bedingungen vorteilhaft. Diese Merkmalsvererbung ist bewusst vereinfacht.</p><a class="source-link" href="https://www.genome.gov/genetics-glossary/Mutation" target="_blank" rel="noopener">Fachlicher Hintergrund · NHGRI ↗</a>'},
  {n:'05',title:'Ein Ort voller Beziehungen',short:'AM WALDTEICH',x:55,z:53,body:'<p>Der Teich, die Wiese und der Waldrand bieten unterschiedliche Lebensbedingungen. Wasser, Licht, Temperatur und Boden gehören zu den unbelebten Umweltfaktoren. Nahrung, Konkurrenz und Räuber sind belebte Umweltfaktoren.</p><p>Ein Ökosystem umfasst diese Lebensräume und die Organismen mit ihren Wechselwirkungen. Pflanzen bilden durch Photosynthese die Grundlage vieler Nahrungsketten.</p><div class="field-observation">Wechsle auf Augenhöhe. Wo erkennst du offene Flächen, Deckung und Wasser? Beobachte Fische im Freiwasser und Vögel am Übergang zwischen Ufer und Baumschicht.</div><p>Die See-Station ergänzt Uferzone, Schilf, Freiwasser und Tiefen-/Bodenzone als nächste Ausbaustufe. Die Fische bleiben im Teich, während Vögel zwischen den Lebensräumen wechseln.</p>'},
  {n:'06',title:'Die Baumschicht',short:'BAUMSCHICHT',x:-72,z:42,body:'<p>Die Baumschicht bildet das Dach des Waldes. Große Bäume fangen viel Licht ab, erzeugen durch Photosynthese Biomasse und verändern darunter Wind, Temperatur und Feuchtigkeit.</p><p>Stämme und Kronen bieten Nistplätze, Höhlen, Rinde und Nahrung. Im Spiel erzeugen die Bäume Deckung und gliedern den Raum, in dem Räuber und Beute einander suchen.</p><div class="field-observation">Schau nach oben: Wo ist die Krone geschlossen, wo fällt Licht bis zum Boden? Ein dichteres Kronendach verändert die Bedingungen für alle tieferen Schichten.</div>'},
  {n:'07',title:'Die Strauchschicht',short:'STRAUCHSCHICHT',x:-52,z:50,body:'<p>Unter den Bäumen wächst die Strauchschicht aus jungen Bäumen, Hasel, Weißdorn und anderen Gehölzen. Sie ist niedriger als die Baumschicht, aber höher und holziger als die Kräuter.</p><p>Sträucher bilden wichtige Verstecke und Leitlinien. Für einen Hasen kann die dichte Struktur Schutz bieten; für einen Fuchs kann sie die Sicht und damit die Jagd verändern.</p><div class="field-observation">Vergleiche offene und dicht bewachsene Stellen. Wo würdest du ein Tier eher entdecken, wo würde es sich verstecken?</div>'},
  {n:'08',title:'Die Krautschicht',short:'KRAUT- UND GRASSCHICHT',x:-34,z:-39,body:'<p>Die Krautschicht liegt nahe am Boden und umfasst Gräser, Kräuter, Farne und Keimlinge. Sie nutzt die Lichtlücken des Waldes und reagiert schnell auf Jahreszeit, Niederschlag und Tritt.</p><p>Im Modell ist die verfügbare Vegetation die Nahrungsgrundlage der Hasen. Konkurrenz um Nahrung und die Erholung der Pflanzen begrenzen dadurch die Populationsgröße.</p><div class="field-observation">Suche die hellsten Lichtflecken. Dort ist die Krautschicht meist üppiger als unter einem geschlossenen Kronendach.</div>'},
  {n:'09',title:'Moos und Bodenschicht',short:'MOOS- UND BODENSCHICHT',x:68,z:-24,body:'<p>Die Moos- und Bodenschicht liegt direkt auf dem Waldboden. Moose, Pilze, Laubstreu, Wurzeln und kleine Bodenorganismen zersetzen und speichern Stoffe und Wasser.</p><p>Aus abgestorbenem Material werden wieder Nährstoffe für Pflanzen. Feuchter Boden puffert Temperatur und Trockenheit; Verdichtung oder Lebensraumverlust können diese Funktion schwächen.</p><div class="field-observation">Achte auf Schatten, Feuchtigkeit, Laub und nackte Erde. Die unscheinbare Bodenschicht trägt den Wald ebenso wie die sichtbaren Kronen.</div>'},
  {n:'10',title:'Totholz verbindet die Schichten',short:'TOTHOLZ UND STREU',x:78,z:58,body:'<p>Umgestürzte Stämme und Äste sind kein Abfall, sondern Lebensraum. Pilze, Käfer, Larven und Mikroorganismen bauen Holz langsam ab und geben Nährstoffe an den Boden zurück.</p><p>Totholz verbindet Baum-, Strauch- und Bodenschicht. Es speichert Feuchtigkeit und schafft kleine Verstecke, in denen viele Arten Schutz finden.</p><div class="field-observation">Suche Fallholz am Waldrand. Welche Spuren von Zersetzung, Feuchtigkeit oder neuen Pflanzen kannst du entdecken?</div>'}
 ];
// Repeat a few layer signs at opposite forest edges so the educational trail
// remains discoverable even when the player approaches from another direction.
fieldNotes.push({ ...fieldNotes[5], n:'11', x:92, z:-55 });
fieldNotes.push({ ...fieldNotes[6], n:'12', x:-70, z:-8 });
fieldNotes.push({ ...fieldNotes[7], n:'13', x:90, z:-12 });

function makeBoards(){
  const wood=new THREE.MeshStandardMaterial({color:'#5c4a34',roughness:.95}),metal=new THREE.MeshStandardMaterial({color:'#3a443c',roughness:.65,metalness:.4});
  for(const note of fieldNotes){
    const group=new THREE.Group();group.position.set(note.x,landscape.heightAt(note.x,note.z),note.z);group.rotation.y=.15;
    for(const x of [-.66,.66]){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,1.65,8),metal);pole.position.set(x,.825,0);pole.castShadow=true;group.add(pole);}
    const frame=new THREE.Mesh(new THREE.BoxGeometry(1.75,1.12,.09),wood);frame.position.set(0,1.51,0);frame.castShadow=true;group.add(frame);
    const c=document.createElement('canvas');c.width=768;c.height=480;const ctx=c.getContext('2d');ctx.fillStyle='#e5e4d0';ctx.fillRect(0,0,768,480);ctx.fillStyle='#1e3827';ctx.font='500 19px sans-serif';ctx.fillText('EVOLUTIONSWALD · FELDNOTIZ '+note.n,43,55);ctx.font='bold 35px sans-serif';ctx.fillText(note.short,43,112);ctx.fillRect(43,141,680,2);ctx.font='23px sans-serif';ctx.fillText('Jede Veränderung hat Folgen.',43,192);ctx.fillText('Entdecke die Zusammenhänge.',43,229);ctx.strokeStyle='#58704c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(52,351);ctx.bezierCurveTo(135,300,180,430,240,342);ctx.bezierCurveTo(315,244,380,393,448,345);ctx.bezierCurveTo(535,291,565,360,690,299);ctx.stroke();ctx.font='18px sans-serif';ctx.fillStyle='#607353';ctx.fillText('ANTIPPEN UND ERKUNDEN  ↗',43,438);
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
    const face=new THREE.Mesh(new THREE.PlaneGeometry(1.65,1.03),new THREE.MeshStandardMaterial({map:texture,roughness:1,side:THREE.DoubleSide}));face.position.set(0,1.51,.051);group.add(face);
    group.traverse(m=>{if(m.isMesh){m.userData.board=note;boardMeshes.push(m);}});scene.add(group);boards.push({note,group});
  }
  const stations=[
    {id:'forest',x:-7,z:5},
    {id:'meadow',x:-62,z:-64},
    {id:'city',x:-77,z:-67},
    {id:'beach',x:70,z:-76},
    {id:'wadden',x:78,z:78},
  ];
  for(const station of stations){
    const eco=ECOSYSTEMS[station.id], group=new THREE.Group();group.position.set(station.x,landscape.heightAt(station.x,station.z),station.z);group.rotation.y=.12;
    for(const x of [-.78,.78]){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.045,.06,2.05,8),metal);pole.position.set(x,1.02,0);pole.castShadow=true;group.add(pole);}
    const frame=new THREE.Mesh(new THREE.BoxGeometry(2.1,1.32,.11),wood);frame.position.set(0,1.8,0);frame.castShadow=true;group.add(frame);
    const c=document.createElement('canvas');c.width=840;c.height=540;const ctx=c.getContext('2d');ctx.fillStyle='#e8e7d6';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#1e3827';ctx.font='500 20px sans-serif';ctx.fillText('EVOLUTIONSWALD · ÖKOSYSTEMSTATION',46,58);ctx.font='bold 40px sans-serif';ctx.fillText(eco.title.toUpperCase(),46,126);ctx.fillRect(46,153,748,2);ctx.font='22px sans-serif';ctx.fillText('Lebensraum öffnen und Faktoren wählen.',46,205);ctx.font='18px sans-serif';ctx.fillStyle='#5b704f';ctx.fillText('ANTIPPEN · ÖKOSYSTEM EINSTELLEN  ↗',46,487);
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;const face=new THREE.Mesh(new THREE.PlaneGeometry(1.98,1.28),new THREE.MeshStandardMaterial({map:texture,roughness:1,side:THREE.DoubleSide}));face.position.set(0,1.8,.061);group.add(face);
    group.traverse(m=>{if(m.isMesh){m.userData.ecosystem=station.id;boardMeshes.push(m);}});scene.add(group);boards.push({ecosystem:station.id,group,note:{x:station.x,z:station.z}});
  }
}
function showNote(note){selectedId=null;followingId=null;$('info-tag').textContent='FELDNOTIZ '+note.n;$('info-title').textContent=note.title;$('info-body').innerHTML=note.body;$('info-action').hidden=true;openPanel('info');mark(0);}
function setEcosystemIdentity(id){const eco=ECOSYSTEMS[id];$('current-ecosystem').innerHTML=`${eco.number} <i></i> ${eco.title}`;}
function showEcosystem(id){currentEcosystem=id;setEcosystemIdentity(id);populateEcosystemPanel(id);openPanel('ecosystem-panel');toast(`${ECOSYSTEMS[id].title}: passende Faktoren auswählen.`);}
function speciesKey(aOrSpecies){if(typeof aOrSpecies==='object')return aOrSpecies.species==='bird'?(aOrSpecies.variant||'bird'):aOrSpecies.species;return aOrSpecies;}
function discoverSpecies(species){const key=speciesKey(species);if(!SPECIES_INFO[key])return;lexiconFound.add(key);renderLexicon();}
function observeSpecies(species){const key=speciesKey(species);if(!SPECIES_INFO[key])return;lexiconObserved.add(key);renderLexicon();}
function showAnimal(a){selectedId=a.id;const key=speciesKey(a);discoverSpecies(key);const info=SPECIES_INFO[key]||SPECIES_INFO.hare;$('info-tag').textContent=`INDIVIDUUM ${String(a.id).padStart(3,'0')} · GENERATION ${a.generation}`;$('info-title').textContent=`${info.common}`;$('info-body').innerHTML=`<p class="latin">${info.latin}</p><p>${animalDescription(key)}</p><div class="fact-list"><div><span>Aktivität</span><b id="animal-state">${stateLabel(a.state)}</b></div><div><span>Energie</span><b id="animal-energy">${Math.round(a.energy*100)} %</b></div><div><span>Trophieebene</span><b>${info.trophic||'–'}</b></div><div><span>Lebensraum</span><b id="animal-region">${a.species==='fish'?'Freiwasser':a.x<0?'West':'Ost'}</b></div></div><div class="field-observation">${info.goal}</div><p class="small-note">Nutze das Fernglas, um Verhalten über einige Sekunden zu beobachten. Die Darstellung und Lebensdauer sind für die Simulation vereinfacht.</p>`;$('info-action').textContent=followingId===a.id?'Beobachtung beenden':'Tier mit der Kamera folgen →';$('info-action').hidden=false;openPanel('info');mark(1);}
function animalDescription(species){return SPECIES_INFO[species]?.description||'Diese Art ist Teil des Ökosystems und zeigt im Modell ein vereinfachtes, aber beobachtbares Verhalten.';}
function renderLexicon(){const all=Object.keys(SPECIES_INFO);$('lexicon-progress').textContent=`${lexiconFound.size} / ${all.length} Tierarten gefunden · ${lexiconObserved.size} Verhalten beobachtet`;$('lexicon-entries').innerHTML=all.filter(s=>lexiconFound.has(s)).map(s=>{const i=SPECIES_INFO[s],observed=lexiconObserved.has(s);return `<article class="lexicon-entry ${observed?'observed':''}"><h3>${i.common}</h3><p class="latin">${i.latin}</p><p>${animalDescription(s)}</p><p><b>Ziel:</b> ${i.goal}</p><div class="entry-status">${observed?'Verhalten beobachtet':'Art gefunden · Verhalten noch beobachten'}</div></article>`;}).join('')||'<p class="small-note">Noch keine Tierart entdeckt. Suche mit dem Fernglas nach Tieren und tippe sie an.</p>';$('plant-lexicon').innerHTML=`<div class="eyebrow">PFLANZENREFERENZ · NORDDEUTSCHER WALD</div>${Object.entries(PLANT_SPECIES).map(([layer,items])=>`<section><b>${layer==='trees'?'Baumarten':layer==='shrubs'?'Straucharten':layer==='herbs'?'Kraut- und Grasarten':'Moose, Pilze und Bodendecker'}</b><span>${items.map(([common,latin])=>`${common} <i>${latin}</i>`).join(' · ')}</span></section>`).join('')}`;}
function stateLabel(s){return ({grazing:'Grasen',fleeing:'Flucht',hunting:'Jagd',chasing:'Jagd',stalking:'Anschleichen',roaming:'Umherstreifen',resting:'Ruhen',searching:'Nahrungssuche',flying:'Fliegen',gliding:'Gleiten',swimming:'Schwimmen'})[s]||'Unterwegs';}

function setMode(next,notify=true){
  if(mode===next)return;
  if(next!=='walk'&&binocularOn)toggleBinoculars(false);
  if(next==='walk'){player.x=clamp(overview.x,-99,99);player.z=clamp(overview.z+4,-99,99);if(Math.hypot(player.x-40,player.z-35)<22){player.x=17;player.z=35;}player.yaw=overview.theta+Math.PI;player.pitch=-.05;followingId=null;}
  else{overview.x=player.x;overview.z=player.z;overview.theta=player.yaw+Math.PI;overview.distance=65;overview.phi=.62;}
  mode=next;$('overview').classList.toggle('selected',mode==='overview');$('walk').classList.toggle('selected',mode==='walk');$('joystick').hidden=mode!=='walk';$('crosshair').hidden=mode!=='walk';$('look-hint').hidden=mode!=='walk';$('binoculars').hidden=mode!=='walk';$('navigation-hint').textContent=mode==='walk'?'Links bewegen · Rechts umsehen · WASD am Computer · Fernglas für Beobachtungen':'Links verschieben · Rechts drehen · Zwei Finger / Mausrad zoomen · Tiere und Tafeln antippen';touchMove.x=touchMove.y=0;
  if(notify)toast(mode==='walk'?'Auf Augenhöhe. Links bewegen, rechts umsehen.':'Überblick. Zoome hinein, um die Lichtung zu betreten.');
}
function updateCamera(dt){
  const a=sim.agents.find(x=>x.id===followingId);if(a&&mode==='overview'){overview.x=THREE.MathUtils.lerp(overview.x,a.x,.05);overview.z=THREE.MathUtils.lerp(overview.z,a.z,.05);}else if(followingId&&!a){followingId=null;toast('Das beobachtete Tier ist nicht mehr Teil der Population.');}
  if(mode==='overview'){
    const h=landscape.heightAt(overview.x,overview.z);camera.position.set(overview.x+Math.sin(overview.theta)*Math.sin(overview.phi)*overview.distance,h+Math.cos(overview.phi)*overview.distance,overview.z+Math.cos(overview.theta)*Math.sin(overview.phi)*overview.distance);camera.lookAt(overview.x,h+1,overview.z);
    if(!started)overview.theta+=dt*.013;
  }else{
    let mx=touchMove.x+(keys.has('d')?1:0)-(keys.has('a')?1:0),my=-touchMove.y+(keys.has('w')?1:0)-(keys.has('s')?1:0);const length=Math.hypot(mx,my);if(length>1){mx/=length;my/=length;}
    const distance=dt*(keys.has('shift')?8:4.8),dx=(Math.sin(player.yaw)*my-Math.cos(player.yaw)*mx)*distance,dz=(Math.cos(player.yaw)*my+Math.sin(player.yaw)*mx)*distance;
    const nx=clamp(player.x+dx,-104,104),nz=clamp(player.z+dz,-104,104);if(Math.hypot(nx-40,nz-35)>20.5){player.x=nx;player.z=nz;}
    if(keys.has('arrowleft'))player.yaw+=dt;if(keys.has('arrowright'))player.yaw-=dt;
    camera.position.set(player.x,landscape.heightAt(player.x,player.z)+1.7,player.z);eyeTarget.set(player.x+Math.sin(player.yaw)*Math.cos(player.pitch),camera.position.y+Math.sin(player.pitch),player.z+Math.cos(player.yaw)*Math.cos(player.pitch));camera.lookAt(eyeTarget);
  }
  nearestBoard=null;if(mode==='walk'){let dist=9;for(const board of boards){const d=Math.hypot(player.x-board.note.x,player.z-board.note.z);if(d<dist){dist=d;nearestBoard=board;}}}$('interact').hidden=!nearestBoard||!$('info').hidden;if(nearestBoard)$('interact').innerHTML=nearestBoard.ecosystem?`Ökosystemstation öffnen <span>↗</span>`:`Infotafel lesen <span>↗</span>`;
}

function selectAt(x,y){if(!started)return;mouse.set(x/innerWidth*2-1,-y/innerHeight*2+1);raycaster.setFromCamera(mouse,camera);const meshes=boardMeshes.concat(...Object.values(pools).map(p=>p.parts.map(x=>x.batch)));const hits=raycaster.intersectObjects(meshes,false);if(hits.length){const hit=hits[0];if(hit.object.userData.ecosystem){showEcosystem(hit.object.userData.ecosystem);return;}if(hit.object.userData.board){showNote(hit.object.userData.board);return;}const a=animalByInstance[hit.object.userData.species]?.[hit.instanceId];if(a)showAnimal(a);}else closePanels();}

function moveStick(dx,dy){const length=Math.hypot(dx,dy),radius=42,ratio=Math.min(1,radius/(length||1));touchMove.x=dx*ratio/radius;touchMove.y=dy*ratio/radius;$('stick').style.transform=`translate(${dx*ratio}px,${dy*ratio}px)`;}
let stickPointer=null;
$('joystick').addEventListener('pointerdown',e=>{e.preventDefault();stickPointer=e.pointerId;$('joystick').setPointerCapture(e.pointerId);const r=$('joystick').getBoundingClientRect();moveStick(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2);});
$('joystick').addEventListener('pointermove',e=>{if(e.pointerId!==stickPointer)return;const r=$('joystick').getBoundingClientRect();moveStick(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2);});
function stopStick(){stickPointer=null;touchMove.x=touchMove.y=0;$('stick').style.transform='';}
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('joystick').addEventListener(event,stopStick);
canvas.addEventListener('pointerdown',e=>{if(!started)return;canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,startT:performance.now(),side:e.clientX<innerWidth/2?'left':'right'});if(pointers.size===2){const p=[...pointers.values()];lastPinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);touchMove.x=touchMove.y=0;}});
canvas.addEventListener('pointermove',e=>{const p=pointers.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;if(pointers.size===2&&mode==='overview'){const v=[...pointers.values()],distance=Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y);if(lastPinch)zoom(lastPinch/distance);lastPinch=distance;return;}if(pointers.size>1&&mode==='overview')return;
  if(mode==='walk'){if(p.side==='left'){moveStick((p.x-p.startX)*.65,(p.y-p.startY)*.65);}else{player.yaw-=dx*.004;player.pitch=clamp(player.pitch-dy*.003,-1.1,1.1);}}
  else if(p.side==='left'&&e.pointerType==='touch'){const pan=overview.distance*.0017;overview.x=clamp(overview.x+(-dx*Math.cos(overview.theta)-dy*Math.sin(overview.theta))*pan,-95,95);overview.z=clamp(overview.z+(dx*Math.sin(overview.theta)-dy*Math.cos(overview.theta))*pan,-95,95);followingId=null;}
  else{overview.theta-=dx*.005;overview.phi=clamp(overview.phi-dy*.004,.12,1.36);}
});
function releasePointer(e){const p=pointers.get(e.pointerId);if(!p)return;if(e.type==='pointerup'&&Math.hypot(e.clientX-p.startX,e.clientY-p.startY)<10&&performance.now()-p.startT<500&&pointers.size<2)selectAt(e.clientX,e.clientY);pointers.delete(e.pointerId);lastPinch=null;if(p.side==='left')stopStick();}
for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,releasePointer);
function zoom(factor){if(mode!=='overview')return;overview.distance=clamp(overview.distance*factor,7.5,180);if(overview.distance<10&&started)setMode('walk');}
canvas.addEventListener('wheel',e=>{e.preventDefault();if(mode==='overview')zoom(Math.exp(e.deltaY*.001));else if(e.deltaY<-20)player.pitch=clamp(player.pitch+.03,-1.1,1.1);},{passive:false});
document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;keys.add(e.key.toLowerCase());if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key==='Escape'){closePanels();$('help-modal').hidden=true;}if(e.key.toLowerCase()==='e'&&nearestBoard){nearestBoard.ecosystem?showEcosystem(nearestBoard.ecosystem):showNote(nearestBoard.note);}if(e.key===' '&&started)togglePause();});
document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{keys.clear();pointers.clear();stopStick();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();pointers.clear();stopStick();}});

function togglePause(){paused=!paused;$('pause').setAttribute('aria-label',paused?'Simulation fortsetzen':'Simulation pausieren');$('pause-icon').innerHTML=paused?'<path d="m8 5 11 7-11 7V5Z"/>':'<path d="M8 5v14M16 5v14"/>';}
$('pause').addEventListener('click',togglePause);
document.querySelectorAll('.rate').forEach(b=>b.addEventListener('click',()=>{rate=Number(b.dataset.rate);document.querySelectorAll('.rate').forEach(x=>x.classList.toggle('active',x===b));}));
$('overview').addEventListener('click',()=>setMode('overview'));$('walk').addEventListener('click',()=>setMode('walk'));
$('lab-button').addEventListener('click',()=>{$('lab').hidden?openPanel('lab'):closePanels();});$('chart-button').addEventListener('click',()=>{$('chart').hidden?openPanel('chart'):closePanels();});$('lexicon-button').addEventListener('click',()=>{$('lexicon').hidden?openPanel('lexicon'):closePanels();});$('binoculars').addEventListener('click',()=>toggleBinoculars());
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{$(b.dataset.close).hidden=true;if(['lab','chart','info','ecosystem-panel','lexicon'].includes(b.dataset.close))closePanels();}));
$('help').addEventListener('click',()=>{$('help-modal').hidden=false;stopStick();});$('help-done').addEventListener('click',()=>$('help-modal').hidden=true);
$('interact').addEventListener('click',()=>{if(nearestBoard){if(nearestBoard.ecosystem)showEcosystem(nearestBoard.ecosystem);else showNote(nearestBoard.note);}});
$('ecosystem-select').addEventListener('change',e=>populateEcosystemPanel(e.target.value));$('ecosystem-apply').addEventListener('click',()=>applyEcosystem($('ecosystem-select').value));
 $('info-action').addEventListener('click',()=>{if(followingId===selectedId){followingId=null;$('info-action').textContent='Tier mit der Kamera folgen →';observeSpecies(sim.agents.find(x=>x.id===selectedId));}else{if(mode==='walk')setMode('overview',false);followingId=selectedId;overview.distance=13;overview.phi=1.08;const a=sim.agents.find(x=>x.id===selectedId);if(a)observeSpecies(a);$('info-action').textContent='Beobachtung beenden';toast('Die Kamera folgt dem Tier. Zoome heraus für mehr Überblick.');}});
const factorNames={road:'Straßenbau',corridor:'Wildtierkorridor',mutation:'Mutation',selection:'Selektion',drift:'Genetische Drift',bottleneck:'Populationsengpass',climate:'Klima',disease:'Krankheit',mateChoice:'Partnerwahl',competition:'Konkurrenz',geneFlow:'Genfluss',habitatLoss:'Lebensraumverlust'};
function updateFactors(){landscape.setRoad(sim.factors.road,sim.factors.corridor);$('factor-corridor').disabled=!sim.factors.road;for(const name of Object.keys(factorNames)){const input=$(`factor-${name}`);if(input)input.checked=Boolean(sim.factors[name]);const ecoInput=document.querySelector(`[data-eco-factor="${name}"]`);if(ecoInput)ecoInput.checked=Boolean(sim.factors[name]);}$('active-factors').innerHTML=Object.entries(sim.factors).filter(([key,on])=>on&&(key!=='corridor'||sim.factors.road)).map(([key])=>`<span>${factorNames[key]}</span>`).join('');}
function populateEcosystemPanel(id){const eco=ECOSYSTEMS[id];const selectable=['forest','meadow','city','beach','wadden'];$('ecosystem-select').innerHTML=selectable.map(key=>{const x=ECOSYSTEMS[key];return `<option value="${x.id}" ${x.id===id?'selected':''}>${x.number} · ${x.title}</option>`;}).join('');$('ecosystem-description').textContent=eco.description;$('ecosystem-layers').innerHTML=eco.layers.map(layer=>`<span>${layer}</span>`).join('');const plantLayers=Object.entries(PLANT_SPECIES).map(([layer,items])=>`<div><b>${layer==='trees'?'Norddeutsche Bäume':layer==='shrubs'?'Sträucher':'Bodenflora'}</b><span>${items.map(item=>item[0]).join(' · ')}</span></div>`).join('');$('ecosystem-plants').innerHTML=`<span class="eyebrow">PFLANZENARTEN · WALDREFERENZ</span>${plantLayers}`;$('ecosystem-factors').innerHTML=Object.keys(FACTOR_CATALOG).map(name=>`<label class="eco-factor"><span class="factor-copy">${factorLabel(name)}<small>${eco.defaults.includes(name)?'Empfehlung für diesen Lebensraum':'optional zuschaltbar'}</small></span><input type="checkbox" data-eco-factor="${name}" ${sim.factors[name]?'checked':''}></label>`).join('');document.querySelectorAll('[data-eco-factor]').forEach(input=>input.addEventListener('change',()=>{sim.setFactor(input.dataset.ecoFactor,input.checked);updateFactors();}));}
function applyEcosystem(id){const eco=ECOSYSTEMS[id];currentEcosystem=id;setEcosystemIdentity(id);for(const name of Object.keys(factorNames))sim.setFactor(name,eco.defaults.includes(name));updateFactors();populateEcosystemPanel(id);toast(`${eco.title}: ${eco.defaults.length} passende Faktoren aktiviert.`);}
function toggleBinoculars(force){binocularOn=typeof force==='boolean'?force:!binocularOn;$('binocular-overlay').hidden=!binocularOn;$('binoculars').classList.toggle('active',binocularOn);$('binoculars').setAttribute('aria-pressed',String(binocularOn));camera.fov=binocularOn?28:55;camera.updateProjectionMatrix();if(binocularOn)toast('Fernglas aktiv. Suche Tiere und beobachte ihr Verhalten.');}
for(const name of Object.keys(factorNames))$('factor-'+name).addEventListener('change',e=>{sim.setFactor(name,e.target.checked);updateFactors();if(name==='road'&&e.target.checked){mark(3);toast('Der Lebensraum ist geteilt. Beobachte die westliche und östliche Population.');}if(name==='corridor'&&e.target.checked)toast('Der Übergang ist offen. Genfluss ist wieder möglich.');});
function addSpecies(species,count){const x=mode==='walk'?player.x:overview.x,z=mode==='walk'?player.z:overview.z;const region=species==='fish'?'any':{x,z,radius:11};const made=sim.add(species,count,region);const labels={fox:'Fuchs',hare:'Hasen',bird:'Vögel',fish:'Fische'};toast(made.length?`${made.length} ${labels[species]} eingesetzt.`:'Hier können keine weiteren Tiere eingesetzt werden.');updateHud();}
$('add-hare').addEventListener('click',()=>addSpecies('hare',5));$('add-fox').addEventListener('click',()=>addSpecies('fox',1));$('add-bird').addEventListener('click',()=>addSpecies('bird',2));$('add-fish').addEventListener('click',()=>addSpecies('fish',3));
let resetArmed=0;$('reset').addEventListener('click',()=>{if(Date.now()>resetArmed){resetArmed=Date.now()+5000;$('reset').textContent='Jetzt erneut tippen, um neu zu beginnen';setTimeout(()=>{$('reset').textContent='Expedition neu beginnen ↺';},5000);return;}sim.reset(84721);selectedId=followingId=null;lexiconFound.clear();lexiconObserved.clear();currentEcosystem='forest';setEcosystemIdentity('forest');for(const n of Object.keys(factorNames))$('factor-'+n).checked=false;updateFactors();achieved.clear();$('mission-status').textContent='FELDAUFTRAG · 0 / 4';$('mission-title').textContent=steps[0];$('mission-progress').style.width='0';overview={x:-8,z:8,distance:83,theta:.72,phi:.69};mode='walk';setMode('overview',false);overview.x=-8;overview.z=8;overview.distance=83;paused=false;$('pause-icon').innerHTML='<path d="M8 5v14M16 5v14"/>';updateHud();toast('Die Lichtung beginnt einen neuen Versuch.');});

function updateHud(){const s=sim.stats;$('day').textContent='Tag '+s.dayNumber;$('hare-count').textContent=s.hareCount;$('fox-count').textContent=s.foxCount;$('bird-count').textContent=s.birdCount??0;$('fish-count').textContent=s.fishCount??0;$('grass-count').textContent=Math.round(s.grass*100)+' %';$('mean-trait').textContent=formatTrait(s.meanTrait);$('west-trait').textContent=formatTrait(s.westTrait);$('east-trait').textContent=formatTrait(s.eastTrait);const selected=sim.agents.find(a=>a.id===selectedId);if(selected&&$('animal-state')){$('animal-state').textContent=stateLabel(selected.state);$('animal-energy').textContent=Math.round(selected.energy*100)+' %';$('animal-region').textContent=selected.species==='fish'?'Freiwasser':selected.x<0?'West':'Ost';}else if(selectedId&&$('animal-state')){$('animal-state').textContent='Nicht mehr vorhanden';$('animal-energy').textContent='–';$('info-action').hidden=true;}let text;if(!s.hareCount)text='<b>Die Beutepopulation ist ausgestorben.</b>Die Füchse verlieren ihre Nahrung. Setze Hasen ein oder beginne einen neuen Versuch.';else if(!s.foxCount)text='<b>Die Räuberpopulation ist ausgestorben.</b>Jetzt begrenzen vor allem Nahrung und Fortpflanzung die Hasenpopulation.';else text=`<b>${s.hareCount} Hasen und ${s.foxCount} Füchse teilen sich die Lichtung.</b>${sim.factors.road?(sim.factors.corridor?'Der Korridor ermöglicht Austausch zwischen beiden Seiten.':sim.factors.geneFlow?'Die Straße ist durchlässig genug für seltenen Genfluss.':'Die Straße unterbricht den Austausch zwischen den Teilpopulationen.'):'Der Lebensraum ist zusammenhängend.'} ${sim.factors.mutation?'Mutation kann neue Merkmalsvarianten erzeugen.':''}${sim.factors.disease&&s.infected?` ${s.infected} Tiere sind erkrankt.`:''} <span class="small-note">${s.birdCount??0} Vögel und ${s.fishCount??0} Fische erweitern die Nahrungsketten.</span>`;$('ecosystem-status').innerHTML=text;if(!$('chart').hidden)drawChart();}
function formatTrait(v){return Number.isFinite(v)&&v>0?v.toFixed(2).replace('.',',')+'×':'–';}
function drawChart(){const c=$('population-chart'),r=c.getBoundingClientRect();if(!r.width)return;const dpr=Math.min(devicePixelRatio,2);c.width=r.width*dpr;c.height=180*dpr;const ctx=c.getContext('2d');ctx.scale(dpr,dpr);const w=r.width,h=180,pad=26,history=sim.history.slice(-180),max=Math.max(20,...history.map(x=>Math.max(x.hareCount??x.hares??0,x.foxCount??x.foxes??0)));ctx.font='9px sans-serif';ctx.fillStyle='#96a98b';ctx.strokeStyle='#dfe8cf16';ctx.lineWidth=1;for(let i=0;i<4;i++){const y=8+(h-25)*i/3;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w,y);ctx.stroke();ctx.fillText(Math.round(max*(1-i/3)),0,y+3);}for(const [key,alt,color]of [['hareCount','hares','#d4e8a4'],['foxCount','foxes','#db9870']]){ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();history.forEach((p,i)=>{const x=pad+i/Math.max(1,history.length-1)*(w-pad),y=8+(1-(p[key]??p[alt]??0)/max)*(h-25);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();}if(history.length)$('history-range').textContent=`Tag ${1+Math.floor(history[0].day)} – ${1+Math.floor(history.at(-1).day)}`;}

function toggleSound(){
  if(!audio){audio=new (window.AudioContext||window.webkitAudioContext)();const buffer=audio.createBuffer(1,audio.sampleRate*3,audio.sampleRate),data=buffer.getChannelData(0);let brown=0;for(let i=0;i<data.length;i++){brown=(brown+(Math.random()*2-1)*.017)/1.02;data[i]=brown*.8;}const source=audio.createBufferSource();source.buffer=buffer;source.loop=true;const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=650;const gain=audio.createGain();gain.gain.value=.5;source.connect(filter).connect(gain).connect(audio.destination);source.start();setInterval(()=>{if(!soundOn||document.hidden)return;const osc=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime;osc.type='sine';osc.frequency.setValueAtTime(2300+Math.random()*1100,now);osc.frequency.exponentialRampToValueAtTime(1700+Math.random()*500,now+.14);g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(.012,now+.025);g.gain.exponentialRampToValueAtTime(.0001,now+.2);osc.connect(g).connect(audio.destination);osc.start(now);osc.stop(now+.21);},3200);}
  soundOn=!soundOn;if(soundOn)audio.resume();else audio.suspend();$('sound').classList.toggle('off',!soundOn);$('sound').setAttribute('aria-label',soundOn?'Naturklänge ausschalten':'Naturklänge einschalten');toast(soundOn?'Naturklänge eingeschaltet.':'Naturklänge ausgeschaltet.');
}
$('sound').classList.add('off');$('sound').addEventListener('click',toggleSound);
$('start').disabled=true;
$('chart-button').setAttribute('aria-label','Populationen');
$('start').addEventListener('click',()=>{started=true;document.body.classList.remove('intro');$('welcome').hidden=true;$('game-ui').hidden=false;overview.distance=65;overview.phi=.76;updateHud();toast('Willkommen auf der Lichtung. Tippe eine Infotafel an oder erkunde sie zu Fuß.');});

try {
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<900?1.5:1.8));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#a7b7a0',.0026);camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.08,2000);
  buildSky();landscape=createLandscape(scene,renderer);applyNaturalTextures();createAnimalPools();makeBoards();updateFactors();syncAnimals();updateCamera(.016);renderer.render(scene,camera);
  $('start').disabled=false;$('loading').textContent='Die Lichtung ist bereit.';setTimeout(()=>$('loading').hidden=true,1800);
  let last=performance.now(),lastHud=0;
  function animate(now){const dt=Math.min((now-last)/1000,.05);last=now;if(!document.hidden){elapsed+=dt;if(started&&!paused&&$('help-modal').hidden)sim.update(dt*rate);landscape.update(elapsed);syncAnimals();updateCamera(dt);renderer.render(scene,camera);if(now-lastHud>350){updateHud();lastHud=now;}}requestAnimationFrame(animate);}
  requestAnimationFrame(animate);
  window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);drawChart();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('error-detail').textContent='Die Grafikverbindung wurde unterbrochen. Lade das Spiel neu, um weiterzuspielen.';$('error').hidden=false;});
} catch(error){$('error-detail').textContent='Dein Browser benötigt WebGL 2 für diese 3D-Welt. '+error.message;$('error').hidden=false;console.error(error);}
