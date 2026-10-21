import * as THREE from './vendor/three.module.js';

// Anatomical browser geometry. Forward is +Z; feet rest at local Y=0.
// Geometry and fur materials are shared across all population members.
const sphere = new THREE.SphereGeometry(1, 24, 16);
const mediumSphere = new THREE.SphereGeometry(1, 16, 12);
const detailSphere = new THREE.SphereGeometry(1, 12, 8);
const limbGeo = new THREE.CylinderGeometry(1, 1, 1, 10);
const coneGeo = new THREE.ConeGeometry(1, 1, 18);
const speciesMaterials = new Map();

function furMaterial(base, grain = 0.18) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const color = new THREE.Color(base);
  ctx.fillStyle = base; ctx.fillRect(0, 0, 256, 256);
  let seed = 71;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 7500; i++) {
    const x = random() * 256, y = random() * 256;
    const tone = 0.62 + random() * 0.8;
    const c = color.clone().multiplyScalar(tone).convertLinearToSRGB();
    ctx.strokeStyle = `rgba(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)},${grain})`;
    ctx.lineWidth = 0.4 + random()*0.6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (random()-.5)*2, y + 3 + random()*10); ctx.stroke();
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 4;
  // A fine height-derived normal map catches light across the short fur. It is
  // deliberately subtle: the silhouette comes from geometry, the normal map
  // adds the small directional variation visible in close-up.
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = normalCanvas.height = 128;
  const normalCtx = normalCanvas.getContext('2d');
  const normalData = normalCtx.createImageData(128, 128);
  for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
    const i = (y * 128 + x) * 4;
    const h = Math.sin(x * .58 + Math.sin(y * .17)) * .5 + Math.sin(y * .81 + x * .07) * .3;
    const hx = Math.cos(x * .58 + Math.sin(y * .17)) * .23;
    const hy = Math.cos(y * .81 + x * .07) * .23;
    normalData.data[i] = 128 + hx * 48;
    normalData.data[i + 1] = 128 + hy * 48;
    normalData.data[i + 2] = 255;
    normalData.data[i + 3] = 255;
  }
  normalCtx.putImageData(normalData, 0, 0);
  const normalMap = new THREE.CanvasTexture(normalCanvas);
  normalMap.colorSpace = THREE.NoColorSpace;
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(2.2, 2.2);
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff, map, normalMap, normalScale: new THREE.Vector2(.22, .22),
    roughness: .9, metalness: 0, sheen: .12, sheenRoughness: .72, vertexColors: true,
  });
}

function palette(species) {
  if (speciesMaterials.has(species)) return speciesMaterials.get(species);
  const fox = species === 'fox';
  const bird = species === 'bird';
  const fish = species === 'fish';
  const p = {
    coat: furMaterial(fox ? '#a94c20' : bird ? '#68705b' : fish ? '#718b89' : '#78674f', .30),
    back: furMaterial(fox ? '#874024' : bird ? '#3d493d' : fish ? '#3f626b' : '#665842', .34),
    light: furMaterial(fox ? '#d3c5a8' : bird ? '#c7c2aa' : fish ? '#b8d2cb' : '#b7a98d', .24),
    dark: furMaterial(fox ? '#302923' : bird ? '#27312a' : fish ? '#1b353d' : '#514735', .26),
    ear: furMaterial(fox ? '#7d5147' : bird ? '#a78b63' : fish ? '#54767a' : '#806552', .20),
    nose: new THREE.MeshPhysicalMaterial({color: '#201d19', roughness: .24, clearcoat: .72, clearcoatRoughness: .12}),
    eye: new THREE.MeshPhysicalMaterial({color: '#140e09', roughness: .08, clearcoat: .9, clearcoatRoughness: .06}),
    eyeGlint: new THREE.MeshBasicMaterial({color: '#fffbe8'}),
    whisker: new THREE.MeshBasicMaterial({color: fox ? '#d7c4a9' : '#cfc4ac', transparent: true, opacity: .62}),
  };
  speciesMaterials.set(species, p); return p;
}

function part(parent, material, xyz, scale, geometry = sphere, rotation = null) {
  if (geometry === sphere) {
    const extent = Math.max(...scale), thickness = Math.min(...scale);
    // Preserve round body silhouettes; tiny details do not need body tessellation.
    geometry = extent > .23 && thickness > .09 ? sphere
      : extent > .105 && thickness > .075 ? mediumSphere : detailSphere;
  }
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...xyz); mesh.scale.set(...scale);
  if (rotation) mesh.rotation.set(...rotation);
  mesh.castShadow = true; mesh.receiveShadow = true;
  parent.add(mesh); return mesh;
}

function limb(parent, material, a, b, width) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
  const mesh = new THREE.Mesh(limbGeo, material);
  mesh.position.copy(start).add(end).multiplyScalar(.5);
  mesh.scale.set(width, start.distanceTo(end), width);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
  mesh.castShadow = true; parent.add(mesh); return mesh;
}

function whiskers(parent, p, isFox) {
  const group = new THREE.Group();
  const originZ = isFox ? .285 : .152;
  const originY = isFox ? -.02 : -.018;
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
    const spread = (i - 1) * .025;
    const start = new THREE.Vector3(side * (isFox ? .035 : .021), originY + spread, originZ);
    const end = new THREE.Vector3(side * (isFox ? .19 : .12), originY + spread * 2 + (i - 1) * .022, originZ + .035 + i * .012);
    const curve = new THREE.CatmullRomCurve3([start, start.clone().lerp(end, .55).add(new THREE.Vector3(0, .008 * side, .012)), end]);
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 5, isFox ? .004 : .003, 4, false), p.whisker);
    group.add(mesh);
  }
  parent.add(group);
  return group;
}

function ears(parent, p, isFox) {
  const ears = [];
  for (const side of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(side*(isFox?.115:.084), isFox?.18:.11, -.02);
    ear.rotation.z = side * (isFox ? -.12 : -.16);
    parent.add(ear);
    if (isFox) {
      part(ear, p.dark, [0,.10,0], [.085,.20,.065], coneGeo, [.12,0,0]);
      part(ear, p.coat, [0,.09,.018], [.07,.17,.045], coneGeo, [.12,0,0]);
      part(ear, p.ear, [0,.09,.047], [.044,.135,.01], coneGeo, [.12,0,0]);
    } else {
      part(ear, p.coat, [0,.20,0], [.045,.25,.022]);
      part(ear, p.ear, [0,.205,.019], [.025,.208,.006]);
      part(ear, p.dark, [0,.399,-.003], [.037,.048,.02]);
    }
    ears.push(ear);
  }
  return ears;
}

const tailCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0,0,0), new THREE.Vector3(0,-.10,-.20),
  new THREE.Vector3(.04,-.19,-.46), new THREE.Vector3(.08,-.10,-.69),
]);
const foxTailGeometry = new THREE.TubeGeometry(tailCurve, 18, .105, 10, false);

function makeFox(p) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  part(body,p.coat,[0,.68,-.04],[.19,.25,.43]);
  part(body,p.back,[0,.805,-.08],[.168,.14,.395]);
  part(body,p.coat,[0,.72,.35],[.17,.245,.235],sphere,[.26,0,0]);
  part(body,p.light,[0,.62,.45],[.105,.165,.105]);
  const head = new THREE.Group(); head.position.set(0,.855,.50); body.add(head);
  part(head,p.coat,[0,0,0],[.14,.135,.177]);
  part(head,p.light,[0,-.076,.126],[.084,.04,.141]);
  part(head,p.light,[0,-.015,.20],[.082,.095,.10], mediumSphere);
  part(head,p.coat,[0,-.019,.193],[.075,.22,.075],coneGeo,[Math.PI/2,0,0]);
  part(head,p.nose,[0,-.006,.30],[.038,.023,.023]);
  for (const side of [-1,1]) {
    part(head,p.dark,[side*.112,.018,.095],[.030,.021,.030]);
    part(head,p.eye,[side*.125,.022,.109],[.012,.012,.017], detailSphere);
    part(head,p.eyeGlint,[side*.129,.026,.121],[.0028,.0028,.0028], detailSphere);
  }
  const earParts = ears(head,p,true);
  whiskers(head, p, true);
  const legs = [];
  for (const rear of [false,true]) for (const side of [-1,1]) {
    const leg = new THREE.Group(); leg.position.set(side*.135,.67,rear?-.34:.31); body.add(leg);
    part(leg,p.coat,[0,-.105,rear?-.015:0],[.07,rear?.17:.15,.095]);
    limb(leg,p.coat,[0,-.07,0],[0,-.33,rear?.08:-.015],.044);
    const knee = new THREE.Group(); knee.position.set(0,-.31,rear?.08:-.015); leg.add(knee);
    limb(knee,p.dark,[0,0,0],[0,-.305,rear?-.085:.015],.029);
    const paw=part(knee,p.dark,[0,-.33,rear?-.05:.05],[.04,.032,.081]);
    legs.push({leg,knee,paw,rear,side});
  }
  const tail = new THREE.Group(); tail.position.set(0,.68,-.46); body.add(tail);
  part(tail,p.coat,[0,0,0],[1,1,1],foxTailGeometry);
  part(tail,p.light,[.08,-.10,-.67],[.082,.082,.16],sphere,[.36,0,0]);
  root.userData.anatomy = {body,head,ears:earParts,legs,tail};
  return root;
}

function makeHare(p) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  part(body,p.coat,[0,.33,-.06],[.145,.18,.28]);
  part(body,p.back,[0,.405,-.12],[.135,.13,.24]);
  part(body,p.light,[0,.22,.04],[.113,.077,.19]);
  part(body,p.coat,[0,.395,.145],[.092,.12,.13],sphere,[-.3,0,0]);
  const head = new THREE.Group(); head.position.set(0,.48,.25); body.add(head);
  part(head,p.coat,[0,0,0],[.086,.101,.123]);
  part(head,p.light,[0,-.038,.077],[.068,.047,.084]);
  part(head,p.light,[0,-.02,.105],[.048,.037,.045], mediumSphere);
  part(head,p.coat,[0,-.018,.115],[.057,.051,.056]);
  part(head,p.nose,[0,-.017,.164],[.018,.013,.01]);
  for (const side of [-1,1]) {
    part(head,p.eye,[side*.078,.026,.068],[.012,.014,.013], detailSphere);
    part(head,p.eyeGlint,[side*.081,.029,.079],[.0026,.0026,.0026], detailSphere);
  }
  const earParts = ears(head,p,false), legs = [];
  whiskers(head, p, false);
  for (const rear of [false,true]) for (const side of [-1,1]) {
    const leg = new THREE.Group(); leg.position.set(side*(rear?.128:.072),rear?.31:.32,rear?-.19:.15); body.add(leg);
    if(rear) part(leg,p.coat,[0,-.035,-.005],[.10,.137,.148]);
    limb(leg,p.coat,[0,0,0],[0,rear?-.20:-.16,rear?.075:.005],rear?.043:.022);
    const knee = new THREE.Group(); knee.position.set(0,rear?-.18:-.16,rear?.075:.005); leg.add(knee);
    limb(knee,p.coat,[0,0,0],[0,rear?-.078:-.135,rear?-.08:.018],rear?.025:.017);
    const paw=part(knee,p.coat,[0,rear?-.103:-.14,rear?.026:.055],[rear?.039:.023,.025,rear?.122:.057]);
    legs.push({leg,knee,paw,rear,side});
  }
  part(body,p.light,[0,.335,-.332],[.053,.051,.058]);
  root.userData.anatomy = {body,head,ears:earParts,legs,tail:null};
  return root;
}

function makeBird(p) {
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  part(body, p.coat, [0, .34, 0], [.18, .19, .30]);
  part(body, p.back, [0, .405, -.08], [.16, .10, .24]);
  const head = new THREE.Group(); head.position.set(0, .47, .22); body.add(head);
  part(head, p.coat, [0, 0, 0], [.14, .14, .15]);
  part(head, p.light, [0, -.015, .095], [.10, .075, .09]);
  part(head, p.dark, [0, -.005, .145], [.045, .035, .09], coneGeo, [Math.PI / 2, 0, 0]);
  for (const side of [-1, 1]) {
    part(head, p.eye, [side * .09, .035, .075], [.014, .014, .014], detailSphere);
    part(head, p.eyeGlint, [side * .094, .039, .085], [.003, .003, .003], detailSphere);
  }
  const wings = [];
  for (const side of [-1, 1]) {
    const wing = new THREE.Group(); wing.position.set(side * .14, .38, -.03); wing.rotation.z = side * .16; body.add(wing);
    part(wing, p.back, [side * .10, 0, -.04], [.20, .045, .28], sphere, [0, side * .26, side * .08]);
    part(wing, p.dark, [side * .23, -.01, -.12], [.15, .025, .14], sphere, [0, side * .32, side * .08]);
    wings.push(wing);
  }
  const tail = new THREE.Group(); tail.position.set(0, .34, -.25); body.add(tail);
  part(tail, p.back, [0, .01, -.16], [.12, .045, .28], coneGeo, [-Math.PI / 2, 0, 0]);
  const legs = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(side * .06, .19, .06); body.add(leg);
    limb(leg, p.ear, [0, 0, 0], [0, -.10, .015], .014);
    part(leg, p.dark, [0, -.11, .035], [.055, .012, .035]);
    legs.push({leg, knee: leg, rear: false, side});
  }
  root.userData.anatomy = {body, head, ears: [], legs, tail, wings};
  return root;
}

function makeFish(p) {
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  part(body, p.coat, [0, .12, 0], [.24, .14, .48]);
  part(body, p.light, [0, .09, .18], [.19, .09, .26]);
  const head = new THREE.Group(); head.position.set(0, .12, .33); body.add(head);
  part(head, p.coat, [0, 0, 0], [.22, .13, .24]);
  for (const side of [-1, 1]) {
    part(head, p.eye, [side * .16, .055, .10], [.025, .025, .025], detailSphere);
    part(head, p.eyeGlint, [side * .168, .06, .113], [.005, .005, .005], detailSphere);
  }
  const tail = new THREE.Group(); tail.position.set(0, .12, -.43); body.add(tail);
  part(tail, p.back, [0, 0, -.16], [.03, .22, .23], coneGeo, [Math.PI / 2, 0, 0]);
  const fins = [];
  part(body, p.back, [0, .26, -.03], [.06, .10, .22], coneGeo, [0, 0, 0]);
  for (const side of [-1, 1]) {
    const fin = part(body, p.dark, [side * .20, .05, -.03], [.13, .025, .18], sphere, [0, side * .32, side * .10]);
    fins.push(fin);
  }
  root.userData.anatomy = {body, head, ears: [], legs: [], tail, wings: [], fins};
  return root;
}

export function createAnimal(species) {
  const isFox = species === 'fox' || species === 'predator' || species === 'Fuchs';
  const isBird = species === 'bird';
  const isFish = species === 'fish';
  const canonical = isFox ? 'fox' : isBird ? 'bird' : isFish ? 'fish' : 'hare';
  const p = palette(canonical), root = isFox ? makeFox(p) : isBird ? makeBird(p) : isFish ? makeFish(p) : makeHare(p);
  // A hare's long ears and a fox's long tail define different body proportions.
  // Instanced meshes retain this anatomical scaling in their source matrices.
  root.scale.set(isFox ? .85 : isBird ? .55 : isFish ? .8 : .75, isFox ? .65 : isBird ? .55 : isFish ? .8 : .62, isFish ? .92 : 1);
  const anatomy = root.userData.anatomy;
  const phase = Math.random()*Math.PI*2;
  root.userData.species = canonical;
  root.userData.update = (time = 0, speed = 0, state = 'idle', trait = null) => {
    const move = Math.min(1,Math.abs(Number(speed)||0));
    if (isBird) {
      const flap = Math.sin(time * 10 + phase) * (.24 + move * .22);
      anatomy.body.position.y = Math.sin(time * 2.2 + phase) * .035;
      anatomy.head.rotation.y = Math.sin(time * .7 + phase) * .08;
      anatomy.wings.forEach((wing, i) => { wing.rotation.x = (i ? -1 : 1) * flap; wing.rotation.z = (i ? -1 : 1) * (.16 + move * .12); });
      if (anatomy.tail) anatomy.tail.rotation.y = Math.sin(time * 2 + phase) * .04;
      return;
    }
    if (isFish) {
      anatomy.body.rotation.y = Math.sin(time * 3 + phase) * .055;
      anatomy.body.position.y = Math.sin(time * 2.4 + phase) * .018;
      if (anatomy.tail) anatomy.tail.rotation.y = Math.sin(time * 7 + phase) * (.15 + move * .16);
      anatomy.fins.forEach((fin, i) => { fin.rotation.z = Math.sin(time * 4 + phase + i) * .08; });
      return;
    }
    const gait = time*(isFox ? 8+move*9 : 8+move*8)+phase;
    const running = isFox && move > .8 && (state === 'hunting' || state === 'fleeing');
    anatomy.body.position.y = isFox ? Math.sin(gait*2)*(running ? .019 : .009)*move : Math.max(0,Math.sin(gait))*.07*move;
    anatomy.body.rotation.x = isFox ? 0 : Math.cos(gait)*.065*move;
    anatomy.head.rotation.y = move<.05 ? Math.sin(time*.55+phase)*.13 : Math.sin(gait*.5)*.015;
    anatomy.head.rotation.x = state==='graze'||state==='grazing' ? .27+Math.sin(time*2)*.025 : Math.sin(time*1.1+phase)*.025;
    anatomy.legs.forEach(({leg,knee,rear,side})=>{
      const angle = isFox ? Math.sin(gait+(rear?Math.PI:0)+(running ? side*.12 : side<0?Math.PI:0)) : Math.sin(gait+(rear?Math.PI:0));
      leg.rotation.x = angle*(isFox?.38:.5)*move;
      knee.rotation.x = Math.max(0,-angle)*(isFox?.25:.38)*move;
    });
    anatomy.ears?.forEach((ear,i)=>{ear.rotation.x=Math.sin(time*.6+phase+i)*.06;});
    if(anatomy.tail) { anatomy.tail.rotation.y=Math.sin(time*2+phase)*(.055+move*.06); anatomy.tail.rotation.x=-move*.08; }
  };
  return root;
}
