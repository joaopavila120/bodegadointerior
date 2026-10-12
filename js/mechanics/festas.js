// Festas no mapa:
//   · 20 de Setembro (Semana Farroupilha): no sábado da semana de setembro, a Fronteira acampa ao ar livre. De noite, no
//     acampamento, o Valter conta a história dos farrapos e todo mundo comemora em volta do fogo de chão.
//   · Festa na laje da Casona (Serra): só os especiais, churrasco do Márcio e do Marcelo, e o Sadi cuida da chopeira.
'use strict';

// ---------- Os dois eventos no calendário ----------
{
  const rest = Object.entries(MAP_EVENTS); for (const k of Object.keys(MAP_EVENTS)) delete MAP_EVENTS[k];
  Object.assign(MAP_EVENTS, {
    // O 20 de setembro vem antes de qualquer outro evento do dia.
    farroupilha: {
      id: 'farroupilha', name: '20 de Setembro', icon: '🏕️', giver: 'valter', place: 'Acampamento farroupilha, Fronteira, de noite',
      desc: 'Semana Farroupilha: no 20 de setembro a Fronteira inteira acampa ao ar livre, com fogo de chão, chimarrão e verso. Depois de fechar, vá ao acampamento comemorar.',
      reward: { cash: 60, xp: 100, rep: 6, friend: { valter: 5, jayme: 5, manolima: 5, baitaca: 5, guri: 5 } },
      days: (n, day) => { const c = calendar(day); return c.month === 8 && c.weekday === 5; }, requires: () => true,
      scene: [['valter', 'Ô, Sadi! Hoje é 20 de setembro, o dia mais gaúcho do ano!'], ['valter', 'A Fronteira inteira vai acampar ao ar livre, como os farrapos faziam: fogo de chão, carne no espeto e mate na roda.'], ['sadi', 'E a bodega?'], ['valter', 'Abre de dia, que freguês não falta. Mas de noite tu vem pro acampamento, que eu te conto a história direitinho!']],
      tracker: () => { const st = mapEvState('farroupilha'); if (st.done) return null; return { icon: '🏕️', title: '20 de Setembro', goal: (mapNight() ? '' : 'De noite: ') + 'acampamento farroupilha na Fronteira' }; }
    },
    ...Object.fromEntries(rest),
    casona: {
      id: 'casona', name: 'Festa na laje da Casona', icon: '🍖', giver: 'marcio', partner: 'marcelo', place: 'Casona de Márcio e Marcelo, Serra Gaúcha, de noite',
      desc: 'Festa só para os especiais na laje da Casona: churrasco do Márcio e do Marcelo. O Sadi cuida da chopeira e serve chope para os convidados.',
      reward: { cash: 80, xp: 70, rep: 3, friend: { marcio: 6, marcelo: 6 } },
      days: n => n === 30 || n > 30 && (n - 30) % 28 === 0, requires: () => !regionLocked('serra'),
      scene: [['marcio', 'É o quê? Hoje tem festa na laje da Casona, Sadi!'], ['marcelo', 'Só a nata: os especiais. Churrasco por nossa conta, show de bola!'], ['sadi', 'E eu levo o quê?'], ['marcio', 'Tu cuida da chopeira, é o quê? Depois de fechar, sobe pra Serra!']],
      tracker: () => { const st = mapEvState('casona'); if (st.done) return null; return { icon: '🍖', title: 'Festa na laje', goal: (mapNight() ? '' : 'De noite: ') + 'servir chope na laje da Casona, na Serra' }; }
    }
  });
  Object.assign(MAP_REMIND, {
    farroupilha: ['🏕️ O acampamento farroupilha está com o fogo aceso na Fronteira.', '🏕️ Acampamento farroupilha: siga o fogo de chão no meio da Fronteira.'],
    casona: ['🍖 Festa na laje da Casona, na Serra!', '🍖 Os gêmeos te esperam na laje da Casona.']
  });
}

// ---------- 20 de Setembro: acampamento farroupilha ----------
const ACAMPAMENTO = { x: 1500, y: 1720 }, FARRAPOS = ['valter', 'jayme', 'manolima', 'baitaca', 'guri'];
function farroupilhaNight() { const ev = mapEventToday(); return ev?.id === 'farroupilha' && mapNight(); }
function drawFogoDeChao(x, y) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 20, 160, .35, '255,150,60'); ctx.restore();
  for (let k = 0; k < 6; k++) rect(x - 30 + k * 10, y - 6, 8, 12, '#4a2a14', 2);
  for (let k = 0; k < 5; k++) { const fx = x - 16 + k * 8 + Math.sin(frameClock * 9 + k) * 3, fh = 18 + Math.sin(frameClock * 7 + k * 2) * 6; ellipse(fx, y - fh / 2 - 4, 6, fh / 2, k % 2 ? '#ffb030' : '#ff6a20'); }
}
function drawBarraca(x, y, cor = '#c8b890') { poly([[x - 60, y], [x, y - 70], [x + 60, y]], cor); poly([[x - 12, y], [x, y - 40], [x + 12, y]], '#3a2a1a'); rect(x - 2, y - 76, 4, 10, '#5a3a20'); }
function drawBandeiraRS(x, y) { rect(x, y - 90, 4, 90, '#5a3a20'); rect(x + 4, y - 90, 54, 36, '#2a7a3a'); poly([[x + 4, y - 90], [x + 58, y - 54], [x + 58, y - 66], [x + 16, y - 90]], '#d42a2a'); poly([[x + 4, y - 78], [x + 40, y - 54], [x + 58, y - 54], [x + 4, y - 90]], '#f0d020'); }
function drawAcampamento(layers, seen) {
  const { x, y } = ACAMPAMENTO; if (!seen(x, y, 500)) return;
  for (const [dx, dy, c] of [[-200, -60, '#c8b890'], [190, -70, '#b8a880'], [-40, -130, '#d0c098']]) layers.push({ y: y + dy, draw: () => drawBarraca(x + dx, y + dy, c) });
  layers.push({ y: y - 120, draw: () => drawBandeiraRS(x + 90, y - 120) });
  layers.push({ y, draw: () => drawFogoDeChao(x, y) });
  FARRAPOS.forEach((id, k) => { const i = PEOPLE.findIndex(p => p.id === id); if (i < 0 || PEOPLE[i].removed) return; const a = Math.PI * (.15 + k * .17), px = x + Math.cos(a) * 130 * (k % 2 ? 1 : -1), py = y + 40 + Math.sin(a) * 30; layers.push({ y: py, draw: () => personDraw(PEOPLE[i].sprite, px, py, false, false, px < x ? 1 : -1) }); });
}
function acampamentoSpot() { if (!farroupilhaNight() || worldOut?.map !== 'vila') return []; return [{ id: 'acampamento', x: ACAMPAMENTO.x, y: ACAMPAMENTO.y + 70, radius: 140, label: mapEvState('farroupilha').done ? 'Acampamento farroupilha' : 'Comemorar o 20 de Setembro', act: playFarroupilha }]; }
// Cena de noite no acampamento: barracas, bandeiras e o fogo de chão no meio da roda.
function drawSceneAcampamento() {
  const s = scene; beginWorld();
  rect(0, 0, W, H, '#0a1028'); for (let i = 0; i < 60; i++) ellipse((i * 197.3) % W, (i * 41.7) % 260, 1.3, 1.3, `rgba(240,236,210,${.3 + .3 * Math.sin(frameClock * 1.6 + i)})`);
  rect(0, 280, W, H - 280, '#1a2614'); for (let x = 0; x < W; x += 80) ellipse(x + 30, 280, 52, 22, '#0e1a10');
  drawBarraca(300, 420, '#c8b890'); drawBarraca(1300, 410, '#b8a880'); drawBarraca(800, 360, '#d0c098'); drawBandeiraRS(1050, 420); drawBandeiraRS(520, 430);
  drawFogoDeChao(800, 560);
  if (s.fireworks) for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2, r = 40 + (frameClock * 80 % 60); ellipse(400 + k % 3 * 400 + Math.cos(a) * r, 140 + Math.sin(a) * r, 3, 3, ['#2a9a4a', '#e83a2a', '#f0d020'][k % 3]); }
  const list = Object.entries(s.actors).map(([id, a]) => ({ y: a.y, draw: () => { if (id === 'sadi') personDraw(avatarSprite(), a.x, a.y, a.walk, true, a.dx); else { const i = PEOPLE.findIndex(p => p.id === id); if (i >= 0) personDraw(PEOPLE[i].sprite, a.x, a.y, a.walk, false, a.dx); } } }));
  list.sort((a, b) => a.y - b.y).forEach(l => l.draw());
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
SCENE_VIEWS.acampamento = drawSceneAcampamento;
function playFarroupilha() {
  const st = mapEvState('farroupilha');
  if (st.done) { worldSay('Viva o 20 de Setembro! O fogo de chão segue aceso até o sol raiar.'); return; }
  if (scene) return; showRpgBox('worldTalk', null); keys.clear(); const saved = { ...G.player };
  const here = FARRAPOS.filter(id => PEOPLE.some(p => p.id === id && !p.removed)), spots = [[620, 530], [710, 470], [890, 470], [980, 530], [660, 610]];
  const steps = [{ view: 'acampamento' }, { actor: 'sadi', x: 930, y: 610, dx: -1 }];
  here.forEach((id, k) => steps.push({ actor: id, x: spots[k][0], y: spots[k][1], dx: spots[k][0] < 800 ? 1 : -1 }));
  steps.push({ fade: 'in', time: 1 },
    { say: 'valter', text: 'Chega, Sadi, puxa um pelego e senta perto do fogo.' },
    { say: 'valter', text: 'Foi num 20 de setembro, em 1835, que os farrapos entraram em Porto Alegre, com o Bento Gonçalves à frente.' },
    { say: 'valter', text: 'Dez anos de guerra contra o Império, por causa de imposto alto no charque e de pouco caso com o Rio Grande.' },
    { say: 'valter', text: 'Em 1845 veio a paz de Ponche Verde. Não ganharam a guerra, mas o gaúcho ganhou o orgulho que tem até hoje.' },
    { say: 'valter', text: 'Por isso, todo setembro, a gente acampa, acende o fogo de chão e lembra de onde veio.' });
  if (here.includes('jayme')) steps.push({ say: 'jayme', text: '“Sirvam nossas façanhas de modelo a toda terra!”' });
  if (here.includes('guri')) steps.push({ say: 'guri', text: 'Bah, tchê, me arrepiei inteiro!' });
  if (here.includes('manolima')) steps.push({ say: 'manolima', text: 'Viva o 20 de Setembro! Viva o Rio Grande!' });
  steps.push({ do: () => { scene.fireworks = true; } }, { say: 'sadi', text: 'Viva! O vô ia gostar de ver a Fronteira assim, reunida.' }, { wait: 1.6 }, { fade: 'out', time: 1.2 });
  playSteps(steps, 'farroupilha', () => {
    G.player = saved; st.done = true; const rw = MAP_EVENTS.farroupilha.reward; grantReward(rw); save(); refreshHUD();
    talk([['card', '<b>🏕️ 20 de Setembro</b><br>A Fronteira comemorou até o sol raiar: verso, gaita, carne no espeto e chimarrão na roda.', 'Semana Farroupilha'], ['reward', rw, '20 de Setembro']], null, 'Receber');
  });
}

// ---------- Festa na laje da Casona ----------
// O andar de baixo da Casona: laje de concreto aberta, pilares, uma churrasqueira e uma mesa só.
WORLD_MAPS['casona:laje'] = interiorMap({
  id: 'casona:laje', name: 'Laje da Casona', W: 1400, H: 820, bounds: { x: 150, y: 270, w: 1100, h: 460 }, door: 600, doorHalf: 520, floor: 'concrete', bg: '#2a3a1e', open: true,
  decor(b) { for (let x = b.x; x < b.x + b.w; x += 40) { const y = b.y - 70 + Math.sin(x / 90) * 10; ellipse(x, y, 5, 6, ['#ffd860', '#ff8a5a', '#8ad8ff'][Math.round((x - b.x) / 40) % 3]); } hallSign(b.x + b.w / 2, b.y - 52, 300, 'FESTA NA LAJE · SHOW DE BOLA', '#2a5a2a'); },
  items: [
    { kind: 'pillar', x: 170, y: 300, w: 28, h: 26 }, { kind: 'pillar', x: 660, y: 300, w: 28, h: 26 }, { kind: 'pillar', x: 170, y: 690, w: 28, h: 26 }, { kind: 'pillar', x: 660, y: 690, w: 28, h: 26 },
    { kind: 'grill', x: 240, y: 300, w: 170, h: 50, label: 'Churrasqueira', text: 'A churrasqueira da Casona: costela, linguiça e coração de galinha no espeto.' },
    { kind: 'table', x: 760, y: 430, w: 220, h: 70 }
  ]
});
const CASONA_HOSTS = { marcio: { x: 300, y: 420 }, marcelo: { x: 400, y: 420 } };
SERVE_EVENTS.casona = { map: 'casona:laje', items: ['chope'], time: 70, end: 'fim da festa', host: 'marcio', target: 10, crowd: 'specials', hosts: ['marcio', 'marcelo'],
  seats: [[740, 560], [870, 560], [1000, 560], [720, 400], [1040, 400], [560, 520], [1120, 620]], bar: [{ item: 'chope', x: 1060, y: 700 }],
  lines: ['É o quê? Chope gelado pra todo mundo! Melhor festa da história da Casona, show de bola!', 'Faltou chope numa mesa ou outra, mas a festa foi show de bola.', 'É o quê? A galera ficou de copo vazio… Na próxima a gente compra um barril maior!'] };
function casonaNight() { const ev = mapEventToday(); return ev?.id === 'casona' && mapNight(); }
function casonaMenu() {
  const st = mapEvState('casona'), i = PEOPLE.findIndex(p => p.id === 'marcio');
  if (st.done) { worldTalkAt = { x: worldOut.x, y: worldOut.y }; showRpgBox('worldTalk', { person: i, name: 'Márcio', reply: 'É o quê? Melhor festa que essa laje já viu!' }); return; }
  talk([['marcio', 'Chegou o chopeiro! A chopeira tá ali na entrada da laje, é o quê?'], ['marcelo', 'Só tem especial hoje, Sadi: capricha no colarinho. Show de bola!']], () => startServe('casona'), 'Começar');
}
{
  const M = WORLD_MAPS['casona:laje'], spots = M.spots, draw = M.draw;
  M.spots = function () { return [...spots.call(this), ...serveSpots(), ...(casonaNight() && !serveActive() ? [{ id: 'casona', x: CASONA_HOSTS.marcio.x + 50, y: CASONA_HOSTS.marcio.y + 40, label: mapEvState('casona').done ? 'Prosear com os gêmeos' : 'Servir chope · falar com o Márcio', act: casonaMenu }] : [])]; };
  M.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers); serveDraw(layers);
    for (const [id, p] of Object.entries(CASONA_HOSTS)) { const i = PEOPLE.findIndex(q => q.id === id); if (i >= 0) layers.push({ y: p.y, draw: () => personDraw(PEOPLE[i].sprite, p.x, p.y + Math.abs(Math.sin(frameClock * 4 + p.x)) * -2, false, false, 1) }); }
    if (Math.floor(frameClock * 3) % 2) fxPuffs?.(325, 250, 1, 30, '#c8c8c8');
    if (!serveActive() && casonaNight()) specialPeople().filter(i => !PEOPLE[i].removed && !['marcio', 'marcelo'].includes(PEOPLE[i].id)).slice(0, 5).forEach((i, k) => { const [x, y] = SERVE_EVENTS.casona.seats[k]; layers.push({ y, draw: () => personDraw(PEOPLE[i].sprite, x, y, false, false, x < 870 ? 1 : -1) }); });
  };
  M.hint = function () { return serveHint(); };
}

// ---------- Ligações com os mapas ----------
{
  const vila = WORLD_MAPS.vila, vspots = vila.spots, vdraw = vila.draw;
  vila.spots = function () { return [...vspots.call(this), ...acampamentoSpot()]; };
  vila.draw = function (view, seen, layers) { vdraw.call(this, view, seen, layers); if (farroupilhaNight()) drawAcampamento(layers, seen); };
  const serra = WORLD_MAPS.serra, sspots = serra.spots;
  serra.spots = function () {
    const list = sspots.call(this);
    if (casonaNight()) { const c = list.find(s => s.id === 'house:marcio'); if (c) { c.label = 'Festa na laje da Casona'; delete c.house; c.act = () => enterInterior('casona:laje'); } }
    return list;
  };
}
