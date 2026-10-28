// O fim da descida: a Barra de Laguna. Depois do trecho 19, a restinga abre numa praia de areia branca; à direita, a barra
// da lagoa e as luzes de Laguna. Lá fora, parado no mar, o fantasma do navio imperial. Também é sempre noite aqui.
//   · Chegando: a cena com o Garibaldi e a Anita ao lado do lanchão Seival, em cima da carreta de oito rodas. Eles contam
//     a travessia por terra de 1839 e a batalha de 15 de novembro, quando a esquadra do capitão Frederico Mariath retomou
//     a barra. Os bois puxam a carreta até a beira, e o Garibaldi ergue o barco nos braços e põe na água.
//   · Embarcando no Seival, o Sadi aborda o navio: a luta é no convés, contra o fantasma do capitão Mariath (estocada,
//     cutilada, "Fogo!" dos canhões varrendo faixas do convés, marinheiros que sobem pela escotilha e, brabo, o convés
//     pegando fogo). Os heróis vêm junto: o Lanceiro Negro peleia no convés contra os marinheiros, a Anita dispara o
//     canhãozinho do Seival e o Bento Gonçalves, no barco com o Garibaldi, dá ânimo de tempos em tempos.
//   · Vencido, o capitão baixa a bandeira e o navio some na neblina; na praia, a última prosa com o Garibaldi e a Anita.
'use strict';

const LAGUNA = { W: 3000, H: 1800, entryY: 820, shoreY: 1250, barraX: 2500, fogo: { x: 620, y: 930 }, marco: { x: 450, y: 960 }, carreta: { x: 930, y: 850 }, boat: { x: 1360, y: 1300 }, ghost: { x: 1150, y: 1010 }, anita: { x: 1250, y: 1040 }, ship: { x: 1980, y: 1500 } };
CAVE_BEASTS.mariath = { name: 'Capitão Mariath', hp: 1500, speed: 170, dmg: 20, r: 32, cash: [80, 120], from: 999, weight: 0 };
CAVE_BEASTS.marinheiro = { name: 'Marinheiro imperial', hp: 40, speed: 150, dmg: 10, r: 26, cash: [3, 6], from: 999, weight: 0 };
PEOPLE.push({ id: 'mariath', name: 'Capitão Frederico Mariath', worldOnly: true, unique: true, origin: 'Alma do comandante da esquadra imperial', sprite: (PEOPLE.find(p => p.id === 'jayme') || PEOPLE[0]).sprite });
function lagunaState() { const st = mataState(); return st.laguna ??= {}; }
function lagunaShoreY(x) { return LAGUNA.shoreY + Math.sin(x / 260) * 22 + Math.sin(x / 90) * 6; }
function inNavio() { return worldOut?.map === 'navio'; }

// ---------- A praia ----------
let lagunaProps = null;
function lagunaFlora() {
  if (lagunaProps) return lagunaProps;
  const R = caveRand(1839), trees = [], grass = [], rocks = [];
  for (let x = 120; x < LAGUNA.barraX - 80; x += 150 + R() * 120) { const y = 560 + R() * 90; if (Math.abs(x - 90) < 160 && Math.abs(y - LAGUNA.entryY) < 200) continue; trees.push({ x, y, w: Math.round((200 + R() * 70) / 16) * 16, art: R() < .7 ? 'butia' : 'jeriva' }); }
  for (let k = 0; k < 120; k++) { const x = R() * LAGUNA.barraX, y = 380 + R() * 330; if (Math.abs(y - LAGUNA.entryY) < 70 && x < 300) continue; grass.push({ x, y, w: Math.round((60 + R() * 40) / 8) * 8 }); }
  for (let k = 0; k < 18; k++) { const y = 700 + R() * 520; grass.push({ x: R() * (LAGUNA.barraX - 100), y: Math.min(y, lagunaShoreY(0) - 200), w: 48, low: true }); }
  for (let k = 0; k < 7; k++) rocks.push({ x: LAGUNA.barraX - 40 - R() * 30, y: 760 + k * 70, w: 110 });
  return lagunaProps = { trees, grass, rocks };
}
function lagunaSolid(x, y) {
  const F = lagunaFlora(), st = lagunaState();
  if (F.trees.some(t => Math.hypot(t.x - x, (t.y - y) * 1.2) < 24)) return true;
  if (Math.hypot(x - LAGUNA.fogo.x, (y - LAGUNA.fogo.y) * 1.6) < 46) return true;
  if (!st.carregado && Math.abs(x - LAGUNA.carreta.x) < 230 && y > LAGUNA.carreta.y - 50 && y < LAGUNA.carreta.y + 24) return true;
  return false;
}
WORLD_MAPS.laguna = {
  id: 'laguna', name: 'Barra de Laguna', W: LAGUNA.W, H: LAGUNA.H,
  spawn() { return { x: 90, y: LAGUNA.entryY }; },
  canWalk(x, y) {
    if (x < -30 || x > LAGUNA.barraX - 30 || y < 690 || y > lagunaShoreY(x) - 22) return false;
    if (x < 40 && Math.abs(y - LAGUNA.entryY) > 60) return false;
    return !lagunaSolid(x, y);
  },
  edge(p) { if (p.x < 10) return { map: 'trecho', trecho: TRECHO.last, x: TRECHO.W - 70, y: trechoExitY(TRECHO.last), title: 'Trecho ' + TRECHO.last, text: 'De volta pra restinga.' }; return null; },
  spots() {
    const st = lagunaState(), list = [
      { id: 'laguna:placa', x: 380, y: 760, label: 'Placa da Barra de Laguna', info: true, text: 'Laguna, em Santa Catarina: em julho de 1839 os farrapos, com Garibaldi e Davi Canabarro, tomaram a cidade e proclamaram a República Juliana, irmã da República Rio-Grandense. Em 15 de novembro de 1839, a esquadra imperial de Frederico Mariath forçou a barra e retomou Laguna.' },
      { id: 'laguna:fogo', x: LAGUNA.fogo.x, y: LAGUNA.fogo.y + 40, radius: 100, label: 'Descansar no fogo da praia', act: () => { caveState().hp = caveMaxHp(); mataBuffs.veneno = 0; AudioEngine.ready?.(); save(); worldSay('Fogo na areia, o barulho do mar. A vida voltou inteira.'); } },
      // Vencido o navio, o marco das trilhas (como o do refúgio) leva de volta pro começo da mata ou pros acampamentos.
      st.won ? { id: 'laguna:marco', x: LAGUNA.marco.x, y: LAGUNA.marco.y + 30, radius: 90, label: 'Marco das trilhas · voltar pro refúgio ou pros acampamentos', act: mataCampsDialog }
        : { id: 'laguna:volta', x: LAGUNA.fogo.x - 150, y: LAGUNA.fogo.y + 20, radius: 90, label: 'Voltar pro refúgio do Garibaldi', act: () => mataGoRancho() },
      { id: 'laguna:garibaldi', x: LAGUNA.ghost.x, y: LAGUNA.ghost.y, radius: 110, label: 'Prosear com o Garibaldi', act: lagunaGaribaldiTalk },
      { id: 'laguna:anita', x: LAGUNA.anita.x, y: LAGUNA.anita.y, radius: 100, label: 'Prosear com a Anita', act: () => campFolkTalk(CAMP_FOLKS[19]) }
    ];
    if (st.carregado && !st.won) list.push({ id: 'laguna:seival', x: LAGUNA.boat.x - 80, y: lagunaShoreY(LAGUNA.boat.x) - 40, radius: 130, label: 'Embarcar no Seival · abordar o navio imperial', act: navioBoard });
    return list;
  },
  draw(view, seen, layers) { drawLaguna(view, seen, layers); },
  onEnter() { lagunaEnter(); }
};
REGION_NAMES.laguna = 'Barra de Laguna';
function lagunaEnter() {
  const st = lagunaState(); mataNight = null;
  if (st.n2 !== true) { st.n2 = true; if (mataState().deepest <= TRECHO.last) mataState().deepest = TRECHO.last + 1; mataXP(40); save(); }
}
// A cena da carreta começa assim que der (sem conversa aberta), e só uma vez.
{ const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (worldOut?.map === 'laguna' && !lagunaState().carregado && !scene && !modal && !worldTalkOpen() && !paused) lagunaArrival(); }; }
// Antes da carreta: o Garibaldi chama; depois, causos do fim da guerra.
function lagunaGaribaldiTalk() {
  const st = lagunaState(); if (!st.carregado) { lagunaArrival(); return; }
  caveState().hp = caveMaxHp(); save();
  if (!st.won) { talk([['garibaldi', 'O Seival tá na água, gaúcho. Quando quiser, embarca: a Anita vai no canhãozinho, o Bento e eu no leme, e o Lanceiro sobe contigo no convés.'], ['garibaldi', 'Lá no convés, cuidado quando o capitão gritar “Fogo!”: os canhões varrem o navio de lado a lado. Sai da faixa.']], null, 'Bora'); return; }
  talk(pick([
    [['garibaldi', 'Depois de Laguna, a gente lutou mais uns anos aqui no Sul. Em 1841 fui pro Uruguai, com a Anita e o Menotti.']],
    [['garibaldi', 'Anos depois, os voluntários de camisa vermelha lutaram comigo em outras guerras. Mas foi aqui que eu aprendi a pelear a cavalo.']],
    [['garibaldi', 'A Paz de Ponche Verde, em 1845, foi assinada pelo Canabarro e pelo Caxias. Acabou a guerra sem vencedor nem vencido.']],
    [['garibaldi', 'Quase duzentos anos esperando aquele navio ir embora em paz. Grazie, gaúcho. Aparece no pinheiral pra um mate.']]
  ]).map(l => [...l]), null, 'Valeu, Garibaldi');
}

// ---------- Desenho da praia ----------
function lagunaShorePath(off = 0) { const p = new Path2D(); p.moveTo(-40, LAGUNA.H + 40); for (let x = -40; x <= LAGUNA.W + 40; x += 30) p.lineTo(x, lagunaShoreY(x) + off); p.lineTo(LAGUNA.W + 40, LAGUNA.H + 40); p.closePath(); return p; }
function lagunaBarraPath() { const p = new Path2D(), x0 = LAGUNA.barraX; p.moveTo(x0, -40); for (let y = -40; y <= LAGUNA.H; y += 40) p.lineTo(x0 + Math.sin(y / 180) * 18, y); p.lineTo(x0 + 230, LAGUNA.H); for (let y = LAGUNA.H; y >= -40; y -= 40) p.lineTo(x0 + 230 + Math.sin(y / 150) * 16, y); p.closePath(); return p; }
function lagunaWater(view) {
  if (!mataTexture(5, view.x, view.y, view.w, view.h)) rect(view.x, view.y, view.w, view.h, '#1e4a52');
  ctx.fillStyle = 'rgba(8,24,40,.35)'; ctx.fillRect(view.x, view.y, view.w, view.h);
}
function drawLagunaGround(view) {
  // Areia, a sombra das dunas lá em cima e a areia molhada na beira.
  if (!mataTexture(4, view.x, view.y, view.w, view.h)) rect(view.x, view.y, view.w, view.h, '#d8c8a0');
  ctx.save(); const g = ctx.createLinearGradient(0, 300, 0, 720); g.addColorStop(0, 'rgba(80,96,52,.75)'); g.addColorStop(1, 'rgba(80,96,52,0)'); ctx.fillStyle = g; ctx.fillRect(view.x, Math.max(view.y, 0), view.w, 760); ctx.restore();
  ctx.save(); ctx.clip(lagunaShorePath(-60)); ctx.fillStyle = 'rgba(70,58,36,.32)'; ctx.fillRect(view.x, view.y, view.w, view.h); ctx.restore();
  ctx.save(); ctx.clip(lagunaShorePath()); lagunaWater(view); ctx.restore();
  ctx.save(); ctx.clip(lagunaBarraPath()); lagunaWater(view); ctx.restore();
  // A outra margem da barra: o morro e as luzes de Laguna, com a igreja.
  const bx = LAGUNA.barraX + 230; if (view.x + view.w > bx) {
    rect(bx, view.y, view.x + view.w - bx + 40, view.h, '#3e4a34');
    for (let k = 0; k < 9; k++) { const x = bx + 60 + (k % 3) * 90, y = 640 + Math.floor(k / 3) * 150; rect(x, y - 50, 70, 50, '#5a5040'); ctx.fillStyle = '#3a2a1e'; ctx.beginPath(); ctx.moveTo(x - 6, y - 50); ctx.lineTo(x + 35, y - 78); ctx.lineTo(x + 76, y - 50); ctx.closePath(); ctx.fill(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x + 20, y - 26, 26, .4 + .1 * Math.sin(frameClock * 2 + k), '255,200,110'); ctx.restore(); rect(x + 14, y - 34, 12, 12, '#ffd890'); }
    const cx = bx + 150, cy = 560; rect(cx - 40, cy - 90, 80, 90, '#e8e0d0'); rect(cx - 16, cy - 150, 32, 62, '#e8e0d0'); ctx.fillStyle = '#7a3a2a'; ctx.beginPath(); ctx.moveTo(cx - 20, cy - 150); ctx.lineTo(cx, cy - 178); ctx.lineTo(cx + 20, cy - 150); ctx.closePath(); ctx.fill(); rect(cx - 2, cy - 196, 4, 20, '#3a2a1a'); rect(cx - 8, cy - 190, 16, 4, '#3a2a1a');
  }
}
function drawLagunaSea(view) {
  // Espuma chegando na areia, e o reflexo da lua no mar.
  ctx.save(); ctx.strokeStyle = 'rgba(230,240,235,.55)'; ctx.lineWidth = 2.5;
  for (let k = 0; k < 3; k++) { const off = ((frameClock * 14 + k * 26) % 78); ctx.globalAlpha = 1 - off / 78; ctx.beginPath(); for (let x = Math.floor(view.x / 24) * 24; x < view.x + view.w + 24; x += 24) { const y = lagunaShoreY(x) + 4 + off * .5 + Math.sin(x / 50 + frameClock + k) * 3; x === Math.floor(view.x / 24) * 24 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 14; k++) { const y = LAGUNA.shoreY + 120 + k * 32, w = 90 - k * 3 + Math.sin(frameClock * 2 + k) * 14; ellipse(1700 + Math.sin(frameClock + k * .7) * 12, y, w, 3, 'rgba(160,190,220,.10)'); } ctx.restore();
}
// O lanchão: o barco da beira do rio, maior, com um mastro e a vela enrolada.
function drawSeival(x, y, w = 380, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha;
  if (!environmentSprite('pier-v1', 1, x, y, w, w * .27)) { ctx.fillStyle = '#6a4628'; ctx.beginPath(); ctx.ellipse(x, y - w * .12, w / 2, w * .12, 0, 0, Math.PI * 2); ctx.fill(); }
  rect(x + w * .04 - 3, y - w * .62, 6, w * .5, '#4a3018', 2); rect(x - w * .18, y - w * .42, w * .44, 7, '#e0d4b0', 3); ctx.fillStyle = '#e0d4b0'; ctx.beginPath(); ctx.moveTo(x + w * .07, y - w * .6); ctx.lineTo(x + w * .07, y - w * .2); ctx.lineTo(x + w * .26, y - w * .24); ctx.closePath(); ctx.globalAlpha = .55 * alpha; ctx.fill();
  ctx.globalAlpha = alpha; ctx.fillStyle = '#2a8a3a'; ctx.fillRect(x + w * .05, y - w * .66, 16, 5); ctx.fillStyle = '#d42a2a'; ctx.fillRect(x + w * .05, y - w * .655 + 4, 16, 4); ctx.fillStyle = '#f0d020'; ctx.fillRect(x + w * .05, y - w * .655 + 8, 16, 4);
  ctx.restore();
}
// A carreta de oito rodas (de lado se veem quatro) e a junta de bois.
function drawCarreta(x, y, withBoat = true, frame = 0) {
  ellipse(x, y + 4, 240, 18, 'rgba(20,16,10,.3)');
  for (let k = 0; k < 4; k++) { const wx = x - 165 + k * 110; ellipse(wx, y - 14, 26, 26, '#4a3018'); ellipse(wx, y - 14, 20, 20, '#7a5634'); ctx.strokeStyle = '#4a3018'; ctx.lineWidth = 3; for (let s = 0; s < 4; s++) { const a = s * Math.PI / 4 + frame; ctx.beginPath(); ctx.moveTo(wx + Math.cos(a) * 18, y - 14 + Math.sin(a) * 18); ctx.lineTo(wx - Math.cos(a) * 18, y - 14 - Math.sin(a) * 18); ctx.stroke(); } ellipse(wx, y - 14, 5, 5, '#3a2414'); }
  rect(x - 210, y - 44, 420, 18, '#6a4628', 4, '#3e2814'); rect(x + 210, y - 38, 120, 6, '#5a3a20', 2);
  if (withBoat) drawSeival(x, y - 40, 400);
}
function drawBoiada(x, y, frame = 0) { for (let k = 0; k < 2; k++) for (const o of [-18, 18]) drawBoi(k ? 1 : 3, frame % 3, x + k * 120, y + o, 1.4, false); ctx.strokeStyle = '#5a3a20'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 60, y - 20); ctx.lineTo(x + 150, y - 20); ctx.stroke(); }
function lagunaBoatPos() { return { x: LAGUNA.boat.x, y: lagunaShoreY(LAGUNA.boat.x) + 50 }; }
function drawLaguna(view, seen, layers) {
  drawLagunaGround(view); drawLagunaSea(view);
  const F = lagunaFlora(), st = lagunaState();
  for (const g of F.grass) if (seen(g.x, g.y, 80)) layers.push({ y: g.y, draw: () => mataNature(g.low ? 13 : (g.x * 7 % 3 < 1 ? 1 : 13), g.x, g.y, g.w, g.w * .8) });
  for (const t of F.trees) if (seen(t.x, t.y, t.w)) layers.push({ y: t.y, draw: () => t.art === 'butia' ? worldSprite('butia-v2', 0, t.x - t.w / 2, t.y - t.w, t.w, t.w) : environmentSprite('regional-flora-v1', 3, t.x, t.y, t.w * .6, t.w * 1.05) });
  for (const r of F.rocks) if (seen(r.x, r.y, 120)) layers.push({ y: r.y, draw: () => mataNature(14, r.x, r.y, r.w, r.w * .7) });
  layers.push({ y: 760, draw: () => mataPlaca(380, 760, 'BARRA DE LAGUNA', 220) }, { y: LAGUNA.entryY + 110, draw: () => mataPlaca(150, LAGUNA.entryY + 110, '← RESTINGA', 160) });
  layers.push({ y: LAGUNA.fogo.y, draw: () => { if (!worldSprite('rural', 6, LAGUNA.fogo.x - 70, LAGUNA.fogo.y - 110, 140, 110)) sceneFire(LAGUNA.fogo.x, LAGUNA.fogo.y); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(LAGUNA.fogo.x, LAGUNA.fogo.y - 30, 220, .3 + .05 * Math.sin(frameClock * 9), '255,150,60'); ctx.restore(); } });
  if (scene) return;
  if (!st.carregado) { layers.push({ y: LAGUNA.carreta.y, draw: () => drawCarreta(LAGUNA.carreta.x, LAGUNA.carreta.y) }, { y: LAGUNA.carreta.y + 10, draw: () => drawBoiada(LAGUNA.carreta.x + 260, LAGUNA.carreta.y + 10) }); }
  else { const b = lagunaBoatPos(), bob = Math.sin(frameClock * 1.3) * 3; layers.push({ y: b.y, draw: () => drawSeival(b.x, b.y + bob, 380) }); layers.push({ y: LAGUNA.carreta.y, draw: () => drawCarreta(LAGUNA.carreta.x + 280, lagunaShoreY(LAGUNA.carreta.x + 280) - 110, false) }); }
  layers.push({ y: LAGUNA.ghost.y, draw: () => drawGaribaldi(LAGUNA.ghost.x, LAGUNA.ghost.y, 1, worldOut.x < LAGUNA.ghost.x ? -1 : 1) }, { y: LAGUNA.anita.y, draw: () => drawCampFolk('anita', LAGUNA.anita.x, LAGUNA.anita.y, 1, worldOut.x < LAGUNA.anita.x ? -1 : 1) });
  if (!st.won) layers.push({ y: LAGUNA.ship.y, draw: () => drawNavioFar(LAGUNA.ship.x, LAGUNA.ship.y) });
  else layers.push({ y: LAGUNA.marco.y, draw: () => drawMarcoAt(LAGUNA.marco.x, LAGUNA.marco.y) });
  layers.push({ y: 8e9, draw: () => { mataNightVeil(view, .56); darkHole(worldOut.x, worldOut.y - 40, 240, 760, '4,8,14', .5); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(LAGUNA.fogo.x, LAGUNA.fogo.y - 20, 300, .18, '255,150,60'); if (!st.won) glow(LAGUNA.ship.x, LAGUNA.ship.y - 120, 380, .14 + .04 * Math.sin(frameClock * 1.3), '120,255,190'); ctx.restore(); } });
}

// ---------- A chegada e a carreta ----------
function lagunaArrival() {
  const st = lagunaState(); if (st.carregado || scene) return;
  const finish = () => { st.carregado = G.day; mataXP(30); save(); Object.assign(worldOut, { map: 'laguna', x: LAGUNA.boat.x - 160, y: lagunaShoreY(LAGUNA.boat.x - 160) - 70, dx: 1, dy: 0, walk: false }); talk([['dica', '<b>⚓ A Batalha de Laguna</b><br>· O Seival tá na água: chega perto do barco e aperta <b>E</b> pra abordar o navio imperial.<br>· No convés, o capitão Mariath dá <b>estocada</b> (a linha avisa) e <b>cutilada</b> de perto.<br>· Quando ele grita <b>“Fogo!”</b>, os canhões varrem faixas do convés de lado a lado: sai da faixa vermelha.<br>· Marinheiros sobem pela escotilha. O <b>Lanceiro Negro</b> sobe contigo e peleia com eles; da água, a <b>Anita</b> dispara o canhãozinho e o <b>Bento Gonçalves</b> dá ânimo (um pouco de vida) de tempos em tempos.<br>· Se cair, o Garibaldi te puxa pra praia.', 'Barra de Laguna']], null, 'Bora'); };
  if (!scenesEnabled()) { talk([['garibaldi', 'Chegou, gaúcho! Essa é a barra de Laguna. E aquele ali no mar é o navio do Império.'], ['anita', 'Ajuda a gente a pôr o Seival na água?']], finish, 'Ajudar'); return; }
  const c = LAGUNA.carreta, b = lagunaBoatPos(), shore = { x: c.x + 280, y: lagunaShoreY(c.x + 280) - 110 };
  const boatActor = (a, y) => { const lift = a.lift || 0; drawSeival(a.x, y - lift, 400); };
  playSteps([...sceneWorld({ map: 'laguna', x: c.x + 120, y: c.y + 130, night: .3, lights: [{ x: LAGUNA.fogo.x, y: LAGUNA.fogo.y - 30, r: 300, a: .3, color: '255,150,60' }, { x: LAGUNA.ship.x, y: LAGUNA.ship.y - 120, r: 380, a: .16, color: '120,255,190' }], props: (layers) => { layers.push({ y: LAGUNA.ship.y, draw: () => drawNavioFar(LAGUNA.ship.x, LAGUNA.ship.y) }); } }),
    { actor: 'carreta', x: c.x, y: c.y, draw: (a, y) => drawCarreta(a.x, y, !a.empty, a.x / 26) },
    { actor: 'bois', x: c.x + 260, y: c.y + 10, draw: (a, y) => drawBoiada(a.x, y, a.walk ? Math.floor(frameClock * 6) : 0) },
    { actor: 'garibaldi', x: c.x - 40, y: c.y + 120, dx: 1, ghost: true, draw: (a, y) => drawGaribaldi(a.x, y, 1, a.dx, !!a.walk) },
    { actor: 'anita', x: c.x + 90, y: c.y + 140, dx: -1, draw: (a, y) => drawCampFolk('anita', a.x, y, 1, a.dx) },
    { actor: 'sadi', x: 120, y: LAGUNA.entryY, dx: 1 }, { fade: 'in', time: .8 },
    { walk: 'sadi', to: { x: c.x - 160, y: c.y + 150 } },
    { say: 'sadi', text: 'O mar! Bah, depois de tanta mata, até o cheiro é outro.' },
    { say: 'garibaldi', text: 'Chegou, gaúcho! Essa é a barra de Laguna. E aquele ali no mar, todo verde de assombração, é o navio do Império.' },
    { say: 'anita', text: 'Toda noite ele volta pra barra, como em 15 de novembro de 1839. Quatorze navios do Império contra os nossos poucos barcos.' },
    { say: 'sadi', text: 'E esse barco em cima da carreta?' },
    { say: 'garibaldi', text: 'É o Seival! Em 1839 a Lagoa dos Patos tinha a saída guardada pelo Império. Então a gente fez os lanchões escondido, perto de Camaquã…' },
    { say: 'garibaldi', text: '…botou em carretas de oito rodas, com uns duzentos bois, e atravessou os campos e os banhados até a foz do Tramandaí. Por terra!' },
    { say: 'anita', text: 'No mar, o outro lanchão, o Rio Pardo, virou numa tempestade perto de Araranguá. O Seival chegou, e Laguna foi tomada.' },
    { say: 'garibaldi', text: 'Me ajuda a pôr o Seival na água mais uma vez? Bora, boizada!' },
    sceneSet('carreta', { speed: 70 }), sceneSet('bois', { speed: 70 }), sceneSet('garibaldi', { speed: 70 }), sceneSet('sadi', { speed: 70 }),
    { do: () => { AudioEngine.thud?.(); for (let k = 0; k < 4; k++) setTimeout(() => AudioEngine.creak?.(), k * 500); } },
    { walk: ['carreta', 'bois', 'garibaldi', 'sadi'], to: [shore, { x: shore.x + 260, y: shore.y + 10 }, { x: shore.x - 60, y: shore.y + 110 }, { x: shore.x - 190, y: shore.y + 90 }] },
    { say: 'garibaldi', text: 'Daqui pra frente, boi não entra. Agora é no braço!' },
    { walk: 'garibaldi', to: { x: shore.x - 10, y: shore.y + 30 } },
    // O barco sai da carreta e sobe por cima da cabeça do Garibaldi.
    { actor: 'barco', x: shore.x, y: shore.y + 34, lift: 74, draw: boatActor }, sceneSet('carreta', { empty: true }),
    { do: () => { const a = scene.actors.barco, up = () => { if (!scene || scene.actors.barco !== a) return; a.lift = Math.min(185, a.lift + 5); if (a.lift < 185) setTimeout(up, 30); }; up(); AudioEngine.ouch?.(); sceneShout('Ergueu o barco!', shore.x, shore.y - 300, '#ffe28a', 22); } }, { wait: 1.2 },
    { say: 'sadi', text: 'Bah! Ergueu o barco sozinho?!' },
    { say: 'garibaldi', text: 'Fantasma tem as suas vantagens, hehe. Em 1839 foram duzentos bois. Hoje, um farrapo teimoso.' },
    sceneSet('barco', { speed: 80 }), sceneSet('garibaldi', { speed: 80 }),
    { walk: ['barco', 'garibaldi'], to: [{ x: b.x + 10, y: b.y + 4 }, { x: b.x, y: b.y }] },
    { do: () => { const a = scene.actors.barco, down = () => { if (!scene || scene.actors.barco !== a) return; a.lift = Math.max(0, a.lift - 8); if (a.lift > 0) setTimeout(down, 30); }; down(); fxPuffs(b.x, b.y, 14, 160, '#e8f0f0'); AudioEngine.splash?.(); } }, { wait: .8 },
    sceneSet('garibaldi', { speed: 80 }), { walk: 'garibaldi', to: { x: b.x - 120, y: b.y - 90 } },
    { say: 'anita', text: 'O Seival tá na água de novo! Eu vou no canhãozinho, como naquele dia.' },
    { say: 'garibaldi', text: 'E tu, gaúcho, sobe no convés deles. Dessa vez, Laguna não fica sem resposta.' },
    { fade: 'out', time: .6 }], 'laguna-chegada', finish);
}

// ---------- O navio imperial ----------
const NAVIO = { W: 2200, H: 1300, ox: 200, oy: 360, hull: [[250, 440], [1500, 420], [1800, 470], [1975, 650], [1800, 830], [1500, 880], [250, 860], [220, 650]], masts: [[700, 650], [1150, 650], [1560, 650]], hatch: { x: 930, y: 650, w: 120, h: 80 }, barrels: [[420, 500], [440, 800], [1700, 560]], ladder: { x: 1250, y: 850 } };
function navioHullPath(inset = 0) { const p = new Path2D(), c = { x: 1100, y: 650 }; NAVIO.hull.forEach(([x, y], i) => { const dx = c.x - x, dy = c.y - y, d = Math.hypot(dx, dy) || 1, k = inset / d; i ? p.lineTo(x + dx * k * (Math.abs(dy) > 100 ? 1 : 1.6), y + dy * k) : p.moveTo(x + dx * k * 1.6, y + dy * k); }); p.closePath(); return p; }
let navioHullInner = null, navioTestCtx = null;
function navioInside(x, y) { navioHullInner ??= navioHullPath(34); navioTestCtx ??= document.createElement('canvas').getContext('2d'); return navioTestCtx.isPointInPath(navioHullInner, x, y); }
function navioSolid(x, y) {
  if (NAVIO.masts.some(([mx, my]) => Math.hypot(x - mx, (y - my) * 1.3) < 34)) return true;
  if (NAVIO.barrels.some(([bx, by]) => Math.hypot(x - bx, (y - by) * 1.3) < 28)) return true;
  const h = NAVIO.hatch; if (Math.abs(x - h.x) < h.w / 2 + 6 && Math.abs(y - h.y) < h.h / 2 + 6) return true;
  return false;
}
WORLD_MAPS.navio = {
  id: 'navio', name: 'Navio imperial', W: NAVIO.W, H: NAVIO.H,
  spawn() { return { x: NAVIO.ladder.x, y: NAVIO.ladder.y - 40 }; },
  canWalk(x, y) { return navioInside(x, y) && !navioSolid(x, y); },
  edge() { return null; },
  spots() { return [{ id: 'navio:descer', x: NAVIO.ladder.x, y: NAVIO.ladder.y, radius: 80, label: 'Descer pro Seival (voltar pra praia)', act: navioLeave }]; },
  draw(view, seen, layers) { drawNavioMap(view, seen, layers); },
  onEnter() { navioEnter(); }
};
REGION_NAMES.navio = 'Barra de Laguna';
function navioBoard() {
  const st = lagunaState(); if (st.won) return;
  if (!caveState().facao) { worldSay('Sem o facão do vô, nem pensar em subir naquele convés.'); return; }
  caveState().hp = caveMaxHp(); mataBuffs.veneno = 0; mataNight = null; navioFx.lanes = []; navioFx.fires = []; navioFx.ball = null;
  switchMap({ map: 'navio', x: NAVIO.ladder.x, y: NAVIO.ladder.y - 40, title: 'O navio imperial', text: 'Convés molhado, velas rasgadas e uma luz verde no castelo de popa.' });
}
function navioLeave() { mataNight = null; const b = lagunaBoatPos(); switchMap({ map: 'laguna', x: b.x - 160, y: lagunaShoreY(b.x - 160) - 70, title: 'Barra de Laguna', text: 'De volta pra areia. O navio continua lá, esperando.' }); }
function navioEnter() { if (lagunaState().won) return; mataNight = null; }
const navioFx = { lanes: [], fires: [], ball: null, anita: 8, fireTick: 0, bento: 16, lanceiro: null };
function navioStart() {
  const B = CAVE_BEASTS.mariath;
  mataNight = { day: G.day, key: 'navio', navio: true, beasts: [{ kind: 'mariath', boss: true, x: 420, y: 650, hp: B.hp, max: B.hp, dx: 1, state: 'idle', t: 1.5, vx: 0, vy: 0, hurt: 0, frame: 0, cool: 0, attack: 0, fogo: 6, board: 10, fire: 12, idx: 0 }], drops: [], herds: [], shots: [], cd: 0, inv: 0, hurt: 0, swing: null };
  navioFx.lanes = []; navioFx.fires = []; navioFx.ball = null; navioFx.anita = 8; navioFx.bento = 16;
  navioFx.lanceiro = { x: NAVIO.ladder.x + 110, y: NAVIO.ladder.y - 60, dx: -1, t: 3, state: 'idle', target: null };
}
function navioBoss(N = mataNight) { return N?.beasts.find(b => b.kind === 'mariath' && b.hp > 0) || null; }
function navioIntro(b) {
  b.met = true; keys.clear();
  talk([['card', '<b>⚓ O capitão Mariath</b><br>No castelo de popa, debaixo da bandeira verde e amarela do Império, um oficial de bicorne e casaca azul, translúcido como neblina. A espada brilha verde.', 'Navio imperial'],
    ['mariath', 'Quem sobe no meu convés sem licença? Mais um farrapo?'],
    ['sadi', 'Bodegueiro, capitão. Mas hoje eu vim com o Garibaldi e a Anita.'],
    ['mariath', 'Sou o capitão Frederico Mariath, da Marinha Imperial. Cumpri as ordens que me deram: retomar Laguna para o Império.'],
    ['mariath', 'E enquanto aquele marinheiro de camisa vermelha não desistir desta barra, eu também não desisto. Em guarda!']], null, 'Em guarda!');
}
function navioSailor(N) {
  const B = CAVE_BEASTS.marinheiro, h = NAVIO.hatch;
  for (let k = 0; k < 3; k++) { const at = { x: h.x - 70 + k * 70, y: h.y + (k % 2 ? 70 : -70) }; N.beasts.push({ kind: 'marinheiro', x: at.x, y: at.y, home: at, tx: at.x, ty: at.y, hp: B.hp, max: B.hp, dx: 1, state: 'chase', t: .5, vx: 0, vy: 0, hurt: 0, frame: 0, cool: 1, attack: 0, dmgMul: 1.3, minion: true }); fxPuffs(at.x, at.y - 30, 8, 90, '#a8f0c8'); }
}
function mariathTick(b, dt, N, p) {
  const B = CAVE_BEASTS.mariath, dxp = p.x - b.x, dyp = p.y - b.y, d = Math.hypot(dxp, dyp) || 1, angry = b.hp < b.max * .5;
  b.t -= dt; b.hurt = Math.max(0, b.hurt - dt); b.attack = Math.max(0, b.attack - dt); b.frame += dt * 6; b.fogo -= dt; b.board -= dt; b.fire -= dt;
  if (!b.met) { if (d < 520) navioIntro(b); return; }
  if (b.state === 'idle') {
    if (Math.abs(dxp) > 6) b.dx = dxp < 0 ? -1 : 1;
    const want = d > 320 ? 1 : d < 200 ? -1 : 0, tang = b.side ??= 1;
    if (!mataStep(b, (dxp / d * want - dyp / d * tang * .7) * B.speed, (dyp / d * want + dxp / d * tang * .7) * B.speed, dt)) b.side = -tang;
    if (b.t > 0) return;
    if (d < 170) { b.state = 'cutwind'; b.t = .42; b.vx = dxp / d; b.vy = dyp / d; AudioEngine.swoosh?.(.04); return; }
    if (b.fogo <= 0) { b.state = 'fogo'; b.t = .9; b.fogo = angry ? 8 : 11; sceneShout('Fogo!', b.x, b.y - 190, '#ffb090', 22); AudioEngine.caveVoice?.([300, 420], .4, { formant: 900, vol: .05 }); const ys = [p.y], pool = [500, 590, 680, 770, 820].filter(y => Math.abs(y - p.y) > 110); while (ys.length < 3 && pool.length) ys.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]); navioFx.lanes = ys.map(y => ({ y, t: 1.4 })); return; }
    if (b.board <= 0 && N.beasts.filter(x => x.minion && x.hp > 0).length < 2) { b.state = 'abordagem'; b.t = .9; b.board = 17; sceneShout('Abordagem!', b.x, b.y - 190, '#ffb090', 20); return; }
    if (angry && b.fire <= 0) { b.state = 'incendio'; b.t = .8; b.fire = 10; sceneShout('Bala incendiária!', b.x, b.y - 190, '#ffb090', 18); return; }
    b.state = 'windup'; b.t = b.t0 = angry ? .45 : .6; b.vx = dxp / d; b.vy = dyp / d; b.dx = b.vx < 0 ? -1 : 1; AudioEngine.swoosh?.(.03);
  } else if (b.state === 'windup') { if (b.t <= 0) { b.state = 'lunge'; b.t = .32; AudioEngine.swoosh?.(.09); } }
  else if (b.state === 'lunge') {
    b.frame += dt * 10;
    if (!mataStep(b, b.vx * 760, b.vy * 760, dt)) { b.state = 'stagger'; b.t = 1.2; effect('Bateu no mastro!', b.x, b.y - 180, '#ffe28a', 16); fxStars(b.x, b.y - 140, 5); }
    else if (b.t <= 0) { b.state = 'idle'; b.t = .8; }
    if (Math.hypot(p.x - b.x, p.y - b.y) < B.r + 34) { mataHurt(B.dmg, b); b.attack = .3; }
  } else if (b.state === 'cutwind') { if (b.t <= 0) { b.state = 'idle'; b.t = .9; b.attack = .3; AudioEngine.swoosh?.(.1); if (d < 175 && dxp * b.vx + dyp * b.vy > 0) { mataHurt(16, b); mataStep(worldOut, dxp / d * 80, dyp / d * 80, 1); } } }
  else if (b.state === 'fogo') { if (b.t <= 0) { b.state = 'idle'; b.t = 1.2; } }
  else if (b.state === 'abordagem') { if (b.t <= 0) { navioSailor(N); b.state = 'idle'; b.t = 1.2; } }
  else if (b.state === 'incendio') { if (b.t <= 0) { for (let k = 0; k < 4; k++) { const a = Math.random() * Math.PI * 2, r = k ? 90 + Math.random() * 120 : 0, x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r * .6; if (navioInside(x, y)) navioFx.fires.push({ x, y, t: 7, r: 62 }); } b.state = 'idle'; b.t = 1; AudioEngine.ignite?.(); } }
  else if (b.state === 'stagger') { if (b.t <= 0) { b.state = 'idle'; b.t = .6; } }
}
// Os canhões, o fogo no convés e o canhãozinho da Anita.
function navioFxTick(N, dt, p) {
  for (const l of navioFx.lanes) { l.t -= dt; if (l.t <= 0 && !l.boom) { l.boom = .5; AudioEngine.caveCrumble?.(); AudioEngine.thud?.(); for (let x = 300; x < 1900; x += 140) fxPuffs(x, l.y, 3, 60, '#d8d4cc'); if (Math.abs(p.y - l.y) < 48 && navioInside(p.x, p.y)) mataHurt(22, { x: p.x, y: l.y - 100 }); } if (l.boom) l.boom -= dt; }
  navioFx.lanes = navioFx.lanes.filter(l => !l.boom || l.boom > 0);
  navioFx.fireTick -= dt; for (const f of navioFx.fires) f.t -= dt; navioFx.fires = navioFx.fires.filter(f => f.t > 0);
  if (navioFx.fireTick <= 0 && navioFx.fires.some(f => Math.hypot(p.x - f.x, (p.y - f.y) * 1.4) < f.r)) { navioFx.fireTick = .5; mataHurt(5, { x: p.x, y: p.y + 10 }); }
  if (lagunaState().anitaOk !== false && mataFolk('anita')) {
    navioFx.anita -= dt;
    if (navioFx.anita <= 0 && !navioFx.ball) { const sailor = N.beasts.filter(b => b.minion && b.hp > 0).sort((a, c) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(c.x - p.x, c.y - p.y))[0], boss = navioBoss(N), target = sailor || boss; if (target) { navioFx.ball = { x0: NAVIO.ladder.x + 60, y0: 990, target, k: 0 }; sceneShout('Anita: Fogo!', NAVIO.ladder.x + 60, 900, '#ffd2a0', 18); AudioEngine.thud?.(); } navioFx.anita = 12; }
    const ball = navioFx.ball; if (ball) { ball.k = Math.min(1, ball.k + dt / .7); if (ball.k >= 1) { const t = ball.target; navioFx.ball = null; fxPuffs(t.x, t.y - 40, 16, 160, '#e8d8c0'); AudioEngine.caveCrumble?.(); if (t.hp > 0) { t.hp -= t.minion ? 999 : 45; t.hurt = .3; if (!t.minion) { t.state = 'stagger'; t.t = 1.2; } effect(t.minion ? 'Na mosca, Anita!' : '−45 canhão!', t.x, t.y - 150, '#ffe28a', 18); if (t.hp <= 0) mataKill(t); } } }
  }
}
// O Lanceiro Negro no convés: acompanha o Sadi e, de tempos em tempos, carrega de lança num marinheiro (ou no capitão,
// quando o convés tá limpo). O Bento, do Seival, grita ânimo e o Sadi recupera um pouco de vida.
function navioAlliesTick(N, dt, p) {
  const L = navioFx.lanceiro;
  if (L) {
    L.t -= dt;
    if (L.state === 'idle') {
      const tx = p.x + (L.x < p.x ? -110 : 110), ty = p.y + 30, d = Math.hypot(tx - L.x, ty - L.y);
      if (d > 20) { const k = Math.min(d, 170 * dt), nx = L.x + (tx - L.x) / d * k, ny = L.y + (ty - L.y) / d * k; if (navioInside(nx, ny)) { L.x = nx; L.y = ny; } L.dx = tx < L.x ? -1 : 1; }
      if (L.t <= 0) { const sailor = N.beasts.filter(b => b.minion && b.hp > 0).sort((a, c) => Math.hypot(a.x - L.x, a.y - L.y) - Math.hypot(c.x - L.x, c.y - L.y))[0], boss = navioBoss(N); L.target = sailor || (boss && Math.hypot(boss.x - L.x, boss.y - L.y) < 450 ? boss : null); if (L.target) { L.state = 'charge'; AudioEngine.swoosh?.(.06); } else L.t = 1; }
    } else if (L.state === 'charge') {
      const t = L.target, d = Math.hypot(t.x - L.x, t.y - L.y);
      if (t.hp <= 0) { L.state = 'idle'; L.t = 1; return; }
      L.dx = t.x < L.x ? -1 : 1; const k = Math.min(d, 620 * dt); L.x += (t.x - L.x) / (d || 1) * k; L.y += (t.y - L.y) / (d || 1) * k;
      if (d < 60) { const hit = t.minion ? 45 : 22; t.hp -= hit; t.hurt = .3; fxStars(t.x, t.y - 60, 4); AudioEngine.caveFlesh?.(); effect(t.minion ? 'Carga de lanceiro!' : '−' + hit + ' lança', t.x, t.y - 150, '#ffe2a6', 16); if (t.hp <= 0) mataKill(t); L.state = 'idle'; L.t = t.minion ? 5 : 9; }
    }
  }
  navioFx.bento -= dt;
  if (navioFx.bento <= 0) { navioFx.bento = 18; const st = caveState(); if (st.hp < caveMaxHp()) { st.hp = Math.min(caveMaxHp(), st.hp + 15); sceneShout('Bento: Coragem, farrapo!', NAVIO.ladder.x + 40, 900, '#ffe2a6', 18); effect('+15 ❤', p.x, p.y - 140, '#d8ffac', 18); AudioEngine.caveHeal?.(); } }
}
function navioVictory(b) {
  const st = lagunaState(); st.won = G.day; mataNight.beasts.forEach(x => { x.hp = 0; }); navioFx.lanes = []; navioFx.fires = []; navioFx.ball = null; caveState().hp = caveMaxHp(); mataXP(300); save();
  const rw = { cash: 800, xp: 500, rep: 12 };
  const end = () => { giveCard('canabarro', 'mata'); grantReward(rw); talk([['card', '<b>⚓ A Batalha de Laguna</b><br>O navio imperial sumiu na neblina e não volta mais pra barra. Na areia, o Garibaldi, a Anita, o Bento e o Lanceiro ficaram olhando o mar até o dia clarear.<br><br>Em 1839 a batalha foi perdida; quase duzentos anos depois, ela terminou em paz.', 'Barra de Laguna'], ['reward', rw, 'A Batalha de Laguna']], null, 'Que história'); };
  const back = () => { const p = lagunaBoatPos(); switchMap({ map: 'laguna', x: p.x - 200, y: lagunaShoreY(p.x - 200) - 80, title: 'Barra de Laguna' }); };
  if (!scenesEnabled()) { back(); talk([['mariath', 'Basta. A guerra acabou faz muito tempo. Posso baixar a bandeira e descansar.'], ['garibaldi', 'Grazie, gaúcho. Agora Laguna dorme em paz.']], end, 'Continuar'); return; }
  const ghost = (id, alpha = 1) => (a, y) => drawMariath(a.x, y, a.alpha ?? alpha, a.dx, 'idle');
  playSteps([...sceneWorld({ map: 'navio', x: b.x + 120, y: b.y, night: .2 }),
    { actor: 'sadi', x: worldOut.x, y: worldOut.y, dx: worldOut.x < b.x ? 1 : -1 }, { actor: 'mariath', x: b.x, y: b.y, dx: worldOut.x < b.x ? -1 : 1, draw: ghost('mariath') }, { fade: 'in', time: .4 },
    { say: 'mariath', text: 'Basta… Tu luta como os farrapos que eu enfrentei nessa barra.' },
    { say: 'mariath', text: 'Naquele 15 de novembro, a gente forçou a barra com quatorze navios. Eu cumpri o meu dever. Eles cumpriram o deles.' },
    { say: 'garibaldi', text: 'E cumpriu bem, capitão. Eu mesmo pus fogo nos meus barcos pra não entregar.' },
    { say: 'anita', text: 'Mas a guerra acabou faz muito tempo. Em 1845, em Ponche Verde, farrapos e Império fizeram a paz.' },
    { say: 'bento', text: 'Vocês eram o Império; nós, a República. Hoje somos todos só lembrança, capitão.' },
    { say: 'lanceiro', text: 'E que lembrem de todos: de quem mandou e de quem peleou de lança na mão.' },
    { say: 'mariath', text: 'Então posso baixar a bandeira e descansar. Adeus, Garibaldi. Adeus, senhora Anita. E adeus, bodegueiro.' },
    { do: () => { const a = scene.actors.mariath, out = () => { if (!scene || scene.actors.mariath !== a) return; a.alpha = Math.max(0, (a.alpha ?? 1) - .03); if (a.alpha > 0) setTimeout(out, 40); }; out(); AudioEngine.caveGhost?.(); } }, { wait: 1.6 },
    { fade: 'out', time: .8 }, { do: back },
    ...sceneWorld({ map: 'laguna', x: LAGUNA.boat.x - 120, y: lagunaShoreY(LAGUNA.boat.x) - 160, night: .15 }),
    { actor: 'sadi', x: LAGUNA.boat.x - 240, y: lagunaShoreY(LAGUNA.boat.x - 240) - 80, dx: 1 },
    { actor: 'garibaldi', x: LAGUNA.boat.x - 80, y: lagunaShoreY(LAGUNA.boat.x - 80) - 100, dx: -1, ghost: true, draw: (a, y) => drawGaribaldi(a.x, y, 1, a.dx) },
    { actor: 'anita', x: LAGUNA.boat.x + 20, y: lagunaShoreY(LAGUNA.boat.x + 20) - 90, dx: -1, draw: (a, y) => drawCampFolk('anita', a.x, y, 1, a.dx) },
    { actor: 'bento', x: LAGUNA.boat.x - 330, y: lagunaShoreY(LAGUNA.boat.x - 330) - 150, dx: 1, draw: (a, y) => drawCampFolk('bento', a.x, y, 1, a.dx) },
    { actor: 'lanceiro', x: LAGUNA.boat.x + 120, y: lagunaShoreY(LAGUNA.boat.x + 120) - 150, dx: -1, draw: (a, y) => drawCampFolk('lanceiro', a.x, y, 1, a.dx) }, { fade: 'in', time: .8 },
    { say: 'garibaldi', text: 'Quase duzentos anos esperando pra ver aquele navio ir embora em paz. Grazie, gaúcho.' },
    { say: 'anita', text: 'Depois de Laguna a gente fugiu pela serra, lutou em Curitibanos, foi pro Uruguai e pra Itália. Mas foi aqui que tudo começou.' },
    { say: 'garibaldi', text: 'O que fica de uma guerra não é a vitória, Sadi. É a memória: de quem lutou, de quem foi esquecido e de quem fez a paz.' },
    { say: 'bento', text: 'Lembra disso no 20 de Setembro, gaúcho: a Revolução foi feita de muita gente, e quase ninguém sabe o nome da maioria.' },
    { say: 'sadi', text: 'Pois essa história eu vou contar no balcão da bodega, pra quem quiser ouvir.' },
    { say: 'garibaldi', text: 'E eu volto pro meu pinheiral. Aparece lá pra um mate!' },
    { fade: 'out', time: .7 }], 'laguna-vitoria', () => { Object.assign(worldOut, { x: LAGUNA.boat.x - 240, y: lagunaShoreY(LAGUNA.boat.x - 240) - 80, dx: 1, dy: 0 }); end(); });
}

// ---------- Desenho do navio ----------
// O convés é pintado uma vez num canvas (casco, tábuas, amurada, canhões, escotilha) e as velas vão por cima.
let navioDeck = null;
function navioDeckCanvas() {
  if (navioDeck) return navioDeck;
  const c = document.createElement('canvas'); c.width = 1820; c.height = 580; const main = ctx; ctx = c.getContext('2d');
  try {
    ctx.translate(-NAVIO.ox, -NAVIO.oy);
    const hull = navioHullPath(0), deck = navioHullPath(24);
    ctx.fillStyle = '#2a1a0e'; ctx.fill(hull); ctx.save(); ctx.clip(deck);
    for (let y = 400; y < 900; y += 22) { for (let x = 200, k = 0; x < 2000; k++) { const w = 160 + ((x * 7 + y * 3) % 5) * 30; rect(x, y, w - 2, 20, (k + y / 22) % 3 < 1 ? '#8a6038' : (k + y / 22) % 3 < 2 ? '#7e5734' : '#94683e', 1); ellipse(x + 6, y + 10, 1.4, 1.4, '#4a3018'); ellipse(x + w - 8, y + 10, 1.4, 1.4, '#4a3018'); x += w; } }
    ctx.fillStyle = 'rgba(255,240,200,.08)'; ctx.fillRect(220, 420, 260, 460); rect(476, 420, 6, 460, '#5a3a20');
    const h = NAVIO.hatch; rect(h.x - h.w / 2, h.y - h.h / 2, h.w, h.h, '#3a2414', 4, '#5a3a20'); ctx.strokeStyle = '#1a0e06'; ctx.lineWidth = 3; for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(h.x - h.w / 2 + k * 20, h.y - h.h / 2); ctx.lineTo(h.x - h.w / 2 + k * 20, h.y + h.h / 2); ctx.stroke(); } for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(h.x - h.w / 2, h.y - h.h / 2 + k * 20); ctx.lineTo(h.x + h.w / 2, h.y - h.h / 2 + k * 20); ctx.stroke(); }
    ctx.fillStyle = 'rgba(120,220,170,.07)'; ctx.fillRect(200, 400, 1800, 500);
    ctx.restore();
    ctx.strokeStyle = '#4a2c16'; ctx.lineWidth = 26; ctx.stroke(navioHullPath(12)); ctx.strokeStyle = '#6a4424'; ctx.lineWidth = 4; ctx.stroke(navioHullPath(2)); ctx.strokeStyle = '#3a2210'; ctx.lineWidth = 3; ctx.stroke(navioHullPath(24));
    for (const [x, y, s] of [[500, 452, -1], [800, 445, -1], [1100, 440, -1], [1400, 438, -1], [500, 848, 1], [800, 855, 1], [1100, 860, 1]]) { rect(x - 24, y - 12 + s * 6, 48, 18, '#5a3a20', 3); ctx.save(); ctx.translate(x, y + s * 4); rect(-10, s > 0 ? 0 : -26, 20, 26, '#22201e', 6); ellipse(0, s > 0 ? 26 : -26, 8, 4, '#0e0c0a'); ctx.restore(); }
    for (const [x, y] of NAVIO.barrels) { ellipse(x, y + 4, 24, 9, 'rgba(10,8,6,.4)'); rect(x - 20, y - 34, 40, 36, '#6a4628', 8, '#3a2414'); rect(x - 20, y - 26, 40, 4, '#2a2a2a'); rect(x - 20, y - 10, 40, 4, '#2a2a2a'); ellipse(x, y - 34, 20, 7, '#7a5634'); }
    for (const [x, y] of [[1300, 560], [600, 760]]) { ctx.strokeStyle = '#c8b080'; ctx.lineWidth = 4; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(x, y, 22 - k * 5, 10 - k * 2, 0, 0, Math.PI * 2); ctx.stroke(); } }
  } finally { ctx = main; }
  return navioDeck = c;
}
function drawNavioMast(mx, my, alpha = 1) {
  ellipse(mx, my + 4, 26, 10, 'rgba(10,8,6,.45)'); ellipse(mx, my, 20, 10, '#3a2414');
  ctx.save(); ctx.globalAlpha = alpha; rect(mx - 7, my - 330, 14, 332, '#4a2c16', 3); rect(mx - 100, my - 270, 200, 8, '#3a2210', 3); rect(mx - 75, my - 330, 150, 7, '#3a2210', 3);
  const sway = Math.sin(frameClock * 1.2 + mx) * 6; ctx.fillStyle = 'rgba(214,226,210,.55)';
  for (const [y0, y1, w0, w1] of [[-324, -275, 140, 165], [-262, -150, 185, 210]]) { ctx.beginPath(); ctx.moveTo(mx - w0 / 2, my + y0); ctx.lineTo(mx + w0 / 2, my + y0); ctx.quadraticCurveTo(mx + w1 / 2 + sway, (my * 2 + y0 + y1) / 2, mx + w1 / 2, my + y1); ctx.lineTo(mx - w1 / 2, my + y1); ctx.quadraticCurveTo(mx - w1 / 2 + sway, (my * 2 + y0 + y1) / 2, mx - w0 / 2, my + y0); ctx.closePath(); ctx.fill(); }
  for (const [dx, dy, r] of [[-50, -200, 12], [36, -170, 9], [50, -300, 7]]) ellipse(mx + dx, my + dy, r, r * .7, 'rgba(30,40,36,.45)');
  ctx.strokeStyle = 'rgba(60,50,40,.7)'; ctx.lineWidth = 1.5; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(mx, my - 330); ctx.lineTo(mx + s * 130, my - 160); ctx.stroke(); }
  ctx.restore();
}
function drawNavioFlag(x, y) { rect(x - 3, y - 160, 6, 162, '#3a2414'); const w = Math.sin(frameClock * 3) * 4; ctx.save(); ctx.translate(x + 3, y - 158); ctx.globalAlpha = .85; rect(0, 0, 70, 46 + w * .2, '#2a7a3a'); ctx.fillStyle = '#e8c830'; ctx.beginPath(); ctx.moveTo(35, 4); ctx.lineTo(66, 23); ctx.lineTo(35, 42); ctx.lineTo(4, 23); ctx.closePath(); ctx.fill(); ellipse(35, 23, 9, 9, '#2a4a8a'); ctx.restore(); }
function drawNavioMap(view, seen, layers) {
  const st = lagunaState();
  lagunaWater(view);
  ctx.save(); ctx.strokeStyle = 'rgba(210,230,225,.18)'; ctx.lineWidth = 2; for (let k = 0; k < 40; k++) { const x = (k * 337 + frameClock * 30) % (NAVIO.W + 200) - 100, y = (k * 211) % NAVIO.H; if (y > 380 && y < 920 && x > 200 && x < 2000) continue; ctx.beginPath(); ctx.arc(x, y, 14, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } ctx.restore();
  ellipse(1100, 880, 900, 40, 'rgba(4,10,14,.4)');
  ctx.drawImage(navioDeckCanvas(), NAVIO.ox, NAVIO.oy);
  // O Seival, encostado no costado, com o Garibaldi no leme e a Anita no canhãozinho.
  const sb = Math.sin(frameClock * 1.4) * 3; layers.push({ y: 1000, draw: () => { drawSeival(NAVIO.ladder.x + 40, 1000 + sb, 360); drawGaribaldi(NAVIO.ladder.x - 80, 985 + sb, 1, 1); drawCampFolk('bento', NAVIO.ladder.x + 40, 990 + sb, 1, -1); if (mataFolk('anita')) drawCampFolk('anita', NAVIO.ladder.x + 150, 985 + sb, 1, -1); } });
  const L = navioFx.lanceiro; if (L && !st.won && mataCombatOn()) layers.push({ y: L.y, draw: () => drawCampFolk('lanceiro', L.x, L.y, 1, L.dx) });
  layers.push({ y: NAVIO.ladder.y + 20, draw: () => { for (let k = 0; k < 5; k++) rect(NAVIO.ladder.x - 18, NAVIO.ladder.y - 10 + k * 22, 36, 4, '#7a5634', 2); for (const s of [-1, 1]) rect(NAVIO.ladder.x + s * 18 - 2, NAVIO.ladder.y - 14, 4, 110, '#5a3a20', 2); } });
  for (const [mx, my] of NAVIO.masts) layers.push({ y: my, draw: () => drawNavioMast(mx, my, Math.abs(worldOut.x - mx) < 220 && worldOut.y < my + 40 ? .3 : .85) });
  layers.push({ y: 470, draw: () => drawNavioFlag(260, 470) });
  // O fogo no convés.
  for (const f of navioFx.fires) layers.push({ y: f.y, draw: () => { const k = Math.min(1, f.t / 1.5); ellipse(f.x, f.y, f.r, f.r * .55, `rgba(60,20,8,${.35 * k})`); for (let j = 0; j < 5; j++) { const fx = f.x + Math.sin(frameClock * 8 + j * 1.7) * f.r * .5, fy = f.y - 8 - j * 9; ellipse(fx, fy, 14 - j * 2, 20 - j * 3, `rgba(255,${120 + j * 20},40,${.8 * k})`); } } });
  if (mataCombatOn() && !scene) drawMataNightLayers(layers, seen);
  const ball = navioFx.ball; if (ball) layers.push({ y: 9e6, draw: () => { const t = ball.target, x = ball.x0 + (t.x - ball.x0) * ball.k, y = ball.y0 + (t.y - 40 - ball.y0) * ball.k - Math.sin(ball.k * Math.PI) * 220; ellipse(x, y, 9, 9, '#1a1816'); ellipse(x - 2, y - 2, 3, 3, '#5a5a5a'); } });
  layers.push({ y: 8e9, draw: () => { mataNightVeil(view, .32); ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const [x, y] of [[300, 470], [1880, 650], [1100, 860]]) glow(x, y - 30, 160, .2 + .04 * Math.sin(frameClock * 5 + x), '255,200,110'); if (!st.won) glow(420, 600, 360, .12, '120,255,190'); for (const f of navioFx.fires) glow(f.x, f.y - 20, 120, .25, '255,140,50'); ctx.restore(); } });
}
// O navio de longe, no mar da praia: o mesmo convés, pequeno, com a luz verde de assombração.
function drawNavioFar(x, y) {
  const s = .42, bob = Math.sin(frameClock * .9) * 4; ctx.save(); ctx.translate(x - 1100 * s, y - 650 * s + bob); ctx.scale(s, s); ctx.globalAlpha = .78;
  ctx.drawImage(navioDeckCanvas(), NAVIO.ox, NAVIO.oy); for (const [mx, my] of NAVIO.masts) drawNavioMast(mx, my, .8); drawNavioFlag(260, 470);
  ctx.restore();
}
// O capitão e os marinheiros: as almas do Império têm um brilho verde.
const navioArt = new Map();
const NAVIO_LOOKS = {
  mariath: { skin: '#e0b8a0', hair: '#5a4a3a', style: 'short', sideburns: true, coat: '#1a2440', epaulettes: true, shirt: '#f0ece0', pants: '#efe8d8', boots: '#141010', hat: 'bicorne' },
  marinheiro: { skin: '#d8b090', hair: '#3a2a1a', style: 'short', hat: 'cap', shirt: '#e8e8e0', collar: '#2a3a6a', pants: '#e8e8e0', barefoot: true }
};
function navioFigure(kind) {
  if (navioArt.has(kind)) return navioArt.get(kind);
  const c = document.createElement('canvas'); c.width = 240; c.height = 460; const main = ctx; ctx = c.getContext('2d');
  try { ctx.translate(120, 440); ctx.scale(2, 2); paintFolk(NAVIO_LOOKS[kind]); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = 'rgba(140,255,200,.3)'; ctx.fillRect(0, 0, 240, 460); ctx.globalCompositeOperation = 'destination-out'; const g = ctx.createLinearGradient(0, 360, 0, 440); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.8)'); ctx.fillStyle = g; ctx.fillRect(0, 360, 240, 100); } finally { ctx = main; }
  navioArt.set(kind, c); return c;
}
function drawMariath(x, y, alpha = 1, dx = 1, state = 'idle', hurt = 0) {
  const c = navioFigure('mariath'), bob = Math.sin(frameClock * 1.8) * 3, s = dx < 0 ? -1 : 1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 80, 130, .22 * alpha, '120,255,190'); ctx.restore();
  ellipse(x, y + 3, 26, 7, `rgba(10,14,8,${.3 * alpha})`);
  ctx.save(); ctx.globalAlpha = .9 * alpha * (hurt > 0 ? .6 + .4 * Math.sin(frameClock * 40) : 1); ctx.translate(x, y - 8 + bob); ctx.scale(s, 1); ctx.drawImage(c, -60, -220, 120, 230);
  // A espada: em guarda, esticada na estocada, ou erguida na cutilada.
  const a = state === 'lunge' ? 0 : state === 'windup' ? -.25 : state === 'cutwind' ? -1.9 : state === 'stagger' ? .9 : -.6;
  ctx.translate(22, -66); ctx.rotate(a); ctx.strokeStyle = '#d0f0e0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(40, -4, 78, 2); ctx.stroke(); rect(-4, -6, 8, 12, '#e8c050', 2);
  ctx.restore();
}
function drawMarinheiro(b) {
  const c = navioFigure('marinheiro'), s = b.dx < 0 ? -1 : 1, step = b.state === 'chase' ? Math.abs(Math.sin(b.frame * 2)) * 3 : 0;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(b.x, b.y - 70, 90, .14, '120,255,190'); ctx.restore();
  ellipse(b.x, b.y + 3, 22, 6, 'rgba(10,14,8,.3)');
  ctx.save(); ctx.globalAlpha = .82 * (b.hurt > 0 ? .6 + .4 * Math.sin(frameClock * 40) : 1); ctx.translate(b.x, b.y - step); ctx.scale(s * .9, .9); ctx.drawImage(c, -60, -220, 120, 230);
  ctx.translate(22, -64); ctx.rotate(b.state === 'lunge' ? .1 : b.state === 'windup' ? -1.6 : -.7); ctx.strokeStyle = '#d0e8e0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(26, -8, 46, 0); ctx.stroke(); ctx.restore();
  mataHpBar(b, 'Marinheiro', 175);
}
function drawNavioWarnings(N) {
  for (const l of navioFx.lanes) teleBand(220, l.y, 1760, 92, l.boom ? 1 : teleK(l.t, 1.4), l.boom ? '255,220,160' : '255,70,40', l.boom ? Math.min(1, l.boom * 2) : 1);
  const b = navioBoss(N); if (!b) return;
  if (b.state === 'windup') teleLane(b.x, b.y, Math.atan2(b.vy, b.vx), 300, 54, teleK(b.t, b.t0 || .6), '140,255,200');
  if (b.state === 'cutwind') teleCone(b.x, b.y, Math.atan2(b.vy, b.vx), 175, 1.2, teleK(b.t, .42));
}
function navioTop() {
  const N = mataNight; if (!N || scene) return;
  drawNavioWarnings(N); drawMataWarnings();
  if (N.hurt > 0) { ctx.fillStyle = `rgba(200,30,20,${N.hurt * .8})`; ctx.fillRect(worldOut.x - 3000, worldOut.y - 3000, 6000, 6000); }
  const b = navioBoss(N); mataHudPanel('Barra de Laguna · navio imperial', b ? (N.beasts.some(x => x.minion && x.hp > 0) ? 'marinheiros no convés' : 'o capitão em guarda') : 'convés limpo');
  if (!b) return;
  const dpr = canvas.width / Math.max(1, canvas.clientWidth), W = canvas.clientWidth, left = 316, right = W - 280, narrow = right - left < 300, w = narrow ? W - 32 : Math.min(520, right - left), x = narrow ? 16 : left + (right - left - w) / 2, y = narrow ? 108 : 16;
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); rect(x, y, w, 46, 'rgba(10,18,22,.88)', 8, '#5ab890'); txt('⚓ Capitão Frederico Mariath', x + w / 2, y + 14, 13, '#e0f8ec', 'center', 'Georgia', false); rect(x + 12, y + 24, w - 24, 12, '#0e2018', 5); rect(x + 12, y + 24, (w - 24) * b.hp / b.max, 12, '#6ad8a0', 5); ctx.restore();
}

// ---------- Ligações ----------
{
  const here = mataHere; mataHere = function () { return here() || worldOut?.map === 'navio' || worldOut?.map === 'laguna'; };
  const combatOn = mataCombatOn; mataCombatOn = function () { if (inNavio()) return !lagunaState().won && !prologueActive(); return combatOn(); };
  const start = mataNightStart; mataNightStart = function () { if (inNavio()) { navioStart(); return; } start(); };
  const combat = mataCombatTick; mataCombatTick = function (dt) {
    if (inNavio()) { if (mataNight && !mataNight.navio) mataNight = null; } else if (mataNight?.navio) mataNight = null;
    combat(dt); const N = mataNight; if (!N?.navio || paused || modal || scene || N.faint || phoneOpen || worldTalkOpen()) return;
    navioFxTick(N, dt, worldOut); navioAlliesTick(N, dt, worldOut);
  };
  const beast = mataBeastTick; mataBeastTick = function (b, dt, p) { if (b.kind === 'mariath') { mariathTick(b, dt, mataNight, p); return; } return beast(b, dt, p); };
  const kill = mataKill; mataKill = function (b) { kill(b); if (b.kind === 'mariath' && inNavio()) navioVictory(b); };
  // Na praia também: depois da chegada, a prosa com o Garibaldi tem o botão da loja dele.
  const gtalk = lagunaGaribaldiTalk; lagunaGaribaldiTalk = function () { gtalk(); if (modal === 'talk' && lagunaState().carregado) garibaldiTradeButton(); };
  const hit = caveDmg; caveDmg = function () { const b = inNavio() && navioBoss(); return Math.round(hit() * (b && b.state === 'stagger' ? 1.5 : 1)); };
  const draw = drawCaveBeast; drawCaveBeast = function (b) { if (b.kind === 'mariath') { drawMariath(b.x, b.y, 1, b.dx, b.state, b.hurt); return; } if (b.kind === 'marinheiro') { drawMarinheiro(b); return; } draw(b); };
  // Desmaiou no convés: o Garibaldi te puxa da água pra areia.
  const faint = mataFaint; mataFaint = function () {
    if (!inNavio()) return faint();
    const N = mataNight; if (!N || N.faint) return; N.faint = true; keys.clear();
    const lost = Math.min(50, Math.round(G.cash * .1)); G.cash = round(G.cash - lost); caveState().hp = caveMaxHp(); mataBuffs.veneno = 0; AudioEngine.caveFaintSound?.(); save();
    const p = lagunaBoatPos(); mataNight = null; switchMap({ map: 'laguna', x: p.x - 200, y: lagunaShoreY(p.x - 200) - 80, title: 'Barra de Laguna' });
    talk([['card', `<b>😵 Caiu no mar</b><br>Acordou na areia, encharcado e com o bolso mais leve (−${money(lost)}). O navio continua lá fora.`, 'Barra de Laguna'], ['garibaldi', 'Te puxei pela gola, gaúcho! Descansa no fogo e tenta de novo: quando ele gritar “Fogo!”, sai da faixa.']], null, 'Levantar');
  };
  const mounted = playerMounted; playerMounted = function () { return worldOut?.map === 'laguna' || inNavio() ? false : mounted(); };
  const sparks = drawSparks; drawSparks = function (map = null) { sparks(map); if (map === 'navio' && inNavio()) navioTop(); };
  const speaker = sceneSpeaker; sceneSpeaker = function (who) { return who === 'mariath' ? { portrait: mariathPortrait(), name: 'Capitão Frederico Mariath' } : speaker(who); };
  const box = showRpgBox; showRpgBox = function (prefix, line) { if (line && !line.portrait && line.person != null && PEOPLE[line.person]?.id === 'mariath') line = { ...line, portrait: mariathPortrait() }; return box(prefix, line); };
}
let mariathPortraitURL = null;
function mariathPortrait(size = 104) {
  if (!mariathPortraitURL) { const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.fillStyle = '#1e3a34'; g.fillRect(0, 0, 96, 96); g.drawImage(navioFigure('mariath'), 60, 110, 120, 120, 0, 0, 96, 96); try { mariathPortraitURL = c.toDataURL(); } catch (_) { return '<span class="portrait portrait-phone" style="width:' + size + 'px;height:' + size + 'px">⚓</span>'; } }
  return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px;display:grid;place-items:center;overflow:hidden"><img src="${mariathPortraitURL}" width="${size}" height="${size}" alt=""></span>`;
}
