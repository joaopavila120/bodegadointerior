// Mata de Araucárias: à direita da Serra Gaúcha, seguindo a estrada até o fim. Um pinheiral fechado, cortado por picadas
// de chão batido e por um arroio pequeno que desce do norte pro sul, bem no meio do mapa.
//   · Entrada pela esquerda (a estrada da Serra vira picada), com a placa da mata.
//   · A picada principal atravessa o arroio numa ponte de madeira e sobe até a clareira da araucária centenária (nordeste).
//   · Um ramal sobe à Aldeia do Pinhal; outro cruza o arroio pelas pedras até o acampamento farroupilha.
//   · No meio do arroio, um remanso mais largo, com taboa e uma prainha de cascalho.
//   · Ao lado da centenária, a picada do leste segue até a borda direita (o mapa continua pra lá, mais adiante).
// Moradias e amigos conhecidos na expedição: mata-povoamentos.js.
'use strict';

const MATA = {
  W: 3600, H: 2600, entryY: 985, trailHalf: 42, branchHalf: 32, bridgeY: 1010, stonesY: 2010, poolY: 1520,
  clearings: [
    { id: 'entrada', x: 300, y: 985, rx: 250, ry: 160 },
    { id: 'aldeia', x: 925, y: 455, rx: 525, ry: 390 },
    { id: 'centenaria', x: 3200, y: 600, rx: 320, ry: 210 },
    { id: 'farroupilha', x: 3000, y: 2180, rx: 550, ry: 360 },
    { id: 'rancho', x: 640, y: 1400, rx: 320, ry: 210 }   // o rancho do Garibaldi (mata-garibaldi.js)
  ],
  sign: { x: 380, y: 880 }, big: { x: 3230, y: 560 }
};
// O arroio: o centro e a meia largura em cada altura (mais largo no remanso).
function mataRiverX(y) { return 1850 + Math.sin(y / 360) * 130 + Math.sin(y / 140 + 1.3) * 45; }
function mataRiverHalf(y) { return 36 + 4 * Math.sin(y / 60) + 70 * Math.exp(-((y - MATA.poolY) ** 2) / (2 * 120 * 120)); }
MATA.clearings.push({ id: 'remanso', x: mataRiverX(MATA.poolY) + 210, y: MATA.poolY + 10, rx: 150, ry: 110 });
function mataOnBridge(x, y) { return Math.abs(y - MATA.bridgeY) < 40 && Math.abs(x - mataRiverX(MATA.bridgeY)) < mataRiverHalf(MATA.bridgeY) + 60; }
function mataOnStones(x, y) { return Math.abs(y - MATA.stonesY) < 24 && Math.abs(x - mataRiverX(MATA.stonesY)) < mataRiverHalf(MATA.stonesY) + 40; }

// ---------- As picadas ----------
// Pontos de controle suavizados (Catmull-Rom); as travessias caem exatamente sobre a ponte e as pedras.
function mataSmooth(pts, step = 22) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)], n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t, f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]); return out;
}
let mataTrailCache = null;
function mataTrails() {
  if (mataTrailCache) return mataTrailCache;
  const b = MATA.bridgeY, bx = mataRiverX(b), s = MATA.stonesY, sx = mataRiverX(s);
  const defs = [
    { id: 'principal', half: MATA.trailHalf, pts: [[-80, MATA.entryY], [260, 985], [600, 935], [960, 990], [1300, 1055], [bx - 300, b + 12], [bx - 120, b], [bx, b], [bx + 120, b], [bx + 320, b - 18], [2550, 905], [2880, 775], [3120, 680], [3260, 640]] },
    { id: 'mirante', half: MATA.branchHalf, pts: [[600, 935], [530, 720], [590, 580], [740, 570], [920, 565]] },
    { id: 'rancho', half: MATA.branchHalf, pts: [[420, 990], [440, 1150], [490, 1350], [580, 1455], [700, 1465]] },
    { id: 'leste', half: MATA.branchHalf, pts: [[3180, 660], [3340, 720], [3480, 760], [3700, 770]] },
    { id: 'sul', half: MATA.branchHalf, pts: [[960, 990], [1000, 1290], [1140, 1590], [1380, 1860], [sx - 260, s - 14], [sx - 100, s], [sx, s], [sx + 100, s], [sx + 260, s + 12], [2500, 2085], [2460, 2270], [2570, 2410], [2870, 2410], [3000, 2320]] }
  ];
  mataTrailCache = defs.map(d => {
    const pts = mataSmooth(d.pts), normals = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], c = pts[Math.min(pts.length - 1, i + 1)], dx = c[0] - a[0], dy = c[1] - a[1], L = Math.hypot(dx, dy) || 1; return [-dy / L, dx / L]; });
    const paths = new Map();
    return { ...d, pts, path(expand = 0) {
      if (paths.has(expand)) return paths.get(expand);
      const p = new Path2D(), side = s => pts.map((q, i) => { const wav = Math.sin((i * 22 + q[0]) / 70) * 4 + Math.sin(i * 1.7) * 2, r = d.half + expand + wav * s; return [q[0] + normals[i][0] * r * s, q[1] + normals[i][1] * r * s]; });
      const L = side(1), R = side(-1).reverse(); p.moveTo(...L[0]); for (const q of L) p.lineTo(...q); for (const q of R) p.lineTo(...q); p.closePath(); paths.set(expand, p); return p;
    } };
  });
  return mataTrailCache;
}
function mataTrailDist(x, y) {
  let best = Infinity, half = 0;
  for (const t of mataTrails()) for (let i = 0; i < t.pts.length - 1; i++) {
    const [ax, ay] = t.pts[i], [bx, by] = t.pts[i + 1], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1, k = clamp(((x - ax) * dx + (y - ay) * dy) / L, 0, 1), d = Math.hypot(x - ax - dx * k, y - ay - dy * k);
    if (d - t.half < best - half) { best = d; half = t.half; }
  }
  return best - half;   // distância até a beira da picada (negativo = em cima dela)
}
let mataRiverPaths = new Map();
function mataRiverPath(expand = 0) {
  if (mataRiverPaths.has(expand)) return mataRiverPaths.get(expand);
  const p = new Path2D(), L = [], R = [];
  for (let y = -40; y <= MATA.H + 40; y += 14) { const x = mataRiverX(y), h = mataRiverHalf(y) + expand + Math.sin(y / 23) * 2; L.push([x - h, y]); R.push([x + h, y]); }
  p.moveTo(...L[0]); for (const q of L) p.lineTo(...q); for (const q of R.reverse()) p.lineTo(...q); p.closePath(); mataRiverPaths.set(expand, p); return p;
}
function mataInClearing(x, y, grow = 1) { return MATA.clearings.some(c => ((x - c.x) / (c.rx * grow)) ** 2 + ((y - c.y) / (c.ry * grow)) ** 2 < 1); }

// ---------- A mata: árvores, mato baixo, pedras e troncos caídos ----------
let mataFlora = null;
function mataPlants() {
  if (mataFlora) return mataFlora;
  const R = caveRand(4242), trees = [], brush = [], rocks = [], reeds = [];
  const crownClear = (x, y, w, h) => [[0, .62], [0, .82], [-.3, .72], [.3, .72], [0, .45]].every(([kx, ky]) => { const px = x + kx * w, py = y - ky * h; return mataTrailDist(px, py) > 10 && Math.abs(px - mataRiverX(py)) > mataRiverHalf(py) + 14 && !mataInClearing(px, py, .9); });
  const free = (x, y, pad) => mataTrailDist(x, y) > pad && Math.abs(x - mataRiverX(y)) > mataRiverHalf(y) + pad + 30 && !mataInClearing(x, y, 1.05) && !(x < 240 && Math.abs(y - MATA.entryY) < 190);
  for (let gy = 150; gy < MATA.H - 30; gy += 118) for (let gx = 50; gx < MATA.W - 40; gx += 132) {
    const x = gx + (R() - .5) * 92, y = gy + (R() - .5) * 80; if (R() < .12 || !free(x, y, 58)) continue;
    const kind = R() < .84 ? 1 : 0, w = kind === 1 ? 236 + R() * 96 : 220 + R() * 70, h = w * (kind === 1 ? 1.42 : 1.3);
    // A copa fica bem acima do tronco: ela não pode tapar a picada, o arroio nem as clareiras.
    if (!crownClear(x, y, w, h)) continue;
    trees.push({ x, y, kind, w, h });
  }
  // A araucária centenária, bem maior que as outras, no meio da clareira do nordeste.
  trees.push({ x: MATA.big.x, y: MATA.big.y, kind: 1, w: 430, h: 620, big: true });
  for (let k = 0; k < 520; k++) {
    const x = 40 + R() * (MATA.W - 80), y = 120 + R() * (MATA.H - 160), dt = mataTrailDist(x, y);
    if (dt < 6 || Math.abs(x - mataRiverX(y)) < mataRiverHalf(y) + 26 || trees.some(t => Math.hypot(t.x - x, t.y - y) < 40)) continue;
    const near = dt < 60, clear = mataInClearing(x, y);
    if (MATA.clearings.some(c => ['aldeia','farroupilha'].includes(c.id) && ((x-c.x)/c.rx)**2+((y-c.y)/c.ry)**2<1)) continue;
    brush.push({ x, y, index: clear ? (R() < .6 ? 4 : 1) : near ? (R() < .5 ? 1 : 0) : (R() < .5 ? 0 : 5), w: 60 + R() * 46, h: 42 + R() * 30 });
  }
  // Pedras com musgo: algumas grandes (seguram o passo), na mata e na beira do arroio.
  for (let k = 0; k < 46; k++) {
    const x = 60 + R() * (MATA.W - 120), y = 160 + R() * (MATA.H - 220);
    if (mataTrailDist(x, y) < 20 || Math.abs(x - mataRiverX(y)) < mataRiverHalf(y) + 20 || mataInClearing(x, y, .8) || trees.some(t => Math.hypot(t.x - x, t.y - y) < 70)) continue;
    rocks.push({ x, y, w: 70 + R() * 60, solid: R() < .5 });
  }
  // Taboa e capim nas duas margens, menos na ponte e nas pedras.
  for (let y = 60; y < MATA.H; y += 70 + R() * 40) for (const side of [-1, 1]) {
    if (Math.abs(y - MATA.bridgeY) < 90 || Math.abs(y - MATA.stonesY) < 70 || R() < .25) continue;
    const x = mataRiverX(y) + side * (mataRiverHalf(y) + 18 + R() * 14); reeds.push({ x, y: y + R() * 20, index: R() < .65 ? 2 : 1, w: 54 + R() * 30, h: 46 + R() * 24 });
  }
  const logs = [{ x: 2120, y: 1585, w: 170, a: -.3 }];
  const grid = new Map(), add = (o, r) => { const k = Math.floor(o.x / 160) + ':' + Math.floor(o.y / 160); if (!grid.has(k)) grid.set(k, []); grid.get(k).push({ x: o.x, y: o.y, r }); };
  for (const t of trees) add(t, t.big ? 36 : 22);
  for (const r of rocks) if (r.solid) add({ x: r.x, y: r.y - 6 }, r.w * .32);
  for (const l of logs) for (let k = -2; k <= 2; k++) add({ x: l.x + Math.cos(l.a) * k * l.w / 5, y: l.y + Math.sin(l.a) * k * l.w / 5 }, 20);
  mataFlora = { trees, brush, rocks, reeds, logs, grid }; return mataFlora;
}
function mataSolid(x, y) {
  const g = mataPlants().grid, cx = Math.floor(x / 160), cy = Math.floor(y / 160);
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const o of g.get((cx + i) + ':' + (cy + j)) || []) if (Math.hypot(o.x - x, (o.y - y) * 1.15) < o.r) return true;
  return false;
}

// ---------- Desenho ----------
const mataTiles = new Map(), MATA_TILE_LIMIT = 28;
function paintMataTerrain(view) {
  const { x, y, w, h } = view;
  frontierTexture(0, x, y, w, h);
  ctx.fillStyle = 'rgba(16,38,22,.32)'; ctx.fillRect(x, y, w, h);   // a sombra da mata fechada
  // Grimpa: as folhas secas de araucária no chão, em manchas marrons.
  for (let gy = Math.floor(y / 170) * 170 - 340; gy < y + h + 340; gy += 170) for (let gx = Math.floor(x / 200) * 200 - 400; gx < x + w + 400; gx += 200) {
    const n = frontierNoise(gx + 7, gy + 3), cx = gx + n * 140, cy = gy + frontierNoise(gy, gx) * 110, r = 90 + n * 120;
    const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, r); g.addColorStop(0, n > .5 ? 'rgba(112,74,40,.30)' : 'rgba(72,54,30,.26)'); g.addColorStop(1, 'rgba(72,54,30,0)'); ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  // Clareiras: o sol entra e a grama fica mais clara.
  for (const c of MATA.clearings) {
    if (c.x + c.rx * 1.4 < x || c.x - c.rx * 1.4 > x + w || c.y + c.ry * 1.4 < y || c.y - c.ry * 1.4 > y + h) continue;
    ctx.save(); ctx.translate(c.x, c.y); ctx.scale(c.rx * 1.3, c.ry * 1.3); const g = ctx.createRadialGradient(0, 0, .1, 0, 0, 1); g.addColorStop(0, 'rgba(176,188,104,.42)'); g.addColorStop(.7, 'rgba(150,170,90,.2)'); g.addColorStop(1, 'rgba(150,170,90,0)'); ctx.fillStyle = g; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
  }
  // Picadas de chão batido, com a beira se misturando na grama.
  for (const [expand, alpha] of [[16, .12], [9, .28], [4, .55], [0, 1]]) for (const t of mataTrails()) { ctx.save(); ctx.clip(t.path(expand)); ctx.globalAlpha = alpha; frontierTexture(1, x, y, w, h); ctx.restore(); }
  // O arroio: cascalho na margem e a água no meio.
  if (x < mataRiverX(y) + 400 && x + w > mataRiverX(y + h) - 400 || true) for (const [expand, material, alpha] of [[28, 3, .2], [17, 3, .55], [8, 3, 1], [0, 2, 1]]) { ctx.save(); ctx.clip(mataRiverPath(expand)); ctx.globalAlpha = alpha; frontierTexture(material, x, y, w, h); ctx.restore(); }
  // Prainha de cascalho no remanso.
  { const px = mataRiverX(MATA.poolY) + mataRiverHalf(MATA.poolY) + 40, py = MATA.poolY + 20; ctx.save(); ctx.beginPath(); ctx.ellipse(px, py, 90, 46, .2, 0, Math.PI * 2); ctx.clip(); ctx.globalAlpha = .9; frontierTexture(3, x, y, w, h); ctx.restore(); }
  // Pinhas caídas embaixo da centenária; os pátios das comunidades ficam livres.
  for (const c of MATA.clearings.filter(c => c.id === 'centenaria')) for (let k = 0; k < 26; k++) {
    const n = frontierNoise(k * 13 + c.x, c.y), a = n * Math.PI * 2, r = frontierNoise(c.y + k, k) * .85, px = c.x + Math.cos(a) * c.rx * r, py = c.y + 40 + Math.sin(a) * c.ry * r * .8;
    if (px < x - 20 || px > x + w + 20 || py < y - 20 || py > y + h + 20) continue;
    ellipse(px, py + 3, 9, 4, 'rgba(20,14,8,.35)'); ellipse(px, py, 8, 6, '#6a4424'); ellipse(px - 2, py - 2, 3, 2, '#9a6a3a');
  }
  // Capim fino e pedrinhas (parte do chão, desenhados uma vez).
  for (let py = Math.floor(y / 64) * 64; py < y + h + 30; py += 64) for (let px = Math.floor(x / 73) * 73; px < x + w + 35; px += 73) {
    const n = frontierNoise(px + 31, py + 977), sx = px + n * 42, sy = py + frontierNoise(py, px) * 35;
    if (n < .7 || mataTrailDist(sx, sy) < 4 || Math.abs(sx - mataRiverX(sy)) < mataRiverHalf(sy) + 10) continue;
    worldSprite('frontier-flora', n > .9 ? 3 : 1, sx - 10, sy - 10, 12 + n * 10, 10 + n * 7);
  }
}
function drawMataTerrain(view) {
  if (!WORLD_ART['frontier-terrain']?.naturalWidth || !WORLD_ART['frontier-flora']?.naturalWidth) { rect(view.x, view.y, view.w, view.h, '#3e5a30'); ctx.save(); ctx.clip(mataRiverPath()); rect(view.x, view.y, view.w, view.h, '#305b5b'); ctx.restore(); return; }
  const size = 512, pad = 3;
  for (let row = Math.max(0, Math.floor(view.y / size)); row < Math.min(Math.ceil(MATA.H / size), Math.ceil((view.y + view.h) / size)); row++) for (let col = Math.max(0, Math.floor(view.x / size)); col < Math.min(Math.ceil(MATA.W / size), Math.ceil((view.x + view.w) / size)); col++) {
    const key = col + ':' + row, x = col * size, y = row * size, w = Math.min(size, MATA.W - x), h = Math.min(size, MATA.H - y);
    let tile = mataTiles.get(key);
    if (!tile) { tile = document.createElement('canvas'); tile.width = w + pad * 2; tile.height = h + pad * 2; const main = ctx; ctx = tile.getContext('2d'); ctx.translate(pad - x, pad - y); try { paintMataTerrain({ x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2 }); } finally { ctx = main; } }
    mataTiles.delete(key); mataTiles.set(key, tile);
    while (mataTiles.size > MATA_TILE_LIMIT) { const k = mataTiles.keys().next().value, old = mataTiles.get(k); mataTiles.delete(k); old.width = old.height = 0; }
    drawTileSnapped(tile, pad, pad, w, h, x, y);
  }
}
// A água correndo pro sul: risquinhos de luz que descem com a correnteza.
function drawMataWater(view) {
  ctx.save(); ctx.clip(mataRiverPath()); ctx.fillStyle = 'rgba(200,226,214,.32)';
  for (let k = 0; k < 90; k++) {
    const y = (k * 97 + frameClock * 34) % (MATA.H + 80) - 40; if (y < view.y - 30 || y > view.y + view.h + 30) continue;
    const x = mataRiverX(y) + (frontierNoise(k, 7) - .5) * mataRiverHalf(y) * 1.4; ctx.fillRect(x, y, 1.5, 10 + k % 9);
  }
  ctx.restore();
}
function drawMataBridge() {
  const y = MATA.bridgeY, cx = mataRiverX(y), half = mataRiverHalf(y) + 54;
  ellipse(cx, y + 42, half + 10, 10, 'rgba(10,20,20,.35)');
  rect(cx - half, y - 42, half * 2, 84, '#6a4c30', 3, '#3e2c1a');
  for (let px = cx - half + 4; px < cx + half - 6; px += 13) { rect(px, y - 40, 11, 80, (Math.round(px / 13) % 2) ? '#9a7650' : '#8a6a46', 1); rect(px + 4, y - 36, 2, 2, '#4a3624'); rect(px + 4, y + 32, 2, 2, '#4a3624'); }
}
function drawMataRail(y0) {
  const y = MATA.bridgeY + y0, cx = mataRiverX(MATA.bridgeY), half = mataRiverHalf(MATA.bridgeY) + 54;
  for (let px = cx - half; px <= cx + half + 1; px += half / 2) { rect(px - 4, y - 34, 8, 38, '#5a4028', 2); rect(px - 5, y - 37, 10, 5, '#b2986c', 1); }
  rect(cx - half, y - 30, half * 2, 6, '#7a5a38', 2); rect(cx - half, y - 16, half * 2, 5, '#6a4c30', 2);
}
function drawMataStones() {
  const y = MATA.stonesY, cx = mataRiverX(y), half = mataRiverHalf(y);
  for (let k = -2; k <= 2; k++) { const x = cx + k * (half * .52), w = 22 + (k + 3) % 3 * 4; ellipse(x + 2, y + 6, w, 9, 'rgba(10,20,20,.35)'); ellipse(x, y, w, 12, '#8a8a80'); ellipse(x - 4, y - 3, w * .55, 5, '#aaa89c'); }
}
function drawMataLog(l) {
  ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.a);
  ellipse(0, 10, l.w / 2 + 6, 10, 'rgba(10,14,8,.35)'); rect(-l.w / 2, -18, l.w, 30, '#5a3a22', 12, '#2e1e10');
  for (let k = 0; k < 5; k++) rect(-l.w / 2 + 16 + k * (l.w - 40) / 4, -14, 3, 22, '#3e2814', 1);
  ellipse(l.w / 2, -3, 9, 15, '#b08a5a'); ellipse(l.w / 2, -3, 5, 9, '#8a6a42'); ellipse(-l.w / 2 + 30, -18, 16, 5, '#5a7a3a');
  ctx.restore();
}
// Placas da trilha: tabuleta de tábua entalhada, com veio, pregos, letra queimada e um tufo de musgo; se o texto aponta
// (← ou →), a tábua vira seta. A da entrada da mata é um pórtico, com duas araucárias entalhadas nas pontas.
function mataBoard(x, top, w, h, point = 0) {
  const l = x - w / 2, r = x + w / 2, tip = 22, path = new Path2D();
  path.moveTo(l + (point < 0 ? tip : 6), top); path.lineTo(r - (point > 0 ? tip : 6), top);
  if (point > 0) { path.lineTo(r + 4, top + h / 2); path.lineTo(r - tip, top + h); } else { path.quadraticCurveTo(r, top, r, top + 8); path.lineTo(r, top + h - 8); path.quadraticCurveTo(r, top + h, r - 6, top + h); }
  path.lineTo(l + (point < 0 ? tip : 6), top + h);
  if (point < 0) { path.lineTo(l - 4, top + h / 2); path.lineTo(l + tip, top); } else { path.quadraticCurveTo(l, top + h, l, top + h - 8); path.lineTo(l, top + 8); path.quadraticCurveTo(l, top, l + 6, top); }
  path.closePath();
  ctx.save(); ctx.translate(3, 5); ctx.fillStyle = 'rgba(20,12,6,.35)'; ctx.fill(path); ctx.restore();
  const g = ctx.createLinearGradient(0, top, 0, top + h); g.addColorStop(0, '#9a6e40'); g.addColorStop(.48, '#7e5530'); g.addColorStop(.52, '#6e4826'); g.addColorStop(1, '#5e3c20');
  ctx.fillStyle = g; ctx.fill(path);
  ctx.save(); ctx.clip(path); ctx.strokeStyle = 'rgba(40,22,10,.35)'; ctx.lineWidth = 1;
  for (let k = 0; k < 7; k++) { const yy = top + 5 + k * (h - 10) / 6; ctx.beginPath(); ctx.moveTo(l, yy); for (let xx = l; xx <= r; xx += 12) ctx.lineTo(xx, yy + Math.sin(xx / 17 + k * 1.7) * 1.6); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(30,16,6,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(l, top + h / 2); ctx.lineTo(r, top + h / 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,230,180,.18)'; ctx.fillRect(l, top, w, 3);
  ctx.restore();
  ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 2; ctx.stroke(path);
  for (const [px, py] of [[l + 12, top + 9], [r - 12, top + 9], [l + 12, top + h - 9], [r - 12, top + h - 9]]) { if (point > 0 && px > x || point < 0 && px < x) continue; ellipse(px, py, 2.4, 2.4, '#2a1a0c'); ellipse(px - .6, py - .6, 1, 1, '#b8a080'); }
  for (let k = 0; k < 4; k++) ellipse(l + 18 + k * 9 + (k % 2) * 4, top + 1, 7 - k, 3.5, k % 2 ? '#5a7a34' : '#4a6a2a');
}
function mataBoardText(text, x, y, size) {
  ctx.save(); ctx.font = `bold ${size}px Georgia`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,225,170,.35)'; ctx.fillText(text, x, y + 1.2);
  ctx.fillStyle = '#2a170a'; ctx.fillText(text, x, y); ctx.restore();
}
function mataPost(x, top, bottom) {
  ellipse(x, bottom + 2, 13, 4, '#1c140c55');
  const g = ctx.createLinearGradient(x - 7, 0, x + 7, 0); g.addColorStop(0, '#6e4a28'); g.addColorStop(.5, '#5a3a20'); g.addColorStop(1, '#3e2814');
  ctx.fillStyle = g; ctx.fillRect(x - 7, top, 14, bottom - top); ctx.strokeStyle = '#2a1a0c'; ctx.lineWidth = 1.5; ctx.strokeRect(x - 7, top, 14, bottom - top);
  for (let k = 0; k < 3; k++) { ctx.strokeStyle = 'rgba(30,16,6,.5)'; ctx.beginPath(); ctx.moveTo(x - 7, top + 14 + k * 22); ctx.lineTo(x + 7, top + 18 + k * 22); ctx.stroke(); }
  ellipse(x, top, 7, 3, '#8a6440');
}
function mataPlaca(x, y, text, w = 210) {
  const point = text.startsWith('←') ? -1 : text.endsWith('→') ? 1 : 0, label = text.replace(/^←\s*|\s*→$/g, '');
  ctx.save(); ctx.font = 'bold 14px Georgia'; const tw = Math.max(w - 40, ctx.measureText(label).width + 44 + (point ? 18 : 0)); ctx.restore();
  mataPost(x - (point > 0 ? tw * .28 : point < 0 ? -tw * .28 : 0), y - 112, y);
  mataBoard(x, y - 116, tw, 38, point);
  mataBoardText(label, x + point * 6, y - 97, 14);
}
// O pórtico da mata: duas toras, a tábua pendurada na travessa e as araucárias entalhadas.
function mataPortico(x, y, text) {
  ctx.save(); ctx.font = 'bold 17px Georgia'; const tw = ctx.measureText(text).width + 120; ctx.restore();
  const l = x - tw / 2 - 16, r = x + tw / 2 + 16, top = y - 170;
  mataPost(l, top, y); mataPost(r, top, y);
  rect(l - 18, top - 10, r - l + 36, 14, '#5e3c20', 5, '#2a1a0c'); rect(l - 18, top - 10, r - l + 36, 4, '#8a6440', 3);
  ctx.strokeStyle = '#c8a870'; ctx.lineWidth = 2; for (const px of [x - tw * .32, x + tw * .32]) { ctx.beginPath(); ctx.moveTo(px, top + 4); ctx.lineTo(px, top + 22); ctx.stroke(); }
  mataBoard(x, top + 20, tw, 50, 0);
  mataBoardText(text, x, top + 46, 17);
  // Araucárias entalhadas nas pontas da tábua.
  for (const sx of [-1, 1]) { const ax = x + sx * (tw / 2 - 26), ay = top + 64; ctx.strokeStyle = '#2a170a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay - 30); ctx.stroke(); for (let k = 0; k < 3; k++) { const yy = ay - 30 + k * 8, ww = 9 - k * 2; ctx.beginPath(); ctx.moveTo(ax - ww, yy - 2); ctx.quadraticCurveTo(ax, yy + 3, ax + ww, yy - 2); ctx.stroke(); } }
  for (let k = 0; k < 5; k++) ellipse(l - 10 + k * 7, top - 10, 6, 3, k % 2 ? '#5a7a34' : '#4a6a2a');
  for (let k = 0; k < 4; k++) ellipse(r + 10 - k * 7, top - 10, 6, 3, k % 2 ? '#4a6a2a' : '#5a7a34');
}
function drawMata(view, seen, layers) {
  drawMataTerrain(view); drawMataWater(view); drawMataBridge(); drawMataStones();
  const F = mataPlants();
  for (const t of F.trees) if (seen(t.x, t.y, t.w)) layers.push({ y: t.y, draw: () => { if (t.big) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(t.x, t.y - t.h * .5, 260, .12, '255,240,180'); ctx.restore(); } worldTreeSprite(t.kind, t.x, t.y, t.w, t.h); } });
  for (const b of F.brush) if (seen(b.x, b.y, 80)) layers.push({ y: b.y, draw: () => worldSprite('frontier-flora', b.index, b.x - b.w / 2, b.y - b.h, b.w, b.h) });
  for (const r of F.reeds) if (seen(r.x, r.y, 80)) layers.push({ y: r.y, draw: () => worldSprite('frontier-flora', r.index, r.x - r.w / 2, r.y - r.h, r.w, r.h) });
  for (const r of F.rocks) if (seen(r.x, r.y, 120)) layers.push({ y: r.y, draw: () => worldSprite('frontier-flora', 3, r.x - r.w / 2, r.y - r.w * .62, r.w, r.w * .7) });
  for (const l of F.logs) if (seen(l.x, l.y, 200)) layers.push({ y: l.y + 8, draw: () => drawMataLog(l) });
  layers.push({ y: MATA.bridgeY - 42, draw: () => drawMataRail(-42) }, { y: MATA.bridgeY + 44, draw: () => drawMataRail(44) });
  layers.push({ y: MATA.sign.y, draw: () => mataPortico(MATA.sign.x, MATA.sign.y, 'MATA DE ARAUCÁRIAS') });
  layers.push({ y: MATA.entryY + 120, draw: () => mataPlaca(150, MATA.entryY + 120, '← SERRA GAÚCHA', 190) });
  layers.push({ y: 690, draw: () => mataPlaca(3440, 690, 'MATA ADENTRO →', 200) });
}

// ---------- O mapa ----------
WORLD_MAPS.mata = {
  id: 'mata', name: 'Mata de Araucárias', W: MATA.W, H: MATA.H,
  spawn() { return { x: 90, y: MATA.entryY }; },
  canWalk(x, y) {
    if (x < -30 || y < 70 || x > this.W - 30 || y > this.H - 24) return false;
    if (x < 40 && Math.abs(y - MATA.entryY) > 50) return false;   // pela esquerda, só a picada volta pra Serra
    if (Math.abs(x - mataRiverX(y)) < mataRiverHalf(y) + 6 && !mataOnBridge(x, y) && !mataOnStones(x, y)) return false;
    return !mataSolid(x, y);
  },
  edge(p) { if (p.x < 10) return { map: 'serra', x: SERRA.W - 70, y: SERRA.roadY + SERRA.roadH / 2, title: 'Serra Gaúcha', text: 'De volta à estrada da Serra.' }; return null; },
  spots() {
    const bx = mataRiverX(MATA.bridgeY);
    return [
      { id: 'mata:placa', x: MATA.sign.x, y: MATA.sign.y + 30, label: 'Placa da Mata de Araucárias', info: true, text: 'Mata de Araucárias: a floresta do pinheiro-brasileiro, que cobria boa parte do planalto do Sul. Hoje sobram poucos pedaços dela; a araucária é árvore ameaçada e protegida por lei.' },
      { id: 'mata:centenaria', x: MATA.big.x - 60, y: MATA.big.y + 70, label: 'Araucária centenária', info: true, text: 'Araucária centenária: o pinheiro-brasileiro passa dos 40 metros e vive centenas de anos. No outono a pinha cai e solta o pinhão; a gralha-azul enterra a semente e, sem querer, planta pinheiro novo.' },
      { id: 'mata:arroio', x: bx, y: MATA.bridgeY + 20, label: 'Arroio do Pinhal', info: true, text: 'Arroio do Pinhal: água fria e limpa descendo da serra, no meio do pinheiral. Mais pra baixo, perto do remanso, a margem vira uma prainha de cascalho.' }
    ];
  },
  draw(view, seen, layers) { drawMata(view, seen, layers); },
  onEnter() { mataLesteAviso = 0; }
};
REGION_NAMES.mata = 'Mata de Araucárias';
// A picada do leste leva mata adentro (mata-trechos.js).
let mataLesteAviso = 0;

// ---------- A entrada pela Serra ----------
{
  // A estrada da Serra vai até a borda direita e vira a picada da mata.
  SERRA.roadEnd = SERRA.W;
  const serra = WORLD_MAPS.serra, edge = serra.edge, draw = serra.draw;
  serra.edge = function (p) {
    if (p.x > this.W - 12 && p.y > SERRA.roadY - 70 && p.y < SERRA.roadY + SERRA.roadH + 70) return { map: 'mata', x: 90, y: MATA.entryY, title: 'Mata de Araucárias', text: 'Pinheiral fechado, grimpa no chão e um arroio no meio do mato.' };
    return edge.call(this, p);
  };
  serra.draw = function (view, seen, layers) { draw.call(this, view, seen, layers); const x = SERRA.W - 150, y = SERRA.roadY - 30; if (seen(x, y, 300)) layers.push({ y, draw: () => mataPlaca(x, y, 'MATA DE ARAUCÁRIAS →', 230) }); };
}
