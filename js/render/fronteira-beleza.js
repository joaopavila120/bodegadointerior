// A Fronteira mais viva. O chão é pintado uma vez nos blocos guardados de frontier-environment.js; os enfeites dos
// pátios entram na fila de profundidade, como as árvores. A Serra e Santa Catarina usam o mesmo chão
// (regional-environment.js), com menos campo seco e, em SC, sem os trilhos de roda nas ruas calçadas.
//   · Campo: manchas grandes de pasto verde e de campo seco, umas touceiras de flores miúdas e pedrinhas.
//   · Estrada de chão: os dois trilhos das rodas e pedriscos.
//   · Pátios: hortênsias e margaridas nos cantos das casas, lenha encostada, vasos nas lojas, varal com roupa e moitas.
//   · Desenhados aqui, com vento: a rede de pesca secando do lado do trapiche, o varal de charque junto da Pecuária, o
//     cata-vento com a caixa d'água no campo do leste, os pelegos na cerca do pouso e os quero-queros no campo.
//   · Das folhas de arte, um de cada pela vila: o poço, o galinheiro, o cocho, o toco com o machado e o forno de barro.
//   · Serra Gaúcha: bandeirolas verde, branco e vermelho atravessando a estrada, o varal da nona, as caixas de uva, as
//     pipas e o carrinho de mão cheio de uva na ponta dos parreirais; o forno de barro, o poço, o espantalho e um canteiro.
//   · Santa Catarina: bandeirolas azul e branco atravessando a rua, bicicletas encostadas, anões de jardim, o varal e a
//     lenha empilhada; um vaso grande, um arbusto florido, um canteiro e o galinheiro.
//   · Ilhas de vegetação pelo campo, poucas e bem separadas: uma moita, um mato ou umas pedras atrás, o capim com pendão
//     do lado e a flor do campo na frente.
// Nada aqui muda colisão, rotas ou pontos de interação: os enfeites só entram onde não atrapalham caminho nem porta.
'use strict';

// Ruído suave (interpolado) pras manchas grandes: duas escalas, pra borda não sair redonda.
function fronteiraField(x, y) {
  const one = (cell, seed) => {
    const gx = Math.floor(x / cell), gy = Math.floor(y / cell), u0 = x / cell - gx, v0 = y / cell - gy;
    const u = u0 * u0 * (3 - 2 * u0), v = v0 * v0 * (3 - 2 * v0), n = (i, j) => frontierNoise(i * 7 + seed, j * 13 + seed * 3);
    const a = n(gx, gy), b = n(gx + 1, gy), c = n(gx, gy + 1), d = n(gx + 1, gy + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  return one(430, 5) * .68 + one(170, 41) * .32;
}
const fronteiraSmooth = (a, b, t) => { const k = Math.max(0, Math.min(1, (t - a) / (b - a))); return k * k * (3 - 2 * k); };

const FRONTEIRA_FLOWERS = ['#f6f1df', '#f3d34c', '#c7a2e0', '#f08e6a', '#ffffff', '#e9c43a'];
function fronteiraFlowerClump(x, y, n) {
  const c = FRONTEIRA_FLOWERS[Math.floor(n * 97) % FRONTEIRA_FLOWERS.length], k = 3 + Math.floor(n * 13) % 5;
  for (let j = 0; j < k; j++) {
    const a = j * 2.4 + n * 11, r = 3 + (j % 3) * 4, fx = Math.round(x + Math.cos(a) * r), fy = Math.round(y + Math.sin(a) * r * .6);
    ctx.fillStyle = '#3e6a2a'; ctx.fillRect(fx, fy + 2, 1, 4);
    ctx.fillStyle = c; ctx.fillRect(fx - 2, fy, 2, 2); ctx.fillRect(fx + 1, fy, 2, 2); ctx.fillRect(fx - 1, fy - 2, 2, 2); ctx.fillRect(fx - 1, fy + 1, 2, 2);
    ctx.fillStyle = j % 2 ? '#e2a62a' : '#fff4bc'; ctx.fillRect(fx - 1, fy, 2, 2);
  }
}
function fronteiraPebble(x, y, s) {
  ctx.fillStyle = 'rgba(30,30,20,.3)'; ctx.fillRect(Math.round(x - s / 2), Math.round(y + 1), Math.round(s) + 1, 2);
  ctx.fillStyle = '#8c8676'; ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), Math.round(s), Math.round(s * .7));
  ctx.fillStyle = '#b4ae9c'; ctx.fillRect(Math.round(x - s / 2 + 1), Math.round(y - s / 2), Math.max(1, Math.round(s * .45)), 1);
}
// Manchas grandes, flores e pedrinhas. Fica dentro do recorte da terra e antes das estradas.
// As cores das manchas em 13 degraus, já prontas (montar a cor a cada célula pesava na hora de pintar os blocos).
const FRONTEIRA_LUSH = Array.from({ length: 13 }, (_, i) => `rgba(118,152,56,${(i / 12 * .2).toFixed(3)})`);
const FRONTEIRA_DRY = Array.from({ length: 13 }, (_, i) => `rgba(196,172,104,${(i / 12 * .22).toFixed(3)})`);
// `dryK` (0 a 1): quanto campo seco o mapa tem. A Fronteira é campo de verdade; a Serra e SC são mais verdes.
function paintFronteiraMeadow(view, dryK = 1) {
  const { x, y, w, h } = view, C = 8;
  // Pasto verde (onde a terra é boa) e campo seco: células de 8 px com um tremido na borda, como pixel pontilhado.
  for (let cy = Math.floor(y / C) * C; cy < y + h; cy += C) for (let cx = Math.floor(x / C) * C; cx < x + w; cx += C) {
    const f = fronteiraField(cx, cy) + (frontierNoise(cx, cy) - .5) * .05;
    if (f > .56) { ctx.fillStyle = FRONTEIRA_LUSH[Math.round(fronteiraSmooth(.56, .74, f) * 12)]; ctx.fillRect(cx, cy, C, C); }
    else if (f < .4 && dryK) { ctx.fillStyle = FRONTEIRA_DRY[Math.round(fronteiraSmooth(.4, .22, f) * 12 * dryK)]; ctx.fillRect(cx, cy, C, C); }
  }
  const T = 30;
  for (let gy = Math.floor(y / T) * T - T; gy < y + h + T; gy += T) for (let gx = Math.floor(x / T) * T - T; gx < x + w + T; gx += T) {
    const n = frontierNoise(gx + 211, gy + 97), px = gx + frontierNoise(gx, gy + 5) * T, py = gy + frontierNoise(gx + 3, gy) * T;
    if (n > .99 - fronteiraSmooth(.5, .7, fronteiraField(px, py)) * .02) fronteiraFlowerClump(px, py, frontierNoise(gx + 5, gy + 9));
    else if (n > .87 && n < .88) fronteiraPebble(px, py, 3 + frontierNoise(gx, gy) * 4);
  }
}

// ---------- A estrada de chão ----------
// Linha deslocada pro lado (normal) ao longo do traçado de um caminho.
function fronteiraOffset(pts, off) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    return [p[0] - dy / L * off, p[1] + dx / L * off];
  });
}
function fronteiraStroke(pts, width, color) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
}
// Pontos a cada `step` px ao longo do traçado.
function fronteiraAlong(pts, step, fn) {
  let carry = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy); if (!L) continue;
    for (let s = carry; s < L; s += step) fn(ax + dx * s / L, ay + dy * s / L, -dy / L, dx / L);
    carry = (carry - L) % step; if (carry < 0) carry += step;
  }
}
function paintFronteiraRoads(view, M = WORLD_MAPS.vila, ruts = true) {
  if (!ruts) return;
  const { x, y, w, h } = view;
  const nets = worldPathNet(M).filter(p => p.kind === 'road' && !(p.box[2] < x - 60 || p.box[0] > x + w + 60 || p.box[3] < y - 60 || p.box[1] > y + h + 60));
  for (const p of nets) {
    const half = p.w / 2;
    // Os dois trilhos das rodas, um pouco mais escuros e lisos.
    for (const side of [-1, 1]) {
      const rut = fronteiraOffset(p.pts, side * half * .4);
      fronteiraStroke(rut, 13, 'rgba(96,66,38,.16)'); fronteiraStroke(rut, 5, 'rgba(70,46,26,.12)');
      fronteiraStroke(fronteiraOffset(p.pts, side * half * .4 + side * 6), 2, 'rgba(214,186,136,.14)');
    }
    fronteiraAlong(p.pts, 15, (px, py, nx, ny) => {
      const n = frontierNoise((px | 0) + 7, (py | 0) + 3); if (n < .55) return;
      const o = (frontierNoise(py | 0, (px | 0) + 1) - .5) * half * 1.7; fronteiraPebble(px + nx * o, py + ny * o, 2 + n * 4);
    });
  }
}

// ---------- Os pátios ----------
// [folha, quadro, largura, altura]: a arte já existe nas folhas de ambiente e de flora. Só duas escalas (1 e .85):
// poucos recortes guardados em fronteiraSprite.
const FRONTEIRA_ART = {
  macega: ['frontier-flora', 1, 92, 83], florido: ['frontier-flora', 4, 104, 75], moitaCampo: ['frontier-flora', 0, 124, 94],
  pedrasCapim: ['frontier-flora', 3, 108, 81], mato: ['frontier-flora', 5, 104, 95],
  hortensia: ['rural-details-v2', 2, 124, 80], margarida: ['rural-details-v2', 0, 130, 74], moita: ['rural-details-v2', 1, 136, 84],
  lenhaBarril: ['rural-details-v2', 4, 126, 86],
  lenha: ['environment-props-v3', 8, 84, 60], vaso: ['environment-props-v3', 10, 50, 58], tina: ['environment-props-v3', 11, 74, 54],
  arbusto: ['environment-props-v3', 1, 92, 78], samambaia: ['environment-props-v3', 2, 104, 70],
  pedra: ['environment-props-v3', 5, 80, 44], caixaUva: ['environment-props-v3', 9, 84, 66], pipas: ['nature', 9, 96, 89],
  poco: ['garden', 0, 120, 153], tocoMachado: ['garden', 11, 92, 87], espantalho: ['garden', 2, 86, 100],
  galinheiro: ['rural', 2, 160, 146], cocho: ['rural', 5, 150, 66], forno: ['rural-workstations-v2', 0, 130, 112],
  canteiro: ['nature', 5, 150, 110], arbustoFlor: ['nature', 8, 110, 89], vasoGrande: ['nature', 15, 70, 76]
};
// As ilhas: [tipo, dx, dy, escala]. A planta maior atrás, o capim com pendão do lado e a flor do campo na frente.
const FRONTEIRA_ILHAS = [
  [['moitaCampo', -42, 0], ['macega', 46, 6, .85], ['florido', 4, 26, .85]],
  [['pedrasCapim', -32, 0], ['macega', 46, -2, .85], ['florido', 2, 26, .85]],
  [['mato', 24, 0], ['macega', -44, 14, .85], ['florido', 62, 22, .85]],
  [['moita', 30, 0, .85], ['florido', -40, 18, .85]]
];
// Os desenhados aqui: [largura, altura do desenho, altura do pé] (o pé é o que precisa de chão livre).
const FRONTEIRA_DRAWN = {
  varal: [210, 150, 150], rede: [170, 112, 112], charque: [190, 140, 140], moinho: [150, 318, 90], pelegos: [150, 112, 60],
  queroquero: [96, 34, 20], bicicleta: [122, 72, 40], gnomos: [110, 68, 40],
  carrinho: [144, 70, 50]
};
// Os desenhos pequenos crescem até a escala do Sadi (a bicicleta, os anões e o carrinho).
const FRONTEIRA_ESCALA = { bicicleta: 1.7, gnomos: 1.6, carrinho: 1.5 };
// Onde cabe um enfeite num mapa: fora das estradas, das portas, das clareiras e dos achados, longe dos troncos, não
// escondido atrás de copa e sem encostar num enfeite já posto.
function fronteiraPlacer(M, extra = {}) {
  const d = worldDressing(M), list = [], id = M.id;
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const blocked = [...d.roads.map(([x, y, w, h]) => ({ x: x - 10, y: y - 10, w: w + 20, h: h + 20 })), ...worldLandmarkClearings(id),
    ...WORLD_DISCOVERIES.filter(q => q.map === id).map(q => ({ x: q.x - 80, y: q.y - 70, w: 160, h: 130 })), ...(extra.blocked || [])];
  const trunks = [...d.props.filter(p => p.sheet === 'nature' && p.index < 3), ...(typeof regionalExtraTrees === 'function' ? regionalExtraTrees(M) : []),
    ...(extra.trunks || []), ...FORAGE.filter(f => f.map === id),
    ...WORLD_DISCOVERIES.filter(q => q.map === id && q.setting === 'tree').map(q => ({ x: q.x, y: q.y - 35, w: 200, h: 255 }))];
  // `top`: a altura do desenho inteiro. Um desenho alto (o cata-vento, os postes das bandeirolas) não pode ter copa de
  // árvore nem casa na frente.
  const fits = (x, y, w, h, top = h) => {
    const foot = { x: x - w / 2, y: y - h * .45, w, h: h * .45 + 6 };
    if (x - w / 2 < 40 || x + w / 2 > M.W - 40) return false;
    if (![x, x - w / 2 + 10, x + w / 2 - 10].every(px => M.canWalk(px, y + 2))) return false;
    if (blocked.some(r => overlap(foot, r))) return false;
    if (trunks.some(t => Math.hypot(t.x - x, (t.y - y) * 1.4) < 60 + w * (extra.wide && w > 150 ? .55 : .3))) return false;
    // Nem atrás de uma copa (a árvore mais embaixo esconderia o enfeite).
    if (trunks.some(t => t.y > y && t.y - y < (t.h || 300) * .85 && Math.abs(t.x - x) < (t.w || 220) * .45 + w * .35)) return false;
    if (top > 170 && trunks.some(t => Math.abs(t.x - x) < (t.w || 220) * .5 + w * .5 && t.y > y - top && t.y - y < (t.h || 300) * .9)) return false;
    if (top > 170 && d.buildings.some(r => overlap({ x: x - w / 2, y: y - top, w, h: top }, { x: r.x, y: r.y + r.h * .5, w: r.w, h: r.h * .5 + 20 }))) return false;
    return !list.some(q => Math.hypot(q.x - x, (q.y - y) * 1.3) < (q.w + w) * .45);
  };
  const put = (kind, x, y, scale = 1, props) => {
    const drawn = FRONTEIRA_DRAWN[kind], a = FRONTEIRA_ART[kind], w = drawn ? drawn[0] : a[2] * scale, h = drawn ? drawn[1] : a[3] * scale;
    if (!fits(x, y, w, drawn ? drawn[2] : h, h)) return false;
    list.push({ kind, x: Math.round(x), y: Math.round(y), w, h, ...props }); return true;
  };
  // O lugar livre mais perto de um ponto, em anéis cada vez maiores.
  const near = (kind, x, y, props) => {
    for (let r = 0; r <= 240; r += 40) for (let a = 0; a < (r ? 8 : 1); a++) if (put(kind, x + Math.cos(a * Math.PI / 4) * r, y + Math.sin(a * Math.PI / 4) * r * .6, 1, props)) return true;
    return false;
  };
  // Uma fieira de bandeirolas por cima da estrada: só os pés dos dois postes precisam de chão livre.
  const garland = (cx, y, span, colors) => {
    for (let dy = 0; dy <= 200; dy += 20) for (const sy of dy ? [1, -1] : [1]) {
      const yy = y + sy * dy;
      if (!fits(cx - span / 2, yy, 18, 24, 190) || !fits(cx + span / 2, yy, 18, 24, 190)) continue;
      list.push({ kind: 'bandeirolas', x: Math.round(cx), y: Math.round(yy), w: span, h: 180, colors }); return true;
    }
    return false;
  };
  // Um lugar no campo aberto, longe das estradas e dos telhados (os quero-queros).
  const field = (kind, n, gap, rnd) => {
    const made = [], roads = worldMainRoads(id);
    for (let k = 0; k < 900 && made.length < n; k++) {
      const x = 400 + rnd() * (M.W - 800), y = 300 + rnd() * (M.H - 600);
      if (made.some(m => Math.hypot(m.x - x, m.y - y) < gap)) continue;
      if (roads.some(([rx, ry, rw, rh]) => overlap({ x: x - 120, y: y - 90, w: 240, h: 180 }, { x: rx, y: ry, w: rw, h: rh }))) continue;
      if (d.buildings.some(r => overlap({ x: x - 60, y: y - 30, w: 120, h: 40 }, { x: r.x - 10, y: r.y - 10, w: r.w + 20, h: r.h + 30 }))) continue;
      if (put(kind, x, y)) made.push({ x, y });
    }
  };
  return { d, list, overlap, fits, put, near, garland, field, trunks };
}
let fronteiraPatios = null;
function fronteiraPatioList() {
  if (fronteiraPatios) return fronteiraPatios;
  const M = WORLD_MAPS.vila, P = fronteiraPlacer(M, {
    blocked: [VILA.horta, VILA.fogo, { ...VILA.marco, x: VILA.marco.x - 50, w: VILA.marco.w + 100, h: VILA.marco.h + 60 }],
    trunks: VILA_TREES.map(([x, y]) => ({ x, y }))
  });
  const { d, list, overlap, fits, put, near, trunks } = P;
  // Os varais: do lado da casa do Mano Lima, na beira do rio, e na frente da casa do Baitaca.
  const casa = id => VILA.houses.find(r => r.id === id), lima = casa('manolima'), baitaca = casa('baitaca');
  put('varal', lima.x - 130, lima.y + lima.h + 25); put('varal', baitaca.x + 150, baitaca.y + baitaca.h + 95);
  // A rede de pesca do lado do trapiche, o charque secando junto da Pecuária e o cata-vento no campo do leste.
  near('rede', 700, 1035); near('charque', VILA.gado.x + VILA.gado.w + 140, VILA.gado.y + VILA.gado.h - 10); near('moinho', 4030, 1470) || near('moinho', 2560, 1770) || near('moinho', 3700, 1460);
  // As casas: flor nos dois cantos da frente e lenha encostada num lado.
  VILA.houses.forEach((r, i) => {
    const b = r.y + r.h + 16, flor = i % 2 ? ['margarida', 'hortensia'] : ['hortensia', 'margarida'];
    put(flor[0], r.x + 58, b); put(flor[1], r.x + r.w - 58, b);
    const side = i % 2 ? -1 : 1, wall = side > 0 ? r.x + r.w + 52 : r.x - 52;
    put(i % 3 ? 'lenha' : 'lenhaBarril', wall, r.y + r.h - 18) || put('tina', wall, r.y + r.h - 18);
  });
  // As lojas e o CTG: vasos e flores nos cantos da varanda.
  for (const r of [VILA.atacado, VILA.agro, VILA.gado, VILA.acougue, VILA.ferragem, VILA.cancha, VILA.ctg]) {
    const b = r.y + r.h + 18;
    put(r === VILA.ctg ? 'hortensia' : 'vaso', r.x + 34, b); put(r === VILA.ctg ? 'hortensia' : 'tina', r.x + r.w - 40, b);
    put('moita', r.x - 60, r.y + r.h - 30, .85) || put('samambaia', r.x + r.w + 60, r.y + r.h - 30, .85);
  }
  // Moitas e pedras ao pé de metade das árvores.
  let seed = 90211; const rnd = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  const wild = ['moita', 'arbusto', 'samambaia', 'pedra'];
  for (const t of trunks.filter((_, i) => i % 2 === 0)) put(wild[Math.floor(rnd() * wild.length)], t.x + (rnd() < .5 ? -1 : 1) * (70 + rnd() * 40), t.y + 20 + rnd() * 30, rnd() < .5 ? .85 : 1);
  // As ilhas de vegetação: cada parte cabe no lugar, e uma ilha fica longe da outra.
  // O terreiro da bodega, a horta e o fogo de chão ficam como estão.
  const isles = [], yard = [VILA.bodega, VILA.horta, VILA.fogo].map(r => ({ x: r.x - 220, y: r.y - 120, w: r.w + 440, h: r.h + 300 }));
  for (let k = 0; k < 1500 && isles.length < 14; k++) {
    const x = 640 + rnd() * (M.W - 740), y = 220 + rnd() * (VILA.border - 340);
    if (isles.some(c => Math.hypot(c.x - x, (c.y - y) * 1.3) < 430) || yard.some(r => overlap({ x, y, w: 1, h: 1 }, r))) continue;
    // Nem escondida atrás do telhado de uma casa.
    if (d.buildings.some(r => overlap({ x: x - 90, y: y - 40, w: 180, h: 70 }, { x: r.x - 10, y: r.y - 10, w: r.w + 20, h: r.h + 30 }))) continue;
    const parts = FRONTEIRA_ILHAS[isles.length % FRONTEIRA_ILHAS.length].map(([kind, dx, dy, s = 1]) => {
      const a = FRONTEIRA_ART[kind]; return { kind, x: Math.round(x + dx), y: Math.round(y + dy), w: a[2] * s, h: a[3] * s };
    });
    if (!parts.every(q => fits(q.x, q.y, q.w, q.h))) continue;
    list.push(...parts); isles.push({ x, y });
  }
  // Os pelegos secando na cerca do pouso e dois casais de quero-quero no campo.
  near('pelegos', VILA.pouso.x + 60, VILA.pouso.y - 30);
  P.field('queroquero', 2, 1100, rnd);
  // Um de cada, longe um do outro: o poço do lado do Atacado, perto do rio; o galinheiro no pátio do Baitaca; o cocho
  // atrás do pouso, junto dos pelegos; o forno de barro e o toco com o machado dos dois lados da bodega.
  const { atacado: at, pouso: po, bodega: bo } = VILA;
  near('poco', at.x - 180, at.y + 100);
  near('galinheiro', baitaca.x + baitaca.w - 100, baitaca.y + baitaca.h + 110);
  near('cocho', po.x + po.w - 70, po.y - 50);
  near('forno', bo.x + bo.w + 120, bo.y + 140);
  near('tocoMachado', 1250, 735);
  return fronteiraPatios = list;
}
// A Serra e Santa Catarina: o que vai em cada uma.
const FRONTEIRA_ITALIA = ['#2f8a45', '#f4f1e6', '#c8372d'], FRONTEIRA_BAVIERA = ['#3a78c2', '#f4f2ea'];
const FRONTEIRA_REGIOES = {
  serra(P) {
    const v = SERRA.vines, di = SERRA.dianho;
    // As bandeirolas da festa por cima da estrada, entre os trilhos e a praça; o varal da nona do lado da casa do Dianho.
    P.garland(SERRA.roadX + SERRA.roadW / 2, 1240, 230, FRONTEIRA_ITALIA);
    P.near('varal', di.x + di.w + 150, di.y + di.h - 40, { clothes: FRONTEIRA_VARAL_SERRA });
    // Na ponta dos parreirais: as caixas de uva colhida, as pipas e o carrinho de mão cheio de uva.
    P.near('caixaUva', v[3].x - 70, v[3].y + 90); P.near('pipas', v[3].x - 80, v[3].y + 250);
    P.near('caixaUva', v[2].x + v[2].w + 70, v[2].y + 90); P.near('carrinho', v[2].x + v[2].w + 90, v[2].y + 250);
    P.near('carrinho', v[1].x + v[1].w / 2, v[1].y + v[1].h + 70);
    // O forno de barro da galeteria, o poço do lado da casa do Mito, o espantalho na ponta do parreiral e o canteiro
    // na frente da igreja.
    const ga = SERRA.galeteria, mi = SERRA.mito, ig = SERRA.igreja;
    P.near('forno', ga.x - 90, ga.y + ga.h - 20) || P.near('forno', di.x - 90, di.y + di.h - 30);
    P.near('poco', mi.x - 110, mi.y + mi.h - 40);
    P.near('espantalho', v[3].x + v[3].w + 70, v[3].y + 200);
    P.near('canteiro', ig.x + 90, ig.y + ig.h + 50);
  },
  sc(P) {
    const casa = id => SC.houses.find(h => h.id === id), la = casa('lauro'), ind = casa('indavirus'), px = casa('peixinhonabrasa'), lo = casa('loligebien');
    const mid = SC.roadX + SC.roadW / 2;
    // As bandeirolas azul e branco por cima da rua, como na Oktoberfest.
    P.garland(mid, SC.streetY + SC.streetH + 170, 230, FRONTEIRA_BAVIERA); P.garland(mid, 1560, 230, FRONTEIRA_BAVIERA);
    // As bicicletas encostadas, os anões de jardim nas frentes, o varal e a lenha empilhada.
    P.near('bicicleta', px.x - 80, px.y + px.h - 10, { color: '#2f6f9e' }); P.near('bicicleta', lo.x + lo.w + 70, lo.y + lo.h - 10, { color: '#b03a2e' });
    P.near('gnomos', la.x + la.w - 80, la.y + la.h + 30); P.near('gnomos', lo.x + 90, lo.y + lo.h + 30); P.near('gnomos', ind.x + ind.w - 90, ind.y + ind.h + 30);
    P.near('varal', ind.x - 150, ind.y + ind.h - 30, { clothes: FRONTEIRA_VARAL_SC });
    P.near('lenha', px.x + px.w + 70, px.y + px.h - 20) || P.near('lenha', la.x + la.w + 70, la.y + la.h - 20);
    // O vaso grande na frente do café e o canteiro do lado; o arbusto florido perto da cancha de bolão e o galinheiro
    // no pátio da casa do Loligebien.
    const ca = SC.cafe, bo = SC.bolao;
    P.near('vasoGrande', ca.x + 50, ca.y + ca.h + 30); P.near('canteiro', ca.x - 120, ca.y + ca.h - 40);
    P.near('arbustoFlor', bo.x - 100, bo.y + bo.h - 30); P.near('galinheiro', bo.x + bo.w - 60, bo.y + bo.h + 120) || P.near('galinheiro', lo.x + lo.w + 120, lo.y + 200);
  }
};
const fronteiraRegionPatios = new Map();
function fronteiraRegionList(M) {
  if (fronteiraRegionPatios.has(M.id)) return fronteiraRegionPatios.get(M.id);
  // Nas outras regiões, os pontos de interação (portas, achados) também ficam livres.
  const spots = M.spots().map(q => ({ x: q.x - 70, y: q.y - 60, w: 140, h: 110 }));
  const P = fronteiraPlacer(M, { wide: true, blocked: [...spots, ...(M.id === 'serra' ? [SERRA.praca, SERRA.campinho] : [SC.ostern])] });
  FRONTEIRA_REGIOES[M.id](P);
  fronteiraRegionPatios.set(M.id, P.list); return P.list;
}
// A roupa: [cor, largura, altura, perna (calça), xadrez]. Na Fronteira, bombacha, lenço, camisa e pano de prato; na
// Serra, o lençol, a toalha xadrez e o avental da nona; em SC, a calça de couro, a camisa xadrez e o lenço.
const FRONTEIRA_VARAL = [['#33405f', 36, 50, 1], ['#c3322c', 24, 22], ['#efe6d2', 36, 38], ['#6f8456', 28, 30], ['#e3c46c', 22, 24]];
const FRONTEIRA_VARAL_SERRA = [['#f4f1e6', 44, 40], ['#c8372d', 30, 30, 0, 1], ['#efe6d2', 22, 34], ['#4f6a8e', 26, 28], ['#f4f1e6', 22, 22]];
const FRONTEIRA_VARAL_SC = [['#5b4636', 30, 38, 1], ['#3a78c2', 30, 30, 0, 1], ['#f4f2ea', 26, 26], ['#2f6a3e', 26, 32], ['#c8372d', 18, 18]];
// O varal: dois postes, o arame e a roupa balançando no vento.
function drawFronteiraVaral(p) {
  const { x, y, w } = p, h = 150, x0 = x - w / 2, x1 = x + w / 2, top = y - h + 10, sag = 12, t = frameClock;
  ellipse(x, y + 2, w * .52, 7, 'rgba(22,34,16,.22)');
  ctx.strokeStyle = '#ddd6c2'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(x0, top); ctx.quadraticCurveTo(x, top + sag * 2, x1, top); ctx.stroke();
  let cx = x0 + 16;
  for (const [col, cw, ch, legs, xadrez] of p.clothes || FRONTEIRA_VARAL) {
    if (cx + cw > x1 - 10) break;
    const u = (cx + cw / 2 - x0) / w, wy = top + 4 * sag * u * (1 - u);
    ctx.save(); ctx.translate(Math.round(cx + cw / 2), Math.round(wy)); ctx.rotate(Math.sin(t * 1.7 + cx * .07) * .06);
    ctx.fillStyle = 'rgba(20,20,14,.18)'; ctx.fillRect(-cw / 2 + 3, 3, cw, ch);
    ctx.fillStyle = col; ctx.fillRect(-cw / 2, 0, cw, ch);
    if (xadrez) { ctx.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i * 6 < cw; i++) for (let j = 0; j * 6 < ch; j++) if ((i + j) % 2) ctx.fillRect(-cw / 2 + i * 6, j * 6, 6, Math.min(6, ch - j * 6)); }
    ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillRect(-cw / 2, 0, cw, 3); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(cw / 2 - 3, 3, 3, ch - 3);
    if (legs) { ctx.fillStyle = '#5d6a3c'; ctx.fillRect(-2, ch * .45, 4, ch * .55); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-cw / 2, 0, cw, 4); }
    ctx.fillStyle = '#a58a5e'; ctx.fillRect(-cw / 2 + 2, -3, 3, 5); ctx.fillRect(cw / 2 - 5, -3, 3, 5);
    ctx.restore(); cx += cw + 6;
  }
  for (const px of [x0, x1]) { rect(px - 4, y - h, 8, h, '#6b4a2c'); rect(px - 4, y - h, 3, h, '#8d6a42'); rect(px - 12, y - h + 6, 24, 6, '#57391f'); }
}
// Recorte próprio (as trocas de environmentSprite e de worldSprite nos mapas da região viram as hortênsias em vaso e
// escondem as plantas da folha de flora): poucos tamanhos, então o cache fica pequeno.
const fronteiraSprites = new Map();
function fronteiraSprite(sheet, index, x, y, w, h) {
  const im = ENV_ART[sheet] || WORLD_ART[sheet], r = (ENV_CROPS[sheet] || WORLD_ART_CROPS[sheet])?.[index]; if (!im?.naturalWidth || !r) return false;
  const s = Math.min(w / r[2], h / r[3]), sw = Math.ceil(r[2] * s), sh = Math.ceil(r[3] * s), key = sheet + index + ':' + sw + ':' + sh;
  let tile = fronteiraSprites.get(key);
  if (!tile) {
    tile = document.createElement('canvas'); tile.width = sw; tile.height = sh;
    const g = tile.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'medium'; g.drawImage(im, ...r, 0, 0, sw, sh);
    fronteiraSprites.set(key, tile);
  }
  ctx.drawImage(tile, Math.round(x - sw / 2), Math.round(y - sh)); return true;
}
// Os dois postes de um varal, com a trave no alto.
function fronteiraPosts(x0, x1, y, h) {
  for (const px of [x0, x1]) { rect(px - 4, y - h, 8, h, '#6b4a2c'); rect(px - 4, y - h, 3, h, '#8d6a42'); rect(px - 12, y - h + 6, 24, 6, '#57391f'); }
}
// A rede de pesca secando: pendurada no alto, com as boias de cortiça, e a barra balançando no vento.
function drawFronteiraRede(p) {
  const { x, y, w } = p, h = 112, x0 = x - w / 2 + 4, x1 = x + w / 2 - 4, top = y - h + 14, sway = Math.sin(frameClock * 1.3 + x * .05) * 3;
  ellipse(x, y + 2, w * .5, 7, 'rgba(22,34,16,.22)');
  const net = new Path2D();
  net.moveTo(x0, top); net.quadraticCurveTo(x, top + 10, x1, top);
  net.lineTo(x1 - 10 + sway, top + 62); net.quadraticCurveTo(x + sway, top + 86, x0 + 10 + sway, top + 60); net.closePath();
  ctx.save(); ctx.clip(net);
  ctx.fillStyle = 'rgba(190,180,150,.12)'; ctx.fillRect(x0 - 20, top - 4, w + 40, 100);
  ctx.strokeStyle = 'rgba(222,212,182,.78)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let k = -100; k < w + 100; k += 7) { ctx.moveTo(x0 + k, top - 4); ctx.lineTo(x0 + k + 90 + sway, top + 96); ctx.moveTo(x0 + k, top - 4); ctx.lineTo(x0 + k - 90 + sway, top + 96); }
  ctx.stroke(); ctx.restore();
  ctx.strokeStyle = '#a8996f'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x1 - 10 + sway, top + 62); ctx.quadraticCurveTo(x + sway, top + 86, x0 + 10 + sway, top + 60); ctx.stroke();
  ctx.strokeStyle = '#ddd6c2'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, top); ctx.quadraticCurveTo(x, top + 10, x1, top); ctx.stroke();
  for (let i = 1; i < 6; i++) {
    const u = i / 6, bx = x0 + (x1 - x0) * u, by = top + 10 * 2 * u * (1 - u) + 2;
    ellipse(bx, by, 4, 3, '#d9822f'); ellipse(bx - 1, by - 1, 2, 1, '#f3b878');
  }
  fronteiraPosts(x0, x1, y, h);
}
// O charque secando no varal: mantas de carne salgada, com a gordura na borda, balançando nos ganchos.
function drawFronteiraCharque(p) {
  const { x, y, w } = p, h = 140, x0 = x - w / 2, x1 = x + w / 2, top = y - h + 12, sag = 10;
  ellipse(x, y + 2, w * .52, 7, 'rgba(22,34,16,.22)');
  ctx.strokeStyle = '#cfc6ae'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x0, top); ctx.quadraticCurveTo(x, top + sag * 2, x1, top); ctx.stroke();
  const mantas = [[22, 44, '#7d2c22'], [18, 34, '#8f3a2a'], [24, 52, '#742820'], [18, 38, '#8a3326'], [22, 46, '#7d2c22'], [16, 30, '#94402e']];
  let cx = x0 + 18;
  for (const [mw, mh, col] of mantas) {
    if (cx + mw > x1 - 10) break;
    const u = (cx + mw / 2 - x0) / w, wy = top + 4 * sag * u * (1 - u);
    ctx.save(); ctx.translate(Math.round(cx + mw / 2), Math.round(wy)); ctx.rotate(Math.sin(frameClock * 1.4 + cx * .09) * .05);
    ctx.fillStyle = '#5a5a58'; ctx.fillRect(-1, -3, 2, 6);
    ctx.fillStyle = 'rgba(20,20,14,.18)'; ctx.fillRect(-mw / 2 + 3, 5, mw, mh);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-mw / 2 + 2, 3); ctx.lineTo(mw / 2 - 2, 3); ctx.lineTo(mw / 2, mh * .7); ctx.lineTo(mw / 2 - 5, mh); ctx.lineTo(-mw / 2 + 4, mh - 3); ctx.lineTo(-mw / 2, mh * .6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e2c79a'; ctx.fillRect(-mw / 2 + 1, 4, 3, mh * .55);
    ctx.fillStyle = 'rgba(255,240,220,.22)'; ctx.fillRect(-mw / 2 + 5, 5, mw - 9, 2);
    ctx.fillStyle = 'rgba(40,8,6,.28)'; ctx.fillRect(mw / 2 - 5, mh * .3, 3, mh * .5);
    ctx.restore(); cx += mw + 9;
  }
  fronteiraPosts(x0, x1, y, h);
}
// O cata-vento de ferro (o moinho que puxa a água do poço) e a caixa d'água do lado. A roda gira devagar com o vento.
function drawFronteiraMoinho(p) {
  const { x, y } = p, H = 262, R = 46, hub = { x, y: y - H - 10 }, t = frameClock;
  ellipse(x + 10, y + 3, 64, 9, 'rgba(22,34,16,.24)');
  // A caixa d'água de chapa, do lado.
  const tx = x + 52, tw = 50, th = 34;
  rect(tx - tw / 2, y - th, tw, th, '#8f9493'); rect(tx - tw / 2, y - th, 6, th, '#b5bab8'); rect(tx + tw / 2 - 6, y - th, 6, th, '#6f7473');
  ctx.fillStyle = 'rgba(40,44,44,.35)'; for (let k = 1; k < 4; k++) ctx.fillRect(tx - tw / 2, y - th + k * 8, tw, 1);
  ellipse(tx, y - th, tw / 2, 6, '#a3a8a6'); ellipse(tx, y - th, tw / 2 - 4, 4, '#4f6f78');
  // A torre: quatro pés de ferro afinando pra cima, com as travessas em X.
  ctx.lineCap = 'round';
  const leg = (bx, tx2, col, wd) => { ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(x + bx, y); ctx.lineTo(x + tx2, y - H); ctx.stroke(); };
  leg(-22, -5, '#4b4946', 2.5); leg(22, 5, '#4b4946', 2.5); leg(-36, -8, '#64615c', 3.5); leg(36, 8, '#64615c', 3.5);
  ctx.strokeStyle = '#6f6c66'; ctx.lineWidth = 1.4; ctx.beginPath();
  for (let k = 0; k < 5; k++) {
    const a = k / 5, b = (k + 1) / 5, wa = 36 - 28 * a, wb = 36 - 28 * b, ya = y - H * a, yb = y - H * b;
    ctx.moveTo(x - wa, ya); ctx.lineTo(x + wb, yb); ctx.moveTo(x + wa, ya); ctx.lineTo(x - wb, yb); ctx.moveTo(x - wb, yb); ctx.lineTo(x + wb, yb);
  }
  ctx.stroke();
  rect(x - 12, y - H - 4, 24, 6, '#55524d');
  ctx.strokeStyle = '#8a8780'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - H); ctx.lineTo(x, y - 4); ctx.stroke();
  // O leme atrás da roda.
  ctx.strokeStyle = '#55524d'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(hub.x, hub.y); ctx.lineTo(hub.x + 64, hub.y + 2); ctx.stroke();
  ctx.fillStyle = '#a8352a'; ctx.beginPath(); ctx.moveTo(hub.x + 50, hub.y - 16); ctx.lineTo(hub.x + 78, hub.y - 12); ctx.lineTo(hub.x + 78, hub.y + 16); ctx.lineTo(hub.x + 50, hub.y + 18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,220,200,.25)'; ctx.fillRect(hub.x + 51, hub.y - 15, 26, 3);
  // A roda: as pás de chapa girando.
  const n = 16, spin = t * .9 + x * .01;
  for (let i = 0; i < n; i++) {
    const a = spin + i * Math.PI * 2 / n, a2 = a + .22, r0 = 10, r1 = R;
    ctx.fillStyle = i % 2 ? '#c9ccc7' : '#aeb2ad';
    ctx.beginPath(); ctx.moveTo(hub.x + Math.cos(a) * r0, hub.y + Math.sin(a) * r0); ctx.lineTo(hub.x + Math.cos(a) * r1, hub.y + Math.sin(a) * r1);
    ctx.lineTo(hub.x + Math.cos(a2) * r1, hub.y + Math.sin(a2) * r1); ctx.lineTo(hub.x + Math.cos(a2) * r0, hub.y + Math.sin(a2) * r0); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = '#6f736e'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(hub.x, hub.y, R, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(hub.x, hub.y, R * .6, 0, Math.PI * 2); ctx.stroke();
  ellipse(hub.x, hub.y, 8, 8, '#4a4844'); ellipse(hub.x - 2, hub.y - 2, 3, 3, '#8e8b84');
}
// As bandeirolas: dois postes altos e a fieira por cima da estrada, com as bandeirinhas balançando.
function drawFronteiraBandeirolas(p) {
  const { x, y, w, colors } = p, x0 = x - w / 2, x1 = x + w / 2, top = y - 160, sag = 20, t = frameClock;
  for (const px of [x0, x1]) { ellipse(px, y + 2, 8, 3, 'rgba(22,34,16,.25)'); rect(px - 3, top - 8, 6, y - top + 8, '#6b4a2c'); rect(px - 3, top - 8, 2, y - top + 8, '#8d6a42'); }
  ctx.strokeStyle = '#e8e0cc'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x0, top); ctx.quadraticCurveTo(x, top + sag * 2, x1, top); ctx.stroke();
  const n = Math.round(w / 15);
  for (let i = 1; i < n; i++) {
    const u = i / n, fx = x0 + w * u, fy = top + 4 * sag * u * (1 - u);
    ctx.save(); ctx.translate(Math.round(fx), Math.round(fy)); ctx.rotate(Math.sin(t * 2.1 + i * .9) * .14);
    ctx.fillStyle = 'rgba(20,20,14,.16)'; ctx.beginPath(); ctx.moveTo(-4, 2); ctx.lineTo(8, 2); ctx.lineTo(2, 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = colors[i % colors.length]; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.lineTo(0, 14); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
// Os pelegos secando: um branco e um pardo pendurados na trave, com a lã enrolando nas bordas e as patas.
function drawFronteiraPelegos(p) {
  const { x, y, w } = p, x0 = x - w / 2 + 6, x1 = x + w / 2 - 6, bar = y - 92, t = frameClock;
  ellipse(x, y + 2, w * .5, 6, 'rgba(22,34,16,.22)');
  for (const px of [x0, x1]) { rect(px - 4, bar - 6, 8, y - bar + 8, '#6b4a2c'); rect(px - 4, bar - 6, 3, y - bar + 8, '#8d6a42'); }
  rect(x0 - 8, bar - 4, x1 - x0 + 16, 7, '#7a5434'); rect(x0 - 8, bar - 4, x1 - x0 + 16, 2, '#9a7048');
  [[x - w * .2, 40, 56, '#eee5cd', '#d2c3a0'], [x + w * .2, 36, 50, '#8b6a48', '#6a4e34']].forEach(([sx, pw, len, col, dark], i) => {
    const sw = Math.sin(t * 1.1 + i * 2 + x * .01) * 1.6, l = sx - pw / 2, r = sx + pw / 2;
    ellipse(sx + 8, y - 1, pw * .45, 4, 'rgba(22,34,16,.16)');
    // As patas da frente por cima da trave e as de trás embaixo.
    rect(l - 3, bar - 11, 9, 15, col, 3); rect(r - 6, bar - 11, 9, 15, col, 3);
    rect(l - 5 + sw, bar + len - 8, 9, 16, col, 3); rect(r - 4 + sw, bar + len - 8, 9, 16, col, 3);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(l, bar - 2); ctx.lineTo(r, bar - 2);
    ctx.quadraticCurveTo(r + 3, bar + len * .5, r + sw, bar + len); ctx.lineTo(l + sw, bar + len); ctx.quadraticCurveTo(l - 3, bar + len * .5, l, bar - 2); ctx.fill();
    // A lã: bolinhas na borda e uns tufos mais escuros no meio.
    for (let k = 0; k < 6; k++) { ellipse(l + 1 + sw * k / 6, bar + 6 + k * (len - 8) / 5, 3.5, 4.5, col); ellipse(r - 1 + sw * k / 6, bar + 6 + k * (len - 8) / 5, 3.5, 4.5, col); }
    for (let k = 0; k < 6; k++) ellipse(l + 3 + k * (pw - 6) / 5 + sw, bar + len, 4.5, 4, col);
    ctx.fillStyle = dark; for (let k = 0; k < 30; k++) ctx.fillRect(Math.round(l + 4 + (k * 13) % (pw - 8) + sw * (k % 7) / 7), Math.round(bar + 4 + (k * 17) % (len - 8)), 3, 2);
    ctx.fillStyle = 'rgba(0,0,0,.13)'; ctx.fillRect(Math.round(r - 7 + sw), bar + 2, 6, len - 4);
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(Math.round(l + 3), bar + 1, pw - 10, 3);
  });
}
// Um casal de quero-queros no campo, virando de lado e bicando o chão.
function drawFronteiraQueroQuero(p) {
  if (typeof queroArt === 'undefined' || !queroArt.naturalWidth) return;
  for (const [dx, dy, ph] of [[-22, 0, 0], [24, 6, 2.3]]) {
    const t = frameClock + ph + p.x * .01, flip = Math.floor(t / 6.5) % 2 === 0, peck = t % 3.1 < .35 ? 2 : 0, bx = p.x + dx, by = p.y + dy;
    ellipse(bx, by, 11, 3, 'rgba(22,34,16,.25)');
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.translate(Math.round(bx), Math.round(by - 15 + peck)); if (flip) ctx.scale(-1, 1);
    ctx.drawImage(queroArt, 0, 0, QUERO_W, QUERO_H, -21, -16, 42, 32); ctx.restore();
  }
}
// A bicicleta encostada, com a cestinha de flores.
function drawFronteiraBicicleta(p) {
  const { x, y } = p, col = p.color || '#2f6f9e', r = 11, bx = x - 21, fx = x + 21, wy = y - r;
  ellipse(x, y + 2, 32, 4, 'rgba(22,34,16,.25)');
  ctx.lineCap = 'round';
  for (const cx of [bx, fx]) {
    ctx.strokeStyle = '#2a2a28'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, wy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(200,200,195,.75)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4, c = Math.cos(a) * (r - 2), s = Math.sin(a) * (r - 2); ctx.moveTo(cx - c, wy - s); ctx.lineTo(cx + c, wy + s); }
    ctx.stroke();
  }
  const ped = [x - 3, wy], seat = [x - 10, wy - 22], head = [x + 13, wy - 22];
  ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath();
  ctx.moveTo(bx, wy); ctx.lineTo(...ped); ctx.lineTo(...seat); ctx.lineTo(bx, wy);
  ctx.moveTo(...seat); ctx.lineTo(...head); ctx.lineTo(...ped); ctx.moveTo(...head); ctx.lineTo(fx, wy); ctx.stroke();
  ctx.strokeStyle = '#3a3a36'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(seat[0], seat[1]); ctx.lineTo(seat[0] - 1, seat[1] - 5);
  ctx.moveTo(head[0], head[1]); ctx.lineTo(head[0] - 2, head[1] - 7); ctx.lineTo(head[0] - 9, head[1] - 8); ctx.stroke();
  rect(seat[0] - 7, seat[1] - 8, 12, 4, '#3a2a20', 2);
  rect(fx - 6, wy - 30, 15, 9, '#b48a52', 2); ctx.fillStyle = '#8a6438'; ctx.fillRect(fx - 6, wy - 26, 15, 1);
  for (const [dx, c] of [[-3, '#e04a5a'], [2, '#f2d24a'], [6, '#f4f1e6']]) ellipse(fx + dx, wy - 32, 2.5, 2.5, c);
  ellipse(ped[0], ped[1], 2.5, 2.5, '#3a3a36');
}
// Os anões de jardim (de gorro vermelho e barba branca) e um cogumelo do lado.
function drawFronteiraGnomos(p) {
  const shade = 'rgba(22,34,16,.25)';
  for (const [dx, dy, coat, s] of [[-18, 0, '#2f5f9e', 1], [12, 5, '#3f7a3a', .85]]) {
    const gx = p.x + dx, gy = p.y + dy, k = v => v * s;
    ellipse(gx, gy + 1, k(9), 2.5, shade);
    rect(gx - k(6), gy - k(5), k(5), k(5), '#4a2e1c'); rect(gx + k(1), gy - k(5), k(5), k(5), '#4a2e1c');
    rect(gx - k(7), gy - k(18), k(14), k(14), coat, 3);
    ctx.fillStyle = '#2a1a10'; ctx.fillRect(gx - k(7), gy - k(10), k(14), k(2));
    ellipse(gx, gy - k(21), k(5), k(4.5), '#f0c8a0');
    ctx.fillStyle = '#f4f1ea'; ctx.beginPath(); ctx.moveTo(gx - k(6), gy - k(20)); ctx.lineTo(gx + k(6), gy - k(20)); ctx.lineTo(gx, gy - k(9)); ctx.closePath(); ctx.fill();
    ellipse(gx, gy - k(20.5), k(1.8), k(1.5), '#e08a74');
    ctx.fillStyle = '#c8372d'; ctx.beginPath(); ctx.moveTo(gx - k(7), gy - k(23)); ctx.lineTo(gx + k(7), gy - k(23)); ctx.lineTo(gx + k(3), gy - k(41)); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.moveTo(gx - k(5), gy - k(24)); ctx.lineTo(gx - k(1), gy - k(24)); ctx.lineTo(gx + k(2), gy - k(37)); ctx.closePath(); ctx.fill();
  }
  const mx = p.x + 34, my = p.y + 3;
  ellipse(mx, my + 1, 7, 2, shade); rect(mx - 3, my - 9, 6, 9, '#efe6d2', 2);
  ctx.fillStyle = '#c8372d'; ctx.beginPath(); ctx.ellipse(mx, my - 9, 10, 8, 0, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fill();
  for (const [dx, dy] of [[-5, -12], [2, -15], [5, -11]]) ellipse(mx + dx, my + dy, 1.6, 1.4, '#f4f1ea');
}
// O carrinho de mão de madeira, cheio de cachos de uva.
function drawFronteiraCarrinho(p) {
  const { x, y } = p;
  ellipse(x + 4, y + 2, 38, 5, 'rgba(22,34,16,.24)');
  ctx.lineCap = 'round'; ctx.strokeStyle = '#6b4a2c'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(x - 26, y - 14); ctx.lineTo(x + 46, y - 20); ctx.stroke();
  rect(x + 16, y - 16, 3, 16, '#5a3c22');
  ctx.fillStyle = '#3a3a36'; ctx.beginPath(); ctx.arc(x - 26, y - 9, 9, 0, Math.PI * 2); ctx.fill(); ellipse(x - 26, y - 9, 3, 3, '#8a8780');
  ctx.fillStyle = '#7a5434'; ctx.beginPath(); ctx.moveTo(x - 30, y - 34); ctx.lineTo(x + 26, y - 36); ctx.lineTo(x + 18, y - 14); ctx.lineTo(x - 22, y - 13); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9a7048'; ctx.fillRect(x - 30, y - 36, 56, 3); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(x - 22, y - 22, 40, 2);
  ellipse(x - 24, y - 40, 7, 4, '#4f7a32'); ellipse(x + 22, y - 41, 7, 4, '#5d8a3a');
  for (const [cx, cy] of [[-14, -44], [0, -46], [13, -44], [-6, -51], [7, -52]])
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4 - r; c++) {
      const gx = x + cx + (c - (3 - r) / 2) * 4, gy = y + cy + r * 3.5;
      ellipse(gx, gy, 2.4, 2.4, '#4e2463'); ctx.fillStyle = '#8a5aa8'; ctx.fillRect(Math.round(gx - 1), Math.round(gy - 1), 1, 1);
    }
}
function drawFronteiraPatio(p) {
  const k = FRONTEIRA_ESCALA[p.kind];
  if (k) { ctx.save(); ctx.translate(p.x, p.y); ctx.scale(k, k); ctx.translate(-p.x, -p.y); drawFronteiraPatioArt(p); ctx.restore(); return; }
  drawFronteiraPatioArt(p);
}
function drawFronteiraPatioArt(p) {
  if (p.kind === 'bandeirolas') { drawFronteiraBandeirolas(p); return; }
  if (p.kind === 'pelegos') { drawFronteiraPelegos(p); return; }
  if (p.kind === 'queroquero') { drawFronteiraQueroQuero(p); return; }
  if (p.kind === 'bicicleta') { drawFronteiraBicicleta(p); return; }
  if (p.kind === 'gnomos') { drawFronteiraGnomos(p); return; }
  if (p.kind === 'carrinho') { drawFronteiraCarrinho(p); return; }
  if (p.kind === 'varal') { drawFronteiraVaral(p); return; }
  if (p.kind === 'rede') { drawFronteiraRede(p); return; }
  if (p.kind === 'charque') { drawFronteiraCharque(p); return; }
  if (p.kind === 'moinho') { drawFronteiraMoinho(p); return; }
  const [sheet, i] = FRONTEIRA_ART[p.kind];
  fronteiraSprite(sheet, i, p.x, p.y, p.w, p.h);
}
{
  const land = worldLandscape;
  worldLandscape = function (M, seen, layers, view) {
    land(M, seen, layers, view);
    if (!ENV_ART['environment-props-v3']?.naturalWidth) return;
    const list = M.id === 'vila' ? fronteiraPatioList() : FRONTEIRA_REGIOES[M.id] ? fronteiraRegionList(M) : null;
    if (list) for (const p of list) if (seen(p.x, p.y, p.h + 40)) layers.push({ y: p.y, draw: () => drawFronteiraPatio(p) });
  };
}
