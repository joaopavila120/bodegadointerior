// Tela inicial: apresentação do jogo com uma captura de cada parte, todas lado a lado num grid.
'use strict';

const SHOWCASE = [
  { img: 'bodega', title: 'Toque a bodega do galpão', text: 'Xis na chapa, trago no ponto, fila no balcão e mesa cheia de gauchada.' },
  { img: 'bocha', title: 'Cancha de bocha com possibilidade de organizar campeonatos', text: 'Desafie o Lauro Bolador e os fregueses da casa.' },
  { img: 'truco', title: 'Truco gaudério valendo aposta', text: 'O Mano Lima ensina a jogar, mas não alivia na mesa.' },
  { img: 'costelao', title: 'Costelão de domingo no fogo de chão', text: 'Rache a lenha, vire as mantas e bata a maionese caseira.' },
  { img: 'laco', title: 'Laçar boi no campo', text: 'Gire o laço e desvie dos rasantes do quero-quero.' },
  { img: 'historia', title: 'A história do galpão do vô', text: 'Vizinhos, amizades, presentes e um capítulo novo a cada nível.' }
];

function buildShowcase() {
  const grid = $('showcaseGrid');
  if (!grid || grid.dataset.ready) return;
  grid.dataset.ready = '1';
  grid.innerHTML = SHOWCASE.map(s => `<figure class="showcase-card"><img src="assets/images/screens/${s.img}.jpg" alt="${s.title}" width="960" height="540"><figcaption><b>${s.title}</b><span>${s.text}</span></figcaption></figure>`).join('');
}
buildShowcase();
