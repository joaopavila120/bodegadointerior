// Missões dos encontros pelo mundo:
//   · O sino da capela (Padre Romio): o sino rachou na geada; São Dunstano, que fundia sino nos mosteiros, faz um novo
//     com cobre e ferro da caverna. Depois disso a água benta sai pela metade no bolicho dele.
//   · A corrente do Dianho: um lobisomem levou a corrente de ouro dele pro andar 7 da caverna.
//   · Reportagem do além (Gustavo, do Jornal Indavírus, com o Lauro): de noite os dois andam junto com o Sadi e filmam
//     o Saci e duas assombrações. Filma quem estiver enquadrado na câmera (na frente do Sadi, a uns passos) com E.
//   · O caminho do rio (Arami): plantar butiá e araucária na margem, reconhecer três ervas do mato e aprender a ler o
//     rio. Quem aprende fisga o dourado bem mais vezes (pesca.js).
'use strict';

// ---------- O sino da capela ----------
const SINO_NEEDS = { cobre: 6, ferro: 4 };
function sinoForged() { return !!G.missions?.sino?.forged; }
function sinoBells(delay = 0) {
  for (let k = 0; k < 3; k++) { const f = [523, 659, 523][k], t = delay + k * .9; AudioEngine.note(f, 1.5, 'sine', .06, t); AudioEngine.note(f * 2.01, 1.1, 'sine', .025, t); AudioEngine.note(f * 2.98, .7, 'sine', .012, t); }
}
// Capítulo 6 (no lugar do antigo queijo pra nona): a gruta da Serra aparece com ele.
MISSIONS.push({ id: 'sino', chapter: 6, title: 'O sino da capela', giver: 'padre_romio', where: 'Capela da Serra e a ferraria de São Dunstano, no primeiro andar da caverna',
  when: () => !regionLocked('serra'),
  intro: [['padre_romio', 'Vivente, uma tristeza: o sino da capela rachou na geada. Agora, em vez de chamar pra missa, ele tosse.'],
    ['padre_romio', 'Dizem que lá embaixo, na gruta, mora um ferreiro antigo que sabe fundir sino: São Dunstano, o padroeiro dos ferreiros.'],
    ['padre_romio', 'Leva cobre e ferro da caverna pra ele? Cobre pro corpo do sino, ferro pro badalo.']],
  goal: () => sinoForged() ? 'Leve o sino novo ao Padre Romio, na capela da Serra' : 'Leve ' + SINO_NEEDS.cobre + ' cobres e ' + SINO_NEEDS.ferro + ' ferros ao São Dunstano, na ferraria da caverna (tem ' + Math.floor(bagQty('cobre')) + ' cobre e ' + Math.floor(bagQty('ferro')) + ' ferro)',
  done: () => false,
  reward: { cash: 120, xp: 100, rep: 4, unlock: 'Água benta pela metade no bolicho do São Dunstano' }, outroBy: 'padre_romio',
  outro: [['padre_romio', 'Escuta só… Esse é o sino que eu ouvia quando era piá!'], ['padre_romio', 'Diz pro teu amigo ferreiro que a água benta dele agora sai pela metade: bênção não se cobra caro de quem fundiu o sino da capela.']] });
function sinoTalk() {
  if (!questsOn()) return false;
  const m = MISSIONS.find(x => x.id === 'sino');
  if (missionForGiver('padre_romio') === m) { skipWorldTalk(); offerMission(m); return true; }
  if (!missionActive('sino')) return false;
  skipWorldTalk();
  if (sinoForged()) { completeMission(m); sinoBells(.3); return true; }
  talk([['padre_romio', 'O São Dunstano fica no primeiro andar da gruta, do lado da forja. Leva ' + SINO_NEEDS.cobre + ' cobres e ' + SINO_NEEDS.ferro + ' ferros: cobre sai do andar 2 em diante, ferro do 4.']], null, 'Vou lá');
  return true;
}
function forjaSino() {
  if (!dunstanShopOpen() || !missionActive('sino') || sinoForged()) return;
  if (!hasNeeds(SINO_NEEDS)) { say('Falta minério pro sino: ' + Object.entries(SINO_NEEDS).map(([k, q]) => q + ' ' + bagName(k).toLowerCase()).join(' e ') + '.'); AudioEngine.bad(); return; }
  takeNeeds(SINO_NEEDS); G.missions.sino.forged = G.day; AudioEngine.caveAnvil(); sinoBells(.5); save(); closeDialog(true);
  talk([['dunstano', 'Mil anos atrás, eu fundia sino pros mosteiros. Sino bom se afina no martelo, de ouvido.'], ['dunstano', 'Pronto. Leva pro padre e diz que o ferreiro mandou lembrança: sino que chama pra mesa também vale, hehe.']], null, 'Levar o sino');
}

// ---------- A corrente do Dianho ----------
BAG_RAW.corrente = { name: 'Corrente do Dianho', icon: '⛓️', value: 0, note: 'Corrente de ouro do Dianho, achada no andar 7 da caverna.' };
const CORRENTE_FLOOR = 7;
MISSIONS.push({ id: 'corrente', title: 'A corrente do Dianho', giver: 'dianho', side: true, where: 'Caverna da Serra, andar ' + CORRENTE_FLOOR + ' · casa do Dianho, na Serra',
  when: () => caveOpen() && !regionLocked('serra'),
  intro: [['dianho', 'É os guri… Sadi, aconteceu uma desgraça. Fui dar uma espiada na gruta e um lobisomem me levou a corrente!'],
    ['dianho', 'Corrente de ouro, de família. Ele desceu com ela pro andar ' + CORRENTE_FLOOR + ', eu vi o brilho sumindo no escuro.'],
    ['dianho', 'Tu que desce lá: derruba esse lobisomem e me traz a corrente. Respeito se paga, tá ligado?']],
  goal: () => bagQty('corrente') ? 'Leve a corrente ao Dianho, na casa dele (Serra)' : 'Desça ao andar ' + CORRENTE_FLOOR + ' da caverna e derrube o lobisomem que brilha: ele tá com a corrente do Dianho',
  deliver: { to: 'dianho', items: { corrente: 1 } },
  thanks: [['dianho', 'MINHA CORRENTE! Tá todo Nicolas Cagezinho, Sadi!'], ['dianho', 'Lobisomem nenhum mexe com os cupinxa. Toma aí, que o Dianho não esquece quem ajuda.']],
  reward: { cash: 150, xp: 120, rep: 3, friend: { dianho: 15 } } });
function correnteWanted() { return missionActive('corrente') && !bagQty('corrente'); }
// O lobisomem da corrente: um colar dourado que brilha no pescoço.
function drawCorrente(b) {
  glow(b.x, b.y - 95, 46, .22 + .08 * Math.sin(frameClock * 4), '255,215,90');
  ctx.save(); ctx.strokeStyle = '#ffd75e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(b.x + 4, b.y - 98, 18, 9, 0, .2, Math.PI - .2); ctx.stroke();
  for (let k = 0; k < 5; k++) { const a = .3 + k * .62; ellipse(b.x + 4 + Math.cos(a) * 18, b.y - 98 + Math.sin(a) * 9, 3, 2.4, '#ffe27a'); }
  ctx.restore(); if (Math.sin(frameClock * 6) > .7) txt('✦', b.x + 18, b.y - 104, 12, '#fff2b0');
}

// ---------- Reportagem do além ----------
const REPORT_FOLK = 2;
function reportFilmed() { const st = G.missions?.reportagem; return st ? (st.filmed ??= {}) : {}; }
function reportFolkCount() { return Object.keys(reportFilmed()).filter(k => k !== 'saci').length; }
function reportActive() { return missionActive('reportagem'); }
function reportWants(id) { return reportActive() && !reportFilmed()[id] && (id === 'saci' || reportFolkCount() < REPORT_FOLK); }
function reportNight() { return reportActive() && !!worldOut && !worldMap().indoor && worldNight() && !prologueActive() && !inCave(); }
function reportGoal() {
  const f = reportFilmed(), left = [!f.saci && 'o Saci', reportFolkCount() < REPORT_FOLK && (REPORT_FOLK - reportFolkCount()) + (REPORT_FOLK - reportFolkCount() > 1 ? ' assombrações' : ' assombração')].filter(Boolean).join(' e ');
  const id = folkTonight(), tonight = id && reportWants(id) ? ' · hoje: ' + FOLK[id].name + ' na ' + REGION_NAMES[FOLK[id].map] : '';
  return 'De noite, depois de fechar, filme ' + left + ' (' + Object.keys(f).length + '/' + (REPORT_FOLK + 1) + ')' + tonight;
}
// Capítulo 9, logo depois do convite de Indaial.
MISSIONS.push({ id: 'reportagem', chapter: 9, title: 'Reportagem do além', giver: 'indavirus', where: 'De noite, na Fronteira e na Serra, com o Gustavo e o Lauro',
  intro: [['indavirus', 'Atenção, Sul do Brasil! O Jornal Indavírus vai fazer a maior reportagem da história: “Assombrações do Sul, ao vivo”!'],
    ['lauro', 'O Gustavo quer filmar o Saci, ja. E umas assombrações. Eu vou junto segurar a lanterna… de longe.'],
    ['indavirus', 'De noite, depois que tu fechar a bodega, a gente vai contigo. Tu enquadra o bicho na câmera, uns passos na tua frente, e aperta E. Eu narro!']],
  goal: () => reportGoal(), done: () => !!reportFilmed().saci && reportFolkCount() >= REPORT_FOLK,
  reward: { cash: 180, xp: 140, rep: 5, friend: { indavirus: 12, lauro: 8 }, unlock: 'Especial na TV: turistas na bodega por 3 dias' },
  onDone: () => { G.touristsUntil = G.day + 3; }, outroBy: 'indavirus',
  outro: [['indavirus', 'Corta! Imagens exclusivas: o Saci, as assombrações e o bodegueiro mais corajoso do Sul!'], ['lauro', 'Eu fiquei com a lanterna o tempo todo, ja. Quase sempre apontada pro lado certo.'],
    ['indavirus', 'O especial vai ao ar amanhã. Prepara a chapa, que vem turista de longe pra conhecer a bodega da reportagem!']] });
// Gustavo e Lauro andando junto, de noite.
const reportCrew = { map: null, list: [{ id: 'indavirus', x: 0, y: 0, dx: 1, walk: false }, { id: 'lauro', x: 0, y: 0, dx: 1, walk: false }] };
function reportCrewTick(dt) {
  if (!reportNight()) { reportCrew.map = null; return; }
  const p = worldOut, side = (p.dx || 1) < 0 ? -1 : 1;
  reportCrew.list.forEach((c, k) => {
    const back = { x: p.x - side * (95 + k * 70), y: p.y + 18 + k * 16 }, d = Math.hypot(back.x - c.x, back.y - c.y);
    // Trocou de mapa ou ficou longe: aparece atrás do Sadi, num lugar onde dá pra pisar (nunca dentro do rio).
    if (reportCrew.map !== p.map || d > 600) { const at = [back, { x: p.x + side * (95 + k * 70), y: back.y }, { x: p.x, y: p.y + 60 + k * 50 }].find(q => worldCanWalk(q.x, q.y)) || { x: p.x, y: p.y }; Object.assign(c, at, { walk: false }); return; }
    c.walk = d > 14; if (!c.walk) return;
    const s = Math.min(d, BASE_SPEED * 1.45 * (1 + movementBonus()) * dt), nx = c.x + (back.x - c.x) / d * s, ny = c.y + (back.y - c.y) / d * s; c.dx = back.x < c.x ? -1 : 1;
    if (worldCanWalk(nx, c.y)) c.x = nx; if (worldCanWalk(c.x, ny)) c.y = ny;
  });
  if (G.reportNote !== G.day) { G.reportNote = G.day; floatNote('🎥 O Gustavo e o Lauro tão contigo. Enquadra o bicho e aperta E!'); }
  reportCrew.map = p.map;
}
// O que dá pra filmar por perto (o Saci e a assombração da noite, se ainda faltarem).
function reportTargets() {
  const out = []; if (!reportNight()) return out;
  const w = saciEncounter; if (reportWants('saci') && w && w.map === worldOut.map && !['gone', 'caught'].includes(w.state)) out.push({ id: 'saci', name: 'Saci', x: w.x, y: w.y - 55 });
  const f = folkTonight(); if (f && reportWants(f) && FOLK[f].map === worldOut.map) { const p = folkSpot(f); out.push({ id: f, name: FOLK[f].name, x: p.x, y: p.y - 55 }); }
  return out;
}
// A câmera aponta pra onde o Sadi olha: o quadro fica uns passos à frente dele.
function reportFrame() { const p = worldOut; let dx = p.dx ?? 1, dy = p.dy ?? 0; if (!dx && !dy) dx = 1; return { x: p.x + dx * 240, y: p.y - 55 + dy * 170, w: 150, h: 112 }; }
function reportFramed(t) { const f = reportFrame(); return Math.abs(t.x - f.x) < f.w && Math.abs(t.y - f.y) < f.h && Math.hypot(t.x - worldOut.x, t.y - worldOut.y + 55) > 100; }
function reportCameraE() {
  const near = reportTargets().filter(t => Math.hypot(t.x - worldOut.x, t.y - worldOut.y) < 700); if (!near.length) return false;
  const spot = worldNearest(); if (spot && !['folk', 'walker:saci'].includes(spot.id)) return false;
  const t = near.find(reportFramed);
  if (!t) { floatNote('🎥 Enquadra: vira pro bicho e fica a uns passos dele (nem colado, nem longe demais).'); AudioEngine.bad(); return true; }
  reportFilmed()[t.id] = G.day; AudioEngine.note(1800, .05, 'square', .03); AudioEngine.note(1200, .08, 'square', .03, .07); AudioEngine.ready();
  effect('🎥 ' + t.name + ' filmado!', t.x, t.y - 110, '#fff2b0', 18);
  const g = reportCrew.list[0]; effect(t.id === 'saci' ? 'O Saci existe, ja!' : 'Imagens exclusivas!', g.x, g.y - 150, '#ffe28a', 14);
  if (t.id === 'saci') saciFlee(saciEncounter, worldMap(), 'cusco');
  floatNote('Reportagem do além: ' + Object.keys(reportFilmed()).length + '/' + (REPORT_FOLK + 1) + ' filmados'); save(); return true;
}
function drawReportFrame() {
  const ts = reportTargets().filter(t => Math.hypot(t.x - worldOut.x, t.y - worldOut.y) < 700); if (!ts.length) return;
  const f = reportFrame(), on = ts.find(reportFramed), c = on ? '#7dff8a' : '#fff2ce', k = 26;
  ctx.save(); ctx.globalAlpha = .9; ctx.strokeStyle = c; ctx.lineWidth = 4;
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const x = f.x + sx * f.w, y = f.y + sy * f.h; ctx.beginPath(); ctx.moveTo(x - sx * k, y); ctx.lineTo(x, y); ctx.lineTo(x, y - sy * k); ctx.stroke(); }
  if (Math.sin(frameClock * 6) > -.2) ellipse(f.x - f.w + 18, f.y - f.h + 18, 7, 7, '#ff3b30');
  txt('REC', f.x - f.w + 50, f.y - f.h + 18, 14, '#fff2ce', 'center');
  txt(on ? on.name + ' enquadrado · E filma' : 'Vira pro ' + ts[0].name, f.x, f.y + f.h - 16, 15, c, 'center');
  ctx.restore();
}

// ---------- O caminho do rio ----------
BAG_RAW.muda_butia = { name: 'Muda de butiá', icon: '🌴', value: 0, note: 'Presente do Arami, pra plantar na margem do rio.' };
BAG_RAW.muda_araucaria = { name: 'Muda de araucária', icon: '🌲', value: 0, note: 'Presente do Arami, pra plantar na margem do rio.' };
const RIO_ARAMI = { x: 660, y: 1030 };
const RIO_PLANTS = [{ id: 'butia', name: 'butiá', x: 640, y: 900 }, { id: 'araucaria', name: 'araucária', x: 780, y: 940 }];
const RIO_HERBS = [
  { id: 'marcela', name: 'Marcela', x: 580, y: 1140, color: '#f2d14a', clue: 'Florzinha amarela em cacho, cheirosa. O povo colhe na Sexta-feira Santa, antes do sol nascer, e faz chá pro estômago.', options: ['Marcela', 'Carqueja', 'Guaco'] },
  { id: 'carqueja', name: 'Carqueja', x: 600, y: 2320, color: '#7aa84a', clue: 'Talo verde com umas asinhas, quase sem folha, amarga que só. Chá pro fígado depois do churrasco.', options: ['Espinheira-santa', 'Carqueja', 'Marcela'] },
  { id: 'espinheira', name: 'Espinheira-santa', x: 760, y: 2380, color: '#3f7a3a', clue: 'Folha dura e brilhante, com espinhinhos na borda. A vó fazia chá dela pra dor de estômago.', options: ['Guaco', 'Marcela', 'Espinheira-santa'] }
];
function rioState() { return (G.rio ??= { planted: {}, herbs: {} }); }
function rioPlantedAll() { return RIO_PLANTS.every(p => rioState().planted[p.id]); }
function rioHerbsAll() { return RIO_HERBS.every(h => rioState().herbs[h.id]); }
function rioGoal() {
  if (!rioPlantedAll()) return 'Plante as mudas de butiá e de araucária na margem do rio, na Fronteira (' + RIO_PLANTS.filter(p => rioState().planted[p.id]).length + '/' + RIO_PLANTS.length + ')';
  if (!rioHerbsAll()) return 'Ache e reconheça as ervas do mato na beira do rio (' + RIO_HERBS.filter(h => rioState().herbs[h.id]).length + '/' + RIO_HERBS.length + ')';
  return 'Volte ao Arami, de noite, na beira do rio perto do trapiche: ele vai te ensinar a ler o rio';
}
MISSIONS.push({ id: 'rio', title: 'O caminho do rio', giver: 'arami', side: true, where: 'Margem do rio, na Fronteira · o Arami espera de noite, perto do trapiche',
  intro: [['arami', 'Tu escuta, vivente. Isso é raro. Então vou te mostrar uma coisa: o rio conversa com quem presta atenção.'],
    ['arami', 'Antes de ler o rio, a gente cuida da margem. Planta essa muda de butiá e essa de araucária ali perto do trapiche, onde a barranca tá fraca.'],
    ['arami', 'Depois procura três ervas do mato ali perto e me diz o nome de cada uma. De noite eu te espero perto do trapiche.']],
  start: () => { bagAdd('muda_butia', 1); bagAdd('muda_araucaria', 1); },
  goal: () => rioGoal(), done: () => false,
  reward: { xp: 120, rep: 3, unlock: 'Mais chance de fisgar o dourado no trapiche' }, outroBy: 'arami',
  outro: [['arami', 'Agora olha a água. Onde ela faz espuma e redemoinho, perto das pedras, é correnteza: ali o dourado caça.'],
    ['arami', 'Ele gosta da hora em que a luz muda, cedo ou no fim da tarde, e da água meio barrenta depois da chuva. Arremessa longe, na correnteza, e tem paciência.'],
    ['arami', 'O rio dá pra quem cuida dele. Tu plantou na margem: agora ele te conhece.'], ['sadi', 'Obrigado, Arami. Vou lembrar.']] });
const ARAMI_PERSON = PEOPLE.findIndex(p => p.id === 'arami');
function rioWaiting() { return missionActive('rio') && worldNight() && !prologueActive(); }
function rioTalk() {
  if (!questsOn()) return false;
  const m = MISSIONS.find(x => x.id === 'rio');
  if (missionForGiver('arami') === m) { skipWorldTalk(); offerMission(m); return true; }
  if (!missionActive('rio')) return false;
  skipWorldTalk();
  if (rioPlantedAll() && rioHerbsAll()) { completeMission(m); return true; }
  talk([['arami', rioPlantedAll() ? 'As mudas tão firmes. Agora as ervas: a marcela cresce aqui pertinho, descendo a beira; a carqueja e a espinheira-santa, lá embaixo, no fim da margem.' : 'Planta as mudas ali do lado do trapiche. A raiz delas segura a barranca quando o rio enche.']], null, 'Vou lá');
  return true;
}
function rioPlant(id) {
  const p = RIO_PLANTS.find(x => x.id === id); if (!p || !missionActive('rio') || rioState().planted[id]) return;
  if (!bagTake('muda_' + id, 1)) { worldSay('Cadê a muda de ' + p.name + '? O Arami te deu uma.'); AudioEngine.bad(); return; }
  rioState().planted[id] = G.day; AudioEngine.ready(); fxPuffs(p.x, p.y - 10, 6, 70, '#8a6a3a'); effect('🌱 Muda de ' + p.name + ' plantada', p.x, p.y - 90, '#d8ffac', 16); save();
}
function rioHerb(id) {
  const h = RIO_HERBS.find(x => x.id === id); if (!h || !missionActive('rio') || rioState().herbs[id]) return;
  openDialog('Uma erva do mato', `<p>${h.clue}</p><p><b>Que erva é essa?</b></p><div class="actions">${h.options.map(o => `<button class="primary" data-act="rioErva" data-id="${id}:${o}">${o}</button>`).join('')}</div>`, 'rioErva');
}
function rioErva(arg) {
  const [id, name] = String(arg).split(':'), h = RIO_HERBS.find(x => x.id === id); if (!h) return; closeDialog(true);
  if (name !== h.name) { floatNote('Não é essa. Lembra do que o Arami falou e olha de novo.'); AudioEngine.bad(); return; }
  rioState().herbs[id] = G.day; AudioEngine.ready(); effect('✔ ' + h.name, h.x, h.y - 80, '#d8ffac', 16); save();
}
// Mudas plantadas (ficam pra sempre), ervas ainda por achar e o Arami esperando de noite.
function drawRioSapling(p) {
  const x = p.x, y = p.y; ellipse(x, y + 2, 16, 5, '#3a2a1a88');
  if (p.id === 'butia') { rect(x - 2, y - 26, 4, 26, '#7a5a32', 2); for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * .45; ctx.save(); ctx.translate(x, y - 26); ctx.rotate(a); rect(0, -2, 22, 4, '#5f8f3a', 2); ctx.restore(); } }
  else { rect(x - 2, y - 30, 4, 30, '#6a4a2a', 2); for (let k = 0; k < 3; k++) rect(x - 14 + k * 3, y - 30 + k * 9, 28 - k * 6, 5, '#3f6a3a', 2); }
}
// Cova aberta com uma estaca e fita: onde a muda vai.
function drawRioHole(p) { ellipse(p.x, p.y, 22, 8, '#5a4026'); ellipse(p.x, p.y - 1, 15, 5, '#3a2a18'); rect(p.x + 16, p.y - 40, 4, 40, '#8a6a3a', 1); rect(p.x + 20, p.y - 38, 14, 7, '#d8402a', 2); if (Math.sin(frameClock * 3 + p.y) > .5) txt('✦', p.x - 18, p.y - 26, 13, '#fff2b0'); }
function drawRioHerb(h) { const x = h.x, y = h.y, t = frameClock; for (let k = 0; k < 5; k++) ellipse(x - 12 + k * 6, y - 8 - (k % 2) * 6, 5, 9, '#4f7a35'); for (let k = 0; k < 3; k++) ellipse(x - 8 + k * 8, y - 18 - (k % 2) * 4, 3, 3, h.color); if (Math.sin(t * 3 + x) > .6) txt('✦', x + 12, y - 30, 12, '#fff2b0'); }

// Ícones no inventário com a arte que já existe: a muda de butiá com o butiá, a de araucária com o pinhão e a corrente
// com o freio de prata da estante.
{
  const spec = ruralItemSpec; ruralItemSpec = function (key) { return key === 'muda_butia' ? RURAL_ITEMS.butia : key === 'corrente' ? ['keepsakes-v2', KEEPSAKE_ART.freio] : spec(key); };
  RURAL_ITEM_ALIASES.muda_araucaria = 'pinhao';
}

// ---------- Ligações ----------
{
  // Conversas: o Padre Romio e o Arami puxam as missões deles.
  const wt = worldTalk; worldTalk = function (w) {
    const id = PEOPLE[w.person]?.id;
    if (id === 'padre_romio' && sinoTalk()) return;
    if (id === 'arami' && rioTalk()) return;
    return wt(w);
  };
  const shop = dunstanShop; dunstanShop = function () {
    shop(); if (modal !== 'dunstanShop' || !missionActive('sino') || sinoForged()) return;
    const ok = hasNeeds(SINO_NEEDS);
    $('dialogContent').querySelector('.forja-top')?.insertAdjacentHTML('beforebegin', `<div class="callout"><b>🔔 O sino da capela do Padre Romio</b><br>“Cobre pro corpo, ferro pro badalo. Me dá o minério que eu fundo.”<br>${reqChips(SINO_NEEDS)}<div class="actions"><button class="primary" data-act="forjaSino" ${ok ? '' : 'disabled'}>${ok ? 'Fundir o sino' : 'Falta minério'}</button></div></div>`);
  };
  // Água benta pela metade depois do sino.
  { const ab = CAVE_ITEMS.find(i => i.id === 'aguabenta'), full = ab.cost; Object.defineProperty(ab, 'cost', { configurable: true, get() { return missionDone('sino') ? Math.round(full / 2) : full; } }); }
  // O lobisomem da corrente no andar 7.
  const build = buildCaveFloor; buildCaveFloor = function (floor) {
    const run = build(floor);
    if (floor === CORRENTE_FLOOR && correnteWanted() && run.beasts.length) { const b = run.beasts[0], B = CAVE_BEASTS.lobisomem; b.kind = 'lobisomem'; b.hp = b.max = Math.round(B.hp * (1 + Math.max(0, floor - B.from) * .08)); b.carrier = true; }
    return run;
  };
  const kill = caveKill; caveKill = function (b) {
    kill(b); if (!b.carrier || !correnteWanted()) return;
    b.carrier = false; bagAdd('corrente', 1); AudioEngine.heart(); effect('⛓️ A corrente do Dianho!', b.x, b.y - 150, '#ffe27a', 18); floatNote('Achou a corrente do Dianho! Leve pra ele, na casa dele, na Serra.'); save();
  };
  const beast = drawCaveBeast; drawCaveBeast = function (b) { beast(b); if (b.carrier && b.hp > 0) drawCorrente(b); };
  // Reportagem: a assombração da noite aparece com certeza (uma que ainda falta), e o Saci também, na Fronteira.
  const ft = folkTonight; folkTonight = function () {
    const id = ft(); if (id || !reportActive()) return id;
    if (G.phase !== 'closed' || !G.tutorial?.complete || prologueActive() || mapEventToday() || negrinhoTonight()) return null;
    const st = folkState(); if (st.day === G.day && st.done) return null;
    const pool = Object.keys(FOLK).filter(k => FOLK[k].ok() && reportWants(k)); if (!pool.length) return null;
    const pick = pool[G.day % pool.length]; G.folkNight = { day: G.day, id: pick }; return pick;
  };
  saciForced = M => M.id === 'vila' && reportWants('saci');
  const oi = outsideInteract; outsideInteract = function () { if (!worldTalkOpen() && reportCameraE()) return; oi(); };
  // Turistas do especial na TV: chegam mais fregueses.
  const ai = arrivalInterval; arrivalInterval = function (kind) { const n = ai(kind); return G.touristsUntil >= G.day ? n * .8 : n; };
  // Rio: mudas, ervas e o Arami na beira do rio da Fronteira.
  const vila = WORLD_MAPS.vila, vsp = vila.spots, vdraw = vila.draw;
  vila.spots = function () {
    const list = vsp.call(this);
    if (missionActive('rio')) {
      for (const p of RIO_PLANTS) if (!rioState().planted[p.id]) list.push({ id: 'rio:' + p.id, x: p.x, y: p.y, radius: 80, label: 'Plantar a muda de ' + p.name + ' na margem', act: () => rioPlant(p.id) });
      if (rioPlantedAll()) for (const h of RIO_HERBS) if (!rioState().herbs[h.id]) list.push({ id: 'rio:' + h.id, x: h.x, y: h.y, radius: 80, label: 'Uma erva do mato… reconhecer', act: () => rioHerb(h.id) });
      if (rioWaiting()) list.push({ id: 'rio:arami', x: RIO_ARAMI.x, y: RIO_ARAMI.y, radius: 110, label: 'Prosear com o Arami', act: () => worldTalk({ person: ARAMI_PERSON, x: RIO_ARAMI.x, y: RIO_ARAMI.y }) });
    }
    return list;
  };
  vila.draw = function (view, seen, layers) {
    vdraw.call(this, view, seen, layers);
    for (const p of RIO_PLANTS) if (rioState().planted[p.id] && seen(p.x, p.y)) layers.push({ y: p.y, draw: () => drawRioSapling(p) });
    else if (missionActive('rio') && seen(p.x, p.y)) layers.push({ y: p.y + 4, draw: () => drawRioHole(p) });
    if (missionActive('rio') && rioPlantedAll()) for (const h of RIO_HERBS) if (!rioState().herbs[h.id] && seen(h.x, h.y)) layers.push({ y: h.y, draw: () => drawRioHerb(h) });
    if (rioWaiting() && ARAMI_PERSON >= 0 && seen(RIO_ARAMI.x, RIO_ARAMI.y)) layers.push({ y: RIO_ARAMI.y, draw: () => personDraw(PEOPLE[ARAMI_PERSON].sprite, RIO_ARAMI.x, RIO_ARAMI.y, false, false, -1) });
  };
  // Esperando na beira do rio, o Arami não cruza mais as estradas.
  const sw = spawnWalkers; spawnWalkers = function (M) { sw(M); if (missionActive('rio')) worldWalkers = worldWalkers.filter(w => w.person !== ARAMI_PERSON); };
  const wk = walkersKey; walkersKey = function (M) { return wk(M) + (missionActive('rio') ? ':rio' : ''); };
  // O sino novo toca de manhã quando o Sadi chega na Serra; e a equipe da reportagem anda junto de noite.
  const tick = outsideTick; outsideTick = function (dt) {
    tick(dt); reportCrewTick(dt);
    if (worldOut?.map === 'serra' && missionDone('sino') && G.phase === 'prep' && G.sinoRang !== G.day) { G.sinoRang = G.day; sinoBells(.2); worldSay('🔔 O sino novo da capela tocou lá na Serra.'); }
  };
  const land = worldLandscape; worldLandscape = function (M, seen, layers, view) {
    land(M, seen, layers, view); if (!reportNight()) return;
    for (const c of reportCrew.list) { const i = PEOPLE.findIndex(p => p.id === c.id); if (i >= 0 && reportCrew.map === M.id && seen(c.x, c.y)) layers.push({ y: c.y, draw: () => { personDraw(PEOPLE[i].sprite, c.x, c.y, c.walk, false, c.dx); if (c.id === 'indavirus') { rect(c.x + c.dx * 16 - 10, c.y - 92, 20, 13, '#222', 3); ellipse(c.x + c.dx * 16, c.y - 86, 4, 4, '#555'); } else glow(c.x + c.dx * 14, c.y - 80, 60, .25, '255,230,150'); } }); }
    layers.push({ y: 1e9, draw: drawReportFrame });
  };
  const act = action; action = function (name, id) {
    if (name === 'forjaSino') { forjaSino(); return; }
    if (name === 'rioErva') { rioErva(id); return; }
    return act(name, id);
  };
}
