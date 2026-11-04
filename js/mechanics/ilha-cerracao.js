// A Mata da cerração, entre o pé do paredão e o alto da ilha (ilha.js): sete trechos, cada um mais escuro que o outro,
// como a mata adentro de Araucárias. Entra-se pela picada no pé do paredão e sai-se, no fim, lá em cima, na fortaleza.
//   · Trecho 1: piratas fantasmas e afogados nas poças. 2 e 3: as bruxas da ilha começam a aparecer, com as
//     mariposas-bruxas e o minhocão. 4: a Bruxa-mor, na clareira de cinzas. 5 e 6: as bernúncias. 7: a Bernúncia-mãe.
//   · Nos trechos dos chefes, uma névoa tranca a saída até o chefe cair.
//   · Como na mata adentro, só se anda pelas picadas: a principal, larga, com clareiras nas curvas, e dois ramais que
//     acabam num baú de pirata (prata, cartucho de carabina e coisa pro Griggs; cada baú abre uma vez só). Nos trechos
//     dos chefes, um baú na clareira aparece depois da vitória. Fora da picada é mato fechado, pros bichos também.
// Os bichos novos também andam na parte de baixo da ilha (piratas e afogados). Lá no alto ficam os marinheiros.
//   · Pirata fantasma: os que mataram o Dias Velho, fundador de Desterro. Mira de garrucha (a linha vermelha) e atira.
//   · Afogado: sai da água quando o Sadi chega perto e agarra; batendo nele, solta.
//   · Mariposa-bruxa: as bruxas da ilha viram mariposa e vêm em nuvem, mordendo de todo lado.
//   · Minhocão: o minhocão gigante das lendas do Sul cava por baixo; o chão treme, o círculo avisa e ele sai embaixo do
//     Sadi. Só dá pra bater quando ele está fora da terra.
//   · Bruxa: flutua longe, joga a praga (a bola roxa que segue o Sadi) e, quando apanha, some e aparece do outro lado.
//     De perto ela foge ligeiro e, se o Sadi encosta, some de novo: o arpão do Griggs puxa e segura ela pro facão.
//   · Bernúncia: o bicho do Boi-de-Mamão, de pano colorido e bocarra; avisa o bote e engole de uma vez.
'use strict';

Object.assign(CAVE_BEASTS, {
  pirata: { name: 'Pirata fantasma', hp: 80, speed: 150, dmg: 12, r: 24, cash: [6, 12], from: 999, weight: 0 },
  afogado: { name: 'Afogado', hp: 100, speed: 95, dmg: 5, r: 26, cash: [4, 8], from: 999, weight: 0 },
  mariposa: { name: 'Mariposa-bruxa', hp: 16, speed: 230, dmg: 6, r: 16, cash: [0, 1], from: 999, weight: 0 },
  minhocao: { name: 'Minhocão', hp: 280, speed: 170, dmg: 26, r: 46, cash: [10, 16], from: 999, weight: 0 },
  bruxa: { name: 'Bruxa da ilha', hp: 110, speed: 170, dmg: 14, r: 24, cash: [8, 14], from: 999, weight: 0 },
  bernuncia: { name: 'Bernúncia', hp: 240, speed: 140, dmg: 22, r: 40, cash: [10, 18], from: 999, weight: 0 },
  bruxaMor: { name: 'A Bruxa-mor', hp: 1100, speed: 190, dmg: 18, r: 34, cash: [80, 120], from: 999, weight: 0 },
  bernunciaMae: { name: 'A Bernúncia-mãe', hp: 1800, speed: 125, dmg: 30, r: 64, cash: [100, 150], from: 999, weight: 0 }
});
RANGED_IMMUNE.push('submerso', 'afunda', 'cavando', 'tremor');

// ---------- Os trechos ----------
const ILHAMATO = { W: 3400, H: 1900, last: 7, half: 125, cell: 20, bosses: { 4: 'bruxaMor', 7: 'bernunciaMae' }, fogos: [2, 5] };
const ILHAMATO_MOBS = {
  1: [['pirata', 4], ['afogado', 3]], 2: [['pirata', 2], ['bruxa', 2], ['mariposa', 5]], 3: [['bruxa', 3], ['mariposa', 5], ['mariposa', 5], ['minhocao', 1]],
  4: [['mariposa', 5]], 5: [['bernuncia', 2], ['bruxa', 2], ['minhocao', 1]], 6: [['bernuncia', 3], ['mariposa', 5], ['minhocao', 2]], 7: [['bruxa', 1]]
};
const ILHAMATO_AVISOS = { 1: 'Daqui pra frente, a ilha escurece.', 2: 'Cheiro de vela queimada: tem bruxa por perto.', 3: 'Mariposas pretas em volta de tudo, e o chão treme.', 4: 'Uma clareira de cinzas no meio da mata…', 5: 'Rastro de bicho grande no barro.', 6: 'Pedaços de pano colorido nos galhos.', 7: 'A subida pro alto da ilha.' };
const ilhaMatoCache = new Map();
function ilhaMatoLayout(n = ilhaState().trecho || 1) {
  if (ilhaMatoCache.has(n)) return ilhaMatoCache.get(n);
  const R = caveRand(5100 + n * 97), { W, H, half, cell: C } = ILHAMATO, boss = ILHAMATO.bosses[n];
  const yIn = 520 + R() * 860, yOut = 520 + R() * 860, arena = boss ? { x: W / 2, y: H / 2 + 40, r: 440 } : null, pts = [[-60, yIn], [340, yIn]];
  for (let k = 1; k <= 4; k++) { const x = 340 + k * (W - 680) / 5; let y = clamp(pts[pts.length - 1][1] + (R() - .5) * 760, 320, H - 320); if (arena && (k === 2 || k === 3)) y = arena.y + (k === 2 ? -60 : 60); pts.push([x, y]); }
  pts.push([W - 340, yOut], [W + 60, yOut]);
  const L = { n, W, H, yIn, yOut, pts, arena, boss, half, clearings: [], ramais: [], baus: [], pools: [], trees: [], brush: [], rocks: [], grid: new Map(), dark: Math.min(.74, .36 + n * .055) };
  const longe = (x, r) => !arena || Math.abs(x - arena.x) > arena.r + r;
  // Clareiras nas curvas da picada (no trecho do chefe, a clareira é a arena).
  for (let k = 2; k <= 5; k++) if (longe(pts[k][0], 240) && R() < .8) { const r = 200 + R() * 70; L.clearings.push({ x: pts[k][0], y: pts[k][1], rx: r, ry: r * .8 }); }
  // Trechos com fogueira (ilha-fogueiras.js): uma clareira grande ao lado da picada, onde bicho nenhum ataca.
  if (ILHAMATO.fogos.includes(n)) {
    const [x, y] = pts[3], side = y > H / 2 ? -1 : 1; L.camp = { x: x + 40, y: y + side * 190, rx: 290, ry: 220 };
    L.clearings = L.clearings.filter(c => c.x !== x || c.y !== y); L.clearings.push({ x: L.camp.x, y: L.camp.y, rx: L.camp.rx, ry: L.camp.ry, fogo: true });
  }
  // Trecho 1: as poças dos afogados, cada uma numa clareira na beira da picada.
  if (n === 1) for (const fx of [.34, .68]) {
    const x = W * fx, ty = ilhaMatoTrailY(L, x); let side = R() < .5 ? -1 : 1; if (ty + side * 420 > H - 160 || ty + side * 420 < 220) side = -side;
    const py = ty + side * 330; L.pools.push({ x, y: py, rx: 150, ry: 80 }); L.clearings.push({ x, y: ty + side * 185, rx: 290, ry: 295 });
  }
  // Dois ramais saem da picada e acabam num baú de pirata.
  for (const [a, b] of [[.18, .42], [.56, .8]]) for (let t = 0; t < 16; t++) {
    const x = W * (a + R() * (b - a)), ty = ilhaMatoTrailY(L, x), len = 380 + R() * 140; if (!longe(x, 200)) continue;
    let side = R() < .5 ? -1 : 1; if (ty + side * len > H - 160 || ty + side * len < 220) side = -side;
    const x1 = clamp(x + (R() - .5) * 360, 300, W - 300), y1 = clamp(ty + side * len, 220, H - 160);
    if (Math.abs(y1 - ty) < 300 || L.pools.some(q => Math.hypot(x1 - q.x, y1 - q.y) < 430) || L.ramais.some(r => Math.hypot(x1 - r.x1, y1 - r.y1) < 600) || L.camp && Math.hypot(x1 - L.camp.x, y1 - L.camp.y) < 520) continue;
    L.ramais.push({ x0: x, y0: ty, x1, y1, half: 70, r: 110 }); L.baus.push({ id: 'r' + L.ramais.length, x: x1, y: y1 - 4 }); break;
  }
  if (arena) L.baus.push({ id: 'chefe', x: arena.x, y: arena.y - 150, chefe: true });
  // O chão que dá pra andar, em quadradinhos de 20 px (a conta de canWalk fica barata).
  const cw = Math.ceil(W / C), ch = Math.ceil(H / C), cells = new Uint8Array(cw * ch);
  for (let gy = 0; gy < ch; gy++) for (let gx = 0; gx < cw; gx++) cells[gy * cw + gx] = ilhaMatoDentro(L, gx * C + C / 2, gy * C + C / 2) ? 1 : 0;
  L.open = { cw, ch, cells };
  // A distância até a picada: colado na beira, a mata fecha; longe, quase só o escuro.
  const dist = new Uint16Array(cw * ch).fill(9999), q = [];
  cells.forEach((v, i) => { if (v) { dist[i] = 0; q.push(i); } });
  for (let h = 0; h < q.length; h++) {
    const i = q[h], gx = i % cw, d = dist[i] + 1;
    for (const j of [gx > 0 ? i - 1 : -1, gx < cw - 1 ? i + 1 : -1, i - cw, i + cw]) if (j >= 0 && j < dist.length && dist[j] > d) { dist[j] = d; q.push(j); }
  }
  const fora = (x, y) => dist[clamp(Math.floor(y / C), 0, ch - 1) * cw + clamp(Math.floor(x / C), 0, cw - 1)] * C;
  // Árvore cuja copa cairia por cima da picada (as do lado de baixo dela) vira xaxim baixo ou só mato, senão tapa o caminho.
  const tapa = (x, y, s, alta) => { const h = (alta ? 300 : 210) * s; return [[0, .3], [0, .55], [0, .8], [-70 * s, .6], [70 * s, .6]].some(([dx, k]) => fora(x + dx, y - h * k) === 0); };
  for (let y0 = 110, row = 0; y0 < H + 90; y0 += 84, row++) for (let x0 = -50 + (row % 2) * 56; x0 < W + 60; x0 += 112) {
    const x = x0 + (R() - .5) * 50, y = y0 + (R() - .5) * 34, d = fora(x, y), r = R(); let s = [.86, 1, 1.14][Math.floor(R() * 3)], kind = r < .5 ? 'folha' : r < .78 ? 'jeriva' : 'xaxim';
    if (d < 44 || d > 560 || d > 240 && R() < .45) continue;
    if (tapa(x, y, s, kind !== 'xaxim')) { kind = 'xaxim'; s = .86; if (tapa(x, y, s, false)) { L.brush.push({ x, y, i: R() < .5 ? 5 : 1, w: 120 + R() * 40 }); continue; } }
    L.trees.push({ x, y, s, kind, v: R() < .3 ? 2 : 3 });
  }
  for (let i = 0; i < cells.length; i++) if (dist[i] === 2 && R() < .16 || dist[i] === 5 && R() < .1) { const gx = i % cw, gy = (i - gx) / cw; L.brush.push({ x: gx * C + C / 2 + (R() - .5) * 14, y: gy * C + C / 2, i: R() < .5 ? 5 : 1, w: R() < .5 ? 96 : 120 }); }
  // Umas pedras nas clareiras, pra se esconder do tiro do pirata.
  for (const c of L.clearings) if (!c.fogo && !L.pools.some(o => Math.hypot(o.x - c.x, o.y - c.y) < 400)) for (let k = 0; k < 2; k++) { const a = R() * Math.PI * 2, x = c.x + Math.cos(a) * c.rx * .6, y = c.y + Math.sin(a) * c.ry * .6; if (ilhaMatoTrailDist(L, x, y) > 90) L.rocks.push({ x, y, i: R() < .5 ? 2 : 14, w: R() < .5 ? 96 : 120 }); }
  for (const o of L.rocks) { const key = Math.floor(o.x / 256) + ':' + Math.floor(o.y / 256); if (!L.grid.has(key)) L.grid.set(key, []); L.grid.get(key).push(o); }
  L.path = new Path2D(); pts.forEach(([x, y], i) => i ? L.path.lineTo(x, y) : L.path.moveTo(x, y));
  ilhaMatoCache.set(n, L); return L;
}
function ilhaMatoTrailY(L, x) { const P = L.pts; for (let i = 1; i < P.length; i++) if (x <= P[i][0]) { const [ax, ay] = P[i - 1], [bx, by] = P[i]; return ay + (by - ay) * (x - ax) / (bx - ax || 1); } return P[P.length - 1][1]; }
function ilhaSegDist(x, y, ax, ay, bx, by) { const vx = bx - ax, vy = by - ay, k = clamp(((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy || 1), 0, 1); return Math.hypot(x - ax - vx * k, y - ay - vy * k); }
function ilhaMatoTrailDist(L, x, y) { let best = Infinity; const P = L.pts; for (let i = 1; i < P.length; i++) best = Math.min(best, ilhaSegDist(x, y, ...P[i - 1], ...P[i])); return best; }
// Dentro da picada, de um ramal, de uma clareira ou da arena (a beira ondula um pouco).
function ilhaMatoDentro(L, x, y) {
  const w = 14 * Math.sin(x / 97 + L.n) + 9 * Math.sin(y / 61 + L.n * 2);
  if (ilhaMatoTrailDist(L, x, y) < L.half + w) return true;
  if (L.arena && Math.hypot(x - L.arena.x, (y - L.arena.y) * 1.25) < L.arena.r + w) return true;
  for (const c of L.clearings) if (Math.hypot((x - c.x) / (c.rx + w), (y - c.y) / (c.ry + w)) < 1) return true;
  for (const r of L.ramais) if (ilhaSegDist(x, y, r.x0, r.y0, r.x1, r.y1) < r.half + w * .6 || Math.hypot(x - r.x1, (y - r.y1) * 1.2) < r.r + w) return true;
  return false;
}
function ilhaMatoAbre(L, x, y) { const o = L.open, gx = Math.floor(x / ILHAMATO.cell), gy = Math.floor(y / ILHAMATO.cell); return gx >= 0 && gy >= 0 && gx < o.cw && gy < o.ch && o.cells[gy * o.cw + gx] === 1; }
function ilhaMatoAberto(L) { return !L.boss || !!ilhaState()[L.boss]; }
function ilhaMatoEntrada(n, fim = false) { const L = ilhaMatoLayout(n); return { map: 'ilhamato', n, x: fim ? L.W - 90 : 90, y: fim ? L.yOut : L.yIn, title: 'Mata da cerração · trecho ' + n + '/' + ILHAMATO.last, text: ILHAMATO_AVISOS[n] || '' }; }
// Quem mora em cada trecho (os afogados ficam na beira das poças; as mariposas, em nuvem).
function ilhaMatoGuardas(n) {
  const L = ilhaMatoLayout(n), st = ilhaState(), R = caveRand(n * 131 + G.day * 7), out = [];
  const spot = () => {
    for (let k = 0; k < 80; k++) {
      const c = L.clearings.length && R() < .45 ? L.clearings[Math.floor(R() * L.clearings.length)] : null, x = c ? c.x + (R() - .5) * c.rx * 1.2 : 600 + R() * (L.W - 1100), y = c ? c.y + (R() - .5) * c.ry * 1.2 : ilhaMatoTrailY(L, x) + (R() - .5) * 180;
      if (x < 560 || L.arena && Math.hypot(x - L.arena.x, y - L.arena.y) < L.arena.r + 80 || L.camp && Math.hypot((x - L.camp.x) / (L.camp.rx + 260), (y - L.camp.y) / (L.camp.ry + 260)) < 1) continue; if (WORLD_MAPS.ilhamato.canWalk(x, y)) return [x, y];
    }
    return [L.W / 2, ilhaMatoTrailY(L, L.W / 2)];
  };
  for (const [kind, count] of ILHAMATO_MOBS[n] || []) {
    if (kind === 'afogado') { for (let k = 0; k < count; k++) { const q = L.pools[k % L.pools.length], a = k * 2.1; if (q) out.push([q.x + Math.cos(a) * (q.rx + 34), q.y + Math.sin(a) * (q.ry + 28), 1, kind]); } continue; }
    if (kind === 'mariposa') { out.push([...spot(), count, kind]); continue; }
    for (let k = 0; k < count; k++) out.push([...spot(), 1, kind]);
  }
  if (L.boss && st[L.boss]) out.push([L.arena.x, L.arena.y, 1, L.boss === 'bruxaMor' ? 'bruxa' : 'bernuncia']);
  // O baú do fim do ramal tem dono (sempre o mesmo bicho, aberto ou não, pra contagem dos mortos não mudar).
  const dono = ILHA_BAU_DONO[n] || 'pirata';
  for (const c of L.baus) if (!c.chefe) out.push([c.x, c.y + 60, dono === 'mariposa' ? 3 : 1, dono]);
  return out;
}
WORLD_MAPS.ilhamato = {
  id: 'ilhamato', name: 'Mata da cerração', W: ILHAMATO.W, H: ILHAMATO.H,
  spawn() { return { x: 90, y: ilhaMatoLayout().yIn }; },
  canWalk(x, y) {
    const L = ilhaMatoLayout();
    if (x < 30) return x > -30 && Math.abs(y - L.yIn) < 70;
    if (x > L.W - 30) return x < L.W + 30 && Math.abs(y - L.yOut) < 70 && ilhaMatoAberto(L);
    if (y < 110 || y > L.H - 30 || !ilhaMatoAberto(L) && x > L.W - 240) return false;
    if (!ilhaMatoAbre(L, x, y)) return false;   // mato fechado fora das picadas
    if (L.pools.some(q => Math.hypot((x - q.x) / q.rx, (y - q.y) / q.ry) < .85)) return false;
    const cx = Math.floor(x / 256), cy = Math.floor(y / 256);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const o of L.grid.get((cx + i) + ':' + (cy + j)) || []) if (Math.hypot(o.x - x, (o.y - y) * 1.3) < o.w * .36) return false;
    return true;
  },
  edge(p) {
    const L = ilhaMatoLayout(), n = L.n;
    if (p.x < 6) return n === 1 ? { map: 'ilha', x: PLANALTO.gap.x + PLANALTO.gap.w / 2, y: PLANALTO.y + PLANALTO.face + 70, title: 'Ilha da Fortaleza', text: 'De volta pro pé do paredão.' } : ilhaMatoEntrada(n - 1, true);
    if (p.x > L.W - 6 && ilhaMatoAberto(L)) return n === ILHAMATO.last ? { map: 'ilha', x: 3200, y: PLANALTO.y - 130, planalto: true, title: 'O alto da ilha', text: 'Lá em cima, a fortaleza dos marinheiros.' } : ilhaMatoEntrada(n + 1);
    return null;
  },
  spots() {
    const L = ilhaMatoLayout(), list = [{ id: 'ilhamato:placa', x: 300, y: L.yIn - 36, info: true, label: 'Placa da Mata da cerração', text: 'Trecho ' + L.n + ' de ' + ILHAMATO.last + '. ' + (ILHAMATO_AVISOS[L.n] || '') }];
    for (const c of ilhaBausVisiveis(L)) if (!ilhaBauAberto(L, c)) list.push({ id: 'ilhamato:bau:' + c.id, x: c.x, y: c.y + 10, radius: 95, label: c.chefe ? 'Abrir o baú da clareira' : 'Abrir o baú de pirata', act: () => ilhaBauAbre(L, c) });
    return list;
  },
  draw(view, seen, layers) { drawIlhaMato(view, seen, layers); },
  onEnter() { mataNight = null; }
};
REGION_NAMES.ilhamato = 'Ilha da Fortaleza';
// ---------- Os baús dos trechos ----------
// Cada baú abre uma vez só. Quanto mais fundo, mais prata e mais moeda; sempre tem cartucho de carabina e alguma coisa
// que o Griggs usa (ou que vai pro bornal). O baú da clareira do chefe só aparece depois da vitória.
const ILHA_BAU_DONO = { 1: 'pirata', 2: 'pirata', 3: 'bruxa', 4: 'mariposa', 5: 'bernuncia', 6: 'bruxa', 7: 'bernuncia' };
const ILHA_BAU_EXTRA = {
  1: [{ garapuvu: 2 }, { corrente_ferro: 2 }], 2: [{ corrente_ferro: 1, arruda: 2 }, { garapuvu: 2, sal: 2 }], 3: [{ corrente_ferro: 2 }, { bomba: 1, garapuvu: 1 }],
  4: [{ arruda: 2, sal: 2 }, { bomba: 2 }], 5: [{ corrente_ferro: 2, garapuvu: 1 }, { marcela: 2 }], 6: [{ sabre_peca: 1, bomba: 1 }, { carqueja: 2 }], 7: [{ sabre_peca: 2 }, { bomba: 2 }]
};
function ilhaBausVisiveis(L) { return L.baus.filter(c => !c.chefe || ilhaMatoAberto(L)); }
function ilhaBauAberto(L, c) { return !!ilhaState().baus?.[L.n + ':' + c.id]; }
function ilhaBauLoot(n, c) {
  const i = c.chefe ? -1 : +c.id.slice(1) - 1, extra = c.chefe ? { bomba: 2, marcela: 1 } : ILHA_BAU_EXTRA[n]?.[i] || {};
  const loot = { cash: c.chefe ? 160 + n * 20 : 30 + n * 14, cartuchos: c.chefe ? 10 : 3 + Math.floor(n / 2), raw: { prata: c.chefe ? 6 : 1 + Math.ceil(n * .5) + (i === 0 ? 1 : 0) }, bornal: {} };
  for (const [k, q] of Object.entries(extra)) (MATA_ITEMS.some(it => it.id === k) ? loot.bornal : loot.raw)[k] = q;
  return loot;
}
function ilhaBauAbre(L, c) {
  const st = ilhaState(), key = L.n + ':' + c.id; st.baus ??= {}; if (st.baus[key]) return; st.baus[key] = G.day;
  const loot = ilhaBauLoot(L.n, c), bag = mataBag(), tiles = [['<span class="bag-emoji">🪙</span>', money(loot.cash), 'moedas']];
  G.cash = round(G.cash + loot.cash);
  for (const [k, q] of Object.entries(loot.raw)) { bagAdd(k, q); tiles.push([bagIcon(k), q, BAG_RAW[k].name.toLowerCase()]); }
  carabinaAdd(loot.cartuchos); tiles.push([rangedIcon('cartuchos'), loot.cartuchos, 'cartuchos de carabina']);
  for (const [id, q] of Object.entries(loot.bornal)) { const got = Math.min(q, Math.max(0, mataBagMax() - (bag[id] || 0))); if (!got) continue; bag[id] = (bag[id] || 0) + got; tiles.push([mataGearHTML(id, 34), got, MATA_ITEMS.find(it => it.id === id).name.toLowerCase()]); }
  AudioEngine.caveChestOpen?.(); fxStars(c.x, c.y - 50, 8); mataXP(6); mataBeltRefresh(); save(); refreshHUD();
  const txt = c.chefe ? 'No meio da clareira, onde o chefe caiu, um baú de pirata grande, de ferragem de prata. Dentro tinha:' : 'No fim do ramal, meio enterrado nas folhas, um baú de pirata com a fechadura podre. Dentro tinha:';
  talk([['card', `<b>🧰 ${c.chefe ? 'O baú da clareira' : 'Baú de pirata'}</b><br>${txt}<div class="bag-grid cave-loot">${tiles.map(([icon, big, small]) => `<div class="bag-item">${icon}<b>${big}</b><small>${small}</small></div>`).join('')}</div>`, 'Mata da cerração · trecho ' + L.n]], null, 'Guardar');
}
// Do trapiche pro alto e de volta, pela trilha velha (depois da primeira subida pela mata).
function ilhaAtalho(subir) {
  mataNight = null;
  if (subir) switchMap({ map: 'ilha', x: 3200, y: PLANALTO.y - 130, title: 'O alto da ilha', text: 'Pela trilha velha, escondida no paredão.' });
  else switchMap({ map: 'ilha', ...ILHA.arrive, title: 'Trapiche da ilha', text: 'De volta pro barco do seu Nereu.' });
}

// ---------- Desenho dos trechos ----------
function paintIlhaMatoGround(L, view) {
  const { x, y, w, h } = view;
  if (!mataTexture(0, x, y, w, h)) rect(x, y, w, h, '#465039');
  // Fora das picadas, o mato fechado: escuro e cheio de folhagem.
  ctx.fillStyle = `rgba(6,12,8,${.46 + L.n * .03})`; ctx.fillRect(x, y, w, h);
  ilhaBlotches(view, 3, .3, 220, 50 + L.n * 7); ilhaBlotches(view, 2, .22, 300, 90 + L.n * 5);
  // A picada, os ramais e as clareiras, com a beira esfumada.
  const chao = ilhaPattern(0) || '#4e5a40', abre = (extra, alpha) => {
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = ctx.fillStyle = chao; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = (L.half + extra) * 2; ctx.stroke(L.path);
    for (const r of L.ramais) { ctx.lineWidth = (r.half + extra) * 2; ctx.beginPath(); ctx.moveTo(r.x0, r.y0); ctx.lineTo(r.x1, r.y1); ctx.stroke(); ctx.beginPath(); ctx.ellipse(r.x1, r.y1, r.r + extra, (r.r + extra) / 1.2, 0, 0, Math.PI * 2); ctx.fill(); }
    for (const c of L.clearings) { ctx.beginPath(); ctx.ellipse(c.x, c.y, c.rx + extra, c.ry + extra, 0, 0, Math.PI * 2); ctx.fill(); }
    if (L.arena) { const a = L.arena; ctx.beginPath(); ctx.ellipse(a.x, a.y, a.r + extra, a.r * .8 + extra, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  };
  abre(28, .3); abre(12, .55); abre(0, 1);
  if (L.arena) {
    const a = L.arena, bruxa = L.boss === 'bruxaMor'; ctx.save(); ctx.beginPath(); ctx.ellipse(a.x, a.y, a.r, a.r * .8, 0, 0, Math.PI * 2); ctx.clip(); mataTexture(bruxa ? 1 : 3, x, y, w, h); ctx.fillStyle = bruxa ? 'rgba(40,30,40,.38)' : 'rgba(40,30,10,.25)'; ctx.fillRect(x, y, w, h); ctx.restore();
    if (bruxa) { ctx.save(); ctx.strokeStyle = 'rgba(28,22,28,.6)'; ctx.lineWidth = 16; ctx.beginPath(); ctx.ellipse(a.x, a.y, a.r * .55, a.r * .42, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  }
  const dirt = ilhaPattern(1); ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(20,16,10,.3)'; ctx.lineWidth = 100; ctx.stroke(L.path); ctx.strokeStyle = dirt || '#8e704b'; ctx.globalAlpha = .85; ctx.lineWidth = 84; ctx.stroke(L.path);
  ctx.globalAlpha = .5; ctx.lineWidth = 38; for (const r of L.ramais) { ctx.beginPath(); ctx.moveTo(r.x0, r.y0); ctx.lineTo(r.x1, r.y1); ctx.stroke(); } ctx.restore();
  for (const q of L.pools) {
    ctx.save(); ctx.beginPath(); ctx.ellipse(q.x, q.y, q.rx, q.ry, 0, 0, Math.PI * 2); ctx.clip(); if (!mataTexture(5, x, y, w, h)) rect(x, y, w, h, '#245158'); ctx.fillStyle = 'rgba(10,30,26,.45)'; ctx.fillRect(x, y, w, h); ctx.restore();
    ctx.save(); ctx.strokeStyle = 'rgba(40,32,20,.6)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(q.x, q.y, q.rx, q.ry, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
}
function drawIlhaMato(view, seen, layers) {
  const L = ilhaMatoLayout(), p = worldOut;
  ilhaTilesDraw('m' + L.n, L.W, L.H, view, v => paintIlhaMatoGround(L, v));
  for (const t of L.trees) if (seen(t.x, t.y, 320)) layers.push({ y: t.y, draw: () => ilhaTreeDraw(t, p) });
  for (const b of L.brush) if (seen(b.x, b.y, 120)) layers.push({ y: b.y, draw: () => mataNature(b.i, b.x, b.y, b.w, b.w * .85) });
  for (const r of L.rocks) if (seen(r.x, r.y, 160)) layers.push({ y: r.y, draw: () => mataNature(r.i, r.x, r.y, r.w, r.w * .75) });
  layers.push({ y: L.yIn - 36, draw: () => mataPlaca(300, L.yIn - 36, 'CERRAÇÃO · ' + L.n + '/' + ILHAMATO.last, 190) });
  for (const c of ilhaBausVisiveis(L)) if (seen(c.x, c.y, 120)) layers.push({ y: c.y, draw: () => drawCaveChest({ x: c.x, y: c.y, open: ilhaBauAberto(L, c) }) });
  // A névoa que tranca a saída enquanto o chefe estiver vivo.
  if (!ilhaMatoAberto(L) && seen(L.W - 120, L.H / 2, L.H)) layers.push({ y: 9e5, draw: () => {
    const g = ctx.createLinearGradient(L.W - 260, 0, L.W, 0); g.addColorStop(0, 'rgba(90,40,120,0)'); g.addColorStop(.4, 'rgba(90,40,120,.55)'); g.addColorStop(1, 'rgba(50,20,70,.85)'); ctx.fillStyle = g; ctx.fillRect(L.W - 260, 0, 260, L.H);
    ctx.save(); for (let k = 0; k < 10; k++) { const yy = (k * 211 + frameClock * 30) % L.H; ctx.globalAlpha = .2; ellipse(L.W - 120 + Math.sin(frameClock + k) * 40, yy, 110, 46, '#b890e0'); } ctx.restore();
  } });
  if (mataCombatOn() && !scene) drawMataNightLayers(layers, seen);
  layers.push({ y: 7e6, draw: () => ilhaShotsDraw(mataNight) });
  layers.push({ y: 8e9, draw: () => {
    mataNightVeil(view, L.dark); rect(view.x, view.y, view.w, view.h, L.n <= 4 ? 'rgba(60,20,80,.08)' : 'rgba(70,40,10,.07)');
    ctx.save(); for (let k = 0; k < 5; k++) { const fx = view.x + ((k * 811 + frameClock * 18) % (view.w + 900)) - 450, fy = view.y + (k * 377) % view.h; ctx.globalAlpha = .06; ellipse(fx, fy, 420, 90, '#cfd6e0'); } ctx.restore();
    darkHole(p.x, p.y - 40, 300 - L.n * 14, 900 - L.n * 45, '3,5,8', .5 + L.n * .03);
    // O brilho dos baús fechados, pra achar o ramal no escuro.
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const c of ilhaBausVisiveis(L)) if (!ilhaBauAberto(L, c) && Math.hypot(c.x - p.x, c.y - p.y) < 1000) glow(c.x, c.y - 22, 46, .22 + .1 * Math.sin(frameClock * 3 + c.x), '255,220,140'); ctx.restore();
  } });
}

// ---------- Os bichos ----------
function ilhaDist(b, p) { const dx = p.x - b.x, dy = p.y - b.y; return { dx, dy, d: Math.hypot(dx, dy) || 1 }; }
function ilhaTick0(b, dt) { b.t -= dt; b.cool = Math.max(0, b.cool - dt); b.hurt = Math.max(0, b.hurt - dt); b.attack = Math.max(0, b.attack - dt); b.frame += dt * 6; }
function ilhaSafeNow(p) { return worldOut.map === 'ilha' && ilhaSafe(p.x, p.y); }
function ilhaNotice(p, d, r = MATA_NIGHT.notice) { return !ilhaSafeNow(p) && d < r * mataNoticeMul(); }
function ilhaRoam(b, dt, speed = 55) {
  const r = mataGo(b, { x: b.tx, y: b.ty }, speed, dt);
  if (r === true || r === 'blocked' || b.t <= 0) { const a = Math.random() * Math.PI * 2, rr = 60 + Math.random() * 180, x = b.home.x + Math.cos(a) * rr, y = b.home.y + Math.sin(a) * rr * .7; if (mataFree(x, y)) { b.tx = x; b.ty = y; } b.t = 3 + Math.random() * 3; }
}
// Quem voa (bruxa, mariposa) e quem anda debaixo da terra passa por cima de pedra e de poça, mas não sai da picada.
function ilhaVoaLivre(x, y) { const m = worldOut.map; if (m === 'ilha') return ilhaLand(x, y, .02); if (m !== 'ilhamato') return true; const L = ilhaMatoLayout(); return ilhaMatoAbre(L, x, y) && (ilhaMatoAberto(L) || x < L.W - 240); }
function ilhaFly(b, vx, vy, dt) { const M = WORLD_MAPS[worldOut.map], nx = clamp(b.x + vx * dt, 60, M.W - 60), ny = clamp(b.y + vy * dt, 140, M.H - 40); if (ilhaVoaLivre(nx, ny)) { b.x = nx; b.y = ny; } else if (ilhaVoaLivre(nx, b.y)) b.x = nx; else if (ilhaVoaLivre(b.x, ny)) b.y = ny; }
function ilhaFlyRoam(b, dt, speed = 60) { if (b.t <= 0 || Math.hypot(b.tx - b.x, b.ty - b.y) < 10) { const a = Math.random() * Math.PI * 2; b.tx = b.home.x + Math.cos(a) * 140; b.ty = b.home.y + Math.sin(a) * 90; b.t = 2 + Math.random() * 3; } const k = Math.hypot(b.tx - b.x, b.ty - b.y) || 1; ilhaFly(b, (b.tx - b.x) / k * speed, (b.ty - b.y) / k * speed, dt); b.dx = b.tx < b.x ? -1 : 1; }
function ilhaArenaClamp(b) { if (worldOut.map !== 'ilhamato') return; const a = ilhaMatoLayout().arena; if (!a) return; const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), r = a.r * .92; if (d > r) { b.x = a.x + dx / d * r; b.y = a.y + dy / d * r; } }
function ilhaBlink(b, p, r) {
  fxPuffs(b.x, b.y - 80, 10, 90, '#9a6ad0'); const M = WORLD_MAPS[worldOut.map];
  for (let k = 0; k < 16; k++) { const a = Math.random() * Math.PI * 2, x = clamp(p.x + Math.cos(a) * r, 80, M.W - 80), y = clamp(p.y + Math.sin(a) * r * .6, 160, M.H - 60); if (ilhaVoaLivre(x, y)) { b.x = x; b.y = y; break; } }
  if (b.boss) ilhaArenaClamp(b);
  fxPuffs(b.x, b.y - 80, 10, 90, '#9a6ad0'); AudioEngine.caveGhost?.();
}
function ilhaPraga(N, b, p, off = 0) {
  const boss = !!b.boss, ox = b.x, oy = b.y - (boss ? 130 : 95), a = Math.atan2(p.y - 40 - oy, p.x - ox) + off, v = boss ? 300 : 260;
  N.ish.push({ x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 3.2, dmg: boss ? 18 : CAVE_BEASTS.bruxa.dmg, home: boss ? .6 : 1.1, boss }); AudioEngine.caveFireball?.();
}

// Pirata fantasma: mantém distância, mira (a linha avisa) e atira; quem sai da linha escapa.
function pirataTick(b, dt, p) {
  const B = CAVE_BEASTS.pirata, { dx, dy, d } = ilhaDist(b, p); ilhaTick0(b, dt); b.flash = Math.max(0, (b.flash || 0) - dt); if (b.shot && (b.shot.t -= dt) <= 0) b.shot = null;
  if (ilhaSafeNow(p) && b.state !== 'roam') { b.state = 'roam'; b.tx = b.home.x; b.ty = b.home.y; }
  if (b.state === 'roam') { if (ilhaNotice(p, d, 430)) { b.state = 'chase'; b.cool = .7; AudioEngine.caveCry?.('pirata'); return; } ilhaRoam(b, dt); return; }
  if (b.state === 'chase') {
    if (d > 820) { b.state = 'roam'; b.tx = b.home.x; b.ty = b.home.y; return; }
    b.dx = dx < 0 ? -1 : 1; const want = d > 430 ? 1 : d < 260 ? -1 : 0, side = b.side ??= (Math.random() < .5 ? -1 : 1);
    if (!mataStep(b, (dx / d * want - dy / d * side * .6) * B.speed, (dy / d * want + dx / d * side * .6) * B.speed, dt)) b.side = -side;
    if (b.cool <= 0 && d < 580) { b.state = 'aim'; b.t = .75; b.ax = p.x; b.ay = p.y - 30; AudioEngine.note?.(220, .06, 'square', .02); }
  } else if (b.state === 'aim') {
    b.dx = b.ax < b.x ? -1 : 1;
    if (b.t <= 0) {
      const g = pirataGun(b), ang = Math.atan2(b.ay - g.y, b.ax - g.x), ux = Math.cos(ang), uy = Math.sin(ang), px = p.x - g.x, py = p.y - 30 - g.y, along = px * ux + py * uy, off = Math.abs(px * uy - py * ux);
      if (along > 0 && along < 720 && off < 36) mataHurt(B.dmg * (b.dmgMul || 1), b);
      b.flash = .12; b.shot = { x0: g.x, y0: g.y, x1: g.x + ux * 720, y1: g.y + uy * 720, t: .16 }; AudioEngine.gunshot?.(.4, 1.25);
      b.state = 'chase'; b.cool = 2.2 + Math.random();
    }
  }
}
function pirataGun(b) { return { x: b.x + (b.dx < 0 ? -34 : 34), y: b.y - 62 }; }
function pirataWarn(b) {
  if (b.state === 'aim') { const g = pirataGun(b); teleLane(g.x, g.y, Math.atan2(b.ay - g.y, b.ax - g.x), 720, 40, teleK(b.t, .75), '255,80,60', .55); }
  if (b.shot) { ctx.save(); ctx.strokeStyle = `rgba(255,236,190,${b.shot.t * 5})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b.shot.x0, b.shot.y0); ctx.lineTo(b.shot.x1, b.shot.y1); ctx.stroke(); ctx.restore(); }
}
// Afogado: escondido na água; sai quando o Sadi chega perto, vem devagar e agarra (puxa o Sadi e tira vida).
function afogadoTick(b, dt, p, N) {
  const B = CAVE_BEASTS.afogado, { dx, dy, d } = ilhaDist(b, p); ilhaTick0(b, dt);
  if (b.state === 'submerso') { if (ilhaNotice(p, d, 250)) { b.state = 'rise'; b.t = .9; AudioEngine.caveCry?.('afogado'); } return; }
  if (b.state === 'rise') { b.rise = 1 - Math.max(0, b.t) / .9; if (b.t <= 0) { b.state = 'chase'; b.rise = 1; } return; }
  if (b.state === 'afunda') { if (b.t <= 0) { b.state = 'submerso'; b.x = b.home.x; b.y = b.home.y; } return; }
  if (b.state !== 'grab' && (ilhaSafeNow(p) || d > 650)) { b.state = 'afunda'; b.t = 1; return; }
  if (b.state === 'chase') {
    b.dx = dx < 0 ? -1 : 1; mataStep(b, dx / d * B.speed, dy / d * B.speed, dt);
    if (d < 48 && b.cool <= 0 && !N.grab) { b.state = 'grab'; b.t = 2.4; b.tick = .2; b.hp0 = b.hp; N.grab = b; effect('Agarrou!', p.x, p.y - 150, '#a8f0d0', 18); AudioEngine.bloop?.(260, .06); }
  } else if (b.state === 'grab') {
    if (b.hp < b.hp0 || b.t <= 0 || ilhaSafeNow(p)) { N.grab = null; b.state = 'solta'; b.t = 1.1; b.cool = 3.5; return; }
    if ((b.tick -= dt) <= 0) { b.tick = .6; N.inv = 0; mataHurt(B.dmg * (b.dmgMul || 1), { x: p.x, y: p.y }); }
  } else if (b.state === 'solta') { if (b.t <= 0) b.state = 'chase'; }
}
// Mariposa-bruxa: rodeia o Sadi em nuvem e morde de passagem.
function mariposaTick(b, dt, p) {
  const B = CAVE_BEASTS.mariposa, { d } = ilhaDist(b, p); ilhaTick0(b, dt); b.ang = (b.ang ?? Math.random() * 6.3) + dt * (2 + ((b.idx || 0) % 3) * .4);
  if (b.state === 'roam') { if (ilhaNotice(p, d, 380)) { b.state = 'swarm'; AudioEngine.caveCry?.('mariposa'); return; } const tx = b.home.x + Math.cos(b.ang) * 70, ty = b.home.y + Math.sin(b.ang * 1.3) * 40; ilhaFly(b, (tx - b.x) * 2, (ty - b.y) * 2, dt); return; }
  if (ilhaSafeNow(p) || d > 720) { b.state = 'roam'; return; }
  const r = 70 + 50 * Math.sin(b.ang * .7 + (b.idx || 0)), tx = p.x + Math.cos(b.ang) * r, ty = p.y + Math.sin(b.ang) * r * .6, k = Math.hypot(tx - b.x, ty - b.y) || 1, sp = Math.min(B.speed, k * 4);
  ilhaFly(b, (tx - b.x) / k * sp, (ty - b.y) / k * sp, dt); b.dx = tx < b.x ? -1 : 1;
  if (d < 40 && b.cool <= 0) { mataHurt(B.dmg * (b.dmgMul || 1), b); b.cool = 1.4; }
}
// Minhocão: debaixo da terra vem atrás do Sadi; o chão treme (o círculo avisa), sai, fica um tempo de fora e volta a cavar.
function minhocaoTick(b, dt, p) {
  const B = CAVE_BEASTS.minhocao, { dx, dy, d } = ilhaDist(b, p); ilhaTick0(b, dt);
  if (b.state === 'cavando') {
    if (!ilhaNotice(p, d, 540)) { ilhaFlyRoam(b, dt, 50); return; }
    b.dx = dx < 0 ? -1 : 1; ilhaFly(b, dx / d * B.speed, dy / d * B.speed, dt);
    if (d < 70 && b.cool <= 0) { b.state = 'tremor'; b.t = .9; b.wx = p.x; b.wy = p.y; AudioEngine.caveCrumble?.(); }
  } else if (b.state === 'tremor') { if (b.t <= 0) { b.state = 'erupcao'; b.t = .35; b.x = b.wx; b.y = b.wy; AudioEngine.thud?.(); fxPuffs(b.x, b.y, 14, 120, '#7a5a3a'); if (Math.hypot(p.x - b.x, p.y - b.y) < 80) mataHurt(B.dmg * (b.dmgMul || 1), b); } }
  else if (b.state === 'erupcao') { if (b.t <= 0) { b.state = 'exposto'; b.t = 2.4; } }
  else if (b.state === 'exposto') { b.dx = dx < 0 ? -1 : 1; if (d < 92 && b.attack <= 0) { mataHurt(14, b); b.attack = 1.2; } if (b.t <= 0) { b.state = 'mergulho'; b.t = .5; } }
  else if (b.state === 'mergulho') { if (b.t <= 0) { b.state = 'cavando'; b.cool = 1.6; fxPuffs(b.x, b.y, 8, 80, '#7a5a3a'); } }
}
function minhocaoWarn(b) { if (b.state === 'tremor') teleArea(b.wx, b.wy, 82, 34, teleK(b.t, .9), '255,150,60'); }
// Bruxa (e a Bruxa-mor): flutua longe do Sadi e joga praga; apanhando, some e aparece do outro lado.
const ILHA_BRUXA_FOGE = { longe: 270, some: 150, salto: 340, cd: 2.6, vel: 1.9 };
function bruxaTick(b, dt, p, N) {
  const boss = b.kind === 'bruxaMor', B = CAVE_BEASTS[b.kind], { dx, dy, d } = ilhaDist(b, p); ilhaTick0(b, dt); b.blink = Math.max(0, (b.blink || 0) - dt);
  if (!boss && b.state === 'roam') { if (ilhaNotice(p, d, 420)) { b.state = 'hover'; b.cool = 1; AudioEngine.caveCry?.('bruxa'); } else ilhaFlyRoam(b, dt); return; }
  if (!boss && (ilhaSafeNow(p) || d > 820)) { b.state = 'roam'; return; }
  if (b.hurt > 0 && b.blink <= 0 && b.state === 'hover') { ilhaBlink(b, p, boss ? 330 : 270); b.blink = boss ? 5 : 4; }
  // Chegou perto, ela foge ligeiro; se o Sadi encosta, some e aparece longe (o arpão puxa e segura ela).
  b.foge = Math.max(0, (b.foge || 0) - dt);
  if (!boss && b.state === 'hover' && d < ILHA_BRUXA_FOGE.longe) {
    if (d < ILHA_BRUXA_FOGE.some && b.foge <= 0) { ilhaBlink(b, p, ILHA_BRUXA_FOGE.salto); b.foge = ILHA_BRUXA_FOGE.cd; return; }
    const side = b.side ??= 1; b.dx = dx < 0 ? -1 : 1;
    ilhaFly(b, (-dx / d * ILHA_BRUXA_FOGE.vel - dy / d * side * .5) * B.speed, (-dy / d * ILHA_BRUXA_FOGE.vel + dx / d * side * .5) * B.speed, dt); return;
  }
  const angry = b.hp < b.max * .5;
  if (b.state === 'hover') {
    const want = d > (boss ? 420 : 380) ? 1 : d < 250 ? -1 : 0, side = b.side ??= 1; b.dx = dx < 0 ? -1 : 1;
    ilhaFly(b, (dx / d * want - dy / d * side * .7) * B.speed, (dy / d * want + dx / d * side * .7) * B.speed, dt); if (Math.random() < dt * .3) b.side = -side; if (boss) ilhaArenaClamp(b);
    if (b.cool <= 0) {
      if (!boss) { b.state = 'cast'; b.t = .6; return; }
      const roll = Math.random(), minions = N.beasts.filter(x => x.minion && x.hp > 0).length;
      if (roll < .35) { b.state = 'leque'; b.t = .7; }
      else if (roll < .68) { b.state = 'roda'; b.t = 1.1; b.circles = [0, 1, 2].map(k => k ? { x: p.x + (Math.random() - .5) * 300, y: p.y + (Math.random() - .5) * 180 } : { x: p.x, y: p.y }); }
      else if (minions < (angry ? 9 : 6)) { b.state = 'chama'; b.t = .8; AudioEngine.caveCry?.('bruxaMor'); }
      else { b.state = 'leque'; b.t = .6; }
    }
  } else if (b.state === 'cast') { if (b.t <= 0) { ilhaPraga(N, b, p); b.state = 'hover'; b.cool = 2.2 + Math.random() * .8; } }
  else if (b.state === 'leque') { if (b.t <= 0) { const k = angry ? 7 : 5; for (let i = 0; i < k; i++) ilhaPraga(N, b, p, (i - (k - 1) / 2) * .2); b.state = 'hover'; b.cool = angry ? 1.1 : 1.6; } }
  else if (b.state === 'roda') { if (b.t <= 0) { for (const c of b.circles) { fxPuffs(c.x, c.y - 20, 10, 100, '#b070e0'); if (Math.hypot(p.x - c.x, (p.y - c.y) * 1.3) < 78) mataHurt(22, c); } AudioEngine.caveCrumble?.(); b.circles = null; b.state = 'hover'; b.cool = 1.8; } }
  else if (b.state === 'chama') { if (b.t <= 0) { for (let i = 0; i < 4; i++) N.beasts.push(ilhaMob('mariposa', { x: b.x + (Math.random() - .5) * 120, y: b.y + (Math.random() - .5) * 80 }, Math.random, { minion: true, state: 'swarm' })); if (angry && N.beasts.filter(x => x.minion && x.kind === 'bruxa' && x.hp > 0).length < 2) N.beasts.push(ilhaMob('bruxa', { x: b.x + 160, y: b.y }, Math.random, { minion: true, state: 'hover', hpMul: .8 })); b.state = 'hover'; b.cool = 2; } }
}
function bruxaWarn(b) {
  if (b.state === 'roda' && b.circles) for (const c of b.circles) teleArea(c.x, c.y, 78, 34, teleK(b.t, 1.1), '200,90,255');
  if (b.state === 'cast' || b.state === 'leque') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(b.x, b.y - (b.boss ? 130 : 95), 40 + 30 * teleK(b.t, .7), .5, '200,110,255'); ctx.restore(); }
}
// Bernúncia (e a Bernúncia-mãe): vem atrás, avisa o bote e engole. A mãe ainda investe de longe, dá rabanada e cospe filhotes.
function ilhaTrail(b) { const s = b.scale || (b.kind === 'bernunciaMae' ? 1.9 : 1), T = b.trail ??= [], q = T[T.length - 1]; if (!q || Math.hypot(q.x - b.x, q.y - b.y) > 16 * s) { T.push({ x: b.x, y: b.y }); if (T.length > 10) T.shift(); } }
function bernunciaTick(b, dt, p, N) {
  const boss = b.kind === 'bernunciaMae', B = CAVE_BEASTS[b.kind], s = b.scale || (boss ? 1.9 : 1), { dx, dy, d } = ilhaDist(b, p); ilhaTick0(b, dt);
  if (!boss && b.state === 'roam') { if (ilhaNotice(p, d, 390)) { b.state = 'chase'; AudioEngine.caveCry?.('bernuncia'); } else ilhaRoam(b, dt, 50); ilhaTrail(b); return; }
  if (!boss && (ilhaSafeNow(p) || d > 820)) { b.state = 'roam'; return; }
  const angry = b.hp < b.max * .5;
  if (b.state === 'chase') {
    b.dx = dx < 0 ? -1 : 1; mataStep(b, dx / d * B.speed, dy / d * B.speed, dt);
    if (b.cool <= 0) {
      const bote = (len, wind, dash, sp, bite) => { b.state = 'windup'; b.t = b.t0 = wind; b.vx = dx / d; b.vy = dy / d; b.len = len; b.dash = dash; b.sp = sp; b.bite = bite; };
      if (!boss) { if (d < 260) bote(260, .55, .34, 560, B.dmg); }
      else if (angry && Math.random() < .25 && N.beasts.filter(x => x.minion && x.hp > 0).length < 3) { b.state = 'filhotes'; b.t = .8; AudioEngine.caveCry?.('bernunciaMae'); }
      else if (d < 230 && Math.random() < .45) { b.state = 'rabo'; b.t = .8; }
      else if (d > 300 && Math.random() < .55) bote(900, .9, .9, 760, 32);
      else bote(300, .6, .38, 640, 30);
    }
  } else if (b.state === 'windup') { if (b.t <= 0) { b.state = 'lunge'; b.t = b.dash; AudioEngine.caveGrowl?.(.3, boss ? .1 : .07); } }
  else if (b.state === 'lunge') {
    if (!mataStep(b, b.vx * b.sp, b.vy * b.sp, dt)) b.t = 0;
    if (b.attack <= 0 && Math.hypot(p.x - b.x, p.y - b.y) < B.r + 34 * s) { mataHurt(b.bite * (b.dmgMul || 1), b); b.attack = .6; effect('Nhac!', p.x, p.y - 150, '#ffd08a', 20); }
    if (b.t <= 0) { b.state = 'rest'; b.t = boss ? .7 : .9; b.cool = boss ? 1.2 : 1.6; }
  } else if (b.state === 'rabo') { if (b.t <= 0) { if (Math.hypot(p.x - b.x, (p.y - b.y) * 1.3) < 210 * (s / 1.9) + 40) mataHurt(22, b); fxPuffs(b.x, b.y, 16, 200, '#c8a070'); AudioEngine.thud?.(); b.state = 'rest'; b.t = .6; b.cool = 1.4; } }
  else if (b.state === 'filhotes') { if (b.t <= 0) { for (const o of [-1, 1]) N.beasts.push(ilhaMob('bernuncia', { x: b.x + o * 120, y: b.y + 40 }, Math.random, { minion: true, state: 'chase', scale: .7, hpMul: .5 })); b.state = 'rest'; b.t = .5; b.cool = 2; } }
  else if (b.state === 'rest') { if (b.t <= 0) b.state = 'chase'; }
  if (boss) ilhaArenaClamp(b); ilhaTrail(b);
}
function bernunciaWarn(b) {
  const s = b.scale || (b.kind === 'bernunciaMae' ? 1.9 : 1);
  if (b.state === 'windup') teleLane(b.x, b.y - 20, Math.atan2(b.vy, b.vx), b.len, 70 * s, teleK(b.t, b.t0), '255,130,40', .6);
  if (b.state === 'rabo') teleArea(b.x, b.y, 210 * (s / 1.9) + 40, (210 * (s / 1.9) + 40) * .7, teleK(b.t, .8), '255,160,60');
}

// ---------- Os chefes ----------
function ilhaChefeChega(N, L) {
  N.chefe = true; keys.clear(); const p = worldOut, a = L.arena;
  N.beasts.push(ilhaMob(L.boss, { x: a.x + (p.x < a.x ? 220 : -220), y: a.y }, Math.random, { boss: true, state: L.boss === 'bruxaMor' ? 'hover' : 'chase', cool: 1.5 }));
  if (L.boss === 'bruxaMor') { AudioEngine.caveCry?.('bruxaMor'); talk([['card', '<b>🧹 A Bruxa-mor</b><br>No meio da clareira de cinzas, uma velha de xale preto flutua num redemoinho de mariposas. É ela que segura a cerração: enquanto ela estiver aqui, a mata não deixa ninguém passar.<br><br>· As bolas roxas seguem o Sadi: corre de lado.<br>· Os círculos roxos no chão estouram: sai de dentro.<br>· Quando apanha, ela some e aparece do outro lado.', 'Mata da cerração'], ['sadi', 'Bah… então é verdade o que contam das bruxas da ilha.']], null, 'Em guarda!'); }
  else { AudioEngine.caveCry?.('bernunciaMae'); talk([['card', '<b>🐉 A Bernúncia-mãe</b><br>A terra treme e da mata sai uma bernúncia enorme, colorida como as do Boi-de-Mamão, mas de verdade, com uma bocarra que engole boi inteiro. Ela guarda a subida pro alto da ilha.<br><br>· A faixa laranja comprida é a investida: sai da frente.<br>· O círculo laranja em volta dela é a rabanada.<br>· Braba, ela cospe filhotes.', 'Mata da cerração'], ['sadi', 'Essa aí não é de pano, não!']], null, 'Em guarda!'); }
}
function ilhaChefeVencido(b, N) {
  const st = ilhaState(); st[b.kind] = G.day; N.beasts.forEach(x => { if (x.minion) x.hp = 0; }); N.ish = []; mataXP(80); save();
  const bruxa = b.kind === 'bruxaMor', rw = bruxa ? { cash: 300, xp: 150 } : { cash: 450, xp: 220 };
  grantReward(rw);
  talk([['card', bruxa ? '<b>🧹 A Bruxa-mor caiu</b><br>Ela vira uma nuvem de mariposas e some entre as árvores, rindo baixinho. A névoa roxa da saída se desfaz: a cerração deixa passar.' : '<b>🐉 A Bernúncia-mãe fugiu</b><br>Ferida, ela se enfia mata adentro, rugindo, e o chão para de tremer. A subida pro alto da ilha tá livre.', 'Mata da cerração'], ['reward', rw, bruxa ? 'A Bruxa-mor' : 'A Bernúncia-mãe']], null, 'Seguir');
}
function ilhaBossBar(b) {
  const dpr = canvas.width / Math.max(1, canvas.clientWidth), W = canvas.clientWidth, left = 316, right = W - 280, narrow = right - left < 300, w = narrow ? W - 32 : Math.min(520, right - left), x = narrow ? 16 : left + (right - left - w) / 2, y = narrow ? 108 : 16, bruxa = b.kind === 'bruxaMor';
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); rect(x, y, w, 46, 'rgba(14,10,18,.88)', 8, bruxa ? '#b070e0' : '#e0a040'); txt((bruxa ? '🧹 ' : '🐉 ') + CAVE_BEASTS[b.kind].name, x + w / 2, y + 14, 13, '#f4ecff', 'center', 'Georgia', false); rect(x + 12, y + 24, w - 24, 12, '#201628', 5); rect(x + 12, y + 24, (w - 24) * Math.max(0, b.hp) / b.max, 12, bruxa ? '#b878f0' : '#f0a848', 5); ctx.restore();
}
// Por quadro: as pragas no ar, o afogado puxando e o chefe aparecendo quando o Sadi entra na clareira.
function ilhaCombatExtras(N, dt, p) {
  N.ish ??= [];
  for (const s of N.ish) {
    s.t -= dt; const tx = p.x - s.x, ty = p.y - 40 - s.y, a = Math.atan2(s.vy, s.vx), v = Math.hypot(s.vx, s.vy), da = clamp(Math.atan2(Math.sin(Math.atan2(ty, tx) - a), Math.cos(Math.atan2(ty, tx) - a)), -s.home * dt, s.home * dt);
    s.vx = Math.cos(a + da) * v; s.vy = Math.sin(a + da) * v; s.x += s.vx * dt; s.y += s.vy * dt;
    if (Math.hypot(tx, ty) < 30) { s.t = 0; if (!(mataBuffs.reza > 0)) mataHurt(s.dmg, { x: s.x, y: s.y + 40 }); else effect('A reza segurou a praga', p.x, p.y - 150, '#e8f0a0', 14); fxPuffs(s.x, s.y, 6, 60, '#b080e0'); }
  }
  N.ish = N.ish.filter(s => s.t > 0);
  const g = N.grab; if (g) { if (g.hp <= 0 || g.state !== 'grab') N.grab = null; else { const k = Math.min(1, dt * 10); worldOut.x += (g.x + (g.dx < 0 ? -30 : 30) - worldOut.x) * k; worldOut.y += (g.y + 4 - worldOut.y) * k; } }
  if (worldOut.map === 'ilhamato') { const L = ilhaMatoLayout(); if (L.boss && !ilhaState()[L.boss] && !N.chefe && Math.hypot(p.x - L.arena.x, p.y - L.arena.y) < L.arena.r * .8) ilhaChefeChega(N, L); }
}
function ilhaShotsDraw(N) {
  if (!N?.ish?.length) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const s of N.ish) glow(s.x, s.y, s.boss ? 36 : 28, .55, '190,90,255'); ctx.restore();
  for (const s of N.ish) ellipse(s.x, s.y, s.boss ? 9 : 7, s.boss ? 9 : 7, '#f0d8ff');
}

// ---------- Desenho dos bichos ----------
// Figuras pintadas (piratas, afogados, bruxas), com quatro quadros de passo e o tom de alma de cada um.
const ILHA_LOOKS = {
  pirata: { look: { skin: '#d8c0a8', hair: '#2a1a10', style: 'short', mustache: true, hat: 'brim', hatColor: '#1a1418', coat: '#4a1c1c', shirt: '#e8e0d0', pants: '#2a2a38', boots: '#141010', sash: '#b02a2a' }, tint: 'rgba(150,200,255,.3)' },
  afogado: { look: { skin: '#a8c4b4', hair: '#30443a', style: 'long', shirt: '#6c7c72', pants: '#3c4c4a', barefoot: true }, tint: 'rgba(90,170,150,.32)', alga: true },
  bruxa: { look: { skin: '#c4cca8', hair: '#d8d8d0', style: 'long', skirt: '#2a1c30', boots: '#1a1418', shirt: '#3c2a44', item: 'stick' }, tint: 'rgba(170,120,220,.16)', chapeu: '#1c1420' },
  bruxaMor: { look: { skin: '#b4bc98', hair: '#1c1a1c', style: 'long', skirt: '#140c18', boots: '#0c0a0c', shirt: '#2a1430', item: 'staff' }, tint: 'rgba(220,80,160,.18)', chapeu: '#0e0a10' }
};
const ilhaGhostArt = new Map();
function ilhaGhost(id, frame = 0) {
  const key = id + ':' + frame; if (ilhaGhostArt.has(key)) return ilhaGhostArt.get(key);
  const D = ILHA_LOOKS[id], c = document.createElement('canvas'); c.width = 240; c.height = 460; const main = ctx; ctx = c.getContext('2d');
  try {
    ctx.translate(120, 440); ctx.scale(2, 2); paintFolk({ ...D.look, step: [0, 6, 0, -6][frame] });
    if (D.chapeu) { ctx.fillStyle = D.chapeu; ctx.beginPath(); ctx.ellipse(0, -134, 30, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(-15, -136); ctx.quadraticCurveTo(-4, -170, 10, -196); ctx.quadraticCurveTo(6, -168, 15, -136); ctx.closePath(); ctx.fill(); rect(-15, -142, 30, 5, '#5a2a6a', 2); }
    if (D.alga) { ctx.strokeStyle = '#3a6a3a'; ctx.lineWidth = 2.5; for (const x of [-14, -4, 10]) { ctx.beginPath(); ctx.moveTo(x, -100); ctx.quadraticCurveTo(x + 6, -80, x - 2, -60); ctx.stroke(); } }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = D.tint; ctx.fillRect(0, 0, 240, 460);
  } finally { ctx = main; }
  ilhaGhostArt.set(key, c); return c;
}
function ilhaWalkFrame(b) { return b.moving || b.state === 'chase' ? Math.floor(b.frame * .7) % 4 : 0; }
function drawPirata(b) {
  const c = ilhaGhost('pirata', ilhaWalkFrame(b)), s = b.dx < 0 ? -1 : 1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(b.x, b.y - 70, 80, .12, '150,200,255'); if (b.flash > 0) { const g = pirataGun(b); glow(g.x + s * 20, g.y, 40, .8, '255,220,140'); } ctx.restore();
  ellipse(b.x, b.y + 3, 22, 6, 'rgba(10,14,8,.3)');
  ctx.save(); ctx.globalAlpha = .88 * (b.hurt > 0 ? .6 : 1); ctx.translate(b.x, b.y); ctx.scale(s * .9, .9); ctx.drawImage(c, -60, -220, 120, 230);
  ctx.translate(20, -66); ctx.rotate(b.state === 'aim' ? Math.atan2(b.ay - (b.y - 62), Math.abs(b.ax - b.x)) : .9); rect(0, -3, 28, 6, '#2a2420', 2); rect(-4, -2, 8, 12, '#5a3a20', 2);
  ctx.restore(); mataHpBar(b, 'Pirata fantasma', 165);
}
function drawAfogado(b) {
  if (b.state === 'submerso') { for (let k = 0; k < 3; k++) { const t = (frameClock * .8 + k / 3) % 1; ellipse(b.home.x + (k - 1) * 9, b.home.y - t * 16, 3 + t * 2, 3 + t * 2, `rgba(200,230,220,${.5 * (1 - t)})`); } return; }
  const rise = b.state === 'rise' ? b.rise || 0 : b.state === 'afunda' ? Math.max(0, b.t) : 1, c = ilhaGhost('afogado', ilhaWalkFrame(b)), s = b.dx < 0 ? -1 : 1;
  ellipse(b.x, b.y + 3, 22, 6, 'rgba(10,20,16,.35)'); if (rise < 1) ellipse(b.x, b.y, 44, 13, 'rgba(60,110,100,.55)');
  ctx.save(); ctx.beginPath(); ctx.rect(b.x - 80, b.y - 260, 160, 262); ctx.clip(); ctx.globalAlpha = .9 * (b.hurt > 0 ? .6 : 1); ctx.translate(b.x, b.y + (1 - rise) * 200); ctx.scale(s * .92, .92); ctx.drawImage(c, -60, -220, 120, 230); ctx.restore();
  if (rise >= 1) mataHpBar(b, 'Afogado', 160);
}
function drawMariposa(b) {
  const fl = Math.abs(Math.sin(frameClock * 26 + (b.idx || 0) * 1.7)), y = b.y - 54 + Math.sin(frameClock * 3 + b.x * .01) * 6;
  ellipse(b.x, b.y + 2, 10, 4, 'rgba(0,0,0,.25)');
  ctx.save(); ctx.translate(b.x, y); ctx.globalAlpha = b.hurt > 0 ? .6 : 1;
  for (const side of [-1, 1]) { ctx.save(); ctx.scale(side, .45 + .55 * fl); ctx.fillStyle = '#3a2a1e'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(22, -26, 34, -6); ctx.quadraticCurveTo(26, 10, 0, 4); ctx.fill(); ctx.fillStyle = '#5a4430'; ctx.beginPath(); ctx.moveTo(0, 2); ctx.quadraticCurveTo(18, 22, 26, 14); ctx.quadraticCurveTo(14, 4, 0, 2); ctx.fill(); ellipse(18, -8, 4, 3, '#c8a868'); ellipse(18, -8, 2, 1.5, '#1a1008'); ctx.restore(); }
  ellipse(0, 0, 4, 11, '#2a1c12'); ctx.restore();
}
function drawMinhocao(b) {
  if (b.state === 'cavando' || b.state === 'tremor') { const w = Math.sin(frameClock * 9) * 3; ellipse(b.x, b.y, 46, 16, 'rgba(70,50,30,.75)'); for (let k = 0; k < 6; k++) { const a = k * 1.05 + frameClock * 2; ellipse(b.x + Math.cos(a) * 34, b.y + Math.sin(a) * 10 - 4 + w * (k % 2 ? 1 : -1), 8, 5, '#5a4028'); } return; }
  const k = b.state === 'erupcao' ? 1 - Math.max(0, b.t) / .35 : b.state === 'mergulho' ? Math.max(0, b.t) / .5 : 1, H = 210 * k, sway = Math.sin(frameClock * 3) * 18 * k, dir = b.dx < 0 ? -1 : 1;
  ellipse(b.x, b.y + 4, 64, 20, '#2a1c10'); ellipse(b.x, b.y, 54, 16, '#140c06');
  ctx.save(); ctx.globalAlpha = b.hurt > 0 ? .7 : 1;
  for (let i = 0; i <= 9; i++) { const t = i / 9, x = b.x + Math.sin(t * Math.PI) * 40 * dir + sway * t, y = b.y - t * H, r = 30 - t * 6; ellipse(x, y, r, r * .9, i % 2 ? '#b07a6a' : '#9c6658'); ctx.strokeStyle = 'rgba(60,30,24,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, r, r * .9, 0, 0, Math.PI * 2); ctx.stroke(); }
  const hx = b.x + sway, hy = b.y - H - 8; ellipse(hx, hy, 26, 20, '#5a2420');
  ctx.fillStyle = '#f0e8d0'; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(hx + Math.cos(a) * 22, hy + Math.sin(a) * 17); ctx.lineTo(hx + Math.cos(a + .12) * 11, hy + Math.sin(a + .12) * 8); ctx.lineTo(hx + Math.cos(a + .3) * 22, hy + Math.sin(a + .3) * 17); ctx.fill(); }
  ctx.restore(); if (k >= 1) mataHpBar(b, 'Minhocão', H + 60);
}
function drawBruxa(b) {
  const boss = b.kind === 'bruxaMor', s = boss ? 1.5 : 1, c = ilhaGhost(boss ? 'bruxaMor' : 'bruxa', 0), hover = 22 + Math.sin(frameClock * 2.4 + b.x * .01) * 7, dir = b.dx < 0 ? -1 : 1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(b.x, b.y - 90 * s - hover, 90 * s, .18, boss ? '255,80,140' : '190,110,255'); ctx.restore();
  ellipse(b.x, b.y + 3, 18 * s, 5 * s, 'rgba(10,8,14,.3)');
  ctx.save(); ctx.globalAlpha = b.hurt > 0 ? .6 : 1; ctx.translate(b.x, b.y - hover); ctx.scale(dir * s * .95, s * .95); ctx.drawImage(c, -60, -220, 120, 230); ctx.restore();
  if (!boss) mataHpBar(b, 'Bruxa', 150 + hover);
}
const BERN_CORES = ['#c8302a', '#e8b830', '#2a8a4a', '#2a5ab0', '#e86a1a'];
function drawBernuncia(b) {
  const boss = b.kind === 'bernunciaMae', s = b.scale || (boss ? 1.9 : 1), trail = b.trail || [], open = b.state === 'windup' ? 1 : b.state === 'lunge' ? .75 : .2 + .1 * Math.sin(frameClock * 4);
  ellipse(b.x, b.y + 4, 54 * s, 14 * s, 'rgba(10,8,4,.32)');
  ctx.save(); if (b.hurt > 0) ctx.globalAlpha = .7;
  // O corpo de pano colorido, com franja, vindo atrás da cabeça.
  for (let i = 0; i < trail.length; i++) {
    const q = trail[i], t = (i + 1) / (trail.length + 1), r = (10 + t * 18) * s, yy = q.y - (18 + t * 10) * s;
    ellipse(q.x, yy, r, r * .85, BERN_CORES[(i + (b.idx || 0)) % BERN_CORES.length]); ctx.strokeStyle = 'rgba(20,10,4,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(q.x, yy, r, r * .85, 0, 0, Math.PI * 2); ctx.stroke();
    for (let f = -2; f <= 2; f++) rect(q.x + f * r * .35 - 1.5, yy + r * .7, 3, 7 * s, '#f0e0b0');
  }
  // A cabeça: a bocarra (aberta no bote), os dentes, os olhos redondos e os chifrinhos.
  ctx.translate(b.x, b.y - 34 * s); ctx.scale((b.dx < 0 ? -1 : 1) * s, s);
  ellipse(-6, 0, 30, 24, '#c8302a');
  ctx.fillStyle = '#3a0c08'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(56, -8 - open * 12); ctx.lineTo(52, 8 + open * 18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d83a2a'; ctx.beginPath(); ctx.moveTo(-10, -18); ctx.quadraticCurveTo(30, -26 - open * 10, 60, -10 - open * 14); ctx.lineTo(58, -2 - open * 8); ctx.quadraticCurveTo(24, -4 - open * 4, -8, 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b02a20'; ctx.beginPath(); ctx.moveTo(-8, 6); ctx.quadraticCurveTo(24, 8 + open * 8, 56, 6 + open * 18); ctx.lineTo(52, 14 + open * 20); ctx.quadraticCurveTo(20, 22 + open * 8, -6, 16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f4ecd8'; for (let k = 0; k < 5; k++) { const tx = 14 + k * 9, up = -4 - open * (3 + k * 2), dn = 8 + open * (3 + k * 3); ctx.beginPath(); ctx.moveTo(tx, up); ctx.lineTo(tx + 4, up + 7); ctx.lineTo(tx + 8, up); ctx.fill(); ctx.beginPath(); ctx.moveTo(tx, dn); ctx.lineTo(tx + 4, dn - 7); ctx.lineTo(tx + 8, dn); ctx.fill(); }
  ellipse(8, -20, 9, 9, '#f8f4e8'); ellipse(10, -20, 4, 5, '#141010'); rect(-12, -40, 6, 15, '#e8b830', 2); rect(0, -42, 6, 15, '#e8b830', 2);
  ctx.restore();
  if (!b.boss) mataHpBar(b, 'Bernúncia', 100 * s);
}

// ---------- Ligações ----------
Object.assign(ILHA_MOBS, {
  pirata: { tick: pirataTick, draw: drawPirata, warn: pirataWarn, xp: 6, cry(dead) { if (dead) this.caveVoice?.([180, 120, 80], .6, { formant: 600, vol: .045, vib: 6, rate: 5 }); else this.caveVoice?.([150, 200, 170], .22, { formant: 700, q: 1.5, vol: .04, vib: 5, rate: 6 }); } },
  afogado: { start: 'submerso', tick: afogadoTick, draw: drawAfogado, xp: 6, immune: b => b.state === 'submerso' || b.state === 'afunda', cry(dead) { this.bloop?.(dead ? 200 : 300, .06); this.caveVoice?.([110, 90, 70], dead ? .8 : .5, { formant: 400, q: 2, vol: .05, vib: 4, rate: 3 }); } },
  mariposa: { tick: mariposaTick, draw: drawMariposa, xp: 1, cry(dead) { this.noise?.(dead ? .1 : .15, .03, dead ? 2400 : 3000); } },
  minhocao: { start: 'cavando', tick: minhocaoTick, draw: drawMinhocao, warn: minhocaoWarn, xp: 10, immune: b => b.state === 'cavando' || b.state === 'tremor', cry(dead) { if (dead) this.caveCrumble?.(); else this.caveVoice?.([70, 55], .6, { formant: 200, vol: .06 }); } },
  bruxa: { tick: bruxaTick, draw: drawBruxa, warn: bruxaWarn, xp: 8, cry(dead) { if (dead) this.caveVoice?.([900, 600, 300], .7, { type: 'triangle', formant: 1200, vol: .04, vib: 20, rate: 9 }); else this.caveGiggle?.(); } },
  bruxaMor: { start: 'hover', tick: bruxaTick, draw: drawBruxa, warn: bruxaWarn, xp: 0, onKill: ilhaChefeVencido, cry(dead) { if (dead) this.caveVoice?.([1000, 700, 400, 200], 1.4, { type: 'triangle', formant: 1200, vol: .05, vib: 24, rate: 9 }); else { this.caveGiggle?.(); setTimeout(() => this.caveGiggle?.(), 260); } } },
  bernuncia: { tick: bernunciaTick, draw: drawBernuncia, warn: bernunciaWarn, xp: 12, cry(dead) { this.caveGrowl?.(dead ? .8 : .35, dead ? .08 : .07); } },
  bernunciaMae: { start: 'chase', tick: bernunciaTick, draw: drawBernuncia, warn: bernunciaWarn, xp: 0, onKill: ilhaChefeVencido, cry(dead) { this.caveGrowl?.(dead ? 1.2 : .6, dead ? .1 : .09); } }
});
{
  // Debaixo da terra ou da água, o bicho não leva golpe nem tiro.
  const atk = mataAttack; mataAttack = function () { const N = mataNight, hid = N?.ilha ? N.beasts.filter(b => b.hp > 0 && ILHA_MOBS[b.kind]?.immune?.(b)) : []; hid.forEach(b => { b.hpGuard = b.hp; b.hp = 0; }); try { return atk(); } finally { hid.forEach(b => { b.hp = b.hpGuard; }); } };
  const targets = rangedTargets; rangedTargets = function () { return targets().filter(b => !ILHA_MOBS[b.kind]?.immune?.(b)); };
  // Entrando num trecho, ele fica guardado; chegando lá em cima pela primeira vez, a fortaleza aparece.
  const swap = switchMap; switchMap = function (to) {
    const st = ilhaState(); if (to.map === 'ilhamato' && to.n) { st.trecho = to.n; st.fundo = Math.max(st.fundo || 0, to.n); }
    const r = swap(to);
    if (to.planalto && !st.planalto) { st.planalto = G.day; save(); talk([['card', '<b>🏰 O alto da ilha</b><br>A mata da cerração acaba de repente, e lá está ela: a fortaleza velha do Império, com os marinheiros de farda na muralha. As masmorras ficam embaixo do pátio.<br><br>Daqui pra frente dá pra subir direto do trapiche pela <b>trilha velha</b>, escondida no paredão.', 'Ilha da Fortaleza']], null, 'Bora'); }
    return r;
  };
}
