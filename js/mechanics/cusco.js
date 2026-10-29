// O cusco véio: um vira-lata caramelo que o Sadi acha na caverna da Serra junto com a Baia (arco "A Baia sumiu", em
// baia.js). Se não for adotado lá, ele vai parar na estação da Fronteira e dá pra adotar depois. Adotado, segue o Sadi pelos mapas
// abertos (nas casas e salões ele espera na porta) e late quando tem assombração do folclore por perto.
// No jogo ele é "o cusco véio" e, de vez em quando, "a jaguara".
// Com o Sadi parado do lado dele, E abre os comandos: "Fica!" ele senta e espera ali mesmo; "Vem!" ele volta correndo;
// ou vai pra casinha, no Campo e curral. (V é o atalho de teclado pra fica/vem.)
'use strict';

const CUSCO_HOME = { map: 'vila', x: 3960, y: 1240 }, CUSCO_BARK_RANGE = 720;
const CUSCO_CASINHA = { x: 170, y: 680, w: 104, h: 84 };
const cusco = { x: 0, y: 0, dx: 1, walk: false, map: null, bark: 0, stuck: 0 };
function cuscoAdopted() { return !!G.cusco?.day; }
function cuscoMode() { return G.cusco?.mode || 'follow'; }
// Onde ele fica quando não está seguindo: no lugar do "Fica!" ou deitado do lado da casinha.
function cuscoPlace() { const m = cuscoMode(); if (m === 'stay') return G.cusco.at; if (m === 'casinha') return { map: 'curral', x: CUSCO_CASINHA.x + CUSCO_CASINHA.w + 40, y: CUSCO_CASINHA.y + CUSCO_CASINHA.h - 4 }; return null; }
function cuscoName(cap = false) { const n = Math.random() < .25 ? 'a jaguara' : 'o cusco véio'; return cap ? n[0].toUpperCase() + n.slice(1) : n; }
// Só nos mapas abertos: dentro de casa, salão ou loja ele fica esperando na porta.
function cuscoOut() { return cuscoAdopted() && cuscoMode() === 'follow' && worldOut && !worldMap()?.indoor && !scene; }

// ---------- Achar e adotar ----------
function cuscoAtStation() { return !cuscoAdopted() && !!G.baiaArc?.cuscoFree; }
function cuscoStraySpot() {
  if (!cuscoAtStation() || worldOut?.map !== CUSCO_HOME.map || prologueActive()) return [];
  return [{ id: 'cusco', x: CUSCO_HOME.x, y: CUSCO_HOME.y + 30, radius: 110, label: 'Um cusco véio magrinho', act: meetCusco }];
}
function meetCusco() {
  if (cuscoAdopted()) return;
  talk([['card', '<b>🐕 O cusco véio na estação</b><br>O cusco caramelo que cuidava da Cadela Baia lá na caverna veio parar aqui. Fica deitado esperando o trem, que não traz ninguém pra ele.<br><br>Quando tu chega perto, ele abana o rabo e encosta o focinho na tua mão.', 'Vira-lata da estação'],
    ['sadi', 'Bah, jaguara… tu também tá sozinho por aqui, é?'], ['sadi', 'Vem comigo, cusco véio. Na bodega sempre sobra um osso.']], adoptCusco, 'Levar o cusco véio');
}
function adoptCusco() {
  G.cusco = { day: G.day }; Object.assign(cusco, { x: worldOut.x - 70, y: worldOut.y + 10, map: worldOut.map, walk: false, bark: 0 });
  AudioEngine.heart(); cuscoBarkSound(); effect('Au! Au!', cusco.x, cusco.y - 70, '#fff2b0');
  showBanner('O cusco véio agora é teu!', 'Ele te segue e late pras assombrações. Parado do lado dele, E dá os comandos.', 'gift'); save();
}

// ---------- Fica, vem e casinha ----------
function cuscoStay() {
  if (!cuscoOut()) return; G.cusco.mode = 'stay'; G.cusco.at = { map: worldOut.map, x: Math.round(cusco.x), y: Math.round(cusco.y) }; cusco.map = null;
  effect('Fica!', worldOut.x, worldOut.y - 150, '#fff2b0'); floatNote(pick(['O cusco véio sentou e ficou te olhando. V chama de volta.', 'A jaguara deitou ali mesmo, esperando. V chama de volta.'])); AudioEngine.tick(); save();
}
function cuscoCall() {
  if (!cuscoAdopted() || cuscoMode() === 'follow') return;
  const at = cuscoPlace(); G.cusco.mode = 'follow'; G.cusco.at = null; closeDialog(true);
  // Do mesmo mapa ele vem correndo de onde estava; de longe, chega correndo pela borda da tela.
  if (worldOut && at?.map === worldOut.map) Object.assign(cusco, { x: at.x, y: at.y, map: worldOut.map, stuck: 0 });
  else if (worldOut && !worldMap()?.indoor) { const x = worldOut.x - (worldOut.dx || 1) * 520, y = worldOut.y + 10; Object.assign(cusco, worldCanWalk(x, y) ? { x, y } : { x: worldOut.x - 60, y: worldOut.y + 14 }, { map: worldOut.map, stuck: 0 }); }
  if (worldOut) effect('Fiu-fiu!', worldOut.x, worldOut.y - 150, '#fff2b0');
  cuscoBarkSound(); floatNote(at?.map === worldOut?.map ? cuscoName(true) + ' veio correndo, abanando o rabo.' : 'Fiu-fiu! ' + cuscoName(true) + ' veio correndo lá do ' + (at?.map === 'curral' ? 'campo' : 'outro lado') + '.'); save();
}
function cuscoHome() { if (!cuscoAdopted()) return; G.cusco.mode = 'casinha'; G.cusco.at = null; cusco.map = null; closeDialog(true); floatNote('O cusco véio foi pra casinha dele, no Campo e curral.'); AudioEngine.tick(); save(); }
function cuscoToggle() {
  if (!cuscoAdopted() || !worldOut) return;
  if (cuscoMode() === 'follow') { if (worldMap()?.indoor) { floatNote('O cusco véio tá te esperando na porta.'); return; } cuscoStay(); } else cuscoCall();
}
function cuscoPet() {
  const at = cuscoPlace() || cusco; closeDialog(true); AudioEngine.heart(); effect('❤', at.x, at.y - 70, '#ffb3c0');
  if (G.cusco.pet !== G.day) { G.cusco.pet = G.day; floatNote(pick(['O cusco véio rolou de barriga pra cima.', 'A jaguara lambeu tua mão inteira.', 'O cusco véio abanou tanto o rabo que quase caiu.'])); save(); }
}
function cuscoMenu() {
  const m = cuscoMode(), btn = (id, label, primary) => `<button class="${primary ? 'primary' : ''}" data-act="cusco" data-id="${id}">${label}</button>`;
  const text = m === 'casinha' ? 'Deitado do lado da casinha, de olho no curral. Abana o rabo quando te vê.' : m === 'stay' ? 'Sentadinho onde tu mandou ficar, esperando.' : 'Do teu lado, abanando o rabo, esperando o que tu vai mandar.';
  const opts = m === 'follow' ? btn('fica', 'Fica aqui!', true) + btn('casinha', 'Vai pra casinha') : btn('vem', 'Vem comigo!', true) + (m === 'stay' ? btn('casinha', 'Vai pra casinha') : '');
  openDialog('Cusco véio', `<div class="rpg-speaker"><span class="portrait portrait-phone" style="width:88px;height:88px">🐕</span><div><p>${text}</p></div></div><div class="actions">${opts}${btn('carinho', 'Fazer carinho')}<button data-act="close">${m === 'follow' ? 'Deixa' : 'Deixar ele aí'}</button></div>`, 'cusco');
}
function cuscoAct(id) { if (id === 'vem') cuscoCall(); else if (id === 'fica') { closeDialog(true); cuscoStay(); } else if (id === 'casinha') cuscoHome(); else if (id === 'carinho') cuscoPet(); }
// Seguindo o Sadi, o cusco só atende o E com o Sadi parado e nada mais pra fazer ali perto (não rouba o E de ninguém).
function cuscoSpots(map, others = []) {
  if (!cuscoAdopted() || worldOut?.map !== map) return [];
  const list = [], at = cuscoPlace();
  if (cuscoOut() && cusco.map === map && !worldOut.walk && ![...others, ...walkerSpots()].some(s => Math.hypot(s.x - worldOut.x, s.y - worldOut.y) < (s.radius ?? 90))) list.push({ id: 'cusco:follow', x: cusco.x, y: cusco.y, radius: 110, label: 'Cusco véio · dar um comando', act: cuscoMenu });
  if (at && at.map === map) list.push({ id: 'cusco:place', x: at.x, y: at.y + 24, radius: 90, label: cuscoMode() === 'casinha' ? 'Cusco véio na casinha' : 'Cusco véio · esperando', act: cuscoMenu });
  if (map === 'curral' && cuscoMode() === 'follow') list.push({ id: 'casinha', x: CUSCO_CASINHA.x + CUSCO_CASINHA.w / 2, y: CUSCO_CASINHA.y + CUSCO_CASINHA.h + 26, radius: 80, label: 'Casinha do cusco · deixar ele aqui', act: cuscoHome });
  return list;
}
// Casinha de madeira com telhado vermelho, plaquinha e a vasilha d'água.
function drawCasinha() {
  const { x, y, w, h } = CUSCO_CASINHA;
  ellipse(x + w / 2, y + h + 2, w * .62, 12, '#1c140c44');
  rect(x + 6, y + 26, w - 12, h - 26, '#9a6a3a', 4, '#4a2e16'); for (let k = 0; k < 4; k++) rect(x + 8, y + 34 + k * 13, w - 16, 2, '#7a5028');
  poly([[x - 6, y + 32], [x + w / 2, y - 8], [x + w + 6, y + 32]], '#a83a26'); poly([[x + 4, y + 28], [x + w / 2, y - 1], [x + w - 4, y + 28]], '#c8503a');
  ctx.fillStyle = '#1a120c'; ctx.beginPath(); ctx.moveTo(x + w / 2 - 20, y + h); ctx.lineTo(x + w / 2 - 20, y + h - 30); ctx.arc(x + w / 2, y + h - 30, 20, Math.PI, 0); ctx.lineTo(x + w / 2 + 20, y + h); ctx.fill();
  rect(x + w / 2 - 26, y + 12, 52, 14, '#f0e2c4', 3, '#4a2e16'); txt('CUSCO', x + w / 2, y + 19, 10, '#5a3418', 'center', 'Georgia', false);
  ellipse(x + w + 14, y + h - 4, 14, 6, '#5a6a8a'); ellipse(x + w + 14, y + h - 6, 10, 3.5, '#8ab8e8');
}

// ---------- Seguir o Sadi ----------
function cuscoTick(dt) {
  if (!cuscoOut()) { cusco.map = null; return; }
  // O lado de trás do Sadi só troca quando ele vira de verdade (não a cada passo na diagonal).
  const p = worldOut; if (Math.abs(p.dx || 0) > .4) cusco.side = p.dx < 0 ? -1 : 1;
  const back = { x: p.x - (cusco.side || 1) * 64, y: p.y + 14 };
  // Trocou de mapa ou ficou muito longe: aparece do lado do Sadi.
  if (cusco.map !== p.map || Math.hypot(cusco.x - p.x, cusco.y - p.y) > 700) Object.assign(cusco, { x: back.x, y: back.y, map: p.map, stuck: 0 });
  // Velocidade que cresce com a distância e liga/desliga com folga: ele vai no passo do Sadi em vez de parar e arrancar
  // a cada instante (o que fazia a pose trocar entre andar e parar sem parar).
  const d = Math.hypot(back.x - cusco.x, back.y - cusco.y), speed = Math.min(BASE_SPEED * 1.5 * (1 + movementBonus()) * (d > 160 ? 1.25 : 1), d * 5);
  cusco.walk = cusco.walk ? speed > 15 : d > 26;
  if (cusco.walk) {
    const k = Math.min(d, speed * dt), nx = cusco.x + (back.x - cusco.x) / d * k, ny = cusco.y + (back.y - cusco.y) / d * k;
    if (Math.abs(back.x - cusco.x) > d * .35) cusco.dx = back.x < cusco.x ? -1 : 1;
    const before = { x: cusco.x, y: cusco.y };
    if (worldCanWalk(nx, cusco.y)) cusco.x = nx; if (worldCanWalk(cusco.x, ny)) cusco.y = ny;
    // Preso atrás de uma parede: depois de um instante, pula pro lado do Sadi.
    cusco.stuck = Math.hypot(cusco.x - before.x, cusco.y - before.y) < .2 ? cusco.stuck + dt : 0;
    if (cusco.stuck > .8 && d > 90) Object.assign(cusco, { x: back.x, y: back.y, stuck: 0 });
  }
  cuscoSense(dt);
}
// Assombração por perto (as do folclore e o Negrinho do Pastoreio): late, olha pra lá e avisa uma vez por noite.
function cuscoThreat() {
  const list = [...folkSpots(worldOut.map), ...(typeof negrinhoSpot === 'function' ? negrinhoSpot() : [])];
  return list.map(s => ({ s, d: Math.hypot(s.x - cusco.x, s.y - cusco.y) })).filter(t => t.d < CUSCO_BARK_RANGE).sort((a, b) => a.d - b.d)[0]?.s || null;
}
function cuscoSense(dt) {
  const t = cuscoThreat(); if (!t) { cusco.alert = null; return; }
  cusco.alert = t; if (!cusco.walk) cusco.dx = t.x < cusco.x ? -1 : 1;
  cusco.bark -= dt; if (cusco.bark > 0) return;
  cusco.bark = 2.2 + Math.random() * 1.4; cuscoBarkSound(); effect(pick(['Au! Au!', 'Auuu!', 'Grrr… Au!']), cusco.x, cusco.y - 70, '#ffd2a0');
  if (G.cusco.warned !== G.day) { G.cusco.warned = G.day; floatNote(pick([cuscoName(true) + ' tá latindo pro escuro: tem coisa por perto…', 'A jaguara eriçou o pelo e não para de latir. Tem assombração rondando.', 'O cusco véio rosna pro mato. Melhor ir ver o que é.'])); }
}
function cuscoBarkSound() { AudioEngine.note(390, .07, 'sawtooth', .05); AudioEngine.note(300, .09, 'sawtooth', .05, .13); }

// ---------- Desenho ----------
// Vira-lata caramelo de peito branco: anda, senta quando o Sadi para e abana o rabo.
function drawCusco(x, y, dir = 1, walking = false, sleepy = false, alert = false, colors = null) {
  const t = frameClock, step = walking ? Math.sin(t * 14) * 3 : 0, wag = Math.sin(t * (alert ? 22 : walking ? 12 : 7)) * (sleepy ? .15 : .55);
  ctx.save(); ctx.translate(x, y); ctx.scale(dir < 0 ? -1.45 : 1.45, 1.45);
  ellipse(0, 1, 24, 6, '#1c140c44');
  const fur = colors?.fur || '#b8803a', dark = colors?.dark || '#8a5a26', light = colors?.light || '#f0e2c4';
  if (sleepy) {
    ellipse(-2, -9, 22, 9, fur); ellipse(17, -9, 9, 7, fur); ellipse(20, -6, 5, 3.5, light); ellipse(25, -8, 2, 2, '#2a1a10'); ellipse(13, -14, 4, 6, dark);
    ctx.save(); ctx.translate(-22, -9); ctx.rotate(.6 + wag * .3); rect(-12, -2, 13, 4, fur, 2); ctx.restore();
    txt('z', 26, -26 - Math.sin(t * 2) * 3, 10, '#fff2b0', 'center', 'Arial', false); ctx.restore(); return;
  }
  const sit = !walking;
  // rabo
  ctx.save(); ctx.translate(-18, sit ? -14 : -22); ctx.rotate(-1 + wag); rect(-3, -16, 5, 17, fur, 3); ctx.restore();
  // patas
  if (sit) { rect(-14, -8, 9, 8, dark, 3); rect(4, -12, 5, 12, fur, 2); rect(11, -12, 5, 12, fur, 2); }
  else for (const [lx, o] of [[-14, step], [-7, -step], [6, -step], [13, step]]) rect(lx + o * .5 - 2, -14, 5, 14, lx < 0 ? dark : fur, 2);
  // corpo e peito
  if (sit) { ellipse(-4, -15, 14, 11, fur); ellipse(6, -17, 8, 9, light); }
  else { ellipse(0, -20, 19, 9, fur); ellipse(9, -17, 8, 6, light); }
  // cabeça
  const hx = sit ? 10 : 17, hy = sit ? -30 : -27 + (walking ? Math.abs(step) * .3 : 0);
  ellipse(hx, hy, 9, 8, fur); ellipse(hx + 8, hy + 3, 6, 4.5, light); ellipse(hx + 13, hy + 1.5, 2.2, 2, '#2a1a10');
  ellipse(hx + 3, hy - 2, 1.6, 1.8, '#2a1a10');
  ctx.save(); ctx.translate(hx - 4, hy - 4); ctx.rotate(alert ? -.5 : .5); ellipse(0, 4, 3.5, 7, dark); ctx.restore();
  if (alert) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(hx + 10, hy + 6); ctx.lineTo(hx + 14, hy + 6); ctx.lineTo(hx + 12, hy + 9); ctx.fill(); }
  ctx.restore();
}
function cuscoLayers(M, seen, layers) {
  if (cuscoAtStation() && worldOut?.map === CUSCO_HOME.map && !prologueActive() && seen(CUSCO_HOME.x, CUSCO_HOME.y)) {
    const near = Math.hypot(worldOut.x - CUSCO_HOME.x, worldOut.y - CUSCO_HOME.y) < 260;
    layers.push({ y: CUSCO_HOME.y, draw: () => drawCusco(CUSCO_HOME.x, CUSCO_HOME.y, worldOut.x < CUSCO_HOME.x ? -1 : 1, false, !near) });
  }
  if (cuscoOut() && cusco.map === worldOut.map && seen(cusco.x, cusco.y)) layers.push({ y: cusco.y, draw: () => drawCusco(cusco.x, cusco.y, cusco.dx, cusco.walk, false, !!cusco.alert) });
  if (!cuscoAdopted() || !worldOut) return;
  if (worldOut.map === 'curral' && seen(CUSCO_CASINHA.x, CUSCO_CASINHA.y)) layers.push({ y: CUSCO_CASINHA.y + CUSCO_CASINHA.h, draw: drawCasinha });
  const at = cuscoPlace();
  if (at && at.map === worldOut.map && seen(at.x, at.y)) { const near = Math.hypot(worldOut.x - at.x, worldOut.y - at.y) < 300; layers.push({ y: at.y, draw: () => drawCusco(at.x, at.y, worldOut.x < at.x ? -1 : 1, false, !near) }); }
}

// ---------- Baia, a cadela do Mano Lima ----------
// Em casa, deitada no tapete da sala; em alguns dias, sai junto quando o Mano Lima vai caminhar pela Fronteira.
const BAIA = { home: 'casa:manolima', x: 480, y: 610, colors: { fur: '#d9b97a', dark: '#b8955a', light: '#f6ecd4' } };
const baia = { x: 0, y: 0, dx: 1, walk: false, with: null };
function manolimaIndex() { return PEOPLE.findIndex(p => p.id === 'manolima'); }
// Sumida (arco "A Baia sumiu"), ela não está em casa nem passeando: só no fundo da caverna, e depois indo pra casa com o Sadi.
function baiaAway() { const s = G.baiaArc?.stage, m = G.missions?.baia?.status; return m === 'calling' || m === 'active' || !!s && s !== 'done'; }
function baiaWalksToday() { const i = manolimaIndex(); return i >= 0 && !PEOPLE[i].removed && !baiaAway() && dayHash(i, 9) % 2 === 0; }
function baiaWalker() { if (!baiaWalksToday() || !worldOut) return null; return worldWalkers.find(w => PEOPLE[w.person]?.id === 'manolima') || null; }
// O Mano Lima está mesmo na rua (não em casa esperando o Sadi, nem na bodega, nem visitando outra região)?
function manolimaOut() { const i = manolimaIndex(); return i >= 0 && walkingToday(i) && !questMarker('manolima') && !storyNeeds('manolima') && !activeUniqueVisitors().has(i); }
function baiaAtHome() { return manolimaIndex() >= 0 && !baiaAway() && !(baiaWalksToday() && manolimaOut()); }
function baiaTick(dt) {
  const w = baiaWalker(); if (!w) { baia.with = null; return; }
  // Atrás do Mano Lima, do lado de onde ele vem; o lado só troca quando ele vira de verdade.
  if (Math.abs(w.dx || 0) > .4) baia.side = w.dx < 0 ? -1 : 1;
  const side = baia.side || 1, to = { x: w.x - side * 56, y: w.y + 12 }, d = Math.hypot(to.x - baia.x, to.y - baia.y);
  if (baia.with !== w || d > 320) { Object.assign(baia, { x: to.x, y: to.y, with: w, walk: false, dx: side }); return; }
  // No passo dele: velocidade que cresce com a distância e liga/desliga com folga, sem ficar trocando de pose.
  const speed = Math.min(230, d * 4); baia.walk = baia.walk ? speed > 12 : d > 24;
  if (!baia.walk) { if (!w.walk) baia.dx = side; return; }
  const k = Math.min(d, speed * dt), vx = (to.x - baia.x) / d; if (Math.abs(vx) > .35) baia.dx = vx < 0 ? -1 : 1; baia.x += vx * k; baia.y += (to.y - baia.y) / d * k;
}
function baiaLayers(M, seen, layers) { const w = baiaWalker(); if (w && baia.with === w && seen(baia.x, baia.y)) layers.push({ y: baia.y, draw: () => drawCusco(baia.x, baia.y, baia.dx, baia.walk, false, false, BAIA.colors) }); }
function baiaPet() {
  const i = manolimaIndex(); AudioEngine.heart(); effect('❤', BAIA.x, BAIA.y - 70, '#ffb3c0');
  if (atHome('manolima')) { worldTalkAt = { x: worldOut.x, y: worldOut.y }; showRpgBox('worldTalk', { person: i, name: PEOPLE[i].name, reply: pick(['Essa é a Cadela Baia, vivente. Mais braba que eu, mas só com quem não presta.', 'A Cadela Baia me acompanha nas tropeadas desde guaipeca. Baia de pelo, baia de alma.', 'Cuidado que ela gosta de carinho: se parar, ela cutuca com o focinho.']) }); }
  else floatNote('A Cadela Baia abana o rabo e volta a cochilar no tapete.');
}
function baiaSpots() { if (worldOut?.map !== BAIA.home || !baiaAtHome()) return []; return [{ id: 'baia', x: BAIA.x, y: BAIA.y + 24, radius: 80, label: 'Cadela Baia, do Mano Lima', act: baiaPet }]; }

// ---------- Ligações ----------
{
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (worldOut) { cuscoTick(dt); baiaTick(dt); } };
  const vila = WORLD_MAPS.vila, spots = vila.spots; vila.spots = function () { return [...spots.call(this), ...cuscoStraySpot()]; };
  for (const id of ['vila', 'serra', 'sc', 'curral']) { const M = WORLD_MAPS[id], sp = M.spots; M.spots = function () { const base = sp.call(this); return [...base, ...cuscoSpots(id, base)]; }; }
  const casa = WORLD_MAPS[BAIA.home];
  if (casa) { const hs = casa.spots, hd = casa.draw; casa.spots = function () { return [...hs.call(this), ...baiaSpots()]; }; casa.draw = function (view, seen, layers) { hd.call(this, view, seen, layers); if (baiaAtHome()) { const near = Math.hypot(worldOut.x - BAIA.x, worldOut.y - BAIA.y) < 220; layers.push({ y: BAIA.y, draw: () => drawCusco(BAIA.x, BAIA.y, worldOut.x < BAIA.x ? -1 : 1, false, !near, false, BAIA.colors) }); } }; }
  const curral = WORLD_MAPS.curral, walk = curral.canWalk;
  curral.canWalk = function (x, y) { const c = CUSCO_CASINHA; if (cuscoAdopted() && x > c.x - 4 && x < c.x + c.w + 4 && y > c.y + 20 && y < c.y + c.h + 6) return false; return walk.call(this, x, y); };
  document.addEventListener('keydown', e => { if (e.key.toLowerCase() !== 'v' || e.repeat || modal || scene || !started || !worldOut || G.lasso || G.bocce) return; cuscoToggle(); });
  // A paisagem do mundo (world-art.js) carrega depois deste arquivo: o desenho entra quando a página termina de carregar.
  document.addEventListener('DOMContentLoaded', () => {
    const land = worldLandscape; worldLandscape = function (M, seen, layers, view) { land(M, seen, layers, view); cuscoLayers(M, seen, layers); baiaLayers(M, seen, layers); };
  });
}
