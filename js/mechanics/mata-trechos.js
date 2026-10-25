// Mata adentro: da Mata de Araucárias até o mar, como a caverna, só que pro leste e descendo a serra.
//   · Trecho 1 é a mata desenhada à mão (mata-araucaria.js), com o refúgio do Garibaldi: ali é paz, de dia e de noite.
//   · Do trecho 2 em diante a mata é tão fechada que lá dentro é sempre noite, a qualquer hora, e é sempre braba: o Sadi
//     entra de facão na mão, e os bichos são os mesmos de manhã ou de madrugada. Quanto mais fundo, mais fortes.
//   · Três regiões, cada uma com dez trechos: o Pinheiral (2 a 11), a Encosta da Serra (12 a 21, mata fechada e escura
//     descendo pro litoral) e a Restinga (22 a 31: areia, butiazais, sangas e, no fim, a praia). Depois do 31, a Barra de
//     Laguna (mata-laguna.js). Não tem placa de trecho: o Sadi vai explorando sem saber o número.
//   · Cada trecho é gerado no dia (o mesmo no mesmo dia, outro no dia seguinte): picada principal, arroio ou sanga,
//     clareiras de coleta e a saída pro próximo. Bicho derrubado e coisa colhida não voltam até o outro dia.
//   · Mata fechada: só se anda pelas picadas e clareiras (o resto é mato cerrado). Não tem ferramenta pra comprar nem
//     obstáculo pra destravar: o arroio sempre tem passagem de pedra, e o que segura a descida são só os chefes.
//   · Nos ramais, às vezes, um baú de mateiro: moeda, coisa pro bornal, butiá, minério e figurinha, melhor quanto mais fundo.
//   · Arma, vida, resistência e lampião são da ferraria do São Dunstano (o Garibaldi vende as mesmas): valem na caverna e na mata.
//   · Chefes no fim de cada região: o Javali Cachaço (11) e o Lagarto do papo-amarelo (21) (mata-chefes.js).
//   · Acampamentos a cada cinco trechos (6, 11, 16, 21, 26 e 31): fogo de chão que espanta os bichos, e em cada um alguém
//     pra prosear (mata-acampamentos.js). Do refúgio dá pra ir direto até os acampamentos já acesos.
//   · Nível de mateiro (Piá do mato → Mateiro → Caboclo → Guardião da mata) e o replantio das clareiras de tocos.
'use strict';

const TRECHO = { W: 3200, H: 2000, camps: [6, 11, 16, 21, 26, 31], last: 31, half: 40, branch: 30, shoreY: 1720, beachFrom: 28 };
const TRECHO_BOSSES = { 11: 'cachaco', 21: 'papo' };
const TRECHO_CHEST_CHANCE = .15;   // cada ramal do dia tem essa chance de esconder um baú de mateiro
function trechoBiome(n) { return n > TRECHO.last ? 'laguna' : n >= 22 ? 'restinga' : n >= 12 ? 'encosta' : 'mata'; }
const TRECHO_BIOME_NAMES = { mata: 'Pinheiral', encosta: 'Encosta da Serra', restinga: 'Restinga do litoral', laguna: 'Barra de Laguna' };
const TRECHO_BIOME_TEXT = {
  mata: 'Araucárias, erva-mate nativa e pinhão.',
  encosta: 'A mata fecha e escurece descendo a serra: xaxim, palmeira e pedra molhada.',
  restinga: 'Areia, butiazais e sangas: o mar já está perto.'
};
const MATEIRO_RANKS = [[0, 'Piá do mato'], [100, 'Mateiro'], [300, 'Caboclo'], [800, 'Guardião da mata']];
CAVE_BEASTS.cascavel = { name: 'Cascavel', hp: 18, speed: 0, dmg: 16, r: 22, cash: [3, 5], from: 999, weight: 0 };
BAG_RAW.erva_verde = { name: 'Ramos de erva-mate nativa', icon: '🌿', value: 1.2, note: 'seca no barbaquá do Garibaldi e vira erva-mate pro saco da bodega' };
RURAL_ITEM_ALIASES.erva_verde = 'erva';   // no inventário, os ramos usam a arte da erva-mate

// ---------- Estado ----------
function mataState() {
  const m = (G.mata ??= {}); m.deepest ??= 1; m.camps ??= {}; m.up ??= {}; m.bag ??= {}; m.xp ??= 0; m.plant ??= {}; m.folks ??= {};
  // A primeira versão ia até o trecho 25, com outros chefes e acampamentos: recomeça a descida no Pinheiral.
  if (!m.v2) { m.v2 = 1; m.camps = {}; m.deepest = Math.min(m.deepest, 7); delete m.curupira; delete m.caipora; delete m.trecho; }
  return m;
}
function inTrecho() { return worldOut?.map === 'trecho'; }
function trechoN() { return mataState().trecho || 2; }
function mataLevel(xp = mataState().xp) { let n = 1; MATEIRO_RANKS.forEach(([v], i) => { if (xp >= v) n = i + 1; }); return n; }
function mataRank(n = mataLevel()) { return MATEIRO_RANKS[n - 1][1]; }
function mataXP(n) {
  const st = mataState(), before = mataLevel(); st.xp += n; const after = mataLevel();
  if (after > before) { showBanner('Nível de mateiro: ' + mataRank(after), 'Cada vez mais à vontade no meio do mato.', 'level', { world: true }); AudioEngine.ready?.(); }
}
function mataToday() { const st = mataState(); if (st.today?.day !== G.day) st.today = { day: G.day, t: {} }; return st.today; }
function trechoDay(n = trechoN()) { const d = mataToday().t[n] ??= { killed: [], got: [], ticao: false }; if (!Array.isArray(d.killed)) d.killed = [...(d.killed?.d || []), ...(d.killed?.n || [])]; return d; }
// Lua cheia: três noites a cada quatro semanas (o lobisomem sai nelas, da encosta pra baixo).
function mataLuaCheia(day = G.day) { const k = dayNumber(day) % 28; return k >= 13 && k <= 15; }
function trechoKey() { return 'trecho:' + trechoN() + ':' + G.day; }
function mataFolk(id) { return !!mataState().folks[id]; }   // conheceu quem mora no acampamento (mata-acampamentos.js)

// ---------- Bornal (vendido no refúgio do Garibaldi) ----------
const MATA_ITEMS = [
  { id: 'marcela', name: 'Chá de marcela', icon: '🍵', cost: 14, desc: 'Cura 30 de vida e corta o veneno de cobra.' },
  { id: 'carqueja', name: 'Carqueja', icon: '🌿', cost: 18, desc: 'Mais vida por um tempo: +2 por segundo, por 20 segundos.' },
  { id: 'fumo', name: 'Fumo de rolo', icon: '🍂', cost: 20, desc: 'O cheiro espanta onça e corpo-seco: por 30 segundos, eles fogem do Sadi.' },
  { id: 'ticao', name: 'Tição de nó de pinho', icon: '🔥', cost: 25, desc: 'Clareia o trecho inteiro até o fim do dia.' }
];
function mataBagMax() { return caveUp('bornal') ? 6 : 3; }
function mataBag() { return mataState().bag; }
const mataBuffs = { regen: 0, fumo: 0, apito: 3, veneno: 0, venenoTick: 0 };

// ---------- O trecho: geração ----------
// Onde a picada sai pro leste (nos trechos de praia, ela fica longe do mar).
function trechoExitY(n) { const y = trechoEnds(n).yOut; return trechoBiome(n) === 'restinga' && n >= TRECHO.beachFrom ? Math.min(y, 1370) : y; }
function trechoEnds(n) { const R = caveRand(n * 7349 + G.day * 104729 + 31); return { R, yIn: 520 + R() * (TRECHO.H - 1040), yOut: 520 + R() * (TRECHO.H - 1040) }; }
function trechoRiverX(T, y) { const r = T.river; return r.x0 + Math.sin(y / 330 + r.ph) * 110 + Math.sin(y / 130 + r.ph2) * 40; }
function trechoRiverHalf(T, y) { return (T.biome === 'restinga' ? 30 : 34) + 4 * Math.sin(y / 60); }
function trechoBeach(T) { return T.biome === 'restinga' && T.n >= TRECHO.beachFrom; }
function trechoShoreY(x) { return TRECHO.shoreY + Math.sin(x / 300) * 18 + Math.sin(x / 97) * 6; }
function trechoTrail(id, half, ctrl) {
  const pts = mataSmooth(ctrl), normals = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], c = pts[Math.min(pts.length - 1, i + 1)], dx = c[0] - a[0], dy = c[1] - a[1], L = Math.hypot(dx, dy) || 1; return [-dy / L, dx / L]; });
  const paths = new Map();
  return { id, half, pts, path(expand = 0) {
    if (paths.has(expand)) return paths.get(expand);
    const p = new Path2D(), side = s => pts.map((q, i) => { const wav = Math.sin((i * 22 + q[0]) / 70) * 4 + Math.sin(i * 1.7) * 2, r = half + expand + wav * s; return [q[0] + normals[i][0] * r * s, q[1] + normals[i][1] * r * s]; });
    const L = side(1), Rr = side(-1).reverse(); p.moveTo(...L[0]); for (const q of L) p.lineTo(...q); for (const q of Rr) p.lineTo(...q); p.closePath(); paths.set(expand, p); return p;
  } };
}
function trechoTrailDist(T, x, y) {
  let best = Infinity, half = 0;
  for (const t of T.trails) for (let i = 0; i < t.pts.length - 1; i++) {
    const [ax, ay] = t.pts[i], [bx, by] = t.pts[i + 1], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1, k = clamp(((x - ax) * dx + (y - ay) * dy) / L, 0, 1), d = Math.hypot(x - ax - dx * k, y - ay - dy * k);
    if (d - t.half < best - half) { best = d; half = t.half; }
  }
  return best - half;
}
function trechoInClearing(T, x, y, grow = 1) { return T.clearings.some(c => ((x - c.x) / (c.rx * grow)) ** 2 + ((y - c.y) / (c.ry * grow)) ** 2 < 1); }
function trechoRiverSide(T, x, y) { return T.river ? Math.sign(x - trechoRiverX(T, y)) : 0; }
// Que árvore nasce em cada região (o desenho fica em mata-biomas.js). Tamanhos em degraus, pro cache de sprite.
function trechoTreeKind(biome, n, R) {
  const r = R(), step = v => Math.round(v / 16) * 16;
  if (biome === 'encosta') {
    if (r < (n <= 14 ? .28 : .1)) { const w = step(230 + R() * 80); return { art: 'arauc', kind: 1, w, h: w * 1.42 }; }
    if (r < .62) { const w = step(250 + R() * 90); return { art: 'folha', v: R() < .5 ? 2 : 3, kind: 0, w, h: w * 1.05 }; }
    if (r < .86) { const w = step(180 + R() * 60); return { art: 'xaxim', kind: 0, w, h: w * 1.25 }; }
    const w = step(150 + R() * 40); return { art: 'jeriva', kind: 0, w, h: w * 1.7 };
  }
  if (biome === 'restinga') {
    if (r < .62) { const w = step(220 + R() * 60); return { art: 'butia', kind: 0, w, h: w }; }
    if (r < .86) { const w = step(140 + R() * 40); return { art: 'jeriva', kind: 0, w, h: w * 1.7 }; }
    const w = step(190 + R() * 50); return { art: 'folha', v: 3, kind: 0, w, h: w * 1.1 };
  }
  const kind = R() < .84 ? 1 : 0, w = step(kind === 1 ? 236 + R() * 96 : 220 + R() * 70); return { art: 'arauc', kind, w, h: w * (kind === 1 ? 1.42 : 1.3) };
}
// Mato baixo: samambaia e bromélia na encosta, capim e arbusto de restinga na areia; o pinheiral segue o de sempre.
function trechoBrushArt(biome, clear, near, R) {
  const r = R();
  if (biome === 'encosta') return near ? (r < .6 ? { sheet: 'env', i: 2 } : { sheet: 'nat', i: 1 }) : r < .3 ? { sheet: 'reg', i: 6 } : r < .6 ? { sheet: 'env', i: 1 } : { sheet: 'nat', i: 1 };
  if (biome === 'restinga') return near || clear ? (r < .7 ? { sheet: 'nat', i: 13 } : { sheet: 'env', i: 0 }) : r < .45 ? { sheet: 'env', i: 1 } : r < .72 ? { sheet: 'env', i: 0 } : r < .92 ? { sheet: 'nat', i: 13 } : { sheet: 'nat', i: 14 };
  return { sheet: 'env', i: clear ? (r < .6 ? 0 : 1) : near ? (r < .5 ? 1 : 0) : (r < .5 ? 2 : 1) };
}
function trechoGen(n) {
  const { W, H } = TRECHO, { R, yIn, yOut } = trechoEnds(n), RS = caveRand(n * 9173 + 5), biome = trechoBiome(n), beach = biome === 'restinga' && n >= TRECHO.beachFrom;
  const boss = TRECHO_BOSSES[n] || null, camp = TRECHO.camps.includes(n);
  const T = { n, biome, W, H, yIn, yOut, boss, trails: [], clearings: [], resources: [], chests: [], river: null, crossing: null, camp: null, tocos: null, beach };
  // Sempre noite lá dentro: a sombra em volta do Sadi (o lampião da ferraria abre a luz).
  T.dark = biome === 'encosta' ? .78 : biome === 'restinga' ? .6 : Math.min(.74, .6 + n * .012);
  const maxY = beach ? 1250 : H - 400;
  // Picada principal, de oeste a leste; o acampamento fica no meio dela.
  const ctrl = [[-80, yIn], [220, yIn]]; let y = yIn;
  for (let x = 640; x < W - 360; x += 420 + R() * 120) { y = clamp(y + (R() - .5) * 520, 400, maxY); ctrl.push([x, y]); }
  T.yOut = trechoExitY(n); ctrl.push([W - 220, T.yOut], [W + 80, T.yOut]);
  if (camp) { let k = 1, bd = Infinity; ctrl.forEach((c, i) => { if (i > 1 && i < ctrl.length - 2 && Math.abs(c[0] - W / 2) < bd) { bd = Math.abs(c[0] - W / 2); k = i; } }); ctrl[k] = [W / 2, Math.min(ctrl[k][1], H - 560)]; T.camp = { id: 'camp', x: W / 2, y: ctrl[k][1], rx: boss ? 420 : 280, ry: boss ? 280 : 180 }; T.clearings.push(T.camp); }
  let main = trechoTrail('principal', biome === 'restinga' ? 46 : TRECHO.half, ctrl); T.trails.push(main);
  // A praia (17 a 19): uma faixa de areia na beira do mar, com uma descida da picada principal.
  if (beach) T.clearings.push({ id: 'praia', x: W / 2, y: TRECHO.shoreY - 120, rx: W / 2 + 260, ry: 104 });
  // O arroio (na restinga, uma sanga): corta o mapa de norte a sul, longe do acampamento, sempre com passagem.
  if (R() < .6) {
    let x0 = W * (.36 + R() * .3); if (T.camp && Math.abs(x0 - T.camp.x) < 620) x0 = T.camp.x + (x0 < T.camp.x ? -1 : 1) * 640;
    T.river = { x0: clamp(x0, 600, W - 600), ph: R() * 6, ph2: R() * 6 };
    for (let i = 1; i < main.pts.length; i++) { const [ax, ay] = main.pts[i - 1], [bx, by] = main.pts[i]; if (Math.sign(ax - trechoRiverX(T, ay)) !== Math.sign(bx - trechoRiverX(T, by))) { T.crossing = { x: trechoRiverX(T, by), y: by, kind: 'pedras' }; break; } }
    if (!T.crossing) T.river = null;
    else {
      // Assenta a picada reta na travessia, pra ponte cair certinho.
      const cx = T.crossing.x, cy = T.crossing.y, span = trechoRiverHalf(T, cy) + 110;
      const pts = main.pts.map(([x, y]) => { const a = clamp((Math.abs(x - cx) - span) / 110, 0, 1); return [x, cy * (1 - a) + y * a]; });
      main = trechoTrail('principal', main.half, pts); T.trails[0] = main;
    }
  }
  // Ramais pras clareiras de coleta (sem cruzar o arroio nem cair no acampamento).
  const branchFrom = (i, len, dir) => { const p = main.pts[i], q = main.pts[Math.min(main.pts.length - 1, i + 2)], a = Math.atan2(q[1] - p[1], q[0] - p[0]) + dir * Math.PI / 2; return { p, end: [clamp(p[0] + Math.cos(a) * len, 320, W - 320), clamp(p[1] + Math.sin(a) * len, 300, beach ? maxY + 40 : H - 260)] }; };
  const okEnd = (p, e) => (!T.river || [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1].every(k => { const x = p[0] + (e[0] - p[0]) * k, y = p[1] + (e[1] - p[1]) * k; return trechoRiverSide(T, x, y) === trechoRiverSide(T, p[0], p[1]) && Math.abs(x - trechoRiverX(T, y)) > (k > .3 ? 220 : 100); }) && Math.abs(e[0] - trechoRiverX(T, e[1])) > 300) && !T.clearings.some(c => c.id !== 'praia' && Math.hypot(c.x - e[0], c.y - e[1]) < c.rx + 260) && !(T.crossing && Math.hypot(T.crossing.x - e[0], T.crossing.y - e[1]) < 400);
  for (let k = 0, made = 0; k < 24 && made < 3; k++) {
    const i = Math.floor(main.pts.length * (.12 + R() * .76)), { p, end } = branchFrom(i, 380 + R() * 160, R() < .5 ? -1 : 1);
    if (!okEnd(p, end)) continue;
    const mid = [(p[0] + end[0]) / 2 + (R() - .5) * 120, (p[1] + end[1]) / 2 + (R() - .5) * 80];
    T.trails.push(trechoTrail('ramal' + made, TRECHO.branch, [p, mid, end])); T.clearings.push({ id: 'coleta' + made, x: end[0], y: end[1], rx: 200 + R() * 60, ry: 130 + R() * 40 }); made++;
  }
  if (beach) {
    // A descida pra praia: do ponto da picada mais perto do meio, reto pro sul, do lado do arroio que não atrapalha.
    let bi = Math.floor(main.pts.length * .5), bd = Infinity; main.pts.forEach((q, i) => { const d = Math.abs(q[0] - W * .3); if (i > 4 && i < main.pts.length - 5 && d < bd && (!T.river || Math.abs(q[0] - trechoRiverX(T, q[1])) > 260) && !(T.camp && Math.abs(q[0] - T.camp.x) < T.camp.rx + 80)) { bd = d; bi = i; } });
    const p = main.pts[bi], end = [p[0] + 60, TRECHO.shoreY - 150]; T.trails.push(trechoTrail('praia', TRECHO.branch + 6, [p, [p[0] + 40, (p[1] + end[1]) / 2], end]));
    if (T.river) T.riverToSea = true;
  }
  // Clareira de tocos (do 7 ao 19, fora dos acampamentos): pinhão plantado vira muda em três dias.
  if (n >= 7 && n <= 19 && !boss && !camp) {
    // Se o arroio do dia passar por cima, a clareira fica do outro lado do trecho (as mudas são do trecho, não do lugar).
    const x0 = W * (.22 + RS() * .56), y0 = RS() < .5 ? 320 : H - 300, ok = (x, y) => (!T.river || Math.abs(x - trechoRiverX(T, y)) > 260) && !(T.camp && Math.hypot(x - T.camp.x, y - T.camp.y) < 600);
    const at = [[x0, y0], [W - x0, y0], [x0, H - y0], [W - x0, H - y0], ...Array.from({ length: 12 }, (_, k) => [W * (.16 + k * .06), k % 2 ? 320 : H - 300])].find(([x, y]) => ok(x, y));
    if (at) {
      const [tx, ty] = at; let bi = 1, bd = Infinity; main.pts.forEach((q, i) => { const d = Math.hypot(q[0] - tx, q[1] - ty); if (d < bd && (!T.river || trechoRiverSide(T, q[0], q[1]) === trechoRiverSide(T, tx, ty))) { bd = d; bi = i; } });
      const p = main.pts[bi]; T.trails.push(trechoTrail('tocos', TRECHO.branch, [p, [(p[0] + tx) / 2, (p[1] + ty) / 2], [tx, ty]])); T.tocos = { id: 'tocos', x: tx, y: ty, rx: 230, ry: 150 }; T.clearings.push(T.tocos);
    }
  }
  // A mata: quanto mais fundo, mais fechada. Primeiro as árvores (os butiazeiros da restinga dão butiá).
  const trees = [], brush = [], rocks = [], reeds = [], logs = [];
  const nearRes = (x, y, d) => T.resources.some(r => Math.hypot(r.x - x, r.y - y) < d) || T.chests.some(c => Math.hypot(c.x - x, c.y - y) < d + 30);
  const riverOK = (x, y, pad) => !T.river || Math.abs(x - trechoRiverX(T, y)) > trechoRiverHalf(T, y) + pad;
  const seaOK = (x, y, pad = 0) => !beach || y < TRECHO.shoreY - 240 - pad;
  const free = (x, y, pad) => trechoTrailDist(T, x, y) > pad && riverOK(x, y, pad + 30) && seaOK(x, y) && !trechoInClearing(T, x, y, 1.05) && !(x < 260 && Math.abs(y - yIn) < 200) && !(x > W - 260 && Math.abs(y - T.yOut) < 200);
  const crownOK = (x, y, w, h) => [[0, .62], [0, .82], [-.3, .72], [.3, .72], [0, .45]].every(([kx, ky]) => { const px = x + kx * w, py = y - ky * h; return trechoTrailDist(T, px, py) > 10 && riverOK(px, py, 14) && !trechoInClearing(T, px, py, .9); });
  const skip = biome === 'restinga' ? .5 : Math.max(.03, .14 - n * .006);
  const plant = (gx, gy, jx, jy, sk) => { const x = gx + (R() - .5) * jx, y = gy + (R() - .5) * jy; if (R() < sk || !free(x, y, 58)) return; const t = trechoTreeKind(biome, n, R); if (crownOK(x, y, t.w, t.h) && !trees.some(o => Math.hypot(o.x - x, o.y - y) < 60)) trees.push({ x, y, ...t }); };
  for (let gy = 150; gy < H - 30; gy += 118) for (let gx = 50; gx < W - 40; gx += 132) plant(gx, gy, 92, 80, skip);
  if (biome === 'encosta' || biome === 'mata' && n >= 7) for (let gy = 210; gy < H - 30; gy += 118) for (let gx = 116; gx < W - 40; gx += 132) plant(gx, gy, 60, 50, biome === 'encosta' ? .5 : .62);
  // Coisas pra colher: pinhão (pinheiral e começo da encosta), erva-mate nativa (pinheiral e encosta), butiá (restinga) e
  // colmeias de jataí (em todo lugar).
  const inClear = (c, s = .7) => { const a = R() * Math.PI * 2, r = Math.sqrt(R()) * s; return { x: c.x + Math.cos(a) * c.rx * r, y: c.y + Math.sin(a) * c.ry * r }; };
  const coleta = T.clearings.filter(c => c.id.startsWith('coleta')), grown = trechoPlantGrown(n);
  // Pouco de cada vez: umas pinhas por trecho no pinheiral, menos ainda no começo da encosta.
  const pinhas = biome === 'mata' ? 2 + Math.floor(R() * 3) : biome === 'encosta' && n <= 15 ? 1 + Math.floor(R() * 2) : 0;
  for (let k = 0, made = 0; k < 60 && made < pinhas + (grown ? 3 : 0); k++) {
    const c = grown && made < 3 ? T.tocos : coleta.length && R() < .7 ? coleta[Math.floor(R() * coleta.length)] : null, at = c ? inClear(c) : (() => { const q = T.trails[0].pts[Math.floor(R() * T.trails[0].pts.length)], a = R() * Math.PI * 2; return { x: q[0] + Math.cos(a) * 40, y: q[1] + Math.sin(a) * 30 }; })();
    if (at.x < 200 || at.x > W - 200 || at.y < 160 || at.y > H - 120 || T.resources.some(r => Math.hypot(r.x - at.x, r.y - at.y) < 70) || T.crossing && Math.hypot(T.crossing.x - at.x, T.crossing.y - at.y) < 160 || T.river && Math.abs(at.x - trechoRiverX(T, at.y)) < trechoRiverHalf(T, at.y) + 30 || T.camp && trechoInClearing({ clearings: [T.camp] }, at.x, at.y, 1.1)) continue;
    T.resources.push({ id: 'p' + made, kind: 'pinha', ...at }); made++;
  }
  if (biome !== 'restinga') coleta.slice(0, 2).forEach((c, k) => { const at = inClear(c, .5); T.resources.push({ id: 'e' + k, kind: 'erva', ...at }); });
  else {
    // Butiá: o cacho maduro nos butiazeiros da beira das clareiras e da picada.
    const near = trees.filter(t => t.art === 'butia' && trechoTrailDist(T, t.x, t.y + 34) < 130).sort((a, b) => a.x - b.x);
    near.filter((t, i) => i % Math.max(1, Math.floor(near.length / 2)) === 0).slice(0, 2).forEach((t, k) => T.resources.push({ id: 'b' + k, kind: 'butia', x: t.x, y: t.y + 34, tree: t }));
  }
  coleta.slice(0, 1).forEach((c, k) => { for (let j = 0; j < 12; j++) { const a = R() * Math.PI * 2, x = c.x + Math.cos(a) * c.rx * .92, y = c.y + Math.sin(a) * c.ry * .92; if (trechoTrailDist(T, x, y) < 70) continue; T.resources.push({ id: 'm' + k, kind: 'colmeia', x, y, tree: null }); break; } });
  // Baú de mateiro: às vezes, no fundo de um ramal (longe da picada e do que tem pra colher).
  coleta.forEach((c, k) => {
    if (R() > TRECHO_CHEST_CHANCE) return;
    for (let j = 0; j < 16; j++) { const at = inClear(c, .6); if (trechoTrailDist(T, at.x, at.y) < 50 || T.resources.some(r => Math.hypot(r.x - at.x, r.y - at.y) < 90)) continue; T.chests.push({ id: 'bau' + k, ...at }); break; }
  });
  // O mato baixo, as pedras, a taboa do arroio e os troncos caídos.
  for (let k = 0; k < (biome === 'restinga' ? 620 : 380 + n * 8); k++) {
    const x = 40 + R() * (W - 80), y = 120 + R() * (H - 160), dt = trechoTrailDist(T, x, y);
    if (dt < 6 || !riverOK(x, y, 26) || !seaOK(x, y, -150) || trees.some(t => Math.hypot(t.x - x, t.y - y) < 40) || nearRes(x, y, 40)) continue;
    const clear = trechoInClearing(T, x, y), near = dt < 60, art = trechoBrushArt(biome, clear, near, R), w = Math.round((60 + R() * 46) / 8) * 8;
    if (clear && biome !== 'restinga' && R() < .5) continue;
    brush.push({ x, y, ...art, w, h: Math.round(w * .72) });
  }
  for (let k = 0; k < (biome === 'restinga' ? 6 : 14 + n); k++) {
    const x = 60 + R() * (W - 120), y = 160 + R() * (H - 220);
    if (trechoTrailDist(T, x, y) < 20 || !riverOK(x, y, 20) || !seaOK(x, y) || trechoInClearing(T, x, y, .8) || trees.some(t => Math.hypot(t.x - x, t.y - y) < 70) || nearRes(x, y, 60)) continue;
    rocks.push({ x, y, w: Math.round((70 + R() * 60) / 8) * 8, solid: R() < .5 });
  }
  if (T.river) for (let yy = 60; yy < H; yy += 70 + R() * 40) for (const side of [-1, 1]) { if (Math.abs(yy - T.crossing.y) < 110 || R() < .25 || beach && yy > TRECHO.shoreY - 230) continue; reeds.push({ x: trechoRiverX(T, yy) + side * (trechoRiverHalf(T, yy) + 18 + R() * 14), y: yy + R() * 20, w: Math.round((54 + R() * 30) / 8) * 8 }); }
  // Tronco caído na beira da clareira, nunca na entrada do ramal.
  if (biome !== 'restinga') for (const c of T.clearings.filter(c => c.id.startsWith('coleta')).slice(0, 2)) for (let k = 0; k < 12; k++) { const a = R() * Math.PI * 2, l = { x: c.x + Math.cos(a) * c.rx * .75, y: c.y + Math.sin(a) * c.ry * .75, w: 140 + R() * 50, a: (R() - .5) * .5 }; if ([-.5, 0, .5].every(t => trechoTrailDist(T, l.x + Math.cos(l.a) * t * l.w, l.y + Math.sin(l.a) * t * l.w) > 40) && !T.resources.some(r => Math.hypot(r.x - l.x, r.y - l.y) < 120) && !T.chests.some(r => Math.hypot(r.x - l.x, r.y - l.y) < 120)) { logs.push(l); break; } }
  const grid = new Map(), add = (o, r) => { const k = Math.floor(o.x / 160) + ':' + Math.floor(o.y / 160); if (!grid.has(k)) grid.set(k, []); grid.get(k).push({ x: o.x, y: o.y, r }); };
  for (const t of trees) add(t, t.art === 'jeriva' ? 16 : 22);
  for (const r of rocks) if (r.solid) add({ x: r.x, y: r.y - 6 }, r.w * .32);
  for (const l of logs) for (let k = -2; k <= 2; k++) add({ x: l.x + Math.cos(l.a) * k * l.w / 5, y: l.y + Math.sin(l.a) * k * l.w / 5 }, 20);
  T.flora = { trees, brush, rocks, reeds, logs, grid };
  // Grade do que é picada ou clareira (o resto é mato cerrado), riscada segmento a segmento.
  const cw = Math.ceil(W / 20), ch = Math.ceil(H / 20), open = new Uint8Array(cw * ch);
  for (const t of T.trails) for (let i = 0; i < t.pts.length - 1; i++) {
    const [ax, ay] = t.pts[i], [bx, by] = t.pts[i + 1], r = t.half + 30, dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1;
    for (let gy = Math.max(0, Math.floor((Math.min(ay, by) - r) / 20)); gy <= Math.min(ch - 1, Math.floor((Math.max(ay, by) + r) / 20)); gy++) for (let gx = Math.max(0, Math.floor((Math.min(ax, bx) - r) / 20)); gx <= Math.min(cw - 1, Math.floor((Math.max(ax, bx) + r) / 20)); gx++) {
      const x = gx * 20 + 10, y = gy * 20 + 10, k = clamp(((x - ax) * dx + (y - ay) * dy) / L, 0, 1); if (Math.hypot(x - ax - dx * k, y - ay - dy * k) < r) open[gy * cw + gx] = 1;
    }
  }
  for (const c of T.clearings) for (let gy = Math.max(0, Math.floor((c.y - c.ry) / 20)); gy <= Math.min(ch - 1, Math.floor((c.y + c.ry) / 20)); gy++) for (let gx = Math.max(0, Math.floor((c.x - c.rx) / 20)); gx <= Math.min(cw - 1, Math.floor((c.x + c.rx) / 20)); gx++) if (((gx * 20 + 10 - c.x) / c.rx) ** 2 + ((gy * 20 + 10 - c.y) / c.ry) ** 2 < 1) open[gy * cw + gx] = 1;
  // O mar não se anda.
  if (beach) for (let gy = 0; gy < ch; gy++) for (let gx = 0; gx < cw; gx++) if (gy * 20 + 10 > trechoShoreY(gx * 20 + 10) - 24) open[gy * cw + gx] = 0;
  T.open = { cw, ch, cells: open };
  // Tudo o que dá pra colher (e os baús) precisa ser alcançável da entrada: busca rápida na grade.
  const solidAt = (x, y) => { const gx = Math.floor(x / 160), gy = Math.floor(y / 160); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const o of grid.get((gx + i) + ':' + (gy + j)) || []) if (Math.hypot(o.x - x, (o.y - y) * 1.15) < o.r) return true; return false; };
  const crossZone = (x, y) => T.crossing && Math.abs(y - T.crossing.y) < 40 && Math.abs(x - trechoRiverX(T, T.crossing.y)) < trechoRiverHalf(T, T.crossing.y) + 52;
  const pass = (gx, gy) => { const x = gx * 20 + 10, y = gy * 20 + 10; if (!open[gy * cw + gx] && !crossZone(x, y)) return false; if (T.river && Math.abs(x - trechoRiverX(T, y)) < trechoRiverHalf(T, y) + 6 && !crossZone(x, y)) return false; return !solidAt(x, y); };
  const seen = new Uint8Array(cw * ch), q = [[Math.floor(90 / 20), Math.floor(yIn / 20)]]; seen[q[0][1] * cw + q[0][0]] = 1;
  while (q.length) { const [gx, gy] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = gx + dx, ny = gy + dy; if (nx < 0 || ny < 0 || nx >= cw || ny >= ch || seen[ny * cw + nx] || !pass(nx, ny)) continue; seen[ny * cw + nx] = 1; q.push([nx, ny]); } }
  const reached = (x, y) => { for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const gx = Math.floor(x / 20) + i, gy = Math.floor(y / 20) + j; if (gx >= 0 && gy >= 0 && gx < cw && gy < ch && seen[gy * cw + gx]) return true; } return false; };
  T.resources = T.resources.filter(r => reached(r.x, r.y + (r.kind === 'colmeia' ? 20 : 0))); T.chests = T.chests.filter(c => reached(c.x, c.y));
  return T;
}
let trechoCache = null;
function trechoLayout(n = trechoN()) {
  const key = n + ':' + G.day; if (trechoCache?.key === key) return trechoCache;
  trechoCache = trechoGen(n); trechoCache.key = key; for (const t of trechoTiles.values()) t.width = t.height = 0; trechoTiles.clear(); return trechoCache;
}
function trechoOpen(T, x, y) { const o = T.open, gx = Math.floor(x / 20), gy = Math.floor(y / 20); if (gx < 0 || gy < 0 || gx >= o.cw || gy >= o.ch) return Math.abs(y - (x < 0 ? T.yIn : T.yOut)) < 60; return o.cells[gy * o.cw + gx] === 1; }
function trechoOnCrossing(T, x, y) { const c = T.crossing; if (!c) return false; return Math.abs(y - c.y) < 40 && Math.abs(x - trechoRiverX(T, c.y)) < trechoRiverHalf(T, c.y) + 52; }
function trechoPlantGrown(n) { const p = mataState().plant[n]; return !!p && G.day - p.day >= 3; }
// O fogo do acampamento espanta os bichos: dentro da clareira (sem chefe vivo), ninguém ataca.
function trechoCampSafe(T = trechoLayout(), x = worldOut?.x, y = worldOut?.y) { const c = T.camp; return !!c && (!T.boss || trechoBossDone(T.boss)) && ((x - c.x) / (c.rx * 1.05)) ** 2 + ((y - c.y) / (c.ry * 1.05)) ** 2 < 1; }

// ---------- Desenho do trecho ----------
// O chão, a água, as árvores e o mato de cada região ficam em mata-biomas.js; aqui, o que é igual em todas.
const trechoTiles = new Map(), TRECHO_TILE_LIMIT = 24;
function trechoRiverPath(T, expand = 0) {
  T.riverPaths ??= new Map(); if (T.riverPaths.has(expand)) return T.riverPaths.get(expand);
  const p = new Path2D(), L = [], Rr = [], y1 = T.beach ? TRECHO.shoreY + 30 : T.H + 40; for (let y = -40; y <= y1; y += 14) { const x = trechoRiverX(T, y), h = trechoRiverHalf(T, y) + expand + Math.sin(y / 23) * 2; L.push([x - h, y]); Rr.push([x + h, y]); }
  p.moveTo(...L[0]); for (const q of L) p.lineTo(...q); for (const q of Rr.reverse()) p.lineTo(...q); p.closePath(); T.riverPaths.set(expand, p); return p;
}
function paintTrechoTerrain(T, view) {
  const { x, y, w, h } = view;
  frontierTexture(0, x, y, w, h);
  ctx.fillStyle = `rgba(14,34,20,${.3 + Math.min(.25, T.n * .012)})`; ctx.fillRect(x, y, w, h);
  for (const [expand, alpha] of [[16, .12], [9, .28], [4, .55], [0, 1]]) for (const t of T.trails) { ctx.save(); ctx.clip(t.path(expand)); ctx.globalAlpha = alpha; frontierTexture(1, x, y, w, h); ctx.restore(); }
  if (T.river) for (const [expand, material, alpha] of [[28, 3, .2], [17, 3, .55], [8, 3, 1], [0, 2, 1]]) { ctx.save(); ctx.clip(trechoRiverPath(T, expand)); ctx.globalAlpha = alpha; frontierTexture(material, x, y, w, h); ctx.restore(); }
}
function drawTrechoTerrain(T, view) {
  if (!WORLD_ART['frontier-terrain']?.naturalWidth || !WORLD_ART['frontier-flora']?.naturalWidth) { rect(view.x, view.y, view.w, view.h, '#34502a'); return; }
  const size = 512, pad = 3;
  for (let row = Math.max(0, Math.floor(view.y / size)); row < Math.min(Math.ceil(T.H / size), Math.ceil((view.y + view.h) / size)); row++) for (let col = Math.max(0, Math.floor(view.x / size)); col < Math.min(Math.ceil(T.W / size), Math.ceil((view.x + view.w) / size)); col++) {
    const key = col + ':' + row, x = col * size, y = row * size, w = Math.min(size, T.W - x), h = Math.min(size, T.H - y);
    let tile = trechoTiles.get(key);
    if (!tile) { tile = document.createElement('canvas'); tile.width = w + pad * 2; tile.height = h + pad * 2; const main = ctx; ctx = tile.getContext('2d'); ctx.translate(pad - x, pad - y); try { paintTrechoTerrain(T, { x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2 }); } finally { ctx = main; } }
    trechoTiles.delete(key); trechoTiles.set(key, tile);
    while (trechoTiles.size > TRECHO_TILE_LIMIT) { const k = trechoTiles.keys().next().value, old = trechoTiles.get(k); trechoTiles.delete(k); old.width = old.height = 0; }
    drawTileSnapped(tile, pad, pad, w, h, x, y);
  }
}
function drawTrechoWater(T, view) {
  if (!T.river) return; ctx.save(); ctx.clip(trechoRiverPath(T)); ctx.fillStyle = 'rgba(200,226,214,.32)';
  for (let k = 0; k < 70; k++) { const yy = (k * 97 + frameClock * 34) % (T.H + 80) - 40; if (yy < view.y - 30 || yy > view.y + view.h + 30) continue; ctx.fillRect(trechoRiverX(T, yy) + (frontierNoise(k, 7) - .5) * trechoRiverHalf(T, yy) * 1.4, yy, 1.5, 10 + k % 9); }
  ctx.restore();
}
function drawTrechoCrossing(T) {
  const c = T.crossing; if (!c) return; const cx = trechoRiverX(T, c.y), half = trechoRiverHalf(T, c.y);
  for (let k = -2; k <= 2; k++) { const x = cx + k * half * .52, w = 22 + (k + 3) % 3 * 4; ellipse(x + 2, c.y + 6, w, 9, 'rgba(10,20,20,.35)'); ellipse(x, c.y, w, 12, '#8a8a80'); ellipse(x - 4, c.y - 3, w * .55, 5, '#aaa89c'); }
}
function drawTrechoResource(T, r) {
  if (trechoDay(T.n).got.includes(r.id)) { if (r.kind === 'colmeia') drawColmeia(r, true); return; }
  if (r.kind === 'pinha') { for (let k = 0; k < 3; k++) { const x = r.x + (k - 1) * 13, y = r.y + (k % 2) * 6; ellipse(x, y + 3, 10, 4, 'rgba(20,14,8,.35)'); ellipse(x, y - 3, 10, 8, '#6a4424'); for (let j = 0; j < 3; j++) ellipse(x - 4 + j * 4, y - 5 + (j % 2) * 3, 2, 2, '#9a6a3a'); } return; }
  if (r.kind === 'erva') { ellipse(r.x, r.y + 2, 30, 8, 'rgba(10,14,8,.35)'); rect(r.x - 4, r.y - 46, 8, 48, '#6a4a2a', 2); for (const [dx, dy, s] of [[-18, -60, 22], [16, -64, 22], [0, -82, 24], [-6, -50, 18], [12, -46, 18]]) ellipse(r.x + dx, r.y + dy, s, s * .75, '#3e7a34'); for (let k = 0; k < 9; k++) ellipse(r.x - 22 + (k * 37) % 44, r.y - 84 + (k * 23) % 44, 5, 3, '#5aa046'); return; }
  if (r.kind === 'colmeia') drawColmeia(r, false);
}
// Colmeia de jataí: um tubinho de cera saindo do tronco, com as abelhinhas em volta.
function drawColmeia(r, done) {
  const x = r.x + 14, y = r.y - 70; rect(x - 4, y - 4, 16, 14, '#3a2a14', 3); ctx.fillStyle = done ? '#7a6a3a' : '#d8b048'; ctx.beginPath(); ctx.moveTo(x + 4, y + 2); ctx.lineTo(x + 20, y - 4); ctx.lineTo(x + 20, y + 8); ctx.closePath(); ctx.fill();
  if (!done) for (let k = 0; k < 6; k++) { const a = frameClock * 5 + k, rr = 10 + k * 3; ellipse(x + 22 + Math.cos(a) * rr, y + Math.sin(a * 1.4) * rr * .6, 1.6, 1.2, '#f0d060'); }
}
function drawTrechoCamp(T) {
  const c = T.camp; if (!c) return; const fx = c.x - 60, fy = c.y + 30;
  if (!worldSprite('rural', 6, fx - 70, fy - 110, 140, 110)) sceneFire(fx, fy);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(fx, fy - 30, 160, .35 + .06 * Math.sin(frameClock * 9), '255,150,60'); ctx.restore();
  // A barraca de lona e o banco de tronco.
  const bx = c.x + 110, by = c.y - 10; ellipse(bx, by + 4, 76, 14, 'rgba(10,14,8,.35)'); ctx.fillStyle = '#c8b890'; ctx.beginPath(); ctx.moveTo(bx - 70, by); ctx.lineTo(bx, by - 96); ctx.lineTo(bx + 70, by); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#a89870'; ctx.beginPath(); ctx.moveTo(bx - 16, by); ctx.lineTo(bx, by - 70); ctx.lineTo(bx + 16, by); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#5a4a30'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 70, by); ctx.lineTo(bx, by - 96); ctx.lineTo(bx + 70, by); ctx.stroke();
  drawMataLog({ x: fx + 10, y: fy + 70, w: 120, a: .05 });
}
function drawTrechoTocos(T) {
  const c = T.tocos; if (!c) return; const p = mataState().plant[T.n], grown = trechoPlantGrown(T.n);
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2 + .4, x = c.x + Math.cos(a) * c.rx * .55, y = c.y + Math.sin(a) * c.ry * .5;
    if (p && grown) { worldTreeSprite(1, x, y, 90, 128); continue; }
    ellipse(x, y + 4, 24, 8, 'rgba(10,14,8,.35)'); ellipse(x, y - 6, 22, 14, '#6a4628'); ellipse(x, y - 10, 18, 9, '#a07a4a'); ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x, y - 10, 10, 5, 0, 0, Math.PI * 2); ctx.stroke();
    if (p) { rect(x - 2, y - 40, 4, 30, '#5a3a20', 1); for (const s of [-1, 1]) ellipse(x + s * 8, y - 38, 9, 4, '#3e7a34'); }
  }
}
function trechoPlaca(x, y, text, w = 200) { mataPlaca(x, y, text, w); }
// Árvore, mato e taboa de cada região (mata-biomas.js troca pelo desenho certo).
function drawTrechoTree(T, t) { worldTreeSprite(t.kind, t.x, t.y, t.w, t.h); }
function drawTrechoBrush(T, b) { worldSprite('frontier-flora', b.i % 6, b.x - b.w / 2, b.y - b.h, b.w, b.h); }
function drawTrechoReed(T, r) { worldSprite('frontier-flora', 2, r.x - r.w / 2, r.y - r.w * .85, r.w, r.w * .85); }
function drawTrecho(view, seen, layers) {
  const T = trechoLayout(); drawTrechoTerrain(T, view); drawTrechoWater(T, view); drawTrechoCrossing(T);
  const F = T.flora;
  for (const t of F.trees) if (seen(t.x, t.y, t.w)) layers.push({ y: t.y, draw: () => drawTrechoTree(T, t) });
  for (const b of F.brush) if (seen(b.x, b.y, 80)) layers.push({ y: b.y, draw: () => drawTrechoBrush(T, b) });
  for (const r of F.reeds) if (seen(r.x, r.y, 80)) layers.push({ y: r.y, draw: () => drawTrechoReed(T, r) });
  for (const r of F.rocks) if (seen(r.x, r.y, 120)) layers.push({ y: r.y, draw: () => worldSprite('frontier-flora', 3, r.x - r.w / 2, r.y - r.w * .62, r.w, r.w * .7) });
  for (const l of F.logs) if (seen(l.x, l.y, 200)) layers.push({ y: l.y + 8, draw: () => drawMataLog(l) });
  for (const c of T.chests) if (seen(c.x, c.y, 120)) layers.push({ y: c.y, draw: () => drawCaveChest({ x: c.x, y: c.y, open: trechoDay(T.n).got.includes(c.id) }) });
  for (const r of T.resources) if (r.kind !== 'butia' && seen(r.x, r.y, 200)) layers.push({ y: r.kind === 'colmeia' ? r.y + 1 : r.y - 4, draw: () => drawTrechoResource(T, r) });
  // No trecho do chefe, a clareira é a arena: o fogo e a barraca só aparecem depois da vitória.
  if (T.camp && (!T.boss || trechoBossDone(T.boss)) && seen(T.camp.x, T.camp.y, 500)) layers.push({ y: T.camp.y + 20, draw: () => drawTrechoCamp(T) });
  if (T.tocos && seen(T.tocos.x, T.tocos.y, 400)) layers.push({ y: T.tocos.y, draw: () => drawTrechoTocos(T) });
  // Sem placa de trecho: só a da entrada, apontando o caminho de volta pro refúgio.
  if (T.n === 2) layers.push({ y: T.yIn + 120, draw: () => trechoPlaca(150, T.yIn + 120, '← REFÚGIO DO GARIBALDI', 250) });
  if (mataCombatOn() && !scene) drawMataNightLayers(layers, seen);
  // Escuro da mata fechada, por baixo da noite: o lampião e o tição abrem a luz.
  layers.push({ y: 8e9, draw: () => drawTrechoDark(T) });
}
function trechoDarkness(T = trechoLayout()) { return trechoDay(T.n).ticao ? .3 : T.dark; }
// O azul da noite que o mundo pinta por cima quando escurece (drawOutside): lá dentro, a mata completa até ficar noite
// fechada a qualquer hora, sem escurecer em dobro quando a noite é de verdade.
function mataWorldNightTint() { return G.phase === 'closed' ? .5 : G.phase === 'open' ? clamp((G.elapsed / DAY - .7) * 1.2, 0, .35) : 0; }
function mataNightVeil(view, target = .5) { const a = 1 - (1 - target) / (1 - mataWorldNightTint()); if (a > 0) rect(view.x - 40, view.y - 40, view.w + 80, view.h + 80, `rgba(12,20,52,${a})`); }
// O raio de luz em volta do Sadi: o lampião da ferraria abre bem; o lunar do Sepé (mata-acampamentos.js) ajuda um pouco.
function trechoLight() { const lamp = caveUp('lampiao'), sepe = typeof mataFolk === 'function' && mataFolk('sepe'); return [(lamp ? 260 : 120) + (sepe ? 50 : 0), (lamp ? 760 : 470) + (sepe ? 110 : 0)]; }
function drawTrechoDark(T) {
  if (scene) return; const p = worldOut, view = { x: p.x - 3000, y: p.y - 3000, w: 6000, h: 6000 };
  mataNightVeil(view, T.biome === 'restinga' ? .42 : .5);
  // A sombra da mata em volta do Sadi: o lampião abre a luz; o fogo do acampamento clareia a clareira inteira.
  let a = trechoDarkness(T);
  if (T.camp && ((p.x - T.camp.x) / (T.camp.rx * 1.1)) ** 2 + ((p.y - T.camp.y) / (T.camp.ry * 1.1)) ** 2 < 1) a *= .35;
  const [r0, r1] = trechoLight();
  darkHole(p.x, p.y - 40, r0, r1, '4,8,6', a);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (T.camp && (!T.boss || trechoBossDone(T.boss))) glow(T.camp.x - 60, T.camp.y, 300, .2 + .04 * Math.sin(frameClock * 9), '255,150,60');
  ctx.restore();
}

// ---------- O mapa ----------
WORLD_MAPS.trecho = {
  id: 'trecho', name: 'Mata adentro', W: TRECHO.W, H: TRECHO.H,
  spawn() { return { x: 90, y: trechoLayout().yIn }; },
  canWalk(x, y) {
    const T = trechoLayout(); if (y < 60 || y > T.H - 24 || x < -30 || x > T.W + 30) return false;
    if (x < 40 && Math.abs(y - T.yIn) > 55) return false; if (x > T.W - 40 && Math.abs(y - T.yOut) > 55) return false;
    if (!trechoOpen(T, x, y) && !trechoOnCrossing(T, x, y)) return false;   // mato cerrado fora das picadas
    if (T.river && Math.abs(x - trechoRiverX(T, y)) < trechoRiverHalf(T, y) + 6 && !trechoOnCrossing(T, x, y)) return false;
    return !mataSolid(x, y);
  },
  edge(p) {
    const T = trechoLayout(), n = T.n;
    if (p.x < 10) { if (n === 2) return { map: 'mata', x: MATA.W - 70, y: 770, title: 'Mata de Araucárias', text: 'O pinheiral do Garibaldi: aqui a mata é mansa.' }; return { map: 'trecho', trecho: n - 1, x: TRECHO.W - 70, y: trechoExitY(n - 1), title: TRECHO_BIOME_NAMES[trechoBiome(n - 1)], text: 'Voltando pela picada.' }; }
    if (p.x > T.W - 12) {
      if (T.boss && !trechoBossDone(T.boss)) { trechoSay(T.boss === 'cachaco' ? 'O Javali Cachaço fuça no meio do trecho: enquanto ele mandar aqui, ninguém passa.' : 'O Lagarto do papo-amarelo guarda a descida: não se passa.'); return null; }
      if (n >= TRECHO.last) return { map: 'laguna', x: 90, y: LAGUNA.entryY, title: 'Barra de Laguna', text: 'O mar! A areia branca e, lá longe, um navio parado na barra.' };
      const e = trechoEnds(n + 1), novo = trechoBiome(n + 1) !== T.biome; return { map: 'trecho', trecho: n + 1, x: 90, y: e.yIn, title: TRECHO_BIOME_NAMES[trechoBiome(n + 1)], text: novo ? TRECHO_BIOME_TEXT[trechoBiome(n + 1)] : pick(TRECHO_DEEPER) };
    }
    return null;
  },
  spots() { return trechoSpots(); },
  draw(view, seen, layers) { drawTrecho(view, seen, layers); },
  onEnter() { trechoEnter(); }
};
REGION_NAMES.trecho = 'Mata adentro';
let trechoSayAt = 0;
function trechoSay(text) { if (performance.now() - trechoSayAt < 3500) return; trechoSayAt = performance.now(); floatNote(text); AudioEngine.bad?.(); }
const TRECHO_DEEPER = ['Mais fundo na mata.', 'A picada segue mato adentro.', 'O mato fecha de novo atrás de ti.', 'Cheiro de terra molhada e bicho por perto.'];
function trechoTitleText(n) { const b = trechoBiome(n); return TRECHO_BIOME_NAMES[b] + ' · ' + TRECHO_BIOME_TEXT[b] + (TRECHO_BOSSES[n] && !trechoBossDone(TRECHO_BOSSES[n]) ? ' Tem coisa grande no meio da picada.' : TRECHO.camps.includes(n) ? ' Há um acampamento neste trecho.' : ''); }
function trechoBossDone(boss) { return !!mataState()[boss]; }
// Os chefes (Javali Cachaço no 7, Lagarto do papo-amarelo no 13) moram em mata-chefes.js.
function trechoBossEnter(T) {}
function trechoBossSpawn(T, N) {}
function trechoEnter() {
  const st = mataState(), T = trechoLayout(), n = T.n;
  if (n > st.deepest) {
    st.deepest = n; mataXP(25); save();
    if (n === 2) floatNote('Mata adentro, facão na mão! Aqui é mato cerrado: só se anda pelas picadas e clareiras. E cada trecho é outro a cada dia.');
    else if (n === 12 || n === 22) showBanner(TRECHO_BIOME_NAMES[T.biome], TRECHO_BIOME_TEXT[T.biome], 'level', { world: true });
  }
  if (T.camp && !st.camps[n] && (!T.boss || trechoBossDone(T.boss))) floatNote('Tem acampamento no meio desse trecho: o fogo de chão espanta os bichos e fica marcado no refúgio do Garibaldi.');
  trechoBossEnter(T);
}
// Os pontos de E do trecho.
function trechoSpots() {
  const T = trechoLayout(), d = trechoDay(T.n), list = [];
  for (const r of T.resources) {
    if (d.got.includes(r.id)) continue;
    const label = r.kind === 'pinha' ? 'Juntar pinhão' : r.kind === 'erva' ? 'Colher erva-mate nativa' : r.kind === 'butia' ? 'Colher butiá' : 'Tirar mel de jataí';
    list.push({ id: 'res:' + r.id, x: r.x, y: r.y + (r.kind === 'colmeia' ? 20 : 0), radius: 90, label, act: () => trechoCollect(T, r) });
  }
  for (const c of T.chests) if (!d.got.includes(c.id)) list.push({ id: 'bau:' + c.id, x: c.x, y: c.y + 10, radius: 95, label: 'Abrir o baú', act: () => trechoOpenChest(T, c) });
  if (T.camp && (!T.boss || trechoBossDone(T.boss))) {
    list.push({ id: 'camp:fogo', x: T.camp.x - 60, y: T.camp.y + 70, radius: 110, label: 'Descansar no acampamento', act: () => trechoRest(T) });
    list.push({ id: 'camp:volta', x: T.camp.x + 110, y: T.camp.y + 30, radius: 100, label: 'Voltar pro refúgio do Garibaldi', act: () => mataGoRancho() });
  }
  if (T.tocos) list.push({ id: 'tocos', x: T.tocos.x, y: T.tocos.y + 20, radius: 140, label: trechoTocosLabel(T), act: () => trechoPlant(T) });
  return list;
}
// Baú de mateiro: quanto mais fundo, mais moeda, mais coisa pro bornal, minério melhor e mais chance de figurinha.
function trechoChestLoot(n) {
  const deep = n >= 22 ? 2 : n >= 12 ? 1 : 0, roll = () => Math.random(), loot = { cash: Math.round((12 + n * 3 + roll() * 20) * (caveUp('guaiaca') ? 1.3 : 1)), items: {}, butia: 0, cards: [] };
  for (let k = 0; k < 1 + deep; k++) { const it = MATA_ITEMS[Math.floor(roll() * (deep ? MATA_ITEMS.length : 2))].id; loot.items[it] = (loot.items[it] || 0) + 1; }
  if (roll() < .6) loot.butia = 1 + Math.floor(roll() * (1 + deep));
  const ores = [['cobre', 'ferro'], ['ferro', 'ametista', 'opala'], ['agata', 'opala', 'ouro']][deep], ore = ores[Math.floor(roll() * ores.length)];
  if (roll() < .45 + deep * .15) loot[ore] = 1 + Math.floor(roll() * (ore === 'ouro' || ore === 'opala' ? 1 : 2));
  if (roll() < .2 + n * .015) { const c = randomLooseCard(); if (c) loot.cards.push(c); }
  return loot;
}
function trechoOpenChest(T, c) {
  const d = trechoDay(T.n); if (d.got.includes(c.id)) return; d.got.push(c.id);
  const loot = trechoChestLoot(T.n), bag = mataBag(), extra = [];
  G.cash = round(G.cash + loot.cash); for (const k of CAVE_MINERALS) if (loot[k]) bagAdd(k, loot[k]);
  for (const [id, q] of Object.entries(loot.items)) { const room = Math.max(0, mataBagMax() - (bag[id] || 0)), got = Math.min(q, room); if (!got) continue; bag[id] = (bag[id] || 0) + got; const it = MATA_ITEMS.find(i => i.id === id); extra.push([mataGearHTML(id, 34), got, it.name.toLowerCase()]); }
  if (loot.butia) { bagAdd('butia', loot.butia); extra.push([itemIconHTML('butia'), loot.butia, loot.butia > 1 ? 'butiás (curam)' : 'butiá (cura)']); }
  loot.cards = loot.cards.filter(id => giveCard(id, 'baú da mata'));
  AudioEngine.caveChestOpen?.(); fxStars(c.x, c.y - 50, 6); mataXP(4); mataBeltRefresh(); save(); refreshHUD();
  const tiles = [...caveLootTiles(loot), ...extra];
  talk([['card', `<b>🧰 Baú de mateiro</b><br>Escondido no fundo do ramal, um baú de tropeiro coberto de folha. Dentro tinha:<div class="bag-grid cave-loot">${tiles.map(([icon, big, small]) => `<div class="bag-item">${icon}<b>${big}</b><small>${small}</small></div>`).join('')}</div>`, TRECHO_BIOME_NAMES[T.biome]]], null, 'Guardar');
}
function trechoCollect(T, r) {
  const d = trechoDay(T.n);
  if (d.got.includes(r.id)) return;
  d.got.push(r.id); mataXP(2); const jasy = mataFolk('jasy') ? 1 : 0;
  if (r.kind === 'pinha') { const g = Math.round((150 + Math.random() * 200) / 50) * 50; bagAdd('pinhao', g); effect('+' + formatWeight(g) + ' de pinhão', r.x, r.y - 50, '#ffe2a6', 16); AudioEngine.pop?.(1800, .06, .04); }
  else if (r.kind === 'erva') { const q = 1 + (Math.random() < .4 ? 1 : 0) + jasy; bagAdd('erva_verde', q); effect('+' + q + ' ramos de erva-mate', r.x, r.y - 90, '#d8ffac', 16); AudioEngine.swoosh?.(.04); }
  else if (r.kind === 'butia') { const q = Math.random() < .3 ? 2 : 1; bagAdd('butia', q); effect('+' + q + (q > 1 ? ' butiás' : ' butiá') + ' · cura ' + BUTIA_HEAL + ' de vida', r.x, r.y - 140, '#ffd27a', 16); AudioEngine.pop?.(1500, .06, .04); }
  else { const q = 1 + (jasy && Math.random() < .5 ? 1 : 0); AudioEngine.hiss?.(.6, .03, 900); fxPuffs(r.x + 20, r.y - 70, 10, 80, '#d8d4cc'); bagAdd('mel', q); effect('+' + q + (q > 1 ? ' potes' : ' pote') + ' de mel de jataí', r.x, r.y - 110, '#ffe27a', 16); }
  save(); refreshHUD();
}
function trechoRest(T) {
  const st = mataState(), first = !st.camps[T.n]; caveState().hp = caveMaxHp(); st.camps[T.n] = true; mataBuffs.regen = 0; mataBuffs.veneno = 0; AudioEngine.ready?.(); save();
  effect('Vida cheia', worldOut.x, worldOut.y - 130, '#d8ffac', 18);
  if (first) talk([['card', '<b>🔥 ' + trechoCampName(T.n) + '</b><br>Fogo aceso, chimarrão na mão e a vida cheia. O acampamento ficou marcado: do refúgio do Garibaldi dá pra vir direto pra cá pela mesa de mapas.', TRECHO_BIOME_NAMES[T.biome]]], null, 'Bah, que beleza');
}
function trechoTocosLabel(T) { const p = mataState().plant[T.n]; return !p ? 'Clareira de tocos · plantar pinhão (1 kg)' : trechoPlantGrown(T.n) ? 'Mudas de araucária crescendo' : 'Pinhão plantado · as mudas brotam em ' + Math.max(1, 3 - (G.day - p.day)) + ' dia(s)'; }
function trechoPlant(T) {
  const st = mataState(), p = st.plant[T.n];
  if (!p) {
    if ((G.stock.pinhao || 0) < 1000) { worldSay('Pra replantar a clareira de tocos precisa de 1 kg de pinhão. Junta pinhão pelo pinheiral.'); return; }
    G.stock.pinhao -= 1000; st.plant[T.n] = { day: G.day }; mataXP(10); AudioEngine.thud?.(); fxPuffs(T.tocos.x, T.tocos.y, 12, 120, '#7a5a3a');
    talk([['card', '<b>🌱 Clareira replantada</b><br>O Sadi enterrou o pinhão entre os tocos, como a gralha-azul faz (só que lembrando onde). Em três dias as mudas brotam, e a clareira volta a dar pinhão.', 'Mata adentro']], null, 'Que cresçam fortes');
    save(); return;
  }
  if (!trechoPlantGrown(T.n)) { worldSay('As mudas ainda estão nascendo. Volta em ' + Math.max(1, 3 - (G.day - p.day)) + ' dia(s).'); return; }
  if (!p.thanked) { p.thanked = G.day; const rw = { cash: 60, xp: 30 }; grantReward(rw); mataXP(20); save(); talk([['gralha', 'Grá! Grá! Tu plantou pinheiro igual a mim, gaúcho! Só que tu lembrou onde enterrou, hehe.'], ['gralha', 'Onde tem pinheiro novo, volta o pinhão, volta a gralha e a passarada. Toma, pra ajudar na próxima muda!'], ['reward', rw, 'Clareira replantada']], null, 'Valeu, gralha'); return; }
  worldSay('Pinheirinhos novos, fortes. Daqui uns anos, isso aqui dá pinhão de novo pra mata inteira.');
}

// ---------- Acampamentos e a mesa de mapas ----------
function mataGoRancho() { const p = garibaldiFront(); switchMap({ map: 'mata', x: p.x, y: p.y, title: 'Refúgio do Garibaldi', text: 'Trecho 1 · aqui a mata é mansa.' }); }
function mataGoCamp(n) {
  n = Number(n); if (!mataState().camps[n]) return; closeDialog(true);
  mataState().trecho = n; const T = trechoLayout(n);
  switchMap({ map: 'trecho', x: T.camp.x - 160, y: T.camp.y + 80, title: trechoCampName(n), text: TRECHO_BIOME_NAMES[trechoBiome(n)] });
}
// O nome do acampamento: de quem mora no fogo, depois que o Sadi conhece; antes, só a região.
function trechoCampName(n) { const f = typeof campFolk === 'function' ? campFolk(n) : null; return f && mataFolk(f.id) ? 'Fogo ' + (f.id === 'anita' ? 'da ' : 'do ') + f.name : 'Acampamento · ' + TRECHO_BIOME_NAMES[trechoBiome(n)]; }
function mataCampsDialog() {
  const st = mataState(), list = TRECHO.camps.filter(n => st.camps[n]);
  // Longe do refúgio (no marco da praia de Laguna), a primeira trilha volta pro começo da mata.
  const home = ['mata', 'casa:garibaldi'].includes(worldOut?.map) ? '' : `<div class="supply"><span class="icon"><span class="bag-emoji">🏕️</span></span><div><b>Refúgio do Garibaldi</b><p>${TRECHO_BIOME_NAMES.mata} · o começo da mata, onde ela é mansa.</p></div><button class="primary" data-act="mataRancho">Ir</button></div>`;
  openDialog('Trilhas e acampamentos', `<p>Fitas coloridas no mapa marcam os acampamentos que tu já acendeu. A picada até eles tá aberta.</p><div class="store-list">${home}${TRECHO.camps.filter(n => st.camps[n] || st.deepest >= n).map(n => `<div class="supply"><span class="icon"><span class="bag-emoji">${st.camps[n] ? '🔥' : '🌲'}</span></span><div><b>${trechoCampName(n)}</b><p>${TRECHO_BIOME_NAMES[trechoBiome(n)]} · ${st.camps[n] ? 'direto pro fogo de chão.' : 'descansa no fogo pra marcar.'}</p></div><button class="primary" data-act="mataCamp" data-id="${n}" ${st.camps[n] ? '' : 'disabled'}>${st.camps[n] ? 'Ir' : 'Fechado'}</button></div>`).join('')}</div>${list.length ? '' : '<p class="small-note">Os acampamentos ficam no meio da picada, mata adentro: descansa no fogo pra marcar no mapa.</p>'}`, 'mataCamps');
}


// ---------- Bichos do trecho ----------
// Pinheiral: javali, jararaca, cobra-coral, ouriço-cacheiro, onça, queixadas e, do 4 em diante, o corpo-seco. Encosta: teiú,
// onça em dupla e corpo-seco. Restinga: teiús, cascavéis na areia, corais e corpo-seco. Lá dentro é sempre noite, então os
// bichos são os mesmos a qualquer hora; na lua cheia, da encosta pra baixo, sai o lobisomem.
function trechoComposition(n) {
  const b = trechoBiome(n), c = { javali: 0, onca: 0, oncaPairs: 0, jararaca: 0, cascavel: 0, coral: 0, teiu: 0, ourico: 0, corposeco: 0, herds: 0, lobo: false };
  if (TRECHO_BOSSES[n] && !trechoBossDone(TRECHO_BOSSES[n])) return c;   // no trecho do chefe, só ele (mata-chefes.js)
  if (b === 'mata') Object.assign(c, { javali: 2 + (n >= 5 ? 1 : 0), onca: 1, jararaca: 2, coral: n >= 4 ? 1 : 0, ourico: n >= 5 ? 1 + (n >= 8 ? 1 : 0) : 0, corposeco: n >= 6 ? 1 : 0, herds: n >= 7 ? 1 : 0 });
  else if (b === 'encosta') Object.assign(c, { javali: 2, onca: 1, oncaPairs: n >= 15 ? 1 : 0, teiu: 2 + (n >= 16 ? 1 : 0), coral: 1, jararaca: 1, ourico: 1, corposeco: n >= 16 ? 2 : 1, herds: n >= 14 ? 1 : 0 });
  else Object.assign(c, { javali: 1, teiu: 3, cascavel: 2 + (n >= 27 ? 1 : 0), coral: 2, corposeco: 2, herds: n >= 24 ? 1 : 0 });
  c.lobo = b !== 'mata' && mataLuaCheia();
  return c;
}
// Quanto mais fundo, um pouco mais forte: vida e mordida crescem devagar, trecho a trecho.
function trechoStrength(n) { return { hp: 1 + (n - 2) * .045, dmg: 1 + (n - 2) * .018 }; }
function trechoSpot(T, R, minFrom = 420) {
  const ends = [{ x: 90, y: T.yIn }, { x: T.W - 90, y: T.yOut }];
  for (let k = 0; k < 90; k++) {
    const t = T.trails[Math.floor(R() * T.trails.length)], q = t.pts[Math.floor(R() * t.pts.length)], x = q[0] + (R() - .5) * 220, y = q[1] + (R() - .5) * 160;
    if (x < 150 || x > T.W - 150 || y < 140 || y > T.H - 80 || ends.some(e => Math.hypot(e.x - x, e.y - y) < minFrom) || T.camp && !T.boss && trechoInClearing({ clearings: [T.camp] }, x, y, 1.5) || !WORLD_MAPS.trecho.canWalk(x, y)) continue;
    return { x, y };
  }
  return null;
}
const TRECHO_START_STATE = { jararaca: 'hide', cascavel: 'hide', corposeco: 'buried', coral: 'roam' };
function trechoBeastsStart() {
  const T = trechoLayout(), n = T.n, d = trechoDay(n), killed = d.killed, R = caveRand(n * 811 + G.day * 313 + 7), c = trechoComposition(n);
  const beasts = [], herds = [], { hp: scale, dmg: dmgMul } = trechoStrength(n);
  const add = (kind, at, extra = {}) => { if (!at) return; const B = CAVE_BEASTS[kind], hp = Math.round(B.hp * scale); beasts.push({ kind, x: at.x, y: at.y, home: at, tx: at.x, ty: at.y, hp, max: hp, dx: R() < .5 ? -1 : 1, state: TRECHO_START_STATE[kind] || 'roam', t: R() * 2, vx: 0, vy: 0, hurt: 0, frame: R() * 3, cool: 0, attack: 0, dmgMul, ...extra }); };
  for (let k = 0; k < c.javali; k++) add('javali', trechoSpot(T, R));
  for (let k = 0; k < c.onca; k++) add('onca', trechoSpot(T, R, 520));
  for (let k = 0; k < c.oncaPairs; k++) { const at = trechoSpot(T, R, 560); if (!at) continue; add('onca', at); const b = { x: at.x + 70, y: at.y + 30 }; add('onca', WORLD_MAPS.trecho.canWalk(b.x, b.y) ? b : at); }
  // Cobras: na beira do arroio ou na beira da picada.
  const snake = () => { for (let k = 0; k < 60; k++) { let x, y; if (T.river && R() < .6) { y = 200 + R() * (T.H - 400); x = trechoRiverX(T, y) + (R() < .5 ? -1 : 1) * (trechoRiverHalf(T, y) + 50 + R() * 90); } else { const q = T.trails[0].pts[Math.floor(R() * T.trails[0].pts.length)], a = R() < .5 ? -1 : 1; x = q[0] + (R() - .5) * 60; y = q[1] + a * (TRECHO.half + 40 + R() * 60); } if (x > 300 && x < T.W - 300 && WORLD_MAPS.trecho.canWalk(x, y) && !beasts.some(b => Math.hypot(b.x - x, b.y - y) < 260) && !(T.crossing && Math.hypot(T.crossing.x - x, T.crossing.y - y) < 160) && !(T.camp && trechoInClearing({ clearings: [T.camp] }, x, y, 1.4))) return { x, y }; } return null; };
  for (let k = 0; k < c.jararaca; k++) add('jararaca', snake());
  for (let k = 0; k < c.cascavel; k++) add('cascavel', snake());
  for (let k = 0; k < c.coral; k++) add('coral', snake());
  for (let k = 0; k < c.teiu; k++) add('teiu', trechoSpot(T, R, 480));
  for (let k = 0; k < c.ourico; k++) add('ourico', trechoSpot(T, R, 480));
  for (let k = 0; k < c.corposeco; k++) add('corposeco', trechoSpot(T, R, 620));
  for (let k = 0; k < c.herds; k++) {
    const at = trechoSpot(T, R, 640); if (!at) continue; const h = { id: herds.length, tx: at.x, ty: at.y, state: 'roam', t: 2, cool: 0, vx: 1, vy: 0 }; herds.push(h);
    for (let j = 0; j < MATA_BICHOS.queixadas; j++) { const ox = (j % 3 - 1) * 46 + (j > 2 ? 23 : 0), oy = (j > 2 ? 38 : 0) - 10, ok = WORLD_MAPS.trecho.canWalk(at.x + ox, at.y + oy); add('queixada', { x: ok ? at.x + ox : at.x, y: ok ? at.y + oy : at.y }, { herd: h.id, ox, oy, state: 'roam' }); }
  }
  if (c.lobo) add('lobisomem', trechoSpot(T, R, 700), { hp: Math.round(CAVE_BEASTS.lobisomem.hp * 1.3 * scale), max: Math.round(CAVE_BEASTS.lobisomem.hp * 1.3 * scale) });
  beasts.forEach((b, i) => { b.idx = i; if (killed.includes(i)) b.hp = 0; });
  mataNight = { day: G.day, key: trechoKey(), trecho: n, beasts, drops: [], herds, shots: [], cd: 0, inv: 0, hurt: 0, swing: null };
  trechoBossSpawn(T, mataNight);
  if (c.lobo) setTimeout(() => { if (inTrecho()) { AudioEngine.caveVoice?.([300, 520, 560, 360], 1.8, { formant: 900, q: 1.5, vol: .06, vib: 12, rate: 6 }); floatNote('🌕 Lua cheia… um uivo comprido corta a mata. Lobisomem solto no trecho!'); } }, 1200);
}

// ---------- Bornal da mata (1 a 5; o butiá entra junto, mata-missao.js) ----------
function mataUseItem(id) {
  const bag = mataBag(); if (!(bag[id] > 0) || !mataHere() || scene || modal) return false;
  const st = caveState(), p = worldOut;
  if (id === 'marcela') { if (st.hp >= caveMaxHp() && !(mataBuffs.veneno > 0)) { floatNote('Vida cheia: guarda o chá pra hora do aperto.'); return false; } st.hp = Math.min(caveMaxHp(), st.hp + 30); mataBuffs.veneno = 0; effect('+30 ❤ chá de marcela', p.x, p.y - 140, '#d8ffac', 18); fxHearts?.(p.x, p.y - 120, 3); AudioEngine.caveHeal?.(); }
  else if (id === 'carqueja') { mataBuffs.regen = 20; effect('Carqueja: vida voltando', p.x, p.y - 140, '#d8ffac', 18); AudioEngine.boost?.(); }
  else if (id === 'fumo') { mataBuffs.fumo = 30; effect('Cheiro de fumo de rolo', p.x, p.y - 140, '#e8d8b0', 18); fxPuffs(p.x, p.y - 90, 10, 80, '#d8d4cc'); }
  else if (id === 'ticao') { if (!inTrecho()) { floatNote('Aqui no trecho 1 a mata ainda deixa o sol entrar: guarda o tição pros trechos fundos.'); return false; } trechoDay().ticao = true; effect('🔥 O trecho clareou!', p.x, p.y - 140, '#ffcf6a', 18); AudioEngine.ignite?.(); }
  bag[id]--; if (bag[id] <= 0) delete bag[id]; save(); mataBeltRefresh(); return true;
}
function mataBeltItems() { return MATA_ITEMS.filter(i => mataBag()[i.id] > 0); }
function mataBeltRefresh() {
  const el = $('mataBelt'); if (!el) return; const on = mataHere() && !scene && G?.mata, list = on ? mataBeltItems() : [];
  el.classList.toggle('hidden', !list.length);
  const html = list.map((i, k) => `<button type="button" data-act="mataUse" data-id="${i.id}" title="${i.name}"><small>${k + 1}</small>${mataGearHTML(i.id, 42)}<em>${mataBag()[i.id]}</em></button>`).join('');
  if (el.dataset.html !== html) { el.dataset.html = html; el.innerHTML = html; }
}

// ---------- Ligações ----------
{
  // Os dados do trecho 1 saem antes das trocas (eles são calculados uma vez só).
  mataPlants(); mataTrails();
  const plants = mataPlants; mataPlants = function () { return inTrecho() ? trechoLayout().flora : plants(); };
  const trails = mataTrails; mataTrails = function () { return inTrecho() ? trechoLayout().trails : trails(); };
  mataFree = function (x, y) { return (WORLD_MAPS[worldOut?.map] || WORLD_MAPS.mata).canWalk(x, y); };
  const here = mataHere; mataHere = function () { return here() || inTrecho(); };
  // Mata adentro é sempre braba: de dia e de noite, facão na mão.
  const combatOn = mataCombatOn; mataCombatOn = function () { if (!inTrecho()) return combatOn(); return !prologueActive(); };
  const nightStart = mataNightStart; mataNightStart = function () { if (inTrecho()) { trechoBeastsStart(); return; } nightStart(); };
  const combat = mataCombatTick; mataCombatTick = function (dt) {
    if (inTrecho()) { if (mataNight && mataNight.key !== trechoKey()) mataNight = null; }
    else if (mataNight?.trecho) mataNight = null;
    combat(dt);
  };
  // Bicho derrubado fica no chão até o outro dia; dá experiência de mateiro.
  const kill = mataKill; mataKill = function (b) {
    kill(b);
    mataXP({ javali: 4, onca: 8, jararaca: 5, cascavel: 6, coral: 5, teiu: 7, ourico: 6, corposeco: 10, queixada: 3, lobisomem: 15 }[b.kind] || 4);
    if (inTrecho() && b.idx != null && mataNight?.trecho) trechoDay(mataNight.trecho).killed.push(b.idx);
  };
  // Dano: o fundo da mata bate mais forte; o chapéu de aba larga da ferraria segura igual na caverna e aqui; perto do
  // fogo do acampamento, nada machuca.
  const hurt = mataHurt; mataHurt = function (dmg, from) {
    if (inTrecho() && trechoCampSafe()) return;
    let d = dmg * (from?.dmgMul || 1); if (caveUp('chapeu')) d *= .85;
    return hurt(Math.max(1, Math.round(d)), from);
  };
  // As botas de garrão da ferraria valem na mata também; no trecho o Sadi anda a pé.
  const move = movementBonus; movementBonus = function () { let b = move(); if (mataHere() && caveUp('botas')) b += .15; return b; };
  const mounted = playerMounted; playerMounted = function () { return inTrecho() ? false : mounted(); };
  // Cobras: a cascavel usa o mesmo bote da jararaca, mas avisa com o chocalho. Perto do fogo, os bichos não chegam.
  const beast = mataBeastTick; mataBeastTick = function (b, dt, p) {
    if (b.stun > 0) { b.stun -= dt; b.hurt = Math.max(0, b.hurt - dt); return; }
    if (inTrecho() && !b.boss && trechoCampSafe()) { const T = trechoLayout(), c = T.camp, d = Math.hypot(b.x - c.x, b.y - c.y) || 1; b.hurt = Math.max(0, b.hurt - dt); if (!['jararaca', 'cascavel', 'corposeco'].includes(b.kind) && d < c.rx * 1.8) { b.state = b.kind === 'onca' ? 'stalk' : 'roam'; b.dx = b.x < c.x ? -1 : 1; mataStep(b, (b.x - c.x) / d * 120, (b.y - c.y) / d * 120, dt); } return; }
    if (b.kind === 'cascavel') { if (b.state === 'hide' && Math.hypot(p.x - b.x, p.y - b.y) < 260 && (b.rattle = (b.rattle || 0) - dt) <= 0) { b.rattle = .9; for (let k = 0; k < 5; k++) AudioEngine.noise?.(.03, .03, 5200, k * .05); } mataJararacaTick(b, dt, p); return; }
    if ((b.kind === 'onca' || b.kind === 'corposeco') && mataBuffs.fumo > 0) { const d = Math.hypot(p.x - b.x, p.y - b.y) || 1; b.state = b.kind === 'onca' ? 'retreat' : 'walk'; b.t = .5; b.dx = p.x < b.x ? 1 : -1; mataStep(b, (b.x - p.x) / d * 160, (b.y - p.y) / d * 160, dt); return; }
    return beast(b, dt, p);
  };
  const draw = drawCaveBeast; drawCaveBeast = function (b) { if (b.kind === 'cascavel') { drawJararaca(b, true); return; } draw(b); };
  const tick = outsideTick; outsideTick = function (dt) {
    tick(dt); mataBeltRefresh(); if (!mataHere() || paused || modal || scene) return;
    mataBuffs.fumo = Math.max(0, mataBuffs.fumo - dt);
    // Pouca vida: o coração bate forte, como na caverna.
    if (mataCombatOn() && mataNight && !mataNight.faint && caveState().hp <= caveMaxHp() * .3) { mataBuffs.beat = (mataBuffs.beat ?? 0) - dt; if (mataBuffs.beat <= 0) { mataBuffs.beat = .85; AudioEngine.caveHeartbeat?.(); } }
    if (mataBuffs.regen > 0) { mataBuffs.regen -= dt; const st = caveState(); st.hp = Math.min(caveMaxHp(), st.hp + dt * 2); }
    // Veneno de cobra-coral: tira vida devagar até passar (o chá de marcela corta).
    if (mataBuffs.veneno > 0 && mataNight && !mataNight.faint) { mataBuffs.veneno -= dt; if ((mataBuffs.venenoTick -= dt) <= 0) { mataBuffs.venenoTick = 1; const st = caveState(); st.hp = Math.max(1, st.hp - 2); effect('−2 veneno', worldOut.x + 30, worldOut.y - 120, '#b8f070', 14); } }
    // Com o cusco véio junto, ele late e segura o bicho mais perto.
    if (mataNight && cuscoOut?.() && (mataBuffs.apito -= dt) <= 0) {
      mataBuffs.apito = 7; const b = mataNight.beasts.filter(x => x.hp > 0 && !x.boss && Math.hypot(x.x - worldOut.x, x.y - worldOut.y) < 300).sort((a, c) => Math.hypot(a.x - worldOut.x, a.y - worldOut.y) - Math.hypot(c.x - worldOut.x, c.y - worldOut.y))[0];
      if (b) { b.stun = 2.2; cuscoBarkSound?.(); effect('Au! Au!', cusco.x, cusco.y - 70, '#ffd2a0'); fxStars(b.x, b.y - 60, 4); }
    }
  };
  const swap = switchMap; switchMap = function (to) { if (to.map === 'trecho' && to.trecho) mataState().trecho = to.trecho; return swap(to); };
  // Entrou na bodega: some o facão e o bornal da mata da tela.
  const inside = goInside; goInside = function (...a) { const r = inside(...a); mataUpdateButton(); mataBeltRefresh(); return r; };
  // A picada do leste do trecho 1 leva ao trecho 2: dali pra frente é facão na mão.
  const M = WORLD_MAPS.mata, edge = M.edge, walk = M.canWalk;
  M.edge = function (p) {
    if (p.x > MATA.W - 12 && Math.abs(p.y - 770) < 90) {
      if (!caveState().facao) { trechoSay('Daqui pra frente a mata é braba, de dia e de noite: sem o facão do vô (cravado na boca da gruta, na Serra), não dá.'); return null; }
      const e = trechoEnds(2); return { map: 'trecho', trecho: 2, x: 90, y: e.yIn, title: TRECHO_BIOME_NAMES.mata, text: 'Facão na mão: daqui pra frente a mata é braba.' };
    }
    return edge.call(this, p);
  };
  M.canWalk = function (x, y) { if (x > MATA.W - 40 && x < MATA.W + 30 && Math.abs(y - 770) < 55) return !mataSolid(x, y); return walk.call(this, x, y); };
  // Topo do trecho: avisos, olhos da onça e o painel.
  const sparks = drawSparks; drawSparks = function (map = null) { sparks(map); if (map === 'trecho' && inTrecho()) trechoTop(); };
  document.addEventListener('keydown', e => {
    if (!mataHere() || phoneOpen || e.repeat || modal || scene || worldTalkOpen() || ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    const k = Number(e.key); if (!(k >= 1 && k <= 5)) return; const it = mataBeltItems()[k - 1]; if (!it) return; e.preventDefault(); e.stopImmediatePropagation(); mataUseItem(it.id);
  }, true);
  document.addEventListener('DOMContentLoaded', () => { $('hudLayer')?.insertAdjacentHTML('beforeend', '<div id="mataBelt" class="horta-bar cave-belt hidden" aria-label="Bornal da mata"></div>'); });
  const act = action; action = function (name, id) {
    if (name === 'mataUse') { mataUseItem(id); return; }
    if (name === 'mataCamp') { mataGoCamp(id); return; }
    if (name === 'mataRancho') { closeDialog(true); mataGoRancho(); return; }
    return act(name, id);
  };
}
// Painel e avisos por cima do escuro.
function trechoTop() {
  const T = trechoLayout(), N = mataNight, on = mataCombatOn();
  if (on && N && !scene) {
    drawMataWarnings();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const b of N.beasts) if (b.hp > 0 && b.kind === 'onca' && mataOncaHidden(b)) { const ex = b.x + (b.dx < 0 ? -26 : 26), ey = b.y - 62; for (const s of [-1, 1]) glow(ex + s * 6, ey, 9, caveUp('lampiao') ? .9 : .7, '255,220,90'); } ctx.restore();
    if (N.hurt > 0) { ctx.fillStyle = `rgba(200,30,20,${N.hurt * .8})`; ctx.fillRect(worldOut.x - 3000, worldOut.y - 3000, 6000, 6000); }
  }
  if (scene) return;
  mataHudPanel(TRECHO_BIOME_NAMES[T.biome], trechoCampSafe(T) ? 'perto do fogo, os bichos não chegam' : (() => { const left = N ? N.beasts.filter(b => b.hp > 0).length : 0; return (left ? left + (left === 1 ? ' bicho rondando' : ' bichos rondando') : 'trecho limpo por hoje') + (mataLuaCheia() && T.biome !== 'mata' ? ' · 🌕 lua cheia' : ''); })());
}
// O painel de vida da mata (trechos e o navio de Laguna).
function mataHudPanel(title, line) {
  const st = caveState(), dpr = canvas.width / Math.max(1, canvas.clientWidth), W = canvas.clientWidth, X = W - 264, poison = mataBuffs.veneno > 0;
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Pouca vida: a borda da tela pulsa vermelha, como na caverna.
  if (st.hp <= caveMaxHp() * .3 && !scene) { const H = canvas.clientHeight; darkHole(W / 2, H / 2, Math.min(W, H) * .3, Math.max(W, H) * .7, '180,10,10', .42 + .16 * Math.sin(frameClock * 7)); }
  rect(X, 14, 250, 84, 'rgba(14,18,12,.84)', 8, poison ? '#8ac84a' : '#7a8a4a'); txt(title, X + 12, 34, 14, '#e8f0c8', 'left', 'Georgia', false);
  rect(X + 12, 46, 160, 14, '#1a2410', 5); rect(X + 12, 46, 160 * Math.min(1, st.hp / caveMaxHp()), 14, poison ? '#8ac83a' : st.hp > caveMaxHp() * .3 ? '#d84a3a' : '#ff7a3a', 5); txt('❤ ' + Math.round(st.hp) + '/' + caveMaxHp(), X + 178, 57, 12, '#e8f0c8', 'left', 'Arial', false);
  txt(poison ? '🐍 envenenado · chá de marcela corta' : line, X + 12, 74, 11, poison ? '#c8f0a0' : '#c8d4a0', 'left', 'Arial', false);
  txt(mataRank() + ' · ' + mataState().xp + ' xp de mateiro', X + 12, 90, 11, '#d8c890', 'left', 'Arial', false);
  ctx.restore();
}
