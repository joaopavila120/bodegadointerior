// Frutíferas do campo: os butiazeiros e as bergamoteiras espalhados pela Fronteira, pela Serra e por Santa Catarina
// (as árvores de regional-identity.js), e as pitangueiras de Santa Catarina, funcionam igual ao butiazeiro da beira do
// rio: dá pra colher (E), e a fruta volta a amadurecer depois de FORAGE_EVERY dias. A árvore é desenhada sem fruta e as
// frutas maduras são pintadas por cima, então, colhida, ela fica pelada até amadurecer de novo.
'use strict';

// tree-varieties-v1: 0 é a bergamoteira carregada e 1 o butiazeiro carregado. A bergamoteira usa a copa redonda (3) e a
// pitangueira a copa larga (2), com as frutas pintadas por cima. Butiá e pitanga curam nas brigas: dão pouco.
const FRUIT_TREES = {
  0: { name: 'Bergamoteira', of: 'da', item: 'bergamota', fruit: 'bergamota', q: [600, 1200], tree: 3 },   // colhe de 600 g a 1,2 kg
  1: { name: 'Butiazeiro', of: 'do', item: 'butia', fruit: 'butiá', q: 2, every: 4 }
};
const PITANGUEIRA = { name: 'Pitangueira', of: 'da', item: 'pitanga', fruit: 'pitanga', q: 3, every: 3, tree: 2 };
// Em Santa Catarina, as copas 2 e 3 também dão fruta: são pitangueiras.
function fruitKind(map, i) { return map === 'sc' && i >= 2 ? PITANGUEIRA : FRUIT_TREES[i] || null; }
// Onde as frutas maduras ficam, em fração da copa desenhada (x a partir do meio, y pra cima a partir do chão).
const FRUIT_SPOTS = {
  bergamota: [[-.34, .78], [-.16, .88], [.07, .9], [.29, .78], [.41, .58], [-.4, .55], [-.2, .66], [.19, .68], [0, .75], [.31, .41], [-.32, .36], [.09, .56]],
  pitanga: [[-.32, .78], [-.17, .88], [-.01, .94], [.15, .88], [.29, .82], [.4, .64], [-.39, .57], [-.25, .64], [-.1, .74], [.07, .74], [.24, .66], [.34, .46], [-.35, .37], [-.17, .46], [.16, .48], [.02, .85]],
  butia: [[-.05, .43], [.03, .46], [.09, .41], [-.11, .4], [.01, .39]]
};
const FRUIT_PAINT = { bergamota: { r: .021, c: ['#7a2e06', '#f2761a', '#ffc27a'] }, pitanga: { r: .013, c: ['#5a0a0a', '#d0221e', '#ff8a7a'] } };
function paintFruits(item, tree, x, y, w, h) {
  const crop = ENV_CROPS['tree-varieties-v1']?.[tree], P = FRUIT_PAINT[item]; if (!crop || !P) return;
  const k = Math.min(w / crop[2], h / crop[3]), sw = crop[2] * k, sh = crop[3] * k, r = Math.max(2, sw * P.r);
  for (const [fx, fy] of FRUIT_SPOTS[item]) {
    const px = x + fx * sw, py = y - fy * sh;
    ctx.fillStyle = P.c[0]; ctx.beginPath(); ctx.arc(px, py, r + 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = P.c[1]; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = P.c[2]; ctx.fillRect(Math.round(px - r * .55), Math.round(py - r * .6), Math.max(1, Math.round(r * .5)), Math.max(1, Math.round(r * .5)));
  }
}
const fruitTreeCache = new Map(), fruitTreeBusy = new Set();
function fruitTrees(M = worldMap()) {
  if (!M || !ENV_MAIN_MAPS.has(M.id)) return [];
  if (fruitTreeCache.has(M.id)) return fruitTreeCache.get(M.id);
  // As árvores consultam os pontos de E do mapa pra não cair em cima deles (e esses pontos incluem as frutíferas):
  // enquanto elas estão sendo posicionadas, as frutíferas ainda não contam.
  if (fruitTreeBusy.has(M.id)) return [];
  fruitTreeBusy.add(M.id); let trees; try { trees = regionalExtraTrees(M); } finally { fruitTreeBusy.delete(M.id); }
  const list = trees.filter(t => fruitKind(M.id, t.i)).map(t => ({ ...fruitKind(M.id, t.i), id: 'arvore:' + M.id + ':' + t.x + ':' + t.y, map: M.id, x: t.x, y: t.y, w: t.w, h: t.h, i: t.i }));
  fruitTreeCache.set(M.id, list); return list;
}
function fruitTreeAt(map, x, y) { return fruitTrees(WORLD_MAPS[map]).find(f => f.x === x && f.y === y) || null; }
function fruitArtReady() { return !!ENV_ART['tree-varieties-v1']?.naturalWidth; }
function pickFruitTree(f) {
  if (!forageReady(f)) { worldSay((f.of === 'da' ? 'A ' : 'O ') + f.name.toLowerCase() + ' ainda está sem fruta madura. Volta em ' + (forageWait(f) - (G.day - G.forage[f.id])) + ' dia(s).'); return; }
  teachFirst('mato', () => {
    const q = Array.isArray(f.q) ? Math.round((f.q[0] + Math.random() * (f.q[1] - f.q[0])) / 100) * 100 : f.q;
    G.forage ??= {}; G.forage[f.id] = G.day; bagAdd(f.item, q); AudioEngine.tick();
    farmXP(2, (f.item === 'bergamota' ? formatWeight(q) + ' de bergamota' : q + ' ' + bagName(f.item).toLowerCase()) + ' no inventário'); save();
  });
}
// A árvore sem fruta (o butiazeiro é o da beira do rio) e, madura, as frutas pintadas na copa.
function drawFruitTree(f, x, y, w, h, sprite) {
  const ready = forageReady(f);
  if (f.tree != null) { sprite('tree-varieties-v1', f.tree, x, y, w, h); if (ready) paintFruits(f.item, f.tree, x, y, w, h); return true; }
  if (WORLD_ART['butia-v2']?.naturalWidth) worldSprite('butia-v2', 0, x - w / 2, y - h, w, h);
  else sprite('tree-varieties-v1', 3, x, y, w, h);
  if (!ready) return true;
  const size = f.item === 'butia' ? Math.max(18, w * .085) : Math.max(20, w * .1);
  for (const [fx, fy] of FRUIT_SPOTS[f.item]) food(f.item, x + fx * w, y - fy * h, size);
  return true;
}
{
  const sprite = environmentSprite;
  environmentSprite = function (sheet, index, x, y, w, h) {
    if (sheet === 'tree-varieties-v1' && worldOut && fruitKind(worldOut.map, index) && fruitArtReady()) { const f = fruitTreeAt(worldOut.map, x, y); if (f) return drawFruitTree(f, x, y, w, h, sprite); }
    return sprite(sheet, index, x, y, w, h);
  };
  const spots = forageSpots; forageSpots = function () {
    const list = spots(); if (!worldOut || prologueActive() || !fruitArtReady()) return list;
    for (const f of fruitTrees()) list.push({ id: 'forage:' + f.id, x: f.x, y: f.y + 30, label: forageReady(f) ? 'Colher ' + f.fruit + ' ' + f.of + ' ' + f.name.toLowerCase() : f.name + ' · fruta de novo em ' + (forageWait(f) - (G.day - G.forage[f.id])) + ' dia(s)', act: () => pickFruitTree(f) });
    return list;
  };
  // A pitangueira perto do café: a copa larga com as pitangas pintadas (não fica fruta solta no ar).
  const forageArt = drawForageArt; drawForageArt = function (f) {
    if (f.item !== 'pitanga' || !fruitArtReady()) return forageArt(f);
    const y = f.y + 30, p = worldOut; ctx.save(); ellipse(f.x + 8, y + 2, 64, 12, '#17291930');
    if (p && Math.abs(p.x - f.x) < 110 && p.y < y + 6 && p.y > y - 200) ctx.globalAlpha *= .42;
    drawFruitTree({ ...f, tree: PITANGUEIRA.tree }, f.x, y, 260, 230, environmentSprite); ctx.restore(); return true;
  };
}
