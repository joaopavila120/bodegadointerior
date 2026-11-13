// "A moça que virou mula": a primeira lenda que vira missão da história, com a luta da clareira como chefe final.
//   1. Depois do sino da capela (capítulo 7), o Padre Romio manda chamar: na igreja da Serra ele conta a lenda e o causo da
//      Doralice, a moça que não cumpriu a promessa da procissão e sumiu na noite do baile, faz sete anos.
//   2. Sinais da mula, em três lugares: a ferradura torta que o São Dunstano achou na boca da gruta, a crina chamuscada no
//      pinheiral do Garibaldi e o casco queimado na frente do capitel da estrada da Serra.
//   3. Os mais velhos contam quando ela aparece: o Badin (a nona dele), o Mano Lima e o Valter.
//   4. Na quinta à noite, na frente da igreja da Serra, a mula aparece: a cena e a luta na clareira. Perdeu? Ela segue
//      rondando a igreja todas as noites: dá pra se preparar (butiá, pitanga, o bolicho do São Dunstano e o bornal do
//      Garibaldi, que agora valem na clareira) e tentar de novo.
//   5. Vencida, o freio sai, a Doralice volta a ser gente, e o padre fecha a missão.
// A mula deixa de aparecer sorteada de noite: agora ela é desta missão.
'use strict';

const MULA_CLUES = [
  { id: 'gruta', name: 'a ferradura com o São Dunstano (gruta da Serra)' },
  { id: 'mata', name: 'a crina no pinheiral do Garibaldi' },
  { id: 'capitel', name: 'o casco queimado no capitel da estrada da Serra' }
];
const MULA_ASK = [{ id: 'badin', region: 'serra', name: 'o Badin (Serra)' }, { id: 'manolima', region: 'vila', name: 'o Mano Lima' }, { id: 'valter', region: 'vila', name: 'o Valter (Fronteira)' }];
const MULA_CRINA = { x: 1180, y: 1030 };
function mulaArc() { G.mulaArc ??= { stage: null, clues: {}, asked: {} }; return G.mulaArc; }
function mulaStage() { return G.mulaArc?.stage || null; }
function mulaCapitel() { const c = SERRA.capiteis[0]; return { x: c.x + c.w / 2 + 50, y: c.y + c.h + 24 }; }
let mulaSpotCache = null;
function mulaSpot() {
  if (mulaSpotCache) return mulaSpotCache; const S = SERRA, base = { x: S.igreja.x + S.igreja.w * .4 + 180, y: S.igreja.y + S.igreja.h + 90 };
  for (let r = 0; r < 400 && !mulaSpotCache; r += 20) for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) { const x = base.x + Math.cos(a) * r, y = base.y + Math.sin(a) * r * .6; if (WORLD_MAPS.serra.canWalk(x, y)) { mulaSpotCache = { x, y }; break; } }
  return mulaSpotCache ??= base;
}
function mulaThursday() { return calendar().weekday === 3; }
function mulaDaysToThursday() { return (3 - calendar().weekday + 7) % 7; }
// Hoje de noite ela ronda a igreja: na quinta, ou toda noite depois que o Sadi perdeu a primeira luta.
function mulaTonight() { const a = G.mulaArc; return !!a && a.stage === 'wait' && (a.retry || mulaThursday()) && worldNight() && !prologueActive(); }

const MULA_MISSION = { id: 'mula', title: 'A moça que virou mula', giver: 'padre_romio', side: true, when: () => false,
  where: 'Igreja da Serra; a gruta, o pinheiral do Garibaldi e o capitel da estrada; e quinta à noite, de novo a igreja',
  goal: () => mulaGoal(), done: () => false, reward: { cash: 220, xp: 120, rep: 4, friend: { padre_romio: 15 } }, outroBy: 'padre_romio',
  outro: [['padre_romio', 'Sadi! A Doralice bateu aqui na porta hoje cedo, descalça e de vestido de festa, chorando. Já tá na casa da mãe dela.'],
    ['padre_romio', 'Promessa é coisa séria, meu filho. Mas castigo também tem fim. A comunidade não esquece o que tu fez.'],
    ['sadi', 'Ela só precisava de alguém que não tivesse medo de chegar perto.']] };
// Fechada a missão, o padre ensina a benzedura (o poder do escudo, poderes.js).
MULA_MISSION.finale = () => { if (!poderHas('benzedura')) poderGanha('benzedura', PODER_FALAS.benzedura); };
MISSIONS.push(MULA_MISSION);
function mulaGoal() {
  const a = mulaArc(), s = a.stage, check = (done, t) => (done ? '✔ ' : '') + t;
  if (s === 'call') return 'O Padre Romio quer falar contigo na igreja da Serra';
  if (s === 'clues') return 'Procure sinais da mula (' + MULA_CLUES.filter(c => a.clues[c.id]).length + '/3): ' + MULA_CLUES.map(c => check(a.clues[c.id], c.name)).join(' · ');
  if (s === 'ask') return 'Pergunte pros mais velhos quando ela aparece: ' + MULA_ASK.map(p => check(a.asked[p.id], p.name)).join(' · ');
  if (s === 'wait') {
    if (!caveState().facao) return 'Antes, pegue o facão do vô com o seu Olmiro, o tropeiro (na entrada do pinheiral)';
    if (a.retry) return 'A mula ainda ronda a igreja da Serra: volte lá de noite pra tentar de novo. Prepare butiá, pitanga, o bolicho do São Dunstano e o bornal do Garibaldi';
    if (mulaThursday()) return worldNight() ? 'É hoje! Vá pra frente da igreja da Serra e espere a mula' : 'Hoje é quinta: de noite, espere a mula na frente da igreja da Serra';
    const n = mulaDaysToThursday(); return 'Quinta à noite, na frente da igreja da Serra (falta' + (n > 1 ? 'm ' + n + ' dias' : ' 1 dia') + '). Prepare butiá, pitanga e os itens do São Dunstano e do Garibaldi';
  }
  if (s === 'fight') return 'Arranque o freio de ferro da Mula sem Cabeça!';
  if (s === 'report') return 'Conte pro Padre Romio, na igreja da Serra';
  return '';
}

// ---------- 1. O chamado e o causo do padre ----------
function mulaStart() {
  Object.assign(mulaArc(), { stage: 'call', clues: {}, asked: {} }); G.missions.mula = { status: 'active', day: G.day }; save();
  showBanner('📜 O Padre Romio mandou chamar', 'Passe na igreja da Serra: ele quer te contar uma história antiga', 'info', { world: true });
}
function mulaStory() {
  talk([['padre_romio', 'Sadi, que bom que veio. Senta aqui no banco, que o assunto é sério… e antigo.'],
    ['padre_romio', 'O povo da colônia fala de um tropel e de um clarão perto da igreja, nas noites de quinta pra sexta. Eu achava que era causo de bolicho, até ouvir eu mesmo.'],
    ['padre_romio', 'Tu conhece a lenda da Mula sem Cabeça? Uma mulher amaldiçoada que vira mula de quinta pra sexta, com fogo saindo do pescoço, e corre até o galo cantar.'],
    ['padre_romio', 'Aqui na Serra, a nona do Badin jura que é a Doralice, uma moça da comunidade. A mãe dela tava muito doente, e ela prometeu pra Nossa Senhora carregar o andor na procissão se a mãe sarasse.'],
    ['padre_romio', 'A mãe sarou. Mas no dia da procissão teve baile no salão, e a Doralice foi dançar, de vestido de festa. Naquela noite, sumiu. Faz sete anos.'],
    ['sadi', 'E o senhor acredita que ela virou a mula?'],
    ['padre_romio', 'Eu acredito que tem uma moça precisando de ajuda. E o povo diz que o encanto quebra se alguém arrancar o freio de ferro da boca da mula.'],
    ['padre_romio', 'Antes de qualquer coisa, procura sinais dela: na gruta, onde o São Dunstano tem a ferraria; no pinheiral do Garibaldi; e no capitel da estrada aqui da Serra. Depois volta e me conta.'],
    ['dica', '<b>📜 Missão · ' + MULA_MISSION.title + '</b><br>Procure os 3 sinais da mula: eles brilham no chão, e o quadro no alto marca os que já achou.<br><br>Recompensa:' + rewardHTML(MULA_MISSION.reward), 'Missão do Padre Romio']],
  () => { mulaArc().stage = 'clues'; save(); }, 'Vou procurar');
}
// ---------- 2. Os sinais ----------
const MULA_CLUE_TEXT = {
  gruta: [['dunstano', 'Uma mula? Hmm… semana passada ouvi casco de ferro batendo na pedra, lá fora, de madrugada. De manhã achei isto na boca da gruta.'],
    ['card', '<b>🐴 Sinal da mula · Ferradura torta</b><br>Uma ferradura de ferro, torta e ainda morna, com cheiro de enxofre. Não é de cavalo de tropeiro: é pesada demais.', 'Sinal da mula']],
  mata: [['card', '<b>🐴 Sinal da mula · Crina chamuscada</b><br>Um tufo de crina escura preso no galho baixo de uma araucária, com a ponta queimada. Do fogo do rancho, o Garibaldi grita: "Isso passou correndo por aqui de noite, gaúcho. Soltando faísca!"', 'Sinal da mula']],
  capitel: [['card', '<b>🐴 Sinal da mula · Casco queimado</b><br>Na frente do capitel da estrada, a marca de um casco queimada na terra e uma vela de promessa derretida até o fim. Alguém parou aqui pra rezar… e não conseguiu.', 'Sinal da mula']]
};
function mulaClue(id) {
  const a = mulaArc(); if (a.stage !== 'clues' || a.clues[id]) return false;
  a.clues[id] = G.day; save(); AudioEngine.caveGem?.(); const all = MULA_CLUES.every(c => a.clues[c.id]);
  talk([...MULA_CLUE_TEXT[id], ...(all ? [['sadi', 'Ferradura, crina e casco queimado… é ela mesma. Mas quando é que ela aparece?'],
    ['dica', '<b>Agora, os mais velhos</b><br>O Badin (casa de pedra, na Serra), o Mano Lima e o Valter (na Fronteira) conhecem os causos da região. Pergunta pros três quando a mula aparece.', 'Missão do Padre Romio']] : [])],
  () => { if (all) { a.stage = 'ask'; save(); } }, all ? 'Bora perguntar' : 'Guardar');
  return true;
}
// ---------- 3. Os mais velhos ----------
const MULA_ASK_TEXT = {
  badin: [['badin', 'A Doralice? Bah, a minha nona chorou um mês quando ela sumiu. Diz a nona que a mula só corre de quinta pra sexta, nunca outro dia.'], ['badin', 'E que ela tem saudade da igreja: dá a volta no adro e some no mato.']],
  manolima: [['manolima', 'Mula sem cabeça? Eu ouvi o tropel uma vez, tropeando de noite pela Serra. A cavalhada empacou toda.'], ['manolima', 'Foi depois da meia-noite, me lembro do sino batendo. Ela passa bem na frente da igreja, vivente. Vai de facão e de coragem.']],
  valter: [['valter', 'A moça que virou mula? Meu pai contava. O jeito é esperar na frente da igreja da Serra, na noite de quinta.'], ['valter', 'E não esquece: é o freio de ferro. Arranca o freio e ela vira gente de novo. Leva butiá no bornal, que o coice dela é brabo.']]
};
function mulaAskPending(id) { const a = G.mulaArc; return a?.stage === 'ask' && MULA_ASK.some(p => p.id === id) && !a.asked[id]; }
function mulaAsk(id) {
  const a = mulaArc(); if (!mulaAskPending(id)) return false; a.asked[id] = G.day; save(); const all = MULA_ASK.every(p => a.asked[p.id]);
  talk([...MULA_ASK_TEXT[id], ...(all ? [['dica', '<b>🌙 Quinta à noite, na frente da igreja da Serra</b><br>É lá que a Mula sem Cabeça aparece. Leve o facão, butiá ou pitanga pra curar, e o que puder do bolicho do São Dunstano (chimarrão, charque, patuá, água benta…) e do bornal do Garibaldi: na clareira, os dois valem.', 'Missão do Padre Romio']] : [])],
  () => { if (all) { a.stage = 'wait'; save(); } }, all ? 'Até quinta' : 'Valeu');
  return true;
}
// ---------- 4. A noite da mula ----------
function mulaMeet() {
  if (!caveState().facao) { floatNote('Sem o facão do vô não dá pra enfrentar a mula: quem tem ele é o seu Olmiro, o tropeiro.'); AudioEngine.bad(); return; }
  mulaArc().stage = 'fight'; save(); meetFolk('mula');
}
// O brilho que mostra que dá pra investigar ali.
function mulaSparkle(x, y) { const k = .5 + .5 * Math.sin(frameClock * 4); ctx.globalAlpha = .55 + .45 * k; txt('✦', x, y + Math.sin(frameClock * 3) * 4, 16 + 4 * k, '#ffd27a', 'center'); ctx.globalAlpha = 1; }
function drawMulaNoite(p) {
  const t = frameClock, dx = Math.sin(t * .4) > 0 ? 1 : -1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(p.x + dx * 30, p.y - 90, 120, .3 + .08 * Math.sin(t * 9), '255,120,40'); ctx.restore();
  drawFolk('mula', p.x + Math.sin(t * .8) * 30, p.y, dx);
}

// ---------- 5. Na clareira das lendas, o bolicho do São Dunstano também vale (teclas 6 a 0) ----------
const ARENA_CAVE_KEYS = ['6', '7', '8', '9', '0'];
let arenaHoly = false;
function arenaCaveItems() { return CAVE_ITEMS.filter(i => i.id !== 'ticao' && caveBag()[i.id] > 0).slice(0, ARENA_CAVE_KEYS.length); }
function arenaCaveBeltRefresh() {
  const el = $('caveBelt'); if (!el) return; const on = inArena() && !!lendaFight && !scene, list = on ? arenaCaveItems() : [];
  el.classList.toggle('arena-row', on); el.classList.toggle('hidden', !list.length);
  const html = list.map((i, k) => `<button type="button" data-act="caveUse" data-id="${i.id}" title="${i.name}"><small>${ARENA_CAVE_KEYS[k]}</small><span>${caveItemIcon(i)}</span><em>${caveBag()[i.id]}</em></button>`).join('');
  if (el.dataset.html !== html) { el.dataset.html = html; el.innerHTML = html; }
}
function arenaCaveUse(id) {
  const it = CAVE_ITEMS.find(x => x.id === id), bag = caveBag(); if (!it || !(bag[id] > 0) || !lendaFight || scene) return false;
  const st = caveState(), p = worldOut;
  if (it.heal) { if (st.hp >= caveMaxHp()) { floatNote('Vida cheia: guarda pra hora do aperto.'); return false; } st.hp = Math.min(caveMaxHp(), st.hp + it.heal); effect('+' + it.heal + ' ❤ ' + it.name.toLowerCase(), p.x, p.y - 140, '#d8ffac', 18); fxHearts(p.x, p.y - 120, 3); AudioEngine.caveHeal(); }
  else if (it.buff) { caveBuffs()[it.buff] = it.time; effect(it.name, p.x, p.y - 140, '#ffe28a', 18); fxStars(p.x, p.y - 90, 5); AudioEngine.boost(); }
  else if (id === 'boleadeira') {
    const b = mataNight?.beasts[0], hit = b && b.hp > 0 && Math.hypot(b.x - p.x, b.y - p.y) < 340; if (hit) { b.stun = 3; fxStars(b.x, b.y - 120, 5); }
    AudioEngine.lassoThrow(); setTimeout(() => AudioEngine.ropeHit(), 180); effect(hit ? 'Boleou a lenda!' : 'Boleadeira no vazio…', p.x, p.y - 140, '#ffe28a', 18);
  } else return false;
  bag[id]--; if (bag[id] <= 0) delete bag[id]; save(); arenaCaveBeltRefresh(); return true;
}

// ---------- Ligações ----------
{
  FOLK.mula.ok = () => false;   // a mula não sai mais sorteada: é da missão
  const tick = outsideTick; outsideTick = function (dt) {
    tick(dt); const a = G.mulaArc;
    if (a?.stage === 'fight' && !lendaFight && !scene) { a.stage = 'wait'; a.retry = true; save(); }
    if (a?.stage === 'done' && !poderHas('benzedura') && storyCalm() && !worldTalkOpen()) MULA_MISSION.finale();
    if (!a?.stage && G.missions && currentChapter()?.id === 'mula' && missionDone('sino') && G.day > (missionState('sino')?.day || 0) && !prologueActive() && !tutorialActive() && storyCalm() && !worldTalkOpen()) mulaStart();
    if (inArena()) { arenaCaveBeltRefresh(); if (lendaFight && !paused && !modal && !scene) caveBuffTick(dt); } else $('caveBelt')?.classList.remove('arena-row');
  };
  // O padre fica na capela enquanto a missão precisa dele.
  const chapel = romioAtChapel; romioAtChapel = function () { return ['call', 'report'].includes(mulaStage()) || chapel(); };
  const prosa = worldTalk; worldTalk = function (w) {
    // Assunto de capítulo com o padre (o sino) vem antes da mula.
    const id = PEOPLE[w?.person]?.id, s = mulaStage(), padreLivre = !missionActive('sino') && !(activeChapter() && activeChapter().id !== 'mula' && activeChapter().giver === 'padre_romio');
    if (w?.person === PADRE_ROMIO && padreLivre && s === 'call') { worldTalkAt = { x: w.x, y: w.y }; mulaStory(); return; }
    if (w?.person === PADRE_ROMIO && padreLivre && s === 'report') { mulaArc().stage = 'done'; completeMission(MULA_MISSION); return; }
    if (mulaAskPending(id)) { mulaAsk(id); return; }
    return prosa(w);
  };
  const resident = houseResidentTalk; houseResidentTalk = function (i, x, y) { if (mulaAsk(PEOPLE[i]?.id)) return; return resident(i, x, y); };
  const home = atHome; atHome = function (id) { return mulaAskPending(id) || home(id); };
  const dun = dunstanTalk; dunstanTalk = function () { if (mulaStage() === 'clues' && !mulaArc().clues.gruta) { mulaClue('gruta'); return; } return dun(); };
  // Os sinais no mapa e a mula na frente da igreja.
  const mata = WORLD_MAPS.mata, mataSpots = mata.spots, mataDraw = mata.draw;
  mata.spots = function () { const list = mataSpots.call(this); if (mulaStage() === 'clues' && !mulaArc().clues.mata) list.push({ id: 'mula:crina', ...MULA_CRINA, radius: 100, label: 'Uma crina chamuscada num galho', act: () => mulaClue('mata') }); return list; };
  mata.draw = function (view, seen, layers) {
    mataDraw.call(this, view, seen, layers);
    if (mulaStage() === 'clues' && !mulaArc().clues.mata && seen(MULA_CRINA.x, MULA_CRINA.y)) layers.push({ y: MULA_CRINA.y, draw: () => { const { x, y } = MULA_CRINA; ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 40, y - 90); ctx.lineTo(x + 30, y - 70); ctx.stroke(); for (let k = 0; k < 6; k++) { ctx.strokeStyle = k % 2 ? '#1a1410' : '#3a2a20'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 4 + k * 3, y - 80); ctx.quadraticCurveTo(x + k * 2, y - 55, x - 6 + k * 4, y - 40); ctx.stroke(); } ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 45, 30, .35 + .1 * Math.sin(frameClock * 6), '255,140,60'); ctx.restore(); mulaSparkle(x, y - 110); } });
  };
  const serra = WORLD_MAPS.serra, serraSpots = serra.spots, serraDraw = serra.draw;
  serra.spots = function () {
    const list = serraSpots.call(this);
    if (mulaStage() === 'clues' && !mulaArc().clues.capitel) list.push({ id: 'mula:capitel', ...mulaCapitel(), radius: 100, label: 'Marca de casco queimada na frente do capitel', act: () => mulaClue('capitel') });
    if (mulaTonight()) list.push({ id: 'mula:igreja', ...mulaSpot(), radius: 150, label: 'Um tropel e um clarão na frente da igreja…', act: mulaMeet });
    return list;
  };
  serra.draw = function (view, seen, layers) {
    serraDraw.call(this, view, seen, layers);
    const c = mulaCapitel();
    if (mulaStage() === 'clues' && !mulaArc().clues.capitel && seen(c.x, c.y)) layers.push({ y: c.y - 2, draw: () => { for (const [ox, oy] of [[-14, 0], [12, 10]]) { ellipse(c.x + ox, c.y + oy, 11, 6, '#1a120c'); ellipse(c.x + ox, c.y + oy, 7, 3.5, '#3a2416'); } rect(c.x + 30, c.y - 18, 8, 14, '#efe6cc', 2); mulaSparkle(c.x, c.y - 40); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(c.x, c.y, 34, .25 + .08 * Math.sin(frameClock * 5), '255,120,50'); ctx.restore(); } });
    if (mulaTonight() && !scene) { const p = mulaSpot(); if (seen(p.x, p.y)) layers.push({ y: p.y, draw: () => drawMulaNoite(p) }); }
  };
  // O resultado da luta: perdeu, ela segue rondando a igreja; venceu, a Doralice volta e o padre espera a notícia.
  const result = folkResult; folkResult = function (id, win) {
    const a = G.mulaArc; if (id !== 'mula' || !a || !['fight', 'wait'].includes(a.stage)) return result(id, win);
    const keepWin = FOLK_WIN.mula, keepLose = FOLK_LOSE.mula;
    FOLK_WIN.mula = keepWin + '<br><br><i>Leva a notícia pro Padre Romio, na igreja da Serra.</i>';
    FOLK_LOSE.mula = '<b>🐴 A mula fugiu pro escuro</b><br>Ela segue rondando a igreja da Serra, toda noite agora. Respira, cura com butiá ou pitanga e prepara o bornal: chimarrão, charque, patuá e água benta do São Dunstano, e o bornal do Garibaldi. Na clareira, as teclas 1 a 5 usam o bornal da mata e 6 a 0 o da gruta.';
    try { result(id, win); } finally { FOLK_WIN.mula = keepWin; FOLK_LOSE.mula = keepLose; }
    if (win) a.stage = 'report'; else { a.stage = 'wait'; a.retry = true; } save();
  };
  // Na clareira: os itens do São Dunstano, a água benta dobrando o golpe, as esporas e o patuá.
  const use = caveUse; caveUse = function (id) { return inArena() ? arenaCaveUse(id) : use(id); };
  const attack = mataAttack; mataAttack = function () { arenaHoly = inArena() && caveBuff('aguabenta'); try { return attack(); } finally { arenaHoly = false; } };
  const dmg = caveDmg; caveDmg = function () { const d = dmg(); return arenaHoly ? d * 2 : d; };
  const move = movementBonus; movementBonus = function () { return move() + (inArena() && lendaFight && caveBuff('esporas') ? .4 : 0); };
  const hurt = mataHurt; mataHurt = function (d, from) { const N = mataNight; if (inArena() && N && !N.inv && !N.faint && caveBuffs().patua) { delete caveBuffs().patua; N.inv = .9; effect('🧿 O patuá segurou!', worldOut.x, worldOut.y - 140, '#a8e0ff', 20); AudioEngine.glass(); return; } return hurt(d, from); };
  document.addEventListener('keydown', e => {
    if (!inArena() || !lendaFight || e.repeat || modal || scene || phoneOpen || ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    const k = ARENA_CAVE_KEYS.indexOf(e.key); if (k < 0) return; const it = arenaCaveItems()[k]; if (!it) return; e.preventDefault(); e.stopImmediatePropagation(); caveUse(it.id);
  }, true);
}
