import json,urllib.request,hashlib,concurrent.futures
from pathlib import Path
root=Path(__file__).resolve().parents[1]
config=json.loads((root/'docs/pulse-config.json').read_text())['productMedia']['rive']['assetsMap']
(root/'public/assets/rive').mkdir(exist_ok=True)
def get(item):
 name,value=item
 ext='.ttf' if value.get('isFont') else '.webp'
 path=root/'public/assets/rive'/f'{name}{ext}'
 if not path.exists():
  with urllib.request.urlopen(value['url'],timeout=40) as response: data=response.read()
  path.write_bytes(data)
 else:data=path.read_bytes()
 return {'id':name,'section':'sidekick','role':'rive dependency','sourceUrl':value['url'],'path':f'/assets/rive/{name}{ext}','bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'status':'downloaded','rights':'Shopify reference asset; research use, publication rights not established'}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: records=list(pool.map(get,config.items()))
(root/'docs/rive-assets-manifest.json').write_text(json.dumps(records,indent=2)+'\n')
print(f'{len(records)} Rive dependencies saved')
print((root/'public/assets/rive/inter.ttf').read_bytes()[:12])
