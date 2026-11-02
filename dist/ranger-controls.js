export const WALK_SPEED=2.8;
export const SPRINT_SPEED=7.5; // Previous sprint was 5 m/s; increase by exactly 50%.
export const OBSERVATION_SPEED=1.05;
// Some embedded WebViews expose the API but never settle its promise.
export async function switchFullscreen(doc,timeoutMs=2000){
 const element=doc.fullscreenElement?doc:doc.documentElement,action=doc.fullscreenElement?doc.exitFullscreen:element?.requestFullscreen;
 if(typeof action!=='function')throw new Error('Fullscreen unavailable');
 let timer;
 try{await Promise.race([Promise.resolve(action.call(element)),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Fullscreen unavailable')),timeoutMs);})]);}
 finally{clearTimeout(timer);}
 return !!doc.fullscreenElement;
}
export function stickInput(dx,dy,radius){
 const distance=Math.hypot(dx,dy),limit=Math.max(12,radius-22),amount=Math.min(1,Math.max(0,(distance-4)/(limit-4)));
 return{x:distance?dx/distance*amount:0,y:distance?-dy/distance*amount:0,thumbX:distance?dx/distance*Math.min(distance,limit):0,thumbY:distance?dy/distance*Math.min(distance,limit):0};
}
export function walkingInput(stick,keys,observing=false,profile=null){
 const f=Number(keys.has('w')||keys.has('arrowup'))-Number(keys.has('s')||keys.has('arrowdown'));
 const r=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
 const keyboard=!!(f||r),forward=keyboard?f:stick.y,right=keyboard?r:stick.x,m=Math.hypot(forward,right);
 const maximum=profile?(observing?profile.observation:keys.has('shift')?profile.brisk:profile.walk):(observing?OBSERVATION_SPEED:keyboard&&!keys.has('shift')?WALK_SPEED:SPRINT_SPEED);
 return {forward:m?forward/m:0,right:m?right/m:0,amount:Math.min(1,m),speed:Math.min(1,m)*maximum,maximum};
}
