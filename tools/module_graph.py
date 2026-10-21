"""Local module/media closure shared by both release formats.

Static/side-effect imports, re-exports, literal import(), Worker strings and
new URL(..., import.meta.url) are supported. Nonliteral import() is rejected.
Ordinary ./assets strings in this runtime are document-relative; new URL is
module-relative. A missing file or path escaping dist fails before packaging.
"""
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import unquote
import re

@dataclass(frozen=True)
class Reference:
    start:int
    end:int
    target:str
    mode:str

class ModuleGraph:
    def __init__(self,source,entry='expedition.js'):
        self.source=Path(source).resolve();self.modules=[];self.assets=set();self.references={}
        self._visiting=set();self._visited=set();self.visit(entry)

    def resolve(self,module,ref,document=False):
        ref=unquote(re.split(r'[?#]',ref,1)[0])
        path=(self.source/(Path() if document else Path(module).parent)/ref).resolve()
        if not path.is_relative_to(self.source):raise ValueError(f'Reference escapes dist: {module} → {ref}')
        if not path.is_file():raise FileNotFoundError(f'Missing reference: {module} → {ref}')
        return path.relative_to(self.source).as_posix()

    def scan(self,name,text):
        refs={}
        def add(pattern,mode,document=False,only_missing=False):
            for m in re.finditer(pattern,text):
                span=m.span(2)
                if only_missing and span in refs:continue
                refs[span]=Reference(*span,self.resolve(name,m[2],document),mode)
        add(r'\b(?:from\s*|import\s*(?!\())([\'"])(\.{1,2}/[^\'"\n]+)\1','module')
        dynamic=r'\bimport\s*\(\s*([\'"])(\.{1,2}/[^\'"\n]+)\1\s*\)'
        if len(re.findall(r'\bimport\s*\(',text))!=len(list(re.finditer(dynamic,text))):raise ValueError('Nonliteral/unsupported dynamic import: '+name)
        add(dynamic,'module')
        add(r'new\s+(?:Shared)?Worker\s*\(\s*([\'"])(\.{1,2}/[^\'"\n]+)\1','worker',document=True)
        add(r'new\s+URL\s*\(\s*([\'"])(\.{1,2}/[^\'"\n]+)\1\s*,\s*import\.meta\.url','url')
        add(r'([\'"])(\.{1,2}/assets/[^\'"\s]+)\1','document',document=True,only_missing=True)
        return sorted(refs.values(),key=lambda r:r.start)

    def visit(self,name):
        if name in self._visited:return
        if name in self._visiting:raise ValueError('Circular graph unsupported by standalone packaging: '+name)
        self._visiting.add(name);text=(self.source/name).read_text()
        self.references[name]=self.scan(name,text)
        for ref in self.references[name]:
            if Path(ref.target).suffix in {'.js','.mjs'}:self.visit(ref.target)
            else:self.assets.add(ref.target)
        self._visiting.remove(name);self._visited.add(name);self.modules.append(name)

    def rewrite(self,name,replace):
        text=(self.source/name).read_text()
        for ref in reversed(self.references[name]):text=text[:ref.start]+replace(ref)+text[ref.end:]
        return text
