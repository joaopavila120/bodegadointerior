// Cenas no mapa de verdade: a câmera pousa num ponto de um mapa do mundo aberto (a sala da Casona, a estrada da
// Fronteira, a beira do rio) e os atores andam por cima dele, com noite, lampiões, fogo de chão e câmera que desliza.
// Uso: playSteps([...sceneWorld({ map, x, y, night }), { actor: 'valter', x, y }, { fade: 'in', time: .6 }, ...]).
// Atores aceitam extras: as (quem desenhar), horse (pelagem do cavalo, 0 a 2), lamp (lampião na mão), hop (pula de
// alegria), alpha (aparição) e draw (desenho próprio).
'use strict';

// Gente que só aparece nas cenas (no fim da lista, pra não mexer nos saves): a Soldado Grazi, da Brigada (arco da Casona).
PEOPLE.push({ id: 'grazi', name: 'Soldado Grazi', worldOnly: true, unique: true, origin: 'Brigada Militar · Serra Gaúcha', sprite: PEOPLE.find(p => p.id === 'lucia').sprite });

function sceneWorld(o) { return [{ view: 'world' }, { do: () => { scene.world = { map: o.map, x: o.x, y: o.y, night: o.night || 0, hide: o.hide || [], fires: o.fires || [], lights: o.lights || [], props: o.props || null }; } }]; }
// Câmera desliza até o ponto (sem esperar); combine com { wait } para dar tempo.
function scenePan(x, y, speed = 260) { return { do: () => { const w = scene.world; if (w) Object.assign(w, { tx: x, ty: y, speed }); } }; }
function sceneSet(id, patch) { return { do: () => { const a = scene.actors[id]; if (a) Object.assign(a, patch); } }; }
// Grito que sobe do mapa da cena ("Viva!", "Bah!").
function sceneShout(text, x, y, color = '#fff2b0', size = 18) { sparks.push({ text, x, y, life: 2.2, color, size, map: scene?.world?.map || worldOut?.map || null }); }
function sceneFire(x, y, t = frameClock) {
  ellipse(x, y + 4, 46, 12, '#1c140c66');
  for (const [dx, a] of [[-22, .3], [20, -.4], [0, 0]]) { ctx.save(); ctx.translate(x + dx, y - 4); ctx.rotate(a); rect(-26, -4, 52, 9, '#5a3a20', 3, '#2a1a0e'); ctx.restore(); }
  for (let k = 0; k < 6; k++) { const fx = x + Math.sin(t * 9 + k * 1.7) * 12, fy = y - 14 - k * 9 - Math.abs(Math.sin(t * 7 + k)) * 6; ellipse(fx, fy, 14 - k * 1.8, 18 - k * 2.2, k % 2 ? '#ffb030' : '#ff6a20'); }
  ellipse(x, y - 22, 6, 9, '#fff0a0');
}
function sceneActorDraw(id, a) {
  ctx.save(); if (a.alpha != null) ctx.globalAlpha = clamp(a.alpha, 0, 1);
  const y = a.y - (a.hop ? Math.abs(Math.sin(frameClock * 7 + a.x * .01)) * a.hop : 0);
  if (a.draw) a.draw(a, y);
  else if (a.horse != null) { const frame = a.walk ? 1 + Math.floor(frameClock * 8) % 3 : 0; ellipse(a.x, y + 2, 52, 10, '#1c140c44'); expansionSprite('wild-horses-v1', a.horse * 4 + frame, a.x, y + 4, a.size || 112, a.dx < 0); }
  else if ((a.as || id) === 'sadi') personDraw(avatarSprite(), a.x, y, a.walk, true, a.dx, false, 0, a.dy || 0);
  else { const i = PEOPLE.findIndex(p => p.id === (a.as || id)); if (i >= 0) personDraw(PEOPLE[i].sprite, a.x, y, a.walk, false, a.dx, false, 0, a.dy || 0); }
  if (a.lamp) { rect(a.x + 20 * (a.dx < 0 ? -1 : 1) - 2, y - 96, 4, 28, '#5a3a20'); ellipse(a.x + 20 * (a.dx < 0 ? -1 : 1), y - 100, 7, 9, '#ffcf6a'); }
  ctx.restore();
}
function drawSceneWorld() {
  const s = scene, w = s.world, cw = canvas.width, ch = canvas.height;
  if (!w || !WORLD_MAPS[w.map]) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cw, ch); return; }
  const M = WORLD_MAPS[w.map], keep = worldOut;
  worldOut = { ...(keep || {}), map: w.map, x: w.x, y: w.y, dx: 0, dy: 1, walk: false, sceneCamera: true };
  try {
    const view = beginOutside(M), seen = (x, y, m = 300) => x > view.x - m && x < view.x + view.w + m && y > view.y - m && y < view.y + view.h + m, layers = [];
    M.draw(view, seen, layers);
    if (!M.indoor) worldLandscape(M, seen, layers, view);
    w.props?.(layers, seen);
    for (const f of w.fires) layers.push({ y: f.y, draw: () => sceneFire(f.x, f.y) });
    for (const [id, a] of Object.entries(s.actors)) layers.push({ y: a.y, draw: () => sceneActorDraw(id, a) });
    layers.sort((a, b) => a.y - b.y).forEach(l => l.draw());
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const a of Object.values(s.actors)) if (a.ghost) glow(a.x, a.y - 70, 180, .4 * (a.alpha ?? 1), '120,190,255'); ctx.restore();
    if (w.night) {
      rect(view.x, view.y, view.w, view.h, `rgba(10,16,44,${w.night === true ? .55 : w.night})`);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const f of w.fires) glow(f.x, f.y - 30, 230, .32 + .05 * Math.sin(frameClock * 9), '255,150,60');
      for (const a of Object.values(s.actors)) if (a.lamp) glow(a.x + 20 * (a.dx < 0 ? -1 : 1), a.y - 100, 150, .3, '255,200,110');
      for (const l of w.lights) glow(l.x, l.y, l.r || 160, l.a || .3, l.color || '255,200,110');
      for (const a of Object.values(s.actors)) if (a.ghost) glow(a.x, a.y - 70, 200, .45 * (a.alpha ?? 1), '120,190,255');
      ctx.restore();
    }
    drawFx(); drawSparks(w.map);
  } finally { worldOut = keep; }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
SCENE_VIEWS.world = drawSceneWorld;
{
  // A câmera da cena desliza até o alvo; os moradores que estão atuando somem do lugar de sempre.
  const tick = sceneTick;
  sceneTick = function (dt) {
    tick(dt); for (const e of sparks) e.life -= dt; sparks = sparks.filter(e => e.life > 0);
    const w = scene?.world; if (!w || w.tx == null) return;
    const d = Math.hypot(w.tx - w.x, w.ty - w.y), k = Math.min(d, (w.speed || 260) * dt);
    if (d < 1) { w.x = w.tx; w.y = w.ty; w.tx = null; return; } w.x += (w.tx - w.x) / d * k; w.y += (w.ty - w.y) / d * k;
  };
  const home = atHome; atHome = function (id) { if (scene?.view === 'world' && (scene.world?.hide?.includes(id) || scene.actors[id])) return false; return home(id); };
}
