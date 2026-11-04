// O fim da missão "Levaram o Bento!", depois do almirante Grenfell (ilha-grenfell.js):
//   · A chave: vencido, o almirante some na cerração e a chave da cripta cai no chão do pátio. O Sadi vai até ela e pega.
//   · A cripta: a chave abre a grade da escada do pátio. Lá embaixo, os carcereiros; com todos no chão, a cela do Bento
//     abre: o lenço farrapo, o “B. G. · 1837” riscado na parede e a ordem do Império mandando o Bento pro Forte do Mar,
//     na Bahia. Tudo numa cena.
//   · A volta: o Sadi conta pro Giuseppe, no pinheiral, e o Giuseppe reúne a Anita, o Lanceiro Negro e o general
//     Canabarro pra batalha final. Daí em diante, o Canabarro fica no pinheiral do Giuseppe, armando o plano.
// As cenas só desenham e falam: o que muda no jogo acontece no fim de cada uma (e sem cenas, numa conversa).
'use strict';

// ---------- A chave da cripta ----------
function drawChaveCripta(x, y) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 8, 34, .35 + .15 * Math.sin(frameClock * 5), '255,220,140'); ctx.restore();
  ellipse(x, y + 2, 18, 5, 'rgba(0,0,0,.3)'); ctx.save(); ctx.translate(x, y - 6); ctx.rotate(-.35);
  ctx.strokeStyle = '#3a3226'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(-14, 0, 8, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = '#a89a78'; ctx.lineWidth = 3.5; ctx.stroke();
  rect(-6, -2.5, 26, 5, '#a89a78', 2); rect(13, 1, 4, 7, '#a89a78', 1); rect(18, 1, 3, 5, '#a89a78', 1); ctx.restore();
}
function bentoChaveCena(b, rw) {
  const st = ilhaState(), P = GRENFELL.patio, k = { x: clamp(b.x, P.x0 + 40, P.x1 - 40), y: clamp(b.y, P.y0 + 30, P.y1 - 10) }, p = { x: worldOut.x, y: worldOut.y }, G0 = grenfellSpeaker();
  const done = () => {
    st.chave = G.day; keys.clear(); Object.assign(worldOut, { x: k.x - 36, y: k.y + 14, walk: false }); if (!worldCanWalk(worldOut.x, worldOut.y)) Object.assign(worldOut, p); save();
    talk([['card', '<b>🗝️ A chave da cripta</b><br>Uma chave de ferro grande, com o brasão do Império gravado. Abre a grade da escada do pátio, perto do paiol: lá embaixo fica a cripta, onde guardavam os presos da guerra.', 'Pátio da fortaleza'], ['reward', rw, 'O almirante da fortaleza']], null, 'Guardar a chave');
  };
  if (!scenesEnabled()) {
    talk([['card', '<b>⚓ O almirante caiu</b><br>O Grenfell finca o sabre no chão do pátio e se apoia nele. A cerração em volta das botas dele começa a se desfazer.', 'Pátio da fortaleza'],
      [G0, 'Bem lutado, gaúcho. Faz muito tempo que um farrapo não me tira da muralha.'], [G0, 'Tu quer o Bento? Desce na cripta. Mas tu chegou tarde.'],
      ['card', 'O almirante some na cerração. No chão do pátio, onde ele tava, fica uma chave de ferro.', 'Pátio da fortaleza'], ['sadi', 'A chave da cripta!']], done, 'Pegar a chave');
    return;
  }
  let caiu = false, pegou = false;
  playSteps([...sceneWorld({ map: 'ilha', x: (p.x + k.x) / 2, y: (p.y + k.y) / 2 - 60, props: layers => { if (caiu && !pegou) layers.push({ y: k.y, draw: () => drawChaveCripta(k.x, k.y) }); } }),
    { actor: 'sadi', x: p.x, y: p.y, dx: k.x < p.x ? -1 : 1 },
    { actor: 'grenfell', x: k.x, y: k.y, dx: p.x < k.x ? -1 : 1, draw: (a, y) => drawGrenfellFigura(a.x, y, a.some ? 1 - (frameClock - a.some) / 1.1 : 1, a.dx) },
    { fade: 'in', time: .4 },
    { say: 'grenfell', text: 'Bem lutado, gaúcho. Faz muito tempo que um farrapo não me tira da muralha.' },
    { say: 'grenfell', text: 'A cerração… tá me soltando. Tu quer o Bento? Desce na cripta. Mas tu chegou tarde.' },
    { do: () => { scene.actors.grenfell.some = frameClock; AudioEngine.caveGhost?.(); fxPuffs(k.x, k.y - 80, 14, 120, '#c8d8e8'); } },
    { wait: 1.2 },
    { do: () => { caiu = true; delete scene.actors.grenfell; AudioEngine.note?.(1900, .08, 'triangle', .04); AudioEngine.note?.(1500, .1, 'triangle', .03, .09); fxStars(k.x, k.y - 20, 6); } },
    { wait: .6 },
    { say: 'sadi', text: 'Caiu alguma coisa onde ele tava…' },
    { walk: 'sadi', to: { x: k.x - 36, y: k.y + 14 } },
    { do: () => { pegou = true; AudioEngine.pop?.(1500, .05, .04); } },
    { say: 'sadi', text: 'Uma chave de ferro, pesada, com o brasão do Império. É a chave da cripta!' },
    { fade: 'out', time: .5 }], 'ilha-chave', done);
}

// ---------- A cela do Bento ----------
const BENTO_ORDEM = '<b>ORDEM DO IMPÉRIO</b><br>Transfira-se o preso <b>Bento Gonçalves da Silva</b> para o <b>Forte do Mar</b>, na Bahia, no brigue que sai com a maré da madrugada.<br><br><i>— J. P. Grenfell, almirante</i>';
function bentoCelaCena() {
  const st = ilhaState(), c = MASM.clue, p = { x: worldOut.x, y: worldOut.y };
  const done = () => {
    st.pista = G.day; keys.clear(); AudioEngine.caveGhost?.(); Object.assign(worldOut, { x: c.x, y: c.y + 70, walk: false }); save();
    talk([['card', '<b>📜 Levaram o Bento pra Bahia</b><br>O lenço farrapo do Bento e a ordem do Império: ele foi levado no brigue pro <b>Forte do Mar</b>, na Bahia.<br><br>Agora é voltar pro pinheiral, na Mata de Araucárias, e contar tudo pro Giuseppe Garibaldi.', 'Cripta da fortaleza']], null, 'Voltar pro Giuseppe');
  };
  if (!scenesEnabled()) {
    talk([['card', '<b>🔒 A cela do Bento</b><br>A grade tá aberta e a cela, vazia. No chão de pedra, um lenço vermelho de farrapo. Riscado na parede, com a ponta de uma espora: <i>“B. G. · 1837”</i>. Embaixo da palha, um papel com o selo do Império.', 'Cripta da fortaleza'],
      ['card', BENTO_ORDEM, 'Cripta da fortaleza'], ['sadi', 'Pra Bahia! Pro Forte do Mar, onde ele já ficou preso em 1837… Tenho que contar pro Giuseppe.']], done, 'Continuar');
    return;
  }
  playSteps([...sceneWorld({ map: 'masmorra', x: c.x, y: c.y + 90, night: .3, lights: [{ x: c.x, y: c.y - 10, r: 260, a: .32, color: '255,190,110' }] }),
    { actor: 'sadi', x: p.x, y: p.y, dx: c.x < p.x ? -1 : 1 }, { fade: 'in', time: .6 },
    { walk: 'sadi', to: { x: c.x, y: c.y + 80 } },
    { say: 'sadi', text: 'A grade da cela do fundo tá aberta… e a cela, vazia.' },
    { walk: 'sadi', to: { x: c.x + 24, y: c.y + 16 } },
    { say: 'sadi', text: 'O lenço do Bento! E riscado na parede, com a ponta de uma espora: “B. G. · 1837”.' },
    { say: 'sadi', text: 'Embaixo da palha tem um papel… com o selo do Império.' },
    { overlay: 'note', text: BENTO_ORDEM },
    { say: 'sadi', text: 'Pra Bahia! Pro Forte do Mar, onde ele já ficou preso em 1837…' },
    { say: 'sadi', text: 'Tenho que contar pro Giuseppe. Ele vai saber o que fazer.' },
    { fade: 'out', time: .6 }], 'ilha-cela', done);
}

// ---------- A volta pro pinheiral: o Giuseppe reúne a tropa ----------
const REUNIAO = { sadi: { x: 560, y: 1600 }, anita: [{ x: 120, y: 1650 }, { x: 330, y: 1630 }], lanceiro: [{ x: 1040, y: 1580 }, { x: 650, y: 1540 }], canabarro: [{ x: 1040, y: 1700 }, { x: 700, y: 1650 }] };
function bentoReuniao() {
  const st = ilhaState(), R = REUNIAO;
  const done = () => {
    st.contou = G.day; keys.clear(); Object.assign(worldOut, { map: 'mata', x: R.sadi.x, y: R.sadi.y, dx: -1, dy: 0, walk: false }); save();
    talk([['card', '<b>⚔️ A batalha final</b><br>O Giuseppe reuniu a Anita, o Lanceiro Negro e o general Canabarro. O Bento tá preso no Forte do Mar, na Bahia, e desta vez ninguém vai deixar ele nadar sozinho.<br><br>O general Canabarro agora fica aqui no pinheiral do Giuseppe, armando o plano. Prosa com ele quando quiser.', 'Mata de Araucárias']], null, 'Pra Bahia!');
  };
  const lines = [
    ['sadi', 'Giuseppe! Achei a cela do Bento, na cripta da fortaleza da ilha. Vazia.'],
    ['sadi', 'O almirante Grenfell guardava a chave. E na cela tinha uma ordem do Império: levaram o Bento num brigue pra Bahia, pro Forte do Mar.'],
    ['garibaldi', 'O Forte do Mar… de novo! Em 1837 o Bento fugiu de lá nadando, no meio da Baía de Todos os Santos.'],
    ['garibaldi', 'Desta vez ninguém vai deixar ele nadar sozinho. Anita! Lanceiro! Venham pro fogo!'],
    ['anita', 'Ouvi tudo, Giuseppe. Se é pra Bahia, eu vou junto. Quem enfrentou o navio do Mariath não tem medo de forte de pedra.'],
    ['lanceiro', 'Os lanceiros nunca deixaram companheiro pra trás. Conta comigo, gaúcho.'],
    ['sadi', 'E tem mais gente: o general Canabarro veio comigo da ilha.'],
    ['canabarro', 'General David Canabarro, às ordens. Giuseppe, velho de guerra! Desde Laguna que a gente não divide um fogo.'],
    ['garibaldi', 'Canabarro! Então estamos todos: a Anita, o Lanceiro, o general e o gaúcho da bodega.'],
    ['canabarro', 'Eu fico aqui no teu pinheiral, armando o plano. Pra entrar no Forte do Mar vai precisar de barco, de pólvora e de muita coragem.'],
    ['garibaldi', 'Barco eu sei arranjar. Vamos buscar o Bento: essa vai ser a batalha final.'],
    ['sadi', 'Pois então, pra Bahia!']
  ];
  if (!scenesEnabled()) { talk(lines.map(([who, text]) => [who === 'canabarro' ? ilhaFolkSpeaker('canabarro') : who, text]), done, 'Continuar'); return; }
  const chega = id => ({ actor: id, x: R[id][0].x, y: R[id][0].y, dx: R[id][1].x > R[id][0].x ? 1 : -1 }), vai = id => R[id][1];
  playSteps([...sceneWorld({ map: 'mata', x: 520, y: 1560, night: worldNight() ? .45 : .15, lights: [{ x: RANCHO_FOGO.x, y: RANCHO_FOGO.y - 20, r: 300, a: .3, color: '255,150,60' }] }),
    { actor: 'sadi', x: worldOut.map === 'mata' ? worldOut.x : R.sadi.x + 200, y: worldOut.map === 'mata' ? worldOut.y : R.sadi.y, dx: -1 },
    { actor: 'garibaldi', x: RANCHO_GHOST.x, y: RANCHO_GHOST.y, dx: 1 }, { fade: 'in', time: .6 },
    { walk: 'sadi', to: R.sadi },
    ...lines.slice(0, 4).map(([who, text]) => ({ say: who, text })),
    chega('anita'), chega('lanceiro'), { walk: ['anita', 'lanceiro'], to: [vai('anita'), vai('lanceiro')] },
    ...lines.slice(4, 7).map(([who, text]) => ({ say: who, text })),
    chega('canabarro'), { walk: 'canabarro', to: vai('canabarro') },
    ...lines.slice(7).map(([who, text]) => ({ say: who, text })),
    { fade: 'out', time: .8 }], 'bento-reuniao', done);
}

// ---------- O general Canabarro no pinheiral do Giuseppe ----------
const CANABARRO_MATA = { pontos: [{ x: 700, y: 1650 }, { x: 820, y: 1600 }, { x: 640, y: 1720 }], vel: 48 };
const CANABARRO_MATA_LORE = [
  [['canabarro', 'O Forte do Mar fica no meio da baía, cercado de água por todos os lados. Por terra, ninguém chega.'], ['canabarro', 'Por isso o Bento fugiu nadando, da outra vez. Desta, a gente vai buscar de barco.']],
  [['canabarro', 'O Giuseppe arranja o barco, a Anita e o Lanceiro vão na frente. E tu, gaúcho, leva o arpão do Griggs: ainda vai ter muralha pra subir.']]
];
let canabarroMata = null;
function canabarroNoPinheiral() { return !!ilhaState().contou; }
function canabarroMataNpc() { if (canabarroMata?.game !== G) canabarroMata = { game: G, ...CANABARRO_MATA.pontos[0], i: 0, wait: 2, dx: -1, dy: 0, walk: false }; return canabarroMata; }
function canabarroMataTick(dt) {
  const c = canabarroMataNpc(), to = CANABARRO_MATA.pontos[c.i]; c.walk = false;
  if (talkState || modal) return; if ((c.wait -= dt) > 0) return;
  const d = Math.hypot(to.x - c.x, to.y - c.y);
  if (d < 4) { c.i = (c.i + 1) % CANABARRO_MATA.pontos.length; c.wait = 2 + Math.random() * 3; return; }
  const k = Math.min(d, CANABARRO_MATA.vel * dt); c.dx = to.x < c.x ? -1 : 1; c.dy = Math.abs(to.y - c.y) > Math.abs(to.x - c.x) ? Math.sign(to.y - c.y) : 0;
  c.x += (to.x - c.x) / d * k; c.y += (to.y - c.y) / d * k; c.walk = true;
}
function canabarroMataTalk() {
  const st = ilhaState(), lore = [...CANABARRO_MATA_LORE, ...ILHA_FOLK_LORE.canabarro], k = (st.loreMata || 0) % lore.length; st.loreMata = (st.loreMata || 0) + 1; save();
  const c = canabarroMataNpc(); c.dx = worldOut.x < c.x ? -1 : 1; c.wait = Math.max(c.wait, 3);
  talk(ilhaFolkFala(lore[k]), null, 'Valeu, general');
}

// ---------- Ligações ----------
{
  // Voltando da ilha com a notícia, a prosa com o Giuseppe vira a reunião.
  const gari = garibaldiTalk; garibaldiTalk = function () { const st = ilhaState(); if (st.pista && !st.contou && missionState('bento')) { bentoReuniao(); return; } return gari(); };
  const speaker = sceneSpeaker; sceneSpeaker = function (who) { return who === 'canabarro' ? ilhaFolkSpeaker('canabarro') : speaker(who); };
  const M = WORLD_MAPS.mata, spots = M.spots, draw = M.draw;
  M.spots = function () { const list = spots.call(this); if (canabarroNoPinheiral()) { const c = canabarroMataNpc(); list.push({ id: 'mata:canabarro', x: c.x, y: c.y, radius: 100, label: 'Prosear com o general Canabarro', act: canabarroMataTalk }); } return list; };
  M.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers); if (!canabarroNoPinheiral() || scene && scene.id === 'bento-reuniao') return;
    const c = canabarroMataNpc(); if (!seen(c.x, c.y, 200)) return;
    const falando = talkState?.lines?.[talkState.i]?.[0]?.name === ILHA_FOLKS.canabarro.name;
    layers.push({ y: c.y, draw: () => { if (!historyFigure('canabarro', c.x, c.y, 1, c.dx, c.walk, c.dy, falando && !c.walk)) drawCanabarro(c.x, c.y, c.dx); } });
  };
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (worldOut?.map === 'mata' && canabarroNoPinheiral() && !scene && !paused) canabarroMataTick(dt); };
}
