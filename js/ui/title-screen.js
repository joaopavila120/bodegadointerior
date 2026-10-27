// Tela inicial: as cenas do jogo passando atrás do menu e, rolando a página, uma vitrine com as partes que mais chamam
// atenção (as lendas, a mata, o navio, a caverna, a bodega…). Um card com mais de uma foto vai trocando entre elas.
'use strict';

const HERO_SLIDES = ['hero-bodega', 'mata', 'lenda-mula', 'navio', 'mundo-serra'];
const SHOWCASE = [
  { img: ['lenda-boitata', 'caverna-diabo'], size: 'big', tag: 'Chefões', title: 'As lendas viram chefões', text: 'Boitatá, Lobisomem, Mula sem Cabeça, Teiniaguá, Anhangá e Sanguanel na clareira e, no fundo da caverna, o Anhangá-Pitã, o Diabo Vermelho da Salamanca do Jarau: cada um é uma luta própria, de facão na mão.' },
  { img: 'mata', size: 'wide', tag: 'Aventura', title: 'A Mata de Araucárias', text: 'Do refúgio do Garibaldi, desça pinheiral, encosta e restinga até a barra de Laguna, com acampamentos, baús e bichos cada vez mais brabos.' },
  { img: 'navio', title: 'Abordagem ao navio imperial', text: 'Embarque no Seival com Garibaldi e Anita e enfrente o fantasma do capitão Mariath no convés.' },
  { img: 'caverna', title: 'A caverna da Serra', text: 'Andares no escuro, bichos brabos e a ferraria de São Dunstano pra afiar o facão.' },
  { img: 'bodega', tag: 'Simulador', title: 'Toque a bodega do galpão', text: 'Xis na chapa, trago no ponto, fila no balcão e mesa cheia de gauchada.' },
  { img: 'mundo-serra', title: 'Três regiões pra explorar', text: 'Fronteira, Serra Gaúcha e Vale Europeu: vizinhos, Maria Fumaça, baile de capela e Oktoberfest.' },
  { img: 'bocha', title: 'Bocha e truco valendo', text: 'Campeonato na cancha e truco gaudério com o Mano Lima, que não alivia na mesa.' },
  { img: 'historia', title: 'Uma história em capítulos', text: 'O fantasma de camisa vermelha, a Cadela Baia, o sino da capela e o segredo do galpão do vô.' }
];

function buildShowcase() {
  const grid = $('showcaseGrid');
  if (!grid || grid.dataset.ready) return;
  grid.dataset.ready = '1';
  grid.innerHTML = SHOWCASE.map(s => {
    const imgs = [].concat(s.img).map((img, i) => `<img src="assets/images/screens/${img}.jpg" alt="${s.title}" width="1280" height="720" loading="lazy" decoding="async"${i ? '' : ' class="on"'}>`).join('');
    return `<figure class="showcase-card ${s.size || ''}${Array.isArray(s.img) ? ' multi' : ''}">${imgs}${s.tag ? `<em class="tag">${s.tag}</em>` : ''}<figcaption><b>${s.title}</b><span>${s.text}</span></figcaption></figure>`;
  }).join('');
  grid.querySelectorAll('.multi').forEach(card => cycleImages([...card.querySelectorAll('img')], 4000));
  $('pitchMore')?.addEventListener('click', () => $('showcase')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}
function cycleImages(imgs, ms) {
  let k = 0;
  setInterval(() => {
    if ($('start')?.classList.contains('hidden') || document.hidden) return;
    imgs[k].classList.remove('on'); k = (k + 1) % imgs.length; imgs[k].classList.add('on');
  }, ms);
}
// As cenas trocam devagar atrás do menu, só enquanto a tela inicial está aberta.
function buildHeroSlides() {
  const box = $('heroSlides');
  if (!box || box.dataset.ready) return;
  box.dataset.ready = '1';
  box.innerHTML = HERO_SLIDES.map((s, i) => `<img src="assets/images/screens/${s}.jpg" alt="" decoding="async"${i ? '' : ' class="on"'}>`).join('');
  cycleImages([...box.children], 6500);
}
buildShowcase();
buildHeroSlides();
