// O facão do vô vem do seu Olmiro, e o Olmiro quer mel.
//   · No capítulo 2 (o tropeiro na rua da Fronteira, de noite), o Olmiro devolve o facão que o vô emprestou pra ele numa
//     tropeada e pede um pote de mel de jataí. Com o facão, a mata adentro já fica aberta: o jogador vai pro mato cedo.
//   · Ele acampa na entrada do pinheiral (Mata de Araucárias) até receber o mel.
//   · O mel fica na mata adentro, a parte braba: no primeiro trecho depois da picada do leste do pinheiral, um tronco com
//     colmeia logo no começo da trilha (uns passos depois da entrada, já no meio dos bichos). Pra pegar, tem que entrar.
//     Depois, mel só nas colmeias da mata adentro, como sempre.
//   · Save antigo que passou do capítulo 2 sem o facão: o Olmiro espera na entrada do pinheiral e entrega lá.
// A gruta da Serra não tem mais facão cravado na boca: lá embaixo só desce quem já tem um.
'use strict';

const OLMIRO_ACAMPA = { x: 300, y: 1100 }, OLMIRO_FOGO = { x: 368, y: 1150 }, OLMIRO_TRECHO = 2;
const MEL_OLMIRO = {
  id: 'melOlmiro', title: 'Um pote de mel pro Olmiro', giver: 'olmiro', side: true, deliver: true, when: () => false,
  where: 'Mata adentro: pela picada do leste do pinheiral, a colmeia fica num tronco logo no começo da trilha. O Olmiro acampa na entrada do pinheiral',
  goal: () => (G.stock?.mel || 0) >= 1 ? 'Leve o pote de mel pro seu Olmiro, acampado na entrada do pinheiral' : 'Entre na mata adentro (picada do leste do pinheiral) e tire o mel da colmeia de jataí, num tronco logo no começo da trilha',
  done: () => !!G.olmiroMel?.entregue, reward: { cash: 90, xp: 60, rep: 2, friend: { olmiro: 15 } }, outroBy: 'olmiro',
  outro: ['Mel de jataí! Isso cura chiado de peito e saudade. Tu é neto do teu vô mesmo.', 'Agora vai: o Garibaldi te espera no rancho dele, e a mata adentro tem muito mais colmeia pra quem anda de facão.']
};
MISSIONS.push(MEL_OLMIRO);
function olmiroMelState() { return G.olmiroMel ??= {}; }
function olmiroDaFacao() {
  const cs = caveState(); cs.facao = true; olmiroMelState().facao ??= G.day;
  if (!missionState('melOlmiro')) startMission(MEL_OLMIRO);
  save();
}
function olmiroFacaoDica() {
  return [['dica', '<b>🔪 O facão do vô</b><br><b>Espaço</b> ou <b>F</b>: golpe de facão (no celular, o botão Facão).<br><b>Shift</b>: dash, pra desviar do bote dos bichos.<br>Com o facão, a mata adentro abre: no pinheiral, a picada do leste desce mata adentro. Lá é braba, de dia e de noite.<br><br><b>🍯 Missão: ' + MEL_OLMIRO.title + '</b><br>' + MEL_OLMIRO.goal() + '. A colmeia brilha no escuro: siga a trilha uns passos depois da entrada.<br><br>Recompensa:' + rewardHTML(MEL_OLMIRO.reward), 'Facão e mel']];
}
// O Olmiro fica na entrada do pinheiral enquanto espera o mel (ou enquanto o facão não foi entregue, nos saves antigos).
function olmiroAcampado() { return !!G.missions && (missionActive('melOlmiro') || !!missionState('fantasma') && !caveState().facao); }
function olmiroColmeiaVisivel() { return missionActive('melOlmiro') && (G.stock?.mel || 0) < 1 && olmiroMelState().achou !== G.day && typeof inTrecho === 'function' && inTrecho() && trechoLayout().n === OLMIRO_TRECHO; }
// A colmeia fica num tronco na beira da trilha principal, uns 650 px depois da entrada (a trilha muda a cada dia).
function olmiroColmeia(T = trechoLayout()) {
  if (T._olmiroColmeia) return T._olmiroColmeia;
  const pts = T.trails[0].pts, q = pts.find(p => p[0] >= 650) || pts[Math.floor(pts.length / 4)];
  return T._olmiroColmeia = { x: q[0] + 34, y: q[1] - 64, sx: q[0], sy: q[1] };
}
function olmiroColhe() {
  if (!olmiroColmeiaVisivel()) return;
  olmiroMelState().achou = G.day; bagAdd('mel', 1); mataXP?.(2);
  const c = olmiroColmeia(); AudioEngine.hiss?.(.6, .03, 900); fxPuffs?.(c.x + 20, c.y - 70, 10, 80, '#d8d4cc'); effect('+1 pote de mel de jataí', c.x, c.y - 120, '#ffe27a', 17);
  talk([['card', '<b>🍯 Mel de jataí</b><br>A abelhinha sem ferrão faz a colmeia dentro do tronco: um pote de mel, cheiroso e ralinho. Leva pro seu Olmiro, na entrada do pinheiral.<br><br>Mel também vende bem no balcão da bodega e no Armazém.', 'Mata adentro']], null, 'Guardar');
  save(); refreshHUD();
}
const OLMIRO_ESPERA = ['Achou a colmeia? É mata adentro, pela picada do leste: num tronco logo no começo da trilha. Escuta o zumbido e vai de facão na mão.', 'Jataí não tem ferrão, vivente. Pode meter a mão sem medo.', 'Tô aqui no fogo, cuidando do pingo. Volta com o mel, que eu te conto outro causo.'];
function olmiroAcampaTalk() {
  const cs = caveState();
  if (!cs.facao) {
    olmiroDaFacao();
    talk([['olmiro', 'Buenas, bodegueiro! Te esperando, que eu tenho uma coisa que é tua: o facão do teu vô. Ele me emprestou numa tropeada e eu nunca devolvi.'],
      ['sadi', 'O facão do vô! Bah, seu Olmiro, muito obrigado.'],
      ['olmiro', 'Obrigado nada: em troca, me traz um pote de mel de jataí da mata. O meu peito anda chiando.'], ...olmiroFacaoDica()], null, 'Bora');
    return;
  }
  if (!missionActive('melOlmiro')) { talk([['olmiro', pick(OLMIRO_ESPERA)]], null, 'Até mais'); return; }
  if ((G.stock?.mel || 0) >= 1) {
    G.stock.mel -= 1; olmiroMelState().entregue = G.day; AudioEngine.coins?.();
    completeMission(MEL_OLMIRO); return;
  }
  talk([['olmiro', pick(OLMIRO_ESPERA)]], null, 'Vou achar');
}
function drawOlmiroAcampado() {
  const a = OLMIRO_ACAMPA, f = OLMIRO_FOGO, dx = worldOut && worldOut.x < a.x ? -1 : 1;
  if (!worldSprite('rural', 6, f.x - 50, f.y - 78, 100, 78)) sceneFire(f.x, f.y);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(f.x, f.y - 24, 120, .2 + .05 * Math.sin(frameClock * 9), '255,150,60'); ctx.restore();
  if (typeof mountedPose !== 'function' || !mountedPose('olmiro-mounted-v1', a.x, a.y, dx, 0, false)) sceneActorDraw?.('olmiro', { x: a.x, y: a.y, dx, walk: false });
}
function drawOlmiroColmeia() {
  const c = olmiroColmeia();
  if (!(MATA_ART?.['mata-nature']?.naturalWidth && mataNature(6, c.x, c.y + 8, 115, 115))) drawColmeia({ x: c.x, y: c.y }, false);
  for (let k = 0; k < 5; k++) ellipse(c.x + Math.sin(frameClock * 4 + k) * 26, c.y - 48 + Math.cos(frameClock * 3 + k) * 13, 1.8, 1, '#e4c66a');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(c.x, c.y - 50, 44, .14 + .06 * Math.sin(frameClock * 3), '255,220,120'); ctx.restore();
}

// ---------- Ligações ----------
{
  const M = WORLD_MAPS.mata, spots = M.spots, draw = M.draw;
  M.spots = function () {
    const list = spots.call(this);
    if (olmiroAcampado()) list.push({ id: 'olmiro:acampa', x: OLMIRO_ACAMPA.x + 40, y: OLMIRO_ACAMPA.y + 20, radius: 120, label: missionActive('melOlmiro') && (G.stock?.mel || 0) >= 1 ? 'Entregar o mel pro seu Olmiro' : 'Prosear com o seu Olmiro', act: olmiroAcampaTalk });
    return list;
  };
  M.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers);
    if (olmiroAcampado() && seen(OLMIRO_ACAMPA.x, OLMIRO_ACAMPA.y, 300)) layers.push({ y: OLMIRO_ACAMPA.y, draw: drawOlmiroAcampado });
  };
  // A colmeia, no primeiro trecho da mata adentro.
  const tspots = trechoSpots; trechoSpots = function () {
    const list = tspots();
    if (olmiroColmeiaVisivel()) { const c = olmiroColmeia(); list.push({ id: 'olmiro:colmeia', x: c.sx, y: c.sy, radius: 100, label: 'Tirar o mel de jataí pro Olmiro', act: olmiroColhe }); }
    return list;
  };
  const tdraw = drawTrecho; drawTrecho = function (view, seen, layers) {
    tdraw(view, seen, layers);
    if (olmiroColmeiaVisivel()) { const c = olmiroColmeia(); if (seen(c.x, c.y, 200)) layers.push({ y: c.y + 1, draw: drawOlmiroColmeia }); }
  };
}
