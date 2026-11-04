// A Ilha da Fortaleza: o arco do Bento, depois da Batalha de Laguna.
//   · Missão "Levaram o Bento!": num dia depois de Laguna, no pinheiral (ou na barra), o Garibaldi e a Anita contam que
//     os marinheiros que não baixaram a bandeira levaram o Bento pra ilha da fortaleza, no mar de Santa Catarina.
//     Em Santa Catarina, o Peixinho na Brasa conta do seu Nereu, barqueiro do Itajaí-Açu, que fica no trapiche no fim da
//     rua; pagando a viagem (ida e volta), ele leva o Sadi até a ilha e espera no trapiche de lá.
//   · A parte de baixo da ilha é dos piratas fantasmas e dos afogados (ilha-cerracao.js). O rio corta a ilha de oeste a
//     leste: dá pra passar pela ponte do meio, pela ponte de corda a leste ou contornando a nascente, a oeste. Depois do
//     rio, um paredão de pedra cerca o alto da ilha; a picada no pé dele entra na Mata da cerração (sete trechos, cada vez
//     mais escuros, com as bruxas e as bernúncias), que sai lá em cima, na fortaleza dos marinheiros: muralha,
//     baluartes, quartel, comandância, paiol e a escada da cripta. Perto do barco do seu Nereu ninguém chega, e o
//     fogo do trapiche cura.
//   · A cripta (as masmorras embaixo do pátio) fica trancada: a chave cai do almirante Grenfell (ilha-grenfell.js).
//     Lá embaixo, derrubados os carcereiros, a cela do fundo conta pra onde levaram o Bento (ilha-resgate.js), e a
//     missão termina quando o Sadi volta pro pinheiral e conta tudo pro Giuseppe.
//   · O farol, os ranchos de pescador e a capela em ruínas ficam prontos pra histórias que ainda vão vir.
// O combate é o mesmo da mata (mata-vida.js): facão, armas, bornal, poderes e a vida da caverna.
'use strict';

CAVE_BEASTS.marujo = { name: 'Marinheiro da fortaleza', hp: 140, speed: 205, dmg: 20, r: 26, cash: [6, 12], from: 999, weight: 0 };
const ILHA = { W: 6400, H: 5200, cx: 3200, cy: 2700, rx: 2900, ry: 2300, fare: 150,
  arrive: { x: 3000, y: 4720 }, safe: { x: 2950, y: 4760, r: 480 }, pier: { x: 2950, y: 4640, w: 100, h: 410 },
  fogo: { x: 2790, y: 4700 }, boat: { x: 3115, y: 5010 }, placa: { x: 3230, y: 4660 },
  farol: { x: 5450, y: 1650 }, ranchos: { x: 4700, y: 4250 }, capela: { x: 1600, y: 3750 } };
function ilhaState() { return G.ilha ??= {}; }
function ilhaAqui() { const m = worldOut?.map; return m === 'ilha' || m === 'masmorra' || m === 'ilhamato'; }

// ---------- O chão da ilha: a costa, o rio e as trilhas ----------
function ilhaK(a) { return 1 + .06 * Math.sin(3 * a + .8) + .04 * Math.sin(5 * a + 2.1) + .025 * Math.sin(11 * a + .3); }
function ilhaD(x, y) { const nx = (x - ILHA.cx) / ILHA.rx, ny = (y - ILHA.cy) / ILHA.ry; return { d: Math.hypot(nx, ny), a: Math.atan2(ny, nx) }; }
// Em terra (com uma folga da água, em proporção do raio).
function ilhaLand(x, y, margin = 0) { const { d, a } = ilhaD(x, y); return d < ilhaK(a) - margin; }
function ilhaCoastPath(inset = 0) {
  const p = new Path2D();
  for (let i = 0; i <= 240; i++) { const a = i / 240 * Math.PI * 2 - Math.PI, k = ilhaK(a) - inset, x = ILHA.cx + Math.cos(a) * ILHA.rx * k, y = ILHA.cy + Math.sin(a) * ILHA.ry * k; i ? p.lineTo(x, y) : p.moveTo(x, y); }
  p.closePath(); return p;
}
// O rio nasce numa lagoinha a oeste e desce pro mar a leste, alargando.
const ILHA_RIO = { x0: 1450, x1: 6400, pontes: [{ x: 3200, half: 62, kind: 'tabua' }, { x: 4700, half: 40, kind: 'corda' }] };
function ilhaRioY(x) { return 2620 + 150 * Math.sin(x / 640 + .4) + 60 * Math.sin(x / 230 + 2); }
function ilhaRioHalf(x) { return 36 + 64 * clamp((x - ILHA_RIO.x0) / 4400, 0, 1); }
function ilhaNascente() { return { x: ILHA_RIO.x0, y: ilhaRioY(ILHA_RIO.x0), rx: 150, ry: 100 }; }
function ilhaRioAt(x, y, pad = 0) {
  const n = ilhaNascente(); if (Math.hypot((x - n.x) / (n.rx + pad), (y - n.y) / (n.ry + pad)) < 1) return true;
  return x > ILHA_RIO.x0 && Math.abs(y - ilhaRioY(x)) < ilhaRioHalf(x) + pad;
}
function ilhaPonteAt(x, y) { return ILHA_RIO.pontes.some(p => Math.abs(x - p.x) < p.half - 12 && Math.abs(y - ilhaRioY(p.x)) < ilhaRioHalf(p.x) + 70); }
function ilhaRioPath() {
  const p = new Path2D(), step = 40; p.moveTo(ILHA_RIO.x0, ilhaRioY(ILHA_RIO.x0) - ilhaRioHalf(ILHA_RIO.x0));
  for (let x = ILHA_RIO.x0; x <= ILHA_RIO.x1; x += step) p.lineTo(x, ilhaRioY(x) - ilhaRioHalf(x));
  for (let x = ILHA_RIO.x1; x >= ILHA_RIO.x0; x -= step) p.lineTo(x, ilhaRioY(x) + ilhaRioHalf(x));
  p.closePath(); return p;
}
// Trilhas: do trapiche ao portão pela ponte; a oeste contornando a nascente; a leste pela ponte de corda até o farol.
const ILHA_TRILHAS = [
  [[3000, 4700], [3060, 4350], [3140, 3950], [3200, 3500], [3200, 3050], [3200, 2400], [3200, 2120]],
  [[3060, 4350], [2500, 4250], [1900, 4000], [1450, 3550], [1200, 3000], [1150, 2600], [1250, 2150], [1650, 1900]],
  [[3140, 3950], [3800, 3780], [4400, 3500], [4700, 3150], [4700, 2150], [5000, 1900], [5400, 1760]],
  [[4400, 3500], [4650, 3950], [4700, 4250]],
  [[1900, 4000], [1640, 3780]],
  [[3200, 1960], [3200, 1720]]
];
function ilhaTrailPath() { const p = new Path2D(); for (const t of ILHA_TRILHAS) t.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); return p; }
function ilhaTrailDist(x, y) {
  let best = Infinity;
  for (const t of ILHA_TRILHAS) for (let i = 1; i < t.length; i++) {
    const [ax, ay] = t[i - 1], [bx, by] = t[i], vx = bx - ax, vy = by - ay, k = clamp(((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy || 1), 0, 1);
    best = Math.min(best, Math.hypot(x - ax - vx * k, y - ay - vy * k));
  }
  return best;
}
const ilhaPaths = {};
function ilhaPath(key, make) { return ilhaPaths[key] ??= make(); }
function ilhaNoise(x, y) { const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return s - Math.floor(s); }

// ---------- O paredão do alto da ilha ----------
// O alto da ilha (o planalto da fortaleza) é cercado de pedra; embaixo, no meio do paredão, a boca da picada da cerração.
const PLANALTO = { x0: 1950, x1: 4450, y: 2000, face: 140, gap: { x: 3140, w: 120 } };
function ilhaPenhasco(x, y) {
  const P = PLANALTO, base = P.y + P.face, g = P.gap;
  if (y > base || x < P.x0 - 10 || x > P.x1 + 10) return false;
  if (x < P.x0 + 60 || x > P.x1 - 60) return true;
  if (y < P.y) return y > P.y - 60 && x > g.x - 40 && x < g.x + g.w + 40;
  return !(x > g.x + 12 && x < g.x + g.w - 12 && y > P.y + 46);
}
function ilhaPenhascoPerto(x, y) { const P = PLANALTO; return x > P.x0 - 130 && x < P.x1 + 130 && y < P.y + P.face + 120 && (y > P.y - 140 || x < P.x0 + 150 || x > P.x1 - 150); }
function ilhaBocaPicada(p) { const g = PLANALTO.gap; return p.x > g.x + 12 && p.x < g.x + g.w - 12 && p.y > PLANALTO.y + 46 && p.y < PLANALTO.y + 96; }

// ---------- A fortaleza, lá no alto ----------
const FORT = { x: 2350, y: 740, w: 1700, h: 960, t: 60, gate: 140, H: 92 };
const FORT_PARTS = (() => {
  const F = FORT, gx = F.x + (F.w - F.gate) / 2, sy = F.y + F.h - F.t, walls = [];
  walls.push({ x: F.x, y: F.y, w: F.w, h: F.t, front: true });
  for (let y = F.y + F.t; y < sy; y += 120) { const h = Math.min(120, sy - y); walls.push({ x: F.x, y, w: F.t, h, side: true }, { x: F.x + F.w - F.t, y, w: F.t, h, side: true }); }
  walls.push({ x: F.x, y: sy, w: gx - F.x, h: F.t, front: true, cannons: [2600, 2900] }, { x: gx + F.gate, y: sy, w: F.x + F.w - gx - F.gate, h: F.t, front: true, cannons: [3500, 3800] });
  const towers = [[F.x, F.y], [F.x + F.w, F.y], [F.x, F.y + F.h], [F.x + F.w, F.y + F.h]].map(([x, y]) => ({ x: x - 110, y: y - 110, w: 220, h: 220, front: true, tall: 118 }));
  const gate = [{ x: gx - 80, y: sy - 40, w: 80, h: 130, front: true, tall: 132 }, { x: gx + F.gate, y: sy - 40, w: 80, h: 130, front: true, tall: 132 }];
  const houses = [{ x: 2480, y: 820, w: 520, h: 280, name: 'QUARTEL' }, { x: 2990, y: 800, w: 470, h: 270, name: 'COMANDÂNCIA' }, { x: 3560, y: 830, w: 380, h: 250, name: 'PAIOL' }];
  return { walls, towers, gate, houses, gateX: gx, stair: { x: 3660, y: 1360, w: 170, h: 110 }, flag: { x: 3200, y: 1250 } };
})();
const inRect = (r, x, y, mx = 12, my = 6) => x > r.x - mx && x < r.x + r.w + mx && y > r.y - my && y < r.y + r.h + my;
function ilhaFortSolid(x, y) {
  const P = FORT_PARTS;
  if (P.walls.some(r => inRect(r, x, y)) || P.towers.some(r => inRect(r, x, y)) || P.gate.some(r => inRect(r, x, y))) return true;
  if (P.houses.some(h => inRect({ x: h.x, y: h.y + 70, w: h.w, h: h.h - 70 }, x, y))) return true;
  if (Math.hypot(x - P.flag.x, (y - P.flag.y) * 1.4) < 18) return true;
  return false;
}

// ---------- A vegetação e as pedras (sempre no mesmo lugar) ----------
const ILHA_LANDMARKS = [ILHA.farol, ILHA.ranchos, ILHA.capela], ILHA_RANCHOS = [[-170, 0], [120, 30]];
function ilhaReserved(x, y, pad = 0) {
  if (ilhaPenhascoPerto(x, y)) return true;
  if (x > FORT.x - 260 - pad && x < FORT.x + FORT.w + 260 + pad && y > FORT.y - 200 - pad && y < FORT.y + FORT.h + 240 + pad) return true;
  if (Math.hypot(x - ILHA.safe.x, y - ILHA.safe.y) < ILHA.safe.r + 60 + pad) return true;
  if (ILHA_LANDMARKS.some(l => Math.hypot(x - l.x, y - l.y) < 300 + pad)) return true;
  return ILHA_RIO.pontes.some(p => Math.abs(x - p.x) < 170 + pad && Math.abs(y - ilhaRioY(p.x)) < 260 + pad);
}
let ilhaProps = null;
function ilhaFlora() {
  if (ilhaProps) return ilhaProps;
  const R = caveRand(1837), trees = [], brush = [], rocks = [], grid = new Map();
  const ok = (x, y, pad) => ilhaLand(x, y, .03) && !ilhaRioAt(x, y, pad) && ilhaTrailDist(x, y) > pad + 46 && !ilhaReserved(x, y);
  for (let k = 0; k < 3200 && trees.length < 430; k++) {
    const x = 200 + R() * (ILHA.W - 400), y = 260 + R() * (ILHA.H - 520), s = [.86, 1, 1.14][Math.floor(R() * 3)];
    if (!ok(x, y, 64) || trees.some(t => Math.abs(t.x - x) < 130 && Math.abs(t.y - y) < 110)) continue;
    const { d, a } = ilhaD(x, y), beira = ilhaK(a) - d < .1;
    const kind = beira ? (R() < .6 ? 'butia' : 'jeriva') : (R() < .58 ? 'folha' : R() < .55 ? 'jeriva' : 'xaxim');
    trees.push({ x, y, kind, v: R() < .3 ? 2 : 3, s });
  }
  for (let k = 0; k < 1400 && brush.length < 300; k++) {
    const x = 200 + R() * (ILHA.W - 400), y = 260 + R() * (ILHA.H - 520);
    if (!ok(x, y, 30) || trees.some(t => Math.hypot(t.x - x, t.y - y) < 80)) continue;
    brush.push({ x, y, i: R() < .55 ? 5 : 1, w: R() < .5 ? 100 : 120 });
  }
  for (let k = 0; k < 600 && rocks.length < 70; k++) {
    const x = 200 + R() * (ILHA.W - 400), y = 260 + R() * (ILHA.H - 520);
    if (!ok(x, y, 50) || trees.some(t => Math.hypot(t.x - x, t.y - y) < 110)) continue;
    rocks.push({ x, y, i: R() < .6 ? 2 : 14, w: R() < .5 ? 110 : 140 });
  }
  // Junco na beira do rio e capim de duna na areia.
  for (let k = 0; k < 90; k++) { const x = ILHA_RIO.x0 + 120 + R() * 4300, side = R() < .5 ? -1 : 1, y = ilhaRioY(x) + side * (ilhaRioHalf(x) + 26); if (ilhaLand(x, y, .03) && !ilhaReserved(x, y) && ilhaTrailDist(x, y) > 70) brush.push({ x, y, i: 9, w: 90 }); }
  for (let k = 0; k < 900 && brush.filter(b => b.i === 13).length < 110; k++) { const a = R() * Math.PI * 2, kk = ilhaK(a) - .02 - R() * .025, x = ILHA.cx + Math.cos(a) * ILHA.rx * kk, y = ILHA.cy + Math.sin(a) * ILHA.ry * kk; if (!ilhaReserved(x, y) && ilhaTrailDist(x, y) > 70) brush.push({ x, y, i: 13, w: 90 }); }
  for (const t of trees) { const key = Math.floor(t.x / 256) + ':' + Math.floor(t.y / 256); if (!grid.has(key)) grid.set(key, []); grid.get(key).push(t); }
  for (const r of rocks) { const key = Math.floor(r.x / 256) + ':' + Math.floor(r.y / 256); if (!grid.has(key)) grid.set(key, []); grid.get(key).push(r); }
  return ilhaProps = { trees, brush, rocks, grid };
}
function ilhaPropSolid(x, y) {
  const g = ilhaFlora().grid, cx = Math.floor(x / 256), cy = Math.floor(y / 256);
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const o of g.get((cx + i) + ':' + (cy + j)) || []) if (Math.hypot(o.x - x, (o.y - y) * 1.3) < (o.kind ? 24 : o.w * .36)) return true;
  return false;
}
function ilhaLandmarkSolid(x, y) {
  const f = ILHA.farol, r = ILHA.ranchos, c = ILHA.capela;
  if (Math.hypot(x - f.x, (y - f.y) * 1.4) < 70) return true;
  if (ILHA_RANCHOS.some(([dx, dy]) => inRect({ x: r.x + dx - 100, y: r.y + dy - 70, w: 200, h: 70 }, x, y))) return true;
  if (inRect({ x: c.x - 150, y: c.y - 70, w: 300, h: 26 }, x, y) || inRect({ x: c.x - 150, y: c.y - 70, w: 24, h: 120 }, x, y) || inRect({ x: c.x + 126, y: c.y - 70, w: 24, h: 70 }, x, y)) return true;
  return Math.hypot(x - ILHA.fogo.x, (y - ILHA.fogo.y) * 1.6) < 40;
}
function ilhaPier(x, y) { const p = ILHA.pier; return x > p.x + 8 && x < p.x + p.w - 8 && y > p.y && y < p.y + p.h; }
function ilhaSafe(x, y) { return Math.hypot(x - ILHA.safe.x, y - ILHA.safe.y) < ILHA.safe.r; }

WORLD_MAPS.ilha = {
  id: 'ilha', name: 'Ilha da Fortaleza', W: ILHA.W, H: ILHA.H,
  spawn() { return { ...ILHA.arrive }; },
  canWalk(x, y) {
    if (ilhaPier(x, y)) return true;
    if (!ilhaLand(x, y, .012)) return false;
    if (ilhaRioAt(x, y, 6) && !ilhaPonteAt(x, y)) return false;
    return !ilhaFortSolid(x, y) && !ilhaPropSolid(x, y) && !ilhaLandmarkSolid(x, y) && !ilhaPenhasco(x, y);
  },
  edge(p) { return ilhaBocaPicada(p) ? ilhaMatoEntrada(1) : null; },
  spots() {
    const S = FORT_PARTS.stair;
    return [
      { id: 'ilha:barco', x: ILHA.pier.x + ILHA.pier.w / 2, y: ILHA.pier.y + ILHA.pier.h - 50, radius: 90, label: 'Voltar pro continente com o seu Nereu', act: ilhaVolta },
      { id: 'ilha:fogo', x: ILHA.fogo.x, y: ILHA.fogo.y + 40, radius: 100, label: 'Descansar no fogo do trapiche', act: ilhaDescansa },
      { id: 'ilha:placa', x: ILHA.placa.x, y: ILHA.placa.y + 20, info: true, label: 'Placa da Ilha da Fortaleza', text: 'Uma ilha que vive na cerração, no mar de Santa Catarina. No alto, a fortaleza velha do Império: muralha de pedra, baluartes e masmorras, onde ficavam os presos da guerra.' },
      { id: 'ilha:masmorra', x: S.x + S.w / 2, y: S.y + S.h + 26, radius: 90, label: ilhaState().chave ? 'Descer à cripta' : 'A grade da cripta (trancada)', act: masmorraEntra },
      { id: 'ilha:descer', x: 3200, y: PLANALTO.y - 80, radius: 90, label: 'Descer pela trilha velha (até o trapiche)', act: () => ilhaAtalho(false) },
      ...(ilhaState().planalto ? [{ id: 'ilha:subir', x: GRIGGS.subir.x, y: GRIGGS.subir.y, radius: 90, label: 'Subir pela trilha velha (até a fortaleza)', act: () => ilhaAtalho(true) }] : []),
      { id: 'ilha:farol', x: ILHA.farol.x, y: ILHA.farol.y + 70, info: true, label: 'Farol velho', text: 'O farol da ponta da ilha. A lente ainda gira de noite, mas faz muito tempo que ninguém sobe a escada.' },
      { id: 'ilha:ranchos', x: ILHA.ranchos.x, y: ILHA.ranchos.y + 60, info: true, label: 'Ranchos de pescador', text: 'Ranchos de pescador abandonados, com as redes ainda penduradas. Quem morava aqui foi embora quando os marinheiros chegaram.' },
      { id: 'ilha:capela', x: ILHA.capela.x, y: ILHA.capela.y + 70, info: true, label: 'Capela em ruínas', text: 'Sobrou a parede da frente e a cruz de madeira. Diz o seu Nereu que os pescadores ainda acendem vela aqui, escondido.' }
    ];
  },
  draw(view, seen, layers) { drawIlha(view, seen, layers); },
  onEnter() { ilhaEnter(); }
};

// ---------- A cripta (as masmorras da fortaleza) ----------
const MASM = { W: 2800, H: 1960, stair: { x: 1400, y: 1860 }, clue: { x: 1400, y: 190 },
  floors: [
    { x: 1300, y: 300, w: 200, h: 1600 }, { x: 300, y: 1300, w: 2200, h: 150 }, { x: 300, y: 800, w: 2200, h: 150 }, { x: 300, y: 300, w: 1900, h: 150 },
    { x: 120, y: 1180, w: 360, h: 500 }, { x: 300, y: 450, w: 150, h: 350 }, { x: 2350, y: 950, w: 150, h: 350 },
    { x: 1250, y: 70, w: 300, h: 240, cell: 'fundo' }, { x: 720, y: 1100, w: 180, h: 210, cell: 'aberta' }, { x: 1900, y: 600, w: 180, h: 210, cell: 'aberta' }
  ] };
// As celas fechadas ficam no lado de cima dos corredores (de grade, sem passagem).
MASM.cells = (() => {
  const list = [];
  for (const [cy, from, to] of [[1300, 520, 2300], [800, 520, 2300], [300, 520, 2050]]) for (let x = from; x + 180 <= to; x += 200) {
    if (x + 180 > 1250 && x < 1550) continue;
    if (MASM.floors.some(f => f.cell && Math.abs(f.x - x) < 100 && f.y + f.h > cy - 20 && f.y < cy)) continue;
    list.push({ x, y: cy - 200, w: 180, h: 200 });
  }
  return list;
})();
MASM.torches = [[700, 1300], [1100, 1300], [1900, 1300], [2300, 1300], [700, 800], [1100, 800], [1700, 800], [2200, 800], [800, 300], [1700, 300], [300, 1180], [1400, 70]];
function masmFloor(x, y) {
  // Apply the wall clearance to the joined floor, not to each rectangle: adjoining
  // corridors otherwise leave an invisible strip that blocks the route to Bento's cell.
  const inside = (px, py) => MASM.floors.some(r => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
  return inside(x, y) && inside(x - 14, y) && inside(x + 14, y) && inside(x, y - 10) && inside(x, y + 4);
}
WORLD_MAPS.masmorra = {
  id: 'masmorra', name: 'Cripta da fortaleza', W: MASM.W, H: MASM.H, indoor: true,
  spawn() { return { x: MASM.stair.x, y: MASM.stair.y - 90 }; },
  canWalk(x, y) { return masmFloor(x, y); },
  edge() { return null; },
  spots() {
    return [
      { id: 'masmorra:subir', x: MASM.stair.x, y: MASM.stair.y - 40, radius: 90, label: 'Subir pro pátio da fortaleza', act: masmorraSai },
      { id: 'masmorra:cela', x: MASM.clue.x, y: MASM.clue.y + 40, radius: 110, label: missionState('bento') && !ilhaState().pista ? 'Olhar a cela do Bento' : 'A cela do fundo', act: masmorraCela }
    ];
  },
  draw(view, seen, layers) { drawMasmorra(view, seen, layers); },
  onEnter() { masmorraEnter(); }
};
REGION_NAMES.ilha = 'Ilha da Fortaleza'; REGION_NAMES.masmorra = 'Ilha da Fortaleza';

// ---------- Quem mora em cada parte ----------
// (x, y, quantos, quem). Embaixo, piratas fantasmas nas trilhas e afogados na beira d'água; lá no alto, os marinheiros.
const ILHA_GUARDAS = [
  [3150, 3900, 1, 'pirata'], [2000, 4000, 2, 'pirata'], [1450, 3150, 1, 'pirata'], [4300, 3780, 1, 'pirata'], [4700, 4000, 2, 'pirata'],
  [1300, 2200, 1, 'pirata'], [4700, 2950, 2, 'pirata'], [4900, 2150, 1, 'pirata'], [5300, 1900, 2, 'pirata'], [3200, 2300, 2, 'pirata'],
  ...[2300, 2800, 3700, 4250, 5000].map((x, i) => [x, ilhaRioY(x) + (i % 2 ? 1 : -1) * (ilhaRioHalf(x) + 46), 1, 'afogado']),
  ...[1.25, 2.0, .55, 2.6].map(a => { const k = ilhaK(a) - .035; return [ILHA.cx + Math.cos(a) * ILHA.rx * k, ILHA.cy + Math.sin(a) * ILHA.ry * k, 1, 'afogado']; }),
  [3200, 1880, 3, 'marujo'], [2800, 1350, 3, 'marujo'], [3650, 1560, 3, 'marujo'], [3200, 1130, 2, 'marujo'], [2200, 1500, 2, 'marujo'], [4200, 1500, 2, 'marujo']
];
const MASM_GUARDAS = [[1400, 1520, 1], [800, 1375, 2], [2000, 1375, 2], [300, 1430, 2], [700, 875, 2], [2100, 875, 1], [2420, 1120, 1], [900, 375, 2], [1800, 375, 1], [1400, 620, 1]];
// Cada bicho da ilha diz como anda, como se desenha e como grita (ilha-cerracao.js acrescenta os outros).
const ILHA_MOBS = {};
function ilhaKillKey() { const m = worldOut?.map; return m === 'ilhamato' ? 'ilhamato:' + (ilhaState().trecho || 1) : m; }
function ilhaKey() { return 'ilha:' + ilhaKillKey() + ':' + G.day; }
function ilhaKilled(key) { const st = ilhaState(); if (st.mortos?.day !== G.day || Array.isArray(st.mortos.ilha)) st.mortos = { day: G.day }; return st.mortos[key] ??= []; }
function ilhaMob(kind, at, R, extra = {}) { const hp = Math.round(CAVE_BEASTS[kind].hp * (extra.hpMul || 1)); return { kind, x: at.x, y: at.y, home: { ...at }, tx: at.x, ty: at.y, hp, max: hp, dx: R() < .5 ? -1 : 1, state: ILHA_MOBS[kind]?.start || 'roam', t: R() * 3, vx: 0, vy: 0, hurt: 0, frame: R() * 3, cool: R(), attack: 0, ...extra }; }
function ilhaSpotNear(map, x, y) {
  const M = WORLD_MAPS[map];
  for (let r = 0; r <= 180; r += 30) for (let k = 0; k < (r ? 10 : 1); k++) { const a = k / 10 * Math.PI * 2, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; if (M.canWalk(px, py) && (map !== 'ilha' || !ilhaSafe(px, py))) return { x: px, y: py }; }
  return null;
}
function ilhaBeastsStart() {
  const map = worldOut.map, key = ilhaKillKey(), dead = ilhaKilled(key), R = caveRand(G.day * 97 + key.length * 31 + (ilhaState().trecho || 0) * 7);
  const masm = map === 'masmorra', list = map === 'ilha' ? ILHA_GUARDAS : masm ? MASM_GUARDAS : ilhaMatoGuardas(ilhaState().trecho || 1), beasts = [];
  for (const [gx, gy, n, kind = 'marujo'] of list) for (let k = 0; k < n; k++) {
    const swarm = kind === 'mariposa', at = ilhaSpotNear(map, gx + (k - (n - 1) / 2) * (swarm ? 40 : 80), gy + (k % 2 ? 36 : -28)); if (!at) continue;
    beasts.push(ilhaMob(kind, at, R, masm ? { hpMul: 1.25, dmgMul: 1.2 } : {}));
  }
  beasts.forEach((b, i) => { b.idx = i; if (dead.includes(i)) b.hp = 0; });
  mataNight = { day: G.day, key: ilhaKey(), ilha: key, beasts, drops: [], herds: [], shots: [], ish: [], cd: 0, inv: 0, hurt: 0, swing: null };
}
// Patrulham perto do posto; viram o Sadi de longe, correm atrás, avisam o bote (a faixa vermelha) e dão a estocada.
function marujoTick(b, dt, p) {
  const B = CAVE_BEASTS.marujo, dxp = p.x - b.x, dyp = p.y - b.y, d = Math.hypot(dxp, dyp) || 1, safe = worldOut.map === 'ilha' && ilhaSafe(p.x, p.y);
  b.t -= dt; b.cool = Math.max(0, b.cool - dt); b.hurt = Math.max(0, b.hurt - dt); b.attack = Math.max(0, b.attack - dt); b.frame += dt * 6;
  if (safe && b.state !== 'roam') { b.state = 'roam'; b.tx = b.home.x; b.ty = b.home.y; b.t = 4; }
  if (b.state === 'roam') {
    if (!safe && d < MATA_NIGHT.notice * mataNoticeMul()) { b.state = 'chase'; AudioEngine.caveCry?.('marujo'); return; }
    const r = mataGo(b, { x: b.tx, y: b.ty }, 60, dt);
    if (r === true || r === 'blocked' || b.t <= 0) { const a = Math.random() * Math.PI * 2, rr = 60 + Math.random() * 180, x = b.home.x + Math.cos(a) * rr, y = b.home.y + Math.sin(a) * rr * .7; if (mataFree(x, y)) { b.tx = x; b.ty = y; } b.t = 3 + Math.random() * 3; }
  } else if (b.state === 'chase') {
    if (d > 760) { b.state = 'roam'; b.tx = b.home.x; b.ty = b.home.y; b.t = 4; return; }
    b.dx = dxp < 0 ? -1 : 1; mataStep(b, dxp / d * B.speed, dyp / d * B.speed, dt);
    if (d < 175 && b.cool <= 0) { b.state = 'windup'; b.t = .42; b.vx = dxp / d; b.vy = dyp / d; b.dx = b.vx < 0 ? -1 : 1; AudioEngine.swoosh?.(.03); }
  } else if (b.state === 'windup') { if (b.t <= 0) { b.state = 'lunge'; b.t = .32; AudioEngine.swoosh?.(.08); } }
  else if (b.state === 'lunge') {
    if (!mataStep(b, b.vx * 520, b.vy * 520, dt)) b.t = 0;
    if (b.attack <= 0 && Math.hypot(p.x - b.x, p.y - b.y) < B.r + 30) { mataHurt(B.dmg, b); b.attack = .4; }
    if (b.t <= 0) { b.state = 'rest'; b.t = .7; b.cool = 1.2; }
  } else if (b.state === 'rest') { if (b.t <= 0) b.state = 'chase'; }
}

ILHA_MOBS.marujo = { tick: marujoTick, draw: b => drawMarinheiro(b), xp: 8, warn: b => { if (b.state === 'windup') teleLane(b.x, b.y - 20, Math.atan2(b.vy, b.vx), 240, 50, teleK(b.t, .42), '255,90,60', .6); },
  cry(dead) { if (dead) this.caveVoice?.([210, 150, 90], .7, { formant: 650, q: 1.4, vol: .05, vib: 6, rate: 5 }); else this.caveVoice?.([170, 220, 160], .22, { formant: 750, q: 1.6, vol: .045, vib: 8, rate: 7 }); } };

// ---------- Ir e voltar ----------
function ilhaEnter() {
  const st = ilhaState(); mataNight = null;
  if (st.chegou) return;
  st.chegou = G.day; save();
  talk([['card', '<b>⚓ Ilha da Fortaleza</b><br>· Aqui embaixo andam <b>piratas fantasmas</b> (atiram de longe: sai da linha vermelha) e, na beira d\'água, <b>afogados</b> que agarram (bate neles pra se soltar).<br>· O rio corta a ilha no meio: atravessa pela <b>ponte</b> da trilha, pela <b>ponte de corda</b> a leste ou dando a volta pela nascente, a oeste.<br>· Depois do rio, um <b>paredão</b> cerca o alto da ilha. A <b>picada da cerração</b>, no pé dele, entra na mata escura que sobe até a <b>fortaleza</b>.<br>· Perto do barco do seu Nereu, no trapiche, ninguém chega, e o <b>fogo do trapiche</b> cura.<br>· A cerração protege os bichos da ilha: arma comum quase não pega. O <b>John Griggs</b>, no acampamento ao lado do fogo, vende bomba e faz o que pega neles com a <b>prata</b> dos baús de pirata, a <b>arruda</b> da capela velha e o <b>sal grosso</b> dos ranchos e das pedras da praia.', 'Ilha da Fortaleza'],
    [nereuSpeaker(), 'Eu fico aqui no trapiche, vivente. Quando quiser voltar, é só chegar no barco.']], null, 'Bora');
}
function ilhaVolta() { mataNight = null; switchMap({ map: 'sc', x: SC_ITAJAI.deck.x + 50, y: SC_ITAJAI.deck.y + 34, title: 'Santa Catarina · Vale Europeu', text: 'O seu Nereu amarra o barco no trapiche do Itajaí-Açu.' }); worldOut.dx = -1; worldOut.dy = 0; }
function ilhaDescansa() { caveState().hp = caveMaxHp(); mataBuffs.veneno = 0; AudioEngine.ready?.(); save(); worldSay('Fogo de chão na areia e um mate do seu Nereu. A vida voltou inteira.'); }
function masmorraEntra() {
  if (!ilhaState().chave) { showInfo('A grade da cripta', 'Uma grade de ferro grossa, com cadeado do Império, tranca a escada da cripta. A chave fica com quem manda na fortaleza.'); AudioEngine.bad?.(); return; }
  mataNight = null; switchMap({ map: 'masmorra', ...WORLD_MAPS.masmorra.spawn(), title: 'Cripta da fortaleza', text: 'Pedra molhada, tocha fraca e cheiro de ferrugem.' }); worldOut.dy = -1;
}
function masmorraSai() { const S = FORT_PARTS.stair; mataNight = null; switchMap({ map: 'ilha', x: S.x + S.w / 2, y: S.y + S.h + 60, title: 'Pátio da fortaleza', text: '' }); worldOut.dy = 1; }
function masmorraEnter() {
  const st = ilhaState(); mataNight = null;
  if (!st.masmorra) { st.masmorra = G.day; save(); if (st.chave && !st.pista) talk([['card', '<b>🗝️ A cripta da fortaleza</b><br>A chave do almirante gira no cadeado e a grade range. Lá embaixo, os carcereiros acordam: pra chegar na cela do Bento, no fim do corredor do meio, tem que derrubar todos eles.', 'Cripta da fortaleza']], null, 'Descer'); }
}
// Quantos carcereiros ainda guardam a cripta (a cela do Bento só abre com todos no chão).
function criptaFaltam() { const N = mataNight; if (worldOut?.map !== 'masmorra' || !N?.ilha) return MASM_GUARDAS.reduce((a, g) => a + g[2], 0); return N.beasts.filter(b => b.hp > 0 && !b.minion).length; }
function masmorraCela() {
  const st = ilhaState();
  if (!missionState('bento') || st.pista) { showInfo('A cela do fundo', 'Grade aberta e palha no chão. Riscado na parede, com a ponta de uma espora: “B. G. · 1837”.'); return; }
  const n = criptaFaltam(); if (n > 0) { worldSay('A grade da cela do fundo não abre com os carcereiros de guarda: ainda tem ' + n + ' na cripta.'); AudioEngine.bad?.(); return; }
  bentoCelaCena();
}

// ---------- O seu Nereu, barqueiro do Itajaí-Açu ----------
const NEREU_LOOK = { skin: '#c8966c', hair: '#d8d4cc', style: 'short', mustache: true, hat: 'straw', shirt: '#e4dccb', pants: '#34466a', barefoot: true };
const ilhaArt = new Map();
function ilhaFigure(id, look) {
  if (ilhaArt.has(id)) return ilhaArt.get(id);
  const c = document.createElement('canvas'); c.width = 240; c.height = 460; const main = ctx; ctx = c.getContext('2d');
  try { ctx.translate(120, 440); ctx.scale(2, 2); paintFolk(look); } finally { ctx = main; }
  ilhaArt.set(id, c); return c;
}
function drawNereu(x, y, dx = -1) { const c = ilhaFigure('nereu', NEREU_LOOK); ellipse(x, y + 3, 24, 7, 'rgba(10,14,8,.3)'); ctx.save(); ctx.translate(x, y); if (dx < 0) ctx.scale(-1, 1); ctx.drawImage(c, -60, -220, 120, 230); ctx.restore(); }
let nereuPortraitURL = null;
function nereuPortrait(size = 104) {
  if (!nereuPortraitURL) { const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.fillStyle = '#2e4a5a'; g.fillRect(0, 0, 96, 96); g.drawImage(ilhaFigure('nereu', NEREU_LOOK), 60, 110, 120, 120, 0, 0, 96, 96); try { nereuPortraitURL = c.toDataURL(); } catch (_) { return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px">⛵</span>`; } }
  return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px;display:grid;place-items:center;overflow:hidden"><img src="${nereuPortraitURL}" width="${size}" height="${size}" alt=""></span>`;
}
function nereuSpeaker() { return { name: 'Seu Nereu, barqueiro', portrait: nereuPortrait() }; }
function nereuTalk() {
  const st = ilhaState(), N = nereuSpeaker();
  if (!missionState('bento')) { talk([[N, 'Buenas, vivente! O Itajaí-Açu tá manso hoje, mas peixe que é bom, nada.'], [N, 'Lá pra fora da barra tem uma ilha que vive na cerração. Ninguém vai lá, e eu só levo quem tem motivo.']], null, 'Até mais'); return; }
  if (!st.sabeBarqueiro) st.sabeBarqueiro = G.day;
  const lines = st.viagens ? [[N, 'Bora pra ilha? ' + money(ILHA.fare) + ', ida e volta. Eu te espero no trapiche de lá.']] : [
    [N, 'Buenas. Tu é o bodegueiro que anda atrás da ilha da cerração? O Peixinho me falou.'],
    [N, 'Atravesso, sim: desço o Itajaí-Açu até a barra e, se a cerração deixar, encosto no trapiche velho da ilha.'],
    [N, 'Mas lá eu não desço do barco. A ilha é dos marinheiros de farda velha, e eles são bem mais brabos que os de Laguna.'],
    [N, 'São ' + money(ILHA.fare) + ' a viagem, ida e volta. Eu te espero no trapiche o tempo que precisar.']];
  const can = G.cash >= ILHA.fare;
  talkChoose(lines, [['Pagar ' + money(ILHA.fare) + ' e embarcar' + (can ? '' : ' (falta dinheiro)'), ilhaViagem, null, !can], ['Agora não']], 1);
}
function ilhaViagem() {
  if (G.cash < ILHA.fare) { worldSay('Falta dinheiro pra viagem: ' + money(ILHA.fare) + '.'); AudioEngine.bad(); return; }
  spendCash(ILHA.fare); AudioEngine.coins(); const st = ilhaState(); st.viagens = (st.viagens || 0) + 1; save();
  switchMap({ map: 'ilha', ...ILHA.arrive, title: 'Ilha da Fortaleza', text: 'A cerração abre devagar. Lá no alto, a fortaleza.' });
  worldOut.dx = 0; worldOut.dy = -1;
}

// ---------- Santa Catarina: o Itajaí-Açu e o trapiche no fim da rua ----------
const SC_ITAJAI = { deck: { x: 3370, y: 966, w: 230, h: 68 }, nereu: { x: 3545, y: 1012 }, boat: { x: 3530, y: 1118 } };
// O rio corre na beira direita do vale; do café pra cima ele se afasta um pouco, pra não molhar a varanda.
function scRioX(y) { const k = clamp((1000 - y) / 180, 0, 1), s = k * k * (3 - 2 * k); return 3410 + 95 * s + 14 * Math.sin(y / 170) + 8 * Math.sin(y / 61 + 1); }
function scTrapiche(x, y) { const d = SC_ITAJAI.deck; return x > d.x && x < d.x + d.w - 20 && y > d.y + 6 && y < d.y + d.h; }
function scRioPath() { const p = new Path2D(); p.moveTo(SC.W + 60, -60); for (let y = -60; y <= SC.H + 60; y += 30) p.lineTo(scRioX(y), y); p.lineTo(SC.W + 60, SC.H + 60); p.closePath(); return p; }
function drawScItajai(view) {
  if (view.x + view.w < 3300) return;
  ctx.save(); ctx.clip(ilhaPath('scRio', scRioPath)); if (!mataTexture(5, view.x, view.y, view.w, view.h)) rect(view.x, view.y, view.w, view.h, '#2a5a5e');
  ctx.fillStyle = 'rgba(70,60,30,.18)'; ctx.fillRect(view.x, view.y, view.w, view.h);
  ctx.strokeStyle = 'rgba(220,235,230,.22)'; ctx.lineWidth = 2; for (let k = 0; k < 16; k++) { const y = ((k * 157 + frameClock * 34) % (SC.H + 200)) - 100, x = scRioX(y) + 50 + (k * 37) % 120; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 3, y + 26); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(70,52,30,.6)'; ctx.lineWidth = 9; ctx.stroke(ilhaPath('scRio', scRioPath)); ctx.restore();
  const d = SC_ITAJAI.deck; if (!environmentSprite('pier-v1', 0, d.x + d.w / 2, d.y + d.h + 22, d.w + 40, d.h + 50)) { rect(d.x, d.y, d.w, d.h, '#8a6038', 3, '#4a3018'); for (let x = d.x + 14; x < d.x + d.w; x += 18) rect(x, d.y, 2, d.h, '#5a3a20'); }
}
function drawScItajaiLayers(layers) {
  const b = SC_ITAJAI.boat, n = SC_ITAJAI.nereu, bob = Math.sin(frameClock * 1.4) * 2.5;
  layers.push({ y: b.y, draw: () => { if (!environmentSprite('pier-v1', 1, b.x, b.y + bob, 190, 70)) ellipse(b.x, b.y - 20 + bob, 90, 24, '#6a4628'); } });
  layers.push({ y: n.y, draw: () => drawNereu(n.x, n.y, worldOut && worldOut.x > n.x ? 1 : -1) });
}
{
  const M = WORLD_MAPS.sc, walk = M.canWalk, spots = M.spots, draw = M.draw;
  M.canWalk = function (x, y) { if (scTrapiche(x, y)) return true; if (x > scRioX(y) - 18) return false; return walk.call(this, x, y); };
  M.spots = function () { const list = spots.call(this); list.push({ id: 'sc:nereu', x: SC_ITAJAI.nereu.x - 70, y: SC_ITAJAI.nereu.y + 6, radius: 110, label: 'Falar com o seu Nereu, barqueiro', act: nereuTalk }); return list; };
  M.draw = function (view, seen, layers) { draw.call(this, view, seen, layers); drawScItajai(view); if (seen(SC_ITAJAI.nereu.x, SC_ITAJAI.nereu.y)) drawScItajaiLayers(layers); };
}

// ---------- Desenho da ilha ----------
function ilhaPattern(i) { return mataTexture(i, 0, 0, 0, 0) ? MATA_MATERIALS.get(i) : null; }
function ilhaBlotches(view, index, alpha, step, salt, where) {
  for (let gy = Math.floor(view.y / step) * step - step; gy < view.y + view.h + step; gy += step) for (let gx = Math.floor(view.x / step) * step - step; gx < view.x + view.w + step; gx += step) {
    const n = ilhaNoise(gx + salt, gy - salt); if (n < .5) continue;
    const cx = gx + ilhaNoise(gy, gx + 3) * step, cy = gy + ilhaNoise(gx + 9, gy) * step; if (where && !where(cx, cy)) continue;
    const rx = 70 + n * 140, ry = rx * (.5 + ilhaNoise(cx, cy) * .3);
    ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, n * 3, 0, Math.PI * 2); ctx.clip(); ctx.globalAlpha = alpha; mataTexture(index, cx - rx, cy - rx, rx * 2, rx * 2); ctx.restore();
  }
}
// O chão que não se mexe é pintado uma vez, em blocos de 512 px (como nos trechos da mata); por cima, a cada quadro,
// só a espuma na beira e a correnteza do rio.
const ilhaTiles = new Map(), ILHA_TILE_LIMIT = 32;
// Blocos do chão de um mapa da ilha (a ilha e os trechos da cerração usam a mesma memória, com prefixos diferentes).
function ilhaTilesDraw(prefix, W, H, view, paint) {
  if (!MATA_ART['mata-terrain']?.naturalWidth || !ENV_ART['pier-v1']?.naturalWidth) { paint(view); return; }
  const size = 512, pad = 3;
  for (let row = Math.max(0, Math.floor(view.y / size)); row < Math.min(Math.ceil(H / size), Math.ceil((view.y + view.h) / size)); row++) for (let col = Math.max(0, Math.floor(view.x / size)); col < Math.min(Math.ceil(W / size), Math.ceil((view.x + view.w) / size)); col++) {
    const key = prefix + ':' + col + ':' + row, x = col * size, y = row * size, w = Math.min(size, W - x), h = Math.min(size, H - y);
    let tile = ilhaTiles.get(key);
    if (!tile) { tile = document.createElement('canvas'); tile.width = w + pad * 2; tile.height = h + pad * 2; const main = ctx; ctx = tile.getContext('2d'); ctx.translate(pad - x, pad - y); try { paint({ x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2 }); } finally { ctx = main; } }
    ilhaTiles.delete(key); ilhaTiles.set(key, tile);
    while (ilhaTiles.size > ILHA_TILE_LIMIT) { const k = ilhaTiles.keys().next().value, old = ilhaTiles.get(k); ilhaTiles.delete(k); old.width = old.height = 0; }
    drawTileSnapped(tile, pad, pad, w, h, x, y);
  }
}
function drawIlhaGround(view) {
  ilhaTilesDraw('i', ILHA.W, ILHA.H, view, paintIlhaGround);
  // A espuma chegando na areia, um pouco pra fora da beira.
  ctx.save(); ctx.strokeStyle = 'rgba(230,240,235,.5)'; const foam = ilhaPath('espuma', () => ilhaCoastPath(-.007));
  for (let k = 0; k < 3; k++) { const off = (frameClock * 9 + k * 22) % 66; ctx.globalAlpha = .8 * (1 - off / 66); ctx.lineWidth = 3 + off * .2; ctx.stroke(foam); } ctx.restore();
  // A correnteza do rio.
  if (view.y < 3000 && view.y + view.h > 2250) {
    ctx.save(); ctx.clip(ilhaPath('rio', ilhaRioPath)); ctx.strokeStyle = 'rgba(220,235,230,.2)'; ctx.lineWidth = 2;
    for (let k = 0; k < 28; k++) { const fx = ILHA_RIO.x0 + ((k * 197 + frameClock * 40) % 4600), fy = ilhaRioY(fx) + ((k * 53) % 50) - 25; if (fx > view.x - 50 && fx < view.x + view.w + 50) { ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + 26, fy + 2); ctx.stroke(); } }
    ctx.restore(); for (const p of ILHA_RIO.pontes) drawIlhaPonte(p);
  }
}
function paintIlhaGround(view) {
  const { x, y, w, h } = view, coast = ilhaPath('costa', () => ilhaCoastPath(0)), campo = ilhaPath('campo', () => ilhaCoastPath(.05));
  if (!mataTexture(5, x, y, w, h)) rect(x, y, w, h, '#245158');
  ctx.fillStyle = 'rgba(8,26,40,.3)'; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.clip(coast); if (!mataTexture(4, x, y, w, h)) rect(x, y, w, h, '#d7c49a'); ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(80,64,40,.35)'; ctx.lineWidth = 16; ctx.stroke(coast); ctx.restore();
  ctx.save(); ctx.clip(campo); if (!mataTexture(3, x, y, w, h)) rect(x, y, w, h, '#697447');
  ilhaBlotches(view, 0, .6, 260, 11); ilhaBlotches(view, 2, .5, 300, 37, (cx, cy) => cy < 2150);
  ctx.fillStyle = 'rgba(20,30,16,.12)'; ctx.fillRect(x, y, w, h);
  ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(70,90,40,.45)'; ctx.lineWidth = 10; ctx.stroke(campo); ctx.restore();
  // As trilhas de terra.
  const trilhas = ilhaPath('trilhas', ilhaTrailPath), dirt = ilhaPattern(1);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(40,30,16,.22)'; ctx.lineWidth = 96; ctx.stroke(trilhas); ctx.strokeStyle = dirt || '#8e704b'; ctx.lineWidth = 82; ctx.stroke(trilhas); ctx.restore();
  // O rio e a lagoinha da nascente.
  const rio = ilhaPath('rio', ilhaRioPath), n = ilhaNascente();
  for (const clip of [rio, null]) {
    ctx.save(); if (clip) ctx.clip(clip); else { ctx.beginPath(); ctx.ellipse(n.x, n.y, n.rx, n.ry, 0, 0, Math.PI * 2); ctx.clip(); }
    if (!mataTexture(5, x, y, w, h)) rect(x, y, w, h, '#245158'); ctx.fillStyle = 'rgba(10,36,40,.22)'; ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
  ctx.save(); ctx.strokeStyle = 'rgba(60,46,28,.55)'; ctx.lineWidth = 8; ctx.stroke(rio); ctx.beginPath(); ctx.ellipse(n.x, n.y, n.rx, n.ry, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  // O pátio da fortaleza, de pedra.
  const F = FORT; ctx.save(); ctx.beginPath(); ctx.rect(F.x, F.y, F.w, F.h); ctx.clip(); if (!mataTexture(2, F.x, F.y, F.w, F.h)) rect(F.x, F.y, F.w, F.h, '#6e6a62'); ctx.fillStyle = 'rgba(30,26,20,.2)'; ctx.fillRect(F.x, F.y, F.w, F.h); ctx.restore();
  const g = FORT_PARTS.gateX; if (dirt) { ctx.save(); ctx.fillStyle = dirt; ctx.fillRect(g, F.y + F.h - F.t - 20, F.gate, F.t + 60); ctx.restore(); }
  drawMasmorraEscada(FORT_PARTS.stair);
  // O trapiche, descendo da praia pro mar.
  const P = ILHA.pier; ctx.save(); ctx.translate(P.x + P.w / 2, P.y + P.h / 2); ctx.rotate(Math.PI / 2);
  if (!environmentSprite('pier-v1', 0, 0, P.w / 2 + 14, P.h + 20, P.w + 28)) { rect(-P.h / 2, -P.w / 2, P.h, P.w, '#8a6038', 3, '#4a3018'); for (let k = -P.h / 2 + 10; k < P.h / 2; k += 18) rect(k, -P.w / 2, 2, P.w, '#5a3a20'); }
  ctx.restore();
}
function drawIlhaPonte(p) {
  const cy = ilhaRioY(p.x), half = ilhaRioHalf(p.x) + 64, x0 = p.x - p.half, wood = p.kind === 'tabua';
  ellipse(p.x, cy + half - 6, p.half + 10, 10, 'rgba(10,10,6,.3)');
  for (let y = cy - half; y < cy + half; y += wood ? 16 : 20) rect(x0, y, p.half * 2, wood ? 13 : 12, (Math.floor(y / 16) % 3) ? '#8a6038' : '#7a5232', 2, '#4a3018');
  if (wood) { for (const sx of [x0 - 6, x0 + p.half * 2]) rect(sx, cy - half - 10, 8, half * 2 + 14, '#5a3a20', 2); }
  else { ctx.save(); ctx.strokeStyle = '#c8b080'; ctx.lineWidth = 3; for (const sx of [x0 - 3, x0 + p.half * 2 + 3]) { ctx.beginPath(); ctx.moveTo(sx, cy - half); ctx.quadraticCurveTo(sx + (sx < p.x ? -10 : 10), cy, sx, cy + half); ctx.stroke(); } ctx.restore(); }
  for (const sy of [cy - half - 4, cy + half - 4]) for (const sx of [x0 - 8, x0 + p.half * 2 + 2]) rect(sx, sy - 22, 12, 30, '#4a3018', 3);
}
function drawMasmorraEscada(s) {
  rect(s.x - 12, s.y - 12, s.w + 24, s.h + 24, '#5e5a52', 6, '#3a3630');
  rect(s.x, s.y, s.w, s.h, '#141210', 4);
  for (let k = 0; k < 4; k++) rect(s.x + 8, s.y + s.h - 20 - k * 22, s.w - 16, 12, `rgba(120,110,96,${.5 - k * .1})`, 2);
}
function drawFortWall(r) {
  const H = r.tall || FORT.H, base = r.y + r.h;
  if (r.front) {
    const fy = base - H; if (!mataTexture(2, r.x, fy, r.w, H)) rect(r.x, fy, r.w, H, '#6e6a62');
    ctx.fillStyle = 'rgba(28,24,20,.38)'; ctx.fillRect(r.x, fy, r.w, H);
    ctx.strokeStyle = 'rgba(18,14,10,.32)'; ctx.lineWidth = 2;
    for (let yy = fy, row = 0; yy < base - 2; yy += 18, row++) { ctx.beginPath(); ctx.moveTo(r.x, yy); ctx.lineTo(r.x + r.w, yy); ctx.stroke(); for (let xx = r.x + (row % 2 ? 18 : 0); xx < r.x + r.w; xx += 36) { ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx, Math.min(yy + 18, base)); ctx.stroke(); } }
    rect(r.x, base - 8, r.w, 8, 'rgba(10,8,6,.3)');
  }
  // O topo da muralha, com as ameias por fora.
  const ty = r.y - H; rect(r.x, ty, r.w, r.h, '#9c968a'); ctx.fillStyle = 'rgba(255,248,230,.07)'; ctx.fillRect(r.x, ty, r.w, 6);
  ctx.strokeStyle = 'rgba(40,36,30,.5)'; ctx.lineWidth = 2; ctx.strokeRect(r.x + 1, ty + 1, r.w - 2, r.h - 2);
  if (!r.side) for (let xx = r.x + 6; xx < r.x + r.w - 14; xx += 34) rect(xx, ty - 12, 20, 14, '#8c867a', 2, '#56524a');
  else for (let yy = ty + 10; yy < ty + r.h - 14; yy += 34) { rect(r.x - 6, yy, 12, 20, '#8c867a', 2, '#56524a'); rect(r.x + r.w - 6, yy, 12, 20, '#8c867a', 2, '#56524a'); }
  for (const cx of r.cannons || []) { const cy = ty + r.h / 2; rect(cx - 22, cy - 10, 44, 20, '#4a3420', 3); rect(cx - 7, cy, 14, 34, '#1e1c1a', 6); ellipse(cx, cy + 34, 7, 4, '#0c0a08'); }
}
function drawIlhaFortLayers(seen, layers) {
  const P = FORT_PARTS;
  for (const r of [...P.walls, ...P.towers, ...P.gate]) if (seen(r.x + r.w / 2, r.y + r.h / 2, Math.max(r.w, r.h))) layers.push({ y: r.y + r.h, draw: () => drawFortWall(r) });
  // O arco do portão (passando por baixo dele, ele fica na frente).
  const gx = P.gateX, sy = FORT.y + FORT.h - FORT.t;
  layers.push({ y: sy + FORT.t + 1, draw: () => { rect(gx - 4, sy - FORT.H - 24, FORT.gate + 8, 28, '#8c867a', 3, '#56524a'); ctx.fillStyle = '#56524a'; ctx.beginPath(); ctx.arc(gx + FORT.gate / 2, sy - FORT.H + 4, FORT.gate / 2, Math.PI, 0); ctx.lineTo(gx + FORT.gate, sy - FORT.H - 2); ctx.lineTo(gx, sy - FORT.H - 2); ctx.fill(); } });
  for (const h of P.houses) if (seen(h.x + h.w / 2, h.y + h.h / 2, 400)) layers.push({ y: h.y + h.h, draw: () => drawStoneHouse(h, h.name) });
  layers.push({ y: P.flag.y, draw: () => drawNavioFlag(P.flag.x, P.flag.y) });
}
function drawIlhaLandmarks(seen, layers) {
  const f = ILHA.farol, r = ILHA.ranchos, c = ILHA.capela;
  if (seen(f.x, f.y, 400)) layers.push({ y: f.y, draw: () => {
    ellipse(f.x, f.y + 4, 70, 18, 'rgba(10,10,6,.3)'); rect(f.x - 70, f.y - 30, 140, 34, '#8c867a', 4, '#56524a');
    poly([[f.x - 46, f.y - 28], [f.x + 46, f.y - 28], [f.x + 30, f.y - 300], [f.x - 30, f.y - 300]], '#ece6da');
    for (const yy of [-110, -200]) poly([[f.x - 44 + (-yy - 28) * .06, f.y + yy], [f.x + 44 - (-yy - 28) * .06, f.y + yy], [f.x + 40 - (-yy - 28) * .06, f.y + yy - 36], [f.x - 40 + (-yy - 28) * .06, f.y + yy - 36]], '#b8402e');
    rect(f.x - 38, f.y - 318, 76, 20, '#3a3630', 3); rect(f.x - 26, f.y - 370, 52, 52, 'rgba(255,236,170,.85)', 4, '#3a3630');
    ctx.fillStyle = '#3a3630'; ctx.beginPath(); ctx.moveTo(f.x - 36, f.y - 368); ctx.lineTo(f.x, f.y - 404); ctx.lineTo(f.x + 36, f.y - 368); ctx.closePath(); ctx.fill();
    rect(f.x - 12, f.y - 70, 24, 42, '#5a3a20', 2);
  } });
  if (seen(r.x, r.y, 500)) for (const [dx, dy] of ILHA_RANCHOS) {
    const hh = { x: r.x + dx - 100, y: r.y + dy - 230, w: 200, h: 230 };
    layers.push({ y: r.y + dy, draw: () => { worldHouse(hh, null, { wall: '#a89a7c', roof: '#7a6a48', chimney: false }); ctx.fillStyle = 'rgba(30,24,16,.25)'; ctx.fillRect(hh.x, hh.y + 64, hh.w, hh.h - 64); } });
  }
  if (seen(r.x, r.y, 500)) {
    layers.push({ y: r.y + 120, draw: () => { environmentSprite('pier-v1', 1, r.x - 40, r.y + 150, 210, 70); ctx.save(); ctx.strokeStyle = 'rgba(200,190,160,.6)'; ctx.lineWidth = 1.2; for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.moveTo(r.x + 170 + k * 9, r.y + 30); ctx.lineTo(r.x + 160 + k * 11, r.y + 110); ctx.stroke(); } ctx.restore(); rect(r.x + 160, r.y + 20, 4, 100, '#5a3a20'); rect(r.x + 250, r.y + 20, 4, 100, '#5a3a20'); rect(r.x + 158, r.y + 22, 98, 4, '#5a3a20'); } });
  }
  if (seen(c.x, c.y, 400)) layers.push({ y: c.y - 44, draw: () => {
    ctx.save(); ctx.fillStyle = '#9c968a'; ctx.strokeStyle = '#56524a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(c.x - 150, c.y - 44); ctx.lineTo(c.x - 150, c.y - 210); ctx.lineTo(c.x - 90, c.y - 236); ctx.lineTo(c.x - 40, c.y - 190); ctx.lineTo(c.x - 10, c.y - 260); ctx.lineTo(c.x + 40, c.y - 210); ctx.lineTo(c.x + 70, c.y - 230); ctx.lineTo(c.x + 150, c.y - 150); ctx.lineTo(c.x + 150, c.y - 44); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    rect(c.x - 30, c.y - 130, 60, 86, '#1e1a16', 30); rect(c.x - 6, c.y - 340, 12, 110, '#5a3a20', 2); rect(c.x - 36, c.y - 312, 72, 10, '#5a3a20', 2);
    for (let k = 0; k < 6; k++) ellipse(c.x - 120 + k * 50, c.y - 30 + (k % 2) * 14, 18, 10, '#8c867a');
  } });
}
// Árvore da ilha (passando por trás, a copa fica transparente).
function ilhaTreeDraw(t, p) {
  const behind = Math.abs(p.x - t.x) < 110 * t.s && p.y < t.y + 6 && p.y > t.y - 260 * t.s, sway = Math.sin(frameClock * .8 + t.x) * 1.1;
  ctx.save(); if (behind) ctx.globalAlpha = .45;
  if (t.kind === 'butia') { const s = 190 * t.s; if (!worldSprite('butia-v2', 0, t.x - s / 2 + sway, t.y - s, s, s)) environmentSprite('tree-varieties-v1', 1, t.x, t.y, s, s); }
  else if (t.kind === 'folha') environmentSprite('tree-varieties-v1', t.v, t.x + sway, t.y, 260 * t.s, 300 * t.s);
  else if (t.kind === 'xaxim') environmentSprite('regional-flora-v1', 1, t.x, t.y, 160 * t.s, 210 * t.s);
  else environmentSprite('regional-flora-v1', 3, t.x + sway, t.y, 160 * t.s, 300 * t.s);
  ctx.restore();
}
// O paredão: a face de pedra embaixo da beira do alto, as colunas de basalto nos lados e a boca escura da picada.
function drawIlhaPenhasco(seen, layers) {
  const P = PLANALTO, g = P.gap, base = P.y + P.face;
  for (const [a, b] of [[P.x0 + 30, g.x - 40], [g.x + g.w + 40, P.x1 - 30]]) {
    const n = Math.ceil((b - a) / 300), w = (b - a) / n;
    for (let k = 0; k < n; k++) { const x = a + k * w; if (seen(x + w / 2, base, 400)) layers.push({ y: base, draw: () => { if (!mataCliff(1, x + w / 2, base + 6, w + 30, P.face + 30)) rect(x, P.y, w, P.face, '#5e5a52'); } }); }
  }
  for (const [x0, x1] of [[g.x - 40, g.x], [g.x + g.w, g.x + g.w + 40]]) layers.push({ y: base, draw: () => rect(x0, P.y, x1 - x0, P.face, '#4e4a44', 4) });
  for (const sx of [P.x0 + 30, P.x1 - 30]) for (let y = 560; y < base; y += 110) if (ilhaLand(sx, y, .01) && seen(sx, y, 200)) layers.push({ y: y + 40, draw: () => mataNature(12, sx, y + 40, 110, 150) });
  if (seen(g.x + g.w / 2, P.y, 400)) {
    layers.push({ y: P.y + 2, draw: () => { ctx.save(); const gr = ctx.createLinearGradient(0, P.y, 0, base); gr.addColorStop(0, 'rgba(4,6,10,.95)'); gr.addColorStop(1, 'rgba(10,14,12,.4)'); ctx.fillStyle = gr; ctx.fillRect(g.x, P.y, g.w, P.face); ctx.restore(); } });
    layers.push({ y: base + 30, draw: () => mataPlaca(g.x + g.w + 130, base + 30, 'MATA DA CERRAÇÃO', 210) });
  }
}
function drawIlha(view, seen, layers) {
  drawIlhaGround(view);
  const F = ilhaFlora(), p = worldOut;
  for (const t of F.trees) if (seen(t.x, t.y, 320)) layers.push({ y: t.y, draw: () => ilhaTreeDraw(t, p) });
  for (const b of F.brush) if (seen(b.x, b.y, 120)) layers.push({ y: b.y, draw: () => mataNature(b.i, b.x, b.y, b.w, b.w * .85) });
  for (const r of F.rocks) if (seen(r.x, r.y, 160)) layers.push({ y: r.y, draw: () => mataNature(r.i, r.x, r.y, r.w, r.w * .75) });
  drawIlhaFortLayers(seen, layers); drawIlhaLandmarks(seen, layers); drawIlhaPenhasco(seen, layers);
  // O trapiche: o fogo, a placa e o barco do seu Nereu com ele dentro.
  const fg = ILHA.fogo, b = ILHA.boat, bob = Math.sin(frameClock * 1.3) * 3;
  if (seen(fg.x, fg.y, 500)) {
    layers.push({ y: fg.y, draw: () => { if (!worldSprite('rural', 6, fg.x - 70, fg.y - 110, 140, 110)) sceneFire(fg.x, fg.y); } });
    layers.push({ y: ILHA.placa.y, draw: () => mataPlaca(ILHA.placa.x, ILHA.placa.y, 'ILHA DA FORTALEZA', 230) });
    layers.push({ y: b.y, draw: () => { if (!environmentSprite('pier-v1', 1, b.x, b.y + bob, 220, 80)) ellipse(b.x, b.y - 20 + bob, 100, 26, '#6a4628'); drawNereu(b.x + 20, b.y - 22 + bob, -1); } });
  }
  if (mataCombatOn() && !scene) drawMataNightLayers(layers, seen);
  // A cerração por cima de tudo (de noite, mais escuro), o farol girando e o fogo do trapiche.
  layers.push({ y: 8e9, draw: () => {
    rect(view.x, view.y, view.w, view.h, 'rgba(170,184,190,.10)');
    ctx.save(); for (let k = 0; k < 6; k++) { const fx = view.x + ((k * 811 + frameClock * 22) % (view.w + 900)) - 450, fy = view.y + (k * 377) % view.h; ctx.globalAlpha = .07; ellipse(fx, fy, 420, 90, '#dfe6ea'); } ctx.restore();
    if (worldNight()) { mataNightVeil(view, .5); darkHole(p.x, p.y - 40, 260, 820, '6,10,18', .45); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(fg.x, fg.y - 30, 220, .26 + .05 * Math.sin(frameClock * 9), '255,150,60');
    const fa = ILHA.farol, fy = typeof islandFarolLightY === 'function' ? islandFarolLightY() : fa.y - 345, ang = frameClock * .8; glow(fa.x, fy, 120, .4, '255,236,170'); ctx.globalAlpha = .12; ctx.fillStyle = '#fff2c0'; ctx.beginPath(); ctx.moveTo(fa.x, fy); ctx.arc(fa.x, fy, 900, ang - .12, ang + .12); ctx.closePath(); ctx.fill();
    ctx.restore();
  } });
}

// ---------- Desenho das masmorras ----------
const MASM_FACES = (() => {
  const faces = [], step = 20;
  for (const r of MASM.floors) for (let x = r.x; x < r.x + r.w; x += step) if (!MASM.floors.some(f => f !== r && x + step / 2 > f.x && x + step / 2 < f.x + f.w && r.y - 10 > f.y && r.y - 10 < f.y + f.h)) faces.push({ x, y: r.y - 80, w: Math.min(step, r.x + r.w - x), h: 80 });
  return faces;
})();
function drawMasmorra(view, seen, layers) {
  rect(view.x, view.y, view.w, view.h, '#0b0907');
  for (const r of MASM.floors) { ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip(); if (!mataTexture(2, r.x, r.y, r.w, r.h)) rect(r.x, r.y, r.w, r.h, '#4a4640'); ctx.fillStyle = r.cell ? 'rgba(16,12,8,.55)' : 'rgba(16,12,8,.42)'; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.restore(); }
  // A parede de pedra que se vê em cima de cada corredor.
  for (const f of MASM_FACES) if (seen(f.x, f.y, 60)) { rect(f.x, f.y, f.w, f.h, '#3a3530'); ctx.fillStyle = 'rgba(0,0,0,.2)'; for (let yy = f.y + 14; yy < f.y + f.h; yy += 16) ctx.fillRect(f.x, yy, f.w, 2); if ((f.x / 20) % 2) ctx.fillRect(f.x, f.y, 2, f.h); }
  // As celas fechadas: palha, corrente e a grade.
  for (const c of MASM.cells) if (seen(c.x + c.w / 2, c.y + c.h / 2, 200)) {
    rect(c.x, c.y, c.w, c.h, '#1a1612'); rect(c.x, c.y - 70, c.w, 70, '#2e2a26');
    ellipse(c.x + c.w * .6, c.y + c.h * .6, 40, 14, '#6a5a32'); rect(c.x + 30, c.y - 40, 4, 60, '#3a3a3a');
    layers.push({ y: c.y + c.h, draw: () => { rect(c.x, c.y + c.h - 6, c.w, 8, '#2a2a2a'); for (let x = c.x + 8; x < c.x + c.w - 4; x += 16) rect(x, c.y + c.h - 120, 4, 120, '#3c3c3c'); rect(c.x, c.y + c.h - 124, c.w, 6, '#2a2a2a'); } });
  }
  for (const r of MASM.floors) if (r.cell) {
    if (r.cell === 'aberta') ellipse(r.x + r.w * .5, r.y + r.h * .55, 44, 16, '#6a5a32');
    layers.push({ y: r.y + r.h, draw: () => { rect(r.x, r.y + r.h - 6, 30, 8, '#2a2a2a'); for (let x = r.x + 4; x < r.x + 30; x += 14) rect(x, r.y + r.h - 120, 4, 120, '#3c3c3c'); rect(r.x + r.w - 30, r.y + r.h - 6, 30, 8, '#2a2a2a'); } });
  }
  // A pista do Bento: o lenço vermelho no chão da cela do fundo.
  if (!ilhaState().pista) { const c = MASM.clue; ctx.fillStyle = '#b8282a'; ctx.beginPath(); ctx.moveTo(c.x - 18, c.y - 4); ctx.lineTo(c.x + 20, c.y - 10); ctx.lineTo(c.x + 8, c.y + 10); ctx.closePath(); ctx.fill(); }
  // A escada de volta pro pátio.
  const s = MASM.stair; for (let k = 0; k < 4; k++) rect(s.x - 80, s.y - 10 + k * 18, 160, 12, `rgba(120,110,96,${.6 - k * .12})`, 2);
  for (const [tx, ty] of MASM.torches) layers.push({ y: ty, draw: () => { rect(tx - 4, ty - 60, 8, 26, '#3a2a18', 2); const fl = Math.sin(frameClock * 14 + tx) * 2; ellipse(tx, ty - 66 + fl, 7, 11, '#ffb040'); ellipse(tx, ty - 64 + fl, 4, 6, '#fff0a0'); } });
  if (mataCombatOn() && !scene) drawMataNightLayers(layers, seen);
  layers.push({ y: 8e9, draw: () => {
    rect(view.x, view.y, view.w, view.h, 'rgba(4,3,2,.42)'); darkHole(worldOut.x, worldOut.y - 40, 180, 600, '4,3,2', .6);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const [tx, ty] of MASM.torches) glow(tx, ty - 60, 200, .2 + .04 * Math.sin(frameClock * 11 + tx), '255,150,60'); ctx.restore();
  } });
}

// ---------- Painel e avisos ----------
function ilhaTop() {
  const N = mataNight; if (!N || scene || !mataCombatOn()) return;
  for (const b of N.beasts) if (b.hp > 0) ILHA_MOBS[b.kind]?.warn?.(b, N);
  drawMataWarnings();
  if (N.hurt > 0) { ctx.fillStyle = `rgba(200,30,20,${N.hurt * .8})`; ctx.fillRect(worldOut.x - 3000, worldOut.y - 3000, 6000, 6000); }
  const left = N.beasts.filter(b => b.hp > 0 && !b.minion).length, safe = ilhaSafeNow(worldOut), map = worldOut.map;
  const title = map === 'ilha' ? 'Ilha da Fortaleza' : map === 'masmorra' ? 'Cripta da fortaleza' : 'Mata da cerração · trecho ' + (ilhaState().trecho || 1) + '/' + ILHAMATO.last;
  mataHudPanel(title, safe ? 'perto do fogo, ninguém chega' : left ? left + (left === 1 ? ' inimigo por perto' : ' inimigos por perto') : 'tudo limpo por hoje');
  const boss = N.beasts.find(b => b.boss && b.hp > 0); if (boss) ilhaBossBar(boss);
}

// ---------- A missão: levaram o Bento ----------
function bentoChamando() { const won = G.mata?.laguna?.won; return !!won && missionDone('laguna') && G.day > won && !missionState('bento'); }
MISSIONS.push({ id: 'bento', title: 'Levaram o Bento!', giver: 'garibaldi', side: true, where: 'Santa Catarina e a Ilha da Fortaleza',
  direct: () => bentoSequestro(),
  when: () => bentoChamando() && ['mata', 'laguna'].includes(worldOut?.map) && !scene && !modal && !worldTalkOpen() && !paused,
  goal: () => bentoGoal(), done: () => !!ilhaState().contou,
  reward: { cash: 400, xp: 250, rep: 5 }, outroBy: 'sadi',
  outro: ['O Bento tá preso no Forte do Mar, na Bahia, e o Giuseppe já juntou a tropa.', 'Aguenta firme, Bento: a gente tá indo te buscar. (A história continua…)'] });
function bentoGoal() {
  const st = ilhaState();
  if (!st.sabeBarqueiro) return 'Descubra como chegar à ilha da fortaleza: em Santa Catarina, pergunte ao Peixinho na Brasa, que vive da pesca';
  if (!st.chegou) return 'Pague o seu Nereu, barqueiro, no trapiche do Itajaí-Açu (no fim da rua de Santa Catarina, à direita) pra te levar até a ilha';
  if (!st.planalto && !st.grenfell) { const n = st.fundo || 0, chefe = n >= 4 && !st.bruxaMor ? ' · a Bruxa-mor tranca a cerração no trecho 4' : n >= 7 && !st.bernunciaMae ? ' · a Bernúncia-mãe guarda a subida no trecho 7' : ''; return 'Na Ilha da Fortaleza: depois do rio, entre na picada da cerração (no pé do paredão) e atravesse a mata escura até o alto da ilha' + (n ? ' (trecho ' + n + '/' + ILHAMATO.last + ')' : '') + chefe; }
  if (!st.grenfell) return 'No alto da ilha: entre no pátio da fortaleza e enfrente o almirante Grenfell (quando ele subir na muralha, puxe com o arpão do Griggs)';
  if (!st.chave) return 'Pegue a chave que o almirante deixou cair no pátio da fortaleza';
  if (!st.pista) { const n = worldOut?.map === 'masmorra' ? criptaFaltam() : 0; return !st.masmorra ? 'Abra a cripta com a chave do almirante (a escada fica no pátio da fortaleza)' : n ? 'Na cripta: derrube os carcereiros (faltam ' + n + ') e chegue na cela do Bento, no fim do corredor do meio' : 'Na cripta: a cela do Bento, no fim do corredor do meio'; }
  return 'Volte pro pinheiral, na Mata de Araucárias, e conte tudo pro Giuseppe Garibaldi';
}
function bentoSequestro() {
  const m = MISSIONS.find(x => x.id === 'bento'); keys.clear();
  talk([
    ['garibaldi', 'Gaúcho! Ainda bem que tu veio. Levaram o Bento!'],
    ['sadi', 'Levaram? Quem?'],
    ['anita', 'Os marinheiros do Império. Nem todos aceitaram a paz do capitão Mariath: os que não baixaram a bandeira voltaram na cerração, ontem de noite.'],
    ['garibaldi', 'Pegaram o Bento na beira da barra e sumiram num bote, rumo ao norte.'],
    ['anita', 'Pra ilha da fortaleza, no mar de Santa Catarina: uma fortaleza velha do Império, com masmorra embaixo. Era pra lá que levavam farrapo preso.'],
    ['garibaldi', 'Não é a primeira vez: em 1836 o Bento caiu preso na Ilha do Fanfa e passou de fortaleza em fortaleza. Na Bahia, fugiu do Forte do Mar nadando!'],
    ['sadi', 'E como é que se chega nessa ilha?'],
    ['garibaldi', 'Aí é que tá: a ilha some na cerração. Barco do Império não leva farrapo, e fantasma não rema.'],
    ['anita', 'Pergunta pra quem vive da água em Santa Catarina. Pescador velho conhece caminho que nem mapa conhece.'],
    ['sadi', 'Pois eu vou atrás do Bento.'],
    ['dica', '<b>Missão: Levaram o Bento!</b><br>' + bentoGoal() + '.<br><i>Onde: ' + m.where + '</i><br><br>Recompensa:' + rewardHTML(m.reward), 'Nova missão']
  ], () => startMission(m), 'Vou atrás dele');
}
function peixinhoIlha() {
  const st = ilhaState(); st.sabeBarqueiro = G.day; save();
  talk([
    ['peixinhonabrasa', 'A ilha da cerração? Bah, Sadi, essa ilha pescador nenhum quer nem olhar.'],
    ['peixinhonabrasa', 'Dizem que de noite aparece luz verde lá em cima, na fortaleza velha, e que quem chega perto ouve corneta de quartel.'],
    ['peixinhonabrasa', 'Mas tem um que atravessa: o seu Nereu, barqueiro velho do Itajaí-Açu. Desce o rio até o mar e conhece a cerração de olho fechado.'],
    ['peixinhonabrasa', 'Ele fica no trapiche, no fim da rua grande, depois do café. Só que cobra, viu? Coragem não é de graça.'],
    ['sadi', 'Valeu, Peixinho!']
  ], () => showBanner('Missão: Levaram o Bento!', bentoGoal(), 'info', { world: true }), 'Valeu');
}
function peixinhoTemPista() { return missionActive('bento') && !ilhaState().sabeBarqueiro; }

// ---------- Ligações ----------
{
  const here = mataHere; mataHere = function () { return here() || ilhaAqui(); };
  const combatOn = mataCombatOn; mataCombatOn = function () { if (ilhaAqui()) return !prologueActive(); return combatOn(); };
  const start = mataNightStart; mataNightStart = function () { if (ilhaAqui()) { ilhaBeastsStart(); return; } start(); };
  const combat = mataCombatTick; mataCombatTick = function (dt) {
    if (ilhaAqui()) { if (mataNight && mataNight.key !== ilhaKey()) mataNight = null; } else if (mataNight?.ilha) mataNight = null;
    combat(dt); const N = mataNight;
    if (N?.ilha && !paused && !modal && !scene && !N.faint && !phoneOpen && !worldTalkOpen()) ilhaCombatExtras(N, dt, worldOut);
  };
  const beast = mataBeastTick; mataBeastTick = function (b, dt, p) {
    const mob = ILHA_MOBS[b.kind]; if (!mob || b.stun > 0) return beast(b, dt, p);
    const x0 = b.x, y0 = b.y; mob.tick(b, dt, p, mataNight); b.moving = Math.hypot(b.x - x0, b.y - y0) > 18 * dt;
  };
  const hurt = mataHurt; mataHurt = function (dmg, from) { if (worldOut?.map === 'ilha' && ilhaSafe(worldOut.x, worldOut.y)) return; return hurt(dmg, from); };
  const kill = mataKill; mataKill = function (b) {
    kill(b); const mob = ILHA_MOBS[b.kind]; if (!mob || !mataNight?.ilha) return;
    if (b.idx != null) ilhaKilled(mataNight.ilha).push(b.idx); mataXP(mob.xp || 8);
    if (!b.minion && !b.boss && Math.random() < .5) mataNight.drops.push({ x: b.x, y: b.y, q: 5 + Math.floor(Math.random() * 8) });
    mob.onKill?.(b, mataNight);
  };
  // Desmaiou na ilha ou na masmorra: acorda no trapiche, com o seu Nereu.
  const faint = mataFaint; mataFaint = function () {
    if (!ilhaAqui()) return faint();
    const N = mataNight; if (!N || N.faint) return; N.faint = true; keys.clear();
    const lost = Math.min(80, Math.round(G.cash * .1)); G.cash = round(G.cash - lost); caveState().hp = caveMaxHp(); mataBuffs.veneno = 0; AudioEngine.caveFaintSound?.(); save();
    mataNight = null; switchMap({ map: 'ilha', ...ILHA.arrive, title: 'Ilha da Fortaleza' });
    talk([['card', `<b>😵 Desmaiou na ilha</b><br>Acordou no trapiche, com a cabeça doendo e o bolso mais leve (−${money(lost)}). O seu Nereu te arrastou até o barco.`, 'Ilha da Fortaleza'], [nereuSpeaker(), 'Bah, vivente! Esses marinheiros não brincam. Descansa no fogo antes de subir de novo.']], null, 'Levantar');
  };
  const mounted = playerMounted; playerMounted = function () { return ilhaAqui() ? false : mounted(); };
  const sparks = drawSparks; drawSparks = function (map = null) { sparks(map); if (map === worldOut?.map && ilhaAqui()) ilhaTop(); };
  const drawBeast = drawCaveBeast; drawCaveBeast = function (b) { const mob = ILHA_MOBS[b.kind]; if (mob) { mob.draw(b); return; } drawBeast(b); };
  const cry = AudioEngine.caveCry; AudioEngine.caveCry = function (kind, dead = false) {
    const mob = ILHA_MOBS[kind]; if (!mob?.cry) return cry.call(this, kind, dead);
    mob.cry.call(this, dead);
  };
  // O Bento some do acampamento dele enquanto estiver sequestrado.
  const folk = campFolk; campFolk = function (n) { const f = folk(n); return f?.id === 'bento' && missionState('bento') && !ilhaState().resgatado ? null : f; };
  // O Garibaldi chama (no canto da tela) até o Sadi voltar pra mata ou pra barra.
  const lines = trackerLines; trackerLines = function () { const list = lines(); if (bentoChamando() && list.length < 2) list.push({ icon: '📣', title: 'Levaram o Bento!', goal: 'O Garibaldi te chama no pinheiral, na Mata de Araucárias', kind: 'side' }); return list; };
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (bentoChamando() && !ilhaState().chamou && !scene && !modal) { ilhaState().chamou = G.day; showBanner('O Garibaldi quer falar contigo', 'Volte ao pinheiral, na Mata de Araucárias.', 'info', { world: true }); AudioEngine.heart?.(); save(); } };
  // O Peixinho na Brasa conta do barqueiro (na rua ou em casa).
  const wt = worldTalk; worldTalk = function (w) { if (PEOPLE[w.person]?.id === 'peixinhonabrasa' && peixinhoTemPista()) { peixinhoIlha(); return; } return wt(w); };
  const casa = WORLD_MAPS['casa:peixinhonabrasa'];
  if (casa) { const sp = casa.spots; casa.spots = function () { const list = sp.call(this), h = list.find(s => s.id === 'home:peixinhonabrasa'); if (h && peixinhoTemPista()) { h.label = 'Perguntar pro Peixinho da ilha da cerração'; h.act = peixinhoIlha; } return list; }; }
}
