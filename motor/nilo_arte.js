/* Nilo Capital · motor de arte (v1)
 *
 * Desenha uma peça a partir da ficha, sem Canva e sem imagem gerada.
 * Entra: canvas, slide, contexto { tipo, serie, pagina, paginas, fotos }.
 * Sai: lista de apontamentos do diagramador (o que não coube, palavra
 * pendurada, corpo abaixo do mínimo), para o verificador da página.
 *
 * Linguagem da marca: Red Hat Display, títulos com o ponto dourado no fim,
 * rótulo de série com ponto, paleta noite, floresta, creme e ouro. O círculo
 * dourado da Nilo aparece só onde é assinatura (capa de carrossel, capa de
 * destaque, story de abertura). Sem degradê, sombra, grão ou ícone de enfeite.
 */
const NiloArte = (() => {
  const F = 'NiloRH';
  const COR = {
    noite: '#05120C', floresta: '#0B3E26', creme: '#F3EEE2', papel: '#E6DFCD',
    tinta: '#0A1F14', ouro: '#C7A763', ouroTexto: '#7E6226', alerta: '#E4572E', alertaClaro: '#F08A6C'
  };
  const FUNDOS = {
    creme:    { bg: COR.creme,    tx: COR.tinta, apoio: '#3B4B41', fio: 'rgba(10,31,20,.18)', acento: COR.floresta, rot: COR.ouroTexto, ponto: COR.ouro, escuro: false, logo: COR.floresta },
    papel:    { bg: COR.papel,    tx: COR.tinta, apoio: '#38483E', fio: 'rgba(10,31,20,.2)',  acento: COR.floresta, rot: COR.ouroTexto, ponto: COR.ouro, escuro: false, logo: COR.floresta },
    floresta: { bg: COR.floresta, tx: COR.creme, apoio: '#CBD5CE', fio: 'rgba(199,167,99,.45)', acento: COR.ouro, rot: COR.ouro, ponto: COR.ouro, escuro: true, logo: COR.creme },
    noite:    { bg: COR.noite,    tx: COR.creme, apoio: '#C2CCC5', fio: 'rgba(199,167,99,.4)',  acento: COR.ouro, rot: COR.ouro, ponto: COR.ouro, escuro: true, logo: COR.creme },
    ouro:     { bg: COR.ouro,     tx: COR.noite, apoio: '#2B2A1C', fio: 'rgba(5,18,12,.3)',    acento: COR.noite, rot: COR.noite, ponto: COR.noite, escuro: false, logo: COR.noite }
  };
  /* logo oficial (wordmark) desenhado em vetor: nítido em qualquer tamanho */
  const LOGO = {
    vb: [170.11, 97.427, 489.933, 231.251],
    corpo: [
      'M339.28 235.03c-12.68 0-23.57-5.64-31.04-14.4l-1.15-1.45-68.690-80.080c-5.51-6.420-10.790-13.020-16.170-19.550-5.240-6.370-13.180-10.430-22.070-10.430-7.530 0-14.262 3.049-19.480 7.680-7.496 6.652-9.039 11.216-9.100 26.050v156.620c0 15.790 12.800 28.590 28.590 28.590s28.590-12.800 28.590-28.590v-83.310l85.990 101.120c2.020 2.380 4.360 4.330 6.900 5.860a28.420 28.420 0 0 0 15.190 4.370c15.790 0 28.590-12.800 28.590-28.590v-73.430c-7.410 5.930-16.700 9.540-26.150 9.540Z',
      'M421.93 97.78c13.2 0 23.89 10.7 23.89 23.89v182.202c0 13.2-10.7 23.89-23.89 23.89-13.2 0-23.890-10.7-23.890-23.890V121.67c-.01-13.2 10.69-23.89 23.890-23.890Z',
      'M477.98 242.66c0-49.62 38.29-84.85 90.66-84.85 52.38 0 90.36 35.23 90.36 84.85s-37.98 84.85-90.36 84.85c-52.37 0-90.660-35.23-90.660-84.85zm132.63 0c0-28.49-18.07-45.64-41.96-45.64s-42.27 17.15-42.27 45.640 18.380 45.640 42.270 45.640c23.880 0 41.960-17.150 41.960-45.640z'
    ],
    ponto: 'M368.9 168.16c0 17.933-14.537 32.47-32.47 32.47s-32.47-14.537-32.47-32.470 14.537-32.470 32.470-32.470 32.470 14.537 32.470 32.470z'
  };
  let caminhos = null;
  function paths() {
    if (!caminhos) caminhos = { corpo: LOGO.corpo.map(d => new Path2D(d)), ponto: new Path2D(LOGO.ponto) };
    return caminhos;
  }
  /* wordmark inteiro ou só o monograma (o N com o ponto) */
  function logo(x, X, Y, largura, cor, corPonto, monograma) {
    const p = paths();
    const [vx, vy, vw, vh] = monograma ? [170.11, 97.427, 200, 231.251] : LOGO.vb;
    const s = largura / vw;
    x.save(); x.translate(X - vx * s, Y - vy * s); x.scale(s, s);
    x.fillStyle = cor;
    (monograma ? [p.corpo[0]] : p.corpo).forEach(c => x.fill(c));
    x.fillStyle = corPonto; x.fill(p.ponto);
    x.restore();
    return vh * s;
  }

  const CURTAS = new Set(['a', 'o', 'e', 'é', 'à', 'as', 'os', 'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 'um', 'uma', 'ao', 'aos', 'se', 'ou', 'por', 'que', 'sem', 'com', 'para', 'pra', 'seu', 'sua', 'seus', 'suas', 'não', 'já', 'só', 'mas', 'nem', 'pelo', 'pela', 'te', 'me', 'lhe', 'até', 'r$', 'mais', 'é', 'cada', 'quem']);
  const COLA = ' ';
  const imagens = new Map();
  function carregar(uri) {
    if (!imagens.has(uri)) imagens.set(uri, new Promise((ok, erro) => {
      const im = new Image(); im.onload = () => ok(im); im.onerror = () => erro(Error('Imagem não carregou')); im.src = uri;
    }));
    return imagens.get(uri);
  }

  async function render(canvas, s, ctx = {}) {
    const tipo = ctx.tipo || 'feed';
    const vert = ['story', 'status', 'destaque'].includes(tipo);
    const W = 1080, H = vert ? 1920 : 1350;
    canvas.width = W; canvas.height = H;
    const x = canvas.getContext('2d');
    if (document.fonts) await Promise.all([400, 500, 600, 700, 800].map(w => document.fonts.load(`${w} 40px ${F}`)));
    const fiscal = [];
    const P = FUNDOS[s.fundo] || FUNDOS.creme;
    const M = 96;
    const pagina = Number(ctx.pagina || 0), paginas = Number(ctx.paginas || 1);
    const carrossel = tipo === 'carrossel';
    const papel = s.papel || null;
    const alertaMode = s.modo === 'alerta';
    const corAlerta = P.escuro ? COR.alertaClaro : COR.alerta;

    x.fillStyle = P.bg; x.fillRect(0, 0, W, H);
    x.textBaseline = 'alphabetic';

    /* ------------------------------------------------ tipografia ---- */
    const fonte = (px, peso, esp = 0) => { x.font = `${peso} ${px}px ${F}, "Red Hat Display", sans-serif`; try { x.letterSpacing = esp + 'px'; } catch (e) {} };
    const larg = (t, px, peso, esp = 0) => { fonte(px, peso, esp); return x.measureText(String(t).split(COLA).join(' ')).width; };
    function gulosa(pal, w, px, peso, esp) {
      const out = []; let l = '';
      for (const p of pal) { const t = l ? l + ' ' + p : p; if (l && larg(t, px, peso, esp) > w) { out.push(l); l = p; } else l = t; }
      if (l) out.push(l);
      return out;
    }
    /* quebra de diagramador: título com bandeira equilibrada e palavra curta
       colada na seguinte; corpo sem viúva */
    function quebrar(texto, w, px, peso, titulo, esp = 0) {
      const linhas = [];
      for (const par of String(texto || '').replace(/\((\d{2})\) (?=\d)/g, '($1)' + COLA).split('\n')) {
        let pal = par.split(/[ \t]+/).filter(Boolean);
        if (!pal.length) continue;
        /* número e unidade não se separam */
        for (let i = pal.length - 2; i >= 0; i--)
          if (/^[\d.,]+%?$/.test(pal[i]) && /^(mil|milhões|milhão|bi|bilhões|meses|anos|dias|horas|ao|a\.m\.|a\.a\.)$/.test(pal[i + 1]) && larg(pal[i] + ' ' + pal[i + 1], px, peso, esp) <= w * 0.9) pal.splice(i, 2, pal[i] + COLA + pal[i + 1]);
        for (let i = pal.length - 2; i >= 0; i--)
          if (CURTAS.has(pal[i].toLowerCase().replace(/[“"(]/g, '')) && larg(pal[i] + ' ' + pal[i + 1], px, peso, esp) <= w * (titulo ? 1 : 0.9)) pal.splice(i, 2, pal[i] + COLA + pal[i + 1]);
        if (titulo && pal.length > 2) {
          /* título: quebra ótima. Custo = sobra ao quadrado nas linhas, com
             multa alta para linha terminada em palavra curta e para linha
             a mais que a gulosa */
          const n0 = gulosa(pal, w, px, peso, esp).length;
          const N = pal.length, best = new Array(N + 1).fill(null);
          best[0] = { c: 0, prev: -1, n: 0 };
          for (let j = 1; j <= N; j++) for (let i = j - 1; i >= 0; i--) {
            const linha = pal.slice(i, j).join(' '), lw = larg(linha, px, peso, esp);
            if (lw > w) break;
            if (!best[i]) continue;
            const ult = pal[j - 1].split(COLA).pop().toLowerCase().replace(/[“"(]/g, '');
            const ultima = j === N;
            let c = ultima ? (lw < w * 0.28 && i > 0 ? 1.5 : 0) : Math.pow((w - lw) / w, 2) + (lw < w * 0.42 ? 2 : 0);
            if (!ultima && CURTAS.has(ult)) c += 4;
            c += 0.6;
            const tot = best[i].c + c;
            if (!best[j] || tot < best[j].c) best[j] = { c: tot, prev: i, n: best[i].n + 1 };
          }
          if (best[N] && best[N].n <= n0 + 1) {
            const out = []; let j = N;
            while (j > 0) { const i = best[j].prev; out.unshift(pal.slice(i, j).join(' ')); j = i; }
            linhas.push(...out.map(l => l.split(COLA).join(' ')));
            continue;
          }
        }
        let ls = gulosa(pal, w, px, peso, esp);
        const n = ls.length, viuva = n > 1 && !/[\s ]/.test(ls[n - 1]) && ls[n - 1].length < 9;
        if (n > 1 && (titulo || viuva)) {
          let lo = w * 0.5, hi = w;
          for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (gulosa(pal, m, px, peso, esp).length > n) lo = m; else hi = m; }
          ls = gulosa(pal, hi, px, peso, esp);
        }
        linhas.push(...ls.map(l => l.split(COLA).join(' ')));
      }
      return linhas;
    }
    function escrever(linhas, px, peso, cor, x0, y0, lh, esp = 0, alinhar = 'left') {
      fonte(px, peso, esp); x.fillStyle = cor; x.textAlign = alinhar;
      linhas.forEach((l, i) => {
        const y = y0 + px * 0.8 + i * lh;
        x.fillText(l, x0, y);
        const lw = x.measureText(l).width, xa = alinhar === 'center' ? x0 - lw / 2 : alinhar === 'right' ? x0 - lw : x0;
        if (xa < 48 || xa + lw > W - 48) fiscal.push({ nivel: 'bloqueia', regra: 'arte.fora', msg: 'Texto passa da margem: ' + l.slice(0, 40) });
      });
      x.textAlign = 'left'; try { x.letterSpacing = '0px'; } catch (e) {}
      return linhas.length * lh;
    }
    /* ponto dourado da marca no fim do título, na linha de base */
    function pontoFinal(linha, px, peso, x0, yBase, esp, cor) {
      const t = linha.replace(/[.\s]+$/, '');
      if (/[?:!”"]$/.test(t)) return;
      const w = larg(t, px, peso, esp);
      const r = Math.max(6, px * 0.085);
      x.fillStyle = cor || P.ponto; x.beginPath(); x.arc(x0 + w + r * 1.25, yBase - r, r, 0, Math.PI * 2); x.fill();
    }
    const limpaTitulo = t => String(t || '').trim().replace(/\.$/, '');

    /* --------------------------------------------- capa de destaque -- */
    if (s.modo === 'capa' && tipo === 'destaque') {
      x.fillStyle = COR.noite; x.fillRect(0, 0, W, H);
      const cy = 900, r = 330;
      x.fillStyle = COR.floresta; x.beginPath(); x.arc(W / 2, cy, r, 0, Math.PI * 2); x.fill();
      x.strokeStyle = COR.ouro; x.lineWidth = 5; x.beginPath(); x.arc(W / 2, cy, r - 26, 0, Math.PI * 2); x.stroke();
      const lw = 150; logo(x, W / 2 - lw / 2, cy - 190, lw, COR.creme, COR.ouro, true);
      let px = 74; const t = limpaTitulo(s.titulo);
      while (larg(t, px, 700) > 2 * r - 150 && px > 44) px -= 2;
      escrever([t], px, 700, COR.creme, W / 2, cy + 40, px * 1.1, -0.5, 'center');
      return fiscal;
    }

    /* ---------------------------------------------- cabeçalho -------- */
    const topo = vert ? 220 : 88;
    const rodape = vert ? 1640 : 1250;
    const lwLogo = vert ? 150 : 132;
    const hLogo = logo(x, W - M - lwLogo, topo - 6, lwLogo, P.logo, P.ponto, false);
    const rot = String(s.rotulo || ctx.serie || 'Nilo Capital').toUpperCase();
    fonte(24, 700, 3); x.fillStyle = P.rot;
    x.beginPath(); x.arc(M + 7, topo + 22, 7, 0, Math.PI * 2); x.fillStyle = alertaMode ? corAlerta : P.ponto; x.fill();
    x.fillStyle = alertaMode ? corAlerta : P.rot; x.fillText(rot, M + 28, topo + 31);
    try { x.letterSpacing = '0px'; } catch (e) {}
    if (carrossel && paginas > 1) {
      fonte(24, 600, 2); x.fillStyle = P.apoio;
      x.fillText(String(pagina + 1).padStart(2, '0') + ' / ' + String(paginas).padStart(2, '0'), M + 28, topo + 70);
      try { x.letterSpacing = '0px'; } catch (e) {}
      /* fio de continuidade: entra pela esquerda e sai pela direita na mesma
         altura em todos os slides; termina no ponto dourado no último */
      const yf = topo + 112;
      x.strokeStyle = COR.ouro; x.lineWidth = 3;
      x.beginPath(); x.moveTo(pagina > 0 ? 0 : M, yf); x.lineTo(pagina < paginas - 1 ? W : W - M - 20, yf); x.stroke();
      if (pagina === paginas - 1) { x.fillStyle = COR.ouro; x.beginPath(); x.arc(W - M - 10, yf, 10, 0, Math.PI * 2); x.fill(); }
    }

    /* ---------------------------------------------- rodapé ----------- */
    function desenharRodape() {
      x.strokeStyle = P.fio; x.lineWidth = 2;
      x.beginPath(); x.moveTo(M, rodape); x.lineTo(W - M, rodape); x.stroke();
      fonte(26, 600, 0.5); x.fillStyle = P.apoio;
      x.fillText('@nilocapital', M, rodape + 50);
      const dir = vert ? '(19) 97166-6974' : 'nilo.capital';
      if (!(carrossel && pagina < paginas - 1)) { fonte(26, 600, 0.5); x.textAlign = 'right'; x.fillText(dir, W - M, rodape + 50); x.textAlign = 'left'; }
      try { x.letterSpacing = '0px'; } catch (e) {}
      if (carrossel && pagina < paginas - 1) {
        const ax = W - M, ay = rodape + 41;
        x.strokeStyle = P.ponto === COR.noite ? COR.noite : COR.ouro; x.lineWidth = 4; x.lineCap = 'round';
        x.beginPath(); x.moveTo(ax - 60, ay); x.lineTo(ax, ay); x.moveTo(ax - 17, ay - 15); x.lineTo(ax, ay); x.lineTo(ax - 17, ay + 15); x.stroke();
        x.lineCap = 'butt';
      }
    }

    /* ------------------------------------------- área do conteúdo ---- */
    const y0 = topo + (carrossel && paginas > 1 ? 168 : vert ? 150 : 130);
    const y1 = rodape - (s.fonte ? 92 : 56);
    const area = y1 - y0;
    const comCirculo = (carrossel && papel === 'capa') || (vert && (s.modo || 'leitura') === 'frase' && s.circulo !== false);
    const cw = W - 2 * M - (comCirculo ? 210 : 0);
    let modo = s.modo || 'leitura';
    const itens = (s.itens || []).filter(i => i && (typeof i === 'string' ? i.trim() : (i.rotulo || i.valor)));
    const linhasConta = (s.linhas || []).filter(l => l && (l.rotulo || l.valor));
    if (modo === 'escolha' && itens.length !== 2) modo = itens.length ? 'lista' : 'leitura';
    if (modo === 'etapas' && itens.length < 2) modo = 'leitura';
    if (modo === 'conta' && !linhasConta.length) modo = 'leitura';
    const ehCapaCarrossel = carrossel && papel === 'capa';
    const ehFecho = carrossel && papel === 'fecho';

    /* o círculo dourado: assinatura da Nilo na capa do carrossel e no story
       de abertura. Fica atrás de tudo, cortado pela borda. */
    if (comCirculo) {
      x.fillStyle = COR.ouro; x.beginPath();
      if (vert) x.arc(W + 170, 1180, 360, 0, Math.PI * 2); else x.arc(W + 165, 760, 330, 0, Math.PI * 2);
      x.fill();
    }

    const B = [];
    const tituloTxt = limpaTitulo(s.titulo);
    const pesoT = 700;
    const baseT = modo === 'dado' ? 64 : vert ? 96 : modo === 'frase' || ehCapaCarrossel || ehFecho ? 92 : 76;
    const tMax = vert ? 156 : modo === 'frase' || ehCapaCarrossel || ehFecho ? 134 : 120;
    const tpx = k => Math.min(tMax, Math.round(baseT * k));
    const tLinhas = k => quebrar(tituloTxt, cw, tpx(k), pesoT, true, -1.5);
    if (modo !== 'dado' && tituloTxt) B.push({
      nome: 'titulo',
      alt: k => tLinhas(k).length * Math.round(tpx(k) * 1.06),
      linhas: k => tLinhas(k).length,
      cabe: k => tLinhas(k).every(l => larg(l, tpx(k), pesoT, -1.5) + tpx(k) * 0.3 <= cw + 1),
      pendurada: k => { const ls = tLinhas(k); return ls.slice(0, -1).reduce((a, l) => a + (CURTAS.has(l.split(' ').pop().toLowerCase()) ? 2 : 0) + (larg(l, tpx(k), pesoT, -1.5) < cw * 0.42 ? 1 : 0), 0); },
      draw: (y, k) => {
        const px = tpx(k), ls = tLinhas(k), lh = Math.round(px * 1.06);
        escrever(ls, px, pesoT, alertaMode && !P.escuro ? COR.tinta : P.tx, M, y, lh, -1.5);
        pontoFinal(ls[ls.length - 1], px, pesoT, M, y + px * 0.8 + (ls.length - 1) * lh, -1.5, alertaMode ? corAlerta : P.ponto);
        return ls.length * lh;
      }
    });

    /* número em destaque */
    if (modo === 'dado') {
      const cifra = String(s.cifra || '').trim();
      const cor = (s.alerta || ctx.serie === 'Dívida cara') && P.escuro ? COR.alertaClaro : P.escuro ? COR.ouro : COR.floresta;
      const npx = k => { let px = Math.round(230 * k); while (px > 90 && larg(cifra, px, 800, -6) > cw) px -= 4; return px; };
      B.push({
        nome: 'cifra', alt: k => Math.round(npx(k) * 0.92) + (s.unidade ? Math.round(npx(k) * 0.3) + 18 : 0),
        linhas: () => 1, cabe: k => larg(cifra, npx(k), 800, -6) <= cw, pendurada: () => false,
        draw: (y, k) => {
          const px = npx(k);
          fonte(px, 800, -6); x.fillStyle = cor; x.fillText(cifra, M - px * 0.04, y + px * 0.76);
          try { x.letterSpacing = '0px'; } catch (e) {}
          let h = Math.round(px * 0.92);
          if (s.unidade) { const upx = Math.round(Math.max(44, px * 0.27)); escrever([s.unidade], upx, 500, P.tx, M, y + h + 6, upx * 1.1); h += upx + 18; }
          return h;
        }
      });
      if (tituloTxt) B.push({
        nome: 'titulo2', gap: k => Math.round(40 * k),
        alt: k => quebrar(tituloTxt, cw, Math.round(56 * Math.min(k, 1.25)), 700, true, -1).length * Math.round(56 * Math.min(k, 1.25) * 1.1),
        draw: (y, k) => {
          const px = Math.round(56 * Math.min(k, 1.25)), ls = quebrar(tituloTxt, cw, px, 700, true, -1), lh = Math.round(px * 1.1);
          escrever(ls, px, 700, P.tx, M, y, lh, -1);
          pontoFinal(ls[ls.length - 1], px, 700, M, y + px * 0.8 + (ls.length - 1) * lh, -1);
          return ls.length * lh;
        }
      });
    }

    const cpx = k => vert ? Math.min(58, Math.max(48, Math.round(46 * k))) : Math.min(modo === 'frase' ? 50 : 48, Math.max(38, Math.round((modo === 'frase' ? 44 : 41) * k)));
    if (s.corpo && modo !== 'contato') B.push({
      nome: 'corpo', gap: k => Math.round((modo === 'frase' ? 52 : 36) * k),
      alt: k => quebrar(s.corpo, modo === 'alerta' ? cw - 44 : cw, cpx(k), 500, false).length * Math.round(cpx(k) * 1.36) + (modo === 'frase' ? 40 : 0),
      draw: (y, k) => {
        const px = cpx(k);
        if (modo === 'frase') {
          x.fillStyle = COR.ouro; x.fillRect(M, y, 96, 6);
          return escrever(quebrar(s.corpo, cw, px, 500, false), px, 500, P.apoio, M, y + 40, Math.round(px * 1.36)) + 40;
        }
        if (modo === 'alerta') {
          const ls = quebrar(s.corpo, cw - 44, px, 500, false), h = ls.length * Math.round(px * 1.36);
          x.fillStyle = corAlerta; x.fillRect(M, y + 6, 6, h - 12);
          return escrever(ls, px, 500, P.tx, M + 44, y, Math.round(px * 1.36));
        }
        return escrever(quebrar(s.corpo, cw, px, 500, false), px, 500, P.apoio, M, y, Math.round(px * 1.36));
      }
    });

    /* duas opções lado a lado */
    if (modo === 'escolha') {
      const gw = 28, bw = (cw - gw) / 2, pad = 34;
      const ops = itens.map(i => typeof i === 'string' ? { rotulo: '', valor: i } : i);
      const vpx = k => { let px = Math.min(64, Math.round(54 * k)); const maior = ops.flatMap(o => String(o.valor).split(/\s+/)).sort((a, b) => larg(b, 60, 700) - larg(a, 60, 700))[0] || ''; while (px > 34 && larg(maior, px, 700, -1) > bw - 2 * pad) px -= 1; return px; };
      const rpx = 28;
      const altO = k => Math.max(...ops.map(o => quebrar(o.rotulo || '', bw - 2 * pad, rpx, 600, false).length * 36 + quebrar(o.valor, bw - 2 * pad, vpx(k), 700, true, -1).length * Math.round(vpx(k) * 1.1))) + 2 * pad + 24;
      B.push({
        nome: 'escolha', base: true, gap: k => Math.round(52 * k), alt: altO,
        draw: (y, k) => {
          const h = altO(k), px = vpx(k);
          ops.forEach((o, i) => {
            const bx = M + i * (bw + gw);
            const destaque = i === 1;
            const fundoCaixa = destaque ? (P.escuro ? COR.ouro : COR.floresta) : (P.escuro ? 'rgba(243,238,226,.08)' : 'rgba(10,31,20,.06)');
            x.fillStyle = fundoCaixa; x.beginPath(); x.roundRect ? x.roundRect(bx, y, bw, h, 18) : x.rect(bx, y, bw, h); x.fill();
            const corTx = destaque ? (P.escuro ? COR.noite : COR.creme) : P.tx;
            const corRot = destaque ? (P.escuro ? '#3A3220' : '#CBD5CE') : P.apoio;
            let yy = y + pad;
            yy += escrever(quebrar(o.rotulo || '', bw - 2 * pad, rpx, 600, false), rpx, 600, corRot, bx + pad, yy, 36) + 24;
            const alertaValor = !destaque && s.alerta;
            escrever(quebrar(o.valor, bw - 2 * pad, px, 700, true, -1), px, 700, alertaValor ? corAlerta : corTx, bx + pad, yy, Math.round(px * 1.1), -1);
          });
          return h;
        }
      });
    }
    /* simulação em linhas: valor à direita em peso forte, rótulo ocupa o resto */
    if (modo === 'conta') {
      const rpx = k => vert ? Math.min(56, Math.max(48, Math.round(46 * k))) : Math.min(44, Math.max(36, Math.round(40 * k)));
      const lh = k => Math.round(rpx(k) * 1.3);
      const vpx = (k, i) => rpx(k) + (i === linhasConta.length - 1 && linhasConta.length > 2 ? 6 : 2);
      const rw = (l, k, i) => Math.max(cw * 0.36, cw - larg(String(l.valor || ''), vpx(k, i), 700, -0.5) - 40);
      const linhaAlt = (l, k, i) => Math.max(quebrar(l.rotulo, rw(l, k, i), rpx(k), 500, false).length, 1) * lh(k) + Math.round(36 * k);
      const alt = k => linhasConta.reduce((a, l, i) => a + linhaAlt(l, k, i), 0) + 4;
      B.push({
        nome: 'conta', base: true, gap: k => Math.round(52 * k), alt,
        draw: (y, k) => {
          let yy = y; const px = rpx(k);
          x.strokeStyle = P.fio; x.lineWidth = 2; x.beginPath(); x.moveTo(M, yy); x.lineTo(M + cw, yy); x.stroke();
          linhasConta.forEach((l, i) => {
            const h = linhaAlt(l, k, i), vp = vpx(k, i);
            escrever(quebrar(l.rotulo, rw(l, k, i), px, 500, false), px, 500, P.apoio, M, yy + Math.round(18 * k), lh(k));
            fonte(vp, 700, -0.5); x.fillStyle = l.alerta ? corAlerta : P.tx; x.textAlign = 'right';
            x.fillText(String(l.valor || ''), M + cw, yy + Math.round(18 * k) + vp * 0.8); x.textAlign = 'left';
            try { x.letterSpacing = '0px'; } catch (e) {}
            if (larg(String(l.valor || ''), vp, 700, -0.5) > cw * 0.6) fiscal.push({ nivel: 'revisa', regra: 'arte.valor_longo', msg: 'Valor longo na conta: ' + l.valor });
            yy += h;
            x.strokeStyle = P.fio; x.beginPath(); x.moveTo(M, yy); x.lineTo(M + cw, yy); x.stroke();
          });
          return yy - y;
        }
      });
    }
    /* lista para conferir */
    if ((modo === 'lista' || modo === 'leitura' || modo === 'alerta') && itens.length) {
      const ipx = k => vert ? Math.min(56, Math.max(48, Math.round(46 * k))) : Math.min(48, Math.max(38, Math.round(42 * k)));
      const txt = i => typeof i === 'string' ? i : [i.rotulo, i.valor].filter(Boolean).join(': ');
      const recuo = 74;
      const altI = k => itens.reduce((a, t) => a + quebrar(txt(t), cw - recuo, ipx(k), 600, false).length * Math.round(ipx(k) * 1.24) + Math.round(30 * k), 0) - Math.round(30 * k);
      B.push({
        nome: 'itens', base: modo === 'lista', gap: k => Math.round(48 * k), alt: altI,
        draw: (y, k) => {
          let yy = y; const px = ipx(k);
          itens.forEach((t, i) => {
            if (modo === 'leitura') { fonte(px, 800); x.fillStyle = P.escuro ? COR.ouro : COR.ouroTexto; x.fillText(String(i + 1).padStart(2, '0'), M, yy + px * 0.8); }
            else if (modo === 'alerta') { x.strokeStyle = corAlerta; x.lineWidth = 5; const c = yy + px * 0.5; x.beginPath(); x.moveTo(M + 6, c - 12); x.lineTo(M + 30, c + 12); x.moveTo(M + 30, c - 12); x.lineTo(M + 6, c + 12); x.stroke(); }
            else { x.strokeStyle = P.escuro ? COR.ouro : COR.floresta; x.lineWidth = 4; x.beginPath(); x.arc(M + 18, yy + px * 0.48, 16, 0, Math.PI * 2); x.stroke(); }
            yy += escrever(quebrar(txt(t), cw - recuo, px, 600, false), px, 600, P.tx, M + recuo, yy, Math.round(px * 1.24)) + Math.round(30 * k);
          });
          return yy - y - Math.round(30 * k);
        }
      });
    }
    /* etapas em ordem */
    if (modo === 'etapas') {
      const ipx = k => vert ? Math.min(56, Math.max(48, Math.round(46 * k))) : Math.min(48, Math.max(38, Math.round(42 * k)));
      const txt = i => typeof i === 'string' ? i : [i.rotulo, i.valor].filter(Boolean).join(': ');
      const passo = (t, k) => Math.max(64, quebrar(txt(t), cw - 112, ipx(k), 600, false).length * Math.round(ipx(k) * 1.24)) + Math.round(38 * k);
      const alt = k => itens.reduce((a, t) => a + passo(t, k), 0) - Math.round(38 * k);
      B.push({
        nome: 'etapas', base: true, gap: k => Math.round(52 * k), alt,
        draw: (y, k) => {
          let yy = y; const px = ipx(k), cx = M + 28, marcos = [];
          for (const t of itens) { marcos.push(yy); yy += passo(t, k); }
          x.strokeStyle = COR.ouro; x.lineWidth = 4; x.beginPath(); x.moveTo(cx, marcos[0] + 28); x.lineTo(cx, marcos[marcos.length - 1] + 28); x.stroke();
          itens.forEach((t, i) => {
            x.fillStyle = P.bg; x.strokeStyle = COR.ouro; x.lineWidth = 4; x.beginPath(); x.arc(cx, marcos[i] + 28, 26, 0, Math.PI * 2); x.fill(); x.stroke();
            fonte(26, 800); x.fillStyle = P.escuro ? COR.ouro : COR.ouroTexto; x.textAlign = 'center'; x.fillText(String(i + 1), cx, marcos[i] + 37); x.textAlign = 'left';
            escrever(quebrar(txt(t), cw - 112, px, 600, false), px, 600, P.tx, M + 112, marcos[i], Math.round(px * 1.24));
          });
          return yy - y - Math.round(38 * k);
        }
      });
    }
    /* cartão de contato (story e status) */
    if (modo === 'contato') {
      const ls = String(s.corpo || '').split('\n').filter(Boolean);
      const px = k => Math.min(58, Math.max(vert ? 48 : 40, Math.round(48 * k)));
      B.push({
        nome: 'contato', base: true, gap: k => Math.round(60 * k),
        alt: k => ls.reduce((a, l) => a + quebrar(l, cw, px(k), 600, false).length, 0) * Math.round(px(k) * 1.34) + 46,
        draw: (y, k) => {
          x.fillStyle = COR.ouro; x.fillRect(M, y, 96, 6);
          const todas = ls.flatMap(l => quebrar(l, cw, px(k), 600, false));
          return escrever(todas, px(k), 600, P.tx, M, y + 46, Math.round(px(k) * 1.34)) + 46;
        }
      });
    }
    /* foto: janela redonda (assinatura da Nilo), em duas cores da marca */
    let foto = null;
    const fotoUri = s.foto && ctx.fotos ? ctx.fotos(s.foto) : null;
    if (fotoUri) { try { foto = await carregar(fotoUri); } catch (e) { fiscal.push({ nivel: 'revisa', regra: 'arte.foto', msg: 'A foto não carregou.' }); } }
    const quadro = s.fotoForma !== 'janela';
    if (foto) B.push({
      nome: 'foto', base: true, flex: true, gap: k => Math.round(48 * k), alt: () => quadro ? (vert ? 640 : 400) : (vert ? 520 : 300),
      draw: (y, k, h) => { if (quadro) moldura(foto, y, h); else janela(foto, y, h); if (h < (vert ? 560 : 360)) fiscal.push({ nivel: 'revisa', regra: 'arte.foto_pequena', msg: 'A foto ficou baixa. Encurte o texto ou tire a foto.' }); return h; }
    });

    /* escala: a maior que cabe, entre 1 e o teto do formato */
    const altura = k => B.reduce((a, b, i) => a + b.alt(k) + (i ? (b.gap ? b.gap(k) : 0) : 0), 0);
    let k = vert ? 1.7 : B.some(b => b.base) ? 1.5 : 1.85;
    const maxLinhas = ehCapaCarrossel || modo === 'frase' ? 5 : 4;
    const B0 = B[0] || { linhas: () => 1, cabe: () => true, pendurada: () => false };
    const ruim = kk => altura(kk) > area || (B0.linhas && B0.linhas(kk) > maxLinhas) || (B0.cabe && !B0.cabe(kk));
    const desce = kk => Math.round((kk - 0.02) * 100) / 100;
    while (k > 0.86 && ruim(k)) k = desce(k);
    const kMax = k;
    if (B0.pendurada && B0.pendurada(k)) {
      let melhor = k, nota = B0.pendurada(k);
      for (let kk = desce(k); kk >= Math.max(0.74, kMax * 0.6); kk = desce(kk)) {
        if (ruim(kk)) continue;
        const n = B0.pendurada(kk);
        if (n < nota) { nota = n; melhor = kk; }
        if (!n) break;
      }
      k = melhor;
    }
    if (altura(k) > area) fiscal.push({ nivel: 'bloqueia', regra: 'arte.nao_cabe', msg: 'O texto não cabe na peça. Encurte o título ou o corpo.' });
    if (B0.pendurada && B0.pendurada(k)) fiscal.push({ nivel: 'revisa', regra: 'arte.pendurada', msg: 'Linha do título termina em palavra curta.' });
    if (k < 0.96 && !foto) fiscal.push({ nivel: 'revisa', regra: 'arte.apertada', msg: 'Texto longo para o formato: o corpo ficou no tamanho mínimo.' });

    /* composição: título no alto; o bloco de base assenta no pé quando sobra
       espaço, e o vazio vira respiro entre os dois */
    /* sem bloco de base, o corpo assenta no pé: título no alto, texto no
       pé, como página de revista; capa e frase ficam centradas na altura */
    if (!vert && !B.some(b => b.base) && !(ehCapaCarrossel || modo === 'frase' || ehFecho)) {
      const ic = B.findIndex(b => b.nome === 'corpo' || b.nome === 'itens');
      if (ic > 0) B[ic].base = true;
    }
    const sobra = area - altura(k);
    let y = y0;
    if (!B.some(b => b.base) && sobra > 0) y += Math.round(sobra * (vert ? 0.4 : ehCapaCarrossel || modo === 'frase' ? 0.55 : 0.18));
    const iBase = B.findIndex(b => b.base);
    B.forEach((b, i) => {
      if (i && b.gap) y += b.gap(k);
      if (i === iBase && sobra > 60) {
        if (b.flex) { const h = b.alt(k) + sobra; b.draw(y, k, h); y += h; return; }
        y += sobra;
      }
      y += b.draw(y, k, b.alt(k));
    });

    if (s.fonte) {
      fonte(24, 500); x.fillStyle = P.apoio;
      const fl = quebrar('Fonte: ' + String(s.fonte).replace(/^fonte:\s*/i, ''), cw, 24, 500, false);
      fl.slice(0, 2).forEach((l, i) => x.fillText(l, M, rodape - 34 - (fl.length > 1 ? (1 - i) * 30 : 0)));
    }
    desenharRodape();

    /* foto em quadro: largura do texto, canto quase reto, tratamento leve
       (um pouco menos saturada e mais quente) para conversar com a paleta;
       em duas cores quando a ficha pede */
    function tratar(im, w, h) {
      const c = document.createElement('canvas'); c.width = Math.round(w); c.height = Math.round(h);
      const cc = c.getContext('2d');
      const z = Math.max(w / im.width, h / im.height) * (Number(s.fotoZoom) || 1);
      const px = (Number(s.fotoX ?? 50)) / 100, py = (Number(s.fotoY ?? 50)) / 100;
      cc.imageSmoothingQuality = 'high';
      cc.drawImage(im, (w - im.width * z) * px, (h - im.height * z) * py, im.width * z, im.height * z);
      const img = cc.getImageData(0, 0, c.width, c.height), p = img.data;
      const hex = hh => [1, 3, 5].map(i => parseInt(hh.slice(i, i + 2), 16));
      if (s.fotoTom === 'duotom') {
        const [a0, a1, a2] = hex(COR.noite), [b0, b1, b2] = hex(COR.creme);
        for (let i = 0; i < p.length; i += 4) {
          let l = (0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2]) / 255;
          l = Math.min(1, Math.max(0, (l - 0.08) / 0.84));
          p[i] = a0 + (b0 - a0) * l; p[i + 1] = a1 + (b1 - a1) * l; p[i + 2] = a2 + (b2 - a2) * l;
        }
      } else {
        for (let i = 0; i < p.length; i += 4) {
          const l = 0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2];
          p[i] = Math.min(255, (p[i] * 0.84 + l * 0.16) * 1.015 + 2);
          p[i + 1] = p[i + 1] * 0.84 + l * 0.16;
          p[i + 2] = Math.max(0, (p[i + 2] * 0.84 + l * 0.16) * 0.97 - 2);
        }
      }
      cc.putImageData(img, 0, 0);
      return c;
    }
    function moldura(im, by, bh) {
      const c = tratar(im, cw, bh);
      x.save(); x.beginPath(); x.roundRect ? x.roundRect(M, by, cw, bh, 6) : x.rect(M, by, cw, bh); x.clip(); x.drawImage(c, M, by); x.restore();
      if (im.naturalWidth < cw * 0.9) fiscal.push({ nivel: 'revisa', regra: 'arte.foto_resolucao', msg: 'A foto tem resolução baixa para o tamanho em que aparece.' });
    }
    function janela(im, by, bh) {
      const d = Math.min(cw, bh), cx = M + d / 2, cy = by + bh / 2;
      const c = document.createElement('canvas'); c.width = c.height = Math.round(d);
      const cc = c.getContext('2d');
      const z = Math.max(d / im.width, d / im.height) * (Number(s.fotoZoom) || 1);
      const px = (Number(s.fotoX ?? 50)) / 100, py = (Number(s.fotoY ?? 50)) / 100;
      cc.drawImage(im, (d - im.width * z) * px, (d - im.height * z) * py, im.width * z, im.height * z);
      if (s.fotoTom !== 'natural') {
        const img = cc.getImageData(0, 0, c.width, c.height), p = img.data;
        const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
        const [a0, a1, a2] = hex(COR.noite), [b0, b1, b2] = hex(COR.creme);
        for (let i = 0; i < p.length; i += 4) {
          let l = (0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2]) / 255;
          l = Math.min(1, Math.max(0, (l - 0.08) / 0.84));
          p[i] = a0 + (b0 - a0) * l; p[i + 1] = a1 + (b1 - a1) * l; p[i + 2] = a2 + (b2 - a2) * l;
        }
        cc.putImageData(img, 0, 0);
      }
      x.save(); x.beginPath(); x.arc(cx, cy, d / 2, 0, Math.PI * 2); x.clip(); x.drawImage(c, M, cy - d / 2); x.restore();
      x.strokeStyle = COR.ouro; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, d / 2 + 14, 0, Math.PI * 2); x.stroke();
    }

    return fiscal;
  }

  return { render, FUNDOS, COR, logo, versao: 1 };
})();
if (typeof window !== 'undefined') window.NiloArte = NiloArte;
