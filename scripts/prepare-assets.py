"""Fetch only the approved Hero/Sidekick reference assets; record format and hash."""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import struct
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'shopify-winter2026-research/evidence/page-data.json'
data = json.loads(SOURCE.read_text())['loaderData']['routes/($locale).editions.winter2026']
items = []
for name, scene in [('hero', data['hero']), ('sidekick', data['collections'][0])]:
    for key, suffix in [('backgroundAnimation','theatre.json'), ('fallbackImage','desktop.jpg'), ('fallbackImageMobile','mobile.jpg'), ('fallbackImageOptimized','desktop.ktx2'), ('fallbackImageMobileOptimized','mobile.ktx2')]:
        if scene.get(key): items.append((name + '-' + suffix, scene[key]['url'], name, key))
    for asset in scene['backgroundAssets']:
        suffix = 'model.glb' if '.glb' in asset['url'] else 'background.ktx2'
        items.append((name+'-'+suffix, asset['url'], name, 'backgroundAssets'))

sidekick = data['collections'][0]
pulse = sidekick['xxlCollections'][1]['products'][0]
(ROOT/'docs/pulse-config.json').write_text(json.dumps(pulse,ensure_ascii=False,indent=2))
def walk(x):
    if isinstance(x,dict):
        for k,v in x.items():
            if k=='url' and isinstance(v,str):yield v
            else:yield from walk(v)
    elif isinstance(x,list):
        for v in x:yield from walk(v)
for url in walk(pulse):
    if '.riv' in url: items.append(('pulse.riv',url,'paper','rive'))
    elif 'Poster' in url or 'poster' in url:
        kind='mobile' if 'mobile' in url.lower() else 'desktop'
        items.append(('pulse-'+kind+'.webp',url,'paper','poster'))
intro=sidekick['xxlCollections'][0]['products'][0]['productMedia']
items.append(('sidekick-video-poster.png',intro['image']['url'],'sidekick','video-poster'))
video=next(x for x in intro['video']['sources'] if x.get('height')==720)
items.append(('sidekick-intro.mp4',video['url'],'sidekick','video'))
for name, file in [('neue-montreal','3ee238256136fcfdfca35decbd44d0d4'),('hw-cigars','49a57a6e59f6a50f0627418abeb58fec'),('imperial-script','389d4f8566b3b9cbe083b682c7fabf06')]:
    items.append((name+'.woff2','https://cdn.shopify.com/b/shopify-brochure2-assets/'+file+'.woff2','all','font'))
items.append(('mud-normal.webp',data['globalContent']['backgroundAssets'][0]['url'],'transition','normal'))

def fetch(item):
    name,url,section,role=item
    p=ROOT/'public/assets'/name
    raw=p.read_bytes() if p.exists() else urllib.request.urlopen(url,timeout=90).read()
    p.write_bytes(raw)
    record={'id':name,'section':section,'role':role,'sourceUrl':url,'path':'/assets/'+name,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'status':'downloaded','rights':'Shopify reference asset; research use, publication rights not established'}
    if name.endswith('.glb'):
        assert raw[:4]==b'glTF'
        length,kind=struct.unpack_from('<II',raw,12)
        gltf=json.loads(raw[20:20+length])
        (ROOT/'docs'/name.replace('.glb','-structure.json')).write_text(json.dumps(gltf,indent=2))
        record.update(status='GLB header and JSON parsed',nodes=len(gltf.get('nodes',[])),extensions=gltf.get('extensionsUsed',[]))
    elif name.endswith('.json'):
        state=json.loads(raw);record.update(status='JSON parsed',keys=list(state.keys()))
    elif name.endswith('.ktx2'):
        assert raw[:12]==b'\xabKTX 20\xbb\r\n\x1a\n';record['status']='KTX2 signature verified'
    elif name.endswith('.woff2'):
        assert raw[:4]==b'wOF2';record['status']='WOFF2 signature verified'
    elif name.endswith('.riv'):
        assert raw[:4]==b'RIVE';record['status']='RIVE signature verified; runtime check pending'
    return record

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    result=list(pool.map(fetch,list(dict((x[0],x) for x in items).values())))
(ROOT/'docs/assets-manifest.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps([{'id':x['id'],'bytes':x['bytes'],'status':x['status']} for x in result],indent=2))
