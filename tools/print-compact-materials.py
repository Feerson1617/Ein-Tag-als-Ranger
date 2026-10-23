"""Build, print and audit local A4 worksheets; no external assets or publication."""
import argparse
from datetime import datetime, timezone
from functools import partial
import hashlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import shutil
import subprocess
import sys
from threading import Thread
import zipfile

from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--audit-dir', type=Path, default=root / 'work/compact-print-audit')
parser.add_argument('--contact-sheets', action='store_true', help='Also render every page and contact sheets for visual review')
args = parser.parse_args()
args.audit_dir = args.audit_dir.resolve()
subprocess.run(['node', str(root / 'tools/build-compact-materials.mjs')], cwd=root, check=True)
out = root / 'outputs/Ranger-Kompakt-Lernpaket'


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(out)))
Thread(target=server.serve_forever, daemon=True).start()
origin = f'http://127.0.0.1:{server.server_port}/'
print_checks = {}
try:
    with sync_playwright() as pw:
        options = {'headless': True}
        if shutil.which('chromium'):
            options.update(executable_path=shutil.which('chromium'), args=['--no-sandbox'])
        browser = pw.chromium.launch(**options)
        browser_version = browser.version
        for name in ('Arbeitsblaetter', 'Lehrkraefte'):
            page = browser.new_page(viewport={'width': 680, 'height': 1009})
            requests = []
            page.on('request', lambda request: requests.append(request.url))
            page.goto(origin + name + '.html')
            page.emulate_media(media='print')
            assert page.locator('article').count() == 25
            assert all(url.startswith(origin) for url in requests), 'External material request'
            metrics = page.evaluate('''() => ({
              answerTables:document.querySelectorAll('.work-table').length,
              answerRows:document.querySelectorAll('.work-table tbody tr').length,
              minimumAnswerRowPx:Math.min(...[...document.querySelectorAll('.work-table td')].map(e=>e.getBoundingClientRect().height)),
              writingFields:document.querySelectorAll('.writing').length,
              minimumWritingHeightPx:Math.min(...[...document.querySelectorAll('.writing')].map(e=>e.getBoundingClientRect().height)),
              minimumSourceFontPx:Math.min(...[...document.querySelectorAll('.sources')].map(e=>parseFloat(getComputedStyle(e).fontSize)))
            })''')
            # Preserve the original 32px content + 14px padding + 1px border rows,
            # and the original 100px writing area + 1px border in printed sheets.
            assert metrics['minimumAnswerRowPx'] >= 46.9, metrics
            assert metrics['minimumWritingHeightPx'] >= 100.9, metrics
            assert metrics['minimumSourceFontPx'] >= 12, metrics
            print_checks[name] = metrics
            page.pdf(path=str(out / (name + '.pdf')), format='A4', print_background=True,
                     prefer_css_page_size=True, margin={edge: '15mm' for edge in ('top', 'bottom', 'left', 'right')})
            page.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()

audit_command = [sys.executable, str(root / 'tools/audit-compact-materials.py'), '--input-dir', str(out), '--output-dir', str(args.audit_dir)]
if args.contact_sheets:
    audit_command.append('--contact-sheets')
subprocess.run(audit_command, cwd=root, check=True)
info = json.loads((out / 'build-info.json').read_text())
info['sourceCommit'] = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
info['sourceDirty'] = bool(subprocess.check_output(['git', 'status', '--porcelain'], cwd=root, text=True).strip())
info['print'] = {'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'browserVersion': browser_version,
                 'paper': 'A4', 'marginMM': 15, 'scale': 1, 'layoutChecks': print_checks, 'audits': {}}
for name in ('Arbeitsblaetter', 'Lehrkraefte'):
    data = (out / (name + '.pdf')).read_bytes()
    info['files'][name + '.pdf'] = {'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
    audit = json.loads((args.audit_dir / (name + '-audit.json')).read_text())
    info['print']['audits'][name] = {'passed': audit['passed'], 'pages': audit['pageCount'],
                                    'checkedTextFragments': audit['checkedTextFragments'], 'sha256': audit['sha256']}
(out / 'build-info.json').write_text(json.dumps(info, ensure_ascii=False, indent=2) + '\n')
with zipfile.ZipFile(root / 'outputs/Ranger-Kompakt-Lernpaket.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(out.iterdir()):
        archive.write(path, path.name)
print(json.dumps({'htmlDocuments': 2, 'pdfDocuments': 2, 'cardsPerDocument': 25, 'output': str(out), 'audit': str(args.audit_dir)}))
