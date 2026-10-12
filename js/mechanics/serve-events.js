// Servir no baile: nos eventos de salão (fandango no CTG, Oktoberfest e baile de capela) o Sadi cuida do balcão por um
// tempo enquanto o povo dança: tira no balcão a bebida (ou corta a polenta) como na bodega, segurando E e soltando na
// faixa verde, e leva a quem pediu. Os itens são do salão, não
// saem do estoque da bodega. No fim, quanto mais gente servida, maior a recompensa.
// Também aqui: a missa do baile de capela (cena) e os dançarinos dos salões.
'use strict';

const SERVE_ITEMS = {
  trago: { name: 'Trago', icon: '🥃', bar: 'Servir trago', title: 'Dose no ponto' },
  chope: { name: 'Chope', icon: '🍺', bar: 'Tirar chope na chopeira', title: 'Chope de pressão · espuma no ponto' },
  vinho: { name: 'Vinho', icon: '🍷', bar: 'Servir vinho', title: 'Vinho na caneca · no ponto' },
  polenta: { name: 'Polenta', icon: '🍲', bar: 'Cortar polenta', title: 'Polenta · corte a fatia no ponto' }
};
// Lugares de quem pede: entre as mesas compridas, longe da pista de dança (no meio) e do balcão (à direita).
const SERVE_SEATS = [[330, 610], [470, 610], [590, 610], [330, 770], [470, 770], [590, 770], [1290, 610], [1420, 610], [1290, 770], [1420, 770]];
const SERVE_EVENTS = {
  fandango: { map: 'ctg', items: ['trago', 'chope'], time: 80, host: 'jayme', target: 12,
    lines: ['“Gaúcho que serve a roda com alegria nunca anda de copo vazio!” Bah, que noite, vivente!', 'Faltou um trago aqui e ali, mas a roda girou bonita.', 'A peonada ficou de goela seca… mas dançou mesmo assim, hehe.'] },
  oktoberfest: { map: 'oktoberfest', items: ['chope'], time: 70, host: 'loligebien', target: 12,
    lines: ['Ein Prosit! Ninguém ficou sem chope, ja! O salão inteiro mandou agradecer.', 'Teve fila no chope, mas a bandinha segurou o povo.', 'Mais espuma que chope, Sadi! Ano que vem a gente treina, ja?'] },
  capela: { map: 'salao', items: ['vinho', 'polenta'], time: 80, host: 'badin', target: 12,
    lines: ['CUDIO! Vinho e polenta pra todo mundo, a nona chorou de emoção!', 'Teve gente que dançou de barriga vazia, mas o baile foi lindo.', 'DIO MADONA, a polenta esfriou no tacho! Ano que vem tu acerta.'] }
};
// Balcão do baile perto da entrada, com os mesmos móveis da bodega: chopeira e mesa de tragos (no baile de capela, a
// pipa de vinho e o tacho de polenta). Um de cada lado da porta.
const SERVE_STATION = { chope: { w: 55, h: 92 }, trago: { w: 90, h: 87 }, vinho: { w: 90, h: 87 }, polenta: { w: 110, h: 50 } };
function serveBar(def) { if (def.bar) return def.bar.map(b => { const st = SERVE_STATION[b.item]; return { item: b.item, fx: b.x - st.w / 2, fy: b.y - 26 - st.h, w: st.w, h: st.h, x: b.x, y: b.y }; }); return def.items.map((item, k) => { const st = SERVE_STATION[item], x = k === 0 ? 860 - st.w : 1040, y = 990 - st.h; return { item, fx: x, fy: y, w: st.w, h: st.h, x: x + st.w / 2, y: 1016 }; }); }
function drawServeStation(b) {
  const f = { id: b.item === 'chope' ? 'tap:evento' : 'pour', x: b.fx, y: b.fy, w: b.w, h: b.h }, { x, y, w, h } = f;
  if (b.item === 'chope') { counter(f, 'wood'); rect(x + 9, y - 15, w - 18, h - 25, '#94632f', 12, '#4c3c25'); for (let j = 0; j < 3; j++) rect(x + 8, y - 6 + j * 24, w - 16, 5, '#a2a18c', 2, '#5c5f4d'); rect(x + w / 2 - 3, y + 30, 20, 7, '#c6c3a1', 2, '#535745'); rect(x + w / 2 + 10, y + 35, 6, 10, '#c6c3a1', 2); food('cerveja', x + w / 2 + 8, y + 60, 35); }
  else if (b.item === 'trago' || b.item === 'vinho') { const wine = b.item === 'vinho'; counter(f); wood(x + 12, y + 13, w - 24, h - 37, true); rect(x + 25, y - 14, 27, 46, wine ? '#5a1a2a' : '#60733b', 6, wine ? '#2a0a12' : '#394324'); rect(x + 31, y - 26, 14, 18, '#b59b59', 2, '#584624'); rect(x + 28, y + 5, 21, 15, '#d7c48b', 1); rect(x + 49, y + 18, 14, 6, '#bdbb94', 2, '#716647'); rect(x + 57, y + 21, 5, 10, '#bdbb94', 1); food(wine ? 'vinho' : 'cachaca', x + 62, y + 48, 30); }
  else { FURN.stove({ x, y, w, h, noPipe: true }); ellipse(x + w / 2, y - 30, 26, 9, '#b8743a'); ellipse(x + w / 2, y - 32, 20, 6, '#f0c040'); }
  if (G.serve?.pour?.item === b.item) bar(x, y - 40, w, G.serve.pour.t / 1.65);
}
function serveActive(map = worldOut?.map) { const s = G.serve; return !!s && !s.done && s.day === G.day && s.map === map; }
function startServe(ev) {
  const def = SERVE_EVENTS[ev]; if (!def || worldOut?.map !== def.map) return;
  // Convidados: fregueses comuns nos salões; só especiais quando o evento pede (a laje da Casona).
  const seats = shuffle((def.seats || SERVE_SEATS).slice()).slice(0, 6), crowd = def.crowd === 'specials' ? shuffle(specialPeople().filter(i => !PEOPLE[i].removed && !(def.hosts || []).includes(PEOPLE[i].id))) : PEOPLE.map((p, i) => i).filter(i => !isSpecial(i) && !PEOPLE[i].removed && PEOPLE[i].id !== G.avatarId);
  G.serve = { ev, day: G.day, map: def.map, t: def.time, total: def.time, served: 0, perfect: 0, missed: 0, hand: null, pour: null, done: false,
    patrons: seats.map(([x, y], n) => ({ x, y, person: crowd[n % crowd.length], want: null, wait: .6 + n * .8, patience: 0, max: 16 })) };
  closeDialog(true); AudioEngine.ready(); floatNote('⏱ Valendo! Sirva no balcão (segure E) e leve a quem pediu.'); save();
}
// O tempo só corre com o Sadi no salão; quem espera demais desiste e pede de novo depois.
function serveTick(dt) {
  const s = G.serve; if (!s || s.done) return;
  if (s.day !== G.day) { G.serve = null; return; }
  if (worldOut?.map !== s.map) { if (s.pour) servePourEnd(true); return; }
  if (s.pour) servePourTick(dt);
  const def = SERVE_EVENTS[s.ev], late = 1 - s.t / s.total; s.t = Math.max(0, s.t - dt);
  for (const p of s.patrons) {
    if (p.want) { p.patience -= dt; if (p.patience <= 0) { p.want = null; p.wait = 2 + Math.random() * 3; s.missed++; effect('Cansou de esperar', p.x, p.y - 150, '#ffb3a0'); } }
    else if ((p.wait -= dt) <= 0) { p.want = pick(def.items); p.max = 17 - late * 6; p.patience = p.max; }
  }
  if (s.t <= 0) finishServe();
}
// No balcão, igual à chopeira da bodega: segurar E enche, soltar na faixa verde serve; passou do ponto, derrama.
function serveStartPour(item) {
  const s = G.serve; if (!s || s.pour) return;
  if (s.hand) { floatNote('Leve primeiro o que está na mão: ' + SERVE_ITEMS[s.hand].name.toLowerCase() + '.'); return; }
  s.pour = { item, t: 0 }; $('pourUI').querySelector('b').textContent = SERVE_ITEMS[item].title; $('pourFill').style.width = '0%'; $('pourUI').classList.remove('hidden');
}
function servePourTick(dt) {
  const s = G.serve, p = s.pour;
  if (!(keys.has('e') || pointerHold)) { servePourEnd(); return; }
  p.t += dt; $('pourFill').style.width = Math.min(100, p.t / 1.65 * 100) + '%'; if (p.t > 1.8) servePourEnd();
}
function servePourEnd(cancel = false) {
  const s = G.serve, p = s?.pour; if (!p) return; s.pour = null; $('pourUI').classList.add('hidden');
  const fill = p.t / 1.65; if (cancel || fill < .15) return;
  if (fill > 1.05) { effect('Derramou!', worldOut.x, worldOut.y - 120, '#ffab80'); AudioEngine.bad(); return; }
  serveTake(p.item, fill >= .68 && fill <= .88);
}
function serveTake(item, perfect = false) { G.serve.hand = item; G.serve.handPerfect = perfect; AudioEngine.glass?.(); effect((perfect ? 'No ponto! ' : '') + SERVE_ITEMS[item].icon + ' ' + SERVE_ITEMS[item].name, worldOut.x, worldOut.y - 150, perfect ? '#d8ffac' : '#fff2b0'); }
function servePatron(n) {
  const s = G.serve, p = s?.patrons[n]; if (!p?.want) return;
  if (s.hand !== p.want) { floatNote('Pediu ' + SERVE_ITEMS[p.want].name.toLowerCase() + ': pegue no balcão.'); AudioEngine.bad(); return; }
  s.served++; if (s.handPerfect) s.perfect++; s.hand = null; p.want = null; p.wait = 1.5 + Math.random() * 3.5;
  AudioEngine.coins(); effect('+1 · ' + s.served, p.x, p.y - 150, '#e1ff9e'); save();
}
function scaleReward(rw, f) {
  if (f >= 1) return rw; const o = {};
  for (const k of ['cash', 'xp', 'rep']) if (rw[k]) o[k] = Math.round(rw[k] * f);
  if (rw.friend) o.friend = Object.fromEntries(Object.entries(rw.friend).map(([k, v]) => [k, Math.max(1, Math.round(v * f))]));
  return o;
}
function finishServe() {
  const s = G.serve; servePourEnd(true); s.done = true;
  const def = SERVE_EVENTS[s.ev], ev = MAP_EVENTS[s.ev], st = mapEvState(s.ev), tier = s.served >= def.target ? 0 : s.served >= def.target * .6 ? 1 : 2;
  const rw = scaleReward(ev.reward, [1, .6, .3][tier]); st.done = true; st.served = s.served;
  grantReward(rw); AudioEngine.ready(); save(); refreshHUD();
  talk([['card', `<p><b>${s.served}</b> servidos (${s.perfect} no ponto) · ${s.missed} cansaram de esperar · meta: ${def.target}</p>`, ev.name + ' · ' + (def.end || 'fim do baile')], [def.host, def.lines[tier]], ['reward', rw, ev.name]], null, 'Receber');
}
// Bolinha de pedido sobre a cabeça, com a paciência embaixo.
function drawOrderBubble(x, y, item, k = 1) {
  rect(x - 24, y - 36, 48, 38, '#fff8e8', 10, '#5a3a20'); ctx.fillStyle = '#fff8e8'; ctx.beginPath(); ctx.moveTo(x - 7, y + 1); ctx.lineTo(x, y + 10); ctx.lineTo(x + 7, y + 1); ctx.fill();
  txt(SERVE_ITEMS[item].icon, x, y - 17, 22, '#000', 'center', 'Arial', false);
  if (k < 1) bar(x - 22, y + 12, 44, k, k > .4 ? '#7ab84a' : '#d8603a');
}
// Pista de dança no meio do salão: casais dançando dois a dois, cada par girando no seu canto da pista, com os
// especiais da região no meio da festa.
const DANCE_PAIRS = [[-160, -90], [150, -90], [-160, 90], [150, 90]];
function drawDancers(layers, cx, cy, extra = []) {
  const people = [...extra.map(id => PEOPLE.findIndex(p => p.id === id)).filter(i => i >= 0 && !PEOPLE[i].removed), ...PEOPLE.map((p, i) => i).filter(i => !isSpecial(i) && !PEOPLE[i].removed)].slice(0, DANCE_PAIRS.length * 2);
  DANCE_PAIRS.forEach(([ox, oy], k) => {
    const pair = people.slice(k * 2, k * 2 + 2); if (pair.length < 2) return;
    const px = cx + ox + Math.sin(frameClock * .8 + k) * 18, py = cy + oy, a = frameClock * (1.4 + k * .1) * (k % 2 ? -1 : 1) + k;
    pair.forEach((i, n) => { const side = n ? 1 : -1, x = px + Math.cos(a) * 30 * side, y = py + Math.sin(a) * 12 * side; layers.push({ y, draw: () => personDraw(PEOPLE[i].sprite, x, y - Math.abs(Math.sin(frameClock * 6 + k + n)) * 4, true, false, x < px ? 1 : -1) }); });
  });
}
function serveSpots() {
  const s = G.serve; if (!serveActive()) return [];
  const def = SERVE_EVENTS[s.ev];
  return [...serveBar(def).map(b => ({ id: 'serve:bar:' + b.item, x: b.x, y: b.y, radius: 80, label: SERVE_ITEMS[b.item].bar + ' ' + SERVE_ITEMS[b.item].icon + ' (segure E)', act: () => serveStartPour(b.item) })),
    ...s.patrons.map((p, n) => p.want ? { id: 'serve:p' + n, x: p.x, y: p.y + 10, radius: 85, label: (s.hand === p.want ? 'Servir ' : 'Pediu ') + SERVE_ITEMS[p.want].name.toLowerCase() + ' ' + SERVE_ITEMS[p.want].icon, act: () => servePatron(n) } : null).filter(Boolean)];
}
function serveDraw(layers) {
  const s = G.serve; if (!serveActive()) return;
  const def = SERVE_EVENTS[s.ev];
  for (const b of serveBar(def)) layers.push({ y: b.fy + b.h, draw: () => drawServeStation(b) });
  s.patrons.forEach(p => layers.push({ y: p.y, draw: () => { personDraw(PEOPLE[p.person].sprite, p.x, p.y, false, false, p.x < 950 ? 1 : -1); if (p.want) drawOrderBubble(p.x, p.y - 140, p.want, p.patience / p.max); } }));
  if (s.hand) layers.push({ y: worldOut.y + 1, draw: () => { ellipse(worldOut.x + 30, worldOut.y - 120, 18, 18, '#fff8e8'); txt(SERVE_ITEMS[s.hand].icon, worldOut.x + 30, worldOut.y - 120, 20, '#000', 'center', 'Arial', false); } });
}
function serveHint() { const s = G.serve; if (!serveActive()) return null; if (s.pour) return 'Segure <strong>E</strong> e solte na faixa verde'; return '⏱ ' + Math.ceil(s.t) + ' s · servidos ' + s.served + ' · na mão: ' + (s.hand ? SERVE_ITEMS[s.hand].icon + ' ' + SERVE_ITEMS[s.hand].name : 'nada'); }

// ---------- Baile de capela (Serra): missa na capela e baile no salão ----------
const CAPELA_HOST = { x: 1120, y: 500 };
function capelaNight() { const ev = mapEventToday(); return ev?.id === 'capela' && mapNight(); }
function capelaMissa() {
  const st = mapEvState('capela');
  if (st.done || st.missa) { enterInterior(st.done ? 'igreja' : 'salao'); return; }
  showRpgBox('worldTalk', null); keys.clear();
  playSteps(missaSteps(), 'missa', () => { st.missa = true; save(); enterInterior('salao'); capelaMenu(); });
}
function capelaMenu() {
  const st = mapEvState('capela'), i = PEOPLE.findIndex(p => p.id === 'badin');
  if (st.done) { worldTalkAt = { x: worldOut.x, y: worldOut.y }; showRpgBox('worldTalk', { person: i, name: 'Badin', reply: 'Que baile, Sadi! Até o padre dançou uma marchinha.' }); return; }
  talk([['badin', 'Agora é baile! Vinho e polenta ficam ali no balcão: leva pra quem pedir.'], ['badin', 'A gaita não para e a nona tá cuidando da polenta. Bora, que a comunidade tá com fome!']], () => startServe('capela'), 'Começar');
}
function missaSteps() {
  const S = [], here = ['badin', 'marcio', 'marcelo', 'mitodosul', 'dianho'].filter(id => PEOPLE.some(p => p.id === id && !p.removed) && id !== G.avatarId);
  const seats = [[420, 470], [560, 470], [1040, 470], [1180, 570], [420, 570]];
  S.push({ caption: 'De noite, na capela da comunidade…', time: 2.2 }, { view: 'missa' }, { actor: 'padre', x: 800, y: 330, dx: 1 }, { actor: 'sadi', x: 600, y: 670, dx: 1 });
  here.forEach((id, k) => S.push({ actor: id, x: seats[k][0], y: seats[k][1], dx: seats[k][0] < 800 ? 1 : -1 }));
  S.push({ fade: 'in', time: 1 });
  const say = (who, text) => S.push({ say: who, text });
  say('padre', 'Irmãos, que a colheita deste ano seja farta e a mesa de cada casa, cheia.');
  say('padre', 'Rezemos pelos que já se foram. Pelo velho Sadi do armazém, que tantas vezes fez a festa desta comunidade.');
  say('sadi', 'O vô também vinha aqui…');
  if (here.includes('badin')) say('badin', 'Vinha, e dançava a noite toda. Depois ainda ajudava a nona a mexer a polenta.');
  say('padre', 'Ide em paz… e o baile começa já!');
  S.push({ walk: ['sadi', ...here], to: [{ x: 800, y: 860 }, ...here.map((_, k) => ({ x: 760 + (k % 3) * 40, y: 820 + k * 10 }))] });
  S.push({ fade: 'out', time: .8 }, { caption: 'No salão, a gaita já está tocando…', time: 2 });
  return S;
}
// Capela por dentro: altar, cruz, vitrais, bancos dos dois lados e o corredor de tapete vermelho.
function drawSceneMissa() {
  const s = scene; beginWorld();
  rect(0, 0, W, H, '#2a2018'); rect(160, 0, W - 320, 260, '#efe6d2'); rect(160, 250, W - 320, 12, '#8a7a5a');
  for (const x of [330, 1190]) { rect(x, 50, 80, 150, '#3a2a1a', 30); rect(x + 6, 56, 68, 138, '#6a8ab8', 28); rect(x + 6, 56, 34, 69, '#b84a3a', 4); rect(x + 40, 125, 34, 69, '#e8c040', 4); }
  rect(785, 40, 30, 150, '#6a4024'); rect(745, 80, 110, 26, '#6a4024');
  rect(160, 262, W - 320, H - 262, '#b8ae9a'); for (let y = 300; y < H; y += 60) rect(160, y, W - 320, 2, '#a8a08c');
  rect(560, 270, 480, 80, '#d8cfb8', 0, '#8a8070'); rect(720, 270, 160, 60, '#f4f2ee', 4, '#b8b0a0'); rect(720, 270, 160, 10, '#c8a040');
  for (const x of [700, 900]) { rect(x - 3, 236, 6, 34, '#f4ecd8'); ellipse(x, 230, 3, 6, '#ffd36a'); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, 230, 60, .25, '255,200,110'); ctx.restore(); }
  rect(740, 360, 120, H - 360, '#8a2a2a'); rect(746, 360, 4, H - 360, '#c8a040'); rect(850, 360, 4, H - 360, '#c8a040');
  for (const y of [430, 530, 630, 730]) { rect(240, y + 40, 460, 22, '#6a4024', 3, '#3a2414'); rect(900, y + 40, 460, 22, '#6a4024', 3, '#3a2414'); }
  const list = [];
  for (const [id, a] of Object.entries(s.actors)) list.push({ y: a.y, draw: () => {
    if (id === 'sadi') personDraw(avatarSprite(), a.x, a.y, a.walk, false, a.dx, !a.walk);
    else if (id === 'padre') { ctx.save(); ctx.filter = 'grayscale(.8) brightness(.55)'; personDraw(5, a.x, a.y, a.walk, false, a.dx); ctx.restore(); rect(a.x - 6, a.y - 96, 12, 4, '#f4f4f4'); }
    else { const i = PEOPLE.findIndex(p => p.id === id); if (i >= 0) personDraw(PEOPLE[i].sprite, a.x, a.y, a.walk, false, a.dx, !a.walk); }
  } });
  list.sort((a, b) => a.y - b.y).forEach(l => l.draw());
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
SCENE_VIEWS.missa = drawSceneMissa;
{
  const speaker = sceneSpeaker;
  sceneSpeaker = function (who) { return who === 'padre' ? { portrait: '<span class="portrait portrait-phone" style="width:104px;height:104px">⛪</span>', name: 'Padre Ângelo' } : speaker(who); };
}

// ---------- Ligações com os mapas ----------
{
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); serveTick(dt); };
  for (const id of ['ctg', 'oktoberfest', 'salao']) {
    const M = WORLD_MAPS[id], spots = M.spots, draw = M.draw, hint = M.hint;
    M.spots = function () { return [...spots.call(this), ...serveSpots(), ...(id === 'salao' && capelaNight() && !serveActive() ? [{ id: 'capela', x: CAPELA_HOST.x, y: CAPELA_HOST.y + 30, label: mapEvState('capela').done ? 'Prosear com o Badin' : 'Servir no baile · falar com o Badin', act: capelaMenu }] : [])]; };
    M.draw = function (view, seen, layers) {
      draw.call(this, view, seen, layers); serveDraw(layers);
      if (id === 'salao' && capelaNight()) { drawDancers(layers, 980, 700, ['marcio', 'marcelo', 'mitodosul']); const i = PEOPLE.findIndex(p => p.id === 'badin'); if (i >= 0) layers.push({ y: CAPELA_HOST.y, draw: () => personDraw(PEOPLE[i].sprite, CAPELA_HOST.x, CAPELA_HOST.y, false, false, -1) }); }
    };
    M.hint = function () { return serveHint() || hint?.call(this) || null; };
  }
  const serra = WORLD_MAPS.serra, rspots = serra.spots;
  serra.spots = function () {
    const list = rspots.call(this);
    if (capelaNight()) { const ig = list.find(s => s.id === 'igreja'), sl = list.find(s => s.id === 'salao'), st = mapEvState('capela'); if (ig) { ig.label = st.done ? 'Entrar na igreja' : st.missa ? 'Baile de capela no salão' : 'Missa e baile de capela'; ig.act = capelaMissa; } if (sl && !st.done) sl.label = 'Entrar no salão · baile de capela'; }
    return list;
  };
}
