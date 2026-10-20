// A Mãe do Ouro: em algumas noites, uma bola de fogo corre pelos campos da Serra. Dizem que ela mostra onde tem riqueza
// enterrada. Chegou perto, ela foge na frente, sem deixar alcançar; quem segue ela de perto por um tempo vê ela sumir no
// chão. Ali fica um brilho: cavando (E), sai dinheiro, uma figurinha nova pro álbum ou minério da caverna (ouro, opala…).
// Uma por noite, e nem toda noite ela aparece. De dia, nada.
'use strict';

const MAE_OURO = { chance: .4, roam: 110, run: 210, flee: 320, notice: 460, near: 480, lose: 900, follow: 6, lostFor: 5, salt: 71 };
const MAE_OURO_ORES = [['ouro', 3, 4], ['opala', 2, 2], ['agata', 3, 1], ['ametista', 4, 1]];
let maeOuro = null, maeOuroKey = '', maeOuroGame = null;
function maeOuroState() { return (G.maeOuro ??= {}); }
function maeOuroToday() { return maeOuroState().day === G.day; }
// Pra testes e eventos: uma noite em que ela aparece com certeza.
function maeOuroForced() { return false; }
function maeOuroHere() { return worldOut?.map === 'serra' && worldNight() && !prologueActive(); }
function maeOuroSpot(M, R, avoid = null, min = 600) {
  for (let t = 0; t < 80; t++) { const x = 220 + R() * (M.W - 440), y = 340 + R() * (M.H - 560); if (avoid && Math.hypot(x - avoid.x, y - avoid.y) < min) continue; if (M.canWalk(x, y)) return { x, y }; }
  return null;
}
// Próximo ponto do caminho. À toa, pra qualquer lado; fugindo, pra longe do Sadi e sem cruzar o caminho dele (null se
// estiver encurralada na beira do mapa).
function maeOuroSegDist(p, a, b) { const dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy || 1, t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / L, 0, 1); return Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t); }
function maeOuroNext(M, b) {
  const p = worldOut, lure = b.state === 'lure', d0 = Math.hypot(b.x - p.x, b.y - p.y), away = Math.atan2(b.y - p.y, b.x - p.x);
  for (let k = 0; k < 48; k++) {
    const a = lure ? away + (Math.random() - .5) * (k < 24 ? 1.6 : 3.2) : Math.random() * Math.PI * 2, r = 240 + Math.random() * 260;
    const to = { x: b.x + Math.cos(a) * r, y: b.y + Math.sin(a) * r * .75 };
    if (to.x < 180 || to.x > M.W - 180 || to.y < 320 || to.y > M.H - 180 || !M.canWalk(to.x, to.y)) continue;
    if (lure && (Math.hypot(to.x - p.x, to.y - p.y) < d0 + 80 || maeOuroSegDist(p, b, to) < 170)) continue;
    return to;
  }
  return lure ? null : maeOuroSpot(M, Math.random) || { x: b.x, y: b.y };
}
// Encurralada: se já foi seguida um tempo, some ali mesmo; senão, escapa pra um canto longe do Sadi.
function maeOuroRoute(M, b) {
  const n = maeOuroNext(M, b); if (n) { b.tx = n.x; b.ty = n.y; return; }
  if (b.follow >= MAE_OURO.follow / 2) { b.follow = MAE_OURO.follow; return; }
  const far = maeOuroSpot(M, Math.random, worldOut, 900) || { x: b.x, y: b.y }; b.tx = far.x; b.ty = far.y;
}
function maeOuroTick(dt) {
  if (maeOuroGame !== G) { maeOuroGame = G; maeOuro = null; maeOuroKey = ''; }
  if (!worldOut || !maeOuroHere()) return;
  const M = worldMap(), key = String(G.day);
  if (key !== maeOuroKey) {
    maeOuroKey = key; maeOuro = null; if (maeOuroToday()) return;
    const R = caveRand(G.day * 1663 + MAE_OURO.salt); if (R() >= MAE_OURO.chance && !maeOuroForced()) return;
    const at = maeOuroSpot(M, R, worldOut); if (!at) return;
    maeOuro = { x: at.x, y: at.y, tx: at.x, ty: at.y, state: 'roam', t: 0, follow: 0, lost: 0, crackle: 0, trail: [] };
  }
  const b = maeOuro; if (!b || paused || modal || scene || worldTalkOpen()) return;
  b.t += dt;
  if (b.state === 'glow') return;
  const p = worldOut, d = Math.hypot(p.x - b.x, p.y - b.y);
  // Rastro de faíscas e o chiado do fogo, baixinho, quando o Sadi está por perto.
  b.trail.push({ x: b.x, y: b.y, life: .6 }); for (const s of b.trail) s.life -= dt; b.trail = b.trail.filter(s => s.life > 0).slice(-24);
  b.crackle -= dt; if (d < 700 && b.crackle <= 0) { b.crackle = .45 + Math.random() * .4; AudioEngine.hiss(.18, .012 + .02 * (1 - d / 700), 2600); }
  if (b.state === 'sink') {
    if (b.t >= 1.4) { Object.assign(b, { state: 'glow', t: 0, x: b.gx, y: b.gy, trail: [] }); AudioEngine.caveGem?.(); floatNote('A bola de fogo sumiu no chão… e ficou um brilho ali. Chega perto e aperta E pra cavar.'); }
    return;
  }
  const goTo = (speed) => { const dd = Math.hypot(b.tx - b.x, b.ty - b.y); if (dd < 8) return true; const k = Math.min(dd, speed * dt); b.x += (b.tx - b.x) / dd * k; b.y += (b.ty - b.y) / dd * k; return false; };
  if (b.state === 'roam') {
    if (d < MAE_OURO.notice) {
      b.state = 'lure'; b.lost = 0; maeOuroRoute(M, b); AudioEngine.ignite?.();
      if (!maeOuroState().seen) { maeOuroState().seen = G.day; save(); }
      floatNote(maeOuroState().found ? 'A Mãe do Ouro de novo! Segue ela de perto, sem perder de vista.' : 'Uma bola de fogo correndo no campo… É a Mãe do Ouro! Dizem que quem segue ela acha riqueza.');
      return;
    }
    if (goTo(MAE_OURO.roam)) { const n = maeOuroNext(M, b); b.tx = n.x; b.ty = n.y; }
    return;
  }
  // Fugindo na frente: nunca deixa alcançar, mas também não some de vista se o Sadi vier atrás.
  const speed = d < 170 ? MAE_OURO.flee : d > MAE_OURO.near ? MAE_OURO.roam : MAE_OURO.run;
  // Chegou no ponto, ou o ponto ficou perto do Sadi (ele cortou caminho): escolhe outro, sempre pra longe dele.
  b.rr = (b.rr || 0) - dt;
  if (goTo(speed) || b.rr <= 0 && (Math.hypot(b.tx - p.x, b.ty - p.y) < 220 || d < 200 && maeOuroSegDist(p, b, { x: b.tx, y: b.ty }) < 120)) { b.rr = .4; maeOuroRoute(M, b); }
  if (d < MAE_OURO.near) { b.follow += dt; b.lost = 0; }
  else if (d > MAE_OURO.lose) { b.lost += dt; if (b.lost >= MAE_OURO.lostFor) { b.state = 'roam'; b.follow = Math.max(0, b.follow - 3); b.lost = 0; floatNote('A Mãe do Ouro sumiu de vista. Ela segue rondando os campos da Serra.'); } }
  // Seguiu de perto o bastante: ela gira, afunda na terra e deixa o brilho onde dá pra pisar.
  if (b.follow >= MAE_OURO.follow) {
    const g = M.canWalk(b.x, b.y) ? { x: b.x, y: b.y } : M.canWalk(b.tx, b.ty) ? { x: b.tx, y: b.ty } : maeOuroSpot(M, Math.random, null) || { x: p.x, y: p.y };
    Object.assign(b, { state: 'sink', t: 0, gx: g.x, gy: g.y }); AudioEngine.fireOut?.(); fxStars(b.x, b.y - 40, 6);
  }
}

// ---------- O que tem debaixo do brilho ----------
function maeOuroPrize() {
  const roll = Math.random(), card = randomLooseCard();
  if (roll < .25 && card) return { kind: 'card', id: card };
  if (roll < .6) {
    const total = MAE_OURO_ORES.reduce((n, o) => n + o[2], 0); let r = Math.random() * total;
    for (const [k, q, w] of MAE_OURO_ORES) { r -= w; if (r <= 0) return { kind: 'ore', id: k, n: q }; }
    return { kind: 'ore', id: 'ouro', n: 3 };
  }
  return { kind: 'cash', n: round(40 + 15 * bodegaLevel() + Math.floor(Math.random() * 31)) };
}
function maeOuroDig() {
  const b = maeOuro; if (!b || b.state !== 'glow' || !maeOuroHere()) return;
  const st = maeOuroState(), o = maeOuroPrize(); st.day = G.day; st.found = (st.found || 0) + 1; maeOuro = null;
  keys.clear(); AudioEngine.thud?.(); fxPuffs(b.x, b.y - 10, 8, 90, '#8a6a40'); setTimeout(() => AudioEngine.caveGem?.(), 220);
  const head = '<b>✨ Onde a Mãe do Ouro sumiu</b><br>O Sadi cavou com as mãos onde o chão brilhava e achou ';
  if (o.kind === 'card') { giveCard(o.id, 'Mãe do Ouro'); save(); talk([['card', head + 'uma figurinha enterrada, embrulhada num pano: <b>' + cardDef(o.id).name + '</b>!', 'Mãe do Ouro']], () => albumCard(o.id, true), 'Ver a figurinha'); return; }
  if (o.kind === 'ore') { bagAdd(o.id, o.n); effect('+' + o.n + ' ' + bagName(o.id).toLowerCase(), b.x, b.y - 60, '#ffe27a', 18); save(); talk([['card', head + '<b>' + o.n + ' × ' + bagName(o.id).toLowerCase() + '</b>, brilhando no meio da terra. Minério da caverna, pra forja do São Dunstano ou pra vender.', 'Mãe do Ouro']], null, 'Guardar'); return; }
  G.cash = round(G.cash + o.n); AudioEngine.coins(); effect('+' + money(o.n), b.x, b.y - 60, '#ffe27a', 18); save(); refreshHUD();
  talk([['card', head + 'uma guaiaca velha com moedas antigas: <b>' + money(o.n) + '</b>.', 'Mãe do Ouro']], null, 'Guardar');
}

// ---------- Desenho ----------
function drawMaeOuroBall(b) {
  const bob = Math.sin(b.t * 6) * 6, sink = b.state === 'sink' ? clamp(b.t / 1.4, 0, 1) : 0, y = b.y - 48 + bob + sink * 44, r = 16 * (1 - sink * .7);
  for (const s of b.trail) { const k = s.life / .6; ctx.globalAlpha = .5 * k; ellipse(s.x, s.y - 48 + bob * .5, 6 + 8 * k, 5 + 6 * k, k > .6 ? '#ffb030' : '#ff6a20'); }
  ctx.globalAlpha = 1; ellipse(b.x, b.y + 2, 26 * (1 - sink * .5), 8, 'rgba(255,170,60,.35)');
  ellipse(b.x, y, r + 6, r + 4, '#ff7a20'); ellipse(b.x, y, r, r, '#ffc040'); ellipse(b.x - 3, y - 4, r * .45, r * .45, '#fff6c8');
}
function drawMaeOuroGlowSpot(b) {
  const tw = 1 + .3 * Math.sin(frameClock * 6);
  ellipse(b.x, b.y, 30, 11, 'rgba(255,215,90,.45)'); ellipse(b.x, b.y, 12, 5, '#fff2a0');
  rect(b.x - 2, b.y - 28 * tw, 4, 36 * tw, '#fff6c0', 1); rect(b.x - 15 * tw, b.y - 11, 30 * tw, 4, '#fff6c0', 1);
  for (let k = 0; k < 5; k++) { const a = frameClock * 2 + k * Math.PI * 2 / 5; rect(b.x + Math.cos(a) * 26 - 2, b.y - 12 + Math.sin(a) * 11 - 2, 4, 4, '#ffd34a', 1); }
}
// Por cima do escuro da noite: o clarão da bola de fogo (de longe dá pra ver ela correndo) e o brilho no chão.
function drawMaeOuroLight() {
  const b = maeOuro; if (!b || !maeOuroHere() || scene) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (b.state === 'glow') glow(b.x, b.y - 10, 120, .3 + .1 * Math.sin(frameClock * 4), '255,210,90');
  else { const sink = b.state === 'sink' ? clamp(b.t / 1.4, 0, 1) : 0; glow(b.x, b.y - 48, 220 * (1 - sink * .6), .45, '255,140,40'); glow(b.x, b.y - 48, 60, .7, '255,230,150'); }
  ctx.restore();
}

// ---------- Ligações ----------
{
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); maeOuroTick(dt); };
  const land = worldLandscape; worldLandscape = function (M, seen, layers, view) {
    land(M, seen, layers, view); const b = maeOuro;
    if (!b || M.id !== 'serra' || !maeOuroHere() || !seen(b.x, b.y, 400)) return;
    layers.push({ y: b.y + 1, draw: () => b.state === 'glow' ? drawMaeOuroGlowSpot(b) : drawMaeOuroBall(b) });
  };
  // O desenho de faíscas vem depois da noite: o clarão entra junto, pra brilhar no escuro.
  const sparksDraw = drawSparks; drawSparks = function (map = null) { sparksDraw(map); if (map && map === worldOut?.map) drawMaeOuroLight(); };
  const spots = walkerSpots; walkerSpots = function () {
    const list = spots(), b = maeOuro;
    if (b?.state === 'glow' && maeOuroHere()) list.push({ id: 'maeouro', x: b.x, y: b.y, radius: 110, label: 'Cavar onde a Mãe do Ouro sumiu', act: maeOuroDig });
    return list;
  };
  // O povo da Serra conta o causo.
  WORLD_TALK.badin?.push({ player: 'Que luz era aquela no campo, ontem de noite?', reply: 'Era a Mãe do Ouro, Sadi! Uma bola de fogo que corre pela Serra. A nona diz: quem segue ela até onde some, acha riqueza enterrada.' });
  WORLD_HOME_TALK.badin?.push({ player: 'A nona acredita na Mãe do Ouro?', reply: 'Acredita e jura que o nono achou uma guaiaca de moedas seguindo ela. Mas só aparece de noite, e não é toda noite.' });
}
