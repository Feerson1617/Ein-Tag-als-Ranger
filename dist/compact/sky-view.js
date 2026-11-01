import * as THREE from '../vendor/three.module.js?revision=120';

// Direction-space sky: no panorama UV, longitudinal cut, or texture seam.
// A clear teaching-day gradient, not a meteorological simulation or tide input.
export function createSky(scene){
 const material=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  vertexShader:'varying vec3 skyDirection;void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`varying vec3 skyDirection;
  void main(){vec3 d=normalize(skyDirection);float altitude=smoothstep(-.10,.85,d.y);
   vec3 color=mix(vec3(.70,.77,.76),vec3(.25,.45,.59),altitude);
   float sun=pow(max(0.,dot(d,normalize(vec3(-30.,65.,-25.)))),180.);
   gl_FragColor=vec4(color+vec3(.18,.14,.08)*sun,1.);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`});
 const dome=new THREE.Mesh(new THREE.SphereGeometry(150,32,16),material);dome.name='continuous-direction-sky';dome.frustumCulled=false;dome.renderOrder=-1000;
 dome.onBeforeRender=(_r,_s,camera)=>{dome.position.copy(camera.position);dome.updateMatrixWorld();};
 scene.background=null;scene.add(dome);return dome;
}
