export const BIRD_RECORDINGS={
 parus_major:{url:'./assets/bird-great-tit.mp3',name:'Kohlmeise',author:'Oona Räisänen (Mysid)',license:'Public Domain',source:'https://commons.wikimedia.org/wiki/File:Parus_major.ogg',duration:2.8,type:'Gesang'},
 turdus_merula:{url:'./assets/bird-blackbird.mp3',name:'Amsel',author:'Oona Räisänen (Mysid)',license:'Public Domain',source:'https://commons.wikimedia.org/wiki/File:Turdus_merula_2.ogg',duration:25,type:'Gesang'},
 larus_argentatus:{url:'./assets/bird-herring-gull.mp3',name:'Silbermöwe',author:'Sonothèque ADVL',license:'CC0 1.0',source:'https://commons.wikimedia.org/wiki/File:XC707075_-_European_Herring_Gull_-_Larus_argentatus.mp3',duration:19.485,type:'Flugruf'}
};

export function audibleBirds(agents,observer){
 return agents.filter(a=>a.alive&&!a.dormant&&!a.scenarioSuppressed&&!a.scenarioInactive&&BIRD_RECORDINGS[a.species]&&!['hunting','feeding','fleeing','diving','stooping'].includes(a.activity)&&
  (a.species==='larus_argentatus'?a.flight>.4:a.speed<.25)&&Math.hypot((a.renderX??a.x)-observer.x,(a.renderZ??a.z)-observer.z)<42);
}

export class FieldSoundscape {
 constructor(button){this.button=button;this.buffers=new Map();this.pending=new Map();this.voices=new Set();this.enabled=false;this.timer=1;this.lastSpecies=null;}
 context(){this.audio||=new (window.AudioContext||window.webkitAudioContext)();return this.audio;}
 async buffer(key){
  if(this.buffers.has(key))return this.buffers.get(key);if(this.pending.has(key))return this.pending.get(key);
  const promise=fetch(assetUrl(BIRD_RECORDINGS[key].url)).then(r=>{if(!r.ok)throw new Error('Aufnahme nicht geladen');return r.arrayBuffer();}).then(b=>this.context().decodeAudioData(b)).then(buffer=>{
   this.buffers.set(key,buffer);this.button.dataset.recordingsReady=String(this.buffers.size);return buffer;
  }).catch(()=>{this.button.dataset.audioError='true';return null;});
  this.pending.set(key,promise);return promise;
 }
 async toggle(){
  this.enabled=!this.enabled;this.button.classList.toggle('active',this.enabled);this.button.setAttribute('aria-label',this.enabled?'Vogelstimmen ausschalten':'Vogelstimmen einschalten');this.button.title=this.enabled?'Echte Vogelstimmen · ausschalten':'Echte Vogelstimmen · einschalten';
  if(!this.enabled){this.stop();return false;}await this.context().resume();
  await Promise.all(Object.keys(BIRD_RECORDINGS).map(key=>this.buffer(key)));this.timer=0;return this.enabled;
 }
 stop(){for(const v of this.voices){try{v.source.stop();}catch{}}this.voices.clear();this.button.dataset.activeVoices='0';}
 async play(key,{volume=.12,pan=0,seconds=8,preview=false}={}){
  if(this.voices.size>=2)return false;const audio=this.context();await audio.resume();const buffer=await this.buffer(key);if(!buffer||this.voices.size>=2||(!this.enabled&&!preview))return false;
  const source=audio.createBufferSource(),gain=audio.createGain(),panner=audio.createStereoPanner(),length=Math.min(seconds,buffer.duration),now=audio.currentTime;
  source.buffer=buffer;panner.pan.value=Math.max(-.9,Math.min(.9,pan));gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+.16);gain.gain.setValueAtTime(volume,now+Math.max(.2,length-.35));gain.gain.linearRampToValueAtTime(0,now+length);
  source.connect(gain);gain.connect(panner);panner.connect(audio.destination);const voice={source,preview};this.voices.add(voice);
  this.button.dataset.activeVoices=String(this.voices.size);this.button.dataset.lastRecording=key;
  source.onended=()=>{this.voices.delete(voice);source.disconnect();gain.disconnect();panner.disconnect();this.button.dataset.activeVoices=String(this.voices.size);};source.start(now,0,length);return true;
 }
 update(dt,agents,observer,active){
  if(!this.enabled)return;if(!active){for(const v of this.voices)if(!v.preview){try{v.source.stop();}catch{}}return;}
  this.timer-=dt;if(this.timer>0||this.voices.size>=2)return;this.timer=9+Math.random()*9;
  const birds=audibleBirds(agents,observer).sort((a,b)=>Number(a.species===this.lastSpecies)-Number(b.species===this.lastSpecies));if(!birds.length)return;
  const a=birds[0],x=a.renderX??a.x,z=a.renderZ??a.z,d=Math.hypot(x-observer.x,z-observer.z),bearing=Math.atan2(x-observer.x,-(z-observer.z))+observer.yaw;
  this.lastSpecies=a.species;this.play(a.species,{volume:.17/(1+d/10),pan:Math.sin(bearing),seconds:a.species==='parus_major'?2.8:8});
 }
 preview(key){this.stop();return this.play(key,{volume:.18,seconds:BIRD_RECORDINGS[key].duration,preview:true});}
}
import { assetUrl } from './asset-url.js?revision=120';
