// Mais encantados à noite, no mesmo jeito do folclore (folklore.js): aparecem raramente pelo mapa, chegando perto vem
// uma cena e um desafio, e na primeira vitória fica uma lembrança na estante (que puxa a figurinha da lenda).
//   · Teiniaguá (Fronteira): a lagartixa da Salamanca do Jarau, com a pedra vermelha na cabeça. Oferece ouro, amor e
//     poder, como nas provas do causo do Blau Nunes (Simões Lopes Neto, Lendas do Sul). Quem recusa, vence.
//   · Anhangá (Serra): na tradição tupi, o espírito que protege os bichos do mato, um veado branco de olhos de fogo.
//     Leva o Sadi até um filhote preso num laço de caçador; soltar com cuidado e ficar quieto é vencer.
'use strict';

Object.assign(FOLK, {
  teiniagua: { map: 'vila', name: 'Teiniaguá', icon: '🦎', spots: [[2650, 900], [3380, 820], [820, 830], [2380, 1960], [1100, 1880]], label: 'Uma luz vermelha piscando entre as pedras…', relic: 'carbunculo', ok: () => true },
  anhanga: { map: 'serra', name: 'Anhangá', icon: '🦌', spots: [[1500, 1400], [2400, 1600], [1200, 900], [2600, 2000], [1860, 820]], label: 'Um veado branco entre as araucárias…', relic: 'galhada', ok: () => !regionLocked('serra') }
});
Object.assign(RELIC_CARDS, { carbunculo: ['teiniagua'], galhada: ['anhanga'] });
CARDS.push({ id: 'anhanga', set: 'lendas', name: 'Anhangá', title: 'O guardião dos bichos', how: 'Soltando o filhote preso no laço, numa noite de Anhangá na Serra.', text: 'Na tradição tupi, espírito da mata que protege os animais. Aparece como um veado branco de olhos de fogo e castiga com febre e ilusão quem caça por maldade.' });
FOLK_SCENES.teiniagua = [
  ['sadi', 'Uma luz vermelha piscando entre as pedras…'], ['teiniagua', '…'],
  ['sadi', 'Uma lagartixa com uma pedra vermelha na cabeça… a Teiniaguá! O vô contava da Salamanca do Jarau.'],
  ['sadi', 'Dizem que era uma princesa moura, encantada em lagartixa, e que um sacristão se perdeu de amor por ela. Os dois ficaram escondidos dentro do cerro por uns duzentos anos.'],
  ['teiniagua', 'Bodegueiro… quem chega até mim passa pelas provas da Salamanca. Ouro, amor e poder: escolhe.'],
  ['sadi', 'No causo do Simões Lopes Neto, o Blau Nunes passou pelas provas e não aceitou nada. Coragem, Sadi!']
];
FOLK_SCENES.anhanga = [
  ['sadi', 'Um veado branco no meio das araucárias… com olhos de fogo?'], ['anhanga', '…'],
  ['sadi', 'O Anhangá! Os antigos diziam: é o espírito que protege os bichos do mato. Quem caça por maldade, ele castiga com febre e ilusão.'],
  ['sadi', 'Escuta… tem um bicho chorando ali. Um filhote de veado preso num laço de caçador!'],
  ['sadi', 'Calma, pequeno, que eu te solto. E tu, Anhangá, fica tranquilo: aqui ninguém caça por gosto.']
];
FOLK_WIN.teiniagua = '<b>🦎 A Teiniaguá riu, faceira</b><br>“Igualzinho ao Blau Nunes: não quis nada.” Ela te ofereceu uma onça de ouro de presente, mas tu lembrou que no causo a moeda encantada só trouxe desgraça, e devolveu. Ela riu de novo e deixou uma lasca da pedra vermelha da cabeça dela.';
FOLK_LOSE.teiniagua = '<b>🦎 A luz vermelha sumiu entre as pedras</b><br>Tu caiu no encanto… e acordou na beira da sanga com a cabeça girando. Dizem que a Teiniaguá volta pra provar outro vivente.';
FOLK_WIN.anhanga = '<b>🦌 O filhote voltou pra mãe</b><br>O veadinho saiu pulando pro mato, onde a mãe esperava. O Anhangá baixou a galhada, como quem agradece, e sumiu na neblina. No chão ficou uma galhada velha, das que veado troca todo ano.<br><br><i>Dizem que, onde ele passa, caça só se faz com necessidade e respeito… e que javali, bicho que veio de fora, ele não protege.</i>';
FOLK_LOSE.anhanga = '<b>🦌 O Anhangá sumiu na neblina</b><br>Tu te mexeu de susto, e ele também. O filhote se soltou sozinho e correu atrás. Tu voltou pra casa com uma febrinha… dizem que é coisa de quem vê o Anhangá.';
const SALAMANCA_PROVAS = [
  ['“Te dou um baú de onças de ouro, se tu ficar comigo na Salamanca.”', ['Fico, e o ouro é meu!', 'Agradeço, mas o meu ouro é o trabalho da bodega.', 'Quero o dobro, então.'], 1],
  ['“Então te dou o amor mais bonito que a Fronteira já viu.”', ['Amor não se ganha de encanto.', 'Fechado! Quando é o casamento?', 'Só se tiver baile.'], 0],
  ['“Leva o poder: tu manda nos campos e nas tropas daqui até o Uruguai.”', ['Quero ser coronel!', 'Quero mandar no Grêmio também.', 'Quem manda no campo é a chuva e o trabalho.'], 2]
];
function salamancaQuestion() {
  const q = G.salamanca, [ask, opts] = SALAMANCA_PROVAS[q.n];
  openDialog('🦎 As provas da Salamanca · ' + (q.n + 1) + '/3', `<div class="rpg-speaker">${expansionPortrait('cave-beasts-b-v1', 4, 88)}<div><p><b>Teiniaguá</b></p><p>${ask}</p></div></div><p class="small-note">O que o Sadi responde?</p><div class="choice-list">${opts.map((o, k) => `<button class="choice" data-act="salamancaAnswer" data-id="${k}">${o}</button>`).join('')}</div>`, 'salamanca');
}
function salamancaAnswer(k) {
  const q = G.salamanca; if (!q) return; if (Number(k) === SALAMANCA_PROVAS[q.n][2]) { q.right++; AudioEngine.heart(); } else AudioEngine.bad();
  q.n++; if (q.n < SALAMANCA_PROVAS.length) { salamancaQuestion(); return; }
  closeDialog(true); G.salamanca = null; folkResult('teiniagua', q.right >= 2);
}
{
  const confront = folkConfront;
  folkConfront = function (id) {
    if (id === 'teiniagua') { G.salamanca = { n: 0, right: 0 }; salamancaQuestion(); return; }
    if (id === 'anhanga') {
      startFarmGame({ title: '🦌 Anhangá', stages: [
        { kind: 'alternate', label: 'Afrouxar o laço', text: 'O filhote se debate: alterne <span class="keycap">A</span> e <span class="keycap">D</span> pra afrouxar o nó com cuidado.', doneText: 'O laço afrouxou!', pitch: 820 },
        { kind: 'timing', label: 'Ficar quieto', text: 'O Anhangá chega perto pra ver quem é tu. Aperte <span class="keycap">E</span> na faixa verde pra baixar os olhos e não se mexer.', zone: [.42, .6], speed: 1.1, button: 'Baixar os olhos', hitText: 'Ele te olhou… e confiou.', missText: 'Tu se mexeu de susto!' }
      ], done: r => folkResult(id, r.every(Boolean)), cancel: () => folkResult(id, false) });
      return;
    }
    return confront(id);
  };
  const draw = drawFolk;
  drawFolk = function (id, x, y, dx = 1) {
    if (id === 'teiniagua') { const f = 4 + Math.floor(frameClock * 6) % 3; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x + dx * 20, y - 30, 90, .45 + .15 * Math.sin(frameClock * 5), '255,60,50'); ctx.restore(); expansionSprite('cave-beasts-b-v1', f, x, y, 64, dx < 0); return; }
    if (id === 'anhanga') { const f = 12 + Math.floor(frameClock * 4) % 3; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 90, 170, .3, '230,236,255'); glow(x + dx * 40, y - 140, 40, .6, '255,80,40'); ctx.restore(); ctx.save(); ctx.globalAlpha = .9; expansionSprite('cave-beasts-b-v1', f, x, y, 165, dx < 0); ctx.restore(); return; }
    return draw(id, x, y, dx);
  };
  const speaker = sceneSpeaker;
  sceneSpeaker = function (who) { if (who === 'teiniagua' || who === 'anhanga') return { portrait: expansionPortrait('cave-beasts-b-v1', who === 'teiniagua' ? 4 : 12, 104), name: FOLK[who].name }; return speaker(who); };
  const art = collectibleArt; collectibleArt = function (id) { return id === 'anhanga' ? `<div class="tcard-encounter">${expansionPortrait('cave-beasts-b-v1', 12, 220)}</div>` : art(id); };
  // Lembranças da estante: a lasca do carbúnculo e a galhada do Anhangá.
  const shelf = lembrancas; lembrancas = function () { const r = G.relics || {}; return [...shelf(), r.carbunculo && 'carbunculo', r.galhada && 'galhada'].filter(Boolean); };
  const keep = window.drawLembranca;
  window.drawLembranca = function (id, x, y) {
    if (id === 'carbunculo') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 20, 32, .45, '255,60,50'); ctx.restore(); poly([[x, y - 40], [x + 12, y - 22], [x, y - 4], [x - 12, y - 22]], '#c8202a'); poly([[x, y - 36], [x + 6, y - 24], [x, y - 14], [x - 5, y - 24]], '#ff6a5a'); return; }
    if (id === 'galhada') { ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - 4, y - 2); ctx.quadraticCurveTo(x - 10, y - 26, x - 2, y - 48); ctx.moveTo(x - 7, y - 20); ctx.lineTo(x - 18, y - 30); ctx.moveTo(x - 5, y - 34); ctx.lineTo(x + 8, y - 44); ctx.stroke(); return; }
    return keep(id, x, y);
  };
  const act = action; action = function (name, id) { if (name === 'salamancaAnswer') { salamancaAnswer(id); return; } return act(name, id); };
}
