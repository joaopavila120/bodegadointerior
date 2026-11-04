// O chefe final da ilha: John Pascoe Grenfell, inglês a serviço da Marinha do Império. Em 1836 encurralou o Bento na
// Ilha do Fanfa; na Cisplatina, perdeu um braço (a cerração devolveu). Espera no pátio da fortaleza o Sadi que vem atrás
// do Bento; vencido, some na cerração e deixa cair a chave da cripta (a cena da chave fica em ilha-resgate.js).
// Os canhões da muralha da frente apontam pra dentro do pátio: é de lá que vêm as balas.
//   · Fase 1, no pátio: dá ordens aos gritos. "Fogo!" faz os canhões da muralha atirarem (círculos no chão: sai com o
//     dash) e "Abordagem!" chama uma leva de marinheiros. De perto, estocada de sabre (a faixa vermelha avisa).
//   · Fase 2, na muralha (abaixo de 70% da vida): sobe na ronda da muralha da frente. Lá em cima, o facão não alcança,
//     bala e pedra batem na ameia e a bomba não chega: só o arpão do Griggs puxa ele de lá. Puxado, cai atordoado no
//     pátio, briga um pouco no chão e sobe de novo.
//   · Fase 3, a abordagem (abaixo de 35%): desce de vez. Joga o gancho (a faixa comprida): se pega, arrasta o Sadi e
//     corta. Faz guarda com o sabre (de frente, o facão não passa e ele revida): o arpão quebra a guarda.
'use strict';

CAVE_BEASTS.grenfell = { name: 'Almirante Grenfell', hp: 2600, speed: 185, dmg: 26, r: 34, cash: [0, 0], from: 999, weight: 0 };
const GRENFELL = {
  patio: { x0: 2480, x1: 3920, y0: 1170, y1: 1590 },
  // A ronda da muralha da frente: os pés ficam logo depois da muralha (pra desenhar por cima dela) e o corpo, lá em cima.
  muro: { y: FORT.y + FORT.h + 4, alto: 126, lados: [[2480, 3050], [3350, 3920]] },
  canhoes: [2600, 2900, 3500, 3800], porta: { x: 3225, y: 1150 }, saidas: [{ x: 2740, y: 1150 }, { x: 3750, y: 1140 }],
  fase2: .7, fase3: .35, bala: { r: 84, t: 1.15, dmg: 22 }, preso: 2.8, chao: 4.5, guarda: 1.6, gancho: { len: 560, w: 44, dmg: 24 }
};
function grenfellVivo() { return mataNight?.beasts?.find(b => b.kind === 'grenfell' && b.hp > 0) || null; }
function grenfellNoPatio(p) { return worldOut?.map === 'ilha' && p.x > FORT.x + FORT.t && p.x < FORT.x + FORT.w - FORT.t && p.y > 1110 && p.y < FORT.y + FORT.h - FORT.t; }
function grenfellSpeaker() { return { name: 'Almirante Grenfell', portrait: grenfellPortrait(72) }; }
function grenfellPortrait(size = 104) { const p = typeof historyPortrait === 'function' ? historyPortrait('mariath', size) : ''; return p ? `<span style="display:inline-flex;filter:${GRENFELL_FILTRO}">${p}</span>` : `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px">⚓</span>`; }
// O desenho do capitão Mariath, desbotado pela cerração: é uma alma, e não é o Mariath.
const GRENFELL_FILTRO = 'saturate(.45) brightness(1.2) contrast(1.05)';
function grenfellArte() {
  if (ACTION_ART.grenfell) return ACTION_ART.grenfell;
  const im = ACTION_ART.mariath; if (!im?.naturalWidth) return null;
  const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const g = c.getContext('2d');
  g.filter = GRENFELL_FILTRO; g.drawImage(im, 0, 0); g.filter = 'none'; g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(150,205,230,.28)'; g.fillRect(0, 0, c.width, c.height);
  c.naturalWidth = c.width; ACTION_ART_CROPS.grenfell = ACTION_ART_CROPS.mariath; return ACTION_ART.grenfell = c;
}
const GRENFELL_LOOK = { skin: '#d8c0a8', hair: '#c8c4bc', style: 'short', sideburns: true, mustache: true, hat: 'bicorne', coat: '#1e2a48', epaulettes: true, shirt: '#f0ece0', pants: '#efe8d8', boots: '#1a1410', item: 'sword' };

// ---------- A chegada ----------
function grenfellChega(N) {
  const st = ilhaState(); N.grenfell = true; N.canhoes = []; keys.clear(); st.grenfellViu = G.day;
  // Os marinheiros do pátio entram em forma: quem briga agora é o almirante (e as levas que ele chamar).
  for (const b of N.beasts) if (b.kind === 'marujo' && b.hp > 0 && b.x > FORT.x && b.x < FORT.x + FORT.w && b.y > FORT.y && b.y < FORT.y + FORT.h) { b.hp = 0; fxPuffs(b.x, b.y - 60, 6, 70, '#a8c8d8'); }
  N.beasts.push(ilhaMob('grenfell', GRENFELL.porta, Math.random, { boss: true, state: 'chase', base: 'chase', fase: 1, cool: 2, ordem: 2.5, dx: 1 }));
  AudioEngine.caveCry?.('grenfell'); save();
  const G0 = grenfellSpeaker();
  talk([['card', '<b>⚓ O almirante da fortaleza</b><br>Quando o Sadi entra no pátio, uma corneta toca. Na porta da comandância, um oficial de casaca azul e chapéu de dois bicos, com a cerração enrolada nas botas.', 'Pátio da fortaleza'],
    [G0, 'Então é este o gaúcho que anda atrás do Bento. John Pascoe Grenfell, almirante da Marinha do Império.'],
    [G0, 'Fui eu que encurralei o teu presidente na Ilha do Fanfa, em 1836. E o braço que a Cisplatina me levou, a cerração me devolveu.'],
    ['sadi', 'Pois agora o senhor vai me dizer pra onde levaram ele.'],
    [G0, 'Marinheiros! Aos canhões!'],
    ['card', '<b>⚓ Almirante Grenfell</b><br>· Círculo no chão: tiro de canhão da muralha. Sai de dentro (o dash, com Shift, ajuda).<br>· Quando ele sobe na muralha, o facão não alcança e a bala bate na ameia: <b>só o arpão do Griggs puxa ele lá de cima</b>.<br>· No fim, ele joga o gancho (a faixa comprida): sai da frente. Com o sabre em guarda, de frente o facão não passa; o arpão quebra a guarda.', 'Pátio da fortaleza']], null, 'Em guarda!');
}
function grenfellGrita(b, text) { effect(text, b.x, b.y - (b.alto || 0) - 190, '#e8f0ff', 22); AudioEngine.caveVoice?.([190, 240, 180], .4, { formant: 800, q: 1.5, vol: .05, vib: 5, rate: 6 }); }
function grenfellOrdem(b, N, p) {
  b.vez = (b.vez || 0) + 1; const minions = N.beasts.filter(x => x.minion && x.hp > 0).length;
  if (b.fase !== 2 && b.vez % 2 === 0 && minions < 3) {
    grenfellGrita(b, 'Abordagem!'); GRENFELL.saidas.forEach(at => N.beasts.push(ilhaMob('marujo', at, Math.random, { minion: true, state: 'chase' })));
    b.ordem = 4.5; return;
  }
  grenfellGrita(b, 'Fogo!'); grenfellCanhoes(N, p, b.fase === 2 ? 4 : b.fase === 3 ? 2 : 3); b.ordem = b.fase === 2 ? 2.6 : b.fase === 3 ? 6 : 4.2;
}
// Cada bala sai do canhão mais perto, na muralha da frente, e cai num círculo no pátio (o primeiro, em cima do Sadi).
function grenfellCanhoes(N, p, n) {
  const P = GRENFELL.patio;
  for (let k = 0; k < n; k++) {
    const x = clamp(k ? p.x + (Math.random() - .5) * 520 : p.x, P.x0, P.x1), y = clamp(k ? p.y + (Math.random() - .5) * 300 : p.y, P.y0, P.y1 + 20);
    const cx = GRENFELL.canhoes.reduce((a, c) => Math.abs(c - x) < Math.abs(a - x) ? c : a), t = GRENFELL.bala.t + k * .18;
    const muzzle = fortCannonPose(cx).muzzle;
    N.canhoes.push({ x, y, cx: muzzle.x, cy: muzzle.y, t, t0: t });
  }
}

// ---------- Como ele briga ----------
function grenfellArena(b) { const P = GRENFELL.patio; b.x = clamp(b.x, P.x0, P.x1); b.y = clamp(b.y, P.y0, P.y1); }
function grenfellEstocada(b, dx, dy, d, n) { b.state = 'windup'; b.t = b.t0 = n > 1 ? .4 : .55; b.vx = dx / d; b.vy = dy / d; b.combo = n - 1; }
function grenfellSalto(b, y1, a1, T, depois) { b.state = 'salto'; b.s = { y0: b.y, a0: b.alto || 0, y1, a1, t: 0, T, depois }; }
function grenfellSobe(b) { const lado = GRENFELL.muro.lados.find(([a, c]) => b.x >= a - 200 && b.x <= c + 200) || GRENFELL.muro.lados[0]; b.lado = lado; b.wx = clamp(b.x, lado[0], lado[1]); b.state = 'sobe'; b.t = 3; }
function grenfellFase(b, N, p) {
  b.ordem = Math.max(b.ordem, 3);
  if (b.fase === 2) {
    grenfellGrita(b, 'Às muralhas!'); b.base = 'chao'; grenfellSobe(b);
    if (!rangedOwned('arpao')) showBanner('O almirante subiu na muralha!', 'Lá em cima, nem facão nem bala alcança. Só o arpão do John Griggs, no trapiche, puxa ele de lá.', 'info', { world: true });
    else floatNote('Ele subiu na muralha: arpoa o almirante (R, com o arpão na mão; X troca de arma) pra puxar ele lá de cima.');
  } else {
    grenfellGrita(b, 'Ao sabre! Abordagem!'); b.base = 'chase'; b.cool = 1;
    if (b.alto) grenfellSalto(b, GRENFELL.patio.y1 - 20, 0, .5, 'chase'); else b.state = 'chase';
    GRENFELL.saidas.forEach(at => N.beasts.push(ilhaMob('marujo', at, Math.random, { minion: true, state: 'chase' })));
  }
}
// O arpão pegou nele lá em cima: cai no pátio, atordoado.
function grenfellPuxa(b) {
  if (!b.alto || b.state === 'salto') return; effect('Puxou o almirante da muralha!', b.x, b.y - b.alto - 170, '#e8d8a8', 18); AudioEngine.swoosh?.(.08);
  grenfellSalto(b, GRENFELL.patio.y1 - 20, 0, .45, 'caido');
}
function grenfellTick(b, dt, p, N) {
  const G0 = GRENFELL, B = CAVE_BEASTS.grenfell, { dx, dy, d } = ilhaDist(b, p); ilhaTick0(b, dt);
  b.ordem = (b.ordem ?? 3) - dt; b.dy = 0; if (b.hook && (b.hook.t -= dt) <= 0) b.hook = null;
  const fase = b.hp > b.max * G0.fase2 ? 1 : b.hp > b.max * G0.fase3 ? 2 : 3;
  if (fase > b.fase && b.state !== 'salto') { b.fase = fase; grenfellFase(b, N, p); }
  // O Sadi saiu do pátio: o almirante espera na porta da comandância.
  if (!grenfellNoPatio(p) && !b.alto && b.state !== 'salto') { mataGo(b, G0.porta, B.speed * .6, dt); b.state = b.base; return; }
  if (b.state === 'salto') {
    const s = b.s; s.t += dt; const k = Math.min(1, s.t / s.T); b.y = s.y0 + (s.y1 - s.y0) * k; b.alto = s.a0 + (s.a1 - s.a0) * k + Math.sin(Math.PI * k) * 46;
    if (k < 1) return; b.alto = s.a1; b.s = null;
    if (s.depois === 'caido') { b.state = 'chao'; b.chao = G0.chao; b.stun = G0.preso; b.cool = .6; fxPuffs(b.x, b.y, 14, 120, '#8a8070'); AudioEngine.thud?.(); effect('Caiu! Agora!', b.x, b.y - 190, '#ffe27a', 20); }
    else { b.state = s.depois; if (b.state === 'muralha') { b.cool = 1.2; b.ordem = Math.min(b.ordem, 1); } }
    return;
  }
  if (b.state === 'sobe') {
    const r = mataGo(b, { x: b.wx, y: G0.patio.y1 }, B.speed * 1.4, dt);
    if (r === true || r === 'blocked' || b.t <= 0) grenfellSalto(b, G0.muro.y, G0.muro.alto, .55, 'muralha');
    return;
  }
  if (b.state === 'muralha') {
    const [a, c] = b.lado || G0.muro.lados[0], tx = clamp(p.x + (b.ladoX ??= 1) * 200, a, c); b.dx = p.x < b.x ? -1 : 1;
    if (Math.abs(tx - b.x) > 6) b.x += Math.sign(tx - b.x) * Math.min(B.speed * .5 * dt, Math.abs(tx - b.x));
    if (Math.random() < dt * .25) b.ladoX = -b.ladoX;
    if (b.ordem <= 0) grenfellOrdem(b, N, p);
    else if (b.cool <= 0) { b.state = 'mira'; b.t = .8; b.ax = p.x; b.ay = p.y - 30; AudioEngine.note?.(220, .06, 'square', .02); }
    return;
  }
  if (b.state === 'mira') {
    b.dx = b.ax < b.x ? -1 : 1;
    if (b.t <= 0) {
      const g = grenfellArma(b), ang = Math.atan2(b.ay - g.y, b.ax - g.x), ux = Math.cos(ang), uy = Math.sin(ang), px = p.x - g.x, py = p.y - 30 - g.y, along = px * ux + py * uy, off = Math.abs(px * uy - py * ux);
      if (along > 0 && along < 820 && off < 34) mataHurt(16, b);
      b.shot = { x0: g.x, y0: g.y, x1: g.x + ux * 820, y1: g.y + uy * 820, t: .16 }; AudioEngine.gunshot?.(.4, 1.1); b.state = 'muralha'; b.cool = 2 + Math.random();
    }
    return;
  }
  if (b.state === 'chase' || b.state === 'chao') {
    if (b.state === 'chao' && (b.chao -= dt) <= 0 && b.fase === 2) { grenfellSobe(b); return; }
    const perto = b.fase === 3 ? 110 : 160, longe = b.fase === 3 ? 230 : 300, want = d > longe ? 1 : d < perto ? -.6 : 0, side = b.side ??= 1; b.dx = dx < 0 ? -1 : 1;
    if (!mataStep(b, (dx / d * want - dy / d * side * .5) * B.speed, (dy / d * want + dx / d * side * .5) * B.speed, dt)) b.side = -side;
    grenfellArena(b);
    if (b.ordem <= 0) { grenfellOrdem(b, N, p); return; }
    if (b.cool > 0) return;
    if (b.fase === 3) { const r = Math.random(); if (r < .32 && d > 150) { b.state = 'gancho'; b.t = b.t0 = .8; b.vx = dx / d; b.vy = dy / d; } else if (r < .55) { b.state = 'guarda'; b.t = G0.guarda; } else grenfellEstocada(b, dx, dy, d, 3); }
    else if (d < 260) grenfellEstocada(b, dx, dy, d, 1);
    return;
  }
  if (b.state === 'windup') { if (b.t <= 0) { b.state = 'lunge'; b.t = b.combo ? .24 : .3; AudioEngine.swoosh?.(.06); } return; }
  if (b.state === 'lunge') {
    if (!mataStep(b, b.vx * 640, b.vy * 640, dt)) b.t = 0; grenfellArena(b);
    if (b.attack <= 0 && Math.hypot(p.x - b.x, p.y - b.y) < B.r + 44) { mataHurt(B.dmg, b); b.attack = .6; effect('Estocada!', p.x, p.y - 150, '#ffd08a', 18); }
    if (b.t <= 0) { if (b.combo > 0) { const resto = b.combo - 1, q = ilhaDist(b, p); grenfellEstocada(b, q.dx, q.dy, q.d, 2); b.combo = resto; } else { b.state = 'rest'; b.t = .6; b.cool = b.fase === 3 ? .9 : 1.3; } }
    return;
  }
  if (b.state === 'gancho') {
    if (b.t > 0) return;
    const L = G0.gancho, px = p.x - b.x, py = p.y - b.y, along = px * b.vx + py * b.vy, off = Math.abs(px * b.vy - py * b.vx), pegou = along > 0 && along < L.len && off < L.w && !worldDash;
    b.hook = { t: .25, x1: b.x + b.vx * (pegou ? along : L.len), y1: b.y + b.vy * (pegou ? along : L.len) }; AudioEngine.swoosh?.(.07);
    if (pegou) { N.gancho = { t: 0, T: .3, x0: p.x, y0: p.y, x1: b.x + b.vx * 80, y1: b.y + b.vy * 80 }; b.state = 'puxa'; b.t = .55; b.cortou = false; effect('Fisgou!', p.x, p.y - 150, '#ffd08a', 18); }
    else { b.state = 'rest'; b.t = .5; b.cool = .8; }
    return;
  }
  if (b.state === 'puxa') { b.dx = dx < 0 ? -1 : 1; if (b.t <= .2 && !b.cortou) { b.cortou = true; if (d < 130) mataHurt(G0.gancho.dmg, b); AudioEngine.swoosh?.(.06); } if (b.t <= 0) { b.state = 'rest'; b.t = .5; b.cool = .9; } return; }
  if (b.state === 'guarda') { b.dx = dx < 0 ? -1 : 1; if (b.t <= 0) { b.state = 'chase'; b.cool = .7; } return; }
  if (b.state === 'contra') { if (b.t <= 0) { if (d < 120) mataHurt(18, b); AudioEngine.swoosh?.(.06); b.state = 'rest'; b.t = .5; b.cool = .8; } return; }
  if (b.state === 'rest') { if (b.t <= 0) b.state = b.base || 'chase'; return; }
  b.state = b.base || 'chase';
}
function grenfellArma(b) { return { x: b.x + (b.dx < 0 ? -30 : 30), y: b.y - (b.alto || 0) - 66 }; }
// Por quadro: as balas de canhão e o Sadi arrastado pelo gancho.
function grenfellExtras(N, dt, p) {
  for (const c of N.canhoes || []) {
    c.t -= dt; if (c.t > 0) continue;
    fxPuffs(c.x, c.y - 10, 14, 120, '#6a6058'); AudioEngine.thud?.(); AudioEngine.gunshot?.(.5, .45);
    if (Math.hypot(p.x - c.x, (p.y - c.y) * 2) < GRENFELL.bala.r) mataHurt(GRENFELL.bala.dmg, c);
  }
  if (N.canhoes) N.canhoes = N.canhoes.filter(c => c.t > 0);
  const g = N.gancho; if (g) { g.t += dt; const k = Math.min(1, g.t / g.T), x = g.x0 + (g.x1 - g.x0) * k, y = g.y0 + (g.y1 - g.y0) * k; if (worldCanWalk(x, y)) { worldOut.x = x; worldOut.y = y; } if (k >= 1) N.gancho = null; }
}
function grenfellVencido(b, N) {
  const st = ilhaState(); st.grenfell = G.day; N.beasts.forEach(x => { if (x.minion) x.hp = 0; }); N.canhoes = []; N.gancho = null; mataXP(120); keys.clear(); save();
  const rw = { cash: 600, xp: 300, items: { prata: 8 } }; grantReward(rw);
  bentoChaveCena(b, rw);
}
// O almirante de pé, desenhado fora da briga (na cena da chave), sumindo na cerração.
function drawGrenfellFigura(x, y, alpha = 1, dx = 1) {
  ctx.save(); ctx.globalAlpha *= clamp(alpha, 0, 1); drawGrenfell({ x, y, dx, alto: 0, state: 'chase', frame: 0, hurt: 0, stun: 0 }); ctx.restore();
}
function drawGrenfell(b) {
  const alto = b.alto || 0, y = b.y - alto, stun = b.stun > 0, size = 168, dir = (b.dx || 1) < 0 ? -1 : 1;
  const action = ['lunge', 'puxa', 'contra', 'guarda'].includes(b.state) || b.state === 'windup' && b.t < .15 || b.state === 'gancho' && b.t < .2;
  ellipse(b.x, y + 3, 30, 8, 'rgba(10,14,20,.35)');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(b.x, y - 80, 120, .16, '140,200,230'); ctx.restore();
  ctx.save(); ctx.globalAlpha = .9 * (b.hurt > 0 ? .55 + .45 * Math.abs(Math.sin(frameClock * 40)) : 1);
  if (stun) { ctx.translate(b.x, y); ctx.rotate(.18 * dir); ctx.translate(-b.x, -y); }
  const pose = historyPose(!!b.moving && !stun, dir, 0, action, b.frame);
  if (!(grenfellArte() && actionSprite('grenfell', pose, b.x, y, size, dir < 0 && (pose >= 4 && pose < 8 || pose === 11)))) { const c = ilhaFigure('grenfell', GRENFELL_LOOK); ctx.translate(b.x, y); if (dir < 0) ctx.scale(-1, 1); ctx.drawImage(c, -72, -264, 144, 276); }
  ctx.restore();
  if (stun) for (let k = 0; k < 3; k++) { const a = frameClock * 4 + k * 2.1; ellipse(b.x + Math.cos(a) * 26, y - 182 + Math.sin(a) * 7, 3.2, 3.2, '#ffe27a'); }
  if (b.state === 'guarda') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(b.x + dir * 30, y - 90, 46, .45 + .2 * Math.sin(frameClock * 12), '220,235,255'); ctx.restore(); }
  if (b.hook) { const g = { x: b.x + dir * 24, y: y - 70 }; ctx.save(); ctx.strokeStyle = '#8a8a90'; ctx.lineWidth = 3; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.lineTo(b.hook.x1, b.hook.y1 - 40); ctx.stroke(); ctx.restore(); ellipse(b.hook.x1, b.hook.y1 - 40, 7, 7, '#c8ccd0'); }
}
function grenfellWarn(b, N) {
  const G0 = GRENFELL;
  for (const c of N.canhoes || []) {
    const k = 1 - Math.max(0, c.t) / c.t0; teleArea(c.x, c.y, G0.bala.r, G0.bala.r / 2, teleK(c.t, c.t0), '255,110,50');
    const bx = c.cx + (c.x - c.cx) * k, by = c.cy + (c.y - c.cy) * k - Math.sin(Math.PI * k) * 240;
    if (k < .14) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(c.cx, c.cy, 60, .7 * (1 - k / .14), '255,190,90'); ctx.restore(); }
    ellipse(bx, by + 4, 9, 9, 'rgba(0,0,0,.3)'); ellipse(bx, by, 9, 9, '#2a2622'); ellipse(bx - 3, by - 3, 3, 3, '#6a625a');
  }
  if (b.state === 'windup') teleLane(b.x, b.y - 20, Math.atan2(b.vy, b.vx), 300, 64, teleK(b.t, b.t0), '255,90,60', .6);
  if (b.state === 'gancho') teleLane(b.x, b.y - 20, Math.atan2(b.vy, b.vx), G0.gancho.len, G0.gancho.w * 2, teleK(b.t, b.t0), '255,170,60', .55);
  if (b.state === 'mira') { const g = grenfellArma(b); teleLane(g.x, g.y, Math.atan2(b.ay - g.y, b.ax - g.x), 820, 40, teleK(b.t, .8), '255,80,60', .55); }
  if (b.shot) { b.shot.t -= 1 / 60; if (b.shot.t <= 0) b.shot = null; else { ctx.save(); ctx.strokeStyle = `rgba(255,236,190,${b.shot.t * 5})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b.shot.x0, b.shot.y0); ctx.lineTo(b.shot.x1, b.shot.y1); ctx.stroke(); ctx.restore(); } }
}
ILHA_MOBS.grenfell = { start: 'chase', tick: grenfellTick, draw: drawGrenfell, warn: grenfellWarn, xp: 0, onKill: grenfellVencido,
  cry(dead) { if (dead) this.caveVoice?.([200, 150, 100, 70], 1.3, { formant: 650, q: 1.4, vol: .055, vib: 5, rate: 4 }); else this.caveVoice?.([170, 230, 160], .4, { formant: 800, q: 1.5, vol: .05, vib: 6, rate: 6 }); } };

// ---------- Ligações ----------
{
  // Quem vem atrás do Bento (a missão começou) encontra o almirante no pátio.
  const extras = ilhaCombatExtras; ilhaCombatExtras = function (N, dt, p) {
    extras(N, dt, p);
    if (worldOut.map !== 'ilha') return;
    if (missionState('bento') && !ilhaState().grenfell && !N.grenfell && grenfellNoPatio(p)) { grenfellChega(N); return; }
    if (N.grenfell) grenfellExtras(N, dt, p);
  };
  const speaker = sceneSpeaker; sceneSpeaker = function (who) { return who === 'grenfell' ? grenfellSpeaker() : speaker(who); };
  // Lá em cima da muralha: o facão não alcança, a bomba não chega; de guarda, de frente, o facão não passa.
  const atk = mataAttack; mataAttack = function () {
    const b = grenfellVivo(), N = mataNight; if (!b) return atk();
    if (b.alto > 0) { const hp = b.hp, cd = N.cd; b.hp = 0; try { return atk(); } finally { b.hp = hp; if (N.cd !== cd && Math.abs(worldOut.x - b.x) < 260 && frameClock - (b.avisoFacao || 0) > 3) { b.avisoFacao = frameClock; effect('Lá em cima, o facão não alcança!', worldOut.x, worldOut.y - 160, '#e8e0c8', 15); } } }
    const frente = (worldOut.x - b.x) * (b.dx || 1) > -10;
    if (b.state === 'guarda' && frente && Math.hypot(worldOut.x - b.x, worldOut.y - b.y) < 220) {
      const hp = b.hp, cd = N.cd; b.hp = 0; try { return atk(); } finally { b.hp = hp; if (N.cd !== cd) { effect('Defendeu!', b.x, b.y - 190, '#e8f0ff', 18); AudioEngine.note?.(1500, .06, 'square', .03); b.state = 'contra'; b.t = .3; } }
    }
    return atk();
  };
  const shot = rangedHit; rangedHit = function (b, s) {
    if (b.kind !== 'grenfell') return shot(b, s);
    if (b.alto > 0) {
      if (s.id === 'arpao') { const r = shot(b, s); if (b.hp > 0) grenfellPuxa(b); return r; }
      effect('A ameia protegeu', b.x, b.y - b.alto - 150, '#d8d0c0', 15); AudioEngine.note?.(1800, .05, 'square', .02);
      if (!rangedOwned('arpao') && frameClock - (b.avisoArpao || 0) > 6) { b.avisoArpao = frameClock; floatNote('Só o arpão do John Griggs puxa o almirante da muralha.'); }
      return;
    }
    if (b.state === 'guarda') {
      if (s.id === 'arpao') { b.state = 'chase'; b.stun = 1.8; effect('Quebrou a guarda!', b.x, b.y - 190, '#ffe27a', 18); return shot(b, s); }
      effect('Defendeu!', b.x, b.y - 190, '#e8f0ff', 16); return;
    }
    return shot(b, s);
  };
  const aim = rangedAim; rangedAim = function (b) { const a = aim(b); return b.alto ? { x: a.x, y: a.y - b.alto } : a; };
  const boom = bombaEstoura; bombaEstoura = function (x, y) { const b = grenfellVivo(); if (!b?.alto) return boom(x, y); const hp = b.hp; b.hp = 0; try { return boom(x, y); } finally { b.hp = hp; } };
  const bar = ilhaBossBar; ilhaBossBar = function (b) {
    if (b.kind !== 'grenfell') return bar(b);
    const dpr = canvas.width / Math.max(1, canvas.clientWidth), W = canvas.clientWidth, left = 316, right = W - 280, narrow = right - left < 300, w = narrow ? W - 32 : Math.min(520, right - left), x = narrow ? 16 : left + (right - left - w) / 2, y = narrow ? 108 : 16;
    ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); rect(x, y, w, 46, 'rgba(10,14,22,.9)', 8, '#a8c8e8'); txt('⚓ ' + CAVE_BEASTS.grenfell.name, x + w / 2, y + 14, 13, '#eef4ff', 'center', 'Georgia', false); rect(x + 12, y + 24, w - 24, 12, '#141c2a', 5); rect(x + 12, y + 24, (w - 24) * Math.max(0, b.hp) / b.max, 12, '#9cc8f0', 5);
    for (const k of [GRENFELL.fase2, GRENFELL.fase3]) rect(x + 12 + (w - 24) * k - 1, y + 22, 2, 16, '#eef4ff'); ctx.restore();
  };
}
