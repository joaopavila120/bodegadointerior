// Caverna da Serra: desce-se andar por andar, como numa mina. Em cada andar há bichos e lendas para enfrentar com o
// facão cuiudo do vô (Espaço ou F), pedras para quebrar (ametista, ágata e pinhão para recuperar a vida), às vezes um
// baú e a escada para o andar de baixo: aparece quando os bichos acabam ou embaixo de uma das pedras.
// Quanto mais fundo, mais brabo: javali e sanguanel em cima; boitatá, lobisomem e mula sem cabeça lá embaixo.
// No andar 10 está o baú do vô, com moedas, ametistas, uma figurinha e um bilhete dele. A corda do começo de cada andar sobe de volta à Serra;
// de fora, ela desce direto até os andares 5, 10, 15 e 20 já alcançados. Desmaiou: acorda na boca da gruta.
'use strict';

const CAVE = { cell: 80, cols: 22, rows: 14, door: { x: 1625, y: 400 }, maxHp: 100, heal: 20, deep: 10, stops: [1, 5, 10, 15, 20], start: [2, 11] };
const CAVE_BEASTS = {
  javali: { name: 'Javali', hp: 30, speed: 110, dmg: 14, r: 34, cash: [3, 6], from: 1, weight: 4 },
  sanguanel: { name: 'Sanguanel', hp: 18, speed: 160, dmg: 8, r: 22, cash: [2, 5], from: 2, weight: 3 },
  boitata: { name: 'Boitatá', hp: 40, speed: 90, dmg: 12, r: 30, cash: [5, 9], from: 5, weight: 2 },
  lobisomem: { name: 'Lobisomem', hp: 70, speed: 150, dmg: 20, r: 34, cash: [8, 14], from: 7, weight: 2 },
  mula: { name: 'Mula sem Cabeça', hp: 55, speed: 120, dmg: 18, r: 36, cash: [7, 12], from: 9, weight: 2 }
};
Object.assign(BAG_RAW, { ametista: { name: 'Ametista', icon: '💜', value: 18, note: 'pedra da caverna da Serra; o Armazém compra' }, agata: { name: 'Ágata', icon: '🟠', value: 10, note: 'pedra da caverna da Serra; o Armazém compra' } });
SELLABLE.push('ametista', 'agata');

let caveRun = null;
function caveState() { G.cave ??= { facao: false, floor: 1, deepest: 1, hp: CAVE.maxHp, vo: false }; G.cave.up ??= {}; return G.cave; }
// A gruta só aparece depois de aceitar procurar a Baia (ou pra quem já desceu nela antes).
function caveOpen() { return !!G.cave?.facao || ['active', 'done'].includes(missionState('baia')?.status); }
// Melhorias do facão, vendidas no balcão do Mano Lima.
const CAVE_UPGRADES = [
  { id: 'afiado', name: 'Facão afiado na pedra', icon: '🔪', cost: 120, desc: 'Golpe mais forte: 18 de dano (era 12).' },
  { id: 'aco', name: 'Lâmina de aço carbono', icon: '⚔️', cost: 320, requires: 'afiado', desc: 'O golpe mais forte de todos: 26 de dano.' },
  { id: 'cabo', name: 'Cabo de chifre de boi', icon: '🐂', cost: 150, desc: 'Golpe mais ligeiro: dá pra bater mais seguido.' },
  { id: 'comprida', name: 'Lâmina comprida', icon: '📏', cost: 180, desc: 'Alcança o bicho de mais longe.' },
  { id: 'poncho', name: 'Poncho de couro', icon: '🧥', cost: 200, desc: 'Aguenta mais pancada: 140 de vida (era 100).' },
  { id: 'lampiao', name: 'Lampião a querosene', icon: '🏮', cost: 90, desc: 'Clareia bem mais longe no escuro da caverna.' }
];
function caveUp(id) { return !!G.cave?.up?.[id]; }
function caveMaxHp() { return caveUp('poncho') ? 140 : CAVE.maxHp; }
function caveDmg() { return caveUp('aco') ? 26 : caveUp('afiado') ? 18 : 12; }
function caveCd() { return caveUp('cabo') ? .26 : .38; }
function caveReach() { return caveUp('comprida') ? 145 : 110; }
function inCave() { return worldOut?.map === 'caverna'; }
function caveRand(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const caveCenter = (cx, cy) => ({ x: (cx + .5) * CAVE.cell, y: (cy + .5) * CAVE.cell });

// ---------- Gerar o andar ----------
// Paredes em blocos, sempre com caminho do começo até todo canto; o mesmo andar no mesmo dia sai igual.
function buildCaveFloor(floor) {
  const R = caveRand(floor * 7919 + G.day * 104729 + 17), { cols, rows } = CAVE, [sx, sy] = CAVE.start;
  const grid = Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => x === 0 || y === 0 || x === cols - 1 || y === rows - 1 ? 1 : 0));
  const reach = () => { const seen = new Set([sx + ',' + sy]), q = [[sx, sy]]; while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (!seen.has(k) && grid[ny]?.[nx] === 0) { seen.add(k); q.push([nx, ny]); } } } return seen; };
  const open = () => { let n = 0; for (const r of grid) for (const c of r) if (!c) n++; return n; };
  for (let b = 0; b < 9 + Math.min(floor, 8); b++) {
    const cx = 1 + Math.floor(R() * (cols - 2)), cy = 1 + Math.floor(R() * (rows - 2)), rad = R() < .4 ? 2 : 1, changed = [];
    for (let y = cy - rad; y <= cy + rad; y++) for (let x = cx - rad; x <= cx + rad; x++) if (grid[y]?.[x] === 0 && Math.abs(x - sx) + Math.abs(y - sy) > 3 && R() < .8) { grid[y][x] = 1; changed.push([x, y]); }
    if (reach().size !== open()) for (const [x, y] of changed) grid[y][x] = 0;
  }
  const free = [...reach()].map(k => k.split(',').map(Number)).filter(([x, y]) => Math.abs(x - sx) + Math.abs(y - sy) > 3);
  const takeCell = (far = 0) => { const pool = free.filter(([x, y]) => Math.abs(x - sx) + Math.abs(y - sy) >= far); if (!pool.length) return null; const k = Math.floor(R() * pool.length), c = pool[k]; free.splice(free.indexOf(c), 1); return c; };
  const run = { floor, grid, rocks: [], beasts: [], drops: [], shots: [], ladder: null, chest: null, swing: null, cd: 0, inv: 0, hurt: 0, t: 0 };
  const lc = takeCell(10) || takeCell(4); run.ladder = { ...caveCenter(...lc), shown: false };
  const nRocks = 8 + Math.floor(R() * 6);
  for (let k = 0; k < nRocks; k++) { const c = takeCell(); if (!c) break; const p = caveCenter(...c), roll = R(); run.rocks.push({ x: p.x + (R() - .5) * 20, y: p.y + (R() - .5) * 20, hp: 3, loot: roll < .12 + floor * .01 ? 'ametista' : roll < .4 ? 'agata' : roll < .55 ? 'pinhao' : null }); }
  // A escada pode estar embaixo de uma pedra: quebrou, achou.
  if (run.rocks.length && R() < .45) { const r = run.rocks[Math.floor(R() * run.rocks.length)]; Object.assign(run.ladder, { x: r.x, y: r.y }); r.ladder = true; }
  const kinds = Object.entries(CAVE_BEASTS).filter(([, b]) => b.from <= floor), total = kinds.reduce((n, [, b]) => n + b.weight, 0);
  for (let k = 0; k < Math.min(3 + floor, 10); k++) {
    const c = takeCell(6); if (!c) break; let roll = R() * total, kind = kinds[0][0]; for (const [id, b] of kinds) { roll -= b.weight; if (roll <= 0) { kind = id; break; } }
    const B = CAVE_BEASTS[kind], hp = Math.round(B.hp * (1 + Math.max(0, floor - B.from) * .08)), p = caveCenter(...c);
    run.beasts.push({ kind, x: p.x, y: p.y, hp, max: hp, dx: R() < .5 ? -1 : 1, state: 'roam', t: R() * 2, vx: 0, vy: 0, hurt: 0, frame: 0 });
  }
  if (floor === CAVE.deep && !caveState().vo) { const c = takeCell(8); if (c) run.chest = { ...caveCenter(...c), vo: true, open: false }; }
  else if (floor > 1 && R() < .35) { const c = takeCell(5); if (c) run.chest = { ...caveCenter(...c), vo: false, open: false }; }
  return run;
}
function caveFloorRun() { const st = caveState(); if (!caveRun || caveRun.floor !== st.floor || caveRun.day !== G.day) { caveRun = buildCaveFloor(st.floor); caveRun.day = G.day; } return caveRun; }
function caveWall(x, y) { const cx = Math.floor(x / CAVE.cell), cy = Math.floor(y / CAVE.cell); return caveFloorRun().grid[cy]?.[cx] !== 0; }
function caveFree(x, y, pad = 30) { if (caveWall(x, y)) return false; for (const r of caveFloorRun().rocks) if (r.hp > 0 && Math.hypot(r.x - x, r.y - y) < pad) return false; return true; }

// ---------- Entrar, descer, subir e desmaiar ----------
function caveDoorSpot() {
  if (worldOut?.map !== 'serra' || regionLocked('serra') || !caveOpen()) return [];
  return [{ id: 'caverna', x: CAVE.door.x, y: CAVE.door.y + 40, radius: 120, label: caveState().facao ? 'Descer na caverna da Serra' : 'Uma gruta escura entre os paredões', act: caveDoor }];
}
function caveDoor() {
  const st = caveState();
  if (!st.facao) {
    talk([['card', '<b>🔪 O facão do vô</b><br>Na boca da gruta, cravado numa pedra, um facão de cabo de chifre com as iniciais do vô. Lá de baixo vem um bafo frio e um grunhido de javali.', 'Caverna da Serra'],
      ['sadi', 'Bah, que facão cuiudo! O vô descia aqui embaixo, é?'],
      ['dica', '<b>Espaço</b> ou <b>F</b>: golpe de facão (no celular, o botão Facão).<br><b>E</b>: escada, baú e corda.<br>Quebre as pedras: ametista e ágata o Armazém compra; pinhão recupera a vida. A escada aparece quando os bichos acabam ou embaixo de uma pedra. Cada andar mais fundo tem bicho mais brabo, e lá no fundo tem coisa do vô.', 'Como funciona a caverna']], () => { st.facao = true; save(); enterCave(1); }, 'Descer');
    return;
  }
  const stops = CAVE.stops.filter(n => n <= st.deepest);
  if (stops.length < 2) { enterCave(1); return; }
  openDialog('Caverna da Serra', `<p>A corda do vô desce direto até os andares que você já alcançou. Mais fundo: andar <b>${st.deepest}</b>.</p><div class="actions">${stops.map(n => `<button class="${n === stops[stops.length - 1] ? 'primary' : ''}" data-act="caveGo" data-id="${n}">Andar ${n}</button>`).join('')}<button data-act="close">Ficar aqui fora</button></div>`, 'caveStops');
}
function enterCave(floor) {
  const st = caveState(); closeDialog(true); st.floor = Math.max(1, Number(floor) || 1); st.hp = Math.max(st.hp, caveMaxHp()); caveRun = null;
  worldOut.back = { map: 'serra', x: CAVE.door.x, y: CAVE.door.y + 70 };
  const s = caveCenter(...CAVE.start); switchMap({ map: 'caverna', x: s.x, y: s.y, title: 'Caverna da Serra · andar ' + st.floor }); save();
}
function caveDescend() {
  const st = caveState(), run = caveFloorRun(); if (!run.ladder.shown) return;
  st.floor++; st.deepest = Math.max(st.deepest, st.floor); st.hp = Math.min(caveMaxHp(), st.hp + CAVE.heal); caveRun = null;
  const s = caveCenter(...CAVE.start); switchMap({ map: 'caverna', x: s.x, y: s.y, title: 'Andar ' + st.floor + (st.floor === CAVE.deep && !st.vo ? ' · tem coisa do vô por aqui' : '') });
  AudioEngine.swoosh(.05); save();
}
function caveLeave(text) { const st = caveState(); st.hp = caveMaxHp(); caveRun = null; $('caveAttackButton')?.classList.add('hidden'); switchMap({ map: 'serra', x: CAVE.door.x, y: CAVE.door.y + 70, title: text || 'Serra Gaúcha' }); save(); }
function caveFaint() {
  const st = caveState(), lost = Math.min(50, Math.round(G.cash * .1)); G.cash = round(G.cash - lost); st.floor = 1; caveLeave('Serra Gaúcha');
  talk([['card', `<b>😵 Desmaiou na caverna</b><br>Acordou na boca da gruta, com a cabeça doendo e o bolso mais leve (−${money(lost)}). Dizem que foi o Badin que te puxou pela corda.`, 'Caverna da Serra'], ['badin', 'Ô, Sadi! Lá embaixo não é lugar de ir com a barriga vazia, capaz!']], null, 'Levantar');
}

// ---------- Facão ----------
function caveAttack() {
  if (!inCave() || modal || scene || worldTalkOpen()) return;
  const run = caveFloorRun(), p = worldOut; if (run.cd > 0) return;
  run.cd = caveCd(); const ang = Math.atan2(p.dy || 0, p.dx || (p.dy ? 0 : 1)); run.swing = { t: .2, ang };
  AudioEngine.swoosh(.08); let hit = false;
  const inArc = (x, y, reach) => { const d = Math.hypot(x - p.x, y - (p.y - 30)); if (d > reach) return false; const a = Math.atan2(y - (p.y - 30), x - p.x); return Math.abs(Math.atan2(Math.sin(a - ang), Math.cos(a - ang))) < 1.25 || d < 40; };
  for (const b of run.beasts) if (b.hp > 0 && inArc(b.x, b.y - 20, caveReach())) {
    hit = true; b.hp -= caveDmg(); b.hurt = .18; const d = Math.hypot(b.x - p.x, b.y - p.y) || 1; caveMove(b, (b.x - p.x) / d * 60, (b.y - p.y) / d * 60);
    if (b.state === 'charge' || b.state === 'lunge') b.state = 'rest', b.t = .5;
    effect('−' + caveDmg(), b.x, b.y - 80, '#ffd2a0'); if (b.hp <= 0) caveKill(b);
  }
  for (const r of run.rocks) if (r.hp > 0 && inArc(r.x, r.y - 10, caveReach() - 15)) { hit = true; r.hp--; effect(r.hp ? '✦' : '', r.x, r.y - 30, '#e8e0d0'); if (r.hp <= 0) caveBreak(r); }
  if (hit) AudioEngine.tick();
}
function caveKill(b) {
  const run = caveFloorRun(), B = CAVE_BEASTS[b.kind], [lo, hi] = B.cash, cash = lo + Math.floor(Math.random() * (hi - lo + 1)) + Math.floor(run.floor / 3);
  run.drops.push({ x: b.x, y: b.y, k: 'moeda', q: cash }); if (Math.random() < .12) run.drops.push({ x: b.x + 20, y: b.y + 8, k: 'pinhao', q: 1 });
  effect(B.name + ' derrubado!', b.x, b.y - 110, '#d8ffac'); AudioEngine.coins?.(); G.stats.caveKills = (G.stats.caveKills || 0) + 1;
  caveReveal();
}
function caveBreak(r) {
  const run = caveFloorRun(); AudioEngine.bad?.();
  if (r.loot) run.drops.push({ x: r.x, y: r.y, k: r.loot, q: 1 });
  if (r.ladder) { run.ladder.shown = true; effect('Uma escada embaixo da pedra!', r.x, r.y - 70, '#fff2b0'); }
}
// Sem bicho no andar, a escada aparece.
function caveReveal() { const run = caveFloorRun(); if (!run.ladder.shown && run.beasts.every(b => b.hp <= 0)) { run.ladder.shown = true; const { x, y } = run.ladder; effect('A escada pro andar de baixo!', x, y - 70, '#fff2b0'); for (const r of run.rocks) if (r.ladder) r.ladder = false; } }
function caveHurt(dmg, from) {
  const run = caveFloorRun(), st = caveState(); if (run.inv > 0) return;
  st.hp = Math.max(0, st.hp - dmg); run.inv = .9; run.hurt = .3; AudioEngine.bad();
  effect('−' + dmg, worldOut.x, worldOut.y - 130, '#ff8a7a');
  const d = Math.hypot(worldOut.x - from.x, worldOut.y - from.y) || 1; for (let k = 0; k < 6; k++) { const nx = worldOut.x + (worldOut.x - from.x) / d * 10, ny = worldOut.y + (worldOut.y - from.y) / d * 10; if (caveFree(nx, ny, 20)) { worldOut.x = nx; worldOut.y = ny; } }
  if (st.hp <= 0) caveFaint();
}
// Anda com colisão nas paredes e pedras; devolve falso se bateu.
function caveMove(b, dx, dy) { let ok = true; if (caveFree(b.x + dx, b.y, 26)) b.x += dx; else ok = false; if (caveFree(b.x, b.y + dy, 26)) b.y += dy; else ok = false; return ok; }

// ---------- Bichos ----------
function caveTick(dt) {
  const run = caveFloorRun(), p = worldOut, st = caveState(); run.t += dt; run.cd = Math.max(0, run.cd - dt); run.inv = Math.max(0, run.inv - dt); run.hurt = Math.max(0, run.hurt - dt);
  if (run.swing && (run.swing.t -= dt) <= 0) run.swing = null;
  for (const b of run.beasts) if (b.hp > 0) caveBeastTick(b, dt, run, p);
  for (const s of run.shots) { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; if (caveWall(s.x, s.y)) s.life = 0; else if (Math.hypot(s.x - p.x, s.y - (p.y - 40)) < 30) { s.life = 0; caveHurt(s.dmg, s); } }
  run.shots = run.shots.filter(s => s.life > 0);
  for (const d of run.drops) if (!d.got && Math.hypot(d.x - p.x, d.y - p.y) < 46) {
    d.got = true;
    if (d.k === 'moeda') { G.cash = round(G.cash + d.q); effect('+' + money(d.q), d.x, d.y - 50, '#ffe27a'); AudioEngine.coins?.(); }
    else if (d.k === 'pinhao') { st.hp = Math.min(caveMaxHp(), st.hp + 15); effect('+15 ❤ pinhão', d.x, d.y - 50, '#d8ffac'); AudioEngine.tick(); }
    else { bagAdd(d.k, d.q); effect(BAG_RAW[d.k].icon + ' ' + BAG_RAW[d.k].name, d.x, d.y - 50, '#e8d0ff'); AudioEngine.heart(); }
  }
  run.drops = run.drops.filter(d => !d.got);
  const btn = $('caveAttackButton'); if (btn) btn.classList.toggle('hidden', !inCave());
}
function caveBeastTick(b, dt, run, p) {
  const B = CAVE_BEASTS[b.kind], dxp = p.x - b.x, dyp = p.y - b.y, dist = Math.hypot(dxp, dyp) || 1;
  b.hurt = Math.max(0, b.hurt - dt); b.t -= dt; b.frame += dt * 8; if (Math.abs(dxp) > 6 && !['charge', 'lunge'].includes(b.state)) b.dx = dxp < 0 ? -1 : 1;
  const toward = sp => caveMove(b, dxp / dist * sp * dt, dyp / dist * sp * dt);
  const roam = () => { if (b.t <= 0) { const a = Math.random() * Math.PI * 2; b.vx = Math.cos(a); b.vy = Math.sin(a); b.t = 1 + Math.random() * 1.5; } if (!caveMove(b, b.vx * B.speed * .5 * dt, b.vy * B.speed * .5 * dt)) b.t = 0; if (Math.abs(b.vx) > .2) b.dx = b.vx < 0 ? -1 : 1; };
  if (b.kind === 'javali' || b.kind === 'mula') {
    if (b.state === 'roam') { roam(); if (dist < 360) { b.state = 'windup'; b.t = b.kind === 'mula' ? .45 : .6; } }
    else if (b.state === 'windup') { if (b.t <= 0) { b.state = 'charge'; b.t = .75; b.vx = dxp / dist; b.vy = dyp / dist; b.dx = b.vx < 0 ? -1 : 1; } }
    else if (b.state === 'charge') { const sp = b.kind === 'mula' ? 480 : 420; if (!caveMove(b, b.vx * sp * dt, b.vy * sp * dt) || b.t <= 0) { b.state = 'rest'; b.t = .7; } }
    else if (b.t <= 0) b.state = 'roam';
  } else if (b.kind === 'sanguanel') {
    toward(B.speed * (.7 + .3 * Math.sin(run.t * 6 + b.x)));
    if (b.t <= 0) { b.t = 3 + Math.random() * 1.5; for (let k = 0; k < 8; k++) { const a = Math.random() * Math.PI * 2, nx = p.x + Math.cos(a) * 170, ny = p.y + Math.sin(a) * 130; if (caveFree(nx, ny, 26)) { fxPuffs?.(b.x, b.y - 20, 6, 40, '#b8a8d8'); b.x = nx; b.y = ny; break; } } }
  } else if (b.kind === 'boitata') {
    if (dist < 220) toward(-B.speed); else if (dist > 320) toward(B.speed); else roam();
    if (b.t <= 0 && dist < 520) { b.t = 2.6; const sp = 260; run.shots.push({ x: b.x, y: b.y - 30, vx: dxp / dist * sp, vy: (dyp - 30) / dist * sp, life: 2.6, dmg: B.dmg }); }
  } else if (b.kind === 'lobisomem') {
    if (b.state === 'lunge') { if (!caveMove(b, b.vx * 380 * dt, b.vy * 380 * dt) || b.t <= 0) { b.state = 'rest'; b.t = 1.1; } }
    else if (b.state === 'rest') { if (b.t <= 0) b.state = 'chase'; }
    else { toward(dist < 520 ? B.speed : 0); if (dist < 170 && b.t <= 0) { b.state = 'lunge'; b.t = .35; b.vx = dxp / dist; b.vy = dyp / dist; } }
  }
  if (Math.hypot(p.x - b.x, (p.y - 30) - (b.y - 20)) < B.r + 22) caveHurt(B.dmg, b);
}

// ---------- Baús ----------
function caveChest() {
  const run = caveFloorRun(), c = run.chest; if (!c || c.open) return; c.open = true; AudioEngine.heart();
  if (c.vo) {
    caveState().vo = true; const cash = 120; G.cash = round(G.cash + cash); bagAdd('ametista', 3); const card = randomLooseCard(); if (card) giveCard(card, 'caverna'); save();
    talk([['card', `<b>🧰 O baú do vô</b><br>Lá no fundo da caverna, um baú de couro com as iniciais do vô gravadas na tampa. Dentro: moedas antigas (+${money(cash)}), três ametistas${card ? ', uma figurinha (<b>' + cardDef(card).name + '</b>)' : ''} e um bilhete.<br><br><i>“Se tu chegou até aqui, guri, é porque tem coragem. Agora sobe, que a bodega não abre sozinha.”</i>`, 'Andar ' + run.floor],
      ['sadi', 'Bah, vô… até aqui embaixo tu deixou recado.']], null, 'Guardar');
    return;
  }
  const card = Math.random() < .5 ? randomLooseCard() : null, cash = 15 + Math.floor(Math.random() * 25) + run.floor * 2;
  G.cash = round(G.cash + cash); bagAdd(Math.random() < .5 ? 'ametista' : 'agata', 1); if (card) giveCard(card, 'caverna');
  effect('Baú: +' + money(cash) + (card ? ' e uma figurinha' : ' e uma pedra'), c.x, c.y - 70, '#fff2b0'); save();
}

// ---------- Desenho ----------
function drawCaveFloor(view) {
  const run = caveFloorRun(), C = CAVE.cell, R = caveRand(run.floor * 31 + 7);
  rect(view.x - 50, view.y - 50, view.w + 100, view.h + 100, '#0c0a08'); rect(0, 0, CAVE.cols * C, CAVE.rows * C, '#2b241e');
  for (let y = 0; y < CAVE.rows; y++) for (let x = 0; x < CAVE.cols; x++) {
    const px = x * C, py = y * C, n = R(), m = R();
    if (run.grid[y][x]) continue;
    if (n < .45) ellipse(px + 10 + m * 60, py + 14 + n * 50, 26 + m * 20, 12 + n * 8, n < .2 ? '#31291f' : '#27201a');
    for (let k = 0; k < 3; k++) { const a = R(), b = R(); ellipse(px + a * C, py + b * C, 2 + a * 3, 1.5 + b * 2, a < .5 ? '#3d3329' : '#1f1a15'); }
  }
}
// Parede de rocha irregular: blocos que se encostam, com brilho em cima e sombra no chão da frente.
function drawCaveWall(x, y, run) {
  const C = CAVE.cell, px = x * C, py = y * C, R = caveRand(x * 977 + y * 131 + run.floor), tones = ['#4a3f35', '#54473a', '#3f352c', '#5c4e40'];
  if (run.grid[y + 1]?.[x] === 0) ellipse(px + C / 2, py + C + 2, C * .62, 14, '#0e0b09aa');
  rect(px - 4, py - 34, C + 8, C + 30, '#1a1512', 14);
  for (let k = 0; k < 4; k++) { const cx = px + 10 + R() * (C - 20), cy = py - 18 + R() * (C - 20), rx = 22 + R() * 20, ry = 18 + R() * 14; ellipse(cx, cy, rx, ry, tones[Math.floor(R() * tones.length)]); ellipse(cx - rx * .25, cy - ry * .45, rx * .45, ry * .3, '#6a5c4c'); }
  if (run.floor >= 3 && R() < .22) for (const [dx, dy] of [[0, 0], [8, 6]]) { const cx = px + 20 + R() * 40 + dx, cy = py + R() * 30 + dy; ctx.fillStyle = '#9a6ad8'; ctx.beginPath(); ctx.moveTo(cx, cy - 12); ctx.lineTo(cx + 5, cy); ctx.lineTo(cx, cy + 4); ctx.lineTo(cx - 5, cy); ctx.fill(); }
}
function drawCaveRock(r) {
  const cracked = 3 - r.hp; ellipse(r.x, r.y + 4, 30, 10, '#0008');
  ellipse(r.x, r.y - 14, 30, 24, '#6a5e52'); ellipse(r.x - 6, r.y - 22, 18, 12, '#7d7064');
  if (r.loot === 'ametista') for (const [dx, dy] of [[10, -24], [16, -16]]) { ctx.fillStyle = '#a874e8'; ctx.beginPath(); ctx.moveTo(r.x + dx, r.y + dy - 9); ctx.lineTo(r.x + dx + 4, r.y + dy); ctx.lineTo(r.x + dx, r.y + dy + 3); ctx.lineTo(r.x + dx - 4, r.y + dy); ctx.fill(); }
  if (r.loot === 'agata') { ellipse(r.x + 12, r.y - 18, 6, 4, '#d8843a'); ellipse(r.x + 12, r.y - 18, 3, 2, '#f0c080'); }
  ctx.strokeStyle = '#2a221c'; ctx.lineWidth = 2; for (let k = 0; k < cracked; k++) { ctx.beginPath(); ctx.moveTo(r.x - 10 + k * 8, r.y - 34); ctx.lineTo(r.x - 4 + k * 8, r.y - 18); ctx.lineTo(r.x - 10 + k * 8, r.y - 6); ctx.stroke(); }
}
function drawCaveBeast(b) {
  ctx.save(); if (b.hurt > 0) ctx.filter = 'brightness(2.4)';
  const shake = b.state === 'windup' ? Math.sin(frameClock * 60) * 3 : 0;
  if (b.kind === 'javali') drawJavali(b.x + shake, b.y, b.dx, Math.floor(b.frame) % 2, 1.2);
  else if (b.kind === 'lobisomem') drawLobisomem(b.x, b.y, b.dx, .8);
  else { ctx.translate(b.x + shake, b.y); ctx.scale(.8, .8); if (b.kind === 'sanguanel') drawSanguanel(0, 0, b.dx); else if (b.kind === 'boitata') drawBoitata(0, 0); else drawMula(0, 0, b.dx); }
  ctx.restore();
  if (b.hp < b.max) { rect(b.x - 26, b.y - 104, 52, 6, '#1a1008', 2); rect(b.x - 26, b.y - 104, 52 * b.hp / b.max, 6, '#e86a4a', 2); }
}
function drawCaveSwing() {
  const s = caveFloorRun().swing, p = worldOut; if (!s) return;
  const k = 1 - s.t / .2, a0 = s.ang - 1.2 + k * 2.4;
  ctx.save(); ctx.translate(p.x, p.y - 40); ctx.strokeStyle = `rgba(255,248,220,${.75 * (1 - k)})`; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, 78, s.ang - 1.2, a0); ctx.stroke();
  ctx.rotate(a0); rect(30, -4, 58, 8, '#d8d8e0', 3, '#5a5a66'); rect(14, -5, 18, 10, '#6a3a1a', 3); ctx.restore();
}
function drawCaveLadder(l) { ellipse(l.x, l.y, 34, 16, '#050403'); ellipse(l.x, l.y - 2, 28, 11, '#0c0907'); for (const dx of [-12, 12]) rect(l.x + dx - 2, l.y - 34, 4, 36, '#8a6238', 1); for (let k = 0; k < 3; k++) rect(l.x - 13, l.y - 28 + k * 10, 26, 3, '#a07444', 1); }
function drawCaveRope(x, y) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 60, 120, .25, '255,230,170'); ctx.restore(); rect(x - 2, y - 220, 4, 200, '#b89a62', 1); for (let k = 0; k < 10; k++) rect(x - 3, y - 210 + k * 20, 6, 3, '#8a7040', 1); ellipse(x, y - 18, 8, 5, '#b89a62'); }
function drawCaveChest(c) {
  ellipse(c.x, c.y + 4, 30, 9, '#0008'); rect(c.x - 28, c.y - 34, 56, 36, c.vo ? '#6a3a1a' : '#7a4e28', 4, '#2a1608');
  if (c.open) rect(c.x - 28, c.y - 52, 56, 16, '#5a3418', 4, '#2a1608'); else rect(c.x - 30, c.y - 42, 60, 14, c.vo ? '#7a4a24' : '#8a5a30', 5, '#2a1608');
  for (const dx of [-18, 14]) rect(c.x + dx, c.y - 42, 5, 44, '#9a9aa4', 1); rect(c.x - 4, c.y - 30, 8, 9, '#d8b048', 2);
  if (c.vo && !c.open) txt('S', c.x, c.y - 12, 12, '#d8b048', 'center', 'Georgia', false);
}
function drawCaveDrop(d) {
  const bob = Math.sin(frameClock * 4 + d.x) * 3;
  if (d.k === 'moeda') { ellipse(d.x, d.y - 8 + bob, 9, 9, '#e8c040'); ellipse(d.x, d.y - 8 + bob, 5, 5, '#c89a20'); }
  else if (d.k === 'pinhao') { ellipse(d.x, d.y - 8 + bob, 6, 10, '#8a4a24'); ellipse(d.x, d.y - 13 + bob, 3, 3, '#c8784a'); }
  else { ctx.fillStyle = d.k === 'ametista' ? '#a874e8' : '#d8843a'; ctx.beginPath(); ctx.moveTo(d.x, d.y - 22 + bob); ctx.lineTo(d.x + 9, d.y - 10 + bob); ctx.lineTo(d.x, d.y + bob); ctx.lineTo(d.x - 9, d.y - 10 + bob); ctx.fill(); }
}
// Escuro de caverna: só a lamparina do Sadi clareia; por cima, a vida e o andar.
function drawCaveLight() {
  if (!inCave()) return;
  const p = worldOut, run = caveFloorRun(), st = caveState(), g = ctx.createRadialGradient(p.x, p.y - 40, caveUp('lampiao') ? 160 : 90, p.x, p.y - 40, caveUp('lampiao') ? 820 : 560);
  g.addColorStop(0, 'rgba(8,6,4,0)'); g.addColorStop(1, 'rgba(8,6,4,.92)'); ctx.fillStyle = g; ctx.fillRect(p.x - 3000, p.y - 3000, 6000, 6000);
  if (run.hurt > 0) { ctx.fillStyle = `rgba(200,30,20,${run.hurt})`; ctx.fillRect(p.x - 3000, p.y - 3000, 6000, 6000); }
  const dpr = canvas.width / Math.max(1, canvas.clientWidth), X = canvas.clientWidth - 264; ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const left = run.beasts.filter(b => b.hp > 0).length;
  rect(X, 14, 250, 64, 'rgba(20,14,10,.82)', 8, '#a77439'); txt('Caverna da Serra · andar ' + run.floor, X + 12, 34, 14, '#ffe2a6', 'left', 'Georgia', false);
  rect(X + 12, 46, 160, 14, '#2a1608', 5); rect(X + 12, 46, 160 * Math.min(1, st.hp / caveMaxHp()), 14, st.hp > 35 ? '#d84a3a' : '#ff7a3a', 5); txt('❤ ' + st.hp + '/' + caveMaxHp(), X + 178, 57, 12, '#ffe2a6', 'left', 'Arial', false);
  txt(left ? left + (left === 1 ? ' bicho' : ' bichos') : 'andar limpo', X + 12, 72, 11, '#d9c79f', 'left', 'Arial', false);
  ctx.restore();
}

WORLD_MAPS.caverna = {
  id: 'caverna', name: 'Caverna da Serra', indoor: true, W: CAVE.cols * CAVE.cell, H: CAVE.rows * CAVE.cell,
  spawn() { return caveCenter(...CAVE.start); },
  canWalk(x, y) { return inCave() ? caveFree(x, y, 28) && caveFree(x, y - 18, 20) : true; },
  edge() { return null; },
  onEnter() { caveRun = null; caveFloorRun(); },
  hint() { if (worldNearest()) return null; return 'Andar ' + caveState().floor + ' · <strong>Espaço</strong> ou <strong>F</strong> facão · ache a escada'; },
  spots() {
    const run = caveFloorRun(), s = caveCenter(...CAVE.start), list = [{ id: 'cave:rope', x: s.x, y: s.y - 40, radius: 70, label: 'Subir pela corda (sair da caverna)', act: () => caveLeave() }];
    if (run.ladder.shown) list.push({ id: 'cave:ladder', x: run.ladder.x, y: run.ladder.y, radius: 70, label: 'Descer a escada · andar ' + (run.floor + 1), act: caveDescend });
    if (run.chest && !run.chest.open) list.push({ id: 'cave:chest', x: run.chest.x, y: run.chest.y + 10, radius: 70, label: run.chest.vo ? 'Abrir o baú do vô' : 'Abrir o baú', act: caveChest });
    return list;
  },
  draw(view, seen, layers) {
    const run = caveFloorRun(), s = caveCenter(...CAVE.start); drawCaveFloor(view);
    for (let y = 0; y < CAVE.rows; y++) for (let x = 0; x < CAVE.cols; x++) if (run.grid[y][x]) layers.push({ y: y * CAVE.cell + CAVE.cell - 30, draw: () => drawCaveWall(x, y, run) });
    layers.push({ y: s.y - 70, draw: () => drawCaveRope(s.x, s.y - 30) });
    if (run.ladder.shown) layers.push({ y: run.ladder.y - 40, draw: () => drawCaveLadder(run.ladder) });
    for (const r of run.rocks) if (r.hp > 0) layers.push({ y: r.y, draw: () => drawCaveRock(r) });
    if (run.chest) layers.push({ y: run.chest.y, draw: () => drawCaveChest(run.chest) });
    for (const d of run.drops) layers.push({ y: d.y - 30, draw: () => drawCaveDrop(d) });
    for (const b of run.beasts) if (b.hp > 0) layers.push({ y: b.y, draw: () => drawCaveBeast(b) });
    for (const sh of run.shots) layers.push({ y: sh.y + 30, draw: () => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(sh.x, sh.y, 30, .6, '255,140,40'); ctx.restore(); ellipse(sh.x, sh.y, 9, 9, '#ffb030'); ellipse(sh.x, sh.y, 4, 4, '#fff2b0'); } });
    layers.push({ y: worldOut.y + 1, draw: drawCaveSwing });
  }
};

// Boca da gruta na Serra: paredão de pedra com o buraco escuro e uma tocha.
function drawCaveMouth(layers, seen) {
  const { x, y } = CAVE.door; if (!caveOpen() || !seen(x, y, 400)) return;
  layers.push({ y: y - 10, draw: () => {
    ellipse(x, y + 4, 150, 26, '#1c140c55');
    ellipse(x, y - 70, 170, 110, '#5e5348'); ellipse(x - 60, y - 120, 90, 60, '#6e6256'); ellipse(x + 70, y - 110, 80, 64, '#665a4e'); ellipse(x - 120, y - 40, 60, 46, '#574c42'); ellipse(x + 125, y - 36, 56, 44, '#574c42');
    ellipse(x, y - 30, 66, 58, '#120e0b'); rect(x - 66, y - 30, 132, 32, '#120e0b'); ellipse(x, y - 34, 48, 44, '#070605');
    rect(x + 86, y - 92, 6, 60, '#5a3a20', 2); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x + 89, y - 100, 70, .35 + .1 * Math.sin(frameClock * 9), '255,150,60'); ctx.restore();
    ellipse(x + 89, y - 100 + Math.sin(frameClock * 11) * 1.5, 6, 10, '#ffb030'); ellipse(x + 89, y - 98, 3, 6, '#fff0a0');
  } });
}

// ---------- Ligações ----------
{
  const serra = WORLD_MAPS.serra, spots = serra.spots, draw = serra.draw;
  serra.spots = function () { return [...spots.call(this), ...caveDoorSpot()]; };
  serra.draw = function (view, seen, layers) { draw.call(this, view, seen, layers); drawCaveMouth(layers, seen); };
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (inCave() && !modal && !scene) caveTick(dt); else { const b = $('caveAttackButton'); if (b && !b.classList.contains('hidden')) b.classList.add('hidden'); } };
  document.addEventListener('keydown', e => { if (!inCave() || e.repeat || modal || scene || worldTalkOpen()) return; const k = e.key.toLowerCase(); if (k === ' ' || k === 'f') { e.preventDefault(); caveAttack(); } });
}
document.addEventListener('DOMContentLoaded', () => {
  const secrets = drawSecrets; drawSecrets = function () { secrets(); drawCaveLight(); };
  $('hudLayer')?.insertAdjacentHTML('beforeend', '<button id="caveAttackButton" class="sling-button cave-attack hidden" type="button" data-act="caveAttack">🔪 Facão</button>');
});
