// Eventos de mapa: além do evento da bodega, alguns dias têm algo acontecendo no mundo aberto. Aparecem no calendário,
// começam com uma cena na bodega (quem organiza entra e explica) e acontecem de noite, depois de fechar.
//   · Invasão de javalis (Valter): abater pelo menos 3 javalis pela Fronteira, numa caçada parecida com a laçada.
//   · Fandango no CTG (Jayme): servir trago e chope no balcão do CTG enquanto o povo dança (serve-events.js).
//   · Campeonato de pênaltis (Márcio e Marcelo): quartas, semi e final no campinho da Serra; o campeão leva troféu.
//   · Oktoberfest (Loli): servir chope no salão de Santa Catarina.
//   · Baile de capela (Badin): missa na capela da Serra e depois baile no salão, servindo vinho e polenta.
//   · Rodeio crioulo (Guri): prova de laço contra o relógio no CTG, com placar e troféu.
//   · Festa da Uva (Badin): concurso de vinho de garrafão no salão da Serra; ganha a melhor nota.
// Também aqui: o guri da vela, que aparece raramente na beira do rio, e a prateleira de lembranças da bodega.
'use strict';

const JAVALI_NEED = 3, JAVALI_HITS = 3;
const JAVALI_SPOTS = [[760, 1250], [1250, 1560], [2300, 1480], [3200, 1560], [1350, 2040], [3420, 2260], [880, 2120], [2650, 900], [3380, 820], [820, 830], [2380, 1960], [1100, 1880]];
const MAP_EVENTS = {
  javali: {
    id: 'javali', name: 'Invasão de javalis', icon: '🐗', giver: 'valter', place: 'Fronteira, de noite, depois de fechar',
    desc: 'Os javalis invadiram as lavouras da Fronteira. O Valter juntou um grupo de cuiudos: depois de fechar a bodega, ache e abata pelo menos 3 javalis pelo mapa.',
    reward: { cash: 90, xp: 70, rep: 3, friend: { valter: 6 } },
    days: n => n === 6 || n > 6 && (n - 6) % 21 === 0, requires: () => true,
    scene: [['valter', 'Ô, Sadi! Os javalis desceram do mato e reviraram a lavoura do Seu Anselmo inteirinha!'], ['valter', 'Juntei um grupo de cuiudos pra caçar hoje de noite. Bicho brabo, que dá cabeçada e derruba peão.'], ['sadi', 'Pode contar comigo, Valter.'], ['valter', 'Depois de fechar a bodega, sai e procura os bichos pela Fronteira. Chega perto, aperta E e laça com jeito. Espaço esquiva da cabeçada. Três javalis e a vizinhança te deve essa!']],
    tracker: () => { const st = mapEvState('javali'); if (st.done) return null; return { icon: '🐗', title: 'Invasão de javalis', goal: mapNight() ? 'Ache e abata 3 javalis pela Fronteira (' + st.kills + '/' + JAVALI_NEED + ')' : 'Hoje à noite, depois de fechar a bodega: caçar 3 javalis pela Fronteira' }; }
  },
  fandango: {
    id: 'fandango', name: 'Fandango no CTG', icon: '💃', giver: 'jayme', place: 'CTG da Fronteira, de noite',
    desc: 'Baile no CTG da Fronteira. O Jayme chamou o Sadi para cuidar do balcão: sirva trago e chope para a roda enquanto o povo dança. As bebidas são do CTG.',
    reward: { cash: 80, xp: 60, rep: 4, friend: { jayme: 8, manolima: 4, baitaca: 4, guri: 4 } },
    days: n => n === 9 || n > 9 && (n - 9) % 14 === 0, requires: () => true,
    scene: [['jayme', 'Buenas, vivente! Hoje tem fandango no CTG da Fronteira, e a bodega foi convidada.'], ['jayme', '“Onde tem gaita e tem mate, o gaúcho se acha em casa.” O bolicheiro do CTG adoeceu: tu cuida do balcão?'], ['sadi', 'Deixa comigo, seu Jayme!'], ['jayme', 'Depois de fechar, vem pro CTG. Trago e chope são do CTG: é só servir a roda enquanto o povo dança.']],
    tracker: () => { const st = mapEvState('fandango'); if (st.done) return null; return { icon: '💃', title: 'Fandango no CTG', goal: (mapNight() ? '' : 'De noite: ') + 'servir trago e chope no CTG' }; }
  },
  penalti: {
    id: 'penalti', name: 'Campeonato de pênaltis', icon: '⚽', giver: 'marcio', partner: 'marcelo', place: 'Campinho da Serra Gaúcha, de noite',
    desc: 'Os gêmeos da Casona organizaram um campeonato de pênaltis no campinho da Serra: quartas, semifinal e final, cinco cobranças para cada lado. Campeão leva troféu.',
    reward: { cash: 120, xp: 90, rep: 4, friend: { marcio: 6, marcelo: 6 } },
    days: n => n === 13 || n > 13 && (n - 13) % 21 === 0, requires: () => !regionLocked('serra'),
    scene: [['marcio', 'É o quê? Hoje tem campeonato de pênaltis no campinho da Serra, Sadi!'], ['marcelo', 'Quartas, semi e final, tudo na marca da cal. Podre de chique!'], ['sadi', 'Bah, faz anos que eu não bato um pênalti…'], ['marcio', 'Depois de fechar a bodega, sobe pro campinho. Campeão leva troféu pra parede, é o quê? Show de bola!']],
    tracker: () => { const st = mapEvState('penalti'); if (st.done) return null; return { icon: '⚽', title: 'Campeonato de pênaltis', goal: mapNight() ? 'No campinho da Serra: ' + CUP_ROUNDS[st.round || 0].toLowerCase() : 'Hoje à noite, depois de fechar: campinho da Serra Gaúcha' }; }
  },
  oktoberfest: {
    id: 'oktoberfest', name: 'Oktoberfest em Pomerode', icon: '🍺', giver: 'loligebien', place: 'Salão da Oktoberfest, Santa Catarina, de noite',
    desc: 'O Loli chamou o Sadi para o balcão da Oktoberfest: sirva chope para o salão enquanto a bandinha toca e o povo dança. O chope é da festa.',
    reward: { cash: 90, xp: 70, rep: 3, friend: { loligebien: 8 } },
    days: n => n === 16 || n > 16 && (n - 16) % 28 === 0, requires: () => !regionLocked('sc'),
    scene: [['loligebien', 'Prosit, Sadi! Hoje é Oktoberfest no salão de Pomerode, ja!'], ['loligebien', 'O chopeiro torceu o pé dançando. Tu vem servir chope? A fila é grande e a bandinha não para.'], ['sadi', 'Chope eu sirvo todo dia, Loli!'], ['loligebien', 'Depois de fechar, sobe pra Santa Catarina. O povo dança de tamanco e tu cuida das canecas, ja!']],
    tracker: () => { const st = mapEvState('oktoberfest'); if (st.done) return null; return { icon: '🍺', title: 'Oktoberfest', goal: (mapNight() ? '' : 'De noite: ') + 'servir chope no salão de Pomerode' }; }
  },
  rodeio: {
    id: 'rodeio', name: 'Rodeio crioulo no CTG', icon: '🤠', giver: 'guri', place: 'CTG da Fronteira, de noite',
    desc: 'Prova de laço contra o relógio no CTG: lace o terneiro o mais rápido que puder. O melhor tempo leva o troféu, que vai para a parede da bodega.',
    reward: { cash: 60, xp: 60, rep: 3, friend: { guri: 6 } },
    days: n => n === 19 || n > 19 && (n - 19) % 21 === 0, requires: () => true,
    scene: [['guri', 'Bah, tchê! Hoje tem rodeio crioulo no CTG da Fronteira!'], ['guri', 'Prova de laço contra o relógio: um terneiro, uma armada e o cronômetro do patrão.'], ['sadi', 'E quem ganha?'], ['guri', 'O melhor tempo leva o troféu. Eu tô inscrito… mas tu é neto do velho Sadi, tem laço no sangue. Depois de fechar, te espero no CTG!']],
    tracker: () => { const st = mapEvState('rodeio'); if (st.done) return null; return { icon: '🤠', title: 'Rodeio crioulo no CTG', goal: (mapNight() ? '' : 'Hoje à noite: ') + 'prova de laço contra o relógio, no CTG da Fronteira' }; }
  },
  capela: {
    id: 'capela', name: 'Baile de capela', icon: '⛪', giver: 'badin', place: 'Capela e salão da comunidade, Serra Gaúcha, de noite',
    desc: 'Missa na capela da comunidade e, depois, baile no salão. O Badin pediu ajuda no balcão: sirva vinho e polenta enquanto o povo dança.',
    reward: { cash: 90, xp: 70, rep: 4, friend: { badin: 6, marcio: 3, marcelo: 3 } },
    days: n => n === 11 || n > 11 && (n - 11) % 21 === 0, requires: () => !regionLocked('serra'),
    scene: [['badin', 'Ô, Sadi! Hoje tem missa na capela e depois baile, como nos tempos da nona!'], ['badin', 'O padre reza, a gaita toca e a polenta sai do tacho. Tu me ajuda no balcão? Vinho e polenta pra comunidade inteira.'], ['sadi', 'Conta comigo, Badin!'], ['badin', 'Depois de fechar, sobe pra Serra e vai direto na capela. Começa com a missa, hein, que a nona tá de olho!']],
    tracker: () => { const st = mapEvState('capela'); if (st.done) return null; return { icon: '⛪', title: 'Baile de capela', goal: (mapNight() ? '' : 'De noite: ') + 'missa na capela da Serra e baile no salão' }; }
  },
  uva: {
    id: 'uva', name: 'Festa da Uva', icon: '🍇', giver: 'badin', place: 'Salão da comunidade, Serra Gaúcha, de noite',
    desc: 'Concurso de vinho de garrafão no salão da comunidade da Serra. Leve um garrafão do teu vinho: os jurados provam a cor, o aroma e o sabor. Ganha o melhor.',
    reward: { cash: 120, xp: 90, rep: 5, friend: { badin: 8 } },
    days: n => n === 22 || n > 22 && (n - 22) % 28 === 0, requires: () => !regionLocked('serra') && !!G.badinShop,
    scene: [['badin', 'Ô, Sadi! Hoje é a Festa da Uva no salão da comunidade!'], ['badin', 'Tem concurso de vinho de garrafão. A nona é jurada, o padre também, e o Nono Bepi de Garibaldi já tá se achando o dono do troféu.'], ['sadi', 'Vou levar o vinho da minha parreira!'], ['badin', 'Isso! Depois de fechar, sobe pra Serra com um garrafão. Que ganhe o melhor… e que seja o teu, hehe.']],
    tracker: () => { const st = mapEvState('uva'); if (st.done) return null; return { icon: '🍇', title: 'Festa da Uva', goal: (mapNight() ? '' : 'Hoje à noite: ') + 'leve um vinho de garrafão ao salão da comunidade, na Serra (tem ' + Math.floor(haveItem('vinho')) + ')' }; }
  }
};
// Dia de cada evento, contado do primeiro dia de bodega (a sexta do tutorial = dia 1). Só entra no calendário se a região estiver aberta.
function mapEventFor(day = G.day) {
  if (!G?.missions || !G.tutorial?.complete && day <= (G.tutorial?.day || 1)) return null;
  const n = dayNumber(day);
  return Object.values(MAP_EVENTS).find(e => e.days(n) && e.requires())?.id || null;
}
function mapEvState(id) {
  if (G.mapEv?.day !== G.day || G.mapEv.id !== id) G.mapEv = { day: G.day, id, intro: false, done: false, kills: 0, dead: {}, told: false };
  return G.mapEv;
}
function mapEventToday() { const id = mapEventFor(); return id ? { id, def: MAP_EVENTS[id], st: mapEvState(id) } : null; }
function mapNight() { return G.phase === 'closed'; }
const MAP_REMIND = {
  javali: ['🐗 Os javalis estão soltos! Saia pela porta e cace com os cuiudos.', '🐗 Os cuiudos se espalharam: ache os javalis pela Fronteira e aperte E perto deles.'],
  fandango: ['💃 Fandango no CTG: o Jayme te espera no balcão.', '💃 Tem música no CTG: entre e procure o Jayme.'],
  capela: ['⛪ Missa e baile de capela na Serra.', '⛪ A missa vai começar: entre na capela da Serra.'],
  penalti: ['⚽ O campeonato de pênaltis já vai começar no campinho da Serra.', '⚽ Campeonato de pênaltis: suba para o campinho da Serra.'],
  oktoberfest: ['🍺 Oktoberfest: o Loli te espera no salão de Pomerode.', '🍺 Oktoberfest: o salão fica em Santa Catarina.'],
  rodeio: ['🤠 O rodeio crioulo começou no CTG da Fronteira.', '🤠 Rodeio crioulo: entre no CTG e fale com o Guri.'],
  uva: ['🍇 A Festa da Uva começou no salão da comunidade, na Serra.', '🍇 Festa da Uva: leve um vinho de garrafão ao salão da comunidade, na Serra.']
};
function mapEventsTick() {
  // Noite do guri da vela: só uma pista, sem dizer onde nem quem.
  if (worldOut?.map === 'vila' && negrinhoTonight()) remindOnce('vela', '🕯️ Uma luz de vela piscou lá pros lados do rio…');
  const ev = mapEventToday(); if (!ev || prologueActive() || tutorialActive()) return;
  const { def, st } = ev;
  // Cada evento começa com uma cena: quem organiza entra na bodega e explica.
  if (!st.intro && storyCalm() && !worldOut && ['prep', 'closed'].includes(G.phase)) { st.intro = true; save(); playEventScene(def); return; }
  if (st.done || !mapNight()) return;
  const r = MAP_REMIND[def.id]; if (r) remindOnce('mapa-' + def.id + (worldOut ? '-fora' : ''), worldOut ? r[1] : r[0]);
}
function playEventScene(def) {
  const near = { x: 900, y: 640 }, who = def.partner ? [def.giver, def.partner] : def.giver;
  const steps = [{ view: 'bodega' }, { do: () => { G.player = { ...G.player, x: 800, y: 640, dx: 1, dy: 0, walk: false }; } }, { fade: 'in', time: .4 }, { actor: def.giver, x: ENTRY.x, y: ENTRY.y, dx: -1 }];
  if (def.partner) steps.push({ actor: def.partner, x: ENTRY.x + 50, y: ENTRY.y + 10, dx: -1 });
  steps.push({ do: () => AudioEngine.doorChime() }, { walk: who, to: def.partner ? [near, { x: near.x + 60, y: clamp(near.y + 30, 470, 860) }] : near });
  for (const [s, text] of def.scene) steps.push({ say: s, text });
  steps.push({ walk: who, to: def.partner ? [{ x: ENTRY.x, y: ENTRY.y }, { x: ENTRY.x + 40, y: ENTRY.y }] : { x: ENTRY.x, y: ENTRY.y } });
  playSteps(steps, 'evento-' + def.id, () => talk([['card', '<b>' + def.icon + ' ' + def.name + '</b><br>' + def.desc + '<br><i>Onde: ' + def.place + '</i><br><br>Recompensa:' + rewardHTML(def.reward), 'Evento de hoje no mapa']], null, 'Combinado'));
}


// ---------- Invasão de javalis ----------
function javaliNight() { const ev = mapEventToday(); return ev?.id === 'javali' && !ev.st.done && mapNight(); }
function javaliList() { const st = mapEvState('javali'); return JAVALI_SPOTS.filter(([x, y]) => WORLD_MAPS.vila.canWalk(x, y)).slice(0, 7).map(([x, y], i) => ({ i, x, y })).filter(b => !st.dead[b.i]); }
function javaliSpots() { if (!javaliNight() || worldOut?.map !== 'vila') return []; return javaliList().map(b => ({ id: 'javali:' + b.i, x: b.x, y: b.y + 20, radius: 120, label: 'Javali! · caçar', act: () => startHunt(b.i) })); }
// Javali: corpo escuro, cerdas no lombo, focinho e presas.
function drawJavali(x, y, dir = 1, frame = 0, scale = 1.4, down = false) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir < 0 ? -scale : scale, scale);
  ellipse(0, 2, 34, 7, '#1c140c55');
  if (down) { ctx.rotate(.12); ellipse(0, -14, 32, 13, '#4a3424'); ellipse(26, -12, 11, 9, '#4a3424'); rect(34, -14, 9, 8, '#5a3a2a', 3); for (const lx of [-16, -6, 10, 20]) rect(lx, -6, 14, 5, '#2e2018', 2); txt('✖', 28, -16, 8, '#1a1008', 'center', 'Arial', false); ctx.restore(); return; }
  const leg = frame % 2 ? 3 : -3;
  for (const [lx, o] of [[-18, leg], [-8, -leg], [12, leg], [22, -leg]]) rect(lx + o - 3, -16, 6, 16, '#2e2018', 2);
  rect(-34, -31, 7, 3, '#2a1a10'); ellipse(0, -26, 30, 16, '#4a3424'); ellipse(-4, -34, 24, 7, '#5a4030');
  for (let k = 0; k < 7; k++) rect(-20 + k * 6, -45 + Math.abs(k - 3), 3, 8, '#24160c');
  ellipse(27, -24, 12, 10, '#4a3424'); rect(35, -27, 11, 9, '#5a3a2a', 3); ellipse(45, -23, 2.5, 2.5, '#24160c');
  rect(35, -20, 7, 2, '#f4ecd8'); rect(29, -37, 4, 6, '#24160c'); ellipse(31, -28, 1.7, 1.7, '#ff5a30');
  ctx.restore();
}
function startHunt(i) {
  if (G.lasso || G.bocce || G.game || !javaliNight()) return;
  closeDialog(true); if (phoneOpen) togglePhone(false); showRpgBox('worldTalk', null);
  const boar = { id: 0, x: 980, y: 640, dx: -1, dy: 0, state: 'free', mode: 'roam', t: 1.6, speed: 40, rope: 0, javali: true };
  G.lasso = { mode: 'javali', boarIndex: i, bois: [boar], caught: 0, need: 1, charge: 0, charging: false, throw: null, saved: { ...G.player }, fx: 1, fy: 0, time: 0, queros: [], hits: 0 };
  G.player = { x: 260, y: 700, dx: 1, dy: 0, walk: false };
  $('lassoUI').classList.remove('hidden'); updateLassoUI(); AudioEngine.moo(.08, .55);
  if (!G.taught?.javali) { G.taught ??= {}; G.taught.javali = true; showBanner('Caçada de javali', 'Segure Q e solte com o círculo sobre o javali (' + JAVALI_HITS + ' laços). Alvo vermelho no chão: ele vai investir, saia ou aperte Espaço.', 'info'); }
  save();
}
// O javali fuça, encara o Sadi, marca o alvo no chão e investe. A cabeçada joga o peão longe.
function boarTick(L, b, dt) {
  const p = G.player; b.t -= dt; b.frame = (b.frame || 0) + dt;
  if (b.mode === 'warn') { b.dx = b.tx > b.x ? 1 : -1; if (b.t <= 0) { const d = Math.hypot(b.tx - b.x, b.ty - b.y) || 1; b.mode = 'charge'; b.vx = (b.tx - b.x) / d; b.vy = (b.ty - b.y) / d; b.left = d + 140; AudioEngine.swoosh(); } return; }
  if (b.mode === 'charge') {
    const s = 540 * dt; b.x += b.vx * s; b.y += b.vy * s; b.left -= s; b.dx = b.vx;
    if (!(L.immune > 0) && !(L.dash > 0) && Math.hypot(p.x - b.x, p.y - b.y) < 60) boarHit(L, b);
    if (b.left <= 0 || b.x < 80 || b.x > 1320 || b.y < 470 || b.y > 860) { b.x = clamp(b.x, 80, 1320); b.y = clamp(b.y, 470, 860); b.mode = 'rest'; b.t = 1 + Math.random() * .8; }
    return;
  }
  if (b.mode === 'rest') { if (b.t <= 0) { b.mode = 'roam'; b.t = .8 + Math.random() * 1.2; } return; }
  b.x = clamp(b.x + b.dx * b.speed * dt, 80, 1320); b.y = clamp(b.y + (b.dy || 0) * b.speed * dt, 470, 860);
  if (b.t <= 0) {
    if (Math.hypot(p.x - b.x, p.y - b.y) < 560) { b.mode = 'warn'; b.t = .85; b.tx = clamp(p.x, 70, 1330); b.ty = clamp(p.y, 460, 870); AudioEngine.moo(.07, .5); }
    else { const a = Math.random() * Math.PI * 2; b.dx = Math.cos(a); b.dy = Math.sin(a) * .5; b.speed = 60; b.t = 1 + Math.random() * 1.5; }
  }
}
function boarHit(L, b) {
  const p = G.player; L.immune = 1.1; L.charging = false; L.knock = .35; L.knockX = b.vx * 720; L.knockY = b.vy * 450; L.hits = (L.hits || 0) + 1;
  AudioEngine.ouch(); effect('Cabeçada de javali!', p.x, p.y - 150, '#ffb3a0'); fxPuffs(p.x, p.y - 60, 6, 90, '#9a8a6a');
  b.left = Math.min(b.left, 60);
  // Cinco cabeçadas e o Sadi desiste: o javali foge e dá para tentar de novo (nada trava).
  if (L.hits >= 5) { L.flee = true; effect('O javali te botou pra correr!', p.x, p.y - 190, '#ffd0a0'); setTimeout(() => { if (G.lasso === L) finishHunt(L); }, 900); }
  updateLassoUI();
}
function finishHunt(L) {
  G.player = { ...L.saved }; G.lasso = null; keys.clear(); $('lassoUI').classList.add('hidden');
  const st = mapEvState('javali');
  if (L.caught > 0) {
    st.dead[L.boarIndex] = true; st.kills++; gainXP(10); AudioEngine.heart();
    if (st.kills >= JAVALI_NEED && !st.done) {
      st.done = true; const rw = MAP_EVENTS.javali.reward; grantReward(rw);
      talk([['valter', 'Bah, Sadi! ' + st.kills + ' javalis! Os cuiudos não acreditaram, o Seu Anselmo até chorou de alegria.'], ['valter', 'A lavoura tá salva. A vizinhança mandou uma vaquinha pra ti.'], ['reward', rw, 'Invasão de javalis · concluída']], null, 'Receber');
    } else floatNote('🐗 Javali abatido! ' + st.kills + '/' + JAVALI_NEED + ' esta noite.');
  } else floatNote('🐗 O javali fugiu pro mato. Respira e tenta de novo.');
  save(); refreshHUD();
}
// Laço certeiro no javali: com três, ele está laçado e abatido; antes disso, fica brabo e investe.
function javaliRoped(L, b) {
  if (b.rope >= JAVALI_HITS) { b.state = 'down'; b.mode = 'down'; L.caught++; AudioEngine.heart(); burst(b.x, b.y - 30, 'leaf'); effect('Javali laçado e abatido!', b.x, b.y - 90, '#e1ff9e'); }
  else { b.mode = 'warn'; b.t = .55; b.tx = clamp(G.player.x, 70, 1330); b.ty = clamp(G.player.y, 460, 870); AudioEngine.moo(.07, .5); effect('Laço ' + b.rope + '/' + JAVALI_HITS + ' · o javali ficou brabo!', b.x, b.y - 100, '#ffe9a8'); }
}
// Caçada de noite: o campo escurece e o lampião dos cuiudos ilumina em volta do Sadi.
function huntBackdrop() {
  rect(0, 0, W, H, 'rgba(12,18,46,.55)');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(G.player.x, G.player.y - 60, 20, G.player.x, G.player.y - 60, 330);
  g.addColorStop(0, 'rgba(255,190,100,.34)'); g.addColorStop(1, 'rgba(255,190,100,0)'); ctx.fillStyle = g; ctx.fillRect(G.player.x - 340, G.player.y - 400, 680, 680); ctx.restore();
}
function drawHuntBoar(L, b) {
  if (b.mode === 'warn') { const pulse = .5 + .5 * Math.sin(L.time * 18); ellipse(b.tx, b.ty, 58, 22, `rgba(230,50,36,${.18 + .16 * pulse})`); ctx.strokeStyle = `rgba(235,52,40,${.7 + .3 * pulse})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(b.tx, b.ty, 58, 22, 0, 0, Math.PI * 2); ctx.stroke(); }
  drawJavali(b.x, b.y, b.dx < 0 ? -1 : 1, b.mode === 'charge' ? Math.floor(L.time * 14) : b.mode === 'warn' ? Math.floor(L.time * 6) : Math.floor(L.time * 4), 1.9, b.state === 'down');
  if (b.state === 'free' && b.rope) bar(b.x - 32, b.y - 100, 64, b.rope / JAVALI_HITS, '#e8cc8a');
}
// Valter com o lampião na frente da bodega, coordenando os cuiudos.
const CUIUDOS = { x: 1500, y: 650 };
function cuiudosSpot() { return javaliNight() && worldOut?.map === 'vila' ? [{ id: 'cuiudos', x: CUIUDOS.x, y: CUIUDOS.y, label: 'Falar com o Valter (caçada)', act: () => { const st = mapEvState('javali'); const i = PEOPLE.findIndex(p => p.id === 'valter'); worldTalkAt = { x: worldOut.x, y: worldOut.y }; showRpgBox('worldTalk', { person: i, name: 'Valter', reply: 'Os cuiudos viram javali pros lados da lavoura, do pouso dos tropeiros e da beira do rio. Faltam ' + Math.max(0, JAVALI_NEED - st.kills) + '. Laça com jeito!' }); } }] : []; }

// ---------- Fandango no CTG ----------
function fandangoNight() { const ev = mapEventToday(); return ev?.id === 'fandango' && mapNight(); }
const FANDANGO_JAYME = { x: 760, y: 500 };
function fandangoMenu() {
  const st = mapEvState('fandango'), j = PEOPLE.findIndex(p => p.id === 'jayme');
  if (st.done) { worldTalkAt = { x: worldOut.x, y: worldOut.y }; showRpgBox('worldTalk', { person: j, name: 'Jayme Caetano Braun', reply: '“Quem dança no fandango não esquece a noite.” Volta no próximo, vivente!' }); return; }
  talk([['jayme', 'Chegou o bolicheiro! Trago e chope ficam ali no balcão: leva pra quem levantar o copo.'], ['jayme', 'Enquanto a roda gira, ninguém fica de goela seca. Bora!']], () => startServe('fandango'), 'Começar');
}

// ---------- Campeonato de pênaltis (campinho da Serra) ----------
// Quartas, semifinal e final contra os especiais, cada uma uma disputa normal de cinco cobranças.
const CUP_ROUNDS = ['Quartas de final', 'Semifinal', 'Final'], CUP_RIVALS = ['badin', 'marcio', 'guri', 'marcelo', 'manolima'];
function penaltiNight() { const ev = mapEventToday(); return ev?.id === 'penalti' && mapNight(); }
function cupRival(round) { const list = CUP_RIVALS.map(id => PEOPLE.findIndex(p => p.id === id)).filter(i => i >= 0 && specialOpponent(i) && PEOPLE[i].id !== G.avatarId && !PEOPLE[i].removed); return list[round % list.length]; }
function cupMenu() {
  const st = mapEvState('penalti');
  if (st.done) { worldSay(st.won ? 'O campinho ainda comemora o campeão: tu!' : 'O campeonato acabou. No próximo tu leva o troféu!'); return; }
  const r = st.round || 0, rival = cupRival(r);
  talk([['marcio', CUP_ROUNDS[r] + '! Teu adversário: ' + PEOPLE[rival].name + '. Cinco cobranças pra cada lado, é o quê?'], ['marcelo', r === 2 ? 'Vale o troféu! Show de bola!' : 'Quem perder tá fora. Show de bola!']], startCupMatch, 'Entrar em campo');
}
function startCupMatch() {
  if (!started || G.penalties || G.bocce || G.game || G.task || !penaltiNight() || !worldOut) return;
  const st = mapEvState('penalti'), round = st.round || 0, opponent = cupRival(round);
  G.penalties = { version: 1, opponent, returnTo: { ...worldOut, walk: false }, score: [0, 0], used: [0, 0], history: [[], []], turn: 0, phase: 'aim', clock: 0, aimX: 0, aimY: 1.1, curve: 0, power: 0, keeperSide: 0, keeperHigh: 1.15, keeper: null, shot: null, paused: false, settled: false, winner: null, talk: '', result: '', cup: { round } };
  closeDialog(true); G.player.walk = false; keys.clear(); pointerHold = false;
  penaltyNextTurn(true); showPenalties(); save(); AudioEngine.ready();
}
function cupAfter(m) {
  const st = mapEvState('penalti'), def = MAP_EVENTS.penalti, round = m.cup.round;
  if (m.winner === 0 && round < 2) {
    st.round = round + 1; save();
    talk([['marcelo', 'Passou de fase! ' + m.score[0] + ' a ' + m.score[1] + '. Show de bola!'], ['marcio', 'Agora é a ' + CUP_ROUNDS[st.round].toLowerCase() + ', contra ' + PEOPLE[cupRival(st.round)].name + '. Respira e volta pra marca da cal!']], cupMenu, 'Próxima fase');
    return;
  }
  st.done = true; st.won = m.winner === 0;
  if (st.won) { G.trophies ??= {}; G.trophies.penalti = { day: G.day }; }
  const rw = st.won ? def.reward : { cash: 20 * round, xp: 30 + 15 * round, friend: { marcio: 3, marcelo: 3 } };
  grantReward(rw); save(); refreshHUD();
  talk(st.won ? [['marcio', 'É CAMPEÃO! O bodegueiro é campeão de pênaltis da Serra!'], ['marcelo', 'Toma o troféu, Sadi. Vai pra prateleira da bodega, do lado da janela. Show de bola!'], ['reward', rw, 'Campeonato de pênaltis · campeão']]
    : [['marcelo', 'Ficou nas ' + CUP_ROUNDS[round].toLowerCase() + ', mas foi bonito de ver!'], ['marcio', 'No próximo campeonato tu volta pra buscar o troféu, é o quê?'], ['reward', rw, 'Campeonato de pênaltis']], null, 'Receber');
}
{
  const settle = settlePenalties; settlePenalties = function () { const m = G.penalties, was = m?.settled; settle(); if (m?.cup && !was && m.settled) m.talk = m.winner === 0 ? (m.cup.round === 2 ? 'Campeão! O troféu é teu!' : 'Passou de fase! Bora pra próxima.') : 'Eliminado… mas foi bonito de ver.'; };
  const leave = leavePenalties; leavePenalties = function (force = false) { const m = G.penalties; leave(force); if (m?.cup && m.settled && !G.penalties) cupAfter(m); };
}

// ---------- Oktoberfest (salão em Santa Catarina) ----------
// Servir chope para o salão enquanto o povo dança de tamanco (serve-events.js).
const OKTO_SPOT = { x: 1120, y: 520 };
function oktoNight() { const ev = mapEventToday(); return ev?.id === 'oktoberfest' && mapNight(); }
function oktoMenu() {
  const st = mapEvState('oktoberfest'), i = PEOPLE.findIndex(p => p.id === 'loligebien');
  if (st.done) { worldTalkAt = { x: worldOut.x, y: worldOut.y }; showRpgBox('worldTalk', { person: i, name: PEOPLE[i].name, reply: 'Prost, Sadi! Ano que vem tu volta pro chope, ja?' }); return; }
  talk([['loligebien', 'Avental, ja! O chope tá na chopeira, ali no balcão: leva pra quem levantar a mão.'], ['loligebien', 'A bandinha não para e o povo dança de tamanco. Rápido, que a fila é grande!']], () => startServe('oktoberfest'), 'Começar');
}

// ---------- Rodeio crioulo (CTG) ----------
// Prova de laço contra o relógio: um terneiro, três laços certeiros. O placar compara com os peões da Fronteira.
const RODEO_HITS = 3, RODEO_LIMIT = 60, RODEO_SPOT = { x: 1160, y: 500 };
const RODEO_RIVALS = [['guri', 13.6], ['baitaca', 16.1], ['manolima', 18.4], ['jayme', 21]];
function rodeioNight() { const ev = mapEventToday(); return ev?.id === 'rodeio' && mapNight(); }
function rodeioMenu() {
  const st = mapEvState('rodeio');
  if (st.done) { talk([['card', rodeioBoardHTML(rodeioBoard(st.time)), 'Placar do rodeio']], null, 'Fechar'); return; }
  talk([['guri', 'Tu é o próximo, tchê! Um terneiro, ' + RODEO_HITS + ' laços certeiros. O cronômetro dispara quando tu entrar na arena.'], ['card', rodeioBoardHTML(rodeioBoard(null)), 'Placar até agora']], startRodeio, 'Entrar na arena');
}
function startRodeio() {
  if (G.lasso || G.bocce || G.game || !rodeioNight()) return;
  closeDialog(true); if (phoneOpen) togglePhone(false); showRpgBox('worldTalk', null);
  const calf = { id: 0, coat: 2, x: 900, y: 640, dx: -1, dy: 0, state: 'free', t: .4, speed: 60, terneiro: true };
  G.lasso = { mode: 'rodeio', bois: [calf], caught: 0, need: 1, charge: 0, charging: false, throw: null, saved: { ...G.player }, fx: 1, fy: 0, time: 0, queros: [] };
  G.player = { x: 220, y: 700, dx: 1, dy: 0, walk: false };
  $('lassoUI').classList.remove('hidden'); updateLassoUI(); AudioEngine.moo(.08, 1.3); save();
}
function rodeioTime(L) { return L.doneTime ?? L.time; }
function rodeioUI(L) {
  const ui = $('lassoUI'), b = L.bois[0]; ui.querySelector('b').textContent = 'Rodeio crioulo · prova de laço';
  ui.querySelectorAll('small')[1].innerHTML = 'WASD anda · segure <b>Q</b> e solte em cima do terneiro · ' + RODEO_HITS + ' laços param o relógio';
  $('lassoCount').textContent = '⏱ ' + rodeioTime(L).toFixed(1).replace('.', ',') + ' s · laços ' + Math.min(b.rope || 0, RODEO_HITS) + '/' + RODEO_HITS;
  $('lassoHerd').textContent = 'Tempo a bater: ' + rodeioBoard(null)[0].name + ', ' + rodeioBoard(null)[0].time.toFixed(1).replace('.', ',') + ' s';
  $('lassoFinish').disabled = true; $('lassoFinish').textContent = L.caught ? 'Terneiro laçado!' : 'Lace o terneiro';
}
function drawRodeioHUD(L) {
  rect(W / 2 - 120, 92, 240, 54, 'rgba(20,14,8,.72)', 10, '#e8cc8a');
  txt('⏱ ' + rodeioTime(L).toFixed(1).replace('.', ',') + ' s', W / 2, 120, 30, L.caught ? '#c8ff9e' : '#fff3c8');
}
function rodeioBoard(time) {
  const list = RODEO_RIVALS.map(([id, base], k) => ({ name: PEOPLE.find(p => p.id === id)?.name || id, time: +(base + ((G.day * 7 + k * 5) % 10) * .23).toFixed(1) }));
  if (time != null) list.push({ name: avatarName() + ' (tu)', time, me: true });
  return list.sort((a, b) => a.time - b.time);
}
function rodeioBoardHTML(board) { return '<table class="score-board"><tbody>' + board.map((r, k) => `<tr${r.me ? ' class="me"' : ''}><td>${k + 1}º</td><td>${escapeHTML(r.name)}</td><td>${r.time.toFixed(1).replace('.', ',')} s</td></tr>`).join('') + '</tbody></table>'; }
function finishRodeio(L) {
  G.player = { ...L.saved }; G.lasso = null; keys.clear(); $('lassoUI').classList.add('hidden');
  const st = mapEvState('rodeio'), def = MAP_EVENTS.rodeio, time = L.caught ? +rodeioTime(L).toFixed(1) : null, board = rodeioBoard(time), place = board.findIndex(r => r.me) + 1, won = place === 1;
  st.done = true; st.time = time;
  if (won) { G.trophies ??= {}; G.trophies.rodeio = { day: G.day, time }; }
  const rw = won ? def.reward : { cash: time == null ? 0 : 25, xp: time == null ? 15 : 35, friend: { guri: 3 } };
  grantReward(rw); if (won) AudioEngine.ready(); save(); refreshHUD();
  talk([['card', rodeioBoardHTML(board), time == null ? 'Placar do rodeio · tempo esgotado' : 'Placar do rodeio · ' + place + 'º lugar'],
    ['guri', won ? 'Bah, tchê! Ganhou do Guri de Uruguaiana! Toma o troféu, que esse vai pra parede da bodega.' : time == null ? 'O terneiro te deu um baile, hehe. No próximo rodeio tu desconta!' : place + 'º lugar com ' + time.toFixed(1).replace('.', ',') + ' segundos. Laçada de respeito, vivente!'],
    ['reward', rw, 'Rodeio crioulo' + (won ? ' · campeão' : '')]], null, 'Receber');
}

// ---------- Festa da Uva (salão da comunidade, Serra) ----------
// Concurso de vinho de garrafão: os jurados provam cor, aroma e sabor; ganha a nota mais alta.
const UVA_SPOT = { x: 950, y: 480 }, UVA_RIVALS = [['Nono Bepi, de Garibaldi', 8.7], ['Dona Gema, de Bento Gonçalves', 8.2], ['Seu Ademir, de Flores da Cunha', 7.3]];
function uvaNight() { const ev = mapEventToday(); return ev?.id === 'uva' && mapNight(); }
function uvaMenu() {
  const st = mapEvState('uva'), i = PEOPLE.findIndex(p => p.id === 'badin');
  if (st.done) { worldTalkAt = { x: worldOut.x, y: worldOut.y }; showRpgBox('worldTalk', { person: i, name: 'Badin', reply: st.won ? 'O troféu da Festa da Uva é teu, Sadi! A nona não para de falar do teu vinho.' : 'Ano que vem tu ganha! A parreira só melhora com o tempo, igual a gente.' }); return; }
  if (haveItem('vinho') < 1) { warnDialog('Falta o vinho de garrafão', 'Para o concurso, traga <b>1 vinho de garrafão</b> (na despensa da bodega ou no inventário).<br>Sementes de uva com o Badin → parreira na horta → vinho na mesa de compota da bodega.'); return; }
  talk([['badin', 'Põe o teu garrafão na mesa dos jurados! A nona prova a cor, o padre o aroma e o Nono Bepi o sabor.'], ['badin', 'Serve com calma: taça cheia até a metade, nem uma gota fora.']], startTasting, 'Servir os jurados');
}
function startTasting() {
  startFarmGame({ title: 'Festa da Uva · concurso de vinho', stages: [
    { kind: 'timing', label: 'Cor', text: 'Sirva a taça da nona contra a luz: aperte <span class="keycap">E</span> com o marcador na faixa verde.', zone: [.4, .58], speed: .9, button: 'Servir', hitText: 'Cor de rubi!', missText: 'Respingou na toalha…' },
    { kind: 'timing', label: 'Aroma', text: 'A taça do padre: gire o vinho e sirva no ponto.', zone: [.42, .58], speed: 1.05, button: 'Servir', hitText: 'Cheiro de parreiral!', missText: 'Encheu demais…' },
    { kind: 'timing', label: 'Sabor', text: 'O Nono Bepi é o mais exigente. Capricha!', zone: [.44, .58], speed: 1.2, button: 'Servir', hitText: 'O Nono até sorriu!', missText: 'O Nono torceu o nariz…' }
  ], done: r => uvaEnd(r.filter(Boolean).length) });
}
function uvaBoard(score) { return [...UVA_RIVALS.map(([name, s], k) => ({ name, score: +(s + ((G.day + k * 3) % 3) * .07).toFixed(1) })), { name: avatarName() + ' (tu)', score, me: true }].sort((a, b) => b.score - a.score); }
function uvaEnd(hits) {
  if (haveItem('vinho') < 1) return;
  takeItems({ vinho: 1 });
  const st = mapEvState('uva'), def = MAP_EVENTS.uva, score = +(5.8 + hits * 1.35).toFixed(1), board = uvaBoard(score), place = board.findIndex(r => r.me) + 1;
  st.done = true; st.won = place === 1;
  if (st.won) { G.trophies ??= {}; G.trophies.uva = { day: G.day, score }; }
  const rw = st.won ? def.reward : { cash: 30, xp: 40, friend: { badin: 4 } };
  grantReward(rw); if (st.won) AudioEngine.ready(); save(); refreshHUD();
  talk([['card', '<table class="score-board"><tbody>' + board.map((r, k) => `<tr${r.me ? ' class="me"' : ''}><td>${k + 1}º</td><td>${escapeHTML(r.name)}</td><td>nota ${r.score.toFixed(1).replace('.', ',')}</td></tr>`).join('') + '</tbody></table>', 'Concurso de vinho · ' + place + 'º lugar'],
    ['badin', st.won ? 'CUDIO! O vinho de garrafão do Sadi ganhou do Nono Bepi! O troféu vai pra bodega!' : 'Nota ' + score.toFixed(1).replace('.', ',') + '! ' + place + 'º lugar. O Nono Bepi tá suando frio pro ano que vem, hehe.'],
    ['reward', rw, 'Festa da Uva' + (st.won ? ' · campeão' : '')]], null, 'Receber');
}

// ---------- O guri da vela (beira do rio, de noite) ----------
// Raro: depois do quinto dia de bodega, em mais ou menos uma noite a cada quatro, uma vela anda pela beira do rio.
// Por enquanto é um freguês genérico em silhueta; depois entra o sprite do Negrinho do Pastoreio.
const NEGRINHO_SPRITE = 3, NEGRINHO_PATH = { x: 610, y0: 1120, y1: 1760 };
function negrinhoTonight() {
  if (G.relics?.cuia_vo || G.phase !== 'closed' || !G.tutorial?.complete || prologueActive()) return false;
  if (G.negrinhoNight === G.day) return true;
  const h = Math.sin(G.day * 78.233 + 12.9898) * 43758.5453; return bodegaDays() >= 5 && h - Math.floor(h) < .25;
}
function negrinhoPos() { const t = frameClock * .045, k = (Math.sin(t) + 1) / 2; return { x: NEGRINHO_PATH.x + Math.sin(frameClock * .6) * 12, y: NEGRINHO_PATH.y0 + (NEGRINHO_PATH.y1 - NEGRINHO_PATH.y0) * k, dx: Math.sin(frameClock * .6) > 0 ? 1 : -1 }; }
function drawNegrinho(x, y, dx = 1, walking = true, light = 1) {
  ctx.save(); ctx.filter = 'brightness(.32) saturate(.25)'; personDraw(NEGRINHO_SPRITE, x, y, walking, false, dx); ctx.restore();
  const cx = x + 20 * dx, cy = y - 70, fl = 1 + Math.sin(frameClock * 11) * .12;
  rect(cx - 2.5, cy, 5, 14, '#f4ecd8'); ellipse(cx, cy - 5, 3 * fl, 6 * fl, '#ffd36a'); ellipse(cx, cy - 4, 1.5, 3, '#fff6d8');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(cx, cy - 6, 130 * light, .32 * light * fl, '255,190,100'); ctx.restore();
}
function negrinhoSpot() {
  if (!negrinhoTonight() || worldOut?.map !== 'vila') return [];
  const p = negrinhoPos(); return [{ id: 'negrinho', x: p.x, y: p.y, radius: 110, label: 'Uma luz de vela na beira do rio…', act: meetNegrinho }];
}
function negrinhoSteps() {
  const S = [];
  const say = (who, text) => S.push({ say: who, text });
  S.push({ view: 'rio' }, { actor: 'sadi', x: 1080, y: 690, dx: -1 }, { actor: 'negrinho', x: 240, y: 660, dx: 1 }, { fade: 'in', time: 1.2 });
  say('sadi', 'Uma vela andando sozinha na beira do rio…?');
  S.push({ walk: 'negrinho', to: { x: 760, y: 680 } });
  say('negrinho', 'Não te assusta, moço. Eu só ando por aqui procurando o que se perdeu.');
  say('sadi', 'Tu é… o guri da vela? Meu vô contava de ti quando eu era pequeno.');
  say('negrinho', 'O teu vô, o seu Sadi do armazém. Toda vez que perdia alguma coisa, ele acendia um toco de vela pra mim.');
  say('negrinho', 'Numa noite de cheia, ele atravessou esse rio a cavalo, buscando a parteira. Teu pai tava pra nascer.');
  say('negrinho', 'Na correnteza, ele perdeu a cuia de porongo que tinha sido do pai dele. Nunca mais achou.');
  say('sadi', 'Ele falava dessa cuia… Dizia que foi a única coisa que o rio levou dele.');
  say('negrinho', 'O rio levou, e as raízes do sarandi guardaram. Quando eu achei, o teu vô já tinha ido pra outra morada.');
  say('negrinho', 'Então fiquei esperando alguém do sangue dele acender de novo aquele galpão.');
  S.push({ walk: 'negrinho', to: { x: 960, y: 690 } });
  S.push({ overlay: 'note', text: '🧉 Uma cuia de porongo, gasta pelo tempo. Na casca, riscado com ponta de faca:<br><br><i>“Pra quem vier depois de mim: o mate é pra repartir.”</i><br><br>— S.' });
  say('sadi', 'É a letra do vô…');
  say('negrinho', 'O que a gente ama não se perde, moço. Só fica esperando a hora de ser achado.');
  say('negrinho', 'Põe ela na bodega, perto do balcão. Ele vai gostar de ver, de onde estiver.');
  S.push({ do: () => { scene.negrinhoGo = performance.now(); AudioEngine.heart(); } }, { walk: 'negrinho', to: { x: 200, y: 640 } });
  say('sadi', 'Obrigado… por cuidar dela esse tempo todo.');
  S.push({ fade: 'out', time: 1.4 });
  return S;
}
function meetNegrinho() {
  if (scene || G.relics?.cuia_vo) return;
  const saved = { ...G.player }; showRpgBox('worldTalk', null); keys.clear();
  playSteps(negrinhoSteps(), 'negrinho', () => {
    G.player = saved; G.relics ??= {}; G.relics.cuia_vo = G.day;
    const rw = { xp: 80, rep: 5 }; grantReward(rw); save(); refreshHUD();
    talk([['card', '<b>🧉 Cuia de porongo do vô</b><br>Item raro. Agora ela fica na prateleira de lembranças da bodega, embaixo da janela, junto dos troféus.<br><br><i>“Pra quem vier depois de mim: o mate é pra repartir.”</i>', 'Item raro'], ['reward', rw, 'O guri da vela']], null, 'Guardar com carinho');
  });
}
// Cena na beira do rio, de noite: lua, estrelas, a outra margem e as moitas de sarandi.
function drawSceneRio() {
  const s = scene; beginWorld();
  rect(0, 0, W, H, '#0a1330');
  for (let i = 0; i < 70; i++) { const x = (i * 211.7) % W, y = (i * 53.3) % 300; ellipse(x, y, 1.4, 1.4, `rgba(240,236,210,${.35 + .3 * Math.sin(frameClock * 1.7 + i)})`); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(1320, 130, 140, .18, '220,230,255'); ctx.restore(); ellipse(1320, 130, 34, 34, '#f1ecd6');
  rect(0, 300, W, 70, '#0f2018'); for (let x = 0; x < W; x += 70) ellipse(x + 30, 300, 48, 30 + (x % 3) * 8, '#0c1a12');
  rect(0, 370, W, 190, '#16304a');
  for (let i = 0; i < 18; i++) { const x = (i * 97 + frameClock * 22) % (W + 100) - 50, y = 390 + (i * 37) % 160; rect(x, y, 40 + (i % 3) * 20, 2, 'rgba(190,210,240,.18)'); }
  for (let k = 0; k < 9; k++) { const w = 70 - k * 5 + Math.sin(frameClock * 2 + k) * 8; rect(1320 - w / 2, 384 + k * 18, w, 3, `rgba(230,236,255,${.32 - k * .03})`); }
  rect(0, 560, W, H - 560, '#2a2a1c'); rect(0, 556, W, 14, '#3a3826');
  for (const [x, y, r] of [[120, 560, 60], [420, 552, 46], [1240, 556, 70], [1480, 562, 50]]) { ellipse(x, y, r, r * .6, '#13241a'); ellipse(x + r * .4, y - r * .3, r * .6, r * .45, '#183020'); }
  rect(0, 0, W, H, 'rgba(4,6,18,.28)');
  const list = [];
  for (const [id, a] of Object.entries(s.actors)) list.push({ y: a.y, draw: () => id === 'sadi' ? personDraw(avatarSprite(), a.x, a.y, a.walk, true, a.dx) : drawNegrinho(a.x, a.y, a.dx, a.walk, s.negrinhoGo ? clamp(1 - (performance.now() - s.negrinhoGo) / 4000, .15, 1) : 1) });
  list.sort((a, b) => a.y - b.y).forEach(l => l.draw());
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
SCENE_VIEWS.rio = drawSceneRio;
{
  const speaker = sceneSpeaker;
  sceneSpeaker = function (who) { return who === 'negrinho' ? { portrait: '<span class="portrait portrait-phone" style="width:104px;height:104px">🕯️</span>', name: 'O guri da vela' } : speaker(who); };
}

// ---------- Prateleira de lembranças (bodega, à direita da janela) ----------
// Troféus dos eventos e a cuia do vô, em duas prateleirinhas: só aparece quando tem alguma coisa para mostrar.
const LEMBRANCAS = { x: 1436, y: 250, w: 100, gap: 72 };
function lembrancas() { const t = G.trophies || {}; return [t.rodeio && 'rodeio', t.penalti && 'penalti', t.uva && 'uva', G.relics?.cuia_vo && 'cuia'].filter(Boolean); }
function drawTrophy(x, y, color, deco) {
  rect(x - 14, y - 8, 28, 8, '#4a3018', 2); rect(x - 4, y - 22, 8, 14, color); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x - 17, y - 50); ctx.lineTo(x + 17, y - 50); ctx.quadraticCurveTo(x + 15, y - 22, x, y - 22); ctx.quadraticCurveTo(x - 15, y - 22, x - 17, y - 50); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x - 18, y - 40, 7, Math.PI * .5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 18, y - 40, 7, -Math.PI * .5, Math.PI * .5); ctx.stroke();
  rect(x - 10, y - 48, 4, 18, 'rgba(255,255,255,.35)'); deco(x, y - 38);
}
function drawLembrancas() {
  const items = lembrancas(); if (!items.length || worldOut) return;
  const { x, w, gap } = LEMBRANCAS, levels = items.length > 2 ? 2 : 1;
  for (let l = 0; l < levels; l++) { const y = LEMBRANCAS.y + l * gap; rect(x, y, w, 9, '#6a4424', 2, '#3a2412'); rect(x + 8, y + 9, 6, 12, '#4a2e16'); rect(x + w - 14, y + 9, 6, 12, '#4a2e16'); }
  items.forEach((id, k) => {
    const y = LEMBRANCAS.y + Math.floor(k / 2) * gap, cx = x + (k % 2 ? 74 : 26);
    if (id === 'cuia') { ellipse(cx, y - 2, 16, 4, '#1c140c55'); ellipse(cx, y - 20, 17, 19, '#8a5a2a'); ellipse(cx - 5, y - 26, 5, 8, 'rgba(255,230,180,.25)'); rect(cx - 14, y - 40, 28, 6, '#5a3a1a', 3); ellipse(cx, y - 40, 11, 4, '#4a7a2a'); rect(cx + 4, y - 64, 3, 26, '#d8d8d8'); }
    else drawTrophy(cx, y, id === 'uva' ? '#c8ccd4' : '#e0b040', id === 'rodeio' ? (a, b) => { ctx.strokeStyle = '#7a4a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(a, b, 6, 4, 0, 0, Math.PI * 2); ctx.stroke(); } : id === 'penalti' ? (a, b) => { ellipse(a, b, 5, 5, '#f4f4f4'); ellipse(a, b, 2, 2, '#222'); } : (a, b) => { for (const [ox, oy] of [[-3, -2], [3, -2], [0, 2], [-3, 5], [3, 5], [0, 8]]) ellipse(a + ox, b + oy - 3, 2.6, 2.6, '#6a2a7a'); });
  });
}
{ const decor = drawDecor; drawDecor = function () { decor(); drawLembrancas(); }; }

// ---------- Ligações com os mapas ----------
function eventPerson(id, x, y, layers, dx = 1) { const i = PEOPLE.findIndex(p => p.id === id); if (i >= 0) layers.push({ y, draw: () => personDraw(PEOPLE[i].sprite, x, y, false, false, dx) }); }
{
  const vila = WORLD_MAPS.vila, spots = vila.spots, draw = vila.draw;
  vila.spots = function () {
    const list = spots.call(this), ctg = list.find(s => s.id === 'ctg');
    if (ctg && fandangoNight()) ctg.label = 'Entrar no CTG · fandango hoje!';
    if (ctg && rodeioNight()) ctg.label = 'Entrar no CTG · rodeio crioulo hoje!';
    return [...list, ...javaliSpots(), ...cuiudosSpot(), ...negrinhoSpot()];
  };
  vila.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers);
    if (negrinhoTonight()) { const p = negrinhoPos(); if (seen(p.x, p.y, 300)) layers.push({ y: p.y, draw: () => drawNegrinho(p.x, p.y, p.dx, true) }); }
    if (!javaliNight()) return;
    for (const b of javaliList()) if (seen(b.x, b.y)) layers.push({ y: b.y, draw: () => { const bob = Math.sin(frameClock * 6 + b.i) * 2; drawJavali(b.x, b.y + bob, b.i % 2 ? 1 : -1, Math.floor(frameClock * 3 + b.i), 1.5); } });
    if (seen(CUIUDOS.x, CUIUDOS.y)) layers.push({ y: CUIUDOS.y, draw: () => { const i = PEOPLE.findIndex(p => p.id === 'valter'); personDraw(PEOPLE[i].sprite, CUIUDOS.x, CUIUDOS.y, false, false, 1); rect(CUIUDOS.x + 22, CUIUDOS.y - 92, 4, 30, '#5a3a20'); ellipse(CUIUDOS.x + 24, CUIUDOS.y - 96, 7, 9, '#ffcf6a'); } });
  };
  const ctg = WORLD_MAPS.ctg, cspots = ctg.spots, cdraw = ctg.draw;
  ctg.spots = function () {
    const list = cspots.call(this);
    if (fandangoNight()) list.push({ id: 'fandango', x: FANDANGO_JAYME.x, y: FANDANGO_JAYME.y + 30, label: mapEvState('fandango').done ? 'Prosear com o Jayme' : 'Servir no fandango · falar com o Jayme', act: fandangoMenu });
    if (rodeioNight()) list.push({ id: 'rodeio', x: RODEO_SPOT.x, y: RODEO_SPOT.y + 30, label: mapEvState('rodeio').done ? 'Ver o placar do rodeio' : 'Prova de laço · falar com o Guri', act: rodeioMenu });
    return list;
  };
  ctg.draw = function (view, seen, layers) {
    cdraw.call(this, view, seen, layers);
    if (rodeioNight()) { eventPerson('guri', RODEO_SPOT.x, RODEO_SPOT.y, layers, -1); for (const [id, x, y] of [['baitaca', 1300, 470], ['manolima', 640, 470]]) eventPerson(id, x, y, layers, x > 950 ? -1 : 1); }
    if (!fandangoNight()) return;
    drawDancers(layers, 980, 690, ['manolima', 'baitaca', 'guri']);
    const j = PEOPLE.findIndex(p => p.id === 'jayme'); layers.push({ y: FANDANGO_JAYME.y, draw: () => { personDraw(PEOPLE[j].sprite, FANDANGO_JAYME.x, FANDANGO_JAYME.y, false, false, 1); } });
  };
  const okt = WORLD_MAPS.oktoberfest, ospots = okt.spots, odraw = okt.draw;
  okt.spots = function () { return [...ospots.call(this), ...(oktoNight() ? [{ id: 'okto', x: OKTO_SPOT.x, y: OKTO_SPOT.y + 30, label: mapEvState('oktoberfest').done ? 'Prosear com o Loli' : 'Servir chope · falar com o Loli', act: oktoMenu }] : [])]; };
  okt.draw = function (view, seen, layers) {
    odraw.call(this, view, seen, layers); if (!oktoNight()) return;
    const i = PEOPLE.findIndex(p => p.id === 'loligebien'); if (i >= 0) layers.push({ y: OKTO_SPOT.y, draw: () => personDraw(PEOPLE[i].sprite, OKTO_SPOT.x, OKTO_SPOT.y + Math.abs(Math.sin(frameClock * 5)) * -3, false, false, -1) });
    drawDancers(layers, 980, 700);
  };
  const salao = WORLD_MAPS.salao, sspots = salao.spots, sdraw = salao.draw;
  salao.spots = function () { return [...sspots.call(this), ...(uvaNight() ? [{ id: 'uva', x: UVA_SPOT.x, y: UVA_SPOT.y + 30, label: mapEvState('uva').done ? 'Prosear com o Badin' : 'Concurso de vinho · falar com o Badin', act: uvaMenu }] : [])]; };
  salao.draw = function (view, seen, layers) {
    sdraw.call(this, view, seen, layers); if (!uvaNight()) return;
    eventPerson('badin', UVA_SPOT.x, UVA_SPOT.y, layers, -1);
    layers.push({ y: 440, draw: () => { rect(820, 432, 260, 16, '#7a4a2a', 3, '#3a2010'); for (let k = 0; k < 5; k++) { const x = 850 + k * 50; rect(x - 9, 400, 18, 32, k % 2 ? '#3a5a2a' : '#5a1a2a', 6); rect(x - 3, 392, 6, 10, '#3a2a1a'); } } });
  };
  const serra = WORLD_MAPS.serra, rspots = serra.spots, rdraw = serra.draw;
  serra.spots = function () {
    const list = rspots.call(this);
    if (penaltiNight()) { const c = list.find(s => s.id === 'campinho'), st = mapEvState('penalti'); if (c) { c.label = st.done ? 'Campinho · campeonato encerrado' : 'Campeonato de pênaltis · ' + CUP_ROUNDS[st.round || 0].toLowerCase(); c.act = cupMenu; } }
    if (uvaNight()) { const s = list.find(x => x.id === 'salao'); if (s) s.label = 'Entrar no salão · Festa da Uva hoje!'; }
    return list;
  };
  serra.draw = function (view, seen, layers) {
    rdraw.call(this, view, seen, layers); if (!penaltiNight()) return;
    const c = SERRA.campinho, y = c.y + c.h + 10; if (seen(c.x + c.w / 2, y, 500)) { eventPerson('marcio', c.x + c.w / 2 - 110, y, layers, 1); eventPerson('marcelo', c.x + c.w / 2 + 110, y, layers, -1); }
  };
  const sc = WORLD_MAPS.sc, scspots = sc.spots;
  sc.spots = function () { const list = scspots.call(this), o = list.find(s => s.id === 'oktoberfest'); if (o && oktoNight()) o.label = 'Entrar no salão · Oktoberfest hoje!'; return list; };
}
