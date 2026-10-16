"""Baixa as fotos do manifesto (Unsplash e Pexels, licenças gratuitas) para originais/."""
import json, os, urllib.request
os.makedirs('originais', exist_ok=True)
man = json.load(open('manifesto.json'))
rel = []
for f in man:
    dst = f"originais/{f['nome']}.jpg"
    try:
        req = urllib.request.Request(f['url'], headers={'User-Agent': 'Mozilla/5.0 (nilo-capital-fotos)'})
        b = urllib.request.urlopen(req, timeout=60).read()
        if b[:2] != b'\xff\xd8':
            raise ValueError('não é JPEG')
        open(dst, 'wb').write(b)
        rel.append({'nome': f['nome'], 'ok': True, 'bytes': len(b)})
    except Exception as e:
        rel.append({'nome': f['nome'], 'ok': False, 'erro': str(e)})
json.dump(rel, open('relatorio_download.json', 'w'), ensure_ascii=False, indent=1)
print(sum(r['ok'] for r in rel), 'de', len(rel))
