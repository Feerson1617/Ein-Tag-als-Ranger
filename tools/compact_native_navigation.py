"""Native-only navigation helper for the additional learner acceptance.
Offline path planning reads the actual collision model. Browser actions are
mouse drags and held W; no reference views, coordinate/clock/evidence writes.
This is technical reachability, not a claim of unaided pupil wayfinding time.
"""
import heapq,json,math,subprocess,time

def load_plan(root):
 script="""import {canWalk,PATHS,SIGNS,terrainHeight}from'./dist/compact/layout.js';
 import {createReferenceState}from'./dist/compact/world-state.js';
 import {SPEAKERS,speakerApproach}from'./dist/compact/village.js';
 const s=createReferenceState(),blocks=[...s.trees,...SPEAKERS.map(p=>({...p,r:.29})),...SIGNS.map(p=>({...p,halfX:.9,halfZ:.04})),...Array.from({length:5},(_,i)=>({x:-61-i,z:-2-i*.25,r:.27}))],nodes=[];
 // Reserve extra NPC clearance for the native controller tolerance; validate entire edges, not only grid endpoints.
 const safe=(x,z)=>canWalk(x,z,blocks)&&SPEAKERS.every(p=>Math.hypot(x-p.x,z-p.z)>=1.0);
 for(let x=-78;x<=78;x++)for(let z=-48;z<=48;z++)if(safe(x,z))nodes.push([x,z]);
 const allowed=new Set(nodes.map(p=>p.join(','))),blockedEdges=[];
 for(const [x,z]of nodes)for(const [dx,dz]of [[1,0],[0,1],[1,1],[1,-1]]){
  if(!allowed.has([x+dx,z+dz].join(',')))continue;
  const count=Math.ceil(Math.hypot(dx,dz)/.08);
  if(Array.from({length:count+1},(_,i)=>i/count).some(t=>!safe(x+dx*t,z+dz*t)))blockedEdges.push([x,z,x+dx,z+dz]);
 }
 console.log(JSON.stringify({nodes,blockedEdges,paths:PATHS,speakers:Object.fromEntries(SPEAKERS.map(p=>['npc-'+p.id,speakerApproach(p)]))}));"""
 return json.loads(subprocess.check_output(['node','--input-type=module','-e',script],cwd=root,text=True))

class NativeNavigator:
 def __init__(self,page,root,result,save):
  self.page=page;self.result=result;self.save=save;self.plan=load_plan(root);self.nodes={tuple(p)for p in self.plan['nodes']};self.blockedEdges={tuple(e)for e in self.plan['blockedEdges']};self.blockedEdges.update((e[2],e[3],e[0],e[1])for e in self.plan['blockedEdges'])
  self.targets={'nettle':(-40,12),'oak':(-35,-8),'coast':(63,-13),'wood':(-60,-4),'keilm':(32,10),'woodruff':(-54,8),'outlook':(63,4),'flowers':(-28,9),'dusk':(-62,-23)}
  self.targets.update({k:(v['x'],v['z'])for k,v in self.plan['speakers'].items()})
 def read(self):return self.page.locator('#world').evaluate('e=>({observer:JSON.parse(e.dataset.observer),time:Number(e.dataset.simulationTime),runId:e.dataset.runId})')
 def route(self,start,end):
  nearest=lambda p:min(self.nodes,key=lambda q:math.dist(p,q))
  start=nearest(start);goal=nearest(end);queue=[(math.dist(start,goal),0,start)];cost={start:0};parent={}
  while queue:
   _,g,n=heapq.heappop(queue)
   if n==goal:
    rows=[n]
    while n!=start:n=parent[n];rows.append(n)
    return list(reversed(rows))
   if g>cost[n]:continue
   for dx,dz in [(1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)]:
    q=(n[0]+dx,n[1]+dz)
    if (*n,*q)in self.blockedEdges or q not in self.nodes or (dx and dz and ((n[0]+dx,n[1])not in self.nodes or(n[0],n[1]+dz)not in self.nodes)):continue
    ng=g+math.hypot(dx,dz)
    if ng<cost.get(q,math.inf):cost[q]=ng;parent[q]=n;heapq.heappush(queue,(ng+math.dist(q,goal),ng,q))
  raise AssertionError(('No ordinary walkable route',start,end))
 def look(self,yaw):
  p=self.page;o=self.read()['observer'];delta=(o['yaw']-yaw+math.pi)%(math.pi*2)-math.pi
  # Drag safely inside the unobscured centre, even on the small test viewport.
  while abs(delta)>1e-4:
   turn=max(-.30,min(.30,delta));p.mouse.move(350,260);p.mouse.down();p.mouse.move(350+turn/.003,260);p.mouse.up();delta-=turn
 def go(self,key):
  p=self.page
  if p.locator('#panel').is_visible():p.locator('#close').click()
  for button in ['#binocular','#magnifier','#brisk']:
   if p.locator(button).get_attribute('aria-pressed')=='true':p.locator(button).click()
  before=self.read();start=(before['observer']['x'],before['observer']['z']);target=self.targets[key];route=self.route(start,target)
  row={'destination':key,'start':before,'plannedMeters':sum(math.dist(a,b)for a,b in zip(route,route[1:])),'samples':[],'input':'W and native mouse drag only'};self.result.setdefault('nativeRoutes',[]).append(row)
  began=time.monotonic();anchor=start;last_motion=began;distance=0;last=start
  try:
   for point in route[1:]+[target]:
    while True:
     d=self.read();o=d['observer'];pos=(o['x'],o['z']);distance+=math.dist(last,pos);last=pos
     if math.dist(pos,point)<.38:break
     now=time.monotonic()
     if math.dist(anchor,pos)>.03:anchor=pos;last_motion=now
     assert now-last_motion<25,('Native route blocked',key,pos,point)
     assert now-began<1800,('Native route guard',key,pos)
     yaw=math.atan2(-(point[0]-pos[0]),-(point[1]-pos[1]));delta=(o['yaw']-yaw+math.pi)%(2*math.pi)-math.pi
     if abs(delta)>.05:p.keyboard.up('w');self.look(yaw)
     p.keyboard.down('w')
     p.wait_for_function('(t)=>Number(document.querySelector("#world").dataset.simulationTime)>t',arg=d['time']);p.wait_for_timeout(80)
     if not row['samples']or now-began-row['samples'][-1]['elapsed']>5:row['samples'].append({'elapsed':now-began,**d});self.save()
    p.keyboard.up('w')
   row.update(passed=True,actualSeconds=time.monotonic()-began,sampledMeters=distance,end=self.read());self.save();print('NATIVE ARRIVAL',key,round(distance,1),round(row['actualSeconds'],1),flush=True)
  finally:p.keyboard.up('w')
