// Arco "A Casona dividida": a Brigada veio por causa do barulho e o Márcio, caído de amores pela Soldado Grazi, entregou
// o sonzão do tio Lori de mão beijada pra brigadiana. O Marcelo não perdoou: fita crepe no meio da sala e cada um no seu
// lado. O Sadi:
//   1. entra na Casona e vê a briga (cena dentro da Casona de verdade); o Márcio pede 5 opalas da caverna pra um anel;
//   2. traz as opalas do fundo da caverna (do andar 6 pra baixo) e São Dunstano, que foi ourives, monta o anel;
//   3. acha o Marcelo chutando bola sozinho no campinho e convence ele escolhendo as falas certas (errou demais, ele
//      cansa e só conversa no outro dia);
//   4. leva o anel pro Márcio na Casona: ensaiam o pedido, a Grazi chega, aceita, devolve o sonzão (volume seis) e os
//      gêmeos tiram a fita crepe da sala.
'use strict';

const GEMEOS_CAMPINHO = { x: 2960, y: 1290 }, GEMEOS_PATIENCE = 3, GEMEOS_OPALAS = 5;
function gemeosState() { G.gemeos ??= { v: 2, stage: 0 }; if (G.gemeos.v !== 2) G.gemeos = { v: 2, stage: G.gemeos.stage >= 5 ? 5 : 0 }; return G.gemeos; }
function gemeosStage() { return G.gemeos?.v === 2 ? G.gemeos.stage || 0 : G.gemeos?.stage >= 5 ? 5 : 0; }
// Começa depois de uns dias de bodega, com a Serra e a caverna abertas e um pouco de amizade com os gêmeos.
function gemeosReady() {
  if (gemeosStage() || prologueActive() || !G.tutorial?.complete || regionLocked('serra') || bodegaDays() < 9 || !caveOpen()) return false;
  const f = id => G.friends[PEOPLE.findIndex(p => p.id === id)] || 0; return Math.max(f('marcio'), f('marcelo')) >= 10;
}
function gemeosFighting() { const s = gemeosStage(); return s >= 1 && s < 5; }
function gemeosRingReady() { return gemeosStage() === 1 && !G.gemeos?.ring && bagQty('opala') >= GEMEOS_OPALAS; }

// ---------- Falas com escolha ----------
// Cada pergunta tem uma resposta certa; as outras arrancam uma reação e a pergunta volta. Errou demais: ele cansa.
const GEMEOS_ROUNDS = {
  marcelo: [
    { q: 'Veio defender o Márcio, é? Ele ENTREGOU o sonzão pra Brigada, Sadi! é o que?', a: [
      ['Vim porque tu é meu amigo. E porque o Márcio tá de coração partido.', '…Coração partido? Aquele lá? Hmpf. Senta aí, então.', true],
      ['O som tava alto demais mesmo. A vizinhança agradece.', 'A vizinhança que compre um sonzão pra ela!'],
      ['Bah, tu chuta mal, hein.', 'Muito engraçado, Sadi. Bem o que eu precisava hoje.']] },
    { q: 'É o que? A brigadiana que pediu pra baixar o volume e ele disse: “eu falei, do portonzon pra cá quem manda é nós, é marcio e marcelo”. É o quê?!', a: [
      ['Ele vai pedir ela em namoro com um anel de opala. Eu mesmo busquei as pedras na caverna.', 'Tu desceu na caverna por ele?! …Bah. Então é sério mesmo.', true],
      ['A Grazi é bonita. Eu também entregava.', 'Tu também?! Ninguém mais tem juízo nesta Serra!'],
      ['Esquece o Márcio e compra outro sonzão.', 'Outro?! Aquele era herança do tio Lori, guri!']] },
    { q: 'E o sonzão? Vai ficar apodrecendo no depósito da Brigada?', a: [
      ['Se o pedido der certo, a cunhada brigadiana devolve o sonzão. E tu ganha uma cunhada!', '…Cunhada brigadiana. Ninguém mais chama a polícia pra Casona. Tá bom, Sadi: eu volto pra casa.', true],
      ['Melhor ele ficar lá. É bom pra todo mundo.', 'Pra todo mundo menos pra laje, tchê.'],
      ['Eu busco de volta de noite, escondido.', 'Tá louco? Aí quem vai em cana é tu!']] }
  ],
  ensaio: [
    { q: 'O Márcio, nervoso, com o anel na mão: “Show de bola, ma Como é que eu começo, Sadi?”', a: [
      ['Fala do coração: que desde aquela noite tu não pensa em outra coisa.', null, true],
      ['Começa pedindo desculpa pelo barulho.', 'Márcio: Desculpa pelo barulho? Aí ela me multa de novo, é o quê!'],
      ['Liga o som no último pra chamar a atenção dela.', 'Márcio e Marcelo: Não! Foi assim que tudo começou!']] }
  ]
};
let gemeosRound = null;
function gemeosAsk(who, set, onDone) {
  gemeosRound = { who, set, n: 0, wrong: 0, onDone, said: null };
  gemeosQuestion();
}
function gemeosQuestion() {
  const r = gemeosRound, Q = GEMEOS_ROUNDS[r.set][r.n], i = PEOPLE.findIndex(p => p.id === r.who), speaker = r.who === 'sadi' ? '' : `<div class="rpg-speaker">${portraitHTML(i, 88)}<div><p><b>${PEOPLE[i].name}</b></p><p>${Q.q}</p></div></div>`;
  const reply = r.said ? `<div class="callout choice-reply">${r.said}</div>` : '', order = Q.order ??= shuffle(Q.a.map((_, k) => k));
  const opts = order.map(k => `<button class="choice" data-act="gemeosChoice" data-id="${k}">${Q.a[k][0]}</button>`).join('');
  openDialog(r.who === 'sadi' ? 'Na sala da Casona' : 'Conversa com ' + PEOPLE[i].name, `${speaker || `<p>${Q.q}</p>`}${reply}<p class="small-note">O que o Sadi diz?</p><div class="choice-list">${opts}</div>`, 'gemeosChoice');
}
function gemeosChoice(k) {
  const r = gemeosRound; if (!r) return; const Q = GEMEOS_ROUNDS[r.set][r.n], [said, reply, good] = Q.a[Number(k)] || [];
  if (!said) return;
  if (good) {
    AudioEngine.heart(); r.n++; r.said = reply ? '<b>' + (r.who === 'sadi' ? '' : PEOPLE[PEOPLE.findIndex(p => p.id === r.who)].name + ':</b> ') + reply : null;
    if (r.n >= GEMEOS_ROUNDS[r.set].length) { const done = r.onDone, last = r.said; gemeosRound = null; closeDialog(true); done?.(true, last); return; }
    gemeosQuestion(); return;
  }
  AudioEngine.bad(); r.wrong++; r.said = (r.who === 'sadi' ? '' : '<b>' + PEOPLE[PEOPLE.findIndex(p => p.id === r.who)].name + ':</b> ') + reply;
  if (r.who !== 'sadi' && r.wrong >= GEMEOS_PATIENCE) { const done = r.onDone, who = r.who; gemeosRound = null; closeDialog(true); done?.(false, who); return; }
  gemeosQuestion();
}

// ---------- Cenas (na Casona e no campinho de verdade) ----------
const CASONA_DOOR = { x: 700, y: 900 };
// A Grazi de farda: o quepe da Brigada por cima.
function drawGrazi(a, y) {
  personDraw(PEOPLE.find(p => p.id === 'grazi').sprite, a.x, y, a.walk, false, a.dx, false, 0, a.dy || 0);
  rect(a.x - 17, y - 132, 34, 11, '#2a3a4a', 4, '#141c26'); rect(a.x - 20, y - 123, 40, 5, '#1a242e', 2); ellipse(a.x, y - 127, 4, 4, '#e8c040');
}
const GRAZI_ACTOR = { draw: drawGrazi };
function casonaView(extra = {}) { return sceneWorld({ map: 'casa:marcio', x: 900, y: 700, ...extra }); }
// 1. A Casona dividida: a briga por causa do sonzão e o pedido das opalas.
function gemeosStart() {
  const st = gemeosState(); st.stage = 1; st.day = G.day; save();
  showRpgBox('worldTalk', null); keys.clear();
  const after = () => talk([['dica', 'Traga <b>' + GEMEOS_OPALAS + ' opalas</b> da caverna da Serra (do andar 6 pra baixo). Com elas, <b>São Dunstano</b>, que foi ourives, monta o anel do Márcio.', 'A Casona dividida']], null, 'Bora pra caverna');
  if (!scenesEnabled()) { after(); return; }
  playSteps([{ caption: 'A Casona dividida', time: 1.8 }, ...casonaView(),
    { actor: 'marcio', x: 900, y: 700, dx: 1 }, { actor: 'marcelo', x: 1130, y: 700, dx: -1 }, { actor: 'sadi', x: CASONA_DOOR.x, y: CASONA_DOOR.y - 20, dx: 1, dy: -1 }, { fade: 'in', time: .6 },
    { walk: 'sadi', to: { x: 820, y: 760 } },
    { say: 'sadi', text: 'Ô de casa! …Que fita crepe é essa no meio da sala?' },
    { say: 'marcelo', text: 'É o que? é a fronteira agora Sadi. Daqui pra lá é do Márcio, daqui pra cá é meu. Ele ficou com os malbec e eu com o marmorezão top. Não pisa na linha!' },
    { say: 'sadi', text: 'E cadê o sonzão? Só sobrou a marca de pó no chão.' },
    { say: 'marcelo', text: 'Pergunta pro marcio! E o que? A Brigada veio por causa do barulho, três da manhã. E ele deu o sonzão pra brigadiana!' },
    { say: 'marcio', text: 'Ela pediu pra baixar o volume E me olhou com um zóinho.' },
    { say: 'marcio', text: 'Eu disse: “show de bola, leva o sonzon então e o que moça? Leva ele e leva o meu coração junto.” E ela levou. O sonzão..' },
    { say: 'marcelo', text: 'Trocou o sonzon! Vou chutar uma bola, que é melhor. E o que? show de bola' },
    { do: () => AudioEngine.creak() }, sceneSet('marcelo', { speed: 210 }), { walk: 'marcelo', to: { x: 760, y: 760 } }, { walk: 'marcelo', to: { x: CASONA_DOOR.x, y: CASONA_DOOR.y + 40 } }, { do: () => { delete scene.actors.marcelo; AudioEngine.thud(); } },
    { say: 'marcio', text: 'Bah… nunca fiquei sozinho na cazona, e o que?' },
    { say: 'marcio', text: 'V pedir a Grazi em namoro. Com anel e tudo, que nem em novela, show de bola' },
    { say: 'marcio', text: 'Dizem que lá no fundo da caverna da Serra tem opala, aquela pedra que brilha que nem arco-íris. Me traz cinco? Anel de opala é o quê? Show de bola!' },
    { say: 'sadi', text: '(Opala lá no fundo… o São Dunstano deve saber onde fica. E ele foi ourives!)' }, { fade: 'out', time: .6 }], 'gemeos-1', after);
}
// 2. Na forja: São Dunstano monta o anel com as cinco opalas.
function gemeosMakeRing() {
  if (!dunstanShopOpen() || !gemeosRingReady()) return;
  bagTake('opala', GEMEOS_OPALAS); const st = gemeosState(); st.ring = true; st.stage = 2; save(); closeDialog(true); AudioEngine.caveAnvil?.(); AudioEngine.heart();
  talk([['dunstano', 'Antes de santo, fui ourives. Ouro velho, cinco opalas… pronto. Quando a luz bate, parece aurora em cima da Serra.'], ['dunstano', 'Diz pro teu amigo: anel bonito abre a conversa, mas quem conserta a família é a conversa.'], ['dica', 'Anel pronto! Agora acha o <b>Marcelo</b>: brabo, ele vai <b>chutar bola sozinho</b> no campinho da Serra.', 'A Casona dividida']], null, 'Guardar o anel');
}
// 3. O Marcelo no campinho, chutando bola sozinho.
function gemeosFindMarcelo() {
  const st = gemeosState();
  const say = text => { const i = PEOPLE.findIndex(p => p.id === 'marcelo'); worldTalkAt = { x: worldOut.x, y: worldOut.y }; showRpgBox('worldTalk', { person: i, name: 'Marcelo', reply: text }); };
  if (st.stage < 2) { say('Nem vem, Sadi. Enquanto o sonzon tiver na Brigada, eu não falo com ninguém da Casona. Se quiser que eu volto cache e passagem ida e volta, cache e passagem ida e volta e o que?'); return; }
  if (st.stage >= 3) return;
  if (st.tired === G.day) { say('Hoje não, Sadi. Volta amanhã, que hoje eu tô com a cabeça quente, show de bola.'); return; }
  const ask = () => gemeosAsk('marcelo', 'marcelo', ok => {
    if (!ok) { st.tired = G.day; save(); talk([['marcelo', 'Deixe queto Sadi. Hoje não tem conversa. Volta amanhã. E o que?']], null, 'Tentar amanhã'); return; }
    st.stage = 3; save();
    talk([['marcelo', 'Show de bola, Eu volto pra Casona. Mas se essa brigadiana aparecer, eu quero o meu sonzão de volta!'], ['dica', 'Leve o <b>anel</b> pro <b>Márcio</b>, na Casona.', 'A Casona dividida']], null, 'Ir até a Casona');
  });
  if (st.met || !scenesEnabled()) { st.met = true; save(); ask(); return; }
  st.met = true; save(); showRpgBox('worldTalk', null); keys.clear();
  const c = GEMEOS_CAMPINHO, ball = layers => { const k = frameClock * .9, tri = k % 2 < 1 ? k % 1 : 1 - k % 1, bx = c.x + 40 + tri * 260, h = Math.abs(Math.sin(k * Math.PI)) * 50; layers.push({ y: c.y + 4, draw: () => { ellipse(bx, c.y + 4, 12, 4, '#00000033'); ellipse(bx, c.y - 8 - h, 11, 11, '#f8f8f0'); ellipse(bx - 3, c.y - 10 - h, 3, 3, '#2a2a2a'); } }); };
  playSteps([...sceneWorld({ map: 'serra', x: c.x + 120, y: c.y, props: ball }), { actor: 'marcelo', x: c.x, y: c.y, dx: 1 }, { actor: 'sadi', x: c.x + 460, y: c.y + 60, dx: -1 }, { fade: 'in', time: .6 },
    { wait: 1.4 }, { walk: 'sadi', to: { x: c.x + 170, y: c.y + 40 } },
    { say: 'marcelo', text: 'Goool… Sozinho não tem graça nenhuma. O Márcio é que ia no gol.' },
    { say: 'sadi', text: 'Marcelo! Tava te procurando pela Serra inteira.' }, { fade: 'out', time: .4 }], 'gemeos-2', ask);
}
// 4. Na Casona: o ensaio, a Grazi chega, o pedido, o sonzão volta e a fita crepe sai da sala.
function gemeosFinale() {
  const st = gemeosState(); if (st.stage !== 3) return; st.stage = 4; save(); showRpgBox('worldTalk', null); keys.clear();
  if (!scenesEnabled()) { gemeosAsk('sadi', 'ensaio', () => gemeosEnd()); return; }
  const cast = [{ actor: 'marcio', x: 900, y: 700, dx: 1 }, { actor: 'marcelo', x: 1130, y: 700, dx: -1 }];
  playSteps([...casonaView(), ...cast, { actor: 'sadi', x: CASONA_DOOR.x, y: CASONA_DOOR.y - 20, dx: 1, dy: -1 }, { fade: 'in', time: .5 },
    { walk: 'sadi', to: { x: 820, y: 760 } },
    { say: 'sadi', text: 'Márcio! O anel. Cinco opalas, montado pelo próprio São Dunstano.' },
    { do: () => { fxStars(860, 650, 8); AudioEngine.caveGem?.(); } },
    { say: 'marcio', text: 'É o quê?! Que coisa mais linda… Marcelo, olha isso!' },
    { say: 'marcelo', text: 'Hmpf. É show de bola. Mas eu só falo contigo depois que o sonzão voltar.' }], 'gemeos-anel', () => gemeosAsk('sadi', 'ensaio', () => playSteps([...casonaView(), ...cast.map(a => ({ ...a })), { actor: 'sadi', x: 820, y: 760, dx: 1 }, { fade: 'in', time: .2 },
    { say: 'marcio', text: '“Desde aquela noite eu não penso em outra coisa…” Isso! Agora é só ela…' },
    { do: () => { AudioEngine.doorChime(); [0, 220, 440].forEach(t => setTimeout(() => AudioEngine.thud(), t)); } }, { wait: .8 },
    { actor: 'grazi', ...GRAZI_ACTOR, x: CASONA_DOOR.x, y: CASONA_DOOR.y + 30, dx: 1, dy: -1 }, { walk: 'grazi', to: { x: 780, y: 740 } },
    { say: 'grazi', text: 'Boa noite. Brigada Militar. Recebi uma denúncia… de saudade, no endereço de: Casona.' },
    { say: 'marcio', text: 'Fui eu que denunciei, Grazi. É o que? Saudade de ti.' },
    { walk: 'marcio', to: { x: 840, y: 730 } },
    { say: 'marcio', text: 'Desde aquela noite eu não penso em outra coisa. Aceita namorar comigo?' },
    { do: () => { fxStars(810, 640, 10); AudioEngine.caveGem?.(); } },
    { say: 'grazi', text: '…Com anel de opala podre de chiques e tudo? Aceito!' },
    { do: () => { fxHearts(810, 600, 5); AudioEngine.heart(); } },
    { say: 'grazi', text: 'E tem mais: o sonzon tava no depósito do batalhão. Trouxe de volta. Volume máximo seis, combinado?' },
    { do: () => { const s = gemeosState(); s.stage = 5; fxPuffs(1230, 790, 10, 120, '#e8dcc0'); AudioEngine.ready(); } },
    { say: 'marcelo', text: 'O sonzão! Voltou! Grazi… bem-vinda à família. Cunhada brigadiana, show de bola!' },
    { walk: 'marcelo', to: { x: 960, y: 720 } },
    { say: 'marcelo', text: 'Desculpa márcio. Bora tirar essa fita crepe da sala hoje mesmo? show de bola' },
    { say: 'marcio', text: 'Bora! E desculpa por entregar o sonzão. Foi o coração que falou mais alto que o som.' },
    { do: () => { for (const a of Object.values(scene.actors)) a.hop = 9; fxHearts(900, 600, 6); AudioEngine.crowd(); } }, { wait: 1.6 }, { fade: 'out', time: .8 }], 'gemeos-pedido', () => gemeosEnd())));
}
function gemeosEnd() {
  const st = gemeosState(); st.stage = 5; st.doneDay = G.day;
  const rw = { cash: 80, xp: 160, rep: 4, friend: { marcio: 15, marcelo: 15 } }; grantReward(rw); save(); refreshHUD();
  talk([['card', '<b>🔊 A Casona inteira de novo</b><br>A Grazi aceitou o anel de opala, o sonzão do tio Lori voltou do depósito da Brigada (volume seis, combinado) e a fita crepe saiu da sala.', 'A Casona dividida · fim'], ['reward', rw, 'A Casona dividida']], null, 'Show de bola!');
}

// ---------- Mapa, painel e Casona ----------
function gemeosTracker() {
  const s = gemeosStage(), t = (goal) => ({ icon: '🔊', title: 'A Casona dividida', goal, kind: 'side' });
  if (!s && gemeosReady()) return t('Os gêmeos da Casona brigaram: passe na Casona, na Serra');
  if (s === 1) return t(bagQty('opala') >= GEMEOS_OPALAS ? 'Leve as ' + GEMEOS_OPALAS + ' opalas podres de chique a São Dunstano, na ferraria do primeiro andar da caverna' : 'Traga ' + GEMEOS_OPALAS + ' opalas da caverna (do andar 6 pra baixo) pro anel do Márcio (' + Math.floor(bagQty('opala')) + '/' + GEMEOS_OPALAS + ')');
  if (s === 2) return t('Ache o Marcelo: brabo, ele vai chutar bola sozinho no campinho da Serra');
  if (s === 3 || s === 4) return t('Leve o anel ao Márcio, na Casona');
  return null;
}
function gemeosSpots(map) {
  const s = gemeosStage(), list = [];
  if (map === 'serra' && (s === 1 || s === 2)) list.push({ id: 'gemeos:marcelo', x: GEMEOS_CAMPINHO.x, y: GEMEOS_CAMPINHO.y + 30, radius: 110, label: 'Marcelo · chutando bola sozinho', act: gemeosFindMarcelo });
  if (map === 'casa:marcio' && (s === 3 || s === 4)) list.push({ id: 'gemeos:marcio', x: 960, y: 700, radius: 90, label: 'Entregar o anel ao Márcio', act: gemeosFinale });
  return list;
}
function drawGemeosWorld(layers, seen) {
  const s = gemeosStage(); if (s !== 1 && s !== 2) return; const { x, y } = GEMEOS_CAMPINHO; if (!seen(x, y)) return;
  const i = PEOPLE.findIndex(p => p.id === 'marcelo'), t = frameClock, bx = x + 50 + Math.abs(Math.sin(t * 1.4)) * 90, bh = Math.abs(Math.sin(t * 2.8)) * 26;
  layers.push({ y, draw: () => personDraw(PEOPLE[i].sprite, x, y, false, false, 1) });
  layers.push({ y: y + 2, draw: () => { ellipse(bx, y + 4, 10, 4, '#00000033'); ellipse(bx, y - 8 - bh, 10, 10, '#f8f8f0'); ellipse(bx - 2, y - 10 - bh, 3, 3, '#2a2a2a'); } });
}
// Fita crepe no meio da sala e a marca de pó do sonzão enquanto os gêmeos estão brigados.
function drawCasonaSplit(layers) {
  if (!gemeosFighting()) return;
  layers.push({ y: 545, draw: () => { rect(1004, 540, 12, 320, '#e8d8a0'); for (let y = 548; y < 860; y += 30) rect(1004, y, 12, 2, '#c8b880'); txt('MÁRCIO ←', 950, 566, 12, '#5a3418', 'center', 'Georgia', false); txt('→ MARCELO', 1072, 566, 12, '#5a3418', 'center', 'Georgia', false); } });
}

{
  // Brigado, o Marcelo não passeia pela rua nem fica em casa: até voltar convencido, ele só aparece no campinho.
  const away = () => gemeosFighting() && gemeosStage() < 3;
  const sw = spawnWalkers; spawnWalkers = function (M) { sw(M); if (gemeosFighting()) worldWalkers = worldWalkers.filter(w => PEOPLE[w.person]?.id !== 'marcelo'); };
  const wk = walkersKey; walkersKey = function (M) { return wk(M) + ':g' + gemeosStage(); };
  // Brigados, os gêmeos não fazem festa na laje.
  const casonaReq = MAP_EVENTS.casona?.requires; if (casonaReq) MAP_EVENTS.casona.requires = () => casonaReq() && !gemeosFighting();
  const tl = trackerLines; trackerLines = function () { const base = tl(), g = gemeosTracker(); if (!g) return base; if (base.length < 2) base.push(g); else if (base[1].kind !== 'story') base[1] = g; return base; };
  // Convencido, o Marcelo volta pra Casona: os dois esperam em casa o Sadi chegar com o anel.
  const home = atHome; atHome = function (id) { if (id === 'marcelo' && away()) return false; if (['marcio', 'marcelo'].includes(id) && [3, 4].includes(gemeosStage())) return true; return home(id); };
  const avail = visitorAvailable; visitorAvailable = function (i, extra = []) { if (PEOPLE[i]?.id === 'marcelo' && gemeosFighting()) return false; return avail(i, extra); };
  // A Casona é o arco principal dos gêmeos: pedidos de itens deles esperam ela acabar.
  MAIN_ARC_CHECKS.push(id => id === 'marcio' && (gemeosReady() || gemeosFighting()));
  const serra = WORLD_MAPS.serra, ssp = serra.spots, sdraw = serra.draw;
  serra.spots = function () { return [...ssp.call(this), ...gemeosSpots('serra')]; };
  serra.draw = function (view, seen, layers) { sdraw.call(this, view, seen, layers); drawGemeosWorld(layers, seen); };
  const C = WORLD_MAPS.casona, csp = C.spots, cdraw = C.draw, enter = C.onEnter;
  C.spots = function () { const g = gemeosSpots('casa:marcio'); return [...g, ...csp.call(this).filter(sp => !(g.length && sp.id === 'home:marcio'))]; };
  const twin = anyTwin; anyTwin = function () { return away() ? 'marcio' : twin(); };
  C.draw = function (view, seen, layers) { cdraw.call(this, view, seen, layers); drawCasonaSplit(layers); };
  // Na Casona, assim que não tiver nenhuma conversa aberta, a briga aparece.
  C.onEnter = function () { if (gemeosReady()) return; enter?.call(this); };
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (worldOut?.map === 'casa:marcio' && gemeosReady() && !scene && !modal && !worldTalkOpen() && !G.lasso) gemeosStart(); };
  // O sonzão some da sala enquanto ele está na Brigada.
  const som = C.items?.find(i => i.kind === 'som');
  if (som) { Object.defineProperty(som, 'text', { get: () => gemeosFighting() ? 'Só a marca de pó no chão: o Márcio entregou o sonzão pra brigadiana.' : 'Sonzão da Casona, herança do tio Lori. Agora com um adesivo da Brigada: volume máximo, seis.', configurable: true }); }
  const furnSom = FURN.som; if (furnSom) FURN.som = function (i) { if (gemeosFighting()) { ctx.save(); ctx.setLineDash([8, 6]); ctx.strokeStyle = '#8a7a64'; ctx.lineWidth = 2; ctx.strokeRect(i.x, i.y, i.w, i.h); ctx.restore(); return; } return furnSom(i); };
}
