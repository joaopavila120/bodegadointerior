// O dash é do Sadi desde o começo (caverna.js: caveUp('dash') é sempre verdade) e vale também dentro da bodega:
// Shift dá uma arrancada curta pra onde ele anda, pra cruzar o salão com pressa. Não atravessa móvel nem parede, não
// funciona com a mão no meio de uma tarefa (balança, chapa, chimarrão) e tem a mesma recarga do dash de fora.
// No tutorial, uma etapa ensina o dash logo depois do chimarrão.
'use strict';

const BODEGA_DASH = { duration: .2, speed: 820, cooldown: 1 };
let bodegaDash = null, bodegaDashCd = 0, bodegaDashTrail = [];
function bodegaDashLivre() {
  return !worldOut && started && !paused && !modal && !scene && !phoneOpen && !G.task && !G.game && !G.bocce && !G.penalties && !G.lasso && !G.atCancha && G.fightTarget === null && !G.dialogue;
}
function bodegaDashStart() {
  if (!bodegaDashLivre() || bodegaDash || bodegaDashCd > 0) return false;
  const p = G.player;
  let dx = Number(keys.has('d') || keys.has('ArrowRight')) - Number(keys.has('a') || keys.has('ArrowLeft'));
  let dy = Number(keys.has('s') || keys.has('ArrowDown')) - Number(keys.has('w') || keys.has('ArrowUp'));
  if (!dx && !dy) { dx = p.dx || 0; dy = p.dy || 0; } if (!dx && !dy) dy = 1;
  const len = Math.hypot(dx, dy); dx /= len; dy /= len;
  bodegaDash = { t: BODEGA_DASH.duration, dx, dy }; bodegaDashCd = BODEGA_DASH.cooldown; p.dx = dx; p.dy = dy;
  AudioEngine.swoosh?.(.06);
  if (G.tutorial && tutorialActive() && tutorialStep()?.id === 'dash') G.tutorial.dashed = true;
  return true;
}
function bodegaDashTick(dt) {
  bodegaDashTrail = bodegaDashTrail.filter(t => (t.life -= dt) > 0); bodegaDashCd = Math.max(0, bodegaDashCd - dt);
  const d = bodegaDash; if (!d) return;
  if (worldOut || !bodegaDashLivre()) { bodegaDash = null; return; }
  const time = Math.min(Math.max(0, d.t), dt); d.t -= dt; if (d.t <= 0) bodegaDash = null; if (time <= 0) return;
  const p = G.player, step = BODEGA_DASH.speed * time;
  bodegaDashTrail.push({ x: p.x, y: p.y, life: .2, dx: d.dx, dy: d.dy });
  for (let n = 0; n < 6; n++) { const x = p.x + d.dx * step / 6, y = p.y + d.dy * step / 6; if (canWalk(x, p.y)) p.x = x; if (canWalk(p.x, y)) p.y = y; }
  p.walk = true;
}
// Os vultos azulados pra trás e os riscos de vento, como no dash de fora.
function drawBodegaDash() {
  if (worldOut || (!bodegaDash && !bodegaDashTrail.length)) return;
  ctx.save();
  for (const t of bodegaDashTrail) { ctx.globalAlpha = t.life / .2 * .4; ellipse(t.x, t.y - 34, 15, 34, '#a9eaff'); ellipse(t.x, t.y - 4, 18, 6, '#a9eaff'); }
  ctx.restore();
  if (bodegaDash && typeof drawDashRiscos === 'function') drawDashRiscos(G.player.x, G.player.y, bodegaDash.dx, bodegaDash.dy);
}

// ---------- A etapa do tutorial ----------
{
  const i = TUTORIAL_STEPS.findIndex(s => s.id === 'clean');
  TUTORIAL_STEPS.splice(i < 0 ? TUTORIAL_STEPS.length : i, 0, { id: 'dash', title: 'O passo ligeiro', text: 'Ande e aperte <span class="keycap">Shift</span> (no celular, o botão <b>Dash</b>): o Sadi dá uma arrancada. Serve pra cruzar o salão com pressa e, no mato, pra desviar do bote dos bichos sem levar pancada.' });
  const tick = tutorialTick; tutorialTick = function () {
    const t = G.tutorial, s = tutorialActive() && G.phase === 'open' ? tutorialStep() : null;
    if (s?.id === 'dash' && !t.introduced) t.dashed = false;
    tick();
    if (s?.id === 'dash' && t.introduced && t.dashed && tutorialStep()?.id === 'dash') tutorialAdvance();
  };
}

// ---------- Ligações ----------
{
  const sim = simulate; simulate = function (dt, background = false) { sim(dt, background); if (!started || paused || modal || document.hidden && !background) return; bodegaDashTick(dt); };
  const sparks = drawSparks; drawSparks = function (map = null) { if (map === null && !worldOut) drawBodegaDash(); sparks(map); };
  document.addEventListener('keydown', e => {
    if (e.key !== 'Shift' || e.repeat || worldOut || ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    if (bodegaDashStart()) e.preventDefault();
  });
  const act = action; action = function (name, id) { if (name === 'dash') { if (worldOut) caveDash(); else bodegaDashStart(); return; } return act(name, id); };
  // O botão Dash na cruzeta do celular (vale dentro e fora da bodega).
  document.addEventListener('DOMContentLoaded', () => { document.querySelector('.touch')?.insertAdjacentHTML('beforeend', '<button type="button" class="touch-dash" data-act="dash" aria-label="Dash">Dash</button>'); });
}
