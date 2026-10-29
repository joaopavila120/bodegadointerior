// Poderes pra peleia na mata e na gruta (V usa, G troca; no celular, os botões). Cada um tem a sua volta pra usar de
// novo, e cada um se ganha de um jeito:
//   · Grito farroupilha: vencer o navio do Império em Laguna. O Garibaldi dá o lenço vermelho e, quando o Sadi grita
//     "Avante, farrapos!", o fantasma dele vem peleiar junto por 10 segundos.
//   · Lunar do Sepé: o Sepé pede a cruz missioneira, cravada num toco numa clareira uns trechos abaixo do fogo dele.
//     Levando a cruz de volta, ele ensina a acender o lunar: um clarão que deixa tontos todos os bichos em volta.
//   · Bando de gralhas-azuis: replantar três clareiras de tocos. A gralha viu tudo e traz o bando, que bica o bicho
//     mais perto; de vez em quando cai um pinhão, que cura.
//   · Benzedura: depois do primeiro tombo feio (desmaiar na mata ou na gruta), o Padre Romio (na capela da Serra ou na
//     estrada) vê o quebranto, benze o Sadi e ensina a reza: um escudo que aguenta um golpe.
'use strict';

const PODERES = {
  grito: { name: 'Grito farroupilha', icon: '🚩', cd: 45, desc: 'O fantasma do Garibaldi vem peleiar junto por 10 segundos.' },
  lunar: { name: 'Lunar do Sepé', icon: '✴️', cd: 20, desc: 'Um clarão que deixa tontos todos os bichos em volta.' },
  gralhas: { name: 'Bando de gralhas-azuis', icon: '🐦', cd: 30, desc: 'As gralhas bicam o bicho mais perto, e cai pinhão que cura.' },
  benzedura: { name: 'Benzedura', icon: '🌿', cd: 35, desc: 'Um escudo de reza que aguenta um golpe.' }
};
const PODER_DICAS = {
  grito: 'os farrapos não esquecem quem vence o navio do Império em Laguna',
  lunar: 'o Sepé Tiaraju anda procurando uma cruz que se perdeu na mata',
  gralhas: 'a gralha-azul paga quem replanta três clareiras de tocos',
  benzedura: 'o Padre Romio, da capela da Serra, benze quem leva tombo feio'
};
let poder = { cd: {}, ally: null, flash: null, gralhas: [], drops: [], escudo: false };
function poderState() { G.poderes ??= { has: {} }; G.poderes.has ??= {}; return G.poderes; }
function poderHas(id) { return !!poderState().has[id]; }
function poderList() { return Object.keys(PODERES).filter(poderHas); }
function poderPick() { const list = poderList(), st = poderState(); return list.includes(st.pick) ? st.pick : list[0] || null; }
function poderSwap() {
  const list = poderList(); if (list.length < 2) return;
  poderState().pick = list[(list.indexOf(poderPick()) + 1) % list.length]; AudioEngine.tick?.();
  const P = PODERES[poderPick()]; effect(P.icon + ' ' + P.name, worldOut.x, worldOut.y - 170, '#ffe2a6', 15); updatePoderButton();
}
// O golpe de quem vem ajudar (o Garibaldi, as gralhas): o mesmo dano do facão, com as regras de cada chefão.
function poderHit(b, mult) {
  const cave = inCave(), dmg = Math.max(1, Math.round((cave ? caveHitDmg(b) : caveDmg()) * mult));
  b.hp -= dmg; b.hurt = .18; fxStars(b.x, b.y - 50, 2); effect('−' + dmg, b.x + (Math.random() - .5) * 20, b.y - 80, '#ffd2a0', 19); AudioEngine.caveFlesh?.();
  if (b.hp <= 0) { if (cave) caveKill(b); else mataKill(b); }
}

function poderUse() {
  if (!rangedCombat() || paused || modal || scene || phoneOpen || worldTalkOpen()) return;
  const id = poderPick();
  if (!id) { floatNote('Sem poder ainda. Dizem que ' + Object.values(PODER_DICAS).join('; ') + '.'); AudioEngine.bad(); return; }
  if ((poder.cd[id] || 0) > 0) { floatNote(PODERES[id].name + ': volta em ' + Math.ceil(poder.cd[id]) + ' s.'); AudioEngine.bad(); return; }
  poder.cd[id] = PODERES[id].cd; ({ grito: poderGrito, lunar: poderLunar, gralhas: poderGralhas, benzedura: poderBenzedura })[id](); updatePoderButton();
}
function poderGrito() {
  const p = worldOut, dx = p.dx < 0 ? -1 : 1;
  poder.ally = { x: p.x - dx * 80, y: p.y + 6, dx, t: 10, hit: .5, swing: 0 };
  effect('Avante, farrapos!', p.x, p.y - 170, '#ffd27a', 22); AudioEngine.caveGhost?.();
  [392, 523, 659, 784].forEach((f, i) => AudioEngine.note?.(f, i === 3 ? .5 : .16, 'triangle', .05, i * .14)); // a corneta
}
function poderLunar() {
  const p = worldOut; poder.flash = { x: p.x, y: p.y - 70, t: 0 };
  for (const b of rangedTargets()) {
    if (Math.hypot(b.x - p.x, b.y - p.y) > 460) continue;
    if (b.kind === 'diabo') { effect('O Diabo riu do clarão!', b.x, b.y - 220, '#ffb3a0', 16); continue; }
    const big = b.boss || b.lenda || !CAVE_BEASTS[b.kind]; b.lunar = big ? 1.6 : 3;
    if (!big && ['windup', 'lunge', 'charge'].includes(b.state)) { b.state = 'rest'; b.t = .6; }
  }
  [1047, 1319, 1568, 2093].forEach((f, i) => AudioEngine.note?.(f, .6, 'sine', .04, i * .04)); AudioEngine.swoosh?.(.08);
}
function poderGralhas() {
  const p = worldOut, side = Math.random() < .5 ? -1 : 1;
  poder.gralhas = Array.from({ length: 5 }, (_, i) => ({ x: p.x + side * (520 + i * 40), y: p.y - 260 - i * 30, dx: -side, t: 7 + i * .2, peck: .4 + i * .2, ph: i * 1.3 }));
  if (typeof gralhaCall === 'function') gralhaCall();
}
function poderBenzedura() {
  poder.escudo = true; const p = worldOut; effect('🌿 Benzido!', p.x, p.y - 170, '#c8f0b0', 20); fxStars(p.x, p.y - 90, 5);
  [523, 659, 784].forEach((f, i) => AudioEngine.note?.(f, .5, 'sine', .035, i * .12));
}
// Bicho tonto do lunar fica parado, sem atacar (chefe e lenda, menos tempo).
function poderFrozen(b, dt) { if (!(b.lunar > 0)) return false; b.lunar -= dt; b.hurt = Math.max(0, (b.hurt || 0) - dt); return true; }

function poderTick(dt) {
  for (const k of Object.keys(poder.cd)) poder.cd[k] = Math.max(0, poder.cd[k] - dt);
  if (!rangedCombat()) { poder.ally = null; poder.flash = null; poder.gralhas = []; poder.drops = []; return; }
  if (poder.flash && (poder.flash.t += dt) > .8) poder.flash = null;
  const targets = rangedTargets(), p = worldOut, near = (x, y, max = 1e9) => { let best = null, bd = max; for (const b of targets) { const d = Math.hypot(b.x - x, b.y - y); if (d < bd) { bd = d; best = b; } } return [best, bd]; };
  const a = poder.ally;
  if (a) {
    a.t -= dt; a.hit -= dt; a.swing = Math.max(0, a.swing - dt);
    const [b, d] = near(a.x, a.y, 900), go = (x, y, sp) => { const k = Math.hypot(x - a.x, y - a.y); if (k > 4) { a.x += (x - a.x) / k * Math.min(k, sp * dt); a.y += (y - a.y) / k * Math.min(k, sp * dt); } };
    if (b && a.t > .4) { a.dx = b.x < a.x ? -1 : 1; if (d > 80) go(b.x - a.dx * 60, b.y, 320); if (d < 130 && a.hit <= 0) { a.hit = .75; a.swing = .25; AudioEngine.swoosh?.(.06); poderHit(b, .9); } }
    else go(p.x - (p.dx < 0 ? -1 : 1) * 90, p.y + 6, 260);
    if (a.t <= 0) { poder.ally = null; fxPuffs(a.x, a.y - 60, 10, 90, '#c8dcf0'); }
  }
  const [prey] = near(p.x, p.y, 1100);
  for (const g of poder.gralhas) {
    g.t -= dt; g.peck -= dt; const b = g.t > 0 && prey;
    if (b) {
      const tx = b.x + Math.cos(frameClock * 3 + g.ph) * 50, ty = b.y - 90 + Math.sin(frameClock * 4 + g.ph) * 25, d = Math.hypot(tx - g.x, ty - g.y);
      g.dx = tx < g.x ? -1 : 1; if (d > 4) { g.x += (tx - g.x) / d * Math.min(d, 560 * dt); g.y += (ty - g.y) / d * Math.min(d, 560 * dt); }
      if (d < 60 && g.peck <= 0 && b.hp > 0) { g.peck = .55 + Math.random() * .35; AudioEngine.pop?.(2600, .05, .02); poderHit(b, .22); if (Math.random() < .2) poder.drops.push({ x: b.x + (Math.random() - .5) * 60, y: b.y + 12, fight: rangedFight() }); }
    } else { g.x += g.dx * 320 * dt; g.y -= 420 * dt; g.gone = g.y < p.y - 900; }
  }
  poder.gralhas = poder.gralhas.filter(g => !g.gone);
  const fight = rangedFight();
  for (const d of poder.drops) if (d.fight === fight && Math.hypot(d.x - p.x, d.y - p.y) < 46) { d.got = true; const st = caveState(); st.hp = Math.min(caveMaxHp(), st.hp + 15); effect('+15 ❤ pinhão', d.x, d.y - 50, '#d8ffac', 18); fxHearts(p.x, p.y - 120, 2); AudioEngine.caveHeal?.(); }
  poder.drops = poder.drops.filter(d => !d.got && d.fight === fight);
}
// A benzedura segura o golpe inteiro (só quando o golpe ia pegar mesmo).
function poderShield() {
  if (!poder.escudo) return false; poder.escudo = false; const p = worldOut;
  effect('🌿 A benzedura segurou!', p.x, p.y - 150, '#c8f0b0', 20); fxStars(p.x, p.y - 90, 6); AudioEngine.glass?.(); return true;
}

// ---------- Desbloqueios ----------
function poderGanha(id, lines, then = null) {
  const st = poderState(); st.has[id] = G.day; st.pick = id; save(); AudioEngine.caveGem?.(); const P = PODERES[id], many = poderList().length > 1;
  talk([...lines, ['card', `<b>${P.icon} Poder novo: ${P.name}</b><br>${P.desc}<br><br>Na mata e na gruta, <b>V</b> usa o poder${many ? ' e <b>G</b> troca de poder' : ''}. Depois de usar, ele leva ${P.cd} segundos pra voltar.`, 'Poder novo']], then, 'Bah!');
}
const PODER_FALAS = {
  grito: [['garibaldi', 'Gaúcho, tu peleou em Laguna que nem farrapo velho. Toma o meu lenço vermelho.'], ['garibaldi', 'Quando a coisa apertar, na mata ou na gruta, grita "Avante, farrapos!". De onde eu estiver, eu venho de sabre na mão.'], ['sadi', 'Avante, farrapos!']],
  gralhas: [['gralha', 'Crá-crá! Tu é o vivente que anda replantando os tocos? Três clareiras! Até eu, que planto pinhão desde que o mundo é mundo, fiquei com inveja.'], ['gralha', 'O bando todo viu. Daqui pra frente, na mata ou na gruta, assobia que a gente vem: bico pro bicho e pinhão pra ti.'], ['sadi', 'Bah, um bando de gralha de guarda-costas!']],
  lunar: [['sepe', 'A cruz dos Sete Povos… Aguyjevete, caminhante. É assim que a gente diz obrigado.'], ['sepe', 'Agora presta atenção: o lunar não é da testa, é do coração de quem não se entrega. Fecha os olhos e deixa ele acender.'], ['sepe', 'Quando os bichos te cercarem, acende o lunar: o clarão deixa todos tontos.']],
  benzedura: [['padre_romio', 'Sadi, meu filho! Que cara de quem viu assombração. Me contaram que tu caiu desmaiado no mato.'], ['sadi', 'Caí, padre. Bicho brabo, escuro… fiquei com o corpo mole até hoje.'], ['padre_romio', 'Isso é quebranto. Abaixa a cabeça: um raminho de arruda, água benta e a reza que a minha nona me ensinou lá na colônia.'], ['padre_romio', 'Pronto, benzido. E leva a reza contigo: quando a coisa ficar feia, reza baixinho, que ela te segura uma pancada.']]
};
function poderUnlockTick() {
  const st = poderState();
  if (!st.has.grito && typeof lagunaState === 'function' && lagunaState().won) { poderGanha('grito', PODER_FALAS.grito); return; }
  if (!st.has.gralhas && Object.keys(mataState().plant || {}).length >= 3) { poderGanha('gralhas', PODER_FALAS.gralhas); return; }
  // Depois do primeiro tombo, já de volta no mundo aberto, o boato da benzedura.
  if (st.caiu && !st.has.benzedura && !st.padreDica && ENV_MAIN_MAPS.has(worldOut?.map)) { st.padreDica = true; floatNote('Dizem que o Padre Romio, da capela da Serra, benze quem leva tombo feio…'); }
}
// A cruz missioneira: fica numa clareira do trecho que o Sepé disse (o lugar segue o desenho do trecho no dia).
function poderCruzSpot(T) {
  const c = poderState().cruz; if (!c || c.got || poderHas('lunar') || T.n !== c.n) return null;
  const cl = T.clearings.find(q => q.id?.startsWith('coleta')); if (cl) return { x: cl.x + 40, y: cl.y };
  const pts = T.trails[0].pts, q = pts[Math.floor(pts.length / 2)]; return { x: q[0], y: q[1] };
}
function poderCruzPega() {
  const c = poderState().cruz; if (!c || c.got) return; c.got = G.day; save(); AudioEngine.caveGem?.(); fxStars(worldOut.x, worldOut.y - 120, 6);
  talk([['sadi', 'Bah… uma cruz de dois braços cravada no toco, que nem o Sepé disse.'], ['card', '<b>✠ A cruz missioneira</b><br>Cerne de angico, gasta de chuva e de tempo, com os dois braços da cruz dos Sete Povos. Leva pro Sepé Tiaraju, no fogo do trecho 21.', 'Achou']], null, 'Guardar');
}
function drawCruzMissioneira(x, y) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 60, 90, .18 + .06 * Math.sin(frameClock * 2), '255,220,140'); ctx.restore();
  ellipse(x, y + 2, 30, 9, 'rgba(10,14,8,.35)'); rect(x - 22, y - 16, 44, 18, '#5a3a20', 5, '#3a2412');
  rect(x - 4, y - 108, 8, 96, '#8a6038', 2, '#3a2412'); rect(x - 22, y - 88, 44, 7, '#8a6038', 2, '#3a2412'); rect(x - 15, y - 100, 30, 6, '#8a6038', 2, '#3a2412');
  for (let k = 0; k < 3; k++) { const t = (frameClock * .5 + k / 3) % 1; ellipse(x + Math.sin(t * 7 + k) * 20, y - 40 - t * 80, 2, 2, `rgba(255,236,170,${1 - t})`); }
}

// ---------- Desenho ----------
function drawPoderWorld() {
  if (!rangedCombat()) return;
  const p = worldOut;
  for (const d of poder.drops) { const bob = Math.sin(frameClock * 4 + d.x) * 3; ellipse(d.x, d.y - 8 + bob, 6, 10, '#8a4a24'); ellipse(d.x, d.y - 13 + bob, 3, 3, '#c8784a'); }
  for (const b of rangedTargets()) if (b.lunar > 0) for (let k = 0; k < 3; k++) { const a = frameClock * 6 + k * 2.1; txt('✦', b.x + Math.cos(a) * 34, b.y - (b.boss || b.lenda ? 190 : 110) + Math.sin(a) * 8, 15, '#fff2b0', 'center'); }
  const a = poder.ally;
  if (a) {
    const alpha = clamp(Math.min((10 - a.t) / .5, a.t / .6), 0, 1); drawGaribaldi(a.x, a.y, alpha, a.dx);
    if (a.swing > 0) { const k = 1 - a.swing / .25; ctx.save(); ctx.strokeStyle = `rgba(220,236,255,${.8 * (1 - k)})`; ctx.lineWidth = 6; ctx.lineCap = 'round'; const ang = a.dx > 0 ? 0 : Math.PI; ctx.beginPath(); ctx.arc(a.x, a.y - 70, 78, ang - 1.2, ang - 1.2 + k * 2.4); ctx.stroke(); ctx.restore(); } // o sabre
  }
  for (const g of poder.gralhas) drawGralha(g.x, g.y, g.dx, true, 1.3);
  if (poder.escudo) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(p.x, p.y - 60, 80, .16 + .05 * Math.sin(frameClock * 3), '170,240,150');
    ctx.strokeStyle = `rgba(190,250,170,${.35 + .15 * Math.sin(frameClock * 3)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(p.x, p.y - 62, 48, 82, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    for (let k = 0; k < 3; k++) { const a2 = frameClock * 1.6 + k * 2.1; ctx.save(); ctx.translate(p.x + Math.cos(a2) * 50, p.y - 62 + Math.sin(a2) * 70); ctx.rotate(a2); ellipse(0, 0, 7, 3, '#7ab85a'); ctx.restore(); }
  }
  const f = poder.flash;
  if (f) {
    const k = f.t / .8; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(f.x, f.y, 140, .7 * (1 - k), '255,240,190');
    ctx.strokeStyle = `rgba(255,244,200,${.8 * (1 - k)})`; ctx.lineWidth = 10 * (1 - k) + 2; ctx.beginPath(); ctx.ellipse(f.x, f.y + 70, 40 + 420 * k, (40 + 420 * k) * .55, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
}

// ---------- Botões ----------
let poderLabel = '';
function updatePoderButton() {
  const box = $('poderBox'); if (!box) return;
  const id = poderPick(), show = !!id && rangedCombat() && !modal && !scene; box.classList.toggle('hidden', !show); box.classList.toggle('in-cave', inCave()); if (!show) return;
  const P = PODERES[id], cd = poder.cd[id] || 0, text = '<b>V</b> · ' + P.icon + ' ' + (cd > 0 ? Math.ceil(cd) + ' s' : P.name.split(' ')[0]);
  if (text !== poderLabel) { poderLabel = text; $('poderButton').innerHTML = text; $('poderButton').classList.toggle('cooling', cd > 0); }
  $('poderSwap').classList.toggle('hidden', poderList().length < 2);
}

// ---------- Ligações ----------
{
  const tick = outsideTick; outsideTick = function (dt) {
    tick(dt); if (paused || phoneOpen) return;
    if (!modal && !scene) poderTick(dt);
    if (!modal && !scene && !worldTalkOpen() && started) poderUnlockTick();
    updatePoderButton();
  };
  const sparks = drawSparks; drawSparks = function (map = null) { if (worldOut && map === worldOut.map && !scene) drawPoderWorld(); sparks(map); };
  const mataB = mataBeastTick; mataBeastTick = function (b, dt, p) { if (poderFrozen(b, dt)) return; return mataB(b, dt, p); };
  const caveB = caveBeastTick; caveBeastTick = function (b, dt, run, p) { if (poderFrozen(b, dt)) return; return caveB(b, dt, run, p); };
  // A benzedura segura o golpe que ia pegar (com o Sadi piscando de pancada ou de esquiva, o golpe nem pega).
  const mataH = mataHurt; mataHurt = function (dmg, from) { const N = mataNight; if (N && !N.inv && !N.faint && poderShield()) { N.inv = .9; return; } return mataH(dmg, from); };
  const caveH = caveHurt; caveHurt = function (dmg, from) { const run = caveFloorRun(); if (!caveDefeatActive() && run.floor !== 1 && !(run.inv > 0) && !run.dash && poderShield()) { run.inv = .9; return; } return caveH(dmg, from); };
  // Desmaio (na mata, na gruta ou na clareira das lendas): conta o tombo, pro Padre Romio.
  const mataF = mataFaint; mataFaint = function () { poderState().caiu = (poderState().caiu || 0) + 1; return mataF(); };
  const caveF = caveFaint; caveFaint = function () { poderState().caiu = (poderState().caiu || 0) + 1; return caveF(); };
  // Prosa com o Padre Romio (na capela ou na estrada da Serra) depois de um tombo: a benzedura.
  const prosa = worldTalk; worldTalk = function (w) { if (w?.person === PADRE_ROMIO && poderState().caiu && !poderHas('benzedura')) { poderGanha('benzedura', PODER_FALAS.benzedura); return; } return prosa(w); };
  // O Sepé e a cruz missioneira.
  const folkTalk = campFolkTalk; campFolkTalk = function (f) {
    if (f.id !== 'sepe' || poderHas('lunar')) return folkTalk(f);
    const st = poderState(); if (st.cruz?.got) { poderGanha('lunar', PODER_FALAS.lunar); return; }
    st.cruz ??= { n: 22 + G.day % 5, day: G.day }; save();
    talk([['sepe', 'Caminhante, quando os Sete Povos caíram, um piá correu pro mato com a cruz da nossa igreja: a cruz missioneira, a de dois braços.'], ['sepe', 'Ele cravou ela num toco, numa clareira ' + (st.cruz.n - 21) + (st.cruz.n - 21 > 1 ? ' trechos' : ' trecho') + (worldOut?.map === 'mata' ? ' depois do acampamento do trecho 21.' : ' abaixo deste fogo.') + ' Nunca mais ninguém achou.'], ['sepe', 'Traz a cruz pra mim, e eu te ensino a acender o lunar de verdade: um clarão que espanta qualquer bicho.']], null, 'Vou procurar');
  };
  const spots = trechoSpots; trechoSpots = function () { const list = spots(), at = poderCruzSpot(trechoLayout()); if (at) list.push({ id: 'cruz', x: at.x, y: at.y + 10, radius: 100, label: 'Uma cruz de dois braços cravada num toco', act: poderCruzPega }); return list; };
  const draw = drawTrecho; drawTrecho = function (view, seen, layers) { draw(view, seen, layers); const at = poderCruzSpot(trechoLayout()); if (at && seen(at.x, at.y, 200)) layers.push({ y: at.y, draw: () => drawCruzMissioneira(at.x, at.y) }); };
  // As clareiras replantadas: a conta pra gralha.
  const plant = trechoPlant; trechoPlant = function (T) {
    const n = Object.keys(mataState().plant || {}).length; plant(T); const now = Object.keys(mataState().plant || {}).length;
    if (now > n && now < 3 && !poderHas('gralhas')) floatNote('🌱 Clareiras replantadas: ' + now + '/3. A gralha-azul tá de olho.');
  };
  GARIBALDI_SHOP_LINES.push('Dizem que a gralha-azul paga quem replanta as clareiras de tocos.', 'O Sepé, lá no fogo do trecho 21, anda procurando uma coisa que se perdeu na mata.');
  document.addEventListener('keydown', e => {
    if (!worldOut || !rangedCombat() || e.repeat || modal || scene || worldTalkOpen() || ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    const k = e.key.toLowerCase(); if (k !== 'v' && k !== 'g') return; e.preventDefault(); e.stopImmediatePropagation(); if (k === 'v') poderUse(); else poderSwap();
  }, true);
  document.addEventListener('DOMContentLoaded', () => { $('hudLayer')?.insertAdjacentHTML('beforeend', '<div id="poderBox" class="ranged-box poder-box hidden"><button id="poderSwap" class="sling-button ranged-swap hidden" type="button" data-act="poderSwap" aria-label="Trocar poder">⇄</button><button id="poderButton" class="sling-button" type="button" data-act="poderUse"></button></div>'); });
  // Os botões da peleia (facão, esquiva, laço, arma de longe e poder) ficam numa pilha só, no canto de baixo: um em cima
  // do outro com folga, seja qual for a altura de cada um (antes cada um tinha uma altura fixa e eles se encavalavam).
  document.addEventListener('DOMContentLoaded', () => {
    const hud = $('hudLayer'); if (!hud) return; const stack = document.createElement('div'); stack.id = 'combatStack'; stack.className = 'combat-stack'; hud.appendChild(stack);
    for (const id of ['mataAttackButton', 'caveAttackButton', 'caveDashButton', 'caveLassoButton', 'rangedBox', 'poderBox']) { const el = $(id); if (el) stack.appendChild(el); }
  });
  const act = action; action = function (name, id) { if (name === 'poderUse') { poderUse(); return; } if (name === 'poderSwap') { poderSwap(); return; } return act(name, id); };
  // Fala da gralha fora das cenas: com o retrato dela.
  const box = showRpgBox; showRpgBox = function (prefix, line) { if (line && line.name === 'gralha' && !line.portrait) line = { ...line, portrait: gralhaPortrait(), name: 'Gralha-azul' }; return box(prefix, line); };
}
