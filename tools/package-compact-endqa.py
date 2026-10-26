"""Package the new review round locally; never merge, deploy or publish."""
from pathlib import Path
import argparse,hashlib,html,json,re,shutil,subprocess,sys,zipfile


def evidence_path(value):
 assert isinstance(value,str)and value and not any(c in value for c in ['\\','\x00','?', '#', ':']),value
 path=Path(value)
 assert not path.is_absolute()and '..'not in path.parts and path.as_posix()==value,value
 return path


def media_path(report_path,filename):
 name=evidence_path(filename)
 assert name.name==filename,filename
 return (evidence_path(report_path).parent/name).as_posix()


def arrival_reports(summary,read_report):
 evidence=summary['arrivalEvidence'];original=evidence['original'];supplemental=evidence.get('supplemental')
 assert original['status']=='FAILED'and original['passed']is False and original['walkWallBudgetSeconds']==900
 historical=read_report(evidence_path(original['report']))
 assert historical['passed']is False and historical['sourceCommit']==original['runtimeCommit']
 # The historical failure deliberately has no current-runtime/HTML binding.
 if supplemental is None:return original,None,None
 assert supplemental['walkWallBudgetSeconds']==3600
 assert supplemental['runtimeCommit']==summary['runtimeFreeze']['runtimeCommit']
 current=read_report(evidence_path(supplemental['report']))
 assert type(current['passed'])is bool and current['passed']==supplemental['passed']
 assert supplemental['status']==('PASS'if current['passed']else'FAILED')
 assert current['walkWallBudgetSeconds']==3600
 assert current['runtimeSourceHashes']==summary['runtimeFreeze']['sourceHashes']
 return original,supplemental,current


def delivery_binding(tested,delivery,freeze,name):
 assert tested['passed']and not tested.get('failure'),name+' requires successful current evidence'
 assert tested['runtimeSourceHashes']==freeze['sourceHashes'],name+' uses different runtime sources'
 matches=[]
 for dirty in ['false','true']:
  original_stamp=f'<meta name="compact-build" content="{tested["sourceCommit"]}; dirty={dirty}">'
  recreated=re.sub(r'<meta name="compact-build" content="[^"]+">',original_stamp,delivery)
  if hashlib.sha256(recreated.encode()).hexdigest()==tested['htmlSHA256']:matches.append(dirty)
 assert len(matches)==1,'Delivery differs beyond provenance metadata from '+name
 return {'testedCommit':tested['sourceCommit'],'testedHTMLSHA256':tested['htmlSHA256'],'testedDirtyStamp':matches[0],'identicalExceptProvenanceMetaTag':True}


def current_bindings(summary,delivery,read_report):
 freeze=summary['runtimeFreeze'];bindings={}
 for name in ['feeding','growth']:
  bindings[name]=delivery_binding(read_report(Path(name)/'result.json'),delivery,freeze,name)
 original,supplemental,arrival=arrival_reports(summary,read_report)
 if arrival is not None and arrival['passed']:
  bindings['supplemental-arrival-3600']=delivery_binding(arrival,delivery,freeze,'supplemental-arrival-3600')
 return bindings,original,supplemental,arrival


def evidence_index(summary,original,supplemental,arrival):
 escape=html.escape
 page='''<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nachbesserung 23.10.2026</title><style>body{font:16px/1.5 system-ui;max-width:1300px;margin:30px auto;padding:20px;background:#eee8d6;color:#263c32}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px}figure{margin:0}img,video{width:100%}a{color:#345d45}</style><h1>Neue Nachbesserungsprüfung</h1><p><a href="SUMMARY.json">Ausgeführte Prüfungen und Grenzen</a> · <a href="SHA256.json">Rohdatei-Hashes</a> · <a href="../KORREKTUREN.md">Status F01–F13/N01–N04</a> · <a href="../QUELLEN-2026-10-23.md">Quellenabgleich</a></p><p><a href="reviews/FINAL-REVIEW-INDEX.json">Sicht- und Druckprüfungen mit ihrem Umfang</a> · <a href="reviews/final-arrival-review.md">Arrival-Sichtprüfung und Grenzen</a> · <a href="reviews/final-arrival-review.json">Gebundene Arrival-Prüfdaten</a> · <a href="reviews/final-feeding-review.md">Feeding-Sichtprüfung und Grenzen</a> · <a href="habitat-final-gallery.html">Habitatvergleich</a> · <a href="reference/context-recovery-result.json">Native Grafik-Wiederherstellung und öffentlicher Reload-Fallback</a></p>'''
 page+='<h2>Ursprünglicher Ankunftslauf: fehlgeschlagen</h2><p>Die ursprüngliche Wegprüfung mit einer Zeitgrenze von <strong>900 Sekunden je Wegabschnitt</strong> ist fehlgeschlagen und bleibt als eigenständiger Befund erhalten. Ihr Runtime-Commit ist <code>'+escape(original['runtimeCommit'])+'</code>. Sie erhält keine Hashbindung an den neuen Runtime-Stand.</p><p><a href="'+escape(evidence_path(original['report']).as_posix())+'">Ursprünglicher Fehlerbericht</a> · <a href="'+escape(evidence_path(original['log']).as_posix())+'">Ursprüngliches Fehlerprotokoll</a> · <a href="historical-plan/result.json">Historischer vollständiger Prüfplan</a></p>'
 if supplemental is None:
  page+='<h2>Ergänzender Ankunftslauf: nicht vorhanden</h2><p>Dieses Paket belegt keinen erfolgreich abgeschlossenen ergänzenden Weglauf. Es zeigt keine daraus abgeleiteten vollständigen Nahrungssuchfolgen.</p>'
 else:
  passed=arrival['passed']
  page+='<h2>Ergänzender Ankunftslauf: '+('funktional bestanden'if passed else'fehlgeschlagen')+'</h2><p>Dieser gesonderte Lauf hat eine Zeitgrenze von <strong>3600 Sekunden je Wegabschnitt</strong>. Er dient ausschließlich der Funktionsprüfung in langsamer Cloudsoftwaregrafik. Er macht den ursprünglichen 900-Sekunden-Fehler nicht erfolgreich und belegt keine ausreichende Geschwindigkeit oder Mindestgeräteleistung.</p><p><a href="'+escape(evidence_path(supplemental['report']).as_posix())+'">Bericht des ergänzenden Laufs</a></p>'
  if supplemental.get('processTimeoutSeconds') is not None:
   budget=supplemental['processTimeoutSeconds'];assert type(budget)is int and budget>0
   page+='<p>Die davon getrennte Prozessgrenze des Gesamtaufrufs beträgt '+str(budget)+' Sekunden.</p>'
  if passed:
   sequences=arrival['sequences'];assert sequences and all(s['passed']for s in sequences)
   page+='<p>Der ergänzende Lauf belegt den vollständigen Weg über normale Eingaben und '+str(len(sequences))+' protokollierte Nahrungssuchfolgen in ausdrücklich begonnenen endlichen Beobachtungsfenstern am erreichten Ort. Modellphasen und Ereignisdaten sind keine uneingeschränkte visuelle Abnahme von Kleinstbeute, Schlucken oder natürlicher Animation. Eine separat gesteuerte lange Modellwartebedingung ist keine tatsächlich geleistete K1-Arbeit; ihr Umfang steht im Rohbericht.</p>'
   if arrival.get('video'):
    src=media_path(supplemental['report'],arrival['video']['file'])
    page+='<h3>Unbeschleunigte tatsächliche Nahrungssuchfolge</h3><video controls preload="metadata" src="'+escape(src)+'"></video><p>Die tatsächliche Canvas-Aufzeichnung verwendet Echtzeit. Wegtelemetrie und Bilder dokumentieren die Bedienung separat; ausdrücklich beschriftete Modellschritte bleiben davon getrennt.</p><p>In den ausgewählten unveränderten Videoframes ist der Ziel-Austernfischer klein im Hintergrund zu sehen; der größere Vogel im Vordergrund ist ein anderes Individuum. Die konkrete Muschel und ein eigenständiger Schluckvorgang sind darin nicht sicher erkennbar. Die gebundene <a href="reviews/final-arrival-review.md">Arrival-Sichtprüfung</a> trennt außerdem die Dauer der Aufnahmeoperation vom Zeitstempel des letzten codierten Videobildes.</p>'
   for sequence in sequences:
    page+='<h3>'+escape(sequence['id'])+' · '+('Echtzeit'if sequence['realtime']else'beschriftete Modellschritte')+'</h3><div class="grid">'
    for capture in sequence['captures']:
     src=media_path(supplemental['report'],capture['file'])
     page+='<figure><img loading="lazy" src="'+escape(src)+'"><figcaption>'+escape(capture['phase'])+'</figcaption></figure>'
    page+='</div>'
  else:
   page+='<p>Der ergänzende Lauf ist ebenfalls fehlgeschlagen. Dieses Paket enthält seine Fehlernachweise; daraus werden weder ein erfolgreich abgeschlossener vollständiger Weg noch vollständige Nahrungssuchfolgen abgeleitet. Teilaufnahmen sind nur über den Rohbericht erreichbar.</p>'
 page+='<p>Physisches iPad 9/Safari/iPadOS 27, unabhängige biologische/visuelle Endabnahme und Unterrichtspilot bleiben ungeprüft. Weder ein ergänzender funktionaler Erfolg noch dieses lokale Paket ist eine Leistungs-, Geräte- oder Veröffentlichungsfreigabe.</p></html>'
 return page


p=argparse.ArgumentParser();p.add_argument('--evidence',default='verification/kompakt-endqa-20261023/final');a=p.parse_args()
root=Path(__file__).resolve().parents[1];proof=root/a.evidence;load=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
summary=load(proof/'SUMMARY.json');freeze=summary['runtimeFreeze'];manifest=load(proof/'SHA256.json')
for name,digest in manifest.items():assert sha(proof/name)==digest,'Changed sealed evidence: '+name
for name,digest in freeze['sourceHashes'].items():assert sha(root/'dist'/name)==digest,'Runtime changed: '+name
delivery=(root/'outputs/Ranger-Kompakt.html').read_text();stamp=re.search(r'<meta name="compact-build" content="([^"]+)">',delivery)[1]
smoke=load(root/'work/compact-browser/standalone-result.json');assert smoke['buildStamp']==stamp and smoke['runtimeSourceHashes']==freeze['sourceHashes']
bindings,original,supplemental,arrival=current_bindings(summary,delivery,lambda relative:load(proof/relative))
page=evidence_index(summary,original,supplemental,arrival)
for link in re.findall(r'(?:href|src)="([^"#]+)"',page):
 if link.startswith('../'):continue
 assert (proof/evidence_path(html.unescape(link))).is_file(),'Missing packaged evidence link: '+link
subprocess.run([sys.executable,str(root/'tools/package-compact-review.py')],cwd=root,check=True)
out=root/'outputs/Ranger-Kompakt-Abnahme';shutil.copytree(proof,out/'Nachbesserung-2026-10-23')
for name in ['STATUS.md','TESTS.md','KORREKTUREN.md','QUELLEN-2026-10-23.md']:
 shutil.copyfile(root/'docs/kompakt'/name,out/name)
info=load(out/'build-info.json');info['endQA']={'summary':'Nachbesserung-2026-10-23/SUMMARY.json','deliveredHTMLSHA256':sha(root/'outputs/Ranger-Kompakt.html'),'deliveredBuildStamp':stamp,'bindings':bindings,'runtimeFreeze':freeze,'arrivalEvidence':summary['arrivalEvidence'],'historicalBrowserPlan':summary['historicalBrowserPlan'],'finalBrowserPlan':summary['finalBrowserPlan'],'physicalDeviceAndClassroomTested':False}
(out/'build-info.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n')
(out/'Nachbesserung-2026-10-23/index.html').write_text(page)
index=(out/'index.html').read_text();index=index.replace('<h1>','<p><a href="Nachbesserung-2026-10-23/index.html">Neue Nachbesserungsbelege vom 23.10.2026 öffnen</a></p><h1>',1);(out/'index.html').write_text(index)
(out/'FILE-SHA256.json').write_text(json.dumps({str(p.relative_to(out)):sha(p)for p in sorted(out.rglob('*'))if p.is_file()and p.name!='FILE-SHA256.json'},indent=2)+'\n')
archive=root/'outputs/Ranger-Kompakt-Abnahme.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=7)as z:
 for p in sorted(out.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(out))
with zipfile.ZipFile(archive)as z:
 assert z.testzip()is None
 for name,digest in load(out/'FILE-SHA256.json').items():assert hashlib.sha256(z.read(name)).hexdigest()==digest,name
arrival_passed=arrival is not None and arrival['passed']
print(json.dumps({'verified':True,'verificationScope':'Archive integrity; original 900-second failure remains failed and arrival function is reported separately.','bytes':archive.stat().st_size,'deliveredHTMLSHA256':info['endQA']['deliveredHTMLSHA256'],'newSequences':len(arrival['sequences'])if arrival_passed else 0,'supplementalArrivalPassed':arrival_passed,'original900SecondArrivalPassed':False}))
