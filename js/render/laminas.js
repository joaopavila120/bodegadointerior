// A cor das lâminas do Sadi: uma linha só de animação pra cada lâmina (o sabre e o facão), com a cor trocada na hora.
// scripts/build-lamina-layers.py separa a lâmina de cada folha numa camada de brilho; aqui ela é pintada com uma paleta
// (do escuro ao claro, mais o brilho perolado das pedras) e colada por cima da folha original.
// Pra trocar a cor de uma arma, é só mudar "lamina" em CAVE_WEAPONS (forja.js e ilha-griggs.js) pra um nome daqui.
// Só usa operações de desenho, sem ler pixel: funciona também abrindo o jogo direto do arquivo (file://).
'use strict';
const LAMINA_PALETAS = {
  cinza: { sombra: '#3f4248', luz: '#dfe2e6' },
  cinza_escuro: { sombra: '#202226', luz: '#8d9198' },
  prata: { sombra: '#6a7484', luz: '#ffffff', perola: ['#dff0ff', '#ffffff', '#cfdcf0'], forca: .22 },
  prata_escura: { sombra: '#2f3540', luz: '#b4bfcc' },
  preto: { sombra: '#050608', luz: '#4e525a' },
  dourado: { sombra: '#5e3d0c', luz: '#ffe9a0' },
  cobre: { sombra: '#4e2610', luz: '#f5b98c' },
  ametista: { sombra: '#4d4560', luz: '#efe4ff', perola: ['#ff9be8', '#9fc4ff', '#d8a6ff'], forca: .34 },
  agata: { sombra: '#5b463f', luz: '#ffe2cf', perola: ['#ffb27a', '#ffd9a0', '#ff8f70'], forca: .3 }
};
const LAMINA_CAMADAS = { sabre: 'assets/images/actions/sadi-sabre-lamina-v1.png', facao: 'assets/images/actions/sadi-facao-lamina-v1.png' };
// Pedra preciosa, ouro e os sabres preto e dourado ficam com a cor deles mesmo com o fio de prata do Griggs; as outras lâminas ficam prateadas.
const LAMINA_PEDRAS = ['ametista', 'agata', 'ouro', 'sabre_preto', 'sabre_dourado'], LAMINA_FOLHAS_MAX = 3;
const laminaCamadas = {}, laminaLoads = {}, laminaFolhas = new Map();
function laminaCamada(tool) {
  if (!laminaCamadas[tool]) { const im = laminaCamadas[tool] = new Image(); laminaLoads[tool] = new Promise(resolve => { im.onload = () => resolve(true); im.onerror = () => resolve(false); }); im.src = LAMINA_CAMADAS[tool]; }
  return laminaCamadas[tool];
}
function loadLaminaArt() { for (const tool of Object.keys(LAMINA_CAMADAS)) laminaCamada(tool); return Promise.all(Object.values(laminaLoads)).then(r => r.every(Boolean)); }
function laminaTool(weapon) { return armaSabre(weapon) ? 'sabre' : 'facao'; }
function laminaDaArma(weapon) {
  const w = CAVE_WEAPONS.find(x => x.id === weapon); if (!w) return null;
  return typeof ilhaFacaoPrata === 'function' && ilhaFacaoPrata() && !LAMINA_PEDRAS.includes(weapon) ? 'prata' : w.lamina || null;
}
function laminaRGB(hex) { return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); }
// O brilho vira cor: brilho 0 fica na sombra, brilho cheio fica na luz (multiplica pela diferença e soma a sombra).
function laminaPintada(camada, P) {
  const c = document.createElement('canvas'), w = c.width = camada.naturalWidth, h = c.height = camada.naturalHeight, g = c.getContext('2d'), s = laminaRGB(P.sombra), l = laminaRGB(P.luz);
  g.drawImage(camada, 0, 0);
  g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgb(${l.map((v, i) => Math.max(0, v - s[i])).join()})`; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'lighter'; g.fillStyle = P.sombra; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'destination-in'; g.drawImage(camada, 0, 0);
  if (P.perola) {
    // O perolado: faixas diagonais de cor que correm ao longo da lâmina.
    const band = g.createLinearGradient(0, 0, w, h), n = Math.ceil((w + h) / 26); for (let k = 0; k <= n; k++) band.addColorStop(k / n, P.perola[k % P.perola.length]);
    g.globalCompositeOperation = 'source-atop'; g.globalAlpha = P.forca; g.fillStyle = band; g.fillRect(0, 0, w, h); g.globalAlpha = 1;
  }
  return c;
}
// A folha inteira do Sadi com a lâmina nessa paleta, no formato que o actionSprite desenha. Sem paleta (ou enquanto a
// camada não carrega), fica a folha original.
function laminaFolha(tool, paleta) {
  const base = 'tool:sadi-' + tool, P = LAMINA_PALETAS[paleta]; if (!P) return base;
  const id = base + ':' + paleta; if (laminaFolhas.has(id)) return id;
  const folha = sadiToolImage(tool), camada = laminaCamada(tool); if (!folha?.naturalWidth || !camada.naturalWidth) return base;
  const c = document.createElement('canvas'), g = (c.width = folha.naturalWidth, c.height = folha.naturalHeight, c.getContext('2d'));
  g.drawImage(folha, 0, 0); g.globalCompositeOperation = 'destination-out'; g.drawImage(camada, 0, 0); g.globalCompositeOperation = 'source-over'; g.drawImage(laminaPintada(camada, P), 0, 0);
  c.naturalWidth = c.width; ACTION_ART[id] = c; ACTION_ART_CROPS[id] = SADI_TOOL_POSES[tool]; laminaFolhas.set(id, c);
  while (laminaFolhas.size > LAMINA_FOLHAS_MAX) { const old = laminaFolhas.keys().next().value, im = laminaFolhas.get(old); laminaFolhas.delete(old); delete ACTION_ART[old]; delete ACTION_ART_CROPS[old]; im.width = im.height = 0; }
  return id;
}
