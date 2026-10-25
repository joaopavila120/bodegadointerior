// A vida da Mata de Araucárias.
//   · O trecho 1 (o pinheiral do Garibaldi) é sempre manso, de dia e de noite. De dia, um bando de quatis anda pelas
//     picadas (chegou perto, eles sobem na araucária mais próxima) e uns tatus fuçam o chão (chegou perto, se enterram).
//   · Perto da araucária centenária, a primeira vez: cena com a gralha-azul, que conta que é ela que planta o pinhão…
//     porque esquece onde enterrou.
//   · O combate (facão com Espaço/F, a mesma vida e as mesmas armas da caverna) mora aqui, mas só acontece mata adentro,
//     do trecho 2 em diante (mata-trechos.js), e no navio de Laguna (mata-laguna.js).
'use strict';

const MATA_NIGHT = { notice: 330, oncaNotice: 460 };   // de que distância o bicho nota o Sadi
function mataHere() { return worldOut?.map === 'mata'; }
function mataCombatOn() { return false; }   // no trecho 1 é paz; os trechos e o navio ligam o combate
function mataFree(x, y) { return WORLD_MAPS.mata.canWalk(x, y); }
// Anda um passo com colisão (troncos, pedras e o arroio); devolve falso se travou.
function mataStep(o, vx, vy, dt) { const nx = o.x + vx * dt, ny = o.y + vy * dt; let ok = true; if (mataFree(nx, o.y)) o.x = nx; else ok = false; if (mataFree(o.x, ny)) o.y = ny; else ok = false; return ok; }
function mataGo(o, to, speed, dt) { const d = Math.hypot(to.x - o.x, to.y - o.y); if (d < 6) return true; o.dx = to.x < o.x ? -1 : 1; if (!mataStep(o, (to.x - o.x) / d * speed, (to.y - o.y) / d * speed, dt)) return 'blocked'; return d < speed * dt + 6; }
// Um ponto pra andar: perto das picadas e das clareiras, onde dá pra pisar.
function mataSpotNear(R, from = null, minFrom = 0, avoid = null, minAvoid = 0) {
  const T = mataTrails();
  for (let k = 0; k < 80; k++) {
    const t = T[Math.floor(R() * T.length)], q = t.pts[Math.floor(R() * t.pts.length)], x = q[0] + (R() - .5) * 220, y = q[1] + (R() - .5) * 160;
    if (x < 120 || x > MATA.W - 120 || y < 140 || y > MATA.H - 80 || !mataFree(x, y)) continue;
    if (from && Math.hypot(x - from.x, y - from.y) < minFrom) continue;
    if (avoid && Math.hypot(x - avoid.x, y - avoid.y) < minAvoid) continue;
    return { x, y };
  }
  return null;
}

// =================== De dia: quatis e tatus ===================
let mataFauna = null;
function mataFaunaSpawn() {
  const R = Math.random, p = worldOut;
  mataFauna = { day: G.day, quatis: [], tatus: [], bandoBack: 0 };
  mataBandoSpawn(R, p);
  for (let k = 0; k < 3; k++) { const at = mataSpotNear(R, p, 500); if (at) mataFauna.tatus.push({ ...at, home: at, tx: at.x, ty: at.y, state: 'walk', t: 2 + R() * 3, dx: 1, frame: 0, hidden: 0 }); }
}
function mataBandoSpawn(R, p) {
  const at = mataSpotNear(R, p, 600); if (!at) { mataFauna.bandoBack = 3; return; }
  mataFauna.quatis = Array.from({ length: 4 }, (_, k) => {
    // The leader's safe point does not guarantee that an offset follower is on land.
    const offsets=[[-k*34,k%2?16:-10],[k*26,0],[0,k*12],[0,0]];
    const [dx,dy]=offsets.find(([dx,dy])=>mataFree(at.x+dx,at.y+dy))||[0,0];
    return {x:at.x+dx,y:at.y+dy,state:'walk',t:1+R()*2,dx:1,frame:R()*3,lead:k===0,k};
  });
  mataFauna.goal = mataSpotNear(R, at, 200) || at;
}
function mataFaunaTick(dt) {
  if (worldOut?.map !== 'mata' || worldNight()) { if (worldNight()) mataFauna = null; return; }
  if (!mataFauna || mataFauna.day !== G.day) mataFaunaSpawn();
  if (paused || modal || scene || worldTalkOpen()) return;
  const F = mataFauna, p = worldOut, R = Math.random;
  // O bando de quatis: o primeiro escolhe o rumo, os outros vão atrás, de rabo pra cima.
  if (!F.quatis.length) { F.bandoBack -= dt; if (F.bandoBack <= 0) mataBandoSpawn(R, p); }
  let fled = false;
  for (const q of F.quatis) {
    if (q.state === 'escaped') continue;
    q.frame += dt * 8; const d = Math.hypot(p.x - q.x, p.y - q.y);
    if (q.state === 'climb') { q.t -= dt; q.climb = Math.min(1, (q.climb || 0) + dt * 1.3); continue; }
    if (q.state !== 'flee' && d < 220) { mataQuatisFlee(); fled = true; break; }
    if (q.state === 'flee') {
      // The canyon floor and coast have no climbable trees. Flee along the ground instead.
      if (!q.tree) {
        q.fleeT = (q.fleeT || 0) + dt;
        if (q.fleeT >= 4) { q.state = 'escaped'; continue; }
        if ((q.escapeWait = (q.escapeWait || 0) - dt) <= 0) {
          q.escapeWait = .6;
          const away = Math.atan2(q.y - p.y, q.x - p.x);
          q.escape = null;
          for (const turn of [0,.6,-.6,1.2,-1.2,Math.PI]) {
            const x=q.x+Math.cos(away+turn)*150,y=q.y+Math.sin(away+turn)*150;
            if(mataFree(x,y)){q.escape={x,y};break;}
          }
        }
        if(q.escape)mataGo(q,q.escape,220,dt);
        continue;
      }
      // Travou no caminho (pedra, arroio): depois de uns segundos, sobe no pinheiro mais perto de onde está.
      q.fleeT = (q.fleeT || 0) + dt; if (q.fleeT > 3) { q.tree = mataNearestTree(q) || q.tree; q.state = 'climb'; q.t = 1; q.climb = 0; q.x = q.tree.x + (q.k % 2 ? 8 : -8); q.y = q.tree.y + 2; continue; }
      const r = mataGo(q, q.tree, 270, dt);
      if (r === true || r === 'blocked' && Math.hypot(q.tree.x - q.x, q.tree.y - q.y) < 70) { q.state = 'climb'; q.t = 1; q.climb = 0; q.x = q.tree.x + (q.k % 2 ? 8 : -8); q.y = q.tree.y + 2; AudioEngine.pop?.(2200, .03, .03); }
      else if (r === 'blocked') { q.tree = mataNearestTree(q, q.tree); }
      continue;
    }
    if (q.lead) {
      if (q.state === 'walk') { const r = mataGo(q, F.goal, 70, dt); if (r === true || r === 'blocked') { q.state = 'sniff'; q.t = 1.2 + R() * 2; } }
      else if ((q.t -= dt) <= 0) { q.state = 'walk'; F.goal = mataSpotNear(R, q, 150) || F.goal; }
    } else {
      const lead = F.quatis[0], tx = lead.x - (lead.dx || 1) * 36 * q.k, ty = lead.y + (q.k % 2 ? 18 : -14), dd = Math.hypot(tx - q.x, ty - q.y);
      if (dd > 10) { mataGo(q, { x: tx, y: ty }, dd > 120 ? 110 : 70, dt); q.state = 'walk'; } else q.state = 'sniff';
    }
  }
  if (!fled && F.quatis.length && F.quatis.every(q => q.state === 'escaped' || q.state === 'climb' && q.climb >= 1)) { F.quatis = []; F.bandoBack = 25; }
  // Tatus: fuçam o chão devagar; assustados, correm um pouco e se enterram.
  for (const t of F.tatus) {
    t.frame += dt * 6;
    if (t.state === 'hidden') { t.hidden -= dt; if (t.hidden <= 0) { const at = mataSpotNear(R, p, 500); if (at) Object.assign(t, at, { home: at, tx: at.x, ty: at.y, state: 'walk', t: 2, dig: 0 }); } continue; }
    if (t.state === 'dig') { t.dig = Math.min(1, t.dig + dt * 1.2); if (t.dig >= 1) { t.state = 'hidden'; t.hidden = 30; } continue; }
    const d = Math.hypot(p.x - t.x, p.y - t.y);
    if (t.state !== 'run' && d < 170) { t.state = 'run'; t.t = 1.1; t.vx = (t.x - p.x) / (d || 1); t.vy = (t.y - p.y) / (d || 1); AudioEngine.noise?.(.08, .05, 900); continue; }
    if (t.state === 'run') { mataStep(t, t.vx * 210, t.vy * 210, dt); t.dx = t.vx < 0 ? -1 : 1; if ((t.t -= dt) <= 0) { t.state = 'dig'; t.dig = 0; for (let k = 0; k < 6; k++) fxPuffs(t.x, t.y - 6, 2, 40, '#7a5a3a'); AudioEngine.noise?.(.3, .06, 500); } continue; }
    if (t.state === 'walk') { const r = mataGo(t, { x: t.tx, y: t.ty }, 34, dt); if (r === true || r === 'blocked') { t.state = 'sniff'; t.t = 1.5 + R() * 2.5; } }
    else if ((t.t -= dt) <= 0) { t.state = 'walk'; const a = R() * Math.PI * 2, r = 60 + R() * 160, x = t.home.x + Math.cos(a) * r, y = t.home.y + Math.sin(a) * r * .7; if (mataFree(x, y)) { t.tx = x; t.ty = y; } }
  }
}
function mataNearestTree(o, not = null) { let best = null, bd = Infinity; for (const t of mataPlants().trees) { if (t === not || t.big) continue; const d = Math.hypot(t.x - o.x, t.y - o.y); if (d < bd) { bd = d; best = t; } } return best; }
function mataQuatisFlee() {
  AudioEngine.note?.(1800, .05, 'square', .02); AudioEngine.note?.(2200, .05, 'square', .02, .06);
  for (const q of mataFauna.quatis) { q.state = 'flee'; q.fleeT = 0; q.tree = mataNearestTree(q); }
  effect('Quatis!', mataFauna.quatis[0].x, mataFauna.quatis[0].y - 70, '#ffe2a6', 15);
}
// Quati: corpo ruivo, focinho comprido e o rabo listrado em pé.
function drawQuati(q) {
  if (q.state === 'escaped') return;
  const s = q.dx < 0 ? -1 : 1, climb = q.climb || 0, walk = q.state === 'walk' || q.state === 'flee', leg = walk ? Math.sin(q.frame * 2) * 3 : 0;
  ctx.save(); ctx.translate(q.x, q.y - climb * 120); ctx.scale(s * 1.5, 1.5); ctx.globalAlpha = (1 - climb * .85) * (q.state === 'flee' && !q.tree ? clamp(4 - (q.fleeT || 0), 0, 1) : 1);
  if (!climb) ellipse(0, 2, 26, 6, 'rgba(10,14,8,.35)');
  for (let i = 0; i < 9; i++) { const k = i / 8, tx = -22 - k * 16 + Math.sin(q.frame * .6 + k * 2) * 3, ty = -18 - k * 38; ellipse(tx, ty, 5 - k * 2, 5 - k * 2, i % 2 ? '#3a2414' : '#a8743e'); }
  for (const [lx, o] of [[-14, leg], [-6, -leg], [10, leg], [17, -leg]]) rect(lx + o - 2, -12, 4, 12, '#2a1a10', 1);
  ellipse(0, -17, 22, 11, '#8a5a32'); ellipse(-2, -22, 18, 6, '#6a4424'); ellipse(2, -11, 15, 4, '#c8a070');
  ellipse(22, -20, 9, 8, '#7a4e2c'); ctx.fillStyle = '#5a3a20'; ctx.beginPath(); ctx.moveTo(26, -24); ctx.lineTo(41, -17); ctx.lineTo(26, -15); ctx.closePath(); ctx.fill();
  ellipse(41, -17, 2.4, 2, '#1a1008'); ellipse(25, -24, 3.4, 2, '#f0e6d0'); ellipse(26, -22, 1.6, 1.6, '#120a06'); ellipse(18, -28, 3, 3, '#6a4424');
  ctx.restore();
}
// Tatu: casco abaulado com as cintas, cabecinha pontuda e o rabo fino; enterrando, afunda na terra.
function drawTatu(t) {
  if (t.state === 'hidden') return;
  const s = t.dx < 0 ? -1 : 1, dig = t.dig || 0, walk = t.state === 'walk' || t.state === 'run', leg = walk ? Math.sin(t.frame * 3) * 2 : 0;
  ctx.save(); ctx.translate(t.x, t.y); ctx.scale(s * 1.6, 1.6);
  ellipse(0, 2, 24, 6, 'rgba(10,14,8,.35)');
  if (dig) { ctx.beginPath(); ctx.rect(-50, -60, 100, 60); ctx.clip(); ctx.translate(0, dig * 26); ellipse(0, 0, 26, 6, '#5a4028'); }
  ctx.fillStyle = '#8a7a62'; ctx.beginPath(); ctx.moveTo(-20, -8); ctx.lineTo(-38, -3); ctx.lineTo(-20, -4); ctx.closePath(); ctx.fill();
  for (const [lx, o] of [[-12, leg], [-4, -leg], [8, leg], [14, -leg]]) rect(lx + o - 2, -6, 4, 6, '#4a3a2a', 1);
  ellipse(0, -11, 22, 12, '#9a8a6e'); ctx.strokeStyle = '#6a5a44'; ctx.lineWidth = 2;
  for (const bx of [-9, -3, 3, 9]) { ctx.beginPath(); ctx.moveTo(bx, -22); ctx.quadraticCurveTo(bx + 2, -11, bx, -1); ctx.stroke(); }
  rect(-20, -4, 40, 3, '#6a5a44', 1);
  ctx.fillStyle = '#a8987a'; ctx.beginPath(); ctx.moveTo(18, -15); ctx.lineTo(33, -7); ctx.lineTo(18, -5); ctx.closePath(); ctx.fill();
  ellipse(19, -16, 3, 4, '#8a7a62'); ellipse(24, -11, 1.4, 1.4, '#1a1008');
  ctx.restore();
}

// =================== A gralha-azul ===================
// Corpo azul, cabeça e peito pretos, topetinho; pousada ou voando (asas batendo).
function drawGralha(x, y, dx = 1, fly = false, scale = 1.7) {
  ctx.save(); ctx.translate(x, y); ctx.scale((dx < 0 ? -1 : 1) * scale, scale);
  if (!fly) { ellipse(0, 2, 12, 3, 'rgba(10,14,8,.3)'); ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(-3, 0); ctx.moveTo(3, -6); ctx.lineTo(3, 0); ctx.stroke(); }
  const flap = fly ? Math.sin(frameClock * 18) : 0;
  ctx.fillStyle = '#1e4a90'; ctx.beginPath(); ctx.moveTo(-8, -12); ctx.lineTo(-22, -6); ctx.lineTo(-20, -2); ctx.lineTo(-7, -9); ctx.closePath(); ctx.fill();
  ellipse(0, -13, 11, 8, '#2a62b8');
  if (fly) { ctx.fillStyle = '#1e4a90'; ctx.beginPath(); ctx.moveTo(-2, -15); ctx.lineTo(-12, -15 - 16 * flap); ctx.lineTo(6, -15 - 10 * flap); ctx.closePath(); ctx.fill(); }
  else ellipse(-3, -13, 8, 5, '#1e4a90');
  ellipse(7, -16, 6, 6, '#14141a'); ellipse(9, -21, 6, 6, '#14141a');
  ctx.fillStyle = '#14141a'; ctx.beginPath(); ctx.moveTo(6, -26); ctx.lineTo(4, -31); ctx.lineTo(9, -27); ctx.lineTo(10, -32); ctx.lineTo(12, -26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0a0a0e'; ctx.beginPath(); ctx.moveTo(14, -22); ctx.lineTo(20, -20); ctx.lineTo(14, -18.5); ctx.closePath(); ctx.fill();
  ellipse(11, -22, 1.4, 1.4, '#d8e8ff');
  ctx.restore();
}
// Retrato da gralha: uma janela de SVG sobre a folha de bichos da mata. Nada de exportar canvas: aberto pelo arquivo
// (file://), o canvas que desenha um PNG fica "contaminado" e o navegador recusa, e a cena travava sem fala.
function gralhaPortrait() {
  const r = typeof MATA_FAUNA_RECTS !== 'undefined' && MATA_FAUNA_RECTS[4];
  if (!r) return '<span class="portrait portrait-phone" style="width:104px;height:104px">🐦</span>';
  return `<span class="portrait portrait-phone" style="width:104px;height:104px;display:grid;place-items:center;overflow:hidden;background:#d8ecf4"><svg width="92" height="92" viewBox="${r.join(' ')}" aria-hidden="true"><image href="assets/images/mata/mata-fauna-v1.png" width="1536" height="1024"/></svg></span>`;
}
function gralhaCall() { for (let k = 0; k < 2; k++) { AudioEngine.note?.(720, .09, 'sawtooth', .035, k * .16); AudioEngine.note?.(520, .1, 'sawtooth', .03, k * .16 + .05); AudioEngine.noise?.(.06, .02, 1800); } }
// Perto da araucária centenária, a primeira vez: a gralha conversa e sai voando.
function mataGralhaScene() {
  G.mataGralha = G.day; save();
  if (!scenesEnabled()) return;
  const perch = { x: MATA.big.x - 230, y: MATA.big.y + 150 }, from = { x: worldOut.x, y: worldOut.y }, to = { x: perch.x - 150, y: perch.y + 40 };
  const steps = [...sceneWorld({ map: 'mata', x: perch.x - 60, y: perch.y - 60, night: worldNight() ? .45 : 0 }),
    { actor: 'sadi', x: from.x, y: from.y, dx: 1 }, { actor: 'gralha', x: perch.x, y: perch.y, dx: -1, draw: (a, y) => { if (!a.fly) drawMataLog({ x: a.x + 10, y: y + 8, w: 120, a: 0 }); drawGralha(a.x, y - (a.fly ? 0 : 16), a.dx, !!a.fly); } }, { fade: 'in', time: .6 },
    { walk: 'sadi', to },
    { say: 'sadi', text: 'Bah… que pinheiro! Esse aí deve ter uns duzentos anos.' },
    { do: gralhaCall }, { say: 'gralha', text: 'Grá! Grá! Mais, gaúcho! E fui eu que plantei quase tudo em volta dele.' },
    { say: 'sadi', text: 'Uma gralha falando?! E plantando pinheiro?' },
    { say: 'gralha', text: 'No outono a pinha cai e solta o pinhão. Eu como uns e enterro outros no chão, pra ter o que comer no inverno.' },
    { say: 'gralha', text: 'Só que eu esqueço onde enterrei metade! E o pinhão esquecido brota e vira pinheiro novo. Grá-grá!' },
    { say: 'sadi', text: 'Então esse pinheiral inteiro nasceu do teu esquecimento?' },
    { say: 'gralha', text: 'Cabeça fraca, mata forte! Por isso o povo da serra diz que matar gralha-azul dá azar.' },
    { say: 'gralha', text: 'Aqui no pinheiral do Garibaldi é tudo manso. Mas pra lá da picada do leste, a mata é braba: javali, cobra, onça… Facão na mão, gaúcho!' },
    sceneSet('gralha', { fly: true, speed: 320 }), { do: gralhaCall }, { walk: 'gralha', to: { x: perch.x + 500, y: perch.y - 400 } }, { fade: 'out', time: .5 }];
  playSteps(steps, 'mata-gralha', () => Object.assign(worldOut, { x: to.x, y: to.y, dx: 1, dy: 0, walk: false }));
}

// =================== O combate (mata adentro) ===================
let mataNight = null;
// Quem chama decide o que nasce (os trechos e o navio trocam esta função); no trecho 1 não nasce nada.
function mataNightStart() { mataNight = { day: G.day, beasts: [], drops: [], herds: [], shots: [], cd: 0, inv: 0, hurt: 0, swing: null }; }
function mataHurt(dmg, from) {
  const N = mataNight, st = caveState(); if (!N || N.inv > 0 || N.faint) return;
  st.hp = Math.max(0, st.hp - dmg); N.inv = .9; N.hurt = .3; AudioEngine.caveOuch?.(); effect('−' + dmg, worldOut.x, worldOut.y - 130, '#ff8a7a', 24);
  const d = Math.hypot(worldOut.x - from.x, worldOut.y - from.y) || 1; mataStep(worldOut, (worldOut.x - from.x) / d * 60, (worldOut.y - from.y) / d * 60, 1);
  if (st.hp <= 0) mataFaint();
}
function mataFaint() {
  const N = mataNight; if (!N || N.faint) return; N.faint = true; keys.clear();
  const lost = Math.min(50, Math.round(G.cash * .1)); G.cash = round(G.cash - lost); caveState().hp = caveMaxHp(); AudioEngine.caveFaintSound?.(); save();
  switchMap({ map: 'serra', x: SERRA.W - 120, y: SERRA.roadY + SERRA.roadH / 2, title: 'Serra Gaúcha' });
  talk([['card', `<b>😵 Desmaiou na mata</b><br>Acordou na beira da estrada da Serra, com a cabeça doendo e o bolso mais leve (−${money(lost)}). Um tropeiro que passava te puxou pra fora do mato.`, 'Mata de Araucárias']], null, 'Levantar');
  N.faint = false;
}
function mataBeastTick(b, dt, p) {
  const B = CAVE_BEASTS[b.kind], onca = b.kind === 'onca', dxp = p.x - b.x, dyp = p.y - b.y, d = Math.hypot(dxp, dyp) || 1;
  b.t -= dt; b.cool = Math.max(0, b.cool - dt); b.hurt = Math.max(0, b.hurt - dt); b.attack = Math.max(0, b.attack - dt); b.frame += dt * 6;
  const toward = speed => { b.dx = dxp < 0 ? -1 : 1; mataStep(b, dxp / d * speed, dyp / d * speed, dt); };
  if (b.state === 'roam') {
    if (d < (onca ? MATA_NIGHT.oncaNotice : MATA_NIGHT.notice) * mataNoticeMul()) { b.state = onca ? 'stalk' : 'chase'; if (!onca) AudioEngine.caveCry?.('javali'); return; }
    const r = mataGo(b, { x: b.tx, y: b.ty }, 45, dt); if (r === true || r === 'blocked' || b.t <= 0) { const a = Math.random() * Math.PI * 2, rr = 80 + Math.random() * 200, x = b.home.x + Math.cos(a) * rr, y = b.home.y + Math.sin(a) * rr * .7; if (mataFree(x, y)) { b.tx = x; b.ty = y; } b.t = 3 + Math.random() * 3; }
  } else if (b.state === 'chase' || b.state === 'stalk') {
    if (d > 700) { b.state = 'roam'; return; }
    // A onça chega de mansinho e para a uns passos; o javali vem direto.
    if (onca) { if (d > 230) toward(80); else if (d < 170) { b.dx = dxp < 0 ? -1 : 1; mataStep(b, -dxp / d * 60, -dyp / d * 60, dt); } }
    else toward(B.speed);
    if (d < (onca ? 250 : 170) && b.cool <= 0) { b.state = 'windup'; b.t = onca ? .35 : .45; b.vx = dxp / d; b.vy = dyp / d; b.dx = b.vx < 0 ? -1 : 1; if (onca) AudioEngine.caveGrowl?.(.3, .08); else AudioEngine.caveSnort?.(); }
  } else if (b.state === 'windup') { if (b.t <= 0) { b.state = 'lunge'; b.t = onca ? .42 : .45; } }
  else if (b.state === 'lunge') {
    const sp = onca ? 560 : 420; if (!mataStep(b, b.vx * sp, b.vy * sp, dt)) b.t = 0;
    if (Math.hypot(p.x - b.x, p.y - b.y) < B.r + 28) { mataHurt(B.dmg, b); b.attack = .35; }
    if (b.t <= 0) { b.state = onca ? 'retreat' : 'rest'; b.t = onca ? 1.4 : .8; b.cool = onca ? 2.4 : 1.4; }
  } else if (b.state === 'rest') { if (b.t <= 0) b.state = 'chase'; }
  else if (b.state === 'retreat') { b.dx = dxp < 0 ? 1 : -1; mataStep(b, -dxp / d * 200, -dyp / d * 200, dt); if (b.t <= 0) b.state = 'stalk'; }
}
function mataKill(b) {
  const B = CAVE_BEASTS[b.kind], [lo, hi] = B.cash, cash = lo + Math.floor(Math.random() * (hi - lo + 1)) + 2;
  mataNight.drops.push({ x: b.x, y: b.y, q: cash }); fxPuffs(b.x, b.y - 30, 12, 140, b.kind === 'onca' ? '#8a6a40' : '#5a4a3a'); effect(B.name + ' derrubado!', b.x, b.y - 110, '#d8ffac', 18);
  AudioEngine.caveCry?.(b.kind, true); G.stats.mataKills = (G.stats.mataKills || 0) + 1; gainXP?.(b.kind === 'onca' ? 6 : 3);
}
function mataAttack() {
  const N = mataNight, p = worldOut; if (!mataCombatOn() || !N || N.faint || paused || modal || scene || phoneOpen || worldTalkOpen()) return;
  if (!caveState().facao) { floatNote('Sem o facão do vô, só resta correr! Ele fica cravado na boca da gruta, na Serra.'); return; }
  if (N.cd > 0) return; N.cd = caveCd(); const ang = Math.atan2(p.dy || 0, p.dx || (p.dy ? 0 : 1)); N.swing = { t: .2, ang }; AudioEngine.swoosh?.(.08);
  const reach = caveReach(); let flesh = false;
  for (const b of N.beasts) {
    if (b.hp <= 0) continue; const d = Math.hypot(b.x - p.x, (b.y - 20) - (p.y - 30)); if (d > reach) continue;
    const a = Math.atan2((b.y - 20) - (p.y - 30), b.x - p.x); if (Math.abs(Math.atan2(Math.sin(a - ang), Math.cos(a - ang))) > 1.25 && d > 40) continue;
    const dmg = caveDmg(); b.hp -= dmg; b.hurt = .18; const k = Math.hypot(b.x - p.x, b.y - p.y) || 1; mataStep(b, (b.x - p.x) / k * 45, (b.y - p.y) / k * 45, 1);
    if (b.state === 'lunge' || b.state === 'windup') { b.state = 'rest'; b.t = .6; }
    if (!flesh) { AudioEngine.caveFlesh?.(); AudioEngine.caveCry?.(b.kind, b.hp <= 0); } flesh = true; fxStars(b.x, b.y - 50, 3);
    effect('−' + dmg, b.x + (Math.random() - .5) * 20, b.y - 80, '#ffd2a0', 21); if (b.hp <= 0) mataKill(b);
  }
}
function mataCombatTick(dt) {
  if (!mataCombatOn()) { mataNight = null; return; }
  if (!mataNight || mataNight.day !== G.day) mataNightStart();
  const N = mataNight, p = worldOut; if (N.faint || paused || modal || scene || phoneOpen || worldTalkOpen()) return;
  N.cd = Math.max(0, N.cd - dt); N.inv = Math.max(0, N.inv - dt); N.hurt = Math.max(0, N.hurt - dt); if (N.swing && (N.swing.t -= dt) <= 0) N.swing = null;
  for (const b of N.beasts) if (b.hp > 0) { mataBeastTick(b, dt, p); if (!mataNight || N.faint) return; }
  for (const dr of N.drops) if (!dr.got && Math.hypot(dr.x - p.x, dr.y - p.y) < 46) { dr.got = true; G.cash = round(G.cash + dr.q); effect('+' + money(dr.q), dr.x, dr.y - 50, '#ffe27a', 18); AudioEngine.coins(); }
  N.drops = N.drops.filter(dr => !dr.got);
}
// O Kurupi ensina a andar quieto: os bichos demoram mais pra notar o Sadi (mata-acampamentos.js).
function mataNoticeMul() { return typeof mataFolk === 'function' && mataFolk('kurupi') ? .75 : 1; }
// No escuro da mata, de longe, a onça é só um par de olhos.
function mataOncaHidden(b) { return b.kind === 'onca' && Math.hypot(worldOut.x - b.x, worldOut.y - b.y) > 260 && b.state !== 'lunge'; }
function drawMataNightLayers(layers, seen) {
  const N = mataNight; if (!N) return;
  for (const b of N.beasts) if (b.hp > 0 && seen(b.x, b.y, 200)) layers.push({ y: b.y, draw: () => { ctx.save(); if (mataOncaHidden(b)) ctx.globalAlpha = .18; const shake = b.state === 'windup' ? Math.sin(frameClock * 60) * 3 : 0; b.x += shake; try { drawCaveBeast(b); } finally { b.x -= shake; } ctx.restore(); } });
  for (const dr of N.drops) layers.push({ y: dr.y - 30, draw: () => { const bob = Math.sin(frameClock * 4 + dr.x) * 3; ellipse(dr.x, dr.y - 8 + bob, 9, 9, '#e8c040'); ellipse(dr.x, dr.y - 8 + bob, 5, 5, '#c89a20'); } });
  if (N.swing) layers.push({ y: worldOut.y + 1, draw: () => { const s = N.swing, p = worldOut, k = 1 - s.t / .2, a0 = s.ang - 1.2 + k * 2.4; ctx.save(); ctx.translate(p.x, p.y - 40); ctx.strokeStyle = `rgba(${caveSwingColor()},${.75 * (1 - k)})`; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 78, s.ang - 1.2, a0); ctx.stroke(); ctx.restore(); } });
}
// =================== Ligações ===================
{
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); mataFaunaTick(dt); mataCombatTick(dt); if (mataHere()) ['cave-beasts-a-v1', 'cave-beasts-b-v1', 'sadi-combat-v1'].forEach(k => expansionImage(k)); mataUpdateButton(); };
  const M = WORLD_MAPS.mata, draw = M.draw, onEnter = M.onEnter;
  M.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers);
    if (mataFauna && !worldNight()) { for (const q of mataFauna.quatis) if (seen(q.x, q.y, 120)) layers.push({ y: q.y - (q.climb ? 1 : 0), draw: () => drawQuati(q) }); for (const t of mataFauna.tatus) if (seen(t.x, t.y, 120)) layers.push({ y: t.y, draw: () => drawTatu(t) }); }
  };
  // Primeira vez na mata: a cena de chegada com o Garibaldi (mata-garibaldi.js).
  M.onEnter = function () { onEnter?.call(this); mataFauna = null; if (!G.mataSeen) garibaldiIntro(); };
  // Perto da araucária centenária, a gralha-azul puxa conversa (uma vez).
  { const t = outsideTick; outsideTick = function (dt) { t(dt); if (worldOut?.map === 'mata' && G.mataSeen && !G.mataGralha && !scene && !modal && !worldTalkOpen() && Math.hypot(worldOut.x - MATA.big.x, worldOut.y - MATA.big.y - 120) < 420) mataGralhaScene(); }; }
  // Na mata, de noite, o cavalo fica amarrado na entrada: o Sadi peleia a pé.
  const mounted = playerMounted; playerMounted = function () { return mataCombatOn() ? false : mounted(); };
  // Golpe e machucado: a mesma pose de combate da caverna.
  const person = drawExpansionPerson; drawExpansionPerson = function (sprite, x, y, walking, chef, dx, seated, mood, dy) {
    const N = mataNight;
    if (chef && mataCombatOn() && N && (N.hurt > 0 || N.swing) && (sprite === 0 || walkCharacterId(sprite) === 'sadi')) { const direction = walkDirection(dx, dy), step = N.hurt > 0 ? 3 : Math.min(2, Math.floor((1 - N.swing.t / .2) * 3)); if (expansionSprite('sadi-combat-v1', direction * 4 + step, x, y, 150, direction === 1 && dx < 0, expansionRowHeight('sadi-combat-v1', 0, 12))) return true; }
    return person(sprite, x, y, walking, chef, dx, seated, mood, dy);
  };
  const speaker = sceneSpeaker; sceneSpeaker = function (who) { return who === 'gralha' ? { portrait: gralhaPortrait(), name: 'Gralha-azul' } : speaker(who); };
  document.addEventListener('keydown', e => {
    if (!mataCombatOn() || e.repeat || modal || scene || worldTalkOpen() || ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    const k = e.key.toLowerCase(); if (k !== ' ' && k !== 'f') return; e.preventDefault(); e.stopImmediatePropagation(); mataAttack();
  }, true);
  document.addEventListener('DOMContentLoaded', () => { $('hudLayer')?.insertAdjacentHTML('beforeend', '<button id="mataAttackButton" class="sling-button cave-attack hidden" type="button" data-act="mataAttack">🔪 Facão</button>'); });
  const act = action; action = function (name, id) { if (name === 'mataAttack') { mataAttack(); return; } return act(name, id); };
}
function mataUpdateButton() { const btn = $('mataAttackButton'); if (btn) btn.classList.toggle('hidden', !(mataCombatOn() && caveState().facao)); }
