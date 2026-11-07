// Os chefes do pampa, a Lança do Lanceiro Negro e o fim do jogo. Os chefes ficam no meio do caminho, e cada minichefe tranca a
// cancela do sul do trecho dele até cair. Cada um tem uma regra só, e a tela diz o que fazer agora (pampaObjetivo).
//   · Sargento Recolhedor (trecho 6): o imperial que recolheu as lanças em Porongos (personagem inventado). Arremessa as lanças
//     em leque: sai das faixas e bate entre um arremesso e outro. Os três lanceiros vêm junto. Vencido, o Lanceiro entrega a Lança.
//   · A Lança do Lanceiro Negro: a arma mais comprida do jogo. Gente a cavalo se mexe demais e desvia de tiro e de arpão; a lança
//     firme derruba quem vem em carga: F um pouco antes dele chegar, e o Sadi vira sozinho pra ele.
//   · Boi Barroso (trecho 9): o touro da canção, "que ninguém laçou". Com o boi inteiro, o golpe quase não entra. Laço (Q) cansa,
//     e bater de cabeça na parede da mangueira deixa ele tonto. Quem vence ganha o laço de couro cru, o chifre e o Assobio do Boi.
//   · Capitão de cavalaria (trecho 12): vem a cavalo, com dois lanceiros. Lança firme na carga derruba; a pé ele apanha até o
//     cavalo voltar. É o ensaio da batalha final, e deixa a dragona pra última melhoria da lança.
//   · Coronel Moringue (trecho 15): Francisco Pedro de Abreu, que comandou o ataque de 14 de novembro de 1844. Três fases:
//     1. A carga: fique firme três vezes (F na hora da carga) e ele cai do cavalo.
//     2. O duelo: ele defende quase tudo. Bate depois da estocada dele ou quando o minuano soprar, que ele perde a guarda.
//     3. A madrugada: as lanças se acendem, "Avante, farrapos!" e os farrapos chegam: eles seguram a cavalaria, e o céu vai
//        clareando conforme o coronel apanha.
//   · O fim: as almas dos lanceiros se despedem, o Bento fica livre e a República Rio-Grandense é proclamada no palanque do
//     Campo dos Menezes. A história de verdade é outra ordem (1836 e 1844): o jogo junta as duas, e o cartão final conta.
'use strict';

Object.assign(CAVE_BEASTS, {
  boiBarroso: { name: 'Boi Barroso', hp: 8000, speed: 240, dmg: 42, r: 60, cash: [0, 0], from: 999, weight: 0 },
  lanceiroMontado: { name: 'Lanceiro imperial', hp: 520, speed: 360, dmg: 28, r: 44, cash: [10, 18], from: 999, weight: 0 },
  capitao: { name: 'Capitão de cavalaria', hp: 17000, speed: 380, dmg: 42, r: 46, cash: [0, 0], from: 999, weight: 0 },
  sargento: { name: 'Sargento Recolhedor', hp: 7000, speed: 130, dmg: 14, r: 40, cash: [0, 0], from: 999, weight: 0 },
  moringue: { name: 'Coronel Moringue', hp: 28000, speed: 400, dmg: 48, r: 46, cash: [0, 0], from: 999, weight: 0 }
});
Object.assign(ILHA_LOOKS, {
  soldado: { look: { skin: '#d8c0a8', hair: '#2a1a10', style: 'short', mustache: true, hat: 'brim', hatColor: '#1a2238', coat: '#22305a', shirt: '#e8e0d0', pants: '#d8d0bc', boots: '#141010' }, tint: 'rgba(130,180,230,.2)' },
  capitao: { look: { skin: '#d8c0a8', hair: '#3a2a1a', style: 'short', sideburns: true, mustache: true, hat: 'bicorne', coat: '#1c2a52', epaulettes: true, shirt: '#f0ece0', pants: '#efe8d8', boots: '#1a1410', sash: '#b02a2a', item: 'sword' }, tint: 'rgba(130,180,230,.16)' },
  sargento: { look: { skin: '#c8a888', hair: '#2a2018', style: 'short', sideburns: true, mustache: true, hat: 'brim', hatColor: '#141a2c', coat: '#2a3048', shirt: '#b8b0a0', pants: '#8a8474', boots: '#141010', sash: '#6a2a2a' }, tint: 'rgba(100,130,170,.2)' },
  moringue: { look: { skin: '#d0b090', hair: '#1c1410', style: 'short', sideburns: true, mustache: true, hat: 'bicorne', coat: '#16203e', epaulettes: true, shirt: '#ece6d8', pants: '#e4dece', boots: '#100c08', sash: '#8a1f24', item: 'sword' }, tint: 'rgba(90,120,180,.14)' },
  neto: { look: { skin: '#d8b090', hair: '#1c1410', style: 'short', sideburns: true, mustache: true, hat: 'brim', hatColor: '#1c1a18', coat: '#2a3a2a', shirt: '#f0ece0', pants: '#efe8d8', boots: '#1a1410', lenco: '#c8302a', sash: '#c8a020' }, tint: 'rgba(255,240,200,.04)' }
});
const PAMPA_GENTE = { neto: 'Coronel Antônio de Sousa Neto', moringue: 'Coronel Moringue', capitao: 'Capitão de cavalaria', sargento: 'Sargento Recolhedor' };
const pampaRetratos = {};
const MORINGUE_FILTRO = 'hue-rotate(200deg) saturate(.42) brightness(.86)';
function pampaRetrato(id, size = 104) {
  if (id === 'moringue') { const q = typeof historyPortrait === 'function' ? historyPortrait('mariath', size) : ''; if (q) return `<span style="display:inline-flex;filter:${MORINGUE_FILTRO}">${q}</span>`; }
  if (!pampaRetratos[id]) { const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.fillStyle = id === 'neto' ? '#4a5a44' : '#39415a'; g.fillRect(0, 0, 96, 96); g.drawImage(ilhaGhost(id, 0), 60, 126, 120, 120, 0, 0, 96, 96); try { pampaRetratos[id] = c.toDataURL(); } catch (_) { return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px">🎖️</span>`; } }
  return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px;display:grid;place-items:center;overflow:hidden"><img src="${pampaRetratos[id]}" width="${size}" height="${size}" alt=""></span>`;
}
function pampaFala(id) { return { name: PAMPA_GENTE[id], portrait: pampaRetrato(id, 72) }; }
// Em talk() só quem está em PEOPLE tem nome e retrato: o lanceiro, o Bento e os outros vêm do mesmo lugar das cenas.
function pampaQuem(id) { if (PAMPA_GENTE[id]) return pampaFala(id); if (PEOPLE.some(p => p.id === id)) return id; const s = sceneSpeaker(id); return { name: s.name, portrait: s.portrait }; }
function pampaTalk(lines, then, ok) { talk(lines.map(l => typeof l[0] === 'string' && !['card', 'reward', 'dica', 'sadi'].includes(l[0]) ? [pampaQuem(l[0]), ...l.slice(1)] : l), then, ok); }
function pampaFigura(id, x, y, dx = 1, s = 1, alpha = 1, frame = 0) { ellipse(x, y + 3, 24 * s, 7 * s, `rgba(10,14,8,${.3 * alpha})`); ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale((dx < 0 ? -1 : 1) * s * .92, s * .92); ctx.drawImage(ilhaGhost(id, frame), -60, -220, 120, 230); ctx.restore(); }
// A cavalaria imperial: o desenho do cavaleiro gaúcho, na cor fria das almas da cerração.
function pampaCavalaria(key, base, filtro) {
  if (EXPANSION_ART[key]?.naturalWidth) return key; const im = expansionImage(base); if (!im?.naturalWidth) return base;
  const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const g = c.getContext('2d'); g.filter = filtro; g.drawImage(im, 0, 0); g.filter = 'none';
  c.naturalWidth = c.width; c.naturalHeight = c.height; c.setAttribute('src', 'pintada'); EXPANSION_ART[key] = c; EXPANSION_CROPS[key] = EXPANSION_CROPS[base]; return key;
}

// ---------- O laço (Q) ----------
function pampaTemLaco() { return !!pampaState().lacoCouro; }
// Depois de atordoado, ele fica um tempo esperto com o laço: não dá pra travar chefe apertando Q sem parar.
function pampaAtordoa(b, seg, texto = 'Laçou!') {
  if (b.lacoImune > 0) { effect('Escapou do laço!', b.x, b.y - 170, '#ffb3a0', 16); return false; }
  b.stun = Math.max(b.stun || 0, seg); b.lacoImune = b.boss ? 6 : 2.5; effect(texto, b.x, b.y - 170, '#ffe9a8', 16); return true;
}
function pampaLaco() {
  const N = mataNight, p = worldOut; if (!pampaAqui() || !N?.pampa || N.faint || paused || modal || scene || phoneOpen || worldTalkOpen()) return;
  if (N.lacoCd > 0) return; N.lacoCd = pampaTemLaco() ? .8 : 1.2; AudioEngine.lassoThrow?.();
  const alcance = pampaTemLaco() ? 680 : 580, fx = p.dx || 0, fy = p.dy || 0, frente = Math.hypot(fx, fy) || 1; let best = null, bd = 1e9;
  for (const b of N.beasts) {
    if (b.hp <= 0 || b.state === 'oculto') continue; const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy); if (d > alcance) continue;
    const conta = (b.boss ? -500 : 0) + (ILHA_MOBS[b.kind]?.laco ? -400 : 0) + d - (dx * fx + dy * fy) / frente * .3; if (conta < bd) { bd = conta; best = b; }
  }
  if (!best) { N.rope = { x: p.x + (fx / frente || 1) * 240, y: p.y - 30 + (fy / frente) * 160, t: .3 }; effect('Laço no vazio…', p.x, p.y - 140, '#ffe2a6', 16); return; }
  N.rope = { target: best, t: .35 }; AudioEngine.ropeHit?.(); const mob = ILHA_MOBS[best.kind];
  if (mob?.laco) mob.laco(best, N); else pampaAtordoa(best, best.boss ? .8 : 1.4);
}
function drawPampaLaco(N) {
  const r = N.rope, p = worldOut; if (!r) return; const x1 = r.target ? r.target.x : r.x, y1 = r.target ? r.target.y - 60 : r.y, ox = p.x, oy = p.y - 90, mx = (ox + x1) / 2, my = (oy + y1) / 2 - 34;
  ctx.save(); ctx.strokeStyle = '#d8b878'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke(); ctx.beginPath(); ctx.ellipse(x1, y1, 34, 13, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}

// Chefe chegando: quem andava por perto some do campo, pra peleia ser só com ele. Volta quando o Sadi voltar à área.
function pampaLimpaCampo(N, p = worldOut) { N.beasts = N.beasts.filter(b => Math.hypot(b.x - p.x, b.y - p.y) > 1500); N.bolas = []; N.preso = 0; N.trop = null; sparks.length = 0; }

// ---------- Boi Barroso ----------
function boiChega(N, L) {
  N.chefe = true; keys.clear(); pampaLimpaCampo(N); const m = L.mangueira;
  N.beasts.push(ilhaMob('boiBarroso', { x: m.x, y: m.y + m.r * .3 }, Math.random, { boss: true, state: 'mira', t: 1.8, t0: 1.8, vx: 0, vy: -1, dx: -1, lacos: 0, need: 4 })); save();
  chefeCena('boi', { b: N.beasts[N.beasts.length - 1], som: () => AudioEngine.boiBerro?.(.03),
    falas: [['card', 'No meio da mangueira de pedra, um touro enorme bufa e cava o chão. É o boi da canção, o que ninguém laçou.'], ['sadi', 'Bah… quem laçar esse aí vai ter história pra contar na bodega.'], ['sadi', 'Com calma, velho. Tu e eu, de homem pra boi.']],
    curtas: [['sadi', 'Velho teimoso. E eu também. Vamos de novo.']],
    regras: [['dica', 'Sai da faixa laranja. <b>Q laça</b>: com quatro laços ele cansa, e aí é hora de bater. Se ele der de cabeça na parede, fica tonto.', 'O Boi Barroso']] });
}
function boiNaMangueira(b) { const m = pampaLayout().mangueira; if (!m) return true; const dx = b.x - m.x, dy = (b.y - m.y) / .72, d = Math.hypot(dx, dy), lim = m.r * .9; if (d <= lim) return true; b.x = m.x + dx / d * lim; b.y = m.y + dy / d * lim * .72; return false; }
function boiTick(b, dt, p) {
  const B = CAVE_BEASTS.boiBarroso, { dx, dy, d } = ilhaDist(b, p); ilhaTick0(b, dt); b.carga = false;
  if (b.state === 'mira') { if (b.t > .22) { b.vx = dx / d; b.vy = dy / d; b.dx = dx < 0 ? -1 : 1; } if (b.t <= 0) { b.state = 'investe'; b.t = 1.05; AudioEngine.boiBerro?.(.022); AudioEngine.tropel?.(.02); } return; }
  if (b.state === 'investe') {
    b.carga = true; if (Math.random() < dt * 22) fxPuffs(b.x - b.vx * 60, b.y, 1, 40, '#c8b890'); if ((b.somT = (b.somT || 0) - dt) <= 0) { b.somT = .3; AudioEngine.tropel?.(.016); golpeTreme = Math.max(golpeTreme, .03); }
    if (!mataStep(b, b.vx * 760, b.vy * 760, dt) || !boiNaMangueira(b)) { b.state = 'bate'; b.t = 1.5; fxPuffs(b.x, b.y - 30, 16, 150, '#8a8070'); AudioEngine.thud?.(); AudioEngine.pedrasLonge?.(.025); golpeTreme = Math.max(golpeTreme, .2); effect('Bateu na parede! Tonto!', b.x, b.y - 220, '#ffe27a', 20); return; }
    if (b.attack <= 0 && Math.hypot(p.x - b.x, p.y - b.y) < B.r + 40) { mataHurt(B.dmg, b); b.attack = .7; }
    if (b.t <= 0) { b.state = 'freia'; b.t = .3; } return;
  }
  if (b.state === 'freia' && b.t <= 0 && b.hp < b.max * .5 && !b.emenda) { b.emenda = true; b.state = 'mira'; b.t = b.t0 = .5; AudioEngine.bufo?.(.018); effect('Brabo!', b.x, b.y - 210, '#ff9a7a', 19); return; }
  if (b.state === 'bate' || b.state === 'freia') { if (b.t <= 0) { b.emenda = false; b.state = 'mira'; b.t = b.t0 = .7 + Math.random() * .2; AudioEngine.bufo?.(.014); } return; }
  if (b.state === 'cansado') { if (b.t <= 0) { b.state = 'mira'; b.t = b.t0 = .9; b.lacos = 0; b.need = Math.min(6, b.need + 1); effect('Recobrou o fôlego!', b.x, b.y - 200, '#ffb3a0', 17); AudioEngine.moo?.(.02, .8); } return; }
  b.state = 'mira'; b.t = b.t0 = .9;
}
function boiLaco(b) {
  if (b.state === 'cansado') { floatNote('O boi já cansou: agora é bater!'); return; }
  b.lacos++; effect('Laço ' + b.lacos + '/' + b.need, b.x, b.y - 200, '#ffe9a8', 18); AudioEngine.moo?.(.014, 1.1);
  if (b.lacos >= b.need) { b.state = 'cansado'; b.t = 3.5; b.lacos = 0; effect('Cansou! Agora!', b.x, b.y - 240, '#ffe27a', 22); AudioEngine.heart?.(); }
}
function boiWarn(b) { if (b.state === 'mira') teleLane(b.x, b.y - 26, Math.atan2(b.vy, b.vx), 800, 120, teleK(b.t, b.t0 || .9), '255,130,40', .55); }
function drawBoiBarroso(b) {
  const investe = b.state === 'investe', mira = b.state === 'mira', cansado = b.state === 'cansado', frame = investe || mira ? Math.floor(frameClock * (investe ? 12 : 4)) % 3 : 0, s = 3.5, e = b.dx < 0 ? -1 : 1, baixa = investe ? 16 : mira ? 8 : cansado ? 12 : 0;
  ellipse(b.x, b.y + 4, 112, 22, 'rgba(14,16,8,.34)');
  ctx.save(); ctx.filter = 'sepia(.6) saturate(1.3) brightness(.8)'; drawBoi(4, frame, b.x, b.y + 6, s, b.dx < 0, b.hurt > 0 ? .7 : 1); ctx.restore();
  // Os chifres saem do alto da cabeça, abertos e com a ponta escura.
  const hx = b.x + e * 84, hy = b.y - 138 + baixa; ctx.save(); ctx.lineJoin = 'round';
  for (const o of [-1, 1]) {
    ctx.fillStyle = '#e6dcc2'; ctx.strokeStyle = '#2a1e10'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(hx + o * 6, hy + 8); ctx.quadraticCurveTo(hx + o * 52, hy + 8, hx + o * 56, hy - 40); ctx.quadraticCurveTo(hx + o * 36, hy - 8, hx + o * 4, hy - 8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2a1e10'; ctx.beginPath(); ctx.moveTo(hx + o * 56, hy - 40); ctx.quadraticCurveTo(hx + o * 52, hy - 18, hx + o * 45, hy - 14); ctx.quadraticCurveTo(hx + o * 50, hy - 26, hx + o * 56, hy - 40); ctx.closePath(); ctx.fill();
  }
  // O olho: vermelho de raiva; cansado, fecha.
  const ox = b.x + e * 90, oy = b.y - 108 + baixa; if (cansado) { ctx.strokeStyle = '#2a1e10'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox - 8, oy); ctx.lineTo(ox + 8, oy); ctx.stroke(); } else { ellipse(ox, oy, 8, 6, investe || mira ? '#e03a20' : '#3a1a10'); ctx.strokeStyle = '#2a1e10'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(ox - e * 12, oy - 13); ctx.lineTo(ox + e * 12, oy - 4); ctx.stroke(); }
  ctx.restore();
  ctx.save(); if (!cansado) for (let k = 0; k < 2; k++) { const t = (frameClock * 1.2 + k * .5) % 1; ctx.globalAlpha = .4 * (1 - t); ellipse(b.x + e * (124 + t * 30), b.y - 78 + baixa - t * 18, 8 + t * 14, 6 + t * 8, '#f0ece0'); } ctx.restore();
  if (cansado) for (let k = 0; k < 3; k++) { const a = frameClock * 4 + k * 2.1; ellipse(hx + Math.cos(a) * 40, hy - 40 + Math.sin(a) * 9, 4, 4, '#ffe27a'); }
  for (let k = 0; k < b.need; k++) ellipse(b.x - (b.need - 1) * 9 + k * 18, b.y - 226, 6, 6, k < b.lacos ? '#ffe27a' : 'rgba(30,20,10,.5)');
}
function boiVencido(b, N) {
  const st = pampaState(); st.boi = G.day; st.lacoCouro = G.day; mataXP(90); keys.clear(); fxStars(b.x, b.y - 80, 8); AudioEngine.boiBerro?.(.03); save();
  const rw = { cash: 400, xp: 180, items: { chifre_boi: 1, couro_cru: 6 } }; grantReward(rw);
  pampaTalk([['card', '<b>🐂 Laçou o Boi Barroso!</b><br>O touro dobra os joelhos, bufa uma última vez e sai andando, manso, pela boca da mangueira. A corrente da cancela do sul cai sozinha.<br><br>Dos tentos que ele arrebentou, dá pra trançar um <b>laço de couro cru</b>: volta mais ligeiro pra mão e alcança mais longe. E o <b>chifre</b> que ele deixou o seu Zeferino sabe usar na lança.', 'Mangueira de pedra'], ['reward', rw, 'O Boi Barroso']], () => { if (typeof pampaBoiPoder === 'function') pampaBoiPoder(); }, 'Seguir');
}

// ---------- Cavaleiros: o lanceiro imperial e o capitão ----------
function pampaCarga(b, dx, dy, d) { b.state = 'mira'; b.t = b.t0 = (b.kind === 'moringue' ? .85 : .95) + (typeof pampaPerk === 'function' && pampaPerk('canabarro') ? .2 : 0); b.vx = dx / d; b.vy = dy / d; b.mx = b.vx; b.my = b.vy; b.dx = dx < 0 ? -1 : 1; }
function cavaleiroTick(b, dt, p, N) {
  const B = CAVE_BEASTS[b.kind], { dx, dy, d } = ilhaDist(b, p); ilhaTick0(b, dt); b.carga = false;
  if (b.kind === 'capitao' && !b.reforco && b.hp < b.max * .5) { b.reforco = true; const C = pampaLayout().campo; if (C) { for (const o of [-1, 1]) N.beasts.push(ilhaMob('lanceiroMontado', { x: C.x + o * C.rx * .75, y: C.y - C.ry * .2 }, Math.random, { minion: true, montado: true, need: 1, state: 'ronda', t: 1.5 + Math.random(), giro: o, dx: -o })); effect('Reforço!', b.x, b.y - 220, '#e8f0ff', 20); AudioEngine.clarim?.(.05); AudioEngine.tropel?.(.08); } }
  if (!b.montado) {
    if (b.kind === 'capitao' && (b.apeado = (b.apeado ?? 5.5) - dt) <= 0) { b.montado = true; b.lacos = 0; b.lacoImune = 0; b.apeado = 5.5; b.state = 'ronda'; b.t = 1.6; b.cool = .8; fxPuffs(b.x, b.y, 10, 90, '#a89878'); AudioEngine.neigh?.(.05); effect('O cavalo voltou!', b.x, b.y - 210, '#ffd08a', 20); return; }
    peaoTick(b, dt, p, B); return;
  }
  if (b.state === 'ronda') {
    b.ang = (b.ang ?? Math.atan2(-dy, -dx)) + dt * .6 * (b.giro || 1); const tx = p.x + Math.cos(b.ang) * 580, ty = p.y + Math.sin(b.ang) * 370, q = Math.hypot(tx - b.x, ty - b.y) || 1, vx = (tx - b.x) / q * B.speed, vy = (ty - b.y) / q * B.speed;
    if (!mataStep(b, vx, vy, dt)) b.giro = -(b.giro || 1); b.mx = vx / B.speed; b.my = vy / B.speed; b.dx = vx < 0 ? -1 : 1;
    if (b.t <= 0 && b.cool <= 0 && d < 980 && !(N?.madrugada && N.cargaCd > 0)) { if (N?.madrugada) N.cargaCd = 3.5; pampaCarga(b, dx, dy, d); }
    return;
  }
  if (b.state === 'mira') { b.vx = dx / d; b.vy = dy / d; b.mx = b.vx; b.my = b.vy; b.dx = dx < 0 ? -1 : 1; if (b.t <= 0) { b.state = 'carga'; b.t = 1.15; AudioEngine.tropel?.(.09); AudioEngine.swoosh?.(.06); } return; }
  if (b.state === 'carga') {
    b.carga = true; if (Math.random() < dt * 16) fxPuffs(b.x - b.vx * 50, b.y, 1, 26, '#c8b890');
    if (!mataStep(b, b.vx * 780, b.vy * 780, dt)) b.t = 0;
    if (b.attack <= 0 && Math.hypot(p.x - b.x, p.y - b.y) < B.r + 48) { mataHurt(B.dmg, b); b.attack = .7; effect('Carga!', p.x, p.y - 150, '#ffd08a', 18); }
    if (b.t <= 0) { b.state = 'curva'; b.t = 1.15; b.giro = Math.random() < .5 ? -1 : 1; }
    return;
  }
  if (b.state === 'curva') {
    b.giro ||= Math.random() < .5 ? -1 : 1; const a = Math.atan2(b.vy || b.my || 0, b.vx || b.mx || 1) + dt * 2.6 * b.giro; b.vx = Math.cos(a); b.vy = Math.sin(a); if (!mataStep(b, b.vx * 420, b.vy * 420, dt)) b.giro = -b.giro; b.mx = b.vx; b.my = b.vy; b.dx = b.vx < 0 ? -1 : 1;
    if (b.t <= 0) { b.state = 'ronda'; b.t = 1 + Math.random() * 1.2; b.cool = .6; b.ang = Math.atan2(b.y - p.y, b.x - p.x); }
    return;
  }
  b.state = 'ronda'; b.t = 1;
}
// A pé: chega perto, avisa e dá a estocada (como os marinheiros da fortaleza).
function peaoTick(b, dt, p, B) {
  const { dx, dy, d } = ilhaDist(b, p);
  if (b.state === 'chase') { b.dx = dx < 0 ? -1 : 1; mataStep(b, dx / d * B.speed * .6, dy / d * B.speed * .6, dt); if (d < 190 && b.cool <= 0) { b.state = 'windup'; b.t = b.t0 = .45; b.vx = dx / d; b.vy = dy / d; b.dx = b.vx < 0 ? -1 : 1; AudioEngine.swoosh?.(.03); } }
  else if (b.state === 'windup') { if (b.t <= 0) { b.state = 'lunge'; b.t = .3; AudioEngine.swoosh?.(.08); } }
  else if (b.state === 'lunge') { if (!mataStep(b, b.vx * 560, b.vy * 560, dt)) b.t = 0; if (b.attack <= 0 && Math.hypot(p.x - b.x, p.y - b.y) < B.r + 30) { mataHurt(B.dmg, b); b.attack = .5; } if (b.t <= 0) { b.state = 'rest'; b.t = .6; b.cool = 1; } }
  else if (b.state === 'rest') { if (b.t <= 0) b.state = 'chase'; }
  else b.state = 'chase';
}
// A lança firme: acerta quem vem em carga, para o tempo um instante e faz barulho de ferro. Quem cai, cai feio.
function pampaFirmeAcerta(b, N) {
  N.hitstop = .12; golpeTreme = Math.max(golpeTreme, .28); AudioEngine.firme?.(); fxStars(b.x, b.y - 90, 6);
  if (b.kind === 'moringue') { moringueLancada(b, N); return; }
  b.hp -= Math.round(caveDmg() * (typeof pampaLancaTem === 'function' && pampaLancaTem('chifre') ? 2.4 : 1.2)); pampaDerruba(b, N, 'Aguentou a carga!'); if (b.hp <= 0) { b.hp = 0; mataKill(b); }
}
function pampaDerruba(b, N, texto = 'Derrubou!') {
  b.montado = false; b.carga = false; b.state = 'chase'; b.stun = 2.2; b.cool = 1; b.apeado = 5.5; fxPuffs(b.x, b.y - 20, 14, 130, '#a89878'); AudioEngine.thud?.(); AudioEngine.neigh?.(.05); effect(texto, b.x, b.y - 210, '#ffe27a', 22);
  N.soltos.push({ x: b.x, y: b.y, dx: Math.random() < .5 ? -1 : 1, t: 2.4, coat: Math.floor(Math.random() * 3) });
}
function cavaleiroLaco(b, N) {
  if (!b.montado) { pampaAtordoa(b, 1); return; }
  if (b.state === 'carga') { effect('Na carga, o laço arrebenta!', b.x, b.y - 220, '#ffb3a0', 17); return; }
  if (b.lacoImune > 0) { effect('Escapou do laço!', b.x, b.y - 220, '#ffb3a0', 16); return; }
  b.lacos = (b.lacos || 0) + 1; const need = b.need || 1;
  if (b.lacos >= need) pampaDerruba(b, N); else { effect('Laço ' + b.lacos + '/' + need, b.x, b.y - 220, '#ffe9a8', 18); b.state = 'curva'; b.t = .7; b.lacoImune = 1.5; }
}
function cavaleiroWarn(b) { if (b.montado && b.state === 'mira') teleLane(b.x, b.y - 26, Math.atan2(b.vy, b.vx), 960, 110, teleK(b.t, b.t0 || .9), '255,110,50', .55); else if (b.state === 'windup') teleLane(b.x, b.y - 20, Math.atan2(b.vy, b.vx), 260, 56, teleK(b.t, b.t0 || .45), '255,90,60', .6); }
function drawCavaleiro(b, nome, look) {
  const movendo = b.montado && b.state !== 'mira';
  if (b.montado) {
    const sheet = pampaCavalaria(b.kind === 'moringue' ? 'moringue-mounted' : 'imperial-mounted', 'ramiro-mounted-v1', b.kind === 'moringue' ? 'hue-rotate(205deg) saturate(.55) brightness(.68)' : 'hue-rotate(190deg) saturate(.6) brightness(.88)');
    ctx.save(); ctx.globalAlpha = b.hurt > 0 ? .65 : 1; mountedPose(sheet, b.x, b.y, b.mx ?? b.dx ?? 1, b.my ?? 0, movendo, true); ctx.restore();
    // A lança baixada do cavaleiro, apontando pra onde ele vai.
    const a = Math.atan2(b.my ?? 0, b.mx ?? b.dx ?? 1), ax = b.x, ay = b.y - 118, baixa = b.carga || b.state === 'mira'; ctx.save(); ctx.translate(ax, ay); ctx.rotate(baixa ? a : -1.3); ctx.strokeStyle = '#3a2a18'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(112, 0); ctx.stroke(); ctx.fillStyle = '#b8bcc2'; ctx.beginPath(); ctx.moveTo(136, 0); ctx.lineTo(112, -6); ctx.lineTo(112, 6); ctx.closePath(); ctx.fill(); ctx.restore();
  } else {
    const anda = b.moving && !(b.stun > 0); pampaFigura(look, b.x, b.y, b.dx, 1, b.hurt > 0 ? .6 : 1, anda ? Math.floor(b.frame * .7) % 4 : 0);
    const s = b.dx < 0 ? -1 : 1; ctx.save(); ctx.translate(b.x + s * 22, b.y - 66); ctx.rotate(s * (b.state === 'windup' ? -1.5 : b.state === 'lunge' ? .15 : -.6)); ctx.strokeStyle = '#d8dce2'; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * 24, -22, s * 46, -32); ctx.stroke(); ctx.restore();
    if (b.stun > 0) for (let k = 0; k < 3; k++) { const q = frameClock * 6 + k * 2.1; txt('✦', b.x + Math.cos(q) * 24, b.y - 200 + Math.sin(q) * 7, 15, '#fff2b0', 'center'); }
  }
  if (!b.boss) mataHpBar(b, nome, b.montado ? 230 : 180);
}
function capitaoChega(N, p) {
  N.chefe = true; keys.clear(); pampaLimpaCampo(N); const C = pampaLayout().campo, lado = p.x > C.x ? -1 : 1;
  N.beasts.push(ilhaMob('capitao', { x: C.x + lado * C.rx * .22, y: C.y + C.ry * .55 }, Math.random, { boss: true, montado: true, need: 2, state: 'ronda', t: 2.4, dx: -lado }));
  for (const o of [-1, 1]) N.beasts.push(ilhaMob('lanceiroMontado', { x: C.x + o * C.rx * .55, y: C.y + C.ry * .25 }, Math.random, { minion: true, montado: true, need: 1, state: 'ronda', t: 3.2 + Math.random() * 2, giro: o, dx: -o }));
  AudioEngine.tropel?.(.1); AudioEngine.neigh?.(.06); AudioEngine.clarim?.(.05); save();
  if (weaponOwned('lanca')) caveState().weapon = 'lanca';
  const cap = N.beasts.find(x => x.kind === 'capitao'), guardas = N.beasts.filter(x => x.kind === 'lanceiroMontado');
  chefeCena('capitao', { b: cap, extras: guardas.map((g, i) => ({ actor: 'guarda' + i, x: g.x, y: g.y, dx: g.x < p.x ? 1 : -1, draw: chefeDesenho(g) })),
    falas: [['capitao', 'Alto lá, paisano! Esse palanque e essa cancela são do Império. E quem passa por aqui presta conta ao coronel Moringue.'], ['sadi', 'Pois vou prestar conta com ele mesmo, capitão.'], ['capitao', 'A cavalo, paisano, um homem vale por dez. Lanceiros! Em linha!']],
    curtas: [['capitao', 'Teimoso, o paisano. Lanceiros! Em linha!'], ['sadi', 'Pode vir. A lança tá com fome.']],
    regras: [['dica', 'Tiro e arpão eles desviam, e em cima do cavalo o golpe mal pega.<br><br><b>Fica firme com a lança: F quando ele vier em carga.</b> Cavalo em carga cai de uma vez, e a pé ele é gente como a gente. Só que o cavalo volta: aproveita.', 'Gente a cavalo']] });
}
function capitaoVencido(b, N) {
  const st = pampaState(); st.capitao = G.day; N.beasts.forEach(x => { if (x.minion) x.hp = 0; }); mataXP(110); keys.clear(); save();
  const rw = { cash: 600, xp: 260, items: { ferro_imperial: 6, dragona: 1 } }; grantReward(rw);
  pampaTalk([[pampaFala('capitao'), 'Podes passar, gaúcho… mas o Moringue não é capitão. Ele ataca de madrugada, quando ninguém espera.'], ['card', '<b>🐎 O capitão caiu</b><br>Ele some na poeira do campo, e os imperiais abrem a cancela do sul. Daqui pra baixo, é o caminho do cerro. A <b>dragona</b> dele serve pra última melhoria da lança, na forja do seu Zeferino.', 'Campo dos Menezes'], ['reward', rw, 'O capitão de cavalaria']], null, 'Seguir');
}

// ---------- Os aliados: quem vem peleiar junto ----------
let pampaRoda = 0;
function pampaAliado(id, x, y, variant=0) { return { id, art:id==='lanceiro'?lanceiroArt(variant):id, x, y, dx: 1, dy: 0, walk: false, hit: .3 + Math.random() * .6, swing: 0, caido: 0, roda: ++pampaRoda * 2.4 }; }
function pampaGolpeAliado(b, mult) { const ef = effect; effect = function (t, ...r) { if (typeof t === 'string' && t[0] === '−') return; return ef(t, ...r); }; try { poderHit(b, mult); } finally { effect = ef; } }
function pampaAliadosTick(N, dt, p) {
  for (const a of N.aliados) {
    if (scene || modal || !mataNight) return;
    a.walk = false; a.hit -= dt; a.swing = Math.max(0, a.swing - dt); if (a.caido > 0) { a.caido -= dt; continue; }
    const guarda = N.beasts.some(q => q.minion && q.hp > 0); if (a.parado && a.caido > 0) continue; let b = null, bd = 1e9; for (const q of N.beasts) { if (q.hp <= 0 || (q.boss && guarda) || ILHA_MOBS[q.kind]?.immune?.(q) || Math.hypot(q.x - p.x, q.y - p.y) > 1000) continue; const d = Math.hypot(q.x - a.x, q.y - a.y); if (d < bd) { bd = d; b = q; } }
    const go = (x, y, sp) => { const mx = x - a.x, my = y - a.y, k = Math.hypot(mx, my); if (k <= 6) return; a.x += mx / k * Math.min(k, sp * dt); a.y += my / k * Math.min(k, sp * dt); a.walk = true; if (Math.abs(mx) > 2) a.dx = mx < 0 ? -1 : 1; a.dy = Math.abs(my) > Math.abs(mx) ? Math.sign(my) : 0; };
    if (b && a.parado) { a.dx = b.x < a.x ? -1 : 1; if (bd < 240 && a.hit <= 0) { a.hit = 1.1; a.swing = .25; AudioEngine.swoosh?.(.03); pampaGolpeAliado(b, .3); } }
    else if (a.parado) a.dx = p.x < a.x ? -1 : 1;
    else if (b) { const raio = b.boss ? 150 : 115; go(b.x + Math.cos(a.roda) * raio, b.y + Math.sin(a.roda) * raio * .62, 300); a.dx = b.x < a.x ? -1 : 1; if (bd < raio + 70 && a.hit <= 0) { a.hit = 1 + Math.random() * .3; a.swing = .25; AudioEngine.swoosh?.(.03); pampaGolpeAliado(b, (a.id === 'lanceiro' ? .14 : .3) * (b.kind === 'moringue' ? .25 : 1)); } }
    else go(p.x + ((a.x * 3) % 240 - 120), p.y + 90, 260);
  }
}
function drawPampaAliado(a) {
  const alpha = a.caido > 0 ? .5 : 1;
  if (a.id === 'neto') pampaFigura('neto', a.x, a.y, a.dx, 1, alpha); else if (a.id === 'canabarro') sceneActorDraw('canabarro', { x: a.x, y: a.y, dx: a.dx, walk: false, alpha }); else if (a.id === 'garibaldi') drawGaribaldi(a.x, a.y, alpha, a.dx, a.walk, a.dy || 0, a.swing); else drawCampFolk(a.art||a.id, a.x, a.y, alpha, a.dx, a.walk, a.dy || 0, a.swing > 0);
  if (a.swing > 0 && a.id !== 'lanceiro') { const k = 1 - a.swing / .25, ang = a.dx > 0 ? 0 : Math.PI; ctx.save(); ctx.strokeStyle = `rgba(220,236,255,${.7 * (1 - k)})`; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(a.x, a.y - 70, 72, ang - 1.2, ang - 1.2 + k * 2.4); ctx.stroke(); ctx.restore(); }
}

// ---------- O acampamento dos lanceiros e o Sargento Recolhedor ----------
// No acampamento, o Lanceiro Negro (o fogo é dele) e mais dois: os três que vão peleiar junto.
function pampaLanceirosCamp(L) { const c = L.camp; return [[-300, 110], [190, 175]].map(([x, y], i) => ({ x: c.x + x, y: c.y + y, art: lanceiroArt(i + 1) })); }
function sargentoChega(N, L) {
  N.chefe = true; keys.clear(); pampaLimpaCampo(N); const D = L.duelo;
  N.beasts.push(ilhaMob('sargento', { x: D.x, y: D.y + D.ry * .4 }, Math.random, { boss: true, state: 'arrasta', cool: 1.2, dx: -1 }));
  N.aliados = [-1, 0, 1].map((i, j) => pampaAliado('lanceiro', D.x + i * 110, D.y - D.ry - 30 - Math.abs(i) * 50, j)); AudioEngine.caveCry?.('sargento'); AudioEngine.clinkMetal?.(.06); save();
  chefeCena('sargento', { b: N.beasts[N.beasts.length - 1], extras: N.aliados.map((q, i) => ({ actor: 'aliado' + i, as: q.art, x: q.x, y: q.y, dx: 1 })),
    falas: [['card', 'Um imperial grande puxa pelo barro um feixe de lanças amarradas, cada uma com um pano vermelho. São as lanças dos lanceiros.'], ['sargento', 'Ordem é ordem, paisano. Mandaram recolher, eu recolhi. E quem vier buscar, leva uma de volta. Na barriga.'], ['lanceiro', 'Lanceiros! Vamos buscar o que é nosso!']],
    curtas: [['sargento', 'Ainda aqui? O feixe continua comigo.'], ['lanceiro', 'Por pouco tempo, sargento.']],
    regras: [['dica', 'Sai das <b>faixas vermelhas</b> e bate entre um arremesso e outro. Perto dele, o <b>círculo laranja</b> é o feixe varrendo em roda. Os lanceiros ajudam.', 'O Sargento Recolhedor']] });
}
function pampaNoDuelo(b) { const D = pampaLayout().duelo; if (!D) return; const dx = (b.x - D.x) / D.rx, dy = (b.y - D.y) / D.ry, k = Math.hypot(dx, dy); if (k > 1) { b.x = D.x + dx / k * D.rx; b.y = D.y + dy / k * D.ry; } }
function sargentoTick(b, dt, p, N) {
  const B = CAVE_BEASTS.sargento, { dx, dy, d } = ilhaDist(b, p); ilhaTick0(b, dt); const brabo = b.hp < b.max * .5;
  if (b.state === 'arrasta') {
    b.dx = dx < 0 ? -1 : 1; const quer = d > 460 ? 1 : d < 240 ? -1.1 : 0; if (quer) mataStep(b, dx / d * B.speed * quer, dy / d * B.speed * quer, dt); pampaNoDuelo(b);
    if (b.cool > 0) return;
    if (brabo && !b.chamou) { b.chamou = true; for (const o of [-1, 1]) N.beasts.push(ilhaMob('batedor', { x: clamp(b.x + o * 300, 200, PAMPA.W - 200), y: b.y + 40 }, Math.random, { minion: true, state: 'corre', t: 1 })); effect('Batedores!', b.x, b.y - 220, '#e8f0ff', 20); b.cool = 1.5; return; }
    if (d < 280 && Math.random() < .55) { b.state = 'varre'; b.t = b.t0 = .95; AudioEngine.swoosh?.(.05); AudioEngine.caveCry?.('sargento'); return; }
    const a0 = Math.atan2(dy, dx), n = brabo ? 4 : 3; b.leque = Array.from({ length: n }, (_, k) => a0 + (k - (n - 1) / 2) * .24); b.state = 'arremesso'; b.t = b.t0 = .85;
    return;
  }
  if (b.state === 'arremesso') {
    b.dx = dx < 0 ? -1 : 1;
    if (b.t <= 0) { for (const a of b.leque) N.lancas.push({ x: b.x, y: b.y - 70, vx: Math.cos(a) * 880, vy: Math.sin(a) * 880, a, t: .95, dmg: B.dmg }); AudioEngine.swoosh?.(.08); AudioEngine.clinkMetal?.(.05); b.state = 'rest'; b.t = 1.1; b.cool = 2.6; }
    return;
  }
  if (b.state === 'varre') {
    if (b.t <= 0) { if (Math.hypot(p.x - b.x, (p.y - b.y) * 1.3) < 250) mataHurt(B.dmg + 4, b); for (const a of N.aliados) if (Math.hypot(a.x - b.x, a.y - b.y) < 250) a.caido = 2; fxPuffs(b.x, b.y, 16, 220, '#a89878'); AudioEngine.thud?.(); AudioEngine.clinkMetal?.(.06); golpeTreme = Math.max(golpeTreme, .2); b.state = 'rest'; b.t = .7; b.cool = 1.4; }
    return;
  }
  if (b.state === 'rest') { if (b.t <= 0) b.state = 'arrasta'; return; }
  b.state = 'arrasta';
}
function sargentoWarn(b) {
  if (b.state === 'arremesso') for (const a of b.leque) teleLane(b.x, b.y - 40, a, 820, 40, teleK(b.t, b.t0), '255,80,60', .5);
  if (b.state === 'varre') teleArea(b.x, b.y, 250, 192, teleK(b.t, b.t0), '255,150,60');
}
function drawSargento(b) {
  const s = b.dx < 0 ? -1 : 1, g = b.state === 'varre' ? (1 - Math.max(0, b.t) / (b.t0 || 1)) * 2.6 : 0;
  ctx.save(); ctx.translate(b.x - s * 18, b.y - 60); ctx.rotate(s * (1.05 + g));
  ctx.lineCap = 'round'; for (let k = 0; k < 8; k++) { const o = (k - 3.5) * 5; ctx.strokeStyle = k % 2 ? '#4a3218' : '#5a3e22'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(o * .6, -16); ctx.lineTo(o, 150); ctx.stroke(); ctx.fillStyle = '#c8ccd2'; ctx.beginPath(); ctx.moveTo(o, 172); ctx.lineTo(o + 4, 150); ctx.lineTo(o - 4, 150); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#b8302a'; ctx.fillRect(o - 1, 128, 14, 10); }
  ctx.strokeStyle = '#2a1a0c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-22, 30); ctx.lineTo(22, 30); ctx.stroke(); ctx.restore();
  pampaFigura('sargento', b.x, b.y, b.dx, 1.32, b.hurt > 0 ? .6 : 1, b.moving ? Math.floor(b.frame * .6) % 4 : 0);
}
function sargentoVencido(b, N) {
  const st = pampaState(); N.beasts.forEach(x => { if (x.minion) x.hp = 0; }); N.lancas = []; N.aliados = []; mataXP(140); keys.clear(); save();
  pampaLancaCena(b);
}
function pampaLancaGanha() {
  const st = pampaState(), cs = caveState(); st.sargento = G.day; cs.forged ??= {}; cs.forged.lanca = G.day; cs.weapon = 'lanca'; caveState().hp = caveMaxHp(); save(); refreshHUD(); AudioEngine.caveGem?.();
  const rw = { cash: 650, xp: 300, items: { ferro_imperial: 8 } }; grantReward(rw);
  pampaTalk([['card', '<b>🔱 Lança do Lanceiro Negro</b><br>A arma mais comprida do jogo: estocada estreita e forte, e já está na tua mão (troca na forja do seu Zeferino ou de São Dunstano).<br><br>A gente do Moringue anda a cavalo e se mexe demais: desvia de tiro e de arpão. <b>Quando um cavalo vier em carga, não corre: aperta F na hora certa.</b> A lança firme derruba o cavaleiro de uma vez.', 'Passo do Banhado'], ['reward', rw, 'O Sargento Recolhedor']], null, 'Até Porongos!');
}
function pampaLancaCena(b) {
  sparks.length = 0;
  const L = pampaLayout(PAMPA_N.sargento), D = L.duelo, p = worldOut, x = clamp(p.x, D.x - 260, D.x + 260), y = clamp(p.y, D.y - 120, D.y + 170), falas = [
    ['lanceiro', 'Foi esse aí que recolheu as nossas lanças, naquela noite de Porongos. Mandaram entregar as armas, e a gente entregou.'],
    ['sadi', 'O feixe tá aqui, companheiro. Nenhuma delas fica mais no barro.'],
    ['lanceiro', 'Esta era do meu sargento. Pesa mais que facão, mas alcança mais que qualquer sabre.'],
    ['lanceiro', 'Lá pra baixo é tudo gente a cavalo: se mexem demais, desviam de bala e de arpão. Quando o cavalo vier em carga, não corre: finca o pé e aponta. Cavalo nenhum passa por uma lança firme.'],
    ['lanceiro', 'Leva ela até Porongos, gaúcho. E traz o Bento de volta.'],
    ['sadi', 'A Lança do Lanceiro Negro vai junto. Pode deixar.']
  ];
  if (!scenesEnabled()) { pampaTalk(falas, pampaLancaGanha, 'Pegar a lança'); return; }
  const lanc = [[-250, -20], [250, -20]].map(([dx, dy], i) => ({ actor: 'lanc' + i, as: lanceiroArt(i + 1), x: x + dx, y: y + dy, dx: dx < 0 ? 1 : -1 }));
  let entregue = false;
  playSteps([...sceneWorld({ map: 'pampa', x, y: y + 50, props: layers => { layers.push({ y: y - 10, draw: () => drawPampaFeixe(x, y - 10) }); if (entregue) layers.push({ y: y + 91, draw: () => pampaLancaDesenho(x + 22, y + 16, -1.42, 120) }); } }), { actor: 'sadi', x, y: y + 90, dx: 1 }, { actor: 'lanceiro', x: x + 340, y: y + 90, dx: -1 }, ...lanc, { fade: 'in', time: .5 },
    { walk: 'lanceiro', to: { x: x + 130, y: y + 90 } }, { say: 'lanceiro', text: falas[0][1] }, { say: 'sadi', text: falas[1][1] },
    { do: () => { entregue = true; fxStars(x + 22, y - 90, 8); AudioEngine.caveAnvil?.(); AudioEngine.caveGem?.(); } }, { wait: .5 }, { say: 'lanceiro', text: falas[2][1] }, { say: 'lanceiro', text: falas[3][1] }, { say: 'lanceiro', text: falas[4][1] }, { say: 'sadi', text: falas[5][1] }, { fade: 'out', time: .6 }], 'pampa-lanca', pampaLancaGanha);
}
function drawPampaFeixe(x, y) { ctx.save(); ctx.translate(x, y); ctx.rotate(.08); ellipse(0, 6, 86, 12, 'rgba(14,16,8,.32)'); for (let k = 0; k < 8; k++) { const o = (k - 3.5) * 5; ctx.strokeStyle = k % 2 ? '#4a3218' : '#5a3e22'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-80, o); ctx.lineTo(70, o * .7); ctx.stroke(); ctx.fillStyle = '#c8ccd2'; ctx.beginPath(); ctx.moveTo(92, o * .7); ctx.lineTo(70, o * .7 - 4); ctx.lineTo(70, o * .7 + 4); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#b8302a'; ctx.fillRect(50, o * .7 - 1, 12, 8); } ctx.restore(); }

// ---------- A Lança do Lanceiro Negro ----------
CAVE_WEAPONS.push({ id: 'lanca', name: 'Lança do Lanceiro Negro', icon: '🔱', dmg: 62, griggs: true, ore: 'ferro', color: '236,226,206', lamina: 'sem', desc: 'A lança do sargento dos lanceiros: a mais comprida do jogo, numa estocada estreita. Firme na hora certa, derruba cavalo em carga.' });
function armaLanca(id = caveWeapon().id) { return id === 'lanca'; }
function pampaLancaDesenho(x, y, ang, comp = 200, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(ang); ctx.lineCap = 'round'; ctx.strokeStyle = '#2e1e10'; ctx.lineWidth = 6.5; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(comp, 0); ctx.stroke(); ctx.strokeStyle = '#7a5630'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(comp, 0); ctx.stroke();
  ctx.fillStyle = '#d4d8de'; ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(comp + 36, 0); ctx.lineTo(comp, -7); ctx.lineTo(comp - 8, 0); ctx.lineTo(comp, 7); ctx.closePath(); ctx.fill(); ctx.stroke();
  const t = Math.sin(frameClock * 12) * 4; ctx.fillStyle = '#c8302a'; ctx.beginPath(); ctx.moveTo(comp - 12, 2); ctx.lineTo(comp - 44, 14 + t); ctx.lineTo(comp - 34, 2); ctx.closePath(); ctx.fill(); ctx.restore();
}

let pampaLancaURL = null;
function pampaLancaIcone(size = 64) {
  if (!pampaLancaURL) { const c = document.createElement('canvas'); c.width = c.height = 128; const main = ctx, relogio = frameClock; ctx = c.getContext('2d'); try { frameClock = 0; pampaLancaDesenho(26, 102, -Math.PI / 4, 110); pampaLancaURL = c.toDataURL(); } finally { ctx = main; frameClock = relogio; } }
  return `<span class="mata-item-art" style="display:inline-flex;width:${size}px;height:${size}px"><img src="${pampaLancaURL}" width="${size}" height="${size}" alt=""></span>`;
}

// ---------- Coronel Moringue ----------
// Três fases, cada uma com uma regra só. A tela diz o que fazer (pampaObjetivo).
const MORINGUE = { fase3: .4, need: 3, vento: { intervalo: [8, 12], dura: 3.2, forca: 110 } };
function moringueVivo() { return mataNight?.beasts?.find(b => b.kind === 'moringue' && b.hp > 0) || null; }
function moringueArte() {
  if (ACTION_ART.moringue) return ACTION_ART.moringue; const im = ACTION_ART.mariath; if (!im?.naturalWidth) return null;
  const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const g = c.getContext('2d'); g.filter = MORINGUE_FILTRO; g.drawImage(im, 0, 0); g.filter = 'none';
  c.naturalWidth = c.width; ACTION_ART_CROPS.moringue = ACTION_ART_CROPS.mariath; return ACTION_ART.moringue = c;
}
function moringueFigura(x, y, dx = -1, alpha = 1) {
  const dir = dx < 0 ? -1 : 1, pose = historyPose(false, dir, 0, false, 0); ctx.save(); ctx.globalAlpha *= alpha; ellipse(x, y + 3, 30, 8, 'rgba(10,14,20,.35)');
  if (!(moringueArte() && actionSprite('moringue', pose, x, y, 164, dir < 0 && (pose >= 4 && pose < 8 || pose === 11)))) pampaFigura('moringue', x, y, dir, 1.2);
  ctx.restore();
}
function moringueChega(N, L) {
  N.chefe = true; keys.clear(); pampaLimpaCampo(N); const a = L.arena, p = worldOut; N.aliados = []; if (weaponOwned('lanca')) caveState().weapon = 'lanca';
  N.beasts.push(ilhaMob('moringue', { x: a.x + (p.x < a.x ? 460 : -460), y: a.y + a.ry * .35 }, Math.random, { boss: true, fase: 1, montado: true, need: MORINGUE.need, lacos: 0, state: 'ronda', t: 2.6, cool: 1, dx: p.x < a.x ? -1 : 1 }));
  AudioEngine.tropel?.(.12); AudioEngine.neigh?.(.07); AudioEngine.clarim?.(.06); save();
  chefeCena('moringue', { b: N.beasts[N.beasts.length - 1], noite: .15,
    falas: [['card', 'O campo está cheio de lanças fincadas, e o vento para de repente. Lá no fundo, amarrado num moirão, está o Bento. Na frente dele, um oficial de casaca escura, a cavalo.'],
      ['moringue', 'Francisco Pedro de Abreu, coronel do Império. O povo me chama de Moringue. Tu andaste bastante pra morrer no mesmo campo que eles, gaúcho.'], ['sadi', 'Vim buscar o Bento, coronel. E as contas de 1844.'], ['bento', 'Cuidado, gaúcho! Ele sempre ataca quando a gente acha que acabou.']],
    curtas: [['moringue', 'De volta ao meu campo? As lanças não te ensinaram nada.'], ['sadi', 'Me ensinaram onde ficar firme, coronel.']],
    regras: [['card', '<b>Fase 1 de 3: a carga</b><br>Fica firme com a lança e aperta <b>F</b> quando ele vier. Três vezes, e ele cai do cavalo.', 'Cerro de Porongos']] });
}
function moringueLaco(b, N) {
  if (b.fase === 1) {
    if (b.state === 'carga') { effect('Na carga, o laço arrebenta!', b.x, b.y - 240, '#ffb3a0', 17); return; }
    if (b.lacoImune > 0) { effect('Escapou do laço!', b.x, b.y - 240, '#ffb3a0', 16); return; }
    b.lacos++; b.lacoImune = 5; effect('Laçou! ' + b.lacos + '/' + MORINGUE.need, b.x, b.y - 240, '#ffe9a8', 19); b.state = 'ronda'; b.t = .8 + Math.random() * .6; b.cool = .3;
    if (b.lacos >= MORINGUE.need) moringueApeia(b, N);
    return;
  }
  if (b.stun > 0) return; const guarda = b.state === 'guarda'; if (pampaAtordoa(b, .9, guarda ? 'Quebrou a guarda!' : 'Laçou!') && guarda) b.state = 'chase';
}
// Fase 1: cada carga aguentada é uma marca, e o cavalo empina (uma janela pra bater).
function moringueLancada(b, N) {
  b.lacos++; effect('AGUENTOU! ' + Math.min(b.lacos, MORINGUE.need) + '/' + MORINGUE.need, b.x, b.y - 240, '#ffe27a', 26); fxPuffs(b.x, b.y - 20, 14, 130, '#a89878'); AudioEngine.thud?.(); AudioEngine.neigh?.(.07);
  b.carga = false; b.state = 'tonto'; b.t = 1.3; b.vx = -b.vx; b.vy = -b.vy;
  if (b.lacos >= MORINGUE.need) moringueApeia(b, N);
}
function moringueApeia(b, N) {
  pampaDerruba(b, N, 'Caiu do cavalo!'); b.fase = 2; b.state = 'chase'; b.stun = 2.4; b.cool = 2; N.vento = { t: 5, ativo: 0, dir: 1 }; keys.clear(); golpeTreme = Math.max(golpeTreme, .35);
  pampaTalk([[pampaFala('moringue'), 'Pois bem. Sabre contra lança, então.'], ['card', '<b>Fase 2 de 3: o duelo</b><br>Ele defende quase tudo. Bate <b>logo depois da estocada dele</b> ou <b>quando o minuano soprar</b>, que ele perde a guarda.', 'Cerro de Porongos']], null, 'Em guarda!');
}
function moringueNoCampo(b) { const a = pampaLayout().arena; if (!a) return; const dx = (b.x - a.x) / a.rx, dy = (b.y - a.y) / a.ry, k = Math.hypot(dx, dy); if (k > .96) { b.x = a.x + dx / k * a.rx * .96; b.y = a.y + dy / k * a.ry * .96; } }
function moringueEstocada(b, dx, dy, d, n) { b.state = 'windup'; b.t = b.t0 = n > 1 ? .42 : .55; b.vx = dx / d; b.vy = dy / d; b.combo = n - 1; b.dx = dx < 0 ? -1 : 1; AudioEngine.swoosh?.(.03); AudioEngine.clinkMetal?.(.03); }
function moringueTick(b, dt, p, N) {
  if (b.fase === 1) {
    if (b.state === 'tonto') { ilhaTick0(b, dt); b.carga = false; if (b.t <= 0) { b.state = 'curva'; b.t = .8; } return; }
    cavaleiroTick(b, dt, p, N); moringueNoCampo(b); return;
  }
  const B = CAVE_BEASTS.moringue, { dx, dy, d } = ilhaDist(b, p); ilhaTick0(b, dt); b.carga = false;
  if (b.fase === 2 && b.hp <= b.max * MORINGUE.fase3) { b.fase = 3; moringueMadrugada(b, N); return; }
  const tres = b.fase === 3, V = N.vento;
  // O minuano: ele firma o chapéu e perde a guarda (menos no meio de uma estocada).
  if (V?.ativo > 0 && !['windup', 'lunge'].includes(b.state)) { b.state = 'vento'; b.dx = dx < 0 ? -1 : 1; return; }
  if (b.state === 'vento') { b.state = 'guarda'; b.t = .6; return; }
  if (b.state === 'chase') {
    const want = d > 320 ? 1 : d < 150 ? -.6 : 0, side = b.side ??= 1; b.dx = dx < 0 ? -1 : 1;
    if (!mataStep(b, (dx / d * want - dy / d * side * .35) * B.speed * .72, (dy / d * want + dx / d * side * .35) * B.speed * .72, dt)) b.side = -side; moringueNoCampo(b);
    if (b.cool <= 0 && d < 430) moringueEstocada(b, dx, dy, d, tres ? 3 : 2);
    return;
  }
  if (b.state === 'windup') { if (b.t > .16) { b.vx = dx / d; b.vy = dy / d; b.dx = dx < 0 ? -1 : 1; } if (b.t <= 0) { b.state = 'lunge'; b.t = .3; AudioEngine.swoosh?.(.08); } return; }
  if (b.state === 'lunge') {
    if (!mataStep(b, b.vx * (tres ? 1150 : 1000), b.vy * (tres ? 1150 : 1000), dt)) b.t = 0; moringueNoCampo(b);
    if (b.attack <= 0 && Math.hypot(p.x - b.x, p.y - b.y) < B.r + 40) { mataHurt(B.dmg, b); b.attack = .55; effect('Estocada!', p.x, p.y - 150, '#ffd08a', 18); AudioEngine.clinkMetal?.(.06); }
    if (b.t <= 0) { if (b.combo > 0) { const q = ilhaDist(b, p), r = b.combo - 1; moringueEstocada(b, q.dx, q.dy, q.d, 2); b.combo = r; } else { b.state = 'rest'; b.t = tres ? .85 : 1.05; b.cool = .3; AudioEngine.bufo?.(.03); } }
    return;
  }
  if (b.state === 'rest') { if (b.t <= 0) { if (tres) { b.state = 'chase'; b.cool = .7; } else { b.state = 'guarda'; b.t = 1.5; } } return; }
  if (b.state === 'guarda') { b.dx = dx < 0 ? -1 : 1; if (b.t <= 0) { b.state = 'chase'; b.cool = .4; } return; }
  b.state = 'chase';
}
function moringueWarn(b) {
  if (b.fase === 1) { cavaleiroWarn(b); return; }
  if (b.state === 'windup') teleLane(b.x, b.y - 20, Math.atan2(b.vy, b.vx), 440, 70, teleK(b.t, b.t0), '255,90,60', .6);
  // A janela de bater: um anel dourado no chão, em volta dele.
  if (b.state === 'rest' || b.state === 'vento') { ctx.save(); ctx.strokeStyle = `rgba(255,226,120,${.55 + .35 * Math.sin(frameClock * 12)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(b.x, b.y, 74, 40, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
}
function drawMoringue(b) {
  if (b.montado) { drawCavaleiro(b, 'Moringue', 'moringue'); return; }
  const dir = (b.dx || 1) < 0 ? -1 : 1, stun = b.stun > 0, action = ['lunge', 'guarda'].includes(b.state) || b.state === 'windup' && b.t < .15, pose = historyPose(!!b.moving && !stun, dir, 0, action, b.frame);
  ellipse(b.x, b.y + 3, 30, 8, 'rgba(10,14,20,.35)');
  ctx.save(); ctx.globalAlpha = b.hurt > 0 ? .55 + .45 * Math.abs(Math.sin(frameClock * 40)) : 1; if (stun) { ctx.translate(b.x, b.y); ctx.rotate(.16 * dir); ctx.translate(-b.x, -b.y); }
  if (!(moringueArte() && actionSprite('moringue', pose, b.x, b.y, 164, dir < 0 && (pose >= 4 && pose < 8 || pose === 11)))) pampaFigura('moringue', b.x, b.y, dir, 1.2);
  ctx.restore();
  if (stun) for (let k = 0; k < 3; k++) { const a = frameClock * 4 + k * 2.1; ellipse(b.x + Math.cos(a) * 26, b.y - 182 + Math.sin(a) * 7, 3.2, 3.2, '#ffe27a'); }
  if (b.state === 'guarda') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(b.x + dir * 30, b.y - 90, 46, .45 + .2 * Math.sin(frameClock * 12), '220,235,255'); ctx.restore(); }
}
// A chaminha na ponta de uma lança acesa: pouca luz, pra não embaralhar a peleia.
function pampaChama(l, k = 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(l.x + 4, l.y - 176, 34, .34 * k + .06 * Math.sin(frameClock * 7 + l.x), '255,180,90'); ctx.restore(); const h = 13 + Math.sin(frameClock * 11 + l.y) * 3; ctx.save(); ctx.globalAlpha *= k; ellipse(l.x + 4, l.y - 180, 5, h * .7, '#ffb030'); ellipse(l.x + 4, l.y - 176, 3, h * .4, '#fff0a0'); ctx.restore(); }
function moringueMadrugada(b, N) {
  b.state = 'rest'; b.t = 1; b.stun = 0; keys.clear(); sparks.length = 0; const L = pampaLayout(), a = L.arena, p = worldOut, x = p.x, y = p.y;
  const perto = [...L.lancas].sort((q, r) => Math.hypot(q.x - x, q.y - y) - Math.hypot(r.x - x, r.y - y)).slice(0, 3);
  const fim = () => {
    N.madrugada = true; N.acesas = true; N.onda = 2.5; N.cargaCd = 3; N.vento = null; caveState().hp = caveMaxHp();
    N.aliados = [...perto.map((l, i) => pampaAliado('lanceiro', l.x, l.y, i)), pampaAliado('garibaldi', x - 120, y + 40), pampaAliado('anita', x + 120, y + 40), Object.assign(pampaAliado('neto', a.x - a.rx * .62, a.y - a.ry * .3), { parado: true }), Object.assign(pampaAliado('canabarro', a.x + a.rx * .62, a.y + a.ry * .3), { parado: true })];
    moringueOnda(N, a); floatNote('Os farrapos seguram a cavalaria: o Moringue é contigo.'); save();
  };
  const falas = [[pampaFala('moringue'), 'Cavalaria! Todos! Acabem com eles!'], ['lanceiro', 'Um dia mandaram a gente largar a lança. Hoje, não.'], ['sadi', 'Avante, farrapos!'], ['garibaldi', 'Desta vez ninguém fica sozinho no campo!'], ['anita', 'Tô contigo, bodegueiro!'], ['canabarro', 'Desta vez eu vim.'], [pampaFala('neto'), 'Primeira Brigada, em linha!']];
  if (!scenesEnabled()) { N.acesas = true; pampaTalk([['card', '<b>Fase 3 de 3: a madrugada</b><br>O céu começa a clarear, a corneta toca e a cavalaria inteira desce o cerro. Uma a uma, as lanças fincadas no campo se acendem.', 'Cerro de Porongos'], ...falas], fim, 'À carga!'); return; }
  const lado = b.x < x ? -1 : 1, lanc = perto.map((l, i) => ({ actor: 'lanc' + i, as: lanceiroArt(i), x: clamp(l.x, x - 480, x + 480), y: clamp(l.y, y - 240, y + 150), dx: l.x < x ? 1 : -1, alpha: 0 }));
  let chamas = 0;
  const sobe = { do: () => { for (let i = 0; i < perto.length; i++) { const q = scene.actors['lanc' + i]; if (q) { q.alpha = 1; fxPuffs(q.x, q.y - 40, 6, 70, '#c8dcf0'); } } AudioEngine.caveGhost?.(); AudioEngine.clarim?.(.05); } };
  playSteps([...sceneWorld({ map: 'pampa', x, y: y - 20, night: .34, props: layers => layers.push({ y: 9e9, draw: () => { chamas = Math.min(L.lancas.length, chamas + .18); L.lancas.slice(0, Math.floor(chamas)).forEach(l => pampaChama(l)); } }) }),
    { actor: 'sadi', x, y, dx: lado }, { actor: 'moringue', x: x + lado * 340, y: y - 20, dx: -lado, draw: (q, yy) => moringueFigura(q.x, yy, q.dx) }, ...lanc, { fade: 'in', time: .4 }, { say: 'moringue', text: falas[0][1] },
    { do: () => { AudioEngine.tropel?.(.12); AudioEngine.clarim?.(.06); N.acesas = true; AudioEngine.caveGem?.(); golpeTreme = Math.max(golpeTreme, .25); } }, { wait: 1.4 }, sobe, { wait: .7 }, { say: 'lanceiro', text: falas[1][1] }, { do: () => { AudioEngine.gritoFarrapo?.(); } }, { say: 'sadi', text: falas[2][1] },
    { actor: 'garibaldi', x: x - 420, y: y + 10, dx: 1, speed: 320 }, { actor: 'anita', x: x + 420, y: y + 10, dx: -1, speed: 320 }, { walk: ['garibaldi', 'anita'], to: [{ x: x - 110, y: y + 10 }, { x: x + 110, y: y + 10 }] }, { say: 'garibaldi', text: falas[3][1] }, { say: 'anita', text: falas[4][1] }, { say: 'canabarro', text: falas[5][1] }, { say: 'neto', text: falas[6][1] }, { fade: 'out', time: .4 }], 'pampa-madrugada', fim);
}
function moringueOnda(N, a) {
  const lado = Math.random() < .5 ? -1 : 1; if (N.beasts.filter(x => x.minion && x.hp > 0).length >= 2) return;
  N.beasts.push(ilhaMob('lanceiroMontado', { x: a.x + lado * a.rx * .85, y: a.y + (Math.random() - .5) * a.ry * .6 }, Math.random, { minion: true, montado: true, need: 1, hpMul: .7, state: 'ronda', t: 1.4 + Math.random(), dx: -lado, giro: lado }));
}
function moringueVencido(b, N) {
  const st = pampaState(); st.moringue = G.day; N.beasts.forEach(x => { if (x.minion) x.hp = 0; }); N.lancas = []; N.aliados = []; N.vento = null; N.madrugada = false; mataXP(300); keys.clear(); AudioEngine.caveCry?.('moringue', true); save();
  pampaFinal(b);
}

// ---------- O fim: as almas se despedem, o Bento livre e a República ----------
function pampaFim() {
  const st = pampaState(), P = pampaLayout(PAMPA_N.capitao).palanque; st.area = PAMPA_N.capitao; st.republica = G.day; st.bandeira = G.day; ilhaState().resgatado = G.day; mataNight = null; AudioEngine.sceneQuiet = false; Object.assign(worldOut, { map: 'pampa', x: P.x + P.w / 2, y: P.y + P.h + 120, dx: 0, dy: -1, walk: false }); caveState().hp = caveMaxHp(); save(); refreshHUD();
  pampaTalk([['card', '<b>🚩 A República Rio-Grandense</b><br>A bandeira verde, vermelha e amarela está no mastro do Campo dos Menezes. E hoje de noite tem fogo aceso na frente da bodega: é só voltar pra casa.', 'Campo dos Menezes'],
    ['card', '<b>📜 Como foi de verdade</b><br>Em 11 de setembro de 1836, um dia depois de vencer no Seival, o coronel Antônio de Sousa Neto proclamou a República Rio-Grandense no Campo dos Menezes. Durou até a paz de Ponche Verde, em 1845.<br><br>Porongos veio antes do fim: em 14 de novembro de 1844, os Lanceiros Negros foram atacados pelas tropas do Moringue. Mais de cem morreram. Aqui no jogo, a história deu a eles a revanche que a vida não deu.', 'Você sabia?']], null, 'Viva!');
}
function drawPampaMoirao(B) { ellipse(B.x + 24, B.y + 18, 18, 6, 'rgba(14,16,8,.3)'); rect(B.x + 18, B.y - 96, 12, 116, '#5a3e22', 2, '#2e1e10'); }
function drawPampaCorda(B) { ctx.save(); ctx.strokeStyle = '#c8b078'; ctx.lineWidth = 3; for (const y of [-56, -44]) { ctx.beginPath(); ctx.moveTo(B.x - 18, B.y + y); ctx.lineTo(B.x + 26, B.y + y - 2); ctx.stroke(); } ctx.restore(); }
function pampaFinal(b) {
  sparks.length = 0; AudioEngine.sceneQuiet = true;
  const L = pampaLayout(PAMPA_N.moringue), st = pampaState(), P3 = pampaLayout(PAMPA_N.capitao).palanque, cx = P3.x + P3.w / 2, py = P3.y + P3.h, deck = pampaPalanqueDeck(P3), M = pampaMastro(P3), falasA = [
    ['moringue', 'Ganhaste o campo, gaúcho… Mas o Império tem mais coronel que o pampa tem coxilha.'],
    ['lanceiro', 'Naquela madrugada, mandaram a gente dormir sem lança. Ninguém veio.'],
    ['lanceiro', 'Hoje veio um bodegueiro.'],
    ['sadi', 'Vim por vocês, companheiro. O meu vô dizia que a gente não deixa ninguém pra trás.'],
    ['canabarro', 'Desta vez eu vim. Devia ter vindo daquela. Vocês mereciam ter visto a paz, e não é uma lança acesa que paga isso.'],
    ['lanceiro', 'Não paga. Mas agora os meus podem descansar.'],
    ['lanceiro', 'Só uma coisa, gaúcho: conta pra quem vier depois. Que a gente lutou. E que a gente tinha nome.'],
    ['sadi', 'Lanceiros Negros. Ninguém mais esquece.'],
    ['bento', 'Solta essa corda, gaúcho. Faz tempo que eu não vejo o dia nascer livre.'],
    ['bento', 'Olha lá. Nasceu.']
  ], falasB = [
    ['neto', 'Bravos companheiros da Primeira Brigada de Cavalaria!'],
    ['neto', 'Ontem, no Seival, vencemos quem nos queria de joelhos. Hoje, neste campo, a nossa terra deixa de ser província de ninguém.'],
    ['neto', 'Em nome de quem peleou, e de quem caiu em Porongos: está proclamada a República Rio-Grandense!'],
    ['lanceiro', 'Agora sim.'],
    ['bento', 'Viva a República! E viva quem atravessou o pampa inteiro de lança na mão, sem esquecer a bodega.'],
    ['sadi', 'Bah, presidente… tá servido de uma canha? Hoje é por conta da casa.'],
    ['bento', 'Tô. Hoje de noite, na frente da tua bodega. Manda acender o fogo, que a gente vai todo mundo.']
  ];
  if (!scenesEnabled()) { pampaTalk([...falasA, ['card', 'As almas dos lanceiros sobem com a luz da manhã. A cerração abre, e todo mundo segue pro Campo dos Menezes, onde o palanque espera.', 'Pampa'], ...falasB], pampaFim, 'Viva!'); return; }
  const B = L.bento, cam = { x: B.x - 330, y: B.y + 70 }, lancas = [...L.lancas].sort((q, r) => Math.hypot(q.x - B.x, q.y - B.y) - Math.hypot(r.x - B.x, r.y - B.y));
  let some = 0, solto = false, apaga = 0, apagando = false, sol = 0, nascendo = false, hasteou = 0; const sumindo = [];
  const gente = [['garibaldi', -190, 90], ['anita', 190, 90], ['lanceiro', 320, 50], ['canabarro', 440, 100]], tropa = [[-350, 80], [-260, 130], [-440, 40], [-530, 100], [340, 150], [530, 60]];
  const props = layers => {
    if (scene?.pampaPalanque) {
      if (hasteou) { const k = clamp((performance.now() - hasteou) / 6500, 0, 1); scene.bandeiraK = k * k * (3 - 2 * k); }
      for (const a of sumindo) a.alpha = Math.max(0, (a.alpha ?? 1) - .006);
      return;
    }
    layers.push({ y: B.y + 16, draw: () => drawPampaMoirao(B) }); if (!solto) layers.push({ y: B.y + 20, draw: () => drawPampaCorda(B) });
    if (apagando) apaga = Math.min(lancas.length, apaga + .05); if (nascendo) sol = Math.min(1, sol + .0035);
    for (const a of sumindo) { a.alpha = Math.max(0, (a.alpha ?? 1) - .006); if (a.alpha > .02 && Math.random() < .2) fxStars(a.x + (Math.random() - .5) * 40, a.y - 40 - Math.random() * 90, 1); }
    layers.push({ y: 9e9, draw: () => { lancas.slice(Math.floor(apaga)).forEach(l => pampaChama(l)); rect(cam.x - 2000, cam.y - 1400, 4000, 2800, `rgba(${Math.round(16 + 230 * sol)},${Math.round(20 + 130 * sol)},${Math.round(58 + 30 * sol)},${.34 - .2 * sol})`); } });
  };
  playSteps([...sceneWorld({ map: 'pampa', x: cam.x, y: cam.y, props }),
    { actor: 'sadi', x: B.x - 560, y: B.y + 90, dx: 1 }, { actor: 'moringue', x: B.x - 330, y: B.y + 40, dx: -1, draw: (q, y) => moringueFigura(q.x, y, q.dx, 1 - some) }, { actor: 'bento', x: B.x, y: B.y + 18, dx: -1 }, { actor: 'lanceiro', x: B.x - 880, y: B.y + 40, dx: 1 }, { actor: 'lanc0', as: lanceiroArt(1), x: B.x - 960, y: B.y + 110, dx: 1 }, { actor: 'lanc1', as: lanceiroArt(2), x: B.x - 850, y: B.y + 150, dx: 1 }, { actor: 'canabarro', x: B.x - 1020, y: B.y + 60, dx: 1 }, { fade: 'in', time: .9 },
    { say: 'moringue', text: falasA[0][1] }, { do: () => { fxPuffs(B.x - 330, B.y - 40, 16, 120, '#c8d8e8'); AudioEngine.caveGhost?.(); let k = 0; const t = setInterval(() => { some = Math.min(1, some + .08); if (++k > 12) clearInterval(t); }, 70); } }, { wait: 1.1 }, { do: () => { delete scene.actors.moringue; AudioEngine.despedida?.(); apagando = true; } }, { wait: 1.4 },
    { walk: ['lanceiro', 'lanc0', 'lanc1', 'canabarro'], to: [{ x: B.x - 680, y: B.y + 60 }, { x: B.x - 590, y: B.y + 170 }, { x: B.x - 470, y: B.y + 170 }, { x: B.x - 800, y: B.y + 90 }] }, { say: 'lanceiro', text: falasA[1][1] }, { say: 'lanceiro', text: falasA[2][1] }, { say: 'sadi', text: falasA[3][1] }, { say: 'canabarro', text: falasA[4][1] }, { say: 'lanceiro', text: falasA[5][1] },
    { do: () => { sumindo.push(scene.actors.lanc0, scene.actors.lanc1); AudioEngine.despedida?.(); } }, { wait: 2.6 }, { say: 'lanceiro', text: falasA[6][1] }, { say: 'sadi', text: falasA[7][1] },
    { walk: 'sadi', to: { x: B.x - 90, y: B.y + 40 } }, { say: 'bento', text: falasA[8][1] }, { do: () => { solto = true; fxStars(B.x, B.y - 90, 6); AudioEngine.ropeHit?.(); nascendo = true; AudioEngine.heart?.(); } }, { wait: 2.2 }, scenePan(B.x - 120, B.y - 40, 60), { say: 'bento', text: falasA[9][1] }, { wait: 1.6 }, { fade: 'out', time: 1.2 },
    { do: () => { st.area = PAMPA_N.capitao; scene.actors = {}; scene.pampaPalanque = true; sumindo.length = 0; } }, ...sceneWorld({ map: 'pampa', x: cx, y: py + 20, props }),
    { actor: 'sadi', x: cx, y: py + 120, dx: 0, dy: -1 }, { actor: 'bento', x: cx - 92, y: deck, layerY: py + 1, dx: 1 }, { actor: 'neto', x: cx, y: deck, layerY: py + 1, dx: 1, draw: (q, y) => pampaFigura('neto', q.x, y, q.dx, 1) }, ...gente.map(([id, dx, dy]) => ({ actor: id, x: cx + dx, y: py + dy, dx: dx < 0 ? 1 : -1 })), ...tropa.map(([dx, dy], i) => ({ actor: ['ramiro', 'olmiro', 'arami', 'gaudencio', 'jayme', 'baitaca'][i], x: cx + dx, y: py + dy, dx: dx < 0 ? 1 : -1 })), { fade: 'in', time: 1 },
    { say: 'neto', text: falasB[0][1] }, { say: 'neto', text: falasB[1][1] }, { say: 'neto', text: falasB[2][1] },
    { do: () => { st.bandeira = G.day; scene.bandeiraK = 0; hasteou = performance.now(); AudioEngine.hinoFarrapo?.(); } }, scenePan(cx + P3.w * .2, M.topo + 200, 26), { wait: 7 },
    { do: () => { AudioEngine.vivas?.(); sceneShout('Viva a República!', cx, py - 300, '#ffe27a', 28); for (const [id, a] of Object.entries(scene.actors)) if (id !== 'sadi' && id !== 'neto' && id !== 'bento') a.hop = 9; fxStars(M.x + 60, M.topo + 40, 12); golpeTreme = Math.max(golpeTreme, .15); } }, { wait: 2.2 }, scenePan(cx, py + 20, 120), { wait: .8 },
    { do: () => { for (const a of Object.values(scene.actors)) a.hop = 0; } }, { say: 'lanceiro', text: falasB[3][1] }, { do: () => { sumindo.push(scene.actors.lanceiro); AudioEngine.despedida?.(); } }, { wait: 2.4 },
    { say: 'bento', text: falasB[4][1] }, { say: 'sadi', text: falasB[5][1] }, { say: 'bento', text: falasB[6][1] }, { fade: 'out', time: 1.6 }], 'pampa-final', pampaFim);
}

// ---------- A missão ----------
function pampaGoal() {
  const st = pampaState();
  if (!st.lanceiros) return 'Siga as taipas até o Banhado das Almas (trecho ' + PAMPA_N.lanceiros + ') e procure o Lanceiro Negro no acampamento';
  if (!st.sargento) return 'No Passo do Banhado (trecho ' + PAMPA_N.sargento + '), com os lanceiros, enfrente o Sargento Recolhedor e recupere as lanças';
  if (!st.boi) return 'Siga pelas Coxilhas do Seival até a Mangueira de Pedra (trecho ' + PAMPA_N.boi + '): o Boi Barroso fecha o caminho';
  if (!st.capitao) return 'No Campo dos Menezes (trecho ' + PAMPA_N.capitao + '), derrube o capitão de cavalaria: fica firme com a lança quando ele vier em carga';
  if (!st.moringue) return 'No Cerro de Porongos (trecho ' + PAMPA_N.moringue + '), enfrente o coronel Moringue e liberte o Bento';
  return 'A República está proclamada';
}
MISSIONS.push({ id: 'porongos', title: 'A batalha de Porongos', giver: 'garibaldi', side: true, where: 'O pampa, ao sul da Serra Gaúcha',
  direct: () => startMission(MISSIONS.find(x => x.id === 'porongos')),
  when: () => pampaAqui() && !scene && !modal && !worldTalkOpen() && !paused,
  goal: () => pampaGoal(), done: () => !!pampaState().republica, reward: { cash: 2000, xp: 800, rep: 10 }, outroBy: 'sadi',
  outro: ['O Bento tá livre, a bandeira tá no mastro e o pampa inteiro sabe o nome da bodega.', 'Agora é voltar pra casa: hoje tem fogo aceso na frente da bodega.'] });

// ---------- O fio de campanha do seu Zeferino ----------
const PAMPA_FIO = { max: 3, dmg: 4, ferro: [4, 8, 12], cost: [80, 160, 260] };
function pampaFio() { return G.pampa?.fio || 0; }
function pampaFioHTML() {
  const lv = pampaFio(); if (lv >= PAMPA_FIO.max) return forjaCard(bagIcon('ferro_imperial'), 'Fio de campanha · +' + lv, 'Afiado ao máximo.', '', '<button disabled>✔ Máximo</button>', 'owned');
  const needs = { ferro_imperial: PAMPA_FIO.ferro[lv] }, cost = PAMPA_FIO.cost[lv], ok = hasNeeds(needs) && hasCash(cost);
  return forjaCard(bagIcon('ferro_imperial'), 'Fio de campanha · +' + (lv + 1), '+' + PAMPA_FIO.dmg + ' de dano em todas as lâminas, com o ferro imperial que cai dos batedores e dos carabineiros.', reqChips(needs, cost), `<button class="primary" data-act="pampaAfia" ${ok ? '' : 'disabled'}>${ok ? 'Afiar' : 'Falta material'}</button>`);
}
function pampaAfia() {
  const lv = pampaFio(); if (lv >= PAMPA_FIO.max) return; const needs = { ferro_imperial: PAMPA_FIO.ferro[lv] }, cost = PAMPA_FIO.cost[lv]; if (!hasNeeds(needs) || !hasCash(cost)) return;
  takeNeeds(needs); spendCash(cost); pampaState().fio = lv + 1; AudioEngine.caveAnvil?.(); AudioEngine.coins?.(); save(); refreshHUD(); floatNote('🔥 Fio de campanha +' + (lv + 1) + ': ' + caveDmg() + ' de dano.'); pampaForja();
}

// ---------- Cada mob e cada ligação ----------
Object.assign(ILHA_MOBS, {
  boiBarroso: { start: 'mira', tick: boiTick, draw: drawBoiBarroso, warn: boiWarn, laco: boiLaco, xp: 0, onKill: boiVencido, cry(dead) { if (dead || !this.boiGrito || this.ctx.currentTime - this.boiGrito > 2.5) { this.boiGrito = this.ctx?.currentTime || 0; this.moo?.(dead ? .03 : .012, dead ? .6 : .85); } } },
  lanceiroMontado: { start: 'ronda', tick: cavaleiroTick, draw: b => drawCavaleiro(b, 'Lanceiro imperial', 'soldado'), warn: cavaleiroWarn, laco: cavaleiroLaco, xp: 12, cry(dead) { if (dead) this.caveVoice?.([210, 150, 90], .7, { formant: 650, q: 1.4, vol: .05, vib: 6, rate: 5 }); else this.neigh?.(.03); } },
  capitao: { start: 'ronda', tick: cavaleiroTick, draw: b => drawCavaleiro(b, 'Capitão', 'capitao'), warn: cavaleiroWarn, laco: cavaleiroLaco, xp: 0, onKill: capitaoVencido, cry(dead) { this.caveVoice?.(dead ? [200, 150, 100, 70] : [170, 230, 160], dead ? 1.2 : .4, { formant: 700, q: 1.4, vol: .05, vib: 6, rate: 6 }); } },
  sargento: { start: 'arrasta', tick: sargentoTick, draw: drawSargento, warn: sargentoWarn, xp: 0, onKill: sargentoVencido, cry(dead) { this.caveVoice?.(dead ? [150, 110, 80, 60] : [120, 150, 110], dead ? 1.3 : .5, { formant: 500, q: 1.3, vol: .06, vib: 4, rate: 5 }); } },
  moringue: { start: 'ronda', tick: moringueTick, draw: drawMoringue, warn: moringueWarn, laco: moringueLaco, xp: 0, onKill: moringueVencido, cry(dead) { this.caveVoice?.(dead ? [200, 150, 100, 70] : [170, 230, 160], dead ? 1.4 : .4, { formant: 700, q: 1.5, vol: .055, vib: 5, rate: 5 }); } }
});
pampaChefesTick = function (N, dt, p) {
  const L = pampaLayout(), st = pampaState();
  for (const b of N.beasts) if (b.lacoImune > 0) b.lacoImune -= dt;
  if (N.cargaCd > 0) N.cargaCd -= dt;
  // Lança firme: quem apertou F um instante antes de o cavalo chegar também aguenta a carga.
  if (N.firme > 0) { N.firme -= dt; if (armaLanca()) for (const b of N.beasts) if (b.hp > 0 && b.montado && b.carga && Math.hypot(b.x - p.x, b.y - p.y) < caveReach() + 10) { N.firme = 0; pampaFirmeAcerta(b, N); if (!mataNight) return; break; } }
  // Quem começa cada peleia: entrar no lugar do chefe.
  if (!N.chefe) {
    const noPalco = k => L.palco && Math.hypot((p.x - L.palco.x) / L.palco.rx, (p.y - L.palco.y) / L.palco.ry) < k;
    if (L.n === PAMPA_N.sargento && !st.sargento && noPalco(.8)) { if (st.lanceiros) { sargentoChega(N, L); return; } if (frameClock - (N.avisoSarg || 0) > 8) { N.avisoSarg = frameClock; floatNote('Um vulto grande arrasta um feixe de lanças. Melhor falar antes com os lanceiros, no acampamento lá atrás.'); } }
    if (L.n === PAMPA_N.boi && !st.boi && noPalco(.72)) { boiChega(N, L); return; }
    if (L.n === PAMPA_N.capitao && !st.capitao && noPalco(.72)) { capitaoChega(N, p); return; }
    if (L.n === PAMPA_N.moringue && !st.moringue && noPalco(.72)) { moringueChega(N, L); return; }
  }
  // As lanças arremessadas pelo Sargento: voam e ficam fincadas um tempo.
  for (const s of N.lancas) { s.t -= dt; if (s.t <= 0) continue; s.x += s.vx * dt; s.y += s.vy * dt; if (Math.hypot(p.x - s.x, p.y - 40 - s.y) < 40 && !worldDash) { s.t = 0; mataHurt(s.dmg, { x: s.x, y: s.y + 40 }); } }
  N.lancas = N.lancas.filter(s => s.t > 0);
  for (const c of N.soltos) { c.t -= dt; c.x += c.dx * 520 * dt; } N.soltos = N.soltos.filter(c => c.t > 0);
  pampaAliadosTick(N, dt, p); if (!mataNight) return;
  // O minuano.
  const V = N.vento, b = moringueVivo();
  if (V && b) {
    if (V.ativo > 0) {
      V.ativo -= dt; const f = V.dir * MORINGUE.vento.forca * dt; if (worldCanWalk(p.x + f, p.y)) p.x += f; b.x += f * .6; moringueNoCampo(b);
      if ((V.fala = (V.fala ?? 0) - dt) <= 0) { V.fala = 1.4; AudioEngine.rajada?.(.5); }
    } else if ((V.t -= dt) <= 0) { V.ativo = MORINGUE.vento.dura; V.dir = Math.random() < .5 ? -1 : 1; V.t = MORINGUE.vento.intervalo[0] + Math.random() * (MORINGUE.vento.intervalo[1] - MORINGUE.vento.intervalo[0]); effect('Minuano! Ele perdeu a guarda!', p.x, p.y - 200, '#e8f4ff', 22); AudioEngine.rajada?.(); }
  }
  // A cavalaria da madrugada.
  if (N.madrugada && b && L.arena && (N.onda -= dt) <= 0) { N.onda = 6 + Math.random() * 2; moringueOnda(N, L.arena); AudioEngine.tropel?.(.06); }
};
pampaChefesDraw = function (N) {
  for (const s of N.lancas) pampaLancaDesenho(s.x, s.y, s.a, 90);
  drawPampaLaco(N);
  for (const c of N.soltos) { ctx.save(); ctx.globalAlpha = Math.min(1, c.t * 1.2); expansionSprite('wild-horses-v1', c.coat * 4 + 1 + Math.floor(frameClock * 12) % 3, c.x, c.y + 4, 150, c.dx < 0); ctx.restore(); }
  const V = N.vento, p = worldOut;
  if (V?.ativo > 0) { ctx.save(); ctx.strokeStyle = 'rgba(236,244,255,.42)'; ctx.lineCap = 'round'; ctx.lineWidth = 2.4; for (let k = 0; k < 38; k++) { const span = 2400, x = p.x - 1200 + (k * 317 + frameClock * 1300 * V.dir) % span + (V.dir < 0 ? span : 0), y = p.y - 620 + (k * 149) % 1100, c = 70 + (k % 4) * 44; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + V.dir * c * .5, y - 5, x + V.dir * c, y); ctx.stroke(); } ctx.restore(); }
};
{
  // Quem está tonto fica parado (as outras peleias têm o mesmo cuidado).
  const beast = mataBeastTick; mataBeastTick = function (b, dt, p) { if (mataNight?.pampa && b.stun > 0) { b.stun -= dt; b.hurt = Math.max(0, b.hurt - dt); return; } return beast(b, dt, p); };
  // O golpe no pampa: em cima do cavalo o facão mal pega, o couro do boi inteiro aguenta, a guarda do Moringue segura
  // (com o vento nas costas, não) e a lança firme derruba quem vem em carga.
  const dano = (b, lanca) => {
    if (b.kind === 'boiBarroso') return b.state === 'cansado' ? 1 : b.state === 'bate' ? .6 : .15;
    if (b.montado) return b.kind === 'moringue' ? (b.state === 'tonto' ? (lanca ? .7 : .4) : lanca ? .2 : .08) : lanca ? .6 : .3;
    if (b.kind === 'moringue') { if (b.state === 'guarda') return 0; if (b.state === 'rest' || b.state === 'vento') return 1.2; return b.fase === 3 ? .5 : .25; }
    return 1;
  };
  const atk = mataAttack; mataAttack = function () {
    const N = mataNight; if (!N?.pampa || !pampaAqui()) return atk();
    const lanca = armaLanca(), reais = new Map(), GRANDE = 1e7, ef = effect;
    // Com a lança, quem vem em carga é o alvo: o Sadi vira pra ele sozinho.
    if (lanca) { N.firme = .32; const p = worldOut; let c = null, cd = caveReach() + 70; for (const b of N.beasts) { if (b.hp <= 0 || !b.montado || !b.carga) continue; const d = Math.hypot(b.x - p.x, b.y - p.y); if (d < cd) { cd = d; c = b; } } if (c) { p.dx = (c.x - p.x) / (cd || 1); p.dy = (c.y - p.y) / (cd || 1); } }
    for (const b of N.beasts) { if (b.hp <= 0) continue; if (ILHA_MOBS[b.kind]?.immune?.(b)) { reais.set(b, { hp: b.hp, imune: true }); b.hp = 0; } else if (b.boss || b.montado) { reais.set(b, { hp: b.hp, state: b.state, t: b.t }); b.hp = GRANDE; } }
    effect = function (t, x, y, ...r) { if (typeof t === 'string' && t[0] === '−' && [...reais.keys()].some(b => y === b.y - 80)) return; return ef(t, x, y, ...r); };
    try { return atk(); } finally {
      effect = ef;
      for (const [b, o] of reais) {
        if (o.imune) { b.hp = o.hp; continue; }
        const tirou = GRANDE - b.hp; if (tirou > GRANDE / 2) continue; b.hp = o.hp; if (tirou <= 0) continue; // (Se o chefe caiu nesse golpe, levou a guarda junto.)
        if (b.kind === 'moringue') { b.state = o.state; b.t = o.t; }
        if (lanca && b.montado && b.carga) { N.firme = 0; pampaFirmeAcerta(b, N); if (b.hp <= 0) continue; }
        const k = dano(b, lanca), feito = Math.round(tirou * k); b.hp -= feito;
        if (k === 0) { effect('Defendeu!', b.x, b.y - 190, '#e8f0ff', 18); AudioEngine.clinkMetal?.(.07); continue; }
        effect('−' + feito, b.x + (Math.random() - .5) * 20, b.y - 80, '#ffd2a0', 21);
        if (k < .5 && frameClock - (b.avisoCouro || 0) > 2.5) { b.avisoCouro = frameClock; effect(b.montado ? 'Em cima do cavalo, mal pega: laço (Q)!' : 'O couro aguenta: laço (Q)!', b.x, b.y - 230, '#e8e0c8', 15); }
        else if (k > 1) { effect('Bem na hora!', b.x, b.y - 210, '#ffe27a', 16); AudioEngine.clinkMetal?.(.04); }
        if (b.hp <= 0) { b.hp = 0; mataKill(b); }
      }
    }
  };
  // Gente a cavalo se mexe demais e desvia de tiro e de arpão. No resto, o tiro segue a regra do golpe.
  const shot = rangedHit; rangedHit = function (b, s) {
    if (!mataNight?.pampa) return shot(b, s);
    if (b.montado) { if (frameClock - (b.avisoTiro || 0) > 1.5) { b.avisoTiro = frameClock; effect('Desviou!', b.x, b.y - 210, '#e8e0c8', 17); } AudioEngine.swoosh?.(.03); return; }
    const k = dano(b, false); if (k === 1) return shot(b, s);
    if (k === 0) { effect('Defendeu!', b.x, b.y - 190, '#e8f0ff', 18); AudioEngine.note?.(1500, .06, 'square', .03); return; }
    return ilhaComDano(k, () => shot(b, s));
  };
  // A lança: comprida, estreita e um pouco mais lenta.
  const cd = caveCd; caveCd = function () { return armaLanca() ? cd() * 1.2 : cd(); };
  const reach = caveReach; caveReach = function () { return reach() + (armaLanca() ? 105 : 0); };
  const arco = mataArco; mataArco = function () { return armaLanca() ? .62 : arco(); };
  const fio = caveDmg; caveDmg = function () { return fio() + PAMPA_FIO.dmg * pampaFio(); };
  const rastro = drawGolpeRastro; drawGolpeRastro = function (s, p) {
    if (!armaLanca(s.artWeapon ?? caveWeapon().id)) return rastro(s, p);
    const k = golpeK(s), giro = s.n === 3, ang = giro ? s.ang + k * Math.PI * 2 : s.ang, ida = giro ? 1 : Math.sin(Math.min(1, k * 1.15) * Math.PI), comp = 90 + 150 * ida, ox = p.x, oy = p.y - 62;
    ctx.save(); ctx.strokeStyle = `rgba(255,248,226,${.5 * (1 - k)})`; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ox + Math.cos(ang) * 20, oy + Math.sin(ang) * 20); ctx.lineTo(ox + Math.cos(ang) * (comp + 36), oy + Math.sin(ang) * (comp + 36)); ctx.stroke(); ctx.restore();
    pampaLancaDesenho(ox, oy, ang, comp);
  };
  const icone = forgeWeaponIcon; forgeWeaponIcon = function (id) { return id === 'lanca' ? pampaLancaIcone() : icone(id); };
  const speaker = sceneSpeaker; sceneSpeaker = function (who) { return PAMPA_GENTE[who] ? { portrait: pampaRetrato(who, 104), name: PAMPA_GENTE[who] } : speaker(who); };
  const act = action; action = function (name, id) { if (name === 'pampaLaco') { pampaLaco(); return; } if (name === 'pampaAfia') { pampaAfia(); return; } return act(name, id); };
  document.addEventListener('keydown', e => { if (!pampaAqui() || e.repeat || (e.key !== 'q' && e.key !== 'Q') || modal || scene || ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return; e.preventDefault(); e.stopImmediatePropagation(); pampaLaco(); }, true);
  document.addEventListener('DOMContentLoaded', () => { const box = $('combatStack') || $('hudLayer'); box?.insertAdjacentHTML('beforeend', '<button id="pampaLacoButton" class="sling-button cave-lasso hidden" type="button" data-act="pampaLaco">Q · Laço</button>'); });
  const botao = mataUpdateButton; mataUpdateButton = function () { botao(); const btn = $('pampaLacoButton'); if (btn) { btn.classList.toggle('hidden', !(pampaAqui() && mataCombatOn() && !scene)); } };
  // No campo: o acampamento dos lanceiros, a lança na mão, o Bento amarrado, os aliados e o clarão das lanças.
  const M = WORLD_MAPS.pampa, draw = M.draw, spots = M.spots;
  M.spots = function () { return spots.call(this); };
  M.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers);
    const L = pampaLayout(), st = pampaState(), N = mataNight?.pampa ? mataNight : null;
    if (L.n === PAMPA_N.lanceiros && L.camp && !scene && !(mataNight?.chefe)) for (const g of pampaLanceirosCamp(L)) if (seen(g.x, g.y, 200)) layers.push({ y: g.y, draw: () => drawCampFolk(g.art, g.x, g.y, 1, g.x < L.camp.x ? 1 : -1) });
    if (L.bento && !st.moringue && seen(L.bento.x, L.bento.y, 300) && !scene) layers.push({ y: L.bento.y + 18, draw: () => { drawPampaMoirao(L.bento); drawCampFolk('bento', L.bento.x, L.bento.y + 18, 1, -1); drawPampaCorda(L.bento); } });
    if (scene) return;
    if (armaLanca() && !(N?.swing) && mataCombatOn() && !(typeof pampaSadiReady === 'function' && pampaSadiReady())) layers.push({ y: worldOut.y + 1, draw: () => pampaLancaDesenho(worldOut.x + (worldOut.dx >= 0 ? 22 : -22), worldOut.y - 74, -1.42, 120) });
    if (N) for (const a of N.aliados) if (seen(a.x, a.y, 220)) layers.push({ y: a.y, draw: () => drawPampaAliado(a) });
    if (L.arena && (N?.madrugada || N?.acesas)) { const c = N.beasts.find(q => q.kind === 'moringue' && q.hp > 0), sol = c ? clamp(1 - c.hp / (c.max * MORINGUE.fase3), 0, 1) : 1; for (const l of L.lancas) if (seen(l.x, l.y, 300)) layers.push({ y: 8.2e9, draw: () => pampaChama(l) }); layers.push({ y: 8.3e9, draw: () => rect(view.x, view.y, view.w, view.h, `rgba(${Math.round(30 + 215 * sol)},${Math.round(30 + 110 * sol)},${Math.round(70 + 10 * sol)},${.26 - .14 * sol})`) }); }
  };
}
