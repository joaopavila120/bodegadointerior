// Quem anda pelo caminho do pampa (pampa.js). A ordem é a da mata: começa com bicho e vai virando guerra, e cada trecho é mais
// forte que o anterior (pampaForca). É a área mais difícil do jogo. Perto do fogo de um acampamento ninguém ataca nem nota o Sadi.
//   · Graxaim e teiú (do trecho 2): o graxaim anda em bando, cerca em roda e um de cada vez dá o bote. O teiú vem aos arrancos.
//   · Afogado (trechos 4 a 6): dorme na água da beira da estrada, sai quando o Sadi passa e agarra (bater nele solta).
//   · Batedor do Moringue (do 4): fica agachado no capim, quase invisível. Roda a boleadeira (a faixa avisa) e joga: se pega,
//     prende as pernas por um tempo. O dash passa por dentro.
//   · Oficial de adaga (do 7) e carabineiro imperial (do 8): o carabineiro atira de longe, com a linha de mira avisando, e
//     depois leva tempo recarregando: é a hora de chegar perto.
//   · Lanceiro a cavalo (do 10) e tropilha fantasma (10 a 12): os cavalos atravessam a estrada a galope, a poeira avisa antes.
// Os bichos deixam couro cru e os imperiais, ferro imperial: é o material das melhorias da lança (pampa-progresso.js).
'use strict';

Object.assign(CAVE_BEASTS, {
  graxaim: { name: 'Graxaim', hp: 120, speed: 255, dmg: 14, r: 22, cash: [2, 5], from: 999, weight: 0 },
  batedor: { name: 'Batedor do Moringue', hp: 220, speed: 200, dmg: 17, r: 24, cash: [6, 12], from: 999, weight: 0 },
  carabineiro: { name: 'Carabineiro imperial', hp: 240, speed: 130, dmg: 24, r: 24, cash: [6, 12], from: 999, weight: 0 }
});
Object.assign(BAG_RAW, { ferro_imperial: { name: 'Ferro imperial', icon: '⚙️', value: 5, note: 'Fivela, bocal e pedaço de carabina dos imperiais do pampa. O seu Zeferino usa pra afiar o fio de campanha.' } });
Object.assign(ILHA_LOOKS, {
  batedor: { look: { skin: '#b8875e', hair: '#1a1410', style: 'long', mustache: true, hat: 'brim', hatColor: '#2a241c', shirt: '#6a5a40', pants: '#4a4030', boots: '#2a1a10', lenco: '#2a3a6a' }, tint: 'rgba(120,150,180,.12)' },
  carabineiro: { look: { skin: '#d8c0a8', hair: '#2a1a10', style: 'short', mustache: true, hat: 'bicorne', coat: '#22305a', shirt: '#e8e0d0', pants: '#d8d0bc', boots: '#141010', sash: '#b02a2a' }, tint: 'rgba(130,180,230,.22)' }
});
// Quem anda em cada trecho: bicho primeiro, depois a água, depois os homens do Moringue, por fim a cavalaria.
const PAMPA_MOBS = {
  2: [['graxaim', 4], ['graxaim', 3], ['teiu', 2]],
  3: [['graxaim', 4], ['graxaim', 4], ['graxaim', 3], ['teiu', 3]],
  4: [['teiu', 3], ['afogado', 5], ['graxaim', 4], ['graxaim', 3], ['batedor', 2]],
  5: [['afogado', 6], ['batedor', 3], ['teiu', 3], ['graxaim', 5], ['graxaim', 4]],
  6: [['afogado', 4], ['batedor', 2], ['graxaim', 3]],
  7: [['batedor', 5], ['oficialAdaga', 2], ['teiu', 3], ['graxaim', 5], ['graxaim', 4]],
  8: [['carabineiro', 3], ['batedor', 4], ['oficialAdaga', 3], ['teiu', 2], ['graxaim', 4]],
  9: [['carabineiro', 2], ['oficialAdaga', 2], ['graxaim', 5], ['batedor', 2]],
  10: [['carabineiro', 4], ['oficialAdaga', 4], ['lanceiroMontado', 2], ['graxaim', 5], ['batedor', 3]],
  11: [['carabineiro', 5], ['oficialAdaga', 4], ['lanceiroMontado', 3], ['batedor', 4], ['graxaim', 4]],
  12: [['carabineiro', 3], ['oficialAdaga', 2], ['lanceiroMontado', 2]],
  13: [['carabineiro', 5], ['oficialAdaga', 5], ['lanceiroMontado', 4], ['batedor', 4], ['graxaim', 5]],
  14: [['carabineiro', 6], ['oficialAdaga', 5], ['lanceiroMontado', 5], ['batedor', 5], ['graxaim', 6], ['graxaim', 5]],
  15: [['carabineiro', 4], ['batedor', 3], ['lanceiroMontado', 2], ['oficialAdaga', 2]]
};
const PAMPA_TROPILHA = [10, 11, 12];
// Quanto mais fundo, mais vida e mais pancada. No fim do pampa, o bicho comum aguenta o dobro e bate uma vez e meia.
function pampaForca(n = pampaArea()) { return { hp: 1 + Math.max(0, n - 2) * .11, dmg: 1 + Math.max(0, n - 2) * .08 }; }
function pampaKey() { return 'pampa:' + pampaArea() + ':' + G.day; }
function pampaMortos(n) { const st = pampaState(); if (st.mortos?.day !== G.day) st.mortos = { day: G.day }; return st.mortos[n] ??= []; }
function pampaSeguro(x, y) { const L = pampaLayout(); if (L.n === 1) return true; const c = L.camp; return !!c && ((x - c.x) / (c.rx * 1.05)) ** 2 + ((y - c.y) / (c.ry * 1.05)) ** 2 < 1; }
function pampaNota(p, d, r) { return !pampaSeguro(p.x, p.y) && d < r * mataNoticeMul(); }
// Onde o bicho não nasce: na chegada, perto do fogo e no campo do chefe.
function pampaLugarLivre(L, x, y) {
  if (y < 420 || !WORLD_MAPS.pampa.canWalk(x, y)) return false;
  const c = L.camp; if (c && Math.hypot((x - c.x) / (c.rx + 200), (y - c.y) / (c.ry + 200)) < 1) return false;
  const a = L.palco; return !(a && Math.hypot((x - a.x) / (a.rx + 120), (y - a.y) / (a.ry + 120)) < 1);
}
// O afogado sai da beira da água: nasce em terra firme, colado numa poça.
function pampaBeiraPoca(L, R) {
  for (let k = 0; k < 30; k++) { const q = L.pocas[Math.floor(R() * L.pocas.length)]; if (!q) return null; const a = R() * Math.PI * 2, x = q.x + Math.cos(a) * (q.rx + 26), y = q.y + Math.sin(a) * (q.ry + 20); if (pampaLugarLivre(L, x, y)) return { x, y }; }
  return null;
}
function pampaBeastsStart() {
  const n = pampaArea(), L = pampaLayout(n), R = caveRand(n * 173 + G.day * 11), dead = pampaMortos(n), beasts = [], F = pampaForca(n);
  for (const [kind, q] of PAMPA_MOBS[n] || []) {
    const extra = { hpMul: F.hp * (kind === 'teiu' ? 3 : 1) };
    if (kind === 'afogado') { for (let k = 0; k < q; k++) { const at = pampaBeiraPoca(L, R); if (at) beasts.push(ilhaMob(kind, at, R, extra)); } continue; }
    // Na estrada ou, de vez em quando, guardando um bolsão. Bando é uma turma só; os outros ficam espalhados.
    const uma = () => {
      for (let k = 0; k < 60; k++) {
        const b = L.bolsoes.length && R() < .28 ? L.bolsoes[Math.floor(R() * L.bolsoes.length)] : null, p = b ? [b.x, b.y] : L.pts[Math.floor(R() * L.pts.length)], x = p[0] + (R() - .5) * (b ? b.rx : PAMPA.meia), y = p[1] + (R() - .5) * (b ? b.ry : 60);
        if (pampaLugarLivre(L, x, y)) return { x, y };
      }
      return null;
    };
    if (kind === 'graxaim') { const at = uma(); if (!at) continue; for (let k = 0; k < q; k++) { const a = k / q * Math.PI * 2, x = at.x + Math.cos(a) * 80, y = at.y + Math.sin(a) * 50; beasts.push(ilhaMob(kind, WORLD_MAPS.pampa.canWalk(x, y) ? { x, y } : at, R, extra)); } }
    else for (let k = 0; k < q; k++) { const at = uma(); if (at) beasts.push(ilhaMob(kind, at, R, extra)); }
  }
  beasts.forEach((b, i) => { b.idx = i; if (dead.includes(i)) b.hp = 0; });
  mataNight = { day: G.day, key: pampaKey(), pampa: n, beasts, drops: [], herds: [], shots: [], ish: [], bolas: [], lancas: [], aliados: [], soltos: [], cd: 0, inv: 0, hurt: 0, swing: null, preso: 0, lacoCd: 0, rope: null, tropT: 5 + R() * 5, trop: null };
}
// Sons e rastros de quem está por perto: cada inimigo se anuncia antes de chegar.
function pampaSomDoBicho(b, dt, p) {
  const d = Math.hypot(b.x - p.x, b.y - p.y); if (d > 1100) return; const perto = clamp(1.15 - d / 1000, .15, 1);
  b.somT = (b.somT ?? Math.random() * .4) - dt;
  if (b.montado) {
    const galope = ['carga', 'ronda', 'curva', 'aproxima'].includes(b.state); if (galope && b.somT <= 0) { b.somT = b.state === 'carga' ? .17 : .3; AudioEngine.tropel?.(.05 * perto); }
    if (b.carga && Math.random() < dt * 22) fxPuffs(b.x - (b.vx || 0) * 60, b.y, 1, 30, '#b8a880');
    if (b.state !== b.somEstado && b.state === 'mira') { AudioEngine.neigh?.(.05 * perto); AudioEngine.clarim?.(.022 * perto); }
  } else if (b.kind === 'batedor' && b.state === 'mira' && b.somT <= 0) { b.somT = .18; AudioEngine.boleadeira?.(.05 * perto); }
  else if (b.kind === 'carabineiro' && b.state === 'recarrega' && b.somT <= 0) { b.somT = .75; AudioEngine.vareta?.(.05 * perto); }
  else if (b.kind === 'carabineiro' && b.state === 'aim' && b.state !== b.somEstado) AudioEngine.clinkMetal?.(.03 * perto);
  else if (b.kind === 'oficialAdaga' && b.state === 'windup' && b.state !== b.somEstado) { AudioEngine.clinkMetal?.(.05 * perto); fxStars(b.x + (b.dx < 0 ? -18 : 18), b.y - 60, 1); }
  else if (b.kind === 'graxaim' && b.state === 'windup' && b.state !== b.somEstado) AudioEngine.rosnado?.(.04 * perto);
  else if (b.kind === 'afogado') { if (b.state === 'rise' && b.state !== b.somEstado) { AudioEngine.splash?.(.08 * perto); fxPuffs(b.x, b.y, 8, 70, '#a8d8d0'); } else if (b.state === 'submerso' && b.somT <= 0 && d < 500) { b.somT = 1.6 + Math.random() * 2; AudioEngine.bloop?.(180 + Math.random() * 90, .02 * perto); } else if (b.state === 'grab' && b.somT <= 0) { b.somT = .45; AudioEngine.bloop?.(150, .05); } }
  else if (b.kind === 'lanceiroMontado' && b.state === 'windup' && b.state !== b.somEstado) AudioEngine.clinkMetal?.(.04 * perto);
  b.somEstado = b.state;
}
function pampaDeixa(b) {
  const q = b.minion ? .25 : 1;
  if (['graxaim', 'teiu'].includes(b.kind) && Math.random() < .4 * q) { bagAdd('couro_cru', 1); effect('+1 couro cru', b.x, b.y - 120, '#e8d8b0', 15); }
  if (['batedor', 'carabineiro', 'oficialAdaga', 'lanceiroMontado'].includes(b.kind)) pampaFerro(b, q);
}
function pampaMorteFx(b) {
  const homem = ['batedor', 'carabineiro', 'oficialAdaga', 'lanceiroMontado'].includes(b.kind);
  fxPuffs(b.x, b.y - 30, homem ? 12 : 8, 110, b.kind === 'afogado' ? '#8ac8c0' : homem ? '#a8aebc' : '#a89878');
  if (homem) AudioEngine.clinkMetal?.(.04); if (b.kind === 'afogado') AudioEngine.splash?.(.07);
  if (typeof golpeTreme !== 'undefined') golpeTreme = Math.max(golpeTreme, homem ? .12 : .08);
}

// ---------- Graxaim ----------
function graxaimTick(b, dt, p) {
  const B = CAVE_BEASTS.graxaim, { dx, dy, d } = ilhaDist(b, p); ilhaTick0(b, dt);
  if (b.state === 'roam') { if (pampaNota(p, d, 430)) { b.state = 'cerca'; b.ang = Math.atan2(-dy, -dx); AudioEngine.caveCry?.('graxaim'); return; } ilhaRoam(b, dt, 70); return; }
  if (pampaSeguro(p.x, p.y) || d > 820) { b.state = 'roam'; b.tx = b.home.x; b.ty = b.home.y; return; }
  if (b.state === 'cerca') {
    b.ang = (b.ang ?? 0) + dt * ((b.idx || 0) % 2 ? .9 : -.9); mataGo(b, { x: p.x + Math.cos(b.ang) * 200, y: p.y + Math.sin(b.ang) * 140 }, B.speed, dt); b.dx = dx < 0 ? -1 : 1;
    if (b.cool <= 0 && d < 320) { b.state = 'windup'; b.t = .4; b.vx = dx / d; b.vy = dy / d; }
  } else if (b.state === 'windup') { b.dx = b.vx < 0 ? -1 : 1; if (b.t <= 0) { b.state = 'lunge'; b.t = .3; AudioEngine.swoosh?.(.04); } }
  else if (b.state === 'lunge') {
    if (!mataStep(b, b.vx * 660, b.vy * 660, dt)) b.t = 0;
    if (b.attack <= 0 && Math.hypot(p.x - b.x, p.y - b.y) < B.r + 30) { mataHurt(B.dmg, b); b.attack = .5; }
    if (b.t <= 0) { b.state = 'foge'; b.t = .7; }
  } else if (b.state === 'foge') { mataStep(b, -dx / d * B.speed, -dy / d * B.speed, dt); b.dx = dx < 0 ? 1 : -1; if (b.t <= 0) { b.state = 'cerca'; b.cool = 1.6 + Math.random() * 1.4; } }
  else b.state = 'cerca';
}
function graxaimWarn(b) { if (b.state === 'windup') teleLane(b.x, b.y - 14, Math.atan2(b.vy, b.vx), 190, 40, teleK(b.t, .4), '255,110,60', .55); }
function drawGraxaim(b) {
  const s = b.dx < 0 ? -1 : 1, an = ['cerca', 'lunge', 'foge'].includes(b.state) || b.moving, ph = an ? frameClock * 16 + (b.idx || 0) : 0, baixa = b.state === 'windup' ? 6 : 0;
  ellipse(b.x, b.y + 2, 36, 7, 'rgba(14,16,8,.3)');
  ctx.save(); ctx.translate(b.x, b.y + baixa * .3); ctx.scale(s, 1); ctx.globalAlpha = b.hurt > 0 ? .6 : 1; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // As patas, o rabo cheio de ponta preta, o corpo cinza e a cabeça de focinho fino.
  ctx.strokeStyle = '#6e5a42'; ctx.lineWidth = 5; for (const [x, f] of [[-20, 0], [-11, 2], [15, 1], [24, 3]]) { const o = an ? Math.sin(ph + f * 1.6) * 7 : 0; ctx.beginPath(); ctx.moveTo(x, -22); ctx.lineTo(x + o, -1); ctx.stroke(); }
  ctx.fillStyle = '#7e7768'; ctx.strokeStyle = '#2e2a22'; ctx.lineWidth = 1.5; const ab = Math.sin(frameClock * 5 + b.x) * 3;
  ctx.beginPath(); ctx.moveTo(-28, -30); ctx.quadraticCurveTo(-52, -36 + ab, -66, -22 + ab); ctx.quadraticCurveTo(-52, -16 + ab, -28, -22); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#26221c'; ctx.beginPath(); ctx.moveTo(-54, -29 + ab); ctx.quadraticCurveTo(-62, -29 + ab, -66, -22 + ab); ctx.quadraticCurveTo(-60, -19 + ab, -53, -20 + ab); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8f8a7c'; ctx.beginPath(); ctx.ellipse(-2, -30, 32, 14, -.04, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#5e5a50'; ctx.beginPath(); ctx.ellipse(-4, -39, 25, 5, -.04, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#c8bfa8'; ctx.beginPath(); ctx.ellipse(2, -21, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8f8a7c'; ctx.beginPath(); ctx.moveTo(22, -40 + baixa); ctx.quadraticCurveTo(38, -50 + baixa, 52, -36 + baixa); ctx.lineTo(62, -30 + baixa); ctx.lineTo(50, -24 + baixa); ctx.quadraticCurveTo(34, -24 + baixa, 22, -28 + baixa); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#a06a3a'; for (const x of [32, 42]) { ctx.beginPath(); ctx.moveTo(x, -44 + baixa); ctx.lineTo(x + 3, -58 + baixa); ctx.lineTo(x + 9, -44 + baixa); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ellipse(62, -30 + baixa, 2.6, 2.2, '#14110c'); ellipse(44, -36 + baixa, 2.2, 2, b.state === 'windup' ? '#ffb040' : '#1a1610');
  ctx.restore(); mataHpBar(b, 'Graxaim', 82);
}

// ---------- Batedor do Moringue ----------
function batedorTick(b, dt, p, N) {
  const B = CAVE_BEASTS.batedor, { dx, dy, d } = ilhaDist(b, p); ilhaTick0(b, dt);
  if (b.state === 'roam') b.state = 'oculto';
  if (b.state === 'oculto') { if (pampaNota(p, d, 450)) { b.state = 'mira'; b.t = .9; b.vx = dx / d; b.vy = dy / d; b.dx = dx < 0 ? -1 : 1; AudioEngine.caveCry?.('batedor'); AudioEngine.swoosh?.(.03); } return; }
  if (pampaSeguro(p.x, p.y) || d > 900) { b.state = 'oculto'; b.t = 1; return; }
  if (b.state === 'mira') {
    b.dx = dx < 0 ? -1 : 1; b.vx = dx / d; b.vy = dy / d; // Segue o Sadi até o último instante: quem desvia é na hora do arremesso.
    if (b.t <= 0) { N.bolas.push({ x: b.x, y: b.y - 90, vx: b.vx * 720, vy: b.vy * 720, t: 1, gira: 0 }); AudioEngine.swoosh?.(.07); b.state = 'corre'; b.t = 2 + Math.random(); b.cool = 3 + Math.random(); b.side = Math.random() < .5 ? -1 : 1; }
  } else if (b.state === 'corre') {
    const want = d < 330 ? -1 : d > 560 ? 1 : 0; b.dx = dx < 0 ? -1 : 1;
    if (!mataStep(b, (dx / d * want - dy / d * b.side * .8) * B.speed, (dy / d * want + dx / d * b.side * .8) * B.speed, dt)) b.side = -b.side;
    if (d < 120 && b.attack <= 0) { mataHurt(B.dmg, b); b.attack = 1; effect('Adaga!', p.x, p.y - 150, '#ffd08a', 16); }
    if (b.t <= 0 && b.cool <= 0) { b.state = d < 560 ? 'mira' : 'oculto'; b.t = .9; }
  } else b.state = 'corre';
}
function batedorWarn(b) { if (b.state === 'mira') teleLane(b.x, b.y - 40, Math.atan2(b.vy, b.vx), 620, 46, teleK(b.t, .9), '255,190,70', .5); }
function drawBatedor(b) {
  const c = ilhaGhost('batedor', b.state === 'corre' ? Math.floor(b.frame * .7) % 4 : 0), s = b.dx < 0 ? -1 : 1, oculto = b.state === 'oculto';
  if (!oculto) ellipse(b.x, b.y + 3, 22, 6, 'rgba(10,14,8,.3)');
  ctx.save(); ctx.globalAlpha = oculto ? .16 : b.hurt > 0 ? .6 : 1; ctx.translate(b.x, b.y + (oculto ? 26 : 0)); ctx.scale(s * .9, .9); ctx.drawImage(c, -60, -220, 120, 230); ctx.restore();
  if (oculto) { worldSprite('frontier-flora', 1, b.x - 72, b.y - 122, 144, 122); return; }
  if (b.state === 'mira') { const a = frameClock * 22; for (let k = 0; k < 3; k++) { const q = a + k * 2.09, x = b.x + s * 16 + Math.cos(q) * 44, y = b.y - 142 + Math.sin(q) * 13; ctx.strokeStyle = '#3a2614'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x + s * 16, b.y - 142); ctx.lineTo(x, y); ctx.stroke(); ellipse(x, y, 5.4, 5.4, '#6a6258'); } }
  mataHpBar(b, 'Batedor', 165);
}

// ---------- Carabineiro imperial ----------
function carabineiroTick(b, dt, p) {
  const B = CAVE_BEASTS.carabineiro, { dx, dy, d } = ilhaDist(b, p); ilhaTick0(b, dt); b.flash = Math.max(0, (b.flash || 0) - dt); if (b.shot && (b.shot.t -= dt) <= 0) b.shot = null;
  if (pampaSeguro(p.x, p.y) && b.state !== 'roam') { b.state = 'roam'; b.tx = b.home.x; b.ty = b.home.y; }
  if (b.state === 'roam') { if (pampaNota(p, d, 560)) { b.state = 'chase'; b.cool = .7; AudioEngine.caveCry?.('carabineiro'); return; } ilhaRoam(b, dt, 45); return; }
  if (b.state === 'chase') {
    if (d > 980) { b.state = 'roam'; b.tx = b.home.x; b.ty = b.home.y; return; }
    b.dx = dx < 0 ? -1 : 1; const want = d > 620 ? 1 : d < 300 ? -1 : 0, side = b.side ??= (Math.random() < .5 ? -1 : 1);
    if (!mataStep(b, (dx / d * want - dy / d * side * .3) * B.speed, (dy / d * want + dx / d * side * .3) * B.speed, dt)) b.side = -side;
    if (b.cool <= 0 && d < 780) { b.state = 'aim'; b.t = .9; b.ax = p.x; b.ay = p.y - 30; AudioEngine.note?.(200, .06, 'square', .02); }
  } else if (b.state === 'aim') {
    b.dx = b.ax < b.x ? -1 : 1;
    if (b.t <= 0) {
      const g = carabineiroCano(b), ang = Math.atan2(b.ay - g.y, b.ax - g.x), ux = Math.cos(ang), uy = Math.sin(ang), px = p.x - g.x, py = p.y - 30 - g.y, along = px * ux + py * uy, off = Math.abs(px * uy - py * ux);
      if (along > 0 && along < 940 && off < 34) mataHurt(B.dmg, b);
      b.flash = .12; b.shot = { x0: g.x, y0: g.y, x1: g.x + ux * 940, y1: g.y + uy * 940, t: .16 }; AudioEngine.gunshot?.(.42, .9);
      b.state = 'recarrega'; b.t = 2.6;
    }
  } else if (b.state === 'recarrega') { b.dx = dx < 0 ? -1 : 1; if (b.t <= 0) { b.state = 'chase'; b.cool = .3; } }
  else b.state = 'chase';
}
function carabineiroCano(b) { return { x: b.x + (b.dx < 0 ? -44 : 44), y: b.y - 74 }; }
function carabineiroWarn(b) {
  if (b.state === 'aim') { const g = carabineiroCano(b); teleLane(g.x, g.y, Math.atan2(b.ay - g.y, b.ax - g.x), 940, 40, teleK(b.t, .9), '255,80,60', .55); }
  if (b.shot) { ctx.save(); ctx.strokeStyle = `rgba(255,236,190,${b.shot.t * 5})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b.shot.x0, b.shot.y0); ctx.lineTo(b.shot.x1, b.shot.y1); ctx.stroke(); ctx.restore(); }
}
function drawCarabineiro(b) {
  const c = ilhaGhost('carabineiro', b.moving ? Math.floor(b.frame * .7) % 4 : 0), s = b.dx < 0 ? -1 : 1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; if (b.flash > 0) { const g = carabineiroCano(b); glow(g.x + s * 16, g.y, 44, .85, '255,220,140'); } ctx.restore();
  ellipse(b.x, b.y + 3, 22, 6, 'rgba(10,14,8,.3)');
  ctx.save(); ctx.globalAlpha = b.hurt > 0 ? .6 : 1; ctx.translate(b.x, b.y); ctx.scale(s * .9, .9); ctx.drawImage(c, -60, -220, 120, 230);
  // A carabina: apontada na mira; no resto do tempo, atravessada no peito, com a vareta subindo e descendo enquanto recarrega.
  ctx.translate(18, -82); ctx.rotate(b.state === 'aim' ? Math.atan2(b.ay - (b.y - 74), Math.abs(b.ax - b.x)) : b.state === 'recarrega' ? -1.25 : -.5); rect(-16, -3, 24, 7, '#6a4426', 2, '#2e1e10'); rect(8, -2, 52, 4.5, '#3a3a40', 1);
  if (b.state === 'recarrega') { const v = Math.abs(Math.sin(b.t * 6)) * 18; rect(60 - v, -6, 26, 2.4, '#b8b8c0', 1); }
  ctx.restore(); mataHpBar(b, 'Carabineiro', 172);
}

// ---------- Tropilha fantasma (Campo dos Menezes) ----------
function pampaTropilhaTick(N, dt, p) {
  if (!PAMPA_TROPILHA.includes(N.pampa)) return; expansionImage('wild-horses-v1');
  if (!N.trop) {
    if (N.beasts.some(b => b.boss && b.hp > 0) || pampaSeguro(p.x, p.y)) return;
    if ((N.tropT -= dt) > 0) return;
    const dir = Math.random() < .5 ? -1 : 1; N.trop = { y: clamp(p.y + (Math.random() - .5) * 240, 160, PAMPA.H - 160), dir, aviso: 1.3, x: p.x - dir * 1300, cav: Array.from({ length: 7 }, (_, k) => ({ o: k * 125 + Math.random() * 40, dy: (k % 3 - 1) * 42 + (Math.random() - .5) * 14, coat: k % 3 })) }; AudioEngine.hooves?.(8); return;
  }
  const T = N.trop; if (T.aviso > 0) { T.aviso -= dt; return; }
  T.x += T.dir * 1500 * dt;
  for (const c of T.cav) { const x = T.x - T.dir * c.o, y = T.y + c.dy; if (Math.abs(x - p.x) < 82 && Math.abs(y - p.y) < 46) { mataHurt(18, { x, y }); break; } }
  if ((T.x - T.dir * 900 - p.x) * T.dir > 1400) { N.trop = null; N.tropT = 9 + Math.random() * 6; }
}
function drawPampaTropilha(N, seen, layers) {
  const T = N.trop; if (!T || T.aviso > 0) return;
  for (const c of T.cav) { const x = T.x - T.dir * c.o, y = T.y + c.dy; if (!seen(x, y, 220)) continue; layers.push({ y, draw: () => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 60, 110, .24, '150,195,255'); ctx.restore();
    ctx.save(); ctx.globalAlpha = .62; expansionSprite('wild-horses-v1', c.coat * 4 + 1 + Math.floor(frameClock * 12 + c.o) % 3, x, y + 4, 150, T.dir < 0); ctx.restore();
    ctx.save(); ctx.globalAlpha = .2; ellipse(x - T.dir * 70, y, 60, 13, '#d8ccac'); ctx.restore();
  } }); }
}

// ---------- Ligações ----------
Object.assign(ILHA_MOBS, {
  graxaim: { tick: graxaimTick, draw: drawGraxaim, warn: graxaimWarn, xp: 4, cry(dead) { this.caveVoice?.(dead ? [640, 420, 260] : [760, 980, 700], dead ? .5 : .28, { type: 'triangle', formant: 1200, q: 1.6, vol: .035, vib: 8, rate: 9 }); } },
  batedor: { tick: batedorTick, draw: drawBatedor, warn: batedorWarn, xp: 8, cry(dead) { if (dead) this.caveVoice?.([210, 150, 90], .7, { formant: 650, q: 1.4, vol: .05, vib: 6, rate: 5 }); else this.caveVoice?.([190, 240], .2, { formant: 800, q: 1.6, vol: .035, vib: 6, rate: 7 }); } },
  carabineiro: { tick: carabineiroTick, draw: drawCarabineiro, warn: carabineiroWarn, xp: 8, cry(dead) { if (dead) this.caveVoice?.([210, 150, 90], .7, { formant: 650, q: 1.4, vol: .05, vib: 6, rate: 5 }); else this.caveVoice?.([170, 220, 160], .22, { formant: 750, q: 1.6, vol: .04, vib: 8, rate: 7 }); } }
});
function pampaFerro(b, q = 1) { if (Math.random() < .5 * q) { bagAdd('ferro_imperial', 1); effect('+1 ferro imperial', b.x, b.y - 120, '#e0e8f0', 15); } }
// A boleadeira no ar, o laço, o Sadi preso e o que os chefes acrescentam a cada quadro (pampa-chefes.js).
function pampaChefesTick() {}
function pampaChefesDraw() {}
function pampaExtras(N, dt, p) {
  N.preso = Math.max(0, N.preso - dt); N.lacoCd = Math.max(0, N.lacoCd - dt); if (N.rope && (N.rope.t -= dt) <= 0) N.rope = null;
  for (const b of N.beasts) if (b.hp > 0) pampaSomDoBicho(b, dt, p);
  const g = N.grab; if (g) { if (g.hp <= 0 || g.state !== 'grab') N.grab = null; else { const k = Math.min(1, dt * 10); p.x += (g.x + (g.dx < 0 ? -30 : 30) - p.x) * k; p.y += (g.y + 4 - p.y) * k; } }
  for (const s of N.bolas) {
    s.t -= dt; s.gira += dt * 18; s.x += s.vx * dt; s.y += s.vy * dt;
    if (Math.hypot(p.x - s.x, p.y - 70 - s.y) < 46 && !worldDash) { s.t = 0; N.preso = 1.4; N.inv = 0; mataHurt(CAVE_BEASTS.batedor.dmg, { x: s.x, y: s.y + 70 }); effect('A boleadeira prendeu as pernas!', p.x, p.y - 170, '#ffd08a', 16); AudioEngine.ropeHit?.(); }
  }
  N.bolas = N.bolas.filter(s => s.t > 0);
  pampaTropilhaTick(N, dt, p); pampaChefesTick(N, dt, p);
}
function drawPampaTiros(N) {
  for (const s of N.bolas) { for (let k = 0; k < 3; k++) { const a = s.gira + k * 2.09, x = s.x + Math.cos(a) * 26, y = s.y + Math.sin(a) * 12; ctx.strokeStyle = '#3a2614'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(x, y); ctx.stroke(); ellipse(x, y, 6, 6, '#6a6258'); } }
  if (N.preso > 0) { const p = worldOut; ctx.strokeStyle = '#4a3218'; ctx.lineWidth = 3; for (const y of [-22, -34]) { ctx.beginPath(); ctx.ellipse(p.x, p.y + y, 20, 6, 0, 0, Math.PI * 2); ctx.stroke(); } for (const [x, y] of [[-16, -24], [14, -34]]) ellipse(p.x + x, p.y + y, 5, 5, '#6a6258'); }
  pampaChefesDraw(N);
}
function pampaTop() {
  const N = mataNight; if (!N?.pampa || scene || !mataCombatOn()) return;
  for (const b of N.beasts) if (b.hp > 0) ILHA_MOBS[b.kind]?.warn?.(b, N);
  const T = N.trop; if (T && T.aviso > 0) { const p = worldOut; teleLane(p.x - 1500, T.y - 20, 0, 3000, 130, teleK(T.aviso, 1.3), '190,220,255', .42); }
  drawMataWarnings();
  if (N.hurt > 0) { ctx.fillStyle = `rgba(200,30,20,${N.hurt * .8})`; ctx.fillRect(worldOut.x - 3000, worldOut.y - 3000, 6000, 6000); }
  const left = N.beasts.filter(b => b.hp > 0 && !b.minion).length, seguro = pampaSeguro(worldOut.x, worldOut.y);
  mataHudPanel(PAMPA_AREAS[N.pampa].regiao + ' · trecho ' + N.pampa + ' de ' + PAMPA.last, seguro ? 'perto do fogo, ninguém chega' : left ? left + (left === 1 ? ' inimigo por perto' : ' inimigos por perto') : 'tudo limpo por hoje');
  const boss = N.beasts.find(b => b.boss && b.hp > 0); if (boss) { ilhaBossBar(boss); if (typeof pampaChefeHud === 'function') pampaChefeHud(N, boss); }
  if (typeof pampaFirmeAviso === 'function') pampaFirmeAviso(N);
}
{
  // O ferro imperial é o minério de ferro, na cor fria das casacas.
  const bi = bagIcon; bagIcon = function (k) { return k === 'ferro_imperial' ? `<span style="display:inline-flex;filter:hue-rotate(190deg) saturate(1.5)">${bi('ferro')}</span>` : bi(k); };
  const image = itemImageForSize; itemImageForSize = function (key, pixels) { return image(key === 'ferro_imperial' ? 'ferro' : key, pixels); };
  const here = mataHere; mataHere = function () { return here() || pampaAqui(); };
  const combatOn = mataCombatOn; mataCombatOn = function () { if (pampaAqui()) return pampaArea() >= 2 && !prologueActive(); return combatOn(); };
  const start = mataNightStart; mataNightStart = function () { if (pampaAqui()) { pampaBeastsStart(); return; } start(); };
  const combat = mataCombatTick; mataCombatTick = function (dt) {
    if (pampaAqui()) { if (mataNight && mataNight.key !== pampaKey()) mataNight = null; } else if (mataNight?.pampa) mataNight = null;
    if (mataNight?.pampa && mataNight.hitstop > 0) { mataNight.hitstop -= dt; return; }
    combat(dt); const N = mataNight;
    if (N?.pampa && !paused && !modal && !scene && !N.faint && !phoneOpen && !worldTalkOpen()) pampaExtras(N, dt, worldOut);
  };
  // Perto do fogo, ninguém acerta o Sadi.
  const hurt = mataHurt; mataHurt = function (dmg, from) { if (!pampaAqui()) return hurt(dmg, from); if (pampaSeguro(worldOut.x, worldOut.y)) return; return hurt(from?.boss ? dmg : Math.round(dmg * pampaForca().dmg), from); };
  const kill = mataKill; mataKill = function (b) {
    kill(b); const N = mataNight, mob = ILHA_MOBS[b.kind]; if (!N?.pampa) return;
    if (b.idx != null) pampaMortos(N.pampa).push(b.idx); mataXP(mob?.xp || 6); pampaMorteFx(b);
    if (!b.boss) pampaDeixa(b);
    if (!b.minion && !b.boss && Math.random() < .4) N.drops.push({ x: b.x, y: b.y, q: 6 + Math.floor(Math.random() * 9) });
    mob?.onKill?.(b, N);
  };
  // Perto do fogo, o bicho comum volta pra casa (o teiú é da mata e não sabe disso sozinho).
  const beast = mataBeastTick; mataBeastTick = function (b, dt, p) { if (mataNight?.pampa && b.kind === 'teiu' && pampaSeguro(p.x, p.y)) { b.state = 'roam'; b.hurt = Math.max(0, b.hurt - dt); return; } return beast(b, dt, p); };
  const safe = ilhaSafeNow; ilhaSafeNow = function (p) { return pampaAqui() ? pampaSeguro(p.x, p.y) : safe(p); };
  // Desmaiou: acorda no último fogo aceso (ou na porteira, se ainda não acendeu nenhum).
  const faint = mataFaint; mataFaint = function () {
    if (!pampaAqui()) return faint();
    const N = mataNight; if (!N || N.faint || mataDefeatActive()) return;
    desmaioComTela(() => { N.faint = true; keys.clear();
    const lost = Math.min(80, Math.round(G.cash * .1)), st = pampaState(), f = PAMPA_FOGOS.find(q => q.id === st.ultimoFogo) || PAMPA_FOGOS[0]; G.cash = round(G.cash - lost); caveState().hp = caveMaxHp(); mataBuffs.veneno = 0; AudioEngine.caveFaintSound?.(); save();
    mataNight = null; const P = ilhaFogoPartes(pampaLayout(f.n).camp); switchMap({ map: 'pampa', n: f.n, x: P.fogo.x + 90, y: P.fogo.y + 60, title: f.nome });
    talk([['card', `<b>😵 Desmaiou no pampa</b><br>Acordou perto do ${f.nome}, com a cabeça doendo e o bolso mais leve (−${money(lost)}). Um peão que passava te trouxe no lombo do cavalo.`, 'Pampa']], null, 'Levantar'); });
  };
  // No pampa o Sadi anda a pé, como na mata e na ilha: entre as taipas, cavalo só atrapalha.
  const mounted = playerMounted; playerMounted = function () { return pampaAqui() ? false : mounted(); };
  // Preso pela boleadeira: não anda até soltar (ou até o dash arrebentar).
  const tick = outsideTick; outsideTick = function (dt) { const N = mataNight; if (!N?.pampa || !(N.preso > 0) || worldDash || scene || modal || !pampaAqui()) return tick(dt); const k = [...keys]; keys.clear(); try { return tick(dt); } finally { k.forEach(x => keys.add(x)); } };
  const M = WORLD_MAPS.pampa, draw = M.draw;
  M.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers);
    const N = mataNight; if (!mataCombatOn() || scene || !N?.pampa) return;
    drawMataNightLayers(layers, seen); drawPampaTropilha(N, seen, layers); layers.push({ y: 7e6, draw: () => drawPampaTiros(N) });
  };
  const sparks = drawSparks; drawSparks = function (map = null) { sparks(map); if (map === worldOut?.map && pampaAqui()) pampaTop(); };
}
