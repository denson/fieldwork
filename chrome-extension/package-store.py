"""Create a flat Chrome Web Store ZIP and an identical unpacked runtime."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import zipfile

parser=argparse.ArgumentParser()
parser.add_argument('output',type=Path)
parser.add_argument('--node',default=shutil.which('node'))
args=parser.parse_args()
if not args.node:
    parser.error('Node.js is required; provide --node PATH')
source=Path(__file__).resolve().parent
version=json.loads((source/'manifest.json').read_text())['version']
output=args.output.resolve()
runtime=output/'unpacked'
subprocess.run([args.node,str(source/'store-build.cjs'),str(runtime)],check=True)
archive=output/f'fieldwork-companion-{version}-store.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(runtime.rglob('*')):
        if p.is_file():
            z.write(p,p.relative_to(runtime).as_posix())
with zipfile.ZipFile(archive) as z:
    assert 'manifest.json' in z.namelist()
    assert z.testzip() is None
    for p in runtime.rglob('*'):
        if p.is_file():
            assert p.read_bytes()==z.read(p.relative_to(runtime).as_posix())
digest=hashlib.sha256(archive.read_bytes()).hexdigest()
(output/'package-sha256.txt').write_text(f'{digest}  {archive.name}\n',encoding='utf-8')
print(f'Validated root manifest and ZIP contents: {archive}')
print(f'SHA-256: {digest}')
