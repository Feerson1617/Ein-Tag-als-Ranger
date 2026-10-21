import { isHuntFlight } from './encounter-behavior.js?revision=120';
const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
const ease=t=>t*t*t*(t*(t*6-15)+10);
export function birdAirborne(a,s){const flight=a.flight||0;if(isHuntFlight(a))return 1;if(['flying','fleeing'].includes(a.activity)||s.zone==='air'&&a.activity==='hunting')return smooth(.02,.35,flight);const support=['perching','drumming','wingDrying'].includes(a.activity)||s.form==='owl'&&a.activity==='resting'?a.perchHeight||0:['feeding','competition','collecting'].includes(a.activity)?a.feedingHeight||0:0;return smooth(.10,.55,Math.abs(flight-support));}
const feeding=new Set(['feeding','grazing','probing','pollinating','deposit','competition','drumming','collecting','caching','handling']);

// Four contact points need only three vec4 attributes, even with an instance colour.
// Rest feet are uniforms shared by a species, not repeated on every vertex.
export function prepareLegRig(g,s){
 const legs=[],feet=new Float32Array(36),slots=new Float32Array(12),a=g.attributes.rigData,j=g.attributes.rigJoint;
 for(let part=1;part<=4;part++){
  const foot=g.userData.legFeet?.[part];if(!foot)continue;
  let i=0;while(i<a.count&&a.getX(i)!==part)i++;if(i===a.count)continue;
  const hip=[a.getY(i),a.getZ(i),a.getW(i)],knee=[j.getX(i),j.getY(i),j.getZ(i)];
  const upper=Math.hypot(...hip.map((v,k)=>v-knee[k])),lower=Math.hypot(...knee.map((v,k)=>v-foot[k]));
  if(upper<.001||lower<.001)continue;
  let sole=Infinity;for(let vertex=0;vertex<a.count;vertex++)if(a.getX(vertex)===part&&j.getW(vertex)>1.5)sole=Math.min(sole,g.attributes.position.getY(vertex));
  const clearance=Number.isFinite(sole)?Math.max(.00001,foot[1]-sole):foot[1];
  legs[part-1]={hip,knee,foot,upper,lower,clearance,length:upper+lower};feet.set(foot,(part-1)*3);
 }
 for(const [part,foot] of Object.entries(g.userData.legFeet||{}))if(Number(part)>=10){const index=Number(part)-6;feet.set(foot,index*3);slots[index]=g.userData.legSlots[part];}
 for(let i=0;i<4;i++)slots[i]=i;
 const length=legs.length?Math.min(...legs.filter(Boolean).map(l=>l.length)):0;
 const hop=['hare','frog','squirrel'].includes(s.form)||s.type==='bird'&&['songbird','woodpecker'].includes(s.form);
 const rig={legs,feet,slots,length,hop,stride:Math.max(length*(hop?1.4:.75),s.type==='bird'?s.size*.2:0)};g.userData.legRig=rig;return rig;
}

// Identity and actual distance drive the cycle, including while outside the camera.
export function advanceMotion(a,s,rig=null){
 const x=a.renderX??a.x,z=a.renderZ??a.z,age=a.age||0;
 let m=a.motion;
 if(!m||age<m.age||m.identity!==a.id)m=a.motion={identity:a.id,age,x,z,phase:a.phase||0,cycle:(a.phase||0)/TAU,flap:a.phase||0,amount:0,run:0,feed:0,air:0,swim:0,bob:0,bodyOffset:0,bank:0,heading:(a.heading||0)+(s.form==='crab'?Math.PI/2:0)};
 const dt=clamp(age-m.age,0,.15),distance=Math.hypot(x-m.x,z-m.z,a.climbing?(a.poseY||0)-(m.poseY??a.poseY??0):0),speed=dt>0?distance/dt:0;
 const response=1-Math.exp(-dt*9),L=Math.max(.001,s.size||.2),bird=s.type==='bird',fish=s.type==='fish';
 const hop=bird&&['songbird','woodpecker'].includes(s.form),fast=smooth(L*.9,L*2.2,speed);
 let stride=rig?.length?rig.stride*(1+fast*(rig.hop?1.0:s.type==='mammal'?2.2:1.4))*(a.trait||1):L*(s.form==='hare'?.7:hop?.72:bird?.44:s.form==='seal'?.48:.52);
 if(a.zoneWater&&['newt','frog','duck','swan','goose'].includes(s.form))stride=L*.75*(a.trait||1);
 const moving=distance<Math.max(2,L*5)?distance:0;
 m.cycle+=moving/Math.max(.00005,stride);m.phase=(m.cycle%1)*TAU;m.stride=stride/(a.trait||1);m.dt=dt;m.speed=speed;m.teleport=distance!==moving;
 const air=bird?birdAirborne(a,s):s.type==='insect'?smooth(.02,.35,a.flight||0):0;
 const swim=!a.refugeOnRock&&(fish||['seal','newt','frog'].includes(s.form)&&a.zoneWater||['duck','swan','goose'].includes(s.form)&&a.zoneWater)?1:0;
 const amount=['seal','worm'].includes(s.form)?clamp(speed/(L*(s.form==='seal'?.13:.035)),0,1):smooth(Math.min(.01,L*.04),Math.max(.002,L*.8),speed);
 m.amount+=(amount-m.amount)*response;m.run+=(fast-m.run)*response;
 m.feed+=(Number(feeding.has(a.activity))-m.feed)*response;m.air+=(air-m.air)*response;m.swim+=(swim-m.swim)*response;
 const flightHz=bird?clamp(1.7/Math.sqrt(L),1.25,5.5):s.form==='butterfly'?4.5:8;
 m.flap=(m.flap+dt*TAU*flightHz)%TAU;
 const desired=(moving>.00001?Math.atan2(z-m.z,x-m.x):a.heading||0)+(s.form==='crab'?Math.PI/2:0);
 const delta=Math.atan2(Math.sin(desired-m.heading),Math.cos(desired-m.heading));
 m.bank+=(clamp(-delta/Math.max(.0001,dt)*Math.min(speed,8)/9.81,-.4,.4)*m.air-m.bank)*response;m.heading+=delta*(1-Math.exp(-dt*15));
 const vertical=dt>0?((a.flight||0)-(m.altitude??a.flight??0))/dt:0;
 const pitch=bird&&m.air>.4?clamp(Math.atan2(vertical,Math.max(.6,speed)),-.85,.65):0;
 m.pitch=(m.pitch||0)+(pitch-(m.pitch||0))*response;m.altitude=a.flight||0;
 const glider=['raptor','owl','gull','tern'].includes(s.form),glide=glider?.5+.5*Math.sin(age*.75+a.phase):0;
 const flap=a.activity==='hovering'?1.15:a.activity==='stooping'?.08:a.activity==='climbing'?1:a.activity==='circling'?.18:1-.85*Math.max(0,glide-.25)/.75;
 m.flapPower=(m.flapPower??flap)+(flap-(m.flapPower??flap))*response;
 const ground=(1-m.air)*(1-m.swim),leg=rig?.length||L*.3;
 m.bodyOffset=rig?.length?-leg*.12*ground:0;
 const duty=rig?.hop ? .36 : .64-fast*(s.type==='mammal'?.42:.36);
 const jump=rig?.hop?Math.sin(Math.PI*clamp(((m.cycle%1)-duty)/(1-duty-(s.type==='bird'?0:.15)),0,1))**2:0;
 const bound=s.type==='mammal'&&!rig?.hop?smooth(.65,1,fast):0,leap=Math.sin(Math.PI*clamp(((m.cycle%1)-duty)/Math.max(.1,1-duty-.18),0,1))**2;
 m.bob=(rig?.hop?jump*leg*.22:Math.sin(m.phase*2)*leg*.018+bound*leap*leg*.065)*m.amount*ground;
 m.dry=(m.dry||0)+(Number(a.activity==='wingDrying')-(m.dry||0))*response;m.posePitch=(m.posePitch||0)+((a.bodyPitch||0)-(m.posePitch||0))*response;m.poseY=a.poseY;m.age=age;m.x=x;m.z=z;return m;
}

// Stance anchors stay in WORLD space, including turns and uneven terrain.
// Swing endpoints anticipate travel; quintic easing gives zero endpoint velocity.
export function updateGroundPose(a,s,m,rig,y,ground){
 m.footTargets||=new Float32Array(12);const out=m.footTargets;if(!rig?.length)return out;
 const scale=a.trait||1,c=Math.cos(m.heading),sn=Math.sin(m.heading),stride=m.stride*scale;
 const fast=smooth(s.size*.9,s.size*2.2,m.speed),duty=rig.hop ? .36 : .64-fast*(s.type==='mammal'?.42:.36);
 const walk=[0,.5,.75,.25],run=[0,.5,.5,0],offsets=rig.hop?[.12,.15,0,.03]:walk.map((v,i)=>v+(run[i]-v)*fast);
 if(s.type==='mammal'&&!rig.hop){const bound=smooth(.65,1,fast),gallop=[.12,.18,0,.05];for(let i=0;i<4;i++)offsets[i]+=(gallop[i]-offsets[i])*bound;}
 if(s.type==='bird'&&rig.hop)offsets[0]=offsets[1]=0;if(s.form==='beetle')offsets.splice(0,4,0,.5,.5,0);
 const support=s.type==='bird'&&m.air<.15?(a.flight||0):0;const reset=!m.contacts||m.teleport||Math.abs(support-(m.supportHeight||0))>.2||a.age-(m.poseAge??a.age)>.25;m.supportHeight=support;
 if(reset)m.contacts=[];
 if(a.climbing){for(let i=0;i<rig.legs.length;i++){const leg=rig.legs[i];if(!leg)continue;const wave=Math.sin(m.phase+(i%2)*Math.PI);out.set([leg.foot[0]+wave*leg.length*.22,leg.foot[1]+Math.max(0,wave)*leg.length*.12,leg.foot[2]],i*3);}return out;}
 const walking=m.speed>.004&&m.air<.15&&m.swim<.15&&!a.attachedHost;
 const point=(leg,along=0)=>{const xx=leg.foot[0]*scale+(s.form==='crab'?0:along),zz=leg.foot[2]*scale-(s.form==='crab'?along:0);const x=m.x+c*xx-sn*zz,z=m.z+sn*xx+c*zz;return {x,y:ground(x,z,a.habitat)+support+leg.clearance*scale,z};};
 for(let i=0;i<rig.legs.length;i++){
  const leg=rig.legs[i];if(!leg)continue;
  const phase=(m.cycle+offsets[i])%1;let stance=phase<duty;
  let f=m.contacts[i];if(!f){const p=point(leg,walking&&stance?stride*(duty*.5-phase):0);f=m.contacts[i]={...p,anchor:{...p},stance:true,paused:!walking};}
  const stepCycle=Math.floor(m.cycle+offsets[i]);if(f.stepCycle!=null&&stepCycle!==f.stepCycle){f.forcedSwing=false;f.stance=false;}f.stepCycle=stepCycle;
  if(walking&&stance&&!f.paused){const dx=(f.x-m.x)/scale,dz=(f.z-m.z)/scale;
   const reach=Math.hypot(c*dx+sn*dz-leg.hip[0],(f.y-y)/scale-leg.hip[1],-sn*dx+c*dz-leg.hip[2]);
   if(reach>leg.length*.94&&!f.forcedSwing){f.forcedSwing=true;f.from={x:f.x,y:f.y,z:f.z};f.to=point(leg,stride*(1-phase+duty*.5));f.swingStart=phase;}
  }
  stance=stance&&!f.forcedSwing;
  if(!walking){
   if(m.air>.15||m.swim>.15){const foot=leg.foot,paddle=Math.sin(m.phase+(i%2)*Math.PI);const tuck=s.type==='bird'?m.air:0;out.set([foot[0]+(leg.hip[0]-leg.length*.45-foot[0])*tuck+leg.length*.28*paddle*m.swim,foot[1]+(leg.hip[1]-leg.length*.20-foot[1])*tuck+leg.length*(.16+.09*Math.cos(m.phase+(i%2)*Math.PI))*m.swim,foot[2]],i*3);f.paused=true;continue;}
   f.y+=(ground(f.x,f.z,a.habitat)+support+leg.clearance*scale-f.y)*(1-Math.exp(-m.dt*15));f.anchor={x:f.x,y:f.y,z:f.z};f.paused=true;
  }else if(stance){
   if(!f.stance||f.paused){f.anchor=point(leg,stride*(duty*.5-phase));if(f.paused)f.anchor={x:f.x,y:ground(f.x,f.z,a.habitat)+support+leg.clearance*scale,z:f.z};}
   Object.assign(f,f.anchor);f.paused=false;
  }else{
   const prediction=point(leg,stride*(1-phase+duty*.5));
   if(f.stance||f.paused||!f.to||!f.from){f.from={x:f.x,y:f.y,z:f.z};f.to=prediction;f.swingStart=phase;f.paused=false;}
   const response=1-Math.exp(-m.dt*12);for(const k of ['x','y','z'])f.to[k]+=(prediction[k]-f.to[k])*response;
   const t=clamp((phase-f.swingStart)/Math.max(.001,1-f.swingStart),0,1),blend=ease(t);
   for(const k of ['x','y','z'])f[k]=f.from[k]+(f.to[k]-f.from[k])*blend;
   f.y+=Math.sin(Math.PI*t)**2*leg.length*scale*(rig.hop?.25:.15);
  }
  f.stance=stance;f.phase=phase;
  const dx=(f.x-m.x)/scale,dz=(f.z-m.z)/scale;
  let tx=c*dx+sn*dz,ty=(f.y-y)/scale,tz=-sn*dx+c*dz;
  const vx=tx-leg.hip[0],vy=ty-leg.hip[1],vz=tz-leg.hip[2],reach=Math.hypot(vx,vy,vz),limit=leg.length*.995;
  if(reach>limit){const k=limit/reach;tx=leg.hip[0]+vx*k;ty=leg.hip[1]+vy*k;tz=leg.hip[2]+vz*k;f.stance=false;f.forcedSwing=true;}
  out.set([tx,ty,tz],i*3);
 }
 m.poseAge=a.age;return out;
}

// Species use different anatomy attributes and uniform rig values, not distinct
// shader source, except for size-dependent aquatic body deformation.
export function motionShaderKey(s){const L=Math.max(.005,s.size||.2);return [s.type==='bird'?'bird':s.type==='mammal'?'mammal':'other',s.type==='fish'?'fish-'+L:'',['seal','newt','worm'].includes(s.form)?s.form+'-'+L:''].join(':');}

export function motionShader(shader,s,rig=null){
 const L=Math.max(.005,s.size||.2),bird=s.type==='bird',fish=s.type==='fish',idle=bird||s.type==='mammal';
 shader.uniforms||={};shader.uniforms.legFeet={value:rig?.feet||new Float32Array(36)};shader.uniforms.legSlots={value:rig?.slots||new Float32Array(12)};
 shader.vertexShader=`
 attribute vec4 rigData;
 attribute vec4 rigJoint;
 attribute vec2 gaitData;
 attribute vec4 motionControls;
 attribute vec4 footTargetsA;
 attribute vec4 footTargetsB;
 attribute vec4 footTargetsC;
 uniform vec3 legFeet[12];
 uniform float legSlots[12];
 #define gaitSpeed gaitData.x
 #define gaitPhase gaitData.y
 vec3 rotateMotionZ(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}
 vec3 rotateMotionY(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
 vec3 rotateMotionX(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);}
 int legIndex(){return int(rigData.x>9.5?rigData.x-6.0:rigData.x-1.0);}
 vec3 restFoot(){return legFeet[legIndex()];}
 vec3 footTarget(){int index=legIndex();float slot=legSlots[index];vec3 target;if(slot<.5)target=footTargetsA.xyz;else if(slot<1.5)target=vec3(footTargetsA.w,footTargetsB.xy);else if(slot<2.5)target=vec3(footTargetsB.zw,footTargetsC.x);else target=footTargetsC.yzw;return target+legFeet[index]-legFeet[int(slot)];}
 vec3 alignMotion(vec3 v,vec3 from,vec3 to){vec3 a=normalize(from),b=normalize(to),k=cross(a,b);float c=dot(a,b);return v+cross(k,v)+cross(k,cross(k,v))/max(0.0001,1.0+c);}
 vec3 kneeMotion(vec3 target){vec3 hip=rigData.yzw,restKnee=rigJoint.xyz,foot=restFoot(),axis=target-hip;float upper=length(restKnee-hip),lower=length(foot-restKnee),d=clamp(length(axis),abs(upper-lower)+0.00001,upper+lower-0.00001);vec3 dir=normalize(axis);float along=(upper*upper-lower*lower+d*d)/(2.0*d);vec3 bend=restKnee-hip-dir*dot(restKnee-hip,dir);if(length(bend)<0.00001)bend=vec3(-1.0,0.0,0.0)-dir*dot(vec3(-1.0,0.0,0.0),dir);return hip+dir*along+normalize(bend)*sqrt(max(0.0,upper*upper-along*along));}
 vec3 moveLeg(vec3 p){vec3 hip=rigData.yzw,restKnee=rigJoint.xyz,foot=restFoot(),target=footTarget(),knee=kneeMotion(target);if(rigJoint.w>1.5)return p-foot+target;if(rigJoint.w>.5)return alignMotion(p-restKnee,foot-restKnee,target-knee)+knee;return alignMotion(p-hip,restKnee-hip,knee-hip)+hip;}
 vec3 normalLeg(vec3 n){vec3 hip=rigData.yzw,restKnee=rigJoint.xyz,foot=restFoot(),target=footTarget(),knee=kneeMotion(target);if(rigJoint.w>1.5)return n;if(rigJoint.w>.5)return alignMotion(n,foot-restKnee,target-knee);return alignMotion(n,restKnee-hip,knee-hip);}
 // x is the individual's simulation clock, independent of travelled distance.
 // Feet still use their planted IK anchors; pausing observation freezes both clocks.
 float restAmount(){return (1.0-motionControls.y)*(1.0-motionControls.z)*(1.0-motionControls.w)*(1.0-min(1.0,gaitSpeed)*0.8);}
 float headWeight(){return rigJoint.w>0.001?min(1.0,rigJoint.w):1.0;}
 float headAngle(){return -motionControls.y*${bird?'0.30':'0.36'}+${idle?'0.045':'0.0'}*sin(motionControls.x*1.1)*restAmount();}
 float headYaw(){return ${idle?bird?'0.24':'0.15':'0.0'}*sin(motionControls.x*0.87)*sin(motionControls.x*0.23)*restAmount();}
 float tailAngle(){return sin(gaitPhase*.5)*gaitSpeed*0.11+${idle?'0.025':'0.0'}*sin(motionControls.x*0.73)*restAmount();}
 float earAngle(){return sin(gaitPhase+sign(rigData.w)*0.3)*gaitSpeed*0.18+${s.type==='mammal'?'0.065':'0.0'}*sin(motionControls.x*2.3+sign(rigData.w)*1.7)*restAmount();}
 float breathScale(){return 1.0+${idle?'0.004':'0.0'}*sin(motionControls.x*3.1)*restAmount();}
 vec3 moveMotion(vec3 p){float part=rigData.x;
 if(part<0.5)p.y*=breathScale();
 else if((part>0.5&&part<4.5)||(part>9.5&&part<17.5))p=moveLeg(p);
 else if(part>4.5&&part<5.5)p=rotateMotionY(p-rigData.yzw,tailAngle())+rigData.yzw;
 else if(part>5.5&&part<6.5)p=rotateMotionY(rotateMotionZ(p-rigData.yzw,headAngle()*headWeight()),headYaw()*headWeight())+rigData.yzw;
 else if(part>6.5&&part<7.5)p=rotateMotionX(p-rigData.yzw,sign(rigData.w)*(0.2+sin(gaitPhase)*0.7*motionControls.z))+rigData.yzw;
 else if(part>7.5&&part<8.5)p=rotateMotionZ(p-rigData.yzw,earAngle())+rigData.yzw;
 ${fish?`p.z+=sin(gaitPhase-position.x*${(7/L).toFixed(4)})*pow(clamp(-position.x/${L.toFixed(6)},0.0,1.0),1.4)*${(L*.12).toFixed(6)}*(0.25+gaitSpeed*0.75);`:''}
 ${s.form==='seal'?`p.y+=sin(gaitPhase-position.x*${(4/L).toFixed(4)})*${(L*.013).toFixed(6)}*(1.0-motionControls.w)*gaitSpeed;p.z+=sin(gaitPhase-position.x*${(4/L).toFixed(4)})*${(L*.012).toFixed(6)}*motionControls.w*gaitSpeed;`:''}
 ${s.form==='newt'?`p.z+=sin(gaitPhase-position.x*${(7/L).toFixed(4)})*pow(clamp(-position.x/${L.toFixed(6)},0.0,1.0),1.2)*${(L*.085).toFixed(6)}*motionControls.w*(.3+gaitSpeed*.7);`:''}
 ${s.form==='worm'?`p.z+=sin(gaitPhase-position.x*${(12/L).toFixed(4)})*${(L*.018).toFixed(6)}*gaitSpeed;`:''}
 return p;}
 vec3 normalMotion(vec3 n){if(rigData.x<0.5)return normalize(vec3(n.x,n.y/breathScale(),n.z));if((rigData.x>0.5&&rigData.x<4.5)||(rigData.x>9.5&&rigData.x<17.5))return normalLeg(n);if(rigData.x>5.5&&rigData.x<6.5)return rotateMotionY(rotateMotionZ(n,headAngle()*headWeight()),headYaw()*headWeight());if(rigData.x>4.5&&rigData.x<5.5)return rotateMotionY(n,tailAngle());if(rigData.x>6.5&&rigData.x<7.5)return rotateMotionX(n,sign(rigData.w)*(0.2+sin(gaitPhase)*0.7*motionControls.z));if(rigData.x>7.5&&rigData.x<8.5)return rotateMotionZ(n,earAngle());return n;}
 `+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed=moveMotion(transformed);');
 shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nobjectNormal=normalMotion(objectNormal);');
}
