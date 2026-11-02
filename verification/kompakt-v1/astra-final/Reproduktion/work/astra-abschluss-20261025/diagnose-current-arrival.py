"""Compare the reported CI position to actual fresh samples; do not infer absent CI telemetry."""
from pathlib import Path
import hashlib,json,math
base=Path(__file__).resolve().parent;q=base/'final-4eb186a';source=q/'arrival-original900/result.json';d=json.loads(source.read_text());plan=json.loads((q/'result.json').read_text());row=next(x for x in plan['checks']if x['name']=='arrival-original900')
w=[x for x in d['walk']if x['segment']=='full-main-route'];x=54.73158935811298;z=-9.557866034125013;crossings=[]
for a,b in zip(w,w[1:]):
 ax,az=a['observer']['x'],a['observer']['z'];bx,bz=b['observer']['x'],b['observer']['z'];dx,dz=bx-ax,bz-az
 if dx*dx+dz*dz==0:continue
 t=max(0,min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));dist=math.hypot(ax+t*dx-x,az+t*dz-z)
 crossings.append({'distanceToSampledSegmentMeters':dist,'fraction':t,'before':a,'after':b,'observedBeforeWallSeconds':a['wall']-w[0]['wall'],'observedAfterWallSeconds':b['wall']-w[0]['wall']})
closest=min(crossings,key=lambda c:c['distanceToSampledSegmentMeters'])
r={'sourceCommit':d['sourceCommit'],'htmlSHA256':d['htmlSHA256'],'sourceResult':'arrival-original900/result.json','sourceResultSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'originalBudgetSeconds':d['walkWallBudgetSeconds'],'actualProcessPassed':row['passed'],'actualExitCode':row['exitCode'],'reportedHistoricalCI':{'run':40101598733,'waypoint':1386,'x':x,'z':z,'provenance':'User-supplied independent report; full original CI trace unavailable'},'closestRecordedCrossing':closest,'actualWalkSegments':d.get('walkSegments',[]),'scope':'Original unchanged local driver on current delivered HTML. Distance is interpolated between two recorded positions, not a directly measured point or reconstructed CI trace. Local crossing and wall time do not prove the exact CI cause. No fabricated CI traceback.'}
(q/'arrival-current-position-diagnosis.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'passed':row['passed'],'nearestMeters':closest['distanceToSampledSegmentMeters'],'indices':[closest['before']['index'],closest['after']['index']],'wallBracketSeconds':[closest['observedBeforeWallSeconds'],closest['observedAfterWallSeconds']]}))
