// As lendas da noite viram luta de chefe (menos o Negrinho do Pastoreio, que é só uma luz de vela). Depois da cena do
// encontro, o Sadi vai pra "Clareira da lenda": um quadrado de grama cercado de mato, facão na mão. O combate é o da mata
// (vida, golpe, bornal); se o cusco véio estiver junto, ele late e segura a lenda de tempos em tempos.
//   · Lobisomem: corre atrás e dá o bote. · Mula sem Cabeça: investidas que deixam fogo no chão.
//   · Boitatá: cospe bolas de fogo. · Sanguanel: some e reaparece do lado, jogando pedrinha.
//   · Teiniaguá: bote rápido e raios vermelhos. · Anhangá: investida de galhada e o casco que faz a terra tremer.
// A vida da lenda acompanha a arma do Sadi (umas vinte e poucas facãozadas). Vencer dá a lembrança da estante, como antes.
'use strict';

const ARENA = { W: 1600, H: 1200, pad: 150 };
const LENDA_BOSS = {
  lobisomem: { hits: 24, dmg: .14, speed: 230, dash: 640 },
  mula: { hits: 22, dmg: .16, speed: 170, dash: 780, fire: true },
  boitata: { hits: 20, dmg: .12, speed: 150, shots: 3, color: '255,150,40' },
  sanguanel: { hits: 16, dmg: .1, speed: 200, shots: 1, blink: true, color: '200,190,170' },
  teiniagua: { hits: 20, dmg: .12, speed: 210, dash: 560, shots: 3, color: '255,60,50' },
  anhanga: { hits: 24, dmg: .15, speed: 180, dash: 700, ring: true }
};
let lendaFight = null;
function inArena() { return worldOut?.map === 'arena'; }
function lendaBoss(id) {
  const L = LENDA_BOSS[id], hp = Math.round(caveDmg() * L.hits);
  return { kind: id, lenda: true, x: ARENA.W - 520, y: ARENA.H / 2, hp, max: hp, dx: -1, state: 'chase', t: 1.5, cool: 1, hurt: 0, attack: 0, frame: 0, home: { x: ARENA.W / 2, y: ARENA.H / 2 } };
}
function lendaStart(id) {
  lendaFight = { id, back: { map: worldOut.map, x: worldOut.x, y: worldOut.y }, shots: [], fires: [], ring: null };
  caveState().hp = caveMaxHp(); mataNight = null;
  switchMap({ map: 'arena', x: 480, y: ARENA.H / 2, title: FOLK[id].icon + ' ' + FOLK[id].name, text: 'Facão na mão (Espaço/F)!' }); mataUpdateButton?.();
}
function lendaLeave(win) {
  const f = lendaFight; if (!f) return; lendaFight = null; mataNight = null;
  switchMap({ map: f.back.map, x: f.back.x, y: f.back.y }); closeDialog(true); mataUpdateButton?.(); caveState().hp = caveMaxHp();
  folkResult(f.id, win);
}
// O comportamento de cada lenda: persegue, prepara (treme) e ataca; no fim do ataque, fica um tempo parada (a hora de bater).
function lendaTick(b, dt, p) {
  const L = LENDA_BOSS[b.kind], F = lendaFight, rage = b.hp < b.max / 2 ? 1.25 : 1, dxp = p.x - b.x, dyp = p.y - b.y, d = Math.hypot(dxp, dyp) || 1;
  const hit = mult => mataHurt(Math.max(1, Math.round(caveMaxHp() * L.dmg * mult)), b);
  b.t -= dt; b.cool = Math.max(0, b.cool - dt); b.hurt = Math.max(0, b.hurt - dt); b.frame += dt * 6;
  if (b.state === 'chase') {
    b.dx = dxp < 0 ? -1 : 1; if (d > 70) mataStep(b, dxp / d * L.speed * rage, dyp / d * L.speed * rage, dt);
    else if (b.cool <= 0) { hit(.7); b.cool = 1.1; }
    if (b.t > 0) return;
    if (L.blink) { const a = Math.random() * Math.PI * 2; b.x = clamp(p.x + Math.cos(a) * 260, ARENA.pad + 40, ARENA.W - ARENA.pad - 40); b.y = clamp(p.y + Math.sin(a) * 200, ARENA.pad + 60, ARENA.H - ARENA.pad - 20); fxPuffs(b.x, b.y - 40, 10, 90, '#b8a8d8'); }
    if (L.ring && Math.random() < .4) { b.state = 'stomp'; b.t = .8; return; }
    if (L.dash && (!L.shots || Math.random() < .55)) { b.state = 'windup'; b.t = .6 / rage; b.aim = { x: dxp / d, y: dyp / d }; return; }
    if (L.shots) { b.state = 'cast'; b.t = .55; return; }
    b.t = 1.5;
    return;
  }
  if (b.state === 'windup' && b.t <= 0) { b.state = 'dash'; b.t = .5; AudioEngine.caveCry?.(b.kind === 'anhanga' ? 'onca' : 'javali'); return; }
  if (b.state === 'dash') {
    b.dx = b.aim.x < 0 ? -1 : 1; const ok = mataStep(b, b.aim.x * L.dash, b.aim.y * L.dash, dt);
    if (L.fire && Math.random() < dt * 14) F.fires.push({ x: b.x, y: b.y, life: 3.2 });
    if (d < 80 && b.cool <= 0) { hit(1); b.cool = .8; }
    if (b.t <= 0 || !ok) { b.state = 'rest'; b.t = 1.1 / rage; }
    return;
  }
  if (b.state === 'cast' && b.t <= 0) {
    const n = L.shots, a0 = Math.atan2(dyp, dxp);
    for (let k = 0; k < n; k++) { const a = a0 + (k - (n - 1) / 2) * .28; F.shots.push({ x: b.x, y: b.y - 50, vx: Math.cos(a) * 330, vy: Math.sin(a) * 330, life: 3 }); }
    AudioEngine.ignite?.(); b.state = 'rest'; b.t = .7 / rage; return;
  }
  if (b.state === 'stomp' && b.t <= 0) { F.ring = { x: b.x, y: b.y, r: 20, hit: false }; AudioEngine.thud?.(); b.state = 'rest'; b.t = 1 / rage; return; }
  if (b.state === 'rest' && b.t <= 0) { b.state = 'chase'; b.t = 1.6 + Math.random() * 1.2; }
}
// O que a lenda deixa no ar e no chão: bolas de fogo, fogo no capim e a onda da pisada.
function lendaHazardsTick(dt) {
  const F = lendaFight, p = worldOut; if (!F || !mataNight || mataNight.faint) return;
  const L = LENDA_BOSS[F.id], dmg = Math.max(1, Math.round(caveMaxHp() * L.dmg * .6)), from = mataNight.beasts[0] || p;
  for (const s of F.shots) { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; if (Math.hypot(s.x - p.x, s.y - (p.y - 40)) < 30) { s.life = 0; mataHurt(dmg, s); } }
  F.shots = F.shots.filter(s => s.life > 0 && s.x > 0 && s.x < ARENA.W && s.y > 0 && s.y < ARENA.H);
  for (const f of F.fires) { f.life -= dt; if (Math.hypot(f.x - p.x, (f.y - p.y) * 1.4) < 38) mataHurt(Math.ceil(dmg / 2), f); }
  F.fires = F.fires.filter(f => f.life > 0);
  const r = F.ring; if (r) { r.r += 520 * dt; const d = Math.hypot(p.x - r.x, (p.y - r.y) * 1.3); if (!r.hit && Math.abs(d - r.r) < 30) { r.hit = true; mataHurt(dmg, from); } if (r.r > 520) F.ring = null; }
}
function drawArenaGround(view) {
  rect(view.x - 40, view.y - 40, view.w + 80, view.h + 80, '#14200f');
  const { W, H, pad } = ARENA; if (!worldTexture(0, pad, pad, W - pad * 2, H - pad * 2)) rect(pad, pad, W - pad * 2, H - pad * 2, '#3e5a2a');
  ctx.save(); ctx.strokeStyle = 'rgba(8,14,6,.6)'; ctx.lineWidth = 26; ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2); ctx.restore();
}
function drawArenaFx() {
  const F = lendaFight; if (!F) return; const L = LENDA_BOSS[F.id], b = mataNight?.beasts[0];
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const f of F.fires) glow(f.x, f.y - 10, 40, .5 * Math.min(1, f.life), '255,120,40');
  for (const s of F.shots) glow(s.x, s.y, 26, .9, L.color || '255,150,40');
  ctx.restore();
  for (const s of F.shots) ellipse(s.x, s.y, 9, 9, '#fff2c0');
  if (F.ring) { ctx.save(); ctx.strokeStyle = 'rgba(230,236,255,.7)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(F.ring.x, F.ring.y, F.ring.r, F.ring.r / 1.3, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  // A investida avisa antes: uma faixa vermelha no chão pra onde ela vai.
  if (b?.state === 'windup' && b.aim) { ctx.save(); ctx.globalAlpha = .35; ctx.strokeStyle = '#ff4a3a'; ctx.lineWidth = 46; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + b.aim.x * 380, b.y + b.aim.y * 380); ctx.stroke(); ctx.restore(); }
}
function drawArenaBar() {
  const b = mataNight?.beasts[0]; if (!b || !lendaFight) return;
  const dpr = canvas.width / Math.max(1, canvas.clientWidth), W = canvas.clientWidth, w = Math.min(520, W - 80), x = (W - w) / 2;
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  rect(x, 14, w, 42, 'rgba(20,14,10,.85)', 8, '#a77439'); txt(FOLK[b.kind].icon + ' ' + FOLK[b.kind].name, W / 2, 30, 14, '#ffe2a6', 'center', 'Georgia', false);
  rect(x + 12, 38, w - 24, 10, '#2a1608', 4); rect(x + 12, 38, (w - 24) * Math.max(0, b.hp / b.max), 10, '#d84a3a', 4);
  ctx.restore();
}
WORLD_MAPS.arena = {
  id: 'arena', name: 'Clareira da lenda', W: ARENA.W, H: ARENA.H,
  spawn() { return { x: 480, y: ARENA.H / 2 }; },
  canWalk(x, y) { return x > ARENA.pad + 24 && x < ARENA.W - ARENA.pad - 24 && y > ARENA.pad + 60 && y < ARENA.H - ARENA.pad - 10; },
  edge() { return null; }, spots() { return []; },
  draw(view, seen, layers) {
    drawArenaGround(view);
    if (mataCombatOn() && !scene) drawMataNightLayers(layers, seen);
    layers.push({ y: 8e9 - 1, draw: () => { mataNightVeil(view, .35); drawArenaFx(); } }, { y: 8e9, draw: drawArenaBar });
  }
};
REGION_NAMES.arena = 'Clareira da lenda';
{
  // Lenda só aparece pra quem já tem o facão do vô (a luta é de facão).
  const tonight = folkTonight; folkTonight = function () { return G?.cave?.facao ? tonight() : null; };
  folkConfront = function (id) { lendaStart(id); };
  // Na luta, a história (conversas do Valter, capítulos, dicas) espera.
  const calm = storyCalm; storyCalm = function () { return !inArena() && calm(); };
  const here = mataHere; mataHere = function () { return here() || inArena(); };
  const combatOn = mataCombatOn; mataCombatOn = function () { return inArena() ? !!lendaFight : combatOn(); };
  const free = mataFree; mataFree = function (x, y) { return inArena() ? WORLD_MAPS.arena.canWalk(x, y) : free(x, y); };
  const start = mataNightStart; mataNightStart = function () { start(); if (inArena() && lendaFight) mataNight.beasts.push(lendaBoss(lendaFight.id)); };
  const beast = mataBeastTick; mataBeastTick = function (b, dt, p) { if (!b.lenda) return beast(b, dt, p); if (b.stun > 0) { b.stun -= dt; b.hurt = Math.max(0, b.hurt - dt); return; } lendaTick(b, dt, p); };
  const drawB = drawCaveBeast; drawCaveBeast = function (b) { if (!b.lenda) return drawB(b); ctx.save(); if (b.hurt > 0) ctx.globalAlpha = .55; drawFolk(b.kind, b.x, b.y, b.dx); ctx.restore(); if (b.stun > 0) txt('✦', b.x, b.y - 150, 18, '#ffe28a', 'center'); };
  const kill = mataKill; mataKill = function (b) { kill(b); if (b.lenda && lendaFight) { fxPuffs(b.x, b.y - 60, 16, 160, '#e8e0d0'); lendaLeave(true); } };
  // Desmaiou na arena: acorda onde estava, sem perder o dia da mata nem dinheiro.
  const faint = mataFaint; mataFaint = function () { if (!inArena() || !lendaFight) return faint(); if (mataNight) mataNight.faint = true; keys.clear(); lendaLeave(false); };
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (inArena() && !paused && !modal && !scene) lendaHazardsTick(dt); };
}
