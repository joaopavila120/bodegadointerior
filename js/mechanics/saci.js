// O Saci das noites de vento: não anda pelas estradas, fica nos cantos do mapa (beira de mato, fundo de campo), pulando
// num pé só e parando de vez em quando pra pitar o cachimbo. Chegou perto, ele vira redemoinho e some pra outro canto;
// depois de umas fugas, vai embora de vez naquela noite.
// · Sem cachorro, só se pega de mansinho: enquanto ele pita, chegue perto e aperte E. A cavalo ele ouve o casco de longe.
// · Com o cusco véio, é mais fácil: ele sente o cheiro do fumo, dispara latindo atrás do redemoinho e encurrala o Saci por
//   uns segundos. Corre lá e aperta E.
// Quem segura a carapuça ganha um desejo, sempre entre três: um item do bornal da caverna, uma melhoria de graça e uma
// sorte (minério, dinheiro, boi ou adubo). Depois de um desejo, ele some por uns dias.
'use strict';

const SACI_RULES = { notice: 230, noticeMounted: 320, catchPipe: 90, catchHeld: 125, wander: 210, flee: 330, escapes: 3, rest: 5, held: 6 };
const SACI_SALT = { vila: 23, serra: 37, sc: 59 };
let saciChase = { on: false, cool: 0, bark: 0, watch: 0, lastD: null };
function saciState() { return (G.saci ??= {}); }
function saciResting() { const l = G.saci?.lastWish; return l != null && G.day - l < SACI_RULES.rest; }

// Um canto do mapa: perto das bordas, onde dá pra pisar e longe da estrada.
function saciCorner(M, R, avoid = null) {
  const corners = [[0, 0], [1, 0], [0, 1], [1, 1]].map(c => [c, R()]).sort((a, b) => a[1] - b[1]).map(c => c[0]);
  for (const far of [900, 500, 0]) for (const [cx, cy] of corners) for (let tries = 0; tries < 30; tries++) {
    const x = cx ? M.W - 140 - R() * 560 : 140 + R() * 560, y = cy ? M.H - 120 - R() * 420 : 300 + R() * 420;
    if (avoid && Math.hypot(x - avoid.x, y - avoid.y) < far) continue;
    if (M.canWalk(x, y) && qqRoadDist(M, x, y) > 90) return { x, y };
  }
  return null;
}
function saciWanderTo(M, w) {
  for (let tries = 0; tries < 12; tries++) { const a = Math.random() * Math.PI * 2, r = 60 + Math.random() * SACI_RULES.wander, x = w.home.x + Math.cos(a) * r, y = w.home.y + Math.sin(a) * r * .6; if (M.canWalk(x, y)) return { x, y }; }
  return w.home;
}
function saciMove(w, to, speed, dt) {
  const d = Math.hypot(to.x - w.x, to.y - w.y); if (d < 3) return true;
  const k = Math.min(d, speed * dt); w.x += (to.x - w.x) / d * k; w.y += (to.y - w.y) / d * k; w.dx = to.x < w.x ? -1 : 1; w.walk = true; return d - k < 3;
}
// Um pulo de redemoinho pra longe de quem vem atrás (o cusco): uns metros, sem sair do campo de visão.
function saciHop(M, w, from) {
  const away = Math.atan2(w.y - from.y, w.x - from.x);
  for (let k = 0; k < 16; k++) { const a = away + (Math.random() - .5) * Math.PI, r = 300 + Math.random() * 220, x = w.x + Math.cos(a) * r, y = w.y + Math.sin(a) * r * .7; if (x > 120 && x < M.W - 120 && y > 260 && y < M.H - 100 && M.canWalk(x, y)) return { x, y }; }
  return null;
}
// Vira redemoinho e some: do Sadi, pra outro canto (e as fugas contam); do cusco, só um pulo adiante.
function saciFlee(w, M, why = 'sadi') {
  if (why === 'sadi' && ++w.escapes > SACI_RULES.escapes) { saciGone(w, 'O redemoinho sumiu no mato. Hoje o Saci não volta mais.'); return; }
  const to = (why === 'cusco' && saciHop(M, w, cusco)) || saciCorner(M, Math.random, worldOut) || w.home;
  Object.assign(w, { state: 'flee', mode: 'whirl', tx: to.x, ty: to.y, home: to, why });
  effect(pick(['Hihihi!', 'Hehehe, quase!', 'Chega de mansinho, vivente!']), w.x, w.y - 150, '#ffe28a', 14); AudioEngine.swoosh?.(.06);
}
function saciGone(w, text) { w.state = 'gone'; saciChase.on = false; if (text) worldSay(text); }

saciTick = function (dt) {
  const M = worldMap();
  if (saciEncounterGame !== G) { saciEncounterGame = G; saciEncounterKey = ''; saciEncounter = null; }
  if (!worldOut || !SACI_SALT[M.id] || !worldNight() || prologueActive()) { saciEncounter = null; saciEncounterKey = ''; return; }
  const key = G.day + ':' + M.id;
  if (key !== saciEncounterKey) {
    saciEncounterKey = key; saciEncounter = null; if (saciResting()) return;
    const R = caveRand(G.day * 1109 + SACI_SALT[M.id]); if (R() >= .35) return;
    const home = saciCorner(M, R); if (!home) return;
    saciEncounter = { x: home.x, y: home.y, home, tx: home.x, ty: home.y, map: M.id, age: 0, mode: 'hop', state: 'wander', t: 2 + R() * 3, dx: 1, walk: false, escapes: 0 };
  }
  const w = saciEncounter; if (!w) return;
  w.walk = false; if (w.state === 'gone' || w.state === 'caught' || paused || modal || scene || worldTalkOpen()) return;
  w.age += dt; w.t -= dt;
  const p = worldOut, d = Math.hypot(p.x - w.x, p.y - w.y), notice = playerMounted() ? SACI_RULES.noticeMounted : SACI_RULES.notice;
  if (d < 340 && !hasCard('saci')) giveCard('saci', 'encontro noturno');
  if (w.state === 'wander') {
    w.mode = 'hop';
    if (d < notice) { saciFlee(w, M); return; }
    if (saciChase.on && Math.hypot(cusco.x - w.x, cusco.y - w.y) < 260) { saciFlee(w, M, 'cusco'); return; }
    if (saciMove(w, { x: w.tx, y: w.ty }, 70, dt)) { const to = saciWanderTo(M, w); w.tx = to.x; w.ty = to.y; }
    if (w.t <= 0) { w.state = 'pipe'; w.t = 2.6 + Math.random() * 1.2; }
  } else if (w.state === 'pipe') {
    // Pitando o cachimbo: distraído, só ouve quem vem a cavalo.
    w.mode = 'hop'; if (playerMounted() && d < SACI_RULES.noticeMounted) { saciFlee(w, M); return; }
    if (w.t <= 0) { w.state = 'wander'; w.t = 5 + Math.random() * 4; }
  } else if (w.state === 'flee') {
    // Fugindo do cusco ele cansa (o cachorro é mais ligeiro); do Sadi, some num instante.
    w.mode = 'whirl'; if (saciMove(w, { x: w.tx, y: w.ty }, w.why === 'cusco' ? 270 : SACI_RULES.flee, dt)) { w.state = 'wander'; w.t = 2.5 + Math.random() * 2; w.tx = w.x; w.ty = w.y; }
  } else if (w.state === 'held') {
    w.mode = 'whirl'; w.walk = true;
    if (w.t <= 0) { saciChase.cool = 4; saciChase.on = false; floatNote('O Saci escapou do cusco!'); saciFlee(w, M, 'cusco'); }
  }
};
// E no Saci: encurralado pelo cusco ou pitando de mansinho, pega; senão, ele foge.
function saciTryCatch() {
  const w = saciEncounter; if (!w || w.map !== worldOut?.map || ['gone', 'caught'].includes(w.state)) return;
  const d = Math.hypot(worldOut.x - w.x, worldOut.y - w.y);
  if (w.state === 'held' && d < SACI_RULES.catchHeld || w.state === 'pipe' && d < SACI_RULES.catchPipe) { saciCaught(w); return; }
  saciFlee(w, worldMap());
}
saciTalk = saciTryCatch;
function saciCaught(w) {
  w.state = 'caught'; saciChase.on = false; keys.clear(); AudioEngine.heart(); giveCard('saci', 'encontro noturno');
  saciState().caught = (saciState().caught || 0) + 1; w.opts = saciWishOptions(); save();
  talk([['saci', 'Ai, ai, ai! Me pegou pela carapuça, vivente!'], ['saci', 'Tá bom, tá bom… quem segura a carapuça do Saci ganha um desejo. Um só, hein! Escolhe ligeiro, que o vento já vai virar.']], saciWishDialog, 'Fazer o desejo');
}

// ---------- O desejo: sempre três opções ----------
const SACI_ORES = { ouro: 2, opala: 3, agata: 4, ametista: 5, ferro: 8, cobre: 10 };
function saciWishOptions() {
  const opts = [], bag = caveBag(), max = caveBagMax();
  // 1. Item do bornal da caverna
  const roomy = CAVE_ITEMS.filter(i => max - (bag[i.id] || 0) >= 2);
  if (roomy.length) { const it = pick(roomy), n = Math.min(3, max - (bag[it.id] || 0)); opts.push({ kind: 'caveItem', id: it.id, n, icon: caveItemIcon(it), title: n + ' × ' + it.name, text: it.desc + ' Vai direto pro bornal da caverna.' }); }
  // 2. Uma melhoria de graça, de até R$ 120 + R$ 40 por nível (da bodega; sem nenhuma pra pegar, uma do equipamento da caverna)
  const ups = UPGRADES.filter(u => !upgradeOwned(u.id) && !u.shop && u.cost > 0 && u.cost <= 120 + 40 * bodegaLevel() && bodegaLevel() >= (u.level || 1) && G.rep >= (u.rep || 0) && (!u.requires || upgradeOwned(u.requires)));
  const caveUps = CAVE_UPGRADES.filter(u => !caveUp(u.id) && (!u.requires || caveUp(u.requires)));
  if (ups.length) { const u = pick(ups); opts.push({ kind: 'upgrade', id: u.id, icon: upgradeIconHTML(u.id) || '<span class="bag-emoji">🔧</span>', title: 'Melhoria de graça: ' + u.name, text: u.desc + ' (vale ' + money(u.cost) + ')' }); }
  else if (caveUps.length) { const u = pick(caveUps); opts.push({ kind: 'caveUp', id: u.id, icon: `<span class="bag-emoji">${u.icon}</span>`, title: 'De graça na ferraria: ' + u.name, text: u.desc }); }
  // 3. Uma sorte
  const ore = pick(Object.keys(SACI_ORES)), cash = 100 + 40 * (bodegaLevel() - 1);
  const luck = [{ kind: 'ore', id: ore, n: SACI_ORES[ore], icon: bagIcon(ore), title: SACI_ORES[ore] + ' × ' + bagName(ore).toLowerCase(), text: 'Minério da caverna, pra forja do São Dunstano ou pra vender.' },
    { kind: 'cash', n: cash, icon: '<span class="bag-emoji">💰</span>', title: money(cash) + ' no caixa', text: 'Moedas que o redemoinho juntou pelas estradas.' },
    { kind: 'boi', icon: '<span class="bag-emoji">🐂</span>', title: 'Um boi na cerca', text: 'Pro próximo costelão: laçado, rende mantas e hambúrguer.' },
    { kind: 'adubo', n: 5, icon: '<span class="bag-emoji">🌱</span>', title: '5 sacos de adubo', text: 'A horta cresce mais ligeiro.' }];
  for (const o of luck.sort(() => Math.random() - .5)) { if (opts.length >= 3) break; opts.push(o); }
  return opts.slice(0, 3);
}
function saciWishDialog() {
  const w = saciEncounter, opts = w?.opts; if (!opts) return;
  const i = PEOPLE.findIndex(p => p.id === 'saci');
  openDialog('Um desejo do Saci', `<div class="rpg-speaker">${portraitHTML(i, 72)}<div><p><b>Saci</b></p><p>Escolhe um, que o vento não espera!</p></div></div><div class="store-list">${opts.map((o, n) => `<div class="supply"><span class="icon">${o.icon}</span><div><b>${o.title}</b><p>${o.text}</p></div><button class="primary" data-act="saciWish" data-id="${n}">Esse!</button></div>`).join('')}</div>`, 'saciWish');
}
function saciWish(n) {
  const w = saciEncounter, o = w?.opts?.[Number(n)]; if (!o) return;
  closeDialog(true);
  if (o.kind === 'caveItem') caveBag()[o.id] = Math.min(caveBagMax(), (caveBag()[o.id] || 0) + o.n);
  else if (o.kind === 'upgrade') { const u = UPGRADES.find(x => x.id === o.id), inv = G.stats.investments; G.cash = round(G.cash + u.cost); buyUpgrade(o.id); if (!G.up[o.id]) G.cash = round(G.cash - u.cost); else G.stats.investments = inv; }
  else if (o.kind === 'caveUp') caveState().up[o.id] = true;
  else if (o.kind === 'ore') bagAdd(o.id, o.n);
  else if (o.kind === 'cash') G.cash = round(G.cash + o.n);
  else if (o.kind === 'boi') G.herd = (G.herd || 0) + 1;
  else if (o.kind === 'adubo') hortaState().seeds.adubo = (hortaState().seeds.adubo || 0) + o.n;
  saciState().lastWish = G.day; w.opts = null; saciGone(w);
  AudioEngine.coins(); effect('Hihihi!', w.x, w.y - 150, '#ffe28a', 14);
  showBanner('Desejo do Saci: ' + o.title, 'E o redemoinho sumiu no mato. Daqui uns dias ele volta a rondar os cantos.', 'gift', { world: true });
  save(); refreshHUD();
}

// ---------- O cusco atrás do Saci ----------
function saciCuscoTick(dt) {
  saciChase.cool = Math.max(0, saciChase.cool - dt);
  const w = saciEncounter;
  if (!w || ['gone', 'caught'].includes(w.state) || w.map !== worldOut?.map || !cuscoOut() || cusco.map !== worldOut.map || saciChase.cool > 0 || paused || modal || worldTalkOpen()) { saciChase.on = false; return false; }
  const d = Math.hypot(w.x - cusco.x, w.y - cusco.y);
  if (!saciChase.on) { if (d > CUSCO_BARK_RANGE) return false; Object.assign(saciChase, { on: true, watch: 0, lastD: d }); floatNote(pick(['O cusco véio sentiu cheiro de fumo de rolo e disparou latindo!', 'A jaguara saiu em disparada atrás do redemoinho!'])); }
  saciChase.bark -= dt; if (saciChase.bark <= 0) { saciChase.bark = .6 + Math.random() * .5; cuscoBarkSound(); effect(pick(['Au! Au!', 'Auuu!', 'Au au au!']), cusco.x, cusco.y - 70, '#ffd2a0'); }
  cusco.alert = w;
  if (w.state === 'held') { cusco.walk = false; cusco.dx = w.x < cusco.x ? -1 : 1; return true; }
  const to = { x: w.x - (w.x < cusco.x ? -40 : 40), y: w.y + 8 }, dd = Math.hypot(to.x - cusco.x, to.y - cusco.y), k = Math.min(dd, BASE_SPEED * 1.35 * dt);
  const nx = cusco.x + (to.x - cusco.x) / (dd || 1) * k, ny = cusco.y + (to.y - cusco.y) / (dd || 1) * k;
  if (worldCanWalk(nx, cusco.y)) cusco.x = nx; if (worldCanWalk(cusco.x, ny)) cusco.y = ny;
  // Não está chegando mais perto (cerca, rio, casa no meio): acha a volta e aparece do outro lado, perto do Saci.
  saciChase.watch += dt;
  if (saciChase.watch >= .6) {
    const gained = (saciChase.lastD ?? d) - d; saciChase.watch = 0; saciChase.lastD = d;
    if (gained < 30 && d > 60) {
      const base = Math.atan2(cusco.y - w.y, cusco.x - w.x);
      search: for (const r of [60, 100, 160, 220]) for (let k = 0; k < 12; k++) { const a = base + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * Math.PI / 6, x = w.x + Math.cos(a) * r, y = w.y + Math.sin(a) * r * .7; if (worldCanWalk(x, y)) { cusco.x = x; cusco.y = y; saciChase.lastD = r; break search; } }
    }
  }
  cusco.walk = true; cusco.dx = to.x < cusco.x ? -1 : 1;
  if (d < 52) {
    Object.assign(w, { state: 'held', t: SACI_RULES.held, mode: 'whirl' }); AudioEngine.swoosh?.(.05);
    effect('Me larga, cusco!', w.x, w.y - 150, '#ffe28a', 14); floatNote('O cusco encurralou o Saci! Corre lá e aperta E nele.');
  }
  return true;
}

// ---------- Ligações ----------
{
  const tick = cuscoTick; cuscoTick = function (dt) { if (cuscoOut() && saciCuscoTick(dt)) return; tick(dt); };
  // O E no Saci troca de texto conforme dá ou não pra pegar.
  const spots = walkerSpots; walkerSpots = function () {
    const list = spots().filter(s => s.id !== 'walker:saci'), w = saciEncounter;
    if (w && w.map === worldOut?.map && worldNight() && !['gone', 'caught'].includes(w.state)) {
      const label = w.state === 'held' ? 'Pegar o Saci pela carapuça!' : w.state === 'pipe' ? 'Pegar o Saci de mansinho (ele tá pitando)' : 'Saci · chegue de mansinho';
      list.push({ id: 'walker:saci', x: w.x, y: w.y, radius: 130, label, act: saciTryCatch });
    }
    return list;
  };
  // Fumaça do cachimbo e as estrelinhas de quando o cusco segura ele.
  const land = worldLandscape; worldLandscape = function (M, seen, layers, view) {
    const w = saciEncounter;
    if (w && ['gone', 'caught'].includes(w.state)) { const keep = saciEncounter; saciEncounter = null; try { land(M, seen, layers, view); } finally { saciEncounter = keep; } return; }
    land(M, seen, layers, view);
    if (!w || w.map !== M.id || !worldNight() || !seen(w.x, w.y)) return;
    layers.push({ y: w.y + 1, draw: () => {
      if (w.state === 'pipe') for (let k = 0; k < 3; k++) { const t = (frameClock * .8 + k / 3) % 1, x = w.x + (w.dx < 0 ? -22 : 22) + Math.sin(t * 6 + k) * 6, y = w.y - 92 - t * 40; ctx.globalAlpha = .55 * (1 - t); ellipse(x, y, 5 + t * 7, 4 + t * 5, '#d8d4cc'); ctx.globalAlpha = 1; }
      if (w.state === 'held') for (let k = 0; k < 3; k++) { const a = frameClock * 6 + k * 2.1; txt('✦', w.x + Math.cos(a) * 30, w.y - 125 + Math.sin(a) * 8, 14, '#ffd75e'); }
    } });
  };
  const act = action; action = function (name, id) { if (name === 'saciWish') { saciWish(id); return; } return act(name, id); };
}
