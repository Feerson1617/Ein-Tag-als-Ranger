// Surface treatment only: no displacement, alpha clipping, clock or simulation
// inputs. The same meshes remain authoritative for contacts and visibility.
export function scenicSurface(material, kind) {
 const treatments = {
  canopy: `float fleck = surfaceNoise(surfacePoint * 7.0); float cluster = surfaceNoise(surfacePoint * 1.8); diffuseColor.rgb *= .69 + .24 * cluster + .22 * fleck;`,
  bark: `float grain = surfaceNoise(surfacePoint * vec3(24.0, 1.4, 24.0)); float patch = surfaceNoise(surfacePoint * 3.0); diffuseColor.rgb *= .72 + .22 * grain + .18 * patch;`,
  masonry: `float grain = surfaceNoise(surfacePoint * 32.0); diffuseColor.rgb *= .88 + .16 * grain;`,
  water: `float ripple = sin(surfacePoint.x * 5.0 + sin(surfacePoint.y * 2.1)) * sin(surfacePoint.y * 7.0 + surfacePoint.x * .8); diffuseColor.rgb *= .94 + .06 * ripple;`,
  fur: `float grain=surfaceNoise(surfacePoint*vec3(85.0,200.0,180.0)); diffuseColor.rgb *= .965+.07*grain;`,
  feather: `float grain=surfaceNoise(surfacePoint*vec3(24.0,65.0,110.0)); diffuseColor.rgb *= .965+.07*grain;`,
  shell: `float ring=sin(length(surfacePoint.xz)*100.0+surfacePoint.y*35.0); diffuseColor.rgb *= .92+.07*ring;`,
  cuticle: `float grain=surfaceNoise(surfacePoint*60.0); diffuseColor.rgb *= .93+.09*grain;`,
  skin: `float grain=surfaceNoise(surfacePoint*90.0); diffuseColor.rgb *= .94+.08*grain;`,
  leaf: `float grain=surfaceNoise(surfacePoint*85.0); diffuseColor.rgb *= .95+.08*grain;`
 };
 if (!treatments[kind]) throw Error('Unknown scenic surface: ' + kind);
 const previous=material.onBeforeCompile;
 material.userData.scenicSurface=kind;
 material.onBeforeCompile = shader => {
  previous.call(material,shader);
  shader.vertexShader = 'varying vec3 surfacePoint;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nsurfacePoint = position;');
  shader.fragmentShader = `varying vec3 surfacePoint;
float surfaceHash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
float surfaceNoise(vec3 p) {
 return .5+.22*sin(dot(p,vec3(1.7,2.3,.9)))+.16*sin(dot(p,vec3(3.1,-1.3,2.7)))+.10*sin(dot(p,vec3(5.7,4.1,-3.3)));
}
` + shader.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n' + treatments[kind]);
 };
 material.customProgramCacheKey = () => 'ranger-scenic-v1-' + kind;
 return material;
}
