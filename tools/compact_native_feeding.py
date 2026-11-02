"""Four observed, saved feeding events, with real walking and no model steps."""
import base64,hashlib,json,time,math

def feeding_episodes(page,out,result,save,navigator):
 for individual,target in [('compact-oystercatcher',(61,-12)),('compact-avocet',(65,-12)),('compact-spoonbill',(73,2)),('compact-redshank',(63,4))]:
  if page.locator('#behavior-stop').is_visible():page.locator('#behavior-stop').click()
  navigator.targets[individual]=min(navigator.nodes,key=lambda p:math.dist(p,target));navigator.go(individual)
  page.locator('#study').click();previousRun=page.locator('#world').get_attribute('data-run-id');page.locator('#new-observation-context').click()
  page.wait_for_function('(old)=>{const d=document.querySelector("#world").dataset;return d.runId!==old&&Number(d.simulationTime)===0&&d.renderRevision===d.sceneRevision}',arg=previousRun)
  before=page.locator('#world').evaluate('c=>({time:Number(c.dataset.simulationTime),runId:c.dataset.runId,observer:JSON.parse(c.dataset.observer)})');started=time.monotonic()
  page.evaluate("()=>{const stream=document.querySelector('#world').captureStream(12),v=window.__nativeVideo={stream,chunks:[]};v.rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8',videoBitsPerSecond:700000});v.rec.ondataavailable=e=>{if(e.data.size)v.chunks.push(e.data)};v.rec.start(1000)}")
  page.locator('[data-realtime="'+individual+'"]').click();page.locator('#behavior-detail').click();page.locator('#feeding-expand').click()
  row={'individual':individual,'before':before,'samples':[],'scope':'Normal walked-to position, explicitly new finite trial. Unaccelerated frames; no model-step button or state/clock writes. Saved event must be witnessed by actual sight/contact rules, not merely present in the simulation log.'};result.setdefault('pathBEpisodes',[]).append(row)
  try:
   while True:
    d=page.locator('#world').evaluate('c=>({time:Number(c.dataset.simulationTime),runId:c.dataset.runId,observer:JSON.parse(c.dataset.observer),actors:JSON.parse(c.dataset.coastal),events:JSON.parse(c.dataset.coastalEvents),contacts:JSON.parse(c.dataset.visibleFeedingContacts),witnessed:JSON.parse(c.dataset.witnessedFeedingEvents),visibility:JSON.parse(c.dataset.behaviorVisibility||"null"),detail:JSON.parse(c.dataset.feedingDetail||"null"),ownSeconds:Number(c.dataset.observationSeconds)})')
    row['samples'].append({'wallSeconds':time.monotonic()-started,**d});save()
    assert d['observer']['x']==before['observer']['x']and d['observer']['z']==before['observer']['z']
    if any(e['actors'][0]==individual for e in d['witnessed']) and page.locator('#record').is_enabled():break
    actor=next(a for a in d['actors']if a['id']==individual);detail=d['detail']
    # The existing lens intentionally follows one concrete episode. Reopen it
    # through ordinary pointer controls for a later prey, never retarget state.
    if detail and detail['episodeCompleted'] and actor['phase']in['approaching','searching','handling']and actor.get('targetId')and actor['targetId']!=detail['preyId']:
     page.locator('#feeding-close').click();page.locator('#behavior-detail').click();page.locator('#feeding-expand').click()
     row.setdefault('lensReopens',[]).append({'time':d['time'],'previousEventId':detail['eventId'],'nextPreyId':actor['targetId'],'input':'Mouse close, reopen, expand; existing one-episode lens'})
    elif detail and detail['phase']=='handling'and detail['preyVisible']and detail['eventId']==actor.get('feedingEventId')and not any(c['eventId']==detail['eventId']for c in row.get('contactFrames',[])):
     filename=individual+'-contact-'+str(len(row.get('contactFrames',[])))+'.png';page.screenshot(path=str(out/filename));row.setdefault('contactFrames',[]).append({'file':filename,'eventId':detail['eventId'],'preyId':detail['preyId'],'sample':detail,'scope':'Live screenshot immediately after this read-only sample; simulation continues.'})
    assert time.monotonic()-started<480,('No saveable witnessed feeding event within explicit 480s supplemental guard',individual)
    page.wait_for_timeout(100)
   row['beforeSave']=d
   row['liveDetail']=json.loads(page.locator('#world').get_attribute('data-feeding-detail')or'null');page.screenshot(path=str(out/(individual+'-event-completed.png')))
   # Closing this visual lens by mouse must preserve the actual witness.
   page.locator('#feeding-close').click()
   # Save during the real visible event, rather than waiting until departure.
   page.locator('#record').click();page.screenshot(path=str(out/(individual+'-record-form.png')))
   page.locator('#note').fill('Pfad B: selbst beobachteter Kontakt und Nahrungsaufnahme dieses Vogels am erreichten Ort. Modellbeleg; kein Naturbeweis.');page.locator('#save-note').click()
   book=page.evaluate("JSON.parse(localStorage.getItem('ranger-compact-fieldbook-v2'))");record=book['records'][-1];row['record']=record
   assert record['individualId']==individual and record['observationSeconds']>=2.5
   events=[e for e in record['events']if e['actors'][0]==individual];assert events,'Saved record must contain a witnessed feeding event'
   assert record['runId']==before['runId']
   row['record']=record;row['passed']=True;print('SAVED FEEDING',individual,events[0]['id'],flush=True)
  finally:
   encoded=page.evaluate("()=>new Promise(resolve=>{const v=window.__nativeVideo;v.rec.onstop=async()=>{const raw=new Uint8Array(await new Blob(v.chunks,{type:'video/webm'}).arrayBuffer());let text='';for(let i=0;i<raw.length;i+=32768)text+=String.fromCharCode(...raw.subarray(i,i+32768));v.stream.getTracks().forEach(t=>t.stop());resolve(btoa(text));};v.rec.stop()})")
   raw=base64.b64decode(encoded);filename=individual+'-realtime.webm';(out/filename).write_bytes(raw);row['video']={'file':filename,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'wallSeconds':time.monotonic()-started};save()
 if page.locator('#behavior-stop').is_visible():page.locator('#behavior-stop').click()
 page.locator('#journal-button').click()
 page.screenshot(path=str(out/'path-b-saved-bird-records.png'))
 visible=page.locator('#panel-body').inner_text()
 for row in result['pathBEpisodes']:
  assert row['record']['id'] in visible or row['record']['individualId'] in visible,('Saved bird not available in fieldbook',row['individual'])
 result['pathBReuse']={'scope':'Four saved fieldbook sources for the manual Path B bird comparison; this is not an automatic scientific grade.','records':[row['record']['id']for row in result['pathBEpisodes']]}
 with page.expect_download()as transfer:page.locator('#export').click()
 transfer.value.save_as(str(out/'path-b-four-saved-birds.json'))
 exported=json.loads((out/'path-b-four-saved-birds.json').read_text())
 for row in result['pathBEpisodes']:
  assert next(r for r in exported['records']if r['id']==row['record']['id'])==row['record']
 page.locator('#close').click();save();navigator.go('coast')
