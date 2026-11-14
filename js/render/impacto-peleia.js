// O peso da peleia: efeito e som em cada momento da briga, em toda região (mata, gruta, ilha, pampa).
//   · Bicho armando o bote (windup, mira): um estalo curto de aviso e a poeira dos cascos quando ele arranca
//     (investida, bote, arrancada), com o vento do pulo.
//   · Golpe acertado no bicho (facão, tiro, arpão, poder): um anel de impacto abre no ponto da pancada.
//   · Bicho derrubado: um anel maior, a poeira assentando e um sopro pálido subindo (a alma indo embora), com
//     um suspiro de ar.
//   · Sadi apanhando: a beirada da tela pisca vermelha e a tela treme um tiquinho (a gruta já tremia; agora
//     a mata, a ilha e o pampa também).
// Nada aqui muda dano, alcance nem regra: é só o corpo da briga.
'use strict';

const PELEIA_FX = { list: [], dor: 0, view: null, somBote: 0, somAviso: 0, somAlma: 0 };
const PELEIA_ARRANCA = new Set(['lunge', 'charge', 'dash', 'investe', 'swarm', 'strike', 'bite', 'run']);
const PELEIA_ARMA = new Set(['windup', 'mira', 'aim', 'emergewarn', 'stalk']);

// ---------- Sons ----------
Object.assign(AudioEngine, {
  // O vento do pulo: um sopro grave e curto.
  boteVento(vol = .05) { this.noise(.14, vol, 700); this.note(110 + Math.random() * 40, .09, 'triangle', vol * .5); },
  // O estalo de aviso, antes do bote.
  avisoBote(vol = .028) { this.note(1700, .03, 'square', vol); this.note(1150, .05, 'square', vol * .6, .05); },
  // O sopro da alma indo embora.
  almaSopro(vol = .03) { this.note(620, .5, 'sine', vol * .7); this.note(430, .7, 'sine', vol * .5, .12); this.note(290, .9, 'sine', vol * .35, .28); this.noise(.5, vol * .4, 2400); }
});

// ---------- As partículas da briga ----------
function peleiaAdd(kind, x, y, o = {}) { if (PELEIA_FX.list.length < 70) PELEIA_FX.list.push({ kind, x, y, t: 0, life: .35, map: worldOut?.map, ...o }); }
function peleiaRing(x, y, grande = false) { peleiaAdd('ring', x, y, { life: grande ? .4 : .24, r0: grande ? 16 : 8, r1: grande ? 88 : 46, cor: grande ? '255,200,120' : '255,228,170' }); }
function peleiaPoeira(x, y, dx, n = 5) {
  for (let i = 0; i < n; i++) peleiaAdd('po', x + fxRand(-12, 12), y + fxRand(-4, 4), { life: fxRand(.3, .5), vx: -dx * fxRand(40, 130) + fxRand(-20, 20), vy: -fxRand(8, 40), size: fxRand(3, 6.5) });
}
function peleiaAlma(x, y, s = 1) { peleiaAdd('alma', x, y, { life: 1.1, s }); }
function peleiaTick(dt) {
  PELEIA_FX.dor = Math.max(0, PELEIA_FX.dor - dt * 1.6);
  for (const p of PELEIA_FX.list) { p.t += dt; if (p.kind === 'po') { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - 3.5 * dt; } }
  PELEIA_FX.list = PELEIA_FX.list.filter(p => p.t < p.life && p.map === worldOut?.map);
}
function drawPeleiaFx() {
  for (const p of PELEIA_FX.list) {
    const k = p.t / p.life;
    if (p.kind === 'ring') {
      const r = p.r0 + (p.r1 - p.r0) * (1 - (1 - k) * (1 - k));
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${p.cor},${.75 * (1 - k)})`; ctx.lineWidth = 3.5 * (1 - k) + 1;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, r, r * .62, 0, 0, Math.PI * 2); ctx.stroke();
      if (p.r1 > 60) { ctx.strokeStyle = `rgba(255,255,230,${.4 * (1 - k)})`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(p.x, p.y, r * .7, r * .44, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
    } else if (p.kind === 'po') {
      ellipse(p.x, p.y, p.size * (1 + k * .7), p.size * .6 * (1 + k * .7), `rgba(168,150,120,${.4 * (1 - k)})`);
    } else if (p.kind === 'alma') {
      const y = p.y - k * 85 * p.s, sway = Math.sin(p.t * 7) * 5;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .4 * (1 - k) * Math.min(1, k * 6);
      ellipse(p.x + sway, y, 9 * p.s, 13 * p.s, '#dfe8f2'); ellipse(p.x + sway, y + 9 * p.s, 5 * p.s, 8 * p.s, '#b9c8da');
      ctx.restore();
    }
  }
  // A beirada vermelha de quem apanhou.
  const v = PELEIA_FX.view;
  if (v && PELEIA_FX.dor > 0 && !scene) {
    const a = Math.min(.4, PELEIA_FX.dor), cx = v.x + v.w / 2, cy = v.y + v.h / 2, r = Math.hypot(v.w, v.h) / 2;
    const g = ctx.createRadialGradient(cx, cy, r * .55, cx, cy, r); g.addColorStop(0, 'rgba(160,20,10,0)'); g.addColorStop(1, `rgba(160,20,10,${a})`);
    ctx.fillStyle = g; ctx.fillRect(v.x, v.y, v.w, v.h);
  }
}

// ---------- Os olhos na briga: golpes acertados e botes armados ----------
function peleiaBicho(b, p) {
  // Golpe que acabou de pegar: o anel de impacto.
  if (b.hurt > .12 && (b._fxh ?? 0) <= .03 && b.hp > 0) peleiaRing(b.x, b.y - (b.boss || b.lenda ? 90 : 42));
  b._fxh = b.hurt || 0;
  // O bote: aviso ao armar, poeira e vento ao arrancar.
  const st = b.state;
  if (st !== b._fxs) {
    const d = p ? Math.hypot(b.x - p.x, b.y - p.y) : 1e9;
    if (PELEIA_ARMA.has(st) && d < 760 && frameClock - PELEIA_FX.somAviso > .5) { PELEIA_FX.somAviso = frameClock; AudioEngine.avisoBote?.(); }
    if (PELEIA_ARRANCA.has(st) && d < 900) {
      peleiaPoeira(b.x, b.y + 2, b.dx || 1, b.boss || b.lenda ? 8 : 5);
      if (frameClock - PELEIA_FX.somBote > .35) { PELEIA_FX.somBote = frameClock; AudioEngine.boteVento?.(b.boss || b.lenda ? .07 : .045); }
    }
    b._fxs = st;
  }
}
function peleiaVarre() {
  const p = worldOut; if (!p || scene) return;
  const cave = typeof inCave === 'function' && inCave();
  const list = cave ? caveFloorRun()?.beasts : mataNight?.beasts; if (!list) return;
  for (const b of list) if (b.hp > 0) peleiaBicho(b, p);
}

// ---------- Ligações ----------
{
  // Apanhou de verdade (a vida baixou): a beirada vermelha e o tremor.
  const dor = (hpAntes) => { if (caveState().hp < hpAntes) { PELEIA_FX.dor = .5; golpeTreme = Math.max(golpeTreme, .1); } };
  const mh = mataHurt; mataHurt = function (dmg, from) { const hp = caveState().hp, r = mh(dmg, from); dor(hp); return r; };
  const ch = caveHurt; caveHurt = function (dmg, from) { const hp = caveState().hp, r = ch(dmg, from); dor(hp); return r; };
  // Bicho caiu: o anel grande, a poeira e a alma (os miúdos, como a mariposa, caem sem cerimônia).
  const caiu = b => {
    const grande = b.boss || b.lenda || (CAVE_BEASTS[b.kind]?.r || 30) >= 24;
    peleiaRing(b.x, b.y - 30, grande); peleiaPoeira(b.x, b.y, 0, grande ? 7 : 4);
    if (grande) { peleiaAlma(b.x, b.y - 60, b.boss || b.lenda ? 1.5 : 1); if (frameClock - PELEIA_FX.somAlma > .6) { PELEIA_FX.somAlma = frameClock; AudioEngine.almaSopro?.(); } }
  };
  const mk = mataKill; mataKill = function (b) { mk(b); try { caiu(b); } catch (e) { } };
  const ck = caveKill; caveKill = function (b) { ck(b); try { caiu(b); } catch (e) { } };
  const begin = beginOutside; beginOutside = function (M) { const view = begin(M); PELEIA_FX.view = view; return view; };
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (!paused && !modal) { peleiaTick(dt); peleiaVarre(); } };
  const sparks = drawSparks; drawSparks = function (map = null) { if (worldOut && map === worldOut.map) drawPeleiaFx(); sparks(map); };
}
