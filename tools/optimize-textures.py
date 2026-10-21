"""Lossless re-encoding only: verify every decoded RGBA pixel before using a WebP texture."""
from pathlib import Path
from PIL import Image, ImageChops
import json
root=Path(__file__).resolve().parents[1]
assets=root/'evolutionswald/dist/assets'
if not assets.exists():assets=root/'dist/assets'
(root/'work').mkdir(exist_ok=True)
names=['foliage-atlas','botanical-atlas','habitat-surfaces','bark-atlas','terrain-atlas','boardwalk-wood','sky-panorama','wildlife-surfaces']
results=[]
for name in names:
    original=assets/(name+'.png'); output=assets/(name+'.webp')
    with Image.open(original) as image:
        rgba=image.convert('RGBA')
        rgba.save(output,'WEBP',lossless=True,quality=100,method=6,exact=True)
        with Image.open(output) as encoded:
            assert encoded.size==rgba.size and all(channel.getbbox() is None for channel in ImageChops.difference(rgba,encoded.convert('RGBA')).split()),name
    results.append({'name':name,'originalBytes':original.stat().st_size,'webBytes':output.stat().st_size,'identicalPixels':True})
(root/'work/texture-compression-v018.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps({'textures':len(results),'before':sum(r['originalBytes'] for r in results),'after':sum(r['webBytes'] for r in results),'identicalPixels':True}))
