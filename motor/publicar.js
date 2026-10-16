// Prepara a publicação de peças aprovadas no Estúdio Nilo Capital.
// Uso: node publicar.js F71,C21   (com o servidor local na porta 8765)
// Lê a ficha do acervo e, se houver, a versão editada salva no banco
// (dbdump/pecas/ID.json). Só segue se a aprovação tiver o mesmo selo da
// versão atual. Desenha com o mesmo motor do estúdio e grava as imagens
// em nilo-capital-fotos/publicadas/ID/ junto com o pedido.json.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const REPO = require('path').resolve(__dirname, '..');
const BASE = 'https://raw.githubusercontent.com/leandrogussonalmeida-dotcom/nilo-capital-fotos/main/';
function selo(f) {
  const s = JSON.stringify({ t: f.tipo, d: f.data, h: f.hora, s: f.slides, l: f.legenda, ht: f.hashtags, a: f.alt, sr: f.serie });
  let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36) + '.' + s.length.toString(36);
}
(async () => {
  const ids = (process.argv[2] || '').split(',').filter(Boolean);
  const forcarTeste = process.argv.includes('--sem-aprovacao');
  const acervo = Object.fromEntries(JSON.parse(fs.readFileSync('fichas.json', 'utf8')).map(f => [f.id, f]));
  const b = await chromium.launch(); const pg = await b.newPage();
  await pg.goto('http://localhost:8765/teste.html');
  await pg.addStyleTag({ content: fs.readFileSync('fontes.css', 'utf8') });
  const saida = [];
  for (const id of ids) {
    const docp = `dbdump/pecas/${id}.json`;
    const doc = fs.existsSync(docp) ? JSON.parse(fs.readFileSync(docp, 'utf8')) : {};
    const dados = doc.data || doc;
    const f = dados.ficha || acervo[id];
    if (!f) { saida.push({ id, erro: 'ficha não encontrada' }); continue; }
    if (dados.publicacao && dados.publicacao.status === 'publicada') { saida.push({ id, erro: 'já publicada' }); continue; }
    const sl = selo(f);
    if (!forcarTeste && (!dados.aprovacao || dados.aprovacao.selo !== sl)) { saida.push({ id, erro: 'sem aprovação desta versão', selo: sl }); continue; }
    const dir = path.join(REPO, 'publicadas', id); fs.mkdirSync(dir, { recursive: true });
    const urls = [];
    for (let i = 0; i < f.slides.length; i++) {
      const r = await pg.evaluate(async ({ f, i }) => {
        const c = document.createElement('canvas');
        const fis = await NiloArte.render(c, f.slides[i], { tipo: f.tipo, serie: f.serie, pagina: i, paginas: f.slides.length, fotos: x => 'fotos/' + x + '.jpg' });
        return { fis, url: c.toDataURL('image/jpeg', 0.93), w: c.width, h: c.height };
      }, { f, i });
      if (r.fis.some(x => x.nivel === 'bloqueia')) { saida.push({ id, erro: 'motor bloqueou', fis: r.fis }); continue; }
      const nome = `${id}_${String(i + 1).padStart(2, '0')}.jpg`;
      const buf = Buffer.from(r.url.split(',')[1], 'base64');
      if (buf.length > 8e6) throw new Error('imagem acima de 8 MB');
      fs.writeFileSync(path.join(dir, nome), buf);
      urls.push(BASE + `publicadas/${id}/${nome}`);
    }
    const legenda = [f.legenda, f.hashtags].filter(Boolean).join('\n\n');
    const acao = f.tipo === 'carrossel' ? 'create_carousel_post' : f.tipo === 'story' ? 'create_story' : 'create_image_post';
    const params = acao === 'create_carousel_post' ? { image_urls: urls, caption: legenda } : acao === 'create_story' ? { image_url: urls[0] } : { image_url: urls[0], caption: legenda };
    const pedido = { id, tipo: f.tipo, selo: sl, conta: '17841457798912539', acao, params, preparado_em: new Date().toISOString() };
    fs.writeFileSync(path.join(dir, 'pedido.json'), JSON.stringify(pedido, null, 1));
    saida.push({ id, acao, imagens: urls.length, selo: sl });
  }
  console.log(JSON.stringify(saida, null, 1));
  await b.close();
})();
