// Armas de longe, pra peleia na mata e na caverna:
//   · Bodoque: o Garibaldi dá quando o Sadi chega na mata (e a Casa do Campeiro vende, pra laçada). Pedra não acaba,
//     mas é fraquinha.
//   · Revólver 38: o Garibaldi e o São Dunstano vendem, junto com a caixa de bala. Seis tiros no tambor, que seguram
//     o bicho no bote. Descarregou, o Sadi recarrega sozinho com as balas da guaiaca; sem bala, só o estalo do cão.
//     Bala também aparece nos baús e, de vez em quando, onde cai um bicho.
// R atira e X troca de arma (no celular, os botões). A mira é sozinha: pega o bicho mais perto num leque na frente do
// Sadi; sem bicho no leque, o tiro sai reto pra onde ele olha. O dano segue o facão (e o encanto dele, contra o Diabo).
'use strict';

const RANGED = {
  bodoque: { name: 'Bodoque', range: 520, speed: 950, cd: .6, dmg: .5 },
  revolver38: { name: 'Revólver 38', range: 760, speed: 2400, cd: .3, dmg: 1.2, drum: 6, cost: 750 }
};
const BALAS = { box: 12, cost: 36, max: 96, drop: .1 };
// Bicho enterrado, desmoronado ou escondido não leva tiro.
const RANGED_IMMUNE = ['under', 'emergewarn', 'dig', 'buried', 'rise', 'down'];
const RANGED_ART = { bodoque: 'assets/images/icons/bodoque.png', revolver38: 'assets/images/icons/revolver38.png', balas: 'assets/images/icons/balas38.png' };
const rangedArt = {};
let ranged = { shots: [], drops: [], cd: 0, reload: 0, reloadN: 0, flash: 0, hold: 0, ang: 0, tipX: 0, tipY: 0, dryNote: 0 };

function rangedOwned(id) { return !!G.up?.[id]; }
function rangedList() { return Object.keys(RANGED).filter(rangedOwned); }
function rangedWeapon() { const list = rangedList(); return list.includes(G.rangedPick) ? G.rangedPick : list[list.length - 1] || null; }
function rangedDrum() { return G.drum38 ?? RANGED.revolver38.drum; }
function rangedBalas() { return G.balas38 || 0; }
function rangedAddBalas(n) { G.balas38 = Math.min(BALAS.max, rangedBalas() + n); }
function rangedCombat() { return inCave() ? !(typeof caveDefeatActive === 'function' && caveDefeatActive()) : mataCombatOn() && !!mataNight && !mataNight.faint; }
// A peleia de agora (o andar da caverna ou a noite da mata): bala que caiu num lugar não aparece no outro.
function rangedFight() { return inCave() ? caveFloorRun() : mataNight; }
function rangedTargets() {
  const list = inCave() ? caveFloorRun()?.beasts || [] : mataNight?.beasts || [];
  return list.filter(b => b.hp > 0 && !RANGED_IMMUNE.includes(b.state) && !(b.kind === 'diabo' && diaboHidden(b)));
}
function rangedAim(b) { return { x: b.x, y: b.y - (b.boss || b.lenda || b.kind === 'diabo' ? 70 : 40) }; }
function rangedRadius(b) { return b.boss || b.lenda || b.kind === 'diabo' ? 70 : (CAVE_BEASTS[b.kind]?.r || 30) + 16; }

function rangedFire() {
  if (!rangedCombat() || paused || modal || scene || phoneOpen || worldTalkOpen()) return;
  const id = rangedWeapon(); if (!id) { floatNote('Sem arma de longe: o Garibaldi dá um bodoque a quem chega na mata, e ele e o São Dunstano vendem o revólver 38.'); AudioEngine.bad(); return; }
  if (ranged.cd > 0 || ranged.reload > 0) return;
  if (id === 'revolver38' && rangedDrum() <= 0) { if (rangedBalas() > 0) rangedReload(); else rangedDry(); return; }
  const W = RANGED[id], p = worldOut, ox = p.x, oy = p.y - 62, face = Math.atan2(p.dy || 0, p.dx || (p.dy ? 0 : 1));
  let best = null, bd = W.range;
  for (const b of rangedTargets()) {
    const t = rangedAim(b), d = Math.hypot(t.x - ox, t.y - oy), a = Math.atan2(t.y - oy, t.x - ox);
    if (d < bd && Math.abs(Math.atan2(Math.sin(a - face), Math.cos(a - face))) < .75) { bd = d; best = t; }
  }
  const ang = best ? Math.atan2(best.y - oy, best.x - ox) : face;
  ranged.shots.push({ id, x: ox + Math.cos(ang) * 30, y: oy + Math.sin(ang) * 30, vx: Math.cos(ang) * W.speed, vy: Math.sin(ang) * W.speed, left: W.range });
  ranged.cd = W.cd; ranged.hold = .4; ranged.ang = ang;
  if (id === 'revolver38') { G.drum38 = rangedDrum() - 1; ranged.flash = .07; AudioEngine.noise?.(.2, .3, 700); AudioEngine.note?.(64, .16, 'sawtooth', .06); if (G.drum38 <= 0 && rangedBalas() > 0) rangedReload(); }
  else AudioEngine.swoosh?.(.06);
  updateRangedButton();
}
// Tambor e guaiaca vazios: o cão bate seco.
function rangedDry() {
  ranged.cd = .25; ranged.hold = .3; AudioEngine.gunDry();
  if (frameClock - ranged.dryNote > 4) { ranged.dryNote = frameClock; floatNote('Click! Sem bala no 38. O Garibaldi e o São Dunstano vendem caixa de bala; nos baús às vezes tem.'); }
}
// Põe no tambor as balas que faltam (ou as que tem): um estalo por bala e o tambor fechando.
function rangedReload() {
  const n = Math.min(RANGED.revolver38.drum - rangedDrum(), rangedBalas()); if (ranged.reload > 0 || n <= 0) return;
  G.balas38 = rangedBalas() - n; ranged.reloadN = n; ranged.reload = .45 + .25 * n; AudioEngine.gunReload(n);
  effect('Recarregando o 38…', worldOut.x, worldOut.y - 150, '#ffe2a6', 14); updateRangedButton();
}
function rangedSwap() {
  const list = rangedList(); if (list.length < 2) return;
  G.rangedPick = list[(list.indexOf(rangedWeapon()) + 1) % list.length]; AudioEngine.tick?.();
  effect(RANGED[G.rangedPick].name, worldOut.x, worldOut.y - 150, '#ffe2a6', 15); updateRangedButton();
}
function rangedHit(b, s) {
  const W = RANGED[s.id], cave = inCave(), dmg = Math.max(1, Math.round((cave ? caveHitDmg(b) : caveDmg()) * W.dmg));
  b.hp -= dmg; b.hurt = .18;
  // O tiro do 38 segura bicho comum no bote (chefe e lenda, não).
  if (s.id === 'revolver38' && CAVE_BEASTS[b.kind] && !b.boss && !b.lenda && b.kind !== 'diabo' && ['windup', 'lunge', 'charge'].includes(b.state)) { b.state = 'rest'; b.t = .5; }
  AudioEngine.caveFlesh?.(); AudioEngine.caveCry?.(b.kind, b.hp <= 0); fxStars(b.x, b.y - 50, s.id === 'bodoque' ? 2 : 3);
  effect('−' + dmg, b.x + (Math.random() - .5) * 20, b.y - 80, '#ffd2a0', 21);
  if (b.hp <= 0) { if (cave) caveKill(b); else mataKill(b); }
}
function rangedMiss(s) { fxPuffs(s.x, s.y + 40, s.id === 'bodoque' ? 4 : 2, 40, s.id === 'bodoque' ? '#8a7d70' : '#d8d0c0'); }
// Bicho comum derrubado (de facão ou de tiro), às vezes, deixa umas balas no chão.
function rangedLoot(b) {
  if (b.hp > 0 || b.boss || b.lenda || !CAVE_BEASTS[b.kind] || Math.random() >= BALAS.drop) return;
  ranged.drops.push({ x: b.x - 18, y: b.y + 6, q: 1 + Math.floor(Math.random() * 2), fight: rangedFight() });
}
function rangedTick(dt) {
  ranged.cd = Math.max(0, ranged.cd - dt); ranged.hold = Math.max(0, ranged.hold - dt); ranged.flash = Math.max(0, ranged.flash - dt);
  if (ranged.reload > 0 && (ranged.reload -= dt) <= 0) { ranged.reload = 0; G.drum38 = rangedDrum() + ranged.reloadN; ranged.reloadN = 0; updateRangedButton(); }
  // Fora da peleia, o Sadi completa o tambor com o que tem na guaiaca.
  if (!rangedCombat()) { ranged.shots = []; ranged.drops = []; if (!ranged.reload && rangedOwned('revolver38')) { const n = Math.min(RANGED.revolver38.drum - rangedDrum(), rangedBalas()); if (n > 0) { G.drum38 = rangedDrum() + n; G.balas38 -= n; } } return; }
  if (rangedWeapon() && !G.rangedTip) { G.rangedTip = true; floatNote('🎯 R atira com o ' + RANGED[rangedWeapon()].name + (rangedList().length > 1 ? ' · X troca de arma' : '') + '.'); }
  const fight = rangedFight(), p = worldOut;
  for (const d of ranged.drops) if (d.fight === fight && Math.hypot(d.x - p.x, d.y - p.y) < 46) { d.got = true; rangedAddBalas(d.q); effect('+' + d.q + (d.q > 1 ? ' balas' : ' bala') + ' do 38', d.x, d.y - 50, '#ffe2a6', 17); AudioEngine.note?.(2200, .05, 'triangle', .03); AudioEngine.note?.(2900, .06, 'triangle', .025, .05); }
  ranged.drops = ranged.drops.filter(d => !d.got && d.fight === fight);
  for (const s of ranged.shots) {
    const sp = Math.hypot(s.vx, s.vy), n = Math.max(1, Math.ceil(sp * dt / 24));
    for (let i = 0; i < n && !s.done; i++) {
      s.x += s.vx * dt / n; s.y += s.vy * dt / n; s.left -= sp * dt / n;
      const b = rangedTargets().find(b => { const t = rangedAim(b); return Math.hypot(t.x - s.x, t.y - s.y) < rangedRadius(b); });
      if (b) { s.done = true; rangedHit(b, s); }
      else if (s.left <= 0 || (inCave() && !caveFree(s.x, s.y + 40, 4))) { s.done = true; rangedMiss(s); }
    }
  }
  ranged.shots = ranged.shots.filter(s => !s.done);
}

// ---------- Lojas do Garibaldi e do São Dunstano ----------
function rangedIcon(id) { return `<span class="upgrade-icon"><img src="${RANGED_ART[id]}" alt="" draggable="false"></span>`; }
function rangedShopHTML() {
  const own = rangedOwned('revolver38'), R = RANGED.revolver38, full = rangedBalas() >= BALAS.max;
  const gun = own ? forjaCard(rangedIcon('revolver38'), R.name, 'Seis tiros, cabo de madeira. Na mata e na caverna, R atira; X troca pro bodoque.', `<small>No tambor: ${rangedDrum()}/${R.drum} · na guaiaca: ${rangedBalas()} balas</small>`, '<button disabled>✔ Já é teu</button>', 'owned')
    : forjaCard(rangedIcon('revolver38'), R.name, 'Seis tiros, cabo de madeira, e o tiro segura o bicho no bote. Vem carregado e com uma caixa de bala.', '', `<button class="primary" data-act="rangedBuy" data-id="revolver38" ${hasCash(R.cost) ? '' : 'disabled'}>Comprar · ${money(R.cost)}</button>`);
  const box = forjaCard(rangedIcon('balas'), 'Caixa de balas .38', BALAS.box + ' balas. O Sadi recarrega sozinho quando o tambor esvazia.', `<small>Na guaiaca: ${rangedBalas()}/${BALAS.max}</small>`,
    `<button class="primary" data-act="rangedBuy" data-id="balas" ${own && !full && hasCash(BALAS.cost) ? '' : 'disabled'}>${!own ? 'Antes, o revólver' : full ? 'Guaiaca cheia' : 'Comprar · ' + money(BALAS.cost)}</button>`);
  return `<h3 class="forja-sec">🎯 Revólver <small>arma de longe · a bala acaba</small></h3><div class="store-list">${gun}${box}</div>`;
}
function rangedBuy(id) {
  if (id === 'revolver38') { if (rangedOwned(id) || !hasCash(RANGED.revolver38.cost)) return; spendCash(RANGED.revolver38.cost); G.up.revolver38 = true; G.rangedPick = 'revolver38'; G.drum38 = RANGED.revolver38.drum; rangedAddBalas(BALAS.box); }
  else if (id === 'balas') { if (!rangedOwned('revolver38') || rangedBalas() >= BALAS.max || !hasCash(BALAS.cost)) return; spendCash(BALAS.cost); rangedAddBalas(BALAS.box); }
  else return;
  AudioEngine.coins(); save(); refreshHUD(); if (modal === 'garibaldiShop') garibaldiShop(); else dunstanShop();
}

// ---------- Sons ----------
// O cão batendo seco, e a recarga: abre o tambor, um estalo por bala e o tambor fechando.
AudioEngine.gunDry = function () { this.noise(.025, .16, 4200); this.note(2300, .03, 'square', .02); };
AudioEngine.gunReload = function (n) {
  this.noise(.05, .16, 1400); this.note(520, .05, 'square', .018);
  for (let i = 0; i < n; i++) setTimeout(() => { this.noise(.02, .14, 3200); this.note(1700, .02, 'triangle', .02); }, 220 + i * 250);
  setTimeout(() => { this.noise(.07, .22, 1800); this.note(760, .05, 'square', .022); }, 300 + n * 250);
};

// ---------- Desenho ----------
function rangedImage(id) { if (!rangedArt[id]) { rangedArt[id] = new Image(); rangedArt[id].src = RANGED_ART[id]; } return rangedArt[id]; }
// A arma na mão do Sadi logo depois do tiro: o 38 aponta pro alvo; o bodoque fica em pé, com o elástico esticado.
function drawRangedHand() {
  const id = rangedWeapon(); if (!id || ranged.hold <= 0) return;
  const p = worldOut, a = ranged.ang, left = Math.cos(a) < 0, hx = p.x + Math.cos(a) * 22, hy = p.y - 60 + Math.sin(a) * 8, im = rangedImage(id);
  ctx.save(); ctx.globalAlpha = Math.min(1, ranged.hold / .12); ctx.imageSmoothingEnabled = false;
  if (id === 'revolver38') {
    ctx.translate(hx, hy); ctx.rotate(a); if (left) ctx.scale(1, -1);
    if (im.naturalWidth) ctx.drawImage(im, -10, -22, 36, 36);
    const v = left ? 11 : -11; ranged.tipX = hx + Math.cos(a) * 24 - Math.sin(a) * v; ranged.tipY = hy + Math.sin(a) * 24 + Math.cos(a) * v; // a boca do cano
  } else {
    ctx.translate(hx, hy - 6); if (im.naturalWidth) ctx.drawImage(im, -16, -18, 32, 32);
    if (ranged.hold > .25) { ctx.strokeStyle = '#8a2a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-9, -12); ctx.lineTo(-Math.cos(a) * 14, -Math.sin(a) * 6); ctx.lineTo(9, -12); ctx.stroke(); }
  }
  ctx.restore();
}
function drawRangedWorld() {
  if (!rangedCombat()) return;
  const im = rangedImage('balas');
  for (const d of ranged.drops) {
    const bob = Math.sin(frameClock * 4 + d.x) * 3; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(d.x, d.y - 12, 26, .25, '255,210,120'); ctx.restore();
    if (im.naturalWidth) { ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(im, d.x - 13, d.y - 28 + bob, 26, 26); ctx.restore(); }
  }
  for (const s of ranged.shots) {
    const { x, y } = typeof rangedDrawPoint === 'function' ? rangedDrawPoint(s) : s;
    if (s.id === 'revolver38') {
      const k = 34 / Math.hypot(s.vx, s.vy) * 1.6; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255,200,120,.45)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - s.vx * k, y - s.vy * k); ctx.lineTo(x, y); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,250,220,.95)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - s.vx * k * .5, y - s.vy * k * .5); ctx.lineTo(x, y); ctx.stroke(); ctx.restore();
    } else { ellipse(x, y + 42, 5, 2, 'rgba(0,0,0,.25)'); ellipse(x, y, 5, 5, '#5a5048'); ellipse(x - 1.5, y - 1.5, 2, 2, '#a89c90'); }
  }
  drawRangedHand();
  if (ranged.flash > 0) {
    const x = ranged.tipX, y = ranged.tipY, a = ranged.ang, k = ranged.flash / .07; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y, 46, .7 * k, '255,190,90');
    ctx.fillStyle = `rgba(255,240,190,${k})`; ctx.beginPath(); ctx.moveTo(x - Math.sin(a) * 5, y + Math.cos(a) * 5); ctx.lineTo(x + Math.cos(a) * 22, y + Math.sin(a) * 22); ctx.lineTo(x + Math.sin(a) * 5, y - Math.cos(a) * 5); ctx.closePath(); ctx.fill(); ctx.restore();
  }
}

// ---------- Botões ----------
let rangedLabel = '';
function updateRangedButton() {
  const box = $('rangedBox'); if (!box) return;
  const id = rangedWeapon(), show = !!id && rangedCombat() && !modal && !scene; box.classList.toggle('hidden', !show); box.classList.toggle('in-cave', inCave()); if (!show) return;
  const drum = rangedDrum(), text = id === 'revolver38' ? '<b>R</b> · 38 ' + (ranged.reload > 0 ? '⟳' : '●'.repeat(drum) + '○'.repeat(RANGED.revolver38.drum - drum)) + ' <small>' + rangedBalas() + '</small>' : '<b>R</b> · Bodoque';
  if (text !== rangedLabel) { rangedLabel = text; $('rangedButton').innerHTML = text; }
  $('rangedSwap').classList.toggle('hidden', rangedList().length < 2);
}

// ---------- Ligações ----------
{
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (!paused && !modal && !scene && !phoneOpen) rangedTick(dt); updateRangedButton(); };
  // Os tiros e as balas no chão vão por cima do escuro (como o clarão do facão).
  const sparks = drawSparks; drawSparks = function (map = null) { if (worldOut && map === worldOut.map && !scene) drawRangedWorld(); sparks(map); };
  const caveK = caveKill; caveKill = function (b) { caveK(b); rangedLoot(b); };
  const mataK = mataKill; mataKill = function (b) { mataK(b); rangedLoot(b); };
  // Baú da caverna e baú de mateiro: metade das vezes tem bala de 38.
  const balasDoBau = () => Math.random() < .5 ? 2 + Math.floor(Math.random() * 5) : 0;
  const caveLoot = caveChestLoot; caveChestLoot = function (loot) { loot.balas ??= balasDoBau(); rangedAddBalas(loot.balas); return caveLoot(loot); };
  const trechoLoot = trechoChestLoot; trechoChestLoot = function (n) { const loot = trechoLoot(n); loot.balas = balasDoBau(); rangedAddBalas(loot.balas); return loot; };
  const tiles = caveLootTiles; caveLootTiles = function (t) { const l = tiles(t); if (t.balas) l.push([rangedIcon('balas'), t.balas, 'balas do 38']); return l; };
  // Na loja do Garibaldi e na ferraria do São Dunstano, o revólver e as balas, logo depois das armas.
  const afterArms = html => { const at = html.indexOf('<h3 class="forja-sec">✨'); return at < 0 ? html + rangedShopHTML() : html.slice(0, at) + rangedShopHTML() + html.slice(at); };
  const gari = garibaldiLojaHTML; garibaldiLojaHTML = function () { return afterArms(gari()); };
  const dun = dunstanLojaHTML; dunstanLojaHTML = function () { return afterArms(dun()); };
  // Quem já conheceu o Garibaldi antes do bodoque ganha na próxima visita ao rancho.
  const shop = garibaldiShop; garibaldiShop = function () {
    if (!G.mataSeen || G.up.bodoque) return shop();
    G.up.bodoque = true; save();
    talk([['garibaldi', 'Toma, gaúcho: um bodoque. Bicho que tu não quer de perto, tu derruba de longe.'], ['garibaldi', 'Vira pro lado dele e aperta R: a pedra vai sozinha no bicho mais perto, na tua frente. Pedra não acaba, mas é fraquinha. Coisa mais braba, tem o revólver 38 aqui na loja.']], () => shop(), 'Valeu, Giuseppe');
  };
  document.addEventListener('keydown', e => {
    if (!worldOut || !rangedCombat() || e.repeat || modal || scene || worldTalkOpen() || ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    const k = e.key.toLowerCase(); if (k !== 'r' && k !== 'x') return; e.preventDefault(); e.stopImmediatePropagation(); if (k === 'r') rangedFire(); else rangedSwap();
  }, true);
  document.addEventListener('DOMContentLoaded', () => { $('hudLayer')?.insertAdjacentHTML('beforeend', '<div id="rangedBox" class="ranged-box hidden"><button id="rangedSwap" class="sling-button ranged-swap hidden" type="button" data-act="rangedSwap" aria-label="Trocar arma">⇄</button><button id="rangedButton" class="sling-button" type="button" data-act="rangedFire"></button></div>'); });
  const act = action; action = function (name, id) { if (name === 'rangedFire') { rangedFire(); return; } if (name === 'rangedSwap') { rangedSwap(); return; } if (name === 'rangedBuy') { rangedBuy(id); return; } return act(name, id); };
}
