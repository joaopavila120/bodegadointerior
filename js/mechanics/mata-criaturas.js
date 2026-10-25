// Mais bichos da mata.
//   · Papagaios-charão (mansos): de vez em quando um bando passa voando por cima do pinheiral, na gritaria, e pousa na
//     copa de uma araucária. Passou embaixo, o bando levanta voo de novo. Só no pinheiral (trecho 1 e do 2 ao 7).
//   · Jararaca: camuflada no chão, na beira do arroio. Chegou perto, ela marca o bote (alvo vermelho no chão) e ataca.
//   · Queixadas: bando de cinco porcos-do-mato que corre junto. Eles miram (a faixa vermelha avisa) e passam em
//     disparada: tem que sair do caminho.
//   Quem aparece em cada trecho, e quando, fica em mata-trechos.js.
'use strict';

CAVE_BEASTS.queixada = { name: 'Queixada', hp: 18, speed: 150, dmg: 9, r: 26, cash: [1, 3], from: 999, weight: 0 };
CAVE_BEASTS.jararaca = { name: 'Jararaca', hp: 14, speed: 0, dmg: 12, r: 20, cash: [2, 4], from: 999, weight: 0 };
const MATA_BICHOS = { queixadas: 5, bote: 135, boteR: 52, estouro: 380 };

// =================== Papagaios-charão ===================
let mataParrots = null;
function mataParrotTop(t) { return t.y - t.w * (330 / 271) * .95; }   // o alto da copa da araucária
function mataParrotTree(p) {
  const list = mataPlants().trees.filter(t => t.kind === 1 && !t.big && Math.hypot(t.x - p.x, t.y - p.y) > 240 && Math.hypot(t.x - p.x, t.y - p.y) < 620);
  return list.length ? pick(list) : null;
}
function mataParrotSpawn(p) {
  const tree = mataParrotTree(p); if (!tree) return null;
  const top = mataParrotTop(tree), side = Math.random() < .5 ? -1 : 1, sx = p.x + side * 950, sy = top - 220;
  const birds = Array.from({ length: 7 }, (_, k) => ({ x: sx + (Math.random() - .5) * 140, y: sy + (Math.random() - .5) * 70, k, dx: -side, spot: { x: tree.x + (k - 3) * tree.w * .085, y: top + 4 + Math.abs(k - 3) * 6 }, hop: 0 }));
  return { tree, birds, state: 'arrive', t: 0, stay: 9 + Math.random() * 6, chat: 0, exit: { x: p.x - side * 1700, y: top - 520 } };
}
function mataSquawk(f, loud = 1) {
  const c = f.birds[0], d = c ? Math.hypot(c.x - worldOut.x, c.y - worldOut.y) : 0, vol = .022 * loud * clamp(1 - d / 1400, .2, 1);
  const n = 1 + Math.floor(Math.random() * 3);
  for (let k = 0; k < n; k++) { const fr = 1250 + Math.random() * 750; AudioEngine.note?.(fr, .06, 'square', vol, k * .09); AudioEngine.note?.(fr * .78, .05, 'sawtooth', vol * .7, k * .09 + .04); }
}
function mataParrotTick(dt) {
  if (!(worldOut?.map === 'mata' || inTrecho() && trechoLayout().biome === 'mata') || worldNight()) { if (mataParrots) mataParrots.flock = null; return; }
  mataParrots ??= { next: 5, flock: null };
  if (paused || modal || scene || worldTalkOpen()) return;
  const P = mataParrots, p = worldOut;
  if (!P.flock) { P.next -= dt; if (P.next <= 0) { P.flock = mataParrotSpawn(p); P.next = 4; } return; }
  const f = P.flock; f.t += dt; f.chat -= dt;
  if (f.state === 'arrive') {
    let all = true;
    for (const b of f.birds) { const dd = Math.hypot(b.spot.x - b.x, b.spot.y - b.y), sp = (240 + b.k * 12) * dt; if (dd > 4) { all = false; const k = Math.min(dd, sp); b.x += (b.spot.x - b.x) / dd * k; b.y += (b.spot.y - b.y) / dd * k; b.dx = b.spot.x < b.x ? -1 : 1; } }
    if (f.chat <= 0) { f.chat = .25 + Math.random() * .2; mataSquawk(f); }
    if (all || f.t > 8) { f.state = 'perch'; f.t = 0; for (const b of f.birds) { b.x = b.spot.x; b.y = b.spot.y; } }
  } else if (f.state === 'perch') {
    for (const b of f.birds) { b.hop = Math.max(0, b.hop - dt); if (Math.random() < dt * .3) { b.hop = .3; b.dx = -b.dx; } }
    if (f.chat <= 0) { f.chat = 1 + Math.random() * 1.6; mataSquawk(f, .8); }
    // Passou embaixo da araucária: o bando levanta na gritaria.
    const under = Math.hypot(p.x - f.tree.x, p.y - f.tree.y) < 170;
    if (under || f.t > f.stay) { f.state = 'leave'; f.t = 0; f.chat = 0; if (under) { mataSquawk(f, 1.6); mataSquawk(f, 1.4); } }
  } else if (f.state === 'leave') {
    for (const b of f.birds) { const tx = f.exit.x + (b.k - 3) * 40, ty = f.exit.y + (b.k % 3) * 30, dd = Math.hypot(tx - b.x, ty - b.y), k = Math.min(dd, (300 + b.k * 14) * dt); if (dd > 1) { b.x += (tx - b.x) / dd * k; b.y += (ty - b.y) / dd * k; b.dx = tx < b.x ? -1 : 1; } }
    if (f.chat <= 0) { f.chat = .3 + Math.random() * .2; mataSquawk(f, .9); }
    if (f.t > 7) { P.flock = null; P.next = 22 + Math.random() * 20; }
  }
}
// Charão: verde, testa vermelha, ombro vermelho e a ponta da asa azul.
function drawCharao(x, y, dx, fly, phase = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale((dx < 0 ? -1 : 1) * 1.3, 1.3);
  if (!fly) { ctx.strokeStyle = '#4a4a3a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-2, -5); ctx.lineTo(-3, 0); ctx.moveTo(3, -5); ctx.lineTo(3, 0); ctx.stroke(); }
  const flap = fly ? Math.sin(frameClock * 22 + phase) : 0;
  ctx.fillStyle = '#2a7a34'; ctx.beginPath(); ctx.moveTo(-8, -11); ctx.lineTo(-19, -5); ctx.lineTo(-16, -2); ctx.lineTo(-7, -8); ctx.closePath(); ctx.fill();
  ellipse(0, -12, 10, 7, '#3aa046'); ellipse(1, -9, 7, 4, '#5ab85a');
  if (fly) { ctx.fillStyle = '#2a8a3a'; ctx.beginPath(); ctx.moveTo(-3, -14); ctx.lineTo(-12, -14 - 15 * flap); ctx.lineTo(5, -14 - 9 * flap); ctx.closePath(); ctx.fill(); ellipse(-10, -14 - 13 * flap, 3, 2, '#2a5ab8'); }
  else { ellipse(-3, -12, 7, 5, '#2a8a3a'); ellipse(-8, -11, 3, 2.5, '#2a5ab8'); }
  ellipse(1, -14, 2.5, 2, '#d82a2a');
  ellipse(8, -16, 6, 6, '#3aa046'); ellipse(11, -20, 4, 2.6, '#d82a2a');
  ctx.fillStyle = '#e8dcb8'; ctx.beginPath(); ctx.moveTo(13, -17); ctx.quadraticCurveTo(18, -16, 16, -12); ctx.lineTo(13, -14); ctx.closePath(); ctx.fill();
  ellipse(10, -17, 1.6, 1.6, '#f4f0e0'); ellipse(10.3, -17, .8, .8, '#141410');
  ctx.restore();
}
function drawMataParrots() {
  const f = mataParrots?.flock; if (!f) return;
  for (const b of f.birds) { const fly = f.state !== 'perch', bob = fly ? Math.sin(frameClock * 5 + b.k) * 5 : -Math.sin(Math.min(1, b.hop / .3) * Math.PI) * 6; drawCharao(b.x, b.y + bob, b.dx, fly, b.k); }
}

// =================== Jararacas e queixadas ===================
function mataJararacaTick(b, dt, p) {
  const B = CAVE_BEASTS[b.kind] || CAVE_BEASTS.jararaca; b.cool = Math.max(0, b.cool - dt); b.hurt = Math.max(0, b.hurt - dt); b.attack = Math.max(0, b.attack - dt); b.t -= dt; b.frame += dt * 3;
  const d = Math.hypot(p.x - b.x, p.y - b.y);
  if (b.state === 'hide') { if (d < MATA_BICHOS.bote && b.cool <= 0) { b.state = 'warn'; b.t = .75; b.tx = p.x; b.ty = p.y; b.dx = p.x < b.x ? -1 : 1; AudioEngine.hiss?.(.6, .05, 3200); } }
  else if (b.state === 'warn') { if (b.t <= 0) { b.state = 'strike'; b.t = .18; AudioEngine.swoosh?.(.05); } }
  else if (b.state === 'strike') { if (b.t <= 0) { if (Math.hypot(p.x - b.tx, p.y - b.ty) < MATA_BICHOS.boteR) { mataHurt(B.dmg, b); b.attack = .3; } b.state = 'rest'; b.t = 1.1; b.cool = 2.2; } }
  else if (b.state === 'rest') { if (b.t <= 0) b.state = 'hide'; }
}
// O bando: mira junto, passa em disparada numa linha reta, se espalha, dá a volta e mira de novo.
function mataQueixadaTick(N, dt, p) {
  for (const h of N.herds) {
    const m = N.beasts.filter(b => b.herd === h.id && b.hp > 0); if (!m.length) continue;
    const cx = m.reduce((n, b) => n + b.x, 0) / m.length, cy = m.reduce((n, b) => n + b.y, 0) / m.length, dxp = p.x - cx, dyp = p.y - cy, d = Math.hypot(dxp, dyp) || 1, B = CAVE_BEASTS.queixada;
    h.t -= dt; h.cool = Math.max(0, h.cool - dt);
    for (const b of m) { b.hurt = Math.max(0, b.hurt - dt); b.attack = Math.max(0, b.attack - dt); b.frame += dt * 8; }
    if (h.state === 'roam') {
      if (d < MATA_BICHOS.estouro && h.cool <= 0) { h.state = 'gather'; h.t = .75; h.vx = dxp / d; h.vy = dyp / d; h.cx = cx; h.cy = cy; for (const b of m) { b.state = 'windup'; b.dx = h.vx < 0 ? -1 : 1; } AudioEngine.caveSnort?.(); continue; }
      if (Math.hypot(h.tx - cx, h.ty - cy) < 40 || h.t <= 0) { const n = mataSpotNear(Math.random, { x: cx, y: cy }, 120) || { x: cx, y: cy }; if (Math.hypot(n.x - cx, n.y - cy) < 500) { h.tx = n.x; h.ty = n.y; } h.t = 4; }
      for (const b of m) { b.state = 'roam'; mataGo(b, { x: h.tx + b.ox, y: h.ty + b.oy }, 55, dt); }
    } else if (h.state === 'gather') {
      for (const b of m) b.dx = h.vx < 0 ? -1 : 1;
      if (h.t <= 0) { h.state = 'stampede'; h.t = 1.25; for (const b of m) b.state = 'lunge'; AudioEngine.caveCry?.('javali'); for (let k = 0; k < 4; k++) setTimeout(() => AudioEngine.thud?.(), k * 120); }
    } else if (h.state === 'stampede') {
      for (const b of m) {
        if (!mataStep(b, h.vx * 360, h.vy * 360, dt)) mataStep(b, -h.vy * 160 * (b.ox >= 0 ? 1 : -1), h.vx * 160 * (b.ox >= 0 ? 1 : -1), dt);
        if (Math.hypot(p.x - b.x, p.y - b.y) < B.r + 26) { mataHurt(B.dmg, b); b.attack = .3; }
      }
      if (h.t <= 0) { h.state = 'regroup'; h.t = 1.4; for (const b of m) b.state = 'rest'; }
    } else if (h.state === 'regroup') {
      for (const b of m) mataGo(b, { x: cx + b.ox, y: cy + b.oy }, 80, dt);
      if (h.t <= 0) { h.state = 'roam'; h.cool = 1.2; h.tx = cx; h.ty = cy; h.t = 0; }
    }
  }
}
// Queixada: o desenho do javali, menor e mais escuro (pintado uma vez por quadro, sem filtro a cada frame).
const queixadaTint = new Map();
function queixadaFrame(index, height, ref) {
  const f = expansionFrame('cave-beasts-a-v1', index, height, ref); if (!f) return null;
  const k = index + ':' + f.w + ':' + f.h; let c = queixadaTint.get(k);
  if (!c) { c = document.createElement('canvas'); c.width = f.image.width; c.height = f.image.height; const g = c.getContext('2d'); g.drawImage(f.image, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#6a5a54'; g.fillRect(0, 0, c.width, c.height); g.globalCompositeOperation = 'destination-in'; g.drawImage(f.image, 0, 0); queixadaTint.set(k, c); }
  return { ...f, image: c };
}
function drawQueixada(b) {
  const attack = b.attack > 0 || b.state === 'lunge', step = attack ? 3 : b.state === 'rest' || b.state === 'windup' ? 1 : Math.floor(b.frame) % 3, f = queixadaFrame(step, 60, expansionRowHeight('cave-beasts-a-v1', 0, 4));
  ellipse(b.x, b.y, 22, 7, '#0007');
  if (f) { ctx.save(); ctx.translate(b.x, b.y); if (b.dx < 0) ctx.scale(-1, 1); ctx.drawImage(f.image, -f.ax, -f.h, f.w, f.h); if (b.hurt > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .6; ctx.drawImage(f.image, -f.ax, -f.h, f.w, f.h); } ctx.restore(); }
  else drawJavali(b.x, b.y, b.dx, Math.floor(b.frame) % 2, .9);
  if (b.hp < b.max) { txt('Queixada', b.x, b.y - 80, 11, '#ffe2a6'); bar(b.x - 20, b.y - 74, 40, b.hp / b.max, '#df674c'); }
}
// Jararaca: enrolada no chão, pardo com as manchas escuras; armando o bote, levanta a cabeça; no bote, estica até o alvo.
// A cascavel usa o mesmo desenho, mais clara e com o chocalho na ponta do rabo.
function drawJararaca(b, cascavel = false) {
  const p = worldOut, d = Math.hypot(p.x - b.x, p.y - b.y), hidden = b.state === 'hide' && d > 150, S = 1.8, body = cascavel ? '#c8b070' : '#a89060', spots = cascavel ? '#5a4420' : '#3a2412';
  // Cabeça: enrolada, armando (levantada, tremendo) ou esticada no bote até o alvo (em coordenadas da cobra).
  let hx = b.dx * 12, hy = -24;
  if (b.state === 'warn') hy -= 10 + Math.sin(frameClock * 30) * 2;
  if (b.state === 'strike' || b.state === 'rest' && b.t > .85) { const k = b.state === 'strike' ? 1 - Math.max(0, b.t) / .18 : 1; hx += ((b.tx - b.x) / S - hx) * k * .92; hy += ((b.ty - 8 - b.y) / S - hy) * k * .92; }
  ctx.save(); ctx.translate(b.x, b.y); ctx.scale(S, S); ctx.globalAlpha = hidden ? .32 : 1;
  ellipse(0, 2, 26, 8, 'rgba(10,14,8,.4)');
  const ring = (path, w) => { ctx.strokeStyle = '#2a1a0c'; ctx.lineWidth = w + 2.5; path(); ctx.stroke(); ctx.strokeStyle = body; ctx.lineWidth = w; path(); ctx.stroke(); ctx.strokeStyle = spots; ctx.lineWidth = w - 3; ctx.setLineDash([4, 6]); path(); ctx.stroke(); ctx.setLineDash([]); };
  for (let k = 0; k < 3; k++) { const r = 22 - k * 6; ring(() => { ctx.beginPath(); ctx.ellipse(0, -4 - k * 5, r, r * .42, 0, 0, Math.PI * 2); }, 8); }
  ring(() => { ctx.beginPath(); ctx.moveTo(0, -16); ctx.quadraticCurveTo(hx / 2, Math.min(0, hy) - 18, hx, hy); }, 7);
  if (cascavel) { const shake = b.state === 'hide' && d < 260 ? Math.sin(frameClock * 60) * 2 : 0; for (let k = 0; k < 4; k++) ellipse(-20 - k * 5 + shake, -2 - k * 4, 4, 3, k % 2 ? '#e8d8a8' : '#b8a070'); }
  const s = hx < 0 ? -1 : 1; ctx.fillStyle = '#2a1a0c'; ctx.beginPath(); ctx.moveTo(hx - s * 7, hy - 6); ctx.lineTo(hx + s * 12, hy); ctx.lineTo(hx - s * 7, hy + 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8a7448'; ctx.beginPath(); ctx.moveTo(hx - s * 5, hy - 4.5); ctx.lineTo(hx + s * 10, hy); ctx.lineTo(hx - s * 5, hy + 4.5); ctx.closePath(); ctx.fill();
  ellipse(hx + s * 2, hy - 2, 1.6, 1.6, '#f0c840');
  if (b.state === 'warn' || b.state === 'strike') { ctx.strokeStyle = '#d83a2a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(hx + s * 12, hy); ctx.lineTo(hx + s * 18, hy - 2); ctx.moveTo(hx + s * 12, hy); ctx.lineTo(hx + s * 18, hy + 2); ctx.stroke(); }
  ctx.restore();
  if (b.hp < b.max) { txt(cascavel ? 'Cascavel' : 'Jararaca', b.x, b.y - 80, 11, '#ffe2a6'); bar(b.x - 18, b.y - 74, 36, b.hp / b.max, '#df674c'); }
}
// Por cima do escuro: o alvo do bote e a faixa do estouro das queixadas.
function drawMataWarnings() {
  const N = mataNight; if (!N || !mataCombatOn() || scene) return;
  for (const b of N.beasts) if (b.hp > 0 && (b.kind === 'jararaca' || b.kind === 'cascavel') && b.state === 'warn') { const k = .5 + .5 * Math.sin(frameClock * 18); ellipse(b.tx, b.ty, 46, 18, `rgba(230,50,36,${.2 + .15 * k})`); ctx.strokeStyle = `rgba(255,70,40,${.7 + .3 * k})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(b.tx, b.ty, 46, 18, 0, 0, Math.PI * 2); ctx.stroke(); }
  for (const h of N.herds || []) if (h.state === 'gather') {
    const k = 1 - Math.max(0, h.t) / .75; ctx.save(); ctx.translate(h.cx, h.cy - 10); ctx.rotate(Math.atan2(h.vy, h.vx));
    ctx.fillStyle = `rgba(255,60,30,${.1 + .18 * k})`; ctx.fillRect(0, -70, 640, 140); ctx.strokeStyle = `rgba(255,90,50,${.5 + .4 * k})`; ctx.lineWidth = 2; ctx.strokeRect(0, -70, 640, 140); ctx.restore();
  }
}

// =================== Ligações ===================
{
  const beast = mataBeastTick; mataBeastTick = function (b, dt, p) {
    if (b.kind === 'queixada') return;   // o bando anda junto (mataQueixadaTick)
    if (b.kind === 'jararaca') { mataJararacaTick(b, dt, p); return; }
    return beast(b, dt, p);
  };
  const combat = mataCombatTick; mataCombatTick = function (dt) {
    combat(dt); const N = mataNight;
    if (!N || !mataCombatOn() || N.faint || paused || modal || scene || phoneOpen || worldTalkOpen()) return;
    mataQueixadaTick(N, dt, worldOut);
  };
  const draw = drawCaveBeast; drawCaveBeast = function (b) { if (b.kind === 'queixada') { drawQueixada(b); return; } if (b.kind === 'jararaca') { drawJararaca(b); return; } draw(b); };
  const cry = AudioEngine.caveCry; AudioEngine.caveCry = function (kind, dead = false) { if (kind === 'jararaca') { this.hiss?.(dead ? .5 : .2, .05, 3000); return; } return cry.call(this, kind === 'queixada' ? 'javali' : kind, dead); };
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); mataParrotTick(dt); };
  const M = WORLD_MAPS.mata, mdraw = M.draw;
  M.draw = function (view, seen, layers) { mdraw.call(this, view, seen, layers); if (!worldNight()) layers.push({ y: 9e6, draw: () => { drawMataParrots(); } }); };
}
