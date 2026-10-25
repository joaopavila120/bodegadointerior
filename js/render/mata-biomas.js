// O chão e a vegetação de cada região da mata adentro, com as artes que o jogo já tem.
//   · Pinheiral: o chão de grimpa da mata, picada de terra e araucária.
//   · Encosta da Serra: o mesmo chão, mais escuro, com manchas de pedra; árvores de folha larga, xaxim e palmeira, e
//     a ponte de corda sobre o arroio.
//   · Restinga: campo baixo com manchas de areia, as picadas de areia branca, butiazais e palmeiras, a sanga escura com a
//     ponte de tábua e, do 17 em diante, a praia e o mar lá embaixo.
// O terreno é pintado só quando um bloco de 512 px entra no cache.
'use strict';
const TRECHO_GROUND = {
  mata: { base: 0, tint: 'rgba(14,34,20,.16)', trail: 1, clear: 1 },
  encosta: { base: 0, tint: 'rgba(6,22,20,.34)', trail: 1, clear: 2 },
  restinga: { base: 3, tint: 'rgba(36,44,18,.12)', trail: 4, clear: 4 }
};
const MATA_CLIFF_RECTS = [[12, 62, 746, 421], [777, 78, 750, 409], [13, 623, 741, 212], [777, 550, 744, 408]];
function mataCliff(i, x, y, w, h) { return mataArtRect('mata-cliffs', MATA_CLIFF_RECTS[i], x - w / 2, y - h, w, h); }
function trechoShorePath(off = 0) { const p = new Path2D(); p.moveTo(-40, TRECHO.H + 40); for (let x = -40; x <= TRECHO.W + 40; x += 30) p.lineTo(x, trechoShoreY(x) + off); p.lineTo(TRECHO.W + 40, TRECHO.H + 40); p.closePath(); return p; }
// Manchas soltas (pedra na encosta, areia na restinga), sempre no mesmo lugar do trecho.
function trechoBlotches(T, v, index, alpha, step = 230) {
  for (let gy = Math.floor(v.y / step) * step - step; gy < v.y + v.h + step; gy += step) for (let gx = Math.floor(v.x / step) * step - step; gx < v.x + v.w + step; gx += step) {
    const n = frontierNoise(gx + T.n * 17, gy + 41); if (n < .55) continue;
    const cx = gx + frontierNoise(gy, gx + 3) * step, cy = gy + frontierNoise(gx + 9, gy) * step, rx = 60 + n * 110, ry = rx * (.45 + frontierNoise(cx, cy) * .3);
    ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, n * 3, 0, Math.PI * 2); ctx.clip(); ctx.globalAlpha = alpha; mataTexture(index, cx - rx, cy - rx, rx * 2, rx * 2); ctx.restore();
  }
}
{
  const paint = paintTrechoTerrain, water = drawTrechoWater, crossing = drawTrechoCrossing;
  paintTrechoTerrain = function (T, v) {
    if (!MATA_ART['mata-terrain']?.naturalWidth || !MATA_ART['mata-nature']?.naturalWidth) return paint(T, v);
    const g = TRECHO_GROUND[T.biome] || TRECHO_GROUND.mata, { x, y, w, h } = v;
    mataTexture(g.base, x, y, w, h);
    if (T.biome === 'encosta') trechoBlotches(T, v, 2, .42);
    if (T.biome === 'restinga') trechoBlotches(T, v, 4, .5, 190);
    ctx.fillStyle = g.tint; ctx.fillRect(x, y, w, h);
    for (const c of T.clearings) { if (c.id === 'praia') continue; ctx.save(); ctx.beginPath(); ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2); ctx.clip(); ctx.globalAlpha = T.biome === 'restinga' ? .55 : .35; mataTexture(g.clear, x, y, w, h); ctx.restore(); }
    // A praia: areia seca, areia molhada e o mar.
    if (T.beach) {
      ctx.save(); ctx.clip(trechoShorePath(-250)); mataTexture(4, x, y, w, h); ctx.restore();
      ctx.save(); ctx.clip(trechoShorePath(-40)); ctx.fillStyle = 'rgba(70,58,36,.3)'; ctx.fillRect(x, y, w, h); ctx.restore();
      ctx.save(); ctx.clip(trechoShorePath()); mataTexture(5, x, y, w, h); ctx.fillStyle = 'rgba(8,24,40,.25)'; ctx.fillRect(x, y, w, h); ctx.restore();
    }
    for (const [expand, alpha] of [[16, .12], [9, .25], [3, .5], [0, .88]]) for (const t of T.trails) { ctx.save(); ctx.clip(t.path(expand)); ctx.globalAlpha = alpha; mataTexture(g.trail, x, y, w, h); ctx.restore(); }
    if (T.river) {
      if (T.biome === 'restinga') { for (const [e, i, a] of [[26, 4, .6], [12, 4, 1], [0, 5, 1]]) { ctx.save(); ctx.clip(trechoRiverPath(T, e)); ctx.globalAlpha = a; mataTexture(i, x, y, w, h); ctx.restore(); } ctx.save(); ctx.clip(trechoRiverPath(T)); ctx.fillStyle = 'rgba(70,52,24,.32)'; ctx.fillRect(x, y, w, h); ctx.restore(); }
      else for (const [e, i, a] of [[20, 1, .35], [9, 2, 1], [0, 5, 1]]) { ctx.save(); ctx.clip(trechoRiverPath(T, e)); ctx.globalAlpha = a; mataTexture(i, x, y, w, h); ctx.restore(); }
    }
    for (const gt of T.gates) if (gt.kind === 'banhado') { ctx.save(); ctx.beginPath(); ctx.ellipse(gt.x, gt.y, 170, 95, 0, 0, Math.PI * 2); ctx.clip(); mataTexture(5, x, y, w, h); ctx.fillStyle = '#54462a77'; ctx.fillRect(x, y, w, h); ctx.restore(); }
  };
  drawTrechoWater = function (T, v) {
    water(T, v); if (!T.beach) return;
    ctx.save(); ctx.strokeStyle = 'rgba(230,240,235,.55)'; ctx.lineWidth = 2.5;
    for (let k = 0; k < 3; k++) { const off = (frameClock * 14 + k * 26) % 78; ctx.globalAlpha = 1 - off / 78; ctx.beginPath(); for (let x = Math.floor(v.x / 24) * 24; x < v.x + v.w + 24; x += 24) { const y = trechoShoreY(x) + 4 + off * .5 + Math.sin(x / 50 + frameClock + k) * 3; x === Math.floor(v.x / 24) * 24 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
    ctx.restore();
  };
  // Travessias: ponte de corda na encosta, tábuas de trapiche na sanga da restinga; no pinheiral, a pinguela de tronco.
  drawTrechoCrossing = function (T) {
    const c = T.crossing; if (!c || T.biome === 'mata' || c.kind === 'pedras' && T.biome !== 'restinga') return crossing(T);
    const cx = trechoRiverX(T, c.y), half = trechoRiverHalf(T, c.y) + 52, built = c.kind === 'pedras' || trechoDay(T.n).pinguela;
    if (!built) return crossing(T);
    if (T.biome === 'encosta' && MATA_ART['mata-cliffs']?.naturalWidth) { mataCliff(2, cx, c.y + 48, half * 2 + 40, 130); return; }
    if (T.biome === 'restinga' && environmentSprite('pier-v1', 0, cx, c.y + 34, half * 2 + 30, 80)) return;
    crossing(T);
  };
  // As árvores de cada região (passando por trás, a copa fica transparente).
  const tree = drawTrechoTree; drawTrechoTree = function (T, t) {
    if (t.art === 'arauc') return tree(T, t);
    const p = worldOut, behind = Math.abs(p.x - t.x) < t.w * .4 && p.y < t.y + 6 && p.y > t.y - t.h * .8;
    ctx.save(); if (behind) ctx.globalAlpha = .4; const sway = Math.sin(frameClock * .8 + t.x) * 1.1;
    if (t.art === 'butia') { if (!WORLD_ART['butia-v2']?.naturalWidth || !worldSprite('butia-v2', 0, t.x - t.w / 2 + sway, t.y - t.h, t.w, t.h)) environmentSprite('tree-varieties-v1', 1, t.x, t.y, t.w, t.h); const r = T.resources.find(q => q.tree === t); if (r && !trechoDay(T.n).got.includes(r.id)) { const k = t.w / 355; for (const [dx, dy] of [[-18, -156], [12, -165], [27, -144], [-4, -150]]) food('butia', t.x + dx * k, t.y + dy * k, 26 * k + 6); } }
    else if (t.art === 'folha') environmentSprite('tree-varieties-v1', t.v, t.x + sway, t.y, t.w, t.h);
    else if (t.art === 'xaxim') environmentSprite('regional-flora-v1', 1, t.x, t.y, t.w, t.h);
    else if (t.art === 'jeriva') environmentSprite('regional-flora-v1', 3, t.x + sway, t.y, t.w, t.h);
    ctx.restore();
  };
  const brush = drawTrechoBrush; drawTrechoBrush = function (T, b) {
    if (b.sheet === 'env' && ENV_ART['environment-props-v3']?.naturalWidth) return environmentSprite('environment-props-v3', b.i, b.x, b.y, b.w, b.h);
    if (b.sheet === 'nat' && MATA_ART['mata-nature']?.naturalWidth) return mataNature(b.i, b.x, b.y, b.w, b.h * 1.1);
    if (b.sheet === 'reg' && ENV_ART['regional-flora-v1']?.naturalWidth) return environmentSprite('regional-flora-v1', b.i, b.x, b.y, b.w * 1.2, b.h * 1.1);
    return brush(T, b);
  };
  const reed = drawTrechoReed; drawTrechoReed = function (T, r) { if (ENV_ART['environment-props-v3']?.naturalWidth) return environmentSprite('environment-props-v3', 3, r.x, r.y, r.w, r.w * .85); return reed(T, r); };
}
