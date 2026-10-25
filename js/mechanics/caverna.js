// Caverna da Serra: desce-se andar por andar, como numa mina. Em cada andar há bichos e lendas para enfrentar com o
// facão cuiudo do vô (Espaço ou F), pedras para quebrar (ametista, ágata e pinhão para recuperar a vida), às vezes um
// baú e a escada para o andar de baixo: aparece quando os bichos acabam ou embaixo de uma das pedras.
// Quanto mais fundo, mais brabo: javali e sanguanel em cima; boitatá, lobisomem e mula sem cabeça lá embaixo.
// No andar 10 está o baú do vô, com moedas, ametistas, uma figurinha e um bilhete dele. A corda do começo de cada andar sobe de volta à Serra;
// de fora, ela desce direto até os andares 5, 10, 15 e 20 já alcançados. Desmaiou: acorda na boca da gruta.
'use strict';

const CAVE = { cell: 80, cols: 22, rows: 14, door: { x: 1625, y: 400 }, maxHp: 100, heal: 20, deep: 10, stops: [1, 5, 10, 15, 20], start: [2, 11] };
const CAVE_BEASTS = {
  javali: { name: 'Javali', hp: 30, speed: 110, dmg: 14, r: 34, cash: [2, 4], from: 2, weight: 4 },
  sanguanel: { name: 'Sanguanel', hp: 18, speed: 160, dmg: 8, r: 22, cash: [1, 3], from: 2, weight: 3 },
  boitata: { name: 'Boitatá', hp: 40, speed: 90, dmg: 12, r: 30, cash: [3, 6], from: 5, weight: 2 },
  lobisomem: { name: 'Lobisomem', hp: 70, speed: 150, dmg: 20, r: 34, cash: [5, 9], from: 7, weight: 2 },
  mula: { name: 'Mula sem Cabeça', hp: 55, speed: 120, dmg: 18, r: 36, cash: [5, 8], from: 9, weight: 2 },
  teiniagua: { name: 'Teiniaguá', hp: 26, speed: 100, dmg: 9, r: 23, cash: [3, 5], from: 3, weight: 3, behavior: 'boitata' },
  onca: { name: 'Onça-parda', hp: 44, speed: 145, dmg: 16, r: 32, cash: [4, 7], from: 4, weight: 3, behavior: 'lobisomem' },
  anhanga: { name: 'Anhangá', hp: 60, speed: 125, dmg: 17, r: 32, cash: [5, 9], from: 6, weight: 2, behavior: 'javali' }
};
Object.assign(BAG_RAW, { ametista: { name: 'Ametista', icon: '◆', value: 12 }, agata: { name: 'Ágata', icon: '◆', value: 18 } });
// Minérios são negociados apenas com São Dunstano, no refúgio.
BAG_RAW.ametista.note = BAG_RAW.agata.note = 'São Dunstano compra no primeiro andar da caverna';

// ---------- Sons da caverna ----------
// Cada bicho tem a sua voz: o javali guincha, o sanguanel dá risadinha, o boitatá chia, o lobisomem rosna e uiva, a mula
// relincha. O facão faz baque de carne ou estalo de pedra; o Sadi geme quando apanha e o coração bate com pouca vida.
Object.assign(AudioEngine, {
  // Voz de bicho: a altura corre pelos pontos dados, com vibrato e um filtro de "boca".
  caveVoice(points, dur, { vol = .06, type = 'sawtooth', formant = 1200, q = 2, vib = 0, rate = 0, delay = 0 } = {}) {
    if (!this.on || !this.ctx || this.ctx.state !== 'running') return;
    const c = this.ctx, now = c.currentTime + delay, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(points[0], now); points.slice(1).forEach((p, i) => o.frequency.linearRampToValueAtTime(p, now + dur * (i + 1) / (points.length - 1)));
    if (vib) { const l = c.createOscillator(), d = c.createGain(); l.frequency.value = rate; d.gain.value = vib; l.connect(d); d.connect(o.frequency); l.start(now); l.stop(now + dur + .05); }
    f.type = 'bandpass'; f.frequency.value = formant; f.Q.value = q;
    g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(vol, now + .02); g.gain.setValueAtTime(vol, now + dur * .7); g.gain.exponentialRampToValueAtTime(.0001, now + dur);
    o.connect(f); f.connect(g); g.connect(this.out()); o.start(now); o.stop(now + dur + .05);
  },
  caveCry(kind, dead = false) {
    if (dead && typeof this.caveDeath === 'function') { this.caveDeath(kind); return; }
    if (kind === 'javali') { this.caveVoice([620, 1150, 820, 540], dead ? .55 : .2, { formant: 1400, q: 3, vol: .07, vib: 40, rate: 30 }); if (dead) this.caveVoice([170, 90], .4, { formant: 400, vol: .06, delay: .45 }); }
    else if (kind === 'sanguanel') { for (let i = 0; i < (dead ? 3 : 2); i++) this.caveVoice([1100 - i * 120, 1400 - i * 150], .07, { type: 'triangle', formant: 1500, q: 1, vol: .05, delay: i * .09 }); if (dead) this.caveVoice([1600, 300], .7, { type: 'sine', formant: 900, q: .7, vol: .05, delay: .27 }); }
    else if (kind === 'boitata') { this.hiss(dead ? .9 : .25, dead ? .1 : .06, 2400); this.pop(1800, .12, .04); if (dead) this.fireOut(); }
    else if (kind === 'lobisomem') { if (dead) this.caveVoice([320, 560, 600, 380], 1.3, { formant: 900, q: 1.5, vol: .07, vib: 12, rate: 6 }); else this.caveGrowl(.3, .08); }
    else if (kind === 'mula') this.caveVoice([520, 940, 780, 420], dead ? .8 : .35, { formant: 1300, q: 2.5, vol: .065, vib: 70, rate: 19 });
    else if (kind === 'teiniagua') { this.hiss(dead ? .5 : .2,.04,2600); this.note(dead ? 660 : 1320,.12,'sine',.035); }
    else if (kind === 'onca') this.caveGrowl(dead ? .7 : .25,.07);
    else if (kind === 'anhanga') this.caveVoice([420,620,350],dead ? .8 : .3,{type:'sine',formant:900,vol:.05,vib:8,rate:5});
  },
  caveGrowl(dur = .4, vol = .07) { this.caveVoice([95, 120, 85], dur, { formant: 500, q: 1.2, vol, vib: 25, rate: 23 }); this.noise(dur * .8, vol * .8, 300); },
  caveSnort() { this.noise(.16, .2, 650); this.note(130, .1, 'triangle', .06); setTimeout(() => this.noise(.12, .16, 800), 170); },
  caveFireball() { this.swoosh(.06); this.hiss(.35, .05, 1800); },
  caveGiggle() { for (let i = 0; i < 3; i++) this.caveVoice([1250 + i * 60, 1500 + i * 60], .06, { type: 'triangle', formant: 1600, q: 1, vol: .03, delay: i * .08 }); },
  caveFlesh() { this.note(105 + Math.random() * 25, .08, 'triangle', .14); this.pop(800 + Math.random() * 400, .2, .05); this.noise(.07, .12, 1600); },
  caveStone() { this.pop(3200 + Math.random() * 600, .18, .03); this.note(380, .05, 'square', .02); this.note(170, .07, 'triangle', .07); },
  caveCrumble() { this.noise(.35, .24, 550); this.note(65, .22, 'triangle', .13); [0, 50, 110, 170].forEach(t => setTimeout(() => this.pop(1200 + Math.random() * 1800, .1, .04), t)); },
  caveGem() { [1568, 2093, 2637, 3136].forEach((f, i) => { this.note(f, .3, 'sine', .05, i * .06); this.note(f * 2.01, .15, 'sine', .012, i * .06); }); },
  caveHeal() { this.gulp(); [784, 988, 1318].forEach((f, i) => this.note(f, .16, 'triangle', .045, .12 + i * .07)); },
  caveOuch() { this.punch(1.1); this.ouch(); this.note(70, .18, 'triangle', .1); },
  caveHeartbeat() { this.note(58, .12, 'sine', .16); this.note(52, .12, 'sine', .12, .16); },
  caveLadder() { this.scaleDone(); this.note(392, .3, 'triangle', .04, .25); },
  caveSteps() { [0, .16, .32, .48].forEach(t => this.note(90 + Math.random() * 20, .06, 'triangle', .09, t)); this.creak(); },
  caveChestOpen() { this.creak(); [659, 880, 1175, 1568].forEach((f, i) => this.note(f, .22, 'triangle', .05, .25 + i * .08)); setTimeout(() => this.coins(), 450); },
  caveFaintSound() { [392, 330, 262, 196].forEach((f, i) => this.note(f, .3, 'triangle', .06, i * .16)); this.note(60, .8, 'sine', .1, .6); },
  caveDrip() { this.bloop(1300 + Math.random() * 700, .022); }
});

let caveRun = null;
// O que rendeu a descida, da boca da gruta até subir de volta (aparece no canto e no saldo ao sair).
let caveTrip = null;
function caveTripStart() { const f = caveState().floor; caveTrip = { cash: 0, ametista: 0, agata: 0, kills: 0, cards: [], from: f, deepest: f }; return caveTrip; }
function caveTripNow() { return caveTrip || caveTripStart(); }
// Quadradinhos de achado (baú, saldo da descida e desmaio): ícone, quanto e o quê.
function caveLootTiles(t) {
  const l = []; if (t.cash) l.push(['<span class="bag-emoji">🪙</span>', money(t.cash), 'moedas']);
  for (const k of ['ametista', 'agata']) if (t[k]) l.push([bagIcon(k), t[k], BAG_RAW[k].name + (t[k] > 1 ? 's' : '')]);
  if (t.heal) l.push(['<span class="bag-emoji">❤️</span>', '+' + t.heal, 'de vida']);
  for (const c of t.cards || []) l.push(['<span class="bag-emoji">🃏</span>', cardDef(c).name, 'figurinha nova']);
  if (t.kills) l.push(['<span class="bag-emoji">🔪</span>', t.kills, t.kills === 1 ? 'bicho derrubado' : 'bichos derrubados']);
  return l;
}
function caveLootHTML(t) { const l = caveLootTiles(t); return l.length ? `<div class="bag-grid cave-loot">${l.map(([icon, big, small]) => `<div class="bag-item">${icon}<b>${big}</b><small>${small}</small></div>`).join('')}</div>` : ''; }
function caveState() { G.cave ??= { facao: false, floor: 1, deepest: 1, hp: CAVE.maxHp, vo: false }; G.cave.up ??= {}; return G.cave; }
// A gruta só aparece depois de aceitar procurar a Baia (ou pra quem já desceu nela antes).
function caveOpen() { return !!G.cave?.facao || ['active', 'done'].includes(missionState('baia')?.status); }
// Melhorias do facão, na ferraria de São Dunstano no primeiro andar.
const CAVE_UPGRADES = [
  { id: 'dash', name: 'Passo de esquiva', icon: '↗', cost: 160, desc: 'Libera o dash com Shift: invulnerável durante a esquiva, com 1,2 s de recarga.' },
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
// Dano de um golpe num bicho (a água benta de forja.js dobra contra as assombrações).
function caveHitDmg(b) { return caveDmg(); }
// Cor do rastro do golpe: a da arma na mão (forja.js).
function caveSwingColor() { return '255,248,220'; }
function inCave() { return worldOut?.map === 'caverna'; }
function caveRand(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const caveCenter = (cx, cy) => ({ x: (cx + .5) * CAVE.cell, y: (cy + .5) * CAVE.cell });

// ---------- Gerar o andar ----------
// Paredes em blocos, sempre com caminho do começo até todo canto; o mesmo andar no mesmo dia sai igual.
function buildCaveFloor(floor) {
  const R = caveRand(floor * 7919 + G.day * 104729 + 17), { cols, rows } = CAVE, [sx, sy] = CAVE.start;
  const grid = Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => x === 0 || y === 0 || x === cols - 1 || y === rows - 1 ? 1 : 0));
  if (floor === 1) return {
    floor, grid, rocks: [],
    beasts: [], drops: [], shots: [], ladder: { ...caveCenter(18, 4), shown: true },
    chest: null, swing: null, cd: 0, inv: 0, hurt: 0, t: 0, ladderPing: 0
  };
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
  for (let k = 0; k < nRocks; k++) { const c = takeCell(); if (!c) break; const p = caveCenter(...c), roll = R(); run.rocks.push({ x: p.x + (R() - .5) * 20, y: p.y + (R() - .5) * 20, hp: floor > 10 ? 4 : 3, loot: roll < .4 ? (floor > 10 ? 'agata' : 'ametista') : roll < .55 ? 'pinhao' : null }); }
  // A escada pode estar embaixo de uma pedra: quebrou, achou.
  if (run.rocks.length && R() < .45) { const r = run.rocks[Math.floor(R() * run.rocks.length)]; Object.assign(run.ladder, { x: r.x, y: r.y }); r.ladder = true; }
  const kinds = Object.entries(CAVE_BEASTS).filter(([, b]) => b.from <= floor), total = kinds.reduce((n, [, b]) => n + b.weight, 0);
  for (let k = 0; k < Math.min(3 + floor, 10); k++) {
    const c = takeCell(6); if (!c) break; let roll = R() * total, kind = kinds[0][0]; for (const [id, b] of kinds) { roll -= b.weight; if (roll <= 0) { kind = id; break; } }
    const B = CAVE_BEASTS[kind], hp = Math.round(B.hp * (1 + Math.max(0, floor - B.from) * .08) * (floor > 10 ? 1.3 : 1)), p = caveCenter(...c);
    run.beasts.push({ kind, x: p.x, y: p.y, hp, max: hp, dx: R() < .5 ? -1 : 1, state: 'roam', t: R() * 2, vx: 0, vy: 0, hurt: 0, frame: 0 });
  }
  if (floor === CAVE.deep && !caveState().vo) { const c = takeCell(8); if (c) run.chest = { ...caveCenter(...c), vo: true, open: false }; }
  else if (floor > 1 && R() < .35) { const c = takeCell(5); if (c) run.chest = { ...caveCenter(...c), vo: false, open: false }; }
  return run;
}
// O andar guarda o que o Sadi fez nele até o dia seguinte: bicho derrubado não volta, pedra quebrada não se refaz e baú
// aberto fica aberto. Subir e descer de novo no mesmo dia não enche a caverna outra vez.
function caveDayFloor(floor) { const st = caveState(); if (st.today?.day !== G.day) st.today = { day: G.day, floors: {} }; return st.today.floors[floor] ??= { beasts: [], rocks: [], chest: false }; }
function caveApplyDay(run) {
  run.beasts.forEach((b, i) => { b.idx = i; }); run.rocks.forEach((r, i) => { r.idx = i; }); if (run.floor < 2) return run;
  const d = caveDayFloor(run.floor);
  for (const i of d.beasts) if (run.beasts[i]) run.beasts[i].hp = 0;
  for (const i of d.rocks) { const r = run.rocks[i]; if (!r) continue; r.hp = 0; if (r.ladder) run.ladder.shown = true; }
  if (d.chest && run.chest) run.chest.open = true;
  if (run.beasts.length && run.beasts.every(b => b.hp <= 0)) run.ladder.shown = true;
  return run;
}
function caveFloorRun() { const st = caveState(); if (!caveRun || caveRun.floor !== st.floor || caveRun.day !== G.day) { caveRun = caveApplyDay(buildCaveFloor(st.floor)); caveRun.day = G.day; } return caveRun; }
function caveWall(x, y) { const cx = Math.floor(x / CAVE.cell), cy = Math.floor(y / CAVE.cell); return caveFloorRun().grid[cy]?.[cx] !== 0; }
function caveFree(x, y, pad = 30) { if (caveWall(x, y)) return false; for (const r of caveFloorRun().rocks) if (r.hp > 0 && Math.hypot(r.x - x, r.y - y) < pad) return false; return true; }

// One foot collider for walking, knockback and dash. A center-point check used
// by the old knockback could put the player inside the walking collider's wall.
const CAVE_PLAYER_RADIUS = 16;
const CAVE_DASH = { duration:.22, speed:900, cooldown:1.2 };
function cavePlayerFree(x,y) {
  const cy=y-10,r=CAVE_PLAYER_RADIUS,C=CAVE.cell,run=caveFloorRun();
  for(let row=Math.floor((cy-r)/C);row<=Math.floor((cy+r)/C);row++)
    for(let col=Math.floor((x-r)/C);col<=Math.floor((x+r)/C);col++) {
      if(run.grid[row]?.[col]===0)continue;
      const nx=clamp(x,col*C,(col+1)*C),ny=clamp(cy,row*C,(row+1)*C);
      if((x-nx)**2+(cy-ny)**2<r*r)return false;
    }
  return !run.rocks.some(rock=>rock.hp>0&&Math.hypot(x-rock.x,cy-(rock.y-8))<r+22);
}
function caveUnstickPlayer() {
  const p=worldOut;if(worldCanWalk(p.x,p.y))return false;
  // Only repair invalid positions, including saves made against old walls.
  for(let radius=4;radius<=160;radius+=4)for(let n=0;n<32;n++) {
    const angle=n*Math.PI/16,x=p.x+Math.cos(angle)*radius,y=p.y+Math.sin(angle)*radius;
    if(worldCanWalk(x,y)){p.x=x;p.y=y;return true;}
  }
  Object.assign(p,worldMap().spawn());return true;
}
function caveMovePlayer(dx,dy) {
  const p=worldOut; caveUnstickPlayer();const oldX=p.x,oldY=p.y;
  // Small swept steps keep even a dash or a long frame from crossing a wall.
  const count=Math.max(1,Math.ceil(Math.hypot(dx,dy)/4)),sx=dx/count,sy=dy/count;
  for(let n=0;n<count;n++) {
    if(worldCanWalk(p.x+sx,p.y))p.x+=sx;
    if(worldCanWalk(p.x,p.y+sy))p.y+=sy;
  }
  return Math.hypot(p.x-oldX,p.y-oldY);
}
function caveDash() {
  if(caveDefeatActive())return false;
  if(!inCave()||!started||paused||modal||scene||phoneOpen||worldTalkOpen()||G.game||G.bocce||G.penalties)return false;
  if(!caveUp('dash')){floatNote('Compre o Passo de esquiva com São Dunstano no primeiro andar.');return false;}
  const run=caveFloorRun(),p=worldOut;if(run.dash||(run.dashCd||0)>0)return false;
  let dx=Number(keys.has('d')||keys.has('ArrowRight'))-Number(keys.has('a')||keys.has('ArrowLeft'));
  let dy=Number(keys.has('s')||keys.has('ArrowDown'))-Number(keys.has('w')||keys.has('ArrowUp'));
  if(!dx&&!dy){dx=p.dx||0;dy=p.dy||0;}if(!dx&&!dy)dy=1;
  const length=Math.hypot(dx,dy);dx/=length;dy/=length;caveUnstickPlayer();
  run.dash={t:CAVE_DASH.duration,dx,dy};run.dashCd=CAVE_DASH.cooldown;run.swing=null;
  p.dx=dx;p.dy=dy;AudioEngine.swoosh(.07);caveUpdateControls();return true;
}
function cavePlayerTick(dt) {
  if(caveDefeatActive())return;
  if(paused||modal||scene||phoneOpen)return;
  const p=worldOut,run=caveFloorRun();caveUnstickPlayer();
  run.dashTrail=(run.dashTrail||[]).filter(t=>(t.life-=dt)>0);
  if(run.dash) {
    const d=run.dash,time=Math.min(Math.max(0,d.t),dt);
    if(time>0)run.dashTrail.push({x:p.x,y:p.y,life:.16});
    p.walk=caveMovePlayer(d.dx*CAVE_DASH.speed*time,d.dy*CAVE_DASH.speed*time)>.01;
    p.dx=d.dx;p.dy=d.dy;d.t-=dt;return;
  }
  let dx=Number(keys.has('d')||keys.has('ArrowRight'))-Number(keys.has('a')||keys.has('ArrowLeft'));
  let dy=Number(keys.has('s')||keys.has('ArrowDown'))-Number(keys.has('w')||keys.has('ArrowUp'));
  const length=Math.hypot(dx,dy);p.walk=false;if(!length)return;
  dx/=length;dy/=length;p.dx=dx;p.dy=dy;
  const step=BASE_SPEED*1.4*(1+movementBonus())*dt;
  p.walk=caveMovePlayer(dx*step,dy*step)>.01;
}
function caveUpdateControls() {
  const visible=inCave(),run=visible?caveFloorRun():null,btn=$('caveDashButton');
  $('caveAttackButton')?.classList.toggle('hidden',!visible);
  if(!btn)return;btn.classList.toggle('hidden',!visible||!caveUp('dash'));
  const cooldown=run?.dashCd||0;btn.disabled=!visible||!caveUp('dash')||!!run?.dash||cooldown>0;
  btn.textContent=run?.dash?'Dash · invulnerável':cooldown>0?'Dash · '+cooldown.toFixed(1)+'s':'Shift · Dash';
}
function drawCaveDash() {
  const run=caveFloorRun();ctx.save();
  for(const t of run.dashTrail||[]){ctx.globalAlpha=t.life/.16*.45;ellipse(t.x,t.y-8,20,9,'#a9eaff');}
  if(run.dash){ctx.globalAlpha=.65;ctx.strokeStyle='#b8f1ff';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(worldOut.x,worldOut.y-10,26,12,0,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
}

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
      ['dica', '<b>Espaço</b> ou <b>F</b>: golpe de facão (no celular, o botão Facão).<br><b>E</b>: escada, baú e corda.<br>São Dunstano te recebe no primeiro andar: compra teus minérios e vende melhorias, inclusive o dash. Ametistas aparecem do andar 2 ao 10; depois vêm as ágatas. Pinhão recupera a vida. A escada aparece quando os bichos acabam ou embaixo de uma pedra.', 'Como funciona a caverna']], () => { st.facao = true; save(); enterCave(1); }, 'Descer');
    return;
  }
  const stops = CAVE.stops.filter(n => n <= st.deepest);
  if (stops.length < 2) { enterCave(1); return; }
  openDialog('Caverna da Serra', `<p>A corda do vô desce direto até os andares que você já alcançou. Mais fundo: andar <b>${st.deepest}</b>.</p><div class="actions">${stops.map(n => `<button class="${n === stops[stops.length - 1] ? 'primary' : ''}" data-act="caveGo" data-id="${n}">Andar ${n}</button>`).join('')}<button data-act="close">Ficar aqui fora</button></div>`, 'caveStops');
}
function enterCave(floor) {
  const st = caveState(); closeDialog(true); st.floor = Math.max(1, Number(floor) || 1); st.hp = Math.max(st.hp, caveMaxHp()); caveRun = null;
  worldOut.back = { map: 'serra', x: CAVE.door.x, y: CAVE.door.y + 70 }; caveTripStart();
  const s = caveCenter(...CAVE.start); switchMap({ map: 'caverna', x: s.x, y: s.y, title: 'Caverna da Serra · andar ' + st.floor }); AudioEngine.caveSteps(); save();
}
function caveDescend() {
  const st = caveState(), run = caveFloorRun(); if (!run.ladder.shown) return;
  st.floor++; st.deepest = Math.max(st.deepest, st.floor); st.hp = Math.min(caveMaxHp(), st.hp + CAVE.heal); caveRun = null; const t = caveTripNow(); t.deepest = Math.max(t.deepest, st.floor);
  const s = caveCenter(...CAVE.start); switchMap({ map: 'caverna', x: s.x, y: s.y, title: 'Andar ' + st.floor + (st.floor === CAVE.deep && !st.vo ? ' · tem coisa do vô por aqui' : '') });
  AudioEngine.caveSteps(); save();
}
// Subiu pela corda: o saldo da descida, se rendeu alguma coisa.
function caveLeave(text, quiet = false) {
  const st = caveState(), t = caveTrip; st.hp = caveMaxHp(); caveRun = null; caveTrip = null; $('caveAttackButton')?.classList.add('hidden');$('caveDashButton')?.classList.add('hidden');
  switchMap({ map: 'serra', x: CAVE.door.x, y: CAVE.door.y + 70, title: text || 'Serra Gaúcha' }); save();
  if (!quiet && t && caveLootTiles(t).length) { AudioEngine.coins(); talk([['card', `<b>🪢 De volta à Serra</b><br>${t.deepest > t.from ? 'Desceu do andar ' + t.from + ' até o ' + t.deepest : 'Explorou o andar ' + t.from}. Trouxe:${caveLootHTML(t)}`, 'Saldo da descida']], null, 'Beleza'); }
  return t;
}
function caveFaint() {
  beginCaveDefeat();
}
function caveRecover(lost) {
  caveState().floor = 1; const t = caveLeave('Serra Gaúcha', true), kept = t ? caveLootHTML(t) : '';
  talk([['card', `<b>😵 Desmaiou na caverna</b><br>Acordou na boca da gruta, com a cabeça doendo e o bolso mais leve (−${money(lost)}). Dizem que foi o Badin que te puxou pela corda.${kept ? '<br>O que você achou lá embaixo ficou com você:' + kept : ''}`, 'Caverna da Serra'], ['badin', 'Ô, Sadi! Lá embaixo não é lugar de ir com a barriga vazia, capaz!']], null, 'Levantar');
}

// ---------- Facão ----------
function caveAttack() {
  if(caveDefeatActive())return;
  if (!inCave() || paused || phoneOpen || modal || scene || worldTalkOpen()) return;
  const run = caveFloorRun(), p = worldOut; if (run.cd > 0 || run.dash) return;
  run.cd = caveCd(); const ang = Math.atan2(p.dy || 0, p.dx || (p.dy ? 0 : 1)); run.swing = { t: .2, ang };
  AudioEngine.swoosh(.08); let flesh = false, stone = false;
  const inArc = (x, y, reach) => { const d = Math.hypot(x - p.x, y - (p.y - 30)); if (d > reach) return false; const a = Math.atan2(y - (p.y - 30), x - p.x); return Math.abs(Math.atan2(Math.sin(a - ang), Math.cos(a - ang))) < 1.25 || d < 40; };
  for (const b of run.beasts) if (b.hp > 0 && inArc(b.x, b.y - 20, caveReach())) {
    const dmg = caveHitDmg(b); b.hp -= dmg; b.hurt = .18; const d = Math.hypot(b.x - p.x, b.y - p.y) || 1; caveMove(b, (b.x - p.x) / d * 60, (b.y - p.y) / d * 60);
    if (b.state === 'charge' || b.state === 'lunge') b.state = 'rest', b.t = .5;
    // Acertou: baque, o grito do bicho, faísca do facão e uma travadinha na tela (só um grito por golpe).
    if (!flesh) { AudioEngine.caveFlesh(); AudioEngine.caveCry(b.kind, b.hp <= 0); }
    flesh = true; run.freeze = .06; fxStars(b.x, b.y - 50, 3);
    effect('−' + dmg, b.x + (Math.random() - .5) * 20, b.y - 80, dmg > caveDmg() ? '#a8e0ff' : '#ffd2a0', dmg > caveDmg() ? 25 : 21); if (b.hp <= 0) caveKill(b);
  }
  for (const r of run.rocks) if (r.hp > 0 && inArc(r.x, r.y - 10, caveReach() - 15)) { stone = true; r.hp--; fxPuffs(r.x, r.y - 20, 3, 50, '#8a7d70'); if (r.hp <= 0) caveBreak(r); }
  if (stone) AudioEngine.caveStone();
}
function caveKill(b) {
  if (b.idx != null) caveDayFloor(caveFloorRun().floor).beasts.push(b.idx);
  const run = caveFloorRun(), B = CAVE_BEASTS[b.kind], [lo, hi] = B.cash, cash = lo + Math.floor(Math.random() * (hi - lo + 1)) + Math.floor(run.floor / 4);
  run.drops.push({ x: b.x, y: b.y, k: 'moeda', q: cash }); if (Math.random() < .12) run.drops.push({ x: b.x + 20, y: b.y + 8, k: 'pinhao', q: 1 });
  const smoke = { boitata: '#ff9a40', sanguanel: '#b8a8d8', lobisomem: '#5a4a3a', mula: '#ffb060' }[b.kind] || '#8a7a6a';
  fxPuffs(b.x, b.y - 30, 12, 140, smoke); effect(B.name + ' derrubado!', b.x, b.y - 110, '#d8ffac', 18); G.stats.caveKills = (G.stats.caveKills || 0) + 1; caveState().killsTotal = (caveState().killsTotal || 0) + 1; caveTripNow().kills++;
  caveReveal();
}
const CAVE_ROCK_LOOT = { ametista: 'Ametista!', agata: 'Ágata!', pinhao: 'Pinhão: recupera a vida' };
function caveBreak(r) {
  const run = caveFloorRun(); if (r.idx != null) caveDayFloor(run.floor).rocks.push(r.idx); AudioEngine.caveCrumble(); fxPuffs(r.x, r.y - 16, 9, 110, '#8a7d70');
  for (let i = 0; i < 8; i++) fxAdd('shard', r.x, r.y - 14, { vx: fxRand(-170, 170), vy: fxRand(-220, -80), g: 640, life: fxRand(.6, 1), size: fxRand(4, 8), vr: fxRand(-14, 14), floor: r.y + fxRand(2, 18), color: pick(['#6a5e52', '#7d7064', '#54473a']) });
  if (r.loot) { run.drops.push({ x: r.x, y: r.y, k: r.loot, q: 1 }); if (r.loot === 'pinhao') effect(CAVE_ROCK_LOOT.pinhao, r.x, r.y - 60, '#d8ffac', 17); else AudioEngine.caveGem(); }
  if (r.ladder) { run.ladder.shown = true; run.ladderPing = 2.5; AudioEngine.caveLadder(); effect('Uma escada embaixo da pedra!', r.x, r.y - 90, '#fff2b0', 18); }
}
// Sem bicho no andar, a escada aparece.
function caveReveal() { const run = caveFloorRun(); if (!run.ladder.shown && run.beasts.every(b => b.hp <= 0)) { run.ladder.shown = true; run.ladderPing = 2.5; AudioEngine.caveLadder(); const { x, y } = run.ladder; effect('A escada pro andar de baixo!', x, y - 70, '#fff2b0', 18); for (const r of run.rocks) if (r.ladder) r.ladder = false; } }
function caveHurt(dmg, from) {
  if(typeof caveDefeatActive==='function'&&caveDefeatActive())return;
  const run = caveFloorRun(), st = caveState(); if (run.floor === 1 || run.inv > 0 || run.dash) return;
  if(run.floor>10)dmg=Math.ceil(dmg*1.25);
  if (from.kind) from.attack = .35;
  st.hp = Math.max(0, st.hp - dmg); run.inv = .9; run.hurt = .3; run.shake = .3; AudioEngine.caveOuch();
  effect('−' + dmg, worldOut.x, worldOut.y - 130, '#ff8a7a', 24);
  const d = Math.hypot(worldOut.x - from.x, worldOut.y - from.y) || 1;
  caveMovePlayer((worldOut.x-from.x)/d*60,(worldOut.y-from.y)/d*60);
  if (st.hp <= 0) caveFaint();
}
// Anda com colisão nas paredes e pedras; devolve falso se bateu.
function caveMove(b, dx, dy) { let ok = true; if (caveFree(b.x + dx, b.y, 26)) b.x += dx; else ok = false; if (caveFree(b.x, b.y + dy, 26)) b.y += dy; else ok = false; return ok; }

// ---------- Bichos ----------
function caveTick(dt) {
  if(caveDefeatActive())return;
  if(paused||modal||scene||phoneOpen)return;
  const run = caveFloorRun(), p = worldOut, st = caveState(), t = caveTripNow(); run.t += dt; run.cd = Math.max(0, run.cd - dt); run.inv = Math.max(0, run.inv - dt); run.hurt = Math.max(0, run.hurt - dt);
  run.dashCd=Math.max(0,(run.dashCd||0)-dt);
  run.shake = Math.max(0, (run.shake || 0) - dt); run.ladderPing = Math.max(0, (run.ladderPing || 0) - dt);
  if (run.swing && (run.swing.t -= dt) <= 0) run.swing = null;
  // Pouca vida: o coração bate forte. De vez em quando, uma gota pinga do teto.
  if (st.hp <= caveMaxHp() * .3) { run.beat = (run.beat ?? 0) - dt; if (run.beat <= 0) { run.beat = .85; AudioEngine.caveHeartbeat(); } }
  run.drip = (run.drip ?? 2) - dt; if (run.drip <= 0) { run.drip = 2.5 + Math.random() * 4; AudioEngine.caveDrip(); }
  if (run.freeze > 0) run.freeze -= dt;
  else {
    for (const b of run.beasts) { if (b.hp > 0) caveBeastTick(b, dt, run, p); if(caveDefeatActive())return; }
    for (const s of run.shots) { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; if (caveWall(s.x, s.y)) s.life = 0; else if (Math.hypot(s.x - p.x, s.y - (p.y - 40)) < 30) { s.life = 0; caveHurt(s.dmg, s); } if(caveDefeatActive())return; }
    run.shots = run.shots.filter(s => s.life > 0);
  }
  for (const d of run.drops) if (!d.got && Math.hypot(d.x - p.x, d.y - p.y) < 46) {
    d.got = true;
    if (d.k === 'moeda') { G.cash = round(G.cash + d.q); t.cash += d.q; effect('+' + money(d.q), d.x, d.y - 50, '#ffe27a', 18); AudioEngine.coins(); }
    else if (d.k === 'pinhao') { st.hp = Math.min(caveMaxHp(), st.hp + 15); effect('+15 ❤ pinhão', d.x, d.y - 50, '#d8ffac', 18); fxHearts(p.x, p.y - 120, 2); AudioEngine.caveHeal(); }
    else { bagAdd(d.k, d.q); t[d.k] = (t[d.k] || 0) + d.q; effect('+' + d.q + ' ' + BAG_RAW[d.k].name.toLowerCase(), d.x, d.y - 50, '#e8d0ff', 18); AudioEngine.caveGem(); }
  }
  run.drops = run.drops.filter(d => !d.got);
  if(run.dash?.t<=0)run.dash=null;
  caveUpdateControls();
}
function caveBeastTick(b, dt, run, p) {
  const B = CAVE_BEASTS[b.kind], dxp = p.x - b.x, dyp = p.y - b.y, dist = Math.hypot(dxp, dyp) || 1;
  const behavior = B.behavior || b.kind; b.attack = Math.max(0, (b.attack || 0) - dt);
  b.hurt = Math.max(0, b.hurt - dt); b.t -= dt; b.frame += dt * 8; if (Math.abs(dxp) > 6 && !['charge', 'lunge'].includes(b.state)) b.dx = dxp < 0 ? -1 : 1;
  const toward = sp => caveMove(b, dxp / dist * sp * dt, dyp / dist * sp * dt);
  const roam = () => { if (b.t <= 0) { const a = Math.random() * Math.PI * 2; b.vx = Math.cos(a); b.vy = Math.sin(a); b.t = 1 + Math.random() * 1.5; } if (!caveMove(b, b.vx * B.speed * .5 * dt, b.vy * B.speed * .5 * dt)) b.t = 0; if (Math.abs(b.vx) > .2) b.dx = b.vx < 0 ? -1 : 1; };
  if (behavior === 'javali' || behavior === 'mula') {
    if (b.state === 'roam') { roam(); if (dist < 360) { b.state = 'windup'; b.t = b.kind === 'mula' ? .45 : .6; AudioEngine.caveSnort(); } }
    else if (b.state === 'windup') { if (b.t <= 0) { b.state = 'charge'; b.t = .75; b.vx = dxp / dist; b.vy = dyp / dist; b.dx = b.vx < 0 ? -1 : 1; } }
    else if (b.state === 'charge') { const sp = b.kind === 'mula' ? 480 : 420; if (!caveMove(b, b.vx * sp * dt, b.vy * sp * dt) || b.t <= 0) { b.state = 'rest'; b.t = .7; } }
    else if (b.t <= 0) b.state = 'roam';
  } else if (behavior === 'sanguanel') {
    toward(B.speed * (.7 + .3 * Math.sin(run.t * 6 + b.x)));
    if (b.t <= 0) { b.t = 3 + Math.random() * 1.5; for (let k = 0; k < 8; k++) { const a = Math.random() * Math.PI * 2, nx = p.x + Math.cos(a) * 170, ny = p.y + Math.sin(a) * 130; if (caveFree(nx, ny, 26)) { fxPuffs(b.x, b.y - 20, 6, 40, '#b8a8d8'); b.x = nx; b.y = ny; AudioEngine.caveGiggle(); break; } } }
  } else if (behavior === 'boitata') {
    if (dist < 220) toward(-B.speed); else if (dist > 320) toward(B.speed); else roam();
    if (b.t <= 0 && dist < 520) { b.t = 2.6; b.attack = .4; const sp = 260; run.shots.push({ x: b.x, y: b.y - 30, vx: dxp / dist * sp, vy: (dyp - 30) / dist * sp, life: 2.6, dmg: B.dmg }); AudioEngine.caveFireball(); }
  } else if (behavior === 'lobisomem') {
    if (b.state === 'lunge') { if (!caveMove(b, b.vx * 380 * dt, b.vy * 380 * dt) || b.t <= 0) { b.state = 'rest'; b.t = 1.1; } }
    else if (b.state === 'rest') { if (b.t <= 0) b.state = 'chase'; }
    else { toward(dist < 520 ? B.speed : 0); if (dist < 170 && b.t <= 0) { b.state = 'lunge'; b.t = .35; b.vx = dxp / dist; b.vy = dyp / dist; AudioEngine.caveGrowl(.35, .08); } }
  }
  if (Math.hypot(p.x - b.x, (p.y - 30) - (b.y - 20)) < B.r + 22) caveHurt(B.dmg, b);
}

// ---------- Baús ----------
// Abriu: a tampa range e uma janela mostra tudo o que tinha dentro.
function caveChestLoot(loot) {
  const t = caveTripNow(), st = caveState(); G.cash = round(G.cash + loot.cash); t.cash += loot.cash;
  for (const k of ['ametista', 'agata']) if (loot[k]) { bagAdd(k, loot[k]); t[k] = (t[k] || 0) + loot[k]; }
  if (loot.heal) st.hp = Math.min(caveMaxHp(), st.hp + loot.heal);
  loot.cards = (loot.cards || []).filter(c => giveCard(c, 'caverna')); t.cards.push(...loot.cards); return loot;
}
function caveChest() {
  const run = caveFloorRun(), c = run.chest; if (!c || c.open) return; c.open = true; caveDayFloor(run.floor).chest = true; AudioEngine.caveChestOpen(); fxStars(c.x, c.y - 50, 6);
  if (c.vo) {
    caveState().vo = true; const card = randomLooseCard(), loot = caveChestLoot({ cash: 120, ametista: 3, cards: card ? [card] : [] }); save();
    talk([['card', `<b>🧰 O baú do vô</b><br>Lá no fundo da caverna, um baú de couro com as iniciais do vô gravadas na tampa. Dentro, moedas antigas, ametistas${loot.cards.length ? ', uma figurinha' : ''} e um bilhete.${caveLootHTML(loot)}<i>“Se tu chegou até aqui, guri, é porque tem coragem. Agora sobe, que a bodega não abre sozinha.”</i>`, 'Andar ' + run.floor],
      ['sadi', 'Bah, vô… até aqui embaixo tu deixou recado.']], null, 'Guardar');
    return;
  }
  const gem = run.floor > 10 ? 'agata' : 'ametista', card = Math.random() < .5 ? randomLooseCard() : null;
  const loot = caveChestLoot({ cash: 10 + Math.floor(Math.random() * 21) + Math.round(run.floor * 1.5), [gem]: 1 + (Math.random() < .3 ? 1 : 0), heal: Math.random() < .35 ? 25 : 0, cards: card ? [card] : [] }); save();
  talk([['card', `<b>🧰 Baú do andar ${run.floor}</b><br>Um baú velho de tropeiro, meio enterrado na pedra. Dentro tinha:${caveLootHTML(loot)}${loot.heal ? '<small>Tinha um cantil de água fresca: +' + loot.heal + ' de vida.</small>' : ''}`, 'Achou um baú']], null, 'Guardar');
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
  if (b.hp < b.max) { txt(CAVE_BEASTS[b.kind].name, b.x, b.y - 114, 11, '#ffe2a6'); rect(b.x - 26, b.y - 104, 52, 6, '#1a1008', 2); rect(b.x - 26, b.y - 104, 52 * b.hp / b.max, 6, '#e86a4a', 2); }
}
function drawCaveSwing() {
  const s = caveFloorRun().swing, p = worldOut; if (!s) return;
  const k = 1 - s.t / .2, a0 = s.ang - 1.2 + k * 2.4;
  ctx.save(); ctx.translate(p.x, p.y - 40); ctx.strokeStyle = `rgba(${caveSwingColor()},${.75 * (1 - k)})`; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, 78, s.ang - 1.2, a0); ctx.stroke();
  if (typeof EXPANSION_ART === 'undefined' || !expansionImage('sadi-combat-v1')?.naturalWidth) {
    ctx.rotate(a0); rect(30, -4, 58, 8, '#d8d8e0', 3, '#5a5a66'); rect(14, -5, 18, 10, '#6a3a1a', 3);
  }
  ctx.restore();
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
  const p = worldOut, run = caveFloorRun(), st = caveState(), open = run.floor === 1 || run.torch;
  const ambient = typeof environmentCaveReady === 'function' && environmentCaveReady() && run.floor > 1 ? .78 : .92;
  darkHole(p.x, p.y - 40, open ? 600 : caveUp('lampiao') ? 160 : 90, open ? 1800 : caveUp('lampiao') ? 820 : 560, '8,6,4', ambient);
  // No escuro, o que interessa brilha de longe: a escada, o baú fechado e as pedras caídas.
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (run.ladder.shown) glow(run.ladder.x, run.ladder.y - 20, 90 + run.ladderPing * 40, .2 + .08 * Math.sin(frameClock * 3), '255,220,140');
  if (run.chest && !run.chest.open) glow(run.chest.x, run.chest.y - 20, 70, .14 + .06 * Math.sin(frameClock * 2.4), '255,200,90');
  for (const d of run.drops) { const c = typeof caveOreGlow === 'function' ? caveOreGlow(d.k) : d.k === 'ametista' ? '190,140,255' : d.k === 'agata' ? '255,170,90' : null; if (c) glow(d.x, d.y - 12, 34, .35, c); }
  ctx.restore();
  // Escada longe: uma setinha do lado do Sadi aponta o caminho.
  const ld = run.ladder, far = Math.hypot(ld.x - p.x, ld.y - p.y);
  if (ld.shown && far > 380) {
    const a = Math.atan2(ld.y - p.y, ld.x - p.x), r = 100 + Math.sin(frameClock * 6) * 7, ax = p.x + Math.cos(a) * r, ay = p.y - 50 + Math.sin(a) * r;
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(a); ctx.fillStyle = '#ffcf5a'; ctx.strokeStyle = '#3a2414'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(-4, -16); ctx.lineTo(-4, -7); ctx.lineTo(-18, -7); ctx.lineTo(-18, 7); ctx.lineTo(-4, 7); ctx.lineTo(-4, 16); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
    txt('escada', ax, ay + 28, 12, '#ffe2a6');
  }
  if (run.hurt > 0) { ctx.fillStyle = `rgba(200,30,20,${run.hurt})`; ctx.fillRect(p.x - 3000, p.y - 3000, 6000, 6000); }
  const dpr = canvas.width / Math.max(1, canvas.clientWidth), W = canvas.clientWidth, H = canvas.clientHeight, X = W - 264; ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (st.hp <= caveMaxHp() * .3) darkHole(W / 2, H / 2, Math.min(W, H) * .3, Math.max(W, H) * .7, '180,10,10', .42 + .16 * Math.sin(frameClock * 7));
  const left = run.beasts.filter(b => b.hp > 0).length, t = caveTripNow(), got = [t.cash ? '🪙 ' + money(t.cash) : '', t.ametista ? '💜 ' + t.ametista : '', t.agata ? '🟠 ' + t.agata : '', ...['cobre', 'ferro', 'opala', 'ouro'].map(k => t[k] ? k + ' ' + t[k] : ''), t.cards.length ? '🃏 ' + t.cards.length : ''].filter(Boolean).join('  ');
  rect(X, 14, 250, 84, 'rgba(20,14,10,.82)', 8, '#a77439'); txt('Caverna da Serra · andar ' + run.floor, X + 12, 34, 14, '#ffe2a6', 'left', 'Georgia', false);
  rect(X + 12, 46, 160, 14, '#2a1608', 5); rect(X + 12, 46, 160 * Math.min(1, st.hp / caveMaxHp()), 14, st.hp > caveMaxHp() * .3 ? '#d84a3a' : '#ff7a3a', 5); txt('❤ ' + st.hp + '/' + caveMaxHp(), X + 178, 57, 12, '#ffe2a6', 'left', 'Arial', false);
  txt(left ? left + (left === 1 ? ' bicho' : ' bichos') : run.ladder.shown ? 'andar limpo · ache a escada' : 'andar limpo', X + 12, 72, 11, '#d9c79f', 'left', 'Arial', false);
  txt(got ? 'Nesta descida: ' + got : 'Nesta descida: nada ainda', X + 12, 89, 11, got ? '#ffe27a' : '#a8977a', 'left', 'Arial', false);
  ctx.restore();
}

WORLD_MAPS.caverna = {
  id: 'caverna', name: 'Caverna da Serra', indoor: true, W: CAVE.cols * CAVE.cell, H: CAVE.rows * CAVE.cell,
  spawn() { return caveCenter(...CAVE.start); },
  canWalk(x, y) { return inCave() ? cavePlayerFree(x,y) : true; },
  edge() { return null; },
  onEnter() { caveRun = null; caveFloorRun(); },
  hint() { if (worldNearest()) return null; return 'Andar ' + caveState().floor + ' · <strong>Espaço/F</strong> facão' + (caveUp('dash')?' · <strong>Shift</strong> dash':' · esquiva à venda com São Dunstano'); },
  spots() {
    const run = caveFloorRun(), s = caveCenter(...CAVE.start), list = [{ id: 'cave:rope', x: s.x, y: s.y - 40, radius: 70, label: 'Subir pela corda (sair da caverna)', act: () => caveLeave() }];
    if (run.ladder.shown) list.push({ id: 'cave:ladder', x: run.ladder.x, y: run.ladder.y, radius: 70, label: 'Descer a escada · andar ' + (run.floor + 1), act: caveDescend });
    if (run.chest && !run.chest.open) list.push({ id: 'cave:chest', x: run.chest.x, y: run.chest.y + 10, radius: 70, label: run.chest.vo ? 'Abrir o baú do vô' : 'Abrir o baú', act: caveChest });
    return list;
  },
  draw(view, seen, layers) {
    const run = caveFloorRun(), s = caveCenter(...CAVE.start); drawCaveFloor(view);
    // Include the overhang and screen shake; keep the original depth-sort order.
    const C=CAVE.cell,pad=12,x0=Math.max(0,Math.floor((view.x-pad)/C)),x1=Math.min(CAVE.cols-1,Math.floor((view.x+view.w+pad)/C)),y0=Math.max(0,Math.floor((view.y-pad)/C)),y1=Math.min(CAVE.rows-1,Math.floor((view.y+view.h+26+pad)/C));
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(run.grid[y][x])layers.push({y:y*C+C-30,draw:()=>drawCaveWall(x,y,run)});
    layers.push({ y: s.y - 70, draw: () => drawCaveRope(s.x, s.y - 30) });
    if (run.ladder.shown) layers.push({ y: run.ladder.y - 40, draw: () => drawCaveLadder(run.ladder) });
    for (const r of run.rocks) if (r.hp > 0) layers.push({ y: r.y, draw: () => drawCaveRock(r) });
    if (run.chest) layers.push({ y: run.chest.y, draw: () => drawCaveChest(run.chest) });
    for (const d of run.drops) layers.push({ y: d.y - 30, draw: () => drawCaveDrop(d) });
    for (const b of run.beasts) if (b.hp > 0) layers.push({ y: b.y, draw: () => drawCaveBeast(b) });
    layers.push({y:worldOut.y-1,draw:drawCaveDash});
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
  const begin = beginOutside; beginOutside = function (M) { const view = begin(M), k = inCave() ? (caveRun?.shake || 0) * 34 : 0; if (k) ctx.translate((Math.random() - .5) * k, (Math.random() - .5) * k); return view; };
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (inCave() && !modal && !scene) caveTick(dt); else if(!inCave())caveUpdateControls(); };
  document.addEventListener('keydown', e => { if (!inCave() || e.repeat || modal || scene || worldTalkOpen() || ['INPUT','SELECT','TEXTAREA'].includes(e.target?.tagName)) return; const k = e.key.toLowerCase(); if (k === 'shift') { e.preventDefault();caveDash(); } else if (k === ' ' || k === 'f') { e.preventDefault(); caveAttack(); } });
}
document.addEventListener('DOMContentLoaded', () => {
  const secrets = drawSecrets; drawSecrets = function () { secrets(); drawCaveLight(); };
  $('hudLayer')?.insertAdjacentHTML('beforeend', '<button id="caveAttackButton" class="sling-button cave-attack hidden" type="button" data-act="caveAttack">🔪 Facão</button>');
  $('hudLayer')?.insertAdjacentHTML('beforeend', '<button id="caveDashButton" class="sling-button cave-dash hidden" type="button" data-act="caveDash" title="Invulnerável durante o dash. Recarga de 1,2 segundos.">Shift · Dash</button>');
});
