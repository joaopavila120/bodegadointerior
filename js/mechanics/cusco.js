// O cusco véio: um vira-lata caramelo que vive perto da estação da Fronteira. Adotado, segue o Sadi pelos mapas
// abertos (nas casas e salões ele espera na porta) e late quando tem assombração do folclore por perto.
// No jogo ele é "o cusco véio" e, de vez em quando, "a jaguara".
'use strict';

const CUSCO_HOME = { map: 'vila', x: 3960, y: 1240 }, CUSCO_BARK_RANGE = 720;
const cusco = { x: 0, y: 0, dx: 1, walk: false, map: null, bark: 0, stuck: 0 };
function cuscoAdopted() { return !!G.cusco?.day; }
function cuscoName(cap = false) { const n = Math.random() < .25 ? 'a jaguara' : 'o cusco véio'; return cap ? n[0].toUpperCase() + n.slice(1) : n; }
// Só nos mapas abertos: dentro de casa, salão ou loja ele fica esperando na porta.
function cuscoOut() { return cuscoAdopted() && worldOut && !worldMap()?.indoor && !scene; }

// ---------- Achar e adotar ----------
function cuscoStraySpot() {
  if (cuscoAdopted() || worldOut?.map !== CUSCO_HOME.map || prologueActive()) return [];
  return [{ id: 'cusco', x: CUSCO_HOME.x, y: CUSCO_HOME.y + 30, radius: 110, label: 'Um cusco véio magrinho', act: meetCusco }];
}
function meetCusco() {
  if (cuscoAdopted()) return;
  talk([['card', '<b>🐕 Um cusco véio na estação</b><br>Caramelo, magro e de orelha caída. Fica ali deitado esperando o trem, que não traz ninguém pra ele.<br><br>Quando tu chega perto, ele abana o rabo e encosta o focinho na tua mão.', 'Vira-lata da estação'],
    ['sadi', 'Bah, jaguara… tu também tá sozinho por aqui, é?'], ['sadi', 'Vem comigo, cusco véio. Na bodega sempre sobra um osso.']], adoptCusco, 'Levar o cusco véio');
}
function adoptCusco() {
  G.cusco = { day: G.day }; Object.assign(cusco, { x: worldOut.x - 70, y: worldOut.y + 10, map: worldOut.map, walk: false, bark: 0 });
  AudioEngine.heart(); cuscoBarkSound(); effect('Au! Au!', cusco.x, cusco.y - 70, '#fff2b0');
  showBanner('O cusco véio agora é teu!', 'Ele te segue pela rua e late quando tem assombração por perto.', 'gift'); save();
}

// ---------- Seguir o Sadi ----------
function cuscoTick(dt) {
  if (!cuscoOut()) { cusco.map = null; return; }
  const p = worldOut, back = { x: p.x - (p.dx || 1) * 64, y: p.y + 14 };
  // Trocou de mapa ou ficou muito longe: aparece do lado do Sadi.
  if (cusco.map !== p.map || Math.hypot(cusco.x - p.x, cusco.y - p.y) > 700) Object.assign(cusco, { x: back.x, y: back.y, map: p.map, stuck: 0 });
  const d = Math.hypot(back.x - cusco.x, back.y - cusco.y), speed = BASE_SPEED * 1.5 * (1 + movementBonus()) * (d > 160 ? 1.25 : 1);
  cusco.walk = d > 18;
  if (cusco.walk) {
    const k = Math.min(d, speed * dt), nx = cusco.x + (back.x - cusco.x) / d * k, ny = cusco.y + (back.y - cusco.y) / d * k;
    if (Math.abs(back.x - cusco.x) > 4) cusco.dx = back.x < cusco.x ? -1 : 1;
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
function drawCusco(x, y, dir = 1, walking = false, sleepy = false, alert = false) {
  const t = frameClock, step = walking ? Math.sin(t * 14) * 3 : 0, wag = Math.sin(t * (alert ? 22 : walking ? 12 : 7)) * (sleepy ? .15 : .55);
  ctx.save(); ctx.translate(x, y); ctx.scale(dir < 0 ? -1.45 : 1.45, 1.45);
  ellipse(0, 1, 24, 6, '#1c140c44');
  const fur = '#b8803a', dark = '#8a5a26', light = '#f0e2c4';
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
  if (!cuscoAdopted() && worldOut?.map === CUSCO_HOME.map && !prologueActive() && seen(CUSCO_HOME.x, CUSCO_HOME.y)) {
    const near = Math.hypot(worldOut.x - CUSCO_HOME.x, worldOut.y - CUSCO_HOME.y) < 260;
    layers.push({ y: CUSCO_HOME.y, draw: () => drawCusco(CUSCO_HOME.x, CUSCO_HOME.y, worldOut.x < CUSCO_HOME.x ? -1 : 1, false, !near) });
  }
  if (cuscoOut() && cusco.map === worldOut.map && seen(cusco.x, cusco.y)) layers.push({ y: cusco.y, draw: () => drawCusco(cusco.x, cusco.y, cusco.dx, cusco.walk, false, !!cusco.alert) });
}

// ---------- Ligações ----------
{
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (worldOut) cuscoTick(dt); };
  const vila = WORLD_MAPS.vila, spots = vila.spots; vila.spots = function () { return [...spots.call(this), ...cuscoStraySpot()]; };
  // A paisagem do mundo (world-art.js) carrega depois deste arquivo: o desenho entra quando a página termina de carregar.
  document.addEventListener('DOMContentLoaded', () => { const land = worldLandscape; worldLandscape = function (M, seen, layers, view) { land(M, seen, layers, view); cuscoLayers(M, seen, layers); }; });
}
