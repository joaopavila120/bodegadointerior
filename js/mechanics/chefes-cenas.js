// A chegada de cada chefe vira uma cena curta: a câmera mostra o Sadi e o chefe, os dois falam e só então a luta começa.
// Na primeira vez, a conversa inteira e, depois da cena, as regras da luta. Da segunda em diante, uma troca rápida de falas.
// Sem cenas (window.NO_SCENES, nos testes), tudo vira conversa normal.
'use strict';
function chefeFalaTalk(l) { return typeof l[0] === 'string' && !['card', 'reward', 'dica', 'sadi'].includes(l[0]) ? [pampaQuem(l[0]), ...l.slice(1)] : l; }
function chefeDesenho(b) { return (a, y) => { const o = { x: b.x, y: b.y, dx: b.dx, hurt: b.hurt }; b.x = a.x; b.y = y; b.dx = a.dx; b.hurt = 0; try { drawCaveBeast(b); } finally { Object.assign(b, o); } }; }
// o: b (o chefe) · falas, curtas (da segunda vez em diante) · regras (cartões depois da cena, só na primeira vez) · som · extras (outros atores) · fim · soCena (sem cena, não mostra nada)
function chefeCena(id, o) {
  const { b, falas, curtas, regras = [], som, extras = [], fim = null, soCena, noite = 0 } = o, vistos = G.chefesVistos ??= {}, visto = !!vistos[id]; vistos[id] = G.day;
  const linhas = visto && curtas ? curtas : falas, depois = visto ? [] : regras;
  keys.clear(); som?.();
  if (!scenesEnabled()) { if (!soCena) talk([...linhas, ...depois].map(chefeFalaTalk), fim, 'Em guarda!'); else fim?.(); return; }
  // O chefe fica ao lado do Sadi, em cena: a caixa de fala não cobre nenhum dos dois. Como a tela começa escura, ele já chega no lugar.
  const M0 = worldMap(), pp = worldOut; if (Math.abs(b.y - pp.y) > 150 || Math.abs(b.x - pp.x) < 230 || Math.abs(b.x - pp.x) > 560) { for (const o of [b.x < pp.x ? -1 : 1, b.x < pp.x ? 1 : -1]) { const q = { x: pp.x + o * 380, y: pp.y - 16 }; if (M0.canWalk(q.x, q.y)) { Object.assign(b, q); break; } } }
  const p = worldOut, lado = b.x < p.x ? -1 : 1, d = Math.hypot(b.x - p.x, b.y - p.y) || 1, M = worldMap(), passo = Math.min(90, Math.max(0, d - 240)), nx = p.x + (b.x - p.x) / d * passo, ny = p.y + (b.y - p.y) / d * passo, anda = passo > 20 && M.canWalk(nx, ny), fim2 = anda ? { x: nx, y: ny } : { x: p.x, y: p.y };
  const cena = l => l[0] === 'card' || l[0] === 'dica' ? { overlay: 'note', text: l[1] } : { say: l[0], text: l[1] };
  playSteps([...sceneWorld({ map: p.map, x: (p.x + b.x) / 2, y: (p.y + b.y) / 2 + 70, night: noite }),
    { actor: 'sadi', x: p.x, y: p.y, dx: lado, dy: 0, speed: 170 }, { actor: 'chefeCena', x: b.x, y: b.y, dx: -lado, draw: chefeDesenho(b) }, ...extras, { fade: 'in', time: .35 },
    ...(anda ? [{ walk: 'sadi', to: fim2 }] : [{ wait: .35 }]), ...linhas.map(cena), { fade: 'out', time: .28 }], 'chefe-' + id,
  () => { Object.assign(worldOut, fim2, { dx: lado, dy: 0, walk: false }); keys.clear(); if (depois.length) talk(depois.map(chefeFalaTalk), fim, 'Em guarda!'); else fim?.(); });
}
// Os chefes que falam e não têm retrato próprio ainda.
Object.assign(PAMPA_GENTE, { bruxaMor: 'A Bruxa-mor' });
// As lendas: cada uma com a sua fala, ao chegar na clareira.
const LENDA_CENA = {
  lobisomem: [['sadi', 'Bah… esse não é cachorro de ninguém. Vem, bicho: hoje eu tiro sangue e quebro o encanto.']],
  mula: [['sadi', 'Fogo saindo do pescoço, ferradura batendo na pedra… É ela. Agora é arrancar o freio.']],
  boitata: [['sadi', 'A cobra de fogo do banhado! Se eu não olhar pros olhos dela, ela não me cega… acho.']],
  sanguanel: [['sadi', 'Ri à vontade, baixinho. Quero ver rir depois da primeira facãozada.']],
  teiniagua: [['sadi', 'Essa pedra de fogo na cabeça… O Lauro tinha razão. Calma, moça: eu só vim tirar o encanto do guri.']],
  anhanga: [['sadi', 'Galhada de veado e olho de fogo. É o Anhangá. Calma, bicho: eu não vim caçar ninguém.']]
};
{
  const start = lendaStart; lendaStart = function (id) {
    start(id); const f = LENDA_CENA[id]; if (!f || !scenesEnabled()) return;
    chefeCena('lenda:' + id, { b: lendaBoss(id), falas: f, curtas: [['sadi', 'De novo tu. Desta vez não te deixo fugir pro escuro.']], soCena: true, noite: .35, som: () => AudioEngine.caveCry?.(id) });
  };
}
