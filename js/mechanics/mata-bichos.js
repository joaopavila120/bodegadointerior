// Os bichos brabos novos da mata adentro (quem aparece em cada trecho fica em mata-trechos.js).
//   · Cobra-coral: pequena e vistosa (vermelho, preto e branco), anda pela picada. Chegou perto, ela se enrola (o círculo
//     vermelho avisa) e dá o bote. A picada envenena: tira vida devagar até passar; o chá de marcela corta o veneno.
//   · Teiú: o lagartão preto e branco. Anda aos arrancos, morde dando o bote e, de perto, dá rabada em volta (o anel
//     amarelo avisa: sai de perto).
//   · Ouriço-cacheiro: devagar, mas eriça os espinhos e solta uma chuva deles. Bater nele de espinho em pé espeta a mão;
//     depois que ele solta os espinhos, fica baixinho e apanha em dobro.
//   · Corpo-seco: o morto que nem a terra quis. Fica enterrado num montinho até o Sadi chegar, levanta, anda devagar e
//     agarra (bater nele solta mais ligeiro). Derrubado, a terra cospe ele de volta uma vez; com o tição aceso, não volta.
'use strict';

CAVE_BEASTS.coral = { name: 'Cobra-coral', hp: 14, speed: 60, dmg: 8, r: 18, cash: [2, 4], from: 999, weight: 0 };
CAVE_BEASTS.teiu = { name: 'Teiú', hp: 40, speed: 170, dmg: 12, r: 28, cash: [3, 6], from: 999, weight: 0 };
CAVE_BEASTS.ourico = { name: 'Ouriço-cacheiro', hp: 30, speed: 45, dmg: 6, r: 24, cash: [3, 5], from: 999, weight: 0 };
CAVE_BEASTS.corposeco = { name: 'Corpo-seco', hp: 60, speed: 70, dmg: 12, r: 26, cash: [5, 9], from: 999, weight: 0 };
const MATA_BICHO = { coralBote: 95, venenoTempo: 6, teiuRabo: 140, espinhos: 12, espinhoVel: 380, agarra: 1.8 };
let mataGrab = null;   // o corpo-seco segurando o Sadi: { b, t, tick }

// ---------- Comportamento ----------
function mataTurn(b, dxp) { if (Math.abs(dxp) > 4) b.dx = dxp < 0 ? -1 : 1; }
function mataWander(b, speed, dt) {
  const r = mataGo(b, { x: b.tx, y: b.ty }, speed, dt);
  if (r === true || r === 'blocked' || b.t <= 0) { const a = Math.random() * Math.PI * 2, rr = 60 + Math.random() * 180, x = b.home.x + Math.cos(a) * rr, y = b.home.y + Math.sin(a) * rr * .7; if (mataFree(x, y)) { b.tx = x; b.ty = y; } b.t = 2 + Math.random() * 3; }
}
function coralTick(b, dt, p) {
  const B = CAVE_BEASTS.coral, dxp = p.x - b.x, dyp = p.y - b.y, d = Math.hypot(dxp, dyp) || 1;
  b.t -= dt; b.cool = Math.max(0, b.cool - dt); b.hurt = Math.max(0, b.hurt - dt); b.attack = Math.max(0, b.attack - dt);
  if (b.state === 'roam') { b.frame += dt * 6; mataWander(b, 40, dt); if (d < 260 * mataNoticeMul()) b.state = 'chase'; }
  else if (b.state === 'chase') {
    b.frame += dt * 9; if (d > 560) { b.state = 'roam'; return; }
    mataTurn(b, dxp); mataStep(b, dxp / d * 75, dyp / d * 75, dt);
    if (d < MATA_BICHO.coralBote && b.cool <= 0) { b.state = 'coil'; b.t = .45; b.tx = p.x; b.ty = p.y; AudioEngine.hiss?.(.4, .04, 3600); }
  } else if (b.state === 'coil') { b.frame += dt * 2; if (b.t <= 0) { b.state = 'bite'; b.t = .18; const k = Math.hypot(b.tx - b.x, b.ty - b.y) || 1; b.vx = (b.tx - b.x) / k; b.vy = (b.ty - b.y) / k; AudioEngine.swoosh?.(.04); } }
  else if (b.state === 'bite') {
    mataStep(b, b.vx * 380, b.vy * 380, dt);
    if (b.t <= 0) { if (Math.hypot(p.x - b.x, p.y - b.y) < B.r + 40) { const before = caveState().hp; mataHurt(B.dmg, b); if (caveState().hp < before) { mataBuffs.veneno = MATA_BICHO.venenoTempo; mataBuffs.venenoTick = .6; effect('Veneno de coral!', p.x, p.y - 160, '#b8f070', 16); } b.attack = .3; } b.state = 'rest'; b.t = .9; b.cool = 2.2; }
  } else if (b.state === 'rest') { if (b.t <= 0) b.state = 'chase'; }
}
function teiuTick(b, dt, p) {
  const B = CAVE_BEASTS.teiu, dxp = p.x - b.x, dyp = p.y - b.y, d = Math.hypot(dxp, dyp) || 1;
  b.t -= dt; b.cool = Math.max(0, b.cool - dt); b.hurt = Math.max(0, b.hurt - dt); b.attack = Math.max(0, b.attack - dt);
  if (b.state === 'roam') { b.frame += dt * 5; mataWander(b, 50, dt); if (d < 300 * mataNoticeMul()) { b.state = 'dash'; b.t = .5; AudioEngine.hiss?.(.3, .04, 1400); } return; }
  if (d > 700 && b.state !== 'tail') { b.state = 'roam'; return; }
  // Aos arrancos: corre um pedaço, para, olha, corre de novo.
  if (b.state === 'dash') { b.frame += dt * 14; mataTurn(b, dxp); if (d > 70) mataStep(b, dxp / d * 260, dyp / d * 260, dt); if (b.t <= 0) { b.state = 'pause'; b.t = .35 + Math.random() * .3; } }
  else if (b.state === 'pause') { mataTurn(b, dxp); if (b.t <= 0) { b.state = 'dash'; b.t = .45 + Math.random() * .3; } }
  if ((b.state === 'dash' || b.state === 'pause') && d < 150 && b.cool <= 0) {
    if (d < 110 && Math.random() < .45) { b.state = 'tailwind'; b.t = .5; AudioEngine.hiss?.(.4, .05, 900); }
    else { b.state = 'windup'; b.t = .35; b.vx = dxp / d; b.vy = dyp / d; mataTurn(b, dxp); AudioEngine.hiss?.(.25, .05, 2200); }
    return;
  }
  if (b.state === 'windup') { if (b.t <= 0) { b.state = 'lunge'; b.t = .24; } }
  else if (b.state === 'lunge') { b.frame += dt * 16; if (!mataStep(b, b.vx * 480, b.vy * 480, dt)) b.t = 0; if (Math.hypot(p.x - b.x, p.y - b.y) < B.r + 30) { mataHurt(B.dmg, b); b.attack = .3; } if (b.t <= 0) { b.state = 'rest'; b.t = .7; b.cool = 1.4; } }
  else if (b.state === 'tailwind') { if (b.t <= 0) { b.state = 'tail'; b.t = .3; b.dx = -b.dx; AudioEngine.swoosh?.(.07); if (Math.hypot(p.x - b.x, (p.y - b.y) * 1.2) < MATA_BICHO.teiuRabo) { mataHurt(10, b); const k = d; mataStep(worldOut, dxp / k * 70, dyp / k * 70, 1); } } }
  else if (b.state === 'tail') { if (b.t <= 0) { b.state = 'rest'; b.t = .6; b.cool = 1.6; b.dx = dxp < 0 ? -1 : 1; } }
  else if (b.state === 'rest') { if (b.t <= 0) { b.state = 'dash'; b.t = .4; } }
}
function ouricoTick(b, dt, p, N) {
  const dxp = p.x - b.x, dyp = p.y - b.y, d = Math.hypot(dxp, dyp) || 1;
  b.t -= dt; b.cool = Math.max(0, b.cool - dt); b.hurt = Math.max(0, b.hurt - dt); b.attack = Math.max(0, b.attack - dt);
  if (b.state === 'roam' || b.state === 'walk') {
    b.frame += dt * 4;
    if (d < 320 * mataNoticeMul()) { mataTurn(b, dxp); if (d > 160) { b.state = 'walk'; mataStep(b, dxp / d * 45, dyp / d * 45, dt); } if (b.cool <= 0) { b.state = 'bristle'; b.t = .7; AudioEngine.noise?.(.3, .05, 3000); } }
    else { b.state = 'roam'; mataWander(b, 30, dt); }
  } else if (b.state === 'bristle') { mataTurn(b, dxp); if (b.t <= 0) {
    // A chuva de espinhos: em volta e uns mirando o Sadi.
    b.state = 'shoot'; b.t = .25; AudioEngine.swoosh?.(.06); const v = MATA_BICHO.espinhoVel, aim = Math.atan2(dyp, dxp);
    for (let k = 0; k < MATA_BICHO.espinhos; k++) { const a = k / MATA_BICHO.espinhos * Math.PI * 2; N.shots.push({ kind: 'espinho', x: b.x, y: b.y - 22, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .8, t: 1.1, dmg: CAVE_BEASTS.ourico.dmg, dmgMul: b.dmgMul }); }
    for (const s of [-.18, 0, .18]) N.shots.push({ kind: 'espinho', x: b.x, y: b.y - 22, vx: Math.cos(aim + s) * v * 1.15, vy: Math.sin(aim + s) * v * 1.15, t: 1.2, dmg: CAVE_BEASTS.ourico.dmg, dmgMul: b.dmgMul });
  } }
  else if (b.state === 'shoot') { if (b.t <= 0) { b.state = 'rest'; b.t = 1.8; } }
  else if (b.state === 'rest') { if (b.t <= 0) { b.state = 'walk'; b.cool = 1.4; } }
}
function corpoSecoTick(b, dt, p) {
  const B = CAVE_BEASTS.corposeco, dxp = p.x - b.x, dyp = p.y - b.y, d = Math.hypot(dxp, dyp) || 1;
  b.t -= dt; b.cool = Math.max(0, b.cool - dt); b.hurt = Math.max(0, b.hurt - dt); b.attack = Math.max(0, b.attack - dt);
  if (b.state === 'buried') { if (d < 300 * mataNoticeMul()) { b.state = 'rise'; b.t = 1.2; AudioEngine.caveVoice?.([140, 110, 90], 1.1, { formant: 500, q: 1.2, vol: .06, vib: 6, rate: 4 }); fxPuffs(b.x, b.y - 10, 12, 100, '#6a5a40'); } return; }
  if (b.state === 'rise') { if (b.t <= 0) { b.state = 'walk'; b.t = 0; } return; }
  if (b.state === 'down') { if (b.t <= 0) { b.state = 'rise'; b.t = 1.2; fxPuffs(b.x, b.y - 10, 12, 100, '#6a5a40'); effect('A terra não quis ele!', b.x, b.y - 150, '#c8e0a0', 16); AudioEngine.caveVoice?.([150, 100], 1, { formant: 450, vol: .06 }); } return; }
  if (b.state === 'walk') {
    b.frame += dt * 3.5; mataTurn(b, dxp); if (d > 760) return;
    mataStep(b, dxp / d * B.speed, dyp / d * B.speed, dt);
    if (d < 95 && b.cool <= 0 && !mataGrab) { b.state = 'reach'; b.t = .6; AudioEngine.caveVoice?.([200, 150], .5, { formant: 600, vol: .05 }); }
  } else if (b.state === 'reach') {
    mataTurn(b, dxp);
    if (b.t <= 0) { if (d < 85 && !mataGrab && !(mataNight?.inv > 0)) { b.state = 'grab'; mataGrab = { b, t: MATA_BICHO.agarra, tick: .2 }; keys.clear(); effect('O corpo-seco te agarrou! Bate pra soltar!', p.x, p.y - 170, '#ffb3a0', 16); } else { b.state = 'walk'; b.cool = 1; } }
  } else if (b.state === 'grab') { if (mataGrab?.b !== b) { b.state = 'stagger'; b.t = .8; b.cool = 2.5; } }
  else if (b.state === 'stagger') { mataStep(b, -dxp / d * 90, -dyp / d * 90, dt); if (b.t <= 0) b.state = 'walk'; }
}
// O agarrão: o Sadi não sai do lugar e a vida vai indo; cada facãozada solta mais ligeiro.
function mataGrabTick(dt) {
  const g = mataGrab; if (!g) return; const b = g.b;
  if (b.hp <= 0 || b.state !== 'grab' || !mataNight || mataNight.faint) { mataGrab = null; if (b.state === 'grab') { b.state = 'stagger'; b.t = .8; b.cool = 2.5; } return; }
  g.t -= dt; g.tick -= dt; const p = worldOut, d = Math.hypot(p.x - b.x, p.y - b.y) || 1; if (d > 60) { p.x = b.x + (p.x - b.x) / d * 60; p.y = b.y + (p.y - b.y) / d * 60; }
  if (g.tick <= 0) { g.tick = .45; const st = caveState(), loss = Math.max(1, Math.round(4 * (b.dmgMul || 1) * (caveUp('chapeu') ? .85 : 1))); st.hp = Math.max(0, st.hp - loss); mataNight.hurt = .2; effect('−' + loss, p.x, p.y - 130, '#ff8a7a', 20); AudioEngine.caveOuch?.(); if (st.hp <= 0) { mataGrab = null; mataFaint(); return; } }
  if (g.t <= 0) { mataGrab = null; b.state = 'stagger'; b.t = .8; b.cool = 2.5; mataNight.inv = .8; effect('Soltou!', p.x, p.y - 150, '#d8ffac', 16); }
}
// Os espinhos voando (e o que mais for atirado: os torrões do cachaço usam o mesmo caminho, em mata-chefes.js).
function mataShotsTick(N, dt) {
  const p = worldOut;
  for (const s of N.shots || []) {
    s.t -= dt; if (s.kind === 'torrao') { s.k = Math.min(1, (s.k || 0) + dt / s.time); s.x = s.x0 + (s.tx - s.x0) * s.k; s.y = s.y0 + (s.ty - s.y0) * s.k; if (s.k >= 1) { s.t = 0; fxPuffs(s.tx, s.ty - 10, 8, 90, '#6a5232'); AudioEngine.thud?.(); if (Math.hypot(p.x - s.tx, (p.y - s.ty) * 1.3) < 70) mataHurt(s.dmg, s); } continue; }
    s.x += s.vx * dt; s.y += s.vy * dt;
    if (Math.hypot(p.x - s.x, p.y - 40 - s.y) < 30) { s.t = 0; mataHurt(s.dmg, s); effect('Espinho!', p.x, p.y - 150, '#ffe2a6', 14); }
    else if (!mataFree(s.x, s.y + 22)) s.t = 0;
  }
  if (N.shots) N.shots = N.shots.filter(s => s.t > 0);
}

// ---------- Desenho ----------
function mataHpBar(b, name, y = 80) { if (b.hp < b.max && b.hp > 0) { txt(name, b.x, b.y - y, 11, '#ffe2a6'); bar(b.x - 20, b.y - y + 6, 40, b.hp / b.max, '#df674c'); } }
// Coral: o corpo em onda, com os anéis vermelho, preto e branco; a cabeça preta com a faixa clara atrás.
function drawCoral(b) {
  const dir = b.dx < 0 ? -1 : 1, n = 18, coil = b.state === 'coil', bite = b.state === 'bite' ? clamp(1 - b.t / .18, 0, 1) : 0;
  ctx.save(); ctx.translate(b.x, b.y); ctx.scale(dir * 1.7, 1.7); if (b.hurt > 0) ctx.globalAlpha = .6 + .4 * Math.sin(frameClock * 40);
  ellipse(-8, 1, 30, 6, 'rgba(10,14,8,.35)');
  const pts = []; for (let i = 0; i < n; i++) { const k = i / (n - 1), amp = coil ? 7 : 4.5; let x = 16 - k * (coil ? 34 : 56), y = -3 + Math.sin(b.frame * 1.4 - k * 7) * amp * (.35 + k * .65); if (coil) { const a = k * Math.PI * 2.2; x = Math.cos(a) * (14 - k * 8) - 4; y = -4 + Math.sin(a) * (6 - k * 3); } if (i === 0) x += bite * 22, y -= coil ? 8 + Math.sin(frameClock * 30) * 1.5 : 0; pts.push([x, y]); }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const seg = (i, color, w) => { ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(...pts[i]); ctx.lineTo(...pts[i + 1]); ctx.stroke(); };
  for (let i = n - 2; i >= 0; i--) seg(i, '#120806', 7.6 - i / n * 3);
  const ring = ['#d32a1a', '#d32a1a', '#d32a1a', '#141010', '#f2e6b2', '#141010', '#f2e6b2', '#141010'];
  for (let i = n - 2; i >= 1; i--) seg(i, ring[i % ring.length], 5.6 - i / n * 2.6);
  const [hx, hy] = pts[0]; ellipse(hx - 4, hy, 3.4, 3, '#f2e6b2'); ellipse(hx + 1, hy, 4.6, 3.6, '#141010'); ellipse(hx + 2, hy - 1.2, 1, 1, '#e8e0c0');
  if (coil || bite) { ctx.strokeStyle = '#d83a2a'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(hx + 5, hy); ctx.lineTo(hx + 9, hy - 1.4); ctx.moveTo(hx + 5, hy); ctx.lineTo(hx + 9, hy + 1.4); ctx.stroke(); }
  ctx.restore(); mataHpBar(b, 'Cobra-coral', 60);
}
// Teiú: o lagarto preto com as faixas de pintas claras, o rabo comprido e as quatro patas abertas. O papo-amarelo
// (o chefe do trecho 13) é o mesmo bicho, enorme, com o papo amarelo que incha quando ele chia.
function drawTeiuBody(b, S = 1, papo = 0) {
  const dir = b.dx < 0 ? -1 : 1, moving = ['dash', 'lunge', 'chase', 'roam', 'walk', 'charge', 'run'].includes(b.state), ph = b.frame * 1.6, sway = moving ? Math.sin(ph) * 3 : Math.sin(frameClock * 1.5) * .8;
  const black = papo ? '#24261c' : '#1d1b18', light = papo ? '#d8cf9a' : '#ece6d0', tailFlip = b.state === 'tail' || b.state === 'sweep' ? Math.sin(clamp(1 - b.t / .3, 0, 1) * Math.PI) * 26 : 0;
  ctx.save(); ctx.translate(b.x, b.y); ctx.scale(dir * S, S); if (b.hurt > 0) ctx.globalAlpha = .65 + .35 * Math.sin(frameClock * 40);
  ellipse(-14, 1, 64, 9, 'rgba(10,14,8,.38)');
  // O rabo, afinando, com as faixas.
  const tail = []; for (let i = 0; i <= 12; i++) { const k = i / 12; tail.push([-28 - k * 92, -11 + k * 7 + Math.sin(ph * .7 - k * 3) * (2 + k * 5) * (moving ? 1 : .4) - tailFlip * k * k]); }
  ctx.lineCap = 'round'; for (let i = 0; i < 12; i++) { const w = 13 - i * 1; ctx.strokeStyle = black; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(...tail[i]); ctx.lineTo(...tail[i + 1]); ctx.stroke(); if (i % 2) { ctx.strokeStyle = light; ctx.lineWidth = Math.max(1.4, w * .45); ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(...tail[i]); ctx.lineTo(...tail[i + 1]); ctx.stroke(); ctx.setLineDash([]); } }
  // As patas: de trás e da frente, alternando no passo.
  const leg = (x, o, far) => { const c = far ? '#141310' : black; ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, -12); ctx.lineTo(x + 6 + o, -4); ctx.lineTo(x + 2 + o * 1.4, 0); ctx.stroke(); for (let t = -1; t <= 1; t++) { ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 2 + o * 1.4, 0); ctx.lineTo(x + 6 + o * 1.4 + t * 2, 1.5); ctx.stroke(); } };
  const st = moving ? Math.sin(ph) * 6 : 0; leg(-20, -st, true); leg(20, st, true); leg(-14, st, false); leg(26, -st, false);
  // O corpo, com as faixas de pintas brancas.
  ctx.fillStyle = black; ctx.beginPath(); ctx.ellipse(0, -15 + sway * .2, 36, 12, 0, 0, Math.PI * 2); ctx.fill();
  for (let k = -3; k <= 3; k++) for (let j = 0; j < 4; j++) ellipse(k * 9 + (j % 2) * 3, -24 + j * 5 + sway * .2, 1.8, 1.3, light);
  // Pescoço, papo e cabeça.
  const neck = b.state === 'windup' || b.state === 'chiado' ? -3 : 0, puff = papo ? clamp(papo, 0, 1) : 0;
  ctx.fillStyle = black; ctx.beginPath(); ctx.ellipse(34, -17 + neck, 13, 10, -.15, 0, Math.PI * 2); ctx.fill();
  if (papo) ellipse(46, -9 + neck, 10 + puff * 9, 6 + puff * 7, '#e8b81c');
  ctx.fillStyle = black; ctx.beginPath(); ctx.moveTo(38, -26 + neck); ctx.quadraticCurveTo(58, -26 + neck, 66, -17 + neck); ctx.quadraticCurveTo(58, -9 + neck, 40, -9 + neck); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = papo ? '#b88a10' : '#5a5448'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(44, -15 + neck); ctx.lineTo(64, -17 + neck); ctx.stroke();
  for (let j = 0; j < 3; j++) ellipse(42 + j * 6, -21 + neck, 1.4, 1.1, light);
  ellipse(50, -21 + neck, 2.6, 2.2, papo ? '#f0c040' : '#c8b878'); ellipse(50.6, -21 + neck, 1.1, 1.4, '#0a0806');
  if (b.state === 'windup' || b.state === 'chiado' || Math.sin(frameClock * 2 + b.x) > .96) { ctx.strokeStyle = '#c84a6a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(66, -17 + neck); ctx.lineTo(74, -18 + neck); ctx.lineTo(77, -20 + neck); ctx.moveTo(74, -18 + neck); ctx.lineTo(77, -16 + neck); ctx.stroke(); }
  ctx.restore();
}
function drawTeiu(b) { drawTeiuBody(b, .9); mataHpBar(b, 'Teiú', 60); }
// Ouriço-cacheiro: bola de espinhos de ponta clara, o nariz grande e rosado e o rabo enrolado.
function drawOurico(b) {
  const dir = b.dx < 0 ? -1 : 1, up = b.state === 'bristle' ? clamp(1 - b.t / .7, 0, 1) : b.state === 'shoot' ? 1 : b.state === 'rest' ? 0 : .2, walk = b.state === 'walk' || b.state === 'roam', step = walk ? Math.sin(b.frame * 2) * 2 : 0;
  ctx.save(); ctx.translate(b.x, b.y); ctx.scale(dir * 1.45, 1.45); if (b.hurt > 0) ctx.globalAlpha = .6 + .4 * Math.sin(frameClock * 40);
  if (b.state === 'bristle') ctx.translate(Math.sin(frameClock * 50) * 1, 0);
  ellipse(0, 1, 26, 6, 'rgba(10,14,8,.35)');
  ctx.strokeStyle = '#5a4428'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-18, -12); ctx.quadraticCurveTo(-34, -10, -32, -22); ctx.quadraticCurveTo(-30, -30, -24, -26); ctx.stroke();
  for (const [lx, o] of [[-12, step], [-4, -step], [8, step], [14, -step]]) rect(lx + o - 2, -8, 4, 8, '#3a2a18', 1);
  ellipse(0, -17, 22 + up * 3, 14 + up * 3, '#6a5232');
  const n = 30, len = 8 + up * 13;
  for (let i = 0; i < n; i++) { const a = -Math.PI * .98 + i / (n - 1) * Math.PI * 1.1 + Math.sin(i * 7.3) * .05, bx = Math.cos(a) * 18, by = -17 + Math.sin(a) * 11, ex = bx + Math.cos(a) * len * (.8 + (i % 3) * .12), ey = by + Math.sin(a) * len * (.8 + (i % 3) * .12); ctx.strokeStyle = '#4a3820'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo((bx + ex) / 2, (by + ey) / 2); ctx.stroke(); ctx.strokeStyle = '#efe2b6'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo((bx + ex) / 2, (by + ey) / 2); ctx.lineTo(ex, ey); ctx.stroke(); }
  ellipse(17, -14, 9, 8, '#7a5e3a'); ellipse(25, -13, 5, 4.4, '#e0a0a0'); ellipse(26.5, -13.5, 1.4, 1.2, '#8a4a4a'); ellipse(18, -17, 1.6, 1.6, '#100806');
  ctx.restore(); mataHpBar(b, 'Ouriço-cacheiro', 70);
}
// Corpo-seco: magro de pele e osso, roupa em farrapo, cabelo ralo e os olhos fundos com uma brasa fraca; levanta de um
// montinho de terra e anda curvado, de braço comprido estendido.
function drawCorpoSeco(b) {
  const dir = b.dx < 0 ? -1 : 1;
  // O montinho de terra (enterrado, ou caído esperando a terra cuspir de volta).
  if (b.state === 'buried' || b.state === 'rise' || b.state === 'down') { ellipse(b.x, b.y - 2, 38, 12, '#4a3a26'); ellipse(b.x - 6, b.y - 6, 26, 7, '#5a4830'); ctx.strokeStyle = '#3a2a18'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b.x + 22, b.y - 4); ctx.lineTo(b.x + 22, b.y - 34); ctx.moveTo(b.x + 14, b.y - 24); ctx.lineTo(b.x + 30, b.y - 26); ctx.stroke(); }
  if (b.state === 'buried') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(b.x, b.y - 10, 50, .07 + .03 * Math.sin(frameClock * 2 + b.x), '160,220,140'); ctx.restore(); return; }
  const rise = b.state === 'rise' ? clamp(1 - b.t / 1.2, 0, 1) : b.state === 'down' ? 0 : 1; if (rise <= 0) return;
  const walk = b.state === 'walk', ph = b.frame * 2, leg = walk ? Math.sin(ph) * 5 : 0, reach = b.state === 'reach' || b.state === 'grab' ? 1 : 0, lean = walk ? 4 : 0;
  ctx.save(); ctx.translate(b.x, b.y); ctx.beginPath(); ctx.rect(-90, -220, 180, 222); ctx.clip(); ctx.translate(0, (1 - rise) * 150); ctx.scale(dir * 1.3, 1.3);
  if (b.hurt > 0) ctx.globalAlpha = .6 + .4 * Math.sin(frameClock * 40);
  ellipse(0, 1, 20, 6, 'rgba(10,14,8,.4)');
  const skin = '#8f8168', dark = '#3a3024', rag = '#4a4234';
  for (const [x, o] of [[-5, leg], [5, -leg]]) { ctx.strokeStyle = skin; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, -46); ctx.lineTo(x + o * .6, -22); ctx.lineTo(x + o, -2); ctx.stroke(); ellipse(x + o + 2, -1, 5, 2.5, dark); }
  ctx.fillStyle = rag; ctx.beginPath(); ctx.moveTo(-9, -50); ctx.lineTo(9, -50); ctx.lineTo(11, -30); ctx.lineTo(4, -34); ctx.lineTo(0, -28); ctx.lineTo(-5, -34); ctx.lineTo(-11, -30); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.translate(lean * .3, 0); ctx.rotate(lean * .03);
  ctx.fillStyle = skin; ctx.beginPath(); ctx.moveTo(-10, -84); ctx.lineTo(10, -84); ctx.lineTo(8, -50); ctx.lineTo(-8, -50); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#6a5e48'; ctx.lineWidth = 1.2; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(-7, -78 + k * 5); ctx.quadraticCurveTo(0, -75 + k * 5, 7, -78 + k * 5); ctx.stroke(); }
  ctx.fillStyle = rag; ctx.beginPath(); ctx.moveTo(-11, -86); ctx.lineTo(-4, -86); ctx.lineTo(-7, -62); ctx.lineTo(-12, -66); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(11, -86); ctx.lineTo(5, -86); ctx.lineTo(9, -58); ctx.lineTo(12, -70); ctx.closePath(); ctx.fill();
  // Braços compridos: pendurados, ou estendidos pra agarrar.
  ctx.strokeStyle = skin; ctx.lineWidth = 3.4; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 9, -82); if (reach) { ctx.lineTo(14 + s * 2, -72); ctx.lineTo(34, -70 + s * 3); } else { ctx.lineTo(s * 12 + 2, -62); ctx.lineTo(s * 10 + 6 + Math.sin(ph + s) * 2, -42); } ctx.stroke(); }
  if (reach) for (const s of [-1, 1]) for (let f = 0; f < 3; f++) { ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(34, -70 + s * 3); ctx.lineTo(40, -72 + s * 3 + f * 2); ctx.stroke(); }
  // Cabeça: osso de cara, olho fundo, cabelo ralo.
  ellipse(2, -95, 9, 11, '#9a8b70'); ellipse(5, -97, 2.6, 3, '#1a140e'); ellipse(-1, -97, 2.4, 2.8, '#1a140e'); rect(-1, -88, 8, 3, '#2a2016', 1);
  ctx.strokeStyle = '#b8b0a0'; ctx.lineWidth = 1; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-6 + k * 2.4, -104); ctx.quadraticCurveTo(-10 + k * 2, -96, -9 + k * 1.6 + Math.sin(frameClock * 2 + k), -84); ctx.stroke(); }
  ctx.restore(); ctx.restore();
  // Os olhos: o mesmo giro da cabeça curvada, pra brasa cair no lugar.
  const tilt = lean * .03; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const ex of [5, -1]) { const lx = ex + lean * .3, ly = -97; glow(b.x + dir * 1.3 * (lx * Math.cos(tilt) - ly * Math.sin(tilt)), b.y + 1.3 * (lx * Math.sin(tilt) + ly * Math.cos(tilt)) + (1 - rise) * 150, 6, .55 * rise, '190,255,150'); } ctx.restore();
  mataHpBar(b, 'Corpo-seco', 150);
}
function drawMataShots(N) {
  for (const s of N.shots || []) {
    if (s.kind === 'torrao') { const k = s.k || 0, h = Math.sin(k * Math.PI) * 120; ellipse(s.tx, s.ty, 60 * (.5 + k * .5), 22 * (.5 + k * .5), `rgba(230,70,40,${.15 + k * .25})`); ellipse(s.x, s.y, 10, 4, 'rgba(10,14,8,.35)'); ellipse(s.x, s.y - h, 11, 9, '#5a4428'); ellipse(s.x - 3, s.y - h - 3, 4, 3, '#7a6040'); continue; }
    const a = Math.atan2(s.vy, s.vx); ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(a); ctx.strokeStyle = '#4a3820'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(0, 0); ctx.stroke(); ctx.strokeStyle = '#f2e6bc'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(9, 0); ctx.stroke(); ctx.restore();
  }
}
// Os avisos no chão: o enrolar da coral, a rabada do teiú e o eriçar do ouriço.
function drawMataBichoWarnings(N) {
  for (const b of N.beasts) {
    if (b.hp <= 0) continue; const k = .5 + .5 * Math.sin(frameClock * 18);
    if (b.kind === 'coral' && b.state === 'coil') { ellipse(b.tx, b.ty, 40, 16, `rgba(230,50,36,${.2 + .15 * k})`); ctx.strokeStyle = `rgba(255,70,40,${.7 + .3 * k})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(b.tx, b.ty, 40, 16, 0, 0, Math.PI * 2); ctx.stroke(); }
    if (b.kind === 'teiu' && b.state === 'tailwind') { const t = 1 - Math.max(0, b.t) / .5; ellipse(b.x, b.y, MATA_BICHO.teiuRabo * t, MATA_BICHO.teiuRabo * t / 1.2 * .6, `rgba(255,190,40,${.12 + .18 * t})`); ctx.strokeStyle = 'rgba(255,200,60,.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(b.x, b.y, MATA_BICHO.teiuRabo, MATA_BICHO.teiuRabo / 1.2 * .6, 0, 0, Math.PI * 2); ctx.stroke(); }
    if (b.kind === 'teiu' && b.state === 'windup') { ctx.strokeStyle = 'rgba(255,120,40,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x, b.y - 14); ctx.lineTo(b.x + b.vx * 130, b.y - 14 + b.vy * 130); ctx.stroke(); }
    if (b.kind === 'ourico' && b.state === 'bristle') { const t = 1 - Math.max(0, b.t) / .7; ctx.strokeStyle = `rgba(255,220,120,${.4 + .5 * t})`; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.ellipse(b.x, b.y - 10, 90 + t * 60, (90 + t * 60) * .55, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
    if (b.kind === 'corposeco' && b.state === 'reach') { ellipse(b.x + b.dx * 40, b.y, 50, 20, `rgba(150,230,120,${.15 + .15 * k})`); }
  }
}

// ---------- Ligações ----------
{
  const beast = mataBeastTick; mataBeastTick = function (b, dt, p) {
    if (b.kind === 'coral') { coralTick(b, dt, p); return; }
    if (b.kind === 'teiu') { teiuTick(b, dt, p); return; }
    if (b.kind === 'ourico') { ouricoTick(b, dt, p, mataNight); return; }
    if (b.kind === 'corposeco') { corpoSecoTick(b, dt, p); return; }
    return beast(b, dt, p);
  };
  const combat = mataCombatTick; mataCombatTick = function (dt) {
    combat(dt); const N = mataNight;
    if (!N || !mataCombatOn() || N.faint || paused || modal || scene || phoneOpen || worldTalkOpen()) { if (!N) mataGrab = null; return; }
    mataShotsTick(N, dt); mataGrabTick(dt);
  };
  // Golpes: espinho em pé espeta a mão; ouriço baixinho apanha em dobro; enterrado ou caído, o corpo-seco não sente;
  // e cada facãozada no corpo-seco que agarrou solta mais ligeiro.
  const attack = mataAttack; mataAttack = function () {
    const N = mataNight; if (!N) return attack();
    const before = new Map(N.beasts.filter(b => b.hp > 0 && ['ourico', 'corposeco'].includes(b.kind)).map(b => [b, { hp: b.hp, state: b.state }])), cd = N.cd;
    attack(); if (N.cd === cd) return;
    for (const [b, o] of before) {
      const lost = o.hp - b.hp; if (lost <= 0) continue;
      if (b.kind === 'corposeco' && ['buried', 'rise', 'down'].includes(o.state)) { b.hp = o.hp; continue; }
      if (b.kind === 'corposeco' && mataGrab?.b === b) mataGrab.t -= .55;
      if (b.kind === 'ourico' && o.state === 'rest' && b.hp > 0) { b.hp -= lost; effect('Em dobro!', b.x, b.y - 100, '#ffe28a', 14); if (b.hp <= 0) mataKill(b); }
      else if (b.kind === 'ourico' && o.state !== 'rest' && b.hp > 0) { b.hp = Math.min(b.max, b.hp + Math.round(lost / 2)); if (N.inv <= 0) { mataHurt(3, b); effect('Ai! Espinho na mão!', worldOut.x, worldOut.y - 165, '#ffb3a0', 14); } }
    }
  };
  // O corpo-seco derrubado: a terra cospe ele de volta uma vez (com o tição aceso, não).
  const kill = mataKill; mataKill = function (b) {
    if (b.kind === 'corposeco' && !b.back && !(inTrecho() && trechoDay().ticao)) { b.back = true; b.hp = Math.round(b.max * .5); b.state = 'down'; b.t = 3.2; if (mataGrab?.b === b) mataGrab = null; fxPuffs(b.x, b.y - 30, 14, 140, '#6a5a40'); effect('O corpo-seco desmoronou…', b.x, b.y - 120, '#c8e0a0', 16); AudioEngine.thud?.(); return; }
    kill(b);
  };
  const move = movementBonus; movementBonus = function () { return move() - (mataGrab ? 1 : 0); };
  const draw = drawCaveBeast; drawCaveBeast = function (b) {
    if (b.kind === 'coral') { drawCoral(b); return; } if (b.kind === 'teiu') { drawTeiu(b); return; }
    if (b.kind === 'ourico') { drawOurico(b); return; } if (b.kind === 'corposeco') { drawCorpoSeco(b); return; }
    draw(b);
  };
  const layers = drawMataNightLayers; drawMataNightLayers = function (list, seen) {
    layers(list, seen); const N = mataNight; if (!N) return;
    if (N.shots?.length) list.push({ y: 7e6, draw: () => drawMataShots(N) });
  };
  const warn = drawMataWarnings; drawMataWarnings = function () { warn(); if (mataNight && mataCombatOn() && !scene) drawMataBichoWarnings(mataNight); };
  const cry = AudioEngine.caveCry; AudioEngine.caveCry = function (kind, dead = false) {
    if (kind === 'coral') { this.hiss?.(dead ? .4 : .15, .05, 3400); return; }
    if (kind === 'teiu') { this.hiss?.(dead ? .6 : .25, .06, 1300); return; }
    if (kind === 'ourico') { this.note?.(dead ? 900 : 1400, .08, 'square', .03); return; }
    if (kind === 'corposeco') { this.caveVoice?.(dead ? [160, 90, 60] : [130, 100], dead ? 1.2 : .4, { formant: 450, q: 1.2, vol: .06, vib: 5, rate: 4 }); return; }
    return cry.call(this, kind, dead);
  };
}
