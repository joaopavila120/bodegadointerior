// A Salamanca do Jarau (a lenda gaúcha contada por Simões Lopes Neto): a missão do São Dunstano e o chefe do andar 20.
//   · Missão: quando o Sadi já desceu fundo (andar 10), o São Dunstano conta a lenda e pede opala e ouro pra encantar o
//     facão. Depois é descer até o andar 20, onde o Anhangá-Pitã, o Diabo Vermelho, guarda a Teiniaguá numa gaiola de luz.
//   · Chegada: cena com o Diabo (e a voz da Teiniaguá). Sem o encantamento, ele cospe o Sadi de volta pro refúgio.
//   · Luta: ele investe em linha reta; se bater a cabeça num pilar, numa pedra ou na parede, fica tonto e aí o laço (Q)
//     segura ele. Fora disso, ele arrebenta o laço e o couro de brasa aguenta metade do golpe. Chuva de brasas (alvos vermelhos), rastro de fogo, coice de fogo
//     quando o Sadi chega muito perto e bichos de reforço.
//   · Metade da vida: o salão escurece e a Teiniaguá oferece ouro, poder ou nada. Vida baixa: ele corre pra fenda.
//   · Vitória: cena com a Teiniaguá livre e o São Dunstano descendo pra comemorar; a luz do carbúnculo clareia a caverna.
'use strict';

const SALAMANCA_FLOOR = 20, JARAU_FROM = 10, SALAMANCA_CELL = { boss: [11, 5], cage: [11, 1], crack: [20, 1] };
const ENCANTO = { needs: { opala: 3, ouro: 2 } };
const DIABO = { daze: 2.2, hold: 2.6, bonus: 1.3, hide: .5, stompR: 170 };
CAVE_BEASTS.diabo = { name: 'Anhangá-Pitã, o Diabo Vermelho', hp: 2000, speed: 120, dmg: 18, r: 40, cash: [20, 30], from: 999, weight: 0 };
const DIABO_STATES = new Set(['idle', 'windup', 'charge', 'dazed', 'stomp', 'flee']);
function salamancaDone() { return !!G.cave?.salamanca; }
function caveEnchanted() { return !!G.cave?.enchanted; }
function jarauMission() { return MISSIONS.find(m => m.id === 'jarau'); }
function jarauActive() { return missionActive('jarau'); }
function salamancaRun() { const run = inCave() ? caveFloorRun() : null; return run?.floor === SALAMANCA_FLOOR ? run : null; }
function salamancaBoss(run = salamancaRun()) { return run?.beasts.find(b => b.kind === 'diabo' && b.hp > 0) || null; }
// A cabeça do Diabo no desenho (o laço pega no pescoço; no escuro, só os olhos aparecem).
function diaboHead(b) { return { x: b.x + (b.dx < 0 ? -1 : 1) * 60, y: b.y - 122 }; }
function diaboNeck(b) { if (!b.boss) return { x: b.x, y: b.y - 50 }; const h = diaboHead(b); return { x: (h.x + b.x) / 2, y: h.y + 25 }; }
function diaboPhase(b) { const f = b.hp / b.max; return f > .5 ? 1 : f > .15 ? 2 : 3; }

// ---------- A missão do São Dunstano ----------
MISSIONS.push({ id: 'jarau', title: 'A Salamanca do Jarau', giver: 'dunstano', side: true, where: 'Caverna da Serra: a ferraria do São Dunstano (andar 1) e o salão do andar ' + SALAMANCA_FLOOR,
  when: () => !!G.cave?.dunstanTaught && (G.cave?.deepest || 0) >= JARAU_FROM,
  intro: [['dunstano', 'Senta aqui perto da forja, Sadi. Tu já desceu fundo: tá na hora de saber o que mora lá embaixo.'],
    ['dunstano', 'No andar ' + SALAMANCA_FLOOR + ' tem um salão de pedra cheio de ouro: a Salamanca do Jarau. Quem guarda ela é o Anhangá-Pitã, o Diabo Vermelho.'],
    ['dunstano', 'Faz mil anos ele prendeu a Teiniaguá, a princesa moura que virou lagartixa, numa gaiola de luz. A pedra da testa dela, o carbúnculo, clareava esta serra inteira.'],
    ['sadi', 'E o vô sabia dessa história?'],
    ['dunstano', 'Teu vô desceu até lá e voltou de mãos vazias: ferro comum não morde o Diabo. Me traz ' + ENCANTO.needs.opala + ' opalas e ' + ENCANTO.needs.ouro + ' ouros que eu encanto o teu facão.'],
    ['dunstano', 'E leva o laço da laçada. Quando ele investir e bater a cabeça na pedra, fica tonto: aí tu laça e bate sem dó.']],
  goal: () => jarauGoal(), done: () => false,
  reward: { cash: 500, xp: 400, rep: 10, unlock: 'A luz do carbúnculo: a caverna inteira clareada' }, outroBy: 'dunstano',
  outro: [['dunstano', 'A luz do carbúnculo ficou na gruta: daqui pra frente, nenhum andar é escuro pra ti.']] });
function jarauGoal() {
  const st = G.cave || {};
  if (!caveEnchanted()) return 'Leve ' + ENCANTO.needs.opala + ' opalas e ' + ENCANTO.needs.ouro + ' ouros ao São Dunstano pra encantar o facão (tem ' + Math.floor(bagQty('opala')) + ' opala e ' + Math.floor(bagQty('ouro')) + ' ouro · opala sai do andar 6 pra baixo, ouro do 13)';
  if (st.salamancaFled === G.day) return 'O Diabo Vermelho fugiu pela fenda: amanhã ele volta pro salão do andar ' + SALAMANCA_FLOOR;
  if ((st.deepest || 0) < SALAMANCA_FLOOR) return 'Desça até o andar ' + SALAMANCA_FLOOR + ' da caverna (o mais fundo até agora: andar ' + (st.deepest || 1) + ')';
  return 'Vença o Anhangá-Pitã no salão do andar ' + SALAMANCA_FLOOR + ': faça ele bater a cabeça na pedra e laçe (Q) quando ficar tonto';
}
// Conversa com o santo: oferece a missão, lembra do encantamento ou dá a dica da luta.
function jarauTalk() {
  if (!questsOn()) return false;
  const m = jarauMission();
  if (missionForGiver('dunstano') === m) { skipWorldTalk(); offerMission(m); return true; }
  if (!jarauActive()) return false;
  skipWorldTalk();
  if (!caveEnchanted()) {
    const ok = hasNeeds(ENCANTO.needs);
    talk([['dunstano', ok ? 'Trouxe a opala e o ouro! Vem na forja que eu encanto o teu facão.' : 'Pro encantamento: ' + ENCANTO.needs.opala + ' opalas pros olhos e ' + ENCANTO.needs.ouro + ' ouros pra alma. Opala aparece do andar 6 pra baixo; ouro, do 13.']], ok ? () => dunstanShop() : null, ok ? 'Ir pra forja' : 'Vou buscar');
    return true;
  }
  talk([['dunstano', 'O teu facão já tem a luz do carbúnculo. Lá no andar ' + SALAMANCA_FLOOR + ', faz o Diabo investir contra a pedra: tonto, ele não arrebenta o laço.']], null, 'Vou lá');
  return true;
}
function forjaEncantar() {
  if (!dunstanShopOpen() || caveEnchanted() || !jarauActive()) return;
  if (!hasNeeds(ENCANTO.needs)) { say('Pro encantamento: ' + needsText(ENCANTO.needs).replace(/<[^>]+>/g, '') + '.'); AudioEngine.bad(); return; }
  takeNeeds(ENCANTO.needs); G.cave.enchanted = G.day; AudioEngine.caveAnvil(); setTimeout(() => AudioEngine.ready(), 380); save(); refreshHUD(); closeDialog(true);
  talk([['dunstano', 'Opala pros olhos, ouro pra alma… e uma reza de ferreiro de mosteiro.'], ['dunstano', 'Pronto: o fio do teu facão tem a luz do carbúnculo. Qualquer arma que tu pegar fere o Diabo Vermelho.'],
    ['dica', '<b>🔮 Facão encantado</b><br>Agora é descer até o andar ' + SALAMANCA_FLOOR + '. A corda do vô leva direto até o andar mais fundo que tu já alcançou.', 'A Salamanca do Jarau']], () => dunstanShop(), 'Valeu, santo');
}
function dunstanEnchantHTML() {
  return forjaCard('<span class="forja-encanto">' + forgeWeaponIcon(caveWeapon().id) + '</span>', 'Facão encantado', 'A luz do carbúnculo no fio: qualquer arma na mão fere o Diabo Vermelho da Salamanca.', '', '<button disabled>✔ Encantado</button>', 'owned');
}

// ---------- O salão ----------
function buildSalamanca(run) {
  const { cols, rows } = CAVE; run.grid = Array.from({ length: rows }, (_, y) => Array.from({ length: cols }, (_, x) => x === 0 || y === 0 || x === cols - 1 || y === rows - 1 ? 1 : 0));
  for (const [x, y] of [[6, 4], [16, 4], [6, 9], [16, 9]]) run.grid[y][x] = 1;
  // Poucas pedras com veio (ágata, ouro e opala): servem de abrigo e de parede pra investida.
  run.rocks = [[4, 3, 'agata'], [18, 6, 'ouro'], [13, 8, 'agata'], [8, 7, 'opala']].map(([x, y, loot]) => ({ ...caveCenter(x, y), hp: 4, loot }));
  Object.assign(run, { chest: null, fires: [], brasas: [], beasts: [], salamanca: true, ladder: { ...caveCenter(20, 11), shown: salamancaDone() } });
  if (salamancaDone()) return run;
  if (!jarauActive()) { run.sleeping = true; return run; }
  if (G.cave?.salamancaFled === G.day) { run.fled = true; return run; }
  const p = caveCenter(...SALAMANCA_CELL.boss), B = CAVE_BEASTS.diabo;
  run.beasts = [{ kind: 'diabo', x: p.x, y: p.y, hp: B.hp, max: B.hp, dx: -1, state: 'idle', t: 1.6, vx: 0, vy: 0, hurt: 0, frame: 0, boss: true, summon: 10, stompCd: 0 }];
  return run;
}

// ---------- O Diabo ----------
function diaboTick(b, dt, run, p) {
  const B = CAVE_BEASTS.diabo, dxp = p.x - b.x, dyp = p.y - b.y, dist = Math.hypot(dxp, dyp) || 1, phase = diaboPhase(b);
  b.hurt = Math.max(0, b.hurt - dt); b.attack = Math.max(0, (b.attack || 0) - dt); b.stompCd = Math.max(0, (b.stompCd || 0) - dt); b.t -= dt; b.frame += dt * 7;
  // Golpe no meio da investida (ou o sino do santo) deixa um estado que não é dele: volta a rodear o Sadi.
  if (!DIABO_STATES.has(b.state)) { b.state = 'idle'; b.t = Math.max(b.t, .6); }
  if (phase >= 2 && !b.tempted) { b.tempted = true; b.state = 'idle'; b.t = 1.4; effect('O salão escureceu!', b.x, b.y - 240, '#ffb3a0', 18); AudioEngine.caveGrowl(.9, .1); salamancaTemptation(); return; }
  if (phase === 3 && b.state !== 'flee') { b.state = 'flee'; effect('Ele vai fugir pela fenda!', b.x, b.y - 240, '#ffb3a0', 18); floatNote('O Diabo Vermelho corre pra fenda: laça ele (Q) e termina com o facão!'); }
  const move = (vx, vy) => caveMove(b, vx * dt, vy * dt);
  if (b.state === 'flee') {
    const c = caveCenter(...SALAMANCA_CELL.crack), d = Math.hypot(c.x - b.x, c.y - b.y) || 1; b.dx = c.x < b.x ? -1 : 1;
    const ox = b.x, oy = b.y; move((c.x - b.x) / d * 150, (c.y - b.y) / d * 150);
    if (Math.hypot(b.x - ox, b.y - oy) < 150 * dt * .3) { b.x += (c.x - b.x) / d * 150 * dt; b.y += (c.y - b.y) / d * 150 * dt; }
    if (d < 50) diaboEscape(run, b);
    return;
  }
  if (b.state === 'idle') {
    // Perto demais: coice de fogo (o círculo vermelho avisa antes).
    if (dist < DIABO.stompR - 10 && b.stompCd <= 0) { b.state = 'stomp'; b.t = .6; AudioEngine.caveGrowl(.35, .09); return; }
    // Rodeia o Sadi a uma certa distância e escolhe o próximo golpe.
    const want = dist > 330 ? 1 : dist < 220 ? -1 : 0; if (Math.abs(dxp) > 6) b.dx = dxp < 0 ? -1 : 1;
    move(dxp / dist * B.speed * want + (-dyp / dist) * 50, dyp / dist * B.speed * want + (dxp / dist) * 50);
    b.summon -= dt;
    if (b.t <= 0) {
      const minions = run.beasts.filter(x => x !== b && x.hp > 0).length;
      if (b.summon <= 0 && minions < 2) { b.summon = 18; diaboSummon(run, b, phase); b.t = 1.2; }
      else if (Math.random() < .6) { b.state = 'windup'; b.t = b.t0 = phase === 1 ? .75 : .55; b.vx = dxp / dist; b.vy = dyp / dist; b.dx = b.vx < 0 ? -1 : 1; AudioEngine.caveGrowl(.4, .09); }
      else { diaboRain(run, p, phase); b.t = 2.2; }
    }
  } else if (b.state === 'windup') { if (b.t <= 0) { b.state = 'charge'; b.t = 1.1; b.trail = 0; AudioEngine.caveFireball(); } }
  else if (b.state === 'charge') {
    const sp = phase === 1 ? 560 : 620; b.trail -= dt; if (b.trail <= 0) { b.trail = .07; run.fires.push({ x: b.x, y: b.y, t: 1.6, r: 30 }); }
    // Bateu no pilar, na pedra ou na parede: fica tonto, e aí o laço segura.
    if (!move(b.vx * sp, b.vy * sp)) { run.fires = run.fires.filter(f => Math.hypot(f.x - b.x, f.y - b.y) > 160); b.state = 'dazed'; b.t = DIABO.daze; run.shake = .4; AudioEngine.caveStone(); AudioEngine.caveCrumble(); effect('Bateu a cabeça! Laça ele (Q)!', b.x, b.y - 240, '#ffe28a', 18); fxStars(b.x, b.y - 150, 6); }
    else if (b.t <= 0) { b.state = 'idle'; b.t = 1.2; }
    if (Math.hypot(p.x - b.x, p.y - b.y) < B.r + 30) caveHurt(B.dmg, b);
  } else if (b.state === 'stomp') {
    if (b.t <= 0) {
      b.state = 'idle'; b.t = .9; b.stompCd = 3; run.shake = .3; AudioEngine.caveFireball(); AudioEngine.caveStone();
      for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; fxPuffs(b.x + Math.cos(a) * DIABO.stompR * .8, b.y + Math.sin(a) * DIABO.stompR * .35, 2, 40, '#ff7a3a'); }
      if (Math.hypot(p.x - b.x, (p.y - b.y) * 1.3) < DIABO.stompR) { caveHurt(16, b); const d = Math.hypot(p.x - b.x, p.y - b.y) || 1; caveMovePlayer((p.x - b.x) / d * 70, (p.y - b.y) / d * 70); }
    }
  } else if (b.state === 'dazed') { if (b.t <= 0) { b.state = 'idle'; b.t = 1; } }
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
    const hp = Math.round(B.hp * 1.5); run.beasts.push({ kind, x, y, hp, max: hp, dx: 1, state: 'roam', t: .5, vx: 0, vy: 0, hurt: 0, frame: 0, minion: true }); fxPuffs(x, y - 30, 10, 90, '#8a2a1a');
  }
  effect('O Diabo chamou reforço!', b.x, b.y - 240, '#ffb3a0', 16); AudioEngine.caveGrowl(.6, .1);
}
function diaboEscape(run, b) {
  b.hp = 0; run.beasts = run.beasts.filter(x => x !== b); G.cave.salamancaFled = G.day; run.rope = null; fxPuffs(b.x, b.y - 40, 14, 120, '#5a1a10'); save();
  talk([['card', '<b>🔥 Fugiu pela fenda!</b><br>O Diabo Vermelho se espremeu na fenda da pedra e sumiu no fundo da serra, rindo. Amanhã ele volta pro salão, com a vida cheia.<br><br><i>Na fase final, laça ele (Q) antes que chegue na fenda: fugindo, ele não arrebenta o laço.</i>', 'A Salamanca do Jarau']], null, 'Até amanhã');
}
// A Teiniaguá oferece: ouro, poder ou nada. Quem recusa ganha coragem.
function salamancaTemptation() {
  openDialog('A Teiniaguá', `<div class="rpg-speaker">${expansionPortrait('cave-beasts-b-v1', 4, 88)}<div><p><b>Teiniaguá</b> · da gaiola de luz, ela fala na tua cabeça</p><p>“Ninguém vence o Anhangá-Pitã sem pagar. Escolhe, gaúcho: ouro, poder… ou nada.”</p></div></div><div class="store-list">
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

// ---------- O laço (Q) ----------
function salamancaLasso() {
  const run = salamancaRun(); if (!run || caveDefeatActive() || paused || modal || scene || worldTalkOpen()) return;
  if ((run.lassoCd || 0) > 0) { floatNote('O laço ainda tá voltando pra mão.'); return; }
  const p = worldOut, fx = p.dx ?? 1, fy = p.dy ?? 0;
  const list = run.beasts.filter(b => b.hp > 0 && Math.hypot(b.x - p.x, b.y - p.y) < (b.boss ? 360 : 300)).sort((a, c) => (c.boss ? 1 : 0) - (a.boss ? 1 : 0) || Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(c.x - p.x, c.y - p.y));
  run.lassoCd = 3; AudioEngine.lassoThrow();
  const b = list[0]; if (!b) { run.rope = { x: p.x + fx * 220, y: p.y - 30 + fy * 160, t: .3 }; effect('Laço no vazio…', p.x, p.y - 140, '#ffe2a6', 16); return; }
  // Inteiro e de cabeça fresca, o Diabo arrebenta o laço: só tonto (ou fugindo) ele fica preso.
  if (b.boss && b.state !== 'dazed' && b.state !== 'flee') {
    run.rope = { t: .35, target: b, snap: true }; setTimeout(() => AudioEngine.ropeHit(), 160); effect('Arrebentou o laço!', b.x, b.y - 240, '#ffb3a0', 18);
    if (!run.warnLasso || run.t - run.warnLasso > 8) { run.warnLasso = run.t; floatNote('Laça o Diabo quando ele estiver tonto: faz ele investir e bater a cabeça na pedra.'); }
    return;
  }
  if (b.stun > 0) { floatNote('Ele já tá laçado: bate!'); run.lassoCd = .5; return; }
  // Uma laçada por tontura: quando o laço solta, ele levanta brabo.
  const hold = b.boss ? DIABO.hold : 2.5; b.stun = hold; if (b.boss && b.state === 'dazed') b.t = 0; run.rope = { t: hold, target: b };
  setTimeout(() => AudioEngine.ropeHit(), 160); effect(b.boss ? 'Laçado! Bate agora!' : 'Laçado!', b.x, b.y - (b.boss ? 240 : 140), '#ffe28a', 18); fxStars(b.x, b.y - 90, 5);
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
function drawDiaboSprite(x, y, dx, step, o = {}) {
  ctx.save(); if (o.alpha != null) ctx.globalAlpha = o.alpha;
  ellipse(x, y, 44, 13, '#0009'); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 90, 120, .22 + .08 * Math.sin(frameClock * 5), '255,70,30'); ctx.globalCompositeOperation = 'source-over';
  const f = diaboFrame(12 + step, 210, expansionRowHeight('cave-beasts-b-v1', 12, 4));
  if (f) { ctx.translate(x, y); if (dx < 0) ctx.scale(-1, 1); ctx.drawImage(f.image, -f.ax, -f.h, f.w, f.h); if (o.hurt) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= .6; ctx.drawImage(f.image, -f.ax, -f.h, f.w, f.h); } }
  else { ellipse(x, y - 80, 46, 80, '#8a1a10'); ellipse(x, y - 170, 26, 24, '#a8241a'); }
  ctx.restore();
}
function diaboHidden(b) { const run = caveFloorRun(); return diaboPhase(b) >= 2 && !run.torch && Math.hypot(worldOut.x - b.x, worldOut.y - b.y) > 170; }
function drawDiabo(b) {
  if (scene || diaboHidden(b)) return;
  const shake = b.state === 'windup' ? windupLean(b, teleK(b.t, b.t0 || .75), 14, 2.5) : b.state === 'stomp' ? windupLean(b, teleK(b.t, .6), 0, 3) : 0;
  const step = b.state === 'charge' || b.state === 'stomp' || b.attack > 0 ? 3 : b.state === 'dazed' || b.stun > 0 ? 1 : Math.floor(b.frame) % 3;
  drawDiaboSprite(b.x + shake, b.y, b.dx, step, { hurt: b.hurt > 0 });
  if (b.stun > 0 || b.state === 'dazed') { const h = diaboHead(b); for (let k = 0; k < 3; k++) { const a = frameClock * 6 + k * 2.1; txt('✦', h.x + Math.cos(a) * 34, h.y - 50 + Math.sin(a) * 8, 15, '#ffd75e'); } }
}
// Ator das cenas: o mesmo Diabo, que pode afundar na fenda no fim da luta.
function diaboActorDraw(a, y) {
  const k = a.sink || 0;
  drawDiaboSprite(a.x, y + k * 50, a.dx, a.walk ? Math.floor(frameClock * 7) % 3 : a.rage ? 3 : 0, { alpha: 1 - k });
  if (k > 0 && k < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(a.x, y - 40, 160, .5 * (1 - k), '255,90,30'); ctx.restore(); }
}
function drawDiaboEyes(b) { if (!diaboHidden(b) || scene) return; const h = diaboHead(b); ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) glow(h.x + s * 12, h.y, 22, .8, '255,60,20'); ctx.restore(); for (const s of [-1, 1]) ellipse(h.x + s * 12, h.y, 5, 3, '#ffe060'); }
function drawSalamancaHall(run) {
  // A gaiola de luz da Teiniaguá, a fenda e o ouro amontoado.
  const c = caveCenter(...SALAMANCA_CELL.cage), k = caveCenter(...SALAMANCA_CELL.crack), gone = run.teiniaguaGone || 0;
  if (!salamancaDone() && gone < 1) {
    const free = run.cageOpen;
    ctx.save(); ctx.globalAlpha = 1 - gone; ctx.globalCompositeOperation = 'lighter'; glow(c.x, c.y + 10, free ? 220 : 110, (free ? .55 : .35) + .1 * Math.sin(frameClock * 3), '255,90,60'); ctx.restore();
    ctx.save(); ctx.globalAlpha = 1 - gone; expansionSprite('cave-beasts-b-v1', 4 + Math.floor(frameClock * 3) % 3, c.x, c.y + 40 - (free ? Math.abs(Math.sin(frameClock * 4)) * 10 : 0), 70, false, expansionRowHeight('cave-beasts-b-v1', 4, 3)); ctx.restore();
    if (!free) { ctx.strokeStyle = 'rgba(255,200,140,.75)'; ctx.lineWidth = 3; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(c.x + i * 18, c.y - 40); ctx.lineTo(c.x + i * 18, c.y + 44); ctx.stroke(); } ctx.beginPath(); ctx.ellipse(c.x, c.y - 40, 44, 12, 0, Math.PI, 0); ctx.stroke(); }
  }
  ellipse(k.x, k.y + 10, 30, 52, '#050302'); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(k.x, k.y + 10, 60, .25, '200,40,20'); ctx.restore();
  for (const [x, y] of [[3, 2], [18, 3], [4, 11], [12, 12]]) { const g = caveCenter(x, y); for (let i = 0; i < 5; i++) ellipse(g.x - 16 + i * 8, g.y + 10 - (i % 2) * 6, 9, 6, i % 2 ? '#e8b030' : '#c89020'); }
  // Sem a missão do santo, o Diabo dorme em cima do ouro.
  if (run.sleeping) { const p = caveCenter(...SALAMANCA_CELL.boss); drawDiaboSprite(p.x, p.y, -1, 1, { alpha: .75 }); for (let i = 0; i < 3; i++) { const t = (frameClock * .6 + i / 3) % 1; txt('z', p.x - 70 - t * 30, p.y - 170 - t * 60, 14 + t * 10, `rgba(255,226,166,${1 - t})`); } }
}
function drawSalamancaFires(run) {
  for (const f of run.fires) { const a = Math.min(1, f.t); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(f.x, f.y - 8, 40, .35 * a, '255,110,30'); ctx.restore(); ellipse(f.x, f.y, f.r * .8, f.r * .32, `rgba(255,120,40,${.45 * a})`); }
}
// Por cima do escuro: os avisos (investida, coice, brasas), o laço e, na fase escura, os olhos do Diabo.
function drawSalamancaHazards(run) {
  const b = salamancaBoss(run);
  if (b) {
    drawDiaboEyes(b);
    if (b.state === 'windup') teleLane(b.x, b.y - 10, Math.atan2(b.vy, b.vx), 520, 68, teleK(b.t, b.t0 || .75), '255,80,30');
    if (b.state === 'stomp') teleArea(b.x, b.y, DIABO.stompR, DIABO.stompR * .45, teleK(b.t, .6), '255,80,30');
  }
  for (const s of run.brasas) teleArea(s.x, s.y, 46, 18, teleK(s.t, 1.1), '255,80,30');
  const r = run.rope;
  if (r && r.t > 0) { const p = worldOut, n = r.target ? diaboNeck(r.target) : r, tx = r.snap ? (p.x + n.x) / 2 : n.x, ty = r.snap ? (p.y - 70 + n.y) / 2 : n.y; ctx.strokeStyle = '#c8a060'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.x + 12, p.y - 70); ctx.quadraticCurveTo((p.x + tx) / 2, Math.min(p.y, ty) - 60, tx, ty); ctx.stroke(); }
}
function drawSalamancaHUD(run) {
  const b = salamancaBoss(run); if (!b) return;
  // Entre o painel da missão (à esquerda) e o da caverna (à direita); em tela estreita, embaixo do painel da caverna.
  const dpr = canvas.width / Math.max(1, canvas.clientWidth), W = canvas.clientWidth, left = 316, right = W - 280, narrow = right - left < 300;
  const w = narrow ? W - 32 : Math.min(520, right - left), x = narrow ? 16 : left + (right - left - w) / 2, y = narrow ? 108 : 16;
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  rect(x, y, w, 46, 'rgba(20,8,6,.85)', 8, '#a83a24'); txt('🔥 ' + CAVE_BEASTS.diabo.name, x + w / 2, y + 14, 13, '#ffd2b0', 'center', 'Georgia', false);
  rect(x + 12, y + 24, w - 24, 12, '#2a0a06', 5); rect(x + 12, y + 24, (w - 24) * b.hp / b.max, 12, '#e8442a', 5);
  for (const f of [.5, .15]) rect(x + 12 + (w - 24) * f - 1, y + 22, 2, 16, '#ffd2b0');
  ctx.restore();
}

// ---------- Cenas ----------
function jarauFightTip() {
  talk([['dica', '<b>Como vencer o Diabo Vermelho</b><br>· Ele investe em linha reta (a faixa vermelha avisa): fica perto de um pilar ou de uma pedra e sai do caminho. Se ele bater a cabeça, fica tonto.<br>· Tonto, <b>laça ele (Q)</b>: laçado, ele não escapa e apanha mais. Fora disso, ele arrebenta o laço, e o couro de brasa dele aguenta metade do golpe.<br>· Fuja dos alvos vermelhos no chão (brasas) e do rastro de fogo. Muito perto dele, o círculo vermelho é o coice de fogo.', 'A Salamanca do Jarau']], null, 'Encarar');
}
function salamancaLights() { const cage = caveCenter(...SALAMANCA_CELL.cage), boss = caveCenter(...SALAMANCA_CELL.boss); return [{ x: cage.x, y: cage.y, r: 220, a: .35, color: '255,90,60' }, { x: boss.x, y: boss.y - 90, r: 260, a: .3, color: '255,70,30' }]; }
// Chegada no salão: o Diabo, a Teiniaguá na gaiola e o Sadi com o facão encantado.
function salamancaArrival() {
  G.cave.jarauMet = G.day; save();
  const spot = { x: 470, y: 640 }, begin = () => { Object.assign(worldOut, { ...spot, dx: 1, dy: 0, walk: false }); jarauFightTip(); };
  if (!scenesEnabled()) { begin(); return; }
  const s = caveCenter(...CAVE.start), boss = caveCenter(...SALAMANCA_CELL.boss);
  playSteps([...sceneWorld({ map: 'caverna', x: 540, y: 700, night: .35, lights: salamancaLights() }),
    { actor: 'sadi', x: s.x, y: s.y - 10, dx: 1, dy: -1 }, { actor: 'diabo', x: boss.x, y: boss.y, dx: -1, draw: diaboActorDraw }, { fade: 'in', time: 1 },
    { walk: 'sadi', to: spot },
    { say: 'sadi', text: 'Bah… um salão inteiro de ouro. Então a Salamanca existe mesmo.' },
    scenePan(700, 520), { wait: 1.2 }, { do: () => AudioEngine.caveGrowl(.9, .1) },
    { say: 'diabo', text: 'Mais um gaúcho que desce atrás do ouro da Salamanca… Pega um punhado, guri. Pega e vai embora.' },
    { say: 'sadi', text: 'Não vim atrás de ouro. Vim buscar a Teiniaguá.' },
    { say: 'teiniagua', text: 'Gaúcho… faz mil anos que ninguém diz o meu nome aqui embaixo.' },
    { say: 'diabo', text: 'A princesa moura é minha! Fui eu que tranquei o carbúnculo dela nessa gaiola de luz.' },
    { say: 'sadi', text: 'O São Dunstano encantou o meu facão. Hoje tu solta ela.' },
    { say: 'diabo', text: 'Dunstano! O ferreiro que me torceu o nariz com a tenaz em brasa, faz mil anos… Eu não esqueço, gaúcho. Eu não esqueço.' },
    sceneSet('diabo', { rage: true }), { do: () => { sceneShout('HAHAHA!', boss.x, boss.y - 200, '#ffb3a0', 26); AudioEngine.caveGrowl(1.1, .12); } },
    { say: 'diabo', text: 'Então vem! Vou te devolver lá pra cima feito cinza de fogo de chão!' },
    { fade: 'out', time: .6 }], 'salamanca-chegada', begin);
}
// Sem o encantamento: o Diabo ri do facão e cospe o Sadi de volta pro refúgio do santo.
function salamancaNoEnchant() {
  const back = () => {
    caveState().floor = 1; caveRun = null; switchMap({ map: 'caverna', x: 620, y: 800, title: 'Refúgio · andar 1' });
    talk([['dunstano', 'Eu avisei, vivente: ferro comum não morde o Anhangá-Pitã. Ele te cuspiu de volta pra cá!'], ['dunstano', 'Me traz ' + ENCANTO.needs.opala + ' opalas e ' + ENCANTO.needs.ouro + ' ouros que eu encanto o teu facão. Aí sim tu desce.']], null, 'Vou buscar');
  };
  if (!scenesEnabled()) { back(); return; }
  const s = caveCenter(...CAVE.start), boss = caveCenter(...SALAMANCA_CELL.boss);
  playSteps([...sceneWorld({ map: 'caverna', x: 540, y: 700, night: .35, lights: salamancaLights() }),
    { actor: 'sadi', x: s.x, y: s.y - 10, dx: 1, dy: -1 }, { actor: 'diabo', x: boss.x, y: boss.y, dx: -1, draw: diaboActorDraw }, { fade: 'in', time: .8 },
    { walk: 'sadi', to: { x: 470, y: 640 } },
    { say: 'diabo', text: 'Hehehe… esse facão de ferro comum não me faz nem cócega, gaúcho.' },
    { say: 'sadi', text: 'Bah… o São Dunstano avisou: sem o encantamento não adianta.' },
    sceneSet('diabo', { rage: true }), { say: 'diabo', text: 'Volta lá pra cima antes que eu te asse feito costela!' },
    { do: () => { fxPuffs(470, 580, 18, 200, '#ff7a3a'); AudioEngine.caveFireball(); AudioEngine.caveCrumble(); } }, { wait: .5 }, { fade: 'out', time: .6 }], 'salamanca-sem-encanto', back);
}
// Vitória: o Diabo afunda na fenda, a gaiola cai, a Teiniaguá fica livre e o São Dunstano desce pra comemorar.
function salamancaVictory(b) {
  const run = caveFloorRun(); run.fires = []; run.brasas = []; run.rope = null; run.swing = null; run.cd = 0; for (const m of run.beasts) if (m.minion) m.hp = 0;
  run.drops.push({ x: b.x, y: b.y + 30, k: 'ouro', q: 3 }, { x: b.x + 40, y: b.y + 30, k: 'opala', q: 2 });
  const finish = () => { G.cave.salamanca = G.day; run.torch = true; run.ladder.shown = true; run.ladderPing = 3; run.cageOpen = false; run.teiniaguaLeaving = false; run.teiniaguaGone = 0; save(); completeMission(jarauMission()); };
  if (!scenesEnabled()) { finish(); return; }
  const p = worldOut, mid = { x: (p.x + b.x) / 2, y: (p.y + b.y) / 2 + 60 }, sadiDx = b.x < p.x ? -1 : 1, cage = caveCenter(...SALAMANCA_CELL.cage);
  playSteps([...sceneWorld({ map: 'caverna', x: mid.x, y: mid.y, night: .3, lights: salamancaLights() }),
    { actor: 'sadi', x: p.x, y: p.y, dx: sadiDx }, { actor: 'diabo', x: b.x, y: b.y, dx: -sadiDx, draw: diaboActorDraw }, { fade: 'in', time: .5 },
    { say: 'diabo', text: 'Arghh… ferro encantado e laço de gaúcho… Isso não termina aqui, guri!' },
    { do: () => { scene.actors.diabo.sinking = true; AudioEngine.caveCrumble(); AudioEngine.caveFireball(); fxPuffs(b.x, b.y - 40, 16, 160, '#ff7a3a'); } }, { wait: 1.6 },
    scenePan(cage.x - 120, cage.y + 260), { do: () => { run.cageOpen = true; AudioEngine.caveGem(); fxStars(cage.x, cage.y - 20, 8); } }, { wait: 1.4 },
    { say: 'teiniagua', text: 'A gaiola caiu! Mil anos, gaúcho… mil anos sem ver a luz da serra.' },
    { say: 'sadi', text: 'Tá livre, princesa. Pode ir pra onde quiser.' },
    { actor: 'dunstano', x: p.x - 110 * sadiDx, y: p.y + 20, dx: sadiDx, alpha: 0, alphaTo: .9, ghost: true }, { do: () => AudioEngine.caveGhost() }, scenePan(p.x, p.y + 80), { wait: 1.4 },
    { say: 'dunstano', text: 'Eu senti o tranco lá do primeiro andar! A gruta inteira tremeu.' },
    { say: 'dunstano', text: 'Faz mil anos eu peguei esse diabo pelo nariz com a tenaz. Agora foi um gaúcho de laço e facão. Que orgulho, vivente!' },
    { say: 'sadi', text: 'O facão era o do vô, santo. O encanto foi o senhor que pôs.' },
    { say: 'teiniagua', text: 'Santo ferreiro, gaúcho: fiquem com a luz da minha pedra. Onde vocês pisarem nesta serra, nunca mais vai ser escuro.' },
    { do: () => { const w = scene.world; w.night = 0; w.lights.push({ x: p.x, y: p.y - 80, r: 900, a: .28, color: '255,220,160' }); run.teiniaguaLeaving = true; AudioEngine.caveGem(); AudioEngine.ready(); } }, { wait: 1.6 },
    { say: 'dunstano', text: 'Teu vô ia ficar faceiro. Agora sobe e vai abrir a bodega, que o povo tá com sede!' },
    { fade: 'out', time: .8 }], 'salamanca-vitoria', finish);
}

// ---------- Ligações ----------
{
  const build = buildCaveFloor; buildCaveFloor = function (floor) { const run = build(floor); if (floor === SALAMANCA_FLOOR) buildSalamanca(run); if (salamancaDone()) run.torch = true; return run; };
  const beast = caveBeastTick; caveBeastTick = function (b, dt, run, p) { if (b.kind !== 'diabo' || b.stun > 0) return beast(b, dt, run, p); diaboTick(b, dt, run, p); };
  // Só arma encantada fere o Diabo; tonto ou laçado ele apanha mais; a coragem e o poder da Salamanca aumentam o golpe.
  const hit = caveHitDmg; caveHitDmg = function (b) {
    const run = caveFloorRun(); let d = hit(b);
    if (b?.kind === 'diabo') { if (!caveEnchanted()) { if (!run.warnEnchant || run.t - run.warnEnchant > 6) { run.warnEnchant = run.t; floatNote('O facão mal arranha o Diabo: só arma encantada fere ele. Fala com o São Dunstano.'); } return 1; } if (b.stun > 0 || b.state === 'dazed') d = Math.round(d * DIABO.bonus);
      // Couro de brasa: fora do laço (e da tontura), o golpe pega pela metade.
      else if (b.state !== 'flee') { d = Math.round(d * DIABO.hide); if (!run.warnHide || run.t - run.warnHide > 10) { run.warnHide = run.t; floatNote('Couro de brasa: fora do laço, o golpe pega pela metade. Faz ele bater a cabeça e laça!'); } } }
    if (run.salamanca) { if (run.courage) d = Math.round(d * 1.25); if (run.power > 0) d = Math.round(d * 1.6); }
    return d;
  };
  const swing = caveSwingColor; caveSwingColor = function () { return caveEnchanted() && !caveBuff('aguabenta') ? '200,170,255' : swing(); };
  // O Diabo é pesado: o golpe do facão quase não empurra ele.
  const attack = caveAttack; caveAttack = function () { const b = salamancaBoss(), ox = b?.x, oy = b?.y; attack(); if (b && b.hp > 0) { b.x = ox + (b.x - ox) * .2; b.y = oy + (b.y - oy) * .2; } };
  const kill = caveKill; caveKill = function (b) { kill(b); if (b.kind === 'diabo') salamancaVictory(b); };
  // A boleadeira não segura o Diabo: só o laço.
  const use = caveUse; caveUse = function (id) {
    const b = id === 'boleadeira' ? salamancaBoss() : null, before = b && { stun: b.stun || 0, state: b.state }, ok = use(id);
    if (b && ok) { Object.assign(b, before); effect('A boleadeira não segura o Diabo: só o laço (Q)!', b.x, b.y - 240, '#ffe2a6', 16); }
    return ok;
  };
  const tick = caveTick; caveTick = function (dt) {
    tick(dt);
    // Desceu fundo: o santo chama pra contar a lenda.
    if (!G.cave.jarauCalled && missionForGiver('dunstano') === jarauMission()) { G.cave.jarauCalled = G.day; showBanner('São Dunstano quer falar contigo', 'Ele tá na ferraria, no primeiro andar da caverna.', 'info', { world: true }); AudioEngine.heart(); save(); }
    const run = salamancaRun(); if (!run || paused || modal || scene || phoneOpen || caveDefeatActive()) return;
    if (run.sleeping && Math.hypot(worldOut.x - caveCenter(...SALAMANCA_CELL.boss).x, worldOut.y - caveCenter(...SALAMANCA_CELL.boss).y) < 300 && (!run.warnSleep || run.t - run.warnSleep > 8)) { run.warnSleep = run.t; floatNote('O Diabo Vermelho dorme em cima do ouro. Sem o São Dunstano, melhor não acordar ele.'); }
    run.lassoCd = Math.max(0, (run.lassoCd || 0) - dt); run.power = Math.max(0, (run.power || 0) - dt);
    if (run.rope) { run.rope.t -= dt; if (run.rope.t <= 0 || run.rope.target?.hp <= 0) run.rope = null; }
    const p = worldOut;
    for (const f of run.fires) { f.t -= dt; if (f.t > 0 && Math.hypot(p.x - f.x, (p.y - f.y) * 1.6) < f.r) caveHurt(6, f); }
    run.fires = run.fires.filter(f => f.t > 0);
    for (const s of run.brasas) { s.t -= dt; if (s.t <= 0) { fxPuffs(s.x, s.y - 10, 8, 80, '#ff7a3a'); AudioEngine.caveFireball(); if (Math.hypot(p.x - s.x, (p.y - s.y) * 2.4) < 50) caveHurt(14, s); } }
    run.brasas = run.brasas.filter(s => s.t > 0);
  };
  const cave = WORLD_MAPS.caverna, draw = cave.draw, hint = cave.hint;
  cave.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers);
    const run = salamancaRun(); if (!run) return;
    layers.push({ y: -1e6, draw: () => drawSalamancaHall(run) }, { y: -9e5, draw: () => drawSalamancaFires(run) });
    const b = salamancaBoss(run);
    if (b && diaboPhase(b) >= 2 && !run.torch && !scene) layers.push({ y: 2e6, draw: () => { const p = worldOut, g = ctx.createRadialGradient(p.x, p.y - 40, 60, p.x, p.y - 40, 420); g.addColorStop(0, 'rgba(6,2,2,0)'); g.addColorStop(1, 'rgba(6,2,2,.85)'); ctx.fillStyle = g; ctx.fillRect(p.x - 3000, p.y - 3000, 6000, 6000); } });
  };
  cave.hint = function () {
    const run = salamancaRun(); if (!run || worldNearest()) return hint.call(this);
    if (run.sleeping) return 'Andar ' + run.floor + ' · a Salamanca · o Diabo dorme: fala com o <strong>São Dunstano</strong> no primeiro andar';
    if (!salamancaBoss(run)) return hint.call(this);
    return 'Andar ' + run.floor + ' · a Salamanca · <strong>Espaço/F</strong> facão · <strong>Q</strong> laço (com ele tonto)' + (caveUp('dash') ? ' · <strong>Shift</strong> dash' : '');
  };
  const onEnter = cave.onEnter; cave.onEnter = function () {
    onEnter.call(this); const run = salamancaRun(); if (!run || salamancaDone()) return;
    if (run.sleeping) { floatNote('No fundo do salão, o Diabo Vermelho dorme em cima do ouro. O São Dunstano sabe essa história.'); return; }
    if (run.fled) { floatNote('O salão tá vazio: o Diabo fugiu pela fenda e só volta amanhã.'); return; }
    const b = salamancaBoss(run); if (!b) return;
    if (!caveEnchanted()) { salamancaNoEnchant(); return; }
    if (!G.cave.jarauMet) { salamancaArrival(); return; }
    effect('Voltou, gaúcho? Hehehe…', b.x, b.y - 240, '#ffb3a0', 18); AudioEngine.caveGrowl(.6, .1);
  };
  // O HUD do chefe e os avisos vão por cima da luz da caverna.
  const light = drawCaveLight; drawCaveLight = function () { light(); const run = salamancaRun(); if (run && !scene) { drawSalamancaHazards(run); drawSalamancaHUD(run); } };
  const st = sceneTick; sceneTick = function (dt) {
    st(dt); if (!scene) return;
    for (const a of Object.values(scene.actors)) if (a.sinking) a.sink = Math.min(1, (a.sink || 0) + dt / 1.4);
    const run = salamancaRun(); if (run?.teiniaguaLeaving) run.teiniaguaGone = Math.min(1, (run.teiniaguaGone || 0) + dt / 1.5);
  };
  const bd = drawCaveBeast; drawCaveBeast = function (b) { if (b.kind === 'diabo') { drawDiabo(b); return; } bd(b); };
  // Falas das cenas: o Diabo com o retrato do Anhangá pintado de brasa.
  const speaker = sceneSpeaker; sceneSpeaker = function (who) { if (who === 'diabo') return { portrait: `<span class="diabo-portrait">${expansionPortrait('cave-beasts-b-v1', 12, 104)}</span>`, name: 'Anhangá-Pitã' }; return speaker(who); };
  const wt = worldTalk; worldTalk = function (w) { if (PEOPLE[w.person]?.id === 'dunstano' && jarauTalk()) return; return wt(w); };
  const shop = dunstanShop; dunstanShop = function () {
    shop(); if (modal !== 'dunstanShop' || !jarauActive() || caveEnchanted()) return;
    const ok = hasNeeds(ENCANTO.needs);
    $('dialogContent').querySelector('.forja-top')?.insertAdjacentHTML('beforebegin', `<div class="callout"><b>🔮 A Salamanca do Jarau · encantar o facão</b><br>“Opala pros olhos, ouro pra alma. Com isso o teu facão fere o Diabo Vermelho.”<br>${reqChips(ENCANTO.needs)}<div class="actions"><button class="primary" data-act="forjaEncantar" ${ok ? '' : 'disabled'}>${ok ? 'Encantar o facão' : 'Falta minério'}</button></div></div>`);
  };
  const afiar = dunstanAfiarHTML; dunstanAfiarHTML = function () { const html = afiar(); return caveEnchanted() ? html + dunstanEnchantHTML() : html; };
  // Saves da versão sem missão: a vitória antiga não conta, pra o Sadi viver a história com o santo.
  const mt = missionsTick; missionsTick = function () { if (G.cave?.salamanca && G.missions && !missionDone('jarau')) { delete G.cave.salamanca; delete G.cave.salamancaFled; delete G.cave.jarauMet; caveRun = null; } return mt(); };
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
    // O "!" sobre o santo quando ele tem a missão pra dar (o refúgio pintado redesenha o andar 1, então entra por último).
    const drawAll = cave.draw; cave.draw = function (view, seen, layers) { drawAll.call(this, view, seen, layers); if (caveState().floor === 1 && !scene && missionForGiver('dunstano') === jarauMission()) layers.push({ y: DUNSTAN.y + 1, draw: () => drawQuestBubble(DUNSTAN.x, DUNSTAN.y - 190, 'new') }); };
    $('caveAttackButton')?.insertAdjacentHTML('afterend', '<button id="caveLassoButton" class="sling-button cave-lasso hidden" type="button" data-act="salamancaLaco" title="Laça o Diabo quando ele estiver tonto. Recarga de 3 segundos.">Q · Laço</button>');
  });
  const controls = caveUpdateControls; caveUpdateControls = function () { controls(); const btn = $('caveLassoButton'); if (!btn) return; const run = salamancaRun(), cd = run?.lassoCd || 0; btn.classList.toggle('hidden', !run || !salamancaBoss(run)); btn.disabled = cd > 0; btn.textContent = cd > 0 ? 'Laço · ' + cd.toFixed(1) + 's' : 'Q · Laço'; };
}
