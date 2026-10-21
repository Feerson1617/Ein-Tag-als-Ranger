import * as THREE from 'three';
import { ALL_PLANT_SPECIES, PLANT_SPECIES } from './ecosystems.js';

// The woodland has metres as its unit; every placed object samples this terrain.
export function createLandscape(scene, renderer) {
  let seed = 734951;
  const rand = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const between = (a, b) => a + (b - a) * rand();
  const smooth = (v) => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };
  const resources = [];
  const own = o => { resources.push(o); return o; };
  const group = new THREE.Group();
  // Species metadata travels with the landscape so a later high-fidelity
  // asset pass can replace individual instances without changing the scene API.
  group.userData.plantCatalog = ALL_PLANT_SPECIES;
  group.userData.layerCatalog = PLANT_SPECIES;
  group.name = 'Lebendiger Wald';
  scene.add(group);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  function texture(size, paint, repeat = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    paint(canvas.getContext('2d'), size);
    const tex = own(new THREE.CanvasTexture(canvas));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat, repeat);
    tex.anisotropy = maxAnisotropy;
    return tex;
  }

  function addWind(material, amount, frequency) {
    material.onBeforeCompile = shader => {
      shader.uniforms.uWindTime = { value: 0 };
      shader.vertexShader = `uniform float uWindTime;\n${shader.vertexShader}`;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
        #include <begin_vertex>
        float windPhase = uWindTime * ${frequency.toFixed(3)} + instanceMatrix[3][0] * .071 + instanceMatrix[3][2] * .053;
        transformed.x += sin(windPhase + position.y * 3.8) * ${amount.toFixed(4)} * max(position.y, 0.0);
        transformed.z += cos(windPhase * .83 + position.y * 3.1) * ${(amount * .72).toFixed(4)} * max(position.y, 0.0);
      `);
      material.userData.windShader = shader;
    };
    material.customProgramCacheKey = () => `wind-${amount}-${frequency}`;
  }

  const earthMap = texture(512, (ctx, s) => {
    ctx.fillStyle = '#555d3d'; ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 23000; i++) {
      const v = Math.floor(between(38, 115));
      ctx.fillStyle = `rgba(${v},${Math.round(v * 1.09)},${Math.round(v * .63)},${between(.15, .55)})`;
      const x = rand() * s, y = rand() * s;
      ctx.fillRect(x, y, between(.7, 3.6), between(.5, 4.5));
    }
    for (let i = 0; i < 3400; i++) {
      ctx.strokeStyle = `rgba(${between(78, 125) | 0},${between(91, 132) | 0},48,.27)`;
      const x = rand() * s, y = rand() * s;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + between(-3, 3), y - between(2, 8)); ctx.stroke();
    }
  }, 26);

  const barkMap = texture(256, (ctx, s) => {
    ctx.fillStyle = '#615848'; ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 1300; i++) {
      const v = between(35, 105) | 0;
      ctx.strokeStyle = `rgba(${v + 12},${v + 5},${v},${between(.2, .8)})`;
      ctx.lineWidth = between(.4, 2.7);
      const x = rand() * s, y = rand() * s;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + between(-3, 3), y + between(8, 65)); ctx.stroke();
    }
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = 'rgba(182,183,148,.22)';
      ctx.beginPath(); ctx.ellipse(rand() * s, rand() * s, between(1, 8), between(1, 5), 0, 0, Math.PI * 2); ctx.fill();
    }
  });
  barkMap.repeat.set(2, 5);

  const leafMap = texture(512, (ctx, s) => {
    // Sparse layered leaf sprays keep sky visible through the canopy.
    ctx.clearRect(0, 0, s, s);
    for (let b = 0; b < 8; b++) {
      const bx = between(.23, .76) * s, by = between(.2, .8) * s;
      ctx.strokeStyle = 'rgba(75,79,38,.82)'; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(s * .5, s * .92); ctx.quadraticCurveTo(s * .49, by, bx, by); ctx.stroke();
      for (let j = 0; j < 26; j++) {
        const x = bx + between(-.2, .2) * s, y = by + between(-.17, .17) * s;
        const a = between(-Math.PI, Math.PI), length = between(10, 23), width = length * between(.3, .48);
        ctx.save(); ctx.translate(x, y); ctx.rotate(a);
        const green = between(90, 155) | 0;
        const leafFill = ctx.createLinearGradient(-width, -length, width, length);
        leafFill.addColorStop(0, `rgb(${Math.round(green * .71)},${Math.min(177, green + 19)},${Math.round(green * .39)})`);
        leafFill.addColorStop(.55, `rgb(${Math.round(green * .59)},${green},${Math.round(green * .35)})`);
        leafFill.addColorStop(1, `rgb(${Math.round(green * .49)},${Math.round(green * .9)},${Math.round(green * .32)})`);
        ctx.fillStyle = leafFill;
        ctx.beginPath(); ctx.moveTo(0, -length); ctx.bezierCurveTo(width, -length * .45, width, length * .65, 0, length);
        ctx.bezierCurveTo(-width, length * .5, -width, -length * .6, 0, -length); ctx.fill();
        ctx.strokeStyle = 'rgba(197,209,120,.37)'; ctx.lineWidth = .7;
        ctx.beginPath(); ctx.moveTo(0, -length * .83); ctx.lineTo(0, length * .8); ctx.stroke();
        ctx.restore();
      }
    }
  });
  leafMap.wrapS = leafMap.wrapT = THREE.ClampToEdgeWrapping;

  // Opaque mottled foliage for the inner crown volume. Leaf cards describe the
  // outer silhouette; these softly irregular clusters prevent the canopy from
  // reading as a collection of flat sprites from the eye-level camera.
  const clusterMap = texture(256, (ctx, s) => {
    ctx.fillStyle = '#50683c'; ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 9000; i++) {
      const g = between(50, 132) | 0;
      ctx.fillStyle = `rgba(${Math.round(g * .48)},${g},${Math.round(g * .35)},${between(.25, .75)})`;
      ctx.beginPath(); ctx.ellipse(rand() * s, rand() * s, between(1, 9), between(1, 6), rand() * 3.14, 0, Math.PI * 2); ctx.fill();
    }
  }, 1.4);
  clusterMap.colorSpace = THREE.SRGBColorSpace;

  const gravelMap = texture(512, (ctx, s) => {
    ctx.fillStyle = '#988873'; ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 19000; i++) {
      const v = between(85, 174) | 0;
      ctx.fillStyle = `rgba(${v + 12},${v + 3},${v - 15},.56)`;
      ctx.beginPath(); ctx.ellipse(rand() * s, rand() * s, between(.5, 2.1), between(.6, 2), rand() * 3, 0, Math.PI * 2); ctx.fill();
    }
  }, 16);
  const asphaltMap = texture(512, (ctx, s) => {
    ctx.fillStyle = '#414441'; ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 35000; i++) {
      const v = between(25, 102) | 0;
      ctx.fillStyle = `rgba(${v},${v + 2},${v + 1},.5)`;
      ctx.fillRect(rand() * s, rand() * s, between(.5, 2.4), between(.5, 2.4));
    }
    ctx.strokeStyle = 'rgba(19,21,18,.7)'; ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      let x = rand() * s, y = rand() * s;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let j = 0; j < 7; j++) { x += between(-12, 12); y += between(5, 19); ctx.lineTo(x, y); }
      ctx.stroke();
    }
  }, 13);
  function baseHeight(x, z) {
    return .7 + Math.sin(x * .031) * 1.6 + Math.cos(z * .035) * 1.15
      + Math.sin((x + z) * .064) * .36 + Math.cos((x - z) * .043) * .32;
  }
  function heightAt(x, z) {
    const r = Math.hypot(x - 40, z - 35);
    if (r < 19.5) return -1.5 + (r / 19.5) ** 2 * 1.75;
    if (r < 27) return THREE.MathUtils.lerp(.25, baseHeight(x, z), smooth((r - 19.5) / 7.5));
    return baseHeight(x, z);
  }

  const terrainGeo = own(new THREE.PlaneGeometry(280, 280, 180, 180));
  terrainGeo.rotateX(-Math.PI / 2);
  const terrainPos = terrainGeo.attributes.position;
  const terrainColors = [];
  for (let i = 0; i < terrainPos.count; i++) {
    const x = terrainPos.getX(i), z = terrainPos.getZ(i), r = Math.hypot(x - 40, z - 35);
    terrainPos.setY(i, heightAt(x, z));
    const v = .83 + rand() * .14;
    color.setRGB(v, v, v * .94);
    if (r < 24) color.lerp(new THREE.Color('#b6a189'), (1 - smooth((r - 19) / 5)) * .67);
    terrainColors.push(color.r, color.g, color.b);
  }
  terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(terrainColors, 3));
  terrainGeo.computeVertexNormals();
  const terrainMat = own(new THREE.MeshStandardMaterial({ map: earthMap, color: '#c6c9a3', roughness: 1, vertexColors: true }));
  const terrain = new THREE.Mesh(terrainGeo, terrainMat); terrain.receiveShadow = true; group.add(terrain);

  function strip(centerAt, halfWidth, steps, start, end, material, lift = .035) {
    const positions = [], uv = [], indices = [];
    for (let i = 0; i <= steps; i++) {
      const t = start + (end - start) * i / steps;
      const p = centerAt(t), next = centerAt(t + .1);
      const angle = Math.atan2(next.z - p.z, next.x - p.x);
      const nx = -Math.sin(angle) * halfWidth, nz = Math.cos(angle) * halfWidth;
      for (const side of [-1, 1]) {
        const x = p.x + nx * side, z = p.z + nz * side;
        positions.push(x, heightAt(x, z) + lift, z); uv.push((side + 1) / 2, i / steps);
      }
      if (i < steps) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const geo = own(new THREE.BufferGeometry());
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(indices); geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, material); mesh.receiveShadow = true; return mesh;
  }
  const pathMat = own(new THREE.MeshStandardMaterial({ map: gravelMap, roughness: 1, color: '#d7c9b1', side: THREE.DoubleSide }));
  group.add(strip(t => ({x: 15 + Math.sin(t * .035) * 11, z: t}), 1.13, 120, -120, 110, pathMat));
  group.add(strip(t => ({x: t, z: -21 + Math.sin(t * .048) * 7}), .9, 80, -80, 78, pathMat, .042));

  // Low-poly counts are confined to distant instances; silhouettes are rounded and varied.
  const trunkGeo = own(new THREE.CylinderGeometry(.68, 1, 1, 11, 3));
  const branchGeo = own(new THREE.CylinderGeometry(.26, .58, 1, 7, 1));
  const woodMat = own(new THREE.MeshStandardMaterial({ map: barkMap, roughness: .99, color: '#b1a18b' }));
  const trunks = new THREE.InstancedMesh(trunkGeo, woodMat, 280);
  const branches = new THREE.InstancedMesh(branchGeo, woodMat, 1600);
  const leafGeo = own(new THREE.PlaneGeometry(1, 1, 1, 1));
  const leafMat = own(new THREE.MeshStandardMaterial({ map: leafMap, alphaTest: .4, side: THREE.DoubleSide,
    roughness: .89, color: '#f6ffe9', emissive: '#30451f', emissiveIntensity: .12 }));
  addWind(leafMat, .016, .72);
  const canopy = new THREE.InstancedMesh(leafGeo, leafMat, 22000);
  const clusterGeo = own(new THREE.IcosahedronGeometry(1, 2));
  const clusterPos = clusterGeo.attributes.position;
  for (let i = 0; i < clusterPos.count; i++) {
    const x = clusterPos.getX(i), y = clusterPos.getY(i), z = clusterPos.getZ(i);
    const irregular = 1 + Math.sin(x * 17.3 + y * 8.1 + z * 13.7) * .09 + Math.cos(y * 11.4 - z * 6.3) * .045;
    clusterPos.setXYZ(i, x * irregular, y * (1 + Math.sin(i * 2.7) * .045), z * irregular);
  }
  clusterGeo.computeVertexNormals();
  const clusterMat = own(new THREE.MeshStandardMaterial({ map: clusterMap, color: '#718652', roughness: .98 }));
  const clusters = new THREE.InstancedMesh(clusterGeo, clusterMat, 1400);
  trunks.castShadow = branches.castShadow = true;
  trunks.receiveShadow = branches.receiveShadow = canopy.receiveShadow = true;
  // Leaf cards stay out of the shadow map: alpha-tested foliage shadows are
  // expensive on tablets and tend to turn the canopy into black silhouettes.
  // Trunks and inner crown masses still cast the broad, believable shadows.
  canopy.castShadow = false;
  clusters.castShadow = false; clusters.receiveShadow = true;
  let trunkCount = 0, branchCount = 0, leafCount = 0, clusterCount = 0;
  trunks.userData.speciesByInstance = [];
  function instance(mesh, index, pos, scale, rot, tint) {
    dummy.position.copy(pos); dummy.scale.copy(scale);
    dummy.rotation.set(rot[0], rot[1], rot[2]); dummy.updateMatrix(); mesh.setMatrixAt(index, dummy.matrix);
    if (tint) mesh.setColorAt(index, tint);
  }
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const treePositions = [];
  for (let i = 0; i < 240; i++) {
    let x, z;
    for (let attempt = 0; attempt < 50; attempt++) {
      const a = rand() * Math.PI * 2;
      const radius = i < 155 ? between(42, 128) : between(24, 99);
      x = Math.cos(a) * radius; z = Math.sin(a) * radius;
      if (Math.abs(x) > 7.7 && Math.hypot(x - 40, z - 35) > 27 && treePositions.every(p => Math.hypot(x - p.x, z - p.z) > 3.7)) break;
    }
    if (Math.abs(x) < 7.5 || Math.hypot(x - 40, z - 35) < 26) continue;
    treePositions.push({x, z});
    const y = heightAt(x, z), h = between(8.5, 16.2), radius = between(.23, .47);
    const treeSpecies = PLANT_SPECIES.trees[i % PLANT_SPECIES.trees.length];
    trunks.userData.speciesByInstance.push({ common: treeSpecies[0], latin: treeSpecies[1], layer: treeSpecies[2] });
    const lean = between(-.035, .035), crownW = h * between(.29, .40);
    instance(trunks, trunkCount++, V(x, y + h * .32, z), V(radius, h * .64, radius), [lean, rand() * 6.3, lean * .6], color.setHSL(.09, .13, between(.56, .78)));
    for (let b = 0; b < 5; b++) {
      const a = b / 5 * Math.PI * 2 + rand(), l = h * between(.22, .35), by = y + h * between(.43, .68);
      const end = V(x + Math.cos(a) * crownW * .66, by + l * .7, z + Math.sin(a) * crownW * .66);
      const origin = V(x, by, z);
      dummy.position.copy(origin).add(end).multiplyScalar(.5);
      dummy.scale.set(radius * .7, origin.distanceTo(end), radius * .7);
      dummy.quaternion.setFromUnitVectors(V(0, 1, 0), end.clone().sub(origin).normalize());
      dummy.updateMatrix(); branches.setMatrixAt(branchCount++, dummy.matrix);
    }
    const treeHue = between(.20, .28), treeLight = between(.88, .96);
    // Three to five overlapping crown masses create a continuous woodland
    // canopy with irregular, species-like silhouettes.
    const crownLayers = 4 + (rand() > .3 ? 1 : 0);
    for (let c = 0; c < crownLayers; c++) {
      const ca = rand() * Math.PI * 2, cr = crownW * between(.08, .66);
      const cp = V(x + Math.cos(ca) * cr, y + h * between(.73, .96), z + Math.sin(ca) * cr);
      color.setHSL(treeHue + between(-.018, .018), between(.08, .17), between(.62, .84));
      instance(clusters, clusterCount++, cp, V(crownW * between(.5, .82), h * between(.10, .19), crownW * between(.5, .82)), [between(-.12, .12), rand() * 6.3, between(-.12, .12)], color);
    }
    for (let l = 0; l < 64; l++) {
      const a = rand() * Math.PI * 2, rho = Math.sqrt(rand()) * crownW;
      const vertical = between(-.8, .9);
      const taper = Math.sqrt(1 - vertical * vertical);
      const px = x + Math.cos(a) * rho * taper;
      const pz = z + Math.sin(a) * rho * taper;
      const py = y + h * .79 + vertical * h * .22;
      const size = between(2.4, 4.4) * (h / 12);
      color.setHSL(treeHue + between(-.014, .014), between(.07, .19), treeLight + between(-.035, .018));
      instance(canopy, leafCount++, V(px, py, pz), V(size, size * between(.83, 1.24), 1), [between(-1.1, 1.1), rand() * 6.3, between(-.7, .7)], color);
    }
  }
  trunks.count = trunkCount; branches.count = branchCount; canopy.count = leafCount; clusters.count = clusterCount;
  [trunks, branches, canopy, clusters].forEach(mesh => { mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); group.add(mesh); });

  // A dense mid-storey of hazel, hawthorn and young beech-like shrubs makes the
  // forest feel inhabited at eye level instead of leaving a bare lawn between
  // the mature trunks. One instanced batch keeps the extra geometry affordable.
  const shrubGeo = own(new THREE.IcosahedronGeometry(1, 1));
  const shrubPos = shrubGeo.attributes.position;
  for (let i = 0; i < shrubPos.count; i++) {
    const px = shrubPos.getX(i), py = shrubPos.getY(i), pz = shrubPos.getZ(i);
    const irregular = 1 + Math.sin(px * 13.1 + pz * 7.7) * .13 + Math.cos(py * 10.4 - px * 4.2) * .06;
    shrubPos.setXYZ(i, px * irregular, py * (1 + Math.sin(i * 1.9) * .08), pz * irregular);
  }
  shrubGeo.computeVertexNormals();
  const shrubMat = own(new THREE.MeshStandardMaterial({ map: clusterMap, color: '#536b3b', roughness: .99 }));
  const shrubs = new THREE.InstancedMesh(shrubGeo, shrubMat, 1200);
  const shrubLeafMat = own(new THREE.MeshStandardMaterial({ map: leafMap, alphaTest: .34, side: THREE.DoubleSide,
    roughness: .93, color: '#eaf3ce', emissive: '#26391b', emissiveIntensity: .08 }));
  addWind(shrubLeafMat, .022, .88);
  const shrubLeaves = new THREE.InstancedMesh(leafGeo, shrubLeafMat, 4800);
  let shrubCount = 0;
  let shrubLeafCount = 0;
  shrubs.userData.speciesByInstance = [];
  for (let i = 0; i < 1900 && shrubCount < 1200; i++) {
    const a = rand() * Math.PI * 2, radius = between(17, 122), x = Math.cos(a) * radius, z = Math.sin(a) * radius;
    const pathX = 15 + Math.sin(z * .035) * 11;
    if (Math.abs(x) < 7.5 || Math.abs(x - pathX) < 2.5 || Math.abs(z + 21 - Math.sin(x * .048) * 7) < 2.1 || Math.hypot(x - 40, z - 35) < 24) continue;
    const h = between(.45, 1.65), w = between(.55, 1.55);
    const shrubSpecies = PLANT_SPECIES.shrubs[shrubCount % PLANT_SPECIES.shrubs.length];
    shrubs.userData.speciesByInstance.push({ common: shrubSpecies[0], latin: shrubSpecies[1], layer: shrubSpecies[2] });
    color.setHSL(between(.19, .28), between(.14, .29), between(.38, .62));
    instance(shrubs, shrubCount++, V(x, heightAt(x, z) + h * .48, z), V(w, h, w * between(.72, 1.2)), [between(-.12, .12), rand() * 6.3, between(-.12, .12)], color);
    const leafGroups = h > .9 ? 4 : 3;
    for (let leaf = 0; leaf < leafGroups && shrubLeafCount < 4800; leaf++) {
      const a = rand() * Math.PI * 2, radius = w * between(.3, .82);
      const px = x + Math.cos(a) * radius, pz = z + Math.sin(a) * radius;
      const py = heightAt(x, z) + h * between(.58, 1.02);
      color.setHSL(between(.19, .28), between(.08, .18), between(.62, .88));
      instance(shrubLeaves, shrubLeafCount++, V(px, py, pz), V(between(.28, .62), between(.34, .8), 1), [between(-.6, .6), a + rand() * .6, between(-.45, .45)], color);
    }
  }
  shrubs.count = shrubCount; shrubs.instanceMatrix.needsUpdate = true; shrubs.computeBoundingSphere(); shrubs.castShadow = false; shrubs.receiveShadow = true; group.add(shrubs);
  shrubLeaves.count = shrubLeafCount; shrubLeaves.instanceMatrix.needsUpdate = true; shrubLeaves.computeBoundingSphere(); shrubLeaves.castShadow = false; shrubLeaves.receiveShadow = true; group.add(shrubLeaves);

  // Fallen wood breaks up the perfect lawn and adds the small-scale structure
  // one expects in a real temperate forest floor.
  const logGeo = own(new THREE.CylinderGeometry(.24, .34, 1, 10, 2));
  const logs = new THREE.InstancedMesh(logGeo, woodMat, 36);
  let logCount = 0;
  for (let i = 0; i < 60 && logCount < 36; i++) {
    const x = between(-105, 105), z = between(-105, 105), pathX = 15 + Math.sin(z * .035) * 11;
    if (Math.abs(x) < 8 || Math.abs(x - pathX) < 3 || Math.hypot(x - 40, z - 35) < 24) continue;
    const length = between(2.2, 5.6), y = heightAt(x, z) + .23;
    color.setHSL(.07 + rand() * .05, .12, between(.32, .52));
    instance(logs, logCount++, V(x, y, z), V(.72, length, .72), [0, rand() * 6.3, Math.PI / 2 + between(-.13, .13)], color);
  }
  logs.count = logCount; logs.instanceMatrix.needsUpdate = true; logs.computeBoundingSphere(); logs.castShadow = logs.receiveShadow = true; group.add(logs);

  // Low, irregular moss cushions make the otherwise subtle ground layer legible
  // at eye height and gather around the shaded forest floor.
  const mossGeo = own(new THREE.CircleGeometry(1, 9));
  const mossPos = mossGeo.attributes.position;
  for (let i = 1; i < mossPos.count; i++) {
    const px = mossPos.getX(i), py = mossPos.getY(i), pz = mossPos.getZ(i), scale = .8 + Math.sin(i * 4.7) * .16 + Math.cos(i * 2.1) * .08;
    mossPos.setXYZ(i, px * scale, py * scale, pz * scale);
  }
  mossGeo.rotateX(-Math.PI / 2);
  const mossMat = own(new THREE.MeshStandardMaterial({ color: '#627548', roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: .9 }));
  const moss = new THREE.InstancedMesh(mossGeo, mossMat, 700);
  let mossCount = 0;
  for (let i = 0; i < 1100 && mossCount < 700; i++) {
    const x = between(-112, 112), z = between(-112, 112), r = Math.hypot(x - 40, z - 35), pathX = 15 + Math.sin(z * .035) * 11;
    if (r < 20.5 || Math.abs(x) < 7.5 || Math.abs(x - pathX) < 2.1 || Math.abs(z + 21 - Math.sin(x * .048) * 7) < 1.7) continue;
    const s = between(.28, 1.22);
    color.setHSL(between(.20, .29), between(.16, .32), between(.27, .49));
    instance(moss, mossCount++, V(x, heightAt(x, z) + .018, z), V(s * between(.8, 1.7), s * between(.55, 1), s), [0, rand() * 6.3, 0], color);
  }
  moss.count = mossCount; moss.instanceMatrix.needsUpdate = true; moss.computeBoundingSphere(); moss.receiveShadow = true; group.add(moss);

  // Each tuft is seven bent leaves with independently varied width and height.
  const grassGeo = own(new THREE.BufferGeometry());
  const gpos = [], gcol = [], gindices = [];
  for (let b = 0; b < 7; b++) {
    const a = b * 2.39996, width = between(.008, .021), h = between(.12, .4), bend = between(.04, .12);
    const bx = Math.cos(a) * between(.025, .13), bz = Math.sin(a) * between(.025, .13);
    const dx = Math.cos(a) * width, dz = Math.sin(a) * width;
    const ex = Math.sin(a) * bend, ez = -Math.cos(a) * bend;
    const k = gpos.length / 3;
    gpos.push(bx - dx, 0, bz - dz, bx + dx, 0, bz + dz,
      bx - dx * .68 + ex * .36, h * .58, bz - dz * .68 + ez * .36,
      bx + dx * .68 + ex * .36, h * .58, bz + dz * .68 + ez * .36,
      bx + ex, h, bz + ez);
    gcol.push(.45, .55, .28, .45, .55, .28, .78, .86, .46, .78, .86, .46, .93, .94, .62);
    gindices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2, k + 2, k + 3, k + 4);
  }
  grassGeo.setAttribute('position', new THREE.Float32BufferAttribute(gpos, 3));
  grassGeo.setAttribute('color', new THREE.Float32BufferAttribute(gcol, 3));
  grassGeo.setIndex(gindices); grassGeo.computeVertexNormals();
  const grassMat = own(new THREE.MeshStandardMaterial({ color: '#f4f3df', vertexColors: true, side: THREE.DoubleSide, roughness: 1 }));
  addWind(grassMat, .09, 1.1);
  const grass = new THREE.InstancedMesh(grassGeo, grassMat, 42000);
  const roadGrass = new THREE.InstancedMesh(grassGeo, grassMat, 2000);
  grass.receiveShadow = true; roadGrass.receiveShadow = true;
  grass.userData.speciesByInstance = [];
  roadGrass.userData.speciesByInstance = [];
  let gc = 0, rgc = 0;
  for (let i = 0; i < 42000; i++) {
    const x = between(-120, 120), z = between(-120, 120), r = Math.hypot(x - 40, z - 35);
    if (r < 20.5) continue;
    const pathX = 15 + Math.sin(z * .035) * 11;
    if (Math.abs(x - pathX) < 1.38 || Math.abs(z - (-21 + Math.sin(x * .048) * 7)) < 1.1) continue;
    const isRoad = Math.abs(x) < 4.6;
    if (isRoad && rgc >= 2000) continue;
    const s = between(.72, 1.35) * (r < 26 ? .78 : 1);
    const patch = Math.sin(x * .095 + .8) * Math.cos(z * .082 - .2);
    const tall = patch > .73 ? 1.55 : 1;
    color.setHSL(between(.19, .26), between(.08, .2), between(.7, .9));
    const target = isRoad ? roadGrass : grass;
    const index = isRoad ? rgc++ : gc++;
    instance(target, index, V(x, heightAt(x, z) + .018, z), V(s, s * tall, s), [0, rand() * 6.3, 0], color);
    const herbSpecies = PLANT_SPECIES.herbs[index % PLANT_SPECIES.herbs.length];
    target.userData.speciesByInstance.push({ common: herbSpecies[0], latin: herbSpecies[1], layer: herbSpecies[2] });
  }
  grass.count = gc; roadGrass.count = rgc;
  [grass, roadGrass].forEach(mesh => {mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); group.add(mesh);});

  // Former stone accents are now living ground clumps: ferns, grasses and
  // young herbs close the bare patches while keeping the pond edge readable.
  const groundVegetation = new THREE.InstancedMesh(grassGeo, grassMat, 240);
  groundVegetation.receiveShadow = true;
  groundVegetation.userData.speciesByInstance = [];
  let groundCount = 0;
  for (let i = 0; i < 48 && groundCount < 240; i++) {
    let x, z;
    if (i < 12) {
      const a = rand() * 6.3, r = between(19.8, 24.7);
      x = 40 + Math.cos(a) * r; z = 35 + Math.sin(a) * r;
    } else { x = between(-105, 105); z = between(-105, 105); }
    if (Math.abs(x) < 5.5 || Math.hypot(x - 40, z - 35) < 19.5) continue;
    const clumpSize = i % 3 === 0 ? 6 : 4;
    for (let blade = 0; blade < clumpSize && groundCount < 240; blade++) {
      const angle = rand() * 6.3, radius = between(.12, .9), px = x + Math.cos(angle) * radius, pz = z + Math.sin(angle) * radius;
      const s = between(.62, 1.15) * (i < 12 ? 1.15 : 1);
      color.setHSL(between(.20, .29), between(.18, .38), between(.38, .68));
      instance(groundVegetation, groundCount, V(px, heightAt(px, pz) + .018, pz), V(s * between(.7, 1.3), s * between(1.1, 2.15), s), [0, rand() * 6.3, 0], color);
      const herbSpecies = PLANT_SPECIES.herbs[(groundCount + i) % PLANT_SPECIES.herbs.length];
      groundVegetation.userData.speciesByInstance.push({ common: herbSpecies[0], latin: herbSpecies[1], layer: herbSpecies[2] });
      groundCount++;
    }
  }
  groundVegetation.count = groundCount; groundVegetation.instanceMatrix.needsUpdate = true; groundVegetation.computeBoundingSphere(); group.add(groundVegetation);

  const waterNormal = texture(256, (ctx, s) => {
    ctx.fillStyle = 'rgb(128,128,255)'; ctx.fillRect(0, 0, s, s);
    for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) {
      const n = Math.sin(i * .31 + Math.cos(j * .07)) * Math.cos(j * .19 + i * .045);
      const v = Math.sin(j * .22 + i * .032);
      ctx.fillStyle = `rgb(${128 + (n * 21 | 0)},${128 + (v * 18 | 0)},250)`;
      ctx.fillRect(i, j, 1, 1);
    }
  }, 9);
  waterNormal.colorSpace = THREE.NoColorSpace;
  const waterMat = own(new THREE.MeshPhysicalMaterial({ color: '#415d55', metalness: .13, roughness: .18,
    transparent: true, opacity: .87, clearcoat: .85, clearcoatRoughness: .13,
    normalMap: waterNormal, normalScale: new THREE.Vector2(.3, .3), side: THREE.DoubleSide }));
  const waterGeo = own(new THREE.CircleGeometry(18.3, 96));
  waterGeo.rotateX(-Math.PI / 2);
  const water = new THREE.Mesh(waterGeo, waterMat); water.position.set(40, .35, 35); water.receiveShadow = true; group.add(water);

  // Reeds give the shallow bank a readable, living shoreline.
  const reeds = new THREE.InstancedMesh(grassGeo, grassMat, 340);
  for (let i = 0; i < 340; i++) {
    const a = rand() * 6.3, r = between(19.9, 22.8), x = 40 + Math.cos(a) * r, z = 35 + Math.sin(a) * r;
    color.setHSL(.19 + rand() * .04, .16, between(.66, .81));
    instance(reeds, i, V(x, heightAt(x, z), z), V(between(1.2, 2.2), between(2.2, 3.7), between(1.2, 2.2)), [0, rand() * 6.3, 0], color);
  }
  reeds.instanceMatrix.needsUpdate = true; reeds.computeBoundingSphere(); reeds.receiveShadow = true; group.add(reeds);

  const roadGroup = new THREE.Group(); roadGroup.name = 'Straße und Wildtierkorridor'; group.add(roadGroup); roadGroup.visible = false;
  const roadMat = own(new THREE.MeshStandardMaterial({ map: asphaltMap, roughness: .97, color: '#b4b6ad', side: THREE.DoubleSide }));
  const vergeMat = own(new THREE.MeshStandardMaterial({map: gravelMap, roughness: 1, color: '#b3ad9b', side: THREE.DoubleSide}));
  const straight = t => ({x: 0, z: t});
  roadGroup.add(strip(straight, 4.15, 180, -135, 135, vergeMat, .054));
  roadGroup.add(strip(straight, 3.5, 180, -135, 135, roadMat, .073));
  const markingMat = own(new THREE.MeshStandardMaterial({color: '#d2ceba', roughness: .93, side: THREE.DoubleSide}));
  function mergeStrips(meshes) {
    const positions = [], normals = [], uvs = [], indices = [];
    let offset = 0;
    for (const mesh of meshes) {
      const geo = mesh.geometry;
      positions.push(...geo.attributes.position.array); normals.push(...geo.attributes.normal.array); uvs.push(...geo.attributes.uv.array);
      for (const index of geo.index.array) indices.push(index + offset);
      offset += geo.attributes.position.count;
    }
    const geometry = own(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices);
    return geometry;
  }
  const stripePieces = [], corridorStripePieces = [];
  for (let z = -130; z < 130; z += 10) {
    const stripe = strip(straight, .075, 3, z, z + 4.2, markingMat, .083);
    stripePieces.push(stripe);
    if (Math.abs(z + 2.1) > 10) corridorStripePieces.push(stripe);
  }
  const fullMarkings = new THREE.Mesh(mergeStrips(stripePieces), markingMat); roadGroup.add(fullMarkings);
  const corridorMarkings = new THREE.Mesh(mergeStrips(corridorStripePieces), markingMat); corridorMarkings.visible = false; roadGroup.add(corridorMarkings);
  const edgeMarkings = new THREE.Group(); roadGroup.add(edgeMarkings);
  for (const x of [-3.06, 3.06]) edgeMarkings.add(strip(t => ({x, z: t}), .057, 150, -135, 135, markingMat, .085));

  // Fence geometry is merged so hundreds of posts and wires remain a single draw.
  const fenceMat = own(new THREE.MeshStandardMaterial({color: '#626a60', metalness: .45, roughness: .61}));
  function fenceGeometry(crossing) {
    const pos = [], idx = [];
    function bar(a, b, width) {
      const axis = b.clone().sub(a).normalize(), side = V(0, 1, 0).cross(axis).normalize();
      if (side.lengthSq() < .01) side.set(1, 0, 0);
      const up = axis.clone().cross(side).normalize();
      const k = pos.length / 3;
      for (const point of [a, b]) for (const [u, v] of [[-1,-1],[1,-1],[1,1],[-1,1]]) {
        const p = point.clone().addScaledVector(side, width * u).addScaledVector(up, width * v); pos.push(p.x, p.y, p.z);
      }
      idx.push(k,k+1,k+2,k,k+2,k+3,k+4,k+6,k+5,k+4,k+7,k+6,
        k,k+4,k+5,k,k+5,k+1,k+1,k+5,k+6,k+1,k+6,k+2,k+2,k+6,k+7,k+2,k+7,k+3,k+3,k+7,k+4,k+3,k+4,k);
    }
    for (const x of [-4.55, 4.55]) for (let z = -126; z <= 126; z += 6) {
      if (crossing && Math.abs(z) <= 12) continue;
      const y = heightAt(x, z);
      bar(V(x, y + .04, z), V(x, y + 1.14, z), .035);
      if (z < 126 && !(crossing && Math.abs(z + 3) <= 12)) {
        const nextY = heightAt(x, z + 6);
        for (const h of [.28, .57, .89]) bar(V(x, y + h, z), V(x, nextY + h, z + 6), .009);
      }
    }
    const geo = own(new THREE.BufferGeometry()); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals(); return geo;
  }
  const fullFence = new THREE.Mesh(fenceGeometry(false), fenceMat); roadGroup.add(fullFence);
  const crossingFence = new THREE.Mesh(fenceGeometry(true), fenceMat); crossingFence.visible = false; roadGroup.add(crossingFence);
  const corridorGroup = new THREE.Group(); corridorGroup.visible = false; roadGroup.add(corridorGroup);
  const corridorMat = own(new THREE.MeshStandardMaterial({map: earthMap, color: '#a5ac82', roughness: 1, side: THREE.DoubleSide}));
  corridorGroup.add(strip(straight, 4.2, 20, -8, 8, corridorMat, .095));
  const corridorGrass = new THREE.InstancedMesh(grassGeo, grassMat, 230);
  for (let i = 0; i < 230; i++) {
    const x = between(-4, 4), z = between(-7.8, 7.8), s = between(.75, 1.1);
    color.setHSL(.22, .16, between(.7, .88));
    instance(corridorGrass, i, V(x, heightAt(x,z) + .11, z), V(s,s,s), [0,rand()*6.3,0], color);
  }
  corridorGrass.instanceMatrix.needsUpdate = true; corridorGrass.computeBoundingSphere(); corridorGroup.add(corridorGrass);

  // Small amber delineators communicate the crossing from ground level.
  const delineatorGeo = own(new THREE.BoxGeometry(.1, .74, .13));
  const delineatorMat = own(new THREE.MeshStandardMaterial({color:'#e8e1c9',roughness:.77}));
  const delineators = new THREE.InstancedMesh(delineatorGeo, delineatorMat, 8);
  let di = 0;
  for (const x of [-4.5,4.5]) for (const z of [-10,-8.8,8.8,10]) instance(delineators,di++,V(x,heightAt(x,z)+.4,z),V(1,1,1),[0,0,0]);
  corridorGroup.add(delineators);

  function setRoad(enabled, corridor = false) {
    roadGroup.visible = !!enabled;
    roadGrass.visible = !enabled;
    fullFence.visible = !corridor;
    crossingFence.visible = !!corridor;
    corridorGroup.visible = !!corridor;
    fullMarkings.visible = !corridor;
    corridorMarkings.visible = !!corridor;
  }

  return {
    heightAt, setRoad, roadGroup, group,
    update(t) {
      waterNormal.offset.set((t * .006) % 1, (t * .004) % 1);
      for (const material of [leafMat, grassMat]) if (material.userData.windShader) material.userData.windShader.uniforms.uWindTime.value = t;
    },
    dispose() {
      scene.remove(group);
      group.traverse(o => { if (o.isInstancedMesh) o.dispose(); });
      resources.forEach(o => o.dispose());
    }
  };
}
