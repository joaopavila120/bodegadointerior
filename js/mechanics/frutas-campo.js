// Frutíferas do campo: os butiazeiros e as bergamoteiras espalhados pela Fronteira, pela Serra e por Santa Catarina
// (as árvores de regional-identity.js) funcionam igual ao butiazeiro da beira do rio: dá pra colher (E), e a fruta volta
// a amadurecer depois de FORAGE_EVERY dias. A árvore é desenhada sem fruta e as frutas maduras vão por cima, então,
// colhida, ela fica pelada até amadurecer de novo.
'use strict';

const FRUIT_TREES = {
  0: { name: 'Bergamoteira', of: 'da', item: 'bergamota', q: 2000 },   // tree-varieties-v1: 0 é a bergamoteira carregada
  1: { name: 'Butiazeiro', of: 'do', item: 'butia', q: 2, every: 4 }   // e 1 o butiazeiro carregado (butiá cura: dá pouco)
};
// Onde as frutas maduras ficam, em fração do tamanho da árvore (x a partir do tronco, y pra cima a partir do chão).
const FRUIT_SPOTS = {
  bergamota: [[-.28, .62], [-.12, .74], [.06, .66], [.22, .72], [.3, .58], [-.2, .5], [.12, .52], [-.02, .84], [.2, .86]],
  butia: [[-.05, .43], [.03, .46], [.09, .41], [-.11, .4], [.01, .39]]
};
const fruitTreeCache = new Map(), fruitTreeBusy = new Set();
function fruitTrees(M = worldMap()) {
  if (!M || !ENV_MAIN_MAPS.has(M.id)) return [];
  if (fruitTreeCache.has(M.id)) return fruitTreeCache.get(M.id);
  // As árvores consultam os pontos de E do mapa pra não cair em cima deles (e esses pontos incluem as frutíferas):
  // enquanto elas estão sendo posicionadas, as frutíferas ainda não contam.
  if (fruitTreeBusy.has(M.id)) return [];
  fruitTreeBusy.add(M.id); let trees; try { trees = regionalExtraTrees(M); } finally { fruitTreeBusy.delete(M.id); }
  const list = trees.filter(t => FRUIT_TREES[t.i]).map(t => ({ ...FRUIT_TREES[t.i], id: 'arvore:' + M.id + ':' + t.x + ':' + t.y, map: M.id, x: t.x, y: t.y, w: t.w, h: t.h, i: t.i }));
  fruitTreeCache.set(M.id, list); return list;
}
function fruitTreeAt(map, x, y) { return fruitTrees(WORLD_MAPS[map]).find(f => f.x === x && f.y === y) || null; }
function fruitArtReady() { return !!ENV_ART['tree-varieties-v1']?.naturalWidth; }
function pickFruitTree(f) {
  if (!forageReady(f)) { worldSay((f.of === 'da' ? 'A ' : 'O ') + f.name.toLowerCase() + ' ainda está sem fruta madura. Volta em ' + (forageWait(f) - (G.day - G.forage[f.id])) + ' dia(s).'); return; }
  teachFirst('mato', () => {
    G.forage ??= {}; G.forage[f.id] = G.day; bagAdd(f.item, f.q); AudioEngine.tick();
    farmXP(2, (f.item === 'bergamota' ? formatWeight(f.q) + ' de bergamota' : f.q + ' ' + bagName(f.item).toLowerCase()) + ' no inventário'); save();
  });
}
// A árvore sem fruta: a bergamoteira usa a copa redonda da mesma folha; o butiazeiro, o butiazeiro da beira do rio.
function drawFruitTree(f, x, y, w, h, sprite) {
  const ready = forageReady(f);
  if (f.item === 'butia' && WORLD_ART['butia-v2']?.naturalWidth) worldSprite('butia-v2', 0, x - w / 2, y - h, w, h);
  else sprite('tree-varieties-v1', 3, x, y, w, h);
  if (!ready) return true;
  const size = f.item === 'butia' ? Math.max(18, w * .085) : Math.max(20, w * .1);
  for (const [fx, fy] of FRUIT_SPOTS[f.item]) food(f.item, x + fx * w, y - fy * h, size);
  return true;
}
{
  const sprite = environmentSprite;
  environmentSprite = function (sheet, index, x, y, w, h) {
    if (sheet === 'tree-varieties-v1' && FRUIT_TREES[index] && worldOut && fruitArtReady()) { const f = fruitTreeAt(worldOut.map, x, y); if (f) return drawFruitTree(f, x, y, w, h, sprite); }
    return sprite(sheet, index, x, y, w, h);
  };
  const spots = forageSpots; forageSpots = function () {
    const list = spots(); if (!worldOut || prologueActive() || !fruitArtReady()) return list;
    for (const f of fruitTrees()) list.push({ id: 'forage:' + f.id, x: f.x, y: f.y + 30, label: forageReady(f) ? 'Colher ' + (f.item === 'bergamota' ? 'bergamota' : 'butiá') + ' ' + f.of + ' ' + f.name.toLowerCase() : f.name + ' · fruta de novo em ' + (forageWait(f) - (G.day - G.forage[f.id])) + ' dia(s)', act: () => pickFruitTree(f) });
    return list;
  };
}
