// A história do vô: capítulos que fecham o jogo com emoção.
//   9 · A gaita do vô: o Valter guardou a gaita; o Seu Otto, avô do Loli, conserta em Pomerode; ela volta para a bodega.
//  10 · O baú do vô: no Pouso de tropeiros, o baú com a foto da bodega em 1968 e uma carta que nunca foi enviada.
//  11 · A carta para a vó: a carta é para a vó Helga, de Pomerode. A Dona Erna, avó do Loli, era irmã dela.
//  13 · Bodega lendária (depois da Oktoberfest, o 12), e no fim um sonho: “O último trago”, servido pelo vô no balcão de 1968.
'use strict';

function voState() { return (G.vo ??= {}); }
const GAITA_COST = 300;
function gaitaGoal() {
  const v = voState();
  if (!v.gaita) return 'Peça a gaita do vô ao Valter, na casa dele (Fronteira)';
  if (v.gaita === 'found') return 'Leve a gaita ao Seu Otto, na casa do Loli, em Pomerode (conserto: ' + money(GAITA_COST) + ')';
  if (v.gaita === 'repair') return G.day >= v.gaitaDay ? 'Busque a gaita consertada na casa do Loli, em Pomerode' : 'O Seu Otto está consertando a gaita: volte em Pomerode no dia ' + dayNumber(v.gaitaDay);
  return 'Leve a gaita de volta para a bodega';
}
{
  const at = MISSIONS.findIndex(m => m.id === 'lendaria');
  MISSIONS.splice(at, 0,
    { id: 'gaita', chapter: 9, title: 'A gaita do vô', giver: 'jayme', visit: true, callWhere: 'casa do Jayme, na Fronteira', get needs() { return voState().gaita ? 'loligebien' : 'valter'; }, where: 'Casa do Valter → casa do Loli, em Pomerode → bodega',
      when: () => bodegaLevel() >= 4, waitText: () => 'quando a bodega chegar ao nível 4 (agora: nível ' + bodegaLevel() + ')',
      intro: [['jayme', 'Vivente, teu vô tinha uma gaita de oito baixos que fazia o CTG inteiro levantar.'], ['jayme', 'Quando ele se foi, o Valter guardou a gaita. O fole rasgou, mas o coração dela segue lá dentro.'], ['jayme', 'Busca com o Valter e leva pro velho Otto, o avô do Loli, lá em Pomerode: ninguém conserta gaita como ele.']],
      goal: gaitaGoal, done: () => voState().gaita === 'ready' && !worldOut,
      reward: { cash: 250, xp: 120, rep: 6, decor: 'gaita' }, onDone: () => { decorState().prateleira = true; }, outroBy: 'jayme',
      outro: [['jayme', 'Ouve isso, Sadi… é o mesmo vanerão que o teu vô tocava no CTG.'], ['valter', 'Bah… parece que o velho tá aqui no galpão de novo.'], ['jayme', '“Gaita que volta pra casa nunca mais desafina.” Pendura ela na parede, que ela é da bodega.']] },
    { id: 'bau', chapter: 10, title: 'O baú do vô', giver: 'valter', where: 'Pouso de tropeiros, na Fronteira',
      when: () => bodegaLevel() >= 5, waitText: () => 'quando a bodega chegar ao nível 5 (agora: nível ' + bodegaLevel() + ')',
      intro: ['Arrumando o meu galpão, achei isto: a chave do baú do teu vô.', 'Antes da bodega, ele foi tropeiro. Deixou o baú no Pouso de tropeiros e dizia que ali guardava o que era mais dele.'],
      goal: () => 'Abra o baú do vô no Pouso de tropeiros, na Fronteira', done: () => !!voState().bau,
      reward: { cash: 200, xp: 100, rep: 4 }, outro: ['Então era ali que ele guardava as coisas dele… A foto de 1968! Olha a cara de guapo do velho.', 'E essa carta… nunca foi aberta. Acho que ela tem dono, guri.'] },
    { id: 'carta', chapter: 11, title: 'A carta para a vó', giver: 'sadi', needs: 'loligebien', where: 'Santa Catarina, casa do Loli',
      intro: [['sadi', 'A carta é para a vó Helga, de Pomerode… e nunca foi enviada.'], ['sadi', 'O Loli vive falando da Oma dele, a Dona Erna, de uma família antiga de Pomerode. Será que ela conheceu a vó?']],
      goal: () => 'Leve a carta do vô à casa do Loli, em Pomerode', done: () => voState().carta === 'delivered',
      reward: { cash: 250, xp: 150, rep: 8, friend: { loligebien: 15 } }, outroBy: 'loligebien',
      outro: [['loligebien', 'Primo! Ja, primo! A Oma não para de chorar de alegria.'], ['loligebien', 'Quando tu vier na Oktoberfest, tu é da família, viu? Chope por conta da casa… quer dizer, da minha casa!']] }
  );
  // O sonho fica para a noite, com a bodega fechada (não no meio do expediente).
  const lend = MISSIONS.find(m => m.id === 'lendaria'); lend.chapter = 13; lend.finale = () => { G.voDream = true; save(); };
  // Saves que já tinham começado a bodega lendária: os capítulos novos do vô vêm antes dela.
  const migrate = migrateMissions; migrateMissions = function () { migrate(); if (G.missions?.lendaria?.status === 'active' && !G.missions.gaita) delete G.missions.lendaria; };
  const story = storyTick; storyTick = function () { story(); if (G.voDream && G.phase === 'closed' && !worldOut && storyCalm()) { G.voDream = false; playUltimoTrago(); } };
}

// ---------- Cenas ----------
// Baú no Pouso de tropeiros: lampião, tábuas e o baú aberto.
function drawSceneBau() {
  const s = scene; beginWorld();
  rect(0, 0, W, H, '#1a120c'); rect(160, 120, W - 320, 300, '#5a3a22'); for (let x = 160; x < W - 160; x += 70) rect(x, 120, 6, 300, '#3a2414');
  rect(160, 420, W - 320, H - 420, '#6a4a2a'); for (let y = 440; y < H; y += 46) rect(160, y, W - 320, 3, '#4a3018');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(980, 300, 260, .22, '255,190,100'); ctx.restore(); rect(974, 250, 12, 40, '#3a2a1a'); ellipse(980, 300, 16, 20, '#ffcf6a');
  rect(860, 560, 220, 110, '#7a4a24', 8, '#3a2414'); rect(860, 600, 220, 10, '#c8a040'); rect(850, 470, 240, 90, '#8a5a2a', 8, '#3a2414'); rect(950, 610, 40, 30, '#c8a040', 4);
  for (const [id, a] of Object.entries(s.actors)) if (id === 'sadi') personDraw(avatarSprite(), a.x, a.y, a.walk, true, a.dx);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
// Sala da casa do Loli: papel de parede, janela e a mesa da Oma.
function drawSceneCasaLoli() {
  const s = scene; beginWorld();
  rect(0, 0, W, H, '#2a2018'); rect(160, 100, W - 320, 320, '#e8dcc0'); for (let x = 190; x < W - 160; x += 60) for (let y = 120; y < 410; y += 60) ellipse(x, y, 6, 6, '#c8b890');
  rect(700, 150, 200, 150, '#7a9ab8', 6, '#5a3a20'); rect(797, 150, 6, 150, '#5a3a20'); rect(160, 420, W - 320, H - 420, '#a87a4a');
  rect(560, 520, 480, 60, '#8a5a2a', 6, '#3a2414'); rect(600, 500, 400, 20, '#f4f0e6', 4);
  const list = Object.entries(s.actors).map(([id, a]) => ({ y: a.y, draw: () => {
    if (id === 'sadi') personDraw(avatarSprite(), a.x, a.y, a.walk, true, a.dx);
    else if (id === 'erna') { ctx.save(); ctx.filter = 'grayscale(.5) brightness(1.05)'; personDraw(3, a.x, a.y, a.walk, false, a.dx); ctx.restore(); rect(a.x - 14, a.y - 128, 28, 8, '#e8e8e8', 4); }
    else { const i = PEOPLE.findIndex(p => p.id === id); if (i >= 0) personDraw(PEOPLE[i].sprite, a.x, a.y, a.walk, false, a.dx); }
  } }));
  list.sort((a, b) => a.y - b.y).forEach(l => l.draw());
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
// O sonho: a bodega inteira em sépia, como na foto de 1968. A cor vai numa demão só por cima do quadro pronto
// (um ctx.filter em cada desenho levava mais de um segundo por quadro e travava a cena).
function drawSceneSonho() {
  const ph = G.phase, mo = G.morning; G.phase = 'prep'; G.morning = 420;
  try { draw(); } finally { ctx.setTransform(1, 0, 0, 1, 0, 0); G.phase = ph; G.morning = mo; }
  const w = canvas.width, h = canvas.height; ctx.save();
  ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = .85; ctx.fillStyle = '#7a5532'; ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .22; ctx.fillStyle = '#d8b07a'; ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
function drawVo(x, y, dx = -1) {
  personDraw(avatarSprite(), x, y, false, false, dx);
  rect(x - 26, y - 128, 52, 7, '#3a2a1a', 3); rect(x - 15, y - 146, 30, 20, '#4a3424', 6);
}
SCENE_VIEWS.bau = drawSceneBau; SCENE_VIEWS.casaLoli = drawSceneCasaLoli; SCENE_VIEWS.sonho = drawSceneSonho;
{
  const speaker = sceneSpeaker;
  sceneSpeaker = function (who) {
    if (who === 'vo') return { portrait: '<span style="display:inline-block;filter:sepia(1)">' + portraitFromSprite(avatarSprite(), 104) + '</span>', name: 'Vô Sadi' };
    if (who === 'erna') return { portrait: '<span class="portrait portrait-phone" style="width:104px;height:104px">👵</span>', name: 'Dona Erna' };
    return speaker(who);
  };
  const layersHook = sceneLayers;
  sceneLayers = function (layers) { layersHook(layers); if (scene?.view === 'sonho') for (const [id, a] of Object.entries(scene.actors)) if (id === 'vo') layers.push({ y: a.y, draw: () => drawVo(a.x, a.y, a.dx) }); };
}
function playBau() {
  if (scene) return; showRpgBox('worldTalk', null); keys.clear(); const saved = { ...G.player };
  playSteps([{ view: 'bau' }, { actor: 'sadi', x: 640, y: 720, dx: 1 }, { fade: 'in', time: 1 },
    { say: 'sadi', text: 'É aqui… o baú do vô.' }, { do: () => AudioEngine.creak() }, { walk: 'sadi', to: { x: 790, y: 700 } },
    { say: 'sadi', text: 'O chapéu de tropeiro dele, uma espora gasta… e uma foto.' }, { overlay: 'photo' },
    { say: 'sadi', text: 'A bodega em 1968. O vô atrás do balcão, igualzinho a mim.' },
    { say: 'sadi', text: 'E uma carta, fechada, com selo e tudo: “Para Helga Schmidt, Pomerode”.' },
    { overlay: 'note', text: 'Nunca enviada. No envelope, com a letra do vô:<br><br><i>“Pra quando eu tiver coragem.”</i>' },
    { say: 'sadi', text: 'A vó Helga… Por que ele nunca mandou?' }, { fade: 'out', time: 1 }], 'bau',
    () => { G.player = saved; const v = voState(); v.bau = G.day; G.relics ??= {}; G.relics.foto1968 = G.day; save(); refreshHUD(); });
}
function playCarta() {
  if (scene) return; showRpgBox('worldTalk', null); keys.clear(); const saved = { ...G.player };
  playSteps([{ view: 'casaLoli' }, { actor: 'sadi', x: 560, y: 720, dx: 1 }, { actor: 'loligebien', x: 820, y: 720, dx: -1 }, { fade: 'in', time: .8 },
    { say: 'loligebien', text: 'Oma! Vem ver: o Sadi trouxe uma carta antiga.' }, { actor: 'erna', x: 1200, y: 700, dx: -1 }, { walk: 'erna', to: { x: 980, y: 700 } },
    { say: 'erna', text: 'Helga Schmidt… era a minha irmã mais velha.' },
    { overlay: 'note', text: 'Helga, minha flor de Pomerode,<br><br>O galpão tá aceso e a gaita não toca igual sem ti. A Fronteira é longe da tua serra, mas o caminho eu faço a pé se for preciso.<br><br>Volta pra casa. O mate te espera morno.<br><br>— Sadi, 1968' },
    { say: 'erna', text: 'Ela voltou pra Fronteira uma semana depois de ele escrever isto. Nunca precisou ler: ele foi buscar ela a cavalo.' },
    { say: 'erna', text: 'Então tu é o neto da Helga… Tem os olhos dela.' },
    { say: 'loligebien', text: 'Ja?! Então a gente é primo, Sadi! Eu sabia que tinha coisa nesse sorriso!' },
    { say: 'erna', text: 'Toma: o retrato do casamento deles. O lugar dele é na bodega.' },
    { say: 'sadi', text: 'Obrigado, Dona Erna… tia Erna.' }, { fade: 'out', time: 1 }], 'carta',
    () => { G.player = saved; voState().carta = 'delivered'; G.relics ??= {}; G.relics.retrato = G.day; save(); refreshHUD(); });
}
// O último trago: depois da bodega lendária, um sonho com o vô no balcão de 1968.
function playUltimoTrago() {
  if (!scenesEnabled()) { G.storyEnd = G.day; save(); return; }
  playSteps([{ caption: 'Naquela noite, depois da festa, o Sadi sonhou…', time: 2.8 },
    { view: 'sonho' }, { do: () => { worldOut = null; G.player = { ...G.player, x: ENTRY.x, y: ENTRY.y - 60, dx: 0, dy: -1, walk: false }; } }, { actor: 'vo', x: 1250, y: 742, dx: -1 }, { fade: 'in', time: 1.6 },
    { say: 'vo', text: 'Chegou, guri. Fecha a porta, que hoje a bodega é só nossa.' },
    { say: 'sadi', text: 'Vô…?' },
    { say: 'vo', text: 'O galpão tá aceso de novo. Do jeito que eu sonhava: freguês na mesa, gaita na parede, mate na roda.' },
    { say: 'vo', text: 'Consertou a minha gaita, abriu o meu baú, levou a carta pra Helga… Tu fez o que eu não tive tempo de fazer.' },
    { say: 'sadi', text: 'Eu só queria que o senhor visse.' },
    { say: 'vo', text: 'Eu vi, guri. Vi cada dia. Do balcão a gente enxerga tudo.' },
    { do: () => AudioEngine.glass() },
    { say: 'vo', text: 'Agora senta. O último trago da noite é por conta da casa.' },
    { say: 'sadi', text: 'Saúde, vô.' },
    { say: 'vo', text: 'Saúde. E cuida bem dela: bodega é que nem amizade, se não abre todo dia, enferruja.' },
    { fade: 'out', time: 2 }, { caption: 'O último trago', time: 3 }], 'ultimoTrago',
    () => { G.storyEnd = G.day; save(); talk([['card', '<b>Fim da história do vô</b><br>Obrigado por jogar! A bodega continua aberta: freguesia, eventos, roça e o Rio Grande inteiro seguem te esperando.', 'O último trago']], null, 'Seguir na bodega'); });
}

// ---------- Ligações com as casas e o Pouso ----------
{
  const wrap = (id, fn) => { const M = WORLD_MAPS[id], spots = M.spots; M.spots = function () { const list = spots.call(this); fn(list); return list; }; };
  wrap('casa:valter', list => {
    const h = list.find(s => s.id === 'home:valter'); if (!h || !missionActive('gaita') || voState().gaita) return;
    h.label = 'Pedir a gaita do vô ao Valter'; h.act = () => talk([['valter', 'A gaita do teu vô… guardei embrulhada num pelego, embaixo da cama.'], ['valter', 'O fole tá rasgado, mas o Otto, lá de Pomerode, faz milagre. Leva, guri: ela é tua.']], () => { voState().gaita = 'found'; floatNote('🪗 A gaita do vô está com o Sadi.'); save(); }, 'Levar a gaita');
  });
  wrap('casa:loligebien', list => {
    const h = list.find(s => s.id === 'home:loligebien'), v = voState(); if (!h) return;
    if (missionActive('gaita') && v.gaita === 'found') { h.label = 'Levar a gaita para o Seu Otto (' + money(GAITA_COST) + ')'; h.act = () => { if (!hasCash(GAITA_COST)) { warnDialog('Conserto da gaita', 'O Seu Otto cobra ' + money(GAITA_COST) + ' pelo fole novo. Junte o dinheiro e volte.'); return; } spendCash(GAITA_COST); v.gaita = 'repair'; v.gaitaDay = G.day + 2; save(); talk([['loligebien', 'Opa Otto! O Sadi trouxe uma gaita de oito baixos, das antigas!'], ['loligebien', 'Ele disse que em dois dias o fole tá novo, ja. Volta no dia ' + dayNumber(v.gaitaDay) + '!']], null, 'Combinado'); }; }
    else if (missionActive('gaita') && v.gaita === 'repair' && G.day >= v.gaitaDay) { h.label = 'Buscar a gaita consertada'; h.act = () => { v.gaita = 'ready'; save(); talk([['loligebien', 'Olha que beleza! O Opa disse que é a gaita mais bonita que passou pela oficina dele.'], ['loligebien', 'Leva pra bodega, Sadi. Ela quer tocar!']], null, 'Levar pra bodega'); }; }
    else if (missionActive('carta') && v.carta !== 'delivered') { h.label = 'Mostrar a carta do vô'; h.act = playCarta; }
  });
  const vila = WORLD_MAPS.vila, vspots = vila.spots;
  vila.spots = function () { const list = vspots.call(this), p = list.find(s => s.id === 'pouso'); if (p && missionActive('bau') && !voState().bau) { p.label = 'Abrir o baú do vô'; p.act = playBau; delete p.info; } return list; };
}
