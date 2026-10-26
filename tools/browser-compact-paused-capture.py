"""Real WebGL regression for discarded idle readback versus paused compositor.
Native public model controls only. Uses the production QA capture function,
not a fake canvas, model clock, render hook or injected observation flag.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from types import SimpleNamespace
from playwright.sync_api import sync_playwright
from PIL import Image
from compact_runtime import audit_standalone
import argparse, ast, base64, hashlib, io, json, shutil, subprocess, traceback

p = argparse.ArgumentParser()
p.add_argument('--output', required=True)
p.add_argument('--require-discarded', action='store_true', help='Reproduce the observed Cloud readback failure explicitly')
a = p.parse_args()
root = Path(__file__).resolve().parents[1]
out = root / a.output
out.mkdir(parents=True, exist_ok=False)
entry = root / 'outputs/Ranger-Kompakt.html'
audit = audit_standalone(root, entry)
driver = root / 'tools/browser-compact-arrival.py'
tree = ast.parse(driver.read_text())
nodes = [node for node in tree.body if (isinstance(node, ast.FunctionDef) and node.name in ('sample', 'sequence_frame')) or (isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'SAMPLE_SCRIPT' for t in node.targets))]
assert len(nodes) == 3
namespace = {'a': SimpleNamespace(detail_realtime=True), 'base64': base64}
exec(compile(ast.Module(body=nodes, type_ignores=[]), str(driver), 'exec'), namespace)
sample, sequence_frame = namespace['sample'], namespace['sequence_frame']
r = {'passed': False, 'sourceCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(), 'htmlAudit': audit, 'driverSHA256': hashlib.sha256(driver.read_bytes()).hexdigest(), 'scope': __doc__, 'errors': []}

class H(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(H, directory=str(entry.parent)))
Thread(target=server.serve_forever, daemon=True).start()
with sync_playwright() as pw:
    b = pw.chromium.launch(headless=True, executable_path=shutil.which('chromium'), args=['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    page = b.new_page(viewport={'width': 1200, 'height': 750})
    page.set_default_timeout(60000)
    page.on('pageerror', lambda e: r['errors'].append(str(e)))
    try:
        page.goto(f'http://127.0.0.1:{server.server_port}/Ranger-Kompakt.html')
        page.wait_for_selector('#world[data-ready=true]', timeout=120000)
        page.locator('#start').click()
        page.locator('#menu-button').click()
        page.get_by_text('Referenzabschnitt prüfen', exact=True).click()
        page.locator('[data-view="outlook"]').click()
        page.locator('#study').click()
        page.locator('#new-observation-context').click()
        page.locator('[data-behavior="compact-oystercatcher"]').click()
        page.locator('#behavior-detail').click()
        page.locator('#behavior-step-size').select_option('0.1')
        for i in range(40):
            page.locator('#behavior-step').click()
            page.wait_for_function('document.querySelector("#world").dataset.renderRevision===document.querySelector("#world").dataset.sceneRevision')
            before = sample(page)
            actor = next(x for x in before['actors'] if x['id'] == 'compact-oystercatcher')
            if actor['phase'] == 'handling': break
        else: raise AssertionError('No actual concrete handling phase')
        assert not before['realtime'] and before['ownSeconds'] == 0
        page.wait_for_timeout(300)
        discarded = page.locator('#world').evaluate('c=>new Promise(resolve=>requestAnimationFrame(()=>resolve(c.toDataURL("image/png"))))')
        old = base64.b64decode(discarded.split(',', 1)[1])
        (out / 'idle-direct-readback.png').write_bytes(old)
        r['directReadbackExtrema'] = Image.open(io.BytesIO(old)).convert('RGB').getextrema()
        r['discardedReadbackReproduced'] = all(hi == 0 for lo, hi in r['directReadbackExtrema'])
        if a.require_discarded: assert r['discardedReadbackReproduced'], 'Requested old failure was not reproduced'
        captured = sequence_frame(page, actor['id'], set(), actor['targetId'])
        frame = captured.pop('frameCapture')
        raw = base64.b64decode(frame.pop('png').split(',', 1)[1])
        extrema = Image.open(io.BytesIO(raw)).convert('RGB').getextrema()
        assert max(hi - lo for lo, hi in extrema) > 8, 'Paused render proof must contain actual scene pixels'
        assert 'composited' in frame['method']
        for key in ('time', 'runId', 'observer', 'actors', 'events', 'ecology', 'mode', 'realtime'):
            assert frame['after'][key] == captured[key] == before[key], key
        assert not r['errors'] and captured['ownSeconds'] == 0
        (out / 'paused-composited-phase.png').write_bytes(raw)
        r.update(passed=True, preserveDrawingBuffer=page.evaluate('document.querySelector("#world").getContext("webgl2").getContextAttributes().preserveDrawingBuffer'), sample=captured, capture=frame, actualImageSHA256=hashlib.sha256(raw).hexdigest(), compositedExtrema=extrema)
    except Exception:
        r['failure'] = traceback.format_exc()
        raise
    finally:
        (out / 'result.json').write_text(json.dumps(r, indent=2) + '\n')
        b.close()
        server.shutdown()
        server.server_close()
print(json.dumps({'passed': r['passed'], 'discardedReadbackReproduced': r['discardedReadbackReproduced']}))
