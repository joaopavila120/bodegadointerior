// Pescaria de verdade no trapiche: segura E pra medir o arremesso e solta; espera a boia (as beliscadas enganam: puxar
// cedo assusta o peixe); quando ela afunda de vez, E fisga. Na briga, segurar E recolhe a linha e soltar dá linha: na
// carreira do peixe, segurar arrebenta; frouxa demais, ele cospe o anzol. Perto do trapiche dá traíra e jundiá (o
// jundiá gosta da noite); longe, na correnteza, piava e, com sorte, o dourado: o rei do rio, raro e brigador, que pula.
'use strict';

const FISH_KINDS = {
  jundia: { strength: .45, window: .8, runs: [3.2, 1], kg: [.3, 2.5], near: 4, mid: 3, far: 2, night: 1.6 },
  grumata: { strength: .5, window: .75, runs: [3, 1.1], kg: [.4, 2.5], near: 3, mid: 3, far: 2 },
  traira: { strength: .65, window: .6, runs: [2.4, .8], kg: [.5, 3.5], near: 4, mid: 2, far: 1 },
  piava: { strength: .6, window: .7, runs: [2.6, 1.2], kg: [.4, 3], near: 1.5, mid: 3, far: 4 },
  dourado: { strength: .95, window: .5, runs: [2.6, 1.1], kg: [2, 12], near: .2, mid: .6, far: 1.4, jumps: true }
};
BAG_RAW.dourado = { name: 'Dourado', icon: '🐟', value: 30, note: 'O rei do rio Uruguai: raro, brigador, pula fora d\'água na briga.' };
SELLABLE.push('dourado');
TEACH.pesca = ['Pescaria no trapiche', 'Segure <span class="keycap">E</span> pra medir o arremesso e solte. Espere a boia <b>afundar de vez</b> (beliscada engana!) e aperte <span class="keycap">E</span> pra fisgar. Na briga: segure <span class="keycap">E</span> pra recolher a linha e <b>solte quando o peixe correr</b>. Linha esticada demais arrebenta; frouxa demais, ele cospe o anzol. Longe, na correnteza, mora o dourado.'];
function fishName(k) { return k === 'dourado' ? 'Dourado' : RIVER_FISH.find(f => f.key === k)?.name || bagName(k); }
// Dourado: a arte da piava, dourada.
const DOURADO_FILTER = 'sepia(.7) saturate(3.4) hue-rotate(-14deg) brightness(1.2)', douradoFrames = new Map();
function douradoFrame(height) {
  const key = Math.round(height); if (douradoFrames.has(key)) return douradoFrames.get(key);
  const f = expansionFrame('uruguai-fish-v1', 1, height); if (!f) return null;
  const c = document.createElement('canvas'); c.width = f.w; c.height = f.h; const g = c.getContext('2d'); g.filter = DOURADO_FILTER; g.drawImage(f.image, 0, 0);
  const out = { image: c, w: f.w, h: f.h, ax: f.ax }; douradoFrames.set(key, out); return out;
}
{
  const icon = itemIconHTML; itemIconHTML = function (key, item = null) { return key === 'dourado' ? `<span class="pixel-item">${expansionPortrait('uruguai-fish-v1', 1, 72).replace('<svg ', '<svg style="filter:' + DOURADO_FILTER + '" ')}</span>` : icon(key, item); };
  const bi = bagIcon; bagIcon = function (k) { return k === 'dourado' ? itemIconHTML(k) : bi(k); };
  const image = itemImageForSize; itemImageForSize = function (key, pixels) { return key === 'dourado' ? douradoFrame(Math.max(16, (pixels || 64) * .45))?.image : image(key, pixels); };
}
function fishSprite(g, key, x, y, height, flip = false) {
  const i = RIVER_FISH.findIndex(f => f.key === key), f = key === 'dourado' ? douradoFrame(height) : expansionFrame('uruguai-fish-v1', Math.max(0, i), height); if (!f) return;
  g.save(); g.translate(x, y); if (flip) g.scale(-1, 1); g.drawImage(f.image, -f.w / 2, -f.h / 2, f.w, f.h); g.restore();
}

// ---------- A pescaria ----------
let fishing = null;
const FW = 760, FH = 420, WATER = 250, TIP = { x: 178, y: 196 };
function pickFish(power) {
  const zone = power < .35 ? 'near' : power > .7 ? 'far' : 'mid', night = worldNight(), list = Object.entries(FISH_KINDS).map(([k, f]) => [k, f[zone] * (night && f.night ? f.night : 1)]);
  let roll = Math.random() * list.reduce((n, [, w]) => n + w, 0); for (const [k, w] of list) { roll -= w; if (roll <= 0) return k; } return 'jundia';
}
function goFishingNew() {
  if (fishLeft() <= 0) { worldSay('Por hoje chega de pescaria: o peixe ficou arisco. Amanhã tem mais.'); return; }
  teachFirst('pesca', startFishing);
}
function startFishing() {
  fishing = { phase: 'aim', t: 0, power: 0, charge: 0, holding: false, msg: 'Segure E pra medir o arremesso. Solte pra jogar.', ripples: [], splash: [] };
  openDialog('Pescaria no trapiche', `<canvas id="fishCanvas" class="fish-canvas" width="${FW}" height="${FH}" aria-label="Rio Uruguai visto do trapiche"></canvas><p id="fishMsg" class="small-note fish-msg"></p><div class="actions"><button id="fishHold" class="primary fish-hold" type="button">Segurar (E)</button><button data-act="close">Largar a vara</button></div>`, 'fishing');
  const hold = $('fishHold'), down = e => { e.preventDefault(); fishKey(true); }, up = e => { e.preventDefault(); fishKey(false); };
  hold.addEventListener('pointerdown', down); hold.addEventListener('pointerup', up); hold.addEventListener('pointerleave', up); $('fishCanvas').addEventListener('pointerdown', down); $('fishCanvas').addEventListener('pointerup', up);
  fishing.last = performance.now(); requestAnimationFrame(fishFrame); fishDraw();
}
function fishFrame(now) {
  if (!fishing || modal !== 'fishing') { if (fishing && !['done', 'aim'].includes(fishing.phase)) fishEnd(false, null, true); fishing = null; return; }
  const dt = Math.min(.05, (now - fishing.last) / 1000); fishing.last = now; fishTick(dt); fishDraw(); requestAnimationFrame(fishFrame);
}
function fishSay(text) { if (fishing) fishing.msg = text; }
function fishKey(down) {
  const F = fishing; if (!F || F.phase === 'done') return; F.holding = down;
  if (F.phase === 'aim') { if (down) { F.charging = true; F.charge = 0; } else if (F.charging) { F.charging = false; fishCast(); } }
  else if (F.phase === 'wait' && down) {
    // Puxou cedo: a boia salta, o peixe se assusta e a espera recomeça.
    F.biteIn += 1.6; F.nibble = 0; fishSay('Puxou cedo! O peixe se assustou. Espera a boia afundar de vez.'); AudioEngine.swoosh(.05); fishSplash(F.bobX, WATER, 3);
  } else if (F.phase === 'bite' && down) { F.phase = 'fight'; F.dist = 1; F.tension = .35; F.slack = 0; F.runIn = 1.2 + Math.random() * 1.5; F.run = 0; AudioEngine.ropeHit(); fishSay('Fisgou! Segura E pra recolher. Quando ele correr, SOLTA!'); fishSplash(F.bobX, WATER, 8); }
}
function fishCast() {
  const F = fishing, p = .5 - .5 * Math.cos(F.charge * Math.PI * 1.2);
  F.power = p; F.castX = 240 + p * 460; F.phase = 'fly'; F.t = 0; F.kind = pickFish(p); AudioEngine.lassoThrow();
  fishSay(p < .35 ? 'Perto do trapiche: traíra e jundiá gostam daqui.' : p > .7 ? 'Lá longe, na correnteza! Lugar de piava… e de dourado.' : 'No meio do rio. Agora é esperar.');
}
function fishSplash(x, y, n) { for (let i = 0; i < n; i++) fishing.splash.push({ x, y, vx: (Math.random() - .5) * 120, vy: -60 - Math.random() * 110, life: .6 + Math.random() * .3 }); }
function fishTick(dt) {
  const F = fishing; if (!F) return; F.t += dt;
  for (const s of F.splash) { s.life -= dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 300 * dt; } F.splash = F.splash.filter(s => s.life > 0);
  for (const r of F.ripples) r.life -= dt; F.ripples = F.ripples.filter(r => r.life > 0);
  if (F.phase === 'aim') { if (F.charging) F.charge += dt; return; }
  if (F.phase === 'fly') { const k = Math.min(1, F.t / .6); F.bobX = TIP.x + (F.castX - TIP.x) * k; F.bobY = TIP.y + (WATER - TIP.y) * k - Math.sin(k * Math.PI) * 120; if (k >= 1) { F.phase = 'wait'; F.t = 0; F.bobY = WATER; F.biteIn = 2.2 + Math.random() * 3.6; F.nibbles = Math.floor(Math.random() * 3); F.nibbleAt = F.biteIn * (.3 + Math.random() * .4); fishSplash(F.bobX, WATER, 5); F.ripples.push({ x: F.bobX, life: 1.2 }); AudioEngine.bloop?.(700, .04); } return; }
  if (F.phase === 'wait') {
    F.biteIn -= dt; F.nibble = Math.max(0, (F.nibble || 0) - dt);
    if (F.nibbles > 0 && F.biteIn <= F.nibbleAt) { F.nibbles--; F.nibble = .28; F.nibbleAt = F.biteIn * (.3 + Math.random() * .4); AudioEngine.bloop?.(1500, .03); F.ripples.push({ x: F.bobX, life: .8 }); }
    if (F.biteIn <= 0) { F.phase = 'bite'; F.t = 0; F.window = FISH_KINDS[F.kind].window; AudioEngine.bloop?.(420, .07); AudioEngine.warning(); fishSplash(F.bobX, WATER, 10); fishSay('AFUNDOU! Aperta E pra fisgar!'); }
    return;
  }
  if (F.phase === 'bite') { if (F.t > F.window) { fishSay('Demorou… o peixe levou a isca.'); fishEnd(false, 'isca'); } return; }
  if (F.phase === 'fight') {
    const K = FISH_KINDS[F.kind], s = K.strength;
    F.runIn -= dt; if (!F.run && F.runIn <= 0) { F.run = K.runs[1] * (.8 + Math.random() * .5); fishSay(F.kind === 'dourado' ? 'Ele correu e PULOU! Solta o molinete!' : 'Ele correu! Solta o molinete!'); AudioEngine.swoosh(.06); if (K.jumps) F.jump = 1; }
    if (F.run) { F.run -= dt; if (F.run <= 0) { F.run = 0; F.runIn = K.runs[0] * (.7 + Math.random() * .6); fishSay('Cansou um pouco. Recolhe!'); } }
    if (F.jump > 0) F.jump -= dt * 1.4;
    if (F.holding) { F.dist -= (F.run ? -.04 : .22 * (1.25 - s * .45)) * dt; F.tension += (F.run ? 1.15 + s * .6 : .3 + s * .2) * dt; if (Math.random() < dt * 8) AudioEngine.tick(); }
    else { F.dist += (F.run ? .07 + s * .05 : .025 * s) * dt; F.tension -= (F.run ? .32 : .9) * dt; }
    F.tension = Math.max(0, F.tension); F.slack = F.tension < .08 && !F.run ? F.slack + dt : 0;
    if (F.tension >= 1) { fishSay('TRÉC! Arrebentou a linha…'); AudioEngine.pop?.(2600, .2, .05); fishEnd(false, 'linha'); return; }
    if (F.slack > 2.4) { fishSay('A linha ficou frouxa e ele cuspiu o anzol.'); fishEnd(false, 'frouxa'); return; }
    if (F.dist >= 1.3) { fishSay('Ele levou a linha toda pro fundo…'); fishEnd(false, 'fundo'); return; }
    if (F.dist <= 0) fishEnd(true);
  }
}
function fishEnd(ok, why, silent = false) {
  const F = fishing; if (!F || F.phase === 'done') return; F.phase = 'done'; F.t = 0; F.ok = ok;
  if (G.fish?.day !== G.day) G.fish = { day: G.day, n: 0 }; G.fish.n++;
  if (ok) {
    const K = FISH_KINDS[F.kind], kg = +(K.kg[0] + Math.random() ** 1.8 * (K.kg[1] - K.kg[0])).toFixed(1); F.kg = kg;
    bagAdd(F.kind, 1); G.fishRecords ??= {}; const best = (G.fishRecords[F.kind] || 0) < kg; if (best) G.fishRecords[F.kind] = kg; F.best = best;
    AudioEngine.ready(); if (F.kind === 'dourado') { AudioEngine.heart(); G.stats.dourados = (G.stats.dourados || 0) + 1; }
    farmXP(F.kind === 'dourado' ? 25 : 6, fishName(F.kind) + ' de ' + String(kg).replace('.', ',') + ' kg');
    fishSay((F.kind === 'dourado' ? '🏆 DOURADO! O rei do rio! ' : 'Pegou! ') + fishName(F.kind) + ' de ' + String(kg).replace('.', ',') + ' kg' + (best ? ' · recorde!' : '') + '.');
  } else if (why !== 'isca') AudioEngine.bad();
  save(); refreshHUD();
  if (!silent) setTimeout(() => { if (fishing === F && modal === 'fishing') { closeDialog(true); fishing = null; worldSay(ok ? fishName(F.kind) + ' de ' + String(F.kg).replace('.', ',') + ' kg no inventário. Restam ' + fishLeft() + ' lance(s) hoje.' : 'Escapou. Restam ' + fishLeft() + ' lance(s) hoje.'); } }, ok ? 2200 : 1500);
}
// ---------- Desenho ----------
function fishDraw() {
  const cv = $('fishCanvas'); if (!cv || !fishing) return; const F = fishing, g = cv.getContext('2d'), t = performance.now() / 1000, night = worldNight();
  $('fishMsg') && ($('fishMsg').textContent = F.msg || '');
  const sky = g.createLinearGradient(0, 0, 0, 170); sky.addColorStop(0, night ? '#0c1430' : '#8ec4e8'); sky.addColorStop(1, night ? '#24305a' : '#f4dca0'); g.fillStyle = sky; g.fillRect(0, 0, FW, 170);
  if (night) { for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(240,236,210,${.3 + .3 * Math.sin(t * 1.5 + i)})`; g.fillRect((i * 97.3) % FW, (i * 41.7) % 120, 2, 2); } g.fillStyle = '#f1ecd6'; g.beginPath(); g.arc(640, 50, 20, 0, Math.PI * 2); g.fill(); }
  else { g.fillStyle = '#fff2c0'; g.beginPath(); g.arc(640, 60, 26, 0, Math.PI * 2); g.fill(); }
  // margem do outro lado (Argentina) e o rio
  g.fillStyle = night ? '#16261a' : '#4a7a3a'; for (let x = -40; x < FW + 60; x += 70) { g.beginPath(); g.ellipse(x, 168, 60, 22 + (x % 3) * 6, 0, Math.PI, 0); g.fill(); }
  g.fillStyle = night ? '#1e3020' : '#5f8f45'; g.fillRect(0, 165, FW, 14);
  const water = g.createLinearGradient(0, 175, 0, FH); water.addColorStop(0, night ? '#1a2c44' : '#5a8aa8'); water.addColorStop(1, night ? '#0a1424' : '#2a5a78'); g.fillStyle = water; g.fillRect(0, 178, FW, FH - 178);
  g.strokeStyle = night ? 'rgba(200,220,255,.12)' : 'rgba(255,255,255,.22)'; g.lineWidth = 2; for (let i = 0; i < 14; i++) { const y = 200 + i * 16, x = ((i * 137 + t * (20 + i * 3)) % (FW + 200)) - 100; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 60 + i * 4, y); g.stroke(); }
  // trapiche e o Sadi
  g.fillStyle = '#6a4424'; g.fillRect(0, 300, 190, 22); for (let x = 0; x < 190; x += 24) { g.fillStyle = x % 48 ? '#7a5030' : '#8a5a34'; g.fillRect(x, 300, 22, 18); } for (const x of [20, 100, 170]) { g.fillStyle = '#4a2e18'; g.fillRect(x, 318, 10, 110); }
  const keep = ctx; ctx = g; try { personDraw(avatarSprite(), 92, 302, false, true, 1); } finally { ctx = keep; }
  // vara
  const bend = F.phase === 'fight' ? Math.min(1, F.tension) * 26 : F.phase === 'aim' && F.charging ? -20 : 0;
  g.strokeStyle = '#5a3a1a'; g.lineWidth = 4; g.beginPath(); g.moveTo(110, 250); g.quadraticCurveTo(150, 210 - bend * .3, TIP.x, TIP.y + bend); g.stroke();
  // linha e boia
  const bob = fishBobber(F, t);
  if (F.phase !== 'aim' && bob) { g.strokeStyle = 'rgba(240,240,240,.85)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(TIP.x, TIP.y + bend); const sag = F.phase === 'fight' ? (1 - Math.min(1, F.tension)) * 50 : 40; g.quadraticCurveTo((TIP.x + bob.x) / 2, Math.max(TIP.y, bob.y) + sag, bob.x, bob.y); g.stroke(); }
  if (bob && F.phase !== 'fight') { g.fillStyle = '#f4f4ec'; g.beginPath(); g.ellipse(bob.x, bob.y - 4, 6, 7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#d82a20'; g.beginPath(); g.ellipse(bob.x, bob.y - 8, 6, 4, 0, Math.PI, 0); g.fill(); }
  for (const r of F.ripples) { g.strokeStyle = `rgba(255,255,255,${r.life * .5})`; g.lineWidth = 2; g.beginPath(); g.ellipse(r.x, WATER + 2, 30 * (1.3 - r.life) + 8, 6 * (1.3 - r.life) + 2, 0, 0, Math.PI * 2); g.stroke(); }
  // peixe na briga: sombra na água ou o pulo do dourado
  if (F.phase === 'fight' && bob) {
    if (F.jump > 0) { const k = 1 - F.jump; fishSprite(g, F.kind, bob.x + 20, WATER - Math.sin(k * Math.PI) * 90, 56, Math.sin(t * 6) > 0); }
    else { g.fillStyle = 'rgba(10,20,30,.45)'; g.beginPath(); g.ellipse(bob.x, WATER + 26, 34, 10, 0, 0, Math.PI * 2); g.fill(); }
    if (F.run && Math.random() < .3) fishSplash(bob.x, WATER, 1);
  }
  for (const s of F.splash) { g.fillStyle = `rgba(230,240,255,${s.life})`; g.fillRect(s.x, s.y, 3, 3); }
  // painel: força do arremesso, tensão da linha e distância do peixe
  g.fillStyle = 'rgba(20,14,10,.78)'; g.fillRect(12, 12, 300, F.phase === 'fight' ? 74 : 44); g.font = 'bold 14px Arial'; g.fillStyle = '#ffe2a6'; g.textAlign = 'left';
  if (F.phase === 'aim') { const p = .5 - .5 * Math.cos((F.charge || 0) * Math.PI * 1.2); g.fillText('Arremesso', 22, 34); g.fillStyle = '#2a1608'; g.fillRect(150, 22, 150, 14); g.fillStyle = F.charging ? (p > .7 ? '#7ac850' : p < .35 ? '#e8c060' : '#d8a040') : '#6a5a40'; g.fillRect(150, 22, 150 * (F.charging ? p : 0), 14); for (const x of [.35, .7]) { g.fillStyle = '#fff'; g.fillRect(150 + 150 * x, 20, 2, 18); } g.font = '10px Arial'; g.fillStyle = '#d9c79f'; g.fillText('perto', 152, 48); g.fillText('longe', 268, 48); }
  else if (F.phase === 'fight') {
    g.fillText('Tensão', 22, 34); g.fillStyle = '#2a1608'; g.fillRect(150, 22, 150, 14); const tens = Math.min(1, F.tension); g.fillStyle = tens > .8 ? '#e84a3a' : tens < .1 ? '#8a8aa0' : '#7ac850'; g.fillRect(150, 22, 150 * tens, 14); g.fillStyle = '#ff6a5a'; g.fillRect(150 + 150 * .8, 20, 2, 18);
    g.fillStyle = '#ffe2a6'; g.fillText('Distância', 22, 64); g.fillStyle = '#2a1608'; g.fillRect(150, 52, 150, 14); g.fillStyle = '#6ab0e8'; g.fillRect(150, 52, 150 * Math.min(1, F.dist / 1.3), 14);
  } else g.fillText(F.phase === 'done' ? (F.ok ? 'Peixe no balaio!' : 'Escapou…') : 'Lances hoje: ' + fishLeft(), 22, 36);
  if (F.phase === 'bite') { g.fillStyle = '#ffe28a'; g.font = 'bold 54px Georgia'; g.textAlign = 'center'; g.fillText('!', bob.x, WATER - 40 - Math.abs(Math.sin(t * 20)) * 8); }
  if (F.phase === 'done' && F.ok) { g.fillStyle = 'rgba(20,14,10,.82)'; g.fillRect(FW / 2 - 170, 120, 340, 150); g.strokeStyle = '#d9b25e'; g.lineWidth = 3; g.strokeRect(FW / 2 - 170, 120, 340, 150); fishSprite(g, F.kind, FW / 2, 175, 70); g.fillStyle = '#ffe2a6'; g.font = 'bold 20px Georgia'; g.textAlign = 'center'; g.fillText(fishName(F.kind) + ' · ' + String(F.kg).replace('.', ',') + ' kg', FW / 2, 236); g.font = '13px Arial'; g.fillText(F.kind === 'dourado' ? 'O rei do rio Uruguai!' : F.best ? 'Recorde da espécie!' : 'Pro inventário', FW / 2, 258); }
}
function fishBobber(F, t) {
  if (F.phase === 'aim') return null; if (F.phase === 'fly') return { x: F.bobX, y: F.bobY };
  const x = F.phase === 'fight' ? TIP.x + 40 + (F.castX - TIP.x - 40) * Math.min(1, F.dist / 1.3) + (F.run ? Math.sin(t * 9) * 14 : 0) : F.bobX;
  const y = WATER + Math.sin(t * 2.4) * 2 + (F.nibble > 0 ? 7 : 0) + (F.phase === 'bite' ? 14 : 0) + (F.phase === 'fight' ? 10 : 0);
  return { x, y };
}
{
  goFishing = goFishingNew;
  // E e Espaço seguram a vara; Esc larga.
  document.addEventListener('keydown', e => { if (modal !== 'fishing') return; const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; if (k === 'e' || k === ' ' || k === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) fishKey(true); } }, true);
  document.addEventListener('keyup', e => { if (modal !== 'fishing') return; const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; if (k === 'e' || k === ' ' || k === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); fishKey(false); } }, true);
}
