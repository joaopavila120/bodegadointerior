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
function lendaLeave(win, f = lendaFight) {
  if (!f) return; lendaFight = null; mataNight = null;
  switchMap({ map: f.back.map, x: f.back.x, y: f.back.y }); closeDialog(true); mataUpdateButton?.(); caveState().hp = caveMaxHp();
  folkResult(f.id, win);
}
// Vitória: a lenda se desfaz em luz e sobe em fiapos, aparece o causo dela e, na primeira vez, cai a lembrança no chão.
// O Sadi vai até ela e ergue bem alto antes de ela ir pra estante. Só então volta pro mapa, com o cartão e a recompensa.
const LENDA_CAUSO = {
  lobisomem: 'Contam que o sétimo filho homem vira lobisomem nas sextas-feiras de lua e corre os campos até o galo cantar. O encanto só quebra quando alguém fere o bicho e tira sangue.',
  mula: 'A Mula sem Cabeça é uma mulher amaldiçoada que galopa de quinta pra sexta soltando fogo pelo pescoço. Quem arranca o freio de ferro dela quebra o encanto.',
  boitata: 'Depois de uma noite sem fim, a cobra-grande comeu os olhos dos bichos mortos e ficou toda feita de luz. Desde então o Boitatá vigia os campos contra quem bota fogo no mato.',
  sanguanel: 'O Sanguanel veio da Itália junto com os colonos da Serra: um duende de barrete vermelho que trança a crina dos cavalos e esconde guri no alto das árvores, só de arte.',
  teiniagua: 'A Teiniaguá é uma princesa moura encantada numa lagartixa, com uma pedra de fogo na cabeça: o carbúnculo. Quem prende ela ganha riqueza, mas perde o sossego, como o sacristão da Salamanca do Jarau.',
  anhanga: 'O Anhangá é o guardião da caça, um veado branco de olhos de fogo. Ele persegue quem mata bicho por maldade, ou caça filhote e fêmea prenhe.'
};
const LENDA_GLOW = { lobisomem: '220,230,255', mula: '255,130,50', boitata: '255,170,60', sanguanel: '255,120,90', teiniagua: '255,80,60', anhanga: '230,240,255' };
// A lenda desenhada numa tela à parte, pra poder clarear e sumir inteira (o desenho dela mexe na transparência sozinho).
const lendaShot = document.createElement('canvas'); lendaShot.width = lendaShot.height = 880;
function lendaSnapshot(kind, dx, white) {
  const g = lendaShot.getContext('2d'), keep = ctx; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, 880, 880); g.setTransform(2, 0, 0, 2, 0, 0);
  ctx = g; try { drawFolk(kind, 220, 400, dx); } finally { ctx = keep; }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(255,248,230,${clamp(white, 0, 1)})`; g.fillRect(0, 0, 880, 880); g.globalCompositeOperation = 'source-over';
  return lendaShot;
}
function drawLendaGone(a) {
  const t = frameClock - a.t0, c = LENDA_GLOW[a.kind] || '235,240,255', fade = clamp((t - .45) / 1.4, 0, 1);
  if (fade < 1) {
    // O golpe clareia, ela treme e vai se esticando pra cima, toda branca, até sumir.
    const shot = lendaSnapshot(a.kind, a.dx, t < .45 ? .85 - t : .45 + .55 * fade), jit = t < .6 ? Math.sin(t * 80) * 7 * (1 - t / .6) : 0;
    ctx.save(); ctx.globalAlpha = 1 - fade * fade; ctx.translate(a.x + jit, a.y); ctx.scale(1 - .6 * fade * fade, 1 + .6 * fade); ctx.drawImage(lendaShot, -220, -400, 440, 440); ctx.restore();
  }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const col = .3 * Math.sin(Math.PI * clamp((t - .2) / 2.2, 0, 1));
  if (col > 0) { const g = ctx.createLinearGradient(a.x - 70, 0, a.x + 70, 0); g.addColorStop(0, `rgba(${c},0)`); g.addColorStop(.5, `rgba(${c},${col})`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.fillRect(a.x - 70, a.y - 900, 140, 900); }
  glow(a.x, a.y - 90, 210, .5 * Math.sin(Math.PI * clamp(t / 2.4, 0, 1)), c); Object.assign(a, { lx: a.x, ly: a.y - 90, lr: 220, la: .3 * Math.sin(Math.PI * clamp(t / 2.4, 0, 1)), lc: c });
  const on = clamp(t * 2, 0, 1) * clamp((3 - t) / .8, 0, 1);
  for (let i = 0; i < 22; i++) { const r = (i * .618) % 1, life = (t * .7 + r) % 1; glow(a.x + (r - .5) * 150 + Math.sin(t * 2.5 + i) * 14, a.y - 10 - life * 280, 9 + 10 * r, (1 - life) * .8 * on, c); }
  ctx.restore();
}
// A lembrança cai da luz, fica brilhando no chão e, na mão do Sadi, sobe acima da cabeça dele com raios em volta.
function drawRelicGet(a) {
  const t = frameClock - a.t0; if (t < 0) return;
  const s = scene?.actors.sadi, held = a.held && s, k = clamp(t / .55, 0, 1), x = held ? s.x : a.x;
  const by = held ? s.y - 150 + Math.sin(frameClock * 3) * 4 : a.y - 170 * (1 - k * k) - (k >= 1 ? 4 + Math.sin(frameClock * 3) * 3 : 0), cy = by - 36;
  if (!held) ellipse(x, a.y + 2, 20 * (.5 + .5 * k), 6 * (.5 + .5 * k), 'rgba(0,0,0,.3)');
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (held) { ctx.fillStyle = 'rgba(255,230,160,.16)'; for (let i = 0; i < 12; i++) { const r = frameClock * .5 + i * Math.PI / 6; ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x + Math.cos(r - .1) * 130, cy + Math.sin(r - .1) * 130); ctx.lineTo(x + Math.cos(r + .1) * 130, cy + Math.sin(r + .1) * 130); ctx.closePath(); ctx.fill(); } }
  glow(x, cy, held ? 95 : 60, .35 + .1 * Math.sin(frameClock * 4), '255,225,150'); Object.assign(a, { lx: x, ly: cy, lr: held ? 120 : 70, la: held ? .3 : .2 });
  ctx.restore();
  ctx.save(); ctx.shadowColor = 'rgba(20,10,0,.75)'; ctx.shadowBlur = 8; ctx.translate(x, by); ctx.scale(2.2, 2.2); drawLembranca(a.relic, 0, 0); ctx.restore();
  for (let i = 0; i < 3; i++) { const p = (frameClock * .9 + i / 3) % 1; ctx.globalAlpha = Math.sin(Math.PI * p); txt('✦', x + Math.cos(i * 2.1 + frameClock) * 44, cy - 10 - p * 30, 12 + i * 3, '#fff2b0', 'center'); ctx.globalAlpha = 1; }
}
function lendaVictory(b) {
  const f = lendaFight, id = f.id, first = !folkState()[id]?.wins, p = worldOut, relic = FOLK[id].relic;
  const drop = { x: clamp(b.x, 300, ARENA.W - 300), y: clamp(b.y + 30, 340, ARENA.H - 220) }, side = p.x < drop.x ? -1 : 1;
  lendaFight = null; mataNight = null; keys.clear(); mataUpdateButton?.(); fx = fx.filter(e => !(e.type === 'puff' && Math.hypot(e.x - b.x, e.y - b.y) < 80));
  // O brilho da lenda e da lembrança também vai por cima do escuro da noite.
  const lit = id => ({ get x() { return scene?.actors[id]?.lx ?? -1e4; }, get y() { return scene?.actors[id]?.ly ?? -1e4; }, get r() { return scene?.actors[id]?.lr || 1; }, get a() { return Math.max(.001, scene?.actors[id]?.la || 0); }, get color() { return scene?.actors[id]?.lc || '255,225,150'; } });
  const steps = [
    ...sceneWorld({ map: 'arena', x: (p.x + b.x) / 2, y: (p.y + b.y) / 2 - 60, night: mataWorldNightTint(), lights: [lit('lenda'), lit('relic')] }),
    { do: () => { scene.fade = 0; AudioEngine.caveGhost?.(); } },
    { actor: 'sadi', x: p.x, y: p.y, dx: b.x < p.x ? -1 : 1, speed: 280 },
    { actor: 'lenda', x: b.x, y: b.y, kind: id, dx: b.dx, t0: frameClock, draw: drawLendaGone },
    { wait: 2.4 },
    { say: 'causo:' + id, text: LENDA_CAUSO[id] }
  ];
  if (first) steps.splice(4, 0, { actor: 'relic', x: drop.x, y: drop.y, relic, t0: frameClock + 1.5, draw: drawRelicGet }), steps.push(
    scenePan(drop.x, drop.y - 60, 220),
    { walk: 'sadi', to: { x: drop.x + side * 34, y: drop.y + 6 } },
    { do: () => { const s = scene.actors.sadi; scene.actors.relic.held = true; s.dy = 1; AudioEngine.ready(); sceneShout(HOME_KEEPSAKE_NAMES[relic] || FOLK[id].name, s.x, s.y - 300, '#ffe2a6', 24); sceneShout('vai pra estante de lembranças', s.x, s.y - 268, '#f1e6c8', 16); } },
    { wait: 2.2 });
  steps.push({ fade: 'out', time: .6 });
  playSteps(steps, 'lenda-vitoria', () => lendaLeave(true, f));
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
    if (L.dash && (!L.shots || Math.random() < .55)) { b.state = 'windup'; b.t = b.t0 = .6 / rage; b.aim = { x: dxp / d, y: dyp / d }; return; }
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
// ---------- A clareira ----------
// O chão (grama, a trilha batida em roda, o anel de cogumelos, as flores) e a mata do fundo são pintados uma vez só
// num canvas à parte; as árvores e o mato dos lados e da frente, os braseiros, os vaga-lumes e a luz da lua vão a
// cada quadro.
const ARENA_OUT = 360, ARENA_FIRES = [[205, 195], [1395, 195], [205, 1070], [1395, 1070]];
let arenaGroundCache = null, arenaDecor = null;
function arenaRand(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function arenaArtReady() { return WORLD_ART.grass?.naturalWidth && WORLD_ART.nature?.naturalWidth && MATA_ART['mata-nature']?.naturalWidth; }
// Araucárias (e umas árvores de folha) em volta, e o mato na beira da clareira, fora de onde se anda.
function arenaDecorList() {
  if (arenaDecor) return arenaDecor;
  const R = arenaRand(9137), { W, H } = ARENA, trees = [], props = [];
  const tree = (x, y, back) => { const arauc = R() < .72, w = Math.round((arauc ? 230 : 220) + R() * 80); trees.push({ x: x + (R() - .5) * 60, y: y + (R() - .5) * 36, kind: arauc ? 1 : 0, w, h: Math.round(w * (arauc ? 1.42 : 1.3)), back }); };
  for (let x = -320; x <= W + 320; x += 150) { tree(x, -60, true); tree(x + 75, 105, true); }
  for (let x = -320; x <= W + 320; x += 160) { tree(x, H + 130, false); tree(x + 80, H + 300, false); }
  for (let y = 260; y < H + 60; y += 165) { tree(40, y, false); tree(-120, y + 80, false); tree(W - 40, y, false); tree(W + 120, y + 80, false); }
  const kinds = [1, 1, 5, 2, 6, 3], prop = (x, y, back) => { const i = kinds[Math.floor(R() * kinds.length)], w = Math.round(110 + R() * 60); props.push({ i, x: x + (R() - .5) * 40, y, w, h: Math.round(w * .85), back }); };
  for (let x = 300; x < W - 260; x += 150) { prop(x, 196, true); prop(x + 60, H - 112, false); }
  for (let y = 330; y < H - 160; y += 150) { prop(130, y, false); prop(W - 130, y + 70, false); }
  return arenaDecor = { trees: trees.sort((a, b) => a.y - b.y), props };
}
function buildArenaGround() {
  const { W, H, pad } = ARENA, O = ARENA_OUT, R = arenaRand(4021), cv = document.createElement('canvas');
  cv.width = W + O * 2; cv.height = H + O * 2;
  const main = ctx; ctx = cv.getContext('2d');
  try {
    ctx.translate(O, O);
    worldTexture(0, -O, -O, W + O * 2, H + O * 2);
    ctx.save(); ctx.filter = 'blur(18px)'; for (let k = 0; k < 46; k++) ellipse(pad + R() * (W - pad * 2), pad + R() * (H - pad * 2), 60 + R() * 110, 30 + R() * 50, R() < .5 ? 'rgba(20,40,12,.08)' : 'rgba(190,200,100,.07)'); ctx.restore();
    // A trilha batida em roda, de tanta lenda e tanto gaúcho brigando ali.
    ctx.save(); ctx.filter = 'blur(7px)'; ctx.lineWidth = 78; ctx.strokeStyle = 'rgba(104,78,46,.42)'; ctx.beginPath(); ctx.ellipse(W / 2, H / 2 + 20, 440, 300, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 34; ctx.strokeStyle = 'rgba(140,108,66,.3)'; ctx.stroke(); ctx.restore();
    for (let k = 0; k < 160; k++) { const a = R() * Math.PI * 2, r = .9 + R() * .2; ellipse(W / 2 + Math.cos(a) * 440 * r, H / 2 + 20 + Math.sin(a) * 300 * r, 2 + R() * 3, 1.5 + R() * 2, R() < .5 ? '#7d6a4e' : '#9a8866'); }
    // O anel de cogumelos em volta (dizem que é onde as lendas dançam).
    for (let a = 0; a < Math.PI * 2; a += .085 + R() * .05) {
      if (R() < .18) continue; const x = W / 2 + Math.cos(a) * 545 + (R() - .5) * 18, y = H / 2 + 20 + Math.sin(a) * 390 + (R() - .5) * 14, s = .7 + R() * .6, red = R() < .3;
      rect(x - 1.5 * s, y - 7 * s, 3 * s, 7 * s, '#e8dcc0'); ellipse(x, y - 7 * s, 6 * s, 3.6 * s, red ? '#c0392b' : '#d9c9a4');
      if (red) { rect(x - 2.5 * s, y - 8.5 * s, 1.6, 1.6, '#fff4e0'); rect(x + 1.5 * s, y - 7.5 * s, 1.6, 1.6, '#fff4e0'); }
    }
    for (let k = 0; k < 230; k++) { const x = pad + R() * (W - pad * 2), y = pad + 40 + R() * (H - pad * 2 - 40), c = ['#f4f0e0', '#ffe27a', '#c9a6ff', '#ff9ec0', '#9fd0ff'][Math.floor(R() * 5)]; if (R() < .55) { rect(x - 1, y - 1, 3, 3, c); rect(x, y + 2, 1, 3, '#3f6a2a'); } else { ctx.fillStyle = 'rgba(28,58,18,.55)'; ctx.fillRect(x, y, 2, 6); ctx.fillRect(x + 3, y + 1, 2, 5); ctx.fillRect(x - 3, y + 2, 2, 4); } }
    // Fora da clareira, a sombra da mata fechada.
    const shade = document.createElement('canvas'); shade.width = cv.width; shade.height = cv.height; const s = shade.getContext('2d');
    s.fillStyle = 'rgba(6,14,5,.72)'; s.fillRect(0, 0, shade.width, shade.height); s.globalCompositeOperation = 'destination-out'; s.filter = 'blur(46px)';
    s.beginPath(); s.roundRect(O + pad - 10, O + pad - 30, W - pad * 2 + 20, H - pad * 2 + 50, 160); s.fill();
    ctx.drawImage(shade, -O, -O);
    // A mata do fundo e o mato da beira de cima ficam sempre atrás do Sadi: vão pintados aqui.
    const D = arenaDecorList();
    for (const t of D.trees) if (t.back) worldTreeSprite(t.kind, t.x, t.y, t.w, t.h);
    for (const p of D.props) if (p.back) mataNature(p.i, p.x, p.y, p.w, p.h);
  } finally { ctx = main; }
  return cv;
}
function drawArenaGround(view) {
  rect(view.x - 40, view.y - 40, view.w + 80, view.h + 80, '#0e180b');
  if (!arenaGroundCache && arenaArtReady()) arenaGroundCache = buildArenaGround();
  if (arenaGroundCache) { ctx.drawImage(arenaGroundCache, -ARENA_OUT, -ARENA_OUT); return; }
  const { W, H, pad } = ARENA; if (!worldTexture(0, pad, pad, W - pad * 2, H - pad * 2)) rect(pad, pad, W - pad * 2, H - pad * 2, '#3e5a2a');
}
// As árvores dos lados e da frente, o mato da beira e os braseiros entram na ordem de profundidade (o Sadi passa atrás).
function drawArenaDecor(seen, layers) {
  if (!arenaGroundCache) return; const D = arenaDecorList();
  for (const t of D.trees) if (!t.back && seen(t.x, t.y, t.h + 30)) layers.push({ y: t.y, draw: () => worldTreeSprite(t.kind, t.x, t.y, t.w, t.h) });
  for (const p of D.props) if (!p.back && seen(p.x, p.y, p.h + 20)) layers.push({ y: p.y, draw: () => mataNature(p.i, p.x, p.y, p.w, p.h) });
  for (const [x, y] of ARENA_FIRES) if (seen(x, y, 120)) layers.push({ y, draw: () => { ellipse(x, y + 2, 40, 12, 'rgba(10,8,4,.35)'); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; ellipse(x + Math.cos(a) * 30, y + Math.sin(a) * 11, 8, 6, k % 2 ? '#6a6a62' : '#85857a'); } drawFogoDeChao(x, y); } });
}
// ---------- A noite bonita (na clareira e nos mapas abertos) ----------
// Vaga-lumes piscando e voando devagar em volta de cada ponto (copa de árvore, beira de rio): "per" por ponto, e só em
// "share" dos pontos.
function drawFireflies(view, pts, alpha = 1, per = 3, share = 1) {
  const t = frameClock, flies = [];
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  pts.forEach(([px, py], i) => {
    if (i % 10 >= share * 10 || px < view.x - 120 || px > view.x + view.w + 120 || py < view.y - 120 || py > view.y + view.h + 120) return;
    for (let k = 0; k < per; k++) {
      const ph = (i * 7 + k * 3) * 2.399 % 6.283, x = px + Math.sin(t * .5 + ph) * 70 + (k - 1) * 34, y = py + Math.cos(t * .7 + ph * 1.3) * 45, a = .45 * Math.sin(t * 2.4 + ph * 3) * alpha;
      if (a > .04) { glow(x, y, 15, a, '200,255,120'); flies.push([x, y, a]); }
    }
  });
  ctx.restore();
  for (const [x, y, a] of flies) { ctx.globalAlpha = Math.min(1, a * 2); rect(x - 1.5, y - 1.5, 3, 3, '#f2ffb0'); } ctx.globalAlpha = 1;
}
// Nos mapas abertos, os vaga-lumes ficam nas copas das árvores e na beira do rio Uruguai (Fronteira) e do arroio (Serra).
const fireflySpotCache = new Map();
function fireflySpots(M) {
  if (fireflySpotCache.has(M.id)) return fireflySpotCache.get(M.id);
  const list = [];
  // (Na Serra e em SC, as árvores que ficariam em cima de casa ou estrada nem são desenhadas.)
  for (const p of worldDressing(M).props) if (p.sheet === 'nature' && p.index < 3 && (M.id === 'vila' || regionalTreeClear(M.id, p.x, p.y, p.w, p.h))) list.push([p.x, p.y - p.h * .45]);
  for (const t of regionalExtraTrees(M)) list.push([t.x, t.y - t.h * .45]);
  if (M.id === 'vila') for (let y = 300; y < M.H; y += 240) list.push([VILA.river + 20, y]);
  if (M.id === 'serra') for (let x = 120; x < M.W; x += 240) list.push([x, SERRA.arroio]);
  fireflySpotCache.set(M.id, list); return list;
}
// Na clareira, na beira do mato em volta.
const ARENA_FLY_SPOTS = [];
for (let x = 260; x < ARENA.W - 200; x += 150) ARENA_FLY_SPOTS.push([x, 225], [x + 70, 1040]);
for (let y = 330; y < ARENA.H - 200; y += 150) ARENA_FLY_SPOTS.push([215, y], [ARENA.W - 215, y + 70]);
function drawMoonlight(cx, cy, r, alpha) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(cx, cy, r * .12, cx, cy, r); g.addColorStop(0, `rgba(160,185,255,${alpha})`); g.addColorStop(1, 'rgba(160,185,255,0)');
  ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); ctx.restore();
}
// As bordas da tela escurecendo, pra focar no meio.
function drawVignette(view, alpha) {
  const cx = view.x + view.w / 2, cy = view.y + view.h / 2, m = Math.max(view.w, view.h), v = ctx.createRadialGradient(cx, cy, m * .36, cx, cy, m * .78);
  v.addColorStop(0, 'rgba(4,8,4,0)'); v.addColorStop(1, `rgba(4,8,4,${alpha})`); ctx.fillStyle = v; ctx.fillRect(view.x - 40, view.y - 40, view.w + 80, view.h + 80);
}
// Na Fronteira, na Serra e em SC, de noite, bem de leve: uns poucos vaga-lumes (um em três a cada dez pontos) e as
// bordas mal escurecendo.
function drawNightAmbience(view, night) {
  const k = Math.min(1, night / .5);
  drawFireflies(view, fireflySpots(worldMap()), k, 1, .3);
  drawVignette(view, .05 * k);
}
// Por cima da noite da clareira: a luz dos braseiros, a lua no meio, os vaga-lumes e a mata escurecendo nas bordas.
function drawArenaLight(view) {
  const t = frameClock, { W, H } = ARENA;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [x, y] of ARENA_FIRES) glow(x, y - 30, 240, .2 + Math.sin(t * 8 + x) * .03, '255,140,60');
  ctx.restore();
  drawMoonlight(W / 2, H / 2, 640, .14);
  drawFireflies(view, ARENA_FLY_SPOTS);
  drawVignette(view, .55);
}
function drawArenaFx() {
  const F = lendaFight; if (!F) return; const L = LENDA_BOSS[F.id], b = mataNight?.beasts[0];
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const f of F.fires) glow(f.x, f.y - 10, 40, .5 * Math.min(1, f.life), '255,120,40');
  for (const s of F.shots) glow(s.x, s.y, 26, .9, L.color || '255,150,40');
  ctx.restore();
  for (const s of F.shots) ellipse(s.x, s.y, 9, 9, '#fff2c0');
  if (F.ring) { ctx.save(); ctx.strokeStyle = 'rgba(230,236,255,.7)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(F.ring.x, F.ring.y, F.ring.r, F.ring.r / 1.3, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  // A investida avisa antes: uma faixa no chão pra onde ela vai, que se enche até a hora do bote.
  if (b?.state === 'windup' && b.aim) teleLane(b.x, b.y, Math.atan2(b.aim.y, b.aim.x), 380, 60, teleK(b.t, b.t0 || .6), '255,74,58');
}
function drawArenaBar() {
  const b = mataNight?.beasts[0]; if (!b || !lendaFight) return;
  // Embaixo, acima da dica do rodapé (no alto, os avisos de entrada cobririam a barra).
  const dpr = canvas.width / Math.max(1, canvas.clientWidth), W = canvas.clientWidth, w = Math.min(520, W - 80), x = (W - w) / 2, y = canvas.clientHeight - 118;
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  rect(x, y, w, 42, 'rgba(20,14,10,.85)', 8, '#a77439'); txt(FOLK[b.kind].icon + ' ' + FOLK[b.kind].name, W / 2, y + 16, 14, '#ffe2a6', 'center', 'Georgia', false);
  rect(x + 12, y + 24, w - 24, 10, '#2a1608', 4); rect(x + 12, y + 24, (w - 24) * Math.max(0, b.hp / b.max), 10, '#d84a3a', 4);
  ctx.restore();
}
WORLD_MAPS.arena = {
  id: 'arena', name: 'Clareira da lenda', W: ARENA.W, H: ARENA.H,
  spawn() { return { x: 480, y: ARENA.H / 2 }; },
  canWalk(x, y) { return x > ARENA.pad + 24 && x < ARENA.W - ARENA.pad - 24 && y > ARENA.pad + 60 && y < ARENA.H - ARENA.pad - 10; },
  edge() { return null; }, spots() { return []; },
  draw(view, seen, layers) {
    drawArenaGround(view); drawArenaDecor(seen, layers);
    if (mataCombatOn() && !scene) drawMataNightLayers(layers, seen);
    layers.push({ y: 8e9 - 1, draw: () => { mataNightVeil(view, .35); drawArenaLight(view); drawArenaFx(); } });
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
  const kill = mataKill; mataKill = function (b) { kill(b); if (b.lenda && lendaFight) lendaVictory(b); };
  // O causo da vitória fala com o rosto da lenda.
  const speaker = sceneSpeaker; sceneSpeaker = function (who) { if (!String(who).startsWith('causo:')) return speaker(who); const id = who.slice(6); return { ...speaker(id), name: '📜 ' + FOLK[id].name + ' · o causo' }; };
  // Desmaiou na arena: acorda onde estava, sem perder o dia da mata nem dinheiro.
  const faint = mataFaint; mataFaint = function () { if (!inArena() || !lendaFight) return faint(); if (mataNight) mataNight.faint = true; keys.clear(); lendaLeave(false); };
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (inArena() && !paused && !modal && !scene) lendaHazardsTick(dt); };
  // Por cima da noite (como nos trechos): o clarão do golpe, a vida do Sadi no canto e a da lenda no alto.
  const sparks = drawSparks; drawSparks = function (map = null) {
    sparks(map); const N = mataNight; if (map !== 'arena' || !inArena() || !N || scene) return;
    if (N.hurt > 0) { ctx.fillStyle = `rgba(200,30,20,${N.hurt * .8})`; ctx.fillRect(worldOut.x - 3000, worldOut.y - 3000, 6000, 6000); }
    mataHudPanel('Clareira da lenda', 'facão na mão · Espaço/F'); drawArenaBar();
  };
}
