// O chefe do andar 20: a Salamanca do Jarau (a lenda gaúcha contada por Simões Lopes Neto). No fundo da serra, o
// Anhangá-Pitã, o Diabo Vermelho, guarda a Teiniaguá presa numa gaiola de luz.
//   · Só arma encantada fere o Diabo: o São Dunstano encanta o facão com opala e ouro.
//   · O Sadi usa o laço (Q): segura o Diabo uns segundos, mais ainda quando ele bate na parede depois da investida.
//   · Fase 1: investida que deixa rastro de fogo, chuva de brasas (alvos vermelhos no chão) e bichos de reforço.
//   · Fase 2 (metade da vida): o salão escurece e ele vira só dois olhos acesos; a Teiniaguá oferece ouro, poder ou nada.
//   · Fase 3 (vida baixa): ele corre pra fenda; laçado, não foge. Se fugir, volta no outro dia com a vida cheia.
// Vencido: a Teiniaguá fica livre e a luz do carbúnculo clareia todos os andares da caverna, pra sempre.
'use strict';

const SALAMANCA_FLOOR = 20, SALAMANCA_CELL = { boss: [11, 5], cage: [11, 1], crack: [20, 1] };
const ENCANTO = { needs: { opala: 3, ouro: 2 }, cost: 300 };
CAVE_BEASTS.diabo = { name: 'Anhangá-Pitã, o Diabo Vermelho', hp: 900, speed: 120, dmg: 18, r: 40, cash: [60, 80], from: 999, weight: 0 };
function salamancaDone() { return !!G.cave?.salamanca; }
function caveEnchanted() { return !!G.cave?.enchanted; }
function salamancaRun() { const run = inCave() ? caveFloorRun() : null; return run?.floor === SALAMANCA_FLOOR ? run : null; }
function salamancaBoss(run = salamancaRun()) { return run?.beasts.find(b => b.kind === 'diabo' && b.hp > 0) || null; }
const DIABO_STATES = new Set(['idle', 'windup', 'charge', 'dazed', 'flee']);
// A cabeça do Diabo no desenho (o laço pega no pescoço; no escuro, só os olhos aparecem).
function diaboHead(b) { return { x: b.x + (b.dx < 0 ? -1 : 1) * 60, y: b.y - 122 }; }
function diaboPhase(b) { const f = b.hp / b.max; return f > .5 ? 1 : f > .15 ? 2 : 3; }

// ---------- O salão ----------
function buildSalamanca(run) {
  const { cols, rows } = CAVE; run.grid = Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => x === 0 || y === 0 || x === cols - 1 || y === rows - 1 ? 1 : 0));
  for (const [x, y] of [[6, 4], [16, 4], [6, 9], [16, 9]]) run.grid[y][x] = 1;
  // Poucas pedras com veio (ágata, ouro e opala): servem de abrigo contra a investida.
  run.rocks = [[4, 3, 'agata'], [18, 6, 'ouro'], [13, 8, 'agata'], [8, 7, 'opala']].map(([x, y, loot]) => ({ ...caveCenter(x, y), hp: 4, loot })); run.chest = null; run.fires = []; run.brasas = []; run.salamanca = true;
  run.ladder = { ...caveCenter(20, 11), shown: salamancaDone() };
  if (salamancaDone() || G.cave?.salamancaFled === G.day) { run.beasts = []; return run; }
  const p = caveCenter(...SALAMANCA_CELL.boss), B = CAVE_BEASTS.diabo;
  run.beasts = [{ kind: 'diabo', x: p.x, y: p.y, hp: B.hp, max: B.hp, dx: -1, state: 'idle', t: 2, vx: 0, vy: 0, hurt: 0, frame: 0, boss: true, summon: 8 }];
  return run;
}

// ---------- O Diabo ----------
function diaboTick(b, dt, run, p) {
  const B = CAVE_BEASTS.diabo, dxp = p.x - b.x, dyp = p.y - b.y, dist = Math.hypot(dxp, dyp) || 1, phase = diaboPhase(b);
  b.hurt = Math.max(0, b.hurt - dt); b.attack = Math.max(0, (b.attack || 0) - dt); b.t -= dt; b.frame += dt * 7;
  if (!DIABO_STATES.has(b.state)) { b.state = 'idle'; b.t = Math.max(b.t, .6); }
  if (phase >= 2 && !b.tempted) { b.tempted = true; salamancaTemptation(); return; }
  if (phase === 3 && b.state !== 'flee') { b.state = 'flee'; effect('Ele vai fugir pela fenda!', b.x, b.y - 170, '#ffb3a0', 18); floatNote('O Diabo Vermelho corre pra fenda: laça ele (Q) e termina com o facão!'); }
  const move = (vx, vy) => caveMove(b, vx * dt, vy * dt);
  if (b.state === 'flee') {
    const c = caveCenter(...SALAMANCA_CELL.crack), d = Math.hypot(c.x - b.x, c.y - b.y) || 1; b.dx = c.x < b.x ? -1 : 1;
    const ox = b.x, oy = b.y; move((c.x - b.x) / d * 150, (c.y - b.y) / d * 150); if (Math.hypot(b.x - ox, b.y - oy) < 150 * dt * .3) { b.x += (c.x - b.x) / d * 150 * dt; b.y += (c.y - b.y) / d * 150 * dt; }
    if (d < 50) { diaboEscape(run, b); return; }
  } else if (b.state === 'idle') {
    // Rodeia o Sadi a uma certa distância e escolhe o próximo golpe.
    const want = dist > 330 ? 1 : dist < 220 ? -1 : 0; if (Math.abs(dxp) > 6) b.dx = dxp < 0 ? -1 : 1;
    move(dxp / dist * B.speed * want + (-dyp / dist) * 50, dyp / dist * B.speed * want + (dxp / dist) * 50);
    b.summon -= dt;
    if (b.t <= 0) {
      const minions = run.beasts.filter(x => x !== b && x.hp > 0).length;
      if (b.summon <= 0 && minions < 3) { b.summon = 14; diaboSummon(run, b, phase); b.t = 1.2; }
      else if (Math.random() < .55) { b.state = 'windup'; b.t = .7; b.vx = dxp / dist; b.vy = dyp / dist; b.dx = b.vx < 0 ? -1 : 1; AudioEngine.caveGrowl(.4, .09); }
      else { diaboRain(run, p, phase); b.t = 2.2; }
    }
  } else if (b.state === 'windup') { if (b.t <= 0) { b.state = 'charge'; b.t = .9; b.trail = 0; AudioEngine.caveFireball(); } }
  else if (b.state === 'charge') {
    const sp = 520; b.trail -= dt; if (b.trail <= 0) { b.trail = .07; run.fires.push({ x: b.x, y: b.y, t: 4, r: 30 }); }
    // Bateu na parede: fica tonto e o laço segura mais tempo.
    if (!move(b.vx * sp, b.vy * sp)) { b.state = 'dazed'; b.t = 1.6; run.shake = .35; AudioEngine.caveStone(); effect('Bateu na parede!', b.x, b.y - 170, '#ffe28a', 16); }
    else if (b.t <= 0) { b.state = 'idle'; b.t = 1.4; }
  } else if (b.state === 'dazed') { if (b.t <= 0) { b.state = 'idle'; b.t = 1; } }
  if (b.state !== 'dazed' && Math.hypot(p.x - b.x, (p.y - 30) - (b.y - 30)) < B.r + 24) caveHurt(B.dmg, b);
}
// Chuva de brasas: alvos vermelhos no chão, perto do Sadi, que estouram um segundo depois.
function diaboRain(run, p, phase) {
  const n = phase === 1 ? 4 : 6; AudioEngine.ignite?.();
  for (let k = 0; k < n; k++) { const a = Math.random() * Math.PI * 2, r = k ? 60 + Math.random() * 180 : 0, x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r * .7; if (!caveWall(x, y)) run.brasas.push({ x, y, t: 1.1 + k * .12 }); }
}
function diaboSummon(run, b, phase) {
  const kinds = phase === 1 ? ['sanguanel', 'lobisomem'] : ['lobisomem', 'boitata'];
  for (const kind of kinds) {
    const B = CAVE_BEASTS[kind], a = Math.random() * Math.PI * 2, x = b.x + Math.cos(a) * 160, y = b.y + Math.sin(a) * 110; if (!caveFree(x, y, 30)) continue;
    const hp = Math.round(B.hp * 2); run.beasts.push({ kind, x, y, hp, max: hp, dx: 1, state: 'roam', t: .5, vx: 0, vy: 0, hurt: 0, frame: 0, minion: true }); fxPuffs(x, y - 30, 10, 90, '#8a2a1a');
  }
  effect('O Diabo chamou reforço!', b.x, b.y - 170, '#ffb3a0', 16); AudioEngine.caveGrowl(.6, .1);
}
function diaboEscape(run, b) {
  b.hp = 0; run.beasts = run.beasts.filter(x => x !== b); G.cave.salamancaFled = G.day; fxPuffs(b.x, b.y - 40, 14, 120, '#5a1a10'); save();
  talk([['card', '<b>🔥 Fugiu pela fenda!</b><br>O Diabo Vermelho se espremeu na fenda da pedra e sumiu no fundo da serra, rindo. Amanhã ele volta pro salão, com a vida cheia.<br><br><i>Na fase final, laça ele (Q) antes que chegue na fenda.</i>', 'A Salamanca do Jarau']], null, 'Até amanhã');
}
// A Teiniaguá oferece: ouro, poder ou nada. Quem recusa ganha coragem.
function salamancaTemptation() {
  openDialog('A Teiniaguá', `<div class="callout"><b>🦎 Da gaiola de luz, a Teiniaguá fala na tua cabeça:</b><br>“Ninguém vence o Anhangá-Pitã sem pagar. Escolhe, gaúcho: ouro, poder… ou nada.”</div><div class="store-list">
    <div class="supply"><span class="icon"><span class="bag-emoji">🪙</span></span><div><b>Ouro</b><p>R$ 150 na mão agora. O Diabo recupera um quarto da vida.</p></div><button data-act="salamancaEscolha" data-id="ouro">Aceitar o ouro</button></div>
    <div class="supply"><span class="icon"><span class="bag-emoji">🔥</span></span><div><b>Poder</b><p>+60% de dano por 20 segundos. O Diabo recupera um quarto da vida.</p></div><button data-act="salamancaEscolha" data-id="poder">Aceitar o poder</button></div>
    <div class="supply"><span class="icon"><span class="bag-emoji">🤠</span></span><div><b>Nada</b><p>Recusar a Salamanca. Coragem de gaúcho: +25% de dano até o fim da luta e +30 de vida.</p></div><button class="primary" data-act="salamancaEscolha" data-id="nada">Recusar</button></div></div>`, 'salamanca');
}
function salamancaChoice(id) {
  const run = salamancaRun(), b = salamancaBoss(run); closeDialog(true); if (!run || !b) return;
  const st = caveState(), p = worldOut;
  if (id === 'nada') { run.courage = true; st.hp = Math.min(caveMaxHp(), st.hp + 30); effect('Coragem de gaúcho!', p.x, p.y - 140, '#ffe28a', 18); AudioEngine.boost(); }
  else { b.hp = Math.min(b.max, b.hp + b.max * .25); if (id === 'ouro') { G.cash = round(G.cash + 150); effect('+R$ 150', p.x, p.y - 140, '#ffe27a', 18); AudioEngine.coins(); } else { run.power = 20; effect('Poder da Salamanca!', p.x, p.y - 140, '#ff9a6a', 18); AudioEngine.boost(); } }
  save(); refreshHUD();
}
function salamancaVictory(b) {
  G.cave.salamanca = G.day; const run = caveFloorRun(); run.ladder.shown = true; run.ladderPing = 3; run.fires = []; run.brasas = [];
  for (const m of run.beasts) if (m.minion) m.hp = 0;
  for (let k = 0; k < 6; k++) run.drops.push({ x: b.x - 75 + k * 30, y: b.y + (k % 2) * 16, k: 'moeda', q: 40 });
  run.drops.push({ x: b.x, y: b.y + 30, k: 'ouro', q: 3 }, { x: b.x + 40, y: b.y + 30, k: 'opala', q: 2 });
  const rw = { cash: 300, xp: 400, rep: 10, unlock: 'A luz do carbúnculo: todos os andares da caverna clareados' }; grantReward(rw); save(); AudioEngine.ready();
  talk([['card', '<b>🦎 A Teiniaguá livre</b><br>A gaiola de luz se desfaz. A lagartixa encantada vira moça de novo, com o carbúnculo brilhando na testa.', 'A Salamanca do Jarau'],
    ['sadi', 'Bah… então a lenda era verdade.'], ['card', '“Mil anos presa na furna, gaúcho. Toma a luz da pedra: onde tu pisar nesta serra, nunca mais vai ser escuro.”', 'A Teiniaguá'],
    ['reward', rw, 'O Diabo Vermelho vencido']], null, 'Valeu, princesa');
}

// ---------- O laço (Q) ----------
function salamancaLasso() {
  const run = salamancaRun(); if (!run || caveDefeatActive() || paused || modal || scene || worldTalkOpen()) return;
  if ((run.lassoCd || 0) > 0) { floatNote('O laço ainda tá voltando pra mão.'); return; }
  const p = worldOut, fx = p.dx ?? 1, fy = p.dy ?? 0, list = run.beasts.filter(b => b.hp > 0).map(b => ({ b, d: Math.hypot(b.x - p.x, b.y - p.y) })).filter(o => o.d < 320).sort((a, c) => (a.b.boss ? -1 : 0) - (c.b.boss ? -1 : 0) || a.d - c.d);
  run.lassoCd = 3; AudioEngine.lassoThrow();
  const o = list[0]; if (!o) { run.rope = { x: p.x + fx * 220, y: p.y - 30 + fy * 160, t: .3 }; effect('Laço no vazio…', p.x, p.y - 140, '#ffe2a6', 16); return; }
  const b = o.b, hold = b.boss ? (b.state === 'dazed' ? 3.5 : b.state === 'flee' ? 3 : 1.8) : 2.5;
  b.stun = hold; if (b.boss) b.state = b.state === 'flee' ? 'flee' : 'idle'; run.rope = { x: b.x, y: b.y - 100, t: hold, target: b };
  setTimeout(() => AudioEngine.ropeHit(), 160); effect(b.boss ? 'Laçado! Bate agora!' : 'Laçado!', b.x, b.y - 170, '#ffe28a', 18); fxStars(b.x, b.y - 90, 5);
}

// ---------- Desenho ----------
// O Anhangá do folclore, pintado de vermelho brasa uma vez só por quadro (sem filtro a cada frame).
const diaboTint = new Map();
function diaboFrame(index, height, ref) {
  const f = expansionFrame('cave-beasts-b-v1', index, height, ref); if (!f) return null;
  const k = index + ':' + f.w + ':' + f.h; let c = diaboTint.get(k);
  if (!c) {
    c = document.createElement('canvas'); c.width = f.image.width; c.height = f.image.height; const g = c.getContext('2d');
    g.drawImage(f.image, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = '#ff4a2a'; g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = 'destination-in'; g.drawImage(f.image, 0, 0);
    g.globalCompositeOperation = 'source-atop'; g.globalAlpha = .18; g.fillStyle = '#ff2a10'; g.fillRect(0, 0, c.width, c.height); diaboTint.set(k, c);
  }
  return { ...f, image: c };
}
function drawDiabo(b) {
  const run = caveFloorRun(), dark = diaboPhase(b) >= 2 && !run.torch && Math.hypot(worldOut.x - b.x, worldOut.y - b.y) > 170;
  if (dark) return;
  const attack = b.state === 'charge' || b.attack > 0, step = attack ? 3 : b.state === 'dazed' ? 1 : Math.floor(b.frame) % 3, shake = b.state === 'windup' ? Math.sin(frameClock * 60) * 4 : 0;
  ctx.save(); ellipse(b.x, b.y, 44, 13, '#0009'); ctx.globalCompositeOperation = 'lighter'; glow(b.x, b.y - 90, 120, .22 + .08 * Math.sin(frameClock * 5), '255,70,30'); ctx.restore();
  const f = diaboFrame(12 + step, 210, expansionRowHeight('cave-beasts-b-v1', 12, 4));
  if (f) { ctx.save(); ctx.translate(b.x + shake, b.y); if (b.dx < 0) ctx.scale(-1, 1); ctx.drawImage(f.image, -f.ax, -f.h, f.w, f.h); if (b.hurt > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .6; ctx.drawImage(f.image, -f.ax, -f.h, f.w, f.h); } ctx.restore(); }
  else { ellipse(b.x, b.y - 80, 46, 80, '#8a1a10'); ellipse(b.x, b.y - 170, 26, 24, '#a8241a'); }
  if (b.stun > 0) for (let k = 0; k < 3; k++) { const a = frameClock * 6 + k * 2.1; const h = diaboHead(b); txt('✦', h.x + Math.cos(a) * 34, h.y - 50 + Math.sin(a) * 8, 15, '#ffd75e'); }
}
function diaboNeck(b) { if (!b.boss) return { x: b.x, y: b.y - 50 }; const h = diaboHead(b); return { x: (h.x + b.x) / 2, y: h.y + 25 }; }
function drawDiaboEyes(b) { const run = caveFloorRun(); if (diaboPhase(b) < 2 || run.torch || Math.hypot(worldOut.x - b.x, worldOut.y - b.y) <= 170) return; const h = diaboHead(b); ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glow(h.x + s * 12, h.y, 22, .8, '255,60,20'); ctx.restore(); for (const s of [-1, 1]) ellipse(h.x + s * 12, h.y, 5, 3, '#ffe060'); }
function drawSalamancaHall(run) {
  // A gaiola de luz da Teiniaguá, a fenda e o ouro amontoado.
  const c = caveCenter(...SALAMANCA_CELL.cage), k = caveCenter(...SALAMANCA_CELL.crack);
  if (!salamancaDone()) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(c.x, c.y + 10, 110, .35 + .1 * Math.sin(frameClock * 3), '255,90,60'); ctx.restore();
    expansionSprite('cave-beasts-b-v1', 4 + Math.floor(frameClock * 3) % 3, c.x, c.y + 40, 70, false, expansionRowHeight('cave-beasts-b-v1', 4, 4));
    ctx.strokeStyle = 'rgba(255,200,140,.75)'; ctx.lineWidth = 3; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(c.x + i * 18, c.y - 40); ctx.lineTo(c.x + i * 18, c.y + 44); ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(c.x, c.y - 40, 44, 12, 0, Math.PI, 0); ctx.stroke();
  }
  ellipse(k.x, k.y + 10, 30, 52, '#050302'); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(k.x, k.y + 10, 60, .25, '200,40,20'); ctx.restore();
  for (const [x, y] of [[3, 2], [18, 3], [4, 11], [12, 12]]) { const g = caveCenter(x, y); for (let i = 0; i < 5; i++) ellipse(g.x - 16 + i * 8, g.y + 10 - (i % 2) * 6, 9, 6, i % 2 ? '#e8b030' : '#c89020'); }
}
function drawSalamancaFires(run) {
  for (const f of run.fires) { const a = Math.min(1, f.t); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(f.x, f.y - 8, 40, .35 * a, '255,110,30'); ctx.restore(); ellipse(f.x, f.y, f.r * .8, f.r * .32, `rgba(255,120,40,${.45 * a})`); }
}
// Por cima do escuro: os alvos das brasas, o laço e, na fase escura, os olhos do Diabo.
function drawSalamancaHazards(run) {
  const b = salamancaBoss(run); if (b) drawDiaboEyes(b);
  for (const s of run.brasas) { const pulse = .5 + .5 * Math.sin(frameClock * 18); ellipse(s.x, s.y, 46, 18, `rgba(230,50,36,${.2 + .15 * pulse})`); ctx.strokeStyle = `rgba(255,70,40,${.7 + .3 * pulse})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(s.x, s.y, 46, 18, 0, 0, Math.PI * 2); ctx.stroke(); }
  const r = run.rope; if (r && r.t > 0) { const p = worldOut, n = r.target ? diaboNeck(r.target) : r, tx = n.x, ty = n.y; ctx.strokeStyle = '#c8a060'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.x + 12, p.y - 70); ctx.quadraticCurveTo((p.x + tx) / 2, Math.min(p.y, ty) - 60, tx, ty); ctx.stroke(); }
}
function drawSalamancaHUD(run) {
  const b = salamancaBoss(run); if (!b) return;
  const dpr = canvas.width / Math.max(1, canvas.clientWidth), W = canvas.clientWidth, w = Math.min(520, W - 340), x = (W - w) / 2 - 120;
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  rect(x, 16, w, 46, 'rgba(20,8,6,.85)', 8, '#a83a24'); txt('🔥 ' + CAVE_BEASTS.diabo.name + (caveEnchanted() ? '' : ' · só arma encantada fere ele'), x + w / 2, 30, 13, '#ffd2b0', 'center', 'Georgia', false);
  rect(x + 12, 40, w - 24, 12, '#2a0a06', 5); rect(x + 12, 40, (w - 24) * b.hp / b.max, 12, '#e8442a', 5);
  for (const f of [.5, .15]) rect(x + 12 + (w - 24) * f - 1, 38, 2, 16, '#ffd2b0');
  ctx.restore();
}

// ---------- Ligações ----------
{
  const build = buildCaveFloor; buildCaveFloor = function (floor) { const run = build(floor); if (floor === SALAMANCA_FLOOR) buildSalamanca(run); if (salamancaDone()) run.torch = true; return run; };
  const beast = caveBeastTick; caveBeastTick = function (b, dt, run, p) { if (b.kind !== 'diabo' || b.stun > 0) return beast(b, dt, run, p); diaboTick(b, dt, run, p); };
  // Só arma encantada fere o Diabo; a coragem e o poder da Salamanca aumentam o golpe.
  const hit = caveHitDmg; caveHitDmg = function (b) {
    const run = caveFloorRun(); let d = hit(b);
    if (b?.kind === 'diabo') { if (!caveEnchanted()) { if (!run.warnEnchant || run.t - run.warnEnchant > 6) { run.warnEnchant = run.t; floatNote('O facão mal arranha o Diabo: só arma encantada fere ele. Fala com o São Dunstano.'); } return 1; } if (b.stun > 0) d = Math.round(d * 1.5); }
    if (run.salamanca) { if (run.courage) d = Math.round(d * 1.25); if (run.power > 0) d = Math.round(d * 1.6); }
    return d;
  };
  const swing = caveSwingColor; caveSwingColor = function () { return caveEnchanted() && !caveBuff('aguabenta') ? '200,170,255' : swing(); };
  // O Diabo é pesado: o golpe do facão quase não empurra ele.
  const attack = caveAttack; caveAttack = function () { const b = salamancaBoss(), ox = b?.x, oy = b?.y; attack(); if (b && b.hp > 0) { b.x = ox + (b.x - ox) * .2; b.y = oy + (b.y - oy) * .2; } };
  const kill = caveKill; caveKill = function (b) { kill(b); if (b.kind === 'diabo') salamancaVictory(b); };
  const tick = caveTick; caveTick = function (dt) {
    tick(dt); const run = salamancaRun(); if (!run || paused || modal || scene || phoneOpen || caveDefeatActive()) return;
    run.lassoCd = Math.max(0, (run.lassoCd || 0) - dt); run.power = Math.max(0, (run.power || 0) - dt); if (run.rope) { run.rope.t -= dt; if (run.rope.t <= 0 || run.rope.target?.hp <= 0) run.rope = null; }
    const p = worldOut;
    for (const f of run.fires) { f.t -= dt; if (f.t > 0 && Math.hypot(p.x - f.x, (p.y - f.y) * 1.6) < f.r) caveHurt(6, f); }
    run.fires = run.fires.filter(f => f.t > 0);
    for (const s of run.brasas) { s.t -= dt; if (s.t <= 0) { fxPuffs(s.x, s.y - 10, 8, 80, '#ff7a3a'); AudioEngine.caveFireball(); if (Math.hypot(p.x - s.x, (p.y - s.y) * 2.4) < 50) caveHurt(14, s); } }
    run.brasas = run.brasas.filter(s => s.t > 0);
  };
  const cave = WORLD_MAPS.caverna, draw = cave.draw, hint = cave.hint;
  cave.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers); const run = salamancaRun(); if (!run) return;
    layers.push({ y: -1e6, draw: () => drawSalamancaHall(run) }, { y: -9e5, draw: () => drawSalamancaFires(run) });
    const b = salamancaBoss(run);
    if (b && diaboPhase(b) >= 2 && !run.torch) layers.push({ y: 2e6, draw: () => { const p = worldOut, g = ctx.createRadialGradient(p.x, p.y - 40, 60, p.x, p.y - 40, 420); g.addColorStop(0, 'rgba(6,2,2,0)'); g.addColorStop(1, 'rgba(6,2,2,.85)'); ctx.fillStyle = g; ctx.fillRect(p.x - 3000, p.y - 3000, 6000, 6000); } });
  };
  cave.hint = function () { const run = salamancaRun(); if (run && !worldNearest()) return 'Andar ' + run.floor + ' · a Salamanca · <strong>Espaço/F</strong> facão · <strong>Q</strong> laço' + (caveUp('dash') ? ' · <strong>Shift</strong> dash' : ''); return hint.call(this); };
  const onEnter = cave.onEnter; cave.onEnter = function () {
    onEnter.call(this); const run = salamancaRun(); if (!run || salamancaDone() || G.cave.salamancaSeen === G.day) return;
    G.cave.salamancaSeen = G.day; save();
    if (!salamancaBoss(run)) { floatNote('O salão tá vazio: o Diabo fugiu pela fenda e só volta amanhã.'); return; }
    talk([['card', '<b>🔥 O Salão da Salamanca</b><br>O andar inteiro é um salão de pedra com ouro amontoado. No fundo, numa gaiola de luz, uma lagartixa com uma pedra brilhando na cabeça: a Teiniaguá. E na frente dela, de olhos acesos, o Anhangá-Pitã, o Diabo Vermelho.', 'Andar ' + SALAMANCA_FLOOR],
      ['dica', (caveEnchanted() ? 'O teu facão tá encantado: ele fere o Diabo.' : '<b>Ferro comum não morde o Diabo.</b> O São Dunstano encanta o facão com opala e ouro, no primeiro andar.') + '<br><b>Q</b>: o laço segura o Diabo uns segundos (mais tempo quando ele bate na parede depois da investida). Laçado, ele apanha mais.<br>Fuja dos alvos vermelhos no chão e do rastro de fogo.', 'A Salamanca do Jarau']], null, 'Encarar');
  };
  // O tição continua clareando; o HUD do chefe vai por cima da luz da caverna.
  const light = drawCaveLight; drawCaveLight = function () { light(); const run = salamancaRun(); if (run) { drawSalamancaHazards(run); drawSalamancaHUD(run); } };
  const bd = drawCaveBeast; drawCaveBeast = function (b) { if (b.kind === 'diabo') { drawDiabo(b); return; } bd(b); };
  const act = action; action = function (name, id) {
    if (name === 'salamancaEscolha') { salamancaChoice(id); return; }
    if (name === 'forjaEncantar') { forjaEncantar(); return; }
    if (name === 'salamancaLaco') { salamancaLasso(); return; }
    return act(name, id);
  };
  document.addEventListener('keydown', e => {
    if (!inCave() || e.repeat || (e.key !== 'q' && e.key !== 'Q') || !salamancaRun()) return;
    e.preventDefault(); e.stopImmediatePropagation(); salamancaLasso();
  }, true);
  document.addEventListener('DOMContentLoaded', () => {
    $('caveAttackButton')?.insertAdjacentHTML('afterend', '<button id="caveLassoButton" class="sling-button cave-lasso hidden" type="button" data-act="salamancaLaco" title="Segura o Diabo uns segundos. Recarga de 3 segundos.">Q · Laço</button>');
  });
  const controls = caveUpdateControls; caveUpdateControls = function () { controls(); const btn = $('caveLassoButton'); if (!btn) return; const run = salamancaRun(), cd = run?.lassoCd || 0; btn.classList.toggle('hidden', !run || !salamancaBoss(run)); btn.disabled = cd > 0; btn.textContent = cd > 0 ? 'Laço · ' + cd.toFixed(1) + 's' : 'Q · Laço'; };
}

// ---------- O encantamento do facão (ferraria de São Dunstano) ----------
function forjaEncantar() {
  if (!dunstanShopOpen() || caveEnchanted()) return;
  if (!hasNeeds(ENCANTO.needs) || !hasCash(ENCANTO.cost)) { say('Pro encantamento: ' + needsText(ENCANTO.needs).replace(/<[^>]+>/g, '') + ' e ' + money(ENCANTO.cost) + '.'); AudioEngine.bad(); return; }
  takeNeeds(ENCANTO.needs); spendCash(ENCANTO.cost); G.cave.enchanted = G.day; AudioEngine.caveAnvil(); setTimeout(() => AudioEngine.ready(), 380); save(); refreshHUD(); closeDialog(true);
  talk([['dunstano', 'Opala pros olhos, ouro pra alma. Agora o fio do teu facão tem a luz do carbúnculo.'], ['dunstano', 'Lá no fundo, no andar ' + SALAMANCA_FLOOR + ', mora o Anhangá-Pitã. Ferro comum não morde ele; o teu, agora, morde.']], () => dunstanShop(), 'Valeu, santo');
}
function dunstanEnchantHTML() {
  if (caveEnchanted()) return forjaCard('<span class="forja-encanto">' + forgeWeaponIcon(caveWeapon().id) + '</span>', 'Facão encantado', 'A luz do carbúnculo no fio: fere o Diabo Vermelho da Salamanca, no andar ' + SALAMANCA_FLOOR + '.', '', '<button disabled>✔ Encantado</button>', 'owned');
  const ok = hasNeeds(ENCANTO.needs) && hasCash(ENCANTO.cost);
  return forjaCard('<span class="forja-encanto">' + forgeWeaponIcon(caveWeapon().id) + '</span>', 'Encantar o facão', 'Só arma encantada fere o Anhangá-Pitã, o Diabo Vermelho que guarda a Salamanca no andar ' + SALAMANCA_FLOOR + '. Vale pra qualquer arma que estiver na mão.', reqChips(ENCANTO.needs, ENCANTO.cost), `<button class="primary" data-act="forjaEncantar" ${ok ? '' : 'disabled'}>${ok ? 'Encantar' : 'Falta material'}</button>`);
}
{
  // Na seção de afiar (vale pra arma que está na mão), a partir do andar 15.
  const afiar = dunstanAfiarHTML; dunstanAfiarHTML = function () { const html = afiar(); return (G.cave?.deepest || 0) < 15 && !G.cave?.salamancaSeen ? html : html + dunstanEnchantHTML(); };
}
