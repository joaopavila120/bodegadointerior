// Arco secundário "A Baia sumiu" (depois do capítulo 2):
//   1. Numa manhã, o Mano Lima entra na bodega: a Baia, a cadela dele, fugiu. Pede pra passar na casa dele.
//   2. Lá, ele explica e pergunta se o Sadi procura. Só aceitando a missão a gruta da Serra aparece.
//   3. Perto da gruta, a tela escurece: "Você pisou no rastro do sanguanel…". O Sadi acha pelo baio na entrada.
//   4. No segundo andar da caverna estão a Baia e um cusco véio. Dá pra adotar o cusco (ele ganha a casinha no campo).
//   5. A Baia vai junto com o Sadi até a casa do Mano Lima, que fica aberta mesmo depois das 23h30.
//   6. O Sadi conta da caverna; Mano Lima indica a ferraria de São Dunstano.
'use strict';

const BAIA_TRAIL_RANGE = 380;
function baiaArc() { G.baiaArc ??= { stage: null }; return G.baiaArc; }
function baiaStage() { return G.baiaArc?.stage || null; }   // search → trail → return → done
function baiaReturning() { return baiaStage() === 'return'; }
function baiaCalling() { return missionState('baia')?.status === 'calling'; }
function baiaMission() { return MISSIONS.find(m => m.id === 'baia'); }
function baiaGoal() {
  const s = baiaStage();
  if (s === 'trail') return 'Tem pelo da Cadela Baia na boca da gruta da Serra: desça e procure lá dentro';
  if (s === 'return') return 'Leve a Cadela Baia de volta pro Mano Lima, na casa dele (Fronteira)';
  return 'Procure a Cadela Baia pelo mapa: ela gosta de andar pela Fronteira e pela estrada da Serra';
}
MISSIONS.push({ id: 'baia', title: 'A Cadela Baia sumiu', giver: 'manolima', side: true, after: 'abertura',
  // Uma manhã depois do capítulo 2, com o Sadi na bodega, o Mano Lima entra pela porta.
  // (num dia sem evento no mapa, pra não cruzar com a visita da manhã do evento)
  when: () => missionDone('abertura') && G.day > (missionState('abertura')?.day || 0) && !worldOut && G.phase === 'prep' && !tutorialActive() && !mapEventFor(),
  direct: () => baiaCall(),
  goal: () => baiaGoal(), done: () => false,
  reward: { cash: 80, xp: 80, rep: 3, friend: { manolima: 15 }, unlock: 'Balcão do Mano Lima: melhorias pro facão' },
  onDone: () => { baiaArc().stage = 'done'; baiaArc().doneDay = G.day; }, outroBy: 'manolima',
  outro: [['manolima', 'Baia! Vem cá, guria… ai, que susto tu me deu!'], ['manolima', 'Vivente, te devo essa. Onde é que ela tava metida?'],
    ['sadi', 'Numa caverna lá nos paredões da Serra. No segundo andar, no escuro… e tem bicho brabo lá embaixo, Mano.'],
    ['manolima', 'A caverna! Teu vô descia lá quando era moço, com um facão e um lampião.'],
    ['manolima', 'Escuta: antes de descer mais fundo, procura São Dunstano no primeiro andar da gruta. A ferraria dele afia facão, troca cabo e tem poncho e lampião.']] });

// ---------- 1. O chamado na bodega ----------
function baiaCall() {
  playSteps([{ view: 'bodega' }, { do: () => { G.player = { ...G.player, x: 820, y: 640, dx: 1, dy: 0, walk: false }; } }, { fade: 'in', time: .4 },
    { actor: 'manolima', x: ENTRY.x, y: ENTRY.y, dx: -1 }, { do: () => AudioEngine.doorChime() }, { walk: 'manolima', to: { x: 930, y: 650 } },
    { say: 'manolima', text: 'Bah, vivente… desculpa entrar assim, de manhã cedo.' },
    { say: 'manolima', text: 'A Cadela Baia fugiu ontem de noite. Saiu correndo atrás de não sei o quê e não voltou mais.' },
    { say: 'sadi', text: 'A Cadela Baia? Aquela de pelo baio, que dorme no teu tapete?' },
    { say: 'manolima', text: 'Essa mesma. Passa lá em casa quando puder, que eu te conto onde ela costuma andar. Índio véio já não tem perna pra procurar sozinho.' },
    { walk: 'manolima', to: { x: ENTRY.x, y: ENTRY.y } }], 'baia-chamado', () => {
    G.missions.baia = { status: 'calling', day: G.day }; save();
    showBanner('Mano Lima quer falar com você', 'Casa do Mano Lima, na Fronteira: a Cadela Baia sumiu', 'info', { world: true });
  });
}
// ---------- 2. Na casa do Mano Lima: aceitar a missão ----------
function baiaOffer() {
  const i = PEOPLE.findIndex(p => p.id === 'manolima'), m = baiaMission();
  talk([['manolima', 'Chegou, vivente. Senta aí que o mate tá pronto.'], ['manolima', 'A Cadela Baia some às vezes, mas sempre volta no outro dia. Dessa vez já faz duas noites…'],
    ['manolima', 'Ela gosta de andar pela Fronteira e pela estrada da Serra, farejando bicho. Procura pelo mapa, olha nos cantos. Se achar, me traz ela de volta?']],
  () => openDialog('A Cadela Baia sumiu', `<div class="rpg-speaker">${portraitHTML(i, 88)}<div><p><b>Mano Lima</b></p><p>Procurar a Cadela Baia pelo mapa e levar ela de volta pra casa dele.</p></div></div><h3>Recompensa</h3>${rewardHTML(m.reward)}<div class="actions"><button class="primary" data-act="baiaAccept">Aceitar: procurar a Cadela Baia</button><button data-act="close">Agora não</button></div>`, 'baiaOffer'), 'Continuar');
}
function baiaAccept() {
  if (!baiaCalling()) return; closeDialog(true); baiaArc().stage = 'search'; startMission(baiaMission());
}
// ---------- 3. O rastro do sanguanel na boca da gruta ----------
function baiaTrailTick() {
  if (baiaStage() !== 'search' || worldOut?.map !== 'serra' || scene || modal || worldTalkOpen()) return;
  if (Math.hypot(worldOut.x - CAVE.door.x, worldOut.y - CAVE.door.y) > BAIA_TRAIL_RANGE) return;
  baiaArc().stage = 'trail'; keys.clear(); save();
  playSteps([{ caption: 'Você pisou no rastro do sanguanel…', time: 2.8 }], 'baia-rastro', () => talk([
    ['sadi', '(Um tufo de pelo amarelado preso na pedra, bem na boca da gruta…)'],
    ['sadi', '(É pelo de cachorro. Pelo baio. A Cadela Baia deve ter entrado aí dentro, ou alguma coisa levou ela.)'],
    ['sadi', '(Sai um vento frio lá de baixo, com cheiro de bicho. Ela deve estar por aí.)']], null, 'Descer na gruta'));
}
// ---------- 4. No segundo andar: a Baia e o cusco véio ----------
const BAIA_FLOOR = 2;
function baiaCaveSpot(run) {
  if (run.baiaSpot) return run.baiaSpot;
  const [sx, sy] = CAVE.start; let best = null, bd = -1;
  // Longe da corda, mas sem encostar nas bordas do mapa (o placar fica no canto de cima e o cusco senta do lado dela).
  for (let y = 3; y < CAVE.rows - 2; y++) for (let x = 2; x < CAVE.cols - 4; x++) {
    if (run.grid[y][x]) continue; const c = caveCenter(x, y); if (!caveFree(c.x, c.y, 40) || !caveFree(c.x + 56, c.y + 6, 30) || run.ladder && Math.hypot(c.x - run.ladder.x, c.y - run.ladder.y) < 120) continue;
    const d = Math.abs(x - sx) + Math.abs(y - sy); if (d > bd) { bd = d; best = c; }
  }
  return run.baiaSpot = best;
}
function baiaInCave() { return ['search', 'trail'].includes(baiaStage()) && inCave() && caveState().floor === BAIA_FLOOR; }
function baiaFound() {
  const withCusco = !cuscoAdopted();
  talk([['card', '<b>🐕 A Cadela Baia!</b><br>Encolhida atrás de uma pedra, tremendo de frio: a Cadela Baia, de pelo baio.' + (withCusco ? '<br><br>E do lado dela, sem largar um minuto, um cusco véio caramelo, magrinho, de orelha caída.' : ''), 'Caverna da Serra · andar ' + BAIA_FLOOR],
    ['sadi', 'Baia! O Mano Lima tá louco atrás de ti, guria.'], ...(withCusco ? [['sadi', 'E tu, cusco véio? Ficou cuidando dela aqui embaixo, é?']] : [])],
  () => withCusco ? openDialog('Um cusco véio', '<div class="rpg-speaker"><span class="portrait portrait-phone" style="width:88px;height:88px">🐕</span><div><p>O cusco véio te olha, abana o rabo devagar e encosta o focinho na tua mão. Não tem coleira, não tem dono.</p><p>Leva ele contigo?</p></div></div><div class="actions"><button class="primary" data-act="baiaCusco" data-id="sim">Adotar o cusco véio</button><button data-act="baiaCusco" data-id="nao">Deixar ele seguir o caminho dele</button></div>', 'baiaCusco') : baiaTake(), 'Continuar');
}
function baiaCuscoChoice(yes) {
  closeDialog(true);
  if (yes === 'sim') { G.cusco = { day: G.day, mode: 'follow' }; cusco.map = null; AudioEngine.heart(); showBanner('O cusco véio agora é teu!', 'Ele ganhou uma casinha no Campo e curral. Parado do lado dele, E dá os comandos.', 'gift'); }
  else baiaArc().cuscoFree = true;
  baiaTake();
}
function baiaTake() {
  baiaArc().stage = 'return'; save();
  talk([['dica', 'Leve a <b>Cadela Baia</b> de volta pro <b>Mano Lima</b>, na casa dele, na Fronteira: ela vai junto contigo. Mesmo depois das 23h30 ele vai estar te esperando, de luz acesa.', 'A Cadela Baia sumiu']], null, 'Bora pra casa');
}
function drawCaveDogs(layers) {
  if (!baiaInCave()) return; const p = baiaCaveSpot(caveFloorRun()); if (!p) return;
  layers.push({ y: p.y, draw: () => drawCusco(p.x, p.y, worldOut.x < p.x ? -1 : 1, false, Math.hypot(worldOut.x - p.x, worldOut.y - p.y) > 260, false, BAIA.colors) });
  if (!cuscoAdopted()) layers.push({ y: p.y + 6, draw: () => drawCusco(p.x + 56, p.y + 6, worldOut.x < p.x + 56 ? -1 : 1, false, false, Math.hypot(worldOut.x - p.x, worldOut.y - p.y) < 260) });
}
// ---------- 5. Voltando: a Baia segue o Sadi pelos mapas abertos ----------
const baiaTrail = { x: 0, y: 0, dx: 1, walk: false, map: null };
function baiaFollowTick(dt) {
  if (!baiaReturning() || !worldOut || worldMap()?.indoor || scene) { baiaTrail.map = null; return; }
  const p = worldOut, to = { x: p.x - (p.dx || 1) * 104, y: p.y + 28 }, d = Math.hypot(to.x - baiaTrail.x, to.y - baiaTrail.y);
  if (baiaTrail.map !== p.map || Math.hypot(baiaTrail.x - p.x, baiaTrail.y - p.y) > 700) { Object.assign(baiaTrail, { x: to.x, y: to.y, map: p.map }); return; }
  baiaTrail.walk = d > 16; if (!baiaTrail.walk) return;
  const k = Math.min(d, BASE_SPEED * 1.6 * (1 + movementBonus()) * dt); if (Math.abs(to.x - baiaTrail.x) > 4) baiaTrail.dx = to.x < baiaTrail.x ? -1 : 1;
  const nx = baiaTrail.x + (to.x - baiaTrail.x) / d * k, ny = baiaTrail.y + (to.y - baiaTrail.y) / d * k;
  if (worldCanWalk(nx, baiaTrail.y)) baiaTrail.x = nx; if (worldCanWalk(baiaTrail.x, ny)) baiaTrail.y = ny;
  if (Math.hypot(baiaTrail.x - to.x, baiaTrail.y - to.y) > 260) Object.assign(baiaTrail, to);
}
function baiaFollowLayers(seen, layers) { if (baiaReturning() && baiaTrail.map === worldOut?.map && seen(baiaTrail.x, baiaTrail.y)) layers.push({ y: baiaTrail.y, draw: () => drawCusco(baiaTrail.x, baiaTrail.y, baiaTrail.dx, baiaTrail.walk, false, false, BAIA.colors) }); }
// ---------- 6. A Baia em casa ----------
function baiaReturn() { completeMission(baiaMission()); }


// Connections to the rescue quest and the cave dogs.

{
  // O Mano Lima: chamando e recebendo a Baia de volta.
  const talkHome = houseResidentTalk; houseResidentTalk = function (i, x, y) {
    if (PEOPLE[i]?.id === 'manolima') { if (baiaCalling()) { baiaOffer(); return; } if (missionActive('baia') && baiaReturning()) { baiaReturn(); return; } }
    return talkHome(i, x, y);
  };
  const marker = questMarker; questMarker = function (id) { if (questKey(id) === 'manolima') { if (baiaCalling()) return 'new'; if (missionActive('baia') && baiaReturning()) return 'deliver'; } return marker(id); };
  const tl = trackerLines; trackerLines = function () {
    const base = tl(), g = baiaCalling() ? { icon: '📣', title: 'A Cadela Baia sumiu', goal: 'Mano Lima quer falar com você · casa dele, na Fronteira', kind: 'side' } : missionActive('baia') ? { icon: '🐕', title: 'A Cadela Baia sumiu', goal: baiaGoal(), kind: 'side' } : null;
    if (!g) return base; const k = base.findIndex(l => l.kind === 'side'); if (k >= 0) base[k] = g; else if (base.length < 2) base.push(g); else if (base[1].kind !== 'story') base[1] = g; return base;
  };
  // A casa abre mesmo tarde da noite quando o Sadi traz a Baia.
  const vila = WORLD_MAPS.vila, vsp = vila.spots; vila.spots = function () { const list = vsp.call(this); if (baiaReturning()) { const h = list.find(s => s.id === 'house:manolima'); if (h) { delete h.house; h.label = 'Casa de Mano Lima · a luz tá acesa'; h.act = () => enterInterior('casa:manolima'); } } return list; };
  const casa = WORLD_MAPS['casa:manolima'];
  const csp = casa.spots; casa.spots = function () { const list = csp.call(this), h = list.find(s => s.id === 'home:manolima'); if (h) { if (baiaCalling()) h.label = 'Falar com o Mano Lima (a Cadela Baia sumiu)'; else if (missionActive('baia') && baiaReturning()) h.label = 'Devolver a Cadela Baia pro Mano Lima'; } return list; };
  // Na caverna: os dois cachorros no segundo andar.
  const cave = WORLD_MAPS.caverna, cvsp = cave.spots, cvdraw = cave.draw;
  cave.spots = function () { const list = cvsp.call(this); if (baiaInCave()) { const p = baiaCaveSpot(caveFloorRun()); if (p) list.push({ id: 'cave:baia', x: p.x + 20, y: p.y + 24, radius: 100, label: cuscoAdopted() ? 'A Cadela Baia!' : 'A Cadela Baia e um cusco véio', act: baiaFound }); } return list; };
  cave.draw = function (view, seen, layers) { cvdraw.call(this, view, seen, layers); drawCaveDogs(layers); };
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); baiaTrailTick(); baiaFollowTick(dt); };
  document.addEventListener('DOMContentLoaded', () => { const land = worldLandscape; worldLandscape = function (M, seen, layers, view) { land(M, seen, layers, view); baiaFollowLayers(seen, layers); }; });
}
