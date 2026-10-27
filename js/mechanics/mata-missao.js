// A mata no jogo inteiro: o capítulo 2, "O fantasma de camisa vermelha", a missão secundária "A Batalha de Laguna", o
// butiá que cura em qualquer briga e a prosa dos fregueses sobre a mata.
//   · Capítulo 2, logo depois do trago de pura: de noite, quando o Sadi sai pra rua, o Olmiro, o último tropeiro, chega a
//     cavalo e conta do fantasma de camisa vermelha que ensinou ele a secar erva no barbaquá. A estrada da Serra abre e,
//     no fim dela, a Mata de Araucárias. O capítulo é só chegar lá: termina na cena de chegada com o Garibaldi.
//   · Prosando de novo com o Garibaldi, ele conta a história dele e começa a missão secundária: descer a mata até a barra
//     de Laguna e vencer o navio imperial. A "Bodega lendária" (último capítulo) só começa depois dela.
//   · Butiá: cura um pouco de vida, no cinto da caverna e no bornal da mata. Os butiazeiros dão pouco e demoram a carregar.
//   · Os especiais comentam no balcão o que o Sadi anda fazendo na mata.
// Arma, vida e resistência são da ferraria do São Dunstano: o chapéu de aba larga e as botas de garrão valem na mata.
'use strict';

const BUTIA_HEAL = 20;
const BUTIA_ITEM = { id: 'butia', name: 'Butiá', icon: '🟠', art: 'butia', heal: BUTIA_HEAL, desc: 'Butiá maduro do butiazeiro: recupera ' + BUTIA_HEAL + ' de vida em qualquer briga.' };
const PITANGA_ITEM = { id: 'pitanga', name: 'Pitanga', icon: '🍒', art: 'pitanga', heal: BUTIA_HEAL, desc: 'Pitanga madura da pitangueira: recupera ' + BUTIA_HEAL + ' de vida em qualquer briga.' };
const HEAL_FRUITS = [BUTIA_ITEM, PITANGA_ITEM];
function mataAberta() { return !!missionState('fantasma') || !!G.mataSeen || !!G.mata?.metGaribaldi; }

// ---------- Capítulo 2: o fantasma de camisa vermelha ----------
MISSIONS.push({ id: 'fantasma', chapter: 2, title: 'O fantasma de camisa vermelha', giver: 'olmiro', where: 'Mata de Araucárias, no fim da estrada da Serra',
  // Começa com o Olmiro, de noite, na rua da Fronteira (não com a conversa de capítulo do Valter).
  direct: () => olmiroFantasma(), when: () => olmiroReady(), waitText: () => 'de noite, na rua da Fronteira: o Olmiro, o último tropeiro, passa a cavalo',
  start: () => unlockRegion('serra'),
  goal: () => 'Siga a estrada da Serra até o fim e entre na Mata de Araucárias',
  done: () => !!G.mata?.metGaribaldi, reward: { cash: 60, xp: 40, rep: 1, unlock: 'Mata de Araucárias e o refúgio do Garibaldi' }, outroBy: 'garibaldi',
  outro: ['Volta e senta no fogo quando quiser, gaúcho. Tenho muito causo pra te contar.'] });
// ---------- Missão secundária: a Batalha de Laguna ----------
MISSIONS.push({ id: 'laguna', title: 'A Batalha de Laguna', giver: 'garibaldi', side: true, when: () => false, where: 'Mata adentro, do pinheiral até a barra de Laguna',
  goal: () => 'Desça a mata até a barra de Laguna e vença o navio imperial' + (G.mata?.deepest > 1 ? ' · mais fundo: ' + TRECHO_BIOME_NAMES[trechoBiome(Math.min(G.mata.deepest, TRECHO.last + 1))] : ''),
  done: () => !!G.mata?.laguna?.won, reward: { cash: 300, xp: 250, rep: 6 }, outroBy: 'garibaldi',
  outro: ['Tu foi do meu pinheiral até a barra de Laguna, gaúcho. Nem eu, nos tempos de farrapo, andei tanto a pé.', 'Diz pro Olmiro que o fantasma de camisa vermelha agora descansa. E que a erva dele segue boa.'] });
{
  // A "Bodega lendária" espera a Batalha de Laguna.
  const L = MISSIONS.find(m => m.id === 'lendaria');
  if (L) { const when = L.when; L.when = () => (!when || when()) && missionDone('laguna'); L.waitText = () => 'depois da Batalha de Laguna (missão secundária do Garibaldi, na Mata de Araucárias)'; }
}
// O Olmiro passa na rua da Fronteira de noite, depois do trago de pura.
function olmiroReady() {
  if (!G.missions || missionState('fantasma') || !missionDone('trago') || prologueActive() || tutorialActive() || scene || modal || worldTalkOpen() || paused) return false;
  return worldOut?.map === 'vila' && worldNight();
}
function olmiroFantasma() {
  const m = MISSIONS.find(x => x.id === 'fantasma'), p = { x: worldOut.x, y: worldOut.y };
  const lines = [
    ['olmiro', 'Buenas noites, bodegueiro! Olmiro Mimoso, tropeiro. O último que sobrou nesses caminhos.'],
    ['sadi', 'Buenas! Tá tarde pra tropear, seu Olmiro.'],
    ['olmiro', 'Tropeiro dorme onde a noite pega. Mas hoje parei pra te contar um causo, que o teu vô gostava dos meus.'],
    ['olmiro', 'Lá pra cima, onde a estrada da Serra termina, tem um pinheiral fechado. Ninguém entra.'],
    ['olmiro', 'Uma vez, tocando uma tropa, me perdi lá dentro. E perto de um fogo, encontrei um homem de camisa vermelha… meio transparente.'],
    ['sadi', 'Um fantasma?!'],
    ['olmiro', 'Me deu mate e me ensinou a secar erva no barbaquá, com fumaça de nó de pinho. Disse que tinha lutado com os farrapos.'],
    ['olmiro', 'Quando acordei, o fogo era cinza fria. Mas a erva tava lá, sequinha, no meu bornal.'],
    ['olmiro', 'Se um dia tu subir a Serra, vai até o fim da estrada. Diz pro homem de camisa vermelha que o Olmiro mandou lembranças.']
  ];
  const start = () => { startMission(m); talk([['dica', '<b>📖 Capítulo 2 · O fantasma de camisa vermelha</b><br>' + m.goal() + '.<br><i>Onde: ' + m.where + '</i><br><br>A estrada da Serra abriu: segue a estrada da Fronteira pra direita e vai até o fim dela.<br><br>Recompensa:' + rewardHTML(m.reward), 'História · capítulo 2']], null, 'Bora!'); };
  if (!scenesEnabled()) { G.missions.fantasma = { status: 'offered', day: G.day }; talk(lines, () => { delete G.missions.fantasma; start(); }, 'Vou lembrar'); return; }
  const horse = (a, y) => mountedPose('olmiro-mounted-v1', a.x, y, a.dx, a.dy || 0, !!a.walk);
  G.missions.fantasma = { status: 'offered', day: G.day };
  playSteps([...sceneWorld({ map: 'vila', x: p.x, y: p.y - 40, night: .45, lights: [{ x: p.x, y: p.y - 80, r: 220, a: .2 }] }),
    { actor: 'sadi', x: p.x, y: p.y, dx: -1 }, { actor: 'olmiro', x: p.x - 620, y: p.y + 10, dx: 1, draw: horse }, { fade: 'in', time: .5 },
    { do: () => { for (let k = 0; k < 6; k++) setTimeout(() => AudioEngine.thud?.(), k * 260); } },
    sceneSet('olmiro', { speed: 170 }), { walk: 'olmiro', to: { x: p.x - 150, y: p.y + 10 } }, sceneSet('olmiro', { walk: false }),
    ...lines.map(([say, text]) => ({ say, text })),
    sceneSet('olmiro', { dx: -1, speed: 190 }), { walk: 'olmiro', to: { x: p.x - 800, y: p.y + 10 } }, { fade: 'out', time: .5 }], 'olmiro-fantasma', () => { delete G.missions.fantasma; start(); });
}
// Segunda prosa com o Garibaldi: a história dele, e começa a missão secundária da descida até Laguna.
function garibaldiHistoria() {
  G.mata.historia = G.day; caveState().hp = caveMaxHp(); save();
  const m = MISSIONS.find(x => x.id === 'laguna');
  talk([['garibaldi', 'O Olmiro te mandou? O tropeiro perdido! Ainda seca a erva do jeito que eu ensinei?'],
    ['sadi', 'Seca sim, e mandou lembranças. Mas me conta: quem é o senhor, afinal?'],
    ['garibaldi', 'Antes do Sul eu já era marinheiro, e brigava por gente que queria ser livre. Cheguei aqui e achei os farrapos.'],
    ['garibaldi', 'Comandei os barcos da República na Lagoa dos Patos. Em 1839 a gente levou os lanchões por terra até o mar e tomou Laguna.'],
    ['garibaldi', 'Foi lá que conheci a Anita. E foi lá, em 15 de novembro, que a esquadra do Império retomou a barra. Pus fogo nos meus barcos pra não entregar.'],
    ['garibaldi', 'Depois veio Ponche Verde, a paz, e o resto da vida em outras guerras. Mas a alma ficou presa aqui, no Sul.'],
    ['garibaldi', 'Toda noite, o navio do capitão Mariath volta pra barra de Laguna. Enquanto ele rondar, eu não descanso.'],
    ['garibaldi', 'Se tu descer a mata inteira, pinheiral, encosta e restinga, até o mar, a gente acerta essa conta junto.'],
    ['dica', '<b>🌲 Missão secundária: A Batalha de Laguna</b><br>' + m.goal() + '.<br><br>Arma, vida e resistência se melhoram na ferraria do São Dunstano (e com o Garibaldi).<br><br>Recompensa:' + rewardHTML(m.reward), 'Nova missão']],
    () => startMission(m), 'Bora');
}

// ---------- Prosa de balcão sobre a mata ----------
const MATA_PROSE = [
  { id: 'olmiro', when: () => !!missionState('fantasma'), lines: {
    _: [['', 'Dizem que o Olmiro viu um fantasma de camisa vermelha no pinheiral do fim da Serra. Tropeiro inventa cada uma!'], ['', 'Tu acredita no causo do Olmiro? Fantasma secando erva no barbaquá… Bah!']],
    valter: [['', 'O Olmiro te contou do fantasma do pinheiral? Meu avô contava a mesma história: um homem de camisa vermelha que dava mate pros tropeiros perdidos.']],
    manolima: [['', 'O Olmiro e o fantasma de camisa vermelha… Tropeei com o Olmiro: mentiroso ele não é. Exagerado, talvez.']] } },
  { id: 'garibaldi', when: () => !!G.mata?.metGaribaldi, lines: {
    _: [['Encontrei o fantasma do pinheiral.', 'Bah! E era mesmo o Garibaldi? O das figurinhas?'], ['', 'Me contaram que tu prosa com um fantasma lá na Serra. Tu tá bem, Sadi?']],
    jayme: [['', 'Garibaldi, herói de dois mundos… e agora de mais um, o dos fantasmas. Isso dá pajada!']] } },
  { id: 'cachaco', when: () => !!G.mata?.cachaco, lines: {
    _: [['', 'Bah, é verdade que tu derrubou o Cachaço? Dizem que era do tamanho de um boi!'], ['', 'O Javali Cachaço! Meu tio jurava que esse bicho virava carreta no pinheiral.']],
    peixinhonabrasa: [['', 'Javali do tamanho de um boi? Traz a costela que eu ponho na brasa, hehe!']] } },
  { id: 'lanceiro', when: () => !!G.mata?.folks?.lanceiro, lines: {
    jayme: [['', 'Os Lanceiros Negros… Pouca gente conta essa parte da história. Ainda bem que tu ouviu.']],
    baitaca: [['', 'Tô fazendo uma música sobre os Lanceiros Negros. Depois tu me conta o que ouviu lá no fogo?']] } },
  { id: 'papo', when: () => !!G.mata?.papo, lines: {
    _: [['', 'Me contaram que tu enfrentou um lagarto do tamanho de uma canoa na descida da Serra!'], ['', 'O papo-amarelo! Minha vó dizia que ele guardava o caminho pro mar.']] } },
  { id: 'laguna', when: () => !!G.mata?.laguna?.won, lines: {
    _: [['', 'Dizem que o navio fantasma não aparece mais na barra de Laguna. Foi tu, Sadi?'], ['', 'Tu e o Garibaldi em Laguna! Isso vai pro jornal, tchê.']],
    indavirus: [['', 'Manchete do Indavírus: bodegueiro gaúcho manda navio fantasma embora de Laguna! Ja!']],
    peixinhonabrasa: [['', 'Barco levado por terra até o mar? Isso eu quero ver no meu trapiche!']],
    valter: [['', 'Teu vô ia ter orgulho de ti, guri. O fantasma do pinheiral, enfim descansando.']] } }
];
function mataProseLine(person) {
  const id = PEOPLE[person]?.id; if (!id) return null; G.mataProse ??= {}; const said = G.mataProse[id] ??= [];
  for (const m of [...MATA_PROSE].reverse()) {
    if (said.includes(m.id) || !m.when()) continue;
    const list = m.lines[id] || m.lines._; if (!list) continue;
    said.push(m.id); const [player, reply] = pick(list); return { id: 'mata:' + m.id, player, reply, title: 'Prosa de balcão' };
  }
  return null;
}

// ---------- Butiá e pitanga: curam em qualquer briga ----------
function healFruit(id) { return HEAL_FRUITS.find(f => f.id === id) || null; }
function fruitQty(id) { return Math.floor(bagQty(id)); }
function butiaQty() { return fruitQty('butia'); }
function healFruits() { return HEAL_FRUITS.filter(f => fruitQty(f.id) > 0); }
function butiaUse(hpOf, maxOf, refresh, id = 'butia') {
  if (fruitQty(id) < 1) return false; const st = caveState(), p = worldOut, name = healFruit(id).name.toLowerCase();
  if (st.hp >= maxOf()) { floatNote('Vida cheia: guarda ' + (id === 'butia' ? 'o ' : 'a ') + name + ' pra hora do aperto.'); return false; }
  st.hp = Math.min(maxOf(), st.hp + BUTIA_HEAL); bagTake(id, 1); effect('+' + BUTIA_HEAL + ' ❤ ' + name, p.x, p.y - 140, id === 'butia' ? '#ffd27a' : '#ff9a8a', 18); fxHearts?.(p.x, p.y - 120, 2); AudioEngine.caveHeal?.(); save(); refresh(); return true;
}
function butiaIconHTML(size, id = 'butia') { return `<span style="display:inline-flex;width:${size}px;height:${size}px;align-items:center;justify-content:center">${itemIconHTML(id)}</span>`; }

// ---------- Ligações ----------
{
  // O Olmiro chega pelo capítulo (missionsTick). Saves de antes: quem já tinha achado a mata segue com o capítulo, e
  // quem já ouviu a história do Garibaldi segue com a Batalha de Laguna.
  const tick = outsideTick; outsideTick = function (dt) {
    tick(dt); if (!G.missions) return;
    if (!missionState('fantasma') && (G.mataSeen || G.mata?.metGaribaldi)) { G.missions.fantasma = { status: 'active', day: G.day }; save(); }
    if (!missionState('laguna') && G.mata?.historia) { G.missions.laguna = { status: G.mata?.laguna?.won ? 'done' : 'active', day: G.day }; save(); }
  };
  // Antes da missão, a estrada da Serra termina num pinheiral fechado.
  const serra = WORLD_MAPS.serra, edge = serra.edge; let warned = 0;
  serra.edge = function (p) {
    const r = edge.call(this, p);
    if (r?.map === 'mata' && !mataAberta()) { if (performance.now() - warned > 4000) { warned = performance.now(); worldSay('A estrada termina num pinheiral fechado e escuro. O povo diz que é assombrado: sem um bom motivo, ninguém entra.'); AudioEngine.bad?.(); } return null; }
    return r;
  };
  // A segunda prosa com o Garibaldi conta a história dele.
  const talkG = garibaldiTalk; garibaldiTalk = function () { if (G.mata?.metGaribaldi && !G.mata.historia && !missionState('laguna')) { garibaldiHistoria(); return; } return talkG(); };
  // Os especiais comentam a mata no balcão (cada novidade, uma vez por pessoa).
  const prose = nextProse; nextProse = function (person) { if (Math.random() < .5) { const l = mataProseLine(person); if (l) return l; } return prose(person); };
  // Butiá e pitanga no cinto da caverna e no bornal da mata.
  const caveBelt = caveBeltItems; caveBeltItems = function () { const list = caveBelt(); list.unshift(...healFruits()); return list.slice(0, CAVE_BELT); };
  caveBeltRefresh = function () {
    const el = $('caveBelt'); if (!el) return; const on = inCave() && !scene && !caveDefeatActive(), list = on ? caveBeltItems() : [];
    el.classList.toggle('hidden', !list.length);
    const html = list.map((i, k) => `<button type="button" data-act="caveUse" data-id="${i.id}" title="${i.name}"><small>${k + 1}</small><span>${healFruit(i.id) ? butiaIconHTML(42, i.id) : caveItemIcon(i)}</span><em>${healFruit(i.id) ? fruitQty(i.id) : caveBag()[i.id]}</em></button>`).join('');
    if (el.dataset.html !== html) { el.dataset.html = html; el.innerHTML = html; }
  };
  const caveU = caveUse; caveUse = function (id) { if (healFruit(id)) { if (!inCave() || caveDefeatActive() || scene) return false; return butiaUse(() => caveState().hp, caveMaxHp, caveBeltRefresh, id); } return caveU(id); };
  const mataBelt = mataBeltItems; mataBeltItems = function () { const list = mataBelt(); list.unshift(...healFruits()); return list.slice(0, 5); };
  mataBeltRefresh = function () {
    const el = $('mataBelt'); if (!el) return; const on = mataHere() && !scene && G?.mata, list = on ? mataBeltItems() : [];
    el.classList.toggle('hidden', !list.length);
    const html = list.map((i, k) => `<button type="button" data-act="mataUse" data-id="${i.id}" title="${i.name}"><small>${k + 1}</small>${healFruit(i.id) ? butiaIconHTML(42, i.id) : mataGearHTML(i.id, 42)}<em>${healFruit(i.id) ? fruitQty(i.id) : mataBag()[i.id]}</em></button>`).join('');
    if (el.dataset.html !== html) { el.dataset.html = html; el.innerHTML = html; }
  };
  const mataU = mataUseItem; mataUseItem = function (id) { if (healFruit(id)) { if (!mataHere() || scene || modal) return false; return butiaUse(() => caveState().hp, caveMaxHp, mataBeltRefresh, id); } return mataU(id); };
  // A ferraria do São Dunstano vale na mata também.
  for (const [id, desc] of [['chapeu', 'Aba firme com barbicacho: 15% menos dano em cada pancada, na caverna e na mata.'], ['botas', 'Couro macio de garrão: anda 15% mais ligeiro na caverna e na mata.'], ['lampiao', 'Clareia bem mais longe no escuro da caverna e da mata fechada.'], ['bornal', 'Cabe o dobro: até 10 de cada item do bolicho e 6 de cada no bornal da mata.'], ['guaiaca', 'Cinto de tropeiro com bolso: +30% de moedas dos baús, na caverna e na mata.']]) { const u = CAVE_UPGRADES.find(x => x.id === id); if (u) u.desc = desc; }
  const speaker = sceneSpeaker; sceneSpeaker = function (who) { return who === 'olmiro' ? { person: PEOPLE.findIndex(p => p.id === 'olmiro'), name: 'Olmiro Mimoso' } : speaker(who); };
}

// ---------- Desmaio: a mesma queda da caverna, e só volta no outro dia ----------
// Caiu na mata adentro (ou no navio): o mundo congela, o Sadi tomba e a tela escurece com a frase da caverna; depois
// acorda no refúgio (ou na praia de Laguna). Desmaiou na mata ou na caverna, só volta lá no dia seguinte.
let mataDefeat = null;
function mataDefeatActive() { return !!mataDefeat && mataDefeat.game === G; }
function mataLockedToday() { return G.mata?.faintDay === G.day; }
function caveLockedToday() { return G.cave?.faintDay === G.day; }
const MATA_LOCK_TEXT = 'O corpo ainda dói do desmaio: mata adentro, só amanhã. Descansa e volta com o dia novo.';
function mataDefeatOverlay() {
  let el = $('caveDefeat'); if (!el) { el = document.createElement('section'); el.id = 'caveDefeat'; el.className = 'cave-defeat'; el.setAttribute('role', 'status'); el.innerHTML = '<p>às vezes é morto quem peleia</p>'; document.body.appendChild(el); }
  return el;
}
function drawMataDefeatedPlayer(x, y) {
  const t = clamp(mataDefeat.t / 1.1, 0, 1), ease = t * t * (3 - 2 * t), sprite = avatarSprite();
  ctx.save(); ctx.translate(x + ease * 22, y - ease * 8); ctx.rotate(ease * Math.PI * .48);
  if (sprite === 0) expansionSprite('sadi-combat-v1', 7, 0, 0, 124, false, expansionRowHeight('sadi-combat-v1', 4, 4));
  else { const crop = characterCrop(sprite), width = 124 * crop.w / crop.h; ctx.drawImage(characterFrame(sprite, 124), -width / 2, -124, width, 124); }
  ctx.restore(); return true;
}
{
  const faint = mataFaint; mataFaint = function () {
    if (mataDefeatActive()) return; const N = mataNight; if (!N || N.faint) return;
    mataState().faintDay = G.day;
    if (!scenesEnabled()) return faint();   // sem cenas (testes), acorda direto
    mataDefeat = { game: G, t: 0, faint }; mataGrab = null; keys.clear(); worldOut.walk = false; N.swing = null; caveState().hp = 0;
    AudioEngine.caveFaintSound?.(); save(); const el = mataDefeatOverlay(); el.classList.remove('hidden'); el.style.backgroundColor = 'rgba(0,0,0,0)'; el.firstElementChild.style.opacity = 0;
  };
  const step = frameStep; frameStep = function (time) {
    if (!mataDefeatActive()) { if (mataDefeat) { mataDefeat = null; $('caveDefeat')?.classList.add('hidden'); } return step(time); }
    const dt = document.hidden ? 0 : Math.min(.05, Math.max(0, (time - lastFrame) / 1000)); lastFrame = time; mataDefeat.t += dt;
    const el = $('caveDefeat'), t = mataDefeat.t; if (el) { el.style.backgroundColor = 'rgba(0,0,0,' + clamp((t - .25) / 2.1, 0, 1) + ')'; el.firstElementChild.style.opacity = clamp((t - 1.5) / .8, 0, 1); }
    draw(); AudioEngine.update?.(dt);
    if (t >= 4.5) { const f = mataDefeat.faint; mataDefeat = null; el?.classList.add('hidden'); const sound = AudioEngine.caveFaintSound; AudioEngine.caveFaintSound = () => {}; try { f(); } finally { AudioEngine.caveFaintSound = sound; } }
  };
  const sim = simulate; simulate = function (dt, background = false) { if (!mataDefeatActive()) sim(dt, background); };
  const act = action; action = function (name, id) { if (mataDefeatActive()) return; return act(name, id); };
  document.addEventListener('keydown', e => { if (mataDefeatActive()) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  const person = drawExpansionPerson; drawExpansionPerson = function (sprite, x, y, walking, chef, ...rest) { if (chef && mataDefeatActive()) return drawMataDefeatedPlayer(x, y); return person(sprite, x, y, walking, chef, ...rest); };
  // Mata adentro fechada no dia do desmaio: a picada do leste, a mesa de mapas, o Seival e a volta pela restinga.
  const M = WORLD_MAPS.mata, edge = M.edge; M.edge = function (p) { const r = edge.call(this, p); if (r?.map === 'trecho' && mataLockedToday()) { trechoSay(MATA_LOCK_TEXT); return null; } return r; };
  const L = WORLD_MAPS.laguna, ledge = L.edge; L.edge = function (p) { const r = ledge.call(this, p); if (r?.map === 'trecho' && mataLockedToday()) { trechoSay(MATA_LOCK_TEXT + ' Pra casa, o caminho é pelo fogo da praia.'); return null; } return r; };
  const camp = mataGoCamp; mataGoCamp = function (n) { if (mataLockedToday()) { closeDialog(true); worldSay(MATA_LOCK_TEXT); return; } return camp(n); };
  const board = navioBoard; navioBoard = function () { if (mataLockedToday()) { worldSay('Depois do tombo no mar, o Garibaldi não deixa: o navio fica pra amanhã.'); return; } return board(); };
  // Na caverna: depois do desmaio, a gruta fica pra amanhã.
  const recover = caveRecover; caveRecover = function (lost) { caveState().faintDay = G.day; save(); return recover(lost); };
  const door = caveDoor; caveDoor = function () { if (caveLockedToday()) { worldSay('Depois do desmaio, o corpo pede descanso: a gruta fica pra amanhã.'); AudioEngine.bad?.(); return; } return door(); };
  const enter = enterCave; enterCave = function (floor) { if (caveLockedToday()) { closeDialog(true); worldSay('Depois do desmaio, o corpo pede descanso: a gruta fica pra amanhã.'); return; } return enter(floor); };
}

// ---------- Memória: saindo da mata, solta o que era só de lá ----------
// O terreno dos trechos, o pinheiral do refúgio, os sprites da mata e o convés do navio ficam guardados em canvas
// grandes; fora da mata eles só pesariam (principalmente na placa de vídeo), então vão embora e voltam na próxima ida.
const MATA_MAPS = new Set(['mata', 'trecho', 'laguna', 'navio', 'casa:garibaldi']);
function mataReleaseCaches() {
  for (const t of trechoTiles.values()) t.width = t.height = 0; trechoTiles.clear(); trechoCache = null;
  for (const t of mataTiles.values()) t.width = t.height = 0; mataTiles.clear();
  for (const t of MATA_SPRITE_CACHE.values()) t.width = t.height = 0; MATA_SPRITE_CACHE.clear(); mataSpritePixels = 0;
  if (navioDeck) { navioDeck.width = navioDeck.height = 0; navioDeck = null; }
}
{
  const swap = switchMap; switchMap = function (to) { const from = worldOut?.map, r = swap(to); if (MATA_MAPS.has(from) && !MATA_MAPS.has(worldOut?.map)) mataReleaseCaches(); return r; };
  const inside = goInside; goInside = function (...a) { const from = worldOut?.map, r = inside(...a); if (MATA_MAPS.has(from)) mataReleaseCaches(); return r; };
}
