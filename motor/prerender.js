// Desenha todas as peças publicáveis pelo Windsor e grava em <repo>/arte/ID/,
// com arte/manifesto.json {ID: {selo, urls, tipo}}.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const REPO = process.argv[2] || require('path').resolve(__dirname, '..');
const BASE = 'https://raw.githubusercontent.com/leandrogussonalmeida-dotcom/nilo-capital-fotos/main/';
const PUB = new Set(['F61','F62','F63','F64','F65','F66','F67','C23','F68','F69','F70','C24']);
function selo(f) {
  const s = JSON.stringify({ t: f.tipo, d: f.data, h: f.hora, s: f.slides, l: f.legenda, ht: f.hashtags, a: f.alt, sr: f.serie });
  let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36) + '.' + s.length.toString(36);
}
(async () => {
  const fichas = JSON.parse(fs.readFileSync('fichas.json', 'utf8')).filter(f => !PUB.has(f.id) && (['feed', 'carrossel'].includes(f.tipo) || (f.tipo === 'story' && !String(f.figurinha || '').trim())));
  const only = process.argv[3] ? process.argv[3].split(',') : null;
  const b = await chromium.launch(); const pg = await b.newPage();
  await pg.goto('http://localhost:8765/teste.html');
  await pg.addStyleTag({ content: fs.readFileSync('fontes.css', 'utf8') });
  const manP = path.join(REPO, 'arte', 'manifesto.json');
  const man = fs.existsSync(manP) ? JSON.parse(fs.readFileSync(manP, 'utf8')) : {};
  for (const f of fichas) {
    if (only && !only.includes(f.id)) continue;
    const dir = path.join(REPO, 'arte', f.id); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const sl = selo(f), urls = [];
    for (let i = 0; i < f.slides.length; i++) {
      const r = await pg.evaluate(async ({ f, i }) => {
        const c = document.createElement('canvas');
        const fis = await NiloArte.render(c, f.slides[i], { tipo: f.tipo, serie: f.serie, pagina: i, paginas: f.slides.length, fotos: x => 'fotos/' + x + '.jpg' });
        return { fis, url: c.toDataURL('image/jpeg', 0.92) };
      }, { f, i });
      if (r.fis.some(x => x.nivel === 'bloqueia')) { console.log('BLOQUEIO', f.id, i + 1); }
      const nome = `${f.id}_${String(i + 1).padStart(2, '0')}_${sl.split('.')[0]}.jpg`;
      fs.writeFileSync(path.join(dir, nome), Buffer.from(r.url.split(',')[1], 'base64'));
      urls.push(BASE + `arte/${f.id}/${nome}`);
    }
    man[f.id] = { selo: sl, tipo: f.tipo, urls };
  }
  fs.writeFileSync(manP, JSON.stringify(man, null, 1));
  console.log('peças', Object.keys(man).length);
  await b.close();
})();
