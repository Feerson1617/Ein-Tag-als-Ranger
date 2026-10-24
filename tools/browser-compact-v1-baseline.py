"""Serial real-WebGL forest/coast/detail diagnostics; no private world writes.

Explicit unique output is required. A completed diagnostic is not a product or
hardware PASS. Reuse unchanged for before/after comparison of the same cameras.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import argparse, hashlib, json, re, shutil, statistics, subprocess, time, traceback

p = argparse.ArgumentParser()
p.add_argument('--entry', default='outputs/Ranger-Kompakt.html')
p.add_argument('--output', required=True)
p.add_argument('--seconds', type=int, default=15)
p.add_argument('--compare', help='Actual earlier six-camera result JSON; fixed camera assertions only')
a = p.parse_args()
root = Path(__file__).resolve().parents[1]
entry = (root / a.entry).resolve()
out = root / a.output
out.mkdir(parents=True, exist_ok=False)
earlier = json.loads((root/a.compare).read_text()) if a.compare else None
raw = entry.read_bytes()
meta = re.search(r'<meta name="compact-build" content="([^"]+)"', raw.decode())
r = {'diagnosticComplete': False, 'sourceGitHead': subprocess.check_output(
    ['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(),
    'artifactBuild': meta.group(1) if meta else None,
    'htmlSHA256': hashlib.sha256(raw).hexdigest(), 'driverSHA256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), 'sourceGitDirty': bool(subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip()),
    'scope': 'Real Chromium WebGL, public reference UI only. No full route, '
             'hardware acceptance, private state/clock/evidence writes or FPS PASS.',
    'captures': [], 'profiles': [], 'errors': []}


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(entry.parent)))
Thread(target=server.serve_forever, daemon=True).start()


def data(page):
    return page.locator('#world').evaluate('(e)=>({...e.dataset})')


def save():
    (out / 'result.json').write_text(json.dumps(r, ensure_ascii=False, indent=2) + '\n')


def visit(page, name):
    page.locator('#menu-button').click()
    page.get_by_text('Referenzabschnitt prüfen', exact=True).click()
    page.locator('[data-view="' + name + '"]').click()
    page.wait_for_function('document.querySelector("#world").dataset.renderRevision==='
                           'document.querySelector("#world").dataset.sceneRevision')


def capture(page, name):
    d = data(page)
    path = out / (name + '.png')
    page.screenshot(path=str(path))
    if earlier and name in ['start','woodruff','nettle','wood','village-edge','oak-edge']:
        old = next(x for x in earlier['captures'] if x['file']==path.name)
        observer = json.loads(d['observer'])
        assert all(abs(observer[k]-old['observer'][k])<1e-8 for k in ['x','z','yaw','pitch']), (name,observer,old['observer'])
        assert d['renderFov']==old['sample']['renderFov']
        r.setdefault('cameraPairs',[]).append({'name':name,'beforeSHA256':old['sha256'],'afterSHA256':hashlib.sha256(path.read_bytes()).hexdigest(),'sameActualCamera':True,'scope':'Same actual X/Z/yaw/pitch/FOV. Animals/model times may differ; normal walk images are not falsely fixed-position paired.'})
    r['captures'].append({'file': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                          'observer': json.loads(d['observer']), 'sample': d})
    save()


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=shutil.which('chromium'),
        args=['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    ctx = browser.new_context(viewport={'width': 1200, 'height': 750})
    page = ctx.new_page()
    page.set_default_timeout(60000)
    page.on('pageerror', lambda e: r['errors'].append(str(e)))
    try:
        page.goto(f'http://127.0.0.1:{server.server_port}/{entry.name}')
        page.wait_for_selector('#world[data-ready=true]', timeout=120000)
        page.locator('#start').click()
        r['browser'] = browser.version
        system = browser.new_browser_cdp_session()
        gpu = system.send('SystemInfo.getInfo')
        r['gpu'] = gpu.get('gpu')
        cdp = ctx.new_cdp_session(page)
        cdp.send('Performance.enable')
        for name, view in [('start', 'comparison-start'), ('woodruff', 'comparison-woodruff'),
                           ('nettle', 'comparison-nettle'), ('wood', 'comparison-wood'),
                           ('village-edge', 'comparison-village'), ('oak-edge', 'oak')]:
            visit(page, view)
            capture(page, name)
        visit(page, 'start')
        before = data(page)
        page.keyboard.down('w')
        try:
            for i in range(3):
                t = float(data(page)['simulationTime'])
                page.wait_for_function('(t)=>Number(document.querySelector("#world").dataset.simulationTime)>t+.75', arg=t)
                capture(page, 'ordinary-walk-' + str(i + 1))
        finally:
            page.keyboard.up('w')
        r['walk'] = {'before': before, 'after': data(page)}
        for state, view in [('forest', 'comparison-start'), ('coast', 'outlook'), ('detail', None)]:
            if view:
                visit(page, view)
            else:
                page.locator('#study').click()
                page.locator('#new-observation-context').click()
                page.locator('[data-realtime="compact-oystercatcher"]').click()
                page.locator('#behavior-detail').click()
                page.wait_for_function('JSON.parse(document.querySelector("#world").dataset.feedingDetail||"null")!==null')
            page.evaluate('''()=>{window.__v1frames=[];window.__v1metrics=[];window.__v1running=true;
                let previous=performance.now();function tick(t){if(!window.__v1running)return;
                window.__v1frames.push(t-previous);window.__v1metrics.push(JSON.parse(document.querySelector('#world').dataset.renderProfile||'null'));previous=t;requestAnimationFrame(tick)}requestAnimationFrame(tick)}''')
            cpu_before = {x['id']: x for x in system.send('SystemInfo.getProcessInfo')['processInfo']}
            before_metrics = {x['name']: x['value'] for x in cdp.send('Performance.getMetrics')['metrics']}
            before = data(page)
            wall = time.monotonic()
            page.wait_for_timeout(a.seconds * 1000)
            elapsed = time.monotonic() - wall
            frames = sorted(page.evaluate('()=>{window.__v1running=false;return window.__v1frames}'))
            after_metrics = {x['name']: x['value'] for x in cdp.send('Performance.getMetrics')['metrics']}
            after = data(page)
            cpu = [{'id': x['id'], 'type': x['type'], 'cpuSeconds': x['cpuTime'] - cpu_before[x['id']]['cpuTime']}
                   for x in system.send('SystemInfo.getProcessInfo')['processInfo'] if x['id'] in cpu_before]
            row = {'state': state, 'wallSeconds': elapsed, 'frames': frames,
                   'fps': 1000 / statistics.mean(frames), 'frameP95ms': frames[int((len(frames)-1)*.95)],
                   'modelSeconds': float(after['simulationTime'])-float(before['simulationTime']),
                   'before': before, 'after': after, 'processCPU': cpu, 'renderSamples': page.evaluate('()=>window.__v1metrics'),
                   'CDPdurationDeltas': {k: after_metrics[k]-v for k, v in before_metrics.items() if k.endswith('Duration')},
                   'raycastsMeasured': bool(after.get('renderProfile')), 'shadowPassesMeasured': False,
                   'measurementLimits': 'Render samples, when available, record raycast and submission-wall intervals plus shadow-update flags, not GPU shadow timer queries; total calls/triangles include actual detail passes. CDP process CPU is CPU time, not a GPU timer.'}
            r['profiles'].append(row)
            capture(page, 'profile-' + state)
            print(json.dumps({k: row[k] for k in ['state', 'wallSeconds', 'fps', 'frameP95ms', 'modelSeconds']}), flush=True)
        page.set_viewport_size({'width': 600, 'height': 375})
        page.wait_for_timeout(1000)
        r['smallViewport'] = page.locator('#feeding-detail').evaluate('''e=>{
            const rect=e.getBoundingClientRect();return {rect:rect.toJSON(),clientHeight:e.clientHeight,
            scrollHeight:e.scrollHeight,viewport:{width:innerWidth,height:innerHeight},
            buttons:[...document.querySelectorAll('#behavior-controls button')].map(x=>({id:x.id,rect:x.getBoundingClientRect().toJSON()}))}}''')
        r['smallViewport']['panelFits'] = r['smallViewport']['rect']['bottom'] <= 375
        capture(page, 'detail-600x375')
        r['diagnosticComplete'] = True
        assert not r['errors'], r['errors']
    except Exception:
        r['failure'] = traceback.format_exc()
        raise
    finally:
        save()
        ctx.close()
        browser.close()
        server.shutdown()
        server.server_close()
