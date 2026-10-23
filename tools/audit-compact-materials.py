"""Audit freshly printed A4 lesson PDFs; optionally render every page/contact sheet.

Requires Poppler (pdftotext/pdftoppm); contact sheets also require Pillow.
This verifies text/identity/table-header continuity, not classroom usability.
"""
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import unicodedata
import xml.etree.ElementTree as ET


def compact(value):
    return re.sub(r'\s+', '', unicodedata.normalize('NFKC', value)).replace('\u00ad', '')


class DocumentText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.text = []
        self.card = None
        self.headers = []
        self.header = None
        self.card_headers = []
        self.card_header = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.stack.append((tag, attrs))
        if tag == 'article':
            self.card = attrs['data-card']
        if tag == 'thead' and self.stack[-2][1].get('class') == 'card-frame':
            self.card_header = []
        if tag == 'thead' and any('work-table' in a.get('class', '').split() for t, a in self.stack if t == 'table'):
            self.header = {'card': self.card, 'text': []}

    def handle_endtag(self, tag):
        if tag == 'thead' and self.card_header is not None:
            self.card_headers.append(' '.join(self.card_header))
            self.card_header = None
        if tag == 'thead' and self.header:
            self.headers.append({'card': self.header['card'], 'text': ' '.join(self.header['text'])})
            self.header = None
        if tag == 'article':
            self.card = None
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break

    def handle_data(self, value):
        if value.strip() and not any(t in ('style', 'script', 'title') for t, a in self.stack):
            self.text.append({'card': self.card, 'text': value})
            if self.header is not None:
                self.header['text'].append(value)
            if self.card_header is not None:
                self.card_header.append(value)


def audit_document(pdf, html, out, render=False):
    out.mkdir(parents=True, exist_ok=True)
    text_path = out / (pdf.stem + '.txt')
    raw_path = out / (pdf.stem + '-raw.txt')
    bbox_path = out / (pdf.stem + '-bbox.html')
    subprocess.run(['pdftotext', '-layout', str(pdf), str(text_path)], check=True)
    subprocess.run(['pdftotext', '-raw', str(pdf), str(raw_path)], check=True)
    subprocess.run(['pdftotext', '-bbox', str(pdf), str(bbox_path)], check=True)
    pages = [p.strip() for p in text_path.read_text().split('\f') if p.strip()]
    raw_pages = [p.strip() for p in raw_path.read_text().split('\f') if p.strip()]
    source = DocumentText()
    source.feed(html.read_text())
    xml_pages = list(ET.parse(bbox_path).getroot().iter('{http://www.w3.org/1999/xhtml}page'))
    findings = []
    page_info = []
    card_pages = {}
    for index, (text, xml) in enumerate(zip(pages, xml_pages), 1):
        ids = re.findall(r'\b(C\d\d)\s*·\s*Ranger Kompakt', text)
        width, height = float(xml.attrib['width']), float(xml.attrib['height'])
        if abs(width - 595.28) > 1 or abs(height - 841.89) > 1:
            findings.append(f'Page {index}: expected A4, got {width} × {height} pt')
        if index > 1 and len(ids) != 1:
            findings.append(f'Page {index}: expected exactly one repeated card identity, got {ids}')
        for card in ids:
            card_pages.setdefault(card, []).append(index)
        if 'Leistungsnachweis:' in text and 'Grenze:' not in text:
            findings.append(f'Page {index}: assessment detached from its limit/source block')
        words = list(xml.iter('{http://www.w3.org/1999/xhtml}word'))
        clipped = [w.text for w in words if float(w.attrib['xMin']) < 40 or float(w.attrib['xMax']) > width - 40 or float(w.attrib['yMin']) < 40 or float(w.attrib['yMax']) > height - 40]
        if clipped:
            findings.append(f'Page {index}: text outside 15 mm print area (2.5 pt tolerance): {clipped[:6]}')
        page_info.append({'page': index, 'cards': ids, 'characters': len(text), 'lastTextYpt': round(max((float(w.attrib['yMax']) for w in words), default=0), 2)})
    if len(pages) != len(xml_pages) or len(pages) != len(raw_pages):
        findings.append('Text and bounding-box page counts differ (possible blank page)')
    expected_cards = {f'C{i:02}' for i in range(1, 26)}
    if set(card_pages) != expected_cards:
        findings.append(f'Card identities differ: {sorted(set(card_pages) ^ expected_cards)}')
    joined = compact('\n'.join(raw_pages))
    without_repeated_headers = joined
    for header in source.card_headers:
        without_repeated_headers = without_repeated_headers.replace(compact(header), '')
    missing = [item for item in source.text if compact(item['text']) not in joined and compact(item['text']) not in without_repeated_headers]
    if missing:
        findings.append(f'{len(missing)} HTML text fragments missing or interrupted in PDF')
    header_checks = []
    for header in source.headers:
        matches = [i for i in card_pages.get(header['card'], []) if compact(header['text']) in compact(raw_pages[i - 1])]
        header_checks.append({**header, 'pages': matches})
        if len(matches) != 1:
            findings.append(f"{header['card']}: answer table header appears on {matches}; expected one unbroken table")
    if render:
        from PIL import Image, ImageDraw
        images_dir = out / (pdf.stem + '-pages')
        images_dir.mkdir(exist_ok=True)
        subprocess.run(['pdftoppm', '-r', '110', '-png', str(pdf), str(images_dir / 'page')], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        image_paths = sorted(images_dir.glob('page-*.png'), key=lambda p: int(p.stem.split('-')[-1]))
        for start in range(0, len(image_paths), 20):
            batch = image_paths[start:start + 20]
            sheet = Image.new('RGB', (5 * 220, 4 * 335), '#c7cec9')
            draw = ImageDraw.Draw(sheet)
            for offset, path in enumerate(batch):
                tile = Image.open(path).convert('RGB')
                tile.thumbnail((210, 298))
                x, y = (offset % 5) * 220 + 5, (offset // 5) * 335 + 5
                sheet.paste(tile, (x, y))
                info = page_info[start + offset]
                draw.text((x, y + 302), f"p{info['page']:02} {'/'.join(info['cards']) or 'Cover'}", fill='black')
            sheet.save(out / f'{pdf.stem}-contact-{start // 20 + 1:02}.png')
    result = {'pdf': str(pdf.resolve()), 'sha256': hashlib.sha256(pdf.read_bytes()).hexdigest(), 'pageCount': len(pages), 'cardPages': card_pages, 'pages': page_info, 'answerTables': header_checks, 'checkedTextFragments': len(source.text), 'missingTextFragments': missing, 'findings': findings, 'passed': not findings}
    (out / (pdf.stem + '-audit.json')).write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input-dir', type=Path, default=Path('outputs/Ranger-Kompakt-Lernpaket'))
    parser.add_argument('--output-dir', type=Path, default=Path('work/compact-print-audit'))
    parser.add_argument('--contact-sheets', action='store_true')
    parser.add_argument('--allow-findings', action='store_true', help='Record a known failing baseline without exiting nonzero')
    args = parser.parse_args()
    results = [audit_document(args.input_dir / (name + '.pdf'), args.input_dir / (name + '.html'), args.output_dir, args.contact_sheets) for name in ('Arbeitsblaetter', 'Lehrkraefte')]
    print(json.dumps([{'document': Path(r['pdf']).name, 'pages': r['pageCount'], 'passed': r['passed'], 'findings': r['findings']} for r in results], ensure_ascii=False))
    return 0 if args.allow_findings or all(r['passed'] for r in results) else 1


if __name__ == '__main__':
    raise SystemExit(main())
