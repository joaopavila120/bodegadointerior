// Quero-queros no mundo aberto: quase todo dia tem algum ciscando nos campos (até três bandos, de um, um casal ou três),
// mais na Fronteira, um pouco menos na Serra e em Santa Catarina. Chegou perto, ele grita: uns levantam voo e pousam mais adiante,
// outros marcam um alvo no chão e dão o rasante, que empurra o Sadi. São menores que na laçada (escala do mapa), e o
// bodoque não sai da guaiaca aqui: ele é só da laçada dos bois.
'use strict';

const QQ_CHANCE = { vila: .92, serra: .75, sc: .6 }, QQ_SCALE = .8, QQ_ALERT = 210, QQ_HIT = 36;
const QQ_GROUPS = { vila: 3, serra: 2, sc: 2 };   // bandos por mapa no mesmo dia
const QQ_SALT = { vila: 11, serra: 29, sc: 47 };
let qqFlock = { key: '', birds: [] }, qqKnock = { t: 0, vx: 0, vy: 0 }, qqSlingNote = 0;

function qqMap(M = worldMap()) { return !!worldOut && !!QQ_CHANCE[M?.id] && !prologueActive() && !qqEventNight(M); }
// Nas noites dos cavalos da Estela e dos javalis, o campo da Fronteira é deles.
function qqEventNight(M) { const ev = M?.id === 'vila' && mapNight() ? mapEventToday() : null; return !!ev && ['cavalos', 'javali'].includes(ev.id) && !ev.st.done; }
// Distância até a estrada mais próxima (as linhas por onde o povo anda).
function qqRoadDist(M, x, y) {
  let best = Infinity;
  for (const line of M.walkLines || []) for (let i = 0; i < line.length - 1; i++) {
    const [ax, ay] = line[i], [bx, by] = line[i + 1], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1;
    const t = clamp(((x - ax) * dx + (y - ay) * dy) / L, 0, 1); best = Math.min(best, Math.hypot(x - ax - dx * t, y - ay - dy * t));
  }
  return best;
}
// Campo aberto em volta: nada de pousar colado em cerca, casa ou árvore. O que fica logo abaixo é desenhado na frente
// do bicho (cerca, moirão), por isso olha mais longe pra baixo.
function qqOpen(M, x, y) {
  if (!M.canWalk(x, y)) return false;
  for (let k = 0; k < 8; k++) if (!M.canWalk(x + Math.cos(k * Math.PI / 4) * 80, y + Math.sin(k * Math.PI / 4) * 55)) return false;
  return [[-45, 100], [0, 110], [45, 100], [0, 160]].every(([dx, dy]) => M.canWalk(x + dx, y + dy));
}
// Um pedaço de campo: dá pra pisar, longe da estrada, das casas e das lojas.
function qqSpot(M, R, near = null) {
  const places = M.spots?.() || [];
  for (let tries = 0; tries < 120; tries++) {
    const a = R() * Math.PI * 2, r = 260 + R() * 260;
    const x = near ? near.x + Math.cos(a) * r : 160 + R() * (M.W - 320), y = near ? near.y + Math.sin(a) * r * .6 : 320 + R() * (M.H - 480);
    if (x < 120 || x > M.W - 120 || y < 280 || y > M.H - 120 || !qqOpen(M, x, y)) continue;
    if (qqRoadDist(M, x, y) < 130 || places.some(s => Math.hypot(s.x - x, s.y - y) < 240)) continue;
    return { x, y };
  }
  return null;
}
function qqBird(x, y, R) { return { x, y, h: 0, state: 'ground', face: R() < .5 ? -1 : 1, flap: R(), hop: 1 + R() * 2, peck: 0, calm: 0, aggr: .3 + R() * .35 }; }
// Quem aparece hoje neste mapa: sorteado pelo dia, igual em toda visita.
function qqBirds(M = worldMap()) {
  if (!qqMap(M)) return [];
  const key = M.id + ':' + G.day; if (qqFlock.key === key) return qqFlock.birds;
  qqFlock = { key, birds: [] };
  const R = caveRand(G.day * 6151 + QQ_SALT[M.id]); if (R() >= QQ_CHANCE[M.id]) return qqFlock.birds;
  const homes = [];
  for (let g = 0; g < QQ_GROUPS[M.id]; g++) {
    if (g && R() >= .6) continue;
    let home = null; for (let k = 0; k < 6 && !home; k++) { const at = qqSpot(M, R); if (at && homes.every(h => Math.hypot(h.x - at.x, h.y - at.y) > 700)) home = at; }
    if (!home) continue; homes.push(home); qqFlock.birds.push(qqBird(home.x, home.y, R));
    // Casal (e às vezes um terceiro) ciscando junto.
    for (let k = 0; k < 2; k++) { if (R() >= (k ? .25 : .55)) break; const x = home.x + (k ? -60 - R() * 30 : 70 + R() * 40), y = home.y + (R() - .5) * 40; if (qqOpen(M, x, y)) qqFlock.birds.push(qqBird(x, y, R)); }
  }
  return qqFlock.birds;
}
// Levanta voo e pousa um pouco adiante.
function qqFlyOff(b, M) {
  const to = qqSpot(M, Math.random, b) || { x: b.x, y: b.y };
  Object.assign(b, { state: 'fly', tx: to.x, ty: to.y, calm: 6 + Math.random() * 5, hit: false }); b.face = to.x > b.x ? 1 : -1;
}
function qqTick(dt) {
  if (qqKnock.t > 0 && worldOut?.map === qqKnock.map) {
    qqKnock.t -= dt; const nx = worldOut.x + qqKnock.vx * dt, ny = worldOut.y + qqKnock.vy * dt;
    if (worldCanWalk(nx, worldOut.y)) worldOut.x = nx; if (worldCanWalk(worldOut.x, ny)) worldOut.y = ny;
  }
  qqSlingNote = Math.max(0, qqSlingNote - dt);
  const M = worldMap(); if (!qqMap(M) || paused || modal || scene || worldTalkOpen()) return;
  const p = worldOut;
  for (const b of qqBirds(M)) {
    b.flap += dt; const near = Math.hypot(p.x - b.x, p.y - b.y);
    if (b.state === 'ground') {
      b.calm = Math.max(0, b.calm - dt);
      if (near < QQ_ALERT && !b.calm) {
        AudioEngine.queroquero(.08, 3);
        if (Math.random() < b.aggr) { Object.assign(b, { state: 'warn', t: .8, tx: p.x, ty: p.y }); b.face = p.x > b.x ? 1 : -1; } else qqFlyOff(b, M);
        continue;
      }
      b.hop -= dt; if (b.hop <= 0) { b.hop = 1 + Math.random() * 2.4; b.face = Math.random() < .5 ? -1 : 1; b.peck = .5; }
      b.peck = Math.max(0, b.peck - dt); if (b.peck > .25) { const nx = b.x + b.face * 26 * dt; if (M.canWalk(nx, b.y)) b.x = nx; }
      if (near < 700 && Math.random() < dt / 9) AudioEngine.birdCall(.03, 2);
    } else if (b.state === 'warn') {
      b.t -= dt; b.h = Math.min(80, b.h + 160 * dt);
      if (b.t <= 0) { const d = Math.hypot(b.tx - b.x, b.ty - b.y) || 1; Object.assign(b, { state: 'dive', vx: (b.tx - b.x) / d, vy: (b.ty - b.y) / d, dist: d, travel: 0, h0: b.h }); AudioEngine.swoosh(); }
    } else if (b.state === 'dive') {
      const step = 560 * dt; b.x += b.vx * step; b.y += b.vy * step; b.travel += step; const k = b.travel / b.dist; b.h = k < 1 ? b.h0 + (24 - b.h0) * k : 24 + (k - 1) * 120;
      if (!b.hit && b.h < 50 && Math.hypot(p.x - b.x, p.y - b.y) < QQ_HIT) {
        b.hit = true; qqKnock = { t: .25, vx: b.vx * 520, vy: b.vy * 340, map: M.id }; AudioEngine.ouch(); fxPuffs(p.x, p.y - 70, 5, 80, '#efece6');
      }
      if (k > 1.6) qqFlyOff(b, M);
    } else if (b.state === 'fly') {
      const d = Math.hypot(b.tx - b.x, b.ty - b.y), s = Math.min(d, 260 * dt);
      b.x += (b.tx - b.x) / (d || 1) * s; b.y += (b.ty - b.y) / (d || 1) * s;
      b.h = d > 140 ? Math.min(130, b.h + 220 * dt) : Math.max(0, b.h - 200 * dt);
      if (d < 4 && b.h <= 0) { b.state = 'ground'; b.hop = 1.5; }
    }
  }
}
// Desenho no tamanho do mapa: menor que na laçada, com suavização (a arte é grande para a escala do mundo).
function qqDraw(frame, x, y, scale, flip, angle = 0) {
  if (!queroArt.complete || !queroArt.naturalWidth) return; const w = QUERO_W * scale, h = QUERO_H * scale;
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'medium'; ctx.translate(x, y); if (flip) ctx.scale(-1, 1); ctx.rotate(angle);
  ctx.drawImage(queroArt, frame * QUERO_W, 0, QUERO_W, QUERO_H, -w / 2, -h / 2, w, h); ctx.restore();
}
function qqLayers(M, seen, layers) {
  for (const b of qqBirds(M)) {
    if (!seen(b.x, b.y) && !seen(b.tx ?? b.x, b.ty ?? b.y)) continue;
    // O alvo do rasante fica no chão, embaixo de quem estiver em cima dele.
    if (b.state === 'warn') layers.push({ y: b.ty - 40, draw: () => {
      const pulse = .5 + .5 * Math.sin(frameClock * 18); ellipse(b.tx, b.ty, QQ_HIT, QQ_HIT * .4, `rgba(230,50,36,${.2 + .16 * pulse})`);
      ctx.strokeStyle = `rgba(235,52,40,${.7 + .3 * pulse})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(b.tx, b.ty, QQ_HIT, QQ_HIT * .4, 0, 0, Math.PI * 2); ctx.stroke();
    } });
    layers.push({ y: b.y, draw: () => {
      const half = QUERO_H * QQ_SCALE / 2;
      ellipse(b.x, b.y + 2, 13 * (1 - Math.min(.6, b.h / 300)), 4, '#1c140c40');
      if (b.state === 'ground') { const pecking = b.peck > 0 && b.peck <= .25; qqDraw(0, b.x, b.y - half + (pecking ? 2 : 0), QQ_SCALE, b.face < 0, pecking ? .4 : 0); return; }
      if (b.state === 'dive') { qqDraw(3, b.x, b.y - half - b.h, QQ_SCALE * 1.1, b.face < 0, .25); return; }
      qqDraw(Math.floor(b.flap * (b.state === 'warn' ? 14 : 9)) % 2 ? 1 : 2, b.x, b.y - half - b.h, QQ_SCALE * 1.1, b.face < 0, .1);
    } });
  }
}
// F no mapa, com um quero-quero por perto: o bodoque fica guardado.
function qqSlingKey() {
  if (!worldOut || modal || scene || qqSlingNote > 0 || !slingOwned()) return;
  if (!qqBirds().some(b => Math.hypot(b.x - worldOut.x, b.y - worldOut.y) < 450)) return;
  qqSlingNote = 4; worldSay('O bodoque fica guardado: ele só sai na laçada dos bois.');
}

// ---------- Ligações ----------
{
  for (const id of Object.keys(QQ_CHANCE)) { const M = WORLD_MAPS[id], draw = M.draw; M.draw = function (view, seen, layers) { draw.call(this, view, seen, layers); qqLayers(this, seen, layers); }; }
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); qqTick(dt); };
  // O empurrão do rasante acaba ao trocar de mapa ou entrar na bodega.
  for (const name of ['switchMap', 'goInside', 'goOutside']) { const fn = window[name]; window[name] = function (...a) { qqKnock.t = 0; return fn.apply(this, a); }; }
  document.addEventListener('keydown', e => { if (!e.repeat && (e.key === 'f' || e.key === 'F')) qqSlingKey(); });
}
