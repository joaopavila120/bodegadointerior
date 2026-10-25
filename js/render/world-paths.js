// Caminhos e beira d'água do mundo aberto (Fronteira, Serra e Santa Catarina).
//   · Estradas e trilhas até as portas viram fitas de terra: pontas arredondadas, curvas suaves nos cantos, largura que
//     varia um pouco e a beira se desfazendo na grama (terra lisa, sem linhas por cima).
//   · As rotas até as portas são as mesmas de antes (desviando das casas); só o desenho mudou. Os retângulos continuam
//     valendo pra deixar a decoração fora do caminho.
//   · Flores miúdas no campo e as linhas de beira do rio (usadas pelo rio Uruguai, em frontier-environment.js).
'use strict';

// ---------- Rotas até as portas ----------
const worldDoorRouteCache = new Map();
worldDoorPaths = function (M) {
  if (worldDoorPathCache.has(M.id)) return worldDoorPathCache.get(M.id);
  const roads = worldMainRoads(M.id), paths = [], routes = [], solid = typeof M.obstacles === 'function' ? M.obstacles() : M.obstacles || [];
  const segment = (a, b) => [Math.min(a.x, b.x) - 22, Math.min(a.y, b.y) - 22, Math.abs(a.x - b.x) + 44, Math.abs(a.y - b.y) + 44];
  for (const r of worldDressingBuildings(M.id)) {
    const door = front(r, 38), targets = roads.map(([x, y, w, h]) => w > h ? { x: clamp(door.x, x + 22, x + w - 22), y: y + h / 2 } : { x: x + w / 2, y: clamp(door.y, y + 22, y + h - 22) }).sort((a, b) => Math.hypot(a.x - door.x, a.y - door.y) - Math.hypot(b.x - door.x, b.y - door.y));
    for (const target of targets) {
      let found = false;
      const options = [[door, { x: door.x, y: target.y }, target], [door, { x: target.x, y: door.y }, target], ...[r.x - 50, r.x + r.w + 50].map(x => [door, { x, y: door.y }, { x, y: target.y }, target])];
      for (const points of options) {
        const route = points.slice(1).map((p, i) => segment(points[i], p));
        if (route.some(([x, y, w, h]) => solid.some(b => x < b.x + b.w + 10 && x + w > b.x - 10 && y < b.y + b.h + 10 && y + h > b.y - 10))) continue;
        if (points.slice(1).some((p, i) => { const a = points[i], steps = Math.max(1, Math.ceil(Math.hypot(p.x - a.x, p.y - a.y) / 20)); for (let j = 0; j <= steps; j++) if (!M.canWalk(a.x + (p.x - a.x) * j / steps, a.y + (p.y - a.y) * j / steps)) return true; return false; })) continue;
        paths.push([door.x - 22, r.y + r.h, 44, 38], ...route);
        routes.push([{ x: door.x, y: r.y + r.h - 6 }, ...points.filter((p, i, a) => i === 0 || Math.hypot(p.x - a[i - 1].x, p.y - a[i - 1].y) > 2)]);
        found = true; break;
      }
      if (found) break;
    }
  }
  worldDoorPathCache.set(M.id, paths); worldDoorRouteCache.set(M.id, routes); return paths;
};
function worldDoorRoutes(M) { worldDoorPaths(M); return worldDoorRouteCache.get(M.id) || []; }

// ---------- A rede de caminhos ----------
// Cantos em curva: cada quina vira um arco de até `rad` de raio.
function worldRoundRoute(pts, rad = 72) {
  const out = [[pts[0].x, pts[0].y]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1], b = pts[i], c = pts[i + 1], d1 = Math.hypot(b.x - a.x, b.y - a.y) || 1, d2 = Math.hypot(c.x - b.x, c.y - b.y) || 1, r = Math.min(rad, d1 / 2, d2 / 2);
    const p0 = { x: b.x + (a.x - b.x) / d1 * r, y: b.y + (a.y - b.y) / d1 * r }, p2 = { x: b.x + (c.x - b.x) / d2 * r, y: b.y + (c.y - b.y) / d2 * r };
    out.push([p0.x, p0.y]); for (let k = 1; k <= 10; k++) { const t = k / 10, u = 1 - t; out.push([u * u * p0.x + 2 * u * t * b.x + t * t * p2.x, u * u * p0.y + 2 * u * t * b.y + t * t * p2.y]); }
  }
  out.push([pts.at(-1).x, pts.at(-1).y]); return out;
}
// Pontos a cada `step`, com um leve vaivém de lado (some nas pontas, pra encostar certinho na porta e na estrada).
function worldWobble(pts, amp, seed, step = 16) {
  const dense = [];
  for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step)); for (let k = 0; k < n; k++) dense.push([ax + (bx - ax) * k / n, ay + (by - ay) * k / n]); }
  dense.push(pts.at(-1));
  let s = 0, total = 0; for (let i = 1; i < dense.length; i++) total += Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]);
  return dense.map((p, i) => {
    if (i) s += Math.hypot(p[0] - dense[i - 1][0], p[1] - dense[i - 1][1]);
    const a = dense[Math.max(0, i - 1)], b = dense[Math.min(dense.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, taper = Math.min(1, s / 120, (total - s) / 120);
    const off = (Math.sin(s / 95 + seed) * .7 + Math.sin(s / 41 + seed * 2.3) * .3) * amp * Math.max(0, taper);
    return [p[0] - dy / L * off, p[1] + dx / L * off];
  });
}
function worldRectLine(r) { const [x, y, w, h] = r; return w >= h ? { pts: [[x, y + h / 2], [x + w, y + h / 2]], w: h } : { pts: [[x + w / 2, y], [x + w / 2, y + h]], w }; }
const worldPathNets = new Map();
function worldPathNet(M) {
  if (worldPathNets.has(M.id)) return worldPathNets.get(M.id);
  const net = [];
  worldMainRoads(M.id).forEach((r, i) => { const l = worldRectLine(r); net.push({ kind: 'road', w: l.w - 6, pts: worldWobble(l.pts, 5, i * 1.7 + 1) }); });
  worldDoorRoutes(M).forEach((route, i) => net.push({ kind: 'trail', w: 38, pts: worldWobble(worldRoundRoute(route), 5, i * 2.9 + 3) }));
  if (M.id === 'vila') net.push({ kind: 'trail', w: 64, pts: worldWobble([[500, 917], [610, 917]], 3, 9) });   // a descida do trapiche
  for (const p of net) { const xs = p.pts.map(q => q[0]), ys = p.pts.map(q => q[1]); p.box = [Math.min(...xs) - p.w, Math.min(...ys) - p.w, Math.max(...xs) + p.w, Math.max(...ys) + p.w]; }
  worldPathNets.set(M.id, net); return net;
}

// ---------- Pintura (dentro dos blocos de chão já guardados) ----------
const worldPathMask = document.createElement('canvas'), worldPathMaskCtx = worldPathMask.getContext('2d');
function worldPathStroke(m, list, grow, jitter = true) {
  m.lineCap = 'round'; m.lineJoin = 'round'; m.strokeStyle = '#fff';
  for (const p of list) for (let i = 0; i < p.pts.length - 1; i++) {
    const n = frontierNoise(p.pts[i][0] | 0, p.pts[i][1] | 0); m.lineWidth = Math.max(4, p.w + grow * 2 + (jitter ? (n - .5) * (p.kind === 'road' ? 12 : 8) : 0));
    m.beginPath(); m.moveTo(p.pts[i][0], p.pts[i][1]); m.lineTo(p.pts[i + 1][0], p.pts[i + 1][1]); m.stroke();
  }
}
// Pinta a rede num pedaço do mundo: a terra batida com a beira esfumada.
// A beira das estradas: oito faixas de 3 em 3 px, com a opacidade somada subindo numa curva suave (com quatro faixas,
// cada degrau aparecia como uma linha reta ao longo da estrada).
const WORLD_PATH_FEATHER = (() => { const n = 8, out = []; let prev = 0; for (let i = 1; i <= n; i++) { const t = i / n, c = t * t * (3 - 2 * t); out.push([24 * (1 - t), i === n ? 1 : 1 - (1 - c) / (1 - prev)]); prev = c; } return out; })();
function paintWorldPaths(M, view, opts = {}) {
  const { x, y, w, h } = view, list = worldPathNet(M).filter(p => p.box[2] > x - 40 && p.box[0] < x + w + 40 && p.box[3] > y - 40 && p.box[1] < y + h + 40);
  if (!list.length) return;
  const W = Math.ceil(w), H = Math.ceil(h); if (worldPathMask.width < W) worldPathMask.width = W; if (worldPathMask.height < H) worldPathMask.height = H;
  const m = worldPathMaskCtx, fill = (paint, alpha) => {
    m.globalCompositeOperation = 'source-in'; const main = ctx; ctx = m; try { paint(); } finally { ctx = main; }
    ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(worldPathMask, 0, 0, W, H, x, y, W, H); ctx.restore();
  };
  const begin = () => { m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over'; m.globalAlpha = 1; m.clearRect(0, 0, worldPathMask.width, worldPathMask.height); m.setTransform(1, 0, 0, 1, -x, -y); };
  for (const [grow, alpha] of WORLD_PATH_FEATHER) { begin(); worldPathStroke(m, list, grow); fill(() => frontierTexture(1, x, y, w, h), alpha); }
  if (opts.paving) { begin(); worldPathStroke(m, list.filter(p => p.kind === 'road'), -6, false); fill(() => worldTexture(2, x, y, w, h, 70), .3); }
}

// ---------- Flores miúdas no campo ----------
const WORLD_FLOWERS = ['#f4efdc', '#f2d24a', '#c9a6e2', '#ec8a6a', '#f6f2e6'];
function paintWorldFlowers(view, canPlace, density = .9) {
  const { x, y, w, h } = view;
  for (let gy = Math.floor(y / 46) * 46; gy < y + h + 46; gy += 46) for (let gx = Math.floor(x / 52) * 52; gx < x + w + 52; gx += 52) {
    const n = frontierNoise(gx + 7919, gy + 104), cx = gx + frontierNoise(gy, gx + 3) * 44, cy = gy + frontierNoise(gx, gy + 11) * 38;
    if (n < density || !canPlace(cx, cy)) continue;
    const c = WORLD_FLOWERS[Math.floor(frontierNoise(gx + 1, gy + 1) * WORLD_FLOWERS.length)], k = 3 + Math.floor(n * 20) % 4;
    for (let j = 0; j < k; j++) { const a = j / k * 6.28 + n * 9, r = 3 + (j % 2) * 4, fx = cx + Math.cos(a) * r, fy = cy + Math.sin(a) * r * .7; ellipse(fx, fy + 3, 2.4, 1.2, 'rgba(40,70,30,.5)'); ellipse(fx, fy, 2.2, 2.2, c); ellipse(fx, fy, .9, .9, j % 2 ? '#e8b030' : '#fff6c8'); }
  }
}

// ---------- Beira do rio (linha aberta, sem as bordas do mapa) ----------
function frontierShorePoints(inset = 0) {
  const pts = [], bottom = VILA.border - 80;
  for (let y = 0; y <= bottom; y += 14) pts.push([frontierWestBank(y) + inset, y]);
  const a = [frontierWestBank(bottom) + inset, bottom], c = [460 + inset, VILA.border + 30 - inset], b = [650, frontierSouthBank(650) - inset];
  for (let k = 1; k < 12; k++) { const t = k / 12, u = 1 - t; pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); }
  for (let x = 650; x <= VILA.W + 30; x += 14) pts.push([x, frontierSouthBank(x) - inset]);
  return pts;
}
function frontierShorePath(inset = 0) { const p = new Path2D(), pts = frontierShorePoints(inset); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); return p; }

// ---------- Plantas das margens do rio Uruguai ----------
// Taboa na beira d'água (do nosso lado), mato e árvores na margem uruguaia e capim baixo na margem de baixo.
let frontierBankFlora = null;
function frontierBankPlants() {
  if (frontierBankFlora) return frontierBankFlora;
  const list = [];
  for (const q of frontierShorePoints(-12).filter((q, i) => i % 7 === 0)) {
    const n = frontierNoise(q[0] | 0, q[1] | 0); if (n < .35 || q[1] > 820 && q[1] < 1030 && q[0] < 600) continue;   // o trapiche fica livre
    list.push({ kind: 'reed', x: q[0] + (n - .5) * 16, y: q[1] + 6, w: 58 + n * 30, h: 54 + n * 24 });
  }
  for (let y = 40; y < VILA.H - 60; y += 96) {
    const n = frontierNoise(y, 431), x = FRONTIER_FAR(y) - 14 - n * 22;
    if (n > .7) list.push({ kind: 'tree', x: x - 10, y: y + 30, w: 210 + n * 60, h: 250 + n * 70, index: n > .85 ? 2 : 0 });
    else list.push({ kind: 'bush', x, y: y + 20, w: 92 + n * 40, h: 70 + n * 30, art: n > .45 ? 1 : 2 });
  }
  for (let x = 560; x < VILA.W; x += 110) {
    const n = frontierNoise(x, 977); if (n < .3) continue;
    list.push({ kind: 'bush', x: x + (n - .5) * 40, y: VILA.H - 18, w: 70 + n * 30, h: 46 + n * 18, art: n > .7 ? 1 : 0 });
  }
  return frontierBankFlora = list;
}
function drawFrontierBankPlant(p) {
  if (p.kind === 'tree') { worldTreeSprite(p.index, p.x, p.y, p.w, p.h); return; }
  if (typeof environmentSprite === 'function' && environmentSprite('environment-props-v3', p.kind === 'reed' ? 3 : p.art, p.x, p.y, p.w, p.h)) return;
  worldSprite('frontier-flora', p.kind === 'reed' ? 2 : 0, p.x - p.w / 2, p.y - p.h, p.w, p.h);
}
{
  const land = worldLandscape; worldLandscape = function (M, seen, layers, view) {
    land(M, seen, layers, view); if (M.id !== 'vila') return;
    for (const p of frontierBankPlants()) if (seen(p.x, p.y, p.h + 60)) layers.push({ y: p.y, draw: () => drawFrontierBankPlant(p) });
  };
}
