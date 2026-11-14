// O mundo respirando, sem mudar colisão, rota nem regra:
//   · Fumaça de chaminé nas casas da Fronteira, da Serra e de Santa Catarina (e sempre na bodega).
//   · Fim de tarde dourado: entre o meio da tarde e a noite, uma luz quente desce sobre a vila, a Serra, SC e o campo.
//   · De dia, pólen e sementes boiando na luz; na mata e nos trechos, grimpa caindo das araucárias devagarinho.
//   · De tempo em tempo, dois ou três passarinhos cruzam o céu da vila (como as avoantes do pampa).
//   · Dentro da bodega, poeirinha dançando na luz do dia.
//   · O que é interativo convida: um pulso de luz no chão embaixo da estação mais perto (na bodega) e do ponto
//     de interação mais perto (no mundo aberto).
//   · Sons do dia: passarinhos na vila, na Serra e em SC; cigarra no calor do meio-dia do campo.
'use strict';

const VIDA = { chamines: new Map() };
const VIDA_MAPAS = new Set(['vila', 'serra', 'sc']);

// ---------- Fumaça de chaminé ----------
function vidaChamines(id) {
  if (VIDA.chamines.has(id)) return VIDA.chamines.get(id);
  const list = (typeof worldDressingBuildings === 'function' ? worldDressingBuildings(id) : [])
    .filter(b => b && b.w >= 170).slice(0, 12)
    .map(b => ({ x: b.x + b.w * .64, y: b.y + b.h * .34, ph: (b.x * 7 + b.y) % 10 }));
  if (id === 'vila' && typeof VILA === 'object' && VILA.bodega) list.unshift({ x: VILA.bodega.x + VILA.bodega.w * .11, y: VILA.bodega.y + VILA.bodega.h * .34, ph: 1 });
  VIDA.chamines.set(id, list); return list;
}
function drawVidaFumaca(c) {
  const t = frameClock;
  for (let k = 0; k < 5; k++) {
    const f = ((t * .12 + k * .21 + c.ph * .1) % 1), a = .38 * (1 - f) * Math.min(1, f * 8);
    if (a <= .01) continue;
    const px = c.x + Math.sin(t * .7 + k * 2 + c.ph) * (3 + f * 8) + f * 26, py = c.y - 8 - f * 100, r = 7 + f * 21;
    ellipse(px, py, r, r * .8, `rgba(226,221,210,${a})`);
    ellipse(px - r * .3, py - r * .25, r * .45, r * .36, `rgba(244,240,232,${a * .7})`);
  }
}

// ---------- O fim de tarde dourado ----------
function vidaEntardecer() {
  if (G.phase !== 'open' && G.phase !== 'closing') return 0;
  const p = G.elapsed / DAY;
  return clamp((p - .5) / .1, 0, 1) * clamp((.8 - p) / .1, 0, 1);
}

// ---------- Pólen, grimpa e passarinhos ----------
function drawVidaPolen(view) {
  const t = frameClock; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 12; i++) {
    const px = view.x + ((i * 317.3 + t * (14 + i % 4 * 7)) % view.w), py = view.y + ((i * 211.7 + Math.sin(t * .6 + i) * 30) % view.h + view.h) % view.h;
    ctx.globalAlpha = .3 + .2 * Math.sin(t * 1.4 + i * 2.2); ellipse(px, py, 1.9, 1.9, '#fff6d8');
  }
  ctx.restore();
}
function drawVidaGrimpa(view) {
  const t = frameClock; ctx.save(); ctx.strokeStyle = 'rgba(104,82,48,.6)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const f = ((t * (.05 + i % 3 * .02) + i * .37) % 1), px = view.x + (i * 419.1) % view.w + Math.sin(t * .9 + i) * 26, py = view.y + f * view.h, a = i + t * (1.2 + i % 3 * .4);
    ctx.globalAlpha = .7 * Math.min(1, f * 6) * Math.min(1, (1 - f) * 6);
    ctx.beginPath(); ctx.moveTo(px - Math.cos(a) * 5, py - Math.sin(a) * 5); ctx.lineTo(px + Math.cos(a) * 5, py + Math.sin(a) * 5); ctx.stroke();
  }
  ctx.restore();
}
function drawVidaPassaros(view) {
  if (typeof belezaPassaro !== 'function') return;
  const ciclo = (frameClock + 11) % 37; if (ciclo >= 9) return;
  const k = ciclo / 9, bx = view.x - 100 + (view.w + 200) * k, by = view.y + view.h * .14 + Math.sin(k * 6) * 26;
  for (let i = 0; i < 3; i++) belezaPassaro(bx - i * 30, by + i * 11, i + 2);
}

// ---------- O convite do interativo ----------
function drawVidaPulso(x, y, rx = 26) {
  const f = (frameClock * 1.1) % 1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = .34 * (1 - f); ctx.strokeStyle = '#ffd96a'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.ellipse(x, y, rx * (.5 + f * .8), rx * .4 * (.5 + f * .8), 0, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = .15 + .07 * Math.sin(frameClock * 3); ellipse(x, y, rx * .55, rx * .22, '#ffdf91');
  ctx.restore();
}

// ---------- Dentro da bodega: poeirinha na luz e o balcão convidando ----------
function drawVidaBodega() {
  if (!started || scene || G.penalties || G.bocce || G.lasso) return;
  if (G.phase !== 'closed') {
    const t = frameClock; ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const px = 560 + ((i * 173.3 + t * (5 + i % 3 * 3)) % 900), py = 180 + ((i * 97.1 + Math.sin(t * .5 + i) * 22) % 260 + 260) % 260;
      ctx.globalAlpha = .05 + .04 * Math.sin(t * 1.1 + i * 1.7); ellipse(px, py, 1.4, 1.4, '#fff2ce');
    }
    ctx.restore();
  }
  if (!modal && !phoneOpen && !G.task && G.fightTarget === null) {
    const n = nearest(); if (n?.obj && n.obj.w) drawVidaPulso(n.obj.x + n.obj.w / 2, n.obj.y + n.obj.h + 7, Math.min(40, n.obj.w * .45));
  }
}

// ---------- Sons do dia ----------
Object.assign(AudioEngine, {
  passarinho(vol = .016) {
    const base = 2500 + Math.random() * 900, n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) this.note(base + (i % 2) * 320 + Math.random() * 120, .055, 'sine', vol * (1 - i * .1), i * (.1 + Math.random() * .05));
  },
  cigarra(vol = .012) { for (let i = 0; i < 9; i++) this.noise(.05, vol * (.5 + (i % 3) * .25), 5200 + Math.random() * 600); }
});

// ---------- Ligações ----------
{
  for (const id of ['vila', 'serra', 'sc', 'campo']) {
    const M = WORLD_MAPS[id]; if (!M) continue; const draw = M.draw;
    M.draw = function (view, seen, layers) {
      draw.call(this, view, seen, layers);
      if (scene) return;
      const chuva = typeof chuvaForca === 'function' ? chuvaForca() : 0, leve = typeof lightGraphics !== 'undefined' && lightGraphics;
      if (VIDA_MAPAS.has(id)) for (const c of vidaChamines(id)) if (seen(c.x, c.y, 160)) layers.push({ y: 8.03e9, draw: () => drawVidaFumaca(c) });
      layers.push({ y: 8.04e9, draw: () => {
        const dourado = vidaEntardecer();
        if (dourado > 0) { const g = ctx.createLinearGradient(0, view.y, 0, view.y + view.h); g.addColorStop(0, `rgba(255,140,45,${.16 * dourado})`); g.addColorStop(.55, `rgba(255,160,70,${.09 * dourado})`); g.addColorStop(1, `rgba(200,90,110,${.05 * dourado})`); ctx.fillStyle = g; ctx.fillRect(view.x, view.y, view.w, view.h); }
        if (!leve && !chuva && !worldNight()) { drawVidaPolen(view); if (VIDA_MAPAS.has(id)) drawVidaPassaros(view); }
      } });
    };
  }
  for (const id of ['mata', 'trecho']) {
    const M = WORLD_MAPS[id]; if (!M) continue; const draw = M.draw;
    M.draw = function (view, seen, layers) {
      draw.call(this, view, seen, layers);
      if (!scene && !(typeof lightGraphics !== 'undefined' && lightGraphics)) layers.push({ y: 8.04e9, draw: () => drawVidaGrimpa(view) });
    };
  }
  // O pulso no ponto interativo mais perto do mundo aberto (por baixo do rótulo com o E).
  const sparks = drawSparks; drawSparks = function (map = null) {
    if (worldOut && map === worldOut.map && !scene && !modal && modal !== 'talk') { const s = worldNearest?.(); if (s && !s.info) drawVidaPulso(s.x, s.y + 8); }
    if (!worldOut && map === null) drawVidaBodega();
    sparks(map);
  };
  // Pegar um produto dá um brilho na bandeja.
  const put = putHeld; putHeld = function (item, source = null) { const ok = put(item, source); if (ok && !worldOut && started) fxStars(G.player.x, G.player.y - 70, 2); return ok; };
  // Os passarinhos e a cigarra, no canal do ambiente.
  const amb = AudioEngine.ambience; AudioEngine.ambience = function (dt) {
    amb.call(this, dt);
    if (!worldOut || scene || worldNight() || (typeof chuvaForca === 'function' && chuvaForca() > 0)) return;
    const id = worldOut.map; this.bus = this.ambientBus;
    if (VIDA_MAPAS.has(id) && sombrioDue('vidaPassaro', dt, 7, 17)) this.passarinho();
    if (id === 'campo' && G.phase === 'open' && G.elapsed / DAY > .3 && G.elapsed / DAY < .6 && sombrioDue('vidaCigarra', dt, 14, 30)) this.cigarra();
    this.bus = null;
  };
}
