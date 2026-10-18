// Caçada de javalis de verdade: na noite do evento, a cuiudada se reúne em volta do fogo na frente da bodega (cena), cada
// cuiudo vai pra perto de um javali com o lampião, dois deles torcem na beira do tiro aos javalis (tiro.js) e, no fim,
// a vizinhança agradece em volta do fogo (cena completa na primeira vez, curtinha nas outras).
'use strict';

// Quem caça: um cuiudo por javali, na ordem dos lugares da caçada.
const CUIUDOS_CREW = ['arlindo', 'gremio_5', 'inter_5', 'ramiro', 'gremio2_3', 'inter_3', 'anselmo'];
const CUIUDO_LINES = {
  arlindo: ['Ali, Sadi! Atrás daquela touceira. Fuçando que nem trator!', 'A gente toca os bichos pro potreiro e tu atira. Cuidado com o meu chapéu, hein!'],
  gremio_5: ['Psiu! Ele tá ali, tchê. Eu seguro o lampião, tu laça.', 'Não olha pra mim, olha pro bicho!'],
  inter_5: ['Bah, que bicho grande! Já vi menor puxando carroça.', 'O cachaço aguenta dois tiros. Não economiza chumbo!'],
  ramiro: ['Daqui de cima do cavalo eu vejo tudo: é ali, vivente.', 'Mira no olho vermelho: fora da luz do lampião, é o que entrega o bicho.'],
  gremio2_3: ['No meu tempo a gente caçava com cachorro. Agora tem bodegueiro!', 'Dá-lhe, Sadi. Que a lavoura agradece.'],
  inter_3: ['O bicho tá nervoso. Melhor tu do que eu, guri.', 'Lampião aceso e reza braba: tô contigo.'],
  anselmo: ['Esse aí foi o que comeu meu milho. Eu reconheço pela cara de safado.', 'Pega ele, Sadi, pelo amor de Deus!']
};
function cuiudoName(id) { const p = PEOPLE.find(q => q.id === id); return (p?.name || id).split(' · ')[0]; }
function cuiudoAt(b) { const id = CUIUDOS_CREW[b.i % CUIUDOS_CREW.length]; return { id, x: b.x + (b.i % 2 ? -120 : 120), y: b.y + 18, dx: b.i % 2 ? 1 : -1 }; }
function cuiudosGathered() { return !!mapEvState('javali').gathered; }

// ---------- 1. A cuiudada reunida na frente da bodega ----------
function cacaGather() {
  const st = mapEvState('javali'); st.gathered = true; save();
  if (!scenesEnabled()) { showBanner('A cuiudada se espalhou', 'Onde tiver lampião, tem javali perto: chegue no bicho (ou no Valter) e pegue a espingarda.', 'info', { world: true }); return; }
  const c = CUIUDOS, fire = { x: c.x, y: c.y + 60 };
  playSteps([...sceneWorld({ map: 'vila', x: c.x, y: c.y + 40, night: true, fires: [fire] }),
    { actor: 'valter', x: c.x, y: c.y + 10, dx: 1, lamp: true }, { actor: 'anselmo', x: c.x - 110, y: c.y + 50, dx: 1 },
    { actor: 'arlindo', x: c.x + 110, y: c.y + 40, dx: -1, lamp: true }, { actor: 'gremio_5', x: c.x - 90, y: c.y + 130, dx: 1, lamp: true },
    { actor: 'inter_5', x: c.x + 100, y: c.y + 140, dx: -1, lamp: true }, { actor: 'ramiro', x: c.x + 230, y: c.y + 70, dx: -1 },
    { actor: 'sadi', x: c.x - 20, y: c.y + 330, dx: 1, dy: -1 }, { fade: 'in', time: .8 },
    { walk: 'sadi', to: { x: c.x - 10, y: c.y + 190 } },
    { say: 'valter', text: 'Chegou o Sadi! Agora a cuiudada tá completa.' },
    { say: 'anselmo', text: 'Reviraram minha lavoura inteira, Sadi. Milho, mandioca… nem o espantalho escapou.' },
    { say: 'valter', text: 'Javali nem é bicho daqui: veio de fora e virou praga. Por isso é caça com controle, e a carne vai pra comunidade.' },
    { say: 'valter', text: 'Cada um pega um rumo. O Arlindo vai pro pouso dos tropeiros, o Nestor e o Renato pra beira do rio, e o Ramiro rodeia a cavalo.' },
    { say: 'valter', text: 'Onde tiver um cuiudo com lampião, tem javali perto. A gente toca os bichos pro potreiro e tu vai na espingarda do teu vô. Só não acerta o chapéu de ninguém!' },
    { say: 'ramiro', text: 'Bora, que a noite é curta e o bicho é ligeiro!' },
    { do: () => { for (const [id, a] of Object.entries(scene.actors)) if (id !== 'sadi') { a.hop = 8; sceneShout('Bora!', a.x, a.y - 150, '#ffe28a', 16); } AudioEngine.crowd(); } },
    { wait: 1.1 }, sceneSet('valter', { hop: 0 }), sceneSet('anselmo', { hop: 0 }), sceneSet('arlindo', { hop: 0 }), sceneSet('gremio_5', { hop: 0 }), sceneSet('inter_5', { hop: 0 }), sceneSet('ramiro', { hop: 0, speed: 260 }),
    { walk: ['arlindo', 'gremio_5', 'inter_5', 'ramiro'], to: [{ x: c.x + 520, y: c.y - 60 }, { x: c.x - 520, y: c.y + 220 }, { x: c.x + 420, y: c.y + 330 }, { x: c.x + 700, y: c.y + 120 }] },
    { say: 'sadi', text: 'Bueno. Espingarda do vô na mão e coragem no peito!' },
    { fade: 'out', time: .7 }], 'caca-reuniao', () => showBanner('A cuiudada se espalhou', 'Onde tiver lampião, tem javali perto: chegue no bicho (ou no Valter) e pegue a espingarda.', 'info', { world: true }));
}

// ---------- 2. No mapa: um cuiudo com lampião perto de cada javali ----------
function cuiudoTalk(c) {
  const i = PEOPLE.findIndex(p => p.id === c.id); worldTalkAt = { x: worldOut.x, y: worldOut.y };
  showRpgBox('worldTalk', { person: i, name: cuiudoName(c.id), reply: pick(CUIUDO_LINES[c.id] || ['Tá ali, Sadi!']) });
}
function cuiudoSpots() {
  if (!javaliNight() || worldOut?.map !== 'vila' || !cuiudosGathered()) return [];
  return javaliList().map(b => { const c = cuiudoAt(b); return { id: 'cuiudo:' + b.i, x: c.x, y: c.y, radius: 60, label: 'Falar com ' + cuiudoName(c.id) + ' (caçada)', act: () => cuiudoTalk(c) }; });
}
function drawCuiudos(layers, seen) {
  if (!javaliNight() || !cuiudosGathered()) return;
  for (const b of javaliList()) { const c = cuiudoAt(b); if (!seen(c.x, c.y)) continue; const i = PEOPLE.findIndex(p => p.id === c.id);
    layers.push({ y: c.y, draw: () => { personDraw(PEOPLE[i].sprite, c.x, c.y, false, false, c.dx); if (c.id !== 'ramiro') { rect(c.x + 20 * c.dx - 2, c.y - 96, 4, 28, '#5a3a20'); ellipse(c.x + 20 * c.dx, c.y - 100, 7, 9, '#ffcf6a'); } ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(c.x + 20 * c.dx, c.y - 100, 120, .28 + .05 * Math.sin(frameClock * 6 + b.i), '255,200,110'); ctx.restore(); } });
  }
}

// ---------- 3. No tiro aos javalis: dois cuiudos torcendo com o lampião, na beira do campo ----------
function drawShootCrowd(sh) {
  const ids = ['arlindo', 'valter'], hop = sh.cheer > 0 ? sh.cheer : 0;
  [[96, 772, 1], [SHOOT.W - 96, 772, -1]].forEach(([x, y, dx], k) => {
    const i = PEOPLE.findIndex(p => p.id === ids[k]), up = hop ? Math.abs(Math.sin(performance.now() / 80 + k)) * 18 : 0; if (i < 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x + 22 * dx, y - 110 - up, 150, .28, '255,200,110'); ctx.restore();
    ctx.save(); ctx.scale(1, 1); personDraw(PEOPLE[i].sprite, x, y - up, false, false, dx); ctx.restore();
    rect(x + 22 * dx - 2, y - 112 - up, 4, 28, '#5a3a20'); ellipse(x + 22 * dx, y - 116 - up, 7, 9, '#ffcf6a');
  });
}

// ---------- 4. O agradecimento em volta do fogo ----------
function cacaThanks(rw, kills, after = null) {
  const c = CUIUDOS, fire = { x: c.x, y: c.y + 60 }, first = !G.cacaThanked; G.cacaThanked = (G.cacaThanked || 0) + 1; save();
  const receive = () => talk(after || [['reward', rw, 'Invasão de javalis · concluída']], null, 'Receber');
  if (!scenesEnabled()) { talk([['valter', 'Bah, Sadi! ' + kills + ' javalis! A lavoura do Seu Anselmo tá salva.'], ['reward', rw, 'Invasão de javalis · concluída']], null, 'Receber'); return; }
  const javalis = (layers) => [[c.x - 160, c.y + 120, 1], [c.x + 170, c.y + 110, -1], [c.x - 300, c.y + 160, 1]].slice(0, Math.max(1, Math.min(3, kills))).forEach(([x, y, d]) => layers.push({ y, draw: () => drawJavali(x, y, d, 0, 1.3, true) }));
  const cast = [{ actor: 'valter', x: c.x, y: c.y + 10, dx: 1, lamp: true }, { actor: 'anselmo', x: c.x - 120, y: c.y + 40, dx: 1 },
    { actor: 'arlindo', x: c.x + 120, y: c.y + 30, dx: -1, lamp: true }, { actor: 'gremio_5', x: c.x - 240, y: c.y + 70, dx: 1, lamp: true },
    { actor: 'inter_5', x: c.x + 240, y: c.y + 80, dx: -1, lamp: true }, { actor: 'ramiro', x: c.x + 340, y: c.y + 20, dx: -1 }, { actor: 'sadi', x: c.x - 10, y: c.y + 250, dx: 1, dy: -1 }];
  const cheer = (text) => ({ do: () => { for (const [id, a] of Object.entries(scene.actors)) if (id !== 'sadi') { a.hop = 10; sceneShout(text, a.x, a.y - 150, '#ffe28a', 16); } fxStars(c.x, c.y - 40, 8); AudioEngine.crowd(); AudioEngine.heart(); } });
  const calm = { do: () => { for (const a of Object.values(scene.actors)) a.hop = 0; } };
  const lines = first ? [
    { say: 'anselmo', text: 'Sadi! Os cuiudos me contaram tudo: ' + kills + ' javalis, um atrás do outro, com a espingarda do teu vô!' },
    { say: 'anselmo', text: 'Aquela lavoura é tudo que eu tenho. Os bichos reviravam o milho toda noite, e eu ali, de mãos atadas…' },
    { say: 'valter', text: 'O guri atira que nem o velho Sadi atirava. E nenhum chapéu furado… quase!' },
    cheer('Viva o Sadi!'), { wait: 1.4 }, calm,
    { say: 'ramiro', text: 'Mira firme e cabeça fria. Respeito, vivente!' },
    { say: 'anselmo', text: 'A vizinhança fez uma vaquinha pra ti. E quando a lavoura der, a primeira espiga de milho é tua.' },
    { say: 'valter', text: 'E o javali não vai pro lixo: amanhã a comunidade faz javali no rolete pra quem ajudou.' },
    { say: 'sadi', text: 'Bah, gente… obrigado. Bodega é isso: vizinho ajudando vizinho.' },
    cheer('Bah!'), { wait: 1.6 }, calm, { fade: 'out', time: .9 }
  ] : [
    { say: 'valter', text: 'De novo a cuiudada salvou a Fronteira: ' + kills + ' javalis!' },
    { say: 'anselmo', text: 'Obrigado mais uma vez, Sadi. A lavoura respira!' },
    cheer('Viva!'), { wait: 1.2 }, calm, { fade: 'out', time: .7 }
  ];
  playSteps([...sceneWorld({ map: 'vila', x: c.x, y: c.y + 60, night: true, fires: [fire], props: javalis }), ...cast, { fade: 'in', time: .9 }, ...lines], 'caca-agradecimento', receive);
}

// ---------- Ligações ----------
{
  const tick = outsideTick;
  outsideTick = function (dt) { tick(dt); if (worldOut?.map === 'vila' && javaliNight() && !cuiudosGathered() && !scene && !modal && !worldTalkOpen() && !G.lasso && storyCalm()) cacaGather(); };
  // Na noite da caçada, quem está na cuiudada não passeia pela estrada ao mesmo tempo.
  const sw = spawnWalkers; spawnWalkers = function (M) { sw(M); if (javaliNight() && cuiudosGathered()) worldWalkers = worldWalkers.filter(w => !CUIUDOS_CREW.includes(PEOPLE[w.person]?.id)); };
  const wk = walkersKey; walkersKey = function (M) { return wk(M) + (javaliNight() && cuiudosGathered() ? ':caca' : ''); };
  const vila = WORLD_MAPS.vila, spots = vila.spots, draw = vila.draw;
  vila.spots = function () { return [...spots.call(this), ...cuiudoSpots()]; };
  vila.draw = function (view, seen, layers) { draw.call(this, view, seen, layers); drawCuiudos(layers, seen); };
  const scene0 = drawShootScene; drawShootScene = function () { scene0(); if (shoot) drawShootCrowd(shoot); };
  const tick0 = shootTick; shootTick = function (dt) { if (shoot?.cheer > 0) shoot.cheer -= dt; tick0(dt); };
  const fire = shootFire;
  shootFire = function () {
    const s = shoot, before = s?.kills ?? 0, friendly = s?.friendly ?? 0; fire(); if (!s) return;
    if (s.kills > before) { s.cheer = .9; s.fx.push({ x: pick([200, SHOOT.W - 200]), y: 600, text: pick(['Boa, Sadi!', 'Isso, guri!', 'Bah, que tiro!', 'É disso que eu falo!']), color: '#ffe28a', life: 1.2 }); }
    else if (s.friendly > friendly) s.fx.push({ x: SHOOT.W - 200, y: 600, text: 'Ô, cuidado aí!', color: '#ff9a8a', life: 1.2 });
  };
  // Meta batida: em vez do recado curto do Valter, a cena em volta do fogo e depois o placar com a recompensa.
  const end = endShoot;
  endShoot = function (quit = false) {
    const st = mapEvState('javali'), s = shoot, finishing = s && !s.over && !st.done && s.kills >= SHOOT.need, keepTalk = talk; let lines = null;
    if (finishing && scenesEnabled()) talk = (l) => { lines = l; };
    try { end(quit); } finally { talk = keepTalk; }
    if (lines) cacaThanks(lines.find(l => l[0] === 'reward')?.[1] || MAP_EVENTS.javali.reward, s.kills, lines.filter(l => l[0] !== 'valter'));
  };
}
