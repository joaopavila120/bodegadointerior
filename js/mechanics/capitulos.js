// Capítulos que terminam em festa: o baile da comunidade (Badin) e a Oktoberfest (Loli). Primeiro o Sadi ajuda a
// organizar (a doação pro baile, as cervejas pro barril); depois a festa acontece de noite, igual à do calendário
// (missa na igreja e baile no salão; chope no salão de Pomerode). Cumprido o capítulo, a festa entra no calendário.
'use strict';

const FESTA_DONATION = 100, OKTO_BEER = 20;

// ---------- Baile da comunidade ----------
function festaState() { return G.missions?.festa; }
function festaGoal() {
  const f = festaState();
  if (f?.donated == null) return 'Doe ' + money(FESTA_DONATION) + ' ao Badin para o baile (casa de pedra, na Serra)';
  if (G.day < f.baileDay) return 'O baile de capela é amanhã à noite, na Serra';
  return 'Hoje à noite, depois de fechar: missa na igreja da Serra e o baile no salão (sirva vinho e polenta)';
}
function festaDonate() {
  const f = festaState(); if (!f || f.donated != null) return;
  if (!hasCash(FESTA_DONATION)) { talk([['badin', 'O padre precisa de ' + money(FESTA_DONATION) + ', Sadi. Junta na bodega e volta, que a nona espera.']], null, 'Depois eu volto'); return; }
  spendCash(FESTA_DONATION); f.donated = G.day; f.baileDay = G.phase === 'closed' ? G.day + 1 : G.day; AudioEngine.coins?.(); save(); refreshHUD();
  talk([['badin', 'Grazie, Sadi! A comunidade não esquece.'], ['badin', f.baileDay === G.day ? 'O baile é hoje à noite! Fecha a bodega e sobe pra igreja: primeiro a missa, depois o baile no salão.' : 'O baile vai ser amanhã à noite. Primeiro a missa na igreja, depois o baile no salão.']], null, 'Combinado');
}

// ---------- Oktoberfest em Pomerode (depois da carta para a vó) ----------
function oktoState() { return G.missions?.oktober; }
function oktoGoal() {
  const o = oktoState();
  if (o?.delivered == null) return 'Leve ' + OKTO_BEER + ' cervejas ao Loli, em Pomerode (tem ' + Math.floor(haveItem('cerveja')) + ')';
  if (G.day < o.festDay) return 'A Oktoberfest é amanhã à noite, no salão de Pomerode';
  return 'Hoje à noite, depois de fechar: sirva chope na Oktoberfest de Pomerode';
}
function oktoDeliver() {
  const o = oktoState(); if (!o || o.delivered != null) return;
  if (haveItem('cerveja') < OKTO_BEER) { talk([['loligebien', 'Ainda falta cerveja, primo! São ' + OKTO_BEER + ' pra encher o barril da festa. Tem no Atacado da Fronteira, ja.']], null, 'Vou buscar'); return; }
  takeItems({ cerveja: OKTO_BEER }); o.delivered = G.day; o.festDay = G.phase === 'closed' ? G.day + 1 : G.day; save(); refreshHUD();
  talk([['loligebien', 'Ja! Barril cheio! A Oma já tá fazendo cuca pra mil pessoas.'], ['loligebien', o.festDay === G.day ? 'A Oktoberfest é hoje à noite, no salão! Tu cuida da chopeira, primo.' : 'A Oktoberfest é amanhã à noite, no salão. Tu cuida da chopeira, primo!']], null, 'Prost!');
}
MISSIONS.push({ id: 'oktober', chapter: 12, title: 'Oktoberfest em Pomerode', giver: 'loligebien', needs: 'loligebien', visit: true, callWhere: 'casa do Loli, em Pomerode', where: 'Santa Catarina: casa do Loli e salão da Oktoberfest, em Pomerode',
  guide: { region: 'sc', spot: 'house:loligebien', inside: 'casa:loligebien', insideSpot: 'home:loligebien' },
  intro: [['loligebien', 'Primo! Esse ano a Oktoberfest de Pomerode é coisa de família: a Oma quer que o primo do Sul cuide da chopeira!'], ['loligebien', 'Mas o barril da comunidade tá vazio, ja. Junta ' + OKTO_BEER + ' cervejas pra festa e traz aqui em casa.']],
  goal: () => oktoGoal(), done: () => !!G.missions.oktober?.fest,
  reward: { cash: 200, xp: 150, rep: 6, friend: { loligebien: 10 }, unlock: 'Oktoberfest no calendário' }, outroBy: 'loligebien',
  outro: [['loligebien', 'Prost, primo! A melhor Oktoberfest da história de Pomerode!'], ['loligebien', 'A comunidade decidiu: agora tem Oktoberfest todo ano, e tu tá convidado pra sempre.']] });

// ---------- Ligações ----------
{
  // Na casa do Badin, a doação; na casa do Loli, as cervejas.
  const home = (map, who, fn) => { const M = WORLD_MAPS[map], sp = M.spots; M.spots = function () { const list = sp.call(this), h = list.find(s => s.id === 'home:' + who); if (h) fn(h); return list; }; };
  home('casa:badin', 'badin', h => { if (missionActive('festa') && festaState()?.donated == null) { h.label = 'Doar ' + money(FESTA_DONATION) + ' para o baile da comunidade'; h.act = festaDonate; } });
  home('casa:loligebien', 'loligebien', h => { if (missionActive('oktober') && oktoState()?.delivered == null) { h.label = 'Entregar ' + OKTO_BEER + ' cervejas pra Oktoberfest (tem ' + Math.floor(haveItem('cerveja')) + ')'; h.act = oktoDeliver; } });
  // A noite da festa do capítulo é a mesma festa do calendário.
  const mef = mapEventFor; mapEventFor = function (day = G.day) {
    const f = festaState(), o = oktoState();
    if (f?.status === 'active' && f.donated != null && !f.baile && day === f.baileDay) return 'capela';
    if (o?.status === 'active' && o.delivered != null && !o.fest && day === o.festDay) return 'oktoberfest';
    return mef(day);
  };
  // Só depois do capítulo a festa entra no calendário.
  const cap = MAP_EVENTS.capela.requires; MAP_EVENTS.capela.requires = () => cap() && missionDone('festa');
  const okt = MAP_EVENTS.oktoberfest.requires; MAP_EVENTS.oktoberfest.requires = () => okt() && missionDone('oktober');
  const fs = finishServe; finishServe = function () { const ev = G.serve?.ev; fs(); if (ev === 'capela' && missionActive('festa')) G.missions.festa.baile = G.day; if (ev === 'oktoberfest' && missionActive('oktober')) G.missions.oktober.fest = G.day; save(); };
  // Perdeu a noite da festa: ela fica pra noite seguinte.
  const story = storyTick; storyTick = function () {
    story(); const f = festaState(), o = oktoState();
    if (f?.status === 'active' && f.donated != null && !f.baile && G.day > f.baileDay) f.baileDay = G.day;
    if (o?.status === 'active' && o.delivered != null && !o.fest && G.day > o.festDay) o.festDay = G.day;
  };
}
