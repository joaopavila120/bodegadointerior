// Chuva e raio no mundo aberto.
//   · Dia de chuva (o evento "chuva" do calendário): chove em todo mapa que tem céu (a vila, a Serra, Santa Catarina,
//     o campo, a mata, o pampa). Dentro de casa, na caverna e na cripta, não.
//   · Onde chove, cai raio de tempo em tempo: o mesmo raio da batalha final, com galho, clarão na tela, um tremor
//     curto e o trovão chegando depois. Na mata fechada (os trechos e a cerração da ilha) só se vê o clarão por entre
//     as copas.
//   · A ilha chove sempre, mas agora mais fraco; a chuva da batalha final também ficou mais leve.
'use strict';

const CHUVA = { raioT: 6, raios: [], marcas: [], flash: 0, view: null, antes: 0 };
const CHUVA_SEM_CEU = new Set(['caverna', 'masmorra']);
function chuvaTemCeu(id) { const M = WORLD_MAPS[id]; return !!M && !M.indoor && !CHUVA_SEM_CEU.has(id) && !String(id).startsWith('casa:'); }
function chuvaNaIlha(id) { return id === 'ilha' || id === 'ilhamato'; }
function chuvaBatalha() { return typeof batalhaN === 'function' && !!batalhaN(); }
// Quanto chove aqui agora (0 = nada). A ilha tem a chuva dela, desenhada em ilha-clima.js.
function chuvaForca() {
  if (!worldOut || chuvaNaIlha(worldOut.map) || chuvaBatalha() || G?.event?.id !== 'chuva' || !chuvaTemCeu(worldOut.map)) return 0;
  return worldOut.map === 'trecho' ? .35 : .55;
}
function chuvaMataFechada(id) { return id === 'trecho' || id === 'ilhamato'; }
function chuvaComRaio() {
  if (!worldOut || scene || chuvaBatalha()) return false;
  const id = worldOut.map;
  if (id === 'ilhamato' && typeof ILHA_TRECHOS === 'object' && ILHA_TRECHOS[ilhaMatoLayout().n]?.raio) return false; // a Toca da Mãe já tem o dela
  return chuvaNaIlha(id) || chuvaForca() > 0;
}

// ---------- O raio ----------
function chuvaRaio() {
  const v = CHUVA.view, p = worldOut; if (!v || !p) return;
  CHUVA.flash = Math.max(CHUVA.flash, .6);
  if (!chuvaMataFechada(p.map)) {
    let q = null;
    for (let k = 0; k < 16 && !q; k++) { const x = v.x + v.w * (.1 + Math.random() * .8), y = v.y + v.h * (.35 + Math.random() * .55); if (Math.hypot(x - p.x, y - p.y) > 320) q = { x, y }; }
    if (q) {
      const pts = [[q.x + (Math.random() - .5) * 260, q.y - 1500]];
      for (let k = 1; k <= 10; k++) { const f = k / 10; pts.push([pts[0][0] + (q.x - pts[0][0]) * f + (Math.random() - .5) * (k < 10 ? 90 : 0), pts[0][1] + (q.y - 70 - pts[0][1]) * f]); }
      const i = 4 + Math.floor(Math.random() * 3), galho = []; let [gx, gy] = pts[i];
      for (let k = 0; k < 4; k++) { gx += (Math.random() < .5 ? -1 : 1) * (30 + Math.random() * 40); gy += 70 + Math.random() * 40; galho.push([gx, gy]); }
      CHUVA.raios.push({ pts, galho: [pts[i], ...galho], t: .38, map: p.map }); CHUVA.marcas.push({ x: q.x, y: q.y, t: 2.4, map: p.map });
      if (typeof golpeTreme !== 'undefined') golpeTreme = Math.max(golpeTreme, .18);
      fxPuffs?.(q.x, q.y - 30, 10, 110, '#a8a090');
    }
  }
  const longe = chuvaMataFechada(p.map);
  setTimeout(() => { AudioEngine.bus = AudioEngine.ambientBus; AudioEngine.trovao?.(longe ? .035 : .05 + Math.random() * .02); AudioEngine.bus = null; }, (longe ? 700 : 200) + Math.random() * (longe ? 1400 : 500));
}
function chuvaTick(dt) {
  CHUVA.flash = Math.max(0, CHUVA.flash - dt * 2.4);
  for (const r of CHUVA.raios) r.t -= dt; CHUVA.raios = CHUVA.raios.filter(r => r.t > 0 && r.map === worldOut?.map);
  for (const m of CHUVA.marcas) m.t -= dt; CHUVA.marcas = CHUVA.marcas.filter(m => m.t > 0 && m.map === worldOut?.map);
  if (!chuvaComRaio()) { CHUVA.raioT = Math.max(CHUVA.raioT, 4); return; }
  if ((CHUVA.raioT -= dt) <= 0) { CHUVA.raioT = 10 + Math.random() * 16; chuvaRaio(); }
}
function drawChuvaRaios() {
  const v = CHUVA.view; if (!v || !worldOut || scene) return;
  const k = chuvaForca();
  if (k > 0) { rect(v.x, v.y, v.w, v.h, `rgba(22,34,52,${.16 * k})`); chuvaBase(v, k, 0); }
  for (const m of CHUVA.marcas) { const a = Math.min(1, m.t / 1.2); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(m.x, m.y - 10, 60, .35 * a, '255,200,140'); ctx.restore(); }
  for (const r of CHUVA.raios) batalhaRaioDesenho(r);
  if (CHUVA.flash > 0) rect(v.x, v.y, v.w, v.h, `rgba(220,230,255,${CHUVA.flash * (chuvaMataFechada(worldOut.map) ? .22 : .34)})`);
}

// ---------- Ligações ----------
// A chuva base é a da batalha final (gota de perto e de longe, respingo no chão). A da batalha ficou 30% mais leve, e a da
// ilha, que caía pesada o tempo todo, agora é uma garoa firme.
const chuvaBase = batalhaChuva;
batalhaChuva = function (view, k, dir) { return chuvaBase(view, k * .7, dir); };
ilhaChuva = function (view, leve) { chuvaBase(view, leve ? .28 : .4, 0); };
{
  const begin = beginOutside; beginOutside = function (M) { const view = begin(M); CHUVA.view = view; return view; };
  const sparks = drawSparks; drawSparks = function (map = null) { if (worldOut && map === worldOut.map) drawChuvaRaios(); sparks(map); };
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (!paused && !modal) chuvaTick(dt); };
  // O barulho da chuva onde ela cai (a ilha já tem o dela).
  const amb = AudioEngine.ambience; AudioEngine.ambience = function (dt) {
    amb.call(this, dt); const k = chuvaForca(); this.bus = this.ambientBus;
    this.loop('chuvaFora', k > 0 ? .026 * k / .55 : 0, { type: 'highpass', freq: 1800 });
    this.bus = null;
  };
}
