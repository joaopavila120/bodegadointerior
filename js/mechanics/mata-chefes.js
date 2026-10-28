// Os chefes da mata adentro, na clareira do meio do trecho (onde depois fica o acampamento).
//   · No fim do Pinheiral (trecho 11), o Javali Cachaço: o porco velho do pinheiral, do tamanho de um boi, de presa amarela e crina de arame.
//     Investe em linha reta (a faixa vermelha avisa; se bater num tronco, fica tonto e apanha mais), dá presada de perto,
//     fuça a terra e joga torrão (o círculo no chão avisa onde cai) e ronca chamando a vara de javalis.
//   · No fim da Encosta (trecho 21), o Lagarto do papo-amarelo: um teiú enorme, de papo amarelo, que guarda a descida da serra. Dá o bote em
//     linha reta, rabada em volta (o anel amarelo), se enterra e sai debaixo do Sadi (o círculo vermelho avisa; depois de
//     sair, fica preso um pouco) e, brabo, incha o papo e solta um chiado que empurra e deixa tonto. Chama teiús.
//   Vencido, o acampamento do trecho acende e a picada abre.
'use strict';

CAVE_BEASTS.cachaco = { name: 'Javali Cachaço', hp: 1200, speed: 140, dmg: 20, r: 56, cash: [40, 60], from: 999, weight: 0 };
CAVE_BEASTS.papo = { name: 'Lagarto do papo-amarelo', hp: 1500, speed: 170, dmg: 22, r: 50, cash: [60, 90], from: 999, weight: 0 };
const BOSS_INFO = {
  cachaco: { title: 'O Javali Cachaço', icon: '🐗', reward: { cash: 220, xp: 160, rep: 4 }, xp: 120 },
  papo: { title: 'O Lagarto do papo-amarelo', icon: '🦎', reward: { cash: 380, xp: 260, rep: 6 }, xp: 200 }
};
const mataBossFx = { dizzy: 0 };
function trechoBoss(N = mataNight) { return N?.beasts.find(b => b.boss && b.hp > 0) || null; }
function bossInArena(T, x, y, grow = 1) { const c = T.camp; return !!c && ((x - c.x) / (c.rx * grow)) ** 2 + ((y - c.y) / (c.ry * grow)) ** 2 < 1; }
function bossSpot(T, R, margin = .75) { const c = T.camp; for (let k = 0; k < 40; k++) { const a = R() * Math.PI * 2, r = Math.sqrt(R()) * margin, x = c.x + Math.cos(a) * c.rx * r, y = c.y + Math.sin(a) * c.ry * r; if (WORLD_MAPS.trecho.canWalk(x, y)) return { x, y }; } return { x: c.x, y: c.y }; }
function bossMinion(N, kind, at, mul = 1.5) { const B = CAVE_BEASTS[kind], hp = Math.round(B.hp * mul); N.beasts.push({ kind, x: at.x, y: at.y, home: at, tx: at.x, ty: at.y, hp, max: hp, dx: 1, state: kind === 'teiu' ? 'dash' : 'chase', t: .4, vx: 0, vy: 0, hurt: 0, frame: 0, cool: .8, attack: 0, dmgMul: 1.2, minion: true }); fxPuffs(at.x, at.y - 30, 8, 90, '#5a4a3a'); }

// ---------- Aparecimento ----------
trechoBossSpawn = function (T, N) {
  if (!T.boss || trechoBossDone(T.boss)) return;
  const B = CAVE_BEASTS[T.boss], c = T.camp;
  N.beasts.push({ kind: T.boss, boss: true, x: c.x + 160, y: c.y, hp: B.hp, max: B.hp, dx: -1, state: 'idle', t: 2, vx: 0, vy: 0, hurt: 0, frame: 0, cool: 0, attack: 0, summon: 8, chiado: 6, called: 0, idx: 99 });
};
trechoBossEnter = function (T) {
  if (!T.boss || trechoBossDone(T.boss)) return;
  floatNote(T.boss === 'cachaco' ? 'Um ronco grosso no meio do trecho, e a terra toda fuçada na picada. Tem coisa grande na clareira.' : 'Rastro de rabo arrastado na areia molhada, largo como um tronco. Tem coisa grande na clareira.');
};
function bossIntro(T, b) {
  b.met = true; keys.clear();
  const lines = b.kind === 'cachaco'
    ? [['card', '<b>🐗 O Javali Cachaço</b><br>No meio da clareira, fuçando a terra, um javali do tamanho de um boi: crina de arame, presa amarela e torta, o couro cheio de cicatriz. É o cachaço velho que manda no pinheiral.', 'Pinheiral'],
       ['sadi', 'Bah… isso não é um javali, é uma carreta com dente!'],
       ['dica', '· A <b>faixa vermelha</b> avisa a investida: sai do caminho. Se ele bater num tronco, fica tonto e apanha mais.<br>· Perto demais, ele dá <b>presada</b> pra frente.<br>· Quando fuça, joga <b>torrão</b>: sai do círculo no chão.<br>· O ronco chama a <b>vara de javalis</b>.', 'O Javali Cachaço']]
    : [['card', '<b>🦎 O Lagarto do papo-amarelo</b><br>Na clareira da descida, deitado na pedra quente, um teiú do tamanho de uma canoa. O papo é amarelo como gema e o rabo, grosso como um palanque. Os antigos dizem que ele guarda a descida da serra pro litoral.', 'Encosta da Serra'],
       ['sadi', 'Esse aí não é lagarto, é parente de jacaré!'],
       ['dica', '· A <b>linha</b> avisa o bote: sai do lado. O <b>anel amarelo</b> é a rabada: sai de perto.<br>· Quando ele <b>se enterra</b>, o rastro de terra vem atrás do Sadi: sai do <b>círculo vermelho</b>. Depois de sair do chão, ele fica preso um pouco.<br>· Brabo, ele <b>incha o papo</b> e solta um chiado que empurra e deixa tonto.', 'O Lagarto do papo-amarelo']];
  talk(lines, null, 'Encarar');
}

// ---------- O Javali Cachaço ----------
function cachacoTick(b, dt, T, N, p) {
  const B = CAVE_BEASTS.cachaco, d = Math.hypot(p.x - b.x, p.y - b.y) || 1, angry = b.hp < b.max * .5;
  b.t -= dt; b.hurt = Math.max(0, b.hurt - dt); b.attack = Math.max(0, b.attack - dt); b.frame += dt * 6; b.summon -= dt;
  if (b.state === 'idle') {
    if (Math.abs(p.x - b.x) > 6) b.dx = p.x < b.x ? -1 : 1;
    const want = d > 380 ? 1 : d < 240 ? -.6 : 0; mataStep(b, (p.x - b.x) / d * B.speed * want, (p.y - b.y) / d * B.speed * want, dt);
    if (b.t > 0) return;
    if (d < 190) { b.state = 'presa'; b.t = .5; b.vx = (p.x - b.x) / d; b.vy = (p.y - b.y) / d; AudioEngine.caveSnort?.(); return; }
    if (b.summon <= 0 && !N.beasts.some(x => x.minion && x.hp > 0)) { b.state = 'ronco'; b.t = 1; b.summon = angry ? 11 : 15; AudioEngine.caveGrowl?.(.8, .1); return; }
    if (Math.random() < .3) { b.state = 'fuca'; b.t = .9; return; }
    b.state = 'windup'; b.t = b.t0 = angry ? .5 : .75; b.vx = (p.x - b.x) / d; b.vy = (p.y - b.y) / d; b.dx = b.vx < 0 ? -1 : 1; b.chain = angry ? 1 : 0; AudioEngine.caveSnort?.();
  } else if (b.state === 'windup') { if (b.t <= 0) { b.state = 'charge'; b.t = 1.1; for (let k = 0; k < 3; k++) setTimeout(() => AudioEngine.thud?.(), k * 140); } }
  else if (b.state === 'charge') {
    b.frame += dt * 8;
    if (!mataStep(b, b.vx * 560, b.vy * 560, dt)) { b.state = 'dazed'; b.t = 2.4; effect('Bateu no tronco!', b.x, b.y - 190, '#ffe28a', 18); AudioEngine.caveCrumble?.(); fxStars(b.x, b.y - 140, 6); fxPuffs(b.x, b.y - 40, 10, 120, '#6a5232'); }
    else if (b.t <= 0) { if (b.chain > 0) { b.chain--; b.state = 'windup'; b.t = b.t0 = .4; const k = Math.hypot(p.x - b.x, p.y - b.y) || 1; b.vx = (p.x - b.x) / k; b.vy = (p.y - b.y) / k; b.dx = b.vx < 0 ? -1 : 1; } else { b.state = 'idle'; b.t = 1.1; } }
    if (Math.hypot(p.x - b.x, p.y - b.y) < B.r + 34) { mataHurt(B.dmg, b); b.attack = .3; }
  } else if (b.state === 'presa') {
    if (b.t <= 0) { b.state = 'idle'; b.t = 1; AudioEngine.swoosh?.(.08); const dx = p.x - b.x, dy = p.y - b.y; if (Math.hypot(dx, dy) < 190 && dx * b.vx + dy * b.vy > 0) { mataHurt(18, b); const k = Math.hypot(dx, dy) || 1; mataStep(worldOut, dx / k * 90, dy / k * 90, 1); } }
  } else if (b.state === 'fuca') {
    if (b.t <= 0) { b.state = 'idle'; b.t = 1.1; AudioEngine.noise?.(.3, .06, 500); fxPuffs(b.x + b.dx * 50, b.y - 10, 10, 100, '#6a5232');
      for (let k = 0; k < (angry ? 4 : 3); k++) { const a = Math.random() * Math.PI * 2, r = k ? 70 + Math.random() * 90 : 0, tx = p.x + Math.cos(a) * r, ty = p.y + Math.sin(a) * r * .6; N.shots.push({ kind: 'torrao', x0: b.x + b.dx * 50, y0: b.y - 10, x: b.x, y: b.y, tx, ty, time: .95 + k * .12, t: 3, dmg: 14, dmgMul: 1 }); } }
  } else if (b.state === 'ronco') {
    if (b.t <= 0) { for (let k = 0; k < 2; k++) bossMinion(N, 'javali', bossSpot(T, Math.random, .95)); effect('O cachaço chamou a vara!', b.x, b.y - 190, '#ffb3a0', 16); b.state = 'idle'; b.t = 1.3; }
  } else if (b.state === 'dazed') { if (b.t <= 0) { b.state = 'idle'; b.t = .8; } }
}

// ---------- O Lagarto do papo-amarelo ----------
function papoTick(b, dt, T, N, p) {
  const B = CAVE_BEASTS.papo, dxp = p.x - b.x, dyp = p.y - b.y, d = Math.hypot(dxp, dyp) || 1, angry = b.hp < b.max * .5;
  b.t -= dt; b.hurt = Math.max(0, b.hurt - dt); b.attack = Math.max(0, b.attack - dt); b.chiado -= dt;
  if (angry && b.called < 1 || b.hp < b.max * .25 && b.called < 2) { b.called++; for (let k = 0; k < 2; k++) bossMinion(N, 'teiu', bossSpot(T, Math.random, .95), 1.3); effect('Teiús saindo da toca!', b.x, b.y - 190, '#ffb3a0', 16); }
  if (b.state === 'idle') {
    b.frame += dt * 5; if (Math.abs(dxp) > 6) b.dx = dxp < 0 ? -1 : 1;
    // Rodeia o Sadi de longe, de lado, como lagarto no sol.
    const tang = b.side ??= Math.random() < .5 ? -1 : 1, want = d > 340 ? 1 : d < 220 ? -1 : 0;
    if (!mataStep(b, (dxp / d * want - dyp / d * tang * .8) * 120, (dyp / d * want + dxp / d * tang * .8) * 120, dt)) b.side = -tang;
    if (b.t > 0) return;
    if (d < 170) { b.state = 'tailwind'; b.t = .55; AudioEngine.hiss?.(.5, .06, 900); return; }
    if (angry && b.chiado <= 0) { b.state = 'chiado'; b.t = .7; b.chiado = 9; AudioEngine.hiss?.(.8, .08, 700); return; }
    if (Math.random() < .3) { b.state = 'dig'; b.t = .6; AudioEngine.noise?.(.5, .06, 500); return; }
    b.state = 'windup'; b.t = b.t0 = angry ? .4 : .5; b.vx = dxp / d; b.vy = dyp / d; b.dx = b.vx < 0 ? -1 : 1; AudioEngine.hiss?.(.3, .05, 2000);
  } else if (b.state === 'windup') { if (b.t <= 0) { b.state = 'lunge'; b.t = .38; } }
  else if (b.state === 'lunge') {
    b.frame += dt * 18;
    if (!mataStep(b, b.vx * 640, b.vy * 640, dt)) { b.state = 'stuck'; b.t = 1.1; effect('Atolou a cara na pedra!', b.x, b.y - 170, '#ffe28a', 16); fxStars(b.x, b.y - 120, 5); }
    else if (b.t <= 0) { b.state = 'idle'; b.t = .9; }
    if (Math.hypot(p.x - b.x, p.y - b.y) < B.r + 30) { mataHurt(B.dmg, b); b.attack = .3; }
  } else if (b.state === 'tailwind') { if (b.t <= 0) { b.state = 'sweep'; b.t = .3; AudioEngine.swoosh?.(.09); if (Math.hypot(dxp, dyp * 1.2) < 210) { mataHurt(18, b); mataStep(worldOut, dxp / d * 120, dyp / d * 120, 1); } } }
  else if (b.state === 'sweep') { if (b.t <= 0) { b.state = 'idle'; b.t = .9; } }
  else if (b.state === 'dig') { if (b.t <= 0) { b.state = 'under'; b.t = 2.2; fxPuffs(b.x, b.y - 10, 14, 140, '#7a6040'); } }
  else if (b.state === 'under') {
    // Por baixo da terra: o rastro vem atrás do Sadi.
    mataStep(b, dxp / d * 280, dyp / d * 280, dt); if (Math.random() < dt * 8) fxPuffs(b.x, b.y - 6, 2, 50, '#7a6040');
    if (b.t <= 0 || d < 30) { b.state = 'emergewarn'; b.t = .8; b.tx = p.x; b.ty = p.y; AudioEngine.noise?.(.7, .05, 380); }
  } else if (b.state === 'emergewarn') { if (b.t <= 0) { b.x = b.tx; b.y = b.ty; if (!WORLD_MAPS.trecho.canWalk(b.x, b.y)) Object.assign(b, bossSpot(T, Math.random, .6)); b.state = 'stuck'; b.t = 1.6; AudioEngine.caveCrumble?.(); fxPuffs(b.x, b.y - 20, 18, 180, '#7a6040'); if (Math.hypot(p.x - b.tx, (p.y - b.ty) * 1.3) < 95) { mataHurt(24, b); mataStep(worldOut, (p.x - b.x) / d * 100, (p.y - b.y) / d * 100, 1); } } }
  else if (b.state === 'stuck') { if (b.t <= 0) { b.state = 'idle'; b.t = .6; } }
  else if (b.state === 'chiado') {
    if (b.t <= 0) { b.state = 'idle'; b.t = 1; N.wave = { x: b.x, y: b.y - 20, r: 30, hit: false }; }
  }
}
// O chiado: um anel que abre da boca do lagarto; quem é pego leva um tranco e fica tonto.
function papoWaveTick(N, dt, p) {
  const w = N.wave; if (!w) return; w.r += dt * 520;
  const d = Math.hypot(p.x - w.x, (p.y - w.y) * 1.25);
  if (!w.hit && Math.abs(d - w.r) < 40) { w.hit = true; mataHurt(10, { x: w.x, y: w.y }); mataBossFx.dizzy = 1.8; effect('Tonto com o chiado!', p.x, p.y - 160, '#ffe28a', 15); }
  if (w.r > 320) N.wave = null;
}

// ---------- Vitória ----------
function bossVictory(b) {
  const T = trechoLayout(), info = BOSS_INFO[b.kind], st = mataState(); st[b.kind] = G.day; st.camps[T.n] = true;
  for (const x of mataNight.beasts) if (!x.boss) x.hp = 0; mataNight.shots = []; mataNight.wave = null; mataXP(info.xp); grantReward(info.reward); caveState().hp = caveMaxHp(); save();
  const lines = b.kind === 'cachaco'
    ? [['card', '<b>🐗 O Javali Cachaço caiu</b><br>O porco velho deitou na terra que ele mesmo fuçou, e a vara sumiu no mato. O fogo de chão do meio da clareira tá pronto: o acampamento acendeu.', 'Pinheiral'], ['sadi', 'Bah… ele tinha mais cicatriz que o banco da bodega.'], ['reward', info.reward, 'O Javali Cachaço vencido']]
    : [['card', '<b>🦎 O papo-amarelo se foi</b><br>O lagarto velho largou a pedra e desceu a serra rastejando, sem olhar pra trás. Lá embaixo, a mata abre: areia, butiazal, e o cheiro do mar. O acampamento acendeu.', 'Encosta da Serra'], ['sadi', 'Daqui pra frente é restinga… o mar tá perto!'], ['reward', info.reward, 'O Lagarto do papo-amarelo vencido']];
  talk(lines, null, 'Valeu');
}

// ---------- Desenho ----------
// O cachaço: o desenho do javali, bem maior e mais escuro (pintado uma vez por quadro), com a presa e a crina por cima.
const mataTints = new Map();
function mataTintFrame(index, height, color) {
  const f = expansionFrame('cave-beasts-a-v1', index, height, expansionRowHeight('cave-beasts-a-v1', 0, 4)); if (!f) return null;
  const k = index + ':' + f.w + ':' + f.h + ':' + color; let c = mataTints.get(k);
  if (!c) { c = document.createElement('canvas'); c.width = f.image.width; c.height = f.image.height; const g = c.getContext('2d'); g.drawImage(f.image, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = color; g.fillRect(0, 0, c.width, c.height); g.globalCompositeOperation = 'destination-in'; g.drawImage(f.image, 0, 0); mataTints.set(k, c); if (mataTints.size > 40) mataTints.delete(mataTints.keys().next().value); }
  return { ...f, image: c };
}
function drawCachaco(b) {
  const tired = b.state === 'dazed', step = b.state === 'charge' || b.attack > 0 ? 3 : tired || b.state === 'fuca' ? 1 : Math.floor(b.frame) % 3, f = mataTintFrame(step, 170, '#9a8c7c'), shake = b.state === 'windup' ? windupLean(b, teleK(b.t, b.t0 || .75), 12) : b.state === 'presa' ? windupLean(b, teleK(b.t, .5), 6) : 0;
  ellipse(b.x, b.y + 2, 74, 17, 'rgba(10,14,8,.45)');
  ctx.save(); ctx.translate(b.x + shake, b.y + (b.state === 'fuca' ? 6 : 0)); if (b.dx < 0) ctx.scale(-1, 1);
  if (f) {
    ctx.drawImage(f.image, -f.ax, -f.h, f.w, f.h);
    if (b.hurt > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .45; ctx.drawImage(f.image, -f.ax, -f.h, f.w, f.h); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
    // A crina de arame no lombo e as presas amarelas e tortas.
    const front = f.w - f.ax; ctx.strokeStyle = '#2a2520'; ctx.lineWidth = 3; for (let k = 0; k < 11; k++) { const x = -f.ax * .5 + k * f.w * .055, y = -f.h * .86 + Math.abs(k - 5) * 3; ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x - 4, y - 8 - (k % 2) * 4); ctx.stroke(); }
    ctx.fillStyle = '#efe0a8'; ctx.strokeStyle = '#8a7a50'; ctx.lineWidth = 1.5; for (const o of [0, 9]) { ctx.beginPath(); ctx.moveTo(front * .82 - o, -f.h * .32); ctx.quadraticCurveTo(front * .98 - o, -f.h * .36, front * .9 - o, -f.h * .52); ctx.quadraticCurveTo(front * .92 - o, -f.h * .4, front * .78 - o, -f.h * .28); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  } else drawJavali(0, 0, 1, Math.floor(b.frame) % 2, 3);
  ctx.restore();
  if (tired) for (let k = 0; k < 3; k++) { const a = frameClock * 6 + k * 2.1; txt('✦', b.x + Math.cos(a) * 40, b.y - 180 + Math.sin(a) * 8, 16, '#ffd75e'); }
}
function drawPapo(b) {
  if (b.state === 'under' || b.state === 'emergewarn') { ellipse(b.x, b.y, 46, 14, '#6a5230'); ellipse(b.x - 8, b.y - 4, 30, 8, '#8a6a40'); for (let k = 0; k < 4; k++) ellipse(b.x + Math.sin(frameClock * 9 + k) * 30, b.y - 6 - k * 3, 6, 4, '#7a6040'); return; }
  const dig = b.state === 'dig' ? clamp(1 - b.t / .6, 0, 1) : 0, puff = b.state === 'chiado' ? clamp(1 - b.t / .7, 0, 1) : .15;
  ctx.save(); if (dig) { ctx.beginPath(); ctx.rect(b.x - 400, b.y - 400, 800, 402); ctx.clip(); ctx.translate(0, dig * 60); }
  drawTeiuBody(b, 2.2, puff); ctx.restore();
  if (b.state === 'stuck') for (let k = 0; k < 3; k++) { const a = frameClock * 6 + k * 2.1; txt('✦', b.x + Math.cos(a) * 46, b.y - 120 + Math.sin(a) * 8, 16, '#ffd75e'); }
}
function drawBossWarnings(N) {
  const b = trechoBoss(N); if (!b) return;
  if (b.kind === 'cachaco' && b.state === 'windup') teleLane(b.x, b.y - 10, Math.atan2(b.vy, b.vx), 680, 120, teleK(b.t, b.t0 || .75));
  if (b.kind === 'cachaco' && b.state === 'presa') teleCone(b.x, b.y, Math.atan2(b.vy, b.vx), 190, 1.2, teleK(b.t, .5));
  if (b.kind === 'papo' && b.state === 'windup') teleLane(b.x, b.y, Math.atan2(b.vy, b.vx), 260, 56, teleK(b.t, b.t0 || .5), '255,140,40');
  if (b.kind === 'papo' && b.state === 'tailwind') teleArea(b.x, b.y, 210, 105, teleK(b.t, .55), '255,190,50');
  if (b.kind === 'papo' && b.state === 'emergewarn') teleArea(b.tx, b.ty, 95, 40, teleK(b.t, .8));
  if (N.wave) { ctx.strokeStyle = 'rgba(255,230,120,.8)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(N.wave.x, N.wave.y + 20, N.wave.r, N.wave.r * .8, 0, 0, Math.PI * 2); ctx.stroke(); }
}
function drawBossHUD(N) {
  const b = trechoBoss(N); if (!b || scene) return;
  const dpr = canvas.width / Math.max(1, canvas.clientWidth), W = canvas.clientWidth, left = 316, right = W - 280, narrow = right - left < 300, w = narrow ? W - 32 : Math.min(520, right - left), x = narrow ? 16 : left + (right - left - w) / 2, y = narrow ? 108 : 16, info = BOSS_INFO[b.kind];
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  rect(x, y, w, 46, 'rgba(12,20,10,.86)', 8, '#7a9a3a'); txt(info.icon + ' ' + info.title, x + w / 2, y + 14, 13, '#e8f0c8', 'center', 'Georgia', false);
  rect(x + 12, y + 24, w - 24, 12, '#14200c', 5); rect(x + 12, y + 24, (w - 24) * b.hp / b.max, 12, '#7ac84a', 5);
  ctx.restore();
}

// ---------- Ligações ----------
{
  const beast = mataBeastTick; mataBeastTick = function (b, dt, p) {
    if (!b.boss || !BOSS_INFO[b.kind]) return beast(b, dt, p);
    const T = trechoLayout(), N = mataNight;
    if (!b.met) { if (bossInArena(T, p.x, p.y, 1.15)) bossIntro(T, b); return; }
    if (b.kind === 'cachaco') cachacoTick(b, dt, T, N, p); else papoTick(b, dt, T, N, p);
  };
  const combat = mataCombatTick; mataCombatTick = function (dt) {
    combat(dt); const N = mataNight; if (!N || !inTrecho() || paused || modal || scene || N.faint) return;
    mataBossFx.dizzy = Math.max(0, mataBossFx.dizzy - dt); papoWaveTick(N, dt, worldOut);
  };
  // Tonto e enterrado: o cachaço tonto e o lagarto preso apanham mais; o lagarto debaixo da terra não apanha.
  const hit = caveDmg; caveDmg = function () { const b = trechoBoss(); return Math.round(hit() * (b && (b.state === 'dazed' || b.state === 'stuck') ? 1.5 : 1)); };
  const attack = mataAttack; mataAttack = function () { const b = trechoBoss(), hp = b?.hp, hidden = b && ['under', 'emergewarn', 'dig'].includes(b.state); attack(); if (hidden && b.hp < hp) b.hp = hp; };
  const kill = mataKill; mataKill = function (b) { kill(b); if (b.boss && BOSS_INFO[b.kind]) bossVictory(b); };
  const draw = drawCaveBeast; drawCaveBeast = function (b) { if (b.kind === 'cachaco') { drawCachaco(b); return; } if (b.kind === 'papo') { drawPapo(b); return; } draw(b); };
  const move = movementBonus; movementBonus = function () { return move() - (inTrecho() && mataBossFx.dizzy > 0 ? .4 : 0); };
  const top = trechoTop; trechoTop = function () { const N = mataNight; if (N && !scene) { ctx.save(); drawBossWarnings(N); ctx.restore(); } top(); if (N) drawBossHUD(N); };
}
