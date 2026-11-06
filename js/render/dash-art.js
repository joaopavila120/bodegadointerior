// A animação do dash (o Passo de esquiva). O corpo agacha no arranque, corre inclinado e esticado com as pernas trocando e
// freia jogando o peso pra trás; atrás dele ficam vultos azulados e riscos de vento, e o chão levanta poeira.
// Usa os quadros de caminhada de quem está jogando (colunas 1 e 3: passada larga; 2: pés juntos), então vale pro Sadi e
// pros outros personagens. Só desenha: distância, tempo e invulnerabilidade do dash continuam em caverna.js.
'use strict';
const DASH_ART = { arranque: .18, freada: .15, troca: .07, lean: .3, estica: .16, perto: 52, vultos: 4, poeira: .05 };
let dashVisto = null, dashFreada = null, dashPoeiraT = 0;
const dashVultoFrames = new Map();
function dashAtual() { return !worldOut ? null : inCave() ? caveFloorRun().dash || null : worldDash; }
function dashAltura(id) { return (worldMap().indoor ? 130 : 124) * (id === 'sadi' ? sadiScale() : 1); }
function dashQuadro(id, dx, dy, col) { const direction = walkDirection(dx, dy); return { id, index: direction * 4 + col, direction, flip: direction === 1 && dx < 0, height: dashAltura(id), dx, dy }; }
function dashCorrendo(id, dx, dy, col) { return { ...dashQuadro(id, dx, dy, col), fase: 'corrida', lean: dx * DASH_ART.lean, sx: 1 + DASH_ART.estica * Math.abs(dx) - .06 * Math.abs(dy), sy: 1 + DASH_ART.estica * Math.abs(dy) - .06 * Math.abs(dx) }; }
// A pose de agora, ou null se o personagem não está no dash (com um item na mão ou sem desenho, fica o boneco normal).
function dashPose(sprite) {
  const id = walkCharacterId(sprite), p = worldOut; if (!p || !id || !WALK_ART[id]?.naturalWidth || playerCarrying()) return null;
  const d = dashAtual(), f = !d && !p.walk ? dashFreada : null; if (!d && !f) return null;
  const dx = (d || f).dx ?? p.dx ?? 0, dy = (d || f).dy ?? p.dy ?? 0;
  if (f) { const k = f.t / DASH_ART.freada; return { ...dashQuadro(id, dx, dy, 1), fase: 'freada', lean: -dx * .2 * k, sx: 1 + .07 * k, sy: 1 - .07 * k }; }
  const passou = CAVE_DASH.duration - d.t;
  if (passou < CAVE_DASH.duration * DASH_ART.arranque) return { ...dashQuadro(id, dx, dy, 1), fase: 'arranque', lean: dx * .06, sx: 1.12, sy: .86 };
  return dashCorrendo(id, dx, dy, Math.floor(passou / DASH_ART.troca) % 2 ? 2 : 0);
}
function dashCorpo(pose, x, y, frame) {
  const crop = WALK_ART_CROPS[pose.id][pose.index], scale = pose.height / crop[3];
  ctx.save(); ctx.translate(x, y); ctx.rotate(pose.lean); ctx.scale((pose.flip ? -1 : 1) * pose.sx, pose.sy);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'low'; ctx.drawImage(frame, -crop[4] * scale, -pose.height, crop[2] * scale, pose.height); ctx.restore();
}
function dashPixels(height) { const t = ctx.getTransform(); return height * Math.hypot(t.a, t.b); }
function dashVultoFrame(id, index, pixels) {
  const base = walkFrame(id, index, pixels), key = id + ':' + index + ':' + base.height; let c = dashVultoFrames.get(key);
  if (!c) {
    c = document.createElement('canvas'); c.width = base.width; c.height = base.height; const g = c.getContext('2d');
    g.drawImage(base, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(150,225,255,.72)'; g.fillRect(0, 0, c.width, c.height);
    if (dashVultoFrames.size >= 36) dashVultoFrames.delete(dashVultoFrames.keys().next().value); dashVultoFrames.set(key, c);
  }
  return c;
}
// Riscos de vento atrás do corpo: em três alturas, ou lado a lado quando ele corre pra cima ou pra baixo.
function drawDashRiscos(x, y, dx, dy) {
  const vertical = Math.abs(dy) > Math.abs(dx); ctx.save(); ctx.strokeStyle = 'rgba(215,240,255,.55)'; ctx.lineCap = 'round';
  for (const [h, len, w] of [[-34, 64, 2.5], [-72, 92, 3], [-108, 54, 2]]) {
    const sx = x + (vertical ? (h + 72) * .7 : 0) - dx * 26, sy = y + (vertical ? -60 : h) - dy * 26;
    ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - dx * len, sy - dy * len); ctx.stroke();
  }
  ctx.restore();
}
function drawDashPose(pose, x, y) {
  ellipse(x - pose.dx * 6, y + 1, 18 + 10 * Math.abs(pose.dx), 7, '#271c1755');
  if (pose.fase === 'corrida') drawDashRiscos(x, y, pose.dx, pose.dy);
  dashCorpo(pose, x, y, walkFrame(pose.id, pose.index, dashPixels(pose.height)));
}
// Os vultos que ficam pra trás, do mais novo pro mais velho e um pouco afastados entre si.
function drawDashRastro(trail) {
  if (!trail?.length) return;
  const id = walkCharacterId(avatarSprite()); ctx.save();
  if (!id || !WALK_ART[id]?.naturalWidth) { for (const t of trail) { ctx.globalAlpha = t.life / CAVE_DASH.vulto * .45; ellipse(t.x, t.y - 8, 20, 9, '#a9eaff'); } ctx.restore(); return; }
  let ultimo = worldOut, n = 0;
  for (let i = trail.length - 1; i >= 0 && n < DASH_ART.vultos; i--) {
    const t = trail[i]; if (Math.hypot(t.x - ultimo.x, t.y - ultimo.y) < DASH_ART.perto) continue;
    ultimo = t; n++; const pose = dashCorrendo(id, t.dx ?? 0, t.dy ?? 0, n % 2 ? 0 : 2);
    ctx.globalAlpha = t.life / CAVE_DASH.vulto * (.56 - n * .07); dashCorpo(pose, t.x, t.y, dashVultoFrame(id, pose.index, dashPixels(pose.height)));
  }
  ctx.restore();
}
// Um punhado de poeira nos pés: pequena e ligeira, jogada pra trás de quem corre.
function dashPoeira(x, y, n, dx, dy) {
  const cor = inCave() ? 'rgba(138,125,112,.7)' : 'rgba(200,184,152,.7)';
  for (let i = 0; i < n; i++) fxAdd('puff', x + fxRand(-8, 8), y + fxRand(-3, 3), { vx: -dx * fxRand(10, 60) + fxRand(-14, 14), vy: -dy * fxRand(10, 60) - fxRand(4, 20), drag: 4, life: fxRand(.22, .4), size: fxRand(2.5, 5), color: cor });
}
// Poeira no arranque, na corrida e na freada; a freada dura um pouquinho depois de o dash acabar.
function dashArtTick(dt) {
  const d = dashAtual(), p = worldOut;
  if (d) { const dx = d.dx ?? p.dx ?? 0, dy = d.dy ?? p.dy ?? 0; if (!dashVisto) { dashPoeira(p.x - dx * 12, p.y - 2, 5, dx, dy); dashPoeiraT = DASH_ART.poeira; dashFreada = null; } else if ((dashPoeiraT -= dt) <= 0) { dashPoeiraT = DASH_ART.poeira; dashPoeira(p.x, p.y - 2, 1, dx, dy); } dashVisto = { dx, dy }; return; }
  if (dashVisto) { dashPoeira(p.x + dashVisto.dx * 12, p.y - 2, 4, -dashVisto.dx, -dashVisto.dy); dashFreada = { t: DASH_ART.freada, ...dashVisto }; dashVisto = null; return; }
  if (dashFreada && (dashFreada.t -= dt) <= 0) dashFreada = null;
}
{
  const person = drawExpansionPerson; drawExpansionPerson = function (sprite, x, y, walking, chef, dx, seated, mood, dy) {
    if (chef && !seated && worldOut && !scene) { const pose = dashPose(sprite); if (pose) { drawDashPose(pose, x, y); return true; } }
    return person(sprite, x, y, walking, chef, dx, seated, mood, dy);
  };
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); dashArtTick(dt); };
}
