// O combo de lâmina, com qualquer arma de corte, na caverna, na mata e na ilha:
//   · F: o talho, de cima pra baixo.
//   · F, F bem ligeiro: o revés, que volta de baixo pra cima e pega mais forte.
//   · F, F, F (com a melhoria "Golpe de giro"): o Sadi dá a volta inteira com a lâmina, acerta tudo em volta com o dobro
//     do dano, empurra os bichos e treme o chão.
// O último golpe da sequência deixa uma recuperação maior, então o combo rende mais só pra quem emenda no ritmo. Os
// primeiros empurram pouco, senão o bicho sai do alcance antes do golpe seguinte.
// Aperto um pouco antes de a lâmina voltar não se perde: fica na fila e sai assim que dá.
'use strict';
const GOLPES = { 1: { T: .2, dano: 1, empurrao: 14 }, 2: { T: .22, dano: 1.3, empurrao: 40 }, 3: { T: .36, dano: 2, empurrao: 60, alcance: 1.25, arco: 4, empurra: 120 } };
const GOLPE = { janela: .45, elo: .16, fila: .25, recuo: 1.6, recuoGiro: 2, treme: .22 };
CAVE_UPGRADES.push({ id: 'giro', name: 'Golpe de giro', icon: '🌀', cost: 260, desc: 'F, F, F bem ligeiro: depois do talho e do revés, um terceiro golpe. O Sadi gira com a lâmina e acerta tudo em volta, com o dobro do dano.' });
const GIRO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M50 15A25 25 0 1 1 15 13" fill="none" stroke="#8a93a0" stroke-width="7" stroke-linecap="round"/><path d="M50 15A25 25 0 1 1 15 13" fill="none" stroke="#e8edf2" stroke-width="3" stroke-linecap="round"/><path d="M15 3 L27 13 L11 22 Z" fill="#e8edf2" stroke="#3a3a42" stroke-width="2" stroke-linejoin="round"/><path d="M24 42 L42 24" stroke="#c8ccd4" stroke-width="6" stroke-linecap="round"/><path d="M20 46 L27 39" stroke="#6a4426" stroke-width="7" stroke-linecap="round"/></svg>';
let golpeTreme = 0;
function golpeMaximo() { return caveUp('giro') ? 3 : 2; }
// O golpe da vez: emenda se veio dentro da janela (dois apertos no mesmo instante não são combo).
function golpeProximo(r) { const dt = frameClock - (r.golpeEm ?? -9); return r.golpeN && r.golpeN < golpeMaximo() && dt > .06 && dt <= GOLPE.janela ? r.golpeN + 1 : 1; }
function golpeCom(g, fn) {
  const dmg = caveDmg, reach = caveReach, arco = mataArco, push = caveEmpurrao;
  caveEmpurrao = function () { return g.empurrao; };
  if (g.dano !== 1) caveDmg = function () { return Math.max(1, Math.round(dmg() * g.dano)); };
  if (g.alcance) caveReach = function () { return reach() * g.alcance; };
  if (g.arco) mataArco = function () { return g.arco; };
  try { return fn(); } finally { caveDmg = dmg; caveReach = reach; mataArco = arco; caveEmpurrao = push; }
}
// O giro joga pra longe quem ele pegou (chefe e lenda não saem do lugar) e o chão treme.
function golpeImpacto(r, antes, g, cave) {
  const p = worldOut; let pegou = false;
  for (const [b, hp] of antes) {
    if (b.hp >= hp) continue; pegou = true; if (b.hp <= 0 || b.boss || b.lenda || b.kind === 'diabo') continue;
    const d = Math.hypot(b.x - p.x, b.y - p.y) || 1, vx = (b.x - p.x) / d * g.empurra, vy = (b.y - p.y) / d * g.empurra;
    if (cave) caveMove(b, vx, vy); else { mataStep(b, vx, vy, 1); b.stun = Math.max(b.stun || 0, .35); }
  }
  if (pegou) { golpeTreme = GOLPE.treme; if (cave) r.freeze = .1; }
}
function golpeTick(dt) {
  golpeTreme = Math.max(0, golpeTreme - dt);
  const cave = inCave(), r = cave ? caveFloorRun() : mataNight; if (!r?.fila || r.cd > 0 || paused || modal || scene) return;
  const vale = frameClock - r.fila < GOLPE.fila; r.fila = 0; if (vale) { if (cave) caveAttack(); else mataAttack(); }
}
function griggsGiro() {
  const u = CAVE_UPGRADES.find(x => x.id === 'giro'); if (caveUp('giro') || !hasCash(u.cost)) return;
  spendCash(u.cost); caveState().up.giro = true; AudioEngine.coins?.(); save(); refreshHUD(); worldSay('Na abordagem, quem fica de costas morre. O Griggs ensina a girar com a lâmina na mão: F, F, F bem ligeiro.'); griggsShop();
}
function griggsGolpeHTML() {
  const u = CAVE_UPGRADES.find(x => x.id === 'giro'), own = caveUp('giro'), ok = !own && hasCash(u.cost);
  return `<h3 class="forja-sec">⚔️ Golpe <small>o terceiro do combo</small></h3><div class="store-list">${forjaCard(forgeUpgradeIcon('giro'), u.name, u.desc, own ? '' : reqChips({}, u.cost), `<button class="primary" data-act="griggsGiro" ${ok ? '' : 'disabled'}>${own ? '✔ Já é teu' : ok ? 'Aprender' : 'Falta dinheiro'}</button>`, own ? 'owned' : '')}</div>`;
}
{
  for (const kind of ['cave', 'mata']) {
    const cave = kind === 'cave', attack = cave ? caveAttack : mataAttack;
    const combo = function () {
      const r = cave ? (inCave() ? caveFloorRun() : null) : mataNight; if (!r) return attack();
      if (r.cd > 0) { if (r.cd < GOLPE.fila) r.fila = frameClock; return; }
      const old = r.swing, n = golpeProximo(r), g = GOLPES[n], antes = g.empurra ? new Map(r.beasts.filter(b => b.hp > 0).map(b => [b, b.hp])) : null;
      const result = golpeCom(g, attack), s = r.swing; if (!s || s === old) return result;
      // Golpe de verdade: o que vem depois dele depende de ainda ter o que emendar.
      const fim = n >= golpeMaximo();
      s.n = n; s.t = s.T = g.T; r.golpeN = n; r.golpeEm = frameClock; r.fila = 0;
      r.cd = fim ? caveCd() * (n === 3 ? GOLPE.recuoGiro : GOLPE.recuo) : Math.min(r.cd, GOLPE.elo);
      if (n === 3) { AudioEngine.swoosh?.(.1); golpeImpacto(r, antes, g, cave); }
      if (!G.dicaGolpes) { G.dicaGolpes = G.day; floatNote('⚔️ F, F bem ligeiro: dois golpes em sequência, e o segundo pega mais forte.'); }
      return result;
    };
    if (cave) caveAttack = combo; else mataAttack = combo;
  }
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); golpeTick(dt); };
  const begin = beginOutside; beginOutside = function (M) { const view = begin(M); if (golpeTreme > 0) { const k = golpeTreme / GOLPE.treme * 7; ctx.translate((Math.random() - .5) * k, (Math.random() - .5) * k); } return view; };
  const icon = forgeUpgradeIcon; forgeUpgradeIcon = function (id) { return id === 'giro' ? `<span class="upgrade-icon"><img src="${'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(GIRO_SVG)}" alt="" draggable="false"></span>` : icon(id); };
  const act = action; action = function (name, id) { if (name === 'griggsGiro') { griggsGiro(); return; } return act(name, id); };
}
