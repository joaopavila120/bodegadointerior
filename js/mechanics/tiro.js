// Tiro aos javalis: na noite da Invasão de javalis, o Valter entrega a espingarda de dois canos e os cuiudos tocam os
// bichos pro potreiro. Os javalis se escondem atrás de moitas, pedras, cupinzeiros, capim e tronco caído, aparecem por
// um instante e somem de novo: 45 segundos para derrubar o máximo. No escuro, só o lampião clareia em volta da mira e
// os olhos vermelhos entregam quem está fora da luz. O cachaço (javali grande) aguenta dois tiros; de vez em quando um
// corre pelo fundo do campo; e cuidado com o chapéu dos cuiudos, que também aparece atrás das moitas!
'use strict';

const SHOOT = { W: 1280, H: 720, time: 45, need: 6, shells: 2, reload: 1 };
const SHOOT_ROWS = [{ y: 372, s: .62 }, { y: 486, s: .85 }, { y: 640, s: 1.15 }];
const SHOOT_COVERS = [
  [0, 230, 'cupim'], [0, 520, 'moita'], [0, 820, 'capim'], [0, 1090, 'pedra'],
  [1, 140, 'pedra'], [1, 450, 'tronco'], [1, 780, 'moita'], [1, 1110, 'cupim'],
  [2, 300, 'moita'], [2, 760, 'pedra'], [2, 1100, 'capim']
].map(([row, x, kind], i) => ({ i, row, x, kind, y: SHOOT_ROWS[row].y, s: SHOOT_ROWS[row].s, w: 190 * SHOOT_ROWS[row].s, h: 100 * SHOOT_ROWS[row].s }));
// Altura de cada esconderijo (em unidades da fileira): o javali aparece com as pernas atrás dele.
const SHOOT_TOP = { moita: 96, pedra: 84, cupim: 112, tronco: 62, capim: 58 };
let shoot = null;
function shootActive() { return !!shoot && !shoot.over; }

// ---------- Começar e terminar ----------
function shootIntro() {
  const st = mapEvState('javali'), best = G.shootBest || 0;
  talk([['valter', st.done ? 'Mais uma rodada, Sadi? Os cuiudos ainda tão tocando bicho pro potreiro.' : 'Toma a espingarda do teu vô, Sadi. Dois canos: atirou duas vezes, recarrega.'],
    ['dica', `Os javalis aparecem atrás das moitas, pedras e cupinzeiros e somem de novo. <b>Mire com o mouse</b> (ou WASD) e <b>atire com clique</b> (ou Espaço). <b>R</b> recarrega. Fora da luz do lampião, procure os olhos vermelhos.<br><br>O <b>cachaço</b> aguenta dois tiros. <b>Não acerte o chapéu dos cuiudos!</b><br>Meta: <b>${SHOOT.need} javalis</b> em ${SHOOT.time} segundos${best ? ' · recorde: ' + best : ''}.`, 'Tiro aos javalis']], startShoot, 'Pegar a espingarda');
}
function startShoot() {
  closeDialog(true); showRpgBox('worldTalk', null); keys.clear(); pointerHold = false;
  shoot = { t: -2.4, left: SHOOT.time, kills: 0, shots: 0, hits: 0, misses: 0, friendly: 0, shells: SHOOT.shells, reload: 0, aim: { x: SHOOT.W / 2, y: SHOOT.H / 2 }, keys: new Set(),
    targets: SHOOT_COVERS.map(c => ({ c, state: 'hidden', rise: 0, t: 0, cool: Math.random() * 1.5 })), runner: null, runT: 13, spawnT: .3, fx: [], flash: 0, recoil: 0, paused: false, last: performance.now(), over: false };
  modal = 'shoot'; $('shootUI').classList.remove('hidden'); AudioEngine.ready?.(); requestAnimationFrame(shootFrame);
}
function endShoot(quit = false) {
  if (!shoot || shoot.over) return; const s = shoot; s.over = true;
  $('shootUI').classList.add('hidden'); modal = null; keys.clear(); pointerHold = false;
  const st = mapEvState('javali'), best = G.shootBest || 0, record = s.kills > best; if (record) G.shootBest = s.kills;
  const acc = s.shots ? Math.round(s.hits / s.shots * 100) : 0, line = `<b>${s.kills}</b> javalis · ${s.shots} tiros · ${acc}% de acerto${s.friendly ? ' · ' + s.friendly + ' tiro no chapéu dos cuiudos' : ''}${record && best ? '<br>🏆 Recorde novo!' : ''}`;
  if (!st.done && s.kills >= SHOOT.need) {
    st.done = true; st.kills = s.kills; const rw = scaleReward(MAP_EVENTS.javali.reward, s.kills >= 14 ? 1.4 : s.kills >= 10 ? 1.2 : 1); grantReward(rw); save(); refreshHUD();
    talk([['card', line, 'Tiro aos javalis'], ['valter', 'Bah, Sadi! ' + s.kills + ' javalis! Os cuiudos não acreditaram, o Seu Anselmo até chorou de alegria. A lavoura tá salva!'], ['reward', rw, 'Invasão de javalis · concluída']], null, 'Receber');
  } else if (!st.done) {
    st.kills = Math.max(st.kills || 0, s.kills); save();
    talk([['card', line + `<br><br>Faltou: a meta é ${SHOOT.need}.`, 'Tiro aos javalis'], ['valter', quit ? 'Largou a espingarda? Descansa e volta, que os bichos não foram embora.' : 'Os bichos são ligeiros, né? Respira, toma um mate e tenta de novo: tô aqui na frente da bodega.']], null, 'Tentar depois');
  } else { save(); talk([['card', line, 'Tiro aos javalis · rodada extra']], null, 'Fechar'); }
}

// ---------- Rodada ----------
function shootFrame(now) {
  const s = shoot; if (!s || s.over) return;
  const dt = Math.min(.05, (now - s.last) / 1000); s.last = now;
  if (!s.paused) shootTick(dt);
  drawShoot(); requestAnimationFrame(shootFrame);
}
function shootTick(dt) {
  const s = shoot; s.t += dt; s.flash = Math.max(0, s.flash - dt * 4); s.recoil = Math.max(0, s.recoil - dt * 6);
  const ax = (s.keys.has('d') || s.keys.has('arrowright') ? 1 : 0) - (s.keys.has('a') || s.keys.has('arrowleft') ? 1 : 0), ay = (s.keys.has('s') || s.keys.has('arrowdown') ? 1 : 0) - (s.keys.has('w') || s.keys.has('arrowup') ? 1 : 0);
  if (ax || ay) { const l = Math.hypot(ax, ay); s.aim.x = clamp(s.aim.x + ax / l * 820 * dt, 0, SHOOT.W); s.aim.y = clamp(s.aim.y + ay / l * 820 * dt, 0, SHOOT.H); }
  for (const f of s.fx) f.life -= dt; s.fx = s.fx.filter(f => f.life > 0);
  if (s.t < 0) return;
  s.left = Math.max(0, SHOOT.time - s.t); if (s.left <= 0) { endShoot(); return; }
  if (s.reload > 0 && (s.reload -= dt) <= 0) { s.shells = SHOOT.shells; AudioEngine.tick(); }
  const p = s.t / SHOOT.time, stay = 1.75 - .85 * p;
  for (const o of s.targets) {
    o.t -= dt;
    if (o.state === 'hidden') o.cool -= dt;
    else if (o.state === 'rising') { o.rise = Math.min(1, o.rise + dt * 5.5); if (o.rise >= 1) { o.state = 'up'; o.t = o.kind === 'peao' ? 1.3 : stay * (.8 + Math.random() * .4); } }
    else if (o.state === 'up') { if (o.t <= 0) o.state = 'sinking'; }
    else if (o.state === 'sinking') { o.rise = Math.max(0, o.rise - dt * 5); if (o.rise <= 0) { o.state = 'hidden'; o.cool = .6 + Math.random(); } }
    else if (o.state === 'dead') { if (o.t <= -0.9) { o.state = 'hidden'; o.rise = 0; o.cool = 1 + Math.random(); } }
  }
  // Mais bicho conforme o tempo passa; no máximo 3 (depois 4) de pé ao mesmo tempo.
  s.spawnT -= dt;
  if (s.spawnT <= 0) {
    s.spawnT = 1.05 - .5 * p + Math.random() * .3;
    const up = s.targets.filter(o => o.state !== 'hidden').length, free = s.targets.filter(o => o.state === 'hidden' && o.cool <= 0);
    if (up < (p > .5 ? 4 : 3) && free.length) {
      const o = pick(free), roll = Math.random();
      o.kind = s.t > 8 && roll < .13 ? 'peao' : s.t > 12 && roll < .33 ? 'cachaco' : 'javali'; o.hp = o.kind === 'cachaco' ? 2 : 1;
      o.state = 'rising'; o.rise = 0; o.dir = Math.random() < .5 ? -1 : 1; o.frame = Math.random() * 10;
    }
  }
  // Javali corredor: atravessa o fundo do campo, entre a primeira e a segunda fileira.
  s.runT -= dt;
  if (!s.runner && s.runT <= 0 && s.left > 5) { const dir = Math.random() < .5 ? 1 : -1; s.runner = { x: dir > 0 ? -90 : SHOOT.W + 90, y: 428, dir, sp: 300 + Math.random() * 80, hp: 1 }; s.runT = 8 + Math.random() * 4; }
  if (s.runner) { const r = s.runner; if (r.dead != null) { r.dead -= dt; if (r.dead <= 0) s.runner = null; } else { r.x += r.dir * r.sp * dt; if (r.x < -120 || r.x > SHOOT.W + 120) s.runner = null; } }
}
function shootFire() {
  const s = shoot; if (!s || s.over || s.paused || s.t < 0) return;
  if (s.reload > 0) return;
  if (s.shells <= 0) { shootReload(); return; }
  s.shells--; s.shots++; s.flash = 1; s.recoil = 1;
  AudioEngine.noise?.(.26, .32, 520); AudioEngine.note?.(62, .2, 'sawtooth', .07);
  const { x, y } = s.aim; let hit = null;
  if (s.runner && s.runner.dead == null && shootHitBoar(s.runner.x, s.runner.y, .75, x, y)) hit = { runner: true };
  // Das fileiras da frente para as do fundo: quem está na frente leva o tiro.
  for (const row of [2, 1, 0]) { if (hit) break; for (const o of s.targets) if (o.c.row === row && ['rising', 'up', 'sinking'].includes(o.state) && o.rise > .45 && shootHitTarget(o, x, y)) { hit = o; break; } }
  if (!hit) { s.misses++; s.fx.push({ x, y, text: 'Errou', color: '#d9c79f', life: .6 }); }
  else if (hit.runner) { s.runner.dead = .8; s.kills += 2; s.hits++; s.fx.push({ x, y: y - 30, text: '+2 corredor!', color: '#ffe27a', life: 1 }); shootSqueal(); }
  else if (hit.kind === 'peao') { s.friendly++; s.kills = Math.max(0, s.kills - 2); hit.state = 'sinking'; s.fx.push({ x, y: y - 30, text: '−2 · Ô, sou eu, tchê!', color: '#ff9a8a', life: 1.4 }); AudioEngine.bad(); }
  else { s.hits++; hit.hp--; if (hit.hp > 0) { s.fx.push({ x, y: y - 30, text: 'Cachaço brabo!', color: '#ffd0a0', life: .8 }); hit.t = Math.max(hit.t, .6); AudioEngine.moo?.(.06, .45); }
    else { const pts = hit.kind === 'cachaco' ? 2 : 1; s.kills += pts; hit.state = 'dead'; hit.t = 0; s.fx.push({ x, y: y - 30, text: '+' + pts, color: '#d8ffac', life: .9 }); shootSqueal(); } }
  if (s.shells <= 0) shootReload();
}
function shootReload() { const s = shoot; if (!s || s.reload > 0 || s.shells >= SHOOT.shells) return; s.reload = SHOOT.reload; AudioEngine.tick(); }
function shootSqueal() { AudioEngine.note?.(900, .08, 'square', .03); AudioEngine.note?.(640, .12, 'square', .03, .07); }
// Onde está o corpo do javali (e quanto aparece acima da moita).
function shootPose(o) { const c = o.c, js = c.s * (o.kind === 'cachaco' ? 2.05 : 1.6), line = c.y - (SHOOT_TOP[c.kind] - 18) * c.s; return { js, x: c.x, y: line + 14 * c.s + (1 - o.rise) * 54 * js, base: line + 2 }; }
function shootHitBoar(bx, by, js, x, y) { return ((x - bx - 6 * js) / (44 * js)) ** 2 + ((y - by + 26 * js) / (24 * js)) ** 2 <= 1; }
function shootHitTarget(o, x, y) {
  const p = shootPose(o); if (y > p.base) return false;
  if (o.kind === 'peao') return Math.hypot(x - p.x, y - (p.y - 34 * p.js / 1.6)) < 30 * p.js / 1.6;
  return shootHitBoar(p.x, p.y, p.js, x, y);
}

// ---------- Desenho ----------
function drawShoot() {
  const cv = $('shootCanvas'), main = ctx; ctx = cv.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0);
  try { drawShootScene(); } finally { ctx = main; }
}
function drawShootScene() {
  const s = shoot, { W: w, H: h } = SHOOT, t = performance.now() / 1000;
  const sky = ctx.createLinearGradient(0, 0, 0, 330); sky.addColorStop(0, '#060a1e'); sky.addColorStop(1, '#1a2448'); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) ellipse((i * 191.3) % w, (i * 47.9) % 260, 1.2, 1.2, `rgba(240,236,210,${.3 + .3 * Math.sin(t * 1.3 + i)})`);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(860, 96, 140, .22, '220,230,255'); ctx.restore(); ellipse(860, 96, 30, 30, '#eeead2');
  for (let x = -40; x < w + 80; x += 160) ellipse(x, 318, 190, 46, '#0e1a14');
  rect(0, 318, w, h - 318, '#1e2e18'); const field = ctx.createLinearGradient(0, 318, 0, h); field.addColorStop(0, '#24361f'); field.addColorStop(1, '#3a5226'); ctx.fillStyle = field; ctx.fillRect(0, 318, w, h - 318);
  for (let i = 0; i < 160; i++) { const x = (i * 83.7) % w, y = 330 + (i * 37.1) % (h - 330), k = (y - 318) / (h - 318); rect(x, y, 2, 4 + k * 8, `rgba(90,120,60,${.25 + k * .35})`); }
  // cerca de taipa no fundo
  for (let x = 0; x < w; x += 46) rect(x, 330, 5, 22, '#2a2018'); rect(0, 336, w, 3, '#2a2018'); rect(0, 345, w, 3, '#2a2018');
  for (let row = 0; row < SHOOT_ROWS.length; row++) {
    if (row === 1) drawShootRunner();
    for (const o of s.targets) if (o.c.row === row) drawShootTarget(o);
    for (const c of SHOOT_COVERS) if (c.row === row) drawShootCover(c);
  }
  // Escuro da noite: só o lampião em volta da mira clareia.
  const a = s.aim, g = ctx.createRadialGradient(a.x, a.y, 90, a.x, a.y, 420); g.addColorStop(0, 'rgba(4,6,20,0)'); g.addColorStop(1, 'rgba(4,6,20,.5)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(a.x, a.y, 230, .1, '255,210,140'); ctx.restore();
  // Olhos vermelhos de quem está fora da luz.
  for (const o of s.targets) if (['rising', 'up', 'sinking'].includes(o.state) && o.rise > .5 && o.kind !== 'peao') { const p = shootPose(o); if (Math.hypot(p.x - a.x, p.y - a.y) > 230) { const ex = p.x + (o.dir || 1) * 30 * p.js, ey = p.y - 26 * p.js; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ex, ey, 16 * p.js, .55, '255,40,20'); ctx.restore(); ellipse(ex - 3 * p.js, ey, 2 * p.js, 2 * p.js, '#ff4a2a'); ellipse(ex + 3 * p.js, ey, 2 * p.js, 2 * p.js, '#ff4a2a'); } }
  if (s.flash > 0) { rect(0, 0, w, h, `rgba(255,240,200,${s.flash * .22})`); }
  for (const f of s.fx) { ctx.save(); ctx.globalAlpha = Math.min(1, f.life * 2); txt(f.text, f.x, f.y - (1 - f.life) * 30, 22, f.color, 'center', 'Georgia', true); ctx.restore(); }
  drawShootCrosshair(a.x, a.y - s.recoil * 10);
  drawShootHud();
}
function drawShootCover(c) {
  const { x, y, s, w, h } = c;
  ellipse(x, y + 4, w * .55, 10 * s, '#0a120888');
  if (c.kind === 'moita') { for (const [dx, dy, r] of [[-60, -20, 48], [-10, -40, 58], [45, -24, 50], [10, -10, 60], [-50, 0, 40], [60, 2, 40]]) ellipse(x + dx * s, y + dy * s - 18 * s, r * s, r * .7 * s, '#1f3a1c'); for (const [dx, dy, r] of [[-30, -52, 22], [24, -46, 24], [-62, -26, 16]]) ellipse(x + dx * s, y + dy * s - 18 * s, r * s, r * .6 * s, '#2e5428'); }
  else if (c.kind === 'pedra') { ellipse(x - 30 * s, y - 34 * s, 70 * s, 52 * s, '#4a4842'); ellipse(x + 40 * s, y - 26 * s, 60 * s, 40 * s, '#55524a'); ellipse(x - 40 * s, y - 56 * s, 34 * s, 18 * s, '#6a675e'); ellipse(x + 30 * s, y - 44 * s, 26 * s, 12 * s, '#6e6a60'); }
  else if (c.kind === 'cupim') { ctx.fillStyle = '#6a3a22'; ctx.beginPath(); ctx.moveTo(x - 80 * s, y); ctx.quadraticCurveTo(x - 70 * s, y - 120 * s, x, y - 118 * s); ctx.quadraticCurveTo(x + 70 * s, y - 120 * s, x + 80 * s, y); ctx.fill(); ellipse(x - 20 * s, y - 80 * s, 24 * s, 14 * s, '#7e4a2c'); for (let k = 0; k < 7; k++) ellipse(x + (k * 23 % 110 - 55) * s, y - (20 + k * 13 % 80) * s, 4 * s, 3 * s, '#4a2814'); }
  else if (c.kind === 'tronco') { rect(x - 95 * s, y - 62 * s, 190 * s, 58 * s, '#4a3220', 26 * s); ellipse(x + 92 * s, y - 33 * s, 18 * s, 29 * s, '#7a5a38'); ellipse(x + 92 * s, y - 33 * s, 9 * s, 15 * s, '#5a3e24'); for (let k = 0; k < 4; k++) rect(x - 80 * s + k * 42 * s, y - 56 * s, 26 * s, 3 * s, '#3a2616'); for (let k = 0; k < 14; k++) rect(x - 100 * s + k * 15 * s, y - (8 + (k % 3) * 9) * s, 3 * s, (14 + (k % 4) * 6) * s, '#3e5a26'); }
  else { ctx.strokeStyle = '#6a7a34'; ctx.lineWidth = 3 * s; for (let k = 0; k < 34; k++) { const bx = x - 95 * s + k * 5.8 * s, hh = (78 + (k * 37 % 30)) * s, lean = ((k * 13 % 9) - 4) * 3 * s; ctx.beginPath(); ctx.moveTo(bx, y); ctx.quadraticCurveTo(bx + lean * .3, y - hh * .6, bx + lean, y - hh); ctx.stroke(); } ctx.strokeStyle = '#8a9a44'; ctx.lineWidth = 2 * s; for (let k = 0; k < 18; k++) { const bx = x - 88 * s + k * 10 * s, hh = (60 + (k * 29 % 30)) * s; ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + 6 * s, y - hh); ctx.stroke(); } rect(x - 95 * s, y - 52 * s, 190 * s, 52 * s, '#33441e'); }
}
function drawShootTarget(o) {
  if (o.state === 'hidden' || o.rise <= 0) return;
  const p = shootPose(o), c = o.c;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, SHOOT.W, p.base); ctx.clip();
  if (o.kind === 'peao') drawShootPeao(p.x, p.y, p.js / 1.6);
  else if (o.state === 'dead') { ctx.globalAlpha = clamp(1 + o.t / .9, 0, 1); drawJavali(p.x, p.y + 10 * p.js, o.dir || 1, 0, p.js, true); }
  else drawJavali(p.x, p.y, o.dir || 1, Math.floor(performance.now() / 160 + (o.frame || 0)) % 2 && o.state === 'up' ? 1 : 0, p.js);
  ctx.restore();
  if (o.kind === 'cachaco' && o.hp > 1 && o.state === 'up') txt('cachaço', p.x, p.y - 64 * p.js, 13, '#ffd0a0', 'center', 'Arial', true);
}
// Chapéu, rosto e lenço de um dos cuiudos aparecendo atrás da moita.
function drawShootPeao(x, y, s) {
  ellipse(x, y - 10 * s, 26 * s, 16 * s, '#6a4a2a'); rect(x - 22 * s, y - 14 * s, 44 * s, 20 * s, '#5a3a20', 6 * s);
  ellipse(x, y - 40 * s, 18 * s, 20 * s, '#c8916a'); rect(x - 7 * s, y - 34 * s, 14 * s, 3 * s, '#3a2414'); ellipse(x - 6 * s, y - 44 * s, 2 * s, 2 * s, '#2a1a10'); ellipse(x + 6 * s, y - 44 * s, 2 * s, 2 * s, '#2a1a10');
  poly([[x - 16 * s, y - 22 * s], [x + 16 * s, y - 22 * s], [x, y - 8 * s]], '#c82a2a');
  ellipse(x, y - 58 * s, 40 * s, 8 * s, '#1a1410'); rect(x - 18 * s, y - 80 * s, 36 * s, 22 * s, '#1a1410', 8 * s); rect(x - 18 * s, y - 64 * s, 36 * s, 4 * s, '#7a2a1a');
}
function drawShootRunner() {
  const r = shoot.runner; if (!r) return;
  ctx.save(); if (r.dead != null) ctx.globalAlpha = clamp(r.dead / .8, 0, 1);
  drawJavali(r.x, r.y, r.dir, Math.floor(performance.now() / 70) % 2, .75 * 1.6, r.dead != null);
  if (r.dead == null) for (let k = 0; k < 3; k++) ellipse(r.x - r.dir * (40 + k * 18), r.y - 2, 10 - k * 2, 5 - k, `rgba(120,100,70,${.4 - k * .1})`);
  ctx.restore();
}
function drawShootCrosshair(x, y) {
  ctx.save(); ctx.strokeStyle = '#ffeec8'; ctx.lineWidth = 2.5; ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
  ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.stroke();
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { ctx.beginPath(); ctx.moveTo(x + dx * 10, y + dy * 10); ctx.lineTo(x + dx * 32, y + dy * 32); ctx.stroke(); }
  ellipse(x, y, 2.5, 2.5, '#ff6a4a'); ctx.restore();
}
function drawShootHud() {
  const s = shoot, w = SHOOT.W;
  rect(16, 14, 330, 64, 'rgba(20,14,10,.82)', 10, '#a77439');
  txt('🐗 ' + s.kills + ' / ' + SHOOT.need, 32, 46, 26, '#ffe2a6', 'left', 'Georgia', false);
  txt('⏱ ' + Math.ceil(s.left) + ' s', 190, 46, 24, s.left < 10 ? '#ff9a7a' : '#ffe2a6', 'left', 'Georgia', false);
  txt(G.shootBest ? 'recorde ' + G.shootBest : 'Tiro aos javalis', 32, 68, 12, '#d9c79f', 'left', 'Arial', false);
  rect(w - 246, 14, 230, 64, 'rgba(20,14,10,.82)', 10, '#a77439');
  for (let k = 0; k < SHOOT.shells; k++) { const on = k < s.shells, x = w - 230 + k * 32; rect(x, 26, 22, 40, on ? '#c83a2a' : '#3a2a20', 4, on ? '#ffd27a' : '#5a4a3a'); rect(x, 54, 22, 12, on ? '#d8b048' : '#4a3a2a', 2); }
  txt(s.reload > 0 ? 'Recarregando…' : 'R recarrega', w - 92, 46, 13, s.reload > 0 ? '#ffe27a' : '#d9c79f', 'center', 'Arial', false);
  txt('Mouse ou toque: mira e atira · WASD mira · Espaço atira · Esc larga a espingarda', w / 2, SHOOT.H - 16, 14, '#d9c79fcc', 'center', 'Arial', false);
  if (s.t < 0) { rect(0, 0, w, SHOOT.H, 'rgba(0,0,0,.35)'); const n = Math.ceil(-s.t / .8); txt(n > 0 ? String(n) : 'Valendo!', w / 2, SHOOT.H / 2, 80, '#ffe2a6', 'center', 'Georgia', true); txt('Os cuiudos estão tocando os javalis pro potreiro…', w / 2, SHOOT.H / 2 + 60, 20, '#d9c79f', 'center', 'Georgia', false); }
  if (s.paused) { rect(0, 0, w, SHOOT.H, 'rgba(0,0,0,.55)'); txt('Pausado · clique para continuar', w / 2, SHOOT.H / 2, 34, '#ffe2a6', 'center', 'Georgia', true); }
}

// ---------- Entrada ----------
function shootPoint(e) { const r = $('shootCanvas').getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * SHOOT.W, y: (e.clientY - r.top) / r.height * SHOOT.H }; }
document.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML('beforeend', '<section id="shootUI" class="shoot-ui hidden" aria-label="Tiro aos javalis"><canvas id="shootCanvas" width="1280" height="720"></canvas><div class="shoot-buttons"><button type="button" data-shoot="reload">Recarregar</button><button type="button" data-shoot="quit">Largar a espingarda</button></div></section>');
  const cv = $('shootCanvas');
  cv.addEventListener('pointermove', e => { if (shootActive()) shoot.aim = shootPoint(e); });
  cv.addEventListener('pointerdown', e => { if (!shootActive()) return; e.preventDefault(); if (shoot.paused) { shoot.paused = false; shoot.last = performance.now(); return; } if (e.button === 2) { shootReload(); return; } shoot.aim = shootPoint(e); shootFire(); });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  $('shootUI').addEventListener('click', e => { const b = e.target.closest('[data-shoot]'); if (!b || !shootActive()) return; if (b.dataset.shoot === 'reload') shootReload(); else endShoot(true); });
  // Durante o tiro, o teclado é todo da espingarda.
  window.addEventListener('keydown', e => {
    if (!shootActive()) return; const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
    e.preventDefault(); e.stopImmediatePropagation();
    if (k === 'escape') { endShoot(true); return; }
    if (shoot.paused) { shoot.paused = false; shoot.last = performance.now(); return; }
    if ((k === ' ' || k === 'e' || k === 'enter') && !e.repeat) shootFire(); else if (k === 'r') shootReload(); else shoot.keys.add(k);
  }, true);
  window.addEventListener('keyup', e => { if (!shootActive()) return; e.stopImmediatePropagation(); shoot.keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase()); }, true);
  // Saiu da janela: a rodada pausa (sem abrir o menu do jogo por cima).
  const pg = pauseGame; pauseGame = function (reason) { if (shootActive()) { shoot.paused = true; shoot.keys.clear(); return; } return pg(reason); };
});

// ---------- Ligações com a noite dos javalis ----------
{
  const spots = javaliSpots; javaliSpots = function () { return spots().map(s => ({ ...s, label: 'Javali! · caçar com a espingarda', act: shootIntro })); };
  cuiudosSpot = function () {
    const ev = mapEventToday(); if (ev?.id !== 'javali' || !mapNight() || worldOut?.map !== 'vila') return [];
    return [{ id: 'cuiudos', x: CUIUDOS.x, y: CUIUDOS.y, label: ev.st.done ? 'Tiro aos javalis · mais uma rodada' + (G.shootBest ? ' (recorde ' + G.shootBest + ')' : '') : 'Valter e os cuiudos · tiro aos javalis', act: shootIntro }];
  };
  const J = MAP_EVENTS.javali;
  J.desc = 'Os javalis invadiram as lavouras da Fronteira. Depois de fechar a bodega, fale com o Valter na frente da bodega: com a espingarda, derrube pelo menos ' + SHOOT.need + ' javalis em ' + SHOOT.time + ' segundos.';
  J.scene[J.scene.length - 1] = ['valter', 'Depois de fechar a bodega, me acha aqui na frente. Te empresto a espingarda do teu vô e os cuiudos tocam os bichos pro potreiro. Derruba ' + SHOOT.need + ' e a vizinhança te deve essa!'];
  J.tracker = () => { const st = mapEvState('javali'); if (st.done) return null; return { icon: '🐗', title: 'Invasão de javalis', goal: mapNight() ? 'Fale com o Valter na frente da bodega: derrube ' + SHOOT.need + ' javalis na espingarda' + (st.kills ? ' (melhor: ' + st.kills + ')' : '') : 'Hoje à noite, depois de fechar: tiro aos javalis com o Valter' }; };
  MAP_REMIND.javali = ['🐗 Os javalis estão soltos! O Valter te espera na frente da bodega com a espingarda.', '🐗 Tiro aos javalis: fale com o Valter na frente da bodega.'];
}
