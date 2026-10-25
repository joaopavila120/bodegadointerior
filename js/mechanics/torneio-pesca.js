// Torneio de pesca no trapiche (Peixinho na Brasa): de manhã ele entra na bodega e anuncia; durante o dia, o Lauro, o
// Guri e o Mano Lima pescam na beira do rio e vão marcando peixe no placar. O Sadi ganha lances a mais no trapiche e
// precisa dar uma escapada da bodega: quem tirar o peixe mais pesado até o fim da tarde ganha prêmio, figurinha e o
// troféu de pesca. De noite, depois de fechar, todo mundo come peixinho na brasa na casa do Peixinho, em Santa Catarina.
// O primeiro torneio é uma missão: depois do arco do dourado, visitando o Peixinho, ele convida pro torneio do dia
// seguinte. Feito o primeiro, o torneio entra no calendário a cada três semanas.
'use strict';

const TORNEIO = {
  extra: 6, rivals: ['lauro', 'guri', 'manolima'], spots: [[600, 800], [610, 1040], [600, 1160], [640, 700]],
  prize: { cash: 150, xp: 100, rep: 4, friend: { peixinhonabrasa: 8 } }, consolo: { cash: 40, xp: 40, friend: { peixinhonabrasa: 4 } }
};
MAP_EVENTS.pesca = {
  id: 'pesca', name: 'Torneio de pesca', icon: '🎣', giver: 'peixinhonabrasa', place: 'Trapiche da Fronteira, até o fim da tarde',
  desc: 'O Peixinho na Brasa organizou um torneio de pesca no trapiche: quem tirar o peixe mais pesado até o fim da tarde ganha prêmio, figurinha e troféu. Hoje tu tem ' + TORNEIO.extra + ' lances a mais. De noite, depois de fechar, peixinho na brasa na casa dele.',
  reward: TORNEIO.prize,
  days: (n, day) => { const m = G.missions?.torneio; if (m?.status === 'active') return day === m.on; return m?.status === 'done' && day > m.day && (n === 31 || n > 31 && (n - 31) % 21 === 0); }, requires: () => !regionLocked('sc'),
  scene: [['peixinhonabrasa', 'Ô loco, meu! Hoje tem torneio de pesca no trapiche da Fronteira!'],
    ['peixinhonabrasa', 'Quem tirar o peixe mais pesado até o fim da tarde ganha prêmio e figurinha. O Lauro, o Guri e o Mano Lima já tão com a vara na mão.'],
    ['sadi', 'E a bodega, quem cuida?'],
    ['peixinhonabrasa', 'Dá uma escapada entre um freguês e outro, meu! Hoje tu tem mais lances no trapiche. E de noite é peixinho na brasa lá em casa, pra todo mundo!']],
  tracker: () => { const st = mapEvState('pesca'); if (st.done || missionActive('torneio')) return null; return { icon: '🎣', title: 'Torneio de pesca', goal: torneioGoal() }; }
};

// ---------- A missão: o primeiro torneio ----------
// Primeiro dia livre (sem outro evento no mapa) a partir de um dia.
function torneioFreeDay(from) {
  for (let d = from; d < from + 40; d++) if (!Object.values(MAP_EVENTS).some(e => e.id !== 'pesca' && e.days(dayNumber(d), d) && e.requires())) return d;
  return from;
}
function torneioWhen(day) { return day === G.day ? 'hoje' : day === G.day + 1 ? 'amanhã' : 'no dia ' + dayNumber(day); }
MISSIONS.push({ id: 'torneio', title: 'Torneio de pesca no trapiche', giver: 'peixinhonabrasa', side: true,
  where: 'Trapiche da Fronteira, de dia; de noite, a casa do Peixinho, em Santa Catarina',
  when: () => !regionLocked('sc') && missionDone('peixinho'),
  get intro() { return [['peixinhonabrasa', 'Ô loco, meu! Depois daquele dourado, a piazada só fala de pescaria.'],
    ['peixinhonabrasa', 'Bora fazer um torneio de pesca no trapiche da Fronteira! Quem tirar o peixe mais pesado até o fim da tarde ganha prêmio, figurinha e troféu.'],
    ['sadi', 'E quem vai pescar?'],
    ['peixinhonabrasa', 'O Lauro, o Guri e o Mano Lima já toparam. É ' + torneioWhen(torneioFreeDay(G.day + 1)) + ', no trapiche! E de noite é peixinho na brasa aqui em casa, pra todo mundo.'],
    ['dica', 'No dia do torneio tu tem <b>' + TORNEIO.extra + ' lances a mais</b> no trapiche. Dá uma escapada da bodega entre um freguês e outro: vale o peixe mais pesado até o fim da tarde.', 'Torneio de pesca']]; },
  goal: () => { const m = G.missions?.torneio; if (!m?.on || G.day < m.on) return 'Torneio de pesca no trapiche da Fronteira ' + torneioWhen(m?.on ?? torneioFreeDay(G.day + 1)) + ': o peixe mais pesado até o fim da tarde ganha'; return torneioGoal(); },
  done: () => false,
  get reward() { return MAP_EVENTS.pesca.reward; },
  start: () => { G.missions.torneio.on = torneioFreeDay(G.day + 1); } });
// Fim do primeiro torneio: a missão conclui e o torneio vira evento do calendário.
function torneioMissionDone() {
  if (!missionActive('torneio')) return null;
  G.missions.torneio = { status: 'done', day: G.day }; save();
  return ['dica', '<b>🎣 Torneio de pesca no calendário</b><br>O Peixinho gostou tanto que agora o torneio é de três em três semanas. Fica de olho no calendário da bodega.', 'Torneio de pesca'];
}

// ---------- Estado e placar ----------
function torneioToday() { const ev = mapEventToday(); return ev?.id === 'pesca' ? ev.st : null; }
// O torneio vale de manhã e de dia; no fim da tarde (quando escurece) fecha o placar.
function torneioOn() { const st = torneioToday(); return !!st && !st.done && !st.ended && !worldNight(); }
function torneioProgress() { return G.phase === 'prep' ? 0 : G.phase === 'open' ? clamp(G.elapsed / DAY / .72, 0, 1) : 1; }
// Os peixes dos rivais saem ao longo do dia (sempre os mesmos naquele dia).
function torneioRivals(st = torneioToday()) {
  if (!st) return [];
  if (!st.rivals) { const R = caveRand(G.day * 911 + 7), kinds = ['traira', 'piava', 'jundia', 'grumata']; st.rivals = TORNEIO.rivals.map(id => ({ id, catches: [0, 1, 2].map(() => ({ t: .08 + R() * .6, kind: kinds[Math.floor(R() * kinds.length)], kg: +(.8 + R() * 2.2).toFixed(1) })) })); }
  return st.rivals;
}
function torneioRivalBest(r, until = torneioProgress()) { return r.catches.filter(c => c.t <= until).sort((a, b) => b.kg - a.kg)[0] || null; }
function torneioLeader(until = torneioProgress()) {
  const st = torneioToday(); let best = null;
  for (const r of torneioRivals(st)) { const c = torneioRivalBest(r, until); if (c && (!best || c.kg > best.kg)) best = { who: r.id, ...c }; }
  if (st?.best && (!best || st.best > best.kg)) best = { who: 'sadi', kind: st.kind, kg: st.best };
  return best;
}
function kgText(kg) { return String(kg).replace('.', ',') + ' kg'; }
function torneioWho(id) { return id === 'sadi' ? 'tu' : PEOPLE.find(p => p.id === id)?.name.split(' ·')[0] || id; }
function torneioGoal() {
  const st = torneioToday(); if (!st) return '';
  if (st.ended) return 'Depois de fechar: peixinho na brasa na casa do Peixinho, em Santa Catarina';
  const lead = torneioLeader(), mine = st.best ? 'teu maior: ' + fishName(st.kind).toLowerCase() + ' de ' + kgText(st.best) : 'tu ainda não pescou';
  return 'Pesque no trapiche até o fim da tarde (' + mine + (lead && lead.who !== 'sadi' ? ' · na frente: ' + torneioWho(lead.who) + ', ' + kgText(lead.kg) : lead ? ' · tu tá na frente!' : '') + ')';
}
function torneioCatch(kind, kg) {
  const st = torneioToday(); if (!st || !torneioOn()) return;
  if (!st.best || kg > st.best) { st.best = kg; st.kind = kind; }
  const lead = torneioLeader(); save();
  floatNote('🎣 Torneio: ' + (lead?.who === 'sadi' ? 'tu tá na frente com ' + fishName(st.kind).toLowerCase() + ' de ' + kgText(st.best) + '!' : 'teu maior é ' + kgText(st.best) + ' · ' + torneioWho(lead.who) + ' lidera com ' + fishName(lead.kind).toLowerCase() + ' de ' + kgText(lead.kg) + '.'));
}
// Escureceu: o placar fecha. O resultado sai de noite, na casa do Peixinho.
function torneioEnd(st) {
  st.ended = true; const lead = torneioLeader(1); st.winner = lead?.who || null; st.win = lead || null; save();
  showBanner('Fim do torneio de pesca!', 'Depois de fechar a bodega: peixinho na brasa na casa do Peixinho, em Santa Catarina.', 'info', { world: true });
}
function torneioPrize(won) {
  // O prêmio do campeão sobe com o nível da bodega, como nos outros eventos do mapa.
  const rw = { ...(won ? MAP_EVENTS.pesca.reward : TORNEIO.consolo) };
  if (won) { G.trophies ??= {}; G.trophies.pesca = { day: G.day, kg: torneioToday()?.best }; }
  return rw;
}
function torneioFigurinha() { const id = !hasCard('peixinhonabrasa') ? 'peixinhonabrasa' : randomLooseCard(); if (id) giveCard(id, 'torneio de pesca'); return id; }

// ---------- A noite: peixinho na brasa na casa do Peixinho ----------
function torneioFinale() {
  const st = torneioToday(); if (!st || st.done) return; st.done = true; save();
  const won = st.winner === 'sadi', rw = torneioPrize(won), w = st.win, kind = w ? fishName(w.kind).toLowerCase() : '';
  const done = () => { grantReward(rw); const card = won ? torneioFigurinha() : null, cal = torneioMissionDone(); talk([['reward', rw, won ? 'Campeão do torneio de pesca · troféu na estante de casa' : 'Torneio de pesca · prêmio de participação'], ...(cal ? [cal] : [])], card ? () => albumCard(card, true) : null, won ? 'Valeu, Peixinho!' : 'Na próxima eu ganho'); };
  if (!st.best) { showBanner('Torneio de pesca: ' + (w ? torneioWho(w.who) + ' ganhou' : 'ninguém pescou'), w ? 'Com ' + kind + ' de ' + kgText(w.kg) + '. O Sadi nem molhou a linha.' : '', 'info', { world: true }); const cal = torneioMissionDone(); if (cal) talk([cal], null, 'Combinado'); return; }
  if (!scenesEnabled()) { done(); return; }
  const h = peixinhoHouse(), cx = h.x + 120, cy = h.y + 190, gx = cx + 28, gy = cy - 8;
  const grill = layers => layers.push({ y: gy + 30, draw: () => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(gx, gy - 40, 70, .35 + .08 * Math.sin(frameClock * 8), '255,140,50'); ctx.restore(); rect(gx - 34, gy - 30, 68, 8, '#3a3a3a', 2); for (let k = 0; k < 3; k++) fishSprite(ctx, k ? 'traira' : (w?.kind || 'piava'), gx - 20 + k * 20, gy - 40, 18); for (let k = 0; k < 3; k++) { const a = (frameClock * .8 + k / 3) % 1; ctx.globalAlpha = .5 * (1 - a); ellipse(gx - 10 + k * 10, gy - 60 - a * 40, 6 + a * 8, 5 + a * 6, '#d8d4cc'); ctx.globalAlpha = 1; } } });
  const rivals = [['lauro', -170, -40], ['guri', 30, 110], ['manolima', 170, -50]];
  const winnerLine = won ? 'é do Sadi: ' + kind + ' de ' + kgText(w.kg) + '! Ô loco, meu, o bodegueiro sabe pescar!' : 'é do ' + torneioWho(w.who) + ': ' + kind + ' de ' + kgText(w.kg) + '! Ô loco, meu!';
  const steps = [...sceneWorld({ map: 'sc', x: cx, y: cy - 20, props: grill }),
    { actor: 'peixinhonabrasa', x: cx - 70, y: cy - 10, dx: 1 }, { actor: 'sadi', x: cx + 80, y: cy + 40, dx: -1 },
    ...rivals.map(([id, dx, dy]) => ({ actor: id, x: cx + dx, y: cy + dy, dx: dx < 0 ? 1 : -1 })), { fade: 'in', time: .8 },
    { say: 'peixinhonabrasa', text: 'Atenção, piazada! O maior peixe do torneio de pesca de hoje…' },
    { say: 'peixinhonabrasa', text: winnerLine },
    won ? sceneSet('sadi', { hop: 12 }) : sceneSet(w.who, { hop: 12 }),
    { do: () => { AudioEngine.crowd?.(); fxStars(cx, cy - 60, 8); } },
    won ? { say: 'sadi', text: 'Bah! E eu que achava que só sabia servir xis!' } : { say: w.who, text: pick(['Peixe grande é pra quem tem paciência, vivente!', 'Hehe, hoje o rio foi meu!', 'Pescaria é que nem truco: tem que saber esperar a hora.']) },
    won ? { say: 'lauro', text: 'Na próxima eu te pego, ja!' } : { say: 'sadi', text: 'Na próxima eu tiro o dourado e ninguém me segura!' },
    sceneSet('sadi', { hop: 0 }), ...(won ? [] : [sceneSet(w.who, { hop: 0 })]),
    { say: 'peixinhonabrasa', text: 'Agora todo mundo pro peixinho na brasa: o peixe do torneio vai pro espeto e a Kaiser tá gelada!' },
    { do: () => { AudioEngine.glass?.(); setTimeout(() => AudioEngine.glass?.(), 160); sceneShout('Saúde!', cx, cy - 170, '#ffe28a', 18); for (const [id] of [...rivals, ['peixinhonabrasa']]) { const a = scene.actors[id]; if (a) a.hop = 8; } } },
    { wait: 1.6 }, { fade: 'out', time: .9 }];
  playSteps(steps, 'torneio-pesca', done);
}

// ---------- No trapiche: os rivais pescando e o Peixinho com o placar ----------
// Tabuleta de madeira num poste (as placas de nome do mapa pintado ficam escondidas; esta é do evento).
function torneioPlaca(x, y) {
  ellipse(x, y + 2, 16, 5, '#1c140c44'); rect(x - 4, y - 70, 8, 72, '#5a3a20', 2);
  rect(x - 92, y - 104, 184, 36, '#e8d6a8', 5, '#5a3a20'); rect(x - 86, y - 98, 172, 24, '#f2e4bc', 3);
  txt('🎣 TORNEIO DE PESCA', x, y - 86, 13, '#5a2a14', 'center', 'Georgia', false);
}
function torneioSpots() {
  const M = WORLD_MAPS.vila; return TORNEIO.spots.filter(([x, y]) => M.canWalk(x, y)).slice(0, TORNEIO.rivals.length + 1);
}
function torneioPlacar() {
  const st = torneioToday(), list = torneioRivals(st).map(r => ({ who: r.id, c: torneioRivalBest(r) })).filter(x => x.c);
  if (st?.best) list.push({ who: 'sadi', c: { kind: st.kind, kg: st.best } });
  list.sort((a, b) => b.c.kg - a.c.kg);
  const i = PEOPLE.findIndex(p => p.id === 'peixinhonabrasa'); worldTalkAt = { x: worldOut.x, y: worldOut.y };
  showRpgBox('worldTalk', { person: i, name: 'Peixinho na Brasa', player: 'Como tá o placar, Peixinho?', reply: list.length ? list.slice(0, 4).map((x, k) => (k + 1) + 'º ' + (x.who === 'sadi' ? 'Sadi' : torneioWho(x.who)) + ': ' + fishName(x.c.kind).toLowerCase() + ' de ' + kgText(x.c.kg)).join(' · ') + '. Até o fim da tarde, meu!' : 'Ninguém tirou nada ainda, meu! O rio tá preguiçoso.' });
}
{
  // Lances a mais no dia do torneio.
  const left = fishLeft; fishLeft = function () { return left() + (torneioOn() ? TORNEIO.extra : 0); };
  // Cada peixe pescado durante o torneio vai pro placar.
  const end = fishEnd; fishEnd = function (ok, why, silent) { const F = fishing; end(ok, why, silent); if (ok && F?.kg) torneioCatch(F.kind, F.kg); };
  const tick = mapEventsTick; mapEventsTick = function () {
    const ms = G.missions?.torneio;
    if (ms?.status === 'active' && ms.on && !prologueActive()) {
      if (G.day > ms.on) { ms.on = torneioFreeDay(G.day + 1); save(); showBanner('O Peixinho remarcou o torneio de pesca', 'Agora é ' + torneioWhen(ms.on) + ', no trapiche da Fronteira.', 'info', { world: true }); }
      else if (G.day === ms.on) { const today = torneioToday(); if (today && !today.intro) { today.intro = true; save(); showBanner('Hoje: torneio de pesca do Peixinho!', 'No trapiche da Fronteira, até o fim da tarde. Tu tem ' + TORNEIO.extra + ' lances a mais.', 'info', { world: true }); } }
    }
    tick(); const st = torneioToday(); if (!st || st.done || prologueActive() || tutorialActive()) return;
    if (!st.ended && worldNight()) torneioEnd(st);
    if (torneioOn() && worldOut?.map === 'vila') remindOnce('torneio-pesca', '🎣 Torneio de pesca no trapiche: o peixe mais pesado até o fim da tarde ganha!');
    // Nada acontecendo (sem conversa, laçada, jogo ou tarefa na mão): o peixinho na brasa começa.
    const calm = !modal && !scene && !phoneOpen && !G.lasso && !farmGame && !G.task && !G.dialogue && !G.bocce && !G.game && !G.penalties && !G.atCancha;
    if (st.ended && mapNight() && calm) torneioFinale();
  };
  const vila = WORLD_MAPS.vila, spots = vila.spots, draw = vila.draw;
  vila.spots = function () {
    const list = spots.call(this); if (!torneioOn()) return list;
    const [px, py] = torneioSpots().at(-1) || [640, 700];
    list.push({ id: 'torneio:peixinho', x: px, y: py, radius: 90, label: 'Ver o placar do torneio com o Peixinho', act: torneioPlacar });
    const river = list.find(s => s.id === 'river'); if (river) river.label = '🎣 Torneio · ' + river.label;
    return list;
  };
  vila.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers); if (!torneioOn()) return;
    const at = torneioSpots();
    TORNEIO.rivals.forEach((id, k) => {
      const p = at[k]; if (!p) return; const [x, y] = p; eventPerson(id, x, y, layers, -1);
      layers.push({ y: y + 1, draw: () => { const bob = Math.sin(frameClock * 2 + k) * 3; ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 14, y - 70); ctx.lineTo(x - 70, y - 120); ctx.stroke(); ctx.strokeStyle = 'rgba(240,240,230,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 70, y - 120); ctx.quadraticCurveTo(x - 120, y - 60, x - 140, y - 10 + bob); ctx.stroke(); ellipse(x - 140, y - 8 + bob, 5, 4, '#e84a3a'); } });
    });
    const pk = at[TORNEIO.rivals.length]; if (pk) { eventPerson('peixinhonabrasa', pk[0], pk[1], layers, -1); const sx = pk[0] + 100, sy = pk[1] + 90; layers.push({ y: sy, draw: () => torneioPlaca(sx, sy) }); }
  };
  // O troféu de pesca na estante de casa.
  const keep = lembrancas; lembrancas = function () { const list = keep(); return G.trophies?.pesca && !list.includes('pesca') ? [...list, 'pesca'] : list; };
  const shelf = drawLembranca; drawLembranca = function (id, x, y) { if (id === 'pesca') { drawTrophy(x, y, '#e0b040', (a, b) => { ctx.fillStyle = '#3a8ac8'; ctx.beginPath(); ctx.ellipse(a, b, 8, 4, 0, 0, Math.PI * 2); ctx.fill(); poly([[a + 6, b], [a + 12, b - 5], [a + 12, b + 5]], '#3a8ac8'); }); return; } return shelf(id, x, y); };
}
