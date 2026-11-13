// As benzeduras do Padre Romio: depois que a Doralice volta (capítulo da Mula sem Cabeça), o padre benze os poderes
// do Sadi na igreja da Serra, um por vez, em troca de uma esmola pra obra da igreja. Poder benzido fica mais forte
// e volta mais ligeiro (a volta cai pra 70% do tempo):
//   · Grito farroupilha: o fantasma do Garibaldi peleia 14 segundos (antes 10) e bate mais forte.
//   · Lunar do Sepé: o clarão alcança mais longe e os bichos ficam tontos por mais tempo.
//   · Bando de gralhas-azuis: vêm 7 gralhas (antes 5).
//   · Benzedura: o escudo da reza aguenta dois golpes.
//   · Bênção do monge: cura quase metade da vida na hora e segue curando por 12 segundos.
'use strict';

const BENZ_MELHORIA = {
  grito: 'O fantasma do Garibaldi peleia por 14 segundos (antes 10) e o sabre dele bate mais forte.',
  lunar: 'O clarão alcança bem mais longe e os bichos ficam tontos por mais tempo (até chefe sente).',
  gralhas: 'O bando vem com 7 gralhas (antes 5): mais bicada e mais pinhão caindo.',
  benzedura: 'O escudo da reza aguenta dois golpes antes de se desfazer.',
  monge: 'Cura quase metade da vida na hora e segue curando por 12 segundos.'
};
const BENZ_FALAS = {
  grito: ['padre_romio', 'Um lenço de farrapo… Deus recolha os que caíram. Vai benzido: quando ele vier, que venha inteiro.'],
  lunar: ['padre_romio', 'O lunar do Sepé… A minha nona dizia que luz de coração limpo não tem cerca. Vai benzido, meu filho.'],
  gralhas: ['padre_romio', 'Até a gralha trabalha pra quem planta. São Francisco ia gostar de ti. Vai benzido: que o bando venha cheio.'],
  benzedura: ['padre_romio', 'Reza em cima de reza, arruda em cima de arruda. Agora ela segura o dobro, mas não abusa da sorte.'],
  monge: ['padre_romio', 'A reza do João Maria eu conheço de ouvir falar. Homem santo. Vai benzida: que a cura chegue funda.']
};
function benzState() { const st = poderState(); st.benzido ??= {}; return st.benzido; }
function poderBenzido(id) { return !!benzState()[id]; }
function benzCusto() { return 350 + 150 * Object.keys(benzState()).length; }
function benzDisponiveis() { return poderList().filter(id => !poderBenzido(id)); }

// ---------- A prosa na igreja ----------
function benzMenu() {
  const lista = benzDisponiveis(), custo = benzCusto();
  if (!lista.length) {
    talk([['padre_romio', 'Teus poderes já estão todos benzidos, Sadi. Agora é contigo, com eles e com Deus.'], ['padre_romio', 'A Doralice mandou um abraço. E a obra da igreja agradece as esmolas.']], null, 'Amém');
    return;
  }
  const opts = lista.map(id => {
    const P = PODERES[id];
    return [`${P.icon} Benzer ${P.name} · ${money(custo)}`, () => benzCompra(id), null, !hasCash(custo)];
  });
  opts.push(['Hoje não, padre']);
  talkChoose([
    ['padre_romio', 'Sadi, meu filho! A Doralice tá cada dia melhor, e eu andei estudando as rezas da minha nona.'],
    ['padre_romio', 'Traz uma esmola pra obra da igreja e eu benzo um poder teu: fica mais forte e volta mais ligeiro. Qual vai ser?']
  ], opts, opts.length - 1);
}
function benzCompra(id) {
  const custo = benzCusto(); if (!poderHas(id) || poderBenzido(id) || !hasCash(custo)) return;
  spendCash(custo); benzState()[id] = G.day; save(); refreshHUD();
  AudioEngine.benzer?.(); fxStars?.(worldOut?.x || 0, (worldOut?.y || 0) - 120, 6);
  const P = PODERES[id];
  talk([BENZ_FALAS[id], ['card', `<b>✨ ${P.icon} ${P.name} · benzido</b><br>${BENZ_MELHORIA[id]}<br><br>E a volta caiu: <b>${Math.round(PODERES[id].cd * .7)} s</b> em vez de ${PODERES[id].cd} s.`, 'Benzedura do Padre Romio']], null, 'Amém');
}

// ---------- Os efeitos de cada benzedura ----------
{
  // A volta mais curta: quando o uso engatou (a volta acabou de ser cobrada), cobra 70% dela.
  const usa = poderUse; poderUse = function () {
    const id = poderPick(), antes = id ? poder.cd[id] || 0 : 0;
    usa();
    if (id && poderBenzido(id) && (poder.cd[id] || 0) > antes) poder.cd[id] = Math.round(PODERES[id].cd * .7);
  };
  // Grito: o fantasma fica 14 segundos e bate mais forte.
  const grito = poderGrito; poderGrito = function () {
    grito(); if (poderBenzido('grito') && poder.ally) { poder.ally.t = 14; poder.ally.benzido = true; }
  };
  const hit = poderHit; poderHit = function (b, mult) { return hit(b, poder.ally?.benzido && mult === .9 ? 1.25 : mult); };
  // Lunar: mais alcance e mais tontura.
  const lunar = poderLunar; poderLunar = function () {
    if (!poderBenzido('lunar')) return lunar();
    const p = worldOut; poder.flash = { x: p.x, y: p.y - 70, t: 0 };
    for (const b of rangedTargets()) {
      if (Math.hypot(b.x - p.x, b.y - p.y) > 640) continue;
      if (b.kind === 'diabo') { effect('O Diabo riu do clarão!', b.x, b.y - 220, '#ffb3a0', 16); continue; }
      const big = b.boss || b.lenda || !CAVE_BEASTS[b.kind]; b.lunar = big ? 2.4 : 4.5;
      if (!big && ['windup', 'lunge', 'charge'].includes(b.state)) { b.state = 'rest'; b.t = .6; }
    }
    [1047, 1319, 1568, 2093].forEach((f, i) => AudioEngine.note?.(f, .7, 'sine', .045, i * .04)); AudioEngine.swoosh?.(.08);
  };
  // Gralhas: o bando vem com 7.
  const gralhas = poderGralhas; poderGralhas = function () {
    gralhas();
    if (poderBenzido('gralhas') && poder.gralhas.length) {
      const p = worldOut, side = Math.sign(poder.gralhas[0].x - p.x) || 1;
      for (let i = 5; i < 7; i++) poder.gralhas.push({ x: p.x + side * (520 + i * 40), y: p.y - 260 - i * 30, dx: -side, t: 7 + i * .2, peck: .4 + i * .2, ph: i * 1.3 });
    }
  };
  // Benzedura: o escudo vira dois.
  const escudo = poderBenzedura; poderBenzedura = function () { escudo(); if (poderBenzido('benzedura')) poder.escudo = 2; };
  const segura = poderShield; poderShield = function () {
    if (poder.escudo === 2) {
      poder.escudo = 1; const p = worldOut;
      effect('🌿 A benzedura segurou!', p.x, p.y - 150, '#c8f0b0', 20); fxStars(p.x, p.y - 90, 6); AudioEngine.glass?.(); return true;
    }
    return segura();
  };
  // Monge: cura mais funda e mais comprida.
  const monge = poderMonge; poderMonge = function () {
    if (!poderBenzido('monge')) return monge();
    const st = caveState(), p = worldOut, max = caveMaxHp(), q = Math.round(max * .45);
    st.hp = Math.min(max, st.hp + q); mataBuffs.veneno = 0; poder.monge = { t: 12, acc: 0 };
    effect('✚ +' + q + ' ❤ Bênção benzida', p.x, p.y - 170, '#f4eab0', 20); fxStars(p.x, p.y - 90, 8); fxHearts(p.x, p.y - 120, 4); AudioEngine.benzer?.();
  };
}

// ---------- Ligações com o padre ----------
{
  // Falar com o padre (fora das horas de missão) abre as benzeduras.
  const prosa = worldTalk; worldTalk = function (w) {
    if (w?.person === PADRE_ROMIO && poderHas('benzedura') && !missionActive('sino')
      && !['call', 'report'].includes(mulaStage()) && !(activeChapter() && activeChapter().giver === 'padre_romio')) {
      worldTalkAt = { x: w.x, y: w.y }; benzMenu(); return;
    }
    return prosa(w);
  };
  // Um lembrete, uma vez só, de que o padre benze poder.
  const tick = outsideTick; outsideTick = function (dt) {
    tick(dt);
    const st = poderState();
    if (!st.benzAviso && started && !scene && !modal && !paused && poderHas('benzedura') && storyCalm?.() !== false) {
      st.benzAviso = G.day; save();
      floatNote('⛪ Dizem que o Padre Romio, na igreja da Serra, benze os poderes de quem ajudou a Doralice: ficam mais fortes.', 'reminder');
    }
  };
}
